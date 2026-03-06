(function initIvriQuestApp(global) {
"use strict";
const APP_BUILD = "20260306b";

if (global.__ivriquestAppInitialized === APP_BUILD) {
  return;
}
global.__ivriquestAppInitialized = APP_BUILD;

const fallbackVocabApi = {
  CATEGORY_META: {
    core_advanced: {
      label: "Duolingo Advanced Core",
      description: "Fallback advanced set.",
      defaultSelected: true,
    },
    cooking_utensils: {
      label: "Cooking Utensils",
      description: "Fallback kitchen tools set.",
      defaultSelected: true,
    },
    cooking_verbs: {
      label: "Cooking Verbs",
      description: "Fallback cooking actions set.",
      defaultSelected: true,
    },
    health: {
      label: "Health",
      description: "Fallback health vocabulary set.",
      defaultSelected: true,
    },
    work_business: {
      label: "Work & Business",
      description: "Fallback business set.",
      defaultSelected: true,
    },
    bureaucracy: {
      label: "Bureaucracy",
      description: "Fallback bureaucracy set.",
      defaultSelected: true,
    },
    home_everyday_life: {
      label: "Home & Everyday Life",
      description: "Fallback home and daily-life set.",
      defaultSelected: true,
    },
  },
  getBaseVocabulary() {
    return [
      { id: "fb-core-priority", category: "core_advanced", en: "priority", he: "עדיפות", heNiqqud: "עֲדִיפוּת", utility: 90, source: "fallback" },
      { id: "fb-core-approach", category: "core_advanced", en: "approach", he: "גישה", heNiqqud: "גִּישָׁה", utility: 88, source: "fallback" },
      { id: "fb-utensils-ladle", category: "cooking_utensils", en: "ladle", he: "מצקת", heNiqqud: "מַצֶּקֶת", utility: 86, source: "fallback" },
      { id: "fb-utensils-whisk", category: "cooking_utensils", en: "whisk", he: "מטרפה", heNiqqud: "מַטְרֵפָה", utility: 86, source: "fallback" },
      { id: "fb-verbs-simmer", category: "cooking_verbs", en: "to simmer", he: "לבשל על אש קטנה", heNiqqud: "לְבַשֵּׁל עַל אֵשׁ קְטַנָּה", utility: 86, source: "fallback" },
      { id: "fb-verbs-season", category: "cooking_verbs", en: "to season", he: "לתבל", heNiqqud: "לְתַבֵּל", utility: 84, source: "fallback" },
      { id: "fb-health-referral", category: "health", en: "referral", he: "הפניה", heNiqqud: "הַפְנָיָה", utility: 84, source: "fallback" },
      { id: "fb-health-diagnosis", category: "health", en: "diagnosis", he: "אבחנה", heNiqqud: "אִבְחָנָה", utility: 84, source: "fallback" },
      { id: "fb-work-stakeholder", category: "work_business", en: "stakeholder", he: "בעל עניין", heNiqqud: "בַּעַל עִנְיָן", utility: 83, source: "fallback" },
      { id: "fb-work-deadline", category: "work_business", en: "deadline", he: "מועד אחרון", heNiqqud: "מוֹעֵד אַחֲרוֹן", utility: 83, source: "fallback" },
      { id: "fb-bureau-eligibility", category: "bureaucracy", en: "eligibility", he: "זכאות", heNiqqud: "זַכָּאוּת", utility: 83, source: "fallback" },
      { id: "fb-bureau-permit", category: "bureaucracy", en: "permit", he: "היתר", heNiqqud: "הֶתֵּר", utility: 82, source: "fallback" },
      { id: "fb-home-shelf", category: "home_everyday_life", en: "shelf", he: "מדף", heNiqqud: "מַדָּף", utility: 86, source: "fallback" },
      { id: "fb-home-drawer", category: "home_everyday_life", en: "drawer", he: "מגירה", heNiqqud: "מְגִירָה", utility: 86, source: "fallback" },
      { id: "fb-home-cabinet", category: "home_everyday_life", en: "cabinet", he: "ארון", heNiqqud: "אָרוֹן", utility: 86, source: "fallback" },
      { id: "fb-home-maintenance", category: "home_everyday_life", en: "maintenance", he: "תחזוקה", heNiqqud: "תַּחְזוּקָה", utility: 84, source: "fallback" },
      { id: "fb-home-clog", category: "home_everyday_life", en: "clog", he: "סתימה", heNiqqud: "סְתִימָה", utility: 84, source: "fallback" },
    ];
  },
};

const fallbackAbbreviationApi = {
  getAbbreviations() {
    return [
      {
        id: "fb-abbr-etc",
        abbr: "וכו׳",
        expansionHe: "וכולי",
        english: "etc. / and so on",
        bucket: "Daily Life & Home",
        notes: "",
        source: "fallback",
      },
      {
        id: "fb-abbr-eg",
        abbr: "לדוג׳",
        expansionHe: "לדוגמה",
        english: "for example",
        bucket: "Daily Life & Home",
        notes: "",
        source: "fallback",
      },
      {
        id: "fb-abbr-vs",
        abbr: "לעו״ז",
        expansionHe: "לעומת זאת",
        english: "on the other hand / in contrast",
        bucket: "Ideas, Science & Tech",
        notes: "",
        source: "fallback",
      },
      {
        id: "fb-abbr-ref",
        abbr: "עי׳",
        expansionHe: "עיין",
        english: "see / refer to",
        bucket: "Daily Life & Home",
        notes: "",
        source: "fallback",
      },
      {
        id: "fb-abbr-bh",
        abbr: "בע״ה",
        expansionHe: "בעזרת השם",
        english: "with God's help",
        bucket: "People, Health & Culture",
        notes: "",
        source: "fallback",
      },
    ];
  },
};

const fallbackVerbApi = {
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
  ],
  getSeedVocabularyEntries() {
    return [];
  },
  buildVerbConjugationDeck() {
    return [];
  },
};

const vocabApi = global.IvriQuestVocab ? global.IvriQuestVocab : fallbackVocabApi;
const usingFallbackVocab = vocabApi === fallbackVocabApi;
const abbreviationApi = global.IvriQuestAbbreviations ? global.IvriQuestAbbreviations : fallbackAbbreviationApi;
const usingFallbackAbbreviations = abbreviationApi === fallbackAbbreviationApi;
const verbApi = global.IvriQuestHebrewVerbs ? global.IvriQuestHebrewVerbs : fallbackVerbApi;

const getBaseVocabularyFn = vocabApi.getBaseVocabulary;
const getAbbreviationsFn = abbreviationApi.getAbbreviations;
const expansionTracks = vocabApi.EXPANSION_TRACKS || {};
const expansionTrackCount = Object.values(expansionTracks).reduce(
  (sum, group) => sum + (Array.isArray(group) ? group.length : 0),
  0
);

const I18N = {
  en: {
    app: {
      title: "Ulpango | Advanced Hebrew Trainer",
      name: "Ulpango",
    },
    top: {
      eyebrow: "Browser-Only Hebrew Mastery",
      subhead: "Advanced vocabulary trainer inspired by Duolingo, tuned for real-world fluency.",
      accuracy: "Accuracy",
      streak: "Current Streak",
    },
    controls: {
      settings: "Settings",
      interface: "Interface",
      lightMode: "Light Mode",
      darkMode: "Dark Mode",
      reset: "Reset Progress",
      resetConfirm: "Reset all spaced-repetition progress and streak data?",
    },
    perf: {
      eyebrow: "Performance Snapshot",
      title: "Vocabulary Type",
      note: "Since your last progress reset",
    },
    session: {
      eyebrow: "Session",
      mixedTitle: "Translation",
      secondChanceTitle: "Translation Review",
      verbMatchTitle: "Conjugation",
      abbreviationTitle: "Abbreviation",
      round: "Round: {current}/{total}",
      secondChanceProgress: "Second chance: {current}/{total}",
      secondChanceContinue: "Start Second Chance",
      words: "Words: {count}",
      timer: "Time: {seconds}s",
      score: "Score: {score}",
      start: "Start Translation",
      restart: "Restart Translation",
      verbMatchStart: "Start Conjugation",
      verbMatchRestart: "Restart Conjugation",
      abbreviationStart: "Start Abbreviation",
      abbreviationRestart: "Restart Abbreviation",
      nextVerb: "Next Verb",
      skip: "Skip",
      next: "Next",
      lastAnswer: "Last Answer",
      backToCurrent: "Back To Current",
      backHome: "Back to Home",
      playAgain: "Play Again",
    },
    home: {
      title: "Choose A Game",
      status: "Pick a mode to start.",
      label: "Homepage",
      prompt: "Choose one of the three game modes below.",
    },
    game: {
      translationName: "Translation",
      translationNote: "Fast multiple-choice translation rounds.",
      conjugationName: "Conjugation",
      conjugationNote: "Match English forms to Hebrew conjugations.",
      abbreviationName: "Abbreviation",
      abbreviationNote: "Guess English meanings from Hebrew abbreviations.",
    },
    prompt: {
      lesson: "Lesson",
      start: 'Press "Start Translation" to begin.',
      verbMatchStart: 'Press "Start Conjugation" to practice conjugations and root forms.',
      abbreviation: "Abbreviation",
      abbreviationStart: 'Press "Start Abbreviation" to guess meanings and see full Hebrew expansions.',
      noAbbreviationTitle: "No abbreviations loaded",
      noAbbreviationBody: "Ask the agent to update abbreviation-data.js, then reload.",
      noVocabTitle: "No vocabulary loaded",
      noVocabBody: "Ask the agent to update vocab-data.js, then reload.",
      masteredOnlyTitle: "Translation pool is empty",
      masteredOnlyBody: 'All words are mastered for translation. Open "Mastered List" to restore words.',
      showNiqqud: "Show Nikud",
      hideNiqqud: "Hide Nikud",
      toEnglish: "Translate to English",
      toHebrew: "Translate to Hebrew",
      reviewToEnglish: "Second Chance: Translate to English",
      reviewToHebrew: "Second Chance: Translate to Hebrew",
    },
    feedback: {
      correct: "Correct: {answer}",
      wrong: "Not quite. Correct answer: {answer} ({english})",
      abbreviationCorrect: "Correct: {english} | {expansion}",
      abbreviationWrong: "Not quite. Correct answer: {english} | {expansion}",
      lastAnswerMissing: "No previous answer yet in this game.",
      lessonDone: "Lesson complete. Final score {score}/{total}.",
      reviewAdded: "Second chance rounds included: {count}.",
      startAnother: 'Press "Start Translation" to run another round.',
      reviewIntro: "Second chance round: retry {count} words you missed.",
      matchDoneVerb: "Verb complete: {verb}.",
      matchDoneAll: "Conjugation session complete. Verbs covered: {count}.",
    },
    summary: {
      resultsHeader: "Session Results",
      lessonTitle: "Translation Complete",
      matchTitle: "Conjugation Complete",
      abbreviationTitle: "Abbreviation Complete",
      score: "Score: {score}/{total}",
      lessonNote: "Second-chance rounds: {count}",
      lessonNoteNone: "No second-chance rounds this run.",
      matchNote: "Verbs: {verbs} | Best combo: {combo} | Time: {seconds}s",
      abbreviationNote: "Rounds: {rounds} | Time: {seconds}s",
      thumbsText: "Great work",
    },
    match: {
      prompt: "Match the pairs",
      verbLabel: "Verb",
      leftColumn: "English",
      rightColumn: "Hebrew",
      progress: "Pairs: {current}/{total}",
      verbProgress: "Verb: {current}/{total}",
      timer: "Time: {seconds}s",
      combo: "Combo x{count}",
      roundDone: "Great. You matched all forms for {verb}.",
      noVerbs: "No verbs found in the vocabulary list.",
      validatedNote: "Using stored validated forms for this verb.",
      generatedNote: "Using validated generated forms for an explicitly safe verb.",
    },
    pool: {
      summary: "Unified vocabulary pool: {pool} words with nikud ({total} total).",
      expansion: "Expansion tracks mapped: {count}.",
      tempProgress: "Progress is temporary in this browser mode (storage unavailable).",
      fallback: "Fallback vocab loaded because vocab-data.js was not available.",
    },
    missed: {
      title: "Most Missed",
      note: "Words you have missed most often.",
      empty: "No misses yet.",
      misses: "{count} misses",
    },
    mastered: {
      open: "Mastered List",
      title: "Mastered Words",
      note: "Mastered words are excluded from Translation but still used in Conjugation.",
      selectHint: "Select words to restore to translation testing.",
      empty: "No mastered words yet.",
      restoreSelected: "Restore Selected",
      close: "Close",
      moveCurrent: "Move To Mastered",
      streakStatus: "Clean streak: {count}/{target}",
      ready: "{verb} reached {target} clean rounds. You can move it to Mastered.",
      added: "{word} moved to Mastered.",
      restored: "Restored {count} words to translation.",
    },
    domain: {
      daily: "Daily Life & Home",
      people: "People, Health & Culture",
      systems: "Civics, Law & Work",
      ideas: "Ideas, Science & Tech",
    },
  },
  he: {
    app: {
      title: "אולפנגו | מאמן עברית מתקדם",
      name: "אולפנגו",
    },
    top: {
      eyebrow: "שליטה בעברית בדפדפן בלבד",
      subhead: "מאמן אוצר מילים מתקדם בהשראת Duolingo, מותאם לשטף בשימוש אמיתי.",
      accuracy: "דיוק",
      streak: "רצף נוכחי",
    },
    controls: {
      settings: "הגדרות",
      interface: "ממשק",
      lightMode: "מצב בהיר",
      darkMode: "מצב כהה",
      reset: "איפוס התקדמות",
      resetConfirm: "לאפס את כל התקדמות החזרות והסטטיסטיקות?",
    },
    perf: {
      eyebrow: "תמונת ביצועים",
      title: "סוג אוצר מילים",
      note: "מאז איפוס ההתקדמות האחרון",
    },
    session: {
      eyebrow: "אימון",
      mixedTitle: "תרגום",
      secondChanceTitle: "סבב הזדמנות שנייה",
      verbMatchTitle: "נטיות",
      abbreviationTitle: "קיצורים",
      round: "סבב: {current}/{total}",
      secondChanceProgress: "הזדמנות שנייה: {current}/{total}",
      secondChanceContinue: "התחל הזדמנות שנייה",
      words: "מילים: {count}",
      timer: "זמן: {seconds}ש׳",
      score: "ציון: {score}",
      start: "התחל תרגום",
      restart: "התחל תרגום מחדש",
      verbMatchStart: "התחל נטיות",
      verbMatchRestart: "התחל נטיות מחדש",
      abbreviationStart: "התחל קיצורים",
      abbreviationRestart: "התחל קיצורים מחדש",
      nextVerb: "לפועל הבא",
      skip: "דלג",
      next: "הבא",
      lastAnswer: "תשובה אחרונה",
      backToCurrent: "חזרה לנוכחי",
      backHome: "חזרה לעמוד הבית",
      playAgain: "שחק שוב",
    },
    home: {
      title: "בחר משחק",
      status: "בחר מצב כדי להתחיל.",
      label: "דף הבית",
      prompt: "בחר אחד משלושת מצבי המשחק כאן למטה.",
    },
    game: {
      translationName: "תרגום",
      translationNote: "סבבי תרגום מהירים במתכונת בחירה מרובה.",
      conjugationName: "נטיות",
      conjugationNote: "התאם בין נטיות באנגלית לנטיות בעברית.",
      abbreviationName: "קיצורים",
      abbreviationNote: "נחש את המשמעות באנגלית לפי קיצור בעברית.",
    },
    prompt: {
      lesson: "שיעור",
      start: 'לחץ על "התחל תרגום" כדי להתחיל.',
      verbMatchStart: 'לחץ על "התחל נטיות" כדי לתרגל נטיות ושמות שורש.',
      abbreviation: "קיצור",
      abbreviationStart: 'לחץ על "התחל קיצורים" כדי לנחש משמעות ולקבל את הפירוש המלא.',
      noAbbreviationTitle: "אין קיצורים טעונים",
      noAbbreviationBody: "בקש מהסוכן לעדכן את abbreviation-data.js ואז טען מחדש.",
      noVocabTitle: "אין אוצר מילים טעון",
      noVocabBody: "בקש מהסוכן לעדכן את vocab-data.js ואז טען מחדש.",
      masteredOnlyTitle: "אין מילים זמינות לתרגום",
      masteredOnlyBody: 'כל המילים תויגו כ"מנוסה". פתח את "רשימת מנוסות" כדי להחזיר מילים לתרגול תרגום.',
      showNiqqud: "הצג ניקוד",
      hideNiqqud: "הסתר ניקוד",
      toEnglish: "תרגם לאנגלית",
      toHebrew: "תרגם לעברית",
      reviewToEnglish: "הזדמנות שנייה: תרגם לאנגלית",
      reviewToHebrew: "הזדמנות שנייה: תרגם לעברית",
    },
    feedback: {
      correct: "נכון: {answer}",
      wrong: "לא מדויק. התשובה הנכונה: {answer} ({english})",
      abbreviationCorrect: "נכון: {english} | {expansion}",
      abbreviationWrong: "לא מדויק. התשובה הנכונה: {english} | {expansion}",
      lastAnswerMissing: "עדיין אין תשובה קודמת במשחק הזה.",
      lessonDone: "השיעור הושלם. ציון סופי {score}/{total}.",
      reviewAdded: "נכללו סבבי הזדמנות שנייה: {count}.",
      startAnother: 'לחץ על "התחל תרגום" כדי להתחיל עוד סבב.',
      reviewIntro: "סבב הזדמנות שנייה: נסה שוב {count} מילים שפספסת.",
      matchDoneVerb: "הפועל הושלם: {verb}.",
      matchDoneAll: "אימון הנטיות הושלם. פעלים שכוסו: {count}.",
    },
    summary: {
      resultsHeader: "סיכום אימון",
      lessonTitle: "תרגום הושלם",
      matchTitle: "נטיות הושלמו",
      abbreviationTitle: "קיצורים הושלמו",
      score: "ציון: {score}/{total}",
      lessonNote: "סבבי הזדמנות שנייה: {count}",
      lessonNoteNone: "בסבב הזה לא היו סבבי הזדמנות שנייה.",
      matchNote: "פעלים: {verbs} | קומבו שיא: {combo} | זמן: {seconds}ש׳",
      abbreviationNote: "סבבים: {rounds} | זמן: {seconds}ש׳",
      thumbsText: "כל הכבוד",
    },
    match: {
      prompt: "התאם בין הזוגות",
      verbLabel: "פועל",
      leftColumn: "אנגלית",
      rightColumn: "עברית",
      progress: "זוגות: {current}/{total}",
      verbProgress: "פועל: {current}/{total}",
      timer: "זמן: {seconds}ש׳",
      combo: "קומבו x{count}",
      roundDone: "מעולה. התאמת את כל הנטיות עבור {verb}.",
      noVerbs: "לא נמצאו פעלים ברשימת אוצר המילים.",
      validatedNote: "נעשה שימוש בצורות מאומתות ושמורות עבור הפועל הזה.",
      generatedNote: "נעשה שימוש בצורות מחוללות ומאומתות עבור פועל שסומן בטוח להפקה.",
    },
    pool: {
      summary: "מאגר אחוד: {pool} מילים עם ניקוד ({total} בסך הכול).",
      expansion: "מסלולי הרחבה שמופו: {count}.",
      tempProgress: "ההתקדמות זמנית בדפדפן זה (אחסון לא זמין).",
      fallback: "נטען אוצר מילים חלופי כי vocab-data.js לא היה זמין.",
    },
    missed: {
      title: "הלוח שפספסת הכי הרבה",
      note: "המילים שטעית בהן בתדירות הגבוהה ביותר.",
      empty: "עדיין אין פספוסים.",
      misses: "{count} פספוסים",
    },
    mastered: {
      open: "רשימת מנוסות",
      title: "מילים מנוסות",
      note: "מילים מנוסות יוצאות מסבבי תרגום אבל נשארות בסבבי נטיות.",
      selectHint: "סמן מילים שתרצה להחזיר לתרגול תרגום.",
      empty: "אין עדיין מילים מנוסות.",
      restoreSelected: "החזר מסומנות",
      close: "סגור",
      moveCurrent: "העבר למנוסות",
      streakStatus: "רצף נקי: {count}/{target}",
      ready: "הפועל {verb} הגיע ל-{target} סבבים נקיים. אפשר להעביר לרשימת מנוסות.",
      added: "{word} הועבר לרשימת מנוסות.",
      restored: "הוחזרו {count} מילים לתרגול תרגום.",
    },
    domain: {
      daily: "חיי יום־יום ובית",
      people: "אנשים, בריאות ותרבות",
      systems: "אזרחות, משפט ועבודה",
      ideas: "רעיונות, מדע וטכנולוגיה",
    },
  },
};

const STORAGE_KEYS = {
  progress: "ivriquest-progress-v1",
  language: "ivriquest-language-v1",
  theme: "ivriquest-theme-v1",
};

const storage = getStorage();

const LEITNER_INTERVALS = [
  0,
  8 * 60 * 1000,
  45 * 60 * 1000,
  4 * 60 * 60 * 1000,
  20 * 60 * 60 * 1000,
  3 * 24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
  14 * 24 * 60 * 60 * 1000,
];

const LESSON_ROUNDS = 10;
const ABBREVIATION_ROUNDS = 10;
const MATCH_MAX_PAIRS = 12;
const MATCH_VISIBLE_ROWS = 5;
const CONJUGATION_MASTER_STREAK = 10;
const MATCH_FORM_ORDER = Array.isArray(verbApi.MATCH_FORM_ORDER) && verbApi.MATCH_FORM_ORDER.length
  ? [...verbApi.MATCH_FORM_ORDER]
  : [...fallbackVerbApi.MATCH_FORM_ORDER];

const HEBREW_FINAL_TO_MEDIAL = {
  ך: "כ",
  ם: "מ",
  ן: "נ",
  ף: "פ",
  ץ: "צ",
};

const HEBREW_MEDIAL_TO_FINAL = {
  כ: "ך",
  מ: "ם",
  נ: "ן",
  פ: "ף",
  צ: "ץ",
};

const PERFORMANCE_DOMAINS = [
  {
    id: "daily",
    emoji: "🏠",
    label: "Daily Life & Home",
    categories: new Set([
      "cooking_utensils",
      "cooking_verbs",
      "home_everyday_life",
      "everyday_survival_expanded",
    ]),
  },
  {
    id: "people",
    emoji: "💬",
    label: "People, Health & Culture",
    categories: new Set([
      "health",
      "health_body_expanded",
      "emotional_nuance",
      "emotional_psychological_expanded",
      "dating_relationships",
      "relationships_dating_expanded",
      "communication_mastery_expanded",
      "conversation_glue",
      "media_digital_life_expanded",
      "social_cultural",
      "culture_identity_expanded",
    ]),
  },
  {
    id: "systems",
    emoji: "⚖️",
    label: "Civics, Law & Work",
    categories: new Set([
      "bureaucracy",
      "legal_civic",
      "law_legal_systems_expanded",
      "politics_society_expanded",
      "high_level_discourse_expanded",
      "work_business",
      "finance_investing",
      "business_finance_expanded",
    ]),
  },
  {
    id: "ideas",
    emoji: "📚",
    label: "Ideas, Science & Tech",
    categories: new Set([
      "core_advanced",
      "abstract_philosophy",
      "abstract_concepts_expanded",
      "meta_language",
      "advanced_grammar_meta_expanded",
      "scientific_analytical",
      "science_research_expanded",
      "philosophy_intellectual_expanded",
      "technology_ai",
      "technology_ai_expanded",
    ]),
  },
];
const DOMAIN_BY_CATEGORY = buildDomainByCategoryMap(PERFORMANCE_DOMAINS);
const FALLBACK_DOMAIN_ID = PERFORMANCE_DOMAINS[PERFORMANCE_DOMAINS.length - 1]?.id || "ideas";

const baseVocabulary = prepareVocabulary([
  ...getBaseVocabularyFn(),
  ...(typeof verbApi.getSeedVocabularyEntries === "function" ? verbApi.getSeedVocabularyEntries() : []),
]);
const abbreviationDeck = prepareAbbreviationDeck(getAbbreviationsFn());
const abbreviationIdSet = new Set(abbreviationDeck.map((entry) => entry.id));
const verbFormDeck = typeof verbApi.buildVerbConjugationDeck === "function"
  ? verbApi.buildVerbConjugationDeck({ vocabulary: baseVocabulary })
  : [];

const el = {
  lessonBtn: document.querySelector("#lessonBtn"),
  verbMatchBtn: document.querySelector("#verbMatchBtn"),
  abbreviationBtn: document.querySelector("#abbreviationBtn"),
  homeBtn: document.querySelector("#homeBtn"),
  gamePicker: document.querySelector("#gamePicker"),
  statusRow: document.querySelector(".status-row"),
  langToggle: document.querySelector("#langToggle"),
  themeToggle: document.querySelector("#themeToggle"),
  lessonStatus: document.querySelector("#lessonStatus"),
  poolMeta: document.querySelector("#poolMeta"),
  modeTitle: document.querySelector("#modeTitle"),
  promptCard: document.querySelector(".prompt-card"),
  promptLabel: document.querySelector("#promptLabel"),
  promptText: document.querySelector("#promptText"),
  niqqudToggle: document.querySelector("#niqqudToggle"),
  choiceContainer: document.querySelector("#choiceContainer"),
  feedback: document.querySelector("#feedback"),
  vocabCount: document.querySelector("#vocabCount"),
  sessionScore: document.querySelector("#sessionScore"),
  nextBtn: document.querySelector("#nextBtn"),
  lastAnswerBtn: document.querySelector("#lastAnswerBtn"),
  masterVerbBtn: document.querySelector("#masterVerbBtn"),
  resetProgress: document.querySelector("#resetProgress"),
  domainPerformance: document.querySelector("#domainPerformance"),
  modePerformance: document.querySelector("#modePerformance"),
  statAccuracy: document.querySelector("#statAccuracy"),
  statStreak: document.querySelector("#statStreak"),
  mostMissedList: document.querySelector("#mostMissedList"),
  mostMissedEmpty: document.querySelector("#mostMissedEmpty"),
  masteredOpenBtn: document.querySelector("#masteredOpenBtn"),
  masteredModal: document.querySelector("#masteredModal"),
  masteredCloseBtn: document.querySelector("#masteredCloseBtn"),
  masteredList: document.querySelector("#masteredList"),
  masteredEmpty: document.querySelector("#masteredEmpty"),
  masteredRestoreBtn: document.querySelector("#masteredRestoreBtn"),
  lessonStartIntro: document.querySelector("#lessonStartIntro"),
  lessonStartContinue: document.querySelector("#lessonStartContinue"),
  secondChanceIntro: document.querySelector("#secondChanceIntro"),
  secondChanceContinue: document.querySelector("#secondChanceContinue"),
  verbMatchIntro: document.querySelector("#verbMatchIntro"),
  verbMatchContinue: document.querySelector("#verbMatchContinue"),
  abbreviationIntro: document.querySelector("#abbreviationIntro"),
  abbreviationContinue: document.querySelector("#abbreviationContinue"),
  translatable: Array.from(document.querySelectorAll("[data-i18n]")),
};

const state = {
  progress: loadJson(STORAGE_KEYS.progress, {}),
  language: loadLanguagePreference(),
  theme: loadThemePreference(),
  mode: "home",
  currentQuestion: null,
  sessionScore: 0,
  sessionStreak: 0,
  showNiqqudInline: false,
  masteredModalOpen: false,
  masteredSelection: new Set(),
  lastAnswer: {
    lesson: null,
    abbreviation: null,
  },
  lastAnswerView: {
    active: false,
    mode: "",
  },
  summary: {
    active: false,
    game: "",
    titleKey: "",
    titleVars: {},
    scoreKey: "",
    scoreVars: {},
    noteKey: "",
    noteVars: {},
  },
  lesson: {
    active: false,
    currentRound: 0,
    secondChanceCurrent: 0,
    secondChanceTotal: 0,
    startMs: 0,
    elapsedSeconds: 0,
    timerId: null,
    askedWordIds: [],
    domainCounts: {},
    missedWordIds: [],
    reviewQueue: [],
    inReview: false,
    lessonStartIntroActive: false,
    secondChanceIntroActive: false,
    optionHistory: {},
  },
  abbreviation: {
    active: false,
    currentRound: 0,
    startMs: 0,
    elapsedSeconds: 0,
    timerId: null,
    askedEntryIds: [],
    introActive: false,
    currentQuestion: null,
  },
  match: {
    active: false,
    verbQueue: [],
    totalVerbs: 0,
    currentVerbIndex: 0,
    currentVerb: null,
    pairs: [],
    remainingPairs: [],
    leftCards: [],
    rightCards: [],
    selectedLeftId: null,
    selectedRightId: null,
    mismatchedCardIds: [],
    matchedCardIds: [],
    matchedPairIds: [],
    isResolving: false,
    nextCardId: 1,
    combo: 0,
    bestCombo: 0,
    matchedCount: 0,
    totalPairs: 0,
    startMs: 0,
    elapsedSeconds: 0,
    timerId: null,
    verbIntroActive: false,
    sessionMatched: 0,
    sessionTotalPairs: 0,
    currentVerbHadMismatch: false,
    eligibleMasterWordId: "",
  },
};

if (usingFallbackVocab) {
  // Keep app usable even when vocab-data.js fails to load.
  console.warn("Ulpango: using fallback vocabulary because vocab-data.js was unavailable.");
}

if (usingFallbackAbbreviations) {
  // Keep abbreviation mode available even when abbreviation-data.js fails to load.
  console.warn("Ulpango: using fallback abbreviations because abbreviation-data.js was unavailable.");
}

sanitizeState();
applyTheme();
applyLanguage();
bindUi();
renderAll();

function bindUi() {
  el.lessonBtn.addEventListener("click", () => {
    state.mode = "lesson";
    startLesson();
  });
  el.verbMatchBtn?.addEventListener("click", () => {
    state.mode = "verbMatch";
    startVerbMatch();
  });
  el.abbreviationBtn?.addEventListener("click", () => {
    state.mode = "abbreviation";
    startAbbreviation();
  });
  el.nextBtn.addEventListener("click", () => handleNextAction());
  el.lastAnswerBtn?.addEventListener("click", () => showLastAnswer());
  el.masterVerbBtn?.addEventListener("click", () => moveEligibleVerbToMastered());
  el.homeBtn?.addEventListener("click", () => goHome());
  el.langToggle?.addEventListener("click", () => toggleLanguage());
  el.themeToggle?.addEventListener("click", () => toggleTheme());
  el.masteredOpenBtn?.addEventListener("click", () => openMasteredModal());
  el.masteredCloseBtn?.addEventListener("click", () => closeMasteredModal());
  el.masteredRestoreBtn?.addEventListener("click", () => restoreSelectedMasteredWords());
  el.masteredModal?.addEventListener("click", (event) => {
    if (event.target === el.masteredModal) {
      closeMasteredModal();
    }
  });
  global.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.masteredModalOpen) {
      closeMasteredModal();
    }
  });

  el.niqqudToggle.addEventListener("click", () => {
    if (state.mode === "home" || state.mode === "summary") {
      return;
    }
    if (state.mode === "verbMatch") {
      state.showNiqqudInline = !state.showNiqqudInline;
      if (state.match.active) {
        renderVerbMatchCards();
        renderPromptText();
      } else {
        renderVerbMatchIdleState();
      }
      return;
    }
    if (state.mode === "abbreviation") {
      state.showNiqqudInline = !state.showNiqqudInline;
      if (state.abbreviation.active) {
        renderAbbreviationQuestion();
      } else {
        renderAbbreviationIdleState();
      }
      return;
    }
    state.showNiqqudInline = !state.showNiqqudInline;
    renderPromptText();
    if (state.currentQuestion) {
      renderChoices(state.currentQuestion);
    }
  });
  el.lessonStartContinue?.addEventListener("click", () => beginLessonFromIntro());
  el.secondChanceContinue?.addEventListener("click", () => beginSecondChanceFromIntro());
  el.verbMatchContinue?.addEventListener("click", () => beginVerbMatchFromIntro());
  el.abbreviationContinue?.addEventListener("click", () => beginAbbreviationFromIntro());

  el.resetProgress.addEventListener("click", () => {
    const ok = window.confirm(t("controls.resetConfirm"));
    if (!ok) return;

    state.progress = {};
    state.masteredSelection = new Set();
    state.match.eligibleMasterWordId = "";
    resetSessionCounters();
    resetAbbreviationState();
    saveProgress();
    renderMostMissed();
    renderMasteredModal();
    renderAll();
    if (state.mode === "lesson" && state.lesson.active) {
      nextQuestion();
    }
  });
}

function sanitizeState() {
  // Remove legacy keys from older versions.
  if (storage) {
    try {
      storage.removeItem("ivriquest-settings-v1");
      storage.removeItem("ivriquest-custom-v1");
    } catch {
      // ignore
    }
  }
}

function applyLanguage() {
  global.document.body?.setAttribute("data-ui-lang", state.language);
  global.document.documentElement.lang = state.language === "he" ? "he" : "en";
  global.document.title = t("app.title");

  el.translatable.forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (!key) return;
    node.textContent = t(key);
  });

  if (el.langToggle) {
    el.langToggle.textContent = state.language === "en" ? "עברית" : "English";
  }

  renderThemeToggle();
}

function applyTheme() {
  const theme = state.theme === "light" ? "light" : "dark";
  global.document.body?.setAttribute("data-theme", theme);
  global.document.documentElement.style.colorScheme = theme;
  renderThemeToggle();
}

function toggleLanguage() {
  state.language = state.language === "en" ? "he" : "en";
  saveLanguagePreference(state.language);
  applyLanguage();
  renderAll();
}

function toggleTheme() {
  state.theme = state.theme === "light" ? "dark" : "light";
  saveThemePreference(state.theme);
  applyTheme();
}

function getLocaleBundle() {
  return I18N[state.language] || I18N.en;
}

function getNestedTranslation(bundle, key) {
  return key.split(".").reduce((obj, part) => (obj && obj[part] != null ? obj[part] : undefined), bundle);
}

function t(key, vars = {}) {
  const fromSelected = getNestedTranslation(getLocaleBundle(), key);
  const fromEnglish = getNestedTranslation(I18N.en, key);
  const template = typeof fromSelected === "string" ? fromSelected : typeof fromEnglish === "string" ? fromEnglish : key;

  return template.replace(/\{(\w+)\}/g, (_, token) => String(vars[token] != null ? vars[token] : ""));
}

function isViewingLastAnswer(mode = state.mode) {
  return state.lastAnswerView.active && state.lastAnswerView.mode === mode;
}

function clearLastAnswerView() {
  state.lastAnswerView.active = false;
  state.lastAnswerView.mode = "";
}

function getDisplayedLessonQuestion() {
  if (isViewingLastAnswer("lesson") && state.lastAnswer.lesson) {
    return state.lastAnswer.lesson;
  }
  return state.currentQuestion;
}

function getDisplayedAbbreviationQuestion() {
  if (isViewingLastAnswer("abbreviation") && state.lastAnswer.abbreviation) {
    return state.lastAnswer.abbreviation;
  }
  return state.abbreviation.currentQuestion;
}

function isFirstLessonQuestion() {
  if (!state.lesson.active || state.lesson.inReview) return false;
  return state.lesson.currentRound <= 1;
}

function isFirstAbbreviationQuestion() {
  if (!state.abbreviation.active) return false;
  return state.abbreviation.currentRound <= 1;
}

function renderNiqqudToggle() {
  el.niqqudToggle.textContent = state.showNiqqudInline ? t("prompt.hideNiqqud") : t("prompt.showNiqqud");
}

function renderThemeToggle() {
  if (!el.themeToggle) return;
  const nextThemeLabel = state.theme === "light" ? t("controls.darkMode") : t("controls.lightMode");
  el.themeToggle.textContent = nextThemeLabel;
  el.themeToggle.setAttribute("aria-label", nextThemeLabel);
  el.themeToggle.setAttribute("aria-pressed", String(state.theme === "dark"));
}

function setGamePickerVisibility(visible) {
  el.gamePicker?.classList.toggle("hidden", !visible);
}

function setPromptCardVisibility(visible) {
  el.promptCard?.classList.toggle("hidden", !visible);
}

function renderAll() {
  applyLanguage();
  renderSessionHeader();
  renderPoolMeta();
  renderDomainPerformance();
  renderMostMissed();
  renderMasteredModal();
  if (state.mode === "home") {
    renderHomeState();
    return;
  }
  if (state.mode === "summary" && state.summary.active) {
    renderSummaryState();
    return;
  }
  if (state.mode === "verbMatch") {
    if (state.match.active) {
      renderVerbMatchRound();
    } else {
      renderVerbMatchIdleState();
    }
    return;
  }
  if (state.mode === "abbreviation") {
    if (state.abbreviation.active) {
      renderAbbreviationQuestion();
    } else {
      renderAbbreviationIdleState();
    }
    return;
  }
  if (state.lesson.active) {
    renderQuestion();
  } else {
    renderHomeState();
  }
}

function renderSessionHeader() {
  const attempts = Object.values(state.progress).reduce((sum, rec) => sum + (rec.attempts || 0), 0);
  const correct = Object.values(state.progress).reduce((sum, rec) => sum + (rec.correct || 0), 0);

  const accuracy = attempts ? Math.round((correct / attempts) * 100) : 0;
  el.statAccuracy.textContent = `${accuracy}%`;
  el.statStreak.textContent = String(state.sessionStreak);
  el.sessionScore.textContent = t("session.score", { score: state.sessionScore });
  el.homeBtn?.classList.toggle("hidden", state.mode === "home");
  el.statusRow?.classList.toggle("hidden", state.mode === "home");
  el.vocabCount.textContent = "";
  el.vocabCount.classList.add("hidden");
  el.masterVerbBtn?.classList.add("hidden");
  if (el.lastAnswerBtn) {
    el.lastAnswerBtn.disabled = true;
    el.lastAnswerBtn.textContent = t("session.lastAnswer");
    el.lastAnswerBtn.classList.add("hidden");
  }

  if (state.mode === "home") {
    el.modeTitle.textContent = t("home.title");
    el.lessonStatus.textContent = "";
    el.sessionScore.textContent = "";
    el.nextBtn.classList.add("hidden");
    return;
  }

  if (state.mode === "summary" && state.summary.active) {
    el.modeTitle.textContent = t("summary.resultsHeader");
    el.lessonStatus.textContent = "";
    el.sessionScore.textContent = t("summary.thumbsText");
    el.nextBtn.classList.add("hidden");
    return;
  }

  if (state.mode === "verbMatch") {
    const verbTitle = state.match.active ? t("session.verbMatchTitle") : t("session.verbMatchStart");
    const hasMatch = state.match.active && state.match.currentVerb;
    const pairProgress = hasMatch
      ? t("match.progress", { current: state.match.matchedCount, total: state.match.totalPairs })
      : t("match.progress", { current: 0, total: 0 });
    const verbProgress = hasMatch
      ? t("match.verbProgress", {
          current: state.match.currentVerbIndex,
          total: state.match.totalVerbs,
        })
      : t("match.verbProgress", { current: 0, total: state.match.totalVerbs });

    el.modeTitle.textContent = verbTitle;
    el.lessonStatus.textContent = `${pairProgress} | ${verbProgress}`;
    el.vocabCount.classList.remove("hidden");
    el.vocabCount.textContent = t("match.timer", { seconds: state.match.elapsedSeconds });
    el.sessionScore.textContent = t("match.combo", { count: state.match.bestCombo });

    const canAdvanceVerb = state.match.active && state.match.totalPairs > 0 && state.match.matchedCount >= state.match.totalPairs;
    el.nextBtn.disabled = !canAdvanceVerb;
    el.nextBtn.textContent = t("session.nextVerb");
    el.nextBtn.classList.toggle("hidden", !canAdvanceVerb);
    const showMasterAction =
      canAdvanceVerb &&
      Boolean(state.match.eligibleMasterWordId) &&
      !isWordMastered(state.match.eligibleMasterWordId);
    if (el.masterVerbBtn) {
      el.masterVerbBtn.disabled = !showMasterAction;
      el.masterVerbBtn.textContent = t("mastered.moveCurrent");
      el.masterVerbBtn.classList.toggle("hidden", !showMasterAction);
    }
    return;
  }

  if (state.mode === "abbreviation") {
    const targetRounds = getAbbreviationRoundTarget() || ABBREVIATION_ROUNDS;
    const isViewing = isViewingLastAnswer("abbreviation");
    const displayedQuestion = getDisplayedAbbreviationQuestion();
    const hasQuestion = state.abbreviation.active && Boolean(displayedQuestion);
    const canAdvance = !isViewing && hasQuestion && Boolean(state.abbreviation.currentQuestion?.locked);
    const canReviewLastAnswer = hasQuestion && Boolean(state.lastAnswer.abbreviation) && !isFirstAbbreviationQuestion();
    el.modeTitle.textContent = state.abbreviation.active ? t("session.abbreviationTitle") : t("session.abbreviationStart");
    el.lessonStatus.textContent = t("session.round", {
      current: state.abbreviation.currentRound,
      total: targetRounds,
    });
    el.vocabCount.classList.remove("hidden");
    el.vocabCount.textContent = t("session.timer", { seconds: state.abbreviation.elapsedSeconds });
    el.nextBtn.disabled = !canAdvance;
    el.nextBtn.textContent = t("session.next");
    el.nextBtn.classList.toggle("hidden", !hasQuestion || isViewing);
    if (el.lastAnswerBtn) {
      el.lastAnswerBtn.disabled = !canReviewLastAnswer;
      el.lastAnswerBtn.textContent = isViewing ? t("session.backToCurrent") : t("session.lastAnswer");
      el.lastAnswerBtn.classList.toggle("hidden", !canReviewLastAnswer);
    }
    return;
  }

  const inSecondChance = Boolean(state.lesson.inReview);
  const isViewing = isViewingLastAnswer("lesson");
  const displayedQuestion = getDisplayedLessonQuestion();
  const hasQuestion = state.lesson.active && Boolean(displayedQuestion);
  const canAdvance = !isViewing && hasQuestion && Boolean(state.currentQuestion?.locked);
  const canReviewLastAnswer = hasQuestion && Boolean(state.lastAnswer.lesson) && !isFirstLessonQuestion();
  el.modeTitle.textContent = inSecondChance ? t("session.secondChanceTitle") : t("session.mixedTitle", { rounds: LESSON_ROUNDS });
  el.lessonStatus.textContent = inSecondChance
    ? t("session.secondChanceProgress", {
        current: state.lesson.secondChanceCurrent,
        total: state.lesson.secondChanceTotal,
      })
    : t("session.round", {
        current: state.lesson.currentRound,
        total: LESSON_ROUNDS,
      });
  el.vocabCount.classList.remove("hidden");
  el.vocabCount.textContent = t("session.timer", { seconds: state.lesson.elapsedSeconds });
  el.nextBtn.disabled = !canAdvance;
  el.nextBtn.textContent = t("session.next");
  el.nextBtn.classList.toggle("hidden", !hasQuestion || isViewing);
  if (el.lastAnswerBtn) {
    el.lastAnswerBtn.disabled = !canReviewLastAnswer;
    el.lastAnswerBtn.textContent = isViewing ? t("session.backToCurrent") : t("session.lastAnswer");
    el.lastAnswerBtn.classList.toggle("hidden", !canReviewLastAnswer);
  }
}

function renderPoolMeta() {
  const pool = getSelectedPool();
  const all = getAllVocabulary();
  el.poolMeta.textContent = t("pool.summary", { pool: pool.length, total: all.length });

  if (!storage) {
    el.poolMeta.textContent += ` ${t("pool.tempProgress")}`;
  }

  if (usingFallbackVocab) {
    el.poolMeta.textContent += ` ${t("pool.fallback")}`;
  }
}

function renderDomainPerformance() {
  if (!el.domainPerformance) return;

  const stats = calculateDomainStats();
  el.domainPerformance.innerHTML = "";

  stats.forEach((domain) => {
    appendPerformanceCard(el.domainPerformance, {
      emoji: domain.emoji,
      title: t(`domain.${domain.id}`),
      attempts: domain.attempts,
      correct: domain.correct,
      wrong: domain.wrong,
    });
  });

  renderGameModePerformance();
}

function calculateDomainStats() {
  const domainStats = PERFORMANCE_DOMAINS.map((domain) => ({
    id: domain.id,
    label: domain.label,
    emoji: domain.emoji,
    attempts: 0,
    correct: 0,
    wrong: 0,
  }));

  const domainById = new Map(domainStats.map((domain) => [domain.id, domain]));
  const fallbackDomain = domainById.get(FALLBACK_DOMAIN_ID) || domainStats[domainStats.length - 1];

  getSelectedPool().forEach((word) => {
    const rec = getProgressRecord(word.id);
    const attempts = rec.attempts || 0;
    if (!attempts) return;

    const domainId = getDomainIdForWord(word);
    const bucket = domainById.get(domainId) || fallbackDomain;
    const correct = Math.max(0, Math.min(attempts, rec.correct || 0));

    bucket.attempts += attempts;
    bucket.correct += correct;
    bucket.wrong += Math.max(0, attempts - correct);
  });

  return domainStats;
}

function renderGameModePerformance() {
  if (!el.modePerformance) return;

  const stats = calculateGameModeStats();
  el.modePerformance.innerHTML = "";

  const cards = [
    {
      emoji: "🔗",
      title: t("game.conjugationName"),
      attempts: stats.conjugation.attempts,
      correct: stats.conjugation.correct,
      wrong: stats.conjugation.wrong,
    },
    {
      emoji: "⏩",
      title: t("game.abbreviationName"),
      attempts: stats.abbreviation.attempts,
      correct: stats.abbreviation.correct,
      wrong: stats.abbreviation.wrong,
    },
  ];

  cards.forEach((card) => appendPerformanceCard(el.modePerformance, card));
}

function calculateGameModeStats() {
  const modeStats = {
    conjugation: {
      attempts: 0,
      correct: 0,
      wrong: 0,
    },
    abbreviation: {
      attempts: 0,
      correct: 0,
      wrong: 0,
    },
  };

  Object.entries(state.progress).forEach(([wordId, rec]) => {
    if (abbreviationIdSet.has(wordId)) {
      const attempts = Math.max(0, Number(rec?.attempts || 0));
      const correct = Math.max(0, Math.min(attempts, Number(rec?.correct || 0)));
      modeStats.abbreviation.attempts += attempts;
      modeStats.abbreviation.correct += correct;
    }

    const conjugationAttempts = Math.max(0, Number(rec?.conjugationAttempts || 0));
    const conjugationCorrect = Math.max(0, Math.min(conjugationAttempts, Number(rec?.conjugationCorrect || 0)));
    modeStats.conjugation.attempts += conjugationAttempts;
    modeStats.conjugation.correct += conjugationCorrect;
  });

  modeStats.abbreviation.wrong = Math.max(0, modeStats.abbreviation.attempts - modeStats.abbreviation.correct);
  modeStats.conjugation.wrong = Math.max(0, modeStats.conjugation.attempts - modeStats.conjugation.correct);
  return modeStats;
}

function appendPerformanceCard(container, stats) {
  if (!container) return;

  const card = document.createElement("article");
  card.className = "domain-card";

  const ring = document.createElement("div");
  ring.className = "domain-ring";

  const attempts = Math.max(0, Number(stats?.attempts || 0));
  const correct = Math.max(0, Math.min(attempts, Number(stats?.correct || 0)));
  const wrong = Math.max(0, Number(stats?.wrong || 0));
  const correctPct = attempts ? Math.round((correct / attempts) * 100) : 0;
  const wrongPct = attempts ? 100 - correctPct : 0;

  ring.style.setProperty("--ring-good", `${correctPct}%`);
  ring.style.setProperty("--ring-bad", `${wrongPct}%`);
  ring.classList.toggle("empty", attempts === 0);

  const emoji = document.createElement("span");
  emoji.className = "domain-emoji";
  emoji.textContent = String(stats?.emoji || "•");
  ring.append(emoji);

  const meta = document.createElement("div");
  meta.className = "domain-meta";

  const title = document.createElement("p");
  title.className = "domain-title";
  title.textContent = String(stats?.title || "");

  const score = document.createElement("p");
  score.className = "domain-score";
  score.textContent = `✅ ${correct}  ❌ ${wrong}`;

  meta.append(title, score);
  card.append(ring, meta);
  container.append(card);
}

function clearSummaryState() {
  state.summary.active = false;
  state.summary.game = "";
  state.summary.titleKey = "";
  state.summary.titleVars = {};
  state.summary.scoreKey = "";
  state.summary.scoreVars = {};
  state.summary.noteKey = "";
  state.summary.noteVars = {};
}

function goHome() {
  stopVerbMatchTimer();
  stopLessonTimer();
  stopAbbreviationTimer();
  closeMasteredModal();
  clearLessonStartIntro();
  clearSecondChanceIntro();
  clearVerbMatchIntro();
  clearAbbreviationIntro();
  resetSessionCounters();
  resetVerbMatchState();
  resetAbbreviationState();
  state.lesson.active = false;
  state.lesson.inReview = false;
  state.currentQuestion = null;
  state.lastAnswer.lesson = null;
  state.lastAnswer.abbreviation = null;
  clearLastAnswerView();
  clearSummaryState();
  state.mode = "home";
  clearFeedback();
  renderAll();
}

function renderHomeState() {
  state.mode = "home";
  clearSummaryState();
  setGamePickerVisibility(true);
  setPromptCardVisibility(true);
  el.choiceContainer.classList.remove("summary-grid");
  el.promptLabel.textContent = t("home.label");
  el.promptText.classList.remove("hebrew");
  el.promptText.textContent = t("home.prompt");
  el.choiceContainer.innerHTML = "";
  el.choiceContainer.classList.remove("match-grid");
  renderNiqqudToggle();
}

function showSessionSummary(config = {}) {
  stopVerbMatchTimer();
  stopLessonTimer();
  stopAbbreviationTimer();
  clearLessonStartIntro();
  clearSecondChanceIntro();
  clearVerbMatchIntro();
  clearAbbreviationIntro();
  state.lesson.active = false;
  state.lesson.inReview = false;
  state.currentQuestion = null;
  state.match.active = false;
  state.abbreviation.active = false;
  state.abbreviation.currentQuestion = null;
  clearLastAnswerView();
  state.mode = "summary";
  state.summary.active = true;
  state.summary.game = String(config.game || "");
  state.summary.titleKey = String(config.titleKey || "");
  state.summary.titleVars = config.titleVars || {};
  state.summary.scoreKey = String(config.scoreKey || "");
  state.summary.scoreVars = config.scoreVars || {};
  state.summary.noteKey = String(config.noteKey || "");
  state.summary.noteVars = config.noteVars || {};
  clearFeedback();
  renderAll();
}

function renderSummaryState() {
  setGamePickerVisibility(false);
  setPromptCardVisibility(false);
  el.promptLabel.textContent = "";
  el.promptText.classList.remove("hebrew");
  el.promptText.textContent = "";
  el.choiceContainer.innerHTML = "";
  el.choiceContainer.classList.remove("match-grid");
  el.choiceContainer.classList.add("summary-grid");

  const titleText = state.summary.titleKey ? t(state.summary.titleKey, state.summary.titleVars) : t("home.title");
  const scoreText = state.summary.scoreKey ? t(state.summary.scoreKey, state.summary.scoreVars) : "";
  const noteText = state.summary.noteKey ? t(state.summary.noteKey, state.summary.noteVars) : t("summary.thumbsText");

  const card = document.createElement("article");
  card.className = "session-summary";

  const icon = document.createElement("p");
  icon.className = "summary-icon";
  icon.textContent = "👍";

  const title = document.createElement("p");
  title.className = "summary-title";
  title.textContent = titleText;

  const score = document.createElement("p");
  score.className = "summary-score";
  score.textContent = scoreText;

  const note = document.createElement("p");
  note.className = "summary-note";
  note.textContent = noteText;

  const actions = document.createElement("div");
  actions.className = "summary-actions";

  const replayBtn = document.createElement("button");
  replayBtn.type = "button";
  replayBtn.className = "accent";
  replayBtn.textContent = t("session.playAgain");
  replayBtn.addEventListener("click", () => {
    if (state.summary.game === "verbMatch") {
      startVerbMatch();
      return;
    }
    if (state.summary.game === "abbreviation") {
      startAbbreviation();
      return;
    }
    startLesson();
  });

  const backBtn = document.createElement("button");
  backBtn.type = "button";
  backBtn.className = "quiet";
  backBtn.textContent = t("session.backHome");
  backBtn.addEventListener("click", () => goHome());

  actions.append(replayBtn, backBtn);
  card.append(icon, title, score, note, actions);
  el.choiceContainer.append(card);
  renderNiqqudToggle();
}

function renderIdleLessonState() {
  state.mode = "lesson";
  setGamePickerVisibility(false);
  setPromptCardVisibility(true);
  el.choiceContainer.classList.remove("summary-grid");
  renderSessionHeader();
  renderPoolMeta();
  el.promptLabel.textContent = t("prompt.lesson");
  el.promptText.classList.remove("hebrew");
  el.promptText.textContent = t("prompt.start");
  el.choiceContainer.innerHTML = "";
  el.choiceContainer.classList.remove("match-grid");
  renderNiqqudToggle();
}

function startLesson() {
  stopVerbMatchTimer();
  stopLessonTimer();
  stopAbbreviationTimer();
  closeMasteredModal();
  resetVerbMatchState();
  resetAbbreviationState();
  state.mode = "lesson";
  clearSummaryState();
  clearLessonStartIntro();
  clearSecondChanceIntro();
  clearVerbMatchIntro();
  clearAbbreviationIntro();
  resetSessionCounters();
  state.lesson.active = true;
  state.lesson.inReview = false;
  state.lesson.reviewQueue = [];
  state.lesson.missedWordIds = [];
  state.lesson.optionHistory = {};
  state.lesson.currentRound = 0;
  state.lesson.secondChanceCurrent = 0;
  state.lesson.secondChanceTotal = 0;
  state.lesson.startMs = 0;
  state.lesson.elapsedSeconds = 0;
  state.lesson.askedWordIds = [];
  state.lesson.domainCounts = {};
  state.currentQuestion = null;
  state.lastAnswer.lesson = null;
  clearLastAnswerView();
  el.choiceContainer.innerHTML = "";
  el.choiceContainer.classList.remove("match-grid");
  clearFeedback();
  renderIdleLessonState();
  playLessonStartIntro();
}

function finishLesson() {
  stopLessonTimer();
  clearLessonStartIntro();
  clearSecondChanceIntro();
  clearVerbMatchIntro();
  state.lesson.active = false;
  state.currentQuestion = null;
  const reviewRounds = state.lesson.secondChanceTotal;
  state.lesson.inReview = false;
  state.lesson.secondChanceCurrent = 0;
  state.lesson.secondChanceTotal = 0;
  showSessionSummary({
    game: "lesson",
    titleKey: "summary.lessonTitle",
    scoreKey: "summary.score",
    scoreVars: {
      score: state.sessionScore,
      total: LESSON_ROUNDS,
    },
    noteKey: reviewRounds > 0 ? "summary.lessonNote" : "summary.lessonNoteNone",
    noteVars: reviewRounds > 0 ? { count: reviewRounds } : {},
  });
}

function getAbbreviationRoundTarget() {
  if (!abbreviationDeck.length) return 0;
  return Math.min(ABBREVIATION_ROUNDS, abbreviationDeck.length);
}

function renderAbbreviationIdleState() {
  state.mode = "abbreviation";
  setGamePickerVisibility(false);
  setPromptCardVisibility(true);
  el.choiceContainer.classList.remove("summary-grid");
  renderSessionHeader();
  renderPoolMeta();
  el.promptLabel.textContent = t("prompt.abbreviation");
  el.promptText.classList.remove("hebrew");
  el.promptText.textContent = t("prompt.abbreviationStart");
  el.choiceContainer.innerHTML = "";
  el.choiceContainer.classList.remove("match-grid");
  renderNiqqudToggle();
}

function startAbbreviation() {
  stopVerbMatchTimer();
  stopLessonTimer();
  stopAbbreviationTimer();
  closeMasteredModal();
  clearLessonStartIntro();
  clearSecondChanceIntro();
  clearVerbMatchIntro();
  clearAbbreviationIntro();
  clearSummaryState();
  state.lesson.active = false;
  state.lesson.inReview = false;
  state.currentQuestion = null;
  state.lastAnswer.abbreviation = null;
  clearLastAnswerView();
  resetSessionCounters();
  resetVerbMatchState();
  resetAbbreviationState();
  state.mode = "abbreviation";
  setGamePickerVisibility(false);
  el.choiceContainer.innerHTML = "";
  el.choiceContainer.classList.remove("match-grid");
  clearFeedback();

  if (!abbreviationDeck.length) {
    state.abbreviation.active = false;
    renderAbbreviationIdleState();
    el.promptLabel.textContent = t("prompt.noAbbreviationTitle");
    el.promptText.classList.remove("hebrew");
    el.promptText.textContent = t("prompt.noAbbreviationBody");
    setFeedback(t("prompt.noAbbreviationTitle"), false);
    return;
  }

  state.abbreviation.active = true;
  renderAbbreviationIdleState();
  playAbbreviationIntro();
}

function finishAbbreviation() {
  stopAbbreviationTimer();
  clearLessonStartIntro();
  clearSecondChanceIntro();
  clearVerbMatchIntro();
  clearAbbreviationIntro();

  const roundsDone = state.abbreviation.currentRound;
  const targetRounds = getAbbreviationRoundTarget() || ABBREVIATION_ROUNDS;
  const elapsed = state.abbreviation.elapsedSeconds;

  state.abbreviation.active = false;
  state.abbreviation.currentQuestion = null;

  showSessionSummary({
    game: "abbreviation",
    titleKey: "summary.abbreviationTitle",
    scoreKey: "summary.score",
    scoreVars: {
      score: state.sessionScore,
      total: targetRounds,
    },
    noteKey: "summary.abbreviationNote",
    noteVars: {
      rounds: roundsDone || targetRounds,
      seconds: elapsed,
    },
  });
}

function resetAbbreviationState() {
  stopAbbreviationTimer();
  state.abbreviation.active = false;
  state.abbreviation.currentRound = 0;
  state.abbreviation.startMs = 0;
  state.abbreviation.elapsedSeconds = 0;
  state.abbreviation.timerId = null;
  state.abbreviation.askedEntryIds = [];
  state.abbreviation.introActive = false;
  state.abbreviation.currentQuestion = null;
  state.lastAnswer.abbreviation = null;
  if (state.lastAnswerView.mode === "abbreviation") {
    clearLastAnswerView();
  }
}

function clearAbbreviationIntro() {
  state.abbreviation.introActive = false;

  if (!el.abbreviationIntro) return;
  el.abbreviationIntro.classList.remove("active");
  el.abbreviationIntro.classList.add("hidden");
  el.abbreviationIntro.setAttribute("aria-hidden", "true");
}

function playAbbreviationIntro() {
  if (!el.abbreviationIntro) {
    beginAbbreviationFromIntro();
    return;
  }

  clearAbbreviationIntro();
  state.abbreviation.introActive = true;
  el.abbreviationIntro.classList.remove("hidden");
  el.abbreviationIntro.classList.add("active");
  el.abbreviationIntro.setAttribute("aria-hidden", "false");
}

function beginAbbreviationFromIntro() {
  if (!state.abbreviation.active) return;
  if (state.abbreviation.introActive) {
    clearAbbreviationIntro();
  }

  if (!state.abbreviation.startMs) {
    state.abbreviation.startMs = Date.now();
    state.abbreviation.elapsedSeconds = 0;
    startAbbreviationTimer();
  }
  nextAbbreviationQuestion();
}

function nextAbbreviationQuestion() {
  if (state.mode !== "abbreviation") return;
  if (state.lastAnswerView.mode === "abbreviation") {
    clearLastAnswerView();
  }
  if (!state.abbreviation.active) {
    goHome();
    return;
  }
  if (state.abbreviation.introActive) return;

  const targetRounds = getAbbreviationRoundTarget();
  if (!targetRounds) {
    finishAbbreviation();
    return;
  }

  if (state.abbreviation.currentRound >= targetRounds) {
    finishAbbreviation();
    return;
  }

  const question = buildAbbreviationQuestion(abbreviationDeck);
  if (!question) {
    finishAbbreviation();
    return;
  }

  state.abbreviation.currentRound += 1;
  state.abbreviation.currentQuestion = {
    ...question,
    locked: false,
    selectedOptionId: null,
  };
  state.showNiqqudInline = false;
  clearFeedback();
  renderAbbreviationQuestion();
}

function renderAbbreviationQuestion() {
  const question = getDisplayedAbbreviationQuestion();

  setGamePickerVisibility(false);
  setPromptCardVisibility(true);
  el.choiceContainer.classList.remove("summary-grid");
  renderSessionHeader();
  renderPoolMeta();
  el.choiceContainer.classList.remove("match-grid");

  if (!question) return;

  el.promptLabel.textContent = question.promptLabel;
  el.promptText.classList.add("hebrew");
  el.promptText.textContent = question.prompt;
  renderAbbreviationChoices(question);
  renderNiqqudToggle();
  if (isViewingLastAnswer("abbreviation")) {
    renderLastAnswerFeedback("abbreviation", question);
  }
}

function renderAbbreviationChoices(question) {
  el.choiceContainer.innerHTML = "";

  question.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn";
    btn.textContent = option.label;
    btn.addEventListener("click", () => {
      if (question.locked) return;
      const isCorrect = option.id === question.entry.id;
      applyAbbreviationAnswer(isCorrect, option.id);
    });
    el.choiceContainer.append(btn);
  });

  if (question.locked) {
    markAbbreviationChoiceResults(question);
  }
}

function applyAbbreviationAnswer(isCorrect, selectedId = null) {
  const question = state.abbreviation.currentQuestion;
  if (!question || question.locked) return;

  question.locked = true;
  const entry = question.entry;

  updateProgress(entry.id, isCorrect);
  state.sessionStreak = isCorrect ? state.sessionStreak + 1 : 0;
  if (isCorrect) {
    state.sessionScore += 1;
  }

  const expansion = `${entry.expansionHe} (${entry.abbr})`;
  setFeedback(
    isCorrect
      ? t("feedback.abbreviationCorrect", { english: entry.english, expansion })
      : t("feedback.abbreviationWrong", { english: entry.english, expansion }),
    isCorrect
  );

  question.selectedOptionId = selectedId ?? null;
  rememberAbbreviationLastAnswer(question, isCorrect, question.selectedOptionId);
  markAbbreviationChoiceResults(question);

  saveProgress();
  renderSessionHeader();
  renderPoolMeta();
  renderDomainPerformance();
  renderMostMissed();
}

function markAbbreviationChoiceResults(question = state.abbreviation.currentQuestion) {
  if (!question) return;
  const buttons = Array.from(el.choiceContainer.querySelectorAll("button"));
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
}

function buildAbbreviationQuestion(pool) {
  const entry = pickBestAbbreviationEntry(pool, state.abbreviation.askedEntryIds);
  if (!entry) return null;

  state.abbreviation.askedEntryIds.push(entry.id);
  const options = buildAbbreviationOptions(pool, entry);

  return {
    promptLabel: t("prompt.abbreviation"),
    prompt: entry.abbr,
    promptIsHebrew: true,
    entry,
    options,
  };
}

function buildAbbreviationOptions(pool, entry) {
  const sameBucketCandidates = pool.filter((item) => item.id !== entry.id && item.bucket === entry.bucket);
  const distractors = shuffle(sameBucketCandidates).slice(0, 3);

  if (distractors.length < 3) {
    const filler = shuffle(pool.filter((item) => item.id !== entry.id && !distractors.includes(item))).slice(
      0,
      3 - distractors.length
    );
    distractors.push(...filler);
  }

  const options = [entry, ...distractors].slice(0, 4).map((item) => ({
    id: item.id,
    label: item.english,
    entry: item,
  }));

  return shuffle(options);
}

function pickBestAbbreviationEntry(pool, usedEntryIds = []) {
  const now = Date.now();
  const freshPool =
    usedEntryIds.length < pool.length ? pool.filter((entry) => !usedEntryIds.includes(entry.id)) : pool;
  const due = getDueAbbreviationEntries(freshPool, now);
  const set = due.length ? due : freshPool;
  const maxLevel = LEITNER_INTERVALS.length - 1;

  const weighted = set.map((entry) => {
    const rec = getProgressRecord(entry.id);
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

  return weightedRandomWord(weighted);
}

function getDueAbbreviationEntries(pool, now = Date.now()) {
  return pool.filter((entry) => {
    const rec = getProgressRecord(entry.id);
    return rec.attempts === 0 || rec.nextDue <= now;
  });
}

function startAbbreviationTimer() {
  stopAbbreviationTimer();
  state.abbreviation.timerId = global.setInterval(() => {
    if (!state.abbreviation.active) return;
    state.abbreviation.elapsedSeconds = Math.max(0, Math.floor((Date.now() - state.abbreviation.startMs) / 1000));
    if (state.mode === "abbreviation") {
      renderSessionHeader();
    }
  }, 1000);
}

function stopAbbreviationTimer() {
  if (!state.abbreviation.timerId) return;
  global.clearInterval(state.abbreviation.timerId);
  state.abbreviation.timerId = null;
}

function clearLessonStartIntro() {
  state.lesson.lessonStartIntroActive = false;

  if (!el.lessonStartIntro) return;
  el.lessonStartIntro.classList.remove("active");
  el.lessonStartIntro.classList.add("hidden");
  el.lessonStartIntro.setAttribute("aria-hidden", "true");
}

function playLessonStartIntro() {
  if (!el.lessonStartIntro) {
    beginLessonFromIntro();
    return;
  }

  clearLessonStartIntro();
  state.lesson.lessonStartIntroActive = true;
  el.lessonStartIntro.classList.remove("hidden");
  el.lessonStartIntro.classList.add("active");
  el.lessonStartIntro.setAttribute("aria-hidden", "false");
}

function beginLessonFromIntro() {
  if (state.lesson.lessonStartIntroActive) {
    clearLessonStartIntro();
  }
  if (!state.lesson.startMs) {
    state.lesson.startMs = Date.now();
    state.lesson.elapsedSeconds = 0;
    startLessonTimer();
  }
  nextQuestion();
}

function clearSecondChanceIntro() {
  state.lesson.secondChanceIntroActive = false;

  if (!el.secondChanceIntro) return;
  el.secondChanceIntro.classList.remove("active");
  el.secondChanceIntro.classList.add("hidden");
  el.secondChanceIntro.setAttribute("aria-hidden", "true");
}

function playSecondChanceIntro() {
  if (!el.secondChanceIntro) {
    nextQuestion();
    return;
  }

  clearSecondChanceIntro();
  state.lesson.secondChanceIntroActive = true;
  el.secondChanceIntro.classList.remove("hidden");
  el.secondChanceIntro.classList.add("active");
  el.secondChanceIntro.setAttribute("aria-hidden", "false");
}

function beginSecondChanceFromIntro() {
  if (!state.lesson.secondChanceIntroActive) return;
  clearSecondChanceIntro();
  nextQuestion();
}

function clearVerbMatchIntro() {
  state.match.verbIntroActive = false;

  if (!el.verbMatchIntro) return;
  el.verbMatchIntro.classList.remove("active");
  el.verbMatchIntro.classList.add("hidden");
  el.verbMatchIntro.setAttribute("aria-hidden", "true");
}

function playVerbMatchIntro() {
  if (!el.verbMatchIntro) {
    beginVerbMatchFromIntro();
    return;
  }

  clearVerbMatchIntro();
  state.match.verbIntroActive = true;
  el.verbMatchIntro.classList.remove("hidden");
  el.verbMatchIntro.classList.add("active");
  el.verbMatchIntro.setAttribute("aria-hidden", "false");
}

function beginVerbMatchFromIntro() {
  if (!state.match.active) return;
  if (state.match.verbIntroActive) {
    clearVerbMatchIntro();
  }

  state.match.startMs = Date.now();
  state.match.elapsedSeconds = 0;
  startVerbMatchTimer();
  clearFeedback();
  loadNextVerbRound();
}

function nextQuestion() {
  if (state.mode !== "lesson") return;
  if (state.lastAnswerView.mode === "lesson") {
    clearLastAnswerView();
  }
  if (!state.lesson.active) {
    goHome();
    return;
  }
  if (state.lesson.lessonStartIntroActive) return;
  if (state.lesson.secondChanceIntroActive) return;

  const pool = getSelectedPool();
  if (!pool.length) {
    stopLessonTimer();
    state.lesson.active = false;
    state.currentQuestion = null;
    const hasMastered = getMasteredWords().length > 0;
    el.promptLabel.textContent = hasMastered ? t("prompt.masteredOnlyTitle") : t("prompt.noVocabTitle");
    el.promptText.classList.remove("hebrew");
    el.promptText.textContent = hasMastered ? t("prompt.masteredOnlyBody") : t("prompt.noVocabBody");
    el.choiceContainer.innerHTML = "";
    renderNiqqudToggle();
    return;
  }

  if (!state.lesson.inReview && state.lesson.currentRound >= LESSON_ROUNDS) {
    if (!tryStartReviewPhase(pool)) {
      finishLesson();
      return;
    }
    state.currentQuestion = null;
    state.showNiqqudInline = false;
    renderSessionHeader();
    playSecondChanceIntro();
    return;
  }

  if (state.lesson.inReview && state.lesson.secondChanceCurrent >= state.lesson.secondChanceTotal) {
    finishLesson();
    return;
  }

  const question = state.lesson.inReview ? buildReviewQuestion(pool) : buildQuestion(pool);
  if (!question) {
    state.lesson.active = false;
    finishLesson();
    return;
  }

  rememberOptionHistory(question);
  if (state.lesson.inReview) {
    state.lesson.secondChanceCurrent += 1;
  } else {
    state.lesson.currentRound += 1;
  }
  state.currentQuestion = { ...question, locked: false, selectedOptionId: null };
  state.showNiqqudInline = false;
  clearFeedback();
  renderQuestion();
}

function renderQuestion() {
  const question = getDisplayedLessonQuestion();

  setGamePickerVisibility(false);
  setPromptCardVisibility(true);
  el.choiceContainer.classList.remove("summary-grid");
  renderSessionHeader();
  renderPoolMeta();
  el.choiceContainer.classList.remove("match-grid");

  if (!question) return;

  el.promptLabel.textContent = question.promptLabel;
  renderPromptText(question);
  renderChoices(question);
  if (isViewingLastAnswer("lesson")) {
    renderLastAnswerFeedback("lesson", question);
  }
}

function renderChoices(question) {
  el.choiceContainer.innerHTML = "";

  question.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `choice-btn ${question.optionsAreHebrew ? "hebrew" : ""}`;
    btn.textContent = question.optionsAreHebrew
      ? getHebrewText(option.word, state.showNiqqudInline)
      : option.word.en;

    btn.addEventListener("click", () => {
      if (question.locked) return;
      const isCorrect = option.id === question.word.id;
      applyAnswer(isCorrect, option.id);
    });

    el.choiceContainer.append(btn);
  });

  if (question.locked) {
    markChoiceResults(question);
  }
}

function renderPromptText(question = state.currentQuestion) {
  if (state.mode === "verbMatch") {
    renderVerbMatchPrompt();
    return;
  }

  if (!question) {
    renderNiqqudToggle();
    return;
  }

  const promptUsesWordSurface = question.promptUsesWordSurface !== false;
  const hasHebrewSurface = Boolean(question.promptIsHebrew || question.optionsAreHebrew);

  if (question.promptIsHebrew) {
    el.promptText.classList.add("hebrew");
  } else {
    el.promptText.classList.remove("hebrew");
  }

  if (question.promptIsHebrew && question.word && promptUsesWordSurface) {
    el.promptText.textContent = getHebrewText(question.word, state.showNiqqudInline);
  } else {
    el.promptText.textContent = state.showNiqqudInline && question.promptNiqqud ? question.promptNiqqud : question.prompt;
  }

  if (!hasHebrewSurface) {
    renderNiqqudToggle();
    return;
  }

  renderNiqqudToggle();
}

function applyAnswer(isCorrect, selectedId = null) {
  if (!state.currentQuestion || state.currentQuestion.locked) return;

  state.currentQuestion.locked = true;
  const word = state.currentQuestion.word;

  updateProgress(word.id, isCorrect);
  state.sessionStreak = isCorrect ? state.sessionStreak + 1 : 0;

  if (isCorrect && !state.currentQuestion.isReview) {
    state.sessionScore += 1;
  } else if (!state.currentQuestion.isReview) {
    addMissedWord(state.currentQuestion.word.id);
  }

  const answerDisplay = buildAnswerDisplay(word, state.showNiqqudInline);
  setFeedback(
    isCorrect
      ? t("feedback.correct", { answer: answerDisplay })
      : t("feedback.wrong", { answer: answerDisplay, english: word.en }),
    isCorrect
  );

  state.currentQuestion.selectedOptionId = selectedId ?? null;
  rememberLessonLastAnswer(state.currentQuestion, isCorrect, state.currentQuestion.selectedOptionId);
  markChoiceResults();

  saveProgress();
  renderSessionHeader();
  renderPoolMeta();
  renderDomainPerformance();
  renderMostMissed();
}

function markChoiceResults(question = state.currentQuestion) {
  const buttons = Array.from(el.choiceContainer.querySelectorAll("button"));
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
}

function showLastAnswer() {
  if (state.mode !== "lesson" && state.mode !== "abbreviation") {
    return;
  }

  const mode = state.mode;
  const snapshot = mode === "abbreviation" ? state.lastAnswer.abbreviation : state.lastAnswer.lesson;
  if (!snapshot) {
    setFeedback(t("feedback.lastAnswerMissing"), null);
    return;
  }

  if (isViewingLastAnswer(mode)) {
    clearLastAnswerView();
    clearFeedback();
  } else {
    state.lastAnswerView.active = true;
    state.lastAnswerView.mode = mode;
  }

  if (mode === "abbreviation") {
    renderAbbreviationQuestion();
    return;
  }
  renderQuestion();
}

function rememberLessonLastAnswer(question, isCorrect, selectedId = null) {
  if (!question?.word || !Array.isArray(question.options)) return;

  const answerDisplay = buildAnswerDisplay(question.word, state.showNiqqudInline);
  const feedbackKey = isCorrect ? "feedback.correct" : "feedback.wrong";
  const feedbackVars = isCorrect
    ? { answer: answerDisplay }
    : { answer: answerDisplay, english: question.word.en };

  state.lastAnswer.lesson = cloneLessonQuestionSnapshot({
    ...question,
    selectedOptionId: selectedId ?? null,
    locked: true,
    lastAnswerResult: {
      key: feedbackKey,
      vars: feedbackVars,
      success: Boolean(isCorrect),
    },
  });
}

function rememberAbbreviationLastAnswer(question, isCorrect, selectedId = null) {
  if (!question?.entry || !Array.isArray(question.options)) return;

  const expansion = `${question.entry.expansionHe} (${question.entry.abbr})`;
  const feedbackKey = isCorrect ? "feedback.abbreviationCorrect" : "feedback.abbreviationWrong";

  state.lastAnswer.abbreviation = cloneAbbreviationQuestionSnapshot({
    ...question,
    selectedOptionId: selectedId ?? null,
    locked: true,
    lastAnswerResult: {
      key: feedbackKey,
      vars: { english: question.entry.english, expansion },
      success: Boolean(isCorrect),
    },
  });
}

function renderLastAnswerFeedback(mode, snapshot = null) {
  const question = snapshot || (mode === "abbreviation" ? state.lastAnswer.abbreviation : state.lastAnswer.lesson);
  let feedback = question?.lastAnswerResult || null;
  if (!feedback?.key && question) {
    if (mode === "abbreviation" && question.entry) {
      const isCorrect = question.selectedOptionId === question.entry.id;
      const expansion = `${question.entry.expansionHe} (${question.entry.abbr})`;
      feedback = {
        key: isCorrect ? "feedback.abbreviationCorrect" : "feedback.abbreviationWrong",
        vars: { english: question.entry.english, expansion },
        success: Boolean(isCorrect),
      };
    } else if (question.word) {
      const isCorrect = question.selectedOptionId === question.word.id;
      const answerDisplay = buildAnswerDisplay(question.word, state.showNiqqudInline);
      feedback = {
        key: isCorrect ? "feedback.correct" : "feedback.wrong",
        vars: isCorrect ? { answer: answerDisplay } : { answer: answerDisplay, english: question.word.en },
        success: Boolean(isCorrect),
      };
    }
  }
  if (!feedback?.key) return;
  setFeedback(t(feedback.key, feedback.vars || {}), feedback.success);
}

function cloneLessonQuestionSnapshot(question) {
  return {
    ...question,
    word: question.word ? { ...question.word } : null,
    options: question.options.map((option) => ({
      ...option,
      word: option.word ? { ...option.word } : null,
    })),
    locked: true,
    selectedOptionId: question.selectedOptionId ?? null,
    lastAnswerResult: question.lastAnswerResult
      ? {
          key: String(question.lastAnswerResult.key || ""),
          vars: { ...(question.lastAnswerResult.vars || {}) },
          success: question.lastAnswerResult.success,
        }
      : null,
  };
}

function cloneAbbreviationQuestionSnapshot(question) {
  return {
    ...question,
    entry: question.entry ? { ...question.entry } : null,
    options: question.options.map((option) => ({
      ...option,
      entry: option.entry ? { ...option.entry } : null,
    })),
    locked: true,
    selectedOptionId: question.selectedOptionId ?? null,
    lastAnswerResult: question.lastAnswerResult
      ? {
          key: String(question.lastAnswerResult.key || ""),
          vars: { ...(question.lastAnswerResult.vars || {}) },
          success: question.lastAnswerResult.success,
        }
      : null,
  };
}

function handleNextAction() {
  if (state.mode === "home" || state.mode === "summary") {
    return;
  }
  if (isViewingLastAnswer()) {
    return;
  }

  if (state.mode === "verbMatch") {
    if (state.match.active && state.match.matchedCount >= state.match.totalPairs) {
      loadNextVerbRound();
      return;
    }
    return;
  }

  if (state.mode === "abbreviation") {
    if (!state.abbreviation.active || !state.abbreviation.currentQuestion) {
      return;
    }
    if (state.abbreviation.currentQuestion.locked) {
      nextAbbreviationQuestion();
    }
    return;
  }

  if (!state.lesson.active || !state.currentQuestion) {
    return;
  }

  if (state.currentQuestion.locked) {
    nextQuestion();
    return;
  }
}

function addMissedWord(wordId) {
  if (!wordId) return;
  if (!state.lesson.missedWordIds.includes(wordId)) {
    state.lesson.missedWordIds.push(wordId);
  }
}

function renderMostMissed() {
  if (!el.mostMissedList || !el.mostMissedEmpty) return;

  const wordsById = new Map(getAllVocabulary().map((word) => [word.id, word]));
  const ranked = Object.entries(state.progress)
    .map(([wordId, rec]) => {
      const attempts = rec?.attempts || 0;
      const correct = rec?.correct || 0;
      const missed = Math.max(0, attempts - correct);
      return { wordId, attempts, missed };
    })
    .filter((item) => item.missed > 0 && wordsById.has(item.wordId))
    .sort((a, b) => {
      if (b.missed !== a.missed) return b.missed - a.missed;
      if (b.attempts !== a.attempts) return b.attempts - a.attempts;
      const aWord = wordsById.get(a.wordId);
      const bWord = wordsById.get(b.wordId);
      return String(aWord?.en || "").localeCompare(String(bWord?.en || ""));
    })
    .slice(0, 10);

  el.mostMissedList.innerHTML = "";
  el.mostMissedEmpty.classList.toggle("hidden", ranked.length > 0);

  ranked.forEach((entry) => {
    const word = wordsById.get(entry.wordId);
    if (!word) return;

    const item = document.createElement("li");
    const line = document.createElement("p");
    line.className = "missed-word";
    line.textContent = getHebrewText(word, true);
    line.title = word.en;
    item.title = word.en;

    const meta = document.createElement("p");
    meta.className = "missed-meta";
    meta.textContent = String(entry.missed);

    item.append(line, meta);
    el.mostMissedList.append(item);
  });
}

function openMasteredModal() {
  state.masteredModalOpen = true;
  renderMasteredModal();
}

function closeMasteredModal() {
  state.masteredModalOpen = false;
  state.masteredSelection = new Set();
  renderMasteredModal();
}

function renderMasteredModal() {
  if (!el.masteredModal || !el.masteredList || !el.masteredEmpty || !el.masteredRestoreBtn) return;

  const open = Boolean(state.masteredModalOpen);
  el.masteredModal.classList.toggle("hidden", !open);
  el.masteredModal.setAttribute("aria-hidden", open ? "false" : "true");
  if (!open) return;

  const masteredWords = getMasteredWords().sort((a, b) => a.en.localeCompare(b.en));
  const validIds = new Set(masteredWords.map((word) => word.id));
  state.masteredSelection = new Set([...state.masteredSelection].filter((id) => validIds.has(id)));

  el.masteredList.innerHTML = "";
  el.masteredEmpty.classList.toggle("hidden", masteredWords.length > 0);

  masteredWords.forEach((word) => {
    const row = document.createElement("label");
    row.className = "mastered-row";
    row.title = word.en;

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = state.masteredSelection.has(word.id);
    input.addEventListener("change", () => {
      if (input.checked) {
        state.masteredSelection.add(word.id);
      } else {
        state.masteredSelection.delete(word.id);
      }
      el.masteredRestoreBtn.disabled = state.masteredSelection.size === 0;
    });

    const textWrap = document.createElement("div");
    const he = document.createElement("p");
    he.className = "mastered-row-he";
    he.textContent = getHebrewText(word, state.showNiqqudInline);

    const en = document.createElement("p");
    en.className = "mastered-row-en";
    en.textContent = word.en;

    textWrap.append(he, en);
    row.append(input, textWrap);
    el.masteredList.append(row);
  });

  el.masteredRestoreBtn.disabled = state.masteredSelection.size === 0;
}

function restoreSelectedMasteredWords() {
  const selectedIds = [...state.masteredSelection].filter((wordId) => isWordMastered(wordId));
  if (!selectedIds.length) return;

  selectedIds.forEach((wordId) => setWordMastered(wordId, false));
  saveProgress();
  state.masteredSelection = new Set();
  renderAll();
  setFeedback(t("mastered.restored", { count: selectedIds.length }), true);
}

function moveEligibleVerbToMastered() {
  const wordId = state.match.eligibleMasterWordId;
  if (!wordId || isWordMastered(wordId)) return;

  const word = getWordById(wordId);
  if (!setWordMastered(wordId, true)) return;

  state.match.eligibleMasterWordId = "";
  saveProgress();
  renderSessionHeader();
  renderPoolMeta();
  renderDomainPerformance();
  renderMostMissed();
  renderMasteredModal();

  const label = word ? `${word.en} / ${getHebrewText(word, state.showNiqqudInline)}` : "";
  setFeedback(t("mastered.added", { word: label || wordId }), true);
}

function startVerbMatch() {
  stopVerbMatchTimer();
  stopLessonTimer();
  stopAbbreviationTimer();
  closeMasteredModal();
  clearLessonStartIntro();
  clearSecondChanceIntro();
  clearVerbMatchIntro();
  clearAbbreviationIntro();
  clearSummaryState();
  state.lesson.active = false;
  state.lesson.inReview = false;
  state.currentQuestion = null;
  clearLastAnswerView();
  resetSessionCounters();
  resetVerbMatchState();
  resetAbbreviationState();
  state.mode = "verbMatch";
  setGamePickerVisibility(false);
  el.choiceContainer.innerHTML = "";
  el.choiceContainer.classList.remove("match-grid");

  if (!verbFormDeck.length) {
    state.match.active = false;
    renderVerbMatchIdleState();
    setFeedback(t("match.noVerbs"), false);
    return;
  }

  state.match.active = true;
  state.match.verbQueue = shuffle(verbFormDeck);
  state.match.totalVerbs = state.match.verbQueue.length;
  state.match.currentVerbIndex = 0;
  state.match.startMs = Date.now();
  state.match.elapsedSeconds = 0;
  state.match.sessionMatched = 0;
  state.match.sessionTotalPairs = state.match.verbQueue.reduce(
    (sum, item) => sum + selectVerbRoundPairs(item.forms).length,
    0
  );
  clearFeedback();
  renderVerbMatchIdleState();
  playVerbMatchIntro();
}

function resetVerbMatchState() {
  state.match.active = false;
  state.match.verbQueue = [];
  state.match.totalVerbs = 0;
  state.match.currentVerbIndex = 0;
  state.match.currentVerb = null;
  state.match.pairs = [];
  state.match.remainingPairs = [];
  state.match.leftCards = [];
  state.match.rightCards = [];
  state.match.selectedLeftId = null;
  state.match.selectedRightId = null;
  state.match.mismatchedCardIds = [];
  state.match.matchedCardIds = [];
  state.match.matchedPairIds = [];
  state.match.isResolving = false;
  state.match.nextCardId = 1;
  state.match.combo = 0;
  state.match.bestCombo = 0;
  state.match.matchedCount = 0;
  state.match.totalPairs = 0;
  state.match.startMs = 0;
  state.match.elapsedSeconds = 0;
  state.match.verbIntroActive = false;
  state.match.sessionMatched = 0;
  state.match.sessionTotalPairs = 0;
  state.match.currentVerbHadMismatch = false;
  state.match.eligibleMasterWordId = "";
}

function loadNextVerbRound() {
  if (!state.match.active) return;
  const nextVerb = state.match.verbQueue.shift();

  if (!nextVerb) {
    const verbsCovered = state.match.totalVerbs;
    const sessionMatched = state.match.sessionMatched;
    const sessionTotal = state.match.sessionTotalPairs || sessionMatched;
    const bestCombo = state.match.bestCombo;
    const elapsed = state.match.elapsedSeconds;
    stopVerbMatchTimer();
    state.match.active = false;
    resetVerbMatchState();
    showSessionSummary({
      game: "verbMatch",
      titleKey: "summary.matchTitle",
      scoreKey: "summary.score",
      scoreVars: { score: sessionMatched, total: sessionTotal },
      noteKey: "summary.matchNote",
      noteVars: { verbs: verbsCovered, combo: bestCombo, seconds: elapsed },
    });
    return;
  }

  state.match.currentVerbIndex += 1;
  state.match.currentVerb = nextVerb;
  state.match.pairs = selectVerbRoundPairs(nextVerb.forms);
  if (!state.match.pairs.length) {
    loadNextVerbRound();
    return;
  }

  state.match.totalPairs = state.match.pairs.length;
  state.match.matchedCount = 0;
  state.match.selectedLeftId = null;
  state.match.selectedRightId = null;
  state.match.mismatchedCardIds = [];
  state.match.matchedCardIds = [];
  state.match.matchedPairIds = [];
  state.match.isResolving = false;
  state.match.combo = 0;
  state.match.currentVerbHadMismatch = false;
  state.match.eligibleMasterWordId = "";
  state.match.remainingPairs = shuffle(state.match.pairs);
  state.match.leftCards = [];
  state.match.rightCards = [];
  state.match.nextCardId = 1;
  refillVerbMatchColumns();
  setFeedback(getVerbRoundFeedback(nextVerb), true);
  renderVerbMatchRound();
}

function getVerbRoundFeedback(verbRound) {
  return verbRound?.formSource === "generated" ? t("match.generatedNote") : t("match.validatedNote");
}

function selectVerbRoundPairs(forms) {
  const ordered = forms.filter((item) => MATCH_FORM_ORDER.includes(item.id));
  const byId = new Map(ordered.map((item) => [item.id, item]));
  const deduped = [];
  const seen = new Set();

  MATCH_FORM_ORDER.forEach((id) => {
    const item = byId.get(id);
    if (!item) return;
    if (!item.valuePlain || seen.has(item.valuePlain)) return;
    seen.add(item.valuePlain);
    deduped.push(item);
  });

  if (deduped.length > MATCH_MAX_PAIRS) {
    return deduped.slice(0, MATCH_MAX_PAIRS);
  }
  return deduped;
}

function refillVerbMatchColumns() {
  while (state.match.leftCards.length < MATCH_VISIBLE_ROWS && state.match.remainingPairs.length) {
    const pair = state.match.remainingPairs.shift();
    if (!pair) break;

    state.match.leftCards.push({
      id: `left-${state.match.nextCardId}`,
      pairId: pair.id,
      englishText: pair.englishText,
      incoming: true,
    });
    state.match.nextCardId += 1;

    state.match.rightCards.push({
      id: `right-${state.match.nextCardId}`,
      pairId: pair.id,
      hebrewPlain: pair.valuePlain,
      hebrewNiqqud: pair.valueNiqqud || pair.valuePlain,
      incoming: true,
    });
    state.match.nextCardId += 1;
  }

  state.match.rightCards = shuffle(state.match.rightCards);
}

function renderVerbMatchIdleState() {
  state.mode = "verbMatch";
  setGamePickerVisibility(false);
  setPromptCardVisibility(true);
  el.choiceContainer.classList.remove("summary-grid");
  renderSessionHeader();
  renderPoolMeta();
  el.promptLabel.textContent = t("match.prompt");
  el.promptText.classList.remove("hebrew");
  el.promptText.textContent = t("prompt.verbMatchStart");
  el.choiceContainer.innerHTML = "";
  el.choiceContainer.classList.remove("match-grid");
  renderNiqqudToggle();
}

function renderVerbMatchRound() {
  if (!state.match.active || !state.match.currentVerb) {
    renderVerbMatchIdleState();
    return;
  }

  setGamePickerVisibility(false);
  setPromptCardVisibility(true);
  el.choiceContainer.classList.remove("summary-grid");
  renderSessionHeader();
  renderPoolMeta();
  el.promptLabel.textContent = t("match.prompt");
  renderPromptText();
  renderVerbMatchCards();
}

function renderVerbMatchPrompt() {
  if (!state.match.active || !state.match.currentVerb) {
    el.promptText.classList.remove("hebrew");
    el.promptText.textContent = t("prompt.verbMatchStart");
    renderNiqqudToggle();
    return;
  }

  const current = state.match.currentVerb.word;
  const heText = state.showNiqqudInline ? current.heNiqqud : current.he;
  const promptLine = `${current.en} | ${heText}`;
  el.promptText.classList.remove("hebrew");
  el.promptText.textContent = promptLine;
  renderNiqqudToggle();
}

function renderVerbMatchCards() {
  el.choiceContainer.innerHTML = "";
  el.choiceContainer.classList.add("match-grid");
  const leftSelected = state.match.selectedLeftId;
  const rightSelected = state.match.selectedRightId;
  const mismatchSet = new Set(state.match.mismatchedCardIds);
  const matchedSet = new Set(state.match.matchedCardIds);

  const wrap = document.createElement("div");
  wrap.className = "match-columns";

  const leftCol = document.createElement("section");
  leftCol.className = "match-col";
  const leftTitle = document.createElement("p");
  leftTitle.className = "match-col-title";
  leftTitle.textContent = t("match.leftColumn");
  const leftStack = document.createElement("div");
  leftStack.className = "match-stack";

  state.match.leftCards.forEach((card, idx) => {
    const btn = document.createElement("button");
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
    btn.addEventListener("click", () => handleVerbMatchLeft(card.id));
    leftStack.append(btn);
    card.incoming = false;
  });

  leftCol.append(leftTitle, leftStack);

  const rightCol = document.createElement("section");
  rightCol.className = "match-col";
  const rightTitle = document.createElement("p");
  rightTitle.className = "match-col-title";
  rightTitle.textContent = t("match.rightColumn");
  const rightStack = document.createElement("div");
  rightStack.className = "match-stack";

  state.match.rightCards.forEach((card, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn match-card hebrew";
    btn.textContent = state.showNiqqudInline ? card.hebrewNiqqud : card.hebrewPlain;
    btn.classList.toggle("selected", rightSelected === card.id);
    btn.classList.toggle("matched", matchedSet.has(card.id));
    btn.classList.toggle("mismatch", mismatchSet.has(card.id));
    btn.classList.toggle("incoming", Boolean(card.incoming));
    if (card.incoming) {
      btn.style.animationDelay = `${idx * 40 + 30}ms`;
    }
    btn.addEventListener("click", () => handleVerbMatchRight(card.id));
    rightStack.append(btn);
    card.incoming = false;
  });

  rightCol.append(rightTitle, rightStack);
  wrap.append(leftCol, rightCol);
  el.choiceContainer.append(wrap);
}

function handleVerbMatchLeft(cardId) {
  if (!state.match.active || !state.match.currentVerb || state.match.isResolving) return;
  const card = state.match.leftCards.find((item) => item.id === cardId);
  if (!card) return;

  state.match.selectedLeftId = state.match.selectedLeftId === cardId ? null : cardId;
  resolveVerbMatchSelection();
  renderVerbMatchRound();
}

function handleVerbMatchRight(cardId) {
  if (!state.match.active || !state.match.currentVerb || state.match.isResolving) return;
  const card = state.match.rightCards.find((item) => item.id === cardId);
  if (!card) return;

  state.match.selectedRightId = state.match.selectedRightId === cardId ? null : cardId;
  resolveVerbMatchSelection();
  renderVerbMatchRound();
}

function resolveVerbMatchSelection() {
  if (!state.match.selectedLeftId || !state.match.selectedRightId) return;

  const leftCard = state.match.leftCards.find((item) => item.id === state.match.selectedLeftId);
  const rightCard = state.match.rightCards.find((item) => item.id === state.match.selectedRightId);
  if (!leftCard || !rightCard) {
    state.match.selectedLeftId = null;
    state.match.selectedRightId = null;
    return;
  }

  if (leftCard.pairId === rightCard.pairId) {
    applyVerbMatchSuccess(leftCard, rightCard);
    return;
  }

  applyVerbMatchMismatch(leftCard, rightCard);
}

function applyVerbMatchSuccess(leftCard, rightCard) {
  const currentWordId = state.match.currentVerb?.word?.id || "";
  state.match.isResolving = true;
  state.match.matchedCardIds = [leftCard.id, rightCard.id];
  state.match.selectedLeftId = null;
  state.match.selectedRightId = null;
  state.match.combo += 1;
  state.match.bestCombo = Math.max(state.match.bestCombo, state.match.combo);
  state.sessionStreak += 1;
  state.sessionScore += 1;
  state.match.sessionMatched += 1;
  updateConjugationProgress(currentWordId, true);
  renderDomainPerformance();

  if (!state.match.matchedPairIds.includes(leftCard.pairId)) {
    state.match.matchedPairIds.push(leftCard.pairId);
  }
  state.match.matchedCount = state.match.matchedPairIds.length;
  renderVerbMatchRound();

  global.setTimeout(() => {
    if (!state.match.active) return;
    state.match.leftCards = state.match.leftCards.filter((item) => item.id !== leftCard.id);
    state.match.rightCards = state.match.rightCards.filter((item) => item.id !== rightCard.id);
    state.match.matchedCardIds = [];
    refillVerbMatchColumns();
    state.match.isResolving = false;

    if (state.match.matchedCount >= state.match.totalPairs) {
      const current = state.match.currentVerb.word;
      const verbLabel = state.showNiqqudInline ? current.heNiqqud : current.he;
      const streakCount = recordConjugationRound(current.id, !state.match.currentVerbHadMismatch);
      const reachedMasterThreshold = streakCount >= CONJUGATION_MASTER_STREAK && !isWordMastered(current.id);
      state.match.eligibleMasterWordId = reachedMasterThreshold ? current.id : "";
      const roundText = t("match.roundDone", { verb: `${current.en} / ${verbLabel}` });
      const masteryText = reachedMasterThreshold
        ? t("mastered.ready", { verb: current.en, target: CONJUGATION_MASTER_STREAK })
        : t("mastered.streakStatus", { count: streakCount, target: CONJUGATION_MASTER_STREAK });
      setFeedback(`${roundText} ${masteryText}`, true);
    }
    renderVerbMatchRound();
  }, 180);
}

function applyVerbMatchMismatch(leftCard, rightCard) {
  const currentWordId = state.match.currentVerb?.word?.id || "";
  state.match.isResolving = true;
  state.match.combo = 0;
  state.sessionStreak = 0;
  state.match.currentVerbHadMismatch = true;
  state.match.mismatchedCardIds = [leftCard.id, rightCard.id];
  state.match.selectedLeftId = null;
  state.match.selectedRightId = null;
  updateConjugationProgress(currentWordId, false);
  renderDomainPerformance();
  renderVerbMatchRound();

  global.setTimeout(() => {
    if (!state.match.active) return;
    state.match.mismatchedCardIds = [];
    state.match.isResolving = false;
    renderVerbMatchRound();
  }, 300);
}

function startVerbMatchTimer() {
  stopVerbMatchTimer();
  state.match.timerId = global.setInterval(() => {
    if (!state.match.active) return;
    state.match.elapsedSeconds = Math.max(0, Math.floor((Date.now() - state.match.startMs) / 1000));
    if (state.mode === "verbMatch") {
      renderSessionHeader();
    }
  }, 1000);
}

function stopVerbMatchTimer() {
  if (!state.match.timerId) return;
  global.clearInterval(state.match.timerId);
  state.match.timerId = null;
}

function startLessonTimer() {
  stopLessonTimer();
  state.lesson.timerId = global.setInterval(() => {
    if (!state.lesson.active) return;
    state.lesson.elapsedSeconds = Math.max(0, Math.floor((Date.now() - state.lesson.startMs) / 1000));
    if (state.mode === "lesson") {
      renderSessionHeader();
    }
  }, 1000);
}

function stopLessonTimer() {
  if (!state.lesson.timerId) return;
  global.clearInterval(state.lesson.timerId);
  state.lesson.timerId = null;
}

function buildQuestion(pool) {
  const mode = pickQuestionMode();
  const freshPool =
    state.lesson.askedWordIds.length < pool.length
      ? pool.filter((word) => !state.lesson.askedWordIds.includes(word.id))
      : pool;
  const targetDomainId = pickLeastSeenLessonDomainId(freshPool);
  const domainPool = targetDomainId
    ? freshPool.filter((word) => getDomainIdForWord(word) === targetDomainId)
    : freshPool;
  const word = pickBestWord(domainPool.length ? domainPool : freshPool);
  if (!word) return null;

  state.lesson.askedWordIds.push(word.id);
  const chosenDomainId = getDomainIdForWord(word);
  state.lesson.domainCounts[chosenDomainId] = (state.lesson.domainCounts[chosenDomainId] || 0) + 1;
  const options = buildOptions(pool, word);

  if (mode === "reverse") {
    return {
      mode: "reverse",
      promptLabel: t("prompt.toEnglish"),
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
    promptLabel: t("prompt.toHebrew"),
    prompt: word.en,
    promptIsHebrew: false,
    options,
    optionsAreHebrew: true,
    word,
    isReview: false,
  };
}

function buildReviewQuestion(pool) {
  while (state.lesson.reviewQueue.length) {
    const wordId = state.lesson.reviewQueue.shift();
    const word = pool.find((item) => item.id === wordId);
    if (!word) continue;

    const mode = pickQuestionMode();
    const forbiddenOptionIds = new Set((state.lesson.optionHistory[word.id] || []).filter((id) => id !== word.id));
    const options = buildOptions(pool, word, { forbiddenOptionIds });

    if (mode === "reverse") {
      return {
        mode: "reverse",
        promptLabel: t("prompt.reviewToEnglish"),
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
      promptLabel: t("prompt.reviewToHebrew"),
      prompt: word.en,
      promptIsHebrew: false,
      options,
      optionsAreHebrew: true,
      word,
      isReview: true,
    };
  }

  return null;
}

function buildOptions(pool, word, config = {}) {
  const forbiddenOptionIds = config.forbiddenOptionIds || new Set();
  const sameCategoryCandidates = pool.filter(
    (item) => item.id !== word.id && item.category === word.category && !forbiddenOptionIds.has(item.id)
  );
  const distractors = shuffle(sameCategoryCandidates).slice(0, 3);

  if (distractors.length < 3) {
    const filler = shuffle(
      pool.filter(
        (item) => item.id !== word.id && !distractors.includes(item) && !forbiddenOptionIds.has(item.id)
      )
    ).slice(0, 3 - distractors.length);
    distractors.push(...filler);
  }

  if (distractors.length < 3) {
    const fallback = shuffle(
      pool.filter((item) => item.id !== word.id && !distractors.includes(item))
    ).slice(0, 3 - distractors.length);
    distractors.push(...fallback);
  }

  const options = [word, ...distractors].slice(0, 4).map((item) => ({
    id: item.id,
    word: item,
  }));

  return shuffle(options);
}

function pickQuestionMode() {
  return Math.random() < 0.5 ? "forward" : "reverse";
}

function rememberOptionHistory(question) {
  if (!question?.word?.id || !Array.isArray(question.options) || state.lesson.optionHistory[question.word.id]) {
    return;
  }

  state.lesson.optionHistory[question.word.id] = question.options.map((option) => option.id);
}

function tryStartReviewPhase(pool) {
  if (state.lesson.inReview || !state.lesson.missedWordIds.length) return false;

  const wordIdsInPool = new Set(pool.map((word) => word.id));
  const reviewIds = state.lesson.missedWordIds.filter((id) => wordIdsInPool.has(id));
  if (!reviewIds.length) return false;

  state.lesson.inReview = true;
  state.lesson.reviewQueue = shuffle(reviewIds);
  state.lesson.secondChanceTotal = state.lesson.reviewQueue.length;
  state.lesson.secondChanceCurrent = 0;
  return true;
}

function buildDomainByCategoryMap(domains) {
  const categoryMap = new Map();
  domains.forEach((domain) => {
    domain.categories.forEach((category) => {
      categoryMap.set(category, domain.id);
    });
  });
  return categoryMap;
}

function getDomainIdForWord(word) {
  return DOMAIN_BY_CATEGORY.get(word?.category) || FALLBACK_DOMAIN_ID;
}

function pickLeastSeenLessonDomainId(pool) {
  if (!pool.length) return null;

  const availableDomainIds = new Set(pool.map((word) => getDomainIdForWord(word)));
  if (!availableDomainIds.size) return null;

  let minCount = Infinity;
  availableDomainIds.forEach((domainId) => {
    minCount = Math.min(minCount, state.lesson.domainCounts[domainId] || 0);
  });

  const leastSeenDomainIds = [...availableDomainIds].filter(
    (domainId) => (state.lesson.domainCounts[domainId] || 0) === minCount
  );
  if (!leastSeenDomainIds.length) return null;

  return leastSeenDomainIds[Math.floor(Math.random() * leastSeenDomainIds.length)];
}

function pickBestWord(pool, usedWordIds = []) {
  const now = Date.now();
  const freshPool =
    usedWordIds.length < pool.length ? pool.filter((word) => !usedWordIds.includes(word.id)) : pool;
  const due = getDueWords(freshPool, now);
  const set = due.length ? due : freshPool;
  const maxLevel = LEITNER_INTERVALS.length - 1;

  const weighted = set.map((word) => {
    const rec = getProgressRecord(word.id);
    const accuracy = rec.attempts ? rec.correct / rec.attempts : 0;
    const overdueMs = rec.attempts ? Math.max(0, now - rec.nextDue) : 0;
    const overdueHours = overdueMs / (60 * 60 * 1000);

    const newWordBoost = rec.attempts === 0 ? 1.45 : 1;
    const dueBoost = rec.attempts > 0 && rec.nextDue <= now ? 1 + Math.min(1.4, overdueHours / 12) : 1;
    const weaknessBoost = 1 + (1 - accuracy) * 0.85;
    const levelBoost = 1 + ((maxLevel - rec.level) / maxLevel) * 0.45;
    const utilityBoost = 0.7 + Math.min(1, (word.utility || 50) / 100) * 0.6;
    const jitter = 0.7 + Math.random() * 0.8;

    return {
      word,
      weight: newWordBoost * dueBoost * weaknessBoost * levelBoost * utilityBoost * jitter,
    };
  });

  return weightedRandomWord(weighted);
}

function updateProgress(wordId, isCorrect) {
  const rec = getProgressRecord(wordId);
  rec.attempts += 1;
  rec.lastSeen = Date.now();

  if (isCorrect) {
    rec.correct += 1;
    rec.level = Math.min(LEITNER_INTERVALS.length - 1, rec.level + 1);
    rec.nextDue = Date.now() + LEITNER_INTERVALS[rec.level];
  } else {
    rec.level = Math.max(0, rec.level - 1);
    rec.nextDue = Date.now() + 2 * 60 * 1000;
  }

  state.progress[wordId] = rec;
}

function getProgressRecord(wordId) {
  return {
    attempts: 0,
    correct: 0,
    level: 0,
    nextDue: 0,
    lastSeen: 0,
    mastered: false,
    conjugationAttempts: 0,
    conjugationCorrect: 0,
    conjugationStreak: 0,
    lastConjugationSeen: 0,
    ...(state.progress[wordId] || {}),
  };
}

function getDueWords(pool, now = Date.now()) {
  return pool.filter((word) => {
    const rec = getProgressRecord(word.id);
    return rec.attempts === 0 || rec.nextDue <= now;
  });
}

function getSelectedPool() {
  const all = getAllVocabulary().filter((word) => !isWordMastered(word.id));

  return [...all].sort((a, b) => {
    if ((b.utility || 0) !== (a.utility || 0)) {
      return (b.utility || 0) - (a.utility || 0);
    }

    return a.en.localeCompare(b.en);
  });
}

function getAllVocabulary() {
  return [...baseVocabulary];
}

function getWordById(wordId) {
  if (!wordId) return null;
  return baseVocabulary.find((word) => word.id === wordId) || null;
}

function isWordMastered(wordId) {
  return Boolean(state.progress[wordId]?.mastered);
}

function getMasteredWords() {
  return getAllVocabulary().filter((word) => isWordMastered(word.id));
}

function setWordMastered(wordId, mastered) {
  if (!wordId) return false;
  const rec = getProgressRecord(wordId);
  rec.mastered = Boolean(mastered);
  if (rec.mastered) {
    rec.masteredAt = Date.now();
  } else {
    delete rec.masteredAt;
  }
  state.progress[wordId] = rec;
  return true;
}

function updateConjugationProgress(wordId, isCorrect) {
  if (!wordId) return;
  const rec = getProgressRecord(wordId);
  rec.conjugationAttempts = Number(rec.conjugationAttempts || 0) + 1;
  if (isCorrect) {
    rec.conjugationCorrect = Number(rec.conjugationCorrect || 0) + 1;
  }
  rec.lastConjugationSeen = Date.now();
  state.progress[wordId] = rec;
}

function recordConjugationRound(wordId, cleanRound) {
  if (!wordId) return 0;
  const rec = getProgressRecord(wordId);
  const current = Number(rec.conjugationStreak || 0);
  rec.conjugationStreak = cleanRound ? current + 1 : 0;
  rec.lastConjugationSeen = Date.now();
  state.progress[wordId] = rec;
  saveProgress();
  return rec.conjugationStreak;
}

function getVerbVocabulary(words) {
  return words.filter((word) => isVerbEntry(word));
}

function isVerbEntry(word) {
  const english = String(word?.en || "").trim();
  const hebrew = String(word?.he || "").trim();
  if (!english || !hebrew) return false;
  if (!/^to\s+/i.test(english)) return false;
  const blockedIdioms = new Set(["to be honest"]);
  if (blockedIdioms.has(english.toLowerCase())) return false;
  return /^ל[\u0590-\u05ff]/.test(hebrew);
}

function buildVerbFormDeck(verbs) {
  return verbs
    .map((word) => {
      const conjugationWord = buildConjugationDisplayWord(word);
      const forms = buildGeneratedVerbForms(word, conjugationWord);
      return {
        id: word.id,
        word: conjugationWord,
        forms,
      };
    })
    .filter((item) => item.forms.length >= 4);
}

function buildConjugationDisplayWord(word) {
  const infinitive = extractInfinitiveToken(word);
  const hePlain = infinitive.plain || String(word?.he || "");
  const heMarked = infinitive.marked || String(word?.heNiqqud || hePlain);
  const enInfinitive = extractEnglishConjugationInfinitive(word?.en);
  return {
    ...word,
    he: hePlain,
    heNiqqud: heMarked,
    en: enInfinitive,
  };
}

function buildGeneratedVerbForms(sourceWord, conjugationWord = sourceWord) {
  const infinitive = extractInfinitiveToken(conjugationWord);
  const plainInf = infinitive.plain || stripNiqqud(conjugationWord.heNiqqud || conjugationWord.he);
  const markedInf = infinitive.marked || String(conjugationWord.heNiqqud || conjugationWord.he || "");
  const root = deriveRootLetters(plainInf);
  const binyan = detectBinyan(plainInf, markedInf);
  const generated = generateConjugationForms(root, binyan, markedInf);
  applyVerbConjugationOverrides(generated, sourceWord, plainInf);
  generated.infinitive = normalizeHebrewSofitForms(
    String(conjugationWord.heNiqqud || conjugationWord.he || markedInf || plainInf)
  );

  const forms = [];
  const seenPlain = new Set();
  MATCH_FORM_ORDER.forEach((formId) => {
    const marked = normalizeHebrewSofitForms(String(generated[formId] || "").trim());
    if (!marked) return;
    const plain = stripNiqqud(marked);
    if (!plain || seenPlain.has(plain)) return;
    seenPlain.add(plain);
    forms.push({
      id: formId,
      englishText: buildEnglishVerbFormText(String(conjugationWord?.en || sourceWord?.en || ""), formId),
      valuePlain: plain,
      valueNiqqud: marked,
    });
  });

  return forms;
}

function applyVerbConjugationOverrides(formMap, word, infinitivePlain) {
  const plainInf = String(infinitivePlain || "").trim();
  const english = String(word?.en || "").trim().toLowerCase();
  const isSoakFamily = plainInf === "להשרות" || english === "to soak" || english === "to marinate";
  if (isSoakFamily) {
    Object.assign(formMap, {
      infinitive: "לְהַשְׁרוֹת",
      past3ms: "הִשְׁרָה",
      past3fs: "הִשְׁרִיתָה",
      past3p: "הִשְׁרוּ",
      presentMs: "מַשְׁרֶה",
      presentFs: "מַשְׁרָה",
      presentPl: "מַשְׁרִים",
      future1s: "אַשְׁרֶה",
      future3ms: "יַשְׁרֶה",
      future3fs: "תַּשְׁרֶה",
      imperativeMs: "הַשְׁרֵה",
      nounAction: "הַשְׁרָיָה",
      adjectiveMs: "שָׁרוּי",
      adjectiveFs: "שְׁרוּיָה",
    });
    return;
  }

  const isIgniteFamily = plainInf === "להצית" || english === "to ignite" || english === "to set on fire";
  if (isIgniteFamily) {
    Object.assign(formMap, {
      infinitive: "לְהַצִּית",
      past3ms: "הִצִּית",
      past3fs: "הִצִּיתָה",
      past3p: "הִצִּיתוּ",
      presentMs: "מַצִּית",
      presentFs: "מַצִּיתָה",
      presentPl: "מַצִּיתִים",
      future1s: "אַצִּית",
      future3ms: "יַצִּית",
      future3fs: "תַּצִּית",
      imperativeMs: "הַצֵּת",
      nounAction: "הַצָּתָה",
      adjectiveMs: "מֻצָּת",
      adjectiveFs: "מֻצָּתָה",
    });
    return;
  }

  const isWhitenFamily = plainInf === "להלבין" || english === "to whiten" || english === "to bleach";
  if (isWhitenFamily) {
    Object.assign(formMap, {
      infinitive: "לְהַלְבִּין",
      past3ms: "הִלְבִּין",
      past3fs: "הִלְבִּינָה",
      past3p: "הִלְבִּינוּ",
      presentMs: "מַלְבִּין",
      presentFs: "מַלְבִּינָה",
      presentPl: "מַלְבִּינִים",
      future1s: "אַלְבִּין",
      future3ms: "יַלְבִּין",
      future3fs: "תַּלְבִּין",
      imperativeMs: "הַלְבֵּן",
      nounAction: "הַלְבָּנָה",
      adjectiveMs: "מַלְבִּין",
      adjectiveFs: "מַלְבִּינָה",
    });
  }
}

function extractInfinitiveToken(word) {
  const plainTokens = String(word?.he || "").trim().split(/\s+/).filter(Boolean);
  const markedTokens = String(word?.heNiqqud || "").trim().split(/\s+/).filter(Boolean);

  let tokenIndex = plainTokens.findIndex((token) => /^ל[\u0590-\u05ff]/.test(token));
  if (tokenIndex < 0) tokenIndex = 0;

  return {
    plain: String(plainTokens[tokenIndex] || plainTokens[0] || ""),
    marked: String(markedTokens[tokenIndex] || markedTokens[0] || plainTokens[tokenIndex] || ""),
  };
}

function extractEnglishConjugationInfinitive(englishText) {
  const raw = String(englishText || "").trim().toLowerCase();
  if (!raw) return "to do";
  const phrase = raw.replace(/^to\s+/i, "").trim();
  if (!phrase) return "to do";
  const head = String(phrase.split(/\s+/).find(Boolean) || "")
    .replace(/^[^a-z]+/i, "")
    .replace(/[^a-z'-]+$/i, "");
  if (!head) return "to do";
  return `to ${head}`;
}

function deriveRootLetters(infinitivePlain) {
  let token = normalizeHebrewToMedial(String(infinitivePlain || ""))
    .replace(/^ל/, "")
    .replace(/[^א-ת]/g, "");
  if (token.startsWith("הת") && token.length > 4) {
    token = token.slice(2);
  } else if (token.startsWith("ה") && token.length > 3) {
    token = token.slice(1);
  }

  if (token.endsWith("ות") && token.length > 3) {
    token = `${token.slice(0, -2)}ה`;
  }

  const letters = [...token];
  const kept = [];
  for (let i = 0; i < letters.length; i += 1) {
    const current = letters[i];
    const remaining = letters.length - (i + 1);
    const canSkipMater = /[וי]/.test(current) && kept.length + remaining >= 3;
    if (canSkipMater) continue;
    kept.push(current);
  }

  let root = kept.filter(Boolean);
  if (root.length > 3) {
    root = root.slice(0, 3);
  }

  while (root.length < 3) {
    root.push(root[root.length - 1] || "א");
  }

  return root.map((letter) => toMedialHebrewLetter(letter));
}

function detectBinyan(plainInf, markedInf) {
  const plain = String(plainInf || "");
  const marked = String(markedInf || "");

  if (plain.startsWith("להת") || marked.startsWith("לְהִת")) return "hitpael";
  if (plain.startsWith("לה") || marked.startsWith("לְהַ") || marked.startsWith("לְהִ")) return "hifil";
  if (marked.startsWith("לִ") || marked.startsWith("לַ") || marked.startsWith("לָ") || marked.startsWith("לֶ")) {
    return "paal";
  }
  if (marked.startsWith("לְ")) return "piel";
  return "paal";
}

function generateConjugationForms(root, binyan, fallbackInf) {
  if (!Array.isArray(root) || root.length < 3) {
    return { infinitive: normalizeHebrewSofitForms(fallbackInf) };
  }

  const [r1, r2, r3] = root;

  if (binyan === "hifil") {
    return normalizeGeneratedHebrewForms({
      infinitive: `לְהַ${r1}ְ${r2}ִי${r3}`,
      past3ms: `הִ${r1}ְ${r2}ִי${r3}`,
      past3fs: `הִ${r1}ְ${r2}ִי${r3}ָה`,
      past3p: `הִ${r1}ְ${r2}ִי${r3}וּ`,
      presentMs: `מַ${r1}ְ${r2}ִי${r3}`,
      presentFs: `מַ${r1}ְ${r2}ִי${r3}ָה`,
      presentPl: `מַ${r1}ְ${r2}ִי${r3}ִים`,
      future1s: `אַ${r1}ְ${r2}ִי${r3}`,
      future3ms: `יַ${r1}ְ${r2}ִי${r3}`,
      future3fs: `תַ${r1}ְ${r2}ִי${r3}`,
      imperativeMs: `הַ${r1}ְ${r2}ֵ${r3}`,
      nounAction: `הַ${r1}ְ${r2}ָ${r3}ָה`,
      adjectiveMs: `מַ${r1}ְ${r2}ִי${r3}`,
      adjectiveFs: `מַ${r1}ְ${r2}ִי${r3}ָה`,
    });
  }

  if (binyan === "hitpael") {
    return normalizeGeneratedHebrewForms({
      infinitive: `לְהִתְ${r1}ַ${r2}ֵּ${r3}`,
      past3ms: `הִתְ${r1}ַ${r2}ֵּ${r3}`,
      past3fs: `הִתְ${r1}ַ${r2}ְּ${r3}ָה`,
      past3p: `הִתְ${r1}ַ${r2}ְּ${r3}וּ`,
      presentMs: `מִתְ${r1}ַ${r2}ֵּ${r3}`,
      presentFs: `מִתְ${r1}ַ${r2}ֶּ${r3}ֶת`,
      presentPl: `מִתְ${r1}ַ${r2}ְּ${r3}ִים`,
      future1s: `אֶתְ${r1}ַ${r2}ֵּ${r3}`,
      future3ms: `יִתְ${r1}ַ${r2}ֵּ${r3}`,
      future3fs: `תִתְ${r1}ַ${r2}ֵּ${r3}`,
      imperativeMs: `הִתְ${r1}ַ${r2}ֵּ${r3}`,
      nounAction: `הִתְ${r1}ַ${r2}ְּ${r3}וּת`,
      adjectiveMs: `מִתְ${r1}ַ${r2}ֵּ${r3}`,
      adjectiveFs: `מִתְ${r1}ַ${r2}ֶּ${r3}ֶת`,
    });
  }

  if (binyan === "piel") {
    return normalizeGeneratedHebrewForms({
      infinitive: `לְ${r1}ַ${r2}ֵּ${r3}`,
      past3ms: `${r1}ִ${r2}ֵּ${r3}`,
      past3fs: `${r1}ִ${r2}ְּ${r3}ָה`,
      past3p: `${r1}ִ${r2}ְּ${r3}וּ`,
      presentMs: `מְ${r1}ַ${r2}ֵּ${r3}`,
      presentFs: `מְ${r1}ַ${r2}ֶּ${r3}ֶת`,
      presentPl: `מְ${r1}ַ${r2}ְּ${r3}ִים`,
      future1s: `אֲ${r1}ַ${r2}ֵּ${r3}`,
      future3ms: `יְ${r1}ַ${r2}ֵּ${r3}`,
      future3fs: `תְ${r1}ַ${r2}ֵּ${r3}`,
      imperativeMs: `${r1}ַ${r2}ֵּ${r3}`,
      nounAction: `${r1}ִ${r2}ּוּ${r3}`,
      adjectiveMs: `מְ${r1}ַ${r2}ֵּ${r3}`,
      adjectiveFs: `מְ${r1}ַ${r2}ֶּ${r3}ֶת`,
    });
  }

  return normalizeGeneratedHebrewForms({
    infinitive: `לִ${r1}ְ${r2}וֹ${r3}`,
    past3ms: `${r1}ָ${r2}ַ${r3}`,
    past3fs: `${r1}ָ${r2}ְ${r3}ָה`,
    past3p: `${r1}ָ${r2}ְ${r3}וּ`,
    presentMs: `${r1}וֹ${r2}ֵ${r3}`,
    presentFs: `${r1}וֹ${r2}ֶ${r3}ֶת`,
    presentPl: `${r1}וֹ${r2}ְ${r3}ִים`,
    future1s: `אֶ${r1}ְ${r2}וֹ${r3}`,
    future3ms: `יִ${r1}ְ${r2}וֹ${r3}`,
    future3fs: `תִ${r1}ְ${r2}וֹ${r3}`,
    imperativeMs: `${r1}ְ${r2}וֹ${r3}`,
    nounAction: `${r1}ְ${r2}ִי${r3}ָה`,
    adjectiveMs: `${r1}וֹ${r2}ֵ${r3}`,
    adjectiveFs: `${r1}וֹ${r2}ֶ${r3}ֶת`,
  });
}

function buildEnglishVerbFormText(englishInfinitive, formId) {
  const base = toVerbBasePhrase(englishInfinitive);
  const present3 = inflectEnglishThirdPerson(base);
  const past = inflectEnglishPast(base);
  const gerund = inflectEnglishGerund(base);

  switch (formId) {
    case "infinitive":
      return `to ${base}`;
    case "past3ms":
      return `he ${past}`;
    case "past3fs":
      return `she ${past}`;
    case "past3p":
      return `they ${past}`;
    case "presentMs":
      return `he ${present3}`;
    case "presentFs":
      return `she ${present3}`;
    case "presentPl":
      return `they ${base}`;
    case "future1s":
      return `I will ${base}`;
    case "future3ms":
      return `he will ${base}`;
    case "future3fs":
      return `she will ${base}`;
    case "imperativeMs":
      return `${base}!`;
    case "nounAction":
      return `${gerund} (action noun)`;
    case "adjectiveMs":
      return `${gerund} (adjective m.s.)`;
    case "adjectiveFs":
      return `${gerund} (adjective f.s.)`;
    default:
      return base;
  }
}

function toVerbBasePhrase(englishInfinitive) {
  const raw = String(englishInfinitive || "").trim().toLowerCase();
  if (!raw) return "do";
  return raw.replace(/^to\s+/, "").trim() || "do";
}

function splitVerbPhrase(phrase) {
  const parts = String(phrase || "").split(/\s+/).filter(Boolean);
  if (!parts.length) return { head: "do", tail: "" };
  return {
    head: parts[0],
    tail: parts.slice(1).join(" "),
  };
}

function joinVerbPhrase(head, tail) {
  return tail ? `${head} ${tail}` : head;
}

function inflectEnglishThirdPerson(basePhrase) {
  const { head, tail } = splitVerbPhrase(basePhrase);
  let verb = head;
  if (/(s|x|z|sh|ch|o)$/.test(verb)) {
    verb = `${verb}es`;
  } else if (/[^aeiou]y$/.test(verb)) {
    verb = `${verb.slice(0, -1)}ies`;
  } else {
    verb = `${verb}s`;
  }
  return joinVerbPhrase(verb, tail);
}

function inflectEnglishPast(basePhrase) {
  const irregular = new Map([
    ["be", "was"],
    ["do", "did"],
    ["go", "went"],
    ["have", "had"],
    ["make", "made"],
    ["take", "took"],
    ["set", "set"],
    ["put", "put"],
    ["cut", "cut"],
    ["run", "ran"],
    ["eat", "ate"],
    ["drink", "drank"],
    ["write", "wrote"],
    ["read", "read"],
    ["bring", "brought"],
    ["buy", "bought"],
    ["choose", "chose"],
    ["come", "came"],
    ["freeze", "froze"],
  ]);

  const { head, tail } = splitVerbPhrase(basePhrase);
  let verb = irregular.get(head);
  if (!verb) {
    if (/e$/.test(head)) {
      verb = `${head}d`;
    } else if (/[^aeiou]y$/.test(head)) {
      verb = `${head.slice(0, -1)}ied`;
    } else {
      verb = `${head}ed`;
    }
  }
  return joinVerbPhrase(verb, tail);
}

function inflectEnglishGerund(basePhrase) {
  const { head, tail } = splitVerbPhrase(basePhrase);
  let verb = head;
  if (/ie$/.test(verb)) {
    verb = `${verb.slice(0, -2)}ying`;
  } else if (/e$/.test(verb) && !/ee$/.test(verb)) {
    verb = `${verb.slice(0, -1)}ing`;
  } else {
    verb = `${verb}ing`;
  }
  return joinVerbPhrase(verb, tail);
}

function getHebrewText(word, withNiqqud) {
  const plain = word?.he || "";
  const marked = word?.heNiqqud || plain;
  return withNiqqud ? marked : plain;
}

function buildAnswerDisplay(word, withNiqqud = false) {
  const plain = getHebrewText(word, false);
  const marked = getHebrewText(word, true);

  if (!plain || marked === plain || !withNiqqud) return plain;
  return `${plain} (${marked})`;
}

function setFeedback(text, success) {
  el.feedback.textContent = text;
  el.feedback.classList.toggle("good", Boolean(success));
  el.feedback.classList.toggle("bad", success === false);
}

function clearFeedback() {
  el.feedback.textContent = "";
  el.feedback.classList.remove("good", "bad");
}

function resetSessionCounters() {
  state.sessionScore = 0;
  state.sessionStreak = 0;
}

function loadJson(key, fallback) {
  if (!storage) return fallback;

  try {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function loadLanguagePreference() {
  if (!storage) return "en";

  try {
    const raw = storage.getItem(STORAGE_KEYS.language);
    return raw === "he" ? "he" : "en";
  } catch {
    return "en";
  }
}

function saveLanguagePreference(value) {
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEYS.language, value === "he" ? "he" : "en");
  } catch {
    // Ignore write failures.
  }
}

function loadThemePreference() {
  if (!storage) return "dark";

  try {
    const raw = storage.getItem(STORAGE_KEYS.theme);
    return raw === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function saveThemePreference(value) {
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEYS.theme, value === "light" ? "light" : "dark");
  } catch {
    // Ignore write failures.
  }
}

function saveProgress() {
  saveJson(STORAGE_KEYS.progress, state.progress);
}

function saveJson(key, value) {
  if (!storage) return;

  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore write failures (private mode/storage restrictions).
  }
}

function prepareAbbreviationDeck(entries) {
  const source = Array.isArray(entries) ? entries : [];
  const seenIds = new Set();
  const cleaned = [];

  source.forEach((entry, index) => {
    const abbr = String(entry?.abbr || "").trim();
    const expansionHe = String(entry?.expansionHe || entry?.expansion_he || "").trim();
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
      english,
      bucket: String(entry?.bucket || "").trim(),
      notes: String(entry?.notes || "").trim(),
      source: String(entry?.source || "abbreviation"),
    });
  });

  return cleaned;
}

function prepareVocabulary(words) {
  const phraseMap = new Map();
  const tokenVariants = new Map();

  words.forEach((word) => {
    const plain = String(word?.he || "");
    const marked = String(word?.heNiqqud || "");
    if (!plain || !marked || marked === plain) return;

    phraseMap.set(plain, marked);
    if (stripNiqqud(marked) === stripNiqqud(plain)) {
      collectTokenVariants(plain, marked, tokenVariants);
    }
  });

  const tokenMap = new Map();
  tokenVariants.forEach((variantMap, plainToken) => {
    let bestVariant = plainToken;
    let bestCount = 0;
    variantMap.forEach((count, variant) => {
      if (count > bestCount) {
        bestCount = count;
        bestVariant = variant;
      }
    });
    tokenMap.set(plainToken, bestVariant);
  });

  return words.map((word) => {
    const plain = String(word?.he || "");
    const existing = String(word?.heNiqqud || "");

    if (!plain) {
      return { ...word, heNiqqud: existing || plain };
    }

    if (existing && existing !== plain) {
      return {
        ...word,
        heNiqqud: existing,
      };
    }

    let marked = phraseMap.get(plain) || buildNiqqudFromTokens(plain, tokenMap);
    if (!marked || stripNiqqud(marked) !== stripNiqqud(plain)) marked = plain;
    if (marked === plain) marked = applyFallbackNiqqud(plain);

    return {
      ...word,
      heNiqqud: marked,
    };
  });
}

function collectTokenVariants(plain, marked, tokenVariants) {
  const plainParts = splitHebrewParts(plain);
  const markedParts = splitHebrewParts(marked);
  if (plainParts.length !== markedParts.length) return;

  for (let i = 0; i < plainParts.length; i += 1) {
    const plainToken = plainParts[i];
    const markedToken = markedParts[i];
    if (!isHebrewToken(plainToken) || !isHebrewToken(markedToken)) continue;
    if (stripNiqqud(markedToken) !== stripNiqqud(plainToken)) continue;

    if (!tokenVariants.has(plainToken)) {
      tokenVariants.set(plainToken, new Map());
    }

    const variants = tokenVariants.get(plainToken);
    variants.set(markedToken, (variants.get(markedToken) || 0) + 1);
  }
}

function buildNiqqudFromTokens(plain, tokenMap) {
  const parts = splitHebrewParts(plain);
  let touched = false;

  const mapped = parts.map((part) => {
    if (!isHebrewToken(part)) return part;
    const replacement = tokenMap.get(part);
    if (!replacement) return part;
    touched = true;
    return replacement;
  });

  return touched ? mapped.join("") : plain;
}

function normalizeGeneratedHebrewForms(formMap) {
  const normalized = {};
  Object.entries(formMap || {}).forEach(([key, value]) => {
    normalized[key] = normalizeHebrewSofitForms(value);
  });
  return normalized;
}

function toMedialHebrewLetter(letter) {
  return HEBREW_FINAL_TO_MEDIAL[letter] || letter;
}

function normalizeHebrewToMedial(text) {
  return String(text || "")
    .normalize("NFC")
    .split("")
    .map((char) => toMedialHebrewLetter(char))
    .join("");
}

function isHebrewLetter(char) {
  return /[א-תךםןףץ]/.test(String(char || ""));
}

function isNiqqudMark(char) {
  return /[\u0591-\u05c7]/.test(String(char || ""));
}

function hasHebrewLetterAhead(chars, idx) {
  let i = idx + 1;
  while (i < chars.length && isNiqqudMark(chars[i])) {
    i += 1;
  }
  return i < chars.length && isHebrewLetter(chars[i]);
}

function normalizeHebrewSofitForms(text) {
  const chars = String(text || "").normalize("NFC").split("");
  for (let i = 0; i < chars.length; i += 1) {
    const char = chars[i];
    if (!isHebrewLetter(char)) continue;

    const medial = toMedialHebrewLetter(char);
    const atTokenEnd = !hasHebrewLetterAhead(chars, i);
    chars[i] = atTokenEnd && HEBREW_MEDIAL_TO_FINAL[medial] ? HEBREW_MEDIAL_TO_FINAL[medial] : medial;
  }
  return chars.join("");
}

function splitHebrewParts(text) {
  return String(text).split(/([\s"'׳״.,;:!?()[\]{}\-\/]+)/).filter((part) => part.length);
}

function isHebrewToken(token) {
  return /[\u0590-\u05ff]/.test(token);
}

function stripNiqqud(text) {
  return String(text || "").normalize("NFC").replace(/[\u0591-\u05c7]/g, "");
}

function applyFallbackNiqqud(text) {
  return String(text || "");
}

function weightedRandomWord(weightedItems) {
  if (!weightedItems.length) return null;

  const totalWeight = weightedItems.reduce((sum, item) => sum + Math.max(0, item.weight || 0), 0);
  if (totalWeight <= 0) {
    const idx = Math.floor(Math.random() * weightedItems.length);
    return weightedItems[idx]?.word || null;
  }

  let threshold = Math.random() * totalWeight;
  for (const item of weightedItems) {
    threshold -= Math.max(0, item.weight || 0);
    if (threshold <= 0) {
      return item.word;
    }
  }

  return weightedItems[weightedItems.length - 1]?.word || null;
}

function shuffle(items) {
  const arr = [...items];

  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function getStorage() {
  try {
    if (!global.localStorage) return null;
    const testKey = "__ivriquest_storage_test__";
    global.localStorage.setItem(testKey, "1");
    global.localStorage.removeItem(testKey);
    return global.localStorage;
  } catch {
    return null;
  }
}

})(typeof window !== "undefined" ? window : globalThis);
