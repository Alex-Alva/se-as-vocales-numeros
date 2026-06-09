import React, { useState, useEffect } from "react";
import Navbar from "./common/navbar";
import Inicio from "./pages/inicio";
import Vocales from "./pages/vocales";
import Numeros from "./pages/numeros";

export default function App() {
  const [lang, setLang] = useState(localStorage.getItem("lang") || "es");
  
  // MODIFICACIÓN: Inicializa el estado leyendo de localStorage, por defecto "inicio"
  const [currentTab, setCurrentTab] = useState(
    localStorage.getItem("activeTab") || "inicio"
  );

  // MODIFICACIÓN: Cada vez que cambie currentTab, guardamos la nueva vista en localStorage
  useEffect(() => {
    localStorage.setItem("activeTab", currentTab);
  }, [currentTab]);

  return (
    <div className="min-h-screen transition-colors duration-500 bg-slate-50 dark:bg-[#09120e] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#09120e] dark:to-emerald-950/20">
      {/* Barra de navegación global */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Renderizado de Páginas Independientes */}
      {currentTab === "inicio" && <Inicio lang={lang} />}
      {currentTab === "vocales" && <Vocales lang={lang} />}
      {currentTab === "numeros" && <Numeros lang={lang} />}
    </div>
  );
}