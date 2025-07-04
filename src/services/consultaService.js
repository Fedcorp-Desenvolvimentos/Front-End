import api from './api';

export const ConsultaService = {
  /**
   * Busca o histórico de todas as consultas do usuário autenticado.
   * @returns {Promise<Array<object>>} - Promessa com um array de itens do histórico de consultas.
   */
  getConsultaHistory: async () => {
    const response = await api.get('/consultas/historico/');
    return response.data;
  },

  /**
   * Realiza um tipo específico de consulta (CEP, CPF, CNPJ).
   * @param {object} payload - Tipo e parâmetro da consulta.
   * @param {string} payload.tipo_consulta - Tipo da consulta ('endereco', 'cpf', 'cnpj').
   * @param {string} payload.parametro_consulta - Parâmetro da consulta (CEP, CPF, CNPJ).
   * @returns {Promise<object>} - Promessa com o resultado da consulta.
   */
  realizarConsulta: async (payload) => {
    const response = await api.post('/consultas/realizar/', payload);
    return response.data;
  },
};