(function initIvriQuestAppUtils(global) {
"use strict";

const app = global.IvriQuestApp = global.IvriQuestApp || {};
const constants = app.constants || {};
const utils = app.utils = app.utils || {};

utils.normalizeVocabularyAvailability = utils.normalizeVocabularyAvailability || function normalizeVocabularyAvailability(availability) {
  const defaults = constants.VOCABULARY_AVAILABILITY_DEFAULTS || {
    translationQuiz: true,
    sentenceHints: true,
  };
  return {
    translationQuiz: availability?.translationQuiz !== false ? defaults.translationQuiz : false,
    sentenceHints: availability?.sentenceHints !== false ? defaults.sentenceHints : false,
  };
};

utils.weightedRandomWord = utils.weightedRandomWord || function weightedRandomWord(weightedItems) {
  if (!weightedItems.length) return null;

  const totalWeight = weightedItems.reduce((sum, item) => sum + Math.max(0, item.weight || 0), 0);
  if (totalWeight <= 0) {
    const idx = Math.floor(Math.random() * weightedItems.length);
    return weightedItems[idx]?.word || null;
  }

  let threshold = Math.random() * totalWeight;
  for (const item of weightedItems) {
    threshold -= Math.max(0, item.weight || 0);
    if (threshold <= 0) {
      return item.word;
    }
  }

  return weightedItems[weightedItems.length - 1]?.word || null;
};

utils.shuffle = utils.shuffle || function shuffle(items) {
  const arr = [...items];

  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
};
})(typeof window !== "undefined" ? window : globalThis);
