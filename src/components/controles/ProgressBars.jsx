import React, { useState, useEffect } from "react";
import { deleteExamples, loadDataset } from "../../services/model";
import { FiTrash2 } from "react-icons/fi";
import { motion } from "framer-motion";

export default function ProgressBars({ mode }) {
  const isNumbers = mode === "numeros";
  const elements = isNumbers ? ["1", "2", "3", "4", "5"] : ["A", "E", "I", "O", "U"];
  const METRA_MUESTRAS = 300;

  const initialProgress = () => {
    const base = {};
    elements.forEach(el => base[el] = 0);
    return base;
  };

  const [progress, setProgress] = useState(initialProgress);

  const updateProgress = () => {
    const loaded = loadDataset();
    if (loaded && loaded.dataset) {
      const newProgress = { ...initialProgress() };
      Object.keys(loaded.dataset).forEach(label => {
        if (newProgress[label] !== undefined) {
          newProgress[label] = loaded.dataset[label].length;
        }
      });
      setProgress(newProgress);
    } else {
      setProgress(initialProgress());
    }
  };

  useEffect(() => {
    updateProgress();
    window.addEventListener("dataset-updated", updateProgress);
    window.addEventListener("model-trained-refresh", updateProgress);
    return () => {
      window.removeEventListener("dataset-updated", updateProgress);
      window.removeEventListener("model-trained-refresh", updateProgress);
    };
  }, [mode]);

  const borrarLetra = (letra) => {
    deleteExamples(letra);
    setProgress((prev) => ({ ...prev, [letra]: 0 }));
    window.dispatchEvent(new Event("model-trained-refresh"));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 w-full pt-2">
      {elements.map((v) => {
        const currentCount = progress[v] || 0;
        const pct = Math.min((currentCount / METRA_MUESTRAS) * 100, 100);

        return (
          <div key={v} className="flex flex-col gap-1 p-2.5 rounded-xl border border-slate-200/50 dark:border-emerald-950/30 bg-slate-50/50 dark:bg-[#040806]/40 backdrop-blur-xs">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-1.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-emerald-600 text-white text-[11px] font-bold">
                  {v}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {currentCount}/{METRA_MUESTRAS}
                </span>
              </div>
              
              <button
                onClick={() => borrarLetra(v)}
                className="p-1 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all group"
                title={`Borrar datos de ${v}`}
              >
                <FiTrash2 size={11} className="group-hover:scale-105" />
              </button>
            </div>

            <div className="w-full bg-slate-200/60 dark:bg-emerald-950/20 rounded-full h-1.5 overflow-hidden mt-1.5">
              <motion.div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.15 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}