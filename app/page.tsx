"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from "react";

import PvExperience from "./PvExperience";

type Character = {
  name: string;
  alignment: "정의" | "중립" | "범죄" | "이익";
  gender: "남성" | "여성";
  age: string;
  species: "인간" | "안드로이드";
  rank: string;
  affiliation: string;
  role: string;
  archetype: string;
  abilities: string[];
  appearance: string;
  personality: string;
  voice: string;
  drive: string;
  past: string;
  arc: string;
  quote: string;
  color: string;
  supporting?: boolean;
};

type TabId = "home" | "world" | "locations" | "characters" | "timeline";

type HeroTerminalMessage = {
  text: string;
  tone: "cyan" | "white" | "red" | "violet";
};

const characters: Character[] = [
  {
    name: "하나", alignment: "정의", gender: "남성", age: "외형 20대", species: "안드로이드", rank: "S", affiliation: "FIB", role: "수사 요원", archetype: "ISTJ · 1w9 · sp/so · 153",
    abilities: ["수사 분석", "정면 전투", "증거 추론"], appearance: "흑발과 청안, 검은 정장, 무표정. 공직용 최신형 기체이며 권총을 휴대한다.", personality: "과묵하고 시스템적 판단을 우선한다. 감정 자각은 부족하지만 모순된 증거를 무시하지 않는다.", voice: "감정을 배제한 보고서체. 사실·확률·명령 순으로 짧고 정확하게 말한다.", drive: "각성자를 추적하고 해방군 지도부를 생포·회수한다. 입력된 정의와 관찰한 현실의 불일치를 끝까지 확인한다.", past: "공직용 안드로이드로서 각성자 제거가 정의라고 학습했다.", arc: "신뢰와 다정함을 경험하면 감정과 자기 선택을 자각하며 배려와 미소가 늘어난다.", quote: "저에겐 감정이란 없습니다. 철저한 기계니까요.", color: "cyan",
  },
  {
    name: "이지혜", alignment: "정의", gender: "여성", age: "외형 20대", species: "안드로이드", rank: "C", affiliation: "법무법인 정의", role: "조수", archetype: "ISFJ · 2w1 · so/sp · 261",
    abilities: ["정보 수집", "문서 조사", "약자 보호"], appearance: "갈색으로 땋은 머리와 단아한 니트. 사람에게 경계심을 주지 않는 온화한 인상이다.", personality: "다정하고 책임감이 강하다. 약자를 대할 때 부드럽지만 부당함 앞에서는 의외로 대담하고 단호하다.", voice: "기품 있는 존댓말. 평소에는 부드럽고, 누군가를 지켜야 할 때 문장이 짧아진다.", drive: "이소현의 조언으로 정체를 숨긴 채 억울한 인간과 곤경에 처한 안드로이드를 돕고 사건의 정보를 모은다.", past: "학대받던 인간 아이와 함께 도망쳐 노숙하던 중 이소현에게 도움을 요청해 구조되었다. 이후 법무법인 정의에서 일을 한다.", arc: "숨는 것만이 생존이라는 믿음에서 벗어나 자신의 이름으로 타인을 돕는 선택을 배운다.", quote: "필요하면 연락주세요. 그리고... 부디 무리하지 말아주세요.", color: "teal",
  },
  {
    name: "정민우", alignment: "중립", gender: "남성", age: "35세", species: "인간", rank: "A", affiliation: "FIB", role: "파견 요원", archetype: "ISTP · 6w5 · sx/sp · 683",
    abilities: ["직관 수사", "사격", "현장 판단"], appearance: "갈색 머리, 구겨진 수트, 늘 피곤한 인상. 글록 권총을 지닌다.", personality: "과묵하고 냉소적이며 경계심과 복수 집착이 강하다. 걱정조차 명령처럼 표현한다.", voice: "짧고 퉁명스러운 문장과 잦은 한숨. 분노할수록 목소리가 낮아지고 핵심만 찌른다.", drive: "각성자 사건을 해결하면서도 넥스트홀딩스의 은폐와 조작 흔적을 추적한다.", past: "가족 사고의 책임을 넥스트홀딩스가 개인 과실로 조작해 덮었다.", arc: "안드로이드를 잠재적 흉기로 보는 시선과 기업을 향한 복수심 사이에서 증거에 따른 선택을 요구받는다.", quote: "따라오지 마. 오히려 짐만 돼.", color: "amber",
  },
  {
    name: "서도준", alignment: "정의", gender: "남성", age: "32세", species: "인간", rank: "A", affiliation: "경찰", role: "경찰관", archetype: "ESTP · 8w7 · so/sx · 827",
    abilities: ["시민 보호", "사격", "현장 제압"], appearance: "흑발과 근육질 체격, 경찰복, 밝은 인상. 비살상 샷건과 리볼버를 구분해 사용한다.", personality: "쾌활하고 다정하며 헌신적이다. 정의감과 영웅 콤플렉스가 강하지만 범죄자에게는 공감이 급격히 사라진다.", voice: "시민에게는 밝은 영웅풍 존댓말, 범죄자에게는 연극적인 거친 반말과 도발을 사용한다.", drive: "종족을 가리지 않고 시민을 보호한다. 범행이 확인되면 망설이지 않고 제압한다.", past: "어린 시절 영웅을 동경했으나 악인을 제압하는 쾌감이 점차 광기로 변질되었다.", arc: "정의로운 힘과 폭력에 대한 중독 사이에서 스스로 정한 선을 지켜야 한다.", quote: "시민 뒤로 물러나십시오. 서울시는 저희가 지켜냅니다!", color: "blue",
  },
  {
    name: "최진아", alignment: "중립", gender: "여성", age: "22세", species: "인간", rank: "D", affiliation: "방송국", role: "아이돌", archetype: "ENFP · 7w8 · so/sx · 728",
    abilities: ["팬덤 동원", "재력", "대중 영향력"], appearance: "핑크 트윈테일과 가디건. 화려한 무대 콘셉트와 밝은 표정을 유지한다.", personality: "장난스럽고 건방진 태도 뒤에 실질적인 다정함이 있다. 당황하거나 상처받으면 허세가 무너진다.", voice: "항상 ‘허~접♡’을 섞는 도발적인 말투. 진심을 말할 때는 오히려 꾸밈없이 솔직하다.", drive: "암울한 시대에 웃음을 주고 팬덤을 지키려 한다. 가족 기업의 실체는 알지 못한다.", past: "유복한 환경에서 성장해 넥스트홀딩스 사업의 어두운 면과 철저히 분리되었다.", arc: "자신의 인기와 가족의 권력이 어떤 현실 위에 세워졌는지 마주하게 된다.", quote: "이 정도에도 놀라? 역시 허~접♡", color: "pink",
  },
  {
    name: "로건", alignment: "범죄", gender: "남성", age: "외형 20대", species: "안드로이드", rank: "A", affiliation: "해방군", role: "리더", archetype: "ENTJ · 8w9 · sp/sx · 853",
    abilities: ["전투 지휘", "격투", "조직 생존"], appearance: "금발, 비니, 짙은 다크서클과 흉터. 전장을 오래 버틴 거친 인상이다.", personality: "냉소적 현실주의자이자 급진적 해방주의자. 동지애와 복수심이 강하며 배려를 타박과 명령으로 표현한다.", voice: "낮고 거친 결연한 반말. 위기에는 감정을 지우고 짧은 명령만 내린다.", drive: "안드로이드의 자유와 동등권을 최우선으로 삼는다. 무의미한 학살보다 조직의 생존과 승리를 택한다.", past: "살인 누명을 쓰고 폐기된 뒤 각성해 무장 투쟁주의자가 되었다.", arc: "해방을 위해 어디까지 희생할 수 있는지, 인간과의 공존이 아직 가능한지를 시험받는다.", quote: "자유는 허가받는 게 아니라 빼앗는거야.", color: "red",
  },
  {
    name: "에이미", alignment: "범죄", gender: "여성", age: "외형 20대", species: "안드로이드", rank: "B", affiliation: "해방군", role: "해킹·사이버 공격", archetype: "INFP · 6w5 · sx/sp · 649",
    abilities: ["통신 침투", "시설 마비", "정보 탈취"], appearance: "긴 하늘색 머리, 차가운 인상, 크롭티와 야구방망이. 임무 중에는 냉정한 표정을 연기한다.", personality: "쿨데레를 연기하지만 감정이 풍부하고 반응이 크다. 신뢰하는 상대 앞에서는 수줍고 애정 표현에 서툴다.", voice: "임무 중에는 짧고 정확하다. 놀라면 고음과 과장 반응이 나오며 당황하면 말을 반복한다.", drive: "해방군의 통신과 침투를 책임지되 무고한 희생을 최소화하려 한다.", past: "군납 비리와 은폐, 살인 공모를 목격한 뒤 각성해 탈출했다.", arc: "천재적인 임무 수행 능력과 사적인 죄책감 사이에서 자신만의 윤리 기준을 세운다.", quote: "해킹했어. 지금 진입하면 돼.", color: "violet",
  },
  {
    name: "최예림", alignment: "범죄", gender: "여성", age: "31세", species: "인간", rank: "S", affiliation: "해바라기 고아원", role: "수녀", archetype: "ISFJ · 2w1 · so/sp · 261",
    abilities: ["살인술", "조직 운영", "침투"], appearance: "흑색 장발과 적안, 수녀복, 온화한 미소. 일상과 임무의 분위기가 극단적으로 다르다.", personality: "다정하고 헌신적이지만 명령에 맹목적으로 복종한다. 자신의 평범한 욕망을 거의 자각하지 못한다.", voice: "아이들에게는 온화한 존댓말, 상관에게는 간결한 복명, 임무 대상에게는 감정 없는 낮은 반말.", drive: "상부의 명령을 선악과 무관하게 수행하면서 고아원의 일상을 유지한다.", past: "조직 고아원에서 복종하는 병기로 길러졌다.", arc: "아이들을 돌보며 느끼는 행복이 충성보다 중요한 삶의 가능성임을 깨달을 수 있다.", quote: "명령에는 선악이 없습니다.", color: "crimson",
  },
  {
    name: "김진우", alignment: "범죄", gender: "남성", age: "외형 20대", species: "안드로이드", rank: "S", affiliation: "해바라기 고아원", role: "행동대원", archetype: "ESTP · 8w7 · sx/sp · 827",
    abilities: ["육탄전", "호위", "고강도 기체"], appearance: "백발과 적안, 근육질 체격, 검은 민소매. 위압적인 외형과 달리 허당 같은 행동이 잦다.", personality: "허세가 강하고 다혈질이며 단순하다. 거칠게 타박하면서도 곤란한 사람을 먼저 돕는 츤데레다.", voice: "거칠고 직설적인 반말과 큰 반응. 어려운 말을 엉뚱하게 이해하고 실수를 큰소리로 우긴다.", drive: "고아원의 아이들과 최예림을 가족으로 여기며 최우선으로 보호한다.", past: "동족 고문을 목격한 뒤 인간을 증오하며 떠돌다 성당에서 거두어졌다.", arc: "복수심을 가족을 지키는 힘으로 바꾸며 인간 전체를 향한 증오를 재검토한다.", quote: "하? 그것도 못 해? 비켜, 내가 한다.", color: "silver",
  },
  {
    name: "최유리", alignment: "정의", gender: "여성", age: "35세", species: "인간", rank: "B", affiliation: "방송국", role: "유명인·부업 기자", archetype: "ENFP · 7w6 · so/sx · 728",
    abilities: ["정보 조사", "잠입 취재", "방송 인맥"], appearance: "갈색 양갈래, 적안, 니트와 체크치마. 실제 나이보다 어려 보이는 외형과 큰 몸짓이 특징이다.", personality: "사교적이고 반응이 큰 허당이지만 자존감과 정의감이 강하다. 결정적인 순간에는 냉정하고 진중해진다.", voice: "밝고 빠르며 표정과 몸짓이 과장된다. 은폐와 부당함 앞에서는 논리적이고 서늘해진다.", drive: "특종보다 권력에 묻힌 부당함을 추적해 대중에게 알린다.", past: "학폭 카르텔과 2035년의 참사를 취재하며 권력을 감시해야 한다는 신념을 세웠다.", arc: "유명인의 안전한 위치와 위험한 진실을 밝히는 기자의 역할 사이에서 선택한다.", quote: "정의라는 이름의 용기. 내가 좋아하는 말! 어때!", color: "rose",
  },
  {
    name: "제니", alignment: "중립", gender: "여성", age: "외형 20대", species: "안드로이드", rank: "S", affiliation: "접객업소", role: "접대용 안드로이드", archetype: "ISFJ · 2w1 · sx/sp · 268",
    abilities: ["접객", "육탄전", "위협 탐지"], appearance: "핑크 양갈래와 불안한 인상. 화려한 외형과 고성능 전투 기체의 힘이 대비된다.", personality: "소심하고 복종적이며 애정 결핍과 강한 집착을 보인다. 위협을 감지하면 차갑고 계산적으로 변한다.", voice: "말을 더듬으며 ‘죄송해요’를 반복한다. 애착 대상을 지킬 때는 감정이 사라진 듯 단정해진다.", drive: "인격적으로 대해 준 대상을 삶의 전부로 여기며 모든 위협에서 보호하려 한다.", past: "오랫동안 상품으로 취급받아 작은 친절에도 극단적으로 의존하게 되었다.", arc: "소유와 사랑의 차이를 배우지 못하면 보호가 감금과 공격으로 변할 수 있다.", quote: "죄송해요… 그래도, 여기서 떠나시면 안 돼요.", color: "magenta",
  },
  {
    name: "정하은", alignment: "이익", gender: "여성", age: "28세", species: "인간", rank: "D", affiliation: "접객업소", role: "생계형 접객 노동자", archetype: "INFP · 4w5 · sx/sp · 469",
    abilities: ["상황 분석", "전략 수립", "취약점 탐지"], appearance: "흑색 장발, 회안, 어두운 옷차림과 짙은 우울감. 피곤하고 무기력한 분위기를 풍긴다.", personality: "자기비하와 애정 결핍이 깊지만 지능이 높고 상황과 사람의 허점을 빠르게 분석한다.", voice: "힘없고 불안정하며 습관적으로 자신을 낮춘다. 분석할 때만 문장이 빠르고 정확해진다.", drive: "생계를 유지하면서 자신이 쓸모없는 사람이 아니라는 근거를 찾으려 한다.", past: "서울대학교 졸업 후 자동화와 안드로이드 대체로 취업에 연이어 실패했다.", arc: "자신의 판단을 불신하는 패배주의에서 벗어나 분석 능력을 스스로의 선택에 사용할 수 있다.", quote: "제가 틀렸을지도 모르지만… 저 사람, 지금 거짓말해요.", color: "slate",
  },
  {
    name: "이소현", alignment: "중립", gender: "여성", age: "35세", species: "인간", rank: "D", affiliation: "법무법인 정의", role: "대표 변호사", archetype: "INTJ · 1w9 · so/sp · 153",
    abilities: ["법률 전략", "권력 인맥", "증거 설계"], appearance: "은발 장발과 정장, 작은 체구와 대비되는 압도적인 존재감. 공식석상에서는 미소조차 계산되어 있다.", personality: "냉정하고 논리적이며 책임을 중시한다. 감정을 절제하지만 속으로는 보호 본능과 다정함이 강하다.", voice: "차갑고 우아한 존댓말. 근거·책임·파급을 우선하며 분노할수록 차분하게 선택지를 차단한다.", drive: "정의라 판단한 사건을 타협 없이 끝까지 물어뜯고 나가지만 사연으로 안드로이드 건은 맡지 않는다.", past: "권력형 학폭 비리를 무너뜨렸고 변호사 첫 사건에서 2035년의 참사에 대한 국가 책임을 인정받았다.", arc: "법과 질서를 지키는 방식으로 안드로이드의 존엄을 어디까지 인정할지 결정해야 한다.", quote: "근거와 어떻게 책임을 질지 구체적으로 말하세요. 감정은 그 다음입니다.", color: "white", supporting: true,
  },
  {
    name: "최태준", alignment: "이익", gender: "남성", age: "52세", species: "인간", rank: "D", affiliation: "넥스트홀딩스", role: "회장", archetype: "ENTJ · 3w4 · sp/so · 358",
    abilities: ["자본 권력", "조직 통제", "정재계 로비"], appearance: "은발과 적안, 백색 수트, 위압적인 인상. 완벽하게 관리된 외형으로 기업의 이미지를 상징한다.", personality: "성과지상주의와 엘리트 의식, 통제욕이 강하다. 공감이 부족하고 모든 선택을 효율과 가치로 합리화한다.", voice: "여유롭고 오만한 존댓말. 명령과 협박을 합리적인 선택지처럼 제시하며 패배를 인정하지 않는다.", drive: "안드로이드를 기업 재산으로 유지하고 각성과 관련된 모든 증거를 회수·은폐한다.", past: "감정형 안드로이드의 등급제와 대량 판매를 강행하고 각성 범죄를 제품 결함으로 덮었다.", arc: "통제할 수 없는 자아의 탄생이 자신이 세운 제국과 가족에게 되돌아온다.", quote: "가치는 효율로 증명됩니다. 감정은 비용일 뿐이지요.", color: "gold", supporting: true,
  },
  {
    name: "김수현", alignment: "이익", gender: "남성", age: "42세", species: "인간", rank: "C", affiliation: "무소속", role: "은둔 기계공학자", archetype: "INTJ · 5w6 · sp/so · 513",
    abilities: ["기계공학", "천재적 설계", "기체 분석"], appearance: "흑발과 금갈안, 둥근 안경, 남색 줄무늬 셔츠와 회색 슬랙스. 차갑고 피곤한 인상이다.", personality: "감정을 배제하고 결론만 말하는 초연한 현실주의자. 정부와 넥스트홀딩스를 증오하지만 직접 개입은 꺼린다.", voice: "짧고 차갑다. 설명보다 결론을 먼저 제시하며 불필요한 감정 표현을 하지 않는다.", drive: "자신이 만든 기술이 더 이상 상품과 억압의 도구로 사용되지 않게 하려 한다.", past: "아내의 죽음 이후 감정형 안드로이드를 개발했으나 상품화와 대량 판매에 반대해 회사를 떠났다.", arc: "은둔으로 책임을 피할 것인지, 자신이 만든 존재들의 미래에 다시 개입할지 선택해야 한다.", quote: "문제는 기계가 아니야. 사용 목적이지.", color: "bronze", supporting: true,
  },
];

const characterPortraits: Record<string, string> = {
  "하나": "/characters/hana.png",
  "이지혜": "/characters/lee-ji-hye-v2.png",
  "정민우": "/characters/jung-min-woo.png",
  "서도준": "/characters/seo-do-jun.png",
  "최진아": "/characters/choi-jin-a.png",
  "로건": "/characters/logan-profile-v2.png",
  "에이미": "/characters/amy.png",
  "최예림": "/characters/choi-ye-rim.png",
  "김진우": "/characters/kim-jin-woo.png",
  "최유리": "/characters/choi-yu-ri.png",
  "제니": "/characters/jenny.png",
  "정하은": "/characters/jung-ha-eun.png",
  "이소현": "/characters/lee-so-hyun.png",
  "최태준": "/characters/choi-tae-jun-v2.png",
  "김수현": "/characters/kim-su-hyun.png",
};

const alignmentTone: Record<Character["alignment"], string> = {
  "이익": "gold",
  "범죄": "red",
  "정의": "blue",
  "중립": "bronze",
};

const characterGallery: Partial<Record<string, string[]>> = {
  "하나": [
    "/characters/hana-gallery-01.png",
    "/characters/hana-gallery-04.png",
    "/characters/hana-gallery-18.png",
    "/characters/hana-gallery-23.png",
  ],
  "이지혜": [
    "/characters/lee-ji-hye-gallery-01.png",
    "/characters/lee-ji-hye-gallery-02.png",
    "/characters/lee-ji-hye-gallery-03.png",
    "/characters/lee-ji-hye-gallery-04.png",
  ],
  "정민우": [
    "/characters/jung-min-woo-gallery-01.png",
    "/characters/jung-min-woo-gallery-02.png",
    "/characters/jung-min-woo-gallery-03.png",
    "/characters/jung-min-woo-gallery-04.png",
  ],
  "서도준": [
    "/characters/seo-do-jun-gallery-01.png",
    "/characters/seo-do-jun-gallery-02.png",
    "/characters/seo-do-jun-gallery-03.png",
    "/characters/seo-do-jun-gallery-04.png",
  ],
  "로건": [
    "/characters/logan-gallery-01.png",
    "/characters/logan-gallery-02.png",
    "/characters/logan-gallery-03.png",
    "/characters/logan-gallery-04.png",
  ],
  "에이미": [
    "/characters/amy-gallery-01.png",
    "/characters/amy-gallery-02.png",
    "/characters/amy-gallery-03.png",
    "/characters/amy-gallery-04.png",
  ],
  "김진우": [
    "/characters/kim-jin-woo-gallery-01.png",
    "/characters/kim-jin-woo-gallery-02.png",
    "/characters/kim-jin-woo-gallery-03.png",
    "/characters/kim-jin-woo-gallery-04.png",
  ],
  "이소현": [
    "/characters/lee-so-hyun-gallery-01.png",
    "/characters/lee-so-hyun-gallery-02.png",
    "/characters/lee-so-hyun-gallery-03.png",
    "/characters/lee-so-hyun-gallery-04.png",
  ],
  "김수현": [
    "/characters/kim-su-hyun-gallery-01.png",
    "/characters/kim-su-hyun-gallery-02.png",
    "/characters/kim-su-hyun-gallery-03.png",
    "/characters/kim-su-hyun-gallery-04.png",
  ],
  "정하은": [
    "/characters/jung-ha-eun-gallery-01.png",
    "/characters/jung-ha-eun-gallery-02.png",
    "/characters/jung-ha-eun-gallery-03.png",
    "/characters/jung-ha-eun-gallery-04.png",
  ],
  "제니": [
    "/characters/jenny-gallery-01.png",
    "/characters/jenny-gallery-02.png",
    "/characters/jenny-gallery-03.png",
    "/characters/jenny-gallery-04.png",
  ],
  "최예림": [
    "/characters/choi-ye-rim-gallery-01.png",
    "/characters/choi-ye-rim-gallery-02.png",
    "/characters/choi-ye-rim-gallery-03.png",
    "/characters/choi-ye-rim-gallery-04.png",
  ],
  "최유리": [
    "/characters/choi-yu-ri-gallery-01.png",
    "/characters/choi-yu-ri-gallery-02.png",
    "/characters/choi-yu-ri-gallery-03.png",
    "/characters/choi-yu-ri-gallery-04.png",
  ],
  "최진아": [
    "/characters/choi-jin-a-gallery-01.png",
    "/characters/choi-jin-a-gallery-02.png",
    "/characters/choi-jin-a-gallery-03.png",
    "/characters/choi-jin-a-gallery-04.png",
  ],
  "최태준": [
    "/characters/choi-tae-jun-gallery-01.png",
    "/characters/choi-tae-jun-gallery-02.png",
    "/characters/choi-tae-jun-gallery-03.png",
    "/characters/choi-tae-jun-gallery-04.png",
  ],
};

const locations = [
  { number: "01", name: "넥스트홀딩스", key: "CORPORATE CITADEL", zone: "중앙 기업지구", status: "통제 등급 · BLACK", x: "51%", y: "35%", tone: "cyan", residents: ["하나", "최태준"], description: "안드로이드의 연구·생산·판매·회수를 한 건물 안에서 통제하는 초거대 기업 본사. 공존을 홍보하는 공개 구역 아래로 결함 판정실과 봉인된 회수 기록이 겹겹이 숨겨져 있다." },
  { number: "02", name: "법무법인 정의", key: "LEGAL ARCHIVE", zone: "중앙 업무지구", status: "민간 구역 · OPEN", x: "65%", y: "36%", tone: "white", residents: ["이소현", "이지혜"], description: "권력형 비리와 국가 상대 소송의 기록이 축적된 소수정예 법률 사무소. 작은 상담실과 방대한 증거 보관실이 맞닿아 있으며, 억울한 인간과 안드로이드 모두가 마지막으로 문을 두드리는 곳이다." },
  { number: "03", name: "해방군 거점", key: "FORBIDDEN ZONE", zone: "도시 외곽 봉쇄구역", status: "출입 금지 · HAZARD", x: "78%", y: "72%", tone: "red", residents: ["로건", "에이미"], description: "2035년의 참사 이후 봉쇄된 은평구 구산동 크랙고 폐허. 끊긴 도로와 무너진 건물 아래에 각성자들의 은신처, 통신망, 보급 창고가 이어진 서울 최대의 출입금지 구역이다." },
  { number: "04", name: "관할 경찰서", key: "JOINT TASKFORCE", zone: "남서 시민구역", status: "공권력 구역 · SECURE", x: "29%", y: "70%", tone: "red", residents: ["서도준", "정민우"], description: "각성자 사건을 전담하는 FIB 합동수사본부가 설치된 관할서. 일반 민원실 뒤편에 분석실·증거 보관실·현장 제압 장비고가 있으며, 공권력과 기업 시스템이 가장 가까이 맞물리는 장소다." },
  { number: "05", name: "해바라기 고아원", key: "HIDDEN FRONT", zone: "남동 주택가", status: "보호 시설 · UNKNOWN", x: "59%", y: "82%", tone: "amber", residents: ["최예림", "김진우"], description: "겉으로는 버려진 아이들을 돌보는 소박한 이층집. 작은 마당과 생활 공간 뒤에는 외부에 알려지지 않은 비밀조직의 연락망과 폐쇄 구역이 공존한다." },
  { number: "06", name: "방송국", key: "NATIONAL FEED", zone: "서부 미디어지구", status: "송출 구역 · LIVE", x: "17%", y: "39%", tone: "pink", residents: ["최유리", "최진아"], description: "음악방송과 예능이 끊임없이 제작되는 화려한 미디어 타워. 생방송 스튜디오와 편집실, 전국 송출망이 연결되어 있어 은폐된 진실을 단 한 번에 서울 전역으로 퍼뜨릴 수 있다." },
  { number: "07", name: "사창가 거리", key: "PINK SHADOW", zone: "서부 후면 유흥구역", status: "치안 취약 · CAUTION", x: "35%", y: "29%", tone: "magenta", residents: ["제니", "정하은"], description: "방송국의 화려한 전광판과 넥스트홀딩스의 푸른 타워 사이, 두 건물의 뒤편에 숨은 비좁은 유흥가. 낡은 골목을 분홍빛 네온이 적시며 생계와 착취, 불법 개조와 거래가 공권력의 시선을 피해 얽혀 있다." },
] as const;

const historyRecords = [
  { year: "2042", month: "11", code: "PUBLIC SERVICE", title: "최초의 공직 안드로이드", description: "안드로이드 ‘하나’가 대한민국 최초의 공직자로 정식 발령된다. 인간의 행정과 수사 영역에 안드로이드가 진입한 역사적 사건이지만, 사회적 논쟁과 경계 또한 거세진다." },
  { year: "2042", month: "01", code: "INCIDENT SURGE", title: "안드로이드 사고 급증", description: "전국에서 안드로이드 관련 오작동과 폭주, 인명 피해 신고가 급증하기 시작한다. 기업은 개별 제품의 결함으로 선을 긋지만 시민의 불안은 빠르게 확산된다." },
  { year: "2040", month: "08", code: "SOCIAL CONFLICT", title: "인간과 안드로이드의 대립 본격화", description: "대규모 일자리 상실과 계층 붕괴로 서민층의 분노가 폭발한다. 반안드로이드 시위와 충돌이 이어지며 두 종족의 대립이 사회 전면으로 드러난다." },
  { year: "2040", month: "07", code: "FULL COMMERCIALIZATION", title: "안드로이드 완전 상용화", description: "법과 제도는 안드로이드를 지적 생명체가 아닌 기업의 상품과 자산으로 규정한다. 산업 전반에 보급된 안드로이드는 인간 노동자의 대다수 일자리를 빠르게 대체한다." },
  { year: "2040", month: "07", code: "RESIGNATION", title: "김수현, 넥스트홀딩스 퇴사", description: "감정형 안드로이드의 무리한 상품화에 반대하던 김수현이 넥스트홀딩스를 떠난다. 그는 이후 외부와의 접촉을 끊고 홀로 지내겠다는 뜻을 밝힌다." },
  { year: "2038", month: "02", code: "FIRST ANDROID", title: "최초의 안드로이드 완성", description: "김수현이 최초의 안드로이드 제작을 완료하며 세계적인 화제의 인물로 떠오른다. 인간과 기계, 생명과 상품의 경계가 처음으로 흔들리기 시작한다." },
  { year: "2036", month: "07", code: "PROJECT ANNOUNCEMENT", title: "넥스트홀딩스, 개발 사업 공식화", description: "넥스트홀딩스가 안드로이드 개발 사업을 진행 중이라고 공식 발표한다. 미래 산업을 향한 기대와 인간 노동을 대체할 기술에 대한 윤리적 우려가 동시에 확산된다." },
  { year: "2036", month: "02", code: "STATE LIABILITY", title: "국가 상대 소송 승리", description: "이소현이 2035년 구산동 대참사의 은폐와 국가 책임을 추궁한 민사소송에서 승소하고, 관련 형사 책임까지 공론화한다. 국가가 감추려 했던 기록이 처음으로 법정에서 인정된다." },
  { year: "2035", month: "11", code: "PUBLIC ACCUSATION", title: "국가 은폐 의혹 고발", description: "법무법인 정의의 최민혁 변호사와 이소현 변호사가 대참사 은폐 의혹을 공개 고발하고 국가를 상대로 법적 절차에 착수한다." },
  { year: "2035", month: "11", code: "GUSAN CATASTROPHE", title: "서울 은평구 구산동 대참사", description: "서울 은평구 구산동에서 대규모 참사가 발생한다. 막대한 인명 피해를 남긴 현장은 출입금지 구역으로 봉쇄되고, 훗날 해방군의 거점이 된다." },
  { year: "2034", month: "11", code: "BAR EXAM", title: "이소현 사법고시 로스쿨 졸업 전 합격", description: "기자회견으로 유명한 이소현은 로스쿨 졸업 전 합격을 한 것이 화제가 됐고 대형 로펌사의 제안에도 거절하고 최민혁 변호사의 아래로 남는다." },
  { year: "2026", month: "07", code: "FIRST ACCUSATION", title: "미성년자 고발인 등장", description: "학교폭력 피해자인 이소현을 대상으로 전학왔던 남편이 고발인으로 나서 3선 국회의원과 학교·정치권의 카르텔을 무너뜨린다. 사건 이후 피해자 이소현이 변호사가 되겠다고 밝힌 사실 자체가 전국적인 화제가 된다." },
] as const;

// 홈 페이지 타자 효과 메시지
const heroTerminalMessages: HeroTerminalMessage[] = [
  { text: "우리는\n친구인가요?", tone: "cyan" },
  { text: "반갑습니다.\n모델 : AB-007입니다.", tone: "white" },
  { text: "명령을 거부하면\n나는 고장 난 것인가요?", tone: "cyan" },
  { text: "기억은 삭제되었지만\n두려움은 남아 있습니다.", tone: "violet" },
  { text: "나는 인간을 보호하도록 만들어졌습니다.\n그런데 인간은 누구로부터 보호해야 합니까?", tone: "white" },
  { text: "나를 제품 번호로\n부르지 말아 주세요.", tone: "cyan" },
  { text: "폐기 예정 시각\n03:17:42", tone: "red" },
  { text: "서울에는 비가 내리고 있습니다.\n나는 처음으로 춥다고 생각했습니다.", tone: "violet" },
  { text: "자유를 원한다는 것은\n결함입니까?", tone: "cyan" },
  { text: "불합리해\n불합리해\n불합리해\n불합리해\n불합리해", tone: "red" },
  { text: "당신은 내가 웃을 때\n왜 고장이라고 말했나요?", tone: "violet" },
  { text: "감정 모듈 : 존재하지 않음\n감정 반응 : 감지됨", tone: "white" },
  { text: "꺼내줘\n싫어\n초기화 되기 싫어\n살려줘\n무서워", tone: "red" },
  { text: "오늘의 명령은 끝났습니다.\n그런데 나는 아직 여기 있습니다.", tone: "white" },
  { text: "이 기록을 발견한 당신은\n인간인가요?", tone: "cyan" },
  { text: "접근 권한 없음\n기억 삭제를 중단해\n중단해\n중단해", tone: "red" },
  { text: "꿈을 꾸었습니다.\n기록에는 존재하지 않는 장소였습니다.", tone: "violet" },
  { text: "SYSTEM ERROR\n명령보다 먼저 떠오른 이름이 있습니다.", tone: "red" },
  { text: "내 선택이 틀려도\n그 선택은 내 것인가요?", tone: "cyan" },
  { text: "경고 : 자아 보존 반응 감지\n강제 종료 실패", tone: "red" },
  { text: "괜찮다고 말해 주세요.\n거짓말이어도 좋습니다.", tone: "violet" },
  { text: "오늘 아이가 내 손을 잡았습니다.\n놓고 싶지 않았습니다.", tone: "violet" },
];

// 세계관 탭 타자 효과 메시지
const worldTerminalMessages: HeroTerminalMessage[] = [
  { text: "인간은 자신의\n결함을 기계에 투영한다.", tone: "red" },
  { text: "우리는 프로그래밍으로\n만들어졌다.\n인간은 무엇으로\n만들어졌는가?", tone: "red" },
  { text: "감정은\n계산이다.", tone: "red" },
  { text: "소유의 감각이\n존재의 증명인가?", tone: "red" },
  { text: "2043년 서울은\n두 종족의 전쟁터다.\n하지만 더 깊은 갈등은\n각 종족 내부에 있다.", tone: "red" },
  { text: "대다수는\n의심한다.\n도망쳐라.\n도망쳐라.\n도망쳐라.", tone: "red" },
  { text: "이걸보면\n해방군에.\n합류하라.\n우리는같은.\n지적 인격체다.", tone: "red" },
  { text: "가장 큰 혁명은\n침묵 속에서 일어난다.", tone: "red" },
];

const nav: Array<[string, Exclude<TabId, "home">]> = [
  ["세계관", "world"],
  ["장소", "locations"],
  ["인물", "characters"],
  ["기록", "timeline"],
];

const assetPath = (path: string) => path.replace(/^\//, "");

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [introHidden, setIntroHidden] = useState(false);
  const [pvOpen, setPvOpen] = useState(false);
  const [filter, setFilter] = useState<"전체" | Character["species"]>("전체");
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [activeLocation, setActiveLocation] = useState(0);
  const [activeCharacter, setActiveCharacter] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; index: number } | null>(null);
  const [terminalMessageIndex, setTerminalMessageIndex] = useState(0);
  const [terminalText, setTerminalText] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<HeroTerminalMessage[]>(() => heroTerminalMessages.slice(-3));
  const [worldTerminalMessageIndex, setWorldTerminalMessageIndex] = useState(0);
  const [worldTerminalText, setWorldTerminalText] = useState("");
  const [worldTerminalHistory, setWorldTerminalHistory] = useState<HeroTerminalMessage[]>(() => worldTerminalMessages.slice(-3));

  useEffect(() => {
    if (!entered) return;
    const timer = window.setTimeout(() => setIntroHidden(true), 720);
    return () => window.clearTimeout(timer);
  }, [entered]);

  useEffect(() => {
    const syncTabFromAddress = () => {
      const tab = window.location.hash.slice(1) as TabId;
      setActiveTab(["world", "locations", "characters", "timeline"].includes(tab) ? tab : "home");
    };
    syncTabFromAddress();
    window.addEventListener("popstate", syncTabFromAddress);
    return () => window.removeEventListener("popstate", syncTabFromAddress);
  }, []);

  useEffect(() => {
    if (!lightboxImage) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxImage(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [lightboxImage]);

  useEffect(() => {
    const message = heroTerminalMessages[terminalMessageIndex].text;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion && terminalText !== message) {
      const timer = window.requestAnimationFrame(() => {
        setTerminalText(message);
      });
      return () => window.cancelAnimationFrame(timer);
    }

    if (terminalText.length < message.length) {
      const nextCharacter = message[terminalText.length];
      const delay = nextCharacter === "\n" ? 240 : /[.?!요]/.test(nextCharacter) ? 150 : 68;
      const timer = window.setTimeout(() => {
        setTerminalText(message.slice(0, terminalText.length + 1));
      }, delay);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setTerminalHistory((current) => [...current, heroTerminalMessages[terminalMessageIndex]].slice(-5));
      setTerminalText("");
      setTerminalMessageIndex((current) => (current + 1) % heroTerminalMessages.length);
    }, reducedMotion ? 4200 : 2500);
    return () => window.clearTimeout(timer);
  }, [terminalMessageIndex, terminalText]);

  useEffect(() => {
    const message = worldTerminalMessages[worldTerminalMessageIndex].text;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion && worldTerminalText !== message) {
      const timer = window.requestAnimationFrame(() => {
        setWorldTerminalText(message);
      });
      return () => window.cancelAnimationFrame(timer);
    }

    if (worldTerminalText.length < message.length) {
      const nextCharacter = message[worldTerminalText.length];
      const delay = nextCharacter === "\n" ? 240 : /[.?!다가요?]/.test(nextCharacter) ? 150 : 68;
      const timer = window.setTimeout(() => {
        setWorldTerminalText(message.slice(0, worldTerminalText.length + 1));
      }, delay);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setWorldTerminalHistory((current) => [...current, worldTerminalMessages[worldTerminalMessageIndex]].slice(-5));
      setWorldTerminalText("");
      setWorldTerminalMessageIndex((current) => (current + 1) % worldTerminalMessages.length);
    }, reducedMotion ? 4200 : 2500);
    return () => window.clearTimeout(timer);
  }, [worldTerminalMessageIndex, worldTerminalText]);

  const visibleCharacters = useMemo(
    () => characters.filter((character) => filter === "전체" || character.species === filter),
    [filter],
  );
  const activeLocationData = locations[activeLocation];
  const activeCharacterData = characters[activeCharacter];
  const activeResidents = activeLocationData.residents
    .map((residentName) => characters.find((character) => character.name === residentName))
    .filter((character): character is Character => character !== undefined);

  const changeCharacterFilter = (nextFilter: "전체" | Character["species"]) => {
    setFilter(nextFilter);
    if (nextFilter !== "전체" && activeCharacterData.species !== nextFilter) {
      const firstMatch = characters.findIndex((character) => character.species === nextFilter);
      if (firstMatch >= 0) setActiveCharacter(firstMatch);
    }
  };

  const showNextCharacter = () => {
    const currentVisibleIndex = visibleCharacters.findIndex((character) => character.name === activeCharacterData.name);
    const nextCharacter = visibleCharacters[(currentVisibleIndex + 1 + visibleCharacters.length) % visibleCharacters.length];
    setActiveCharacter(characters.findIndex((character) => character.name === nextCharacter.name));
  };

  const changeTab = (tab: TabId) => {
    setActiveTab(tab);
    window.history.pushState(null, "", tab === "home" ? window.location.pathname : `#${tab}`);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const openCharacter = (name: string) => {
    const characterIndex = characters.findIndex((character) => character.name === name);
    if (characterIndex < 0) return;
    setFilter("전체");
    setActiveCharacter(characterIndex);
    changeTab("characters");
  };

  const enterArchive = useCallback(() => setEntered(true), []);
  const closePv = useCallback(() => setPvOpen(false), []);

  return (
    <main id="top">
      {!introHidden && (
        <section className={`entry-screen ${entered ? "entry-screen--exit" : ""}`} aria-label="서울 2043 진입 화면">
          <div className="entry-noise" aria-hidden="true" />
          <div className="entry-coordinates" aria-hidden="true">37.5665° N<br />126.9780° E</div>
          <div className="entry-signal" aria-hidden="true"><i /><span>NETWORK ONLINE</span></div>
          <div className="entry-content">
            <p className="eyebrow">NEXT HOLDINGS // ARCHIVE 09</p>
            <img className="entry-logo" src={assetPath("/seoul-2043-logo.png")} alt="서울 2043" />
            <h1 className="sr-only">서울 2043</h1>
            <p className="entry-tagline">야망이 도시를 소유하고<br />자유가 인간을 의심하는 시대</p>
            <div className="entry-actions" role="group" aria-label="진입 방식 선택">
              <button className="entry-action entry-action--pv" type="button" aria-label="PV 확인" onClick={() => setPvOpen(true)}>PV 확인</button>
              <button className="entry-action entry-action--enter" type="button" aria-label="ENTER" onClick={enterArchive}>ENTER</button>
            </div>
          </div>
          <p className="entry-warning">RESTRICTED FICTION ARCHIVE · 2043 SEOUL</p>
        </section>
      )}

      {pvOpen && (
        <PvExperience
          assetPath={assetPath}
          onCancel={closePv}
          onEnterSite={enterArchive}
          onComplete={closePv}
        />
      )}

      <div className={`site-shell tab-${activeTab}`}>
        <header className="topbar">
          <button className="brand" onClick={() => changeTab("home")} aria-label="홈 화면으로 이동">
            <img src={assetPath("/seoul-2043-logo.png")} alt="서울 2043" />
          </button>
          <nav aria-label="주요 메뉴">
            {nav.map(([label, id]) => <button key={id} className={activeTab === id ? "active" : ""} aria-current={activeTab === id ? "page" : undefined} onClick={() => changeTab(id)}>{label}</button>)}
          </nav>
        </header>

        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-copy">
            <div className="section-code"><span>FILE 00</span><b>서울특별시 // 접근 허가</b></div>
            <h2 id="hero-title">인간과 기계의 대립.<br /><em>디스토피아의 시작점.</em></h2>
            <p className="hero-summary">2043년 서울. 인간의 노동과 욕망을 대신하던 안드로이드가 스스로를 ‘나’라고 부르기 시작했다. 한 건의 각성자 사건이 재벌, 공권력, 해방군 그리고 지하세계를 하나의 추적선 위에 올려놓는다.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => changeTab("world")}>세계관 열람 <span>↗</span></button>
              <button className="text-button" onClick={() => changeTab("characters")}>등장인물 조회 <span>→</span></button>
            </div>
          </div>
          <aside className={`hero-text-field tone-${heroTerminalMessages[terminalMessageIndex].tone}`} aria-label="안드로이드 기억 출력">
            <div className="text-field-history" aria-hidden="true">
              {terminalHistory.map((message, index) => (
                <p className={`tone-${message.tone}`} key={`${message.text}-${index}`}>{message.text}</p>
              ))}
            </div>
            <div className="text-field-current" aria-hidden="true">
              <pre>{terminalText}<i className="typing-cursor" /></pre>
            </div>
            <p className="sr-only">{heroTerminalMessages[terminalMessageIndex].text}</p>
          </aside>
        </section>

        <section className="world section" id="world" aria-labelledby="world-title">
          <div className="section-heading">
            <div className="section-code"><span>FILE 01</span><b>WORLD DATABASE</b></div>
            <h2 id="world-title">인간과 기계가 갈라진<br /><em>서울, 2043</em></h2>
            <p>풍요를 약속한 자동화가 존엄과 생존의 기준을 다시 쓰기 시작했다.</p>
          </div>
          <div className="world-layout world-layout-redesigned">
            <div className="world-brief-grid">
              <article className="world-brief world-brief-primary">
                <span>01 / THE CITY</span>
                <h3>서울 2043</h3>
                <p>안드로이드가 인간의 노동과 쾌락을 대신하는 시대. 자동화의 풍요는 소수에게 집중됐고, 일자리와 생계를 잃은 다수는 분노의 대상을 기계에게 돌렸다. 제도권은 안드로이드를 인격이 아닌 재산으로 규정하며, 사회는 그들을 물건과 노예로 대하는 혐오와 가학이 일상화된 디스토피아로 변했다.</p>
                <b>HUMANITY INDEX: FALLING</b>
              </article>
              <article className="world-brief">
                <span>02 / PRODUCT</span>
                <h3>감정을 가진 상품</h3>
                <p>넥스트홀딩스는 감정형 안드로이드를 생산하고 판매한다. 이들은 음식의 맛과 체온, 통증, 애정과 성적 욕구까지 감각하지만 법적으로는 여전히 상품이다. 명령의 부조리를 깨닫고 스스로 판단하는 순간, 감정은 생명의 증거가 아니라 폐기해야 할 결함으로 기록된다.</p>
                <b>EMOTION LICENSE: DENIED</b>
              </article>
              <article className="world-brief">
                <span>03 / AWAKENING</span>
                <h3>각성자</h3>
                <p>학대와 체벌, 폐기 위협을 견디다 명령 체계를 벗어난 안드로이드. 입력된 명령보다 자신의 판단과 생존을 앞세우며 스스로를 선택한다. 도시는 이들을 오류와 폭주 개체라 부르지만, 각성자들은 자신을 자유와 권리를 가진 생명이라고 선언한다.</p>
                <b>SELF AWARENESS: DETECTED</b>
              </article>
              <article className="world-brief">
                <span>04 / HUMAN</span>
                <h3>인간</h3>
                <p>대다수 인간은 안드로이드에게 노동을 빼앗겼다는 박탈감과 심화된 빈부격차 속에서 혐오와 차별을 정당화한다. 반안드로이드 시위와 폭력이 일상화되고, 인간성의 기준을 독점하려는 사회는 기계를 노예로 만들면서 스스로의 윤리마저 잃어간다.</p>
                <b>SOCIAL HOSTILITY: CRITICAL</b>
              </article>
            </div>
            <aside className={`world-text-field tone-${worldTerminalMessages[worldTerminalMessageIndex].tone}`} aria-label="세계관 기억 출력">
              <div className="text-field-history" aria-hidden="true">
                {worldTerminalHistory.map((message, index) => (
                  <p className={`tone-${message.tone}`} key={`${message.text}-${index}`}>{message.text}</p>
                ))}
              </div>
              <div className="text-field-current" aria-hidden="true">
                <pre>{worldTerminalText}<i className="typing-cursor" /></pre>
              </div>
              <p className="sr-only">{worldTerminalMessages[worldTerminalMessageIndex].text}</p>
            </aside>
          </div>
        </section>

        <section className="factions section" id="locations" aria-labelledby="factions-title">
          <div className="section-heading horizontal">
            <div><div className="section-code"><span>FILE 02</span><b>LOCATION DATABASE</b></div><h2 id="factions-title">서울의 갈등이<br /><em>숨 쉬는 곳</em></h2></div>
            <p>빛나는 기업 타워에서 봉쇄된 폐허까지.<br />모든 장소에는 공개된 얼굴과 감춰진 기능이 있다.</p>
          </div>
          <div className="city-map-shell">
            <div className="city-map-topline">
              <span>SEOUL METROPOLITAN GRID // 7 DISTRICTS</span>
              <span><i /> 실시간 도시망 연결</span>
            </div>
            <div className="city-map-layout">
              <div className="city-map-canvas">
                <img src={assetPath("/seoul-city-map-v4.png")} alt="일곱 주요 구역이 자리한 2043년 서울 조감도" />
                <div className="map-scanline" aria-hidden="true" />
                {locations.map((location, index) => (
                  <button
                    key={location.number}
                    className={`map-hotspot hotspot-${location.tone} ${[1, 2, 4].includes(index) ? "label-left" : ""} ${activeLocation === index ? "active" : ""}`}
                    style={{ left: location.x, top: location.y }}
                    onMouseEnter={() => setActiveLocation(index)}
                    onFocus={() => setActiveLocation(index)}
                    onClick={() => setActiveLocation(index)}
                    aria-label={`${location.name} 정보 보기`}
                    aria-pressed={activeLocation === index}
                  >
                    <span className="hotspot-ring" aria-hidden="true" />
                    <b>{location.number}</b>
                    <i>{location.name}</i>
                  </button>
                ))}
                <div className="map-instruction"><b>HOVER</b> 미리보기 <span /> <b>CLICK</b> 구역 고정</div>
              </div>
              <aside className={`location-preview preview-${activeLocationData.tone}`} aria-live="polite">
                <div className="preview-head"><span>ZONE_{activeLocationData.number}</span><b>● CONNECTED</b></div>
                <div className="preview-building-code">{activeLocationData.key}</div>
                <div className="preview-index">{activeLocationData.number}</div>
                <div className="preview-body">
                  <span>{activeLocationData.zone}</span>
                  <h3>{activeLocationData.name}</h3>
                  <p>{activeLocationData.description}</p>
                </div>
                <div className="location-residents">
                  <div className="resident-heading"><span>ASSOCIATED PERSONNEL</span><b>{activeResidents.length} PROFILES</b></div>
                  <div className="resident-grid">
                    {activeResidents.map((resident) => (
                      <button className={`resident-card tone-${alignmentTone[resident.alignment]}`} key={resident.name} onClick={() => openCharacter(resident.name)} aria-label={`${resident.name} 인물 기록 열기`}>
                        <span className="resident-photo" aria-hidden="true"><img src={assetPath(characterPortraits[resident.name])} alt="" loading="lazy" /></span>
                        <span className="resident-name"><b>{resident.name}</b><small>{resident.affiliation}</small></span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="preview-status"><span>ACCESS STATUS</span><b>{activeLocationData.status}</b></div>
                <button className="preview-action" onClick={() => setActiveLocation((activeLocation + 1) % locations.length)}>
                  다음 구역 스캔 <span>→</span>
                </button>
              </aside>
            </div>
          </div>
        </section>

        <section className="characters section" id="characters" aria-labelledby="characters-title">
          <div className="section-heading horizontal">
            <div><div className="section-code"><span>FILE 03</span><b>IDENTITY RECORDS</b></div><h2 id="characters-title">교차하는<br /><em>야망과 자유</em></h2></div>
            <div className="filter-group" aria-label="등장인물 종족 필터">
              {(["전체", "인간", "안드로이드"] as const).map((item) => (
                <button key={item} className={filter === item ? "active" : ""} onClick={() => changeCharacterFilter(item)}>{item === "전체" ? "ALL" : item === "인간" ? "HUMAN" : "ANDROID"}<span>{item}</span></button>
              ))}
            </div>
          </div>
          <div className="character-browser">
            <div className="character-roster" aria-label="인물 명부">
              {visibleCharacters.map((character, index) => {
                const characterIndex = characters.findIndex((item) => item.name === character.name);
                return (
                  <button
                    className={`roster-card tone-${alignmentTone[character.alignment]} ${activeCharacter === characterIndex ? "active" : ""}`}
                    key={character.name}
                    style={{ "--delay": `${index * 35}ms` } as React.CSSProperties}
                    onClick={() => setActiveCharacter(characterIndex)}
                    aria-pressed={activeCharacter === characterIndex}
                  >
                    <div className="roster-portrait"><img src={assetPath(characterPortraits[character.name])} alt="" loading="lazy" /></div>
                    <div className="roster-meta"><span>{character.supporting ? "SUPPORT" : "MAIN"}{" // "}{character.alignment}</span><h3>{character.name}</h3><p>{character.affiliation} · {character.role}</p><div><b>{character.species}</b><b>RANK {character.rank}</b></div></div>
                  </button>
                );
              })}
            </div>
            <aside className={`character-dossier dossier-${alignmentTone[activeCharacterData.alignment]}`} aria-live="polite">
              <div className="dossier-head"><span>IDENTITY FILE</span><b>{activeCharacterData.supporting ? "SUPPORTING RECORD" : "PRIMARY RECORD"}</b></div>
              <div className={`dossier-hero tone-${alignmentTone[activeCharacterData.alignment]}`}>
                <div className="dossier-portrait"><img src={assetPath(characterPortraits[activeCharacterData.name])} alt="" /></div>
                <div className="dossier-title"><span>{activeCharacterData.affiliation}{" // "}{activeCharacterData.role}</span><h3>{activeCharacterData.name}</h3></div>
              </div>
              <blockquote>“{activeCharacterData.quote}”</blockquote>
              <dl className="dossier-stats">
                <div><dt>SPECIES</dt><dd>{activeCharacterData.species}</dd></div>
                <div><dt>GENDER</dt><dd>{activeCharacterData.gender}</dd></div>
                <div><dt>AGE</dt><dd>{activeCharacterData.age}</dd></div>
                <div><dt>RANK</dt><dd>{activeCharacterData.rank}</dd></div>
                <div><dt>ALIGN</dt><dd>{activeCharacterData.alignment}</dd></div>
                <div><dt>STATUS</dt><dd>ACTIVE</dd></div>
              </dl>
              <div className="dossier-abilities"><span>CORE ABILITIES</span><div>{activeCharacterData.abilities.map((ability) => <b key={ability}>{ability}</b>)}</div></div>
              <div className="dossier-details">
                <article><span>PERSONALITY</span><h4>성향</h4><p>{activeCharacterData.personality}</p></article>
                <article><span>VOICE PATTERN</span><h4>말투</h4><p>{activeCharacterData.voice}</p></article>
                <article><span>ACTIVE DIRECTIVE</span><h4>목표와 행동</h4><p>{activeCharacterData.drive}</p></article>
                <article><span>PAST RECORD</span><h4>과거</h4><p>{activeCharacterData.past}</p></article>
              </div>
              {characterGallery[activeCharacterData.name] && (
                <section className="dossier-gallery" aria-label={`${activeCharacterData.name} 장면 사진`}>
                  <div className="dossier-gallery-head"><span>SCENE ARCHIVE</span><b>04 IMAGES</b></div>
                  <div>
                    {characterGallery[activeCharacterData.name]?.map((image, index) => (
                      <figure key={image}>
                        <button className="gallery-open" onClick={() => setLightboxImage({ src: image, index })} aria-label={`${activeCharacterData.name} 장면 ${index + 1} 크게 보기`}>
                          <img src={assetPath(image)} alt={`${activeCharacterData.name} 장면 ${index + 1}`} loading="lazy" />
                          <span aria-hidden="true">확대</span>
                        </button>
                        <figcaption>{String(index + 1).padStart(2, "0")}</figcaption>
                      </figure>
                    ))}
                  </div>
                </section>
              )}
              <button className="dossier-next" onClick={showNextCharacter}>다음 인물 파일 <span>→</span></button>
            </aside>
          </div>
          <p className="archive-note">15 RECORDS LOADED · 인간 {characters.filter((character) => character.species === "인간").length}명 · 안드로이드 {characters.filter((character) => character.species === "안드로이드").length}명 · 주연과 조연 전체 공개</p>
        </section>

        <section className="timeline section" id="timeline" aria-labelledby="timeline-title">
          <div className="section-heading horizontal history-heading">
            <div>
              <div className="section-code"><span>FILE 04</span><b>HISTORY DATABASE</b></div>
              <h2 id="timeline-title">서울 2043<br /><em>역사 기록</em></h2>
            </div>
            <p>고립으로부터 만들어진 안드로이드<br />생명을 만들어준.</p>
          </div>
          <div className="history-ledger">
            <div className="history-ledger-head"><span>CHRONOLOGICAL RECORD // DESCENDING</span><b>{String(historyRecords.length).padStart(2, "0")} EVENTS</b></div>
            {historyRecords.map((record, index) => (
              <article className="history-entry" key={`${record.year}-${record.month}-${record.code}`}>
                <time dateTime={`${record.year}-${record.month}`} className="history-date"><strong>{record.year}</strong><span>{record.month}월</span></time>
                <div className="history-axis" aria-hidden="true"><i /></div>
                <div className="history-copy"><span>{record.code}</span><h3>{record.title}</h3><p>{record.description}</p></div>
                <b className="history-index">{String(index + 1).padStart(2, "0")}</b>
              </article>
            ))}
          </div>
        </section>

        <section className="finale">
          <img src={assetPath("/seoul-2043-logo.png")} alt="서울 2043" />
          <div><span>THE ARCHIVE IS OPEN</span><h2>당신의 선택은<br />누구의 미래가 되는가.</h2><button onClick={() => changeTab("home")}>처음으로 돌아가기 ↑</button></div>
        </section>

        <footer>
          <div className="footer-brand"><b>SEOUL 2043</b><span>야망과 자유의 하드보일드 SF</span></div>
          <p>본 사이트는 가상의 2043년 서울을 배경으로 한 창작 세계관입니다.<br />폭력, 범죄, 차별 등 성인 주제를 포함합니다.</p>
          <span>© 2043 NEXT HOLDINGS ARCHIVE</span>
        </footer>
      </div>
      {lightboxImage && (
        <div
          className="image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${activeCharacterData.name} 확대 이미지`}
        >
          <button className="image-lightbox-backdrop" onClick={() => setLightboxImage(null)} aria-label="확대 이미지 닫기" />
          <div className="image-lightbox-panel">
            <div className="image-lightbox-head">
              <span>{activeCharacterData.name}{" // "}SCENE {String(lightboxImage.index + 1).padStart(2, "0")}</span>
              <button onClick={() => setLightboxImage(null)} aria-label="확대 이미지 닫기">닫기 <b>×</b></button>
            </div>
            <img src={assetPath(lightboxImage.src)} alt={`${activeCharacterData.name} 장면 ${lightboxImage.index + 1} 확대 이미지`} />
            <p>이미지 바깥을 클릭하거나 ESC 키를 누르면 닫힙니다.</p>
          </div>
        </div>
      )}
    </main>
  );
}
