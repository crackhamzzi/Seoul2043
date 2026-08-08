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
  const response = await render();
  const html = await response.text();

  assert.match(html, /role="group" aria-label="진입 방식 선택"/);
  assert.match(html, /<button[^>]*class="entry-action entry-action--pv"[^>]*aria-label="PV 확인"[^>]*>PV 확인<\/button>/);
  assert.match(html, /<button[^>]*class="entry-action entry-action--enter"[^>]*aria-label="ENTER"[^>]*>ENTER<\/button>/);
  assert.doesNotMatch(html, /<span>기록 열람<\/span>/);
});

test("replaces the world CTA with a PV replay control", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /<button className="primary-button" onClick=\{\(\) => setPvOpen\(true\)\}>PV 다시보기 <span>↻<\/span><\/button>/);
  assert.doesNotMatch(page, /<button className="primary-button"[^>]*>세계관 열람/);
});

test("ships Hana-rooted stat and relationship tabs with the supplied relationship records", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /role="tab"[^>]*>.*스텟.*IDENTITY STAT/s);
  assert.match(page, /role="tab"[^>]*>.*인물관계도.*RELATIONSHIP TRACE/s);
  assert.match(page, /RELATIONSHIP CHART \/\/ ROOT : HANA/);
  assert.match(page, /직속 명령 · 로건 생포/);
  assert.match(page, /FIB 파트너 · 상호 긴장/);
  assert.match(page, /추적자 · 숙적/);
  assert.match(page, /하나 중심 인물 관계도/);
  assert.match(css, /\.world-brief p \{[^}]*line-height:\s*1\.95/s);
  assert.match(css, /\.relationship-node\.is-root > span \{[^}]*width:\s*94px[^}]*height:\s*94px/s);
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
