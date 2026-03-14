(function initIvriQuestAppData(global) {
"use strict";

const app = global.IvriQuestApp = global.IvriQuestApp || {};
const data = app.data = app.data || {};

function getRuntime() {
  return app.runtime || {};
}

function getHelpers() {
  return getRuntime().helpers || {};
}

function getUtils() {
  return app.utils || {};
}

data.getMostMissedRanked = data.getMostMissedRanked || function getMostMissedRanked() {
  const runtime = getRuntime();
  const wordsById = new Map(data.getVocabularyForMode("translationQuiz", { includeMastered: true }).map((word) => [word.id, word]));
  return Object.entries(runtime.state.progress)
    .map(([wordId, rec]) => ({
      wordId,
      missed: data.getMissCountForRecord(rec),
    }))
    .filter((item) => item.missed > 0 && wordsById.has(item.wordId))
    .sort((a, b) => {
      if (b.missed !== a.missed) return b.missed - a.missed;
      const aWord = wordsById.get(a.wordId);
      const bWord = wordsById.get(b.wordId);
      return String(aWord?.en || "").localeCompare(String(bWord?.en || ""));
    })
    .slice(0, 10);
};

data.buildLessonMistakeSummary = data.buildLessonMistakeSummary || function buildLessonMistakeSummary() {
  const helpers = getHelpers();
  const lookup = new Map(data.getVocabularyForMode("translationQuiz", { includeMastered: true }).map((word) => [word.id, word]));
  return getRuntime().state.lesson.sessionMistakeIds
    .map((wordId) => lookup.get(wordId))
    .filter(Boolean)
    .map((word) => ({
      primary: helpers.getHebrewText?.(word, true) || "",
      secondary: word.en,
    }));
};

data.buildAbbreviationMistakeSummary = data.buildAbbreviationMistakeSummary || function buildAbbreviationMistakeSummary() {
  const runtime = getRuntime();
  const lookup = new Map((runtime.abbreviationDeck || []).map((entry) => [entry.id, entry]));
  return runtime.state.abbreviation.sessionMistakeIds
    .map((entryId) => lookup.get(entryId))
    .filter(Boolean)
    .map((entry) => ({
      primary: entry.abbr,
      secondary: `${entry.english} | ${entry.expansionHe}`,
    }));
};

data.buildVerbMatchMistakeSummary = data.buildVerbMatchMistakeSummary || function buildVerbMatchMistakeSummary() {
  const helpers = getHelpers();
  const lookup = new Map(data.getAllVocabulary().map((word) => [word.id, word]));
  return getRuntime().state.match.sessionMistakeIds
    .map((wordId) => lookup.get(wordId))
    .filter(Boolean)
    .map((word) => ({
      primary: helpers.getHebrewText?.(word, true) || "",
      secondary: word.en,
    }));
};

data.calculateDomainStats = data.calculateDomainStats || function calculateDomainStats() {
  const runtime = getRuntime();
  const performanceDomains = Array.isArray(runtime.performanceDomains) ? runtime.performanceDomains : [];
  const domainStats = performanceDomains.map((domain) => ({
    id: domain.id,
    label: domain.label,
    emoji: domain.emoji,
    attempts: 0,
    correct: 0,
    wrong: 0,
  }));

  const domainById = new Map(domainStats.map((domain) => [domain.id, domain]));
  const fallbackDomain = domainById.get(runtime.fallbackDomainId) || domainStats[domainStats.length - 1];

  data.getSelectedPool().forEach((word) => {
    const rec = data.getProgressRecord(word.id);
    const attempts = rec.attempts || 0;
    if (!attempts) return;

    const domainId = data.getDomainIdForWord(word);
    const bucket = domainById.get(domainId) || fallbackDomain;
    const correct = Math.max(0, Math.min(attempts, rec.correct || 0));

    bucket.attempts += attempts;
    bucket.correct += correct;
    bucket.wrong += Math.max(0, attempts - correct);
  });

  return domainStats;
};

data.calculateGameModeStats = data.calculateGameModeStats || function calculateGameModeStats() {
  const runtime = getRuntime();
  const modeStats = {
    conjugation: { attempts: 0, correct: 0, wrong: 0 },
    abbreviation: { attempts: 0, correct: 0, wrong: 0 },
  };

  Object.entries(runtime.state.progress).forEach(([wordId, rec]) => {
    if (runtime.abbreviationIdSet?.has(wordId)) {
      const attempts = Math.max(0, Number(rec?.attempts || 0));
      const correct = Math.max(0, Math.min(attempts, Number(rec?.correct || 0)));
      modeStats.abbreviation.attempts += attempts;
      modeStats.abbreviation.correct += correct;
    }

    const conjugationAttempts = Math.max(0, Number(rec?.conjugationAttempts || 0));
    const conjugationCorrect = Math.max(0, Math.min(conjugationAttempts, Number(rec?.conjugationCorrect || 0)));
    modeStats.conjugation.attempts += conjugationAttempts;
    modeStats.conjugation.correct += conjugationCorrect;
  });

  modeStats.abbreviation.wrong = Math.max(0, modeStats.abbreviation.attempts - modeStats.abbreviation.correct);
  modeStats.conjugation.wrong = Math.max(0, modeStats.conjugation.attempts - modeStats.conjugation.correct);

  const advConjStored = runtime.storageApi.loadJson(runtime.constants.STORAGE_KEYS.advConjStats, { attempts: 0, correct: 0 });
  modeStats.conjugation.attempts += Math.max(0, advConjStored.attempts);
  modeStats.conjugation.correct += Math.max(0, Math.min(advConjStored.attempts, advConjStored.correct));
  modeStats.conjugation.wrong = Math.max(0, modeStats.conjugation.attempts - modeStats.conjugation.correct);

  return modeStats;
};

data.getDomainIdForWord = data.getDomainIdForWord || function getDomainIdForWord(word) {
  const runtime = getRuntime();
  return runtime.domainByCategory?.get(word?.category) || runtime.fallbackDomainId;
};

data.pickLeastSeenLessonDomainId = data.pickLeastSeenLessonDomainId || function pickLeastSeenLessonDomainId(pool) {
  const runtime = getRuntime();
  if (!pool.length) return null;

  const availableDomainIds = new Set(pool.map((word) => data.getDomainIdForWord(word)));
  if (!availableDomainIds.size) return null;

  let minCount = Infinity;
  availableDomainIds.forEach((domainId) => {
    minCount = Math.min(minCount, runtime.state.lesson.domainCounts[domainId] || 0);
  });

  const leastSeenDomainIds = [...availableDomainIds].filter(
    (domainId) => (runtime.state.lesson.domainCounts[domainId] || 0) === minCount
  );
  if (!leastSeenDomainIds.length) return null;

  return leastSeenDomainIds[Math.floor(Math.random() * leastSeenDomainIds.length)];
};

data.pickBestWord = data.pickBestWord || function pickBestWord(pool, usedWordIds = []) {
  const runtime = getRuntime();
  const weightedRandomWord = getUtils().weightedRandomWord;
  const now = Date.now();
  const freshPool = usedWordIds.length < pool.length ? pool.filter((word) => !usedWordIds.includes(word.id)) : pool;
  const due = data.getDueWords(freshPool, now);
  const set = due.length ? due : freshPool;
  const maxLevel = runtime.constants.LEITNER_INTERVALS.length - 1;

  const weighted = set.map((word) => {
    const rec = data.getProgressRecord(word.id);
    const accuracy = rec.attempts ? rec.correct / rec.attempts : 0;
    const overdueMs = rec.attempts ? Math.max(0, now - rec.nextDue) : 0;
    const overdueHours = overdueMs / (60 * 60 * 1000);

    const newWordBoost = rec.attempts === 0 ? 1.45 : 1;
    const dueBoost = rec.attempts > 0 && rec.nextDue <= now ? 1 + Math.min(1.4, overdueHours / 12) : 1;
    const weaknessBoost = 1 + (1 - accuracy) * 0.85;
    const levelBoost = 1 + ((maxLevel - rec.level) / maxLevel) * 0.45;
    const utilityBoost = 0.7 + Math.min(1, (word.utility || 50) / 100) * 0.6;
    const jitter = 0.7 + Math.random() * 0.8;

    return {
      word,
      weight: newWordBoost * dueBoost * weaknessBoost * levelBoost * utilityBoost * jitter,
    };
  });

  return typeof weightedRandomWord === "function" ? weightedRandomWord(weighted) : null;
};

data.updateProgress = data.updateProgress || function updateProgress(wordId, isCorrect) {
  const runtime = getRuntime();
  const rec = data.getProgressRecord(wordId);
  const now = Date.now();
  rec.attempts += 1;
  rec.lastSeen = now;

  if (isCorrect) {
    rec.correct += 1;
    rec.level = Math.min(runtime.constants.LEITNER_INTERVALS.length - 1, rec.level + 1);
    rec.nextDue = now + runtime.constants.LEITNER_INTERVALS[rec.level];
  } else {
    rec.misses = data.getMissCountForRecord(rec) + 1;
    rec.level = Math.max(0, rec.level - 1);
    rec.nextDue = now + 2 * 60 * 1000;
  }

  runtime.state.progress[wordId] = rec;
};

data.getProgressRecord = data.getProgressRecord || function getProgressRecord(wordId) {
  const runtime = getRuntime();
  const existing = runtime.state.progress[wordId] || {};
  const attempts = Math.max(0, Number(existing.attempts || 0));
  const correct = Math.max(0, Math.min(attempts, Number(existing.correct || 0)));
  return {
    attempts: 0,
    correct: 0,
    level: 0,
    nextDue: 0,
    lastSeen: 0,
    mastered: false,
    misses: 0,
    conjugationAttempts: 0,
    conjugationCorrect: 0,
    conjugationStreak: 0,
    lastConjugationSeen: 0,
    ...existing,
    attempts,
    correct,
    misses: data.getMissCountForRecord(existing),
  };
};

data.getMissCountForRecord = data.getMissCountForRecord || function getMissCountForRecord(record) {
  const attempts = Math.max(0, Number(record?.attempts || 0));
  const correct = Math.max(0, Math.min(attempts, Number(record?.correct || 0)));
  const explicit = Number(record?.misses);
  if (Number.isFinite(explicit) && explicit >= 0) {
    return Math.round(explicit);
  }
  return Math.max(0, attempts - correct);
};

data.getDueWords = data.getDueWords || function getDueWords(pool, now = Date.now()) {
  return pool.filter((word) => {
    const rec = data.getProgressRecord(word.id);
    return rec.attempts === 0 || rec.nextDue <= now;
  });
};

data.isWordAvailableForMode = data.isWordAvailableForMode || function isWordAvailableForMode(word, mode) {
  const normalizeVocabularyAvailability = getUtils().normalizeVocabularyAvailability;
  const runtime = getRuntime();
  if (!word || !mode || typeof normalizeVocabularyAvailability !== "function") return false;
  const availability = normalizeVocabularyAvailability(word.availability || runtime.constants.VOCABULARY_AVAILABILITY_DEFAULTS);
  return availability[mode] !== false;
};

data.getVocabularyForMode = data.getVocabularyForMode || function getVocabularyForMode(mode, options = {}) {
  return data.getAllVocabulary().filter((word) => {
    if (!data.isWordAvailableForMode(word, mode)) return false;
    if (options.includeMastered) return true;
    return !data.isWordMastered(word.id);
  });
};

data.getSelectedPool = data.getSelectedPool || function getSelectedPool() {
  const all = data.getVocabularyForMode("translationQuiz");
  return [...all].sort((a, b) => {
    if ((b.utility || 0) !== (a.utility || 0)) {
      return (b.utility || 0) - (a.utility || 0);
    }
    return a.en.localeCompare(b.en);
  });
};

data.getAllVocabulary = data.getAllVocabulary || function getAllVocabulary() {
  return [...(getRuntime().baseVocabulary || [])];
};

data.getWordById = data.getWordById || function getWordById(wordId) {
  if (!wordId) return null;
  return (getRuntime().baseVocabulary || []).find((word) => word.id === wordId) || null;
};

data.isWordMastered = data.isWordMastered || function isWordMastered(wordId) {
  return Boolean(getRuntime().state.progress[wordId]?.mastered);
};

data.getMasteredWords = data.getMasteredWords || function getMasteredWords() {
  return data.getVocabularyForMode("translationQuiz", { includeMastered: true }).filter((word) => data.isWordMastered(word.id));
};

data.setWordMastered = data.setWordMastered || function setWordMastered(wordId, mastered) {
  const runtime = getRuntime();
  if (!wordId) return false;
  const rec = data.getProgressRecord(wordId);
  rec.mastered = Boolean(mastered);
  if (rec.mastered) {
    rec.masteredAt = Date.now();
  } else {
    delete rec.masteredAt;
  }
  runtime.state.progress[wordId] = rec;
  return true;
};

data.updateConjugationProgress = data.updateConjugationProgress || function updateConjugationProgress(wordId, isCorrect) {
  const runtime = getRuntime();
  if (!wordId) return;
  const rec = data.getProgressRecord(wordId);
  rec.conjugationAttempts = Number(rec.conjugationAttempts || 0) + 1;
  if (isCorrect) {
    rec.conjugationCorrect = Number(rec.conjugationCorrect || 0) + 1;
  }
  rec.lastConjugationSeen = Date.now();
  runtime.state.progress[wordId] = rec;
};

data.recordConjugationRound = data.recordConjugationRound || function recordConjugationRound(wordId, cleanRound) {
  const runtime = getRuntime();
  if (!wordId) return 0;
  const rec = data.getProgressRecord(wordId);
  const current = Number(rec.conjugationStreak || 0);
  rec.conjugationStreak = cleanRound ? current + 1 : 0;
  rec.lastConjugationSeen = Date.now();
  runtime.state.progress[wordId] = rec;
  app.persistence?.saveProgress?.();
  return rec.conjugationStreak;
};
})(typeof window !== "undefined" ? window : globalThis);
