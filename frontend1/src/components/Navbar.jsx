// src/components/Navbar.jsx

import React, { useState, useEffect } from 'react';
import logo from './../assets/img/logo.png';
import '../assets/css/Navbar.css';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const checkLoginStatus = () => {
      const userName = localStorage.getItem('userName');
      if (userName) {
        setLoggedInUser(userName);
      } else {
        setLoggedInUser(null);
      }
    };

    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('clienteId');
    setLoggedInUser(null);
    navigate('/login');
  };

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.getElementById("mainNav");
      if (navbar) {
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

  const shoppingCartIcon = (
    <svg
      width="28"
      height="28"
      viewBox="0 0 32 32"
      fill="none"
      style={{ verticalAlign: 'middle' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(6.8,6.8)">
        <circle cx="5" cy="17" r="1.5" fill="#fff"/>
        <circle cx="14" cy="17" r="1.5" fill="#fff"/>
        <path
          d="M-1 0H1L2.68 12.39C2.84 13.66 3.91 14.67 5.19 14.67H14.5C15.78 14.67 16.85 13.66 17.01 12.39L17.82 5.39C17.93 4.47 17.21 3.67 16.28 3.67H3.12"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );

  // SVG do ícone de usuário (que você já tinha)
  const userIcon = (
    <svg
      width="28"
      height="28"
      viewBox="0 0 32 32" 
      fill="none"
      style={{ verticalAlign: 'middle' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <circle cx="16" cy="13" r="5" fill="#fff" />
        <path d="M8 25c0-4 4-7 8-7s8 3 8 7" fill="#fff" />
      </g>
    </svg>
  );

  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top custom-navbar" id="mainNav">
      <div className="container">
        <a className="navbar-brand" href="#page-top">
          <img src={logo} alt="Logo" style={{ height: 60 }} />
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
            {/* ALTERADO: Link para a rota /cardapio */}
            <li className="nav-item"><Link className="nav-link" to="/cardapio">Cardápio</Link></li>
            <li className="nav-item"><a className="nav-link" href="#about">Trajetória</a></li>
            <li className="nav-item"><a className="nav-link" href="#team">Time</a></li>
            <li className="nav-item"><a className="nav-link" href="#footer">Contatos</a></li>
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
                        textTransform: "none",
                        padding: '0'
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "8px", position: "relative", top: "-4px"  }}>
                        {userIcon} {/* Usando a constante userIcon aqui */}
                      </span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownUsuario" >
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
                  <Link to="/carrinho" className="nav-link p-0" style={{ marginBottom: '8px' }}>
                    {shoppingCartIcon}
                  </Link>
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