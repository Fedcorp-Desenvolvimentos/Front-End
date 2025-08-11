import React, { useState } from "react";
import "../styles/Comercial.css";
import "../styles/Conta.css";
import { ConsultaService } from "../../services/consultaService";
import { FaBriefcase, FaFileExcel, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import * as XLSX from "xlsx";

const ConsultaComercial = () => {
  const [activeCard, setActiveCard] = useState(null);
  const [form, setForm] = useState({ cnpj: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalPersonData, setModalPersonData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  const [file, setFile] = useState(null);
  const [bulkResults, setBulkResults] = useState([]);
  const [massConsultaMessage, setMassConsultaMessage] = useState("");
  const [massLoading, setMassLoading] = useState(false);


const navigate = useNavigate();

const handleCardClick = (option) => {
  setActiveCard(option);
  if (option === "conteudo") {
    navigate("/cotacao-conteudo"); 
  }
};

  const handleCnpjChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, "");
    setForm({ cnpj: onlyDigits.slice(0, 14) });
  };

  const handleSearch = async () => {
    setResult(null);
    setError(null);
    if (!form.cnpj) {
      setError("Por favor, digite um CNPJ.");
      return;
    }
    if (form.cnpj.length < 14) {
      setError("O CNPJ deve conter 14 dígitos.");
      return;
    }
    setLoading(true);
    try {
      const { resultado_api } = await ConsultaService.consultarComercial(form.cnpj);
      const empresa = resultado_api?.Result?.[0] || null;
      if (empresa) {
        setResult(empresa);
        setForm({cnpj: ""});
      } else {
        setError("Nenhum resultado de empresa encontrado para o CNPJ fornecido.");
      }
    } catch (err) {
      setError(err.message || "Ocorreu um erro ao consultar o CNPJ da empresa.");
    } finally {
      setLoading(false);
    }
  };

  const handlePersonClick = async (person) => {
    const cpf = person.RelatedEntityTaxIdNumber;
    if (!cpf || person.RelatedEntityTaxIdType !== "CPF") {
      setModalError("CPF não disponível ou tipo de documento inválido.");
      setShowModal(true);
      return;
    }
    setModalLoading(true);
    setModalError(null);
    setModalPersonData(null);
    try {
      const { resultado_api } = await ConsultaService.consultarContatoComercial(cpf);
      const regData = resultado_api?.Result?.[0]?.RegistrationData || null;
      if (regData) setModalPersonData(regData);
      else setModalError("Nenhum dado de contato encontrado para esta pessoa.");
    } catch (err) {
      setModalError(err.message || "Erro ao consultar detalhes de contato.");
    } finally {
      setModalLoading(false);
      setShowModal(true);
    }
  };

  const renderFilteredRelationships = (rels, title) => {
    if (!rels?.length) return null;
    const filtered = rels.filter(
      (r) =>
        r.RelationshipType === "QSA" ||
        r.RelationshipType === "Ownership" ||
        r.RelationshipType === "REPRESENTANTELEGAL"
    );
    if (!filtered.length) return null;
   return (
      <>
        <h6 className="rel-title">{title}:</h6>
        <ul className="rel-list">
          {filtered.map((p, i) => (
            <li
              key={`${p.RelatedEntityTaxIdNumber}-${i}`}
              className="rel-list-item"
            >
              <div className="rel-info">
                <strong>{p.RelatedEntityName || "Nome N/A"}</strong>
                <br />
                <span className="rel-type">Tipo: {p.RelationshipType}</span>
                <br />
                <span className="rel-cpf">
                  CPF: {p.RelatedEntityTaxIdNumber}
                </span>
              </div>
              <button
                className="btn-rel-details"
                onClick={() => handlePersonClick(p)}
                title="Ver Detalhes"
              >
                Ver Detalhes
              </button>
            </li>
          ))}
        </ul>
      </>
    );
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setBulkResults([]);
    setMassConsultaMessage("");
  };

  const handleImportFile = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setMassConsultaMessage(
        "Por favor, selecione um arquivo Excel (.xlsx ou .xls)."
      );
      return;
    }

    setMassLoading(true);
    setMassConsultaMessage(
      "Lendo arquivo e preparando para consulta em massa..."
    );

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          const jsonSheet = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          let cnpjs = [];
          if (jsonSheet.length > 1) {
            cnpjs = jsonSheet
              .slice(1)
              .map((row) => String(row[0]).replace(/\D/g, ""))
              .filter((cnpj) => cnpj.length === 14);
          } else if (jsonSheet.length === 1 && jsonSheet[0].length > 0) {
            cnpjs = [String(jsonSheet[0][0]).replace(/\D/g, "")].filter(
              (cnpj) => cnpj.length === 14
            );
          }

          if (cnpjs.length === 0) {
            setMassConsultaMessage(
              "Nenhum CNPJ válido encontrado na planilha. Verifique se a coluna de CNPJs é a primeira e não há cabeçalhos inesperados ou dados inválidos."
            );
            setMassLoading(false);
            return;
          }

          setMassConsultaMessage(
            `Encontrados ${cnpjs.length} CNPJs. Iniciando consulta em massa...`
          );

          const payload = { cnpjs: cnpjs };

          const excelBlob = await ConsultaService.consultarComercialMassa(
            payload
          );

          const url = window.URL.createObjectURL(excelBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "resultados_consulta_massa_cpf.xlsx";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          setMassConsultaMessage(
            "Consulta em massa concluída! Planilha de resultados baixada."
          );
          setFile(null);
        } catch (readError) {
          console.error("Erro ao ler o arquivo Excel:", readError);
          setMassConsultaMessage(
            "Erro ao processar o arquivo. Certifique-se de que é um Excel válido e no formato esperado."
          );
        } finally {
          setMassLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (serviceError) {
      console.error("Erro na consulta em massa:", serviceError);
      setMassConsultaMessage(
        `Erro na consulta em massa: ${
          serviceError.message || "Verifique o console para mais detalhes."
        }`
      );
      setMassLoading(false);
    }
  };

  const handleDownloadModel = async () => {
    setMassLoading(true);
    setMassConsultaMessage("Baixando modelo...");
    try {
      const response = await ConsultaService.baixarPlanilhaModeloCNPJ();
      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "modelo-cnpj.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMassConsultaMessage("Download do modelo concluído.");
    } catch {
      setMassConsultaMessage("Erro ao baixar modelo.");
    } finally {
      setMassLoading(false);
    }
  };

  return (
    <div className="consulta-container">
      <h2 className="titulo-pagina">Escolha a opção de consulta</h2>

      <div className="card-options-wrapper">
        <div
          className={`card card-option ${activeCard === "cnpj" ? "active" : ""}`}
          onClick={() => handleCardClick("cnpj")}
        >
          <div className="icon-container">
          <FaBriefcase size={30} />
          </div>
          <h5>Consulta CNPJ</h5>
        </div>

        <div
          className={`card card-option ${activeCard === "massa" ? "active" : ""}`}
          onClick={() => handleCardClick("massa")}
        >
          <div className="icon-container">
          <FaFileExcel size={30} />
          </div>
          <h5>Consulta em Massa</h5>
        </div>

        <div
          className={`card card-option ${activeCard === "conteudo" ? "active" : ""}`}
          onClick={() => handleCardClick("conteudo")}
        >
          <div className="icon-container">
          <FaSearch size={30} />
          </div>
          <h5>Cotação Conteúdo</h5>
        </div>
      </div>

      {activeCard === "cnpj" && (
        <div className="form-container">
          <label>Digite o CNPJ:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Digite apenas os 14 dígitos do CNPJ"
            value={form.cnpj}
            onChange={handleCnpjChange}
          />
          <button
            className="btn-primary"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Consultando..." : <><FaSearch className="btn-icon" /> Consultar</>}
          </button>
          {error && <div className="alert-erro mt-3">{error}</div>}
        </div>
      )}

      {activeCard === "massa" && (
        <div className="form-massa-container">
          <label className="form-label">Consulta em massa:</label>
          <input
            type="file"
            id="input-massa-cnpj"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            onChange={handleImportFile}
            disabled={massLoading}
          />
          <button
            className="btn-primary"
            type="button"
            onClick={() => document.getElementById("input-massa-cnpj").click()}
            disabled={loading}
          >
            Importar Planilha de CNPJs
          </button>
          <button
            className="btn-primary mt-2"
            type="button"
            onClick={handleDownloadModel}
            disabled={loading}
          >
            Baixar Planilha Modelo
          </button>
          {massLoading && <p>Processando planilha...</p>}
          {massConsultaMessage && (
            <p className={massConsultaMessage.includes("Erro") ? "error-message" : "message"}>{massConsultaMessage}</p>
          )}
          {bulkResults.length > 0 && (
            <div className="bulk-results mt-3">
              <h5>Resultados:</h5>
              <ul>
                {bulkResults.map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.cnpj}:</strong> {item.erro ? "Erro ao consultar" : `Empresa ${item.empresa ? "encontrada" : "não encontrada"}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {activeCard === "conteudo" && (
        <div className="form-container">
          <label>Digite o endereço:</label>
          <input type="text" placeholder="Rua, número, bairro..." />
          <button>Pesquisar Conteúdo</button>
        </div>
      )}

      {result && (
        <div className="form-card mt-4">
          <div className="card-body">
            {renderFilteredRelationships(
              result.Relationships.CurrentRelationships,
              "Sócios, Administradores e Representantes Legais"
            )}
            {!result.Relationships.CurrentRelationships?.length && (
              <p className="no-rel-msg">
                Nenhum sócio, administrador ou representante legal encontrado para este CNPJ.
              </p>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Detalhes de Contato da Pessoa</h3>
            <button className="btn-icon modal-close" onClick={() => setShowModal(false)} title="Fechar">×</button>
            <div>
              {modalLoading && (
                <div className="modal-loading">
                  <div className="spinner"></div>
                  <p>Buscando detalhes de contato...</p>
                </div>
              )}
              {modalError && <div className="alert-erro">{modalError}</div>}
              {modalPersonData && !modalLoading && !modalError && (
                <div>
                  <h4 className="mt-3">Informações Básicas:</h4>
                  <p className="mt-3"><strong>Nome:</strong> {modalPersonData.BasicData?.Name || "N/A"}</p>
                  <p className="mt-3"><strong>CPF:</strong> {modalPersonData.BasicData?.TaxIdNumber || "N/A"}</p>
                  <p className="mt-3"><strong>Gênero:</strong> {modalPersonData.BasicData?.Gender || "N/A"}</p>
                  <p className="mt-3"><strong>Data de Nascimento:</strong> {modalPersonData.BasicData?.BirthDate ? new Date(modalPersonData.BasicData.BirthDate).toLocaleDateString() : "N/A"}</p>
                  <p className="mt-3"><strong>Nome da Mãe:</strong> {modalPersonData.BasicData?.MotherName || "N/A"}</p>
                  <p className="mt-3"><strong>Status do CPF:</strong> {modalPersonData.BasicData?.TaxIdStatus || "N/A"}</p>

                  {modalPersonData.Emails && (
                    <>
                      <h4 className="mt-3">E-mails:</h4>
                      {modalPersonData.Emails.Primary?.EmailAddress && (
                        <p><strong>Principal:</strong> {modalPersonData.Emails.Primary.EmailAddress}</p>
                      )}
                      {modalPersonData.Emails.Secondary?.EmailAddress && (
                        <p><strong>Secundário:</strong> {modalPersonData.Emails.Secondary.EmailAddress}</p>
                      )}
                      {!modalPersonData.Emails.Primary?.EmailAddress && !modalPersonData.Emails.Secondary?.EmailAddress && (
                        <p>Nenhum e-mail disponível.</p>
                      )}
                    </>
                  )}

                  {modalPersonData.Addresses && (
                    <>
                      <h4 className="mt-3">Endereços:</h4>
                      {modalPersonData.Addresses.Primary && (
                        <p><strong>Principal:</strong> {modalPersonData.Addresses.Primary.AddressMain}, {modalPersonData.Addresses.Primary.Number}</p>
                      )}
                      {modalPersonData.Addresses.Secondary && (
                        <p><strong>Secundário:</strong> {modalPersonData.Addresses.Secondary.AddressMain}, {modalPersonData.Addresses.Secondary.Number}</p>
                      )}
                      {!modalPersonData.Addresses.Primary && !modalPersonData.Addresses.Secondary && (
                        <p>Nenhum endereço disponível.</p>
                      )}
                    </>
                  )}

                  {modalPersonData.Phones && (
                    <>
                      <h4 className="mt-3">Telefones:</h4>
                      {modalPersonData.Phones.Primary?.PhoneNumber && (
                        <p><strong>Principal:</strong> {modalPersonData.Phones.Primary.PhoneNumber}</p>
                      )}
                      {modalPersonData.Phones.Secondary?.PhoneNumber && (
                        <p><strong>Secundário:</strong> {modalPersonData.Phones.Secondary.PhoneNumber}</p>
                      )}
                      {!modalPersonData.Phones.Primary?.PhoneNumber && !modalPersonData.Phones.Secondary?.PhoneNumber && (
                        <p>Nenhum telefone disponível.</p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => setShowModal(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultaComercial;