## L2 · 암호 재설정 (SSPR) — 셀프서비스 암호 재설정

- 설정(Control Plane): SSPR 사용 대상 (없음 · 선택 · 모두) · 필요한 방법 수 · 등록 요구 | 암호 쓰기 저장 (하이브리드)
- 강제(Enforcement): Entra 암호 재설정 서비스 (passwordreset.microsoftonline.com) | 등록된 인증 방법으로 본인 확인 후 재설정
- 증적(Evidence): 감사 로그 범주 Self-Service Password Management | 인증 방법 활동 보고서 · GET /v1.0/reports/authenticationMethods/userRegistrationDetails
- 메뉴(Admin Center): 보호 > 암호 재설정 (문서 기준 경로: Entra ID > Password reset)
- 라이선스(License): 클라우드 사용자의 SSPR 재설정은 Entra ID P1·P2 또는 Microsoft 365 Business Standard 이상 · 암호 쓰기 저장(하이브리드)은 P1·P2 또는 Microsoft 365 Business Premium(Business Standard·Basic은 쓰기 저장 불가) · 아는 암호를 바꾸는 클라우드 사용자 암호 변경은 Free도 가능 [확인 필요: 고객의 SKU 보유·대상 사용자 할당 및 쓰기 저장 자격]

### L3 · 0 · 기능 상태 전이 — 헬프데스크 의존 → SSPR 구성 → 셀프 재설정

#### L4 · ⓪ 비활성 — 암호 분실 시 관리자가 처리한다

1. [시작] 사용자가 암호를 잊었거나 계정이 잠김
   - 주체: 사용자
   - 위치: 로그인 화면 → 계정에 액세스할 수 없나요? (Can't access your account?)
   - 데이터: 로그인 실패 · 스마트 잠금 상태 — 기본값은 잘못된 암호 10회 실패 시 1분 잠금이며 이후 실패하면 잠금 시간이 늘어남 · 마지막 잘못된 암호 해시 3개는 같은 암호 반복으로 보고 카운터를 올리지 않음
   - 해설: 사용자가 로그인하지 못해 업무가 멈춥니다. 관리자는 스마트 잠금으로 잠긴 클라우드 계정을 잠금 시간이 끝나기 전에 풀어 줄 수도 있습니다
2. [처리] SSPR 비대상이라 관리자 문의로 안내
   - 주체: Entra ID
   - 위치: passwordreset.microsoftonline.com (aka.ms/sspr)
   - 데이터: SSPR 사용 설정 = 없음(None) → "관리자에게 문의" 화면 · 관리자 역할 계정의 기본 SSPR 사용 여부는 문서마다 표현이 달라 [확인 필요: 관리자 계정 기본 사용 여부]
   - 해설: 대상이 아니면 포털이 스스로 재설정할 길을 열어 주지 않습니다. 대상 여부는 사용자 개별 설정이 아니라 SSPR 사용 설정(없음·선택·모두)과 선택 그룹 멤버십으로 정해집니다
3. [처리] 헬프데스크에 요청 — 사람이 신원 확인
   - 주체: 사용자
   - 위치: 전화 · 메일 · 티켓
   - 데이터: 사번 · 생년월일 같은 확인 정보 (표준 방법 없음)
   - 해설: 확인 방법이 사람마다 달라 사칭 요청에 취약합니다. 이 단계는 Entra 기능이 아니라 조직이 정한 절차입니다
4. [처리] 관리자가 암호를 대신 재설정
   - 주체: 관리자
   - 위치: ID › 사용자 › 모든 사용자 › 사용자 선택 › 암호 재설정 (Entra ID › Users › All users › Reset password) — 재설정은 Password Administrator · User Administrator · Helpdesk Administrator 중 하나가 수행
   - 데이터: 임시 암호 생성 · 감사 로그 "Reset password (by admin)" (OnPremisesAgent: None = 클라우드만 · Microsoft Entra Connect · CloudSync = 쓰기 저장 에이전트 경유)
   - 해설: 관리자가 임시 암호를 만들어 사용자에게 따로 전달합니다. 하이브리드 사용자는 쓰기 저장이 켜져 있으면 Entra 관리 센터에서 한 관리자 재설정이 온-프레미스에도 반영되지만 Microsoft 365 관리 센터에서 한 재설정은 쓰기 저장되지 않습니다
5. [끝] 대기 시간과 사회공학 공격 위험이 남음
   - 주체: 로그
   - 데이터: 임시 암호가 메신저·메일로 전달되어 노출 · 요청 건수만큼 관리자 업무 증가
   - 해설: 느리고, 사칭에 속아 암호가 넘어갈 수 있습니다

#### L4 · ① 구성 — 대상 · 방법 수 · 등록 · 쓰기 저장을 정한다

1. [시작] 관리자가 Entra Admin Center에 로그인
   - 주체: 관리자
   - 위치: entra.microsoft.com — Authentication Policy Administrator 이상 (쓰기 저장 설정은 Hybrid Identity Administrator)
   - 데이터: 역할 할당 (roleAssignments) · 사전 요건: SSPR 재설정에는 Entra ID P1 이상 또는 Microsoft 365 Business Standard 이상
   - 해설: SSPR 정책을 바꿀 수 있는 역할로 로그인합니다. 테스트는 관리자가 아닌 일반 사용자로 해야 합니다. 관리자 역할 계정은 별도의 강화(2단계) 정책을 따르기 때문입니다
2. [처리] SSPR 사용 대상 선택
   - 주체: 관리자
   - 위치: Entra ID › 암호 재설정 (Password reset) › 속성 (Properties) › 셀프 서비스 암호 재설정 사용 (Self service password reset enabled): 없음(None) / 선택(Selected) / 모두(All)
   - 데이터: 선택 시 관리 센터에서는 그룹 1개만 지정 가능(중첩 그룹은 지원) · 시범은 테스트 그룹부터
   - 해설: 먼저 일부 그룹에서 시험하고 전체로 넓히는 방식을 권장합니다. 관리 센터에서는 그룹을 1개만 지정할 수 있으므로 여러 그룹이 필요하면 상위 그룹에 중첩해 지정합니다
3. [처리] 재설정에 필요한 방법 수 지정
   - 주체: 관리자
   - 위치: Entra ID › 암호 재설정 › 인증 방법 (Authentication methods) › 재설정에 필요한 방법 수 (Number of methods required to reset): 1 또는 2
   - 데이터: 방법 수 = 2 이면 사용자가 등록한 방법이 2개 이상이어야 재설정 가능 · 방법 수를 1에서 2로 올리면 등록 1개 사용자는 재설정 불가
   - 해설: 수가 늘수록 안전하지만 사용자가 등록해야 할 정보가 늘어납니다. Authenticator 앱 · 소프트웨어 OATH · 하드웨어 OATH 토큰은 SSPR에서 방법 1개로만 세므로 셋을 섞어 2개를 채울 수 없습니다
4. [처리] 사용자에게 허용할 방법 선택
   - 주체: 관리자
   - 위치: 암호 재설정 › 인증 방법 › 사용자에게 제공되는 방법 (Methods available to users) · 방법 관리는 Entra ID › 인증 방법 (Authentication methods) › 정책 (Policies)의 인증 방법 정책으로 이관
   - 데이터: SSPR에서 쓸 수 있는 방법: Microsoft Authenticator 푸시 알림 · 소프트웨어 OATH 토큰 · 하드웨어 OATH 토큰(미리 보기) · SMS · 음성 통화 · 이메일 OTP · 허용 목록에 없는 방법은 등록해도 재설정에 쓸 수 없음 · 레거시 MFA·SSPR 정책에서의 방법 관리는 2025년 9월 30일부터 불가
   - 해설: 관리자 역할 계정은 별도의 강화 규칙(2단계 정책, 보안 질문 금지, 평가판·무료 버전은 사무실·모바일 음성 통화 금지)을 따르며 이 정책은 바꿀 수 없습니다. 방법을 바꾸면 필요한 정보가 없는 사용자는 SSPR을 쓸 수 없게 됩니다
5. [처리] 등록 요구와 재확인 주기 설정
   - 주체: 관리자
   - 위치: Entra ID › 암호 재설정 › 등록 (Registration) › 로그인할 때 사용자에게 등록 요구 (Require users to register when signing in) = 예 · 재확인 일수 (Number of days before users are asked to re-confirm) 180
   - 데이터: 재확인 0~730일 (0 = 안 함) · 재확인은 등록 요구를 켠 경우에만 사용 가능 · 180은 튜토리얼 예시값 · 등록 안내는 SSPR 대상이며 로그인하는 사용자에게만 뜨고 대화형 세션당 한 번 표시
   - 해설: 로그인 때 등록 화면을 띄워 미리 정보를 받아 둡니다. 오래된 연락처 때문에 재설정이 실패하지 않도록 정보를 주기적으로 다시 확인하게 합니다
6. [처리] 알림 설정
   - 주체: 관리자
   - 위치: Entra ID › 암호 재설정 › 알림 (Notifications) › 암호 재설정 시 사용자에게 알림 (Notify users on password resets?) = 예 · 다른 관리자가 암호를 재설정하면 모든 관리자에게 알림 (Notify all admins when other admins reset their password?) = 예 · 사용자 지정(Customization) › 헬프데스크 링크 사용자 지정 = 예
   - 데이터: 사용자 알림은 Entra에 저장된 기본·대체 메일(없으면 UPN)로 발송, 관리자 알림은 Global Administrator의 기본 메일로 발송 · 발신 주소(공용 클라우드) msonlineservicesteam@microsoft.com · msonlineservicesteam@microsoftonline.com · 스팸함 확인 필요
   - 해설: 재설정이 일어나면 본인과 관리자에게 알려 오남용을 빨리 알아챕니다. 사용자 알림은 본인 외 다른 사람에게는 가지 않으며, 헬프데스크 이메일·URL을 지정하면 "관리자에게 문의" 링크가 그곳을 가리킵니다
7. [처리] 하이브리드는 암호 쓰기 저장 켜기
   - 주체: 관리자
   - 위치: Entra ID › 암호 재설정 › 온-프레미스 통합 (On-premises integration) › 온-프레미스 디렉터리에 암호 쓰기 (Write back passwords to your on-premises directory) = 예 · 암호 재설정 없이 계정 잠금 해제 허용 (Allow users to unlock accounts without resetting their password) = 예 · Cloud Sync를 쓰면 Write back passwords with Microsoft Entra Connect cloud sync 선택
   - 데이터: 선행 조건: Entra Connect 마법사 선택적 기능(Optional features) "Password writeback" 또는 Cloud Sync 에이전트 1.1.977.0 이상(Set-AADCloudSyncPasswordWritebackConfiguration) · AD 계정에 Reset password · Change password · lockoutTime 쓰기 · pwdLastSet 쓰기 · Unexpire Password 확장 권한 부여(권한 반영에 최대 1시간 이상) · 암호 재설정을 하루에 여러 번 허용하려면 AD 최소 암호 사용 기간 0
   - 해설: 클라우드에서 바꾼 암호가 온-프레미스 AD에도 반영되게 합니다. 이 설정을 끄면 페더레이션·통과 인증·암호 해시 동기화 사용자는 SSPR로 암호를 재설정할 수 없고, 기본적으로 암호 재설정 때 계정 잠금도 함께 풀리지만 잠금 해제만 분리하려면 위 옵션을 켭니다. Cloud Sync 쓰기 저장은 21Vianet에서 지원되지 않습니다
8. [끝] 저장 — 정책 변경이 감사 로그에 남음
   - 주체: 관리자
   - 위치: 각 설정 페이지의 저장 (Save) · 감사 로그는 Entra ID › 사용자(Users) › 감사 로그(Audit logs)에서 서비스 = Self-service Password Management 필터 (조회는 Reports Reader 이상)
   - 데이터: 감사 로그 "Self-service password reset policy changes" (이전 값 · 새 값 · 실행자 · 대상 속성) · 보고 데이터는 조직이 보고(Reporting) 탭이나 감사 로그를 한 번 열어야 수집을 시작함
   - 해설: 누가 어떤 값으로 바꿨는지 기록됩니다. 수집을 시작하기 전의 활동은 보고서에 없으므로 SSPR을 켜기 전에 감사 로그를 한 번 열어 둡니다

#### L4 · ② 활성 — 사용자가 직접 본인 확인 후 재설정한다

1. [시작] 사용자가 "계정에 액세스할 수 없나요?"를 선택
   - 주체: 사용자
   - 위치: https://aka.ms/sspr (passwordreset.microsoftonline.com)
   - 데이터: 포털 언어 = 브라우저 로캘 (?mkt= 로 지정 가능, 예 ?mkt=es-us) · Microsoft 365가 지원하는 언어로 현지화
   - 해설: 로그인 화면이나 직접 주소에서 재설정을 시작합니다. 개인 Microsoft 계정(Hotmail·Outlook.com 등)으로 게스트 초대된 사용자는 Entra SSPR을 쓸 수 없습니다
2. [처리] 사용자 ID 입력과 캡차 통과
   - 주체: 사용자
   - 위치: SSPR 포털 첫 화면
   - 데이터: UPN · 캡차 응답
   - 해설: 자동화된 열거를 막고 계정이 유효한지 확인합니다. 이어서 Entra ID가 사용자 계정 유효성 · 소속 조직 · 암호 관리 위치(클라우드/온-프레미스)를 확인합니다
3. [판단] SSPR 대상이며 필요한 방법을 등록했는가?
   - 주체: Entra ID
   - 위치: 재설정 포털 사전 검사 · 등록 현황은 인증 방법 활동 보고서
   - 데이터: SSPR 사용 설정 · 등록된 방법 수 대 필요한 방법 수 · userRegistrationDetails.isSsprEnabled(대상 여부) · isSsprRegistered(필요한 수만큼 등록) · isSsprCapable(둘 다 충족)
   - 해설: 대상 아니거나 등록이 모자라면 재설정할 수 없습니다. 필요 방법이 1개면 사용 가능한 방법 데이터 1개, 2개면 2개 이상이 있어야 하며 부족하면 관리자에게 문의하라고 안내합니다. 관리자 역할 계정은 항상 2단계(2 gate) 정책을 따릅니다
   - 예 → 4
   - 아니오 → [차단] 재설정 불가 — 관리자에게 문의 안내
4. [판단] 암호를 온-프레미스에서 관리하는가?
   - 주체: Entra ID
   - 위치: 암호 관리 위치 판정(Entra ID 내부)
   - 데이터: 페더레이션 · 통과 인증 · 암호 해시 동기화 사용자 여부
   - 해설: 온-프레미스가 원본인 암호는 쓰기 저장이 없으면 클라우드에서 못 바꿉니다. 클라우드 전용 사용자는 곧바로 인증 관문 단계로 갑니다
   - 예 → 5
   - 아니오 → 6
5. [판단] 암호 쓰기 저장 서비스가 동작 중인가?
   - 주체: Entra ID
   - 위치: 쓰기 저장 서비스 상태 · 문제 해결은 Entra Connect 서버 Application 이벤트 로그(원본 PasswordResetService · ADSync)
   - 데이터: 쓰기 저장 설정 · 서비스 연결 상태 · 지원 환경: 암호 해시 동기화 · 통과 인증 · AD FS · 단계적 롤아웃(Staged rollout) 사용자는 Cloud Sync에서만 지원
   - 해설: 서비스가 없거나 멈춰 있으면 지금은 재설정이 안 된다고 안내합니다. 쓰기 저장 서비스 계정은 보호 그룹(예: 도메인·엔터프라이즈 관리자) 소속 사용자의 암호를 바꿀 수 없습니다
   - 예 → 6
   - 아니오 → [차단] 재설정 불가 — 쓰기 저장 미구성 또는 중단
6. [판단] 등록된 방법으로 인증 관문을 통과했는가?
   - 주체: 사용자
   - 위치: 본인 확인 화면 (코드 입력 · 앱 승인 · 전화 응답)
   - 데이터: 감사 로그 "Self-service password reset flow activity progress" (관문별 진행) · 재설정 시도·특정 관문 사용·전화번호 확인이 24시간 안에 합계 5회를 넘으면 "Blocked from self-service password reset" 기록 후 24시간 제한
   - 해설: 정해진 방법 수만큼 순서대로 확인을 통과해야 합니다. 5회 제한은 관리자 계정에도 적용됩니다. 잠금 계정 사용자가 "암호를 잊었습니다"를 고르면 잠금 시간이 0초로 초기화되고, "암호를 압니다"를 고르면 잠금 타이머가 계속됩니다
   - 예 → 7
   - 아니오 → [차단] 거부 — 24시간 내 5회 초과 시 SSPR 차단
7. [판단] 새 암호가 정책을 통과했는가?
   - 주체: Entra ID
   - 위치: 새 암호 입력 화면
   - 데이터: 암호 보호 검사 (금지 목록 · 사용자 이름 포함 여부) + 암호 복잡성 · 클라우드 정책: 8~256자 · 대문자·소문자·숫자·기호 중 3종류 이상 · 유니코드 문자 불가 · 실패 사유 FuzzyPolicyViolationInvalidPassword(너무 흔하거나 약한 암호로 금지됨)
   - 해설: 쉬운 암호는 이 단계에서 걸러집니다. 하이브리드는 온-프레미스 AD 정책(복잡성·기록·최소 길이·필터)이 쓰기 저장 때 추가로 적용되지만 포털은 온-프레미스 정책을 보여 주지 않고 암호 강도 표시도 나오지 않습니다. 직전 암호는 재설정(SSPR)에서는 다시 쓸 수 있으나 변경에서는 쓸 수 없습니다
   - 예 → 8
   - 아니오 → [차단] 거부 — 금지 암호·복잡성 위반, 다른 암호 요구
8. [처리] 새 암호 저장 — 하이브리드는 AD에도 반영
   - 주체: Entra ID
   - 위치: 클라우드 자격 증명 저장소
   - 데이터: 클라우드 자격 증명 갱신 · 하이브리드는 쓰기 저장 경로 (L3 B) · 잠금 상태 사용자는 "암호를 잊었습니다" 선택 시 잠금 시간 초기화 · 계정 잠금 해제만 허용 옵션(Allow users to unlock accounts without resetting their password)을 켜면 암호 변경 없이 AD 계정만 풀 수 있음
   - 해설: 저장과 동시에 사용자는 새 암호로 로그인할 수 있습니다. 페더레이션 사용자는 원본이 온-프레미스이므로 SSPR은 온-프레미스 암호만 바꾸며, 암호 해시 동기화가 2분 주기라 "암호가 재설정되었습니다" 메시지 뒤 최대 2분을 기다려야 클라우드에서 새 암호가 통합니다
9. [처리] 알림 메일 발송
   - 주체: Entra ID
   - 위치: SSPR 알림 메일 발송 서비스
   - 데이터: 사용자 알림 메일(기본·대체 메일, 없으면 UPN) · 관리자 계정이면 Global Administrator에게도 알림 · 발신 msonlineservicesteam@microsoft.com 등
   - 해설: 본인이 하지 않은 재설정이면 바로 알아챌 수 있게 합니다. 메일이 안 오면 스팸 설정을 확인합니다
10. [끝] 재설정 활동 감사 기록
   - 주체: 로그
   - 위치: 모니터링 및 상태 › 감사 로그 (범주: Self-Service Password Management) — 조회는 Reports Reader 이상
   - 데이터: "Reset password (self-service)" · 상태(Success / Failure) · 시각 · 사용자 · 실패 사유 FuzzyPolicyViolationInvalidPassword · 잠금 없이 해제하면 "Unlock user account (self-service)"
   - 해설: 누가 언제 재설정했는지 감사 로그에 남습니다. 보고 데이터는 조직이 감사 로그나 보고 탭을 한 번 열어 옵트인한 뒤부터 수집됩니다
- 시나리오: 예 ▸ 예 ▸ 예 ▸ 예 ▸ 예 :: 온-프레미스 관리 암호를 쓰기 저장으로 저장하고 알림
- 시나리오: 예 ▸ 예 ▸ 예 ▸ 예 ▸ 아니오 :: 온-프레미스 관리 암호가 정책에 걸려 거부
- 시나리오: 예 ▸ 예 ▸ 예 ▸ 아니오 :: 온-프레미스 관리인데 인증 관문 실패로 거부
- 시나리오: 예 ▸ 예 ▸ 아니오 :: 암호 쓰기 저장 서비스 중단으로 재설정 불가
- 시나리오: 예 ▸ 아니오 ▸ 예 ▸ 예 :: 클라우드 관리 암호를 정책 통과 후 저장하고 알림
- 시나리오: 예 ▸ 아니오 ▸ 예 ▸ 아니오 :: 클라우드 관리 암호가 정책에 걸려 거부
- 시나리오: 예 ▸ 아니오 ▸ 아니오 :: 클라우드 관리인데 인증 관문 실패로 거부
- 시나리오: 아니오 :: 대상 아니거나 방법 미등록이라 재설정 불가

> 교육 포인트: SSPR 성공의 열쇠는 사전 등록입니다. 등록 요구와 재확인 주기를 켜 두면 사용자가 급할 때 막히지 않습니다.
>
> 주의: 관리자 역할을 가진 계정은 필요한 방법 수가 2개로 고정되는 2단계 정책(보안 질문 금지, 변경 불가)을 따르며, 인증 방법 정책과 독립적으로 동작합니다. 이 정책은 테넌트 authorizationPolicy의 allowedToUseSSPR = false로 끌 수 있고 반영에 최대 60분이 걸립니다. 방법 관리는 레거시 SSPR 정책에서 인증 방법 정책으로 옮겨져 2025년 9월 30일부터 레거시 정책에서는 관리할 수 없습니다.
>
> 출처: https://learn.microsoft.com/entra/identity/authentication/tutorial-enable-sspr
>
> 출처: https://learn.microsoft.com/entra/identity/authentication/concept-sspr-howitworks
>
> 출처: https://learn.microsoft.com/entra/identity/authentication/howto-sspr-reporting
>
> 출처: https://learn.microsoft.com/entra/identity/authentication/concept-sspr-policy
>
> 출처: https://learn.microsoft.com/entra/identity/authentication/concept-sspr-licensing
>
> 출처: https://learn.microsoft.com/entra/identity/authentication/concept-sspr-writeback
>
> 출처: https://learn.microsoft.com/entra/identity/authentication/concept-password-ban-bad
>
> 출처: https://learn.microsoft.com/entra/identity/authentication/howto-password-smart-lockout
>
> 출처: https://learn.microsoft.com/graph/api/resources/userregistrationdetails

### L3 · A · 등록 — 재설정에 쓸 인증 정보를 미리 받는다

#### L4 · 로그인 중 등록 요구 → 등록 → 재확인

1. [시작] 사용자가 모던 인증으로 앱에 로그인
   - 주체: 사용자
   - 위치: Microsoft 365 · Entra Admin Center · 액세스 패널 · 페더레이션 앱 · Entra ID를 쓰는 사용자 지정 앱
   - 데이터: 로그인 요청 (브라우저·모던 인증)
   - 해설: 등록 요구는 모던 인증 로그인 때 확인됩니다. 이 등록 안내는 이미 로그인한 사용자의 연결을 끊지 않으며, 같은 대화형 세션에서는 한 번만 표시됩니다
2. [판단] 등록 요구가 켜져 있고 등록이 부족한가?
   - 주체: Entra ID
   - 위치: Entra ID › 암호 재설정 › 등록 › 로그인할 때 사용자에게 등록 요구
   - 데이터: 등록 요구 설정 · userRegistrationDetails.isSsprRegistered · 대상은 SSPR이 켜진 사용자(관리자 포함)
   - 해설: 대상 사용자이면서 아직 필요한 수만큼 등록하지 않았는지 봅니다. 이미 MFA용 방법을 등록한 사용자는 보안 정보를 보기 전에 먼저 MFA를 수행해야 합니다
   - 예 → 3
   - 아니오 → [끝] 등록 안 시킴 — 사용자가 https://aka.ms/ssprsetup 에서 자발 등록 가능
3. [처리] 보안 정보 등록 화면 표시
   - 주체: Entra ID
   - 위치: https://aka.ms/setupsecurityinfo (결합 보안 정보 등록, Interrupt mode) · 사용자가 직접 관리하는 화면은 https://aka.ms/mysecurityinfo (Manage mode) · 액세스 패널 프로필 탭의 "암호 재설정 등록(Register for password reset)" 링크
   - 데이터: 취소해도 다음 로그인마다 다시 표시 · 결합 등록 문서는 SSPR 정책만 켠 경우 사용자가 건너뛸 수 있다고도 설명 [확인 필요: 건너뛰기 가능 범위]
   - 해설: 사용자는 한 화면에서 SSPR용 인증 정보를 등록합니다. MFA 등록을 강제하는 정책이 함께 있으면 MFA 방법과 SSPR 방법을 한 번에 등록하고, SSPR만 강제하면 SSPR 방법만 등록합니다
4. [처리] 인증 방법 정보 입력
   - 주체: 사용자
   - 위치: 보안 정보 등록 › 방법 추가 (Add method) · "다른 방법을 설정하겠습니다" 선택
   - 데이터: 휴대폰 번호(최대 2개) · 이메일 · Authenticator 앱(최대 5개) · 다른 인증 앱(최대 5개) (관리자가 허용한 방법만)
   - 해설: 허용된 방법만 목록에 나타납니다. 정책이 요구하는 최소한의 방법만 가장 안전한 것부터 보여 주며, SSPR이 2개를 요구하고 MFA 등록도 강제하면 첫 방법은 MFA 방법이어야 하고 둘째는 이메일 같은 SSPR 전용 방법도 고를 수 있습니다. 가상 전화번호는 음성·SMS에 쓸 수 없습니다
5. [처리] 방법 소유 확인 — 코드 검증
   - 주체: 사용자
   - 위치: 문자·메일로 받은 코드 입력 또는 앱 승인
   - 데이터: 일회용 코드 · methodsRegistered
   - 해설: 입력한 번호·메일이 실제 본인 것인지 확인한 뒤 저장합니다
6. [판단] 필요한 방법 수를 채웠는가?
   - 주체: Entra ID
   - 데이터: 등록된 방법 수 대 정책의 필요 방법 수 (1 또는 2) · Authenticator와 OATH 토큰은 SSPR에서 방법 1개로 계산
   - 해설: 정책이 2개를 요구하면 2개를 등록할 때까지 완료되지 않습니다
   - 예 → 7
   - 아니오 → 4
7. [끝] 등록 완료 기록
   - 주체: 로그
   - 위치: 모니터링 및 상태 › 감사 로그 · 보호 › 인증 방법 › 활동 · 결합 등록 이벤트는 감사 로그의 보안(Security) › 인증 방법(Authentication Methods) 범주에도 남음
   - 데이터: 감사 로그 "User registered for self-service password reset" · isSsprRegistered = true · 등록 실패 로그가 남아도 계정에 이미 올바른 번호가 있으면(검증 전이라도) 그것으로 재설정할 수 있음
   - 해설: 등록 완료 시점이 감사 로그와 등록 보고서에 남고 이 흐름은 여기서 끝납니다. 시간이 지난 뒤의 재확인은 아래 두 번째 시나리오, 필요 방법 수를 올린 경우는 세 번째 시나리오에서 다룹니다
- 시나리오: 예 ▸ 예 :: 등록이 부족해 방법 수를 채우고 등록 완료
- 시나리오: 아니오 :: 등록 요구 대상이 아니라 등록 없이 진행

> 교육 포인트: 등록은 "재설정 전에 끝내 놓는 일"이고 재설정은 "그 정보로 본인임을 증명하는 일"입니다. 둘을 따로 보면 등록률이 낮을 때 왜 헬프데스크 부하가 안 줄어드는지 설명됩니다.
>
> 예시: 필요한 방법 수를 1에서 2로 올렸는데 한 개만 등록한 사용자는 재설정 시 "관리자에게 문의" 안내를 받습니다.
>
> 출처: https://learn.microsoft.com/entra/identity/authentication/concept-sspr-howitworks
>
> 출처: https://learn.microsoft.com/entra/identity/authentication/howto-sspr-reporting
>
> 출처: https://learn.microsoft.com/entra/identity/authentication/concept-registration-mfa-sspr-combined

#### L4 · 재확인 주기가 도래한 로그인 → 등록 정보 확인 · 수정

1. [시작] 등록을 마친 사용자가 시간이 지난 뒤 다시 로그인
   - 주체: 사용자
   - 위치: Microsoft 365 · Entra Admin Center · 액세스 패널 · 페더레이션 앱 · Entra ID를 쓰는 사용자 지정 앱
   - 데이터: 로그인 요청 (브라우저·모던 인증) · 마지막으로 등록 정보를 확인한 시점
   - 해설: 재확인은 사용자가 로그인해야 일어납니다. 로그인하지 않으면 묻지 않으므로 오래 접속하지 않은 사용자는 주기가 지나도 화면을 받지 못하다가 다음 로그인에서 받습니다
2. [판단] 등록 요구가 켜져 있고 재확인 일수가 0이 아닌가?
   - 주체: Entra ID
   - 위치: Entra ID › 암호 재설정 › 등록 › 로그인할 때 사용자에게 등록 요구 (Require users to register when signing in) · 재확인 일수 (Number of days before users are asked to re-confirm their authentication information) (0~730)
   - 데이터: 등록 요구 = 예 · 재확인 일수 > 0 · 허용값 0~730일 · 대상은 SSPR이 켜진 사용자와 관리자 계정
   - 해설: 재확인은 ‘로그인할 때 등록 요구’를 켠 경우에만 쓸 수 있고, 일수를 0으로 두면 재확인을 하지 않습니다. 등록 요구를 끄면 재확인 설정 자체를 쓸 수 없습니다
   - 예 → 3
   - 아니오 → [끝] 재확인 안 함 — 등록 요구가 꺼져 있거나 재확인 일수가 0
3. [판단] 마지막 확인 뒤 재확인 일수가 지났는가?
   - 주체: Entra ID
   - 위치: 사용자별 마지막 확인 시점 (Entra ID 내부) [확인 필요: 마지막 확인 시점이 기록되는 위치]
   - 데이터: 마지막 확인 시점 + 재확인 일수 (튜토리얼 예시 180일, 기본값은 문서에 명시되지 않음) 대 현재 시각
   - 해설: 주기가 도래한 로그인에서만 등록 정보 확인 화면이 나타납니다. SSPR이 방법을 둘 이상 요구하는 경우 사용자가 방법 하나를 삭제해도 재확인 일수가 도래하기 전까지는 확인을 요구받지 않습니다
   - 예 → 4
   - 아니오 → [끝] 주기 이내 — 재확인 화면 없이 로그인 진행
4. [처리] 등록 정보 확인 화면 표시
   - 주체: Entra ID
   - 위치: 로그인 중 등록 정보 확인 화면 (결합 보안 정보 등록의 SSPR 재확인(SSPR refresh) 시나리오) · 이미 MFA용 방법을 등록한 사용자는 이 화면에 들어가기 전에 먼저 MFA를 수행
   - 데이터: 현재 등록된 인증 방법 (휴대폰 번호 · 이메일 · Authenticator 앱) · 사용자가 맞다고 확인하거나 바꿀 수 있음
   - 해설: 오래된 번호·메일 때문에 재설정이 실패하는 일을 줄이려고 등록 정보가 아직 맞는지 묻습니다. 재설정 시점에 정보가 낡았으면 사용자가 계정을 풀거나 암호를 재설정하지 못할 수 있습니다
5. [판단] 등록된 정보가 아직 최신인가?
   - 주체: 사용자
   - 위치: 등록 정보 확인 화면
   - 데이터: 사용자가 정보를 그대로 확인할지 수정할지 선택
   - 해설: 번호나 메일이 바뀌었으면 고치고, 그대로면 확인만 합니다
   - 예 → 7
   - 아니오 → 6
6. [처리] 바뀐 방법을 수정하고 소유 확인
   - 주체: 사용자
   - 위치: 보안 정보 등록 › 방법 추가 · 변경 · 삭제 (Security info › Add / Change / Delete)
   - 데이터: 새 번호 · 메일 · 일회용 코드 · methodsRegistered · 수정 뒤 SSPR 필요 방법 수보다 적으면 재설정이 불가해짐
   - 해설: 새로 넣은 정보도 처음 등록할 때처럼 본인 것인지 코드로 확인한 뒤 저장합니다. 필요한 방법 수보다 적게 남기면 다음 SSPR 때 막히므로 필요 수를 유지해야 합니다
   - 다음 → 7
7. [처리] 재확인 완료 기록
   - 주체: 로그
   - 위치: 모니터링 및 상태 › 감사 로그 [확인 필요: 재확인 기록 이름]
   - 데이터: 확인 시점 갱신 · 수정했다면 변경된 방법 기록
   - 해설: 확인한 시점부터 다시 재확인 일수를 셉니다
8. [끝] 다음 주기까지 재확인 없음
   - 주체: Entra ID
   - 위치: 다음 로그인부터 적용
   - 데이터: 다음 재확인 시점 = 확인 시점 + 재확인 일수
   - 해설: 로그인은 정상 진행되고 정보는 최신 상태로 유지됩니다
- 시나리오: 예 ▸ 예 ▸ 예 :: 주기 도래 후 정보가 최신이라 재확인 완료
- 시나리오: 예 ▸ 예 ▸ 아니오 :: 주기 도래 후 바뀐 방법을 수정해 재확인
- 시나리오: 예 ▸ 아니오 :: 재확인 일수 미경과로 주기 이내 유지
- 시나리오: 아니오 :: 재확인 요구 꺼짐 또는 0일이라 재확인 안 함

> 교육 포인트: 재확인은 "등록 후 시간이 지나 낡은 정보"를 정기적으로 걸러 내는 장치입니다. 등록 요구를 꺼 두면 이 장치도 함께 꺼집니다.
>
> 주의: SSPR이 방법을 둘 이상 요구하는 경우, 사용자가 방법 하나를 삭제해도 재확인 일수가 도래하기 전까지는 확인을 요구받지 않습니다.
>
> 출처: https://learn.microsoft.com/entra/identity/authentication/concept-sspr-howitworks
>
> 출처: https://learn.microsoft.com/entra/identity/authentication/tutorial-enable-sspr
>
> 출처: https://learn.microsoft.com/entra/identity/authentication/concept-registration-mfa-sspr-combined

#### L4 · 필요한 방법 수를 올린 뒤 등록이 부족한 사용자의 로그인

1. [시작] 관리자가 필요 방법 수를 1에서 2로 올린 뒤, 1개만 등록한 사용자가 로그인
   - 주체: 사용자
   - 위치: 암호 재설정 › 인증 방법 › 재설정에 필요한 방법 수 (Entra ID › Password reset › Authentication methods)
   - 데이터: 등록 1개 · 필요 2개 → 재설정 불가 · 등록 1개 이상 + 필요 1개 → 가능 · 등록 2개 이상 + 필요 2개 → 가능
   - 해설: 정책을 바꾼 즉시 일부 사용자는 재설정을 쓸 수 없는 상태가 됩니다. 허용 방법 목록을 바꿔도 같은 일이 생깁니다(예: 보안 질문을 빼고 휴대폰·대체 이메일만 허용했는데 해당 정보가 없는 사용자). Authenticator·OATH 토큰은 SSPR에서 방법 1개로만 세므로 앱만 등록한 사용자는 필요 수 2를 채우지 못합니다
2. [판단] 등록 요구가 켜져 있고 등록이 부족한가?
   - 주체: Entra ID
   - 위치: Entra ID › 암호 재설정 › 등록 › 로그인할 때 사용자에게 등록 요구
   - 데이터: 등록 요구 설정 · 등록된 방법 수 대 필요 방법 수 · userRegistrationDetails.isSsprRegistered(필요 수만큼 등록 여부) = false
   - 해설: 등록 요구가 켜져 있으면 로그인할 때 부족한 만큼 등록하게 합니다
   - 예 → 3
   - 아니오 → [끝] 등록 안내 없음 — 재설정 시 “관리자에게 문의” 안내로 막힘
3. [처리] 부족한 방법 등록 화면 표시
   - 주체: Entra ID
   - 위치: https://aka.ms/setupsecurityinfo (결합 보안 정보 등록)
   - 데이터: 취소해도 다음 로그인마다 다시 표시 · 사용자가 화면을 닫아도 이미 로그인된 연결은 끊기지 않음
   - 해설: 두 번째 방법을 추가로 등록할 때까지 안내가 계속됩니다. 등록 안내는 SSPR 대상 사용자에게만 뜨며, 이미 MFA용 방법을 등록한 사용자는 먼저 MFA를 수행해야 이 화면에 들어갑니다
4. [처리] 추가 방법 입력과 소유 확인
   - 주체: 사용자
   - 위치: 보안 정보 등록 › 방법 추가
   - 데이터: 새 휴대폰 번호 · 이메일 · 일회용 코드 · methodsRegistered
   - 해설: 추가하는 방법도 코드 검증으로 본인 것인지 확인한 뒤 저장합니다
5. [끝] 등록 2개 이상 — 재설정 가능
   - 주체: 관리자
   - 위치: 인증 방법 활동 보고서(Authentication methods › Activity) · userRegistrationDetails
   - 데이터: 등록 2개 이상 + 필요 2개 → 재설정 가능 · isSsprCapable = true
   - 해설: 필요 방법 수를 올릴 때는 미리 알려 재등록을 안내해야 합니다. 변경 전에 등록 현황 보고서로 isSsprRegistered = false 사용자를 파악해 영향 범위를 확인합니다
- 시나리오: 예 :: 등록이 부족해 방법을 추가 등록하고 2개 이상 충족
- 시나리오: 아니오 :: 등록 요구에 걸리지 않아 안내 없이 진행

> 교육 포인트: 필요 방법 수를 올리면 등록이 모자란 사용자가 한꺼번에 재설정 불가가 됩니다. 변경 전에 등록 현황 보고서로 영향을 확인합니다.
>
> 출처: https://learn.microsoft.com/entra/identity/authentication/concept-sspr-howitworks
>
> 출처: https://learn.microsoft.com/graph/api/resources/userregistrationdetails

### L3 · B · 암호 쓰기 저장 — 클라우드 재설정이 온-프레미스 AD까지 가는 길

#### L4 · 하이브리드 사용자의 새 암호가 AD DS에 기록되기까지

1. [시작] 하이브리드 사용자가 클라우드에서 새 암호를 제출
   - 주체: 사용자
   - 위치: SSPR 포털 새 암호 화면 → 제출 (Submit)
   - 데이터: 평문 새 암호 (본인 확인 통과 후) · 지원 환경: 암호 해시 동기화 · 통과 인증 · AD FS 사용자
   - 해설: 본인 확인을 마친 뒤 새 암호를 보내는 단계입니다. 사용자의 일반 변경(자발·만료 강제 변경)·SSPR 재설정·Entra 관리 센터에서 한 관리자 재설정이 모두 쓰기 저장 대상입니다
2. [판단] 암호 쓰기 저장 서비스가 동작 중인가?
   - 주체: Entra ID
   - 위치: 쓰기 저장 서비스 상태 (Entra Connect 서버 Application 이벤트 로그, 원본 PasswordResetService)
   - 데이터: 쓰기 저장 서비스 상태 · 인바운드 방화벽 규칙은 필요 없고 아웃바운드 HTTPS 443만 사용 · 서비스 버스 접속 오류(이벤트 32002)나 온보딩 오류(32011)가 나면 *.servicebus.windows.net 으로의 TCP 443(온보딩은 9350-9354도)을 점검
   - 해설: 서비스가 멈춰 있으면 사용자에게 지금은 못 바꾼다고 알립니다. Entra Connect Sync와 Cloud Sync가 같은 도메인에 공존하면 그 도메인 사용자의 쓰기 저장은 모두 Cloud Sync 에이전트가 처리합니다
   - 예 → 3
   - 아니오 → [차단] 재설정 불가 안내 — 서비스 중단
3. [처리] 공개 키로 암호를 암호화
   - 주체: Entra ID
   - 위치: 클라우드 쪽(쓰기 저장 설정 시 만든 키 쌍)
   - 데이터: 쓰기 저장 설정 때 만든 공개 키(2048비트 RSA) · 암호화된 암호 페이로드 · 패키지 전체를 AES-GCM 256비트로 한 번 더 암호화 · 통신은 TLS/SSL · 키는 6개월마다, 또는 쓰기 저장을 껐다 켤 때마다 교체
   - 해설: 평문 암호는 클라우드에서 바로 암호화되어 전달됩니다
4. [처리] 테넌트 전용 Service Bus 릴레이로 HTTPS 전송
   - 주체: Entra ID
   - 위치: 설정 때 생성된 테넌트별 Service Bus 릴레이
   - 데이터: 릴레이 암호 (온-프레미스 설치만 아는 무작위 값) · 메시지는 1 KB 미만 · 암호 제출 1건당 메시지 2개(요청·결과) · 서비스 하트비트 5분마다 1개
   - 해설: 인바운드 포트를 열지 않고도 요청이 온-프레미스로 전달됩니다. 온-프레미스 서비스가 내려가 있으면 메시지는 릴레이에서 몇 분 뒤 만료·삭제됩니다
5. [처리] 온-프레미스 에이전트가 요청을 수신
   - 주체: 온프레미스
   - 위치: Entra Connect 서버 (Connect Sync) 또는 Microsoft Entra Connect 프로비저닝 에이전트(Cloud Sync, 버전 1.1.977.0 이상)
   - 데이터: 릴레이에서 깨어난 암호 재설정 엔드포인트의 보류 요청 · Cloud Sync 쓰기 저장은 21Vianet에서 지원되지 않음
   - 해설: 릴레이가 보류 요청을 알리면 서버가 요청을 꺼내 오고 개인 키로 복호화합니다
6. [처리] cloudAnchor로 AD 사용자 개체 조회
   - 주체: 온프레미스
   - 위치: Connect Sync 엔진 (커넥터 공간 · 메타버스)
   - 데이터: cloudAnchor 특성 · 동기화 규칙 Microsoft.InformADUserAccountEnabled.xxx 링크 · 조회 성공 조건: AD DS 커넥터 공간에 사용자 개체 존재 · 메타버스(MV) 개체와 연결 · Entra 커넥터 개체와 연결 · 위 링크 규칙이 연결에 존재
   - 해설: 포리스트가 여러 개여도 링크 규칙으로 정확한 AD 개체를 고릅니다. 같은 사용자 ID가 여러 도메인에 활성이면 중복 앵커 오류(HR 80230402)가 납니다
7. [처리] AD DS 암호 정책을 적용해 암호 설정
   - 주체: 온프레미스
   - 위치: AD DS 도메인 컨트롤러
   - 데이터: AD DS 복잡성 · 기록 · 최소 길이 · 최소 암호 사용 기간 · 암호 필터 정책 · AD DS SetPassword API 호출 · 커넥터 계정에 Reset password · Change password · lockoutTime 쓰기 · pwdLastSet 쓰기 · Unexpire Password(도메인 루트, 이 개체와 모든 하위 개체) 권한 · 도메인 컨트롤러에 LDAP_SERVER_POLICY_HINTS_OID 컨트롤이 켜져 있어야 하며 이를 켜려면 Windows Server 2016 이상이어야 한다고 문제 해결 문서가 설명(이벤트 6329)
   - 해설: 쓰기 저장은 온-프레미스 암호 정책도 그대로 적용합니다. 암호 해시 동기화를 쓰더라도 온-프레미스 정책이 클라우드 정책보다 약하면 온-프레미스 정책이 적용됩니다. 보호 그룹(도메인·엔터프라이즈 관리자 등) 사용자와 PASSWD_CANT_CHANGE 플래그 계정은 쓰기 저장이 실패합니다
8. [판단] AD DS가 새 암호를 수락했는가?
   - 주체: 온프레미스
   - 위치: Entra Connect 서버 Application 이벤트 로그 (원본 ADSync · PasswordResetService)
   - 데이터: 설정 성공 / 실패 결과 (정책 위반 · 권한 부족) · 실패 이벤트 31003(재설정) · 31008(변경) · 31011(관리자 재설정) · ADSync 6329(암호 기간·기록·복잡성·필터 제한)
   - 해설: 실패하면 클라우드에도 반영되지 않고 사용자에게 오류가 돌아갑니다. 쓰기 저장은 동기 작업이라 사용자가 즉시 결과를 받습니다
   - 예 → 9
   - 아니오 → [차단] 재설정 실패 — AD 정책 위반 또는 권한 부족
9. [끝] 성공 반환 · 양쪽에 반영 · 이벤트 기록
   - 주체: 로그
   - 위치: Entra Connect 서버 Application 이벤트 로그(원본 PasswordResetService) · 모니터링 및 상태 › 감사 로그
   - 데이터: 이벤트 31001(재설정 시작) · 31002(재설정 성공) · 31006·31007(변경 시작·성공) · 31009·31010(관리자 재설정 시작·성공) · 감사 로그 "Reset password (self-service)" · 이벤트 656·657은 쓰기 저장을 처음 켤 때 암호 변경이 없어도 암호 해시 재동기화로 발생할 수 있음
   - 해설: 사용자는 새 암호로 클라우드와 온-프레미스 모두 로그인합니다. 감사 로그의 OnPremisesAgent 값으로 Microsoft Entra Connect 경유인지 CloudSync 경유인지 구분됩니다
- 시나리오: 예 ▸ 예 :: 쓰기 저장 동작 중 AD DS 수락, 양쪽에 반영
- 시나리오: 예 ▸ 아니오 :: AD DS가 새 암호를 거부해 재설정 실패
- 시나리오: 아니오 :: 쓰기 저장 중단으로 재설정 불가 안내

> 교육 포인트: 쓰기 저장은 온-프레미스가 원본인 암호를 클라우드에서 바꿀 수 있게 해 주는 연결 통로입니다. 이것이 없으면 하이브리드 사용자는 SSPR을 쓸 수 없고 위험 사용자의 자기 해결도 막힙니다.
>
> 주의: 단계적 롤아웃(Staged rollout)에 속한 사용자는 Microsoft Entra Cloud Sync로 쓰기 저장할 때만 지원되고 Microsoft Entra Connect Sync 경유 쓰기 저장은 지원되지 않습니다. PowerShell(v1·v2)·Microsoft Graph로 사용자가 직접 암호를 재설정하는 경우와 Microsoft 365 관리 센터에서 관리자가 재설정하는 경우는 쓰기 저장되지 않습니다.
>
> 출처: https://learn.microsoft.com/entra/identity/authentication/concept-sspr-writeback
>
> 출처: https://learn.microsoft.com/entra/identity/authentication/tutorial-enable-sspr-writeback
>
> 출처: https://learn.microsoft.com/entra/identity/authentication/tutorial-enable-cloud-sync-sspr-writeback
>
> 출처: https://learn.microsoft.com/entra/identity/authentication/troubleshoot-sspr-writeback
