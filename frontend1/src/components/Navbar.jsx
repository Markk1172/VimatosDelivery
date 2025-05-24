// src/components/Navbar.jsx

import React, { useState, useEffect } from 'react';
import logo from './../assets/img/logo.png';
import '../assets/css/Navbar.css';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    // Função para verificar o status de login
    const checkLoginStatus = () => {
      const userName = localStorage.getItem('userName');
      if (userName) {
        setLoggedInUser(userName);
      } else {
        setLoggedInUser(null);
      }
    };

    // Chama a função na montagem do componente
    checkLoginStatus();

    // Adiciona um event listener para o evento 'storage'.
    window.addEventListener('storage', checkLoginStatus);

    // Função de limpeza para remover o event listener quando o componente é desmontado
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  // Função para lidar com o logout
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('clienteId'); // Keep this line from the first version
    setLoggedInUser(null);
    navigate('/login');
  };

  // The handleEditProfileClick function from the first version is replaced by the dropdown menu links.
  // const handleEditProfileClick = () => {
  //   navigate('/profile/edit');
  // };

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.getElementById("mainNav");
      if (navbar) { // Added null check for navbar
        if (window.scrollY > 50) {
          navbar.classList.add("scrolled");
        } else {
          navbar.classList.remove("scrolled");
        }
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
              {loggedInUser ? (
                <div className="nav-item d-flex align-items-center" style={{ gap: '6px' }}>
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
                        textTransform: "none"
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <svg width="28" height="28" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="20" cy="20" r="20" fill="#cf301d"/>
                          <path
                            d="M20 24c3.313 0 6-2.687 6-6s-2.687-6-6-6-6 2.687-6 6 2.687 6 6 6zm0 2c-4.418 0-12 2.239-12 6.5V36a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-3.5C32 28.239 24.418 26 20 26z"
                            fill="#fff"
                            transform="scale(0.82) translate(3.6,0)"
                          />
                        </svg>
                      </span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownUsuario">
                      <h6 className="dropdown-header">
                        Olá, {loggedInUser}!
                      </h6>
                      <li>
                        <Link className="dropdown-item" to="/profile/edit">Meu Perfil</Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/pedidos">Meus Pedidos</Link>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <button className="dropdown-item" onClick={handleLogout}>Sair</button>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="nav-link">Login</Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;