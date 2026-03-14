const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function runScriptInContext(scriptPath, context) {
  const source = fs.readFileSync(scriptPath, "utf8");
  vm.runInContext(source, context, { filename: scriptPath });
}

function loadAbbreviationContext() {
  const root = path.join(__dirname, "..");
  const context = { console, Math };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);

  runScriptInContext(path.join(root, "abbreviation-data.js"), context);
  runScriptInContext(path.join(root, "app", "abbreviation.js"), context);

  return context;
}

test("playable abbreviations use geresh or gereshayim and do not overlap exactly", () => {
  const context = loadAbbreviationContext();
  const rows = context.IvriQuestAbbreviations.getAbbreviations();
  const playable = rows.filter((entry) => entry?.availability?.abbreviationQuiz !== false);

  assert.equal(playable.some((entry) => /\./.test(String(entry.abbr || ""))), false);

  const counts = new Map();
  playable.forEach((entry) => {
    const key = String(entry.abbr || "");
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const duplicates = [...counts.entries()].filter(([, count]) => count > 1);
  assert.deepEqual(duplicates, []);
});

test("business-friendly collision handling keeps normalized business forms and suppresses overlaps", () => {
  const context = loadAbbreviationContext();
  const rows = context.IvriQuestAbbreviations.getAbbreviations();
  const deck = context.IvriQuestApp.abbreviation.prepareAbbreviationDeck(rows);
  const deckIds = new Set(deck.map((entry) => entry.id));
  const byId = new Map(rows.map((entry) => [entry.id, entry]));

  assert.equal(byId.get("abbr-114")?.abbr, "ח״פ");
  assert.equal(byId.get("abbr-115")?.abbr, "ע״מ");
  assert.equal(byId.get("abbr-116")?.abbr, "ע״פ");

  ["abbr-019", "abbr-020", "abbr-022", "abbr-098", "abbr-135"].forEach((entryId) => {
    assert.equal(deckIds.has(entryId), false, `${entryId} should be hidden from the playable deck`);
  });

  ["abbr-114", "abbr-115", "abbr-116"].forEach((entryId) => {
    assert.equal(deckIds.has(entryId), true, `${entryId} should remain playable`);
  });
});

test("phase 1 abbreviation expansions include safe niqqud on the full expansion only", () => {
  const context = loadAbbreviationContext();
  const rows = context.IvriQuestAbbreviations.getAbbreviations();
  const byId = new Map(rows.map((entry) => [entry.id, entry]));
  const phaseOneIds = [
    "abbr-004",
    "abbr-005",
    "abbr-006",
    "abbr-010",
    "abbr-013",
    "abbr-014",
    "abbr-015",
    "abbr-016",
    "abbr-017",
    "abbr-018",
    "abbr-021",
    "abbr-024",
    "abbr-025",
    "abbr-026",
    "abbr-027",
    "abbr-083",
    "abbr-084",
    "abbr-085",
    "abbr-086",
    "abbr-087",
    "abbr-088",
    "abbr-093",
    "abbr-094",
    "abbr-096",
  ];

  phaseOneIds.forEach((entryId) => {
    const entry = byId.get(entryId);
    assert.ok(entry, `${entryId} should exist`);
    assert.ok(String(entry.expansionHeNiqqud || "").trim(), `${entryId} should have expansionHeNiqqud`);
    assert.equal(/[\u0591-\u05C7]/.test(String(entry.abbr || "")), false, `${entryId} abbreviation should not carry niqqud`);
  });
});
