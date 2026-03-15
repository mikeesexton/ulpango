(function initIvriQuestAppSpeech(global) {
"use strict";

const app = global.IvriQuestApp = global.IvriQuestApp || {};
const speech = app.speech = app.speech || {};

function getRuntime() {
  return app.runtime || {};
}

function getSpeechSynthesis() {
  if (!global.speechSynthesis) return null;
  if (typeof global.speechSynthesis.speak !== "function") return null;
  if (typeof global.speechSynthesis.cancel !== "function") return null;
  if (typeof global.speechSynthesis.getVoices !== "function") return null;
  return global.speechSynthesis;
}

function cleanText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function containsHebrew(text) {
  return /[\u0590-\u05FF]/.test(String(text || ""));
}

function getVoiceCache() {
  const runtime = getRuntime();
  if (!Array.isArray(runtime.speechVoiceCache)) {
    runtime.speechVoiceCache = [];
  }
  return runtime.speechVoiceCache;
}

function loadVoices() {
  const synth = getSpeechSynthesis();
  if (!synth) return [];

  try {
    const voices = synth.getVoices().filter(Boolean);
    getRuntime().speechVoiceCache = voices;
    return voices;
  } catch {
    getRuntime().speechVoiceCache = [];
    return [];
  }
}

speech.buildHebrewSpeechText = speech.buildHebrewSpeechText || function buildHebrewSpeechText(options = {}) {
  const overrideNiqqud = cleanText(options.speechOverrideNiqqud);
  if (overrideNiqqud) return overrideNiqqud;

  const overridePlain = cleanText(options.speechOverridePlain);
  if (overridePlain) return overridePlain;

  const niqqud = cleanText(options.niqqud);
  if (niqqud) return niqqud;

  return cleanText(options.plain);
};

speech.buildSpeechPayload = speech.buildSpeechPayload || function buildSpeechPayload(options = {}) {
  const text = speech.buildHebrewSpeechText(options);
  if (!text || !containsHebrew(text)) return null;

  return {
    text,
    lang: "he-IL",
    source: options.source === "prompt" ? "prompt" : "answer",
    cacheKey: `${options.source === "prompt" ? "prompt" : "answer"}:${text}`,
  };
};

speech.primeVoices = speech.primeVoices || function primeVoices() {
  const runtime = getRuntime();
  const synth = getSpeechSynthesis();
  if (!synth) {
    runtime.speechVoiceCache = [];
    return [];
  }

  const refreshVoices = () => {
    loadVoices();
    runtime.helpers?.renderAll?.();
    return getVoiceCache();
  };

  if (!runtime.speechVoicesListenerAttached && typeof synth.addEventListener === "function") {
    synth.addEventListener("voiceschanged", refreshVoices);
    runtime.speechVoicesListenerAttached = true;
  }

  return refreshVoices();
};

speech.getHebrewVoice = speech.getHebrewVoice || function getHebrewVoice() {
  const voices = getVoiceCache().length ? getVoiceCache() : loadVoices();
  return voices.find((voice) => /^he(?:-|$)/i.test(String(voice?.lang || "").trim())) || null;
};

speech.isSupported = speech.isSupported || function isSupported() {
  if (typeof global.SpeechSynthesisUtterance !== "function") return false;
  return Boolean(speech.getHebrewVoice());
};

speech.isEnabled = speech.isEnabled || function isEnabled() {
  return Boolean(getRuntime().state?.speech?.enabled);
};

speech.cancel = speech.cancel || function cancel() {
  const synth = getSpeechSynthesis();
  if (!synth) return;
  try {
    synth.cancel();
  } catch {
    // Ignore browser speech cancellation failures.
  }
};

speech.speak = speech.speak || function speak(payload, options = {}) {
  const runtime = getRuntime();
  if (!speech.isEnabled() && options.force !== true) return false;
  if (runtime.helpers?.isUiLocked?.()) return false;
  if (!payload || !payload.text) return false;
  if (!speech.isSupported()) return false;

  const synth = getSpeechSynthesis();
  const voice = speech.getHebrewVoice();
  if (!synth || !voice) return false;

  let utterance = null;
  try {
    utterance = new global.SpeechSynthesisUtterance(payload.text);
  } catch {
    return false;
  }

  utterance.lang = payload.lang || "he-IL";
  utterance.voice = voice;

  speech.cancel();

  try {
    synth.speak(utterance);
    return true;
  } catch {
    return false;
  }
};
})(typeof window !== "undefined" ? window : globalThis);
