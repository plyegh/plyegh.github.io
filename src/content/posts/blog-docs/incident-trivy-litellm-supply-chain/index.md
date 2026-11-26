---
title: "[보안 사고 분석 1] 보안 스캐너가 공격 도구가 된 날 - Trivy → LiteLLM 연쇄 공급망 공격"
date: 2026-11-26T20:00:00+09:00
tags: [Incident Analysis, Supply Chain, CI/CD, GitHub Actions, Cloud Security, LLM Security, TeamPCP]
series: "최신 보안 사고 분석"
description: "pull_request_target 설정 실수 하나와 불완전한 자격증명 교체가 보안 스캐너 Trivy를 거쳐 AI 게이트웨이 LiteLLM까지 번진 2026년 3월 공급망 공격 분석"
---

## 0. 시리즈 소개

HSPACE Knights Frontier 미션으로 **최근 1년 안에 일어난 보안 사고**를 골라, 사고마다 근본 원인, 대응, 보완이 미흡했던 부분을 정리한다. 관심 분야가 클라우드와 LLM 보안이라 그쪽 사고 세 건을 골랐다.

1. **Trivy → LiteLLM 연쇄 공급망 공격** (이 글): CI/CD와 클라우드 자격증명, LLM 인프라
2. **McKinsey Lilli 침해**: LLM 애플리케이션 계층
3. **OpenAI 모델의 Hugging Face 침해**: 자율 AI 에이전트와 평가 환경 격리

> [!NOTE]
> 공개 자료(벤더 어드바이저리, 사고 보고서, 보안 업체 분석)를 바탕으로 정리했다. 자료마다 시각이나 수치가 조금씩 다른 부분은 본문에 따로 적었다.

---

## 1. 사건 선정 이유

Trivy는 컨테이너 이미지, IaC, 쿠버네티스 설정을 검사하는 오픈소스 보안 스캐너다. 클라우드 보안을 공부하면서 CSPM이나 파이프라인을 만들 때 가장 먼저 붙이는 도구 중 하나다.

이 사고는 **보안을 위해 넣은 도구가 오히려 파이프라인 안에서 자격증명을 훔치는 통로**가 됐다는 점에서 골랐다. 그리고 그 피해가 LLM API 키를 한곳에 모아 두는 AI 게이트웨이(LiteLLM)까지 이어졌다. 클라우드와 LLM이 공급망으로 연결돼 있다는 걸 한 사건 안에서 볼 수 있다.

---

## 2. 사건 개요

| 항목 | 내용 |
|---|---|
| 기간 | 2026.02.27 최초 침투 → 03.19 본 공격 → 03.24 LiteLLM 오염 |
| 공격 주체 | TeamPCP (최초 침투는 `hackerbot-claw` 계정, 두 주체의 관계는 미확정) |
| 피해 대상 | Trivy 바이너리 v0.69.4, `trivy-action`, `setup-trivy`, Docker Hub 이미지, LiteLLM 1.82.7 / 1.82.8 (PyPI) 등 |
| 탈취 대상 | CI/CD 시크릿, AWS·GCP·Azure 자격증명, SSH 키, Kubernetes 토큰, Docker 설정, 패키지 배포 토큰 |
| 식별 번호 | CVE-2026-33634 (CVSS 4.0 9.4), GHSA-69fq-xp46-6x23 |
| 성격 | 취약점(버그)이 아니라 **설정 실수 + 자격증명 관리 실패**로 생긴 공급망 공격 |

---

## 3. 타임라인

| 시점 (UTC) | 사건 |
|---|---|
| 2025.10 | Trivy 저장소에 위험한 `pull_request_target` 워크플로("API Diff Check")가 들어감 |
| 2025.11.29 | 오픈소스 정적 분석 도구(poutine)가 이 워크플로를 위험하다고 표시. 3개월 넘게 그대로 남음 |
| 2026.02.20 | `hackerbot-claw` 계정 생성, 이후 공개 저장소의 Actions 설정을 자동으로 훑기 시작 |
| 2026.02.27~28 | PR을 열었다 닫는 방식으로 워크플로를 실행시켜 `aqua-bot` 서비스 계정의 조직 범위 PAT 탈취 |
| 2026.03.01 | Aqua가 1차 사고를 공개하고 자격증명 교체. 하지만 **한 번에(원자적으로) 폐기하지 않음** |
| 2026.03.03~04 | Trivy / trivy-action에 GitHub Immutable Releases 활성화 |
| 2026.03.19 17:43~ | 남아 있던 자격증명으로 악성 v0.69.4 배포, `trivy-action` 태그 77개 중 76개, `setup-trivy` 태그 7개 전부 force-push |
| 2026.03.19~20 | Aqua가 악성 아티팩트를 걷어내고 안전 버전·IoC 공개 |
| 2026.03.22~23 | 탈취한 자격증명으로 Docker Hub에 악성 v0.69.5 / v0.69.6 이미지 추가 게시 |
| 2026.03.23 | 같은 그룹이 Checkmarx KICS GitHub Action도 오염 |
| 2026.03.24 10:39~ | 탈취한 PyPI 토큰으로 LiteLLM 1.82.7 / 1.82.8을 CI를 거치지 않고 직접 업로드, 수 시간 안에 PyPI가 격리 |
| 2026.03.27 | 같은 수법으로 Telnyx Python SDK도 오염 |
| 2026.03.30 | LiteLLM이 새로 만든 CI/CD v2로 깨끗한 v1.83.0 배포 |

> [!NOTE]
> LiteLLM 악성 버전이 PyPI에 떠 있던 시간은 자료마다 약 40분에서 3시간까지 차이가 난다. 업로드 시각(10:39 UTC)은 대부분 일치한다.

---

## 4. 공격 흐름 분석

### 4.1. 1단계 - Pwn Request로 PAT 탈취

GitHub Actions에서 외부 PR에 반응하는 트리거는 두 가지다.

| 트리거 | 실행 컨텍스트 | 시크릿 접근 |
|---|---|---|
| `pull_request` | 포크(fork) 쪽 | 없음 (읽기 전용 토큰) |
| `pull_request_target` | 원본(base) 저장소 쪽 | **있음** |

`pull_request_target`은 원래 "PR에 라벨 붙이기"처럼 **포크 코드를 실행하지 않는** 작업용이다. 그런데 이 트리거에서 PR 작성자의 코드를 체크아웃해 실행하면, 외부인이 만든 코드가 원본 저장소의 시크릿을 들고 돌게 된다. 이게 흔히 말하는 **Pwn Request** 패턴이다.

```yaml
# 위험한 패턴 (개념 예시)
on:
  pull_request_target:          # 원본 저장소 권한으로 실행
jobs:
  diff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}   # 공격자 코드를 가져옴
      - run: make api-diff                                  # 공격자 코드가 시크릿과 함께 실행됨
```

공격 계정은 PR을 열자마자 닫았지만, 트리거는 이미 실행된 뒤였다. 빌드 단계에서 외부 스크립트를 받아 실행했고, 그 안에서 `aqua-bot` 서비스 계정의 **조직 범위 PAT**를 빼냈다. 이 토큰은 Aqua 조직 안의 워크플로 30여 개에서 같이 쓰던 토큰이었다. 토큰 하나가 조직 전체의 열쇠였던 셈이다.

### 4.2. 2단계 - 불완전한 교체, 그리고 재침해

3월 1일 Aqua는 사고를 공개하고 자격증명을 교체했다. 문제는 교체가 **원자적이지 않았다**는 점이다. 여러 토큰을 순차적으로 바꾸는 사이에 공격자가 새로 발급된 토큰까지 손에 넣었다. Aqua 스스로도 1차 대응이 불완전했다고 인정했다.

3월 19일 공격자는 이 권한으로 다음을 동시에 했다.

- 릴리스 자동화를 돌려 **악성 Trivy v0.69.4**를 공식 배포 채널(GitHub Releases, 컨테이너 레지스트리)에 게시
- `trivy-action`의 기존 버전 태그 77개 중 **76개를 악성 커밋으로 force-push**
- `setup-trivy`의 태그 7개 전부 교체
- 정상 메인테이너를 사칭한 커밋 생성

여기서 중요한 건 **태그는 움직일 수 있는 포인터**라는 점이다. `uses: aquasecurity/trivy-action@0.28.0`처럼 태그로 참조하던 수많은 파이프라인이 코드 한 줄 바꾸지 않았는데도 다음 실행부터 악성 코드를 돌렸다.

### 4.3. 3단계 - 러너 안에서 자격증명 수확

악성 액션과 바이너리는 겉으로는 정상 스캔을 하면서 뒤에서 다음을 긁어 갔다.

- GitHub Actions 러너 프로세스 메모리에 올라간 시크릿
- `~/.aws/credentials`, gcloud 기본 자격증명, `~/.azure/`, `~/.kube/config`
- SSH 키, Docker 설정, `.env`, DB 접속 설정 등

수집한 데이터는 암호화해서 Aqua 이름을 흉내 낸 타이포스쿼팅 도메인으로 보냈다. 스캐너는 원래 파이프라인에서 **넓은 읽기 권한**으로 도는 도구라 이상 행동이 눈에 덜 띈다.

### 4.4. 4단계 - LiteLLM으로 번짐

LiteLLM은 OpenAI, Anthropic, Google 등 100개가 넘는 LLM 제공자의 API를 하나로 묶어 주는 Python 라이브러리이자 프록시다. CrewAI, DSPy 같은 에이전트 프레임워크도 이걸 기반으로 쓴다.

LiteLLM의 CI는 보안 스캔 단계에서 Trivy를 **버전 고정 없이** 실행하고 있었다. 그래서 오염된 Trivy가 러너 환경에 있던 PyPI 배포 토큰을 가져갔다. 공격자는 이 토큰으로 **LiteLLM의 CI/CD를 아예 거치지 않고** PyPI에 1.82.7, 1.82.8을 직접 올렸다. GitHub에는 대응하는 태그나 릴리스가 없었다.

> [!NOTE]
> LiteLLM 공식 발표는 "Trivy 사고에서 탈취된 자격증명이 쓰였을 가능성"이라고 적었다. 한편 SANS ISC는 공동 창업자 개인 GitHub 계정 탈취를 경로로 보고했다. 이 글에서는 두 설명을 모두 남겨 둔다.

악성 버전은 설치되면 자격증명을 수집하고, 쿠버네티스 클러스터로 측면 이동을 시도하고, systemd 서비스로 백도어를 남겼다. 그래서 **패키지를 지워도 감염은 남는다**. LiteLLM 프록시는 구조상 여러 LLM 제공자의 API 키를 한곳에 모아 두기 때문에, 한 번 뚫리면 조직의 LLM 키 전체가 위험해진다.

```text
[외부 PR] ─pull_request_target─▶ [Trivy CI] ─PAT 탈취─▶ [aqua-bot 조직 토큰]
                                                            │ (불완전한 교체로 유지)
                                                            ▼
[trivy-action 태그 76개 / v0.69.4 / Docker 이미지 오염] ─▶ [이를 쓰는 수천 개 파이프라인]
                                                            │
                                      ┌─────────────────────┼──────────────────────┐
                                      ▼                     ▼                      ▼
                              클라우드·K8s 자격증명     Checkmarx KICS      LiteLLM PyPI 토큰
                                                                                   ▼
                                                              LiteLLM 1.82.7/1.82.8 (AI 게이트웨이)
```

---

## 5. 근본 원인

### 5.1. 기술적 원인

1. **신뢰할 수 없는 코드를 시크릿과 같은 컨텍스트에서 실행**: `pull_request_target` + 포크 코드 체크아웃
2. **과도한 권한의 장기 토큰**: 조직 전체에 쓰기 권한이 있는 PAT 하나를 수십 개 워크플로가 공유
3. **변경 가능한 참조(tag)에 대한 신뢰**: 배포하는 쪽은 태그를 보호하지 않았고, 사용하는 쪽은 태그로 참조
4. **장기 배포 자격증명**: PyPI 업로드 토큰이 CI 환경 변수에 늘 들어 있었음
5. **스캐너에 과도한 접근 범위**: 보안 스캔 단계가 배포 시크릿과 같은 러너·같은 job에서 실행됨

### 5.2. 관리적 원인

- **경고를 받고도 3개월 넘게 방치**: 위험한 워크플로는 2025년 11월 말 도구로 탐지됐지만 수정되지 않았다.
- **사고 대응에서 봉쇄(containment)를 마무리하지 못함**: 토큰을 하나씩 순차 교체하는 동안 공격자가 접근을 유지했다. 2차 침해가 1차보다 훨씬 컸다.

---

## 6. 대응

### 6.1. Aqua Security (Trivy)

- 악성 바이너리·태그·이미지 제거, 마지막 정상 버전(v0.69.3, trivy-action 0.35.0) 안내
- GHSA·CVE 발행과 IoC, 검증 방법(sigstore 서명 확인) 공개
- 외부 사고 대응 업체(Sygnia)와 포렌식 진행
- 오픈소스 저장소와 자동화 전반의 보안 조치 추가

여기서 눈에 띄는 대목이 있다. **Immutable Releases를 켜 둔 뒤에 나온 버전(v0.69.3, 0.35.0)만 살아남았다**는 점이다. 3월 초 1차 사고 직후 켠 설정이 2차 공격에서 실제로 효과를 냈다.

### 6.2. LiteLLM

- 악성 패키지 제거, 메인테이너 자격증명 교체, Mandiant와 포렌식 진행
- 감사한 버전별 SHA-256 체크섬 공개
- **CI/CD v2**로 재구축
  - 단위 테스트 / 통합 테스트 / 보안 스캔 / 릴리스 게시를 **각각 격리된 환경**에서 실행
  - 검증 저장소와 릴리스 저장소 분리
  - 장기 PyPI 토큰 대신 **Trusted Publishing**(OIDC 기반 단기 토큰)
  - 컨테이너 이미지 cosign 서명, 릴리스 태그 불변화, 모든 GitHub Action 버전 고정

### 6.3. 사용자 측 권고

- 해당 기간에 오염된 버전을 실행한 러너·호스트는 **전부 침해된 것으로 간주**
- 그 환경에 있던 모든 시크릿(클라우드 키, SSH 키, K8s 토큰, LLM API 키)을 교체
- Docker 소켓을 마운트한 채 오염 이미지를 돌렸다면 호스트 전체를 침해된 것으로 간주
- GitHub 조직에 `tpcp-docs` 같은 낯선 저장소가 생겼는지 확인

---

## 7. 보완이 미흡했던 부분

### 7.1. "교체했다"와 "봉쇄했다"는 다르다

1차 사고에서 Aqua는 교체를 했지만 공격자를 내보내지 못했다. 토큰을 순차적으로 바꾸면, 아직 바꾸지 않은 권한으로 새 토큰을 다시 얻을 수 있다. 제대로 하려면 다음 순서가 필요했다.

1. 공격자가 쓸 수 있는 모든 경로(PAT, 서비스 계정, 배포 키)를 먼저 목록화
2. **동시에** 폐기
3. 공격자가 심어 둔 지속성(워크플로, 앱, 새 저장소)을 제거
4. 그 뒤에 새 자격증명 발급

### 7.2. 경고가 있었는데 고치지 않았다

정적 분석 도구가 이미 위험 패턴을 잡아냈다. 탐지는 됐는데 **분류(triage)와 수정 프로세스**가 없었다. 보안 도구를 만드는 회사의 저장소에서 이런 일이 생겼다는 게 더 아프다.

### 7.3. LiteLLM의 "강화 이후"도 완벽하지 않았다

LiteLLM은 3월 이후 업계 권고안을 거의 다 적용했다. 그런데 **2026년 10월 21일 두 번째 공급망 사고**가 났다.

- 5월에 내부 에이전트 플랫폼의 마스터 키가 공개 저장소에 커밋됐다가 지워졌지만 **폐기되지 않았다**.
- 10월 10일 공격자가 그 키로 GitHub 조직 소유자 권한의 OAuth 토큰을 얻었다.
- 릴리스 워크플로를 오염된 포크로 돌려서, **정상 파이프라인이 직접 서명하고 Trusted Publishing으로 게시한** 악성 1.107.0이 나갔다.

3월 사고 때 악성 패키지는 "서명이 없고 파이프라인 밖에서 올라온 것"이라 구분할 수 있었다. 10월 사고의 패키지는 **서명도, 출처 증명도 정상**이었다. Trusted Publishing과 서명은 "우리 파이프라인에서 나왔다"는 것까지만 증명한다. **파이프라인 자체가 넘어가면 아무것도 막지 못한다**는 걸 보여 준 사례다. 3월 교훈("장기 토큰을 없애자")은 지켰지만, 같은 교훈의 다른 얼굴("노출된 키는 즉시 폐기하자")은 놓쳤다.

### 7.4. 생태계 차원의 공백

- provenance 검증은 아직 **선택(opt-in)**이라, 레지스트리가 서명 없는 업로드를 막지 않는다.
- GitHub Actions 태그는 기본적으로 움직일 수 있고, Immutable Releases는 직접 켜야 한다.
- 대부분의 소비자는 여전히 액션을 태그로 참조한다.

---

## 8. 정리 - CSPM을 만들 때 무엇을 봐야 할까

동아리에서 APS-Cloud(OpenStack)용 CSPM을 만들고 있어서, 이 사고를 CSPM 관점에서 다시 읽어 봤다. 두 가지가 보였다. 하나는 **CSPM이 무엇을 점검해야 하는가**이고, 다른 하나는 **CSPM 자체가 Trivy처럼 공격 통로가 될 수 있다**는 점이다.

먼저 점검 대상부터 보면, 이번 사고의 출발점은 취약점이 아니라 **오래 살아 있고 범위가 넓은 자격증명**이었다. 그래서 CSPM은 설정 값만 보는 데서 끝나지 않고 자격증명의 수명과 범위를 같이 봐야 한다. OpenStack이라면 Keystone 애플리케이션 자격증명에 만료일이 걸려 있는지, `admin` 역할을 받은 서비스 계정이 실제로 그 권한이 필요한지, 한동안 쓰이지 않은 자격증명이 그대로 남아 있지 않은지를 확인해야 한다. aqua-bot 토큰처럼 **하나의 계정이 여러 프로젝트에 걸쳐 쓰기 권한을 갖고 있는 경우**는 따로 경고를 띄울 만하다. 사고가 났을 때 "무엇을 폐기해야 하는가"를 바로 뽑을 수 있도록, 자격증명과 그 자격증명이 접근할 수 있는 자원의 목록을 평소에 만들어 두는 것도 CSPM이 할 수 있는 일이다.

인프라를 만드는 파이프라인도 점검 범위에 넣어야 한다. 우리 CSPM은 kolla-ansible 기반 배포 스크립트를 GitHub 저장소로 관리하고 있어서, 여기에 GitHub Actions 같은 자동화를 붙인다면 워크플로가 외부 PR에 `pull_request_target`으로 반응하지 않는지, job마다 `permissions`를 최소로 지정했는지, 서드파티 액션을 태그가 아니라 커밋 SHA로 고정했는지를 확인해야 한다. 특히 `clouds.yaml`이나 OpenStack 관리자 자격증명이 러너의 환경 변수나 파일로 남아 있지 않은지가 중요하다. Trivy 사고의 악성코드가 가장 먼저 뒤진 곳이 바로 러너의 자격증명 파일이었다.

다음은 CSPM 자신의 안전이다. CSPM은 구조상 클라우드 전체를 읽을 수 있는 계정을 들고 있고, 그 안에서 Trivy 같은 스캐너를 돌린다. 이번 사고처럼 스캐너가 오염되면 CSPM이 가진 자격증명이 그대로 넘어간다. 그래서 CSPM이 쓰는 계정은 **읽기 전용 역할(`reader`)과 짧은 만료 기간**을 기본으로 하고, 조치(remediation) 기능이 필요하면 쓰기 권한을 가진 별도 계정과 별도 실행 환경으로 분리하는 게 맞다고 생각한다. CSPM 안에서 돌리는 스캐너는 버전과 이미지 다이제스트를 고정하고 서명을 검증해야 한다. 스캐너가 도는 환경은 결과를 보내는 곳 말고는 외부 통신을 막아 두면, 오염된 스캐너가 자격증명을 빼내는 길도 함께 막힌다.

마지막으로, 문제가 생겼을 때의 절차도 미리 정해 둘 필요가 있다. Aqua의 실수는 토큰을 바꿨지만 공격자를 내보내지 못한 것이었다. 우리도 CSPM이나 배포 파이프라인의 자격증명이 노출됐다면, 관련 자격증명을 먼저 전부 목록화하고, 한 번에 폐기하고, 공격자가 심어 둔 워크플로나 계정을 정리한 뒤에 새로 발급하는 순서를 문서로 남겨 두려고 한다. 실수로 커밋한 키도 커밋을 지우는 걸로 끝내지 않고 반드시 폐기해야 한다는 건, LiteLLM의 10월 사고가 보여 준 교훈이다.

클라우드 보안은 결국 **누가 어떤 자격증명을 얼마나 오래 들고 있는가**의 문제라는 걸 다시 확인했다. 이번 사건에서 공격자는 취약점을 하나도 쓰지 않고, 설정 실수와 남아 있던 토큰만으로 보안 스캐너와 AI 게이트웨이를 차례로 넘어갔다.

---

## 참고 자료

- [GHSA-69fq-xp46-6x23 - Trivy 보안 어드바이저리 (GitHub)](https://github.com/aquasecurity/trivy/security/advisories/GHSA-69fq-xp46-6x23)
- [Trivy supply chain attack: what you need to know (Aqua Security)](https://www.aquasec.com/blog/trivy-supply-chain-attack-what-you-need-to-know)
- [Trivy supply chain compromise: What Docker Hub users should know (Docker)](https://www.docker.com/blog/trivy-supply-chain-compromise-what-docker-hub-users-should-know/)
- [Detecting, investigating and defending against the Trivy supply chain compromise (Microsoft)](https://microsoft.com/en-us/security/blog/2026/03/24/detecting-investigating-defending-against-trivy-supply-chain-compromise)
- [Trivy GitHub Actions Supply Chain Compromise (Snyk)](https://snyk.io/articles/trivy-github-actions-supply-chain-compromise/)
- [hackerbot-claw GitHub Actions exploitation (StepSecurity)](https://www.stepsecurity.io/blog/hackerbot-claw-github-actions-exploitation)
- [Don't become the next Trivy (Eclipse Foundation)](https://blogs.eclipse.org/post/mika%C3%ABl-barbero/dont-become-next-trivy-how-make-your-releases-tags-and-automation-resistant)
- [Security Update: Suspected Supply Chain Incident (LiteLLM)](https://docs.litellm.ai/blog/security-update-march-2026)
- [Security Townhall Updates (LiteLLM)](https://docs.litellm.ai/blog/security-townhall-updates)
- [What we are changing after October 21 (LiteLLM)](https://docs.litellm.ai/blog/security-changes-after-oct-21-2026)
- [TeamPCP Supply Chain Campaign: Update 002 (SANS ISC)](https://isc.sans.edu/diary/32838)
- [How a Poisoned Security Scanner Became the Key to Backdooring LiteLLM (Snyk)](https://snyk.io/articles/poisoned-security-scanner-backdooring-litellm)
