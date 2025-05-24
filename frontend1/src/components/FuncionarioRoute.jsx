import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const FuncionarioRoute = () => {
    const accessToken = localStorage.getItem('accessToken');
    // Verifica se 'isFuncionario' é 'true' (localStorage guarda strings)
    const isFuncionario = localStorage.getItem('isFuncionario') === 'true';

    if (!accessToken) {
        // Se não há token (não está logado), redireciona para a página de login
        // O 'replace' evita que a rota protegida entre no histórico de navegação
        return <Navigate to="/login" replace />;
    }

    if (!isFuncionario) {
        // Se há token, mas o usuário NÃO é um funcionário,
        // redireciona para a página inicial do cliente (ou uma página de "Acesso Negado")
        return <Navigate to="/" replace />; 
        // Alternativamente, para uma página específica de não autorizado:
        // return <Navigate to="/nao-autorizado" replace />;
    }

    // Se tem token E é funcionário, permite o acesso à rota filha (renderiza o <Outlet />)
    return <Outlet />;
};

export default FuncionarioRoute;
