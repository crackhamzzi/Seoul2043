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
  assert.ok(voices.filter(({ speaker }) => speaker === "citizen").every(({ x }) => x >= 3 && x <= 18));
  assert.ok(voices.filter(({ speaker }) => speaker === "android").every(({ x }) => x >= 3 && x <= 18));
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
        x <= 98 &&
        y >= 3 &&
        y <= 97 &&
        rotation >= -90 &&
        rotation <= 90 &&
        delayMs >= 0,
    ),
  );
  assert.ok(new Set(first.map(({ x, y }) => `${x}:${y}`)).size >= 80);
  assert.ok(new Set(first.map(({ rotation }) => rotation)).size >= 10);
  assert.ok(first.some(({ rotation }) => rotation <= -60));
  assert.ok(first.some(({ rotation }) => Math.abs(rotation) <= 12));
  assert.ok(first.some(({ rotation }) => rotation >= 60));

  const occupiedSectors = new Set(
    first.map(({ x, y }) => `${Math.min(3, Math.floor(x / 25))}:${Math.min(2, Math.floor(y / (100 / 3)))}`),
  );
  assert.equal(occupiedSectors.size, 12);
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

test("finishes every reduced-motion question before the finale begins", () => {
  const timeline = getPvTimeline(true);
  const whyStartMs = timeline.find(({ scene }) => scene === "why").atMs;
  const finaleStartMs = timeline.find(({ scene }) => scene === "finale").atMs;
  const whyWindowMs = finaleStartMs - whyStartMs;
  const latestQuestionEndMs = Math.max(
    ...getWhyPlan(104, true).map(({ delayMs, speedMs, text }) => delayMs + speedMs * text.length),
  );

  assert.ok(latestQuestionEndMs < whyWindowMs);
});

test("starts every reduced-motion condemnation before the silence scene", () => {
  const timeline = getPvTimeline(true);
  const condemnationStartMs = timeline.find(({ scene }) => scene === "condemnation").atMs;
  const silenceStartMs = timeline.find(({ scene }) => scene === "silence").atMs;
  const condemnationWindowMs = silenceStartMs - condemnationStartMs;
  const latestVoiceStartMs = Math.max(...getCondemnationVoices(true).map(({ delayMs }) => delayMs));

  assert.ok(latestVoiceStartMs < condemnationWindowMs);
});
