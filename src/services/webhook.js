import axios from 'axios';

const webHook = axios.create({
  baseURL: 'http://192.168.0.189:8000/', // Mantenha sua URL do backend
});

export default webHook;