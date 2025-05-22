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
    setLoggedInUser(null);
    navigate('/login');
  };

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
              {loggedInUser ? ( // Se o utilizador estiver logado
                <div className="nav-item d-flex align-items-center" style={{ gap: '6px' }}>
                  <span
                    className="nav-link px-0"
                    style={{
                      whiteSpace: 'nowrap',
                      color: 'white',
                      fontWeight: 'normal',
                      position: 'relative',
                      top: '0.7px',
                    }}
                  >
                    Olá, {loggedInUser}!
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-sm btn-outline-light"
                  >
                    Sair
                  </button>
                </div>
              ) : ( // Se o utilizador não estiver logado
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