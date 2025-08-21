import React, { useState } from "react";
import "../styles/ComercialRegiao.css";


const ComercialRegiao = () => {
  const [form, setForm] = useState({
    uf: "",
    cidade: "",
    bairro: "",
    // raio: "", // pensar na possibilidade de filtro por distância
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [resultados, setResultados] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    setResultados([]);

    if (!form.uf || !form.cidade) {
      setErro("UF e Cidade são obrigatórios.");
      setLoading(false);
      return;
    }

    try {
      setTimeout(() => {
        setResultados([
        ]);
        setLoading(false);
      }, 1300);
    } catch (err) {
      setErro("Erro ao buscar empresas. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="comercial-regiao-container">
         <h2 className="comercial-title">
        <i className="bi bi-geo-alt-fill "></i> 
        Buscar por Região
      </h2>
      <form className="regiao-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>UF *</label>
          <input name="uf" value={form.uf} onChange={handleChange} maxLength={2} required />
        </div>
        <div className="form-row">
          <label>Cidade *</label>
          <input name="cidade" value={form.cidade} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <label>Bairro</label>
          <input name="bairro" value={form.bairro} onChange={handleChange} />
        </div>
        {/* Se quiser raio, descomente
        <div className="form-row">
          <label>Raio (km)</label>
          <input name="raio" value={form.raio} onChange={handleChange} type="number" min={1} />
        </div>
        */}
        <button type="submit" className="consulta-btn" disabled={loading}>
          {loading ? "Buscando..." : "Buscar"}
        </button>
        {erro && <p className="error-message">{erro}</p>}
      </form>

      <div className="resultados-regiao">
        {resultados.length > 0 && (
          <>
            <h3>Empresas encontradas:</h3>
            <ul className="regiao-list">
              {resultados.map((item, i) => (
                <li key={i} className="regiao-card">
                  <strong>{item.nome}</strong>
                  <p>Tipo: {item.tipo}</p>
                  <p>Endereço: {item.endereco}</p>
                  <p>Telefone: {item.telefone}</p>
                </li>
              ))}
            </ul>
          </>
        )}
        {!loading && resultados.length === 0 && (
          <p className="no-results-message">Nenhum resultado para os filtros informados.</p>
        )}
      </div>
    </div>
  );
};

export default ComercialRegiao;
