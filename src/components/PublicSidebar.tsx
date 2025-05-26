import React, { useEffect, useState } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import Swal from 'sweetalert2';
import { FiCalendar, FiClock, FiHome } from 'react-icons/fi';
import { FaSignOutAlt } from 'react-icons/fa';
import { BsCameraReelsFill } from "react-icons/bs";

interface PublicSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const PublicSidebar: React.FC<PublicSidebarProps> = ({ isOpen }) => {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useUser();

  // Estilo para os links do menu, aplicando destaque se for a rota atual
  const linkStyle = (path: string) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 20px',
    textDecoration: 'none',
    color: location.pathname === path ? '#fff' : '#e3f2fd',
    backgroundColor: location.pathname === path ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
    fontWeight: 500,
    transition: 'all 0.2s',
    borderRadius: '8px',
  });

  // Função para lidar com logout com confirmação via SweetAlert2
  const handleLogout = () => {
    Swal.fire({
      title: 'Tem certeza que deseja sair?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, sair',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/'); // Redireciona para a home
      }
    });
  };



  const publicSidebarStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: isOpen ? 0 : '-250px',
    width: '250px',
    height: `${viewportHeight}px`,
    backgroundColor: 'rgba(13, 71, 161, 0.9)', // Azul claro
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'left 0.4s ease-in-out',
    zIndex: 999,
    overflow: 'hidden',
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '1rem',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  };

  return (
    <aside
      style={publicSidebarStyle}
    >

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px' }}>

        {/* Header */}
        <div style={headerStyle}>
          <div style={{ fontSize: '2rem' }}><BsCameraReelsFill /></div>
          
          <span style={{ color: '#ffc107' }}>Praia Sol</span>
          <br/>
          <span style={{ color: '#ffc107' }}>Vereda</span>
        </div>


        <Link to="/dashboard-cliente-publico" style={linkStyle('/dashboard-cliente-publico')}>
          <FiHome /> Dashboard
        </Link>

        <Link to="/nova-solicitacao" style={linkStyle('/nova-solicitacao')}>
          <FiClock /> Abrir Solicitação
        </Link>

        <Link to="/minhas-solicitacoes" style={linkStyle('/minhas-solicitacoes')}>
          <FiCalendar /> Histórico de Solicitações
        </Link>

        {/* Botão Sair */}
        {/* <button
          onClick={handleLogout}
          style={{
            ...linkStyle(''),
            backgroundColor: '#dc3545',
            border: 'none',
            color: '#e3f2fd',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <FiLogOut /> Sair
        </button> */}
      </nav>

      {/* Botão Sair */}
      <div style={{ padding: '1rem' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            backgroundColor: '#dc3545',
            color: '#fff',
            padding: '10px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            // justifyContent: 'center',
            textAlign: 'left',
          }}
        >
          <FaSignOutAlt style={{ marginRight: '8px' }} /> Sair
        </button>
      </div>

    </aside>
  );
};

export default PublicSidebar;