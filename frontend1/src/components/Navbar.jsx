import React from 'react';
import logo from './../assets/img/logo.jpg'; // ajuste conforme a localização real do logo
import './Navbar.css'; // crie este arquivo para os estilos customizados

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top custom-navbar" id="mainNav">
      <div className="container">
        <a className="navbar-brand" href="#page-top">
          <img src={logo} alt="Logo" style={{ height: 40 }} />
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarResponsive"
          aria-controls="navbarResponsive"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          Menu <i className="fas fa-bars ms-1"></i>
        </button>
        <div className="collapse navbar-collapse" id="navbarResponsive">
          <ul className="navbar-nav text-uppercase ms-auto py-4 py-lg-0">
            <li className="nav-item"><a className="nav-link" href="#services">Servicesa</a></li>
            <li className="nav-item"><a className="nav-link" href="#portfolio">Portfolio</a></li>
            <li className="nav-item"><a className="nav-link" href="#about">About</a></li>
            <li className="nav-item"><a className="nav-link" href="#team">Team</a></li>
            <li className="nav-item"><a className="nav-link" href="#contact">Contact</a></li>
            <li className="nav-item"><a className="nav-link" href="#contact">Login</a></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;