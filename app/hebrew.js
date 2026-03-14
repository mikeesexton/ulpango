(function initIvriQuestAppHebrew(global) {
"use strict";

const app = global.IvriQuestApp = global.IvriQuestApp || {};
const constants = app.constants || {};
const utils = app.utils || {};
const hebrew = app.hebrew = app.hebrew || {};

const finalToMedial = constants.HEBREW_FINAL_TO_MEDIAL || {};
const medialToFinal = constants.HEBREW_MEDIAL_TO_FINAL || {};
const normalizeAvailability = utils.normalizeVocabularyAvailability || function normalizeVocabularyAvailability(availability) {
  return {
    translationQuiz: availability?.translationQuiz !== false,
    sentenceHints: availability?.sentenceHints !== false,
  };
};

function isHebrewLetter(char) {
  return /[א-תךםןףץ]/.test(String(char || ""));
}

function isNiqqudMark(char) {
  return /[\u0591-\u05c7]/.test(String(char || ""));
}

function hasHebrewLetterAhead(chars, idx) {
  let i = idx + 1;
  while (i < chars.length && isNiqqudMark(chars[i])) {
    i += 1;
  }
  return i < chars.length && isHebrewLetter(chars[i]);
}

function splitHebrewParts(text) {
  return String(text).split(/([\s"'׳״.,;:!?()[\]{}\-\/]+)/).filter((part) => part.length);
}

function isHebrewToken(token) {
  return /[\u0590-\u05ff]/.test(token);
}

hebrew.toMedialHebrewLetter = hebrew.toMedialHebrewLetter || function toMedialHebrewLetter(letter) {
  return finalToMedial[letter] || letter;
};

hebrew.stripNiqqud = hebrew.stripNiqqud || function stripNiqqud(text) {
  return String(text || "").normalize("NFC").replace(/[\u0591-\u05c7]/g, "");
};

hebrew.applyFallbackNiqqud = hebrew.applyFallbackNiqqud || function applyFallbackNiqqud(text) {
  return String(text || "");
};

hebrew.collectTokenVariants = hebrew.collectTokenVariants || function collectTokenVariants(plain, marked, tokenVariants) {
  const plainParts = splitHebrewParts(plain);
  const markedParts = splitHebrewParts(marked);
  if (plainParts.length !== markedParts.length) return;

  for (let i = 0; i < plainParts.length; i += 1) {
    const plainToken = plainParts[i];
    const markedToken = markedParts[i];
    if (!isHebrewToken(plainToken) || !isHebrewToken(markedToken)) continue;
    if (hebrew.stripNiqqud(markedToken) !== hebrew.stripNiqqud(plainToken)) continue;

    if (!tokenVariants.has(plainToken)) {
      tokenVariants.set(plainToken, new Map());
    }

    const variants = tokenVariants.get(plainToken);
    variants.set(markedToken, (variants.get(markedToken) || 0) + 1);
  }
};

hebrew.buildNiqqudFromTokens = hebrew.buildNiqqudFromTokens || function buildNiqqudFromTokens(plain, tokenMap) {
  const parts = splitHebrewParts(plain);
  let touched = false;

  const mapped = parts.map((part) => {
    if (!isHebrewToken(part)) return part;
    const replacement = tokenMap.get(part);
    if (!replacement) return part;
    touched = true;
    return replacement;
  });

  return touched ? mapped.join("") : plain;
};

hebrew.normalizeHebrewSofitForms = hebrew.normalizeHebrewSofitForms || function normalizeHebrewSofitForms(text) {
  const chars = String(text || "").normalize("NFC").split("");
  for (let i = 0; i < chars.length; i += 1) {
    const char = chars[i];
    if (!isHebrewLetter(char)) continue;

    const medial = hebrew.toMedialHebrewLetter(char);
    const atTokenEnd = !hasHebrewLetterAhead(chars, i);
    chars[i] = atTokenEnd && medialToFinal[medial] ? medialToFinal[medial] : medial;
  }
  return chars.join("");
};

hebrew.normalizeGeneratedHebrewForms = hebrew.normalizeGeneratedHebrewForms || function normalizeGeneratedHebrewForms(formMap) {
  const normalized = {};
  Object.entries(formMap || {}).forEach(([key, value]) => {
    normalized[key] = hebrew.normalizeHebrewSofitForms(value);
  });
  return normalized;
};

hebrew.normalizeHebrewToMedial = hebrew.normalizeHebrewToMedial || function normalizeHebrewToMedial(text) {
  return String(text || "")
    .normalize("NFC")
    .split("")
    .map((char) => hebrew.toMedialHebrewLetter(char))
    .join("");
};

hebrew.prepareVocabulary = hebrew.prepareVocabulary || function prepareVocabulary(words) {
  const phraseMap = new Map();
  const tokenVariants = new Map();

  words.forEach((word) => {
    const plain = String(word?.he || "");
    const marked = String(word?.heNiqqud || "");
    if (!plain || !marked || marked === plain) return;

    phraseMap.set(plain, marked);
    if (hebrew.stripNiqqud(marked) === hebrew.stripNiqqud(plain)) {
      hebrew.collectTokenVariants(plain, marked, tokenVariants);
    }
  });

  const tokenMap = new Map();
  tokenVariants.forEach((variantMap, plainToken) => {
    let bestVariant = plainToken;
    let bestCount = 0;
    variantMap.forEach((count, variant) => {
      if (count > bestCount) {
        bestCount = count;
        bestVariant = variant;
      }
    });
    tokenMap.set(plainToken, bestVariant);
  });

  const availabilityDefaults = constants.VOCABULARY_AVAILABILITY_DEFAULTS || {
    translationQuiz: true,
    sentenceHints: true,
  };

  return words.map((word) => {
    const plain = String(word?.he || "");
    const existing = String(word?.heNiqqud || "");
    const availability = normalizeAvailability(word?.availability || availabilityDefaults);

    if (!plain) {
      return { ...word, availability, heNiqqud: existing || plain };
    }

    if (existing && existing !== plain) {
      return {
        ...word,
        availability,
        heNiqqud: existing,
      };
    }

    let marked = phraseMap.get(plain) || hebrew.buildNiqqudFromTokens(plain, tokenMap);
    if (!marked || hebrew.stripNiqqud(marked) !== hebrew.stripNiqqud(plain)) marked = plain;
    if (marked === plain) marked = hebrew.applyFallbackNiqqud(plain);

    return {
      ...word,
      availability,
      heNiqqud: marked,
    };
  });
};
})(typeof window !== "undefined" ? window : globalThis);
