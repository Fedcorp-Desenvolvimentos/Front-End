import React from 'react';
import { Link } from 'react-router-dom';
import Dropdown from '../Dropdown/Dropdown';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/home" className="navbar-brand">
          <img src="/imagens/logo.png" alt="Logo" className="logo" />
        </Link>

        <div className="navbar-content">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/home" className="nav-link active">
                <button className="btn-primary">
                  <i className="bi bi-house-door-fill"></i>
                  Início
                </button>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/consulta-pf" className="nav-link">
                <button className="btn-primary">
                  <i className="bi bi-clipboard2-minus-fill"></i>
                  Consultar dados
                </button>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/consulta-end" className="nav-link">
                <button className="btn-primary">
                  <i className="bi bi-geo-alt-fill"></i>
                  Consultar Endereço
                </button>
              </Link>
            </li>
          </ul>

          <Dropdown />
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 