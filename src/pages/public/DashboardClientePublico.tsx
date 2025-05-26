import { useUser } from '../../contexts/UserContext'; // Contexto do usuário (autenticação)
import { useNavigate } from 'react-router-dom'; // Navegação programática
import { motion } from 'framer-motion'; // Animações nos botões
import { FaClock, FaCheckCircle, FaSignOutAlt } from 'react-icons/fa'; // Ícones
import { colorBranco } from '../../values/colors'; // Cor branca padrão

// Cor azul claro para diferenciar do painel administrativo
const colorAzulClaro = '#3498db';

const DashboardClientePublico = () => {
  const { user, logout } = useUser(); // Dados do usuário e função de logout
  const navigate = useNavigate(); // Hook de navegação

  // Função de logout com redirecionamento para a home
  const handleLogout = () => {
    logout(); // Realiza o logout
    navigate('/'); // Redireciona para a página inicial
  };

  // Opções do menu do cliente
  const menuOptions = [
    {
      label: 'Abrir Solicitação',
      icon: <FaCheckCircle size={20} />,
      onClick: () => navigate('/nova-solicitacao'),
    },
    {
      label: 'Histórico de Solicitações',
      icon: <FaClock size={20} />,
      onClick: () => navigate('/minhas-solicitacoes'),
    },
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
      {/* Saudação ao usuário */}
      <h1
        style={{
          color: colorAzulClaro,
          fontSize: '26px',
          fontWeight: 'bold',
          marginBottom: '30px',
        }}
      >
        👋 Olá, {user?.displayName || user?.email || 'Cliente'}!
      </h1>

      {/* Lista de botões de navegação */}
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
              backgroundColor: colorAzulClaro,
              color: colorBranco,
              fontSize: '18px',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            {option.icon}
            {option.label}
          </motion.button>
        ))}

        {/* Botão de logout */}
        <motion.button
          onClick={handleLogout} // Modificação aqui
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

export default DashboardClientePublico;