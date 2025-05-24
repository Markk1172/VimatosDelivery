import React, { useEffect, useState } from 'react';
import logo from '../assets/img/logo.png';
import { useNavigate, Link } from 'react-router-dom'; 

const Navbar = () => {
  const [hoveredLink, setHoveredLink] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isFuncionario, setIsFuncionario] = useState(false); // Novo estado
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserStatus = () => {
      const userName = localStorage.getItem('userName');
      const funcionarioStatus = localStorage.getItem('isFuncionario') === 'true'; // Verifica se é funcionário

      if (userName) {
        setLoggedInUser(userName);
        setIsFuncionario(funcionarioStatus); // Define o estado de funcionário
      } else {
        setLoggedInUser(null);
        setIsFuncionario(false);
      }
    };

    checkUserStatus();
    window.addEventListener('storage', checkUserStatus); // Ouve mudanças no localStorage
    return () => window.removeEventListener('storage', checkUserStatus);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('clienteId');
    localStorage.removeItem('isFuncionario'); // Remove o status de funcionário
    setLoggedInUser(null);
    setIsFuncionario(false);
    navigate('/login');
  };

  const navbarStyle = {
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #dee2e6',
    padding: '1rem 3rem',
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
    textDecoration: 'none', // Para o Link da marca
    color: '#343a40',      // Cor da marca
  };

  const linksContainerStyle = {
    display: 'flex',
    gap: '2rem', // Reduzido o gap para melhor encaixe
    // marginRight: '20rem', // Removido ou ajustado se necessário
  };

  const authContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    // marginLeft: 'auto', // Removido para centralizar melhor com o flex da navbar
  };

  const getLinkStyle = (isHovered) => ({ // Modificado para aceitar boolean
    color: isHovered ? '#cf301d' : '#343a40',
    textDecoration: 'none',
    fontWeight: 600,
    transition: 'color 0.2s ease-in-out',
    fontSize: '1rem',
  });

  // Links de funcionário
  const funcionarioLinks = [
    { to: '/fila-pedidos', label: 'PREPARANDO' },
    { to: '/entrega-retirada', label: 'ENTREGA / RETIRADA' }, // Corrigido o 'to'
    { to: '/cadastros', label: 'CADASTROS' },
  ];

  return (
    <nav style={navbarStyle}>
      <Link to={isFuncionario ? "/fila-pedidos" : "/"} style={brandStyle}> {/* Link para home de funcionário ou cliente */}
        <img src={logo} alt="Logo" style={{ height: 40, width: 'auto' }} />
        <span>{isFuncionario ? 'Gestão Pizzaria' : 'Vimatos Delivery'}</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
        {/* Renderiza os links de funcionário apenas se isFuncionario for true */}
        {isFuncionario && (
          <div style={linksContainerStyle}>
            {funcionarioLinks.map((link, index) => (
              <Link // Usar Link do react-router-dom
                key={index}
                to={link.to}
                style={getLinkStyle(hoveredLink === index)}
                onMouseEnter={() => setHoveredLink(index)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div style={authContainerStyle}>
        {loggedInUser ? (
          <>
            <span style={{ color: '#343a40', whiteSpace: 'nowrap' }}>Olá, {loggedInUser}!</span>
            <button
              onClick={handleLogout}
              style={{
                padding: '6px 12px',
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Sair
            </button>
          </>
        ) : (
          <Link // Usar Link do react-router-dom
            to="/login"
            style={{
              textDecoration: 'none',
              fontWeight: '600',
              color: '#343a40',
              padding: '6px 12px',
              backgroundColor: '#007bff',
              color: '#fff',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            Login
          </Link>
        )}
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
