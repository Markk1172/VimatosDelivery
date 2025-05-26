import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const FuncionarioRoute = () => {
    const accessToken = localStorage.getItem('accessToken');
    const isFuncionario = localStorage.getItem('isFuncionario') === 'true';

    if (!accessToken) {
        return <Navigate to="/login" replace />;
    }

    if (!isFuncionario) {
        return <Navigate to="/" replace />; 
    }

    return <Outlet />;
};

export default FuncionarioRoute;
