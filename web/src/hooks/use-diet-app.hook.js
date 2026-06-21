import { useState } from 'react';

/**
 * Custom hook para gerenciar o estado global da interface web do DietaPal.
 * Controla navegação entre abas, status recolhido da sidebar e o sistema customizado de diálogos.
 * 
 * @example
 * const { activeTab, setActiveTab, showDialog, dialog } = useDietApp();
 */
export function useDietApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dialog, setDialog] = useState(null);

  /**
   * Apresenta um diálogo modal customizado (aviso ou confirmação) e retorna uma Promise.
   * 
   * @param {object} config Configurações do diálogo
   * @param {'alert'|'confirm'} [config.type='alert'] Tipo de modal
   * @param {string} config.message Mensagem de texto
   * @param {Function} [config.onConfirm] Callback de confirmação
   * @param {Function} [config.onCancel] Callback de cancelamento
   * @returns {Promise<boolean>} Resolve true se confirmado, false se cancelado
   */
  const showDialog = (config) => {
    return new Promise((resolve) => {
      setDialog({
        type: config.type || 'alert',
        message: config.message || '',
        onConfirm: () => {
          if (config.onConfirm) config.onConfirm();
          resolve(true);
        },
        onCancel: () => {
          if (config.onCancel) config.onCancel();
          resolve(false);
        }
      });
    });
  };

  return {
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    dialog,
    setDialog,
    showDialog
  };
}
