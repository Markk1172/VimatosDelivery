import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/img/logo.png';

const shoppingCartIcon = ( <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg"> <g transform="translate(6.8,6.8)"> <circle cx="5" cy="17" r="1.5" fill="rgb(52, 58, 64)"/><circle cx="14" cy="17" r="1.5" fill="rgb(52, 58, 64)"/><path d="M-1 0H1L2.68 12.39C2.84 13.66 3.91 14.67 5.19 14.67H14.5C15.78 14.67 16.85 13.66 17.01 12.39L17.82 5.39C17.93 4.47 17.21 3.67 16.28 3.67H3.12" stroke="rgb(52, 58, 64)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </g> </svg> );
const userIcon = ( <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg"> <g> <circle cx="16" cy="13" r="5" fill="rgb(52, 58, 64)" /> <path d="M8 25c0-4 4-7 8-7s8 3 8 7" fill="rgb(52, 58, 64)" /> </g> </svg> );

const InternalNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [homeHover, setHomeHover] = useState(false);
    const [cardapioHover, setCardapioHover] = useState(false);

    useEffect(() => {
        const checkLoginStatus = () => {
            const userName = localStorage.getItem('userName');
            if (userName) setLoggedInUser(userName);
            else setLoggedInUser(null);
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
        localStorage.removeItem('clienteId');
        setLoggedInUser(null);
        navigate('/login');
    };
    const navbarStyle = { backgroundColor: 'rgb(248, 249, 250)', borderBottom: '1px solid #dee2e6', padding: '1rem 3rem', position: 'sticky', top: 0, zIndex: 1040, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Arial, sans-serif' };
    const brandStyle = { fontWeight: 700, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '7px', textDecoration: 'none', color: 'rgb(52, 58, 64)' };
    const navLinksContainerStyle = { display: 'flex', gap: '2rem', flexGrow: 1, justifyContent: 'center' };
    const getNavLinkStyle = (path, isHovered) => ({ color: isHovered || location.pathname === path ? '#cf301d' : 'rgb(52, 58, 64)', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s ease-in-out', fontSize: '1rem' });
    const authIconsContainerStyle = { display: 'flex', alignItems: 'center', gap: '15px' };
    const dropdownButtonStyle = { background: "transparent", border: "none", fontWeight: "normal", boxShadow: "none", textTransform: "none", padding: '0', color: 'rgb(52, 58, 64)', backgroundImage: 'none', outline: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, cursor: 'pointer' };

    return (
        <nav style={navbarStyle}>
            <div style={brandStyle}>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={logo} alt="Logo" style={{ height: 40, width: 'auto' }} />
                </Link>
            </div>
            <div style={navLinksContainerStyle}>
                <Link to="/" style={getNavLinkStyle('/', homeHover)} onMouseEnter={() => setHomeHover(true)} onMouseLeave={() => setHomeHover(false)}>HOME</Link>
                <Link to="/cardapio" style={getNavLinkStyle('/cardapio', cardapioHover)} onMouseEnter={() => setCardapioHover(true)} onMouseLeave={() => setCardapioHover(false)}>CARDÁPIO</Link>
            </div>
            <div style={authIconsContainerStyle}>
                {loggedInUser ? (
                    <>
                        <div className="dropdown">
                            <button className="btn dropdown-toggle" type="button" id="dropdownUsuario" data-bs-toggle="dropdown" aria-expanded="false" style={dropdownButtonStyle}>
                                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>{userIcon}</span>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownUsuario">
                                <h6 className="dropdown-header">Olá, {loggedInUser}!</h6>
                                <li><Link className="dropdown-item" to="/profile/edit">Meu Perfil</Link></li>
                                <li><Link className="dropdown-item" to="/pedidos">Meus Pedidos</Link></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><button className="dropdown-item" onClick={handleLogout}>Sair</button></li>
                            </ul>
                        </div>
                        <Link to="/carrinho" style={{ textDecoration: 'none', color: 'rgb(52, 58, 64)', position: 'relative', top: '2px' }}>{shoppingCartIcon}</Link>
                    </>
                ) : ( <Link to="/login" style={{ textDecoration: 'none', fontWeight: '600', color: 'rgb(52, 58, 64)' }}>Login</Link> )}
            </div>
        </nav>
    );
};

export default function MeusPedidos() {
    const navigate = useNavigate();

    const [ongoingOrders, setOngoingOrders] = useState([]);
    const [orderHistory, setOrderHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [orderToCancelId, setOrderToCancelId] = useState(null);
    const [cancelErrorMessage, setCancelErrorMessage] = useState('');

    const fetchOrders = useCallback(async () => {
        const accessToken = localStorage.getItem('accessToken');
        const clienteId = localStorage.getItem('clienteId');

        if (!accessToken || !clienteId) {
            setError("Autenticação necessária para ver os pedidos.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/pedidos/', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.detail || `Erro ao buscar pedidos: ${response.statusText}`);
            }

            const data = await response.json();
            const ongoingStatuses = ['Pendente', 'Recebido', 'Em Preparo', 'Pronto para Entrega', 'Em Rota', 'Retirada'];
            const currentOngoing = [];
            const currentHistory = [];

            data.forEach(pedido => {
                const formattedPedido = {
                    id: pedido.id,
                    dateObject: new Date(pedido.data_pedido),
                    date: new Date(pedido.data_pedido).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'}),
                    status: pedido.status,
                    total: parseFloat(pedido.total_pedido),
                    items: pedido.itens_pedido.map(item => ({
                        name: item.produto_nome,
                        quantity: item.quantidade,
                        price: parseFloat(item.preco_unitario_momento)
                    })),
                    deliveryAddress: pedido.endereco_entrega_formatado || 'Retirada no local',
                    paymentMethod: pedido.forma_pagamento,
                    deliveryFee: parseFloat(pedido.taxa_entrega_aplicada || 0),
                    motoboyName: pedido.motoboy_nome || null
                };

                if (ongoingStatuses.includes(pedido.status)) {
                    currentOngoing.push(formattedPedido);
                } else {
                    currentHistory.push(formattedPedido);
                }
            });

            currentOngoing.sort((a, b) => b.dateObject - a.dateObject);
            currentHistory.sort((a, b) => b.dateObject - a.dateObject);


            setOngoingOrders(currentOngoing);
            setOrderHistory(currentHistory);

        } catch (err) {
            setError(err.message || "Ocorreu um erro ao buscar seus pedidos.");
            console.error("Erro fetchOrders:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);


    const handleOpenCancelModal = (orderId, orderStatus, orderDateObject) => {
        const cancellableStatuses = ['Pendente', 'Recebido', 'Em Preparo'];
        if (!cancellableStatuses.includes(orderStatus)) {
            setCancelErrorMessage(`Este pedido (${orderStatus}) não pode mais ser cancelado.`);
            setIsCancelModalOpen(true);
            setOrderToCancelId(null);
            return;
        }

        setOrderToCancelId(orderId);
        setIsCancelModalOpen(true);
        setCancelErrorMessage('');
    };

    const executeCancelOrder = async () => {
        if (!orderToCancelId) return;

        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setCancelErrorMessage("Sessão expirada. Faça login novamente.");
            setIsCancelModalOpen(true);
            setOrderToCancelId(null);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/pedidos/${orderToCancelId}/cancelar/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
            });

            if (response.ok) {
                fetchOrders();
                setIsCancelModalOpen(false);
                setOrderToCancelId(null);
            } else {
                const errorData = await response.json();
                setCancelErrorMessage(`Erro ao cancelar pedido: ${errorData.detail || response.statusText}`);
                setIsCancelModalOpen(true);
                setOrderToCancelId(null);
            }
        } catch (error) {
            console.error("Erro de rede ao cancelar pedido:", error);
            setCancelErrorMessage("Erro de rede ao tentar cancelar o pedido. Tente novamente.");
            setIsCancelModalOpen(true);
            setOrderToCancelId(null);
        } finally {
            setIsLoading(false);
        }
    };

    const pageContainerStyle = { minHeight: '100vh', margin: 0, padding: 0, backgroundColor: '#E9E9E9', fontFamily: 'Raleway, sans-serif', display: 'flex', flexDirection: 'column', };
    const contentWrapperStyle = { flexGrow: 1, marginBottom: '2rem', width: '80%', maxWidth: '900px', margin: '50px auto 2rem auto', };
    const sectionTitleStyle = { color: '#cf301d', fontSize: '2em', marginBottom: '25px', textAlign: 'center', fontWeight: '700', borderBottom: '2px solid #cf301d', paddingBottom: '10px', };
    const orderBoxStyle = { backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)', marginBottom: '30px', padding: '25px', };
    const orderHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px', flexWrap: 'wrap', gap: '10px', };
    const orderIdDateStyle = { margin: 0, fontSize: '1.2em', color: '#343a40', fontWeight: 'bold', };
    const orderStatusStyle = (status) => ({ padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9em', color: '#fff', backgroundColor: ['Em Preparo', 'Recebido', 'Pendente'].includes(status) ? '#ffc107' : ['Em Rota', 'Pronto para Entrega', 'Retirada'].includes(status) ? '#007bff' : status === 'Entregue' ? '#28a745' : status === 'Cancelado' ? '#dc3545' : '#6c757d', });
    const orderDetailsStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', marginBottom: '20px', fontSize: '0.95em', color: '#555', };
    const detailItemStyle = { display: 'flex', flexDirection: 'column', };
    const detailLabelStyle = { fontWeight: 'bold', color: '#343a40', marginBottom: '3px', };
    const itemsListStyle = { listStyle: 'none', padding: 0, margin: '0 0 15px 0', borderTop: '1px dashed #eee', paddingTop: '15px', };
    const itemDetailStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#666', };
    const itemQuantityNameStyle = { flex: 3, };
    const itemPriceStyle = { flex: 1, textAlign: 'right', fontWeight: 'bold', };
    const orderTotalStyle = { borderTop: '2px solid #eee', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '1.1em', color: '#343a40', };
    const cancelButtonContainerStyle = { marginTop: '15px', textAlign: 'right', };
    const cancelButton = { backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9em', fontWeight: 'bold', transition: 'background-color 0.2s ease', };
    const cancelButtonHover = { backgroundColor: '#c82333' };
    const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, };
    const modalContentStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)', textAlign: 'center', maxWidth: '400px', width: '90%', position: 'relative', };
    const modalTitleStyle = { fontSize: '1.5em', marginBottom: '15px', color: '#343a40', };
    const modalMessageStyle = { fontSize: '1em', marginBottom: '25px', color: '#6c757d', lineHeight: '1.5', };
    const buttonContainerStyle = { display: 'flex', justifyContent: 'center', gap: '15px', };
    const confirmButtonStyle = { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '1em', fontWeight: 'bold', transition: 'background-color 0.2s ease', };
    const cancelModalButtonStyle = { backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '1em', fontWeight: 'bold', transition: 'background-color 0.2s ease', };
    const confirmButtonHoverStyle = { backgroundColor: '#c82333' };
    const cancelModalButtonHoverStyle = { backgroundColor: '#5a6268' };

    if (isLoading && !isCancelModalOpen) {
        return (
            <div style={pageContainerStyle}>
                <InternalNavbar />
                <div style={{...contentWrapperStyle, textAlign: 'center', paddingTop: '100px'}}>Carregando seus pedidos...</div>
            </div>
        );
    }

    if (error && !isCancelModalOpen) {
        return (
            <div style={pageContainerStyle}>
                <InternalNavbar />
                <div style={{...contentWrapperStyle, textAlign: 'center', paddingTop: '100px', color: 'red'}}>
                    Erro ao carregar pedidos: {error}
                </div>
            </div>
        );
    }

    const renderOrder = (order, isOngoing) => {
        const canCancel = isOngoing && ['Pendente', 'Recebido', 'Em Preparo'].includes(order.status);

        return (
            <div key={order.id} style={orderBoxStyle}>
                <div style={orderHeaderStyle}>
                    <p style={orderIdDateStyle}>Pedido #{order.id} - {order.date}</p>
                    <span style={orderStatusStyle(order.status)}>{order.status}</span>
                </div>
                <div style={orderDetailsStyle}>
                    <div style={detailItemStyle}><span style={detailLabelStyle}>Endereço:</span><span>{order.deliveryAddress}</span></div>
                    <div style={detailItemStyle}><span style={detailLabelStyle}>Pagamento:</span><span>{order.paymentMethod}</span></div>
                    {order.motoboyName && (
                        <div style={detailItemStyle}>
                            <span style={detailLabelStyle}>Entregador:</span>
                            <span>{order.motoboyName}</span>
                        </div>
                    )}
                </div>
                <ul style={itemsListStyle}>
                    <span style={detailLabelStyle}>Itens:</span>
                    {order.items.map((item, index) => (
                        <li key={index} style={itemDetailStyle}>
                            <span style={itemQuantityNameStyle}>{item.quantity}x {item.name}</span>
                            <span style={itemPriceStyle}>R${item.price.toFixed(2).replace('.', ',')}</span>
                        </li>
                    ))}
                    {order.deliveryFee > 0 && (
                        <li style={{...itemDetailStyle, marginTop: '10px', borderTop: '1px dashed #eee', paddingTop: '5px'}}>
                            <span style={itemQuantityNameStyle}>Taxa de Entrega</span>
                            <span style={itemPriceStyle}>R${order.deliveryFee.toFixed(2).replace('.',',')}</span>
                        </li>
                    )}
                </ul>
                <div style={orderTotalStyle}>
                    <span>Total do Pedido:</span>
                    <span>R${order.total.toFixed(2).replace('.', ',')}</span>
                </div>
                {canCancel && (
                    <div style={cancelButtonContainerStyle}>
                        <button
                            onClick={() => handleOpenCancelModal(order.id, order.status, order.dateObject)}
                            style={cancelButton}
                            onMouseEnter={(e) => e.target.style.backgroundColor = cancelButtonHover.backgroundColor}
                            onMouseLeave={(e) => e.target.style.backgroundColor = cancelButton.backgroundColor}
                        >
                            Cancelar Pedido
                        </button>
                    </div>
                )}
            </div>
        );
    };


    return (
        <div style={pageContainerStyle}>
            <InternalNavbar />
            <div style={contentWrapperStyle}>
                <h2 style={sectionTitleStyle}>Meus Pedidos</h2>

                <h3 style={{ ...sectionTitleStyle, fontSize: '1.5em', borderBottom: '1px solid #ddd', marginTop: '0px', color: '#555' }}>
                    Em Andamento
                </h3>
                {ongoingOrders.length === 0 && !isLoading ? (
                    <p style={{ textAlign: 'center', color: '#777', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        Você não tem pedidos em andamento. <Link to="/cardapio">Peça agora!</Link>
                    </p>
                ) : (
                    ongoingOrders.map(order => renderOrder(order, true))
                )}

                <h3 style={{ ...sectionTitleStyle, fontSize: '1.5em', borderBottom: '1px solid #ddd', marginTop: '40px', color: '#555' }}>
                    Histórico de Pedidos
                </h3>
                {orderHistory.length === 0 && !isLoading ? (
                    <p style={{ textAlign: 'center', color: '#777', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        Você ainda não tem pedidos no seu histórico.
                    </p>
                ) : (
                    orderHistory.map(order => renderOrder(order, false))
                )}
                 {isLoading && (ongoingOrders.length === 0 && orderHistory.length === 0) && (
                    <p style={{ textAlign: 'center', color: '#777', padding: '20px'}}>Carregando pedidos...</p>
                )}
            </div>

            {isCancelModalOpen && (
                <div style={modalOverlayStyle} onClick={() => { setIsCancelModalOpen(false); setCancelErrorMessage(''); setOrderToCancelId(null); }}>
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        <h3 style={modalTitleStyle}>{cancelErrorMessage ? 'Atenção!' : 'Confirmar Cancelamento'}</h3>
                        <p style={modalMessageStyle}>{cancelErrorMessage || `Tem certeza que deseja cancelar o pedido #${orderToCancelId}? Esta ação não pode ser desfeita.`}</p>
                        <div style={buttonContainerStyle}>
                            {!cancelErrorMessage && (
                                <button
                                    style={confirmButtonStyle}
                                    onClick={executeCancelOrder}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = confirmButtonHoverStyle.backgroundColor}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = confirmButtonStyle.backgroundColor}
                                >
                                    Sim, Cancelar
                                </button>
                            )}
                            <button
                                style={cancelModalButtonStyle}
                                onClick={() => { setIsCancelModalOpen(false); setCancelErrorMessage(''); setOrderToCancelId(null);}}
                                onMouseEnter={(e) => e.target.style.backgroundColor = cancelModalButtonHoverStyle.backgroundColor}
                                onMouseLeave={(e) => e.target.style.backgroundColor = cancelModalButtonStyle.backgroundColor}
                            >
                                {cancelErrorMessage ? 'Entendi' : 'Não, Manter Pedido'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}