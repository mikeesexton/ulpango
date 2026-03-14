(function initIvriQuestAppAbbreviation(global) {
"use strict";

const app = global.IvriQuestApp = global.IvriQuestApp || {};
const abbreviation = app.abbreviation = app.abbreviation || {};

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

abbreviation.getExpansionText = abbreviation.getExpansionText || function getExpansionText(entry, withNiqqud = false) {
  const plain = String(entry?.expansionHe || entry?.expansion_he || "").trim();
  const marked = String(entry?.expansionHeNiqqud || entry?.expansion_he_niqqud || "").trim();
  return withNiqqud && marked ? marked : plain;
};

abbreviation.getAbbreviationRoundTarget = abbreviation.getAbbreviationRoundTarget || function getAbbreviationRoundTarget() {
  const runtime = getRuntime();
  if (!runtime.abbreviationDeck?.length) return 0;
  return Math.min(runtime.constants.ABBREVIATION_ROUNDS, runtime.abbreviationDeck.length);
};

abbreviation.cloneAbbreviationQuestionSnapshot = abbreviation.cloneAbbreviationQuestionSnapshot || function cloneAbbreviationQuestionSnapshot(question) {
  return {
    ...question,
    entry: question.entry ? { ...question.entry } : null,
    options: question.options.map((option) => ({
      ...option,
      entry: option.entry ? { ...option.entry } : null,
    })),
    locked: question.locked !== undefined ? Boolean(question.locked) : true,
    selectedOptionId: question.selectedOptionId ?? null,
  };
};

abbreviation.prepareAbbreviationDeck = abbreviation.prepareAbbreviationDeck || function prepareAbbreviationDeck(entries) {
  const source = Array.isArray(entries) ? entries : [];
  const seenIds = new Set();
  const cleaned = [];

  source.forEach((entry, index) => {
    const abbr = String(entry?.abbr || "").trim();
    const expansionHe = String(entry?.expansionHe || entry?.expansion_he || "").trim();
    const expansionHeNiqqud = String(entry?.expansionHeNiqqud || entry?.expansion_he_niqqud || "").trim();
    const english = String(entry?.english || "").trim();
    if (!abbr || !expansionHe || !english) return;

    let idBase = String(entry?.id || `abbr-${index + 1}`).trim();
    if (!idBase) {
      idBase = `abbr-${index + 1}`;
    }

    let id = idBase;
    let suffix = 2;
    while (seenIds.has(id)) {
      id = `${idBase}-${suffix}`;
      suffix += 1;
    }
    seenIds.add(id);

    cleaned.push({
      id,
      abbr,
      expansionHe,
      expansionHeNiqqud,
      english,
      bucket: String(entry?.bucket || "").trim(),
      notes: String(entry?.notes || "").trim(),
      source: String(entry?.source || "abbreviation"),
      availability: {
        abbreviationQuiz: entry?.availability?.abbreviationQuiz !== false,
      },
    });
  });

  return cleaned.filter((entry) => entry.availability?.abbreviationQuiz !== false);
};

abbreviation.renderAbbreviationIdleState = abbreviation.renderAbbreviationIdleState || function renderAbbreviationIdleState() {
  const runtime = getRuntime();
  const h = getHelpers();
  runtime.state.mode = "abbreviation";
  h.setGamePickerVisibility?.(false);
  h.setPromptCardVisibility?.(true);
  runtime.el.choiceContainer.classList.remove("summary-grid");
  h.renderSessionHeader?.();
  runtime.el.promptLabel.textContent = translate("prompt.abbreviation");
  runtime.el.promptText.classList.remove("hebrew");
  runtime.el.promptText.textContent = translate("prompt.abbreviationStart");
  runtime.el.choiceContainer.innerHTML = "";
  runtime.el.choiceContainer.classList.remove("match-grid");
  h.renderNiqqudToggle?.();
};

abbreviation.startAbbreviation = abbreviation.startAbbreviation || function startAbbreviation() {
  const runtime = getRuntime();
  const h = getHelpers();
  const s = getSession();
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
  h.resetSessionCounters?.();
  h.resetVerbMatchState?.();
  abbreviation.resetAbbreviationState();
  runtime.state.mode = "abbreviation";
  runtime.state.route = "home";
  runtime.state.lastPlayedMode = "abbreviation";
  h.setGamePickerVisibility?.(false);
  runtime.el.choiceContainer.innerHTML = "";
  runtime.el.choiceContainer.classList.remove("match-grid");
  h.clearFeedback?.();

  if (!runtime.abbreviationDeck?.length) {
    runtime.state.abbreviation.active = false;
    abbreviation.renderAbbreviationIdleState();
    runtime.el.promptLabel.textContent = translate("prompt.noAbbreviationTitle");
    runtime.el.promptText.classList.remove("hebrew");
    runtime.el.promptText.textContent = translate("prompt.noAbbreviationBody");
    h.setFeedback?.(translate("prompt.noAbbreviationTitle"), false);
    return;
  }

  runtime.state.abbreviation.active = true;
  abbreviation.playAbbreviationIntro();
  h.renderAll?.();
};

abbreviation.resetAbbreviationState = abbreviation.resetAbbreviationState || function resetAbbreviationState() {
  const runtime = getRuntime();
  getSession().stopAbbreviationTimer?.();
  runtime.state.abbreviation.active = false;
  runtime.state.abbreviation.currentRound = 0;
  runtime.state.abbreviation.startMs = 0;
  runtime.state.abbreviation.elapsedSeconds = 0;
  runtime.state.abbreviation.timerId = null;
  runtime.state.abbreviation.askedEntryIds = [];
  runtime.state.abbreviation.introActive = false;
  runtime.state.abbreviation.currentQuestion = null;
  runtime.state.abbreviation.wrongAnswers = 0;
  runtime.state.abbreviation.sessionMistakeIds = [];
};

abbreviation.playAbbreviationIntro = abbreviation.playAbbreviationIntro || function playAbbreviationIntro() {
  const runtime = getRuntime();
  const session = getSession();
  if (!runtime.el.abbreviationIntro) {
    abbreviation.beginAbbreviationFromIntro();
    return;
  }

  session.clearAbbreviationIntro?.();
  runtime.state.abbreviation.introActive = true;
  getHelpers().showBlockingOverlay?.(runtime.el.abbreviationIntro);
  session.scheduleIntroAutoAdvance?.(() => abbreviation.beginAbbreviationFromIntro());
};

abbreviation.beginAbbreviationFromIntro = abbreviation.beginAbbreviationFromIntro || function beginAbbreviationFromIntro() {
  const runtime = getRuntime();
  const session = getSession();
  if (!runtime.state.abbreviation.active) return;
  if (!runtime.state.abbreviation.introActive && runtime.state.abbreviation.currentQuestion) return;
  if (runtime.state.abbreviation.introActive) {
    session.clearAbbreviationIntro?.();
  }

  if (!runtime.state.abbreviation.startMs) {
    runtime.state.abbreviation.startMs = Date.now();
    runtime.state.abbreviation.elapsedSeconds = 0;
    session.startAbbreviationTimer?.();
  }
  abbreviation.nextAbbreviationQuestion();
};

abbreviation.nextAbbreviationQuestion = abbreviation.nextAbbreviationQuestion || function nextAbbreviationQuestion() {
  const runtime = getRuntime();
  const session = getSession();
  if (runtime.state.mode !== "abbreviation") return;
  if (!runtime.state.abbreviation.active) {
    session.goHome?.();
    return;
  }
  if (runtime.state.abbreviation.introActive) return;

  const targetRounds = abbreviation.getAbbreviationRoundTarget();
  if (!targetRounds) {
    session.finishAbbreviation?.();
    return;
  }

  if (runtime.state.abbreviation.currentRound >= targetRounds) {
    session.finishAbbreviation?.();
    return;
  }

  const question = abbreviation.buildAbbreviationQuestion(runtime.abbreviationDeck);
  if (!question) {
    session.finishAbbreviation?.();
    return;
  }

  runtime.state.abbreviation.currentRound += 1;
  runtime.state.abbreviation.currentQuestion = {
    ...question,
    locked: false,
    selectedOptionId: null,
  };
  getHelpers().clearFeedback?.();
  abbreviation.renderAbbreviationQuestion();
};

abbreviation.renderAbbreviationQuestion = abbreviation.renderAbbreviationQuestion || function renderAbbreviationQuestion() {
  const runtime = getRuntime();
  const h = getHelpers();
  const question = runtime.state.abbreviation.currentQuestion;
  h.setGamePickerVisibility?.(false);
  h.setPromptCardVisibility?.(true);
  runtime.el.choiceContainer.classList.remove("summary-grid");
  h.renderSessionHeader?.();
  runtime.el.choiceContainer.classList.remove("match-grid");

  if (!question) return;

  runtime.el.promptLabel.textContent = question.promptLabel;
  if (question.promptIsHebrew) {
    runtime.el.promptText.classList.add("hebrew");
    runtime.el.promptText.classList.remove("english-prompt");
  } else {
    runtime.el.promptText.classList.remove("hebrew");
    runtime.el.promptText.classList.add("english-prompt");
  }
  runtime.el.promptText.textContent = question.prompt;
  abbreviation.renderAbbreviationChoices(question);
  h.renderNiqqudToggle?.();
};

abbreviation.renderAbbreviationChoices = abbreviation.renderAbbreviationChoices || function renderAbbreviationChoices(question) {
  const runtime = getRuntime();
  runtime.el.choiceContainer.innerHTML = "";
  const choicesAreHebrew = question.direction === "en2he";

  question.options.forEach((option) => {
    const btn = global.document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn";
    if (choicesAreHebrew) {
      btn.classList.add("hebrew");
      btn.dir = "rtl";
      btn.setAttribute("lang", "he");
    }
    btn.textContent = option.label;
    btn.addEventListener("click", () => {
      if (question.locked) return;
      question.selectedOptionId = option.id;
      runtime.el.choiceContainer.querySelectorAll(".choice-btn").forEach((button, index) => {
        button.classList.toggle("selected", question.options[index]?.id === option.id);
      });
      getHelpers().renderSessionHeader?.();
    });
    btn.classList.toggle("selected", question.selectedOptionId === option.id && !question.locked);
    runtime.el.choiceContainer.append(btn);
  });

  if (question.locked) {
    abbreviation.markAbbreviationChoiceResults(question);
  }
};

abbreviation.applyAbbreviationAnswer = abbreviation.applyAbbreviationAnswer || function applyAbbreviationAnswer(isCorrect, selectedId = null) {
  const runtime = getRuntime();
  const h = getHelpers();
  const data = getData();
  const question = runtime.state.abbreviation.currentQuestion;
  if (!question || question.locked) return;

  question.locked = true;
  const entry = question.entry;

  data.updateProgress?.(entry.id, isCorrect);
  runtime.state.sessionStreak = isCorrect ? runtime.state.sessionStreak + 1 : 0;
  if (isCorrect) {
    runtime.state.sessionScore += 1;
  } else {
    runtime.state.abbreviation.wrongAnswers += 1;
    if (!runtime.state.abbreviation.sessionMistakeIds.includes(entry.id)) {
      runtime.state.abbreviation.sessionMistakeIds.push(entry.id);
    }
  }

  const expansionText = abbreviation.getExpansionText(entry, runtime.state.showNiqqudInline);
  const expansion = `${expansionText} (${entry.abbr})`;
  h.setFeedback?.(
    isCorrect
      ? translate("feedback.abbreviationCorrect", { english: entry.english, expansion })
      : translate("feedback.abbreviationWrong", { english: entry.english, expansion }),
    isCorrect
  );
  h.playAnswerFeedbackSound?.(isCorrect);

  question.selectedOptionId = selectedId ?? null;
  abbreviation.markAbbreviationChoiceResults(question);

  app.persistence?.saveProgress?.();
  h.renderSessionHeader?.();
  h.renderDomainPerformance?.();
  h.renderMostMissed?.();
};

abbreviation.markAbbreviationChoiceResults = abbreviation.markAbbreviationChoiceResults || function markAbbreviationChoiceResults(question = getRuntime().state.abbreviation.currentQuestion) {
  const runtime = getRuntime();
  if (!question) return;
  const buttons = Array.from(runtime.el.choiceContainer.querySelectorAll("button"));
  const correctId = question.entry.id;
  const selectedId = question.selectedOptionId ?? null;

  buttons.forEach((button, index) => {
    const option = question.options[index];
    if (!option) return;

    if (option.id === correctId) {
      button.classList.add("correct");
    } else if (option.id === selectedId) {
      button.classList.add("wrong");
    }
    button.disabled = true;
  });
};

abbreviation.buildAbbreviationQuestion = abbreviation.buildAbbreviationQuestion || function buildAbbreviationQuestion(pool) {
  const runtime = getRuntime();
  const entry = abbreviation.pickBestAbbreviationEntry(pool, runtime.state.abbreviation.askedEntryIds);
  if (!entry) return null;

  runtime.state.abbreviation.askedEntryIds.push(entry.id);
  const direction = Math.random() < 0.5 ? "he2en" : "en2he";
  const options = abbreviation.buildAbbreviationOptions(pool, entry, direction);

  return {
    promptLabel: translate("prompt.abbreviation"),
    prompt: direction === "he2en" ? entry.abbr : entry.english,
    promptIsHebrew: direction === "he2en",
    direction,
    entry,
    options,
  };
};

abbreviation.buildAbbreviationOptions = abbreviation.buildAbbreviationOptions || function buildAbbreviationOptions(pool, entry, direction) {
  const shuffle = app.utils?.shuffle;
  const sameBucketCandidates = pool.filter((item) => item.id !== entry.id && item.bucket === entry.bucket);
  const distractors = typeof shuffle === "function" ? shuffle(sameBucketCandidates).slice(0, 3) : sameBucketCandidates.slice(0, 3);

  if (distractors.length < 3) {
    const fillerPool = pool.filter((item) => item.id !== entry.id && !distractors.includes(item));
    const filler = typeof shuffle === "function" ? shuffle(fillerPool).slice(0, 3 - distractors.length) : fillerPool.slice(0, 3 - distractors.length);
    distractors.push(...filler);
  }

  const isHe2En = direction === "he2en";
  const options = [entry, ...distractors].slice(0, 4).map((item) => ({
    id: item.id,
    label: isHe2En ? item.english : item.abbr,
    entry: item,
  }));

  return typeof shuffle === "function" ? shuffle(options) : options;
};

abbreviation.pickBestAbbreviationEntry = abbreviation.pickBestAbbreviationEntry || function pickBestAbbreviationEntry(pool, usedEntryIds = []) {
  const weightedRandomWord = app.utils?.weightedRandomWord;
  const data = getData();
  const runtime = getRuntime();
  const now = Date.now();
  const freshPool = usedEntryIds.length < pool.length ? pool.filter((entry) => !usedEntryIds.includes(entry.id)) : pool;
  const due = abbreviation.getDueAbbreviationEntries(freshPool, now);
  const set = due.length ? due : freshPool;
  const maxLevel = runtime.constants.LEITNER_INTERVALS.length - 1;

  const weighted = set.map((entry) => {
    const rec = data.getProgressRecord?.(entry.id) || { attempts: 0, correct: 0, nextDue: 0, level: 0 };
    const accuracy = rec.attempts ? rec.correct / rec.attempts : 0;
    const overdueMs = rec.attempts ? Math.max(0, now - rec.nextDue) : 0;
    const overdueHours = overdueMs / (60 * 60 * 1000);

    const newEntryBoost = rec.attempts === 0 ? 1.35 : 1;
    const dueBoost = rec.attempts > 0 && rec.nextDue <= now ? 1 + Math.min(1.2, overdueHours / 12) : 1;
    const weaknessBoost = 1 + (1 - accuracy) * 0.85;
    const levelBoost = 1 + ((maxLevel - rec.level) / maxLevel) * 0.35;
    const jitter = 0.7 + Math.random() * 0.8;

    return {
      word: entry,
      weight: newEntryBoost * dueBoost * weaknessBoost * levelBoost * jitter,
    };
  });

  return typeof weightedRandomWord === "function" ? weightedRandomWord(weighted) : null;
};

abbreviation.getDueAbbreviationEntries = abbreviation.getDueAbbreviationEntries || function getDueAbbreviationEntries(pool, now = Date.now()) {
  const data = getData();
  return pool.filter((entry) => {
    const rec = data.getProgressRecord?.(entry.id) || { attempts: 0, nextDue: 0 };
    return rec.attempts === 0 || rec.nextDue <= now;
  });
};
})(typeof window !== "undefined" ? window : globalThis);
