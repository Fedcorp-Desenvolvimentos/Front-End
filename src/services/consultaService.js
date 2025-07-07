import api from './api'; 


export const ConsultaService = {
  getConsultaHistory: async () => {
    const response = await api.get('/consultas/historico/');
    return response.data;
  },

  realizarConsulta: async (payload) => {
    // Este método é genérico e aceitará o payload com tipo_consulta: 'cpf'
    // ou tipo_consulta: 'busca_cpf_alternativa'
    const response = await api.post('/consultas/realizar/', payload);
    return response.data;
  },

  /**
   * Realiza uma consulta de CPF. No backend, esta chamada será direcionada para a BigDataCorp.
   * @param {string} cpf - O número do CPF a ser consultado.
   * @returns {Promise<object>} - Promessa com o resultado da consulta de CPF.
   */
  consultarCpf: async (cpf) => { // Renomeado de consultarCpfPadrao para apenas consultarCpf, se for a única.
    const payload = {
      tipo_consulta: 'cpf', // Continua enviando 'cpf'
      parametro_consulta: cpf,
    };
    const response = await api.post('/consultas/realizar/', payload);
    return response.data;
  },
};