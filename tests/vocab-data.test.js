const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadVocabulary() {
  const sourcePath = path.join(__dirname, "..", "vocab-data.js");
  const source = fs.readFileSync(sourcePath, "utf8");
  const context = {
    window: {},
    globalThis: {},
  };

  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(source, context, { filename: sourcePath });

  return context.IvriQuestVocab.getBaseVocabulary();
}

test("basic standalone vocabulary stays in the lexicon but is unavailable for translation quiz", () => {
  const vocabulary = loadVocabulary();
  const dictionaryOnlyHebrew = new Set(["סכין", "מקרר", "כיור", "רופא", "אחות", "בית חולים", "משרד", "פגישה", "פרויקט", "דרכון", "ויזה"]);
  const entriesByHebrew = new Map(vocabulary.map((word) => [word.he, word]));

  dictionaryOnlyHebrew.forEach((hebrew) => {
    const word = entriesByHebrew.get(hebrew);
    assert.ok(word, `expected lexicon entry for ${hebrew}`);
    assert.equal(word.availability?.translationQuiz, false, `expected ${hebrew} to stay out of translation quiz`);
    assert.equal(word.availability?.sentenceHints, true, `expected ${hebrew} to stay available for sentence hints`);
  });

  assert.equal(entriesByHebrew.get("מצקת")?.availability?.translationQuiz, true);
  assert.equal(entriesByHebrew.get("מצקת")?.availability?.sentenceHints, true);
});

test("conjugation-first cooking verbs stay out of translation quiz while לצנן keeps curated distractors", () => {
  const vocabulary = loadVocabulary();
  const entriesByHebrew = new Map(vocabulary.map((word) => [word.he, word]));

  assert.equal(entriesByHebrew.get("לסנן")?.availability?.translationQuiz, false);
  assert.equal(entriesByHebrew.get("לקרר")?.availability?.translationQuiz, false);
  assert.equal(entriesByHebrew.get("לצנן")?.availability?.translationQuiz, true);
  assert.deepEqual(JSON.parse(JSON.stringify(entriesByHebrew.get("לצנן")?.translationQuizDistractors)), {
    english: ["to refrigerate", "to freeze", "to defrost"],
    hebrew: ["לקרר", "להקפיא", "להפשיר"],
  });
});

test("duplicate Hebrew glosses are collapsed into shared translations", () => {
  const vocabulary = loadVocabulary();
  const entriesByHebrew = new Map();

  vocabulary.forEach((word) => {
    const bucket = entriesByHebrew.get(word.he) || [];
    bucket.push(word.en);
    entriesByHebrew.set(word.he, bucket);
  });

  assert.deepEqual(entriesByHebrew.get("חובה"), ["obligation / mandatory"]);
  assert.deepEqual(entriesByHebrew.get("לערבב"), ["to stir / mix"]);
  assert.deepEqual(entriesByHebrew.get("להקציף"), ["to beat / whip"]);
  assert.deepEqual(entriesByHebrew.get("לגרד"), ["to grate / scrape"]);
});

test("מוצאי שבת keeps its Saturday-night translation and custom Shabbat distractors", () => {
  const vocabulary = loadVocabulary();
  const entry = vocabulary.find((word) => word.he === "מוצאי שבת");

  assert.ok(entry);
  assert.equal(entry.en, "Saturday night");
  assert.deepEqual(JSON.parse(JSON.stringify(entry.translationQuizDistractors)), {
    english: ["Friday night", "Shabbat morning", "Shabbat afternoon"],
    hebrew: ["ליל שבת", "שבת בבוקר", "שבת בלילה"],
  });
});
