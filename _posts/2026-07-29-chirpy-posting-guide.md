---
title: Chirpy 포스트 작성법 정리
date: 2026-07-29 12:00:00 +0900
categories: [Blog, Jekyll]
tags: [chirpy, jekyll, markdown]
description: Chirpy 테마에서 포스트를 작성할 때 쓰는 front matter와 마크다운 문법 정리.
---

## 파일 규칙

- 위치: 루트의 `_posts/`
- 이름: `YYYY-MM-DD-제목.md` (확장자는 `md` 또는 `markdown`만 가능)
- 예: `_posts/2026-07-29-buffer-overflow-basic.md`
- 초안은 `_drafts/`에 두면 배포되지 않음 (날짜 접두사 불필요)

---

## Front Matter

```yaml
---
title: 포스트 제목
date: 2026-07-29 14:30:00 +0900
categories: [Security, Reversing]
tags: [ghidra, x86]
---
```

| 항목 | 설명 |
|---|---|
| `title` | 제목 (필수) |
| `date` | `YYYY-MM-DD HH:MM:SS +0900` — 타임존 꼭 붙일 것 |
| `categories` | **최대 2단계** `[상위, 하위]` |
| `tags` | 개수 제한 없음, **소문자로 통일** |
| `description` | 목록/SEO에 쓰이는 요약. 없으면 본문 앞부분 자동 사용 |
| `pin: true` | 홈 상단 고정 |
| `math: true` | 수식 활성화 (성능 때문에 기본 off) |
| `mermaid: true` | 다이어그램 활성화 (기본 off) |
| `toc: false` | 우측 목차 끄기 (기본 on) |
| `comments: false` | 이 글만 댓글 끄기 |
| `media_subpath` | 이미지 경로 접두사. 예: `/assets/img/posts/` |
| `image` | 상단 프리뷰 이미지 |

`layout`은 자동으로 `post`라 적을 필요 없음.

상단 이미지:

```yaml
image:
  path: /assets/img/cover.png
  alt: 대체 텍스트
```

---

## 코드 블록

파일명 라벨을 붙일 수 있음:

````markdown
```python
print("hello")
```
{: file="app/main.py" }
````

Chirpy가 지원하는 언어 하이라이팅은 Rouge 기준. `bash`, `python`, `c`, `asm`, `yaml`, `json`, `nginx` 등 대부분 됨.

파일 경로를 인라인으로 강조할 때:

```markdown
`_config.yml`{: .filepath}
```

---

## 이미지

```markdown
![설명](/path/image.png){: w="700" h="400" }
_이미지 아래 캡션_
```

- 이미지 바로 다음 줄에 이탤릭을 쓰면 캡션이 됨
- `w` / `h`를 지정해야 로딩 중 레이아웃이 밀리지 않음

부가 클래스:

| 클래스 | 효과 |
|---|---|
| `{: .shadow }` | 그림자 |
| `{: .normal }` | 왼쪽 정렬 (기본은 가운데) |
| `{: .left }` / `{: .right }` | 텍스트 감싸는 정렬 |
| `{: .light }` / `{: .dark }` | 해당 모드에서만 표시 |

여러 개 동시 적용: `{: .shadow w="700" }`

---

## 프롬프트 박스

```markdown
> 참고할 내용
{: .prompt-info }
```

타입: `prompt-tip`, `prompt-info`, `prompt-warning`, `prompt-danger`

---

## 수식

front matter에 `math: true` 추가 후:

```markdown
인라인은 $$ E = mc^2 $$ 처럼 한 줄 안에.

블록은 줄을 띄워서:

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$
```

---

## Mermaid 다이어그램

front matter에 `mermaid: true` 추가 후, ` ```mermaid ` 코드펜스 안에 작성:

````markdown
```mermaid
graph LR
  A[클라이언트] --> B[WAF]
  B --> C[웹서버]
```
````

---

## 기타 문법

```markdown
- [ ] 체크박스 (미완료)
- [x] 체크박스 (완료)

각주를 답니다[^note]

[^note]: 각주 내용

용어
: 설명 목록 형태

~~취소선~~
```

---

## 로컬 미리보기

```bash
bundle
bundle exec jekyll serve
# http://127.0.0.1:4000
```

`_config.yml`을 수정했을 때는 서버를 재시작해야 반영됨.
