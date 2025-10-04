import api from "./api";

export const calcularCotacao = async (payload) => {
  const response = await api.post("cotacao/incendio-conteudo/", payload);

  return response.data;
};
