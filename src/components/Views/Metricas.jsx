import React from "react";
import "../styles/Ferramentas.css";

const ferramentas = [
  {
    nome: "Dashboard Peaga",
    url: "https://app.powerbi.com/view?r=eyJrIjoiNzQ2NzYxNDktNDQ5My00MWNiLWE0ZDUtOWQxMzMwMzkzNDUxIiwidCI6IjVhMjY0OWI1LTAzODMtNDA4Ni04MzYwLTJlNGI2YmZmMGEzZSJ9",
    descricao: "Acompanhe as métricas da organização de forma única.",
    logo: "/imagens/Logo-Peaga.jpg",
  },
  {
    nome: "Dashboard FedCorp Adm",
    url: "https://app.powerbi.com/view?r=eyJrIjoiYTc1ZGU2MjItNjNiNS00MTQ5LTk2YjgtYWQzOGYxM2QyYjAwIiwidCI6IjVhMjY0OWI1LTAzODMtNDA4Ni04MzYwLTJlNGI2YmZmMGEzZSJ9",
    descricao: "Acompanhe as métricas da organização de forma única.",
    logo: "/imagens/LOGO.png",
  },
  {
    nome: "Dashboard Condomed",
    url: "https://app.powerbi.com/view?r=eyJrIjoiZjE5ODFiZDUtM2U2NS00NzI1LTkzZTktNmE4ZTgxOTAwZjI0IiwidCI6IjVhMjY0OWI1LTAzODMtNDA4Ni04MzYwLTJlNGI2YmZmMGEzZSJ9",
    descricao: "Acompanhe as métricas da organização de forma única.",
    logo: "/imagens/logo-Condomed.png",
  },
  {
    nome: "Acompanhamento Comercial",
    url: "/acompanhamento",
    descricao: "Acompanhe as métricas do comercial de forma única.",
    logo: "/imagens/LOGO.png",
  },
];

const Metricas = () => (
  <div className="ferramentas-container">
    <h1 className="ferramentas-title">
      <i className="bi bi-bar-chart-fill"></i>
      Métricas da FedCorp
    </h1>
    <p className="ferramentas-desc">
      Acesse rapidamente as principais métricas e resultados do Grupo FedCorp. Escolha uma opção abaixo:
    </p>
    <div className="ferramentas-grid">
      {ferramentas.map((ferramenta, idx) => (
        <div className="ferramenta-card" key={idx}>
          {ferramenta.logo && (
            <img
              src={ferramenta.logo}
              alt={ferramenta.nome}
              className="ferramenta-logo"
              style={{
                width: 56,
                height: 56,
                objectFit: "contain",
                marginBottom: 12,
                borderRadius: "1.1rem",
                display: "block",
                background: "#f8fafc",
                marginLeft: "auto",
                marginRight: "auto",
                boxShadow: "0 1px 8px rgba(24,88,214,0.09)"
              }}
            />
          )}
          <div className="ferramenta-nome">
            <i className="bi bi-link-45deg"></i> {ferramenta.nome}
          </div>
          <div className="ferramenta-desc">{ferramenta.descricao}</div>
          {ferramenta.url ? (
            <a
              href={ferramenta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ferramenta-btn"
            >
              Acessar
            </a>
          ) : (
            <span className="ferramenta-em-breve">Em Produção</span>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default Metricas;
