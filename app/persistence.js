(function initIvriQuestAppPersistence(global) {
"use strict";

const app = global.IvriQuestApp = global.IvriQuestApp || {};
const persistence = app.persistence = app.persistence || {};

function getRuntime() {
  return app.runtime || {};
}

function getStorage() {
  return getRuntime().storage || null;
}

persistence.clearPersistedSession = persistence.clearPersistedSession || function clearPersistedSession() {
  const runtime = getRuntime();
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(runtime.constants.STORAGE_KEYS.session);
  } catch {
    // Ignore storage failures.
  }
};

persistence.loadLanguagePreference = persistence.loadLanguagePreference || function loadLanguagePreference() {
  const runtime = getRuntime();
  const storage = getStorage();
  if (!storage) return "en";

  try {
    const raw = storage.getItem(runtime.constants.STORAGE_KEYS.language);
    return raw === "he" ? "he" : "en";
  } catch {
    return "en";
  }
};

persistence.saveLanguagePreference = persistence.saveLanguagePreference || function saveLanguagePreference(value) {
  const runtime = getRuntime();
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(runtime.constants.STORAGE_KEYS.language, value === "he" ? "he" : "en");
  } catch {
    // Ignore write failures.
  }
};

persistence.loadThemePreference = persistence.loadThemePreference || function loadThemePreference() {
  const runtime = getRuntime();
  const storage = getStorage();
  if (!storage) return "dark";

  try {
    const raw = storage.getItem(runtime.constants.STORAGE_KEYS.theme);
    return raw === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
};

persistence.saveThemePreference = persistence.saveThemePreference || function saveThemePreference(value) {
  const runtime = getRuntime();
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(runtime.constants.STORAGE_KEYS.theme, value === "light" ? "light" : "dark");
  } catch {
    // Ignore write failures.
  }
};

persistence.loadSoundPreference = persistence.loadSoundPreference || function loadSoundPreference() {
  const runtime = getRuntime();
  const raw = runtime.storageApi.loadJson(runtime.constants.STORAGE_KEYS.sound, null);
  return {
    enabled: raw?.enabled === true,
  };
};

persistence.saveSoundPreference = persistence.saveSoundPreference || function saveSoundPreference(enabled) {
  const runtime = getRuntime();
  runtime.storageApi.saveJson(runtime.constants.STORAGE_KEYS.sound, {
    enabled: enabled === true,
  });
};

persistence.loadSpeechPreference = persistence.loadSpeechPreference || function loadSpeechPreference() {
  const runtime = getRuntime();
  const raw = runtime.storageApi.loadJson(runtime.constants.STORAGE_KEYS.speech, null);
  return {
    enabled: raw?.enabled === true,
  };
};

persistence.saveSpeechPreference = persistence.saveSpeechPreference || function saveSpeechPreference(enabled) {
  const runtime = getRuntime();
  runtime.storageApi.saveJson(runtime.constants.STORAGE_KEYS.speech, {
    enabled: enabled === true,
  });
};

persistence.hasSeenWelcomeModal = persistence.hasSeenWelcomeModal || function hasSeenWelcomeModal() {
  const runtime = getRuntime();
  const storage = getStorage();
  if (!storage) return false;

  try {
    return storage.getItem(runtime.constants.STORAGE_KEYS.welcomeSeen) === "1";
  } catch {
    return false;
  }
};

persistence.markWelcomeModalSeen = persistence.markWelcomeModalSeen || function markWelcomeModalSeen() {
  const runtime = getRuntime();
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(runtime.constants.STORAGE_KEYS.welcomeSeen, "1");
  } catch {
    // Ignore write failures.
  }
};

persistence.applySurveyLinks = persistence.applySurveyLinks || function applySurveyLinks() {
  const runtime = getRuntime();
  const el = runtime.el || {};
  [el.feedbackSurveyLink, el.welcomeSurveyLink].forEach((node) => {
    if (!node) return;
    node.setAttribute("href", runtime.constants.FEEDBACK_SURVEY_URL);
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  });
};

persistence.saveProgress = persistence.saveProgress || function saveProgress() {
  const runtime = getRuntime();
  runtime.storageApi.saveJson(runtime.constants.STORAGE_KEYS.progress, runtime.state.progress);
};

persistence.saveSentenceProgress = persistence.saveSentenceProgress || function saveSentenceProgress() {
  const runtime = getRuntime();
  runtime.storageApi.saveJson(runtime.constants.STORAGE_KEYS.sentenceProgress, runtime.state.sentenceProgress);
};

persistence.persistUiState = persistence.persistUiState || function persistUiState() {
  const runtime = getRuntime();
  runtime.storageApi.saveJson(runtime.constants.STORAGE_KEYS.ui, {
    route: runtime.state.route,
    lastPlayedMode: runtime.state.lastPlayedMode,
  });
};

persistence.persistSessionState = persistence.persistSessionState || function persistSessionState() {
  const runtime = getRuntime();
  const h = runtime.helpers || {};
  runtime.storageApi.saveJson(runtime.constants.STORAGE_KEYS.session, {
    mode: runtime.state.mode,
    route: runtime.state.route,
    lastPlayedMode: runtime.state.lastPlayedMode,
    sessionScore: runtime.state.sessionScore,
    sessionStreak: runtime.state.sessionStreak,
    showNiqqudInline: runtime.state.showNiqqudInline,
    currentQuestion: runtime.state.currentQuestion ? h.cloneLessonQuestionSnapshot(runtime.state.currentQuestion) : null,
    summary: {
      active: runtime.state.summary.active,
      game: runtime.state.summary.game,
      titleKey: runtime.state.summary.titleKey,
      titleVars: runtime.state.summary.titleVars,
      scoreKey: runtime.state.summary.scoreKey,
      scoreVars: runtime.state.summary.scoreVars,
      noteKey: runtime.state.summary.noteKey,
      noteVars: runtime.state.summary.noteVars,
      correctCount: runtime.state.summary.correctCount,
      incorrectCount: runtime.state.summary.incorrectCount,
      elapsedSeconds: runtime.state.summary.elapsedSeconds,
      mistakes: runtime.state.summary.mistakes,
    },
    lesson: {
      active: runtime.state.lesson.active,
      currentRound: runtime.state.lesson.currentRound,
      secondChanceCurrent: runtime.state.lesson.secondChanceCurrent,
      secondChanceTotal: runtime.state.lesson.secondChanceTotal,
      startMs: runtime.state.lesson.startMs,
      elapsedSeconds: runtime.state.lesson.elapsedSeconds,
      askedWordIds: runtime.state.lesson.askedWordIds,
      domainCounts: runtime.state.lesson.domainCounts,
      missedWordIds: runtime.state.lesson.missedWordIds,
      reviewQueue: runtime.state.lesson.reviewQueue,
      inReview: runtime.state.lesson.inReview,
      lessonStartIntroActive: runtime.state.lesson.lessonStartIntroActive,
      secondChanceIntroActive: runtime.state.lesson.secondChanceIntroActive,
      optionHistory: runtime.state.lesson.optionHistory,
      wrongAnswers: runtime.state.lesson.wrongAnswers,
      sessionMistakeIds: runtime.state.lesson.sessionMistakeIds,
    },
    sentenceBank: {
      active: runtime.state.sentenceBank.active,
      introActive: runtime.state.sentenceBank.introActive,
      inReview: runtime.state.sentenceBank.inReview,
      currentRound: runtime.state.sentenceBank.currentRound,
      secondChanceCurrent: runtime.state.sentenceBank.secondChanceCurrent,
      secondChanceTotal: runtime.state.sentenceBank.secondChanceTotal,
      startMs: runtime.state.sentenceBank.startMs,
      elapsedSeconds: runtime.state.sentenceBank.elapsedSeconds,
      askedSentenceIds: runtime.state.sentenceBank.askedSentenceIds,
      reviewQueue: runtime.state.sentenceBank.reviewQueue,
      currentQuestion: runtime.state.sentenceBank.currentQuestion
        ? h.cloneSentenceBankQuestionSnapshot?.(runtime.state.sentenceBank.currentQuestion)
        : null,
      wrongAnswers: runtime.state.sentenceBank.wrongAnswers,
      sessionMistakeKeys: runtime.state.sentenceBank.sessionMistakeKeys,
      availableScore: runtime.state.sentenceBank.availableScore,
    },
    abbreviation: {
      active: runtime.state.abbreviation.active,
      currentRound: runtime.state.abbreviation.currentRound,
      startMs: runtime.state.abbreviation.startMs,
      elapsedSeconds: runtime.state.abbreviation.elapsedSeconds,
      askedEntryIds: runtime.state.abbreviation.askedEntryIds,
      introActive: runtime.state.abbreviation.introActive,
      currentQuestion: runtime.state.abbreviation.currentQuestion
        ? h.cloneAbbreviationQuestionSnapshot(runtime.state.abbreviation.currentQuestion)
        : null,
      wrongAnswers: runtime.state.abbreviation.wrongAnswers,
      sessionMistakeIds: runtime.state.abbreviation.sessionMistakeIds,
    },
    match: {
      active: runtime.state.match.active,
      verbQueue: runtime.state.match.verbQueue,
      totalVerbs: runtime.state.match.totalVerbs,
      currentVerbIndex: runtime.state.match.currentVerbIndex,
      currentVerb: runtime.state.match.currentVerb,
      pairs: runtime.state.match.pairs,
      remainingPairs: runtime.state.match.remainingPairs,
      leftCards: runtime.state.match.leftCards,
      rightCards: runtime.state.match.rightCards,
      selectedLeftId: runtime.state.match.selectedLeftId,
      selectedRightId: runtime.state.match.selectedRightId,
      mismatchedCardIds: runtime.state.match.mismatchedCardIds,
      matchedCardIds: runtime.state.match.matchedCardIds,
      matchedPairIds: runtime.state.match.matchedPairIds,
      isResolving: runtime.state.match.isResolving,
      nextCardId: runtime.state.match.nextCardId,
      combo: runtime.state.match.combo,
      bestCombo: runtime.state.match.bestCombo,
      matchedCount: runtime.state.match.matchedCount,
      totalPairs: runtime.state.match.totalPairs,
      startMs: runtime.state.match.startMs,
      elapsedSeconds: runtime.state.match.elapsedSeconds,
      verbIntroActive: runtime.state.match.verbIntroActive,
      sessionMatched: runtime.state.match.sessionMatched,
      sessionTotalPairs: runtime.state.match.sessionTotalPairs,
      currentVerbHadMismatch: runtime.state.match.currentVerbHadMismatch,
      eligibleMasterWordId: runtime.state.match.eligibleMasterWordId,
      mismatchCount: runtime.state.match.mismatchCount,
      sessionMistakeIds: runtime.state.match.sessionMistakeIds,
    },
  });
};
})(typeof window !== "undefined" ? window : globalThis);
