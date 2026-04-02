(function initIvriQuestAppLesson(global) {
"use strict";

const app = global.IvriQuestApp = global.IvriQuestApp || {};
const lessonMode = app.lessonMode = app.lessonMode || {};

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

function getLessonOptionDisplayKey(word, optionLanguage) {
  if (optionLanguage === "english") {
    return app.utils?.sanitizeEnglishDisplayText
      ? app.utils.sanitizeEnglishDisplayText(word?.en)
      : String(word?.en || "").trim();
  }
  return String(word?.he || "").trim();
}

function slugSyntheticLessonOptionPart(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05ff]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80) || "option";
}

function buildSyntheticLessonOptionWord(baseWord, label, optionLanguage) {
  const cleanLabel = String(label || "").trim();
  if (!cleanLabel) return null;
  const syntheticId = `${String(baseWord?.id || "lesson")}-${optionLanguage}-${slugSyntheticLessonOptionPart(cleanLabel)}`;

  return optionLanguage === "english"
    ? {
        id: syntheticId,
        category: baseWord?.category || "",
        en: cleanLabel,
        he: "",
        heNiqqud: "",
        utility: 0,
        source: "synthetic-distractor",
      }
    : {
        id: syntheticId,
        category: baseWord?.category || "",
        en: "",
        he: cleanLabel,
        heNiqqud: cleanLabel,
        utility: 0,
        source: "synthetic-distractor",
      };
}

function getLessonCustomDistractorWords(word, optionLanguage) {
  const distractors = word?.translationQuizDistractors;
  if (!distractors) return [];
  const labels = optionLanguage === "english" ? distractors.english : distractors.hebrew;
  return (Array.isArray(labels) ? labels : [])
    .map((label) => buildSyntheticLessonOptionWord(word, label, optionLanguage))
    .filter(Boolean);
}

function translate(key, vars = {}) {
  return getHelpers().t ? getHelpers().t(key, vars) : key;
}

lessonMode.getLessonPromptSpeechPayload = lessonMode.getLessonPromptSpeechPayload || function getLessonPromptSpeechPayload(question = getRuntime().state.currentQuestion) {
  if (!question?.promptIsHebrew) return null;
  if (question.word && question.promptUsesWordSurface !== false) {
    return app.speech?.buildSpeechPayload?.({
      plain: question.word.he,
      niqqud: question.word.heNiqqud,
      speechOverridePlain: question.word.speechHe,
      speechOverrideNiqqud: question.word.speechHeNiqqud,
      source: "prompt",
    }) || null;
  }

  return app.speech?.buildSpeechPayload?.({
    plain: question.prompt,
    niqqud: question.promptNiqqud,
    source: "prompt",
  }) || null;
};

lessonMode.getLessonSelectionSpeechPayload = lessonMode.getLessonSelectionSpeechPayload || function getLessonSelectionSpeechPayload(question, option) {
  if (!question?.optionsAreHebrew || !option?.word) return null;
  return app.speech?.buildSpeechPayload?.({
    plain: option.word.he,
    niqqud: option.word.heNiqqud,
    speechOverridePlain: option.word.speechHe,
    speechOverrideNiqqud: option.word.speechHeNiqqud,
    source: "answer",
  }) || null;
};

lessonMode.startLesson = lessonMode.startLesson || function startLesson() {
  const runtime = getRuntime();
  const h = getHelpers();
  const session = getSession();

  app.speech?.cancel?.();
  session.stopVerbMatchTimer?.();
  session.stopLessonTimer?.();
  session.stopAbbreviationTimer?.();
  session.closeLeaveSessionConfirm?.();
  h.closeMasteredModal?.();
  h.resetVerbMatchState?.();
  h.resetAbbreviationState?.();
  runtime.state.mode = "lesson";
  runtime.state.route = "home";
  runtime.state.lastPlayedMode = "lesson";
  session.clearSummaryState?.();
  session.clearLessonStartIntro?.();
  session.clearSecondChanceIntro?.();
  session.clearVerbMatchIntro?.();
  session.clearAbbreviationIntro?.();
  h.resetSessionScore?.();
  runtime.state.lesson.active = true;
  runtime.state.lesson.inReview = false;
  runtime.state.lesson.reviewQueue = [];
  runtime.state.lesson.missedWordIds = [];
  runtime.state.lesson.optionHistory = {};
  runtime.state.lesson.currentRound = 0;
  runtime.state.lesson.secondChanceCurrent = 0;
  runtime.state.lesson.secondChanceTotal = 0;
  runtime.state.lesson.wrongAnswers = 0;
  runtime.state.lesson.sessionMistakeIds = [];
  runtime.state.lesson.startMs = 0;
  runtime.state.lesson.elapsedSeconds = 0;
  runtime.state.lesson.askedWordIds = [];
  runtime.state.lesson.domainCounts = {};
  runtime.state.currentQuestion = null;
  runtime.el.choiceContainer.innerHTML = "";
  runtime.el.choiceContainer.classList.remove("match-grid");
  h.clearFeedback?.();
  lessonMode.playLessonStartIntro();
  h.renderAll?.();
};

lessonMode.playLessonStartIntro = lessonMode.playLessonStartIntro || function playLessonStartIntro() {
  const runtime = getRuntime();
  const session = getSession();
  const h = getHelpers();
  if (!runtime.el.lessonStartIntro) {
    lessonMode.beginLessonFromIntro();
    return;
  }

  session.clearLessonStartIntro?.();
  runtime.state.lesson.lessonStartIntroActive = true;
  h.showBlockingOverlay?.(runtime.el.lessonStartIntro);
  session.scheduleIntroAutoAdvance?.(() => lessonMode.beginLessonFromIntro());
};

lessonMode.beginLessonFromIntro = lessonMode.beginLessonFromIntro || function beginLessonFromIntro() {
  const runtime = getRuntime();
  const session = getSession();
  if (!runtime.state.lesson.active) return;
  if (!runtime.state.lesson.lessonStartIntroActive && runtime.state.currentQuestion) return;
  if (runtime.state.lesson.lessonStartIntroActive) {
    session.clearLessonStartIntro?.();
  }
  if (!runtime.state.lesson.startMs) {
    runtime.state.lesson.startMs = Date.now();
    runtime.state.lesson.elapsedSeconds = 0;
    session.startLessonTimer?.();
  }
  lessonMode.nextQuestion();
};

lessonMode.playSecondChanceIntro = lessonMode.playSecondChanceIntro || function playSecondChanceIntro() {
  const runtime = getRuntime();
  const session = getSession();
  const h = getHelpers();
  if (!runtime.el.secondChanceIntro) {
    lessonMode.nextQuestion();
    return;
  }

  session.clearSecondChanceIntro?.();
  runtime.state.lesson.secondChanceIntroActive = true;
  h.showBlockingOverlay?.(runtime.el.secondChanceIntro);
  session.scheduleIntroAutoAdvance?.(() => lessonMode.beginSecondChanceFromIntro());
};

lessonMode.beginSecondChanceFromIntro = lessonMode.beginSecondChanceFromIntro || function beginSecondChanceFromIntro() {
  const runtime = getRuntime();
  const session = getSession();
  if (!runtime.state.lesson.active || !runtime.state.lesson.secondChanceIntroActive) return;
  session.clearSecondChanceIntro?.();
  lessonMode.nextQuestion();
};

lessonMode.nextQuestion = lessonMode.nextQuestion || function nextQuestion() {
  const runtime = getRuntime();
  const h = getHelpers();
  const data = getData();
  const session = getSession();

  if (runtime.state.mode !== "lesson") return;
  if (!runtime.state.lesson.active) {
    session.goHome?.();
    return;
  }
  if (runtime.state.lesson.lessonStartIntroActive) return;
  if (runtime.state.lesson.secondChanceIntroActive) return;

  const pool = data.getSelectedPool?.() || [];
  if (!pool.length) {
    session.stopLessonTimer?.();
    runtime.state.lesson.active = false;
    runtime.state.currentQuestion = null;
    const hasMastered = (data.getMasteredWords?.() || []).length > 0;
    app.ui?.renderPromptLabel?.(hasMastered ? translate("prompt.masteredOnlyTitle") : translate("prompt.noVocabTitle"), true);
    runtime.el.promptText.classList.remove("hebrew");
    runtime.el.promptText.classList.add("english-prompt");
    runtime.el.promptText.textContent = hasMastered ? translate("prompt.masteredOnlyBody") : translate("prompt.noVocabBody");
    runtime.el.choiceContainer.innerHTML = "";
    h.renderNiqqudToggle?.();
    return;
  }

  if (!runtime.state.lesson.inReview && runtime.state.lesson.currentRound >= runtime.constants.LESSON_ROUNDS) {
    if (!lessonMode.tryStartReviewPhase(pool)) {
      session.finishLesson?.();
      return;
    }
    runtime.state.currentQuestion = null;
    h.renderSessionHeader?.();
    lessonMode.playSecondChanceIntro();
    return;
  }

  if (runtime.state.lesson.inReview && runtime.state.lesson.secondChanceCurrent >= runtime.state.lesson.secondChanceTotal) {
    session.finishLesson?.();
    return;
  }

  const question = runtime.state.lesson.inReview
    ? lessonMode.buildReviewQuestion(pool)
    : lessonMode.buildQuestion(pool);
  if (!question) {
    runtime.state.lesson.active = false;
    session.finishLesson?.();
    return;
  }

  lessonMode.rememberOptionHistory(question);
  if (runtime.state.lesson.inReview) {
    runtime.state.lesson.secondChanceCurrent += 1;
  } else {
    runtime.state.lesson.currentRound += 1;
  }
  runtime.state.currentQuestion = { ...question, locked: false, selectedOptionId: null };
  h.clearFeedback?.();
  lessonMode.renderQuestion();
};

lessonMode.renderQuestion = lessonMode.renderQuestion || function renderQuestion() {
  const runtime = getRuntime();
  const h = getHelpers();
  const question = runtime.state.currentQuestion;

  h.setGamePickerVisibility?.(false);
  h.setPromptCardVisibility?.(true);
  runtime.el.choiceContainer.classList.remove("summary-grid");
  h.renderSessionHeader?.();
  runtime.el.choiceContainer.classList.remove("match-grid");

  if (!question) return;

  app.ui?.renderPromptLabel?.("", false);
  h.renderPromptText?.(question);
  lessonMode.renderChoices(question);
};

lessonMode.renderChoices = lessonMode.renderChoices || function renderChoices(question) {
  const runtime = getRuntime();
  const h = getHelpers();
  runtime.el.choiceContainer.innerHTML = "";

  question.options.forEach((option) => {
    const btn = global.document.createElement("button");
    btn.type = "button";
    btn.className = `choice-btn ${question.optionsAreHebrew ? "hebrew" : ""}`;
    btn.textContent = question.optionsAreHebrew
      ? h.getHebrewText?.(option.word, runtime.state.showNiqqudInline) || ""
      : option.word.en;

    btn.addEventListener("click", () => {
      if (question.locked) return;
      question.selectedOptionId = option.id;
      runtime.el.choiceContainer.querySelectorAll(".choice-btn").forEach((button, index) => {
        button.classList.toggle("selected", question.options[index]?.id === option.id);
      });
      h.renderSessionHeader?.();
      app.speech?.speak?.(lessonMode.getLessonSelectionSpeechPayload(question, option));
    });
    btn.classList.toggle("selected", question.selectedOptionId === option.id && !question.locked);

    runtime.el.choiceContainer.append(btn);
  });

  if (question.locked) {
    lessonMode.markChoiceResults(question);
  }
};

lessonMode.applyAnswer = lessonMode.applyAnswer || function applyAnswer(isCorrect, selectedId = null) {
  const runtime = getRuntime();
  const h = getHelpers();
  const data = getData();
  if (!runtime.state.currentQuestion || runtime.state.currentQuestion.locked) return;

  app.speech?.cancel?.();
  runtime.state.currentQuestion.locked = true;
  const word = runtime.state.currentQuestion.word;

  data.updateProgress?.(word.id, isCorrect, { mode: "translationQuiz" });
  runtime.state.sessionStreak = isCorrect ? runtime.state.sessionStreak + 1 : 0;

  if (isCorrect) {
    if (!runtime.state.currentQuestion.isReview) {
      runtime.state.sessionScore += 1;
    }
  } else {
    runtime.state.lesson.wrongAnswers += 1;
    if (!runtime.state.lesson.sessionMistakeIds.includes(word.id)) {
      runtime.state.lesson.sessionMistakeIds.push(word.id);
    }
  }

  if (!isCorrect && !runtime.state.currentQuestion.isReview) {
    lessonMode.addMissedWord(runtime.state.currentQuestion.word.id);
  }

  const hebrewDisplay = h.buildAnswerDisplay?.(word, runtime.state.showNiqqudInline) || "";
  const promptHebrew = h.getHebrewText?.(word, runtime.state.showNiqqudInline) || "";
  const question = runtime.state.currentQuestion;
  h.setFeedback?.(
    question.promptIsHebrew
      ? {
          tone: isCorrect ? "success" : "error",
          sentence: translate(
            isCorrect ? "feedback.translationCorrectToEnglish" : "feedback.translationWrongToEnglish",
            { hebrew: promptHebrew, english: word.en }
          ),
        }
      : {
          tone: isCorrect ? "success" : "error",
          sentence: translate(
            isCorrect ? "feedback.translationCorrectToHebrew" : "feedback.translationWrongToHebrew",
            { answer: hebrewDisplay }
          ),
        }
  );
  h.playAnswerFeedbackSound?.(isCorrect);

  runtime.state.currentQuestion.selectedOptionId = selectedId ?? null;
  lessonMode.markChoiceResults();

  app.persistence?.saveProgress?.();
  h.renderSessionHeader?.();
  h.renderDomainPerformance?.();
  h.renderMostMissed?.();
};

lessonMode.markChoiceResults = lessonMode.markChoiceResults || function markChoiceResults(question = getRuntime().state.currentQuestion) {
  const runtime = getRuntime();
  if (!question) return;
  const buttons = Array.from(runtime.el.choiceContainer.querySelectorAll("button"));
  const correctId = question.word.id;
  const selectedId = question.selectedOptionId ?? null;

  buttons.forEach((button, index) => {
    const option = question.options[index];

    if (option.id === correctId) {
      button.classList.add("correct");
    } else if (option.id === selectedId) {
      button.classList.add("wrong");
    }

    button.disabled = true;
  });
};

lessonMode.cloneLessonQuestionSnapshot = lessonMode.cloneLessonQuestionSnapshot || function cloneLessonQuestionSnapshot(question) {
  return {
    ...question,
    word: question.word ? { ...question.word } : null,
    options: question.options.map((option) => ({
      ...option,
      word: option.word ? { ...option.word } : null,
    })),
    locked: question.locked !== undefined ? Boolean(question.locked) : true,
    selectedOptionId: question.selectedOptionId ?? null,
  };
};

lessonMode.addMissedWord = lessonMode.addMissedWord || function addMissedWord(wordId) {
  const runtime = getRuntime();
  if (!wordId) return;
  if (!runtime.state.lesson.missedWordIds.includes(wordId)) {
    runtime.state.lesson.missedWordIds.push(wordId);
  }
};

lessonMode.buildQuestion = lessonMode.buildQuestion || function buildQuestion(pool) {
  const runtime = getRuntime();
  const data = getData();
  const mode = lessonMode.pickQuestionMode();
  const freshPool =
    runtime.state.lesson.askedWordIds.length < pool.length
      ? pool.filter((word) => !runtime.state.lesson.askedWordIds.includes(word.id))
      : pool;
  const targetDomainId = data.pickLeastSeenLessonDomainId?.(freshPool);
  const domainPool = targetDomainId
    ? freshPool.filter((word) => data.getDomainIdForWord?.(word) === targetDomainId)
    : freshPool;
  const word = data.pickBestWord?.(domainPool.length ? domainPool : freshPool, runtime.state.lesson.askedWordIds, {
    mode: "translationQuiz",
  });
  if (!word) return null;

  runtime.state.lesson.askedWordIds.push(word.id);
  const chosenDomainId = data.getDomainIdForWord?.(word);
  runtime.state.lesson.domainCounts[chosenDomainId] = (runtime.state.lesson.domainCounts[chosenDomainId] || 0) + 1;
  const options = lessonMode.buildOptions(pool, word, {
    optionLanguage: mode === "reverse" ? "english" : "hebrew",
  });

  if (mode === "reverse") {
    return {
      mode: "reverse",
      promptLabel: translate("prompt.toEnglish"),
      prompt: word.he,
      promptIsHebrew: true,
      options,
      optionsAreHebrew: false,
      word,
      isReview: false,
    };
  }

  return {
    mode: "forward",
    promptLabel: translate("prompt.toHebrew"),
    prompt: word.en,
    promptIsHebrew: false,
    options,
    optionsAreHebrew: true,
    word,
    isReview: false,
  };
};

lessonMode.buildReviewQuestion = lessonMode.buildReviewQuestion || function buildReviewQuestion(pool) {
  const runtime = getRuntime();
  while (runtime.state.lesson.reviewQueue.length) {
    const wordId = runtime.state.lesson.reviewQueue.shift();
    const word = pool.find((item) => item.id === wordId);
    if (!word) continue;

    const mode = lessonMode.pickQuestionMode();
    const forbiddenOptionIds = new Set((runtime.state.lesson.optionHistory[word.id] || []).filter((id) => id !== word.id));
    const options = lessonMode.buildOptions(pool, word, {
      forbiddenOptionIds,
      optionLanguage: mode === "reverse" ? "english" : "hebrew",
    });

    if (mode === "reverse") {
      return {
        mode: "reverse",
        promptLabel: translate("prompt.reviewToEnglish"),
        prompt: word.he,
        promptIsHebrew: true,
        options,
        optionsAreHebrew: false,
        word,
        isReview: true,
      };
    }

    return {
      mode: "forward",
      promptLabel: translate("prompt.reviewToHebrew"),
      prompt: word.en,
      promptIsHebrew: false,
      options,
      optionsAreHebrew: true,
      word,
      isReview: true,
    };
  }

  return null;
};

lessonMode.buildOptions = lessonMode.buildOptions || function buildOptions(pool, word, config = {}) {
  const shuffle = app.utils?.shuffle;
  const doShuffle = typeof shuffle === "function" ? shuffle : (items) => [...items];
  const forbiddenOptionIds = config.forbiddenOptionIds || new Set();
  const optionLanguage = config.optionLanguage === "english" ? "english" : "hebrew";
  const sameCategoryCandidates = pool.filter(
    (item) => item.id !== word.id && item.category === word.category && !forbiddenOptionIds.has(item.id)
  );
  const seenLabels = new Set();
  const options = [];

  function tryAddOption(item) {
    if (!item || forbiddenOptionIds.has(item.id)) return false;
    const labelKey = getLessonOptionDisplayKey(item, optionLanguage);
    if (!labelKey || seenLabels.has(labelKey)) return false;
    seenLabels.add(labelKey);
    options.push(item);
    return true;
  }

  tryAddOption(word);

  doShuffle(getLessonCustomDistractorWords(word, optionLanguage)).forEach((item) => {
    if (options.length >= 4) return;
    tryAddOption(item);
  });

  doShuffle(sameCategoryCandidates).forEach((item) => {
    if (options.length >= 4) return;
    tryAddOption(item);
  });

  if (options.length < 4) {
    doShuffle(
      pool.filter(
        (item) => item.id !== word.id && !options.includes(item) && !forbiddenOptionIds.has(item.id)
      )
    ).forEach((item) => {
      if (options.length >= 4) return;
      tryAddOption(item);
    });
  }

  if (options.length < 4) {
    doShuffle(
      pool.filter((item) => item.id !== word.id && !options.includes(item))
    ).forEach((item) => {
      if (options.length >= 4) return;
      tryAddOption(item);
    });
  }

  return doShuffle(options).map((item) => ({
    id: item.id,
    word: item,
  }));
};

lessonMode.pickQuestionMode = lessonMode.pickQuestionMode || function pickQuestionMode() {
  return Math.random() < 0.5 ? "forward" : "reverse";
};

lessonMode.rememberOptionHistory = lessonMode.rememberOptionHistory || function rememberOptionHistory(question) {
  const runtime = getRuntime();
  if (!question?.word?.id || !Array.isArray(question.options) || runtime.state.lesson.optionHistory[question.word.id]) {
    return;
  }

  runtime.state.lesson.optionHistory[question.word.id] = question.options.map((option) => option.id);
};

lessonMode.tryStartReviewPhase = lessonMode.tryStartReviewPhase || function tryStartReviewPhase(pool) {
  const runtime = getRuntime();
  const shuffle = app.utils?.shuffle;
  const doShuffle = typeof shuffle === "function" ? shuffle : (items) => [...items];
  if (runtime.state.lesson.inReview || !runtime.state.lesson.missedWordIds.length) return false;

  const wordIdsInPool = new Set(pool.map((word) => word.id));
  const reviewIds = runtime.state.lesson.missedWordIds.filter((id) => wordIdsInPool.has(id));
  if (!reviewIds.length) return false;

  runtime.state.lesson.inReview = true;
  runtime.state.lesson.reviewQueue = doShuffle(reviewIds);
  runtime.state.lesson.secondChanceTotal = runtime.state.lesson.reviewQueue.length;
  runtime.state.lesson.secondChanceCurrent = 0;
  return true;
};
})(typeof window !== "undefined" ? window : globalThis);
