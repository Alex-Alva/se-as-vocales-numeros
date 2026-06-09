import React from "react";
import { FiCpu } from "react-icons/fi";
import { HiOutlineLightBulb } from "react-icons/hi2";

export default function TechInfoSection() {
  return (
    <section className="relative rounded-2xl border border-slate-200 dark:border-emerald-500/10 bg-gradient-to-r from-slate-100 via-slate-50/50 to-transparent dark:from-emerald-950/10 dark:via-[#09120e]/60 dark:to-[#09120e]/20 p-8 md:p-10 overflow-hidden transition-colors duration-500">
      <div className="absolute right-0 bottom-0 opacity-5 dark:opacity-10 pointer-events-none transform translate-x-10 translate-y-10 transition-opacity">
        <FiCpu className="text-[200px] text-emerald-600 dark:text-emerald-400" />
      </div>
      
      <div className="max-w-3xl space-y-4 relative z-10">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-900 dark:text-white transition-colors duration-500">
          <HiOutlineLightBulb className="text-emerald-600 dark:text-emerald-500" /> El Núcleo Tecnológico: IA, ML y DL
        </h2>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed transition-colors duration-500">
          El recognition de imágenes moderno se divide en capas conceptuales complejas. La <strong className="text-emerald-600 dark:text-emerald-500 font-semibold transition-colors">Inteligencia Artificial (IA)</strong> es el marco general que busca imitar capacidades humanas. Dentro de ella, el <strong className="text-slate-800 dark:text-slate-200 transition-colors duration-500">Machine Learning (ML)</strong> permite que las computadoras aprendan patrones mediante datos vectoriales (como las distancias entre las articulaciones de tus dedos) sin ser programadas explícitamente para cada variación de mano.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-500">
          Por último, el <strong className="text-slate-700 dark:text-slate-300 transition-colors duration-500">Deep Learning (DL)</strong> utiliza redes neuronales artificiales de múltiples capas que emulan la corteza visual humana, descomponiendo la imagen de tu cámara web en bordes, siluetas y finalmente posturas complejas tridimensionales en milisegundos.
        </p>
      </div>
    </section>
  );
}