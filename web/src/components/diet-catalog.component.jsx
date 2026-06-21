import { useDietCatalog } from '../hooks/use-diet-catalog.hook.js';

/**
 * Componente visual do Catálogo de Dietas.
 * Permite listar todas as dietas, ativar, excluir, criar novas dietas e importar/exportar via JSON.
 * Consome a lógica de negócio do custom hook `useDietCatalog`.
 * 
 * @param {object} props
 * @param {Function} props.showDialog
 * @example
 * <DietCatalog showDialog={showDialog} />
 */
export default function DietCatalog({ showDialog }) {
  const {
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
  } = useDietCatalog({ showDialog });

  if (isLoading) {
    return (
      <div className="empty-state">
        <h3 style={{ animation: 'pulse 1.5s infinite' }}>Carregando catálogo de dietas...</h3>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="empty-state">
        <h3 style={{ color: '#ef4444' }}>Erro de Conexão</h3>
        <p style={{ marginTop: '8px' }}>Não foi possível carregar as dietas do servidor.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Barra de Ações Superiores */}
      <div className="catalog-actions-bar">
        <div className="left-actions">
          <button className="btn btn-primary" onClick={() => {
            setInitialMeals(['Café da Manhã', 'Almoço', 'Café da Tarde', 'Jantar']);
            setNewMealName('');
            setIsCreateOpen(true);
          }}>
            Criar Dieta do Zero
          </button>
          
          <label className="btn btn-secondary cursor-pointer">
            Importar Dieta JSON
            <input
              type="file"
              accept=".json"
              className="hidden-file-input"
              onChange={handleImportFileChange}
            />
          </label>
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Total de Dietas: <strong>{diets.length}</strong>
        </div>
      </div>

      {/* Grid de Cards de Dieta */}
      {diets.length === 0 ? (
        <div className="empty-state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="48" height="48">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3>Catálogo vazio</h3>
          <p style={{ marginTop: '8px' }}>Crie uma nova dieta ou importe um arquivo JSON para começar.</p>
        </div>
      ) : (
        <div className="catalog-grid">
          {diets.map((diet) => {
            const isActive = activeDiet && activeDiet.id === diet.id;
            return (
              <div key={diet.id} className="catalog-card" style={{
                borderColor: isActive ? 'rgba(16, 185, 129, 0.4)' : 'var(--card-border)',
                background: isActive ? 'rgba(16, 185, 129, 0.02)' : 'var(--card-bg)'
              }}>
                <div className="catalog-card-header">
                  <div>
                    <h4 className="catalog-card-title">{diet.name}</h4>
                    {isActive && <span className="active-badge" style={{ marginTop: '6px', display: 'inline-block' }}>Ativa</span>}
                  </div>
                </div>
                <p className="catalog-card-desc">{diet.description || 'Sem descrição.'}</p>
                
                <div className="catalog-card-stats">
                  <div className="catalog-stat-item">
                    <span className="catalog-stat-label">Kcal</span>
                    <span className="catalog-stat-value cal">{diet.targetCalories}</span>
                  </div>
                  <div className="catalog-stat-item">
                    <span className="catalog-stat-label">P</span>
                    <span className="catalog-stat-value prot">{diet.targetProtein}g</span>
                  </div>
                  <div className="catalog-stat-item">
                    <span className="catalog-stat-label">C</span>
                    <span className="catalog-stat-value carb">{diet.targetCarbs}g</span>
                  </div>
                  <div className="catalog-stat-item">
                    <span className="catalog-stat-label">G</span>
                    <span className="catalog-stat-value fat">{diet.targetFat}g</span>
                  </div>
                </div>

                <div className="catalog-card-actions">
                  {!isActive && (
                    <button className="btn btn-secondary" style={{ flexGrow: 1 }} onClick={() => handleActivateDiet(diet.id)}>
                      Ativar
                    </button>
                  )}
                  <button className="btn btn-secondary" onClick={() => handleExportDiet(diet)} title="Exportar para JSON">
                    Exportar
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDeleteDiet(diet.id)} title="Excluir Dieta">
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Criar Nova Dieta */}
      {isCreateOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Criar Dieta</h3>
              <button className="action-icon-btn" onClick={() => setIsCreateOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nome da Dieta</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Dieta para Ganho de Massa"
                  value={newDietForm.name}
                  onChange={(e) => setNewDietForm({ ...newDietForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Foco em carboidratos complexos e proteínas magras"
                  value={newDietForm.description}
                  onChange={(e) => setNewDietForm({ ...newDietForm, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Meta Calórica (kcal)</label>
                <input
                  type="number"
                  className="form-control"
                  value={newDietForm.targetCalories}
                  onChange={(e) => setNewDietForm({ ...newDietForm, targetCalories: Number(e.target.value) })}
                />
              </div>

              <div className="macro-inline-flex">
                <div className="form-group">
                  <label>Proteína (g)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newDietForm.targetProtein}
                    onChange={(e) => setNewDietForm({ ...newDietForm, targetProtein: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Carboidrato (g)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newDietForm.targetCarbs}
                    onChange={(e) => setNewDietForm({ ...newDietForm, targetCarbs: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Gordura (g)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newDietForm.targetFat}
                    onChange={(e) => setNewDietForm({ ...newDietForm, targetFat: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label>Refeições Iniciais da Dieta</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {initialMeals.map((meal, index) => (
                    <div key={index} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      fontWeight: 600,
                      gap: '8px'
                    }}>
                      <span>{meal}</span>
                      <button
                        type="button"
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                        onClick={() => setInitialMeals(initialMeals.filter((_, idx) => idx !== index))}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Adicionar outra refeição (ex: Ceia)"
                    value={newMealName}
                    onChange={(e) => setNewMealName(e.target.value)}
                    style={{ flexGrow: 1 }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      if (newMealName.trim() && !initialMeals.includes(newMealName.trim())) {
                        setInitialMeals([...initialMeals, newMealName.trim()]);
                        setNewMealName('');
                      }
                    }}
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              <div className="align-center" style={{ marginTop: '16px' }}>
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={newDietForm.isActive}
                  onChange={(e) => setNewDietForm({ ...newDietForm, isActive: e.target.checked })}
                />
                <label htmlFor="activeCheck" style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                  Marcar esta dieta como Ativa imediatamente
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleCreateDiet}>Criar Dieta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
