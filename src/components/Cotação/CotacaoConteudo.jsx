import React, { useState, useEffect } from "react";
import "../styles/CotacaoConteudo.css";
import { FaHome } from "react-icons/fa";

const CotacaoConteudo = () => {
  const [incendio, setIncendio] = useState("");
  const [aluguel, setAluguel] = useState("");
  const [premio, setPremio] = useState("");
  const [comissao, setComissao] = useState("");

  const desformatarMoeda = (valor) => {
    return Number(valor.replace(/\D/g, "")) / 100;
  };

  const formatarMoeda = (valor) => {
    const num = Number(valor.replace(/\D/g, "")) / 100;
    return num.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleChange = (setter) => (e) => {
    const valor = e.target.value;
    setter(formatarMoeda(valor));
  };

  const isTotal = desformatarMoeda(incendio || "0") + desformatarMoeda(aluguel || "0");
  const valorComissao =
    (desformatarMoeda(premio || "0") * desformatarMoeda(comissao || "0")) / 100;

  return (
    <div className="cotacao-container">
      <div className="icone-cabecalho">
        <FaHome size={32} />
      </div>
      <h2 className="titulo-pagina">Cotação – Incêndio Conteúdo</h2>

      <div className="input-grid">
        <div className="campo">
          <label>Incêndio Conteúdo (R$)</label>
          <input
            type="text"
            value={incendio}
            onChange={handleChange(setIncendio)}
            placeholder="R$ 0,00"
          />
        </div>

        <div className="campo">
          <label>Perda de Aluguel (R$)</label>
          <input
            type="text"
            value={aluguel}
            onChange={handleChange(setAluguel)}
            placeholder="R$ 0,00"
          />
        </div>

        <div className="campo readonly">
          <label>IS Total (R$)</label>
          <input type="text" value={isTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} readOnly />
        </div>

        <div className="campo">
          <label>Prêmio Líquido (R$)</label>
          <input
            type="text"
            value={premio}
            onChange={handleChange(setPremio)}
            placeholder="R$ 0,00"
          />
        </div>

        <div className="campo">
          <label>Comissão (%)</label>
          <input
            type="text"
            value={comissao}
            onChange={handleChange(setComissao)}
            placeholder="Ex: 20%"
          />
        </div>

        <div className="campo readonly">
          <label>Comissão em R$</label>
          <input
            type="text"
            value={valorComissao.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default CotacaoConteudo;
