import React, { useEffect, useState } from 'react';
import logo from '../assets/img/logo.png'; 
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [hoveredLink, setHoveredLink] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = () => {
      const userName = localStorage.getItem('userName');
      if (userName) {
        setLoggedInUser(userName);
      } else {
        setLoggedInUser(null);
      }
    };

    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    return () => window.removeEventListener('storage', checkLoginStatus);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setLoggedInUser(null);
    navigate('/login');
  };

  const navbarStyle = {
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #dee2e6',
    padding: '1rem 2rem',
    position: 'sticky',
    top: 0,
    zIndex: 999,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'Arial, sans-serif',
  };

  const brandStyle = {
    fontWeight: 700,
    fontSize: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const linksContainerStyle = {
    display: 'flex',
    gap: '4rem',
    marginRight: '20rem',
  };

  const authContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginLeft: 'auto',
  };

  const getLinkStyle = (index) => ({
    color: hoveredLink === index ? '#cf301d' : '#343a40',
    textDecoration: 'none',
    fontWeight: 600,
    transition: 'color 0.2s ease-in-out',
    fontSize: '1rem',
  });

  const links = [
    { href: '/fila-pedidos', label: 'PREPARANDO' },
    { href: '/entrega', label: 'ENTREGA / RETIRADA' },
    { href: '/cadastros', label: 'CADASTROS' },
  ];

  return (
    <nav style={navbarStyle}>
      <div style={brandStyle}>
        <img src={logo} alt="Logo" style={{ height: 40, width: 'auto' }} />
        <span>Painel de Pedidos</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
        <div style={linksContainerStyle}>
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              style={getLinkStyle(index)}
              onMouseEnter={() => setHoveredLink(index)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div style={authContainerStyle}>
          {loggedInUser ? (
            <>
              <span style={{ color: '#343a40' }}>Olá, {loggedInUser}!</span>
              <button
                onClick={handleLogout}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Sair
              </button>
            </>
          ) : (
            <a
              href="/login"
              style={{
                textDecoration: 'none',
                fontWeight: '600',
                color: '#343a40',
              }}
            >
              Login
            </a>
          )}
        </div>
      </div>
    </nav>
  );
};

const EntregaRetirada = () => {
  const [pedidosProntos, setPedidosProntos] = useState([]);

  const pageStyle = {
    backgroundColor: '#E9E9E9',
    minHeight: '100vh',
    paddingBottom: '2rem',
  };

  useEffect(() => {
    // Simulação de pedidos prontos // Apagar quando for integrado com o backend
    const pedidosSimulados = [
      {
        cliente: 'Carla S.',
        produtos: ['1 Pizza Média', '2 Refrigerantes'],
        horario: '16:10',
      },
      {
        cliente: 'João P.',
        produtos: ['3 Hambúrgueres', '1 Suco'],
        horario: '16:15',
      },
    ];

    setPedidosProntos(pedidosSimulados);
  }, []);

  const cardStyle = {
    width: '330px',
    height: '440px',        // <<< AQUI você adiciona a altura fixa
    background: '#fff',
    borderRadius: '20px',
    boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)',
    border: '1px solid #ddd',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  const h2Style = {
    marginBottom: '1.5rem',
    fontWeight: 700,
    fontSize: '1.5rem',
    color: '#222',
  };

  const ulStyle = {
    listStyleType: 'disc',
    paddingLeft: '1.25rem',
    color: '#555',
    fontSize: '1rem',
    marginBottom: '1rem',
  };

  const smallStyle = {
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'right',
    fontSize: '0.85rem',
  };

  const containerStyle = {
    maxWidth: '1100px',
    margin: '2rem auto',
    padding: '1rem',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.5rem',
    justifyContent: 'center',
  };

  return (
    <>
    <div style={pageStyle}>
      <Navbar />
      <div style={containerStyle}>
        <h2 style={{ width: '100%', textAlign: 'center' }}>Pedidos Prontos para Retirada</h2>
        {pedidosProntos.length === 0 ? (
          <p>Nenhum pedido pronto para retirada.</p>
        ) : (
          pedidosProntos.map((pedido, index) => (
            <div key={index} style={cardStyle}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontWeight: 700, color: '#222' }}>
                {pedido.cliente}
              </h3>
              <ul style={ulStyle}>
                {pedido.produtos.map((prod, i) => (
                  <li key={i}>{prod}</li>
                ))}
              </ul>
              <small style={smallStyle}>⏰ {pedido.horario}</small>
            </div>
          ))
        )}
      </div>
      </div>
    </>
  );
};

export default EntregaRetirada;
