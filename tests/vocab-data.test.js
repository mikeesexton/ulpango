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
