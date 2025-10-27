import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../Services/authService.js';

export function useTokenExpirationCheck() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const expiration = localStorage.getItem('tokenExpirationDate');

        if (token && expiration) {
            const now = new Date().getTime();
            const remaining = parseInt(expiration) - now;

            if (remaining <= 0) {
                logoutUser();
                navigate('/login');
            } else {
                const timeout = setTimeout(() => {
                    logoutUser();
                    navigate('/login');
                }, remaining);

                return () => clearTimeout(timeout);
            }
        }
 }, [navigate]);
}