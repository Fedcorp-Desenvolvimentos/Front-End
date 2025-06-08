import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { useTheme } from '../../contexts/ThemeContext';
import '../styles/Dropdown.css';

const Dropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
//   const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button 
        className="btn-primary dropdown-toggle" 
        type="button" 
        onClick={toggleDropdown}
      >
        <i className="bi bi-three-dots-vertical"></i>
        Opções
      </button>
      <ul className={`dropdown-menu ${isOpen ? 'show' : ''}`}>
        <li>
          <Link to="/conta" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <i className="bi bi-person-circle"></i>
            Conta
          </Link>
        </li>
        <li>
          <Link to="/config" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <i className="bi bi-gear"></i>
            Configurações
          </Link>
        </li>
        <li>
          <Link to="/cadastro" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <i className="bi bi-people-fill"></i>
            Cadastrar Usuários
          </Link>
        </li>
        <li><hr className="dropdown-divider" /></li>
        {/* <li>
          <button 
            className="dropdown-item" 
            onClick={() => {
              toggleTheme();
              setIsOpen(false);
            }}
          >
            <i className={`bi bi-${theme === 'light' ? 'moon' : 'sun'}-fill`}></i>
            {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
          </button>
        </li> */}
        <li><hr className="dropdown-divider" /></li>
        <li>
          <Link to="/login" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <i className="bi bi-door-open-fill"></i>
            Sair
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Dropdown; 