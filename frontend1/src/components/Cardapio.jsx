import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importe Link e useNavigate
import logo from '../assets/img/logo.png'; // Seu logo

// PIZZAS SALGADAS 
import pizza3Queijos from '../assets/img/portfolio/24.jpg';
import pizzaCalabresa from '../assets/img/portfolio/1.jpg';
import pizzaQueijo from '../assets/img/portfolio/3.jpg';
import pizzaMargherita from '../assets/img/portfolio/10.jpg';
import pizzaPepperoni from '../assets/img/portfolio/11.jpg';
import pizzaFrangoRequeijao from '../assets/img/portfolio/6.jpg';

// BEBIDAS 
import cocaColaImage from '../assets/img/portfolio/21.jpg'; 
import cocaColaZeroImage from '../assets/img/portfolio/20.jpg'; 
import fantaLaranjaImage from '../assets/img/portfolio/19.jpg'; 
import fantaUvaImage from '../assets/img/portfolio/18.jpg';       
import iceTeaLimaoImage from '../assets/img/portfolio/14.jpg';        
import aguaImage from '../assets/img/portfolio/16.jpg';

// SOBREMESAS
import pizzaDocePistache from '../assets/img/portfolio/7.jpg'; 
import pizzaDocePrestigio from '../assets/img/portfolio/22.jpg';
import pizzaDoceBrigadeiro from '../assets/img/portfolio/23.jpg'; 
import pizzaDoceChurros from '../assets/img/portfolio/8.jpg';   
import pizzaDoceOvomaltine from '../assets/img/portfolio/5.jpg'; 
import pizzaDoceMms from '../assets/img/portfolio/9.jpg';          

// --- Dados Simulados do Cardápio ---
const allMenuItems = [
  // --- PIZZAS SALGADAS ---
  {
    id: 1,
    name: 'Pizza 3 Queijos',
    image: pizza3Queijos,
    ingredients: 'Queijo, requeijão, orégano e parmesão ralado.',
    price: 'R$ 45,00',
    category: 'pizza',
  },
  {
    id: 2,
    name: 'Pizza Calabresa',
    image: pizzaCalabresa,
    ingredients: 'Queijo, calabresa e cebola, orégano.',
    price: 'R$ 42,00',
    category: 'pizza',
  },
  {
    id: 3,
    name: 'Pizza de Queijo',
    image: pizzaQueijo,
    ingredients: 'Queijo e orégano.',
    price: 'R$ 38,00',
    category: 'pizza',
  },
  {
    id: 4,
    name: 'Pizza Margherita',
    image: pizzaMargherita,
    ingredients: 'Queijo, tomate, orégano e manjericão.',
    price: 'R$ 40,00',
    category: 'pizza',
  },
  {
    id: 5,
    name: 'Pizza Pepperoni',
    image: pizzaPepperoni,
    ingredients: 'Queijo, orégano e pepperoni.',
    price: 'R$ 48,00',
    category: 'pizza',
  },
  {
    id: 6,
    name: 'Pizza Frango c/ Requeijão',
    image: pizzaFrangoRequeijao,
    ingredients: 'Frango desfiado, cebola, orégano e requeijão.',
    price: 'R$ 46,00',
    category: 'pizza',
  },
  // --- BEBIDAS ---
  {
    id: 7,
    name: 'Coca-Cola',
    image: cocaColaImage,
    ingredients: 'Refrigerante de cola.',
    price: 'R$ 7,00',
    category: 'bebida',
  },
  {
    id: 8,
    name: 'Coca-Cola Zero',
    image: cocaColaZeroImage,
    ingredients: 'Refrigerante de cola zero açúcar.',
    price: 'R$ 7,00',
    category: 'bebida',
  },
  {
    id: 9,
    name: 'Fanta Laranja',
    image: fantaLaranjaImage,
    ingredients: 'Refrigerante de laranja.',
    price: 'R$ 6,50',
    category: 'bebida',
  },
  {
    id: 10,
    name: 'Fanta Uva',
    image: fantaUvaImage,
    ingredients: 'Refrigerante de uva.',
    price: 'R$ 6,50',
    category: 'bebida',
  },
  {
    id: 12,
    name: 'Ice Tea Limão',
    image: iceTeaLimaoImage,
    ingredients: 'Chá gelado de limão.',
    price: 'R$ 5,50',
    category: 'bebida',
  },
  {
    id: 15,
    name: 'Água',
    image: aguaImage,
    ingredients: 'Água mineral sem gás.',
    price: 'R$ 4,00',
    category: 'bebida',
  },
  // --- SOBREMESAS (Pizzas Doces) ---
  {
    id: 16,
    name: 'Pizza Doce Pistache',
    image: pizzaDocePistache,
    ingredients: 'Coberta com creme de pistache.',
    price: 'R$ 55,00',
    category: 'sobremesa',
  },
  {
    id: 17,
    name: 'Pizza Doce Prestígio',
    image: pizzaDocePrestigio,
    ingredients: 'Recheada com creme de baunilha, paçoca e coco ralado.',
    price: 'R$ 52,00',
    category: 'sobremesa',
  },
  {
    id: 18,
    name: 'Pizza Doce Brigadeiro',
    image: pizzaDoceBrigadeiro,
    ingredients: 'Coberta com creme de baunilha, brigadeiro de chocolate e granulado.',
    price: 'R$ 50,00',
    category: 'sobremesa',
  },
  {
    id: 20,
    name: 'Pizza Doce Churros',
    image: pizzaDoceChurros,
    ingredients: 'Doce de leite, com leite açúcar e canela.',
    price: 'R$ 48,00',
    category: 'sobremesa',
  },
  {
    id: 21,
    name: 'Pizza Doce Ovomaltine®',
    image: pizzaDoceOvomaltine,
    ingredients: 'Coberta com creme de baunilha e creme de ovomaltine crocante.',
    price: 'R$ 55,00',
    category: 'sobremesa',
  },
  {
    id: 22,
    name: 'Pizza Doce M&M®',
    image: pizzaDoceMms,
    ingredients: 'Coberta com creme de baunilha, brigadeiro de chocolate e M&M®.',
    price: 'R$ 52,00',
    category: 'sobremesa',
  },
];

const Cardapio = () => {
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [activeCategory, setActiveCategory] = useState('todos'); // 'todos', 'pizza', 'bebida', 'sobremesa'

  // --- Lógica de Autenticação (copiada da Navbar original) ---
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

  // --- SVGs de Ícones (copiados da Navbar original) ---
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

  // --- Estilos da Navbar de Filtro (combinados e adaptados) ---
  const navbarStyle = {
    backgroundColor: 'rgb(248, 249, 250)',
    borderBottom: '1px solid #dee2e6',
    padding: '0.8rem 2rem',
    position: 'sticky',
    top: 0,
    zIndex: 1000, 
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
    color: 'rgb(52, 58, 64)',
  };

  const categoryLinksStyle = {
    display: 'flex',
    gap: '2rem',
    flexGrow: 1, // Faz os links ocuparem o espaço central
    justifyContent: 'center', // Centraliza os links de categoria
    listStyle: 'none',
    margin: '0',
    padding: '0',
  };

  const getCategoryLinkStyle = (categoryName) => ({
    color: activeCategory === categoryName ? '#cf301d' : 'rgb(52, 58, 64)',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'color 0.2s ease-in-out',
  });

  const iconsContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  };

  // --- Estilos do Conteúdo do Cardápio ---
  const sectionStyle = {
    padding: '4rem 0',
    backgroundColor: '#E9E9E9',
    fontFamily: 'Arial, sans-serif',
    minHeight: 'calc(100vh - 60px)', 
    paddingTop: '3rem', 
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
  };

  const titleStyle = {
    textAlign: 'center',
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: '#343a40',
  };

  const subtitleStyle = {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#6c757d',
    marginBottom: '3rem',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    justifyItems: 'center',
  };

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '350px',
  };

  const cardImageStyle = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  };

  const cardContentStyle = {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  };

  const cardTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#343a40',
    marginBottom: '0.5rem',
  };

  const cardIngredientsStyle = {
    fontSize: '0.9rem',
    color: '#6c757d',
    marginBottom: '1rem',
    flexGrow: 1,
  };

  const cardPriceStyle = {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#cf301d',
    marginBottom: '1rem',
    textAlign: 'right',
  };

  const buttonStyle = {
    backgroundColor: '#cf301d',
    color: '#fff',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '5px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'none',
    transition: 'background-color 0.3s ease',
  };

  const handleOrderClick = (item) => {
    alert(`Você clicou em pedir: ${item.name}. (Implementar lógica do carrinho aqui)`);
  };

  // --- Lógica de Filtragem ---
  const filteredMenuItems = activeCategory === 'todos'
    ? allMenuItems
    : allMenuItems.filter(item => item.category === activeCategory);

  return (
    <>
      {/* --- Navbar de Filtro Integrada --- */}
      <nav style={navbarStyle}>
        <div style={brandStyle}>
          {/* Link para a home/início do site */}
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={logo} alt="Logo" style={{ height: 40, width: 'auto' }} />
            <span>Cardápio</span>
          </Link>
        </div>

        <ul style={categoryLinksStyle}>
          <li style={{...getCategoryLinkStyle('todos'), listStyle: 'none' /* Adicionado para garantir */}}>
            <a
              href="#"
              style={getCategoryLinkStyle('todos')}
              onClick={(e) => { e.preventDefault(); setActiveCategory('todos'); }}
            >
              TODOS
            </a>
          </li>
          <li style={{...getCategoryLinkStyle('pizza'), listStyle: 'none'}}>
            <a
              href="#"
              style={getCategoryLinkStyle('pizza')}
              onClick={(e) => { e.preventDefault(); setActiveCategory('pizza'); }}
            >
              PIZZAS
            </a>
          </li>
          <li style={{...getCategoryLinkStyle('bebida'), listStyle: 'none'}}>
            <a
              href="#"
              style={getCategoryLinkStyle('bebida')}
              onClick={(e) => { e.preventDefault(); setActiveCategory('bebida'); }}
            >
              BEBIDAS
            </a>
          </li>
          <li style={{...getCategoryLinkStyle('sobremesa'), listStyle: 'none'}}>
            <a
              href="#"
              style={getCategoryLinkStyle('sobremesa')}
              onClick={(e) => { e.preventDefault(); setActiveCategory('sobremesa'); }}
            >
              SOBREMESAS
            </a>
          </li>
        </ul>

        <div style={iconsContainerStyle}>
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
                    color: "white",
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
              <Link to="/carrinho" style={{ textDecoration: 'none', color: 'white', marginBottom: '8px' }}>
                {shoppingCartIcon}
              </Link>
            </>
          ) : (
            <Link to="/login" style={{ textDecoration: 'none', color: 'white', fontWeight: '600' }}>Login</Link>
          )}
        </div>
      </nav>

      {/* --- Conteúdo Principal do Cardápio --- */}
      <section id="cardapio-content" style={sectionStyle}>
        <div style={containerStyle}>
          <h2 style={titleStyle}>MAIS PEDIDOS</h2>
          <p style={subtitleStyle}>Sabores que conquistaram o paladar de todos!</p>

          <div style={gridStyle}>
            {filteredMenuItems.length === 0 ? (
              <p style={{ textAlign: 'center', gridColumn: '1 / -1' }}>Nenhum item encontrado nesta categoria.</p>
            ) : (
              filteredMenuItems.map((item) => (
                <div key={item.id} style={cardStyle}>
                  <img src={item.image} alt={item.name} style={cardImageStyle} />
                  <div style={cardContentStyle}>
                    <h3 style={cardTitleStyle}>{item.name}</h3>
                    <p style={cardIngredientsStyle}>{item.ingredients}</p>
                    <p style={cardPriceStyle}>{item.price}</p>
                    <button
                      onClick={() => handleOrderClick(item)}
                      style={buttonStyle}
                    >
                      PEÇA AGORA
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Cardapio;