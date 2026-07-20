# 나만의 공부 블로그 (Jekyll 커스텀 테마)

디자인은 자체 제작한 다크 테마를 쓰고, 기능은 YAT 기반 블로그(Nekonic.github.io)와 동일하게 Jekyll 표준 방식으로 구현한 버전입니다. 외부 테마 의존성은 없습니다.

## 기능

- 글마다 개별 URL(`/posts/연/월/일/제목/`) — 링크 공유, 검색엔진 수집 가능
- 홈 글 목록 + 페이지네이션 (jekyll-paginate)
- **Archives** — 연도별 전체 글 목록
- **Categories** — 그룹(클라우드/AI & Sec/Hacking) 구조 그대로, 사이드바 카테고리 클릭 시 해당 위치로 이동
- **Tags** — 태그 클라우드 + 태그별 글 목록, 글의 태그 클릭 시 이동
- RSS 피드(`/feed.xml`), SEO 메타태그, 사이트맵(`/sitemap.xml`), 404 페이지
- utterances 댓글 (GitHub Issues 기반, 기본 꺼짐)
- Google Analytics (측정 ID 넣으면 활성화)
- 글에서 수식($...$ MathJax)과 mermaid 다이어그램 코드블록 지원
- `/admin/` — 블로그 안에서 글 작성/수정/삭제 (GitHub API, 푸터의 '관리' 링크)

## 배포 방법 (GitHub Pages)

1. `plyegh.github.io` 이름으로 저장소를 만들고 이 폴더 내용을 루트에 올립니다.
2. Settings → Pages → Source: `Deploy from a branch`, `main` / `root`.
3. 몇 분 후 `https://plyegh.github.io` 에서 확인합니다.

사용하는 플러그인(feed, seo-tag, sitemap, paginate)은 전부 GitHub Pages 기본 지원이라 별도 빌드 설정이 필요 없습니다.

로컬 미리보기:

```bash
bundle install
bundle exec jekyll serve   # http://localhost:4000
```

## 글 쓰는 법

`_posts/YYYY-MM-DD-제목.md` 파일을 만들면 됩니다. `/admin/` 페이지에서 작성해도 되고요.

```markdown
---
title: "글 제목"
categories: ["AWS"]
tags: [AWS, VPC]
summary: "목록에 표시될 요약"
---

본문 마크다운. 코드 블록, 이미지, 표, $E=mc^2$ 수식,
```mermaid 코드블록으로 다이어그램도 그릴 수 있습니다.
```

- `categories`에는 값 하나만 넣고, `_data/groups.yml`의 서브카테고리 이름과 정확히 일치해야 합니다: 클라우드 보안, Openstack, AWS, NCP, GCP, LLM 구축, OWASP AI, Web, Rev, Pwn, Misc
- 새 카테고리는 `_data/groups.yml`에 추가하면 사이드바와 Categories 페이지에 자동 반영됩니다.

## 배포 전 수정할 것 (`_config.yml`)

- `profile.email`, `profile.instagram` → 실제 값으로
- `assets/profile.png` 에 프로필 사진 넣기
- 댓글을 켜려면: utterances 앱(https://github.com/apps/utterances)을 저장소에 설치 후 `utterances.enabled: true`
- 방문자 통계를 원하면: GA4 측정 ID를 `google_analytics`에 입력

## 관리자 페이지 (/admin/)

푸터의 '관리' 링크. GitHub fine-grained 토큰(대상: 이 저장소만, 권한: Contents Read/write)으로 로그인하면 글 작성·수정·삭제가 가능합니다. 토큰은 탭 세션에만 저장되고 탭을 닫으면 사라집니다. classic token은 쓰지 마세요. 커밋 후 재빌드까지 1~2분 걸립니다.

## 폴더 구조

```
_config.yml        - 사이트/프로필/댓글/GA 설정
_data/groups.yml   - 사이드바 카테고리 그룹 구조
_layouts/          - default(공통 뼈대) / post(글) / page(일반 페이지)
_includes/         - 사이드바, 글 목록 아이템, 아이콘
_posts/            - 글 (마크다운)
index.html         - 홈 (페이지네이션)
archives.html      - 연도별 목록
categories.html    - 카테고리별 목록
tags.html          - 태그별 목록
about.md           - 소개
404.html           - 404
admin.html         - 관리자 페이지
assets/css/        - 다크 테마 스타일
assets/js/         - 관리자 기능
```

## 라이선스

코드는 [MIT License](LICENSE), 글과 이미지는 저작권 보호 대상입니다. 자세한 내용은 `LICENSE` 파일을 참고하세요.
