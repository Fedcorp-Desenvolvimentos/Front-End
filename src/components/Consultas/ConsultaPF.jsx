import React, { useState } from "react";
import * as XLSX from "xlsx"; // Importe a biblioteca XLSX
import "../styles/Consulta.css";
import { ConsultaService } from "../../services/consultaService"; // Assumindo que este serviço será atualizado para PF
import { FileSpreadsheet } from "lucide-react"; // Ícone para consulta em massa

const ConsultaPF = () => {
  const [activeForm, setActiveForm] = useState("cpf"); // Inicia com 'cpf'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);

  const [formData, setFormData] = useState({
    cpf: "",
    nome: "",
    dataNascimento: "",
    motherName: "",
    fatherName: "", 
  });

  // Estado para mensagens de feedback específicas da consulta em massa
  const [massConsultaMessage, setMassConsultaMessage] = useState("");

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cpf") {
      // Remove tudo que não for dígito e limita a 11 caracteres
      formattedValue = value.replace(/\D/g, "").substring(0, 11);
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

    let payload = {};
    let isFormValid = true;
    let validationErrorMessage = "";

    if (activeForm === "cpf") {
      if (formData.cpf.length !== 11) {
        validationErrorMessage =
          "Por favor, insira um CPF válido com 11 dígitos.";
        isFormValid = false;
      } else {
        payload = {
          tipo_consulta: "cpf",
          parametro_consulta: formData.cpf,
        };
      }
    } else if (activeForm === "chaves") {
      // Verifica se pelo menos o campo nome foi preenchido para a consulta por chaves
      if (!formData.nome.trim()) {
        validationErrorMessage = "Por favor, preencha o campo Nome.";
        isFormValid = false;
      } else {
        // Formata a data de nascimento para dd/MM/yyyy
        const formattedBirthDate = formData.dataNascimento
          ? new Date(formData.dataNascimento).toLocaleDateString("pt-BR")
          : "";

        payload = {
          tipo_consulta: "cpf_alternativa",
          parametro_consulta: JSON.stringify({
            Datasets: "basic_data",
            q: `name{${formData.nome}}, birthdate{${formattedBirthDate}},dateformat{dd/MM/yyyy}, mothername{${formData.motherName}}, fathername{${formData.fatherName}}`,
            Limit: 5,
          }),
        };
      }
    }

    if (!isFormValid) {
      setError(validationErrorMessage);
      setLoading(false);
      return;
    }

    try {
      // ConsultaService já deve lidar com a autenticação via cookie HttpOnly
      const response = await ConsultaService.realizarConsulta(payload);
      setResultado(response);
      console.log("Resultado da consulta PF:", response);
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Erro ao realizar consulta.";
      setError(errorMessage);
      console.error("Erro na consulta PF:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA ATUALIZADA PARA CONSULTA EM MASSA ---

  // Função para lidar com o upload do arquivo Excel
  const handleMassFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setMassConsultaMessage("Por favor, selecione um arquivo para upload.");
      return;
    }

    setLoading(true);
    setError(null);
    setResultado(null); // Limpa resultados de consultas individuais
    setMassConsultaMessage("Lendo planilha e preparando para consulta...");

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const cpfsParaConsulta = jsonData.map((row) => ({
          // Garante que 'CPF' é uma string e remove caracteres não numéricos
          CPF: String(row.CPF || "").replace(/\D/g, ""),
        }));

        const cpfsValidos = cpfsParaConsulta.filter(
          (item) => item.CPF.length === 11
        );

        if (cpfsValidos.length === 0) {
          setMassConsultaMessage(
            "Nenhum CPF válido encontrado na planilha. Verifique a coluna 'CPF'."
          );
          setLoading(false);
          // Limpa o input file para que o mesmo arquivo possa ser selecionado novamente
          if (event.target) event.target.value = null;
          return;
        }

        const requestBody = {
          cpfs: cpfsValidos,
          origem: "planilha", // Ajuste para consistência com o backend (underscore)
        };

        setMassConsultaMessage(
          `Enviando ${cpfsValidos.length} CPFs para processamento em massa...`
        );

        // Usar o serviço ConsultaService para processar a planilha de CPF
        const response = await ConsultaService.processarPlanilhaCPF(
          requestBody
        );

        const blob = response; // ConsultaService já deve retornar o blob
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "planilha-resultado-cpf.xlsx");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link); // Limpa o elemento <a> após o download
        setMassConsultaMessage(
          "Processamento concluído! O download da planilha de resultados iniciou."
        );
      } catch (err) {
        console.error("Erro na comunicação ou processamento do arquivo:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Erro inesperado: Verifique sua conexão e o formato do arquivo.";
        setError(`Erro ao processar a planilha: ${errorMessage}`); // Usa setError para exibir na UI
        setMassConsultaMessage(""); // Limpa a mensagem de processamento se der erro
      } finally {
        setLoading(false);
        // Limpa o input file para permitir novo upload
        if (event.target) {
          event.target.value = null;
        }
      }
    };
    reader.readAsArrayBuffer(file); // Inicia a leitura do arquivo
  };

  // Função para baixar a planilha modelo de CPF
  const handleDownloadModel = async () => {
    setLoading(true);
    setError(null); // Limpa erros anteriores
    setMassConsultaMessage("Baixando planilha modelo de CPF...");
    try {
      // Usar o serviço ConsultaService para baixar a planilha modelo de CPF
      const response = await ConsultaService.baixarPlanilhaModeloCPF();

      const blob = response; // ConsultaService já deve retornar o blob
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "modelo-cpf.xlsx");
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
      setError(`Erro ao baixar modelo: ${errorMessage}`); // Usa setError para exibir na UI
      setMassConsultaMessage(""); // Limpa a mensagem de processamento se der erro
    } finally {
      setLoading(false);
    }
  };

  // ==============================================================================
  //                                    HTML
  // ==============================================================================
  return (
    <div className="consulta-container">
      <h2 className="titulo-pagina">Escolha a opção de consulta:</h2>

      <div className="card-options-wrapper">
        {/* Card Consulta por CPF */}
        <div
          className={`card card-option ${
            activeForm === "cpf" ? "active" : ""
          }`}
          onClick={() => {
            setActiveForm("cpf");
            setFormData({ ...formData, cpf: "" }); // Limpa o CPF ao trocar
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
              className="bi bi-person-badge"
              viewBox="0 0 16 16"
            >
              <path d="M6.5 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zM11 5.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5z" />
              <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
              <path d="M11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
              <path d="M8 9.5a2.5 2.5 0 0 0-2.5 2.5V14h5v-2A2.5 2.5 0 0 0 8 9.5" />
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
              cpf: "", // Limpa o CPF
              nome: "",
              dataNascimento: "",
              motherName: "",
              fatherName: "",
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
            required // Nome agora é obrigatório
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
          <label htmlFor="motherName">Nome da Mãe</label>
          <input
            type="text"
            id="motherName"
            name="motherName"
            value={formData.motherName}
            onChange={handleFormChange}
            placeholder="Digite o nome da mãe"
            disabled={loading}
          />
          <label htmlFor="fatherName">Nome do Pai</label>
          <input
            type="text"
            id="fatherName"
            name="fatherName"
            value={formData.fatherName}
            onChange={handleFormChange}
            placeholder="Digite o nome do pai"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !formData.nome.trim()}>
            Consultar
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      )}

      {/* Conteúdo Consulta em Massa (ADAPTADO PARA CPF) */}
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
            Importar Planilha de CPFs
          </button>
          <button
            type="button"
            onClick={handleDownloadModel}
            disabled={loading}
          >
            Baixar Planilha Modelo
          </button>

          {loading && (
            <div className="loading-indicator">
              <div className="spinner"></div>{" "}
              <p>{massConsultaMessage || "Processando..."}</p>{" "}
            </div>
          )}

          {!loading && massConsultaMessage && (
            <p className="message">{massConsultaMessage}</p>
          )}
          {/* Mostra erros da consulta em massa aqui também */}
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
              // Acesse BasicData de forma mais segura
              const resultItem = resultado.resultado_api.Result[0];
              const basicData = resultItem?.BasicData || {};
              // Acesse o CommonName de forma segura
              const commonName = basicData.Aliases?.CommonName || "N/A";

              if (!Object.keys(basicData).length && !commonName) {
                // Verifica se basicData está vazio e commonName é N/A
                return <p>Dados básicos do CPF não disponíveis na resposta.</p>;
              }

              return (
                <>
                  <label>Nome Completo:</label>
                  <input type="text" value={basicData.Name || "N/A"} disabled />

                  <label>CPF:</label>
                  <input
                    type="text"
                    value={basicData.TaxIdNumber || "N/A"}
                    disabled
                  />

                  <label>Situação Cadastral:</label>
                  <input
                    type="text"
                    value={basicData.TaxIdStatus || "N/A"}
                    disabled
                  />

                  <label>Data de Nascimento:</label>
                  <input
                    type="text"
                    // Formata a data se existir
                    value={
                      basicData.BirthDate
                        ? new Date(basicData.BirthDate).toLocaleDateString()
                        : "N/A"
                    }
                    disabled
                  />

                  <label>Idade:</label>
                  <input type="text" value={basicData.Age || "N/A"} disabled />

                  <label>Nome da Mãe:</label>
                  <input
                    type="text"
                    value={basicData.MotherName || "N/A"}
                    disabled
                  />
                  <label>Nome do Pai:</label>
                  <input
                    type="text"
                    value={basicData.FatherName || "N/A"}
                    disabled
                  />
                  <label>Gênero:</label>
                  <input
                    type="text"
                    value={basicData.Gender || "N/A"}
                    disabled
                  />

                  <label>Nome Comum (Alias):</label>
                  <input type="text" value={commonName} disabled />

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