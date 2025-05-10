import React from "react";

// Se as imagens estiverem em public/assets/img/portfolio, use o caminho direto no src.
// Se estiverem em src/assets/img/portfolio, importe assim:
// import img1 from '../assets/img/portfolio/1.jpg';
// import img2 from '../assets/img/portfolio/2.jpg';
// import img3 from '../assets/img/portfolio/3.jpg';
// ...etc

const portfolioItems = [
  {
    title: "Threads",
    subtitle: "Illustration",
    img: "/assets/img/portfolio/1.jpg",
    modal: "#portfolioModal1",
  },
  {
    title: "Explore",
    subtitle: "Graphic Design",
    img: "/assets/img/portfolio/2.jpg",
    modal: "#portfolioModal2",
  },
  {
    title: "Finish",
    subtitle: "Identity",
    img: "/assets/img/portfolio/3.jpg",
    modal: "#portfolioModal3",
  },
  {
    title: "Finish",
    subtitle: "Identity",
    img: "/assets/img/portfolio/4.jpg",
    modal: "#portfolioModal3",
  },
  {
    title: "Finish",
    subtitle: "Identity",
    img: "/assets/img/portfolio/5.jpg",
    modal: "#portfolioModal3",
  },
  {
    title: "Finish",
    subtitle: "Identity",
    img: "/assets/img/portfolio/6.jpg",
    modal: "#portfolioModal3",
  },
  // Adicione mais itens conforme necessário
];

function Portfolio() {
  return (
    <section className="page-section bg-light" id="portfolio">
      <div className="container">
        <div className="text-center">
          <h2 className="section-heading text-uppercase">Portfolio</h2>
          <h3 className="section-subheading text-muted">Lorem ipsum dolor sit amet consectetur.</h3>
        </div>
        <div className="row">
          {portfolioItems.map((item, idx) => (
            <div className="col-lg-4 col-sm-6 mb-4" key={item.title}>
              <div className="portfolio-item">
                <a className="portfolio-link" data-bs-toggle="modal" href={item.modal}>
                  <div className="portfolio-hover">
                    <div className="portfolio-hover-content">
                      <i className="fas fa-plus fa-3x"></i>
                    </div>
                  </div>
                  <img className="img-fluid" src={item.img} alt={item.title} />
                </a>
                <div className="portfolio-caption">
                  <div className="portfolio-caption-heading">{item.title}</div>
                  <div className="portfolio-caption-subheading text-muted">{item.subtitle}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Portfolio;