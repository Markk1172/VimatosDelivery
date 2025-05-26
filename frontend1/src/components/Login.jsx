import React, { useState } from 'react';
import backgroundImage from '../assets/img/login.jpg';
import logo from '../assets/img/logo.png';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [rightPanelActive, setRightPanelActive] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        localStorage.setItem('userName', data.userName);
        localStorage.setItem('userEmail', data.userEmail);
        localStorage.setItem('isFuncionario', data.is_funcionario);

        if (data.clienteId !== null && data.clienteId !== undefined) {
          localStorage.setItem('clienteId', data.clienteId);
        } else {
          localStorage.removeItem('clienteId');
        }

        showMessage('Login realizado com sucesso!', 'success');

        if (data.is_funcionario) {
          navigate('/fila-pedidos');
        } else {
          navigate('/');
        }
      } else {
        showMessage(data.error || 'Erro no login. Verifique as suas credenciais.', 'error');
      }
    } catch (error) {
      console.error('Erro ao conectar com o servidor:', error);
      showMessage('Erro ao conectar com o servidor. Tente novamente mais tarde.', 'error');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const rawData = Object.fromEntries(formData.entries());


    const userDataForBackend = {
        username: rawData.username,
        nome: rawData.name,
        email: rawData.email,
        password: rawData.password,
        data_nasc: rawData.birthdate,
        cpf: rawData.cpf,
        telefone: rawData.phone,
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userDataForBackend),
      });

      const data = await response.json();
      if (response.ok) {
        showMessage('Registo realizado com sucesso! Faça login agora.', 'success');
        setRightPanelActive(false);
      } else {
        let errorMessage = 'Erro no registo.';
        if (data && typeof data === 'object') {
            const errorKeys = Object.keys(data);
            if (errorKeys.length > 0) {
                const firstKey = errorKeys[0];
                if (Array.isArray(data[firstKey])) {
                    errorMessage = `${firstKey}: ${data[firstKey].join(', ')}`;
                } else {
                    errorMessage = `${firstKey}: ${data[firstKey]}`;
                }
            } else if (data.error) {
                 errorMessage = data.error;
            } else if (data.detail) {
                errorMessage = data.detail;
            }
        }
        showMessage(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Erro ao conectar com o servidor:', error);
      showMessage('Erro ao conectar com o servidor. Tente novamente mais tarde.', 'error');
    }
  };

  const messageStyles = {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '10px 20px',
    borderRadius: '5px',
    color: 'white',
    zIndex: 10000,
    textAlign: 'center',
    minWidth: '300px',
  };

  const successStyle = { ...messageStyles, backgroundColor: 'green' };
  const errorStyle = { ...messageStyles, backgroundColor: 'red' };

  const cssStyles = `
    :root {
      --white: #e9e9e9;
      --gray: #333;
      --blue: #CF301D;
      --lightblue: #E04725;
      --button-radius: 0.7rem;
      --max-width: 1300px;
      --max-height: 700px; /* Ajustado para caber mais campos no cadastro */
      font-size: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
        Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    }

    body {
      align-items: center;
      background-color: var(--white);
      background-attachment: fixed;
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
      display: grid;
      height: 100vh;
      place-items: center;
      overflow: hidden;
    }

    .form__title {
      font-weight: 300;
      margin: 0 0 1.25rem 0;
      text-align: center;
      width: 100%;
    }

    .container {
      background-color: var(--white);
      border-radius: var(--button-radius);
      box-shadow: 0 0.9rem 1.7rem rgba(0, 0, 0, 0.25),
        0 0.7rem 0.7rem rgba(0, 0, 0, 0.22);
      height: var(--max-height);
      max-width: var(--max-width);
      overflow: hidden;
      position: relative;
      width: 100%;
    }

    .container__form {
      height: 100%;
      position: absolute;
      top: 0;
      transition: all 0.6s ease-in-out;
    }

    .container--signin {
      left: 0;
      width: 50%;
      z-index: 2;
    }

    .container.right-panel-active .container--signin {
      transform: translateX(100%);
    }

    .container--signup {
      left: 0;
      opacity: 0;
      width: 50%;
      z-index: 1;
    }

    .container.right-panel-active .container--signup {
      animation: show 0.6s;
      opacity: 1;
      transform: translateX(100%);
      z-index: 5;
    }

    .form {
      background-color: var(--white);
      display: flex;
      align-items: flex-start; /* Alinha itens à esquerda/topo */
      justify-content: center;
      flex-direction: column;
      padding: 0.5rem 3rem; /* Padding reduzido para mais espaço vertical */
      height: 100%;
      text-align: center;
      overflow-y: auto; /* Permite scroll se o conteúdo exceder */
    }
     /* Ajuste específico para o formulário de cadastro ter mais espaço */
    .container--signup .form {
        padding: 0.5rem 2.5rem; /* Menos padding horizontal para mais espaço */
    }


    .input {
      background-color: #fff;
      border: none;
      padding: 0.8rem 0.8rem; /* Padding do input levemente reduzido */
      margin: 0.3rem 0; /* Margem do input levemente reduzida */
      width: 100%;
      border-radius: 0.3rem; /* Borda arredondada para inputs */
    }

    .container__overlay {
      height: 100%;
      left: 50%;
      overflow: hidden;
      position: absolute;
      top: 0;
      transition: transform 0.6s ease-in-out;
      width: 50%;
      z-index: 100;
    }

    .container.right-panel-active .container__overlay {
      transform: translateX(-100%);
    }

    .overlay {
      background-color: var(--lightblue);
      background-attachment: fixed;
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
      height: 100%;
      left: -100%;
      position: relative;
      transform: translateX(0);
      transition: transform 0.6s ease-in-out;
      width: 200%;
    }

    .container.right-panel-active .overlay {
      transform: translateX(50%);
    }

    .overlay__panel {
      align-items: center;
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: center;
      position: absolute;
      text-align: center;
      top: 0;
      transform: translateX(0);
      transition: transform 0.6s ease-in-out;
      width: 50%;
      padding: 0 2rem; /* Adicionado padding para o texto não colar nas bordas */
    }

    .overlay--left {
      transform: translateX(-20%);
    }

    .container.right-panel-active .overlay--left {
      transform: translateX(0);
    }

    .overlay--right {
      right: 0;
      transform: translateX(0);
    }

    .container.right-panel-active .overlay--right {
      transform: translateX(20%);
    }

    .btn {
      background-color: var(--blue);
      background-image: linear-gradient(90deg, var(--blue) 0%, var(--lightblue) 74%);
      border-radius: 20px;
      border: 1px solid var(--blue);
      color: var(--white);
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: bold;
      letter-spacing: 0.1rem;
      padding: 0.9rem 4rem;
      text-transform: uppercase;
      transition: transform 80ms ease-in;
    }

    .form > .btn {
      margin-top: 1rem; /* Margem do botão reduzida */
      align-self: center;
    }

    .btn:active {
      transform: scale(0.95);
    }

    .btn:focus {
      outline: none;
    }

    @keyframes show {
      0%, 49.99% {
        opacity: 0;
        z-index: 1;
      }
      50%, 100% {
        opacity: 1;
        z-index: 5;
      }
    }

    /* Media query para telas menores */
    @media screen and (max-width: 768px) {
        :root {
            --max-height: auto; /* Altura automática para mobile */
        }
        .container {
            max-height: none;
            height: auto;
            margin-top: 20px; /* Adiciona margem no topo em telas pequenas */
            margin-bottom: 20px; /* Adiciona margem em baixo em telas pequenas */
        }
        .container__form {
            width: 100%;
            position: relative;
            transform: none !important; /* Remove transform para empilhar */
            height: auto; /* Altura automática para os formulários */
            padding-bottom: 2rem; /* Espaço no final do formulário */
        }
        .container--signup {
            order: 2; /* Formulário de cadastro aparece depois do login */
            opacity: 1; /* Garante visibilidade */
        }
        .container--signin {
            order: 1; /* Formulário de login aparece primeiro */
        }
        .container.right-panel-active .container--signup {
            transform: none !important;
        }
        .container.right-panel-active .container--signin {
            transform: none !important;
        }
        .container__overlay {
            display: none; /* Oculta o overlay em telas pequenas */
        }
        .form {
            padding: 0.5rem 1.5rem; /* Mais padding para telas pequenas */
        }
         .form__title {
            margin-top: 1rem; /* Espaço acima do título */
            font-size: 1.5em; /* Título menor */
        }
    }
  `;

  return (
    <div
      id="login-page"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden", 
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />

      {message.text && (
        <div style={message.type === 'success' ? successStyle : errorStyle}>
          {message.text}
        </div>
      )}

      <div className={`container ${rightPanelActive ? "right-panel-active" : ""}`}>
        <div className="container__form container--signup" id="signup-form">
          <form onSubmit={handleRegister} className="form">
            <h2 className="form__title">Cadastro</h2>
            <input name="username" type="text" placeholder="Nome de usuário" className="input" required />
            <input name="name" type="text" placeholder="Nome completo" className="input" required />
            <input name="email" type="email" placeholder="E-mail" className="input" required />
            <input name="phone" type="tel" placeholder="Telefone (somente números)" pattern="\d{10,11}" title="Telefone com DDD (10 ou 11 dígitos)" className="input" required />
            <input name="birthdate" type="date" placeholder="Data de nascimento" className="input" required />
            <input name="cpf" type="text" placeholder="CPF (somente números)" pattern="\d{11}" title="CPF com 11 dígitos" className="input" required />
            <input name="password" type="password" placeholder="Senha" className="input" required />
            <button type="submit" className="btn">Criar conta</button>
          </form>
        </div>

        <div className="container__form container--signin" id="login-form">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="#cf301d"
            className="bi bi-arrow-left-circle-fill"
            viewBox="0 0 16 16"
            style={{
              cursor: 'pointer',
              position: 'absolute',
              top: '20px',
              left: '20px',
              zIndex: 1000,
            }}
            onClick={() => navigate('/')} 
          >
            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.5 7.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
          </svg>

          <img
            src={logo}
            alt="Logo"
            style={{
              width: '120px',
              position: 'absolute',
              top: '15%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}
          />

          <form onSubmit={handleLogin} className="form">
            <h2 className="form__title">Entrar</h2>
            <input name="email" type="email" placeholder="Email" className="input" required />
            <input name="password" type="password" placeholder="Senha" className="input" required />
            <button type="submit" className="btn">Acessar</button>
          </form>
        </div>

        <div className="container__overlay">
          <div className="overlay" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <div className="overlay__panel overlay--left">
              <button className="btn" onClick={() => setRightPanelActive(false)}>
                Fazer login
              </button>
            </div>
            <div className="overlay__panel overlay--right">
              <button className="btn" onClick={() => setRightPanelActive(true)}>
                Criar conta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;