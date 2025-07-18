import React, { useState } from "react";
import * as XLSX from "xlsx";
import "../styles/Consulta.css";
import { ConsultaService } from "../../services/consultaService"; 
import { FileSpreadsheet } from "lucide-react";

const ConsultaEnd = () => {
    const [activeForm, setActiveForm] = useState("cep");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
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
        setResultado(null); 
        setMassConsultaMessage(""); 

        let payload = {};
        let isFormValid = true;
        let validationErrorMessage = "";

        if (activeForm === "cep") {
            if (formData.cep.length !== 8) {
                validationErrorMessage = "Por favor, insira um CEP válido com 8 dígitos.";
                isFormValid = false;
            } else {
                payload = {
                    tipo_consulta: "endereco",
                    parametro_consulta: formData.cep,
                    origem: "manual",
                };
            }
        } else if (activeForm === "chaves") {
            if (!formData.uf.trim() || !formData.cidade.trim() || !formData.rua.trim()) {
                validationErrorMessage = "Para busca por chaves alternativas, os campos UF, Cidade e Rua são obrigatórios.";
                isFormValid = false;
            } else {
                payload = {
                    tipo_consulta: "cep_rua_cidade", 
                    parametro_consulta: JSON.stringify({
                        estado: formData.uf,
                        cidade: formData.cidade,
                        logradouro: formData.rua, 
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
            
            if (response.mensagem === "Consulta realizada com sucesso." && response.resultado_api) {
                setResultado(response); 
                console.log(response); 
            } else {
                setError(response.mensagem || "Resposta inesperada da API. Endereço não encontrado ou inválido.");
                setResultado(null); 
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

    const resetFormState = () => {
        setFormData({ cep: "", rua: "", bairro: "", cidade: "", uf: "" });
        setError(null);
        setResultado(null);
        setMassConsultaMessage("");
    };

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
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading || formData.cep.length !== 8}>
                        {loading ? "Consultando..." : "Consultar"}
                    </button>
                    {error && <p className="error-message">{error}</p>}
                </form>
            )}

            {activeForm === "chaves" && (
                <form className="form-container" onSubmit={handleSubmit}>
                    <p className="form-description">
                    </p>
                    <label htmlFor="uf">UF:</label>
                    <input
                        type="text"
                        id="uf"
                        name="uf"
                        value={formData.uf}
                        onChange={handleFormChange}
                        placeholder="Digite o Estado (ex: RJ)"
                        maxLength="2"
                        required
                        disabled={loading}
                    />
                    <label htmlFor="cidade">Cidade:</label>
                    <input
                        type="text"
                        id="cidade"
                        name="cidade"
                        value={formData.cidade}
                        onChange={handleFormChange}
                        placeholder="Digite a cidade"
                        required
                        disabled={loading}
                    />
                    <label htmlFor="rua">Rua:</label>
                    <input
                        type="text"
                        id="rua"
                        name="rua"
                        value={formData.rua}
                        onChange={handleFormChange}
                        placeholder="Digite o nome da rua"
                        required
                        disabled={loading}
                    />
                    <label htmlFor="bairro">Bairro (Opcional):</label>
                    <input
                        type="text"
                        id="bairro"
                        name="bairro"
                        value={formData.bairro}
                        onChange={handleFormChange}
                        placeholder="Digite o nome do bairro"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={
                            loading ||
                            !formData.uf.trim() ||
                            !formData.cidade.trim() ||
                            !formData.rua.trim()
                        }
                    >
                        {loading ? "Consultando..." : "Consultar"}
                    </button>
                    {error && <p className="error-message">{error}</p>}
                </form>
            )}
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
                        disabled={loading}
                    />
                    {loading && <p>Processando planilha...</p>}
                    {massConsultaMessage && (
                        <p
                            className={`message ${
                                massConsultaMessage.includes("Erro") ? "error" : ""
                            }`}
                        >
                            {massConsultaMessage}
                        </p>
                    )}
                    {error && <p className="error-message">{error}</p>}
                </div>
            )}
            {activeForm !== "massa" && resultado?.resultado_api && (
                <div className="card-resultado">
                    <h4>Resultado da busca realizada</h4>
                    {resultado.tipo_consulta === "endereco" && (
                        <>
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
                        </>
                    )}

                    {resultado.historico_salvo.tipo_consulta === "cep_rua_cidade" &&
                     Array.isArray(resultado.resultado_api.resultados_viacep) &&
                     resultado.resultado_api.resultados_viacep.length > 0 ? (
                        <>
                            {resultado.resultado_api.resultados_viacep.map((item, index) => (
                                <div key={index} className="resultado-item">
                                    <h5>Resultado {index + 1}</h5>
                                    <label>CEP:</label>
                                    <input
                                        type="text"
                                        value={item.cep || "N/A"}
                                        disabled
                                    />
                                    <label>Logradouro:</label>
                                    <input
                                        type="text"
                                        value={item.logradouro || "N/A"}
                                        disabled
                                    />
                                    <label>Bairro:</label>
                                    <input
                                        type="text"
                                        value={item.bairro || "N/A"}
                                        disabled
                                    />
                                    <label>Cidade:</label>
                                    <input
                                        type="text"
                                        value={item.localidade || "N/A"}
                                        disabled
                                    />
                                    <label>UF:</label>
                                    <input
                                        type="text"
                                        value={item.uf || "N/A"}
                                        disabled
                                    />
                                    <label>Complemento:</label>
                                    <input
                                        type="text"
                                        value={item.complemento || "N/A"}
                                        disabled
                                    />
                                    {index < resultado.resultado_api.resultados_viacep.length - 1 && (
                                        <hr className="result-separator" />
                                    )}
                                </div>
                            ))}
                        </>
                    ) : (
                     
                        resultado.tipo_consulta === "cep_rua_cidade" &&
                        resultado.resultado_api &&
                        (!Array.isArray(resultado.resultado_api.resultados_viacep) ||
                         resultado.resultado_api.resultados_viacep.length === 0) && (
                            <p className="no-results-message">
                                Nenhum endereço encontrado para os parâmetros fornecidos.
                            </p>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default ConsultaEnd;