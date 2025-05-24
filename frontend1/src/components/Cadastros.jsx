import React, { useEffect, useState } from 'react';
import logo from '../assets/img/logo.png';
import { useNavigate, Link } from 'react-router-dom'; // Importar Link

const Navbar = () => {
  const [hoveredLink, setHoveredLink] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isFuncionario, setIsFuncionario] = useState(false); // Novo estado
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserStatus = () => {
      const userName = localStorage.getItem('userName');
      const funcionarioStatus = localStorage.getItem('isFuncionario') === 'true'; // Verifica se é funcionário

      if (userName) {
        setLoggedInUser(userName);
        setIsFuncionario(funcionarioStatus); // Define o estado de funcionário
      } else {
        setLoggedInUser(null);
        setIsFuncionario(false);
      }
    };

    checkUserStatus();
    window.addEventListener('storage', checkUserStatus); // Ouve mudanças no localStorage
    return () => window.removeEventListener('storage', checkUserStatus);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('clienteId');
    localStorage.removeItem('isFuncionario'); // Remove o status de funcionário
    setLoggedInUser(null);
    setIsFuncionario(false);
    navigate('/login');
  };

  const navbarStyle = {
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #dee2e6',
    padding: '1rem 3rem',
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
    textDecoration: 'none', // Para o Link da marca
    color: '#343a40',      // Cor da marca
  };

  const linksContainerStyle = {
    display: 'flex',
    gap: '2rem', // Reduzido o gap para melhor encaixe
    // marginRight: '20rem', // Removido ou ajustado se necessário
  };

  const authContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    // marginLeft: 'auto', // Removido para centralizar melhor com o flex da navbar
  };

  const getLinkStyle = (isHovered) => ({ // Modificado para aceitar boolean
    color: isHovered ? '#cf301d' : '#343a40',
    textDecoration: 'none',
    fontWeight: 600,
    transition: 'color 0.2s ease-in-out',
    fontSize: '1rem',
  });

  // Links de funcionário
  const funcionarioLinks = [
    { to: '/fila-pedidos', label: 'PREPARANDO' },
    { to: '/entrega-retirada', label: 'ENTREGA / RETIRADA' }, // Corrigido o 'to'
    { to: '/cadastros', label: 'CADASTROS' },
  ];

  return (
    <nav style={navbarStyle}>
      <Link to={isFuncionario ? "/fila-pedidos" : "/"} style={brandStyle}> {/* Link para home de funcionário ou cliente */}
        <img src={logo} alt="Logo" style={{ height: 40, width: 'auto' }} />
        <span>{isFuncionario ? 'Gestão Pizzaria' : 'Vimatos Delivery'}</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
        {/* Renderiza os links de funcionário apenas se isFuncionario for true */}
        {isFuncionario && (
          <div style={linksContainerStyle}>
            {funcionarioLinks.map((link, index) => (
              <Link // Usar Link do react-router-dom
                key={index}
                to={link.to}
                style={getLinkStyle(hoveredLink === index)}
                onMouseEnter={() => setHoveredLink(index)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div style={authContainerStyle}>
        {loggedInUser ? (
          <>
            <span style={{ color: '#343a40', whiteSpace: 'nowrap' }}>Olá, {loggedInUser}!</span>
            <button
              onClick={handleLogout}
              style={{
                padding: '6px 12px',
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Sair
            </button>
          </>
        ) : (
          <Link // Usar Link do react-router-dom
            to="/login"
            style={{
              textDecoration: 'none',
              fontWeight: '600',
              color: '#343a40',
              padding: '6px 12px',
              backgroundColor: '#007bff',
              color: '#fff',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

// Exportar Navbar se ainda não estiver
// export default Navbar; // Descomente se este for o final do arquivo Navbar.jsx

// ====================================================================================
// Cadastros.jsx
// ====================================================================================

const Cadastros = () => {
  const [categoria, setCategoria] = useState('');
  const [formData, setFormDataState] = useState({}); // Renomeado para evitar conflito com window.FormData
  const [message, setMessage] = useState({ text: '', type: '' }); // Para feedback
  const navigate = useNavigate();

  // Função para exibir mensagens (pode ser movida para um utilitário se usada em mais lugares)
  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleCategoriaChange = (e) => {
    setCategoria(e.target.value);
    setFormDataState({}); // Limpa o formulário ao mudar de categoria
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormDataState((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value,
    }));
  };

  const getApiEndpoint = (cat) => {
    switch (cat) {
      case 'pizza': return 'http://127.0.0.1:8000/api/pizzas/';
      case 'bebida': return 'http://127.0.0.1:8000/api/bebidas/';
      case 'funcionario': return 'http://127.0.0.1:8000/api/funcionarios/'; // Ajuste se o endpoint for outro
      case 'motoboy': return 'http://127.0.0.1:8000/api/motoboys/';     // Ajuste se o endpoint for outro
      case 'cupom': return 'http://127.0.0.1:8000/api/cupons/';       // Endpoint hipotético para cupons
      default: return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      showMessage('Acesso não autorizado. Faça login novamente.', 'error');
      navigate('/login');
      return;
    }

    const endpoint = getApiEndpoint(categoria);
    if (!endpoint) {
      showMessage('Categoria inválida selecionada.', 'error');
      return;
    }

    // Para envio de arquivos, precisamos usar FormData
    const submissionData = new FormData();
    for (const key in formData) {
      submissionData.append(key, formData[key]);
    }

    // Adicionar campos específicos que podem não estar no estado formData diretamente
    // Ex: se o backend espera 'sabor' para pizza e no form está 'nome'
    if (categoria === 'pizza' && formData.nome) submissionData.set('sabor', formData.nome);
    // Adicione outros mapeamentos se necessário

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          // Não defina 'Content-Type' ao usar FormData; o navegador fará isso.
        },
        body: submissionData,
      });

      if (response.ok) {
        const responseData = await response.json();
        showMessage(`${categoria.charAt(0).toUpperCase() + categoria.slice(1)} cadastrado(a) com sucesso!`, 'success');
        setFormDataState({}); // Limpa o formulário
        setCategoria(''); // Opcional: reseta a categoria
      } else if (response.status === 401 || response.status === 403) {
        showMessage('Sua sessão expirou ou você não tem permissão. Faça login novamente.', 'error');
        navigate('/login');
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido ao cadastrar.' }));
        // Tenta extrair mensagens de erro mais específicas do backend
        let backendError = errorData.detail || '';
        if (typeof errorData === 'object' && !backendError) {
            for (const key in errorData) {
                if (Array.isArray(errorData[key])) {
                    backendError += `${key}: ${errorData[key].join(', ')} `;
                } else {
                    backendError += `${key}: ${errorData[key]} `;
                }
            }
        }
        showMessage(`Erro ao cadastrar ${categoria}: ${backendError || response.statusText}`, 'error');
      }
    } catch (error) {
      console.error(`Erro na requisição para ${categoria}:`, error);
      showMessage('Erro de rede ou servidor. Tente novamente.', 'error');
    }
  };


  const pageStyle = {
    backgroundColor: '#E9E9E9',
    minHeight: '100vh',
    paddingBottom: '2rem',
  };
  
  const formContainerStyle = {
    maxWidth: '500px', // Aumentado um pouco
    margin: '2rem auto',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem', // Aumentado o gap
  };
  
  const inputStyle = { padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' };
  const formStyle = { display: 'flex', flexDirection: 'column', gap: '1rem' }; // Removido maxWidth daqui

  const btnStyle = {
    backgroundColor: '#28a745', // Cor verde para salvar
    // backgroundImage: 'linear-gradient(90deg, rgb(40, 167, 69) 0%, rgb(40, 167, 69) 74%)', // Removido gradiente
    borderRadius: '8px', // Menos arredondado
    border: 'none', // Removida borda desnecessária
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1rem', // Tamanho de fonte um pouco maior
    fontWeight: 'bold',
    letterSpacing: '0.05rem', // Menos espaçamento
    padding: '0.75rem 2rem', // Ajustado padding
    textTransform: 'uppercase',
    transition: 'background-color 0.2s ease-in-out, transform 80ms ease-in',
    marginTop: '1.5rem',
    alignSelf: 'center',
    width: '100%', // Botão ocupa largura total
  };

  // Estilos para mensagens de feedback (semelhante ao Login)
  const messageFeedbackStyles = {
    position: 'fixed',
    top: '80px', // Abaixo da navbar
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '10px 20px',
    borderRadius: '5px',
    color: 'white',
    zIndex: 1000, // Acima do conteúdo, abaixo de modais se houver
    textAlign: 'center',
    minWidth: '300px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  };
  const successFeedbackStyle = { ...messageFeedbackStyles, backgroundColor: 'green' };
  const errorFeedbackStyle = { ...messageFeedbackStyles, backgroundColor: 'red' };


  return (
    <div style={pageStyle}>
      <Navbar /> {/* Navbar é renderizada aqui */}
      {message.text && (
        <div style={message.type === 'success' ? successFeedbackStyle : errorFeedbackStyle}>
          {message.text}
        </div>
      )}
      <div style={formContainerStyle}>
        <h2 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: '2rem', textAlign: 'center', color: '#333' }} >Cadastros</h2>

        <select value={categoria} onChange={handleCategoriaChange} style={{ marginBottom: '1rem', ...inputStyle }}>
          <option value="">Selecione uma categoria para cadastrar</option>
          <option value="pizza">Pizza</option>
          <option value="bebida">Bebida</option>
          <option value="funcionario">Funcionário</option>
          <option value="motoboy">Motoboy</option>
          <option value="cupom">Cupom de Desconto</option>
        </select>

        {categoria === 'pizza' && (
          <form onSubmit={handleSubmit} style={formStyle}>
            <label>Nome da Pizza</label>
            <input name="nome" value={formData.nome || ''} placeholder="Ex: Calabresa" onChange={handleInputChange} style={inputStyle} required />
            <label>Foto da Pizza</label>
            <input type="file" name="imagem" accept="image/*" onChange={handleInputChange} style={inputStyle} />
            <label>Ingredientes</label>
            <input name="ingredientes" value={formData.ingredientes || ''} placeholder="Ex: Calabresa, cebola, mussarela" onChange={handleInputChange} style={inputStyle} required />
            <label>Preço (R$)</label>
            <input type="number" name="preco_original" value={formData.preco_original || ''} placeholder="Ex: 39.90" step="0.01" onChange={handleInputChange} style={inputStyle} required />
            <button type="submit" style={btnStyle}>Salvar Pizza</button>
          </form>
        )}

        {categoria === 'bebida' && (
          <form onSubmit={handleSubmit} style={formStyle}>
            <label>Nome da Bebida</label>
            <input name="sabor" value={formData.sabor || ''} placeholder="Ex: Coca-Cola" onChange={handleInputChange} style={inputStyle} required />
            <label>Foto da Bebida</label>
            <input type="file" name="imagem" accept="image/*" onChange={handleInputChange} style={inputStyle} />
            <label>Tamanho</label>
            <select name="tamanho" value={formData.tamanho || ''} onChange={handleInputChange} style={inputStyle} required>
                <option value="">Selecione o tamanho</option>
                <option value="latinha">Latinha</option>
                <option value="600ml">600ML</option>
                <option value="1l">1L</option>
                <option value="2l">2L</option>
            </select>
            <label>Preço (R$)</label>
            <input type="number" name="preco" value={formData.preco || ''} placeholder="Ex: 6.00" step="0.01" onChange={handleInputChange} style={inputStyle} required />
            <button type="submit" style={btnStyle}>Salvar Bebida</button>
          </form>
        )}

        {categoria === 'funcionario' && (
          <form onSubmit={handleSubmit} style={formStyle}>
            <label>Nome do Funcionário</label>
            <input name="nome" value={formData.nome || ''} placeholder="Ex: João Silva" onChange={handleInputChange} style={inputStyle} required />
            <label>CPF</label>
            <input name="cpf" value={formData.cpf || ''} placeholder="Somente números" pattern="\d{11}" onChange={handleInputChange} style={inputStyle} required />
            <label>Telefone</label>
            <input name="telefone" value={formData.telefone || ''} type="tel" placeholder="Ex: (61) 99999-0000" pattern="\d{10,11}" onChange={handleInputChange} style={inputStyle} required />
            <label>Email</label>
            <input name="email" value={formData.email || ''} type="email" placeholder="email@example.com" onChange={handleInputChange} style={inputStyle} required />
            <label>Cargo</label>
            <input name="cargo" value={formData.cargo || ''} placeholder="Ex: Atendente" onChange={handleInputChange} style={inputStyle} required />
            {/* Adicionar campos para username e password para criar o User associado */}
            <label>Nome de Usuário (para login)</label>
            <input name="username" value={formData.username || ''} placeholder="Login do funcionário" onChange={handleInputChange} style={inputStyle} required />
            <label>Senha (para login)</label>
            <input name="password" type="password" placeholder="Senha de acesso" onChange={handleInputChange} style={inputStyle} required />
            {/* <label>Foto do Documento (RG ou CNH)</label>
            <input type="file" name="fotoDocumento" accept="image/*" onChange={handleInputChange} style={inputStyle} /> */}
            <button type="submit" style={btnStyle}>Salvar Funcionário</button>
          </form>
        )}

        {categoria === 'motoboy' && (
          <form onSubmit={handleSubmit} style={formStyle}>
            <label>Nome do Motoboy</label>
            <input name="nome" value={formData.nome || ''} placeholder="Ex: Carlos Souza" onChange={handleInputChange} style={inputStyle} required />
            <label>CPF</label>
            <input name="cpf" value={formData.cpf || ''} placeholder="Somente números" pattern="\d{11}" onChange={handleInputChange} style={inputStyle} required />
            <label>Telefone</label>
            <input name="telefone" value={formData.telefone || ''} type="tel" placeholder="Ex: (61) 98888-7777" pattern="\d{10,11}" onChange={handleInputChange} style={inputStyle} required />
            <label>Email</label>
            <input name="email" value={formData.email || ''} type="email" placeholder="email@example.com" onChange={handleInputChange} style={inputStyle} required />
            <label>Data de Nascimento</label>
            <input type="date" name="data_nasc" value={formData.data_nasc || ''} onChange={handleInputChange} style={inputStyle} required />
            <label>Placa da Moto</label>
            <input name="placa_moto" value={formData.placa_moto || ''} placeholder="Ex: ABC-1234" onChange={handleInputChange} style={inputStyle} required />
             {/* Adicionar campos para username e password para criar o User associado */}
            <label>Nome de Usuário (para login)</label>
            <input name="username" value={formData.username || ''} placeholder="Login do motoboy" onChange={handleInputChange} style={inputStyle} required />
            <label>Senha (para login)</label>
            <input name="password" type="password" placeholder="Senha de acesso" onChange={handleInputChange} style={inputStyle} required />
            <label>Foto da CNH</label>
            <input type="file" name="foto_cnh" accept="image/*" onChange={handleInputChange} style={inputStyle} />
            <label>Foto do Documento da Moto</label>
            <input type="file" name="doc_moto" accept="image/*" onChange={handleInputChange} style={inputStyle} />
            <button type="submit" style={btnStyle}>Salvar Motoboy</button>
          </form>
        )}

        {categoria === 'cupom' && (
          <form onSubmit={handleSubmit} style={formStyle}>
            <label htmlFor="codigo">Código do Cupom</label>
            <input id="codigo" name="codigo" value={formData.codigo || ''} placeholder="Ex: PROMO20" onChange={handleInputChange} style={inputStyle} required />
            
            <label htmlFor="percentual_desconto">Porcentagem de Desconto (%)</label>
            <input id="percentual_desconto" type="number" name="percentual_desconto" value={formData.percentual_desconto || ''} placeholder="Ex: 10 (para 10%)" min="0.01" max="100" step="0.01" onChange={handleInputChange} style={inputStyle} required />
            
            <label htmlFor="data_validade">Data de Validade</label>
            {/* Alterado para type="date" para corresponder ao DateField do Django */}
            <input id="data_validade" type="date" name="data_validade" value={formData.data_validade || ''} onChange={handleInputChange} style={inputStyle} required />
            
            <label htmlFor="ativo">Ativo?</label>
            <select id="ativo" name="ativo" value={formData.ativo === undefined ? 'true' : String(formData.ativo)} onChange={handleInputChange} style={inputStyle}>
                <option value="true">Sim</option>
                <option value="false">Não</option>
            </select>
            <button type="submit" style={btnStyle}>Salvar Cupom</button>
          </form>
        )}
      </div>
    </div>
  );
};

// Adicione os exports se eles estiverem em arquivos separados
// export default Navbar; // Se Navbar for um arquivo separado
export default Cadastros; // Assumindo que Cadastros é o componente principal deste arquivo
