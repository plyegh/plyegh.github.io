---
title: "지금까지의 활동 정리"
description: "개발, CTF, Bug Bounty, 기술문서, 컨퍼런스, 자격증 — 6개 분야로 정리한 활동 기록과 회고"
date: 2026-11-10T09:00:00+09:00
imageWidth: 480
tags: [retrospective, knights-frontier]
---

## 한눈에 보기

| 분야 | 활동 | 남긴 글 |
|---|---|---|
| 개발 | APS-CSPM, DBA 플랫폼 | 1 |
| CTF / Wargame | 대회 6개 (HITCON 16위) | 2 |
| Bug Bounty | 없음 | 0 |
| Blog / Tech Docs | 블로그 운영 | 1 |
| Papers / Conferences | 부스 3, 권역 세미나, 논문 리뷰 1 | 1 |
| Contests / Certifications | 네트워크관리사 2급, 고교 과학대회 | 0 |

---

## 01. 개발

| 기간 | 활동 | 구분 |
|---|---|---|
| 2026.05 ~ 2026.11 | APS-CSPM 구축 | KUCIS 동아리 프로젝트 |
| 2026.07 ~ 진행 중 | FSL project — DBA 플랫폼 제작 | 동아리 프로젝트 |

**APS-CSPM**
- APS의 2026 KUCIS 활동 주제입니다.
- 동아리 전용 온프레미스 클라우드인 APS-Cloud를 대상으로 CSPM(클라우드 보안 설정 점검)을 구축했습니다.
- kolla-ansible로 OpenStack을 구성하고, 다시 실행해도 같은 결과가 나오는 멱등 스크립트를 작성했습니다.
- 구축 기록: [Kolla-ansible 통한 Openstack 단일노드 구축](https://plyegh.github.io/posts/dev/kolla-ansible-openstack-single-node/)

**DBA (Defend & Breach Arena)**
- 공격과 방어를 함께 겨루는 공방전 플랫폼입니다.
- 프로젝트 제안을 주도했고, APS의 FSL-project로 제작하고 있습니다.

---

## 02. CTF / Wargame

| 일자 | 대회 | 결과 |
|---|---|---|
| 2026.04.25 | 2026 헥테온 세종 | 팀 · 본인 4문제 |
| 2026.08.09 | KISIA CTF 2026 | 팀 · 본인 6문제 |
| 2026.09.18 ~ 09.20 | DefCamp 2026 | 팀 · 본인 3문제 |
| 2026.10.17 ~ 10.19 | DEADFACE CTF 2026 | 팀 · 본인 11문제 |
| 2026.10.23 ~ 10.25 | HITCON CTF 2026 | 팀 · **16위** |
| 2026.10.31 | 2026 KISA ACDC | 팀 참가 |

![HITCON CTF 2026 16위](/assets/proof/hitcon-1.webp)

**라이트업**
- [DefCamp 2026 Web - DefCamp Supply](https://plyegh.github.io/posts/ctf-wargame/defcamp-2026-supply/): OS command injection + race condition
- [DefCamp 2026 Web - asicrimination](https://plyegh.github.io/posts/ctf-wargame/defcamp-2026-asicrimination/)

---

## 03. Bug Bounty

아직 제보나 수상 실적이 없습니다. 아래 회고에서 계획을 정리했습니다.

---

## 04. Blog / Tech Docs

이 블로그는 posts(6개 분야), timeline(증빙 포함 연도별 기록), about으로 구성되어 있습니다.

| 날짜 | 글 |
|---|---|
| 2026.06.20 | [Kolla-ansible 통한 Openstack 단일노드 구축](https://plyegh.github.io/posts/dev/kolla-ansible-openstack-single-node/) |
| 2026.09.19 | [DefCamp 2026 Web - DefCamp Supply](https://plyegh.github.io/posts/ctf-wargame/defcamp-2026-supply/) |
| 2026.09.22 | [DefCamp 2026 Web - asicrimination](https://plyegh.github.io/posts/ctf-wargame/defcamp-2026-asicrimination/) |
| 2026.11.09 | [논문 리뷰 - When AIOps Become "AI Oops"](https://plyegh.github.io/posts/paper-conf/ai-oops-review/) |
| 2026.11.09 | [나에 대해 기록하기](https://plyegh.github.io/posts/blog-docs/knights-frontier-about-me/) |

---

## 05. Papers / Conferences

| 일자 | 활동 | 역할 |
|---|---|---|
| 2026.07.24 | CODEGATE 2026 정보보안 부스 | 부스 운영 · 학장님 인증서 수여 |
| 2026.08 ~ 2026.11 | KUCIS 권역별 세미나 | 호남 기획·포스터·연사 섭외 / 영남·충청·서경강 참여 |
| 2026.11.03 ~ 11.05 | 2026 부산 사이버보안 콘퍼런스 | 부스 운영 |
| 2026.11.28 (예정) | OWASP 부스 | KUCIS 대표진 팀 |

**CODEGATE 2026 부스**

![CODEGATE 2026 부스](/assets/proof/codegate-booth-1.webp)

<!-- 부스 주제 한 줄 -->

**KUCIS 2026 호남권 대표 · 권역 세미나**

![KUCIS 2026 호남권 대표진](/assets/proof/kucis-honam-rep-1.webp)

- 호남권 대표로 호남 세미나를 직접 기획했습니다: 기획, 포스터 제작, 연사 섭외.
- 다른 권역 세미나에도 참여했습니다.

**2026 부산 사이버보안 콘퍼런스**

![부산 사이버보안 콘퍼런스 부스](/assets/proof/busan-cyber-conf-1.webp)

<!-- 부스 내용 한 줄 -->

**논문 리뷰**
- [When AIOps Become "AI Oops"](https://plyegh.github.io/posts/paper-conf/ai-oops-review/): USENIX Security '26

---

## 06. Contests / Certifications

| 일자 | 항목 | 결과 |
|---|---|---|
| 2026.06.23 | 네트워크관리사 2급 (한국정보통신자격협회) | 필기·실기 취득 |
| 2024.09.02 | IYSA | Gold Medal |
| 2024.06.15 | 영국 국제 프로젝트 대회 (IGO) | Honourable Mention |
| 2024.02.02 | 대만 국제과학전람회 (TISF) | Certificate of Achievement |
| 2023.08.11 | 국제연구프로그램 (ORP) | 수료 |
| 2023.08.04 | WSEEC | Grand Award · Best Poster |
| 2023.01.28 | 제20회 대한민국과학기술경진대회 (KSEF) | 동상 |
| 2022.12.17 | 제7회 전국청소년과학신문공모전 (DGIST) | 고등부 후원사상 |

---

## 회고 — 부족했던 점과 채울 계획

**1. Bug Bounty 실적 0**
- 계획: <!-- 예) 공개 프로그램 1개 선정, 오픈소스 취약점 제보 1건 -->

**2. 활동에 비해 기록이 적음**
- CTF는 6개 대회에 참가했지만 라이트업은 2개입니다.
- 프로젝트는 2개인데 글은 1개입니다.
- 계획: <!-- 예) 대회 후 1주 안에 라이트업 1개 -->

**3. CTF가 웹 위주, 상위권은 1회**
- 계획: <!-- 예) 클라우드·LLM 보안 분야로 확장 -->

**4. 보안 분야 공모전·자격증 부족**
- 계획: <!-- 예) 리눅스마스터 1급, 교내 생성형 AI 공모전 -->

**5. 프로젝트 결과물 비공개**
- 계획: <!-- 예) CSPM·DBA GitHub README·데모 정리 -->

<!-- 마무리 2~3줄: 나이츠프론티어 7개월 목표와 연결 -->
