import axios from 'axios'
import { API_HTTP_BASE, AUTH_HTTP_BASE } from '../config/apiBase.js'
const USUARIO_URL = `${API_HTTP_BASE}/usuarios`   // -> /api/usuarios
export let globalCI = null;

export const loginUser = async (credentials) => {
    try {
        
        const response = await axios.post(`${AUTH_HTTP_BASE}/login`, credentials);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Error al iniciar sesión';
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_HTTP_BASE}/usuarios/register`, userData);

        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Error al registrarse';
    }
};

export const parseJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT:', error);
        return null;
    }
};

export const extractSubject = (token) => {
    const decodedToken = parseJwt(token);
    if (decodedToken && decodedToken.sub) {
        return decodedToken.sub;
    }
    return null;
};

export const saveToken = (token, expiration) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('tokenExpirationDate', expiration.toString());
    
    const subject = extractSubject(token);
    if (subject) {
        globalCI = subject;
        console.log('CI del usuario extraído del token:', globalCI);
        localStorage.setItem('userCI', subject);
    }
};

export const getToken = () => {
    return localStorage.getItem('authToken');
};

export const getUserCI = () => {
    return globalCI || localStorage.getItem('userCI');
};

export const fetchUserByCI = async (ci) => {
    try {
        const response = await API.get(`${USUARIO_URL}/ci/${ci}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user by CI:', error);
        throw error.response?.data?.message || 'Error al obtener datos del usuario';
    }
};

export const saveAdminStatus = (isAdmin) => {
    localStorage.setItem('isAdmin', isAdmin.toString());
    console.log('Estado de administrador guardado:', isAdmin);
};

export const getAdminStatus = () => {
    const adminStatus = localStorage.getItem('isAdmin');
    return adminStatus === 'true';
};

export const checkAndSaveAdminStatus = async (ci) => {
    try {
        const userData = await fetchUserByCI(ci);
        const isAdmin = userData.admin || false;
        saveAdminStatus(isAdmin);
        return isAdmin;
    } catch (error) {
        console.error('Error checking admin status:', error);
        saveAdminStatus(false);
        return false;
    }
};

export const setNewPassword = async (ci, password) => {
    try {
        const response = await API.post(`${USUARIO_URL}/newPassword/${ci}`, {
            contrasena: password
        });
        return response.data;
    } catch (error) {
        console.error('Error setting new password:', error);
        throw error.response?.data?.message || 'Error al establecer la nueva contraseña';
    }
};

export const logoutUser = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userCI');
    localStorage.removeItem('isAdmin');
    globalCI = null;
};