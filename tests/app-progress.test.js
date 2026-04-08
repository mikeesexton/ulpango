const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const verbApi = require("../hebrew-verbs.js");

const nativeSetTimeout = global.setTimeout;
const nativeClearTimeout = global.clearTimeout;
const nativeSetInterval = global.setInterval;
const nativeClearInterval = global.clearInterval;
const activeHarnesses = new Set();

const MODERN_IMPERATIVE_IDS = [
  "imperative_second_person_masculine_singular",
  "imperative_second_person_feminine_singular",
  "imperative_second_person_plural",
];

class FakeClassList {
  constructor() {
    this.tokens = new Set();
  }

  add(...tokens) {
    tokens.forEach((token) => this.tokens.add(token));
  }

  remove(...tokens) {
    tokens.forEach((token) => this.tokens.delete(token));
  }

  toggle(token, force) {
    if (force === undefined) {
      if (this.tokens.has(token)) {
        this.tokens.delete(token);
        return false;
      }
      this.tokens.add(token);
      return true;
    }
    if (force) {
      this.tokens.add(token);
      return true;
    }
    this.tokens.delete(token);
    return false;
  }

  contains(token) {
    return this.tokens.has(token);
  }
}

class FakeElement {
  constructor(tagName = "div") {
    this.tagName = String(tagName || "div").toUpperCase();
    this.classList = new FakeClassList();
    this.style = {
      setProperty(name, value) {
        this[name] = value;
      },
    };
    this.attributes = {};
    this.children = [];
    this.dataset = {};
    this.listeners = {};
    this._textContent = "";
    this._innerHTML = "";
    this.disabled = false;
    this.hidden = false;
    this.value = "";
    this.className = "";
    this.parentElement = null;
  }

  append(...nodes) {
    nodes.forEach((node) => {
      if (node && typeof node === "object") {
        node.parentElement = this;
      }
      this.children.push(node);
    });
  }

  appendChild(node) {
    if (node && typeof node === "object") {
      node.parentElement = this;
    }
    this.children.push(node);
    return node;
  }

  addEventListener(type, handler) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(handler);
  }

  removeEventListener(type, handler) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter((candidate) => candidate !== handler);
  }

  click() {
    const handlers = this.listeners.click || [];
    const event = {
      target: this,
      currentTarget: this,
      preventDefault() {},
      stopPropagation() {},
    };
    handlers.forEach((handler) => handler(event));
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || new FakeElement();
  }

  querySelectorAll(selector) {
    const matches = [];
    const visit = (nodes) => {
      nodes.forEach((node) => {
        if (matchesSelector(node, selector)) {
          matches.push(node);
        }
        if (Array.isArray(node.children) && node.children.length > 0) {
          visit(node.children);
        }
      });
    };
    visit(this.children);
    return matches;
  }

  closest(selector) {
    let current = this;
    while (current) {
      if (matchesSelector(current, selector)) {
        return current;
      }
      current = current.parentElement || null;
    }
    return null;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name.startsWith("data-")) {
      const key = name
        .slice(5)
        .replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      this.dataset[key] = String(value);
    }
  }

  getAttribute(name) {
    return this.attributes[name];
  }

  removeAttribute(name) {
    delete this.attributes[name];
  }

  get className() {
    return Array.from(this.classList.tokens).join(" ");
  }

  set className(value) {
    this.classList = new FakeClassList();
    String(value || "")
      .split(/\s+/)
      .filter(Boolean)
      .forEach((token) => this.classList.add(token));
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(value) {
    this._innerHTML = String(value || "");
    this.children = [];
  }

  get textContent() {
    return this._textContent;
  }

  set textContent(value) {
    this._textContent = String(value ?? "");
  }
}

function matchesSelector(node, selector) {
  if (!node || !selector) return false;
  if (selector.startsWith(".")) {
    return node.classList.contains(selector.slice(1));
  }
  return node.tagName === selector.toUpperCase();
}

function createLocalStorage(initialEntries = {}) {
  const store = new Map(Object.entries(initialEntries));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    __dump() {
      return Object.fromEntries(store.entries());
    },
  };
}

function runScriptInContext(sourcePath, context, transform = null) {
  const source = fs.readFileSync(sourcePath, "utf8");
  const nextSource = typeof transform === "function" ? transform(source) : source;
  vm.runInContext(nextSource, context, { filename: sourcePath });
}

function loadAppHarness(vocabulary, abbreviations = [], verbDeck = [], options = {}) {
  const sourcePath = path.join(__dirname, "..", "app.js");
  const instrumented = (source) => source.replace(
    /\}\)\(typeof window !== "undefined" \? window : globalThis\);\s*$/,
    `
globalThis.__appTestExports = {
  ADV_CONJ_SUBJECTS,
  ADV_CONJ_OBJECTS,
  app: globalThis.IvriQuestApp,
  applyAnswer,
  applyAbbreviationAnswer,
  applyAdvConjAnswer,
  applySentenceBankAnswer,
  applyVerbMatchMismatch,
  applyVerbMatchSuccess,
  buildAbbreviationMistakeSummary,
  buildAdvConjDeck,
  buildAdvConjEnglishSentence,
  getAdvConjSubjectsForTense,
  beginAbbreviationFromIntro,
  beginLessonFromIntro,
  beginVerbMatchFromIntro,
  confirmLeaveSession,
  closeLeaveSessionConfirm,
  closeWelcomeModal,
  clearSentenceBankAnswer,
  document,
  goHome,
  getMostMissedRanked,
  getProgressRecord,
  getSelectedPool,
  localStorage,
  loadNextVerbRound,
  navigateTo,
  nextAbbreviationQuestion,
  nextQuestion,
  nextSentenceBankQuestion,
  renderChoices,
  requestLeaveSession,
  requestGoHome,
  resumeActiveTimers,
  restoreSessionState,
  startAbbreviation,
  startAdvConj,
  startSentenceBank,
  startVerbMatch,
  toggleSoundPreference,
  toggleSentenceBankHint,
  toggleSpeechPreference,
  updateProgress,
  state,
};
})(typeof window !== "undefined" ? window : globalThis);
`
  );

  const audioPlayLog = [];
  const audioLoadLog = [];
  const speechSpeakLog = [];
  let speechCancelCount = 0;
  const timeoutHandles = new Set();
  const intervalHandles = new Set();
  const elements = new Map();
  const document = {
    body: new FakeElement("body"),
    documentElement: new FakeElement("html"),
    title: "",
    querySelector(selector) {
      if (!elements.has(selector)) {
        elements.set(selector, new FakeElement());
      }
      return elements.get(selector);
    },
    querySelectorAll() {
      return [];
    },
    createElement(tagName) {
      return new FakeElement(tagName);
    },
    elementFromPoint() {
      return this.__elementFromPointTarget || null;
    },
  };
  document.documentElement.style = {};

  function trackedSetTimeout(handler, delay, ...args) {
    const handle = nativeSetTimeout(() => {
      timeoutHandles.delete(handle);
      handler(...args);
    }, delay);
    timeoutHandles.add(handle);
    return handle;
  }

  function trackedClearTimeout(handle) {
    timeoutHandles.delete(handle);
    nativeClearTimeout(handle);
  }

  function trackedSetInterval(handler, delay, ...args) {
    const handle = nativeSetInterval(handler, delay, ...args);
    intervalHandles.add(handle);
    return handle;
  }

  function trackedClearInterval(handle) {
    intervalHandles.delete(handle);
    nativeClearInterval(handle);
  }

  const testMath = Object.create(Math);
  if (typeof options.mathRandom === "function") {
    testMath.random = options.mathRandom;
  }

  const context = {
    console,
    Math: testMath,
    Date,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    Map,
    Set,
    Promise,
    URLSearchParams,
    innerWidth: Number(options.innerWidth || 0),
    setTimeout: trackedSetTimeout,
    clearTimeout: trackedClearTimeout,
    setInterval: trackedSetInterval,
    clearInterval: trackedClearInterval,
    __IVRIQUEST_TEST_CONFIG__: {
      introAutoAdvanceMs: 0,
    },
    document,
    Audio: class FakeAudio {
      constructor(src) {
        this.src = src;
        this.preload = "";
        this.currentTime = 0;
      }

      canPlayType(type) {
        if (options.audioSupport && Object.hasOwn(options.audioSupport, type)) {
          return options.audioSupport[type];
        }
        return "probably";
      }

      play() {
        audioPlayLog.push(this.src);
        return Promise.resolve();
      }

      load() {
        audioLoadLog.push(this.src);
      }
    },
    SpeechSynthesisUtterance: class FakeSpeechSynthesisUtterance {
      constructor(text) {
        this.text = text;
        this.lang = "";
        this.voice = null;
      }
    },
    speechSynthesis: {
      _listeners: {},
      getVoices() {
        return Array.isArray(options.speechVoices)
          ? options.speechVoices
          : [{ lang: "he-IL", name: "Hebrew Test" }];
      },
      addEventListener(type, handler) {
        this._listeners[type] = handler;
      },
      removeEventListener(type) {
        delete this._listeners[type];
      },
      speak(utterance) {
        speechSpeakLog.push({
          text: utterance.text,
          lang: utterance.lang,
          voiceName: utterance.voice?.name || "",
          voiceLang: utterance.voice?.lang || "",
        });
      },
      cancel() {
        speechCancelCount += 1;
      },
    },
    localStorage: createLocalStorage(options.localStorageData || {
      "ivriquest-welcome-seen-v1": "1",
    }),
    confirm() {
      return false;
    },
    addEventListener() {},
    removeEventListener() {},
    location: { search: "" },
    HEBREW_IDIOMS: options.idioms || [],
    IvriQuestVocab: {
      EXPANSION_TRACKS: {},
      getBaseVocabulary() {
        return vocabulary;
      },
    },
    IvriQuestAbbreviations: {
      getAbbreviations() {
        return abbreviations;
      },
    },
    IvriQuestSentenceBank: {
      getSentenceBank() {
        return options.sentenceBank || [];
      },
    },
    IvriQuestHebrewVerbs: {
      MATCH_FORM_ORDER: [
        "present_masculine_singular",
        "past_first_person_singular",
        "future_first_person_singular",
        "present_feminine_singular",
        "past_third_person_masculine_singular",
        "future_third_person_masculine_singular",
        "present_masculine_plural",
        "past_third_person_feminine_singular",
        "future_third_person_feminine_singular",
        "present_feminine_plural",
        "past_first_person_plural",
        "future_first_person_plural",
        "past_second_person_masculine_singular",
        "future_second_person_masculine_singular",
        "past_second_person_feminine_singular",
        "future_second_person_feminine_singular",
        "past_second_person_masculine_plural",
        "future_second_person_plural",
        "past_second_person_feminine_plural",
        "past_third_person_plural",
        "future_third_person_plural",
        "imperative_second_person_masculine_singular",
        "imperative_second_person_feminine_singular",
        "imperative_second_person_plural",
      ],
      getSeedVocabularyEntries() {
        return [];
      },
      buildVerbConjugationDeck() {
        return verbDeck;
      },
    },
  };

  context.window = context;
  context.globalThis = context;
  document.defaultView = context;

  vm.createContext(context);
  [
    path.join(__dirname, "..", "app", "constants.js"),
    path.join(__dirname, "..", "app", "storage.js"),
    path.join(__dirname, "..", "app", "utils.js"),
    path.join(__dirname, "..", "app", "hebrew.js"),
    path.join(__dirname, "..", "app", "bootstrap-data.js"),
    path.join(__dirname, "..", "app", "content-sources.js"),
    path.join(__dirname, "..", "app", "bootstrap-runtime.js"),
    path.join(__dirname, "..", "app", "audio.js"),
    path.join(__dirname, "..", "app", "speech.js"),
    path.join(__dirname, "..", "app", "persistence.js"),
    path.join(__dirname, "..", "app", "session.js"),
    path.join(__dirname, "..", "app", "i18n.js"),
    path.join(__dirname, "..", "app", "ui.js"),
    path.join(__dirname, "..", "app", "data.js"),
    path.join(__dirname, "..", "app", "lesson.js"),
    path.join(__dirname, "..", "app", "sentence-bank.js"),
    path.join(__dirname, "..", "app", "abbreviation.js"),
    path.join(__dirname, "..", "app", "adv-conj.js"),
    path.join(__dirname, "..", "app", "verb-match.js"),
    path.join(__dirname, "..", "app", "controller.js"),
  ].forEach((scriptPath) => runScriptInContext(scriptPath, context));
  runScriptInContext(sourcePath, context, instrumented);
  const harness = {
    ...context.__appTestExports,
    audioLoadLog,
    audioPlayLog,
    speechSpeakLog,
    getSpeechCancelCount() {
      return speechCancelCount;
    },
    cleanup() {
      timeoutHandles.forEach((handle) => nativeClearTimeout(handle));
      timeoutHandles.clear();
      intervalHandles.forEach((handle) => nativeClearInterval(handle));
      intervalHandles.clear();
      activeHarnesses.delete(harness);
    },
  };
  activeHarnesses.add(harness);
  return harness;
}

function waitForTimers() {
  return new Promise((resolve) => nativeSetTimeout(resolve, 0));
}

function assertAudioPlayLog(audioPlayLog, expectedPatterns) {
  assert.equal(audioPlayLog.length, expectedPatterns.length);
  expectedPatterns.forEach((pattern, index) => {
    assert.match(audioPlayLog[index], pattern);
  });
}

function assertAudioLoadLog(audioLoadLog, expectedPatterns) {
  assert.equal(audioLoadLog.length, expectedPatterns.length);
  expectedPatterns.forEach((pattern, index) => {
    assert.match(audioLoadLog[index], pattern);
  });
}

function getFeedbackText(document) {
  const sentence = document.querySelector("#feedbackSentence").textContent;
  const detail = document.querySelector("#feedbackDetail").textContent;
  return [sentence, detail].filter(Boolean).join(" ");
}

function findVisibleButtonByText(root, selector, text) {
  return root.querySelectorAll(selector).find((node) => (
    node.textContent === text
    && !node.classList.contains("hidden")
    && !node.classList.contains("used")
  ));
}

function getSentenceSlots(document) {
  return document.querySelector("#choiceContainer").querySelectorAll(".sentence-slot");
}

function getSentenceStaticTexts(document) {
  return document.querySelector("#choiceContainer").querySelectorAll(".sentence-static").map((node) => node.textContent);
}

function getSentenceStaticWordChunks(document) {
  return getSentenceStaticTexts(document).filter((text) => /[A-Za-z0-9]/.test(text));
}

function createFakeDataTransfer() {
  const store = new Map();
  return {
    effectAllowed: "move",
    dropEffect: "move",
    setData(type, value) {
      store.set(type, String(value));
    },
    getData(type) {
      return store.get(type) || "";
    },
  };
}

function simulateDragAndDrop(source, target) {
  const dataTransfer = createFakeDataTransfer();
  const baseEvent = {
    preventDefault() {},
    stopPropagation() {},
  };
  (source.listeners.dragstart || []).forEach((handler) => handler({
    ...baseEvent,
    target: source,
    currentTarget: source,
    dataTransfer,
  }));
  (target.listeners.dragenter || []).forEach((handler) => handler({
    ...baseEvent,
    target,
    currentTarget: target,
    dataTransfer,
  }));
  (target.listeners.dragover || []).forEach((handler) => handler({
    ...baseEvent,
    target,
    currentTarget: target,
    dataTransfer,
  }));
  (target.listeners.drop || []).forEach((handler) => handler({
    ...baseEvent,
    target,
    currentTarget: target,
    dataTransfer,
  }));
  (source.listeners.dragend || []).forEach((handler) => handler({
    ...baseEvent,
    target: source,
    currentTarget: source,
    dataTransfer,
  }));
}

function simulateTouchDragAndDrop(document, source, target) {
  const touchPoint = { clientX: 24, clientY: 24 };
  document.__elementFromPointTarget = target;
  const baseEvent = {
    preventDefault() {},
    stopPropagation() {},
  };
  (source.listeners.touchstart || []).forEach((handler) => handler({
    ...baseEvent,
    target: source,
    currentTarget: source,
    touches: [touchPoint],
    changedTouches: [touchPoint],
  }));
  (source.listeners.touchmove || []).forEach((handler) => handler({
    ...baseEvent,
    target: source,
    currentTarget: source,
    touches: [touchPoint],
    changedTouches: [touchPoint],
  }));
  (source.listeners.touchend || []).forEach((handler) => handler({
    ...baseEvent,
    target: source,
    currentTarget: source,
    touches: [],
    changedTouches: [touchPoint],
  }));
  document.__elementFromPointTarget = null;
}

function dragSentenceTokenToSlot(document, tokenText, slotIndex) {
  const source = findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", tokenText);
  const target = getSentenceSlots(document)[slotIndex];
  simulateDragAndDrop(source, target);
}

function dragPlacedSentenceToken(document, fromIndex, toIndex) {
  const slots = getSentenceSlots(document);
  simulateDragAndDrop(slots[fromIndex], slots[toIndex]);
}

function touchDragSentenceTokenToSlot(document, tokenText, slotIndex) {
  const source = findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", tokenText);
  const target = getSentenceSlots(document)[slotIndex];
  simulateTouchDragAndDrop(document, source, target);
}

function placeSentenceTokenByTap(document, tokenText, slotIndex) {
  const slot = getSentenceSlots(document)[slotIndex];
  slot.click();
  findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", tokenText).click();
}

function fillSentenceAnswerByTap(document, tokens) {
  tokens.forEach((token, index) => placeSentenceTokenByTap(document, token, index));
}

function placeSentenceTokenInNextEmptySlotByTap(document, tokenText) {
  findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", tokenText).click();
}

function pressKey(node, key) {
  const baseEvent = {
    key,
    preventDefault() {},
    stopPropagation() {},
  };
  (node.listeners.keydown || []).forEach((handler) => handler({
    ...baseEvent,
    target: node,
    currentTarget: node,
  }));
}

function getSentenceSlotTexts(document) {
  return getSentenceSlots(document).map((slot) => slot.textContent.replace(/\u00A0/g, "").trim());
}

test.afterEach(() => {
  activeHarnesses.forEach((harness) => harness.cleanup());
  activeHarnesses.clear();
});

test("correct second-chance answers do not add misses or reshuffle most-missed rankings", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
    { id: "beta", category: "core_advanced", en: "beta", he: "בטא", heNiqqud: "בֵּטָא", utility: 80, source: "test" },
  ];
  const { applyAnswer, getMostMissedRanked, getProgressRecord, updateProgress, state } = loadAppHarness(vocabulary);

  updateProgress("alpha", false);
  updateProgress("beta", false);

  assert.deepEqual(
    getMostMissedRanked().map((item) => `${item.wordId}:${item.missed}`),
    ["alpha:1", "beta:1"]
  );

  state.lesson.active = true;
  state.lesson.inReview = true;
  state.lesson.wrongAnswers = 0;
  state.lesson.sessionMistakeIds = [];
  state.currentQuestion = {
    locked: false,
    isReview: true,
    word: vocabulary[1],
    options: [
      { id: "beta", word: vocabulary[1] },
      { id: "alpha", word: vocabulary[0] },
    ],
    selectedOptionId: "beta",
  };

  applyAnswer(true, "beta");

  assert.equal(getProgressRecord("beta").attempts, 2);
  assert.equal(getProgressRecord("beta").correct, 1);
  assert.equal(getProgressRecord("beta").misses, 1);
  assert.equal(state.lesson.wrongAnswers, 0);
  assert.deepEqual(state.lesson.sessionMistakeIds, []);
  assert.deepEqual(
    getMostMissedRanked().map((item) => `${item.wordId}:${item.missed}`),
    ["alpha:1", "beta:1"]
  );
});

test("welcome modal appears once and survey links stay available", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
  ];
  const firstHarness = loadAppHarness(vocabulary, [], [], { localStorageData: {} });
  const feedbackLink = firstHarness.document.querySelector("#feedbackSurveyLink");
  const welcomeLink = firstHarness.document.querySelector("#welcomeSurveyLink");

  assert.equal(firstHarness.state.welcomeModalOpen, true);
  assert.equal(firstHarness.localStorage.getItem("ivriquest-welcome-seen-v1"), "1");
  assert.equal(feedbackLink.getAttribute("href"), "https://forms.gle/KqqP7TVLxphRDM179");
  assert.equal(feedbackLink.getAttribute("target"), "_blank");
  assert.equal(feedbackLink.getAttribute("rel"), "noopener noreferrer");
  assert.equal(welcomeLink.getAttribute("href"), "https://forms.gle/KqqP7TVLxphRDM179");
  assert.equal(welcomeLink.getAttribute("target"), "_blank");
  assert.equal(welcomeLink.getAttribute("rel"), "noopener noreferrer");

  firstHarness.closeWelcomeModal();
  assert.equal(firstHarness.state.welcomeModalOpen, false);

  const returningHarness = loadAppHarness(vocabulary, [], [], {
    localStorageData: firstHarness.localStorage.__dump(),
  });
  assert.equal(returningHarness.state.welcomeModalOpen, false);
});

test("most-missed rankings ignore words that are unavailable for translation quiz", () => {
  const vocabulary = [
    { id: "basic-office", category: "work_business", en: "office", he: "משרד", heNiqqud: "מִשְׂרָד", utility: 82, source: "seed", availability: { translationQuiz: false, sentenceHints: true } },
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test", availability: { translationQuiz: true, sentenceHints: true } },
  ];
  const { getMostMissedRanked, updateProgress } = loadAppHarness(vocabulary);

  updateProgress("basic-office", false);
  updateProgress("alpha", false);

  assert.deepEqual(
    getMostMissedRanked().map((item) => `${item.wordId}:${item.missed}`),
    ["alpha:1"]
  );
});

test("translation miss recovery streak resets on misses and neutralizes the hidden bias after five correct recoveries", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
  ];
  const { getProgressRecord, updateProgress } = loadAppHarness(vocabulary);

  updateProgress("alpha", false, { mode: "translationQuiz" });
  assert.equal(getProgressRecord("alpha").translationRecoveryStreak, 0);

  for (let i = 1; i <= 5; i += 1) {
    updateProgress("alpha", true, { mode: "translationQuiz" });
    assert.equal(getProgressRecord("alpha").translationRecoveryStreak, i);
  }

  updateProgress("alpha", true, { mode: "translationQuiz" });
  assert.equal(getProgressRecord("alpha").translationRecoveryStreak, 5);

  updateProgress("alpha", false, { mode: "translationQuiz" });
  assert.equal(getProgressRecord("alpha").translationRecoveryStreak, 0);
});

test("translation selection weights previously missed words until their five-answer recovery streak clears the bias", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 60, source: "test" },
    { id: "beta", category: "core_advanced", en: "beta", he: "בטא", heNiqqud: "בֵּטָא", utility: 60, source: "test" },
  ];
  const harness = loadAppHarness(vocabulary, [], [], {
    mathRandom: () => 0,
  });

  harness.state.progress.alpha = {
    attempts: 4,
    correct: 4,
    misses: 2,
    level: 0,
    nextDue: 0,
    lastSeen: 0,
    translationRecoveryStreak: 0,
  };
  harness.state.progress.beta = {
    attempts: 4,
    correct: 4,
    misses: 0,
    level: 0,
    nextDue: 0,
    lastSeen: 0,
    translationRecoveryStreak: 0,
  };

  let weighted = [];
  harness.app.utils.weightedRandomWord = (items) => {
    weighted = items;
    return items[0]?.word || null;
  };

  harness.app.data.pickBestWord(vocabulary, [], { mode: "translationQuiz" });
  const alphaFocusedWeight = weighted.find((item) => item.word.id === "alpha")?.weight || 0;
  const betaNeutralWeight = weighted.find((item) => item.word.id === "beta")?.weight || 0;
  assert.ok(alphaFocusedWeight > betaNeutralWeight);

  harness.state.progress.alpha.translationRecoveryStreak = 5;
  harness.app.data.pickBestWord(vocabulary, [], { mode: "translationQuiz" });
  const alphaRecoveredWeight = weighted.find((item) => item.word.id === "alpha")?.weight || 0;
  const betaRecoveredWeight = weighted.find((item) => item.word.id === "beta")?.weight || 0;
  assert.equal(alphaRecoveredWeight, betaRecoveredWeight);
});

test("show nikud preference persists when advancing translation and abbreviation questions", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
    { id: "beta", category: "core_advanced", en: "beta", he: "בטא", heNiqqud: "בֵּטָא", utility: 79, source: "test" },
    { id: "gamma", category: "core_advanced", en: "gamma", he: "גמא", heNiqqud: "גַּמָּא", utility: 78, source: "test" },
    { id: "delta", category: "core_advanced", en: "delta", he: "דלתא", heNiqqud: "דֶּלְתָּא", utility: 77, source: "test" },
  ];
  const abbreviations = [
    { id: "abbr-1", abbr: "וכו׳", expansionHe: "וכולי", english: "etc.", bucket: "Daily Life & Home" },
    { id: "abbr-2", abbr: "לדוג׳", expansionHe: "לדוגמה", english: "for example", bucket: "Daily Life & Home" },
    { id: "abbr-3", abbr: "בע״ה", expansionHe: "בעזרת השם", english: "with God's help", bucket: "People, Health & Culture" },
    { id: "abbr-4", abbr: "עי׳", expansionHe: "עיין", english: "see / refer to", bucket: "Ideas, Science & Tech" },
  ];
  const { nextAbbreviationQuestion, nextQuestion, state } = loadAppHarness(vocabulary, abbreviations);

  state.mode = "lesson";
  state.lesson.active = true;
  state.showNiqqudInline = true;
  nextQuestion();
  assert.equal(state.showNiqqudInline, true);
  assert.ok(state.currentQuestion);

  state.mode = "abbreviation";
  state.abbreviation.active = true;
  state.abbreviation.currentRound = 0;
  state.showNiqqudInline = true;
  nextAbbreviationQuestion();
  assert.equal(state.showNiqqudInline, true);
  assert.ok(state.abbreviation.currentQuestion);
});

test("sentence builder renders english answer lines left-to-right, keeps punctuation visible, and shows post-answer game tips", () => {
  const sentenceBank = [
    {
      id: "sb-1",
      category: "everyday",
      difficulty: 2,
      english: "He's just talking nonsense, don't take him seriously.",
      hebrew: "הוא סתם מדבר שטויות, אל תיקח אותו ברצינות.",
      english_tokens: ["He's", "just", "talking", "nonsense", "don't", "take", "him", "seriously"],
      hebrew_tokens: ["הוא", "סתם", "מדבר", "שטויות", "אל", "תיקח", "אותו", "ברצינות"],
      english_distractors: ["she", "truth", "listen", "later"],
      hebrew_distractors: ["היא", "אמת", "תקשיב", "מחר"],
      notes: "Third person gender swap (הוא/היא, מדבר/מדברת, אותו/אותה) is a good distractor set here.",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "he2en")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  assert.equal(state.sentenceBank.currentQuestion.direction, "he2en");
  assert.equal(document.querySelector("#nextBtn").disabled, true);
  assert.equal(document.querySelector("#stickyLessonActions").textContent.includes("Hint"), false);
  assert.equal(document.querySelector("#stickyLessonActions").textContent.includes("Clear"), false);
  assert.equal(document.querySelector("#promptHint").classList.contains("hidden"), true);
  assert.equal(document.querySelector("#promptLabel").classList.contains("hidden"), true);
  assert.equal(getSentenceSlots(document)[0].getAttribute("dir"), undefined);

  fillSentenceAnswerByTap(document, ["He's", "just", "talking", "nonsense", "don't", "take", "him", "seriously"]);
  assert.equal(document.querySelector("#nextBtn").disabled, false);
  document.querySelector("#nextBtn").click();

  assert.equal(state.sessionScore, 2);
  assert.equal(
    getFeedbackText(document),
    "Correct. The English sentence is He's just talking nonsense, don't take him seriously. "
      + "Game tip: Watch the gender match here."
  );
  assert.equal(state.sentenceProgress["sb-1::he2en"].attempts, 1);
  assert.equal(state.sentenceProgress["sb-1::he2en"].correct, 1);
  assert.equal(state.sentenceProgress["sb-1::he2en"].level, 1);
  assert.equal(state.sentenceProgress["sb-1::he2en"].misses, 0);
  assert.equal(state.sentenceProgress["sb-1::en2he"], undefined);

  const modeStats = harness.app.data.calculateGameModeStats();
  assert.equal(modeStats.sentenceBank.attempts, 1);
  assert.equal(modeStats.sentenceBank.correct, 1);
  assert.equal(modeStats.sentenceBank.wrong, 0);
});

test("sentence builder rewrites formal notes into short learner-facing tips", () => {
  const sentenceBank = [
    {
      id: "sb-formal-tip",
      category: "formal",
      difficulty: 3,
      english: "The central question is how to implement this in practice, not just in theory.",
      hebrew: "השאלה המרכזית היא כיצד ליישם זאת בפועל, ולא רק בתיאוריה.",
      english_tokens: ["The", "central", "question", "is", "how", "to", "implement", "this", "in", "practice", "not", "just", "in", "theory"],
      hebrew_tokens: ["השאלה", "המרכזית", "היא", "כיצד", "ליישם", "זאת", "בפועל", "ולא", "רק", "בתיאוריה"],
      english_distractors: ["do", "important", "why"],
      hebrew_distractors: ["מדוע", "לעשות", "החשובה"],
      notes: "כיצד is the formal version of איך (how). ליישם (to implement) is formal; colloquial would be לעשות (to do).",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "he2en")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  fillSentenceAnswerByTap(document, ["The", "central", "question", "is", "how", "to", "implement", "this", "in", "practice", "not", "just", "in", "theory"]);
  document.querySelector("#nextBtn").click();

  assert.equal(
    getFeedbackText(document),
    "Correct. The English sentence is The central question is how to implement this in practice, not just in theory. "
      + "Game tip: This one uses a more formal tone. Pick the more polished wording."
  );
});

test("sentence builder prompt styles keep the prompt centered while answer rows stay language-aligned", () => {
  const styles = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");

  assert.match(styles, /\.lesson-shell\.mode-sentence-bank \.prompt-content-row\s*\{[^}]*justify-content:\s*center;/s);
  assert.match(styles, /\.lesson-shell\.mode-sentence-bank \.prompt-text\s*\{[^}]*text-align:\s*center;/s);
  assert.match(styles, /\.prompt-text\.english-prompt\s*\{[^}]*direction:\s*ltr;[^}]*unicode-bidi:\s*isolate;/s);
  assert.match(styles, /\.prompt-text\.hebrew\s*\{[^}]*font-family:\s*"Assistant",\s*sans-serif;/s);
  assert.match(styles, /\.lesson-shell\.mode-sentence-bank \.prompt-text\.hebrew\s*\{[^}]*text-align:\s*center;/s);
  assert.match(styles, /\.sentence-answer-line\.english\s*\{[^}]*text-align:\s*left;/s);
  assert.match(styles, /\.sentence-answer-line\.hebrew\s*\{[^}]*text-align:\s*right;/s);
});

test("sentence builder gives English prompts explicit LTR prompt styling in Hebrew UI", () => {
  const sentenceBank = [
    {
      id: "sb-english-prompt-bidi",
      category: "formal",
      difficulty: 3,
      english: "One must consider the long-term implications before making a decision.",
      hebrew: "יש לשקול את ההשלכות ארוכות הטווח לפני קבלת החלטה.",
      english_tokens: ["One", "must", "consider", "the", "long-term", "implications", "before", "making", "a", "decision"],
      hebrew_tokens: ["יש", "לשקול", "את", "ההשלכות", "ארוכות", "הטווח", "לפני", "קבלת", "החלטה"],
      english_distractors: ["brief", "ignore", "afterward"],
      hebrew_distractors: ["קצר", "להתעלם", "לאחר מכן"],
      notes: "Formal register: יש לשקול means one should consider.",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  state.language = "he";
  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "en2he")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  const prompt = document.querySelector("#promptText");
  assert.equal(prompt.textContent, "One must consider the long-term implications before making a decision.");
  assert.equal(prompt.classList.contains("english-prompt"), true);
  assert.equal(prompt.classList.contains("hebrew"), false);
});

test("sentence builder base layout trims prompt, board, and feedback spacing without changing alignment", () => {
  const styles = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");

  assert.match(styles, /\.lesson-shell\.mode-sentence-bank \.prompt-card\s*\{[^}]*padding:\s*0\.18rem 0\.58rem 0\.24rem;[^}]*gap:\s*0\.2rem;/s);
  assert.match(styles, /\.lesson-shell\.mode-sentence-bank \.prompt-content-row\s*\{[^}]*min-height:\s*clamp\(3\.35rem,\s*5\.8vw,\s*4rem\);[^}]*padding-left:\s*0\.16rem;[^}]*padding-right:\s*0\.16rem;/s);
  assert.match(styles, /\.lesson-shell\.mode-sentence-bank \.prompt-card\.has-prompt-control \.prompt-content-row\s*\{[^}]*padding-left:\s*0\.16rem;[^}]*padding-right:\s*2\.72rem;/s);
  assert.match(styles, /\.lesson-shell\.mode-sentence-bank \.prompt-text\s*\{[^}]*max-width:\s*min\(100%,\s*36ch\);[^}]*font-size:\s*clamp\(1\.36rem,\s*3\.7vw,\s*1\.86rem\);[^}]*line-height:\s*1\.18;/s);
  assert.match(styles, /\.sentence-builder\s*\{[^}]*gap:\s*0\.68rem;/s);
  assert.match(styles, /\.sentence-answer-line\s*\{[^}]*min-height:\s*2\.9rem;[^}]*line-height:\s*1\.68;/s);
  assert.match(styles, /\.sentence-token-bank\s*\{[^}]*gap:\s*0\.44rem 0\.34rem;/s);
  assert.match(styles, /\.sentence-answer-meta\s*\{[^}]*font-size:\s*0\.8rem;/s);
  assert.match(styles, /\.lesson-shell\.mode-sentence-bank \.feedback-tray\s*\{[^}]*padding:\s*0\.64rem 0\.8rem 0\.68rem;/s);
});

test("sentence builder mobile breakpoint uses smaller sentence tokens and a tighter footer stack", () => {
  const styles = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");
  const mobileChoiceBtn = styles.match(/@media \(max-width: 767px\)\s*\{[\s\S]*?\.choice-btn\s*\{[^}]*min-height:\s*(\d+)px;/s);
  const mobileSentenceToken = styles.match(/@media \(max-width: 767px\)\s*\{[\s\S]*?\.lesson-shell\.mode-sentence-bank \.sentence-token\s*\{[^}]*min-height:\s*(\d+)px;[^}]*padding:\s*0\.32rem 0\.6rem;[^}]*border-radius:\s*12px;[^}]*font-size:\s*0\.9rem;/s);

  assert.ok(mobileChoiceBtn);
  assert.ok(mobileSentenceToken);
  assert.ok(Number(mobileSentenceToken[1]) < Number(mobileChoiceBtn[1]));
  assert.match(styles, /@media \(max-width: 767px\)\s*\{[\s\S]*?\.progress-strip\s*\{[^}]*height:\s*11px;/s);
  assert.match(styles, /@media \(max-width: 767px\)\s*\{[\s\S]*?\.lesson-shell\.mode-sentence-bank \.prompt-content-row\s*\{[^}]*min-height:\s*3\.08rem;[^}]*padding-left:\s*0\.04rem;[^}]*padding-right:\s*0\.04rem;/s);
  assert.match(styles, /@media \(max-width: 767px\)\s*\{[\s\S]*?\.lesson-shell\.mode-sentence-bank \.prompt-card\.has-prompt-control \.prompt-content-row\s*\{[^}]*padding-left:\s*0\.04rem;[^}]*padding-right:\s*2\.04rem;/s);
  assert.match(styles, /@media \(max-width: 767px\)\s*\{[\s\S]*?\.lesson-shell\.mode-sentence-bank \.prompt-text\s*\{[^}]*max-width:\s*min\(100%,\s*34ch\);[^}]*font-size:\s*clamp\(1\.34rem,\s*5\.9vw,\s*1\.66rem\);/s);
  assert.match(styles, /@media \(max-width: 767px\)\s*\{[\s\S]*?\.lesson-shell\.mode-sentence-bank \.lesson-footer\s*\{[^}]*bottom:\s*calc\(4\.05rem \+ env\(safe-area-inset-bottom\)\);[^}]*gap:\s*0\.34rem;/s);
  assert.match(styles, /@media \(max-width: 767px\)\s*\{[\s\S]*?\.lesson-shell\.mode-sentence-bank \.feedback-tray\s*\{[^}]*padding:\s*0\.52rem 0\.66rem 0\.58rem;/s);
  assert.match(styles, /@media \(max-width: 767px\)\s*\{[\s\S]*?\.lesson-shell\.mode-sentence-bank \.next-btn\s*\{[^}]*min-height:\s*50px;[^}]*font-size:\s*0\.96rem;/s);
});

test("sentence builder short mobile breakpoint adds an extra compaction step", () => {
  const styles = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");

  assert.match(styles, /@media \(max-width: 767px\) and \(max-height: 760px\)\s*\{[\s\S]*?\.lesson-shell\.mode-sentence-bank \.prompt-content-row\s*\{[^}]*min-height:\s*2\.9rem;[^}]*padding-left:\s*0\.02rem;[^}]*padding-right:\s*0\.02rem;/s);
  assert.match(styles, /@media \(max-width: 767px\) and \(max-height: 760px\)\s*\{[\s\S]*?\.lesson-shell\.mode-sentence-bank \.prompt-card\.has-prompt-control \.prompt-content-row\s*\{[^}]*padding-left:\s*0\.02rem;[^}]*padding-right:\s*1\.9rem;/s);
  assert.match(styles, /@media \(max-width: 767px\) and \(max-height: 760px\)\s*\{[\s\S]*?\.lesson-shell\.mode-sentence-bank \.prompt-text\s*\{[^}]*max-width:\s*min\(100%,\s*32ch\);[^}]*font-size:\s*clamp\(1\.24rem,\s*5\.3vw,\s*1\.48rem\);/s);
  assert.match(styles, /@media \(max-width: 767px\) and \(max-height: 760px\)\s*\{[\s\S]*?\.lesson-shell\.mode-sentence-bank \.sentence-token\s*\{[^}]*min-height:\s*36px;[^}]*padding:\s*0\.28rem 0\.56rem;[^}]*border-radius:\s*11px;[^}]*font-size:\s*0\.86rem;/s);
  assert.match(styles, /@media \(max-width: 767px\) and \(max-height: 760px\)\s*\{[\s\S]*?\.lesson-shell\.mode-sentence-bank \.feedback-tray\s*\{[^}]*padding:\s*0\.46rem 0\.6rem 0\.5rem;/s);
  assert.match(styles, /@media \(max-width: 767px\) and \(max-height: 760px\)\s*\{[\s\S]*?\.lesson-shell\.mode-sentence-bank \.next-btn\s*\{[^}]*min-height:\s*46px;[^}]*font-size:\s*0\.92rem;/s);
});

test("gameplay header styling uses a warm progress bar and a top-right status pill", () => {
  const styles = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");
  const markup = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

  assert.match(markup, /class="shell-topbar-actions"[\s\S]*id="shellGameplayPill"[\s\S]*id="shellHomeBtn"/s);
  assert.match(styles, /\.shell-topbar-actions\s*\{[^}]*display:\s*inline-flex;[^}]*justify-content:\s*flex-end;[^}]*direction:\s*ltr;/s);
  assert.match(styles, /\.shell-topbar-home\s*\{[^}]*min-width:\s*2\.62rem;[^}]*min-height:\s*2\.62rem;[^}]*font-size:\s*1\.05rem;/s);
  assert.match(styles, /body\[data-ui-lang="he"\] \.shell-topbar-actions\s*\{[^}]*flex-direction:\s*row-reverse;/s);
  assert.match(styles, /\.shell-gameplay-pill\s*\{[^}]*padding:\s*0\.46rem 0\.78rem;[^}]*border-radius:\s*999px;/s);
  assert.match(styles, /\.progress-strip\s*\{[^}]*height:\s*13px;[^}]*border:\s*1px solid rgba\(240,\s*171,\s*49,\s*0\.2\);/s);
  assert.match(styles, /\.progress-fill\s*\{[^}]*background:\s*linear-gradient\(90deg,\s*#7d1812 0%,\s*#b72a14 34%,\s*#e05a18 68%,\s*#f2a22d 88%,\s*#f6d15d 100%\);/s);
  assert.match(styles, /\.progress-fill::after\s*\{[^}]*background:\s*radial-gradient\(circle at 28% 50%,[^}]*#f8d35d 40%/s);
  assert.match(styles, /\.progress-strip\[data-streak-tier="4"\] \.progress-fill,\s*\.progress-fill\[data-streak-tier="4"\]\s*\{[^}]*brightness\(1\.21\)[^}]*0 0 42px rgba\(248,\s*211,\s*93,\s*0\.3\);/s);
});

test("desktop layout uses three live columns and drops the old sidebar", () => {
  const styles = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");
  const markup = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

  assert.doesNotMatch(markup, /class="desktop-nav\b/);
  assert.match(styles, /@media \(min-width: 1024px\)\s*\{[\s\S]*?body\[data-desktop-hub-layout="true"\] \.page-stack\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\) minmax\(0,\s*1fr\) minmax\(290px,\s*0\.74fr\);/s);
  assert.match(styles, /@media \(min-width: 1024px\)\s*\{[\s\S]*?body\[data-ui-lang="he"\]\[data-desktop-hub-layout="true"\] \.page-stack\s*\{[^}]*grid-template-columns:\s*minmax\(290px,\s*0\.74fr\) minmax\(0,\s*1fr\) minmax\(0,\s*1fr\);/s);
  assert.match(styles, /@media \(min-width: 1024px\)\s*\{[\s\S]*?body\[data-desktop-hub-layout="true"\] #reviewView\s*\{[^}]*order:\s*1;/s);
  assert.match(styles, /@media \(min-width: 1024px\)\s*\{[\s\S]*?body\[data-desktop-hub-layout="true"\] #homeView\s*\{[^}]*order:\s*2;/s);
  assert.match(styles, /@media \(min-width: 1024px\)\s*\{[\s\S]*?body\[data-desktop-hub-layout="true"\] #resultsView\s*\{[^}]*order:\s*2;/s);
  assert.match(styles, /@media \(min-width: 1024px\)\s*\{[\s\S]*?body\[data-desktop-hub-layout="true"\] #settingsView\s*\{[^}]*order:\s*3;/s);
  assert.match(styles, /@media \(min-width: 1024px\)\s*\{[\s\S]*?body\[data-desktop-hub-layout="true"\] \.review-grid\s*\{[^}]*grid-template-columns:\s*1fr;/s);
  assert.match(styles, /@media \(min-width: 1024px\)\s*\{[\s\S]*?body\[data-desktop-hub-layout="true"\] #resultsView\.active\s*\{[^}]*grid-column:\s*auto;/s);
});

test("desktop review and settings cards use centered collapsible headers", () => {
  const styles = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");
  const markup = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

  assert.match(markup, /id="reviewPanelToggle"[\s\S]*aria-controls="reviewPanel"/s);
  assert.doesNotMatch(markup, /id="mostMissedToggle"/);
  assert.doesNotMatch(markup, /id="reviewAnalyticsToggle"/);
  assert.match(markup, /id="settingsToggle"[\s\S]*aria-controls="settingsPanel"/s);
  assert.match(markup, /class="review-section-title"[^>]*data-i18n="missed.title"/s);
  assert.match(markup, /class="review-section-title"[^>]*data-i18n="review.analyticsEyebrow"/s);
  assert.match(styles, /\.collapsible-toggle\s*\{[^}]*width:\s*100%;[^}]*text-align:\s*center;/s);
  assert.match(styles, /\.review-section-title\s*\{[^}]*text-align:\s*center;/s);
  assert.match(styles, /@media \(min-width: 1024px\)\s*\{[\s\S]*?body\[data-desktop-hub-layout="true"\] \.collapsible-card\[data-collapsed="true"\] \.collapsible-content\s*\{[^}]*display:\s*none;/s);
});

test("Hebrew progress bars fill from right to left", () => {
  const styles = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");

  assert.match(styles, /body\[data-ui-lang="he"\] \.progress-fill\s*\{[^}]*margin-left:\s*auto;[^}]*margin-right:\s*0;[^}]*background:\s*linear-gradient\(270deg,\s*#7d1812 0%,\s*#b72a14 34%,\s*#e05a18 68%,\s*#f2a22d 88%,\s*#f6d15d 100%\);/s);
  assert.match(styles, /body\[data-ui-lang="he"\] \.progress-fill::after\s*\{[^}]*left:\s*-1px;[^}]*circle at 72% 50%/s);
});

test("sentence builder uses compact phrase chips instead of prefilled english glue", () => {
  const sentenceBank = [
    {
      id: "sb-streamlined-english",
      category: "colloquial",
      difficulty: 2,
      english: "I don't have energy for this right now, we'll talk later.",
      hebrew: "אין לי כוח לזה עכשיו, נדבר אחר כך.",
      english_tokens: ["I", "don't", "have", "energy", "for this", "right now", "we'll", "talk", "later"],
      hebrew_tokens: ["אין", "לי", "כוח", "לזה", "עכשיו", "נדבר", "אחר", "כך"],
      english_distractors: ["more time", "tomorrow morning", "never"],
      hebrew_distractors: ["יש", "מחר", "דיברנו"],
      notes: "",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "he2en")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  assert.equal(getSentenceSlots(document).length, 9);
  assert.deepEqual(getSentenceStaticWordChunks(document), []);
  assert.ok(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "for this"));
  assert.ok(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "right now"));

  fillSentenceAnswerByTap(document, ["I", "don't", "have", "energy", "for this", "right now", "we'll", "talk", "later"]);
  document.querySelector("#nextBtn").click();

  assert.match(getFeedbackText(document), /^Correct\. The English sentence is I don't have energy for this right now, we'll talk later\./);
});

test("sentence builder renders formal predicate phrases like is based on as a single chip", () => {
  const sentenceBank = [
    {
      id: "sb-based-on-phrase",
      category: "formal",
      difficulty: 3,
      english: "The analysis is based on several assumptions, which may not be accurate.",
      hebrew: "הניתוח מבוסס על מספר הנחות יסוד, שייתכן שאינן מדויקות.",
      english_tokens: ["The analysis", "is based on", "several assumptions", "which", "may not be", "accurate"],
      hebrew_tokens: ["הניתוח", "מבוסס", "על", "מספר", "הנחות", "יסוד", "שייתכן", "שאינן", "מדויקות"],
      english_distractors: ["The research", "depends on", "many assumptions"],
      hebrew_distractors: ["המחקר", "תלוי", "מוכחות"],
      notes: "",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "he2en")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  assert.equal(getSentenceSlots(document).length, 6);
  assert.deepEqual(getSentenceStaticWordChunks(document), []);
  assert.ok(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "is based on"));
  assert.equal(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "is"), undefined);
  assert.equal(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "based"), undefined);
  assert.equal(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "on"), undefined);
});

test("sentence builder keeps right now as a single colloquial chip", () => {
  const sentenceBank = [
    {
      id: "sb-right-now-phrase",
      category: "colloquial",
      difficulty: 2,
      english: "Are you serious right now? That sounds completely ridiculous to me.",
      hebrew: "אתה רציני עכשיו? זה נשמע לי הזוי לגמרי.",
      english_tokens: ["Are you", "serious", "right now", "That sounds", "completely ridiculous", "to me"],
      hebrew_tokens: ["אתה", "רציני", "עכשיו", "זה", "נשמע", "לי", "הזוי", "לגמרי"],
      english_distractors: ["You look", "slightly weird", "totally normal"],
      hebrew_distractors: ["נראה", "קצת", "נורמלי"],
      notes: "",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "he2en")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  assert.deepEqual(getSentenceStaticWordChunks(document), []);
  assert.ok(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "right now"));
  assert.equal(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "right"), undefined);
  assert.equal(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "now"), undefined);
});

test("sentence builder renders request scaffolds like Can we get as one option while keeping the row blank", () => {
  const sentenceBank = [
    {
      id: "sb-can-we-get-phrase",
      category: "professional",
      difficulty: 2,
      english: "Can we get clarification on this matter? It's not entirely clear.",
      hebrew: "אפשר לקבל הבהרה בנושא הזה? זה לא לגמרי ברור.",
      english_tokens: ["Can we get", "clarification", "on this matter", "It's not", "entirely clear"],
      hebrew_tokens: ["אפשר", "לקבל", "הבהרה", "בנושא", "הזה", "זה", "לא", "לגמרי", "ברור"],
      english_distractors: ["quick summary", "about that", "fully understood"],
      hebrew_distractors: ["הסבר", "על", "מובן"],
      notes: "",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "he2en")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  assert.equal(getSentenceSlots(document).length, 5);
  assert.deepEqual(getSentenceStaticWordChunks(document), []);
  assert.ok(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "Can we get"));
  assert.ok(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "It's not"));
  assert.equal(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "Can"), undefined);
});

test("sentence builder renders Hebrew meal compounds as one chip with shape-matched distractors", () => {
  const sentenceBank = [
    {
      id: "sb-hebrew-meal-compound",
      category: "everyday",
      difficulty: 1,
      english: "I want to plan dinner.",
      hebrew: "אני רוצה לתכנן ארוחת ערב.",
      english_tokens: ["I want", "to plan", "dinner"],
      hebrew_tokens: ["אני", "רוצה", "לתכנן", "ארוחת ערב"],
      english_distractors: ["need to cook", "lunch plans", "breakfast"],
      hebrew_distractors: ["ארוחת צהריים", "ארוחת בוקר", "צריך"],
      notes: "",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "en2he")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  assert.equal(getSentenceSlots(document).length, 4);
  assert.ok(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "ארוחת ערב"));
  assert.ok(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "ארוחת צהריים"));
  assert.ok(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "ארוחת בוקר"));
  assert.equal(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "ארוחת"), undefined);
  assert.equal(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "ערב"), undefined);
});

test("sentence builder attaches punctuation to the preceding answer chunk so commas do not hang alone", () => {
  const sentenceBank = [
    {
      id: "sb-inline-punctuation",
      category: "everyday",
      difficulty: 1,
      english: "I'm running a few minutes late, I'm already on my way.",
      hebrew: "אני מאחר בכמה דקות, כבר יוצא לדרך.",
      english_tokens: ["I'm", "running", "a", "few", "minutes", "late", "I'm", "on", "my", "way"],
      hebrew_tokens: ["אני", "מאחר", "בכמה", "דקות", "כבר", "יוצא", "לדרך"],
      english_distractors: ["hours", "returning", "still"],
      hebrew_distractors: ["שעות", "חוזר", "עוד"],
      notes: "",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "he2en")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  const answerLine = document.querySelector("#choiceContainer").querySelector(".sentence-answer-line");
  const topLevelStaticTexts = answerLine.children
    .filter((child) => child.classList.contains("sentence-static"))
    .map((child) => child.textContent);
  const attachedSuffixes = answerLine.querySelectorAll(".sentence-static-attached").map((child) => child.textContent);

  assert.equal(topLevelStaticTexts.includes(", "), false);
  assert.equal(topLevelStaticTexts.includes("."), false);
  assert.deepEqual(attachedSuffixes, [", ", "."]);
});

test("sentence builder keeps article-based english prompts fully blank by compacting phrase chips", () => {
  const sentenceBank = [
    {
      id: "sb-article-phrase",
      category: "everyday",
      difficulty: 1,
      english: "The soap ran out, we need to buy more.",
      hebrew: "נגמר הסבון, צריך לקנות.",
      english_tokens: ["The soap", "ran out", "we need", "to buy", "more"],
      hebrew_tokens: ["נגמר", "הסבון", "צריך", "לקנות"],
      english_distractors: ["hair gel", "shampoo bottle", "we want"],
      hebrew_distractors: ["נשאר", "השמפו", "רוצים"],
      notes: "",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "he2en")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  assert.equal(getSentenceSlots(document).length, 5);
  assert.deepEqual(getSentenceStaticWordChunks(document), []);
  assert.ok(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "The soap"));
  assert.ok(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "we need"));
  assert.ok(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "to buy"));
});

test("sentence builder keeps fused-form english prompts fully blank by compacting phrase chips", () => {
  const sentenceBank = [
    {
      id: "sb-restored-alignment",
      category: "formal",
      difficulty: 3,
      english: "It can be inferred from this that the model is not stable under certain conditions.",
      hebrew: "ניתן להסיק מכך כי המודל אינו יציב בתנאים מסוימים.",
      english_tokens: ["It", "can", "be", "inferred", "from this", "that", "the", "model", "is", "not", "stable", "under", "certain", "conditions"],
      hebrew_tokens: ["ניתן", "להסיק", "מכך", "כי", "המודל", "אינו", "יציב", "בתנאים", "מסוימים"],
      english_distractors: ["can see", "look at", "fully accurate"],
      hebrew_distractors: ["אפשר", "לראות", "מדויק"],
      notes: "",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "he2en")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  assert.equal(getSentenceSlots(document).length, 14);
  assert.deepEqual(getSentenceStaticWordChunks(document), []);
  assert.ok(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "from this"));
});

test("sentence builder lets you drag into any blank and still supports tap-to-place fallback", () => {
  const sentenceBank = [
    {
      id: "sb-drag",
      category: "everyday",
      difficulty: 1,
      english: "We will see you tomorrow.",
      hebrew: "נראה אותך מחר.",
      english_tokens: ["We", "will", "see", "you", "tomorrow"],
      hebrew_tokens: ["נראה", "אותך", "מחר"],
      english_distractors: ["later", "them"],
      hebrew_distractors: ["עכשיו", "אותם"],
      notes: "",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "he2en")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  dragSentenceTokenToSlot(document, "tomorrow", 4);
  dragSentenceTokenToSlot(document, "We", 0);
  placeSentenceTokenByTap(document, "will", 1);
  placeSentenceTokenByTap(document, "see", 2);
  placeSentenceTokenByTap(document, "you", 3);

  assert.equal(
    JSON.stringify(Array.from(state.sentenceBank.currentQuestion.slotTokenIds)),
    JSON.stringify([
      "answer-0",
      "answer-1",
      "answer-2",
      "answer-3",
      "answer-4",
    ])
  );
  assert.equal(document.querySelector("#nextBtn").disabled, false);
});

test("sentence builder supports touch dragging on mobile/tablet layouts", () => {
  const sentenceBank = [
    {
      id: "sb-touch-drag",
      category: "everyday",
      difficulty: 1,
      english: "We will see you tomorrow.",
      hebrew: "נראה אותך מחר.",
      english_tokens: ["We", "will", "see", "you", "tomorrow"],
      hebrew_tokens: ["נראה", "אותך", "מחר"],
      english_distractors: ["later", "them"],
      hebrew_distractors: ["עכשיו", "אותם"],
      notes: "",
    },
  ];
  const harness = loadAppHarness([], [], [], { innerWidth: 768, sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "he2en")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  touchDragSentenceTokenToSlot(document, "tomorrow", 4);
  touchDragSentenceTokenToSlot(document, "We", 0);

  assert.equal(
    JSON.stringify(Array.from(state.sentenceBank.currentQuestion.slotTokenIds)),
    JSON.stringify([
      "answer-0",
      "",
      "",
      "",
      "answer-4",
    ])
  );
  assert.equal(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "We"), undefined);
  assert.equal(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "tomorrow"), undefined);
});

test("sentence builder contracts the bank after a word is used instead of keeping placeholders", () => {
  const sentenceBank = [
    {
      id: "sb-contracting-bank",
      category: "everyday",
      difficulty: 1,
      english: "We will see you tomorrow.",
      hebrew: "נראה אותך מחר.",
      english_tokens: ["We", "will", "see", "you", "tomorrow"],
      hebrew_tokens: ["נראה", "אותך", "מחר"],
      english_distractors: ["later", "them"],
      hebrew_distractors: ["עכשיו", "אותם"],
      notes: "",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "he2en")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  const initialButtons = document.querySelector("#choiceContainer").querySelectorAll(".sentence-token");
  assert.equal(initialButtons.length, 7);

  placeSentenceTokenByTap(document, "We", 0);

  const bankButtons = document.querySelector("#choiceContainer").querySelectorAll(".sentence-token");
  assert.equal(bankButtons.length, 6);
  assert.equal(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "We"), undefined);
});

test("sentence builder inserts a dragged bank word into an occupied slot and shifts later words right", () => {
  const sentenceBank = [
    {
      id: "sb-insert-bank-into-occupied",
      category: "everyday",
      difficulty: 1,
      english: "We will see you tomorrow.",
      hebrew: "נראה אותך מחר.",
      english_tokens: ["We", "will", "see", "you", "tomorrow"],
      hebrew_tokens: ["נראה", "אותך", "מחר"],
      english_distractors: ["later", "them"],
      hebrew_distractors: ["עכשיו", "אותם"],
      notes: "",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "he2en")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  placeSentenceTokenByTap(document, "We", 0);
  placeSentenceTokenByTap(document, "will", 1);
  dragSentenceTokenToSlot(document, "tomorrow", 4);
  dragSentenceTokenToSlot(document, "see", 1);

  assert.equal(
    JSON.stringify(Array.from(state.sentenceBank.currentQuestion.slotTokenIds)),
    JSON.stringify([
      "answer-0",
      "answer-2",
      "answer-1",
      "",
      "answer-4",
    ])
  );
  assert.deepEqual(getSentenceSlotTexts(document), ["We", "see", "will", "", "tomorrow"]);
});

test("sentence builder returns the last word to the bank when an occupied-slot insert happens on a full row", () => {
  const sentenceBank = [
    {
      id: "sb-insert-full-overflow",
      category: "everyday",
      difficulty: 1,
      english: "We will see you tomorrow.",
      hebrew: "נראה אותך מחר.",
      english_tokens: ["We", "will", "see", "you", "tomorrow"],
      hebrew_tokens: ["נראה", "אותך", "מחר"],
      english_distractors: ["later", "them"],
      hebrew_distractors: ["עכשיו", "אותם"],
      notes: "",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "he2en")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  fillSentenceAnswerByTap(document, ["We", "will", "see", "you", "tomorrow"]);
  dragSentenceTokenToSlot(document, "later", 1);

  assert.deepEqual(getSentenceSlotTexts(document), ["We", "later", "will", "see", "you"]);
  assert.ok(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "tomorrow"));
  assert.equal(document.querySelector("#nextBtn").disabled, false);
});

test("sentence builder inserts a dragged placed word into an occupied slot without collapsing earlier gaps", () => {
  const sentenceBank = [
    {
      id: "sb-insert-moved-word",
      category: "everyday",
      difficulty: 1,
      english: "We will see you tomorrow.",
      hebrew: "נראה אותך מחר.",
      english_tokens: ["We", "will", "see", "you", "tomorrow"],
      hebrew_tokens: ["נראה", "אותך", "מחר"],
      english_distractors: ["later", "them"],
      hebrew_distractors: ["עכשיו", "אותם"],
      notes: "",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "he2en")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  placeSentenceTokenByTap(document, "We", 0);
  placeSentenceTokenByTap(document, "will", 2);
  placeSentenceTokenByTap(document, "see", 3);
  placeSentenceTokenByTap(document, "tomorrow", 4);
  dragPlacedSentenceToken(document, 4, 2);

  assert.equal(
    JSON.stringify(Array.from(state.sentenceBank.currentQuestion.slotTokenIds)),
    JSON.stringify([
      "answer-0",
      "",
      "answer-4",
      "answer-1",
      "answer-2",
    ])
  );
  assert.deepEqual(getSentenceSlotTexts(document), ["We", "", "tomorrow", "will", "see"]);
});

test("sentence builder lets you tap a word to fill the next empty line", () => {
  const sentenceBank = [
    {
      id: "sb-next-empty-tap",
      category: "everyday",
      difficulty: 1,
      english: "We will see you tomorrow.",
      hebrew: "נראה אותך מחר.",
      english_tokens: ["We", "will", "see", "you", "tomorrow"],
      hebrew_tokens: ["נראה", "אותך", "מחר"],
      english_distractors: ["later", "them"],
      hebrew_distractors: ["עכשיו", "אותם"],
      notes: "",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "he2en")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  dragSentenceTokenToSlot(document, "tomorrow", 4);
  placeSentenceTokenInNextEmptySlotByTap(document, "We");
  placeSentenceTokenInNextEmptySlotByTap(document, "will");
  placeSentenceTokenInNextEmptySlotByTap(document, "see");
  placeSentenceTokenInNextEmptySlotByTap(document, "you");

  assert.equal(
    JSON.stringify(Array.from(state.sentenceBank.currentQuestion.slotTokenIds)),
    JSON.stringify([
      "answer-0",
      "answer-1",
      "answer-2",
      "answer-3",
      "answer-4",
    ])
  );
  assert.equal(document.querySelector("#nextBtn").disabled, false);
});

test("sentence builder keyboard flow can select a bank word and insert it into an occupied slot", () => {
  const sentenceBank = [
    {
      id: "sb-keyboard-insert",
      category: "everyday",
      difficulty: 1,
      english: "We will see you tomorrow.",
      hebrew: "נראה אותך מחר.",
      english_tokens: ["We", "will", "see", "you", "tomorrow"],
      hebrew_tokens: ["נראה", "אותך", "מחר"],
      english_distractors: ["later", "them"],
      hebrew_distractors: ["עכשיו", "אותם"],
      notes: "",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "he2en")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  placeSentenceTokenByTap(document, "We", 0);
  placeSentenceTokenByTap(document, "will", 1);
  dragSentenceTokenToSlot(document, "tomorrow", 4);

  pressKey(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "see"), " ");
  assert.equal(state.sentenceBank.currentQuestion.selectedBankTokenId, "answer-2");

  pressKey(getSentenceSlots(document)[1], "Enter");

  assert.equal(state.sentenceBank.currentQuestion.selectedBankTokenId, "");
  assert.deepEqual(getSentenceSlotTexts(document), ["We", "see", "will", "", "tomorrow"]);
});

test("sentence builder keyboard flow removes filled slots and clears selection", () => {
  const sentenceBank = [
    {
      id: "sb-keyboard-remove-escape",
      category: "everyday",
      difficulty: 1,
      english: "We will see you tomorrow.",
      hebrew: "נראה אותך מחר.",
      english_tokens: ["We", "will", "see", "you", "tomorrow"],
      hebrew_tokens: ["נראה", "אותך", "מחר"],
      english_distractors: ["later", "them"],
      hebrew_distractors: ["עכשיו", "אותם"],
      notes: "",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "he2en")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  placeSentenceTokenByTap(document, "We", 0);
  pressKey(getSentenceSlots(document)[0], "Backspace");
  assert.deepEqual(getSentenceSlotTexts(document), ["", "", "", "", ""]);

  pressKey(findVisibleButtonByText(document.querySelector("#choiceContainer"), ".sentence-token", "see"), " ");
  assert.equal(state.sentenceBank.currentQuestion.selectedBankTokenId, "answer-2");
  pressKey(getSentenceSlots(document)[0], "Escape");
  assert.equal(state.sentenceBank.currentQuestion.selectedBankTokenId, "");
});

test("sentence builder filters exact-synonym distractors from the prepared deck", () => {
  const harness = loadAppHarness([]);
  const deck = harness.app.sentenceBank.prepareSentenceBankDeck([
    {
      id: "sb-synonym-filter",
      category: "test",
      difficulty: 2,
      english: "But how accurate?",
      hebrew: "אך כיצד מדויקות",
      english_tokens: ["but", "how", "accurate"],
      hebrew_tokens: ["אך", "כיצד", "מדויקות"],
      english_distractors: ["however", "why", "correct", "reliable"],
      hebrew_distractors: ["אבל", "מדוע", "איך", "נכונות", "מוכחות"],
      notes: "",
    },
  ]);

  assert.deepEqual(deck[0].englishDistractors, ["why", "reliable"]);
  assert.deepEqual(deck[0].hebrewDistractors, ["מדוע", "מוכחות"]);
});

test("sentence builder filters about/on distractors as too close to be fair", () => {
  const harness = loadAppHarness([]);
  const deck = harness.app.sentenceBank.prepareSentenceBankDeck([
    {
      id: "sb-about-on-filter",
      category: "formal",
      difficulty: 2,
      english: "Can we get clarification on this matter?",
      hebrew: "אפשר לקבל הבהרה בנושא הזה?",
      english_tokens: ["Can", "we", "get", "clarification", "on", "this", "matter"],
      hebrew_tokens: ["אפשר", "לקבל", "הבהרה", "בנושא", "הזה"],
      english_distractors: ["about", "explanation", "that"],
      hebrew_distractors: ["על", "הסבר", "ההוא"],
      notes: "",
    },
  ]);

  assert.deepEqual(deck[0].englishDistractors, ["explanation", "that"]);
  assert.deepEqual(deck[0].hebrewDistractors, ["על", "הסבר", "ההוא"]);
});

test("sentence builder filters hold on/wait up distractors as too close to be fair", () => {
  const harness = loadAppHarness([]);
  const deck = harness.app.sentenceBank.prepareSentenceBankDeck([
    {
      id: "sb-hold-on-wait-up-filter",
      category: "colloquial",
      difficulty: 1,
      english: "Bro hold on, I'll get back to you in a sec.",
      hebrew: "אחי חכה, אני אענה לך בעוד שנייה.",
      english_tokens: ["Bro", "hold on", "I'll get back", "to you", "in a sec"],
      hebrew_tokens: ["אחי", "חכה", "אני אענה", "לך", "בעוד שנייה"],
      english_distractors: ["wait up", "my friend", "right now"],
      hebrew_distractors: ["חבר שלי", "כרגע", "עוד מעט"],
      notes: "",
    },
  ]);

  assert.deepEqual(deck[0].englishDistractors, ["my friend", "right now"]);
  assert.deepEqual(deck[0].hebrewDistractors, ["חבר שלי", "כרגע", "עוד מעט"]);
});

test("sentence builder accepts a Hebrew here/very swap when the meaning stays the same", () => {
  const sentenceBank = [
    {
      id: "sb-hot-here",
      category: "everyday",
      difficulty: 1,
      english: "Can you open the window? It's very hot here.",
      hebrew: "אפשר לפתוח את החלון? חם כאן מאוד.",
      english_tokens: ["Can", "you", "open", "the", "window", "It's", "very", "hot", "here"],
      hebrew_tokens: ["אפשר", "לפתוח", "את", "החלון", "חם", "כאן", "מאוד"],
      english_distractors: ["close", "door", "cold"],
      hebrew_distractors: ["לסגור", "הדלת", "קר"],
      notes: "",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "en2he")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  fillSentenceAnswerByTap(document, ["אפשר", "לפתוח", "את", "החלון", "חם", "מאוד", "כאן"]);
  document.querySelector("#nextBtn").click();

  assert.equal(state.sessionScore, 2);
  assert.match(getFeedbackText(document), /^Correct\. The Hebrew sentence is אפשר לפתוח את החלון\? חם כאן מאוד\./);
  assert.ok(getSentenceSlots(document).every((slot) => slot.classList.contains("correct") && !slot.classList.contains("wrong")));
});

test("sentence builder accepts a Hebrew degree-word swap when the meaning stays the same", () => {
  const sentenceBank = [
    {
      id: "sb-not-clear",
      category: "professional",
      difficulty: 2,
      english: "It's not entirely clear.",
      hebrew: "זה לא לגמרי ברור.",
      english_tokens: ["It's", "not", "entirely", "clear"],
      hebrew_tokens: ["זה", "לא", "לגמרי", "ברור"],
      english_distractors: ["fully", "understood"],
      hebrew_distractors: ["מאוד", "מובן"],
      notes: "",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "en2he")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  fillSentenceAnswerByTap(document, ["זה", "לא", "ברור", "לגמרי"]);
  document.querySelector("#nextBtn").click();

  assert.equal(state.sessionScore, 3);
  assert.match(getFeedbackText(document), /^Correct\. The Hebrew sentence is זה לא לגמרי ברור\./);
  assert.ok(getSentenceSlots(document).every((slot) => slot.classList.contains("correct") && !slot.classList.contains("wrong")));
});

test("sentence builder wrong answers enqueue review in the same direction without awarding review score", async () => {
  const sentenceBank = [
    {
      id: "sb-review",
      category: "everyday",
      difficulty: 1,
      english: "See you later.",
      hebrew: "נתראה אחר כך.",
      english_tokens: ["See", "you", "later"],
      hebrew_tokens: ["נתראה", "אחר", "כך"],
      english_distractors: ["now", "tomorrow", "again"],
      hebrew_distractors: ["היום", "עוד", "שם"],
      notes: "A casual goodbye for now.",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "he2en")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  placeSentenceTokenByTap(document, "later", 0);
  placeSentenceTokenByTap(document, "you", 1);
  placeSentenceTokenByTap(document, "See", 2);
  document.querySelector("#nextBtn").click();

  assert.equal(state.sessionScore, 0);
  assert.equal(state.sentenceBank.wrongAnswers, 1);
  assert.equal(JSON.stringify(state.sentenceBank.reviewQueue), JSON.stringify([{ sentenceId: "sb-review", direction: "he2en" }]));
  assert.match(getFeedbackText(document), /Not quite\. The English sentence is See you later\./);

  harness.nextSentenceBankQuestion();
  await waitForTimers();
  if (state.sentenceBank.introActive) {
    harness.app.sentenceBank.beginSentenceBankFromIntro();
  }

  assert.equal(state.sentenceBank.currentQuestion.isReview, true);
  assert.equal(state.sentenceBank.currentQuestion.direction, "he2en");
  fillSentenceAnswerByTap(document, ["See", "you", "later"]);
  document.querySelector("#nextBtn").click();

  assert.equal(state.sessionScore, 0);
  assert.equal(state.sentenceProgress["sb-review::he2en"].attempts, 2);
  assert.equal(state.sentenceProgress["sb-review::he2en"].correct, 1);
  assert.equal(state.sentenceProgress["sb-review::he2en"].misses, 1);
});

test("sentence builder accepts an alternate Hebrew speaker-gender form when the English leaves it unspecified", () => {
  const sentenceBank = [
    {
      id: "sb-gender-alt",
      category: "colloquial",
      difficulty: 3,
      english: "She did something shady to me, I don't trust her anymore.",
      hebrew: "היא עשתה לי קטע מסריח, אני לא סומך עליה יותר.",
      hebrew_alternates: [
        {
          text: "היא עשתה לי קטע מסריח, אני לא סומכת עליה יותר.",
          tokens: ["היא", "עשתה", "לי", "קטע", "מסריח", "אני", "לא", "סומכת", "עליה", "יותר"],
        },
      ],
      english_tokens: ["She", "did", "something", "shady", "to", "me", "I", "don't", "trust", "her", "anymore"],
      hebrew_tokens: ["היא", "עשתה", "לי", "קטע", "מסריח", "אני", "לא", "סומך", "עליה", "יותר"],
      english_distractors: ["he", "him", "nice"],
      hebrew_distractors: ["הוא", "עשה", "סומכת"],
      notes: "",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "en2he")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  fillSentenceAnswerByTap(document, ["היא", "עשתה", "לי", "קטע", "מסריח", "אני", "לא", "סומכת", "עליה", "יותר"]);
  document.querySelector("#nextBtn").click();

  assert.equal(state.sessionScore, 4);
  assert.match(getFeedbackText(document), /^Correct\. The Hebrew sentence is היא עשתה לי קטע מסריח, אני לא סומכת עליה יותר\./);
  assert.ok(getSentenceSlots(document).every((slot) => slot.classList.contains("correct") && !slot.classList.contains("wrong")));
});

test("sentence builder keeps מוצאי שבת split and accepts both כאילו orders", () => {
  const sentenceBank = [
    {
      id: "sb-motzash",
      category: "everyday",
      difficulty: 2,
      english: "He texted me Saturday night as if nothing happened.",
      hebrew: "הוא שלח לי הודעה במוצאי שבת כאילו לא קרה כלום.",
      hebrew_alternates: [
        {
          text: "הוא שלח לי הודעה במוצאי שבת כאילו כלום לא קרה.",
          tokens: ["הוא", "שלח", "לי", "הודעה", "במוצאי", "שבת", "כאילו", "כלום", "לא קרה"],
        },
      ],
      english_tokens: ["He", "texted", "me", "Saturday", "night", "as if", "nothing", "happened"],
      hebrew_tokens: ["הוא", "שלח", "לי", "הודעה", "במוצאי", "שבת", "כאילו", "לא קרה", "כלום"],
      english_distractors: ["called", "Friday", "morning"],
      hebrew_distractors: ["בלילה", "מחר", "אחרי"],
      notes: "",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "en2he")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  assert.ok(Array.from(state.sentenceBank.currentQuestion.targetTokens).includes("במוצאי"));
  assert.ok(Array.from(state.sentenceBank.currentQuestion.targetTokens).includes("שבת"));
  assert.equal(Array.from(state.sentenceBank.currentQuestion.targetTokens).includes("מוצאי שבת"), false);
  assert.ok(Array.from(state.sentenceBank.currentQuestion.bankTokens).some((token) => token.text === "בלילה"));

  fillSentenceAnswerByTap(document, ["הוא", "שלח", "לי", "הודעה", "במוצאי", "שבת", "כאילו", "כלום", "לא קרה"]);
  document.querySelector("#nextBtn").click();

  assert.equal(state.sessionScore, 3);
  assert.match(getFeedbackText(document), /^Correct\. The Hebrew sentence is הוא שלח לי הודעה במוצאי שבת כאילו כלום לא קרה\./);
});

test("sentence builder removes and moves placed words without collapsing the slot layout", () => {
  const sentenceBank = [
    {
      id: "sb-move",
      category: "everyday",
      difficulty: 1,
      english: "See you soon.",
      hebrew: "נתראה בקרוב.",
      english_tokens: ["See", "you", "soon"],
      hebrew_tokens: ["נתראה", "בקרוב"],
      english_distractors: ["later"],
      hebrew_distractors: ["מחר"],
      notes: "",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "he2en")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  dragSentenceTokenToSlot(document, "soon", 2);
  dragSentenceTokenToSlot(document, "See", 0);
  getSentenceSlots(document)[2].click();
  assert.equal(
    JSON.stringify(Array.from(state.sentenceBank.currentQuestion.slotTokenIds)),
    JSON.stringify(["answer-0", "", ""])
  );

  placeSentenceTokenByTap(document, "soon", 2);
  dragPlacedSentenceToken(document, 0, 1);
  assert.equal(
    JSON.stringify(Array.from(state.sentenceBank.currentQuestion.slotTokenIds)),
    JSON.stringify(["", "answer-0", "answer-2"])
  );
});

test("sentence builder restores partially filled non-sequential slots from persisted session state", () => {
  const sentenceBank = [
    {
      id: "sb-restore",
      category: "everyday",
      difficulty: 1,
      english: "I need to buy milk and bread, there's nothing at home.",
      hebrew: "אני צריך לקנות חלב ולחם, אין כלום בבית.",
      english_tokens: ["I", "need", "to", "buy", "milk", "and", "bread", "there's", "nothing", "at", "home"],
      hebrew_tokens: ["אני", "צריך", "לקנות", "חלב", "ולחם", "אין", "כלום", "בבית"],
      english_distractors: ["sell", "everything"],
      hebrew_distractors: ["למכור", "הכל"],
      notes: "",
    },
  ];
  const firstHarness = loadAppHarness([], [], [], { sentenceBank });
  firstHarness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "he2en")?.word || items[0]?.word;
  firstHarness.state.mode = "sentenceBank";
  firstHarness.state.sentenceBank.active = true;
  firstHarness.nextSentenceBankQuestion();

  dragSentenceTokenToSlot(firstHarness.document, "home", 10);
  dragSentenceTokenToSlot(firstHarness.document, "I", 0);
  dragSentenceTokenToSlot(firstHarness.document, "buy", 3);

  const restoredHarness = loadAppHarness([], [], [], {
    sentenceBank,
    localStorageData: firstHarness.localStorage.__dump(),
  });

  assert.equal(restoredHarness.state.mode, "sentenceBank");
  assert.ok(restoredHarness.state.sentenceBank.currentQuestion);
  assert.equal(
    JSON.stringify(Array.from(restoredHarness.state.sentenceBank.currentQuestion.slotTokenIds)),
    JSON.stringify([
      "answer-0",
      "",
      "",
      "answer-3",
      "",
      "",
      "",
      "",
      "",
      "",
      "answer-10",
    ])
  );
});

test("sentence builder drops stale restored questions when the live sentence entry changes", () => {
  const oldSentenceBank = [
    {
      id: "sb-stale",
      category: "colloquial",
      difficulty: 1,
      english: "Wow I saw it, cool. Send me the details",
      hebrew: "וואלה ראיתי, מגניב. שלח לי את הפרטים",
      english_tokens: ["Wow", "I", "saw", "it", "cool", "Send", "me", "the", "details"],
      hebrew_tokens: ["וואלה", "ראיתי", "מגניב", "שלח", "לי", "את", "הפרטים"],
      english_distractors: ["Maybe", "later"],
      hebrew_distractors: ["אולי", "אחר כך"],
      notes: "",
    },
  ];
  const updatedSentenceBank = [
    {
      id: "sb-stale",
      category: "colloquial",
      difficulty: 1,
      english: "Wow, I saw it. Cool. Send me the details.",
      hebrew: "וואלה, ראיתי את זה. מגניב. שלח לי את הפרטים.",
      english_tokens: ["Wow", "I", "saw", "it", "Cool", "Send", "me", "the", "details"],
      hebrew_tokens: ["וואלה", "ראיתי", "את", "זה", "מגניב", "שלח", "לי", "הפרטים"],
      english_distractors: ["Maybe", "later"],
      hebrew_distractors: ["אולי", "אחר כך"],
      notes: "",
    },
  ];

  const firstHarness = loadAppHarness([], [], [], { sentenceBank: oldSentenceBank });
  firstHarness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "en2he")?.word || items[0]?.word;
  firstHarness.state.mode = "sentenceBank";
  firstHarness.state.lastPlayedMode = "sentenceBank";
  firstHarness.state.sentenceBank.active = true;
  firstHarness.nextSentenceBankQuestion();
  firstHarness.app.persistence.persistSessionState();

  assert.equal(firstHarness.state.sentenceBank.currentQuestion.prompt, "Wow I saw it, cool. Send me the details");

  const restoredHarness = loadAppHarness([], [], [], {
    sentenceBank: updatedSentenceBank,
    localStorageData: firstHarness.localStorage.__dump(),
  });

  assert.equal(restoredHarness.state.mode, "lesson");
  assert.equal(restoredHarness.state.route, "home");
  assert.equal(restoredHarness.state.lastPlayedMode, "sentenceBank");
  assert.equal(restoredHarness.state.sentenceBank.active, false);
  assert.equal(restoredHarness.state.sentenceBank.currentQuestion, null);
});

test("lesson restores still recover persisted current questions after sentence restore validation", () => {
  const lessonVocabulary = [
    { id: "lesson-1", category: "core", en: "hello", he: "שלום", heNiqqud: "שָׁלוֹם", utility: 90, source: "test" },
    { id: "lesson-2", category: "core", en: "goodbye", he: "להתראות", heNiqqud: "לְהִתְרָאוֹת", utility: 80, source: "test" },
    { id: "lesson-3", category: "core", en: "thanks", he: "תודה", heNiqqud: "תּוֹדָה", utility: 70, source: "test" },
    { id: "lesson-4", category: "core", en: "please", he: "בבקשה", heNiqqud: "בְּבַקָּשָׁה", utility: 60, source: "test" },
  ];
  const firstHarness = loadAppHarness(lessonVocabulary, [], []);
  firstHarness.app.data.pickBestWord = (pool) => pool.find((word) => word.id === "lesson-1") || pool[0] || null;
  firstHarness.state.mode = "lesson";
  firstHarness.state.lastPlayedMode = "lesson";
  firstHarness.state.lesson.active = true;
  firstHarness.nextQuestion();
  firstHarness.app.persistence.persistSessionState();

  assert.ok(firstHarness.state.currentQuestion);

  const restoredHarness = loadAppHarness(lessonVocabulary, [], [], {
    localStorageData: firstHarness.localStorage.__dump(),
  });

  assert.equal(restoredHarness.state.mode, "lesson");
  assert.equal(restoredHarness.state.route, "home");
  assert.equal(restoredHarness.state.lesson.active, true);
  assert.ok(restoredHarness.state.currentQuestion);
  assert.equal(restoredHarness.state.currentQuestion.prompt, firstHarness.state.currentQuestion.prompt);
});

test("sentence builder hides the translate label while keeping the prompt text and Hebrew speech button", () => {
  const sentenceBank = [
    {
      id: "sb-speech",
      category: "everyday",
      difficulty: 1,
      english: "No problem.",
      hebrew: "אין בעיה.",
      english_tokens: ["No", "problem"],
      hebrew_tokens: ["אין", "בעיה"],
      english_distractors: ["thanks"],
      hebrew_distractors: ["כן"],
      notes: "",
    },
  ];

  const hebrewHarness = loadAppHarness([], [], [], { sentenceBank });
  hebrewHarness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "he2en")?.word || items[0]?.word;
  hebrewHarness.state.mode = "sentenceBank";
  hebrewHarness.state.sentenceBank.active = true;
  hebrewHarness.nextSentenceBankQuestion();
  assert.equal(hebrewHarness.document.querySelector("#promptLabel").classList.contains("hidden"), true);
  assert.equal(hebrewHarness.document.querySelector("#promptText").textContent, "אין בעיה.");
  assert.equal(hebrewHarness.document.querySelector("#promptSpeechBtn").classList.contains("hidden"), false);
  hebrewHarness.document.querySelector("#promptSpeechBtn").click();
  assert.deepEqual(hebrewHarness.speechSpeakLog.map((entry) => entry.text), ["אין בעיה."]);

  const englishHarness = loadAppHarness([], [], [], { sentenceBank });
  englishHarness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "en2he")?.word || items[0]?.word;
  englishHarness.state.mode = "sentenceBank";
  englishHarness.state.sentenceBank.active = true;
  englishHarness.nextSentenceBankQuestion();
  assert.equal(englishHarness.document.querySelector("#promptLabel").classList.contains("hidden"), true);
  assert.equal(englishHarness.document.querySelector("#promptText").textContent, "No problem.");
  assert.equal(englishHarness.document.querySelector("#promptSpeechBtn").classList.contains("hidden"), true);
});

test("sentence builder explains the correct and chosen word when only one slotted word is wrong", () => {
  const vocabulary = [
    { id: "support", category: "core_advanced", en: "support", he: "תומכים", heNiqqud: "תּוֹמְכִים", utility: 80, source: "test" },
    { id: "contradict", category: "core_advanced", en: "contradict", he: "סותרים", heNiqqud: "סוֹתְרִים", utility: 78, source: "test" },
  ];
  const sentenceBank = [
    {
      id: "sb-word-tip",
      category: "formal",
      difficulty: 2,
      english: "The findings support the model.",
      hebrew: "הממצאים תומכים במודל.",
      english_tokens: ["The", "findings", "support", "the", "model"],
      hebrew_tokens: ["הממצאים", "תומכים", "במודל"],
      english_distractors: ["contradict"],
      hebrew_distractors: ["סותרים"],
      notes: "",
    },
  ];
  const harness = loadAppHarness(vocabulary, [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "en2he")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  placeSentenceTokenByTap(document, "הממצאים", 0);
  placeSentenceTokenByTap(document, "סותרים", 1);
  placeSentenceTokenByTap(document, "במודל", 2);
  document.querySelector("#nextBtn").click();

  assert.equal(
    getFeedbackText(document),
    "Not quite. The Hebrew sentence is הממצאים תומכים במודל. "
      + "Correct word: תומכים = support. Chosen word: סותרים = contradict."
  );
});

test("sentence builder falls back to the generic game tip when the miss is not a single resolvable word swap", () => {
  const sentenceBank = [
    {
      id: "sb-generic-tip",
      category: "everyday",
      difficulty: 1,
      english: "See you later.",
      hebrew: "נתראה אחר כך.",
      english_tokens: ["See", "you", "later"],
      hebrew_tokens: ["נתראה", "אחר", "כך"],
      english_distractors: ["now", "tomorrow", "again"],
      hebrew_distractors: ["היום", "עוד", "שם"],
      notes: "A casual goodbye for now.",
    },
  ];
  const harness = loadAppHarness([], [], [], { sentenceBank });
  const { document, state } = harness;

  harness.app.utils.weightedRandomWord = (items) => items.find((item) => item.word.direction === "he2en")?.word || items[0]?.word;
  state.mode = "sentenceBank";
  state.sentenceBank.active = true;
  harness.nextSentenceBankQuestion();

  placeSentenceTokenByTap(document, "later", 0);
  placeSentenceTokenByTap(document, "See", 1);
  placeSentenceTokenByTap(document, "you", 2);
  document.querySelector("#nextBtn").click();

  assert.match(getFeedbackText(document), /Game tip: This one is casual Hebrew\./);
  assert.doesNotMatch(getFeedbackText(document), /Correct word:/);
});

test("abbreviation expansions use niqqud only on the full expansion text", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
  ];
  const abbreviations = [
    {
      id: "abbr-1",
      abbr: "לדוג׳",
      expansionHe: "לדוגמה",
      expansionHeNiqqud: "לְדוּגְמָה",
      english: "for example",
      bucket: "Daily Life & Home",
    },
  ];

  const niqqudOnHarness = loadAppHarness(vocabulary, abbreviations);
  niqqudOnHarness.state.showNiqqudInline = true;
  niqqudOnHarness.state.abbreviation.currentQuestion = {
    direction: "en2he",
    entry: abbreviations[0],
    options: [{ id: "abbr-1", entry: abbreviations[0] }],
    selectedOptionId: "abbr-1",
    locked: false,
  };
  niqqudOnHarness.applyAbbreviationAnswer(true, "abbr-1");
  assert.match(
    getFeedbackText(niqqudOnHarness.document),
    /The full Hebrew is לְדוּגְמָה\./
  );
  niqqudOnHarness.state.abbreviation.sessionMistakeIds = ["abbr-1"];
  assert.equal(
    niqqudOnHarness.buildAbbreviationMistakeSummary()[0].secondary,
    "for example | לְדוּגְמָה"
  );

  const niqqudOffHarness = loadAppHarness(vocabulary, abbreviations);
  niqqudOffHarness.state.showNiqqudInline = false;
  niqqudOffHarness.state.abbreviation.currentQuestion = {
    direction: "en2he",
    entry: abbreviations[0],
    options: [{ id: "abbr-1", entry: abbreviations[0] }],
    selectedOptionId: "abbr-1",
    locked: false,
  };
  niqqudOffHarness.applyAbbreviationAnswer(true, "abbr-1");
  const plainFeedback = getFeedbackText(niqqudOffHarness.document);
  assert.match(plainFeedback, /The full Hebrew is לדוגמה\./);
  assert.doesNotMatch(plainFeedback, /לְדוּגְמָה/);
  niqqudOffHarness.state.abbreviation.sessionMistakeIds = ["abbr-1"];
  assert.equal(
    niqqudOffHarness.buildAbbreviationMistakeSummary()[0].secondary,
    "for example | לדוגמה"
  );
});

test("phase 2 abbreviation entries keep acronym tokens plain while toggling the expansion text", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
  ];
  const abbreviations = [
    {
      id: "abbr-1",
      abbr: "ק״מ",
      expansionHe: "קילומטר",
      expansionHeNiqqud: "קִילוֹמֶטֶר",
      expansionHeNiqqudSource: "https://hebrew-academy.org.il/%D7%9E%D7%99%D7%9C%D7%95%D7%9F-%D7%94%D7%90%D7%A7%D7%93%D7%9E%D7%99%D7%94/",
      english: "kilometer",
      bucket: "Ideas, Science & Tech",
    },
  ];

  const niqqudOnHarness = loadAppHarness(vocabulary, abbreviations);
  niqqudOnHarness.state.showNiqqudInline = true;
  niqqudOnHarness.state.abbreviation.currentQuestion = {
    direction: "en2he",
    entry: abbreviations[0],
    options: [{ id: "abbr-1", entry: abbreviations[0] }],
    selectedOptionId: "abbr-1",
    locked: false,
  };
  niqqudOnHarness.applyAbbreviationAnswer(true, "abbr-1");
  assert.match(
    getFeedbackText(niqqudOnHarness.document),
    /The full Hebrew is קִילוֹמֶטֶר\./
  );

  const niqqudOffHarness = loadAppHarness(vocabulary, abbreviations);
  niqqudOffHarness.state.showNiqqudInline = false;
  niqqudOffHarness.state.abbreviation.currentQuestion = {
    direction: "en2he",
    entry: abbreviations[0],
    options: [{ id: "abbr-1", entry: abbreviations[0] }],
    selectedOptionId: "abbr-1",
    locked: false,
  };
  niqqudOffHarness.applyAbbreviationAnswer(true, "abbr-1");
  const plainFeedback = getFeedbackText(niqqudOffHarness.document);
  assert.match(plainFeedback, /The full Hebrew is קילומטר\./);
  assert.doesNotMatch(plainFeedback, /קִילוֹמֶטֶר/);
});

test("phase 3 abbreviation entries keep institution/legal acronyms plain while toggling the expansion text", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
  ];
  const abbreviations = [
    {
      id: "abbr-1",
      abbr: "עו״ד",
      expansionHe: "עורך דין",
      expansionHeNiqqud: "עוֹרֵךְ דִּין",
      expansionHeNiqqudSource: "https://terms.hebrew-academy.org.il/munnah/115993_1/%D7%A2%D7%95%D6%B9%D7%A8%D6%B5%D7%9A%D6%B0%20%D7%93%D6%BC%D6%B4%D7%99%D7%9F",
      english: "attorney",
      bucket: "Civics, Law & Work",
    },
  ];

  const niqqudOnHarness = loadAppHarness(vocabulary, abbreviations);
  niqqudOnHarness.state.showNiqqudInline = true;
  niqqudOnHarness.state.abbreviation.currentQuestion = {
    direction: "en2he",
    entry: abbreviations[0],
    options: [{ id: "abbr-1", entry: abbreviations[0] }],
    selectedOptionId: "abbr-1",
    locked: false,
  };
  niqqudOnHarness.applyAbbreviationAnswer(true, "abbr-1");
  assert.match(
    getFeedbackText(niqqudOnHarness.document),
    /The full Hebrew is עוֹרֵךְ דִּין\./
  );

  const niqqudOffHarness = loadAppHarness(vocabulary, abbreviations);
  niqqudOffHarness.state.showNiqqudInline = false;
  niqqudOffHarness.state.abbreviation.currentQuestion = {
    direction: "en2he",
    entry: abbreviations[0],
    options: [{ id: "abbr-1", entry: abbreviations[0] }],
    selectedOptionId: "abbr-1",
    locked: false,
  };
  niqqudOffHarness.applyAbbreviationAnswer(true, "abbr-1");
  const plainFeedback = getFeedbackText(niqqudOffHarness.document);
  assert.match(plainFeedback, /The full Hebrew is עורך דין\./);
  assert.doesNotMatch(plainFeedback, /עוֹרֵךְ דִּין/);
});

test("abbreviation feedback always includes the full Hebrew expansion in both directions", () => {
  const abbreviations = [
    {
      id: "abbr-1",
      abbr: "ע״מ",
      expansionHe: "עוסק מורשה",
      expansionHeNiqqud: "עוֹסֵק מוּרְשֶׁה",
      english: "licensed/VAT-registered business",
      bucket: "Civics, Law & Work",
    },
  ];

  const heToEnHarness = loadAppHarness([], abbreviations);
  heToEnHarness.state.abbreviation.currentQuestion = {
    direction: "he2en",
    entry: abbreviations[0],
    options: [{ id: "abbr-1", entry: abbreviations[0] }],
    selectedOptionId: "abbr-1",
    locked: false,
  };
  heToEnHarness.applyAbbreviationAnswer(true, "abbr-1");
  assert.match(getFeedbackText(heToEnHarness.document), /The full Hebrew is עוסק מורשה\./);

  const enToHeHarness = loadAppHarness([], abbreviations);
  enToHeHarness.state.abbreviation.currentQuestion = {
    direction: "en2he",
    entry: abbreviations[0],
    options: [{ id: "abbr-1", entry: abbreviations[0] }],
    selectedOptionId: "abbr-1",
    locked: false,
  };
  enToHeHarness.applyAbbreviationAnswer(true, "abbr-1");
  assert.match(getFeedbackText(enToHeHarness.document), /The full Hebrew is עוסק מורשה\./);
});

test("advanced conjugation feedback adds colloquial meaning only for marked idioms", () => {
  const idioms = [
    {
      id: "idiom-1",
      english: "to drive someone up the wall",
      english_meaning: "to drive someone up the wall",
      showMeaning: true,
    },
    {
      id: "idiom-2",
      english: "to open someone's eyes",
      english_meaning: "to open someone's eyes",
      showMeaning: false,
    },
  ];
  const harness = loadAppHarness([], [], [], { idioms });

  harness.state.advConj.currentQuestion = {
    locked: false,
    idiomId: "idiom-1",
    correctAnswer: "העלתה לי את הסעיף",
    options: [{ id: "right", text: "העלתה לי את הסעיף", isCorrect: true }],
    selectedOptionId: "right",
  };
  harness.applyAdvConjAnswer();
  assert.match(getFeedbackText(harness.document), /Colloquial meaning: "to drive someone up the wall"\./);

  harness.state.advConj.currentQuestion = {
    locked: false,
    idiomId: "idiom-2",
    correctAnswer: "פתחה לי את העיניים",
    options: [{ id: "right", text: "פתחה לי את העיניים", isCorrect: true }],
    selectedOptionId: "right",
  };
  harness.applyAdvConjAnswer();
  assert.doesNotMatch(getFeedbackText(harness.document), /Colloquial meaning:/);
});

test("Hebrew is stripped from English-facing text across translation, abbreviation, and advanced conjugation", () => {
  const vocabulary = [
    { id: "alpha", category: "cooking_verbs", en: "to toss / pan-toss (חלוט)", he: "להקפיץ", heNiqqud: "לְהַקְפִּיץ", utility: 90, source: "test" },
    { id: "beta", category: "cooking_verbs", en: "to saute", he: "להקפיץ-2", heNiqqud: "לְהַקְפִּיץ-2", utility: 80, source: "test" },
    { id: "gamma", category: "cooking_verbs", en: "to ferment", he: "לתסוס", heNiqqud: "לְתַסֵּס", utility: 70, source: "test" },
    { id: "delta", category: "cooking_verbs", en: "to line a pan", he: "לרפד תבנית", heNiqqud: "לְרַפֵּד תַּבְנִית", utility: 60, source: "test" },
  ];
  const abbreviations = [
    { id: "abbr-1", abbr: "וכו׳", expansionHe: "וכולי", english: "etc. / and so on (חלוט)", bucket: "Daily Life & Home" },
    { id: "abbr-2", abbr: "לדוג׳", expansionHe: "לדוגמה", english: "for example (לחלוט)", bucket: "Daily Life & Home" },
    { id: "abbr-3", abbr: "ז״א", expansionHe: "זאת אומרת", english: "that is (להקפיץ)", bucket: "Daily Life & Home" },
    { id: "abbr-4", abbr: "אח״כ", expansionHe: "אחר כך", english: "afterwards (לחלוט)", bucket: "Daily Life & Home" },
  ];
  const { ADV_CONJ_OBJECTS, applyAnswer, buildAdvConjEnglishSentence, document, getSelectedPool, nextAbbreviationQuestion, renderChoices, state } = loadAppHarness(vocabulary, abbreviations);

  const sanitizedWords = getSelectedPool();
  const contaminatedWord = sanitizedWords.find((word) => word.id === "alpha");
  assert.ok(contaminatedWord);
  assert.equal(/[\u0590-\u05FF]/.test(contaminatedWord.en), false);
  assert.equal(contaminatedWord.en, "to toss / pan-toss");

  const lessonQuestion = {
    word: contaminatedWord,
    options: sanitizedWords.slice(0, 4).map((word) => ({ id: word.id, word })),
    optionsAreHebrew: false,
    locked: false,
    selectedOptionId: null,
  };
  renderChoices(lessonQuestion);
  document.querySelector("#choiceContainer").querySelectorAll(".choice-btn").forEach((button) => {
    assert.equal(/[\u0590-\u05FF]/.test(button.textContent), false);
  });

  state.currentQuestion = {
    ...lessonQuestion,
    isReview: false,
    selectedOptionId: "beta",
  };
  applyAnswer(false, "beta");
  assert.equal(getFeedbackText(document).includes("חלוט"), false);

  state.mode = "abbreviation";
  state.abbreviation.active = true;
  state.abbreviation.currentRound = 0;
  nextAbbreviationQuestion();
  assert.ok(state.abbreviation.currentQuestion);
  assert.equal(/[\u0590-\u05FF]/.test(state.abbreviation.currentQuestion.entry.english), false);
  state.abbreviation.currentQuestion.options.forEach((option) => {
    assert.equal(/[\u0590-\u05FF]/.test(option.entry.english), false);
  });

  const advConjEnglish = buildAdvConjEnglishSentence(
    {
      literal_sg: "{s} gets {o} in line (להקפיץ)",
      literal_pl: "{s} get {o} in line (להקפיץ)",
    },
    { en: "he" },
    ADV_CONJ_OBJECTS.find((entry) => entry.key === "1sg"),
    "present"
  );
  assert.equal(/[\u0590-\u05FF]/.test(advConjEnglish), false);
});

test("translation answer banks dedupe identical visible labels in both directions", () => {
  const englishDuplicateVocab = [
    { id: "alpha", category: "cooking_verbs", en: "whatever (חלוט)", he: "לא משנה א", heNiqqud: "לֹא מְשַׁנֶּה א", utility: 90, source: "test" },
    { id: "beta", category: "cooking_verbs", en: "whatever", he: "לא משנה ב", heNiqqud: "לֹא מְשַׁנֶּה ב", utility: 80, source: "test" },
    { id: "gamma", category: "cooking_verbs", en: "sort of", he: "בערך", heNiqqud: "בְּעֵרֶךְ", utility: 70, source: "test" },
    { id: "delta", category: "cooking_verbs", en: "hilarious (slang)", he: "קורע", heNiqqud: "קוֹרֵעַ", utility: 60, source: "test" },
    { id: "epsilon", category: "cooking_verbs", en: "never mind", he: "עזוב", heNiqqud: "עֲזוֹב", utility: 50, source: "test" },
  ];
  const reverseHarness = loadAppHarness(englishDuplicateVocab, [], [], {
    mathRandom: () => 0.9,
  });

  reverseHarness.state.mode = "lesson";
  reverseHarness.state.lesson.active = true;
  reverseHarness.nextQuestion();
  assert.ok(reverseHarness.state.currentQuestion);
  const englishLabels = reverseHarness.state.currentQuestion.options.map((option) => option.word.en);
  assert.equal(new Set(englishLabels).size, englishLabels.length);

  const hebrewDuplicateVocab = [
    { id: "alpha", category: "cooking_verbs", en: "whatever one", he: "לא משנה", heNiqqud: "לֹא מְשַׁנֶּה", utility: 90, source: "test" },
    { id: "beta", category: "cooking_verbs", en: "whatever two", he: "לא משנה", heNiqqud: "לֹא מְשַׁנֶּה", utility: 80, source: "test" },
    { id: "gamma", category: "cooking_verbs", en: "sort of", he: "בערך", heNiqqud: "בְּעֵרֶךְ", utility: 70, source: "test" },
    { id: "delta", category: "cooking_verbs", en: "hilarious (slang)", he: "קורע", heNiqqud: "קוֹרֵעַ", utility: 60, source: "test" },
    { id: "epsilon", category: "cooking_verbs", en: "never mind", he: "עזוב", heNiqqud: "עֲזוֹב", utility: 50, source: "test" },
  ];
  const forwardHarness = loadAppHarness(hebrewDuplicateVocab, [], [], {
    mathRandom: () => 0.1,
  });

  forwardHarness.state.mode = "lesson";
  forwardHarness.state.lesson.active = true;
  forwardHarness.nextQuestion();
  assert.ok(forwardHarness.state.currentQuestion);
  const hebrewLabels = forwardHarness.state.currentQuestion.options.map((option) => option.word.he);
  assert.equal(new Set(hebrewLabels).size, hebrewLabels.length);
});

test("translation can use custom Shabbat-themed distractors for מוצאי שבת in both directions", () => {
  const vocabulary = [
    {
      id: "motzash",
      category: "culture_identity_expanded",
      en: "Saturday night",
      he: "מוצאי שבת",
      heNiqqud: "מוֹצָאֵי שַׁבָּת",
      utility: 90,
      source: "test",
      translationQuizDistractors: {
        english: ["Friday night", "Shabbat morning", "Shabbat afternoon"],
        hebrew: ["ליל שבת", "שבת בבוקר", "שבת בלילה"],
      },
    },
    { id: "culture-2", category: "culture_identity_expanded", en: "holiday ritual", he: "טקס חג", heNiqqud: "טקס חג", utility: 70, source: "test" },
    { id: "culture-3", category: "culture_identity_expanded", en: "religious practice", he: "פרקטיקה דתית", heNiqqud: "פרקטיקה דתית", utility: 65, source: "test" },
    { id: "culture-4", category: "culture_identity_expanded", en: "synagogue community", he: "קהילת בית כנסת", heNiqqud: "קהילת בֵּית כנסת", utility: 60, source: "test" },
  ];

  const reverseHarness = loadAppHarness(vocabulary, [], [], {
    mathRandom: () => 0.9,
  });
  reverseHarness.app.data.pickBestWord = (pool) => pool.find((word) => word.id === "motzash") || pool[0] || null;
  reverseHarness.state.mode = "lesson";
  reverseHarness.state.lesson.active = true;
  reverseHarness.nextQuestion();

  assert.equal(reverseHarness.state.currentQuestion.prompt, "מוצאי שבת");
  assert.deepEqual(
    new Set(reverseHarness.state.currentQuestion.options.map((option) => option.word.en)),
    new Set(["Saturday night", "Friday night", "Shabbat morning", "Shabbat afternoon"])
  );

  const forwardHarness = loadAppHarness(vocabulary, [], [], {
    mathRandom: () => 0.1,
  });
  forwardHarness.app.data.pickBestWord = (pool) => pool.find((word) => word.id === "motzash") || pool[0] || null;
  forwardHarness.state.mode = "lesson";
  forwardHarness.state.lesson.active = true;
  forwardHarness.nextQuestion();

  assert.equal(forwardHarness.state.currentQuestion.prompt, "Saturday night");
  const hebrewLabels = forwardHarness.state.currentQuestion.options.map((option) => option.word.he);
  assert.ok(hebrewLabels.includes("שבת בלילה"));
  assert.ok(hebrewLabels.includes("מוצאי שבת"));
});

test("translation shape-matches infinitive distractors in both directions", () => {
  const vocabulary = [
    { id: "target", category: "cooking_verbs", en: "to drift", he: "לשוטט", heNiqqud: "לְשׁוֹטֵט", utility: 90, source: "test" },
    { id: "verb-1", category: "cooking_verbs", en: "to sprint", he: "לרוץ", heNiqqud: "לָרוּץ", utility: 80, source: "test" },
    { id: "verb-2", category: "cooking_verbs", en: "to pause", he: "לעצור", heNiqqud: "לַעֲצוֹר", utility: 78, source: "test" },
    { id: "verb-3", category: "cooking_verbs", en: "to stir", he: "לערבב", heNiqqud: "לְעַרְבֵּב", utility: 76, source: "test" },
    { id: "noun-1", category: "cooking_verbs", en: "deadline", he: "מועד אחרון", heNiqqud: "מוֹעֵד אַחֲרוֹן", utility: 74, source: "test" },
    { id: "noun-2", category: "cooking_verbs", en: "maintenance", he: "תחזוקה", heNiqqud: "תַּחְזוּקָה", utility: 72, source: "test" },
  ];

  const forwardHarness = loadAppHarness(vocabulary, [], [], {
    mathRandom: () => 0.1,
  });
  forwardHarness.app.data.pickBestWord = (pool) => pool.find((word) => word.id === "target") || pool[0] || null;
  forwardHarness.state.mode = "lesson";
  forwardHarness.state.lesson.active = true;
  forwardHarness.nextQuestion();

  assert.equal(forwardHarness.state.currentQuestion.prompt, "to drift");
  assert.ok(
    forwardHarness.state.currentQuestion.options.every((option) => option.word.he.startsWith("ל"))
  );

  const reverseHarness = loadAppHarness(vocabulary, [], [], {
    mathRandom: () => 0.9,
  });
  reverseHarness.app.data.pickBestWord = (pool) => pool.find((word) => word.id === "target") || pool[0] || null;
  reverseHarness.state.mode = "lesson";
  reverseHarness.state.lesson.active = true;
  reverseHarness.nextQuestion();

  assert.equal(reverseHarness.state.currentQuestion.prompt, "לשוטט");
  assert.ok(
    reverseHarness.state.currentQuestion.options.every((option) => option.word.en.toLowerCase().startsWith("to "))
  );
});

test("translation can use custom cooling-themed distractors for לצנן in both directions", () => {
  const vocabulary = [
    {
      id: "chill",
      category: "cooking_verbs",
      en: "to chill",
      he: "לצנן",
      heNiqqud: "לְצַנֵּן",
      utility: 90,
      source: "test",
      translationQuizDistractors: {
        english: ["to refrigerate", "to freeze", "to defrost"],
        hebrew: ["לקרר", "להקפיא", "להפשיר"],
      },
    },
    { id: "cooking-2", category: "cooking_verbs", en: "deadline", he: "מועד אחרון", heNiqqud: "מוֹעֵד אַחֲרוֹן", utility: 70, source: "test" },
    { id: "cooking-3", category: "cooking_verbs", en: "maintenance", he: "תחזוקה", heNiqqud: "תַּחְזוּקָה", utility: 65, source: "test" },
    { id: "cooking-4", category: "cooking_verbs", en: "customer complaint", he: "תלונת לקוח", heNiqqud: "תְּלוּנַת לָקוֹחַ", utility: 60, source: "test" },
  ];

  const reverseHarness = loadAppHarness(vocabulary, [], [], {
    mathRandom: () => 0.9,
  });
  reverseHarness.app.data.pickBestWord = (pool) => pool.find((word) => word.id === "chill") || pool[0] || null;
  reverseHarness.state.mode = "lesson";
  reverseHarness.state.lesson.active = true;
  reverseHarness.nextQuestion();

  assert.equal(reverseHarness.state.currentQuestion.prompt, "לצנן");
  assert.deepEqual(
    new Set(reverseHarness.state.currentQuestion.options.map((option) => option.word.en)),
    new Set(["to chill", "to refrigerate", "to freeze", "to defrost"])
  );

  const forwardHarness = loadAppHarness(vocabulary, [], [], {
    mathRandom: () => 0.1,
  });
  forwardHarness.app.data.pickBestWord = (pool) => pool.find((word) => word.id === "chill") || pool[0] || null;
  forwardHarness.state.mode = "lesson";
  forwardHarness.state.lesson.active = true;
  forwardHarness.nextQuestion();

  assert.equal(forwardHarness.state.currentQuestion.prompt, "to chill");
  assert.deepEqual(
    new Set(forwardHarness.state.currentQuestion.options.map((option) => option.word.he)),
    new Set(["לצנן", "לקרר", "להקפיא", "להפשיר"])
  );
});

test("abbreviation answer banks dedupe identical visible English labels", () => {
  const abbreviations = [
    { id: "abbr-1", abbr: "וכו׳", expansionHe: "וכולי", english: "whatever (חלוט)", bucket: "Daily Life & Home" },
    { id: "abbr-2", abbr: "וגו׳", expansionHe: "וגומר", english: "whatever", bucket: "Daily Life & Home" },
    { id: "abbr-3", abbr: "לדוג׳", expansionHe: "לדוגמה", english: "for example", bucket: "Daily Life & Home" },
    { id: "abbr-4", abbr: "אח״כ", expansionHe: "אחר כך", english: "afterwards", bucket: "Daily Life & Home" },
    { id: "abbr-5", abbr: "ז״א", expansionHe: "זאת אומרת", english: "that is", bucket: "Daily Life & Home" },
  ];
  const harness = loadAppHarness([], abbreviations, [], {
    mathRandom: () => 0.1,
  });

  harness.state.mode = "abbreviation";
  harness.state.abbreviation.active = true;
  harness.nextAbbreviationQuestion();
  assert.ok(harness.state.abbreviation.currentQuestion);
  const labels = harness.state.abbreviation.currentQuestion.options.map((option) => option.label);
  assert.equal(new Set(labels).size, labels.length);
});

test("verb match rounds dedupe identical visible English cards", () => {
  const vocabulary = [
    { id: "verb-go", category: "core_advanced", en: "to go", he: "ללכת", heNiqqud: "לָלֶכֶת", utility: 80, source: "test" },
  ];
  const verbDeck = [
    {
      word: { id: "verb-go", en: "to go", he: "ללכת", heNiqqud: "לָלֶכֶת" },
      formSource: "validated",
      forms: [
        { id: "present_masculine_singular", englishText: "he goes", valuePlain: "הולך", valueNiqqud: "הוֹלֵךְ" },
        { id: "past_first_person_singular", englishText: "he goes", valuePlain: "הלכתי", valueNiqqud: "הָלַכְתִּי" },
        { id: "present_feminine_singular", englishText: "she goes", valuePlain: "הולכת", valueNiqqud: "הוֹלֶכֶת" },
      ],
    },
  ];
  const harness = loadAppHarness(vocabulary, [], verbDeck);

  harness.state.mode = "verbMatch";
  harness.state.match.active = true;
  harness.state.match.verbQueue = [...verbDeck];
  harness.loadNextVerbRound();
  const englishCards = harness.state.match.leftCards.map((card) => card.englishText);
  assert.equal(new Set(englishCards).size, englishCards.length);
});

test("verb match rounds keep all available deduped forms for a verb", () => {
  const vocabulary = [
    { id: "verb-run", category: "core_advanced", en: "to run", he: "לרוץ", heNiqqud: "לָרוּץ", utility: 80, source: "test" },
  ];
  const verbDeck = [
    {
      word: { id: "verb-run", en: "to run", he: "לרוץ", heNiqqud: "לָרוּץ" },
      formSource: "validated",
      forms: [
        { id: "present_masculine_singular", englishText: "he runs", valuePlain: "רץ", valueNiqqud: "רָץ" },
        { id: "past_first_person_singular", englishText: "I ran", valuePlain: "רצתי", valueNiqqud: "רַצְתִּי" },
        { id: "future_first_person_singular", englishText: "I will run", valuePlain: "ארוץ", valueNiqqud: "אָרוּץ" },
        { id: "present_feminine_singular", englishText: "she runs", valuePlain: "רצה", valueNiqqud: "רָצָה" },
        { id: "past_third_person_masculine_singular", englishText: "he ran", valuePlain: "רץ", valueNiqqud: "רָץ" },
        { id: "future_third_person_masculine_singular", englishText: "he will run", valuePlain: "ירוץ", valueNiqqud: "יָרוּץ" },
        { id: "present_masculine_plural", englishText: "they (m.pl.) run", valuePlain: "רצים", valueNiqqud: "רָצִים" },
        { id: "past_third_person_feminine_singular", englishText: "she ran", valuePlain: "רצה", valueNiqqud: "רָצָה" },
        { id: "future_third_person_feminine_singular", englishText: "she will run", valuePlain: "תרוץ", valueNiqqud: "תָּרוּץ" },
        { id: "present_feminine_plural", englishText: "they (f.pl.) run", valuePlain: "רצות", valueNiqqud: "רָצוֹת" },
        { id: "past_first_person_plural", englishText: "we ran", valuePlain: "רצנו", valueNiqqud: "רַצְנוּ" },
        { id: "future_first_person_plural", englishText: "we will run", valuePlain: "נרוץ", valueNiqqud: "נָרוּץ" },
        { id: "imperative_second_person_masculine_singular", englishText: "run! (m.s.)", valuePlain: "רוץ", valueNiqqud: "רוּץ" },
        { id: "imperative_second_person_feminine_singular", englishText: "run! (f.s.)", valuePlain: "רוצי", valueNiqqud: "רוּצִי" },
        { id: "imperative_second_person_plural", englishText: "run! (pl.)", valuePlain: "רוצו", valueNiqqud: "רוּצוּ" },
      ],
    },
  ];
  const harness = loadAppHarness(vocabulary, [], verbDeck);

  harness.state.mode = "verbMatch";
  harness.state.match.active = true;
  harness.state.match.verbQueue = [...verbDeck];
  harness.loadNextVerbRound();

  assert.equal(harness.state.match.pairs.length, 13);
  assert.deepEqual(
    Array.from(harness.state.match.pairs
      .filter((pair) => pair.id.startsWith("imperative_"))
      .map((pair) => pair.id)),
    [
      "imperative_second_person_masculine_singular",
      "imperative_second_person_feminine_singular",
      "imperative_second_person_plural",
    ]
  );
  assert.deepEqual(
    Array.from(harness.state.match.pairs.map((pair) => pair.id)),
    [
      "present_masculine_singular",
      "past_first_person_singular",
      "future_first_person_singular",
      "present_feminine_singular",
      "future_third_person_masculine_singular",
      "present_masculine_plural",
      "future_third_person_feminine_singular",
      "present_feminine_plural",
      "past_first_person_plural",
      "future_first_person_plural",
      "imperative_second_person_masculine_singular",
      "imperative_second_person_feminine_singular",
      "imperative_second_person_plural",
    ]
  );
});

test("verb match rounds preserve all modern imperative forms for every imperative-enabled deck verb", () => {
  const vocabulary = [
    { id: "cook-fold", category: "cooking_verbs", en: "to fold", he: "לקפל", heNiqqud: "לְקַפֵּל", utility: 80, source: "test" },
    { id: "cook-season", category: "cooking_verbs", en: "to season", he: "לתבל", heNiqqud: "לְתַבֵּל", utility: 84, source: "test" },
    { id: "cook-boil", category: "cooking_verbs", en: "to boil", he: "להרתיח", heNiqqud: "לְהַרְתִּיחַ", utility: 79, source: "test" },
    { id: "cook-thicken", category: "cooking_verbs", en: "to thicken", he: "להסמיך", heNiqqud: "לְהַסְמִיךְ", utility: 70, source: "test" },
    { id: "cook-dilute", category: "cooking_verbs", en: "to dilute", he: "לדלל", heNiqqud: "לְדַלֵּל", utility: 74, source: "test" },
    { id: "cook-strain", category: "cooking_verbs", en: "to strain", he: "לסנן", heNiqqud: "לְסַנֵּן", utility: 78, source: "test" },
    { id: "cook-refrigerate", category: "cooking_verbs", en: "to refrigerate", he: "לקרר", heNiqqud: "לְקָרֵר", utility: 73, source: "test" },
    { id: "cook-garnish", category: "cooking_verbs", en: "to garnish", he: "לקשט", heNiqqud: "לְקַשֵּׁט", utility: 76, source: "test" },
  ];
  const verbDeck = verbApi.buildVerbConjugationDeck({ vocabulary });
  const imperativeEnabled = verbDeck.filter((item) => item.forms.some((form) => form.id.startsWith("imperative_")));
  const harness = loadAppHarness(vocabulary, [], verbDeck);

  assert.ok(imperativeEnabled.length > 0);

  imperativeEnabled.forEach((item) => {
    harness.state.mode = "verbMatch";
    harness.state.match.active = true;
    harness.state.match.verbQueue = [item];
    harness.state.match.currentVerb = null;
    harness.state.match.currentVerbIndex = 0;
    harness.loadNextVerbRound();

    const imperativeIds = Array.from(
      harness.state.match.pairs
        .filter((pair) => pair.id.startsWith("imperative_"))
        .map((pair) => pair.id)
    ).sort((left, right) => MODERN_IMPERATIVE_IDS.indexOf(left) - MODERN_IMPERATIVE_IDS.indexOf(right));

    assert.deepEqual(imperativeIds, MODERN_IMPERATIVE_IDS, `${item.id} should keep all modern imperative pairs in rounds`);
  });
});

test("sound preference defaults to disabled and toggle persists to localStorage", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
  ];
  const { localStorage, state, toggleSoundPreference } = loadAppHarness(vocabulary, [], [], {
    localStorageData: {
      "ivriquest-welcome-seen-v1": "1",
    },
  });

  assert.equal(state.audio.enabled, false);
  toggleSoundPreference();
  assert.equal(state.audio.enabled, true);
  assert.equal(localStorage.getItem("ivriquest-sound-v1"), JSON.stringify({ enabled: true }));
});

test("speech preference defaults to disabled and toggle persists separately", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
  ];
  const { localStorage, state, toggleSpeechPreference } = loadAppHarness(vocabulary, [], [], {
    localStorageData: {
      "ivriquest-welcome-seen-v1": "1",
    },
  });

  assert.equal(state.speech.enabled, false);
  toggleSpeechPreference();
  assert.equal(state.speech.enabled, true);
  assert.equal(localStorage.getItem("ivriquest-speech-v1"), JSON.stringify({ enabled: true }));
  assert.equal(localStorage.getItem("ivriquest-sound-v1"), null);
});

test("speech toggles disable cleanly when Hebrew speech is unavailable", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
  ];
  const { document, state, toggleSpeechPreference } = loadAppHarness(vocabulary, [], [], {
    speechVoices: [],
    localStorageData: {
      "ivriquest-welcome-seen-v1": "1",
    },
  });

  assert.equal(document.querySelector("#speechToggle").disabled, true);
  assert.equal(document.querySelector("#homeSpeechToggle").disabled, true);
  assert.equal(state.speech.enabled, false);
  toggleSpeechPreference();
  assert.equal(state.speech.enabled, false);
});

test("prompt speech button appears for Hebrew prompts and reads them aloud on demand", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
    { id: "beta", category: "core_advanced", en: "beta", he: "בטא", heNiqqud: "בֵּטָא", utility: 79, source: "test" },
  ];

  const hebrewHarness = loadAppHarness(vocabulary);
  hebrewHarness.state.currentQuestion = {
    locked: false,
    word: vocabulary[0],
    prompt: vocabulary[0].he,
    promptIsHebrew: true,
    promptUsesWordSurface: true,
    optionsAreHebrew: false,
    options: [
      { id: "alpha", word: vocabulary[0] },
      { id: "beta", word: vocabulary[1] },
    ],
    selectedOptionId: null,
  };

  hebrewHarness.app.lessonMode.renderQuestion();
  const promptButton = hebrewHarness.document.querySelector("#promptSpeechBtn");
  assert.equal(promptButton.classList.contains("hidden"), false);
  assert.equal(promptButton.textContent.trim(), "");
  assert.equal(promptButton.getAttribute("aria-label"), "Play Hebrew prompt");
  assert.equal(hebrewHarness.document.querySelector("#promptLabel").classList.contains("hidden"), true);
  assert.equal(hebrewHarness.document.querySelector("#homeLessonStage").classList.contains("mode-standard"), true);
  promptButton.click();
  assert.deepEqual(hebrewHarness.speechSpeakLog.map((entry) => entry.text), ["אַלְפָא"]);

  const englishHarness = loadAppHarness(vocabulary);
  englishHarness.state.currentQuestion = {
    locked: false,
    word: vocabulary[0],
    prompt: vocabulary[0].en,
    promptIsHebrew: false,
    promptUsesWordSurface: false,
    optionsAreHebrew: true,
    options: [
      { id: "alpha", word: vocabulary[0] },
      { id: "beta", word: vocabulary[1] },
    ],
    selectedOptionId: null,
  };

  englishHarness.app.lessonMode.renderQuestion();
  assert.equal(englishHarness.document.querySelector("#promptSpeechBtn").classList.contains("hidden"), true);
  assert.deepEqual(englishHarness.speechSpeakLog, []);
});

test("verb match prompt speech button reads the current Hebrew prompt", () => {
  const vocabulary = [
    { id: "verb-word", category: "core_advanced", en: "to go", he: "ללכת", heNiqqud: "לָלֶכֶת", utility: 80, source: "test" },
  ];
  const verbDeck = [
    {
      id: "verb-1",
      word: vocabulary[0],
      forms: [
        { id: "present_masculine_singular", englishText: "he goes", valuePlain: "הולך", valueNiqqud: "הוֹלֵךְ" },
      ],
    },
  ];

  const harness = loadAppHarness(vocabulary, [], verbDeck);
  harness.state.mode = "verbMatch";
  harness.state.match.active = true;
  harness.state.match.verbQueue = [...verbDeck];
  harness.loadNextVerbRound();

  const promptButton = harness.document.querySelector("#promptSpeechBtn");
  assert.equal(promptButton.classList.contains("hidden"), false);
  assert.equal(promptButton.textContent.trim(), "");
  assert.equal(promptButton.getAttribute("aria-label"), "Play Hebrew prompt");
  assert.equal(harness.document.querySelector("#homeLessonStage").classList.contains("mode-verb-match"), true);
  assert.equal(harness.document.querySelector("#stickyLessonActions").classList.contains("is-empty"), true);
  promptButton.click();
  assert.deepEqual(harness.speechSpeakLog.map((entry) => entry.text), ["לָלֶכֶת"]);
});

test("gameplay headers collapse stats into the streak-aware progress bar across lesson and conjugation", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
  ];
  const verbDeck = [
    {
      id: "verb-1",
      word: { id: "verb-word", en: "to go", he: "ללכת", heNiqqud: "לָלֶכֶת", utility: 80, source: "test" },
      forms: [
        { id: "present_masculine_singular", englishText: "he goes", valuePlain: "הולך", valueNiqqud: "הוֹלֵךְ" },
      ],
    },
  ];
  const harness = loadAppHarness(vocabulary, [], verbDeck);

  harness.state.sessionScore = 9;
  harness.state.sessionStreak = 4;
  harness.state.mode = "lesson";
  harness.state.lesson.active = true;
  harness.state.currentQuestion = {
    locked: false,
    word: vocabulary[0],
    prompt: vocabulary[0].en,
    promptIsHebrew: false,
    optionsAreHebrew: true,
    options: [{ id: "alpha", word: vocabulary[0] }],
    selectedOptionId: null,
  };
  harness.state.lesson.elapsedSeconds = 166;
  harness.app.ui.renderSessionHeader();
  assert.equal(harness.document.querySelector("#lessonProgressBar").dataset.streakTier, "2");
  assert.match(harness.document.querySelector("#lessonProgressBar").getAttribute("aria-label"), /Combo x4/);
  assert.equal(harness.document.querySelector("#shellGameplayTime").textContent, "166s");
  assert.equal(harness.document.querySelector("#shellGameplayCombo").textContent, "x4");

  harness.state.mode = "verbMatch";
  harness.state.match.active = true;
  harness.state.match.currentVerb = verbDeck[0];
  harness.state.match.matchedCount = 0;
  harness.state.match.totalPairs = 1;
  harness.state.match.bestCombo = 9;
  harness.state.match.elapsedSeconds = 203;
  harness.app.ui.renderSessionHeader();
  assert.equal(harness.document.querySelector("#lessonProgressBar").dataset.streakTier, "2");
  assert.match(harness.document.querySelector("#lessonProgressBar").getAttribute("aria-label"), /Combo x4/);
  assert.equal(harness.document.querySelector("#shellGameplayTime").textContent, "203s");
  assert.equal(harness.document.querySelector("#shellGameplayCombo").textContent, "x4");
});

test("active gameplay shows the top-right time and combo pill and hides it outside gameplay", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
  ];
  const harness = loadAppHarness(vocabulary, [], [], { innerWidth: 1280 });

  harness.state.route = "home";
  harness.state.mode = "lesson";
  harness.state.lesson.active = true;
  harness.state.lesson.elapsedSeconds = 298;
  harness.state.sessionStreak = 3;
  harness.app.ui.renderSessionHeader();
  harness.app.ui.updateLessonShellModeState();

  assert.equal(harness.document.body.getAttribute("data-gameplay-active"), "true");
  assert.equal(harness.document.querySelector("#shellTopTitle").textContent, "IvritElite");
  assert.equal(harness.document.querySelector("#shellGameplayPill").classList.contains("hidden"), false);
  assert.equal(harness.document.querySelector("#shellHomeBtn").classList.contains("hidden"), false);
  assert.equal(harness.document.querySelector("#shellGameplayTime").textContent, "298s");
  assert.equal(harness.document.querySelector("#shellGameplayCombo").textContent, "x3");
  assert.match(harness.document.querySelector("#shellGameplayPill").getAttribute("aria-label"), /Time: 298s • Combo x3/);
  assert.equal(harness.document.querySelector("#lessonTitleRow").classList.contains("hidden"), true);

  harness.state.lesson.active = false;
  harness.state.route = "review";
  harness.app.ui.renderShellChrome();
  harness.app.ui.updateLessonShellModeState();

  assert.equal(harness.document.body.getAttribute("data-gameplay-active"), "false");
  assert.equal(harness.document.querySelector("#shellTopTitle").textContent, "IvritElite");
  assert.equal(harness.document.querySelector("#shellGameplayPill").classList.contains("hidden"), true);
  assert.equal(harness.document.querySelector("#shellHomeBtn").classList.contains("hidden"), true);

  harness.state.route = "results";
  harness.state.summary.active = true;
  harness.app.ui.renderShellChrome();

  assert.equal(harness.document.querySelector("#shellGameplayPill").classList.contains("hidden"), true);
  assert.equal(harness.document.querySelector("#shellHomeBtn").classList.contains("hidden"), false);
});

test("second-chance rounds reset the progress bar and track review progress specifically", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
  ];
  const sentenceBank = [
    {
      id: "sb-second-chance-progress",
      category: "everyday",
      difficulty: 1,
      english: "We will see you tomorrow.",
      hebrew: "נראה אותך מחר.",
      english_tokens: ["We", "will", "see", "you", "tomorrow"],
      hebrew_tokens: ["נראה", "אותך", "מחר"],
      english_distractors: ["later", "them"],
      hebrew_distractors: ["עכשיו", "אותם"],
      notes: "",
    },
  ];
  const harness = loadAppHarness(vocabulary, [], [], { sentenceBank });

  harness.state.route = "home";
  harness.state.mode = "lesson";
  harness.state.lesson.active = true;
  harness.state.lesson.inReview = true;
  harness.state.lesson.secondChanceCurrent = 1;
  harness.state.lesson.secondChanceTotal = 4;
  harness.state.currentQuestion = {
    locked: false,
    word: vocabulary[0],
    prompt: vocabulary[0].en,
    promptIsHebrew: false,
    optionsAreHebrew: true,
    options: [{ id: "alpha", word: vocabulary[0] }],
    selectedOptionId: null,
  };
  harness.app.ui.renderSessionHeader();

  assert.equal(harness.document.querySelector("#lessonProgressFill").style.width, "25%");
  assert.match(harness.document.querySelector("#lessonProgressBar").getAttribute("aria-label"), /Second chance: 1\/4/);

  harness.state.mode = "sentenceBank";
  harness.state.sentenceBank.active = true;
  harness.state.sentenceBank.inReview = true;
  harness.state.sentenceBank.secondChanceCurrent = 2;
  harness.state.sentenceBank.secondChanceTotal = 5;
  harness.state.sentenceBank.currentQuestion = {
    prompt: "נראה אותך מחר.",
    promptIsHebrew: true,
    answerIsHebrew: false,
    locked: false,
    bankTokens: [],
    targetTokens: ["We", "will", "see", "you", "tomorrow"],
    slotTokenIds: ["", "", "", "", ""],
  };
  harness.app.ui.renderSessionHeader();

  assert.equal(harness.document.querySelector("#lessonProgressFill").style.width, "40%");
  assert.match(harness.document.querySelector("#lessonProgressBar").getAttribute("aria-label"), /Second chance: 2\/5/);
});

test("desktop widths keep review and settings visible even on results", () => {
  const harness = loadAppHarness([], [], [], { innerWidth: 1280 });

  harness.state.route = "review";
  harness.state.summary.active = false;
  harness.app.ui.renderRouteVisibility();

  assert.equal(harness.document.body.getAttribute("data-desktop-hub-layout"), "true");
  assert.equal(harness.document.querySelector("#homeView").classList.contains("active"), true);
  assert.equal(harness.document.querySelector("#reviewView").classList.contains("active"), true);
  assert.equal(harness.document.querySelector("#settingsView").classList.contains("active"), true);
  assert.equal(harness.document.querySelector("#resultsView").classList.contains("active"), false);

  harness.state.route = "results";
  harness.state.summary.active = true;
  harness.app.ui.renderRouteVisibility();

  assert.equal(harness.document.body.getAttribute("data-desktop-hub-layout"), "true");
  assert.equal(harness.document.querySelector("#homeView").classList.contains("active"), false);
  assert.equal(harness.document.querySelector("#reviewView").classList.contains("active"), true);
  assert.equal(harness.document.querySelector("#settingsView").classList.contains("active"), true);
  assert.equal(harness.document.querySelector("#resultsView").classList.contains("active"), true);
  assert.equal(harness.document.querySelector("#resultsReviewBtn").hidden, true);
});

test("results keep the review performance button on mobile only", () => {
  const harness = loadAppHarness([], [], [], { innerWidth: 400 });

  harness.state.route = "results";
  harness.state.summary.active = true;
  harness.app.ui.renderRouteVisibility();

  assert.equal(harness.document.body.getAttribute("data-desktop-hub-layout"), "false");
  assert.equal(harness.document.querySelector("#resultsView").classList.contains("active"), true);
  assert.equal(harness.document.querySelector("#resultsReviewBtn").hidden, false);
});

test("desktop hub cards collapse on desktop but stay expanded on mobile", () => {
  const desktopHarness = loadAppHarness([], [], [], { innerWidth: 1280 });
  const desktopReviewCard = desktopHarness.document.querySelector("#reviewPanelCard");
  const desktopReviewToggle = desktopHarness.document.querySelector("#reviewPanelToggle");
  const desktopSettingsCard = desktopHarness.document.querySelector("#settingsCard");
  const desktopSettingsToggle = desktopHarness.document.querySelector("#settingsToggle");

  assert.equal(desktopHarness.document.body.getAttribute("data-desktop-hub-layout"), "true");
  assert.equal(desktopReviewCard.getAttribute("data-collapsed"), "true");
  assert.equal(desktopReviewToggle.getAttribute("aria-expanded"), "false");
  assert.equal(desktopSettingsCard.getAttribute("data-collapsed"), "true");
  assert.equal(desktopSettingsToggle.getAttribute("aria-expanded"), "false");

  desktopReviewToggle.click();
  assert.equal(desktopReviewCard.getAttribute("data-collapsed"), "false");
  assert.equal(desktopReviewToggle.getAttribute("aria-expanded"), "true");

  desktopSettingsToggle.click();
  assert.equal(desktopSettingsCard.getAttribute("data-collapsed"), "false");
  assert.equal(desktopSettingsToggle.getAttribute("aria-expanded"), "true");

  const mobileHarness = loadAppHarness([], [], [], { innerWidth: 400 });
  const mobileReviewCard = mobileHarness.document.querySelector("#reviewPanelCard");
  const mobileReviewToggle = mobileHarness.document.querySelector("#reviewPanelToggle");
  const mobileSettingsCard = mobileHarness.document.querySelector("#settingsCard");
  const mobileSettingsToggle = mobileHarness.document.querySelector("#settingsToggle");

  assert.equal(mobileHarness.document.body.getAttribute("data-desktop-hub-layout"), "false");
  assert.equal(mobileReviewCard.getAttribute("data-collapsed"), "false");
  assert.equal(mobileSettingsCard.getAttribute("data-collapsed"), "false");
  mobileReviewToggle.click();
  mobileSettingsToggle.click();
  assert.equal(mobileReviewCard.getAttribute("data-collapsed"), "false");
  assert.equal(mobileReviewToggle.getAttribute("aria-expanded"), "true");
  assert.equal(mobileSettingsCard.getAttribute("data-collapsed"), "false");
  assert.equal(mobileSettingsToggle.getAttribute("aria-expanded"), "true");
});

test("all game summaries now use only score accuracy and time metrics", () => {
  const harness = loadAppHarness([]);
  const expectedLabels = ["Score", "Accuracy", "Time"];

  ["lesson", "abbreviation", "verbMatch", "advConj"].forEach((game) => {
    harness.state.summary.game = game;
    harness.state.summary.elapsedSeconds = 42;
    const metrics = harness.app.ui.buildSummaryMetrics({
      scoreValue: 7,
      scoreTotal: 10,
      accuracy: 70,
    });
    assert.equal(metrics.length, 3);
    assert.deepEqual(Array.from(metrics, (metric) => metric.label), expectedLabels);
  });
});

test("starting advanced conjugation resets the game score but preserves the shared combo", () => {
  const idioms = [
    {
      id: "idiom-1",
      english: "to open your eyes",
      showMeaning: false,
      object_type: "l_dative",
      fixed_object: "את העיניים",
      literal_sg: "{s} opens {p} eyes",
      literal_pl: "{s} open {p} eyes",
      literal_past: "{s} opened {p} eyes",
      literal_future: "{s} will open {p} eyes",
      present_tense: { msg: "פותח", fsg: "פותחת", mpl: "פותחים", fpl: "פותחות" },
      past_tense: { msg: "פתח", fsg: "פתחה", mpl: "פתחו", fpl: "פתחו" },
      future_tense: { msg: "יפתח", fsg: "תפתח", mpl: "תפתחו", fpl: "תפתחו" },
    },
  ];
  const harness = loadAppHarness([], [], [], { idioms });

  harness.state.sessionScore = 6;
  harness.state.sessionStreak = 3;
  harness.startAdvConj();
  harness.app.ui.renderSessionHeader();

  assert.equal(harness.state.sessionScore, 0);
  assert.equal(harness.state.sessionStreak, 3);
  assert.equal(harness.document.querySelector("#lessonProgressBar").dataset.streakTier, "1");
  assert.match(harness.document.querySelector("#lessonProgressBar").getAttribute("aria-label"), /Combo x3/);
  harness.goHome();
});

test("lesson footer keeps action buttons above the feedback tray in the markup", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  assert.match(
    html,
    /<div id="lessonFooter"[\s\S]*<div id="stickyLessonActions"[\s\S]*<\/div>[\s\S]*<section id="feedbackTray"/
  );
});

test("translation feedback uses the tray without moving the action row or echoing the wrong answer", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
    { id: "beta", category: "core_advanced", en: "beta", he: "בטא", heNiqqud: "בֵּטָא", utility: 79, source: "test" },
  ];
  const harness = loadAppHarness(vocabulary);

  harness.state.mode = "lesson";
  harness.state.lesson.active = true;
  harness.state.currentQuestion = {
    locked: false,
    isReview: false,
    promptIsHebrew: false,
    optionsAreHebrew: true,
    word: vocabulary[0],
    options: [
      { id: "alpha", word: vocabulary[0] },
      { id: "beta", word: vocabulary[1] },
    ],
    selectedOptionId: "beta",
  };

  harness.app.ui.renderSessionHeader();
  const nextBtn = harness.document.querySelector("#nextBtn");
  assert.equal(nextBtn.classList.contains("hidden"), false);
  assert.equal(nextBtn.textContent, "Submit");

  harness.applyAnswer(false, "beta");

  assert.equal(nextBtn.classList.contains("hidden"), false);
  assert.equal(nextBtn.textContent, "Next");
  assert.equal(harness.document.querySelector("#lessonFooter").classList.contains("hidden"), false);
  assert.equal(harness.document.querySelector("#feedbackTray").classList.contains("hidden"), false);
  assert.match(
    harness.document.querySelector("#feedbackSentence").textContent,
    /Not quite\. The Hebrew answer is אלפא\./
  );
  assert.equal(harness.document.querySelector("#feedbackDetail").textContent, "");
  assert.equal(getFeedbackText(harness.document).includes("בטא"), false);
});

test("conjugation never shows the feedback tray during mismatch, match success, or verb completion", async () => {
  const vocabulary = [
    { id: "verb-word", category: "core_advanced", en: "to go", he: "ללכת", heNiqqud: "לָלֶכֶת", utility: 80, source: "test" },
  ];
  const mismatchDeck = [
    {
      id: "verb-1",
      word: vocabulary[0],
      forms: [
        { id: "present_masculine_singular", englishText: "he goes", valuePlain: "הולך", valueNiqqud: "הוֹלֵךְ" },
        { id: "past_first_person_singular", englishText: "I went", valuePlain: "הלכתי", valueNiqqud: "הָלַכְתִּי" },
      ],
    },
  ];

  const mismatchHarness = loadAppHarness(vocabulary, [], mismatchDeck);
  mismatchHarness.state.mode = "verbMatch";
  mismatchHarness.state.match.active = true;
  mismatchHarness.state.match.verbQueue = [...mismatchDeck];
  mismatchHarness.loadNextVerbRound();
  const wrongLeft = mismatchHarness.state.match.leftCards[0];
  const wrongRight = mismatchHarness.state.match.rightCards.find((card) => card.pairId !== wrongLeft.pairId);
  mismatchHarness.applyVerbMatchMismatch(wrongLeft, wrongRight);
  assert.equal(mismatchHarness.document.querySelector("#feedbackTray").classList.contains("hidden"), true);
  await waitForTimers();
  assert.equal(mismatchHarness.document.querySelector("#feedbackTray").classList.contains("hidden"), true);

  const successDeck = [
    {
      id: "verb-2",
      word: vocabulary[0],
      forms: [
        { id: "present_masculine_singular", englishText: "he goes", valuePlain: "הולך", valueNiqqud: "הוֹלֵךְ" },
      ],
    },
  ];
  const successHarness = loadAppHarness(vocabulary, [], successDeck);
  successHarness.state.mode = "verbMatch";
  successHarness.state.match.active = true;
  successHarness.state.match.verbQueue = [...successDeck];
  successHarness.loadNextVerbRound();
  const left = successHarness.state.match.leftCards[0];
  const right = successHarness.state.match.rightCards.find((card) => card.pairId === left.pairId);
  successHarness.applyVerbMatchSuccess(left, right);
  assert.equal(successHarness.document.querySelector("#feedbackTray").classList.contains("hidden"), true);
  await waitForTimers();
  assert.equal(successHarness.document.querySelector("#feedbackTray").classList.contains("hidden"), true);
  assert.equal(successHarness.document.querySelector("#nextBtn").classList.contains("hidden"), false);
});

test("translation submit plays the correct answer sound", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
    { id: "beta", category: "core_advanced", en: "beta", he: "בטא", heNiqqud: "בֵּטָא", utility: 79, source: "test" },
  ];
  const { applyAnswer, audioPlayLog, state } = loadAppHarness(vocabulary, [], [], {
    localStorageData: {
      "ivriquest-sound-v1": JSON.stringify({ enabled: true }),
      "ivriquest-welcome-seen-v1": "1",
    },
  });

  state.lesson.active = true;
  state.currentQuestion = {
    locked: false,
    isReview: false,
    word: vocabulary[0],
    options: [
      { id: "alpha", word: vocabulary[0] },
      { id: "beta", word: vocabulary[1] },
    ],
    selectedOptionId: "alpha",
  };

  applyAnswer(true, "alpha");

  assertAudioPlayLog(audioPlayLog, [/^\.\/assets\/sounds\/answer-correct\.ogg\?v=[0-9a-z]+$/]);
});

test("translation submit plays the wrong answer sound", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
    { id: "beta", category: "core_advanced", en: "beta", he: "בטא", heNiqqud: "בֵּטָא", utility: 79, source: "test" },
  ];
  const { applyAnswer, audioPlayLog, state } = loadAppHarness(vocabulary, [], [], {
    localStorageData: {
      "ivriquest-sound-v1": JSON.stringify({ enabled: true }),
      "ivriquest-welcome-seen-v1": "1",
    },
  });

  state.lesson.active = true;
  state.currentQuestion = {
    locked: false,
    isReview: false,
    word: vocabulary[0],
    options: [
      { id: "alpha", word: vocabulary[0] },
      { id: "beta", word: vocabulary[1] },
    ],
    selectedOptionId: "beta",
  };

  applyAnswer(false, "beta");

  assertAudioPlayLog(audioPlayLog, [/^\.\/assets\/sounds\/answer-wrong\.ogg\?v=[0-9a-z]+$/]);
});

test("selecting a translation choice without submitting stays silent", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
    { id: "beta", category: "core_advanced", en: "beta", he: "בטא", heNiqqud: "בֵּטָא", utility: 79, source: "test" },
  ];
  const { audioPlayLog, document, renderChoices, state } = loadAppHarness(vocabulary, [], [], {
    localStorageData: {
      "ivriquest-sound-v1": JSON.stringify({ enabled: true }),
      "ivriquest-welcome-seen-v1": "1",
    },
  });

  state.currentQuestion = {
    locked: false,
    word: vocabulary[0],
    options: [
      { id: "alpha", word: vocabulary[0] },
      { id: "beta", word: vocabulary[1] },
    ],
    selectedOptionId: null,
    optionsAreHebrew: false,
  };

  renderChoices(state.currentQuestion);
  const buttons = document.querySelector("#choiceContainer").querySelectorAll("button");
  buttons[0].click();

  assert.equal(state.currentQuestion.selectedOptionId, "alpha");
  assert.deepEqual(audioPlayLog, []);
});

test("translation selection speaks Hebrew answers only and prefers niqqud for speech", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
    { id: "beta", category: "core_advanced", en: "beta", he: "בטא", heNiqqud: "בֵּטָא", utility: 79, source: "test" },
  ];
  const hebrewHarness = loadAppHarness(vocabulary);
  hebrewHarness.toggleSpeechPreference();

  hebrewHarness.state.currentQuestion = {
    locked: false,
    word: vocabulary[0],
    options: [
      { id: "alpha", word: vocabulary[0] },
      { id: "beta", word: vocabulary[1] },
    ],
    selectedOptionId: null,
    optionsAreHebrew: true,
  };

  hebrewHarness.renderChoices(hebrewHarness.state.currentQuestion);
  let buttons = hebrewHarness.document.querySelector("#choiceContainer").querySelectorAll("button");
  buttons[0].click();

  assert.equal(hebrewHarness.state.currentQuestion.selectedOptionId, "alpha");
  assert.deepEqual(hebrewHarness.speechSpeakLog.map((entry) => entry.text), ["אַלְפָא"]);

  const englishHarness = loadAppHarness(vocabulary);
  englishHarness.toggleSpeechPreference();
  englishHarness.state.currentQuestion = {
    locked: false,
    word: vocabulary[0],
    options: [
      { id: "alpha", word: vocabulary[0] },
      { id: "beta", word: vocabulary[1] },
    ],
    selectedOptionId: null,
    optionsAreHebrew: false,
  };

  englishHarness.renderChoices(englishHarness.state.currentQuestion);
  buttons = englishHarness.document.querySelector("#choiceContainer").querySelectorAll("button");
  buttons[0].click();
  assert.deepEqual(englishHarness.speechSpeakLog, []);
});

test("locked translation choices do not trigger speech", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
    { id: "beta", category: "core_advanced", en: "beta", he: "בטא", heNiqqud: "בֵּטָא", utility: 79, source: "test" },
  ];
  const harness = loadAppHarness(vocabulary);
  harness.toggleSpeechPreference();

  harness.state.currentQuestion = {
    locked: true,
    word: vocabulary[0],
    options: [
      { id: "alpha", word: vocabulary[0] },
      { id: "beta", word: vocabulary[1] },
    ],
    selectedOptionId: null,
    optionsAreHebrew: true,
  };

  harness.renderChoices(harness.state.currentQuestion);
  const buttons = harness.document.querySelector("#choiceContainer").querySelectorAll("button");
  buttons[0].click();

  assert.deepEqual(harness.speechSpeakLog, []);
});

test("abbreviation and advanced conjugation selections speak Hebrew answers before submit", () => {
  const abbreviations = [
    { id: "abbr-1", abbr: "ע״מ", expansionHe: "עוסק מורשה", english: "licensed business", bucket: "Daily Life & Home" },
  ];
  const harness = loadAppHarness([], abbreviations, []);
  harness.toggleSpeechPreference();

  harness.state.mode = "abbreviation";
  harness.state.abbreviation.active = true;
  harness.state.abbreviation.currentQuestion = {
    locked: false,
    direction: "en2he",
    entry: abbreviations[0],
    options: [{ id: "abbr-1", label: "ע״מ", entry: abbreviations[0] }],
    selectedOptionId: null,
  };
  harness.app.abbreviation.renderAbbreviationChoices(harness.state.abbreviation.currentQuestion);
  let buttons = harness.document.querySelector("#choiceContainer").querySelectorAll("button");
  buttons[0].click();

  harness.state.mode = "advConj";
  harness.state.advConj.active = true;
  harness.state.advConj.currentQuestion = {
    locked: false,
    promptText: "he opened your eyes",
    promptIsHebrew: false,
    correctAnswer: "פתח לך את העיניים",
    correctAnswerIsHebrew: true,
    options: [{ id: "correct", text: "פתח לך את העיניים", isCorrect: true }],
    selectedOptionId: null,
  };
  harness.app.advConj.renderAdvConjChoices(harness.state.advConj.currentQuestion);
  buttons = harness.document.querySelector("#choiceContainer").querySelectorAll("button");
  buttons[0].click();

  assert.deepEqual(harness.speechSpeakLog.map((entry) => entry.text), ["ע״מ", "פתח לך את העיניים"]);
});

test("verb match speaks only when the Hebrew card is selected first and shows the tip", async () => {
  const vocabulary = [
    { id: "verb-word", category: "core_advanced", en: "to go", he: "ללכת", heNiqqud: "לָלֶכֶת", utility: 80, source: "test" },
  ];
  const verbDeck = [
    {
      id: "verb-1",
      word: vocabulary[0],
      forms: [
        { id: "present_masculine_singular", englishText: "he goes", valuePlain: "הולך", valueNiqqud: "הוֹלֵךְ" },
      ],
    },
  ];

  const rightFirstHarness = loadAppHarness(vocabulary, [], verbDeck);
  rightFirstHarness.toggleSpeechPreference();
  rightFirstHarness.state.mode = "verbMatch";
  rightFirstHarness.state.match.active = true;
  rightFirstHarness.state.match.verbQueue = [...verbDeck];
  rightFirstHarness.loadNextVerbRound();

  assert.equal(rightFirstHarness.document.querySelector("#promptHint").textContent, "Tip: select the Hebrew first to hear it aloud.");
  assert.equal(rightFirstHarness.document.querySelector("#stickyLessonActions").classList.contains("is-empty"), true);
  const rightCardId = rightFirstHarness.state.match.rightCards[0].id;
  const leftCardId = rightFirstHarness.state.match.leftCards[0].id;
  rightFirstHarness.app.verbMatch.handleVerbMatchRight(rightCardId);
  assert.deepEqual(rightFirstHarness.speechSpeakLog.map((entry) => entry.text), ["הוֹלֵךְ"]);
  rightFirstHarness.app.verbMatch.handleVerbMatchLeft(leftCardId);
  assert.equal(rightFirstHarness.speechSpeakLog.length, 1);
  await waitForTimers();

  const leftFirstHarness = loadAppHarness(vocabulary, [], verbDeck);
  leftFirstHarness.toggleSpeechPreference();
  leftFirstHarness.state.mode = "verbMatch";
  leftFirstHarness.state.match.active = true;
  leftFirstHarness.state.match.verbQueue = [...verbDeck];
  leftFirstHarness.loadNextVerbRound();
  leftFirstHarness.app.verbMatch.handleVerbMatchLeft(leftFirstHarness.state.match.leftCards[0].id);
  leftFirstHarness.app.verbMatch.handleVerbMatchRight(leftFirstHarness.state.match.rightCards[0].id);
  assert.deepEqual(leftFirstHarness.speechSpeakLog, []);
});

test("abbreviation and advanced conjugation submits play feedback sounds", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
  ];
  const abbreviations = [
    { id: "abbr-1", abbr: "וכו׳", expansionHe: "וכולי", english: "etc.", bucket: "Daily Life & Home" },
  ];
  const { applyAbbreviationAnswer, applyAdvConjAnswer, audioPlayLog, state } = loadAppHarness(
    vocabulary,
    abbreviations,
    [],
    {
      idioms: [
        { id: "idiom-1", english: "to be honest", showMeaning: false },
      ],
      localStorageData: {
        "ivriquest-sound-v1": JSON.stringify({ enabled: true }),
        "ivriquest-welcome-seen-v1": "1",
      },
    }
  );

  state.abbreviation.currentQuestion = {
    locked: false,
    entry: abbreviations[0],
    options: [
      { id: "abbr-1", entry: abbreviations[0] },
    ],
    selectedOptionId: "abbr-1",
  };
  applyAbbreviationAnswer(true, "abbr-1");

  state.advConj.currentQuestion = {
    locked: false,
    idiomId: "idiom-1",
    correctAnswer: "ניסוח נכון",
    options: [
      { id: "wrong", text: "ניסוח שגוי", isCorrect: false },
      { id: "right", text: "ניסוח נכון", isCorrect: true },
    ],
    selectedOptionId: "wrong",
  };
  applyAdvConjAnswer();

  assertAudioPlayLog(audioPlayLog, [
    /^\.\/assets\/sounds\/answer-correct\.ogg\?v=[0-9a-z]+$/,
    /^\.\/assets\/sounds\/answer-wrong\.ogg\?v=[0-9a-z]+$/,
  ]);
});

test("audio playback falls back to mp3 when ogg support is unavailable", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
    { id: "beta", category: "core_advanced", en: "beta", he: "בטא", heNiqqud: "בֵּטָא", utility: 79, source: "test" },
  ];
  const { applyAnswer, audioPlayLog, state } = loadAppHarness(vocabulary, [], [], {
    audioSupport: {
      'audio/ogg; codecs="vorbis"': "",
      "audio/mpeg": "probably",
    },
    localStorageData: {
      "ivriquest-sound-v1": JSON.stringify({ enabled: true }),
      "ivriquest-welcome-seen-v1": "1",
    },
  });

  state.lesson.active = true;
  state.currentQuestion = {
    locked: false,
    isReview: false,
    word: vocabulary[0],
    options: [
      { id: "alpha", word: vocabulary[0] },
      { id: "beta", word: vocabulary[1] },
    ],
    selectedOptionId: "alpha",
  };

  applyAnswer(true, "alpha");

  assertAudioPlayLog(audioPlayLog, [/^\.\/assets\/sounds\/answer-correct\.mp3\?v=[0-9a-z]+$/]);
});

test("enabling sounds primes all feedback cues", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
  ];
  const { audioLoadLog, toggleSoundPreference } = loadAppHarness(vocabulary, [], [], {
    localStorageData: {
      "ivriquest-welcome-seen-v1": "1",
    },
  });

  assert.deepEqual(audioLoadLog, []);
  toggleSoundPreference();
  assertAudioLoadLog(audioLoadLog, [
    /^\.\/assets\/sounds\/answer-correct\.ogg\?v=[0-9a-z]+$/,
    /^\.\/assets\/sounds\/answer-streak\.ogg\?v=[0-9a-z]+$/,
    /^\.\/assets\/sounds\/answer-wrong\.ogg\?v=[0-9a-z]+$/,
  ]);
});

test("saved enabled sound preference primes all feedback cues at startup", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
  ];
  const { audioLoadLog } = loadAppHarness(vocabulary, [], [], {
    localStorageData: {
      "ivriquest-sound-v1": JSON.stringify({ enabled: true }),
      "ivriquest-welcome-seen-v1": "1",
    },
  });

  assertAudioLoadLog(audioLoadLog, [
    /^\.\/assets\/sounds\/answer-correct\.ogg\?v=[0-9a-z]+$/,
    /^\.\/assets\/sounds\/answer-streak\.ogg\?v=[0-9a-z]+$/,
    /^\.\/assets\/sounds\/answer-wrong\.ogg\?v=[0-9a-z]+$/,
  ]);
});

test("every fourth correct answer plays the streak sound", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
    { id: "beta", category: "core_advanced", en: "beta", he: "בטא", heNiqqud: "בֵּטָא", utility: 79, source: "test" },
  ];
  const { applyAnswer, audioPlayLog, state } = loadAppHarness(vocabulary, [], [], {
    localStorageData: {
      "ivriquest-sound-v1": JSON.stringify({ enabled: true }),
      "ivriquest-welcome-seen-v1": "1",
    },
  });

  state.sessionStreak = 3;
  state.lesson.active = true;
  state.currentQuestion = {
    locked: false,
    isReview: false,
    word: vocabulary[0],
    options: [
      { id: "alpha", word: vocabulary[0] },
      { id: "beta", word: vocabulary[1] },
    ],
    selectedOptionId: "alpha",
  };

  applyAnswer(true, "alpha");

  assert.equal(state.sessionStreak, 4);
  assertAudioPlayLog(audioPlayLog, [/^\.\/assets\/sounds\/answer-streak\.ogg\?v=[0-9a-z]+$/]);
});

test("disabled sounds suppress feedback playback", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
    { id: "beta", category: "core_advanced", en: "beta", he: "בטא", heNiqqud: "בֵּטָא", utility: 79, source: "test" },
  ];
  const { applyAnswer, audioPlayLog, state } = loadAppHarness(vocabulary, [], [], {
    localStorageData: {
      "ivriquest-sound-v1": JSON.stringify({ enabled: false }),
      "ivriquest-welcome-seen-v1": "1",
    },
  });

  assert.equal(state.audio.enabled, false);

  state.lesson.active = true;
  state.currentQuestion = {
    locked: false,
    isReview: false,
    word: vocabulary[0],
    options: [
      { id: "alpha", word: vocabulary[0] },
      { id: "beta", word: vocabulary[1] },
    ],
    selectedOptionId: "alpha",
  };

  applyAnswer(true, "alpha");

  assert.deepEqual(audioPlayLog, []);
});

test("conjugation matches play correct, wrong, and streak sounds", async () => {
  const vocabulary = [
    { id: "verb-go", category: "core_advanced", en: "to go", he: "ללכת", heNiqqud: "לָלֶכֶת", utility: 80, source: "test" },
  ];
  const verbDeck = [
    {
      word: { id: "verb-go", en: "to go", he: "ללכת", heNiqqud: "לָלֶכֶת" },
      formSource: "validated",
      forms: [
        { id: "present_masculine_singular", englishText: "he goes", valuePlain: "הולך", valueNiqqud: "הוֹלֵךְ" },
        { id: "present_feminine_singular", englishText: "she goes", valuePlain: "הולכת", valueNiqqud: "הוֹלֶכֶת" },
      ],
    },
  ];

  const correctHarness = loadAppHarness(vocabulary, [], verbDeck, {
    localStorageData: {
      "ivriquest-sound-v1": JSON.stringify({ enabled: true }),
      "ivriquest-welcome-seen-v1": "1",
    },
  });
  correctHarness.startVerbMatch();
  await waitForTimers();
  const correctLeft = correctHarness.state.match.leftCards[0];
  const correctRight = correctHarness.state.match.rightCards.find((card) => card.pairId === correctLeft.pairId);
  correctHarness.applyVerbMatchSuccess(correctLeft, correctRight);
  assertAudioPlayLog(correctHarness.audioPlayLog, [/^\.\/assets\/sounds\/answer-correct\.ogg\?v=[0-9a-z]+$/]);
  correctHarness.goHome();

  const wrongHarness = loadAppHarness(vocabulary, [], verbDeck, {
    localStorageData: {
      "ivriquest-sound-v1": JSON.stringify({ enabled: true }),
      "ivriquest-welcome-seen-v1": "1",
    },
  });
  wrongHarness.startVerbMatch();
  await waitForTimers();
  const wrongLeft = wrongHarness.state.match.leftCards[0];
  const wrongRight = wrongHarness.state.match.rightCards.find((card) => card.pairId !== wrongLeft.pairId);
  wrongHarness.applyVerbMatchMismatch(wrongLeft, wrongRight);
  assertAudioPlayLog(wrongHarness.audioPlayLog, [/^\.\/assets\/sounds\/answer-wrong\.ogg\?v=[0-9a-z]+$/]);
  wrongHarness.goHome();

  const streakHarness = loadAppHarness(vocabulary, [], verbDeck, {
    localStorageData: {
      "ivriquest-sound-v1": JSON.stringify({ enabled: true }),
      "ivriquest-welcome-seen-v1": "1",
    },
  });
  streakHarness.startVerbMatch();
  await waitForTimers();
  streakHarness.state.sessionStreak = 3;
  const streakLeft = streakHarness.state.match.leftCards[0];
  const streakRight = streakHarness.state.match.rightCards.find((card) => card.pairId === streakLeft.pairId);
  streakHarness.applyVerbMatchSuccess(streakLeft, streakRight);
  assert.equal(streakHarness.state.sessionStreak, 4);
  assertAudioPlayLog(streakHarness.audioPlayLog, [/^\.\/assets\/sounds\/answer-streak\.ogg\?v=[0-9a-z]+$/]);
  streakHarness.goHome();
});

test("advanced conjugation English prompts keep number cues while omitting unnecessary subject gender", () => {
  const idiom = {
    id: "ptihat_einayim",
    object_type: "l_dative",
    fixed_object: "את העיניים",
    literal_sg: "{s} opens {p} eyes",
    literal_pl: "{s} open {p} eyes",
    literal_past: "{s} opened {p} eyes",
    literal_future: "{s} will open {p} eyes",
    present_tense: { msg: "פותח", fsg: "פותחת", mpl: "פותחים", fpl: "פותחות" },
    past_tense: { msg: "פתח", fsg: "פתחה", mpl: "פתחו", fpl: "פתחו" },
    future_tense: { msg: "יפתח", fsg: "תפתח", mpl: "יפתחו", fpl: "יפתחו" },
  };
  const { ADV_CONJ_OBJECTS, buildAdvConjEnglishSentence } = loadAppHarness([], [], [], {
    idioms: [idiom],
  });
  const subj = { form: "fpl", en: "they (f.)" };
  const singularYou = ADV_CONJ_OBJECTS.find((obj) => obj.key === "2msg");
  const pluralYou = ADV_CONJ_OBJECTS.find((obj) => obj.key === "2mpl");

  assert.equal(singularYou?.poss, "your (sg.)");
  assert.equal(pluralYou?.poss, "your (pl.)");
  assert.equal(
    buildAdvConjEnglishSentence(idiom, subj, singularYou, "past"),
    "they opened your (sg.) eyes"
  );
  assert.equal(
    buildAdvConjEnglishSentence(idiom, subj, pluralYou, "past"),
    "they opened your (pl.) eyes"
  );
  assert.equal(
    buildAdvConjEnglishSentence(idiom, subj, singularYou, "present"),
    "they (f.) open your (sg.) eyes"
  );
});

test("advanced conjugation collapses duplicate singular-plural markers when object and possessive refer to the same you", () => {
  const idiom = {
    id: "yotzi_midaat",
    object_type: "possessive_suffix",
    literal_sg: "{s} takes {o} out of {p} mind",
    literal_pl: "{s} take {o} out of {p} mind",
    literal_past: "{s} took {o} out of {p} mind",
    literal_future: "{s} will take {o} out of {p} mind",
    suffix_forms: { "2msg": "מדעתך", "2mpl": "מדעתכם" },
    present_tense: { msg: "מוציא", fsg: "מוציאה", mpl: "מוציאים", fpl: "מוציאות" },
    past_tense: { msg: "הוציא", fsg: "הוציאה", mpl: "הוציאו", fpl: "הוציאו" },
    future_tense: { msg: "יוציא", fsg: "תוציא", mpl: "יוציאו", fpl: "יוציאו" },
  };
  const { ADV_CONJ_OBJECTS, buildAdvConjEnglishSentence } = loadAppHarness([], [], [], {
    idioms: [idiom],
  });
  const subj = { form: "msg", en: "he" };
  const singularYou = ADV_CONJ_OBJECTS.find((obj) => obj.key === "2msg");
  const pluralYou = ADV_CONJ_OBJECTS.find((obj) => obj.key === "2mpl");

  assert.equal(
    buildAdvConjEnglishSentence(idiom, subj, singularYou, "future"),
    "he will take you out of your mind (sg.)"
  );
  assert.equal(
    buildAdvConjEnglishSentence(idiom, subj, pluralYou, "future"),
    "he will take you out of your mind (pl.)"
  );
});

test("advanced conjugation subjects add present-tense you forms without extending past/future beyond available data", () => {
  const { ADV_CONJ_SUBJECTS, getAdvConjSubjectsForTense } = loadAppHarness([], [], []);
  const labels = (subjects) => Array.from(subjects, (subject) => subject.en);

  assert.deepEqual(
    labels(ADV_CONJ_SUBJECTS),
    ["he", "you (m.sg.)", "she", "you (f.sg.)", "they (m.)", "you (m.pl.)", "they (f.)", "you (f.pl.)"]
  );
  assert.deepEqual(
    labels(getAdvConjSubjectsForTense("present")),
    ["he", "you (m.sg.)", "she", "you (f.sg.)", "they (m.)", "you (m.pl.)", "they (f.)", "you (f.pl.)"]
  );
  assert.deepEqual(
    labels(getAdvConjSubjectsForTense("past")),
    ["he", "she", "they (m.)", "they (f.)"]
  );
  assert.deepEqual(
    labels(getAdvConjSubjectsForTense("future")),
    ["he", "she", "they (m.)", "they (f.)"]
  );
});

test("advanced conjugation present-tense English uses base verbs for second-person subjects", () => {
  const idiom = {
    id: "hotzaat_mitz",
    object_type: "l_dative",
    fixed_object: "את המיץ",
    literal_sg: "{s} takes out {p} juice",
    literal_pl: "{s} take out {p} juice",
    literal_past: "{s} took out {p} juice",
    literal_future: "{s} will take out {p} juice",
    present_tense: { msg: "מוציא", fsg: "מוציאה", mpl: "מוציאים", fpl: "מוציאות" },
    past_tense: { msg: "הוציא", fsg: "הוציאה", mpl: "הוציאו", fpl: "הוציאו" },
    future_tense: { msg: "יוציא", fsg: "תוציא", mpl: "יוציאו", fpl: "יוציאו" },
  };
  const { ADV_CONJ_OBJECTS, buildAdvConjEnglishSentence } = loadAppHarness([], [], [], {
    idioms: [idiom],
  });
  const myObject = ADV_CONJ_OBJECTS.find((obj) => obj.key === "1sg");

  assert.equal(
    buildAdvConjEnglishSentence(idiom, { form: "msg", en: "you (m.sg.)" }, myObject, "present"),
    "you (m.sg.) take out my juice"
  );
  assert.equal(
    buildAdvConjEnglishSentence(idiom, { form: "fsg", en: "you (f.sg.)" }, myObject, "present"),
    "you (f.sg.) take out my juice"
  );
});

test("advanced conjugation skips second-person subject plus second-person object combinations", () => {
  const idiom = {
    id: "mehagav",
    english: "to get off someone's back",
    english_meaning: "to get off someone's back",
    object_type: "l_dative",
    fixed_object: "מהגב",
    literal_sg: "{s} gets off {p} back",
    literal_pl: "{s} get off {p} back",
    literal_past: "{s} got off {p} back",
    literal_future: "{s} will get off {p} back",
    present_tense: { msg: "יורד", fsg: "יורדת", mpl: "יורדים", fpl: "יורדות" },
    past_tense: { msg: "ירד", fsg: "ירדה", mpl: "ירדו", fpl: "ירדו" },
    future_tense: { msg: "יירד", fsg: "תירד", mpl: "יירדו", fpl: "יירדו" },
  };
  const { buildAdvConjDeck } = loadAppHarness([], [], [], {
    idioms: [idiom],
    mathRandom: () => 0,
  });

  const deck = buildAdvConjDeck();
  assert.ok(deck.length > 0);
  assert.equal(
    deck.some((card) => card.promptText.includes("you (m.pl.) get off your (sg.) back")),
    false
  );
  assert.equal(
    deck.some((card) => {
      if (!/^you\b/i.test(card.promptText)) return false;
      const extraYouMarkers = card.promptText.match(/you\s*\(/gi) || [];
      return extraYouMarkers.length > 1 || /your\s*\(/i.test(card.promptText);
    }),
    false
  );
});

test("advanced conjugation intro auto-advance is canceled when leaving home", async () => {
  const idiom = {
    id: "ptihat_einayim",
    english: "to open someone's eyes",
    english_meaning: "to open someone's eyes",
    object_type: "l_dative",
    fixed_object: "את העיניים",
    literal_sg: "{s} opens {p} eyes",
    literal_pl: "{s} open {p} eyes",
    literal_past: "{s} opened {p} eyes",
    literal_future: "{s} will open {p} eyes",
    showMeaning: false,
    present_tense: { msg: "פותח", fsg: "פותחת", mpl: "פותחים", fpl: "פותחות" },
    past_tense: { msg: "פתח", fsg: "פתחה", mpl: "פתחו", fpl: "פתחו" },
    future_tense: { msg: "יפתח", fsg: "תפתח", mpl: "יפתחו", fpl: "יפתחו" },
  };
  const { goHome, startAdvConj, state } = loadAppHarness([], [], [], {
    idioms: [idiom],
  });

  startAdvConj();
  assert.equal(state.advConj.introActive, true);

  goHome();
  await waitForTimers();

  assert.equal(state.advConj.active, false);
  assert.equal(state.advConj.introActive, false);
  assert.equal(state.advConj.currentQuestion, null);
});

test("abbreviation and conjugation start flows enter intro state and home clears them", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
    { id: "beta", category: "core_advanced", en: "beta", he: "בטא", heNiqqud: "בֵּטָא", utility: 79, source: "test" },
  ];
  const abbreviations = [
    { id: "abbr-1", abbr: "וכו׳", expansionHe: "וכולי", english: "etc.", bucket: "Daily Life & Home" },
    { id: "abbr-2", abbr: "לדוג׳", expansionHe: "לדוגמה", english: "for example", bucket: "Daily Life & Home" },
  ];
  const verbDeck = [
    {
      word: { id: "verb-go", en: "to go", he: "ללכת", heNiqqud: "לָלֶכֶת" },
      formSource: "validated",
      forms: [
        { id: "present_masculine_singular", englishText: "he goes", valuePlain: "הולך", valueNiqqud: "הוֹלֵךְ" },
        { id: "present_feminine_singular", englishText: "she goes", valuePlain: "הולכת", valueNiqqud: "הוֹלֶכֶת" },
      ],
    },
  ];
  const { goHome, startAbbreviation, startVerbMatch, state } = loadAppHarness(vocabulary, abbreviations, verbDeck);

  startAbbreviation();
  assert.equal(state.abbreviation.introActive, true);
  assert.equal(state.route, "home");

  goHome();
  assert.equal(state.abbreviation.introActive, false);
  assert.equal(state.route, "home");
  assert.equal(state.abbreviation.active, false);
  assert.equal(state.lesson.active, false);
  assert.equal(state.match.active, false);

  startVerbMatch();
  assert.equal(state.match.verbIntroActive, true);
  assert.equal(state.route, "home");

  goHome();
  assert.equal(state.match.verbIntroActive, false);
  assert.equal(state.route, "home");
  assert.equal(state.abbreviation.active, false);
  assert.equal(state.lesson.active, false);
  assert.equal(state.match.active, false);
});

test("starting conjugation immediately swaps out the home picker and shows five visible rows", async () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
  ];
  const verbDeck = [
    {
      word: { id: "verb-cool", en: "to cool", he: "לקרר", heNiqqud: "לְקָרֵר" },
      formSource: "validated",
      forms: [
        { id: "present_masculine_singular", englishText: "he cools", valuePlain: "מקרר", valueNiqqud: "מְקָרֵר" },
        { id: "present_feminine_singular", englishText: "she cools", valuePlain: "מקררת", valueNiqqud: "מְקָרֶרֶת" },
        { id: "past_first_person_singular", englishText: "I cooled", valuePlain: "קיררתי", valueNiqqud: "קִרַּרְתִּי" },
        { id: "future_first_person_singular", englishText: "I will cool", valuePlain: "אקרר", valueNiqqud: "אֲקָרֵר" },
        { id: "present_masculine_plural", englishText: "they (m.pl.) cool", valuePlain: "מקררים", valueNiqqud: "מְקָרְרִים" },
        { id: "present_feminine_plural", englishText: "they (f.pl.) cool", valuePlain: "מקררות", valueNiqqud: "מְקָרְרוֹת" },
      ],
    },
  ];

  const harness = loadAppHarness(vocabulary, [], verbDeck);
  const dashboard = harness.document.querySelector("#homeDashboard");
  const stage = harness.document.querySelector("#homeLessonStage");

  harness.startVerbMatch();
  assert.equal(dashboard.classList.contains("hidden"), true);
  assert.equal(stage.classList.contains("hidden"), false);
  assert.equal(harness.state.match.verbIntroActive, true);

  await waitForTimers();
  assert.equal(harness.state.match.leftCards.length, 5);
  assert.equal(harness.state.match.rightCards.length, 5);
  harness.goHome();
});

test("conjugation keeps English on the left and Hebrew on the right in Hebrew UI", async () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
  ];
  const verbDeck = [
    {
      word: { id: "verb-come", en: "to come", he: "לבוא", heNiqqud: "לָבוֹא" },
      formSource: "validated",
      forms: [
        { id: "present_masculine_singular", englishText: "he comes", valuePlain: "בא", valueNiqqud: "בָּא" },
        { id: "future_first_person_singular", englishText: "I will come", valuePlain: "אבוא", valueNiqqud: "אָבוֹא" },
      ],
    },
  ];

  const harness = loadAppHarness(vocabulary, [], verbDeck);
  harness.state.language = "he";
  harness.startVerbMatch();
  await waitForTimers();

  const columns = harness.document.querySelector("#choiceContainer").querySelector(".match-columns");
  assert.equal(columns.getAttribute("dir"), "ltr");
  assert.equal(columns.children[0].querySelector(".match-card").classList.contains("hebrew"), false);
  assert.equal(columns.children[1].querySelector(".match-card").classList.contains("hebrew"), true);
  harness.goHome();
});

test("conjugation sessions are capped to a small verb set so results are reachable", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
  ];
  const verbDeck = Array.from({ length: 8 }, (_, index) => ({
    word: {
      id: `verb-${index + 1}`,
      en: `to test ${index + 1}`,
      he: `לבדוק${index + 1}`,
      heNiqqud: `לִבְדוֹק${index + 1}`,
    },
    formSource: "validated",
    forms: [
      { id: "present_masculine_singular", englishText: `he tests ${index + 1}`, valuePlain: `בודק${index + 1}`, valueNiqqud: `בּוֹדֵק${index + 1}` },
      { id: "present_feminine_singular", englishText: `she tests ${index + 1}`, valuePlain: `בודקת${index + 1}`, valueNiqqud: `בּוֹדֶקֶת${index + 1}` },
      { id: "past_first_person_singular", englishText: `I tested ${index + 1}`, valuePlain: `בדקתי${index + 1}`, valueNiqqud: `בָּדַקְתִּי${index + 1}` },
      { id: "future_first_person_singular", englishText: `I will test ${index + 1}`, valuePlain: `אבדוק${index + 1}`, valueNiqqud: `אֶבְדּוֹק${index + 1}` },
    ],
  }));

  const { startVerbMatch, state } = loadAppHarness(vocabulary, [], verbDeck);
  startVerbMatch();

  assert.equal(state.match.totalVerbs, 1);
  assert.equal(state.match.verbQueue.length, 1);
});

test("active learn sessions stay pinned to home and restored intros auto-advance into gameplay", async () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
    { id: "beta", category: "core_advanced", en: "beta", he: "בטא", heNiqqud: "בֵּטָא", utility: 79, source: "test" },
    { id: "gamma", category: "core_advanced", en: "gamma", he: "גמא", heNiqqud: "גַּמָּא", utility: 78, source: "test" },
    { id: "delta", category: "core_advanced", en: "delta", he: "דלתא", heNiqqud: "דֶּלְתָּא", utility: 77, source: "test" },
  ];
  const abbreviations = [
    { id: "abbr-1", abbr: "וכו׳", expansionHe: "וכולי", english: "etc.", bucket: "Daily Life & Home" },
    { id: "abbr-2", abbr: "לדוג׳", expansionHe: "לדוגמה", english: "for example", bucket: "Daily Life & Home" },
    { id: "abbr-3", abbr: "בע״ה", expansionHe: "בעזרת השם", english: "with God's help", bucket: "People, Health & Culture" },
    { id: "abbr-4", abbr: "עי׳", expansionHe: "עיין", english: "see / refer to", bucket: "Ideas, Science & Tech" },
  ];
  const verbDeck = [
    {
      word: { id: "verb-go", en: "to go", he: "ללכת", heNiqqud: "לָלֶכֶת" },
      formSource: "validated",
      forms: [
        { id: "present_masculine_singular", englishText: "he goes", valuePlain: "הולך", valueNiqqud: "הוֹלֵךְ" },
        { id: "present_feminine_singular", englishText: "she goes", valuePlain: "הולכת", valueNiqqud: "הוֹלֶכֶת" },
      ],
    },
  ];

  const activeSessionHarness = loadAppHarness(vocabulary, abbreviations, verbDeck);
  activeSessionHarness.startVerbMatch();
  await waitForTimers();
  assert.equal(activeSessionHarness.state.route, "home");
  assert.equal(activeSessionHarness.document.body.getAttribute("data-learn-session"), "true");
  activeSessionHarness.navigateTo("review");
  assert.equal(activeSessionHarness.state.route, "home");
  activeSessionHarness.navigateTo("settings");
  assert.equal(activeSessionHarness.state.route, "home");
  activeSessionHarness.goHome();
  assert.equal(activeSessionHarness.document.body.getAttribute("data-learn-session"), "false");

  const lessonHarness = loadAppHarness(vocabulary, abbreviations, verbDeck);
  lessonHarness.restoreSessionState({
    mode: "lesson",
    route: "review",
    lesson: {
      active: true,
      lessonStartIntroActive: true,
      currentRound: 0,
      secondChanceCurrent: 0,
      secondChanceTotal: 0,
      askedWordIds: [],
      domainCounts: {},
      missedWordIds: [],
      reviewQueue: [],
      optionHistory: {},
      wrongAnswers: 0,
      sessionMistakeIds: [],
    },
  });
  lessonHarness.resumeActiveTimers();
  assert.equal(lessonHarness.state.route, "home");
  await waitForTimers();
  assert.equal(lessonHarness.state.lesson.lessonStartIntroActive, false);
  assert.ok(lessonHarness.state.currentQuestion);
  lessonHarness.goHome();

  const abbreviationHarness = loadAppHarness(vocabulary, abbreviations, verbDeck);
  abbreviationHarness.restoreSessionState({
    mode: "abbreviation",
    route: "settings",
    abbreviation: {
      active: true,
      introActive: true,
      currentRound: 0,
      askedEntryIds: [],
      wrongAnswers: 0,
      sessionMistakeIds: [],
    },
  });
  abbreviationHarness.resumeActiveTimers();
  assert.equal(abbreviationHarness.state.route, "home");
  await waitForTimers();
  assert.equal(abbreviationHarness.state.abbreviation.introActive, false);
  assert.ok(abbreviationHarness.state.abbreviation.currentQuestion);
  abbreviationHarness.goHome();

  const verbHarness = loadAppHarness(vocabulary, abbreviations, verbDeck);
  verbHarness.restoreSessionState({
    mode: "verbMatch",
    route: "review",
    match: {
      active: true,
      verbIntroActive: true,
      verbQueue: verbDeck,
      totalVerbs: verbDeck.length,
      currentVerbIndex: 0,
      pairs: [],
      remainingPairs: [],
      leftCards: [],
      rightCards: [],
      mismatchedCardIds: [],
      matchedCardIds: [],
      matchedPairIds: [],
      sessionMatched: 0,
      sessionTotalPairs: 0,
      mismatchCount: 0,
      sessionMistakeIds: [],
    },
  });
  verbHarness.resumeActiveTimers();
  assert.equal(verbHarness.state.route, "home");
  await waitForTimers();
  assert.equal(verbHarness.state.match.verbIntroActive, false);
  assert.ok(verbHarness.state.match.currentVerb);
  assert.ok(verbHarness.state.match.leftCards.length > 0);
  verbHarness.goHome();
});

test("home button opens a leave confirmation before dropping session progress", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
    { id: "beta", category: "core_advanced", en: "beta", he: "בטא", heNiqqud: "בֵּטָא", utility: 79, source: "test" },
    { id: "gamma", category: "core_advanced", en: "gamma", he: "גמא", heNiqqud: "גַּמָּא", utility: 78, source: "test" },
    { id: "delta", category: "core_advanced", en: "delta", he: "דלתא", heNiqqud: "דֶּלְתָּא", utility: 77, source: "test" },
  ];
  const { closeLeaveSessionConfirm, nextQuestion, requestGoHome, confirmLeaveSession, state } = loadAppHarness(vocabulary);

  state.mode = "lesson";
  state.route = "home";
  state.lesson.active = true;
  nextQuestion();
  assert.ok(state.currentQuestion);

  requestGoHome();
  assert.equal(state.leaveConfirmOpen, true);
  assert.equal(state.lesson.active, true);

  closeLeaveSessionConfirm();
  assert.equal(state.leaveConfirmOpen, false);
  assert.equal(state.lesson.active, true);

  requestGoHome();
  confirmLeaveSession();
  assert.equal(state.leaveConfirmOpen, false);
  assert.equal(state.lesson.active, false);
  assert.equal(state.route, "home");
  assert.equal(state.currentQuestion, null);
});

test("leaving an active game for review keeps the warning and lands on review after confirmation", () => {
  const vocabulary = [
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test" },
    { id: "beta", category: "core_advanced", en: "beta", he: "בטא", heNiqqud: "בֵּטָא", utility: 79, source: "test" },
  ];
  const { confirmLeaveSession, nextQuestion, requestLeaveSession, state } = loadAppHarness(vocabulary);

  state.mode = "lesson";
  state.route = "home";
  state.lesson.active = true;
  nextQuestion();

  requestLeaveSession("review");
  assert.equal(state.leaveConfirmOpen, true);
  assert.equal(state.lesson.active, true);

  confirmLeaveSession();
  assert.equal(state.leaveConfirmOpen, false);
  assert.equal(state.lesson.active, false);
  assert.equal(state.route, "review");
});

test("conjugation summary opens on the results route and home exits without a leave prompt", () => {
  const vocabulary = [
    { id: "verb-go", category: "core_advanced", en: "to go", he: "ללכת", heNiqqud: "לָלֶכֶת", utility: 80, source: "test" },
  ];
  const verbDeck = [
    {
      word: { id: "verb-go", en: "to go", he: "ללכת", heNiqqud: "לָלֶכֶת" },
      formSource: "validated",
      forms: [
        { id: "present_masculine_singular", englishText: "he goes", valuePlain: "הולך", valueNiqqud: "הוֹלֵךְ" },
        { id: "present_feminine_singular", englishText: "she goes", valuePlain: "הולכת", valueNiqqud: "הוֹלֶכֶת" },
      ],
    },
  ];
  const { document, loadNextVerbRound, requestGoHome, state } = loadAppHarness(vocabulary, [], verbDeck);

  state.mode = "verbMatch";
  state.route = "home";
  state.match.active = true;
  state.match.verbQueue = [];
  state.match.totalVerbs = 3;
  state.match.sessionMatched = 7;
  state.match.sessionTotalPairs = 10;
  state.match.bestCombo = 4;
  state.match.elapsedSeconds = 21;
  state.match.mismatchCount = 3;
  state.match.sessionMistakeIds = ["verb-go"];

  loadNextVerbRound();

  assert.equal(state.summary.active, true);
  assert.equal(state.route, "results");
  assert.equal(state.summary.game, "verbMatch");
  assert.equal(state.summary.correctCount, 7);
  assert.equal(state.summary.incorrectCount, 3);
  assert.equal(document.querySelector("#resultsView").classList.contains("active"), true);
  assert.equal(document.querySelector("#resultsNote").textContent, "Nice job!");
  assert.equal(document.querySelector("#resultsSummary").children[0].children.length, 1);
  assert.equal(document.querySelector("#resultsSummary").children[0].children[0].children[0].children.length, 1);
  assert.deepEqual(
    state.summary.mistakes.map((item) => ({ primary: item.primary, secondary: item.secondary })),
    [{ primary: "לָלֶכֶת", secondary: "to go" }]
  );

  requestGoHome();
  assert.equal(state.leaveConfirmOpen, false);
  assert.equal(state.summary.active, false);
  assert.equal(state.route, "home");
});

test("translation pool excludes words marked unavailable for translation quiz", () => {
  const vocabulary = [
    { id: "basic-go", category: "core_advanced", en: "to go", he: "ללכת", heNiqqud: "לָלֶכֶת", utility: 91, source: "verb-seed", availability: { translationQuiz: false, sentenceHints: true } },
    { id: "basic-office", category: "work_business", en: "office", he: "משרד", heNiqqud: "מִשְׂרָד", utility: 82, source: "seed", availability: { translationQuiz: false, sentenceHints: true } },
    { id: "alpha", category: "core_advanced", en: "alpha", he: "אלפא", heNiqqud: "אַלְפָא", utility: 80, source: "test", availability: { translationQuiz: true, sentenceHints: true } },
  ];
  const { getSelectedPool } = loadAppHarness(vocabulary);

  assert.deepEqual(
    Array.from(getSelectedPool(), (word) => word.id),
    ["alpha"]
  );
});
