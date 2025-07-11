import React, { useState } from 'react';
import '../styles/Login.css';
import { UserService } from '../../services/userService';
import { FaEye, FaEyeSlash} from 'react-icons/fa'

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

 const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = { email, password };

    try {
      const response = await UserService.login(payload);
      localStorage.setItem('accessToken', response.access);
      setUserData(response); 
      window.location.href = "/Home";
    } catch (err) {
      setError(err.response?.data?.message || 'Falha no login. Verifique suas credenciais.');
      console.error('Erro de login:', err);
    } finally {
      setLoading(false);
    }
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

              <div className="inputGroup senhaGroup">
                <label htmlFor="senha">Senha:</label>
                <div className="senhaWrapper">
                  <input type={showPassword ? "text" : "password"}
                  id='senha'
                  placeholder='Digite sua senha'
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  />

                  <button
                  type='button'
                  className='togglePassword'
                  onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                
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
