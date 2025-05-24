import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/img/logo.png'; 

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

    const getNavLinkStyle = (path) => ({
        color: navigate.pathname === path ? '#cf301d' : 'rgb(52, 58, 64)', 
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
                    style={getNavLinkStyle('/')}
                >
                    HOME
                </Link>
                <Link
                    to="/cardapio"
                    style={getNavLinkStyle('/cadastros')}
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

    // Novo estado para o CEP e a taxa de entrega
    const [cep, setCep] = useState('');
    const [deliveryFee, setDeliveryFee] = useState(0.00); // Taxa de entrega inicial, pode ser 0 ou um valor padrão

    const calculateSubtotal = () => {
        return cartItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    };

    const subtotal = calculateSubtotal();
    const total = subtotal + deliveryFee;

    const handleQuantityChange = (id, delta) => {
        setCartItems(prevItems => {
            const updatedItems = prevItems.map(item =>
                item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
            );
            // Filtra itens com quantidade > 0, ou remove se a quantidade chegar a 0
            return updatedItems.filter(item => item.quantity > 0);
        });
    };

    const handleRemoveItem = (id) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    // Função para simular a busca da taxa de entrega
    const fetchDeliveryFee = (inputCep) => {
        // Remove caracteres não numéricos do CEP
        const cleanCep = inputCep.replace(/\D/g, '');

        // Exemplo de lógica de simulação:
        // Você substituirá isso por uma chamada real à API (backend)
        if (cleanCep.length === 8) {
            // Simula diferentes taxas baseadas em alguns CEPs
            if (cleanCep.startsWith('01') || cleanCep.startsWith('02')) {
                setDeliveryFee(10.00);
            } else if (cleanCep.startsWith('03') || cleanCep.startsWith('04')) {
                setDeliveryFee(7.50);
            } else if (cleanCep.startsWith('05')) {
                setDeliveryFee(5.00);
            } else {
                setDeliveryFee(12.00); // Valor padrão para outros CEPs
            }
        } else {
            setDeliveryFee(0.00); // Zera a taxa se o CEP for inválido ou incompleto
        }
    };

    const handleCepChange = (e) => {
        const newCep = e.target.value;
        setCep(newCep);
        // Você pode chamar a função de busca da taxa de entrega aqui,
        // mas talvez seja melhor ter um botão para "Calcular Frete"
        // para evitar muitas chamadas à API enquanto o usuário digita.
        // Por enquanto, vamos chamar em cada mudança para demonstração.
        fetchDeliveryFee(newCep);
    };

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
        paddingTop: 'calc(1rem + 2rem + 1px + 100px)', // (padding Navbar + borda + margin-top desejada para o box do carrinho)
        flexGrow: 1,
        marginBottom: '2rem', // Espaçamento inferior para o box do carrinho
    };

    const carrinhoBoxStyle = {
        width: '500px',
        margin: '0 auto',
        borderRadius: '8px',
        boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)', // Sombra mais suave
        backgroundColor: '#fff',
    };

    const headerStyle = {
        color: '#fff',
        backgroundColor: '#cf301d', // Cor vermelha vibrante
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
    };

    const headerH3Style = {
        margin: 0,
        padding: '20px',
        textAlign: 'center', // Centralizar o título do carrinho
    };

    const itemsListContainerStyle = {
        backgroundColor: '#f9f9f9', // Fundo claro para a lista de itens
        paddingBottom: '15px',
    };

    const itemRowStyle = {
        padding: '15px 20px 0 20px',
    };

    const itemContentStyle = {
        display: 'flex',
        flexDirection: 'row',
        padding: '15px 0',
        borderBottom: '1px solid #eee', // Borda mais suave
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
        color: '#343a40', // Cor do preço
    };

    const quantityButtonStyle = {
        color: '#000',
        fontSize: '1em',
        textAlign: 'center',
        borderRadius: '50%', // Botões redondos
        backgroundColor: '#fff',
        border: '1px solid #ccc', // Borda suave
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)', // Sombra suave
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
        backgroundColor: '#e0e0e0', // Fundo um pouco mais escuro que a lista de itens
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

    const cepInputContainerStyle = {
        padding: '15px 20px',
        backgroundColor: '#f9f9f9',
        borderTop: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    };

    const cepInputStyle = {
        flexGrow: 1,
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '1em',
    };

    const calculateFeeButtonStyle = {
        padding: '10px 15px',
        backgroundColor: '#28a745', // Bootstrap success green
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s ease',
    };

    return (
        <div style={pageContainerStyle}>
            {/* Renderizar a Navbar interna */}
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
                                            {/* Removido o item.code, pois não estava definido nos dados */}
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

                    {/* Novo Bloco para o Input de CEP */}
                    <div style={cepInputContainerStyle}>
                        <label htmlFor="cepInput" style={{ fontWeight: 'bold', color: '#343a40' }}>CEP:</label>
                        <input
                            type="text"
                            id="cepInput"
                            value={cep}
                            onChange={handleCepChange}
                            placeholder="Digite seu CEP"
                            style={cepInputStyle}
                            maxLength="9" // Adicionado para incluir o hífen
                        />
                        <button
                            onClick={() => fetchDeliveryFee(cep)}
                            style={calculateFeeButtonStyle}
                        >
                            Calcular Frete
                        </button>
                    </div>

                    <footer style={footerStyle}>
                        <div style={totalRowStyle}>
                            <p style={totalTextStyle}>Subtotal</p>
                            <p style={totalPriceStyle}>R${subtotal.toFixed(2).replace('.', ',')}</p>
                        </div>
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