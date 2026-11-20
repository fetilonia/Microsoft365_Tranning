## L2 · 약관(Terms of use) — 접근 전 동의 요구

- 설정(Control Plane): 약관 (PDF 문서 · 언어 · 표시 이름) | 동의 옵션 (펼쳐 읽기 · 기기별 동의 · 만료 · 재동의) · 조건부 액세스 템플릿
- 강제(Enforcement): 조건부 액세스 권한 부여 컨트롤 "약관 동의 요구" | 로그인 중 대화형 동의 · 거부 시 접근 차단
- 증적(Evidence): 약관 화면의 수락 · 거부 수 · 사용자별 이력 | GET /v1.0/identityGovernance/termsOfUse/agreements/{id}/acceptances · 감사 로그
- 메뉴(Admin Center): Entra ID > 조건부 액세스 > 약관 (Terms of use) [확인 필요: ID 거버넌스 메뉴 아래 별도 진입점 여부]
- 라이선스(License): Entra ID P1 필요 (P1/P2를 잃으면 수락 기록 삭제) [확인 필요: 고객 라이선스]

### L3 · 0 · 기능 상태 전이 — 동의 요구 없음 → 약관 만들기 · CA 연결 → 동의 후 접근

#### L4 · ⓪ 비활성 — 약관이 없거나 조건부 액세스에 연결되지 않은 상태

1. [시작] 사용자가 사내 앱에 로그인
   - 주체: 사용자
   - 위치: 앱 로그인 화면 → /authorize
   - 데이터: 사용자 · 대상 앱
   - 해설: 사용자가 업무 앱에 로그인을 시도합니다
2. [처리] 조건부 액세스 평가 — 약관 컨트롤 없음
   - 주체: Entra ID
   - 위치: Entra ID › 조건부 액세스 (Conditional Access) › 정책 (권한 부여 컨트롤에 약관이 선택된 정책 0개)
   - 데이터: grantControls.termsOfUse 비어 있음 · 약관은 Entra ID › 조건부 액세스 › 약관 (Terms of use)에서 테넌트당 최대 40개까지 만들 수 있고, 만들어 두기만 해서는 어떤 로그인에도 영향이 없음
   - 해설: 약관을 만들어 두었더라도 조건부 액세스 정책에 연결하지 않으면 강제되지 않습니다
3. [처리] 약관은 Entra 밖에서 별도 수단으로 공지
   - 주체: 외부
   - 위치: 메일 공지 · 인트라넷 · 서명 양식 등 [판단]
   - 데이터: Entra에는 수락 기록 없음 — 약관 화면의 Accepted/Declined 수도 비어 있고 사용자 내 계정(myaccount.microsoft.com)의 조직 알림(Organization's notice)에도 나타나지 않음
   - 해설: 누가 약관을 읽고 동의했는지 Entra 안에서 확인할 방법이 없습니다
4. [처리] 토큰 발급 — 동의 여부와 무관
   - 주체: Entra ID
   - 위치: 토큰 발급 단계 (조건부 액세스 평가 이후, 서비스 내부)
   - 데이터: 약관 수락이 토큰 발급 조건이 아님 · 다른 권한 부여 컨트롤(MFA 등)만 평가됨
   - 해설: 동의하지 않아도 접근에는 영향이 없습니다
5. [끝] 접근 허용 — 동의 증적 없음
   - 주체: 로그
   - 위치: 모니터링 및 상태 › 로그인 로그 (Sign-in logs) · 감사 로그 (Audit logs)
   - 데이터: SigninLogs 약관 관련 항목 없음 · agreementAcceptance 없음 (GET /v1.0/identityGovernance/termsOfUse/agreements/{id}/acceptances가 비어 있음)
   - 해설: 감사 때 동의 이력을 제출할 수 없는 상태입니다

#### L4 · ① 구성 — 약관을 만들고 조건부 액세스 정책에 연결한다

1. [시작] 관리자가 Entra Admin Center에 로그인
   - 주체: 관리자
   - 위치: entra.microsoft.com — 약관·조건부 액세스 정책 생성·수정은 최소 Conditional Access Administrator, 약관·정책 조회는 최소 Security Reader, 감사 로그 열람은 Reports Reader
   - 데이터: 역할 할당 · 필요 라이선스는 Entra ID P1
   - 해설: 약관과 조건부 액세스 정책을 만들려면 조건부 액세스 관리자 역할이 필요합니다
2. [처리] 약관 PDF 준비 — 언어별 파일
   - 주체: 관리자
   - 위치: 관리자 PC (모바일 사용자를 위해 글자 크기 24pt 권장)
   - 데이터: 약관 PDF (테넌트당 약관 최대 40개) · 언어마다 PDF를 따로 올림 · PDF 안의 하이퍼링크는 다른 페이지로는 열리지만 문서 내부 섹션 링크는 미지원이고 내 앱(My Apps)·내 계정 포털에서는 링크가 동작하지 않음
   - 해설: 사용자에게 보여 줄 내용을 PDF로 만들고 언어별로 따로 준비합니다
3. [처리] 새 약관 만들기 — 이름 · 파일 · 언어 · 표시 이름
   - 주체: 관리자
   - 위치: Entra ID › 조건부 액세스 › 약관 (Terms of use) › 새 약관 (New terms) — 문서는 이 경로로 표기하며 ID 거버넌스 메뉴 아래 별도 진입점이 있는지는 [확인 필요: 포털 메뉴]
   - 데이터: agreement (displayName · file = 기본 PDF · isViewingBeforeAcceptanceRequired · isPerDeviceAcceptanceRequired) · files 속성은 폐기 예정이라 file 사용을 권장 · Name은 내부 추적용이라 사용자에게 보이지 않고 Display name이 로그인 때 사용자에게 보이는 제목
   - 해설: 내부 이름(Name)과 사용자에게 보일 표시 이름(Display name)을 따로 입력하며 첫 업로드 파일이 기본 문서가 됩니다. 사용자는 브라우저 언어에 맞는 문서를 봅니다
4. [처리] 읽기 · 기기 옵션 — 펼쳐 읽기 · 기기별 동의
   - 주체: 관리자
   - 위치: 새 약관 › Require users to expand the terms of use (약관 펼쳐 읽기 필요) · Require users to consent on every device (모든 기기에서 사용자 동의 필요) — 한글 UI 문구는 [확인 필요: 한글 UI 문구]
   - 데이터: agreement.isViewingBeforeAcceptanceRequired · isPerDeviceAcceptanceRequired · 기기별 동의는 Entra ID에 등록된 기기여야 하고 기기 ID로 강제되며 플랫폼에 따라 추가 앱 설치가 필요할 수 있음
   - 해설: 기기별 동의는 등록된 기기만 가능하고 B2B 사용자와 Intune Enrollment 앱은 지원되지 않습니다
5. [처리] 만료 · 재동의 주기 설정
   - 주체: 관리자
   - 위치: 새 약관 › Expire consents (동의 만료) 켜기 › Expire starting on (만료 시작일) · Frequency (빈도) 또는 Duration before re-acceptance required (days) (재동의가 필요하기 전의 기간, 일)
   - 데이터: agreement.termsExpiration (startDateTime · frequency, ISO 8601 기간) · agreement.userReacceptRequiredFrequency (ISO 8601 기간) · 예: 시작일 Jan 1 + 매월이면 1월 1일에 수락한 Alice와 1월 15일에 수락한 Bob 모두 Feb 1에 만료, 30일 기준이면 Alice Jan 31 · Bob Feb 14에 만료 · 두 설정을 함께 쓸 수는 있으나 보통 하나만 사용
   - 해설: 일정 기준(매월 1일 등)이나 사용자별 N일 기준으로 다시 동의받습니다. 어느 쪽이든 동의가 만료돼도 사용자의 세션이 만료되기 전에는 다시 묻지 않습니다
6. [처리] 조건부 액세스 템플릿 선택
   - 주체: 관리자
   - 위치: 새 약관 › Enforce with Conditional Access policy template › Custom policy (사용자 지정 정책) / Create Conditional Access policy later (나중에 조건부 액세스 정책 만들기)
   - 데이터: 나중에 만들기를 고르면 약관이 권한 부여 컨트롤 목록에만 나타남 · 사용자 지정 정책은 사용자·그룹·앱을 지정하는 세밀한 정책으로 이어짐
   - 해설: 사용자 지정 정책을 고르면 약관 만들기(Create)에 이어 곧바로 정책 화면으로 넘어갑니다
7. [처리] 정책 권한 부여에서 "약관" 선택
   - 주체: 관리자
   - 위치: Entra ID › 조건부 액세스 › 정책 › 새 정책 만들기 › 액세스 제어 (Access controls) › 권한 부여 (Grant) › 액세스 권한 부여 › 만든 약관 선택
   - 데이터: grantControls.termsOfUse = [agreementId] · 여러 권한 부여 컨트롤이 있으면 MFA → 기기 상태 → 약관 순으로 검증 · 퀵스타트 예시는 All users 포함 · Microsoft Admin Portals 대상 · 긴급 접근(break-glass) 계정 제외
   - 해설: 약관이 조건부 액세스 평가의 한 요구 사항이 되어 대상 앱과 사용자에게 적용됩니다
8. [처리] 제외 대상 지정 — 서비스 계정 · Intune 등록 앱
   - 주체: 관리자
   - 위치: 새 정책 › 사용자 제외 · 대상 리소스 제외
   - 데이터: 서비스 계정은 미지원 · 기기별 동의 사용 시 Intune Enrollment 앱 (d4ebce55-015a-49b5-a083-c84d1797ae8c) 제외 · 온보딩·복구 사용자 작업에는 약관 컨트롤 미지원 · 긴급 접근 계정 제외
   - 해설: 대화형 로그인이 불가능한 계정과 앱은 약관을 수락할 수 없어 반드시 제외합니다
9. [처리] 정책 사용 = 보고 전용으로 먼저 확인
   - 주체: 관리자
   - 위치: 새 정책 › 정책 사용 (Enable policy) › 보고 전용 (Report-only)
   - 데이터: 보고 전용 결과 Report-only: User action required (모든 조건은 만족하나 사용자 조치가 필요했을 것이라는 뜻, 사용자에게 약관을 보여 주지 않음) · 로그인 로그에서 정책 결과로 확인
   - 해설: 영향 범위만 확인하고 사용자에게는 약관 화면을 띄우지 않습니다
10. [끝] 정책 켜기 — 즉시 적용
    - 주체: 관리자
    - 위치: 정책 › 정책 사용 › 켜기 (On) → 만들기 (Create)
    - 데이터: conditionalAccessPolicy.state = enabled · AuditLogs 활동 Create Terms Of Use · Publish Terms Of Use(약관), Add Conditional Access policy · Update Conditional Access policy(정책 변경) · 약관 정책을 켜거나 두 번째 약관을 만들면 대상 사용자는 로그아웃 후 다시 로그인해야 새 요구를 충족
    - 해설: 조건부 액세스 정책은 즉시 적용되어 관리자도 다시 로그인해 약관을 수락해야 할 수 있고, 그 사이 관리 센터에서 오류가 보일 수 있습니다

#### L4 · ② 활성 — 로그인 중 약관 동의가 강제된다

1. [시작] 사용자가 약관 대상 앱에 로그인
   - 주체: 사용자
   - 위치: 앱 로그인 화면 → /authorize
   - 데이터: 사용자 · 대상 앱 · 기기 ID · 약관은 로그인 중에 트리거되며 현대 인증을 쓰는 엔터프라이즈 앱이 대상
   - 해설: 약관 컨트롤이 걸린 정책의 대상 사용자와 앱입니다
2. [처리] 1차 인증 + 조건부 액세스 Phase 1
   - 주체: Entra ID
   - 위치: 조건부 액세스 평가 엔진 (서비스 내부)
   - 데이터: 세션 정보 · 정책 매칭 (약관 권한 부여 컨트롤 확인) · 여러 권한 부여 컨트롤은 MFA → 기기 상태 → 약관 순으로 검증하므로 유효한 MFA 클레임이 없으면 먼저 MFA 중단이 기록되고 약관은 그 뒤에 판정
   - 해설: 약관은 권한 부여 요구 중 하나로 MFA 같은 다른 요구보다 뒤에 검증됩니다
3. [판단] 유효한 약관 수락 기록이 있는가?
   - 주체: Entra ID
   - 위치: 약관 수락 저장소 (서비스 내부) · 조회는 Graph GET /v1.0/identityGovernance/termsOfUse/agreements/{id}/acceptances
   - 데이터: agreementAcceptance (state = accepted · declined · agreementFileId 버전 · expirationDateTime · recordedDateTime · 기기별 동의면 deviceId) · Graph 위임 권한 AgreementAcceptance.Read (최소) 또는 AgreementAcceptance.Read.All, 애플리케이션 권한은 미지원
   - 해설: 현재 버전의 동의가 만료되지 않았으면 다시 묻지 않습니다
   - 예 → 8
   - 아니오 → 4
4. [처리] 로그인 중단 — 추가 요구로 리디렉션
   - 주체: Entra ID
   - 위치: 모니터링 및 상태 › 로그인 로그 (중단된 첫 번째 항목 · 추가 세부 정보 메시지)
   - 데이터: SigninLogs — 약관 수락 증명이 토큰에 없어 중단, 동일 correlation ID로 성공 항목이 뒤따름 · 추가 세부 정보 필드에 "The user is required to satisfy additional requirements before finishing authentication, and was redirected to another page (such as terms of use or a third party MFA provider)…" 메시지가 남음
   - 해설: 수락 증명이 없으면 첫 로그인 시도는 중단으로 기록되고 이는 설계된 동작이며 사용자의 로그인 실패를 뜻하지 않습니다
5. [처리] 약관 화면 표시 — 브라우저 언어 문서
   - 주체: 사용자
   - 위치: Entra 약관 화면 (확대 · 축소 · 필요 시 펼쳐 읽기) · 지원 OS Windows · macOS · Linux · Android · iOS, 지원 브라우저 Edge · Firefox · Chrome · Safari (최신 안정 버전)
   - 데이터: 브라우저 선호 언어와 맞는 PDF, 없으면 첫 업로드 문서 · Web Account Manager를 쓰는 Windows 데스크톱 앱(예: Teams)은 앱 언어가 아니라 운영체제 언어로 약관을 표시 · 방화벽 허용 목록이 있으면 tokenprovider.termsofuse.identitygovernance.azure.com · myaccount.microsoft.com · account.activedirectory.windowsazure.com 추가 필요 · EdgeHTML·Trident 같은 레거시 엔진은 테스트·지원 대상이 아님
   - 해설: 사용자는 약관 문서를 읽고 수락 또는 거부를 선택합니다
6. [판단] 사용자가 수락했는가?
   - 주체: 사용자
   - 위치: Entra 약관 화면의 수락 · 거부 버튼
   - 데이터: 수락 또는 거부 선택 · 대화형 로그인에서만 가능 (PowerShell 비대화형 불가) · 한 번 수락한 약관은 취소(unaccept)할 방법이 없음
   - 해설: 거부하면 앱에 들어갈 수 없고 다시 로그인해 수락해야 합니다
   - 예 → 7
   - 아니오 → [차단] 차단 — 약관을 수락하기 전에는 접근 불가
7. [처리] 수락 기록 저장
   - 주체: Entra ID
   - 위치: Entra ID › 조건부 액세스 › 약관 › Accepted / Declined 수 (일 1회 집계) · 사용자는 myaccount.microsoft.com › Settings & Privacy › Privacy › Organization's notice › View에서 수락한 약관을 다시 볼 수 있음
   - 데이터: agreementAcceptance 생성 · 각 사용자 동의가 감사 로그의 Policy 범주 Accept Terms Of Use 활동(거부는 Decline Terms Of Use)으로 기록됨 · 수락·거부 수와 사용자별 내역은 약관이 존재하는 동안 보존되나 감사 로그 보관은 문서 FAQ 기준 30일
   - 해설: 누가 어떤 버전에 언제 동의했는지 사용자별 이력으로 남습니다
8. [끝] 요구 충족 — 토큰 발급과 기록
   - 주체: 로그
   - 위치: 모니터링 및 상태 › 로그인 로그 (성공 항목 · 적용된 조건부 액세스 정책)
   - 데이터: SigninLogs appliedConditionalAccessPolicies (약관 포함) · 성공 항목
   - 해설: 나머지 요구까지 채우면 토큰이 발급되고 로그에 결과가 남습니다. 한 번 수락한 사용자는 이후 로그인에서 같은 약관을 다시 보지 않습니다 (만료 설정이 없을 때)
- 시나리오: 예 :: 이미 수락 기록이 있어 바로 요구 충족
- 시나리오: 아니오 ▸ 예 :: 수락 기록이 없어 약관을 보여 주고 수락해 충족
- 시나리오: 아니오 ▸ 아니오 :: 수락 기록이 없고 사용자가 거부해 차단

> 교육 포인트: 약관은 문서와 동의 기록을 관리하고, 강제는 조건부 액세스의 "약관 동의 요구" 컨트롤이 맡습니다. 약관만 만들고 정책에 연결하지 않으면 아무도 막히지 않습니다.
>
> 주의: 조건부 액세스 정책은 서비스 계정에 적용할 수 없어 약관 대상에서 제외해야 합니다. 온보딩 · 복구 사용자 작업에서는 약관 컨트롤이 지원되지 않습니다.
>
> 출처: https://learn.microsoft.com/entra/identity/conditional-access/terms-of-use
>
> 출처: https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-grant
>
> 출처: https://learn.microsoft.com/entra/identity/conditional-access/policy-all-users-require-terms-of-use
>
> 출처: https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-report-only
>
> 출처: https://learn.microsoft.com/graph/api/agreement-list-acceptances
>
> 출처: https://learn.microsoft.com/entra/identity/monitoring-health/reference-audit-activities

### L3 · A · 약관 수명 주기 — 버전 · 재동의 · 만료

#### L4 · 새 버전 업로드 → 재동의 선택 → 만료 계산 → 세션 만료 때 다시 동의

1. [시작] 관리자가 약관 PDF 새 버전 업로드
   - 주체: 관리자
   - 위치: Entra ID › 조건부 액세스 › 약관 (Terms of use) › {약관} › 약관 편집 (Edit terms) › 해당 언어 행의 작업 열 업데이트 (Update) › 오른쪽 패널에서 PDF 업로드 › 추가 (Add)
   - 데이터: agreement 파일 새 버전 (기존 문서는 수정 불가, 버전으로 보관) · 편집 가능한 항목은 Name · Display name · 펼쳐 읽기 옵션 · 문서 업데이트 · 언어 추가뿐이며 그 밖의 설정(기기별 동의·만료 등)을 바꾸려면 새 약관을 만들어야 함 · 최신 버전은 Document 열에 표시
   - 해설: 약관 문서는 직접 고칠 수 없고 새 PDF를 올려 버전을 늘립니다
2. [판단] "재동의 필요"를 켰는가?
   - 주체: 관리자
   - 위치: 문서 업데이트 창 › Require reaccept (재동의 필요) 토글
   - 데이터: 업로드 시 선택하는 reaccept 여부 · 켜면 대상 리소스에 다음 번 접근할 때 새 버전 수락을 요구
   - 해설: 새 버전을 기존 동의자에게도 다시 받을지 고르는 선택입니다
   - 예 → 3
   - 아니오 → 4
3. [처리] 기존 동의를 새 버전 기준으로 무효화
   - 주체: Entra ID
   - 위치: 약관 상세 개요의 수락 수 (일 1회 갱신)
   - 데이터: 현재 버전 수락 수 초기화 (이전 이력은 CSV에 보존)
   - 해설: 모든 사용자가 새 버전에 다시 동의해야 접근할 수 있게 되지만, 이미 로그인한 사용자는 현재 세션이 끝난 뒤에야 안내를 받습니다
   - 다음 → 5
4. [처리] 기존 동의 유지 — 새 사용자만 새 버전 확인
   - 주체: Entra ID
   - 위치: 약관 수락 저장소 (서비스 내부)
   - 데이터: 이전 동의 상태 유지 · 아직 동의하지 않았거나 만료된 사용자만 새 버전 표시
   - 해설: 이미 동의한 사용자는 방해하지 않습니다
   - 다음 → 5
5. [처리] 동의 만료 계산 — 일정 기준 또는 N일 기준
   - 주체: Entra ID
   - 위치: 약관 설정 › Expire consents · Duration before re-acceptance required (days)
   - 데이터: 만료 시작일 · 빈도 (예: 1월 1일 · 매월) 또는 재동의 필요 기간 일 수 · 매월 1일 기준이면 1월 1일·1월 15일 수락자 모두 2월 1일에 만료되고, 30일 기준이면 1월 1일 수락자는 1월 31일, 1월 15일 수락자는 2월 14일에 만료
   - 해설: 일정 기준은 모두 같은 날 만료되고 N일 기준은 사용자별 수락일부터 셉니다. 두 설정을 함께 쓸 수도 있지만 보통 하나만 씁니다
6. [판단] 사용자의 세션이 만료됐는가?
   - 주체: Entra ID
   - 위치: 조건부 액세스 정책 › 세션 (Session) 컨트롤의 로그인 빈도 설정 · 세션 토큰 수명
   - 데이터: 동의 만료나 재동의 필요 여부와 무관하게 세션이 만료된 사용자만 재동의 안내를 받음
   - 해설: 동의가 만료돼도 사용자는 세션이 끝난 뒤에야 다시 안내를 받습니다. 즉시 재동의가 반드시 필요하면 약관을 삭제 후 다시 만들거나 새 약관을 만드는 방법을 씁니다
   - 예 → 7
   - 아니오 → [끝] 기존 세션 유지 — 세션 만료 뒤 재동의
7. [처리] 새 로그인에서 약관 화면 재표시
   - 주체: 사용자
   - 위치: Entra 약관 화면
   - 데이터: 새 버전 PDF · 수락 선택 · 새 약관을 추가로 만든 경우 대상 사용자는 로그아웃 후 다시 로그인해야 새 요구를 충족
   - 해설: 만료된 동의 또는 재동의 필요 버전이면 약관 화면이 다시 나옵니다
8. [끝] 새 수락 기록 — 이전 버전 이력 보존
   - 주체: 로그
   - 위치: Entra ID › 조건부 액세스 › 약관 › Languages and version history (언어 및 버전 기록) › See previous versions (이전 버전 보기, 문서 이름을 눌러 해당 버전 다운로드) · Accepted/Declined 숫자 선택 › Current State 드롭다운 All 또는 Version 드롭다운 · 개별 사용자는 줄임표(…) › View History
   - 데이터: 사용자별 수락 · 거부 · 만료 이력 · 수락·거부 수와 내역은 약관이 존재하는 동안 보존 · 약관 삭제 · 테넌트의 P1/P2 라이선스 상실 · 테넌트 삭제 시 수락 기록 삭제
   - 해설: 어느 버전에 누가 언제 동의했는지 이력이 남습니다. 이전 버전 열람은 Security Reader 이상으로 가능합니다
- 시나리오: 예 ▸ 예 :: 재동의 필요를 켜고 세션 만료로 재동의 기록
- 시나리오: 예 ▸ 아니오 :: 재동의 필요를 켰지만 세션이 살아 기존 세션 유지
- 시나리오: 아니오 ▸ 예 :: 재동의 필요 없이 세션 만료로 약관 다시 수락
- 시나리오: 아니오 ▸ 아니오 :: 재동의도 세션 만료도 없어 기존 세션 유지

> 교육 포인트: "재동의 필요"를 켜도 사용자의 현재 세션이 끝나기 전에는 새 버전이 뜨지 않습니다. 반드시 바로 받아야 하면 새 약관을 만드는 방식을 검토합니다.
>
> 주의: 상세 개요의 동의 수는 하루에 한 번 갱신되고, 감사 로그는 보관 기간이 짧아(약 30일) 수락 수와 차이가 날 수 있습니다. 전체 이력은 CSV로 내보내 확인합니다.
>
> 출처: https://learn.microsoft.com/entra/identity/conditional-access/terms-of-use

### L3 · B · 적용 대상과 범위 — 앱 · 게스트 · 기기별 동의

#### L4 · 대상 정책 정하기 → 게스트 · 기기 구분 → 여러 약관은 하나씩 수락

1. [시작] 약관을 적용할 사용자와 앱 범위 결정
   - 주체: 관리자
   - 위치: Entra ID › 조건부 액세스 › 정책 › 할당 (Assignments) › 사용자 · 대상 리소스 (Target resources)
   - 데이터: conditions.users · applications (현대 인증을 쓰는 엔터프라이즈 앱) · 진입점별로 걸 수 있음: Azure Information Protection 앱(보호 문서 첫 접근 전) · Microsoft Intune Enrollment 앱(기기 등록 전) · B2B 초대 수락
   - 해설: 특정 앱이나 그룹에만 다른 약관을 거는 세밀한 정책을 만들 수 있습니다
2. [처리] 조건부 액세스 정책에 약관 연결
   - 주체: 관리자
   - 위치: 정책 › 액세스 제어 › 권한 부여 › 약관 (약관 여러 개 선택 가능)
   - 데이터: grantControls.termsOfUse[] · 같은 사용자·앱에 여러 약관을 걸려면 대상별로 정책을 여러 개 만듦
   - 해설: 대상별로 약관을 하나씩 연결하는 정책을 여러 개 만듭니다
3. [판단] 로그인한 사용자가 B2B 게스트인가?
   - 주체: Entra ID
   - 위치: 사용자 개체 (Entra ID › 사용자)
   - 데이터: userType = Guest · 게스트 계정 존재 여부
   - 해설: 게스트에게는 초대 사용 과정에서 약관이 표시됩니다
   - 예 → 4
   - 아니오 → 5
4. [처리] 게스트 — 초대 사용 흐름에서 약관 표시
   - 주체: 사용자
   - 위치: B2B 초대 수락 화면 (invitation redemption)
   - 데이터: 게스트 계정이 있는 경우에만 약관 표시 (계정 없는 SharePoint 외부 공유 수신자는 미표시) · 기기별 동의는 B2B 사용자에게 지원되지 않음
   - 해설: 게스트 계정이 만들어지는 순간 약관을 받는 것이 가장 이른 시점입니다
   - 다음 → 7
5. [판단] "모든 기기에서 사용자 동의"를 켰는가?
   - 주체: Entra ID
   - 위치: 약관 설정 › Require users to consent on every device
   - 데이터: agreement.isPerDeviceAcceptanceRequired (등록된 기기만 가능 · B2B 미지원) · 기기별 동의를 쓰지 않는 테넌트에서는 Edge에서 로그인마다 약관이 뜨는 사례가 있으며, 작업 프로필을 Edge 프로필과 동기화하면 PRT 기반 SSO로 수락 이력이 인식됨
   - 해설: 켜면 사용자가 새 기기를 쓸 때마다 다시 동의해야 합니다
   - 예 → 6
   - 아니오 → 7
6. [처리] 기기 ID 단위로 동의 기록
   - 주체: 디바이스
   - 위치: 등록된 기기 (필요 시 앱 추가 설치)
   - 데이터: 수락 기록에 deviceId · deviceDisplayName · deviceOSType · deviceOSVersion 포함 · Intune Enrollment 앱은 제외
   - 해설: 같은 사용자라도 기기마다 동의 기록이 따로 생깁니다
7. [처리] 여러 약관 — 하나씩 차례로 수락
   - 주체: 사용자
   - 위치: Entra 약관 화면 (약관마다 한 번에 하나)
   - 데이터: 정책별 약관 목록 · 수락 순서 · Intune 약관 및 조건(terms and conditions)을 함께 쓰면 Entra 약관과 둘 다 수락해야 함
   - 해설: 여러 약관 대상이면 정책마다 약관을 하나씩 수락해야 모두 충족됩니다
8. [끝] 정책별 수락 기록 — 거부 시 접근 차단
   - 주체: 로그
   - 위치: Entra ID › 조건부 액세스 › 약관 › 약관별 Accepted / Declined 수 · View audit logs
   - 데이터: 약관별 수락 · 거부 수 · 거부한 사용자는 앱 접근 불가 (다시 로그인해 수락하면 접근 가능)
   - 해설: 약관마다 수락 현황이 따로 집계되어 정책별 준수 여부를 증명할 수 있습니다
- 시나리오: 예 :: 게스트는 여러 약관을 정책별로 수락
- 시나리오: 아니오 ▸ 예 :: 게스트 아닌 사용자는 기기 ID 단위로 동의 기록
- 시나리오: 아니오 ▸ 아니오 :: 기기 동의 없이 정책별 약관 수락만 기록

> 교육 포인트: Intune 등록, Azure Information Protection 보호 문서 접근, B2B 초대처럼 서로 다른 진입점마다 약관을 걸 수 있습니다.
>
> 주의: 기기별 동의는 B2B 사용자를 지원하지 않고 Intune Enrollment 앱도 지원하지 않습니다. Edge에서 약관이 매번 뜬다면 작업 프로필을 Edge 프로필과 동기화해 SSO가 되게 안내합니다. iOS/iPadOS 자동 기기 등록에서는 Setup Assistant 안에서 약관을 읽을 수 없고, 등록 후 Company Portal 웹사이트나 앱에서 읽을 수 있습니다.
>
> 출처: https://learn.microsoft.com/entra/identity/conditional-access/terms-of-use
>
> 출처: https://learn.microsoft.com/entra/identity/conditional-access/policy-all-users-require-terms-of-use
