import React, { useEffect, useState } from 'react';
import logo from '../assets/img/logo.png';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const [hoveredLink, setHoveredLink] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isFuncionario, setIsFuncionario] = useState(false); // Estado para verificar se é funcionário
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserStatus = () => {
      const userName = localStorage.getItem('userName');
      const funcionarioStatus = localStorage.getItem('isFuncionario') === 'true';

      if (userName) {
        setLoggedInUser(userName);
        setIsFuncionario(funcionarioStatus);
      } else {
        setLoggedInUser(null);
        setIsFuncionario(false);
      }
    };

    checkUserStatus();
    window.addEventListener('storage', checkUserStatus);
    return () => window.removeEventListener('storage', checkUserStatus);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('clienteId');
    localStorage.removeItem('isFuncionario');
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
    zIndex: 1030, // zIndex alto para a navbar
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'Arial, sans-serif',
  };

  const brandLinkStyle = { // Renomeado de brandStyle para evitar conflito e aplicar Link
    fontWeight: 700,
    fontSize: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: '#343a40',
  };

  const linksContainerStyle = {
    display: 'flex',
    gap: '2rem', // Ajustado para melhor espaçamento
    alignItems: 'center',
  };

  const authContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const getLinkStyle = (isHovered) => ({
    color: isHovered ? '#cf301d' : '#343a40',
    textDecoration: 'none',
    fontWeight: 600,
    transition: 'color 0.2s ease-in-out',
    fontSize: '1rem',
  });

  // Links específicos para funcionários
  const funcionarioLinks = [
    { to: '/fila-pedidos', label: 'PREPARANDO' },
    { to: '/entrega-retirada', label: 'ENTREGA / RETIRADA' },
    { to: '/cadastros', label: 'CADASTROS' },
  ];

  return (
    <nav style={navbarStyle}>
      <Link to={isFuncionario ? "/fila-pedidos" : "/"} style={brandLinkStyle}>
        <img src={logo} alt="Logo" style={{ height: 40, width: 'auto' }} />
        {/* Texto da marca condicional */}
        <span>{isFuncionario ? 'Gestão Pizzaria' : 'Vimatos Delivery'}</span>
      </Link>
      
      {/* Centraliza os links de funcionário se existirem */}
      <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
        {isFuncionario && (
          <div style={linksContainerStyle}>
            {funcionarioLinks.map((link, index) => (
              <Link
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
          <Link
            to="/login"
            style={{
              textDecoration: 'none',
              fontWeight: '600',
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

const EntregaRetirada = () => {
  const [pedidosProntos, setPedidosProntos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPedidosProntos = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        navigate('/login'); // Redireciona se não houver token
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // AJUSTE: Substitua pela URL correta do seu backend para pedidos prontos
        const response = await fetch('http://127.0.0.1:8000/api/pedidos/?status=Pronto para Entrega', { // Exemplo de endpoint
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Adapte esta linha conforme a estrutura da sua resposta da API
          // Exemplo: se a API retorna um array diretamente: setPedidosProntos(data);
          // Se retorna um objeto com uma chave 'results': setPedidosProntos(data.results || []);
          setPedidosProntos(data || []); 
        } else if (response.status === 401 || response.status === 403) {
          setError('Sua sessão expirou ou você não tem permissão. Faça login novamente.');
          localStorage.clear(); // Limpa o localStorage em caso de não autorizado
          navigate('/login');
        } else {
          const errorData = await response.json().catch(() => ({ detail: 'Erro ao buscar pedidos.'}));
          setError(errorData.detail || `Erro ${response.status} ao buscar pedidos.`);
        }
      } catch (err) {
        console.error("Erro de rede ao buscar pedidos:", err);
        setError('Erro de rede ao buscar pedidos. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchPedidosProntos();
  }, [navigate]);

  const pageStyle = {
    backgroundColor: '#E9E9E9',
    minHeight: '100vh',
    paddingBottom: '2rem',
  };

  const cardStyle = {
    width: '330px',
    height: 'auto', // Altura automática para caber o conteúdo
    minHeight: '200px', // Altura mínima para consistência
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
    width: '100%',
    textAlign: 'center',
    marginBottom: '1.5rem',
    fontWeight: 700,
    fontSize: '2rem', // Aumentado
    color: '#333',    // Cor mais escura
  };

  const ulStyle = {
    listStyleType: 'disc',
    paddingLeft: '1.25rem',
    color: '#555',
    fontSize: '1rem',
    marginBottom: '1rem',
    flexGrow: 1, // Para ocupar espaço disponível
  };

  const smallStyle = {
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'right',
    fontSize: '0.85rem',
    marginTop: 'auto', // Empurra para baixo
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

  if (loading) {
    return (
      <div style={pageStyle}>
        <Navbar />
        <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.2rem' }}>Carregando pedidos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <Navbar />
        <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.2rem', color: 'red' }}>{error}</div>
      </div>
    );
  }

  return (
    <>
      <div style={pageStyle}>
        <Navbar />
        <div style={containerStyle}>
          <h2 style={h2Style}>Pedidos Prontos para Entrega/Retirada</h2>
          {pedidosProntos.length === 0 ? (
            <p style={{width: '100%', textAlign: 'center', fontSize: '1.1rem'}}>Nenhum pedido pronto no momento.</p>
          ) : (
            pedidosProntos.map((pedido) => ( // Assumindo que 'id' é a chave única do pedido
              <div key={pedido.id || pedido.cliente} style={cardStyle}> {/* Use um ID único se disponível */}
                <div>
                  <h3 style={{ marginTop: 0, marginBottom: '1rem', fontWeight: 700, color: '#222' }}>
                    {/* Adapte para mostrar o nome do cliente ou ID do pedido */}
                    Cliente: {pedido.cliente?.nome || pedido.cliente_nome || `Pedido #${pedido.id}`}
                  </h3>
                  <p style={{fontSize: '0.9rem', color: '#666'}}>Status: {pedido.status}</p>
                  <p style={{fontSize: '0.9rem', color: '#666'}}>Total: R$ {parseFloat(pedido.total).toFixed(2)}</p>
                  <h4 style={{marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1rem'}}>Itens:</h4>
                  <ul style={ulStyle}>
                    {/* Adapte para mostrar os itens do pedido */}
                    {pedido.itens_pedido && pedido.itens_pedido.map((item, i) => (
                       <li key={i}>{item.quantidade}x {item.produto_nome || item.pizza?.sabor || item.bebida?.sabor}</li>
                    ))}
                    {!pedido.itens_pedido && <li>Detalhes dos itens não disponíveis.</li>}
                  </ul>
                </div>
                <small style={smallStyle}>
                  {/* Adapte para mostrar o horário formatado do pedido */}
                  ⏰ {new Date(pedido.data_pedido).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </small>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

// Se você for exportar ambos de um mesmo arquivo (não usual para componentes de página):
// export { Navbar, EntregaRetirada };

// Normalmente, cada componente teria seu próprio arquivo:
// export default Navbar; // Em Navbar.jsx
export default EntregaRetirada; // Em EntregaRetirada.jsx (ou o nome do arquivo que você usar)
// Se Navbar estiver em outro arquivo, remova a declaração dela daqui e importe-a.
// Se este arquivo for apenas para EntregaRetirada, remova a Navbar daqui e importe-a no return.
// Para o propósito deste Canvas, mantive ambos para fácil visualização.
// Se você quiser que eu separe em dois artefatos, me diga.
