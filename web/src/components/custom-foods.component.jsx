import { useCustomFoods } from '../hooks/use-custom-foods.hook.js';

/**
 * Componente visual para exibição e gerenciamento de alimentos personalizados cadastrados na base global do usuário.
 * Consome a lógica de negócio do custom hook `useCustomFoods`.
 * 
 * @param {object} props
 * @param {Function} props.showDialog
 * @example
 * <CustomFoods showDialog={showDialog} />
 */
export default function CustomFoods({ showDialog }) {
  const {
    customFoods,
    isLoading,
    isError,
    isAddOpen,
    setIsAddOpen,
    form,
    setForm,
    handleAddCustomFood,
    handleDeleteCustomFood
  } = useCustomFoods({ showDialog });

  if (isLoading) {
    return (
      <div className="empty-state">
        <h3 style={{ animation: 'pulse 1.5s infinite' }}>Carregando seus alimentos personalizados...</h3>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="empty-state">
        <h3 style={{ color: '#ef4444' }}>Erro de Conexão</h3>
        <p style={{ marginTop: '8px' }}>Não foi possível carregar os alimentos do servidor.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="catalog-actions-bar">
        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Meus Alimentos Personalizados</h2>
        <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
          Novo Alimento Customizado
        </button>
      </div>

      <div className="foods-list-container">
        {customFoods.length === 0 ? (
          <div className="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="48" height="48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3>Nenhum alimento personalizado</h3>
            <p style={{ marginTop: '8px' }}>Você ainda não cadastrou alimentos customizados no banco.</p>
          </div>
        ) : (
          <table className="foods-table">
            <thead>
              <tr>
                <th>Nome do Alimento</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Calorias (100g)</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Proteína (100g)</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Carboidrato (100g)</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Gordura (100g)</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {customFoods.map((food) => (
                <tr key={food.id}>
                  <td style={{ fontWeight: 600 }}>{food.name}</td>
                  <td style={{ textAlign: 'right', color: 'var(--color-cal)', fontWeight: 600 }}>
                    {food.calories} kcal
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--color-prot)' }}>{food.protein}g</td>
                  <td style={{ textAlign: 'right', color: 'var(--color-carb)' }}>{food.carbs}g</td>
                  <td style={{ textAlign: 'right', color: 'var(--color-fat)' }}>{food.fat}g</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="action-icon-btn delete"
                      onClick={() => handleDeleteCustomFood(food.id)}
                      title="Excluir do Catálogo"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: Adicionar Alimento Customizado */}
      {isAddOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Cadastrar Alimento Personalizado</h3>
              <button className="action-icon-btn" onClick={() => setIsAddOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nome do Alimento</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Whey Blend Chocolate 30g"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Calorias (por 100g ou porção de referência)</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.calories}
                  onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })}
                />
              </div>

              <div className="macro-inline-flex">
                <div className="form-group">
                  <label>Proteína (g)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.protein}
                    onChange={(e) => setForm({ ...form, protein: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Carboidrato (g)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.carbs}
                    onChange={(e) => setForm({ ...form, carbs: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Gordura (g)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.fat}
                    onChange={(e) => setForm({ ...form, fat: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleAddCustomFood}>Cadastrar no Banco</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
