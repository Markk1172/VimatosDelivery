import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/img/logo.png';

// --- SVGs de Ícones (copiados do Cardapio.jsx e CarrinhoDeCompras.jsx) ---
const shoppingCartIcon = (
    <svg
      width="28"
      height="28"
      viewBox="0 0 32 32"
      fill="none"
      style={{ verticalAlign: 'middle' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(6.8,6.8)">
        <circle cx="5" cy="17" r="1.5" fill="rgb(52, 58, 64)"/>
        <circle cx="14" cy="17" r="1.5" fill="rgb(52, 58, 64)"/>
        <path
          d="M-1 0H1L2.68 12.39C2.84 13.66 3.91 14.67 5.19 14.67H14.5C15.78 14.67 16.85 13.66 17.01 12.39L17.82 5.39C17.93 4.47 17.21 3.67 16.28 3.67H3.12"
          stroke="rgb(52, 58, 64)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
);

const userIcon = (
    <svg
      width="28"
      height="28"
      viewBox="0 0 32 32"
      fill="none"
      style={{ verticalAlign: 'middle' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <circle cx="16" cy="13" r="5" fill="rgb(52, 58, 64)" />
        <path d="M8 25c0-4 4-7 8-7s8 3 8 7" fill="rgb(52, 58, 64)" />
      </g>
    </svg>
);

// Definindo a Navbar como um componente interno neste arquivo
const InternalNavbar = () => {
    const navigate = useNavigate();
    const [loggedInUser, setLoggedInUser] = useState(null);

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
        localStorage.removeItem('clienteId');
        setLoggedInUser(null);
        navigate('/login');
    };

    // --- Estilos da Navbar (copiados do Cardapio.jsx) ---
    const navbarStyle = {
        backgroundColor: 'rgb(248, 249, 250)',
        borderBottom: '1px solid #dee2e6',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
        justifyContent: 'space-between',
    };

    const brandStyle = {
        fontWeight: 700,
        fontSize: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: 'rgb(52, 58, 64)',
    };

    // Estilos dos links de navegação simplificados
    const navLinksContainerStyle = {
        display: 'flex',
        gap: '4rem',
        flexGrow: 1,
        justifyContent: 'center',
    };

    const location = useLocation();
    const [hoveredLink, setHoveredLink] = useState(null);
    
    const getLinkStyle = (path, isHovered) => ({
        color:
            isHovered || location.pathname === path
            ? '#cf301d'
            : '#343a40',
        textDecoration: 'none',
        fontWeight: 600,
        transition: 'color 0.2s ease-in-out',
        fontSize: '1rem',
        });

    // Ícones de Autenticação/Carrinho
    const authIconsContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    };

    return (
        <nav style={navbarStyle}>
            <div style={brandStyle}>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={logo} alt="Logo" style={{ height: 40, width: 'auto' }} />
                </Link>
            </div>

            {/* Links de navegação simplificados: Home e Cadastros */}
            <div style={navLinksContainerStyle}>
                <Link
                    to="/"
                    style={getLinkStyle('/', hoveredLink === '/')}
                    onMouseEnter={() => setHoveredLink('/')}
                    onMouseLeave={() => setHoveredLink(null)}
                >
                    HOME
                </Link>
                <Link
                    to="/cardapio"
                    style={getLinkStyle('/cardapio', hoveredLink === '/cardapio')}
                    onMouseEnter={() => setHoveredLink('/cardapio')}
                    onMouseLeave={() => setHoveredLink(null)}
                >
                    CARDÁPIO
                </Link>
            </div>

            {/* Ícones de Usuário e Carrinho / Botão de Login */}
            <div style={authIconsContainerStyle}>
                {loggedInUser ? (
                    <>
                        {/* Ícone de Usuário (Dropdown) */}
                        <div className="dropdown">
                            <button
                                className="btn btn-secondary dropdown-toggle"
                                type="button"
                                id="dropdownUsuario"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    fontWeight: "normal",
                                    boxShadow: "none",
                                    textTransform: "none",
                                    padding: '0'
                                }}
                            >
                                <span style={{ display: "flex", alignItems: "center", gap: "8px", position: "relative", top: "-4px" }}>
                                    {userIcon}
                                </span>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownUsuario">
                                <h6 className="dropdown-header">Olá, {loggedInUser}!</h6>
                                <li><Link className="dropdown-item" to="/profile/edit">Meu Perfil</Link></li>
                                <li><Link className="dropdown-item" to="/pedidos">Meus Pedidos</Link></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><button className="dropdown-item" onClick={handleLogout}>Sair</button></li>
                            </ul>
                        </div>
                        {/* Ícone de Carrinho de Compras */}
                        <Link to="/carrinho" style={{ textDecoration: 'none', color: 'rgb(52, 58, 64)', marginBottom: '8px' }}>
                            {shoppingCartIcon}
                        </Link>
                    </>
                ) : (
                    <Link
                        to="/login"
                        style={{
                            textDecoration: 'none',
                            fontWeight: '600',
                            color: 'rgb(52, 58, 64)',
                        }}
                    >
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
};
// --- END: Navbar Component Integrated ---


// MeusPedidos Component
export default function MeusPedidos() {
    // Simulated data for orders
    const [ongoingOrders, setOngoingOrders] = useState([
        {
            id: 'ORD001',
            // Use current date for testing "5 minutes"
            date: new Date().toISOString().slice(0, 19).replace('T', ' '), // "YYYY-MM-DD HH:MM:SS"
            status: 'Em Preparação',
            total: 45.50,
            items: [
                { name: 'Pizza Calabresa', quantity: 1, price: 30.00 },
                { name: 'Coca-Cola 350ml', quantity: 2, price: 7.50 }
            ],
            deliveryAddress: 'Rua Principal, 123, Bairro Centro, São Paulo/SP',
            paymentMethod: 'Cartão de Crédito',
            deliveryFee: 5.00
        },
        {
            id: 'ORD002',
            date: new Date(Date.now() - 6 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), // 6 minutes ago
            status: 'A caminho',
            total: 25.00,
            items: [
                { name: 'Sanduíche Natural', quantity: 1, price: 20.00 }
            ],
            deliveryAddress: 'Av. Secundária, 456, Bairro Periferia, Rio de Janeiro/RJ',
            paymentMethod: 'Pix',
            deliveryFee: 5.00
        }
    ]);

    const [orderHistory, setOrderHistory] = useState([
        {
            id: 'ORD2024-01-01',
            date: '2024-01-15 10:00',
            status: 'Entregue',
            total: 60.00,
            items: [
                { name: 'Hambúrguer Clássico', quantity: 2, price: 25.00 },
                { name: 'Batata Frita G', quantity: 1, price: 10.00 }
            ],
            deliveryAddress: 'Rua do Histórico, 789, Bairro Antigo, Belo Horizonte/MG',
            paymentMethod: 'Dinheiro',
            deliveryFee: 5.00
        },
        {
            id: 'ORD2024-02-05',
            date: '2024-02-20 18:45',
            status: 'Cancelado',
            total: 35.00,
            items: [
                { name: 'Salada Caesar', quantity: 1, price: 35.00 }
            ],
            deliveryAddress: 'Rua do Cancelado, 101, Bairro Triste, Porto Alegre/RS',
            paymentMethod: 'Cartão de Débito',
            deliveryFee: 0.00 // No delivery fee for cancelled
        }
    ]);

    // --- New states for modal control ---
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [orderToCancelId, setOrderToCancelId] = useState(null);
    const [cancelErrorMessage, setCancelErrorMessage] = useState('');


    // Function to open the cancel modal
    const handleOpenCancelModal = (orderId, orderDateStr, orderStatus) => {
        const orderDate = new Date(orderDateStr);
        const currentTime = new Date();
        const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

        if (orderStatus !== 'Em Preparação') {
            setCancelErrorMessage('Este pedido não pode ser cancelado pois não está no status "Em Preparação".');
            setIsCancelModalOpen(true); // Open modal with error message
            setOrderToCancelId(null); // No specific order to cancel, just showing info
            return;
        }

        if (currentTime.getTime() - orderDate.getTime() > fiveMinutes) {
            setCancelErrorMessage('O prazo de 5 minutos para cancelamento já expirou.');
            setIsCancelModalOpen(true); // Open modal with error message
            setOrderToCancelId(null); // No specific order to cancel, just showing info
            return;
        }

        // If checks pass, set order ID and open the modal for confirmation
        setOrderToCancelId(orderId);
        setIsCancelModalOpen(true);
        setCancelErrorMessage(''); // Clear any previous error messages
    };

    // Function to execute the cancellation after modal confirmation
    const executeCancelOrder = () => {
        setIsCancelModalOpen(false); // Close the modal first

        if (!orderToCancelId) {
            // This means the modal was opened to show an error, not for confirmation
            return;
        }

        setOngoingOrders(prevOngoingOrders => {
            const orderToCancel = prevOngoingOrders.find(order => order.id === orderToCancelId);
            if (!orderToCancel) return prevOngoingOrders;

            // This time check is a safeguard, the main check is in handleOpenCancelModal
            const orderDate = new Date(orderToCancel.date);
            const currentTime = new Date();
            const fiveMinutes = 5 * 60 * 1000;

            if (currentTime.getTime() - orderDate.getTime() <= fiveMinutes && orderToCancel.status === 'Em Preparação') {
                const updatedOngoingOrders = prevOngoingOrders.filter(order => order.id !== orderToCancelId);
                const canceledOrder = { ...orderToCancel, status: 'Cancelado' };

                setOrderHistory(prevOrderHistory => [canceledOrder, ...prevOrderHistory]);
                // In a real app, you'd send this cancellation to your backend here
                alert(`Pedido #${orderToCancelId} cancelado com sucesso!`); // Replace with a more sophisticated notification
                return updatedOngoingOrders;
            } else {
                alert('Não foi possível cancelar o pedido. O prazo ou status não permitem o cancelamento.'); // Fallback alert
                return prevOngoingOrders;
            }
        });
        setOrderToCancelId(null); // Reset the order ID after processing
    };


    // --- Estilos do Componente MeusPedidos ---
    const pageContainerStyle = {
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        backgroundColor: '#E9E9E9',
        fontFamily: 'Raleway, sans-serif',
        display: 'flex',
        flexDirection: 'column',
    };

    const contentWrapperStyle = {
        flexGrow: 1,
        marginBottom: '2rem',
        width: '80%', // Make it wider for order details
        maxWidth: '900px', // Max width for readability
        margin: '50px auto 2rem auto', // Center the content
    };

    const sectionTitleStyle = {
        color: '#cf301d',
        fontSize: '2em',
        marginBottom: '25px',
        textAlign: 'center',
        fontWeight: '700',
        borderBottom: '2px solid #cf301d',
        paddingBottom: '10px',
    };

    const orderBoxStyle = {
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
        marginBottom: '30px',
        padding: '25px',
    };

    const orderHeaderStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #eee',
        paddingBottom: '15px',
        marginBottom: '15px',
        flexWrap: 'wrap', // Allow wrapping for smaller screens
        gap: '10px', // Space between items
    };

    const orderIdDateStyle = {
        margin: 0,
        fontSize: '1.2em',
        color: '#343a40',
        fontWeight: 'bold',
    };

    const orderStatusStyle = (status) => ({
        padding: '5px 12px',
        borderRadius: '20px',
        fontWeight: 'bold',
        fontSize: '0.9em',
        color: '#fff',
        backgroundColor:
            status === 'Em Preparação' ? '#ffc107' : // Yellow
            status === 'A caminho' ? '#007bff' :    // Blue
            status === 'Entregue' ? '#28a745' :     // Green
            status === 'Cancelado' ? '#dc3545' :    // Red
            '#6c757d', // Grey for unknown
    });

    const orderDetailsStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px 20px', // Row and column gap
        marginBottom: '20px',
        fontSize: '0.95em',
        color: '#555',
    };

    const detailItemStyle = {
        display: 'flex',
        flexDirection: 'column',
    };

    const detailLabelStyle = {
        fontWeight: 'bold',
        color: '#343a40',
        marginBottom: '3px',
    };

    const itemsListStyle = {
        listStyle: 'none',
        padding: 0,
        margin: '0 0 15px 0',
        borderTop: '1px dashed #eee',
        paddingTop: '15px',
    };

    const itemDetailStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '5px',
        color: '#666',
    };

    const itemQuantityNameStyle = {
        flex: 3,
    };

    const itemPriceStyle = {
        flex: 1,
        textAlign: 'right',
        fontWeight: 'bold',
    };

    const orderTotalStyle = {
        borderTop: '2px solid #eee',
        paddingTop: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontWeight: 'bold',
        fontSize: '1.1em',
        color: '#343a40',
    };

    const cancelButtonContainerStyle = {
        marginTop: '15px',
        textAlign: 'right', // Align button to the right
    };

    const cancelButton = {
        backgroundColor: '#dc3545', // Red for cancel
        color: '#fff',
        border: 'none',
        padding: '8px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '0.9em',
        fontWeight: 'bold',
        transition: 'background-color 0.2s ease',
    };

    const cancelButtonHover = {
        backgroundColor: '#c82333', // Darker red on hover
    };

    // --- Styles for the embedded ConfirmModal ---
    const modalOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
    };

    const modalContentStyle = {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%',
        position: 'relative',
        animation: 'fadeIn 0.3s ease-out',
    };

    const modalTitleStyle = {
        fontSize: '1.5em',
        marginBottom: '15px',
        color: '#343a40',
    };

    const modalMessageStyle = {
        fontSize: '1em',
        marginBottom: '25px',
        color: '#6c757d',
        lineHeight: '1.5',
    };

    const buttonContainerStyle = {
        display: 'flex',
        justifyContent: 'center',
        gap: '15px',
    };

    const confirmButtonStyle = {
        backgroundColor: '#dc3545', // Red for destructive action
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1em',
        fontWeight: 'bold',
        transition: 'background-color 0.2s ease',
    };

    const cancelModalButtonStyle = { // Renamed to avoid conflict with `cancelButton` for order
        backgroundColor: '#6c757d', // Grey for cancel
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1em',
        fontWeight: 'bold',
        transition: 'background-color 0.2s ease',
    };

    const confirmButtonHoverStyle = { backgroundColor: '#c82333' };
    const cancelModalButtonHoverStyle = { backgroundColor: '#5a6268' };


    return (
        <div style={pageContainerStyle}>
            <InternalNavbar />

            <div style={contentWrapperStyle}>
                <h2 style={sectionTitleStyle}>Meus Pedidos</h2>

                {/* Pedidos em Andamento */}
                <h3 style={{ ...sectionTitleStyle, fontSize: '1.5em', borderBottom: '1px solid #ddd' }}>
                    Pedidos em Andamento
                </h3>
                {ongoingOrders.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#777', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        Você não tem pedidos em andamento no momento.
                    </p>
                ) : (
                    ongoingOrders.map(order => {
                        const orderDate = new Date(order.date);
                        const currentTime = new Date();
                        const timeElapsed = currentTime.getTime() - orderDate.getTime();
                        const canShowButton = timeElapsed <= (5 * 60 * 1000) && order.status === 'Em Preparação';

                        return (
                            <div key={order.id} style={orderBoxStyle}>
                                <div style={orderHeaderStyle}>
                                    <p style={orderIdDateStyle}>Pedido #{order.id} - {order.date}</p>
                                    <span style={orderStatusStyle(order.status)}>{order.status}</span>
                                </div>
                                <div style={orderDetailsStyle}>
                                    <div style={detailItemStyle}>
                                        <span style={detailLabelStyle}>Endereço de Entrega:</span>
                                        <span>{order.deliveryAddress}</span>
                                    </div>
                                    <div style={detailItemStyle}>
                                        <span style={detailLabelStyle}>Método de Pagamento:</span>
                                        <span>{order.paymentMethod}</span>
                                    </div>
                                </div>
                                <ul style={itemsListStyle}>
                                    <span style={detailLabelStyle}>Itens:</span>
                                    {order.items.map((item, index) => (
                                        <li key={index} style={itemDetailStyle}>
                                            <span style={itemQuantityNameStyle}>{item.quantity}x {item.name}</span>
                                            <span style={itemPriceStyle}>R${item.price.toFixed(2).replace('.', ',')}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div style={orderTotalStyle}>
                                    <span>Total do Pedido:</span>
                                    <span>R${order.total.toFixed(2).replace('.', ',')}</span>
                                </div>
                                {canShowButton && (
                                    <div style={cancelButtonContainerStyle}>
                                        <button
                                            onClick={() => handleOpenCancelModal(order.id, order.date, order.status)}
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
                    })
                )}

                {/* Histórico de Pedidos */}
                <h3 style={{ ...sectionTitleStyle, fontSize: '1.5em', borderBottom: '1px solid #ddd', marginTop: '40px' }}>
                    Histórico de Pedidos
                </h3>
                {orderHistory.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#777', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        Você não tem pedidos no seu histórico.
                    </p>
                ) : (
                    orderHistory.map(order => (
                        <div key={order.id} style={orderBoxStyle}>
                            <div style={orderHeaderStyle}>
                                <p style={orderIdDateStyle}>Pedido #{order.id} - {order.date}</p>
                                <span style={orderStatusStyle(order.status)}>{order.status}</span>
                            </div>
                            <div style={orderDetailsStyle}>
                                <div style={detailItemStyle}>
                                    <span style={detailLabelStyle}>Endereço de Entrega:</span>
                                    <span>{order.deliveryAddress}</span>
                                </div>
                                <div style={detailItemStyle}>
                                    <span style={detailLabelStyle}>Método de Pagamento:</span>
                                    <span>{order.paymentMethod}</span>
                                </div>
                            </div>
                            <ul style={itemsListStyle}>
                                <span style={detailLabelStyle}>Itens:</span>
                                {order.items.map((item, index) => (
                                    <li key={index} style={itemDetailStyle}>
                                        <span style={itemQuantityNameStyle}>{item.quantity}x {item.name}</span>
                                        <span style={itemPriceStyle}>R${item.price.toFixed(2).replace('.', ',')}</span>
                                    </li>
                                ))}
                            </ul>
                            <div style={orderTotalStyle}>
                                <span>Total do Pedido:</span>
                                <span>R${order.total.toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Embedded ConfirmModal */}
            {isCancelModalOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={modalTitleStyle}>{cancelErrorMessage ? 'Atenção!' : 'Confirmar Cancelamento'}</h3>
                        <p style={modalMessageStyle}>{cancelErrorMessage || `Tem certeza que deseja cancelar o pedido #${orderToCancelId}? Esta ação não pode ser desfeita.`}</p>
                        <div style={buttonContainerStyle}>
                            <button
                                style={confirmButtonStyle}
                                onClick={executeCancelOrder}
                                onMouseEnter={(e) => e.target.style.backgroundColor = confirmButtonHoverStyle.backgroundColor}
                                onMouseLeave={(e) => e.target.style.backgroundColor = confirmButtonStyle.backgroundColor}
                            >
                                Confirmar
                            </button>
                            <button
                                style={cancelModalButtonStyle} // Use the specific modal cancel button style
                                onClick={() => setIsCancelModalOpen(false)}
                                onMouseEnter={(e) => e.target.style.backgroundColor = cancelModalButtonHoverStyle.backgroundColor}
                                onMouseLeave={(e) => e.target.style.backgroundColor = cancelModalButtonStyle.backgroundColor}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}