import React from "react";
import "../styles/Home.css";
import { useAuth } from "../../context/AuthContext";

const AdminHome = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const currentUserType = user?.nivel_acesso;

  if (loading) {
    return (
      <div className="home-container">
        <p>Carregando informações do usuário...</p>
      </div>
    );
  }

  if (!isAuthenticated || (currentUserType !== "admin" && currentUserType !== "master")) {
    return (
      <div className="home-container">
        <p>Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <main>
        <div className="jumbotron">
          <div className="container">
            <h1>Bem-vindos à Plataforma Bigcorp!</h1>

            <p>Centralize e importe dados com precisão para assegurar a qualidade das informações
              dos produtos com a Fedcorp.</p>

          </div>
        </div>

        <div className="container">
          <div className="cards-container">
            {/* Seguro de Vida */}
            <div className="card">
              <div className="card-body">
                <div className="feature-icon">
                  <i className="bi bi-shield-lock-fill"></i>
                </div>
                <h2>Seguro de Vida</h2>
                <p>
                  Importe os dados de apólices de seguros de vida e segurados vinculados.
                </p>
                <button className="btn-primary" onClick={() => alert("Importar Vida")}>
                  Importar
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="card">
              <div className="card-body">
                <div className="feature-icon">
                  <i className="bi bi-file-earmark-text-fill"></i>
                </div>
                <h2>Conteúdo</h2>
                <p>
                  Importe os dados referentes aos bens assegurados dentro de imóveis.
                </p>
                <button className="btn-primary" onClick={() => alert("Importar Conteúdo")}>
                  Importar
                </button>
              </div>
            </div>

            {/* Garantia Cota */}
            <div className="card">
              <div className="card-body">
                <div className="feature-icon">
                  <i className="bi bi-patch-check-fill"></i>
                </div>
                <h2>Garantia Cota</h2>
                <p>
                  Importe garantias financeiras com base em cotas de consórcio ou valores agregados.
                </p>
                <button className="btn-primary" onClick={() => alert("Importar Garantia Cota")}>
                  Importar
                </button>
              </div>
            </div>

            {/* Aluguel */}
            <div className="card">
              <div className="card-body">
                <div className="feature-icon">
                  <i className="bi bi-house-door-fill"></i>
                </div>
                <h2>Alug</h2>
                <p>
                  Importe informações relacionadas a seguros de locação e alug.
                </p>
                <button className="btn-primary" onClick={() => alert("Importar Aluguel")}>
                  Importar
                </button>
              </div>
            </div>

            {/* Vale Refeição */}
            <div className="card">
              <div className="card-body">
                <div className="feature-icon">
                  <i className="bi bi-credit-card-2-front-fill"></i>
                </div>
                <h2>Vale Refeição</h2>
                <p>
                  Importe as bases de dados de colaboradores para geração de benefícios VR/VA.
                </p>
                <button className="btn-primary" onClick={() => alert("Importar VR")}>
                  Importar
                </button>
              </div>
            </div>
            {/* Manual do usuário */}
            <div className="card">
              <div className="card-body">
                <div className="feature-icon">
                  <i className="bi bi-credit-card-2-front-fill"></i>
                </div>
                <h2>Manual da API</h2>
                <p>
                  Importe as bases de dados de colaboradores para geração de benefícios VR/VA.
                </p>
                <button className="btn-primary" onClick={() => alert("Importar VR")}>
                  Importar
                </button>
              </div>
            </div>
          </div>


        </div>
      </main>
    </div>
  );
};

export default AdminHome;
