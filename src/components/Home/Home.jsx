import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";
import { useAuth } from "../../context/AuthContext";

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
            <p>
              Encontre dados para auxiliar em diversas ocasiões, oferecendo as
              melhores soluções.
            </p>
          </div>
        </div>

        <div className="container">
          <div className="cards-container">
            {/* Moderador vê somente a parte da Administradora */}
            {currentUserType === "moderador" && (
              <div className="card">
                <div className="card-body">
                  <div className="feature-icon">
                    <i className="bi bi-credit-card-2-front-fill"></i>
                  </div>
                  <h2>Administradora</h2>
                  <p>
                    Acesse o painel da administradora para acompanhar e importar informações administrativas.
                  </p>
                  <Link to="/home-adm" className="btn-primary">Acessar</Link>
                </div>
              </div>
            )}

            {/* Pessoa Física */}
            {["admin", "usuario", "comercial"].includes(currentUserType) && (
              <div className="card">
                <div className="card-body">
                  <div className="feature-icon">
                    <i className="bi bi-person-fill"></i>
                  </div>
                  <h2>Dados Pessoais</h2>
                  <p>
                    Informações sobre pessoas registradas, incluindo CPF, nome, filiação e data de nascimento.
                  </p>
                  <Link to="/consulta-pf" className="btn-primary">Pesquisar</Link>
                </div>
              </div>
            )}

            {/* CNPJ */}
            {["admin", "usuario", "comercial"].includes(currentUserType) && (
              <div className="card">
                <div className="card-body">
                  <div className="feature-icon">
                    <i className="bi bi-building-fill"></i>
                  </div>
                  <h2>Dados Empresariais</h2>
                  <p>
                    Informações sobre empresas registradas, como razão social, CNPJ, e situação cadastral.
                  </p>
                  <Link to="/consulta-cnpj" className="btn-primary">Pesquisar</Link>
                </div>
              </div>
            )}

            {/* Endereço */}
            {["admin", "usuario", "comercial"].includes(currentUserType) && (
              <div className="card">
                <div className="card-body">
                  <div className="feature-icon">
                    <i className="bi bi-geo-alt-fill"></i>
                  </div>
                  <h2>Endereços</h2>
                  <p>
                    Informações detalhadas sobre logradouros, CEPs, cidades e estados.
                  </p>
                  <Link to="/consulta-end" className="btn-primary">Pesquisar</Link>
                </div>
              </div>
            )}

            {/* Segurados */}
            {["admin", "usuario", "comercial"].includes(currentUserType) && (
              <div className="card">
                <div className="card-body">
                  <div className="feature-icon">
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <h2>Consulta Segurados</h2>
                  <p>
                    Localize informações sobre segurados com base nos registros disponíveis.
                  </p>
                  <Link to="/consulta-segurados" className="btn-primary">Pesquisar</Link>
                </div>
              </div>
            )}

            {/* Comercial */}
            {["admin", "comercial"].includes(currentUserType) && (
              <div className="card">
                <div className="card-body">
                  <div className="feature-icon">
                    <i className="bi bi-briefcase-fill"></i>
                  </div>
                  <h2>Comercial</h2>
                  <p>
                    Acesso a informações de leads e potenciais clientes para suporte ao time comercial.
                  </p>
                  <Link to="/consulta-comercial" className="btn-primary">Pesquisar</Link>
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
