import React from "react";
import img1 from '../assets/img/portfolio/1.jpg'; 
import img2 from '../assets/img/portfolio/10.jpg';
import img3 from '../assets/img/portfolio/3.jpg';
import img4 from '../assets/img/portfolio/4.jpg';
import img5 from '../assets/img/portfolio/5.jpg';
import img6 from '../assets/img/portfolio/6.jpg';

const portfolioItems = [
  {
    title: "Calabresa",
    subtitle: "Classica, com cebola",
    img: img1,
    modal: "#portfolioModal1",
  },
  {
    title: "Margherita",
    subtitle: "Queijo, tomate, orégano e manjericão.",
    img: img2,
    modal: "#portfolioModal2",
  },
  {
    title: "Muçarela",
    subtitle: "Bem queijuda, oréganoza :)",
    img: img3,
    modal: "#portfolioModal3",
  },
  {
    title: "Coca-Cola",
    subtitle: "A inconfundível",
    img: img4,
    modal: "#portfolioModal4",
  },
  {
    title: "Chocolate",
    subtitle: "Saborosa e doce",
    img: img5,
    modal: "#portfolioModal5",
  },
  {
    title: "Frango e Catupiry",
    subtitle: "Deliciosa combinação",
    img: img6,
    modal: "#portfolioModal6",
  },
];

function Portfolio() {
  return (
    <section className="page-section bg-light" id="portfolio">
      <div className="container">
        <div className="text-center">
          <h2 className="section-heading text-uppercase">Os Queridinhos</h2>
          <h3 className="section-subheading text-muted">As estrelas do nosso cardápio que você precisa provar!</h3>
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
                  <img className="img-fluid" src={item.img} alt={item.title}   style={{ width: "100%", height: "250px", objectFit: "cover" }} />
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