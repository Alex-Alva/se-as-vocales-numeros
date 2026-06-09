import React from "react";
import HeroSection from "../components/inicio/HeroSection";
import HowItWorksSection from "../components/inicio/HowItWorksSection";
import PracticeModesSection from "../components/inicio/PracticeModesSection";
import TechInfoSection from "../components/inicio/TechInfoSection";

export default function Inicio() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09120e] text-slate-800 dark:text-slate-200 transition-colors duration-500">
      
      {/* 1. SECCIÓN HERO */}
      <HeroSection />

      {/* CONTENEDOR ENVOLVENTE PARA SECCIONES INFERIORES */}
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-24">

        {/* 2. SECCIÓN: Cómo funciona el entrenamiento local */}
        <HowItWorksSection />

        {/* 3. SECCIÓN: Modos de Práctica */}
        <PracticeModesSection />

        {/* 4. SECCIÓN INFORMATIVA: IA, ML y DL */}
        <TechInfoSection />

      </div>
    </div>
  );
}