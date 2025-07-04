import React, { useState } from 'react';
import '../styles/Consulta.css';
import { ConsultaService } from '../../services/consultaService';
import { FileSpreadsheet } from 'lucide-react';

const ConsultaCNPJ = () => {

  const [cnpj, setCnpj] = useState('');
  const [activeForm, setActiveForm] = useState('cnpj');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [formData, setFormData] = useState({
    razaoSocial: '',
    uf: '',
    email: '',
    telefone: ''
  });

  const handleCnpjChange = (e) => {
    const rawCnpj = e.target.value.replace(/\D/g, '');
    setCnpj(rawCnpj);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (activeForm === 'cnpj') {
      if (cnpj.length !== 14) {
        validationErrorMessage = 'Por favor, insira um CNPJ válido com 14 dígitos.';
        isFormValid = false;
      } else {
        payload = {
          tipo_consulta: 'cnpj',
          parametro_consulta: cnpj,
        };
      }
    } else if (activeForm === 'chaves') {
      // Lógica para o formulário de Chaves Alternativas
      // O seu backend PRECISARÁ ter um endpoint ou lógica para lidar com este tipo de busca.
      // Assumindo que o backend espera 'nome_empresa' ou 'razao_social' como tipo_consulta.
      // E que pode aceitar os outros campos como filtros ou parâmetros de busca.

      // Exemplo: Validação mínima para Razão Social
      if (!formData.razaoSocial.trim() && !formData.uf.trim() && !formData.email.trim() && !formData.telefone.trim()) {
        validationErrorMessage = 'Por favor, preencha pelo menos um campo para busca por chaves alternativas.';
        isFormValid = false;
      } else {
        // IMPORTANTE: Aqui você define como o payload será enviado para o backend.
        // O `realizarConsulta` que temos espera 'tipo_consulta' e 'parametro_consulta'.
        // Para chaves alternativas, o ideal seria um novo `tipo_consulta` (ex: 'busca_avancada_cnpj')
        // E o `parametro_consulta` seria um JSON stringificado ou o backend precisaria de outro endpoint.

        // CENÁRIO 1: O BACKEND JÁ TEM UM TIPO DE CONSULTA ESPECÍFICO PARA ISSO
        // Exemplo: Se o backend aceita `tipo_consulta: 'nome_empresa'` e `parametro_consulta: 'Razão Social'`
        // OU se ele aceita `tipo_consulta: 'cnpj_alternativo'` e `parametro_consulta: {razaoSocial: '...', uf: '...'}`
        // Essa é a maneira mais provável de funcionar com seu `realizarConsulta`.

        // **Por favor, CONFIRME com seu backend qual tipo_consulta e formato de parametro_consulta ele espera para buscas por nome/chaves alternativas.**

        // Por enquanto, vamos assumir um `tipo_consulta` genérico e o `parametro_consulta` como um objeto
        // stringificado, esperando que o backend o desestruture.
        // ESSA É UMA ADAPTAÇÃO TEMPORÁRIA E PODE NÃO SER A FORMA IDEAL PARA O SEU BACKEND.

        payload = {
          tipo_consulta: 'busca_cnpj_alternativa', // <--- Este NOVO tipo_consulta precisa ser suportado pelo backend!
          parametro_consulta: JSON.stringify(formData), // <--- Envia o objeto como string JSON
        };

        // CENÁRIO 2: SE O BACKEND TIVER UM ENDPOINT DIFERENTE PARA BUSCA AVANÇADA
        // Se houver um endpoint como `/consultas/cnpj/buscar-alternativo/` que aceita
        // um POST com {razaoSocial: '', uf: ''}, você faria:
        // const response = await api.post('/consultas/cnpj/buscar-alternativo/', formData);
        // E precisaria de uma nova função em `ConsultaService`.
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
      console.log('Resultado da consulta:', response);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Erro ao realizar consulta.';
      setError(errorMessage);
      console.error('Erro na consulta:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="consulta-container">
      <h2 className="titulo-pagina">Escolha a opção de consulta:</h2>

      <div className="card-options-wrapper">
        <div
          className={`card card-option ${activeForm === 'cnpj' ? 'active' : ''}`}
          onClick={() => {
            setActiveForm('cnpj');
            setError(null);
            setResultado(null);
          }}
        >
          <div className="icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="white"
              className="bi bi-building" viewBox="0 0 16 16">
              <path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z" />
              <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3z" />
            </svg>
          </div>
          <h5>Consulta por CNPJ</h5>
        </div>

        <div
          className={`card card-option ${activeForm === 'chaves' ? 'active' : ''}`}
          onClick={() => {
            setActiveForm('chaves');
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

      {activeForm === 'cnpj' && (
        <form className="form-container" onSubmit={handleSubmit}>
          <label htmlFor="cnpj">Digite o documento</label>
          <input
            type="text"
            id="cnpj"
            name="cnpj"
            value={cnpj}
            onChange={handleCnpjChange}
            placeholder="Digite o CNPJ"
            required
          />
          <button type="submit" disabled={loading || cnpj.length !== 14}>Consultar</button>
          {error && <p className="error-message">{error}</p>}
        </form>
      )}

      {activeForm === 'chaves' && (
        <form className="form-container" onSubmit={handleSubmit}>
          <label htmlFor="razaoSocial">Razão Social:</label>
          <input
            type="text"
            id="razaoSocial"
            name="razaoSocial"
            value={formData.razaoSocial}
            onChange={handleFormChange}
            placeholder="Digite a razão social"
          />

          <label htmlFor="uf">UF</label>
          <input
            type="text"
            id="uf"
            name="uf"
            value={formData.uf}
            onChange={handleFormChange}
            placeholder="Digite a UF"
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
          // Você pode adicionar maxLength e pattern para telefone se quiser formatar/validar
          />
          <button
            type="submit"
            disabled={loading || (!formData.razaoSocial.trim() && !formData.uf.trim() && !formData.email.trim() && !formData.telefone.trim())}
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


      {resultado?.resultado_api && (
        <div className="card-resultado">
          <h4>Resultado da busca realizada</h4>

          <label>Razão Social:</label>
          <input type="text" value={resultado.resultado_api.razao_social || ''} disabled />

          <label>CNPJ:</label>
          <input type="text" value={resultado.resultado_api.cnpj || ''} disabled />

          <label>Atividade:</label>
          <input type="text" value={resultado.resultado_api.cnae_fiscal_descricao || ''} disabled />

          <label>Endereço:</label>
          <input
            type="text"
            value={
              `${resultado.resultado_api.descricao_tipo_de_logradouro || ''} ${resultado.resultado_api.logradouro || ''}, ${resultado.resultado_api.numero || ''}`
            }
            disabled
          />

          <label>Bairro:</label>
          <input
            type="text"
            value={
              `${resultado.resultado_api.bairro}`
            }
            disabled
          />

          <label>Munícipio:</label>
          <input
            type="text"
            value={
              `${resultado.resultado_api.municipio}`
            }
            disabled
          />

          <label>UF:</label>
          <input
            type="text"
            value={
              `${resultado.resultado_api.uf}`
            }
            disabled
          />

          <label>CEP:</label>
          <input
            type="text"
            value={
              `${resultado.resultado_api.cep}`
            }
            disabled
          />


          <label>Situação Cadastral:</label>
          <input type="text" value={resultado.resultado_api.descricao_situacao_cadastral || 'Não informada'} disabled />
        </div>
      )}

    </div>
  );
};

export default ConsultaCNPJ;