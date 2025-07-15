import React, { useState, useEffect } from 'react';
import '../../styles/HistoricoPage.css';
import { Link } from 'react-router-dom';
import { ConsultaService } from '../../../services/consultaService';
import { useAuth } from '../../../context/AuthContext'; // Assumindo que você tem um AuthContext para pegar o usuário/papel

const HistoricoConsulta = () => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedConsultaId, setSelectedConsultaId] = useState(null);
  const [detalhesConsulta, setDetalhesConsulta] = useState(null);
  const [detalhesLoading, setDetalhesLoading] = useState(false);
  const [detalhesError, setDetalhesError] = useState('');

  // Assumindo que useAuth() provê o usuário logado e suas permissões/ID
  // Por exemplo: { user: { id: 1, role: 'comum', email: 'user@example.com' } }
  const { user } = useAuth(); 

  useEffect(() => {
    const fetchHistorico = async () => {
      setLoading(true);
      setError('');
      try {
        let data;
       console.log(user)
        // Verifica se o usuário existe e se ele tem o papel de 'admin' ou 'moderador'
        if (user && (user.nivel_acesso === "admin" || user.nivel_acesso === "moderador")) {
          data = await ConsultaService.getConsultaHistory();
        } else if (user && user.id && (user.nivel_acesso === "usuario"|| user.nivel_acesso === "comercial")) {
          data = await ConsultaService.getUserHistory(user.id);
         console.log(data)
        } else {
          setError('Usuário não autenticado ou sem permissão para ver o histórico.');
          setLoading(false);
          return;
        }
        
        setConsultas(data.results || data);
      } catch (err) {
        console.error('Erro ao buscar histórico de consultas:', err);
        setError('Não foi possível carregar o histórico de consultas.');
      } finally {
        setLoading(false);
      }
    };

    if (user) { // Garante que a busca só ocorra se houver um usuário logado
      fetchHistorico();
    }
  }, [user]); // Adiciona 'user' como dependência para re-executar se o usuário mudar

  const handleItemClick = async (consultaId) => {
    if (selectedConsultaId === consultaId) {
      setSelectedConsultaId(null);
      setDetalhesConsulta(null);
      return;
    }

    setSelectedConsultaId(consultaId);
    setDetalhesLoading(true);
    setDetalhesError('');
    setDetalhesConsulta(null);
    try {
      const data = await ConsultaService.getHistoryByID(consultaId);
      setDetalhesConsulta(data);
    } catch (err) {
      console.error(`Erro ao buscar detalhes da consulta ${consultaId}:`, err);
      setDetalhesError('Não foi possível carregar os detalhes desta consulta.');
    } finally {
      setDetalhesLoading(false);
    }
  };

  return (
    <div className="historico-container">
      <h2>Histórico de Consultas</h2>
      <Link to="/home" className="btn-voltar">
        <i className="bi bi-arrow-left-circle"></i> Voltar
      </Link>

      {loading && <p className="loading-message">Carregando histórico...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && consultas.length === 0 && (
        <p className="sem-consultas">Nenhuma consulta encontrada no histórico.</p>
      )}

      {!loading && !error && consultas.length > 0 && (
        <table className="historico-table">
          <thead>
            <tr><th>Tipo de Consulta</th><th>Parâmetro</th><th>Realizada por</th><th>Data</th><th></th></tr>
          </thead>
          <tbody>
            {consultas.map((consulta) => (
              <React.Fragment key={consulta.id}>
                <tr
                  className={selectedConsultaId === consulta.id ? 'active-row' : ''}
                  onClick={() => handleItemClick(consulta.id)}
                >
                  <td>{consulta.tipo_consulta_display || consulta.tipo_consulta}</td>
                  <td>{consulta.parametro_consulta}</td>
                  <td>{consulta.usuario_email || 'N/A'}</td>
                  <td>{new Date(consulta.data_consulta).toLocaleDateString()}</td>
                  <td className="expand-icon">
                    <i className={`bi ${selectedConsultaId === consulta.id ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                  </td>
                </tr>

                {selectedConsultaId === consulta.id && (
                  <tr>
                    <td colSpan="5">
                      <div className="detalhes-historico-panel">
                        {detalhesLoading && <p className="detalhes-loading">Carregando detalhes...</p>}
                        {detalhesError && <p className="detalhes-error">{detalhesError}</p>}
                        
                        {detalhesConsulta && detalhesConsulta.resultado && detalhesConsulta.resultado.Result && detalhesConsulta.resultado.Result.length > 0 ? (
                          <div className="detalhes-content">
                            <h4>Detalhes da Consulta #{detalhesConsulta.id}</h4>
                            <p><strong>Tipo:</strong> {detalhesConsulta.tipo_consulta_display || detalhesConsulta.tipo_consulta}</p>
                            <p><strong>Parâmetro:</strong> {detalhesConsulta.parametro_consulta}</p>
                            <p><strong>Data/Hora Completa:</strong> {new Date(detalhesConsulta.data_consulta).toLocaleString()}</p>
                            <p><strong>Realizada por:</strong> {detalhesConsulta.usuario_email || 'N/A'}</p>
                            <p><strong>Origem:</strong> {detalhesConsulta.origem}</p>
                            <p><strong>Tempo de Resposta:</strong> {detalhesConsulta.resultado.ElapsedMilliseconds || 'N/A'} ms</p>

                            <div className="resultado-box">
                                <h5>Resultado da Consulta:</h5>
                                {detalhesConsulta.resultado.Result[0].BasicData && (
                                    <>{console.log(detalhesConsulta.resultado.Result[0].BasicData)}
                                        <p><strong>Nome:</strong> {detalhesConsulta.resultado.Result[0].BasicData.Name || 'N/A'}</p>
                                        <p><strong>Situação Cadastral:</strong> {detalhesConsulta.resultado.Result[0].BasicData.TaxIdStatus || 'N/A'}</p>
                                        <p><strong>Data de Nascimento:</strong> {detalhesConsulta.resultado.Result[0].BasicData.CapturedBirthDateFromRFSource || 'N/A'}</p>
                                        <p><strong>Nome da Mãe:</strong> {detalhesConsulta.resultado.Result[0].BasicData.MotherName || 'N/A'}</p>
                                    </>
                                )}
                                {detalhesConsulta.resultado.Result[0].MatchKeys && (
                                    <p><strong>Chave de Correspondência:</strong> {detalhesConsulta.resultado.Result[0].MatchKeys}</p>
                                )}
                            </div>
                          </div>
                        ) : (
                          <p className="no-data-message">Nenhum resultado detalhado disponível para esta consulta.</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HistoricoConsulta;