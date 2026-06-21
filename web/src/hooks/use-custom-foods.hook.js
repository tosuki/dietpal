import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = 'http://localhost:3001/api';

/**
 * Custom hook para gerenciar alimentos personalizados cadastrados na base global do DietaPal.
 * Utiliza TanStack Query para carregar alimentos, cachear a lista e gerenciar mutações de criação/exclusão.
 * 
 * @param {object} params
 * @param {Function} params.showDialog Função utilitária para exibição de modais dialog
 * @example
 * const { customFoods, isAddOpen, handleAddCustomFood } = useCustomFoods({ showDialog });
 */
export function useCustomFoods({ showDialog }) {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    calories: 100,
    protein: 10,
    carbs: 10,
    fat: 2
  });

  // Query: Obter alimentos e filtrar apenas os customizados
  const { data: customFoods = [], isLoading, isError } = useQuery({
    queryKey: ['foods'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/foods`);
      if (!response.ok) {
        throw new Error('Falha ao buscar catálogo de alimentos.');
      }
      const allFoods = await response.json();
      return allFoods.filter(food => food.isCustom);
    }
  });

  // Mutation: Criar alimento customizado
  const createFoodMutation = useMutation({
    mutationFn: async (foodData) => {
      const response = await fetch(`${API_URL}/foods/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foodData)
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao salvar alimento customizado');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] });
      showDialog({ message: 'Alimento customizado adicionado com sucesso!' });
      setIsAddOpen(false);
      setForm({
        name: '',
        calories: 100,
        protein: 10,
        carbs: 10,
        fat: 2
      });
    },
    onError: (error) => {
      showDialog({ message: error.message });
    }
  });

  // Mutation: Deletar alimento customizado
  const deleteFoodMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`${API_URL}/foods/custom/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Falha ao deletar alimento.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] });
      showDialog({ message: 'Alimento excluído com sucesso.' });
    },
    onError: () => {
      showDialog({ message: 'Erro ao excluir o alimento do catálogo.' });
    }
  });

  const handleAddCustomFood = () => {
    if (!form.name.trim()) {
      showDialog({ message: 'Nome do alimento é obrigatório' });
      return;
    }
    createFoodMutation.mutate({
      name: form.name,
      calories: Number(form.calories),
      protein: Number(form.protein),
      carbs: Number(form.carbs),
      fat: Number(form.fat)
    });
  };

  const handleDeleteCustomFood = (id) => {
    showDialog({
      type: 'confirm',
      message: 'Deseja realmente remover este alimento do catálogo?',
      onConfirm: () => {
        deleteFoodMutation.mutate(id);
      }
    });
  };

  return {
    customFoods,
    isLoading,
    isError,
    isAddOpen,
    setIsAddOpen,
    form,
    setForm,
    handleAddCustomFood,
    handleDeleteCustomFood
  };
}
