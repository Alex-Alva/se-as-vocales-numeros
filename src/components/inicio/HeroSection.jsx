import React from "react";
import { FiTv } from "react-icons/fi";

export default function HeroSection() {
  return (
    <section className="relative flex h-[60vh] min-h-[450px] items-center justify-center overflow-hidden transition-colors duration-500">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 scale-105"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920')` 
        }}
      />
      <div className="absolute inset-0 bg-white/80 dark:bg-[#09120e]/85 backdrop-blur-[3px] transition-colors duration-500" />
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto animate-fade-in">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-4 transition-colors">
          <FiTv className="animate-pulse" /> Entrenamiento en Vivo
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 transition-colors duration-500">
          Practica las vocales y los números en{" "}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            lenguaje de señas
          </span>{" "}
          y diviértete
        </h1>
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed transition-colors duration-500">
          Aprende, experimenta y desafía tus habilidades con nuestro sistema de reconocimiento interactivo impulsado por Inteligencia Artificial directa en tu navegador.
        </p>
      </div>
    </section>
  );
}