import React, { useState, useEffect } from 'react';
import '../../styles/conta.css';
import { Link } from 'react-router-dom';
import { UserService } from '../../../services/userService';

const ConfigConta = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState({
    id: null,
    nome_completo: '',
    email: '',
    nivel_acesso: 'usuario',
  });

  useEffect(() => {
    UserService.getAllUsers()
      .then((response) => {
        console.log("Resposta da API /users:", response);
        setUsuarios(response.results);
      })
      .catch((error) => {
        console.error("Erro ao buscar usuários:", error);
      });
  }, []);

  const abrirModalExclusao = (usuario) => {
    setUsuarioSelecionado(usuario);
    setMostrarModal(true);
  };

  const confirmarExclusao = () => {
    setUsuarios(usuarios.filter(u => u.id !== usuarioSelecionado.id));
    setMostrarModal(false);
    setMensagemSucesso(`Usuário ${usuarioSelecionado.nome_completo} excluído com sucesso!`);
    setTimeout(() => setMensagemSucesso(''), 4000);
  };

  const abrirModalEdicao = (usuario) => {
    setUsuarioEditando({
      id: usuario.id,
      nome_completo: usuario.nome_completo,
      email: usuario.email,
      nivel_acesso: usuario.nivel_acesso,
    });
    setMostrarModalEdicao(true);
  };

  const salvarEdicaoUsuario = () => {
    const atualizados = usuarios.map((u) =>
      u.id === usuarioEditando.id ? usuarioEditando : u
    );
    setUsuarios(atualizados);
    setMostrarModalEdicao(false);
    setMensagemSucesso(`Usuário ${usuarioEditando.nome_completo} atualizado com sucesso!`);
    setTimeout(() => setMensagemSucesso(''), 4000);
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
                    <td>{usuario.nome_completo}</td>
                    <td>{usuario.email}</td>
                    <td><span className="badge">{usuario.nivel_acesso || 'Usuário'}</span></td>
                    <td>
                      <button
                        className="btn-icon"
                        onClick={() => abrirModalEdicao(usuario)}
                        title="Editar usuário"
                      >
                        <i className="bi bi-pencil-square text-primary"></i>
                      </button>
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

        {/* Modal de Exclusão */}
        {mostrarModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirmar Exclusão</h3>
              <p>
                Tem certeza que deseja excluir{' '}
                <strong>{usuarioSelecionado?.nome_completo}</strong>?
              </p>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setMostrarModal(false)}>
                  Cancelar
                </button>
                <button className="btn-primary" onClick={confirmarExclusao}>
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição */}
        {mostrarModalEdicao && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Editar Usuário</h3>

              <label>Nome completo:</label>
              <input
                type="text"
                value={usuarioEditando.nome_completo}
                onChange={(e) =>
                  setUsuarioEditando({ ...usuarioEditando, nome_completo: e.target.value })
                }
              />

              <label>E-mail:</label>
              <input
                type="email"
                value={usuarioEditando.email}
                onChange={(e) =>
                  setUsuarioEditando({ ...usuarioEditando, email: e.target.value })
                }
              />

              <label>Função:</label>
              <select
                value={usuarioEditando.nivel_acesso}
                onChange={(e) =>
                  setUsuarioEditando({ ...usuarioEditando, nivel_acesso: e.target.value })
                }
              >
                <option value="usuario">Usuário</option>
                <option value="admin">Administrador</option>
                <option value="comercial">Comercial</option>
              </select>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setMostrarModalEdicao(false)}>
                  Cancelar
                </button>
                <button className="btn-primary" onClick={salvarEdicaoUsuario}>
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ConfigConta;
