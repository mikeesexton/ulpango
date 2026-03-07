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

test("removed standalone vocabulary words are absent from the seed list", () => {
  const vocabulary = loadVocabulary();
  const removedHebrew = new Set(["רופא", "משרד", "פגישה", "פרויקט", "דרכון", "ויזה"]);

  vocabulary.forEach((word) => {
    assert.equal(removedHebrew.has(word.he), false, `unexpected removed word still present: ${word.he}`);
    assert.equal(word.he.includes("משרד"), false, `unexpected משרד entry still present: ${word.he}`);
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
