## L2 · Entra Internet Access — AI 범주 웹 차단 · Copilot 예외

- 설정(Control Plane): 인터넷 트래픽 전달 프로필 · 웹 콘텐츠 필터링 정책 | 보안 프로필 → 조건부 액세스 세션 제어 연결
- 강제(Enforcement): Global Secure Access 클라이언트 (트래픽 획득) | Microsoft SSE 에지 (웹 필터링 판정)
- 증적(Evidence): GSA 트래픽 로그 (모니터링 › 트래픽 로그) | KQL: NetworkAccessTraffic · SigninLogs(IsThroughGlobalSecureAccess)
- 메뉴(Admin Center): Global Secure Access > 연결 > 트래픽 전달 · 보안 > 웹 콘텐츠 필터링 정책 · 보안 프로필
- 라이선스(License): 웹 범주·FQDN 필터링은 Entra Internet Access 라이선스 대상(Entra Suite 포함), 사용자당 Entra ID P1/P2 필요 [확인 필요: 고객 라이선스 · 미리 보기 범위]

### L3 · 0 · 기능 상태 전이 — 직접 인터넷 → 정책 구성 → SSE 에지 통제

#### L4 · ⓪ 비활성 — 트래픽이 Global Secure Access를 거치지 않는다

1. [시작] 사용자가 AI 웹 사이트 접속 — 브라우저에서 AI 서비스 도메인 요청
   - 주체: 사용자
   - 위치: 브라우저 → AI 사이트 (HTTPS 443)
   - 데이터: DNS 질의 · TLS SNI(서버 이름) · 대상 FQDN
   - 해설: 사용자가 업무 PC 브라우저로 생성형 AI 사이트에 접속합니다
2. [처리] GSA 클라이언트·프로필 없음 — 로컬 인터넷 경로로 직행
   - 주체: 디바이스
   - 데이터: 클라이언트 미설치 · Internet access profile 꺼짐 · 사용자·기기가 프로필 할당 범위 밖. Microsoft Entra registered 기기는 Private Access 트래픽만 지원되어 인터넷 트래픽이 획득되지 않습니다
   - 해설: 요청이 Microsoft 보안 에지를 거치지 않고 곧바로 인터넷으로 나갑니다. 클라이언트가 있어도 IPv6와 UDP(QUIC 포함)는 기본적으로 획득되지 않고 직접 전송됩니다
3. [판단] 다른 웹 필터(프록시·방화벽)가 있는가?
   - 주체: 외부
   - 데이터: 네트워크 장비 정책 (IP·URL 기준, Entra 사용자 ID 미인식)
   - 해설: 있어도 장비 정책일 뿐 Entra 사용자·조건과는 연결되지 않습니다
   - 예 → 4
   - 아니오 → 5
4. [처리] 네트워크 장비가 대역·URL만으로 판정 — 사용자별 예외 불가
   - 주체: 외부
   - 데이터: 사무실 방화벽 규칙 (사무실 밖 원격 근무는 적용 안 됨)
   - 해설: 재택·출장 사용자는 이 장비를 지나지 않아 같은 통제를 받지 못합니다
5. [끝] 제한 없는 접속 · Entra에는 기록 없음
   - 주체: 로그
   - 위치: Global Secure Access › Monitor › Traffic logs (Reports Reader 이상으로 조회)
   - 데이터: NetworkAccessTraffic 행 없음 — 클라이언트를 거치지 않은 트래픽은 로그 자체가 생기지 않습니다
   - 해설: 어떤 AI 사이트에 접속했는지 Entra에서 확인할 수 없습니다
- 시나리오: 예 :: 다른 웹 필터가 있어도 Entra 기록 없이 제한 없는 접속
- 시나리오: 아니오 :: 다른 필터도 없어 제한 없이 접속, 기록 없음

#### L4 · ① 구성 — 전달 프로필 · 웹 필터링 · 보안 프로필 · CA를 만든다

1. [시작] 관리자가 Entra 관리 센터에 로그인 — 역할 두 가지 필요
   - 주체: 관리자
   - 위치: entra.microsoft.com — Global Secure Access Administrator(프로필·정책·클라이언트 다운로드), 프로필 사용자 할당에는 Application Administrator도 필요, Conditional Access Administrator(CA 정책), 트래픽 로그 조회는 Reports Reader 이상, 진단 설정은 Security Administrator
   - 데이터: Entra 역할 할당 (roleAssignments). 제품 라이선스는 Entra Internet Access(Entra Suite 포함) + 사용자당 Entra ID P1/P2이며, 웹 범주·FQDN 필터링·TLS 검사는 Internet Access 라이선스 대상입니다. 에이전트 대상 네트워크 제어는 Microsoft Agent 365 라이선스가 추가로 필요합니다
   - 해설: 프로필·정책 작업과 조건부 액세스 작업에 필요한 역할이 서로 다릅니다
2. [처리] 인터넷 액세스 프로필 켜기 — Internet access profile 토글
   - 주체: 관리자
   - 위치: Global Secure Access › 연결(Connect) › 트래픽 전달(Traffic forwarding) › Internet access profile
   - 데이터: 프로필 상태 = 켜짐 (기본 획득 범위 TCP 80·443). 같은 화면에서 Microsoft traffic profile도 함께 켜는 것이 Microsoft 트래픽 최적 라우팅에 권장됩니다
   - 해설: 켜면 클라이언트 기기의 인터넷 트래픽이 Microsoft SSE 에지로 향합니다. 규칙·프로필 변경은 클라이언트에 10~20분 뒤 나타나며, 그래도 안 보이면 프로필을 껐다 켭니다
3. [처리] 획득·우회 규칙 점검 — Custom Bypass 예외 추가
   - 주체: 관리자
   - 위치: 트래픽 전달 › Internet Access policies › 보기 › Custom Bypass › 규칙 추가
   - 데이터: 대상 유형(FQDN · IP · IP subnet · IP range) · 포트 · 프로토콜(TCP/UDP) — 예: VPN 엔드포인트. 여러 값은 쉼표로 구분하고 공백을 넣지 않습니다(예: chat.com,contoso.com)
   - 해설: 에지로 보내면 안 되는 대상(VPN 엔드포인트, 네트워크 ACL을 쓰는 엔드포인트 등)은 우회 목록에 넣고, Default Bypass·Microsoft Traffic Bypass·Default Acquire 규칙은 바꿀 수 없습니다. 규칙은 위에서 아래로 평가되어 우회에 걸리면 획득되지 않습니다
4. [처리] 프로필 적용 대상 지정 — 사용자·그룹 할당
   - 주체: 관리자
   - 위치: Global Secure Access › Connect › Traffic forwarding › Internet access profile › Assignments › User and device assignments › View (+ Device platform assignments)
   - 데이터: No users and devices · All users and devices · Selected users and devices(사용자·그룹·기기). 보안 그룹과 중첩 그룹, 동적 그룹을 지원하고 사용자·기기 조건과 기기 플랫폼 조건은 AND로 평가됩니다. 사용자·그룹 할당의 최소 클라이언트 버전은 1.7.376.0입니다
   - 해설: 시범 그룹부터 적용해 전체 사용자에게 한 번에 영향이 가지 않게 합니다. 프로필은 기기에 로그인한 Entra 사용자 기준으로 가져오며, 한 기기에 여러 사용자가 동시에 로그인한 경우는 지원되지 않습니다
5. [처리] 웹 콘텐츠 필터링 정책 만들기 — 이름 · 설명
   - 주체: 관리자
   - 위치: Global Secure Access › 보안(Secure) › 웹 콘텐츠 필터링 정책 › 정책 만들기(Create policy)
   - 데이터: 정책 이름 · 설명 · 동작(Action = Block 또는 Allow) — 동작은 규칙이 아니라 정책 단위로 정해집니다 (Graph filteringPolicies의 action 속성)
   - 해설: 정책은 같은 동작을 갖는 규칙의 묶음입니다. 그래서 차단용 정책과 허용 예외용 정책을 따로 만듭니다
6. [처리] 규칙 1: AI 범주 차단 — Artificial Intelligence 범주
   - 주체: 관리자
   - 위치: 정책(Action = Block) › Add rule › 규칙 이름 입력 · 웹 범주 'Artificial Intelligence'(Liability 그룹) 선택 › Add
   - 데이터: 규칙 대상 = 웹 범주 'Artificial Intelligence'(GenerativeAI를 쓰는 사이트), 로그에는 DestinationWebCategories로 남음. 범주 판정에 이의가 있으면 문서에 안내된 메일 양식으로 재분류를 요청할 수 있고, 로그의 Web category 열에서 사이트의 범주를 확인할 수 있습니다
   - 해설: 범주 하나로 생성형 AI 사이트를 한꺼번에 차단 대상으로 지정합니다. 차단 동작은 규칙이 아니라 소속 정책의 Action에서 옵니다
7. [처리] 규칙 2: Copilot 주소 허용 예외 — 별도 정책
   - 주체: 관리자
   - 위치: Secure › Web content filtering policies › Create policy(Action = Allow) › Add rule › 대상 유형 FQDN 입력
   - 데이터: FQDN 쉼표 목록, 공백 없이 — 예: copilot.microsoft.com [확인 필요: 실제 사용 도메인]. 프로토콜(https://)·포트·경로는 넣지 않고 도메인만 씁니다. *.domain.com은 하위 도메인만 일치하고 루트 도메인은 일치하지 않으므로 둘 다 필요하면 *.도메인,도메인 형식으로 씁니다
   - 해설: 허용할 Copilot 주소는 차단 정책과 분리한 Allow 정책으로 만들어 더 높은 우선순위로 예외를 겁니다
8. [처리] 보안 프로필 만들기 — 두 정책을 우선순위로 연결
   - 주체: 관리자
   - 위치: Secure › Security profiles › Create profile › Link a policy › Existing policy › Add (정책마다 우선순위와 Enabled 상태 지정)
   - 데이터: 우선순위 번호 100(높음)~65000(낮음), 번호는 프로필 안에서 고유 — 예: Allow 정책 100, Block 정책 200. 향후 끼워 넣을 수 있게 약 100 간격을 두길 권장하며, 프로필 하나에 정책을 여러 개 연결할 수 있습니다
   - 해설: 프로필 안에서 숫자가 작은 정책이 먼저 평가되므로 Allow를 더 작은 번호에 둡니다 (방화벽 규칙과 같은 방식)
9. [처리] 조건부 액세스 정책에 보안 프로필 연결 — 세션 제어
   - 주체: 관리자
   - 위치: Entra ID › Conditional Access › Policies › New policy › Assignments(대상 사용자·그룹) › Target resources › 'All internet resources with Global Secure Access' › Session › 'Use Global Secure Access security profile' › 프로필 선택 › Enable policy = On
   - 데이터: CA 정책 상태(On)와 사용자·그룹 할당, 보안 프로필 선택. Explicit Forward Proxy(미리 보기)는 이 리소스 그룹에 포함되지 않아 별도 CA 구성이 필요합니다
   - 해설: CA 정책이 어떤 사용자에게 어떤 보안 프로필을 줄지 결정하는 전달 수단입니다. 새 보안 프로필이 적용되려면 사용자가 프로필 ID 클레임이 든 새 액세스 토큰을 받아야 해서 최대 60~90분 걸리고, 기존 프로필의 변경은 훨씬 빨리 반영됩니다
10. [끝] 기기에 클라이언트 배포 — 사전 조건 확인
   - 주체: 디바이스
   - 위치: Global Secure Access › Connect › Client download › Download Client 후 설치 (Windows 등) · 규칙은 클라이언트에 10~20분 후 반영
   - 데이터: 기기는 Entra joined · hybrid joined · registered(registered는 Private Access만 지원), 64비트 Windows 10(LTSC 2021 이상)·Windows 11(Arm64는 별도 설치 파일), 로컬 관리자 권한. 사전 조건 — Secure DNS(DoH) 끄기 · Chrome/Edge 내장 DNS 클라이언트 끄기 · IPv4 우선(IPv6는 획득되지 않음) · QUIC(UDP 443) 차단 권장(예: New-NetFirewallRule -DisplayName "Block QUIC" -Direction Outbound -Action Block -Protocol UDP -RemotePort 443)
   - 해설: 클라이언트와 위 사전 조건이 갖춰져야 트래픽이 에지로 실제 들어옵니다. Azure Virtual Desktop 단일 세션과 Windows 365는 지원되지만 다중 세션은 지원되지 않습니다

#### L4 · ② 활성 — 요청이 에지에서 정책 순서대로 판정된다

1. [시작] 사용자가 AI 웹 사이트 접속 — ⓪과 같은 요청
   - 주체: 사용자
   - 위치: 브라우저 → 대상 FQDN (HTTPS 443)
   - 데이터: 대상 FQDN · TLS SNI
   - 해설: 구성 전과 똑같은 요청이 이번에는 클라이언트에 먼저 잡힙니다
2. [처리] GSA 클라이언트가 규칙 평가 — 획득 여부 결정
   - 주체: 디바이스
   - 위치: 클라이언트 트레이 아이콘 우클릭 › 고급 진단(Advanced diagnostics) › Forwarding profile 탭
   - 데이터: Bypass · Acquire 규칙 목록과 우선순위 (정책 테스터로 확인 가능). 새 규칙은 클라이언트에 10~20분 뒤 보이며, 안 보이면 Internet Access 프로필을 껐다 켭니다
   - 해설: 클라이언트는 우회 규칙을 먼저 보고 획득할 대상만 에지로 보냅니다. 획득된 트래픽은 진단 화면의 Internet channel 아래에서 확인됩니다
3. [판단] 획득 대상인가? (우회 규칙에 해당하지 않음)
   - 주체: 디바이스
   - 데이터: Custom/Default Bypass 일치 여부 · 포트 80·443 여부
   - 해설: 우회 대상이거나 획득 범위 밖이면 에지를 거치지 않습니다
   - 예 → 4
   - 아니오 → [끝] 직접 전송 — 에지 통제 없음
4. [처리] 클라이언트 → Microsoft SSE 에지 — 터널 전송
   - 주체: 디바이스
   - 위치: GSA 클라이언트 터널 → 가까운 Microsoft 에지 위치. 클라이언트가 Entra ID로 인증·인가를 받고 터널이 수립됩니다
   - 데이터: 사용자 · 디바이스 컨텍스트가 담긴 Entra 토큰. 유효한 PRT(Primary Refresh Token)가 있으면 인증이 끊김 없이 진행되고, 클라이언트는 에이전트/사용자 구분용 작업·프로세서 메타데이터도 함께 보냅니다
   - 해설: 요청에 사용자·디바이스 신원이 함께 실려 에지로 전달됩니다
5. [처리] 조건부 액세스 평가 — 보안 프로필 선택
   - 주체: Entra ID
   - 위치: Microsoft Entra ID 토큰 발급 시점의 조건부 액세스 평가 (대상 리소스 All internet resources with Global Secure Access)
   - 데이터: 사용자·그룹에 일치한 CA 정책의 세션 제어 → 보안 프로필이 액세스 토큰에 프로필 ID 클레임으로 담김, 기준선 프로필은 항상 마지막 적용(우선순위 65000)
   - 해설: Entra가 이 사용자에게 적용할 보안 프로필을 정합니다. 에지는 토큰을 검증한 뒤 토큰 안의 프로필을 우선순위 순으로 적용하며, 새 프로필 연결이 반영되려면 새 토큰이 필요합니다
6. [처리] 웹 콘텐츠 필터링 정책을 우선순위 순으로 비교
   - 주체: 리소스
   - 위치: Microsoft SSE 에지 (Secure Web Gateway)
   - 데이터: 소스 유형 · HTTP 메서드 · 웹 범주 · URL · FQDN 조건 비교. 평문 HTTP는 URL로, TLS로 암호화된 HTTPS는 TLS 검사가 없으면 SNI로 판정하며, 규칙에 일치하면 웹 콘텐츠 필터링 평가를 멈춥니다
   - 해설: 보안 프로필 안의 정책을 숫자가 작은 것부터 대상과 비교합니다. TLS 검사를 켜면 HTTPS의 메서드·경로까지 볼 수 있습니다
7. [판단] Copilot 허용 규칙에 일치하는가?
   - 주체: 리소스
   - 데이터: Allow 정책 (우선순위 100)의 FQDN 일치 여부
   - 해설: 우선순위가 높은 Allow가 먼저 맞으면 이후 Block 규칙은 보지 않습니다
   - 예 → 9
   - 아니오 → 8
8. [판단] 차단된 AI 범주에 일치하는가?
   - 주체: 리소스
   - 데이터: Block 정책 (우선순위 200)의 Artificial Intelligence 범주, 일치 시 Action = Denied. 차단 시 HTTP(및 TLS 검사된 트래픽)는 평문 브라우저 오류, TLS 검사가 없는 HTTPS는 "Connection Reset" 오류로 보입니다
   - 해설: 범주에 맞으면 차단되고, TLS 검사 트래픽이면 Settings › Session management › Custom Block Page에서 만든 사용자 지정 차단 메시지가 보입니다
   - 예 → [차단] 차단 — 차단 페이지 표시, Denied 기록
   - 아니오 → 9
9. [끝] 허용 후 대상 사이트로 전달 — 로그 기록
   - 주체: 로그
   - 위치: Global Secure Access › 모니터링(Monitor) › 트래픽 로그(Traffic logs)
   - 데이터: NetworkAccessTraffic: Action(Allowed/Denied/Redirect) · PolicyName · PolicyRuleId · RuleName · FilteringProfileName · DestinationWebCategories · HttpMethod · IsAgentic. 보기 최소 역할은 Reports Reader입니다
   - 해설: 허용도 차단도 어느 정책·규칙이 판정했는지 트래픽 로그에 남습니다. 허용이면 대상 사이트로 그대로 전달됩니다
- 시나리오: 예 ▸ 예 :: Copilot 허용 규칙에 일치해 허용 후 전달
- 시나리오: 예 ▸ 아니오 ▸ 예 :: Copilot 규칙 불일치에 차단 AI 범주라 차단
- 시나리오: 예 ▸ 아니오 ▸ 아니오 :: 허용·차단 어느 규칙에도 안 맞아 허용 후 전달
- 시나리오: 아니오 :: 획득 대상이 아니라 에지 거치지 않고 직접 전송

> 교육 포인트: 웹 필터링은 "정책 → 보안 프로필 → 조건부 액세스 연결"까지 해야 사용자에게 적용됩니다. 예외(Copilot 허용)는 규칙을 고치는 대신 우선순위가 더 높은 Allow 정책으로 만듭니다.
>
> 주의: 한글 메뉴명은 영문 포털 경로(Connect › Traffic forwarding, Secure › Web content filtering policy)를 옮긴 것이라 실제 한글 UI와 다를 수 있습니다 [확인 필요: 한글 메뉴명 · 미리 보기 기능 범위].
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-configure-web-content-filtering
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/concept-internet-access
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/reference-web-content-filtering-categories
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-manage-internet-access-profile
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-manage-users-groups-assignment
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-install-windows-client
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-customize-block-page
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/overview-what-is-global-secure-access

### L3 · A · 트래픽 획득 — 전달 프로필 규칙이 클라이언트에서 평가되는 순서

#### L4 · 요청 한 건이 우회 · 획득 규칙을 거쳐 에지로 가는 길

1. [시작] 클라이언트가 전달 프로필 정책을 동기화
   - 주체: 디바이스
   - 위치: Global Secure Access 클라이언트 › 고급 진단 › Forwarding profile
   - 데이터: 정책 6종: Custom Bypass · Default Bypass · Microsoft Traffic Bypass · Custom Acquire · Default Acquire · Agentic Acquire (Default Bypass·Microsoft Traffic Bypass·Default Acquire·Agentic Acquire는 규칙 변경 불가)
   - 해설: 새 규칙은 클라이언트에 10~20분 뒤 반영되므로 변경 직후 테스트가 어긋날 수 있고, 안 보이면 프로필을 껐다 켭니다. 정책 보기: Connect › Traffic forwarding › Internet Access policies › View
2. [처리] 앱이 요청을 만들면 클라이언트가 가로챔
   - 주체: 디바이스
   - 데이터: 목적지 FQDN 또는 IP · 포트 · 프로토콜(TCP/UDP)
   - 해설: 클라이언트는 이 세 가지 값으로 규칙과 대조합니다
3. [판단] Private Access 앱 세그먼트에 해당하는가?
   - 주체: 디바이스
   - 데이터: Private access 프로필의 앱 세그먼트 (destination · port · protocol)
   - 해설: Private Access 경로가 인터넷 액세스보다 우선하여 인터넷 규칙은 적용되지 않고, 인터넷 액세스 클라우드 방화벽 규칙도 이 트래픽에는 적용되지 않습니다
   - 예 → [끝] Private Access 경로 — 인터넷 정책 미적용
   - 아니오 → 4
4. [판단] Custom · Default Bypass에 해당하는가?
   - 주체: 디바이스
   - 데이터: Custom Bypass(사용자 정의: VPN 엔드포인트 · squat IP 범위 · 네트워크 ACL을 쓰는 엔드포인트 등) · Default Bypass(사설 IP 범위 등, 변경 불가)
   - 해설: 규칙은 위에서 아래로 평가되며 우회에 걸리면 획득되지 않습니다. 광역 획득(Custom Acquire 와일드카드)과 겹쳐도 우회 규칙에 걸린 트래픽은 계속 제외됩니다
   - 예 → [끝] 직접 전송 — 에지를 거치지 않음
   - 아니오 → 5
5. [판단] Microsoft 엔드포인트인가?
   - 주체: 디바이스
   - 데이터: Microsoft Traffic Bypass 정책 — 인터넷 프로필에서 명시적으로 제외되고 Microsoft traffic profile로 획득되는 사전 정의 Microsoft 엔드포인트(변경 불가) [확인 필요: 평가 순서]
   - 해설: Microsoft 365 등은 인터넷 프로필이 아니라 Microsoft 트래픽 프로필 대상입니다. 인터넷 프로필을 켤 때 Microsoft traffic profile도 함께 켜는 것이 권장됩니다
   - 예 → [끝] Microsoft 프로필 경로 — AI 범주 규칙과 별개
   - 아니오 → 6
6. [판단] Custom Acquire 규칙에 해당하는가?
   - 주체: 디바이스
   - 위치: Connect › Traffic forwarding › Internet Access policies › View › Custom Acquire › Add rule (Default Acquire 토글을 끄고 Save)
   - 데이터: 사용자 정의 획득 규칙 — 대상 유형 FQDN · IP · IP subnet · IP range, 임의 포트 · TCP/UDP 지정 가능. 미리 보기: 클라이언트 트래픽은 FQDN `*`와 IPv4 `0.0.0.0/0`(포트 0-65535, TCP·UDP) 와일드카드로 광역 획득할 수 있으나 IPv6·DNS 트래픽 획득은 지원되지 않고 QUIC은 획득·차단만 되며 종단 간 전달은 지원되지 않습니다
   - 해설: 타사 SWG와 함께 쓸 때 특정 목적지만 골라 획득하는 용도입니다 (예: chat.com만 Global Secure Access, 나머지는 타사)
   - 예 → 8
   - 아니오 → 7
7. [판단] Default Acquire에 해당하는가? — TCP 80·443
   - 주체: 디바이스
   - 데이터: 기본 획득 범위 — 모든 TCP 80·443 (모든 우회·Custom Acquire 규칙 뒤에 평가되는 가장 낮은 우선순위, 변경 불가)
   - 해설: 일반 웹 트래픽은 이 규칙으로 획득되고, 그 밖의 포트·UDP는 기본적으로 제외됩니다. 클라우드 방화벽에 UDP 규칙을 만들어도 Default Acquire가 UDP를 획득하게 되지는 않습니다
   - 예 → 8
   - 아니오 → [끝] 직접 전송 — 획득 범위 밖
8. [처리] 획득한 트래픽을 SSE 에지로 터널링
   - 주체: 디바이스
   - 데이터: Internet channel 연결 (클라이언트 진단에서 확인)
   - 해설: 획득된 요청은 터널을 통해 Microsoft 에지의 필터링 단계로 넘어갑니다
9. [끝] 에지에서 웹 필터링 · 보안 프로필 평가로 이어짐
   - 주체: 리소스
   - 해설: 이후 판정은 ② 활성 시나리오의 5~9단계와 같습니다
- 시나리오: 예 :: 앱 세그먼트에 해당해 Private Access 경로
- 시나리오: 아니오 ▸ 예 :: Bypass 규칙에 해당해 에지 없이 직접 전송
- 시나리오: 아니오 ▸ 아니오 ▸ 예 :: Microsoft 엔드포인트라 Microsoft 프로필 경로
- 시나리오: 아니오 ▸ 아니오 ▸ 아니오 ▸ 예 :: Custom Acquire 규칙에 맞아 SSE 에지로 터널링
- 시나리오: 아니오 ▸ 아니오 ▸ 아니오 ▸ 아니오 ▸ 예 :: Default Acquire에 맞아 SSE 에지로 터널링
- 시나리오: 아니오 ▸ 아니오 ▸ 아니오 ▸ 아니오 ▸ 아니오 :: 어떤 규칙에도 안 맞아 직접 전송

> 교육 포인트: 획득 규칙은 "무엇을 에지로 보낼지"만 정합니다. 허용·차단은 웹 콘텐츠 필터링이나 클라우드 방화벽 같은 보안 정책이 결정합니다.
>
> 주의: 로컬 AI 에이전트(GitHub Copilot CLI · Claude CLI 등) 트래픽은 Agentic Acquire 정책으로 따로 획득하며(처음에는 Create Agentic Acquire 버튼으로 만들고 Custom Acquire·Default Acquire 토글은 끔) Windows·Mac에서만 지원되고 최소 클라이언트 버전은 Windows 2.31.125, Mac 1.1.26030604입니다. 에이전트 대상 네트워크 제어는 Microsoft Agent 365 라이선스가 필요합니다 [확인 필요: 미리 보기 여부].
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-manage-internet-access-profile

### L3 · B · 정책 연결 체인 — 웹 필터링 정책 → 보안 프로필 → 조건부 액세스

#### L4 · 규칙이 프로필로 묶이고 사용자에게 전달되는 구조

1. [시작] 웹 콘텐츠 필터링 정책 — 규칙의 묶음
   - 주체: 관리자
   - 위치: Global Secure Access › Secure › Web content filtering policies
   - 데이터: 규칙 = 웹 범주 · URL · FQDN (와일드카드 * 사용 가능, 쉼표 목록은 공백 없이). URL 필터링 미리 보기는 테넌트당 최대 1,000개 URL. 테넌트 한도: 보안 프로필 256개 · 정책 1,000개 · 규칙 1,000개 · 대상(IP·FQDN·URL·웹 범주 합계) 8,000개. 동작(Block/Allow)은 정책 단위이고 정책은 Global Secure Access Administrator가 관리합니다
   - 해설: 정책 하나에 범주·URL·FQDN 규칙을 여러 개 담을 수 있습니다
2. [처리] 규칙에 선택 조건 추가 — 소스 유형 · HTTP 메서드
   - 주체: 관리자
   - 위치: Add rule › Source type(Agent/User) · HTTP method request(GET · POST · PUT · PATCH · DELETE) — 각각 필드를 활성화(Enable)해 규칙에 포함
   - 데이터: 같은 속성 안은 OR, 속성 사이는 AND. Source type = Agent(Copilot 에이전트·자율 AI 도구 트래픽) 또는 User(브라우저·앱 트래픽), 에이전트가 아닌 요청은 User로 분류되므로 일치시키려면 User를 명시해야 합니다
   - 해설: 예: AI 에이전트의 PUT·PATCH·DELETE만 차단하고 읽기(GET)는 허용할 수 있고, SocialNetworking 범주를 Agent에게만 차단할 수도 있습니다
3. [처리] 조건 사용 시 TLS 검사 필요
   - 주체: 리소스
   - 데이터: TLS 검사 꺼짐이면 SNI 기반 규칙만 적용되고 HTTP 메서드·소스 유형 규칙은 HTTPS에 집행되지 않습니다(암호화되지 않은 HTTP는 항상 검사 가능). 소스 유형은 클라이언트 연결만 지원하고 원격 네트워크는 불가. 소스 유형 분류는 클라이언트가 보내는 작업·프로세서 메타데이터에 의존합니다
   - 해설: 암호화된 HTTPS의 메서드는 TLS 검사 없이는 에지가 볼 수 없습니다. TLS 검사는 Internet Access 라이선스 기능이며 사용자 지정 차단 페이지의 전제이기도 합니다
4. [처리] 정책을 보안 프로필에 연결 — 우선순위 부여
   - 주체: 관리자
   - 위치: Secure › Security profiles › Create profile › Link a policy › Existing policy
   - 데이터: 프로필 하나에 정책 여러 개, 우선순위 100~65000 (고유 번호, 간격 약 100 권장), 연결 상태 Enabled/Disabled · 로깅 상태 지정. 예: Allow Bing Maps 150, Block YouTube Shorts 200
   - 해설: 같은 프로필 안에서 숫자가 작은 정책부터 방화벽처럼 평가되고, 규칙에 일치하면 이후 평가를 멈춥니다
5. [처리] 보안 프로필을 CA 정책 세션 제어에 연결
   - 주체: 관리자
   - 위치: Entra ID › Conditional Access › Policies › Session › Use Global Secure Access security profile
   - 데이터: CA 정책 ↔ 보안 프로필 (프로필 하나를 CA 여러 개에 연결 가능). 대상 리소스는 All internet resources with Global Secure Access
   - 해설: 사용자·그룹·조건에 따라 서로 다른 프로필이 전달되어 사용자 인식 정책이 됩니다. CA 쪽 변경은 반영에 약 1시간이 걸리고, 시험할 때는 사용자 개요의 Revoke sessions로 새 토큰을 받게 할 수 있습니다
6. [판단] 사용자에게 일치하는 CA 정책이 둘 이상인가?
   - 주체: Entra ID
   - 데이터: 일치한 CA 정책에 연결된 보안 프로필 목록
   - 해설: 여러 개가 일치하면 각 프로필을 프로필 우선순위 순서로 모두 처리합니다
   - 예 → 7
   - 아니오 → 8
7. [처리] 일치한 프로필을 프로필 우선순위 순으로 처리
   - 주체: 리소스
   - 데이터: 일치한 CA 정책에 연결된 보안 프로필 전체 — 각 프로필 안에서는 정책 우선순위(100~65000) 순으로 평가, 기준선 프로필(65000)은 마지막
   - 해설: 프로필 간 순서도 우선순위 번호가 기준이며, 충돌 시 더 제한적인 동작이 이긴다고 안내됩니다 [확인 필요: 프로필 간 충돌 처리 방식]
8. [처리] 기준선 프로필을 마지막에 적용 — 모든 트래픽 대상
   - 주체: 리소스
   - 위치: Secure › Security profiles › Baseline profile › Link a policy › Existing policy (Graph: GET /beta/networkaccess/filteringProfiles 에서 우선순위 65000 프로필 확인)
   - 데이터: 우선순위 65000, CA 연결 없이 원격 네트워크 트래픽을 포함한 모든 Internet Access 트래픽에 적용되며 다른 CA 정책이 맞아도 실행됩니다. 원격 네트워크에는 소스 유형 조건이 적용되지 않고 범주·URL·FQDN·HTTP 메서드 규칙은 사용 가능합니다
   - 해설: 어떤 CA 정책도 맞지 않는 트래픽까지 잡는 최후 안전망입니다. 원격 네트워크(지사 연결)는 Entra ID P1 + Internet Access 라이선스 합계 50개 이상이 있어야 구성할 수 있습니다
9. [끝] 최종 동작 결정 — Block 또는 Allow
   - 주체: 로그
   - 데이터: 로그의 FilteringProfileName · PolicyName · RuleName · Action
   - 해설: 같은 우선순위에서 동작이 충돌하면 차단이 우선한다고 문서에 안내됩니다. 한편 웹 콘텐츠 필터링 평가는 우선순위 순서로 진행하다 일치하는 규칙에서 멈추므로 Allow를 높은 우선순위에 두는 예외 설계가 성립합니다 [확인 필요: 두 설명의 적용 범위]
- 시나리오: 예 :: CA 정책이 여럿이라 우선순위대로 처리
- 시나리오: 아니오 :: 일치 정책이 하나라 기준선 프로필만 적용

> 교육 포인트: "Allow msn.com(우선순위 100) + Block News(우선순위 200)"처럼 Allow를 더 높은 우선순위에 두는 것이 예외 설계의 기본형입니다.
>
> 주의: 원격 네트워크(지사) 트래픽은 CA 연결이 아니라 기준선 프로필로만 통제되고, 소스 유형 조건은 적용되지 않습니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/concept-internet-access
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-configure-web-content-filtering

### L3 · C · 트래픽 로그 — 차단 원인 추적과 장기 분석

#### L4 · 로그를 보고 → 규칙을 찾고 → 내보내 분석한다

1. [시작] 관리자가 트래픽 로그를 연다
   - 주체: 관리자
   - 위치: Global Secure Access › Monitor › Traffic logs — 보기는 Reports Reader 이상 (Global Secure Access Administrator · Log Reader 역할로도 접근)
   - 데이터: 상단 요약 + Microsoft 365 / Private access 필터 버튼. 로그 상세에 Session ID는 아직 제공되지 않습니다
   - 해설: 요약에서 전체 트랜잭션 수와 트래픽 종류별 분포를 먼저 봅니다
2. [처리] 세션 → 연결 → 트랜잭션 구조 이해
   - 주체: 로그
   - 데이터: ConnectionId · TransactionId (요청/응답 한 쌍). 연결(connection)은 출발·목적지 IP·포트와 FQDN(5-tuple)이며, 미리 보기 Connections 탭은 같은 flow correlation ID를 공유한 최근 24시간의 트랜잭션을 집계해 Active/Closed 상태와 차단 건수를 실시간으로 보여 줍니다
   - 해설: 한 사이트 접속은 여러 연결과 트랜잭션으로 나뉘어 기록됩니다
3. [처리] 필터·열 추가 — 사용자 · 범주 · Action
   - 주체: 관리자
   - 위치: 트래픽 로그 › 열(Columns) · 필터 추가(Add filter)
   - 데이터: UserPrincipalName · Web category · Action · DestinationFqdn · Device category(client 또는 remote network) · Sent/Received Bytes. 특정 연결은 로그 상세의 connectionId를 복사해 Add filter › Connection ID에 붙여넣어 모아 봅니다
   - 해설: 의심 사용자나 특정 범주로 좁혀 보면 원인 분석이 빨라집니다
4. [판단] Action이 Denied인가?
   - 주체: 로그
   - 데이터: Action = Allowed / Denied / Redirect
   - 해설: 차단된 행은 어느 규칙 때문인지 바로 따라갈 수 있습니다
   - 예 → 5
   - 아니오 → 6
5. [처리] 차단 원인 규칙 확인
   - 주체: 로그
   - 데이터: PolicyName · PolicyRuleId · RuleName · FilteringProfileName · TlsAction (TLS 정책은 TlsPolicyName · TlsRuleName). 에이전트 트래픽은 IsAgentic · AIAgentName · AgentPlatform으로도 구분됩니다
   - 해설: 이 필드로 어느 정책·규칙·프로필이 판정했는지 확정합니다
   - 다음 → 7
6. [처리] 허용된 트래픽의 범주 확인 — 예외 후보 발굴
   - 주체: 로그
   - 데이터: DestinationWebCategories · DestinationUrl · CloudAppCategory
   - 해설: 허용된 AI 관련 접속을 찾아 차단 범위를 넓히거나 예외를 정리합니다
7. [처리] 진단 설정으로 로그 내보내기 — 장기 보관
   - 주체: 관리자
   - 위치: Entra ID › Monitoring & health › Diagnostic settings › Add diagnostic setting › NetworkAccessTrafficLogs 선택 (최소 Security Administrator)
   - 데이터: 대상: Log Analytics 작업 영역 · Storage account(보존 일수 지정) · Event Hub · 파트너 솔루션
   - 해설: 포털에서 보는 기본 보관 기간을 넘겨 분석하려면 외부 대상으로 보내야 합니다
8. [처리] KQL로 AI 범주 접속 집계
   - 주체: 관리자
   - 위치: Log Analytics 작업 영역 › 로그 (테이블 NetworkAccessTraffic — Basic·Auxiliary 테이블 지원)
   - 데이터: NetworkAccessTraffic | where TimeGenerated > ago(7d) | summarize count() by Action, DestinationFqdn, PolicyName. 범주별로는 DestinationWebCategories, 앱 범주는 CloudAppCategory 열을 씁니다
   - 해설: 일주일치 허용·차단을 대상 도메인과 정책별로 집계해 튜닝 근거로 씁니다
9. [끝] 정책 튜닝 — 예외 추가 또는 차단 확대
   - 주체: 관리자
   - 해설: 결과를 보고 Allow 예외나 범주 규칙을 고친 뒤 다시 로그로 효과를 확인합니다
- 시나리오: 예 :: Denied 로그를 내보내 KQL 집계 후 정책 튜닝
- 시나리오: 아니오 :: Denied 아닌 로그를 내보내 KQL 집계 후 튜닝

> 교육 포인트: SigninLogs에도 IsThroughGlobalSecureAccess · GlobalSecureAccessIpAddress 열이 있어 로그인 이벤트가 GSA 경유였는지 구분할 수 있습니다.
>
> 주의: 트래픽 로그는 미리 보기 표기가 있는 기능이라 화면 구성이 바뀔 수 있고, 진단 설정에서 선택해도 Internet/Private Access를 쓰지 않으면 새 데이터가 생기지 않습니다 [확인 필요: 미리 보기].
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-view-traffic-logs
>
> 출처: https://learn.microsoft.com/azure/azure-monitor/reference/tables/networkaccesstraffic
