---
title: 교육 보드 편집용 원본 — Copilot · Graph (분할본, E0 값만)
source: 교육보드 편집원본 v2에서 분할 (2026-11-18). 각 L2의 L3는 아직 [작성 필요]
---

> 규칙은 `교육보드 편집원본 — 01 Entra Admin Center.md`의 '보드 규격' 절과 같습니다. 이 파일은 아직 세부 시나리오가 없는 E0(설정/강제/증적) 값만 담습니다.

# L1 · 06 · Copilot · Graph — 하나의 답에 걸리는 모든 통제

## L2 · 사용자 접근 — 누가 · 어떤 기기로 쓰는가

- 설정(Control Plane): Copilot 라이선스 할당 | CA · 앱 보호 정책
- 강제(Enforcement): Entra ID 토큰 발급 | Intune 준수 · MAM 앱
- 증적(Evidence): Sign-in log | 라이선스 할당 상태

### L3: [작성 필요]

## L2 · 그라운딩 — Graph · Semantic Index

- 설정(Control Plane): SharePoint · OneDrive 권한 | 공유 링크 · 사이트 멤버십
- 강제(Enforcement): Graph 권한 트리밍 | 사용자 보안 컨텍스트
- 증적(Evidence): 감사: CopilotInteraction | AccessedResources

### L3: [작성 필요]

## L2 · 레이블 · EXTRACT — 암호화 문서 처리

- 설정(Control Plane): 레이블 사용 권한 | DLP: 레이블 항목 제외 (E5 계열)
- 강제(Enforcement): 사용 권한 확인 | EXTRACT 없으면 링크만
- 증적(Evidence): CopilotInteraction 레이블 정보 | DLP 경고

### L3: [작성 필요]

## L2 · 웹 그라운딩 — 외부 웹 검색 사용 여부

- 설정(Control Plane): Copilot 웹 검색 정책 | DLP: 민감 프롬프트 웹 검색 차단
- 강제(Enforcement): Copilot → 웹 검색 서비스 | (생성된 검색 쿼리)
- 증적(Evidence): DLP 경고 | 감사: CopilotInteraction

### L3: [작성 필요]

## L2 · Copilot 커넥터 — 타사 데이터 · 같은 권한 규칙

- 설정(Control Plane): 커넥터 연결 · ACL 매핑 | '모두에게 표시' 주의
- 강제(Enforcement): Graph 인덱스 (외부 항목 ACL) | 원본 권한 그대로 트리밍
- 증적(Evidence): GET /v1.0/external/connections | 커넥터 상태 · 크롤 기록

### L3: [작성 필요]

## L2 · 과다 공유 정리 (SAM) — Copilot 도입 전 위생

- 설정(Control Plane): 데이터 접근 거버넌스 보고서 | RCD · 제한된 액세스 제어
- 강제(Enforcement): SharePoint · 검색 인덱스 | Copilot · 조직 검색에서 숨김
- 증적(Evidence): DAG 보고서 | Get-SPOSite: RestrictContentOrgWideSearch

### L3: [작성 필요]

## L2 · 안전 시스템 — 유해 · 보호 자료 · 프롬프트 인젝션

- 설정(Control Plane): Microsoft 운영 (기본 동작) | MDO P2: 메일 속 인젝션 탐지
- 강제(Enforcement): 프롬프트 · 응답 검사 | 실행 시점 차단
- 증적(Evidence): 탈옥 신호 → Defender 포털 | Purview 감사

### L3: [작성 필요]

## L2 · 에이전트 — Copilot Studio · Agent ID

- 설정(Control Plane): Power Platform 관리 | Entra Agent ID · Agent 365
- 강제(Enforcement): 에이전트 런타임 | Defender 실시간 보호 (Preview)
- 증적(Evidence): 감사 · Defender 인시던트 | Agent 엔터티

### L3: [작성 필요]

## L2 · 보존 · eDiscovery — Copilot 대화 증적

- 설정(Control Plane): DLM 보존 정책 | (Copilot · AI 상호작용 위치)
- 강제(Enforcement): 사서함 숨김 폴더에 보관 | 보존 · 삭제 집행
- 증적(Evidence): eDiscovery 검색 | 감사: CopilotInteraction

### L3: [작성 필요]
