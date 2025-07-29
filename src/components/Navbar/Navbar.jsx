import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import Dropdown from "../Dropdown/Dropdown";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const timeoutRef = useRef(null);
  const { user } = useAuth(); 

  const nivelAcesso = user?.nivel_acesso; 

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseEnter = () => {
    if (!isMobile) {
      clearTimeout(timeoutRef.current);
      setDropdownOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      timeoutRef.current = setTimeout(() => {
        setDropdownOpen(false);
      }, 300);
    }
  };

  const handleDropdownToggle = () => {
    if (isMobile) {
      setDropdownOpen((prev) => !prev);
    }
  };

  return (
    <nav className="navbar border-bottom" role="navigation" aria-label="Menu principal">
      <div className="container">
       
        <Link className="navbar-brand d-flex align-items-center" to="/home">
          <img
            src="https://i.postimg.cc/Gh597vbr/LOGO.png"
            alt="Logo"
            className="logo me-2"
          />
        </Link>

        <button
          className="hamburger d-md-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Abrir menu"
          aria-expanded={mobileMenuOpen}
        >
          <i className="bi bi-list"></i>
        </button>

        <div className={`navbar-collapse ${mobileMenuOpen ? "show" : ""}`}>
          <ul className="navbar-nav">
         
            <li className="nav-item">
              <Link className="nav-link" to="/home">
                <button type="button" className="btn">
                  <i className="bi bi-house-door-fill"></i>
                  Início
                </button>
              </Link>
            </li>

            {["admin", "usuario", "comercial"].includes(nivelAcesso) && (
              <li className="nav-item">
                <Link className="nav-link" to="/consulta-end">
                  <button type="button" className="btn">
                    <i className="bi bi-geo-alt-fill"></i>
                    Consultar Endereço
                  </button>
                </Link>
              </li>
            )}

            {["admin", "comercial"].includes(nivelAcesso) && (
              <li className="nav-item">
                <Link className="nav-link" to="/consulta-comercial">
                  <button type="button" className="btn">
                    <i className="bi bi-ui-checks-grid"></i>
                    Comercial
                  </button>
                </Link>
              </li>
            )}

            {["admin", "moderador"].includes(nivelAcesso) && (
              <li className="nav-item">
                <Link className="nav-link" to="/home-adm">
                  <button type="button" className="btn">
                    <i className="bi bi-credit-card-2-front-fill"></i>
                    Administradora
                  </button>
                </Link>
              </li>
            )}

            {["admin", "usuario", "comercial"].includes(nivelAcesso) && (
              <li
                className={`nav-item dropdown ${dropdownOpen ? "show" : ""}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleDropdownToggle}
              >
                <div className="nav-link btn d-flex align-items-center">
                  <i className="bi bi-clipboard2-minus-fill me-2"></i>
                  Consultar Dados
                </div>
                <ul className={`dropdown-menu ${dropdownOpen ? "show" : ""}`}>
                  <li>
                    <Link className="dropdown-item" to="/consulta-pf">
                      Pessoa Física
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/consulta-cnpj">
                      Pessoa Jurídica
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/consulta-segurados">
                      Consulta Segurados
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>
          <Dropdown />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
