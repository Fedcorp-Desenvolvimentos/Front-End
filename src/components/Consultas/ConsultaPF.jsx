import React, { useState } from "react";
// import * as XLSX from "xlsx"; // Importe a biblioteca XLSX
import "../styles/Consulta.css";
import { ConsultaService } from "../../services/consultaService";
import { FileSpreadsheet } from "lucide-react"; // Ícone para consulta em massa

// Certifique-se de que esta URL base está correta para seu backend Django
const DJANGO_BACKEND_BASE_URL = "http://127.0.0.1:8000/";

const ConsultaPF = () => {
  const [activeForm, setActiveForm] = useState("cpf"); // Inicia com 'cpf'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);

  const [formData, setFormData] = useState({
    cpf: "",
    nome: "",
    dataNascimento: "",
    uf: "",
    email: "",
    telefone: "",
  });

  // Estado para mensagens de feedback específicas da consulta em massa
  const [massConsultaMessage, setMassConsultaMessage] = useState("");

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cpf") {
      formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length > 11) {
        formattedValue = formattedValue.substring(0, 11);
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
    setResultado(null);
    setMassConsultaMessage(""); // Limpa mensagens de consulta em massa

    let isFormValid = true;
    let validationErrorMessage = "";

    // Lógica para Consulta por CPF (UNIFICADA)
    if (activeForm === "cpf") {
      if (formData.cpf.length !== 11) {
        validationErrorMessage =
          "Por favor, insira um CPF válido com 11 dígitos.";
        isFormValid = false;
      } else {
        try {
          const response = await ConsultaService.consultarCpf(formData.cpf);
          setResultado(response);
          console.log("Resultado da consulta de CPF:", response);
        } catch (err) {
          const errorMessage =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            err.message ||
            "Erro ao realizar consulta de CPF.";
          setError(errorMessage);
          console.error("Erro na consulta de CPF:", err.response?.data || err);
        } finally {
          setLoading(false);
        }
      }
    }
    // Lógica para Consulta por Chaves Alternativas (mantido como estava)
    else if (activeForm === "chaves") {
      if (
        !formData.nome.trim() &&
        !formData.dataNascimento.trim() &&
        !formData.uf.trim() &&
        !formData.email.trim() &&
        !formData.telefone.trim()
      ) {
        validationErrorMessage =
          "Por favor, preencha pelo menos um campo para busca de CPF por chaves alternativas.";
        isFormValid = false;
      } else {
        const payload = {
          tipo_consulta: "busca_cpf_alternativa",
          parametro_consulta: JSON.stringify({
            nome: formData.nome,
            dataNascimento: formData.dataNascimento,
            uf: formData.uf,
            email: formData.email,
            telefone: formData.telefone,
          }),
        };
        try {
          const response = await ConsultaService.realizarConsulta(payload);
          setResultado(response);
          console.log(
            "Resultado da consulta de CPF por chaves alternativas:",
            response
          );
        } catch (err) {
          const errorMessage =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            err.message ||
            "Erro ao realizar consulta de CPF por chaves alternativas.";
          setError(errorMessage);
          console.error(
            "Erro na consulta de CPF por chaves alternativas:",
            err.response?.data || err
          );
        } finally {
          setLoading(false);
        }
      }
    }

    if (!isFormValid && validationErrorMessage) {
      setError(validationErrorMessage);
      setLoading(false);
      return;
    }
  };

  // --- NOVA LÓGICA PARA CONSULTA EM MASSA (ADAPTADA PARA CPF) ---

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

        const cpfsParaConsulta = jsonData.map((row) => ({
          // Mude 'cpf' para 'CPF' (C maiúsculo) aqui
          CPF: String(row.CPF).replace(/\D/g, ""), // Assume que sua planilha tem uma coluna 'CPF'
        }));

        // Filtragem para CPFs válidos
        const cpfsValidos = cpfsParaConsulta.filter(
          (item) => item.CPF.length === 11
        );

        if (cpfsValidos.length === 0) {
          setMassConsultaMessage(
            "Nenhum CPF válido encontrado na planilha. Verifique a coluna 'CPF'."
          );
          setLoading(false);
          event.target.value = null; // Limpa o input
          return;
        }

        // --- Obtém o token de autenticação do localStorage ---
        const token = localStorage.getItem("accessToken"); // Use a chave correta
        if (!token) {
          setMassConsultaMessage(
            "Erro: Token de autenticação não encontrado. Faça login novamente."
          );
          setLoading(false);
          return;
        }

        const requestBody = {
          // Envia a lista de objetos, agora com a chave 'CPF' em maiúsculo
          cpfs: cpfsValidos, // Usar cpfsValidos após a filtragem
          origem_planilha: true,
        };

        setMassConsultaMessage(
          `Enviando ${cpfsParaConsulta.length} CPFs para processamento em massa...`
        );
        // Endpoint para processar CPFs em massa no seu backend Django
        const response = await fetch(
          `${DJANGO_BACKEND_BASE_URL}processar-cpf-planilha/`,
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
          link.setAttribute("download", "planilha-resultado-cpf.xlsx"); // Nome do arquivo a ser baixado
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

  // Função para baixar a planilha modelo de CPF
  const handleDownloadModel = async () => {
    setLoading(true);
    setMassConsultaMessage("Baixando planilha modelo de CPF...");
    try {
      // Endpoint para o modelo de planilha de CPF no seu backend Django
      const response = await fetch(
        `${DJANGO_BACKEND_BASE_URL}planilha-modelo-cpf`,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "modelo-cpf.xlsx"); // Nome do arquivo a ser baixado
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
  //                                   HTML
  // ==============================================================================
  return (
    <div className="consulta-container">
      <h2 className="titulo-pagina">Escolha a opção de consulta:</h2>

      <div className="card-options-wrapper">
        {/* Card Consulta por CPF (UNIFICADO) */}
        <div
          className={`card card-option ${activeForm === "cpf" ? "active" : ""}`}
          onClick={() => {
            setActiveForm("cpf");
            setFormData({ ...formData, cpf: "" });
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
              <path d="M12 1a1 1 0 0 1 1 1v10.755S12 11 8 11s-5 1.755-5 1.755V2a1 1 0 0 1 1-1zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
              <path d="M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
            </svg>
          </div>
          <h5>Consulta por CPF</h5>
        </div>

        {/* Card Chaves Alternativas */}
        <div
          className={`card card-option ${
            activeForm === "chaves" ? "active" : ""
          }`}
          onClick={() => {
            setActiveForm("chaves");
            setFormData({
              cpf: "",
              nome: "",
              dataNascimento: "",
              uf: "",
              email: "",
              telefone: "",
            });
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

        {/* Card Consulta em Massa */}
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

      {activeForm === "cpf" && (
        <form className="form-container" onSubmit={handleSubmit}>
          <label htmlFor="cpf-input">Digite o documento</label>
          <input
            type="text"
            id="cpf-input"
            name="cpf"
            value={formData.cpf}
            onChange={handleFormChange}
            placeholder="Digite o CPF (apenas números)"
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || formData.cpf.length !== 11}
          >
            Consultar
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      )}

      {activeForm === "chaves" && (
        <form className="form-container" onSubmit={handleSubmit}>
          <label htmlFor="nome">Nome</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleFormChange}
            placeholder="Digite o nome"
            disabled={loading}
          />
          <label htmlFor="dataNascimento">Data de Nascimento</label>
          <input
            type="date"
            id="dataNascimento"
            name="dataNascimento"
            value={formData.dataNascimento}
            onChange={handleFormChange}
            placeholder="DD/MM/AAAA"
            disabled={loading}
          />
          <label htmlFor="uf">UF</label>
          <input
            type="text"
            id="uf"
            name="uf"
            value={formData.uf}
            onChange={handleFormChange}
            placeholder="Digite a UF (ex: RJ)"
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
              (!formData.nome.trim() &&
                !formData.dataNascimento.trim() &&
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

    {/* Conteúdo Consulta em Massa (ADAPTADO PARA CPF) */}
      {activeForm === 'massa' && (
        <div className="form-massa-container">
          {/* Oculta o input de arquivo e dispara-o através do clique do botão */}
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
            disabled={loading} // Desabilita o botão enquanto carrega
          >
            Importar Planilha de CPFs
          </button>
          <button
            type="button"
            onClick={handleDownloadModel}
            disabled={loading} // Desabilita o botão enquanto carrega
          >
            Baixar Planilha Modelo
          </button>

          {/* Feedback Visual Aprimorado */}
          {loading && (
            <div className="loading-indicator">
              <div className="spinner"></div> {/* Adicione um spinner CSS aqui */}
              <p>{massConsultaMessage || 'Processando...'}</p> {/* Exibe a mensagem de progresso */}
            </div>
          )}

          {!loading && massConsultaMessage && ( // Só mostra a mensagem se não estiver mais carregando
            <p className="message">{massConsultaMessage}</p>
          )}
          {error && <p className="error-message">{error}</p>}
        </div>
      )}

      {/* Resultado da Consulta (para consultas individuais de CPF) */}
      {activeForm !== "massa" &&
        resultado?.resultado_api?.Result &&
        resultado.resultado_api.Result.length > 0 && (
          <div className="card-resultado">
            <h4>Resultado da busca realizada</h4>
            {(() => {
              const basicData = resultado.resultado_api.Result[0].BasicData;

              if (!basicData) {
                return <p>Dados básicos do CPF não disponíveis na resposta.</p>;
              }

              return (
                <>
                  <label>Nome:</label>
                  <input type="text" value={basicData.Name || "N/A"} disabled />

                  <label>CPF:</label>
                  <input
                    type="text"
                    value={basicData.TaxIdNumber || "N/A"}
                    disabled
                  />

                  <label>Idade:</label>
                  <input type="text" value={basicData.Age || "N/A"} disabled />

                  <label>Data de Nascimento:</label>
                  <input
                    type="text"
                    value={basicData.CapturedBirthDateFromRFSource || "N/A"}
                    disabled
                  />

                  <label>Filiação:</label>
                  <input
                    type="text"
                    value={basicData.MotherName || "N/A"}
                    disabled
                  />
                  <label>Situação Cadastral:</label>
                  <input
                    type="text"
                    value={basicData.TaxIdStatus || "N/A"}
                    disabled
                  />

                  <label>Indicação de Óbito:</label>
                  <input
                    type="text"
                    value={
                      basicData.HasObitIndication !== undefined
                        ? basicData.HasObitIndication
                          ? "Sim"
                          : "Não"
                        : "N/A"
                    }
                    disabled
                  />
                </>
              );
            })()}
          </div>
        )}
    </div>
  );
};

export default ConsultaPF;
