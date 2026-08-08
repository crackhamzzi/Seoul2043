import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Seoul 2043 archive", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /서울 2043/);
  assert.match(html, /인간과 기계의 대립/);
  assert.match(html, /class="world-brief-grid"/);
  assert.match(html, /감정을 가진 상품/);
  assert.match(html, /class="world-text-field/);
  assert.doesNotMatch(html, /scroll-marker/);
});

test("renders independent PV and archive entry controls", async () => {
  const [response, css] = await Promise.all([
    render(),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  const html = await response.text();

  assert.match(html, /role="group" aria-label="진입 방식 선택"/);
  assert.match(html, /<button[^>]*class="entry-action entry-action--pv"[^>]*aria-label="PV 영상 보기"[^>]*>PV 영상 보기<\/button>/);
  assert.match(html, /<button[^>]*class="entry-action entry-action--enter"[^>]*aria-label="ENTER"[^>]*>ENTER<\/button>/);
  assert.match(html, /entry-action--pv[^>]*>PV 영상 보기<\/button>.*entry-action--enter[^>]*>ENTER<\/button>/s);
  assert.doesNotMatch(html, /NEXT HOLDINGS \/\/ ARCHIVE 09|PV 확인/);
  assert.doesNotMatch(html, /<span>기록 열람<\/span>/);
  assert.match(css, /\.entry-action \{[^}]*border:\s*1px solid rgba\(37,200,239,\.72\)[^}]*background:\s*rgba\(5,12,18,\.58\)[^}]*color:\s*var\(--cyan-bright\)/s);
  assert.doesNotMatch(css, /\.entry-action--(?:enter|pv)(?:::?[\w-]+)?\s*\{/);
});

test("replaces the world CTA with a PV replay control", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /<button className="primary-button" onClick=\{\(\) => setPvOpen\(true\)\}>PV 다시보기 <span>↻<\/span><\/button>/);
  assert.doesNotMatch(page, /<button className="primary-button"[^>]*>세계관 열람/);
});

test("ships the revised location names and legal-office copy", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /name: "핑크 거리"/);
  assert.doesNotMatch(page, /name: "사창가 거리"/);
  assert.match(page, /서민들에겐 영웅 권력가들에겐 공포의 사무실이다/);
});

test("ships Hana-rooted stat and relationship tabs with the supplied relationship records", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /role="tab"[^>]*>.*등장인물.*CHARACTER FILES/s);
  assert.doesNotMatch(page, /<b>스텟<\/b>|IDENTITY STAT/);
  assert.match(page, /role="tab"[^>]*>.*인물관계도.*RELATIONSHIP TRACE/s);
  assert.match(page, /RELATIONSHIP CHART \/\/ ROOT : HANA/);
  assert.match(page, /직속 명령 · 로건 생포/);
  assert.match(page, /FIB 파트너 · 상호 긴장/);
  assert.match(page, /추적자 · 숙적/);
  assert.match(page, /하나 중심 인물 관계도/);
  assert.match(page, /!isActive && !isConnected \? "is-muted" : ""/);
  assert.doesNotMatch(page, /relationshipFocus !== "하나" && !isActive/);
  assert.match(page, />인물 자세히 보기 <b>→<\/b><\/button>/);
  assert.match(css, /\.world-brief \{[^}]*display:\s*grid[^}]*grid-template-rows:\s*auto auto minmax\(0,1fr\) auto/s);
  assert.match(css, /\.world-brief h3 \{[^}]*line-height:\s*1\.24/s);
  assert.match(css, /\.world-brief p \{[^}]*line-height:\s*1\.82/s);
  assert.match(css, /\.relationship-node\.is-root > span \{[^}]*width:\s*94px[^}]*height:\s*94px/s);
  assert.match(css, /\.relationship-edge \{[^}]*height:\s*4px[^}]*opacity:\s*\.05/s);
  assert.match(css, /\.relationship-edge\.is-active \{[^}]*height:\s*8px[^}]*opacity:\s*1/s);
  assert.match(css, /\.relationship-edge-label \{[^}]*left:\s*var\(--edge-label-x\)[^}]*top:\s*var\(--edge-label-y\)[^}]*padding:\s*4px 6px[^}]*font:\s*800 16px\/1[^}]*translate\(var\(--edge-label-shift-x\),var\(--edge-label-shift-y\)\)/s);
  assert.doesNotMatch(css, /\.relationship-edge > i/);
  assert.match(page, /className=\{`relationship-edge-label tone-\$\{relationship\.tone\}/);
  assert.match(page, /from: "이소현", to: "이지혜"[^\n]*mapLabel: \["보호·후견", "은인·삶의 기준"\][^\n]*labelShiftX: -43, labelShiftY: 0/);
  assert.match(page, /from: "이소현", to: "최유리"[^\n]*mapLabel: \["절친", "법과 언론의 동지"\][^\n]*labelShiftX: 18, labelShiftY: 0/);
  assert.match(page, /"이소현": \{ x: 15, y: 66 \}/);
  assert.match(page, /from: "제니", to: "정하은"[^\n]*mapLabel: \["고정 신뢰 없음", "강한 의존"\][^\n]*labelShiftY: -88/);
  assert.match(css, /\.relationship-edge-label\.is-multiline \{[^}]*line-height:\s*1\.18[^}]*text-align:\s*center/s);
  assert.match(css, /\.relationship-node\.is-muted \{[^}]*opacity:\s*\.2[^}]*grayscale\(\.72\)[^}]*brightness\(\.68\)/s);
  assert.match(css, /\.relationship-legend span \{[^}]*gap:\s*21px[^}]*font:\s*650 30px\/1/s);
  assert.match(css, /\.relationship-legend i \{[^}]*width:\s*63px[^}]*height:\s*6px/s);
  assert.match(css, /\.relationship-records \{[^}]*grid-auto-rows:\s*minmax\(124px,1fr\)/s);
  assert.match(css, /\.relationship-records li:last-child:nth-child\(odd\) \{[^}]*grid-column:\s*1 \/ -1/s);
  assert.match(css, /\.relationship-records li button \{[^}]*font-size:\s*16px/s);
  assert.match(css, /\.relationship-records li p \{[^}]*font-size:\s*14px/s);
});

test("ships the PV background and transparent finale logo", async () => {
  const assets = ["hana-scream.png", "seoul-2043-logo-transparent.png"];

  for (const asset of assets) {
    await access(new URL(`../public/pv/${asset}`, import.meta.url));
    await access(new URL(`../dist/client/pv/${asset}`, import.meta.url));
  }
});

test("keeps Logan assets and the full-field error effect connected", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /logan-profile-v2\.png/);
  for (let index = 1; index <= 4; index += 1) {
    const suffix = String(index).padStart(2, "0");
    assert.match(page, new RegExp(`logan-gallery-${suffix}\\.png`));
    await access(new URL(`../public/characters/logan-gallery-${suffix}.png`, import.meta.url));
  }
  await access(new URL("../public/characters/logan-profile-v2.png", import.meta.url));

  assert.match(css, /@keyframes critical-field-flicker[^}]*transform:/s);
  assert.doesNotMatch(css, /critical-line-jump/);
  assert.doesNotMatch(page, /scroll-marker/);
});

test("drives condemnation visibility from React state instead of an opacity animation", async () => {
  const [component, css] = await Promise.all([
    readFile(new URL("../app/PvExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(component, /visibleVoiceCount/);
  assert.match(component, /index < visibleVoiceCount \? "is-visible" : ""/);
  assert.match(css, /\.pv-scene--condemnation\.is-active \.pv-voice\.is-visible \{[^}]*opacity:\s*\.9/s);
  assert.match(css, /\.pv-voice\[data-source="android"\] \{[^}]*right:\s*clamp\([^}]*left:\s*auto[^}]*color:\s*#ff294f/s);
  assert.match(css, /\.pv-voice \{[^}]*left:\s*clamp\([^}]*color:\s*#f4f7f6/s);
  assert.doesNotMatch(css, /pv-voice-appear/);
});

test("keeps the PV silent without Web Audio controls", async () => {
  const component = await readFile(new URL("../app/PvExperience.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(component, /AudioContext|createOscillator|createGain|gainRef/);
  assert.doesNotMatch(component, /SOUND \{muted|setMuted|aria-pressed=\{muted\}/);
});
