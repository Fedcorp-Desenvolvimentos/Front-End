import React, { useState } from "react";
import * as XLSX from "xlsx";
import "../styles/Consulta.css";
import { ConsultaService } from "../../services/consultaService";
import { FileSpreadsheet } from "lucide-react";

const ConsultaCNPJ = () => {
  const [cnpj, setCnpj] = useState("");
  const [activeForm, setActiveForm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [formData, setFormData] = useState({
    razaoSocial: "",
    uf: "",
    email: "",
    telefone: "",
  });

  const [massConsultaMessage, setMassConsultaMessage] = useState("");
  const [selectedResultIndex, setSelectedResultIndex] = useState(null);

  const handleCnpjChange = (e) => {
    const rawCnpj = e.target.value.replace(/\D/g, "");
    setCnpj(rawCnpj);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResultado(null);
    setMassConsultaMessage("");

    let payload = {};
    let isFormValid = true;
    let validationErrorMessage = "";

    if (activeForm === "cnpj") {
      if (cnpj.length !== 14) {
        validationErrorMessage =
          "Por favor, insira um CNPJ válido com 14 dígitos.";
        isFormValid = false;
      } else {
        payload = {
          tipo_consulta: "cnpj",
          parametro_consulta: cnpj,
        };
      }
    } else if (activeForm === "chaves") {
      if (
        !formData.razaoSocial.trim() &&
        !formData.uf.trim() &&
        !formData.email.trim() &&
        !formData.telefone.trim()
      ) {
        validationErrorMessage =
          "Por favor, preencha pelo menos um campo para busca por chaves alternativas.";
        isFormValid = false;
      } else {
        let qParams = [];
        if (formData.razaoSocial.trim()) {
          qParams.push(`name{${formData.razaoSocial.trim()}}`);
        }

        if (qParams.length === 0) {
          validationErrorMessage =
            "Nenhum parâmetro de busca válido para chaves alternativas.";
          isFormValid = false;
        } else {
          const bigDataCorpPayload = {
            Datasets: "basic_data",
            q: qParams.join(", "),
            Limit: 5,
          };
          payload = {
            tipo_consulta: "cnpj_razao_social",
            parametro_consulta: JSON.stringify(bigDataCorpPayload),
          };
        }
      }
    }

    if (!isFormValid) {
      setError(validationErrorMessage);
      setLoading(false);
      return;
    }

    try {
      const response = await ConsultaService.realizarConsulta(payload);
      setResultado(response);
      console.log("Resultado da consulta:", response);
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Erro ao realizar consulta.";
      setError(errorMessage);
      console.error("Erro na consulta:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleMassFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setMassConsultaMessage("Por favor, selecione um arquivo para upload.");
      return;
    }

    setLoading(true);
    setError(null);
    setResultado(null);
    setMassConsultaMessage("Lendo planilha e preparando para consulta...");

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const cnpjsParaConsulta = jsonData.map((row) => ({
          CNPJ: String(row.CNPJ),
        }));
        const requestBody = {
          cnpjs: cnpjsParaConsulta,
          origem: "planilha",
        };

        setMassConsultaMessage("Enviando CNPJs para processamento em massa...");

        const response = await ConsultaService.processarPlanilhaCNPJ(
          requestBody
        );
        const blob = response;
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "planilha-resultado.xlsx");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        setMassConsultaMessage(
          "Processamento concluído! O download da planilha de resultados iniciou."
        );
      } catch (err) {
        console.error("Erro na comunicação ou processamento do arquivo:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Erro inesperado: Verifique sua conexão e o formato do arquivo.";
        setMassConsultaMessage(`Erro ao processar a planilha: ${errorMessage}`);
      } finally {
        setLoading(false);
        if (event.target) {
          event.target.value = null;
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDownloadModel = async () => {
    setLoading(true);
    setMassConsultaMessage("Baixando planilha modelo...");
    try {
      const response = await ConsultaService.baixarPlanilhaModeloCNPJ();

      const blob = response;
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "modelo-cnpj.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setMassConsultaMessage("Download do modelo concluído.");
    } catch (err) {
      console.error("Erro ao baixar modelo:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Erro na comunicação com o servidor para baixar o modelo.";
      setMassConsultaMessage(`Erro ao baixar modelo: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getCnpjData = () => {
    if (!resultado || !resultado.resultado_api) return null;
    if (resultado.historico_salvo?.tipo_consulta === "cnpj") {
      return resultado.resultado_api;
    } else if (
      resultado.historico_salvo?.tipo_consulta === "cnpj_razao_social"
    ) {
      if (
        resultado.resultado_api.Result &&
        resultado.resultado_api.Result.length > 0
      ) {
        return resultado.resultado_api.Result[0].BasicData;
      }
    }
    return null;
  };

  const cnpjData = getCnpjData();

  const handleExpandResult = (idx) => {
    setSelectedResultIndex(selectedResultIndex === idx ? null : idx);
  };

  return (
    <div className="consulta-container03">
      <h1 className="consultas-title">
        <i className="bi-clipboard-data"></i> Consultas Disponíveis
      </h1>

      <div className="card-options-wrapper">
        <div
          className={`card card-option ${activeForm === "cnpj" ? "active" : ""
            }`}
          onClick={() => {
            setActiveForm("cnpj");
            setError(null);
            setResultado(null);
            setMassConsultaMessage("");
          }}
        >
          <div className="icon-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              fill="white"
              className="bi bi-building"
              viewBox="0 0 16 16"
            >
              <path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z" />
              <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3z" />
            </svg>
          </div>
          <h5>Consulta por CNPJ</h5>
        </div>

        <div
          className={`card card-option ${activeForm === "chaves" ? "active" : ""
            }`}
          onClick={() => {
            setActiveForm("chaves");
            setError(null);
            setResultado(null);
            setMassConsultaMessage("");
          }}
        >
          <div className="icon-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="white"
              viewBox="0 0 16 16"
            >
              <path d="M6.5 0A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0zm3 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z" />
              <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1A2.5 2.5 0 0 1 9.5 5h-3A2.5 2.5 0 0 1 4 2.5zM10 8a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0zm-6 4a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0zm4-3a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1" />
            </svg>
          </div>
          <h5>Chaves Alternativas</h5>
        </div>

        <div
          className={`card card-option ${activeForm === "massa" ? "active" : ""
            }`}
          onClick={() => {
            setActiveForm("massa");
            setError(null);
            setResultado(null);
            setMassConsultaMessage("");
          }}
        >
          <div className="icon-container">
            <FileSpreadsheet size={35} />
          </div>
          <h5>Consulta em Massa</h5>
        </div>
      </div>

      {activeForm === "cnpj" && (
        <form className="form-container" onSubmit={handleSubmit}>
          <label htmlFor="cnpj">Digite o documento</label>
          <input
            type="text"
            id="cnpj"
            name="cnpj"
            value={cnpj}
            onChange={handleCnpjChange}
            placeholder="Digite o CNPJ"
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className={`consulta-btn ${loading ? "loading" : ""}`}
          >
            {loading ? "Consultando..." : "Consultar"}
          </button>

          {error && <p className="error-message">{error}</p>}
        </form>
      )}

      {activeForm === "chaves" && (
        <form className="form-container" onSubmit={handleSubmit}>
          <label htmlFor="razaoSocial">Razão Social:</label>
          <input
            type="text"
            id="razaoSocial"
            name="razaoSocial"
            value={formData.razaoSocial}
            onChange={handleFormChange}
            placeholder="Digite a razão social"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={
              loading ||
              (!formData.razaoSocial.trim() &&
                !formData.uf.trim() &&
                !formData.email.trim() &&
                !formData.telefone.trim())
            }
          >
            {loading ? "Consultando..." : "Consultar"}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      )}

      {activeForm === "massa" && (
        <div className="form-massa-container">
          <input
            type="file"
            id="input-massa"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            onChange={handleMassFileUpload}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => document.getElementById("input-massa").click()}
            disabled={loading}
          >
            Importar Planilha de CNPJs
          </button>
          <button
            type="button"
            onClick={handleDownloadModel}
            disabled={loading}
          >
            Baixar Planilha Modelo
          </button>

          {loading && <p>Carregando...</p>}
          {massConsultaMessage && (
            <p className="message">{massConsultaMessage}</p>
          )}
          {error && <p className="error-message">{error}</p>}
        </div>
      )}
      {activeForm == "cnpj" && cnpjData && (
        <div className="card-resultado">
          <h4>Resultado da busca realizada</h4>

          <label>Razão Social:</label>
          <input type="text" value={cnpjData.razao_social || "N/A"} disabled />

          <label>CNPJ:</label>
          <input type="text" value={cnpjData.cnpj || "N/A"} disabled />

          <label>Atividade Principal:</label>
          <input
            type="text"
            value={cnpjData.cnae_fiscal_descricao || "N/A"}
            disabled
          />

          <label>Telefone:</label>
          <input type="text" value={cnpjData.ddd_telefone_1 || cnpjData.ddd_telefone_2 || "N/A"} disabled />

          <label>UF (Sede):</label>
          <input type="text" value={cnpjData.uf || "N/A"} disabled />

          <label>Bairro</label>
          <input
            type="text"
            value={cnpjData.bairro || "Não informada"}
            disabled
          />

          <label>Rua</label>
          <input
            type="text"
            value={
              cnpjData.descricao_tipo_de_logradouro && cnpjData.logradouro
                ? `${cnpjData.descricao_tipo_de_logradouro} ${cnpjData.logradouro}${cnpjData.numero ? `, ${cnpjData.numero}` : ""
                }`
                : cnpjData.descricao_tipo_de_logradouro ||
                cnpjData.logradouro ||
                "Não informada"
            }
            disabled
          />

          <label>Complemento</label>
          <input
            type="text"
            value={cnpjData.municipio || "Não informada"}
            disabled
          />

          <label>Município</label>
          <input
            type="text"
            value={cnpjData.complemento || "Não informada"}
            disabled
          />

        </div>
      )}
      {activeForm == "chaves" && resultado?.resultado_api?.Result && resultado.resultado_api.Result.length > 0 && (
        <div className="card-resultado">
          <h4>Resultados encontrados</h4>
          <table className="historico-table">
            <thead>
              <tr>
                <th>Razão Social</th>
                <th>CNPJ</th>
                <th>UF</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {resultado.resultado_api.Result.map((item, idx) => (
                <React.Fragment key={idx}>
                  <tr
                    className={selectedResultIndex === idx ? 'active-row' : ''}
                    onClick={() => handleExpandResult(idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{item.BasicData?.OfficialName || 'N/A'}</td>
                    <td>{item.BasicData?.TaxIdNumber || 'N/A'}</td>
                    <td>{item.BasicData?.HeadquarterState || 'N/A'}</td>
                    <td className="expand-icon">
                      <i className={`bi ${selectedResultIndex === idx ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                    </td>
                  </tr>
                  {selectedResultIndex === idx && (
                    <tr>
                      <td colSpan="4">
                        <div className="detalhes-historico-panel">
                          <p><strong>Razão Social:</strong> {item.BasicData?.OfficialName || 'N/A'}</p>
                          <p><strong>Nome Fantasia:</strong> {item.BasicData?.TradeName || 'N/A'}</p>
                          <p><strong>CNPJ:</strong> {item.BasicData?.TaxIdNumber || 'N/A'}</p>
                          <p><strong>Atividade Principal:</strong> {item.BasicData?.Activities?.[0]?.Activity || 'N/A'}</p>
                          <p><strong>Natureza Jurídica:</strong> {item.BasicData?.LegalNature?.Activity || 'N/A'}</p>
                          <p><strong>UF (Sede):</strong> {item.BasicData?.HeadquarterState || 'N/A'}</p>
                          <p><strong>Situação Cadastral:</strong> {item.BasicData?.TaxIdStatus || 'N/A'}</p>
                          <p><strong>Data de Fundação:</strong> {item.BasicData?.FoundedDate || 'N/A'}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

  );
};

export default ConsultaCNPJ;
