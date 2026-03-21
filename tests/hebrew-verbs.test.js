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

test("curated English past labels use irregular forms for say", () => {
  const deck = verbApi.buildVerbConjugationDeck({
    vocabulary: [],
    entries: [
      {
        id: "test-lehagid",
        lemma: "להגיד",
        root: ["נ", "ג", "ד"],
        binyan: "hifil",
        regularity: "irregular",
        conjugation_mode: "curated",
        senses: [sense("to say", null, false)],
        forms: forms(
          {
            masculine_singular: "אומר",
            feminine_singular: "אומרת",
            masculine_plural: "אומרים",
            feminine_plural: "אומרות",
          },
          {
            first_person_singular: "אמרתי",
            second_person_masculine_singular: "אמרת",
            second_person_feminine_singular: "אמרת",
            third_person_masculine_singular: "אמר",
            third_person_feminine_singular: "אמרה",
            first_person_plural: "אמרנו",
            second_person_masculine_plural: "אמרתם",
            second_person_feminine_plural: "אמרתן",
            third_person_plural: "אמרו",
          },
          {
            first_person_singular: "אגיד",
            second_person_masculine_singular: "תגיד",
            second_person_feminine_singular: "תגידי",
            third_person_masculine_singular: "יגיד",
            third_person_feminine_singular: "תגיד",
            first_person_plural: "נגיד",
            second_person_plural: "תגידו",
            third_person_plural: "יגידו",
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

  const item = deck.find((entry) => entry.id.startsWith("test-lehagid"));
  assert.ok(item);
  assert.equal(
    item.forms.find((form) => form.id === "past_first_person_singular")?.englishText,
    "I said"
  );
  assert.equal(
    item.forms.find((form) => form.id === "past_third_person_masculine_singular")?.englishText,
    "he said"
  );
  assert.equal(
    item.forms.find((form) => form.id === "past_first_person_plural")?.englishText,
    "we said"
  );
});

test("present English labels use irregular forms for be", () => {
  const deck = verbApi.buildVerbConjugationDeck({
    vocabulary: [],
    entries: [
      {
        id: "test-lihyot-present",
        lemma: "להיות",
        root: ["ה", "י", "ה"],
        binyan: "paal",
        regularity: "irregular",
        conjugation_mode: "curated",
        senses: [sense("to be", null, false)],
        forms: forms(
          {
            masculine_singular: "הווה",
            feminine_singular: "הווה",
            masculine_plural: "הווים",
            feminine_plural: "הוות",
          },
          {
            first_person_singular: "הייתי",
            second_person_masculine_singular: "היית",
            second_person_feminine_singular: "היית",
            third_person_masculine_singular: "היה",
            third_person_feminine_singular: "הייתה",
            first_person_plural: "היינו",
            second_person_masculine_plural: "הייתם",
            second_person_feminine_plural: "הייתן",
            third_person_plural: "היו",
          },
          {
            first_person_singular: "אהיה",
            second_person_masculine_singular: "תהיה",
            second_person_feminine_singular: "תהיי",
            third_person_masculine_singular: "יהיה",
            third_person_feminine_singular: "תהיה",
            first_person_plural: "נהיה",
            second_person_plural: "תהיו",
            third_person_plural: "יהיו",
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

  const item = deck.find((entry) => entry.id.startsWith("test-lihyot-present"));
  assert.ok(item);
  assert.equal(
    item.forms.find((form) => form.id === "present_masculine_singular")?.englishText,
    "he is"
  );
  assert.equal(
    item.forms.find((form) => form.id === "present_feminine_singular")?.englishText,
    "she is"
  );
  assert.equal(
    item.forms.find((form) => form.id === "present_masculine_plural")?.englishText,
    "they (m.pl.) are"
  );
  assert.equal(
    item.forms.find((form) => form.id === "present_feminine_plural")?.englishText,
    "they (f.pl.) are"
  );
  assert.equal(
    item.forms.find((form) => form.id === "past_first_person_plural")?.englishText,
    "we were"
  );
});

test("starter conjugation verbs can carry stored niqqud across their visible forms", () => {
  const deck = verbApi.buildVerbConjugationDeck({ vocabulary: [] });
  const expected = [
    ["starter-verb-lisgor--sense-1", "present_masculine_singular", "סוֹגֵר"],
    ["starter-verb-liftoach--sense-1", "future_first_person_singular", "אֶפְתַּח"],
    ["starter-verb-lichtov--sense-1", "past_third_person_plural", "כָּתְבוּ"],
    ["starter-verb-lishmor--sense-1", "future_second_person_plural", "תִּשְׁמְרוּ"],
    ["starter-verb-lilmod--sense-1", "future_first_person_singular", "אֶלְמַד"],
    ["starter-verb-leechol--sense-1", "future_first_person_singular", "אֹכַל"],
    ["starter-verb-lishtot--sense-1", "present_feminine_singular", "שׁוֹתָה"],
    ["starter-verb-lesachek--sense-1", "past_third_person_masculine_singular", "שִׂיחֵק"],
    ["starter-verb-laavod--sense-1", "future_first_person_singular", "אֶעֱבֹד"],
    ["starter-verb-lagur--sense-1", "future_first_person_singular", "אָגוּר"],
    ["starter-verb-larutz--sense-1", "future_first_person_singular", "אָרוּץ"],
    ["starter-verb-lavo--sense-1", "future_third_person_plural", "יָבוֹאוּ"],
    ["starter-verb-lihyot--sense-1", "future_first_person_singular", "אֶהְיֶה"],
    ["starter-verb-lirot--sense-1", "present_feminine_singular", "רוֹאָה"],
    ["starter-verb-lakachat--sense-1", "future_first_person_singular", "אֶקַּח"],
    ["starter-verb-lasim--sense-1", "present_feminine_plural", "שָׂמוֹת"],
    ["starter-verb-latet--sense-1", "future_first_person_singular", "אֶתֵּן"],
    ["starter-verb-lalechet--sense-1", "future_first_person_plural", "נֵלֵךְ"],
    ["starter-verb-lehagid--sense-1", "future_first_person_singular", "אַגִּיד"],
    ["starter-verb-laamod--sense-1", "future_second_person_plural", "תַּעַמְדוּ"],
    ["starter-verb-lashevet--sense-1", "present_masculine_singular", "יוֹשֵׁב"],
    ["starter-verb-lekhabot--sense-1", "present_masculine_singular", "מְכַבֶּה"],
    ["starter-verb-letzanen--sense-1", "future_first_person_singular", "אֲצַנֵּן"],
    ["starter-verb-letachnen--sense-1", "future_first_person_singular", "אֲתַכְנֵן"],
  ];

  expected.forEach(([itemId, formId, expectedNiqqud]) => {
    const item = deck.find((entry) => entry.id === itemId);
    assert.ok(item, `${itemId} should appear in the starter deck`);
    assert.equal(item.formSource, "authoritative");
    assert.equal(
      String(item.forms.find((form) => form.id === formId)?.valueNiqqud || "").normalize("NFC"),
      expectedNiqqud.normalize("NFC")
    );
    assert.equal(
      item.forms.every((form) => /[\u0591-\u05C7]/.test(String(form.valueNiqqud || ""))),
      true,
      `${itemId} should expose niqqud on every learner-facing form`
    );
  });
});

test("starter plan verb appears in conjugation with correct English labels", () => {
  const deck = verbApi.buildVerbConjugationDeck({ vocabulary: [] });
  const item = deck.find((entry) => entry.id === "starter-verb-letachnen--sense-1");

  assert.ok(item);
  assert.equal(item.formSource, "authoritative");
  assert.equal(item.word.he, "לתכנן");
  assert.equal(item.word.en, "to plan");
  assert.equal(
    item.forms.find((form) => form.id === "present_masculine_singular")?.englishText,
    "he plans"
  );
  assert.equal(
    item.forms.find((form) => form.id === "past_first_person_singular")?.englishText,
    "I planned"
  );
  assert.equal(
    item.forms.find((form) => form.id === "future_first_person_singular")?.englishText,
    "I will plan"
  );
});

test("starter plan verb keeps quadriliteral metadata and formal future plural forms", () => {
  const seedEntry = verbApi.getSeedVerbEntries().find((entry) => entry.id === "starter-verb-letachnen");
  assert.ok(seedEntry);
  assert.deepEqual(seedEntry.root, ["ת", "כ", "נ", "נ"]);

  const deck = verbApi.buildVerbConjugationDeck({ vocabulary: [], formalFuturePlural: true });
  const item = deck.find((entry) => entry.id === "starter-verb-letachnen--sense-1");
  assert.ok(item);
  assert.equal(
    String(item.forms.find((form) => form.id === "future_second_person_feminine_plural")?.valueNiqqud || "").normalize("NFC"),
    "תְּתַכְנֵנָּה".normalize("NFC")
  );
  assert.equal(
    String(item.forms.find((form) => form.id === "future_third_person_feminine_plural")?.valueNiqqud || "").normalize("NFC"),
    "יְתַכְנֵנָּה".normalize("NFC")
  );
});

test("starter run verb appears in conjugation with the expected English labels", () => {
  const deck = verbApi.buildVerbConjugationDeck({ vocabulary: [] });
  const item = deck.find((entry) => entry.id === "starter-verb-larutz--sense-1");

  assert.ok(item);
  assert.equal(item.formSource, "authoritative");
  assert.equal(item.word.he, "לרוץ");
  assert.equal(item.word.en, "to run");
  assert.equal(
    item.forms.find((form) => form.id === "present_masculine_singular")?.englishText,
    "he runs"
  );
  assert.equal(
    item.forms.find((form) => form.id === "past_third_person_masculine_singular")?.englishText,
    "he ran"
  );
  assert.equal(
    item.forms.find((form) => form.id === "future_first_person_singular")?.englishText,
    "I will run"
  );
});

test("the full conjugation deck now exposes niqqud on every learner-facing form", () => {
  const deck = verbApi.buildVerbConjugationDeck({ vocabulary: [] });

  assert.equal(deck.length > 0, true);
  assert.equal(
    deck.every((item) => item.forms.every((form) => /[\u0591-\u05C7]/.test(String(form.valueNiqqud || "")))),
    true
  );
});

test("the full conjugation deck now exposes stored infinitive niqqud for prompt surfaces", () => {
  const deck = verbApi.buildVerbConjugationDeck({ vocabulary: [] });
  assert.equal(deck.length > 0, true);
  assert.equal(
    deck.every((item) => {
      const plain = String(item.word.he || "").normalize("NFC");
      const marked = String(item.word.heNiqqud || "").normalize("NFC");
      return Boolean(plain) && Boolean(marked) && plain !== marked;
    }),
    true
  );
});

test("string-backed stored verb forms preserve separate plain and niqqud values", () => {
  const deck = verbApi.buildVerbConjugationDeck({ vocabulary: [] });
  const item = deck.find((entry) => entry.id === "starter-verb-leshacharer--sense-1");

  assert.ok(item);
  const present = item.forms.find((form) => form.id === "present_masculine_singular");
  assert.ok(present);
  assert.equal(present.valuePlain, "משחרר");
  assert.equal(
    String(present.valueNiqqud || "").normalize("NFC"),
    "מְשַׁחְרֵר".normalize("NFC")
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
  assert.equal(entriesById.get("starter-verb-lichtov--sense-1")?.availability?.translationQuiz, false);
  assert.equal(entriesById.get("starter-verb-lichtov--sense-1")?.availability?.sentenceHints, true);
  assert.equal(entriesById.get("starter-verb-larutz--sense-1")?.availability?.translationQuiz, false);
  assert.equal(entriesById.get("starter-verb-larutz--sense-1")?.availability?.sentenceHints, true);
  assert.equal(entriesById.get("starter-verb-letachnen--sense-1")?.availability?.translationQuiz, false);
  assert.equal(entriesById.get("starter-verb-letachnen--sense-1")?.availability?.sentenceHints, true);
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

test("past-tense labels for ambiguous put/put verbs include (past) annotation", () => {
  const deck = verbApi.buildVerbConjugationDeck({
    vocabulary: [],
    entries: [
      {
        id: "test-lasim",
        lemma: "לשים",
        root: ["ש", "י", "מ"],
        binyan: "paal",
        regularity: "irregular",
        conjugation_mode: "curated",
        senses: [sense("to put", null, false)],
        forms: forms(
          {
            masculine_singular: "שם",
            feminine_singular: "שמה",
            masculine_plural: "שמים",
            feminine_plural: "שמות",
          },
          {
            first_person_singular: "שמתי",
            second_person_masculine_singular: "שמת",
            second_person_feminine_singular: "שמת",
            third_person_masculine_singular: "שם",
            third_person_feminine_singular: "שמה",
            first_person_plural: "שמנו",
            second_person_masculine_plural: "שמתם",
            second_person_feminine_plural: "שמתן",
            third_person_plural: "שמו",
          },
          {
            first_person_singular: "אשים",
            second_person_masculine_singular: "תשים",
            second_person_feminine_singular: "תשימי",
            third_person_masculine_singular: "ישים",
            third_person_feminine_singular: "תשים",
            first_person_plural: "נשים",
            second_person_plural: "תשימו",
            third_person_plural: "ישימו",
          }
        ),
        generated_forms: {},
        review_status: "approved",
        notes: "",
        examples: [],
        difficulty_level: 2,
        tags: ["test"],
        personal_priority: 80,
        category: "starter",
        source_word_ids: [],
        source: "test",
      },
    ],
  });

  const item = deck.find((entry) => entry.id.startsWith("test-lasim"));
  assert.ok(item);
  // Past labels should include "(past)" since "put" === "put" (same past as present base)
  assert.equal(
    item.forms.find((f) => f.id === "past_first_person_plural")?.englishText,
    "we put (past)"
  );
  assert.equal(
    item.forms.find((f) => f.id === "past_third_person_masculine_singular")?.englishText,
    "he put (past)"
  );
  // Future labels should NOT have the annotation
  assert.equal(
    item.forms.find((f) => f.id === "future_first_person_plural")?.englishText,
    "we will put"
  );
  // Present labels should NOT have the annotation
  assert.equal(
    item.forms.find((f) => f.id === "present_masculine_singular")?.englishText,
    "he puts"
  );
});
