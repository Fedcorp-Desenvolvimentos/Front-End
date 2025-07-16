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
    setResult({
      nome: form.nome || "Cliente Potencial S/A",
      cnpj: form.cnpj || "12.345.678/0001-99",
      email: form.email || "comercial@cliente.com.br",
      telefone: form.telefone || "(11) 99999-0000",
    });
  };

  return (
    <div className="comercial-page">

      <div className="card-opcoes">
        <div className="icon-container">
          <i className="bi bi-building icon-opcao"></i>
        </div>
        <h2 className="titulo-principal text-center">
        Consulta Comercial
      </h2>
        <p className="opcao-texto">Preencha os dados da empresa abaixo para consultar</p>
      </div>

      <div className="form-card">
        <div className="card-body">
        <label className="text-title">Nome:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Digite o nome da empresa"
            name="nome"
            value={form.nome}
            onChange={handleChange}
          />
          <label className="text-title">CNPJ:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Digite o CNPJ"
            name="cnpj"
            value={form.cnpj}
            onChange={handleChange}
          />
          <label className="text-title">E-mail:</label>
          <input
            type="email"
            className="form-control"
            placeholder="Digite o e-mail"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          <label className="text-title">Telefone:</label>
          <input
            type="tel"
            className="form-control"
            placeholder="Digite o telefone"
            name="telefone"
            value={form.telefone}
            onChange={handleChange}
          />

          <button className="btn btn-primary w-100 mt-3" onClick={handleSearch}>
            <i className="bi bi-search me-2"></i> Consultar
          </button>
        </div>
      </div>

      {result && (
        <div className="form-card mt-4">
          <div className="card-body">
            <h5 className="card-title text-center mb-3">Resultado</h5>
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
