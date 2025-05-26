import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/img/logo.png';
import pizza3Queijos from '../assets/img/portfolio/24.jpg';
import pizzaCalabresa from '../assets/img/portfolio/1.jpg';
import pizzaQueijo from '../assets/img/portfolio/3.jpg';
import pizzaMargherita from '../assets/img/portfolio/10.jpg';
import pizzaPepperoni from '../assets/img/portfolio/11.jpg';
import pizzaFrangoRequeijao from '../assets/img/portfolio/6.jpg';
import cocaColaImage from '../assets/img/portfolio/21.jpg'; 
import cocaColaZeroImage from '../assets/img/portfolio/20.jpg'; 
import fantaLaranjaImage from '../assets/img/portfolio/19.jpg'; 
import fantaUvaImage from '../assets/img/portfolio/18.jpg';       
import iceTeaLimaoImage from '../assets/img/portfolio/14.jpg';        
import aguaImage from '../assets/img/portfolio/16.jpg';
import pizzaDocePistache from '../assets/img/portfolio/7.jpg'; 
import pizzaDocePrestigio from '../assets/img/portfolio/22.jpg';
import pizzaDoceBrigadeiro from '../assets/img/portfolio/23.jpg'; 
import pizzaDoceChurros from '../assets/img/portfolio/8.jpg';   
import pizzaDoceOvomaltine from '../assets/img/portfolio/5.jpg'; 
import pizzaDoceMms from '../assets/img/portfolio/9.jpg';  


const shoppingCartIcon = ( <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg"> <g transform="translate(6.8,6.8)"> <circle cx="5" cy="17" r="1.5" fill="rgb(52, 58, 64)"/> <circle cx="14" cy="17" r="1.5" fill="rgb(52, 58, 64)"/> <path d="M-1 0H1L2.68 12.39C2.84 13.66 3.91 14.67 5.19 14.67H14.5C15.78 14.67 16.85 13.66 17.01 12.39L17.82 5.39C17.93 4.47 17.21 3.67 16.28 3.67H3.12" stroke="rgb(52, 58, 64)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </g> </svg> );
const userIcon = ( 
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg">
        <g> 
            <circle cx="16" cy="13" r="5" fill="rgb(52, 58, 64)" /> 
            <path d="M8 25c0-4 4-7 8-7s8 3 8 7" fill="rgb(52, 58, 64)" /> 
        </g> 
    </svg> 
);

// --- Dados Simulados do Cardápio ---
const allMenuItems = [
    { id: 1, name: 'Pizza 3 Queijos', image: pizza3Queijos, ingredients: 'Queijo, requeijão, orégano e parmesão ralado.', price: 'R$ 45,00', category: 'pizza' },
    { id: 2, name: 'Pizza Calabresa', image: pizzaCalabresa, ingredients: 'Queijo, calabresa e cebola, orégano.', price: 'R$ 42,00', category: 'pizza' },
    { id: 3, name: 'Pizza de Queijo', image: pizzaQueijo, ingredients: 'Queijo e orégano.', price: 'R$ 38,00', category: 'pizza' },
    { id: 4, name: 'Pizza Margherita', image: pizzaMargherita, ingredients: 'Queijo, tomate, orégano e manjericão.', price: 'R$ 40,00', category: 'pizza' },
    { id: 5, name: 'Pizza Pepperoni', image: pizzaPepperoni, ingredients: 'Queijo, orégano e pepperoni.', price: 'R$ 48,00', category: 'pizza' },
    { id: 6, name: 'Pizza Frango c/ Requeijão', image: pizzaFrangoRequeijao, ingredients: 'Frango desfiado, cebola, orégano e requeijão.', price: 'R$ 46,00', category: 'pizza' },
    { id: 7, name: 'Coca-Cola Lata 350ml', image: cocaColaImage, ingredients: 'Refrigerante de cola.', price: 'R$ 7,00', category: 'bebida' },
    { id: 8, name: 'Coca-Cola Zero Lata 350ml', image: cocaColaZeroImage, ingredients: 'Refrigerante de cola zero açúcar.', price: 'R$ 7,00', category: 'bebida' },
    { id: 9, name: 'Fanta Laranja Lata 350ml', image: fantaLaranjaImage, ingredients: 'Refrigerante de laranja.', price: 'R$ 6,50', category: 'bebida' },
    { id: 10, name: 'Fanta Uva Lata 350ml', image: fantaUvaImage, ingredients: 'Refrigerante de uva.', price: 'R$ 6,50', category: 'bebida' },
    { id: 12, name: 'Ice Tea Limão Lata 350ml', image: iceTeaLimaoImage, ingredients: 'Chá gelado de limão.', price: 'R$ 5,50', category: 'bebida' },
    { id: 15, name: 'Água Mineral 500ml', image: aguaImage, ingredients: 'Água mineral sem gás.', price: 'R$ 4,00', category: 'bebida' },
    { id: 16, name: 'Pizza Doce Pistache', image: pizzaDocePistache, ingredients: 'Coberta com creme de pistache.', price: 'R$ 55,00', category: 'sobremesa' },
    { id: 17, name: 'Pizza Doce Prestígio', image: pizzaDocePrestigio, ingredients: 'Recheada com creme de baunilha, paçoca e coco ralado.', price: 'R$ 52,00', category: 'sobremesa' },
    { id: 18, name: 'Pizza Doce Brigadeiro', image: pizzaDoceBrigadeiro, ingredients: 'Coberta com creme de baunilha, brigadeiro de chocolate e granulado.', price: 'R$ 50,00', category: 'sobremesa' },
    { id: 20, name: 'Pizza Doce Churros', image: pizzaDoceChurros, ingredients: 'Doce de leite, com leite açúcar e canela.', price: 'R$ 48,00', category: 'sobremesa' },
    { id: 21, name: 'Pizza Doce Ovomaltine®', image: pizzaDoceOvomaltine, ingredients: 'Coberta com creme de baunilha e creme de ovomaltine crocante.', price: 'R$ 55,00', category: 'sobremesa' },
    { id: 22, name: 'Pizza Doce M&M®', image: pizzaDoceMms, ingredients: 'Coberta com creme de baunilha, brigadeiro de chocolate e M&M®.', price: 'R$ 52,00', category: 'sobremesa' },
];

const navbarStyle = { backgroundColor: 'rgb(248, 249, 250)', borderBottom: '1px solid #dee2e6', padding: '0.8rem 2rem', position: 'sticky', top: 0, zIndex: 1000, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Arial, sans-serif' };
const brandStyle = { fontWeight: 700, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'rgb(52, 58, 64)', textDecoration: 'none' };
const categoryLinksStyle = { display: 'flex', gap: '2rem', flexGrow: 1, justifyContent: 'center', listStyle: 'none', margin: '0', padding: '0' };
const getCategoryLinkStyle = (categoryName, isActive, isHovered) => ({ // Modificado para isActive e isHovered
    color: isHovered || isActive ? '#cf301d' : 'rgb(52, 58, 64)',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'color 0.2s ease-in-out',
    padding: '0.5rem 0',
});
const iconsContainerStyle = { display: 'flex', alignItems: 'center', gap: '15px' };
const sectionStyle = { padding: '0rem 0 4rem 0', backgroundColor: '#E9E9E9', fontFamily: 'Arial, sans-serif', minHeight: 'calc(100vh - 70px)', paddingTop: '80px' };
const containerStyle = { maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' };
const titleStyle = { textAlign: 'center', fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem', color: '#343a40', paddingTop: '2rem' };
const subtitleStyle = { textAlign: 'center', fontSize: '1.2rem', color: '#6c757d', marginBottom: '3rem' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', justifyItems: 'center' };
const cardBaseStyle = { backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '350px', transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out' };
const cardHoverStyle = { transform: 'translateY(-5px)', boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'};
const cardImageStyle = { width: '100%', height: '200px', objectFit: 'cover' };
const cardContentStyle = { padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 };
const cardTitleStyle = { fontSize: '1.5rem', fontWeight: '600', color: '#343a40', marginBottom: '0.5rem' };
const cardIngredientsStyle = { fontSize: '0.9rem', color: '#6c757d', marginBottom: '1rem', flexGrow: 1, minHeight: '40px' };
const cardPriceStyle = { fontSize: '1.1rem', fontWeight: 'bold', color: '#cf301d', marginBottom: '1rem', textAlign: 'right' };
const buttonStyle = { backgroundColor: '#cf301d', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '5px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', transition: 'background-color 0.3s ease', alignSelf: 'stretch' };
const dropdownToggleButtonStyle = {
    background: "transparent",
    border: "none",
    padding: '0',
    boxShadow: "none",
    backgroundImage: 'none', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    cursor: 'pointer',
    outline: 'none',
} 
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 };
const modalContentStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)', textAlign: 'center', maxWidth: '400px', width: '90%' };
const modalTitleStyle = { fontSize: '1.5rem', fontWeight: '600', color: '#333', marginBottom: '10px' };
const modalTextStyle = { fontSize: '1rem', color: '#555', marginBottom: '25px' };
const modalStrongTextStyle = { fontWeight: 'bold', color: '#cf301d' };
const modalActionsStyle = { display: 'flex', justifyContent: 'space-around', gap: '10px' };
const modalButtonStyle = { padding: '10px 20px', borderRadius: '5px', border: 'none', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.2s ease' };
const continueShoppingButtonStyle = { ...modalButtonStyle, backgroundColor: '#6c757d', color: 'white' };
const goToCartButtonStyle = { ...modalButtonStyle, backgroundColor: '#cf301d', color: 'white' };


const MenuItemCard = ({ item, onOrderClick }) => {
    const [isCardHovered, setIsCardHovered] = useState(false);

    return (
        <div 
            style={isCardHovered ? {...cardBaseStyle, ...cardHoverStyle} : cardBaseStyle}
            onMouseEnter={() => setIsCardHovered(true)}
            onMouseLeave={() => setIsCardHovered(false)}
        >
            <img src={item.image || 'https://via.placeholder.com/350x200.png?text=Imagem'} alt={item.name} style={cardImageStyle} />
            <div style={cardContentStyle}>
                <h3 style={cardTitleStyle}>{item.name}</h3>
                <p style={cardIngredientsStyle}>{item.ingredients}</p>
                <p style={cardPriceStyle}>{item.price}</p>
                <button onClick={() => onOrderClick(item)} style={buttonStyle}>
                    ADICIONAR AO CARRINHO
                </button>
            </div>
        </div>
    );
};


const Cardapio = () => {
    const navigate = useNavigate();
    const location = useLocation(); 
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [activeCategory, setActiveCategory] = useState('todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lastAddedItemName, setLastAddedItemName] = useState('');
    const [categoryHoverStates, setCategoryHoverStates] = useState({ 
        todos: false, pizza: false, bebida: false, sobremesa: false
    });

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

    const handleOrderClick = (item) => {
        const priceString = item.price.replace('R$ ', '').replace(',', '.');
        const priceNumber = parseFloat(priceString);

        if (isNaN(priceNumber)) {
            console.error("Preço inválido para o item:", item);
            alert("Erro: Preço do item é inválido.");
            return;
        }

        let cart = [];
        try {
            const localCart = localStorage.getItem('cart');
            if (localCart) cart = JSON.parse(localCart);
        } catch (e) {
            console.error("Erro ao ler carrinho do localStorage:", e);
            cart = []; 
        }

        const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id && cartItem.name === item.name);
        
        let itemTypeForPayload = item.category;
        if (item.category === 'sobremesa') {
            itemTypeForPayload = 'pizza'; 
        }

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({
                id: item.id,
                name: item.name,
                price: priceNumber,
                quantity: 1,
                image: item.image, 
                tipo: itemTypeForPayload,
            });
        }

        try {
            localStorage.setItem('cart', JSON.stringify(cart));
            setLastAddedItemName(item.name); 
            setIsModalOpen(true);          
        } catch (e) {
            console.error("Erro ao salvar carrinho no localStorage:", e);
            alert("Houve um erro ao adicionar o item ao carrinho.");
        }
    };

    const handleContinueShopping = () => {
        setIsModalOpen(false);
    };

    const handleGoToCart = () => {
        setIsModalOpen(false);
        navigate('/carrinho');
    };

    const filteredMenuItems = activeCategory === 'todos'
        ? allMenuItems
        : allMenuItems.filter(item => item.category === activeCategory);

    return (
        <>
            <nav style={navbarStyle}>
                <Link to="/" style={brandStyle}>
                    <img src={logo} alt="Logo" style={{ height: 40, width: 'auto' }} />
                    <span>Cardápio</span>
                </Link>
                <ul style={categoryLinksStyle}>
                    {['todos', 'pizza', 'bebida', 'sobremesa'].map(category => (
                        <li key={category} style={{listStyle: 'none'}}
                            onMouseEnter={() => setCategoryHoverStates(prev => ({...prev, [category]: true}))}
                            onMouseLeave={() => setCategoryHoverStates(prev => ({...prev, [category]: false}))}
                        >
                            <a href="#" style={getCategoryLinkStyle(category, activeCategory === category, categoryHoverStates[category])} onClick={(e) => { e.preventDefault(); setActiveCategory(category); }}>
                                {category.toUpperCase()}
                            </a>
                        </li>
                    ))}
                </ul>
                <div style={iconsContainerStyle}>
                    {loggedInUser ? (
                        <>
                            <div className="dropdown">
                                <button
                                    className="btn dropdown-toggle" 
                                    type="button"
                                    id="dropdownUsuario" 
                                    data-bs-toggle="dropdown"    
                                    aria-expanded="false"
                                    style={dropdownToggleButtonStyle} 
                                >
                                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}> {userIcon} </span>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownUsuarioNavCardapio">
                                    <h6 className="dropdown-header">Olá, {loggedInUser}!</h6>
                                    <li><Link className="dropdown-item" to="/profile/edit">Meu Perfil</Link></li>
                                    <li><Link className="dropdown-item" to="/pedidos">Meus Pedidos</Link></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><button className="dropdown-item" onClick={handleLogout}>Sair</button></li>
                                </ul>
                            </div>
                            <Link to="/carrinho" style={{ textDecoration: 'none', color: 'rgb(52, 58, 64)', position: 'relative', top: '2px' }}> {shoppingCartIcon} </Link>
                        </>
                    ) : (
                        <Link to="/login" style={{ textDecoration: 'none', color: 'rgb(52, 58, 64)', fontWeight: '600' }}>Login</Link>
                    )}
                </div>
            </nav>

            <section id="cardapio-content" style={sectionStyle}>
                <div style={containerStyle}>
                    <h2 style={titleStyle}>NOSSO CARDÁPIO</h2>
                    <p style={subtitleStyle}>Descubra os sabores que vão te conquistar!</p>
                    <div style={gridStyle}>
                        {filteredMenuItems.length === 0 ? (
                            <p style={{ textAlign: 'center', gridColumn: '1 / -1' }}>Nenhum item encontrado nesta categoria.</p>
                        ) : (
                            filteredMenuItems.map((item) => (
                                <MenuItemCard 
                                    key={item.id} 
                                    item={item} 
                                    onOrderClick={handleOrderClick} 
                                />
                            ))
                        )}
                    </div>
                </div>
            </section>

            {isModalOpen && (
                <div style={modalOverlayStyle} onClick={handleContinueShopping}> 
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}> 
                        <h3 style={modalTitleStyle}>Item Adicionado!</h3>
                        <p style={modalTextStyle}>
                            <strong style={modalStrongTextStyle}>{lastAddedItemName}</strong> foi adicionado ao seu carrinho.
                        </p>
                        <div style={modalActionsStyle}>
                            <button 
                                onClick={handleContinueShopping} 
                                style={continueShoppingButtonStyle}
                                onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                                onMouseLeave={(e) => e.target.style.opacity = '1'}
                            >
                                Continuar Comprando
                            </button>
                            <button 
                                onClick={handleGoToCart} 
                                style={goToCartButtonStyle}
                                onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                                onMouseLeave={(e) => e.target.style.opacity = '1'}
                            >
                                Ir para o Carrinho
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Cardapio;