(function initIvriQuestApp(global) {
"use strict";
const APP_BUILD = "20260307i";

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
      title: "IvritElite | Advanced Hebrew Trainer",
      name: "IvritElite",
    },
    nav: {
      home: "Home",
      learn: "Learn",
      review: "Review",
      settings: "Settings",
      results: "Results",
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
      submit: "Submit",
      next: "Next",
      viewResults: "View Results",
      backHome: "Back to Home",
      leaveTitle: "Leave this game?",
      leaveBody: "If you leave this game now, you'll lose your progress so far.",
      keepPlaying: "Keep Playing",
      leaveGame: "Lose Progress",
      starting: "Starting...",
      playAgain: "Play Again",
    },
    home: {
      title: "Choose A Game",
      status: "Pick a mode to start.",
      label: "Homepage",
      prompt: "Choose one of the three game modes below.",
    },
    dashboard: {
      eyebrow: "Daily Focus",
      greeting: "Welcome back",
      lessonsEyebrow: "Lesson Options",
      lessonsTitle: "Choose Your Lesson",
      statsEyebrow: "Stats Summary",
      statsTitle: "Current Snapshot",
      user: "Learner",
      userPlaceholder: "You",
      learned: "Total Vocab Learned",
      modeEyebrow: "Interface",
      modeTitle: "Options",
      continue: "Continue Lesson",
      review: "Review Mistakes",
      settings: "Open Settings",
      ready: "Ready to jump back in.",
      active: "Lesson in progress.",
      idle: "No lesson in progress.",
      activeMode: "Current focus",
      currentMode: "Mode",
      language: "Language",
      theme: "Theme",
      niqqud: "Nikud",
      on: "On",
      off: "Off",
    },
    learn: {
      idleLabel: "Learn",
      idlePrompt: "Pick a mode to start a focused session.",
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
      masteredOnlyBody: "All words are currently mastered for translation. Reset progress in Settings to restore them.",
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
    review: {
      queueEyebrow: "Revenge Queue",
      queueTitle: "Review Queue",
      queueEmpty: "No review items waiting.",
      pending: "{count} items waiting for revenge mode.",
      empty: "Nothing is waiting in the current review queue.",
      analyticsEyebrow: "Category Analytics",
      analyticsTitle: "Category Performance",
      missedTitle: "Mistakes To Revenge",
    },
    settings: {
      title: "Settings",
      note: "Adjust language, theme, and inline nikud.",
      language: "Language",
      feedbackSurvey: "Feedback survey",
      niqqud: "Inline Nikud",
      theme: "Theme",
      resetTitle: "Reset Progress",
      resetNote: "Clear saved spacing, streaks, and review data.",
    },
    welcome: {
      title: "Welcome to IvritElite!",
      line1: "This is a new app for advanced Hebrew learning.",
      surveyPrefix: "We would love to hear your feedback in ",
      surveyLink: "this survey",
      surveySuffix: ".",
      line2: "You can also access the survey from the Settings page.",
      close: "Close",
      closeAria: "Close welcome message",
    },
    results: {
      continue: "Continue",
      correct: "Correct",
      incorrect: "Incorrect",
      time: "Time",
      score: "Score",
      accuracy: "Accuracy",
      reviewRounds: "Review Rounds",
      rounds: "Rounds",
      verbs: "Verbs",
      bestCombo: "Best Combo",
      mistakes: "Session Mistakes",
      reviewPerformance: "Review Performance",
      niceJob: "Nice job!",
      amazing: "That's amazing!",
      noMistakes: "No mistakes in this session.",
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
      summary: "Translation pool: {pool} words with nikud ({total} in lexicon).",
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
      title: "עברית עילית | מאמן עברית מתקדם",
      name: "עברית עילית",
    },
    nav: {
      home: "בית",
      learn: "לומדים",
      review: "סקירה",
      settings: "הגדרות",
      results: "תוצאות",
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
      submit: "שלח",
      next: "הבא",
      viewResults: "לתוצאות",
      backHome: "חזרה לעמוד הבית",
      leaveTitle: "לצאת מהמשחק?",
      leaveBody: "אם תצא עכשיו מהמשחק, תאבד את ההתקדמות שלך עד כה.",
      keepPlaying: "להמשיך לשחק",
      leaveGame: "לאבד התקדמות",
      starting: "מתחיל...",
      playAgain: "שחק שוב",
    },
    home: {
      title: "בחר משחק",
      status: "בחר מצב כדי להתחיל.",
      label: "דף הבית",
      prompt: "בחר אחד משלושת מצבי המשחק כאן למטה.",
    },
    dashboard: {
      eyebrow: "פוקוס יומי",
      greeting: "ברוך שובך",
      lessonsEyebrow: "אפשרויות שיעור",
      lessonsTitle: "בחר שיעור",
      statsEyebrow: "סיכום נתונים",
      statsTitle: "תמונת מצב נוכחית",
      user: "לומד",
      userPlaceholder: "אתה",
      learned: "סך אוצר מילים שנלמד",
      modeEyebrow: "ממשק",
      modeTitle: "אפשרויות",
      continue: "המשך שיעור",
      review: "סקור טעויות",
      settings: "פתח הגדרות",
      ready: "מוכן לחזור לתרגול.",
      active: "יש שיעור פעיל.",
      idle: "אין כרגע שיעור פעיל.",
      activeMode: "פוקוס נוכחי",
      currentMode: "מצב",
      language: "שפה",
      theme: "ערכת נושא",
      niqqud: "ניקוד",
      on: "פועל",
      off: "כבוי",
    },
    learn: {
      idleLabel: "לומדים",
      idlePrompt: "בחר מצב כדי להתחיל סשן ממוקד.",
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
      masteredOnlyBody: "כל המילים כרגע מנוסות לתרגום. אפס את ההתקדמות בהגדרות כדי להחזיר אותן.",
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
    review: {
      queueEyebrow: "תור נקמה",
      queueTitle: "תור סקירה",
      queueEmpty: "אין פריטים שמחכים כרגע.",
      pending: "{count} פריטים מחכים למצב נקמה.",
      empty: "אין כרגע פריטים בתור הסקירה הפעיל.",
      analyticsEyebrow: "ניתוח קטגוריות",
      analyticsTitle: "ביצועים לפי קטגוריה",
      missedTitle: "טעויות לנקמה",
    },
    settings: {
      title: "הגדרות",
      note: "התאם שפה, ערכת נושא וניקוד מובנה.",
      language: "שפה",
      feedbackSurvey: "שאלון משוב",
      niqqud: "ניקוד מובנה",
      theme: "ערכת נושא",
      resetTitle: "איפוס התקדמות",
      resetNote: "נקה שמירות, רצפים ונתוני סקירה.",
    },
    welcome: {
      title: "ברוך הבא ל-IvritElite!",
      line1: "זאת אפליקציה חדשה ללימוד עברית ברמה מתקדמת.",
      surveyPrefix: "נשמח לשמוע את המשוב שלך ב",
      surveyLink: "שאלון הזה",
      surveySuffix: ".",
      line2: "אפשר גם לגשת לשאלון מעמוד ההגדרות.",
      close: "סגור",
      closeAria: "סגור הודעת פתיחה",
    },
    results: {
      continue: "המשך",
      correct: "נכון",
      incorrect: "שגוי",
      time: "זמן",
      score: "ציון",
      accuracy: "דיוק",
      reviewRounds: "סבבי חזרה",
      rounds: "סבבים",
      verbs: "פעלים",
      bestCombo: "הקומבו הטוב ביותר",
      mistakes: "טעויות מהסשן",
      reviewPerformance: "סקירת ביצועים",
      niceJob: "כל הכבוד!",
      amazing: "זה מדהים!",
      noMistakes: "לא היו טעויות בסשן הזה.",
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
      summary: "מאגר התרגום: {pool} מילים עם ניקוד ({total} בלקסיקון).",
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
  ui: "ivriquest-ui-v1",
  session: "ivriquest-session-v1",
  welcomeSeen: "ivriquest-welcome-seen-v1",
};

const storage = getStorage();
const restoredUi = loadJson(STORAGE_KEYS.ui, {});
const restoredSession = loadJson(STORAGE_KEYS.session, null);

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
const VOCABULARY_AVAILABILITY_DEFAULTS = Object.freeze({
  translationQuiz: true,
  sentenceHints: true,
});
const FEEDBACK_SURVEY_URL = "https://forms.gle/KqqP7TVLxphRDM179";

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
  appShell: document.querySelector(".app-shell"),
  routeButtons: Array.from(document.querySelectorAll("[data-route]")),
  homeView: document.querySelector("#homeView"),
  homeDashboard: document.querySelector("#homeDashboard"),
  homeLessonStage: document.querySelector("#homeLessonStage"),
  homeResultsStage: document.querySelector("#homeResultsStage"),
  reviewView: document.querySelector("#reviewView"),
  settingsView: document.querySelector("#settingsView"),
  resultsView: document.querySelector("#resultsView"),
  shellRouteSummary: document.querySelector("#shellRouteSummary"),
  shellRouteChip: document.querySelector("#shellRouteChip"),
  homeLessonBtn: document.querySelector("#homeLessonBtn"),
  homeVerbMatchBtn: document.querySelector("#homeVerbMatchBtn"),
  homeAbbreviationBtn: document.querySelector("#homeAbbreviationBtn"),
  lessonBtn: document.querySelector("#lessonBtn"),
  verbMatchBtn: document.querySelector("#verbMatchBtn"),
  abbreviationBtn: document.querySelector("#abbreviationBtn"),
  gamePicker: document.querySelector("#gamePicker"),
  statusRow: document.querySelector(".status-row"),
  homeLangToggle: document.querySelector("#homeLangToggle"),
  homeLangValue: document.querySelector("#homeLangValue"),
  homeThemeToggle: document.querySelector("#homeThemeToggle"),
  homeThemeValue: document.querySelector("#homeThemeValue"),
  homeNiqqudToggle: document.querySelector("#homeNiqqudToggle"),
  homeNiqqudValue: document.querySelector("#homeNiqqudValue"),
  poolMeta: document.querySelector("#poolMeta"),
  langToggle: document.querySelector("#langToggle"),
  themeToggle: document.querySelector("#themeToggle"),
  feedbackSurveyLink: document.querySelector("#feedbackSurveyLink"),
  lessonStatus: document.querySelector("#lessonStatus"),
  lessonProgressFill: document.querySelector("#lessonProgressFill"),
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
  masterVerbBtn: document.querySelector("#masterVerbBtn"),
  resetProgress: document.querySelector("#resetProgress"),
  homeDomainPerformance: document.querySelector("#homeDomainPerformance"),
  homeModePerformance: document.querySelector("#homeModePerformance"),
  reviewDomainPerformance: document.querySelector("#reviewDomainPerformance"),
  reviewModePerformance: document.querySelector("#reviewModePerformance"),
  mostMissedList: document.querySelector("#mostMissedList"),
  mostMissedEmpty: document.querySelector("#mostMissedEmpty"),
  resultsTitle: document.querySelector("#resultsTitle"),
  resultsNote: document.querySelector("#resultsNote"),
  resultsSummary: document.querySelector("#resultsSummary"),
  resultsContinueBtn: document.querySelector("#resultsContinueBtn"),
  resultsReviewBtn: document.querySelector("#resultsReviewBtn"),
  resultsHomeBtn: document.querySelector("#resultsHomeBtn"),
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
  welcomeModal: document.querySelector("#welcomeModal"),
  welcomeModalCloseBtn: document.querySelector("#welcomeModalCloseBtn"),
  welcomeSurveyLink: document.querySelector("#welcomeSurveyLink"),
  leaveSessionConfirm: document.querySelector("#leaveSessionConfirm"),
  leaveSessionStayBtn: document.querySelector("#leaveSessionStayBtn"),
  leaveSessionConfirmBtn: document.querySelector("#leaveSessionConfirmBtn"),
  translatable: Array.from(document.querySelectorAll("[data-i18n]")),
};

const state = {
  progress: loadJson(STORAGE_KEYS.progress, {}),
  language: loadLanguagePreference(),
  theme: loadThemePreference(),
  route: restoredUi.route || "home",
  lastPlayedMode: restoredUi.lastPlayedMode || "lesson",
  mode: "home",
  currentQuestion: null,
  sessionScore: 0,
  sessionStreak: 0,
  showNiqqudInline: false,
  welcomeModalOpen: !hasSeenWelcomeModal(),
  leaveConfirmOpen: false,
  pendingLeaveRoute: "home",
  masteredModalOpen: false,
  masteredSelection: new Set(),
  summary: {
    active: false,
    game: "",
    titleKey: "",
    titleVars: {},
    scoreKey: "",
    scoreVars: {},
    noteKey: "",
    noteVars: {},
    correctCount: 0,
    incorrectCount: 0,
    elapsedSeconds: 0,
    mistakes: [],
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
    wrongAnswers: 0,
    sessionMistakeIds: [],
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
    wrongAnswers: 0,
    sessionMistakeIds: [],
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
    mismatchCount: 0,
    sessionMistakeIds: [],
  },
};

if (state.welcomeModalOpen) {
  markWelcomeModalSeen();
}

const INTRO_AUTO_ADVANCE_MS = Math.max(0, Number(global.__IVRIQUEST_TEST_CONFIG__?.introAutoAdvanceMs ?? 900));
let introAutoAdvanceTimerId = null;

if (usingFallbackVocab) {
  // Keep app usable even when vocab-data.js fails to load.
  console.warn("IvritElite: using fallback vocabulary because vocab-data.js was unavailable.");
}

if (usingFallbackAbbreviations) {
  // Keep abbreviation mode available even when abbreviation-data.js fails to load.
  console.warn("IvritElite: using fallback abbreviations because abbreviation-data.js was unavailable.");
}

sanitizeState();
restoreSessionState(restoredSession);
state.route = resolveInitialRoute(state.route, { initializing: true });
applyTheme();
applyLanguage();
bindUi();
resumeActiveTimers();
renderAll();

function bindUi() {
  el.routeButtons.forEach((button) => {
    button.addEventListener("click", () => handleRouteButtonPress(button.dataset.route || "home"));
  });
  el.homeLessonBtn?.addEventListener("click", () => openHomeLesson("lesson"));
  el.homeVerbMatchBtn?.addEventListener("click", () => openHomeLesson("verbMatch"));
  el.homeAbbreviationBtn?.addEventListener("click", () => openHomeLesson("abbreviation"));
  el.lessonBtn.addEventListener("click", () => {
    state.lastPlayedMode = "lesson";
    state.mode = "lesson";
    startLesson();
  });
  el.verbMatchBtn?.addEventListener("click", () => {
    state.lastPlayedMode = "verbMatch";
    state.mode = "verbMatch";
    startVerbMatch();
  });
  el.abbreviationBtn?.addEventListener("click", () => {
    state.lastPlayedMode = "abbreviation";
    state.mode = "abbreviation";
    startAbbreviation();
  });
  el.nextBtn.addEventListener("click", () => handleNextAction());
  el.masterVerbBtn?.addEventListener("click", () => moveEligibleVerbToMastered());
  el.homeLangToggle?.addEventListener("click", () => toggleLanguage());
  el.homeThemeToggle?.addEventListener("click", () => toggleTheme());
  el.homeNiqqudToggle?.addEventListener("click", () => toggleNiqqudPreference());
  el.langToggle?.addEventListener("click", () => toggleLanguage());
  el.themeToggle?.addEventListener("click", () => toggleTheme());
  el.resultsContinueBtn?.addEventListener("click", () => continueFromResults());
  el.resultsReviewBtn?.addEventListener("click", () => navigateTo("review"));
  el.resultsHomeBtn?.addEventListener("click", () => goHome());
  el.welcomeModalCloseBtn?.addEventListener("click", () => closeWelcomeModal());
  el.welcomeModal?.addEventListener("click", (event) => {
    if (event.target === el.welcomeModal) {
      closeWelcomeModal();
    }
  });
  el.masteredCloseBtn?.addEventListener("click", () => closeMasteredModal());
  el.masteredRestoreBtn?.addEventListener("click", () => restoreSelectedMasteredWords());
  el.masteredModal?.addEventListener("click", (event) => {
    if (event.target === el.masteredModal) {
      closeMasteredModal();
    }
  });
  global.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (state.welcomeModalOpen) {
      closeWelcomeModal();
      return;
    }
    if (state.masteredModalOpen) {
      closeMasteredModal();
    }
  });

  [el.lessonStartIntro, el.secondChanceIntro, el.verbMatchIntro, el.abbreviationIntro].forEach((overlay) => {
    overlay?.addEventListener("pointerdown", stopIntroOverlayInteraction);
    overlay?.addEventListener("click", stopIntroOverlayInteraction);
  });

  el.niqqudToggle?.addEventListener("click", () => toggleNiqqudPreference());
  el.leaveSessionStayBtn?.addEventListener("click", () => closeLeaveSessionConfirm());
  el.leaveSessionConfirmBtn?.addEventListener("click", () => confirmLeaveSession());

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

function handleRouteButtonPress(route) {
  if (state.summary.active && route === "home") {
    goHome();
    return;
  }

  if (hasActiveLearnSession()) {
    requestLeaveSession(route);
    return;
  }

  navigateTo(route);
}

function stopIntroOverlayInteraction(event) {
  event.preventDefault();
  event.stopPropagation();
}

function openHomeLesson(mode) {
  if (isModeSessionActive(mode)) {
    state.mode = mode;
    navigateTo("home");
    return;
  }

  if (mode === "verbMatch") {
    state.lastPlayedMode = "verbMatch";
    state.mode = "verbMatch";
    startVerbMatch();
    return;
  }

  if (mode === "abbreviation") {
    state.lastPlayedMode = "abbreviation";
    state.mode = "abbreviation";
    startAbbreviation();
    return;
  }

  state.lastPlayedMode = "lesson";
  state.mode = "lesson";
  startLesson();
}

function continueFromResults() {
  if (state.summary.game === "verbMatch") {
    startVerbMatch();
    return;
  }
  if (state.summary.game === "abbreviation") {
    startAbbreviation();
    return;
  }
  startLesson();
}

function hasActiveLearnSession() {
  return Boolean(
    state.lesson.active ||
      state.lesson.lessonStartIntroActive ||
      state.lesson.secondChanceIntroActive ||
      state.abbreviation.active ||
      state.abbreviation.introActive ||
      state.match.active ||
      state.match.verbIntroActive
  );
}

function isModeSessionActive(mode) {
  if (mode === "verbMatch") {
    return Boolean(state.match.active || state.match.verbIntroActive);
  }
  if (mode === "abbreviation") {
    return Boolean(state.abbreviation.active || state.abbreviation.introActive);
  }
  return Boolean(state.lesson.active || state.lesson.lessonStartIntroActive || state.lesson.secondChanceIntroActive);
}

function resolveInitialRoute(candidate, options = {}) {
  const valid = new Set(["home", "review", "settings"]);
  if (state.summary.active) {
    return valid.has(candidate) ? candidate : "home";
  }
  if (hasActiveLearnSession()) {
    return "home";
  }
  return valid.has(candidate) ? candidate : "home";
}

function navigateTo(route) {
  state.route = resolveInitialRoute(route);
  renderAll();
}

function resumeActiveTimers() {
  restorePendingOverlays();

  if (state.lesson.active && state.lesson.startMs && !state.lesson.lessonStartIntroActive && !state.lesson.secondChanceIntroActive) {
    state.lesson.elapsedSeconds = Math.max(0, Math.floor((Date.now() - state.lesson.startMs) / 1000));
    startLessonTimer();
  }
  if (state.abbreviation.active && state.abbreviation.startMs && !state.abbreviation.introActive) {
    state.abbreviation.elapsedSeconds = Math.max(0, Math.floor((Date.now() - state.abbreviation.startMs) / 1000));
    startAbbreviationTimer();
  }
  if (state.match.active && state.match.startMs && !state.match.verbIntroActive) {
    state.match.elapsedSeconds = Math.max(0, Math.floor((Date.now() - state.match.startMs) / 1000));
    startVerbMatchTimer();
  }

  updateUiLockState();
}

function restorePendingOverlays() {
  if (state.lesson.secondChanceIntroActive) {
    playSecondChanceIntro();
  } else if (state.lesson.lessonStartIntroActive) {
    playLessonStartIntro();
  } else if (state.abbreviation.introActive) {
    playAbbreviationIntro();
  } else if (state.match.verbIntroActive) {
    playVerbMatchIntro();
  }
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

function clearIntroAutoAdvance() {
  if (!introAutoAdvanceTimerId) return;
  global.clearTimeout(introAutoAdvanceTimerId);
  introAutoAdvanceTimerId = null;
}

function scheduleIntroAutoAdvance(action) {
  clearIntroAutoAdvance();
  if (typeof action !== "function") return;

  introAutoAdvanceTimerId = global.setTimeout(() => {
    introAutoAdvanceTimerId = null;
    action();
  }, INTRO_AUTO_ADVANCE_MS);
}

function isUiLocked() {
  return Boolean(
    state.welcomeModalOpen ||
      state.lesson.lessonStartIntroActive ||
      state.lesson.secondChanceIntroActive ||
      state.abbreviation.introActive ||
      state.match.verbIntroActive ||
      state.leaveConfirmOpen ||
      state.masteredModalOpen
  );
}

function updateUiLockState() {
  const locked = isUiLocked();
  const learnSessionActive = hasActiveLearnSession();
  global.document.body?.setAttribute("data-ui-locked", locked ? "true" : "false");
  global.document.body?.setAttribute("data-learn-session", learnSessionActive ? "true" : "false");

  el.routeButtons.forEach((button) => {
    const route = button.dataset.route || "home";
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

  if (!el.appShell) return;
  if (locked) {
    el.appShell.setAttribute("inert", "");
  } else {
    el.appShell.removeAttribute("inert");
  }
}

function showBlockingOverlay(node) {
  if (!node) {
    updateUiLockState();
    return;
  }
  node.classList.remove("hidden");
  node.classList.add("active");
  node.setAttribute("aria-hidden", "false");
  updateUiLockState();
}

function hideBlockingOverlay(node) {
  if (!node) {
    updateUiLockState();
    return;
  }
  node.classList.remove("active");
  node.classList.add("hidden");
  node.setAttribute("aria-hidden", "true");
  updateUiLockState();
}

function getVisibleVerbMatchRows() {
  const viewportWidth = Number(global.innerWidth || 0);
  if (viewportWidth > 0 && viewportWidth <= 767) {
    return 5;
  }
  return MATCH_VISIBLE_ROWS;
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
    const toggleLabel = getLanguageToggleLabel();
    el.langToggle.textContent = toggleLabel;
    el.langToggle.setAttribute("aria-label", toggleLabel);
  }

  if (el.welcomeModalCloseBtn) {
    el.welcomeModalCloseBtn.setAttribute("aria-label", t("welcome.closeAria"));
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
  renderAll();
}

function toggleNiqqudPreference() {
  state.showNiqqudInline = !state.showNiqqudInline;
  renderAll();
}

function getLocaleBundle() {
  return I18N[state.language] || I18N.en;
}

function getLanguageToggleLabel() {
  return state.language === "en" ? "עברית" : "English";
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
  state.route = resolveInitialRoute(state.route);
  renderShellChrome();
  renderPoolMeta();
  renderDomainPerformance();
  renderMostMissed();
  renderMasteredModal();
  renderHomeState();
  renderReviewState();
  renderSettingsState();
  renderWelcomeModal();
  renderSummaryState();
  renderLearnState();
  renderRouteVisibility();
  updateUiLockState();
  persistUiState();
  persistSessionState();
}

function renderRouteVisibility() {
  el.homeView?.classList.toggle("active", state.route === "home");
  el.reviewView?.classList.toggle("active", state.route === "review");
  el.settingsView?.classList.toggle("active", state.route === "settings");
}

function renderShellChrome() {
  const routeKey = `nav.${state.route}`;
  if (el.shellRouteChip) {
    el.shellRouteChip.textContent = t(routeKey);
  }
  if (el.shellRouteSummary) {
    if (state.summary.active && state.route === "home") {
      el.shellRouteSummary.textContent = t("summary.thumbsText");
    } else if (state.route === "home") {
      el.shellRouteSummary.textContent = hasActiveLearnSession() ? t("dashboard.active") : t("dashboard.ready");
    } else {
      el.shellRouteSummary.textContent = t(routeKey);
    }
  }

  el.routeButtons.forEach((button) => {
    const buttonRoute = button.dataset.route || "home";
    button.classList.toggle("active", buttonRoute === state.route);
  });
}

function renderLearnState() {
  if (state.summary.active) {
    return;
  }

  if (state.mode === "verbMatch") {
    if (state.match.active && state.match.currentVerb) {
      renderVerbMatchRound();
    } else {
      renderVerbMatchIdleState();
    }
    return;
  }

  if (state.mode === "abbreviation") {
    if (state.abbreviation.active && state.abbreviation.currentQuestion) {
      renderAbbreviationQuestion();
    } else {
      renderAbbreviationIdleState();
    }
    return;
  }

  if (state.lesson.active || state.mode === "lesson") {
    if (state.lesson.active && state.currentQuestion) {
      renderQuestion();
    } else {
      renderIdleLessonState();
    }
    return;
  }

  renderIdleLessonState();
}

function renderSessionHeader() {
  if (el.sessionScore) {
    el.sessionScore.textContent = t("session.score", { score: state.sessionScore });
  }
  el.statusRow?.classList.toggle("hidden", false);
  el.vocabCount.textContent = "";
  el.vocabCount.classList.add("hidden");
  el.masterVerbBtn?.classList.add("hidden");
  updateLessonProgress(0);

  if (state.mode === "summary" && state.summary.active) {
    el.modeTitle.textContent = t(state.summary.titleKey || "summary.resultsHeader", state.summary.titleVars);
    el.lessonStatus.textContent = "";
    el.sessionScore.textContent = "";
    el.nextBtn.classList.add("hidden");
    persistSessionState();
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
    updateLessonProgress(state.match.totalPairs ? Math.round((state.match.matchedCount / state.match.totalPairs) * 100) : 0);

    const canAdvanceVerb = state.match.active && state.match.totalPairs > 0 && state.match.matchedCount >= state.match.totalPairs;
    const shouldShowSummary = canAdvanceVerb && state.match.verbQueue.length === 0;
    el.nextBtn.disabled = !canAdvanceVerb;
    el.nextBtn.textContent = shouldShowSummary ? t("session.viewResults") : t("session.nextVerb");
    el.nextBtn.classList.toggle("hidden", !canAdvanceVerb);
    const showMasterAction =
      canAdvanceVerb &&
      Boolean(state.match.eligibleMasterWordId) &&
      isWordAvailableForMode(getWordById(state.match.eligibleMasterWordId), "translationQuiz") &&
      !isWordMastered(state.match.eligibleMasterWordId);
    if (el.masterVerbBtn) {
      el.masterVerbBtn.disabled = !showMasterAction;
      el.masterVerbBtn.textContent = t("mastered.moveCurrent");
      el.masterVerbBtn.classList.toggle("hidden", !showMasterAction);
    }
    persistSessionState();
    return;
  }

  if (state.mode === "abbreviation") {
    const targetRounds = getAbbreviationRoundTarget() || ABBREVIATION_ROUNDS;
    const hasQuestion = state.abbreviation.active && Boolean(state.abbreviation.currentQuestion);
    el.modeTitle.textContent = state.abbreviation.active ? t("session.abbreviationTitle") : t("session.abbreviationStart");
    el.lessonStatus.textContent = t("session.round", {
      current: state.abbreviation.currentRound,
      total: targetRounds,
    });
    el.vocabCount.classList.remove("hidden");
    el.vocabCount.textContent = t("session.timer", { seconds: state.abbreviation.elapsedSeconds });
    updateLessonProgress(targetRounds ? Math.round((state.abbreviation.currentRound / targetRounds) * 100) : 0);
    el.nextBtn.disabled = questionNeedsSelection(state.abbreviation.currentQuestion);
    el.nextBtn.textContent = hasQuestion && !state.abbreviation.currentQuestion?.locked ? t("session.submit") : t("session.next");
    el.nextBtn.classList.toggle("hidden", !hasQuestion);
    persistSessionState();
    return;
  }

  const inSecondChance = Boolean(state.lesson.inReview);
  const hasQuestion = state.lesson.active && Boolean(state.currentQuestion);
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
  updateLessonProgress(inSecondChance ? 100 : Math.round((state.lesson.currentRound / LESSON_ROUNDS) * 100));
  el.nextBtn.disabled = questionNeedsSelection(state.currentQuestion);
  el.nextBtn.textContent = hasQuestion && !state.currentQuestion?.locked ? t("session.submit") : t("session.next");
  el.nextBtn.classList.toggle("hidden", !hasQuestion);
  persistSessionState();
}

function questionNeedsSelection(question) {
  if (!question) return true;
  if (question.locked) return false;
  return !question.selectedOptionId;
}

function updateLessonProgress(percent) {
  if (!el.lessonProgressFill) return;
  el.lessonProgressFill.style.width = `${Math.max(0, Math.min(100, percent || 0))}%`;
}

function getMostMissedRanked() {
  const wordsById = new Map(getVocabularyForMode("translationQuiz", { includeMastered: true }).map((word) => [word.id, word]));
  return Object.entries(state.progress)
    .map(([wordId, rec]) => {
      const missed = getMissCountForRecord(rec);
      return { wordId, missed };
    })
    .filter((item) => item.missed > 0 && wordsById.has(item.wordId))
    .sort((a, b) => {
      if (b.missed !== a.missed) return b.missed - a.missed;
      const aWord = wordsById.get(a.wordId);
      const bWord = wordsById.get(b.wordId);
      return String(aWord?.en || "").localeCompare(String(bWord?.en || ""));
    })
    .slice(0, 10);
}

function buildLessonMistakeSummary() {
  const lookup = new Map(getVocabularyForMode("translationQuiz", { includeMastered: true }).map((word) => [word.id, word]));
  return state.lesson.sessionMistakeIds
    .map((wordId) => lookup.get(wordId))
    .filter(Boolean)
    .map((word) => ({
      primary: getHebrewText(word, true),
      secondary: word.en,
    }));
}

function buildAbbreviationMistakeSummary() {
  const lookup = new Map(abbreviationDeck.map((entry) => [entry.id, entry]));
  return state.abbreviation.sessionMistakeIds
    .map((entryId) => lookup.get(entryId))
    .filter(Boolean)
    .map((entry) => ({
      primary: entry.abbr,
      secondary: `${entry.english} | ${entry.expansionHe}`,
    }));
}

function buildVerbMatchMistakeSummary() {
  const lookup = new Map(getAllVocabulary().map((word) => [word.id, word]));
  return state.match.sessionMistakeIds
    .map((wordId) => lookup.get(wordId))
    .filter(Boolean)
    .map((word) => ({
      primary: getHebrewText(word, true),
      secondary: word.en,
    }));
}

function renderPoolMeta() {
  const pool = getSelectedPool();
  const all = getAllVocabulary();
  if (!el.poolMeta) return;
  el.poolMeta.textContent = t("pool.summary", { pool: pool.length, total: all.length });

  if (!storage) {
    el.poolMeta.textContent += ` ${t("pool.tempProgress")}`;
  }

  if (usingFallbackVocab) {
    el.poolMeta.textContent += ` ${t("pool.fallback")}`;
  }
}

function renderDomainPerformance() {
  const stats = calculateDomainStats();
  renderPerformanceCardsInto(el.homeDomainPerformance, stats);
  renderPerformanceCardsInto(el.reviewDomainPerformance, stats);
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
  const stats = calculateGameModeStats();
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

  renderPerformanceCardsInto(el.homeModePerformance, cards);
  renderPerformanceCardsInto(el.reviewModePerformance, cards);
}

function renderPerformanceCardsInto(container, cards) {
  if (!container) return;
  container.innerHTML = "";
  cards.forEach((card) => {
    appendPerformanceCard(container, {
      emoji: card.emoji,
      title: card.title || t(`domain.${card.id}`),
      attempts: card.attempts,
      correct: card.correct,
      wrong: card.wrong,
    });
  });
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
  state.summary.correctCount = 0;
  state.summary.incorrectCount = 0;
  state.summary.elapsedSeconds = 0;
  state.summary.mistakes = [];
}

function openLeaveSessionConfirm(targetRoute = "home") {
  state.pendingLeaveRoute = targetRoute;
  state.leaveConfirmOpen = true;
  showBlockingOverlay(el.leaveSessionConfirm);
}

function closeLeaveSessionConfirm(options = {}) {
  state.leaveConfirmOpen = false;
  if (!options.preservePending) {
    state.pendingLeaveRoute = "home";
  }
  hideBlockingOverlay(el.leaveSessionConfirm);
}

function confirmLeaveSession() {
  const targetRoute = state.pendingLeaveRoute || "home";
  closeLeaveSessionConfirm({ preservePending: true });
  endSessionAndNavigate(targetRoute);
  state.pendingLeaveRoute = "home";
}

function requestLeaveSession(targetRoute = "home") {
  if (!hasActiveLearnSession()) {
    endSessionAndNavigate(targetRoute);
    return;
  }
  openLeaveSessionConfirm(targetRoute);
}

function requestGoHome() {
  requestLeaveSession("home");
}

function endSessionAndNavigate(targetRoute = "home") {
  stopVerbMatchTimer();
  stopLessonTimer();
  stopAbbreviationTimer();
  closeLeaveSessionConfirm();
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
  clearSummaryState();
  state.mode = "home";
  state.route = targetRoute === "review" || targetRoute === "settings" ? targetRoute : "home";
  clearFeedback();
  clearPersistedSession();
  renderAll();
}

function goHome() {
  endSessionAndNavigate("home");
}

function renderHomeState() {
  const showLesson = hasActiveLearnSession();
  const showSummary = Boolean(state.summary.active && state.route === "home");
  el.homeDashboard?.classList.toggle("hidden", showLesson || showSummary);
  el.homeLessonStage?.classList.toggle("hidden", !showLesson);
  el.homeResultsStage?.classList.toggle("hidden", !showSummary);
  renderHomeLessonButtons();
  renderHomeOptions();
}

function showSessionSummary(config = {}) {
  stopVerbMatchTimer();
  stopLessonTimer();
  stopAbbreviationTimer();
  closeLeaveSessionConfirm();
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
  state.mode = "summary";
  state.summary.active = true;
  state.summary.game = String(config.game || "");
  state.summary.titleKey = String(config.titleKey || "");
  state.summary.titleVars = config.titleVars || {};
  state.summary.scoreKey = String(config.scoreKey || "");
  state.summary.scoreVars = config.scoreVars || {};
  state.summary.noteKey = String(config.noteKey || "");
  state.summary.noteVars = config.noteVars || {};
  state.summary.correctCount = Math.max(0, Number(config.correctCount || 0));
  state.summary.incorrectCount = Math.max(0, Number(config.incorrectCount || 0));
  state.summary.elapsedSeconds = Math.max(0, Number(config.elapsedSeconds || 0));
  state.summary.mistakes = Array.isArray(config.mistakes) ? config.mistakes : [];
  state.route = "home";
  clearFeedback();
  renderAll();
}

function renderSummaryState() {
  if (!el.resultsSummary || !el.resultsTitle || !el.resultsNote) return;
  const titleText = state.summary.titleKey ? t(state.summary.titleKey, state.summary.titleVars) : t("summary.resultsHeader");
  const scoreValue = getSummaryScoreValue();
  const scoreTotal = getSummaryScoreTotal();
  const accuracy = getSummaryAccuracyPercent();
  const praise = isPerfectSummary() ? t("results.amazing") : t("results.niceJob");

  el.resultsTitle.textContent = titleText;
  el.resultsNote.textContent = praise;
  el.resultsSummary.innerHTML = "";

  const performance = createResultsPerformanceGraphic(accuracy);

  const metrics = document.createElement("div");
  metrics.className = "results-metrics";
  const metricItems = buildSummaryMetrics({ scoreValue, scoreTotal, accuracy });
  metrics.style.setProperty("--results-metric-count", String(metricItems.length));
  metricItems.forEach((metric) => {
    metrics.append(createResultsMetric(metric.label, metric.value));
  });

  const mistakesWrap = document.createElement("div");
  mistakesWrap.className = "results-mistakes";
  const heading = document.createElement("h3");
  heading.className = "results-section-title";
  heading.textContent = t("results.mistakes");
  mistakesWrap.append(heading);

  if (!state.summary.mistakes.length) {
    const empty = document.createElement("p");
    empty.className = "small-note";
    empty.textContent = t("results.noMistakes");
    mistakesWrap.append(empty);
  } else {
    state.summary.mistakes.forEach((item) => {
      mistakesWrap.append(
        createCompactRow({
          title: item.primary || item.title || "",
          note: item.secondary || item.note || "",
        })
      );
    });
  }

  el.resultsSummary.append(performance, metrics, mistakesWrap);
}

function renderReviewState() {
}

function getSummaryScoreValue() {
  const explicit = Number(state.summary.scoreVars?.score);
  if (Number.isFinite(explicit) && explicit >= 0) {
    return Math.round(explicit);
  }
  return Math.max(0, state.summary.correctCount);
}

function getSummaryScoreTotal() {
  const explicit = Number(state.summary.scoreVars?.total);
  if (Number.isFinite(explicit) && explicit >= 0) {
    return Math.round(explicit);
  }
  const attempts = state.summary.correctCount + state.summary.incorrectCount;
  return Math.max(0, attempts);
}

function getSummaryAccuracyPercent() {
  const attempts = state.summary.correctCount + state.summary.incorrectCount;
  if (attempts > 0) {
    return Math.round((state.summary.correctCount / attempts) * 100);
  }
  const total = getSummaryScoreTotal();
  if (total > 0) {
    return Math.round((getSummaryScoreValue() / total) * 100);
  }
  return 100;
}

function isPerfectSummary() {
  return state.summary.incorrectCount === 0 && getSummaryScoreTotal() > 0 && getSummaryScoreValue() >= getSummaryScoreTotal();
}

function formatResultSeconds(seconds) {
  const safeSeconds = Math.max(0, Number(seconds || 0));
  return state.language === "he" ? `${safeSeconds}ש׳` : `${safeSeconds}s`;
}

function buildSummaryMetrics({ scoreValue, scoreTotal, accuracy }) {
  const metrics = [
    { label: t("results.score"), value: `${scoreValue}/${scoreTotal}` },
    { label: t("results.accuracy"), value: `${accuracy}%` },
    { label: t("results.time"), value: formatResultSeconds(state.summary.elapsedSeconds) },
  ];

  if (state.summary.game === "lesson") {
    metrics.push({
      label: t("results.reviewRounds"),
      value: String(Math.max(0, Number(state.summary.noteVars?.count || 0))),
    });
    return metrics;
  }

  if (state.summary.game === "abbreviation") {
    metrics.push({
      label: t("results.rounds"),
      value: String(Math.max(0, Number(state.summary.noteVars?.rounds || 0))),
    });
    return metrics;
  }

  if (state.summary.game === "verbMatch") {
    metrics.push({
      label: t("results.verbs"),
      value: String(Math.max(0, Number(state.summary.noteVars?.verbs || 0))),
    });
    metrics.push({
      label: t("results.bestCombo"),
      value: `x${Math.max(0, Number(state.summary.noteVars?.combo || 0))}`,
    });
  }

  return metrics;
}

function createResultsPerformanceGraphic(accuracy) {
  const performance = document.createElement("section");
  performance.className = "results-performance";
  performance.style.setProperty("--results-score", `${Math.max(0, Math.min(100, accuracy))}%`);
  performance.setAttribute("role", "img");
  performance.setAttribute("aria-label", `${t("results.accuracy")}: ${accuracy}%`);

  const ring = document.createElement("div");
  ring.className = "results-performance-ring";

  const center = document.createElement("div");
  center.className = "results-performance-center";

  const percent = document.createElement("p");
  percent.className = "results-performance-percent";
  percent.textContent = `${accuracy}%`;

  center.append(percent);
  ring.append(center);
  performance.append(ring);
  return performance;
}

function renderSettingsState() {
  applySurveyLinks();
  renderThemeToggle();
  renderNiqqudToggle();
}

function createCompactRow({ title, note }) {
  const row = document.createElement("article");
  row.className = "compact-row";

  const titleNode = document.createElement("p");
  titleNode.className = "compact-row-title";
  titleNode.textContent = title;

  const noteNode = document.createElement("p");
  noteNode.className = "compact-row-note";
  noteNode.textContent = note;

  row.append(titleNode, noteNode);
  return row;
}

function createResultsMetric(label, value) {
  const card = document.createElement("article");
  card.className = "results-metric";

  const labelNode = document.createElement("p");
  labelNode.className = "results-metric-label";
  labelNode.textContent = label;

  const valueNode = document.createElement("p");
  valueNode.className = "results-metric-value";
  valueNode.textContent = value;

  card.append(labelNode, valueNode);
  return card;
}

function renderIdleLessonState() {
  state.mode = hasActiveLearnSession() ? state.mode : "lesson";
  setGamePickerVisibility(false);
  setPromptCardVisibility(true);
  el.choiceContainer.classList.remove("summary-grid");
  renderSessionHeader();
  el.promptLabel.textContent = t("learn.idleLabel");
  el.promptText.classList.remove("hebrew");
  el.promptText.textContent = t("learn.idlePrompt");
  el.choiceContainer.innerHTML = "";
  el.choiceContainer.classList.remove("match-grid");
  clearFeedback();
  renderNiqqudToggle();
}

function getModeLabelForState(mode) {
  if (mode === "verbMatch") return t("game.conjugationName");
  if (mode === "abbreviation") return t("game.abbreviationName");
  return t("game.translationName");
}

function renderHomeLessonButtons() {
  const highlightedMode = hasActiveLearnSession() ? state.mode : state.lastPlayedMode || "lesson";
  setHomeLessonState(el.homeLessonBtn, highlightedMode === "lesson");
  setHomeLessonState(el.homeVerbMatchBtn, highlightedMode === "verbMatch");
  setHomeLessonState(el.homeAbbreviationBtn, highlightedMode === "abbreviation");
}

function setHomeLessonState(button, isCurrent) {
  if (!button) return;
  button.classList.toggle("is-current", isCurrent);
  button.setAttribute("aria-current", isCurrent ? "true" : "false");
}

function renderHomeOptions() {
  if (el.homeLangValue) {
    el.homeLangValue.textContent = getLanguageToggleLabel();
  }
  if (el.homeThemeValue) {
    el.homeThemeValue.textContent = state.theme === "light" ? t("controls.lightMode") : t("controls.darkMode");
  }
  if (el.homeNiqqudValue) {
    el.homeNiqqudValue.textContent = state.showNiqqudInline ? t("dashboard.on") : t("dashboard.off");
  }
  if (el.homeThemeToggle) {
    el.homeThemeToggle.setAttribute("aria-pressed", String(state.theme === "dark"));
  }
  if (el.homeNiqqudToggle) {
    el.homeNiqqudToggle.setAttribute("aria-pressed", String(state.showNiqqudInline));
  }
}

function startLesson() {
  stopVerbMatchTimer();
  stopLessonTimer();
  stopAbbreviationTimer();
  closeLeaveSessionConfirm();
  closeMasteredModal();
  resetVerbMatchState();
  resetAbbreviationState();
  state.mode = "lesson";
  state.route = "home";
  state.lastPlayedMode = "lesson";
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
  state.lesson.wrongAnswers = 0;
  state.lesson.sessionMistakeIds = [];
  state.lesson.startMs = 0;
  state.lesson.elapsedSeconds = 0;
  state.lesson.askedWordIds = [];
  state.lesson.domainCounts = {};
  state.currentQuestion = null;
  el.choiceContainer.innerHTML = "";
  el.choiceContainer.classList.remove("match-grid");
  clearFeedback();
  playLessonStartIntro();
  renderAll();
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
    correctCount: Math.max(0, LESSON_ROUNDS + reviewRounds - state.lesson.wrongAnswers),
    incorrectCount: state.lesson.wrongAnswers,
    elapsedSeconds: state.lesson.elapsedSeconds,
    mistakes: buildLessonMistakeSummary(),
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
  closeLeaveSessionConfirm();
  closeMasteredModal();
  clearLessonStartIntro();
  clearSecondChanceIntro();
  clearVerbMatchIntro();
  clearAbbreviationIntro();
  clearSummaryState();
  state.lesson.active = false;
  state.lesson.inReview = false;
  state.currentQuestion = null;
  resetSessionCounters();
  resetVerbMatchState();
  resetAbbreviationState();
  state.mode = "abbreviation";
  state.route = "home";
  state.lastPlayedMode = "abbreviation";
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
  playAbbreviationIntro();
  renderAll();
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
    correctCount: Math.max(0, (roundsDone || targetRounds) - state.abbreviation.wrongAnswers),
    incorrectCount: state.abbreviation.wrongAnswers,
    elapsedSeconds: elapsed,
    mistakes: buildAbbreviationMistakeSummary(),
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
  state.abbreviation.wrongAnswers = 0;
  state.abbreviation.sessionMistakeIds = [];
}

function clearAbbreviationIntro() {
  state.abbreviation.introActive = false;
  clearIntroAutoAdvance();
  hideBlockingOverlay(el.abbreviationIntro);
}

function playAbbreviationIntro() {
  if (!el.abbreviationIntro) {
    beginAbbreviationFromIntro();
    return;
  }

  clearAbbreviationIntro();
  state.abbreviation.introActive = true;
  showBlockingOverlay(el.abbreviationIntro);
  scheduleIntroAutoAdvance(() => beginAbbreviationFromIntro());
}

function beginAbbreviationFromIntro() {
  if (!state.abbreviation.active) return;
  if (!state.abbreviation.introActive && state.abbreviation.currentQuestion) return;
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
  clearFeedback();
  renderAbbreviationQuestion();
}

function renderAbbreviationQuestion() {
  const question = state.abbreviation.currentQuestion;

  setGamePickerVisibility(false);
  setPromptCardVisibility(true);
  el.choiceContainer.classList.remove("summary-grid");
  renderSessionHeader();
  el.choiceContainer.classList.remove("match-grid");

  if (!question) return;

  el.promptLabel.textContent = question.promptLabel;
  el.promptText.classList.add("hebrew");
  el.promptText.textContent = question.prompt;
  renderAbbreviationChoices(question);
  renderNiqqudToggle();
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
      question.selectedOptionId = option.id;
      renderAbbreviationQuestion();
    });
    btn.classList.toggle("selected", question.selectedOptionId === option.id && !question.locked);
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
  } else {
    state.abbreviation.wrongAnswers += 1;
    if (!state.abbreviation.sessionMistakeIds.includes(entry.id)) {
      state.abbreviation.sessionMistakeIds.push(entry.id);
    }
  }

  const expansion = `${entry.expansionHe} (${entry.abbr})`;
  setFeedback(
    isCorrect
      ? t("feedback.abbreviationCorrect", { english: entry.english, expansion })
      : t("feedback.abbreviationWrong", { english: entry.english, expansion }),
    isCorrect
  );

  question.selectedOptionId = selectedId ?? null;
  markAbbreviationChoiceResults(question);

  saveProgress();
  renderSessionHeader();
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
  clearIntroAutoAdvance();
  hideBlockingOverlay(el.lessonStartIntro);
}

function playLessonStartIntro() {
  if (!el.lessonStartIntro) {
    beginLessonFromIntro();
    return;
  }

  clearLessonStartIntro();
  state.lesson.lessonStartIntroActive = true;
  showBlockingOverlay(el.lessonStartIntro);
  scheduleIntroAutoAdvance(() => beginLessonFromIntro());
}

function beginLessonFromIntro() {
  if (!state.lesson.active) return;
  if (!state.lesson.lessonStartIntroActive && state.currentQuestion) return;
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
  clearIntroAutoAdvance();
  hideBlockingOverlay(el.secondChanceIntro);
}

function playSecondChanceIntro() {
  if (!el.secondChanceIntro) {
    nextQuestion();
    return;
  }

  clearSecondChanceIntro();
  state.lesson.secondChanceIntroActive = true;
  showBlockingOverlay(el.secondChanceIntro);
  scheduleIntroAutoAdvance(() => beginSecondChanceFromIntro());
}

function beginSecondChanceFromIntro() {
  if (!state.lesson.active || !state.lesson.secondChanceIntroActive) return;
  clearSecondChanceIntro();
  nextQuestion();
}

function clearVerbMatchIntro() {
  state.match.verbIntroActive = false;
  clearIntroAutoAdvance();
  hideBlockingOverlay(el.verbMatchIntro);
}

function playVerbMatchIntro() {
  if (!el.verbMatchIntro) {
    beginVerbMatchFromIntro();
    return;
  }

  clearVerbMatchIntro();
  state.match.verbIntroActive = true;
  showBlockingOverlay(el.verbMatchIntro);
  scheduleIntroAutoAdvance(() => beginVerbMatchFromIntro());
}

function beginVerbMatchFromIntro() {
  if (!state.match.active) return;
  if (!state.match.verbIntroActive && state.match.currentVerb) return;
  if (state.match.verbIntroActive) {
    clearVerbMatchIntro();
  }

  if (!state.match.startMs) {
    state.match.startMs = Date.now();
    state.match.elapsedSeconds = 0;
    startVerbMatchTimer();
  }
  clearFeedback();
  loadNextVerbRound();
}

function nextQuestion() {
  if (state.mode !== "lesson") return;
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
  clearFeedback();
  renderQuestion();
}

function renderQuestion() {
  const question = state.currentQuestion;

  setGamePickerVisibility(false);
  setPromptCardVisibility(true);
  el.choiceContainer.classList.remove("summary-grid");
  renderSessionHeader();
  el.choiceContainer.classList.remove("match-grid");

  if (!question) return;

  el.promptLabel.textContent = question.promptLabel;
  renderPromptText(question);
  renderChoices(question);
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
      question.selectedOptionId = option.id;
      renderQuestion();
    });
    btn.classList.toggle("selected", question.selectedOptionId === option.id && !question.locked);

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

  if (isCorrect) {
    if (!state.currentQuestion.isReview) {
      state.sessionScore += 1;
    }
  } else {
    state.lesson.wrongAnswers += 1;
    if (!state.lesson.sessionMistakeIds.includes(word.id)) {
      state.lesson.sessionMistakeIds.push(word.id);
    }
  }

  if (!isCorrect && !state.currentQuestion.isReview) {
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
  markChoiceResults();

  saveProgress();
  renderSessionHeader();
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

function cloneLessonQuestionSnapshot(question) {
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
}

function cloneAbbreviationQuestionSnapshot(question) {
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
}

function handleNextAction() {
  if (state.mode === "home" || state.mode === "summary") {
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
      return;
    }
    if (state.abbreviation.currentQuestion.selectedOptionId) {
      applyAbbreviationAnswer(
        state.abbreviation.currentQuestion.selectedOptionId === state.abbreviation.currentQuestion.entry.id,
        state.abbreviation.currentQuestion.selectedOptionId
      );
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

  if (state.currentQuestion.selectedOptionId) {
    applyAnswer(state.currentQuestion.selectedOptionId === state.currentQuestion.word.id, state.currentQuestion.selectedOptionId);
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
  const ranked = getMostMissedRanked();

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

function closeMasteredModal() {
  state.masteredModalOpen = false;
  state.masteredSelection = new Set();
  renderMasteredModal();
}

function closeWelcomeModal() {
  if (!state.welcomeModalOpen) return;
  state.welcomeModalOpen = false;
  renderWelcomeModal();
}

function renderWelcomeModal() {
  if (!el.welcomeModal) return;
  applySurveyLinks();
  const open = Boolean(state.welcomeModalOpen);
  el.welcomeModal.classList.toggle("hidden", !open);
  el.welcomeModal.setAttribute("aria-hidden", open ? "false" : "true");
  updateUiLockState();
}

function renderMasteredModal() {
  if (!el.masteredModal || !el.masteredList || !el.masteredEmpty || !el.masteredRestoreBtn) return;

  const open = Boolean(state.masteredModalOpen);
  el.masteredModal.classList.toggle("hidden", !open);
  el.masteredModal.setAttribute("aria-hidden", open ? "false" : "true");
  updateUiLockState();
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
  if (!isWordAvailableForMode(word, "translationQuiz")) return;
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
  closeLeaveSessionConfirm();
  closeMasteredModal();
  clearLessonStartIntro();
  clearSecondChanceIntro();
  clearVerbMatchIntro();
  clearAbbreviationIntro();
  clearSummaryState();
  state.lesson.active = false;
  state.lesson.inReview = false;
  state.currentQuestion = null;
  resetSessionCounters();
  resetVerbMatchState();
  resetAbbreviationState();
  state.mode = "verbMatch";
  state.route = "home";
  state.lastPlayedMode = "verbMatch";
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
  state.match.startMs = 0;
  state.match.elapsedSeconds = 0;
  state.match.sessionMatched = 0;
  state.match.sessionTotalPairs = state.match.verbQueue.reduce(
    (sum, item) => sum + selectVerbRoundPairs(item.forms).length,
    0
  );
  clearFeedback();
  playVerbMatchIntro();
  renderAll();
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
  state.match.mismatchCount = 0;
  state.match.sessionMistakeIds = [];
}

function finishVerbMatchSession() {
  const verbsCovered = state.match.totalVerbs;
  const sessionMatched = state.match.sessionMatched;
  const sessionTotal = state.match.sessionTotalPairs || sessionMatched;
  const bestCombo = state.match.bestCombo;
  const elapsed = state.match.elapsedSeconds;
  const mismatchCount = state.match.mismatchCount;
  const mistakes = buildVerbMatchMistakeSummary();

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
    correctCount: sessionMatched,
    incorrectCount: mismatchCount,
    elapsedSeconds: elapsed,
    mistakes,
  });
}

function loadNextVerbRound() {
  if (!state.match.active) return;
  const nextVerb = state.match.verbQueue.shift();

  if (!nextVerb) {
    finishVerbMatchSession();
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
  clearFeedback();
  renderVerbMatchRound();
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
  const visibleRows = getVisibleVerbMatchRows();

  while (state.match.leftCards.length < visibleRows && state.match.remainingPairs.length) {
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
      const streakCount = recordConjugationRound(current.id, !state.match.currentVerbHadMismatch);
      const reachedMasterThreshold = streakCount >= CONJUGATION_MASTER_STREAK && !isWordMastered(current.id);
      state.match.eligibleMasterWordId = reachedMasterThreshold ? current.id : "";
      const hasMoreVerbs = state.match.verbQueue.length > 0;
      if (hasMoreVerbs) {
        setFeedback(t("feedback.matchDoneVerb", { verb: current.en }), true);
      } else {
        finishVerbMatchSession();
        return;
      }
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
  state.match.mismatchCount += 1;
  if (currentWordId && !state.match.sessionMistakeIds.includes(currentWordId)) {
    state.match.sessionMistakeIds.push(currentWordId);
  }
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
  const now = Date.now();
  rec.attempts += 1;
  rec.lastSeen = now;

  if (isCorrect) {
    rec.correct += 1;
    rec.level = Math.min(LEITNER_INTERVALS.length - 1, rec.level + 1);
    rec.nextDue = now + LEITNER_INTERVALS[rec.level];
  } else {
    rec.misses = getMissCountForRecord(rec) + 1;
    rec.level = Math.max(0, rec.level - 1);
    rec.nextDue = now + 2 * 60 * 1000;
  }

  state.progress[wordId] = rec;
}

function getProgressRecord(wordId) {
  const existing = state.progress[wordId] || {};
  const attempts = Math.max(0, Number(existing.attempts || 0));
  const correct = Math.max(0, Math.min(attempts, Number(existing.correct || 0)));
  return {
    attempts: 0,
    correct: 0,
    level: 0,
    nextDue: 0,
    lastSeen: 0,
    mastered: false,
    misses: 0,
    conjugationAttempts: 0,
    conjugationCorrect: 0,
    conjugationStreak: 0,
    lastConjugationSeen: 0,
    ...existing,
    attempts,
    correct,
    misses: getMissCountForRecord(existing),
  };
}

function getMissCountForRecord(record) {
  const attempts = Math.max(0, Number(record?.attempts || 0));
  const correct = Math.max(0, Math.min(attempts, Number(record?.correct || 0)));
  const explicit = Number(record?.misses);
  if (Number.isFinite(explicit) && explicit >= 0) {
    return Math.round(explicit);
  }
  return Math.max(0, attempts - correct);
}

function getDueWords(pool, now = Date.now()) {
  return pool.filter((word) => {
    const rec = getProgressRecord(word.id);
    return rec.attempts === 0 || rec.nextDue <= now;
  });
}

function normalizeVocabularyAvailability(availability) {
  return {
    translationQuiz: availability?.translationQuiz !== false,
    sentenceHints: availability?.sentenceHints !== false,
  };
}

function isWordAvailableForMode(word, mode) {
  if (!word || !mode) return false;
  const availability = normalizeVocabularyAvailability(word.availability || VOCABULARY_AVAILABILITY_DEFAULTS);
  return availability[mode] !== false;
}

function getVocabularyForMode(mode, options = {}) {
  return getAllVocabulary().filter((word) => {
    if (!isWordAvailableForMode(word, mode)) return false;
    if (options.includeMastered) return true;
    return !isWordMastered(word.id);
  });
}

function getSelectedPool() {
  const all = getVocabularyForMode("translationQuiz");

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
  return getVocabularyForMode("translationQuiz", { includeMastered: true }).filter((word) => isWordMastered(word.id));
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

function restoreSessionState(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return;

  state.mode = typeof snapshot.mode === "string" ? snapshot.mode : state.mode;
  state.route = typeof snapshot.route === "string" ? snapshot.route : state.route;
  state.lastPlayedMode = typeof snapshot.lastPlayedMode === "string" ? snapshot.lastPlayedMode : state.lastPlayedMode;
  state.sessionScore = Math.max(0, Number(snapshot.sessionScore || 0));
  state.sessionStreak = Math.max(0, Number(snapshot.sessionStreak || 0));
  state.showNiqqudInline = Boolean(snapshot.showNiqqudInline);

  if (snapshot.currentQuestion) {
    state.currentQuestion = cloneLessonQuestionSnapshot(snapshot.currentQuestion);
    state.currentQuestion.locked = Boolean(snapshot.currentQuestion.locked);
  }

  if (snapshot.summary) {
    Object.assign(state.summary, {
      active: Boolean(snapshot.summary.active),
      game: String(snapshot.summary.game || ""),
      titleKey: String(snapshot.summary.titleKey || ""),
      titleVars: snapshot.summary.titleVars || {},
      scoreKey: String(snapshot.summary.scoreKey || ""),
      scoreVars: snapshot.summary.scoreVars || {},
      noteKey: String(snapshot.summary.noteKey || ""),
      noteVars: snapshot.summary.noteVars || {},
      correctCount: Math.max(0, Number(snapshot.summary.correctCount || 0)),
      incorrectCount: Math.max(0, Number(snapshot.summary.incorrectCount || 0)),
      elapsedSeconds: Math.max(0, Number(snapshot.summary.elapsedSeconds || 0)),
      mistakes: Array.isArray(snapshot.summary.mistakes) ? snapshot.summary.mistakes : [],
    });
  }

  if (snapshot.lesson) {
    Object.assign(state.lesson, {
      active: Boolean(snapshot.lesson.active),
      currentRound: Math.max(0, Number(snapshot.lesson.currentRound || 0)),
      secondChanceCurrent: Math.max(0, Number(snapshot.lesson.secondChanceCurrent || 0)),
      secondChanceTotal: Math.max(0, Number(snapshot.lesson.secondChanceTotal || 0)),
      startMs: Math.max(0, Number(snapshot.lesson.startMs || 0)),
      elapsedSeconds: Math.max(0, Number(snapshot.lesson.elapsedSeconds || 0)),
      askedWordIds: Array.isArray(snapshot.lesson.askedWordIds) ? snapshot.lesson.askedWordIds : [],
      domainCounts: snapshot.lesson.domainCounts || {},
      missedWordIds: Array.isArray(snapshot.lesson.missedWordIds) ? snapshot.lesson.missedWordIds : [],
      reviewQueue: Array.isArray(snapshot.lesson.reviewQueue) ? snapshot.lesson.reviewQueue : [],
      inReview: Boolean(snapshot.lesson.inReview),
      lessonStartIntroActive: Boolean(snapshot.lesson.lessonStartIntroActive),
      secondChanceIntroActive: Boolean(snapshot.lesson.secondChanceIntroActive),
      optionHistory: snapshot.lesson.optionHistory || {},
      wrongAnswers: Math.max(0, Number(snapshot.lesson.wrongAnswers || 0)),
      sessionMistakeIds: Array.isArray(snapshot.lesson.sessionMistakeIds) ? snapshot.lesson.sessionMistakeIds : [],
      timerId: null,
    });
  }

  if (snapshot.abbreviation) {
    Object.assign(state.abbreviation, {
      active: Boolean(snapshot.abbreviation.active),
      currentRound: Math.max(0, Number(snapshot.abbreviation.currentRound || 0)),
      startMs: Math.max(0, Number(snapshot.abbreviation.startMs || 0)),
      elapsedSeconds: Math.max(0, Number(snapshot.abbreviation.elapsedSeconds || 0)),
      askedEntryIds: Array.isArray(snapshot.abbreviation.askedEntryIds) ? snapshot.abbreviation.askedEntryIds : [],
      introActive: Boolean(snapshot.abbreviation.introActive),
      currentQuestion: snapshot.abbreviation.currentQuestion
        ? cloneAbbreviationQuestionSnapshot(snapshot.abbreviation.currentQuestion)
        : null,
      wrongAnswers: Math.max(0, Number(snapshot.abbreviation.wrongAnswers || 0)),
      sessionMistakeIds: Array.isArray(snapshot.abbreviation.sessionMistakeIds) ? snapshot.abbreviation.sessionMistakeIds : [],
      timerId: null,
    });
    if (state.abbreviation.currentQuestion) {
      state.abbreviation.currentQuestion.locked = Boolean(snapshot.abbreviation.currentQuestion?.locked);
    }
  }

  if (snapshot.match) {
    Object.assign(state.match, {
      active: Boolean(snapshot.match.active),
      verbQueue: Array.isArray(snapshot.match.verbQueue) ? snapshot.match.verbQueue : [],
      totalVerbs: Math.max(0, Number(snapshot.match.totalVerbs || 0)),
      currentVerbIndex: Math.max(0, Number(snapshot.match.currentVerbIndex || 0)),
      currentVerb: snapshot.match.currentVerb || null,
      pairs: Array.isArray(snapshot.match.pairs) ? snapshot.match.pairs : [],
      remainingPairs: Array.isArray(snapshot.match.remainingPairs) ? snapshot.match.remainingPairs : [],
      leftCards: Array.isArray(snapshot.match.leftCards) ? snapshot.match.leftCards : [],
      rightCards: Array.isArray(snapshot.match.rightCards) ? snapshot.match.rightCards : [],
      selectedLeftId: snapshot.match.selectedLeftId || null,
      selectedRightId: snapshot.match.selectedRightId || null,
      mismatchedCardIds: Array.isArray(snapshot.match.mismatchedCardIds) ? snapshot.match.mismatchedCardIds : [],
      matchedCardIds: Array.isArray(snapshot.match.matchedCardIds) ? snapshot.match.matchedCardIds : [],
      matchedPairIds: Array.isArray(snapshot.match.matchedPairIds) ? snapshot.match.matchedPairIds : [],
      isResolving: Boolean(snapshot.match.isResolving),
      nextCardId: Math.max(1, Number(snapshot.match.nextCardId || 1)),
      combo: Math.max(0, Number(snapshot.match.combo || 0)),
      bestCombo: Math.max(0, Number(snapshot.match.bestCombo || 0)),
      matchedCount: Math.max(0, Number(snapshot.match.matchedCount || 0)),
      totalPairs: Math.max(0, Number(snapshot.match.totalPairs || 0)),
      startMs: Math.max(0, Number(snapshot.match.startMs || 0)),
      elapsedSeconds: Math.max(0, Number(snapshot.match.elapsedSeconds || 0)),
      verbIntroActive: Boolean(snapshot.match.verbIntroActive),
      sessionMatched: Math.max(0, Number(snapshot.match.sessionMatched || 0)),
      sessionTotalPairs: Math.max(0, Number(snapshot.match.sessionTotalPairs || 0)),
      currentVerbHadMismatch: Boolean(snapshot.match.currentVerbHadMismatch),
      eligibleMasterWordId: String(snapshot.match.eligibleMasterWordId || ""),
      mismatchCount: Math.max(0, Number(snapshot.match.mismatchCount || 0)),
      sessionMistakeIds: Array.isArray(snapshot.match.sessionMistakeIds) ? snapshot.match.sessionMistakeIds : [],
      timerId: null,
    });
  }

  state.route = resolveInitialRoute(state.route);
}

function persistUiState() {
  saveJson(STORAGE_KEYS.ui, {
    route: state.route,
    lastPlayedMode: state.lastPlayedMode,
  });
}

function persistSessionState() {
  saveJson(STORAGE_KEYS.session, {
    mode: state.mode,
    route: state.route,
    lastPlayedMode: state.lastPlayedMode,
    sessionScore: state.sessionScore,
    sessionStreak: state.sessionStreak,
    showNiqqudInline: state.showNiqqudInline,
    currentQuestion: state.currentQuestion ? cloneLessonQuestionSnapshot(state.currentQuestion) : null,
    summary: {
      active: state.summary.active,
      game: state.summary.game,
      titleKey: state.summary.titleKey,
      titleVars: state.summary.titleVars,
      scoreKey: state.summary.scoreKey,
      scoreVars: state.summary.scoreVars,
      noteKey: state.summary.noteKey,
      noteVars: state.summary.noteVars,
      correctCount: state.summary.correctCount,
      incorrectCount: state.summary.incorrectCount,
      elapsedSeconds: state.summary.elapsedSeconds,
      mistakes: state.summary.mistakes,
    },
    lesson: {
      active: state.lesson.active,
      currentRound: state.lesson.currentRound,
      secondChanceCurrent: state.lesson.secondChanceCurrent,
      secondChanceTotal: state.lesson.secondChanceTotal,
      startMs: state.lesson.startMs,
      elapsedSeconds: state.lesson.elapsedSeconds,
      askedWordIds: state.lesson.askedWordIds,
      domainCounts: state.lesson.domainCounts,
      missedWordIds: state.lesson.missedWordIds,
      reviewQueue: state.lesson.reviewQueue,
      inReview: state.lesson.inReview,
      lessonStartIntroActive: state.lesson.lessonStartIntroActive,
      secondChanceIntroActive: state.lesson.secondChanceIntroActive,
      optionHistory: state.lesson.optionHistory,
      wrongAnswers: state.lesson.wrongAnswers,
      sessionMistakeIds: state.lesson.sessionMistakeIds,
    },
    abbreviation: {
      active: state.abbreviation.active,
      currentRound: state.abbreviation.currentRound,
      startMs: state.abbreviation.startMs,
      elapsedSeconds: state.abbreviation.elapsedSeconds,
      askedEntryIds: state.abbreviation.askedEntryIds,
      introActive: state.abbreviation.introActive,
      currentQuestion: state.abbreviation.currentQuestion ? cloneAbbreviationQuestionSnapshot(state.abbreviation.currentQuestion) : null,
      wrongAnswers: state.abbreviation.wrongAnswers,
      sessionMistakeIds: state.abbreviation.sessionMistakeIds,
    },
    match: {
      active: state.match.active,
      verbQueue: state.match.verbQueue,
      totalVerbs: state.match.totalVerbs,
      currentVerbIndex: state.match.currentVerbIndex,
      currentVerb: state.match.currentVerb,
      pairs: state.match.pairs,
      remainingPairs: state.match.remainingPairs,
      leftCards: state.match.leftCards,
      rightCards: state.match.rightCards,
      selectedLeftId: state.match.selectedLeftId,
      selectedRightId: state.match.selectedRightId,
      mismatchedCardIds: state.match.mismatchedCardIds,
      matchedCardIds: state.match.matchedCardIds,
      matchedPairIds: state.match.matchedPairIds,
      isResolving: state.match.isResolving,
      nextCardId: state.match.nextCardId,
      combo: state.match.combo,
      bestCombo: state.match.bestCombo,
      matchedCount: state.match.matchedCount,
      totalPairs: state.match.totalPairs,
      startMs: state.match.startMs,
      elapsedSeconds: state.match.elapsedSeconds,
      verbIntroActive: state.match.verbIntroActive,
      sessionMatched: state.match.sessionMatched,
      sessionTotalPairs: state.match.sessionTotalPairs,
      currentVerbHadMismatch: state.match.currentVerbHadMismatch,
      eligibleMasterWordId: state.match.eligibleMasterWordId,
      mismatchCount: state.match.mismatchCount,
      sessionMistakeIds: state.match.sessionMistakeIds,
    },
  });
}

function clearPersistedSession() {
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEYS.session);
  } catch {
    // Ignore storage failures.
  }
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

function hasSeenWelcomeModal() {
  if (!storage) return false;

  try {
    return storage.getItem(STORAGE_KEYS.welcomeSeen) === "1";
  } catch {
    return false;
  }
}

function markWelcomeModalSeen() {
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEYS.welcomeSeen, "1");
  } catch {
    // Ignore write failures.
  }
}

function applySurveyLinks() {
  [el.feedbackSurveyLink, el.welcomeSurveyLink].forEach((node) => {
    if (!node) return;
    node.setAttribute("href", FEEDBACK_SURVEY_URL);
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  });
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
    const availability = normalizeVocabularyAvailability(word?.availability || VOCABULARY_AVAILABILITY_DEFAULTS);

    if (!plain) {
      return { ...word, availability, heNiqqud: existing || plain };
    }

    if (existing && existing !== plain) {
      return {
        ...word,
        availability,
        heNiqqud: existing,
      };
    }

    let marked = phraseMap.get(plain) || buildNiqqudFromTokens(plain, tokenMap);
    if (!marked || stripNiqqud(marked) !== stripNiqqud(plain)) marked = plain;
    if (marked === plain) marked = applyFallbackNiqqud(plain);

    return {
      ...word,
      availability,
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
