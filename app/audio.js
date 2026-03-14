(function initIvriQuestAppAudio(global) {
"use strict";

const app = global.IvriQuestApp = global.IvriQuestApp || {};
const audio = app.audio = app.audio || {};

function getRuntime() {
  return app.runtime || {};
}

function getAudioPlayers() {
  const runtime = getRuntime();
  if (!(runtime.audioPlayers instanceof Map)) {
    runtime.audioPlayers = new Map();
  }
  return runtime.audioPlayers;
}

audio.buildAudioCueSources = audio.buildAudioCueSources || function buildAudioCueSources(baseName) {
  const runtime = getRuntime();
  const appBuild = runtime.APP_BUILD || "dev";
  return Object.freeze([
    { src: `./assets/sounds/${baseName}.ogg?v=${appBuild}`, type: 'audio/ogg; codecs="vorbis"' },
    { src: `./assets/sounds/${baseName}.mp3?v=${appBuild}`, type: "audio/mpeg" },
  ]);
};

audio.resolveAudioCueSource = audio.resolveAudioCueSource || function resolveAudioCueSource(sources) {
  if (!Array.isArray(sources) || !sources.length || typeof global.Audio !== "function") {
    return null;
  }

  let probe = null;
  try {
    probe = new global.Audio();
  } catch {
    probe = null;
  }

  for (const source of sources) {
    const src = String(source?.src || "").trim();
    if (!src) continue;

    const type = String(source?.type || "").trim();
    if (!type || !probe || typeof probe.canPlayType !== "function") {
      return src;
    }

    try {
      const support = probe.canPlayType(type);
      if (support === "probably" || support === "maybe") {
        return src;
      }
    } catch {
      return src;
    }
  }

  const fallback = sources.find((source) => String(source?.src || "").trim());
  return fallback ? String(fallback.src).trim() : null;
};

audio.getAudioPlayer = audio.getAudioPlayer || function getAudioPlayer(cueId) {
  const runtime = getRuntime();
  const audioPlayers = getAudioPlayers();
  if (audioPlayers.has(cueId)) {
    return audioPlayers.get(cueId);
  }

  const audioCues = runtime.AUDIO_CUES || {};
  const src = audio.resolveAudioCueSource(audioCues[cueId]);
  if (!src || typeof global.Audio !== "function") {
    audioPlayers.set(cueId, null);
    return null;
  }

  try {
    const player = new global.Audio(src);
    player.preload = "auto";
    if (typeof player.load === "function") {
      player.load();
    }
    audioPlayers.set(cueId, player);
    return player;
  } catch {
    audioPlayers.set(cueId, null);
    return null;
  }
};

audio.primeAudioCues = audio.primeAudioCues || function primeAudioCues() {
  const runtime = getRuntime();
  if (runtime.audioCuePreloadStarted || !runtime.state?.audio?.enabled) return;
  runtime.audioCuePreloadStarted = true;

  Object.keys(runtime.AUDIO_CUES || {}).forEach((cueId) => {
    audio.getAudioPlayer(cueId);
  });
};

audio.playSoundCue = audio.playSoundCue || function playSoundCue(cueId) {
  const runtime = getRuntime();
  if (!runtime.state?.audio?.enabled) return;

  const player = audio.getAudioPlayer(cueId);
  if (!player || typeof player.play !== "function") return;

  try {
    player.currentTime = 0;
  } catch {
    // Ignore currentTime reset failures.
  }

  try {
    const playback = player.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(() => {});
    }
  } catch {
    // Ignore autoplay and codec failures.
  }
};

audio.playAnswerFeedbackSound = audio.playAnswerFeedbackSound || function playAnswerFeedbackSound(isCorrect) {
  const runtime = getRuntime();
  if (!isCorrect) {
    audio.playSoundCue("answerWrong");
    return;
  }

  const streakInterval = runtime.constants?.STREAK_SOUND_INTERVAL || 4;
  const streakCount = Math.max(0, Number(runtime.state?.sessionStreak || 0));
  if (streakCount > 0 && streakCount % streakInterval === 0) {
    audio.playSoundCue("answerStreak");
    return;
  }

  audio.playSoundCue("answerCorrect");
};
})(typeof window !== "undefined" ? window : globalThis);
