import React, { useState, useEffect } from "react";
import { trainModel, reset, addExample, loadModel, loadDataset, saveDataset } from "../../services/model";
import { FiPlay, FiSquare, FiRefreshCw } from "react-icons/fi";

export default function Controls({ mode }) {
  const isNumbers = mode === "numeros";
  const elements = isNumbers ? ["1", "2", "3", "4", "5"] : ["A", "E", "I", "O", "U"];
  
  const METRA_MUESTRAS = 300;

  const initialProgress = () => {
    const base = {};
    elements.forEach(el => base[el] = 0);
    return base;
  };

  const [status, setStatus] = useState("Listo para capturar");
  const [progress, setProgress] = useState(initialProgress);
  const [activeLabel, setActiveLabel] = useState(null);

  const elementosListosContador = elements.filter(el => (progress[el] || 0) >= METRA_MUESTRAS).length;
  const puedeEntrenar = elementosListosContador >= 3;

  useEffect(() => {
    setProgress(initialProgress());
    setActiveLabel(null);
    setStatus(`Listo para entrenar ${isNumbers ? "números" : "vocales"}`);
  }, [mode]);

  useEffect(() => {
    const loadSavedData = async () => {
      const loaded = loadDataset(mode);
      if (loaded && loaded.dataset) {
        const newProgress = { ...initialProgress() };
        Object.keys(loaded.dataset).forEach(label => {
          if (newProgress[label] !== undefined) {
            newProgress[label] = loaded.dataset[label].length;
          }
        });
        setProgress(newProgress);
      }
      const model = await loadModel(mode);
      if (model) setStatus("✅ Modelo cargado desde memoria");
    };
    loadSavedData();
  }, [mode]);

  useEffect(() => {
    const handleProgressUpdate = () => {
      const loaded = loadDataset(mode);
      if (loaded && loaded.dataset) {
        const newProgress = { ...initialProgress() };
        Object.keys(loaded.dataset).forEach(label => {
          if (newProgress[label] !== undefined) {
            newProgress[label] = loaded.dataset[label].length;
          }
        });
        setProgress(newProgress);
      }
    };
    window.addEventListener("dataset-updated", handleProgressUpdate);
    window.addEventListener("model-trained-refresh", handleProgressUpdate);
    return () => {
      window.removeEventListener("dataset-updated", handleProgressUpdate);
      window.removeEventListener("model-trained-refresh", handleProgressUpdate);
    };
  }, [mode]);

  const capture = (label) => {
    window.captureLabel = label;
    setActiveLabel(label);
    setStatus(`📸 Capturando ${label}...`);

    window.onExampleAdded = (landmarks) => {
      addExample(label, landmarks, METRA_MUESTRAS);
      saveDataset(mode); 
      
      setTimeout(() => {
        window.dispatchEvent(new Event("dataset-updated"));
      }, 0);

      setProgress((prev) => {
        const updated = { ...prev };
        if (updated[label] !== undefined && updated[label] < METRA_MUESTRAS) {
          updated[label] += 1;
        }
        if (updated[label] >= METRA_MUESTRAS) {
          window.captureLabel = null;
          setActiveLabel(null);
          setStatus(`✅ Captura completa de ${label}`);
          
          setTimeout(() => {
            window.dispatchEvent(new Event("model-trained-refresh"));
          }, 0);
        }
        return updated;
      });
    };
  };

  const stop = () => {
    window.captureLabel = null;
    setActiveLabel(null);
    setStatus("⛔ Captura detenida manualmente");
  };

  const train = async () => {
    setStatus("⚙️ Entrenando modelo...");
    await trainModel(mode, elements);
    setStatus("✅ Modelo entrenado correctamente");
    window.dispatchEvent(new Event("model-trained-refresh"));
  };

  const restart = () => {
    reset(mode);
    setStatus("♻️ Reiniciado base de datos");
    setProgress(initialProgress());
    setActiveLabel(null);
    window.dispatchEvent(new Event("model-trained-refresh"));
  };

  return (
    <div className="flex flex-col w-full h-full justify-between gap-4 overflow-hidden">
      <div className="grid grid-cols-5 gap-2 shrink-0">
        {elements.map((v) => {
          const isCompleted = progress[v] >= METRA_MUESTRAS;
          const isCurrentCapturing = activeLabel === v;

          return (
            <button
              key={v}
              onClick={() => capture(v)}
              disabled={isCompleted || (activeLabel !== null && !isCurrentCapturing)}
              className={`rounded-xl py-2.5 text-base font-bold shadow-xs transition-all duration-200 w-full active:scale-95
                ${isCompleted ? "bg-slate-100 dark:bg-emerald-950/20 text-slate-400 dark:text-emerald-800/40 cursor-not-allowed" : 
                  isCurrentCapturing ? "bg-amber-500 text-white animate-pulse" : 
                  activeLabel !== null ? "bg-slate-50 dark:bg-[#060c09] text-slate-300 dark:text-slate-700 cursor-not-allowed" : 
                  "bg-gradient-to-br from-emerald-600 to-teal-500 text-white hover:scale-[1.03]"}`}
            >
              {v}
            </button>
          );
        })}
      </div>

      <div className="space-y-2 flex-1 flex flex-col justify-end">
        <button 
          onClick={stop} 
          disabled={!activeLabel} 
          className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-2 text-xs font-semibold transition-all disabled:opacity-20"
        >
          <FiSquare /> Detener captura
        </button>
        
        <button 
          onClick={train} 
          disabled={activeLabel !== null || !puedeEntrenar} 
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white flex items-center justify-center gap-2 text-sm font-semibold transition-all
            disabled:from-slate-100 disabled:to-slate-100 dark:disabled:from-[#0c1612] dark:disabled:to-[#0c1612] 
            disabled:text-slate-400 dark:disabled:text-slate-600 disabled:opacity-100 disabled:cursor-not-allowed"
        >
          <FiPlay /> Entrenar modelo {!puedeEntrenar && `(${elementosListosContador}/3)`}
        </button>
        
        <button 
          onClick={restart} 
          disabled={activeLabel !== null} 
          className="w-full py-2 rounded-xl bg-transparent hover:bg-rose-50 dark:hover:bg-rose-950/10 border border-rose-200 dark:border-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center justify-center gap-2 text-xs font-medium transition-all"
        >
          <FiRefreshCw /> Reiniciar base de datos
        </button>

        <p className="text-[11px] text-center font-medium tracking-wide text-slate-400 dark:text-emerald-500/60 min-h-[16px] mt-1">
          {status}
        </p>
      </div>
    </div>
  );
}