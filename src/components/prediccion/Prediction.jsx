import React, { useEffect, useState, useRef } from "react";
import { predict, getReferenceLandmarks, checkIsModelReady, checkIsModelCompleteFor } from "../../services/model";
import { 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertTriangle, 
  FiClock, 
  FiActivity, 
  FiTarget, 
  FiAward,
  FiLoader,
  FiLock,
  FiPlay
} from "react-icons/fi";

export default function Prediction({ mode }) {
  const isNumbers = mode === "numeros";
  const defaultElements = isNumbers ? ["1", "2", "3", "4", "5"] : ["A", "E", "I", "O", "U"];

  const [modelReady, setModelReady] = useState(checkIsModelReady());
  const [modelComplete, setModelComplete] = useState(false);
  const [trainedElements, setTrainedElements] = useState([]);
  
  const [label, setLabel] = useState("Esperando...");
  const [status, setStatus] = useState("idle");
  const [countCorrect, setCountCorrect] = useState(0);
  const [countError, setCountError] = useState(0);
  const [opMode, setOpMode] = useState("explore");
  const [targetLetter, setTargetLetter] = useState(null);
  const [round, setRound] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [failedLetter, setFailedLetter] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10); 

  const [stabilizingLabel, setStabilizingLabel] = useState(null);
  const [stabilizeProgress, setStabilizeProgress] = useState(0);

  const canvasRef = useRef(null);
  const [isHtmlDark, setIsHtmlDark] = useState(false);

  const stabilityRef = useRef({
    currentLabel: null,
    startTime: null,
    durationNeeded: 2000 
  });

  const updateTrainedElements = () => {
    try {
      const saved = localStorage.getItem(
        isNumbers ? "hand-sign-dataset_numeros" : "hand-sign-dataset_vocales"
      );
      if (saved) {
        const parsed = JSON.parse(saved);
        const trained = defaultElements.filter(el => parsed[el] && parsed[el].length > 0);
        setTrainedElements(trained);
        return;
      }
    } catch (e) {
      console.error("Error leyendo elementos entrenados", e);
    }
    setTrainedElements([]);
  };

  useEffect(() => {
    const handleRefresh = () => {
      setModelReady(checkIsModelReady());
      setModelComplete(checkIsModelCompleteFor(mode, defaultElements));
      updateTrainedElements();
    };
    window.addEventListener("model-trained-refresh", handleRefresh);
    handleRefresh();
    return () => window.removeEventListener("model-trained-refresh", handleRefresh);
  }, [mode]);

  useEffect(() => {
    const checkDark = () => setIsHtmlDark(document.documentElement.classList.contains("dark"));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    resetGame();
    resetStability();
  }, [opMode, mode]);

  useEffect(() => {
    if (opMode === "evaluate" && targetLetter && !answered && !gameOver && modelReady) {
      setTimeLeft(10); 
      
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [targetLetter, answered, opMode, gameOver, modelReady]);

  const resetStability = () => {
    stabilityRef.current.currentLabel = null;
    stabilityRef.current.startTime = null;
    setStabilizingLabel(null);
    setStabilizeProgress(0);
  };

  const handleTimeout = () => {
    if (answered || gameOver) return;
    setAnswered(true);
    setLabel(`⏱️ Tiempo agotado`);
    setStatus("error");
    setCountError(c => c + 1);
    setFailedLetter(targetLetter);
    resetStability();
  };

  useEffect(() => {
    if (!failedLetter || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const points = getReferenceLandmarks(failedLetter) || [];
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = isHtmlDark ? "#060c09" : "#f8fafc";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (points.length > 0) {
      const xs = points.map((p) => p.x);
      const ys = points.map((p) => p.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);
      const scale = Math.min(canvasRef.current.width / (maxX - minX), canvasRef.current.height / (maxY - minY)) * 0.7;
      const offsetX = (canvasRef.current.width - (maxX - minX) * scale) / 2 - minX * scale;
      const offsetY = (canvasRef.current.height - (maxY - minY) * scale) / 2 - minY * scale;

      const HAND_CONNECTIONS = [
        [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8],
        [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16],
        [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]
      ];

      ctx.strokeStyle = isHtmlDark ? "#047857" : "#10b981";
      ctx.lineWidth = 2;
      HAND_CONNECTIONS.forEach(([start, end]) => {
        const p1 = points[start], p2 = points[end];
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x * scale + offsetX, p1.y * scale + offsetY);
          ctx.lineTo(p2.x * scale + offsetX, p2.y * scale + offsetY);
          ctx.stroke();
        }
      });
    }
  }, [failedLetter, isHtmlDark]);

  useEffect(() => {
    window.updatePrediction = (landmarks) => {
      if (opMode === "explore" && trainedElements.length < 3) {
        setLabel("🔒 Modo Explorar requiere mínimo 3 señas entrenadas");
        setStatus("idle");
        return;
      }
      if (opMode === "evaluate" && !modelComplete) {
        setLabel("🔒 Modo Evaluar requiere modelo entrenado con todas las señas");
        setStatus("idle");
        return;
      }

      if (!modelReady) {
        setLabel("🔒 Requiere entrenamiento previo");
        setStatus("idle");
        return;
      }

      if (!landmarks) {
        resetStability();
        if (opMode === "explore") {
          setLabel("❌ Buscando mano...");
          setStatus("error");
        } else if (opMode === "evaluate" && targetLetter && !answered && !gameOver) {
          setLabel(`⚠️ No se detecta mano`);
          setStatus("warning");
        }
        return;
      }

      const result = predict(landmarks, opMode === "evaluate" ? defaultElements : trainedElements);
      
      if (!result) {
        setLabel("⚠️ Modelo sin entrenar");
        setStatus("warning");
        return;
      }

      const { label: predictedLabel, confidence } = result;
      const confidencePercent = Math.round(confidence * 100);
      const UMBRAL_ESTRICTO = 0.82;

      if (opMode === "explore") {
        if (confidence < UMBRAL_ESTRICTO || predictedLabel === "No registrada") {
          setLabel(`⚠️ Seña no reconocida`);
          setStatus("warning");
        } else {
          setLabel(`✋ Seña: ${predictedLabel} (${confidencePercent}%)`);
          setStatus("success");
        }
        return;
      }

      if (gameOver || !targetLetter || answered) return;

      if (confidence < UMBRAL_ESTRICTO || predictedLabel === "No registrada") {
        resetStability();
        setLabel(`🔍 Analizando posición...`);
        setStatus("idle");
        return;
      }

      const now = Date.now();
      if (stabilityRef.current.currentLabel !== predictedLabel) {
        stabilityRef.current.currentLabel = predictedLabel;
        stabilityRef.current.startTime = now;
        setStabilizingLabel(predictedLabel);
        setStabilizeProgress(0);
      } else {
        const elapsed = now - stabilityRef.current.startTime;
        const percentage = Math.min((elapsed / stabilityRef.current.durationNeeded) * 100, 100);
        setStabilizeProgress(percentage);

        setLabel(`⏳ Mantén la seña... (${Math.round(percentage)}%)`);
        setStatus("idle");

        if (elapsed >= stabilityRef.current.durationNeeded) {
          setAnswered(true);
          const finalPrediction = stabilityRef.current.currentLabel;
          resetStability();

          if (finalPrediction === targetLetter) {
            setLabel(`✅ ¡Correcto! Es ${targetLetter} (${confidencePercent}%)`);
            setStatus("success");
            setCountCorrect(c => c + 1);
            setFailedLetter(null);
          } else {
            setLabel(`❌ Error. Detectado: ${finalPrediction}`);
            setStatus("error");
            setCountError(c => c + 1);
            setFailedLetter(targetLetter);
          }
        }
      }
    };
  }, [opMode, targetLetter, gameOver, answered, mode, modelReady, modelComplete, trainedElements]);

  const resetGame = () => {
    setLabel(modelReady ? "Esperando..." : "🔒 Requiere entrenamiento previo");
    setStatus("idle");
    setTargetLetter(null);
    setFailedLetter(null);
    setCountCorrect(0);
    setCountError(0);
    setRound(0);
    setGameOver(false);
    setAnswered(false);
  };

  const nextRound = () => {
    if (round >= 10) {
      setGameOver(true);
      setTargetLetter(null);
      setLabel("🎉 Fin del juego");
      return;
    }
    const randomLetter = defaultElements[Math.floor(Math.random() * defaultElements.length)];
    setTargetLetter(randomLetter);
    setRound((r) => r + 1);
    setLabel(`👉 Haz la seña de: ${randomLetter}`);
    setStatus("idle");
    setFailedLetter(null);
    setAnswered(false);
    resetStability();
  };

  const startEvaluation = () => {
    if (!modelReady || !modelComplete) return;

    resetGame();
    nextRound();
  };

  const statusColors = {
    idle: "bg-slate-50 dark:bg-emerald-950/10 text-slate-600 dark:text-emerald-400/80 border border-slate-200/50 dark:border-emerald-950/30",
    success: "bg-emerald-500/5 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    error: "bg-rose-500/5 dark:bg-rose-950/10 text-rose-500 dark:text-rose-400 border border-rose-500/20",
    warning: "bg-amber-500/5 dark:bg-amber-950/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  };

  const renderBloqueo = (mensaje) => (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 text-center rounded-xl bg-slate-50/20 dark:bg-[#060c09]/10">
      <FiLock className="text-3xl text-amber-500/80 mb-2 animate-pulse" />
      <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400 dark:text-emerald-800">Predicción suspendida</h3>
      <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mt-1 leading-relaxed">{mensaje}</p>
    </div>
  );

  if (!modelReady) return renderBloqueo("Completa el entrenamiento en el panel superior para activar.");
  if (opMode === "explore" && trainedElements.length < 3) return renderBloqueo("Necesitas entrenar al menos 3 señas para usar el modo Explorar.");
  if (opMode === "evaluate" && !modelComplete) return renderBloqueo("Necesitas entrenar el modelo con las 5 señas completas para usar el modo Evaluar.");

  return (
    <div className="flex flex-col items-center w-full h-full justify-between gap-4 overflow-hidden">

      <div className="w-full flex p-1 rounded-xl bg-slate-100 dark:bg-[#060c09] border border-slate-200/60 dark:border-emerald-950/40 shrink-0">
        <button
          onClick={() => setOpMode("explore")}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            opMode === "explore" ? "bg-white dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-xs" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          Explorar
        </button>
        <button
          onClick={() => setOpMode("evaluate")}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            opMode === "evaluate" ? "bg-white dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-xs" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          Evaluar (Quiz)
        </button>
      </div>

      <div className={`w-full flex flex-col items-center justify-center gap-2 p-3 rounded-xl font-medium text-xs text-center transition-all duration-300 flex-1 min-h-[90px] max-h-[180px] overflow-hidden ${statusColors[status]}`}>
        <div className="flex items-center gap-2 justify-center flex-wrap">
          {stabilizeProgress > 0 && stabilizeProgress < 100 && <FiLoader className="animate-spin text-emerald-500 shrink-0" />}
          <span className="tracking-wide font-semibold break-words max-w-full">{label}</span>
        </div>

        {stabilizeProgress > 0 && stabilizeProgress < 100 && (
          <div className="w-full bg-slate-200 dark:bg-emerald-950/50 h-1 rounded-full overflow-hidden mt-1 max-w-[200px]">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-75" style={{ width: `${stabilizeProgress}%` }} />
          </div>
        )}

        {failedLetter && (
          <div className="mt-1 p-0.5 rounded-lg bg-white dark:bg-[#060c09] border border-slate-200/60 dark:border-emerald-950/40 shadow-xs animate-fadeIn shrink-0">
            <canvas ref={canvasRef} width={80} height={80} className="rounded" />
          </div>
        )}

        {opMode === "evaluate" && targetLetter && !answered && !gameOver && (
          <div className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10 mt-0.5 shrink-0">
            <FiClock size={10} /> {timeLeft}s restantes
          </div>
        )}
      </div>

      <div className="w-full shrink-0 flex flex-col gap-3">
        {opMode === "evaluate" && !targetLetter && !gameOver && (
          <>
            <button
              onClick={startEvaluation}
              disabled={!modelComplete}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700"
            >
              {modelComplete ? "Iniciar evaluación" : "🔒 Completa el entrenamiento"}
            </button>
            
            {!modelComplete && trainedElements.length < defaultElements.length && (
              <p className="text-[10px] text-amber-500 text-center -mt-1">
                Faltan {defaultElements.length - trainedElements.length} señas por guardar. Luego entrena el modelo.
              </p>
            )}
            
            {!modelComplete && trainedElements.length === defaultElements.length && (
              <p className="text-[10px] text-amber-500 text-center -mt-1">
                Todas las señas guardadas. Presiona "Entrenar modelo" arriba.
              </p>
            )}
          </>
        )}

        {opMode === "evaluate" && !gameOver && targetLetter && (
          <div className="w-full flex flex-col items-center gap-2">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full">
              <FiTarget size={11} className="text-emerald-500" /> 
              <span>Ronda: <strong className="text-slate-600 dark:text-slate-300">{round}/10</strong></span>
            </div>
            {answered && (
              <button onClick={nextRound} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-all active:scale-95">
                Siguiente Ronda
              </button>
            )}
          </div>
        )}

        {opMode === "evaluate" && (
          <div className="flex items-center justify-center gap-5 w-full py-1.5 rounded-xl bg-slate-50/50 dark:bg-[#060c09]/20 text-[11px] font-medium text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-transparent">
            <div>Aciertos: <span className="font-bold text-emerald-500">{countCorrect}</span></div>
            <div>Errores: <span className="font-bold text-rose-400">{countError}</span></div>
          </div>
        )}

        {gameOver && (
          <div className="w-full flex flex-col items-center p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center animate-fadeIn">
            <FiAward className="text-2xl text-amber-500 mb-0.5" />
            <h4 className="text-xs font-bold text-slate-700 dark:text-emerald-400">Evaluación Completa</h4>
            <p className="text-[11px] text-slate-500">Puntaje: <span className="font-bold text-emerald-600 dark:text-emerald-400">{countCorrect} / 10</span></p>
            <button onClick={resetGame} className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold underline hover:text-emerald-500">Volver a intentar</button>
          </div>
        )}
      </div>
    </div>
  );
}