import React, { useEffect, useState } from "react";
import "../../styles/HistoricoPage.css";
import { ConsultaService } from "../../../services/consultaService";

const HistoricoPage = () => {
  const [historico, setHistorico] = useState([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    ConsultaService.getConsultaHistory()
      .then((data) => {
        console.log("Histórico carregado:", data);
        setHistorico(data.results || []);
      })
      .catch((error) => {
        console.error("Erro ao buscar histórico:", error);
      });
  }, []);

  const formatarData = (dataISO) => {
    if (!dataISO) return "";
    const data = new Date(dataISO);
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const historicoFiltrado = historico.filter((item) => {
    const filtroLower = filtro.toLowerCase();
    return (
      (item.parametro_consulta || "").toLowerCase().includes(filtroLower) ||
      (item.tipo_consulta_display || "").toLowerCase().includes(filtroLower) ||
      (item.usuario_email || "").toLowerCase().includes(filtroLower)
    );
  });

  return (
    <div className="historico-container">
      <h2>Histórico de Consultas</h2>

      <input
        type="text"
        placeholder="Filtrar por documento, tipo ou usuário..."
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
              <td colSpan="4" className="sem-consultas">
                Nenhum resultado encontrado.
              </td>
            </tr>
          ) : (
            historicoFiltrado.map((item, index) => (
              <tr key={index}>
                <td>{formatarData(item.data_consulta)}</td>
                <td>{item.tipo_consulta_display}</td>
                <td>{item.parametro_consulta}</td>
                <td>{item.usuario_email}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HistoricoPage;
