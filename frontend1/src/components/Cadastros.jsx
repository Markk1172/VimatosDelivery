import React, { useEffect, useState } from 'react';
import logo from '../assets/img/logo.png';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [hoveredLink, setHoveredLink] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();

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
    return () => window.removeEventListener('storage', checkLoginStatus);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setLoggedInUser(null);
    navigate('/login');
  };

  const navbarStyle = {
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #dee2e6',
    padding: '1rem 2rem',
    position: 'sticky',
    top: 0,
    zIndex: 999,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'Arial, sans-serif',
  };

  const brandStyle = {
    fontWeight: 700,
    fontSize: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const linksContainerStyle = {
    display: 'flex',
    gap: '4rem',
    marginRight: '20rem',
  };

  const authContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginLeft: 'auto',
  };

  const getLinkStyle = (index) => ({
    color: hoveredLink === index ? '#cf301d' : '#343a40',
    textDecoration: 'none',
    fontWeight: 600,
    transition: 'color 0.2s ease-in-out',
    fontSize: '1rem',
  });

  const links = [
    { href: '/fila-pedidos', label: 'PREPARANDO' },
    { href: '/entrega', label: 'ENTREGA / RETIRADA' },
    { href: '/cadastros', label: 'CADASTROS' },
  ];
  
  return (
    <nav style={navbarStyle}>
      <div style={brandStyle}>
        <img src={logo} alt="Logo" style={{ height: 40, width: 'auto' }} />
        <span>Gestão de Cadastros</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
        <div style={linksContainerStyle}>
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              style={getLinkStyle(index)}
              onMouseEnter={() => setHoveredLink(index)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div style={authContainerStyle}>
          {loggedInUser ? (
            <>
              <span style={{ color: '#343a40' }}>Olá, {loggedInUser}!</span>
              <button
                onClick={handleLogout}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Sair
              </button>
            </>
          ) : (
            <a
              href="/login"
              style={{
                textDecoration: 'none',
                fontWeight: '600',
                color: '#343a40',
              }}
            >
              Login
            </a>
          )}
        </div>
      </div>
    </nav>
  );
};

const Cadastros = () => {
  const [categoria, setCategoria] = useState('');

  const pageStyle = {
    backgroundColor: '#E9E9E9',
    minHeight: '100vh',
    paddingBottom: '2rem',
  };
  
  const formContainerStyle = {
    maxWidth: '450px',
    margin: '2rem auto',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };
  
  const handleChange = (e) => setCategoria(e.target.value);

  const [formData, setFormData] = useState({});

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`${categoria} cadastrado:`, formData);
    alert(`${categoria} cadastrado com sucesso!`);
    setFormData({});
  };

  const inputStyle = { padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' };
  const formStyle = { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 400 };

  const btnStyle = {
    backgroundColor: '#007bff',
    backgroundImage: 'linear-gradient(90deg, rgb(40, 167, 69) 0%, rgb(40, 167, 69) 74%)',
    borderRadius: '20px',
    border: '1px solid rgb(40, 167, 69)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    letterSpacing: '0.1rem',
    padding: '0.9rem 4rem',
    textTransform: 'uppercase',
    transition: 'transform 80ms ease-in',
    marginTop: '1.5rem',
    alignSelf: 'center',
  };

  return (
    <div style={pageStyle}>
    <Navbar />
      <div style={formContainerStyle}>
        <h2 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: '2.5rem', textAlign: 'center', }} >Cadastros</h2> 

        <select value={categoria} onChange={handleChange} style={{ marginBottom: '1rem', ...inputStyle }}>
          <option value="">Selecione uma categoria</option>
          <option value="pizza">Pizza</option>
          <option value="bebida">Bebida</option>
          <option value="funcionario">Funcionário</option>
          <option value="motoboy">Motoboy</option>
          <option value="cupom">Cupom de Desconto</option>
        </select>

        {categoria === 'pizza' && (
          <form onSubmit={handleSubmit} style={formStyle}>
            <label>Nome da Pizza</label>
            <input name="nome" placeholder="Ex: Calabresa" onChange={handleInputChange} style={inputStyle} required />
            <label>Foto da Pizza</label>
            <input type="file" name="foto" accept="image/*" onChange={handleInputChange} style={inputStyle} required />
            <label>Ingredientes</label>
            <input name="ingredientes" placeholder="Ex: Calabresa, cebola, mussarela" onChange={handleInputChange} style={inputStyle} required />
            <label>Preço (R$)</label>
            <input type="number" name="preco" placeholder="Ex: 39.90" onChange={handleInputChange} style={inputStyle} required />
            <button type="submit" style={btnStyle}>Salvar Pizza</button>
          </form>
        )}

        {categoria === 'bebida' && (
          <form onSubmit={handleSubmit} style={formStyle}>
            <label>Nome da Bebida</label>
            <input name="nome" placeholder="Ex: Coca-Cola" onChange={handleInputChange} style={inputStyle} required />
            <label>Foto da Bebida</label>
            <input type="file" name="foto" accept="image/*" onChange={handleInputChange} style={inputStyle} required />
            <label>Preço (R$)</label>
            <input type="number" name="preco" placeholder="Ex: 6.00" onChange={handleInputChange} style={inputStyle} required />
            <button type="submit" style={btnStyle}>Salvar Bebida</button>
          </form>
        )}

        {categoria === 'funcionario' && (
          <form onSubmit={handleSubmit} style={formStyle}>
            <label>Nome do Funcionário</label>
            <input name="nome" placeholder="Ex: João Silva" onChange={handleInputChange} style={inputStyle} required />
            <label>Cargo</label>
            <input name="cargo" placeholder="Ex: Atendente" onChange={handleInputChange} style={inputStyle} required />
            <label>Telefone</label>
            <input name="telefone" placeholder="Ex: (61) 99999-0000" onChange={handleInputChange} style={inputStyle} required />
            <label>Foto do Documento (RG ou CNH)</label>
            <input type="file" name="fotoDocumento" accept="image/*" onChange={handleInputChange} style={inputStyle} required />
            <button type="submit" style={btnStyle}>Salvar Funcionário</button>
          </form>
        )}

        {categoria === 'motoboy' && (
          <form onSubmit={handleSubmit} style={formStyle}>
            <label>Nome do Motoboy</label>
            <input name="nome" placeholder="Ex: Carlos Souza" onChange={handleInputChange} style={inputStyle} required />
            <label>Placa da Moto</label>
            <input name="placa" placeholder="Ex: ABC-1234" onChange={handleInputChange} style={inputStyle} required />
            <label>Telefone</label>
            <input name="telefone" placeholder="Ex: (61) 98888-7777" onChange={handleInputChange} style={inputStyle} required />
            <label>Foto da CNH</label>
            <input type="file" name="fotoCNH" accept="image/*" onChange={handleInputChange} style={inputStyle} required />
            <label>Foto do Documento da Moto</label>
            <input type="file" name="fotoDocumentoMoto" accept="image/*" onChange={handleInputChange} style={inputStyle} required />
            <button type="submit" style={btnStyle}>Salvar Motoboy</button>
          </form>
        )}

       {categoria === 'cupom' && (
          <form onSubmit={handleSubmit} style={formStyle}>
            <label>Código do Cupom</label>
            <input name="codigo" placeholder="Ex: PROMO20" onChange={handleInputChange} style={inputStyle} required />
            <label>Porcentagem de Desconto (%)</label>
            <input type="number" name="desconto" placeholder="Ex: 20" onChange={handleInputChange} style={inputStyle} required />
            <label>Data de Validade</label>
            <input   type="date" name="validade" onChange={handleInputChange} style={inputStyle} required />
            <button type="submit" style={btnStyle}>Salvar Cupom</button>
          </form>
        )}
      </div>
      </div>    
    );
};

export default Cadastros;
