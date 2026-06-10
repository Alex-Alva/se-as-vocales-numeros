import React from "react";
import { FiCompass, FiPlayCircle, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { HiOutlineLightBulb } from "react-icons/hi2";

export default function PracticeModesSection() {
  return (
    <section className="space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors duration-500">Elige tu Estrategia de Aprendizaje</h2>
        <p className="text-slate-600 dark:text-slate-400 transition-colors duration-500">Dos modalidades diseñadas para guiarte desde tus primeros pasos hasta el dominio fluido de las señas.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/60 dark:border-emerald-950/40 bg-white dark:bg-[#09120e]/40 p-6 md:p-8 transition-all duration-500 hover:shadow-emerald-500/5 hover:scale-[1.01]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 transition-colors">
                <FiCompass className="text-xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors duration-500">Modo Explorar</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed transition-colors duration-500">
              Ideal para probar la precisión de tus entrenamientos de forma libre y sin presiones. Tú haces la seña frente a la cámara y el sistema te devuelve el resultado en tiempo real.
            </p>
            
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-emerald-950/20 transition-colors duration-500">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span> 
                <span>Analiza dinámicamente si corresponde a una **vocal o número** según el modelo cargado.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span> 
                <span>Si retiras la mano, el algoritmo notificará explícitamente que **no detecta ninguna mano**.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 mt-0.5">•</span> 
                <span>Si haces un gesto extraño o sin registrar, se evaluará el porcentaje de seguridad; si es muy bajo, te avisará que **no corresponde a las señas guardadas**.</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/60 dark:border-emerald-950/40 bg-white dark:bg-[#09120e]/40 p-6 md:p-8 transition-all duration-500 hover:shadow-emerald-500/5 hover:scale-[1.01]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-500 transition-colors">
                <FiPlayCircle className="text-xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors duration-500">Modo Juego</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed transition-colors duration-500">
              Pon a prueba tus reflejos y memoria muscular mediante una evaluación interactiva cronometrada. El sistema te desafiará con un cuestionario dinámico.
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-emerald-950/20 text-xs transition-colors duration-500">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium transition-colors">
                <FiClock className="text-sm" /> 10 Preguntas aleatorias con temporizador activo.
              </div>
              <div className="grid grid-cols-1 gap-2 text-slate-600 dark:text-slate-400 mt-2 transition-colors duration-500">
                <div className="flex gap-2"><FiCheckCircle className="text-emerald-500 flex-shrink-0 mt-0.5" /> <span><strong className="text-slate-700 dark:text-slate-300">Acierto:</strong> Hacer la seña correcta a tiempo te sumará puntos.</span></div>
                <div className="flex gap-2"><FiXCircle className="text-rose-500 flex-shrink-0 mt-0.5" /> <span><strong className="text-slate-700 dark:text-slate-300">Fallo o Tiempo Agotado:</strong> Se detiene el reloj, te dice el error y te revela visualmente la seña correcta.</span></div>
                <div className="flex gap-2"><HiOutlineLightBulb className="text-amber-500 flex-shrink-0 mt-0.5" /> <span><strong className="text-slate-700 dark:text-slate-300">Gesto No Entrenado:</strong> Avisará que la estructura no se parece a nada registrado.</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}