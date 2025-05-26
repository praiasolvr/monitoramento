import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { colorBranco } from '../values/colors';

const Header = () => {
  const location = useLocation();
  const [isDark ] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false); // Estado para controle do menu

  const toggleMenu = () => setMenuAberto(!menuAberto); // Alterna estado do menu

  const navLinks = [
    { to: '/', label: 'Home' },
    // { to: '/agendamento', label: 'Agendar' },
    // { to: '/como-chegar', label: 'Como Chegar' },
    { to: '/login', label: 'Login', isButton: true },
  ];

  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm sticky-top"
      style={{
        backdropFilter: 'blur(8px)',
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(13, 71, 161, 0.9)',
        transition: 'background-color 0.3s ease',
      }}
    >
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center" to="/" style={{ color: colorBranco }}>
          <span style={{ letterSpacing: '1px' }}>Serviços</span>
          <span className="text-warning ms-1">Monitoramento</span>
        </Link>

        {/* Botão do menu hambúrguer */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu} // Altera o estado do menu
          aria-expanded={menuAberto}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
        </button>

        {/* Links do menu */}
        <div className={`collapse navbar-collapse justify-content-end ${menuAberto ? 'show' : ''}`}>
          <ul className="navbar-nav align-items-center">
            {navLinks.map((item) => (
              <li className="nav-item" key={item.to}>
                <Link
                  className={`nav-link px-3 ${location.pathname === item.to ? 'active-link' : ''}`}
                  to={item.to}
                  style={{
                    color: item.isButton ? '#fff' : colorBranco,
                    backgroundColor: item.isButton ? '#ffc107' : 'transparent',
                    borderRadius: item.isButton ? '20px' : '0',
                    marginLeft: item.isButton ? '10px' : '0',
                    marginTop: item.isButton ? '10px' : '0', 
                    padding: item.isButton ? '6px 15px' : '',
                    fontWeight: item.isButton ? '600' : 'normal',
                    transition: 'all 0.3s ease',
                    textDecoration: 'none',
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <style>
        {`
          .active-link {
            border-bottom: 2px solid #ffc107;
          }

          .nav-link:hover {
            color: #000 !important;
          }

          .navbar-brand:hover {
            text-shadow: 1px 1px 4px #ffffff55;
          }

          .show {
            display: block !important; /* Garante que o menu será visível quando aberto */
          }
        `}
      </style>
    </nav>
  );
};

export default Header;