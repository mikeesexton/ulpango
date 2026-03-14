const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function runScriptInContext(scriptPath, context) {
  const source = fs.readFileSync(scriptPath, "utf8");
  vm.runInContext(source, context, { filename: scriptPath });
}

test("hebrew idioms data is exposed on globalThis for browser consumers", () => {
  const idiomsPath = path.join(__dirname, "..", "hebrew-idioms.js");
  const context = { console, Math };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);

  runScriptInContext(idiomsPath, context);

  assert.ok(Array.isArray(context.HEBREW_IDIOMS));
  assert.ok(context.HEBREW_IDIOMS.length > 0);
});

test("advanced conjugation builds a non-empty deck with the real idiom source file", () => {
  const root = path.join(__dirname, "..");
  const context = { console, Math };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);

  runScriptInContext(path.join(root, "app", "constants.js"), context);
  runScriptInContext(path.join(root, "app", "utils.js"), context);
  runScriptInContext(path.join(root, "hebrew-idioms.js"), context);
  runScriptInContext(path.join(root, "app", "adv-conj.js"), context);

  context.IvriQuestApp.runtime = {
    constants: context.IvriQuestApp.constants,
    helpers: {},
  };

  const deck = context.IvriQuestApp.advConj.buildAdvConjDeck();
  assert.ok(deck.length > 0);
});
