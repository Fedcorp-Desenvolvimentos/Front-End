import React, { useState } from 'react';
import '../styles/Consulta.css';
import { ConsultaService } from '../../services/consultaService';
import { FileSpreadsheet } from 'lucide-react';

const ConsultaPF = () => {

  const [activeForm, setActiveForm] = useState('cpf');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);

  const [formData, setFormData] = useState({
    cpf: '',
    nome: '',
    dataNascimento: '',
    uf: '',
    email: '',
    telefone: ''
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cpf') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 11) {
        formattedValue = formattedValue.substring(0, 11);
      }
    }

    if (name === 'uf') {
      formattedValue = value.toUpperCase().substring(0, 2);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResultado(null);

    let payload = {};
    let isFormValid = true;
    let validationErrorMessage = '';

    if (activeForm === 'cpf') {

      if (formData.cpf.length !== 11) {
        validationErrorMessage = 'Por favor, insira um CPF válido com 11 dígitos.';
        isFormValid = false;
      } else {
        payload = {
          tipo_consulta: 'cpf', // Conforme sua API espera para CPF
          parametro_consulta: formData.cpf,
        };
      }

    } else if (activeForm === 'chaves') {

      if (!formData.nome.trim() && !formData.dataNascimento.trim() && !formData.uf.trim() && !formData.email.trim() && !formData.telefone.trim()) {
        validationErrorMessage = 'Por favor, preencha pelo menos um campo para busca de CPF por chaves alternativas.';
        isFormValid = false;
      } else {
        // IMPORTANTE: Aqui você define como o payload será enviado para o backend.
        // O `realizarConsulta` que temos espera 'tipo_consulta' e 'parametro_consulta'.
        // Para chaves alternativas, o ideal seria um novo `tipo_consulta`
        // E o `parametro_consulta` seria um JSON stringificado do formData.

        payload = {
          tipo_consulta: 'busca_cpf_alternativa',
          parametro_consulta: JSON.stringify({
            nome: formData.nome,
            dataNascimento: formData.dataNascimento,
            uf: formData.uf,
            email: formData.email,
            telefone: formData.telefone
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
      const response = await ConsultaService.realizarConsulta(payload);
      setResultado(response);
      console.log('Resultado da consulta de CPF:', response);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Erro ao realizar consulta de CPF.';
      setError(errorMessage);
      console.error('Erro na consulta de CPF:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="consulta-container">
      <h2 className="titulo-pagina">Escolha a opção de consulta:</h2>

      <div className="card-options-wrapper">
        {/* Card Consulta por CPF */}
        <div
          className={`card card-option ${activeForm === 'cpf' ? 'active' : ''}`}
          onClick={() => {
            setActiveForm('cpf');
            setFormData({ ...formData, cpf: '' });
            setError(null);
            setResultado(null);
          }}
        >
          <div className="icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 16 16">
              <path d="M12 1a1 1 0 0 1 1 1v10.755S12 11 8 11s-5 1.755-5 1.755V2a1 1 0 0 1 1-1zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
              <path d="M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
            </svg>
          </div>
          <h5>Consulta por CPF</h5>
        </div>

        {/* Card Chaves Alternativas */}
        <div
          className={`card card-option ${activeForm === 'chaves' ? 'active' : ''}`}
          onClick={() => {
            setActiveForm('chaves');
            setFormData({
              cpf: '',
              nome: '',
              dataNascimento: '',
              uf: '',
              email: '',
              telefone: ''
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

        {/* Card Consulta em Massa */}
        <div
          className={`card card-option ${activeForm === 'massa' ? 'active' : ''}`}
          onClick={() => {
            setActiveForm('massa');
            setError(null);
            setResultado(null);
          }}
        >
          <div className="icon-container">
            <FileSpreadsheet size={35} />
          </div>
          <h5>Consulta em Massa</h5>
        </div>
      </div>

      {/* Formulário CPF */}
      {activeForm === 'cpf' && (
        <form className="form-container" onSubmit={handleSubmit}>
          <label htmlFor="cpf-input">Digite o documento</label>
          <input
            type="text"
            id="cpf-input"
            name="cpf"
            value={formData.cpf}
            onChange={handleFormChange}
            placeholder="Digite o CPF (apenas números)"
            required
          />
          <button type="submit" disabled={loading || formData.cpf.length !== 11}>Consultar</button>
          {error && <p className="error-message">{error}</p>}
        </form>
      )}

      {/* Formulário Chaves Alternativas */}
      {activeForm === 'chaves' && (
        <form className="form-container" onSubmit={handleSubmit}>
          <label htmlFor="nome">Nome</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleFormChange}
            placeholder="Digite o nome"
          />
          <label htmlFor="dataNascimento">Data de Nascimento</label>
          <input
            type="date"
            id="dataNascimento"
            name="dataNascimento"
            value={formData.dataNascimento}
            onChange={handleFormChange}
            placeholder="DD/MM/AAAA"
          />
          <label htmlFor="uf">UF</label>
          <input
            type="text"
            id="uf"
            name="uf"
            value={formData.uf}
            onChange={handleFormChange}
            placeholder="Digite a UF (ex: RJ)"
            maxLength="2"
          />
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleFormChange}
            placeholder="Digite o e-mail"
          />
          <label htmlFor="telefone">Telefone</label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleFormChange}
            placeholder="Digite o telefone"
          />
          <button
            type="submit"
            disabled={loading || (!formData.nome.trim() && !formData.dataNascimento.trim() && !formData.uf.trim() && !formData.email.trim() && !formData.telefone.trim())}
          >
            Consultar
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      )}

      {/* Conteúdo Consulta em Massa */}
      {activeForm === 'massa' && (
        <div className="form-massa-container">
          <button
            type="button"
            onClick={() => document.getElementById('input-massa').click()}
          >
            Importar Planilha
          </button>
          <button
            type="button"
            onClick={() => {
              const link = document.createElement('a');
              link.href = '/planilha-modelo.xlsx';
              link.download = 'planilha-modelo.xlsx';
              link.click();
            }}
          >
            Baixar Planilha Modelo
          </button>
          <input
            type="file"
            id="input-massa"
            accept=".xlsx, .xls"
            style={{ display: 'none' }}
            onChange={e => {
              const arquivo = e.target.files[0];
              if (arquivo) console.log('Importou:', arquivo.name);
              // chamar aqui para baixar a planilha quando tiver o modelo definido
            }}
          />

          <button
              type="button"
              onClick={() => {
                const link = document.createElement('a');
                link.href = '/planilha-resultado.xlsx';
                link.download = 'planilha-resultado.xlsx';
                link.click();
              }}
          >
            Exportar Resultado
          </button>
        </div>
      )}

      {/* Resultado da Consulta */}
      {resultado?.resultado_api && (
        <div className="card-resultado">
          <h4>Resultado da busca realizada</h4>

          <label>Nome:</label>
          <input type="text" value={resultado.resultado_api.result.name} disabled />

          <label>CPF:</label>
          <input type="text" value={resultado.resultado_api.result.taxIdNumber} disabled />

          <label>Idade:</label>
          <input type="text" value={resultado.resultado_api.result.age} disabled />

          <label>Data de Nascimento:</label>
          <input
            type="text"
            value={`${resultado.resultado_api.result.CapturedBirthDateFromRFSource}`}
            disabled
          />

          <label>Filiação:</label>
          <input
            type="text"
            value={`${resultado.result.MotherName}`}
            disabled
          />

          <label>Indicação de Óbito:</label>
          <input
            type="text"
            value={`${resultado.resultado_api.result.HasObitIndication}`}
            disabled
          />
        </div>
      )}
    </div>
  );
};

export default ConsultaPF;
