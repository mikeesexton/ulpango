(function initIvriQuestAppUi(global) {
"use strict";

const app = global.IvriQuestApp = global.IvriQuestApp || {};
const ui = app.ui = app.ui || {};

function getRuntime() {
  return app.runtime || {};
}

function getHelpers() {
  return getRuntime().helpers || {};
}

function getData() {
  return app.data || {};
}

function getSession() {
  return app.session || {};
}

function translate(key, vars = {}) {
  return getHelpers().t ? getHelpers().t(key, vars) : key;
}

const PROMPT_SPEAKER_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M5 9v6h4l5 4V5L9 9H5Z" fill="currentColor"></path><path d="M16.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path><path d="M18.75 6.25a8 8 0 0 1 0 11.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path></svg>';

ui.isUiLocked = ui.isUiLocked || function isUiLocked() {
  const runtime = getRuntime();
  return Boolean(
    runtime.state?.welcomeModalOpen ||
      runtime.state?.lesson?.lessonStartIntroActive ||
      runtime.state?.lesson?.secondChanceIntroActive ||
      runtime.state?.sentenceBank?.introActive ||
      runtime.state?.abbreviation?.introActive ||
      runtime.state?.match?.verbIntroActive ||
      runtime.state?.leaveConfirmOpen ||
      runtime.state?.masteredModalOpen
  );
};

ui.updateUiLockState = ui.updateUiLockState || function updateUiLockState() {
  const runtime = getRuntime();
  const locked = ui.isUiLocked();
  const learnSessionActive = app.session?.hasActiveLearnSession?.() || false;
  runtime.global.document.body?.setAttribute("data-ui-locked", locked ? "true" : "false");
  runtime.global.document.body?.setAttribute("data-learn-session", learnSessionActive ? "true" : "false");

  (runtime.el?.routeButtons || []).forEach((button) => {
    const shouldDisable = locked;
    button.disabled = shouldDisable;
    if (shouldDisable) {
      button.setAttribute("aria-disabled", "true");
      button.setAttribute("tabindex", "-1");
    } else {
      button.removeAttribute("aria-disabled");
      button.removeAttribute("tabindex");
    }
  });

  if (!runtime.el?.appShell) return;
  if (locked) {
    runtime.el.appShell.setAttribute("inert", "");
  } else {
    runtime.el.appShell.removeAttribute("inert");
  }
};

ui.showBlockingOverlay = ui.showBlockingOverlay || function showBlockingOverlay(node) {
  if (!node) {
    ui.updateUiLockState();
    return;
  }
  node.classList.remove("hidden");
  node.classList.add("active");
  node.setAttribute("aria-hidden", "false");
  ui.updateUiLockState();
};

ui.hideBlockingOverlay = ui.hideBlockingOverlay || function hideBlockingOverlay(node) {
  if (!node) {
    ui.updateUiLockState();
    return;
  }
  node.classList.remove("active");
  node.classList.add("hidden");
  node.setAttribute("aria-hidden", "true");
  ui.updateUiLockState();
};

ui.renderHomeButton = ui.renderHomeButton || function renderHomeButton() {
  const runtime = getRuntime();
  if (!runtime.el?.homeBtn) return;
  const label = translate("session.backHome");
  runtime.el.homeBtn.textContent = "🏠";
  runtime.el.homeBtn.setAttribute("aria-label", label);
  runtime.el.homeBtn.setAttribute("title", label);
};

ui.renderNiqqudToggle = ui.renderNiqqudToggle || function renderNiqqudToggle() {
  const runtime = getRuntime();
  if (!runtime.el?.niqqudToggle) return;
  runtime.el.niqqudToggle.textContent = runtime.state.showNiqqudInline
    ? translate("prompt.hideNiqqud")
    : translate("prompt.showNiqqud");
};

ui.renderSoundToggle = ui.renderSoundToggle || function renderSoundToggle() {
  const runtime = getRuntime();
  if (!runtime.el?.soundToggle) return;
  const soundLabel = `${translate("audio.label")}: ${runtime.state.audio.enabled ? translate("audio.on") : translate("audio.off")}`;
  runtime.el.soundToggle.textContent = soundLabel;
  runtime.el.soundToggle.setAttribute("aria-label", soundLabel);
  runtime.el.soundToggle.setAttribute("aria-pressed", String(runtime.state.audio.enabled));
};

ui.renderSpeechToggle = ui.renderSpeechToggle || function renderSpeechToggle() {
  const runtime = getRuntime();
  const supported = app.speech?.isSupported?.() || false;
  const speechText = supported
    ? `${translate("speech.label")}: ${runtime.state.speech.enabled ? translate("speech.on") : translate("speech.off")}`
    : `${translate("speech.label")}: ${translate("speech.unavailable")}`;

  if (runtime.el?.speechToggle) {
    runtime.el.speechToggle.textContent = speechText;
    runtime.el.speechToggle.setAttribute("aria-label", speechText);
    runtime.el.speechToggle.setAttribute("aria-pressed", String(supported && runtime.state.speech.enabled));
    runtime.el.speechToggle.disabled = !supported;
  }
};

ui.renderThemeToggle = ui.renderThemeToggle || function renderThemeToggle() {
  const runtime = getRuntime();
  if (!runtime.el?.themeToggle) return;
  const nextThemeLabel = runtime.state.theme === "light" ? translate("controls.darkMode") : translate("controls.lightMode");
  runtime.el.themeToggle.textContent = nextThemeLabel;
  runtime.el.themeToggle.setAttribute("aria-label", nextThemeLabel);
  runtime.el.themeToggle.setAttribute("aria-pressed", String(runtime.state.theme === "dark"));
};

ui.setGamePickerVisibility = ui.setGamePickerVisibility || function setGamePickerVisibility(visible) {
  getRuntime().el?.gamePicker?.classList.toggle("hidden", !visible);
};

ui.setPromptCardVisibility = ui.setPromptCardVisibility || function setPromptCardVisibility(visible) {
  getRuntime().el?.promptCard?.classList.toggle("hidden", !visible);
};

ui.renderRouteVisibility = ui.renderRouteVisibility || function renderRouteVisibility() {
  const runtime = getRuntime();
  const viewportWidth = Math.max(0, Number(runtime.global?.innerWidth || 0));
  const desktopHubLayout = viewportWidth >= 1024;
  const showResults = runtime.state.route === "results" && runtime.state.summary.active;
  const showDesktopHub = desktopHubLayout && !showResults;

  runtime.global.document.body?.setAttribute("data-desktop-hub-layout", showDesktopHub ? "true" : "false");

  runtime.el?.homeView?.classList.toggle("active", showDesktopHub || runtime.state.route === "home");
  runtime.el?.resultsView?.classList.toggle("active", showResults);
  runtime.el?.reviewView?.classList.toggle("active", showDesktopHub || runtime.state.route === "review");
  runtime.el?.settingsView?.classList.toggle("active", showDesktopHub || runtime.state.route === "settings");
  app.controller?.syncDesktopHubPanels?.();
};

ui.isGameplayRouteActive = ui.isGameplayRouteActive || function isGameplayRouteActive() {
  const runtime = getRuntime();
  return runtime.state.route === "home" && !runtime.state.summary.active && (app.session?.hasActiveLearnSession?.() || false);
};

ui.formatCompactElapsedSeconds = ui.formatCompactElapsedSeconds || function formatCompactElapsedSeconds(seconds) {
  return `${Math.max(0, Number(seconds || 0))}s`;
};

ui.getGameplayHeaderMeta = ui.getGameplayHeaderMeta || function getGameplayHeaderMeta() {
  const runtime = getRuntime();
  const gameplayActive = ui.isGameplayRouteActive();
  const comboCount = Math.max(0, Number(runtime.state.sessionStreak || 0));
  let progressText = "";
  let timeSeconds = 0;

  if (gameplayActive) {
    if (runtime.state.mode === "verbMatch") {
      const hasMatch = runtime.state.match.active && runtime.state.match.currentVerb;
      progressText = hasMatch
        ? translate("match.progress", { current: runtime.state.match.matchedCount, total: runtime.state.match.totalPairs })
        : translate("match.progress", { current: 0, total: 0 });
      timeSeconds = runtime.state.match.elapsedSeconds;
    } else if (runtime.state.mode === "abbreviation") {
      const targetRounds = app.abbreviation?.getAbbreviationRoundTarget?.() || runtime.constants.ABBREVIATION_ROUNDS;
      progressText = translate("session.round", {
        current: runtime.state.abbreviation.currentRound,
        total: targetRounds,
      });
      timeSeconds = runtime.state.abbreviation.elapsedSeconds;
    } else if (runtime.state.mode === "sentenceBank") {
      const inReview = Boolean(runtime.state.sentenceBank.inReview);
      const totalRounds = app.sentenceBank?.getRoundTarget?.() || runtime.constants.LESSON_ROUNDS;
      progressText = inReview
        ? translate("session.secondChanceProgress", {
            current: runtime.state.sentenceBank.secondChanceCurrent,
            total: runtime.state.sentenceBank.secondChanceTotal,
          })
        : translate("session.round", {
            current: runtime.state.sentenceBank.currentRound,
            total: totalRounds,
          });
      timeSeconds = runtime.state.sentenceBank.elapsedSeconds;
    } else if (runtime.state.mode === "advConj") {
      progressText = translate("session.round", {
        current: runtime.state.advConj.currentRound,
        total: runtime.constants.ADV_CONJ_ROUNDS,
      });
      timeSeconds = runtime.state.advConj.elapsedSeconds;
    } else {
      const inSecondChance = Boolean(runtime.state.lesson.inReview);
      progressText = inSecondChance
        ? translate("session.secondChanceProgress", {
            current: runtime.state.lesson.secondChanceCurrent,
            total: runtime.state.lesson.secondChanceTotal,
          })
        : translate("session.round", {
            current: runtime.state.lesson.currentRound,
            total: runtime.constants.LESSON_ROUNDS,
          });
      timeSeconds = runtime.state.lesson.elapsedSeconds;
    }
  }

  return {
    gameplayActive,
    progressText,
    timeSeconds,
    timeText: ui.formatCompactElapsedSeconds(timeSeconds),
    comboCount,
    comboText: `x${comboCount}`,
    timeAriaText: translate("session.timer", { seconds: timeSeconds }),
    comboAriaText: translate("session.combo", { count: comboCount }),
  };
};

ui.renderGameplayPill = ui.renderGameplayPill || function renderGameplayPill() {
  const runtime = getRuntime();
  const meta = ui.getGameplayHeaderMeta();
  if (!runtime.el?.shellGameplayPill) return;
  const shouldShow = meta.gameplayActive;

  if (runtime.el.shellGameplayTime) {
    runtime.el.shellGameplayTime.textContent = meta.timeText;
  }
  if (runtime.el.shellGameplayCombo) {
    runtime.el.shellGameplayCombo.textContent = meta.comboText;
  }

  runtime.el.shellGameplayPill.classList.toggle("hidden", !shouldShow);
  runtime.el.shellGameplayPill.setAttribute("aria-hidden", shouldShow ? "false" : "true");
  runtime.el.shellGameplayPill.setAttribute("aria-label", `${meta.timeAriaText} • ${meta.comboAriaText}`);
};

ui.renderShellChrome = ui.renderShellChrome || function renderShellChrome() {
  const runtime = getRuntime();
  const routeKey = `nav.${runtime.state.route}`;
  const { gameplayActive } = ui.getGameplayHeaderMeta();
  runtime.global.document.body?.setAttribute("data-gameplay-active", gameplayActive ? "true" : "false");
  if (runtime.el?.shellTopbar) {
    runtime.el.shellTopbar.classList.toggle("gameplay-active", gameplayActive);
  }
  if (runtime.el?.shellTopTitle) {
    const appTitleText = translate("app.name");
    runtime.el.shellTopTitle.textContent = appTitleText;
    runtime.el.shellTopTitle.setAttribute("aria-label", appTitleText);
  }
  ui.renderGameplayPill();
  if (runtime.el?.shellRouteChip) {
    runtime.el.shellRouteChip.textContent = translate(routeKey);
  }
  if (runtime.el?.shellRouteSummary) {
    if (runtime.state.summary.active && runtime.state.route === "results") {
      runtime.el.shellRouteSummary.textContent = translate("summary.thumbsText");
    } else if (runtime.state.route === "home") {
      runtime.el.shellRouteSummary.textContent = app.session?.hasActiveLearnSession?.()
        ? translate("dashboard.active")
        : translate("dashboard.ready");
    } else {
      runtime.el.shellRouteSummary.textContent = translate(routeKey);
    }
  }

  (runtime.el?.routeButtons || []).forEach((button) => {
    const buttonRoute = button.dataset.route || "home";
    button.classList.toggle("active", buttonRoute === runtime.state.route);
  });
};

ui.updateLessonProgress = ui.updateLessonProgress || function updateLessonProgress(percent) {
  const runtime = getRuntime();
  if (!runtime.el?.lessonProgressFill) return;
  const normalizedPercent = Math.max(0, Math.min(100, Number(percent || 0)));
  runtime.el.lessonProgressFill.style.width = `${normalizedPercent}%`;
  runtime.el.lessonProgressFill.classList.toggle("is-empty", normalizedPercent <= 0);
  runtime.el.lessonProgressBar?.setAttribute("aria-valuenow", String(normalizedPercent));
};

ui.getProgressStreakTier = ui.getProgressStreakTier || function getProgressStreakTier(streak = getRuntime().state.sessionStreak) {
  const normalized = Math.max(0, Number(streak || 0));
  if (normalized >= 8) return 4;
  if (normalized >= 6) return 3;
  if (normalized >= 4) return 2;
  if (normalized >= 2) return 1;
  return 0;
};

ui.renderProgressBarState = ui.renderProgressBarState || function renderProgressBarState() {
  const runtime = getRuntime();
  const progressBar = runtime.el?.lessonProgressBar;
  const progressFill = runtime.el?.lessonProgressFill;
  const streakTier = String(ui.getProgressStreakTier(runtime.state.sessionStreak));
  const meta = ui.getGameplayHeaderMeta();
  const parts = [
    String(meta.progressText || "").trim(),
    String(meta.timeAriaText || "").trim(),
    String(meta.comboAriaText || "").trim(),
  ].filter(Boolean);

  if (progressBar) {
    progressBar.dataset.streakTier = streakTier;
    progressBar.setAttribute("aria-label", parts.join(" • ") || "Lesson progress");
    progressBar.setAttribute("title", parts.join(" • "));
  }
  if (progressFill) {
    progressFill.dataset.streakTier = streakTier;
  }
};

ui.questionNeedsSelection = ui.questionNeedsSelection || function questionNeedsSelection(question) {
  if (!question) return true;
  if (question.locked) return false;
  return !question.selectedOptionId;
};

ui.getHebrewText = ui.getHebrewText || function getHebrewText(word, withNiqqud) {
  const plain = word?.he || "";
  const marked = word?.heNiqqud || plain;
  return withNiqqud ? marked : plain;
};

ui.buildAnswerDisplay = ui.buildAnswerDisplay || function buildAnswerDisplay(word, withNiqqud = false) {
  return ui.getHebrewText(word, withNiqqud);
};

ui.setFeedback = ui.setFeedback || function setFeedback(payload, success) {
  const runtime = getRuntime();
  if (!runtime.el?.feedbackTray || !runtime.el?.feedbackSentence || !runtime.el?.feedbackDetail) return;

  const normalized = payload && typeof payload === "object" && !Array.isArray(payload)
    ? {
        tone: String(payload.tone || "info"),
        sentence: String(payload.sentence || "").trim(),
        detail: String(payload.detail || "").trim(),
      }
    : {
        tone: success === false ? "error" : success ? "success" : "info",
        sentence: String(payload || "").trim(),
        detail: "",
      };

  runtime.el.feedbackSentence.textContent = normalized.sentence;
  runtime.el.feedbackDetail.textContent = normalized.detail;
  runtime.el.feedbackDetail.classList.toggle("hidden", !normalized.detail);
  runtime.el.feedbackTray.classList.remove("success", "error", "info");
  runtime.el.feedbackTray.classList.add(normalized.tone);
  ui.updateStickyLessonActionsState();
};

ui.clearFeedback = ui.clearFeedback || function clearFeedback() {
  const runtime = getRuntime();
  if (!runtime.el?.feedbackTray || !runtime.el?.feedbackSentence || !runtime.el?.feedbackDetail) return;
  runtime.el.feedbackSentence.textContent = "";
  runtime.el.feedbackDetail.textContent = "";
  runtime.el.feedbackDetail.classList.add("hidden");
  runtime.el.feedbackTray.classList.remove("success", "error", "info");
  ui.updateStickyLessonActionsState();
};

ui.updateLessonShellModeState = ui.updateLessonShellModeState || function updateLessonShellModeState() {
  const runtime = getRuntime();
  const shell = runtime.el?.homeLessonStage;
  const promptCard = runtime.el?.promptCard;
  const lessonTitleRow = runtime.el?.lessonTitleRow;
  if (!shell || !promptCard) return;

  const layoutMode = runtime.state.mode === "verbMatch"
    ? "verb-match"
    : (runtime.state.mode === "lesson" || runtime.state.mode === "sentenceBank" || runtime.state.mode === "abbreviation" || runtime.state.mode === "advConj")
      ? "standard"
      : "idle";

  shell.dataset.gameLayout = layoutMode;
  promptCard.dataset.gameLayout = layoutMode;
  shell.classList.toggle("mode-standard", layoutMode === "standard");
  shell.classList.toggle("mode-verb-match", layoutMode === "verb-match");
  shell.classList.toggle("mode-sentence-bank", runtime.state.mode === "sentenceBank");
  promptCard.classList.toggle("mode-standard", layoutMode === "standard");
  promptCard.classList.toggle("mode-verb-match", layoutMode === "verb-match");
  promptCard.classList.toggle("mode-sentence-bank", runtime.state.mode === "sentenceBank");
  if (lessonTitleRow) {
    lessonTitleRow.classList.toggle("hidden", ui.isGameplayRouteActive());
    lessonTitleRow.setAttribute("aria-hidden", ui.isGameplayRouteActive() ? "true" : "false");
  }
};

ui.updatePromptCardState = ui.updatePromptCardState || function updatePromptCardState() {
  const runtime = getRuntime();
  const promptCard = runtime.el?.promptCard;
  if (!promptCard) return;

  const hasLabel = Boolean(runtime.el?.promptLabel?.textContent?.trim()) && !runtime.el.promptLabel.classList.contains("hidden");
  const hasControl = Boolean(runtime.el?.promptSpeechBtn) && !runtime.el.promptSpeechBtn.classList.contains("hidden");
  promptCard.classList.toggle("has-prompt-label", hasLabel);
  promptCard.classList.toggle("has-prompt-control", hasControl);
};

ui.renderPromptLabel = ui.renderPromptLabel || function renderPromptLabel(text = "", visible = false) {
  const runtime = getRuntime();
  if (!runtime.el?.promptLabel) return;
  const cleanText = String(text || "").trim();
  const showLabel = Boolean(visible && cleanText);
  runtime.el.promptLabel.textContent = showLabel ? cleanText : "";
  runtime.el.promptLabel.classList.toggle("hidden", !showLabel);
  ui.updatePromptCardState();
};

ui.updateStickyLessonActionsState = ui.updateStickyLessonActionsState || function updateStickyLessonActionsState() {
  const runtime = getRuntime();
  const footer = runtime.el?.lessonFooter || runtime.global?.document?.querySelector?.("#lessonFooter");
  const actionBar = runtime.el?.stickyLessonActions || runtime.global?.document?.querySelector?.("#stickyLessonActions");
  const feedbackTray = runtime.el?.feedbackTray || runtime.global?.document?.querySelector?.("#feedbackTray");
  const feedbackSentence = runtime.el?.feedbackSentence || runtime.global?.document?.querySelector?.("#feedbackSentence");
  const feedbackDetail = runtime.el?.feedbackDetail || runtime.global?.document?.querySelector?.("#feedbackDetail");
  if (!actionBar) return;
  const hasVisibleAction = Array.from(actionBar.querySelectorAll("button")).some((button) => !button.classList.contains("hidden"));
  const canShowFeedback = runtime.state.mode === "lesson" || runtime.state.mode === "sentenceBank" || runtime.state.mode === "abbreviation" || runtime.state.mode === "advConj";
  const hasFeedback = canShowFeedback && Boolean(
    String(feedbackSentence?.textContent || "").trim() ||
    String(feedbackDetail?.textContent || "").trim()
  );
  actionBar.classList.toggle("is-empty", !hasVisibleAction);
  actionBar.setAttribute("aria-hidden", hasVisibleAction ? "false" : "true");
  if (feedbackTray) {
    feedbackTray.classList.toggle("hidden", !hasFeedback);
    feedbackTray.setAttribute("aria-hidden", hasFeedback ? "false" : "true");
  }
  if (footer) {
    const showFooter = hasVisibleAction || hasFeedback;
    footer.classList.toggle("hidden", !showFooter);
    footer.classList.toggle("is-empty", !showFooter);
    footer.setAttribute("aria-hidden", showFooter ? "false" : "true");
  }
};

ui.renderPromptHint = ui.renderPromptHint || function renderPromptHint() {
  const runtime = getRuntime();
  if (!runtime.el?.promptHint) return;
  const speechHint = runtime.state.mode === "verbMatch"
    && runtime.state.match.active
    && (app.speech?.isEnabled?.() || false)
    && (app.speech?.isSupported?.() || false);
  const showHint = Boolean(speechHint);
  runtime.el.promptHint.textContent = speechHint ? translate("speech.tipSelectHebrewFirst") : "";
  runtime.el.promptHint.classList.toggle("hidden", !showHint);
  ui.updatePromptCardState();
};

ui.getCurrentPromptSpeechPayload = ui.getCurrentPromptSpeechPayload || function getCurrentPromptSpeechPayload() {
  const runtime = getRuntime();
  if (runtime.state.mode === "verbMatch") {
    return app.verbMatch?.getVerbMatchPromptSpeechPayload?.() || null;
  }
  if (runtime.state.mode === "abbreviation") {
    return app.abbreviation?.getAbbreviationPromptSpeechPayload?.() || null;
  }
  if (runtime.state.mode === "sentenceBank") {
    return app.sentenceBank?.getSentenceBankPromptSpeechPayload?.() || null;
  }
  if (runtime.state.mode === "advConj") {
    return app.advConj?.getAdvConjPromptSpeechPayload?.() || null;
  }
  return app.lessonMode?.getLessonPromptSpeechPayload?.() || null;
};

ui.renderPromptSpeechButton = ui.renderPromptSpeechButton || function renderPromptSpeechButton() {
  const runtime = getRuntime();
  if (!runtime.el?.promptSpeechBtn) return;
  const payload = ui.getCurrentPromptSpeechPayload();
  const supported = app.speech?.isSupported?.() || false;
  const showButton = Boolean(payload) && supported;

  runtime.el.promptSpeechBtn.innerHTML = PROMPT_SPEAKER_ICON;
  runtime.el.promptSpeechBtn.setAttribute("aria-label", translate("speech.playPromptAria"));
  runtime.el.promptSpeechBtn.setAttribute("title", translate("speech.playPromptTitle"));
  runtime.el.promptSpeechBtn.classList.toggle("hidden", !showButton);
  runtime.el.promptSpeechBtn.disabled = !showButton;
  runtime.el.promptSpeechBtn.setAttribute("aria-hidden", showButton ? "false" : "true");
  ui.updatePromptCardState();
};

ui.playPromptSpeech = ui.playPromptSpeech || function playPromptSpeech() {
  const payload = ui.getCurrentPromptSpeechPayload();
  if (!payload) return false;
  return app.speech?.speak?.(payload, { force: true }) || false;
};

ui.resetSessionCounters = ui.resetSessionCounters || function resetSessionCounters() {
  const runtime = getRuntime();
  runtime.state.sessionScore = 0;
  runtime.state.sessionStreak = 0;
};

ui.resetSessionScore = ui.resetSessionScore || function resetSessionScore() {
  const runtime = getRuntime();
  runtime.state.sessionScore = 0;
};

ui.renderAll = ui.renderAll || function renderAll() {
  const runtime = getRuntime();
  app.i18n?.applyLanguage?.();
  runtime.state.route = getSession().resolveInitialRoute?.(runtime.state.route) || runtime.state.route;
  ui.renderShellChrome();
  ui.renderPoolMeta();
  ui.renderDomainPerformance();
  ui.renderMostMissed();
  ui.renderMasteredModal();
  ui.renderHomeState();
  ui.renderReviewState();
  ui.renderSettingsState();
  ui.renderWelcomeModal();
  ui.renderSummaryState();
  ui.renderLearnState();
  ui.renderRouteVisibility();
  ui.updateUiLockState();
  app.persistence?.persistUiState?.();
  app.persistence?.persistSessionState?.();
};

ui.renderLearnState = ui.renderLearnState || function renderLearnState() {
  const runtime = getRuntime();
  ui.updateLessonShellModeState();
  if (runtime.state.summary.active) {
    ui.renderPromptHint();
    return;
  }

  if (runtime.state.mode === "verbMatch") {
    if (runtime.state.match.active && runtime.state.match.currentVerb) {
      app.verbMatch?.renderVerbMatchRound?.();
    } else {
      app.verbMatch?.renderVerbMatchIdleState?.();
    }
    ui.renderPromptHint();
    return;
  }

  if (runtime.state.mode === "abbreviation") {
    if (runtime.state.abbreviation.active && runtime.state.abbreviation.currentQuestion) {
      app.abbreviation?.renderAbbreviationQuestion?.();
    } else {
      app.abbreviation?.renderAbbreviationIdleState?.();
    }
    ui.renderPromptHint();
    return;
  }

  if (runtime.state.sentenceBank.active || runtime.state.mode === "sentenceBank") {
    if (runtime.state.sentenceBank.active && runtime.state.sentenceBank.currentQuestion) {
      app.sentenceBank?.renderSentenceBankQuestion?.();
    } else {
      app.sentenceBank?.renderSentenceBankIdleState?.();
    }
    ui.renderPromptHint();
    return;
  }

  if (runtime.state.mode === "advConj") {
    if (runtime.state.advConj.active && runtime.state.advConj.currentQuestion) {
      app.advConj?.renderAdvConjQuestion?.();
    } else if (runtime.state.advConj.active) {
      ui.renderSessionHeader();
    }
    ui.renderPromptHint();
    return;
  }

  if (runtime.state.lesson.active || runtime.state.mode === "lesson") {
    if (runtime.state.lesson.active && runtime.state.currentQuestion) {
      app.lessonMode?.renderQuestion?.();
    } else {
      ui.renderIdleLessonState();
    }
    ui.renderPromptHint();
    return;
  }

  ui.renderIdleLessonState();
  ui.renderPromptHint();
};

ui.renderSessionHeader = ui.renderSessionHeader || function renderSessionHeader() {
  const runtime = getRuntime();
  const data = getData();
  ui.updateLessonShellModeState();
  const finalizeHeaderRender = () => {
    ui.renderProgressBarState();
    ui.renderShellChrome();
    ui.updateStickyLessonActionsState();
    app.persistence?.persistSessionState?.();
  };

  ui.renderPromptHint();
  runtime.el.masterVerbBtn?.classList.add("hidden");
  ui.updateLessonProgress(0);

  if (runtime.state.mode === "summary" && runtime.state.summary.active) {
    runtime.el.modeTitle.textContent = translate(runtime.state.summary.titleKey || "summary.resultsHeader", runtime.state.summary.titleVars);
    runtime.el.nextBtn.classList.add("hidden");
    finalizeHeaderRender();
    return;
  }

  if (runtime.state.mode === "verbMatch") {
    const verbTitle = runtime.state.match.active ? translate("session.verbMatchTitle") : translate("session.verbMatchStart");
    const hasMatch = runtime.state.match.active && runtime.state.match.currentVerb;
    const pairProgress = hasMatch
      ? translate("match.progress", { current: runtime.state.match.matchedCount, total: runtime.state.match.totalPairs })
      : translate("match.progress", { current: 0, total: 0 });

    runtime.el.modeTitle.textContent = verbTitle;
    ui.updateLessonProgress(
      runtime.state.match.totalPairs
        ? Math.round((runtime.state.match.matchedCount / runtime.state.match.totalPairs) * 100)
        : 0
    );

    const canAdvanceVerb =
      runtime.state.match.active &&
      runtime.state.match.totalPairs > 0 &&
      runtime.state.match.matchedCount >= runtime.state.match.totalPairs;
    const shouldShowSummary = canAdvanceVerb && runtime.state.match.verbQueue.length === 0;
    runtime.el.nextBtn.disabled = !canAdvanceVerb;
    runtime.el.nextBtn.textContent = shouldShowSummary ? translate("session.viewResults") : translate("session.nextVerb");
    runtime.el.nextBtn.classList.toggle("hidden", !canAdvanceVerb);
    const showMasterAction =
      canAdvanceVerb &&
      Boolean(runtime.state.match.eligibleMasterWordId) &&
      data.isWordAvailableForMode?.(data.getWordById?.(runtime.state.match.eligibleMasterWordId), "translationQuiz") &&
      !data.isWordMastered?.(runtime.state.match.eligibleMasterWordId);
    if (runtime.el.masterVerbBtn) {
      runtime.el.masterVerbBtn.disabled = !showMasterAction;
      runtime.el.masterVerbBtn.textContent = translate("mastered.moveCurrent");
      runtime.el.masterVerbBtn.classList.toggle("hidden", !showMasterAction);
    }
    finalizeHeaderRender();
    return;
  }

  if (runtime.state.mode === "abbreviation") {
    const targetRounds = app.abbreviation?.getAbbreviationRoundTarget?.() || runtime.constants.ABBREVIATION_ROUNDS;
    const hasQuestion = runtime.state.abbreviation.active && Boolean(runtime.state.abbreviation.currentQuestion);
    runtime.el.modeTitle.textContent = runtime.state.abbreviation.active
      ? translate("session.abbreviationTitle")
      : translate("session.abbreviationStart");
    ui.updateLessonProgress(targetRounds ? Math.round((runtime.state.abbreviation.currentRound / targetRounds) * 100) : 0);
    runtime.el.nextBtn.disabled = ui.questionNeedsSelection(runtime.state.abbreviation.currentQuestion);
    runtime.el.nextBtn.textContent = hasQuestion && !runtime.state.abbreviation.currentQuestion?.locked
      ? translate("session.submit")
      : translate("session.next");
    runtime.el.nextBtn.classList.toggle("hidden", !hasQuestion);
    finalizeHeaderRender();
    return;
  }

  if (runtime.state.mode === "sentenceBank") {
    const inReview = Boolean(runtime.state.sentenceBank.inReview);
    const hasQuestion = runtime.state.sentenceBank.active && Boolean(runtime.state.sentenceBank.currentQuestion);
    const question = runtime.state.sentenceBank.currentQuestion;
    const totalRounds = app.sentenceBank?.getRoundTarget?.() || runtime.constants.LESSON_ROUNDS;
    const canCheck = app.sentenceBank?.canSubmitCurrentQuestion?.(question) || false;

    runtime.el.modeTitle.textContent = inReview
      ? translate("session.sentenceBankSecondChanceTitle")
      : translate("session.sentenceBankTitle");
    ui.updateLessonProgress(
      inReview
        ? 100
        : Math.round((runtime.state.sentenceBank.currentRound / Math.max(1, totalRounds)) * 100)
    );
    runtime.el.nextBtn.disabled = hasQuestion && !question?.locked ? !canCheck : false;
    runtime.el.nextBtn.textContent = hasQuestion && !question?.locked
      ? translate("session.check")
      : translate("session.next");
    runtime.el.nextBtn.classList.toggle("hidden", !hasQuestion);
    finalizeHeaderRender();
    return;
  }

  if (runtime.state.mode === "advConj") {
    const hasQuestion = runtime.state.advConj.active && Boolean(runtime.state.advConj.currentQuestion);
    runtime.el.modeTitle.textContent = translate("game.advConjName");
    ui.updateLessonProgress(
      runtime.constants.ADV_CONJ_ROUNDS
        ? Math.round((runtime.state.advConj.currentRound / runtime.constants.ADV_CONJ_ROUNDS) * 100)
        : 0
    );
    runtime.el.nextBtn.disabled = ui.questionNeedsSelection(runtime.state.advConj.currentQuestion);
    runtime.el.nextBtn.textContent = hasQuestion && !runtime.state.advConj.currentQuestion?.locked
      ? translate("session.submit")
      : translate("session.next");
    runtime.el.nextBtn.classList.toggle("hidden", !hasQuestion);
    finalizeHeaderRender();
    return;
  }

  const inSecondChance = Boolean(runtime.state.lesson.inReview);
  const hasQuestion = runtime.state.lesson.active && Boolean(runtime.state.currentQuestion);
  runtime.el.modeTitle.textContent = inSecondChance
    ? translate("session.secondChanceTitle")
    : translate("session.mixedTitle", { rounds: runtime.constants.LESSON_ROUNDS });
  ui.updateLessonProgress(
    inSecondChance
      ? 100
      : Math.round((runtime.state.lesson.currentRound / runtime.constants.LESSON_ROUNDS) * 100)
  );
  runtime.el.nextBtn.disabled = ui.questionNeedsSelection(runtime.state.currentQuestion);
  runtime.el.nextBtn.textContent = hasQuestion && !runtime.state.currentQuestion?.locked
    ? translate("session.submit")
    : translate("session.next");
  runtime.el.nextBtn.classList.toggle("hidden", !hasQuestion);
  finalizeHeaderRender();
};

ui.renderPromptText = ui.renderPromptText || function renderPromptText(question = getRuntime().state.currentQuestion) {
  const runtime = getRuntime();
  if (runtime.state.mode === "verbMatch") {
    app.verbMatch?.renderVerbMatchPrompt?.();
    ui.renderPromptSpeechButton();
    return;
  }

  if (!question) {
    ui.renderNiqqudToggle();
    ui.renderPromptSpeechButton();
    return;
  }

  const promptUsesWordSurface = question.promptUsesWordSurface !== false;
  const hasHebrewSurface = Boolean(question.promptIsHebrew || question.optionsAreHebrew);

  if (question.promptIsHebrew) {
    runtime.el.promptText.classList.add("hebrew");
    runtime.el.promptText.classList.remove("english-prompt");
  } else {
    runtime.el.promptText.classList.remove("hebrew");
    runtime.el.promptText.classList.add("english-prompt");
  }

  if (question.promptIsHebrew && question.word && promptUsesWordSurface) {
    runtime.el.promptText.textContent = ui.getHebrewText(question.word, runtime.state.showNiqqudInline);
  } else {
    runtime.el.promptText.textContent = runtime.state.showNiqqudInline && question.promptNiqqud
      ? question.promptNiqqud
      : question.prompt;
  }

  ui.renderNiqqudToggle();
  ui.renderPromptSpeechButton();
  if (!hasHebrewSurface) {
    return;
  }
};

ui.renderPoolMeta = ui.renderPoolMeta || function renderPoolMeta() {
  const runtime = getRuntime();
  const data = getData();
  const pool = data.getSelectedPool?.() || [];
  const all = data.getAllVocabulary?.() || [];
  if (!runtime.el?.poolMeta) return;
  runtime.el.poolMeta.textContent = translate("pool.summary", { pool: pool.length, total: all.length });

  if (!runtime.storage) {
    runtime.el.poolMeta.textContent += ` ${translate("pool.tempProgress")}`;
  }

  if (runtime.usingFallbackVocab) {
    runtime.el.poolMeta.textContent += ` ${translate("pool.fallback")}`;
  }
};

ui.renderDomainPerformance = ui.renderDomainPerformance || function renderDomainPerformance() {
  const data = getData();
  const runtime = getRuntime();
  const stats = data.calculateDomainStats?.() || [];
  ui.renderPerformanceCardsInto(runtime.el?.homeDomainPerformance, stats);
  ui.renderPerformanceCardsInto(runtime.el?.reviewDomainPerformance, stats);
  ui.renderGameModePerformance();
};

ui.renderGameModePerformance = ui.renderGameModePerformance || function renderGameModePerformance() {
  const data = getData();
  const runtime = getRuntime();
  const stats = data.calculateGameModeStats?.() || {
    conjugation: { attempts: 0, correct: 0, wrong: 0 },
    abbreviation: { attempts: 0, correct: 0, wrong: 0 },
  };
  const cards = [
    {
      emoji: "🧩",
      title: translate("game.sentenceBankName"),
      attempts: stats.sentenceBank.attempts,
      correct: stats.sentenceBank.correct,
      wrong: stats.sentenceBank.wrong,
    },
    {
      emoji: "🔗",
      title: translate("game.conjugationName"),
      attempts: stats.conjugation.attempts,
      correct: stats.conjugation.correct,
      wrong: stats.conjugation.wrong,
    },
    {
      emoji: "⏩",
      title: translate("game.abbreviationName"),
      attempts: stats.abbreviation.attempts,
      correct: stats.abbreviation.correct,
      wrong: stats.abbreviation.wrong,
    },
  ];

  ui.renderPerformanceCardsInto(runtime.el?.homeModePerformance, cards);
  ui.renderPerformanceCardsInto(runtime.el?.reviewModePerformance, cards);
};

ui.renderPerformanceCardsInto = ui.renderPerformanceCardsInto || function renderPerformanceCardsInto(container, cards) {
  if (!container) return;
  container.innerHTML = "";
  cards.forEach((card) => {
    ui.appendPerformanceCard(container, {
      emoji: card.emoji,
      title: card.title || translate(`domain.${card.id}`),
      attempts: card.attempts,
      correct: card.correct,
      wrong: card.wrong,
    });
  });
};

ui.appendPerformanceCard = ui.appendPerformanceCard || function appendPerformanceCard(container, stats) {
  if (!container) return;

  const card = global.document.createElement("article");
  card.className = "domain-card";

  const ring = global.document.createElement("div");
  ring.className = "domain-ring";

  const attempts = Math.max(0, Number(stats?.attempts || 0));
  const correct = Math.max(0, Math.min(attempts, Number(stats?.correct || 0)));
  const wrong = Math.max(0, Number(stats?.wrong || 0));
  const correctPct = attempts ? Math.round((correct / attempts) * 100) : 0;
  const wrongPct = attempts ? 100 - correctPct : 0;

  ring.style.setProperty("--ring-good", `${correctPct}%`);
  ring.style.setProperty("--ring-bad", `${wrongPct}%`);
  ring.classList.toggle("empty", attempts === 0);

  const emoji = global.document.createElement("span");
  emoji.className = "domain-emoji";
  emoji.textContent = String(stats?.emoji || "•");
  ring.append(emoji);

  const meta = global.document.createElement("div");
  meta.className = "domain-meta";

  const title = global.document.createElement("p");
  title.className = "domain-title";
  title.textContent = String(stats?.title || "");

  const score = global.document.createElement("p");
  score.className = "domain-score";
  score.textContent = `✅ ${correct}  ❌ ${wrong}`;

  meta.append(title, score);
  card.append(ring, meta);
  container.append(card);
};

ui.renderHomeState = ui.renderHomeState || function renderHomeState() {
  const runtime = getRuntime();
  const showLesson = app.session?.hasActiveLearnSession?.() || false;
  runtime.el?.homeDashboard?.classList.toggle("hidden", showLesson);
  runtime.el?.homeLessonStage?.classList.toggle("hidden", !showLesson);
  ui.renderHomeLessonButtons();
  ui.renderHomeOptions();
};

ui.renderSummaryState = ui.renderSummaryState || function renderSummaryState() {
  const runtime = getRuntime();
  if (!runtime.el?.resultsSummary || !runtime.el?.resultsTitle || !runtime.el?.resultsNote) return;
  const titleText = runtime.state.summary.titleKey
    ? translate(runtime.state.summary.titleKey, runtime.state.summary.titleVars)
    : translate("summary.resultsHeader");
  const scoreValue = ui.getSummaryScoreValue();
  const scoreTotal = ui.getSummaryScoreTotal();
  const accuracy = ui.getSummaryAccuracyPercent();
  const praise = ui.isPerfectSummary()
    ? translate("results.amazing")
    : accuracy < 50
      ? translate("results.roomToImprove")
      : translate("results.niceJob");

  runtime.el.resultsTitle.textContent = titleText;
  runtime.el.resultsNote.textContent = praise;
  runtime.el.resultsSummary.innerHTML = "";

  const performance = ui.createResultsPerformanceGraphic(accuracy);

  const metrics = global.document.createElement("div");
  metrics.className = "results-metrics";
  const metricItems = ui.buildSummaryMetrics({ scoreValue, scoreTotal, accuracy });
  metrics.style.setProperty("--results-metric-count", String(metricItems.length));
  metricItems.forEach((metric) => {
    metrics.append(ui.createResultsMetric(metric.label, metric.value));
  });

  const mistakesWrap = global.document.createElement("div");
  mistakesWrap.className = "results-mistakes";
  const heading = global.document.createElement("h3");
  heading.className = "results-section-title";
  heading.textContent = translate("results.mistakes");
  mistakesWrap.append(heading);

  if (!runtime.state.summary.mistakes.length) {
    const empty = global.document.createElement("p");
    empty.className = "small-note";
    empty.textContent = translate("results.noMistakes");
    mistakesWrap.append(empty);
  } else {
    runtime.state.summary.mistakes.forEach((item) => {
      mistakesWrap.append(
        ui.createCompactRow({
          title: item.primary || item.title || "",
          note: item.secondary || item.note || "",
        })
      );
    });
  }

  runtime.el.resultsSummary.append(performance, metrics, mistakesWrap);
};

ui.renderReviewState = ui.renderReviewState || function renderReviewState() {
};

ui.getSummaryScoreValue = ui.getSummaryScoreValue || function getSummaryScoreValue() {
  const runtime = getRuntime();
  const explicit = Number(runtime.state.summary.scoreVars?.score);
  if (Number.isFinite(explicit) && explicit >= 0) {
    return Math.round(explicit);
  }
  return Math.max(0, runtime.state.summary.correctCount);
};

ui.getSummaryScoreTotal = ui.getSummaryScoreTotal || function getSummaryScoreTotal() {
  const runtime = getRuntime();
  const explicit = Number(runtime.state.summary.scoreVars?.total);
  if (Number.isFinite(explicit) && explicit >= 0) {
    return Math.round(explicit);
  }
  const attempts = runtime.state.summary.correctCount + runtime.state.summary.incorrectCount;
  return Math.max(0, attempts);
};

ui.getSummaryAccuracyPercent = ui.getSummaryAccuracyPercent || function getSummaryAccuracyPercent() {
  const runtime = getRuntime();
  const attempts = runtime.state.summary.correctCount + runtime.state.summary.incorrectCount;
  if (attempts > 0) {
    return Math.round((runtime.state.summary.correctCount / attempts) * 100);
  }
  const total = ui.getSummaryScoreTotal();
  if (total > 0) {
    return Math.round((ui.getSummaryScoreValue() / total) * 100);
  }
  return 100;
};

ui.isPerfectSummary = ui.isPerfectSummary || function isPerfectSummary() {
  const runtime = getRuntime();
  return runtime.state.summary.incorrectCount === 0
    && ui.getSummaryScoreTotal() > 0
    && ui.getSummaryScoreValue() >= ui.getSummaryScoreTotal();
};

ui.formatResultSeconds = ui.formatResultSeconds || function formatResultSeconds(seconds) {
  const runtime = getRuntime();
  const safeSeconds = Math.max(0, Number(seconds || 0));
  return runtime.state.language === "he" ? `${safeSeconds}ש׳` : `${safeSeconds}s`;
};

ui.buildSummaryMetrics = ui.buildSummaryMetrics || function buildSummaryMetrics({ scoreValue, scoreTotal, accuracy }) {
  const runtime = getRuntime();
  return [
    { label: translate("results.score"), value: `${scoreValue}/${scoreTotal}` },
    { label: translate("results.accuracy"), value: `${accuracy}%` },
    { label: translate("results.time"), value: ui.formatResultSeconds(runtime.state.summary.elapsedSeconds) },
  ];
};

ui.createResultsPerformanceGraphic = ui.createResultsPerformanceGraphic || function createResultsPerformanceGraphic(accuracy) {
  const performance = global.document.createElement("section");
  performance.className = "results-performance";
  performance.style.setProperty("--results-score", `${Math.max(0, Math.min(100, accuracy))}%`);
  performance.setAttribute("role", "img");
  performance.setAttribute("aria-label", `${translate("results.accuracy")}: ${accuracy}%`);

  const ring = global.document.createElement("div");
  ring.className = "results-performance-ring";

  const center = global.document.createElement("div");
  center.className = "results-performance-center";

  const percent = global.document.createElement("p");
  percent.className = "results-performance-percent";
  percent.textContent = `${accuracy}%`;

  center.append(percent);
  ring.append(center);
  performance.append(ring);
  return performance;
};

ui.renderSettingsState = ui.renderSettingsState || function renderSettingsState() {
  app.persistence?.applySurveyLinks?.();
  ui.renderThemeToggle();
  ui.renderNiqqudToggle();
  ui.renderSoundToggle();
  ui.renderSpeechToggle();
  ui.renderPromptSpeechButton();
};

ui.createCompactRow = ui.createCompactRow || function createCompactRow({ title, note }) {
  const row = global.document.createElement("article");
  row.className = "compact-row";

  const titleNode = global.document.createElement("p");
  titleNode.className = "compact-row-title";
  titleNode.textContent = title;

  const noteNode = global.document.createElement("p");
  noteNode.className = "compact-row-note";
  noteNode.textContent = note;

  row.append(titleNode, noteNode);
  return row;
};

ui.createResultsMetric = ui.createResultsMetric || function createResultsMetric(label, value) {
  const card = global.document.createElement("article");
  card.className = "results-metric";

  const labelNode = global.document.createElement("p");
  labelNode.className = "results-metric-label";
  labelNode.textContent = label;

  const valueNode = global.document.createElement("p");
  valueNode.className = "results-metric-value";
  valueNode.textContent = value;

  card.append(labelNode, valueNode);
  return card;
};

ui.renderIdleLessonState = ui.renderIdleLessonState || function renderIdleLessonState() {
  const runtime = getRuntime();
  const h = getHelpers();
  runtime.state.mode = app.session?.hasActiveLearnSession?.() ? runtime.state.mode : "lesson";
  ui.setGamePickerVisibility(false);
  ui.setPromptCardVisibility(true);
  runtime.el.choiceContainer.classList.remove("summary-grid");
  h.renderSessionHeader?.();
  ui.renderPromptLabel("", false);
  runtime.el.promptText.classList.remove("hebrew");
  runtime.el.promptText.classList.add("english-prompt");
  runtime.el.promptText.textContent = translate("learn.idlePrompt");
  runtime.el.choiceContainer.innerHTML = "";
  runtime.el.choiceContainer.classList.remove("match-grid");
  h.clearFeedback?.();
  ui.renderNiqqudToggle();
  ui.renderPromptSpeechButton();
};

ui.renderHomeLessonButtons = ui.renderHomeLessonButtons || function renderHomeLessonButtons() {
  const runtime = getRuntime();
  const highlightedMode = app.session?.hasActiveLearnSession?.()
    ? runtime.state.mode
    : runtime.state.lastPlayedMode || "lesson";
  ui.setHomeLessonState(runtime.el?.homeLessonBtn, highlightedMode === "lesson");
  ui.setHomeLessonState(runtime.el?.homeSentenceBankBtn, highlightedMode === "sentenceBank");
  ui.setHomeLessonState(runtime.el?.homeVerbMatchBtn, highlightedMode === "verbMatch");
  ui.setHomeLessonState(runtime.el?.homeAbbreviationBtn, highlightedMode === "abbreviation");
};

ui.setHomeLessonState = ui.setHomeLessonState || function setHomeLessonState(button, isCurrent) {
  if (!button) return;
  button.classList.toggle("is-current", isCurrent);
  button.setAttribute("aria-current", isCurrent ? "true" : "false");
};

ui.renderHomeOptions = ui.renderHomeOptions || function renderHomeOptions() {
  const runtime = getRuntime();
  const h = getHelpers();
  if (runtime.el?.homeLangValue) {
    runtime.el.homeLangValue.textContent = h.getLanguageToggleLabel?.() || "";
    runtime.el.homeLangValue.setAttribute("dir", runtime.state.language === "en" ? "rtl" : "ltr");
    runtime.el.homeLangValue.style.textAlign = "";
    runtime.el.homeLangValue.style.direction = "";
  }
  if (runtime.el?.homeThemeValue) {
    runtime.el.homeThemeValue.textContent = runtime.state.theme === "light"
      ? translate("controls.lightMode")
      : translate("controls.darkMode");
  }
  if (runtime.el?.homeNiqqudValue) {
    runtime.el.homeNiqqudValue.textContent = runtime.state.showNiqqudInline
      ? translate("dashboard.on")
      : translate("dashboard.off");
  }
  if (runtime.el?.homeSoundValue) {
    runtime.el.homeSoundValue.textContent = runtime.state.audio.enabled
      ? translate("audio.on")
      : translate("audio.off");
  }
  if (runtime.el?.homeSpeechValue) {
    runtime.el.homeSpeechValue.textContent = app.speech?.isSupported?.()
      ? (runtime.state.speech.enabled ? translate("speech.on") : translate("speech.off"))
      : translate("speech.unavailable");
  }
  if (runtime.el?.homeThemeToggle) {
    runtime.el.homeThemeToggle.setAttribute("aria-pressed", String(runtime.state.theme === "dark"));
  }
  if (runtime.el?.homeNiqqudToggle) {
    runtime.el.homeNiqqudToggle.setAttribute("aria-pressed", String(runtime.state.showNiqqudInline));
  }
  if (runtime.el?.homeSoundToggle) {
    runtime.el.homeSoundToggle.setAttribute("aria-pressed", String(runtime.state.audio.enabled));
  }
  if (runtime.el?.homeSpeechToggle) {
    const supported = app.speech?.isSupported?.() || false;
    runtime.el.homeSpeechToggle.setAttribute("aria-pressed", String(supported && runtime.state.speech.enabled));
    runtime.el.homeSpeechToggle.disabled = !supported;
  }
};

ui.renderMostMissed = ui.renderMostMissed || function renderMostMissed() {
  const runtime = getRuntime();
  const data = getData();
  const h = getHelpers();
  if (!runtime.el?.mostMissedList || !runtime.el?.mostMissedEmpty) return;

  const wordsById = new Map((data.getAllVocabulary?.() || []).map((word) => [word.id, word]));
  const ranked = data.getMostMissedRanked?.() || [];

  runtime.el.mostMissedList.innerHTML = "";
  runtime.el.mostMissedEmpty.classList.toggle("hidden", ranked.length > 0);

  runtime.el.mostMissedList.style.display = "flex";
  runtime.el.mostMissedList.style.gap = "1.25rem";
  runtime.el.mostMissedList.style.alignItems = "flex-start";

  const half = Math.ceil(ranked.length / 2);
  const cols = [ranked.slice(0, half), ranked.slice(half)];

  runtime.el.mostMissedList.style.direction = "ltr";

  cols.forEach((col, colIdx) => {
    const ol = global.document.createElement("ol");
    ol.className = "missed-col";
    ol.start = colIdx * half + 1;
    ol.style.flex = "1";
    ol.style.margin = "0";
    ol.style.paddingLeft = "1.25rem";
    ol.style.paddingRight = "0";

    col.forEach((entry) => {
      const word = wordsById.get(entry.wordId);
      if (!word) return;

      const item = global.document.createElement("li");
      item.style.textAlign = "center";
      const line = global.document.createElement("p");
      line.className = "missed-word";
      line.setAttribute("dir", "rtl");
      line.setAttribute("lang", "he");
      line.textContent = h.getHebrewText?.(word, true) || "";
      line.title = word.en;
      item.title = word.en;

      const meta = global.document.createElement("p");
      meta.className = "missed-meta";
      meta.setAttribute("dir", "ltr");
      meta.textContent = String(entry.missed);

      item.append(line, meta);
      ol.append(item);
    });

    runtime.el.mostMissedList.append(ol);
  });
};

ui.closeMasteredModal = ui.closeMasteredModal || function closeMasteredModal() {
  const runtime = getRuntime();
  runtime.state.masteredModalOpen = false;
  runtime.state.masteredSelection = new Set();
  ui.renderMasteredModal();
};

ui.closeWelcomeModal = ui.closeWelcomeModal || function closeWelcomeModal() {
  const runtime = getRuntime();
  if (!runtime.state.welcomeModalOpen) return;
  runtime.state.welcomeModalOpen = false;
  ui.renderWelcomeModal();
};

ui.renderWelcomeModal = ui.renderWelcomeModal || function renderWelcomeModal() {
  const runtime = getRuntime();
  if (!runtime.el?.welcomeModal) return;
  app.persistence?.applySurveyLinks?.();
  const open = Boolean(runtime.state.welcomeModalOpen);
  runtime.el.welcomeModal.classList.toggle("hidden", !open);
  runtime.el.welcomeModal.setAttribute("aria-hidden", open ? "false" : "true");
  ui.updateUiLockState();
};

ui.renderMasteredModal = ui.renderMasteredModal || function renderMasteredModal() {
  const runtime = getRuntime();
  const data = getData();
  const h = getHelpers();
  if (!runtime.el?.masteredModal || !runtime.el?.masteredList || !runtime.el?.masteredEmpty || !runtime.el?.masteredRestoreBtn) return;

  const open = Boolean(runtime.state.masteredModalOpen);
  runtime.el.masteredModal.classList.toggle("hidden", !open);
  runtime.el.masteredModal.setAttribute("aria-hidden", open ? "false" : "true");
  ui.updateUiLockState();
  if (!open) return;

  const masteredWords = (data.getMasteredWords?.() || []).sort((a, b) => a.en.localeCompare(b.en));
  const validIds = new Set(masteredWords.map((word) => word.id));
  runtime.state.masteredSelection = new Set([...runtime.state.masteredSelection].filter((id) => validIds.has(id)));

  runtime.el.masteredList.innerHTML = "";
  runtime.el.masteredEmpty.classList.toggle("hidden", masteredWords.length > 0);

  masteredWords.forEach((word) => {
    const row = global.document.createElement("label");
    row.className = "mastered-row";
    row.title = word.en;

    const input = global.document.createElement("input");
    input.type = "checkbox";
    input.checked = runtime.state.masteredSelection.has(word.id);
    input.addEventListener("change", () => {
      if (input.checked) {
        runtime.state.masteredSelection.add(word.id);
      } else {
        runtime.state.masteredSelection.delete(word.id);
      }
      runtime.el.masteredRestoreBtn.disabled = runtime.state.masteredSelection.size === 0;
    });

    const textWrap = global.document.createElement("div");
    const he = global.document.createElement("p");
    he.className = "mastered-row-he";
    he.textContent = h.getHebrewText?.(word, runtime.state.showNiqqudInline) || "";

    const en = global.document.createElement("p");
    en.className = "mastered-row-en";
    en.textContent = word.en;

    textWrap.append(he, en);
    row.append(input, textWrap);
    runtime.el.masteredList.append(row);
  });

  runtime.el.masteredRestoreBtn.disabled = runtime.state.masteredSelection.size === 0;
};

ui.restoreSelectedMasteredWords = ui.restoreSelectedMasteredWords || function restoreSelectedMasteredWords() {
  const runtime = getRuntime();
  const data = getData();
  const h = getHelpers();
  const selectedIds = [...runtime.state.masteredSelection].filter((wordId) => data.isWordMastered?.(wordId));
  if (!selectedIds.length) return;

  selectedIds.forEach((wordId) => data.setWordMastered?.(wordId, false));
  app.persistence?.saveProgress?.();
  runtime.state.masteredSelection = new Set();
  h.renderAll?.();
  h.setFeedback?.(translate("mastered.restored", { count: selectedIds.length }), true);
};
})(typeof window !== "undefined" ? window : globalThis);
