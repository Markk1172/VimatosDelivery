import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/img/login.jpg';
import logo from '../assets/img/logo.png';
import ConfirmModal from './confirmModal'; // Garanta que o nome do arquivo é 'confirmModal.jsx' ou ajuste o import

const ClienteEdit = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    data_nasc: '',
    cpf: '',
    endereco: '',
    email: '',
    telefone: '',
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [clienteId, setClienteId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const showMessage = useCallback((text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  }, []);

  const fetchClienteData = useCallback(async (id) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken || !id) {
      showMessage('Token de acesso ou ID do cliente não encontrado.', 'error');
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/api/clientes/${id}/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFormData({
          nome: data.nome || '',
          data_nasc: data.data_nasc || '',
          cpf: data.cpf || '',
          endereco: data.endereco || '',
          email: data.email || '',
          telefone: data.telefone || '',
        });
      } else if (response.status === 401 || response.status === 403) {
        showMessage('Sessão expirada ou não autorizada. Faça login novamente.', 'error');
        localStorage.clear();
        navigate('/login');
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Erro ao buscar dados do cliente.' }));
        showMessage(errorData.detail || 'Erro ao buscar dados do cliente.', 'error');
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      showMessage('Erro de rede ao buscar dados.', 'error');
    } finally {
      setLoading(false);
    }
  }, [navigate, showMessage]);

  useEffect(() => {
    const id = localStorage.getItem('clienteId');
    if (id && id !== "null" && id !== "undefined") {
      setClienteId(id);
      fetchClienteData(id);
    } else {
      showMessage('ID do cliente não encontrado. Faça login.', 'error');
      navigate('/login');
    }
  }, [fetchClienteData, navigate, showMessage]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const executeSave = async () => {
    setIsSaveModalOpen(false);
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken || !clienteId) {
      showMessage('Não foi possível salvar. Tente fazer login novamente.', 'error');
      return;
    }
    setLoading(true);
    try {
      const dataToSubmit = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        endereco: formData.endereco,
      };
      const response = await fetch(`http://127.0.0.1:8000/api/clientes/${clienteId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });
      if (response.ok) {
        const updatedData = await response.json();
        showMessage('Dados atualizados com sucesso!', 'success');
        setFormData({
          nome: updatedData.nome || '',
          data_nasc: updatedData.data_nasc || formData.data_nasc,
          cpf: updatedData.cpf || formData.cpf,
          endereco: updatedData.endereco || '',
          email: updatedData.email || '',
          telefone: updatedData.telefone || '',
        });
        if (updatedData.nome && updatedData.nome !== localStorage.getItem('userName')) {
          localStorage.setItem('userName', updatedData.nome);
          window.dispatchEvent(new Event('storage'));
        }
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Erro ao salvar dados.' }));
        let errorMessage = errorData.detail || 'Erro ao salvar dados.';
        if (typeof errorData === 'object' && errorData !== null && !errorData.detail) {
          const fieldErrors = Object.entries(errorData)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          if (fieldErrors) errorMessage = fieldErrors;
        }
        showMessage(errorMessage, 'error');
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      showMessage('Erro de rede ao salvar dados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClick = (e) => {
      e.preventDefault(); // Previne qualquer comportamento padrão (importante!)
      setIsSaveModalOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAccount = async () => {
    setIsDeleteModalOpen(false);
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken || !clienteId) {
      showMessage('Não foi possível excluir. Tente fazer login novamente.', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/clientes/${clienteId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (response.status === 204) {
        showMessage('Conta excluída com sucesso!', 'success');
        localStorage.clear();
        navigate('/login');
      } else {
        const errorData = await response.json().catch(() => ({ detail: `Erro ${response.status} ao excluir conta.` }));
        showMessage(errorData.detail || `Erro ${response.status} ao excluir conta.`, 'error');
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      showMessage('Erro de rede ao excluir conta.', 'error');
    } finally {
      setLoading(false);
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
    zIndex: 10001,
    textAlign: 'center',
    minWidth: '300px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  };
  const successStyle = { ...messageStyles, backgroundColor: '#28a745' };
  const errorStyle = { ...messageStyles, backgroundColor: '#dc3545' };

  const cssStyles = `
      body { 
        background-color: #f0f2f5; 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
        Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        margin: 0;
      }
      .edit-page-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-size: cover;
        background-position: center;
        padding: 17px; 
        box-sizing: border-box;
      }
      .edit-box {
        background-color: white;
        padding: 30px 30px; 
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        width: 100%;
        max-width: 460px; 
        text-align: center;
        position: relative; 
      }
      .logo { 
          width: 100px; 
          margin-bottom: 15px; 
      }
      .form__title { 
          margin-bottom: 20px; 
          color: #333; 
          font-size: 1.7em; 
      }
      .input { 
          width: 100%; 
          padding: 10px 12px; 
          margin-bottom: 12px; 
          border: 1px solid #ccc; 
          border-radius: 4px; 
          box-sizing: border-box; 
          font-size: 0.95em; 
      }
      .input[readonly] {
          background-color: #e9ecef;
          cursor: not-allowed;
      }
      .form-label {
          display: block; 
          margin-bottom: 4px; 
          font-weight: bold;
          text-align: left;
          color: #555;
          font-size: 0.9em; 
      }
      .btn { 
          background-color:rgba(7, 143, 0, 0.75); 
          color: white; 
          padding: 10px 18px; 
          border: none; 
          border-radius: 4px; 
          cursor: pointer; 
          width: 100%; 
          font-size: 0.95em; 
          margin-top: 8px; 
          transition: background-color 0.3s ease;
          font-weight: bold;
      }
      .btn:hover { background-color:rgb(0, 135, 0); }
      .btn.delete { 
          background-color: #dc3545; 
          margin-top: 12px; 
      }
      .btn.delete:hover { background-color: #c82333; }
      .btn:disabled { background-color: #ccc; cursor: not-allowed; }
      .loading-text { font-size: 1em; color: #555; margin: 15px 0; }
      .back-button { 
        position: absolute; 
        top: 20px; 
        left: 25px; 
        cursor: pointer; 
        z-index: 10; 
        fill: #CF301D;
        width: 28px; 
        height: 28px; 
      }
  `;

  if (loading && !formData.nome) {
    return (
      <div className="edit-page-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
        <div className="edit-box">
            <img src={logo} alt="Logo" className="logo" />
            <p className="loading-text">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-page-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
       <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
       {message.text && (
            <div style={message.type === 'success' ? successStyle : errorStyle}>
                {message.text}
            </div>
        )}
      <div className="edit-box">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="bi bi-arrow-left-circle-fill back-button"
            viewBox="0 0 16 16"
            onClick={() => navigate('/')}
          >
            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.5 7.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
          </svg>
        <img src={logo} alt="Logo" className="logo" />
        <h2 className="form__title">Editar Perfil</h2>
        
        {!loading && !formData.nome && clienteId ? (
            <p className="loading-text">Não foi possível carregar os dados do perfil.</p>
        ) : (
          // Removido onSubmit, usaremos onClick no botão
          <form> 
            <label htmlFor="nome" className="form-label">Nome Completo:</label>
            <input
              id="nome"
              name="nome"
              type="text"
              placeholder="Nome completo"
              className="input"
              value={formData.nome}
              onChange={handleChange}
              required
            />
            <label htmlFor="email" className="form-label">E-mail:</label> 
            <input
              id="email"
              name="email"
              type="email"
              placeholder="E-mail"
              className="input"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <label htmlFor="telefone" className="form-label">Telefone:</label>
            <input
              id="telefone"
              name="telefone"
              type="tel"
              placeholder="Telefone"
              className="input"
              value={formData.telefone}
              onChange={handleChange}
              required
            />
             <label htmlFor="endereco" className="form-label">Endereço:</label>
            <input
              id="endereco"
              name="endereco"
              type="text"
              placeholder="Endereço"
              className="input"
              value={formData.endereco}
              onChange={handleChange}
            />
            <label htmlFor="data_nasc" className="form-label">Data de Nascimento:</label>
            <input
              id="data_nasc"
              name="data_nasc"
              type="date"
              className="input"
              value={formData.data_nasc}
              onChange={handleChange} 
              readOnly
            />
            <label htmlFor="cpf" className="form-label">CPF:</label>
            <input
              id="cpf"
              name="cpf"
              type="text"
              className="input"
              value={formData.cpf}
              onChange={handleChange} 
              readOnly 
            />
           
            {/* **** ALTERAÇÃO AQUI **** */}
            <button 
              type="button" // Mudado para "button"
              className="btn" 
              disabled={loading}
              onClick={handleSaveClick} // Adicionado onClick
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            {/* **** FIM DA ALTERAÇÃO **** */}

            <button 
              type="button" 
              className="btn delete" 
              onClick={handleDeleteClick} 
              disabled={loading}
            >
              {loading ? 'Processando...' : 'Excluir Conta'}
            </button>
          </form>
        )}
      </div>
      
      {/* Modal de Exclusão */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={confirmDeleteAccount}       
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita."
      />
      {/* Modal de Salvamento */}
      <ConfirmModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)} 
        onConfirm={executeSave}      
        title="Deseja Salvar as Alterações?"
        message="Você tem certeza que deseja salvar as alterações?"
      />
    </div>
  );
};

export default ClienteEdit;