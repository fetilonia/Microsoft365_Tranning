---
title: 교육 보드 편집용 원본 — Purview (분할본, E0 값만)
source: 교육보드 편집원본 v2에서 분할 (2026-11-18). 각 L2의 L3는 아직 [작성 필요]
---

> 규칙은 `교육보드 편집원본 — 01 Entra Admin Center.md`의 '보드 규격' 절과 같습니다. 이 파일은 아직 세부 시나리오가 없는 E0(설정/강제/증적) 값만 담습니다.

# L1 · 03 · Purview — 데이터 거버넌스

## L2 · 데이터 분류 — SIT · 학습 가능한 분류자

- 설정(Control Plane): 민감 정보 유형 · 분류자 | (사용자 지정 SIT 포함)
- 강제(Enforcement): 서비스별 콘텐츠 검사 | EXO · SPO · OneDrive · 엔드포인트
- 증적(Evidence): Content explorer | Activity explorer

### L3: [작성 필요]

## L2 · 민감도 레이블 — 표시 · 우선순위 · 상속

- 설정(Control Plane): 레이블 · 게시 정책 | 자동 레이블 정책
- 강제(Enforcement): Office 앱 (클라이언트 측) | SPO · EXO (서비스 측 자동 레이블)
- 증적(Evidence): 감사: SensitivityLabelApplied 등 | Activity explorer

### L3: [작성 필요]

## L2 · 암호화 · 사용 권한 — VIEW · EXTRACT

- 설정(Control Plane): 레이블 암호화 설정 | 사용 권한 · 사용자 할당
- 강제(Enforcement): Azure Rights Management | 문서를 열 때 사용 권한 확인
- 증적(Evidence): 감사 · RMS 사용 기록 | Copilot: EXTRACT 없으면 링크만

### L3: [작성 필요]

## L2 · DLP (M365) — 메일 · 파일 · 채팅 유출 방지

- 설정(Control Plane): DLP 정책 · 위치 | EXO · SPO · OneDrive · Teams
- 강제(Enforcement): 각 workload 서비스 | 전송 · 공유 · 메시지 시점
- 증적(Evidence): DLP 경고 · 감사 DLPRuleMatch | Activity explorer

### L3: [작성 필요]

## L2 · 엔드포인트 DLP — 붙여넣기 · 업로드 · 복사

- 설정(Control Plane): 엔드포인트 DLP 설정 · 정책 | 민감 서비스 도메인 그룹
- 강제(Enforcement): Purview 온보딩 기기 | Windows · macOS
- 증적(Evidence): Activity explorer | DLP 경고 · 감사

### L3: [작성 필요]

## L2 · Copilot 위치 DLP — 프롬프트 · 웹 검색 · 레이블 · 외부 메일

- 설정(Control Plane): DLP 위치: Microsoft Copilot | SIT 규칙과 레이블 규칙은 분리
- 강제(Enforcement): Copilot 처리 경로 | 응답 차단 · 근거에서 제외
- 증적(Evidence): DLP 경고 · Activity explorer | 레이블 제외는 E5 계열

### L3: [작성 필요]

## L2 · 타사 AI 경로 DLP — Edge · 네트워크 · 엔드포인트

- 설정(Control Plane): DSPM for AI 원클릭 정책 | 브라우저 · 네트워크 데이터 보안
- 강제(Enforcement): Edge for Business · 온보딩 기기 | SASE / SSE 공급자
- 증적(Evidence): DSPM for AI 보고서 | 감사 RecordType: AIAppInteraction

### L3: [작성 필요]

## L2 · Insider Risk · Adaptive Protection — 위험 사용자 동적 통제

- 설정(Control Plane): IRM 정책 (위험한 AI 사용 등) | 위험 수준 → DLP · CA 연결
- 강제(Enforcement): DLP · CA (내부자 위험 조건) | 위험 수준에 따라 동적 적용
- 증적(Evidence): IRM 경고 · 케이스 | Sign-in log CA 결과

### L3: [작성 필요]

## L2 · 감사 · eDiscovery — Copilot 대화 포함

- 설정(Control Plane): 감사 (Standard · Premium) | eDiscovery 케이스 · 보존
- 강제(Enforcement): 통합 감사 로그 수집 | 사서함에 Copilot 상호작용 보관
- 증적(Evidence): Search-UnifiedAuditLog | POST /v1.0/security/auditLog/queries

### L3: [작성 필요]

## L2 · Data Map · 멀티클라우드 — S3 · Snowflake · SQL Server

- 설정(Control Plane): Data Map 원본 등록 | 스캔 · 분류 규칙
- 강제(Enforcement): 스캔 런타임 | 메타데이터 · 분류만 수집
- 증적(Evidence): Unified Catalog 자산 | 분류 결과 · 인사이트

### L3: [작성 필요]
