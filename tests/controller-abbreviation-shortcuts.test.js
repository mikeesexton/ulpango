const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadControllerHarness(options = {}) {
  const selectCalls = [];
  let nextCalls = 0;
  let closeWelcomeCalls = 0;
  let closeMasteredCalls = 0;

  const context = {
    console,
    IvriQuestApp: {
      runtime: {
        state: {
          mode: options.mode || "abbreviation",
          welcomeModalOpen: options.welcomeModalOpen === true,
          masteredModalOpen: options.masteredModalOpen === true,
          abbreviation: {
            active: options.active !== false,
            currentQuestion: {
              locked: options.locked === true,
              selectedOptionId: options.selectedOptionId || null,
              options: [
                { id: "opt-1" },
                { id: "opt-2" },
                { id: "opt-3" },
                { id: "opt-4" },
              ],
            },
          },
        },
      },
      ui: {
        isUiLocked() {
          return options.uiLocked === true;
        },
        closeWelcomeModal() {
          closeWelcomeCalls += 1;
        },
        closeMasteredModal() {
          closeMasteredCalls += 1;
        },
      },
      abbreviation: {
        selectAbbreviationOption(optionId) {
          selectCalls.push(optionId);
          return true;
        },
      },
      controller: {
        handleNextAction() {
          nextCalls += 1;
        },
      },
    },
  };

  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  const source = fs.readFileSync(path.join(__dirname, "..", "app", "controller.js"), "utf8");
  vm.runInContext(source, context);

  return {
    controller: context.IvriQuestApp.controller,
    runtime: context.IvriQuestApp.runtime,
    selectCalls,
    getNextCalls() {
      return nextCalls;
    },
    getCloseWelcomeCalls() {
      return closeWelcomeCalls;
    },
    getCloseMasteredCalls() {
      return closeMasteredCalls;
    },
  };
}

function createKeyEvent(key, overrides = {}) {
  return {
    key,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    preventDefaultCalled: false,
    preventDefault() {
      this.preventDefaultCalled = true;
    },
    ...overrides,
  };
}

test("abbreviation shortcuts map 1-4 to visible answer choices", () => {
  const harness = loadControllerHarness();
  const event = createKeyEvent("2");

  const handled = harness.controller.handleAbbreviationShortcutKey(event);

  assert.equal(handled, true);
  assert.equal(event.preventDefaultCalled, true);
  assert.deepEqual(harness.selectCalls, ["opt-2"]);
});

test("Enter submits unlocked questions with a selection and advances locked questions", () => {
  const submitHarness = loadControllerHarness({ selectedOptionId: "opt-3" });
  const submitEvent = createKeyEvent("Enter");

  assert.equal(submitHarness.controller.handleAbbreviationShortcutKey(submitEvent), true);
  assert.equal(submitEvent.preventDefaultCalled, true);
  assert.equal(submitHarness.getNextCalls(), 1);

  const advanceHarness = loadControllerHarness({ locked: true });
  const advanceEvent = createKeyEvent("Enter");

  assert.equal(advanceHarness.controller.handleAbbreviationShortcutKey(advanceEvent), true);
  assert.equal(advanceEvent.preventDefaultCalled, true);
  assert.equal(advanceHarness.getNextCalls(), 1);
});

test("global key handling ignores abbreviation shortcuts while locked and still closes modal overlays on Escape", () => {
  const lockedHarness = loadControllerHarness({ uiLocked: true });
  const lockedEvent = createKeyEvent("1");

  lockedHarness.controller.handleGlobalKeyDown(lockedEvent);
  assert.deepEqual(lockedHarness.selectCalls, []);
  assert.equal(lockedEvent.preventDefaultCalled, false);

  const escapeHarness = loadControllerHarness({ welcomeModalOpen: true });
  const escapeEvent = createKeyEvent("Escape");

  escapeHarness.controller.handleGlobalKeyDown(escapeEvent);
  assert.equal(escapeHarness.getCloseWelcomeCalls(), 1);
  assert.equal(escapeHarness.getCloseMasteredCalls(), 0);
});
