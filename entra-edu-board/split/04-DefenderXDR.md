---
title: 교육 보드 편집용 원본 — Defender XDR (분할본, E0 값만)
source: 교육보드 편집원본 v2에서 분할 (2026-11-18). 각 L2의 L3는 아직 [작성 필요]
---

> 규칙은 `교육보드 편집원본 — 01 Entra Admin Center.md`의 '보드 규격' 절과 같습니다. 이 파일은 아직 세부 시나리오가 없는 E0(설정/강제/증적) 값만 담습니다.

# L1 · 04 · Defender XDR — 통합 보안 운영

## L2 · Defender for Endpoint — EDR · AV · ASR · 네트워크 보호

- 설정(Control Plane): 온보딩 · 디바이스 그룹 | Intune 또는 MDE 보안 설정 관리
- 강제(Enforcement): 기기 센서 · Defender AV | Windows · macOS · Linux
- 증적(Evidence): DeviceProcessEvents | DeviceNetworkEvents

### L3: [작성 필요]

## L2 · Defender for Office 365 — 피싱 · 첨부 · 링크

- 설정(Control Plane): 피싱 방지 · 안전한 첨부 | 안전한 링크 정책
- 강제(Enforcement): EXO 메일 흐름 (배달 전) | 클릭 시점 URL 검사
- 증적(Evidence): EmailEvents · UrlClickEvents | Threat Explorer

### L3: [작성 필요]

## L2 · Defender for Identity — 온프레미스 AD 공격 탐지

- 설정(Control Plane): DC · AD FS · AD CS 센서 | 디렉터리 서비스 계정
- 강제(Enforcement): DC 센서 | 인증 트래픽 · 이벤트 분석
- 증적(Evidence): IdentityLogonEvents | IdentityDirectoryEvents

### L3: [작성 필요]

## L2 · Defender for Cloud Apps — SaaS · Shadow IT · AI 발견

- 설정(Control Plane): 앱 커넥터 · 세션 정책 | Cloud Discovery · 앱 태그
- 강제(Enforcement): API 커넥터 · CA 앱 제어 (프록시) | MDE 네트워크 보호 (차단)
- 증적(Evidence): CloudAppEvents | 검색된 앱 보고서

### L3: [작성 필요]

## L2 · M365 활동 → XDR — 감사 기록과 신호를 잇는 다리

- 설정(Control Plane): M365 앱 커넥터 | 'Microsoft 365 활동' 켜기
- 강제(Enforcement): Defender for Cloud Apps 수집 | → 헌팅 스키마
- 증적(Evidence): CloudAppEvents | (이후 Copilot 활동도 헌팅 대상)

### L3: [작성 필요]

## L2 · 인시던트 상관 분석 — 흩어진 경고 → 하나의 공격

- 설정(Control Plane): 경고 튜닝 · 사용자 지정 탐지
- 강제(Enforcement): XDR 상관 엔진 | 제품 간 경고 병합
- 증적(Evidence): AlertInfo · AlertEvidence | GET /v1.0/security/incidents

### L3: [작성 필요]

## L2 · 자동 공격 차단 — AiTM · BEC · 랜섬웨어

- 설정(Control Plane): 기본 동작 | 제외 대상 (계정 · 기기) 설정
- 강제(Enforcement): MDE 기기 격리 | Entra · AD 계정 비활성화
- 증적(Evidence): 인시던트 Attack disruption 태그 | Action center

### L3: [작성 필요]

## L2 · 고급 헌팅 · 사용자 지정 탐지 — KQL · 30일 원시 데이터

- 설정(Control Plane): 사용자 지정 탐지 규칙 | KQL · 빈도 · 대응 조치
- 강제(Enforcement): 헌팅 스키마 테이블 | 규칙 → 경고 · 조치
- 증적(Evidence): POST /v1.0/security/runHuntingQuery | 규칙 실행 기록

### L3: [작성 필요]

## L2 · 자동 조사 · 대응 (AIR) — 기기 · 사서함 복구

- 설정(Control Plane): 자동화 수준 | (디바이스 그룹 · MDO)
- 강제(Enforcement): AIR 조사 → 조치 | 자동 실행 또는 승인 대기
- 증적(Evidence): Action center 기록 | 조사 그래프

### L3: [작성 필요]

## L2 · Sentinel 통합 — SIEM + XDR 한 포털

- 설정(Control Plane): Defender 포털 온보딩 | 데이터 커넥터 · 분석 규칙
- 강제(Enforcement): Log Analytics 작업 영역 | 분석 규칙 · 자동화
- 증적(Evidence): SecurityIncident | 작업 영역 KQL

### L3: [작성 필요]
