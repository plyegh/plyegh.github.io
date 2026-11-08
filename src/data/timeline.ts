// Timeline entries for /timeline (source: Notion "Competitions/Awards" + About affiliations/projects).
//
// date / end: 'YYYY-MM-DD' or 'YYYY-MM' (month only).
// Proof images: drop files into public/assets/proof/ named `<id>-1.jpg`, `<id>-2.png`, …
// (jpg / jpeg / png / webp). They are picked up automatically at build time.
// Blur anything you don't want public (birth date, cert/registration numbers, QR codes) first.

export type Kind = 'ctf' | 'award' | 'completion' | 'certification' | 'activity' | 'affiliation' | 'project';

export type TimelineEntry = {
  id: string;
  date: string;
  end?: string;
  title: string;
  detail?: string;
  kind: Kind;
  rank?: number;
  ongoing?: boolean; // shows "~ Present"
};

export const KIND_LABEL: Record<Kind, string> = {
  ctf: 'CTF',
  award: 'Competition',
  completion: 'Completion',
  certification: 'Certification',
  activity: 'Activity',
  affiliation: 'Affiliation',
  project: 'Project',
};

export const TIMELINE: TimelineEntry[] = [
  // 2022
  { id: 'dgist-science-news', date: '2022-12-17', title: '제7회 전국청소년과학신문공모전 (DGIST 주최)', detail: '고등부 후원사상', kind: 'award' },
  // 2023
  { id: 'ksef-20', date: '2023-01-28', title: '제20회 대한민국과학기술경진대회 (KSEF)', detail: '동상', kind: 'award' },
  { id: 'wseec', date: '2023-08-04', title: 'World Science, Environment and Engineering Competition (WSEEC)', detail: 'Grand Award · Best Poster', kind: 'award' },
  { id: 'orp', date: '2023-08-11', title: '국제연구프로그램 (ORP)', detail: '수료', kind: 'completion' },
  // 2024
  { id: 'tisf', date: '2024-02-02', title: '대만 국제과학전람회 (TISF)', detail: 'Certificate of Achievement', kind: 'award' },
  { id: 'igo', date: '2024-06-15', title: '영국 국제 프로젝트 대회 (IGO)', detail: 'Honourable Mention', kind: 'award' },
  { id: 'iysa', date: '2024-09-02', title: 'Indonesian Young Scientist Association (IYSA)', detail: 'Gold Medal', kind: 'award' },
  // 2026
  { id: 'woosuk', date: '2026-03', title: '우석대학교 정보보안학과', detail: '26학번 입학', kind: 'affiliation', ongoing: true },
  { id: 'aps', date: '2026-03', title: 'APS 동아리', detail: 'APS 부원', kind: 'affiliation', ongoing: true },
  { id: 'hacktheon-sejong', date: '2026-04-25', title: '2026 헥테온 세종', detail: '팀 참가 · 본인 4문제 해결', kind: 'ctf' },
  { id: 'kucis-honam-rep', date: '2026-05-20', title: 'KUCIS 2026 호남권 대표진', detail: '호남권역 대표 · 수료증', kind: 'completion' },
  { id: 'aps-cspm', date: '2026-05', end: '2026-11', title: 'APS-CSPM 구축', detail: 'KUCIS 동아리 프로젝트', kind: 'project' },
  { id: 'netadmin-2', date: '2026-06-23', title: '네트워크관리사 2급', detail: '한국정보통신자격협회 · 필기/실기 취득', kind: 'certification' },
  { id: 'fsl', date: '2026-07', title: 'FSL project', detail: '동아리 DBA 플랫폼 제작', kind: 'project', ongoing: true },
  { id: 'kisia-ctf', date: '2026-08-09', title: 'KISIA CTF 2026', detail: '팀 참가 · 본인 6문제 해결', kind: 'ctf' },
  { id: 'codegate-booth', date: '2026-07-24', title: 'CODEGATE 2026 정보보안 부스 운영', detail: '부스 운영 · 학장님 인증서 수여', kind: 'activity' },
  { id: 'kucis-seminar', date: '2026-08', end: '2026-11', title: 'KUCIS 권역별 세미나 참여 및 진행', detail: '호남(기획 · 포스터 · 연사 섭외), 영남 · 충청 · 서경강 참여', kind: 'activity' },
  { id: 'defcamp', date: '2026-09-18', end: '2026-09-20', title: 'DefCamp 2026', detail: '팀 참가 · 본인 3문제 해결', kind: 'ctf' },
  { id: 'hspace', date: '2026-10', title: 'HSPACE', detail: 'Knights Frontier 3기', kind: 'affiliation', ongoing: true },
  { id: 'deadface', date: '2026-10-17', end: '2026-10-19', title: 'DEADFACE CTF 2026', detail: '팀 참가 · 본인 11문제 해결', kind: 'ctf' },
  { id: 'hitcon', date: '2026-10-23', end: '2026-10-25', title: 'HITCON CTF 2026', detail: '팀 참가 · 16위', kind: 'ctf', rank: 16 },
  { id: 'kisa-acdc', date: '2026-10-31', title: '2026 KISA ACDC', detail: '팀 참가', kind: 'ctf' },
  { id: 'busan-cyber-conf', date: '2026-11-03', end: '2026-11-05', title: '2026 부산 사이버보안 콘퍼런스', detail: '부스 운영', kind: 'activity' },
  { id: 'owasp-booth', date: '2026-11-28', title: 'OWASP 부스 운영', detail: 'KUCIS 대표진 팀', kind: 'activity' },
];
