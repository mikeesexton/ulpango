(function initIvriQuestAppController(global) {
"use strict";

const app = global.IvriQuestApp = global.IvriQuestApp || {};
const controller = app.controller = app.controller || {};

function getRuntime() {
  return app.runtime || {};
}

function getHelpers() {
  return getRuntime().helpers || {};
}

function getSession() {
  return app.session || {};
}

function getDesktopHubPanels(runtime) {
  return [
    { card: runtime.el?.mostMissedCard, toggle: runtime.el?.mostMissedToggle },
    { card: runtime.el?.reviewAnalyticsCard, toggle: runtime.el?.reviewAnalyticsToggle },
    { card: runtime.el?.settingsCard, toggle: runtime.el?.settingsToggle },
  ];
}

controller.bindUi = controller.bindUi || function bindUi() {
  const runtime = getRuntime();
  const h = getHelpers();
  const session = getSession();

  runtime.el.routeButtons.forEach((button) => {
    button.addEventListener("click", () => controller.handleRouteButtonPress(button.dataset.route || "home"));
  });
  runtime.el.homeLessonBtn?.addEventListener("click", () => controller.openHomeLesson("lesson"));
  runtime.el.homeSentenceBankBtn?.addEventListener("click", () => controller.openHomeLesson("sentenceBank"));
  runtime.el.homeVerbMatchBtn?.addEventListener("click", () => controller.openHomeLesson("verbMatch"));
  runtime.el.homeAbbreviationBtn?.addEventListener("click", () => controller.openHomeLesson("abbreviation"));
  runtime.el.homeAdvConjBtn?.addEventListener("click", () => controller.openHomeLesson("advConj"));
  runtime.el.advConjBtn?.addEventListener("click", () => controller.openHomeLesson("advConj"));
  runtime.el.lessonBtn.addEventListener("click", () => {
    runtime.state.lastPlayedMode = "lesson";
    runtime.state.mode = "lesson";
    app.lessonMode?.startLesson?.();
  });
  runtime.el.sentenceBankBtn?.addEventListener("click", () => {
    runtime.state.lastPlayedMode = "sentenceBank";
    runtime.state.mode = "sentenceBank";
    app.sentenceBank?.startSentenceBank?.();
  });
  runtime.el.verbMatchBtn?.addEventListener("click", () => {
    runtime.state.lastPlayedMode = "verbMatch";
    runtime.state.mode = "verbMatch";
    app.verbMatch?.startVerbMatch?.();
  });
  runtime.el.abbreviationBtn?.addEventListener("click", () => {
    runtime.state.lastPlayedMode = "abbreviation";
    runtime.state.mode = "abbreviation";
    app.abbreviation?.startAbbreviation?.();
  });
  runtime.el.nextBtn.addEventListener("click", () => controller.handleNextAction());
  runtime.el.masterVerbBtn?.addEventListener("click", () => app.verbMatch?.moveEligibleVerbToMastered?.());
  runtime.el.homeBtn?.addEventListener("click", () => session.requestGoHome?.());
  runtime.el.homeLangToggle?.addEventListener("click", () => app.i18n?.toggleLanguage?.());
  runtime.el.homeThemeToggle?.addEventListener("click", () => app.i18n?.toggleTheme?.());
  runtime.el.homeNiqqudToggle?.addEventListener("click", () => app.i18n?.toggleNiqqudPreference?.());
  runtime.el.homeSoundToggle?.addEventListener("click", () => app.i18n?.toggleSoundPreference?.());
  runtime.el.homeSpeechToggle?.addEventListener("click", () => app.i18n?.toggleSpeechPreference?.());
  runtime.el.langToggle?.addEventListener("click", () => app.i18n?.toggleLanguage?.());
  runtime.el.themeToggle?.addEventListener("click", () => app.i18n?.toggleTheme?.());
  runtime.el.soundToggle?.addEventListener("click", () => app.i18n?.toggleSoundPreference?.());
  runtime.el.speechToggle?.addEventListener("click", () => app.i18n?.toggleSpeechPreference?.());
  getDesktopHubPanels(runtime).forEach(({ card, toggle }) => {
    if (!card || !toggle) return;
    toggle.addEventListener("click", () => controller.toggleDesktopHubPanel(card, toggle));
  });
  runtime.el.resultsContinueBtn?.addEventListener("click", () => controller.continueFromResults());
  runtime.el.resultsReviewBtn?.addEventListener("click", () => controller.leaveSummaryAndNavigate("review"));
  runtime.el.resultsHomeBtn?.addEventListener("click", () => controller.leaveSummaryAndNavigate("home"));
  runtime.el.promptSpeechBtn?.addEventListener("click", () => app.ui?.playPromptSpeech?.());
  runtime.el.welcomeModalCloseBtn?.addEventListener("click", () => app.ui?.closeWelcomeModal?.());
  runtime.el.welcomeModal?.addEventListener("click", (event) => {
    if (event.target === runtime.el.welcomeModal) {
      app.ui?.closeWelcomeModal?.();
    }
  });
  runtime.el.masteredCloseBtn?.addEventListener("click", () => app.ui?.closeMasteredModal?.());
  runtime.el.masteredRestoreBtn?.addEventListener("click", () => app.ui?.restoreSelectedMasteredWords?.());
  runtime.el.masteredModal?.addEventListener("click", (event) => {
    if (event.target === runtime.el.masteredModal) {
      app.ui?.closeMasteredModal?.();
    }
  });
  global.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (runtime.state.welcomeModalOpen) {
      app.ui?.closeWelcomeModal?.();
      return;
    }
    if (runtime.state.masteredModalOpen) {
      app.ui?.closeMasteredModal?.();
    }
  });
  global.addEventListener("resize", controller.handleViewportResize);

  [runtime.el.lessonStartIntro, runtime.el.secondChanceIntro, runtime.el.sentenceBankIntro, runtime.el.verbMatchIntro, runtime.el.abbreviationIntro].forEach((overlay) => {
    overlay?.addEventListener("pointerdown", controller.stopIntroOverlayInteraction);
    overlay?.addEventListener("click", controller.stopIntroOverlayInteraction);
  });

  runtime.el.niqqudToggle?.addEventListener("click", () => app.i18n?.toggleNiqqudPreference?.());
  runtime.el.leaveSessionStayBtn?.addEventListener("click", () => session.closeLeaveSessionConfirm?.());
  runtime.el.leaveSessionConfirmBtn?.addEventListener("click", () => session.confirmLeaveSession?.());

  runtime.el.resetProgress.addEventListener("click", () => {
    const ok = global.confirm(h.t?.("controls.resetConfirm") || "Reset progress?");
    if (!ok) return;

    runtime.state.progress = {};
    runtime.state.sentenceProgress = {};
    runtime.state.masteredSelection = new Set();
    runtime.state.match.eligibleMasterWordId = "";
    h.resetSessionCounters?.();
    h.resetSentenceBankState?.();
    h.resetAbbreviationState?.();
    app.persistence?.saveProgress?.();
    app.persistence?.saveSentenceProgress?.();
    h.renderMostMissed?.();
    h.renderMasteredModal?.();
    h.renderAll?.();
    if (runtime.state.mode === "lesson" && runtime.state.lesson.active) {
      app.lessonMode?.nextQuestion?.();
    }
  });
  controller.syncDesktopHubPanels();
};

controller.handleViewportResize = controller.handleViewportResize || function handleViewportResize() {
  const runtime = getRuntime();
  const h = getHelpers();
  if (runtime.viewportResizeTimer) {
    runtime.global.clearTimeout?.(runtime.viewportResizeTimer);
  }
  runtime.viewportResizeTimer = runtime.global.setTimeout?.(() => {
    runtime.viewportResizeTimer = null;
    h.renderAll?.();
    controller.syncDesktopHubPanels();
  }, 60);
};

controller.toggleDesktopHubPanel = controller.toggleDesktopHubPanel || function toggleDesktopHubPanel(card, toggle) {
  const runtime = getRuntime();
  const desktopHubActive = runtime.global.document.body?.getAttribute("data-desktop-hub-layout") === "true";
  if (!desktopHubActive || !card || !toggle) return;

  const nextCollapsed = card.getAttribute("data-collapsed") !== "true";
  card.setAttribute("data-collapsed", nextCollapsed ? "true" : "false");
  toggle.setAttribute("aria-expanded", String(!nextCollapsed));
};

controller.syncDesktopHubPanels = controller.syncDesktopHubPanels || function syncDesktopHubPanels() {
  const runtime = getRuntime();
  const desktopHubActive = runtime.global.document.body?.getAttribute("data-desktop-hub-layout") === "true";

  getDesktopHubPanels(runtime).forEach(({ card, toggle }) => {
    if (!card || !toggle) return;
    if (card.getAttribute("data-collapsed") !== "true" && card.getAttribute("data-collapsed") !== "false") {
      card.setAttribute("data-collapsed", "false");
    }
    const expanded = card.getAttribute("data-collapsed") !== "true";
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.setAttribute("aria-disabled", desktopHubActive ? "false" : "true");
  });
};

controller.handleRouteButtonPress = controller.handleRouteButtonPress || function handleRouteButtonPress(route) {
  const runtime = getRuntime();
  const session = getSession();
  if (runtime.state.summary.active) {
    controller.leaveSummaryAndNavigate(route);
    return;
  }

  if (session.hasActiveLearnSession?.()) {
    session.requestLeaveSession?.(route);
    return;
  }

  session.navigateTo?.(route);
};

controller.stopIntroOverlayInteraction = controller.stopIntroOverlayInteraction || function stopIntroOverlayInteraction(event) {
  event.preventDefault();
  event.stopPropagation();
};

controller.openHomeLesson = controller.openHomeLesson || function openHomeLesson(mode) {
  const runtime = getRuntime();
  const session = getSession();
  if (session.isModeSessionActive?.(mode)) {
    runtime.state.mode = mode;
    session.navigateTo?.("home");
    return;
  }

  if (mode === "verbMatch") {
    runtime.state.lastPlayedMode = "verbMatch";
    runtime.state.mode = "verbMatch";
    app.verbMatch?.startVerbMatch?.();
    return;
  }

  if (mode === "abbreviation") {
    runtime.state.lastPlayedMode = "abbreviation";
    runtime.state.mode = "abbreviation";
    app.abbreviation?.startAbbreviation?.();
    return;
  }

  if (mode === "sentenceBank") {
    runtime.state.lastPlayedMode = "sentenceBank";
    runtime.state.mode = "sentenceBank";
    app.sentenceBank?.startSentenceBank?.();
    return;
  }

  if (mode === "advConj") {
    runtime.state.lastPlayedMode = "advConj";
    runtime.state.mode = "advConj";
    app.advConj?.startAdvConj?.();
    return;
  }

  runtime.state.lastPlayedMode = "lesson";
  runtime.state.mode = "lesson";
  app.lessonMode?.startLesson?.();
};

controller.continueFromResults = controller.continueFromResults || function continueFromResults() {
  const runtime = getRuntime();
  if (runtime.state.summary.game === "verbMatch") {
    app.verbMatch?.startVerbMatch?.();
    return;
  }
  if (runtime.state.summary.game === "sentenceBank") {
    app.sentenceBank?.startSentenceBank?.();
    return;
  }
  if (runtime.state.summary.game === "abbreviation") {
    app.abbreviation?.startAbbreviation?.();
    return;
  }
  if (runtime.state.summary.game === "advConj") {
    app.advConj?.startAdvConj?.();
    return;
  }
  app.lessonMode?.startLesson?.();
};

controller.leaveSummaryAndNavigate = controller.leaveSummaryAndNavigate || function leaveSummaryAndNavigate(targetRoute = "home") {
  const runtime = getRuntime();
  const session = getSession();
  if (!runtime.state.summary.active) {
    session.navigateTo?.(targetRoute);
    return;
  }
  session.clearSummaryState?.();
  runtime.state.mode = "home";
  runtime.state.route = session.resolveInitialRoute?.(targetRoute) || "home";
  getHelpers().renderAll?.();
};

controller.sanitizeState = controller.sanitizeState || function sanitizeState() {
  const runtime = getRuntime();
  if (runtime.storage) {
    try {
      runtime.storage.removeItem("ivriquest-settings-v1");
      runtime.storage.removeItem("ivriquest-custom-v1");
    } catch {
      // ignore
    }
  }
};

controller.getVisibleVerbMatchRows = controller.getVisibleVerbMatchRows || function getVisibleVerbMatchRows() {
  const runtime = getRuntime();
  const viewportWidth = Number(runtime.global.innerWidth || 0);
  if (viewportWidth > 0 && viewportWidth <= 767) {
    return 5;
  }
  return runtime.constants.MATCH_VISIBLE_ROWS;
};

controller.handleNextAction = controller.handleNextAction || function handleNextAction() {
  const runtime = getRuntime();
  if (runtime.state.mode === "home" || runtime.state.mode === "summary") {
    return;
  }

  if (runtime.state.mode === "verbMatch") {
    if (runtime.state.match.active && runtime.state.match.matchedCount >= runtime.state.match.totalPairs) {
      app.verbMatch?.loadNextVerbRound?.();
      return;
    }
    return;
  }

  if (runtime.state.mode === "abbreviation") {
    if (!runtime.state.abbreviation.active || !runtime.state.abbreviation.currentQuestion) {
      return;
    }
    if (runtime.state.abbreviation.currentQuestion.locked) {
      app.abbreviation?.nextAbbreviationQuestion?.();
      return;
    }
    if (runtime.state.abbreviation.currentQuestion.selectedOptionId) {
      app.abbreviation?.applyAbbreviationAnswer?.(
        runtime.state.abbreviation.currentQuestion.selectedOptionId === runtime.state.abbreviation.currentQuestion.entry.id,
        runtime.state.abbreviation.currentQuestion.selectedOptionId
      );
    }
    return;
  }

  if (runtime.state.mode === "sentenceBank") {
    if (!runtime.state.sentenceBank.active || !runtime.state.sentenceBank.currentQuestion) {
      return;
    }
    if (runtime.state.sentenceBank.currentQuestion.locked) {
      app.sentenceBank?.nextSentenceBankQuestion?.();
      return;
    }
    if (app.sentenceBank?.canSubmitCurrentQuestion?.(runtime.state.sentenceBank.currentQuestion)) {
      app.sentenceBank?.applySentenceBankAnswer?.();
    }
    return;
  }

  if (runtime.state.mode === "advConj") {
    if (!runtime.state.advConj.active || !runtime.state.advConj.currentQuestion) {
      return;
    }
    if (runtime.state.advConj.currentQuestion.locked) {
      app.advConj?.loadAdvConjQuestion?.();
      return;
    }
    if (runtime.state.advConj.currentQuestion.selectedOptionId) {
      app.advConj?.applyAdvConjAnswer?.();
    }
    return;
  }

  if (!runtime.state.lesson.active || !runtime.state.currentQuestion) {
    return;
  }

  if (runtime.state.currentQuestion.locked) {
    app.lessonMode?.nextQuestion?.();
    return;
  }

  if (runtime.state.currentQuestion.selectedOptionId) {
    app.lessonMode?.applyAnswer?.(
      runtime.state.currentQuestion.selectedOptionId === runtime.state.currentQuestion.word.id,
      runtime.state.currentQuestion.selectedOptionId
    );
  }
};
})(typeof window !== "undefined" ? window : globalThis);
