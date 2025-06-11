import React, { useState } from 'react';
import '../../styles/Config.css';
import { Link } from 'react-router-dom';

const Config = () => {
  const [activeTab, setActiveTab] = useState('perfil');
  const [successMessage, setSuccessMessage] = useState('');
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [editandoSenha, setEditandoSenha] = useState(false);

  // Mock como placeholders
  const placeholderNome = 'Nome do Usuário';
  const placeholderCpf = 'Número do CPF';
  const placeholderEmail = 'E-mail do Usuário';

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmaSenha, setShowConfirmaSenha] = useState(false);

  const handleSalvarPerfil = (e) => {
    e.preventDefault();
    setSuccessMessage('Dados da conta atualizados com sucesso!');
    setEditandoPerfil(false);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSalvarSenha = (e) => {
    e.preventDefault();
    setSuccessMessage('Senha alterada com sucesso!');
    setEditandoSenha(false);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="config-container">
      <h2 className="config-title">Configurações da Conta</h2>
      <div className="config-wrapper">
        <aside className="config-sidebar">
          <button className={`tab-button ${activeTab === 'perfil' ? 'active' : ''}`} onClick={() => setActiveTab('perfil')}>
            <i className="bi bi-person-circle"></i> Perfil
          </button>
          <button className={`tab-button ${activeTab === 'senha' ? 'active' : ''}`} onClick={() => setActiveTab('senha')}>
            <i className="bi bi-lock"></i> Alterar Senha
          </button>
          <Link to="/Home" className="tab-button voltar">
            <i className="bi bi-arrow-left-circle"></i> Voltar
          </Link>
        </aside>

        <section className="config-form">
          {successMessage && (
            <div className="success-message">
              <i className="bi bi-check-circle-fill"></i> {successMessage}
            </div>
          )}

          {activeTab === 'perfil' ? (
            <>
              <h3><i className="bi bi-gear"></i> Editar Conta</h3>
              <form onSubmit={handleSalvarPerfil}>
                <label>Nome:</label>
                <input
                  type="text"
                  placeholder={placeholderNome}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  disabled={!editandoPerfil}
                  className={editandoPerfil ? 'editando' : ''}
                />

                <label>CPF:</label>
                <input
                  type="text"
                  placeholder={placeholderCpf}
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  disabled={!editandoPerfil}
                  className={editandoPerfil ? 'editando' : ''}
                />

                <label>E-mail:</label>
                <input
                  type="email"
                  placeholder={placeholderEmail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!editandoPerfil}
                  className={editandoPerfil ? 'editando' : ''}
                />

                <div className="button-group">
                  <button
                    type="button"
                    className="btn danger"
                    onClick={() => setEditandoPerfil(true)}
                  >
                    <i className="bi bi-pencil"></i> Editar
                  </button>

                  {editandoPerfil && (
                    <button type="submit" className="btn primary">
                      <i className="bi bi-save"></i> Salvar
                    </button>
                  )}
                </div>
              </form>
            </>
          ) : (
            <>
              <h3><i className="bi bi-key"></i> Alterar Senha</h3>
              <form onSubmit={handleSalvarSenha}>
                <label>Senha Atual:</label>
                <div className="input-with-icon">
                  <input
                    type={showSenhaAtual ? 'text' : 'password'}
                    placeholder="Senha Atual"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    disabled={!editandoSenha}
                    className={editandoSenha ? 'editando' : ''}
                  />
                  <i className={`bi ${showSenhaAtual ? 'bi-eye-slash' : 'bi-eye'}`} onClick={() => setShowSenhaAtual(!showSenhaAtual)} />
                </div>

                <label>Nova Senha:</label>
                <div className="input-with-icon">
                  <input
                    type={showNovaSenha ? 'text' : 'password'}
                    placeholder="Nova Senha"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    disabled={!editandoSenha}
                    className={editandoSenha ? 'editando' : ''}
                  />
                  <i className={`bi ${showNovaSenha ? 'bi-eye-slash' : 'bi-eye'}`} onClick={() => setShowNovaSenha(!showNovaSenha)} />
                </div>

                <label>Confirmar Senha:</label>
                <div className="input-with-icon">
                  <input
                    type={showConfirmaSenha ? 'text' : 'password'}
                    placeholder="Confirmar Nova Senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    disabled={!editandoSenha}
                    className={editandoSenha ? 'editando' : ''}
                  />
                  <i className={`bi ${showConfirmaSenha ? 'bi-eye-slash' : 'bi-eye'}`} onClick={() => setShowConfirmaSenha(!showConfirmaSenha)} />
                </div>

                <div className="button-group">
                  <button
                    type="button"
                    className="btn danger"
                    onClick={() => setEditandoSenha(true)}
                  >
                    <i className="bi bi-pencil"></i> Editar
                  </button>

                  {editandoSenha && (
                    <button type="submit" className="btn primary">
                      <i className="bi bi-save"></i> Salvar
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Config;
