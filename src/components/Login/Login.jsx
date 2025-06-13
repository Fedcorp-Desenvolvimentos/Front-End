import React, { useState } from 'react';
import '../styles/Login.css'; // caminho para CSS global

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, senha });
  };

  return (
    <>
      <div className="gradient-bg"></div>

      <div className="login-wrapper">
        <div className="loginContainer">
          <div className="loginBox">
            <img
              src="../public/imagens/logo.png"
              alt="Fedcorp Logo"
              className="logoImg"
            />

            <h2 className="titlePortal">BigCorp</h2>
            <p className="pPortal">Insira seus dados para acessar a plataforma</p>

            {error && <p className="error">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className="inputGroup">
                <label htmlFor="email">E-mail:</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="inputGroup">
                <label htmlFor="senha">Senha:</label>
                <input
                  type="password"
                  id="senha"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="loginButton">
                Entrar
              </button>

              <a href="/esqueci-senha" className="forgot-password">
                Esqueceu sua senha?
              </a>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
