import React, { useState } from 'react';
import '../styles/Consulta.css';
import { ConsultaService } from '../../services/consultaService'; // Importe o serviço de consultas

const ConsultaEnd = () => {
  // Estado para controlar qual formulário está ativo ('cep' ou 'chaves')
  const [activeForm, setActiveForm] = useState('cep'); // Começa com o formulário de CEP ativo
  // Estados para feedback da requisição
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);

  // Estado para os dados do formulário
  const [formData, setFormData] = useState({
    cep: '',
    rua: '',
    bairro: '',
    cidade: '',
    uf: '',
  });

  // Handler para os inputs de formulário (agora mais genérico para todos os campos do formData)
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formatação específica para o campo 'cep'
    if (name === 'cep') {
      formattedValue = value.replace(/\D/g, ''); // Remove tudo que não for dígito
      if (formattedValue.length > 8) { // Limita o tamanho para 8 dígitos
        formattedValue = formattedValue.substring(0, 8);
      }
    }
    // Formatação para UF (garante maiúsculas e limita a 2 caracteres)
    if (name === 'uf') {
      formattedValue = value.toUpperCase().substring(0, 2);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  // Handler principal para o envio de qualquer formulário
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResultado(null); // Limpa o resultado anterior

    let payload = {};
    let isFormValid = true;
    let validationErrorMessage = '';

    if (activeForm === 'cep') {
      // Lógica para o formulário de CEP
      if (formData.cep.length !== 8) {
        validationErrorMessage = 'Por favor, insira um CEP válido com 8 dígitos.';
        isFormValid = false;
      } else {
        payload = {
          tipo_consulta: 'endereco', // Conforme sua API espera para CEP
          parametro_consulta: formData.cep,
        };
      }
    } else if (activeForm === 'chaves') {
      // Lógica para o formulário de Chaves Alternativas (endereço)
      // O seu backend PRECISARÁ ter um endpoint ou lógica para lidar com este tipo de busca.
      // Assumindo que o backend espera 'busca_endereco_alternativa' como tipo_consulta.

      // Validação mínima para Chaves Alternativas
      if (!formData.rua.trim() && !formData.bairro.trim() && !formData.cidade.trim() && !formData.uf.trim()) {
        validationErrorMessage = 'Por favor, preencha pelo menos um campo para busca de endereço.';
        isFormValid = false;
      } else {
        // IMPORTANTE: Aqui você define como o payload será enviado para o backend.
        // O `realizarConsulta` que temos espera 'tipo_consulta' e 'parametro_consulta'.
        // Para chaves alternativas, o ideal seria um novo `tipo_consulta`
        // E o `parametro_consulta` seria um JSON stringificado do formData.

        // **Por favor, CONFIRME com seu backend qual tipo_consulta e formato de parametro_consulta ele espera para buscas de endereço por chaves alternativas.**

        payload = {
          tipo_consulta: 'busca_endereco_alternativa', // <--- Este NOVO tipo_consulta precisa ser suportado pelo backend!
          parametro_consulta: JSON.stringify({ // <--- Envia o objeto como string JSON
            rua: formData.rua,
            bairro: formData.bairro,
            cidade: formData.cidade,
            uf: formData.uf
          }),
        };
      }
    }

    if (!isFormValid) {
      setError(validationErrorMessage);
      setLoading(false);
      return;
    }

    try {
      // Chama o serviço de consulta com o payload preparado
      const response = await ConsultaService.realizarConsulta(payload);
      setResultado(response);
      console.log('Resultado da consulta de endereço:', response);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Erro ao realizar consulta de endereço.';
      setError(errorMessage);
      console.error('Erro na consulta de endereço:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="consulta-container">
      <h2 className="titulo-pagina">Escolha a opção de consulta:</h2>

      <div className="card-options-wrapper">
        <div
          className={`card card-option ${activeForm === 'cep' ? 'active' : ''}`}
          onClick={() => {
            setActiveForm('cep');
            setFormData({ ...formData, cep: '' }); // Limpa apenas o CEP ao trocar
            setError(null);
            setResultado(null);
          }}
        >
          <div className="icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="white"
              className="bi bi-geo-alt-fill" viewBox="0 0 16 16">
              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"></path>
            </svg>
          </div>
          <h5>Consulta por CEP</h5>
        </div>

        <div
          className={`card card-option ${activeForm === 'chaves' ? 'active' : ''}`}
          onClick={() => {
            setActiveForm('chaves');
            setFormData({ // Limpa os campos do formulário de chaves
              cep: '', // Se precisar limpar o CEP também
              rua: '',
              bairro: '',
              cidade: '',
              uf: '',
            });
            setError(null);
            setResultado(null);
          }}
        >
          <div className="icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 16 16">
              <path d="M6.5 0A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0zm3 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z" />
              <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1A2.5 2.5 0 0 1 9.5 5h-3A2.5 2.5 0 0 1 4 2.5zM10 8a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0zm-6 4a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0zm4-3a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1" />
            </svg>
          </div>
          <h5>Chaves Alternativas</h5>
        </div>
      </div>

      {activeForm === 'cep' && (
        <form className="form-container" onSubmit={handleSubmit}>
          <label htmlFor="cep">Digite o CEP para ser localizado</label>
          <input
            type="text"
            id="cep"
            name="cep"
            value={formData.cep} // Usando formData.cep aqui
            onChange={handleFormChange}
            placeholder="Digite o CEP (apenas números)"
            required
          />
          <button type="submit" disabled={loading || formData.cep.length !== 8}>Consultar</button>
          {error && <p className="error-message">{error}</p>}
        </form>
      )}

      {activeForm === 'chaves' && (
        <form className="form-container" onSubmit={handleSubmit}>
          <label htmlFor="rua">Rua:</label>
          <input
            type="text"
            id="rua"
            name="rua"
            value={formData.rua}
            onChange={handleFormChange}
            placeholder="Digite o nome da rua"
          />
          <label htmlFor="bairro">Bairro:</label>
          <input
            type="text"
            id="bairro"
            name="bairro"
            value={formData.bairro}
            onChange={handleFormChange}
            placeholder="Digite o nome do bairro"
          />
          <label htmlFor="cidade">Cidade:</label>
          <input
            type="text"
            id="cidade"
            name="cidade"
            value={formData.cidade}
            onChange={handleFormChange}
            placeholder="Digite a cidade"
          />
          <label htmlFor="uf">UF:</label>
          <input
            type="text"
            id="uf"
            name="uf"
            value={formData.uf}
            onChange={handleFormChange}
            placeholder="Digite o Estado (ex: RJ)"
            maxLength="2"
          />
          <button
            type="submit"
            disabled={loading || (!formData.rua.trim() && !formData.bairro.trim() && !formData.cidade.trim() && !formData.uf.trim())}
          >
            Consultar
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      )}

      {resultado && (
        <div className="resultado-container">
          <h3>Resultado da Consulta:</h3>
          <pre>{JSON.stringify(resultado, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ConsultaEnd;