(function initIvriQuestAppContentSources(global) {
"use strict";

const app = global.IvriQuestApp = global.IvriQuestApp || {};
const contentSources = app.contentSources = app.contentSources || {};

contentSources.fallbackVocabApi = contentSources.fallbackVocabApi || {
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

contentSources.fallbackAbbreviationApi = contentSources.fallbackAbbreviationApi || {
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

contentSources.fallbackVerbApi = contentSources.fallbackVerbApi || {
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
    return [];
  },
};

contentSources.fallbackSentenceBankApi = contentSources.fallbackSentenceBankApi || {
  getSentenceBank() {
    return [];
  },
};

contentSources.resolveContentApis = contentSources.resolveContentApis || function resolveContentApis(globalScope) {
  const fallbackVocabApi = contentSources.fallbackVocabApi;
  const fallbackAbbreviationApi = contentSources.fallbackAbbreviationApi;
  const fallbackVerbApi = contentSources.fallbackVerbApi;
  const fallbackSentenceBankApi = contentSources.fallbackSentenceBankApi;
  const vocabApi = globalScope.IvriQuestVocab ? globalScope.IvriQuestVocab : fallbackVocabApi;
  const abbreviationApi = globalScope.IvriQuestAbbreviations ? globalScope.IvriQuestAbbreviations : fallbackAbbreviationApi;
  const verbApi = globalScope.IvriQuestHebrewVerbs ? globalScope.IvriQuestHebrewVerbs : fallbackVerbApi;
  const sentenceBankApi = globalScope.IvriQuestSentenceBank ? globalScope.IvriQuestSentenceBank : fallbackSentenceBankApi;
  const expansionTracks = vocabApi.EXPANSION_TRACKS || {};

  return {
    vocabApi,
    abbreviationApi,
    verbApi,
    sentenceBankApi,
    fallbackVerbApi,
    usingFallbackVocab: vocabApi === fallbackVocabApi,
    usingFallbackAbbreviations: abbreviationApi === fallbackAbbreviationApi,
    usingFallbackSentenceBank: sentenceBankApi === fallbackSentenceBankApi,
    getBaseVocabularyFn: vocabApi.getBaseVocabulary,
    getAbbreviationsFn: abbreviationApi.getAbbreviations,
    getSentenceBankFn: sentenceBankApi.getSentenceBank,
    expansionTrackCount: Object.values(expansionTracks).reduce(
      (sum, group) => sum + (Array.isArray(group) ? group.length : 0),
      0
    ),
  };
};

})(typeof window !== "undefined" ? window : globalThis);
