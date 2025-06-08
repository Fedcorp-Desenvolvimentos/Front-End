import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/EsqueciSenha.css';

const EsqueciSenha = () => {
  return (
    <div className="esqueci-senha-container">
      <div className="carousel-section">
        <div className="carousel">
          <img src="/imagens/IMG-4.png" alt="Imagem de fundo" />
        </div>
      </div>

      <div className="form-section">
        <div className="form-container">
          <div className="card">
            <div className="logo-container">
              <img src="/imagens/logo3.png" alt="Logo" className="logo" />
            </div>

            <div className="card-header">
              <i className="bi bi-sliders"></i>
              <h2>Entre em contato com suporte!</h2>
            </div>

            <hr />

            <div className="card-body">
              <p>
                Para solicitar a sua senha entre em contato com a manutenção do sistema.
              </p>
            </div>

            <div className="button-container">
              <Link to="/login" className="btn-primary">
                Lembrei minha senha
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EsqueciSenha; 