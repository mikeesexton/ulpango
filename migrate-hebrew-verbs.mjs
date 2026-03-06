import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const verbApi = require("./hebrew-verbs.js");

const cwd = process.cwd();
const vocabPath = path.join(cwd, "vocab-data.js");
const outputReportPath = path.join(cwd, "hebrew-verb-review-report.json");
const outputEntriesPath = path.join(cwd, "hebrew-verb-migrated.json");
const outputReviewMarkdownPath = path.join(cwd, "hebrew-verb-review-report.md");

const sandbox = {
  window: {},
  globalThis: {},
  console,
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;

const vocabSource = fs.readFileSync(vocabPath, "utf8");
vm.runInNewContext(vocabSource, sandbox, { filename: vocabPath });

if (!sandbox.IvriQuestVocab || typeof sandbox.IvriQuestVocab.getBaseVocabulary !== "function") {
  throw new Error("Unable to load IvriQuestVocab from vocab-data.js");
}

const vocabulary = sandbox.IvriQuestVocab.getBaseVocabulary();
const migrated = verbApi.migrateVocabulary(vocabulary);
const seedEntries = verbApi.getSeedVerbEntries();
const combinedEntries = [...seedEntries, ...migrated.entries];

const groupedByMode = {
  generated: [],
  curated: [],
  phrase_only: [],
  blocked: [],
};

combinedEntries.forEach((entry) => {
  if (!groupedByMode[entry.conjugation_mode]) {
    return;
  }
  groupedByMode[entry.conjugation_mode].push({
    lemma: entry.lemma,
    glosses: entry.senses.map((sense) => sense.gloss),
    review_status: entry.review_status,
    source: entry.source,
    tags: entry.tags,
  });
});

fs.writeFileSync(outputReportPath, `${JSON.stringify(migrated.report, null, 2)}\n`, "utf8");
fs.writeFileSync(outputEntriesPath, `${JSON.stringify(migrated.entries, null, 2)}\n`, "utf8");
fs.writeFileSync(outputReviewMarkdownPath, `${buildMarkdownReview(groupedByMode)}\n`, "utf8");

const summary = {
  generated_safe_verbs: migrated.report.generated_safe_verbs.length,
  curated_verbs_needing_forms: migrated.report.curated_verbs_needing_forms.length,
  ambiguous_verbs_needing_sense_splitting: migrated.report.ambiguous_verbs_needing_sense_splitting.length,
  phrase_only_items: migrated.report.phrase_only_items.length,
  blocked_items: migrated.report.blocked_items.length,
};

process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);

function buildMarkdownReview(grouped) {
  const sections = [
    ["generated", "Generated"],
    ["curated", "Curated"],
    ["phrase_only", "Phrase Only"],
    ["blocked", "Blocked"],
  ];

  const lines = [
    "# Hebrew Verb Review Report",
    "",
    `Generated on ${new Date().toISOString()}.`,
    "",
  ];

  sections.forEach(([key, label]) => {
    const entries = grouped[key] || [];
    lines.push(`## ${label} (${entries.length})`);
    lines.push("");

    if (!entries.length) {
      lines.push("- None");
      lines.push("");
      return;
    }

    entries
      .slice()
      .sort((left, right) => left.lemma.localeCompare(right.lemma, "he"))
      .forEach((entry) => {
        const glosses = entry.glosses.join(", ");
        const tags = entry.tags.length ? ` [${entry.tags.join(", ")}]` : "";
        lines.push(`- ${entry.lemma}: ${glosses} (${entry.review_status}, ${entry.source})${tags}`);
      });

    lines.push("");
  });

  return lines.join("\n").trimEnd();
}
