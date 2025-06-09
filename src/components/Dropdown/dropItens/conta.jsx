import React from 'react';

import '../../styles/conta.css';

const Conta = () => {
  return (
    <div className="conta-container">
  
      <main className="conta-content">
        <div className="container">
          <h1>Minha Conta</h1>
          <div className="conta-card">
            <div className="conta-header">
              <div className="avatar">
                <i className="bi bi-person-circle"></i>
              </div>
              <h2>Informações do Usuário</h2>
            </div>
            <div className="conta-info">
              <div className="info-group">
                <label>Nome:</label>
                <p>Usuário Exemplo</p>
              </div>
              <div className="info-group">
                <label>Email:</label>
                <p>usuario@exemplo.com</p>
              </div>
              <div className="info-group">
                <label>Nível de Acesso:</label>
                <p>Administrador</p>
              </div>
              <div className="info-group">
                <label>Último Acesso:</label>
                <p>01/03/2024 15:30</p>
              </div>
            </div>
            <div className="conta-actions">
              <button className="btn-primary">
                <i className="bi bi-pencil-square"></i>
                Editar Perfil
              </button>
              <button className="btn-secondary">
                <i className="bi bi-key"></i>
                Alterar Senha
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Conta; 