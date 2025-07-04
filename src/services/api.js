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
      originalRequest._retry = true; // Marca como retentativa para evitar loops infinitos

      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
         const refreshResponse = await axios.post(`${API_BASE_URL}/login/refresh/`, { refresh: refreshToken });
         const newAccessToken = refreshResponse.data.access;
         localStorage.setItem('accessToken', newAccessToken);
         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
         return api(originalRequest); // Retenta a requisição original com o novo token

          //console.warn(
            //"Token de acesso expirado. Implemente a lógica de refresh de token aqui."
          //);
          // Por enquanto, podemos redirecionar para o login ou forçar o logout
          
        } catch (refreshError) {
          console.error("Falha ao renovar o token:", refreshError);
          // Força o logout se a renovação falhar
          // window.location.href = '/login';
        }
      } else {
        console.warn(
          "Nenhum refresh token disponível. Redirecionando para o login."
        );
        // window.location.href = '/login'; // Redireciona para a página de login
      }
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
