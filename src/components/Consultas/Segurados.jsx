import React, { useState, useEffect, useRef, useCallback } from "react";
import "../styles/Consulta.css";
import { ConsultaService } from "../../services/consultaService";

const ConsultaSegurado = () => {
    const [activeForm, setActiveForm] = useState("vida");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resultado, setResultado] = useState(null);
    const [administradoraSuggestions, setAdministradoraSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const suggestionsRef = useRef(null);
    const debounceTimeout = useRef(null);

    // Estados para paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [totalPages, setTotalPages] = useState(1);

    const initialFormData = {
        cpf: "",
        nome: "",
        posto: "",
        administradora: "",
        endereco: "",
        cnpj: "",
        certificado: "",
        endosso: "",
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
                setActiveIndex(-1);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const resetFormAndState = useCallback(() => {
        setFormData(initialFormData);
        setError(null);
        setResultado(null);
        setAdministradoraSuggestions([]);
        setShowSuggestions(false);
        setActiveIndex(-1);
        setCurrentPage(1);
        setTotalPages(1);
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
    }, [initialFormData]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === "cpf") {
            formattedValue = value.replace(/\D/g, "").substring(0, 11);
        } else if (name === "cnpj") {
            formattedValue = value.replace(/\D/g, "").substring(0, 14);
        }

        setFormData((prev) => ({
            ...prev,
            [name]: formattedValue,
        }));
    };

    const handleAdmFormChange = useCallback((e) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            administradora: value,
        }));
        setActiveIndex(-1);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        if (value.length > 0) {
            debounceTimeout.current = setTimeout(async () => {
                try {
                    const suggestions = await ConsultaService.getAdms(value);

                    console.log("Resposta da API (sugestões da administradora):", suggestions);

                    if (Array.isArray(suggestions)) {
                        setAdministradoraSuggestions(suggestions);
                        setShowSuggestions(suggestions.length > 0);
                    } else {
                        console.warn("ConsultaService.getAdms(value) não retornou um array. Verifique a estrutura da API.");
                        setAdministradoraSuggestions([]);
                        setShowSuggestions(false);
                    }
                } catch (err) {
                    console.error("Erro ao buscar administradoras:", err);
                    setAdministradoraSuggestions([]);
                    setShowSuggestions(false);
                }
            }, 300);
        } else {
            setAdministradoraSuggestions([]);
            setShowSuggestions(false);
        }
    }, []);

    const handleSuggestionClick = useCallback((suggestion) => {
        setFormData((prev) => ({
            ...prev,
            administradora: suggestion.NOME,
        }));
        setAdministradoraSuggestions([]);
        setShowSuggestions(false);
        setActiveIndex(-1);
    }, []);

    const handleKeyDown = useCallback((e) => {
        if (!showSuggestions || administradoraSuggestions.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setActiveIndex((prevIndex) =>
                    prevIndex < administradoraSuggestions.length - 1 ? prevIndex + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setActiveIndex((prevIndex) =>
                    prevIndex > 0 ? prevIndex - 1 : administradoraSuggestions.length - 1
                );
                break;
            case "Enter":
                if (activeIndex >= 0) {
                    e.preventDefault();
                    handleSuggestionClick(administradoraSuggestions[activeIndex]);
                } else {
                    handleSubmit(e);
                }
                break;
            case "Escape":
                setShowSuggestions(false);
                setActiveIndex(-1);
                break;
            default:
                break;
        }
    }, [showSuggestions, administradoraSuggestions, activeIndex, handleSuggestionClick]);

    const performConsulta = async (page = 1) => {
        setLoading(true);
        setError(null);
        setResultado(null);
        setCurrentPage(page);

        let parametroConsultaObj = {}; // Objeto temporário para construir os parâmetros

        if (activeForm === "vida") {
            parametroConsultaObj = {
                ...(formData.cpf && { cpf_cnpj: formData.cpf.replace(/\D/g, "") }),
                ...(formData.nome && { nome_segurado: formData.nome.toUpperCase() }),
                ...(formData.posto && { posto: formData.posto.toUpperCase() }),
                ...(formData.administradora && { administradora_nome: formData.administradora.toUpperCase() }),
            };

            const vidaFields = ['cpf', 'nome', 'posto', 'administradora'];
            const isVidaFormEmpty = vidaFields.every(field => !formData[field]);
            if (isVidaFormEmpty) {
                throw new Error("Pelo menos um dos campos (CPF, Nome, Posto ou Administradora) é obrigatório para Consulta Vida.");
            }

        } else if (activeForm === "imoveis") {
            parametroConsultaObj = {
                ...(formData.cpf && { cpf_cnpj: formData.cpf.replace(/\D/g, "") }),
                ...(formData.cnpj && { cpf_cnpj: formData.cnpj.replace(/\D/g, "") }),
                ...(formData.nome && { nome: formData.nome.toUpperCase() }),
                ...(formData.endereco && { endereco: formData.endereco.toUpperCase() }),
                ...(formData.certificado && { certificado: formData.certificado }),
                ...(formData.administradora && { administradora_nome: formData.administradora.toUpperCase() }),
                ...(formData.endosso && { endosso: formData.endosso.replace(/\D/g, "") }),
            };

            const imoveisFields = ['cpf', 'cnpj', 'nome', 'endereco', 'certificado', 'administradora', 'endosso'];
            const isImoveisFormEmpty = imoveisFields.every(field => !formData[field]);
            if (isImoveisFormEmpty) {
                throw new Error("Pelo menos um dos campos (CPF, CNPJ, Nome, Endereço, Certificado, Endosso ou Administradora) é obrigatório para Consulta Imóveis.");
            }
        }

        // Remove parâmetros de consulta que estão vazios ou nulos do objeto temporário
        for (const key in parametroConsultaObj) {
            if (parametroConsultaObj[key] === null || parametroConsultaObj[key] === '') {
                delete parametroConsultaObj[key];
            }
        }


        const parametroConsultaJsonString = JSON.stringify(parametroConsultaObj);

        let payload = {
            tipo_consulta: activeForm === "vida" ? "vida" : "incendio", 
            parametro_consulta: parametroConsultaJsonString, 
            page: page,
            page_size: pageSize,
            origem: "manual",
        };

        try {
            console.log(payload)
            const response = await ConsultaService.consultarSegurados(payload);
            setResultado(response.resultado_api);

            
            if (response.total_pages) {
                setTotalPages(response.total_pages);
                setCurrentPage(response.current_page || page);
            } else if (response.resultado_api && response.resultado_api.length > 0) {
                
                setTotalPages(page + 1);
            } else {
                setTotalPages(page); 
            }

            console.log("Resultado da Consulta Segurados:", response);
        } catch (err) {
            const message =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                err.message ||
                "Erro ao realizar a consulta.";
            setError(message);
            console.error("Erro na consulta de segurados:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await performConsulta(1);
    };

    const handlePageChange = (newPage) => {
        // Se houver totalPages vindo da API, use essa informação
        if (totalPages > 1 && newPage > 0 && newPage <= totalPages) {
            performConsulta(newPage);
        } else if (totalPages === 1 && newPage > currentPage && resultado && resultado.length === pageSize) {
            // Se totalPages não é conhecido ou é 1, mas a página atual está cheia, tente a próxima
            performConsulta(newPage);
        } else if (newPage < currentPage && newPage > 0) {
            // Permite ir para páginas anteriores
            performConsulta(newPage);
        }
    };

    return (
        <div className="consulta-container">
            <h2 className="titulo-pagina">Escolha o tipo de consulta:</h2>

            <div className="card-options-wrapper">
                <div
                    className={`card card-option ${activeForm === "vida" ? "active" : ""}`}
                    onClick={() => {
                        setActiveForm("vida");
                        resetFormAndState();
                    }}
                >
                    <div className="icon-container">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 16 16">
                            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                        </svg>
                    </div>
                    <h5>Consulta Vida</h5>
                </div>

                <div
                    className={`card card-option ${activeForm === "imoveis" ? "active" : ""}`}
                    onClick={() => {
                        setActiveForm("imoveis");
                        resetFormAndState();
                    }}
                >
                    <div className="icon-container">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 16 16">
                            <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 8H2v6.5a.5.5 0 0 0 .5.5H6v-4h4v4h3.5a.5.5 0 0 0 .5-.5V8h.5a.5.5 0 0 0 .354-.854l-6-6z" />
                        </svg>
                    </div>
                    <h5>Consulta Imóveis</h5>
                </div>
            </div>

            <form className="form-container" onSubmit={handleSubmit}>
                {activeForm === "vida" && (
                    <>
                        <label htmlFor="cpf">CPF</label>
                        <input
                            type="text"
                            name="cpf"
                            id="cpf"
                            value={formData.cpf}
                            onChange={handleFormChange}
                            placeholder="Digite o CPF"
                            disabled={loading}
                            maxLength="14"
                        />

                        <label htmlFor="nome">Nome</label>
                        <input
                            type="text"
                            name="nome"
                            id="nome"
                            value={formData.nome}
                            onChange={handleFormChange}
                            placeholder="Digite o nome"
                            disabled={loading}
                        />

                        <label htmlFor="posto">Posto</label>
                        <input
                            type="text"
                            name="posto"
                            id="posto"
                            value={formData.posto}
                            onChange={handleFormChange}
                            placeholder="Digite o posto"
                            disabled={loading}
                        />

                        {/* Campo Administradora com Autocomplete */}
                        <label htmlFor="administradora">Administradora</label>
                        <div
                            className="autocomplete-wrapper"
                            ref={suggestionsRef}
                            role="combobox"
                            aria-haspopup="listbox"
                            aria-expanded={showSuggestions && administradoraSuggestions.length > 0}
                        >
                            <input
                                type="text"
                                name="administradora"
                                id="administradora"
                                value={formData.administradora}
                                onChange={handleAdmFormChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Digite a administradora"
                                disabled={loading}
                                onFocus={() => formData.administradora.length > 0 && setShowSuggestions(true)}
                                autoComplete="off"
                                aria-autocomplete="list"
                                aria-controls="administradora-suggestions"
                                aria-activedescendant={activeIndex >= 0 ? `suggestion-item-${activeIndex}` : undefined}
                            />
                            {showSuggestions && administradoraSuggestions.length > 0 && (
                                <ul className="suggestions-list" id="administradora-suggestions" role="listbox">
                                    {administradoraSuggestions.map((suggestion, index) => (
                                        <li
                                            key={suggestion.id || suggestion.NOME || index}
                                            id={`suggestion-item-${index}`}
                                            className={index === activeIndex ? "active" : ""}
                                            onMouseDown={() => handleSuggestionClick(suggestion)}
                                            role="option"
                                            aria-selected={index === activeIndex}
                                        >
                                            {suggestion.NOME}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </>
                )}

                {activeForm === "imoveis" && (
                    <>
                        <label htmlFor="cpf">CPF (Opcional)</label>
                        <input
                            type="text"
                            name="cpf"
                            id="cpf"
                            value={formData.cpf}
                            onChange={handleFormChange}
                            placeholder="Digite o CPF"
                            disabled={loading}
                            maxLength="14"
                        />

                        <label htmlFor="cnpj">CNPJ (Opcional)</label>
                        <input
                            type="text"
                            name="cnpj"
                            id="cnpj"
                            value={formData.cnpj}
                            onChange={handleFormChange}
                            placeholder="Digite o CNPJ"
                            disabled={loading}
                            maxLength="18"
                        />

                        <label htmlFor="nome">Nome (Opcional)</label>
                        <input
                            type="text"
                            name="nome"
                            id="nome"
                            value={formData.nome}
                            onChange={handleFormChange}
                            placeholder="Digite o nome"
                            disabled={loading}
                        />

                        <label htmlFor="endereco">Endereço (Opcional)</label>
                        <input
                            type="text"
                            name="endereco"
                            id="endereco"
                            value={formData.endereco}
                            onChange={handleFormChange}
                            placeholder="Digite o endereço"
                            disabled={loading}
                        />

                        <label htmlFor="certificado">Certificado (Opcional)</label>
                        <input
                            type="text"
                            name="certificado"
                            id="certificado"
                            value={formData.certificado}
                            onChange={handleFormChange}
                            placeholder="Digite o certificado"
                            disabled={loading}
                        />

                        <label htmlFor="endosso">Endosso (Opcional)</label>
                        <input
                            type="text"
                            name="endosso"
                            id="endosso"
                            value={formData.endosso}
                            onChange={handleFormChange}
                            placeholder="Digite o endosso"
                            disabled={loading}
                        />

                        <label htmlFor="administradora">Administradora (Obrigatório se CPF/CNPJ/Endosso vazios)</label>
                        <div
                            className="autocomplete-wrapper"
                            ref={suggestionsRef}
                            role="combobox"
                            aria-haspopup="listbox"
                            aria-expanded={showSuggestions && administradoraSuggestions.length > 0}
                        >
                            <input
                                type="text"
                                name="administradora"
                                id="administradora"
                                value={formData.administradora}
                                onChange={handleAdmFormChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Digite a administradora"
                                disabled={loading}
                                onFocus={() => formData.administradora.length > 0 && setShowSuggestions(true)}
                                autoComplete="off"
                                aria-autocomplete="list"
                                aria-controls="administradora-suggestions"
                                aria-activedescendant={activeIndex >= 0 ? `suggestion-item-${activeIndex}` : undefined}
                            />
                            {showSuggestions && administradoraSuggestions.length > 0 && (
                                <ul className="suggestions-list" id="administradora-suggestions" role="listbox">
                                    {administradoraSuggestions.map((suggestion, index) => (
                                        <li
                                            key={suggestion.id || suggestion.NOME || index}
                                            id={`suggestion-item-${index}`}
                                            className={index === activeIndex ? "active" : ""}
                                            onMouseDown={() => handleSuggestionClick(suggestion)}
                                            role="option"
                                            aria-selected={index === activeIndex}
                                        >
                                            {suggestion.NOME}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? "Consultando..." : "Consultar"}
                </button>
                {error && <p className="error-message">{error}</p>}
            </form>

            {resultado && (
                <div className="card-resultado mt-4">
                    <h4>Resultado da Consulta</h4>
                    <pre>{JSON.stringify(resultado, null, 2)}</pre>

                    {(totalPages > 1 || (resultado && resultado.length === pageSize)) && (
                        <div className="pagination-controls">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || loading}
                            >
                                Página Anterior
                            </button>
                            <span>Página {currentPage} de {totalPages}</span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages && resultado.length < pageSize || loading}
                            >
                                Próxima Página
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ConsultaSegurado;