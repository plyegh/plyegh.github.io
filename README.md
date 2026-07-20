# 나만의 공부 블로그 (다크 전용 + 마크다운 글 관리)

기존 디자인을 유지하면서 다음 세 가지를 반영한 버전입니다.

1. **다크 모드 전용** — 라이트 테마와 토글 버튼 제거, 다크 팔레트로 고정
2. **마크다운 글 관리** — 글 하나 = `_posts/`의 md 파일 하나. Jekyll이 빌드할 때 `posts.json`으로 변환하고, 기존 디자인이 그걸 읽어 렌더링합니다
3. **utterances 댓글** (선택) — GitHub Issues 기반 댓글, 기본은 꺼져 있음

## 배포 방법 (GitHub Pages)

1. `plyegh.github.io` 이름으로 저장소를 만들고 이 폴더 내용을 루트에 올립니다.
2. Settings → Pages → Source: `Deploy from a branch`, `main` / `root`.
3. 몇 분 후 `https://plyegh.github.io` 에서 확인합니다.

**주의**: 이제 Jekyll 빌드가 필요하므로 index.html을 더블클릭해서 여는 방식으로는 글이 안 보입니다. 로컬 미리보기는 아래처럼 하세요.

```bash
bundle install
bundle exec jekyll serve   # http://localhost:4000
```

## 글 쓰는 법

`_posts/` 폴더에 `YYYY-MM-DD-제목.md` 파일을 만들면 끝입니다:

```markdown
---
title: "글 제목"
cat: "AWS"
tags: [AWS, VPC]
summary: >
  목록에 표시될 요약.
---

본문은 마크다운으로 자유롭게. 코드 블록, 이미지, 표, 인용 모두 지원됩니다.
```

- `cat` 값은 `script.js`의 `GROUPS`에 있는 서브카테고리 이름과 **정확히 일치**해야 합니다: 클라우드 보안, Openstack, AWS, NCP, GCP, LLM 구축, OWASP AI, Web, Rev, Pwn, Misc
- 날짜는 파일명에서 자동으로 읽습니다. 최신 글이 위로 옵니다.
- 새 카테고리를 추가하려면 `script.js`의 `GROUPS`에 이름을 추가하고, 글의 `cat`에 그 이름을 쓰면 됩니다.

## 댓글 켜는 법 (utterances)

1. https://github.com/apps/utterances 에서 앱을 `plyegh.github.io` 저장소에 설치
2. 저장소 Settings에서 Issues 기능이 켜져 있는지 확인
3. `script.js`의 `UTTERANCES.enabled`를 `true`로 변경

댓글은 글 제목 기준으로 저장소 이슈에 저장됩니다.

## 배포 전 수정할 것

- `script.js` 맨 위 `PROFILE`: 이메일(`mailto:`), 인스타그램 주소를 실제 값으로
- `assets/profile.png`: 프로필 사진 넣기

## 폴더 구조

```
_config.yml   - Jekyll 설정
_posts/       - 글 (마크다운) ← 글은 여기서만 관리
posts.json    - Jekyll이 _posts를 JSON으로 변환하는 템플릿 (수정할 일 없음)
index.html    - 페이지 뼈대
style.css     - 디자인 (다크 전용, 색상은 CSS 변수)
script.js     - 프로필/카테고리 설정 + 렌더링 로직
Gemfile       - 로컬 미리보기용
LICENSE       - 코드 MIT + 콘텐츠 저작권 표기
assets/       - 이미지
```

## 라이선스

코드는 [MIT License](LICENSE), 글과 이미지는 저작권 보호 대상입니다. 자세한 내용은 `LICENSE` 파일을 참고하세요.
