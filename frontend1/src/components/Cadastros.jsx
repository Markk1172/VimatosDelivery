import React, { useEffect, useState } from 'react';
import logo from '../assets/img/logo.png';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
    const [hoveredLink, setHoveredLink] = useState(null);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [isFuncionario, setIsFuncionario] = useState(false); 
    const navigate = useNavigate();

    useEffect(() => {
        // Using v1's checkUserStatus as it includes isFuncionario
        const checkUserStatus = () => {
            const userName = localStorage.getItem('userName');
            const funcionarioStatus = localStorage.getItem('isFuncionario') === 'true';

            if (userName) {
                setLoggedInUser(userName);
                setIsFuncionario(funcionarioStatus);
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
        // Using v1's handleLogout as it removes more items
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('clienteId');
        localStorage.removeItem('isFuncionario'); // From v1
        setLoggedInUser(null);
        setIsFuncionario(false);
        navigate('/login');
    };

    // Merging styles, prioritizing v1 and ensuring flex layout works
    const navbarStyle = {
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
        padding: '1rem 3rem', // Using v1's padding
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
        textDecoration: 'none', 
        color: '#343a40',    
    };

    const linksContainerStyle = {
        display: 'flex',
        gap: '2rem', 
        // 
    };

    const authContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        // marginLeft: 'auto', // Removido para centralizar melhor com o flex da navbar
    };

    const getLinkStyle = (isHovered) => ({ 
        color: isHovered ? '#cf301d' : '#343a40',
        textDecoration: 'none',
        fontWeight: 600,
        transition: 'color 0.2s ease-in-out',
        fontSize: '1rem',
    });

    // Using v1's links and structure
    const funcionarioLinks = [
        { to: '/fila-pedidos', label: 'PREPARANDO' },
        { to: '/entrega-retirada', label: 'ENTREGA / RETIRADA' }, // 
        { to: '/cadastros', label: 'CADASTROS' },
    ];

    return (
        <nav style={navbarStyle}>
            <Link to={isFuncionario ? "/fila-pedidos" : "/"} style={brandStyle}> 
                <img src={logo} alt="Logo" style={{ height: 40, width: 'auto' }} />
                <span>{isFuncionario ? 'Gestão Pizzaria' : 'Vimatos Delivery'}</span>
            </Link>
            
            <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
                {isFuncionario && (
                    <div style={linksContainerStyle}>
                        {funcionarioLinks.map((link, index) => (
                            <Link // 
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

            {/* Using v1's auth container and login/logout button */}
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
                    <Link // Using Link from v1 with improved styling
                        to="/login"
                        style={{
                            textDecoration: 'none',
                            fontWeight: '600',
                            color: '#fff', // White text
                            padding: '6px 12px',
                            backgroundColor: '#007bff',
                            borderRadius: '4px',
                            whiteSpace: 'nowrap',
                            transition: 'background-color 0.2s ease-in-out',
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

const Cadastros = () => {
    const [categoria, setCategoria] = useState('');
    const [formData, setFormDataState] = useState({}); 
    const [message, setMessage] = useState({ text: '', type: '' }); // From v1
    const navigate = useNavigate(); // From v1

    // Using v1's showMessage
    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    // Using v1's handleCategoriaChange
    const handleCategoriaChange = (e) => {
        setCategoria(e.target.value);
        setFormDataState({});
    };

    // Merging handleInputChange from both
    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormDataState((prev) => ({
            ...prev,
            [name]: type === 'file' ? files[0] : value,
        }));
    };

    // Using v1's getApiEndpoint, adding 'entrega'
    const getApiEndpoint = (cat) => {
        switch (cat) {
            case 'pizza': return 'http://127.0.0.1:8000/api/pizzas/';
            case 'bebida': return 'http://127.0.0.1:8000/api/bebidas/';
            case 'funcionario': return 'http://127.0.0.1:8000/api/funcionarios/';
            case 'motoboy': return 'http://127.0.0.1:8000/api/motoboys/';
            case 'cupom': return 'http://127.0.0.1:8000/api/cupons/';
            case 'entrega': return 'http://127.0.0.1:8000/api/taxas-entrega/'; // Endpoint hipotético para entrega
            default: return '';
        }
    };

    // Using v1's handleSubmit (API integrated), with potential for 'entrega'
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

    let submissionBody;
    const requestHeaders = {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json', // É uma boa prática incluir
    };

    // Define quais categorias NECESSITAM de FormData (por causa de uploads de arquivo)
    // Adicione ou remova categorias conforme seus formulários evoluem.
    const categoriesRequiringFormData = ['pizza', 'bebida', 'motoboy'];

    if (categoriesRequiringFormData.includes(categoria)) {
        // Usa FormData para categorias com arquivos
        submissionBody = new FormData();
        for (const key in formData) {
            // Garante que valores nulos/undefined não sejam adicionados,
            // exceto se for um arquivo (que pode ser opcional e vir como null)
            if (formData[key] !== null && formData[key] !== undefined) {
                 submissionBody.append(key, formData[key]);
            }
        }
        // Mapeamentos específicos para FormData (se necessário)
        if (categoria === 'pizza' && formData.nome) submissionBody.set('sabor', formData.nome);
        // Se o campo 'preco' no form de pizza deve ser 'preco_original' no backend:
        if (categoria === 'pizza' && formData.preco) {
            submissionBody.set('preco_original', formData.preco);
            // Opcional: remova 'preco' se não for esperado pelo backend
            // if (submissionBody.has('preco')) submissionBody.delete('preco');
        }


        // Não defina 'Content-Type' para FormData; o navegador faz isso automaticamente
        // e inclui o 'boundary' correto.
    } else {
        // Usa JSON para outras categorias (ex: funcionario, cupom, entrega)
        
        // Crie uma cópia para não modificar o estado formData diretamente com os mapeamentos
        const jsonData = { ...formData };

        // Mapeamentos específicos para JSON
        if (categoria === 'pizza' && jsonData.nome) { // Embora pizza use FormData, se fosse JSON:
            jsonData.sabor = jsonData.nome;
            // delete jsonData.nome; // Se 'nome' não for esperado, apenas 'sabor'
        }
        if (categoria === 'pizza' && jsonData.preco) { // Se fosse JSON:
            jsonData.preco_original = jsonData.preco;
            // delete jsonData.preco;
        }

        // Mapeamentos para 'entrega' (se for JSON)
        if (categoria === 'entrega' && jsonData.local) {
            jsonData.bairro = jsonData.local; // Supondo que o backend espera 'bairro'
            // delete jsonData.local; // Remova se 'local' não for esperado
        }
        if (categoria === 'entrega' && jsonData.valorEntrega) {
            jsonData.taxa = jsonData.valorEntrega; // Supondo que o backend espera 'taxa'
            // delete jsonData.valorEntrega; // Remova se 'valorEntrega' não for esperado
        }


        submissionBody = JSON.stringify(jsonData);
        requestHeaders['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: requestHeaders,
            body: submissionBody,
        });

        if (response.ok) {
            // Tenta parsear como JSON mesmo se o status for 204 No Content (algumas APIs fazem isso)
            let responseData = {};
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                responseData = await response.json();
            } else if (response.status !== 204) { // Se não for JSON e não for 204, pode ser texto
                const textResponse = await response.text();
                console.log("Resposta não JSON recebida:", textResponse); // Log para debug
            }

            showMessage(`${categoria.charAt(0).toUpperCase() + categoria.slice(1)} cadastrado(a) com sucesso!`, 'success');
            setFormDataState({});
            setCategoria('');
        } else if (response.status === 401 || response.status === 403) {
            showMessage('Sua sessão expirou ou você não tem permissão. Faça login novamente.', 'error');
            navigate('/login');
        } else {
            // Tenta obter a mensagem de erro do JSON, senão usa o statusText
            let errorData = { detail: `Erro ${response.status}: ${response.statusText}` }; // Default error
            try {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                     errorData = await response.json();
                } else {
                    // Se não for JSON, tenta ler como texto para dar mais detalhes
                    const textError = await response.text();
                    errorData.detail = textError || errorData.detail; // Usa o texto se houver
                }
            } catch (jsonError) {
                console.error("Erro ao fazer parse do JSON de erro:", jsonError);
                // Mantém o errorData default se o parse do JSON de erro falhar
            }
            
            let backendError = errorData.detail || ''; // 'detail' é comum no DRF
            if (typeof errorData === 'object' && !backendError) { // Se não houver 'detail', tenta montar a partir dos campos
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

    // Using v1's styles as they are more detailed, with minor adjustments.
    const pageStyle = {
        backgroundColor: '#E9E9E9',
        minHeight: '100vh',
        paddingBottom: '2rem',
    };

    const formContainerStyle = {
        maxWidth: '500px',
        margin: '2rem auto',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem', // v1 gap
    };

    const inputStyle = { padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }; // v1 style
    const formStyle = { display: 'flex', flexDirection: 'column', gap: '1rem' };

    const btnStyle = { // v1 style
        backgroundColor: '#28a745',
        borderRadius: '8px',
        border: 'none',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
        letterSpacing: '0.05rem',
        padding: '0.75rem 2rem',
        textTransform: 'uppercase',
        transition: 'background-color 0.2s ease-in-out, transform 80ms ease-in',
        marginTop: '1.5rem',
        alignSelf: 'center',
        width: '100%',
    };

    // Using v1's feedback styles
    const messageFeedbackStyles = {
        position: 'fixed',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 20px',
        borderRadius: '5px',
        color: 'white',
        zIndex: 1000,
        textAlign: 'center',
        minWidth: '300px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    };
    const successFeedbackStyle = { ...messageFeedbackStyles, backgroundColor: 'green' };
    const errorFeedbackStyle = { ...messageFeedbackStyles, backgroundColor: 'red' };

    return (
        <div style={pageStyle}>
            <Navbar /> {/* Render the merged Navbar */}
            {message.text && (
                <div style={message.type === 'success' ? successFeedbackStyle : errorFeedbackStyle}>
                    {message.text}
                </div>
            )}
            <div style={formContainerStyle}>
                {/* Using v1's h2 style with slight adjustment from v2 */}
                <h2 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: '2rem', textAlign: 'center', color: '#333' }} >Cadastros</h2>

                {/* Merging select options */}
                <select value={categoria} onChange={handleCategoriaChange} style={{ marginBottom: '1rem', ...inputStyle }}>
                    <option value="">Selecione uma categoria para cadastrar</option>
                    <option value="pizza">Pizza</option>
                    <option value="bebida">Bebida</option>
                    <option value="funcionario">Funcionário</option>
                    <option value="motoboy">Motoboy</option>
                    <option value="cupom">Cupom de Desconto</option>
                    <option value="entrega">Taxa de Entrega</option> {/* Added from v2 */}
                </select>

                {/* Pizza Form - Merged */}
                {categoria === 'pizza' && (
                    <form onSubmit={handleSubmit} style={formStyle}>
                        <label>Nome da Pizza</label>
                        <input name="nome" value={formData.nome || ''} placeholder="Ex: Calabresa" onChange={handleInputChange} style={inputStyle} required />
                        {/* Adding Tamanho from v2, but needs name matching API */}
                        <label>Tamanho</label>
                        <select name="tamanho" value={formData.tamanho || ''} onChange={handleInputChange} style={inputStyle} required>
                            <option value="">Selecione o tamanho</option>
                            <option value="pequena">Pequena</option>
                            <option value="media">Média</option>
                            <option value="grande">Grande</option>
                        </select>
                        <label>Foto da Pizza</label>
                        <input type="file" name="imagem" accept="image/*" onChange={handleInputChange} style={inputStyle} /> {/* Using 'imagem' from v1 */}
                        <label>Ingredientes</label>
                        <input name="ingredientes" value={formData.ingredientes || ''} placeholder="Ex: Calabresa, cebola, mussarela" onChange={handleInputChange} style={inputStyle} required />
                        <label>Preço (R$)</label>
                        <input type="number" name="preco_original" value={formData.preco_original || ''} placeholder="Ex: 39.90" step="0.01" onChange={handleInputChange} style={inputStyle} required /> {/* Using 'preco_original' from v1 */}
                        <button type="submit" style={btnStyle}>Salvar Pizza</button>
                    </form>
                )}

                {/* Bebida Form - Merged (Using v1's select for tamanho) */}
                {categoria === 'bebida' && (
                    <form onSubmit={handleSubmit} style={formStyle}>
                        <label>Nome da Bebida</label>
                        <input name="sabor" value={formData.sabor || ''} placeholder="Ex: Coca-Cola" onChange={handleInputChange} style={inputStyle} required /> {/* Using 'sabor' from v1 */}
                        <label>Foto da Bebida</label>
                        <input type="file" name="imagem" accept="image/*" onChange={handleInputChange} style={inputStyle} /> {/* Using 'imagem' from v1 */}
                        <label>Tamanho</label>
                        <select name="tamanho" value={formData.tamanho || ''} onChange={handleInputChange} style={inputStyle} required> {/* Using v1's select */}
                            <option value="">Selecione o tamanho</option>
                            <option value="latinha">Latinha</option>
                            <option value="600ml">600ML</option>
                            <option value="1l">1L</option>
                            <option value="2l">2L</option>
                        </select>
                        {/* If 'Quantidade (ml)' from v2 is crucial, it needs to be added and handled by API */ }
                        {/* <label>Quantidade (ml)</label> */ }
                        {/* <input type="number" name="quantidadeMl" value={formData.quantidadeMl || ''} placeholder="Ex: 350" onChange={handleInputChange} style={inputStyle} /> */ }
                        <label>Preço (R$)</label>
                        <input type="number" name="preco" value={formData.preco || ''} placeholder="Ex: 6.00" step="0.01" onChange={handleInputChange} style={inputStyle} required />
                        <button type="submit" style={btnStyle}>Salvar Bebida</button>
                    </form>
                )}

                {/* Funcionario Form - Using v1 (more detailed) */}
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
                        <label>Nome de Usuário (para login)</label>
                        <input name="username" value={formData.username || ''} placeholder="Login do funcionário" onChange={handleInputChange} style={inputStyle} required />
                        <label>Senha (para login)</label>
                        <input name="password" type="password" placeholder="Senha de acesso" onChange={handleInputChange} style={inputStyle} required />
                        {/* Keep commented or add if needed: <label>Foto do Documento (RG ou CNH)</label> */}
                        {/* <input type="file" name="fotoDocumento" accept="image/*" onChange={handleInputChange} style={inputStyle} /> */}
                        <button type="submit" style={btnStyle}>Salvar Funcionário</button>
                    </form>
                )}

                {/* Motoboy Form - Using v1 (more detailed) */}
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

                {/* Cupom Form - Using v1 (more detailed) */}
                {categoria === 'cupom' && (
                    <form onSubmit={handleSubmit} style={formStyle}>
                        <label htmlFor="codigo">Código do Cupom</label>
                        <input id="codigo" name="codigo" value={formData.codigo || ''} placeholder="Ex: PROMO20" onChange={handleInputChange} style={inputStyle} required />
                        <label htmlFor="percentual_desconto">Porcentagem de Desconto (%)</label>
                        <input id="percentual_desconto" type="number" name="percentual_desconto" value={formData.percentual_desconto || ''} placeholder="Ex: 10 (para 10%)" min="0.01" max="100" step="0.01" onChange={handleInputChange} style={inputStyle} required />
                        <label htmlFor="data_validade">Data de Validade</label>
                        <input id="data_validade" type="date" name="data_validade" value={formData.data_validade || ''} onChange={handleInputChange} style={inputStyle} required />
                        <label htmlFor="ativo">Ativo?</label>
                        <select id="ativo" name="ativo" value={formData.ativo === undefined ? 'true' : String(formData.ativo)} onChange={handleInputChange} style={inputStyle}>
                            <option value="true">Sim</option>
                            <option value="false">Não</option>
                        </select>
                        <button type="submit" style={btnStyle}>Salvar Cupom</button>
                    </form>
                )}

                {/* Entrega Form - Added from v2, adapted to v1 style/logic */}
                {categoria === 'entrega' && (
                    <form onSubmit={handleSubmit} style={formStyle}>
                        <label>Local de Entrega (Bairro/Região)</label>
                        <input name="local" value={formData.local || ''} placeholder="Ex: Asa Sul, Lago Norte, Setor Oeste" onChange={handleInputChange} style={inputStyle} required />
                        <label>Valor da Entrega (R$)</label>
                        <input type="number" name="valor" value={formData.valor || ''} placeholder="Ex: 5.00" step="0.01" onChange={handleInputChange} style={inputStyle} required />
                        <button type="submit" style={btnStyle}>Salvar Taxa de Entrega</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Cadastros; // Export the merged Cadastros component