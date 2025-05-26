// src/pages/protected/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext'; // Importa o hook que gerencia o estado de usuário

// Componente de rota protegida
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser(); // Obtém o usuário do contexto

  // Verifica se o usuário está logado
  if (!user) {
    // Se não estiver logado, redireciona para a página inicial (home)
    return <Navigate to="/" />;
  }

  // Verifica se o e-mail do usuário é o correto (admin)
  if (user.email !== 'monitoramento@viacaopraiasol.com.br') {
    // Se o e-mail não for o correto, redireciona para a página de cliente público
    return <Navigate to="/dashboard-cliente-publico" />;
  }

  // Se o usuário estiver logado e tiver o e-mail correto, renderiza os filhos (página privada)
  return <>{children}</>;
};

export default ProtectedRoute;