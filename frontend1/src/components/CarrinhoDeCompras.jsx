import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/img/logo.png';
import iconPix from '../assets/img/pix.png';
import iconDinheiro from '../assets/img/dollar.png';
import fundoPizza from '../assets/img/fundo_pizza1.jpeg';

const shoppingCartIcon = ( <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg"> <g transform="translate(6.8,6.8)"> <circle cx="5" cy="17" r="1.5" fill="rgb(52, 58, 64)"/><circle cx="14" cy="17" r="1.5" fill="rgb(52, 58, 64)"/><path d="M-1 0H1L2.68 12.39C2.84 13.66 3.91 14.67 5.19 14.67H14.5C15.78 14.67 16.85 13.66 17.01 12.39L17.82 5.39C17.93 4.47 17.21 3.67 16.28 3.67H3.12" stroke="rgb(52, 58, 64)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </g> </svg> );
const userIcon = ( <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style={{ verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg"> <g> <circle cx="16" cy="13" r="5" fill="rgb(52, 58, 64)" /> <path d="M8 25c0-4 4-7 8-7s8 3 8 7" fill="rgb(52, 58, 64)" /> </g> </svg> );
const creditCardIcon = <span style={{ fontSize: '1.5em', marginBottom: '5px' }}>💳</span>;

const InternalNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [homeHover, setHomeHover] = useState(false);
    const [cardapioHover, setCardapioHover] = useState(false);

    useEffect(() => {
        const checkLoginStatus = () => {
            const userName = localStorage.getItem('userName');
            if (userName) setLoggedInUser(userName);
            else setLoggedInUser(null);
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
        localStorage.removeItem('clienteId');
        setLoggedInUser(null);
        navigate('/login');
    };

    const navbarStyle = { backgroundColor: 'rgb(248, 249, 250)', borderBottom: '1px solid #dee2e6', padding: '1rem 3rem', position: 'sticky', top: 0, zIndex: 1040, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Arial, sans-serif' };
    const brandStyle = { fontWeight: 700, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: 'rgb(52, 58, 64)' };
    const navLinksContainerStyle = { display: 'flex', gap: '2rem', flexGrow: 1, justifyContent: 'center' };
    const getNavLinkStyle = (path, isHovered) => ({ color: isHovered || location.pathname === path ? '#cf301d' : 'rgb(52, 58, 64)', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s ease-in-out', fontSize: '1rem' });
    const authIconsContainerStyle = { display: 'flex', alignItems: 'center', gap: '15px' };
    const dropdownButtonStyle = { background: "transparent", border: "none", fontWeight: "normal", boxShadow: "none", textTransform: "none", padding: '0', color: 'rgb(52, 58, 64)', backgroundImage: 'none', outline: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, cursor: 'pointer' };

    return (
        <nav style={navbarStyle}>
            <div style={brandStyle}>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={logo} alt="Logo" style={{ height: 50, width: 'auto' }} />
                </Link>
            </div>
            <div style={navLinksContainerStyle}>
                <Link to="/" style={getNavLinkStyle('/', homeHover)} onMouseEnter={() => setHomeHover(true)} onMouseLeave={() => setHomeHover(false)}>HOME</Link>
                <Link to="/cardapio" style={getNavLinkStyle('/cardapio', cardapioHover)} onMouseEnter={() => setCardapioHover(true)} onMouseLeave={() => setCardapioHover(false)}>CARDÁPIO</Link>
            </div>
            <div style={authIconsContainerStyle}>
                {loggedInUser ? (
                    <>
                        <div className="dropdown">
                            <button className="btn dropdown-toggle" type="button" id="dropdownUsuario" data-bs-toggle="dropdown" aria-expanded="false" style={dropdownButtonStyle}>
                                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>{userIcon}</span>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownUsuario">
                                <h6 className="dropdown-header">Olá, {loggedInUser}!</h6>
                                <li><Link className="dropdown-item" to="/profile/edit">Meu Perfil</Link></li>
                                <li><Link className="dropdown-item" to="/pedidos">Meus Pedidos</Link></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><button className="dropdown-item" onClick={handleLogout}>Sair</button></li>
                            </ul>
                        </div>
                        <Link to="/carrinho" style={{ textDecoration: 'none', color: 'rgb(52, 58, 64)', position: 'relative', top: '2px' }}>{shoppingCartIcon}</Link>
                    </>
                ) : ( <Link to="/login" style={{ textDecoration: 'none', fontWeight: '600', color: 'rgb(52, 58, 64)' }}>Login</Link> )}
            </div>
        </nav>
    );
};

export default function CarrinhoDeCompras() {
    const navigateGlobal = useNavigate();

    const [cartItems, setCartItems] = useState(() => {
        try {
            const localCart = localStorage.getItem('cart');
            const parsedCart = localCart ? JSON.parse(localCart) : [];
            return parsedCart.map(item => ({
                ...item,
                tipo: item.tipo || (item.name?.toLowerCase().includes('pizza') ? 'Pizza' : 'Bebida')
            }));
        } catch (error) {
            console.error("Erro ao carregar carrinho do localStorage:", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        } catch (error) {
            console.error("Erro ao salvar carrinho no localStorage:", error);
        }
    }, [cartItems]);

    const [deliveryFee, setDeliveryFee] = useState(0.00);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0.00);
    const [couponMessage, setCouponMessage] = useState({ text: '', type: 'info' });

    const [profileAddress, setProfileAddress] = useState(null);
    const [isLoadingProfileAddress, setIsLoadingProfileAddress] = useState(false);
    const [addressFetchError, setAddressFetchError] = useState('');

    const [deliveryAddressOption, setDeliveryAddressOption] = useState('');
    const [currentDeliveryCep, setCurrentDeliveryCep] = useState('');

    const [newAddress, setNewAddress] = useState({
        cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('');
    const [freteError, setFreteError] = useState('');
    const [isLoadingFrete, setIsLoadingFrete] = useState(false);
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
    const [isOrderSuccessModalOpen, setIsOrderSuccessModalOpen] = useState(false);
    const [confirmedOrderData, setConfirmedOrderData] = useState(null);

    const calcularFreteAPIDjango = useCallback(async (inputCep) => {
        if (!inputCep) {
            setDeliveryFee(0.00); setFreteError(''); return;
        }
        const cleanCep = inputCep.replace(/\D/g, '');
        if (cleanCep.length !== 8) {
            setFreteError('CEP para frete inválido. Digite 8 números.'); setDeliveryFee(0.00); return;
        }
        setIsLoadingFrete(true); setFreteError('');
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setFreteError('Autenticação necessária para calcular o frete.'); setIsLoadingFrete(false); return;
        }
        try {
            const response = await fetch('http://127.0.0.1:8000/api/calcular-frete/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                body: JSON.stringify({ destino_cep: cleanCep }),
            });
            const data = await response.json();
            if (response.ok) {
                setDeliveryFee(parseFloat(data.valor_frete));
                if(data.mensagem) setFreteError(data.mensagem); else setFreteError('');
            } else {
                setFreteError(data.erro || 'Não foi possível calcular o frete para este CEP.'); setDeliveryFee(0.00);
            }
        } catch (error) {
            setFreteError('Erro de comunicação ao calcular frete.'); setDeliveryFee(0.00);
        } finally {
            setIsLoadingFrete(false);
        }
    }, []);

    const fetchProfileData = useCallback(async () => {
        const clienteId = localStorage.getItem('clienteId');
        const accessToken = localStorage.getItem('accessToken');
        if (!clienteId || !accessToken) {
            setDeliveryAddressOption('new');
            return;
        }
        setIsLoadingProfileAddress(true); setAddressFetchError('');
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/clientes/${clienteId}/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.endereco) {
                    const cepMatch = data.endereco.match(/CEP:\s*(\d{5}-?\d{3})/);
                    const cepDoPerfil = cepMatch ? cepMatch[1].replace(/-/, '') : null;
                    setProfileAddress({ id: 'profile', fullAddress: data.endereco, cep: cepDoPerfil });
                    setDeliveryAddressOption('profile');
                    if (cepDoPerfil) setCurrentDeliveryCep(cepDoPerfil);
                } else {
                    setProfileAddress(null);
                    setDeliveryAddressOption('new');
                }
            } else {
                const errorData = await response.json().catch(() => ({detail: "Erro desconhecido ao carregar perfil."}));
                setAddressFetchError(errorData.detail || "Endereço do perfil não encontrado.");
                setDeliveryAddressOption('new');
            }
        } catch (error) {
            setAddressFetchError("Erro de rede ao buscar dados do perfil.");
            setDeliveryAddressOption('new');
        } finally { setIsLoadingProfileAddress(false); }
    }, []);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    useEffect(() => {
        if (currentDeliveryCep) {
            calcularFreteAPIDjango(currentDeliveryCep);
        } else {
            setDeliveryFee(0.00);
        }
    }, [currentDeliveryCep, calcularFreteAPIDjango]);

    const calculateSubtotal = () => cartItems.reduce((acc, item) => acc + ((item.quantity || 0) * (item.price || 0)), 0);
    const subtotal = calculateSubtotal();
    const totalAfterDiscount = subtotal - discount;
    const total = totalAfterDiscount + deliveryFee;

    const handleQuantityChange = (id, delta) => { setCartItems(prevItems => prevItems.map(item => item.id === id ? { ...item, quantity: Math.max(1, (item.quantity || 0) + delta) } : item ).filter(item => item.quantity > 0)); };
    const handleRemoveItem = (id) => { setCartItems(prevItems => prevItems.filter(item => item.id !== id)); };

    const applyCouponAPI = async () => {
        if (!couponCode.trim()) {
            setCouponMessage({ text: 'Insira um código de cupom.', type: 'error' }); return;
        }
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setCouponMessage({ text: 'Login necessário para aplicar cupom.', type: 'error' }); return;
        }
        setCouponMessage({ text: 'Validando...', type: 'info' }); setDiscount(0.00);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/pedidos/validar_cupom_action/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                body: JSON.stringify({ codigo_cupom: couponCode, subtotal_itens: subtotal.toString() })
            });
            const data = await response.json();
            if (response.ok && data.valido) {
                setDiscount(parseFloat(data.valor_desconto_calculado));
                setCouponMessage({ text: `Cupom "${data.codigo}" aplicado! Desconto de R$${parseFloat(data.valor_desconto_calculado).toFixed(2)}.`, type: 'success' });
            } else {
                setDiscount(0.00);
                setCouponMessage({ text: data.error || 'Cupom inválido ou não aplicável.', type: 'error' });
            }
        } catch (error) {
            setDiscount(0.00);
            setCouponMessage({ text: 'Erro de comunicação ao validar cupom.', type: 'error' });
        }
    };

    const handleDeliveryAddressOptionChange = (e) => {
        const option = e.target.value;
        setDeliveryAddressOption(option);
        setFreteError('');
        if (option === 'profile' && profileAddress && profileAddress.cep) {
            setCurrentDeliveryCep(profileAddress.cep);
        } else if (option === 'new') {
            setCurrentDeliveryCep(newAddress.cep.replace(/\D/g, ''));
        } else {
            setCurrentDeliveryCep('');
            setDeliveryFee(0.00);
        }
    };

    const handleNewAddressChange = async (e) => {
        const { name, value } = e.target;
        let formattedValue = value;
        let cepForViaCep = name === 'cep' ? value.replace(/\D/g, '') : newAddress.cep.replace(/\D/g, '');

        if (name === 'cep') {
            formattedValue = value.replace(/\D/g, '');
            if (formattedValue.length > 8) {
                formattedValue = formattedValue.slice(0, 8);
            }
            cepForViaCep = formattedValue;
            if (formattedValue.length > 5) {
                formattedValue = formattedValue.slice(0, 5) + '-' + formattedValue.slice(5);
            }
        }
        const updatedNewAddress = { ...newAddress, [name]: formattedValue };
        setNewAddress(updatedNewAddress);

        if (deliveryAddressOption === 'new' && name === 'cep') {
            setCurrentDeliveryCep(cepForViaCep);
        }

        if (name === 'cep' && cepForViaCep.length === 8) {
            setIsLoadingProfileAddress(true);
            setAddressFetchError('');
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cepForViaCep}/json/`);
                if(response.ok) {
                    const data = await response.json();
                    if (!data.erro) {
                        setNewAddress(prev => ({
                            ...prev,
                            cep: data.cep || prev.cep,
                            street: data.logradouro || '',
                            neighborhood: data.bairro || '',
                            city: data.localidade || '',
                            state: data.uf || ''
                        }));
                        setAddressFetchError('');
                    } else {
                        setAddressFetchError("CEP não encontrado para preenchimento automático.");
                        setNewAddress(prev => ({ ...prev, street: '', neighborhood: '', city: '', state: ''}));
                    }
                } else { setAddressFetchError("Erro ao buscar dados do CEP (ViaCEP)."); }
            } catch (error) { setAddressFetchError("Erro de rede ao buscar dados do CEP.");
            } finally { setIsLoadingProfileAddress(false); }
        } else if (name === 'cep' && cepForViaCep.length < 8) {
            setAddressFetchError('');
        }
    };

    const handleSaveNewAddressAPI = async () => {
        const { cep, street, number, neighborhood, city, state, complement } = newAddress;
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep && street && number && neighborhood && city && state && cleanCep.length === 8) {
            const clienteId = localStorage.getItem('clienteId');
            const accessToken = localStorage.getItem('accessToken');
            if (!clienteId || !accessToken) {
                setCouponMessage({text: "Autenticação necessária para salvar endereço.", type: 'error'}); return;
            }
            const enderecoFormatadoParaSalvar = `${street}, ${number}${complement ? ', ' + complement : ''} - ${neighborhood}, ${city} - ${state}, CEP: ${cep}`;
            setCouponMessage({text: "Salvando endereço...", type: 'info'});
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/clientes/${clienteId}/`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`},
                    body: JSON.stringify({ endereco: enderecoFormatadoParaSalvar })
                });
                if (response.ok) {
                    const updatedCliente = await response.json();
                    setProfileAddress({ id: 'profile', fullAddress: updatedCliente.endereco, cep: cleanCep });
                    setDeliveryAddressOption('profile');
                    setCurrentDeliveryCep(cleanCep);
                    setCouponMessage({ text: 'Endereço principal atualizado e selecionado!', type: 'success'});
                } else {
                    const errorData = await response.json().catch(()=>({detail: "Erro desconhecido ao salvar endereço."}));
                    setCouponMessage({ text: `Erro ao salvar: ${errorData.detail || JSON.stringify(errorData)}`, type: 'error' });
                }
            } catch (error) {
                setCouponMessage({ text: 'Erro de rede ao salvar endereço.', type: 'error' });
            }
        } else {
            setCouponMessage({ text: 'Preencha todos os campos obrigatórios do novo endereço e um CEP válido.', type: 'error' });
        }
    };

    const handleFinalizarCompra = async () => {
        setIsSubmittingOrder(true);
        setCouponMessage({ text: '', type: 'info' });

        if (cartItems.length === 0) { setCouponMessage({text: "Seu carrinho está vazio!", type: 'error'}); setIsSubmittingOrder(false); return; }
        if (!deliveryAddressOption) { setCouponMessage({text: "Selecione uma opção de endereço de entrega.", type: 'error'}); setIsSubmittingOrder(false); return;}

        let enderecoEntregaFinal;
        if (deliveryAddressOption === 'profile' && profileAddress && profileAddress.fullAddress) {
            enderecoEntregaFinal = profileAddress.fullAddress;
        } else if (deliveryAddressOption === 'new') {
            const { cep, street, number, neighborhood, city, state, complement } = newAddress;
            if (!cep.replace(/\D/g,'').length === 8 || !street || !number || !neighborhood || !city || !state ) {
                setCouponMessage({text: "Preencha todos os campos obrigatórios do novo endereço.", type: 'error'});
                setIsSubmittingOrder(false); return;
            }
            enderecoEntregaFinal = `${street}, ${number}${complement ? ', ' + complement : ''} - ${neighborhood}, ${city} - ${state}, CEP: ${cep}`;
        } else {
            setCouponMessage({text: "Endereço de entrega inválido ou não selecionado.", type: 'error'});
            setIsSubmittingOrder(false); return;
        }

        if (!paymentMethod) { setCouponMessage({text: "Selecione uma forma de pagamento.", type: 'error'}); setIsSubmittingOrder(false); return;}

        const clienteId = localStorage.getItem('clienteId');
        const accessToken = localStorage.getItem('accessToken');
        if (!clienteId || !accessToken) { setCouponMessage({text: "Erro de autenticação. Faça login novamente.", type: 'error'}); setIsSubmittingOrder(false); return;}

        const itens_data_para_backend = cartItems.map(cartItem => {
            const itemPayload = {
                quantidade: cartItem.quantity,
            };

            const tipoLower = (cartItem.tipo || '').toLowerCase();

            if (tipoLower === "pizza" || tipoLower === "sobremesa") {
                itemPayload.pizza = cartItem.id;
            } else if (tipoLower === "bebida") {
                itemPayload.bebida = cartItem.id;
            } else {
                const fallbackTipo = cartItem.name?.toLowerCase().includes('pizza') ? 'pizza' : 'bebida';
                console.warn(`Tipo de item '${cartItem.tipo}' não reconhecido. Usando fallback '${fallbackTipo}':`, cartItem);
                if (fallbackTipo === "pizza") {
                    itemPayload.pizza = cartItem.id;
                } else {
                    itemPayload.bebida = cartItem.id;
                }
            }
            return itemPayload;
        }).filter(item => item.pizza || item.bebida); 

        console.log("Itens (itens_data) a serem enviados para o backend:", itens_data_para_backend);

        if (itens_data_para_backend.length === 0 && cartItems.length > 0) {
             setCouponMessage({text: "Erro: Nenhum item do carrinho pôde ser processado. Verifique os dados.", type: 'error'});
             setIsSubmittingOrder(false);
             return; 
        }

        const pedidoPayload = {
            cliente: parseInt(clienteId),
            itens_data: itens_data_para_backend, 
            tipo_entrega: (deliveryAddressOption === 'profile' || deliveryAddressOption === 'new') ? 'Entrega' : 'Retirada',
            endereco_entrega_formatado: (deliveryAddressOption === 'profile' || deliveryAddressOption === 'new') ? enderecoEntregaFinal : null,
            forma_pagamento: paymentMethod,
            taxa_entrega_aplicada: deliveryFee.toFixed(2),
            codigo_cupom: discount > 0 ? couponCode : null,
        };

        console.log("Payload completo do pedido:", pedidoPayload);

        setCouponMessage({text: "Enviando pedido...", type: 'info'});
        try {
            const response = await fetch('http://127.0.0.1:8000/api/pedidos/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                body: JSON.stringify(pedidoPayload)
            });
            const responseData = await response.json();
            if (response.ok) {
                setConfirmedOrderData({ id: responseData.id, total: parseFloat(responseData.total_pedido).toFixed(2) });
                setIsOrderSuccessModalOpen(true);
                setCartItems([]);
                localStorage.removeItem('cart');
                setCouponCode(''); setDiscount(0);
                setDeliveryFee(0);
                setDeliveryAddressOption(profileAddress ? 'profile' : 'new');
                setCurrentDeliveryCep(profileAddress && profileAddress.cep ? profileAddress.cep : '');
                setNewAddress({ cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' });
            } else {
                let errorMsg = "Erro ao finalizar pedido.";
                if (responseData && typeof responseData === 'object') {
                    errorMsg = Object.entries(responseData)
                               .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                               .join('; ');
                } else if (typeof responseData === 'string') { errorMsg = responseData; }
                if (responseData.itens_data && Array.isArray(responseData.itens_data)) {
                    errorMsg = `itens_data: ${responseData.itens_data[0]}`;
                }
                setCouponMessage({text: `Erro: ${errorMsg}`, type: 'error'});
            }
        } catch (error) {
            console.error("Erro na requisição fetch:", error); 
            setCouponMessage({text: 'Erro de rede ao finalizar pedido. Verifique o console.', type: 'error'});
        } finally {
            setIsSubmittingOrder(false);
        }
    };

    const handleCloseOrderSuccessModal = () => {
        setIsOrderSuccessModalOpen(false);
        setConfirmedOrderData(null);
        setCouponMessage({text:'', type:'info'});
        navigateGlobal('/pedidos');
    };

    const pageContainerStyle = { minHeight: '100vh', margin: 0, padding: 0, fontFamily: 'Raleway, sans-serif', display: 'flex', flexDirection: 'column', backgroundImage: `url(${fundoPizza})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' };
    const contentWrapperStyle = { paddingTop: 'calc(1rem + 2rem + 1px + 50px)', flexGrow: 1, marginBottom: '2rem' };
    const carrinhoBoxStyle = { width: '90%', maxWidth: '600px', margin: '0 auto', borderRadius: '12px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)', backgroundColor: '#fff', overflow: 'hidden' };
    const headerStyle = { color: '#fff', backgroundColor: '#cf301d', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' };
    const headerH3Style = { margin: 0, padding: '20px', textAlign: 'center', fontSize: '1.8em' };
    const itemsListContainerStyle = { backgroundColor: '#fff', paddingBottom: '15px' };
    const itemRowStyle = { padding: '15px 20px 0 20px' };
    const itemContentStyle = { display: 'flex', flexDirection: 'row', padding: '15px 0', borderBottom: '1px solid #f0f0f0', alignItems: 'center' };
    const itemImageContainerStyle = { flex: '0 0 60px', height: '60px', position: 'relative', marginRight: '20px' };
    const itemImageStyle = { width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' };
    const itemNameDetailsStyle = { flex: 3 };
    const itemQuantityControlsStyle = { flex: 2, textAlign: 'center' };
    const itemPriceStyle = { flex: 1, textAlign: 'right', fontWeight: 'bold', color: '#343a40' };
    const quantityButtonStyle = { color: '#343a40', fontSize: '1em', textAlign: 'center', borderRadius: '50%', backgroundColor: '#f0f0f0', border: '1px solid #ddd', boxShadow: 'none', width: '30px', height: '30px', lineHeight: '28px', display: 'inline-block', textDecoration: 'none', cursor: 'pointer', transition: 'background-color 0.2s ease' };
    const quantityDisplaySpanStyle = { display: 'inline-block', fontSize: '1.2em', fontWeight: 'bold', padding: '0 12px', color: '#343a40' };
    const footerStyle = { padding: '25px 20px', textAlign: 'center', backgroundColor: '#f8f9fa', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', borderTop: '1px solid #dee2e6' };
    const totalRowStyle = { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: '10px' };
    const totalTextStyle = { margin: 0, fontWeight: 'normal', fontSize: '1.1em', color: '#495057' };
    const totalPriceStyle = { margin: 0, fontWeight: 'bold', fontSize: '1.1em', color: '#343a40' };
    const checkoutButtonStyle = { color: '#fff', border: 'none', fontSize: '1.1em', padding: '12px 20px', backgroundColor: '#cf301d', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s ease', flex: 1 };
    const couponInputContainerStyle = { padding: '20px', backgroundColor: '#fff', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' };
    const couponInputStyle = { flexGrow: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ced4da', fontSize: '1em', minWidth: '150px' };
    const applyCouponButtonStyle = { padding: '12px 18px', backgroundColor: '#5a6268', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s ease' };
    const couponMessageStyle = { marginTop: '10px', fontSize: '0.9em', color: couponMessage.type === 'success' ? '#28a745' : (couponMessage.type === 'error' ? '#dc3545' : '#6c757d'), textAlign: 'center', padding: '0 20px', minHeight: '1.2em' };
    const addressSectionStyle = { padding: '20px', backgroundColor: '#fff', borderTop: '1px solid #f0f0f0', marginBottom: '0px', borderBottom: '1px solid #f0f0f0'};
    const selectStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ced4da', fontSize: '1em', marginBottom: '15px', backgroundColor: '#fff', textAlign: 'left', appearance: 'none' };
    const addressFormStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f8f9fa' };
    const formGroupStyle = { display: 'flex', flexDirection: 'column' };
    const formInputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', fontSize: '1em' };
    const saveAddressButtonStyle = { gridColumn: '1 / -1', padding: '12px 18px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s ease', marginTop: '10px' };
    const paymentMethodSectionStyle = { padding: '20px', backgroundColor: '#fff', marginBottom: '0px' , textAlign: 'center', borderTop: '1px solid #f0f0f0' };
    const paymentMethodGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '15px', marginTop: '15px', justifyContent: 'center' };
    const paymentOptionButtonStyle = (methodName) => ({ padding: '15px 10px', border: `2px solid ${paymentMethod === methodName ? '#cf301d' : '#ced4da'}`, borderRadius: '8px', backgroundColor: paymentMethod === methodName ? '#ffe6e3' : '#fff', cursor: 'pointer', fontSize: '0.95em', fontWeight: '600', color: paymentMethod === methodName ? '#cf301d' : '#495057', transition: 'all 0.2s ease-in-out', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80px' });
    const paymentOptionHoverStyle = { boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transform: 'translateY(-3px)' };
    const removeButtonStyle = { position: 'absolute', top: '-8px', left: '-8px', width: '26px', height: '26px', color: '#fff', backgroundColor: '#dc3545', fontSize: '1em', textAlign: 'center', borderRadius: '50%', textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px solid white', fontWeight: 'bold', lineHeight: '22px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' };
    const orderSuccessModalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 };
    const orderSuccessModalContentStyle = { backgroundColor: '#fff', padding: '30px 40px', borderRadius: '10px', boxShadow: '0 5px 20px rgba(0,0,0,0.25)', textAlign: 'center', maxWidth: '450px', width: '90%' };
    const orderSuccessModalTitleStyle = { fontSize: '1.8rem', fontWeight: 'bold', color: '#28a745', marginBottom: '15px' };
    const orderSuccessModalTextStyle = { fontSize: '1rem', color: '#495057', marginBottom: '10px', lineHeight: '1.6' };
    const orderSuccessModalStrongStyle = { fontWeight: 'bold', color: '#343a40' };
    const orderSuccessModalInfoStyle = { fontSize: '0.9rem', color: '#6c757d', marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' };
    const orderSuccessModalButtonStyle = { backgroundColor: '#cf301d', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '5px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '25px', transition: 'background-color 0.2s ease' };
    const backToMenuStyle = { backgroundColor: '#6c757d', color: '#fff', border: 'none', fontSize: '1.1em', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'background-color 0.2s ease', flex: 1, textAlign: 'center'};
    const footerButtonsContainerStyle = { marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' };


    return (
        <div style={pageContainerStyle}>
            <InternalNavbar />
            <div style={contentWrapperStyle}>
                <div style={carrinhoBoxStyle}>
                    <header style={headerStyle}><h3 style={headerH3Style}>Seu Pedido</h3></header>

                    <div style={itemsListContainerStyle}>
                        {isLoadingProfileAddress && !cartItems.length && <p style={{textAlign: 'center', padding: '20px'}}>Carregando carrinho...</p>}
                        {!isLoadingProfileAddress && cartItems.length === 0 && (
                            <p style={{textAlign: 'center', padding: '20px', color: '#555'}}>Seu carrinho está vazio. <Link to="/cardapio">Ver cardápio</Link>.</p>
                        )}
                        {cartItems.map((item) => (
                            <div key={item.id + '-' + item.name} style={itemRowStyle}>
                                <div style={itemContentStyle}>
                                    <div style={itemImageContainerStyle}><a href="#" onClick={(e) => { e.preventDefault(); handleRemoveItem(item.id); }} style={removeButtonStyle}>&times;</a><img src={item.image || 'https://via.placeholder.com/60x60.png?text=Produto'} alt={item.name} style={itemImageStyle} /></div>
                                    <div style={itemNameDetailsStyle}><h5 style={{ margin: '0 0 5px', fontSize:'1.05em' }}>{item.name}</h5><p style={{ margin: 0, fontSize: '0.8em', color: '#777' }}>Preço unit.: R${item.price ? item.price.toFixed(2).replace('.', ',') : '0,00'}</p></div>
                                    <div style={itemQuantityControlsStyle}><ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><li style={{ display: 'inline-block' }}><a href="#" onClick={(e) => { e.preventDefault(); handleQuantityChange(item.id, -1); }} style={quantityButtonStyle}>-</a></li><li style={{ display: 'inline-block' }}><span style={quantityDisplaySpanStyle}>{item.quantity}</span></li><li style={{ display: 'inline-block' }}><a href="#" onClick={(e) => { e.preventDefault(); handleQuantityChange(item.id, 1); }} style={quantityButtonStyle}>+</a></li></ul></div>
                                    <div style={itemPriceStyle}><p style={{ margin: '0', fontSize:'1em' }}>R${item.price && item.quantity ? (item.quantity * item.price).toFixed(2).replace('.', ',') : '0,00'}</p></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={addressSectionStyle}>
                        <h4 style={{ margin: '0 0 15px', color: '#343a40', textAlign: 'center' }}>Endereço de Entrega</h4>
                        {isLoadingProfileAddress && <p style={{textAlign: 'center'}}>Carregando endereço...</p>}
                        {addressFetchError && <p style={{color: 'red', textAlign: 'center'}}>{addressFetchError}</p>}
                        <label htmlFor="addressOptionSelect" style={{ fontWeight: 'bold', color: '#343a40', display: 'block', marginBottom: '5px' }}>Opção de Entrega:</label>
                        <select id="addressOptionSelect" value={deliveryAddressOption} onChange={handleDeliveryAddressOptionChange} style={selectStyle} disabled={isLoadingProfileAddress}>
                            <option value="">-- Selecione --</option>
                            {profileAddress && profileAddress.cep && (<option value="profile">Usar: {profileAddress.fullAddress || `CEP ${profileAddress.cep}`}</option>)}
                            <option value="new">Informar Novo Endereço</option>
                        </select>
                        {(deliveryAddressOption === 'new') && (
                            <div style={addressFormStyle}>
                                <h5 style={{ gridColumn: '1 / -1', margin: '0 0 10px', color: '#555' }}>Novo Endereço</h5>
                                <div style={formGroupStyle}><label htmlFor="newCep" style={{ fontSize: '0.9em', marginBottom: '3px' }}>CEP:</label><input type="text" id="newCep" name="cep" value={newAddress.cep} onChange={handleNewAddressChange} placeholder="00000-000" style={formInputStyle} maxLength="9"/></div>
                                <div style={formGroupStyle}><label htmlFor="newStreet" style={{ fontSize: '0.9em', marginBottom: '3px' }}>Rua:</label><input type="text" id="newStreet" name="street" value={newAddress.street} onChange={handleNewAddressChange} placeholder="Nome da Rua" style={formInputStyle} required/></div>
                                <div style={formGroupStyle}><label htmlFor="newNumber" style={{ fontSize: '0.9em', marginBottom: '3px' }}>Número:</label><input type="text" id="newNumber" name="number" value={newAddress.number} onChange={handleNewAddressChange} placeholder="123" style={formInputStyle} required/></div>
                                <div style={formGroupStyle}><label htmlFor="newComplement" style={{ fontSize: '0.9em', marginBottom: '3px' }}>Complemento:</label><input type="text" id="newComplement" name="complement" value={newAddress.complement} onChange={handleNewAddressChange} placeholder="Apto, Bloco" style={formInputStyle} /></div>
                                <div style={formGroupStyle}><label htmlFor="newNeighborhood" style={{ fontSize: '0.9em', marginBottom: '3px' }}>Bairro:</label><input type="text" id="newNeighborhood" name="neighborhood" value={newAddress.neighborhood} onChange={handleNewAddressChange} placeholder="Seu Bairro" style={formInputStyle} required/></div>
                                <div style={formGroupStyle}><label htmlFor="newCity" style={{ fontSize: '0.9em', marginBottom: '3px' }}>Cidade:</label><input type="text" id="newCity" name="city" value={newAddress.city} onChange={handleNewAddressChange} placeholder="Sua Cidade" style={formInputStyle} required/></div>
                                <div style={formGroupStyle}><label htmlFor="newState" style={{ fontSize: '0.9em', marginBottom: '3px' }}>Estado (UF):</label><input type="text" id="newState" name="state" value={newAddress.state} onChange={handleNewAddressChange} placeholder="UF" maxLength="2" style={formInputStyle} required/></div>
                                <button onClick={handleSaveNewAddressAPI} style={saveAddressButtonStyle}>Salvar no Meu Perfil e Usar</button>
                            </div>
                        )}
                        {isLoadingFrete && <p style={{ textAlign: 'center', color: '#007bff', marginTop: '10px' }}>Calculando frete...</p>}
                        {freteError && <p style={{ color: freteError.includes("Retirada") ? '#6c757d' : (freteError.includes("inválido") ? 'orange' : 'red'), textAlign: 'center', marginTop: '10px' }}>{freteError}</p>}
                    </div>

                    <div style={paymentMethodSectionStyle}>
                        <h4 style={{ margin: '0 0 15px', color: '#343a40' }}>Método de Pagamento</h4>
                        <div style={paymentMethodGridStyle}>
                            <button style={paymentOptionButtonStyle('Cartao Credito')} onClick={() => setPaymentMethod('Cartao Credito')} onMouseEnter={(e) => Object.assign(e.currentTarget.style, paymentOptionButtonStyle('Cartao Credito'), paymentOptionHoverStyle)} onMouseLeave={(e) => Object.assign(e.currentTarget.style, paymentOptionButtonStyle('Cartao Credito'))}> {creditCardIcon} Crédito </button>
                            <button style={paymentOptionButtonStyle('Cartao Debito')} onClick={() => setPaymentMethod('Cartao Debito')} onMouseEnter={(e) => Object.assign(e.currentTarget.style, paymentOptionButtonStyle('Cartao Debito'), paymentOptionHoverStyle)} onMouseLeave={(e) => Object.assign(e.currentTarget.style, paymentOptionButtonStyle('Cartao Debito'))}> {creditCardIcon} Débito </button>
                            <button style={paymentOptionButtonStyle('Dinheiro')} onClick={() => setPaymentMethod('Dinheiro')} onMouseEnter={(e) => Object.assign(e.currentTarget.style, paymentOptionButtonStyle('Dinheiro'), paymentOptionHoverStyle)} onMouseLeave={(e) => Object.assign(e.currentTarget.style, paymentOptionButtonStyle('Dinheiro'))}> <img src={iconDinheiro} alt="Dinheiro" style={{ width: 28, height: 28, marginBottom: 5 }} /> Dinheiro </button>
                            <button style={paymentOptionButtonStyle('PIX')} onClick={() => setPaymentMethod('PIX')} onMouseEnter={(e) => Object.assign(e.currentTarget.style, paymentOptionButtonStyle('PIX'), paymentOptionHoverStyle)} onMouseLeave={(e) => Object.assign(e.currentTarget.style, paymentOptionButtonStyle('PIX'))}> <img src={iconPix} alt="Pix" style={{ width: 28, height: 28, marginBottom: 5 }} /> Pix </button>
                        </div>
                    </div>

                    <div style={couponInputContainerStyle}>
                        <label htmlFor="couponInput" style={{ fontWeight: 'bold', color: '#343a40' }}>Cupom:</label>
                        <input type="text" id="couponInput" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Código do cupom" style={couponInputStyle}/>
                        <button onClick={applyCouponAPI} style={applyCouponButtonStyle}>Aplicar</button>
                    </div>
                    {couponMessage.text && <p style={couponMessageStyle}>{couponMessage.text}</p>}

                    <footer style={footerStyle}>
                        <div style={totalRowStyle}><p style={totalTextStyle}>Subtotal</p><p style={totalPriceStyle}>R${subtotal.toFixed(2).replace('.', ',')}</p></div>
                        {discount > 0 && (<div style={totalRowStyle}><p style={{ ...totalTextStyle, color: '#28a745' }}>Desconto</p><p style={{ ...totalPriceStyle, color: '#28a745' }}>-R${discount.toFixed(2).replace('.', ',')}</p></div>)}
                        <div style={totalRowStyle}><p style={totalTextStyle}>Taxa de Entrega</p><p style={totalPriceStyle}>R${deliveryFee.toFixed(2).replace('.', ',')}</p></div>
                        <div style={totalRowStyle}><p style={{ ...totalTextStyle, fontWeight: 'bold', fontSize: '1.2em' }}>Total</p><p style={{ ...totalPriceStyle, fontWeight: 'bold', fontSize: '1.2em' }}>R${total.toFixed(2).replace('.', ',')}</p></div>

                        <div style={footerButtonsContainerStyle}>
                            <button
                                onClick={() => navigateGlobal('/cardapio')}
                                style={backToMenuStyle}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#5a6268'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
                            >
                                Voltar ao Cardápio
                            </button>
                            <button
                                onClick={handleFinalizarCompra}
                                style={checkoutButtonStyle}
                                disabled={isSubmittingOrder || cartItems.length === 0}
                                onMouseEnter={(e) => e.target.style.opacity = (isSubmittingOrder || cartItems.length === 0) ? 1 : '0.85'}
                                onMouseLeave={(e) => e.target.style.opacity = '1'}
                            >
                                {isSubmittingOrder ? 'Processando...' : 'Finalizar Compra'}
                            </button>
                        </div>
                    </footer>
                </div>
            </div>

            {isOrderSuccessModalOpen && confirmedOrderData && (
                <div style={orderSuccessModalOverlayStyle}>
                    <div style={orderSuccessModalContentStyle}>
                        <h3 style={orderSuccessModalTitleStyle}>Pedido Realizado com Sucesso!</h3>
                        <p style={orderSuccessModalTextStyle}>
                            Obrigado pelo seu pedido, <strong style={orderSuccessModalStrongStyle}>{localStorage.getItem('userName') || 'Cliente'}</strong>!
                        </p>
                        <p style={orderSuccessModalTextStyle}>
                            Seu pedido <strong style={orderSuccessModalStrongStyle}>#{confirmedOrderData.id}</strong> no valor total de <strong style={orderSuccessModalStrongStyle}>R$ {confirmedOrderData.total}</strong> foi registrado.
                        </p>
                        <p style={orderSuccessModalInfoStyle}>
                            Lembre-se: o pedido será pago na entrega do produto.
                            Acompanhe o status em "Meus Pedidos".
                        </p>
                        <button
                            onClick={handleCloseOrderSuccessModal}
                            style={orderSuccessModalButtonStyle}
                            onMouseEnter={(e) => e.target.style.opacity = '0.85'}
                            onMouseLeave={(e) => e.target.style.opacity = '1'}
                        >
                            OK (Ver Meus Pedidos)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}