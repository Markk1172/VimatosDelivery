import React, { useEffect, useState, useCallback } from 'react';
import logo from '../assets/img/logo.png';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
    const [hoveredLink, setHoveredLink] = useState(null);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [isFuncionario, setIsFuncionario] = useState(false); 
    const navigate = useNavigate();
    const logoutButtonStyle = { padding: '6px 12px', backgroundColor: '#E04725', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '600', fontSize: '0.9rem'};

    useEffect(() => {
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
        window.addEventListener('storage', checkUserStatus);
        return () => window.removeEventListener('storage', checkUserStatus);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('clienteId');
        localStorage.removeItem('isFuncionario');
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
        textDecoration: 'none', 
        color: '#343a40',    
    };

    const linksContainerStyle = {
        display: 'flex',
        gap: '2rem', 
    };

    const authContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    };

    const getLinkStyle = (isHovered) => ({ 
        color: isHovered ? '#cf301d' : '#343a40',
        textDecoration: 'none',
        fontWeight: 600,
        transition: 'color 0.2s ease-in-out',
        fontSize: '1rem',
    });

    const funcionarioLinks = [
        { to: '/fila-pedidos', label: 'PREPARANDO' },
        { to: '/entrega-retirada', label: 'ENTREGA / RETIRADA' }, 
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
                            <Link 
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
                        <span style={{ color: '#343a40', whiteSpace: 'nowrap', fontWeight:'500', marginRight: '5px' }}>Olá, {loggedInUser}!</span>
                        <button style={logoutButtonStyle} onClick={handleLogout}>Sair</button>
                    </>
                ) : (
                    <Link 
                        to="/login"
                        style={{
                            textDecoration: 'none',
                            fontWeight: '600',
                            color: '#fff',
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
    const [currentMode, setCurrentMode] = useState('create'); 
    const [formData, setFormDataState] = useState({}); 
    const [message, setMessage] = useState({ text: '', type: '' });
    const [itemsList, setItemsList] = useState([]); 
    const [editingItemId, setEditingItemId] = useState(null); 
    const navigate = useNavigate();

    const showMessage = useCallback((text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }, []);

    const handleCategoriaChange = (e) => {
        setCategoria(e.target.value);
        setFormDataState({});
        setEditingItemId(null); 
        setCurrentMode('create'); 
    };

    const handleInputChange = (e) => {
        const { name, value, type, files, checked } = e.target; 
        setFormDataState((prev) => ({
            ...prev,
            [name]: type === 'file' ? files[0] : (type === 'checkbox' ? checked : value), 
        }));
    };

    const getApiEndpoint = useCallback((cat, itemId = null) => { 
        let base = 'http://127.0.0.1:8000/api/';
        let path = '';
        switch (cat) {
            case 'pizza': path = 'pizzas/'; break;
            case 'bebida': path = 'bebidas/'; break;
            case 'funcionario': path = 'funcionarios/'; break;
            case 'motoboy': path = 'motoboys/'; break;
            case 'cupom': path = 'cupons/'; break;
            case 'entrega': path = 'taxas-entrega/'; break;
            default: return '';
        }
        return itemId ? `${base}${path}${itemId}/` : `${base}${path}`; 
    }, []); 

    const fetchItems = useCallback(async (cat) => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            showMessage('Sessão expirada. Faça login novamente.', 'error');
            navigate('/login');
            return;
        }

        const endpoint = getApiEndpoint(cat);
        if (!endpoint) return;

        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setItemsList(data);
            } else if (response.status === 401 || response.status === 403) {
                showMessage('Você não tem permissão para listar esses itens.', 'error');
                setItemsList([]);
            } else {
                showMessage(`Erro ao buscar ${cat}: ${response.statusText}`, 'error');
                setItemsList([]);
            }
        } catch (error) {
            console.error(`Erro na requisição GET para ${cat}:`, error);
            showMessage('Erro de rede ou servidor ao buscar itens.', 'error');
            setItemsList([]);
        }
    }, [getApiEndpoint, showMessage, navigate]);

    useEffect(() => {
        setItemsList([]);
        if (categoria && currentMode === 'manage') {
            fetchItems(categoria);
        }

        if (currentMode !== 'create') {
            setFormDataState({});
            setEditingItemId(null); // Só limpa se for fora de edição
        }
        }, [categoria, currentMode, fetchItems]);


    const handleModeChange = (mode) => {
        if (!['pizza', 'bebida', 'funcionario', 'motoboy', 'cupom'].includes(categoria) && currentMode === 'manage') {
            showMessage('O modo de Gerenciamento (edição/exclusão) está disponível apenas para Pizzas, Bebidas, Funcionários e Motoboys.', 'info'); 
            return; 
        }
        setCurrentMode(mode);
        if (mode === 'manage') {
            fetchItems(categoria); 
        } else {
            setFormDataState({}); 
            setEditingItemId(null);
        }
    };

    const handleEdit = (item) => {
        setEditingItemId(item.id);

        if (categoria === 'pizza') {
            setFormDataState({
                ...item,
                sabor: item.sabor,
                preco_original: item.preco_original,
                data_desconto: item.data_desconto ? item.data_desconto.slice(0, 16) : '',
            });
        } else if (categoria === 'bebida') {
            setFormDataState({
                ...item,
                sabor: item.sabor,
                preco: item.preco,
            });
        } else if (categoria === 'funcionario') {
            setFormDataState({
                ...item,
                nome: item.nome,
                email: item.email,
                telefone: item.telefone,
                cargo: item.cargo,
            });
        } else if (categoria === 'motoboy') {
            setFormDataState({
                ...item,
                nome: item.nome,
                email: item.email,
                telefone: item.telefone,
                data_nasc: item.data_nasc ? item.data_nasc.slice(0, 10) : '',
                placa_moto: item.placa_moto,
            });
        } else if (categoria === 'cupom') {
            setFormDataState({
                ...item,
                codigo: item.codigo,
                percentual_desconto: item.percentual_desconto,
                data_validade: item.data_validade ? item.data_validade.slice(0, 10) : '',
                ativo: item.ativo ? 'true' : 'false',
            }); 
        }else {
            setFormDataState({ ...item });
        }

        setCurrentMode('create');
    };

    const handleDelete = async (id) => {
        if (!['pizza', 'bebida', 'funcionario', 'motoboy', 'cupom'].includes(categoria) && currentMode === 'manage') {
            showMessage('O modo de Gerenciamento (edição/exclusão) está disponível apenas para Pizzas, Bebidas, Funcionários e Motoboys.', 'info');
            return;
        }
        if (!window.confirm('Tem certeza que deseja excluir este item?')) {
            return;
        }
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            showMessage('Acesso não autorizado. Faça login novamente.', 'error');
            navigate('/login');
            return;
        }

        const endpoint = getApiEndpoint(categoria, id);
        try {
            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (response.status === 204) { 
                showMessage(`${categoria.charAt(0).toUpperCase() + categoria.slice(1)} excluído(a) com sucesso!`, 'success');
                fetchItems(categoria); 
            } else if (response.status === 401 || response.status === 403) {
                showMessage('Sua sessão expirou ou você não tem permissão para excluir.', 'error');
                navigate('/login');
            } else {
                let errorData = { detail: `Erro ${response.status}: ${response.statusText}` };
                try {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                         errorData = await response.json();
                    } else {
                        const textError = await response.text();
                        errorData.detail = textError || errorData.detail;
                    }
                } catch (jsonError) { /* ignore */ }
                showMessage(`Erro ao excluir ${categoria}: ${errorData.detail || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error(`Erro na requisição DELETE para ${categoria}:`, error);
            showMessage('Erro de rede ou servidor ao excluir item.', 'error');
        }
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        showMessage('Acesso não autorizado. Faça login novamente.', 'error');
        navigate('/login');
        console.log('EDITANDO?', isUpdate);
        console.log('ID:', editingItemId);
        console.log('METHOD:', method);
        console.log('ENDPOINT:', endpoint);
        return;
    }

    const categoriesRequiringFormData = ['pizza', 'bebida', 'motoboy'];
    const isUpdate = editingItemId !== null;
    const method = isUpdate
        ? (categoriesRequiringFormData.includes(categoria) ? 'PUT' : 'PATCH')
        : 'POST';
    const endpoint = isUpdate ? getApiEndpoint(categoria, editingItemId) : getApiEndpoint(categoria);

    let submissionBody;
    const requestHeaders = {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
    };

    if (categoriesRequiringFormData.includes(categoria)) {
        submissionBody = new FormData();
        for (const key in formData) {
            if (formData[key] !== null && formData[key] !== undefined) {
                if (formData[key] instanceof File) {
                    submissionBody.append(key, formData[key]);
                } else if (typeof formData[key] === 'string' && formData[key].startsWith('/media/')) {
                } else {
                    submissionBody.append(key, formData[key]);
                }
            }
        }
    } else { 
        const jsonData = { ...formData };
        if (categoria === 'cupom') {
            jsonData.ativo = formData.ativo === 'true';
        }
        submissionBody = JSON.stringify(jsonData);
        requestHeaders['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(endpoint, {
            method: method,
            headers: requestHeaders,
            body: submissionBody,
        });

        if (response.ok) {
            showMessage(`${categoria.charAt(0).toUpperCase() + categoria.slice(1)} ${isUpdate ? 'atualizado(a)' : 'cadastrado(a)'} com sucesso!`, 'success');
            setFormDataState({});
            setEditingItemId(null);
            setCurrentMode('manage');
            fetchItems(categoria);
        } else if (response.status === 401 || response.status === 403) {
            showMessage('Sua sessão expirou ou você não tem permissão. Faça login novamente.', 'error');
            navigate('/login');
        } else {
            let errorData = { detail: `Erro ${response.status}: ${response.statusText}` };
            try {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    errorData = await response.json();
                } else {
                    const textError = await response.text();
                    errorData.detail = textError || errorData.detail;
                }
            } catch (jsonError) { console.error("Erro ao fazer parse do JSON de erro:", jsonError); }
            
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
            showMessage(`Erro ao ${isUpdate ? 'atualizar' : 'cadastrar'} ${categoria}: ${backendError || response.statusText}`, 'error');
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
        maxWidth: '700px', 
        margin: '2rem auto',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    };

    const inputStyle = { padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' };
    const formStyle = { display: 'flex', flexDirection: 'column', gap: '1rem' };

    const btnStyle = {
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
    const deleteBtnStyle = { ...btnStyle, backgroundColor: '#dc3545', marginTop: '0.5rem', width: 'auto' }; 
    const editBtnStyle = { ...btnStyle, backgroundColor: '#007bff', marginTop: '0.5rem', marginRight: '0.5rem', width: 'auto' }; 
    const backBtnStyle = { ...btnStyle, backgroundColor: '#6c757d', marginTop: '1rem', width: 'auto' }; 


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

    const tableContainerStyle = { 
        marginTop: '2rem',
        maxWidth: '700px', 
        margin: '2rem auto', 
        maxHeight: '400px', 
        overflowY: 'auto', 
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    };

    const tableStyle = { 
        width: '100%',
        borderCollapse: 'collapse',
    };

    const thTdStyle = { 
        padding: '12px 15px',
        borderBottom: '1px solid #dee2e6',
        textAlign: 'left',
    };

    const thStyle = { 
        ...thTdStyle,
        backgroundColor: '#f2f2f2',
        fontWeight: 'bold',
    };

    const tdStyle = { 
        ...thTdStyle,
        verticalAlign: 'middle', 
    };

    const actionsContainerStyle = { 
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginTop: '1rem',
    };

    const renderForm = () => {
        const getPriceFieldName = () => {
            if (categoria === 'pizza') return 'preco_original';
            if (categoria === 'bebida') return 'preco';
            return 'preco'; 
        };
        const priceFieldName = getPriceFieldName(); 

        switch (categoria) {
            case 'pizza':
                return (
                    <>
                        <label>Sabor da Pizza</label>
                        <input name="sabor" value={formData.sabor || ''} placeholder="Ex: Calabresa" onChange={handleInputChange} style={inputStyle} required readOnly={editingItemId !== null} />
                        <label>Tamanho</label>
                        <select name="tamanho" value={formData.tamanho || ''} onChange={handleInputChange} style={inputStyle} required>
                            <option value="">Selecione o tamanho</option>
                            <option value="pequena">Pequena</option>
                            <option value="media">Média</option>
                            <option value="grande">Grande</option>
                        </select>
                        <label>Foto da Pizza</label>
                        {editingItemId && formData.imagem && typeof formData.imagem === 'string' && ( 
                             <p>Imagem atual: <a href={formData.imagem} target="_blank" rel="noopener noreferrer">Visualizar</a></p>
                        )}
                        <input type="file" name="imagem" accept="image/*" onChange={handleInputChange} style={inputStyle} />
                        <label>Ingredientes</label>
                        <input name="ingredientes" value={formData.ingredientes || ''} placeholder="Ex: Calabresa, cebola, mussarela" onChange={handleInputChange} style={inputStyle} />
                        <label>Preço Original (R$)</label>
                        <input type="number" name="preco_original" value={formData.preco_original || ''} placeholder="Ex: 39.90" step="0.01" onChange={handleInputChange} style={inputStyle} required />
                        <label>Preço Promocional (Opcional, R$)</label>
                        <input type="number" name="preco_promocional" value={formData.preco_promocional || ''} placeholder="Ex: 35.00" step="0.01" onChange={handleInputChange} style={inputStyle} />
                    </>
                );
            case 'bebida':
                return (
                    <>
                        <label>Nome da Bebida</label>
                        <input name="sabor" value={formData.sabor || ''} placeholder="Ex: Coca-Cola" onChange={handleInputChange} style={inputStyle} required />
                        <label>Foto da Bebida</label>
                         {editingItemId && formData.imagem && typeof formData.imagem === 'string' && ( 
                             <p>Imagem atual: <a href={formData.imagem} target="_blank" rel="noopener noreferrer">Visualizar</a></p>
                        )}
                        <input type="file" name="imagem" accept="image/*" onChange={handleInputChange} style={inputStyle} />
                        <label>Tamanho</label>
                        <select name="tamanho" value={formData.tamanho || ''} onChange={handleInputChange} style={inputStyle} required>
                            <option value="">Selecione o tamanho</option>
                            <option value="latinha">Latinha</option>
                            <option value="600ml">600ML</option>
                            <option value="1l">1L</option>
                            <option value="1.5l">1.5L</option>
                            <option value="2l">2L</option>
                        </select>
                        <label>Preço (R$)</label>
                        <input type="number" name="preco" value={formData.preco || ''} placeholder="Ex: 6.00" step="0.01" onChange={handleInputChange} style={inputStyle} required />
                    </>
                );
            case 'funcionario':
                return (
                    <>
                        {editingItemId ? ( 
                            <>
                                <label>Nome do Funcionário</label>
                                <input name="nome" value={formData.nome || ''} placeholder="Ex: João Silva" onChange={handleInputChange} style={inputStyle} required />
                                <label>Email</label>
                                <input name="email" value={formData.email || ''} type="email" placeholder="email@example.com" onChange={handleInputChange} style={inputStyle} required />
                                <label>Telefone</label>
                                <input name="telefone" value={formData.telefone || ''} type="tel" placeholder="Ex: (61) 99999-0000" pattern="\d{10,11}" onChange={handleInputChange} style={inputStyle} required />
                                <label>Cargo</label>
                                <input name="cargo" value={formData.cargo || ''} placeholder="Ex: Atendente" onChange={handleInputChange} style={inputStyle} required />
                            </>
                        ) : (
                            <>
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
                            </>
                        )}
                    </>
                );
            case 'motoboy':
                return (
                    <>
                         {editingItemId ? ( 
                            <>
                                <label>Nome do Motoboy</label>
                                <input name="nome" value={formData.nome || ''} placeholder="Ex: Carlos Souza" onChange={handleInputChange} style={inputStyle} required />
                                <label>Email</label>
                                <input name="email" value={formData.email || ''} type="email" placeholder="email@example.com" onChange={handleInputChange} style={inputStyle} required />
                                <label>Telefone</label>
                                <input name="telefone" value={formData.telefone || ''} type="tel" placeholder="Ex: (61) 98888-7777" pattern="\d{10,11}" onChange={handleInputChange} style={inputStyle} required />
                                <label>Data de Nascimento</label>
                                <input type="date" name="data_nasc" value={formData.data_nasc || ''} onChange={handleInputChange} style={inputStyle} required />
                                <label>Placa da Moto</label>
                                <input name="placa_moto" value={formData.placa_moto || ''} placeholder="Ex: ABC-1234" onChange={handleInputChange} style={inputStyle} required />
                                <label>Foto da CNH</label>
                                {editingItemId && formData.foto_cnh && typeof formData.foto_cnh === 'string' && ( 
                                     <p>CNH atual: <a href={formData.foto_cnh} target="_blank" rel="noopener noreferrer">Visualizar</a></p>
                                )}
                                <input type="file" name="foto_cnh" accept="image/*" onChange={handleInputChange} style={inputStyle} />
                                <label>Foto do Documento da Moto</label>
                                {editingItemId && formData.doc_moto && typeof formData.doc_moto === 'string' && ( 
                                     <p>Doc. Moto atual: <a href={formData.doc_moto} target="_blank" rel="noopener noreferrer">Visualizar</a></p>
                                )}
                                <input type="file" name="doc_moto" accept="image/*" onChange={handleInputChange} style={inputStyle} />
                            </>
                        ) : (
                            <>
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
                            </>
                        )}
                    </>
                );
            case 'cupom':
                return (
                    <>
                        <label htmlFor="codigo">Código do Cupom</label>
                        <input id="codigo" name="codigo" value={formData.codigo || ''} placeholder="Ex: PROMO20" onChange={handleInputChange} style={inputStyle} required={!editingItemId} readOnly={editingItemId !== null && categoria === 'pizza'} /> 
                        <label htmlFor="percentual_desconto">Porcentagem de Desconto (%)</label>
                        <input id="percentual_desconto" type="number" name="percentual_desconto" value={formData.percentual_desconto || ''} placeholder="Ex: 10 (para 10%)" min="0.01" max="100" step="0.01" onChange={handleInputChange} style={inputStyle} required />
                        <label htmlFor="data_validade">Data de Validade</label>
                        <input id="data_validade" type="date" name="data_validade" value={formData.data_validade || ''} onChange={handleInputChange} style={inputStyle} required />
                        <label htmlFor="ativo">Ativo?</label>
                        <select id="ativo" name="ativo" value={formData.ativo === undefined ? 'true' : String(formData.ativo)} onChange={handleInputChange} style={inputStyle}>
                            <option value="true">Sim</option>
                            <option value="false">Não</option>
                        </select>
                    </>
                );
            default:
                return null;
        }
    };

    const renderItemList = () => {
        if (itemsList.length === 0) {
            return <p style={{ textAlign: 'center', marginTop: '1rem' }}>Nenhum item cadastrado nesta categoria.</p>;
        }

        const getDisplayValue = (item, category) => {
            switch (category) {
                case 'pizza': return `${item.sabor} (${item.tamanho}) - R$ ${item.preco_original}`;
                case 'bebida': return `${item.sabor} (${item.tamanho}) - R$ ${item.preco}`;
                case 'funcionario': return `${item.nome} (${item.cargo})`;
                case 'motoboy': return `${item.nome} (${item.placa_moto})`;
                case 'cupom': return `${item.codigo} (${item.percentual_desconto}%) - Val: ${item.data_validade}`;
                case 'entrega': return `${item.local}: R$ ${item.valor}`;
                default: return JSON.stringify(item); // Fallback
            }
        };

        return (
            <div style={tableContainerStyle}>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Item</th>
                            <th style={thStyle}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemsList.map((item) => (
                            <tr key={item.id}>
                                <td style={tdStyle}>{getDisplayValue(item, categoria)}</td>
                                <td style={tdStyle}>
                                    {['pizza', 'bebida', 'funcionario', 'motoboy', 'cupom'].includes(categoria) && (
                                        <>
                                        <button className='edit-btn'
                                            onClick={() => handleEdit(item)}
                                            style={editBtnStyle}
                                        >
                                            Editar
                                        </button>
                                        {['pizza', 'bebida', 'funcionario', 'motoboy', 'cupom'].includes(categoria) && (
                                            <button className='delete-btn'
                                            onClick={() => handleDelete(item.id)}
                                            style={deleteBtnStyle}
                                            >
                                            Excluir
                                            </button>
                                        )}
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div style={pageStyle}>
            <Navbar /> 
            {message.text && (
                <div style={message.type === 'success' ? successFeedbackStyle : errorFeedbackStyle}>
                    {message.text}
                </div>
            )}
            <div style={formContainerStyle}>
                <h2 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: '2rem', textAlign: 'center', color: '#333' }} >
                    {categoria ? 
                        (currentMode === 'create' ? 
                            (editingItemId ? `Editar ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}` : `Cadastrar ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`) 
                            : `Gerenciar ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}s`
                        ) : 'Cadastros'
                    }
                </h2>

                <select value={categoria} onChange={handleCategoriaChange} style={{ marginBottom: '1rem', ...inputStyle }}>
                    <option value="">Selecione uma categoria para cadastrar</option>
                    <option value="pizza">Pizza</option>
                    <option value="bebida">Bebida</option>
                    <option value="funcionario">Funcionário</option>
                    <option value="motoboy">Motoboy</option>
                    <option value="cupom">Cupom de Desconto</option>
                </select>

                {categoria && ( 
                    <div style={actionsContainerStyle}>
                        <button
                            onClick={() => {
                                setCurrentMode('create');
                                setEditingItemId(null); // só limpa aqui!
                                setFormDataState({});
                            }}
                            style={{ ...btnStyle, backgroundColor: currentMode === 'create' ? '#007bff' : '#6c757d', width: 'auto' }}
                        >
                            Cadastrar Novo
                        </button>
                        {['pizza', 'bebida', 'funcionario', 'motoboy', 'cupom'].includes(categoria) && (
                          <button
                            onClick={() => handleModeChange('manage')}
                            style={{ ...btnStyle, backgroundColor: currentMode === 'manage' ? '#007bff' : '#6c757d', width: 'auto' }}
                          >
                            Gerenciar Existentes
                          </button>
                        )}
                    </div>
                )}
                
                {categoria && currentMode === 'create' && ( 
                    <form onSubmit={handleSubmit} style={formStyle}>
                        {renderForm()} 
                        <button type="submit" style={btnStyle}>
                            {editingItemId ? 'Atualizar' : 'Salvar'} {categoria.charAt(0).toUpperCase() + categoria.slice(1)} 
                        </button>
                         {editingItemId && ( 
                            <button type="button" onClick={() => {
                                setEditingItemId(null);
                                setFormDataState({});
                                setCurrentMode('manage');
                                fetchItems(categoria);
                            }} style={backBtnStyle}>
                                Cancelar Edição
                            </button>
                        )}
                    </form>
                )}

                {categoria && currentMode === 'manage' && ( 
                    <>
                        <h3 style={{ textAlign: 'center', marginTop: '1rem', color: '#555' }}>Lista de {categoria.charAt(0).toUpperCase() + categoria.slice(1)}</h3> 
                        {renderItemList()} 
                        <button
                            onClick={() => handleModeChange('create')} 
                            style={backBtnStyle} 
                        >
                            Voltar para Cadastrar Novo
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Cadastros;