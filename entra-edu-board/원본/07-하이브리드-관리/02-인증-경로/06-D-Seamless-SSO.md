### L3 · D · Seamless SSO — Kerberos 티켓으로 자동 로그인

#### L4 · 도메인 PC 브라우저가 Kerberos 티켓으로 로그인한다

1. [시작] 도메인 가입 PC 사용자가 웹 앱에 접속
   - 주체: 사용자
   - 위치: 사내 네트워크 브라우저 → 예: outlook.office365.com
   - 데이터: 로그인되지 않은 요청 · Microsoft 365 클라이언트는 16.0.8730.xxxx 이상에서 무음 로그인
   - 해설: 사내 네트워크의 도메인 PC에서 로그인 상태가 아닌 채 접속합니다. 도메인 컨트롤러와 통신할 수 있는 사내 네트워크가 전제입니다.
2. [처리] Entra 로그인 페이지로 이동 — 사용자 이름 입력
   - 주체: Entra ID
   - 위치: login.microsoftonline.com
   - 데이터: UPN
   - 해설: 일부 앱은 domain_hint나 login_hint를 보내 이 두 단계를 건너뜁니다.
3. [처리] Entra가 401로 Kerberos 티켓을 요구
   - 주체: Entra ID
   - 위치: autologon.microsoftazuread-sso.com (JavaScript 백그라운드 요청)
   - 데이터: 401 Unauthorized + 인증 요구
   - 해설: 사용자가 보지 못하는 곳에서 브라우저에 티켓을 요구합니다. 프록시를 쓴다면 이 주소를 허용 목록에 명시해야 합니다.
4. [판단] 브라우저가 이 주소를 인트라넷 영역으로 인식하는가?
   - 주체: 디바이스
   - 위치: 브라우저 인트라넷 영역 · Edge · Chrome 정책(AuthServerAllowlist · AuthNegotiateDelegateAllowlist) · Firefox SPNEGO 정책
   - 데이터: autologon.microsoftazuread-sso.com 영역 설정 · macOS Safari는 컴퓨터가 AD에 가입돼 있어야 함
   - 해설: 클라우드 주소에는 브라우저가 기본적으로 Kerberos 티켓을 보내지 않습니다. 이 영역 값을 4로 지정하면 그 사용자는 항상 SSO가 실패합니다.
   - 예 → 5
   - 아니오 → [차단] SSO 실패 — 암호 입력 화면으로 폴백
5. [처리] 브라우저가 AD에 AZUREADSSOACC용 티켓 요청
   - 주체: 온프레미스
   - 데이터: 컴퓨터 계정 AZUREADSSOACC(Entra를 나타냄)의 SPN 티켓
   - 해설: AD가 그 컴퓨터 계정의 비밀로 암호화한 티켓을 돌려줍니다.
6. [처리] 브라우저가 티켓을 Entra로 전달
   - 주체: 디바이스
   - 데이터: Kerberos 티켓
   - 해설: 브라우저가 받은 티켓을 그대로 Entra에 넘깁니다.
7. [처리] Entra가 공유된 키로 티켓 복호화 — 사용자 확인
   - 주체: Entra ID
   - 위치: 키 롤오버: Update-AzureADSSOForest -OnPremCredentials $creds (도메인 관리자 + Hybrid Identity Administrator 자격, 포리스트당 한 번만 실행)
   - 데이터: AZUREADSSOACC 복호화 키 (Entra와 공유) · 지원 암호화 AES256 · AES128 · RC4 · 포리스트가 여러 개면 계정마다 고유 키
   - 해설: 티켓 안의 사용자 ID로 어떤 사용자인지 확인합니다.
8. [끝] CA · MFA 평가 후 토큰 발급
   - 주체: Entra ID
   - 데이터: 토큰 또는 추가 증명 요구 · 실패하면 일반 로그인(암호)으로 폴백
   - 해설: Seamless SSO는 기회적(opportunistic) 방식이라 실패해도 로그인은 가능합니다.
- 시나리오: 예 :: 인트라넷 영역으로 인식해 티켓 SSO 성공
- 시나리오: 아니오 :: 인트라넷 영역이 아니라 SSO 실패

> 교육 포인트: 네이티브 앱(Outlook 등)은 WS-Trust MEX 엔드포인트로 통합 인증 가능 여부를 확인한 뒤 SAML 토큰을 거쳐 액세스 토큰을 받습니다.
>
> 주의: AZUREADSSOACC 계정은 도메인 관리자만 관리하게 보호하고(Kerberos 위임 비활성화, 전용 OU에 보관) Kerberos 복호화 키를 최소 30일마다 롤오버합니다. RC4에서 AES로 바꿀 때는 키를 먼저 롤오버합니다. 문서는 2026년 7월 Windows Server 업데이트부터 AD DS 기본 Kerberos 암호화가 RC4에서 AES-256으로 바뀐다고 안내하므로 AzureADSSOAcc$ 계정의 암호화 유형을 AES로 옮겨 둡니다. 실제 적용 상태는 환경에서 확인합니다 [확인 필요].
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-sso-how-it-works
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-sso-quick-start
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-sso-faq
