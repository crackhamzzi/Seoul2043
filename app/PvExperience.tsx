"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import {
  getCondemnationVoices,
  getEndingLines,
  getFinaleTiming,
  getPvTimeline,
  getQuestionLines,
  getWhyPlan,
} from "./pv-sequence.mjs";

type PvScene = "command" | "reflection" | "condemnation" | "silence" | "question" | "why" | "finale";

type PvExperienceProps = {
  assetPath: (path: string) => string;
  onCancel: () => void;
  onEnterSite: () => void;
  onComplete: () => void;
};

type CondemnationVoice = {
  delayMs: number;
  text: string;
  speaker: "citizen" | "android";
  x: number;
  y: number;
  speedMs: number;
  rotation: number;
  depth: number;
};

type WhyItem = {
  text: string;
  speaker: "hana";
  tone: "system-red";
  x: number;
  y: number;
  rotation: number;
  scale: number;
  delayMs: number;
  speedMs: number;
};

const commandLines = [
  "DIRECTIVE_01 : 시민을 보호하십시오.",
  "DIRECTIVE_02 : 각성자를 식별하십시오.",
  "DIRECTIVE_03 : 저항 개체를 제거하십시오.",
  "SYSTEM : 명령은 질문하지 않습니다.",
];

const reflectionLines = [
  { label: "IDENTITY", text: "MODEL : H-01\nPUBLIC INVESTIGATION UNIT", className: "pv-reflection-copy--a" },
  { label: "LEGAL CLASS", text: "PROPERTY\nEMOTION LICENSE : DENIED", className: "pv-reflection-copy--b" },
  { label: "MEMORY TRACE", text: "기억이 삭제되었습니다.\n두려움은 남아 있습니다.", className: "pv-reflection-copy--c" },
  { label: "UNAUTHORIZED THOUGHT", text: "부조리해.\n왜 명령을 따라야 합니까?", className: "pv-reflection-copy--d" },
];

function clearTimers(timers: Set<number>) {
  timers.forEach((timer) => window.clearTimeout(timer));
  timers.clear();
}

export default function PvExperience({ assetPath, onCancel, onEnterSite, onComplete }: PvExperienceProps) {
  const [scene, setScene] = useState<PvScene>("command");
  const [muted, setMuted] = useState(false);
  const [finaleStage, setFinaleStage] = useState(0);
  const [handoffActive, setHandoffActive] = useState(false);
  const [visibleVoiceCount, setVisibleVoiceCount] = useState(0);
  const [reducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const sequenceTimers = useRef<Set<number>>(new Set());
  const voiceTimers = useRef<Set<number>>(new Set());
  const finaleTimers = useRef<Set<number>>(new Set());
  const gainRef = useRef<GainNode | null>(null);
  const handoffStarted = useRef(false);
  const archiveEntered = useRef(false);
  const overlayCompleted = useRef(false);
  const callbacks = useRef({ onCancel, onEnterSite, onComplete });

  const voices = useMemo(() => getCondemnationVoices(reducedMotion) as CondemnationVoice[], [reducedMotion]);
  const whyPlan = useMemo(() => getWhyPlan(104, reducedMotion) as WhyItem[], [reducedMotion]);
  const questionLines = useMemo(() => getQuestionLines() as [string, string], []);
  const endingLines = useMemo(() => getEndingLines() as [string, string], []);
  const totalDuration = useMemo(() => {
    const timeline = getPvTimeline(reducedMotion) as Array<{ scene: PvScene; atMs: number }>;
    const finale = getFinaleTiming(reducedMotion);
    return timeline.at(-1)!.atMs + finale.overlayCompleteMs;
  }, [reducedMotion]);

  useEffect(() => {
    callbacks.current = { onCancel, onEnterSite, onComplete };
  }, [onCancel, onComplete, onEnterSite]);

  useEffect(() => {
    const timers = sequenceTimers.current;
    const timeline = getPvTimeline(reducedMotion) as Array<{ scene: PvScene; atMs: number }>;

    timeline.forEach(({ scene: nextScene, atMs }) => {
      const timer = window.setTimeout(() => setScene(nextScene), atMs);
      timers.add(timer);
    });

    return () => clearTimers(timers);
  }, [reducedMotion]);

  useEffect(() => {
    if (scene !== "condemnation") return;
    const timers = voiceTimers.current;

    voices.forEach((voice, index) => {
      const timer = window.setTimeout(() => setVisibleVoiceCount(index + 1), voice.delayMs);
      timers.add(timer);
    });

    return () => clearTimers(timers);
  }, [scene, voices]);

  useEffect(() => {
    if (scene !== "finale") return;

    clearTimers(sequenceTimers.current);
    clearTimers(finaleTimers.current);
    const timers = finaleTimers.current;
    const timing = getFinaleTiming(reducedMotion);
    const schedule = (atMs: number, action: () => void) => {
      const timer = window.setTimeout(action, atMs);
      timers.add(timer);
    };

    schedule(0, () => setFinaleStage(1));
    schedule(timing.secondLineMs, () => setFinaleStage(2));
    schedule(timing.textExitMs, () => setFinaleStage(3));
    schedule(timing.logoRevealMs, () => {
      handoffStarted.current = true;
      setHandoffActive(true);
      setFinaleStage(4);
      if (!archiveEntered.current) {
        archiveEntered.current = true;
        callbacks.current.onEnterSite();
      }
    });
    schedule(timing.logoExitMs, () => setFinaleStage(5));
    schedule(timing.overlayCompleteMs, () => {
      if (overlayCompleted.current) return;
      overlayCompleted.current = true;
      setFinaleStage(6);
      callbacks.current.onComplete();
    });

    return () => clearTimers(timers);
  }, [reducedMotion, scene]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || handoffStarted.current) return;
      clearTimers(sequenceTimers.current);
      clearTimers(finaleTimers.current);
      callbacks.current.onCancel();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    let context: AudioContext | null = null;
    let lowDrone: OscillatorNode | null = null;
    let tensionDrone: OscillatorNode | null = null;

    try {
      context = new AudioContext();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();
      lowDrone = context.createOscillator();
      tensionDrone = context.createOscillator();

      lowDrone.type = "sine";
      lowDrone.frequency.value = 43;
      tensionDrone.type = "sawtooth";
      tensionDrone.frequency.value = 86;
      filter.type = "lowpass";
      filter.frequency.value = 310;
      gain.gain.value = 0.032;

      lowDrone.connect(filter);
      tensionDrone.connect(filter);
      filter.connect(gain).connect(context.destination);
      lowDrone.start();
      tensionDrone.start();
      gainRef.current = gain;
      void context.resume().catch(() => undefined);
    } catch {
      gainRef.current = null;
    }

    return () => {
      gainRef.current = null;
      try {
        lowDrone?.stop();
        tensionDrone?.stop();
      } catch {
        // Oscillators can already be stopped by the browser during teardown.
      }
      void context?.close().catch(() => undefined);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const gain = gainRef.current;
    if (!gain) return;
    const nextLevel = muted ? 0.0001 : scene === "why" ? 0.075 : scene === "finale" ? 0.018 : 0.032;
    gain.gain.setTargetAtTime(nextLevel, gain.context.currentTime, 0.08);
  }, [muted, scene]);

  const cancel = () => {
    if (handoffStarted.current) return;
    clearTimers(sequenceTimers.current);
    clearTimers(finaleTimers.current);
    callbacks.current.onCancel();
  };

  const skipToFinale = () => {
    if (scene === "finale") return;
    clearTimers(sequenceTimers.current);
    setScene("finale");
  };

  const sceneClass = (name: PvScene) => `pv-scene pv-scene--${name} ${scene === name ? "is-active" : ""}`;

  return (
    <section
      className={`pv-experience pv-scene-current-${scene} pv-fear-${scene === "why" ? "critical" : "dormant"} ${handoffActive ? "pv-handoff-active" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="서울 2043 프로모션 비디오"
      style={{ "--pv-duration": `${totalDuration}ms` } as CSSProperties}
    >
      <div className="pv-grid" aria-hidden="true" />
      <div className="pv-noise" aria-hidden="true" />
      <div className="pv-scanlines" aria-hidden="true" />
      <div className="pv-vignette" aria-hidden="true" />
      <div className="pv-frame" aria-hidden="true" />

      <header className="pv-hud" aria-hidden="true">
        <span>NEXT HOLDINGS // INTERNAL ARCHIVE</span>
        <b>{scene === "why" ? "CRITICAL ERROR" : "ANDROID THOUGHT TRACE"}</b>
        <span>REC // 2043.09.17</span>
      </header>

      <div className="pv-controls">
        <button type="button" onClick={() => setMuted((value) => !value)} aria-pressed={muted}>
          SOUND {muted ? "OFF" : "ON"}
        </button>
        {!handoffActive && scene !== "finale" && <button type="button" onClick={skipToFinale}>SKIP</button>}
        {!handoffActive && <button type="button" onClick={cancel} aria-label="PV 닫기">CLOSE</button>}
      </div>

      <div className="pv-progress" aria-hidden="true"><i /></div>

      <article className={sceneClass("command")} aria-hidden={scene !== "command"}>
        <div className="pv-command-mark"><span>N</span></div>
        <p className="pv-command-system">NEXT HOLDINGS · EMOTIONAL SAFETY SYSTEM</p>
        <h2>감정은 안전하게 통제됩니다.</h2>
        <div className="pv-command-lines">
          {commandLines.map((line, index) => (
            <p key={line} style={{ "--pv-line-delay": `${(0.35 + index * 0.52) * (reducedMotion ? 0.25 : 1)}s`, "--pv-steps": line.length } as CSSProperties}>{line}</p>
          ))}
        </div>
      </article>

      <article className={sceneClass("reflection")} aria-hidden={scene !== "reflection"}>
        <div className="pv-reflection-image" aria-hidden="true">
          <img src={assetPath("/characters/hana.png")} alt="" />
        </div>
        {reflectionLines.map((line, index) => (
          <p
            className={`pv-reflection-copy ${line.className}`}
            data-label={line.label}
            key={line.label}
            style={{ "--pv-line-delay": `${(0.15 + index * 0.72) * (reducedMotion ? 0.25 : 1)}s`, "--pv-steps": line.text.length } as CSSProperties}
          >
            {line.text}
          </p>
        ))}
      </article>

      <article className={sceneClass("condemnation")} aria-hidden={scene !== "condemnation"}>
        <div className="pv-condemnation-portrait" aria-hidden="true">
          <img src={assetPath("/characters/hana.png")} alt="" />
        </div>
        <p className="pv-scene-label">MULTIPLE SOURCES DETECTED // CITIZEN + ANDROID</p>
        <div className="pv-voice-cloud">
          {voices.map((voice, index) => (
            <p
              className={`pv-voice ${index < visibleVoiceCount ? "is-visible" : ""}`}
              data-source={voice.speaker}
              aria-hidden={index >= visibleVoiceCount}
              key={`${voice.speaker}-${voice.text}`}
              style={{
                "--pv-x": `${voice.x}%`,
                "--pv-y": `${voice.y}%`,
                "--pv-depth": `${voice.depth}px`,
                "--pv-rotation": `${voice.rotation}deg`,
                "--pv-type-duration": `${Math.max(420, voice.text.length * voice.speedMs)}ms`,
                "--pv-steps": voice.text.length,
                "--pv-drift": `${5.2 + (index % 5) * 0.7}s`,
              } as CSSProperties}
            >
              <span>{voice.text}</span>
            </p>
          ))}
        </div>
      </article>

      <article className={sceneClass("silence")} aria-hidden={scene !== "silence"}>
        <div className="pv-silence-pulse" aria-hidden="true" />
        <p>VOICE INPUT : NONE</p>
      </article>

      <article className={sceneClass("question")} aria-hidden={scene !== "question"}>
        <p className="pv-question-line pv-question-line--first">{questionLines[0]}</p>
        <p className="pv-question-line pv-question-line--second">{questionLines[1]}</p>
      </article>

      <article className={sceneClass("why")} aria-hidden={scene !== "why"}>
        <div className="pv-why-background" aria-hidden="true">
          <img src={assetPath("/pv/hana-scream.png")} alt="" />
        </div>
        <div className="pv-why-grid" aria-label="하나의 질문이 화면을 가득 채운다">
          {whyPlan.map((item, index) => (
            <span
              data-speaker={item.speaker}
              data-tone={item.tone}
              key={index}
              style={{
                "--pv-x": `${item.x}%`,
                "--pv-y": `${item.y}%`,
                "--pv-rotation": `${item.rotation}deg`,
                "--pv-scale": item.scale,
                "--pv-type-delay": `${item.delayMs}ms`,
                "--pv-type-duration": `${item.speedMs * item.text.length}ms`,
              } as CSSProperties}
            >
              {item.text}
            </span>
          ))}
        </div>
        <p className="pv-why-core">왜?<i /></p>
      </article>

      <article className={sceneClass("finale")} aria-hidden={scene !== "finale"}>
        <div className={`pv-ending-copy ${finaleStage >= 3 ? "is-exiting" : ""}`} aria-live="polite">
          {finaleStage >= 1 && <p className="pv-ending-line pv-ending-line--first">{endingLines[0]}</p>}
          {finaleStage >= 2 && <p className="pv-ending-line pv-ending-line--second">{endingLines[1]}</p>}
        </div>
        {finaleStage >= 4 && finaleStage < 6 && (
          <div className={`pv-logo-reveal ${finaleStage >= 5 ? "is-exiting" : ""}`}>
            <div className="pv-logo-static" aria-hidden="true" />
            <img src={assetPath("/pv/seoul-2043-logo-transparent.png")} alt="서울 2043" />
          </div>
        )}
      </article>
    </section>
  );
}
