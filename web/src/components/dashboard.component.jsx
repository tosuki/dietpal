import { useDashboard } from '../hooks/use-dashboard.hook.js';

/**
 * Componente visual de Dashboard para exibir as calorias do dia, as metas nutricionais
 * e a timeline de refeições/alimentos da dieta ativa.
 * Consome a lógica de negócio do custom hook `useDashboard`.
 * 
 * @param {object} props
 * @param {Function} props.showDialog
 * @example
 * <Dashboard showDialog={showDialog} />
 */
export default function Dashboard({ showDialog }) {
  const {
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
    isSaving,
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
  } = useDashboard({ showDialog });

  if (isLoading) {
    return (
      <div className="empty-state">
        <h3 style={{ animation: 'pulse 1.5s infinite' }}>Carregando dados da dieta ativa...</h3>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="empty-state">
        <h3 style={{ color: '#ef4444' }}>Erro de Conexão com o Servidor</h3>
        <p style={{ marginTop: '8px' }}>Não foi possível se comunicar com o backend do DietaPal.</p>
      </div>
    );
  }

  if (!activeDiet) {
    return (
      <div className="empty-state">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="48" height="48">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <h3>Nenhuma dieta ativa</h3>
        <p style={{ marginTop: '8px', marginBottom: '20px' }}>Você precisa ativar ou criar uma dieta no catálogo para começar.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header com Nome da Dieta e status de autosave */}
      <div className="header">
        <div className="header-title">
          <div className="align-center">
            <h1>{activeDiet.name}</h1>
            <span className="active-badge">Dieta Ativa</span>
            {isSaving && (
              <span className="saving-badge" style={{ marginLeft: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                Salvando...
              </span>
            )}
          </div>
          <p>{activeDiet.description || 'Nenhuma descrição inserida.'}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setIsEditingTargets(true)}>
          Ajustar Metas e Nome
        </button>
      </div>

      {/* Resumo de Macros e Calorias (Cards) */}
      <div className="macro-grid">
        {/* Calorias */}
        <div className="macro-card calories">
          <div className="macro-header">
            <span className="macro-title">Calorias</span>
          </div>
          <div className="macro-values">
            <span className="macro-current">{totalCalories}</span>
            <span className="macro-target">/ {activeDiet.targetCalories} kcal</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${pctCal}%` }}></div>
          </div>
          <div className="progress-pct">{pctCal}% consumido</div>
        </div>

        {/* Proteínas */}
        <div className="macro-card protein">
          <div className="macro-header">
            <span className="macro-title">Proteínas</span>
          </div>
          <div className="macro-values">
            <span className="macro-current">{totalProtein}g</span>
            <span className="macro-target">/ {activeDiet.targetProtein}g</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${pctProt}%` }}></div>
          </div>
          <div className="progress-pct">{pctProt}% consumido</div>
        </div>

        {/* Carboidratos */}
        <div className="macro-card carbs">
          <div className="macro-header">
            <span className="macro-title">Carboidratos</span>
          </div>
          <div className="macro-values">
            <span className="macro-current">{totalCarbs}g</span>
            <span className="macro-target">/ {activeDiet.targetCarbs}g</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${pctCarb}%` }}></div>
          </div>
          <div className="progress-pct">{pctCarb}% consumido</div>
        </div>

        {/* Gorduras */}
        <div className="macro-card fat">
          <div className="macro-header">
            <span className="macro-title">Gorduras</span>
          </div>
          <div className="macro-values">
            <span className="macro-current">{totalFat}g</span>
            <span className="macro-target">/ {activeDiet.targetFat}g</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${pctFat}%` }}></div>
          </div>
          <div className="progress-pct">{pctFat}% consumido</div>
        </div>
      </div>

      {/* Lista de Refeições */}
      <div className="meals-section-header">
        <h2>Estrutura de Refeições</h2>
        <button className="btn btn-primary" onClick={handleAddMeal}>
          Adicionar Refeição
        </button>
      </div>

      <div className="meals-list">
        {activeDiet.meals.length === 0 ? (
          <div className="empty-state" style={{ background: 'var(--card-bg)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <p>Nenhuma refeição adicionada. Adicione sua primeira refeição para estruturar sua dieta!</p>
          </div>
        ) : (
          activeDiet.meals.map((meal, mealIdx) => {
            let mealCal = 0;
            let mealProt = 0;
            let mealCarb = 0;
            let mealFat = 0;

            meal.foods.forEach(f => {
              mealCal += f.calories || 0;
              mealProt += f.protein || 0;
              mealCarb += f.carbs || 0;
              mealFat += f.fat || 0;
            });

            return (
              <div key={mealIdx} className="meal-card">
                <div className="meal-card-header">
                  <div className="meal-title-group">
                    <input
                      type="text"
                      className="meal-name-input"
                      value={meal.name}
                      onChange={(e) => handleRenameMeal(mealIdx, e.target.value)}
                      onBlur={() => handleRenameMealBlur(mealIdx)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.target.blur();
                        }
                      }}
                    />
                  </div>
                  <div className="meal-actions">
                    <button className="btn btn-secondary" onClick={() => openAddFoodModal(mealIdx)}>
                      Add Alimento
                    </button>
                    <button
                      className="action-icon-btn"
                      title="Duplicar Refeição"
                      onClick={() => handleDuplicateMeal(mealIdx)}
                    >
                      Duplicar
                    </button>
                    <button
                      className="action-icon-btn delete"
                      title="Excluir Refeição"
                      onClick={() => handleDeleteMeal(mealIdx)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>

                {meal.foods.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '16px 0', textAlign: 'center' }}>
                    Nenhum alimento nesta refeição. Clique em "Add Alimento" para montar.
                  </p>
                ) : (
                  <>
                    <table className="meal-foods-table">
                      <thead>
                        <tr>
                          <th>Alimento</th>
                          <th style={{ width: '120px', textAlign: 'center' }}>Qtd (g)</th>
                          <th style={{ width: '90px', textAlign: 'right' }}>Kcal</th>
                          <th style={{ width: '80px', textAlign: 'right' }}>Prot</th>
                          <th style={{ width: '80px', textAlign: 'right' }}>Carb</th>
                          <th style={{ width: '80px', textAlign: 'right' }}>Gord</th>
                          <th style={{ width: '50px', textAlign: 'center' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {meal.foods.map((food, foodIdx) => (
                          <tr key={foodIdx}>
                            <td style={{ fontWeight: 600 }}>{food.name}</td>
                            <td style={{ textAlign: 'center' }}>
                              <input
                                type="text"
                                className="food-amount-input"
                                value={food.tempAmount !== undefined ? food.tempAmount : food.amount}
                                onChange={(e) => handleUpdateAmountChange(mealIdx, foodIdx, e.target.value)}
                                onBlur={() => handleUpdateAmountBlur(mealIdx, foodIdx)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.target.blur();
                                  }
                                }}
                              />
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-cal)' }}>
                              {Math.round(food.calories)} kcal
                            </td>
                            <td style={{ textAlign: 'right', color: 'var(--color-prot)' }}>
                              {food.protein}g
                            </td>
                            <td style={{ textAlign: 'right', color: 'var(--color-carb)' }}>
                              {food.carbs}g
                            </td>
                            <td style={{ textAlign: 'right', color: 'var(--color-fat)' }}>
                              {food.fat}g
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                className="action-icon-btn delete"
                                onClick={() => handleRemoveFood(mealIdx, foodIdx)}
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="meal-summary-bar">
                      <span className="meal-summary-label">Total Refeição</span>
                      <div className="meal-summary-macros">
                        <div className="meal-summary-macro-item cal">
                          {Math.round(mealCal)}<span>kcal</span>
                        </div>
                        <div className="meal-summary-macro-item prot">
                          {Math.round(mealProt * 10) / 10}g<span>Prot</span>
                        </div>
                        <div className="meal-summary-macro-item carb">
                          {Math.round(mealCarb * 10) / 10}g<span>Carb</span>
                        </div>
                        <div className="meal-summary-macro-item fat">
                          {Math.round(mealFat * 10) / 10}g<span>Gord</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Ajustar Metas e Nome */}
      {isEditingTargets && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Ajustar Metas e Detalhes da Dieta</h3>
              <button className="action-icon-btn" onClick={() => setIsEditingTargets(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nome da Dieta</label>
                <input
                  type="text"
                  className="form-control"
                  value={targetForm.name}
                  onChange={(e) => setTargetForm({ ...targetForm, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <input
                  type="text"
                  className="form-control"
                  value={targetForm.description}
                  onChange={(e) => setTargetForm({ ...targetForm, description: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label>Meta de Calorias (kcal)</label>
                <input
                  type="number"
                  className="form-control"
                  value={targetForm.targetCalories}
                  onChange={(e) => setTargetForm({ ...targetForm, targetCalories: Number(e.target.value) })}
                />
              </div>

              <div className="macro-inline-flex">
                <div className="form-group">
                  <label>Meta de Proteínas (g)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={targetForm.targetProtein}
                    onChange={(e) => setTargetForm({ ...targetForm, targetProtein: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Meta de Carboidratos (g)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={targetForm.targetCarbs}
                    onChange={(e) => setTargetForm({ ...targetForm, targetCarbs: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Meta de Gorduras (g)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={targetForm.targetFat}
                    onChange={(e) => setTargetForm({ ...targetForm, targetFat: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsEditingTargets(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveTargets}>Confirmar metas</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Alimento */}
      {isAddFoodOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Adicionar Alimento</h3>
              <button className="action-icon-btn" onClick={() => setIsAddFoodOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {!isCreatingCustom ? (
                <>
                  <div className="form-group">
                    <label>Pesquisar Alimento (Padrão TACO + Customizados)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: Arroz, Peito de Frango, Banana..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        selectFood(null);
                      }}
                    />
                    
                    {/* Lista autocomplete */}
                    {searchResults.length > 0 && (
                      <div className="food-search-results">
                        {searchResults.map((food) => (
                          <div
                            key={food.id}
                            className="search-result-item"
                            onClick={() => selectFood(food)}
                          >
                            <div className="search-result-info">
                              <span className="search-result-name">{food.name}</span>
                              <span className="search-result-macros">
                                {food.calories}kcal | P: {food.protein}g | C: {food.carbs}g | G: {food.fat}g (por 100g)
                              </span>
                            </div>
                            <span className={`search-result-badge ${food.isCustom ? 'custom' : 'taco'}`}>
                              {food.isCustom ? 'Custom' : 'TACO'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedFood && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      marginBottom: '20px'
                    }}>
                      <p style={{ fontWeight: 600, marginBottom: '8px' }}>Alimento Selecionado: {selectedFood.name}</p>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Quantidade a adicionar (em gramas)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={foodAmount}
                          onChange={(e) => setFoodAmount(Number(e.target.value))}
                        />
                      </div>
                      
                      <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '13px' }}>
                        <span>
                          {Math.round(selectedFood.calories * (foodAmount / 100))} kcal
                        </span>
                        <span>
                          {Math.round(selectedFood.protein * (foodAmount / 100) * 10) / 10}g P
                        </span>
                        <span>
                          {Math.round(selectedFood.carbs * (foodAmount / 100) * 10) / 10}g C
                        </span>
                        <span>
                          {Math.round(selectedFood.fat * (foodAmount / 100) * 10) / 10}g G
                        </span>
                      </div>
                    </div>
                  )}

                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Não encontrou o que queria? </span>
                    <button
                      className="btn-secondary"
                      style={{ border: 'none', background: 'transparent', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                      onClick={() => setIsCreatingCustom(true)}
                    >
                      Cadastrar alimento customizado permanente
                    </button>
                  </div>
                </>
              ) : (
                /* Formulário de Criação de Alimento Customizado */
                <div>
                  <h4 style={{ marginBottom: '16px' }}>Cadastrar Alimento Customizado</h4>
                  
                  <div className="form-group">
                    <label>Nome do Alimento</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: Iogurte Whey Chocolate"
                      value={customFoodForm.name}
                      onChange={(e) => setCustomFoodForm({ ...customFoodForm, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Calorias (por 100g)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={customFoodForm.calories}
                      onChange={(e) => setCustomFoodForm({ ...customFoodForm, calories: Number(e.target.value) })}
                    />
                  </div>

                  <div className="macro-inline-flex">
                    <div className="form-group">
                      <label>Proteína (g/100g)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={customFoodForm.protein}
                        onChange={(e) => setCustomFoodForm({ ...customFoodForm, protein: Number(e.target.value) })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Carboidrato (g/100g)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={customFoodForm.carbs}
                        onChange={(e) => setCustomFoodForm({ ...customFoodForm, carbs: Number(e.target.value) })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Gordura (g/100g)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={customFoodForm.fat}
                        onChange={(e) => setCustomFoodForm({ ...customFoodForm, fat: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button className="btn btn-secondary" onClick={() => setIsCreatingCustom(false)}>Voltar</button>
                    <button className="btn btn-primary" onClick={handleCreateCustomFood}>Salvar no Catálogo</button>
                  </div>
                </div>
              )}
            </div>
            
            {!isCreatingCustom && (
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setIsAddFoodOpen(false)}>Cancelar</button>
                <button
                  className="btn btn-primary"
                  onClick={handleAddFoodToMeal}
                  disabled={!selectedFood}
                >
                  Adicionar à Refeição
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
