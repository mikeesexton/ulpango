const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

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
    this.textContent = "";
    this.innerHTML = "";
    this.disabled = false;
    this.className = "";
    this.value = "";
  }

  append(...nodes) {
    this.children.push(...nodes);
  }

  appendChild(node) {
    this.children.push(node);
    return node;
  }

  addEventListener() {}

  removeEventListener() {}

  querySelector() {
    return new FakeElement();
  }

  querySelectorAll() {
    return [];
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
  applyAnswer,
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
  requestLeaveSession,
  requestGoHome,
  resumeActiveTimers,
  restoreSessionState,
  startAbbreviation,
  startVerbMatch,
  updateProgress,
  state,
};
})(typeof window !== "undefined" ? window : globalThis);
`
  );

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
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    __IVRIQUEST_TEST_CONFIG__: {
      introAutoAdvanceMs: 0,
    },
    document,
    localStorage: createLocalStorage(options.localStorageData || {
      "ivriquest-welcome-seen-v1": "1",
    }),
    confirm() {
      return false;
    },
    addEventListener() {},
    removeEventListener() {},
    location: { search: "" },
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
  return context.__appTestExports;
}

function waitForTimers() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

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

  assert.equal(state.match.totalVerbs, 5);
  assert.equal(state.match.verbQueue.length, 5);
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
