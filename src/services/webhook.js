import axios from 'axios';

const webHook = axios.create({
  baseURL: 'http://187.16.120.69:7429/', // Mantenha sua URL do backend
});

export default webHook;