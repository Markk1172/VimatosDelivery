import React, { useEffect, useState } from 'react';
import logo from '../assets/img/logo.png';
import { useNavigate, Link } from 'react-router-dom'; // Usando Link e useNavigate (V2)

// ====================================================================================
// Navbar Component (Merged - Baseado na V2 por ser mais completa)
// ====================================================================================
const Navbar = () => {
    const [hoveredLink, setHoveredLink] = useState(null);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [isFuncionario, setIsFuncionario] = useState(false); // Estado de funcionário (V2)
    const navigate = useNavigate();

    useEffect(() => {
        // Lógica de checkUserStatus (V2 - mais completa)
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
        // Lógica de logout (V2 - mais completa)
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

    // Estilos da Navbar (Base V2, com ajustes)
    const navbarStyle = {
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
        padding: '1rem 3rem', // Padding V2
        position: 'sticky',
        top: 0,
        zIndex: 1030, // zIndex V2
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
    };

    const brandLinkStyle = { // Estilo da marca (V2)
        fontWeight: 700,
        fontSize: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        color: '#343a40',
    };

    const linksContainerStyle = { // Estilo dos links (V2)
        display: 'flex',
        gap: '2rem', // Gap V2 (era 4rem em V1)
        alignItems: 'center',
    };

    const authContainerStyle = { // Estilo da autenticação (V2)
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        // marginLeft: 'auto' removido para centralizar melhor com flexGrow
    };

    // Estilo dos links (V2)
    const getLinkStyle = (isHovered) => ({
        color: isHovered ? '#cf301d' : '#343a40',
        textDecoration: 'none',
        fontWeight: 600,
        transition: 'color 0.2s ease-in-out',
        fontSize: '1rem',
    });

    // Links (V2 - mais completos e condicionais)
    const funcionarioLinks = [
        { to: '/fila-pedidos', label: 'PREPARANDO' },
        { to: '/entrega-retirada', label: 'ENTREGA / RETIRADA' }, // Usando V2 (/entrega-retirada)
        { to: '/cadastros', label: 'CADASTROS' },
    ];

    return (
        <nav style={navbarStyle}>
            {/* Link da Marca (V2 - Condicional) */}
            <Link to={isFuncionario ? "/fila-pedidos" : "/"} style={brandLinkStyle}>
                <img src={logo} alt="Logo" style={{ height: 40, width: 'auto' }} />
                <span>{isFuncionario ? 'Gestão Pizzaria' : 'Vimatos Delivery'}</span> 
                {/* <span>Painel de Pedidos</span> Se quisesse usar o texto da V1 */}
            </Link>

            {/* Links Centrais (V2 - Condicional e com Link) */}
            <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                {isFuncionario && ( // Mostra links apenas se for funcionário (V2)
                    <div style={linksContainerStyle}>
                        {funcionarioLinks.map((link, index) => (
                            <Link // Usando Link (V2)
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

            {/* Autenticação (V2 - Com Link e botão melhorado) */}
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
                    <Link // Usando Link (V2)
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

// ====================================================================================
// EntregaRetirada Component (Merged - Baseado na V2 por ter API e loading/error)
// ====================================================================================
const EntregaRetirada = () => {
    const [pedidosProntos, setPedidosProntos] = useState([]);
    const [loading, setLoading] = useState(true); // Estado de loading (V2)
    const [error, setError] = useState(null); // Estado de erro (V2)
    const navigate = useNavigate(); // Hook de navegação (V2)

    // Dados simulados (V1) - Podem ser usados como fallback ou para testes
    const pedidosSimulados = [
        { id: 'sim1', cliente: { nome: 'Carla S.' }, status: 'Pronto para Retirada', total: 50.00, itens_pedido: [{ quantidade: 1, pizza: { sabor: 'Pizza Média' } }, { quantidade: 2, bebida: { sabor: 'Refrigerantes' } }], data_pedido: new Date().toISOString() },
        { id: 'sim2', cliente: { nome: 'João P.' }, status: 'Pronto para Entrega', total: 75.00, itens_pedido: [{ quantidade: 3, produto_nome: 'Hambúrgueres' }, { quantidade: 1, produto_nome: 'Suco' }], data_pedido: new Date().toISOString() },
    ];

    useEffect(() => {
        // Busca de pedidos da API (V2)
        const fetchPedidosProntos = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                navigate('/login');
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await fetch('http://127.0.0.1:8000/api/pedidos/?status=Pronto para Entrega', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setPedidosProntos(data || []);
                } else if (response.status === 401 || response.status === 403) {
                    setError('Sua sessão expirou ou você não tem permissão. Faça login novamente.');
                    localStorage.clear();
                    navigate('/login');
                } else {
                    const errorData = await response.json().catch(() => ({ detail: 'Erro ao buscar pedidos.' }));
                    setError(errorData.detail || `Erro ${response.status} ao buscar pedidos.`);
                    // setPedidosProntos(pedidosSimulados); // Opcional: Usar dados simulados em caso de erro
                }
            } catch (err) {
                console.error("Erro de rede ao buscar pedidos:", err);
                setError('Erro de rede ao buscar pedidos. Tente novamente.');
                // setPedidosProntos(pedidosSimulados); // Opcional: Usar dados simulados em caso de erro
            } finally {
                setLoading(false);
            }
        };

        fetchPedidosProntos();
    }, [navigate]); // Dependência [navigate]

    // Estilos (V2 - mais flexíveis)
    const pageStyle = {
        backgroundColor: '#E9E9E9',
        minHeight: '100vh',
        paddingBottom: '2rem',
    };

    const cardStyle = {
        width: '330px',
        height: 'auto', // Altura automática (V2)
        minHeight: '200px',
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

    const h2Style = { // Estilo H2 (V2)
        width: '100%',
        textAlign: 'center',
        marginBottom: '1.5rem',
        fontWeight: 700,
        fontSize: '2rem',
        color: '#333',
    };

    const ulStyle = { // Estilo UL (V2)
        listStyleType: 'disc',
        paddingLeft: '1.25rem',
        color: '#555',
        fontSize: '1rem',
        marginBottom: '1rem',
        flexGrow: 1,
    };

    const smallStyle = { // Estilo Small (V2)
        fontStyle: 'italic',
        color: '#888',
        textAlign: 'right',
        fontSize: '0.85rem',
        marginTop: 'auto',
    };

    const containerStyle = { // Estilo Container (V2)
        maxWidth: '1100px',
        margin: '2rem auto',
        padding: '1rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        justifyContent: 'center',
    };

    // Renderização com Loading e Error (V2)
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

    // Renderização principal (V2 - com mapeamento de dados da API)
    return (
        <>
            <div style={pageStyle}>
                <Navbar />
                <div style={containerStyle}>
                    <h2 style={h2Style}>Pedidos Prontos para Entrega/Retirada</h2>
                    {pedidosProntos.length === 0 ? (
                        <p style={{ width: '100%', textAlign: 'center', fontSize: '1.1rem' }}>Nenhum pedido pronto no momento.</p>
                    ) : (
                        pedidosProntos.map((pedido) => (
                            <div key={pedido.id || pedido.cliente?.nome} style={cardStyle}>
                                <div>
                                    <h3 style={{ marginTop: 0, marginBottom: '1rem', fontWeight: 700, color: '#222' }}>
                                        Cliente: {pedido.cliente?.nome || pedido.cliente_nome || `Pedido #${pedido.id}`}
                                    </h3>
                                    <p style={{ fontSize: '0.9rem', color: '#666' }}>Status: {pedido.status}</p>
                                    <p style={{ fontSize: '0.9rem', color: '#666' }}>Total: R$ {parseFloat(pedido.total).toFixed(2)}</p>
                                    <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1rem' }}>Itens:</h4>
                                    <ul style={ulStyle}>
                                        {pedido.itens_pedido && pedido.itens_pedido.map((item, i) => (
                                            <li key={i}>{item.quantidade}x {item.produto_nome || item.pizza?.sabor || item.bebida?.sabor}</li>
                                        ))}
                                        {!pedido.itens_pedido && <li>Detalhes dos itens não disponíveis.</li>}
                                    </ul>
                                </div>
                                <small style={smallStyle}>
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

export default EntregaRetirada;