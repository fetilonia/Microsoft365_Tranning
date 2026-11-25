#### 그룹 · session · 세션
- 섹션: 세션
- 선택: 다중
- 위치: 보호 › 조건부 액세스 › 정책 › 새 정책 만들기 › 액세스 제어 › 세션 (Entra ID > Conditional Access > Policies > New policy > Access controls > Session) [확인 필요: 한글 UI 문구]
- 소개: 허용 컨트롤 충족 후 앱 내 경험·세션 수명·토큰 동작·프록시 제어를 바꾸는 컨트롤 묶음입니다.
- 평가: Phase 2에서 차단과 허용 컨트롤 요구가 모두 충족된 뒤 세션 컨트롤(앱 적용 제한·Defender for Cloud Apps·토큰 수명)이 적용됩니다. 보고 전용 정책은 세션 컨트롤을 집행하지 않습니다.
- 출처: https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-policies;https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-session;https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-report-only

##### 옵션 · s-app-restrictions · 앱 적용 제한 사용
- 소개: 리소스 앱이 디바이스 상태에 따라 제한된 세션을 직접 제공하게 합니다
- 위치: 보호 › 조건부 액세스 › 정책 › 새 정책 만들기 › 액세스 제어 › 세션 › 앱 적용 제한 사용(Use app enforced restrictions) [확인 필요: 한글 UI 문구]
- 동작: Entra가 선택한 앱(Exchange Online·SharePoint Online)에 디바이스 정보(준수·조인 여부)를 전달하고, 앱이 그 정보로 전체 또는 제한된 세션을 직접 제공합니다. 제한 수준은 앱 쪽 설정이 정합니다.
- 사용자 경험: 비관리 디바이스의 SharePoint는 웹 전용(다운로드·인쇄·동기화 불가)이며 사이트 상단에 제한된 웹 액세스 안내가 보입니다. OWA는 첨부 파일 보기·다운로드가 앱 정책대로 제한됩니다.
- 미충족 시: 디바이스가 비관리·비준수면 앱이 제한된 경험을 제공합니다. 지원 앱이 아니면 효과가 없습니다. 앱 쪽 제한 설정은 앱 관리자가 따로 정해야 합니다.
- 지원 주체: 사용자 [확인 필요: 게스트·워크로드 ID 지원 여부]
- 제약·주의: Exchange Online·SharePoint Online 전용입니다. 앱 쪽 설정(SharePoint 비관리 디바이스 액세스, OWA 사서함 정책)이 함께 필요합니다. 지원 OS·브라우저 조합이 아니면 관리 디바이스도 제한됩니다. Entra ID P1 이상.
- 로그: appliedConditionalAccessPolicies의 enforcedSessionControls에 앱 적용 제한 항목이 기록됩니다(Graph 예시 값: Require app enforced controls) [확인 필요: 포털 표기].
- 노드 제목: 앱 적용 제한 전달
- 노드 보조: 디바이스 상태를 앱에 넘겨 앱이 제한된 세션을 제공
- 해설: Entra가 디바이스 상태를 Exchange·SharePoint에 넘기면 앱이 전체 또는 제한된 웹 세션을 정합니다.
- 주체: Entra ID, 앱
- 데이터: 디바이스 준수·조인 상태, 대상 앱(EXO·SPO), 앱 쪽 제한 설정
- 출처: https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-session;https://learn.microsoft.com/sharepoint/control-access-from-unmanaged-devices;https://learn.microsoft.com/security/zero-trust/zero-trust-identity-device-access-policies-workloads

##### 옵션 · s-mdca · 조건부 액세스 앱 제어 사용(Defender for Cloud Apps)
- 소개: 세션을 Defender for Cloud Apps 리버스 프록시로 보내 실시간 제어합니다
- 위치: 보호 › 조건부 액세스 › 정책 › 새 정책 만들기 › 액세스 제어 › 세션 › 조건부 액세스 앱 제어 사용(Use Conditional Access App Control) [확인 필요: 한글 UI 문구]
- 동작: Entra가 세션을 Defender for Cloud Apps로 라우팅하고, 프록시에서 접근·세션 정책(다운로드 차단, 레이블 요구, 업로드 검사 등)을 실시간 적용합니다. 내장 모니터링 전용·다운로드 차단 또는 사용자 지정 정책을 고릅니다.
- 사용자 경험: Edge는 주소창 자물쇠 아이콘의 브라우저 내 보호를 받고, 다른 브라우저는 URL에 .mcas.ms 접미사가 붙는 프록시로 이동합니다. 차단된 다운로드는 다운로드 제한 안내가 나옵니다.
- 미충족 시: 세션 컨트롤은 대화형 브라우저 세션에서만 적용됩니다. 비대화형 네이티브 클라이언트는 적용되지 않으므로 브라우저만 허용하는 액세스 정책을 함께 두어야 우회를 막습니다.
- 지원 주체: 사용자, 게스트
- 제약·주의: 세션 컨트롤은 브라우저 전용(최신 Edge·Chrome·Firefox·Safari)이며 Teams 데스크톱 앱은 미지원, TLS 1.2+ 필요. 앱 온보딩 필요(Entra 앱은 자동). Entra ID P1 이상과 Defender for Cloud Apps 라이선스.
- 로그: enforcedSessionControls에 앱 제어 항목이 기록됩니다 [확인 필요: 로그인 로그 표기 문자열]. 세션 활동과 정책 일치는 Defender for Cloud Apps 활동 로그에서 봅니다.
- 노드 제목: 앱 제어 프록시 세션 적용
- 노드 보조: Defender for Cloud Apps 프록시로 접근·세션 정책 실행
- 해설: 세션이 리버스 프록시로 라우팅되어 다운로드 차단 같은 세션 정책이 실시간으로 적용됩니다.
- 주체: Entra ID, 앱
- 데이터: 대상 앱, 세션 정책, 브라우저·클라이언트 종류, 디바이스 상태
- 출처: https://learn.microsoft.com/defender-cloud-apps/proxy-intro-aad;https://learn.microsoft.com/defender-cloud-apps/session-policy-aad;https://learn.microsoft.com/defender-cloud-apps/apps-manual-onboarding-with-microsoft-entra-id;https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-session

##### 옵션 · s-frequency · 로그인 빈도
- 소개: 마지막 인증 후 일정 시간이 지나면 다시 로그인하게 합니다
- 위치: 보호 › 조건부 액세스 › 정책 › 새 정책 만들기 › 액세스 제어 › 세션 › 로그인 빈도(Sign-in frequency) › 주기적 재인증 또는 매번(Every time)
- 동작: 마지막 인증 시각 이후 설정 기간(시간·일)을 넘기면 재인증을 요구합니다. 미설정 기본은 90일 롤링 창이며, 매번(Every time)은 세션이 평가될 때마다 재인증합니다. 조인 디바이스는 PRT 갱신 시각을 기준으로 봅니다.
- 사용자 경험: 기간이 지난 뒤 다음 상호작용에서 재로그인(MFA 포함) 프롬프트가 나타납니다. 브라우저 백그라운드 작업은 다음 사용자 상호작용까지 집행이 미뤄지고, 매번 방식도 5분 안에는 다시 묻지 않습니다.
- 미충족 시: 재인증을 마치지 못하면 토큰이 발급되지 않아 리소스에 접근할 수 없습니다.
- 지원 주체: 사용자 [확인 필요: 게스트·워크로드 ID 지원 여부]
- 제약·주의: OAuth2·OIDC 앱(Office 웹·EXO·SPO·Teams 웹·Azure 포털 등)에서 동작. MFA 없는 매번 설정은 로그인 루프 위험. Remember MFA 병용 시 예기치 않은 프롬프트. Private Access는 매번 미지원.
- 로그: enforcedSessionControls에 로그인 빈도 항목이 기록됩니다 [확인 필요: 문자열]. What If 도구 결과에도 인증 세션 관리 컨트롤이 표시됩니다.
- 노드 제목: 로그인 빈도 적용
- 노드 보조: 최근 인증 시각과 비교해 재인증 여부 결정
- 해설: 최근 인증 시각이 설정한 빈도를 넘기면 재로그인을 요구하고, 아니면 기존 세션을 이어 갑니다.
- 주체: Entra ID, 사용자
- 데이터: 최근 인증 시각, PRT 갱신 시각, 설정 빈도(시간·일·매번), 클라이언트 앱
- 출처: https://learn.microsoft.com/entra/identity/conditional-access/concept-session-lifetime;https://learn.microsoft.com/entra/identity/conditional-access/howto-conditional-access-session-lifetime;https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-session

##### 옵션 · s-persistent · 영구 브라우저 세션
- 소개: 브라우저를 닫았다 열어도 로그인 상태를 유지할지 정합니다
- 위치: 보호 › 조건부 액세스 › 정책 › 새 정책 만들기 › 액세스 제어 › 세션 › 영구 브라우저 세션(Persistent browser session) [확인 필요: 한글 UI 문구]
- 동작: 인증 세션 토큰(쿠키)의 지속 여부를 정합니다. 모든 탭이 한 세션 토큰을 공유하므로 대상 리소스를 모든 리소스로만 지정할 수 있고, 같은 사용자에게는 회사 브랜딩의 로그인 유지 설정보다 우선합니다.
- 사용자 경험: 미구성 기본값은 개인 디바이스 사용자에게 인증 후 로그인 유지(Stay signed in?) 프롬프트를 보여 줍니다. CA 정책의 영구 브라우저 세션 설정은 같은 사용자에 대한 회사 브랜딩의 Stay signed in? 설정을 재정의합니다. 정책 적용 시 별도 프롬프트 표시 여부는 [확인 필요].
- 미충족 시: 브라우저 세션에만 적용됩니다. 네이티브 앱·비브라우저 흐름에는 효과가 없어 해당 클라이언트 토큰은 영향받지 않습니다.
- 지원 주체: 사용자 [확인 필요: 게스트·워크로드 ID 지원 여부]
- 제약·주의: 모든 리소스 대상 전용. 지속 쿠키는 CA 재평가 없이 토큰 만료까지 쓰일 수 있어 보안 위험. 옵션 값(항상/안 함) 이름·로그인 빈도 및 디바이스 ID와의 상호작용 [확인 필요].
- 로그: enforcedSessionControls에 영구 브라우저 세션 항목이 기록됩니다 [확인 필요: 문자열]. What If 도구 결과에도 이 컨트롤이 표시됩니다.
- 노드 제목: 영구 브라우저 세션 적용
- 노드 보조: 세션 쿠키 지속 여부를 정책이 결정
- 해설: 브라우저를 닫아도 로그인 쿠키를 남길지 정책이 정하며, 모든 탭이 같은 세션 토큰을 공유합니다.
- 주체: Entra ID, 사용자
- 데이터: 브라우저 세션 쿠키, 대상 리소스(모든 리소스), 정책의 지속 설정값
- 출처: https://learn.microsoft.com/entra/identity/conditional-access/howto-conditional-access-session-lifetime;https://learn.microsoft.com/entra/identity/conditional-access/concept-session-lifetime;https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-session

##### 옵션 · s-cae · 연속 액세스 평가 사용자 지정
- 소개: 연속 액세스 평가(CAE)를 끄거나 위치 정책을 엄격 적용합니다
- 위치: 보호 › 조건부 액세스 › 정책 › 새 정책 만들기 › 액세스 제어 › 세션 › 연속 액세스 평가 사용자 지정(Customize continuous access evaluation) [확인 필요: 한글 UI 문구]
- 동작: CAE는 기본 사용 중이며 이 컨트롤로 사용 안 함(Disable) 또는 위치 정책 엄격 적용(미리 보기)을 고릅니다. CAE 세션 토큰은 최대 28시간이며 중요 이벤트·정책 변화 시 리소스가 클레임 챌린지로 철회합니다.
- 사용자 경험: 평소엔 보이지 않습니다. 리소스가 401과 클레임 챌린지를 보내면 클라이언트가 토큰 캐시를 건너뛰고 Entra에서 재평가해 재로그인 또는 차단됩니다. 엄격 모드는 차단 안내가 표시됩니다.
- 미충족 시: CAE 미지원 클라이언트·리소스는 기본 1시간 액세스 토큰 모델로 동작합니다. Office 웹 앱은 정책이 있으면 토큰 수명이 1시간으로 줄어듭니다.
- 지원 주체: 사용자 (CAE는 게스트 계정 미지원)
- 제약·주의: Disable은 모든 리소스·조건 없음일 때만 가능. 엄격 모드는 미리 보기이며 Entra·리소스 IP가 모두 전용·열거 가능해야 하고 GSA 경유 비M365 앱은 정상 위치도 차단. 지원 리소스 EXO·SPO·Teams·Graph.
- 로그: 로그인 로그의 Is CAE Token 필터와 세부 정보에서 CAE 여부를 봅니다(대화형·비대화형 탭 중 한 요청만 true). 엄격 모드 차단은 IP address (seen by resource) 열로 확인합니다.
- 노드 제목: CAE 동작 사용자 지정
- 노드 보조: 중요 이벤트·위치 변화를 토큰 만료 전에 반영
- 해설: 리소스가 이벤트와 위치를 실시간 점검하고, 위반 시 클레임 챌린지로 클라이언트를 재인증시킵니다.
- 주체: Entra ID, 앱
- 데이터: 중요 이벤트, 리소스가 본 IP, IP 기반 명명된 위치, CAE 지원 클라이언트 여부
- 출처: https://learn.microsoft.com/entra/identity/conditional-access/concept-continuous-access-evaluation;https://learn.microsoft.com/entra/identity/conditional-access/concept-continuous-access-evaluation-strict-enforcement;https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-session;https://learn.microsoft.com/entra/identity/conditional-access/howto-continuous-access-evaluation-troubleshoot

##### 옵션 · s-resilience · 복원력 기본값 사용 안 함
- 소개: Entra 장애 중 실시간 판정이 안 되면 기존 세션도 차단합니다
- 위치: 보호 › 조건부 액세스 › 정책 › 새 정책 만들기 › 액세스 제어 › 세션 › 복원력 기본값 사용 안 함(Disable resilience defaults) [확인 필요: 한글 UI 문구]
- 동작: 기본(사용 중)은 장애 시 Backup Authentication Service가 기존 세션 토큰을 재발급하고 실시간 평가 불가 조건은 세션 시작 때 수집한 데이터로 판정합니다. 이 옵션을 켜면 평가 불가 시 거부합니다.
- 사용자 경험: 평상시에는 변화가 없습니다. Entra 장애 중 기존 세션이 만료돼 토큰을 새로 받아야 할 때 정책 범위 로그인이 차단되어 앱에 접근하지 못합니다.
- 미충족 시: 장애 중 실시간 평가가 불가한 조건(그룹·역할, 위험, 국가/지역, 인증 강도)이 걸린 정책은 접근이 거부됩니다. 새 세션은 원래 허용되지 않습니다.
- 지원 주체: 사용자 (Backup Authentication Service는 게스트 인증 미지원)
- 제약·주의: 그룹·역할 대상 정책에서 끄면 범위 밖 사용자도 장애 중 차단돼 전체 복원력이 떨어집니다. Microsoft는 사용 유지를 권장하며 드라이런·시뮬레이션은 불가합니다.
- 로그: 로그인 로그에서 Token issuer type == Microsoft Entra Backup Auth 필터로 Backup Authentication Service 발급 토큰을 확인합니다.
- 노드 제목: 장애 시 복원력 규칙 적용
- 노드 보조: 평가 불가 조건을 세션 시작 데이터로 볼지 거부할지
- 해설: 장애 중에는 이 설정에 따라 세션 시작 데이터로 판정하거나, 실시간 평가가 안 되면 거부합니다.
- 주체: Entra ID
- 데이터: 장애 여부, 기존 세션 여부, 세션 시작 시 수집 데이터, 평가 불가 조건
- 출처: https://learn.microsoft.com/entra/identity/conditional-access/resilience-defaults;https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-session

##### 옵션 · s-token-protection · 토큰 보호(로그인 세션 바인딩)
- 소개: 로그인 세션 토큰을 디바이스에 묶어 도난 토큰 재생을 막습니다
- 위치: 보호 › 조건부 액세스 › 정책 › 새 정책 만들기 › 액세스 제어 › 세션 › 로그인 세션에 토큰 보호 필요(Require token protection for sign-in sessions) [확인 필요: 한글 UI 문구]
- 동작: 등록된 디바이스에 암호학적으로 바인딩된 로그인 세션 토큰(PRT 등)만 지원 앱의 리소스 요청에서 허용합니다. 훔친 토큰은 다른 디바이스에서 재생할 수 없습니다.
- 사용자 경험: 호환 앱·등록 디바이스면 보이지 않습니다. 시행 전 등록된 디바이스는 한 번 재인증과 등록 업그레이드가 필요하고, 비호환 앱·디바이스는 차단됩니다. 게스트는 원인이 불명확한 오류를 봅니다.
- 미충족 시: 바인딩되지 않은 요청은 차단되고 로그에 unbound와 상태 코드(1002 디바이스 상태 없음, 1003 레거시 등록, 1004 등록 방식 미지원)가 남습니다 [확인 필요: 1004 정확한 의미].
- 지원 주체: 사용자, 게스트(홈 테넌트에서 디바이스 요건 충족 시)
- 제약·주의: 네이티브 앱 대상(Windows·iOS/iPadOS·macOS; Apple은 미리 보기 병기 [확인 필요: GA 여부]). 브라우저 앱은 ARM 한정 미리 보기. 리소스 EXO·SPO·Teams. Office 365 앱 그룹 선택 금지. Entra ID P1.
- 로그: enforcedSessionControls·sessionControlsNotSatisfied의 SignInTokenProtection, tokenProtectionStatusDetails의 signInSessionStatus·StatusCode.
- 노드 제목: 토큰 디바이스 바인딩 검증
- 노드 보조: 바인딩된 로그인 세션 토큰만 지원 앱에 허용
- 해설: 로그인 세션 토큰이 등록 디바이스에 바인딩됐는지 검증하고, 아니면 리소스 접근을 막습니다.
- 주체: Entra ID, 디바이스
- 데이터: 토큰 바인딩 여부, 디바이스 등록 상태, 클라이언트 앱, 플랫폼, 대상 리소스
- 출처: https://learn.microsoft.com/entra/identity/conditional-access/concept-token-protection;https://learn.microsoft.com/entra/identity/conditional-access/deployment-guide-token-protection-windows;https://learn.microsoft.com/entra/identity/conditional-access/deployment-guide-token-protection-apple;https://learn.microsoft.com/entra/identity/conditional-access/deployment-guide-token-protection-web-apps

##### 옵션 · s-gsa-profile · Global Secure Access 보안 프로필 사용
- 소개: CA 정책에 Global Secure Access 보안 프로필을 연결해 적용합니다
- 위치: 보호 › 조건부 액세스 › 정책 › 새 정책 만들기 › 액세스 제어 › 세션 › Global Secure Access 보안 프로필 사용(Use Global Secure Access security profile) [확인 필요: 한글 UI 문구]
- 동작: 보안 프로필(웹 콘텐츠 필터링 정책 묶음)을 사용자·정책 컨텍스트에 연결합니다. 프로필은 액세스 토큰으로 전달되어 Global Secure Access를 지나는 인터넷 트래픽에 적용됩니다.
- 사용자 경험: 사용자 프롬프트는 없고 Global Secure Access를 거치는 인터넷 접속에 필터링 결과(허용·차단)가 적용됩니다 [확인 필요: 차단 화면 문구]. 새 프로필 반영에 60~90분이 걸릴 수 있습니다.
- 미충족 시: 정책이 일치하지 않으면 연결한 프로필이 적용되지 않습니다. 단 기준(baseline) 보안 프로필은 CA 연결 없이 모든 인터넷 트래픽에 최저 우선순위로 적용됩니다.
- 지원 주체: 사용자 [확인 필요: 게스트·워크로드 ID 지원 여부]
- 제약·주의: 대상 리소스에 모든 인터넷 리소스(Global Secure Access)를 선택. Explicit Forward Proxy(미리 보기)는 이 그룹에 포함되지 않음. Microsoft Entra Internet Access는 Microsoft Entra Suite에 포함되거나 독립형으로 제공되며, 사용자는 Microsoft Entra ID P1 또는 P2 라이선스가 필요합니다.
- 로그: Global Secure Access 네트워크 트래픽 로그에는 적용된 정책 정보가 포함됩니다. 조건부 액세스 로그인 로그의 정확한 표기 문자열은 [확인 필요: 포털 필드명].
- 노드 제목: 보안 프로필 연결
- 노드 보조: 인터넷 트래픽에 적용할 필터링 정책 묶음을 선택
- 해설: 조건에 맞는 사용자에게 토큰으로 보안 프로필을 전달해 인터넷 트래픽에 필터링 정책을 적용합니다.
- 주체: Entra ID, Global Secure Access
- 데이터: 연결된 보안 프로필, 필터링 정책 우선순위, 대상 리소스(인터넷 트래픽)
- 출처: https://learn.microsoft.com/entra/global-secure-access/concept-internet-access;https://learn.microsoft.com/entra/global-secure-access/overview-what-is-global-secure-access;https://learn.microsoft.com/entra/global-secure-access/how-to-configure-web-content-filtering;https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-session

> 교육 포인트: 조건부 액세스는 ‘누가(할당) → 무엇에(대상 리소스) → 어떤 조건에서 → 어떻게 통제(허용·세션)’의 if-then 문입니다. 정책은 모두 평가되고, 걸린 정책의 요구는 AND로 합쳐집니다.
>
> 교육 포인트: 명명된 위치(NamedLocation)는 공인 IP·국가 같은 일반 네트워크 신호이고, 규격(준수) 네트워크는 Global Secure Access가 평가합니다. 같은 ‘위치’ 조건이어도 신호의 출처가 다릅니다.
>
> 주의: 이 시뮬레이터는 문서 기반 교육용 모델입니다. 실제 평가는 테넌트 설정·라이선스·클라이언트 지원 여부에 따라 달라지므로, 도입 전에는 보고 전용 모드와 What If 도구로 확인합니다.
>
> 출처: https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-policies
>
> 출처: https://learn.microsoft.com/entra/identity/conditional-access/what-if-tool
