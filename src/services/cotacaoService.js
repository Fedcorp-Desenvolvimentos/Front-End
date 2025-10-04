import api from "./api";

export const calcularCotacao = (payload) => {
  return api.post(API_URL + "cotacao/incendio-conteudo/", payload);
};
