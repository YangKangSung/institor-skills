/** Bundled packs from institor/references. Overlay may replace queries at runtime. */

export type LoadClass = "light" | "microwave-tier" | "heavy" | "unknown";

export interface Pack {
  id: string;
  title: string;
  keywords: string[];
  avoid: string[];
  shortlist: { name: string; why: string }[];
  /** Scene tokens that pull this pack in. */
  signals: string[];
}

export const LOAD_PHRASES: { class: LoadClass; tokens: string[] }[] = [
  {
    class: "heavy",
    tokens: [
      "건조기",
      "dryer",
      "오븐",
      "oven",
      "온풍기",
      "히터뱅크",
      "space heater",
      "컴프레서",
      "compressor",
      "전열히터",
    ],
  },
  {
    class: "microwave-tier",
    tokens: [
      "전자레인지",
      "전자렌지",
      "microwave",
      "전자레인지급",
      "소형공구",
      "1kw",
      "1.5kw",
    ],
  },
  {
    class: "light",
    tokens: [
      "램프",
      "lamp",
      "led",
      "충전",
      "선풍기",
      "fan",
      "노트북",
      "laptop",
      "공유기",
      "router",
      "폰충전",
      "작업등",
    ],
  },
];

export const BUNDLED_PACKS: Pack[] = [
  {
    id: "door-power",
    title: "문틈 / 창문 전원",
    signals: [
      "문틈",
      "문풍지",
      "창문",
      "문풍",
      "발코니",
      "베란다",
      "도어",
      "door",
      "weatherstrip",
      "전선통과",
      "문틈전원",
    ],
    keywords: [
      "강제환기 전용 문풍지",
      "문풍지",
      "창문 틈새막이",
      "문틈 막이",
      "연장선 15A",
      "고용량 연장선",
      "창문형 에어컨 패널",
      "전선 몰딩",
      "바닥 전선 커버",
      "케이블 그로밋",
    ],
    avoid: ["초슬림 문틈 전선", "무정격 리본 코드", "얇은 멀티탭 직렬"],
    shortlist: [
      { name: "문풍지 / 강제환기 전용 씰", why: "문 닫힘 + 전선 통과" },
      { name: "짧은 15A 연장선", why: "microwave-tier 정격" },
      { name: "바닥 전선 커버 / 그로밋", why: "밟힘·모서리 보호" },
    ],
  },
  {
    id: "extension",
    title: "연장선 / 멀티탭",
    signals: ["연장선", "멀티탭", "코드", "전선", "cord", "strip", "콘센트"],
    keywords: [
      "연장선 15A",
      "과부하차단 멀티탭",
      "접지 연장선",
      "누전차단 어댑터",
      "방우형 멀티탭",
    ],
    avoid: ["무정격 릴선 감아쓰기", "문틈 전용 슬림 코드만으로 고용량"],
    shortlist: [
      { name: "15A 짧은 연장선", why: "정격·길이" },
      { name: "과부하차단 멀티탭", why: "끝단만 짧게" },
      { name: "접지 / 누전차단 어댑터", why: "습하거나 베란다" },
    ],
  },
  {
    id: "paint-light",
    title: "도장 / 작업 조명",
    signals: ["도장", "페인트", "paint", "작업등", "조명", "환풍", "클램프등"],
    keywords: ["충전식 작업등", "클램프 조명", "환풍기 이동식"],
    avoid: ["검색창에 장문 블로그 질문"],
    shortlist: [
      { name: "충전식 작업등", why: "light 클래스 먼저" },
      { name: "클램프 조명", why: "임시 거치" },
      { name: "이동식 환풍", why: "흄 — 와트 확인" },
    ],
  },
  {
    id: "fit",
    title: "호환 / 웨어러블",
    signals: [
      "스트랩",
      "밴드",
      "호환",
      "워치",
      "시계",
      "strap",
      "lug",
      "mm",
      "전모델호환",
      "사은품",
    ],
    keywords: [],
    avoid: ["전모델호환 제목만 믿기", "사은품 어댑터 = 내 기종 가정"],
    shortlist: [
      { name: "모델명 + mm 표기 스트랩", why: "케이스 지름이 아니라 스트랩 폭" },
      { name: "전용 어댑터 (기종 명시)", why: "스프링바 vs 독자 러그" },
      { name: "주문내역의 사은품 옵션", why: "본품과 다른 패밀리일 수 있음" },
    ],
  },
];
