import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Consulta.css';

const ConsultaEnd = () => {
  const [activeForm, setActiveForm] = useState('cep');
  const [formData, setFormData] = useState({
    cep: '',
    logradouro: '',
    bairro: '',
    cidade: '',
    uf: ''
  });
  const [results, setResults] = useState(null);

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
    // Aqui você implementará a lógica de consulta
  };

  return (
    <div className="consulta-container">
      <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img src="/imagens/logo.png" alt="Logo" className="logo me-2" />
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link active" to="/">
                  <button type="button" className="btn btn-primary btn-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                      className="bi bi-house-door-fill" viewBox="0 0 16 16">
                      <path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5"></path>
                    </svg>
                    Início
                  </button>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/consulta-pf">
                  <button type="button" className="btn btn-primary btn-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                      className="bi bi-clipboard2-minus-fill" viewBox="0 0 16 16">
                      <path d="M10 .5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5.5.5 0 0 1-.5.5.5.5 0 0 0-.5.5V2a.5.5 0 0 0 .5.5h5A.5.5 0 0 0 11 2v-.5a.5.5 0 0 0-.5-.5.5.5 0 0 1-.5-.5"></path>
                      <path d="M4.085 1H3.5A1.5 1.5 0 0 0 2 2.5v12A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 12.5 1h-.585q.084.236.085.5V2a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 4 2v-.5q.001-.264.085-.5M6 8h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1 0-1"></path>
                    </svg>
                    Consultar dados
                  </button>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/consulta-end">
                  <button type="button" className="btn btn-primary btn-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                      className="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                      <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"></path>
                    </svg>
                    Consultar Endereço
                  </button>
                </Link>
              </li>
            </ul>

            <div className="dropdown">
              <button className="btn btn-primary btn-lg dropdown-toggle d-block ms-auto" type="button"
                data-bs-toggle="dropdown" aria-expanded="false">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                  className="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                  <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"></path>
                </svg>
                Opções
              </button>
              <ul className="dropdown-menu dropdown-menu-end mt-3">
                <li>
                  <Link className="dropdown-item" to="/conta">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                      className="bi bi-person-circle" viewBox="0 0 16 16">
                      <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"></path>
                      <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"></path>
                    </svg>
                    Conta
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/config">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                      className="bi bi-gear" viewBox="0 0 16 16">
                      <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"></path>
                      <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"></path>
                    </svg>
                    Configurações
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/cadastrar-usuarios">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                      className="bi bi-people-fill" viewBox="0 0 16 16">
                      <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"></path>
                    </svg>
                    Cadastrar Usuários
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li className="d-flex justify-content-between">
                  <button id="themeSwitcher" className="dropdown-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                      className="bi bi-moon-stars-fill" viewBox="0 0 16 16">
                      <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"></path>
                      <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.73 1.73 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.73 1.73 0 0 0 1.097-1.097zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z"></path>
                    </svg>
                    Trocar Tema
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link className="dropdown-item" to="/login">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                      className="bi bi-door-open-fill" viewBox="0 0 16 16">
                      <path d="M1.5 15a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1H13V2.5A1.5 1.5 0 0 0 11.5 1H11V.5a.5.5 0 0 0-.57-.495l-7 1A.5.5 0 0 0 3 1.5V15zM11 2h.5a.5.5 0 0 1 .5.5V15h-1zm-2.5 8c-.276 0-.5-.448-.5-1s.224-1 .5-1 .5.448.5 1-.224 1-.5 1"></path>
                    </svg>
                    Sair
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="container justify-content-center align-items-center mt-4">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <h2 className="text-center mb-4">Escolha a opção de consulta:</h2>
            <div className="row">
              <div className="col-md-6">
                <div className={`card card-option text-center p-3 ${activeForm === 'cep' ? 'active' : ''}`}
                  onClick={() => setActiveForm('cep')}>
                  <div className="icon-container">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="white"
                      className="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                      <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"></path>
                    </svg>
                  </div>
                  <h5>Consulta por CEP</h5>
                </div>
              </div>
              <div className="col-md-6">
                <div className={`card card-option text-center p-3 ${activeForm === 'chaves' ? 'active' : ''}`}
                  onClick={() => setActiveForm('chaves')}>
                  <div className="icon-container">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="white"
                      className="bi bi-clipboard-data-fill" viewBox="0 0 16 16">
                      <path d="M6.5 0A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0zm3 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z" />
                      <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1A2.5 2.5 0 0 1 9.5 5h-3A2.5 2.5 0 0 1 4 2.5zM10 8a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0zm-6 4a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0zm4-3a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1" />
                    </svg>
                  </div>
                  <h5>Chaves Alternativas</h5>
                </div>
              </div>
            </div>

            {activeForm === 'cep' && (
              <div className="form-container">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="cep" className="form-label">CEP</label>
                    <input
                      type="text"
                      className="form-control"
                      id="cep"
                      name="cep"
                      value={formData.cep}
                      onChange={handleFormChange}
                      placeholder="Digite o CEP"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Consultar</button>
                </form>
              </div>
            )}

            {activeForm === 'chaves' && (
              <div className="form-container">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="logradouro" className="form-label">Logradouro</label>
                    <input
                      type="text"
                      className="form-control"
                      id="logradouro"
                      name="logradouro"
                      value={formData.logradouro}
                      onChange={handleFormChange}
                      placeholder="Digite o logradouro"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="bairro" className="form-label">Bairro</label>
                    <input
                      type="text"
                      className="form-control"
                      id="bairro"
                      name="bairro"
                      value={formData.bairro}
                      onChange={handleFormChange}
                      placeholder="Digite o bairro"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="cidade" className="form-label">Cidade</label>
                    <input
                      type="text"
                      className="form-control"
                      id="cidade"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleFormChange}
                      placeholder="Digite a cidade"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="uf" className="form-label">UF</label>
                    <input
                      type="text"
                      className="form-control"
                      id="uf"
                      name="uf"
                      value={formData.uf}
                      onChange={handleFormChange}
                      placeholder="Digite a UF"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Consultar</button>
                </form>
              </div>
            )}

            {results && (
              <div className="results-container mt-4">
                {/* Aqui você exibirá os resultados da consulta */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultaEnd; 