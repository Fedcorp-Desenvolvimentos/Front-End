import React, { useEffect, useState } from "react";
import KanbanVisitas from "./KanbanVisitas";
import GraficoVisitas from "./GraficoVisitas";
import DetalheVisita from "./DetalheVisita"; // <- Modal de detalhes
import { AgendaComercialService } from "../../services/agenda_comercial";
import "../styles/DashboardComercial.css";
import * as XLSX from "xlsx";

function toBRDate(d) {
  try {
    if (!d) return "N/A";
    // aceita Date ou string (ISO ou yyyy-mm-dd)
    const dt = typeof d === "string" ? new Date(d) : d;
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString("pt-BR");
  } catch {
    return String(d);
  }
}

export default function DashboardComercial() {
  const [visitas, setVisitas] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [visitaDetalhe, setVisitaDetalhe] = useState(null);

  async function fetchVisitas() {
    try {
      setLoading(true);
      setErro("");
      const response = await AgendaComercialService.getVisitas();

      // Torna o parse do retorno mais tolerante a diferentes formatos
      const results =
        (Array.isArray(response?.results) && response.results) ||
        (Array.isArray(response?.data?.results) && response.data.results) ||
        (Array.isArray(response) && response) ||
        [];

      setVisitas(results);
    } catch (e) {
      console.error("Erro ao carregar visitas:", e);
      setErro("Falha ao carregar as visitas. Tente novamente.");
      setVisitas([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVisitas();
  }, []);

  function exportarRelatorioExcel() {
    try {
      if (!Array.isArray(visitas) || visitas.length === 0) {
        setErro("Não há dados para exportar.");
        return;
      }

      const dadosParaExportar = visitas.map((v) => ({
        Empresa: v?.empresa ?? "N/A",
        Data: toBRDate(v?.data),
        Status: v?.status ?? "N/A",
        Responsável: v?.responsavel
          ? v.responsavel.nome_completo ||
            v.responsavel.username ||
            v.responsavel.nome ||
            "N/A"
          : "N/A",
        Observações: v?.observacoes ?? v?.descricao ?? "", // se existir
      }));

      const ws = XLSX.utils.json_to_sheet(dadosParaExportar);
      // Larguras de coluna para melhorar a leitura
      ws["!cols"] = [
        { wch: 30 }, // Empresa
        { wch: 12 }, // Data
        { wch: 16 }, // Status
        { wch: 28 }, // Responsável
        { wch: 40 }, // Observações
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Visitas");

      const filename = `Relatorio_Visitas_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      // Caminho A: preferencial (cria e baixa o arquivo diretamente)
      if (typeof XLSX.writeFile === "function") {
        XLSX.writeFile(wb, filename, { compression: true });
        return;
      }

      // Caminho B (fallback): gerar Blob manualmente
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Erro ao exportar relatório:", e);
      setErro(
        "Não foi possível exportar o relatório. Tente novamente ou verifique o console."
      );
    }
  }

  async function atualizarStatus(id, novoStatus) {
    try {
      await AgendaComercialService.updateVisitaStatus(id, novoStatus);
      fetchVisitas();
    } catch (e) {
      console.error("Erro ao atualizar status:", e);
      setErro("Não foi possível atualizar o status.");
    }
  }

  function abrirModalConfirmacao(visita) {
    setModal(visita);
  }

  // Renderização da tela principal
  if (loading) {
    return (
      <div className="fedconnect-dashboard">
        <p>Carregando visitas...</p>
      </div>
    );
  }

  if (erro) {
    // Mantém erro mostrando na tela; se quiser que não bloqueie a UI,
    // remova este return e exiba erro em um banner acima.
    return (
      <div className="fedconnect-dashboard">
        <p className="alert error">{erro}</p>
        {/* Mesmo com erro, mostramos botão para tentar exportar se houver dados */}
        <button
          className="btn-exportar-relatorio"
          onClick={exportarRelatorioExcel}
          disabled={!visitas?.length}
          style={{ marginTop: 12 }}
        >
          Exportar Relatório
        </button>
      </div>
    );
  }

  return (
    <div className="fedconnect-dashboard">
      <div className="dashboard-topo">
        <h2>Dashboard Comercial</h2>
      </div>

      <section className="dashboard-graph-container">
        <div className="graph-wrapper">
          <GraficoVisitas visitas={visitas} />
        </div>

        <button
          className="btn-exportar-relatorio"
          onClick={exportarRelatorioExcel}
          disabled={!visitas?.length}
          title={
            visitas?.length
              ? "Exportar relatório em Excel"
              : "Sem dados para exportar"
          }
          aria-disabled={!visitas?.length}
        >
          Exportar Relatório
        </button>
      </section>

      <KanbanVisitas
        visitas={visitas}
        onConfirmar={abrirModalConfirmacao}
        onStatusChange={atualizarStatus}
        onCardClick={setVisitaDetalhe}
      />

      {/* Modal de detalhes da visita */}
      {visitaDetalhe && (
        <DetalheVisita
          visita={visitaDetalhe}
          onClose={() => setVisitaDetalhe(null)}
        />
      )}
    </div>
  );
}
