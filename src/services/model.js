import * as tf from "@tensorflow/tfjs";

let dataset = {};
let rawLandmarks = {};
let model = null;
let isModelReady = false; 

const STORAGE_PREFIX_MODEL = "hand-sign-model";
const STORAGE_PREFIX_DATASET = "hand-sign-dataset";
const STORAGE_PREFIX_RAW = "hand-sign-raw-landmarks";

let currentModeLoaded = null;

export const SAMPLE_MIN = 200;
export const SAMPLE_MAX = 400;

export const checkIsModelReady = () => isModelReady;

export const checkIsModelCompleteFor = (mode, requiredLabels) => {
  if (!isModelReady) return false;
  
  try {
    const { modelKey } = getStorageKeys(mode);
    const metadataStr = localStorage.getItem(`${modelKey}_metadata`);
    
    if (!metadataStr) {
      const trainedLabels = Object.keys(dataset).filter(k => dataset[k] && dataset[k].length > 0 && k !== "Ruido_Fondo");
      return requiredLabels.every(lbl => trainedLabels.includes(lbl));
    }
    
    const metadata = JSON.parse(metadataStr);
    return requiredLabels.every(lbl => metadata.trainedLabels.includes(lbl));
  } catch (e) {
    return false;
  }
};

const getStorageKeys = (mode) => {
  const suffix = mode === "numeros" ? "_numeros" : "_vocales";
  return {
    modelKey: `${STORAGE_PREFIX_MODEL}${suffix}`,
    datasetKey: `${STORAGE_PREFIX_DATASET}${suffix}`,
    rawKey: `${STORAGE_PREFIX_RAW}${suffix}`
  };
};

function normalizeLandmarks(landmarks) {
  if (!landmarks) return null;
  const wrist = landmarks[0];
  const centered = landmarks.map((pt) => ({
    x: pt.x - wrist.x,
    y: pt.y - wrist.y,
    z: pt.z - wrist.z,
  }));
  const maxDist = Math.max(
    ...centered.map((pt) => Math.sqrt(pt.x ** 2 + pt.y ** 2 + pt.z ** 2))
  );
  return centered.map((pt) => ({
    x: pt.x / maxDist,
    y: pt.y / maxDist,
    z: pt.z / maxDist,
  }));
}

export function formatLandmarks(landmarks) {
  if (!landmarks) return null;
  return landmarks.flatMap((p) => [p.x, p.y, p.z]);
}

export function addExample(label, landmarks, targetMax = SAMPLE_MAX) {
  if (!dataset[label]) dataset[label] = [];
  if (!rawLandmarks[label]) rawLandmarks[label] = [];

  const normalized = normalizeLandmarks(landmarks);
  const vector = formatLandmarks(normalized);

  if (vector && dataset[label].length < targetMax) {
    dataset[label].push(vector);
    rawLandmarks[label].push(normalized);
  }
  return dataset[label].length;
}

export function deleteExamples(label, mode) {
  if (dataset[label]) {
    dataset[label] = [];
    rawLandmarks[label] = [];
    saveDataset(mode); 
    isModelReady = false; 
  }
}

export function saveDataset(mode) {
  try {
    const { datasetKey, rawKey } = getStorageKeys(mode);
    localStorage.setItem(datasetKey, JSON.stringify(dataset));
    localStorage.setItem(rawKey, JSON.stringify(rawLandmarks));
    console.log(` [${mode}] Dataset respaldado en disco de forma segura.`);
    return { success: true };
  } catch (error) {
    if (error.name === "QuotaExceededError" || error.code === 22) {
      return {
        success: false,
        reason: "storage_full",
        message: "El almacenamiento local está lleno. No se pueden guardar más muestras."
      };
    }
    console.error("Error guardando dataset:", error);
    return { success: false };
  }
}

export function loadDataset(mode) {
  try {
    const { datasetKey, rawKey } = getStorageKeys(mode);
    const savedDataset = localStorage.getItem(datasetKey);
    const savedRaw = localStorage.getItem(rawKey);
    
    if (currentModeLoaded !== mode) {
      dataset = {};
      rawLandmarks = {};
      currentModeLoaded = mode;
    }

    if (savedDataset) dataset = JSON.parse(savedDataset);
    if (savedRaw) rawLandmarks = JSON.parse(savedRaw);
    return { dataset, rawLandmarks };
  } catch (error) {
    console.error("Error cargando dataset:", error);
    return null;
  }
}

async function saveModel(mode) {
  if (!model) return;
  try {
    const { modelKey } = getStorageKeys(mode);
    await model.save(`localstorage://${modelKey}`);
  } catch (error) {
    console.error("Error guardando modelo:", error);
  }
}

export async function loadModel(mode) {
  try {
    const { modelKey } = getStorageKeys(mode);
    model = await tf.loadLayersModel(`localstorage://${modelKey}`);
    
    const metadataStr = localStorage.getItem(`${modelKey}_metadata`);
    if (metadataStr) {
      const metadata = JSON.parse(metadataStr);
      isModelReady = metadata.isComplete || false;
    } else {
      isModelReady = true;
    }
    
    return model;
  } catch (error) {
    isModelReady = false;
    return null;
  }
}

export async function trainModel(mode, requiredLabels = []) {
  const labels = Object.keys(dataset).filter(k => dataset[k].length > 0 && k !== "Ruido_Fondo");
  let xs = [];
  let ys = [];

  labels.forEach((label, index) => {
    dataset[label].forEach((vector) => {
      xs.push(vector);
      ys.push(index);
    });
  });

  if (xs.length === 0) return null;

  const indexRuido = labels.length; 
  const totalMuestrasReales = xs.length;
  const cantidadRuido = Math.max(100, Math.floor(totalMuestrasReales * 0.25));

  for (let i = 0; i < cantidadRuido; i++) {
    const vectorRuido = Array.from({ length: 63 }, () => (Math.random() * 2 - 1) * 0.4);
    xs.push(vectorRuido);
    ys.push(indexRuido);
  }
  
  const todasLasLabels = [...labels, "Ruido_Fondo"];

  const xsTensor = tf.tensor2d(xs);
  const ysTensor = tf.oneHot(tf.tensor1d(ys, "int32"), todasLasLabels.length);

  if (model) model.dispose();

  model = tf.sequential();
  model.add(tf.layers.dense({ units: 128, activation: "relu", inputShape: [63] }));
  model.add(tf.layers.dropout({ rate: 0.15 })); 
  model.add(tf.layers.dense({ units: 64, activation: "relu" }));
  model.add(tf.layers.dense({ units: todasLasLabels.length, activation: "softmax" }));

  model.compile({ 
    optimizer: tf.train.adam(0.001), 
    loss: "categoricalCrossentropy", 
    metrics: ["accuracy"] 
  });

  await model.fit(xsTensor, ysTensor, {
    epochs: 40, 
    shuffle: true,
    batchSize: 32
  });

  xsTensor.dispose();
  ysTensor.dispose();

  await saveModel(mode);
  const saveResult = saveDataset(mode);
  
  if (!saveResult.success && saveResult.reason === "storage_full") {
    return { success: false, reason: "storage_full", message: saveResult.message };
  }
  
  const { modelKey } = getStorageKeys(mode);
  const metadata = {
    trainedLabels: labels,
    trainedAt: Date.now(),
    isComplete: requiredLabels.length > 0 ? requiredLabels.every(lbl => labels.includes(lbl)) : true
  };
  localStorage.setItem(`${modelKey}_metadata`, JSON.stringify(metadata));
  
  isModelReady = true;

  return { success: true, model };
}

export function predict(landmarks, currentElements = []) {
  if (!model || !isModelReady) return null; 

  if (currentElements.length > 0) {
    const datasetLabels = Object.keys(dataset);
    const faltanElementos = currentElements.some(el => !datasetLabels.includes(el) || !dataset[el] || dataset[el].length === 0);
    if (faltanElementos) return null; 
  }
  
  const normalized = normalizeLandmarks(landmarks);
  const vector = formatLandmarks(normalized);
  if (!vector) return null;

  const input = tf.tensor2d([vector]);
  const prediction = model.predict(input);
  const probs = prediction.dataSync();
  const maxProb = Math.max(...probs);
  const resultIndex = probs.indexOf(maxProb);

  input.dispose();
  prediction.dispose();

  const trainedLabels = Object.keys(dataset).filter(k => dataset[k].length > 0 && k !== "Ruido_Fondo");
  const todasLasLabels = [...trainedLabels, "Ruido_Fondo"];
  const predictedLabel = todasLasLabels[resultIndex];

  if (predictedLabel === "Ruido_Fondo" || (currentElements.length > 0 && !currentElements.includes(predictedLabel))) {
    return { label: "No registrada", confidence: maxProb };
  }

  return {
    label: predictedLabel || "Desconocido",
    confidence: maxProb
  };
}

export function reset(mode) {
  dataset = {};
  rawLandmarks = {};
  isModelReady = false;
  if (model) model.dispose();
  model = null;
  try {
    const { modelKey, datasetKey, rawKey } = getStorageKeys(mode);
    localStorage.removeItem(modelKey);
    localStorage.removeItem(`${modelKey}_metadata`);
    localStorage.removeItem(datasetKey);
    localStorage.removeItem(rawKey);
  } catch (error) {
    console.error(error);
  }
}

export function getReferenceLandmarks(letter) {
  const list = rawLandmarks[letter];
  if (!list || list.length === 0) return [];
  const numPoints = list[0].length;
  const n = list.length;

  return Array(numPoints).fill(null).map((_, i) => {
    let sumX = 0, sumY = 0;
    for (const sample of list) {
      sumX += sample[i].x;
      sumY += sample[i].y;
    }
    return { x: sumX / n, y: sumY / n };
  });
}