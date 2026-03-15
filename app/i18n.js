(function initIvriQuestAppI18n(global) {
"use strict";

const app = global.IvriQuestApp = global.IvriQuestApp || {};
const i18n = app.i18n = app.i18n || {};

function getRuntime() {
  return app.runtime || {};
}

function getHelpers() {
  return getRuntime().helpers || {};
}

i18n.getLocaleBundle = i18n.getLocaleBundle || function getLocaleBundle() {
  const runtime = getRuntime();
  return runtime.i18nBundles?.[runtime.state.language] || runtime.i18nBundles?.en || {};
};

i18n.getLanguageToggleLabel = i18n.getLanguageToggleLabel || function getLanguageToggleLabel() {
  return getRuntime().state.language === "en" ? "עברית" : "English";
};

i18n.getNestedTranslation = i18n.getNestedTranslation || function getNestedTranslation(bundle, key) {
  return key.split(".").reduce((obj, part) => (obj && obj[part] != null ? obj[part] : undefined), bundle);
};

i18n.t = i18n.t || function t(key, vars = {}) {
  const runtime = getRuntime();
  const fromSelected = i18n.getNestedTranslation(i18n.getLocaleBundle(), key);
  const fromEnglish = i18n.getNestedTranslation(runtime.i18nBundles?.en || {}, key);
  const template = typeof fromSelected === "string" ? fromSelected : typeof fromEnglish === "string" ? fromEnglish : key;

  return template.replace(/\{(\w+)\}/g, (_, token) => String(vars[token] != null ? vars[token] : ""));
};

i18n.applyLanguage = i18n.applyLanguage || function applyLanguage() {
  const runtime = getRuntime();
  global.document.body?.setAttribute("data-ui-lang", runtime.state.language);
  global.document.documentElement.lang = runtime.state.language === "he" ? "he" : "en";
  global.document.title = i18n.t("app.title");

  (runtime.el?.translatable || []).forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (!key) return;
    node.textContent = i18n.t(key);
  });

  if (runtime.el?.langToggle) {
    const toggleLabel = i18n.getLanguageToggleLabel();
    runtime.el.langToggle.textContent = toggleLabel;
    runtime.el.langToggle.setAttribute("aria-label", toggleLabel);
  }

  app.ui?.renderHomeButton?.();

  if (runtime.el?.welcomeModalCloseBtn) {
    runtime.el.welcomeModalCloseBtn.setAttribute("aria-label", i18n.t("welcome.closeAria"));
  }

  app.ui?.renderThemeToggle?.();
};

i18n.applyTheme = i18n.applyTheme || function applyTheme() {
  const runtime = getRuntime();
  const theme = runtime.state.theme === "light" ? "light" : "dark";
  global.document.body?.setAttribute("data-theme", theme);
  global.document.documentElement.style.colorScheme = theme;
  app.ui?.renderThemeToggle?.();
};

i18n.toggleLanguage = i18n.toggleLanguage || function toggleLanguage() {
  const runtime = getRuntime();
  runtime.state.language = runtime.state.language === "en" ? "he" : "en";
  app.persistence?.saveLanguagePreference?.(runtime.state.language);
  i18n.applyLanguage();
  getHelpers().renderAll?.();
};

i18n.toggleTheme = i18n.toggleTheme || function toggleTheme() {
  const runtime = getRuntime();
  runtime.state.theme = runtime.state.theme === "light" ? "dark" : "light";
  app.persistence?.saveThemePreference?.(runtime.state.theme);
  i18n.applyTheme();
  getHelpers().renderAll?.();
};

i18n.toggleNiqqudPreference = i18n.toggleNiqqudPreference || function toggleNiqqudPreference() {
  const runtime = getRuntime();
  runtime.state.showNiqqudInline = !runtime.state.showNiqqudInline;
  getHelpers().renderAll?.();
};

i18n.toggleSoundPreference = i18n.toggleSoundPreference || function toggleSoundPreference() {
  const runtime = getRuntime();
  runtime.state.audio.enabled = !runtime.state.audio.enabled;
  app.persistence?.saveSoundPreference?.(runtime.state.audio.enabled);
  app.audio?.primeAudioCues?.();
  getHelpers().renderAll?.();
};

i18n.toggleSpeechPreference = i18n.toggleSpeechPreference || function toggleSpeechPreference() {
  const runtime = getRuntime();
  if (!app.speech?.isSupported?.()) return;
  runtime.state.speech.enabled = !runtime.state.speech.enabled;
  app.persistence?.saveSpeechPreference?.(runtime.state.speech.enabled);
  app.speech?.primeVoices?.();
  getHelpers().renderAll?.();
};
})(typeof window !== "undefined" ? window : globalThis);
