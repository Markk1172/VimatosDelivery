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
              <button onClick={handleLogout} style={{
                padding: '6px 12px',
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
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

const PedidoCard = ({ cliente, produtos, horario, onPassarPedido }) => {
  const [hover, setHover] = useState(false);

  const pedidoCardStyle = {
    width: '330px',
    height: '440px',
    background: '#fff',
    borderRadius: '20px',
    boxShadow: hover ? '0 8px 20px rgb(0 0 0 / 0.15)' : '0 4px 12px rgb(0 0 0 / 0.1)',
    border: '1px solid #ddd',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    fontFamily: 'Arial, sans-serif',
    transition: 'box-shadow 0.3s ease',
    cursor: 'pointer',
  };

  const h3Style = {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#222',
    marginBottom: '1rem',
  };

  const ulStyle = {
    listStyleType: 'disc',
    paddingLeft: '1.25rem',
    maxHeight: '280px',
    overflowY: 'auto',
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

  const buttonStyle = {
    padding: '10px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
  };

  return (
    <div
      style={pedidoCardStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <h3 style={h3Style}>{cliente}</h3>
      <ul style={ulStyle}>
        {produtos.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
      <small style={smallStyle}>⏰ {horario}</small>
      <button style={buttonStyle} onClick={onPassarPedido}>
        Marcar como pronto
      </button>
    </div>
  );
};

const FilaPedidos = () => {
  const [fila, setFila] = useState([]);

  const pageStyle = {
    backgroundColor: '#E9E9E9',
    minHeight: '100vh',
    paddingBottom: '2rem',
  };

  // Simulação de pedidos prontos // Apagar quando for integrado com o backend
  useEffect(() => {
    const pedidosSimulados = [
      {
        cliente: 'Amanda B.',
        produtos: ['2 Hambúrgueres', '1 Coca-Cola'],
        horario: '15:30',
      },
      {
        cliente: 'Lucas M.',
        produtos: ['1 Pizza Grande', '2 Sucos'],
        horario: '15:45',
      },
      {
        cliente: 'Luan M.',
        produtos: ['1 Pizza Grande', '2 Sucos'],
        horario: '15:40',
      },
    ];

    setFila(pedidosSimulados);
  }, []);

  const passarPedido = (index) => {
    // Remove o pedido que foi marcado como pronto
    setFila((prevFila) => prevFila.filter((_, i) => i !== index));
  };

  const mainStyle = {
    maxWidth: '1100px',
    margin: '2rem auto',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.5rem',
    justifyContent: 'center',
  };

  return (
    <div style={pageStyle}>
      <Navbar />
      <h2 style={{ width: '100%', textAlign: 'center', marginTop: '3rem' }}>Pedidos em Preparo</h2>
      <main style={mainStyle}>
        {fila.length === 0 ? (
          <p>Nenhum pedido em preparo.</p>
        ) : (
          fila.map((pedido, index) => (
            <PedidoCard
              key={index}
              cliente={pedido.cliente}
              produtos={pedido.produtos}
              horario={pedido.horario}
              onPassarPedido={() => passarPedido(index)}
            />
          ))
        )}
      </main>
    </div>
  );
};

export default FilaPedidos;
