import React from 'react';
import '../assets/css/styles.css'; // Caminho corrigido

function Services() {
    return (
        <section className="page-section" id="services">
            <div className="container">
                <div className="text-center">
                    <h2 className="section-heading text-uppercase">Serviços</h2>
                    <h3 className="section-subheading text-muted">
                        Pizzas deliciosas, feitas com amor e carinho. <br />
                    </h3>
                </div>
                <div className="row text-center">
                    <div className="col-md-4">
                        <span className="fa-stack fa-4x">
                        <i className="fas fa-circle fa-stack-2x text-danger"></i> {/* fundo vermelho */}
                        <i className="fas fa-pizza-slice fa-stack-1x fa-inverse"></i> {/* ícone branco */}
                    </span>

                        <h4 className="my-3">E-Commerce</h4>
                        <p className="text-muted">
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minima maxime quam architecto quo inventore harum ex magni, dicta impedit.
                        </p>
                    </div>
                    <div className="col-md-4">
                        <span className="fa-stack fa-4x">
                            <i className="fas fa-circle fa-stack-2x text-danger"></i>
                            <i className="fas fa-wine-glass fa-stack-1x fa-inverse"></i>
                        </span>
                        <h4 className="my-3">Responsive Design</h4>
                        <p className="text-muted">
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minima maxime quam architecto quo inventore harum ex magni, dicta impedit.
                        </p>
                    </div>
                    <div className="col-md-4">
                        <span className="fa-stack fa-4x">
                            <i className="fas fa-circle fa-stack-2x text-danger"></i>
                            <i className="fas fa-motorcycle fa-stack-1x fa-inverse"></i>
                        </span>
                        <h4 className="my-3">Web Security</h4>
                        <p className="text-muted">
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minima maxime quam architecto quo inventore harum ex magni, dicta impedit.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Services;