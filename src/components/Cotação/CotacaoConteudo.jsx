import React, { useState } from "react";
import { FaHome } from "react-icons/fa";
import "../styles/CotacaoConteudo.css";
import { calcularCotacao } from "../../services/cotacaoService";

const CotacaoConteudo = () => {
  // Estados para os inputs
  const [incendio, setIncendio] = useState("");
  const [aluguel, setAluguel] = useState("");
  const [premioProposto, setPremioProposto] = useState(""); // Adicionado
  const [repasse, setRepasse] = useState("");

  // Estados para os resultados da API
  const [isTotal, setIsTotal] = useState(0);
  const [premioBruto, setPremioBruto] = useState(0);
  const [valorRepasse, setValorRepasse] = useState(0);
  const [showResultado, setShowResultado] = useState(false);

  // Funções de formatação (mantidas)
  const desformatarMoeda = (valor) => {
    return Number(valor.replace(/\D/g, "")) / 100;
  };

  const formatarMoeda = (valor) => {
    const num = Number(valor.replace(/\D/g, "")) / 100;
    return num.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatarPorcentagem = (valor) => {
    let num = valor.replace(/[^0-9.,]/g, "").replace(",", ".");
    if (num === "") return "";
    num = parseFloat(num);
    if (isNaN(num)) return "";
    return num.toString().replace(".", ",") + "%";
  };

  const handleChange =
    (setter, type = "money") =>
    (e) => {
      const valor = e.target.value;
      if (type === "percent") {
        setter(formatarPorcentagem(valor));
      } else {
        setter(formatarMoeda(valor));
      }
      setShowResultado(false);
    };

  // Nova função para lidar com o clique do botão
  const handleGerarResultado = async () => {
    // 1. Desformata os valores dos inputs para enviar ao backend
    const dadosParaEnvio = {
      incendio_conteudo: desformatarMoeda(incendio),
      perda_aluguel: desformatarMoeda(aluguel),
      premio_proposto: desformatarMoeda(premioProposto), // Adicionado
      repasse_percentual: Number(
        repasse.replace("%", "").replace(",", ".") || 0
      ),
    };

    // 2. Chama a API
    try {
      const response = await calcularCotacao(dadosParaEnvio);
      console.log(`Cotação:${response}`);
      // 3. Atualiza os estados com os resultados da API
      const resultados = response.data;
      setIsTotal(resultados.is_total);
      setPremioBruto(resultados.premio_bruto);
      setValorRepasse(resultados.repasse_administradora);

      // 4. Mostra a seção de resultados
      setShowResultado(true);
    } catch (error) {
      console.error("Erro ao calcular a cotação:", error);
      alert(
        "Ocorreu um erro ao gerar o resultado. Verifique os dados e tente novamente."
      );
    }
  };

  return (
    <div className="cotacao-container">
      <div className="icone-cabecalho">
        <FaHome size={32} />
      </div>
      <h2 className="titulo-pagina">Estudo – Incêndio Conteúdo</h2>

      <div className="input-grid">
        <div className="campo">
          <label>Incêndio Conteúdo (R$)</label>
          <input
            type="text"
            value={incendio}
            onChange={handleChange(setIncendio)}
            placeholder="R$ 0,00"
          />
        </div>

        <div className="campo">
          <label>Perda de Aluguel (R$)</label>
          <input
            type="text"
            value={aluguel}
            onChange={handleChange(setAluguel)}
            placeholder="R$ 0,00"
          />
        </div>

        <div className="campo readonly">
          <label>IS Total (R$)</label>
          <input
            type="text"
            value={isTotal.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
            readOnly
          />
        </div>

        <div className="campo">
          <label>Prêmio Proposto (R$)</label>
          <input // Adicionado
            type="text"
            value={premioProposto}
            onChange={handleChange(setPremioProposto)}
            placeholder="R$ 0,00"
          />
        </div>

        <div className="campo">
          <label>Repasse (%)</label>
          <input
            type="text"
            value={repasse}
            onChange={handleChange(setRepasse, "percent")}
            placeholder="Ex: 20%"
            maxLength={6}
          />
        </div>

        <div className="campo readonly">
          <label>Repasse Administradora</label>
          <input
            type="text"
            value={valorRepasse.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
            readOnly
          />
        </div>
      </div>

      <button
        className="btn-resultado"
        style={{ marginTop: 24, padding: "10px 36px" }}
        onClick={handleGerarResultado}
      >
        Gerar Resultado
      </button>

      {showResultado && (
        <div className="resultado-fedcorp-linha">
          <div className="campo readonly">
            <label>Resultado Fedcorp</label>
            <input
              type="text"
              value={(premioBruto - valorRepasse).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
              readOnly
            />
          </div>
          <div className="campo readonly">
            <label>Repasse Fedcorp (%)</label>
            <span className="ferramenta-em-breve">Em Produção</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CotacaoConteudo;
