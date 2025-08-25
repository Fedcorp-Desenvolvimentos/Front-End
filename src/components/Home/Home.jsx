import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import "../styles/Home.css";

const imagensCarrossel = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
];

const Home = () => {
  const { withSidebar } = useOutletContext();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % imagensCarrossel.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`home-container${withSidebar ? " with-sidebar" : ""}`}>
      <h1 className="home-title">Bem-vindos à Plataforma Bigcorp!</h1>
      <p className="home-desc">
        A plataforma Bigcorp foi criada para simplificar a rotina da empresa e centralizar as soluções.<br />
        Seja bem-vindo(a) à evolução digital da FedCorp!
      </p>

      <div className="carousel-container">
        <img
          src={imagensCarrossel[index]}
          alt={`Banner ${index + 1}`}
          className="carousel-image"
        />
        <div className="carousel-indicators">
          {imagensCarrossel.map((_, i) => (
            <button
              key={i}
              className={`carousel-dot${i === index ? " active" : ""}`}
              onClick={() => setIndex(i)}
              aria-label={`Ir para imagem ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
