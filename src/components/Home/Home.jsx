import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';


const Home = () => {
  return (
    <div className="home-container">

      {/* Conteúdo Principal */}
      <main>
        <div className="jumbotron">
          <div className="container">
            <h1>Bem-vindos à Plataforma Bigcorp!</h1>
            <p>Encontre dados para auxiliar em diversas ocasiões, oferecendo as melhores soluções.</p>
          </div>
        </div>

        <div className="container">
          <div className="cards-container">
            {/* Card 1 */}
            <div className="card">
              <div className="card-body">
                <div className="feature-icon">
                  <i className="bi bi-person-fill"></i>
                </div>
                <h2>Dados Pessoais</h2>
                <p>
                  A pesquisa por dados pessoais fornece informações sobre pessoas registradas, incluindo
                  CPF, nome, filiação e data de nascimento.
                </p>
                <Link to="/consulta-pf" className="btn-primary">
                  Pesquisar
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="card">
              <div className="card-body">
                <div className="feature-icon">
                  <i className="bi bi-building-fill"></i>
                </div>
                <h2>Dados Empresariais</h2>
                <p>
                  A busca por dados empresariais fornece informações sobre empresas registradas, incluindo
                  CNPJ, razão social, quadro societário e situação cadastral.
                </p>
                <Link to="/consulta-cnpj" className="btn-primary">
                  Pesquisar
                </Link>
              </div>
            </div>

            {/* Card 3 */}
            <div className="card">
              <div className="card-body">
                <div className="feature-icon">
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <h2>Endereços</h2>
                <p>
                  A consulta de endereços permite localizar informações detalhadas sobre logradouros,
                  incluindo CEP, bairro, cidade e estado.
                </p>
                <Link to="/consulta-end" className="btn-primary">
                  Pesquisar
                </Link>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Home; 