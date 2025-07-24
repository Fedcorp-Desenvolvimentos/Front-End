import React, { useState } from "react";
import "../styles/Comercial.css";
import "../styles/Conta.css"; // Para reutilizar estilos de modal customizado
import { ConsultaService } from "../../services/consultaService";
import { FaBuilding, FaSearch } from "react-icons/fa";

const ConsultaComercial = () => {
  const [form, setForm] = useState({ cnpj: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalPersonData, setModalPersonData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [file, setFile] = useState(null);
  const [bulkResults, setBulkResults] = useState([]);

  const handleCnpjChange = (e) => {
    const value = e.target.value;
    const onlyDigits = value.replace(/\D/g, "");
    setForm({ ...form, cnpj: onlyDigits.slice(0, 14) });
  };

  const handleSearch = async () => {
    setResult(null);
    setError(null);
    if (!form.cnpj) {
      setError("Por favor, digite um CNPJ.");
      return;
    }
    if (form.cnpj.length < 14) {
      setError("O CNPJ deve conter 14 dígitos.");
      return;
    }
    setLoading(true);
    try {
      const responseData = await ConsultaService.consultarComercial(form.cnpj);
      const found = responseData.resultado_api?.Result?.[0] || null;
      if (found) {
        setResult(found);
      } else {
        setError("Nenhum resultado de empresa encontrado para o CNPJ fornecido.");
      }
    } catch (err) {
      setError(err.message || "Ocorreu um erro ao consultar o CNPJ da empresa.");
    } finally {
      setLoading(false);
    }
  };

  const handlePersonClick = async (personData) => {
    const cpf = personData.RelatedEntityTaxIdNumber;
    if (!cpf || personData.RelatedEntityTaxIdType !== "CPF") {
      setModalError("CPF não disponível ou tipo de documento inválido para consulta de contato.");
      setShowModal(true);
      return;
    }
    setModalLoading(true);
    setModalError(null);
    setModalPersonData(null);
    try {
      const responseData = await ConsultaService.consultarContatoComercial(cpf);
      const regData = responseData.resultado_api?.Result?.[0]?.RegistrationData || null;
      if (regData) {
        setModalPersonData(regData);
      } else {
        setModalError("Nenhum dado de contato encontrado para esta pessoa.");
      }
    } catch (err) {
      setModalError(err.message || "Ocorreu um erro ao consultar os detalhes de contato.");
    } finally {
      setModalLoading(false);
      setShowModal(true);
    }
  };

  const renderFilteredRelationships = (relationships, title) => {
    if (!relationships?.length) return null;
    const filtered = relationships.filter(
      (rel) =>
        rel.RelationshipType === "QSA" ||
        rel.RelationshipType === "Ownership" ||
        rel.RelationshipType === "REPRESENTANTELEGAL"
    );
    if (!filtered.length) return null;
    return (
      <>
        <h6 className="rel-title">{title}:</h6>
        <ul className="rel-list">
          {filtered.map((person, idx) => (
            <li key={`${person.RelatedEntityTaxIdNumber}-${idx}`} className="rel-list-item">
              <div className="rel-info">
                <strong>{person.RelatedEntityName || "Nome N/A"}</strong><br/>
                <span className="rel-type">Tipo: {person.RelationshipType}</span><br/>
                <span className="rel-cpf">CPF: {person.RelatedEntityTaxIdNumber}</span>
              </div>
              <button
                className="btn-rel-details"
                onClick={() => handlePersonClick(person)}
                title="Consultar detalhes desta pessoa"
              >
                Ver Detalhes
              </button>
            </li>
          ))}
        </ul>
      </>
    );
  };

  const handleFileChange = (e) => setFile(e.target.files[0] || null);

  const handleBulkSearch = () => {
    if (!file) {
      alert("Selecione um arquivo CSV com CNPJs.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const lines = e.target.result.split("\n").map((l) => l.trim()).filter(Boolean);
      const results = [];
      for (const cnpj of lines) {
        try {
          const res = await ConsultaService.consultarComercial(cnpj);
          const emp = res.resultado_api?.Result?.[0] || null;
          results.push({ cnpj, empresa: emp, erro: !emp });
        } catch {
          results.push({ cnpj, empresa: null, erro: true });
        }
      }
      setBulkResults(results);
    };
    reader.readAsText(file);
  };

  return (
    <div className="comercial-page">
      {/* Header */}
      <div className="card-opcoes">
        <div className="icon-container">
          <FaBuilding className="icon-opcao" />
        </div>
        <h2 className="titulo-principal">Consulta Comercial</h2>
        <p className="opcao-texto">
          Preencha o CNPJ da empresa para consultar os dados dos sócios e representantes.
        </p>
      </div>

      {/* Flex Container com dois cards idênticos */}
      <div className="form-card-container">
        {/* Card Individual */}
        <div className="form-card">
          <div className="card-body">
            <label className="form-label">CNPJ:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Digite apenas os 14 dígitos do CNPJ"
              name="cnpj"
              value={form.cnpj}
              onChange={handleCnpjChange}
              maxLength="14"
            />
            <button
              className="btn-primary"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "Consultando..." : <><FaSearch className="btn-icon" /> Consultar</>}
            </button>
            {error && <div className="alert-erro mt-3">{error}</div>}
          </div>
        </div>

        {/* Card Consulta em Massa */}
        <div className="form-card">
          <div className="card-body">
            <label className="form-label">Consulta em massa:</label>
            <input
              type="file"
              className="form-control"
              accept=".csv"
              onChange={handleFileChange}
            />
            <button
              className="btn-primary"
              onClick={handleBulkSearch}
              disabled={loading}
            >
              {loading ? "Processando..." : <><FaSearch className="btn-icon" /> Consultar</>}
            </button>
            {bulkResults.length > 0 && (
              <div className="bulk-results mt-3">
                <h5>Resultados:</h5>
                <ul>
                  {bulkResults.map((item, idx) => (
                    <li key={idx}>
                      <strong>{item.cnpj}:</strong>{" "}
                      {item.erro
                        ? "Erro ao consultar"
                        : `Empresa ${item.empresa ? "encontrada" : "não encontrada"}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resultado Único renderizado abaixo */}
      {result && (
        <div className="form-card mt-4">
          <div className="card-body">
            {renderFilteredRelationships(
              result.Relationships.CurrentRelationships,
              "Sócios, Administradores e Representantes Legais"
            )}
            {(!result.Relationships.CurrentRelationships?.length) && (
              <p className="no-rel-msg">
                Nenhum sócio, administrador ou representante legal encontrado para este CNPJ.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Detalhes de Contato da Pessoa</h3>
            <button
              className="btn-icon modal-close"
              onClick={() => setShowModal(false)}
              title="Fechar"
            >
              ×
            </button>
            <div>
              {modalLoading && (
                <div className="modal-loading">
                  <div className="spinner"></div>
                  <p>Buscando detalhes de contato...</p>
                </div>
              )}
              {modalError && <div className="alert-erro">{modalError}</div>}
              {modalPersonData && !modalLoading && !modalError && (
                <div>
                  <h6>Informações Básicas:</h6>
                  <p><strong>Nome:</strong> {modalPersonData.BasicData?.Name || "N/A"}</p>
                  <p><strong>CPF:</strong> {modalPersonData.BasicData?.TaxIdNumber || "N/A"}</p>
                  <p><strong>Gênero:</strong> {modalPersonData.BasicData?.Gender || "N/A"}</p>
                  <p>
                    <strong>Data de Nascimento:</strong>{" "}
                    {modalPersonData.BasicData?.BirthDate
                      ? new Date(modalPersonData.BasicData.BirthDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p><strong>Nome da Mãe:</strong> {modalPersonData.BasicData?.MotherName || "N/A"}</p>
                  <p><strong>Status do CPF:</strong> {modalPersonData.BasicData?.TaxIdStatus || "N/A"}</p>

                  {/* E-mails */}
                  {modalPersonData.Emails && (
                    <>
                      <h6 className="mt-3">E-mails:</h6>
                      {modalPersonData.Emails.Primary?.EmailAddress && (
                        <p><strong>Principal:</strong> {modalPersonData.Emails.Primary.EmailAddress}</p>
                      )}
                      {modalPersonData.Emails.Secondary?.EmailAddress && (
                        <p><strong>Secundário:</strong> {modalPersonData.Emails.Secondary.EmailAddress}</p>
                      )}
                      {!modalPersonData.Emails.Primary?.EmailAddress &&
                        !modalPersonData.Emails.Secondary?.EmailAddress && (
                          <p>Nenhum e-mail disponível.</p>
                        )}
                    </>
                  )}

                  {/* Endereços */}
                  {modalPersonData.Addresses && (
                    <>
                      <h6 className="mt-3">Endereços:</h6>
                      {modalPersonData.Addresses.Primary && (
                        <p>
                          <strong>Principal:</strong>{" "}
                          {`${modalPersonData.Addresses.Primary.AddressMain || ""}, ${
                            modalPersonData.Addresses.Primary.Number || ""
                          } ${
                            modalPersonData.Addresses.Primary.Complement
                              ? "- " + modalPersonData.Addresses.Primary.Complement
                              : ""
                          }`}
                          <br />
                          {`${modalPersonData.Addresses.Primary.Neighborhood || ""}, ${
                            modalPersonData.Addresses.Primary.City || ""
                          }/${modalPersonData.Addresses.Primary.State || ""} - CEP: ${
                            modalPersonData.Addresses.Primary.ZipCode || ""
                          }`}
                        </p>
                      )}
                      {modalPersonData.Addresses.Secondary && (
                        <p>
                          <strong>Secundário:</strong>{" "}
                          {`${modalPersonData.Addresses.Secondary.AddressMain || ""}, ${
                            modalPersonData.Addresses.Secondary.Number || ""
                          } ${
                            modalPersonData.Addresses.Secondary.Complement
                              ? "- " + modalPersonData.Addresses.Secondary.Complement
                              : ""
                          }`}
                          <br />
                          {`${modalPersonData.Addresses.Secondary.Neighborhood || ""}, ${
                            modalPersonData.Addresses.Secondary.City || ""
                          }/${modalPersonData.Addresses.Secondary.State || ""} - CEP: ${
                            modalPersonData.Addresses.Secondary.ZipCode || ""
                          }`}
                        </p>
                      )}
                      {!modalPersonData.Addresses.Primary &&
                        !modalPersonData.Addresses.Secondary && (
                          <p>Nenhum endereço disponível.</p>
                        )}
                    </>
                  )}

                  {/* Telefones */}
                  {modalPersonData.Phones && (
                    <>
                      <h6 className="mt-3">Telefones:</h6>
                      {modalPersonData.Phones.Primary?.PhoneNumber && (
                        <p><strong>Principal:</strong> {modalPersonData.Phones.Primary.PhoneNumber}</p>
                      )}
                      {modalPersonData.Phones.Secondary?.PhoneNumber && (
                        <p><strong>Secundário:</strong> {modalPersonData.Phones.Secondary.PhoneNumber}</p>
                      )}
                      {!modalPersonData.Phones.Primary?.PhoneNumber &&
                        !modalPersonData.Phones.Secondary?.PhoneNumber && (
                          <p>Nenhum telefone disponível.</p>
                        )}
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => setShowModal(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultaComercial;
