import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import PublicSidebar from '../components/PublicSidebar';

const PublicLayout: React.FC = () => {
  // Define se a tela é mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  // Define se a sidebar está aberta
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  // Listener de resize para atualizar estado do layout
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile); // Sidebar aberta por padrão em desktop
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Evita rolagem no mobile quando a sidebar estiver aberta
  useEffect(() => {
    document.body.style.overflow = sidebarOpen && isMobile ? 'hidden' : 'auto';
  }, [sidebarOpen, isMobile]);

  // Fecha sidebar ao clicar fora no mobile
  const handleMainClick = () => {
    if (sidebarOpen && isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Sidebar fixa à esquerda */}
      <PublicSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay no mobile para fechar a sidebar ao clicar fora */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 998,
          }}
        />
      )}

      {/* Conteúdo principal */}
      <div
        onClick={handleMainClick}
        style={{
          flex: 1,
          marginLeft: !isMobile ? '250px' : '0', // Margem igual à largura da sidebar
          transition: 'margin-left 0.3s ease',
        }}
      >
        {/* Cabeçalho fixo no topo */}
        <header
          style={{
            height: '64px',
            backgroundColor: 'rgba(13, 71, 161, 0.9)', // Azul claro
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            padding: '0 1rem',
            position: 'fixed',
            top: 0,
            left: !isMobile ? '250px' : '0',
            right: 0,
            zIndex: 1000,
            justifyContent: 'space-between',
            transition: 'left 0.3s ease',
          }}
        >
          {/* Botão do menu hamburguer no mobile */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '1.5rem',
                cursor: 'pointer',
              }}
            >
              ☰
            </button>
          )}
          <strong>Serviços Monitoramento</strong>
        </header>

        {/* Área principal de conteúdo */}
        <main
          style={{
            padding: '80px 1rem 2rem', // Espaço para o header fixo
            backgroundColor: '#f4f6f8',
            minHeight: '100vh',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              background: '#fff',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            {/* Onde as rotas públicas autenticadas serão renderizadas */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PublicLayout;