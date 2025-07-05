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
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      localStorage.clear() 
      window.location.href="/login"
    
      } else {
        console.warn(
          "Nenhum refresh token disponível. Redirecionando para o login."
        );
        window.location.href = '/login';
      }
    

    // Tratamento de erro padrão para outros erros HTTP
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Ocorreu um erro inesperado.";
    console.error(
      `Erro da API: ${errorMessage}`,
      error.response?.status,
      error.response?.data
    );

    // Rejeita o erro para que ele possa ser capturado pela função/componente que chamou
    return Promise.reject(error);
  }
);

export default api;
