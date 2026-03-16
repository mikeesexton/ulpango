(function initIvriQuestAppAdvConj(global) {
"use strict";

const app = global.IvriQuestApp = global.IvriQuestApp || {};
const advConj = app.advConj = app.advConj || {};

function getRuntime() {
  return app.runtime || {};
}

function getHelpers() {
  return getRuntime().helpers || {};
}

function getSession() {
  return app.session || {};
}

function getIdioms() {
  return Array.isArray(global.HEBREW_IDIOMS) ? global.HEBREW_IDIOMS : [];
}

function sanitizeEnglishText(text) {
  return app.utils?.sanitizeEnglishDisplayText
    ? app.utils.sanitizeEnglishDisplayText(text)
    : String(text || "").trim();
}

function translate(key, vars = {}) {
  return getHelpers().t ? getHelpers().t(key, vars) : key;
}

function getIdiomById(id) {
  return getIdioms().find((entry) => entry.id === id) || null;
}

function getAdvConjMeaningDetail(question) {
  const idiom = getIdiomById(question?.idiomId);
  const showMeaning = question?.showMeaning ?? idiom?.showMeaning;
  const meaning = sanitizeEnglishText(question?.colloquialMeaning || question?.englishMeaning || idiom?.english_meaning || idiom?.english);
  if (!showMeaning || !meaning) return "";
  return meaning;
}

advConj.getAdvConjPromptSpeechPayload = advConj.getAdvConjPromptSpeechPayload || function getAdvConjPromptSpeechPayload(question = getRuntime().state.advConj.currentQuestion) {
  if (!question?.promptIsHebrew) return null;
  return app.speech?.buildSpeechPayload?.({
    plain: question.promptText,
    niqqud: question.promptNiqqud,
    speechOverridePlain: question.promptSpeechText,
    speechOverrideNiqqud: question.promptSpeechTextNiqqud,
    source: "prompt",
  }) || null;
};

advConj.getAdvConjSelectionSpeechPayload = advConj.getAdvConjSelectionSpeechPayload || function getAdvConjSelectionSpeechPayload(question, option) {
  if (!question?.correctAnswerIsHebrew || !option) return null;
  return app.speech?.buildSpeechPayload?.({
    plain: option.text,
    niqqud: option.textNiqqud,
    speechOverridePlain: option.speechText,
    speechOverrideNiqqud: option.speechTextNiqqud,
    source: "answer",
  }) || null;
};

function isSecondPersonSubject(subject) {
  return /^you\b/i.test(String(subject?.en || ""));
}

function isSecondPersonObject(object) {
  return String(object?.key || "").startsWith("2");
}

function usesPresentBaseVerb(subject) {
  const label = String(subject?.en || "").trim().toLowerCase();
  if (!label) return false;
  return label.startsWith("you") || label === "i" || label === "we" || label.startsWith("they");
}

advConj.buildAdvConjHebrewAnswer = advConj.buildAdvConjHebrewAnswer || function buildAdvConjHebrewAnswer(idiom, subjectForm, subjectPronoun, objectKey, tense) {
  const runtime = getRuntime();
  const obj = runtime.constants.ADV_CONJ_OBJECTS.find((entry) => entry.key === objectKey);
  if (!obj) return "";
  const tenseData = tense === "past" ? idiom.past_tense : tense === "future" ? idiom.future_tense : idiom.present_tense;
  if (!tenseData) return "";
  const verbForm = tenseData[subjectForm];
  if (!verbForm) return "";
  const neg = idiom.negated ? "לא " : "";
  if (idiom.object_type === "direct") {
    return `${neg}${verbForm} ${obj.dirObj}`;
  }
  if (idiom.object_type === "l_dative") {
    return `${neg}${verbForm} ${obj.lObj} ${idiom.fixed_object}`;
  }
  if (idiom.object_type === "possessive_suffix") {
    const suffix = idiom.suffix_forms[objectKey];
    if (!suffix) return "";
    return `${neg}${verbForm} ${obj.dirObj} ${suffix}`;
  }
  return "";
};

advConj.buildAdvConjEnglishSentence = advConj.buildAdvConjEnglishSentence || function buildAdvConjEnglishSentence(idiom, subj, obj, tense) {
  let tpl;
  if (tense === "past") {
    tpl = idiom.literal_past;
  } else if (tense === "future") {
    tpl = idiom.literal_future;
  } else {
    tpl = usesPresentBaseVerb(subj) ? idiom.literal_pl : idiom.literal_sg;
  }
  if (!tpl) return "";

  let objectText = obj.en;
  let possessiveText = obj.poss;
  let collapsedQualifier = "";
  const usesObject = tpl.includes("{o}");
  const usesPossessive = tpl.includes("{p}");
  if (usesObject && usesPossessive) {
    const objectQualifier = advConj.getAdvConjTrailingQualifier(obj.en);
    const possessiveQualifier = advConj.getAdvConjTrailingQualifier(obj.poss);
    if (objectQualifier && objectQualifier === possessiveQualifier) {
      objectText = advConj.stripAdvConjTrailingQualifier(obj.en);
      possessiveText = advConj.stripAdvConjTrailingQualifier(obj.poss);
      collapsedQualifier = ` ${objectQualifier}`;
    }
  }

  return sanitizeEnglishText(
    tpl
    .replace(/\{s\}/g, subj.en)
    .replace(/\{o\}/g, objectText)
    .replace(/\{p\}/g, possessiveText) + collapsedQualifier
  );
};

advConj.getAdvConjSubjectsForTense = advConj.getAdvConjSubjectsForTense || function getAdvConjSubjectsForTense(tense) {
  return getRuntime().constants.ADV_CONJ_SUBJECTS.filter((subj) => !Array.isArray(subj.tenses) || subj.tenses.includes(tense));
};

advConj.getAdvConjTrailingQualifier = advConj.getAdvConjTrailingQualifier || function getAdvConjTrailingQualifier(text) {
  const match = String(text || "").match(/\s(\([^()]+\))$/);
  return match ? match[1] : "";
};

advConj.stripAdvConjTrailingQualifier = advConj.stripAdvConjTrailingQualifier || function stripAdvConjTrailingQualifier(text) {
  return String(text || "").replace(/\s\([^()]+\)$/, "");
};

advConj.buildAdvConjDeck = advConj.buildAdvConjDeck || function buildAdvConjDeck() {
  const runtime = getRuntime();
  const shuffle = app.utils?.shuffle;
  const deck = [];
  const tenses = ["present", "past", "future"];
  for (const idiom of getIdioms()) {
    if (!idiom.literal_sg) continue;
    for (const tense of tenses) {
      const tenseData = tense === "past" ? idiom.past_tense : tense === "future" ? idiom.future_tense : idiom.present_tense;
      if (!tenseData) continue;
      const subjects = advConj.getAdvConjSubjectsForTense(tense);
      for (const subj of subjects) {
        if (!tenseData[subj.form]) continue;
        for (const obj of runtime.constants.ADV_CONJ_OBJECTS) {
          if (isSecondPersonSubject(subj) && isSecondPersonObject(obj)) continue;
          if (idiom.object_type === "possessive_suffix" && !idiom.suffix_forms[obj.key]) continue;
          const hebrewAnswer = advConj.buildAdvConjHebrewAnswer(idiom, subj.form, subj.pronoun, obj.key, tense);
          if (!hebrewAnswer) continue;
          const englishSentence = advConj.buildAdvConjEnglishSentence(idiom, subj, obj, tense);
          if (!englishSentence) continue;
          const direction = Math.random() < 0.5 ? "en2he" : "he2en";

          if (direction === "he2en") {
            const verbForm = tenseData[subj.form];
            const ambiguous = subjects.some((subject) => subject.en !== subj.en && tenseData[subject.form] === verbForm);
            if (ambiguous) continue;
          }

          const otherObjs = runtime.constants.ADV_CONJ_OBJECTS.filter((entry) => entry.key !== obj.key);
          const otherSubjs = subjects.filter((subject) => subject.en !== subj.en);
          const correctText = direction === "en2he" ? hebrewAnswer : englishSentence;

          function buildDistractor(subject, object) {
            if (idiom.object_type === "possessive_suffix" && !idiom.suffix_forms[object.key]) return null;
            if (!tenseData[subject.form]) return null;
            return direction === "en2he"
              ? advConj.buildAdvConjHebrewAnswer(idiom, subject.form, subject.pronoun, object.key, tense)
              : advConj.buildAdvConjEnglishSentence(idiom, subject, object, tense);
          }

          let d1 = null;
          for (const wrongObject of typeof shuffle === "function" ? shuffle([...otherObjs]) : otherObjs) {
            const answer = buildDistractor(subj, wrongObject);
            if (answer && answer !== correctText) {
              d1 = answer;
              break;
            }
          }

          let d2 = null;
          for (const wrongSubject of typeof shuffle === "function" ? shuffle([...otherSubjs]) : otherSubjs) {
            const answer = buildDistractor(wrongSubject, obj);
            if (answer && answer !== correctText && answer !== d1) {
              d2 = answer;
              break;
            }
          }

          let d3 = null;
          for (const wrongSubject of typeof shuffle === "function" ? shuffle([...otherSubjs]) : otherSubjs) {
            for (const wrongObject of typeof shuffle === "function" ? shuffle([...otherObjs]) : otherObjs) {
              const answer = buildDistractor(wrongSubject, wrongObject);
              if (answer && answer !== correctText && answer !== d1 && answer !== d2) {
                d3 = answer;
                break;
              }
            }
            if (d3) break;
          }

          if (!d1 || !d2 || !d3) continue;
          const options = typeof shuffle === "function"
            ? shuffle([
                { id: "correct", text: correctText, isCorrect: true },
                { id: "d1", text: d1, isCorrect: false },
                { id: "d2", text: d2, isCorrect: false },
                { id: "d3", text: d3, isCorrect: false },
              ])
            : [
                { id: "correct", text: correctText, isCorrect: true },
                { id: "d1", text: d1, isCorrect: false },
                { id: "d2", text: d2, isCorrect: false },
                { id: "d3", text: d3, isCorrect: false },
              ];

          deck.push({
            idiomId: idiom.id,
            tense,
            direction,
            promptText: direction === "en2he" ? englishSentence : hebrewAnswer,
            promptIsHebrew: direction === "he2en",
            correctAnswer: correctText,
            correctAnswerIsHebrew: direction === "en2he",
            showMeaning: Boolean(idiom.showMeaning),
            colloquialMeaning: sanitizeEnglishText(idiom.english_meaning),
            options,
            selectedOptionId: null,
            locked: false,
          });
        }
      }
    }
  }
  return deck;
};

advConj.startAdvConj = advConj.startAdvConj || function startAdvConj() {
  const runtime = getRuntime();
  const h = getHelpers();
  const s = getSession();
  const shuffle = app.utils?.shuffle;
  app.speech?.cancel?.();
  s.stopVerbMatchTimer?.();
  s.stopLessonTimer?.();
  s.stopAbbreviationTimer?.();
  h.resetAbbreviationState?.();
  s.clearAbbreviationIntro?.();
  s.clearSummaryState?.();
  s.resetAdvConjState?.();
  h.resetSessionScore?.();
  runtime.state.mode = "advConj";
  runtime.state.route = "home";
  runtime.state.lastPlayedMode = "advConj";
  const deck = advConj.buildAdvConjDeck();
  runtime.state.advConj.questionQueue = (typeof shuffle === "function" ? shuffle(deck) : deck).slice(0, runtime.constants.ADV_CONJ_ROUNDS);
  runtime.state.advConj.active = true;
  runtime.state.advConj.startMs = Date.now();
  runtime.state.advConj.timerId = runtime.global.setInterval(() => {
    runtime.state.advConj.elapsedSeconds = Math.floor((Date.now() - runtime.state.advConj.startMs) / 1000);
    h.renderAll?.();
  }, 1000);
  advConj.playAdvConjIntro();
};

advConj.playAdvConjIntro = advConj.playAdvConjIntro || function playAdvConjIntro() {
  const runtime = getRuntime();
  runtime.state.advConj.introActive = true;
  if (runtime.el.advConjIntro) {
    runtime.el.advConjIntro.classList.remove("hidden");
    runtime.el.advConjIntro.setAttribute("aria-hidden", "false");
  }
  getSession().scheduleIntroAutoAdvance?.(() => advConj.beginAdvConjFromIntro());
};

advConj.beginAdvConjFromIntro = advConj.beginAdvConjFromIntro || function beginAdvConjFromIntro() {
  const runtime = getRuntime();
  if (!runtime.state.advConj.active) return;
  getSession().clearAdvConjIntro?.();
  advConj.loadAdvConjQuestion();
};

advConj.loadAdvConjQuestion = advConj.loadAdvConjQuestion || function loadAdvConjQuestion() {
  const runtime = getRuntime();
  runtime.state.advConj.currentRound += 1;
  if (runtime.state.advConj.questionQueue.length === 0) {
    getSession().finishAdvConj?.();
    return;
  }
  runtime.state.advConj.currentQuestion = runtime.state.advConj.questionQueue.shift();
  getHelpers().clearFeedback?.();
  advConj.renderAdvConjQuestion();
};

advConj.renderAdvConjQuestion = advConj.renderAdvConjQuestion || function renderAdvConjQuestion() {
  const runtime = getRuntime();
  const h = getHelpers();
  const question = runtime.state.advConj.currentQuestion;
  if (!question) return;
  h.setGamePickerVisibility?.(false);
  h.setPromptCardVisibility?.(true);
  runtime.el.choiceContainer.classList.remove("summary-grid");
  runtime.el.choiceContainer.classList.remove("match-grid");
  h.renderSessionHeader?.();
  app.ui?.renderPromptLabel?.("", false);
  if (runtime.el.promptText) {
    runtime.el.promptText.textContent = question.promptText;
    runtime.el.promptText.classList.remove("hidden");
    runtime.el.promptText.classList.toggle("hebrew", question.promptIsHebrew);
  }
  advConj.renderAdvConjChoices(question);
  h.renderNiqqudToggle?.();
  app.ui?.renderPromptSpeechButton?.();
};

advConj.renderAdvConjChoices = advConj.renderAdvConjChoices || function renderAdvConjChoices(question) {
  const runtime = getRuntime();
  runtime.el.choiceContainer.innerHTML = "";
  for (const option of question.options) {
    const btn = global.document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn";
    if (question.correctAnswerIsHebrew) {
      btn.classList.add("hebrew");
      btn.dir = "rtl";
      btn.setAttribute("lang", "he");
    }
    btn.textContent = option.text;
    btn.addEventListener("click", () => {
      if (question.locked) return;
      question.selectedOptionId = option.id;
      runtime.el.choiceContainer.querySelectorAll(".choice-btn").forEach((button, index) => {
        button.classList.toggle("selected", question.options[index]?.id === option.id);
      });
      getHelpers().renderSessionHeader?.();
      app.speech?.speak?.(advConj.getAdvConjSelectionSpeechPayload(question, option));
    });
    btn.classList.toggle("selected", question.selectedOptionId === option.id && !question.locked);
    runtime.el.choiceContainer.appendChild(btn);
  }
  if (question.locked) {
    advConj.markAdvConjChoiceResults(question);
  }
};

advConj.markAdvConjChoiceResults = advConj.markAdvConjChoiceResults || function markAdvConjChoiceResults(question) {
  const runtime = getRuntime();
  const buttons = runtime.el.choiceContainer.querySelectorAll(".choice-btn");
  question.options.forEach((option, index) => {
    if (!buttons[index]) return;
    if (option.isCorrect) buttons[index].classList.add("correct");
    else if (option.id === question.selectedOptionId) buttons[index].classList.add("wrong");
    buttons[index].disabled = true;
  });
};

advConj.applyAdvConjAnswer = advConj.applyAdvConjAnswer || function applyAdvConjAnswer() {
  const runtime = getRuntime();
  const h = getHelpers();
  const question = runtime.state.advConj.currentQuestion;
  if (!question || question.locked) return;
  app.speech?.cancel?.();
  question.locked = true;
  const selected = question.options.find((option) => option.id === question.selectedOptionId);
  const isCorrect = selected?.isCorrect ?? false;
  if (isCorrect) {
    runtime.state.sessionStreak += 1;
    runtime.state.sessionScore += 1;
  } else {
    runtime.state.sessionStreak = 0;
    runtime.state.advConj.wrongAnswers += 1;
    if (!runtime.state.advConj.sessionMistakeIds.includes(question.idiomId)) {
      runtime.state.advConj.sessionMistakeIds.push(question.idiomId);
    }
  }

  h.setFeedback?.(
    {
      tone: isCorrect ? "success" : "error",
      sentence: translate(
        isCorrect ? "feedback.advConjCorrectSentence" : "feedback.advConjWrongSentence",
        { answer: question.correctAnswer }
      ),
      detail: (() => {
        const meaning = getAdvConjMeaningDetail(question);
        return meaning ? translate("feedback.advConjMeaningDetail", { meaning }) : "";
      })(),
    }
  );
  h.playAnswerFeedbackSound?.(isCorrect);
  advConj.updateAdvConjStats(isCorrect);
  advConj.markAdvConjChoiceResults(runtime.state.advConj.currentQuestion);
  h.renderSessionHeader?.();
  h.renderDomainPerformance?.();
  h.renderMostMissed?.();
};

advConj.updateAdvConjStats = advConj.updateAdvConjStats || function updateAdvConjStats(isCorrect) {
  const runtime = getRuntime();
  const stats = runtime.storageApi.loadJson(runtime.constants.STORAGE_KEYS.advConjStats, { attempts: 0, correct: 0 });
  stats.attempts += 1;
  if (isCorrect) stats.correct += 1;
  runtime.storageApi.saveJson(runtime.constants.STORAGE_KEYS.advConjStats, stats);
};

advConj.buildAdvConjMistakeSummary = advConj.buildAdvConjMistakeSummary || function buildAdvConjMistakeSummary() {
  const runtime = getRuntime();
  return runtime.state.advConj.sessionMistakeIds
    .map((id) => {
      const idiom = getIdioms().find((entry) => entry.id === id);
      if (!idiom) return null;
      const subj = advConj.getAdvConjSubjectsForTense("present").find((subject) => idiom.present_tense[subject.form]);
      const obj = runtime.constants.ADV_CONJ_OBJECTS[0];
      const answer = subj ? advConj.buildAdvConjHebrewAnswer(idiom, subj.form, subj.pronoun, obj.key, "present") : "";
      return {
        primary: answer,
        secondary: sanitizeEnglishText(idiom.english_meaning),
      };
    })
    .filter(Boolean);
};
})(typeof window !== "undefined" ? window : globalThis);
