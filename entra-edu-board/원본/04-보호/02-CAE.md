## L2 · CAE — 위험 · 퇴사 시 세션 회수

- 설정(Control Plane): 기본으로 켜짐 (조건부 액세스 정책과 함께 자동 사용) | 정책 세션 컨트롤 "연속 액세스 평가 사용자 지정"으로 사용 안 함 · 엄격한 위치 적용(미리 보기)
- 강제(Enforcement): CAE 지원 리소스가 토큰 거부 (401 + claims challenge) | Exchange Online · SharePoint Online · Teams · Microsoft Graph (지원 앱 조합 한정)
- 증적(Evidence): 로그인 로그 "Is CAE Token" 필터 | IP address (seen by resource) 열 · CAE 인사이트 워크북
- 메뉴(Admin Center): 보호 > 조건부 액세스 > 정책 > 세션 > 연속 액세스 평가
- 라이선스(License): 중요 이벤트 평가는 조건부 액세스 정책 없이 모든 테넌트에서 사용 가능(지원 클라이언트·리소스 조합 한정) | 위치 정책 기반 평가와 정책 세션 컨트롤은 조건부 액세스(Entra ID P1 또는 Microsoft 365 Business Premium) 필요 [확인 필요: 고객의 SKU 보유·대상 사용자 할당]

### L3 · 0 · 기능 상태 전이 — 표준 토큰(1시간) → 위치 정책과 CAE 모드 구성 → 이벤트 즉시 반영

#### L4 · ⓪ 비활성 — CAE 미지원 클라이언트이거나 CAE를 끈 상태

1. [시작] CAE 미지원 클라이언트가 로그인
   - 주체: 앱
   - 위치: claims challenge를 처리하지 못하는 클라이언트 (Office 웹 앱 · cp1을 선언하지 않은 구형 앱 · 일부 Office 업데이트 채널 설정)
   - 데이터: client_capabilities에 cp1 없음 (토큰 요청에 xms_cc 클레임 요청이 없음). Semi-Annual Enterprise Channel의 Office는 DisableADALatopWAMOverride 또는 DisableAADWAM이 1이면 CAE가 지원되지 않음
   - 해설: 이 클라이언트는 CAE 세션을 받을 수 없습니다. 정책에서 Customize continuous access evaluation을 Disable로 지정한 사용자도 CAE 세션을 받지 않습니다
2. [처리] 표준 액세스 토큰 발급 — 기본 약 1시간
   - 주체: Entra ID
   - 위치: Entra ID 토큰 발급 (/token 응답)
   - 데이터: 액세스 토큰 수명 약 1시간 (구성 가능한 토큰 수명을 설정했다면 그 값). 갱신 시점에 Entra가 사용자 상태와 정책을 다시 확인
   - 해설: 일반 토큰이 발급되고 만료 때 갱신하며 정책이 다시 평가됩니다. Microsoft는 토큰 수명 단축도 시도했으나 사용자 경험과 안정성이 나빠지고 위험도 없애지 못해 CAE로 해결합니다
3. [처리] 중요한 변경 발생 — 토큰 만료 전
   - 주체: 관리자
   - 위치: Entra ID › Users › All users › {사용자} › Account status › Edit › Properties › Account enabled 해제 (Graph: PATCH /v1.0/users/{id}, PowerShell: Update-MgUser -AccountEnabled:$false) 또는 암호 재설정
   - 데이터: accountEnabled = false 또는 암호 재설정. 계정 비활성화만으로는 이미 발급된 액세스 토큰이 사라지지 않으며 사고 대응 절차는 비활성화와 세션 취소(Revoke sessions)를 함께 수행
   - 해설: 퇴사자 계정을 비활성화했지만 토큰은 아직 살아 있습니다
4. [처리] 리소스는 토큰만 확인 — Entra에 다시 묻지 않음
   - 주체: 리소스
   - 위치: 리소스 서비스의 토큰 검증 (Exchange Online · SharePoint Online 등)
   - 데이터: 토큰 서명 · 만료 시각만 검증 (CAE 지원 클라이언트와 리소스 조합이 아니므로 Entra의 회수 이벤트나 동기화된 위치 정책이 적용되지 않음)
   - 해설: 리소스는 만료 전까지 변경 사항을 알 방법이 없습니다
5. [끝] 토큰 만료까지 접근 유지 — 최대 약 1시간 노출
   - 주체: 로그
   - 위치: Entra ID › Monitoring & health › Sign-in logs (Is CAE Token 필터로 CAE 여부 확인)
   - 데이터: 만료 때 갱신 요청이 실패하면 SigninLogs에 실패 기록 (ResultType 0이 아닌 값). 갱신 토큰은 세션 취소로 무효화할 수 있지만 이미 발급된 액세스 토큰은 만료까지 유효
   - 해설: 만료 시점까지는 비활성 계정도 리소스를 계속 쓸 수 있습니다

#### L4 · ① 구성 — 위치 정책을 만들고 CAE 모드를 정한다

1. [시작] 관리자가 Entra Admin Center에 로그인
   - 주체: 관리자
   - 위치: entra.microsoft.com — Conditional Access Administrator 이상 (로그 · 워크북 조회는 Security Reader 이상)
   - 데이터: 역할 할당. CAE 인사이트 워크북은 Log Analytics 연동 필요, 위치 정책과 정책 세션 컨트롤은 조건부 액세스(Entra ID P1) 필요
   - 해설: CAE 설정은 조건부 액세스 정책 안에서 관리합니다. 중요 이벤트 평가는 조건부 액세스 정책이 없어도 모든 테넌트에서 동작합니다
2. [처리] CAE 기본 상태 확인 — 별도로 켤 필요 없음
   - 주체: 관리자
   - 위치: Entra ID › Conditional Access › Policies › 정책 › Access controls › Session › Customize continuous access evaluation
   - 데이터: 새 테넌트와 모든 사용자에게 명시적으로 켠 테넌트는 자동 사용(이관 불필요). 일부 사용자만 켰거나 미리 보기를 끈 테넌트는 옛 Security 메뉴의 CAE 설정이 회색으로 표시되고 Migrate로 정책 마법사를 열어 이관 (이때 Customize continuous access evaluation이 Disabled로 설정됨)
   - 해설: CAE는 조건부 액세스와 함께 자동으로 켜지며 세션 컨트롤로 사용자 지정합니다
3. [처리] IP 기반 명명된 위치 정의 — IPv4 · IPv6 모두
   - 주체: 관리자
   - 위치: Entra ID › Conditional Access › Named locations › IP 범위 위치 (Mark as trusted location). 변경은 Conditional Access Administrator 이상
   - 데이터: ipNamedLocation (ipRanges · isTrusted) — 모든 위치 정책의 IP 범위 합계가 5,000을 넘으면 위치 변경을 실시간 평가할 수 없고 1시간 CAE 토큰이 발급됨. IPv6는 CIDR 표기(예: 2001:db8::1/128), named location 최대 195개 · 위치당 IP 범위 2,000개
   - 해설: CAE는 IP 기반 위치만 인식하므로 Entra와 리소스가 보는 모든 출구 IP(IPv4 · IPv6 모두)를 넣습니다. 국가/지역 위치와 MFA 신뢰 IP는 CAE가 보지 못하고, 공유되거나 열거할 수 없는 출구 IP를 신뢰 위치에 넣으면 보안이 약해집니다
4. [처리] 위치 기반 정책 만들기 — 허용 IP 밖은 차단
   - 주체: 관리자
   - 위치: 보호 › 조건부 액세스 › 정책 › 새 정책 만들기 › 네트워크 (모든 위치 포함 · 신뢰할 수 있는 위치 제외) › 권한 부여 › 액세스 차단
   - 데이터: conditions.locations.includeLocations = All · excludeLocations = AllTrusted (Graph 값). 차단 정책이므로 비상 접근 계정 그룹을 제외하고 먼저 소수 사용자에게 적용
   - 해설: 이 위치 조건이 CAE 위치 적용의 근거가 되며 리소스에 동기화됩니다. 정책 변경이 리소스에 반영되기까지 최대 1일(일부 최적화 시나리오는 약 2시간)이 걸릴 수 있습니다
5. [처리] 세션 · 연속 액세스 평가 사용자 지정 — 모드 선택
   - 주체: 관리자
   - 위치: 새 정책 › Access controls › Session › Customize continuous access evaluation (Disable · Strictly enforce location policies(미리 보기))
   - 데이터: Graph 베타 sessionControls.continuousAccessEvaluation.mode (disabled · strictLocation · strictEnforcement; UI 선택지와 값의 대응은 [확인 필요: strictLocation과 strictEnforcement 중 UI의 Strictly enforce location policies에 해당하는 값]). Disable은 All resources를 선택하고 다른 조건이 없을 때만 가능하며 모든 사용자 또는 특정 사용자 · 그룹에 지정 가능
   - 해설: 안정된 네트워크라면 엄격 적용으로 허용 IP 밖 접근을 즉시 거부할 수 있습니다. 기본값인 표준 모드는 Entra가 허용 IP를 확인하면 리소스 IP가 달라도 짧은 토큰으로 접근을 유지합니다
6. [처리] 소수 사용자로 시험 — 리소스가 본 IP 확인
   - 주체: 관리자
   - 위치: Entra ID › Monitoring & health › Sign-in logs › IP address (seen by resource) 열 추가 · 빈 값 제외 (Reports Reader 이상)
   - 데이터: SigninLogs IP 주소 vs 리소스가 본 IP (같으면 비어 있음, Log Analytics 대응 열은 IPAddressFromResourceProvider). 상세는 로그 항목의 Conditional Access 탭에서 본 위치 확인
   - 해설: 엄격 적용 전에 두 IP가 어긋나는 경로가 있는지 미리 찾습니다. 시험 대상은 소수 사용자로 시작해 점차 넓힙니다
7. [처리] CAE 인사이트 워크북으로 IP 불일치 점검
   - 주체: 관리자
   - 위치: Entra ID › Monitoring & health › Workbooks › Public Templates › Continuous access evaluation insights (Log Analytics 연동 필요, Security Reader 이상)
   - 데이터: Entra가 본 IP와 리소스가 본 IP의 불일치 표(Potential IP address mismatch between Microsoft Entra ID and resource provider) · CAE 토큰 발급 여부 · 로그인별 인사이트 페이지
   - 해설: 불일치한 출구 IP는 소유자를 확인한 뒤 명명된 위치에 추가해 정상 사용자가 막히지 않게 합니다. 불일치 원인은 분할 터널 · 리소스는 IPv6/Entra는 IPv4 · 네트워크 구성 차이이며, 이런 경우 Entra는 1시간 CAE 토큰을 발급합니다
8. [처리] 정책 사용 켜기 — 대상 단계적 확대
   - 주체: 관리자
   - 위치: 새 정책 › Enable policy › On › Create
   - 데이터: conditionalAccessPolicy.state = enabled
   - 해설: 시험 그룹에서 문제가 없을 때 대상 사용자를 넓혀 갑니다. 엄격 모드는 Global Secure Access로 Microsoft 365 외 앱 트래픽을 보내면 쓰지 않습니다
9. [끝] 저장 — 다음에 발급되는 토큰부터 적용
   - 주체: 로그
   - 위치: Entra ID › Monitoring & health › Sign-in logs (정책 적용 시각 이후 발급된 토큰부터 확인). 즉시 반영은 Entra ID › Users › All users › {사용자} › Overview › Revoke sessions (Graph: POST /v1.0/users/{id}/revokeSignInSessions, 권한 User.RevokeSessions.All)
   - 데이터: 이미 발급된 토큰은 그대로 · 정책이나 그룹 변경은 리소스 반영까지 최대 1일(일부 최적화 시나리오는 약 2시간). 세션 취소도 토큰 무효화까지 수 분 지연이 있을 수 있음
   - 해설: 즉시 반영이 필요하면 해당 사용자의 세션을 회수합니다. 외부(게스트) 사용자는 홈 테넌트에서 로그인하므로 이 API로 세션이 회수되지 않고 CAE 자체도 게스트를 지원하지 않습니다

#### L4 · ② 활성 — 이벤트가 토큰 만료 전에 반영된다 (상세는 L3 A)

1. [시작] CAE 대응 클라이언트가 토큰 요청
   - 주체: 앱
   - 위치: MSAL 클라이언트 → /token (client_capabilities = cp1)
   - 데이터: client_capabilities cp1 · 갱신 토큰. 토큰 요청 claims는 {"access_token":{"xms_cc":{"values":["cp1"]}}} 형태
   - 해설: claims challenge를 처리할 수 있다고 알리는 클라이언트입니다. Outlook · Teams · OneDrive는 웹 · Win32 · iOS · Android · Mac에서, Office는 웹을 제외한 플랫폼에서 지원합니다
2. [처리] 조건부 액세스 평가 후 CAE 토큰 발급 — 최대 28시간
   - 주체: Entra ID
   - 위치: Entra ID 토큰 발급 (/token 응답)
   - 데이터: 장기 액세스 토큰 (구성 가능한 토큰 수명 정책 미적용, 최대 28시간). 위치 정책이 IP 불일치 환경이거나 위치 범위 합계가 5,000을 넘으면 1시간 CAE 토큰이 발급됨
   - 해설: 이벤트와 정책 평가가 회수를 담당하므로 토큰이 길어도 괜찮습니다. 조건부 액세스 정책이 걸린 Office 웹 앱은 CAE 미지원이라 토큰 수명이 1시간으로 줄고, Sign-in frequency는 CAE와 무관하게 유지됩니다
3. [처리] 리소스가 토큰으로 요청 처리
   - 주체: 리소스
   - 위치: Exchange Online · SharePoint Online · Teams · Microsoft Graph
   - 데이터: 액세스 토큰 · 사용자 ID. 초기 구현 범위는 Exchange Online · SharePoint Online · Teams이고 위치 정책 동기화는 Microsoft Graph도 포함하며 Exchange Online은 Azure Government(GCC High · DoD)에서도 지원됨
   - 해설: 정상 상태에서는 토큰이 유효하므로 요청이 그대로 처리됩니다. Teams는 호출 · 채팅 서비스가 IP 기반 정책을 따르지 않아 부분 지원입니다
4. [처리] 중요 이벤트 발생 — Entra가 리소스에 전달
   - 주체: Entra ID
   - 위치: Entra ID 내부 이벤트 (사용자 계정 · 인증 · 위험 상태 변경)
   - 데이터: 계정 삭제·비활성 · 암호 변경·재설정 · MFA 사용 설정 · 토큰 전체 철회(관리자 명시 철회) · 사용자 위험 높음(ID Protection). 이 평가는 조건부 액세스 정책 없이도 동작
   - 해설: Entra가 이벤트를 구독 중인 리소스 공급자에게 알립니다. 근실시간이 목표이며 전파 시간 때문에 최대 15분 지연이 관찰될 수 있습니다
5. [처리] 리소스가 토큰을 이벤트와 대조
   - 주체: 리소스
   - 위치: 리소스 서비스 내부 검증 (Exchange Online · SharePoint Online · Teams)
   - 데이터: 토큰의 사용자 ID · 발급 시각 vs 해당 사용자 회수 이벤트 · 동기화된 위치 정책 (IP 기반 명명된 위치만)
   - 해설: 만료 전이어도 이벤트나 정책 위반이 있으면 토큰을 인정하지 않습니다. 푸시 알림은 발송 시점에 IP 정책을 평가하지 않아 미리 보기 메시지가 보일 수 있고, 알림을 눌러 열 때 IP 정책이 적용됩니다
6. [처리] 401 + claims challenge 응답
   - 주체: 리소스
   - 위치: 리소스 응답 (HTTP 401 Unauthorized + WWW-Authenticate 헤더)
   - 데이터: WWW-Authenticate: Bearer error="insufficient_claims", claims=(base64). error=insufficient_claims와 claims 파라미터가 모두 있어야 CAE 거부로 처리하며 claims 값은 요청할 클레임의 base64 JSON
   - 해설: 클라이언트에 새 토큰이 필요하다고 알립니다. IP 정책 위반이면 "Instant IP Enforcement check failed" 같은 메시지가 보일 수 있습니다
7. [처리] 클라이언트가 캐시를 건너뛰고 재인증
   - 주체: 앱
   - 위치: MSAL — 갱신 토큰과 claims를 Entra에 전송 (MSAL 미사용 앱은 claims challenge를 직접 파싱해 요청에 실어야 함)
   - 데이터: refresh token · claims challenge
   - 해설: 캐시된 토큰 재사용을 멈추고 Entra로 돌아갑니다. 이 과정에서 사용자가 다시 인증하라는 프롬프트를 볼 수 있습니다
8. [판단] 재평가를 통과하는가?
   - 주체: Entra ID
   - 위치: Entra ID 내부 재평가 (관리자 화면 없음, 결과는 Sign-in logs에 새 항목으로 기록)
   - 데이터: 사용자 상태 · 위험 · 위치 · 정책 재평가 결과 (비활성 계정 · 회수된 갱신 토큰 · 사용자 위험 높음 · 허용 IP 밖 요청)
   - 해설: 비활성 계정이나 허용 IP 밖 요청이면 새 토큰을 주지 않습니다. Entra가 모든 조건을 다시 평가하며 결과는 로그인 로그에 새 항목으로 남습니다
   - 예 → 9
   - 아니오 → [차단] 차단 — 재로그인 필요 또는 접근 거부
9. [끝] 새 토큰 발급 · 결과 기록
   - 주체: 로그
   - 위치: Entra ID › Monitoring & health › Sign-in logs › Is CAE Token 필터 (대화형 · 비대화형 탭 모두 확인, Security Reader 이상)
   - 데이터: SigninLogs 재인증 항목 — CAE 토큰 여부는 요청 중 하나에만 true로 표시
   - 해설: 로그인 로그에서 CAE가 적용된 세션과 재평가 결과를 확인합니다
- 시나리오: 예 :: 재평가를 통과해 새 토큰 발급
- 시나리오: 아니오 :: 재평가에 실패해 접근 차단

> 교육 포인트: CAE는 "토큰 수명을 짧게"가 아니라 "이벤트가 나면 토큰을 즉시 거부"하는 방식입니다. 이벤트 전파에는 최대 15분이 걸릴 수 있지만 IP 위치 정책은 즉시 적용됩니다.
>
> 주의: 게스트 사용자는 CAE를 지원하지 않아 회수 이벤트와 IP 정책이 즉시 적용되지 않습니다. Office 웹 앱은 CAE 미지원이며 이때 토큰 수명이 1시간으로 줄어듭니다. 공동 편집 중인 Office 문서는 즉시 끊기지 않고 문서나 앱을 닫거나 IP 정책 기준 1시간 뒤에 접근을 잃습니다.
>
> 출처: https://learn.microsoft.com/entra/identity/conditional-access/concept-continuous-access-evaluation
>
> 출처: https://learn.microsoft.com/entra/identity/conditional-access/howto-continuous-access-evaluation-troubleshoot
>
> 출처: https://learn.microsoft.com/entra/identity-platform/app-resilience-continuous-access-evaluation
>
> 출처: https://learn.microsoft.com/entra/identity-platform/claims-challenge
>
> 출처: https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-session
>
> 출처: https://learn.microsoft.com/entra/identity/conditional-access/concept-assignment-network
>
> 출처: https://learn.microsoft.com/entra/identity/users/users-revoke-access
>
> 출처: https://learn.microsoft.com/graph/api/user-revokesigninsessions
>
> 출처: https://learn.microsoft.com/graph/api/resources/continuousaccessevaluationsessioncontrol?view=graph-rest-beta

### L3 · A · 핵심 이벤트 흐름 — 퇴사 · 위험 시 세션 회수

#### L4 · 계정 비활성화 → 세션 회수 → 리소스 거부 → 재평가 실패

1. [시작] 퇴사 처리로 관리자가 계정 비활성화
   - 주체: 관리자
   - 위치: Entra ID › Users › All users › {사용자} › Account status › Edit › Properties › Account enabled 해제 (Graph: PATCH /v1.0/users/{id}, PowerShell: Update-MgUser -AccountEnabled:$false)
   - 데이터: user.accountEnabled = false. 비활성화는 새 로그인을 막고 이미 발급된 토큰은 아래 세션 회수와 CAE 이벤트가 끊음
   - 해설: 퇴사나 사고 대응으로 계정을 비활성화하는 것이 첫 이벤트입니다
2. [처리] 활성 세션 모두 회수
   - 주체: 관리자
   - 위치: Entra ID › Users › All users › {사용자} › Overview › Revoke sessions (Graph: POST /v1.0/users/{id}/revokeSignInSessions, 권한 User.RevokeSessions.All; PowerShell: Revoke-MgUserSignInSession)
   - 데이터: signInSessionsValidFromDateTime 갱신 → 이전에 발급된 갱신 토큰과 브라우저 세션 쿠키 무효. 토큰 무효화까지 수 분의 지연이 있을 수 있고 외부(게스트) 사용자는 홈 테넌트에서 로그인하므로 회수되지 않음
   - 해설: 이미 발급된 갱신 토큰을 모두 무효로 만드는 명시적 회수입니다. 이 호출 자체가 CAE의 중요 이벤트(토큰 전체 철회)로 리소스에 전달됩니다
3. [처리] Entra가 중요 이벤트를 리소스 공급자에 전파
   - 주체: Entra ID
   - 위치: Entra ID 내부 → 리소스 공급자 (이벤트 구독)
   - 데이터: 사용자 회수 이벤트 → Exchange Online · SharePoint Online · Teams (전파 지연 최대 약 15분). 중요 이벤트 평가는 조건부 액세스 정책 없이도 모든 테넌트에서 동작
   - 해설: 이벤트를 구독 중인 리소스가 해당 사용자의 토큰을 더 이상 믿지 않게 됩니다
4. [처리] 사용자의 클라이언트가 기존 토큰으로 호출
   - 주체: 사용자
   - 위치: Outlook · Teams · OneDrive (CAE 지원 클라이언트)
   - 데이터: 아직 만료되지 않은 액세스 토큰 (CAE 세션은 최대 28시간 유효)
   - 해설: 퇴사자가 켜 둔 앱이 캐시된 토큰으로 계속 요청합니다. 공동 편집 중인 Office 문서는 즉시 끊기지 않을 수 있고 푸시 알림의 미리 보기는 이미 전송됐을 수 있습니다
5. [처리] 리소스가 회수 이벤트를 확인
   - 주체: 리소스
   - 위치: 리소스 서비스 내부 검증 (Exchange Online · SharePoint Online · Teams)
   - 데이터: 토큰 발급 시각 vs 해당 사용자의 회수 시각 (토큰 발급 시각이 회수 시각보다 이르면 거부 대상)
   - 해설: 리소스가 토큰을 받을 때마다 사용자에 대한 회수 이벤트가 있는지 확인합니다
6. [처리] 401 + claims challenge로 거부
   - 주체: 리소스
   - 위치: 리소스 응답 (HTTP 401 Unauthorized + WWW-Authenticate 헤더)
   - 데이터: WWW-Authenticate: error="insufficient_claims", claims=(base64 JSON)
   - 해설: 만료 전 토큰이지만 리소스가 거부하고 재인증을 요구합니다. 클라이언트는 401과 error=insufficient_claims를 보고 CAE 거부로 인식합니다
7. [처리] 클라이언트가 갱신 토큰과 claims를 Entra에 제출
   - 주체: 앱
   - 위치: MSAL → /token (claims 파라미터 포함)
   - 데이터: refresh token (이미 회수됨) · claims challenge
   - 해설: CAE 지원 클라이언트는 캐시를 건너뛰고 Entra에 다시 요청합니다. 회수된 갱신 토큰은 이 시점에 거부되어 사용자는 재로그인이 필요합니다
8. [판단] 재평가를 통과하는가?
   - 주체: Entra ID
   - 위치: Entra ID 내부 재평가 (관리자 화면 없음)
   - 데이터: 계정 상태 · 갱신 토큰 유효성 · 사용자 위험 · 정책. 비활성화한 계정을 곧바로 다시 사용 설정하면 SharePoint Online · Teams는 약 15분, Exchange Online은 약 35~40분 뒤에야 복구를 인식
   - 해설: 비활성이거나 회수된 갱신 토큰이면 새 토큰을 주지 않습니다
   - 예 → [끝] 새 토큰 — 재인증 후 계속 (위험 해소 등)
   - 아니오 → 9
9. [처리] 재인증 실패 · 접근 종료 기록
   - 주체: 로그
   - 위치: Entra ID › Monitoring & health › Sign-in logs (실패 항목) · Audit logs (계정 비활성화 · 사용자 업데이트 활동)
   - 데이터: SigninLogs 실패 ResultType (0이 아닌 값, 오류 코드는 login.microsoftonline.com/error에서 조회) · AuditLogs 활동 (예: UserManagement 범주의 Disable account · Update user)
   - 해설: 접근이 끊긴 시각과 사유를 로그인 로그와 감사 로그에서 추적합니다. 감사 로그는 Activity 필터로 좁히고 Modified Properties 탭에서 변경 전후 값을 봅니다
- 시나리오: 예 :: 재평가를 통과해 새 토큰을 받는 경우
- 시나리오: 아니오 :: 재평가 실패로 접근이 종료되고 기록됨

> 교육 포인트: 중요 이벤트 5가지는 계정 삭제·비활성, 암호 변경·재설정, MFA 사용 설정, 토큰 전체 철회, ID Protection의 사용자 위험 높음입니다. 이 평가는 조건부 액세스 정책 없이도 동작합니다.
>
> 주의: 비활성화한 계정을 곧바로 다시 사용 설정하면 SharePoint Online과 Teams는 약 15분, Exchange Online은 약 35~40분 뒤에야 복구를 인식합니다. 세션 취소 API는 호출 뒤 토큰 무효화까지 수 분 지연될 수 있습니다.
>
> 출처: https://learn.microsoft.com/entra/identity/conditional-access/concept-continuous-access-evaluation
>
> 출처: https://learn.microsoft.com/entra/identity/users/users-revoke-access
>
> 출처: https://learn.microsoft.com/graph/api/user-revokesigninsessions
>
> 출처: https://learn.microsoft.com/entra/identity/monitoring-health/reference-audit-activities

### L3 · B · 엄격한 위치 적용 — 리소스가 본 IP까지 차단 기준으로

#### L4 · 표준 모드의 예외 vs 엄격 모드의 즉시 차단

1. [시작] 사용자가 허용 IP 범위 밖 네트워크로 이동
   - 주체: 사용자
   - 위치: 카페 · VPN 분할 터널 · 다른 출구 경로
   - 데이터: 클라이언트 공인 IP 변경. 분할 터널 · 프록시 · SD-WAN · IPv6 클라이언트 · 부하 분산 출구 구성에서는 Entra가 보는 IP와 리소스가 보는 IP가 서로 다를 수 있음
   - 해설: 토큰을 가진 채 네트워크가 바뀌거나 토큰이 외부로 반출된 상황입니다
2. [처리] 클라이언트가 리소스에 요청
   - 주체: 앱
   - 위치: Exchange Online · SharePoint Online · Teams · Graph
   - 데이터: 액세스 토큰 · 리소스가 본 IP (로그인 로그의 IP address (seen by resource), Log Analytics 대응 열 IPAddressFromResourceProvider)
   - 해설: 리소스는 요청이 도착한 IP를 직접 봅니다. Teams의 호출 · 채팅 서비스는 IP 기반 정책을 따르지 않습니다
3. [처리] 리소스가 동기화된 위치 정책과 대조
   - 주체: 리소스
   - 위치: 리소스 서비스 내부 검증 (Exchange Online · SharePoint Online · Teams · Graph가 Entra에서 받아 둔 정책)
   - 데이터: IP 기반 명명된 위치만 동기화 (국가·지역 조건이나 MFA 신뢰 IP는 CAE가 보지 못하며 이 경우 위치 변경을 즉시 강제하지 못하고 1시간 토큰이 발급됨)
   - 해설: 허용 IP 목록 밖이면 토큰을 거부할 준비를 합니다. 위치 범위 합계가 5,000을 넘으면 위치 변경은 실시간 평가되지 않습니다
4. [처리] 401 + claims challenge 응답
   - 주체: 리소스
   - 위치: 리소스 응답 (HTTP 401 Unauthorized + WWW-Authenticate 헤더)
   - 데이터: WWW-Authenticate: error="insufficient_claims", claims=(base64 JSON)
   - 해설: 클라이언트에 Entra로 돌아가 다시 인증하라고 알립니다. 분할 터널 환경에서는 insufficient_claims 또는 Instant IP Enforcement check failed로 의도치 않은 차단이 날 수 있어 최적화된 IP를 신뢰 IP/VPN으로 라우팅해야 할 수 있습니다
5. [처리] 클라이언트가 Entra에 재인증 요청
   - 주체: 앱
   - 위치: MSAL → /token (갱신 토큰 + claims)
   - 데이터: Entra가 본 클라이언트 IP (SigninLogs IP address). 이 요청은 갱신 토큰과 claims를 함께 보냄
   - 해설: 이번에는 Entra가 보는 IP를 기준으로 판단합니다
6. [판단] 위치 적용 모드는?
   - 주체: Entra ID
   - 위치: 정책 › Access controls › Session › Customize continuous access evaluation › Strictly enforce location policies (미리 보기)
   - 데이터: Graph 베타 sessionControls.continuousAccessEvaluation.mode (disabled · strictLocation · strictEnforcement; UI 선택지와의 값 대응은 [확인 필요: 엄격 적용에 해당하는 값]). 표준이 기본값이라 별도 설정이 없음
   - 해설: 엄격 적용 미리 보기는 리소스가 본 IP가 비허용이면 무조건 막습니다. 켜기 전에 Entra와 모든 리소스 공급자(Exchange Online · Teams · SharePoint Online · Graph)의 출구 IP가 전용이고 열거 가능한지, 모든 IP가 IPv4 · IPv6 named location에 있는지 확인합니다
   - 표준 → 7
   - 엄격 → [차단] 차단 — 리소스가 본 IP가 허용 범위 밖
7. [처리] 표준 모드 — Entra가 본 IP로 재평가
   - 주체: Entra ID
   - 위치: Entra ID 내부 재평가 (관리자 화면 없음)
   - 데이터: Entra가 본 IP vs 명명된 위치 (표준 모드는 이 판정에서 허용이면 접근 유지, 다른 CAE 이벤트와 정책 평가는 계속됨)
   - 해설: 표준 모드는 분할 터널처럼 IP가 어긋나는 환경을 배려한 기본값이며 모든 네트워크 토폴로지에 쓸 수 있습니다
8. [판단] Entra가 본 IP는 허용 범위인가?
   - 주체: Entra ID
   - 위치: Entra ID 내부 재평가 (결과는 Sign-in logs › Conditional Access 탭에서 본 위치 확인)
   - 데이터: conditions.locations 일치 여부 (IP 기반 명명된 위치와 비교)
   - 해설: 허용 범위라면 리소스가 본 IP와 달라도 접근을 유지합니다. Entra가 본 IP도 허용되지 않으면 차단됩니다
   - 예 → 9
   - 아니오 → [차단] 차단 — Entra가 본 IP도 허용 범위 밖
9. [끝] 1시간 토큰 발급 — 리소스 IP 검사 일시 중단
   - 주체: 로그
   - 위치: Entra ID › Monitoring & health › Sign-in logs › IP address (seen by resource) 열 · Conditional Access 탭
   - 데이터: 단기 토큰(1시간) · 로그인 로그의 IP address (seen by resource) 값 (Entra가 본 IP와 같으면 비어 있음)
   - 해설: 무한 재인증을 피하려고 1시간 동안 리소스의 IP 검사를 멈추고 Entra 검사는 계속합니다. 이 경우에도 위치 외의 다른 CAE 이벤트는 계속 평가되어 일반 1시간 토큰보다는 안전합니다
- 시나리오: 표준 ▸ 예 :: 표준 모드에서 허용 IP로 확인돼 토큰 발급
- 시나리오: 표준 ▸ 아니오 :: 표준 모드에서 허용 범위 밖 IP라 차단
- 시나리오: 엄격 :: 엄격 모드라 IP 확인 없이 즉시 차단

> 교육 포인트: 엄격 모드는 Entra와 모든 리소스 공급자의 출구 IP가 고정이고 열거 가능할 때만 쓰며, 도입 전 소수 사용자 시험과 CAE 워크북 점검이 선행 조건입니다. 표준 모드는 Entra가 허용 IP를 확인하면 접근을 유지하고, 엄격 모드는 리소스가 본 IP가 허용 목록에 없으면 차단하며 로그에는 초기 인증 성공 뒤 재확인 때 인증 실패가 따로 남습니다.
>
> 주의: Global Secure Access로 Microsoft 365 이외 앱 트래픽을 보내는 경우 소스 IP 복원이 지원되지 않아 엄격 모드가 신뢰 위치의 사용자도 차단합니다. 이 모드는 미리 보기입니다. 사용자는 차단 시 엄격 적용 때문에 막혔다는 메시지를 보며, 정상 사용자가 막히면 IP address (seen by resource) 값을 명명된 위치에 추가합니다(IP 소유를 먼저 확인).
>
> 출처: https://learn.microsoft.com/entra/identity/conditional-access/concept-continuous-access-evaluation-strict-enforcement
>
> 출처: https://learn.microsoft.com/entra/identity/conditional-access/concept-continuous-access-evaluation
>
> 출처: https://learn.microsoft.com/entra/identity/conditional-access/howto-continuous-access-evaluation-troubleshoot
