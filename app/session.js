(function initIvriQuestAppSession(global) {
"use strict";

const app = global.IvriQuestApp = global.IvriQuestApp || {};
const session = app.session = app.session || {};

function getRuntime() {
  return app.runtime || {};
}

function getHelpers() {
  return getRuntime().helpers || {};
}

session.hasActiveLearnSession = session.hasActiveLearnSession || function hasActiveLearnSession() {
  const runtime = getRuntime();
  return Boolean(
    runtime.state?.lesson?.active ||
      runtime.state?.lesson?.lessonStartIntroActive ||
      runtime.state?.lesson?.secondChanceIntroActive ||
      runtime.state?.abbreviation?.active ||
      runtime.state?.abbreviation?.introActive ||
      runtime.state?.advConj?.active ||
      runtime.state?.advConj?.introActive ||
      runtime.state?.match?.active ||
      runtime.state?.match?.verbIntroActive
  );
};

session.isModeSessionActive = session.isModeSessionActive || function isModeSessionActive(mode) {
  const runtime = getRuntime();
  if (mode === "verbMatch") {
    return Boolean(runtime.state?.match?.active || runtime.state?.match?.verbIntroActive);
  }
  if (mode === "abbreviation") {
    return Boolean(runtime.state?.abbreviation?.active || runtime.state?.abbreviation?.introActive);
  }
  if (mode === "advConj") {
    return Boolean(runtime.state?.advConj?.active || runtime.state?.advConj?.introActive);
  }
  return Boolean(
    runtime.state?.lesson?.active ||
      runtime.state?.lesson?.lessonStartIntroActive ||
      runtime.state?.lesson?.secondChanceIntroActive
  );
};

session.resolveInitialRoute = session.resolveInitialRoute || function resolveInitialRoute(candidate, options = {}) {
  const runtime = getRuntime();
  const valid = new Set(["home", "review", "settings", "results"]);
  if (runtime.state?.summary?.active) {
    return valid.has(candidate) ? candidate : "results";
  }
  if (session.hasActiveLearnSession()) {
    return "home";
  }
  return valid.has(candidate) && candidate !== "results" ? candidate : "home";
};

session.restoreSessionState = session.restoreSessionState || function restoreSessionState(snapshot) {
  const runtime = getRuntime();
  const h = getHelpers();
  if (!snapshot || typeof snapshot !== "object") return;

  runtime.state.mode = typeof snapshot.mode === "string" ? snapshot.mode : runtime.state.mode;
  runtime.state.route = typeof snapshot.route === "string" ? snapshot.route : runtime.state.route;
  runtime.state.lastPlayedMode = typeof snapshot.lastPlayedMode === "string" ? snapshot.lastPlayedMode : runtime.state.lastPlayedMode;
  runtime.state.sessionScore = Math.max(0, Number(snapshot.sessionScore || 0));
  runtime.state.sessionStreak = Math.max(0, Number(snapshot.sessionStreak || 0));
  runtime.state.showNiqqudInline = Boolean(snapshot.showNiqqudInline);

  if (snapshot.currentQuestion) {
    runtime.state.currentQuestion = h.cloneLessonQuestionSnapshot?.(snapshot.currentQuestion) || snapshot.currentQuestion;
    runtime.state.currentQuestion.locked = Boolean(snapshot.currentQuestion.locked);
  }

  if (snapshot.summary) {
    Object.assign(runtime.state.summary, {
      active: Boolean(snapshot.summary.active),
      game: String(snapshot.summary.game || ""),
      titleKey: String(snapshot.summary.titleKey || ""),
      titleVars: snapshot.summary.titleVars || {},
      scoreKey: String(snapshot.summary.scoreKey || ""),
      scoreVars: snapshot.summary.scoreVars || {},
      noteKey: String(snapshot.summary.noteKey || ""),
      noteVars: snapshot.summary.noteVars || {},
      correctCount: Math.max(0, Number(snapshot.summary.correctCount || 0)),
      incorrectCount: Math.max(0, Number(snapshot.summary.incorrectCount || 0)),
      elapsedSeconds: Math.max(0, Number(snapshot.summary.elapsedSeconds || 0)),
      mistakes: Array.isArray(snapshot.summary.mistakes) ? snapshot.summary.mistakes : [],
    });
  }

  if (snapshot.lesson) {
    Object.assign(runtime.state.lesson, {
      active: Boolean(snapshot.lesson.active),
      currentRound: Math.max(0, Number(snapshot.lesson.currentRound || 0)),
      secondChanceCurrent: Math.max(0, Number(snapshot.lesson.secondChanceCurrent || 0)),
      secondChanceTotal: Math.max(0, Number(snapshot.lesson.secondChanceTotal || 0)),
      startMs: Math.max(0, Number(snapshot.lesson.startMs || 0)),
      elapsedSeconds: Math.max(0, Number(snapshot.lesson.elapsedSeconds || 0)),
      askedWordIds: Array.isArray(snapshot.lesson.askedWordIds) ? snapshot.lesson.askedWordIds : [],
      domainCounts: snapshot.lesson.domainCounts || {},
      missedWordIds: Array.isArray(snapshot.lesson.missedWordIds) ? snapshot.lesson.missedWordIds : [],
      reviewQueue: Array.isArray(snapshot.lesson.reviewQueue) ? snapshot.lesson.reviewQueue : [],
      inReview: Boolean(snapshot.lesson.inReview),
      lessonStartIntroActive: Boolean(snapshot.lesson.lessonStartIntroActive),
      secondChanceIntroActive: Boolean(snapshot.lesson.secondChanceIntroActive),
      optionHistory: snapshot.lesson.optionHistory || {},
      wrongAnswers: Math.max(0, Number(snapshot.lesson.wrongAnswers || 0)),
      sessionMistakeIds: Array.isArray(snapshot.lesson.sessionMistakeIds) ? snapshot.lesson.sessionMistakeIds : [],
      timerId: null,
    });
  }

  if (snapshot.abbreviation) {
    Object.assign(runtime.state.abbreviation, {
      active: Boolean(snapshot.abbreviation.active),
      currentRound: Math.max(0, Number(snapshot.abbreviation.currentRound || 0)),
      startMs: Math.max(0, Number(snapshot.abbreviation.startMs || 0)),
      elapsedSeconds: Math.max(0, Number(snapshot.abbreviation.elapsedSeconds || 0)),
      askedEntryIds: Array.isArray(snapshot.abbreviation.askedEntryIds) ? snapshot.abbreviation.askedEntryIds : [],
      introActive: Boolean(snapshot.abbreviation.introActive),
      currentQuestion: snapshot.abbreviation.currentQuestion
        ? h.cloneAbbreviationQuestionSnapshot?.(snapshot.abbreviation.currentQuestion) || snapshot.abbreviation.currentQuestion
        : null,
      wrongAnswers: Math.max(0, Number(snapshot.abbreviation.wrongAnswers || 0)),
      sessionMistakeIds: Array.isArray(snapshot.abbreviation.sessionMistakeIds) ? snapshot.abbreviation.sessionMistakeIds : [],
      timerId: null,
    });
    if (runtime.state.abbreviation.currentQuestion) {
      runtime.state.abbreviation.currentQuestion.locked = Boolean(snapshot.abbreviation.currentQuestion?.locked);
    }
  }

  if (snapshot.match) {
    Object.assign(runtime.state.match, {
      active: Boolean(snapshot.match.active),
      verbQueue: Array.isArray(snapshot.match.verbQueue) ? snapshot.match.verbQueue : [],
      totalVerbs: Math.max(0, Number(snapshot.match.totalVerbs || 0)),
      currentVerbIndex: Math.max(0, Number(snapshot.match.currentVerbIndex || 0)),
      currentVerb: snapshot.match.currentVerb || null,
      pairs: Array.isArray(snapshot.match.pairs) ? snapshot.match.pairs : [],
      remainingPairs: Array.isArray(snapshot.match.remainingPairs) ? snapshot.match.remainingPairs : [],
      leftCards: Array.isArray(snapshot.match.leftCards) ? snapshot.match.leftCards : [],
      rightCards: Array.isArray(snapshot.match.rightCards) ? snapshot.match.rightCards : [],
      selectedLeftId: snapshot.match.selectedLeftId || null,
      selectedRightId: snapshot.match.selectedRightId || null,
      mismatchedCardIds: Array.isArray(snapshot.match.mismatchedCardIds) ? snapshot.match.mismatchedCardIds : [],
      matchedCardIds: Array.isArray(snapshot.match.matchedCardIds) ? snapshot.match.matchedCardIds : [],
      matchedPairIds: Array.isArray(snapshot.match.matchedPairIds) ? snapshot.match.matchedPairIds : [],
      isResolving: Boolean(snapshot.match.isResolving),
      nextCardId: Math.max(1, Number(snapshot.match.nextCardId || 1)),
      combo: Math.max(0, Number(snapshot.match.combo || 0)),
      bestCombo: Math.max(0, Number(snapshot.match.bestCombo || 0)),
      matchedCount: Math.max(0, Number(snapshot.match.matchedCount || 0)),
      totalPairs: Math.max(0, Number(snapshot.match.totalPairs || 0)),
      startMs: Math.max(0, Number(snapshot.match.startMs || 0)),
      elapsedSeconds: Math.max(0, Number(snapshot.match.elapsedSeconds || 0)),
      verbIntroActive: Boolean(snapshot.match.verbIntroActive),
      sessionMatched: Math.max(0, Number(snapshot.match.sessionMatched || 0)),
      sessionTotalPairs: Math.max(0, Number(snapshot.match.sessionTotalPairs || 0)),
      currentVerbHadMismatch: Boolean(snapshot.match.currentVerbHadMismatch),
      eligibleMasterWordId: String(snapshot.match.eligibleMasterWordId || ""),
      mismatchCount: Math.max(0, Number(snapshot.match.mismatchCount || 0)),
      sessionMistakeIds: Array.isArray(snapshot.match.sessionMistakeIds) ? snapshot.match.sessionMistakeIds : [],
      timerId: null,
    });
  }

  runtime.state.route = session.resolveInitialRoute(runtime.state.route);
};

session.navigateTo = session.navigateTo || function navigateTo(route) {
  const runtime = getRuntime();
  runtime.state.route = session.resolveInitialRoute(route);
  getHelpers().renderAll?.();
};

session.restorePendingOverlays = session.restorePendingOverlays || function restorePendingOverlays() {
  const runtime = getRuntime();
  const h = getHelpers();
  if (runtime.state?.lesson?.secondChanceIntroActive) {
    h.playSecondChanceIntro?.();
  } else if (runtime.state?.lesson?.lessonStartIntroActive) {
    h.playLessonStartIntro?.();
  } else if (runtime.state?.abbreviation?.introActive) {
    h.playAbbreviationIntro?.();
  } else if (runtime.state?.match?.verbIntroActive) {
    h.playVerbMatchIntro?.();
  }
};

session.resumeActiveTimers = session.resumeActiveTimers || function resumeActiveTimers() {
  const runtime = getRuntime();
  const h = getHelpers();

  session.restorePendingOverlays();

  if (runtime.state?.lesson?.active && runtime.state.lesson.startMs && !runtime.state.lesson.lessonStartIntroActive && !runtime.state.lesson.secondChanceIntroActive) {
    runtime.state.lesson.elapsedSeconds = Math.max(0, Math.floor((Date.now() - runtime.state.lesson.startMs) / 1000));
    session.startLessonTimer();
  }
  if (runtime.state?.abbreviation?.active && runtime.state.abbreviation.startMs && !runtime.state.abbreviation.introActive) {
    runtime.state.abbreviation.elapsedSeconds = Math.max(0, Math.floor((Date.now() - runtime.state.abbreviation.startMs) / 1000));
    session.startAbbreviationTimer();
  }
  if (runtime.state?.match?.active && runtime.state.match.startMs && !runtime.state.match.verbIntroActive) {
    runtime.state.match.elapsedSeconds = Math.max(0, Math.floor((Date.now() - runtime.state.match.startMs) / 1000));
    session.startVerbMatchTimer();
  }

  h.updateUiLockState?.();
};

session.clearIntroAutoAdvance = session.clearIntroAutoAdvance || function clearIntroAutoAdvance() {
  const runtime = getRuntime();
  if (!runtime.introAutoAdvanceTimerId) return;
  runtime.global.clearTimeout(runtime.introAutoAdvanceTimerId);
  runtime.introAutoAdvanceTimerId = null;
};

session.scheduleIntroAutoAdvance = session.scheduleIntroAutoAdvance || function scheduleIntroAutoAdvance(action) {
  const runtime = getRuntime();
  session.clearIntroAutoAdvance();
  if (typeof action !== "function") return;

  runtime.introAutoAdvanceTimerId = runtime.global.setTimeout(() => {
    runtime.introAutoAdvanceTimerId = null;
    action();
  }, runtime.introAutoAdvanceMs);
};

session.clearSummaryState = session.clearSummaryState || function clearSummaryState() {
  const runtime = getRuntime();
  runtime.state.summary.active = false;
  runtime.state.summary.game = "";
  runtime.state.summary.titleKey = "";
  runtime.state.summary.titleVars = {};
  runtime.state.summary.scoreKey = "";
  runtime.state.summary.scoreVars = {};
  runtime.state.summary.noteKey = "";
  runtime.state.summary.noteVars = {};
  runtime.state.summary.correctCount = 0;
  runtime.state.summary.incorrectCount = 0;
  runtime.state.summary.elapsedSeconds = 0;
  runtime.state.summary.mistakes = [];
};

session.openLeaveSessionConfirm = session.openLeaveSessionConfirm || function openLeaveSessionConfirm(targetRoute = "home") {
  const runtime = getRuntime();
  runtime.state.pendingLeaveRoute = targetRoute;
  runtime.state.leaveConfirmOpen = true;
  getHelpers().showBlockingOverlay?.(runtime.el.leaveSessionConfirm);
};

session.closeLeaveSessionConfirm = session.closeLeaveSessionConfirm || function closeLeaveSessionConfirm(options = {}) {
  const runtime = getRuntime();
  runtime.state.leaveConfirmOpen = false;
  if (!options.preservePending) {
    runtime.state.pendingLeaveRoute = "home";
  }
  getHelpers().hideBlockingOverlay?.(runtime.el.leaveSessionConfirm);
};

session.confirmLeaveSession = session.confirmLeaveSession || function confirmLeaveSession() {
  const runtime = getRuntime();
  const targetRoute = runtime.state.pendingLeaveRoute || "home";
  session.closeLeaveSessionConfirm({ preservePending: true });
  session.endSessionAndNavigate(targetRoute);
  runtime.state.pendingLeaveRoute = "home";
};

session.requestLeaveSession = session.requestLeaveSession || function requestLeaveSession(targetRoute = "home") {
  if (!session.hasActiveLearnSession()) {
    session.endSessionAndNavigate(targetRoute);
    return;
  }
  session.openLeaveSessionConfirm(targetRoute);
};

session.requestGoHome = session.requestGoHome || function requestGoHome() {
  session.requestLeaveSession("home");
};

session.endSessionAndNavigate = session.endSessionAndNavigate || function endSessionAndNavigate(targetRoute = "home") {
  const runtime = getRuntime();
  const h = getHelpers();

  session.stopVerbMatchTimer();
  session.stopLessonTimer();
  session.stopAbbreviationTimer();
  session.closeLeaveSessionConfirm();
  h.closeMasteredModal?.();
  session.clearLessonStartIntro();
  session.clearSecondChanceIntro();
  session.clearVerbMatchIntro();
  session.clearAbbreviationIntro();
  session.clearAdvConjIntro();
  h.resetSessionCounters?.();
  h.resetVerbMatchState?.();
  h.resetAbbreviationState?.();
  session.resetAdvConjState();
  runtime.state.lesson.active = false;
  runtime.state.lesson.inReview = false;
  runtime.state.currentQuestion = null;
  session.clearSummaryState();
  runtime.state.mode = "home";
  runtime.state.route = targetRoute === "review" || targetRoute === "settings" ? targetRoute : "home";
  h.clearFeedback?.();
  app.persistence?.clearPersistedSession?.();
  h.renderAll?.();
};

session.goHome = session.goHome || function goHome() {
  session.endSessionAndNavigate("home");
};

session.showSessionSummary = session.showSessionSummary || function showSessionSummary(config = {}) {
  const runtime = getRuntime();
  const h = getHelpers();

  session.stopVerbMatchTimer();
  session.stopLessonTimer();
  session.stopAbbreviationTimer();
  session.closeLeaveSessionConfirm();
  session.clearLessonStartIntro();
  session.clearSecondChanceIntro();
  session.clearVerbMatchIntro();
  session.clearAbbreviationIntro();
  session.clearAdvConjIntro();
  runtime.state.lesson.active = false;
  runtime.state.lesson.inReview = false;
  runtime.state.currentQuestion = null;
  runtime.state.match.active = false;
  runtime.state.abbreviation.active = false;
  runtime.state.abbreviation.currentQuestion = null;
  runtime.state.advConj.active = false;
  runtime.state.advConj.currentQuestion = null;
  runtime.state.mode = "summary";
  runtime.state.summary.active = true;
  runtime.state.summary.game = String(config.game || "");
  runtime.state.summary.titleKey = String(config.titleKey || "");
  runtime.state.summary.titleVars = config.titleVars || {};
  runtime.state.summary.scoreKey = String(config.scoreKey || "");
  runtime.state.summary.scoreVars = config.scoreVars || {};
  runtime.state.summary.noteKey = String(config.noteKey || "");
  runtime.state.summary.noteVars = config.noteVars || {};
  runtime.state.summary.correctCount = Math.max(0, Number(config.correctCount || 0));
  runtime.state.summary.incorrectCount = Math.max(0, Number(config.incorrectCount || 0));
  runtime.state.summary.elapsedSeconds = Math.max(0, Number(config.elapsedSeconds || 0));
  runtime.state.summary.mistakes = Array.isArray(config.mistakes) ? config.mistakes : [];
  runtime.state.route = "results";
  h.clearFeedback?.();
  h.renderAll?.();
};

session.finishLesson = session.finishLesson || function finishLesson() {
  const runtime = getRuntime();
  const h = getHelpers();
  const lessonRounds = runtime.constants.LESSON_ROUNDS || 0;

  session.stopLessonTimer();
  session.clearLessonStartIntro();
  session.clearSecondChanceIntro();
  session.clearVerbMatchIntro();
  runtime.state.lesson.active = false;
  runtime.state.currentQuestion = null;
  const reviewRounds = runtime.state.lesson.secondChanceTotal;
  runtime.state.lesson.inReview = false;
  runtime.state.lesson.secondChanceCurrent = 0;
  runtime.state.lesson.secondChanceTotal = 0;
  session.showSessionSummary({
    game: "lesson",
    titleKey: "summary.lessonTitle",
    scoreKey: "summary.score",
    scoreVars: {
      score: runtime.state.sessionScore,
      total: lessonRounds,
    },
    noteKey: reviewRounds > 0 ? "summary.lessonNote" : "summary.lessonNoteNone",
    noteVars: reviewRounds > 0 ? { count: reviewRounds } : {},
    correctCount: Math.max(0, lessonRounds + reviewRounds - runtime.state.lesson.wrongAnswers),
    incorrectCount: runtime.state.lesson.wrongAnswers,
    elapsedSeconds: runtime.state.lesson.elapsedSeconds,
    mistakes: h.buildLessonMistakeSummary?.() || [],
  });
};

session.finishAbbreviation = session.finishAbbreviation || function finishAbbreviation() {
  const runtime = getRuntime();
  const h = getHelpers();
  const abbreviationRounds = runtime.constants.ABBREVIATION_ROUNDS || 0;

  session.stopAbbreviationTimer();
  session.clearLessonStartIntro();
  session.clearSecondChanceIntro();
  session.clearVerbMatchIntro();
  session.clearAbbreviationIntro();

  const roundsDone = runtime.state.abbreviation.currentRound;
  const targetRounds = h.getAbbreviationRoundTarget?.() || abbreviationRounds;
  const elapsed = runtime.state.abbreviation.elapsedSeconds;

  runtime.state.abbreviation.active = false;
  runtime.state.abbreviation.currentQuestion = null;

  session.showSessionSummary({
    game: "abbreviation",
    titleKey: "summary.abbreviationTitle",
    scoreKey: "summary.score",
    scoreVars: {
      score: runtime.state.sessionScore,
      total: targetRounds,
    },
    noteKey: "summary.abbreviationNote",
    noteVars: {
      rounds: roundsDone || targetRounds,
      seconds: elapsed,
    },
    correctCount: Math.max(0, (roundsDone || targetRounds) - runtime.state.abbreviation.wrongAnswers),
    incorrectCount: runtime.state.abbreviation.wrongAnswers,
    elapsedSeconds: elapsed,
    mistakes: h.buildAbbreviationMistakeSummary?.() || [],
  });
};

session.clearAbbreviationIntro = session.clearAbbreviationIntro || function clearAbbreviationIntro() {
  const runtime = getRuntime();
  runtime.state.abbreviation.introActive = false;
  session.clearIntroAutoAdvance();
  getHelpers().hideBlockingOverlay?.(runtime.el.abbreviationIntro);
};

session.startAbbreviationTimer = session.startAbbreviationTimer || function startAbbreviationTimer() {
  const runtime = getRuntime();
  const h = getHelpers();
  session.stopAbbreviationTimer();
  runtime.state.abbreviation.timerId = runtime.global.setInterval(() => {
    if (!runtime.state.abbreviation.active) return;
    runtime.state.abbreviation.elapsedSeconds = Math.max(0, Math.floor((Date.now() - runtime.state.abbreviation.startMs) / 1000));
    if (runtime.state.mode === "abbreviation") {
      h.renderSessionHeader?.();
    }
  }, 1000);
};

session.stopAbbreviationTimer = session.stopAbbreviationTimer || function stopAbbreviationTimer() {
  const runtime = getRuntime();
  if (!runtime.state.abbreviation.timerId) return;
  runtime.global.clearInterval(runtime.state.abbreviation.timerId);
  runtime.state.abbreviation.timerId = null;
};

session.resetAdvConjState = session.resetAdvConjState || function resetAdvConjState() {
  const runtime = getRuntime();
  if (runtime.state.advConj.timerId) {
    runtime.global.clearInterval(runtime.state.advConj.timerId);
  }
  runtime.state.advConj = {
    active: false,
    introActive: false,
    currentRound: 0,
    startMs: 0,
    elapsedSeconds: 0,
    timerId: null,
    questionQueue: [],
    currentQuestion: null,
    wrongAnswers: 0,
    sessionMistakeIds: [],
  };
};

session.clearAdvConjIntro = session.clearAdvConjIntro || function clearAdvConjIntro() {
  const runtime = getRuntime();
  session.clearIntroAutoAdvance();
  if (runtime.el.advConjIntro) {
    runtime.el.advConjIntro.classList.add("hidden");
    runtime.el.advConjIntro.setAttribute("aria-hidden", "true");
  }
  runtime.state.advConj.introActive = false;
};

session.finishAdvConj = session.finishAdvConj || function finishAdvConj() {
  const runtime = getRuntime();
  const h = getHelpers();
  const rounds = runtime.constants.ADV_CONJ_ROUNDS || 0;

  if (runtime.state.advConj.timerId) {
    runtime.global.clearInterval(runtime.state.advConj.timerId);
    runtime.state.advConj.timerId = null;
  }
  runtime.state.advConj.active = false;
  const correct = rounds - runtime.state.advConj.wrongAnswers;
  const wrong = runtime.state.advConj.wrongAnswers;
  const seconds = runtime.state.advConj.elapsedSeconds;
  const mistakes = h.buildAdvConjMistakeSummary?.() || [];
  session.showSessionSummary({
    game: "advConj",
    titleKey: "summary.advConjTitle",
    correctCount: correct,
    incorrectCount: wrong,
    elapsedSeconds: seconds,
    mistakes,
  });
};

session.clearLessonStartIntro = session.clearLessonStartIntro || function clearLessonStartIntro() {
  const runtime = getRuntime();
  runtime.state.lesson.lessonStartIntroActive = false;
  session.clearIntroAutoAdvance();
  getHelpers().hideBlockingOverlay?.(runtime.el.lessonStartIntro);
};

session.clearSecondChanceIntro = session.clearSecondChanceIntro || function clearSecondChanceIntro() {
  const runtime = getRuntime();
  runtime.state.lesson.secondChanceIntroActive = false;
  session.clearIntroAutoAdvance();
  getHelpers().hideBlockingOverlay?.(runtime.el.secondChanceIntro);
};

session.clearVerbMatchIntro = session.clearVerbMatchIntro || function clearVerbMatchIntro() {
  const runtime = getRuntime();
  runtime.state.match.verbIntroActive = false;
  session.clearIntroAutoAdvance();
  getHelpers().hideBlockingOverlay?.(runtime.el.verbMatchIntro);
};

session.startVerbMatchTimer = session.startVerbMatchTimer || function startVerbMatchTimer() {
  const runtime = getRuntime();
  const h = getHelpers();
  session.stopVerbMatchTimer();
  runtime.state.match.timerId = runtime.global.setInterval(() => {
    if (!runtime.state.match.active) return;
    runtime.state.match.elapsedSeconds = Math.max(0, Math.floor((Date.now() - runtime.state.match.startMs) / 1000));
    if (runtime.state.mode === "verbMatch") {
      h.renderSessionHeader?.();
    }
  }, 1000);
};

session.stopVerbMatchTimer = session.stopVerbMatchTimer || function stopVerbMatchTimer() {
  const runtime = getRuntime();
  if (!runtime.state.match.timerId) return;
  runtime.global.clearInterval(runtime.state.match.timerId);
  runtime.state.match.timerId = null;
};

session.startLessonTimer = session.startLessonTimer || function startLessonTimer() {
  const runtime = getRuntime();
  const h = getHelpers();
  session.stopLessonTimer();
  runtime.state.lesson.timerId = runtime.global.setInterval(() => {
    if (!runtime.state.lesson.active) return;
    runtime.state.lesson.elapsedSeconds = Math.max(0, Math.floor((Date.now() - runtime.state.lesson.startMs) / 1000));
    if (runtime.state.mode === "lesson") {
      h.renderSessionHeader?.();
    }
  }, 1000);
};

session.stopLessonTimer = session.stopLessonTimer || function stopLessonTimer() {
  const runtime = getRuntime();
  if (!runtime.state.lesson.timerId) return;
  runtime.global.clearInterval(runtime.state.lesson.timerId);
  runtime.state.lesson.timerId = null;
};
})(typeof window !== "undefined" ? window : globalThis);
