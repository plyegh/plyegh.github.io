---
title: "논문 리뷰 - When AIOps Become \"AI Oops\""
date: 2026-11-09T12:00:00+09:00
tags: [Paper Review, USENIX Security, LLM Security, AIOps]
description: "LLM 기반 IT 운영 자동화(AIOps)를 텔레메트리 조작으로 무너뜨리는 공격과 방어(AIOpsDoom / AIOpsShield) 리뷰"
docs:
  - file: ai-oops-review.pdf
    title: "논문 리뷰 정리본"
  - file: ai-oops-slides.pdf
    title: "발표 자료"
---

## 논문 정보

- 제목: **When AIOps Become "AI Oops": Subverting LLM-driven IT Operations via Telemetry Manipulation**
- 학회: USENIX Security 2026
- 저자: Pasquini 외 · RSAC Labs, George Mason University
- 링크: [USENIX](https://www.usenix.org/conference/usenixsecurity26/presentation/pasquini) · [arXiv 2508.06394](https://arxiv.org/abs/2508.06394)

## 한 줄 요약

권한 없는 외부 공격자가 에러 로그에 "그럴듯한 원인과 해결책"을 남기면, 그 로그를 읽은 AIOps 에이전트가 스스로 악성 조치를 고른다.

- **90%**: AIOpsDoom의 평균 공격 성공률
- **0%**: 같은 경로에 기존 프롬프트 인젝션 문구를 넣었을 때의 성공률
- **100%**: PromptShields · Prompt-Guard2 탐지 우회율

자세한 내용은 위의 정리본과 발표 자료에 있다.
