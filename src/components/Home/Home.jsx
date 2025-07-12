// src/pages/Home.js
import React from "react"; // 'useEffect' e 'useState' não são mais necessários aqui para o userType
import { Link } from "react-router-dom";
import "../styles/Home.css";
import { useAuth } from "../../context/AuthContext"; // Importe o hook useAuth

const Home = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const currentUserType = user?.nivel_acesso;
  if (loading) {
    return (
      <div className="home-container">
        <p>Carregando informações do usuário...</p>
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <div className="home-container">
        <p>Você precisa estar logado para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <main>
        <div className="jumbotron">
          <div className="container">
            <h1>Bem-vindos à Plataforma Bigcorp!</h1>
            {/* Exemplo de exibição do nome do usuário logado */}
            <p>
              Encontre dados para auxiliar em diversas ocasiões, oferecendo as
              melhores soluções.
            </p>
          </div>
        </div>

        <div className="container">
          <div className="cards-container">
            {/* Card 1 - Pessoa Física */}
            <div className="card">
              <div className="card-body">
                <div className="feature-icon">
                  <i className="bi bi-person-fill"></i>
                </div>
                <h2>Dados Pessoais</h2>
                <p>
                  A pesquisa por dados pessoais fornece informações sobre
                  pessoas registradas, incluindo CPF, nome, filiação e data de
                  nascimento.
                </p>
                <Link to="/consulta-pf" className="btn-primary">
                  Pesquisar
                </Link>
              </div>
            </div>

            {/* Card 2 - Empresa */}
            <div className="card">
              <div className="card-body">
                <div className="feature-icon">
                  <i className="bi bi-building-fill"></i>
                </div>
                <h2>Dados Empresariais</h2>
                <p>
                  A busca por dados empresariais fornece informações sobre
                  empresas registradas, incluindo CNPJ, razão social, quadro
                  societário e situação cadastral.
                </p>
                <Link to="/consulta-cnpj" className="btn-primary">
                  Pesquisar
                </Link>
              </div>
            </div>

            {/* Card 3 - Endereços */}
            <div className="card">
              <div className="card-body">
                <div className="feature-icon">
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <h2>Endereços</h2>
                <p>
                  A consulta de endereços permite localizar informações
                  detalhadas sobre logradouros, incluindo CEP, bairro, cidade e
                  estado.
                </p>
                <Link to="/consulta-end" className="btn-primary">
                  Pesquisar
                </Link>
              </div>
            </div>

            {/* Card 4 - Consulta Segurados */}
            <div className="card">
              <div className="card-body">
                <div className="feature-icon">
                  <i className="bi bi-shield-check"></i>
                </div>
                <h2>Consulta Segurados</h2>
                <p>
                  A consulta de segurado permite localizar informações
                  detalhadas em nossa base.
                </p>
                <Link to="/consulta-segurados" className="btn-primary">
                  Pesquisar
                </Link>
              </div>
            </div>

            {/* Card 5 - Comercial (exibido para 'comercial' OU 'admin'/'master') */}
            {/* ATENÇÃO: Verifique o nome exato do tipo de usuário 'admin' ou 'master' que vem do seu backend */}
            {(currentUserType === "comercial" ||
              currentUserType === "admin" ||
              currentUserType === "master") && (
              <div className="card">
                <div className="card-body">
                  <div className="feature-icon">
                    <i className="bi bi-briefcase-fill"></i>
                  </div>
                  <h2>Comercial</h2>
                  <p>
                    Busque dados de clientes em potencial tendo informações
                    detalhadas para auxiliar em vendas.
                  </p>
                  <Link to="/consulta-comercial" className="btn-primary">
                    Pesquisar
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
