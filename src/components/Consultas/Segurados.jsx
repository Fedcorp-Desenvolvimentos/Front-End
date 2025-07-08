import React, { useState } from "react";
import "../styles/Consulta.css";
import { ConsultaService } from "../../services/consultaService";

const ConsultaSegurado = () => {
    const [activeForm, setActiveForm] = useState("vida");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resultado, setResultado] = useState(null);

    const [formData, setFormData] = useState({
        cpf: "",
        nome: "",
        posto: "",
        administradora: "",
        endereco: "",
        cnpj: "",
        certificado: "",
    });

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === "cpf") {
            formattedValue = value.replace(/\D/g, "").substring(0, 11);
        }

        setFormData((prev) => ({
            ...prev,
            [name]: formattedValue,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResultado(null);

        try {
            if (activeForm === "vida") {
                const response = await ConsultaService.consultarCpf(formData.cpf);
                setResultado(response);
                console.log("Resultado VIDA:", response);
            } else if (activeForm === "imoveis") {
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
            console.error("Erro:", err);
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
                        setFormData({
                            cpf: "",
                            nome: "",
                            posto: "",
                            administradora: "",
                            endereco: "",
                            cnpj: "",
                            certificado: "",
                        });
                        setError(null);
                        setResultado(null);
                    }}
                >
                    <div className="icon-container">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="white"
                            viewBox="0 0 16 16"
                        >
                            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                        </svg>
                    </div>
                    <h5>Consulta Vida</h5>
                </div>

                <div
                    className={`card card-option ${activeForm === "imoveis" ? "active" : ""}`}
                    onClick={() => {
                        setActiveForm("imoveis");
                        setFormData({
                            cpf: "",
                            nome: "",
                            posto: "",
                            administradora: "",
                            endereco: "",
                            cnpj: "",
                            certificado: "",
                        });
                        setError(null);
                        setResultado(null);
                    }}
                >
                    <div className="icon-container">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="white"
                            viewBox="0 0 16 16"
                        >
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

                        <label htmlFor="administradora">Administradora</label>
                        <input
                            type="text"
                            name="administradora"
                            id="administradora"
                            value={formData.administradora}
                            onChange={handleFormChange}
                            placeholder="Digite a administradora"
                            disabled={loading}
                        />

                        <label htmlFor="cnpj">CNPJ</label>
                        <input
                            type="text"
                            name="cnpj"
                            id="cnpj"
                            value={formData.cnpj}
                            onChange={handleFormChange}
                            placeholder="Digite o CNPJ"
                            disabled={loading}
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

                        <label htmlFor="administradora">Administradora</label>
                        <input
                            type="text"
                            name="administradora"
                            id="administradora"
                            value={formData.administradora}
                            onChange={handleFormChange}
                            placeholder="Digite a administradora"
                            disabled={loading}
                        />

                        <label htmlFor="cnpj">CNPJ</label>
                        <input
                            type="text"
                            name="cnpj"
                            id="cnpj"
                            value={formData.cnpj}
                            onChange={handleFormChange}
                            placeholder="Digite o CNPJ"
                            disabled={loading}
                        />
                    </>
                )}

                <button type="submit" disabled={loading}>Consultar</button>
                {error && <p className="error-message">{error}</p>}
            </form>

            {resultado && (
                <div className="card-resultado mt-4">
                    <h4>Resultado</h4>
                    <pre>{JSON.stringify(resultado, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default ConsultaSegurado;
