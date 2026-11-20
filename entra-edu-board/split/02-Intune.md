---
title: 교육 보드 편집용 원본 — Intune (분할본, E0 값만)
source: 교육보드 편집원본 v2에서 분할 (2026-11-18). 각 L2의 L3는 아직 [작성 필요]
---

> 규칙은 `교육보드 편집원본 — 01 Entra Admin Center.md`의 '보드 규격' 절과 같습니다. 이 파일은 아직 세부 시나리오가 없는 E0(설정/강제/증적) 값만 담습니다.

# L1 · 02 · Intune — 디바이스 · 앱 관리

## L2 · 기기 등록 — Autopilot · 회사 포털

- 설정(Control Plane): Autopilot 프로필 · 등록 제한 | 플랫폼 · 개인 기기 허용 여부
- 강제(Enforcement): OOBE 단계 Entra 조인 | + MDM 자동 등록
- 증적(Evidence): GET /v1.0/deviceManagement/managedDevices | 등록 실패 보고서

### L3: [작성 필요]

## L2 · 구성 프로필 · 앱 배포 — 설정 · 인증서 · Wi-Fi · 업무 앱

- 설정(Control Plane): 구성 프로필 · Settings catalog | 앱 할당 (필수 · 사용 가능)
- 강제(Enforcement): 기기 MDM 클라이언트 | Windows: OMA-DM · CSP
- 증적(Evidence): 프로필별 기기 상태 | DeviceManagement-Enterprise-Diagnostics 로그

### L3: [작성 필요]

## L2 · 준수 정책 — 암호화 · OS 버전 · 암호

- 설정(Control Plane): 준수 정책 · 비준수 조치 | 알림 · 유예 기간 · 비준수 표시
- 강제(Enforcement): Intune 준수 평가 | → Entra 기기 isCompliant 기록
- 증적(Evidence): deviceCompliancePolicies 상태 | Entra 기기 isCompliant

### L3: [작성 필요]

## L2 · CA 연동 — 준수 기기만 M365 접근

- 설정(Control Plane): CA Grant: 준수 디바이스 필요 | (Entra admin center)
- 강제(Enforcement): Entra ID 토큰 발급 | 기기 ID 클레임 (PRT 기반)
- 증적(Evidence): Sign-in log | deviceDetail.isCompliant | KQL: SigninLogs

### L3: [작성 필요]

## L2 · 엔드포인트 보안 — AV · 방화벽 · BitLocker · ASR

- 설정(Control Plane): 엔드포인트 보안 정책 | (Intune 또는 MDE 보안 설정 관리)
- 강제(Enforcement): Windows 보안 구성 요소 | Defender AV · 방화벽 · BitLocker
- 증적(Evidence): 엔드포인트 보안 보고서 | ASR 이벤트: DeviceEvents

### L3: [작성 필요]

## L2 · MDE 위험 연동 — 기기 위험 점수 → 준수

- 설정(Control Plane): Intune-MDE 커넥터 | 준수: 기기 위험 점수 기준
- 강제(Enforcement): MDE 위험 평가 | → Intune 준수 재평가
- 증적(Evidence): Defender 기기 페이지 위험 수준 | Intune 준수 상태

### L3: [작성 필요]

## L2 · 앱 보호 (MAM) — BYOD · 앱 단위 회사 데이터

- 설정(Control Plane): 앱 보호 정책 | 복사 · 붙여넣기 · 저장 · PIN
- 강제(Enforcement): Intune SDK 통합 앱 | Outlook · Teams · Edge
- 증적(Evidence): 앱 보호 상태 보고서 | managedAppRegistrations

### L3: [작성 필요]

## L2 · Endpoint Privilege Mgmt — 표준 사용자 + 승인 앱만 상승

- 설정(Control Plane): EPM 설정 정책 | 권한 상승 규칙
- 강제(Enforcement): 기기 EPM 에이전트 | 규칙에 맞는 파일만 상승
- 증적(Evidence): EPM 상승 보고서

### L3: [작성 필요]

## L2 · 원격 작업 · RBAC — 잠금 · 초기화 · 선택적 초기화

- 설정(Control Plane): 기기 · 앱 단위 원격 작업 | 역할 · 범위 태그로 권한 분리
- 강제(Enforcement): MDM 채널(기기 전체) | MAM 앱(회사 데이터만)
- 증적(Evidence): 기기 작업 상태 | Intune 감사 로그

### L3: [작성 필요]
