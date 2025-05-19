import React from 'react';

function Header() {
  return (
    <header className="masthead">
      <div className="container">
        <div className="masthead-subheading">Bem-vindo ao Vimatos Delivery!</div>
        <div className="masthead-heading text-uppercase">É um prazer te ver aqui</div>
        <a className="btn btn-danger btn-xl text-uppercase" href="#services">Saiba mais</a>
      </div>
    </header>
  );
}

export default Header;