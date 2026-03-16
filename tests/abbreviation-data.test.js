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

const PHASE_ONE_IDS = [
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

const PHASE_TWO_IDS = [
  "abbr-001",
  "abbr-002",
  "abbr-003",
  "abbr-079",
  "abbr-080",
  "abbr-089",
  "abbr-090",
  "abbr-091",
  "abbr-092",
  "abbr-097",
  "abbr-099",
  "abbr-100",
  "abbr-101",
  "abbr-102",
  "abbr-103",
  "abbr-104",
  "abbr-105",
  "abbr-173",
  "abbr-174",
  "abbr-176",
  "abbr-184",
  "abbr-185",
  "abbr-186",
  "abbr-207",
];

const PHASE_THREE_IDS = [
  "abbr-109",
  "abbr-112",
  "abbr-117",
  "abbr-118",
  "abbr-120",
  "abbr-126",
  "abbr-127",
  "abbr-129",
  "abbr-130",
  "abbr-131",
  "abbr-132",
];

const PHASE_FOUR_IDS = [
  "abbr-110",
  "abbr-111",
  "abbr-113",
  "abbr-172",
];

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

  PHASE_ONE_IDS.forEach((entryId) => {
    const entry = byId.get(entryId);
    assert.ok(entry, `${entryId} should exist`);
    assert.ok(String(entry.expansionHeNiqqud || "").trim(), `${entryId} should have expansionHeNiqqud`);
    assert.equal(/[\u0591-\u05C7]/.test(String(entry.abbr || "")), false, `${entryId} abbreviation should not carry niqqud`);
  });
});

test("phase 2 abbreviation expansions include official-first niqqud on the full expansion only", () => {
  const context = loadAbbreviationContext();
  const rows = context.IvriQuestAbbreviations.getAbbreviations();
  const byId = new Map(rows.map((entry) => [entry.id, entry]));

  PHASE_TWO_IDS.forEach((entryId) => {
    const entry = byId.get(entryId);
    assert.ok(entry, `${entryId} should exist`);
    assert.ok(String(entry.expansionHeNiqqud || "").trim(), `${entryId} should have expansionHeNiqqud`);
    assert.equal(/[\u0591-\u05C7]/.test(String(entry.abbr || "")), false, `${entryId} abbreviation should not carry niqqud`);
  });
});

test("all niqqud-bearing abbreviation expansions include provenance URLs", () => {
  const context = loadAbbreviationContext();
  const rows = context.IvriQuestAbbreviations.getAbbreviations();
  const niqqudEntries = rows.filter((entry) => String(entry.expansionHeNiqqud || "").trim());

  assert.ok(niqqudEntries.length > 0);
  niqqudEntries.forEach((entry) => {
    assert.match(
      String(entry.expansionHeNiqqudSource || "").trim(),
      /^https?:\/\//,
      `${entry.id} should have an expansionHeNiqqudSource URL`
    );
  });
});

test("phase 3 abbreviation expansions stay inside the Academy-backed institutional batch", () => {
  const context = loadAbbreviationContext();
  const rows = context.IvriQuestAbbreviations.getAbbreviations();
  const byId = new Map(rows.map((entry) => [entry.id, entry]));

  PHASE_THREE_IDS.forEach((entryId) => {
    const entry = byId.get(entryId);
    assert.ok(entry, `${entryId} should exist`);
    assert.ok(String(entry.expansionHeNiqqud || "").trim(), `${entryId} should have expansionHeNiqqud`);
    assert.match(
      String(entry.expansionHeNiqqudSource || ""),
      /^https:\/\/terms\.hebrew-academy\.org\.il\//,
      `${entryId} should use an Academy terms source`
    );
    assert.equal(/[\u0591-\u05C7]/.test(String(entry.abbr || "")), false, `${entryId} abbreviation should not carry niqqud`);
  });
});

test("phase 4 abbreviation expansions use exact Academy-backed niqqud for the new finance and health tranche", () => {
  const context = loadAbbreviationContext();
  const rows = context.IvriQuestAbbreviations.getAbbreviations();
  const byId = new Map(rows.map((entry) => [entry.id, entry]));

  PHASE_FOUR_IDS.forEach((entryId) => {
    const entry = byId.get(entryId);
    assert.ok(entry, `${entryId} should exist`);
    assert.ok(String(entry.expansionHeNiqqud || "").trim(), `${entryId} should have expansionHeNiqqud`);
    assert.match(
      String(entry.expansionHeNiqqudSource || ""),
      /^https:\/\/terms\.hebrew-academy\.org\.il\//,
      `${entryId} should use an Academy terms source`
    );
    assert.equal(/[\u0591-\u05C7]/.test(String(entry.abbr || "")), false, `${entryId} abbreviation should not carry niqqud`);
  });
});
