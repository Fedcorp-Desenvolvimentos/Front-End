import React, { useState } from 'react';
// Importe a instância do api do seu serviço, se ela for diferente do axios global
// import api from '../services/api'; // Se o seu 'api' estiver em services/api.js
import { UserService } from '../../../services/userService'; // Importe o UserService
import '../../styles/Cadastro.css';
import { Link } from 'react-router-dom';

function Cadastro() {
  const [activeTab, setActiveTab] = useState('cadastro'); // Mantido, mas só uma aba
  const [novoUsuario, setNovoUsuario] = useState({
    nome_completo: '', // Alterado de 'nome' para 'nome_completo'
    email: '',
    nivelAcesso: '',
    senha: '',
    empresa: 'Fedcorp' // Novo campo 'empresa' com valor inicial 'Fedcorp'
  });
  const [erroCadastro, setErroCadastro] = useState('');
  const [sucessoCadastro, setSucessoCadastro] = useState(''); // Novo estado para mensagem de sucesso

  // O useEffect original que carregava mocks e fazia um GET inicial foi removido
  // porque não é relevante para a funcionalidade de cadastro.

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNovoUsuario(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => { // Tornada assíncrona
    e.preventDefault();
    setErroCadastro('');
    setSucessoCadastro(''); // Limpa mensagens anteriores

    try {
      // Mapeia o nome do campo para o que o backend espera (nome_completo)
      const payload = {
        nome_completo: novoUsuario.nome_completo,
        email: novoUsuario.email,
        nivel_acesso: novoUsuario.nivelAcesso, // Backend espera 'nivel_acesso'
        password: novoUsuario.senha, // Backend espera 'password'
        empresa: novoUsuario.empresa, // Inclui o campo empresa
        is_fed: true // Assumindo que todos os usuários cadastrados aqui são is_fed
      };

      const response = await UserService.registerUser(payload);
      console.log('Usuário cadastrado com sucesso:', response);
      setSucessoCadastro(`Usuário "${response.nome_completo || response.email}" cadastrado com sucesso!`);
      
      // Limpa o formulário após o sucesso
      setNovoUsuario({
        nome_completo: '',
        email: '',
        nivelAcesso: '',
        senha: '',
        empresa: 'Fedcorp' // Mantém o valor padrão ou você pode resetar para ''
      });

      // Limpa a mensagem de sucesso após alguns segundos
      setTimeout(() => setSucessoCadastro(''), 5000);

    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      // Pega a mensagem de erro da resposta do backend, se disponível
      const errorData = error.response?.data;
      let mensagem = 'Erro ao cadastrar usuário. Verifique os dados e tente novamente.';

      if (errorData) {
        if (errorData.email) {
          mensagem = `Erro no E-mail: ${Array.isArray(errorData.email) ? errorData.email.join(', ') : errorData.email}`;
        } else if (errorData.password) {
          mensagem = `Erro na Senha: ${Array.isArray(errorData.password) ? errorData.password.join(', ') : errorData.password}`;
        } else if (errorData.detail) { // Erros de permissão, por exemplo
          mensagem = `Erro: ${errorData.detail}`;
        } else {
          mensagem = JSON.stringify(errorData); // Para erros genéricos
        }
      }
      setErroCadastro(mensagem);
      // Limpa a mensagem de erro após alguns segundos
      setTimeout(() => setErroCadastro(''), 7000);
    }
  };

  return (
    <main className="cadastro-container">
      <h1 className="config-title">Configurações da Plataforma</h1>

      <div className="cadastro-layout">
        <aside className="sidebar">
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
              <label htmlFor="nome_completo">Nome Completo</label> {/* Alterado id e name */}
              <input
                type="text"
                id="nome_completo"
                name="nome_completo" // Alterado id e name
                value={novoUsuario.nome_completo}
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
                <option value="comercial">Comercial</option>
                <option value="moderador">Moderador</option> {/* Adicionei 'moderador' conforme suas models */}
              </select>
            </div>

            <div className="form-group"> {/* Novo campo para Empresa */}
              <label htmlFor="empresa">Empresa</label>
              <select
                id="empresa"
                name="empresa"
                value={novoUsuario.empresa}
                onChange={handleChange}
                required
              >
                {/* Por enquanto, apenas uma opção fixa. Se tiver mais, adicione aqui. */}
                <option value="Fedcorp">Fedcorp</option>
              </select>
            </div>

            {erroCadastro && (
              <div className="mensagem-erro">
                <i className="bi bi-exclamation-circle-fill"></i> {erroCadastro}
              </div>
            )}
            {sucessoCadastro && (
              <div className="mensagem-sucesso">
                <i className="bi bi-check-circle-fill"></i> {sucessoCadastro}
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