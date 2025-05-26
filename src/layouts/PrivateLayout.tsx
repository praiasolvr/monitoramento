// src/layouts/PrivateLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const PrivateLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen && isMobile ? 'hidden' : 'auto';
  }, [sidebarOpen, isMobile]);

  const handleMainClick = () => {
    if (sidebarOpen && isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay blur */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="overlay-blur"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 998,
          }}
        />
      )}

      {/* Conteúdo */}
      <div
        onClick={handleMainClick}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: !isMobile ? '250px' : '0',
          transition: 'margin-left 0.4s ease-in-out',
        }}
      >
        {/* Header fixo */}
        <header
          style={{
            position: 'fixed',
            top: 0,
            left: !isMobile ? '250px' : '0',
            width: !isMobile ? 'calc(100% - 250px)' : '100%',
            backgroundColor: '#0b1d40',
            color: '#fff',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1000,
            transition: 'left 0.3s ease, width 0.3s ease',
          }}
        >
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                fontSize: '2rem',
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                transition: 'transform 0.4s ease',
                transform: sidebarOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              {sidebarOpen ? '✖️' : '☰'}
            </button>
          )}
          <span style={{ fontWeight: 'bold' }}>Painel Administrativo</span>
        </header>

        {/* Main */}
        <main
          style={{
            flex: 1,
            padding: '1rem',
            paddingTop: '80px',
            minWidth: '0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '1200px',
              padding: window.innerWidth < 768 ? '0.25rem' : '2rem', // 4px no mobile
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrivateLayout;