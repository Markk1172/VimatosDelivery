import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/img/logo.png'; 

const shoppingCartIcon = ( <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg"> <g transform="translate(6.8,6.8)"> <circle cx="5" cy="17" r="1.5" fill="rgb(52, 58, 64)"/><circle cx="14" cy="17" r="1.5" fill="rgb(52, 58, 64)"/><path d="M-1 0H1L2.68 12.39C2.84 13.66 3.91 14.67 5.19 14.67H14.5C15.78 14.67 16.85 13.66 17.01 12.39L17.82 5.39C17.93 4.47 17.21 3.67 16.28 3.67H3.12" stroke="rgb(52, 58, 64)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </g> </svg> );

const Navbar = () => {
    const [hoveredLink, setHoveredLink] = useState(null);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [isFuncionario, setIsFuncionario] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

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
            const protectedFuncionarioRoutes = ['/fila-pedidos', '/cadastros', '/entrega-retirada'];
            const protectedClienteRoutes = ['/pedidos', '/profile/edit', '/carrinho']; 
            const currentPath = location.pathname;
            const isUnauthenticated = !localStorage.getItem('accessToken');
            
            if (isUnauthenticated) {
                if (protectedFuncionarioRoutes.some(route => currentPath.startsWith(route)) || 
                    protectedClienteRoutes.some(route => currentPath.startsWith(route))) {
                    navigate('/login');
                }
            } else if (!funcionarioStatus && protectedFuncionarioRoutes.some(route => currentPath.startsWith(route))) {
                navigate('/'); 
            }
        };
        checkUserStatus();
        window.addEventListener('storage', checkUserStatus);
        return () => window.removeEventListener('storage', checkUserStatus);
    }, [navigate, location.pathname]);

    const handleLogout = () => {
        localStorage.clear(); 
        setLoggedInUser(null); setIsFuncionario(false); navigate('/login');
    };

    const navbarStyle = { backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', padding: '1rem 3rem', position: 'sticky', top: 0, zIndex: 1030, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Arial, sans-serif' };
    const brandStyle = { fontWeight: 700, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#343a40' };
    const linksContainerStyle = { display: 'flex', gap: '2rem', flexGrow: 1, justifyContent: 'center' };
    const authContainerStyle = { display: 'flex', alignItems: 'center', gap: '15px' };
    const getLinkStyle = (path) => ({
        color: location.pathname === path ? '#cf301d' : (hoveredLink === path ? '#cf301d' : '#343a40'),
        textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s ease-in-out', fontSize: '1rem',
    });
    const logoutButtonStyle = { padding: '6px 12px', backgroundColor: '#E04725', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '600', fontSize: '0.9rem'};
    const loginButtonStyle = { textDecoration: 'none', fontWeight: '600', padding: '6px 12px', backgroundColor: '#007bff', color: '#fff', borderRadius: '4px', whiteSpace: 'nowrap', transition: 'background-color 0.2s ease' };

    const funcionarioLinks = [ { to: '/fila-pedidos', label: 'PREPARANDO' }, { to: '/entrega-retirada', label: 'ENTREGA / RETIRADA' }, { to: '/cadastros', label: 'CADASTROS' }];
    const clienteLinks = [ { to: "/", label: "HOME" }, { to: "/cardapio", label: "CARDÁPIO" }];
    const linksToShow = isFuncionario ? funcionarioLinks : clienteLinks;

    return (
        <nav style={navbarStyle}>
            <Link to={isFuncionario ? "/fila-pedidos" : "/"} style={brandStyle}>
                <img src={logo} alt="Logo" style={{ height: 40, width: 'auto' }} />
                <span>{isFuncionario ? 'Gestão Pizzaria' : 'Vimatos Delivery'}</span>
            </Link>
            <div style={linksContainerStyle}>
                {linksToShow.map((link) => (
                    <Link key={link.to} to={link.to} style={getLinkStyle(link.to)} onMouseEnter={() => setHoveredLink(link.to)} onMouseLeave={() => setHoveredLink(null)}>
                        {link.label}
                    </Link>
                ))}
            </div>
            <div style={authContainerStyle}>
                {loggedInUser ? (
                    <>
                        <span style={{ color: '#343a40', whiteSpace: 'nowrap', fontWeight:'500' }}>Olá, {loggedInUser}!</span>
                        <button style={logoutButtonStyle} onClick={handleLogout} onMouseEnter={(e) => e.target.style.backgroundColor = '#5a6268'} onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}>Sair</button>
                        {!isFuncionario && (<Link to="/carrinho" style={{ textDecoration: 'none', color: 'rgb(52, 58, 64)', display:'flex', alignItems:'center' }}>{shoppingCartIcon}</Link>)}
                    </>
                ) : (
                    <Link to="/login" style={loginButtonStyle} onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'} onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}>Login</Link>
                )}
            </div>
        </nav>
    );
};

const PedidoCardFila = ({ pedido, onAvancarStatus, motoboys, onMotoboySelect, selectedMotoboyId }) => {
    const [hover, setHover] = useState(false);
    const pedidoCardStyle = { width: '100%', maxWidth: '380px', height: 'auto', minHeight: '450px', background: '#fff', borderRadius: '15px', boxShadow: hover ? '0 10px 25px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: 'Arial, sans-serif', transition: 'all 0.3s ease', marginBottom: '20px' };
    const h3Style = { fontSize: '1.25rem', fontWeight: 700, color: '#222', marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem'};
    const pStyle = {fontSize: '0.9em', color: '#777', marginBottom: '0.5rem'};
    const ulStyle = { listStyleType: 'none', paddingLeft: '0', maxHeight: '150px', overflowY: 'auto', color: '#555', fontSize: '0.9rem', marginBottom: '1rem', flexGrow: 1, borderTop: '1px dashed #eee', borderBottom: '1px dashed #eee', paddingTop: '0.5rem', paddingBottom: '0.5rem' };
    const liStyle = { marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' };
    const smallStyle = { fontStyle: 'italic', color: '#888', textAlign: 'center', fontSize: '0.85rem', marginTop: '0.5rem' };
    const buttonStyle = { padding: '10px 15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', marginTop: '1rem', alignSelf: 'stretch', transition: 'background-color 0.2s ease' };
    const disabledButtonStyle = { ...buttonStyle, backgroundColor: '#6c757d', cursor: 'not-allowed' };
    const handleButtonHover = (e, isHovering, isDisabled) => { if(!isDisabled) e.target.style.backgroundColor = isHovering ? '#218838' : '#28a745'; };
    const totalStyle = { fontWeight: 'bold', marginTop: '0.5rem', borderTop: '1px solid #eee', paddingTop: '0.5rem', textAlign: 'right' };
    const selectMotoboyStyle = { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.9em', marginTop: '10px', marginBottom: '5px' };

    let buttonText = 'Avançar Status';
    let isMotoboySelectionNeeded = false;
    if (pedido.statusOriginal === 'Recebido') {
        buttonText = 'Marcar como "Em Preparo"';
    } else if (pedido.statusOriginal === 'Em Preparo') {
        if (pedido.tipo_entrega === 'Entrega') {
            buttonText = 'Atribuir Motoboy e Marcar como Pronto';
            isMotoboySelectionNeeded = true;
        } else { 
            buttonText = 'Marcar como "Pronto para Retirada"';
        }
    }
    const isButtonDisabled = isMotoboySelectionNeeded && !selectedMotoboyId;

    return (
        <div style={pedidoCardStyle} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <div> 
                <h3 style={h3Style}>Cliente: {pedido.cliente}</h3>
                <p style={pStyle}>Pedido ID: #{pedido.id}</p>
                <p style={pStyle}>Status Atual: {pedido.statusOriginal}</p>
                <p style={pStyle}>Tipo: {pedido.tipo_entrega}</p>
                <p style={{...pStyle, fontWeight: 'bold', marginTop: '0.5rem'}}>Itens:</p>
                <ul style={ulStyle}>
                    {pedido.produtos && pedido.produtos.map((p, i) => ( <li key={i} style={liStyle}><span>{p.split(' (R$')[0]}</span> <span>R$ {p.split(' (R$')[1]}</span></li> ))}
                </ul>
                <p style={totalStyle}>Total: R$ {pedido.total ? pedido.total.toFixed(2).replace('.', ',') : 'N/A'}</p>
            </div>
            <div> 
                {isMotoboySelectionNeeded && motoboys && (
                    <select 
                        style={selectMotoboyStyle} 
                        onChange={(e) => onMotoboySelect(pedido.id, e.target.value)}
                        value={selectedMotoboyId || ""}
                    >
                        <option value="">Selecione um motoboy...</option>
                        {motoboys.map(motoboy => (
                            <option key={motoboy.id} value={motoboy.id}>{motoboy.nome}</option>
                        ))}
                    </select>
                )}
                <button 
                    style={isButtonDisabled ? disabledButtonStyle : buttonStyle} 
                    onClick={onAvancarStatus} 
                    disabled={isButtonDisabled}
                    onMouseEnter={(e) => handleButtonHover(e, true, isButtonDisabled)}
                    onMouseLeave={(e) => handleButtonHover(e, false, isButtonDisabled)}
                >
                    {buttonText}
                </button><br/>
                <small style={smallStyle}>⏰ Horário do Pedido: {pedido.horario}</small>
            </div>
        </div>
    );
};

const FilaPedidos = () => {
    const [allFetchedPedidos, setAllFetchedPedidos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); 

    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successModalMessage, setSuccessModalMessage] = useState('');

    const [motoboys, setMotoboys] = useState([]);
    const [selectedMotoboys, setSelectedMotoboys] = useState({});

    const fetchMotoboys = useCallback(async (accessToken) => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/motoboys/', { 
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (!response.ok) throw new Error('Falha ao buscar motoboys');
            const data = await response.json();
            setMotoboys(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Erro ao buscar motoboys:", err);
            setMotoboys([]); 
        }
    }, []);

    const fetchPedidosDaFila = useCallback(async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setError("Autenticação necessária."); setIsLoading(false); navigate('/login'); return;
        }
        setError(null); 
        try {
            const response = await fetch('http://127.0.0.1:8000/api/pedidos/?status=Recebido&status=Em Preparo', {
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: `Erro: ${response.statusText}` }));
                throw new Error(errorData.detail || `Erro HTTP ${response.status}`);
            }
            const data = await response.json();
            
            const sortedData = data.sort((a, b) => new Date(a.data_pedido) - new Date(b.data_pedido));

            const pedidosFormatados = sortedData.map(pedido => ({
                id: pedido.id,
                cliente: pedido.cliente_nome || `Cliente ID ${pedido.cliente}`,
                produtos: pedido.itens_pedido.map(item => {
                    const nomeProduto = item.produto_nome || "Item";
                    const precoItemTotal = item.subtotal_item || (item.quantidade * item.preco_unitario_momento);
                    return `${item.quantidade}x ${nomeProduto} (R$ ${parseFloat(precoItemTotal).toFixed(2).replace('.',',')})`;
                }),
                horario: new Date(pedido.data_pedido).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                statusOriginal: pedido.status,
                total: parseFloat(pedido.total_pedido || 0),
                tipo_entrega: pedido.tipo_entrega,
                deliveryAddress: pedido.endereco_entrega_formatado || (pedido.tipo_entrega === 'Retirada' ? 'Retirada no Local' : 'Endereço não informado'),
                paymentMethod: pedido.forma_pagamento || 'Não informado',
                deliveryFee: parseFloat(pedido.taxa_entrega_aplicada || 0)
            }));
            setAllFetchedPedidos(pedidosFormatados);
        } catch (err) {
            setError(err.message || "Ocorreu um erro ao buscar os pedidos da fila.");
        } finally {
            if(isLoading) setIsLoading(false);
        }
    }, [navigate, isLoading]); 

    useEffect(() => {
        setIsLoading(true); 
        const accessToken = localStorage.getItem('accessToken');
        if(accessToken){
            fetchPedidosDaFila();
            fetchMotoboys(accessToken);
        } else {
            navigate('/login');
        }
        const intervalId = setInterval(() => {
             if (localStorage.getItem('accessToken')) {
                 fetchPedidosDaFila();
                 fetchMotoboys(localStorage.getItem('accessToken'));
             }
        }, 30000); 
        return () => clearInterval(intervalId);
    }, [fetchPedidosDaFila, fetchMotoboys, navigate]);

    const handleMotoboySelect = (pedidoId, motoboyId) => {
        setSelectedMotoboys(prev => ({ ...prev, [pedidoId]: motoboyId }));
    };

    const handleAvancarStatusPedido = async (pedidoId, statusAtual, tipoEntrega) => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) { alert("Sessão expirada."); return; }

        let proximoStatus = '';
        let mensagemSucessoParaModal = '';
        const motoboyIdSelecionado = selectedMotoboys[pedidoId];

        if (statusAtual === 'Recebido') {
            proximoStatus = 'Em Preparo';
            mensagemSucessoParaModal = `Pedido #${pedidoId} marcado como "Em Preparo"!`;
        } else if (statusAtual === 'Em Preparo') {
            if (tipoEntrega === 'Entrega') {
                if (!motoboyIdSelecionado) {
                    alert("Por favor, selecione um motoboy para este pedido de entrega."); return;
                }
                proximoStatus = 'Pronto para Entrega'; 
            } else { 
                proximoStatus = 'Retirada';
            }
            mensagemSucessoParaModal = `Pedido #${pedidoId} marcado como "${proximoStatus}"!`;
        } else {
            setSuccessModalMessage(`O pedido #${pedidoId} (${statusAtual}) não pode ser avançado desta tela.`);
            setIsSuccessModalOpen(true); return;
        }
        
        try {
            if (tipoEntrega === 'Entrega' && statusAtual === 'Em Preparo' && motoboyIdSelecionado) {
                const atribuirResponse = await fetch(`http://127.0.0.1:8000/api/pedidos/${pedidoId}/atribuir_motoboy/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`},
                    body: JSON.stringify({ motoboy_id: motoboyIdSelecionado })
                });
                if (!atribuirResponse.ok) {
                    const errorData = await atribuirResponse.json().catch(() => ({detail: "Erro ao atribuir motoboy"}));
                    alert(`Erro ao atribuir motoboy: ${errorData.detail || atribuirResponse.statusText}`); return;
                }
                mensagemSucessoParaModal += ` Motoboy atribuído. Pedido enviado para a próxima etapa!`;
            }

            const statusResponse = await fetch(`http://127.0.0.1:8000/api/pedidos/${pedidoId}/atualizar_status/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`},
                body: JSON.stringify({ status: proximoStatus })
            });
            if (statusResponse.ok) {
                setSuccessModalMessage(mensagemSucessoParaModal);
                setIsSuccessModalOpen(true);
                
            } else {
                const errorData = await statusResponse.json().catch(() => ({detail: "Erro desconhecido"}));
                alert(`Erro ao atualizar status: ${errorData.detail || statusResponse.statusText}`);
            }
        } catch (error) {
            alert("Erro de rede ao atualizar status.");
        }
    };

    const handleCloseSuccessModal = () => {
        setIsSuccessModalOpen(false);
        const deveNavegar = successModalMessage.includes("Pronto para Entrega") || successModalMessage.includes("Retirada");
        setSuccessModalMessage('');
        
        setIsLoading(true); 
        fetchPedidosDaFila().finally(() => { 
            if (deveNavegar) {
                navigate('/entrega-retirada');
            }
        });
    };
    
    const pedidosRecebidos = allFetchedPedidos.filter(p => p.statusOriginal === 'Recebido');
    const pedidosEmPreparo = allFetchedPedidos.filter(p => p.statusOriginal === 'Em Preparo');

    const pageStyle = { backgroundColor: '#E9E9E9', minHeight: '100vh', paddingBottom: '2rem', display: 'flex', flexDirection: 'column' };
    const h2Style = { width: '100%', textAlign: 'center', marginTop: '3rem', marginBottom: '1rem', fontWeight: 700, fontSize: '2.5rem', color: '#333' };
    const twoColumnLayoutContainerStyle = { display: 'flex', flexDirection: 'row', gap: '2rem', width: '95%', maxWidth: '1400px', margin: '2rem auto', flexGrow: 1 };
    const columnStyle = { flex: 1, backgroundColor: '#fdfdff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', minHeight: '50vh'};
    const sectionSubTitleStyle = { width: '100%', textAlign: 'center', fontSize: '1.6em', color: '#333', marginBottom: '1.5rem', borderBottom: '2px solid #e0e0e0', paddingBottom: '0.75rem', fontWeight: '600'};
    const cardsGridStyle = { display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', width: '100%' };
    const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050 };
    const modalContentStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', textAlign: 'center', maxWidth: '400px', width: '90%'};
    const modalTitleStyle = { fontSize: '1.6em', marginBottom: '20px', color: '#28a745', fontWeight: 'bold' };
    const modalMessageStyle = { fontSize: '1.1em', marginBottom: '25px', color: '#333'};
    const modalButtonStyle = { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '5px', cursor: 'pointer', fontSize: '1em', fontWeight: 'bold', transition: 'background-color 0.2s ease' };

    
    if (error && !allFetchedPedidos.length && !isLoading && !isSuccessModalOpen) {
        return <div style={pageStyle}><Navbar /><div style={{textAlign: 'center', color: 'red', fontSize: '1.2em', marginTop: '50px'}}>Erro: {error}</div></div>;
    }

    return (
        <div style={pageStyle}>
            <Navbar /> 
            <h2 style={h2Style}>Fila de Pedidos</h2>
            {error && !isSuccessModalOpen && <p style={{textAlign: 'center', color: 'red', marginBottom: '1rem'}}>Erro ao buscar atualizações: {error}</p>}
            
            <div style={twoColumnLayoutContainerStyle}>
                <div style={columnStyle}>
                    <h3 style={sectionSubTitleStyle}>Pedidos Recebidos</h3>
                    <div style={cardsGridStyle}>
                        {pedidosRecebidos.length === 0 ? (
                            <p style={{ fontSize: '1.1rem', color: '#555' }}>Nenhum pedido recebido aguardando preparo.</p>
                        ) : (
                            pedidosRecebidos.map((pedido) => (
                                <PedidoCardFila 
                                    key={pedido.id}
                                    pedido={pedido}
                                    onAvancarStatus={() => handleAvancarStatusPedido(pedido.id, pedido.statusOriginal, pedido.tipo_entrega)}
                                    motoboys={motoboys} 
                                    selectedMotoboyId={selectedMotoboys[pedido.id]}
                                    onMotoboySelect={handleMotoboySelect}
                                />
                            ))
                        )}
                    </div>
                </div>

                <div style={columnStyle}>
                    <h3 style={sectionSubTitleStyle}>Pedidos em Preparação</h3>
                    <div style={cardsGridStyle}>
                        {pedidosEmPreparo.length === 0 ? (
                            <p style={{ fontSize: '1.1rem', color: '#555' }}>Nenhum pedido em preparação no momento.</p>
                        ) : (
                            pedidosEmPreparo.map((pedido) => (
                                <PedidoCardFila 
                                    key={pedido.id}
                                    pedido={pedido}
                                    onAvancarStatus={() => handleAvancarStatusPedido(pedido.id, pedido.statusOriginal, pedido.tipo_entrega)}
                                    motoboys={motoboys}
                                    selectedMotoboyId={selectedMotoboys[pedido.id]}
                                    onMotoboySelect={handleMotoboySelect}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {isSuccessModalOpen && (
                <div style={modalOverlayStyle} onClick={handleCloseSuccessModal}>
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        <h3 style={modalTitleStyle}>Sucesso!</h3>
                        <p style={modalMessageStyle}>{successModalMessage}</p>
                        <button 
                            style={modalButtonStyle} 
                            onClick={handleCloseSuccessModal}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilaPedidos;