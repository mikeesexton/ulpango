const test = require("node:test");
const assert = require("node:assert/strict");

const verbApi = require("../hebrew-verbs.js");

function sense(gloss, usagePattern, safeForGeneration) {
  return {
    gloss,
    usage_pattern: usagePattern || null,
    safe_for_generation: Boolean(safeForGeneration),
  };
}

function forms(present, past, future) {
  const result = {};
  if (present) result.present = present;
  if (past) result.past = past;
  if (future) result.future = future;
  return result;
}

test("ambiguous verbs are split by sense instead of appearing as one generic conjugation card", () => {
  const deck = verbApi.buildVerbConjugationDeck({
    vocabulary: [],
    entries: [
      {
        id: "test-litzpot",
        lemma: "לצפות",
        root: ["צ", "פ", "ה"],
        binyan: "piel",
        regularity: "ambiguous",
        conjugation_mode: "curated",
        senses: [
          sense("to watch", "ב־", false),
          sense("to expect", "ל־", false),
        ],
        forms: forms(
          {
            masculine_singular: "צופה",
            feminine_singular: "צופה",
            masculine_plural: "צופים",
            feminine_plural: "צופות",
          },
          {
            first_person_singular: "צפיתי",
            second_person_masculine_singular: "צפית",
            second_person_feminine_singular: "צפית",
            third_person_masculine_singular: "צפה",
            third_person_feminine_singular: "צפתה",
            first_person_plural: "צפינו",
            second_person_masculine_plural: "צפיתם",
            second_person_feminine_plural: "צפיתן",
            third_person_plural: "צפו",
          },
          {
            first_person_singular: "אצפה",
            second_person_masculine_singular: "תצפה",
            second_person_feminine_singular: "תצפי",
            third_person_masculine_singular: "יצפה",
            third_person_feminine_singular: "תצפה",
            first_person_plural: "נצפה",
            second_person_plural: "תצפו",
            third_person_plural: "יצפו",
          }
        ),
        generated_forms: {},
        review_status: "approved",
        notes: "",
        examples: [],
        difficulty_level: 4,
        tags: ["test"],
        personal_priority: 80,
        category: "core_advanced",
        source_word_ids: [],
        source: "test",
      },
    ],
  });

  const customDeck = deck.filter((item) => item.id.startsWith("test-litzpot"));
  assert.equal(customDeck.length, 2);
  assert.deepEqual(
    customDeck.map((item) => item.word.en).sort(),
    ["to expect (ל־)", "to watch (ב־)"]
  );
});

test("present plural English labels include gender when the Hebrew forms would otherwise collide", () => {
  const deck = verbApi.buildVerbConjugationDeck({
    vocabulary: [],
    entries: [
      {
        id: "test-lakachat",
        lemma: "לקחת",
        root: ["ל", "ק", "ח"],
        binyan: "paal",
        regularity: "irregular",
        conjugation_mode: "curated",
        senses: [sense("to take", null, false)],
        forms: forms(
          {
            masculine_singular: "לוקח",
            feminine_singular: "לוקחת",
            masculine_plural: "לוקחים",
            feminine_plural: "לוקחות",
          },
          {
            first_person_singular: "לקחתי",
            second_person_masculine_singular: "לקחת",
            second_person_feminine_singular: "לקחת",
            third_person_masculine_singular: "לקח",
            third_person_feminine_singular: "לקחה",
            first_person_plural: "לקחנו",
            second_person_masculine_plural: "לקחתם",
            second_person_feminine_plural: "לקחתן",
            third_person_plural: "לקחו",
          },
          {
            first_person_singular: "אקח",
            second_person_masculine_singular: "תיקח",
            second_person_feminine_singular: "תיקחי",
            third_person_masculine_singular: "ייקח",
            third_person_feminine_singular: "תיקח",
            first_person_plural: "ניקח",
            second_person_plural: "תיקחו",
            third_person_plural: "ייקחו",
          }
        ),
        generated_forms: {},
        review_status: "approved",
        notes: "",
        examples: [],
        difficulty_level: 4,
        tags: ["test"],
        personal_priority: 80,
        category: "core_advanced",
        source_word_ids: [],
        source: "test",
      },
    ],
  });

  const item = deck.find((entry) => entry.id.startsWith("test-lakachat"));
  assert.ok(item);
  assert.equal(
    item.forms.find((form) => form.id === "present_masculine_plural")?.englishText,
    "they (m.pl.) take"
  );
  assert.equal(
    item.forms.find((form) => form.id === "present_feminine_plural")?.englishText,
    "they (f.pl.) take"
  );
});

test("generated English past labels use irregular forms for keep", () => {
  const deck = verbApi.buildVerbConjugationDeck({
    vocabulary: [],
    entries: [
      {
        id: "test-lishmor",
        lemma: "לשמור",
        root: ["ש", "מ", "ר"],
        binyan: "paal",
        regularity: "regular",
        conjugation_mode: "generated",
        senses: [sense("to keep", null, true)],
        forms: forms(
          {
            masculine_singular: "שומר",
            feminine_singular: "שומרת",
            masculine_plural: "שומרים",
            feminine_plural: "שומרות",
          },
          {
            first_person_singular: "שמרתי",
            second_person_masculine_singular: "שמרת",
            second_person_feminine_singular: "שמרת",
            third_person_masculine_singular: "שמר",
            third_person_feminine_singular: "שמרה",
            first_person_plural: "שמרנו",
            second_person_masculine_plural: "שמרתם",
            second_person_feminine_plural: "שמרתן",
            third_person_plural: "שמרו",
          },
          {
            first_person_singular: "אשמור",
            second_person_masculine_singular: "תשמור",
            second_person_feminine_singular: "תשמרי",
            third_person_masculine_singular: "ישמור",
            third_person_feminine_singular: "תשמור",
            first_person_plural: "נשמור",
            second_person_plural: "תשמרו",
            third_person_plural: "ישמרו",
          }
        ),
        generated_forms: {},
        review_status: "approved",
        notes: "",
        examples: [],
        difficulty_level: 2,
        tags: ["test"],
        personal_priority: 80,
        category: "core_advanced",
        source_word_ids: [],
        source: "test",
      },
    ],
  });

  const item = deck.find((entry) => entry.id.startsWith("test-lishmor"));
  assert.ok(item);
  assert.equal(
    item.forms.find((form) => form.id === "past_third_person_masculine_singular")?.englishText,
    "he kept"
  );
  assert.equal(
    item.forms.find((form) => form.id === "past_first_person_plural")?.englishText,
    "we kept"
  );
});

test("difficult curated verbs can appear in conjugation mode when authoritative forms exist", () => {
  const deck = verbApi.buildVerbConjugationDeck({
    vocabulary: [],
    entries: [
      {
        id: "test-lavo",
        lemma: "לבוא",
        root: ["ב", "ו", "א"],
        binyan: "paal",
        regularity: "irregular",
        conjugation_mode: "curated",
        senses: [sense("to come", null, false)],
        forms: forms(
          {
            masculine_singular: "בא",
            feminine_singular: "באה",
            masculine_plural: "באים",
            feminine_plural: "באות",
          },
          {
            first_person_singular: "באתי",
            second_person_masculine_singular: "באת",
            second_person_feminine_singular: "באת",
            third_person_masculine_singular: "בא",
            third_person_feminine_singular: "באה",
            first_person_plural: "באנו",
            second_person_masculine_plural: "באתם",
            second_person_feminine_plural: "באתן",
            third_person_plural: "באו",
          },
          {
            first_person_singular: "אבוא",
            second_person_masculine_singular: "תבוא",
            second_person_feminine_singular: "תבואי",
            third_person_masculine_singular: "יבוא",
            third_person_feminine_singular: "תבוא",
            first_person_plural: "נבוא",
            second_person_plural: "תבואו",
            third_person_plural: "יבואו",
          }
        ),
        generated_forms: {},
        review_status: "approved",
        notes: "",
        examples: [],
        difficulty_level: 4,
        tags: ["test"],
        personal_priority: 80,
        category: "core_advanced",
        source_word_ids: [],
        source: "test",
      },
    ],
  });

  const item = deck.find((entry) => entry.id.startsWith("test-lavo"));
  assert.ok(item);
  assert.equal(item.formSource, "authoritative");
  assert.ok(item.forms.some((form) => form.valuePlain === "אבוא"));
});

test("difficult curated verbs without authoritative forms are not guessed automatically", () => {
  const deck = verbApi.buildVerbConjugationDeck({
    vocabulary: [],
    entries: [
      {
        id: "test-lihyot",
        lemma: "להיות",
        root: ["ה", "י", "ה"],
        binyan: "paal",
        regularity: "irregular",
        conjugation_mode: "curated",
        senses: [sense("to be", null, false)],
        forms: {},
        generated_forms: {},
        review_status: "unreviewed",
        notes: "",
        examples: [],
        difficulty_level: 5,
        tags: ["test"],
        personal_priority: 80,
        category: "core_advanced",
        source_word_ids: [],
        source: "test",
      },
    ],
  });

  assert.equal(deck.filter((entry) => entry.id.startsWith("test-lihyot")).length, 0);
});

test("phrase verbs stay out of generic conjugation mode", () => {
  const deck = verbApi.buildVerbConjugationDeck({
    vocabulary: [],
    entries: [
      {
        id: "test-levashel-katana",
        lemma: "לבשל על אש קטנה",
        root: null,
        binyan: null,
        regularity: "phrase",
        conjugation_mode: "phrase_only",
        senses: [sense("to simmer", null, false)],
        forms: {},
        generated_forms: {},
        review_status: "unreviewed",
        notes: "",
        examples: [],
        difficulty_level: 2,
        tags: ["test"],
        personal_priority: 60,
        category: "cooking_verbs",
        source_word_ids: ["phrase-source"],
        source: "test",
      },
    ],
  });

  assert.equal(deck.filter((entry) => entry.id === "phrase-source").length, 0);
});

test("starter verb seed entries carry per-mode availability metadata", () => {
  const entries = verbApi.getSeedVocabularyEntries();
  const entriesById = new Map(entries.map((entry) => [entry.id, entry]));

  assert.equal(entriesById.get("starter-verb-lalechet--sense-1")?.availability?.translationQuiz, false);
  assert.equal(entriesById.get("starter-verb-lalechet--sense-1")?.availability?.sentenceHints, true);
  assert.equal(entriesById.get("starter-verb-lichtov--sense-1")?.availability?.translationQuiz, true);
  assert.equal(entriesById.get("starter-verb-lichtov--sense-1")?.availability?.sentenceHints, true);
});

test("generated-safe verbs may use the limited generator", () => {
  const result = verbApi.resolveLearnerFacingForms(
    {
      id: "test-letabel",
      lemma: "לתבל",
      root: ["ת", "ב", "ל"],
      binyan: "piel",
      regularity: "regular",
      conjugation_mode: "generated",
      senses: [sense("to season", null, true)],
      forms: {},
      generated_forms: {},
      review_status: "approved",
      notes: "",
      examples: [],
      difficulty_level: 2,
      tags: ["test"],
      personal_priority: 75,
    },
    sense("to season", null, true),
    {}
  );

  assert.ok(result);
  assert.equal(result.source, "generated");
  assert.equal(result.forms.present.masculine_singular.plain, "מתבל");
  assert.equal(result.forms.future.first_person_singular.plain, "אתבל");
});

test("generated forms normalize final-letter variants at token end", () => {
  const result = verbApi.resolveLearnerFacingForms(
    {
      id: "test-lehasmich",
      lemma: "להסמיך",
      root: ["ס", "מ", "כ"],
      binyan: "hifil",
      regularity: "regular",
      conjugation_mode: "generated",
      senses: [sense("to thicken", null, true)],
      forms: {},
      generated_forms: {},
      review_status: "approved",
      notes: "",
      examples: [],
      difficulty_level: 2,
      tags: ["test"],
      personal_priority: 70,
    },
    sense("to thicken", null, true),
    {}
  );

  assert.ok(result);
  assert.equal(result.source, "generated");
  assert.equal(result.forms.present.masculine_singular.plain, "מסמיך");
  assert.equal(result.forms.past.third_person_masculine_singular.plain, "הסמיך");
  assert.equal(result.forms.future.first_person_singular.plain, "אסמיך");
});

test("authoritative forms always override generated forms", () => {
  const result = verbApi.resolveLearnerFacingForms(
    {
      id: "test-lisgor",
      lemma: "לסגור",
      root: ["ס", "ג", "ר"],
      binyan: "paal",
      regularity: "regular",
      conjugation_mode: "generated",
      senses: [sense("to close", null, true)],
      forms: forms(
        {
          masculine_singular: "סוגר",
          feminine_singular: "סוגרת",
          masculine_plural: "סוגרים",
          feminine_plural: "סוגרות",
        },
        {
          first_person_singular: "סגרתי",
          second_person_masculine_singular: "סגרת",
          second_person_feminine_singular: "סגרת",
          third_person_masculine_singular: "סגר",
          third_person_feminine_singular: "סגרה",
          first_person_plural: "סגרנו",
          second_person_masculine_plural: "סגרתם",
          second_person_feminine_plural: "סגרתן",
          third_person_plural: "סגרו",
        },
        {
          first_person_singular: "אסגור",
          second_person_masculine_singular: "תסגור",
          second_person_feminine_singular: "תסגרי",
          third_person_masculine_singular: "יסגור",
          third_person_feminine_singular: "תסגור",
          first_person_plural: "נסגור",
          second_person_plural: "תסגרו",
          third_person_plural: "יסגרו",
        }
      ),
      generated_forms: forms(
        {
          masculine_singular: "סגר",
          feminine_singular: "סגרת",
          masculine_plural: "סגרים",
          feminine_plural: "סגרות",
        },
        {
          first_person_singular: "סגרתי",
          second_person_masculine_singular: "סגרת",
          second_person_feminine_singular: "סגרת",
          third_person_masculine_singular: "סגר",
          third_person_feminine_singular: "סגרה",
          first_person_plural: "סגרנו",
          second_person_masculine_plural: "סגרתם",
          second_person_feminine_plural: "סגרתן",
          third_person_plural: "סגרו",
        },
        {
          first_person_singular: "אסגור",
          second_person_masculine_singular: "תסגור",
          second_person_feminine_singular: "תסגרי",
          third_person_masculine_singular: "יסגור",
          third_person_feminine_singular: "תסגור",
          first_person_plural: "נסגור",
          second_person_plural: "תסגרו",
          third_person_plural: "יסגרו",
        }
      ),
      review_status: "approved",
      notes: "",
      examples: [],
      difficulty_level: 2,
      tags: ["test"],
      personal_priority: 80,
    },
    sense("to close", null, true),
    {}
  );

  assert.ok(result);
  assert.equal(result.source, "authoritative");
  assert.equal(result.forms.present.masculine_singular.plain, "סוגר");
});

test("learner-facing fake forms like מצפהת and מצפהים never appear", () => {
  const result = verbApi.resolveLearnerFacingForms(
    {
      id: "test-invalid-generated",
      lemma: "לצפות",
      root: ["צ", "פ", "ה"],
      binyan: "piel",
      regularity: "regular",
      conjugation_mode: "generated",
      senses: [sense("to coat", null, true)],
      forms: {},
      generated_forms: forms(
        {
          masculine_singular: "מצפה",
          feminine_singular: "מצפהת",
          masculine_plural: "מצפהים",
          feminine_plural: "מצפהות",
        },
        {
          first_person_singular: "ציפיתי",
          second_person_masculine_singular: "ציפית",
          second_person_feminine_singular: "ציפית",
          third_person_masculine_singular: "ציפה",
          third_person_feminine_singular: "ציפתה",
          first_person_plural: "ציפינו",
          second_person_masculine_plural: "ציפיתם",
          second_person_feminine_plural: "ציפיתן",
          third_person_plural: "ציפו",
        },
        {
          first_person_singular: "אצפה",
          second_person_masculine_singular: "תצפה",
          second_person_feminine_singular: "תצפי",
          third_person_masculine_singular: "יצפה",
          third_person_feminine_singular: "תצפה",
          first_person_plural: "נצפה",
          second_person_plural: "תצפו",
          third_person_plural: "יצפו",
        }
      ),
      review_status: "approved",
      notes: "",
      examples: [],
      difficulty_level: 2,
      tags: ["test"],
      personal_priority: 70,
    },
    sense("to coat", null, true),
    {}
  );

  assert.equal(result, null);
});
