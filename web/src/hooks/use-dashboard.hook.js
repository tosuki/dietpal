import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = 'http://localhost:3001/api';

const enrichDiet = (diet) => {
  if (!diet) return null;
  return {
    ...diet,
    meals: (diet.meals || []).map(meal => ({
      ...meal,
      foods: (meal.foods || []).map(food => {
        const amount = food.amount || 100;
        return {
          ...food,
          baseCalories: food.baseCalories !== undefined ? food.baseCalories : (food.calories / amount) * 100,
          baseProtein: food.baseProtein !== undefined ? food.baseProtein : (food.protein / amount) * 100,
          baseCarbs: food.baseCarbs !== undefined ? food.baseCarbs : (food.carbs / amount) * 100,
          baseFat: food.baseFat !== undefined ? food.baseFat : (food.fat / amount) * 100,
        };
      })
    }))
  };
};

/**
 * Custom hook para gerenciar o Dashboard principal da aplicação DietaPal.
 * Utiliza TanStack Query para carregar a dieta ativa, realizar autosave assíncrono (mutations),
 * atualizar o cache local otimisticamente nas edições de inputs e lidar com busca autocomplete de alimentos.
 * 
 * @param {object} params
 * @param {Function} params.showDialog Função utilitária para exibição de modais dialog
 * @example
 * const { activeDiet, isSaving, totalCalories, handleAddMeal } = useDashboard({ showDialog });
 */
export function useDashboard({ showDialog }) {
  const queryClient = useQueryClient();

  const [isEditingTargets, setIsEditingTargets] = useState(false);
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [selectedMealIndex, setSelectedMealIndex] = useState(null);

  const [targetForm, setTargetForm] = useState({
    name: '',
    description: '',
    targetCalories: 2000,
    targetProtein: 150,
    targetCarbs: 200,
    targetFat: 70
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodAmount, setFoodAmount] = useState(100);

  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customFoodForm, setCustomFoodForm] = useState({
    name: '',
    calories: 100,
    protein: 10,
    carbs: 10,
    fat: 2
  });

  // Query: Obter a dieta ativa enriquecida
  const { data: activeDiet, isLoading, isError } = useQuery({
    queryKey: ['activeDiet'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/diets/active`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Falha ao obter dieta ativa');
      const data = await response.json();
      return enrichDiet(data);
    },
    retry: false
  });

  // Sincronizar formulário de metas quando a dieta ativa é carregada ou alterada
  useEffect(() => {
    if (activeDiet) {
      setTargetForm({
        name: activeDiet.name,
        description: activeDiet.description || '',
        targetCalories: activeDiet.targetCalories,
        targetProtein: activeDiet.targetProtein,
        targetCarbs: activeDiet.targetCarbs,
        targetFat: activeDiet.targetFat
      });
    }
  }, [activeDiet]);

  // Query: Busca autocomplete de alimentos (TACO + custom)
  const { data: searchResults = [] } = useQuery({
    queryKey: ['foods', 'search', searchQuery],
    queryFn: async () => {
      if (searchQuery.trim().length === 0) return [];
      const response = await fetch(`${API_URL}/foods?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Erro ao pesquisar alimentos');
      return response.json();
    },
    enabled: searchQuery.trim().length > 0
  });

  // Mutation: Autosave da Dieta
  const saveMutation = useMutation({
    mutationFn: async (dietToSave) => {
      const response = await fetch(`${API_URL}/diets/${dietToSave.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: dietToSave.name,
          description: dietToSave.description,
          targetCalories: Number(dietToSave.targetCalories),
          targetProtein: Number(dietToSave.targetProtein),
          targetCarbs: Number(dietToSave.targetCarbs),
          targetFat: Number(dietToSave.targetFat),
          isActive: dietToSave.isActive,
          meals: dietToSave.meals.map((meal, idx) => ({
            name: meal.name,
            order: idx,
            foods: meal.foods.map(f => ({
              foodId: f.foodId || null,
              name: f.name,
              calories: Number(f.calories),
              protein: Number(f.protein),
              carbs: Number(f.carbs),
              fat: Number(f.fat),
              amount: Number(f.amount)
            }))
          }))
        })
      });
      if (!response.ok) throw new Error('Erro ao salvar dieta no servidor');
      return response.json();
    },
    onSuccess: (updated) => {
      // Atualizar cache local
      queryClient.setQueryData(['activeDiet'], enrichDiet(updated));
      queryClient.invalidateQueries({ queryKey: ['diets'] });
    },
    onError: () => {
      showDialog({ message: 'Falha ao salvar as alterações da dieta automaticamente.' });
    }
  });

  // Mutation: Adicionar Alimento Customizado na hora
  const createCustomMutation = useMutation({
    mutationFn: async (customData) => {
      const response = await fetch(`${API_URL}/foods/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao cadastrar alimento');
      }
      return response.json();
    },
    onSuccess: (createdFood) => {
      selectFood(createdFood);
      setIsCreatingCustom(false);
      
      setCustomFoodForm({
        name: '',
        calories: 100,
        protein: 10,
        carbs: 10,
        fat: 2
      });
      showDialog({ message: 'Alimento customizado salvo no catálogo e selecionado!' });
    },
    onError: (err) => {
      showDialog({ message: err.message });
    }
  });

  if (!activeDiet) {
    return { activeDiet: null, isLoading, isError };
  }

  // Cálculos de consumo total atual da dieta
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  activeDiet.meals.forEach(meal => {
    meal.foods.forEach(food => {
      totalCalories += food.calories || 0;
      totalProtein += food.protein || 0;
      totalCarbs += food.carbs || 0;
      totalFat += food.fat || 0;
    });
  });

  totalCalories = Math.round(totalCalories);
  totalProtein = Math.round(totalProtein * 10) / 10;
  totalCarbs = Math.round(totalCarbs * 10) / 10;
  totalFat = Math.round(totalFat * 10) / 10;

  const pctCal = Math.min(100, Math.round((totalCalories / activeDiet.targetCalories) * 100)) || 0;
  const pctProt = Math.min(100, Math.round((totalProtein / activeDiet.targetProtein) * 100)) || 0;
  const pctCarb = Math.min(100, Math.round((totalCarbs / activeDiet.targetCarbs) * 100)) || 0;
  const pctFat = Math.min(100, Math.round((totalFat / activeDiet.targetFat) * 100)) || 0;

  // Helpers para atualizar cache otimista local
  const updateActiveDietCache = (newDiet) => {
    queryClient.setQueryData(['activeDiet'], newDiet);
  };

  const handleSaveTargets = () => {
    const updated = {
      ...activeDiet,
      name: targetForm.name,
      description: targetForm.description,
      targetCalories: Number(targetForm.targetCalories),
      targetProtein: Number(targetForm.targetProtein),
      targetCarbs: Number(targetForm.targetCarbs),
      targetFat: Number(targetForm.targetFat)
    };
    updateActiveDietCache(updated);
    setIsEditingTargets(false);
    saveMutation.mutate(updated);
  };

  const handleAddMeal = () => {
    const updatedMeals = [
      ...activeDiet.meals,
      {
        name: `Refeição ${activeDiet.meals.length + 1}`,
        order: activeDiet.meals.length,
        foods: []
      }
    ];
    const updatedDiet = { ...activeDiet, meals: updatedMeals };
    updateActiveDietCache(updatedDiet);
    saveMutation.mutate(updatedDiet);
  };

  const handleRenameMeal = (index, newName) => {
    const updatedMeals = [...activeDiet.meals];
    updatedMeals[index] = { ...updatedMeals[index], name: newName };
    updateActiveDietCache({ ...activeDiet, meals: updatedMeals });
  };

  const handleRenameMealBlur = (index) => {
    const updatedMeals = [...activeDiet.meals];
    if (!updatedMeals[index].name.trim()) {
      updatedMeals[index] = { ...updatedMeals[index], name: `Refeição ${index + 1}` };
    }
    const updatedDiet = { ...activeDiet, meals: updatedMeals };
    updateActiveDietCache(updatedDiet);
    saveMutation.mutate(updatedDiet);
  };

  const handleDeleteMeal = (index) => {
    showDialog({
      type: 'confirm',
      message: 'Deseja realmente excluir esta refeição inteira?',
      onConfirm: () => {
        const updatedMeals = activeDiet.meals.filter((_, idx) => idx !== index);
        updatedMeals.forEach((meal, idx) => {
          meal.order = idx;
        });
        const updatedDiet = { ...activeDiet, meals: updatedMeals };
        updateActiveDietCache(updatedDiet);
        saveMutation.mutate(updatedDiet);
      }
    });
  };

  const handleDuplicateMeal = (index) => {
    const mealToCopy = activeDiet.meals[index];
    const duplicated = {
      ...mealToCopy,
      name: `${mealToCopy.name} (Cópia)`,
      order: activeDiet.meals.length,
      foods: mealToCopy.foods.map(f => ({ ...f, id: undefined }))
    };
    const updatedDiet = {
      ...activeDiet,
      meals: [...activeDiet.meals, duplicated]
    };
    updateActiveDietCache(updatedDiet);
    saveMutation.mutate(updatedDiet);
  };

  const handleUpdateAmountChange = (mealIndex, foodIndex, value) => {
    const normalizedValue = value.replace(',', '.');
    if (normalizedValue !== '' && !/^\d*\.?\d*$/.test(normalizedValue)) {
      return;
    }
    
    const updatedMeals = [...activeDiet.meals];
    const foodItem = { ...updatedMeals[mealIndex].foods[foodIndex] };
    
    foodItem.tempAmount = normalizedValue;
    const amountVal = Number(normalizedValue);
    
    if (!isNaN(amountVal) && amountVal > 0) {
      foodItem.amount = amountVal;
      const baseCal = foodItem.baseCalories !== undefined ? foodItem.baseCalories : (foodItem.calories / (foodItem.amount || 100)) * 100;
      const baseProt = foodItem.baseProtein !== undefined ? foodItem.baseProtein : (foodItem.protein / (foodItem.amount || 100)) * 100;
      const baseCarb = foodItem.baseCarbs !== undefined ? foodItem.baseCarbs : (foodItem.carbs / (foodItem.amount || 100)) * 100;
      const baseFat = foodItem.baseFat !== undefined ? foodItem.baseFat : (foodItem.fat / (foodItem.amount || 100)) * 100;
      
      const factor = amountVal / 100;
      foodItem.calories = Math.round(baseCal * factor * 10) / 10;
      foodItem.protein = Math.round(baseProt * factor * 100) / 100;
      foodItem.carbs = Math.round(baseCarb * factor * 100) / 100;
      foodItem.fat = Math.round(baseFat * factor * 100) / 100;
    }
    
    updatedMeals[mealIndex].foods[foodIndex] = foodItem;
    updateActiveDietCache({ ...activeDiet, meals: updatedMeals });
  };

  const handleUpdateAmountBlur = (mealIndex, foodIndex) => {
    const updatedMeals = [...activeDiet.meals];
    const foodItem = { ...updatedMeals[mealIndex].foods[foodIndex] };
    
    delete foodItem.tempAmount;
    
    if (foodItem.amount <= 0 || isNaN(foodItem.amount)) {
      foodItem.amount = 100;
      const baseCal = foodItem.baseCalories !== undefined ? foodItem.baseCalories : 100;
      const baseProt = foodItem.baseProtein !== undefined ? foodItem.baseProtein : 0;
      const baseCarb = foodItem.baseCarbs !== undefined ? foodItem.baseCarbs : 0;
      const baseFat = foodItem.baseFat !== undefined ? foodItem.baseFat : 0;
      
      foodItem.calories = Math.round(baseCal * 10) / 10;
      foodItem.protein = Math.round(baseProt * 100) / 100;
      foodItem.carbs = Math.round(baseCarb * 100) / 100;
      foodItem.fat = Math.round(baseFat * 100) / 100;
    }
    
    updatedMeals[mealIndex].foods[foodIndex] = foodItem;
    const updatedDiet = { ...activeDiet, meals: updatedMeals };
    updateActiveDietCache(updatedDiet);
    saveMutation.mutate(updatedDiet);
  };

  const handleRemoveFood = (mealIndex, foodIndex) => {
    const updatedMeals = [...activeDiet.meals];
    updatedMeals[mealIndex].foods = updatedMeals[mealIndex].foods.filter((_, idx) => idx !== foodIndex);
    const updatedDiet = { ...activeDiet, meals: updatedMeals };
    updateActiveDietCache(updatedDiet);
    saveMutation.mutate(updatedDiet);
  };

  const openAddFoodModal = (mealIndex) => {
    setSelectedMealIndex(mealIndex);
    setSearchQuery('');
    setSelectedFood(null);
    setFoodAmount(100);
    setIsCreatingCustom(false);
    setIsAddFoodOpen(true);
  };

  const selectFood = (food) => {
    setSelectedFood(food);
    setSearchQuery(food.name);
  };

  const handleAddFoodToMeal = () => {
    if (!selectedFood || selectedMealIndex === null) return;

    const factor = foodAmount / 100;
    const newFoodItem = {
      foodId: selectedFood.id,
      name: selectedFood.name,
      amount: Number(foodAmount),
      calories: Math.round(selectedFood.calories * factor * 10) / 10,
      protein: Math.round(selectedFood.protein * factor * 100) / 100,
      carbs: Math.round(selectedFood.carbs * factor * 100) / 100,
      fat: Math.round(selectedFood.fat * factor * 100) / 100,
      baseCalories: selectedFood.calories,
      baseProtein: selectedFood.protein,
      baseCarbs: selectedFood.carbs,
      baseFat: selectedFood.fat,
    };

    const updatedMeals = [...activeDiet.meals];
    updatedMeals[selectedMealIndex].foods.push(newFoodItem);

    const updatedDiet = { ...activeDiet, meals: updatedMeals };
    updateActiveDietCache(updatedDiet);
    setIsAddFoodOpen(false);
    saveMutation.mutate(updatedDiet);
  };

  const handleCreateCustomFood = () => {
    createCustomMutation.mutate({
      name: customFoodForm.name,
      calories: Number(customFoodForm.calories),
      protein: Number(customFoodForm.protein),
      carbs: Number(customFoodForm.carbs),
      fat: Number(customFoodForm.fat),
    });
  };

  return {
    activeDiet,
    isLoading,
    isError,
    isEditingTargets,
    setIsEditingTargets,
    isAddFoodOpen,
    setIsAddFoodOpen,
    targetForm,
    setTargetForm,
    searchQuery,
    setSearchQuery,
    searchResults,
    selectedFood,
    foodAmount,
    setFoodAmount,
    isCreatingCustom,
    setIsCreatingCustom,
    customFoodForm,
    setCustomFoodForm,
    isSaving: saveMutation.isPending,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    pctCal,
    pctProt,
    pctCarb,
    pctFat,
    handleSaveTargets,
    handleAddMeal,
    handleRenameMeal,
    handleRenameMealBlur,
    handleDeleteMeal,
    handleDuplicateMeal,
    handleUpdateAmountChange,
    handleUpdateAmountBlur,
    handleRemoveFood,
    openAddFoodModal,
    selectFood,
    handleAddFoodToMeal,
    handleCreateCustomFood
  };
}
