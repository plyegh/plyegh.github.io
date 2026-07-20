---
title: "로컬 LLM 서빙 환경 구축 기록 (vLLM)"
cat: "LLM 구축"
tags: [LLM, vLLM, Infra]
summary: >
  단일 GPU 서버에 vLLM을 올리고, OpenAI 호환 API로 사내 도구에 연결하기까지의 시행착오.
---

외부 API 의존을 줄이기 위해 로컬 서빙 환경을 구성했다. 프레임워크는 처리량과 호환성을 기준으로 vLLM을 선택했다.

## 실행과 확인

```bash
python -m vllm.entrypoints.openai.api_server \
  --model Qwen2.5-7B-Instruct --max-model-len 8192
```

OpenAI 호환 엔드포인트라 기존 클라이언트 코드를 거의 그대로 재사용할 수 있었다. KV 캐시 메모리 한계로 max-model-len을 줄이는 조정이 필요했고, 이 부분은 별도 글로 정리한다.
