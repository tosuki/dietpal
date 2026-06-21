import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDietApp } from './hooks/use-diet-app.hook.js';
import Dashboard from './components/dashboard.component.jsx';
import DietCatalog from './components/diet-catalog.component.jsx';
import CustomFoods from './components/custom-foods.component.jsx';
import './App.css';

// Instanciar o QueryClient para gerenciamento global de cache e estados assíncronos
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Evita re-fetch automático ao trocar de aba no navegador
      staleTime: 1000 * 60 * 5, // Cache é considerado fresco por 5 minutos
    },
  },
});

function DietAppContent() {
  const {
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    dialog,
    setDialog,
    showDialog
  } = useDietApp();

  return (
    <div className="app-container">
      {/* Sidebar de Navegação */}
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <button
          className="sidebar-toggle-btn"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          title={isSidebarCollapsed ? "Expandir" : "Recolher"}
        >
          {isSidebarCollapsed ? '→' : '←'}
        </button>

        <div className="logo-container">
          <div className="logo-icon">DP</div>
          {!isSidebarCollapsed && <span className="logo-text">DietaPal</span>}
        </div>

        <nav>
          <ul className="menu-list">
            <li>
              <div
                className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {!isSidebarCollapsed && <span>Dieta Atual</span>}
              </div>
            </li>
            <li>
              <div
                className={`menu-item ${activeTab === 'catalog' ? 'active' : ''}`}
                onClick={() => setActiveTab('catalog')}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {!isSidebarCollapsed && <span>Catálogo</span>}
              </div>
            </li>
            <li>
              <div
                className={`menu-item ${activeTab === 'custom-foods' ? 'active' : ''}`}
                onClick={() => setActiveTab('custom-foods')}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {!isSidebarCollapsed && <span>Alimentos</span>}
              </div>
            </li>
          </ul>
        </nav>

        {!isSidebarCollapsed && (
          <div className="sidebar-footer">
            <p>DietaPal v1.0.0</p>
          </div>
        )}
      </aside>

      {/* Wrapper de Conteúdo Central */}
      <main className={`content-wrapper ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        {activeTab === 'dashboard' && (
          <Dashboard showDialog={showDialog} />
        )}
        
        {activeTab === 'catalog' && (
          <DietCatalog showDialog={showDialog} />
        )}

        {activeTab === 'custom-foods' && (
          <CustomFoods showDialog={showDialog} />
        )}
      </main>

      {/* Modal Compartilhado de Aviso / Confirmação */}
      {dialog && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '420px' }}>
            <div className="modal-header">
              <h3>{dialog.type === 'confirm' ? 'Confirmação' : 'Aviso'}</h3>
            </div>
            <div className="modal-body" style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '15px', color: 'var(--text-main)', lineHeight: '1.5' }}>
                {dialog.message}
              </p>
            </div>
            <div className="modal-footer" style={{ background: '#f8fafc', padding: '16px 24px' }}>
              {dialog.type === 'confirm' && (
                <button className="btn btn-secondary" onClick={() => {
                  dialog.onCancel();
                  setDialog(null);
                }}>
                  Cancelar
                </button>
              )}
              <button className="btn btn-primary" onClick={() => {
                dialog.onConfirm();
                setDialog(null);
              }}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DietAppContent />
    </QueryClientProvider>
  );
}

export default App;
