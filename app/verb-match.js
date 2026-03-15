(function initIvriQuestAppVerbMatch(global) {
"use strict";

const app = global.IvriQuestApp = global.IvriQuestApp || {};
const verbMatch = app.verbMatch = app.verbMatch || {};

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

function sanitizeEnglishText(text) {
  return app.utils?.sanitizeEnglishDisplayText
    ? app.utils.sanitizeEnglishDisplayText(text)
    : String(text || "").trim();
}

verbMatch.getVerbMatchPromptSpeechPayload = verbMatch.getVerbMatchPromptSpeechPayload || function getVerbMatchPromptSpeechPayload() {
  const runtime = getRuntime();
  const current = runtime.state.match.currentVerb?.word;
  if (!current) return null;
  return app.speech?.buildSpeechPayload?.({
    plain: current.he,
    niqqud: current.heNiqqud,
    speechOverridePlain: current.speechHe,
    speechOverrideNiqqud: current.speechHeNiqqud,
    source: "prompt",
  }) || null;
};

verbMatch.getVerbMatchCardSpeechPayload = verbMatch.getVerbMatchCardSpeechPayload || function getVerbMatchCardSpeechPayload(card) {
  if (!card) return null;
  return app.speech?.buildSpeechPayload?.({
    plain: card.hebrewPlain,
    niqqud: card.hebrewNiqqud,
    source: "answer",
  }) || null;
};

verbMatch.moveEligibleVerbToMastered = verbMatch.moveEligibleVerbToMastered || function moveEligibleVerbToMastered() {
  const runtime = getRuntime();
  const h = getHelpers();
  const data = getData();
  const wordId = runtime.state.match.eligibleMasterWordId;
  if (!wordId || data.isWordMastered?.(wordId)) return;

  const word = data.getWordById?.(wordId);
  if (!data.isWordAvailableForMode?.(word, "translationQuiz")) return;
  if (!data.setWordMastered?.(wordId, true)) return;

  runtime.state.match.eligibleMasterWordId = "";
  app.persistence?.saveProgress?.();
  h.renderSessionHeader?.();
  h.renderPoolMeta?.();
  h.renderDomainPerformance?.();
  h.renderMostMissed?.();
  h.renderMasteredModal?.();

  const label = word ? `${word.en} / ${h.getHebrewText?.(word, runtime.state.showNiqqudInline) || ""}` : "";
  h.setFeedback?.(translate("mastered.added", { word: label || wordId }), true);
};

verbMatch.startVerbMatch = verbMatch.startVerbMatch || function startVerbMatch() {
  const runtime = getRuntime();
  const h = getHelpers();
  const s = getSession();
  const shuffle = app.utils?.shuffle;
  app.speech?.cancel?.();
  s.stopVerbMatchTimer?.();
  s.stopLessonTimer?.();
  s.stopAbbreviationTimer?.();
  s.closeLeaveSessionConfirm?.();
  h.closeMasteredModal?.();
  s.clearLessonStartIntro?.();
  s.clearSecondChanceIntro?.();
  s.clearVerbMatchIntro?.();
  s.clearAbbreviationIntro?.();
  s.clearSummaryState?.();
  runtime.state.lesson.active = false;
  runtime.state.lesson.inReview = false;
  runtime.state.currentQuestion = null;
  h.resetSessionScore?.();
  verbMatch.resetVerbMatchState();
  h.resetAbbreviationState?.();
  runtime.state.mode = "verbMatch";
  runtime.state.route = "home";
  runtime.state.lastPlayedMode = "verbMatch";
  h.setGamePickerVisibility?.(false);
  runtime.el.choiceContainer.innerHTML = "";
  runtime.el.choiceContainer.classList.remove("match-grid");

  if (!runtime.verbFormDeck?.length) {
    runtime.state.match.active = false;
    verbMatch.renderVerbMatchIdleState();
    h.setFeedback?.(translate("match.noVerbs"), false);
    return;
  }

  runtime.state.match.active = true;
  const shuffledDeck = typeof shuffle === "function" ? shuffle(runtime.verbFormDeck) : [...runtime.verbFormDeck];
  runtime.state.match.verbQueue = shuffledDeck.slice(0, runtime.constants.VERB_MATCH_ROUNDS);
  runtime.state.match.totalVerbs = runtime.state.match.verbQueue.length;
  runtime.state.match.currentVerbIndex = 0;
  runtime.state.match.startMs = 0;
  runtime.state.match.elapsedSeconds = 0;
  runtime.state.match.sessionMatched = 0;
  runtime.state.match.sessionTotalPairs = runtime.state.match.verbQueue.reduce(
    (sum, item) => sum + verbMatch.selectVerbRoundPairs(item.forms).length,
    0
  );
  h.clearFeedback?.();
  h.playVerbMatchIntro?.();
  h.renderAll?.();
};

verbMatch.playVerbMatchIntro = verbMatch.playVerbMatchIntro || function playVerbMatchIntro() {
  const runtime = getRuntime();
  const session = getSession();
  const h = getHelpers();
  if (!runtime.el.verbMatchIntro) {
    verbMatch.beginVerbMatchFromIntro();
    return;
  }

  session.clearVerbMatchIntro?.();
  runtime.state.match.verbIntroActive = true;
  h.showBlockingOverlay?.(runtime.el.verbMatchIntro);
  session.scheduleIntroAutoAdvance?.(() => verbMatch.beginVerbMatchFromIntro());
};

verbMatch.beginVerbMatchFromIntro = verbMatch.beginVerbMatchFromIntro || function beginVerbMatchFromIntro() {
  const runtime = getRuntime();
  const session = getSession();
  const h = getHelpers();
  if (!runtime.state.match.active) return;
  if (!runtime.state.match.verbIntroActive && runtime.state.match.currentVerb) return;
  if (runtime.state.match.verbIntroActive) {
    session.clearVerbMatchIntro?.();
  }

  if (!runtime.state.match.startMs) {
    runtime.state.match.startMs = Date.now();
    runtime.state.match.elapsedSeconds = 0;
    session.startVerbMatchTimer?.();
  }
  h.clearFeedback?.();
  verbMatch.loadNextVerbRound();
};

verbMatch.resetVerbMatchState = verbMatch.resetVerbMatchState || function resetVerbMatchState() {
  const runtime = getRuntime();
  runtime.state.match.active = false;
  runtime.state.match.verbQueue = [];
  runtime.state.match.totalVerbs = 0;
  runtime.state.match.currentVerbIndex = 0;
  runtime.state.match.currentVerb = null;
  runtime.state.match.pairs = [];
  runtime.state.match.remainingPairs = [];
  runtime.state.match.leftCards = [];
  runtime.state.match.rightCards = [];
  runtime.state.match.selectedLeftId = null;
  runtime.state.match.selectedRightId = null;
  runtime.state.match.mismatchedCardIds = [];
  runtime.state.match.matchedCardIds = [];
  runtime.state.match.matchedPairIds = [];
  runtime.state.match.isResolving = false;
  runtime.state.match.nextCardId = 1;
  runtime.state.match.combo = 0;
  runtime.state.match.bestCombo = 0;
  runtime.state.match.matchedCount = 0;
  runtime.state.match.totalPairs = 0;
  runtime.state.match.startMs = 0;
  runtime.state.match.elapsedSeconds = 0;
  runtime.state.match.verbIntroActive = false;
  runtime.state.match.sessionMatched = 0;
  runtime.state.match.sessionTotalPairs = 0;
  runtime.state.match.currentVerbHadMismatch = false;
  runtime.state.match.eligibleMasterWordId = "";
  runtime.state.match.mismatchCount = 0;
  runtime.state.match.sessionMistakeIds = [];
};

verbMatch.finishVerbMatchSession = verbMatch.finishVerbMatchSession || function finishVerbMatchSession() {
  const runtime = getRuntime();
  const s = getSession();
  const verbsCovered = runtime.state.match.totalVerbs;
  const sessionMatched = runtime.state.match.sessionMatched;
  const sessionTotal = runtime.state.match.sessionTotalPairs || sessionMatched;
  const bestCombo = runtime.state.match.bestCombo;
  const elapsed = runtime.state.match.elapsedSeconds;
  const mismatchCount = runtime.state.match.mismatchCount;
  const mistakes = app.data?.buildVerbMatchMistakeSummary?.() || [];

  s.stopVerbMatchTimer?.();
  runtime.state.match.active = false;
  verbMatch.resetVerbMatchState();
  s.showSessionSummary?.({
    game: "verbMatch",
    titleKey: "summary.matchTitle",
    scoreKey: "summary.score",
    scoreVars: { score: sessionMatched, total: sessionTotal },
    noteKey: "summary.matchNote",
    noteVars: { verbs: verbsCovered, combo: bestCombo, seconds: elapsed },
    correctCount: sessionMatched,
    incorrectCount: mismatchCount,
    elapsedSeconds: elapsed,
    mistakes,
  });
};

verbMatch.loadNextVerbRound = verbMatch.loadNextVerbRound || function loadNextVerbRound() {
  const runtime = getRuntime();
  const shuffle = app.utils?.shuffle;
  const h = getHelpers();
  if (!runtime.state.match.active) return;
  const nextVerb = runtime.state.match.verbQueue.shift();

  if (!nextVerb) {
    verbMatch.finishVerbMatchSession();
    return;
  }

  runtime.state.match.currentVerbIndex += 1;
  runtime.state.match.currentVerb = nextVerb;
  runtime.state.match.pairs = verbMatch.selectVerbRoundPairs(nextVerb.forms);
  if (!runtime.state.match.pairs.length) {
    verbMatch.loadNextVerbRound();
    return;
  }

  runtime.state.match.totalPairs = runtime.state.match.pairs.length;
  runtime.state.match.matchedCount = 0;
  runtime.state.match.selectedLeftId = null;
  runtime.state.match.selectedRightId = null;
  runtime.state.match.mismatchedCardIds = [];
  runtime.state.match.matchedCardIds = [];
  runtime.state.match.matchedPairIds = [];
  runtime.state.match.isResolving = false;
  runtime.state.match.combo = 0;
  runtime.state.match.currentVerbHadMismatch = false;
  runtime.state.match.eligibleMasterWordId = "";
  runtime.state.match.remainingPairs = typeof shuffle === "function" ? shuffle(runtime.state.match.pairs) : [...runtime.state.match.pairs];
  runtime.state.match.leftCards = [];
  runtime.state.match.rightCards = [];
  runtime.state.match.nextCardId = 1;
  verbMatch.refillVerbMatchColumns();
  h.clearFeedback?.();
  verbMatch.renderVerbMatchRound();
};

verbMatch.selectVerbRoundPairs = verbMatch.selectVerbRoundPairs || function selectVerbRoundPairs(forms) {
  const runtime = getRuntime();
  const ordered = forms.filter((item) => runtime.matchFormOrder.includes(item.id));
  const byId = new Map(ordered.map((item) => [item.id, item]));
  const deduped = [];
  const seenHebrew = new Set();
  const seenEnglish = new Set();

  runtime.matchFormOrder.forEach((id) => {
    const item = byId.get(id);
    if (!item) return;
    const hebrewKey = String(item.valuePlain || "").trim();
    const englishKey = sanitizeEnglishText(item.englishText);
    if (!hebrewKey || !englishKey || seenHebrew.has(hebrewKey) || seenEnglish.has(englishKey)) return;
    seenHebrew.add(hebrewKey);
    seenEnglish.add(englishKey);
    deduped.push(item);
  });

  if (deduped.length > runtime.constants.MATCH_MAX_PAIRS) {
    return deduped.slice(0, runtime.constants.MATCH_MAX_PAIRS);
  }
  return deduped;
};

verbMatch.refillVerbMatchColumns = verbMatch.refillVerbMatchColumns || function refillVerbMatchColumns() {
  const runtime = getRuntime();
  const shuffle = app.utils?.shuffle;
  const visibleRows = getHelpers().getVisibleVerbMatchRows?.() || runtime.constants.MATCH_VISIBLE_ROWS;

  while (runtime.state.match.leftCards.length < visibleRows && runtime.state.match.remainingPairs.length) {
    const pair = runtime.state.match.remainingPairs.shift();
    if (!pair) break;

    runtime.state.match.leftCards.push({
      id: `left-${runtime.state.match.nextCardId}`,
      pairId: pair.id,
      englishText: pair.englishText,
      incoming: true,
    });
    runtime.state.match.nextCardId += 1;

    runtime.state.match.rightCards.push({
      id: `right-${runtime.state.match.nextCardId}`,
      pairId: pair.id,
      hebrewPlain: pair.valuePlain,
      hebrewNiqqud: pair.valueNiqqud || pair.valuePlain,
      incoming: true,
    });
    runtime.state.match.nextCardId += 1;
  }

  runtime.state.match.rightCards = typeof shuffle === "function" ? shuffle(runtime.state.match.rightCards) : runtime.state.match.rightCards;
};

verbMatch.renderVerbMatchIdleState = verbMatch.renderVerbMatchIdleState || function renderVerbMatchIdleState() {
  const runtime = getRuntime();
  const h = getHelpers();
  runtime.state.mode = "verbMatch";
  h.setGamePickerVisibility?.(false);
  h.setPromptCardVisibility?.(true);
  runtime.el.choiceContainer.classList.remove("summary-grid");
  h.renderSessionHeader?.();
  app.ui?.renderPromptLabel?.("", false);
  runtime.el.promptText.classList.remove("hebrew");
  runtime.el.promptText.textContent = translate("prompt.verbMatchStart");
  runtime.el.choiceContainer.innerHTML = "";
  runtime.el.choiceContainer.classList.remove("match-grid");
  h.renderNiqqudToggle?.();
  app.ui?.renderPromptSpeechButton?.();
};

verbMatch.renderVerbMatchRound = verbMatch.renderVerbMatchRound || function renderVerbMatchRound() {
  const runtime = getRuntime();
  const h = getHelpers();
  if (!runtime.state.match.active || !runtime.state.match.currentVerb) {
    verbMatch.renderVerbMatchIdleState();
    return;
  }

  h.setGamePickerVisibility?.(false);
  h.setPromptCardVisibility?.(true);
  runtime.el.choiceContainer.classList.remove("summary-grid");
  h.renderSessionHeader?.();
  app.ui?.renderPromptLabel?.("", false);
  h.renderPromptText?.();
  verbMatch.renderVerbMatchCards();
};

verbMatch.renderVerbMatchPrompt = verbMatch.renderVerbMatchPrompt || function renderVerbMatchPrompt() {
  const runtime = getRuntime();
  const h = getHelpers();
  if (!runtime.state.match.active || !runtime.state.match.currentVerb) {
    runtime.el.promptText.classList.remove("hebrew");
    runtime.el.promptText.textContent = translate("prompt.verbMatchStart");
    h.renderNiqqudToggle?.();
    return;
  }

  const current = runtime.state.match.currentVerb.word;
  const heText = runtime.state.showNiqqudInline ? current.heNiqqud : current.he;
  runtime.el.promptText.classList.remove("hebrew");
  runtime.el.promptText.textContent = `${current.en} | ${heText}`;
  h.renderNiqqudToggle?.();
};

verbMatch.renderVerbMatchCards = verbMatch.renderVerbMatchCards || function renderVerbMatchCards() {
  const runtime = getRuntime();
  runtime.el.choiceContainer.innerHTML = "";
  runtime.el.choiceContainer.classList.add("match-grid");
  const leftSelected = runtime.state.match.selectedLeftId;
  const rightSelected = runtime.state.match.selectedRightId;
  const mismatchSet = new Set(runtime.state.match.mismatchedCardIds);
  const matchedSet = new Set(runtime.state.match.matchedCardIds);

  const wrap = global.document.createElement("div");
  wrap.className = "match-columns";
  wrap.setAttribute("dir", "ltr");

  const leftCol = global.document.createElement("section");
  leftCol.className = "match-col";
  const leftStack = global.document.createElement("div");
  leftStack.className = "match-stack";

  runtime.state.match.leftCards.forEach((card, idx) => {
    const btn = global.document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn match-card";
    btn.textContent = card.englishText;
    btn.classList.toggle("selected", leftSelected === card.id);
    btn.classList.toggle("matched", matchedSet.has(card.id));
    btn.classList.toggle("mismatch", mismatchSet.has(card.id));
    btn.classList.toggle("incoming", Boolean(card.incoming));
    if (card.incoming) {
      btn.style.animationDelay = `${idx * 40}ms`;
    }
    btn.addEventListener("click", () => verbMatch.handleVerbMatchLeft(card.id));
    leftStack.append(btn);
    card.incoming = false;
  });

  leftCol.append(leftStack);

  const rightCol = global.document.createElement("section");
  rightCol.className = "match-col";
  const rightStack = global.document.createElement("div");
  rightStack.className = "match-stack";

  runtime.state.match.rightCards.forEach((card, idx) => {
    const btn = global.document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn match-card hebrew";
    btn.textContent = runtime.state.showNiqqudInline ? card.hebrewNiqqud : card.hebrewPlain;
    btn.classList.toggle("selected", rightSelected === card.id);
    btn.classList.toggle("matched", matchedSet.has(card.id));
    btn.classList.toggle("mismatch", mismatchSet.has(card.id));
    btn.classList.toggle("incoming", Boolean(card.incoming));
    if (card.incoming) {
      btn.style.animationDelay = `${idx * 40 + 30}ms`;
    }
    btn.addEventListener("click", () => verbMatch.handleVerbMatchRight(card.id));
    rightStack.append(btn);
    card.incoming = false;
  });

  rightCol.append(rightStack);
  wrap.append(leftCol, rightCol);
  runtime.el.choiceContainer.append(wrap);
};

verbMatch.handleVerbMatchLeft = verbMatch.handleVerbMatchLeft || function handleVerbMatchLeft(cardId) {
  const runtime = getRuntime();
  if (!runtime.state.match.active || !runtime.state.match.currentVerb || runtime.state.match.isResolving) return;
  const card = runtime.state.match.leftCards.find((item) => item.id === cardId);
  if (!card) return;

  runtime.state.match.selectedLeftId = runtime.state.match.selectedLeftId === cardId ? null : cardId;
  verbMatch.resolveVerbMatchSelection();
  verbMatch.renderVerbMatchRound();
};

verbMatch.handleVerbMatchRight = verbMatch.handleVerbMatchRight || function handleVerbMatchRight(cardId) {
  const runtime = getRuntime();
  if (!runtime.state.match.active || !runtime.state.match.currentVerb || runtime.state.match.isResolving) return;
  const card = runtime.state.match.rightCards.find((item) => item.id === cardId);
  if (!card) return;

  const shouldSpeak = !runtime.state.match.selectedLeftId && runtime.state.match.selectedRightId !== cardId;
  runtime.state.match.selectedRightId = runtime.state.match.selectedRightId === cardId ? null : cardId;
  if (shouldSpeak && runtime.state.match.selectedRightId === cardId) {
    app.speech?.speak?.(verbMatch.getVerbMatchCardSpeechPayload(card));
  }
  verbMatch.resolveVerbMatchSelection();
  verbMatch.renderVerbMatchRound();
};

verbMatch.resolveVerbMatchSelection = verbMatch.resolveVerbMatchSelection || function resolveVerbMatchSelection() {
  const runtime = getRuntime();
  if (!runtime.state.match.selectedLeftId || !runtime.state.match.selectedRightId) return;

  const leftCard = runtime.state.match.leftCards.find((item) => item.id === runtime.state.match.selectedLeftId);
  const rightCard = runtime.state.match.rightCards.find((item) => item.id === runtime.state.match.selectedRightId);
  if (!leftCard || !rightCard) {
    runtime.state.match.selectedLeftId = null;
    runtime.state.match.selectedRightId = null;
    return;
  }

  if (leftCard.pairId === rightCard.pairId) {
    verbMatch.applyVerbMatchSuccess(leftCard, rightCard);
    return;
  }

  verbMatch.applyVerbMatchMismatch(leftCard, rightCard);
};

verbMatch.applyVerbMatchSuccess = verbMatch.applyVerbMatchSuccess || function applyVerbMatchSuccess(leftCard, rightCard) {
  const runtime = getRuntime();
  const h = getHelpers();
  const data = getData();
  const currentWordId = runtime.state.match.currentVerb?.word?.id || "";
  app.speech?.cancel?.();
  runtime.state.match.isResolving = true;
  runtime.state.match.matchedCardIds = [leftCard.id, rightCard.id];
  runtime.state.match.selectedLeftId = null;
  runtime.state.match.selectedRightId = null;
  runtime.state.match.combo += 1;
  runtime.state.match.bestCombo = Math.max(runtime.state.match.bestCombo, runtime.state.match.combo);
  runtime.state.sessionStreak += 1;
  runtime.state.sessionScore += 1;
  runtime.state.match.sessionMatched += 1;
  h.playAnswerFeedbackSound?.(true);
  data.updateConjugationProgress?.(currentWordId, true);
  h.renderDomainPerformance?.();

  if (!runtime.state.match.matchedPairIds.includes(leftCard.pairId)) {
    runtime.state.match.matchedPairIds.push(leftCard.pairId);
  }
  runtime.state.match.matchedCount = runtime.state.match.matchedPairIds.length;
  verbMatch.renderVerbMatchRound();

  runtime.global.setTimeout(() => {
    if (!runtime.state.match.active) return;
    runtime.state.match.leftCards = runtime.state.match.leftCards.filter((item) => item.id !== leftCard.id);
    runtime.state.match.rightCards = runtime.state.match.rightCards.filter((item) => item.id !== rightCard.id);
    runtime.state.match.matchedCardIds = [];
    verbMatch.refillVerbMatchColumns();
    runtime.state.match.isResolving = false;

    if (runtime.state.match.matchedCount >= runtime.state.match.totalPairs) {
      const current = runtime.state.match.currentVerb.word;
      const streakCount = data.recordConjugationRound?.(current.id, !runtime.state.match.currentVerbHadMismatch) || 0;
      const reachedMasterThreshold = streakCount >= runtime.constants.CONJUGATION_MASTER_STREAK && !data.isWordMastered?.(current.id);
      runtime.state.match.eligibleMasterWordId = reachedMasterThreshold ? current.id : "";
      const hasMoreVerbs = runtime.state.match.verbQueue.length > 0;
      if (hasMoreVerbs) {
        h.setFeedback?.(translate("feedback.matchDoneVerb", { verb: current.en }), true);
      } else {
        verbMatch.finishVerbMatchSession();
        return;
      }
    }
    verbMatch.renderVerbMatchRound();
  }, 180);
};

verbMatch.applyVerbMatchMismatch = verbMatch.applyVerbMatchMismatch || function applyVerbMatchMismatch(leftCard, rightCard) {
  const runtime = getRuntime();
  const h = getHelpers();
  const data = getData();
  const currentWordId = runtime.state.match.currentVerb?.word?.id || "";
  app.speech?.cancel?.();
  runtime.state.match.isResolving = true;
  runtime.state.match.combo = 0;
  runtime.state.sessionStreak = 0;
  runtime.state.match.currentVerbHadMismatch = true;
  runtime.state.match.mismatchCount += 1;
  if (currentWordId && !runtime.state.match.sessionMistakeIds.includes(currentWordId)) {
    runtime.state.match.sessionMistakeIds.push(currentWordId);
  }
  runtime.state.match.mismatchedCardIds = [leftCard.id, rightCard.id];
  runtime.state.match.selectedLeftId = null;
  runtime.state.match.selectedRightId = null;
  h.playAnswerFeedbackSound?.(false);
  data.updateConjugationProgress?.(currentWordId, false);
  h.renderDomainPerformance?.();
  verbMatch.renderVerbMatchRound();

  runtime.global.setTimeout(() => {
    if (!runtime.state.match.active) return;
    runtime.state.match.mismatchedCardIds = [];
    runtime.state.match.isResolving = false;
    verbMatch.renderVerbMatchRound();
  }, 300);
};
})(typeof window !== "undefined" ? window : globalThis);
