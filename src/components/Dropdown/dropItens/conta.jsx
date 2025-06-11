import React, { useState } from 'react';
import '../../styles/conta.css';
import { Link } from 'react-router-dom';

const ConfigConta = () => {
  const [usuarios, setUsuarios] = useState([
    { id: 1, nome: 'Ingryd Aylana', email: 'ingryd.fatura@gmail.com', funcao: 'Administrador' },
    { id: 2, nome: 'Michel Policeno', email: 'michel@gmail.com', funcao: 'Administrador' }
  ]);

  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  const abrirModalExclusao = (usuario) => {
    setUsuarioSelecionado(usuario);
    setMostrarModal(true);
  };

  const confirmarExclusao = () => {
    setUsuarios(usuarios.filter(u => u.id !== usuarioSelecionado.id));
    setMostrarModal(false);
    setMensagemSucesso(`Usuário ${usuarioSelecionado.nome} excluído com sucesso!`);
    setTimeout(() => setMensagemSucesso(''), 4000); // limpa após 4s
  };

  return (
    <div className="conta-container">
      <main className="conta-content">
        <div className="config-usuarios-wrapper">
        <aside className="config-sidebar">
          <Link to="/cadastro" className="tab-button">
            <i className="bi bi-person-plus-fill"></i> Cadastrar Usuário
          </Link>
          <Link to="/Home" className="tab-button voltar">
            <i className="bi bi-arrow-left-circle"></i> Voltar
          </Link>
        </aside>

          <div className="config-card">
            <h2 className="card-title">
              <i className="bi bi-people"></i> Gerenciar Usuários
            </h2>

            {mensagemSucesso && (
              <div className="alert-sucesso">{mensagemSucesso}</div>
            )}

            <div className="search-bar">
              <i className="bi bi-search"></i>
              <input type="text" placeholder="Buscar por nome ou e-mail" />
              <button className="btn-search">Pesquisar</button>
            </div>

            <table className="user-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Função</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(usuario => (
                  <tr key={usuario.id}>
                    <td>{usuario.nome}</td>
                    <td>{usuario.email}</td>
                    <td><span className="badge">{usuario.funcao}</span></td>
                    <td>
                      <button
                        className="btn-icon"
                        onClick={() => abrirModalExclusao(usuario)}
                        title="Excluir usuário"
                      >
                        <i className="bi bi-trash text-danger"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Confirmação */}
        {mostrarModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirmar Exclusão</h3>
              <p>Tem certeza que deseja excluir <strong>{usuarioSelecionado.nome}</strong>?</p>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setMostrarModal(false)}>Cancelar</button>
                <button className="btn-primary" onClick={confirmarExclusao}>Confirmar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ConfigConta;
