import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = 'http://localhost:3001/api';

/**
 * Custom hook para gerenciar o catálogo de dietas da aplicação DietaPal.
 * Utiliza TanStack Query para queries/mutations de CRUD, ativação e importação/exportação JSON.
 * 
 * @param {object} params
 * @param {Function} params.showDialog Função utilitária para exibição de modais dialog
 * @example
 * const { diets, isCreateOpen, handleActivateDiet } = useDietCatalog({ showDialog });
 */
export function useDietCatalog({ showDialog }) {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [initialMeals, setInitialMeals] = useState(['Café da Manhã', 'Almoço', 'Café da Tarde', 'Jantar']);
  const [newMealName, setNewMealName] = useState('');
  
  const [newDietForm, setNewDietForm] = useState({
    name: '',
    description: '',
    targetCalories: 2000,
    targetProtein: 150,
    targetCarbs: 200,
    targetFat: 70,
    isActive: true
  });

  // Query: Obter catálogo de dietas
  const { data: diets = [], isLoading, isError } = useQuery({
    queryKey: ['diets'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/diets`);
      if (!response.ok) {
        throw new Error('Falha ao buscar catálogo de dietas.');
      }
      return response.json();
    }
  });

  // Query: Dieta ativa atual (útil para verificar exclusão da dieta ativa)
  const { data: activeDiet } = useQuery({
    queryKey: ['activeDiet'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/diets/active`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Erro ao buscar dieta ativa');
      return response.json();
    },
    retry: false
  });

  // Mutation: Ativar Dieta
  const activateMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`${API_URL}/diets/${id}/activate`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Erro ao ativar dieta');
      return response.json();
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['diets'] });
      queryClient.invalidateQueries({ queryKey: ['activeDiet'] });
      showDialog({ message: `Dieta "${updated.name}" ativada!` });
    },
    onError: () => {
      showDialog({ message: 'Erro ao ativar a dieta.' });
    }
  });

  // Mutation: Excluir Dieta
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`${API_URL}/diets/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erro ao excluir dieta');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diets'] });
      queryClient.invalidateQueries({ queryKey: ['activeDiet'] });
      showDialog({ message: 'Dieta excluída com sucesso.' });
    },
    onError: () => {
      showDialog({ message: 'Erro ao excluir a dieta.' });
    }
  });

  // Mutation: Criar Dieta (do zero ou importada)
  const createMutation = useMutation({
    mutationFn: async (dietData) => {
      const response = await fetch(`${API_URL}/diets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dietData)
      });
      if (!response.ok) throw new Error('Erro ao salvar dieta no servidor');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diets'] });
      queryClient.invalidateQueries({ queryKey: ['activeDiet'] });
      setIsCreateOpen(false);
      
      setNewDietForm({
        name: '',
        description: '',
        targetCalories: 2000,
        targetProtein: 150,
        targetCarbs: 200,
        targetFat: 70,
        isActive: true
      });
    },
    onError: (error) => {
      showDialog({ message: error.message || 'Erro ao salvar dieta.' });
    }
  });

  const handleActivateDiet = (id) => {
    activateMutation.mutate(id);
  };

  const handleDeleteDiet = (id) => {
    showDialog({
      type: 'confirm',
      message: 'Deseja realmente excluir esta dieta permanentemente?',
      onConfirm: () => {
        deleteMutation.mutate(id);
      }
    });
  };

  const handleCreateDiet = () => {
    if (!newDietForm.name.trim()) {
      showDialog({ message: 'Nome da dieta é obrigatório' });
      return;
    }
    createMutation.mutate({
      name: newDietForm.name,
      description: newDietForm.description,
      targetCalories: Number(newDietForm.targetCalories),
      targetProtein: Number(newDietForm.targetProtein),
      targetCarbs: Number(newDietForm.targetCarbs),
      targetFat: Number(newDietForm.targetFat),
      isActive: newDietForm.isActive,
      meals: initialMeals.map((name, idx) => ({
        name,
        order: idx,
        foods: []
      }))
    }, {
      onSuccess: () => {
        showDialog({ message: 'Nova dieta criada e configurada com refeições base!' });
      }
    });
  };

  const handleExportDiet = async (diet) => {
    try {
      const response = await fetch(`${API_URL}/diets/${diet.id}`);
      if (!response.ok) throw new Error('Falha ao buscar detalhes da dieta');
      const detail = await response.json();
      
      const cleaned = {
        name: detail.name,
        description: detail.description,
        targetCalories: detail.targetCalories,
        targetProtein: detail.targetProtein,
        targetCarbs: detail.targetCarbs,
        targetFat: detail.targetFat,
        isActive: detail.isActive,
        meals: detail.meals.map(meal => ({
          name: meal.name,
          order: meal.order,
          foods: meal.foods.map(f => ({
            foodId: f.foodId,
            name: f.name,
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbs,
            fat: f.fat,
            amount: f.amount
          }))
        }))
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cleaned, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${detail.name.toLowerCase().replace(/\s+/g, '_')}_dieta.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error(err);
      showDialog({ message: 'Erro ao exportar dieta.' });
    }
  };

  const handleImportFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        
        if (!imported.name) {
          throw new Error("Arquivo JSON inválido: campo 'name' da dieta é obrigatório.");
        }

        createMutation.mutate({
          name: `${imported.name} (Importada)`,
          description: imported.description || 'Importada de arquivo JSON',
          targetCalories: Number(imported.targetCalories) || 2000,
          targetProtein: Number(imported.targetProtein) || 150,
          targetCarbs: Number(imported.targetCarbs) || 200,
          targetFat: Number(imported.targetFat) || 70,
          isActive: true,
          meals: (imported.meals || []).map((meal, idx) => ({
            name: meal.name || `Refeição ${idx + 1}`,
            order: Number(meal.order) || idx,
            foods: (meal.foods || []).map(f => ({
              foodId: f.foodId || null,
              name: f.name || 'Alimento',
              calories: Number(f.calories) || 0,
              protein: Number(f.protein) || 0,
              carbs: Number(f.carbs) || 0,
              fat: Number(f.fat) || 0,
              amount: Number(f.amount) || 100
            }))
          }))
        }, {
          onSuccess: () => {
            showDialog({ message: 'Dieta importada com sucesso!' });
          }
        });
      } catch (err) {
        showDialog({ message: `Falha na importação: ${err.message}` });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return {
    diets,
    isLoading,
    isError,
    activeDiet,
    isCreateOpen,
    setIsCreateOpen,
    initialMeals,
    setInitialMeals,
    newMealName,
    setNewMealName,
    newDietForm,
    setNewDietForm,
    handleActivateDiet,
    handleDeleteDiet,
    handleCreateDiet,
    handleExportDiet,
    handleImportFileChange
  };
}
