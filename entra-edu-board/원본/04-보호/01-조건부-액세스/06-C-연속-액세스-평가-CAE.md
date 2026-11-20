### L3 · C · 연속 액세스 평가 (CAE) — 토큰 발급 뒤에도 다시 확인

#### L4 · 장기 토큰 → 이벤트 → 리소스가 토큰 거부(claims challenge) → 재인증 → 재평가

1. [시작] CAE 지원 클라이언트가 토큰 요청
   - 주체: 앱
   - 위치: MSAL 클라이언트 (클라이언트 기능 cp1 선언, 예: .WithClientCapabilities(["cp1"]))
   - 데이터: client_capabilities = cp1 (CAE 대응 알림). 토큰 요청의 claims는 {"access_token":{"xms_cc":{"values":["cp1"]}}} 형태. cp1을 선언하지 않은 앱은 claims challenge를 받지 않고 CAE 토큰도 받지 못함
   - 해설: claims challenge를 처리할 수 있다고 선언한 클라이언트만 CAE 세션을 받습니다. 최신 Outlook · Teams · OneDrive는 웹 · Win32 · iOS · Android · Mac 모두 claims challenge를 지원하고 Office는 웹 앱만 미지원입니다
2. [처리] 장기 CAE 토큰 발급 — 최대 28시간
   - 주체: Entra ID
   - 위치: Entra ID 토큰 발급 (/token 응답)
   - 데이터: 액세스 토큰 수명 장기 (구성 가능한 토큰 수명 정책은 CAE 세션에 적용 안 됨). 위치 정책이 IP 불일치 환경이거나 위치 범위 합계가 5,000을 넘거나 MFA 신뢰 IP · 국가/지역 위치를 쓰면 1시간 토큰이 발급됨
   - 해설: 이벤트로 회수할 수 있으니 토큰을 길게 줘도 안전하다는 발상입니다. 장기 토큰은 MSAL이 선제적으로 갱신해 앱 복원력도 높아집니다
3. [처리] 핵심 조건부 액세스 정책을 리소스에 동기화
   - 주체: Entra ID
   - 위치: Entra ID › Conditional Access › Named locations (IP 범위 위치) → 정책 Network 조건
   - 데이터: 위치 기반 정책 (Exchange Online · SharePoint Online · Teams · Graph). CAE는 IP 기반 named location(IPv4 · IPv6)만 보고 MFA 신뢰 IP · 국가/지역 위치는 보지 못함. 정책이나 그룹 변경이 리소스에 반영되기까지 최대 1일(최적화 시 약 2시간)
   - 해설: 리소스가 IP 위치 정책을 스스로 판단할 수 있도록 미리 받아 둡니다. Teams의 통화 · 채팅 서비스는 IP 기반 정책을 따르지 않고, 리소스가 반영하기 전 즉시 필요하면 사용자 세션을 취소합니다
4. [처리] 리소스를 사용하는 중 — 만료 전 토큰으로 호출
   - 주체: 사용자
   - 위치: Outlook · Teams · OneDrive 등 CAE 지원 클라이언트 (Office 웹 앱 · OneDrive Win32 · OneDrive Mac의 SharePoint Online 접근은 미지원, Teams는 부분 지원)
   - 데이터: 액세스 토큰 (아직 유효). 공동 편집 중인 Office 문서는 즉시 회수되지 않고 문서나 앱을 닫거나 IP 정책 기준 1시간이 지나야 접근을 잃음
   - 해설: 사용자는 이미 받은 장기 토큰으로 리소스를 계속 호출합니다. SharePoint 관리자가 네트워크 위치 정책을 설정하면 공동 편집 세션 최대 수명이 15분으로 줄고 Set-SPOTenant -IPAddressWACTokenLifetime으로 더 조정할 수 있습니다
5. [처리] 이벤트 발생 — 비활성 · 암호 재설정 · 허용 IP 이탈
   - 주체: Entra ID
   - 위치: Entra ID 내부 이벤트 (사용자 계정 · 인증 · 위험 상태 변경)
   - 데이터: 중요 이벤트(계정 삭제·비활성 · 암호 변경·재설정 · MFA 사용 설정 · 토큰 전체 철회 · 사용자 위험 높음) 또는 클라이언트 IP 변경. 중요 이벤트 평가는 조건부 액세스 정책 없이도 모든 테넌트에서 동작
   - 해설: 중요 이벤트나 허용 IP 이탈이 일어나면 Entra가 리소스에 알립니다. 이벤트 전파에는 최대 15분 지연이 있을 수 있고 IP 위치 정책 적용은 즉시입니다
6. [처리] 리소스가 토큰 거부 — 401 + claims challenge
   - 주체: 리소스
   - 위치: 리소스 응답 (HTTP 401 Unauthorized + WWW-Authenticate 헤더)
   - 데이터: WWW-Authenticate: error="insufficient_claims", claims=(base64). claims는 요청할 클레임의 base64 JSON이며 예시 값은 {"access_token":{"nbf":{"essential":true,"value":"1604106651"}}} 형태(문서 예시)
   - 해설: 리소스가 만료 전 토큰을 거부하고 새 토큰이 필요하다고 응답합니다. IP 정책 위반이면 "Instant IP Enforcement check failed" 같은 오류가 보일 수 있습니다
7. [처리] 클라이언트가 캐시를 버리고 재인증
   - 주체: 앱
   - 위치: MSAL — 갱신 토큰과 claims를 함께 Entra에 전송 (MSAL 미사용 앱은 claims challenge를 직접 파싱해 처리해야 함)
   - 데이터: refresh token · claims challenge
   - 해설: 캐시된 토큰을 무시하고 Entra에 새 토큰을 요청합니다. 401과 WWW-Authenticate 헤더의 error=insufficient_claims를 보고 claims 값을 다음 /token 요청에 실어 보냅니다
8. [판단] Entra 재평가를 통과하는가?
   - 주체: Entra ID
   - 위치: Entra ID 내부 재평가 (관리자 화면 없음, 결과는 Sign-in logs에 새 항목으로 기록)
   - 데이터: 사용자 상태 · 위험 · 위치 · 조건부 액세스 정책 재계산. 표준 위치 모드에서는 Entra가 본 IP가 허용 범위면 리소스가 본 IP가 달라도 1시간 토큰을 발급
   - 해설: Entra가 모든 조건을 다시 평가하며 통과하지 못하면 차단합니다. 1시간 토큰 동안 리소스 IP 검사는 멈추지만 Entra 쪽 IP 검사와 다른 중요 이벤트 평가는 계속됩니다
   - 예 → 9
   - 아니오 → [차단] 차단 — 리소스 접근 종료
9. [끝] 새 토큰 — 계속 사용
   - 주체: 로그
   - 위치: Entra ID › Monitoring & health › Sign-in logs › Is CAE Token 필터 (대화형 · 비대화형 탭 모두 확인, Security Reader 이상)
   - 데이터: SigninLogs 새 로그인 항목 (CAE 토큰 여부 표시, 한 인증의 여러 요청 중 하나에만 true). 포털의 IP address (seen by resource)에 대응하는 Log Analytics 열은 IPAddressFromResourceProvider
   - 해설: 통과하면 새 토큰으로 이어서 사용합니다. 게스트 사용자는 CAE를 지원하지 않아 회수 이벤트와 IP 정책이 즉시 적용되지 않습니다
- 시나리오: 예 :: 재평가를 통과해 새 토큰 발급
- 시나리오: 아니오 :: 재평가에 실패해 접근 차단

> 교육 포인트: 중요 이벤트는 전파에 최대 15분이 걸릴 수 있고 IP 위치 정책은 즉시 적용됩니다. 상세는 CAE 기능 카드에서 다룹니다.
>
> 주의: CAE를 지원하지 않는 클라이언트는 기본 액세스 토큰 1시간을 그대로 씁니다. 게스트 사용자는 CAE를 지원하지 않고, 위치 범위 합계가 5,000을 넘으면 위치 변경은 실시간으로 평가되지 않아 1시간 CAE 토큰이 발급되며 중요 이벤트 평가는 계속됩니다.
>
> 출처: https://learn.microsoft.com/entra/identity/conditional-access/concept-continuous-access-evaluation
>
> 출처: https://learn.microsoft.com/entra/identity-platform/app-resilience-continuous-access-evaluation
>
> 출처: https://learn.microsoft.com/entra/identity/conditional-access/howto-continuous-access-evaluation-troubleshoot
>
> 출처: https://learn.microsoft.com/entra/identity-platform/claims-challenge
