import React, { useState } from 'react';
import '../styles/Consulta.css'; // Verifique o caminho
import { ConsultaService } from '../../services/consultaService'; // Verifique o caminho
import { FileSpreadsheet } from 'lucide-react';
// import * as XLSX from 'xlsx'; // Não é necessário importar aqui, pois a leitura do arquivo é feita no backend

const ConsultaEnd = () => {
    // Estado para controlar qual formulário está ativo ('cep' ou 'chaves' ou 'massa')
    const [activeForm, setActiveForm] = useState('cep'); // Começa com o formulário de CEP ativo
    
    // Estados para feedback da requisição
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null); // Para mensagens de sucesso de upload/download
    const [resultado, setResultado] = useState(null); // Para o resultado da consulta individual

    // Estado para os dados do formulário de consulta individual (CEP e Chaves Alternativas)
    const [formData, setFormData] = useState({
        cep: '',
        rua: '',
        bairro: '',
        cidade: '',
        uf: '',
    });

    // Handler para os inputs de formulário (agora mais genérico para todos os campos do formData)
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        // Formatação específica para o campo 'cep'
        if (name === 'cep') {
            formattedValue = value.replace(/\D/g, ''); // Remove tudo que não for dígito
            if (formattedValue.length > 8) { // Limita o tamanho para 8 dígitos
                formattedValue = formattedValue.substring(0, 8);
            }
        }
        // Formatação para UF (garante maiúsculas e limita a 2 caracteres)
        if (name === 'uf') {
            formattedValue = value.toUpperCase().substring(0, 2);
        }

        setFormData(prev => ({
            ...prev,
            [name]: formattedValue
        }));
    };

    // Handler principal para o envio de qualquer formulário individual (CEP ou Chaves Alternativas)
    const handleSubmit = async (event) => {
        event.preventDefault(); // Previne o comportamento padrão de recarregar a página
        setLoading(true);
        setError(null);
        setMessage(null); // Limpa mensagens de sucesso
        setResultado(null); // Limpa o resultado anterior

        let payload = {};
        let isFormValid = true;
        let validationErrorMessage = '';

        if (activeForm === 'cep') {
            // Lógica para o formulário de CEP
            if (formData.cep.length !== 8) {
                validationErrorMessage = 'Por favor, insira um CEP válido com 8 dígitos.';
                isFormValid = false;
            } else {
                payload = {
                    tipo_consulta: 'endereco', // Conforme sua API espera para consulta de CEP
                    parametro_consulta: formData.cep,
                    origem: 'manual' // Indica que a consulta é manual, não de planilha
                };
            }
        } else if (activeForm === 'chaves') {
            // Lógica para o formulário de Chaves Alternativas (endereço)
            if (!formData.rua.trim() && !formData.bairro.trim() && !formData.cidade.trim() && !formData.uf.trim()) {
                validationErrorMessage = 'Por favor, preencha pelo menos um campo para busca de endereço.';
                isFormValid = false;
            } else {
                payload = {
                    tipo_consulta: 'busca_endereco_alternativa', // Este NOVO tipo_consulta precisa ser suportado pelo backend!
                    parametro_consulta: JSON.stringify({ // Envia o objeto como string JSON
                        rua: formData.rua,
                        bairro: formData.bairro,
                        cidade: formData.cidade,
                        uf: formData.uf
                    }),
                    origem: 'manual' // Indica que a consulta é manual
                };
            }
        } else {
            // Se não for 'cep' nem 'chaves', não é um formulário de submissão direta
            setLoading(false);
            return; 
        }

        if (!isFormValid) {
            setError(validationErrorMessage);
            setLoading(false);
            return;
        }

        try {
            // Chama o serviço de consulta com o payload preparado
            const response = await ConsultaService.realizarConsulta(payload);
            setResultado(response); // Define o resultado para exibição individual
            console.log('Resultado da consulta de endereço individual:', response);
            if (response.mensagem === "Consulta realizada com sucesso." && response.resultado_api) {
                 setMessage('Consulta realizada com sucesso!');
            } else {
                 setError(response.mensagem || 'Resposta inesperada da API.');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Erro ao realizar consulta de endereço.';
            setError(errorMessage);
            console.error('Erro na consulta de endereço individual:', err.response?.data || err);
        } finally {
            setLoading(false);
        }
    };

    // Handler para upload de planilha de CEP (Consulta em Massa)
    const handleFileUpload = async (event) => {
        setLoading(true);
        setError(null);
        setMessage(null); // Limpa mensagens anteriores
        setResultado(null); // Limpa resultado de consulta individual

        const file = event.target.files[0];
        if (!file) {
            setError("Nenhum arquivo selecionado para upload.");
            setLoading(false);
            return;
        }

        // Criar um FormData para enviar o arquivo
        const formData = new FormData();
        formData.append('arquivo', file); // 'arquivo' deve corresponder ao nome esperado no backend (request.FILES['arquivo'])

        try {
            const token = localStorage.getItem('accessToken'); // Ou como você armazena seu token
            if (!token) {
                setError('Erro: Token de autenticação não encontrado. Faça login novamente.');
                setLoading(false);
                return;
            }

            // Faz a requisição POST para o backend com o arquivo
            const response = await fetch('/api/consultas/processar-cep-planilha/', { // Endpoint no seu Django
                method: 'POST',
                headers: {
                    // Não defina 'Content-Type': 'multipart/form-data' aqui, 
                    // o navegador faz isso automaticamente com FormData e boundary
                    'Authorization': `Bearer ${token}`, 
                },
                body: formData, // Envie o objeto FormData diretamente
            });

            if (!response.ok) { // Se a resposta não for 2xx (OK)
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.message || 'Erro ao processar planilha de CEP.');
            }

            // Se o backend retorna um arquivo Excel, o navegador irá tratar o download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'resultados_cep.xlsx'; // Nome do arquivo de resultado a ser baixado
            document.body.appendChild(a);
            a.click();
            a.remove(); // Remove o elemento 'a' após o clique
            window.URL.revokeObjectURL(url); // Libera o objeto URL

            setMessage('Planilha processada e baixada com sucesso!');

        } catch (err) {
            setError(err.message);
            console.error('Erro ao enviar/processar planilha de CEP:', err);
        } finally {
            setLoading(false);
            // Limpa o input de arquivo para permitir o re-upload do mesmo arquivo
            event.target.value = null; 
        }
    };

    // Função para limpar estados ao trocar de formulário
    const resetFormState = () => {
        setFormData({ cep: '', rua: '', bairro: '', cidade: '', uf: '' });
        setError(null);
        setMessage(null);
        setResultado(null);
    };

    return (
        <div className="consulta-container">
            <h2 className="titulo-pagina">Escolha a opção de consulta:</h2>

            <div className="card-options-wrapper">
                <div
                    className={`card card-option ${activeForm === 'cep' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveForm('cep');
                        resetFormState();
                    }}
                >
                    <div className="icon-container">
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="white"
                            className="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"></path>
                        </svg>
                    </div>
                    <h5>Consulta por CEP</h5>
                </div>

                <div
                    className={`card card-option ${activeForm === 'chaves' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveForm('chaves');
                        resetFormState();
                    }}
                >
                    <div className="icon-container">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 16 16">
                            <path d="M6.5 0A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0zm3 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z" />
                            <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1A2.5 2.5 0 0 1 9.5 5h-3A2.5 2.5 0 0 1 4 2.5zM10 8a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0zm-6 4a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0zm4-3a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1" />
                        </svg>
                    </div>
                    <h5>Chaves Alternativas</h5>
                </div>

                {/* Card Consulta em Massa */}
                <div
                    className={`card card-option ${activeForm === 'massa' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveForm('massa');
                        resetFormState();
                    }}
                >
                    <div className="icon-container">
                        <FileSpreadsheet size={35} />
                    </div>
                    <h5>Consulta em Massa (CEP)</h5>
                </div>
            </div>

            {/* Formulários de Consulta Individual */}
            {activeForm === 'cep' && (
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
                        {loading ? 'Consultando...' : 'Consultar'}
                    </button>
                    {error && <p className="error-message">{error}</p>}
                    {message && <p className="success-message">{message}</p>}
                </form>
            )}

            {activeForm === 'chaves' && (
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
                        disabled={loading || (!formData.rua.trim() && !formData.bairro.trim() && !formData.cidade.trim() && !formData.uf.trim())}
                    >
                        {loading ? 'Consultando...' : 'Consultar'}
                    </button>
                    {error && <p className="error-message">{error}</p>}
                    {message && <p className="success-message">{message}</p>}
                </form>
            )}

            {/* Conteúdo Consulta em Massa (CEP) */}
            {activeForm === 'massa' && (
                <div className="form-massa-container">
                    <button
                        type="button"
                        onClick={() => document.getElementById('input-massa-cep').click()}
                        disabled={loading}
                    >
                        Importar Planilha de CEPs
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            const link = document.createElement('a');
                            link.href = '/planilha-modelo-cep.xlsx'; // Certifique-se que esta URL está correta no Django
                            link.download = 'modelo_cep.xlsx';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        disabled={loading}
                    >
                        Baixar Planilha Modelo (CEP)
                    </button>
                    <input
                        type="file"
                        id="input-massa-cep"
                        accept=".xlsx, .xls"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                    />
                    {loading && <p>Processando planilha...</p>}
                    {error && <p className="error-message">{error}</p>}
                    {message && <p className="success-message">{message}</p>}
                </div>
            )}

            {/* Exibição do resultado da consulta individual */}
            {resultado?.resultado_api && (activeForm === 'cep' || activeForm === 'chaves') && (
                <div className="card-resultado">
                    <h4>Resultado da busca realizada</h4>

                    <label>Logradouro:</label>
                    <input type="text" value={resultado.resultado_api.street || ''} disabled />

                    <label>Bairro:</label>
                    <input type="text" value={resultado.resultado_api.neighborhood || ''} disabled />

                    <label>Cidade:</label>
                    <input type="text" value={resultado.resultado_api.city || ''} disabled />

                    <label>UF:</label>
                    <input type="text" value={resultado.resultado_api.state || ''} disabled />

                    <label>CEP:</label>
                    <input type="text" value={resultado.resultado_api.cep || ''} disabled />

                    <label>Complemento:</label>
                    <input type="text" value={resultado.resultado_api.complement || ''} disabled /> {/* Verifique a chave 'complement' ou 'complemento' */}

                    {/* Adicione outros campos que você possa querer exibir */}
                    {resultado.resultado_api.ibge && (
                        <>
                            <label>IBGE:</label>
                            <input type="text" value={resultado.resultado_api.ibge} disabled />
                        </>
                    )}
                    {resultado.resultado_api.gia && (
                        <>
                            <label>GIA:</label>
                            <input type="text" value={resultado.resultado_api.gia} disabled />
                        </>
                    )}
                    {resultado.resultado_api.ddd && (
                        <>
                            <label>DDD:</label>
                            <input type="text" value={resultado.resultado_api.ddd} disabled />
                        </>
                    )}
                    {resultado.resultado_api.siafi && (
                        <>
                            <label>SIAFI:</label>
                            <input type="text" value={resultado.resultado_api.siafi} disabled />
                        </>
                    )}
                </div>
            )}

        </div>
    );
};

export default ConsultaEnd;