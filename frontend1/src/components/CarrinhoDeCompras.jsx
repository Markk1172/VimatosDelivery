import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Import useLocation for Navbar
import logo from '../assets/img/logo.png';

import iconPix from '../assets/img/pix.png'; // Make sure the path is correct
import iconDinheiro from '../assets/img/dollar.png'; 

// --- SVGs de Ícones (copiados do Cardapio.jsx) ---
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
    const location = useLocation(); // Hook to get current path
    const [loggedInUser, setLoggedInUser] = useState(null);

    // State for hover effects
    const [homeHover, setHomeHover] = useState(false);
    const [cardapioHover, setCardapioHover] = useState(false); // Make sure this is 'cardapioHover' not 'cadastrosHover'


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

    const getNavLinkStyle = (path, isHovered) => ({ // Updated to accept isHovered
        color: isHovered || location.pathname === path ? '#cf301d' : 'rgb(52, 58, 64)',
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
                    style={getNavLinkStyle('/', homeHover)} // Pass homeHover
                    onMouseEnter={() => setHomeHover(true)}
                    onMouseLeave={() => setHomeHover(false)}
                >
                    HOME
                </Link>
                <Link
                    to="/cardapio"
                    style={getNavLinkStyle('/cardapio', cardapioHover)} // Pass cardapioHover
                    onMouseEnter={() => setCardapioHover(true)}
                    onMouseLeave={() => setCardapioHover(false)}
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
                                    // A cor do ícone SVG já é definida no próprio SVG (rgb(52, 58, 64))
                                    fontWeight: "normal",
                                    boxShadow: "none",
                                    textTransform: "none",
                                    padding: '0'
                                }}
                            >
                                {/* O span aqui é para agrupar o ícone e aplicar estilos se necessário */}
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

export default function CarrinhoDeCompras() {
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: 'Pizza Calabresa',
            quantity: 2,
            price: 13.87,
            image: '../assets/img/portfolio/1.jpg'
        },
        {
            id: 2,
            name: 'Coca-Cola 350ml',
            quantity: 1,
            price: 7.00,
            image: '../assets/img/portfolio/21.jpg'
        },
        {
            id: 3,
            name: 'Brownie c/ Sorvete',
            quantity: 1,
            price: 15.00,
            image: '../assets/img/portfolio/22.jpg'
        }
    ]);

    // Estado para a taxa de entrega
    const [deliveryFee, setDeliveryFee] = useState(0.00);
    // Estado para o cupom e o valor do desconto
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0.00);
    const [couponMessage, setCouponMessage] = useState('');

    // --- Novas Variáveis de Estado para Endereço ---
    const [addresses, setAddresses] = useState([
        // Exemplo de endereços pré-cadastrados (você buscaria isso de uma API)
        { id: 1, cep: '01001-000', street: 'Praça da Sé', number: '100', neighborhood: 'Centro', city: 'São Paulo', state: 'SP', complement: '' },
        { id: 2, cep: '04547-000', street: 'Rua do Consolação', number: '1500', neighborhood: 'Consolação', city: 'São Paulo', state: 'SP', complement: 'Apto 23' },
    ]);
    const [selectedAddressId, setSelectedAddressId] = useState(''); // ID do endereço selecionado no dropdown
    const [newAddress, setNewAddress] = useState({ // Estado para o novo endereço a ser cadastrado
        cep: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: ''
    });
    const [showNewAddressForm, setShowNewAddressForm] = useState(false); // Para mostrar/esconder o formulário de novo endereço

    // --- Novo estado para o método de pagamento ---
    const [paymentMethod, setPaymentMethod] = useState(''); // Stores the selected payment method

    useEffect(() => {
        if (selectedAddressId) {
            const address = addresses.find(addr => addr.id === parseInt(selectedAddressId));
            if (address) {
                fetchDeliveryFee(address.cep);
            }
        } else if (!showNewAddressForm) {
            setDeliveryFee(0.00);
        }
    }, [selectedAddressId, addresses, showNewAddressForm]);


    const calculateSubtotal = () => {
        return cartItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    };

    const subtotal = calculateSubtotal();
    const totalAfterDiscount = subtotal - discount;
    const total = totalAfterDiscount + deliveryFee;

    const handleQuantityChange = (id, delta) => {
        setCartItems(prevItems => {
            const updatedItems = prevItems.map(item =>
                item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
            );
            return updatedItems.filter(item => item.quantity > 0);
        });
    };

    const handleRemoveItem = (id) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const fetchDeliveryFee = (inputCep) => {
        const cleanCep = inputCep.replace(/\D/g, '');
        if (cleanCep.length === 8) {
            if (cleanCep.startsWith('01') || cleanCep.startsWith('02')) {
                setDeliveryFee(10.00);
            } else if (cleanCep.startsWith('03') || cleanCep.startsWith('04')) {
                setDeliveryFee(7.50);
            } else if (cleanCep.startsWith('05')) {
                setDeliveryFee(5.00);
            } else {
                setDeliveryFee(12.00);
            }
        } else {
            setDeliveryFee(0.00);
        }
    };

    const applyCoupon = () => {
        if (couponCode.toUpperCase() === 'DESCONTO10') {
            setDiscount(subtotal * 0.10);
            setCouponMessage('Cupom aplicado com sucesso! Você ganhou 10% de desconto.');
        } else if (couponCode.toUpperCase() === 'FRETEGRATIS') {
            setDeliveryFee(0.00);
            setDiscount(0.00);
            setCouponMessage('Cupom aplicado com sucesso! Frete grátis.');
        } else if (couponCode.toUpperCase() === 'FIAP50') {
            setDiscount(50.00);
            setCouponMessage('Cupom aplicado com sucesso! R$50 de desconto.');
        }
        else {
            setDiscount(0.00);
            setCouponMessage('Cupom inválido. Tente novamente.');
        }
    };

    // --- Funções para Endereço ---
    const handleAddressSelectChange = (e) => {
        const id = e.target.value;
        setSelectedAddressId(id);
        setShowNewAddressForm(false);
        if (id === "new") {
            setShowNewAddressForm(true);
            setNewAddress({ cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' });
            setDeliveryFee(0.00);
        }
    };

    const handleNewAddressChange = (e) => {
        const { name, value } = e.target;
        setNewAddress(prev => ({ ...prev, [name]: value }));

        if (name === 'cep') {
            const cleanCep = value.replace(/\D/g, '');
            if (cleanCep.length === 8) {
                fetchDeliveryFee(cleanCep);
                if (cleanCep === '01001000') {
                    setNewAddress(prev => ({
                        ...prev,
                        street: 'Praça da Sé',
                        neighborhood: 'Sé',
                        city: 'São Paulo',
                        state: 'SP'
                    }));
                } else if (cleanCep === '04547000') {
                    setNewAddress(prev => ({
                        ...prev,
                        street: 'Rua do Consolação',
                        neighborhood: 'Consolação',
                        city: 'São Paulo',
                        state: 'SP'
                    }));
                } else {
                    setNewAddress(prev => ({
                        ...prev,
                        street: '', neighborhood: '', city: '', state: ''
                    }));
                }
            } else {
                setDeliveryFee(0.00);
            }
        }
    };

    const handleSaveNewAddress = () => {
        if (newAddress.cep && newAddress.street && newAddress.number && newAddress.neighborhood && newAddress.city && newAddress.state) {
            const newId = addresses.length > 0 ? Math.max(...addresses.map(a => a.id)) + 1 : 1;
            const addressToSave = { ...newAddress, id: newId };
            setAddresses(prev => [...prev, addressToSave]);
            setSelectedAddressId(newId.toString());
            setShowNewAddressForm(false);
            setCouponMessage('Novo endereço cadastrado e selecionado.');
        } else {
            setCouponMessage('Por favor, preencha todos os campos do endereço.');
        }
    };

    // --- Estilos ---
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
        paddingTop: 'calc(1rem + 2rem + 1px + 100px)',
        flexGrow: 1,
        marginBottom: '2rem',
    };

    const carrinhoBoxStyle = {
        width: '500px',
        margin: '0 auto',
        borderRadius: '8px',
        boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
    };

    const headerStyle = {
        color: '#fff',
        backgroundColor: '#cf301d',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
    };

    const headerH3Style = {
        margin: 0,
        padding: '20px',
        textAlign: 'center',
    };

    const itemsListContainerStyle = {
        backgroundColor: '#f9f9f9',
        paddingBottom: '15px',
    };

    const itemRowStyle = {
        padding: '15px 20px 0 20px',
    };

    const itemContentStyle = {
        display: 'flex',
        flexDirection: 'row',
        padding: '15px 0',
        borderBottom: '1px solid #eee',
        alignItems: 'center',
    };

    const itemImageContainerStyle = {
        flex: '0 0 50px',
        height: '50px',
        position: 'relative',
        marginRight: '15px',
    };

    const itemImageStyle = {
        width: '50px',
        height: '50px',
        borderRadius: '30px',
        objectFit: 'cover',
    };

    const itemNameDetailsStyle = {
        flex: 3,
    };

    const itemQuantityControlsStyle = {
        flex: 2,
        textAlign: 'center',
    };

    const itemPriceStyle = {
        flex: 1,
        textAlign: 'right',
        fontWeight: 'bold',
        color: '#343a40',
    };

    const quantityButtonStyle = {
        color: '#000',
        fontSize: '1em',
        textAlign: 'center',
        borderRadius: '50%',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        width: '28px',
        height: '28px',
        lineHeight: '26px',
        display: 'inline-block',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
    };

    const quantityDisplaySpanStyle = {
        display: 'inline-block',
        fontSize: '1.2em',
        fontWeight: 'bold',
        padding: '0 10px',
        color: '#343a40',
    };

    const footerStyle = {
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#e0e0e0',
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
    };

    const totalRowStyle = {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: '8px',
    };

    const totalTextStyle = {
        margin: 0,
        fontWeight: 'normal',
        fontSize: '1.1em',
        color: '#343a40',
    };

    const totalPriceStyle = {
        margin: 0,
        fontWeight: 'bold',
        fontSize: '1.1em',
        color: '#343a40',
    };

    const checkoutButtonStyle = {
        color: '#fff',
        border: 'none',
        fontSize: '1.2em',
        padding: '12px 25px',
        backgroundColor: '#cf301d',
        marginTop: '15px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s ease',
    };

    const couponInputContainerStyle = {
        padding: '15px 20px',
        backgroundColor: '#f9f9f9',
        borderTop: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap',
    };

    const couponInputStyle = {
        flexGrow: 1,
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '1em',
        minWidth: '150px',
    };

    const applyCouponButtonStyle = {
        padding: '10px 15px',
        backgroundColor: '#cf301d',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s ease',
    };

    const couponMessageStyle = {
        marginTop: '10px',
        fontSize: '0.9em',
        color: discount > 0 ? '#28a745' : '#dc3545',
        textAlign: 'center',
        padding: '0 20px',
    };

    // --- Estilos para o Endereço ---
    const addressSectionStyle = {
        padding: '15px 20px',
        backgroundColor: '#f9f9f9',
        borderTop: '1px solid #eee',
        marginBottom: '15px',
    };

    const selectStyle = {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '1em',
        marginBottom: '10px',
        backgroundColor: '#fff',
        textAlign: 'center',
    };

    const addressFormStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        marginTop: '15px',
        padding: '10px',
        border: '1px dashed #ccc',
        borderRadius: '5px',
        backgroundColor: '#f0f0f0',
    };

    const formGroupStyle = {
        display: 'flex',
        flexDirection: 'column',
    };

    const formInputStyle = {
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '0.9em',
    };

    const saveAddressButtonStyle = {
        gridColumn: '1 / -1',
        padding: '10px 15px',
        backgroundColor: '#cf301d',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s ease',
        marginTop: '10px',
    };

    // --- Styles for Payment Method Section ---
    const paymentMethodSectionStyle = {
        padding: '15px 20px',
        backgroundColor: '#f9f9f9',
        borderTop: '1px solid #eee',
        marginBottom: '15px',
        textAlign: 'center', // Center the content
    };

    const paymentMethodGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', // Responsive grid for payment options
        gap: '15px',
        marginTop: '15px',
        justifyContent: 'center', // Center grid items
    };

    const paymentOptionButtonStyle = (method) => ({
        padding: '12px 10px',
        border: `2px solid ${paymentMethod === method ? '#cf301d' : '#ccc'}`,
        borderRadius: '8px',
        backgroundColor: paymentMethod === method ? '#ffe0e0' : '#fff', // Light red for selected
        cursor: 'pointer',
        fontSize: '0.95em',
        fontWeight: 'bold',
        color: paymentMethod === method ? '#cf301d' : '#343a40',
        transition: 'all 0.2s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    });

    const paymentOptionHoverStyle = {
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        transform: 'translateY(-2px)',
    };

    // Simple icons for payment methods
    const creditCardIcon = <span style={{ fontSize: '1.5em', marginBottom: '5px' }}>💳</span>;
    const debitCardIcon = <span style={{ fontSize: '1.5em', marginBottom: '5px' }}> डेबिट</span>; // Placeholder using Devnagari 'debit' as icon
    const moneyIcon = <span style={{ fontSize: '1.5em', marginBottom: '5px' }}>💰</span>;
    const pixIcon = <span style={{ fontSize: '1.5em', marginBottom: '5px' }}>▧</span>; // Placeholder for Pix icon

    return (
        <div style={pageContainerStyle}>
            <InternalNavbar />

            <div style={contentWrapperStyle}>
                <div style={carrinhoBoxStyle}>
                    <header style={headerStyle}>
                        <h3 style={headerH3Style}>Carrinho de Compras</h3>
                    </header>

                    <div style={itemsListContainerStyle}>
                        {cartItems.length === 0 ? (
                            <p style={{textAlign: 'center', padding: '20px', color: '#555'}}>Seu carrinho está vazio.</p>
                        ) : (
                            cartItems.map((item) => (
                                <div key={item.id} style={itemRowStyle}>
                                    <div style={itemContentStyle}>
                                        <div style={itemImageContainerStyle}>
                                            <a href="#" onClick={(e) => { e.preventDefault(); handleRemoveItem(item.id); }} style={{
                                                position: 'absolute',
                                                top: '-5px',
                                                left: '-5px',
                                                width: '24px',
                                                height: '24px',
                                                color: '#dc3545',
                                                fontSize: '1.2em',
                                                textAlign: 'center',
                                                borderRadius: '50%',
                                                textDecoration: 'none',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: '#fff',
                                                border: '1px solid #dc3545',
                                                fontWeight: 'bold',
                                            }}>X</a>
                                            <img src={item.image} alt={item.name} style={itemImageStyle} />
                                        </div>

                                        <div style={itemNameDetailsStyle}>
                                            <h5 style={{ margin: '10px 0 0' }}>{item.name}</h5>
                                            <p style={{ margin: '5px 0 0', fontSize: '0.9em', color: '#777' }}>Preço unitário: R${item.price.toFixed(2).replace('.', ',')}</p>
                                        </div>

                                        <div style={itemQuantityControlsStyle}>
                                            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <li style={{ display: 'inline-block' }}>
                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleQuantityChange(item.id, -1); }} style={quantityButtonStyle}>-</a>
                                                </li>
                                                <li style={{ display: 'inline-block' }}>
                                                    <span style={quantityDisplaySpanStyle}>{item.quantity}</span>
                                                </li>
                                                <li style={{ display: 'inline-block' }}>
                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleQuantityChange(item.id, 1); }} style={quantityButtonStyle}>+</a>
                                                </li>
                                            </ul>
                                        </div>

                                        <div style={itemPriceStyle}>
                                            <p style={{ margin: '0' }}>R${(item.quantity * item.price).toFixed(2).replace('.', ',')}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Bloco para o Input de Cupom de Desconto */}
                    <div style={couponInputContainerStyle}>
                        <label htmlFor="couponInput" style={{ fontWeight: 'bold', color: '#343a40' }}>Cupom:</label>
                        <input
                            type="text"
                            id="couponInput"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="Código do cupom"
                            style={couponInputStyle}
                        />
                        <button
                            onClick={applyCoupon}
                            style={applyCouponButtonStyle}
                        >
                            Aplicar Cupom
                        </button>
                    </div>
                    {couponMessage && <p style={couponMessageStyle}>{couponMessage}</p>}

                    {/* --- Novo Bloco para Endereço e Frete --- */}
                    <div style={addressSectionStyle}>
                        <h4 style={{ margin: '0 0 15px', color: '#343a40', textAlign: 'center' }}>Endereço de Entrega</h4>

                        {/* Select de Endereços Antigos */}
                        <label htmlFor="addressSelect" style={{ fontWeight: 'bold', color: '#343a40', display: 'block', marginBottom: '5px' }}>
                            Selecione um endereço ou cadastre um novo:
                        </label>
                        <select
                            id="addressSelect"
                            value={selectedAddressId}
                            onChange={handleAddressSelectChange}
                            style={selectStyle}
                        >
                            <option value="">-- Selecionar Endereço --</option>
                            {addresses.map(addr => (
                                <option key={addr.id} value={addr.id}>
                                    {addr.street}, {addr.number} - {addr.neighborhood}, {addr.city}/{addr.state} ({addr.cep})
                                </option>
                            ))}
                            <option value="new">Cadastrar novo endereço</option>
                        </select>

                        {/* Formulário de Novo Endereço (condicional) */}
                        {showNewAddressForm && (
                            <div style={addressFormStyle}>
                                <h5 style={{ gridColumn: '1 / -1', margin: '0 0 10px', color: '#555' }}>Cadastrar Novo Endereço</h5>
                                <div style={formGroupStyle}>
                                    <label htmlFor="newCep" style={{ fontSize: '0.9em', marginBottom: '3px' }}>CEP:</label>
                                    <input
                                        type="text"
                                        id="newCep"
                                        name="cep"
                                        value={newAddress.cep}
                                        onChange={handleNewAddressChange}
                                        placeholder="00000-000"
                                        style={formInputStyle}
                                        maxLength="9"
                                    />
                                </div>
                                <div style={formGroupStyle}>
                                    <label htmlFor="newStreet" style={{ fontSize: '0.9em', marginBottom: '3px' }}>Rua:</label>
                                    <input
                                        type="text"
                                        id="newStreet"
                                        name="street"
                                        value={newAddress.street}
                                        onChange={handleNewAddressChange}
                                        placeholder="Nome da Rua"
                                        style={formInputStyle}
                                    />
                                </div>
                                <div style={formGroupStyle}>
                                    <label htmlFor="newNumber" style={{ fontSize: '0.9em', marginBottom: '3px' }}>Número:</label>
                                    <input
                                        type="text"
                                        id="newNumber"
                                        name="number"
                                        value={newAddress.number}
                                        onChange={handleNewAddressChange}
                                        placeholder="123"
                                        style={formInputStyle}
                                    />
                                </div>
                                <div style={formGroupStyle}>
                                    <label htmlFor="newComplement" style={{ fontSize: '0.9em', marginBottom: '3px' }}>Complemento (opc.):</label>
                                    <input
                                        type="text"
                                        id="newComplement"
                                        name="complement"
                                        value={newAddress.complement}
                                        onChange={handleNewAddressChange}
                                        placeholder="Apto, Bloco, etc."
                                        style={formInputStyle}
                                    />
                                </div>
                                <div style={formGroupStyle}>
                                    <label htmlFor="newNeighborhood" style={{ fontSize: '0.9em', marginBottom: '3px' }}>Bairro:</label>
                                    <input
                                        type="text"
                                        id="newNeighborhood"
                                        name="neighborhood"
                                        value={newAddress.neighborhood}
                                        onChange={handleNewAddressChange}
                                        placeholder="Seu Bairro"
                                        style={formInputStyle}
                                    />
                                </div>
                                <div style={formGroupStyle}>
                                    <label htmlFor="newCity" style={{ fontSize: '0.9em', marginBottom: '3px' }}>Cidade:</label>
                                    <input
                                        type="text"
                                        id="newCity"
                                        name="city"
                                        value={newAddress.city}
                                        onChange={handleNewAddressChange}
                                        placeholder="Sua Cidade"
                                        style={formInputStyle}
                                    />
                                </div>
                                <div style={formGroupStyle}>
                                    <label htmlFor="newState" style={{ fontSize: '0.9em', marginBottom: '3px' }}>Estado (UF):</label>
                                    <input
                                        type="text"
                                        id="newState"
                                        name="state"
                                        value={newAddress.state}
                                        onChange={handleNewAddressChange}
                                        placeholder="UF"
                                        maxLength="2"
                                        style={formInputStyle}
                                    />
                                </div>
                                <button onClick={handleSaveNewAddress} style={saveAddressButtonStyle}>
                                    Salvar Endereço
                                </button>
                            </div>
                        )}
                    </div>

                    {/* --- Payment Method Selection --- */}
                    <div style={paymentMethodSectionStyle}>
                        <h4 style={{ margin: '0 0 15px', color: '#343a40' }}>Método de Pagamento</h4>
                        <div style={paymentMethodGridStyle}>
                            <button
                                style={paymentOptionButtonStyle('credito')}
                                onClick={() => setPaymentMethod('credito')}
                                onMouseEnter={(e) => Object.assign(e.currentTarget.style, paymentOptionHoverStyle)}
                                onMouseLeave={(e) => Object.assign(e.currentTarget.style, paymentOptionButtonStyle('credito'))}
                            >
                                {creditCardIcon}
                                Cartão de Crédito / Débito
                            </button>
                            <button
                                style={paymentOptionButtonStyle('dinheiro')}
                                onClick={() => setPaymentMethod('dinheiro')}
                                onMouseEnter={(e) => Object.assign(e.currentTarget.style, paymentOptionHoverStyle)}
                                onMouseLeave={(e) => Object.assign(e.currentTarget.style, paymentOptionButtonStyle('dinheiro'))}
                            >
                                <img src={iconDinheiro} alt="Dinheiro" style={{ width: 28, height: 28, marginBottom: 5 }} />
                                Dinheiro
                            </button>
                            <button
                                style={paymentOptionButtonStyle('pix')}
                                onClick={() => setPaymentMethod('pix')}
                                onMouseEnter={(e) => Object.assign(e.currentTarget.style, paymentOptionHoverStyle)}
                                onMouseLeave={(e) => Object.assign(e.currentTarget.style, paymentOptionButtonStyle('pix'))}
                            >
                                <img src={iconPix} alt="Pix" style={{ width: 28, height: 28, marginBottom: 5 }} />
                                Pix
                            </button>
                        </div>
                    </div>

                    <footer style={footerStyle}>
                        <div style={totalRowStyle}>
                            <p style={totalTextStyle}>Subtotal</p>
                            <p style={totalPriceStyle}>R${subtotal.toFixed(2).replace('.', ',')}</p>
                        </div>
                        {discount > 0 && (
                            <div style={totalRowStyle}>
                                <p style={{ ...totalTextStyle, color: '#28a745' }}>Desconto</p>
                                <p style={{ ...totalPriceStyle, color: '#28a745' }}>-R${discount.toFixed(2).replace('.', ',')}</p>
                            </div>
                        )}
                        <div style={totalRowStyle}>
                            <p style={totalTextStyle}>Taxa de Entrega</p>
                            <p style={totalPriceStyle}>R${deliveryFee.toFixed(2).replace('.', ',')}</p>
                        </div>
                        <div style={totalRowStyle}>
                            <p style={{ ...totalTextStyle, fontWeight: 'bold', fontSize: '1.2em' }}>Total</p>
                            <p style={{ ...totalPriceStyle, fontWeight: 'bold', fontSize: '1.2em' }}>R${total.toFixed(2).replace('.', ',')}</p>
                        </div>

                        <button style={checkoutButtonStyle}>Finalizar Compra</button>
                    </footer>
                </div>
            </div>
        </div>
    );
}