import React, { useEffect, useState } from 'react';
import logo from '../assets/img/logo.png';
// Importando useNavigate e Link (V2 é mais completa)
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
    const [hoveredLink, setHoveredLink] = useState(null);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [isFuncionario, setIsFuncionario] = useState(false); // V2
    const navigate = useNavigate();

    useEffect(() => {
        // Lógica de checkUserStatus (V2)
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
        // Lógica de logout (V2)
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

    // Estilos (V2)
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
        textDecoration: 'none',
        color: '#343a40',
    };

    const linksContainerStyle = {
        display: 'flex',
        gap: '2rem',
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

    const funcionarioLinks = [
        { to: '/fila-pedidos', label: 'PREPARANDO' },
        { to: '/entrega-retirada', label: 'ENTREGA / RETIRADA' },
        { to: '/cadastros', label: 'CADASTROS' },
    ];

    return (
        <nav style={navbarStyle}>
            <Link to={isFuncionario ? "/fila-pedidos" : "/"} style={brandStyle}>
                <img src={logo} alt="Logo" style={{ height: 40, width: 'auto' }} />
                <span>{isFuncionario ? 'Gestão Pizzaria' : 'Vimatos Delivery'}</span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
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
        flexGrow: 1, // Adicionado para empurrar o botão para baixo se a lista for curta
    };

    const smallStyle = {
        fontStyle: 'italic',
        color: '#888',
        textAlign: 'center',
        fontSize: '0.85rem',
    };

    const buttonStyle = {
        padding: '10px 15px', // Ajustado padding
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
        marginTop: '1rem', // Adicionado margin top
        alignSelf: 'stretch', // Faz o botão ocupar a largura
        transition: 'background-color 0.2s ease', // Adicionado transição
    };

    // Adicionando :hover no botão via JS (alternativa, CSS seria melhor)
    const handleButtonHover = (e, isHovering) => {
        e.target.style.backgroundColor = isHovering ? '#218838' : '#28a745';
    };


    return (
        <div
            style={pedidoCardStyle}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div> {/* Agrupador para conteúdo superior */}
                <h3 style={h3Style}>{cliente}</h3>
                <ul style={ulStyle}>
                    {produtos.map((p, i) => (
                        <li key={i}>{p}</li>
                    ))}
                </ul>
            </div>
            
            <div> {/* Agrupador para conteúdo inferior */}
                
                <button
                    style={buttonStyle}
                    onClick={onPassarPedido}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                >
                    Marcar como pronto
                </button><br></br><small style={smallStyle}>⏰ {horario}</small>
            </div>
        </div>
    );
};

// ====================================================================================
// FilaPedidos Component (Idêntico em ambos, incluído aqui)
// ====================================================================================
const FilaPedidos = () => {
    const [fila, setFila] = useState([]);
    const navigate = useNavigate(); // Adicionado para usar na Navbar

    const pageStyle = {
        backgroundColor: '#E9E9E9',
        minHeight: '100vh',
        paddingBottom: '2rem',
    };

    // Simulação de pedidos (mantida como nos originais)
    // TODO: Substituir por fetch da API quando integrar
    useEffect(() => {
        const pedidosSimulados = [
            { id: 1, cliente: 'Amanda B.', produtos: ['2 Hambúrgueres', '1 Coca-Cola'], horario: '15:30' },
            { id: 2, cliente: 'Lucas M.', produtos: ['1 Pizza Grande', '2 Sucos'], horario: '15:45' },
            { id: 3, cliente: 'Luan M.', produtos: ['1 Pizza Grande', '2 Sucos'], horario: '15:40' },
        ];
        setFila(pedidosSimulados);
    }, []);

    // TODO: Atualizar esta função para chamar a API para mudar o status do pedido
    const passarPedido = (pedidoId) => {
        console.log(`Pedido ${pedidoId} marcado como pronto (simulação).`);
        // Remove o pedido que foi marcado como pronto (lógica local)
        setFila((prevFila) => prevFila.filter((pedido) => pedido.id !== pedidoId));
        // Aqui deveria ocorrer uma chamada PUT/PATCH para a API
    };

    const mainStyle = {
        maxWidth: '1100px',
        margin: '2rem auto',
        padding: '0 1rem', // Adicionado padding horizontal
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        justifyContent: 'center',
    };

    const h2Style = {
        width: '100%',
        textAlign: 'center',
        marginTop: '3rem',
        marginBottom: '1rem', // Adicionado margin bottom
        fontWeight: 700,
        fontSize: '2rem',
        color: '#333',
    };

    return (
        <div style={pageStyle}>
            <Navbar /> {/* Renderiza a Navbar mesclada (V2) */}
            <h2 style={h2Style}>Pedidos em Preparo</h2>
            <main style={mainStyle}>
                {fila.length === 0 ? (
                    <p style={{ fontSize: '1.1rem' }}>Nenhum pedido em preparo.</p>
                ) : (
                    fila.map((pedido) => ( // Usando pedido.id como key
                        <PedidoCard
                            key={pedido.id}
                            cliente={pedido.cliente}
                            produtos={pedido.produtos}
                            horario={pedido.horario}
                            onPassarPedido={() => passarPedido(pedido.id)}
                        />
                    ))
                )}
            </main>
        </div>
    );
};

export default FilaPedidos;