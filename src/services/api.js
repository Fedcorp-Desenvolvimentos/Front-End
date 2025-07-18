// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://bigcorp-backend.onrender.com/', // Mantenha sua URL do backend
  withCredentials: true, // Importante para enviar e receber cookies
});

// --- ADICIONE ESTE CÓDIGO PARA TRATAR O CSRF ---
// Função para obter o cookie CSRF
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Intercepta todas as requisições Axios
api.interceptors.request.use(function (config) {
    // Para métodos diferentes de GET, HEAD, OPTIONS
    if (config.method !== 'get' && config.method !== 'head' && config.method !== 'options') {
        const csrfToken = getCookie('csrftoken'); // Obtém o token do cookie 'csrftoken'
        if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken; // Adiciona o token ao cabeçalho X-CSRFToken
        }
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

export default api;