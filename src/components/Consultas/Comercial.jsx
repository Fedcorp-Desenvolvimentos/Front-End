import React, { useState } from "react";
import "../styles/Comercial.css";

const ConsultaComercial = () => {
  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    email: "",
    telefone: ""
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    // Simulação de resultado de busca
    setResult({
      nome: form.nome || "Cliente Potencial S/A",
      cnpj: form.cnpj || "12.345.678/0001-99",
      email: form.email || "comercial@cliente.com.br",
      telefone: form.telefone || "(11) 99999-0000",
    });
  };

  return (
    <div className="comercial-page d-flex flex-column align-items-center justify-content-center">
      <h2 className="text-center mb-4 titulo-principal">Consulta Comercial</h2>

      <div className="card form-card">
        <div className="card-body">
          <h4 className="card-title text-center mb-3">Buscar Cliente Potencial</h4>

          <div className="mb-3">
            <label htmlFor="nome" className="form-label">Nome: </label>
            <input
              type="text"
              className="form-control"
              id="nome"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Digite o nome"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="cnpj" className="form-label">CNPJ: </label>
            <input
              type="text"
              className="form-control"
              id="cnpj"
              name="cnpj"
              value={form.cnpj}
              onChange={handleChange}
              placeholder="Digite o CNPJ"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">E-mail: </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Digite o e-mail"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="telefone" className="form-label">Telefone: </label>
            <input
              type="tel"
              className="form-control"
              id="telefone"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              placeholder="Digite o telefone"
            />
          </div>

          <button className="btn btn-primary w-100" onClick={handleSearch}>
            Pesquisar
          </button>
        </div>
      </div>

      {result && (
        <div className="card form-card mt-4">
          <div className="card-body">
            <h5 className="card-title text-center mb-3">Resultado da Consulta</h5>
            <p><strong>Nome: </strong> {result.nome}</p>
            <p><strong>CNPJ: </strong> {result.cnpj}</p>
            <p><strong>Email: </strong> {result.email}</p>
            <p><strong>Telefone: </strong> {result.telefone}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultaComercial;
