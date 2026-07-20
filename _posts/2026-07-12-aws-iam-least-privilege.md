---
title: "AWS IAM 최소 권한 정책 설계 정리"
cat: "클라우드 보안"
tags: [AWS, IAM, Cloud Security]
summary: >
  와일드카드 권한을 걷어내고 리소스 단위로 정책을 좁혀가는 과정과, Access Analyzer로 검증한 결과를 정리했다.
---

운영 계정의 IAM 정책을 점검하다 Action: * 이 붙은 역할이 생각보다 많다는 것을 발견했다. 이번 글은 이를 최소 권한 원칙에 맞게 좁혀간 과정의 기록이다.

## 정책을 좁히는 순서

먼저 CloudTrail에서 최근 90일간 실제 호출된 API 목록을 뽑고, 그 목록만 허용하는 정책 초안을 만든다. 이후 Access Analyzer의 정책 생성 기능으로 교차 검증하면 누락을 줄일 수 있다.

```json
{
  "Effect": "Allow",
  "Action": ["s3:GetObject", "s3:PutObject"],
  "Resource": "arn:aws:s3:::app-logs/*"
}
```

결과적으로 역할 12개 중 9개에서 권한을 축소했고, 서비스 중단 없이 적용을 마쳤다. 다음에는 SCP로 조직 단위 가드레일을 두는 방법을 정리할 예정이다.
