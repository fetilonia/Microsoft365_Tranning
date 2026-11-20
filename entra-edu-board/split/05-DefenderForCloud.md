---
title: 교육 보드 편집용 원본 — Defender for Cloud (분할본, E0 값만)
source: 교육보드 편집원본 v2에서 분할 (2026-11-18). 각 L2의 L3는 아직 [작성 필요]
---

> 규칙은 `교육보드 편집원본 — 01 Entra Admin Center.md`의 '보드 규격' 절과 같습니다. 이 파일은 아직 세부 시나리오가 없는 E0(설정/강제/증적) 값만 담습니다.

# L1 · 05 · Defender for Cloud — 클라우드 보호평면

## L2 · 환경 연결 — Azure · AWS · GCP · DevOps

- 설정(Control Plane): 구독 · 멀티클라우드 커넥터 | GitHub · Azure DevOps · GitLab
- 강제(Enforcement): 커넥터 (API 기반 자산 수집) | Arc: 온프레미스 서버
- 증적(Evidence): 자산 인벤토리 | Azure Resource Graph

### L3: [작성 필요]

## L2 · Foundational CSPM — 무료 · 보안 점수

- 설정(Control Plane): MCSB 표준 (Azure Policy) | 규정 표준 추가
- 강제(Enforcement): Azure Policy 평가 | AWS · GCP는 커넥터 기반 평가
- 증적(Evidence): 권장 사항 · 보안 점수 | ARG: securityresources

### L3: [작성 필요]

## L2 · Defender CSPM — 공격 경로 · 위험 우선순위

- 설정(Control Plane): 플랜 활성 | 에이전트 없는 스캔 (Owner 필요)
- 강제(Enforcement): 클라우드 보안 그래프 | 공격 경로 분석
- 증적(Evidence): 공격 경로 · 클라우드 보안 탐색기 | Exposure Management

### L3: [작성 필요]

## L2 · Defender for Servers — P1 · P2

- 설정(Control Plane): 플랜 · MDE 통합 | 에이전트 없는 스캔
- 강제(Enforcement): MDE 센서 | 에이전트 없는 디스크 스캔
- 증적(Evidence): 보안 경고 · 취약점 평가 | KQL: SecurityAlert

### L3: [작성 필요]

## L2 · Defender for Containers — K8s · 이미지 · 런타임

- 설정(Control Plane): 플랜 · 센서 배포 | 레지스트리 연결
- 강제(Enforcement): Defender 센서 (클러스터) | 레지스트리 이미지 스캔
- 증적(Evidence): 경고 · 이미지 취약점 | CloudProcessEvents (Preview)

### L3: [작성 필요]

## L2 · Defender for Storage — 멀웨어 · 데이터 위협

- 설정(Control Plane): 플랜 · 업로드 시 멀웨어 스캔 | 민감 데이터 위협 탐지
- 강제(Enforcement): 스토리지 서비스 측 스캔 | 에이전트 · 로그 설정 불필요
- 증적(Evidence): 보안 경고 · 스캔 결과 | CloudStorageAggregatedEvents

### L3: [작성 필요]

## L2 · AI 위협 보호 — 탈옥 · 데이터 유출 · 자격 증명

- 설정(Control Plane): AI Services 플랜 | 프롬프트 증거 옵션
- 강제(Enforcement): Azure OpenAI · Foundry 앱 | Prompt Shields 신호
- 증적(Evidence): AI 경고 (프롬프트 증거) | → XDR 인시던트

### L3: [작성 필요]

## L2 · DevOps 보안 — 코드 → 클라우드 연결

- 설정(Control Plane): DevOps 커넥터 | IaC · 비밀 · 의존성 스캔
- 강제(Enforcement): 리포지토리 · 파이프라인 스캔 | PR 주석
- 증적(Evidence): DevOps 권장 사항 | 코드-클라우드 매핑

### L3: [작성 필요]

## L2 · XDR 합류 — 클라우드 경고 → 인시던트

- 설정(Control Plane): Defender XDR 통합 | (기본 연동)
- 강제(Enforcement): XDR 상관 엔진 | M365 신호와 같은 인시던트
- 증적(Evidence): AlertInfo | CloudAuditEvents (ARM · K8s 제어면)

### L3: [작성 필요]
