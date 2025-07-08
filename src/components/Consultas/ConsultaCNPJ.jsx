import React, { useState } from "react";
import * as XLSX from "xlsx"; // Importe a biblioteca XLSX
import "../styles/Consulta.css";
import { ConsultaService } from "../../services/consultaService";
import { FileSpreadsheet } from "lucide-react"; // Ícone para consulta em massa

const DJANGO_BACKEND_BASE_URL = "http://127.0.0.1:8000"
const ConsultaCNPJ = () => {
  const [cnpj, setCnpj] = useState("");
  const [activeForm, setActiveForm] = useState("cnpj");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [formData, setFormData] = useState({
    razaoSocial: "",
    uf: "",
    email: "",
    telefone: "",
  });

  // Estado para mensagens de feedback específicas da consulta em massa
  const [massConsultaMessage, setMassConsultaMessage] = useState("");

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
    setResultado(null); // Limpa o resultado da consulta anterior
    setMassConsultaMessage(""); // Limpa mensagens de consulta em massa

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
          // 'origem' não é passado para consultas individuais, se sua API diferenciar
          // origem: 'manual',
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
        payload = {
          tipo_consulta: "busca_cnpj_alternativa",
          parametro_consulta: JSON.stringify(formData),
          // origem: 'manual',
        };
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

  // --- NOVA LÓGICA PARA CONSULTA EM MASSA ---

  // Função para lidar com o upload do arquivo Excel
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
        const sheetName = workbook.SheetNames[0]; // Pega a primeira aba da planilha
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet); // Converte para array de objetos JSON

        

        // Certifique-se de que cada objeto tem a chave 'CNPJ'
        const cnpjsParaConsulta = jsonData.map((row) => ({
          CNPJ: String(row.CNPJ),
        }));

        // --- Obtém o token de autenticação do localStorage ---
        // SUBSTITUA 'yourAuthTokenKey' pela CHAVE REAL que você usa no localStorage
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setMassConsultaMessage(
            "Erro: Token de autenticação não encontrado. Faça login novamente."
          );
          setLoading(false);
          return;
        }

        const requestBody = {
          cnpjs: cnpjsParaConsulta,
          origem: "planilha",
        };

        setMassConsultaMessage("Enviando CNPJs para processamento em massa...");
        const response = await fetch(
          `${DJANGO_BACKEND_BASE_URL}/processar-cnpj-planilha/`,
          {
            // Endpoint que você configurou no Django
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
          link.setAttribute("download", "planilha-resultado.xlsx"); // Nome do arquivo a ser baixado
          document.body.appendChild(link);
          link.click(); // Simula o clique para iniciar o download
          link.parentNode.removeChild(link); // Remove o link após o download
          setMassConsultaMessage(
            "Processamento concluído! O download da planilha de resultados iniciou."
          );
        } else {
          const errorText = await response.text(); // Tenta ler a mensagem de erro como texto
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

  // Função para baixar a planilha modelo
  const handleDownloadModel = async () => {
    setLoading(true);
    setMassConsultaMessage("Baixando planilha modelo...");
    try {
      const response = await fetch(
        `${DJANGO_BACKEND_BASE_URL}/planilha-modelo-cnpj`,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "modelo-cnpj.xlsx");
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

  // ==============================================================================
  //                                   HTML
  // ==============================================================================
  return (
    <div className="consulta-container">
      <h2 className="titulo-pagina">Escolha a opção de consulta:</h2>

      <div className="card-options-wrapper">
        <div
          className={`card card-option ${
            activeForm === "cnpj" ? "active" : ""
          }`}
          onClick={() => {
            setActiveForm("cnpj");
            setError(null);
            setResultado(null);
            setMassConsultaMessage(""); // Limpa mensagens ao trocar de aba
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
          className={`card card-option ${
            activeForm === "chaves" ? "active" : ""
          }`}
          onClick={() => {
            setActiveForm("chaves");
            setError(null);
            setResultado(null);
            setMassConsultaMessage(""); // Limpa mensagens ao trocar de aba
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
          className={`card card-option ${
            activeForm === "massa" ? "active" : ""
          }`}
          onClick={() => {
            setActiveForm("massa");
            setError(null);
            setResultado(null);
            setMassConsultaMessage(""); // Limpa mensagens ao trocar de aba
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
            disabled={loading} // Desabilita enquanto estiver carregando
          />
          <button type="submit" disabled={loading || cnpj.length !== 14}>
            Consultar
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

          <label htmlFor="uf">UF</label>
          <input
            type="text"
            id="uf"
            name="uf"
            value={formData.uf}
            onChange={handleFormChange}
            placeholder="Digite a UF"
            maxLength="2"
            disabled={loading}
          />
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleFormChange}
            placeholder="Digite o e-mail"
            disabled={loading}
          />
          <label htmlFor="telefone">Telefone</label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleFormChange}
            placeholder="Digite o telefone"
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
            Consultar
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      )}

      {/* Conteúdo Consulta em Massa */}
      {activeForm === "massa" && (
        <div className="form-massa-container">
          {/* Oculta o input de arquivo e dispara-o através do clique do botão */}
          <input
            type="file"
            id="input-massa"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            onChange={handleMassFileUpload} // Atrela a nova função de upload aqui
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => document.getElementById("input-massa").click()} // Dispara o input de arquivo
            disabled={loading}
          >
            Importar Planilha de CNPJs
          </button>
          <button
            type="button"
            onClick={handleDownloadModel} // Atrela a nova função de download do modelo aqui
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

      {/* Exibição do resultado de consulta individual (CNPJ ou Chaves Alternativas) */}
      {activeForm !== "massa" && resultado?.resultado_api && (
        <div className="card-resultado">
          <h4>Resultado da busca realizada</h4>

          <label>Razão Social:</label>
          <input
            type="text"
            value={resultado.resultado_api.razao_social || ""}
            disabled
          />

          <label>CNPJ:</label>
          <input
            type="text"
            value={resultado.resultado_api.cnpj || ""}
            disabled
          />

          <label>Atividade:</label>
          <input
            type="text"
            value={resultado.resultado_api.cnae_fiscal_descricao || ""}
            disabled
          />

          <label>Endereço:</label>
          <input
            type="text"
            value={`${
              resultado.resultado_api.descricao_tipo_de_logradouro || ""
            } ${resultado.resultado_api.logradouro || ""}, ${
              resultado.resultado_api.numero || ""
            }`}
            disabled
          />

          <label>Bairro:</label>
          <input
            type="text"
            value={`${resultado.resultado_api.bairro}`}
            disabled
          />

          <label>Munícipio:</label>
          <input
            type="text"
            value={`${resultado.resultado_api.municipio}`}
            disabled
          />

          <label>UF:</label>
          <input type="text" value={`${resultado.resultado_api.uf}`} disabled />

          <label>CEP:</label>
          <input
            type="text"
            value={`${resultado.resultado_api.cep}`}
            disabled
          />

          <label>Situação Cadastral:</label>
          <input
            type="text"
            value={
              resultado.resultado_api.descricao_situacao_cadastral ||
              "Não informada"
            }
            disabled
          />
        </div>
      )}
    </div>
  );
};

export default ConsultaCNPJ;
