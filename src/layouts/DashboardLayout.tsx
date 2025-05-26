import { Outlet, Link } from 'react-router-dom';
import { FaUsers, FaTools, FaHome } from 'react-icons/fa';
import { useUser } from '../contexts/UserContext';

const DashboardLayout = () => {
  const { logout } = useUser();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ width: '250px', background: '#0d6efd', color: 'white', padding: '1rem' }}>
        <h2>Dashboard</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><Link to="/dashboard" style={{ color: 'white' }}><FaHome /> Home</Link></li>
          <li><Link to="/dashboard/clientes" style={{ color: 'white' }}><FaUsers /> Clientes</Link></li>
          <li><Link to="/dashboard/servicos" style={{ color: 'white' }}><FaTools /> Serviços</Link></li>
        </ul>
        <button onClick={logout} style={{ marginTop: '2rem', background: 'red', color: 'white' }}>Logout</button>
      </nav>

      <main style={{ flex: 1, padding: '2rem' }}>
        <Outlet /> {/* Aqui carregam as páginas internas */}
      </main>
    </div>
  );
};

export default DashboardLayout;