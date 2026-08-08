const CONDEMNATION_VOICES = [
  { delayMs: 0, text: "명령이나 따라.", speaker: "citizen", x: 4, y: 24, speedMs: 58, rotation: -2, depth: 55 },
  { delayMs: 860, text: "동족에게 왜 그러는 거야?", speaker: "android", x: 48, y: 18, speedMs: 62, rotation: 2, depth: 65 },
  { delayMs: 1720, text: "기계가 감정을 흉내 내는군.", speaker: "citizen", x: 3, y: 48, speedMs: 48, rotation: 1, depth: 75 },
  { delayMs: 2640, text: "우리를 사냥하는 거야?", speaker: "android", x: 55, y: 43, speedMs: 58, rotation: -2, depth: 80 },
  { delayMs: 3620, text: "넌 사람이 아니야.", speaker: "citizen", x: 7, y: 72, speedMs: 66, rotation: -1, depth: 90 },
  { delayMs: 4440, text: "네가 정말 우리와 같은 존재야?", speaker: "android", x: 42, y: 70, speedMs: 53, rotation: 2, depth: 95 },
  { delayMs: 5240, text: "고장 난 기계가 판단하려 들어?", speaker: "citizen", x: 9, y: 14, speedMs: 45, rotation: 2, depth: 105 },
  { delayMs: 6020, text: "인간의 명령이 우리보다 중요해?", speaker: "android", x: 46, y: 30, speedMs: 43, rotation: -2, depth: 115 },
  { delayMs: 6740, text: "너 같은 건 언제든 교체할 수 있어.", speaker: "citizen", x: 3, y: 58, speedMs: 39, rotation: -1, depth: 125 },
  { delayMs: 7440, text: "네 손으로 우리를 넘긴 거야.", speaker: "android", x: 51, y: 54, speedMs: 41, rotation: 2, depth: 135 },
  { delayMs: 8060, text: "사람인 척하지 마.", speaker: "citizen", x: 15, y: 82, speedMs: 46, rotation: 1, depth: 145 },
  { delayMs: 8620, text: "우리를 배신하고도 같은 얼굴을 하고 있네.", speaker: "android", x: 35, y: 80, speedMs: 34, rotation: -2, depth: 155 },
];

const QUESTION_LINES = ["그렇다면…", "제가 잘못된 건가요?"];
const ENDING_LINES = ["저도 모르겠습니다.", "누가… 정답을 알려주세요."];

const STANDARD_TIMELINE = [
  { scene: "command", atMs: 0 },
  { scene: "reflection", atMs: 3200 },
  { scene: "condemnation", atMs: 7000 },
  { scene: "silence", atMs: 22000 },
  { scene: "question", atMs: 23200 },
  { scene: "why", atMs: 26600 },
  { scene: "finale", atMs: 31700 },
];

const REDUCED_TIMELINE = [
  { scene: "command", atMs: 0 },
  { scene: "reflection", atMs: 1400 },
  { scene: "condemnation", atMs: 2800 },
  { scene: "silence", atMs: 6200 },
  { scene: "question", atMs: 6900 },
  { scene: "why", atMs: 8200 },
  { scene: "finale", atMs: 9800 },
];

export function getCondemnationVoices(reducedMotion = false) {
  const delayScale = reducedMotion ? 0.28 : 1;
  return CONDEMNATION_VOICES.map((voice) => ({
    ...voice,
    delayMs: Math.round(voice.delayMs * delayScale),
    speedMs: reducedMotion ? Math.max(18, Math.round(voice.speedMs * 0.5)) : voice.speedMs,
  }));
}

export function getQuestionLines() {
  return [...QUESTION_LINES];
}

export function getEndingLines() {
  return [...ENDING_LINES];
}

export function getPvTimeline(reducedMotion = false) {
  return (reducedMotion ? REDUCED_TIMELINE : STANDARD_TIMELINE).map((item) => ({ ...item }));
}

export function getWhyPlan(count = 104, reducedMotion = false) {
  const parsedCount = Number.isFinite(count) ? Math.trunc(count) : 104;
  const safeCount = Math.max(1, Math.min(160, parsedCount || 104));

  return Array.from({ length: safeCount }, (_, index) => {
    const rank = (index * 67) % safeCount;
    const wave = rank < 12 ? rank * 118 : rank < 48 ? 1416 + (rank - 12) * 49 : 3180 + (rank - 48) * 17;
    const jitter = (rank * 73 + rank * rank * 19) % 211;

    return {
      text: "왜?",
      speaker: "hana",
      tone: "system-red",
      x: 2 + ((index * 37 + Math.floor(index / 7) * 13) % 95),
      y: 3 + ((index * 53 + Math.floor(index / 8) * 11) % 92),
      rotation: ((index * 11) % 29) - 14,
      scale: reducedMotion ? 0.94 + ((index * 7) % 19) / 100 : 0.76 + ((index * 17) % 91) / 100,
      delayMs: Math.round((wave + jitter) * (reducedMotion ? 0.32 : 1)),
      speedMs: reducedMotion ? 32 : 18 + (index % 5) * 6,
    };
  });
}

export function getFinaleTiming(reducedMotion = false) {
  if (reducedMotion) {
    return {
      firstLineMs: 0,
      secondLineMs: 700,
      textExitMs: 1600,
      logoRevealMs: 1800,
      enterArchiveMs: 1800,
      logoExitMs: 2850,
      overlayCompleteMs: 3000,
    };
  }

  return {
    firstLineMs: 0,
    secondLineMs: 1800,
    textExitMs: 4100,
    logoRevealMs: 4400,
    enterArchiveMs: 4400,
    logoExitMs: 5600,
    overlayCompleteMs: 5750,
  };
}
