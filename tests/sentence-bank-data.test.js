const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadSentenceBankApi() {
  const sourcePath = path.join(__dirname, "..", "sentence-bank-data.js");
  const context = {
    console,
    globalThis: null,
    window: null,
  };
  context.globalThis = context;
  context.window = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(sourcePath, "utf8"), context, { filename: sourcePath });
  return context.IvriQuestSentenceBank;
}

function sanitizeTokenList(list) {
  return Array.isArray(list)
    ? list.map((value) => String(value || "").trim()).filter(Boolean)
    : [];
}

function isAttachableSentenceSuffix(text) {
  const trimmed = String(text || "").trim();
  return Boolean(trimmed) && /^[,.;:!?…)\]"'׳״-]+$/.test(trimmed);
}

function buildSentenceFrame(sentenceText, targetTokens) {
  const fullText = String(sentenceText || "");
  const tokens = sanitizeTokenList(targetTokens);
  const pieces = [];
  let cursor = 0;

  for (let index = 0; index < tokens.length; index += 1) {
    const tokenText = tokens[index];
    const tokenIndex = fullText.indexOf(tokenText, cursor);
    if (tokenIndex === -1) {
      return { failed: true, pieces: [], trailingText: "" };
    }
    const separatorText = fullText.slice(cursor, tokenIndex);
    const previousPiece = pieces[pieces.length - 1] || null;
    const shouldAttachSeparator = previousPiece && isAttachableSentenceSuffix(separatorText);
    pieces.push({
      beforeText: shouldAttachSeparator ? "" : separatorText,
      tokenText,
      afterText: "",
    });
    if (shouldAttachSeparator) {
      previousPiece.afterText = `${previousPiece.afterText || ""}${separatorText}`;
    }
    cursor = tokenIndex + tokenText.length;
  }

  let trailingText = fullText.slice(cursor);
  if (pieces.length && isAttachableSentenceSuffix(trailingText)) {
    pieces[pieces.length - 1].afterText = `${pieces[pieces.length - 1].afterText || ""}${trailingText}`;
    trailingText = "";
  }

  return {
    failed: false,
    pieces,
    trailingText,
  };
}

function getStaticEnglishWordChunks(entry) {
  const frame = buildSentenceFrame(entry.english, entry.english_tokens);
  if (frame.failed) {
    return [{ where: "unmatched", text: "__TOKEN_MISMATCH__" }];
  }
  const chunks = [];
  frame.pieces.forEach((piece, index) => {
    if (/[A-Za-z0-9]/.test(piece.beforeText)) {
      chunks.push({ where: `before:${index}`, text: piece.beforeText });
    }
    if (/[A-Za-z0-9]/.test(piece.afterText)) {
      chunks.push({ where: `after:${index}`, text: piece.afterText });
    }
  });
  if (/[A-Za-z0-9]/.test(frame.trailingText)) {
    chunks.push({ where: "trailing", text: frame.trailingText });
  }
  return chunks;
}

const NUANCE_GUARDRAILS = [
  {
    label: "כבר",
    matches(tokens) {
      return tokens.includes("כבר");
    },
    englishCue: /\b(already|right now)\b|on my way/i,
    noteCue: /\b(already|urgency)\b|on (my )?way/i,
  },
  {
    label: "נו",
    matches(tokens) {
      return tokens.includes("נו");
    },
    englishCue: /\b(well|come on)\b/i,
    noteCue: /\b(well|come on|impatient|impatience|so\?)\b/i,
  },
  {
    label: "סתם",
    matches(tokens) {
      return tokens.includes("סתם");
    },
    englishCue: /\bjust\b|for no reason/i,
    noteCue: /\bjust\b|for no reason|casual/i,
  },
  {
    label: "ממש",
    matches(tokens) {
      return tokens.includes("ממש");
    },
    englishCue: /\b(really|totally|very)\b/i,
    noteCue: /\b(really|totally|very)\b/i,
  },
  {
    label: "לגמרי",
    matches(tokens) {
      return tokens.includes("לגמרי");
    },
    englishCue: /\b(entirely|completely|totally)\b/i,
    noteCue: /\b(entirely|completely|totally)\b/i,
  },
  {
    label: "כרגע",
    matches(tokens) {
      return tokens.includes("כרגע");
    },
    englishCue: /\b(right now|currently|at the moment)\b/i,
    noteCue: /\b(right now|currently|at the moment)\b/i,
  },
  {
    label: "יוצא לדרך",
    matches(tokens) {
      return tokens.includes("יוצא") && tokens.includes("לדרך");
    },
    englishCue: /\b(on my way|heading out)\b/i,
    noteCue: /\b(on my way|heading out)\b/i,
  },
];

const ALIGNMENT_GUARDRAILS = [
  {
    label: "מכך",
    matches(tokens) {
      return tokens.includes("מכך");
    },
    englishCue: /\bfrom (this|that|it)\b/i,
    noteCue: /\bfrom (this|that|it)\b|מכך/i,
  },
  {
    label: "מכאן",
    matches(tokens) {
      return tokens.includes("מכאן");
    },
    englishCue: /\b(near here|from here|far from here)\b/i,
    noteCue: /\bfrom here\b|מכאן/i,
  },
  {
    label: "בהקדם",
    matches(tokens) {
      return tokens.includes("בהקדם");
    },
    englishCue: /\b(shortly|as soon as possible)\b/i,
    noteCue: /\b(shortly|as soon as possible)\b|בהקדם/i,
  },
  {
    label: "כשיהיו",
    matches(tokens) {
      return tokens.includes("כשיהיו");
    },
    englishCue: /\bwhen there (are|will be)\b/i,
    noteCue: /\bwhen there (are|will be)\b|כשיהיו/i,
  },
  {
    label: "בפועל",
    matches(tokens) {
      return tokens.includes("בפועל");
    },
    englishCue: /\bin practice\b/i,
    noteCue: /\bin practice\b|בפועל/i,
  },
  {
    label: "לעומק",
    matches(tokens) {
      return tokens.includes("לעומק");
    },
    englishCue: /\bin depth\b/i,
    noteCue: /\bin depth\b|לעומק/i,
  },
  {
    label: "מדובר",
    matches(tokens) {
      return tokens.includes("מדובר");
    },
    englishCue: /\bthis is\b|\bit concerns\b/i,
    noteCue: /\bthis is about\b|\bit concerns\b|מדובר/i,
  },
];

const PHRASE_COMPACTED_ENTRY_IDS = [
  "colloquial_02",
  "colloquial_01",
  "colloquial_04",
  "colloquial_07",
  "colloquial_16",
  "colloquial_20",
  "everyday_04",
  "everyday_05",
  "everyday_06",
  "everyday_08",
  "everyday_09",
  "everyday_12",
  "everyday_14",
  "everyday_15",
  "everyday_16",
  "everyday_17",
  "everyday_18",
  "everyday_19",
  "professional_01",
  "professional_02",
  "professional_03",
  "professional_04",
  "professional_05",
  "professional_06",
  "professional_08",
  "formal_03",
  "formal_04",
  "formal_05",
  "formal_06",
  "formal_07",
  "formal_09",
];

const CHUNKING_AUDIT_ENTRIES = [
  {
    id: "formal_06",
    requiredTokens: ["The analysis", "is based on", "several assumptions", "may not be"],
    forbiddenTokens: ["The", "analysis", "is", "based", "on", "several", "assumptions", "may", "not", "be"],
  },
  {
    id: "professional_08",
    requiredTokens: ["Can we get", "on this matter", "It's not", "entirely clear"],
    forbiddenTokens: ["Can", "we", "get", "It's", "not", "entirely", "clear"],
  },
  {
    id: "colloquial_07",
    requiredTokens: ["Are you", "right now", "That sounds", "completely ridiculous", "to me"],
    forbiddenTokens: ["Are", "you", "right", "now", "That", "sounds", "completely", "ridiculous", "to", "me"],
  },
  {
    id: "everyday_09",
    requiredTokens: ["Can I get", "the bill"],
    forbiddenTokens: ["Can", "I", "get", "the", "bill"],
  },
  {
    id: "everyday_12",
    requiredTokens: ["How long", "does it take", "to get there", "by bus"],
    forbiddenTokens: ["How", "long", "does", "it", "take", "to", "get", "there", "by", "bus"],
  },
  {
    id: "colloquial_20",
    requiredTokens: ["hold on", "I'll get back", "to you", "in a sec"],
    forbiddenTokens: ["hold", "on", "I'll", "get", "back", "to", "you", "in", "a", "sec"],
  },
  {
    id: "everyday_04",
    requiredTokens: ["Do you have", "a pen", "I can use", "I need to write"],
    forbiddenTokens: ["Do", "you", "have", "a", "pen", "I", "can", "use", "need", "to", "write"],
  },
  {
    id: "everyday_05",
    requiredTokens: ["We're meeting", "near the station", "don't be late"],
    forbiddenTokens: ["We're", "meeting", "near", "the", "station", "don't", "be", "late"],
  },
  {
    id: "everyday_14",
    requiredTokens: ["The train", "is delayed", "take a taxi"],
    forbiddenTokens: ["The", "train", "is", "delayed", "take", "a", "taxi"],
  },
  {
    id: "everyday_19",
    requiredTokens: ["Turn it down", "a bit", "I'm on the phone"],
    forbiddenTokens: ["Turn", "it", "down", "a", "bit", "I'm", "on", "the", "phone"],
  },
  {
    id: "colloquial_01",
    requiredTokens: ["What's going on", "with you", "I haven't heard", "from you", "all day"],
    forbiddenTokens: ["What's", "going", "on", "with", "you", "heard", "from", "all", "day"],
  },
  {
    id: "professional_03",
    requiredTokens: ["doesn't align", "with the defined requirements", "we'll need to", "update it"],
    forbiddenTokens: ["doesn't", "align", "with", "the", "defined", "requirements", "we'll", "need", "to", "update", "it"],
  },
  {
    id: "formal_05",
    requiredTokens: ["There is", "significant variation", "between the groups", "it must be explained"],
    forbiddenTokens: ["There", "is", "significant", "variation", "between", "the", "groups", "it", "must", "be", "explained"],
  },
  {
    id: "formal_07",
    requiredTokens: ["The different options", "should be examined", "in depth", "before choosing"],
    forbiddenTokens: ["The", "different", "options", "should", "be", "examined", "in", "depth", "before", "choosing"],
  },
  {
    id: "formal_09",
    requiredTokens: ["This is", "a complex", "multi-dimensional phenomenon", "that is difficult", "to define simply"],
    forbiddenTokens: ["This", "is", "a", "complex", "multi-dimensional", "phenomenon", "that", "difficult", "to", "define", "simply"],
  },
];

test("sentence bank data exposes 60 complete entries with notes, distractors, and tokens", () => {
  const api = loadSentenceBankApi();
  assert.ok(api);
  assert.equal(typeof api.getSentenceBank, "function");

  const entries = api.getSentenceBank();
  assert.equal(entries.length, 60);
  assert.equal(new Set(entries.map((entry) => entry.id)).size, 60);
  assert.equal(entries.filter((entry) => String(entry.notes || "").trim()).length, 60);

  entries.forEach((entry) => {
    assert.ok(entry.id);
    assert.ok(entry.category);
    assert.match(String(entry.english), /\S/);
    assert.match(String(entry.hebrew), /\S/);
    assert.ok(Array.isArray(entry.english_tokens));
    assert.ok(Array.isArray(entry.hebrew_tokens));
    assert.ok(Array.isArray(entry.english_distractors));
    assert.ok(Array.isArray(entry.hebrew_distractors));
    assert.ok(entry.english_tokens.length > 0);
    assert.ok(entry.hebrew_tokens.length > 0);
    assert.ok(entry.english_distractors.length > 0);
    assert.ok(entry.hebrew_distractors.length > 0);
    assert.ok([1, 2, 3].includes(entry.difficulty));
  });
});

test("sentence bank data avoids exact-synonym distractors for curated formal entries", () => {
  const entries = loadSentenceBankApi().getSentenceBank();
  const byId = new Map(entries.map((entry) => [entry.id, entry]));

  assert.ok(byId.has("formal_04"));
  assert.ok(byId.has("formal_06"));
  assert.ok(byId.has("formal_08"));

  assert.equal(byId.get("formal_04").hebrew_distractors.includes("איך"), false);
  assert.equal(byId.get("formal_04").hebrew_distractors.includes("מדוע"), true);

  assert.equal(byId.get("formal_06").hebrew_distractors.includes("נכונות"), false);
  assert.equal(byId.get("formal_06").english_distractors.includes("correct"), false);
  assert.equal(byId.get("formal_06").hebrew_distractors.includes("מוכחות"), true);
  assert.equal(byId.get("formal_06").english_distractors.includes("fully reliable"), true);

  assert.equal(byId.get("formal_08").hebrew_distractors.includes("אבל"), false);
  assert.equal(byId.get("formal_08").english_distractors.includes("however"), false);
  assert.equal(byId.get("formal_08").hebrew_distractors.includes("לכן"), true);
  assert.equal(byId.get("formal_08").english_distractors.includes("therefore"), true);
});

test("sentence bank data compacts low-value English glue into selectable phrase chips", () => {
  const byId = new Map(loadSentenceBankApi().getSentenceBank().map((entry) => [entry.id, entry]));
  const englishTokens = (id) => Array.from(byId.get(id).english_tokens);

  assert.equal(byId.get("colloquial_02").english, "I don't have energy for this right now, we'll talk later.");
  assert.deepEqual(englishTokens("colloquial_02"), ["I", "don't", "have", "energy", "for this", "right now", "we'll", "talk", "later"]);

  assert.deepEqual(englishTokens("colloquial_07"), ["Are you", "serious", "right now", "That sounds", "completely ridiculous", "to me"]);
  assert.deepEqual(englishTokens("everyday_09"), ["Can I get", "the bill", "please"]);
  assert.deepEqual(englishTokens("everyday_12"), ["How long", "does it take", "to get there", "by bus"]);
  assert.deepEqual(englishTokens("colloquial_20"), ["Bro", "hold on", "I'll get back", "to you", "in a sec"]);
  assert.deepEqual(englishTokens("professional_08"), ["Can we get", "clarification", "on this matter", "It's not", "entirely clear"]);
  assert.deepEqual(englishTokens("formal_06"), ["The analysis", "is based on", "several assumptions", "which", "may not be", "accurate"]);

  assert.deepEqual(englishTokens("everyday_17"), ["The soap", "ran out", "we need", "to buy", "more"]);
  assert.deepEqual(englishTokens("professional_01"), ["I'll", "review", "the document", "and", "get back", "to you", "shortly"]);
  assert.deepEqual(englishTokens("professional_04"), ["Is there an update", "on the project", "I", "want", "to understand", "where it stands"]);
  assert.deepEqual(englishTokens("professional_06"), ["We're", "working on it", "right now", "we'll", "update", "when there are", "results"]);
  assert.deepEqual(englishTokens("formal_03"), ["It", "can", "be", "inferred", "from this", "that", "the", "model", "is", "not", "stable", "under", "certain", "conditions"]);
  assert.deepEqual(englishTokens("formal_04"), ["The central question", "is", "how", "to implement", "this", "in practice", "not", "just", "in theory"]);
});

test("sentence bank data keeps newly audited english entries chunked into natural phrase chips", () => {
  const byId = new Map(loadSentenceBankApi().getSentenceBank().map((entry) => [entry.id, entry]));

  CHUNKING_AUDIT_ENTRIES.forEach(({ id, requiredTokens, forbiddenTokens }) => {
    const entry = byId.get(id);
    assert.ok(entry, `missing sentence-bank entry ${id}`);
    const tokens = Array.from(entry.english_tokens || []);

    requiredTokens.forEach((token) => {
      assert.ok(tokens.includes(token), `${id} should include the phrase chip "${token}"`);
    });

    forbiddenTokens.forEach((token) => {
      assert.equal(tokens.includes(token), false, `${id} still uses fragmented token "${token}"`);
    });
  });
});

test("sentence bank data keeps meal expressions as single Hebrew chips", () => {
  const byId = new Map(loadSentenceBankApi().getSentenceBank().map((entry) => [entry.id, entry]));
  const entry = byId.get("everyday_02");

  assert.ok(entry);
  assert.ok(entry.hebrew_tokens.includes("ארוחת ערב"));
  assert.equal(entry.hebrew_tokens.includes("ארוחת"), false);
  assert.equal(entry.hebrew_tokens.includes("ערב"), false);
  assert.ok(entry.hebrew_distractors.includes("ארוחת צהריים"));
  assert.ok(entry.hebrew_distractors.includes("ארוחת בוקר"));
  assert.equal(entry.hebrew_distractors.some((token) => token.includes("_")), false);
});

test("sentence bank data can mark alternate Hebrew answers for gender-ambiguous English prompts", () => {
  const byId = new Map(loadSentenceBankApi().getSentenceBank().map((entry) => [entry.id, entry]));
  const entry = byId.get("colloquial_09");

  assert.ok(entry);
  assert.ok(Array.isArray(entry.hebrew_alternates));
  assert.equal(entry.hebrew_alternates.length, 1);
  assert.equal(entry.hebrew_alternates[0].text, "היא עשתה לי קטע מסריח, אני לא סומכת עליה יותר.");
  assert.deepEqual(Array.from(entry.hebrew_alternates[0].tokens), ["היא", "עשתה", "לי", "קטע", "מסריח", "אני", "לא", "סומכת", "עליה", "יותר"]);
});

test("sentence bank data preserves visible English or note cues for audited Hebrew nuance markers", () => {
  const byId = new Map(loadSentenceBankApi().getSentenceBank().map((entry) => [entry.id, entry]));

  assert.equal(byId.get("everyday_06").english, "I'm running a few minutes late, I'm already on my way.");
  assert.match(byId.get("everyday_06").notes, /\burgency\b/i);
  assert.equal(byId.get("colloquial_04").english, "Wait a second, I'm coming downstairs right now.");
  assert.match(byId.get("colloquial_16").english, /\balready\b/i);
  assert.match(byId.get("colloquial_16").notes, /\bimpatience\b/i);

  byId.forEach((entry) => {
    const tokens = Array.from(entry.hebrew_tokens || []);
    const english = String(entry.english || "");
    const notes = String(entry.notes || "");

    NUANCE_GUARDRAILS.forEach((guardrail) => {
      if (!guardrail.matches(tokens, entry)) return;
      const hasCue = guardrail.englishCue.test(english) || guardrail.noteCue.test(notes);
      assert.ok(
        hasCue,
        `${entry.id} includes ${guardrail.label} but its English sentence and note do not surface that nuance`
      );
    });
  });
});

test("sentence bank data keeps english answer rows fully blank except for punctuation and spacing", () => {
  const byId = new Map(loadSentenceBankApi().getSentenceBank().map((entry) => [entry.id, entry]));
  const englishTokens = (id) => Array.from(byId.get(id).english_tokens);

  assert.equal(byId.get("formal_03").english, "It can be inferred from this that the model is not stable under certain conditions.");
  assert.deepEqual(englishTokens("formal_03"), ["It", "can", "be", "inferred", "from this", "that", "the", "model", "is", "not", "stable", "under", "certain", "conditions"]);
  assert.match(byId.get("formal_03").notes, /\bfrom this\b/i);
  assert.ok(englishTokens("formal_03").includes("from this"));

  assert.equal(byId.get("everyday_08").english, "Is it near here or far from here? I don't know the area.");
  assert.deepEqual(englishTokens("everyday_08"), ["Is", "it", "near here", "or", "far from here", "I", "don't", "know", "the area"]);
  assert.match(byId.get("everyday_08").notes, /\bfrom here\b/i);
  assert.ok(englishTokens("everyday_08").includes("near here"));

  assert.ok(englishTokens("everyday_17").includes("The soap"));
  assert.ok(englishTokens("professional_06").includes("when there are"));

  byId.forEach((entry) => {
    const tokens = Array.from(entry.hebrew_tokens || []);
    const english = String(entry.english || "");
    const notes = String(entry.notes || "");

    ALIGNMENT_GUARDRAILS.forEach((guardrail) => {
      if (!guardrail.matches(tokens, entry)) return;
      const hasCue = guardrail.englishCue.test(english) || guardrail.noteCue.test(notes);
      assert.ok(
        hasCue,
        `${entry.id} includes ${guardrail.label} but its English sentence and note flatten that meaning too much`
      );
    });

    assert.deepEqual(
      getStaticEnglishWordChunks(entry),
      [],
      `${entry.id} still leaves lexical English outside the selectable chips`
    );
  });
});

test("sentence bank data gives phrase-sized distractors to the compacted english banks", () => {
  const byId = new Map(loadSentenceBankApi().getSentenceBank().map((entry) => [entry.id, entry]));

  PHRASE_COMPACTED_ENTRY_IDS.forEach((id) => {
    const entry = byId.get(id);
    if (!entry.english_tokens.some((token) => /\s/.test(token))) return;
    assert.ok(
      entry.english_distractors.some((token) => /\s/.test(token)),
      `${id} uses compact phrase tokens but has no phrase-sized English distractor`
    );
  });
});

test("sentence bank data shape-matches Hebrew multiword compounds with multiword distractors", () => {
  const entries = loadSentenceBankApi().getSentenceBank();

  entries.forEach((entry) => {
    const allHebrewChoices = [...entry.hebrew_tokens, ...entry.hebrew_distractors].map((token) => String(token || ""));
    assert.equal(
      allHebrewChoices.some((token) => token.includes("_")),
      false,
      `${entry.id} still uses underscore placeholder formatting in Hebrew chips`
    );

    if (!entry.hebrew_tokens.some((token) => /\s/.test(String(token || "")))) return;
    assert.ok(
      entry.hebrew_distractors.some((token) => /\s/.test(String(token || ""))),
      `${entry.id} uses a multiword Hebrew target chip but has no shape-matched multiword Hebrew distractor`
    );
  });
});
