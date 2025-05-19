import React from "react";

const portfolioModals = [
  {
    id: "portfolioModal1",
    title: "Calabresa",
    subtitle: "Classíca.",
    img: "/assets/img/portfolio/1.jpg",
    description:
      "Tradicional e irresistível: fatias generosas de calabresa levemente apimentada, cobertas com cebola, orégano fresco e um toque especial do nosso molho artesanal. Assada até a borda ficar crocante e o sabor incomparável.",
    client: "Threads",
    category: "Illustration",
  },
  {
    id: "portfolioModal2",
    title: "Portuguesa",
    subtitle: "Colonizante não?",
    img: "/assets/img/portfolio/2.jpg",
    description:
      "Uma combinação rica e colorida: presunto, ovo, cebola, pimentão e azeitonas, sobre uma base de queijo e molho caseiro. Uma explosão de sabores que homenageia a tradição.",
          client: "Explore",
    category: "Graphic Design",
  },
  {
    id: "portfolioModal3",
    title: "Muçarela",
    subtitle: "Basica, mas extraordinária.",
    img: "/assets/img/portfolio/3.jpg",
    description:
      "Simples, clássica e amada por todos. Coberta com uma generosa camada de muçarela derretida, realçada com um toque de orégano e nosso molho artesanal. Uma explosão de sabor a cada mordida.",
          client: "Finish",
    category: "Identity",
  },
  {
    id: "portfolioModal4",
    title: "Coca-Cola",
    subtitle: "Refrigerante, sempre uma boa pedida!.",
    img: "/assets/img/portfolio/4.jpg",
    description:
      "Clássica, refrescante e inconfundível. Servida sempre gelada, é a escolha perfeita para acompanhar qualquer pizza. O equilíbrio ideal entre sabor e efervescência que só a Coca tem.",
    client: "Lines",
    category: "Branding",
  },
  {
    id: "portfolioModal5",
    title: "Chocolate",
    subtitle: "Doce, incrivel e colorida.",
    img: "/assets/img/portfolio/5.png",
    description:
      "Doce na medida certa! Coberta com uma camada cremosa de chocolate ao leite, finalizada com confeitos, é a escolha perfeita para os amantes de sobremesa. Irresistivelmente deliciosa do início ao fim.",
    client: "Southwest",
    category: "Website Design",
  },
  {
    id: "portfolioModal6",
    title: "Frango com Catupiry",
    subtitle: "Gostosa como nenhuma outra.",
    img: "/assets/img/portfolio/6.jpg",
    description:
      "Frango desfiado bem temperado coberto com catupiry cremoso, tudo sobre uma base crocante e dourada. Uma mistura perfeita de textura e sabor que conquista todos os paladares.",
    client: "Window",
    category: "Photography",
  },
  // Adicione mais itens conforme necessário
];

function PortfolioModals() {
  return (
    <>
      {portfolioModals.map((item) => (
        <div
          className="portfolio-modal modal fade"
          id={item.id}
          tabIndex={-1}
          role="dialog"
          aria-hidden="true"
          key={item.id}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="close-modal" data-bs-dismiss="modal">
                <img src="/assets/img/close-icon.svg" alt="Close modal" />
              </div>
              <div className="container">
                <div className="row justify-content-center">
                  <div className="col-lg-8">
                    <div className="modal-body">
                      {/* Project details */}
                      <h2 className="text-uppercase">{item.title}</h2>
                      <p className="item-intro text-muted">{item.subtitle}</p>
                      <img
                        className="img-fluid d-block mx-auto"
                        src={item.img}
                        alt={item.title}
                      />
                      <p>{item.description}</p>
                      <ul className="list-inline">
                        <li>
                          
                        </li>
                        <li>
                          
                        </li>
                      </ul>
                      <button
                        className="btn btn-primary btn-xl text-uppercase"
                        data-bs-dismiss="modal"
                        type="button"
                      >
                        <i className="fas fa-xmark me-1"></i>
                        Fechar aba.
                      </button>
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