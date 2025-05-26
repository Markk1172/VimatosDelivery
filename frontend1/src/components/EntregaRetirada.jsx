import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/img/logo.png'; // Verifique o caminho do logo

// --- SVGs de Ícones para a Navbar ---
const shoppingCartIcon = ( <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg"> <g transform="translate(6.8,6.8)"> <circle cx="5" cy="17" r="1.5" fill="rgb(52, 58, 64)"/><circle cx="14" cy="17" r="1.5" fill="rgb(52, 58, 64)"/><path d="M-1 0H1L2.68 12.39C2.84 13.66 3.91 14.67 5.19 14.67H14.5C15.78 14.67 16.85 13.66 17.01 12.39L17.82 5.39C17.93 4.47 17.21 3.67 16.28 3.67H3.12" stroke="rgb(52, 58, 64)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </g> </svg> );

// --- Navbar Principal (definida dentro deste arquivo para este exemplo) ---
const Navbar = () => {
    const [hoveredLink, setHoveredLink] = useState(null);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [isFuncionario, setIsFuncionario] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkUserStatus = () => {
            const userName = localStorage.getItem('userName');
            const funcionarioStatus = localStorage.getItem('isFuncionario') === 'true';
            if (userName) {
                setLoggedInUser(userName);
                setIsFuncionario(funcionarioStatus);
                if (!funcionarioStatus && (location.pathname.startsWith('/fila-pedidos') || location.pathname.startsWith('/cadastros') || location.pathname.startsWith('/entrega-retirada'))) {
                    navigate('/');
                }
            } else {
                setLoggedInUser(null);
                setIsFuncionario(false);
                if (location.pathname.startsWith('/fila-pedidos') || location.pathname.startsWith('/cadastros') || location.pathname.startsWith('/entrega-retirada') || location.pathname.startsWith('/pedidos') || location.pathname.startsWith('/profile')) {
                    navigate('/login');
                }
            }
        };
        checkUserStatus();
        window.addEventListener('storage', checkUserStatus);
        return () => window.removeEventListener('storage', checkUserStatus);
    }, [navigate, location.pathname]);

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

    const navbarStyle = { backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', padding: '1rem 3rem', position: 'sticky', top: 0, zIndex: 1030, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Arial, sans-serif' };
    const brandLinkStyle = { fontWeight: 700, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#343a40' };
    const linksContainerStyle = { display: 'flex', gap: '2rem', flexGrow: 1, justifyContent: 'center' };
    const authContainerStyle = { display: 'flex', alignItems: 'center', gap: '15px' };
    const getLinkStyle = (path) => ({
        color: location.pathname === path ? '#cf301d' : (hoveredLink === path ? '#cf301d' : '#343a40'),
        textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s ease-in-out', fontSize: '1rem',
    });
    const logoutButtonStyle = { padding: '6px 12px', backgroundColor: '#E04725', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '600', fontSize: '0.9rem'};
    const loginButtonStyle = { textDecoration: 'none', fontWeight: '600', padding: '6px 12px', backgroundColor: '#007bff', color: '#fff', borderRadius: '4px', whiteSpace: 'nowrap', transition: 'background-color 0.2s ease' };

    const funcionarioLinks = [ { to: '/fila-pedidos', label: 'PREPARANDO' }, { to: '/entrega-retirada', label: 'ENTREGA / RETIRADA' }, { to: '/cadastros', label: 'CADASTROS' }];
    const clienteLinks = [ { to: "/", label: "HOME" }, { to: "/cardapio", label: "CARDÁPIO" }];
    const linksToShow = isFuncionario ? funcionarioLinks : clienteLinks;

    return (
        <nav style={navbarStyle}>
            <Link to={isFuncionario ? "/fila-pedidos" : "/"} style={brandLinkStyle}>
                <img src={logo} alt="Logo" style={{ height: 40, width: 'auto' }} />
                <span>{isFuncionario ? 'Gestão Pizzaria' : 'Vimatos Delivery'}</span>
            </Link>
            <div style={linksContainerStyle}>
                {linksToShow.map((link) => (
                    <Link key={link.to} to={link.to} style={getLinkStyle(link.to)} onMouseEnter={() => setHoveredLink(link.to)} onMouseLeave={() => setHoveredLink(null)}>
                        {link.label}
                    </Link>
                ))}
            </div>
            <div style={authContainerStyle}>
                {loggedInUser ? (
                    <>
                        <span style={{ color: '#343a40', whiteSpace: 'nowrap', fontWeight:'500', marginRight: '5px' }}>Olá, {loggedInUser}!</span>
                        <button style={logoutButtonStyle} onClick={handleLogout}>Sair</button>
                        {!isFuncionario && (
                            <Link to="/carrinho" style={{ textDecoration: 'none', color: 'rgb(52, 58, 64)', display:'flex', alignItems:'center' }}>
                                {shoppingCartIcon}
                            </Link>
                        )}
                    </>
                ) : (
                    <Link to="/login" style={loginButtonStyle}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
                    >Login</Link>
                )}
            </div>
        </nav>
    );
};

// --- Componente PedidoCardEntrega ---
const PedidoCardEntrega = ({ pedido, onMarcarEmRota, onMarcarEntregueRetirado }) => {
    const [hover, setHover] = useState(false);
    const cardStyle = { width: '100%', maxWidth: '380px',
        height: 'auto', minHeight: '420px', background: '#fff', borderRadius: '15px',
        boxShadow: hover ? '0 10px 25px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0', padding: '20px', display: 'flex',
        flexDirection: 'column', justifyContent: 'space-between',
        fontFamily: 'Arial, sans-serif', transition: 'all 0.3s ease', marginBottom: '20px' };
    const headerStyle = { fontSize: '1.2rem', fontWeight: 'bold', color: '#333', marginBottom: '10px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px'};
    const detailStyle = { fontSize: '0.95rem', color: '#555', marginBottom: '6px'};
    const itemsTitleStyle = { fontWeight: 'bold', marginTop: '10px', marginBottom: '5px', color: '#444'};
    const ulStyle = { listStyleType: 'none', paddingLeft: '0', maxHeight: '150px', overflowY: 'auto', marginBottom: '10px', fontSize: '0.9rem'};
    const liStyle = { marginBottom: '4px', display: 'flex', justifyContent: 'space-between'};
    const totalStyle = { fontWeight: 'bold', fontSize: '1.1rem', color: '#c0392b', marginTop: '10px', borderTop: '1px solid #f0f0f0', paddingTop: '10px', textAlign: 'right'};
    const buttonContainerStyle = { marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' };
    const actionButtonStyle = (bgColor = '#007bff', hoverBgColor = '#0056b3') => ({
        padding: '10px 15px', backgroundColor: bgColor, color: '#fff', border: 'none',
        borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
        transition: 'background-color 0.2s ease', width: '100%', fontSize: '0.95em',
    });

    return (
        <div style={cardStyle} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <div>
                <h3 style={headerStyle}>Pedido #{pedido.id} - {pedido.cliente}</h3>
                <p style={detailStyle}><strong>Status:</strong> {pedido.statusOriginal}</p>
                <p style={detailStyle}><strong>Tipo:</strong> {pedido.tipo_entrega}</p>
                {pedido.tipo_entrega === 'Entrega' && pedido.motoboyNome && (
                    <p style={detailStyle}><strong>Motoboy:</strong> {pedido.motoboyNome}</p>
                )}
                {pedido.tipo_entrega === 'Entrega' && pedido.deliveryAddress &&
                    <p style={detailStyle}><strong>Endereço:</strong> {pedido.deliveryAddress}</p>}
                <p style={detailStyle}><strong>Pagamento:</strong> {pedido.paymentMethod}</p>
                <p style={detailStyle}><strong>Horário do Pedido:</strong> {pedido.horario}</p>
                <h4 style={itemsTitleStyle}>Itens:</h4>
                <ul style={ulStyle}>
                    {pedido.produtos.map((p, i) => (
                        <li key={i} style={liStyle}><span>{p.split(' (R$')[0]}</span> <span>R$ {p.split(' (R$')[1]?.replace(')','')}</span></li>
                    ))}
                </ul>
                 <p style={totalStyle}>Total: R$ {pedido.total ? pedido.total.toFixed(2).replace('.', ',') : '0,00'}</p>
            </div>
            <div style={buttonContainerStyle}>
                {pedido.tipo_entrega === 'Entrega' && pedido.statusOriginal === 'Pronto para Entrega' && (
                    <button style={actionButtonStyle('#5cb85c', '#4cae4c')} onClick={() => onMarcarEmRota(pedido.id)}>
                        Marcar como "Em Rota"
                    </button>
                )}
                {pedido.statusOriginal === 'Em Rota' && (
                    <button style={actionButtonStyle('#f0ad4e', '#eea236')} onClick={() => onMarcarEntregueRetirado(pedido.id, 'Entrega')}>
                        Marcar como "Entregue"
                    </button>
                )}
                {pedido.tipo_entrega === 'Retirada' && pedido.statusOriginal === 'Retirada' && (
                    <button style={actionButtonStyle('#007bff', '#0056b3')} onClick={() => onMarcarEntregueRetirado(pedido.id, 'Retirada')}>
                        Marcar como "Retirado pelo Cliente"
                    </button>
                )}
            </div>
        </div>
    );
};

// --- Componente EntregaRetirada ---
const EntregaRetirada = () => {
    const [allFetchedPedidos, setAllFetchedPedidos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [isActionSuccessModalOpen, setIsActionSuccessModalOpen] = useState(false);
    const [actionSuccessMessage, setActionSuccessMessage] = useState('');

    const fetchRelevantPedidos = useCallback(async () => {
        setIsLoading(true);
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setError("Autenticação necessária.");
            setIsLoading(false);
            navigate('/login');
            return;
        }
        setError(null);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/pedidos/?status=Pronto para Entrega&status=Retirada&status=Em Rota', {
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: `Erro: ${response.statusText}` }));
                throw new Error(errorData.detail || `Erro HTTP ${response.status}`);
            }
            const data = await response.json();
            const pedidosFormatados = data.map(pedido => ({
                id: pedido.id,
                cliente: pedido.cliente_nome || `Cliente ID ${pedido.cliente}`,
                produtos: pedido.itens_pedido.map(item => {
                    const nomeProduto = item.produto_nome || "Item";
                    const precoUnitario = parseFloat(item.preco_unitario_momento) || 0;
                    const subtotalItem = parseFloat(item.subtotal_item) || (item.quantidade * precoUnitario);
                    return `${item.quantidade}x ${nomeProduto} (R$ ${subtotalItem.toFixed(2).replace('.',',')})`;
                }),
                horario: new Date(pedido.data_pedido).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                statusOriginal: pedido.status,
                total: parseFloat(pedido.total_pedido || 0),
                tipo_entrega: pedido.tipo_entrega,
                deliveryAddress: pedido.endereco_entrega_formatado || (pedido.tipo_entrega === 'Retirada' ? 'Retirada no Local' : 'Endereço não informado'),
                paymentMethod: pedido.forma_pagamento || 'Não informado',
                deliveryFee: parseFloat(pedido.taxa_entrega_aplicada || 0),
                motoboyNome: pedido.motoboy_nome || null
            }));
            setAllFetchedPedidos(pedidosFormatados);
        } catch (err) {
            setError(err.message || "Ocorreu um erro ao buscar os pedidos.");
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);


    useEffect(() => {
        fetchRelevantPedidos();
        const intervalId = setInterval(() => {
            fetchRelevantPedidos();
        }, 30000);
        return () => clearInterval(intervalId);
    }, [fetchRelevantPedidos]);

    const handleUpdateOrderStatus = async (pedidoId, novoStatus, successMessageForModal) => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            alert("Sessão expirada. Por favor, faça login novamente.");
            navigate('/login');
            return;
        }
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/pedidos/${pedidoId}/atualizar_status/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`},
                body: JSON.stringify({ status: novoStatus })
            });
            if (response.ok) {
                setActionSuccessMessage(successMessageForModal || `Pedido #${pedidoId} atualizado para "${novoStatus}"!`);
                setIsActionSuccessModalOpen(true);
                setAllFetchedPedidos((prevPedidos) => prevPedidos.filter((p) => p.id !== pedidoId));
            } else {
                const errorData = await response.json().catch(() => ({detail: "Erro ao processar a resposta do servidor."}));
                alert(`Erro ao atualizar status: ${errorData.detail || response.statusText}`);
            }
        } catch (error) {
            console.error("Erro de rede ao atualizar status:", error);
            alert("Erro de rede ao atualizar status. Verifique sua conexão.");
        }
    };

    const handleMarcarEmRota = (pedidoId) => handleUpdateOrderStatus(pedidoId, 'Em Rota', `Pedido #${pedidoId} marcado como "Em Rota"!`);
    const handleMarcarEntregueRetirado = (pedidoId, tipoAcao) => handleUpdateOrderStatus(pedidoId, 'Entregue', `Pedido #${pedidoId} marcado como "${tipoAcao === 'Retirada' ? 'Retirado pelo Cliente' : 'Entregue'}"!`);

    const handleCloseSuccessModal = () => {
        setIsActionSuccessModalOpen(false);
        setActionSuccessMessage('');
        fetchRelevantPedidos();
    };

    const pedidosProntosParaSair = allFetchedPedidos.filter(p => p.statusOriginal === 'Pronto para Entrega' || p.statusOriginal === 'Retirada');
    const pedidosEmRota = allFetchedPedidos.filter(p => p.statusOriginal === 'Em Rota');

    // Estilos
    const pageStyle = { backgroundColor: '#E9E9E9', minHeight: '100vh', paddingBottom: '2rem', display: 'flex', flexDirection: 'column' };
    const h2Style = { width: '100%', textAlign: 'center', marginTop: '3rem', marginBottom: '1rem', fontWeight: 700, fontSize: '2.5rem', color: '#333' };
    const twoColumnLayoutContainerStyle = { display: 'flex', flexDirection: 'row', gap: '2rem', width: '95%', maxWidth: '1400px', margin: '2rem auto', flexGrow: 1, };
    const columnStyle = { flex: 1, backgroundColor: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.075)', display: 'flex', flexDirection: 'column', alignItems: 'center', };
    const sectionSubTitleStyle = { width: '100%', textAlign: 'center', fontSize: '1.5em', color: '#333', marginBottom: '1.5rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem'};
    const cardsGridStyle = { display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', width: '100%' };
    const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, };
    const modalContentStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)', textAlign: 'center', maxWidth: '450px', width: '90%', position: 'relative' };
    const modalTitleStyle = { fontSize: '1.6em', marginBottom: '15px', color: '#333', fontWeight: '600' };
    const modalMessageStyle = { fontSize: '1.1em', marginBottom: '25px', color: '#555', lineHeight: '1.6', };
    const modalButtonStyle = { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '6px', cursor: 'pointer', fontSize: '1em', fontWeight: 'bold', transition: 'background-color 0.2s ease', minWidth: '100px' };


    if (isLoading && !isActionSuccessModalOpen) {
        return <div style={pageStyle}><Navbar /><div style={{textAlign: 'center', fontSize: '1.2em', marginTop: '50px'}}>Carregando pedidos...</div></div>;
    }
    if (error && !allFetchedPedidos.length && !isActionSuccessModalOpen) {
        return <div style={pageStyle}><Navbar /><div style={{textAlign: 'center', color: 'red', fontSize: '1.2em', marginTop: '50px'}}>Erro: {error}</div></div>;
    }

    return (
        <div style={pageStyle}>
            <Navbar />
            <h2 style={h2Style}>Gerenciamento de Entregas e Retiradas</h2>

            <div style={twoColumnLayoutContainerStyle}>
                <div style={columnStyle}>
                    <h3 style={sectionSubTitleStyle}>Prontos para Envio / Retirada</h3>
                    <div style={cardsGridStyle}>
                        {pedidosProntosParaSair.length === 0 ? (
                            <p style={{ fontSize: '1.1rem', color: '#555', textAlign:'center', width: '100%' }}>Nenhum pedido pronto para entrega ou retirada.</p>
                        ) : (
                            pedidosProntosParaSair.map((pedido) => (
                                <PedidoCardEntrega
                                    key={pedido.id}
                                    pedido={pedido}
                                    onMarcarEmRota={handleMarcarEmRota}
                                    onMarcarEntregueRetirado={handleMarcarEntregueRetirado}
                                />
                            ))
                        )}
                    </div>
                </div>

                <div style={columnStyle}>
                    <h3 style={sectionSubTitleStyle}>Pedidos em Trânsito</h3>
                    <div style={cardsGridStyle}>
                        {pedidosEmRota.length === 0 ? (
                            <p style={{ fontSize: '1.1rem', color: '#555', textAlign:'center', width: '100%' }}>Nenhum pedido em rota no momento.</p>
                        ) : (
                            pedidosEmRota.map((pedido) => (
                                <PedidoCardEntrega
                                    key={pedido.id}
                                    pedido={pedido}
                                    onMarcarEmRota={handleMarcarEmRota}
                                    onMarcarEntregueRetirado={handleMarcarEntregueRetirado}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {isActionSuccessModalOpen && (
                <div style={modalOverlayStyle} onClick={handleCloseSuccessModal}>
                    <div style={modalContentStyle}
                         onClick={(e) => e.stopPropagation()}>
                        <h3 style={modalTitleStyle}>Status Atualizado!</h3>
                        <p style={modalMessageStyle}>{actionSuccessMessage}</p>
                        <button
                            style={modalButtonStyle}
                            onClick={handleCloseSuccessModal}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EntregaRetirada;