import React, { useEffect, useState } from "react";
import "../../styles/HistoricoPage.css";


const HistoricoPage = () => {
    const [historico, setHistorico] = useState([]);
    const [filtro, setFiltro] = useState("");
  
    useEffect(() => {
      const dadosSimulados = [
        { data: "2025-07-05", tipo: "CNPJ", doc: "12.345.678/0001-90", usuario: "admin", resultado: "Ativo" },
        { data: "2025-07-04", tipo: "Chave Alternativa", doc: "chave@exemplo.com", usuario: "comum", resultado: "Inativo" },
        { data: "2025-07-03", tipo: "CPF", doc: "123.456.789-00", usuario: "admin", resultado: "Pendente" },
      ];
      setHistorico(dadosSimulados);
    }, []);
  
    const formatarData = (dataISO) => {
      const [ano, mes, dia] = dataISO.split("-");
      return `${dia}/${mes}/${ano}`;
    };
  
    const historicoFiltrado = historico.filter((item) => {
      const filtroLower = filtro.toLowerCase();
      return (
        item.doc.toLowerCase().includes(filtroLower) ||
        item.tipo.toLowerCase().includes(filtroLower) ||
        item.usuario.toLowerCase().includes(filtroLower)
      );
    });
  
    return (
      <div className="historico-container">
        <h2>Histórico de Consultas</h2>
  
        <input
          type="text"
          placeholder="Filtrar por documento, tipo ou resultado..."
          className="filtro-input"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
  
        <table className="historico-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Documento</th>
              <th>Usuário</th>
            </tr>
          </thead>
          <tbody>
            {historicoFiltrado.length === 0 ? (
              <tr>
                <td colSpan="5" className="sem-consultas">
                  Nenhum resultado encontrado.
                </td>
              </tr>
            ) : (
              historicoFiltrado.map((item, index) => (
                <tr key={index}>
                  <td>{formatarData(item.data)}</td>
                  <td>{item.tipo}</td>
                  <td>{item.doc}</td>
                  <td>{item.usuario}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default HistoricoPage;