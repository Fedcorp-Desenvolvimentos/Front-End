import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../services/api';

const PrivateRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        await api.get('users/me/');
        setIsAuthenticated(true); 
      } catch (error) {
      
        console.error("Erro na verificação do token na rota privada:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false); 
      }
    };

    verifyToken();
  }, []);


  if (isLoading) {
    return
  }

  if (isAuthenticated) {
    return <Outlet />;
  } else {
    localStorage.removeItem('accessToken'); 
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;