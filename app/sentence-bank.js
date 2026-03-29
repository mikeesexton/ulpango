(function initIvriQuestAppSentenceBank(global) {
"use strict";

const app = global.IvriQuestApp = global.IvriQuestApp || {};
const sentenceBank = app.sentenceBank = app.sentenceBank || {};
let activeSentenceDrag = null;

function getRuntime() {
  return app.runtime || {};
}

function getHelpers() {
  return getRuntime().helpers || {};
}

function getSession() {
  return app.session || {};
}

function translate(key, vars = {}) {
  return getHelpers().t ? getHelpers().t(key, vars) : key;
}

function clampDifficulty(value) {
  const next = Math.round(Number(value || 1));
  return Math.max(1, Math.min(3, next));
}

function sanitizeTokenList(tokens) {
  return (Array.isArray(tokens) ? tokens : [])
    .map((token) => String(token || "").trim())
    .filter(Boolean);
}

const NON_DISTINCT_DISTRACTOR_GROUPS = [
  ["איך", "כיצד"],
  ["אך", "אבל"],
  ["about", "on"],
  ["accurate", "correct"],
  ["but", "however"],
  ["מדויק", "נכון"],
  ["מדויקת", "נכונה"],
  ["מדויקים", "נכונים"],
  ["מדויקות", "נכונות"],
];

const HEBREW_FLEXIBLE_MODIFIER_TOKENS = new Set([
  "די",
  "לגמרי",
  "ממש",
  "מאוד",
]);

const NON_DISTINCT_DISTRACTOR_INDEX = new Map();
NON_DISTINCT_DISTRACTOR_GROUPS.forEach((group, groupIndex) => {
  group.forEach((token) => {
    NON_DISTINCT_DISTRACTOR_INDEX.set(String(token || "").trim().toLowerCase(), groupIndex);
  });
});

function normalizeComparableToken(token) {
  return String(token || "").trim().toLowerCase();
}

function normalizeComparableHebrewToken(token) {
  const value = String(token || "").trim();
  if (!value) return "";
  const stripped = app.hebrew?.stripNiqqud ? app.hebrew.stripNiqqud(value) : value;
  return app.hebrew?.normalizeHebrewToMedial
    ? app.hebrew.normalizeHebrewToMedial(stripped).trim()
    : stripped.trim();
}

function isNonDistinctDistractor(targetToken, distractorToken) {
  const targetGroup = NON_DISTINCT_DISTRACTOR_INDEX.get(normalizeComparableToken(targetToken));
  const distractorGroup = NON_DISTINCT_DISTRACTOR_INDEX.get(normalizeComparableToken(distractorToken));
  return targetGroup !== undefined && targetGroup === distractorGroup;
}

function sanitizeDistractors(tokens, targetTokens) {
  const targetSet = new Set(targetTokens.map((token) => String(token || "").trim()));
  const seen = new Set();
  return sanitizeTokenList(tokens).filter((token) => {
    if (targetSet.has(token) || seen.has(token)) return false;
    if (targetTokens.some((targetToken) => isNonDistinctDistractor(targetToken, token))) return false;
    seen.add(token);
    return true;
  });
}

function isHebrewFlexibleModifierToken(token) {
  return HEBREW_FLEXIBLE_MODIFIER_TOKENS.has(normalizeComparableHebrewToken(token));
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
      return {
        pieces: tokens.map((token, tokenIndexFallback) => ({
          beforeText: tokenIndexFallback === 0 ? "" : " ",
          tokenText: token,
          afterText: "",
        })),
        trailingText: "",
      };
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
    pieces,
    trailingText,
  };
}

function hasHebrewText(text) {
  return /[\u0590-\u05ff]/.test(String(text || ""));
}

function normalizeSentenceMeaningKey(token) {
  const value = String(token || "").trim();
  if (!value) return "";
  if (hasHebrewText(value)) {
    const stripped = app.hebrew?.stripNiqqud ? app.hebrew.stripNiqqud(value) : value;
    return app.hebrew?.normalizeHebrewToMedial
      ? app.hebrew.normalizeHebrewToMedial(stripped).trim()
      : stripped.trim();
  }
  return value
    .replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9']+$/g, "")
    .toLowerCase();
}

function sanitizeMeaningText(text) {
  const sanitizeEnglishText = app.utils?.sanitizeEnglishDisplayText;
  return typeof sanitizeEnglishText === "function"
    ? sanitizeEnglishText(text)
    : String(text || "").trim();
}

function addSentenceMeaningEntry(lookup, token, meaning) {
  const key = normalizeSentenceMeaningKey(token);
  const cleanMeaning = sanitizeMeaningText(meaning);
  if (!key || !cleanMeaning) return;
  if (!lookup.has(key)) {
    lookup.set(key, []);
  }
  const variants = lookup.get(key);
  if (!variants.includes(cleanMeaning)) {
    variants.push(cleanMeaning);
  }
}

function buildSentenceMeaningLookup() {
  const runtime = getRuntime();
  if (runtime.sentenceBankMeaningLookup) {
    return runtime.sentenceBankMeaningLookup;
  }

  const lookup = new Map();
  (runtime.baseVocabulary || []).forEach((word) => {
    addSentenceMeaningEntry(lookup, word?.he, word?.en);
    addSentenceMeaningEntry(lookup, word?.heNiqqud, word?.en);
  });

  (runtime.verbFormDeck || []).forEach((entry) => {
    (entry?.forms || []).forEach((form) => {
      addSentenceMeaningEntry(lookup, form?.valuePlain, form?.englishText);
      addSentenceMeaningEntry(lookup, form?.valueNiqqud, form?.englishText);
    });
  });

  runtime.sentenceBankMeaningLookup = lookup;
  return lookup;
}

function resolveSentenceTokenMeaning(token) {
  const variants = buildSentenceMeaningLookup().get(normalizeSentenceMeaningKey(token)) || [];
  return variants.slice(0, 2).join(" / ");
}

function buildEmptySentenceSlots(length) {
  return Array.from({ length: Math.max(0, Number(length || 0)) }, () => "");
}

function normalizeSentenceSlotIndex(index, max) {
  if (index === null || index === undefined || index === "") {
    return null;
  }
  const next = Number(index);
  return Number.isInteger(next) && next >= 0 && next < max ? next : null;
}

function normalizeQuestionState(question) {
  if (!question || typeof question !== "object") return null;

  const targetLength = Array.isArray(question.targetTokens) ? question.targetTokens.length : 0;
  const validIds = new Set((question.bankTokens || []).map((token) => String(token?.id || "").trim()).filter(Boolean));
  let slotTokenIds = Array.isArray(question.slotTokenIds)
    ? question.slotTokenIds.map((tokenId) => String(tokenId || "").trim())
    : Array.isArray(question.placedBankTokenIds)
      ? question.placedBankTokenIds.map((tokenId) => String(tokenId || "").trim())
      : [];

  if (slotTokenIds.length < targetLength) {
    slotTokenIds = slotTokenIds.concat(buildEmptySentenceSlots(targetLength - slotTokenIds.length));
  } else if (slotTokenIds.length > targetLength) {
    slotTokenIds = slotTokenIds.slice(0, targetLength);
  }

  const usedTokenIds = new Set();
  slotTokenIds = slotTokenIds.map((tokenId) => {
    if (!tokenId || !validIds.has(tokenId) || usedTokenIds.has(tokenId)) {
      return "";
    }
    usedTokenIds.add(tokenId);
    return tokenId;
  });

  question.slotTokenIds = slotTokenIds;
  question.placedBankTokenIds = slotTokenIds.filter(Boolean);

  const selectedBankTokenId = String(question.selectedBankTokenId || "").trim();
  question.selectedBankTokenId = selectedBankTokenId && validIds.has(selectedBankTokenId) && !usedTokenIds.has(selectedBankTokenId)
    ? selectedBankTokenId
    : "";

  const selectedSlotIndex = normalizeSentenceSlotIndex(question.selectedSlotIndex, targetLength);
  question.selectedSlotIndex = selectedSlotIndex !== null && !slotTokenIds[selectedSlotIndex]
    ? selectedSlotIndex
    : null;

  question.wasLastAnswerCorrect = question.wasLastAnswerCorrect === true;

  return question;
}

function getQuestionSlotTokenIds(question) {
  return normalizeQuestionState(question)?.slotTokenIds || [];
}

function getSlottedTokens(question) {
  return getQuestionSlotTokenIds(question)
    .map((tokenId) => tokenId ? getQuestionTokenById(question, tokenId) : null);
}

function getFilledSlotCount(question) {
  return getQuestionSlotTokenIds(question).filter(Boolean).length;
}

function getPlacedAnswerTokens(question) {
  return getSlottedTokens(question).map((token) => String(token?.text || "").trim());
}

function getNextEmptySlotIndex(question) {
  return getQuestionSlotTokenIds(question).findIndex((tokenId) => !tokenId);
}

function clearQuestionSelection(question) {
  if (!question) return;
  question.selectedBankTokenId = "";
  question.selectedSlotIndex = null;
}

function syncQuestionSlotState(question, slotTokenIds) {
  if (!question) return;
  question.slotTokenIds = slotTokenIds;
  question.placedBankTokenIds = slotTokenIds.filter(Boolean);
}

function placeTokenInSlotInternal(question, tokenId, slotIndex) {
  const slotTokenIds = getQuestionSlotTokenIds(question);
  const normalizedSlotIndex = normalizeSentenceSlotIndex(slotIndex, slotTokenIds.length);
  if (normalizedSlotIndex === null || slotTokenIds[normalizedSlotIndex]) return false;
  if (!getQuestionTokenById(question, tokenId) || slotTokenIds.includes(tokenId)) return false;
  slotTokenIds[normalizedSlotIndex] = tokenId;
  syncQuestionSlotState(question, slotTokenIds);
  return true;
}

function movePlacedTokenInternal(question, fromIndex, toIndex) {
  const slotTokenIds = getQuestionSlotTokenIds(question);
  const normalizedFromIndex = normalizeSentenceSlotIndex(fromIndex, slotTokenIds.length);
  const normalizedToIndex = normalizeSentenceSlotIndex(toIndex, slotTokenIds.length);
  if (normalizedFromIndex === null || normalizedToIndex === null || normalizedFromIndex === normalizedToIndex) {
    return false;
  }
  if (!slotTokenIds[normalizedFromIndex] || slotTokenIds[normalizedToIndex]) return false;
  slotTokenIds[normalizedToIndex] = slotTokenIds[normalizedFromIndex];
  slotTokenIds[normalizedFromIndex] = "";
  syncQuestionSlotState(question, slotTokenIds);
  return true;
}

function canInsertTokenAtSlot(question, tokenId, slotIndex, options = {}) {
  const slotTokenIds = getQuestionSlotTokenIds(question);
  const normalizedSlotIndex = normalizeSentenceSlotIndex(slotIndex, slotTokenIds.length);
  const normalizedFromIndex = normalizeSentenceSlotIndex(options.fromIndex, slotTokenIds.length);
  if (normalizedSlotIndex === null || !getQuestionTokenById(question, tokenId)) {
    return false;
  }

  if (normalizedFromIndex !== null) {
    return Boolean(slotTokenIds[normalizedFromIndex]) && slotTokenIds[normalizedFromIndex] === tokenId && normalizedFromIndex !== normalizedSlotIndex;
  }

  return !slotTokenIds.includes(tokenId);
}

function insertTokenAtSlotInternal(question, tokenId, slotIndex, options = {}) {
  const slotTokenIds = getQuestionSlotTokenIds(question);
  const normalizedSlotIndex = normalizeSentenceSlotIndex(slotIndex, slotTokenIds.length);
  const normalizedFromIndex = normalizeSentenceSlotIndex(options.fromIndex, slotTokenIds.length);
  if (!canInsertTokenAtSlot(question, tokenId, normalizedSlotIndex, { fromIndex: normalizedFromIndex })) {
    return false;
  }

  const nextSlotTokenIds = [...slotTokenIds];
  if (normalizedFromIndex !== null) {
    nextSlotTokenIds[normalizedFromIndex] = "";
  }

  let carry = tokenId;
  for (let index = normalizedSlotIndex; index < nextSlotTokenIds.length; index += 1) {
    const displaced = nextSlotTokenIds[index];
    nextSlotTokenIds[index] = carry;
    carry = displaced;
    if (!carry) break;
  }

  syncQuestionSlotState(question, nextSlotTokenIds);
  return true;
}

function buildSentenceSlotAriaLabel(question, slotIndex, token) {
  const total = Math.max(0, Number(question?.targetTokens?.length || 0));
  if (token?.text) {
    return `Sentence slot ${slotIndex + 1} of ${total}, filled with ${token.text}.`;
  }
  return `Sentence slot ${slotIndex + 1} of ${total}, empty.`;
}

function buildSentenceSlotAriaDescription(question, token) {
  if (token?.text) {
    return question?.selectedBankTokenId
      ? "Press Enter to insert the selected word here and shift later words forward, or press Backspace to remove this word."
      : "Press Backspace to remove this word.";
  }

  return question?.selectedBankTokenId
    ? "Press Enter to place the selected word here."
    : "Activate to choose this blank.";
}

function buildSentenceBankTokenAriaLabel(token) {
  return `Answer bank word ${String(token?.text || "").trim()}.`;
}

function buildSentenceBankTokenAriaDescription(isSelected) {
  return isSelected
    ? "Selected. Press Escape to cancel, then move to a blank and press Enter to place it or to a filled slot to insert it."
    : "Press Space to select this word for keyboard placement, or activate it to place it in the next blank.";
}

function isEquivalentAdjacentModifierSwap(expectedTokens, actualTokens, mismatchIndex) {
  if (!Array.isArray(expectedTokens) || !Array.isArray(actualTokens)) return false;
  const nextIndex = mismatchIndex + 1;
  if (nextIndex >= expectedTokens.length || nextIndex >= actualTokens.length) return false;
  if (actualTokens[mismatchIndex] !== expectedTokens[nextIndex] || actualTokens[nextIndex] !== expectedTokens[mismatchIndex]) {
    return false;
  }
  return isHebrewFlexibleModifierToken(expectedTokens[mismatchIndex]) || isHebrewFlexibleModifierToken(expectedTokens[nextIndex]);
}

function isEquivalentSentenceTokenOrder(expectedTokens, actualTokens) {
  if (!Array.isArray(expectedTokens) || !Array.isArray(actualTokens) || expectedTokens.length !== actualTokens.length) {
    return false;
  }

  const mismatchIndexes = [];
  for (let index = 0; index < expectedTokens.length; index += 1) {
    if (expectedTokens[index] === actualTokens[index]) continue;
    mismatchIndexes.push(index);
    if (mismatchIndexes.length > 2) return false;
  }

  if (!mismatchIndexes.length) return true;
  if (mismatchIndexes.length !== 2 || mismatchIndexes[1] !== mismatchIndexes[0] + 1) return false;
  return isEquivalentAdjacentModifierSwap(expectedTokens, actualTokens, mismatchIndexes[0]);
}

function buildSingleWordDifference(question) {
  const expected = (question?.targetTokens || []).map((token) => String(token || "").trim());
  const actual = getPlacedAnswerTokens(question);
  if (expected.length !== actual.length || !expected.length) return null;

  let mismatchIndex = null;
  for (let index = 0; index < expected.length; index += 1) {
    if (expected[index] === actual[index]) continue;
    if (mismatchIndex !== null) return null;
    mismatchIndex = index;
  }

  if (mismatchIndex === null || !actual[mismatchIndex]) return null;
  return {
    correctWord: expected[mismatchIndex],
    chosenWord: actual[mismatchIndex],
  };
}

function buildSingleWordMeaningTip(question) {
  const difference = buildSingleWordDifference(question);
  if (!difference) return "";

  const correctMeaning = resolveSentenceTokenMeaning(difference.correctWord);
  const chosenMeaning = resolveSentenceTokenMeaning(difference.chosenWord);
  if (!correctMeaning || !chosenMeaning) return "";

  return translate("feedback.sentenceBankSingleWordTip", {
    correctWord: difference.correctWord,
    correctMeaning,
    chosenWord: difference.chosenWord,
    chosenMeaning,
  });
}

function setSentenceDragPayload(payload) {
  activeSentenceDrag = payload && typeof payload === "object" ? { ...payload } : null;
}

function clearSentenceDragPayload() {
  activeSentenceDrag = null;
}

function resolveSentenceDragPayload(event) {
  if (event?.dataTransfer?.getData) {
    const raw = event.dataTransfer.getData("application/x-ivriquest-sentence-token");
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return activeSentenceDrag;
      }
    }
  }
  return activeSentenceDrag;
}

function canDropSentencePayload(question, slotIndex, payload) {
  if (!question || question.locked) return false;
  const slotTokenIds = getQuestionSlotTokenIds(question);
  const normalizedSlotIndex = normalizeSentenceSlotIndex(slotIndex, slotTokenIds.length);
  if (normalizedSlotIndex === null) return false;
  if (payload?.type === "bank") {
    return canInsertTokenAtSlot(question, payload.tokenId, normalizedSlotIndex);
  }
  if (payload?.type === "slot") {
    return canInsertTokenAtSlot(question, payload.tokenId, normalizedSlotIndex, { fromIndex: payload.slotIndex });
  }
  return false;
}

function rewriteSentenceNoteForGame(note) {
  const cleanNote = String(note || "")
    .replace(/\s+/g, " ")
    .replace(/\u2014/g, " - ")
    .trim();
  if (!cleanNote) return "";

  const hasGender = /gender swap|gender distractor|agrees with|masculine|feminine|masc\.|fem\./i.test(cleanNote);
  const hasOpposites = /semantic opposites|opposite pair/i.test(cleanNote);
  const hasFormal = /\bformal\b|\bprofessional\b|\bacademic\b|\bregister\b/i.test(cleanNote);
  const hasCasual = /\bslang\b|\bcasual\b|\bcolloquial\b|\bwhatsapp\b|borrowed from arabic|borrowed from yiddish/i.test(cleanNote);
  const hasLiteral = /\bliterally\b/i.test(cleanNote);
  const hasUrgency = /\burgency\b|\bimpatient\b|on my way right now|already coming/i.test(cleanNote);
  const hasAttachment = /\bcontraction\b|\bcombines the conjunction\b|\battached directly\b|\bsuffix\b|\bprefix\b/i.test(cleanNote);
  const hasChunk = /\bcommon phrase\b|\bstatus idiom\b|\bset phrase\b|\bexpression\b|\bvery common\b/i.test(cleanNote);
  const hasVocabularyFocus = /\bvocabulary\b/i.test(cleanNote);
  const hasContrast = /\bvs\b|contrasting|distractor pair|distractors?:/i.test(cleanNote);
  const sentences = [];

  if (hasFormal) {
    sentences.push("This one uses a more formal tone.");
  } else if (hasCasual) {
    sentences.push("This one is casual Hebrew.");
  }

  if (hasGender) {
    sentences.push("Watch the gender match here.");
  } else if (hasOpposites) {
    sentences.push("One extra word flips the meaning here.");
  } else if (hasLiteral) {
    sentences.push("Don't go by the literal wording.");
  } else if (hasAttachment) {
    sentences.push("Watch the small attached pieces here.");
  } else if (hasUrgency) {
    sentences.push("This one sounds quick and urgent.");
  } else if (hasChunk) {
    sentences.push("Try to hear it as one natural phrase.");
  } else if (hasVocabularyFocus) {
    sentences.push("Watch the key word choice here.");
  } else if (hasContrast) {
    sentences.push(hasFormal
      ? "Pick the more polished wording."
      : "Watch the difference between the close choices.");
  }

  if (sentences.length === 1) {
    if (hasFormal) {
      sentences.push("Pick the more polished wording.");
    } else if (hasCasual) {
      sentences.push(hasLiteral ? "Don't go by the literal wording." : "Go with the everyday meaning.");
    }
  }

  return sentences.length ? sentences.slice(0, 2).join(" ") : "Watch the wording closely here.";
}

function buildSentenceFeedbackDetail(question, isCorrect) {
  const details = [];
  if (!isCorrect) {
    const singleWordTip = buildSingleWordMeaningTip(question);
    if (singleWordTip) {
      details.push(singleWordTip);
    }
  }

  const rewritten = rewriteSentenceNoteForGame(question?.sentence?.notes);
  if (rewritten) {
    details.push(translate("feedback.sentenceBankGameTip", { detail: rewritten }));
  }

  return details.join(" ").trim();
}

function buildSentenceProgressKey(sentenceId, direction) {
  return `${String(sentenceId || "").trim()}::${direction === "en2he" ? "en2he" : "he2en"}`;
}

function getQuestionKey(question) {
  return buildSentenceProgressKey(question?.sentence?.id, question?.direction);
}

function getSentenceProgressRecord(sentenceId, direction) {
  const runtime = getRuntime();
  const key = buildSentenceProgressKey(sentenceId, direction);
  const existing = runtime.state.sentenceProgress[key] || {};
  const attempts = Math.max(0, Number(existing.attempts || 0));
  const correct = Math.max(0, Math.min(attempts, Number(existing.correct || 0)));
  const explicitMisses = Number(existing.misses);
  const misses = Number.isFinite(explicitMisses) && explicitMisses >= 0
    ? Math.round(explicitMisses)
    : Math.max(0, attempts - correct);

  return {
    attempts: 0,
    correct: 0,
    level: 0,
    nextDue: 0,
    lastSeen: 0,
    misses: 0,
    ...existing,
    attempts,
    correct,
    misses,
  };
}

function setSentenceProgressRecord(sentenceId, direction, record) {
  const runtime = getRuntime();
  runtime.state.sentenceProgress[buildSentenceProgressKey(sentenceId, direction)] = record;
}

function updateSentenceProgress(sentenceId, direction, isCorrect) {
  const runtime = getRuntime();
  const record = getSentenceProgressRecord(sentenceId, direction);
  const now = Date.now();
  const intervals = runtime.constants.LEITNER_INTERVALS || [0];
  const maxLevel = Math.max(0, intervals.length - 1);

  record.attempts += 1;
  record.lastSeen = now;

  if (isCorrect) {
    record.correct += 1;
    record.level = Math.min(maxLevel, record.level + 1);
    const interval = Math.max(0, Number(intervals[record.level] || 0));
    const intervalBoost = direction === "en2he" ? 1.15 : 1;
    record.nextDue = now + Math.round(interval * intervalBoost);
  } else {
    record.misses = Math.max(0, Number(record.misses || 0)) + 1;
    record.level = Math.max(0, record.level - 1);
    record.nextDue = now + (direction === "en2he" ? 60 * 1000 : 2 * 60 * 1000);
  }

  setSentenceProgressRecord(sentenceId, direction, record);
}

function getDuePairs(pairs, now = Date.now()) {
  return pairs.filter((pair) => {
    const record = getSentenceProgressRecord(pair.sentence.id, pair.direction);
    return record.attempts === 0 || record.nextDue <= now;
  });
}

function buildQuestionFromPair(pair, options = {}) {
  const shuffle = app.utils?.shuffle;
  const doShuffle = typeof shuffle === "function" ? shuffle : (items) => [...items];
  const sentence = pair?.sentence;
  const direction = pair?.direction === "en2he" ? "en2he" : "he2en";
  if (!sentence) return null;

  const targetTokens = direction === "en2he"
    ? [...sentence.hebrewTokens]
    : [...sentence.englishTokens];
  const distractorTokens = direction === "en2he"
    ? [...sentence.hebrewDistractors]
    : [...sentence.englishDistractors];
  const bankTokens = doShuffle([
    ...targetTokens.map((text, index) => ({ id: `answer-${index}`, text, isCorrect: true })),
    ...distractorTokens.map((text, index) => ({ id: `distractor-${index}`, text, isCorrect: false })),
  ]);

  return {
    sentence: { ...sentence },
    direction,
    questionKey: buildSentenceProgressKey(sentence.id, direction),
    promptLabel: translate(
      options.isReview
        ? direction === "en2he" ? "prompt.reviewToHebrew" : "prompt.reviewToEnglish"
        : direction === "en2he" ? "prompt.toHebrew" : "prompt.toEnglish"
    ),
    prompt: direction === "en2he" ? sentence.english : sentence.hebrew,
    promptIsHebrew: direction === "he2en",
    optionsAreHebrew: direction === "en2he",
    answerIsHebrew: direction === "en2he",
    targetTokens,
    bankTokens,
    slotTokenIds: buildEmptySentenceSlots(targetTokens.length),
    placedBankTokenIds: [],
    selectedBankTokenId: "",
    selectedSlotIndex: null,
    wasLastAnswerCorrect: false,
    scoreValue: direction === "en2he" ? sentence.difficulty + 1 : sentence.difficulty,
    isReview: options.isReview === true,
    locked: false,
  };
}

function getQuestionTokenById(question, tokenId) {
  return (question?.bankTokens || []).find((token) => token.id === tokenId) || null;
}

function getPlacedTokens(question) {
  return getSlottedTokens(question).filter(Boolean);
}

function isAnswerComplete(question) {
  return Boolean(question) && getFilledSlotCount(question) === (question.targetTokens || []).length;
}

function isPlacedAnswerCorrect(question) {
  const expected = (question?.targetTokens || []).map((token) => String(token || "").trim());
  const actual = getPlacedAnswerTokens(question);
  return isEquivalentSentenceTokenOrder(expected, actual);
}

function getCorrectAnswerText(question) {
  if (!question?.sentence) return "";
  return question.direction === "en2he" ? question.sentence.hebrew : question.sentence.english;
}

function buildCandidatePairs(pool, askedSentenceIds) {
  const freshPool = askedSentenceIds.length < pool.length
    ? pool.filter((sentence) => !askedSentenceIds.includes(sentence.id))
    : pool;
  return (freshPool.length ? freshPool : pool).flatMap((sentence) => ([
    { sentence, direction: "he2en" },
    { sentence, direction: "en2he" },
  ]));
}

function pickWeightedPair(pairs) {
  const weightedRandomWord = app.utils?.weightedRandomWord;
  if (!pairs.length || typeof weightedRandomWord !== "function") return pairs[0] || null;

  const now = Date.now();
  const duePairs = getDuePairs(pairs, now);
  const activePairs = duePairs.length ? duePairs : pairs;
  const weightedPairs = activePairs.map((pair) => {
    const record = getSentenceProgressRecord(pair.sentence.id, pair.direction);
    const accuracy = record.attempts ? record.correct / record.attempts : 0;
    const overdueMs = record.attempts ? Math.max(0, now - record.nextDue) : 0;
    const overdueHours = overdueMs / (60 * 60 * 1000);
    const directionBoost = pair.direction === "en2he" ? 1.18 : 1;
    const newBoost = record.attempts === 0 ? 1.4 : 1;
    const dueBoost = record.attempts > 0 && record.nextDue <= now ? 1 + Math.min(1.35, overdueHours / 10) : 1;
    const weaknessBoost = 1 + (1 - accuracy) * 0.85;
    const levelBoost = 1 + ((Math.max(0, getRuntime().constants.LEITNER_INTERVALS.length - 1) - record.level) / Math.max(1, getRuntime().constants.LEITNER_INTERVALS.length - 1)) * 0.4;
    const missBoost = 1 + Math.min(3, Math.max(0, Number(record.misses || 0))) * (pair.direction === "en2he" ? 0.65 : 0.5);
    const difficultyBoost = 1 + (pair.sentence.difficulty - 1) * 0.28;
    const jitter = 0.78 + Math.random() * 0.55;

    return {
      word: pair,
      weight: newBoost * dueBoost * weaknessBoost * levelBoost * missBoost * difficultyBoost * directionBoost * jitter,
    };
  });

  return weightedRandomWord(weightedPairs);
}

sentenceBank.prepareSentenceBankDeck = sentenceBank.prepareSentenceBankDeck || function prepareSentenceBankDeck(entries) {
  const source = Array.isArray(entries) ? entries : [];
  const seenIds = new Set();
  const cleaned = [];

  source.forEach((entry, index) => {
    const english = String(entry?.english || "").trim();
    const hebrew = String(entry?.hebrew || "").trim();
    const englishTokens = sanitizeTokenList(entry?.english_tokens || entry?.englishTokens);
    const hebrewTokens = sanitizeTokenList(entry?.hebrew_tokens || entry?.hebrewTokens);
    if (!english || !hebrew || !englishTokens.length || !hebrewTokens.length) return;

    let idBase = String(entry?.id || `sentence-${index + 1}`).trim();
    if (!idBase) {
      idBase = `sentence-${index + 1}`;
    }
    let id = idBase;
    let suffix = 2;
    while (seenIds.has(id)) {
      id = `${idBase}-${suffix}`;
      suffix += 1;
    }
    seenIds.add(id);

    cleaned.push({
      id,
      category: String(entry?.category || "general").trim() || "general",
      style: entry?.style == null ? "" : String(entry.style).trim(),
      difficulty: clampDifficulty(entry?.difficulty),
      english,
      hebrew,
      englishTokens,
      hebrewTokens,
      englishDistractors: sanitizeDistractors(entry?.english_distractors || entry?.englishDistractors, englishTokens),
      hebrewDistractors: sanitizeDistractors(entry?.hebrew_distractors || entry?.hebrewDistractors, hebrewTokens),
      notes: String(entry?.notes || "").trim(),
      source: String(entry?.source || "sentence-bank").trim() || "sentence-bank",
    });
  });

  return cleaned;
};

sentenceBank.getSentenceBankPromptSpeechPayload = sentenceBank.getSentenceBankPromptSpeechPayload || function getSentenceBankPromptSpeechPayload(question = getRuntime().state.sentenceBank.currentQuestion) {
  if (!question?.promptIsHebrew) return null;
  return app.speech?.buildSpeechPayload?.({
    plain: question.prompt,
    source: "prompt",
  }) || null;
};

sentenceBank.cloneSentenceBankQuestionSnapshot = sentenceBank.cloneSentenceBankQuestionSnapshot || function cloneSentenceBankQuestionSnapshot(question) {
  const normalized = normalizeQuestionState(question ? { ...question } : null);
  return {
    ...normalized,
    sentence: normalized?.sentence ? { ...normalized.sentence } : null,
    targetTokens: Array.isArray(normalized?.targetTokens) ? [...normalized.targetTokens] : [],
    bankTokens: Array.isArray(normalized?.bankTokens)
      ? normalized.bankTokens.map((token) => ({ ...token }))
      : [],
    slotTokenIds: Array.isArray(normalized?.slotTokenIds) ? [...normalized.slotTokenIds] : [],
    placedBankTokenIds: Array.isArray(normalized?.placedBankTokenIds) ? [...normalized.placedBankTokenIds] : [],
    selectedBankTokenId: String(normalized?.selectedBankTokenId || ""),
    selectedSlotIndex: normalized?.selectedSlotIndex ?? null,
    wasLastAnswerCorrect: normalized?.wasLastAnswerCorrect === true,
    locked: normalized?.locked !== undefined ? Boolean(normalized.locked) : true,
  };
};

sentenceBank.buildSentenceBankMistakeSummary = sentenceBank.buildSentenceBankMistakeSummary || function buildSentenceBankMistakeSummary() {
  const runtime = getRuntime();
  const lookup = new Map((runtime.sentenceBankDeck || []).map((sentence) => [sentence.id, sentence]));
  return runtime.state.sentenceBank.sessionMistakeKeys
    .map((key) => {
      const [sentenceId, direction = "he2en"] = String(key || "").split("::");
      const sentence = lookup.get(sentenceId);
      if (!sentence) return null;
      const toHebrew = direction === "en2he";
      return {
        primary: toHebrew ? sentence.hebrew : sentence.english,
        secondary: `${translate(toHebrew ? "prompt.toHebrew" : "prompt.toEnglish")}: ${toHebrew ? sentence.english : sentence.hebrew}`,
      };
    })
    .filter(Boolean);
};

sentenceBank.getRoundTarget = sentenceBank.getRoundTarget || function getRoundTarget() {
  const runtime = getRuntime();
  if (!runtime.sentenceBankDeck?.length) return 0;
  return Math.min(runtime.constants.LESSON_ROUNDS, runtime.sentenceBankDeck.length);
};

sentenceBank.resetSentenceBankState = sentenceBank.resetSentenceBankState || function resetSentenceBankState() {
  const runtime = getRuntime();
  const session = getSession();
  session.stopSentenceBankTimer?.();
  runtime.state.sentenceBank.active = false;
  runtime.state.sentenceBank.introActive = false;
  runtime.state.sentenceBank.inReview = false;
  runtime.state.sentenceBank.currentRound = 0;
  runtime.state.sentenceBank.secondChanceCurrent = 0;
  runtime.state.sentenceBank.secondChanceTotal = 0;
  runtime.state.sentenceBank.startMs = 0;
  runtime.state.sentenceBank.elapsedSeconds = 0;
  runtime.state.sentenceBank.timerId = null;
  runtime.state.sentenceBank.askedSentenceIds = [];
  runtime.state.sentenceBank.reviewQueue = [];
  runtime.state.sentenceBank.currentQuestion = null;
  runtime.state.sentenceBank.wrongAnswers = 0;
  runtime.state.sentenceBank.sessionMistakeKeys = [];
  runtime.state.sentenceBank.availableScore = 0;
};

sentenceBank.renderSentenceBankIdleState = sentenceBank.renderSentenceBankIdleState || function renderSentenceBankIdleState() {
  const runtime = getRuntime();
  const h = getHelpers();
  runtime.state.mode = "sentenceBank";
  h.setGamePickerVisibility?.(false);
  h.setPromptCardVisibility?.(true);
  runtime.el.choiceContainer.classList.remove("summary-grid", "match-grid");
  runtime.el.choiceContainer.classList.add("sentence-bank-board");
  h.renderSessionHeader?.();
  app.ui?.renderPromptLabel?.("", false);
  runtime.el.promptText.classList.remove("hebrew", "english-prompt");
  runtime.el.promptText.textContent = translate("prompt.sentenceBankStart");
  runtime.el.choiceContainer.innerHTML = "";
  h.clearFeedback?.();
  h.renderPromptHint?.();
  app.ui?.renderPromptSpeechButton?.();
};

sentenceBank.startSentenceBank = sentenceBank.startSentenceBank || function startSentenceBank() {
  const runtime = getRuntime();
  const h = getHelpers();
  const session = getSession();

  app.speech?.cancel?.();
  session.stopVerbMatchTimer?.();
  session.stopLessonTimer?.();
  session.stopSentenceBankTimer?.();
  session.stopAbbreviationTimer?.();
  session.closeLeaveSessionConfirm?.();
  h.closeMasteredModal?.();
  h.resetVerbMatchState?.();
  h.resetAbbreviationState?.();
  h.resetAdvConjState?.();
  runtime.state.lesson.active = false;
  runtime.state.lesson.inReview = false;
  runtime.state.currentQuestion = null;
  session.clearSummaryState?.();
  session.clearLessonStartIntro?.();
  session.clearSecondChanceIntro?.();
  session.clearSentenceBankIntro?.();
  session.clearVerbMatchIntro?.();
  session.clearAbbreviationIntro?.();
  session.clearAdvConjIntro?.();
  h.resetSessionScore?.();
  sentenceBank.resetSentenceBankState();
  runtime.state.mode = "sentenceBank";
  runtime.state.route = "home";
  runtime.state.lastPlayedMode = "sentenceBank";
  runtime.el.choiceContainer.innerHTML = "";
  runtime.el.choiceContainer.classList.remove("match-grid");
  h.clearFeedback?.();

  if (!runtime.sentenceBankDeck?.length) {
    runtime.state.sentenceBank.active = false;
    sentenceBank.renderSentenceBankIdleState();
    app.ui?.renderPromptLabel?.(translate("prompt.noSentenceBankTitle"), true);
    runtime.el.promptText.classList.remove("hebrew");
    runtime.el.promptText.textContent = translate("prompt.noSentenceBankBody");
    h.setFeedback?.(translate("prompt.noSentenceBankTitle"), false);
    return;
  }

  runtime.state.sentenceBank.active = true;
  sentenceBank.playSentenceBankIntro();
  h.renderAll?.();
};

sentenceBank.playSentenceBankIntro = sentenceBank.playSentenceBankIntro || function playSentenceBankIntro() {
  const runtime = getRuntime();
  const session = getSession();
  const h = getHelpers();
  if (!runtime.el.sentenceBankIntro) {
    sentenceBank.beginSentenceBankFromIntro();
    return;
  }

  session.clearSentenceBankIntro?.();
  runtime.state.sentenceBank.introActive = true;
  h.showBlockingOverlay?.(runtime.el.sentenceBankIntro);
  session.scheduleIntroAutoAdvance?.(() => sentenceBank.beginSentenceBankFromIntro());
};

sentenceBank.beginSentenceBankFromIntro = sentenceBank.beginSentenceBankFromIntro || function beginSentenceBankFromIntro() {
  const runtime = getRuntime();
  const session = getSession();
  if (!runtime.state.sentenceBank.active) return;
  if (!runtime.state.sentenceBank.introActive && runtime.state.sentenceBank.currentQuestion) return;
  if (runtime.state.sentenceBank.introActive) {
    session.clearSentenceBankIntro?.();
  }
  if (!runtime.state.sentenceBank.startMs) {
    runtime.state.sentenceBank.startMs = Date.now();
    runtime.state.sentenceBank.elapsedSeconds = 0;
    session.startSentenceBankTimer?.();
  }
  sentenceBank.nextSentenceBankQuestion();
};

sentenceBank.buildSentenceBankQuestion = sentenceBank.buildSentenceBankQuestion || function buildSentenceBankQuestion(pool) {
  const runtime = getRuntime();
  const pair = pickWeightedPair(buildCandidatePairs(pool, runtime.state.sentenceBank.askedSentenceIds));
  if (!pair?.sentence) return null;
  runtime.state.sentenceBank.askedSentenceIds.push(pair.sentence.id);
  return buildQuestionFromPair(pair, { isReview: false });
};

sentenceBank.buildSentenceBankReviewQuestion = sentenceBank.buildSentenceBankReviewQuestion || function buildSentenceBankReviewQuestion(pool) {
  const runtime = getRuntime();
  while (runtime.state.sentenceBank.reviewQueue.length) {
    const candidate = runtime.state.sentenceBank.reviewQueue.shift();
    const sentence = pool.find((item) => item.id === candidate?.sentenceId);
    if (!sentence) continue;
    return buildQuestionFromPair({ sentence, direction: candidate.direction }, { isReview: true });
  }
  return null;
};

sentenceBank.tryStartReviewPhase = sentenceBank.tryStartReviewPhase || function tryStartReviewPhase() {
  const runtime = getRuntime();
  if (runtime.state.sentenceBank.inReview || !runtime.state.sentenceBank.reviewQueue.length) return false;
  runtime.state.sentenceBank.inReview = true;
  runtime.state.sentenceBank.secondChanceTotal = runtime.state.sentenceBank.reviewQueue.length;
  runtime.state.sentenceBank.secondChanceCurrent = 0;
  return true;
};

sentenceBank.nextSentenceBankQuestion = sentenceBank.nextSentenceBankQuestion || function nextSentenceBankQuestion() {
  const runtime = getRuntime();
  const h = getHelpers();
  const session = getSession();
  const pool = runtime.sentenceBankDeck || [];

  if (runtime.state.mode !== "sentenceBank") return;
  if (!runtime.state.sentenceBank.active) {
    session.goHome?.();
    return;
  }
  if (runtime.state.sentenceBank.introActive) return;

  const targetRounds = sentenceBank.getRoundTarget();
  if (!targetRounds) {
    session.finishSentenceBank?.();
    return;
  }

  if (!runtime.state.sentenceBank.inReview && runtime.state.sentenceBank.currentRound >= targetRounds) {
    if (!sentenceBank.tryStartReviewPhase()) {
      session.finishSentenceBank?.();
      return;
    }
    runtime.state.sentenceBank.currentQuestion = null;
    h.renderSessionHeader?.();
    sentenceBank.playSentenceBankIntro();
    return;
  }

  if (runtime.state.sentenceBank.inReview && runtime.state.sentenceBank.secondChanceCurrent >= runtime.state.sentenceBank.secondChanceTotal) {
    session.finishSentenceBank?.();
    return;
  }

  const question = runtime.state.sentenceBank.inReview
    ? sentenceBank.buildSentenceBankReviewQuestion(pool)
    : sentenceBank.buildSentenceBankQuestion(pool);
  if (!question) {
    runtime.state.sentenceBank.active = false;
    session.finishSentenceBank?.();
    return;
  }

  if (runtime.state.sentenceBank.inReview) {
    runtime.state.sentenceBank.secondChanceCurrent += 1;
  } else {
    runtime.state.sentenceBank.currentRound += 1;
    runtime.state.sentenceBank.availableScore += question.scoreValue;
  }
  runtime.state.sentenceBank.currentQuestion = question;
  h.clearFeedback?.();
  sentenceBank.renderSentenceBankQuestion();
};

sentenceBank.canSubmitCurrentQuestion = sentenceBank.canSubmitCurrentQuestion || function canSubmitCurrentQuestion(question = getRuntime().state.sentenceBank.currentQuestion) {
  return isAnswerComplete(question) && !question?.locked;
};

sentenceBank.renderSentenceBankQuestion = sentenceBank.renderSentenceBankQuestion || function renderSentenceBankQuestion() {
  const runtime = getRuntime();
  const h = getHelpers();
  const question = normalizeQuestionState(runtime.state.sentenceBank.currentQuestion);
  h.setGamePickerVisibility?.(false);
  h.setPromptCardVisibility?.(true);
  runtime.el.choiceContainer.classList.remove("summary-grid", "match-grid");
  runtime.el.choiceContainer.classList.add("sentence-bank-board");
  h.renderSessionHeader?.();

  if (!question) return;

  app.ui?.renderPromptLabel?.("", false);
  h.renderPromptText?.(question);
  sentenceBank.renderSentenceBankBoard(question);
  h.renderPromptHint?.();
};

sentenceBank.renderSentenceBankBoard = sentenceBank.renderSentenceBankBoard || function renderSentenceBankBoard(question) {
  const runtime = getRuntime();
  normalizeQuestionState(question);
  runtime.el.choiceContainer.innerHTML = "";
  const sentenceFrame = buildSentenceFrame(getCorrectAnswerText(question), question.targetTokens);
  const slotTokenIds = getQuestionSlotTokenIds(question);
  const slottedTokens = getSlottedTokens(question);

  const board = global.document.createElement("div");
  board.className = "sentence-builder";

  const answerRow = global.document.createElement("section");
  answerRow.className = `sentence-answer-line ${question.answerIsHebrew ? "hebrew" : "english"}`;
  answerRow.setAttribute("dir", question.answerIsHebrew ? "rtl" : "ltr");

  sentenceFrame.pieces.forEach((piece, index) => {
    if (piece.beforeText) {
      const staticText = global.document.createElement("span");
      staticText.className = "sentence-static";
      staticText.textContent = piece.beforeText;
      answerRow.append(staticText);
    }

    const pieceEl = global.document.createElement("span");
    pieceEl.className = "sentence-piece";

    const tokenId = slotTokenIds[index] || "";
    const token = slottedTokens[index] || null;
    const slot = global.document.createElement("button");
    slot.type = "button";
    slot.className = `choice-btn sentence-slot ${question.answerIsHebrew ? "hebrew" : ""}`;
    slot.style.setProperty("--slot-ch", String(Math.max(3, piece.tokenText.length)));
    slot.setAttribute("data-slot-index", String(index));
    slot.setAttribute("aria-label", buildSentenceSlotAriaLabel(question, index, token));
    slot.setAttribute("aria-description", buildSentenceSlotAriaDescription(question, token));
    if (token) {
      slot.classList.add("filled");
      slot.textContent = token.text;
      if (question.selectedBankTokenId === tokenId) {
        slot.classList.add("selected");
      }
      if (question.locked) {
        slot.classList.add(question.wasLastAnswerCorrect || token.text === piece.tokenText ? "correct" : "wrong");
      }
    } else {
      slot.classList.add("empty");
      slot.textContent = "\u00A0";
      if (question.selectedSlotIndex === index) {
        slot.classList.add("selected");
      }
    }

    slot.disabled = Boolean(question.locked);
    slot.draggable = Boolean(!question.locked && token);
    if (!question.locked) {
      slot.addEventListener("click", () => sentenceBank.selectSentenceSlot(index));
      slot.addEventListener("keydown", (event) => {
        sentenceBank.handleSentenceSlotKeydown(index, event);
      });
      if (token) {
        slot.addEventListener("dragstart", (event) => {
          clearQuestionSelection(question);
          setSentenceDragPayload({ type: "slot", slotIndex: index, tokenId });
          if (event?.dataTransfer?.setData) {
            event.dataTransfer.setData("application/x-ivriquest-sentence-token", JSON.stringify({ type: "slot", slotIndex: index, tokenId }));
            event.dataTransfer.effectAllowed = "move";
          }
        });
        slot.addEventListener("dragend", () => {
          clearSentenceDragPayload();
        });
      }
      slot.addEventListener("dragover", (event) => {
        const payload = resolveSentenceDragPayload(event);
        if (!canDropSentencePayload(question, index, payload)) return;
        event.preventDefault?.();
        slot.classList.toggle("insert-target", Boolean(token));
        slot.classList.toggle("drag-target", !token);
      });
      slot.addEventListener("dragenter", (event) => {
        const payload = resolveSentenceDragPayload(event);
        if (!canDropSentencePayload(question, index, payload)) return;
        event.preventDefault?.();
        slot.classList.toggle("insert-target", Boolean(token));
        slot.classList.toggle("drag-target", !token);
      });
      slot.addEventListener("dragleave", () => {
        slot.classList.remove("drag-target");
        slot.classList.remove("insert-target");
      });
      slot.addEventListener("drop", (event) => {
        event.preventDefault?.();
        slot.classList.remove("drag-target");
        slot.classList.remove("insert-target");
        sentenceBank.handleSlotDrop(index, resolveSentenceDragPayload(event));
      });
    }
    pieceEl.append(slot);
    if (piece.afterText) {
      const suffixText = global.document.createElement("span");
      suffixText.className = "sentence-static sentence-static-attached";
      suffixText.textContent = piece.afterText;
      pieceEl.append(suffixText);
    }
    answerRow.append(pieceEl);
  });

  if (sentenceFrame.trailingText) {
    const staticText = global.document.createElement("span");
    staticText.className = "sentence-static";
    staticText.textContent = sentenceFrame.trailingText;
    answerRow.append(staticText);
  }

  const answerMeta = global.document.createElement("p");
  answerMeta.className = "sentence-answer-meta small-note";
  answerMeta.textContent = translate("session.words", {
    count: `${getFilledSlotCount(question)}/${question.targetTokens.length}`,
  });

  const bankGrid = global.document.createElement("section");
  bankGrid.className = `sentence-token-bank ${question.answerIsHebrew ? "hebrew" : "english"}`;
  bankGrid.setAttribute("dir", question.answerIsHebrew ? "rtl" : "ltr");

  question.bankTokens.forEach((token) => {
    if (slotTokenIds.includes(token.id)) {
      return;
    }
    const btn = global.document.createElement("button");
    btn.type = "button";
    btn.className = `choice-btn sentence-token ${question.answerIsHebrew ? "hebrew" : ""}`;
    btn.textContent = token.text;
    const isSelected = question.selectedBankTokenId === token.id;
    btn.classList.toggle("selected", isSelected);
    btn.setAttribute("aria-label", buildSentenceBankTokenAriaLabel(token));
    btn.setAttribute("aria-description", buildSentenceBankTokenAriaDescription(isSelected));
    btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
    btn.disabled = Boolean(question.locked);
    btn.draggable = !btn.disabled;
    if (!btn.disabled) {
      btn.addEventListener("click", () => sentenceBank.selectBankToken(token.id));
      btn.addEventListener("keydown", (event) => {
        sentenceBank.handleSentenceBankTokenKeydown(token.id, event);
      });
      btn.addEventListener("dragstart", (event) => {
        clearQuestionSelection(question);
        setSentenceDragPayload({ type: "bank", tokenId: token.id });
        if (event?.dataTransfer?.setData) {
          event.dataTransfer.setData("application/x-ivriquest-sentence-token", JSON.stringify({ type: "bank", tokenId: token.id }));
          event.dataTransfer.effectAllowed = "move";
        }
      });
      btn.addEventListener("dragend", () => {
        clearSentenceDragPayload();
      });
    }
    bankGrid.append(btn);
  });

  board.append(answerRow, answerMeta, bankGrid);
  runtime.el.choiceContainer.append(board);
};

sentenceBank.placeTokenInSlot = sentenceBank.placeTokenInSlot || function placeTokenInSlot(tokenId, slotIndex, options = {}) {
  const runtime = getRuntime();
  const question = normalizeQuestionState(runtime.state.sentenceBank.currentQuestion);
  if (!question || question.locked) return false;
  const placed = placeTokenInSlotInternal(question, tokenId, slotIndex);
  if (!placed) return false;
  if (options.clearSelection !== false) {
    clearQuestionSelection(question);
  }
  if (options.render !== false) {
    sentenceBank.renderSentenceBankQuestion();
  }
  return true;
};

sentenceBank.placeTokenInNextEmptySlot = sentenceBank.placeTokenInNextEmptySlot || function placeTokenInNextEmptySlot(tokenId, options = {}) {
  const runtime = getRuntime();
  const question = normalizeQuestionState(runtime.state.sentenceBank.currentQuestion);
  if (!question || question.locked) return false;
  const nextEmptySlotIndex = getNextEmptySlotIndex(question);
  if (nextEmptySlotIndex < 0) return false;
  return sentenceBank.placeTokenInSlot(tokenId, nextEmptySlotIndex, options);
};

sentenceBank.insertTokenAtSlot = sentenceBank.insertTokenAtSlot || function insertTokenAtSlot(tokenId, slotIndex, options = {}) {
  const runtime = getRuntime();
  const question = normalizeQuestionState(runtime.state.sentenceBank.currentQuestion);
  if (!question || question.locked) return false;
  const inserted = insertTokenAtSlotInternal(question, tokenId, slotIndex, options);
  if (!inserted) return false;
  if (options.clearSelection !== false) {
    clearQuestionSelection(question);
  }
  if (options.render !== false) {
    sentenceBank.renderSentenceBankQuestion();
  }
  return true;
};

sentenceBank.movePlacedToken = sentenceBank.movePlacedToken || function movePlacedToken(fromIndex, toIndex, options = {}) {
  const runtime = getRuntime();
  const question = normalizeQuestionState(runtime.state.sentenceBank.currentQuestion);
  if (!question || question.locked) return false;
  const moved = movePlacedTokenInternal(question, fromIndex, toIndex);
  if (!moved) return false;
  if (options.clearSelection !== false) {
    clearQuestionSelection(question);
  }
  if (options.render !== false) {
    sentenceBank.renderSentenceBankQuestion();
  }
  return true;
};

sentenceBank.selectSentenceSlot = sentenceBank.selectSentenceSlot || function selectSentenceSlot(index) {
  const runtime = getRuntime();
  const question = normalizeQuestionState(runtime.state.sentenceBank.currentQuestion);
  if (!question || question.locked) return;

  const slotTokenIds = getQuestionSlotTokenIds(question);
  const normalizedIndex = normalizeSentenceSlotIndex(index, slotTokenIds.length);
  if (normalizedIndex === null) return;

  if (slotTokenIds[normalizedIndex]) {
    sentenceBank.removePlacedToken(normalizedIndex);
    return;
  }

  if (question.selectedBankTokenId) {
    sentenceBank.placeTokenInSlot(question.selectedBankTokenId, normalizedIndex, { render: false });
    clearQuestionSelection(question);
  } else {
    question.selectedSlotIndex = question.selectedSlotIndex === normalizedIndex ? null : normalizedIndex;
  }
  sentenceBank.renderSentenceBankQuestion();
};

sentenceBank.handleSentenceSlotKeydown = sentenceBank.handleSentenceSlotKeydown || function handleSentenceSlotKeydown(index, event) {
  const runtime = getRuntime();
  const question = normalizeQuestionState(runtime.state.sentenceBank.currentQuestion);
  if (!question || question.locked) return;

  const slotTokenIds = getQuestionSlotTokenIds(question);
  const normalizedIndex = normalizeSentenceSlotIndex(index, slotTokenIds.length);
  if (normalizedIndex === null) return;

  const key = String(event?.key || "");
  const hasToken = Boolean(slotTokenIds[normalizedIndex]);
  if (key === "Escape") {
    if (question.selectedBankTokenId || question.selectedSlotIndex !== null) {
      event.preventDefault?.();
      clearQuestionSelection(question);
      sentenceBank.renderSentenceBankQuestion();
    }
    return;
  }

  if (key === "Backspace" || key === "Delete") {
    if (hasToken) {
      event.preventDefault?.();
      sentenceBank.removePlacedToken(normalizedIndex);
    }
    return;
  }

  if (!question.selectedBankTokenId || (key !== "Enter" && key !== " " && key !== "Spacebar")) {
    return;
  }

  event.preventDefault?.();
  const handled = hasToken
    ? sentenceBank.insertTokenAtSlot(question.selectedBankTokenId, normalizedIndex, { render: false })
    : sentenceBank.placeTokenInSlot(question.selectedBankTokenId, normalizedIndex, { render: false });

  if (handled) {
    clearQuestionSelection(question);
  }
  sentenceBank.renderSentenceBankQuestion();
};

sentenceBank.handleSlotDrop = sentenceBank.handleSlotDrop || function handleSlotDrop(slotIndex, payload) {
  const runtime = getRuntime();
  const question = normalizeQuestionState(runtime.state.sentenceBank.currentQuestion);
  if (!question || question.locked) {
    clearSentenceDragPayload();
    return false;
  }

  const activePayload = payload || activeSentenceDrag;
  let handled = false;
  if (activePayload?.type === "slot") {
    handled = sentenceBank.insertTokenAtSlot(activePayload.tokenId, slotIndex, {
      fromIndex: activePayload.slotIndex,
      render: false,
    });
  } else if (activePayload?.type === "bank") {
    handled = sentenceBank.insertTokenAtSlot(activePayload.tokenId, slotIndex, { render: false });
  }

  clearQuestionSelection(question);
  clearSentenceDragPayload();
  if (handled) {
    sentenceBank.renderSentenceBankQuestion();
  }
  return handled;
};

sentenceBank.handleSentenceBankTokenKeydown = sentenceBank.handleSentenceBankTokenKeydown || function handleSentenceBankTokenKeydown(tokenId, event) {
  const runtime = getRuntime();
  const question = normalizeQuestionState(runtime.state.sentenceBank.currentQuestion);
  if (!question || question.locked || getQuestionSlotTokenIds(question).includes(tokenId)) {
    return;
  }

  const key = String(event?.key || "");
  if (key === "Escape") {
    if (question.selectedBankTokenId || question.selectedSlotIndex !== null) {
      event.preventDefault?.();
      clearQuestionSelection(question);
      sentenceBank.renderSentenceBankQuestion();
    }
    return;
  }

  if (key !== " " && key !== "Spacebar") {
    return;
  }

  event.preventDefault?.();
  question.selectedSlotIndex = null;
  question.selectedBankTokenId = question.selectedBankTokenId === tokenId ? "" : tokenId;
  sentenceBank.renderSentenceBankQuestion();
};

sentenceBank.selectBankToken = sentenceBank.selectBankToken || function selectBankToken(tokenId) {
  const runtime = getRuntime();
  const question = normalizeQuestionState(runtime.state.sentenceBank.currentQuestion);
  if (!question || question.locked || getQuestionSlotTokenIds(question).includes(tokenId)) {
    return;
  }
  if (question.selectedSlotIndex !== null) {
    sentenceBank.placeTokenInSlot(tokenId, question.selectedSlotIndex, { render: false });
    clearQuestionSelection(question);
  } else {
    const placed = sentenceBank.placeTokenInNextEmptySlot(tokenId, { render: false });
    if (!placed) {
      const nextSelectedTokenId = question.selectedBankTokenId === tokenId ? "" : tokenId;
      question.selectedBankTokenId = nextSelectedTokenId;
    } else {
      clearQuestionSelection(question);
    }
  }
  sentenceBank.renderSentenceBankQuestion();
};

sentenceBank.removePlacedToken = sentenceBank.removePlacedToken || function removePlacedToken(index) {
  const runtime = getRuntime();
  const question = normalizeQuestionState(runtime.state.sentenceBank.currentQuestion);
  if (!question || question.locked) return;
  const slotTokenIds = getQuestionSlotTokenIds(question);
  const normalizedIndex = normalizeSentenceSlotIndex(index, slotTokenIds.length);
  if (normalizedIndex === null || !slotTokenIds[normalizedIndex]) return;
  slotTokenIds[normalizedIndex] = "";
  syncQuestionSlotState(question, slotTokenIds);
  if (question.selectedSlotIndex === normalizedIndex) {
    question.selectedSlotIndex = null;
  }
  sentenceBank.renderSentenceBankQuestion();
};

sentenceBank.clearAnswer = sentenceBank.clearAnswer || function clearAnswer() {
  const runtime = getRuntime();
  const question = normalizeQuestionState(runtime.state.sentenceBank.currentQuestion);
  if (!question || question.locked || !getFilledSlotCount(question)) return;
  question.slotTokenIds = buildEmptySentenceSlots(question.targetTokens.length);
  question.placedBankTokenIds = [];
  clearQuestionSelection(question);
  sentenceBank.renderSentenceBankQuestion();
};

sentenceBank.toggleHint = sentenceBank.toggleHint || function toggleHint() {
  return false;
};

sentenceBank.applySentenceBankAnswer = sentenceBank.applySentenceBankAnswer || function applySentenceBankAnswer() {
  const runtime = getRuntime();
  const h = getHelpers();
  const question = normalizeQuestionState(runtime.state.sentenceBank.currentQuestion);
  if (!question || question.locked || !isAnswerComplete(question)) return;

  const isCorrect = isPlacedAnswerCorrect(question);
  const correctAnswer = getCorrectAnswerText(question);
  const questionKey = getQuestionKey(question);

  app.speech?.cancel?.();
  clearQuestionSelection(question);
  clearSentenceDragPayload();
  question.wasLastAnswerCorrect = isCorrect;
  question.locked = true;
  updateSentenceProgress(question.sentence.id, question.direction, isCorrect);
  runtime.state.sessionStreak = isCorrect ? runtime.state.sessionStreak + 1 : 0;

  if (isCorrect) {
    if (!question.isReview) {
      runtime.state.sessionScore += question.scoreValue;
    }
  } else {
    runtime.state.sentenceBank.wrongAnswers += 1;
    if (!runtime.state.sentenceBank.sessionMistakeKeys.includes(questionKey)) {
      runtime.state.sentenceBank.sessionMistakeKeys.push(questionKey);
    }
  }

  if (!isCorrect && !question.isReview) {
    const alreadyQueued = runtime.state.sentenceBank.reviewQueue.some(
      (entry) => buildSentenceProgressKey(entry.sentenceId, entry.direction) === questionKey
    );
    if (!alreadyQueued) {
      runtime.state.sentenceBank.reviewQueue.push({
        sentenceId: question.sentence.id,
        direction: question.direction,
      });
    }
  }

  h.setFeedback?.(
    question.direction === "he2en"
      ? {
          tone: isCorrect ? "success" : "error",
          sentence: translate(
            isCorrect ? "feedback.sentenceBankCorrectToEnglish" : "feedback.sentenceBankWrongToEnglish",
            { answer: correctAnswer }
          ),
          detail: buildSentenceFeedbackDetail(question, isCorrect),
        }
      : {
          tone: isCorrect ? "success" : "error",
          sentence: translate(
            isCorrect ? "feedback.sentenceBankCorrectToHebrew" : "feedback.sentenceBankWrongToHebrew",
            { answer: correctAnswer }
          ),
          detail: buildSentenceFeedbackDetail(question, isCorrect),
        }
  );
  h.playAnswerFeedbackSound?.(isCorrect);

  app.persistence?.saveSentenceProgress?.();
  sentenceBank.renderSentenceBankQuestion();
  h.renderDomainPerformance?.();
  h.renderMostMissed?.();
};
})(typeof window !== "undefined" ? window : globalThis);
