# Seoul 2043 PV Site Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 진입 화면을 `PV 확인`과 `ENTER` 두 동작으로 분리하고, PV 종료 시 투명 로고를 노이즈와 함께 유지한 채 기존 ENTER 진입을 실행한 뒤 자연스럽게 본편 화면으로 넘긴다.

**Architecture:** `app/page.tsx`는 진입 여부와 PV 오버레이 표시 여부만 소유한다. 신규 `app/PvExperience.tsx`가 장면 상태, 타이머, 타이핑, 글리치, 종료 handoff를 담당하며, 신규 `app/pv-sequence.mjs`는 Node 테스트에서도 직접 불러올 수 있는 순수 데이터/타이밍 계약을 제공한다. 모든 PV CSS는 `.pv-` 접두사를 사용해 기존 페이지 스타일과 격리한다.

**Tech Stack:** React 19, TypeScript/TSX, CSS animations, Vinext static build, Node test runner, GitHub Pages relative assets.

---

## Task 1: PV 시퀀스 계약을 테스트로 고정

**Files:**

- Create: `tests/pv-sequence.test.mjs`
- Create: `app/pv-sequence.mjs`

- [ ] **Step 1: 실패하는 시퀀스 테스트 작성**

`tests/pv-sequence.test.mjs`에서 실제 `app/pv-sequence.mjs`를 import하고 다음 계약을 검사한다.

- 비난 음성은 시민/안드로이드가 모두 포함되고, 각 문장은 화자와 텍스트를 가진다.
- 질문 문구는 `그렇다면… 제가 잘못된 건가요?` 흐름이다.
- 마지막 두 문장은 정확히 `저도 모르겠습니다.`와 `누가… 정답을 알려주세요.`다.
- 반환되는 모든 문구에 `THE ARCHIVE IS OPEN`과 텍스트 제목 `SEOUL 2043`이 없다.
- `왜?` 항목은 104개이며 하나의 발화이고 붉은 시스템 문자 연출 메타데이터를 가진다.
- 같은 입력에 동일한 위치와 지연값을 돌려주는 결정적 생성이다.
- 로고 노출과 사이트 진입 콜백 시점은 같고, 오버레이 종료는 기존 720ms 진입 전환보다 긴 최소 1000ms 뒤다.

- [ ] **Step 2: RED 확인**

Run: `node --test tests/pv-sequence.test.mjs`

Expected: `ERR_MODULE_NOT_FOUND` 또는 아직 구현되지 않은 export 때문에 실패.

- [ ] **Step 3: 최소 시퀀스 모듈 구현**

`app/pv-sequence.mjs`에서 다음 순수 함수를 export한다.

```js
export function getPvTimeline(reducedMotion = false) {}
export function getCondemnationVoices() {}
export function getQuestionLines() {}
export function getWhyPlan(count = 104, reducedMotion = false) {}
export function getEndingLines() {}
export function getFinaleTiming(reducedMotion = false) {}
```

타이밍은 절대 시각 또는 장면 기준 상대 시각 중 하나로 통일한다. `getWhyPlan`의 좌표·회전·지연은 브라우저마다 흔들리지 않도록 인덱스 기반 산술로 계산한다.

- [ ] **Step 4: GREEN 확인**

Run: `node --test tests/pv-sequence.test.mjs`

Expected: all tests pass.

- [ ] **Step 5: 커밋**

```powershell
git add app/pv-sequence.mjs tests/pv-sequence.test.mjs
git commit -m "Add tested PV sequence contract"
```

## Task 2: PV 에셋과 전체 화면 오버레이 구현

**Files:**

- Create: `public/pv/hana-scream.png`
- Create: `public/pv/seoul-2043-logo-transparent.png`
- Create: `app/PvExperience.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: 원본 에셋 검증 후 복사**

다음 원본 파일이 존재하고 PNG로 읽히는지 확인한다.

- `F:\NAI저장소\2026-08\디트로이트\최종본\cleaned\하나절규.png`
- `C:\Users\kgh\Downloads\seoul_2043_logo_transparent.png`

대상 디렉터리를 만들고 아래 이름으로 복사한다.

- `public/pv/hana-scream.png`
- `public/pv/seoul-2043-logo-transparent.png`

복사 전후 SHA-256을 비교해 바이트 단위 동일성을 확인한다. 기존 `public/characters/hana.png`는 복사하지 않고 그대로 재사용한다.

- [ ] **Step 2: PV 컴포넌트의 공개 계약 구현**

`app/PvExperience.tsx`는 다음 props만 받는다.

```ts
type PvExperienceProps = {
  assetPath: (path: string) => string;
  onCancel: () => void;
  onEnterSite: () => void;
  onComplete: () => void;
};
```

컴포넌트는 다음 상태를 소유한다.

- 현재 장면
- 타이핑 중인 문장과 문자 수
- 비난 문장 활성화 상태
- `왜?` 공포 강도 단계
- 마지막 문장/로고 표시 상태
- 종료가 이미 실행되었는지 보호하는 ref
- 등록된 timeout과 선택적 오디오 객체

- [ ] **Step 3: 장면 흐름 구현**

장면은 아래 순서로 진행한다.

1. 사이버홀딩스 명령형 문구
2. 하나의 내면 반응
3. 시민과 안드로이드의 엇박자 비난 타이핑
4. 짧은 침묵
5. `그렇다면… 제가 잘못된 건가요?`
6. 하나절규 배경 위에 붉은 시스템 폰트 `왜?` 104개가 화면 전체에 점층적으로 입력
7. `저도 모르겠습니다.`
8. `누가… 정답을 알려주세요.`
9. 문장 글리치 제거와 동시에 투명 서울 2043 로고를 노이즈로 노출
10. 로고 노출과 같은 시점에 `onEnterSite()` 호출
11. 최소 1000ms 동안 로고를 유지한 뒤 글리치 아웃하고 `onComplete()` 호출

Skip은 7번으로 이동하며 동일한 9~11번 handoff를 반드시 거친다. Escape/닫기는 `onCancel()`만 호출하고 사이트에 진입하지 않는다.

- [ ] **Step 4: 타이머·이벤트 정리 구현**

- 모든 `setTimeout` id를 ref Set에 저장하고 unmount 시 clear한다.
- Escape listener를 제거한다.
- `document.body.style.overflow` 원래 값을 보관하고 복구한다.
- 오디오가 추가되는 경우 `pause()` 후 참조를 해제한다.
- `onEnterSite`와 `onComplete`는 각각 한 번만 실행되도록 ref로 보호한다.

- [ ] **Step 5: 격리된 PV 스타일 작성**

`app/globals.css`에 `.pv-` 접두사의 스타일만 추가한다.

- overlay는 `.entry-screen`의 `z-index: 1000`보다 높다.
- 하나절규 배경은 cover 기반으로 화면 전체를 채우고, 모바일에서는 얼굴 초점이 유지되도록 background-position을 조정한다.
- 스캔라인, RGB 분리, 노이즈, 플래시, 왜곡은 pseudo-element와 keyframes로 구성한다.
- `왜?`는 붉은색 시스템/모노스페이스 글꼴이며 화면 전체에 분산된다.
- 비난 문장은 콘솔 박스 안이 아니라 화면 공간에 부유한다.
- 마지막 로고는 원본 투명 PNG 비율을 보존하며, 문장 뒤 즉시 노이즈 reveal된다.
- `prefers-reduced-motion: reduce`에서는 강한 흔들림/플래시를 줄이고 시퀀스 의미와 handoff는 유지한다.

- [ ] **Step 6: 정적 검사**

Run: `npm run lint`

Expected: exit 0.

- [ ] **Step 7: 커밋**

```powershell
git add app/PvExperience.tsx app/globals.css public/pv/hana-scream.png public/pv/seoul-2043-logo-transparent.png
git commit -m "Build full-screen Seoul 2043 PV overlay"
```

## Task 3: 기존 진입 화면과 PV를 통합

**Files:**

- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: 실패하는 SSR/빌드 테스트 추가**

`tests/rendered-html.test.mjs`에 다음 검증을 추가한다.

- 진입 화면 HTML에 서로 구분되는 `PV 확인` 버튼과 `ENTER` 버튼이 있다.
- 두 버튼을 감싸는 접근 가능한 그룹 이름이 있다.
- 빌드 산출물에 `pv/hana-scream.png`와 `pv/seoul-2043-logo-transparent.png`가 존재한다.
- 기존 핵심 페이지 콘텐츠와 이미지 asset 검사는 계속 통과한다.

Run: `npm test`

Expected: 아직 버튼이 분리되지 않아 신규 assertions가 실패.

- [ ] **Step 2: 페이지 상태 연결**

`app/page.tsx`에 다음을 추가한다.

- `pvOpen` boolean state
- 기존 `setEntered(true)`를 재사용하는 안정된 `enterArchive` callback
- `PV 확인`은 `setPvOpen(true)`만 실행
- `ENTER`는 `enterArchive()`만 실행
- `PvExperience`의 `onCancel`과 `onComplete`는 `setPvOpen(false)`
- `PvExperience`의 `onEnterSite`는 `enterArchive`

PV overlay는 `introHidden`과 무관하게 `pvOpen` 동안 렌더링되어, 로고 아래에서 기존 entry exit와 본편 reveal이 진행될 수 있어야 한다.

- [ ] **Step 3: 기존 버튼 외형을 두 버튼 그룹에 보존**

기존 `.enter-button`의 테두리, 그리드 폭, hover 느낌을 `.entry-actions`, `.entry-action--pv`, `.entry-action--enter` 구조로 옮긴다.

- 데스크톱: 기존처럼 왼쪽 넓은 `PV 확인`, 오른쪽 좁은 `ENTER`
- 키보드: 두 버튼 모두 독립 focus ring
- 모바일: 화면을 넘치지 않고 최소 터치 영역 유지
- 클릭 영역이 겹치지 않도록 실제 `<button>` 두 개 사용

- [ ] **Step 4: 전체 테스트 GREEN 확인**

Run: `npm test`

Expected: build and all Node tests pass.

Run: `npm run lint`

Expected: exit 0.

- [ ] **Step 5: 커밋**

```powershell
git add app/page.tsx app/globals.css tests/rendered-html.test.mjs
git commit -m "Integrate PV launch and archive handoff"
```

## Task 4: 실제 브라우저 전환 검증과 마무리

**Files:**

- Modify if needed: `app/PvExperience.tsx`
- Modify if needed: `app/globals.css`
- Modify if needed: `app/page.tsx`

- [ ] **Step 1: 개발 서버 실행**

Run: `npm run dev`

Expected: localhost URL이 출력되고 페이지가 HTTP 200으로 열린다.

- [ ] **Step 2: 직접 ENTER 경로 검증**

새로고침 후 아래를 확인한다.

- `PV 확인`과 `ENTER`가 각각 클릭 가능하다.
- `ENTER` 클릭 시 PV 없이 기존 entry exit가 실행된다.
- 약 720ms 후 기존 메인 아카이브 화면이 정상 표시된다.

- [ ] **Step 3: PV 취소 경로 검증**

- 새로고침 후 `PV 확인` 클릭
- PV overlay가 전체 화면을 덮는지 확인
- Escape 또는 닫기 실행
- entry 화면으로 돌아오며 메인 화면에 진입하지 않았는지 확인

- [ ] **Step 4: PV 종료 handoff 검증**

전체 재생 또는 Skip을 이용해 아래를 확인한다.

- 마지막 텍스트가 `저도 모르겠습니다.` → `누가… 정답을 알려주세요.` 순으로 타이핑된다.
- `THE ARCHIVE IS OPEN`과 텍스트 `SEOUL 2043`은 나오지 않는다.
- 투명 로고가 문장 직후 노이즈와 함께 즉시 나타난다.
- 로고가 남아 있는 동안 기존 ENTER 진입과 동일하게 메인 페이지가 배경에 열린다.
- 약 1초 후 로고가 글리치로 사라지고 PV overlay가 제거된다.
- 본편 화면이 클릭·스크롤 가능한 상태다.

- [ ] **Step 5: 에셋과 반응형 확인**

- 개발자 도구 네트워크 오류 없이 두 신규 PNG와 기존 `characters/hana.png`가 로드된다.
- GitHub Pages 하위 경로를 고려한 상대 경로를 사용한다.
- 좁은 viewport에서 버튼, 비난 문장, `왜?`, 로고가 화면 밖으로 잘리지 않는지 확인한다.

- [ ] **Step 6: 최종 검증**

Run: `npm test`

Expected: exit 0, all tests pass.

Run: `npm run lint`

Expected: exit 0.

Run: `git diff --check`

Expected: no output.

Run: `git status --short --branch`

Expected: `codex/pv-integration` 브랜치이며 의도하지 않은 변경이 없다.

- [ ] **Step 7: 최종 구현 커밋이 필요한 경우 커밋**

```powershell
git add app/PvExperience.tsx app/page.tsx app/globals.css tests/pv-sequence.test.mjs tests/rendered-html.test.mjs public/pv/hana-scream.png public/pv/seoul-2043-logo-transparent.png
git commit -m "Polish PV transition and visual effects"
```

## 완료 조건

- `PV 확인`과 `ENTER`가 동일한 진입 컨트롤 안에서 독립 동작한다.
- 기존 ENTER 진입 결과는 변하지 않는다.
- PV가 시민/안드로이드 멸시, 하나의 질문, 붉은 시스템 `왜?` 공포 장면을 재생한다.
- 엔딩은 두 문장 뒤 투명 로고를 보여주며 금지된 기존 title 문구가 없다.
- 로고가 남은 채 기존 진입이 실행되고, 로고 퇴장 뒤 메인 사이트가 완전히 사용 가능하다.
- 단위/SSR/build/lint 검증과 실제 브라우저 흐름이 모두 통과한다.
- 작업은 `codex/pv-integration` 브랜치에만 남고, 별도 요청 전에는 push/deploy/merge하지 않는다.
