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
- APS의 2026 KUCIS 활동 주제다.
- 동아리 전용 온프레미스 클라우드인 APS-Cloud를 대상으로 CSPM(클라우드 보안 설정 점검)을 구축했다.
- kolla-ansible로 OpenStack을 구성하고, 다시 실행해도 같은 결과가 나오는 스크립트(자동 스크립트 : [Kolla-ansible-auto-install](https://github.com/plyegh/kolla-aio-auto/)) 를 작성했다.
- 구축 기록: [Kolla-ansible 통한 Openstack 단일노드 구축](https://plyegh.github.io/posts/dev/kolla-ansible-openstack-single-node/)

**FSL DBA Project(Defend & Breach Arena)**
- 공격과 방어를 함께 겨루는 공방전 플랫폼이다.
- 동아리 원으로써 프로젝트의 아이디어에 참여했ek.

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

## HITCON CTF
![HITCON CTF 2026 16위](/assets/proof/hitcon-1.webp)

**라이트업**
- [DefCamp 2026 Web - DefCamp Supply](https://plyegh.github.io/posts/ctf-wargame/defcamp-2026-supply/): OS command injection + race condition
- [DefCamp 2026 Web - asicrimination](https://plyegh.github.io/posts/ctf-wargame/defcamp-2026-asicrimination/)

---

## 03. Bug Bounty

아직 제보나 수상 실적이 없다. 아래 회고에서 계획을 정리했다.

---

## 04. Blog / Tech Docs

이 블로그는 posts(6개 분야), timeline(증빙 포함 연도별 기록), about으로 구성되어 있다.

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
| 2026.11.28 | OWASP 부스 | KUCIS 대표진 팀 |

**CODEGATE 2026 부스**

![CODEGATE 2026 부스](/assets/proof/codegate-booth-1.webp)

One prompt를 통해 바이브 코딩을 하는 사람들의 보안 위험성을 알리는 형태의 부스다.

**KUCIS 2026 호남권 대표 · 권역 세미나**

![KUCIS 2026 호남권 대표진](/assets/proof/kucis-honam-rep-1.webp)

- 호남권 대표로 호남 세미나를 직접 기획했다: 기획, 포스터 제작, 연사 섭외.
- 다른 권역 세미나에도 참여했다.

**2026 부산 사이버보안 콘퍼런스**

![부산 사이버보안 콘퍼런스 부스](/assets/proof/busan-cyber-conf-1.webp)

이전 CODEGATE 2026에서 진행한거에 업데이트를 진행하여 부산 콘퍼런스에서도 부스 운영을 진행하였다.

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

--> 위 2026년 이전 것은 정보보안 내용과 관련 없는 Research Paper이다.

---

## 회고 — 부족했던 점과 채울 계획

**1. Bug Bounty 실적 0**

현재까지 Bug Bounty 실적이 없었으나 이번 나이츠프론티어 3기 미션에서 Bug Bounty를 해볼 기회를 얻을 수 있어 천천히 채워가려고 한다.

**2. 활동에 비해 기록이 적음**
- CTF는 6개 대회에 참가했지만 라이트업은 2개다.
- 프로젝트는 2개인데 글은 1개다.

**3. CTF가 웹 위주, 상위권은 1회**

CTF 참여해서 상위권을 취득한 것은 Hitcon이지만 그때 solve 한 문제는 1개 및 koth를 진행한 것 외에 역할이 부족했던 점이 있다. 그래서 wargame이나 다른 ctf를 참여해보고자 하고(무엇보다 문제푸는게 그저 재미있고, 여러가지 기술을 알게 되는것에서 경험이 쌓이는 것이 좋다.) 여러 분야(web, rev 외에도 cloud, ai, koth, etc)가 더 나오는 현 추세에 맞추어 실적을 얻고자 한다.

**4. 보안 분야 공모전·자격증 부족**

내 목표는 cloud 및 금융에 맞추어서 가려고 하기에 자격증의 경우 CPPG나, AWS, NCP, GCP, AZURE 중에 현재는 AWS 자격증을 생각하고 있는 등 더욱 알아가고자 한다. 공모전의 경우 또한 찾아보는 중이다.

**5. 프로젝트 결과물 비공개**

동아리 용 CSPM을 제작한 것이 있으나 현재 보안적 부분이나 문제점이 많아 공유하지 못한 프로젝트이다. 
