import React from "react";
import "../styles/Navbar.css";
import Dropdown from "../Dropdown/Dropdown";

function Navbar() {
  return (
    <nav className="navbar border-bottom">
      <div className="container">
        {/* Logo */}
        <a className="navbar-brand d-flex align-items-center" href="../Home">
          <img src="../public/imagens/logo.png" alt="Logo" className="logo me-2" />
        </a>

        <div className="navbar-collapse">
          <ul className="navbar-nav">
            {/* Botão início */}
            <li className="nav-item">
              <a className="nav-link active" href="./Home">
                <button type="button" className="btn">
                  <i className="bi bi-house-door-fill"></i>
                  Início
                </button>
              </a>
            </li>

            {/* botão dados */}
            <li className="nav-item">
              <a className="nav-link" href="../Consultas/consulta-pf.html">
                <button type="button" className="btn">
                  <i className="bi bi-clipboard2-minus-fill"></i>
                  Consultar dados
                </button>
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="../Consultas/consultaEnd.jsx">
                <button type="button" className="btn">
                  <i className="bi bi-geo-alt-fill"></i>
                  Consultar Endereço
                </button>
              </a>
            </li>
          </ul>

          {/* Dropdown no canto direito */}
          <Dropdown />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
