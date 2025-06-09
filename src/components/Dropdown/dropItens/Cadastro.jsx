import React from 'react';
import '../../styles/Cadastro.css';

const Cadastro = () => {
  return (
    <div className="cadastro-container">
      <main className="cadastro-content">
        <div className="container">
          <h1>Cadastro de Usuários</h1>
          
          {/* Formulário de Cadastro */}
          <div className="cadastro-card">
            <form className="cadastro-form">
              <div className="form-group">
                <label htmlFor="nome">Nome Completo</label>
                <input type="text" id="nome" className="form-control" required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" className="form-control" required />
              </div>

              <div className="form-group">
                <label htmlFor="nivel">Nível de Acesso</label>
                <select id="nivel" className="form-control" required>
                  <option value="">Selecione um nível</option>
                  <option value="admin">Administrador</option>
                  <option value="user">Usuário</option>
                  <option value="viewer">Visualizador</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="senha">Senha</label>
                <input type="password" id="senha" className="form-control" required />
              </div>

              <div className="form-group">
                <label htmlFor="confirmarSenha">Confirmar Senha</label>
                <input type="password" id="confirmarSenha" className="form-control" required />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  <i className="bi bi-person-plus"></i>
                  Cadastrar Usuário
                </button>
                <button type="reset" className="btn-secondary">
                  <i className="bi bi-x-circle"></i>
                  Limpar
                </button>
              </div>
            </form>
          </div>

          {/* Lista de Usuários */}
          <div className="usuarios-list">
            <h2>Usuários Cadastrados</h2>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Nível</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>João Silva</td>
                    <td>joao@exemplo.com</td>
                    <td>Administrador</td>
                    <td><span className="status-badge active">Ativo</span></td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" title="Editar">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn-icon" title="Excluir">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Maria Santos</td>
                    <td>maria@exemplo.com</td>
                    <td>Usuário</td>
                    <td><span className="status-badge active">Ativo</span></td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" title="Editar">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn-icon" title="Excluir">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cadastro; 