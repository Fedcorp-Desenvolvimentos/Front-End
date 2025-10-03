import React, { useEffect, useMemo, useState } from "react";
import KanbanVisitas from "./KanbanVisitas";
import GraficoVisitas from "./GraficoVisitas";
import DetalheVisita from "./DetalheVisita";
import { AgendaComercialService } from "../../services/agenda_comercial";
import "../styles/DashboardComercial.css";
import * as XLSX from "xlsx";

function toBRDate(d) {
  try {
    if (!d) return "N/A";
    const dt = typeof d === "string" ? new Date(d) : d;
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString("pt-BR");
  } catch {
    return String(d);
  }
}

function getComercialName(v) {
  const r = v?.responsavel;
  if (!r) return "";
  return r.nome_completo || r.username || r.nome || "";
}

function normalizeDateYYYYMMDD(value) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  if (value instanceof Date && !Number.isNaN(value.getTime()))
    return value.toISOString().slice(0, 10);
  try {
    const dt = new Date(value);
    if (!Number.isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);
  } catch { }
  return String(value);
}

function parseISODate(yyyyMMdd) {
  if (!yyyyMMdd) return null;
  const [y, m, d] = yyyyMMdd.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function getMonthBounds(date) {
  const base = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = new Date(base.getFullYear(), base.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(
    base.getFullYear(),
    base.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
  return { start, end };
}

export default function DashboardComercial() {
  const [visitas, setVisitas] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [visitaDetalhe, setVisitaDetalhe] = useState(null);

  const [activeMonth, setActiveMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [filters, setFilters] = useState({
    empresa: "",
    comercial: "all",
  });

  async function fetchVisitas() {
    try {
      setLoading(true);
      setErro("");
      const response = await AgendaComercialService.getVisitas();

      const results =
        (Array.isArray(response?.results) && response.results) ||
        (Array.isArray(response?.data?.results) && response.data.results) ||
        (Array.isArray(response) && response) ||
        [];

      const normalized = results.map((v) => {
        const motivo =
          v.motivo_cancelamento ??
          v.motivoCancelamento ??
          v.cancel_reason ??
          v.cancelMotivo ??
          v.motivo_canc ??
          v.justificativa ??
          v.motivo ??
          v?.cancelamento?.motivo ??
          v?.detalhes_cancelamento?.motivo ??
          v?.cancel?.reason ??
          "";
        return {
          ...v,
          motivo_cancelamento: String(motivo || "").trim(),
        };
      });

      setVisitas(normalized);
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

  const comerciaisOptions = useMemo(() => {
    const set = new Set();
    visitas.forEach((v) => {
      const nome = getComercialName(v)?.trim();
      if (nome) set.add(nome);
    });
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [visitas]);

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
    }).format(activeMonth);
  }, [activeMonth]);

  const { start: monthStart, end: monthEnd } = useMemo(
    () => getMonthBounds(activeMonth),
    [activeMonth]
  );

  const filteredVisitas = useMemo(() => {
    if (!Array.isArray(visitas)) return [];

    const empresaTerm = filters.empresa.trim().toLowerCase();
    const comercialSel = filters.comercial;

    return visitas.filter((v) => {
      const empresaOk = empresaTerm
        ? (v?.empresa || "").toLowerCase().includes(empresaTerm)
        : true;

      const comercialNome = getComercialName(v);
      const comercialOk =
        comercialSel === "all" ? true : comercialNome === comercialSel;

      const vISO = normalizeDateYYYYMMDD(v?.data);
      const vDate = parseISODate(vISO);
      if (!vDate || Number.isNaN(vDate.getTime())) return false;

      const inActiveMonth = vDate >= monthStart && vDate <= monthEnd;

      return empresaOk && comercialOk && inActiveMonth;
    });
  }, [visitas, filters, monthStart, monthEnd]);

  function exportarRelatorioExcel() {
    try {
      const base = Array.isArray(filteredVisitas) ? filteredVisitas : [];
      if (base.length === 0) {
        setErro("Não há dados para exportar.");
        return;
      }

      const dadosParaExportar = base.map((v) => ({
        Empresa: v?.empresa ?? "N/A",
        Data: toBRDate(v?.data),
        Status: v?.status ?? "N/A",
        Responsável: getComercialName(v) || "N/A",
        "Motivo do Cancelamento":
          String(v?.status).toLowerCase() === "cancelada"
            ? v?.motivo_cancelamento || v?.motivo || v?.justificativa || ""
            : "",
        Observações: v?.observacoes ?? v?.descricao ?? v?.obs ?? "",
      }));

      const ws = XLSX.utils.json_to_sheet(dadosParaExportar);
      ws["!cols"] = [
        { wch: 30 }, // Empresa
        { wch: 12 }, // Data
        { wch: 16 }, // Status
        { wch: 28 }, // Responsável
        { wch: 34 }, // Motivo Cancelamento
        { wch: 40 }, // Observações
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Visitas");

      const filename = `Relatorio_Visitas_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      if (typeof XLSX.writeFile === "function") {
        XLSX.writeFile(wb, filename, { compression: true });
        return;
      }
    } catch (e) {
      console.error("Erro ao exportar relatório:", e);
      setErro("Não foi possível exportar o relatório.");
    }
  }

  function handleCardClick(visitaParcial) {
    const vId = String(visitaParcial?.id ?? "");
    const completa =
      (Array.isArray(visitas) && visitas.find((v) => String(v?.id) === vId)) ||
      visitaParcial;
    const merged = { ...visitaParcial, ...completa };
    setVisitaDetalhe(merged);
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

  function goPrevMonth() {
    setActiveMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  function goNextMonth() {
    setActiveMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }
  function handleMonthInput(e) {
    const value = e.target.value;
    if (!value) return;
    const [y, m] = value.split("-").map(Number);
    if (y && m) setActiveMonth(new Date(y, m - 1, 1));
  }
  function goTodayMonth() {
    const now = new Date();
    setActiveMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  }

  if (loading) {
    return (
      <div className="fedconnect-dashboard">
        <p>Carregando visitas...</p>
        <div className="dashboard-mes-controls">
          <button className="month-btn" onClick={goPrevMonth} aria-label="Mês anterior">‹</button>
          <span className="month-label">{monthLabel}</span>
          <button className="month-btn" onClick={goNextMonth} aria-label="Próximo mês">›</button>
          <input
            type="month"
            className="month-input"
            onChange={handleMonthInput}
            aria-label="Selecionar mês"
            value={`${activeMonth.getFullYear()}-${String(activeMonth.getMonth() + 1).padStart(2, '0')}`}
          />
          <button className="month-btn today" onClick={goTodayMonth}>Hoje</button>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="fedconnect-dashboard">
        <p className="alert error">{erro}</p>

        <div className="dashboard-mes-controls">
          <button className="month-btn" onClick={goPrevMonth} aria-label="Mês anterior">‹</button>
          <span className="month-label">{monthLabel}</span>
          <button className="month-btn" onClick={goNextMonth} aria-label="Próximo mês">›</button>
          <input
            type="month"
            className="month-input"
            onChange={handleMonthInput}
            aria-label="Selecionar mês"
            value={`${activeMonth.getFullYear()}-${String(activeMonth.getMonth() + 1).padStart(2, '0')}`}
          />
          <button className="month-btn today" onClick={goTodayMonth}>Hoje</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fedconnect-dashboard">
      <div className="dashboard-topo">
        <h2>Acompanhamento Comercial</h2>
      </div>

      <div className="dashboard-filtros agenda-filtros">
        <input
          type="text"
          placeholder="Buscar por empresa…"
          value={filters.empresa}
          onChange={(e) =>
            setFilters((f) => ({ ...f, empresa: e.target.value }))
          }
        />

        <select
          value={filters.comercial}
          onChange={(e) =>
            setFilters((f) => ({ ...f, comercial: e.target.value }))
          }
          aria-label="Filtrar por comercial"
        >
          {comerciaisOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt === "all" ? "Todos os comerciais" : opt}
            </option>
          ))}
        </select>

        <div className="dashboard-mes-controls">
          <button className="month-btn" onClick={goPrevMonth} aria-label="Mês anterior">‹</button>
          <span className="month-label">{monthLabel}</span>
          <button className="month-btn" onClick={goNextMonth} aria-label="Próximo mês">›</button>
        </div>

        <button
          className="btn-light"
          onClick={() =>
            setFilters({ empresa: "", comercial: "all" })
          }
        >
          Limpar
        </button>
      </div>

      <section className="dashboard-graph-container">
        <div className="graph-wrapper">
          <GraficoVisitas visitas={filteredVisitas} />
        </div>

        <button
          className="btn-exportar-relatorio"
          onClick={exportarRelatorioExcel}
          disabled={!filteredVisitas?.length}
          title={
            filteredVisitas?.length
              ? "Exportar relatório em Excel"
              : "Sem dados para exportar"
          }
          aria-disabled={!filteredVisitas?.length}
        >
          Exportar Relatório
        </button>
      </section>

      <KanbanVisitas
        visitas={filteredVisitas}
        onConfirmar={abrirModalConfirmacao}
        onStatusChange={atualizarStatus}
        onCardClick={handleCardClick}
      />

      {visitaDetalhe && (
        <DetalheVisita
          visita={visitaDetalhe}
          onClose={() => setVisitaDetalhe(null)}
        />
      )}
    </div>
  );
}
