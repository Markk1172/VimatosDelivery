import React from "react";
import { useNavigate } from 'react-router-dom';

// Dados dos Modais ATUALIZADOS com databaseId e preços
const portfolioModalsData = [
    {
        id: "portfolioModal1", // ID para o HTML do modal
        databaseId: 2,          // ID do produto no banco de dados (da lista allMenuItems: Pizza Calabresa)
        title: "Calabresa",
        subtitle: "Clássica.",
        img: "/assets/img/portfolio/1.jpg",
        description: "Tradicional e irresistível: fatias generosas de calabresa levemente apimentada, cobertas com cebola, orégano fresco e um toque especial do nosso molho artesanal. Assada até a borda ficar crocante e o sabor incomparável.",
        category: "Pizza",
        price: "R$ 42,00"
    },
    {
        id: "portfolioModal2",
        databaseId: 999, // !!! ATENÇÃO: ID placeholder para Portuguesa. Verifique/adicione no seu backend e allMenuItems !!!
        title: "Portuguesa",
        subtitle: "Colonizante não?",
        img: "/assets/img/portfolio/2.jpg",
        description: "Uma combinação rica e colorida: presunto, ovo, cebola, pimentão e azeitonas, sobre uma base de queijo e molho caseiro. Uma explosão de sabores que homenageia a tradição.",
        category: "Pizza",
        price: "R$ 45,00"
    },
    {
        id: "portfolioModal3",
        databaseId: 3,          // ID da Pizza de Queijo (Muçarela)
        title: "Muçarela",
        subtitle: "Básica, mas extraordinária.",
        img: "/assets/img/portfolio/3.jpg",
        description: "Simples, clássica e amada por todos. Coberta com uma generosa camada de muçarela derretida, realçada com um toque de orégano e nosso molho artesanal. Uma explosão de sabor a cada mordida.",
        category: "Pizza",
        price: "R$ 38,00"
    },
    {
        id: "portfolioModal4",
        databaseId: 7,          // ID da Coca-Cola Lata 350ml
        title: "Coca-Cola",
        subtitle: "Refrigerante, sempre uma boa pedida!.",
        img: "/assets/img/portfolio/4.jpg",
        description: "Clássica, refrescante e inconfundível. Servida sempre gelada, é a escolha perfeita para acompanhar qualquer pizza. O equilíbrio ideal entre sabor e efervescência que só a Coca tem.",
        category: "Bebida",
        price: "R$ 7,00"
    },
    {
        id: "portfolioModal5",
        databaseId: 21,         // ID da Pizza Doce Ovomaltine®
        title: "Pizza Doce Ovomaltine",
        subtitle: "Doce, incrível e colorida.",
        img: "/assets/img/portfolio/5.jpg",
        description: "Doce na medida certa! Coberta com uma camada cremosa de chocolate ao leite, finalizada com confeitos, é a escolha perfeita para os amantes de sobremesa. Irresistivelmente deliciosa do início ao fim.",
        category: "Sobremesa", // Se "Sobremesa" (Pizza Doce) é um tipo de Pizza no backend, ótimo.
        price: "R$ 55,00"
    },
    {
        id: "portfolioModal6",
        databaseId: 6,          // ID da Pizza Frango c/ Requeijão (Catupiry)
        title: "Frango com Catupiry",
        subtitle: "Gostosa como nenhuma outra.",
        img: "/assets/img/portfolio/6.jpg",
        description: "Frango desfiado bem temperado coberto com catupiry cremoso, tudo sobre uma base crocante e dourada. Uma mistura perfeita de textura e sabor que conquista todos os paladares.",
        category: "Pizza",
        price: "R$ 46,00"
    },
];

function PortfolioModals() {
    const navigate = useNavigate();

    const handleAddToCartAndGo = (portfolioItem) => {
        const priceString = portfolioItem.price ? portfolioItem.price.replace('R$ ', '').replace(',', '.') : '0';
        const priceNumber = parseFloat(priceString);

        if (isNaN(priceNumber)) {
            console.error("Preço inválido para o item:", portfolioItem);
            return;
        }

        // --- MUDANÇA IMPORTANTE AQUI ---
        // O ID do item no carrinho agora será o databaseId, que é o ID real do produto.
        // Se databaseId não existir no portfolioItem, usamos um fallback, mas o ideal é que sempre exista.
        const cartItemId = portfolioItem.databaseId || `fallback-${portfolioItem.id}`;
        if (!portfolioItem.databaseId) {
            console.warn(`Item ${portfolioItem.title} não possui databaseId. Usando fallback ID para o carrinho: ${cartItemId}`);
        }

        const cartItem = {
            id: cartItemId, // Este ID será usado para identificar o item no carrinho E para enviar ao backend
            name: portfolioItem.title,
            price: priceNumber,
            quantity: 1,
            image: portfolioItem.img,
            tipo: portfolioItem.category, // 'Pizza', 'Bebida', ou 'Sobremesa'
        };
        // --- FIM DA MUDANÇA ---

        let cart = [];
        try {
            const localCart = localStorage.getItem('cart');
            if (localCart) {
                cart = JSON.parse(localCart);
            }
        } catch (e) {
            console.error("Erro ao ler carrinho do localStorage:", e);
            cart = [];
        }

        const existingItemIndex = cart.findIndex(ci => ci.id === cartItem.id);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push(cartItem);
        }

        try {
            localStorage.setItem('cart', JSON.stringify(cart));
            const modalElement = document.getElementById(portfolioItem.id); // ID HTML do modal

            if (modalElement) {
                let modalInstance = null;
                if (window.bootstrap && window.bootstrap.Modal) {
                    modalInstance = window.bootstrap.Modal.getInstance(modalElement);
                }

                if (modalInstance && typeof modalInstance.hide === 'function') {
                    const handleModalHidden = () => {
                        modalElement.removeEventListener('hidden.bs.modal', handleModalHidden);
                        navigate('/carrinho');
                    };
                    modalElement.addEventListener('hidden.bs.modal', handleModalHidden);
                    modalInstance.hide();
                } else {
                    console.warn("Não foi possível obter a instância do modal Bootstrap ou o método 'hide'. Navegando diretamente.");
                    document.body.classList.remove('modal-open');
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                    const backdrops = document.getElementsByClassName('modal-backdrop');
                    while(backdrops[0]) {
                        backdrops[0].parentNode.removeChild(backdrops[0]);
                    }
                    navigate('/carrinho');
                }
            } else {
                console.warn(`Elemento do modal com ID ${portfolioItem.id} não encontrado. Navegando diretamente.`);
                navigate('/carrinho');
            }
        } catch (e) {
            console.error("Erro ao salvar carrinho no localStorage ou ao tentar fechar modal:", e);
            alert("Erro ao adicionar item ao carrinho.");
        }
    };

    return (
        <>
            {portfolioModalsData.map((item) => (
                <div
                    className="portfolio-modal modal fade"
                    id={item.id} // ID do HTML para o Bootstrap
                    tabIndex={-1}
                    role="dialog"
                    aria-labelledby={`${item.id}Label`}
                    aria-hidden="true"
                    key={item.id} // Key para o React
                >
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="close-modal" data-bs-dismiss="modal" aria-label="Close">
                                <img src="/assets/img/close-icon.svg" alt="Fechar modal" />
                            </div>
                            <div className="container">
                                <div className="row justify-content-center">
                                    <div className="col-lg-8">
                                        <div className="modal-body">
                                            <h2 className="text-uppercase" id={`${item.id}Label`}>{item.title}</h2>
                                            <p className="item-intro text-muted">{item.subtitle}</p>
                                            <img
                                                className="img-fluid d-block mx-auto"
                                                src={item.img || 'https://via.placeholder.com/700x400.png?text=Imagem+Indispon%C3%ADvel'}
                                                alt={item.title}
                                                style={{ marginBottom: '2rem', maxHeight: '400px', objectFit: 'contain' }}
                                            />
                                            <p>{item.description}</p>
                                            {item.price && (
                                                <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#cf301d', marginTop: '1rem' }}>
                                                    Preço: {item.price}
                                                </p>
                                            )}
                                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                                <button
                                                    className="btn btn-secondary btn-xl text-uppercase"
                                                    data-bs-dismiss="modal"
                                                    type="button"
                                                >
                                                    Voltar ao Cardápio
                                                </button>
                                                <button
                                                    className="btn btn-primary btn-xl text-uppercase"
                                                    type="button"
                                                    onClick={() => handleAddToCartAndGo(item)}
                                                    style={{backgroundColor: '#cf301d', borderColor: '#cf301d'}}
                                                >
                                                    Pedir e Ir para Carrinho
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}

export default PortfolioModals;