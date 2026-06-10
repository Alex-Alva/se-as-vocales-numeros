import React, { useEffect, useRef, useState } from "react";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import * as cam from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { FiVideo, FiVideoOff } from "react-icons/fi";

export default function Camera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const handsRef = useRef(null);
  const isMountedRef = useRef(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

useEffect(() => {
  isMountedRef.current = true;

const hands = new Hands({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

hands.onResults((results) => {
  if (
    !isMountedRef.current ||
    !canvasRef.current ||
    !videoRef.current
  ) {
    return;
  }
      const ctx = canvasRef.current.getContext("2d");
      ctx.save();
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      if (results.multiHandLandmarks?.length) {
        const landmarks = results.multiHandLandmarks[0];
        
drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
  color: "#10b981",
  lineWidth: 3,
});
        
        drawLandmarks(ctx, landmarks, {
          color: "#34d399",
          lineWidth: 1.5,
          radius: 4,
        });

        if (window.updatePrediction) window.updatePrediction(landmarks);
        if (window.captureLabel && window.onExampleAdded)
          window.onExampleAdded(landmarks);
      } else {
        if (window.updatePrediction) window.updatePrediction(null);
      }
      ctx.restore();
    });

    handsRef.current = hands;

return () => {
  isMountedRef.current = false;

  if (cameraRef.current) {
    cameraRef.current.stop();
    cameraRef.current = null;
  }

  handsRef.current = null;
};
  }, []);

const startCamera = async () => {
  if (videoRef.current && !cameraRef.current) {
    setIsInitializing(true);

    try {
      cameraRef.current = new cam.Camera(videoRef.current, {
onFrame: async () => {
  if (
    !isMountedRef.current ||
    !handsRef.current ||
    !videoRef.current
  ) {
    return;
  }

  await handsRef.current.send({
    image: videoRef.current,
  });
},
        width: 640,
        height: 480,
      });

      await cameraRef.current.start();
      setCameraActive(true);
    } catch (error) {
      console.error("Error al iniciar cámara:", error);
    } finally {
      setIsInitializing(false);
    }
  }
};

const stopCamera = () => {
  try {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }

    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject
        .getTracks()
        .forEach(track => track.stop());

      videoRef.current.srcObject = null;
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    }

    setCameraActive(false);

    if (window.updatePrediction) {
      window.updatePrediction(null);
    }
  } catch (err) {
    console.error("Error al detener cámara:", err);
  }
};

  const toggleCamera = () => {
    if (cameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  return (
    // Removimos los bordes dobles y fondos duplicados del contenedor superior para que la tarjeta de la vista controle el diseño.
    <div className="w-full flex flex-col items-center justify-center">
      
      {/* Video interno oculto */}
      <video ref={videoRef} className="hidden" width="640" height="480" />

      {/* CORRECCIÓN: Cambiado de aspect-video a aspect-[4/3] para calzar de manera perfecta con la resolución 640x480 */}
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-900/10 dark:bg-[#060c09] border border-slate-200/50 dark:border-emerald-950/40 shadow-inner flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          className="w-full h-full object-cover transform -scale-x-100" // -scale-x-100 da un efecto espejo natural para el usuario
        />
        {isInitializing && (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-sm z-20">
    
    <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />

    <span className="mt-3 text-xs font-semibold tracking-wider uppercase text-emerald-500">
      Iniciando cámara...
    </span>

  </div>
)}
       {!cameraActive && !isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-emerald-950/60 p-4 text-center bg-slate-950/5 backdrop-blur-xs">
            <FiVideoOff className="text-4xl mb-3 text-slate-300 dark:text-emerald-900/30" />
            <p className="text-sm font-medium">Cámara inactiva.</p>
            <p className="text-xs text-slate-400/80 dark:text-emerald-950/40 mt-1">Presiona el botón inferior para iniciar el reconocimiento.</p>
          </div>
        )}
      </div>

      {/* Botón de Control */}
<button
  onClick={toggleCamera}
  disabled={isInitializing}
        className={`disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-semibold shadow-md transition-all duration-200 active:scale-95 ${
          cameraActive
            ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-950/10"
            : "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-emerald-950/20 hover:from-emerald-500 hover:to-teal-400"
        }`}
      >
{cameraActive ? (
  <>
    <FiVideoOff className="text-base" />
    Desactivar Cámara
  </>
) : (
  <>
    <FiVideo className="text-base" />
    {isInitializing ? "Conectando..." : "Activar Cámara"}
  </>
)}
      </button>

      {/* Estado */}
      <span className={`mt-3 text-xs font-semibold tracking-wider uppercase transition-colors ${
        cameraActive 
          ? "text-emerald-600 dark:text-emerald-400" 
          : "text-slate-400 dark:text-slate-500"
      }`}>
        {cameraActive ? "● En Vivo" : "Apagado"}
      </span>
    </div>
  );
}