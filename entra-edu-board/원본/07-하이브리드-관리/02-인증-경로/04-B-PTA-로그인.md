### L3 · B · PTA 로그인 — 큐를 수신하는 인증 에이전트와 구역 구분

#### L4 · 구역과 연결 방향 — 클라우드 · 에이전트 구역 · DC

1. [시작] 로그인 암호 검증 요청이 생김 — 클라우드 구역
   - 주체: Entra ID
   - 위치: 구역 ① Microsoft 클라우드 — Microsoft Entra STS · 테넌트 전용 Azure Service Bus 큐
   - 데이터: 에이전트 공개 키로 암호화된 사용자 이름·암호 요청 · 큐는 테넌트 ID로 식별되는 테넌트 전용 큐
   - 해설: PTA에서는 Entra가 암호를 검증하지 않고 사용자 이름과 암호(에이전트 공개 키로 암호화)를 클라우드의 큐에 맡깁니다. 이 구역은 Microsoft가 운영합니다
2. [처리] 경계 — 에이전트 구역에서 클라우드 쪽으로만 나가는 연결
   - 주체: 프록시 · 방화벽
   - 위치: 구역 ② 경계(방화벽 · 선택적 아웃바운드 프록시) — 에이전트 서버에서 Entra로 나가는 방향만 허용
   - 데이터: 아웃바운드 TCP 443(모든 인증된 통신) · 80(인증서 폐기 목록 확인) · 선택 8080(상태 보고) · 인바운드 포트는 열 필요 없음 · 대상 *.msappproxy.net · *.servicebus.windows.net
   - 해설: 큐에 연결하는 쪽은 항상 에이전트입니다. 클라우드가 구역 안으로 들어오는 연결은 없습니다. 에이전트와 Entra 사이의 TLS는 검사·종단하지 않아야 합니다
3. [처리] 에이전트 구역 — 큐 수신과 복호화만 하는 PTA 에이전트 서버
   - 주체: PTA 에이전트
   - 위치: 구역 ③ 에이전트 서버 — Windows Server (내부망, 보안 정책상 필요하면 DMZ · 스크린드 서브넷 같은 격리 구간) · 서비스 계정 NetworkService
   - 데이터: 공식 문서는 DMZ(perimeter network)에 설치할 필요가 없다고 설명 · 에이전트 서버는 Tier 0 시스템으로 도메인 컨트롤러처럼 강화 · 도메인 컨트롤러 가까이 설치해 지연 감소 · 에이전트끼리는 통신하지 않고 클라우드와만 통신 · 테넌트당 최대 40대, 운영 환경 최소 3대
   - 해설: 이 서버만 큐를 수신하고 개인 키로 복호화합니다. 구역을 분리해 두었다면 이 서버가 클라우드(아웃바운드)와 DC(내부)를 모두 볼 수 있어야 합니다. 복호화가 일어나는 곳이라 문서가 DC와 같은 수준(Tier 0)의 보호를 권고합니다
4. [판단] 에이전트 서버와 도메인 컨트롤러가 같은 네트워크 구역에 있는가?
   - 주체: PTA 에이전트
   - 위치: 네트워크 설계 — 에이전트 서버와 DC 사이 방화벽 유무
   - 데이터: 같은 구역 = 방화벽 없이 직접 통신 · 구역이 다름(에이전트를 DMZ·격리 구간에 둠) = 에이전트 → DC 방향에 방화벽 규칙 필요
   - 해설: 에이전트 구역이 DC와 분리되어 있으면 클라우드로 나가는 규칙뿐 아니라 DC로 들어가는 규칙도 열어야 합니다
   - 같음 → 5
   - 다름 → 6
5. [처리] 구역 ④ 내부망 — 에이전트가 DC와 직접 통신
   - 주체: DC (AD)
   - 위치: 구역 ④ 내부망 — Active Directory 도메인 컨트롤러
   - 데이터: DC 위치는 Windows의 표준 DC 찾기(DNS)로 결정
   - 해설: 같은 구역에서는 별도 방화벽 규칙 없이 도메인 로그온이 됩니다
   - 다음 → 7
6. [처리] 에이전트 구역 → DC 방향 방화벽 허용
   - 주체: 프록시 · 방화벽
   - 위치: 에이전트 구역과 내부망 사이 방화벽
   - 데이터: 도메인 로그온에 쓰이는 표준 AD 포트 — Kerberos 88(TCP/UDP) · Kerberos 암호 변경 464(TCP/UDP) · LDAP 389 · SMB 445 · RPC 135와 동적 포트 49152~65535 · DNS 53 [확인 필요: LogonUser 네트워크 로그온에 실제로 필요한 최소 포트 집합]
   - 해설: DC를 찾는 DNS와 Kerberos가 막히면 에이전트는 Entra로 살아 있어도 AD 검증을 못 합니다
   - 다음 → 7
7. [끝] 도메인 컨트롤러가 AD 계정 정책으로 판정
   - 주체: DC (AD)
   - 데이터: 계정 상태 · 암호 만료 · 잠금 · 허용된 로그온 시간
   - 해설: 구역은 3개 + 경계입니다. 클라우드(큐) ← 아웃바운드 ← 에이전트 구역 → DC. 요청의 방향과 연결을 시작하는 쪽이 서로 다르다는 점이 핵심입니다
- 시나리오: 같음 :: 에이전트와 DC가 같은 내부망에 있는 구성
- 시나리오: 다름 :: 에이전트가 DMZ·격리 구간에 있어 DC 규칙 필요

> 교육 포인트: PTA의 연결은 항상 에이전트 → 클라우드(아웃바운드)로 시작하고, 에이전트가 AD로 보내는 검증은 에이전트 → DC입니다. 어떤 구역이든 클라우드가 에이전트를 직접 부르지 않습니다.
>
> 주의: 문서상 DMZ 설치는 필수가 아닙니다. 격리 구간에 두는 설계는 에이전트 서버를 Tier 0로 보호한다는 전제에서 선택하며, 그 경우 DC 방향 규칙을 별도로 열어야 합니다.
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-pta-security-deep-dive
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-pta-quick-start
>
> 출처: https://learn.microsoft.com/troubleshoot/windows-server/networking/service-overview-and-network-port-requirements

#### L4 · 로그인 흐름 — 암호가 큐를 거쳐 에이전트에서 DC로 검증된다

1. [시작] 사용자가 사용자 이름 · 암호 입력 — 클라우드 로그인 페이지
   - 주체: 사용자
   - 위치: Entra 로그인 페이지(login.microsoftonline.com) · 사용자 이름 다음에 암호 입력 후 로그인
   - 데이터: UPN · 암호가 HTTPS POST로 Entra STS에 제출 · PTA는 Connect로 동기화된 사용자만 대상이고 클라우드 전용 사용자에는 적용되지 않음
   - 해설: 사용자는 평소 로그인 화면과 같은 화면에서 입력하고, 암호는 Entra STS까지만 평문으로 도달합니다
2. [처리] Entra STS가 에이전트마다 공개 키로 암호화 — 클라우드 구역
   - 주체: Entra ID
   - 위치: 구역 ① 클라우드 — Entra STS (등록된 에이전트의 공개 키는 Azure SQL Database에서 조회)
   - 데이터: 테넌트에 등록된 에이전트마다 암호화된 암호 값을 하나씩 생성 · 사용자 이름과 암호화된 값들이 하나의 검증 요청
   - 해설: 에이전트가 여러 대면 요청 하나에 에이전트 수만큼의 암호화 값이 들어 있습니다. 각 에이전트는 자기 공개 키로 암호화된 값만 풀 수 있습니다
3. [처리] 검증 요청을 테넌트 전용 Service Bus 큐에 저장 — 클라우드 구역
   - 주체: Service Bus
   - 위치: 구역 ① 클라우드 — 테넌트 전용 Azure Service Bus 큐
   - 데이터: 사용자 이름 + 에이전트별 암호화 값 · 에이전트들은 이미 이 큐에 연결된 상태
   - 해설: 큐는 클라우드와 에이전트 구역 사이의 우편함입니다. 평문 암호는 어디에도 저장되지 않습니다
4. [처리] 큐에 연결돼 있던 에이전트 한 대가 요청을 가져옴 — 에이전트 구역(아웃바운드 수신)
   - 주체: PTA 에이전트
   - 위치: 구역 ③ 에이전트 서버 — 아웃바운드로 미리 맺은 지속 HTTPS 연결(443)
   - 데이터: 사용 가능한 에이전트 중 한 대가 수신 · 에이전트가 실패하면 그 로그인 요청은 버려지고 다른 에이전트로 넘기지 않음 · 에이전트끼리는 통신하지 않음 · 여러 에이전트라도 결정적 부하 분산은 아님
   - 해설: 인바운드 포트 없이 에이전트가 먼저 연결을 맺어 두었기 때문에 요청을 받을 수 있습니다
5. [처리] 에이전트가 개인 키로 복호화 — 에이전트 구역
   - 주체: PTA 에이전트
   - 위치: 구역 ③ 에이전트 서버 — 에이전트 등록 때 만든 개인 키
   - 데이터: 에이전트 식별자로 자기 공개 키에 맞는 암호화 값을 찾아 복호화
   - 해설: 복호화는 에이전트 서버에서만 일어납니다
6. [처리] 에이전트가 Windows API로 AD에 검증 요청 — 에이전트 구역에서 DC로
   - 주체: PTA 에이전트
   - 위치: 구역 ③ 에이전트 서버 → 구역 ④ 내부망 DC — Win32 LogonUser API (dwLogonType = LOGON32_LOGON_NETWORK)
   - 데이터: AD FS가 페더레이션 로그인에서 쓰는 것과 같은 API · DC는 Windows 표준 DC 찾기로 선택 · LogonUser의 기본 로그온 공급자는 Negotiate라 DC와는 Kerberos로 인증하는 것이 기본 경로(필요 시 NTLM으로 협상) [확인 필요: PTA 문서에는 Kerberos가 명시되어 있지 않음]
   - 해설: 에이전트가 하는 일은 사용자 이름·암호를 DC에 대신 제출해 결과만 받는 것입니다. 선 위의 Kerberos 표시는 에이전트와 DC 사이 구간에서 쓰는 인증 프로토콜입니다
   - Kerberos → 7
7. [판단] DC가 인증에 성공했다고 응답하는가? — 내부망 DC
   - 주체: DC (AD)
   - 위치: 구역 ④ 내부망 — 도메인 컨트롤러 (Kerberos 88 · LDAP 389 · DNS 53 등)
   - 데이터: DC 응답 — 성공 · 사용자 이름 또는 암호 오류 · 암호 만료 · 계정 잠김 · 허용된 로그온 시간 외 시도도 거부
   - 해설: AD의 계정 상태가 로그인 순간에 그대로 반영됩니다. 에이전트 사용 불가·AD 연결 실패는 로그인 오류 코드 80001·80007, 시간 초과는 80002·80014로 나타납니다
   - 성공 → 8
   - 실패·만료·잠김 → [차단] 로그인 거부 — AD 계정 상태가 즉시 반영
8. [처리] 에이전트가 결과를 Entra STS에 반환 — 에이전트 구역에서 클라우드로
   - 주체: PTA 에이전트
   - 위치: 구역 ③ → 구역 ① — 아웃바운드 상호 인증 HTTPS(443), 에이전트 등록 때 발급된 인증서 사용
   - 데이터: 성공 · 사용자 이름 또는 암호 오류 · 암호 만료 등의 결과 · Entra STS가 이 결과를 해당 로그인 요청과 대조
   - 해설: Entra가 결과를 받아 구성된 다음 단계(MFA 요청 또는 앱으로 리디렉션)로 진행합니다. PTA에서는 페더레이션 기반 서드파티·온프레미스 MFA를 쓸 수 없습니다
9. [끝] 에이전트 로그로 장애 확인
   - 주체: 로그
   - 위치: 에이전트 서버 이벤트 뷰어 › 응용 프로그램 및 서비스 로그 › Microsoft › AzureAdConnect › AuthenticationAgent › Admin · Entra ID › Entra Connect › Connect Sync › 통과 인증 창 · 세부 분석은 Session 로그 활성화(문제 해결 때만 사용)
   - 데이터: 에이전트 상태(포털 통과 인증 창) · 에이전트 1대는 4코어 16GB에서 초당 300~400건 처리 · 운영 환경에서는 에이전트 최소 3대, 테넌트당 최대 40대
   - 해설: 에이전트 가용성과 DC 지연이 PTA 로그인 성공을 좌우합니다. 에이전트나 PTA 기능을 끄기 전에 클라우드 전용 Hybrid Identity Administrator 계정을 확보해 두어야 잠기지 않습니다
- 시나리오: 성공 :: DC가 성공을 응답해 반환, 장애는 로그로 확인
- 시나리오: 실패·만료·잠김 :: DC가 실패·만료·잠김을 응답해 로그인 거부

> 교육 포인트: PTA는 만료·잠김·로그온 시간 같은 AD 계정 정책을 로그인 때마다 바로 적용합니다. 에이전트는 총 3대를 권장합니다.
>
> 주의: PTA만 쓰면 유출 자격 증명 감지가 되지 않고 Entra Domain Services도 쓸 수 없으므로 이 경우 PHS를 함께 켭니다. PTA는 Connect Health와 연동되지 않습니다.
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-pta-security-deep-dive
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-pta-how-it-works
>
> 출처: https://learn.microsoft.com/windows/win32/api/winbase/nf-winbase-logonusera
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/tshoot-connect-pass-through-authentication
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-pta-current-limitations

#### L4 · 프록시 환경 — 에이전트가 Entra에 연결되고 큐를 수신하는 과정

1. [시작] 인증 에이전트 서비스가 시작되어 Entra로 연결을 시도
   - 주체: PTA 에이전트
   - 위치: 구역 ③ 에이전트 서버 — Microsoft Entra Connect Authentication Agent 서비스 (설치 경로 C:\Program Files\Microsoft Azure AD Connect Authentication Agent)
   - 데이터: 첫 연결은 에이전트가 Entra로 보내는 부트스트랩 요청(상호 인증 HTTPS 443) · 등록 때 발급된 인증서 사용 · 이후 큐 접근 키를 받아 큐에 지속 연결
   - 해설: 서비스가 큐를 수신하려면 먼저 이 아웃바운드 연결이 성공해야 합니다
2. [판단] 에이전트 서버가 프록시를 거쳐야 인터넷으로 나갈 수 있는가?
   - 주체: 프록시 · 방화벽
   - 위치: 구역 ② 경계 — 아웃바운드 프록시 · 방화벽 정책
   - 데이터: 프록시 필수 환경 = 직접 인터넷 연결이 막혀 있음
   - 해설: 직접 나갈 수 있으면 프록시 설정이 필요 없습니다
   - 예 → 3
   - 아니오 → 7
3. [판단] WPAD(웹 프록시 자동 검색)가 구성되어 있는가?
   - 주체: PTA 에이전트
   - 위치: 구역 ③ 에이전트 서버 — Windows의 프록시 자동 검색 (DNS의 wpad 조회)
   - 데이터: WPAD가 켜져 있으면 에이전트가 네트워크의 웹 프록시 서버를 자동으로 찾아 사용 · 없으면 수동 지정 필요
   - 해설: WPAD가 있는 환경에서는 별도 설정 없이 프록시를 탑니다. OS나 네트워크에 프록시가 지정돼 있어도 WPAD가 없으면 에이전트가 그것을 자동으로 알지 못합니다
   - 예 → 5
   - 아니오 → 4
4. [판단] 에이전트 설정 파일에 프록시 장비를 가리키는 defaultProxy가 있는가?
   - 주체: PTA 에이전트
   - 위치: C:\Program Files\Microsoft Azure AD Connect Authentication Agent\AzureADConnectAuthenticationAgentService.exe.config — system.net 노드 아래 defaultProxy
   - 데이터: 추가할 내용 — system.net › defaultProxy(enabled=true, useDefaultCredentials=true) › proxy(usesystemdefault=true, proxyaddress=http://프록시주소:8080, bypassonlocal=true) · 설치 전에 IE에 프록시를 설정해 두면 설치는 끝나지만 포털에는 Inactive로 표시됨
   - 해설: 이 노드가 없거나 프록시를 가리키지 않으면 에이전트는 설치돼도 Entra에 연결하지 못해 포털의 통과 인증 창에서 Inactive로 보이고 큐 요청을 받지 못합니다. 노드 이름은 system.net이며 변경 뒤 서비스 재시작이 필요한지는 문서에 명시돼 있지 않습니다 [확인 필요]
   - 예 → 5
   - 아니오 → [차단] 에이전트 Inactive — Entra가 에이전트를 인식하지 못함
5. [판단] 프록시가 에이전트와 Entra 사이 TLS를 검사하거나 종단하는가?
   - 주체: 프록시 · 방화벽
   - 위치: 구역 ② 경계 — 프록시의 SSL 검사(인라인 검사 · 종단) 기능
   - 데이터: 문서의 요구사항은 에이전트와 Entra 엔드포인트 사이 아웃바운드 TLS에 모든 형태의 인라인 검사와 종단을 피할 것 · 에이전트는 인증서 기반 상호 인증을 사용
   - 해설: 프록시가 TLS를 종단해 인증서를 바꿔치면 상호 인증이 깨져 에이전트가 연결에 실패합니다. 이 대상은 검사에서 제외해야 합니다
   - 예 → [차단] 연결 실패 — 상호 TLS 인증이 깨져 에이전트가 큐에 못 붙음
   - 아니오 → 6
6. [판단] 프록시 허용 목록에 필요한 대상과 포트가 열려 있는가?
   - 주체: 프록시 · 방화벽
   - 위치: 프록시 · 방화벽 허용 목록
   - 데이터: *.msappproxy.net · *.servicebus.windows.net(허용 목록을 도메인 이름으로 못 만들면 Azure 데이터센터 IP 범위 허용) · 443(필수) · 80(인증서 폐기 목록) · 아웃바운드 HTTP 프록시를 쓰면서 Seamless SSO를 쓸 경우 autologon.microsoftazuread-sso.com을 와일드카드 없이 명시
   - 해설: 하나라도 막히면 부트스트랩이나 큐 연결이 실패해 에이전트가 Inactive가 됩니다
   - 예 → 7
   - 아니오 → [차단] 대상 차단 — 부트스트랩 또는 큐 연결 실패
7. [처리] 에이전트가 부트스트랩 요청으로 큐 접근 키를 받고 큐에 지속 연결
   - 주체: Entra ID
   - 위치: 구역 ① 클라우드 — Entra ID가 테넌트 전용 Service Bus 큐의 접근 키를 발급
   - 데이터: 상호 인증 HTTPS 부트스트랩 → 접근 키 → 큐에 지속 아웃바운드 HTTPS(443) 연결 · 에이전트가 여러 대여도 같은 큐에 연결
   - 해설: 이 연결이 맺어져야 로그인 요청을 큐에서 받을 수 있습니다
8. [끝] 포털에서 에이전트가 Active로 표시
   - 주체: 로그
   - 위치: Entra 관리 센터 › Entra Connect › Connect Sync › 통과 인증 창 (에이전트 목록의 상태)
   - 데이터: 에이전트 상태 Active · 에이전트 서버 이벤트 로그의 연결 이벤트
   - 해설: 프록시 환경의 문제 대부분은 이 상태가 Active인지 확인하면 가려집니다
- 시나리오: 아니오 :: 프록시 없이 직접 연결되어 에이전트 Active
- 시나리오: 예 ▸ 예 ▸ 아니오 ▸ 예 :: WPAD로 프록시를 찾고 허용 목록까지 맞아 Active
- 시나리오: 예 ▸ 아니오 ▸ 예 ▸ 아니오 ▸ 예 :: defaultProxy를 직접 지정해 프록시 통과 후 Active
- 시나리오: 예 ▸ 예 ▸ 예 :: WPAD 프록시가 TLS를 종단해 연결 실패
- 시나리오: 예 ▸ 예 ▸ 아니오 ▸ 아니오 :: WPAD 프록시는 쓰나 허용 목록 누락으로 차단
- 시나리오: 예 ▸ 아니오 ▸ 예 ▸ 예 :: 수동 지정 프록시가 TLS를 종단해 연결 실패
- 시나리오: 예 ▸ 아니오 ▸ 예 ▸ 아니오 ▸ 아니오 :: 수동 지정 프록시의 허용 목록 누락으로 차단
- 시나리오: 예 ▸ 아니오 ▸ 아니오 :: WPAD도 defaultProxy도 없어 에이전트 Inactive

> 교육 포인트: PTA 에이전트는 프록시 설정을 OS에서 자동으로 가져오지 않습니다. WPAD가 없다면 에이전트 설정 파일에 system.net 노드를 직접 만들어 프록시 장비를 가리켜야 합니다.
>
> 주의: 프록시가 에이전트와 Entra 사이 TLS를 검사·종단하면 상호 인증이 깨집니다. 연결이 안 되는 에이전트는 포털에서 Inactive로 보이고, 모든 에이전트가 Inactive이면 PTA 로그인 전체가 실패하므로 클라우드 전용 Hybrid Identity Administrator 계정을 확보해 둡니다.
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-pta-faq
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-pta-quick-start
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-pta-security-deep-dive
