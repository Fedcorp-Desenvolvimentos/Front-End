import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/Cadastro.css';

function Cadastro() {
  const [usuarios, setUsuarios] = useState([]);
  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    email: '',
    nivelAcesso: '',
    senha: ''
  });
  const [erroCadastro, setErroCadastro] = useState('');

  useEffect(() => {
    // Exemplo de usuários mockados para visualização
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
        // Em caso de erro na API, utiliza mock
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
    <main className="cadastro-content">
      <h1 className="page-title">
        <i className="bi bi-person-plus-fill"></i> Cadastro de Usuários
      </h1>

      <div className="container">
        <div className="cadastro-grid">
          <section className="cadastro-card">
            <h2 className="section-title">
              <i className="bi bi-person-circle"></i> Novo Usuário
            </h2>

            <form className="cadastro-form" onSubmit={handleSubmit} style={{ gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="nome">Nome Completo</label>
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
                <label htmlFor="email">Email</label>
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
                <label htmlFor="nivelAcesso">Nível de Acesso</label>
                <select
                  id="nivelAcesso"
                  name="nivelAcesso"
                  value={novoUsuario.nivelAcesso}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione um nível</option>
                  <option value="admin">Administrador</option>
                  <option value="usuario">Usuário</option>
                </select>
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

              {erroCadastro && (
                <div className="mensagem-erro">
                  <i className="bi bi-exclamation-circle-fill"></i> {erroCadastro}
                </div>
              )}

              <button type="submit" className="btn-submit">Cadastrar</button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Cadastro;
