// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js'; // Certifique-se que o caminho está correto

const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); 
    const navigate = useNavigate();

  
    const login = useCallback(async (credentials) => {
        setLoading(true); 
        try {
            await api.post('/login/', credentials)
            const userResponse = await api.get('/users/me/');
            setUser(userResponse.data);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            setIsAuthenticated(false);
            setUser(null);
            return { success: false, error: error.response?.data?.detail || "Login failed" };
        } finally {
            setLoading(false); 
        }
    }, []);


    const logout = useCallback(async () => {
        setLoading(true);
        try {
          
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error("Logout failed:", error.response?.data || error.message);
           
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false); 
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
            
                const response = await api.get('/users/me/');
                setUser(response.data);
                setIsAuthenticated(true);
            } catch (error) {
               
                console.log("Usuário não autenticado ou sessão expirada:", error.response?.status);
                setUser(null);
                setIsAuthenticated(false);
                
                if (window.location.pathname !== '/login') {
                     navigate('/login');
                }
            } finally {
                
                setLoading(false);
            }
        };
        checkAuthStatus(); 
    }, []); 

    const authContextValue = useMemo(() => ({
        user,
        isAuthenticated,
        loading,
        login,
        logout,
    }), [user, isAuthenticated, loading, login, logout]);

    // Renderiza o conteúdo do aplicativo apenas quando a verificação inicial de autenticação for concluída
    if (loading) {
        return <div>Carregando autenticação...</div>;
    }

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};