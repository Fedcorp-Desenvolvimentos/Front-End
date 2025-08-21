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
 
        {erro && <div className="erro-msg">{erro}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Consultando...' : 'Consultar'}
        </button>
      </form>

      
      {resultado && (
  <div className="resultado-fatura">
    <h3>Fatura #{resultado.FATURA}</h3>
    <div className="resultado-dados">
      <div><strong>Administradora:</strong> {resultado.ADMINISTRADORA_NOME}</div>
      <div><strong>Apólice:</strong> {resultado.APOLICE}</div>
      <div><strong>Tipo:</strong> {resultado.TIPO_FAT}</div>
      <div><strong>Prêmio Bruto:</strong> R$ {Number(resultado.PREMIO_BRUTO).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
      <div><strong>Devolução:</strong> R$ {Number(resultado.DEVOLUCAO).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
      <div><strong>Parcela(s):</strong> {resultado.PARCELAS}</div>
      <div><strong>Comissão:</strong> R$ {Number(resultado.COMISSAO).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
      <div><strong>Comissão 2:</strong> R$ {Number(resultado.COMISSAO2).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
      <div><strong>Ramo:</strong> {resultado.RAMO}</div>
      <div><strong>Data da Fatura:</strong> {resultado.DATA_FAT ? new Date(resultado.DATA_FAT).toLocaleDateString() : '-'}</div>
      <div><strong>Vencimento:</strong> {resultado.VENCIMENTO ? new Date(resultado.VENCIMENTO).toLocaleDateString() : '-'}</div>
      <div><strong>Data de Repasse:</strong> {resultado.DATA_REPASSE ? new Date(resultado.DATA_REPASSE).toLocaleDateString() : '-'}</div>
      <div><strong>Boleto Quitado:</strong> {resultado.BOLETA_QUITADA === "S" ? "Sim" : "Não"}</div>
      <div><strong>Data da Baixa:</strong> {resultado.DT_BAIXA ? new Date(resultado.DT_BAIXA).toLocaleDateString() : '-'}</div>
      <div><strong>Início Vigência:</strong> {resultado.DT_INI_VIG ? new Date(resultado.DT_INI_VIG).toLocaleDateString() : '-'}</div>
      <div><strong>Fim Vigência:</strong> {resultado.DT_FIM_VIG ? new Date(resultado.DT_FIM_VIG).toLocaleDateString() : '-'}</div>
      {resultado.DT_CANCEL && (
        <div>
          <strong>Data Cancelamento:</strong> {new Date(resultado.DT_CANCEL).toLocaleDateString()}
          {resultado.OBS_CANCEL && (
            <span style={{ marginLeft: 8, color: "#d21a1a" }}>
              ({resultado.OBS_CANCEL})
            </span>
          )}
        </div>
      )}
    </div>
  </div>
)}

    </div>
  );
};

export default ConsultaFatura;
