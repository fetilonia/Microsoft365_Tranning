## L2 · ID Protection — 사용자 위험 · 로그인 위험

- 설정(Control Plane): 위험 기반 CA 정책 (사용자 위험 · 로그인 위험 조건) | 위험 수준 · 부여 제어 (위험 해결 요구 · 인증 강도 · 암호 변경)
- 강제(Enforcement): CA 평가 시 사용자 위험 · 로그인 위험 수준 반영 | 신뢰도 매우 높은 위험 로그인은 내장 보호가 자동 차단 (AADSTS50053)
- 증적(Evidence): GET /v1.0/identityProtection/riskDetections · riskyUsers | KQL: AADUserRiskEvents · AADRiskyUsers · SigninLogs (RiskLevelDuringSignIn · RiskState)
- 메뉴(Admin Center): 보호 > ID Protection
- 라이선스(License): 위험 기반 CA 정책 · 개요(Overview) · 알림 · MFA 등록 정책 · Graph 전체 위험 보고서는 Entra ID P2(또는 Entra Suite) 필요 · 무료·P1은 위험 사용자(중간·높음만, 상세 창·이력 없음)와 위험 로그인(위험 수준·상세 없음)만 제한적으로 보이고 위험 탐지 보고서는 무료 불가·P1은 상세 창 없음 · Premium 탐지는 P2 없으면 generic(Additional risk detected)으로만 표시 · Defender 신호 기반 탐지는 해당 Defender 제품 라이선스도 필요 [확인 필요: 고객의 SKU·Defender 제품 보유 및 대상 사용자 할당]

### L3 · 0 · 기능 상태 전이 — 탐지만 → 위험 기반 정책 → 자동 해결

#### L4 · ⓪ 비활성 — 위험 기반 정책이 없는 상태

1. [시작] 로그인 요청 — 익명 IP · 낯선 환경 같은 위험 신호
   - 주체: 사용자
   - 위치: login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize
   - 데이터: 로그인 요청의 IP · 위치(IP 조회 기준) · ASN · 브라우저 · 디바이스 · 테넌트 IP 서브넷 속성 · 대화형·비대화형 로그인 모두 평가 대상
   - 해설: 평소와 다른 신호가 섞인 로그인이 들어옵니다. ID Protection은 모든 인증 흐름(대화형·비대화형)에 위험을 평가하며, 신뢰할 수 있는 명명된 위치(Named location)에서 들어온 로그인은 위험이 낮게 계산됩니다
2. [처리] ID Protection이 로그인 위험을 실시간 산정
   - 주체: Entra ID
   - 위치: ID Protection 위험 평가 (서비스 내부) — 로그인마다 실시간(Real-time) 탐지를 모두 실행
   - 데이터: riskDetection.riskEventType (예: anonymizedIPAddress = Nonpremium · unfamiliarFeatures = Premium) · riskLevel = low / medium / high · detectionTimingType = realtime / offline
   - 해설: 탐지는 정책 유무와 관계없이 계속 기록됩니다. 실시간 탐지는 보고서에 상세가 5~10분 안에, 오프라인 탐지는 최대 48시간 뒤에 나타나므로 방금 한 로그인이 보고서에 아직 없을 수 있습니다. P2가 없는 테넌트에서는 Premium 탐지가 generic(Additional risk detected)으로만 보입니다 (L3 A 8번)
3. [판단] 신뢰도가 매우 높은 위험 로그인인가?
   - 주체: Entra ID
   - 위치: 모니터링 및 상태 › 로그인 로그 (Sign-in logs) › 실패 이유(Failure reason)
   - 데이터: 내장 보호 판정 — 레거시 인증 프로토콜 · 악의적 시도 속성 · 사용자에게 오류 코드 50053 · 로그인 로그 차단 사유 "Sign-in was blocked by built-in protections due to high confidence of risk"
   - 해설: 이런 로그인은 관리자 정책 없이도 Entra가 먼저 막습니다. 해제하려면 회사가 아는 위치라면 해당 IP를 신뢰할 수 있는 위치(Trusted location)에 추가하거나, 레거시 프로토콜 대신 최신 인증(Modern authentication)을 쓰게 합니다
   - 예 → [차단] 내장 보호 차단 — AADSTS50053 (정책과 무관)
   - 아니오 → 4
4. [처리] 위험 조건을 쓰는 CA 정책이 없음
   - 주체: Entra ID
   - 위치: Entra ID › 조건부 액세스(Conditional Access) › 정책 (보호 › 조건부 액세스) · 레거시 정책 이전 안내의 ID Protection › 대시보드
   - 데이터: 정책 조건 userRiskLevels · signInRiskLevels 가 비어 있음 · Microsoft가 공지한 레거시 ID Protection 위험 정책 폐기일은 2026년 10월 1일이며 확인 시점에 지남. 공식 문서는 여전히 폐기를 미래형으로 안내함 [확인 필요: 실제 폐기 여부와 테넌트별 레거시 정책 메뉴·사용 가능 여부]
   - 해설: 위험 수준이 허용·차단 판정에 전혀 쓰이지 않습니다. 위험 기반 정책은 P2(또는 Entra Suite)가 있어야 만들 수 있고, 무료·P1 테넌트는 보고서만 제한적으로 볼 수 있습니다
5. [처리] 위험 사용자가 보고서에만 쌓임
   - 주체: 로그
   - 위치: 보호 › ID Protection › 위험한 사용자 (Risky users) · 위험한 로그인(최근 30일) · 위험 탐지(최근 90일)
   - 데이터: riskyUser.riskState = atRisk · SigninLogs RiskLevelDuringSignIn · 낮음(low) 위험은 6개월 뒤 자동 소멸 · 중간·높음은 해결(remediated)·해제(dismissed) 전까지 유지 · 무료·P1은 위험 사용자 중 중간·높음만 표시(상세 창·이력 없음)
   - 해설: 목록은 쌓이지만 자동으로 해결해 주는 장치가 없습니다. 위험 로그인이 하나라도 있거나 위험 탐지가 하나라도 보고되면 그 사용자는 위험 사용자가 됩니다
6. [끝] 위험 로그인도 토큰 발급 — 관리자가 보기 전까지 방치
   - 주체: Entra ID
   - 데이터: 액세스 토큰 발급 · 위험 상태 atRisk 유지 · 위험 사용자 알림(Users at risk detected alerts)과 주간 요약(Weekly digest)은 P2에서만 제공
   - 해설: 탈취된 계정이라도 위험 수준과 무관하게 접근이 허용됩니다. P2가 없으면 알림 메일도 없어 관리자가 보고서를 직접 열어 보기 전까지 모를 수 있습니다
- 시나리오: 예 :: 매우 높은 위험 로그인을 내장 보호가 차단
- 시나리오: 아니오 :: 위험 정책이 없어 위험 로그인도 토큰 발급

#### L4 · ① 구성 — 사용자 위험 · 로그인 위험 CA 정책을 각각 만든다

1. [시작] 관리자가 Entra Admin Center에 로그인
   - 주체: 관리자
   - 위치: entra.microsoft.com — CA 정책 만들기·편집은 Conditional Access Administrator가 최소 권한 · 위험 기반 정책 생성·편집은 Security Administrator도 가능
   - 데이터: 역할 할당 (roleAssignments) · 사전 요건: Entra ID P2 또는 Entra Suite 라이선스
   - 해설: 위험 기반 통제는 별도 설정이 아니라 조건부 액세스 정책으로 만듭니다. P2가 없으면 위험 조건을 쓰는 정책으로 강제할 수 없습니다
2. [처리] 기존 위험부터 조사하고 해결
   - 주체: 관리자
   - 위치: 보호 › ID Protection › 위험한 사용자 (Risky users) · 위험한 로그인 (Risky sign-ins) — 보기는 Global Reader, 해제·침해 확인은 Security Operator 이상 · 영향 분석은 Impact analysis workbook
   - 데이터: riskyUser · riskDetection 목록 · 로그인 로그에서 같은 특징(IP·지역·성공/실패)의 로그인 검색
   - 해설: 정책을 켜기 전에 이미 쌓인 위험을 먼저 조사·해결하라고 권장합니다. 공통 특징이 보이면 CA 정책으로 차단하는 것도 고려합니다
3. [처리] 새 정책 만들기 — 대상 사용자와 제외 계정
   - 주체: 관리자
   - 위치: Entra ID › 조건부 액세스 › 정책 › 새 정책 › 할당 › 사용자 또는 워크로드 ID (Users or workload identities)
   - 데이터: 포함 = 모든 사용자 · 제외 = 비상 액세스(break-glass) 계정 · 서비스 계정 · 서비스 주체(Entra Connect 동기화 계정 등)
   - 해설: 잠금 사고를 막으려고 비상 계정과 서비스 계정은 제외합니다. 사용자 대상 CA 정책은 서비스 주체 호출을 막지 않으므로, 서비스 주체는 워크로드 ID용 CA로 따로 정의하고 스크립트의 서비스 계정은 관리 ID(managed identity)로 대체합니다
4. [처리] 대상 리소스 선택
   - 주체: 관리자
   - 위치: 새 정책 › 대상 리소스 › 포함 › 모든 리소스 (이전 이름: 모든 클라우드 앱)
   - 데이터: conditions.applications.includeApplications = All
   - 해설: 모든 리소스에 위험 조건을 적용합니다. 사용자 위험 정책과 로그인 위험 정책은 각각 따로 만듭니다
5. [처리] 사용자 위험 정책 — 조건과 허용 제어
   - 주체: 관리자
   - 위치: 조건 › 사용자 위험 › 구성 = 예 › 높음 / 허용 › 액세스 권한 부여 › 위험 해결 필요 (Require risk remediation)
   - 데이터: conditions.userRiskLevels = high · 인증 강도(Require authentication strength) 자동 선택 · 로그인 빈도 = 매번(Every time) 자동 적용·필수 · 위험 해결 필요는 사용자 위험만 해결하며 게스트·외부 사용자는 세션 해지가 안 되어 지원되지 않음
   - 해설: 사용자 위험 높음에서 해결 절차를 요구하고, 로그인 빈도 매번이 함께 붙습니다. 한 사용자가 여러 정책에 걸리면 Block > 위험 해결 필요 > 암호 변경 필요 순으로 우선하므로 한 사용자에 한 정책만 걸리게 합니다. 해결 흐름은 다른 CA 정책의 영향을 받지 않도록 전용 경로(AppId 93625bc8-bfe2-437a-97e0-3d0060024faa · ResourceId 00000003-0000-0000-c000-000000000000)로 허용됩니다
6. [처리] 로그인 위험 정책 — 별도 정책으로 만듦
   - 주체: 관리자
   - 위치: 새 정책 › 조건 › 로그인 위험 › 구성 = 예 › 높음 · 중간 / 허용 › 인증 강도 필요 › 다단계 인증
   - 데이터: conditions.signInRiskLevels = [high, medium] · grantControls.authenticationStrength · 패스워드리스 사용자는 내장 강도 Passwordless MFA 또는 Phishing-resistant MFA를 선택
   - 해설: 사용자 위험과 로그인 위험은 한 정책에 합치지 않고 따로 만듭니다(합치지 말라는 경고가 문서에 있음). 위험 수준을 높음으로만 잡으면 마찰은 줄지만 낮음·중간 위험은 정책 밖이 됩니다
7. [처리] 로그인 빈도 세션 제어 추가
   - 주체: 관리자
   - 위치: 로그인 위험 정책 › 세션 › 로그인 빈도 › 매번 (Every time)
   - 데이터: sessionControls.signInFrequency.frequencyInterval = everyTime
   - 해설: 위험한 로그인은 기존 세션을 재사용하지 못하게 매번 다시 인증시킵니다. 사용자 위험 정책에서는 이 제어가 자동으로 붙어 필수이고, 로그인 위험 정책에서는 직접 추가합니다
8. [처리] 보고 전용으로 만들기
   - 주체: 관리자
   - 위치: 새 정책 › 정책 사용 › 보고 전용 (Report-only) › 만들기
   - 데이터: conditionalAccessPolicy.state = enabledForReportingButNotEnforced · SigninLogs ConditionalAccessPolicies · 정책 영향(Policy impact) 보기
   - 해설: 실제 차단 없이 영향 범위를 로그로 먼저 확인합니다. Microsoft의 레거시 정책 이전 안내는 CA 정책을 보고 전용으로 확인한 뒤 켜고 옛 정책을 사용 안 함으로 바꾸도록 설명합니다. 옛 정책 메뉴의 실제 사용 가능 여부는 ⓪ 4번의 확인 사항입니다
9. [끝] 영향 확인 뒤 정책 사용을 켜기로 전환
   - 주체: 관리자
   - 위치: 정책 편집 › 정책 사용 › 켜기 (On)
   - 데이터: conditionalAccessPolicy.state = enabled · 감사 로그 정책 변경 [확인 필요: 활동 이름]
   - 해설: 보고 전용 결과에 문제가 없으면 켜서 실제 강제를 시작합니다. 시작 전에 사용자가 MFA에 등록되어 있는지, 하이브리드 사용자는 암호 쓰기 저장이 켜져 있는지 확인해야 합니다. 미등록 사용자는 해결 단계에서 막힙니다

#### L4 · ② 활성 — 위험 수준이 조건부 액세스 판정에 반영된다

1. [시작] 사용자가 앱에 로그인 요청
   - 주체: 사용자
   - 위치: /authorize 요청 (login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize)
   - 데이터: client_id · scope · 요청 IP · 디바이스 속성 · 대화형·비대화형 모두 위험 평가 대상
   - 해설: 위험 정책이 적용되는 대상 사용자가 로그인을 시도합니다. 레거시 인증도 위험 탐지(unfamiliarFeatures)는 돌지만 client ID 같은 최신 속성이 없어 오탐 감소 정보가 적으므로 최신 인증 전환을 권장합니다
2. [처리] 1차 인증 — 암호 또는 패스키 검증
   - 주체: Entra ID
   - 위치: Entra 인증 서비스
   - 데이터: 자격 증명 검증 결과 · 인증 방법 (암호 + MFA 조합 · 패스워드리스)
   - 해설: 먼저 자격 증명이 맞는지 확인하고 그 결과를 평가에 넘깁니다. 일부 탐지는 자격 증명 검증이 성공한 뒤에만 생깁니다(예: Password spray는 공격자가 사용자 암호를 실제로 맞힌 경우에만 탐지되고, 실패한 시도는 탐지를 만들지 않습니다)
3. [처리] ID Protection이 로그인 위험과 사용자 위험을 계산
   - 주체: Entra ID
   - 위치: ID Protection (서비스 내부)
   - 데이터: 로그인 위험 = 이번 로그인의 실시간 탐지 · 사용자 위험 = 누적된 활성 탐지 · 통합 위험 신호(P2 + Defender for Identity 구성 시)는 여러 제품의 중·저신뢰 신호를 묶어 사용자 위험을 높음으로 올릴 수 있음(riskEventType = aiCompoundAccountRisk)
   - 해설: 이번 로그인의 위험과 계정 전체의 위험, 두 값을 따로 산출합니다. 일부 탐지는 로그인 뒤 오프라인으로 계산되므로 위험 수준이 나중에 바뀔 수 있습니다
4. [처리] 조건부 액세스가 위험 수준을 신호로 읽음
   - 주체: Entra ID
   - 위치: 조건부 액세스 정책 평가 엔진 · 결과 확인은 로그인 로그 › 조건부 액세스 탭
   - 데이터: 정책 조건 signInRiskLevels · userRiskLevels 대 현재 위험 수준 · 로그인 로그에 어떤 위험 기반 정책이 적용됐는지 표시
   - 해설: 위험 수준은 사용자·앱·위치와 같은 신호 중 하나로 정책에 들어갑니다. ID Protection이 로그인마다 위험 수준을 CA에 넘기고, 정책 조건이 맞으면 정책이 적용됩니다
5. [판단] 정책에서 정한 위험 수준에 해당하는가?
   - 주체: Entra ID
   - 위치: CA 정책 › 조건 › 사용자 위험 · 로그인 위험에서 고른 수준(낮음·중간·높음)
   - 데이터: 로그인 위험 중간 이상 · 사용자 위험 높음 (권장 구성 기준) · 정책 수준과 일치할 때만 적용
   - 해설: 수준이 낮으면 정책이 적용되지 않고 그대로 통과합니다. 일부 탐지는 정책 수준까지 위험을 올리지 못할 수 있어 관리자가 수동 조치하거나 허용 수준을 낮춰야 합니다
   - 예 → 6
   - 아니오 → 9
6. [처리] 해결 요구 — MFA 또는 보안 암호 변경
   - 주체: Entra ID
   - 위치: 로그인 중단 화면 (자기 해결 흐름) — 사용자에게는 일반 MFA 프롬프트로 보임
   - 데이터: 로그인 위험 → 인증 강도 MFA · 사용자 위험 → 위험 해결 필요(암호 사용자: MFA 후 암호 변경, 패스워드리스 사용자: 세션 해지 후 재로그인)
   - 해설: 사용자가 본인임을 스스로 증명하면 위험이 풀리는 구조입니다. 위험 해결 필요 정책은 방금 로그인했더라도 세션이 해지된 뒤 다시 로그인해야 하고, 두 번째 로그인이 성공하면 위험이 해소됩니다
7. [판단] 사용자가 요구를 충족했는가?
   - 주체: 사용자
   - 위치: 로그인 중단 화면 · 차단 시 "계정이 차단되었습니다" 화면
   - 데이터: MFA 등록 여부 · 하이브리드 사용자는 암호 쓰기 저장 필요 · 하이브리드는 암호 해시 동기화 + 보호 › ID Protection › 설정(Settings) › 온-프레미스 암호 변경이 사용자 위험을 해제하도록 허용(Allow on-premises password change to reset user risk, 선택 기능) 시 온-프레미스 암호 변경으로도 해결
   - 해설: MFA에 미등록인 사용자는 요구를 수행할 수 없어 막힙니다. 이때는 관리자가 직접 해제·재설정하거나, 사용자가 익숙한 위치·디바이스에서 로그인해 로그인 위험이 자동 해제되게 해 볼 수 있습니다
   - 예 → 8
   - 아니오 → [차단] 차단 — MFA 미등록 · 관리자 개입 필요
8. [처리] 위험 상태를 해결됨으로 갱신
   - 주체: Entra ID
   - 데이터: riskState atRisk → remediated · riskDetail = User passed multifactor authentication (로그인 위험) · User performed secure password change(Graph 값 userPerformedSecuredPasswordReset, 사용자 위험) · 시스템이 안전으로 판단하면 riskState = dismissed + AI confirmed sign-in safe 또는 Microsoft Entra ID Protection assessed sign-in safe
   - 해설: 통과한 위험 로그인은 해결된 것으로 표시됩니다. 해결되지 않은 로그인 위험은 사용자 위험에 영향을 주므로, 로그인 위험 정책이 사용자 위험 누적을 막아 줍니다. 토큰 탈취 계열 탐지(Anomalous token · Attacker in the Middle · Token issuer anomaly · Verified threat actor IP · Entra threat intelligence)는 MFA 클레임이 있는 세션을 자동 해결하지 않습니다
9. [끝] 토큰 발급 + 위험·정책 결과 기록
   - 주체: 로그
   - 위치: 모니터링 및 상태 › 로그인 로그 · Log Analytics (진단 설정 범주 RiskyUsers · UserRiskEvents → 테이블 AADRiskyUsers · AADUserRiskEvents)
   - 데이터: SigninLogs RiskLevelDuringSignIn · RiskState · ConditionalAccessStatus · AADUserRiskEvents · 진단 설정 스트리밍 전 이벤트는 없고 데이터가 도착하기까지 약 15분 · 위험 로그인 보존 무료 7일 / P1·P2 30일
   - 해설: 토큰이 발급되고 위험 수준과 정책 결과가 로그에 남습니다. Log Analytics 테이블은 진단 설정 범주 이름과 다르다는 점(예: UserRiskEvents → AADUserRiskEvents)을 교육 때 짚어 줍니다
- 시나리오: 예 ▸ 예 :: 위험 해당 후 요구를 충족해 토큰 발급
- 시나리오: 예 ▸ 아니오 :: 위험 해당 후 요구 미충족으로 차단
- 시나리오: 아니오 :: 위험 수준에 해당하지 않아 바로 토큰 발급

> 교육 포인트: 위험 기반 통제는 "탐지 → 수준 → 정책 → 스스로 해결"의 한 줄입니다. 사용자가 해결 절차를 끝내면 관리자 개입 없이 위험이 해소되므로, 차단보다 자기 해결 정책을 먼저 권장합니다.
>
> 주의: 정책 작성 시 사용자 위험과 로그인 위험을 한 정책에 합치지 않습니다. 사용자가 MFA에 등록되어 있지 않으면 해결 단계에서 막히고, 하이브리드 사용자는 암호 쓰기 저장이 켜져 있어야 합니다. 위험 해결 필요(Require risk remediation)는 게스트·외부 사용자에게 지원되지 않습니다.
>
> 출처: https://learn.microsoft.com/entra/id-protection/howto-identity-protection-configure-risk-policies
>
> 출처: https://learn.microsoft.com/entra/id-protection/concept-identity-protection-policies
>
> 출처: https://learn.microsoft.com/entra/id-protection/overview-identity-protection
>
> 출처: https://learn.microsoft.com/entra/id-protection/concept-risk-detection-types
>
> 출처: https://learn.microsoft.com/entra/id-protection/concept-risk-reports
>
> 출처: https://learn.microsoft.com/entra/id-protection/howto-identity-protection-remediate-unblock
>
> 출처: https://learn.microsoft.com/entra/id-protection/concept-identity-protection-user-experience
>
> 출처: https://learn.microsoft.com/entra/id-protection/howto-export-risk-data

### L3 · A · 위험 탐지와 수준 산정 — 신호 → 탐지 → 로그인 위험 → 사용자 위험

#### L4 · 신호가 탐지가 되고 위험 수준으로 누적되는 과정

1. [시작] 로그인 · 계정 활동 · 위협 정보에서 신호 수집
   - 주체: Entra ID
   - 위치: ID Protection (서비스 내부) · 신호 출처: Entra 로그인 · Microsoft Defender for Cloud Apps · Defender for Endpoint · Defender for Office 365 · Defender for Identity(통합 위험 신호)
   - 데이터: 로그인 속성 · Microsoft 위협 인텔리전스(MSTIC 등) · Defender 계열 신호 · 통합 위험 신호는 P2 + Defender for Identity 구성이 필요하며 Microsoft 365 E5를 권장(Defender for Identity 없이 켜면 위험 누적이 일어나지 않음)
   - 해설: 여러 출처의 신호를 모아 이상 징후를 찾습니다. Defender 신호에서 오는 탐지(예: New country · Impossible travel · Mass access to sensitive files는 Defender for Cloud Apps, PRT 접근 시도는 Defender for Endpoint)는 P2 외에 해당 Defender 제품 라이선스(또는 Microsoft 365 E5)도 필요합니다
2. [판단] 로그인 도중에 판정할 수 있는 탐지인가?
   - 주체: Entra ID
   - 위치: Graph riskDetection.detectionTimingType / 위험 탐지 보고서의 탐지 유형(Detection type)
   - 데이터: 탐지 유형 = 실시간(Real-time) 또는 오프라인(Offline) · 일부 탐지는 둘 다(Real-time or Offline: anomalousToken · passwordSpray · investigationsThreatIntelligence · generic)
   - 해설: 탐지는 로그인 중에 끝나는 것과 나중에 분석되는 것으로 나뉩니다. 실시간 탐지는 상세가 보고서에 5~10분 안에, 오프라인 탐지는 최대 48시간 뒤에 나타납니다
   - 실시간 → 3
   - 오프라인 → 4
3. [처리] 실시간 탐지 — 로그인 위험에 즉시 반영
   - 주체: Entra ID
   - 위치: 같은 로그인의 CA 평가 시점(로그인 위험 조건)
   - 데이터: riskEventType 예: anonymizedIPAddress(Nonpremium) · unfamiliarFeatures · unlikelyTravel · authenticatorPhishing · nationStateIP(Premium) · unfamiliarFeatures는 신규 사용자에게 최소 5일 이상 학습 기간 동안 꺼져 있음
   - 해설: 이 위험은 같은 로그인의 CA 판정에 바로 쓰입니다. 정책이 MFA를 요구하는 식으로 로그인 중에 막거나 사용자가 스스로 해결하게 할 수 있습니다
   - 다음 → 5
4. [처리] 오프라인 탐지 — 로그인 뒤 분석해 위험 표시
   - 주체: Entra ID
   - 위치: 위험 탐지 보고서(최근 90일) · 위험한 로그인 보고서
   - 데이터: riskEventType 예: leakedCredentials(Nonpremium, 항상 높음) · newCountry · maliciousIPAddress · mcasImpossibleTravel · 온-프레미스 암호의 leakedCredentials는 암호 해시 동기화(PHS)가 필요
   - 해설: 이미 통과한 로그인이 뒤늦게 위험으로 표시될 수 있습니다. 오프라인 탐지는 침해 경로와 정상 사용자에게 준 영향을 더 깊게 보여 주며, 사용자 위험 정책이 있으면 다음 인증 때 해결 절차가 걸립니다
5. [처리] 탐지마다 위험 수준 부여 — 낮음 · 중간 · 높음
   - 주체: Entra ID
   - 위치: 위험 탐지 보고서(위험 수준 · 위험 상태 · 위험 세부)
   - 데이터: riskDetection.riskLevel = low / medium / high · 기계 학습 신뢰도 (같은 탐지도 수준이 달라질 수 있음) · leakedCredentials · nationStateIP(Verified threat actor IP)는 항상 high
   - 해설: 수준은 해당 계정 자격 증명이 노출됐을 가능성의 신뢰도입니다. Unfamiliar sign-in properties는 친숙도에 따라 높음·중간·낮음 모두 나올 수 있습니다. 낮음 수준 탐지·사용자는 6개월 뒤 자동으로 정리되고 중간·높음은 해결·해제 전까지 남습니다
6. [처리] 로그인 위험 확정 — 로그인 단위 판정
   - 주체: Entra ID
   - 위치: 보호 › ID Protection › 위험한 로그인 (Risky sign-ins) — 최근 30일, 대화형·비대화형 모두 표시, 로그인 유형(Sign-in type) 필터로 구분
   - 데이터: signIn.riskLevelDuringSignIn · riskLevelAggregated · riskState · 위험 탐지가 1건 이상 보고된 로그인이 위험한 로그인으로 기록됨
   - 해설: 로그인 한 건에 걸린 탐지를 모아 그 로그인의 위험 수준을 정합니다. 실시간 위험(DuringSignIn)과 오프라인까지 합친 위험(Aggregated)은 값이 다를 수 있습니다
7. [처리] 활성 탐지를 사용자 위험으로 누적
   - 주체: Entra ID
   - 위치: 보호 › ID Protection › 위험한 사용자 (Risky users)
   - 데이터: riskyUser.riskLevel · riskState = atRisk · 해결 안 된 로그인 위험도 사용자 위험에 영향 · 통합 위험 신호가 켜져 있으면 여러 제품의 낮은 신뢰도 신호가 겹칠 때 높음으로 상향(aiCompoundAccountRisk)
   - 해설: 계정에 걸린 모든 활성 탐지가 사용자 위험 수준 하나로 합쳐집니다. 위험 로그인이 하나라도 있거나 위험 탐지가 하나라도 있으면 위험 사용자가 됩니다
8. [판단] P2 라이선스로 상세 탐지를 볼 수 있는가?
   - 주체: 관리자
   - 위치: 라이선스는 런타임 분기가 아니라 테넌트의 전제 조건입니다. 확인 위치는 보호 › ID Protection › 위험 탐지(Risk detections) 보고서의 탐지 유형과 상세 창, 그리고 Graph riskDetection.riskEventType 값이며 근거는 overview-identity-protection의 License requirements 표 · concept-identity-protection-risks의 탐지별 Type 열입니다
   - 데이터: 실제 분기 기준은 탐지 유형(Type)입니다. Nonpremium = Free에서도 상세 표시(anonymizedIPAddress · leakedCredentials · investigationsThreatIntelligence · adminConfirmedUserCompromised). Premium = P2 필요(unfamiliarFeatures · unlikelyTravel · passwordSpray · maliciousIPAddress · anomalousToken · authenticatorPhishing · nationStateIP 등). 테넌트가 Free·P1이면 Premium 탐지는 riskEventType = generic · 이름 Additional risk detected(로그인용·사용자용 각각)로만 나옵니다
   - 해설: 보고서 가시성은 라이선스별로 다릅니다. Risky users = Free·P1은 중간·높음 사용자만, 상세 창·위험 이력 없음 / P2는 전체. Risky sign-ins = Free·P1은 위험 수준·상세 없음 / P2는 전체. Risk detections = Free는 없음, P1은 상세 창 없음 / P2는 전체. 개요(Overview)·사용자 위험 알림·주간 요약·위험 정책·Graph 위험 보고서는 P2(또는 Entra Suite)이며 riskDetections API 문서는 P1/P2로 적어 문서 간 차이가 있습니다 [확인 필요: Graph 위험 탐지 API의 P1 사용 가능 범위]. generic은 "Premium 탐지가 발동했음"만 알리는 이름이라 P2 없는 테넌트에서는 Premium 탐지의 종류·이유·세부가 가려집니다. 그래서 "예(P2 있음)"는 Premium 탐지가 본래 이름으로, "아니오(P2 없음)"는 generic으로 보이는 차이입니다. P2가 있어도 Defender 신호 탐지는 해당 Defender 제품 라이선스가 따로 필요합니다
   - 예 → 9
   - 아니오 → [끝] 일반 탐지만 표시 — 상세 없이 Additional risk detected
9. [끝] 위험 탐지 · 위험 사용자 기록 생성
   - 주체: 로그
   - 위치: Graph /identityProtection/riskDetections (IdentityRiskEvent.Read.All · Global Reader / Security Reader / Security Operator / Security Administrator 역할) · Log Analytics는 진단 설정 범주 UserRiskEvents · RiskyUsers 스트리밍 필요(Security Administrator)
   - 데이터: GET /v1.0/identityProtection/riskDetections (기본 20건, $top 최대 500) · riskyUsers · KQL AADUserRiskEvents (DetectedDateTime · RiskState · RiskLevel) · AADRiskyUsers
   - 해설: Graph와 Log Analytics에서 같은 탐지를 조회할 수 있습니다. 진단 설정 이전 이벤트는 Log Analytics에 없고 스트리밍 시작 후 약 15분이 지나야 데이터가 보입니다
- 시나리오: 실시간 ▸ 예 :: 실시간 탐지를 P2로 상세 확인해 기록 생성
- 시나리오: 실시간 ▸ 아니오 :: 실시간 탐지지만 P2 없이 일반 탐지만 표시
- 시나리오: 오프라인 ▸ 예 :: 오프라인 탐지를 P2로 상세 확인해 기록 생성
- 시나리오: 오프라인 ▸ 아니오 :: 오프라인 탐지지만 P2 없이 일반 탐지만 표시

> 교육 포인트: 실시간 탐지는 그 로그인을 막는 데 쓸 수 있지만, 오프라인 탐지는 이미 지나간 로그인에 대한 사후 표시입니다. 그래서 로그인 위험 정책과 사용자 위험 정책이 둘 다 필요합니다.
>
> 주의: 통합 위험 신호(여러 제품의 신호를 묶은 사용자 위험)는 P2와 Defender for Identity 구성이 있어야 위험이 누적되고, 포털에서 탐지 유형 Unified risk signals · 위험 세부 Microsoft Entra ID Protection elevated the user risk 로 보입니다. 제공 범위가 바뀔 수 있으니 교육 전에 문서와 포털에서 한 번 더 확인합니다.
>
> 출처: https://learn.microsoft.com/entra/id-protection/concept-identity-protection-risks
>
> 출처: https://learn.microsoft.com/entra/id-protection/concept-risk-detection-types
>
> 출처: https://learn.microsoft.com/entra/id-protection/concept-identity-protection-unified-risk
>
> 출처: https://learn.microsoft.com/entra/id-protection/overview-identity-protection
>
> 출처: https://learn.microsoft.com/entra/id-protection/concept-risk-reports
>
> 출처: https://learn.microsoft.com/graph/api/riskdetection-list
>
> 출처: https://learn.microsoft.com/entra/id-protection/howto-export-risk-data

### L3 · B · 위험 기반 정책의 해결 방식 — 로그인 위험은 MFA, 사용자 위험은 암호 변경

#### L4 · 위험 조건 종류에 따라 해결 수단이 갈리는 흐름

1. [시작] 위험 조건이 걸린 로그인 요청
   - 주체: 사용자
   - 데이터: signInRiskLevels 또는 userRiskLevels 조건에 일치
   - 해설: 어떤 위험 조건에 걸렸는지에 따라 요구되는 절차가 달라집니다. 위험 해결 방식은 두 정책의 허용 제어에서 정해집니다
2. [판단] 어느 위험 조건에 걸렸는가?
   - 주체: Entra ID
   - 데이터: 로그인 위험 정책 vs 사용자 위험 정책
   - 해설: 두 조건은 별도 정책이라 해결 수단도 따로 정합니다. 한 정책에 합치지 말라는 경고가 문서에 있으며, 한 사용자가 위험 해결 필요·암호 변경 필요·차단 정책에 함께 걸리면 차단이 가장 우선하고 위험 해결 필요가 암호 변경 필요보다 우선합니다
   - 로그인 위험 → 3
   - 사용자 위험 → 5
3. [처리] 로그인 위험 — 인증 강도(MFA) 요구
   - 주체: Entra ID
   - 위치: 로그인 위험 정책 › 허용 › 인증 강도 필요 › 다단계 인증 (패스워드리스 사용자는 Passwordless MFA 또는 Phishing-resistant MFA)
   - 데이터: authenticationStrength = Multifactor authentication · 세션 제어 로그인 빈도 = 매번 권장 · 강한 MFA 또는 패스워드리스 인증 성공이 로그인 위험을 해결
   - 해설: 등록된 인증 방법으로 본인임을 보이게 합니다. 사용자는 정책이 걸리기 전에 해당 요구를 충족할 인증 방법을 미리 등록해 두어야 합니다
4. [처리] MFA 통과 — 로그인 위험이 해결됨
   - 주체: 사용자
   - 위치: 사용자에게는 일반 MFA 프롬프트로 보이는 로그인 화면
   - 데이터: riskState atRisk → remediated · riskDetail = User passed multifactor authentication · 익숙한 위치·디바이스에서 로그인해 시스템이 안전으로 판단하면 riskState = dismissed · riskDetail = Microsoft Entra ID Protection assessed sign-in safe
   - 해설: 정상 사용자는 MFA만으로 위험을 스스로 풀 수 있습니다. 해결되지 않은 로그인 위험은 사용자 위험에 반영되므로 이 단계가 사용자 위험 누적도 줄입니다
   - 다음 → 9
5. [처리] 사용자 위험 — 위험 해결 필요 요구
   - 주체: Entra ID
   - 위치: 사용자 위험 정책 › 허용 › 위험 해결 필요 (Require risk remediation) — 대안 허용 제어는 암호 변경 필요(Require password change) · 차단 · 신원 확인 필요(Require identity verification, 미리 보기)
   - 데이터: 인증 강도 자동 선택 · 로그인 빈도 매번 자동 적용 · 위험 해결 필요는 사용자 위험만 해결(로그인 위험은 해결 안 함) · 게스트·외부 사용자 미지원
   - 해설: 인증 방법에 맞춰 ID Protection이 알맞은 해결 흐름을 고릅니다. 암호 사용자는 보안 암호 변경 후 이전 세션이 해지되고, 패스워드리스 사용자는 세션 해지 후 재로그인, 공격자가 추가한 디바이스가 있으면 해당 Entra 디바이스 개체를 사용 안 함으로 만들고 세션을 해지합니다
6. [판단] 암호를 쓰는 사용자인가, 패스워드리스 사용자인가?
   - 주체: Entra ID
   - 위치: 사용자 위험 정책이 평가될 때 ID Protection 내부 판단
   - 데이터: 사용자의 등록 인증 방법 · 탐지가 침해된 암호와 관련되는가(Leaked credentials · Password spray 등) 여부
   - 해설: 암호가 없는 사용자는 바꿀 암호가 없으므로 흐름이 다릅니다. 패스워드리스 사용자의 위험 탐지는 암호 침해와 무관한 경우(Anomalous token · Impossible travel · Unfamiliar sign-in properties 등)가 대상입니다
   - 암호 → 7
   - 패스워드리스 → 8
7. [처리] MFA 후 보안 암호 변경
   - 주체: 사용자
   - 위치: 로그인 중단 화면 → 암호 변경 (SSPR 아님) · 하이브리드의 온-프레미스·하이브리드 조인 Windows 장치는 Ctrl-Alt-Del 화면의 암호 변경으로도 가능
   - 데이터: riskDetail = User performed secure password change (Graph 값 userPerformedSecuredPasswordReset · 시스템 라벨이 "secured password reset"으로 보일 수 있으나 SSPR이 아니라 MFA 후 보안 암호 변경을 뜻함) · 하이브리드는 암호 해시 동기화 + 암호 쓰기 저장 필요 · 온-프레미스 변경으로 해결하려면 보호 › ID Protection › 설정에서 Allow on-premises password change to reset user risk를 켬(Security Operator 이상, 선택 기능)
   - 해설: 현재 암호를 알고 MFA를 통과한 뒤 새 암호로 바꿔야 해결됩니다. 위험 사용자 정책 흐름 밖에서 한 일반 암호 변경은 보안 암호 변경으로 인정되지 않습니다. 클라우드 사용자와 Entra 조인 디바이스 하이브리드 사용자는 MFA를 통과할 수 있어야 하며 미등록 사용자는 이 방법을 쓸 수 없습니다
   - 다음 → 9
8. [처리] 세션 해지 후 다시 인증
   - 주체: Entra ID
   - 위치: 사용자 세션 해지(서비스가 자동 수행) · 이후 로그인 화면
   - 데이터: 사용자 세션 해지 · 재인증 요구 · 로그인 빈도 매번이 함께 적용되어 해지 직후 곧바로 다시 로그인해야 함
   - 해설: 패스워드리스 사용자는 기존 세션을 끊고 다시 로그인하게 합니다. 방금 로그인한 사용자라도 위험하면 다시 로그인하라는 안내를 받고, 두 번째 로그인이 성공하면 위험이 해소됩니다
9. [끝] 위험 상태 갱신 — 해결됨(Remediated)
   - 주체: 로그
   - 위치: 보호 › ID Protection › 위험한 사용자 · 위험 탐지 보고서 · 로그인 로그
   - 데이터: riskyUser.riskState = remediated · SigninLogs RiskState · 시스템이 오탐·정책 해결로 판단한 탐지는 riskState = dismissed · riskDetail = AI confirmed sign-in safe
   - 해설: 해결 결과가 위험 사용자 · 로그인 로그에 반영됩니다. 해결된 위험은 더 이상 사용자 위험 수준에 기여하지 않습니다
- 시나리오: 로그인 위험 :: 로그인 위험은 MFA 통과 후 위험 상태 갱신
- 시나리오: 사용자 위험 ▸ 암호 :: 암호 사용자의 사용자 위험은 MFA 후 암호 변경
- 시나리오: 사용자 위험 ▸ 패스워드리스 :: 패스워드리스 사용자 위험은 세션 해지 후 재인증

> 교육 포인트: 보안 암호 변경은 "현재 암호를 알고 MFA로 인증한 뒤 바꾸는 것"이며 SSPR(암호를 잊은 사용자의 복구)과 다른 흐름입니다. 단 SSPR로 재설정해도 사용자 위험은 해소됩니다.
>
> 주의: 토큰 탈취 계열 탐지(Microsoft Entra threat intelligence · Anomalous token · Attacker in the Middle · Verified threat actor IP · Token issuer anomaly)는 로그인 때 MFA 클레임이 있는 세션을 자동으로 해결하지 않으므로, 사용자 위험 정책이 있으면 사용자가 보안 암호 변경과 MFA 재인증을 해야 위험이 풀립니다.
>
> 출처: https://learn.microsoft.com/entra/id-protection/howto-identity-protection-remediate-unblock
>
> 출처: https://learn.microsoft.com/entra/id-protection/howto-identity-protection-configure-risk-policies
>
> 출처: https://learn.microsoft.com/entra/id-protection/concept-identity-protection-policies
>
> 출처: https://learn.microsoft.com/entra/id-protection/concept-identity-protection-user-experience

### L3 · C · 위험 사용자 조사와 교정 — 위험 해제 · 암호 변경 · 침해 확인

#### L4 · 관리자가 위험 사용자를 조사해 해제하거나 침해로 확정

1. [시작] 위험한 사용자 보고서를 연다
   - 주체: 관리자
   - 위치: 보호 › ID Protection › 위험한 사용자 (Risky users) — 보기는 Global Reader 이상(Security Reader도 가능) · 먼저 ID Protection › 대시보드에서 요약 확인
   - 데이터: GET /v1.0/identityProtection/riskyUsers (riskState · riskLevel · riskLastUpdatedDateTime) · riskyUsers API는 P2 필요 · 무료·P1은 중간·높음 사용자만 상세 없이 보임
   - 해설: 위험 수준이 높은 사용자부터 조사를 시작합니다. 사용자가 위험 사용자가 되는 조건은 위험 로그인이 1건 이상이거나 위험 탐지가 1건 이상 보고된 경우입니다. 단추가 회색이면 더 높은 권한의 역할이 필요합니다
2. [처리] 위험 탐지 · 타임라인 · 세션 정보를 확인
   - 주체: 관리자
   - 위치: 사용자 선택 › 위험 탐지 · 타임라인 (Risk detections) · 위험 탐지 보고서는 최근 90일
   - 데이터: riskDetection (riskEventType · ipAddress · location · additionalInfo의 userAgent) · 토큰 발급자 유형(tokenIssuerType) · 로그인 요청 ID · 상관관계 ID · 공격 유형(MITRE ATT&CK) · 같은 시각에 발생한 다른 위험
   - 해설: 어떤 탐지가 위험 수준을 올렸는지와 관련 세션을 봅니다. 토큰 탈취 계열 탐지는 세션 상세(발급자 유형 · 로그인 시각 · IP · 위치 · 클라이언트 · 요청 ID · 상관관계 ID)를 함께 보여 주며, 자동 해결되지 않으므로 수동 조사가 필요합니다
3. [처리] 로그인 로그로 정상 활동인지 대조
   - 주체: 관리자
   - 위치: 모니터링 및 상태 › 로그인 로그 (보기는 Reports Reader 이상) · Impact analysis workbook · Microsoft Defender 포털 › 인시던트 및 경고(Incidents & alerts) › 경고(Alerts) 제품 이름 필터 AAD Identity Protection
   - 데이터: SigninLogs: 앱 · 디바이스 준수 · 위치 · IP · User agent · 로그인 로그 보존 무료 7일 / P1·P2 30일
   - 해설: 평소 패턴과 다르면 같은 특징의 다른 계정도 함께 찾습니다. 공통 특징(IP·지역·성공/실패)이 있으면 CA 정책으로 차단을 고려하고, 어떤 리소스가 침해됐을 수 있는지(데이터 다운로드·관리자 변경)도 봅니다. Sentinel·Defender XDR의 관련 경고와 Purview 내부자 위험 관리도 참고합니다
4. [판단] 공격자가 계정을 쓰고 있다고 의심되는가?
   - 주체: 관리자
   - 위치: 조사 결과(2~3번 단계)를 근거로 판단
   - 데이터: 의심 기준: 사용자가 모르는 활동 · 공격자가 암호 재설정이나 MFA를 할 수 있다고 의심되는 경우
   - 해설: 의심이 크면 연락보다 먼저 계정을 보호 조치합니다. 공격자가 사용자를 가장할 수 있다고 의심되면 사용자에게 암호 재설정과 MFA를 요구하거나, 사용자를 차단하고 모든 새로 고침·액세스 토큰을 해지합니다
   - 예 → 7
   - 아니오 → 5
5. [판단] 사용자가 본인 활동이라고 확인했는가?
   - 주체: 관리자
   - 위치: 사용자에게 연락 (메일·Teams는 침해됐을 수 있어 별도 수단 권장)
   - 데이터: 시각 · 앱 · 디바이스 · 위치 · IP 확인 결과
   - 해설: 사용자가 모른다고 하면 침해로 간주합니다. 정상이면 위험이 아님(Confirm safe)·위험 해제(Dismiss) 중 상황에 맞게 고릅니다. 위험 로그인에는 안전 확인(Confirm sign-in safe, 오탐이라 비슷한 로그인을 앞으로 위험으로 보지 않음)과 해제(Dismiss, 침투 테스트처럼 진짜지만 악의 없는 활동이라 비슷한 로그인은 계속 평가함)가 있습니다
   - 예 → 6
   - 아니오 → 7
6. [처리] 사용자 위험 해제 (Dismiss)
   - 주체: 관리자
   - 위치: 위험한 사용자 › 사용자 위험 해제 (Dismiss user risk) — 포털은 Security Operator 이상 · Graph는 위임 권한 기준 최소 역할 Security Administrator, 권한 IdentityRiskyUser.ReadWrite.All
   - 데이터: POST /v1.0/identityProtection/riskyUsers/dismiss · riskState = dismissed · riskDetail = adminDismissedAllRiskForUser(포털 표기 Admin dismissed all risk for user) · 사용자 위험 수준이 none이 됨
   - 해설: 안전이 확인된 위험을 정리합니다. 암호는 바뀌지 않아 계정이 안전해지는 것은 아니므로 필요하면 사용자에게 위험을 알리고 암호 변경을 안내합니다. 삭제된 사용자의 위험은 해제할 수 없습니다
   - 다음 → 10
7. [처리] 침해 확인 (Confirm compromised)
   - 주체: 관리자
   - 위치: 위험한 사용자 › 사용자 침해 확인 (Confirm user compromised) — Graph 권한 IdentityRiskyUser.ReadWrite.All, 최소 역할 Security Administrator(Security Operator는 포털에서 침해 확인 가능)
   - 데이터: POST /v1.0/identityProtection/riskyUsers/confirmCompromised · riskState = confirmedCompromised · riskDetail = Admin confirmed user compromised · 사용자 위험 수준이 high가 되고 탐지 adminConfirmedUserCompromised(Nonpremium)가 생김
   - 해설: 침해로 확정하면 ID Protection이 위험 판정을 학습하는 피드백이 됩니다. 위험 정책이 자동 조치하지 못했다면 이어서 암호 변경 요청 · 사용자 차단 · 새로 고침 토큰 해지 · 침해 디바이스 사용 안 함 · CAE 사용 시 모든 액세스 토큰 해지를 수행합니다. 어느 관리자가 확인했는지는 위험 이력(UI·API)에서 봅니다
8. [처리] 암호 재설정 — 임시 암호 생성 또는 변경 요구
   - 주체: 관리자
   - 위치: 위험한 사용자 › 암호 재설정 (Reset password) — ID Protection에서는 User Administrator + Security Operator 필요 · 사용자 상세(Users › All users)에서는 User Administrator만으로 가능
   - 데이터: riskDetail = Admin generated temporary password for user · 하이브리드는 보호 › ID Protection › 설정 › 온-프레미스 암호 변경이 사용자 위험을 해제하도록 허용 + 암호 해시 동기화 + SSPR 사용 + AD의 "다음 로그온 때 암호 변경 필요"는 이 설정을 모두 켠 뒤에만 선택
   - 해설: 임시 암호를 사용자에게 알려 다음 로그인에서 바꾸게 합니다. 이 방식은 사용자에게 직접 연락해 임시 암호를 알려야 하며, 위험 상태는 해결됨으로 갱신됩니다. 사용자에게 암호 변경만 요청하는 방법도 있는데, 클라우드 사용자는 MFA 후 보안 암호 변경을, 온-프레미스·하이브리드 조인 Windows 장치의 하이브리드 사용자는 Ctrl-Alt-Del 화면에서 변경합니다
9. [처리] 세션 · 토큰 회수와 필요 시 계정 차단
   - 주체: 관리자
   - 위치: 사용자 › 세션 해지 / 계정 사용 안 함 / 디바이스 사용 안 함 · Graph User.RevokeSessions.All 권한 · PowerShell Revoke-MgUserSignInSession
   - 데이터: POST /v1.0/users/{id}/revokeSignInSessions · accountEnabled = false · CAE 사용 시 액세스 토큰도 회수 · 새로 고침 토큰과 브라우저 세션 쿠키를 signInSessionsValidFromDateTime 갱신으로 무효화
   - 해설: 공격자가 이미 받은 새로 고침 토큰을 무효로 만들어 재접근을 끊습니다. 적용에 몇 분 지연이 있을 수 있고, 외부 사용자는 홈 테넌트로 로그인하므로 이 API로 세션을 해지할 수 없습니다
10. [끝] 위험 상태 변경 기록
   - 주체: 로그
   - 위치: 위험한 사용자 상세의 위험 이력(UI) · 모니터링 및 상태 › 감사 로그 [확인 필요: 활동 이름]
   - 데이터: GET /v1.0/identityProtection/riskyUsers/{id}/history · 감사 로그 위험 상태 변경 [확인 필요: 활동 이름] · Microsoft 위협 인텔리전스의 선제 조치는 감사 로그에 시작자가 Microsoft로 기록됨
   - 해설: 누가 어떤 판단으로 위험을 닫았는지 이력으로 남습니다. Microsoft가 대신 취한 조치도 감사 로그에서 확인하고 관리자가 조사 후 되돌릴 수 있습니다
- 시나리오: 예 :: 계정 도용이 의심되어 침해 확정 후 교정
- 시나리오: 아니오 ▸ 예 :: 본인 활동 확인으로 사용자 위험 해제
- 시나리오: 아니오 ▸ 아니오 :: 의심 해소 못 해 침해 확정 후 암호 재설정

> 교육 포인트: 위험 해제(Dismiss)는 "위험이 아니다"라는 판단이고, 침해 확인은 "위험이 맞다"라는 판단입니다. 해제만으로는 암호가 바뀌지 않으니, 안전이 확실할 때만 쓰고 확실하지 않으면 재설정을 병행합니다.
>
> 주의: 삭제된 사용자의 위험은 관리자가 해제할 수 없고 지원 케이스가 필요합니다. 위험 해제 뒤에도 Defender for Identity가 연결된 계정(온-프레미스·타사 IdP)에서 공격을 계속 감지하면 위험이 다시 올라갈 수 있어, 근본 공격을 먼저 해결해야 합니다.
>
> 출처: https://learn.microsoft.com/entra/id-protection/howto-identity-protection-investigate-risk
>
> 출처: https://learn.microsoft.com/entra/id-protection/howto-identity-protection-remediate-unblock
>
> 출처: https://learn.microsoft.com/graph/api/resources/identityprotection-overview
>
> 출처: https://learn.microsoft.com/entra/id-protection/concept-risk-reports
>
> 출처: https://learn.microsoft.com/entra/id-protection/concept-identity-protection-unified-risk
>
> 출처: https://learn.microsoft.com/graph/api/riskyuser-dismiss
>
> 출처: https://learn.microsoft.com/graph/api/riskyuser-confirmcompromised
>
> 출처: https://learn.microsoft.com/graph/api/user-revokesigninsessions
