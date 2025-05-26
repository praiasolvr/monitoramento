// src/pages/client/Dashboard.tsx

import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSignOutAlt } from 'react-icons/fa';
import { colorAzul, colorBranco } from '../../values/colors';
import { TbReport } from 'react-icons/tb';
import { BiSolidReport } from 'react-icons/bi';

/**
 * Componente de dashboard principal após login.
 * Exibe um menu com botões de navegação para páginas do sistema.
 */
const Dashboard = () => {
  const { user, logout } = useUser(); // Hook de autenticação
  const navigate = useNavigate();     // Hook para navegar entre rotas

  /**
   * Lista de opções de navegação do menu do dashboard.
   * A ordem segue: Cadastrar Tipo de Serviço, Cliente, Cadastrar Cliente, Serviço, Cadastrar Serviço.
   */
  const menuOptions = [
    {
      label: 'Visualizar Solicitações',
      icon: <TbReport size={22} />,
      onClick: () => navigate('/visualizar-solicitacoes', { replace: true }),
    },
    {
      label: 'Relatório de Solicitações',
      icon: <BiSolidReport size={22} />,
      onClick: () => navigate('/relatorio-solicitacoes', { replace: true }),
    }
    // ,
    // {
    //   label: 'Cadastrar Cliente',
    //   icon: <FaPlus size={22} />,
    //   onClick: () => navigate('/cadastrar-cliente', { replace: true }),
    // },
    // {
    //   label: 'Serviços',
    //   icon: <FaCogs size={22} />,
    //   onClick: () => navigate('/servicos', { replace: true }),
    // },
    // {
    //   label: 'Cadastrar Serviço',
    //   icon: <FaPlus size={22} />,
    //   onClick: () => navigate('/cadastrar-servico', { replace: true }),
    // },
  ];

  return (
    <div
      className="container mt-5"
      style={{
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        maxWidth: '700px',
      }}
    >
      {/* Saudação personalizada */}
      <h1
        style={{
          color: colorAzul,
          fontSize: '26px',
          fontWeight: 'bold',
          marginBottom: '30px',
        }}
      >
        👋 Bem-vindo, {user?.displayName || user?.email || 'Usuário'}!
      </h1>

      {/* Lista de botões do menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {menuOptions.map((option, index) => (
          <motion.button
            key={index}
            onClick={option.onClick}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: colorAzul,
              color: colorBranco,
              fontSize: '18px',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            {option.icon}
            {option.label}
          </motion.button>
        ))}

        {/* Botão de sair */}
        <motion.button
          onClick={logout}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#e74c3c',
            color: colorBranco,
            fontSize: '18px',
            padding: '12px 20px',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginTop: '20px',
          }}
        >
          <FaSignOutAlt size={22} />
          Sair
        </motion.button>
      </div>
    </div>
  );
};

export default Dashboard;