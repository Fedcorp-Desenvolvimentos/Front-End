import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";
import Dropdown from "../Dropdown/Dropdown";
import { useAuth } from "../../context/AuthContext";

function Sidebar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const location = useLocation();
  const { user } = useAuth();

  const nivelAcesso = user?.nivel_acesso;

  useEffect(() => setDropdownOpen(false), [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleSidebarToggle = () => setSidebarOpen((prev) => !prev);

  const handleDropdownToggle = () => setDropdownOpen((prev) => !prev);

  const [hamburgerLeft, setHamburgerLeft] = useState(222);
  useEffect(() => {
    function updateLeft() {
      if (window.innerWidth < 600) {
        setHamburgerLeft(sidebarOpen ? window.innerWidth * 0.88 : 44);
      } else {
        setHamburgerLeft(sidebarOpen ? 222 : 52);
      }
    }
    updateLeft();
    window.addEventListener("resize", updateLeft);
    return () => window.removeEventListener("resize", updateLeft);
  }, [sidebarOpen]);

  return (
    <>
      <button
        className="sidebar-hamburger"
        onClick={handleSidebarToggle}
        aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={sidebarOpen}
        style={{ left: hamburgerLeft }}
      >
        <i className={`bi ${sidebarOpen ? "bi-chevron-left" : "bi-list"}`}></i>
      </button>

      <aside
        className={`sidebar${sidebarOpen ? " open" : " closed"}`}
        aria-label="Menu lateral principal"
        ref={sidebarRef}
      >
        <div className="sidebar-header">
          <Link to="/home" className="logo-link">
            {sidebarOpen ? (
              <img src="https://i.postimg.cc/Gh597vbr/LOGO.png" alt="Logo" className="logo" />
            ) : (
              <span className="mini-logo">
                <img src="/public/imagens/Fedcorp-icone02-50x50-Cmau4-hl.png" alt="FedCorp Ícone" className="mini-logo-img" />
              </span>
            )}
          </Link>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className={location.pathname === "/home" ? "active" : ""}>
              <Link to="/home">
                <i className="bi bi-house-door-fill"></i>
                {sidebarOpen && <span>Início</span>}
              </Link>
            </li>

            {["admin", "moderador"].includes(nivelAcesso) && (
              <li className={location.pathname === "/home-adm" ? "active" : ""}>
                <Link to="/home-adm">
                  <i className="bi bi-credit-card-2-front-fill"></i>
                  {sidebarOpen && <span>Administradora</span>}
                </Link>
              </li>
            )}

            {["admin", "comercial"].includes(nivelAcesso) && (
              <li className={location.pathname === "/consulta-comercial" ? "active" : ""}>
                <Link to="/consulta-comercial">
                  <i className="bi bi-ui-checks-grid"></i>
                  {sidebarOpen && <span>Comercial</span>}
                </Link>
              </li>
            )}

            {["admin", "usuario", "comercial"].includes(nivelAcesso) && (
              <li>
                <Link to="/ferramentas">
                  <i className="bi bi-tools"></i>
                  {sidebarOpen && <span>Ferramentas</span>}
                </Link>
              </li>
            )}

            {["admin", "comercial"].includes(nivelAcesso) && (
              <li>
                <Link to="/metricas">
                  <i className="bi bi-bar-chart-fill"></i>
                  {sidebarOpen && <span>Métricas</span>}
                </Link>
              </li>
            )}


            {["admin", "usuario", "comercial"].includes(nivelAcesso) && (
              <li className={location.pathname === "/envio-email" ? "active" : ""}>
                <Link to="/envio-email">
                  <i className="bi bi-envelope-fill"></i>
                  {sidebarOpen && <span>E-mail</span>}
                </Link>
              </li>
            )}

            {["admin", "usuario", "comercial"].includes(nivelAcesso) && (
              <li className={`has-dropdown${dropdownOpen ? " open" : ""}`}>
                <button
                  className="dropdown-link"
                  onClick={handleDropdownToggle}
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                  type="button"
                  tabIndex={0}
                  title="Consultas"
                >
                  <i className="bi bi-clipboard2-minus-fill"></i>
                  {sidebarOpen && <span>Consultas</span>}
                  <i className={`bi ms-auto ${dropdownOpen ? "bi-caret-up-fill" : "bi-caret-down-fill"}`}></i>
                </button>
                <ul
                  className="dropdown-menu"
                  style={{
                    display: dropdownOpen ? "block" : "none",
                    left: sidebarOpen ? "0" : "52px",
                    minWidth: sidebarOpen ? "100%" : "170px",
                    position: sidebarOpen ? "static" : "absolute",
                    boxShadow: !sidebarOpen ? "2px 4px 18px rgba(36,99,235,0.11)" : "none",
                    borderLeft: !sidebarOpen ? "2.5px solid #e8eaf7" : "none",
                  }}
                >
                  <li>
                    <Link to="/consulta-pf" onClick={() => setDropdownOpen(false)}>
                      <i className="bi bi-person" /> {sidebarOpen && "Pessoa Física"}
                    </Link>
                  </li>
                  <li>
                    <Link to="/consulta-cnpj" onClick={() => setDropdownOpen(false)}>
                      <i className="bi bi-building" /> {sidebarOpen && "Pessoa Jurídica"}
                    </Link>
                  </li>
                  <li>
                    <Link to="/consulta-segurados" onClick={() => setDropdownOpen(false)}>
                      <i className="bi bi-card-list" /> {sidebarOpen && "Consulta Segurados"}
                    </Link>
                  </li>
                  <li>
                    <Link to="/consulta-end" onClick={() => setDropdownOpen(false)}>
                      <i className="bi bi-geo-alt" /> {sidebarOpen && "Consulta Endereço"}
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </nav>
        <Dropdown sidebarOpen={sidebarOpen} />
      </aside>
    </>
  );
}

export default Sidebar;
