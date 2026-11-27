---
title: "OWASP Top 10:2025 동향 분석 - A06 Insecure Design, 코드보다 먼저 생기는 취약점"
date: 2026-11-27T18:45:00+09:00
tags: [OWASP, Top10, Insecure Design, Threat Modeling, Secure by Design]
description: "OWASP Top 10:2025 A06 Insecure Design 정리. 2021년판과 수치 비교, 위협 모델링(STRIDE) 직접 적용"
---

## 들어가며

웹 해킹을 공부하면 보통 "어떤 값을 넣으면 뚫리나"를 먼저 본다. 그런데 OWASP Top 10:2025에는 이상한 입력 없이 정상 요청만으로 무너지는 카테고리가 있다. A06 Insecure Design(안전하지 않은 설계)이다.

자료는 OWASP 공식 A06 페이지와, 그 페이지 References에 연결된 자료만 썼다.

---

## 1. OWASP Top 10:2021 → 2025

OWASP Top 10은 실제 취약점 데이터와 업계 설문으로 뽑은 웹 보안 위험 10가지다. 2021년판 이후 4년 만에 2025년판이 나왔다.

| 순위 | 2021 | 2025 |
|---|---|---|
| 1 | Broken Access Control | Broken Access Control |
| 2 | Cryptographic Failures | Security Misconfiguration |
| 3 | Injection | Software Supply Chain Failures (신규) |
| 4 | Insecure Design | Cryptographic Failures |
| 5 | Security Misconfiguration | Injection |
| 6 | Vulnerable and Outdated Components | **Insecure Design** |
| 7 | Identification and Authentication Failures | Authentication Failures |
| 8 | Software and Data Integrity Failures | Software or Data Integrity Failures |
| 9 | Security Logging and Monitoring Failures | Security Logging and Alerting Failures |
| 10 | Server-Side Request Forgery | Mishandling of Exceptional Conditions (신규) |

- 설정 실수와 공급망이 위로 올라왔다. 직접 짠 코드보다 설정하고 가져다 쓰는 것이 더 큰 위험이 됐다.
- Injection은 3위 → 5위. 프레임워크와 ORM이 기본으로 막아 주는 부분이 늘었다고 본다.
- Insecure Design은 4위 → 6위. 덜 중요해졌다는 뜻은 아니다(3장).

---

## 2. Insecure Design이란

OWASP 정의: 보안 통제가 설계에 없거나, 있어도 효과가 없는 상태.

코드를 잘못 짠 문제가 아니다.

| | 구현 결함 | 설계 결함 |
|---|---|---|
| 생기는 때 | 코드를 짤 때 | 요구사항·설계를 정할 때 |
| 원인 | 실수, 버그 | 무엇을 막을지 정하지 않음 |
| 해결 | 코드 수정 | 설계부터 다시 |

시험 문제로 생각하면 쉽다. 구현 결함은 식은 맞는데 계산 실수, 설계 결함은 문제를 잘못 읽고 식부터 틀린 경우다. 계산을 아무리 잘해도 답은 틀린다.

대표 형태는 비즈니스 로직 결함이다. 요청은 정상인데 기능을 의도와 다르게 쓴다. "이 상태에서 저 상태로 가면 안 된다"는 규칙이 설계에 없으면, 그걸 막는 코드도 없다.

> [!NOTE]
> OWASP는 Insecure Design이 다른 Top 10 항목의 근본 원인이라는 뜻은 아니라고 한다. 설계 단계에서 생기는 문제만 따로 묶은 카테고리다.

---

## 3. 수치로 보는 변화

| 항목 | 2021 (A04) | 2025 (A06) |
|---|---|---|
| 순위 | 4위 | 6위 |
| 매핑된 CWE 수 | 40 | 39 |
| 최대 발생률 | 24.19% | 22.18% |
| **평균 발생률** | **3.00%** | **1.86%** |
| 평균 가중 익스플로잇 점수 | 6.46 | 6.96 |
| 평균 가중 영향도 점수 | 6.78 | 4.05 |
| 최대 커버리지 | 77.25% | 88.76% |
| 평균 커버리지 | 42.51% | 35.18% |
| 총 발생 건수 | 262,407 | 729,882 |
| 관련 CVE 수 | 2,691 | 7,647 |

> [!NOTE]
> CWE는 취약점 "유형"의 번호, CVE는 실제 발견된 개별 취약점의 번호다.

- **비율은 줄었다.** 평균 발생률 3.00% → 1.86%. OWASP는 2021년 이후 위협 모델링이 확산된 효과로 본다.
- **양은 늘었다.** 발생 건수와 CVE 수는 약 2.8배. 수집 데이터가 커졌고, 설계 결함으로 분류되는 CVE가 4년간 쌓였다.
- **순위 하락은 추월 때문이다.** Security Misconfiguration(A02)과 Software Supply Chain Failures(A03)가 앞질렀다.

OWASP의 메시지는 그대로다. Shift-Left를 코드에서 멈추지 말고 요구사항·설계까지 당기라는 것.

```text
[요구사항] → [설계] → [구현] → [테스트] → [운영]
     ^          ^         ^
     |          |         └ 기존 Shift-Left (시큐어 코딩, 코드 리뷰)
     └──────────┴── A06의 출발점
```

---

## 4. 시나리오 세 개

OWASP가 든 예시다. 세 경우 모두 코드는 시킨 대로 동작했다. 틀린 건 무엇을 시킬지 정한 단계다. 그래서 스캐너나 코드 리뷰로는 잘 안 잡힌다.

### 비밀번호 찾기 질문

"출신 초등학교는?" 같은 질문으로 본인 확인. 답은 가족, 친구, SNS로도 알 수 있다. 틀린 건 코드가 아니라 "답을 안다 = 본인"이라는 전제다. NIST SP 800-63b와 OWASP ASVS는 이 방식을 쓰지 말라고 한다.

### 영화관 단체 예매

"15명까지 단체 할인" 정책이 있다. 공격자는 요청 몇 번으로 여러 극장 좌석 수백 석을 잡아 둔다. "한 번에 15명"은 정했지만 "한 사람이 동시에 잡을 수 있는 총량"은 아무도 정하지 않았다.

### 그래픽카드 리셀러 봇

출시 직후 봇이 물량을 쓸어 간다. 서버 입장에서는 사람의 구매와 같은 요청이다. "출시 몇 초 만의 구매"처럼 사람이 하기 어려운 패턴을 잡는 규칙이 설계에 있어야 한다.

---

## 5. 막는 법: 위협 모델링

OWASP가 A06 대책으로 가장 먼저 꼽는 것이 위협 모델링이다. Threat Modeling Manifesto의 네 질문으로 요약된다.

1. 무엇을 만들고 있나?
2. 무엇이 잘못될 수 있나?
3. 그래서 무엇을 할 건가?
4. 충분히 했나?

2번에는 STRIDE 체크리스트를 쓴다.

| | 위협 | 한 줄 |
|---|---|---|
| S | Spoofing | 남인 척 |
| T | Tampering | 데이터 변조 |
| R | Repudiation | 해 놓고 안 했다고 함 |
| I | Information Disclosure | 볼 수 없는 정보를 봄 |
| D | Denial of Service | 서비스를 못 쓰게 함 |
| E | Elevation of Privilege | 권한 이상의 일을 함 |

### 직접 적용: 영화관 단체 예매

**1. 무엇을 만드나**

```text
[사용자] --예매 요청--> [예매 서버] --좌석 확보--> [좌석 DB]
                            |
                            +--보증금 결제--> [결제 시스템]
```

**2. 무엇이 잘못될 수 있나**

| | 위협 |
|---|---|
| S | 계정 여러 개로 반복 예매 |
| T | 인원 수·할인 여부를 클라이언트에서 조작 |
| R | 예매 기록이 없어 누가 잡았는지 모름 |
| I | 좌석 조회로 남의 예매 정보 노출 |
| D | 결제 전 임시 확보를 반복해 전 좌석 선점 (핵심) |
| E | 일반 회원이 관리자 할인 기능 호출 |

**3. 무엇을 할 건가**

- 사용자·결제수단 기준 동시 확보 좌석 총량 제한
- 임시 확보에 만료 시간, 미결제 시 자동 해제
- 인원 수·할인 여부는 서버에서 재검증
- 짧은 시간 대량 예매 패턴 탐지

**4. 충분한가**

- "한 사용자가 여러 극장에 15석씩 100번 요청"을 테스트로 만들어 막히는지 확인

해 보니 2번이 제일 어려웠다. 정상 사용만 생각하던 머리를 "나쁘게 쓰면?"으로 바꾸는 게 쉽지 않다. STRIDE가 필요한 이유다.

---

## 6. 그 밖의 대책

OWASP A06 페이지와 연결 자료(Secure Product Design 치트시트, OWASP SAMM)에 반복해서 나오는 것만 추렸다.

- **요구사항**: 데이터별로 기밀성·무결성·가용성 중 무엇이 중요한지 비즈니스 담당자와 정한다. 보안 예산·일정은 처음부터 넣는다.
- **설계 원칙**: 안전한 기본값, 공격 표면 최소화, 실패 시 닫힘, 최소 권한, 심층 방어.
- **재사용**: 인증·권한 체크를 매번 새로 짜지 말고 검증된 패턴과 paved road 컴포넌트를 쓴다.
- **구조**: 모든 계층에서 값 검증, 노출 정도에 따라 계층 분리, 멀티 테넌트라면 고객 간 분리를 설계부터.
- **테스트**: 정상 사용(use case)뿐 아니라 악용 사례(misuse case)도.

---

## 마치며

취약점은 코드에만 있지 않다. 정상 기능을 정상적으로 써도 무너질 수 있고, 빠진 건 "누가 나쁘게 쓰면?"이라는 질문 하나였다.

수치로 보면 이름을 붙이고 위협 모델링이 퍼지자 발생률은 실제로 줄었다. 그래도 절대량은 늘고 있고, 2025년판에서는 설정과 공급망이 위로 올라왔다. 보안의 범위가 "내가 짠 코드"에서 "내가 설계하고 설정하고 가져다 쓴 모든 것"으로 넓어지고 있다.

앞으로 기능 명세를 쓸 때 위협 모델링 네 질문을 같이 적어 보려고 한다.

---

## 참고 자료

1. OWASP, [A06:2025 Insecure Design](https://top10.owasp.org/2025/A06_2025-Insecure_Design/)
2. OWASP, [A04:2021 Insecure Design (2021년판)](https://top10.owasp.org/2021/A04_2021-Insecure_Design/)
3. OWASP Cheat Sheet Series, [Secure Product Design Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secure_Product_Design_Cheat_Sheet.html)
4. OWASP SAMM, [Design: Secure Architecture](https://owaspsamm.org/model/design/secure-architecture/)
5. OWASP SAMM, [Design: Threat Assessment](https://owaspsamm.org/model/design/threat-assessment/stream-b/)
6. [Threat Modeling Manifesto](https://threatmodelingmanifesto.org/)
