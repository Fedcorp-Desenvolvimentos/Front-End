// src/pages/Login.js (ou onde quer que seu Login.js esteja)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importe useNavigate
import '../styles/Login.css';
import { useAuth } from '../../context/AuthContext'


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Mantemos o loading local para o formulário

    const { login } = useAuth(); // <--- OBTENHA A FUNÇÃO login DO SEU CONTEXTO
    const navigate = useNavigate(); // <--- INICIALIZE O HOOK useNavigate

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        // Não precisamos mais do 'payload', a função 'login' do contexto já espera as credenciais
        // const payload = { email, password };

        try {
            // Chame a função login do contexto, passando email e password
            const result = await login({ email, password }); // Use a função login do AuthContext

            if (result.success) {
                // Se o login for bem-sucedido, redireciona para a Home
                navigate('/Home'); // <--- Use navigate para redirecionar
            } else {
                // Se o login falhar (resultado.success é false), exibe o erro
                setError(result.error || 'Falha no login. Verifique suas credenciais.');
            }
        } catch (err) {
            // Este catch deve ser mais genérico, pois a função `login` do contexto
            // já está lidando com a maioria dos erros da API internamente.
            // Aqui, podemos pegar erros inesperados que escaparam do contexto.
            setError('Ocorreu um erro inesperado durante o login.');
            console.error('Erro de login no componente:', err);
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

                            <div className="inputGroup">
                                <label htmlFor="senha">Senha:</label>
                                <input
                                    type="password"
                                    id="senha"
                                    placeholder="Digite sua senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="loginButton" disabled={loading}>
                                {loading ? 'Entrando...' : 'Entrar'}
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