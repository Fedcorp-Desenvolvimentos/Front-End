import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import Dropdown from "../Dropdown/Dropdown";

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current); // Evita que feche imediatamente
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 300); // Tempo que o dropdown permanece aberto após sair com o mouse
  };

  return (
    <nav className="navbar border-bottom">
      <div className="container">
        {/* Logo */}
        <a className="navbar-brand d-flex align-items-center" href="../Home">
          <img src="../public/imagens/logo.png" alt="Logo" className="logo me-2" />
        </a>

        <div className="navbar-collapse">
          <ul className="navbar-nav">
            {/* Botões padrões */}
            <li className="nav-item">
              <Link className="nav-link" to="/home">
                <button type="button" className="btn">
                  <i className="bi bi-house-door-fill"></i>
                  Início
                </button>
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/consulta-end">
                <button type="button" className="btn">
                  <i className="bi bi-geo-alt-fill"></i>
                  Consultar Endereço
                </button>
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/consulta-comercial">
                <button type="button" className="btn">
                  <i className="bi bi-ui-checks-grid"></i>
                  Comercial
                </button>
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/home-adm">
                <button type="button" className="btn">
                  <i className="bi bi-credit-card-2-front-fill"></i>
                  Administradora
                </button>
              </Link>
            </li>

            {/* Dropdown com delay */}
            <li
              className={`nav-item dropdown ${dropdownOpen ? "show" : ""}`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="nav-link btn d-flex align-items-center">
                <i className="bi bi-clipboard2-minus-fill me-2"></i>
                Consultar Dados
              </div>
              <ul className={`dropdown-menu ${dropdownOpen ? "show" : ""}`}>
                <li>
                  <Link className="dropdown-item" to="/consulta-pf">Pessoa Física</Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/consulta-cnpj">Pessoa Jurídica</Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/consulta-segurados">Consulta Segurados</Link>
                </li>
              </ul>
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
