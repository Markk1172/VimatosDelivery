import React from 'react';

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  content: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    maxWidth: '400px',
    width: '90%',
    textAlign: 'center',
  },
  title: {
    marginTop: 0,
    marginBottom: '15px',
    fontSize: '1.5em',
    color: '#333',
  },
  message: {
    marginBottom: '25px',
    fontSize: '1.1em',
    color: '#555',
    lineHeight: '1.6',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '10px',
  },
  button: {
    padding: '12px 25px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
  },
  confirmButton: {
    backgroundColor: '#CF301D', // Vermelho principal
    color: 'white',
  },
  cancelButton: {
    backgroundColor: '#6c757d', // Cinza para cancelar
    color: 'white',
  }
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div style={modalStyles.overlay} onClick={onClose}> {/* Permite fechar clicando fora */}
      <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}> {/* Evita fechar ao clicar dentro do conteúdo */}
        <h2 style={modalStyles.title}>{title || "Confirmar Ação"}</h2>
        <p style={modalStyles.message}>{message || "Você tem certeza?"}</p>
        <div style={modalStyles.buttons}>
          <button
            style={{ ...modalStyles.button, ...modalStyles.cancelButton }}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            style={{ ...modalStyles.button, ...modalStyles.confirmButton }}
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;