(function initIvriQuestHebrewVerbs(root, factory) {
"use strict";

const api = factory();

if (typeof module !== "undefined" && module.exports) {
  module.exports = api;
}

if (root) {
  root.IvriQuestHebrewVerbs = api;
}
})(typeof globalThis !== "undefined" ? globalThis : this, function createIvriQuestHebrewVerbs() {
"use strict";

/**
 * @typedef {{
 *   gloss: string,
 *   usage_pattern: string | null,
 *   safe_for_generation: boolean,
 * }} VerbSense
 *
 * @typedef {{
 *   present?: Record<string, string | {plain: string, niqqud?: string}>,
 *   past?: Record<string, string | {plain: string, niqqud?: string}>,
 *   future?: Record<string, string | {plain: string, niqqud?: string}>,
 * }} VerbFormSet
 *
 * @typedef {{
 *   id: string,
 *   lemma: string,
 *   lemma_niqqud?: string,
 *   root: string[] | null,
 *   binyan: string | null,
 *   regularity: "regular" | "irregular" | "ambiguous" | "phrase",
 *   conjugation_mode: "generated" | "curated" | "phrase_only" | "blocked",
 *   senses: VerbSense[],
 *   usage_pattern: string | null,
 *   forms: VerbFormSet,
 *   generated_forms: VerbFormSet,
 *   review_status: "unreviewed" | "approved" | "edited" | "rejected",
 *   notes: string,
 *   examples: Array<Record<string, unknown>>,
 *   difficulty_level: number,
 *   tags: string[],
 *   personal_priority: number,
 *   category: string,
 *   source_word_ids: string[],
 *   availability: { translationQuiz: boolean, sentenceHints: boolean },
 *   source: string,
 *   generation_pattern: string | null,
 * }} VerbEntry
 */

const MODERN_MATCH_FORM_ORDER = [
  { id: "present_masculine_singular", tense: "present", slot: "masculine_singular" },
  { id: "past_first_person_singular", tense: "past", slot: "first_person_singular" },
  { id: "future_first_person_singular", tense: "future", slot: "first_person_singular" },
  { id: "present_feminine_singular", tense: "present", slot: "feminine_singular" },
  { id: "past_third_person_masculine_singular", tense: "past", slot: "third_person_masculine_singular" },
  { id: "future_third_person_masculine_singular", tense: "future", slot: "third_person_masculine_singular" },
  { id: "present_masculine_plural", tense: "present", slot: "masculine_plural" },
  { id: "past_third_person_feminine_singular", tense: "past", slot: "third_person_feminine_singular" },
  { id: "future_third_person_feminine_singular", tense: "future", slot: "third_person_feminine_singular" },
  { id: "present_feminine_plural", tense: "present", slot: "feminine_plural" },
  { id: "past_first_person_plural", tense: "past", slot: "first_person_plural" },
  { id: "future_first_person_plural", tense: "future", slot: "first_person_plural" },
  { id: "past_second_person_masculine_singular", tense: "past", slot: "second_person_masculine_singular" },
  { id: "future_second_person_masculine_singular", tense: "future", slot: "second_person_masculine_singular" },
  { id: "past_second_person_feminine_singular", tense: "past", slot: "second_person_feminine_singular" },
  { id: "future_second_person_feminine_singular", tense: "future", slot: "second_person_feminine_singular" },
  { id: "past_second_person_masculine_plural", tense: "past", slot: "second_person_masculine_plural" },
  { id: "future_second_person_plural", tense: "future", slot: "second_person_plural" },
  { id: "past_second_person_feminine_plural", tense: "past", slot: "second_person_feminine_plural" },
  { id: "past_third_person_plural", tense: "past", slot: "third_person_plural" },
  { id: "future_third_person_plural", tense: "future", slot: "third_person_plural" },
];

const FORMAL_FUTURE_FORM_ORDER = [
  { id: "future_second_person_feminine_plural", tense: "future", slot: "second_person_feminine_plural" },
  { id: "future_third_person_feminine_plural", tense: "future", slot: "third_person_feminine_plural" },
];

const AVAILABILITY_DEFAULTS = Object.freeze({
  translationQuiz: true,
  sentenceHints: true,
});

const RECOGNIZED_REGULARITY = new Set(["regular", "irregular", "ambiguous", "phrase"]);
const RECOGNIZED_CONJUGATION_MODES = new Set(["generated", "curated", "phrase_only", "blocked"]);
const RECOGNIZED_REVIEW_STATUS = new Set(["unreviewed", "approved", "edited", "rejected"]);
const STRONG_ROOT_WEAK_LETTERS = new Set(["א", "ה", "ו", "י"]);
const BLOCKED_GLOSSES = new Set(["to be honest"]);
const KNOWN_AMBIGUOUS_LEMMAS = new Set(["לצפות"]);
const HEBREW_FINAL_TO_MEDIAL = Object.freeze({
  ך: "כ",
  ם: "מ",
  ן: "נ",
  ף: "פ",
  ץ: "צ",
});
const HEBREW_MEDIAL_TO_FINAL = Object.freeze({
  כ: "ך",
  מ: "ם",
  נ: "ן",
  פ: "ף",
  צ: "ץ",
});
const KNOWN_CURATED_LEMMAS = new Map([
  ["לבוא", { root: ["ב", "ו", "א"], binyan: "paal", difficulty_level: 4 }],
  ["להיות", { root: ["ה", "י", "ה"], binyan: "paal", difficulty_level: 5 }],
  ["לראות", { root: ["ר", "א", "ה"], binyan: "paal", difficulty_level: 4 }],
  ["לקחת", { root: ["ל", "ק", "ח"], binyan: "paal", difficulty_level: 4 }],
  ["לשים", { root: ["ש", "י", "ם"], binyan: "paal", difficulty_level: 4 }],
  ["לתת", { root: ["נ", "ת", "נ"], binyan: "paal", difficulty_level: 5 }],
  ["ללכת", { root: ["ה", "ל", "כ"], binyan: "paal", difficulty_level: 4 }],
  ["להגיד", { root: ["נ", "ג", "ד"], binyan: "hifil", difficulty_level: 4 }],
  ["לעמוד", { root: ["ע", "מ", "ד"], binyan: "paal", difficulty_level: 3 }],
  ["לשבת", { root: ["י", "ש", "ב"], binyan: "paal", difficulty_level: 3 }],
]);

const SAFE_GENERATION_OVERRIDES = new Map([
  ["לתבל", { root: ["ת", "ב", "ל"], binyan: "piel", personal_priority: 85 }],
  ["לקפל", { root: ["ק", "פ", "ל"], binyan: "piel", personal_priority: 80 }],
  ["לקשט", { root: ["ק", "ש", "ט"], binyan: "piel", personal_priority: 76 }],
  ["לדלל", { root: ["ד", "ל", "ל"], binyan: "piel", personal_priority: 74 }],
  ["לסנן", { root: ["ס", "נ", "נ"], binyan: "piel", personal_priority: 78 }],
  ["לקרר", { root: ["ק", "ר", "ר"], binyan: "piel", personal_priority: 73 }],
  ["לרפד", { root: ["ר", "פ", "ד"], binyan: "piel", personal_priority: 71 }],
  ["להסמיך", { root: ["ס", "מ", "כ"], binyan: "hifil", personal_priority: 70 }],
  ["להרתיח", { root: ["ר", "ת", "ח"], binyan: "hifil", personal_priority: 79 }],
]);

const TRANSLATION_HIDDEN_STARTER_VERB_IDS = new Set([
  "starter-verb-liftoach",
  "starter-verb-lisgor",
  "starter-verb-lilmod",
  "starter-verb-lesachek",
  "starter-verb-laavod",
  "starter-verb-lagur",
  "starter-verb-lavo",
  "starter-verb-lihyot",
  "starter-verb-lirot",
  "starter-verb-lakachat",
  "starter-verb-lasim",
  "starter-verb-latet",
  "starter-verb-lashevet",
  "starter-verb-lalechet",
  "starter-verb-lehagid",
  "starter-verb-laamod",
  "starter-verb-leechol",
  "starter-verb-lishtot",
  "starter-verb-lichtov",
]);

function normalizeAvailability(availability) {
  return {
    translationQuiz: availability?.translationQuiz !== false,
    sentenceHints: availability?.sentenceHints !== false,
  };
}

function mergeAvailability(current, incoming) {
  const left = normalizeAvailability(current || AVAILABILITY_DEFAULTS);
  const right = normalizeAvailability(incoming || AVAILABILITY_DEFAULTS);
  return {
    translationQuiz: left.translationQuiz && right.translationQuiz,
    sentenceHints: left.sentenceHints || right.sentenceHints,
  };
}

function getStarterVerbAvailability(id) {
  return TRANSLATION_HIDDEN_STARTER_VERB_IDS.has(id)
    ? { translationQuiz: false, sentenceHints: true }
    : AVAILABILITY_DEFAULTS;
}

function makePresent(ms, fs, mp, fp) {
  return {
    masculine_singular: ms,
    feminine_singular: fs,
    masculine_plural: mp,
    feminine_plural: fp,
  };
}

function makePast(firstPersonSingular, secondMasculineSingular, secondFeminineSingular, thirdMasculineSingular, thirdFeminineSingular, firstPersonPlural, secondMasculinePlural, secondFemininePlural, thirdPlural) {
  return {
    first_person_singular: firstPersonSingular,
    second_person_masculine_singular: secondMasculineSingular,
    second_person_feminine_singular: secondFeminineSingular,
    third_person_masculine_singular: thirdMasculineSingular,
    third_person_feminine_singular: thirdFeminineSingular,
    first_person_plural: firstPersonPlural,
    second_person_masculine_plural: secondMasculinePlural,
    second_person_feminine_plural: secondFemininePlural,
    third_person_plural: thirdPlural,
  };
}

function makeFuture(firstPersonSingular, secondMasculineSingular, secondFeminineSingular, thirdMasculineSingular, thirdFeminineSingular, firstPersonPlural, secondPersonPlural, thirdPersonPlural, secondFemininePlural, thirdFemininePlural) {
  const future = {
    first_person_singular: firstPersonSingular,
    second_person_masculine_singular: secondMasculineSingular,
    second_person_feminine_singular: secondFeminineSingular,
    third_person_masculine_singular: thirdMasculineSingular,
    third_person_feminine_singular: thirdFeminineSingular,
    first_person_plural: firstPersonPlural,
    second_person_plural: secondPersonPlural,
    third_person_plural: thirdPersonPlural,
  };

  if (secondFemininePlural) {
    future.second_person_feminine_plural = secondFemininePlural;
  }
  if (thirdFemininePlural) {
    future.third_person_feminine_plural = thirdFemininePlural;
  }

  return future;
}

function markedForm(plain, niqqud) {
  return { plain, niqqud };
}

function makeForms(present, past, future) {
  const forms = {};
  if (present) forms.present = present;
  if (past) forms.past = past;
  if (future) forms.future = future;
  return forms;
}

function makeSense(gloss, usagePattern, safeForGeneration) {
  return {
    gloss,
    usage_pattern: usagePattern || null,
    safe_for_generation: Boolean(safeForGeneration),
  };
}

function createVerbEntry(config) {
  const senses = Array.isArray(config?.senses) && config.senses.length
    ? config.senses.map((sense) => ({
        gloss: String(sense?.gloss || "").trim(),
        usage_pattern: sense?.usage_pattern || null,
        safe_for_generation: Boolean(sense?.safe_for_generation),
      }))
    : [makeSense(String(config?.gloss || "").trim(), config?.usage_pattern || null, config?.safe_for_generation)];

  return {
    id: String(config?.id || slugifyHebrewId(config?.lemma || config?.gloss || "verb")),
    lemma: String(config?.lemma || "").trim(),
    lemma_niqqud: String(config?.lemma_niqqud || config?.lemmaNiqqud || "").trim(),
    root: Array.isArray(config?.root) ? config.root.slice(0, 3) : null,
    binyan: config?.binyan || null,
    regularity: RECOGNIZED_REGULARITY.has(config?.regularity) ? config.regularity : "regular",
    conjugation_mode: RECOGNIZED_CONJUGATION_MODES.has(config?.conjugation_mode) ? config.conjugation_mode : "blocked",
    senses,
    usage_pattern: config?.usage_pattern || deriveSharedUsagePattern(senses),
    forms: cloneData(config?.forms || {}),
    generated_forms: cloneData(config?.generated_forms || {}),
    review_status: RECOGNIZED_REVIEW_STATUS.has(config?.review_status) ? config.review_status : "unreviewed",
    notes: String(config?.notes || ""),
    examples: Array.isArray(config?.examples) ? cloneData(config.examples) : [],
    difficulty_level: clampNumber(config?.difficulty_level, 1, 5, 3),
    tags: Array.isArray(config?.tags) ? config.tags.map((tag) => String(tag || "").trim()).filter(Boolean) : [],
    personal_priority: clampNumber(config?.personal_priority, 1, 100, 60),
    category: String(config?.category || "core_advanced"),
    source_word_ids: Array.isArray(config?.source_word_ids)
      ? config.source_word_ids.map((id) => String(id || "").trim()).filter(Boolean)
      : [],
    availability: normalizeAvailability(config?.availability || AVAILABILITY_DEFAULTS),
    source: String(config?.source || "hebrew-verb"),
    generation_pattern: config?.generation_pattern || null,
  };
}

function buildStarterVerbEntries() {
  return [
    createVerbEntry({
      id: "starter-verb-lisgor",
      availability: getStarterVerbAvailability("starter-verb-lisgor"),
      lemma: "לסגור",
      lemma_niqqud: "לִסְגּוֹר",
      root: ["ס", "ג", "ר"],
      binyan: "paal",
      regularity: "regular",
      conjugation_mode: "generated",
      senses: [makeSense("to close", null, true)],
      forms: makeForms(
        makePresent(
          markedForm("סוגר", "סוֹגֵר"),
          markedForm("סוגרת", "סוֹגֶרֶת"),
          markedForm("סוגרים", "סוֹגְרִים"),
          markedForm("סוגרות", "סוֹגְרוֹת")
        ),
        makePast(
          markedForm("סגרתי", "סָגַרְתִּי"),
          markedForm("סגרת", "סָגַרְתָּ"),
          markedForm("סגרת", "סָגַרְתְּ"),
          markedForm("סגר", "סָגַר"),
          markedForm("סגרה", "סָגְרָה"),
          markedForm("סגרנו", "סָגַרְנוּ"),
          markedForm("סגרתם", "סְגַרְתֶּם"),
          markedForm("סגרתן", "סְגַרְתֶּן"),
          markedForm("סגרו", "סָגְרוּ")
        ),
        makeFuture(
          markedForm("אסגור", "אֶסְגּוֹר"),
          markedForm("תסגור", "תִּסְגּוֹר"),
          markedForm("תסגרי", "תִּסְגְּרִי"),
          markedForm("יסגור", "יִסְגּוֹר"),
          markedForm("תסגור", "תִּסְגּוֹר"),
          markedForm("נסגור", "נִסְגּוֹר"),
          markedForm("תסגרו", "תִּסְגְּרוּ"),
          markedForm("יסגרו", "יִסְגְּרוּ")
        )
      ),
      review_status: "approved",
      notes: "Authoritative stored forms override generation.",
      difficulty_level: 1,
      tags: ["starter", "seed", "regular"],
      personal_priority: 95,
      generation_pattern: "paal_o",
    }),
    createVerbEntry({
      id: "starter-verb-liftoach",
      availability: getStarterVerbAvailability("starter-verb-liftoach"),
      lemma: "לפתוח",
      lemma_niqqud: "לִפְתּוֹחַ",
      root: ["פ", "ת", "ח"],
      binyan: "paal",
      regularity: "regular",
      conjugation_mode: "generated",
      senses: [makeSense("to open", null, true)],
      forms: makeForms(
        makePresent(
          markedForm("פותח", "פּוֹתֵחַ"),
          markedForm("פותחת", "פּוֹתַחַת"),
          markedForm("פותחים", "פּוֹתְחִים"),
          markedForm("פותחות", "פּוֹתְחוֹת")
        ),
        makePast(
          markedForm("פתחתי", "פָּתַחְתִּי"),
          markedForm("פתחת", "פָּתַחְתָּ"),
          markedForm("פתחת", "פָּתַחְתְּ"),
          markedForm("פתח", "פָּתַח"),
          markedForm("פתחה", "פָּתְחָה"),
          markedForm("פתחנו", "פָּתַחְנוּ"),
          markedForm("פתחתם", "פְּתַחְתֶּם"),
          markedForm("פתחתן", "פְּתַחְתֶּן"),
          markedForm("פתחו", "פָּתְחוּ")
        ),
        makeFuture(
          markedForm("אפתח", "אֶפְתַּח"),
          markedForm("תפתח", "תִּפְתַּח"),
          markedForm("תפתחי", "תִּפְתְּחִי"),
          markedForm("יפתח", "יִפְתַּח"),
          markedForm("תפתח", "תִּפְתַּח"),
          markedForm("נפתח", "נִפְתַּח"),
          markedForm("תפתחו", "תִּפְתְּחוּ"),
          markedForm("יפתחו", "יִפְתְּחוּ")
        )
      ),
      review_status: "approved",
      difficulty_level: 1,
      tags: ["starter", "seed", "regular"],
      personal_priority: 94,
    }),
    createVerbEntry({
      id: "starter-verb-lichtov",
      availability: getStarterVerbAvailability("starter-verb-lichtov"),
      lemma: "לכתוב",
      lemma_niqqud: "לִכְתּוֹב",
      root: ["כ", "ת", "ב"],
      binyan: "paal",
      regularity: "regular",
      conjugation_mode: "generated",
      senses: [makeSense("to write", null, true)],
      forms: makeForms(
        makePresent(
          markedForm("כותב", "כּוֹתֵב"),
          markedForm("כותבת", "כּוֹתֶבֶת"),
          markedForm("כותבים", "כּוֹתְבִים"),
          markedForm("כותבות", "כּוֹתְבוֹת")
        ),
        makePast(
          markedForm("כתבתי", "כָּתַבְתִּי"),
          markedForm("כתבת", "כָּתַבְתָּ"),
          markedForm("כתבת", "כָּתַבְתְּ"),
          markedForm("כתב", "כָּתַב"),
          markedForm("כתבה", "כָּתְבָה"),
          markedForm("כתבנו", "כָּתַבְנוּ"),
          markedForm("כתבתם", "כְּתַבְתֶּם"),
          markedForm("כתבתן", "כְּתַבְתֶּן"),
          markedForm("כתבו", "כָּתְבוּ")
        ),
        makeFuture(
          markedForm("אכתוב", "אֶכְתֹּב"),
          markedForm("תכתוב", "תִּכְתֹּב"),
          markedForm("תכתבי", "תִּכְתְּבִי"),
          markedForm("יכתוב", "יִכְתֹּב"),
          markedForm("תכתוב", "תִּכְתֹּב"),
          markedForm("נכתוב", "נִכְתֹּב"),
          markedForm("תכתבו", "תִּכְתְּבוּ"),
          markedForm("יכתבו", "יִכְתְּבוּ")
        )
      ),
      review_status: "approved",
      difficulty_level: 2,
      tags: ["starter", "seed", "regular"],
      personal_priority: 93,
    }),
    createVerbEntry({
      id: "starter-verb-lishmor",
      availability: getStarterVerbAvailability("starter-verb-lishmor"),
      lemma: "לשמור",
      lemma_niqqud: "לִשְׁמוֹר",
      root: ["ש", "מ", "ר"],
      binyan: "paal",
      regularity: "regular",
      conjugation_mode: "generated",
      senses: [makeSense("to keep", null, true)],
      forms: makeForms(
        makePresent(
          markedForm("שומר", "שׁוֹמֵר"),
          markedForm("שומרת", "שׁוֹמֶרֶת"),
          markedForm("שומרים", "שׁוֹמְרִים"),
          markedForm("שומרות", "שׁוֹמְרוֹת")
        ),
        makePast(
          markedForm("שמרתי", "שָׁמַרְתִּי"),
          markedForm("שמרת", "שָׁמַרְתָּ"),
          markedForm("שמרת", "שָׁמַרְתְּ"),
          markedForm("שמר", "שָׁמַר"),
          markedForm("שמרה", "שָׁמְרָה"),
          markedForm("שמרנו", "שָׁמַרְנוּ"),
          markedForm("שמרתם", "שְׁמַרְתֶּם"),
          markedForm("שמרתן", "שְׁמַרְתֶּן"),
          markedForm("שמרו", "שָׁמְרוּ")
        ),
        makeFuture(
          markedForm("אשמור", "אֶשְׁמֹר"),
          markedForm("תשמור", "תִּשְׁמֹר"),
          markedForm("תשמרי", "תִּשְׁמְרִי"),
          markedForm("ישמור", "יִשְׁמֹר"),
          markedForm("תשמור", "תִּשְׁמֹר"),
          markedForm("נשמור", "נִשְׁמֹר"),
          markedForm("תשמרו", "תִּשְׁמְרוּ"),
          markedForm("ישמרו", "יִשְׁמְרוּ")
        )
      ),
      review_status: "approved",
      difficulty_level: 1,
      tags: ["starter", "seed", "regular"],
      personal_priority: 92,
      generation_pattern: "paal_o",
    }),
    createVerbEntry({
      id: "starter-verb-lilmod",
      availability: getStarterVerbAvailability("starter-verb-lilmod"),
      lemma: "ללמוד",
      lemma_niqqud: "לִלְמֹד",
      root: ["ל", "מ", "ד"],
      binyan: "paal",
      regularity: "regular",
      conjugation_mode: "generated",
      senses: [makeSense("to study", null, true)],
      forms: makeForms(
        makePresent(
          markedForm("לומד", "לוֹמֵד"),
          markedForm("לומדת", "לוֹמֶדֶת"),
          markedForm("לומדים", "לוֹמְדִים"),
          markedForm("לומדות", "לוֹמְדוֹת")
        ),
        makePast(
          markedForm("למדתי", "לָמַדְתִּי"),
          markedForm("למדת", "לָמַדְתָּ"),
          markedForm("למדת", "לָמַדְתְּ"),
          markedForm("למד", "לָמַד"),
          markedForm("למדה", "לָמְדָה"),
          markedForm("למדנו", "לָמַדְנוּ"),
          markedForm("למדתם", "לְמַדְתֶּם"),
          markedForm("למדתן", "לְמַדְתֶּן"),
          markedForm("למדו", "לָמְדוּ")
        ),
        makeFuture(
          markedForm("אלמד", "אֶלְמַד"),
          markedForm("תלמד", "תִּלְמַד"),
          markedForm("תלמדי", "תִּלְמְדִי"),
          markedForm("ילמד", "יִלְמַד"),
          markedForm("תלמד", "תִּלְמַד"),
          markedForm("נלמד", "נִלְמַד"),
          markedForm("תלמדו", "תִּלְמְדוּ"),
          markedForm("ילמדו", "יִלְמְדוּ")
        )
      ),
      review_status: "approved",
      difficulty_level: 2,
      tags: ["starter", "seed", "regular"],
      personal_priority: 91,
    }),
    createVerbEntry({
      id: "starter-verb-leechol",
      availability: getStarterVerbAvailability("starter-verb-leechol"),
      lemma: "לאכול",
      lemma_niqqud: "לֶאֱכֹל",
      root: ["א", "כ", "ל"],
      binyan: "paal",
      regularity: "regular",
      conjugation_mode: "generated",
      senses: [makeSense("to eat", null, true)],
      forms: makeForms(
        makePresent(
          markedForm("אוכל", "אוֹכֵל"),
          markedForm("אוכלת", "אוֹכֶלֶת"),
          markedForm("אוכלים", "אוֹכְלִים"),
          markedForm("אוכלות", "אוֹכְלוֹת")
        ),
        makePast(
          markedForm("אכלתי", "אָכַלְתִּי"),
          markedForm("אכלת", "אָכַלְתָּ"),
          markedForm("אכלת", "אָכַלְתְּ"),
          markedForm("אכל", "אָכַל"),
          markedForm("אכלה", "אָכְלָה"),
          markedForm("אכלנו", "אָכַלְנוּ"),
          markedForm("אכלתם", "אֲכַלְתֶּם"),
          markedForm("אכלתן", "אֲכַלְתֶּן"),
          markedForm("אכלו", "אָכְלוּ")
        ),
        makeFuture(
          markedForm("אוכל", "אֹכַל"),
          markedForm("תאכל", "תֹּאכַל"),
          markedForm("תאכלי", "תֹּאכְלִי"),
          markedForm("יאכל", "יֹאכַל"),
          markedForm("תאכל", "תֹּאכַל"),
          markedForm("נאכל", "נֹאכַל"),
          markedForm("תאכלו", "תֹּאכְלוּ"),
          markedForm("יאכלו", "יֹאכְלוּ")
        )
      ),
      review_status: "approved",
      difficulty_level: 2,
      tags: ["starter", "seed", "regular"],
      personal_priority: 90,
    }),
    createVerbEntry({
      id: "starter-verb-lishtot",
      availability: getStarterVerbAvailability("starter-verb-lishtot"),
      lemma: "לשתות",
      lemma_niqqud: "לִשְׁתּוֹת",
      root: ["ש", "ת", "ה"],
      binyan: "paal",
      regularity: "regular",
      conjugation_mode: "generated",
      senses: [makeSense("to drink", null, true)],
      forms: makeForms(
        makePresent(
          markedForm("שותה", "שׁוֹתֶה"),
          markedForm("שותה", "שׁוֹתָה"),
          markedForm("שותים", "שׁוֹתִים"),
          markedForm("שותות", "שׁוֹתוֹת")
        ),
        makePast(
          markedForm("שתיתי", "שָׁתִיתִי"),
          markedForm("שתית", "שָׁתִיתָ"),
          markedForm("שתית", "שָׁתִיתְ"),
          markedForm("שתה", "שָׁתָה"),
          markedForm("שתתה", "שָׁתְתָה"),
          markedForm("שתינו", "שָׁתִינוּ"),
          markedForm("שתיתם", "שְׁתִיתֶם"),
          markedForm("שתיתן", "שְׁתִיתֶן"),
          markedForm("שתו", "שָׁתוּ")
        ),
        makeFuture(
          markedForm("אשתה", "אֶשְׁתֶּה"),
          markedForm("תשתה", "תִּשְׁתֶּה"),
          markedForm("תשתי", "תִּשְׁתִּי"),
          markedForm("ישתה", "יִשְׁתֶּה"),
          markedForm("תשתה", "תִּשְׁתֶּה"),
          markedForm("נשתה", "נִשְׁתֶּה"),
          markedForm("תשתו", "תִּשְׁתּוּ"),
          markedForm("ישתו", "יִשְׁתּוּ")
        )
      ),
      review_status: "approved",
      difficulty_level: 3,
      tags: ["starter", "seed", "regular"],
      personal_priority: 89,
    }),
    createVerbEntry({
      id: "starter-verb-lesachek",
      availability: getStarterVerbAvailability("starter-verb-lesachek"),
      lemma: "לשחק",
      lemma_niqqud: "לְשַׂחֵק",
      root: ["ש", "ח", "ק"],
      binyan: "piel",
      regularity: "regular",
      conjugation_mode: "generated",
      senses: [makeSense("to play", null, true)],
      forms: makeForms(
        makePresent(
          markedForm("משחק", "מְשַׂחֵק"),
          markedForm("משחקת", "מְשַׂחֶקֶת"),
          markedForm("משחקים", "מְשַׂחֲקִים"),
          markedForm("משחקות", "מְשַׂחֲקוֹת")
        ),
        makePast(
          markedForm("שיחקתי", "שִׂיחַקְתִּי"),
          markedForm("שיחקת", "שִׂיחַקְתָּ"),
          markedForm("שיחקת", "שִׂיחַקְתְּ"),
          markedForm("שיחק", "שִׂיחֵק"),
          markedForm("שיחקה", "שִׂיחֲקָה"),
          markedForm("שיחקנו", "שִׂיחַקְנוּ"),
          markedForm("שיחקתם", "שִׂיחַקְתֶּם"),
          markedForm("שיחקתן", "שִׂיחַקְתֶּן"),
          markedForm("שיחקו", "שִׂיחֲקוּ")
        ),
        makeFuture(
          markedForm("אשחק", "אֲשַׂחֵק"),
          markedForm("תשחק", "תְּשַׂחֵק"),
          markedForm("תשחקי", "תְּשַׂחֲקִי"),
          markedForm("ישחק", "יְשַׂחֵק"),
          markedForm("תשחק", "תְּשַׂחֵק"),
          markedForm("נשחק", "נְשַׂחֵק"),
          markedForm("תשחקו", "תְּשַׂחֲקוּ"),
          markedForm("ישחקו", "יְשַׂחֲקוּ")
        )
      ),
      review_status: "approved",
      difficulty_level: 1,
      tags: ["starter", "seed", "regular"],
      personal_priority: 88,
    }),
    createVerbEntry({
      id: "starter-verb-laavod",
      availability: getStarterVerbAvailability("starter-verb-laavod"),
      lemma: "לעבוד",
      lemma_niqqud: "לַעֲבֹד",
      root: ["ע", "ב", "ד"],
      binyan: "paal",
      regularity: "regular",
      conjugation_mode: "generated",
      senses: [makeSense("to work", null, true)],
      forms: makeForms(
        makePresent(
          markedForm("עובד", "עוֹבֵד"),
          markedForm("עובדת", "עוֹבֶדֶת"),
          markedForm("עובדים", "עוֹבְדִים"),
          markedForm("עובדות", "עוֹבְדוֹת")
        ),
        makePast(
          markedForm("עבדתי", "עָבַדְתִּי"),
          markedForm("עבדת", "עָבַדְתָּ"),
          markedForm("עבדת", "עָבַדְתְּ"),
          markedForm("עבד", "עָבַד"),
          markedForm("עבדה", "עָבְדָה"),
          markedForm("עבדנו", "עָבַדְנוּ"),
          markedForm("עבדתם", "עֲבַדְתֶּם"),
          markedForm("עבדתן", "עֲבַדְתֶּן"),
          markedForm("עבדו", "עָבְדוּ")
        ),
        makeFuture(
          markedForm("אעבוד", "אֶעֱבֹד"),
          markedForm("תעבוד", "תַּעֲבֹד"),
          markedForm("תעבדי", "תַּעַבְדִי"),
          markedForm("יעבוד", "יַעֲבֹד"),
          markedForm("תעבוד", "תַּעֲבֹד"),
          markedForm("נעבוד", "נַעֲבֹד"),
          markedForm("תעבדו", "תַּעַבְדוּ"),
          markedForm("יעבדו", "יַעַבְדוּ")
        )
      ),
      review_status: "approved",
      difficulty_level: 2,
      tags: ["starter", "seed", "regular"],
      personal_priority: 87,
    }),
    createVerbEntry({
      id: "starter-verb-lagur",
      availability: getStarterVerbAvailability("starter-verb-lagur"),
      lemma: "לגור",
      lemma_niqqud: "לָגוּר",
      root: ["ג", "ו", "ר"],
      binyan: "paal",
      regularity: "regular",
      conjugation_mode: "generated",
      senses: [makeSense("to live", null, true)],
      forms: makeForms(
        makePresent(
          markedForm("גר", "גָּר"),
          markedForm("גרה", "גָּרָה"),
          markedForm("גרים", "גָּרִים"),
          markedForm("גרות", "גָּרוֹת")
        ),
        makePast(
          markedForm("גרתי", "גַּרְתִּי"),
          markedForm("גרת", "גַּרְתָּ"),
          markedForm("גרת", "גַּרְתְּ"),
          markedForm("גר", "גָּר"),
          markedForm("גרה", "גָּרָה"),
          markedForm("גרנו", "גַּרְנוּ"),
          markedForm("גרתם", "גַּרְתֶּם"),
          markedForm("גרתן", "גַּרְתֶּן"),
          markedForm("גרו", "גָּרוּ")
        ),
        makeFuture(
          markedForm("אגור", "אָגוּר"),
          markedForm("תגור", "תָּגוּר"),
          markedForm("תגורי", "תָּגוּרִי"),
          markedForm("יגור", "יָגוּר"),
          markedForm("תגור", "תָּגוּר"),
          markedForm("נגור", "נָגוּר"),
          markedForm("תגורו", "תָּגוּרוּ"),
          markedForm("יגורו", "יָגוּרוּ")
        )
      ),
      review_status: "approved",
      difficulty_level: 2,
      tags: ["starter", "seed", "regular"],
      personal_priority: 86,
    }),
    createVerbEntry({
      id: "starter-verb-lavo",
      availability: getStarterVerbAvailability("starter-verb-lavo"),
      lemma: "לבוא",
      lemma_niqqud: "לָבוֹא",
      root: ["ב", "ו", "א"],
      binyan: "paal",
      regularity: "irregular",
      conjugation_mode: "curated",
      senses: [makeSense("to come", null, false)],
      forms: makeForms(
        makePresent(
          markedForm("בא", "בָּא"),
          markedForm("באה", "בָּאָה"),
          markedForm("באים", "בָּאִים"),
          markedForm("באות", "בָּאוֹת")
        ),
        makePast(
          markedForm("באתי", "בָּאתִי"),
          markedForm("באת", "בָּאתָ"),
          markedForm("באת", "בָּאתְ"),
          markedForm("בא", "בָּא"),
          markedForm("באה", "בָּאָה"),
          markedForm("באנו", "בָּאנוּ"),
          markedForm("באתם", "בָּאתֶם"),
          markedForm("באתן", "בָּאתֶן"),
          markedForm("באו", "בָּאוּ")
        ),
        makeFuture(
          markedForm("אבוא", "אָבוֹא"),
          markedForm("תבוא", "תָּבוֹא"),
          markedForm("תבואי", "תָּבוֹאִי"),
          markedForm("יבוא", "יָבוֹא"),
          markedForm("תבוא", "תָּבוֹא"),
          markedForm("נבוא", "נָבוֹא"),
          markedForm("תבואו", "תָּבוֹאוּ"),
          markedForm("יבואו", "יָבוֹאוּ")
        )
      ),
      review_status: "approved",
      difficulty_level: 4,
      tags: ["starter", "seed", "curated", "irregular"],
      personal_priority: 96,
    }),
    createVerbEntry({
      id: "starter-verb-lihyot",
      availability: getStarterVerbAvailability("starter-verb-lihyot"),
      lemma: "להיות",
      lemma_niqqud: "לִהְיוֹת",
      root: ["ה", "י", "ה"],
      binyan: "paal",
      regularity: "irregular",
      conjugation_mode: "curated",
      senses: [makeSense("to be", null, false)],
      forms: makeForms(
        null,
        makePast(
          markedForm("הייתי", "הָיִיתִי"),
          markedForm("היית", "הָיִיתָ"),
          markedForm("היית", "הָיִיתְ"),
          markedForm("היה", "הָיָה"),
          markedForm("הייתה", "הָיְתָה"),
          markedForm("היינו", "הָיִינוּ"),
          markedForm("הייתם", "הֱיִיתֶם"),
          markedForm("הייתן", "הֱיִיתֶן"),
          markedForm("היו", "הָיוּ")
        ),
        makeFuture(
          markedForm("אהיה", "אֶהְיֶה"),
          markedForm("תהיה", "תִּהְיֶה"),
          markedForm("תהיי", "תִּהְיִי"),
          markedForm("יהיה", "יִהְיֶה"),
          markedForm("תהיה", "תִּהְיֶה"),
          markedForm("נהיה", "נִהְיֶה"),
          markedForm("תהיו", "תִּהְיוּ"),
          markedForm("יהיו", "יִהְיוּ")
        )
      ),
      review_status: "approved",
      notes: "Modern practical Hebrew usually omits the present-tense copula.",
      difficulty_level: 5,
      tags: ["starter", "seed", "curated", "irregular"],
      personal_priority: 99,
    }),
    createVerbEntry({
      id: "starter-verb-lirot",
      availability: getStarterVerbAvailability("starter-verb-lirot"),
      lemma: "לראות",
      lemma_niqqud: "לִרְאוֹת",
      root: ["ר", "א", "ה"],
      binyan: "paal",
      regularity: "irregular",
      conjugation_mode: "curated",
      senses: [makeSense("to see", null, false)],
      forms: makeForms(
        makePresent(
          markedForm("רואה", "רוֹאֶה"),
          markedForm("רואה", "רוֹאָה"),
          markedForm("רואים", "רוֹאִים"),
          markedForm("רואות", "רוֹאוֹת")
        ),
        makePast(
          markedForm("ראיתי", "רָאִיתִי"),
          markedForm("ראית", "רָאִיתָ"),
          markedForm("ראית", "רָאִיתְ"),
          markedForm("ראה", "רָאָה"),
          markedForm("ראתה", "רָאֲתָה"),
          markedForm("ראינו", "רָאִינוּ"),
          markedForm("ראיתם", "רְאִיתֶם"),
          markedForm("ראיתן", "רְאִיתֶן"),
          markedForm("ראו", "רָאוּ")
        ),
        makeFuture(
          markedForm("אראה", "אֶרְאֶה"),
          markedForm("תראה", "תִּרְאֶה"),
          markedForm("תראי", "תִּרְאִי"),
          markedForm("יראה", "יִרְאֶה"),
          markedForm("תראה", "תִּרְאֶה"),
          markedForm("נראה", "נִרְאֶה"),
          markedForm("תראו", "תִּרְאוּ"),
          markedForm("יראו", "יִרְאוּ")
        )
      ),
      review_status: "approved",
      difficulty_level: 4,
      tags: ["starter", "seed", "curated", "irregular"],
      personal_priority: 90,
    }),
    createVerbEntry({
      id: "starter-verb-lakachat",
      availability: getStarterVerbAvailability("starter-verb-lakachat"),
      lemma: "לקחת",
      lemma_niqqud: "לָקַחַת",
      root: ["ל", "ק", "ח"],
      binyan: "paal",
      regularity: "irregular",
      conjugation_mode: "curated",
      senses: [makeSense("to take", null, false)],
      forms: makeForms(
        makePresent(
          markedForm("לוקח", "לוֹקֵחַ"),
          markedForm("לוקחת", "לוֹקַחַת"),
          markedForm("לוקחים", "לוֹקְחִים"),
          markedForm("לוקחות", "לוֹקְחוֹת")
        ),
        makePast(
          markedForm("לקחתי", "לָקַחְתִּי"),
          markedForm("לקחת", "לָקַחְתָּ"),
          markedForm("לקחת", "לָקַחְתְּ"),
          markedForm("לקח", "לָקַח"),
          markedForm("לקחה", "לָקְחָה"),
          markedForm("לקחנו", "לָקַחְנוּ"),
          markedForm("לקחתם", "לְקַחְתֶּם"),
          markedForm("לקחתן", "לְקַחְתֶּן"),
          markedForm("לקחו", "לָקְחוּ")
        ),
        makeFuture(
          markedForm("אקח", "אֶקַּח"),
          markedForm("תיקח", "תִּקַּח"),
          markedForm("תיקחי", "תִּקְחִי"),
          markedForm("ייקח", "יִקַּח"),
          markedForm("תיקח", "תִּקַּח"),
          markedForm("ניקח", "נִקַּח"),
          markedForm("תיקחו", "תִּקְחוּ"),
          markedForm("ייקחו", "יִקְחוּ")
        )
      ),
      review_status: "approved",
      difficulty_level: 4,
      tags: ["starter", "seed", "curated", "irregular"],
      personal_priority: 88,
    }),
    createVerbEntry({
      id: "starter-verb-lasim",
      availability: getStarterVerbAvailability("starter-verb-lasim"),
      lemma: "לשים",
      lemma_niqqud: "לָשִׂים",
      root: ["ש", "י", "ם"],
      binyan: "paal",
      regularity: "irregular",
      conjugation_mode: "curated",
      senses: [makeSense("to put", null, false)],
      forms: makeForms(
        makePresent(
          markedForm("שם", "שָׂם"),
          markedForm("שמה", "שָׂמָה"),
          markedForm("שמים", "שָׂמִים"),
          markedForm("שמות", "שָׂמוֹת")
        ),
        makePast(
          markedForm("שמתי", "שַׂמְתִּי"),
          markedForm("שמת", "שַׂמְתָּ"),
          markedForm("שמת", "שַׂמְתְּ"),
          markedForm("שם", "שָׂם"),
          markedForm("שמה", "שָׂמָה"),
          markedForm("שמנו", "שַׂמְנוּ"),
          markedForm("שמתם", "שַׂמְתֶּם"),
          markedForm("שמתן", "שַׂמְתֶּן"),
          markedForm("שמו", "שָׂמוּ")
        ),
        makeFuture(
          markedForm("אשים", "אָשִׂים"),
          markedForm("תשים", "תָּשִׂים"),
          markedForm("תשימי", "תָּשִׂימִי"),
          markedForm("ישים", "יָשִׂים"),
          markedForm("תשים", "תָּשִׂים"),
          markedForm("נשים", "נָשִׂים"),
          markedForm("תשימו", "תָּשִׂימוּ"),
          markedForm("ישימו", "יָשִׂימוּ")
        )
      ),
      review_status: "approved",
      difficulty_level: 4,
      tags: ["starter", "seed", "curated", "irregular"],
      personal_priority: 87,
    }),
    createVerbEntry({
      id: "starter-verb-latet",
      availability: getStarterVerbAvailability("starter-verb-latet"),
      lemma: "לתת",
      lemma_niqqud: "לָתֵת",
      root: ["נ", "ת", "נ"],
      binyan: "paal",
      regularity: "irregular",
      conjugation_mode: "curated",
      senses: [makeSense("to give", null, false)],
      forms: makeForms(
        makePresent(
          markedForm("נותן", "נוֹתֵן"),
          markedForm("נותנת", "נוֹתֶנֶת"),
          markedForm("נותנים", "נוֹתְנִים"),
          markedForm("נותנות", "נוֹתְנוֹת")
        ),
        makePast(
          markedForm("נתתי", "נָתַתִּי"),
          markedForm("נתת", "נָתַתָּ"),
          markedForm("נתת", "נָתַתְּ"),
          markedForm("נתן", "נָתַן"),
          markedForm("נתנה", "נָתְנָה"),
          markedForm("נתנו", "נָתַנּוּ"),
          markedForm("נתתם", "נְתַתֶּם"),
          markedForm("נתתן", "נְתַתֶּן"),
          markedForm("נתנו", "נָתְנוּ")
        ),
        makeFuture(
          markedForm("אתן", "אֶתֵּן"),
          markedForm("תיתן", "תִּתֵּן"),
          markedForm("תיתני", "תִּתְּנִי"),
          markedForm("ייתן", "יִתֵּן"),
          markedForm("תיתן", "תִּתֵּן"),
          markedForm("ניתן", "נִתֵּן"),
          markedForm("תיתנו", "תִּתְּנוּ"),
          markedForm("ייתנו", "יִתְּנוּ")
        )
      ),
      review_status: "approved",
      difficulty_level: 5,
      tags: ["starter", "seed", "curated", "irregular"],
      personal_priority: 94,
    }),
    createVerbEntry({
      id: "starter-verb-lalechet",
      availability: getStarterVerbAvailability("starter-verb-lalechet"),
      lemma: "ללכת",
      lemma_niqqud: "לָלֶכֶת",
      root: ["ה", "ל", "כ"],
      binyan: "paal",
      regularity: "irregular",
      conjugation_mode: "curated",
      senses: [makeSense("to go", null, false)],
      forms: makeForms(
        makePresent(
          markedForm("הולך", "הוֹלֵךְ"),
          markedForm("הולכת", "הוֹלֶכֶת"),
          markedForm("הולכים", "הוֹלְכִים"),
          markedForm("הולכות", "הוֹלְכוֹת")
        ),
        makePast(
          markedForm("הלכתי", "הָלַכְתִּי"),
          markedForm("הלכת", "הָלַכְתָּ"),
          markedForm("הלכת", "הָלַכְתְּ"),
          markedForm("הלך", "הָלַךְ"),
          markedForm("הלכה", "הָלְכָה"),
          markedForm("הלכנו", "הָלַכְנוּ"),
          markedForm("הלכתם", "הֲלַכְתֶּם"),
          markedForm("הלכתן", "הֲלַכְתֶּן"),
          markedForm("הלכו", "הָלְכוּ")
        ),
        makeFuture(
          markedForm("אלך", "אֵלֵךְ"),
          markedForm("תלך", "תֵּלֵךְ"),
          markedForm("תלכי", "תֵּלְכִי"),
          markedForm("ילך", "יֵלֵךְ"),
          markedForm("תלך", "תֵּלֵךְ"),
          markedForm("נלך", "נֵלֵךְ"),
          markedForm("תלכו", "תֵּלְכוּ"),
          markedForm("ילכו", "יֵלְכוּ")
        )
      ),
      review_status: "approved",
      difficulty_level: 4,
      tags: ["starter", "seed", "curated", "irregular"],
      personal_priority: 91,
    }),
    createVerbEntry({
      id: "starter-verb-lehagid",
      availability: getStarterVerbAvailability("starter-verb-lehagid"),
      lemma: "להגיד",
      lemma_niqqud: "לְהַגִּיד",
      root: ["נ", "ג", "ד"],
      binyan: "hifil",
      regularity: "irregular",
      conjugation_mode: "curated",
      senses: [makeSense("to say", null, false)],
      forms: makeForms(
        makePresent(
          markedForm("אומר", "אוֹמֵר"),
          markedForm("אומרת", "אוֹמֶרֶת"),
          markedForm("אומרים", "אוֹמְרִים"),
          markedForm("אומרות", "אוֹמְרוֹת")
        ),
        makePast(
          markedForm("אמרתי", "אָמַרְתִּי"),
          markedForm("אמרת", "אָמַרְתָּ"),
          markedForm("אמרת", "אָמַרְתְּ"),
          markedForm("אמר", "אָמַר"),
          markedForm("אמרה", "אָמְרָה"),
          markedForm("אמרנו", "אָמַרְנוּ"),
          markedForm("אמרתם", "אֲמַרְתֶּם"),
          markedForm("אמרתן", "אֲמַרְתֶּן"),
          markedForm("אמרו", "אָמְרוּ")
        ),
        makeFuture(
          markedForm("אגיד", "אַגִּיד"),
          markedForm("תגיד", "תַּגִּיד"),
          markedForm("תגידי", "תַּגִּידִי"),
          markedForm("יגיד", "יַגִּיד"),
          markedForm("תגיד", "תַּגִּיד"),
          markedForm("נגיד", "נַגִּיד"),
          markedForm("תגידו", "תַּגִּידוּ"),
          markedForm("יגידו", "יַגִּידוּ")
        )
      ),
      review_status: "approved",
      notes: "Modern usage is suppletive: present and past come from אמר, future from להגיד.",
      difficulty_level: 4,
      tags: ["starter", "seed", "curated", "irregular"],
      personal_priority: 85,
    }),
    createVerbEntry({
      id: "starter-verb-laamod",
      availability: getStarterVerbAvailability("starter-verb-laamod"),
      lemma: "לעמוד",
      lemma_niqqud: "לַעֲמֹד",
      root: ["ע", "מ", "ד"],
      binyan: "paal",
      regularity: "irregular",
      conjugation_mode: "curated",
      senses: [makeSense("to stand", null, false)],
      forms: makeForms(
        makePresent(
          markedForm("עומד", "עוֹמֵד"),
          markedForm("עומדת", "עוֹמֶדֶת"),
          markedForm("עומדים", "עוֹמְדִים"),
          markedForm("עומדות", "עוֹמְדוֹת")
        ),
        makePast(
          markedForm("עמדתי", "עָמַדְתִּי"),
          markedForm("עמדת", "עָמַדְתָּ"),
          markedForm("עמדת", "עָמַדְתְּ"),
          markedForm("עמד", "עָמַד"),
          markedForm("עמדה", "עָמְדָה"),
          markedForm("עמדנו", "עָמַדְנוּ"),
          markedForm("עמדתם", "עֲמַדְתֶּם"),
          markedForm("עמדתן", "עֲמַדְתֶּן"),
          markedForm("עמדו", "עָמְדוּ")
        ),
        makeFuture(
          markedForm("אעמוד", "אֶעֱמֹד"),
          markedForm("תעמוד", "תַּעֲמֹד"),
          markedForm("תעמדי", "תַּעַמְדִי"),
          markedForm("יעמוד", "יַעֲמֹד"),
          markedForm("תעמוד", "תַּעֲמֹד"),
          markedForm("נעמוד", "נַעֲמֹד"),
          markedForm("תעמדו", "תַּעַמְדוּ"),
          markedForm("יעמדו", "יַעַמְדוּ")
        )
      ),
      review_status: "approved",
      difficulty_level: 3,
      tags: ["starter", "seed", "curated", "irregular"],
      personal_priority: 83,
    }),
    createVerbEntry({
      id: "starter-verb-lashevet",
      availability: getStarterVerbAvailability("starter-verb-lashevet"),
      lemma: "לשבת",
      lemma_niqqud: "לָשֶׁבֶת",
      root: ["י", "ש", "ב"],
      binyan: "paal",
      regularity: "irregular",
      conjugation_mode: "curated",
      senses: [makeSense("to sit", null, false)],
      forms: makeForms(
        makePresent(
          markedForm("יושב", "יוֹשֵׁב"),
          markedForm("יושבת", "יוֹשֶׁבֶת"),
          markedForm("יושבים", "יוֹשְׁבִים"),
          markedForm("יושבות", "יוֹשְׁבוֹת")
        ),
        makePast(
          markedForm("ישבתי", "יָשַׁבְתִּי"),
          markedForm("ישבת", "יָשַׁבְתָּ"),
          markedForm("ישבת", "יָשַׁבְתְּ"),
          markedForm("ישב", "יָשַׁב"),
          markedForm("ישבה", "יָשְׁבָה"),
          markedForm("ישבנו", "יָשַׁבְנוּ"),
          markedForm("ישבתם", "יְשַׁבְתֶּם"),
          markedForm("ישבתן", "יְשַׁבְתֶּן"),
          markedForm("ישבו", "יָשְׁבוּ")
        ),
        makeFuture(
          markedForm("אשב", "אֵשֵׁב"),
          markedForm("תשב", "תֵּשֵׁב"),
          markedForm("תשבי", "תֵּשְׁבִי"),
          markedForm("ישב", "יֵשֵׁב"),
          markedForm("תשב", "תֵּשֵׁב"),
          markedForm("נשב", "נֵשֵׁב"),
          markedForm("תשבו", "תֵּשְׁבוּ"),
          markedForm("ישבו", "יֵשְׁבוּ")
        )
      ),
      review_status: "approved",
      difficulty_level: 3,
      tags: ["starter", "seed", "curated", "irregular"],
      personal_priority: 82,
    }),
    createVerbEntry({
      id: "cooking-verb-lamoach",
      availability: { translationQuiz: true, sentenceHints: true },
      lemma: "למעוך",
      lemma_niqqud: "לִמְעוֹךְ",
      root: ["מ", "ע", "ך"],
      binyan: "paal",
      regularity: "irregular",
      conjugation_mode: "curated",
      senses: [makeSense("to mash", null, false)],
      forms: makeForms(
        makePresent(
          {plain: "מועך", niqqud: "מוֹעֵךְ"},
          {plain: "מועכת", niqqud: "מוֹעֶכֶת"},
          {plain: "מועכים", niqqud: "מוֹעֲכִים"},
          {plain: "מועכות", niqqud: "מוֹעֲכוֹת"}
        ),
        makePast(
          {plain: "מעכתי", niqqud: "מָעַכְתִּי"},
          {plain: "מעכת", niqqud: "מָעַכְתָּ"},
          {plain: "מעכת", niqqud: "מָעַכְתְּ"},
          {plain: "מעך", niqqud: "מָעַךְ"},
          {plain: "מעכה", niqqud: "מָעֲכָה"},
          {plain: "מעכנו", niqqud: "מָעַכְנוּ"},
          {plain: "מעכתם", niqqud: "מָעַכְתֶּם"},
          {plain: "מעכתן", niqqud: "מָעַכְתֶּן"},
          {plain: "מעכו", niqqud: "מָעֲכוּ"}
        ),
        makeFuture(
          {plain: "אמעך", niqqud: "אֶמְעַךְ"},
          {plain: "תמעך", niqqud: "תִּמְעַךְ"},
          {plain: "תמעכי", niqqud: "תִּמְעֲכִי"},
          {plain: "ימעך", niqqud: "יִמְעַךְ"},
          {plain: "תמעך", niqqud: "תִּמְעַךְ"},
          {plain: "נמעך", niqqud: "נִמְעַךְ"},
          {plain: "תמעכו", niqqud: "תִּמְעֲכוּ"},
          {plain: "ימעכו", niqqud: "יִמְעֲכוּ"}
        )
      ),
      review_status: "approved",
      difficulty_level: 3,
      tags: ["curated", "cooking_verbs", "irregular"],
      personal_priority: 60,
      category: "cooking_verbs",
    }),
    createVerbEntry({
      id: "physical-verb-limchotz",
      availability: { translationQuiz: true, sentenceHints: true },
      lemma: "למחוץ",
      lemma_niqqud: "לִמְחוֹץ",
      root: ["מ", "ח", "ץ"],
      binyan: "paal",
      regularity: "irregular",
      conjugation_mode: "curated",
      senses: [makeSense("to crush", null, false)],
      forms: makeForms(
        makePresent(
          {plain: "מוחץ", niqqud: "מוֹחֵץ"},
          {plain: "מוחצת", niqqud: "מוֹחֶצֶת"},
          {plain: "מוחצים", niqqud: "מוֹחֲצִים"},
          {plain: "מוחצות", niqqud: "מוֹחֲצוֹת"}
        ),
        makePast(
          {plain: "מחצתי", niqqud: "מָחַצְתִּי"},
          {plain: "מחצת", niqqud: "מָחַצְתָּ"},
          {plain: "מחצת", niqqud: "מָחַצְתְּ"},
          {plain: "מחץ", niqqud: "מָחַץ"},
          {plain: "מחצה", niqqud: "מָחֲצָה"},
          {plain: "מחצנו", niqqud: "מָחַצְנוּ"},
          {plain: "מחצתם", niqqud: "מָחַצְתֶּם"},
          {plain: "מחצתן", niqqud: "מָחַצְתֶּן"},
          {plain: "מחצו", niqqud: "מָחֲצוּ"}
        ),
        makeFuture(
          {plain: "אמחץ", niqqud: "אֶמְחַץ"},
          {plain: "תמחץ", niqqud: "תִּמְחַץ"},
          {plain: "תמחצי", niqqud: "תִּמְחֲצִי"},
          {plain: "ימחץ", niqqud: "יִמְחַץ"},
          {plain: "תמחץ", niqqud: "תִּמְחַץ"},
          {plain: "נמחץ", niqqud: "נִמְחַץ"},
          {plain: "תמחצו", niqqud: "תִּמְחֲצוּ"},
          {plain: "ימחצו", niqqud: "יִמְחֲצוּ"}
        )
      ),
      review_status: "approved",
      difficulty_level: 3,
      tags: ["curated", "physical_verbs", "irregular"],
      personal_priority: 60,
      category: "physical_verbs",
    }),
    createVerbEntry({
      id: "starter-verb-leshacharer",
      availability: getStarterVerbAvailability("starter-verb-leshacharer"),
      lemma: "לשחרר",
      lemma_niqqud: "לְשַׁחְרֵר",
      root: ["ש", "ח", "ר"],
      binyan: "piel",
      regularity: "regular",
      conjugation_mode: "curated",
      senses: [makeSense("to free", null, true), makeSense("to liberate", null, true)],
      forms: makeForms(
        makePresent("מְשַׁחְרֵר", "מְשַׁחְרֶרֶת", "מְשַׁחְרְרִים", "מְשַׁחְרְרוֹת"),
        makePast("שִׁחְרַרְתִּי", "שִׁחְרַרְתָּ", "שִׁחְרַרְתְּ", "שִׁחְרֵר", "שִׁחְרְרָה", "שִׁחְרַרְנוּ", "שִׁחְרַרְתֶּם", "שִׁחְרַרְתֶּן", "שִׁחְרְרוּ"),
        makeFuture("אֲשַׁחְרֵר", "תְּשַׁחְרֵר", "תְּשַׁחְרְרִי", "יְשַׁחְרֵר", "תְּשַׁחְרֵר", "נְשַׁחְרֵר", "תְּשַׁחְרְרוּ", "יְשַׁחְרְרוּ")
      ),
      review_status: "approved",
      notes: "Pi'el of ש-ח-ר with geminate resh. Gloss covers 'to free' (individuals) and 'to liberate' (peoples/nations).",
      difficulty_level: 3,
      tags: ["piel", "regular"],
      personal_priority: 80,
    }),
    createVerbEntry({
      id: "starter-verb-lekhabot",
      availability: getStarterVerbAvailability("starter-verb-lekhabot"),
      lemma: "לכבות",
      lemma_niqqud: "לְכַבּוֹת",
      root: ["כ", "ב", "ה"],
      binyan: "piel",
      regularity: "regular",
      conjugation_mode: "curated",
      senses: [makeSense("to turn off", null, true), makeSense("to extinguish", null, true)],
      forms: makeForms(
        makePresent(
          markedForm("מכבה", "מְכַבֶּה"),
          markedForm("מכבה", "מְכַבָּה"),
          markedForm("מכבים", "מְכַבִּים"),
          markedForm("מכבות", "מְכַבּוֹת")
        ),
        makePast(
          markedForm("כיביתי", "כִּבִּיתִי"),
          markedForm("כיבית", "כִּבִּיתָ"),
          markedForm("כיבית", "כִּבִּיתְ"),
          markedForm("כיבה", "כִּבָּה"),
          markedForm("כיבתה", "כִּבְּתָה"),
          markedForm("כיבינו", "כִּבִּינוּ"),
          markedForm("כיביתם", "כִּבִּיתֶם"),
          markedForm("כיביתן", "כִּבִּיתֶן"),
          markedForm("כיבו", "כִּבּוּ")
        ),
        makeFuture(
          markedForm("אכבה", "אֲכַבֶּה"),
          markedForm("תכבה", "תְּכַבֶּה"),
          markedForm("תכבי", "תְּכַבִּי"),
          markedForm("יכבה", "יְכַבֶּה"),
          markedForm("תכבה", "תְּכַבֶּה"),
          markedForm("נכבה", "נְכַבֶּה"),
          markedForm("תכבו", "תְּכַבּוּ"),
          markedForm("יכבו", "יְכַבּוּ")
        )
      ),
      review_status: "approved",
      notes: "Pi'el of כ-ב-ה. Common everyday verb for turning off lights, electronics, extinguishing fire.",
      difficulty_level: 2,
      tags: ["piel", "seed"],
      personal_priority: 79,
    }),
    createVerbEntry({
      id: "starter-verb-letzanen",
      availability: getStarterVerbAvailability("starter-verb-letzanen"),
      lemma: "לצנן",
      lemma_niqqud: "לְצַנֵּן",
      root: ["צ", "נ", "נ"],
      binyan: "piel",
      regularity: "regular",
      conjugation_mode: "curated",
      senses: [makeSense("to chill", null, true), makeSense("to cool down", null, true)],
      forms: makeForms(
        makePresent(
          markedForm("מצנן", "מְצַנֵּן"),
          markedForm("מצננת", "מְצַנֶּנֶת"),
          markedForm("מצננים", "מְצַנְּנִים"),
          markedForm("מצננות", "מְצַנְּנוֹת")
        ),
        makePast(
          markedForm("ציננתי", "צִנַּנְתִּי"),
          markedForm("ציננת", "צִנַּנְתָּ"),
          markedForm("ציננת", "צִנַּנְתְּ"),
          markedForm("צינן", "צִנֵּן"),
          markedForm("ציננה", "צִנְּנָה"),
          markedForm("ציננו", "צִנַּנְנוּ"),
          markedForm("ציננתם", "צִנַּנְתֶּם"),
          markedForm("ציננתן", "צִנַּנְתֶּן"),
          markedForm("ציננו", "צִנְּנוּ")
        ),
        makeFuture(
          markedForm("אצנן", "אֲצַנֵּן"),
          markedForm("תצנן", "תְּצַנֵּן"),
          markedForm("תצנני", "תְּצַנְּנִי"),
          markedForm("יצנן", "יְצַנֵּן"),
          markedForm("תצנן", "תְּצַנֵּן"),
          markedForm("נצנן", "נְצַנֵּן"),
          markedForm("תצננו", "תְּצַנְּנוּ"),
          markedForm("יצננו", "יְצַנְּנוּ")
        )
      ),
      review_status: "approved",
      difficulty_level: 2,
      tags: ["piel", "seed"],
      personal_priority: 72,
    }),
  ];
}

const STARTER_VERBS = buildStarterVerbEntries();

function getSeedVerbEntries() {
  return cloneData(STARTER_VERBS);
}

function getSeedVocabularyEntries() {
  const entries = [];

  getSeedVerbEntries().forEach((entry) => {
    const studyItems = expandEntryToStudyItems(entry);
    studyItems.forEach((item) => {
      entries.push({
        id: item.word.id,
        category: item.word.category,
        en: item.word.en,
        he: item.word.he,
        heNiqqud: item.word.heNiqqud,
        utility: item.word.utility,
        availability: cloneData(item.word.availability || AVAILABILITY_DEFAULTS),
        source: "verb-seed",
      });
    });
  });

  return entries;
}

function buildVerbConjugationDeck(config) {
  const options = config && typeof config === "object" ? config : {};
  const vocabulary = Array.isArray(options.vocabulary) ? options.vocabulary : [];
  const customEntries = Array.isArray(options.entries) ? options.entries.map((entry) => createVerbEntry(entry)) : [];
  const migrated = migrateVocabulary(vocabulary);
  const seedEntries = getSeedVerbEntries();
  const mergedEntries = mergeVerbEntries(seedEntries, customEntries.concat(migrated.entries));
  const deck = [];

  mergedEntries
    .sort((left, right) => {
      if ((right.personal_priority || 0) !== (left.personal_priority || 0)) {
        return (right.personal_priority || 0) - (left.personal_priority || 0);
      }
      return String(left.lemma || "").localeCompare(String(right.lemma || ""), "he");
    })
    .forEach((entry) => {
      const items = expandEntryToStudyItems(entry);
      items.forEach((item) => {
        const resolved = resolveLearnerFacingForms(item.entry, item.sense, options);
        if (!resolved) return;

        const forms = flattenVerbForms(resolved.forms, item.sense.gloss, options);
        if (forms.length < 4) return;

        deck.push({
          id: item.word.id,
          word: item.word,
          forms,
          formSource: resolved.source,
          reviewStatus: item.entry.review_status,
          usagePattern: item.sense.usage_pattern || item.entry.usage_pattern || null,
        });
      });
    });

  return deck;
}

function expandEntryToStudyItems(entry) {
  const senses = Array.isArray(entry?.senses) ? entry.senses.filter((sense) => sense && String(sense.gloss || "").trim()) : [];
  if (!senses.length) return [];

  if (!isConjugationCandidate(entry) && !hasAuthoritativeForms(entry)) {
    return [];
  }

  return senses.map((sense, index) => ({
    entry,
    sense,
    word: buildStudyWord(entry, sense, index),
  }));
}

function buildStudyWord(entry, sense, senseIndex) {
  const usagePattern = sense?.usage_pattern || entry?.usage_pattern || null;
  const multipleSenses = Array.isArray(entry?.senses) && entry.senses.length > 1;
  const lemmaPlain = String(entry?.lemma || "").trim();
  const lemmaNiqqud = String(entry?.lemma_niqqud || entry?.lemmaNiqqud || entry?.lemma || "").trim();
  const preferredId = !multipleSenses && Array.isArray(entry?.source_word_ids) && entry.source_word_ids.length === 1
    ? entry.source_word_ids[0]
    : `${String(entry?.id || slugifyHebrewId(entry?.lemma || "verb"))}--sense-${senseIndex + 1}`;

  return {
    id: preferredId,
    category: String(entry?.category || "core_advanced"),
    en: usagePattern ? `${String(sense?.gloss || "").trim()} (${usagePattern})` : String(sense?.gloss || "").trim(),
    he: usagePattern ? `${lemmaPlain} ${usagePattern}` : lemmaPlain,
    heNiqqud: usagePattern ? `${lemmaNiqqud} ${usagePattern}` : lemmaNiqqud,
    utility: clampNumber(entry?.personal_priority, 1, 100, 60),
    availability: normalizeAvailability(entry?.availability || AVAILABILITY_DEFAULTS),
    source: String(entry?.source || "hebrew-verb"),
    usagePattern,
  };
}

function resolveLearnerFacingForms(entry, sense, options) {
  const authoritative = normalizeAndValidateFormSet(entry?.forms, {
    generated: false,
    formalFuturePlural: Boolean(options?.formalFuturePlural),
    lemma: entry?.lemma,
  });
  if (authoritative) {
    return {
      source: "authoritative",
      forms: authoritative,
    };
  }

  if (!canGenerateForms(entry, sense)) {
    return null;
  }

  const generatedDraft = buildGeneratedForms(entry);
  const generated = normalizeAndValidateFormSet(generatedDraft, {
    generated: true,
    formalFuturePlural: Boolean(options?.formalFuturePlural),
    lemma: entry?.lemma,
  });
  if (!generated) {
    return null;
  }

  return {
    source: "generated",
    forms: generated,
  };
}

function canGenerateForms(entry, sense) {
  if (!entry || !sense) return false;
  if (entry.review_status === "rejected") return false;
  if (entry.regularity !== "regular") return false;
  if (entry.conjugation_mode !== "generated") return false;
  if (entry.regularity === "ambiguous" || entry.regularity === "phrase") return false;
  if (containsWhitespace(entry.lemma)) return false;
  if (!sense.safe_for_generation) return false;
  return true;
}

function buildGeneratedForms(entry) {
  const prebuilt = normalizeAndValidateFormSet(entry?.generated_forms, {
    generated: true,
    formalFuturePlural: false,
    lemma: entry?.lemma,
  });
  if (prebuilt) {
    return prebuilt;
  }

  const root = normalizeRoot(entry?.root);
  if (!root) return null;

  if (entry?.generation_pattern === "paal_o") {
    return generatePaalOForms(root);
  }

  if (entry?.binyan === "piel" && isStrongRoot(root)) {
    return generatePielForms(root);
  }

  if (entry?.binyan === "hifil" && isStrongRoot(root)) {
    return generateHifilForms(root);
  }

  return null;
}

function generatePaalOForms(root) {
  const [r1, r2, r3] = root;
  return makeForms(
    makePresent(`${r1}ו${r2}${r3}`, `${r1}ו${r2}${r3}ת`, `${r1}ו${r2}${r3}ים`, `${r1}ו${r2}${r3}ות`),
    makePast(`${r1}${r2}${r3}תי`, `${r1}${r2}${r3}ת`, `${r1}${r2}${r3}ת`, `${r1}${r2}${r3}`, `${r1}${r2}${r3}ה`, `${r1}${r2}${r3}נו`, `${r1}${r2}${r3}תם`, `${r1}${r2}${r3}תן`, `${r1}${r2}${r3}ו`),
    makeFuture(`א${r1}${r2}ו${r3}`, `ת${r1}${r2}ו${r3}`, `ת${r1}${r2}${r3}י`, `י${r1}${r2}ו${r3}`, `ת${r1}${r2}ו${r3}`, `נ${r1}${r2}ו${r3}`, `ת${r1}${r2}${r3}ו`, `י${r1}${r2}${r3}ו`)
  );
}

function generatePielForms(root) {
  const [r1, r2, r3] = root;
  const presentStem = `מ${r1}${r2}${r3}`;
  const pastStem = `${r1}י${r2}${r3}`;
  const futureStem = `${r1}${r2}${r3}`;

  return makeForms(
    makePresent(presentStem, `${presentStem}ת`, `${presentStem}ים`, `${presentStem}ות`),
    makePast(`${pastStem}תי`, `${pastStem}ת`, `${pastStem}ת`, pastStem, `${pastStem}ה`, `${pastStem}נו`, `${pastStem}תם`, `${pastStem}תן`, `${pastStem}ו`),
    makeFuture(`א${futureStem}`, `ת${futureStem}`, `ת${futureStem}י`, `י${futureStem}`, `ת${futureStem}`, `נ${futureStem}`, `ת${futureStem}ו`, `י${futureStem}ו`)
  );
}

function generateHifilForms(root) {
  const [r1, r2, r3] = root;
  const presentStem = `מ${r1}${r2}י${r3}`;
  const pastMasculineStem = `ה${r1}${r2}י${r3}`;
  const pastSuffixStem = `ה${r1}${r2}${r3}`;
  const futureStem = `${r1}${r2}י${r3}`;

  return makeForms(
    makePresent(presentStem, `${presentStem}ה`, `${presentStem}ים`, `${presentStem}ות`),
    makePast(`${pastSuffixStem}תי`, `${pastSuffixStem}ת`, `${pastSuffixStem}ת`, pastMasculineStem, `${pastMasculineStem}ה`, `${pastSuffixStem}נו`, `${pastSuffixStem}תם`, `${pastSuffixStem}תן`, `${pastMasculineStem}ו`),
    makeFuture(`א${futureStem}`, `ת${futureStem}`, `ת${futureStem}י`, `י${futureStem}`, `ת${futureStem}`, `נ${futureStem}`, `ת${futureStem}ו`, `י${futureStem}ו`)
  );
}

function flattenVerbForms(forms, gloss, options) {
  const slots = getFormSlots(Boolean(options?.formalFuturePlural));
  const flattened = [];

  slots.forEach((slotMeta) => {
    const value = normalizeFormValue(forms?.[slotMeta.tense]?.[slotMeta.slot]);
    if (!value) return;

    flattened.push({
      id: slotMeta.id,
      englishText: buildEnglishFormLabel(gloss, slotMeta.id),
      valuePlain: value.plain,
      valueNiqqud: value.niqqud,
    });
  });

  return flattened;
}

function normalizeAndValidateFormSet(formSet, options) {
  if (!formSet || typeof formSet !== "object") return null;

  const output = {};
  const slots = getFormSlots(Boolean(options?.formalFuturePlural));
  let hasInvalidProvidedSlot = false;

  slots.forEach((slotMeta) => {
    const rawValue = formSet?.[slotMeta.tense]?.[slotMeta.slot];
    if (!rawValue) return;

    const normalized = normalizeFormValue(rawValue);
    if (!normalized || !isValidHebrewForm(normalized.plain)) {
      hasInvalidProvidedSlot = true;
      return;
    }
    if (options?.generated && failsGeneratedSanity(normalized.plain, slotMeta.id, options?.lemma)) {
      hasInvalidProvidedSlot = true;
      return;
    }

    if (!output[slotMeta.tense]) {
      output[slotMeta.tense] = {};
    }
    output[slotMeta.tense][slotMeta.slot] = normalized;
  });

  if (hasInvalidProvidedSlot) {
    return null;
  }

  const flattened = flattenVerbForms(output, "to do", { formalFuturePlural: Boolean(options?.formalFuturePlural) });
  if (flattened.length < 4) return null;

  return output;
}

function normalizeFormValue(raw) {
  if (!raw) return null;

  if (typeof raw === "string") {
    const niqqud = normalizeHebrewSofitForms(normalizeWhitespace(raw));
    if (!niqqud) return null;
    const plain = normalizeHebrewSofitForms(stripNiqqud(niqqud));
    if (!plain) return null;
    return {
      plain,
      niqqud,
    };
  }

  if (typeof raw === "object") {
    const rawPlain = normalizeWhitespace(raw.plain || raw.valuePlain || raw.he || "");
    const rawNiqqud = normalizeWhitespace(raw.niqqud || raw.valueNiqqud || "");
    const niqqud = normalizeHebrewSofitForms(rawNiqqud || rawPlain);
    if (!niqqud) return null;
    const plain = normalizeHebrewSofitForms(stripNiqqud(rawPlain || niqqud));
    if (!plain) return null;
    return {
      plain,
      niqqud: niqqud || plain,
    };
  }

  return null;
}

function isValidHebrewForm(text) {
  const normalized = normalizeWhitespace(text);
  if (!normalized) return false;
  if (!/[\u0590-\u05ff]/.test(normalized)) return false;
  if (!/^[\u0590-\u05ff'"׳״\-\s]+$/.test(normalized)) return false;
  return true;
}

function failsGeneratedSanity(value, slotId, lemma) {
  const plain = stripNiqqud(value);
  const normalizedLemma = stripNiqqud(lemma || "");

  if (!plain || !normalizedLemma) return false;
  if (/(?:הת|הים|הות)$/.test(plain)) return true;
  if (slotId.startsWith("present_") && plain === normalizedLemma) return true;

  return false;
}

function hasAuthoritativeForms(entry) {
  return Boolean(
    normalizeAndValidateFormSet(entry?.forms, {
      generated: false,
      formalFuturePlural: false,
      lemma: entry?.lemma,
    })
  );
}

function isConjugationCandidate(entry) {
  if (!entry) return false;
  if (entry.review_status === "rejected") return false;
  if (entry.conjugation_mode === "blocked") return false;
  if (entry.conjugation_mode === "phrase_only") return false;
  if (entry.conjugation_mode === "curated") {
    return hasAuthoritativeForms(entry);
  }
  if (entry.regularity === "phrase") return false;
  return true;
}

function migrateVocabulary(words) {
  const groups = buildVocabularyVerbGroups(Array.isArray(words) ? words : []);
  const entries = [];
  const report = {
    generated_safe_verbs: [],
    curated_verbs_needing_forms: [],
    ambiguous_verbs_needing_sense_splitting: [],
    phrase_only_items: [],
    blocked_items: [],
  };

  groups.forEach((group) => {
    const migrated = migrateVerbGroup(group);
    if (!migrated) return;

    if (migrated.entry) {
      entries.push(migrated.entry);
    }

    if (migrated.reportBucket && report[migrated.reportBucket]) {
      report[migrated.reportBucket].push(buildReportRecord(group, migrated));
    }
  });

  return {
    entries,
    report,
  };
}

function buildVocabularyVerbGroups(words) {
  const grouped = new Map();

  words.forEach((word) => {
    if (String(word?.source || "") === "verb-seed") return;
    if (!looksLikeVerbVocabularyWord(word)) return;

    const lemma = normalizeWhitespace(String(word?.he || ""));
    if (!lemma) return;

    if (!grouped.has(lemma)) {
      grouped.set(lemma, {
        lemma,
        glosses: new Map(),
        wordIds: [],
        category: String(word?.category || "core_advanced"),
        utility: Number(word?.utility || 60),
        availability: normalizeAvailability(word?.availability || AVAILABILITY_DEFAULTS),
      });
    }

    const group = grouped.get(lemma);
    const gloss = normalizeWhitespace(String(word?.en || ""));
    if (gloss) {
      group.glosses.set(gloss.toLowerCase(), gloss);
    }
    group.wordIds.push(String(word?.id || slugifyHebrewId(`${lemma}-${group.wordIds.length + 1}`)));
    group.utility = Math.max(group.utility, Number(word?.utility || 60));
    group.availability = mergeAvailability(group.availability, word?.availability || AVAILABILITY_DEFAULTS);
    if (!group.category && word?.category) {
      group.category = String(word.category);
    }
  });

  return [...grouped.values()].map((group) => ({
    lemma: group.lemma,
    glosses: [...group.glosses.values()],
    source_word_ids: group.wordIds.slice(),
    category: group.category || "core_advanced",
    personal_priority: clampNumber(group.utility, 1, 100, 60),
    availability: normalizeAvailability(group.availability || AVAILABILITY_DEFAULTS),
  }));
}

function migrateVerbGroup(group) {
  const primaryGloss = String(group?.glosses?.[0] || "to do");
  const notesPrefix = `Migrated from vocab item${group?.source_word_ids?.length === 1 ? "" : "s"}: ${group?.source_word_ids?.join(", ") || "none"}.`;

  if (containsWhitespace(group?.lemma)) {
    return {
      entry: createVerbEntry({
        id: `${slugifyHebrewId(group.lemma)}-phrase-only`,
        lemma: group.lemma,
        root: null,
        binyan: null,
        regularity: "phrase",
        conjugation_mode: "phrase_only",
        senses: [makeSense(primaryGloss, null, false)],
        forms: {},
        generated_forms: {},
        review_status: "unreviewed",
        notes: `${notesPrefix} Multi-word Hebrew item kept in vocabulary mode only.`,
        examples: [],
        difficulty_level: 2,
        tags: ["migrated", "phrase_only"],
        personal_priority: group.personal_priority,
        source_word_ids: group.source_word_ids,
        availability: group.availability,
        category: group.category,
        source: "vocab-migration",
      }),
      reportBucket: "phrase_only_items",
      reason: "Multi-word Hebrew lemma defaults to phrase_only.",
    };
  }

  if (KNOWN_AMBIGUOUS_LEMMAS.has(group.lemma) || group.glosses.length > 1) {
    return {
      entry: createVerbEntry({
        id: `${slugifyHebrewId(group.lemma)}-ambiguous`,
        lemma: group.lemma,
        root: null,
        binyan: null,
        regularity: "ambiguous",
        conjugation_mode: "phrase_only",
        senses: group.glosses.map((gloss) => makeSense(gloss, null, false)),
        forms: {},
        generated_forms: {},
        review_status: "unreviewed",
        notes: `${notesPrefix} Ambiguous lemma requires sense splitting before conjugation mode.`,
        examples: [],
        difficulty_level: 3,
        tags: ["migrated", "ambiguous"],
        personal_priority: group.personal_priority,
        source_word_ids: group.source_word_ids,
        availability: group.availability,
        category: group.category,
        source: "vocab-migration",
      }),
      reportBucket: "ambiguous_verbs_needing_sense_splitting",
      reason: "Lemma is known ambiguous or has multiple unsplit English glosses.",
    };
  }

  const generatedOverride = SAFE_GENERATION_OVERRIDES.get(group.lemma);
  if (generatedOverride) {
    const entry = createVerbEntry({
      id: `${slugifyHebrewId(group.lemma)}-generated`,
      lemma: group.lemma,
      root: generatedOverride.root,
      binyan: generatedOverride.binyan,
      regularity: "regular",
      conjugation_mode: "generated",
      senses: [makeSense(primaryGloss, null, true)],
      forms: {},
      generated_forms: {},
      review_status: "unreviewed",
      notes: `${notesPrefix} Explicitly whitelisted as safe for limited generation.`,
      examples: [],
      difficulty_level: 2,
      tags: ["migrated", "generated_safe"],
      personal_priority: generatedOverride.personal_priority || group.personal_priority,
      source_word_ids: group.source_word_ids,
      availability: group.availability,
      category: group.category,
      source: "vocab-migration",
    });

    const generatedForms = buildGeneratedForms(entry);
    entry.generated_forms = generatedForms ? cloneData(generatedForms) : {};

    return {
      entry,
      reportBucket: "generated_safe_verbs",
      reason: "Explicit safe-for-generation override with a supported pattern.",
    };
  }

  const curatedHint = KNOWN_CURATED_LEMMAS.get(group.lemma);
  if (curatedHint) {
    return {
      entry: createVerbEntry({
        id: `${slugifyHebrewId(group.lemma)}-curated`,
        lemma: group.lemma,
        root: curatedHint.root,
        binyan: curatedHint.binyan,
        regularity: "irregular",
        conjugation_mode: "curated",
        senses: [makeSense(primaryGloss, null, false)],
        forms: {},
        generated_forms: {},
        review_status: "unreviewed",
        notes: `${notesPrefix} Difficult verb needs curated authoritative forms before learner-facing conjugation.`,
        examples: [],
        difficulty_level: curatedHint.difficulty_level || 4,
        tags: ["migrated", "curated_needed"],
        personal_priority: group.personal_priority,
        source_word_ids: group.source_word_ids,
        availability: group.availability,
        category: group.category,
        source: "vocab-migration",
      }),
      reportBucket: "curated_verbs_needing_forms",
      reason: "Known difficult verb without authoritative stored forms.",
    };
  }

  return {
    entry: createVerbEntry({
      id: `${slugifyHebrewId(group.lemma)}-blocked`,
      lemma: group.lemma,
      root: null,
      binyan: null,
      regularity: "regular",
      conjugation_mode: "blocked",
      senses: [makeSense(primaryGloss, null, false)],
      forms: {},
      generated_forms: {},
      review_status: "unreviewed",
      notes: `${notesPrefix} No authoritative forms and no approved generation path.`,
      examples: [],
      difficulty_level: 3,
      tags: ["migrated", "blocked"],
      personal_priority: group.personal_priority,
      source_word_ids: group.source_word_ids,
      availability: group.availability,
      category: group.category,
      source: "vocab-migration",
    }),
    reportBucket: "blocked_items",
    reason: "Unsupported for learner-facing conjugation until curated.",
  };
}

function buildReportRecord(group, migrated) {
  return {
    lemma: group.lemma,
    glosses: group.glosses.slice(),
    source_word_ids: group.source_word_ids.slice(),
    reason: migrated.reason,
    conjugation_mode: migrated.entry?.conjugation_mode || null,
    regularity: migrated.entry?.regularity || null,
  };
}

function looksLikeVerbVocabularyWord(word) {
  const english = normalizeWhitespace(String(word?.en || ""));
  const hebrew = normalizeWhitespace(String(word?.he || ""));
  if (!english || !hebrew) return false;
  if (BLOCKED_GLOSSES.has(english.toLowerCase())) return false;
  if (!/^to\s+/i.test(english)) return false;
  return /^ל[\u0590-\u05ff]/.test(hebrew);
}

function mergeVerbEntries(primaryEntries, secondaryEntries) {
  const merged = new Map();

  [...(Array.isArray(primaryEntries) ? primaryEntries : []), ...(Array.isArray(secondaryEntries) ? secondaryEntries : [])].forEach((entry) => {
    if (!entry || !entry.id) return;
    if (!merged.has(entry.id)) {
      merged.set(entry.id, cloneData(entry));
    }
  });

  return [...merged.values()];
}

function buildEnglishFormLabel(gloss, slotId) {
  const base = toVerbBasePhrase(gloss);
  const presentThird = inflectEnglishThirdPerson(base);
  const past = inflectEnglishPast(base);
  const pastPl = base === "be" ? "were" : past;
  const pastTag = past === base ? " (past)" : "";

  switch (slotId) {
    case "present_masculine_singular":
      return `he ${presentThird}`;
    case "present_feminine_singular":
      return `she ${presentThird}`;
    case "present_masculine_plural":
      return `they (m.pl.) ${base}`;
    case "present_feminine_plural":
      return `they (f.pl.) ${base}`;
    case "past_first_person_singular":
      return `I ${past}${pastTag}`;
    case "past_second_person_masculine_singular":
      return `you (m.s.) ${pastPl}${pastTag}`;
    case "past_second_person_feminine_singular":
      return `you (f.s.) ${pastPl}${pastTag}`;
    case "past_third_person_masculine_singular":
      return `he ${past}${pastTag}`;
    case "past_third_person_feminine_singular":
      return `she ${past}${pastTag}`;
    case "past_first_person_plural":
      return `we ${pastPl}${pastTag}`;
    case "past_second_person_masculine_plural":
      return `you (m.pl.) ${pastPl}${pastTag}`;
    case "past_second_person_feminine_plural":
      return `you (f.pl.) ${pastPl}${pastTag}`;
    case "past_third_person_plural":
      return `they ${pastPl}${pastTag}`;
    case "future_first_person_singular":
      return `I will ${base}`;
    case "future_second_person_masculine_singular":
      return `you (m.s.) will ${base}`;
    case "future_second_person_feminine_singular":
      return `you (f.s.) will ${base}`;
    case "future_third_person_masculine_singular":
      return `he will ${base}`;
    case "future_third_person_feminine_singular":
      return `she will ${base}`;
    case "future_first_person_plural":
      return `we will ${base}`;
    case "future_second_person_plural":
      return `you (pl.) will ${base}`;
    case "future_third_person_plural":
      return `they will ${base}`;
    case "future_second_person_feminine_plural":
      return `you (f.pl.) will ${base}`;
    case "future_third_person_feminine_plural":
      return `they (f.pl.) will ${base}`;
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
  const parts = String(phrase || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return { head: "do", tail: "" };
  }
  return {
    head: parts[0],
    tail: parts.slice(1).join(" "),
  };
}

function joinVerbPhrase(head, tail) {
  return tail ? `${head} ${tail}` : head;
}

function inflectEnglishThirdPerson(basePhrase) {
  const parts = splitVerbPhrase(basePhrase);
  let verb = parts.head;
  if (/(s|x|z|sh|ch|o)$/.test(verb)) {
    verb = `${verb}es`;
  } else if (/[^aeiou]y$/.test(verb)) {
    verb = `${verb.slice(0, -1)}ies`;
  } else {
    verb = `${verb}s`;
  }
  return joinVerbPhrase(verb, parts.tail);
}

function inflectEnglishPast(basePhrase) {
  const irregular = new Map([
    ["be", "was"],
    ["come", "came"],
    ["drink", "drank"],
    ["eat", "ate"],
    ["give", "gave"],
    ["go", "went"],
    ["keep", "kept"],
    ["put", "put"],
    ["see", "saw"],
    ["sit", "sat"],
    ["stand", "stood"],
    ["take", "took"],
    ["write", "wrote"],
  ]);
  const parts = splitVerbPhrase(basePhrase);
  let verb = irregular.get(parts.head);
  if (!verb) {
    if (/e$/.test(parts.head)) {
      verb = `${parts.head}d`;
    } else if (/[^aeiou]y$/.test(parts.head)) {
      verb = `${parts.head.slice(0, -1)}ied`;
    } else {
      verb = `${parts.head}ed`;
    }
  }
  return joinVerbPhrase(verb, parts.tail);
}

function getFormSlots(includeFormalFuturePlural) {
  return includeFormalFuturePlural
    ? MODERN_MATCH_FORM_ORDER.concat(FORMAL_FUTURE_FORM_ORDER)
    : MODERN_MATCH_FORM_ORDER;
}

function normalizeRoot(root) {
  if (!Array.isArray(root) || root.length !== 3) return null;
  const normalized = root
    .map((letter) => toMedialHebrewLetter(normalizeWhitespace(String(letter || ""))))
    .filter(Boolean);
  if (normalized.length !== 3) return null;
  if (!normalized.every((letter) => /^[א-ת]$/.test(letter))) return null;
  return normalized;
}

function isStrongRoot(root) {
  const normalized = normalizeRoot(root);
  if (!normalized) return false;
  return normalized.every((letter) => !STRONG_ROOT_WEAK_LETTERS.has(letter));
}

function deriveSharedUsagePattern(senses) {
  const patterns = senses
    .map((sense) => sense?.usage_pattern || null)
    .filter(Boolean);
  if (!patterns.length) return null;
  return patterns.every((pattern) => pattern === patterns[0]) ? patterns[0] : null;
}

function containsWhitespace(text) {
  return /\s/.test(String(text || ""));
}

function normalizeWhitespace(text) {
  return String(text || "").trim().replace(/\s+/g, " ");
}

function toMedialHebrewLetter(letter) {
  return HEBREW_FINAL_TO_MEDIAL[letter] || letter;
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

function stripNiqqud(text) {
  return String(text || "").normalize("NFC").replace(/[\u0591-\u05c7]/g, "");
}

function slugifyHebrewId(text) {
  return String(text || "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\u0590-\u05ffa-zA-Z0-9_-]/g, "")
    .slice(0, 80)
    .toLowerCase() || "verb";
}

function clampNumber(value, min, max, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(min, Math.min(max, Math.round(numeric)));
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

return {
  MATCH_FORM_ORDER: MODERN_MATCH_FORM_ORDER.map((slot) => slot.id),
  FORMAL_FUTURE_FORM_ORDER: FORMAL_FUTURE_FORM_ORDER.map((slot) => slot.id),
  getSeedVerbEntries,
  getSeedVocabularyEntries,
  buildVerbConjugationDeck,
  migrateVocabulary,
  buildGeneratedForms,
  resolveLearnerFacingForms,
  normalizeAndValidateFormSet,
};
});
