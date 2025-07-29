import React, { useState, useEffect, useRef, useCallback } from "react";
import "../styles/Consulta.css";
import { ConsultaService } from "../../services/consultaService"; // Certifique-se de que o caminho está correto

const ConsultaSegurado = () => {
    const [activeForm, setActiveForm] = useState("vida");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resultado, setResultado] = useState(null);
    const [administradoraSuggestions, setAdministradoraSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1); // Para navegação por teclado
    const suggestionsRef = useRef(null); // Ref para detectar cliques fora das sugestões
    const debounceTimeout = useRef(null); // Ref para o debounce

    const initialFormData = {
        cpf: "",
        nome: "",
        posto: "",
        administradora: "", // Campo para o autocomplete
        endereco: "",
        cnpj: "",
        certificado: "",
    };

    const [formData, setFormData] = useState(initialFormData);

    // Efeito para fechar as sugestões ao clicar fora do componente de autocomplete
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
                setActiveIndex(-1); // Reseta o índice ativo
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Função para resetar o formulário e estados relacionados
    const resetFormAndState = useCallback(() => {
        setFormData(initialFormData);
        setError(null);
        setResultado(null);
        setAdministradoraSuggestions([]);
        setShowSuggestions(false);
        setActiveIndex(-1);
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
    }, []); // initialFormData é constante, então não precisa de dependência

    // Manipulador de mudança para campos de formulário genéricos (CPF, CNPJ, Nome, etc.)
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

    // Manipulador de mudança para o campo da Administradora com debounce
    const handleAdmFormChange = useCallback((e) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            administradora: value,
        }));
        setActiveIndex(-1); // Reseta o índice ativo ao digitar

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        if (value.length > 0) { // Inicia a busca após 1 caractere (ajustável)
            debounceTimeout.current = setTimeout(async () => {
                try {
                    // Chama o serviço passando o valor do input para o backend filtrar
                    // A API deve retornar um array de objetos, onde cada objeto tem uma propriedade 'NOME'
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
            }, 300); // Atraso de 300ms para debounce
        } else {
            setAdministradoraSuggestions([]); // Limpa as sugestões se o campo estiver vazio
            setShowSuggestions(false);
        }
    }, []); // Dependências: nenhuma, pois 'value' vem do evento e o timeout é gerenciado por ref.

    // Manipulador de clique em uma sugestão
    const handleSuggestionClick = useCallback((suggestion) => {
        setFormData((prev) => ({
            ...prev,
            administradora: suggestion.NOME, // Assumindo que a sugestão tem a propriedade 'NOME'
        }));
        setAdministradoraSuggestions([]); // Limpa as sugestões
        setShowSuggestions(false); // Esconde o dropdown
        setActiveIndex(-1); // Reseta o índice ativo
    }, []);

    // Manipulador de teclas para navegação nas sugestões (ArrowUp, ArrowDown, Enter, Escape)
    const handleKeyDown = useCallback((e) => {
        if (!showSuggestions || administradoraSuggestions.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault(); // Evita que o cursor se mova no input
                setActiveIndex((prevIndex) =>
                    prevIndex < administradoraSuggestions.length - 1 ? prevIndex + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault(); // Evita que o cursor se mova no input
                setActiveIndex((prevIndex) =>
                    prevIndex > 0 ? prevIndex - 1 : administradoraSuggestions.length - 1
                );
                break;
            case "Enter":
                if (activeIndex >= 0) {
                    e.preventDefault(); // Evita o submit do formulário
                    handleSuggestionClick(administradoraSuggestions[activeIndex]);
                } else {
                    // Se Enter for pressionado sem sugestão selecionada, pode-se optar por submeter
                    // ou fazer uma busca completa com o texto digitado. Aqui, apenas evita o erro.
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

    // Manipulador de submit do formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResultado(null);

        try {
            if (activeForm === "vida") {
                if (!formData.cpf) {
                    throw new Error("CPF é obrigatório para Consulta Vida.");
                }
                const response = await ConsultaService.consultarCpf(formData.cpf);
                setResultado(response);
                console.log("Resultado VIDA:", response);
            } else if (activeForm === "imoveis") {
                if (!formData.cnpj) {
                    throw new Error("CNPJ é obrigatório para Consulta Imóveis.");
                }
                const response = await ConsultaService.consultarCnpj(formData.cnpj);
                setResultado(response);
                console.log("Resultado IMÓVEIS:", response);
            }
        } catch (err) {
            const message =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                err.message ||
                "Erro ao realizar a consulta.";
            setError(message);
            console.error("Erro na consulta:", err);
        } finally {
            setLoading(false);
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
                            maxLength="11"
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
                                onKeyDown={handleKeyDown} // Adiciona o manipulador de teclado
                                placeholder="Digite a administradora"
                                disabled={loading}
                                onFocus={() => formData.administradora.length > 0 && setShowSuggestions(true)}
                                autoComplete="off" // Desabilita o autocomplete nativo do navegador
                                aria-autocomplete="list"
                                aria-controls="administradora-suggestions"
                                aria-activedescendant={activeIndex >= 0 ? `suggestion-item-${activeIndex}` : undefined}
                            />
                            {showSuggestions && administradoraSuggestions.length > 0 && (
                                <ul className="suggestions-list" id="administradora-suggestions" role="listbox">
                                    {administradoraSuggestions.map((suggestion, index) => (
                                        <li
                                            key={suggestion.id || suggestion.NOME || index} // Use um ID único se disponível, senão NOME ou index
                                            id={`suggestion-item-${index}`}
                                            className={index === activeIndex ? "active" : ""}
                                            onMouseDown={() => handleSuggestionClick(suggestion)} // onMouseDown para evitar perda de foco
                                            role="option"
                                            aria-selected={index === activeIndex}
                                        >
                                            {suggestion.NOME} {/* Assumindo que a propriedade é NOME */}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <label htmlFor="cnpj">CNPJ</label>
                        <input
                            type="text"
                            name="cnpj"
                            id="cnpj"
                            value={formData.cnpj}
                            onChange={handleFormChange}
                            placeholder="Digite o CNPJ"
                            disabled={loading}
                            maxLength="14"
                        />
                    </>
                )}

                {activeForm === "imoveis" && (
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
                            maxLength="11"
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

                        <label htmlFor="endereco">Endereço</label>
                        <input
                            type="text"
                            name="endereco"
                            id="endereco"
                            value={formData.endereco}
                            onChange={handleFormChange}
                            placeholder="Digite o endereço"
                            disabled={loading}
                        />

                        <label htmlFor="certificado">Certificado</label>
                        <input
                            type="text"
                            name="certificado"
                            id="certificado"
                            value={formData.certificado}
                            onChange={handleFormChange}
                            placeholder="Digite o certificado"
                            disabled={loading}
                        />

                        {/* Campo Administradora com Autocomplete (repetido para Imóveis) */}
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

                        <label htmlFor="cnpj">CNPJ</label>
                        <input
                            type="text"
                            name="cnpj"
                            id="cnpj"
                            value={formData.cnpj}
                            onChange={handleFormChange}
                            placeholder="Digite o CNPJ"
                            disabled={loading}
                            maxLength="14"
                        />
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
                </div>
            )}
        </div>
    );
};

export default ConsultaSegurado;