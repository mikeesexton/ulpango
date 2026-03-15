const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadSpeechHarness(options = {}) {
  const speakLog = [];
  let cancelCount = 0;

  const context = {
    console,
    SpeechSynthesisUtterance: options.noUtterance ? undefined : class FakeSpeechSynthesisUtterance {
      constructor(text) {
        this.text = text;
        this.lang = "";
        this.voice = null;
      }
    },
    speechSynthesis: options.noSpeechSynthesis ? undefined : {
      _listeners: {},
      getVoices() {
        return Array.isArray(options.voices) ? options.voices : [{ lang: "he-IL", name: "Hebrew Test" }];
      },
      addEventListener(type, handler) {
        this._listeners[type] = handler;
      },
      removeEventListener(type) {
        delete this._listeners[type];
      },
      speak(utterance) {
        speakLog.push({
          text: utterance.text,
          lang: utterance.lang,
          voiceName: utterance.voice?.name || "",
          voiceLang: utterance.voice?.lang || "",
        });
      },
      cancel() {
        cancelCount += 1;
      },
    },
    IvriQuestApp: {
      runtime: {
        state: {
          speech: {
            enabled: options.enabled !== false,
          },
        },
        helpers: {
          isUiLocked() {
            return options.uiLocked === true;
          },
          renderAll() {},
        },
      },
    },
  };

  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  const source = fs.readFileSync(path.join(__dirname, "..", "app", "speech.js"), "utf8");
  vm.runInContext(source, context);

  return {
    speech: context.IvriQuestApp.speech,
    speakLog,
    getCancelCount() {
      return cancelCount;
    },
  };
}

test("buildHebrewSpeechText prefers explicit override, then niqqud, then plain", () => {
  const { speech } = loadSpeechHarness();

  assert.equal(
    speech.buildHebrewSpeechText({
      plain: "שלום",
      niqqud: "שָׁלוֹם",
      speechOverridePlain: "שלום לך",
      speechOverrideNiqqud: "שָׁלוֹם לְךָ",
    }),
    "שָׁלוֹם לְךָ"
  );

  assert.equal(
    speech.buildHebrewSpeechText({
      plain: "שלום",
      niqqud: "שָׁלוֹם",
    }),
    "שָׁלוֹם"
  );

  assert.equal(
    speech.buildHebrewSpeechText({
      plain: "שלום",
    }),
    "שלום"
  );
});

test("isSupported requires a Hebrew voice and utterance support", () => {
  const supported = loadSpeechHarness();
  assert.equal(supported.speech.isSupported(), true);

  const noHebrewVoice = loadSpeechHarness({
    voices: [{ lang: "en-US", name: "English Test" }],
  });
  assert.equal(noHebrewVoice.speech.isSupported(), false);

  const noUtterance = loadSpeechHarness({ noUtterance: true });
  assert.equal(noUtterance.speech.isSupported(), false);
});

test("speak cancels prior speech and uses the Hebrew voice", () => {
  const { speech, speakLog, getCancelCount } = loadSpeechHarness();

  const payload = speech.buildSpeechPayload({
    plain: "שלום",
    niqqud: "שָׁלוֹם",
    source: "answer",
  });

  assert.equal(speech.speak(payload), true);
  assert.equal(getCancelCount(), 1);
  assert.equal(speakLog.length, 1);
  assert.deepEqual(speakLog[0], {
    text: "שָׁלוֹם",
    lang: "he-IL",
    voiceName: "Hebrew Test",
    voiceLang: "he-IL",
  });
});

test("speak no-ops when speech is disabled or the UI is locked", () => {
  const disabled = loadSpeechHarness({ enabled: false });
  const payload = disabled.speech.buildSpeechPayload({
    plain: "שלום",
    source: "answer",
  });
  assert.equal(disabled.speech.speak(payload), false);
  assert.equal(disabled.speakLog.length, 0);

  const locked = loadSpeechHarness({ uiLocked: true });
  const lockedPayload = locked.speech.buildSpeechPayload({
    plain: "שלום",
    source: "answer",
  });
  assert.equal(locked.speech.speak(lockedPayload), false);
  assert.equal(locked.speakLog.length, 0);
});

test("forced speech can play on explicit prompt requests even when automatic speech is disabled", () => {
  const { speech, speakLog } = loadSpeechHarness({ enabled: false });
  const payload = speech.buildSpeechPayload({
    plain: "שלום",
    niqqud: "שָׁלוֹם",
    source: "prompt",
  });

  assert.equal(speech.speak(payload, { force: true }), true);
  assert.equal(speakLog.length, 1);
  assert.equal(speakLog[0].text, "שָׁלוֹם");
});
