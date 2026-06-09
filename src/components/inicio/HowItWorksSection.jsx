import React from "react";
import { FiCpu, FiEye, FiLayers, FiActivity } from "react-icons/fi";

export default function HowItWorksSection() {
  return (
    <section className="rounded-2xl border border-slate-200/60 dark:border-emerald-950/40 bg-white dark:bg-gradient-to-br dark:from-[#09120e]/60 dark:via-emerald-950/5 dark:to-[#09120e]/40 backdrop-blur-md p-8 md:p-12 shadow-xl transition-all duration-500">
      <div className="flex flex-col lg:flex-row gap-12 items-center">
        <div className="space-y-6 lg:w-1/2">
          <div className="inline-flex p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-colors">
            <FiCpu className="text-2xl" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-wide text-slate-900 dark:text-white transition-colors duration-500">
            ¿Cómo funciona el <br />
            <span className="text-emerald-600 dark:text-emerald-400">Entrenamiento 100% Local</span>?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed transition-colors duration-500">
            A diferencia de los sistemas tradicionales que envían tus videos a servidores externos, esta plataforma ejecuta modelos matemáticos avanzados **directamente en tu dispositivo**. Tu cámara captura los puntos clave de tu mano y los procesa al instante.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-start gap-3">
              <FiEye className="text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0 transition-colors" />
              <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-500">
                <strong className="text-slate-800 dark:text-slate-200">Visión Artificial:</strong> Extrae matrices numéricas de los gestos.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <FiLayers className="text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0 transition-colors" />
              <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-500">
                <strong className="text-slate-800 dark:text-slate-200">LocalStorage:</strong> Guarda el conocimiento de tus señas en tu propio navegador de forma privada.
              </p>
            </div>
          </div>
        </div>
        
        {/* Elemento gráfico simulado */}
        <div className="lg:w-1/2 w-full flex justify-center">
          <div className="relative w-full max-w-md aspect-video rounded-xl border border-slate-200 dark:border-emerald-500/20 bg-slate-50 dark:bg-[#060c09] flex flex-col items-center justify-center p-6 text-center shadow-inner overflow-hidden group transition-colors duration-500">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
            <FiActivity className="text-4xl text-emerald-600 dark:text-emerald-400 mb-3 animate-pulse transition-colors" />
            <span className="text-xs font-mono tracking-widest text-emerald-600 dark:text-emerald-500 uppercase transition-colors">Estado del Modelo</span>
            <p className="text-sm font-semibold mt-1 text-slate-800 dark:text-slate-200 transition-colors duration-500">Listo para Capturar Vectores de Mano</p>
            <div className="mt-4 w-full bg-slate-200 dark:bg-emerald-950/30 rounded-full h-1.5 overflow-hidden transition-colors duration-500">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 w-3/4 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}