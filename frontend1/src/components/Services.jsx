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

                        <h4 className="my-3">Pizzas</h4>
                        <p className="text-muted">
                            Cada pizza é preparada com carinho, qualidade e tradição. Tudo começa com uma massa fresca e artesanal, feita diariamente para garantir leveza, crocância e sabor inconfundível.
                        </p>
                    </div>
                    <div className="col-md-4">
                        <span className="fa-stack fa-4x">
                            <i className="fas fa-circle fa-stack-2x text-danger"></i>
                            <i className="fas fa-wine-glass fa-stack-1x fa-inverse"></i>
                        </span>
                        <h4 className="my-3">Bebidas</h4>
                        <p className="text-muted">
                            Bebidas sempre geladas, com uma variedade para todos os gostos — para quem aprecia sua pizza com vinhos, refrigerantes ou um bom suco. O acompanhamento ideal para tornar sua refeição ainda mais saborosa.
                        </p>
                    </div>
                    <div className="col-md-4">
                        <span className="fa-stack fa-4x">
                            <i className="fas fa-circle fa-stack-2x text-danger"></i>
                            <i className="fas fa-motorcycle fa-stack-1x fa-inverse"></i>
                        </span>
                        <h4 className="my-3">Delivery</h4>
                        <p className="text-muted">
                            Temos um serviço próprio de entregas para que você possa receber sua pizza e sua bebida na temperatura perfeita.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Services;