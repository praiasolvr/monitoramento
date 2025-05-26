import { Link } from 'react-router-dom';
import { colorAzul, colorBranco } from '../../values/colors';

const Home = () => {
  return (
    <div style={{ backgroundColor: '#f7f9fc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: colorAzul }}>
            Bem-vindo aos <span style={{ color: '#0d6efd' }}>Serviços de videomonitoramento</span>
          </h2>


          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            {/* Visualizar Apresentação */}
            {/* <a
              href="/documentos/manual.pptx"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...buttonStyle,
                backgroundColor: '#0d6efd',
                color: colorBranco,
              }}
            >
              Visualizar Apresentação
            </a> */}

            {/* Baixar Apresentação */}
            <a
              href="/documentos/manual.pptx"
              download
              style={{
                ...buttonStyle,
                backgroundColor: '#198754',
                color: colorBranco,
              }}
            >
              Baixar Apresentação
            </a>
          </div>




          <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '2rem' }}>
            Faça login para fazer solicitação
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/login" style={{ ...buttonStyle, backgroundColor: colorAzul, color: colorBranco }}>
              Fazer Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};


const buttonStyle = {
  padding: '0.75rem 1.5rem',
  borderRadius: '8px',
  fontWeight: 'bold',
  textDecoration: 'none',
  transition: '0.3s',
};

export default Home;
