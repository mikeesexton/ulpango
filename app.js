(function initIvriQuestApp(global) {
"use strict";
const APP_BUILD = "20260315b";

if (global.__ivriquestAppInitialized === APP_BUILD) {
  return;
}
global.__ivriquestAppInitialized = APP_BUILD;

const appFoundation = global.IvriQuestApp || {};
const foundationConstants = appFoundation.constants || {};
const foundationStorage = appFoundation.storage || {};
const foundationUtils = appFoundation.utils || {};
const foundationHebrew = appFoundation.hebrew || {};
const bootstrapDataModule = appFoundation.bootstrapData || {};
const contentSourcesModule = appFoundation.contentSources || {};
const bootstrapRuntimeModule = appFoundation.bootstrapRuntime || {};
const audioModule = appFoundation.audio || {};
const persistenceModule = appFoundation.persistence || {};
const sessionModule = appFoundation.session || {};
const i18nModule = appFoundation.i18n || {};
const uiModule = appFoundation.ui || {};
const dataModule = appFoundation.data || {};
const lessonModule = appFoundation.lessonMode || {};
const abbreviationModule = appFoundation.abbreviation || {};
const advConjModule = appFoundation.advConj || {};
const verbMatchModule = appFoundation.verbMatch || {};
const controllerModule = appFoundation.controller || {};
const appRuntime = appFoundation.runtime = appFoundation.runtime || {};

appRuntime.global = global;
appRuntime.APP_BUILD = APP_BUILD;
appRuntime.constants = foundationConstants;
appRuntime.storageApi = foundationStorage;

const STORAGE_KEYS = foundationConstants.STORAGE_KEYS;
const LEITNER_INTERVALS = foundationConstants.LEITNER_INTERVALS;
const LESSON_ROUNDS = foundationConstants.LESSON_ROUNDS;
const ABBREVIATION_ROUNDS = foundationConstants.ABBREVIATION_ROUNDS;
const ADV_CONJ_ROUNDS = foundationConstants.ADV_CONJ_ROUNDS;
const STREAK_SOUND_INTERVAL = foundationConstants.STREAK_SOUND_INTERVAL;
const ADV_CONJ_SUBJECTS = foundationConstants.ADV_CONJ_SUBJECTS;
const ADV_CONJ_OBJECTS = foundationConstants.ADV_CONJ_OBJECTS;
const VERB_MATCH_ROUNDS = foundationConstants.VERB_MATCH_ROUNDS;
const MATCH_MAX_PAIRS = foundationConstants.MATCH_MAX_PAIRS;
const MATCH_VISIBLE_ROWS = foundationConstants.MATCH_VISIBLE_ROWS;
const CONJUGATION_MASTER_STREAK = foundationConstants.CONJUGATION_MASTER_STREAK;
const VOCABULARY_AVAILABILITY_DEFAULTS = foundationConstants.VOCABULARY_AVAILABILITY_DEFAULTS;
const FEEDBACK_SURVEY_URL = foundationConstants.FEEDBACK_SURVEY_URL;

const getStorage = foundationStorage.getStorage;
const loadJson = foundationStorage.loadJson;
const saveJson = foundationStorage.saveJson;

const normalizeVocabularyAvailability = foundationUtils.normalizeVocabularyAvailability;
const weightedRandomWord = foundationUtils.weightedRandomWord;
const shuffle = foundationUtils.shuffle;

const stripNiqqud = foundationHebrew.stripNiqqud;
const prepareVocabulary = foundationHebrew.prepareVocabulary;
const toMedialHebrewLetter = foundationHebrew.toMedialHebrewLetter;
const normalizeGeneratedHebrewForms = foundationHebrew.normalizeGeneratedHebrewForms;
const normalizeHebrewToMedial = foundationHebrew.normalizeHebrewToMedial;
const normalizeHebrewSofitForms = foundationHebrew.normalizeHebrewSofitForms;

const I18N = bootstrapDataModule.I18N;
const PERFORMANCE_DOMAINS = bootstrapDataModule.PERFORMANCE_DOMAINS;
const DOMAIN_BY_CATEGORY = bootstrapDataModule.DOMAIN_BY_CATEGORY;
const FALLBACK_DOMAIN_ID = bootstrapDataModule.FALLBACK_DOMAIN_ID;
const resolveContentApis = contentSourcesModule.resolveContentApis;
const createElementRegistry = bootstrapRuntimeModule.createElementRegistry;
const createInitialState = bootstrapRuntimeModule.createInitialState;
const resolvedContentApis = resolveContentApis ? resolveContentApis(global) : {};

const {
  verbApi,
  fallbackVerbApi,
  usingFallbackVocab,
  usingFallbackAbbreviations,
  getBaseVocabularyFn,
  getAbbreviationsFn,
  expansionTrackCount,
} = resolvedContentApis;

const buildAudioCueSources = audioModule.buildAudioCueSources;
const getAudioPlayer = audioModule.getAudioPlayer;
const resolveAudioCueSource = audioModule.resolveAudioCueSource;
const primeAudioCues = audioModule.primeAudioCues;
const playSoundCue = audioModule.playSoundCue;
const playAnswerFeedbackSound = audioModule.playAnswerFeedbackSound;

const clearPersistedSession = persistenceModule.clearPersistedSession;
const loadLanguagePreference = persistenceModule.loadLanguagePreference;
const saveLanguagePreference = persistenceModule.saveLanguagePreference;
const loadThemePreference = persistenceModule.loadThemePreference;
const saveThemePreference = persistenceModule.saveThemePreference;
const loadSoundPreference = persistenceModule.loadSoundPreference;
const saveSoundPreference = persistenceModule.saveSoundPreference;
const hasSeenWelcomeModal = persistenceModule.hasSeenWelcomeModal;
const markWelcomeModalSeen = persistenceModule.markWelcomeModalSeen;
const applySurveyLinks = persistenceModule.applySurveyLinks;
const saveProgress = persistenceModule.saveProgress;
const persistUiState = persistenceModule.persistUiState;
const persistSessionState = persistenceModule.persistSessionState;

const applyLanguage = i18nModule.applyLanguage;
const applyTheme = i18nModule.applyTheme;
const toggleLanguage = i18nModule.toggleLanguage;
const toggleTheme = i18nModule.toggleTheme;
const toggleNiqqudPreference = i18nModule.toggleNiqqudPreference;
const toggleSoundPreference = i18nModule.toggleSoundPreference;
const getLocaleBundle = i18nModule.getLocaleBundle;
const getLanguageToggleLabel = i18nModule.getLanguageToggleLabel;
const getNestedTranslation = i18nModule.getNestedTranslation;
const t = i18nModule.t;

const hasActiveLearnSession = sessionModule.hasActiveLearnSession;
const isModeSessionActive = sessionModule.isModeSessionActive;
const resolveInitialRoute = sessionModule.resolveInitialRoute;
const restoreSessionState = sessionModule.restoreSessionState;
const navigateTo = sessionModule.navigateTo;
const restorePendingOverlays = sessionModule.restorePendingOverlays;
const resumeActiveTimers = sessionModule.resumeActiveTimers;
const clearIntroAutoAdvance = sessionModule.clearIntroAutoAdvance;
const scheduleIntroAutoAdvance = sessionModule.scheduleIntroAutoAdvance;
const clearSummaryState = sessionModule.clearSummaryState;
const openLeaveSessionConfirm = sessionModule.openLeaveSessionConfirm;
const closeLeaveSessionConfirm = sessionModule.closeLeaveSessionConfirm;
const confirmLeaveSession = sessionModule.confirmLeaveSession;
const requestLeaveSession = sessionModule.requestLeaveSession;
const requestGoHome = sessionModule.requestGoHome;
const endSessionAndNavigate = sessionModule.endSessionAndNavigate;
const goHome = sessionModule.goHome;
const showSessionSummary = sessionModule.showSessionSummary;
const finishLesson = sessionModule.finishLesson;
const finishAbbreviation = sessionModule.finishAbbreviation;
const clearAbbreviationIntro = sessionModule.clearAbbreviationIntro;
const startAbbreviationTimer = sessionModule.startAbbreviationTimer;
const stopAbbreviationTimer = sessionModule.stopAbbreviationTimer;
const resetAdvConjState = sessionModule.resetAdvConjState;
const clearAdvConjIntro = sessionModule.clearAdvConjIntro;
const finishAdvConj = sessionModule.finishAdvConj;
const clearLessonStartIntro = sessionModule.clearLessonStartIntro;
const clearSecondChanceIntro = sessionModule.clearSecondChanceIntro;
const clearVerbMatchIntro = sessionModule.clearVerbMatchIntro;
const startVerbMatchTimer = sessionModule.startVerbMatchTimer;
const stopVerbMatchTimer = sessionModule.stopVerbMatchTimer;
const startLessonTimer = sessionModule.startLessonTimer;
const stopLessonTimer = sessionModule.stopLessonTimer;

const isUiLocked = uiModule.isUiLocked;
const updateUiLockState = uiModule.updateUiLockState;
const showBlockingOverlay = uiModule.showBlockingOverlay;
const hideBlockingOverlay = uiModule.hideBlockingOverlay;
const renderHomeButton = uiModule.renderHomeButton;
const renderNiqqudToggle = uiModule.renderNiqqudToggle;
const renderSoundToggle = uiModule.renderSoundToggle;
const renderThemeToggle = uiModule.renderThemeToggle;
const setGamePickerVisibility = uiModule.setGamePickerVisibility;
const setPromptCardVisibility = uiModule.setPromptCardVisibility;
const renderRouteVisibility = uiModule.renderRouteVisibility;
const renderShellChrome = uiModule.renderShellChrome;
const updateLessonProgress = uiModule.updateLessonProgress;
const questionNeedsSelection = uiModule.questionNeedsSelection;
const getHebrewText = uiModule.getHebrewText;
const buildAnswerDisplay = uiModule.buildAnswerDisplay;
const setFeedback = uiModule.setFeedback;
const clearFeedback = uiModule.clearFeedback;
const resetSessionCounters = uiModule.resetSessionCounters;
const renderAll = uiModule.renderAll;
const renderLearnState = uiModule.renderLearnState;
const renderSessionHeader = uiModule.renderSessionHeader;
const renderPromptText = uiModule.renderPromptText;
const renderPoolMeta = uiModule.renderPoolMeta;
const renderDomainPerformance = uiModule.renderDomainPerformance;
const renderGameModePerformance = uiModule.renderGameModePerformance;
const renderPerformanceCardsInto = uiModule.renderPerformanceCardsInto;
const appendPerformanceCard = uiModule.appendPerformanceCard;
const renderHomeState = uiModule.renderHomeState;
const renderSummaryState = uiModule.renderSummaryState;
const renderReviewState = uiModule.renderReviewState;
const getSummaryScoreValue = uiModule.getSummaryScoreValue;
const getSummaryScoreTotal = uiModule.getSummaryScoreTotal;
const getSummaryAccuracyPercent = uiModule.getSummaryAccuracyPercent;
const isPerfectSummary = uiModule.isPerfectSummary;
const formatResultSeconds = uiModule.formatResultSeconds;
const buildSummaryMetrics = uiModule.buildSummaryMetrics;
const createResultsPerformanceGraphic = uiModule.createResultsPerformanceGraphic;
const renderSettingsState = uiModule.renderSettingsState;
const createCompactRow = uiModule.createCompactRow;
const createResultsMetric = uiModule.createResultsMetric;
const renderIdleLessonState = uiModule.renderIdleLessonState;
const renderHomeLessonButtons = uiModule.renderHomeLessonButtons;
const setHomeLessonState = uiModule.setHomeLessonState;
const renderHomeOptions = uiModule.renderHomeOptions;
const renderMostMissed = uiModule.renderMostMissed;
const closeMasteredModal = uiModule.closeMasteredModal;
const closeWelcomeModal = uiModule.closeWelcomeModal;
const renderWelcomeModal = uiModule.renderWelcomeModal;
const renderMasteredModal = uiModule.renderMasteredModal;
const restoreSelectedMasteredWords = uiModule.restoreSelectedMasteredWords;

const getMostMissedRanked = dataModule.getMostMissedRanked;
const buildLessonMistakeSummary = dataModule.buildLessonMistakeSummary;
const buildAbbreviationMistakeSummary = dataModule.buildAbbreviationMistakeSummary;
const buildVerbMatchMistakeSummary = dataModule.buildVerbMatchMistakeSummary;
const calculateDomainStats = dataModule.calculateDomainStats;
const calculateGameModeStats = dataModule.calculateGameModeStats;
const getDomainIdForWord = dataModule.getDomainIdForWord;
const pickLeastSeenLessonDomainId = dataModule.pickLeastSeenLessonDomainId;
const pickBestWord = dataModule.pickBestWord;
const updateProgress = dataModule.updateProgress;
const getProgressRecord = dataModule.getProgressRecord;
const getMissCountForRecord = dataModule.getMissCountForRecord;
const getDueWords = dataModule.getDueWords;
const isWordAvailableForMode = dataModule.isWordAvailableForMode;
const getVocabularyForMode = dataModule.getVocabularyForMode;
const getSelectedPool = dataModule.getSelectedPool;
const getAllVocabulary = dataModule.getAllVocabulary;
const getWordById = dataModule.getWordById;
const isWordMastered = dataModule.isWordMastered;
const getMasteredWords = dataModule.getMasteredWords;
const setWordMastered = dataModule.setWordMastered;
const updateConjugationProgress = dataModule.updateConjugationProgress;
const recordConjugationRound = dataModule.recordConjugationRound;

const startLesson = lessonModule.startLesson;
const playLessonStartIntro = lessonModule.playLessonStartIntro;
const beginLessonFromIntro = lessonModule.beginLessonFromIntro;
const playSecondChanceIntro = lessonModule.playSecondChanceIntro;
const beginSecondChanceFromIntro = lessonModule.beginSecondChanceFromIntro;
const nextQuestion = lessonModule.nextQuestion;
const renderQuestion = lessonModule.renderQuestion;
const renderChoices = lessonModule.renderChoices;
const applyAnswer = lessonModule.applyAnswer;
const markChoiceResults = lessonModule.markChoiceResults;
const cloneLessonQuestionSnapshot = lessonModule.cloneLessonQuestionSnapshot;
const buildQuestion = lessonModule.buildQuestion;
const buildReviewQuestion = lessonModule.buildReviewQuestion;
const buildOptions = lessonModule.buildOptions;
const pickQuestionMode = lessonModule.pickQuestionMode;
const rememberOptionHistory = lessonModule.rememberOptionHistory;
const tryStartReviewPhase = lessonModule.tryStartReviewPhase;

const getAbbreviationRoundTarget = abbreviationModule.getAbbreviationRoundTarget;
const cloneAbbreviationQuestionSnapshot = abbreviationModule.cloneAbbreviationQuestionSnapshot;
const prepareAbbreviationDeck = abbreviationModule.prepareAbbreviationDeck;
const renderAbbreviationIdleState = abbreviationModule.renderAbbreviationIdleState;
const startAbbreviation = abbreviationModule.startAbbreviation;
const resetAbbreviationState = abbreviationModule.resetAbbreviationState;
const playAbbreviationIntro = abbreviationModule.playAbbreviationIntro;
const beginAbbreviationFromIntro = abbreviationModule.beginAbbreviationFromIntro;
const nextAbbreviationQuestion = abbreviationModule.nextAbbreviationQuestion;
const renderAbbreviationQuestion = abbreviationModule.renderAbbreviationQuestion;
const renderAbbreviationChoices = abbreviationModule.renderAbbreviationChoices;
const applyAbbreviationAnswer = abbreviationModule.applyAbbreviationAnswer;
const markAbbreviationChoiceResults = abbreviationModule.markAbbreviationChoiceResults;
const buildAbbreviationQuestion = abbreviationModule.buildAbbreviationQuestion;
const buildAbbreviationOptions = abbreviationModule.buildAbbreviationOptions;
const pickBestAbbreviationEntry = abbreviationModule.pickBestAbbreviationEntry;
const getDueAbbreviationEntries = abbreviationModule.getDueAbbreviationEntries;

const buildAdvConjHebrewAnswer = advConjModule.buildAdvConjHebrewAnswer;
const buildAdvConjEnglishSentence = advConjModule.buildAdvConjEnglishSentence;
const getAdvConjSubjectsForTense = advConjModule.getAdvConjSubjectsForTense;
const getAdvConjTrailingQualifier = advConjModule.getAdvConjTrailingQualifier;
const stripAdvConjTrailingQualifier = advConjModule.stripAdvConjTrailingQualifier;
const buildAdvConjDeck = advConjModule.buildAdvConjDeck;
const startAdvConj = advConjModule.startAdvConj;
const playAdvConjIntro = advConjModule.playAdvConjIntro;
const beginAdvConjFromIntro = advConjModule.beginAdvConjFromIntro;
const loadAdvConjQuestion = advConjModule.loadAdvConjQuestion;
const renderAdvConjQuestion = advConjModule.renderAdvConjQuestion;
const renderAdvConjChoices = advConjModule.renderAdvConjChoices;
const markAdvConjChoiceResults = advConjModule.markAdvConjChoiceResults;
const applyAdvConjAnswer = advConjModule.applyAdvConjAnswer;
const updateAdvConjStats = advConjModule.updateAdvConjStats;
const buildAdvConjMistakeSummary = advConjModule.buildAdvConjMistakeSummary;

const moveEligibleVerbToMastered = verbMatchModule.moveEligibleVerbToMastered;
const startVerbMatch = verbMatchModule.startVerbMatch;
const playVerbMatchIntro = verbMatchModule.playVerbMatchIntro;
const beginVerbMatchFromIntro = verbMatchModule.beginVerbMatchFromIntro;
const resetVerbMatchState = verbMatchModule.resetVerbMatchState;
const finishVerbMatchSession = verbMatchModule.finishVerbMatchSession;
const loadNextVerbRound = verbMatchModule.loadNextVerbRound;
const selectVerbRoundPairs = verbMatchModule.selectVerbRoundPairs;
const refillVerbMatchColumns = verbMatchModule.refillVerbMatchColumns;
const renderVerbMatchIdleState = verbMatchModule.renderVerbMatchIdleState;
const renderVerbMatchRound = verbMatchModule.renderVerbMatchRound;
const renderVerbMatchPrompt = verbMatchModule.renderVerbMatchPrompt;
const renderVerbMatchCards = verbMatchModule.renderVerbMatchCards;
const handleVerbMatchLeft = verbMatchModule.handleVerbMatchLeft;
const handleVerbMatchRight = verbMatchModule.handleVerbMatchRight;
const resolveVerbMatchSelection = verbMatchModule.resolveVerbMatchSelection;
const applyVerbMatchSuccess = verbMatchModule.applyVerbMatchSuccess;
const applyVerbMatchMismatch = verbMatchModule.applyVerbMatchMismatch;

const bindUi = controllerModule.bindUi;
const handleRouteButtonPress = controllerModule.handleRouteButtonPress;
const stopIntroOverlayInteraction = controllerModule.stopIntroOverlayInteraction;
const openHomeLesson = controllerModule.openHomeLesson;
const continueFromResults = controllerModule.continueFromResults;
const leaveSummaryAndNavigate = controllerModule.leaveSummaryAndNavigate;
const sanitizeState = controllerModule.sanitizeState;
const getVisibleVerbMatchRows = controllerModule.getVisibleVerbMatchRows;
const handleNextAction = controllerModule.handleNextAction;

if (
  !STORAGE_KEYS ||
  !LEITNER_INTERVALS ||
  !ADV_CONJ_SUBJECTS ||
  !ADV_CONJ_OBJECTS ||
  !getStorage ||
  !loadJson ||
  !saveJson ||
  !normalizeVocabularyAvailability ||
  !weightedRandomWord ||
  !shuffle ||
  !prepareVocabulary ||
  !toMedialHebrewLetter ||
  !normalizeGeneratedHebrewForms ||
  !normalizeHebrewToMedial ||
  !normalizeHebrewSofitForms ||
  !stripNiqqud ||
  !resolveContentApis ||
  !verbApi ||
  !fallbackVerbApi ||
  !getBaseVocabularyFn ||
  !getAbbreviationsFn ||
  !createElementRegistry ||
  !createInitialState ||
  !buildAudioCueSources ||
  !getAudioPlayer ||
  !resolveAudioCueSource ||
  !primeAudioCues ||
  !playSoundCue ||
  !playAnswerFeedbackSound ||
  !clearPersistedSession ||
  !loadLanguagePreference ||
  !saveLanguagePreference ||
  !loadThemePreference ||
  !saveThemePreference ||
  !loadSoundPreference ||
  !saveSoundPreference ||
  !hasSeenWelcomeModal ||
  !markWelcomeModalSeen ||
  !applySurveyLinks ||
  !saveProgress ||
  !persistUiState ||
  !persistSessionState ||
  !applyLanguage ||
  !applyTheme ||
  !toggleLanguage ||
  !toggleTheme ||
  !toggleNiqqudPreference ||
  !toggleSoundPreference ||
  !getLocaleBundle ||
  !getLanguageToggleLabel ||
  !getNestedTranslation ||
  !t ||
  !hasActiveLearnSession ||
  !isModeSessionActive ||
  !resolveInitialRoute ||
  !restoreSessionState ||
  !navigateTo ||
  !restorePendingOverlays ||
  !resumeActiveTimers ||
  !clearIntroAutoAdvance ||
  !scheduleIntroAutoAdvance ||
  !clearSummaryState ||
  !openLeaveSessionConfirm ||
  !closeLeaveSessionConfirm ||
  !confirmLeaveSession ||
  !requestLeaveSession ||
  !requestGoHome ||
  !endSessionAndNavigate ||
  !goHome ||
  !showSessionSummary ||
  !finishLesson ||
  !finishAbbreviation ||
  !clearAbbreviationIntro ||
  !startAbbreviationTimer ||
  !stopAbbreviationTimer ||
  !resetAdvConjState ||
  !clearAdvConjIntro ||
  !finishAdvConj ||
  !clearLessonStartIntro ||
  !clearSecondChanceIntro ||
  !clearVerbMatchIntro ||
  !startVerbMatchTimer ||
  !stopVerbMatchTimer ||
  !startLessonTimer ||
  !stopLessonTimer ||
  !isUiLocked ||
  !updateUiLockState ||
  !showBlockingOverlay ||
  !hideBlockingOverlay ||
  !renderHomeButton ||
  !renderNiqqudToggle ||
  !renderSoundToggle ||
  !renderThemeToggle ||
  !setGamePickerVisibility ||
  !setPromptCardVisibility ||
  !renderRouteVisibility ||
  !renderShellChrome ||
  !updateLessonProgress ||
  !questionNeedsSelection ||
  !getHebrewText ||
  !buildAnswerDisplay ||
  !setFeedback ||
  !clearFeedback ||
  !resetSessionCounters ||
  !renderAll ||
  !renderLearnState ||
  !renderSessionHeader ||
  !renderPromptText ||
  !renderPoolMeta ||
  !renderDomainPerformance ||
  !renderGameModePerformance ||
  !renderPerformanceCardsInto ||
  !appendPerformanceCard ||
  !renderHomeState ||
  !renderSummaryState ||
  !renderReviewState ||
  !getSummaryScoreValue ||
  !getSummaryScoreTotal ||
  !getSummaryAccuracyPercent ||
  !isPerfectSummary ||
  !formatResultSeconds ||
  !buildSummaryMetrics ||
  !createResultsPerformanceGraphic ||
  !renderSettingsState ||
  !createCompactRow ||
  !createResultsMetric ||
  !renderIdleLessonState ||
  !renderHomeLessonButtons ||
  !setHomeLessonState ||
  !renderHomeOptions ||
  !renderMostMissed ||
  !closeMasteredModal ||
  !closeWelcomeModal ||
  !renderWelcomeModal ||
  !renderMasteredModal ||
  !restoreSelectedMasteredWords ||
  !getMostMissedRanked ||
  !buildLessonMistakeSummary ||
  !buildAbbreviationMistakeSummary ||
  !buildVerbMatchMistakeSummary ||
  !calculateDomainStats ||
  !calculateGameModeStats ||
  !getDomainIdForWord ||
  !pickLeastSeenLessonDomainId ||
  !pickBestWord ||
  !updateProgress ||
  !getProgressRecord ||
  !getMissCountForRecord ||
  !getDueWords ||
  !isWordAvailableForMode ||
  !getVocabularyForMode ||
  !getSelectedPool ||
  !getAllVocabulary ||
  !getWordById ||
  !isWordMastered ||
  !getMasteredWords ||
  !setWordMastered ||
  !updateConjugationProgress ||
  !recordConjugationRound ||
  !startLesson ||
  !playLessonStartIntro ||
  !beginLessonFromIntro ||
  !playSecondChanceIntro ||
  !beginSecondChanceFromIntro ||
  !nextQuestion ||
  !renderQuestion ||
  !renderChoices ||
  !applyAnswer ||
  !markChoiceResults ||
  !cloneLessonQuestionSnapshot ||
  !buildQuestion ||
  !buildReviewQuestion ||
  !buildOptions ||
  !pickQuestionMode ||
  !rememberOptionHistory ||
  !tryStartReviewPhase ||
  !getAbbreviationRoundTarget ||
  !cloneAbbreviationQuestionSnapshot ||
  !prepareAbbreviationDeck ||
  !renderAbbreviationIdleState ||
  !startAbbreviation ||
  !resetAbbreviationState ||
  !playAbbreviationIntro ||
  !beginAbbreviationFromIntro ||
  !nextAbbreviationQuestion ||
  !renderAbbreviationQuestion ||
  !renderAbbreviationChoices ||
  !applyAbbreviationAnswer ||
  !markAbbreviationChoiceResults ||
  !buildAbbreviationQuestion ||
  !buildAbbreviationOptions ||
  !pickBestAbbreviationEntry ||
  !getDueAbbreviationEntries ||
  !buildAdvConjHebrewAnswer ||
  !buildAdvConjEnglishSentence ||
  !getAdvConjSubjectsForTense ||
  !getAdvConjTrailingQualifier ||
  !stripAdvConjTrailingQualifier ||
  !buildAdvConjDeck ||
  !startAdvConj ||
  !playAdvConjIntro ||
  !beginAdvConjFromIntro ||
  !loadAdvConjQuestion ||
  !renderAdvConjQuestion ||
  !renderAdvConjChoices ||
  !markAdvConjChoiceResults ||
  !applyAdvConjAnswer ||
  !updateAdvConjStats ||
  !buildAdvConjMistakeSummary ||
  !moveEligibleVerbToMastered ||
  !startVerbMatch ||
  !playVerbMatchIntro ||
  !beginVerbMatchFromIntro ||
  !resetVerbMatchState ||
  !finishVerbMatchSession ||
  !loadNextVerbRound ||
  !selectVerbRoundPairs ||
  !refillVerbMatchColumns ||
  !renderVerbMatchIdleState ||
  !renderVerbMatchRound ||
  !renderVerbMatchPrompt ||
  !renderVerbMatchCards ||
  !handleVerbMatchLeft ||
  !handleVerbMatchRight ||
  !resolveVerbMatchSelection ||
  !applyVerbMatchSuccess ||
  !applyVerbMatchMismatch ||
  !bindUi ||
  !handleRouteButtonPress ||
  !stopIntroOverlayInteraction ||
  !openHomeLesson ||
  !continueFromResults ||
  !leaveSummaryAndNavigate ||
  !sanitizeState ||
  !getVisibleVerbMatchRows ||
  !I18N ||
  !PERFORMANCE_DOMAINS ||
  !DOMAIN_BY_CATEGORY ||
  !FALLBACK_DOMAIN_ID ||
  !handleNextAction
) {
  throw new Error("IvriQuest foundation scripts failed to load.");
}

const AUDIO_CUES = Object.freeze({
  answerCorrect: buildAudioCueSources("answer-correct"),
  answerStreak: buildAudioCueSources("answer-streak"),
  answerWrong: buildAudioCueSources("answer-wrong"),
});
appRuntime.AUDIO_CUES = AUDIO_CUES;

const storage = getStorage();
const restoredUi = loadJson(STORAGE_KEYS.ui, {});
const restoredSession = loadJson(STORAGE_KEYS.session, null);
const audioPlayers = new Map();
appRuntime.storage = storage;
appRuntime.audioPlayers = audioPlayers;
appRuntime.audioCuePreloadStarted = false;
appRuntime.i18nBundles = I18N;
const MATCH_FORM_ORDER = Array.isArray(verbApi.MATCH_FORM_ORDER) && verbApi.MATCH_FORM_ORDER.length
  ? [...verbApi.MATCH_FORM_ORDER]
  : [...fallbackVerbApi.MATCH_FORM_ORDER];
appRuntime.matchFormOrder = MATCH_FORM_ORDER;

const baseVocabulary = prepareVocabulary([
  ...getBaseVocabularyFn(),
  ...(typeof verbApi.getSeedVocabularyEntries === "function" ? verbApi.getSeedVocabularyEntries() : []),
]);
const abbreviationDeck = prepareAbbreviationDeck(getAbbreviationsFn());
const abbreviationIdSet = new Set(abbreviationDeck.map((entry) => entry.id));
const verbFormDeck = typeof verbApi.buildVerbConjugationDeck === "function"
  ? verbApi.buildVerbConjugationDeck({ vocabulary: baseVocabulary })
  : [];
appRuntime.baseVocabulary = baseVocabulary;
appRuntime.abbreviationDeck = abbreviationDeck;
appRuntime.abbreviationIdSet = abbreviationIdSet;
appRuntime.verbFormDeck = verbFormDeck;
appRuntime.verbApi = verbApi;
appRuntime.getBaseVocabularyFn = getBaseVocabularyFn;
appRuntime.getAbbreviationsFn = getAbbreviationsFn;
appRuntime.performanceDomains = PERFORMANCE_DOMAINS;
appRuntime.domainByCategory = DOMAIN_BY_CATEGORY;
appRuntime.fallbackDomainId = FALLBACK_DOMAIN_ID;
appRuntime.usingFallbackVocab = usingFallbackVocab;
appRuntime.usingFallbackAbbreviations = usingFallbackAbbreviations;

const el = createElementRegistry(document);
appRuntime.el = el;

const state = createInitialState({
  storageKeys: STORAGE_KEYS,
  loadJson,
  restoredUi,
  language: loadLanguagePreference(),
  theme: loadThemePreference(),
  audio: loadSoundPreference(),
  welcomeModalSeen: hasSeenWelcomeModal(),
});
appRuntime.state = state;

if (state.welcomeModalOpen) {
  markWelcomeModalSeen();
}

appRuntime.introAutoAdvanceMs = Math.max(0, Number(global.__IVRIQUEST_TEST_CONFIG__?.introAutoAdvanceMs ?? 900));
appRuntime.introAutoAdvanceTimerId = null;

if (usingFallbackVocab) {
  // Keep app usable even when vocab-data.js fails to load.
  console.warn("IvritElite: using fallback vocabulary because vocab-data.js was unavailable.");
}

if (usingFallbackAbbreviations) {
  // Keep abbreviation mode available even when abbreviation-data.js fails to load.
  console.warn("IvritElite: using fallback abbreviations because abbreviation-data.js was unavailable.");
}

appRuntime.helpers = {
  buildAbbreviationMistakeSummary,
  buildAdvConjMistakeSummary,
  buildAnswerDisplay,
  buildLessonMistakeSummary,
  clearAbbreviationIntro,
  clearAdvConjIntro,
  clearFeedback,
  clearLessonStartIntro,
  clearSecondChanceIntro,
  clearSummaryState,
  clearVerbMatchIntro,
  cloneAbbreviationQuestionSnapshot,
  cloneLessonQuestionSnapshot,
  closeMasteredModal,
  finishAbbreviation,
  finishAdvConj,
  finishLesson,
  getAbbreviationRoundTarget,
  getDueWords,
  getLanguageToggleLabel,
  getHebrewText,
  getVisibleVerbMatchRows,
  goHome,
  hideBlockingOverlay,
  isWordAvailableForMode,
  loadAdvConjQuestion,
  loadNextVerbRound,
  markAbbreviationChoiceResults,
  markAdvConjChoiceResults,
  markChoiceResults,
  navigateTo,
  nextAbbreviationQuestion,
  nextQuestion,
  playAbbreviationIntro,
  playAdvConjIntro,
  playAnswerFeedbackSound,
  playLessonStartIntro,
  playSecondChanceIntro,
  playVerbMatchIntro,
  pickLeastSeenLessonDomainId,
  questionNeedsSelection,
  renderAdvConjChoices,
  renderAdvConjQuestion,
  renderAll,
  renderChoices,
  renderDomainPerformance,
  renderMasteredModal,
  renderMostMissed,
  renderNiqqudToggle,
  renderPoolMeta,
  renderPromptText,
  renderQuestion,
  renderSessionHeader,
  renderVerbMatchRound,
  requestGoHome,
  resetAdvConjState,
  resetAbbreviationState,
  resetSessionCounters,
  resetVerbMatchState,
  scheduleIntroAutoAdvance,
  setFeedback,
  setGamePickerVisibility,
  setPromptCardVisibility,
  showBlockingOverlay,
  showSessionSummary,
  startAbbreviationTimer,
  startLessonTimer,
  startVerbMatchTimer,
  stopAbbreviationTimer,
  stopLessonTimer,
  stopVerbMatchTimer,
  t,
  updateAdvConjStats,
  updateConjugationProgress,
  updateLessonProgress,
  updateProgress,
  updateUiLockState,
};

sanitizeState();
restoreSessionState(restoredSession);
state.route = resolveInitialRoute(state.route, { initializing: true });
applyTheme();
applyLanguage();
bindUi();
resumeActiveTimers();
renderAll();
primeAudioCues();

})(typeof window !== "undefined" ? window : globalThis);
