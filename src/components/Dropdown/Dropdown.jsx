import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Dropdown.css';

const Dropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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
        className="dropdown-btn" 
        type="button" 
        onClick={toggleDropdown}
      >
        <i className="bi bi-three-dots-vertical"></i>
        Opções
      </button>

      <ul className={`dropdown-content ${isOpen ? 'show' : ''}`}>
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

        {/* botão de troca de tema pode ser adicionado aqui */}

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
