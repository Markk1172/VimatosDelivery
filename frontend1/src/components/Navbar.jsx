import React, { useEffect } from 'react';
import logo from './../assets/img/logo.png';
import '../assets/css/Navbar.css';
import { Link } from 'react-router-dom';

function Navbar() {
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.getElementById("mainNav");
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            <li className="nav-item"><a className="nav-link" href="#services">Serviços</a></li>
            <li className="nav-item"><a className="nav-link" href="#portfolio">Cardápio</a></li>
            <li className="nav-item"><a className="nav-link" href="#about">Trajetória</a></li>
            <li className="nav-item"><a className="nav-link" href="#team">Time</a></li>
            <li className="nav-item"><a className="nav-link" href="#contact">Contatos</a></li>
            <li className="nav-item">
              <Link to="/login" className="nav-link">Login</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
