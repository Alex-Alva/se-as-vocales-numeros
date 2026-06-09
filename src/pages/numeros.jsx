import React from "react";
import Camera from "../components/Camara/Camera";
import Controls from "../components/controles/Controls";
import Prediction from "../components/prediccion/Prediction";
import ProgressBars from "../components/controles/ProgressBars";

const labels = {
  es: { camera: "Cámara e Historial de Muestras", controls: "Controles de Números", prediction: "Predicción" },
  en: { camera: "Camera & Samples History", controls: "Numbers Controls", prediction: "Prediction" },
};

export default function Numeros({ lang }) {
  return (
    <main className="p-4 md:p-6 max-w-7xl mx-auto animate-fadeIn min-h-[calc(100vh-4rem)] flex flex-col justify-center w-full">
      
      {/* GRID ASIMÉTRICO: Mismo comportamiento que la vista de Vocales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch w-full">
        
        {/* COLUMNA IZQUIERDA: Cámara arriba + Barras de progreso de Números abajo */}
        <div className="md:col-span-2 flex flex-col gap-4 h-full">
          <Card title={labels[lang].camera} extraClasses="flex-1 justify-between">
            <div className="w-full flex-1 flex flex-col items-center justify-center">
              <Camera />
            </div>
            {/* Las barras se posicionan al pie de la cámara con mode="numeros" */}
            <div className="w-full border-t border-slate-100 dark:border-emerald-950/30 mt-4 pt-2 shrink-0">
              <ProgressBars mode="numeros" />
            </div>
          </Card>
        </div>

        {/* COLUMNA DERECHA: Ajustada con h-[0px] min-h-full para congelar la altura con la izquierda */}
        <div className="flex flex-col gap-5 h-[0px] min-h-full w-full">
          <Card title={labels[lang].controls} extraClasses="flex-1 min-h-[200px] overflow-hidden">
            <Controls mode="numeros" />
          </Card>
          
          <Card title={labels[lang].prediction} extraClasses="flex-1 min-h-[200px] overflow-hidden">
            <Prediction mode="numeros" />
          </Card>
        </div>

      </div>
    </main>
  );
}

function Card({ title, children, extraClasses = "" }) {
  return (
    <div className={`flex flex-col rounded-2xl border border-slate-200/60 dark:border-emerald-950/40 
      bg-white/70 dark:bg-gradient-to-br dark:from-[#09120e]/60 dark:via-emerald-950/10 dark:to-[#09120e]/40
      backdrop-blur-md shadow-xs dark:shadow-xl p-5 transition-all duration-300 w-full ${extraClasses}`}
    >
      <h2 className="text-xs font-semibold tracking-widest text-slate-400 dark:text-emerald-500/70 mb-3 uppercase text-center shrink-0">
        {title}
      </h2>
      <div className="flex-1 w-full flex flex-col items-center justify-center overflow-hidden">
        {children}
      </div>
    </div>
  );
}