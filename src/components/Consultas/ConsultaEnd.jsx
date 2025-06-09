import React, { useState } from 'react';
import '../styles/Consulta.css';

const ConsultaEnd = () => {
  const [activeForm, setActiveForm] = useState(null); // começa fechado
  const [formData, setFormData] = useState({
    cep: '',
    rua: '',
    bairro: '',
    cidade: '',
    uf: '',
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dados do formulário:', formData);
  };

  return (
    <div className="consulta-container">
      <h2 className="titulo-pagina">Escolha a opção de consulta:</h2>

      <div className="card-options-wrapper">
        <div
          className={`card card-option ${activeForm === 'cep' ? 'active' : ''}`}
          onClick={() => setActiveForm('cep')}
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
          onClick={() => setActiveForm('chaves')}
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
            value={formData.cpf}
            onChange={handleFormChange}
            placeholder="Digite o CEP"
            required
          />
          <button type="submit">Consultar</button>
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
            placeholder="Digite o Estado"
          />
          <button type="submit">Consultar</button>
        </form>
      )}
    </div>
  );
};

export default ConsultaEnd;
