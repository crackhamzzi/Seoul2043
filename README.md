# 서울 2043 아카이브

사이버펑크 라이트노벨 《서울 2043》의 세계관, 장소, 인물, 연표를 탭 방식으로 열람하는 반응형 아카이브 사이트입니다. React 19와 vinext를 사용하며, 현재는 GitHub Pages 같은 정적 호스팅에 올리기 쉽도록 구성되어 있습니다.

## 빠른 실행

필수 환경은 Node.js 22.13 이상입니다.

```powershell
npm install
npm run dev
```

개발 서버는 기본적으로 `http://localhost:3000`에서 열립니다. 프로덕션 빌드와 검사도 같은 방식으로 실행합니다.

```powershell
npm run build
npm test
```

이제 Windows PowerShell, macOS, Linux에서 같은 명령을 그대로 사용할 수 있습니다.

## 폴더 구조

```text
app/
  page.tsx        전체 콘텐츠, 데이터, 탭 전환, 타자 효과, 이미지 모달
  globals.css     전체 레이아웃, 색상, 반응형 스타일, 오류 효과
public/
  characters/     프로필 및 캐릭터별 갤러리 이미지
  seoul-city-map-v4.png
  seoul_2043_logo_transparent.png
tests/            렌더 결과 검증
.openai/
  hosting.json    Sites 프로젝트 연결 정보
outputs/          사용 안내서 등 전달용 문서
```

## 주요 콘텐츠 수정

대부분의 내용은 `app/page.tsx` 상단의 데이터에서 수정합니다.

- `characters`: 인물 이름, 성향, 등급, 소속, 능력, 말투, 과거, 대사
- `characterPortraits`: 인물 이름과 프로필 이미지 경로 연결
- `characterGallery`: 인물별 4장 갤러리 이미지 연결
- `locations`: 도시 지도 위치, 장소 설명, 거주 인물 연결
- `heroTerminalMessages`: 메인 화면 오른쪽에 타자로 출력할 문장
- 연표 데이터: 기록 탭의 연도·월·제목·설명

세계관 문구는 `id="world"`인 섹션의 `world-brief` 네 개에서 수정합니다. 현재 순서는 `서울 2043`, `감정을 가진 상품`, `각성자`, `인간`입니다.

## 인물과 이미지 추가

1. `public/characters`에 영문·숫자·하이픈으로 된 파일명을 사용해 이미지를 넣습니다.
2. `characters` 배열에 같은 인물 이름으로 기록을 추가합니다.
3. `characterPortraits`에 `"인물명": "/characters/파일명.png"`를 연결합니다.
4. 갤러리가 있다면 `characterGallery`에 이미지 네 장을 배열로 등록합니다.
5. 장소 미리보기에 표시하려면 해당 `locations` 항목의 `residents`에 이름을 추가합니다.

프로필은 원본 파일을 다시 자르지 않아도 `globals.css`의 `object-position`과 `transform`으로 얼굴 중심을 조절할 수 있습니다. 특정 인물만 보정할 때는 이미지 파일명을 대상으로 하는 선택자를 사용합니다.

## 장소 수정

`locations`의 `x`, `y`는 지도 이미지 위 핫스폿의 백분율 좌표입니다. `residents`의 이름은 반드시 `characters`와 `characterPortraits`에 존재해야 합니다. 설명 길이가 달라도 오른쪽 미리보기의 고정 공간 안에서 레이아웃 높이가 유지됩니다.

## 타자 문장과 오류 효과

`heroTerminalMessages`에 다음 형태로 문장을 추가합니다.

```ts
{ text: "우리는\n친구인가요?", tone: "cyan" }
{ text: "살려줘", tone: "red" }
```

사용 가능한 색은 `cyan`, `white`, `violet`, `red`입니다. `red`는 심각한 시스템 오류로 취급되어 오른쪽 전체 출력 영역이 흔들리고, 노이즈·스캔라인·글리치가 함께 표시됩니다. 줄바꿈은 `\n`을 사용합니다.

## 스타일 수정

`app/globals.css`에서 다음 영역을 찾으면 빠르게 수정할 수 있습니다.

- `.topbar`: 상단 로고와 탭
- `.hero`, `.hero-text-field`: 첫 화면과 타자 출력 영역
- `.world-*`: 세계관 네 갈래 기록과 오른쪽 빈 신호 박스
- `.city-map-*`, `.location-*`: 도시 지도와 장소 미리보기
- `.character-*`, `.roster-*`, `.dossier-*`: 인물 목록과 상세 기록
- `.history-*`: 역사 연표
- `@media`: 태블릿·모바일 반응형 규칙

## 이미지 크게 보기

인물 상세의 갤러리 이미지는 클릭하면 라이트박스로 확대됩니다. 닫기 버튼, 바깥 영역 클릭, `Esc` 키로 닫을 수 있습니다. 새 이미지는 `characterGallery`에 등록하면 같은 기능이 자동 적용됩니다.

## 검사와 배포

변경 뒤 다음 순서로 확인합니다.

```powershell
$env:WRANGLER_LOG_PATH=".wrangler/wrangler.log"
npx vinext build
node --test tests/rendered-html.test.mjs
```

배포 연결 정보는 `.openai/hosting.json`에 있습니다. GitHub Pages로 옮길 때는 정적 빌드 결과물을 업로드하면 되고, 이미지 경로는 상대 경로로 처리되도록 맞춰 두었습니다.

### GitHub Pages 배포

1. GitHub 저장소의 **Settings > Pages**로 들어갑니다.
2. **Source**를 `GitHub Actions`로 바꿉니다.
3. `main` 브랜치에 push하면 `.github/workflows/pages.yml`이 자동으로 빌드하고 배포합니다.

## 자주 생기는 문제

- 이미지가 안 보임: 파일이 `public` 아래에 있는지, 경로가 `/characters/...`로 시작하는지 확인합니다.
- 인물이 장소에 안 보임: `residents`의 이름 철자와 `characters`의 이름이 같은지 확인합니다.
- 갤러리가 비어 있음: `characterGallery`의 키가 인물 이름과 정확히 일치하는지 확인합니다.
- Windows에서 `npm run dev` 실패: PowerShell용 환경 변수 명령과 `npx vinext dev`를 사용합니다.
- 배포 후 이전 화면 표시: 캐시를 지우거나 `?v=버전`을 주소에 붙입니다.

## 편집 원칙

기존 이미지와 사용자 설정을 보존하고, 무관한 파일은 삭제하지 않습니다. 대용량 원본은 프로젝트 외부에 보관하고 실제 사이트에는 필요한 파일만 `public`에 복사합니다. 배포 전에는 항상 빌드와 렌더 테스트를 통과시킵니다.
