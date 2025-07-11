// ConsultaEnd.jsx

import React, { useState } from "react";
// import * as XLSX from "xlsx"; // Importe a biblioteca XLSX para leitura no frontend
import "../styles/Consulta.css"; // Verifique o caminho
import { ConsultaService } from "../../services/consultaService"; // Verifique o caminho
import { FileSpreadsheet } from "lucide-react";

const DJANGO_BACKEND_BASE_URL = "http://127.0.0.1:8000"; // <--- VERIFIQUE AQUI SUA PORTA DJANGO

const ConsultaEnd = () => {
  const [activeForm, setActiveForm] = useState("cep");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [formData, setFormData] = useState({
    cep: "",
    rua: "",
    bairro: "",
    cidade: "",
    uf: "",
  });
  const [massConsultaMessage, setMassConsultaMessage] = useState("");

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cep") {
      formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length > 8) {
        formattedValue = formattedValue.substring(0, 8);
      }
    }
    if (name === "uf") {
      formattedValue = value.toUpperCase().substring(0, 2);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setResultado(null);
    setMassConsultaMessage("");

    let payload = {};
    let isFormValid = true;
    let validationErrorMessage = "";

    if (activeForm === "cep") {
      if (formData.cep.length !== 8) {
        validationErrorMessage =
          "Por favor, insira um CEP válido com 8 dígitos.";
        isFormValid = false;
      } else {
        payload = {
          tipo_consulta: "endereco",
          parametro_consulta: formData.cep,
          origem: "manual",
        };
      }
    } else if (activeForm === "chaves") {
      if (
        !formData.rua.trim() &&
        !formData.bairro.trim() &&
        !formData.cidade.trim() &&
        !formData.uf.trim()
      ) {
        validationErrorMessage =
          "Por favor, preencha pelo menos um campo para busca de endereço.";
        isFormValid = false;
      } else {
        payload = {
          tipo_consulta: "busca_endereco_alternativa",
          parametro_consulta: JSON.stringify({
            rua: formData.rua,
            bairro: formData.bairro,
            cidade: formData.cidade,
            uf: formData.uf,
          }),
          origem: "manual",
        };
      }
    } else {
      setLoading(false);
      return;
    }

    if (!isFormValid) {
      setError(validationErrorMessage);
      setLoading(false);
      return;
    }

    try {
      const response = await ConsultaService.realizarConsulta(payload);
      setResultado(response);
      
      if (
        response.mensagem === "Consulta realizada com sucesso." &&
        response.resultado_api
      ) {
        setMessage("Consulta realizada com sucesso!");
      } else {
        setError(response.mensagem || "Resposta inesperada da API.");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Erro ao realizar consulta de endereço.";
      setError(errorMessage);
      console.error(
        "Erro na consulta de endereço individual:",
        err.response?.data || err
      );
    } finally {
      setLoading(false);
    }
  };

 
  const handleMassFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setMassConsultaMessage("Por favor, selecione um arquivo para upload.");
      // Adicione um console.log para depuração
      console.log("Nenhum arquivo selecionado.");
      return;
    }

    setLoading(true);
    setError(null);
    setResultado(null);
    setMessage(null);
    setMassConsultaMessage("Lendo planilha e preparando para consulta...");
    

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0]; // Pega a primeira aba da planilha
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet); // Converte para array de objetos JSON

        
        // Certifique-se de que cada objeto tem a chave 'CEP'
        const cepsParaConsulta = jsonData.map((row) => ({
          // Supondo que a coluna na planilha se chame 'CEP' (maiúsculas)
          CEP: String(row.CEP || "").replace(/\D/g, ""), // Remove não-dígitos e garante string
        }));

        // Filtra CEPs vazios ou inválidos se necessário
        const cepsValidos = cepsParaConsulta.filter(item => item.CEP && item.CEP.length === 8);

        if (cepsValidos.length === 0) {
            setMassConsultaMessage("Nenhum CEP válido encontrado na planilha. Verifique a coluna 'CEP'.");
            setLoading(false);
            return;
        }

      

        // --- Obtém o token de autenticação do localStorage ---
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setMassConsultaMessage(
            "Erro: Token de autenticação não encontrado. Faça login novamente."
          );
          setLoading(false);
          return;
        }

        const requestBody = {
          ceps: cepsValidos, // Nome da chave que seu backend espera (ex: 'ceps')
          origem_planilha: true, // Flag para indicar que a requisição veio da planilha
        };

        setMassConsultaMessage("Enviando CEPs para processamento em massa...");
      
        const response = await fetch(
          `${DJANGO_BACKEND_BASE_URL}/processar-cep-planilha/`, // Ajuste este endpoint no Django
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (response.ok) {
          const blob = await response.blob(); // O backend retorna um Blob (arquivo XLSX)
          const url = window.URL.createObjectURL(new Blob([blob]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "planilha-resultado-ceps.xlsx"); // Nome do arquivo a ser baixado
          document.body.appendChild(link);
          link.click(); // Simula o clique para iniciar o download
          link.parentNode.removeChild(link); // Remove o link após o download
          setMassConsultaMessage(
            "Processamento concluído! O download da planilha de resultados iniciou."
          );
          
        } else {
          let errorText = await response.text();
          try {
            const errorJson = JSON.parse(errorText);
            errorText = errorJson.detail || errorJson.message || errorText;
          } catch (e) {
            // Se não for JSON, use o texto puro
          }
          console.error("Erro ao enviar planilha para o backend:", errorText);
          setMassConsultaMessage(
            `Erro ao processar a planilha: ${errorText || "Erro desconhecido."}`
          );
        }
      } catch (err) {
        console.error("Erro na comunicação ou processamento do arquivo:", err);
        setMassConsultaMessage(
          `Erro inesperado: ${
            err.message || "Verifique sua conexão e o formato do arquivo."
          }`
        );
      } finally {
        setLoading(false);
        // Limpa o valor do input file para permitir o re-upload do mesmo arquivo
        event.target.value = null;
      }
    };

    reader.readAsArrayBuffer(file); // Lê o arquivo como um ArrayBuffer
  };

  const handleDownloadModel = async () => {
    setLoading(true);
    setMassConsultaMessage("Baixando planilha modelo...");
    try {
      const response = await fetch(
        `${DJANGO_BACKEND_BASE_URL}/planilha-modelo-cep/`,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "modelo-cep.xlsx");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        setMassConsultaMessage("Download do modelo concluído.");
      } else {
        const errorText = await response.text();
        console.error("Erro ao baixar modelo:", errorText);
        setMassConsultaMessage(
          `Erro ao baixar modelo: ${errorText || "Erro desconhecido."}`
        );
      }
    } catch (err) {
      console.error("Erro na comunicação:", err);
      setMassConsultaMessage(
        "Erro na comunicação com o servidor para baixar o modelo."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetFormState = () => {
    setFormData({ cep: "", rua: "", bairro: "", cidade: "", uf: "" });
    setError(null);
    setMessage(null);
    setResultado(null);
    setMassConsultaMessage("");
  };


  // ==============================================================================
  //                                   HTML
  // ==============================================================================


  return (
    <div className="consulta-container">
      <h2 className="titulo-pagina">Escolha a opção de consulta:</h2>

      <div className="card-options-wrapper">
        <div
          className={`card card-option ${activeForm === "cep" ? "active" : ""}`}
          onClick={() => {
            setActiveForm("cep");
            resetFormState();
          }}
        >
          <div className="icon-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              fill="white"
              className="bi bi-geo-alt-fill"
              viewBox="0 0 16 16"
            >
              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"></path>
            </svg>
          </div>
          <h5>Consulta por CEP</h5>
        </div>

        <div
          className={`card card-option ${
            activeForm === "chaves" ? "active" : ""
          }`}
          onClick={() => {
            setActiveForm("chaves");
            resetFormState();
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

        {/* Card Consulta em Massa */}
        <div
          className={`card card-option ${
            activeForm === "massa" ? "active" : ""
          }`}
          onClick={() => {
            setActiveForm("massa");
            resetFormState();
          }}
        >
          <div className="icon-container">
            <FileSpreadsheet size={35} />
          </div>
          <h5>Consulta em Massa (CEP)</h5>
        </div>
      </div>

      {activeForm === "cep" && (
        <form className="form-container" onSubmit={handleSubmit}>
          <label htmlFor="cep">Digite o CEP para ser localizado</label>
          <input
            type="text"
            id="cep"
            name="cep"
            value={formData.cep}
            onChange={handleFormChange}
            placeholder="Digite o CEP (apenas números)"
            required
          />
          <button type="submit" disabled={loading || formData.cep.length !== 8}>
            {loading ? "Consultando..." : "Consultar"}
          </button>
          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}
        </form>
      )}

      {activeForm === "chaves" && (
        <form className="form-container" onSubmit={handleSubmit}>
          <label htmlFor="rua">Rua:</label>
          <input
            type="text"
            id="rua"
            name="rua"
            value={formData.rua}
            onChange={handleFormChange}
            placeholder="Digite o nome da rua"
          />
          <label htmlFor="bairro">Bairro:</label>
          <input
            type="text"
            id="bairro"
            name="bairro"
            value={formData.bairro}
            onChange={handleFormChange}
            placeholder="Digite o nome do bairro"
          />
          <label htmlFor="cidade">Cidade:</label>
          <input
            type="text"
            id="cidade"
            name="cidade"
            value={formData.cidade}
            onChange={handleFormChange}
            placeholder="Digite a cidade"
          />
          <label htmlFor="uf">UF:</label>
          <input
            type="text"
            id="uf"
            name="uf"
            value={formData.uf}
            onChange={handleFormChange}
            placeholder="Digite o Estado (ex: RJ)"
            maxLength="2"
          />
          <button
            type="submit"
            disabled={
              loading ||
              (!formData.rua.trim() &&
                !formData.bairro.trim() &&
                !formData.cidade.trim() &&
                !formData.uf.trim())
            }
          >
            {loading ? "Consultando..." : "Consultar"}
          </button>
          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}
        </form>
      )}

      {/* Conteúdo Consulta em Massa (CEP) */}
      {activeForm === "massa" && (
        <div className="form-massa-container">
          <button
            type="button"
            onClick={() => document.getElementById("input-massa-cep").click()}
            disabled={loading}
          >
            Importar Planilha de CEPs
          </button>
          <button
            type="button"
            onClick={handleDownloadModel}
            disabled={loading}
          >
            Baixar Planilha Modelo (CEP)
          </button>
          <input
            type="file"
            id="input-massa-cep"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            onChange={handleMassFileUpload}
          />
          {loading && <p>Processando planilha...</p>}
          {error && <p className="error-message">{error}</p>}
          {massConsultaMessage && (
            <p
              className={`message ${
                massConsultaMessage.includes("Erro") ? "error" : "success"
              }`}
            >
              {massConsultaMessage}
            </p>
          )}
        </div>
      )}

      {/* Exibição do resultado da consulta individual */}
      {activeForm !== "massa" && resultado?.resultado_api && (
        <div className="card-resultado">
          <h4>Resultado da busca realizada</h4>

          <label>CEP:</label>
          <input
            type="text"
            value={resultado.resultado_api.cep || "N/A"}
            disabled
          />

          <label>Logradouro:</label>
          <input
            type="text"
            value={resultado.resultado_api.street || "N/A"}
            disabled
          />

          <label>Bairro:</label>
          <input
            type="text"
            value={resultado.resultado_api.neighborhood || "N/A"}
            disabled
          />

          <label>Cidade:</label>
          <input
            type="text"
            value={resultado.resultado_api.city || "N/A"}
            disabled
          />

          <label>UF:</label>
          <input type="text" value={resultado.resultado_api.state || "N/A"} disabled />

          <label>Complemento:</label>
          <input
            type="text"
            value={resultado.resultado_api.complement || "N/A"}
            disabled
          />
        </div>
      )}
    </div>
  );
};

export default ConsultaEnd;