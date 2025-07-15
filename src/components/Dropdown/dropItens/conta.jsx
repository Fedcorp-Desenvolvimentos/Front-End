import React, { useState, useEffect } from 'react';
import '../../styles/conta.css';
import { Link } from 'react-router-dom';
import { UserService } from '../../../services/userService';

const ConfigConta = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [mostrarModalExclusao, setMostrarModalExclusao] = useState(false);
  const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [filtroBusca, setFiltroBusca] = useState('');

  const [nomeEditado, setNomeEditado] = useState('');
  const [emailEditado, setEmailEditado] = useState('');
  const [nivelAcessoEditado, setNivelAcessoEditado] = useState('');

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
    setMostrarModalExclusao(true);
  };

  const confirmarExclusao = () => {
    setUsuarios(usuarios.filter(u => u.id !== usuarioSelecionado.id));
    setMostrarModalExclusao(false);
    setMensagemSucesso(`Usuário ${usuarioSelecionado.nome_completo} excluído com sucesso!`);
    setTimeout(() => setMensagemSucesso(''), 4000);
  };

  const abrirModalEdicao = (usuario) => {
    setUsuarioSelecionado(usuario);
    setNomeEditado(usuario.nome_completo);
    setEmailEditado(usuario.email);
    setNivelAcessoEditado(usuario.nivel_acesso);
    setMostrarModalEdicao(true);
  };

  const confirmarEdicao = () => {
    const usuariosAtualizados = usuarios.map((u) =>
      u.id === usuarioSelecionado.id
        ? { ...u, nome_completo: nomeEditado, email: emailEditado, nivel_acesso: nivelAcessoEditado }
        : u
    );
    setUsuarios(usuariosAtualizados);
    setMostrarModalEdicao(false);
    setMensagemSucesso(`Usuário ${nomeEditado} atualizado com sucesso!`);
    setTimeout(() => setMensagemSucesso(''), 4000);
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const termo = filtroBusca.toLowerCase();
    return (
      usuario.nome_completo?.toLowerCase().includes(termo) ||
      usuario.email?.toLowerCase().includes(termo)
    );
  });

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
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail"
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
              />
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
                {usuariosFiltrados.map(usuario => (
                  <tr key={usuario.id}>
                    <td>{usuario.nome_completo}</td>
                    <td>{usuario.email}</td>
                    <td>
                      <span className="badge">
                        {usuario.nivel_acesso || 'Usuário'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn-icon"
                        onClick={() => abrirModalEdicao(usuario)}
                        title="Editar usuário"
                      >
                        <i className="bi bi-pencil-square text-primary"></i>
                      </button>
                      {usuario.id !== usuarios[0].id &&
                      <button
                        className="btn-icon"
                        onClick={() => abrirModalExclusao(usuario)}
                        title="Excluir usuário"
                      >
                        <i className="bi bi-trash text-danger"></i>
                      </button>
                      }
                   </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Exclusão */}
        {mostrarModalExclusao && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirmar Exclusão</h3>
              <p>
                Tem certeza que deseja excluir
                <strong>{usuarioSelecionado?.nome_completo}</strong>?
              </p>
              <div className="modal-actions">
                <button className="btn-primary" onClick={() => setMostrarModalExclusao(false)}>
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
                value={nomeEditado}
                onChange={(e) => setNomeEditado(e.target.value)}
              />
              <label>E-mail:</label>
              <input
                type="email"
                value={emailEditado}
                onChange={(e) => setEmailEditado(e.target.value)}
              />
              <label>Função:</label>
              <select
                value={nivelAcessoEditado}
                onChange={(e) => setNivelAcessoEditado(e.target.value)}
              >
                <option value="admin">Administrador</option>
                <option value="usuario">Usuário</option>
                <option value="comercial">Comercial</option>
              </select>

              <div className="modal-actions">
                <button className="btn-primary" onClick={() => setMostrarModalEdicao(false)}>
                  Cancelar
                </button>
                <button className="btn-primary" onClick={confirmarEdicao}>
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
