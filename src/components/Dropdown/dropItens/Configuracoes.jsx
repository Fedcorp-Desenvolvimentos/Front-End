import React from 'react';
import '../../styles/Config.css';

const Config = () => {
  return (
    <div className="config-container">
      <main className="config-content">
        <div className="container">
          <h1>Configurações</h1>
          <div className="config-grid">
            {/* Configurações de Aparência */}
            <div className="config-card">
              <div className="config-header">
                <i className="bi bi-palette"></i>
                <h2>Aparência</h2>
              </div>
              <div className="config-body">
                <div className="config-item">
                  <label>Tema</label>
                  <select className="form-select">
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                    <option value="system">Sistema</option>
                  </select>
                </div>
                <div className="config-item">
                  <label>Fonte</label>
                  <select className="form-select">
                    <option value="default">Padrão</option>
                    <option value="large">Grande</option>
                    <option value="small">Pequena</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Configurações de Notificações */}
            <div className="config-card">
              <div className="config-header">
                <i className="bi bi-bell"></i>
                <h2>Notificações</h2>
              </div>
              <div className="config-body">
                <div className="config-item">
                  <label className="switch-label">
                    <span>Notificações por Email</span>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" />
                    </div>
                  </label>
                </div>
                <div className="config-item">
                  <label className="switch-label">
                    <span>Alertas do Sistema</span>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" checked />
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Configurações de Privacidade */}
            <div className="config-card">
              <div className="config-header">
                <i className="bi bi-shield-lock"></i>
                <h2>Privacidade</h2>
              </div>
              <div className="config-body">
                <div className="config-item">
                  <label className="switch-label">
                    <span>Histórico de Buscas</span>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" checked />
                    </div>
                  </label>
                </div>
                <div className="config-item">
                  <label className="switch-label">
                    <span>Compartilhar Dados</span>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" />
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Config; 