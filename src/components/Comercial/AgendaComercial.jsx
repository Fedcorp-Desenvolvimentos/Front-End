import React, { useEffect, useMemo, useState, useCallback } from "react";
import "../styles/AgendaComercial.css";
import { AgendaComercialService } from "../../services/agenda_comercial";

function formatDateBR(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
function formatHour(h) {
  return h?.slice(0, 5) || "--:--";
}
function sameMonthISO(iso, refDate) {
  if (!iso) return false;
  const [y, m] = iso.split("-");
  return (
    Number(y) === refDate.getFullYear() && Number(m) === refDate.getMonth() + 1
  );
}
function getMonthLabel(date) {
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}
function addMonths(date, delta) {
  const d = new Date(date.getTime());
  d.setMonth(d.getMonth() + delta, 1);
  return d;
}

const EMPTY_FORM = {
  empresa: "",
  data: "",
  hora: "",
  observacao: "",
  status: "agendado",
  motivo_cancelamento: "", // Adicionado para o formulário principal
};

const STATUS_ORDER = ["agendado", "realizada", "cancelada"];
const STATUS_LABEL = {
  agendado: "Agendado",
  realizada: "Realizada",
  cancelada: "Cancelada",
};

export default function AgendaComercial() {
  // mês exibido (inicia no mês atual)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const monthLabel = useMemo(() => getMonthLabel(currentMonth), [currentMonth]);

  // filtros (apenas empresa)
  const [filters, setFilters] = useState({ empresa: "" });

  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const isEditing = editId !== null;

  // Cancelamento (com motivo)
  const [cancelarModal, setCancelarModal] = useState({
    aberto: false,
    visita: null,
  });
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [erroCancelamento, setErroCancelamento] = useState("");

  // quando o cancelamento é disparado a partir do modal de edição
  const [pendingCancelFromEdit, setPendingCancelFromEdit] = useState(null); // { visitaId } | null

  const fetchVisitas = useCallback(async () => {
    try {
      setLoading(true);
      setErro("");

      // Extrai o ano e o mês do estado 'currentMonth'
      const ano = currentMonth.getFullYear();
      const mes = currentMonth.getMonth() + 1; // getMonth() é 0-indexado (0-11)

      // Chama o serviço passando o ano e o mês
      const response = await AgendaComercialService.getVisitas(ano, mes);
      let visitasDoMes = Array.isArray(response?.results)
        ? response.results
        : [];

      // O filtro de mês foi REMOVIDO daqui, pois o backend já faz isso.

      // Aplica o filtro de busca por empresa (este continua no frontend)
      if (filters.empresa) {
        const t = filters.empresa.toLowerCase();
        visitasDoMes = visitasDoMes.filter((v) =>
          (v.empresa || "").toLowerCase().includes(t)
        );
      }

      // Ordena por data e hora
      visitasDoMes.sort((a, b) => {
        if (a.data === b.data)
          return (a.hora || "").localeCompare(b.hora || "");
        return a.data.localeCompare(b.data);
      });

      setVisitas(visitasDoMes);
    } catch (e) {
      console.error("Erro ao carregar a agenda:", e);
      setErro("Falha ao carregar a agenda. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [currentMonth, filters.empresa]);

  useEffect(() => {
    fetchVisitas();
  }, [fetchVisitas]);

  // Agrupa para Kanban
  const columns = useMemo(() => {
    const map = { agendado: [], realizada: [], cancelada: [] };
    for (const v of visitas) {
      const s = (v.status || "agendado").toLowerCase();
      if (map[s]) map[s].push(v);
      else map.agendado.push(v);
    }
    return map;
  }, [visitas]);

  // CRUD / Modais
  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(v) {
    // só permite editar se status for "agendado"
    if ((v.status || "").toLowerCase() !== "agendado") return;
    setEditId(v.id);
    setForm({
      empresa: v.empresa || "",
      data: v.data || "",
      hora: v.hora || "",
      observacao: v.obs || "",
      status: v.status || "agendado",
      motivo_cancelamento: v.motivo_cancelamento || "", // Adicionado
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e?.preventDefault();
    if (!form.empresa || !form.data) {
      setErro("Preencha cliente/empresa e data.");
      return;
    }

    // Validação do motivo de cancelamento diretamente no formulário principal
    if (form.status === "cancelada" && !form.motivo_cancelamento.trim()) {
      setErro("Para o status 'Cancelada', o motivo é obrigatório.");
      return;
    }

    try {
      setErro("");
      const payload = {
        empresa: form.empresa,
        data: form.data,
        hora: form.hora,
        obs: form.observacao,
        status: form.status,
        motivo_cancelamento: form.motivo_cancelamento, // Adicionado ao payload
      };
      if (isEditing) {
        await AgendaComercialService.confirmarVisita(editId, payload);
      } else {
        await AgendaComercialService.criarVisita(payload);
      }
      closeModal();
      fetchVisitas();
    } catch (err) {
      console.error("Erro ao salvar:", err);
      setErro("Não foi possível salvar. Tente novamente.");
    }
  }

  async function updateStatus(id, novoStatus, extraPayload = {}) {
    try {
      await AgendaComercialService.updateVisitaStatus(
        id,
        novoStatus,
        extraPayload
      );
      await fetchVisitas();
    } catch (e) {
      console.error("Erro ao atualizar status:", e);
      setErro("Não foi possível atualizar o status.");
    }
  }

  // Drag & Drop — habilita só para "agendado"
  function onDragStart(e, visita) {
    if ((visita.status || "").toLowerCase() !== "agendado") return;
    e.dataTransfer.setData("text/plain", String(visita.id));
  }
  function onDragOver(e) {
    e.preventDefault();
  }
  function onDrop(e, targetStatus) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const visita = visitas.find((v) => String(v.id) === id);
    if (!visita) return;

    // só permite arrastar a partir de "agendado"
    if ((visita.status || "").toLowerCase() !== "agendado") return;

    // Se o destino for "cancelada", exigir motivo via modal (não atualiza direto)
    if (targetStatus === "cancelada") {
      setPendingCancelFromEdit(null); // drop não veio do modal de edição
      setCancelarModal({ aberto: true, visita });
      setMotivoCancelamento("");
      setErroCancelamento("");
      return;
    }

    // Para outros destinos (ex.: realizada), atualiza normalmente
    if ((visita.status || "agendado") !== targetStatus) {
      updateStatus(visita.id, targetStatus);
    }
  }

  // Cancelamento (sempre com motivo)
  function openCancelarModal(visita) {
    setPendingCancelFromEdit(null); // botão do card, não é fluxo do modal de edição
    setCancelarModal({ aberto: true, visita });
    setMotivoCancelamento("");
    setErroCancelamento("");
  }
  function closeCancelarModal() {
    setCancelarModal({ aberto: false, visita: null });
    setMotivoCancelamento("");
    setErroCancelamento("");
  }
  async function handleCancelarVisita() {
    if (!motivoCancelamento.trim()) {
      setErroCancelamento("Motivo obrigatório.");
      return;
    }
    try {
      setErroCancelamento("");

      const targetId =
        cancelarModal.visita?.id || pendingCancelFromEdit?.visitaId;
      if (!targetId) {
        setErroCancelamento("Não foi possível identificar a visita.");
        return;
      }

      await updateStatus(targetId, "cancelada", {
        motivo_cancelamento: motivoCancelamento,
      });

      if (pendingCancelFromEdit) {
        setPendingCancelFromEdit(null);
      }

      closeCancelarModal();
    } catch {
      setErroCancelamento("Erro ao cancelar a visita.");
    }
  }

  // Navegação de mês
  function goPrevMonth() {
    setCurrentMonth((d) => addMonths(d, -1));
  }
  function goNextMonth() {
    setCurrentMonth((d) => addMonths(d, 1));
  }

  return (
    <div className="agenda-page">
      <header className="agenda-header">
        <div className="agenda-header-left">
          <h2>Agenda Comercial</h2>
        </div>
        <div className="agenda-header-right">
          <button className="btn-primary" onClick={openCreate}>
            + Nova Visita
          </button>
        </div>
      </header>

      {/* Filtros + mês */}
      <div className="dashboard-filtros agenda-filtros">
        <input
          type="text"
          placeholder="Buscar por empresa…"
          value={filters.empresa}
          onChange={(e) =>
            setFilters((f) => ({ ...f, empresa: e.target.value }))
          }
        />

        <div className="dashboard-mes-controls">
          <button
            className="month-btn"
            onClick={goPrevMonth}
            aria-label="Mês anterior"
          >
            ‹
          </button>
          <span className="month-label">{monthLabel}</span>
          <button
            className="month-btn"
            onClick={goNextMonth}
            aria-label="Próximo mês"
          >
            ›
          </button>
        </div>

        <button
          className="btn-light"
          onClick={() => setFilters({ empresa: "" })}
        >
          Limpar
        </button>
      </div>

      {erro && <div className="alert error">{erro}</div>}

      {loading ? (
        <div className="skeleton">Carregando visitas…</div>
      ) : (
        <div className="kanban" role="list">
          {STATUS_ORDER.map((status) => (
            <section
              key={status}
              className={`kanban-col ${status}`}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, status)}
              aria-label={`Coluna ${STATUS_LABEL[status]}`}
            >
              <header className="kanban-col-header">
                <h3>{STATUS_LABEL[status]}</h3>
                <span className="badge">{(columns[status] || []).length}</span>
              </header>

              <div className="kanban-col-body">
                {(columns[status] || []).length === 0 ? (
                  <div className="empty-col">Sem registros</div>
                ) : (
                  columns[status].map((v) => (
                    <article
                      key={v.id}
                      className={`kcard ${v.status} ${
                        v.status === "agendado" ? "is-draggable" : "is-locked"
                      }`}
                      draggable={v.status === "agendado"}
                      onDragStart={
                        v.status === "agendado"
                          ? (e) => onDragStart(e, v)
                          : undefined
                      }
                      role="listitem"
                    >
                      <div className="kcard-head">
                        <span className="kcard-date">
                          {formatDateBR(v.data)}
                        </span>
                        <span className="kcard-hour">{formatHour(v.hora)}</span>
                      </div>

                      <div className="kcard-body">
                        <div className="kline">
                          <strong>Empresa:</strong> {v.empresa}
                        </div>
                        {v.responsavel?.nome_completo && (
                          <div className="kline">
                            <strong>Responsável:</strong>{" "}
                            {v.responsavel.nome_completo}
                          </div>
                        )}
                        {v.obs && <div className="kobs">{v.obs}</div>}
                        {v.status === "cancelada" && v.motivo_cancelamento && (
                          <div className="kobs-cancelada">
                            <strong>Motivo:</strong> {v.motivo_cancelamento}
                          </div>
                        )}
                      </div>

                      <div className="kcard-actions">
                        {v.status === "agendado" && (
                          <>
                            <button
                              className="btn-light"
                              onClick={() => openEdit(v)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn-danger"
                              onClick={() => openCancelarModal(v)}
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Modal criar/editar */}
      {modalOpen && (
        <div className="modal-overlay" role="presentation" onClick={closeModal}>
          <div
            className="modal modal-wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="agenda-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="agenda-modal-title">
                {isEditing ? "Editar Visita" : "Nova Visita"}
              </h3>
              <button
                className="icon-btn"
                aria-label="Fechar"
                onClick={closeModal}
              >
                ×
              </button>
            </div>
            <form className="agenda-form" onSubmit={handleSubmit} noValidate>
              <div className="grid">
                <label>
                  Cliente/Empresa*
                  <input
                    name="empresa"
                    type="text"
                    value={form.empresa}
                    onChange={(e) =>
                      setForm({ ...form, empresa: e.target.value })
                    }
                    placeholder="Ex.: Cond. Jardim das Flores"
                    required
                  />
                </label>
                <label>
                  Data*
                  <input
                    name="data"
                    type="date"
                    value={form.data}
                    onChange={(e) => setForm({ ...form, data: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Hora
                  <input
                    name="hora"
                    type="time"
                    value={form.hora}
                    onChange={(e) => setForm({ ...form, hora: e.target.value })}
                  />
                </label>
                <label>
                  Status*
                  <select
                    name="status"
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    required
                  >
                    <option value="agendado">Agendado</option>
                    <option value="realizada">Realizada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </label>

                <label className="full">
                  Observação
                  <textarea
                    name="observacao"
                    rows={4}
                    value={form.observacao}
                    onChange={(e) =>
                      setForm({ ...form, observacao: e.target.value })
                    }
                    placeholder="Detalhes da visita, objetivos, etc."
                  />
                </label>

                {/* Campo condicional para motivo de cancelamento */}
                {form.status === "cancelada" && (
                  <label className="full">
                    Motivo do Cancelamento*
                    <textarea
                      name="motivo_cancelamento"
                      rows={4}
                      value={form.motivo_cancelamento}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          motivo_cancelamento: e.target.value,
                        })
                      }
                      placeholder="Especifique o motivo do cancelamento"
                      required
                    />
                  </label>
                )}
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-light"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {isEditing ? "Salvar alterações" : "Agendar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal cancelamento (motivo obrigatório) */}
      {cancelarModal.aberto && (
        <div className="modal-overlay" onClick={closeCancelarModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancelar visita</h3>
              <button
                className="icon-btn"
                aria-label="Fechar"
                onClick={closeCancelarModal}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Informe o motivo do cancelamento:</p>
              <textarea
                rows={4}
                style={{ width: "100%" }}
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
                placeholder="Motivo do cancelamento (obrigatório)"
              />
              {erroCancelamento && (
                <div className="alert error">{erroCancelamento}</div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-light" onClick={closeCancelarModal}>
                Voltar
              </button>
              <button className="btn-danger" onClick={handleCancelarVisita}>
                Confirmar cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
