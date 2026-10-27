// About page content. Edit entries here; the page at /about renders them.

export const ABOUT_INTRO = '네트워크, 클라우드 인프라 & 보안에 관심이 많은 Plyegh입니다.';

type Item = { name: string; detail?: string; date?: string };
type Section = { title: string; dot: 'green' | 'amber' | 'blue' | 'red' | 'purple'; items: Item[] };

export const ABOUT: Section[] = [
  {
    title: 'Affiliation',
    dot: 'green',
    items: [
      { name: '우석대학교', detail: '정보보안학과 26학번', date: '2026.03 ~ Present' },
      { name: 'APS 동아리', detail: 'APS 부원', date: '2026.03 ~ Present' },
      { name: 'KUCIS 2026 호남권 대표진', detail: '호남권역 대표', date: '2026.05 ~ Present' },
    ],
  },
  {
    title: 'Projects',
    dot: 'amber',
    items: [
      { name: 'APS-CSPM 구축', detail: 'KUCIS 동아리 프로젝트', date: '2026.05 ~ 2026.11' },
      { name: 'FSL project', detail: '동아리 DBA 플랫폼 제작', date: '2026.07 ~ Present' },
    ],
  },
  {
    title: 'Activities',
    dot: 'blue',
    items: [
      { name: 'CODEGATE 2026 정보보안 부스 운영', detail: '부스 운영 · 학장님 인증서 수여', date: '2026.07' },
      { name: 'KUCIS 권역별 세미나 참여 및 진행', detail: '호남(기획 · 포스터 · 연사 섭외), 영남 · 충청 · 서경강 참여', date: '2026.08 ~ 2026.11' },
    ],
  },
  {
    title: 'CTF',
    dot: 'red',
    items: [
      { name: '2026 헥테온 세종', detail: '팀 참가 · 본인 4문제 해결', date: '2026.04' },
      { name: 'KISIA CTF 2026', detail: '팀 참가 · 본인 6문제 해결', date: '2026.08' },
      { name: 'DefCamp 2026', detail: '팀 참가 · 본인 3문제 해결', date: '2026.09' },
      { name: 'DEADFACE CTF 2026', detail: '팀 참가 · 본인 11문제 해결', date: '2026.10' },
    ],
  },
  {
    title: 'Certifications',
    dot: 'purple',
    items: [
      { name: '네트워크관리사 2급', detail: '한국정보통신자격협회 · 필기/실기 취득', date: '2026.06.23' },
    ],
  },
];
