import api from "./api";

export const UserService = {
  /**
   * Realiza o login do usuário.
   * @param {object} payload - Credenciais de login (email, password).
   * @returns {Promise<object>} - Promessa com tokens de acesso e refresh e dados do usuário.
   */
  login: async (payload) => {
    const response = await api.post("/login/", payload);
    return response.data;
  },

  /**
   * Realiza o logout do usuário.
   * @param {object} payload - Token de refresh para invalidar.
   * @returns {Promise<any>} - Promessa indicando sucesso.
   */
  logout: async (payload) => {
    const response = await api.post("/logout/", payload);
    return response.data;
  },

  /**
   * Registra um novo usuário.
   * @param {object} payload - Detalhes do registro do usuário.
   * @returns {Promise<object>} - Promessa com os dados do novo usuário.
   */
  registerUser: async (payload) => {
    const response = await api.post("/users/", payload);
    return response.data;
  },

  /**
   * Busca todos os usuários.
   * @returns {Promise<Array<object>>} - Promessa com um array de usuários.
   */
  getAllUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  /**
   * Busca os detalhes do usuário atualmente autenticado.
   * @returns {Promise<object>} - Promessa com os detalhes do usuário.
   */
  getMe: async () => {
    const response = await api.get("/users/me/");
    return response.data;
  },

  /**
   * Atualiza um usuário por ID.
   * @param {number} userId - O ID do usuário a ser atualizado.
   * @param {object} payload - Dados parciais do usuário para atualização.
   * @returns {Promise<object>} - Promessa com os dados do usuário atualizado.
   */
  updateUser: async (userId, payload) => {
    const response = await api.patch(`/users/${userId}/`, payload);
    return response.data;
  },

  /**
   * Deleta um usuário por ID.
   * @param {number} userId - O ID do usuário a ser deletado.
   * @returns {Promise<any>} - Promessa indicando sucesso.
   */
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}/`);
    return response.data;
  },
};
