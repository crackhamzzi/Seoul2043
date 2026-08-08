import assert from "node:assert/strict";
import test from "node:test";

import {
  getCondemnationVoices,
  getEndingLines,
  getFinaleTiming,
  getPvTimeline,
  getQuestionLines,
  getWhyPlan,
} from "../app/pv-sequence.mjs";

test("alternates six citizen and six android condemnations", () => {
  const voices = getCondemnationVoices();

  assert.equal(voices.length, 12);
  assert.deepEqual(
    voices.map(({ speaker }) => speaker),
    [
      "citizen",
      "android",
      "citizen",
      "android",
      "citizen",
      "android",
      "citizen",
      "android",
      "citizen",
      "android",
      "citizen",
      "android",
    ],
  );
  assert.equal(new Set(voices.map(({ text }) => text)).size, 12);
  assert.ok(voices.every(({ text, delayMs }) => text.length >= 5 && delayMs >= 0));
});

test("asks Hana's question in the approved two-line order", () => {
  assert.deepEqual(getQuestionLines(), ["그렇다면…", "제가 잘못된 건가요?"]);
});

test("ends with only the approved plea before the image logo", () => {
  assert.deepEqual(getEndingLines(), ["저도 모르겠습니다.", "누가… 정답을 알려주세요."]);

  const allCopy = JSON.stringify({
    voices: getCondemnationVoices(),
    question: getQuestionLines(),
    ending: getEndingLines(),
    timeline: getPvTimeline(),
  });

  assert.doesNotMatch(allCopy, /THE ARCHIVE IS OPEN/);
  assert.doesNotMatch(allCopy, /SEOUL 2043/);
});

test("fills the frame with 104 deterministic system-red questions from Hana", () => {
  const first = getWhyPlan();
  const second = getWhyPlan();

  assert.equal(first.length, 104);
  assert.deepEqual(first, second);
  assert.ok(
    first.every(
      ({ text, speaker, tone, x, y, rotation, delayMs }) =>
        text === "왜?" &&
        speaker === "hana" &&
        tone === "system-red" &&
        x >= 2 &&
        x <= 96 &&
        y >= 3 &&
        y <= 94 &&
        rotation >= -14 &&
        rotation <= 14 &&
        delayMs >= 0,
    ),
  );
  assert.ok(new Set(first.map(({ x, y }) => `${x}:${y}`)).size >= 80);
});

test("reveals the logo and enters the archive together before removing the overlay", () => {
  const timing = getFinaleTiming();

  assert.equal(timing.logoRevealMs, timing.enterArchiveMs);
  assert.ok(timing.overlayCompleteMs - timing.logoRevealMs >= 1000);
  assert.ok(timing.logoExitMs > timing.logoRevealMs);
  assert.ok(timing.overlayCompleteMs >= timing.logoExitMs);
});

test("keeps the scene timeline ordered and shortens it for reduced motion", () => {
  const standard = getPvTimeline();
  const reduced = getPvTimeline(true);

  assert.deepEqual(
    standard.map(({ scene }) => scene),
    ["command", "reflection", "condemnation", "silence", "question", "why", "finale"],
  );
  assert.ok(standard.every((item, index) => index === 0 || item.atMs > standard[index - 1].atMs));
  assert.deepEqual(
    reduced.map(({ scene }) => scene),
    standard.map(({ scene }) => scene),
  );
  assert.ok(reduced.at(-1).atMs < standard.at(-1).atMs);
});
