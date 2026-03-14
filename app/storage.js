(function initIvriQuestAppStorage(global) {
"use strict";

const app = global.IvriQuestApp = global.IvriQuestApp || {};
const storageApi = app.storage = app.storage || {};

storageApi.getStorage = storageApi.getStorage || function getStorage() {
  try {
    if (!global.localStorage) return null;
    const testKey = "__ivriquest_storage_test__";
    global.localStorage.setItem(testKey, "1");
    global.localStorage.removeItem(testKey);
    return global.localStorage;
  } catch {
    return null;
  }
};

storageApi.loadJson = storageApi.loadJson || function loadJson(key, fallback) {
  const storage = storageApi.getStorage();
  if (!storage) return fallback;

  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

storageApi.saveJson = storageApi.saveJson || function saveJson(key, value) {
  const storage = storageApi.getStorage();
  if (!storage) return;

  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore write failures (private mode/storage restrictions).
  }
};
})(typeof window !== "undefined" ? window : globalThis);
