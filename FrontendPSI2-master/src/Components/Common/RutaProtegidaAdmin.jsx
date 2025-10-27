import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAdminStatus } from '../../Services/authService.js';


const RutaProtegidaAdmin = ({ children }) => {
    const token = localStorage.getItem('authToken');
    
    const isAdmin = getAdminStatus();
    
    
    if (!token) {
        console.log('RutaProtegidaAdmin: No hay token, redirigiendo a login');
        return <Navigate to="/login" replace />;
    }
    
    
    if (!isAdmin) {
        console.log('RutaProtegidaAdmin: Usuario no es administrador, redirigiendo a dashboard');
        return <Navigate to="/donaciones" replace />;
    }
    
    
    console.log('RutaProtegidaAdmin: Usuario autorizado como administrador');
    return children;
};

export default RutaProtegidaAdmin; 