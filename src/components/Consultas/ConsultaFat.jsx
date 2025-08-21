import React, { useState } from 'react';
import "../styles/ConsultaFat.css";
// import { ConsultaService } from '../../../services/consultaService';

const ConsultaFatura = () => {
  const [fatura, setFatura] = useState('');
  const [administradora, setAdministradora] = useState('');
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConsulta = async (e) => {
    e.preventDefault();
    setErro('');
    setResultado(null);

    if (!fatura && !administradora) {
      setErro('Preencha Fatura ou Administradora para consultar.');
      return;
    }
    setLoading(true);
    try {
      // Chamada de serviço, ajustar com a api
      const resposta = await ConsultaService.consultarFatura({ fatura, administradora });
      setResultado(resposta);
    } catch (err) {
      setErro('Erro ao consultar faturas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (setter, otherSetter) => (e) => {
    setter(e.target.value);
    if (e.target.value) otherSetter(''); 
  };

  return (
    <div className="consulta-fatura-container">
      <h1 className="consultas-title">
        <i className="bi-clipboard-data"></i> Consulta de Faturas
      </h1>
      <form className="form-fatura" onSubmit={handleConsulta}>
        <div className="form-group">
          <label htmlFor="fatura">Fatura:</label>
          <input
            type="text"
            id="fatura"
            name="fatura"
            value={fatura}
            onChange={handleInputChange(setFatura, setAdministradora)}
            placeholder="Digite o número da fatura"
            disabled={administradora.length > 0}
          />
        </div>
        <div className="form-group">
          <label htmlFor="administradora">Administradora:</label>
          <input
            type="text"
            id="administradora"
            name="administradora"
            value={administradora}
            onChange={handleInputChange(setAdministradora, setFatura)}
            placeholder="Digite o nome da administradora"
            disabled={fatura.length > 0}
          />
        </div>
        {erro && <div className="erro-msg">{erro}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Consultando...' : 'Consultar'}
        </button>
      </form>

      
      {resultado && (
        <div className="resultado-fatura">
          <h3>Resultado:</h3>
         
          <pre>{JSON.stringify(resultado, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ConsultaFatura;
