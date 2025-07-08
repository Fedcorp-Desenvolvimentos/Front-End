import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Erro 401: Token de acesso inválido ou expirado. Redirecionando para o login.");
     
      localStorage.removeItem('accessToken'); 
    
      window.location.href = "/login";
      
   
      return Promise.reject(error);
    } 


    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Ocorreu um erro inesperado.";
    
    console.error(
      `Erro da API: ${errorMessage}`,
      error.response?.status,
      error.response?.data
    );

    return Promise.reject(error);
  }
);

export default api;