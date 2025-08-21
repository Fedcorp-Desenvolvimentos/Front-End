import React, { useState } from 'react';
import "../styles/ConsultaFat.css";
import { ConsultaService } from '../../services/consultaService';

const ConsultaFatura = () => {
  const [fatura, setFatura] = useState('');
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConsulta = async (e) => {
    e.preventDefault();
    setErro('');
    setResultado(null);

    if (!fatura) {
      setErro('Preencha o número da fatura para consultar.');
      return;
    }

    setLoading(true);

    const payload = {
      tipo_consulta: "faturas",
      parametro_consulta: JSON.stringify({ fatura_id: fatura }),
      origem: "manual"
    };

    try {
      const resposta = await ConsultaService.getfatura(payload);
      
      if (resposta.resultado_api && resposta.resultado_api.length > 0) {
        setResultado(resposta.resultado_api[0]);
      } else {
        setErro('Nenhuma fatura encontrada com o ID fornecido.');
      }
    } catch (err) {
      const msgErro = err.response?.data?.detail || 'Erro ao consultar faturas. Tente novamente.';
      setErro(msgErro);
    } finally {
      setLoading(false);
    }
  };

  const formatarValor = (valor) => {
    return Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatarData = (dataString) => {
    if (!dataString) return '-';
    const data = new Date(dataString);
    return isNaN(data.getTime()) ? '-' : data.toLocaleDateString();
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
            onChange={(e) => setFatura(e.target.value)}
            placeholder="Digite o número da fatura"
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
            <div><strong>Prêmio Bruto:</strong> R$ {formatarValor(resultado.PREMIO_BRUTO)}</div>
            <div><strong>Devolução:</strong> R$ {formatarValor(resultado.DEVOLUCAO)}</div>
            <div><strong>Parcela(s):</strong> {resultado.PARCELAS}</div>
            <div><strong>Comissão:</strong> R$ {formatarValor(resultado.COMISSAO)}</div>
            <div><strong>Comissão 2:</strong> R$ {formatarValor(resultado.COMISSAO2)}</div>
            <div><strong>Ramo:</strong> {resultado.RAMO}</div>
            <div><strong>Data da Fatura:</strong> {formatarData(resultado.DATA_FAT)}</div>
            <div><strong>Vencimento:</strong> {formatarData(resultado.VENCIMENTO)}</div>
            <div><strong>Data de Repasse:</strong> {formatarData(resultado.DATA_REPASSE)}</div>
            <div><strong>Boleto Quitado:</strong> {resultado.BOLETA_QUITADA === "S" ? "Sim" : "Não"}</div>
            <div><strong>Data da Baixa:</strong> {formatarData(resultado.DT_BAIXA)}</div>
            <div><strong>Início Vigência:</strong> {formatarData(resultado.DT_INI_VIG)}</div>
            <div><strong>Fim Vigência:</strong> {formatarData(resultado.DT_FIM_VIG)}</div>
            {resultado.DT_CANCEL && (
              <div>
                <strong>Data Cancelamento:</strong> {formatarData(resultado.DT_CANCEL)}
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