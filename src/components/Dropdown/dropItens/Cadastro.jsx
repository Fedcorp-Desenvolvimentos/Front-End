import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/Cadastro.css';
import { Link } from 'react-router-dom';

function Cadastro() {
  const [activeTab, setActiveTab] = useState('cadastro');
  const [usuarios, setUsuarios] = useState([]);
  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    email: '',
    nivelAcesso: '',
    senha: ''
  });
  const [erroCadastro, setErroCadastro] = useState('');

  useEffect(() => {
    const usuariosMock = [
      { nome: 'João da Silva', email: 'joao@email.com', nivelAcesso: 'admin' },
      { nome: 'Maria Oliveira', email: 'maria@email.com', nivelAcesso: 'usuario' }
    ];

    axios.get('/api/usuarios')
      .then(response => {
        const data = Array.isArray(response.data) ? response.data : [];
        setUsuarios(data.length > 0 ? data : usuariosMock);
      })
      .catch(() => {
        setUsuarios(usuariosMock);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNovoUsuario(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErroCadastro('');

    axios.post('/api/usuarios', novoUsuario)
      .then(response => {
        setUsuarios(prev => [...prev, response.data]);
        setNovoUsuario({ nome: '', email: '', nivelAcesso: '', senha: '' });
      })
      .catch(() => {
        setErroCadastro('Erro ao cadastrar usuário. Verifique os dados e tente novamente.');
      });
  };

  return (
    <main className="cadastro-container">
      <h1 className="config-title">Configurações da Plataforma</h1>

      <div className="cadastro-layout">
      <aside className="config-sidebar">
      <button className={`tab-button ${activeTab === 'cadastro' ? 'active' : ''}`} onClick={() => setActiveTab('cadastro')}>
          <i className="bi bi-person-plus-fill"></i> Cadastro de Usuário
          </button>
          <Link to="/Home" className="tab-button voltar">
            <i className="bi bi-arrow-left-circle"></i> Voltar
          </Link>
        </aside>

        <section className="cadastro-card">
          <h2 className="section-title">
            <i className="bi bi-person-circle"></i> Cadastrar Usuário
          </h2>

          <form className="cadastro-form" onSubmit={handleSubmit} style={{ gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={novoUsuario.nome}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                value={novoUsuario.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="senha">Senha</label>
              <input
                type="password"
                id="senha"
                name="senha"
                value={novoUsuario.senha}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="nivelAcesso">Tipo de usuário</label>
              <select
                id="nivelAcesso"
                name="nivelAcesso"
                value={novoUsuario.nivelAcesso}
                onChange={handleChange}
                required
              >
                <option value="">Selecione o tipo de usuário</option>
                <option value="admin">Administrador</option>
                <option value="usuario">Usuário</option>
              </select>
            </div>

            {erroCadastro && (
              <div className="mensagem-erro">
                <i className="bi bi-exclamation-circle-fill"></i> {erroCadastro}
              </div>
            )}

            <button type="submit" className="btn-submit">
              <i className="bi bi-save-fill"></i> Salvar
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default Cadastro;
