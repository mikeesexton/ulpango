const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const nativeSetTimeout = global.setTimeout;
const nativeClearTimeout = global.clearTimeout;
const nativeSetInterval = global.setInterval;
const nativeClearInterval = global.clearInterval;
const activeHarnesses = new Set();

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
    this.value = "";
    this.className = "";
  }

  append(...nodes) {
    this.children.push(...nodes);
  }

  appendChild(node) {
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

function loadAppHarness(vocabulary, abbreviations = [], verbDeck = [], options = {}) {
  const sourcePath = path.join(__dirname, "..", "app.js");
  const source = fs.readFileSync(sourcePath, "utf8");
  const instrumented = source.replace(
    /\}\)\(typeof window !== "undefined" \? window : globalThis\);\s*$/,
    `
globalThis.__appTestExports = {
  ADV_CONJ_SUBJECTS,
  ADV_CONJ_OBJECTS,
  applyAnswer,
  applyAbbreviationAnswer,
  applyAdvConjAnswer,
  applyVerbMatchMismatch,
  applyVerbMatchSuccess,
  buildAdvConjEnglishSentence,
  getAdvConjSubjectsForTense,
  beginAbbreviationFromIntro,
  beginLessonFromIntro,
  beginVerbMatchFromIntro,
  confirmLeaveSession,
  closeLeaveSessionConfirm,
  closeWelcomeModal,
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
  renderChoices,
  requestLeaveSession,
  requestGoHome,
  resumeActiveTimers,
  restoreSessionState,
  startAbbreviation,
  startAdvConj,
  startVerbMatch,
  toggleSoundPreference,
  updateProgress,
  state,
};
})(typeof window !== "undefined" ? window : globalThis);
`
  );

  const audioPlayLog = [];
  const audioLoadLog = [];
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

  const context = {
    console,
    Math,
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
    IvriQuestHebrewVerbs: {
      MATCH_FORM_ORDER: [
        "present_masculine_singular",
        "present_feminine_singular",
        "past_first_person_singular",
        "future_first_person_singular",
        "present_masculine_plural",
        "present_feminine_plural",
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
  vm.runInContext(instrumented, context, { filename: sourcePath });
  const harness = {
    ...context.__appTestExports,
    audioLoadLog,
    audioPlayLog,
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

test("advanced conjugation English prompts disambiguate second-person singular vs plural possession", () => {
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
    "they (f.) opened your (sg.) eyes"
  );
  assert.equal(
    buildAdvConjEnglishSentence(idiom, subj, pluralYou, "past"),
    "they (f.) opened your (pl.) eyes"
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
