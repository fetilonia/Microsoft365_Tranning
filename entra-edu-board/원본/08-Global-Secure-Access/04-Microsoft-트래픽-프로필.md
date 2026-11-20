## L2 · Microsoft 트래픽 프로필 — Microsoft 365 · Entra 트래픽 최적 라우팅

- 설정(Control Plane): Microsoft traffic profile 켜기 · 정책 그룹(Exchange Online · SharePoint Online and Microsoft OneDrive · Microsoft Teams · Microsoft 365 Common and Office Online)·규칙별 Forward/Bypass | 사용자·그룹 할당 · 원격 네트워크 할당 · 조건부 액세스 연결 · 적응형 액세스(CA 신호)
- 강제(Enforcement): Global Secure Access 클라이언트 또는 원격 네트워크(IPsec) (트래픽 획득) | Microsoft SSE 에지 (Microsoft 서비스로 전달) | Microsoft Entra traffic(시스템 프로필, 포털에 안 보임)
- 증적(Evidence): 클라이언트 Advanced Diagnostics › Forwarding profile (M365 rules) | GSA 트래픽 로그 (Microsoft 365 필터) | KQL: NetworkAccessTraffic(TrafficType == "microsoft365") · AuditLogs(Category == "ForwardingPolicyManagement")
- 메뉴(Admin Center): Global Secure Access > 연결 > 트래픽 전달 · 원격 네트워크 · 설정 > 세션 관리 > 적응형 액세스 · 모니터링 > 트래픽 로그
- 라이선스(License): 문서상 Microsoft traffic profile의 사전 조건은 Microsoft Entra ID P1 또는 P2이고 Internet Access·Private Access 제품 라이선스는 열거되지 않습니다 [확인 필요: 고객 라이선스 · Entra Suite 포함 여부]

### L3 · 0 · 기능 상태 전이 — 직접 경로 → Microsoft 프로필 구성 → 에지 경유 최적 라우팅

#### L4 · ⓪ 비활성 — Microsoft 365 트래픽이 에지를 거치지 않는다

1. [시작] 사용자가 Microsoft 365 서비스에 접속 — Exchange Online · SharePoint Online · Teams
   - 주체: 사용자
   - 위치: Outlook · 브라우저 · Teams 앱 → Microsoft 365 서비스 FQDN (HTTPS 443)
   - 데이터: DNS 질의 · 목적지 FQDN · IP
   - 해설: 업무 PC에서 평소처럼 Microsoft 365 서비스에 접속합니다
2. [판단] Internet access profile만 켜 두었는가?
   - 주체: 관리자
   - 위치: Global Secure Access › Connect › Traffic forwarding
   - 데이터: Internet access profile 상태 · Microsoft traffic profile 상태. Internet access profile에는 Microsoft traffic profile에서 획득할 수 있는 대상이 포함되지 않고, 그 대상은 Microsoft traffic profile에서만 획득됩니다
   - 해설: Internet 프로필만 켜 두면 Microsoft 365 트래픽은 그 프로필로도 잡히지 않아 완전한 범위가 되지 않습니다. 문서는 두 프로필을 함께 켜라고 안내합니다
   - 예 → 3
   - 아니오 → 4
3. [처리] Microsoft 대상은 Internet 프로필에서도 획득되지 않음
   - 주체: 디바이스
   - 데이터: Microsoft traffic profile의 규칙 대상은 Internet 프로필 획득 대상에서 제외
   - 해설: 인터넷 트래픽에 보안 정책을 걸어도 Microsoft 365 서비스 구간은 그 정책 밖에 남습니다
4. [처리] 클라이언트 로컬 네트워크 경로로 직접 전송
   - 주체: 디바이스
   - 데이터: 에지를 거치지 않는 기존 라우팅 (VPN 우회·사무실 회선 경유 등 환경별 경로)
   - 해설: Microsoft traffic profile이 꺼져 있으면 Microsoft가 사전 정의한 Microsoft 365 FQDN·IP 규칙이 클라이언트에 내려가지 않고 직접 경로가 그대로 쓰입니다
5. [처리] Entra가 실제 위치·compliant network 신호를 못 받음
   - 주체: Entra ID
   - 위치: Global Secure Access › Settings › Session management › Adaptive access (프로필이 꺼져 있으면 신호 근거 없음)
   - 데이터: Source IP restoration은 Microsoft traffic profile 활성화가 전제이고, Universal Tenant Restrictions도 Microsoft traffic profile이 전제입니다. compliant network check는 GSA 클라이언트 또는 원격 네트워크를 거친 사용자만 통과할 수 있습니다
   - 해설: 사용자의 원래 egress IP를 Entra ID가 받지 못해 IP 기반 조건부 액세스·위험 탐지가 정확하지 않고, 외부 테넌트 로그인 통제와 compliant network 통제도 쓸 수 없습니다
6. [끝] 에지 통제 없음 · Entra에는 GSA 기록 없음
   - 주체: 로그
   - 위치: Global Secure Access › Monitor › Traffic logs › Microsoft 365 필터
   - 데이터: NetworkAccessTraffic 행 없음 — 클라이언트나 원격 네트워크를 거치지 않은 트래픽은 GSA 로그가 생기지 않습니다
   - 해설: Microsoft 365 트래픽이 어느 경로로 얼마나 흘렀는지 GSA에서는 확인할 수 없습니다
- 시나리오: 예 :: Internet 프로필만 켜져 Microsoft 대상은 직접 경로로 전송
- 시나리오: 아니오 :: 프로필이 모두 꺼져 직접 전송, GSA 기록 없음

> 교육 포인트: 사용자가 "Microsoft 365 커넥터"라고 부르는 것은 포털에 없는 이름입니다. 커넥터(개인 네트워크 커넥터)는 Private Access 구성 요소이고, Microsoft 365용 기능의 실제 이름은 Microsoft traffic profile(Microsoft 트래픽 전달 프로필)입니다. 감사 로그에는 "Microsoft 365 traffic forwarding profile", 클라이언트 진단 화면에는 "M365 rules", 트래픽 로그에는 "Microsoft 365" 필터·TrafficType = microsoft365로 남아 이름이 섞여 보입니다.
>
> 주의: Internet Access 프로필 문서에도 "Microsoft 365 등은 Microsoft traffic profile 대상"이라는 설명이 있어, 두 프로필을 함께 켜야 범위가 빠지지 않습니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/concept-microsoft-traffic-profile
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/concept-traffic-forwarding
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-source-ip-restoration

#### L4 · ① 구성 — 프로필 켜기 · 정책 그룹 · 할당 · 조건부 액세스를 설정한다

1. [시작] 관리자가 Entra 관리 센터에 로그인 — 역할 확인
   - 주체: 관리자
   - 위치: entra.microsoft.com — Global Secure Access Administrator(프로필 켜기·정책 그룹/규칙 변경), Application Administrator(튜토리얼은 사용자·그룹 할당 단계에 함께 요구), Conditional Access Administrator(조건부 액세스 정책)
   - 데이터: Entra 역할 할당. 문서의 라이선스 항목에는 Microsoft Entra ID P1 또는 P2가 사전 조건으로 적혀 있습니다 [확인 필요: 고객 라이선스]
   - 해설: 프로필·정책 작업과 사용자 할당, 조건부 액세스 작업에 필요한 역할이 서로 다릅니다
2. [처리] Microsoft traffic profile 켜기 — 토글
   - 주체: 관리자
   - 위치: Global Secure Access › Connect › Traffic forwarding › Microsoft traffic profile (Graph: GET /beta/networkAccess/forwardingProfiles 에서 trafficForwardingType = m365)
   - 데이터: 프로필 상태 = 켜짐. 켜는 시점에 지원되는 규칙 목록이 채워지고, 이후 Microsoft가 새 규칙을 도입하면 Microsoft profile에는 Forward, Internet Access profile에는 Bypass로 보입니다
   - 해설: 켜면 클라이언트가 있는 기기의 Microsoft 트래픽이 Microsoft SSE 프록시로 향합니다. 포털에는 "Microsoft 365 커넥터"라는 개체가 없고 이 토글이 그 기능입니다
3. [처리] Microsoft traffic policies 열기 — 정책 그룹 확인
   - 주체: 관리자
   - 위치: Traffic forwarding › Microsoft traffic profile › Microsoft traffic policies › View
   - 데이터: 정책 그룹 4개 — Exchange Online · SharePoint Online and Microsoft OneDrive · Microsoft Teams · Microsoft 365 Common and Office Online. 그룹마다 체크박스(사용 여부)와 규칙 목록: Destination type(FQDN 또는 IP subnet) · Destination · Ports · Protocol(TCP/UDP) · Action(Forward/Bypass)
   - 해설: 규칙은 Microsoft 365 IP 및 FQDN 목록에서 파생되어 서비스(트래픽 범주)별로 묶여 있습니다. Graph 응답에서 Teams 그룹은 "Skype for Business Online and Microsoft Teams" 이름으로 보입니다
4. [판단] 에지로 보내지 않고 로컬 경로를 유지할 대상이 있는가?
   - 주체: 관리자
   - 위치: Global Secure Access › 연결(Connect) › 트래픽 전달(Traffic forwarding) › Microsoft traffic policies (예외 후보 점검)
   - 데이터: 그룹 단위 · 규칙(FQDN·IP) 단위 예외 후보 — 예: 별도 경로를 유지해야 하는 대상
   - 해설: 기본값은 전체 Forward이고, 예외가 없으면 5단계를 건너뜁니다
   - 예 → 5
   - 아니오 → 6
5. [처리] 그룹 해제 또는 규칙 Action을 Bypass로 변경
   - 주체: 관리자
   - 위치: Microsoft traffic policies › 그룹 체크박스 해제 · 그룹 펼치기 › 규칙 Action 드롭다운 › Bypass (예: *.sharepoint.com)
   - 데이터: Action = Bypass 인 대상은 Global Secure Access가 처리하지 않지만 사용자는 계속 접근할 수 있습니다. 그룹 일부만 보내려면 그룹을 켠 채 규칙 Action만 바꿉니다
   - 해설: 우회한 대상은 Internet 프로필도 획득하지 않고 클라이언트의 로컬 라우팅 경로로 나갑니다
6. [처리] 사용자·그룹 할당 — 프로필 적용 대상
   - 주체: 관리자
   - 위치: Traffic forwarding › Microsoft traffic profile › User and group assignments › View › Assigned › Add user/group › Assign (프로필 Assignments의 User and device assignments: No users and devices · All users and devices · Selected users and devices, Device platform assignments)
   - 데이터: 사용자·그룹·기기(보안 그룹 · 중첩 그룹 · 동적 그룹)와 기기 플랫폼 조건은 AND로 평가됩니다. 사용자·그룹 할당의 최소 클라이언트 버전은 1.7.376.0입니다. 튜토리얼은 프로필을 사용자에게 할당해야 적용된다고 안내합니다
   - 해설: 시범 그룹부터 적용하는 단계적 배포가 가능합니다. 프로필은 기기에 로그인한 Entra 사용자 기준으로 가져오며 한 기기에 여러 사용자가 동시에 로그인한 경우는 지원되지 않습니다
7. [처리] 원격 네트워크 할당 — 지점 트래픽(클라이언트 없이)
   - 주체: 관리자
   - 위치: Traffic forwarding › Microsoft traffic profile › Remote network assignments › View › 원격 네트워크 선택 › Add (먼저 Global Secure Access › Connect › Remote networks에서 원격 네트워크를 만들어 둠)
   - 데이터: 원격 네트워크 ↔ Microsoft traffic profile 연결. 고객 장비(CPE) 뒤에 있는 기기는 클라이언트 없이 프로필이 적용됩니다
   - 해설: 지점 사무실처럼 클라이언트를 설치하기 어려운 환경에서 쓰는 선택 사항입니다
8. [처리] 조건부 액세스 연결 — 프로필 대상 CA 정책
   - 주체: 관리자
   - 위치: Entra ID › Conditional Access › Policies › Create new policy › Target resources › All internet resources with Global Secure Access › Grant (예: Require device to be marked as compliant) · 프로필 화면의 Linked Conditional Access policies › View
   - 데이터: CA 정책 ↔ Microsoft traffic profile 연결. Linked Conditional Access policies가 None이면 연결된 정책이 없는 상태입니다. Internet 프로필만 대상으로 하려면 All internet resources 대신 Select resources › Internet resources를 고릅니다
   - 해설: 사용자가 Microsoft 서비스용 네트워크 연결을 맺을 때 규정 준수 기기 같은 조건을 요구할 수 있습니다. 먼저 report-only로 확인한 뒤 On으로 바꿉니다
9. [처리] 적응형 액세스 신호 켜기 — Source IP restoration · compliant network
   - 주체: 관리자
   - 위치: Global Secure Access › Settings › Session management › Adaptive Access › Enable Conditional Access Signaling for Microsoft Entra ID
   - 데이터: 신호가 켜지면 Entra ID·Microsoft Graph가 사용자의 public egress IP를 받고 Conditional Access › Named locations에 "All Compliant Network locations"(Network Access 유형)이 생깁니다. 2025년 6월 이전에 GSA를 켠 테넌트는 직접 켜야 할 수 있습니다
   - 해설: 이 설정은 Microsoft traffic profile이 켜져 있어야 의미가 있습니다. 신호를 끄기 전에 IP 위치·compliant network 기반 CA 정책을 먼저 정리해야 사용자가 막히지 않습니다
10. [끝] 클라이언트 설치 · 규칙 반영 확인
   - 주체: 디바이스
   - 위치: Global Secure Access › Connect › Client download › 설치 후 트레이 아이콘 우클릭 › Advanced Diagnostics › Forwarding profile (Microsoft Entra rules · M365 rules 확인)
   - 데이터: 클라이언트는 Forwarding profile last checked 시각마다 프로필을 확인하고(튜토리얼은 5분 주기, 안 보이면 5분 뒤 Refresh), Health check 탭에서 결과를 볼 수 있습니다. 클라이언트는 IPv4만 터널링하고 Windows에서는 Secure DNS(DoH)를 꺼야 FQDN 규칙이 동작합니다 [확인 필요: 프로필 반영 시간 — 다른 문서는 최대 1시간 안내]
   - 해설: 규칙이 클라이언트에 내려와야 Microsoft 트래픽이 에지로 들어옵니다
- 시나리오: 예 :: 일부 대상은 Bypass로 두고 나머지를 Forward로 구성
- 시나리오: 아니오 :: 예외 없이 전체 Forward 기본값으로 구성

> 교육 포인트: Microsoft traffic profile은 규칙을 직접 만드는 프로필이 아니라 Microsoft가 정의한 규칙 묶음(정책 그룹)을 그대로 쓰며, 관리자는 켜기·그룹·규칙 Action(Forward/Bypass)·할당만 정합니다. 구성 순서는 켜기 → 할당 → (필요하면) 조건부 액세스·적응형 액세스 신호 → 클라이언트 확인입니다.
>
> 주의: 클라이언트 쪽 반영 시간은 문서마다 5분 · 10~20분 · 최대 1시간으로 달라 보입니다 [확인 필요]. 조건부 액세스 변경은 별도로 시간이 더 걸릴 수 있습니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-manage-microsoft-profile
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/tutorial-microsoft-traffic-enable-profile
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-manage-users-groups-assignment
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-target-resource-microsoft-profile

#### L4 · ② 활성 — Microsoft 트래픽이 규칙에 따라 에지로 가고 기록된다

1. [시작] 사용자가 Exchange Online · SharePoint · Teams에 접속 — ⓪과 같은 요청
   - 주체: 사용자
   - 위치: Outlook · 브라우저 · Teams 앱 → Microsoft 365 서비스 FQDN (예: *.sharepoint.com)
   - 데이터: DNS 질의 · 목적지 FQDN · IP · 포트
   - 해설: 구성 전과 같은 요청이 이번에는 클라이언트에 먼저 잡힙니다
2. [처리] 클라이언트가 forwarding profile 규칙과 대조 — 프로필 평가 순서
   - 주체: GSA 클라이언트
   - 위치: 트레이 아이콘 우클릭 › Advanced Diagnostics › Forwarding profile › M365 rules · Policy tester
   - 데이터: 규칙 열 — Priority(숫자가 작을수록 우선) · Destination · Protocol · Port · Action(tunnel/bypass) · Hardening(block/bypass) · Rule ID. 서비스는 트래픽을 Microsoft access profile → Private access profile → Internet access profile 순서로 평가합니다
   - 해설: 어느 프로필에도 맞지 않는 트래픽은 Global Secure Access로 전달되지 않습니다
3. [판단] 일치한 Microsoft 규칙의 Action이 Forward인가?
   - 주체: GSA 클라이언트
   - 데이터: 규칙 Action = Forward 또는 Bypass (그룹이 해제되었으면 그 그룹의 모든 규칙이 Bypass)
   - 해설: Forward면 에지로 획득하고, Bypass면 획득하지 않고 클라이언트의 로컬 경로로 나갑니다
   - Forward → 4
   - Bypass → [끝] 로컬 경로로 직접 전송 — Internet 프로필도 이 트래픽을 획득하지 않음
4. [처리] 클라이언트가 Entra 인증 후 에지로 터널 수립 — Microsoft 365 채널
   - 주체: GSA 클라이언트
   - 위치: GSA 클라이언트 터널 → 가까운 Microsoft 에지 (Advanced Diagnostics › Health check 의 Authentication certificate · Cached token · Tunneling succeeded)
   - 데이터: 클라이언트 인증서 · 캐시된 사용자 토큰. 조건부 액세스 정책(예: 규정 준수 기기 요구)은 이 연결 시점에 평가됩니다
   - 해설: Microsoft 365 트래픽은 인터넷 채널이 아니라 Microsoft 365 채널로 에지에 도달합니다
5. [판단] 인증·조건부 액세스를 통과해 서비스에 연결됐는가?
   - 주체: Entra ID
   - 데이터: 조건부 액세스 결과 · 클라이언트 연결 상태 · 규칙 Hardening 값
   - 해설: 승인·조건부 액세스 실패로 연결하지 못하면 문서상 서비스가 트래픽을 우회합니다
   - 연결 성공 → 6
   - 연결 실패 → [끝] 서비스가 트래픽을 bypass — 로컬 직접 전송이며 차단이 아님 (compliant network CA로 막을 수 있고 Hardening=block 규칙은 차단 [확인 필요: Microsoft 규칙 기본 Hardening 값])
6. [처리] 에지가 원본 소스 IP·compliant network 신호를 Entra에 전달
   - 주체: SSE 에지
   - 위치: Global Secure Access › Settings › Session management › Adaptive access · Entra ID › Conditional Access › Named locations › All Compliant Network locations
   - 데이터: 사용자의 원래 public egress IP(Entra ID·Microsoft Graph로 전달) · 로그인 시 compliant network 판정. Universal Tenant Restrictions를 켰다면 TRv2 정책 태그도 함께 적용됩니다
   - 해설: 클라우드 프록시를 거쳐도 IP 기반 조건부 액세스·위험 탐지가 사용자의 실제 위치를 기준으로 동작합니다
7. [처리] 에지가 Microsoft 서비스로 전달 — 최적 경로
   - 주체: SSE 에지
   - 데이터: 목적지 = Exchange Online · SharePoint Online and OneDrive · Teams · Microsoft 365 Common and Office Online 엔드포인트
   - 해설: 사전 정의된 Microsoft 엔드포인트만 획득해 지원 서비스의 성능 특성을 지키고 획득 규칙 구성을 단순하게 유지하는 것이 이 프로필의 목적입니다
8. [끝] 트래픽 로그에 Microsoft 365로 기록
   - 주체: 로그
   - 위치: Global Secure Access › Monitor › Traffic logs › Microsoft 365 버튼 (최소 Reports Reader)
   - 데이터: NetworkAccessTraffic — TrafficType = "microsoft365" · UserId · DestinationFqdn · SentBytes · ReceivedBytes. 로그 상세에서 Device category(client 또는 remote network) · Connection ID · Transaction ID · Action 확인
   - 해설: 어느 사용자의 Microsoft 365 트래픽이 어느 FQDN으로 얼마나 흘렀는지 남습니다
- 시나리오: Forward ▸ 연결 성공 :: 에지로 전달되어 Microsoft 365 로그 기록
- 시나리오: Forward ▸ 연결 실패 :: 연결 실패로 서비스가 우회해 로컬 직접 전송
- 시나리오: Bypass :: Bypass 규칙이라 획득되지 않고 로컬 직접 전송

> 교육 포인트: Microsoft 365 트래픽의 "허용·차단"을 웹 필터가 판정하지 않습니다. 이 프로필은 무엇을 에지로 보낼지(획득)를 정하고, 접근 통제는 조건부 액세스(compliant network 등)가 맡습니다.
>
> 주의: 클라이언트가 서비스에 연결하지 못하면 차단이 아니라 우회라는 점이 중요합니다. 이를 막으려면 compliant network를 요구하는 조건부 액세스 정책을 둡니다. QUIC는 Windows 클라이언트 제한 사항에서 Private Access와 Microsoft 365 워크로드만 지원한다고 안내됩니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/concept-traffic-forwarding
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-manage-microsoft-profile
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-source-ip-restoration
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-view-traffic-logs

### L3 · A · 정책 그룹별 전달·우회 — Forward · Bypass 결정과 Entra traffic 경계

#### L4 · 그룹 · 규칙 — 어디까지 Bypass할지 정한다

1. [시작] 관리자가 우회 범위를 검토 — 요구 사항 정리
   - 주체: 관리자
   - 위치: Global Secure Access › Connect › Traffic forwarding › Microsoft traffic policies › View
   - 데이터: 에지를 거치지 않아야 하는 Microsoft 대상 목록 · 영향받는 서비스(Exchange · SharePoint/OneDrive · Teams · Microsoft 365 Common/Office Online)
   - 해설: 우회는 서비스 접근을 막는 것이 아니라 GSA가 그 트래픽을 처리하지 않게 하는 설정입니다
2. [처리] 정책 그룹 4개와 규칙 필드 확인
   - 주체: 관리자
   - 위치: Microsoft traffic policies › 그룹 펼치기
   - 데이터: 그룹: Exchange Online · SharePoint Online and Microsoft OneDrive · Microsoft Teams · Microsoft 365 Common and Office Online. 규칙 필드: Destination type(FQDN · IP subnet) · Destination · Ports · Protocol(TCP/UDP) · Action(Forward/Bypass)
   - 해설: 정책 그룹은 서비스(워크로드) 단위로 규칙을 묶은 것이어서 서비스별로 켜고 끌 수 있습니다
3. [판단] 어느 범위로 우회할 것인가?
   - 주체: 관리자
   - 데이터: 우회 범위 = 프로필 전체 · 그룹 전체 · 그룹 안 일부 규칙(FQDN·IP) 중 하나
   - 해설: 문서는 특정 FQDN·IP, 정책 그룹 전체, Microsoft 프로필 전체를 모두 우회 대상으로 설명합니다
   - 프로필 전체 → 4
   - 그룹 전체 → 5
   - 일부 규칙 → 6
4. [처리] Microsoft traffic profile 끄기 — 모든 Microsoft 트래픽 획득 중단
   - 주체: 관리자
   - 위치: Traffic forwarding › Microsoft traffic profile 토글 끄기
   - 데이터: Source IP restoration · Universal Tenant Restrictions는 이 프로필이 켜져 있어야 동작하고, 감사 로그의 "Microsoft 365 traffic forwarding profile" 변경은 운영 알림 대상입니다
   - 해설: 가장 넓은 우회이므로 보안 신호가 함께 사라지는 점을 확인합니다
   - 다음 → 7
5. [처리] 그룹 체크박스 해제 — 그 그룹의 규칙 전체 Bypass
   - 주체: 관리자
   - 위치: Microsoft traffic policies › 정책 그룹 체크박스 해제
   - 데이터: 그룹이 해제되면 그 그룹 규칙이 다루는 모든 트래픽이 우회되고, 그룹이 켜져 있을 때만 규칙을 개별로 제어할 수 있습니다
   - 해설: 서비스 하나를 통째로 에지에서 빼야 할 때 쓰는 단위입니다
   - 다음 → 7
6. [처리] 그룹은 켜 두고 규칙 Action만 Bypass로 변경
   - 주체: 관리자
   - 위치: 그룹 펼치기 › 규칙 Action 드롭다운 › Bypass › 저장 (예: *.sharepoint.com)
   - 데이터: 규칙 Action Forward → Bypass. 같은 그룹의 나머지 규칙은 Forward 유지
   - 해설: 그룹 일부만 에지로 보내려면 그룹을 켠 뒤 상세 규칙의 Action만 바꿉니다
7. [처리] Bypass된 트래픽은 Internet 프로필도 획득하지 않음
   - 주체: 디바이스
   - 데이터: Microsoft profile에서 Bypass된 규칙 대상은 Internet Access 프로필이 켜져 있어도 획득하지 않고 클라이언트의 로컬 라우팅으로 인터넷에 나갑니다. Microsoft 프로필에서 획득 가능한 트래픽은 Microsoft 프로필에서만 획득할 수 있습니다
   - 해설: Internet 프로필의 웹 필터링을 Microsoft 대상에 대신 적용하는 우회로는 없습니다
8. [처리] 클라이언트에서 반영 확인 — Forwarding profile
   - 주체: GSA 클라이언트
   - 위치: 트레이 아이콘 › Advanced Diagnostics › Forwarding profile › M365 rules (Policy tester · Refresh details)
   - 데이터: Action 열 tunnel/bypass · Priority · Rule ID · Forwarding profile last checked
   - 해설: 포털 변경이 클라이언트 규칙에 실제로 내려왔는지 Action 열로 확인합니다
9. [끝] 변경 이력 확인 — 감사 로그와 변경 관리 대조
   - 주체: 로그
   - 위치: Entra ID › Monitoring & health › Audit logs · KQL: AuditLogs | where LoggedByService == "Global Secure Access" and Category == "ForwardingPolicyManagement"
   - 데이터: OperationName — Update Forwarding Profile · Update Forwarding Policy · Add Forwarding Policy · Delete Forwarding Policy. 관리자 한 번의 작업이 규칙 수만큼의 감사 항목을 만들 수 있습니다
   - 해설: 누가 어떤 정책 그룹을 바꿨는지 승인된 변경인지 대조합니다
- 시나리오: 프로필 전체 :: 프로필을 꺼서 Microsoft 트래픽 전체를 우회
- 시나리오: 그룹 전체 :: 그룹 해제로 해당 서비스 규칙 전체를 우회
- 시나리오: 일부 규칙 :: 그룹은 켜 두고 선택한 규칙만 Bypass

> 교육 포인트: 우회 단위는 프로필 › 정책 그룹 › 규칙의 세 단계입니다. 좁은 단위(규칙)부터 쓰고, 넓은 단위(그룹·프로필)는 보안 신호가 함께 사라지는 점을 확인한 뒤에만 씁니다.
>
> 주의: Teams 그룹 이름이 포털에서는 Microsoft Teams, Graph 응답에서는 Skype for Business Online and Microsoft Teams로 다르게 보입니다. 그룹이 해제된 상태에서 규칙의 Action을 따로 바꿔도 우회로 취급되는지는 화면에서 확인하세요 [확인 필요].
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/concept-microsoft-traffic-profile
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-manage-microsoft-profile
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-operate-microsoft-traffic

#### L4 · 평가 순서 — Entra traffic · Microsoft 프로필 · Internet 프로필의 경계

1. [시작] 클라이언트가 나가는 연결 하나를 본다
   - 주체: GSA 클라이언트
   - 위치: 트레이 아이콘 › Advanced Diagnostics › Forwarding profile (Microsoft Entra rules · M365 rules · Private access rules · Internet access rules)
   - 데이터: 활성화된 워크로드의 규칙만 목록에 보입니다
   - 해설: 목적지·포트·프로토콜을 규칙 목록과 우선순위 순으로 대조합니다
2. [판단] Microsoft Entra 인증·ID 트래픽인가?
   - 주체: GSA 클라이언트
   - 데이터: Microsoft Entra traffic — 로그인·Graph API·인증서 검증 등 Entra 인증 엔드포인트의 정의된 FQDN·IP 집합. 시스템이 관리하는 전용 프로필이라 포털에 보이지 않고, 다른 프로필이 하나라도 켜져 있으면 자동으로 켜지며 따로 켜거나 끌 수 없고 사용자·지점 할당도 필요 없습니다
   - 해설: 이 트래픽은 클라이언트 정책에서 가장 높은 우선순위로 먼저 처리되어 인증 트래픽이 항상 획득·보호됩니다 [확인 필요: 튜토리얼은 Microsoft traffic profile이 Entra ID 트래픽도 다룬다고 안내하고, UTR 문서는 Entra ID FQDN·IP를 Tunnel로 설정하라고 안내함]
   - Entra 트래픽 → [끝] Microsoft Entra traffic(시스템 프로필)이 최우선으로 획득
   - 그 외 → 3
3. [판단] Microsoft traffic profile 규칙에 해당하는가?
   - 주체: GSA 클라이언트
   - 데이터: Microsoft 365 IP 및 FQDN 목록에서 파생된 규칙 (서비스별 정책 그룹)
   - 해설: 평가 순서는 Microsoft access profile이 먼저이고, 해당하지 않으면 Private access profile, 마지막으로 Internet access profile입니다
   - Microsoft 대상 → 4
   - 대상 아님 → [끝] Private access → Internet access 프로필 평가로 이어지고 어디에도 안 맞으면 직접 전송
4. [판단] 규칙 Action이 Forward인가?
   - 주체: GSA 클라이언트
   - 위치: Microsoft traffic policies › 규칙 Action · 클라이언트 Policy tester로 대상별 활성 규칙 확인
   - 데이터: Action = Forward 또는 Bypass (그룹 해제 시 Bypass)
   - 해설: Bypass면 획득하지 않고 Internet 프로필도 이 대상을 가져가지 않습니다
   - Forward → 5
   - Bypass → [끝] 로컬 경로로 직접 전송, Internet 프로필도 획득 안 함
5. [처리] Microsoft 365 채널로 SSE 에지에 터널링
   - 주체: GSA 클라이언트
   - 데이터: Microsoft 365 채널 연결 (Health check › Tunneling succeeded가 활성 프로필별로 확인)
   - 해설: Forward된 연결만 에지로 들어가 조건부 액세스·로그 대상이 됩니다
6. [끝] 에지 처리 후 트래픽 로그에 Microsoft 365로 기록
   - 주체: 로그
   - 위치: Global Secure Access › Monitor › Traffic logs › Microsoft 365
   - 데이터: NetworkAccessTraffic TrafficType = "microsoft365"
   - 해설: 어느 프로필 경로였는지는 로그의 트래픽 유형으로 구분합니다
- 시나리오: Entra 트래픽 :: 시스템 프로필이 Entra 인증 트래픽을 최우선 획득
- 시나리오: 그 외 ▸ Microsoft 대상 ▸ Forward :: Microsoft 규칙에 맞고 Forward라 에지로 터널링
- 시나리오: 그 외 ▸ Microsoft 대상 ▸ Bypass :: Microsoft 규칙에 맞지만 Bypass라 직접 전송
- 시나리오: 그 외 ▸ 대상 아님 :: Microsoft 규칙 밖이라 다른 프로필 평가로 이어짐

> 교육 포인트: "Microsoft Entra traffic"은 Microsoft traffic profile의 한 정책 그룹이 아니라 별도의 시스템 프로필입니다. 관리자가 만지는 정책 그룹은 Exchange·SharePoint/OneDrive·Teams·Microsoft 365 Common 네 개입니다.
>
> 주의: Entra traffic이 포털에서 보이지 않는 것과 클라이언트 Forwarding profile 탭에 "Microsoft Entra rules"로 보이는 것은 서로 다른 화면입니다. 조건부 액세스 네트워크 조건(IP 위치)을 쓰면 적응형 액세스 신호를 켜야 합니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/concept-traffic-forwarding
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/troubleshoot-global-secure-access-client-advanced-diagnostics
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/tutorial-microsoft-traffic-enable-profile

### L3 · B · 에지 처리 경로 — 클라이언트 경유 vs 원격 네트워크 경유

#### L4 · 경로 선택 — 클라이언트와 원격 네트워크는 무엇이 다른가

1. [시작] Microsoft 365 요청이 사용자 기기에서 나간다
   - 주체: 사용자
   - 위치: 사무실 · 재택 · 지점 어디서든 Microsoft 365 서비스로의 요청
   - 데이터: 출발 네트워크(클라이언트 설치 여부 · 지점 CPE 연결 여부)
   - 해설: Microsoft 트래픽은 클라이언트 또는 원격 네트워크 연결, 두 가지 방법으로 서비스에 전달됩니다
2. [판단] 어떤 경로로 에지에 도달하는가?
   - 주체: 디바이스
   - 데이터: GSA 클라이언트 설치·할당 여부 · 기기가 속한 지점이 원격 네트워크인지 여부
   - 해설: 둘 다 아니면 Microsoft 트래픽은 에지를 거치지 않습니다
   - 클라이언트 경유 → 3
   - 원격 네트워크 경유 → 5
   - 경유 없음 → [끝] 로컬 경로로 직접 전송 — GSA 통제·로그 없음
3. [처리] 클라이언트가 프로필을 받아 규칙대로 획득
   - 주체: GSA 클라이언트
   - 위치: Connect › Traffic forwarding › Microsoft traffic profile › User and group assignments · Device platform assignments
   - 데이터: 사용자·기기 할당과 기기 플랫폼 할당의 AND. 프로필은 기기에 로그인한 Entra 사용자 기준으로 가져오며 사용자·그룹 할당의 최소 클라이언트 버전은 1.7.376.0
   - 해설: 클라이언트 경유는 사용자·기기 컨텍스트가 에지로 함께 전달됩니다
4. [처리] 조건부 액세스·compliant network가 집행됨
   - 주체: Entra ID
   - 위치: Entra ID › Conditional Access › Policies (대상 리소스 All internet resources with Global Secure Access)
   - 데이터: 조건부 액세스 결과 · 규정 준수 기기 · All Compliant Network locations. 조건부 액세스는 클라이언트가 있는 사용자에게만 집행됩니다
   - 해설: 사용자·기기 조건을 요구하려면 클라이언트 경로가 필요합니다
   - 다음 → 8
5. [처리] 지점 장비(CPE)가 IPsec 터널로 에지에 연결
   - 주체: 외부
   - 위치: Global Secure Access › Connect › Remote networks › 장치 링크(device link)
   - 데이터: 원격 네트워크 한도 — 테넌트당 최대 200개, 원격 네트워크당 장치 링크 최대 25개. CPE는 RouteBased VPN과 any-to-any 트래픽 선택기를 쓰고 CPE가 연결을 시작하며(Responder 모드), 동적 라우팅은 BGP를 씁니다
   - 해설: 지점의 모든 기기 트래픽이 클라이언트 설치 없이 터널로 에지에 전달됩니다
6. [처리] 연결된 프로필과 일치하는 트래픽만 처리
   - 주체: SSE 에지
   - 위치: Remote networks › 원격 네트워크 › Traffic profiles 탭
   - 데이터: 장치 링크로 들어온 트래픽 중 연결된 프로필 유형만 전달하고 나머지는 게이트웨이가 폐기합니다. Microsoft traffic profile만 연결하면 일반 인터넷 트래픽이 폐기되고, Internet Access profile만 연결하면 Microsoft 트래픽이 폐기됩니다
   - 해설: 의도치 않은 트래픽 손실을 막으려면 라이선스가 허용하는 경우 Microsoft traffic profile과 Internet Access profile을 모두 연결하라고 안내합니다
7. [처리] 조건부 액세스는 집행되지 않음 — 클라이언트 없음
   - 주체: Entra ID
   - 데이터: 클라이언트 없는 원격 네트워크 경유 Microsoft 트래픽은 접근되지만 조건부 액세스 정책은 집행되지 않습니다. Custom Bypass(Internet 프로필)도 원격 네트워크에서는 동작하지 않아 CPE에서 직접 우회해야 합니다
   - 해설: 지점 경로는 회선 단위 전달이어서 사용자 단위 통제가 약합니다. 소스 IP 신호는 지점의 egress IP 기준입니다 [확인 필요: 원격 네트워크 경로의 신호 범위]
8. [끝] 에지에서 Microsoft 서비스로 전달 · 로그 구분
   - 주체: 로그
   - 위치: Global Secure Access › Monitor › Traffic logs › Microsoft 365
   - 데이터: Device category = client 또는 remote network · TrafficType = "microsoft365"
   - 해설: 같은 Microsoft 365 트래픽도 로그의 Device category로 경로를 구분할 수 있습니다
- 시나리오: 클라이언트 경유 :: 클라이언트로 획득되고 조건부 액세스 집행
- 시나리오: 원격 네트워크 경유 :: 지점 IPsec 터널로 전달되며 조건부 액세스 미집행
- 시나리오: 경유 없음 :: 에지를 거치지 않고 직접 전송

> 교육 포인트: 클라이언트는 "사용자 컨텍스트 + 조건부 액세스", 원격 네트워크는 "클라이언트 없이 지점 전체"가 장점입니다. 두 방식이 섞여도 같은 Microsoft traffic profile 규칙을 씁니다.
>
> 주의: 원격 네트워크는 Microsoft traffic과 Internet Access 프로필만 지원하며 Private Access 트래픽은 클라이언트로만 획득합니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/reference-current-known-limitations
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-create-remote-networks
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/concept-traffic-forwarding

#### L4 · 원격 네트워크 — 지점을 Microsoft traffic profile에 연결한다

1. [시작] 관리자가 원격 네트워크 만들기 시작
   - 주체: 관리자
   - 위치: Global Secure Access › Connect › Remote networks › Create remote network (Global Secure Access Administrator)
   - 데이터: 포털 또는 Microsoft Graph API로 생성. 사전 조건 — 지원되는 CPE(IPsec · BGP), RouteBased any-to-any, Responder 모드
   - 해설: 원격 네트워크가 먼저 있어야 프로필에 할당할 수 있습니다
2. [처리] Basics 탭 — 이름과 지역
   - 주체: 관리자
   - 위치: Create remote network › Basics › Name · Region
   - 데이터: Region = IPsec 터널의 Microsoft 쪽 끝이 놓이는 위치
   - 해설: 지점에서 가까운 지역을 고릅니다
3. [처리] Connectivity 탭 — 장치 링크 추가
   - 주체: 관리자
   - 위치: Create remote network › Connectivity › Add a link (장치 링크는 생성 후 추가도 가능)
   - 데이터: 장치 유형 · CPE 공용 IP · BGP 주소 · ASN
   - 해설: Microsoft에 IKE 협상이 어디에서 올지 알려 주는 단계입니다
4. [처리] Traffic profiles 탭 — Microsoft traffic profile 선택
   - 주체: 관리자
   - 위치: Create remote network › Traffic profiles › Microsoft traffic profile 선택 (필요하면 Internet Access traffic profile도 선택) · 또는 Connect › Traffic forwarding › Remote network assignments › View
   - 데이터: 원격 네트워크 ↔ 프로필 연결. 연결 후에는 연결된 프로필에 맞는 트래픽만 전달됩니다
   - 해설: Microsoft 프로필만 고르면 인터넷 트래픽이 폐기되므로 Internet Access 프로필 사용 여부를 함께 정합니다
5. [처리] Review 후 생성 — Microsoft 쪽 연결 구성 확인
   - 주체: 관리자
   - 위치: Create remote network › Review + create › Remote networks 목록 › Connectivity details › View configuration
   - 데이터: Microsoft 쪽 IPsec 터널 세부 정보(엔드포인트 · 사전 공유 키 · BGP 값 등 [확인 필요: 화면 항목])
   - 해설: 이 값을 지점 CPE에 입력해야 터널이 완성됩니다
6. [처리] 지점 CPE에서 IPsec · BGP 설정
   - 주체: 외부
   - 위치: 지점 라우터(CPE) 관리 콘솔 — Microsoft Entra 관리 센터 밖의 작업
   - 데이터: IKE 협상 매개변수 · 트래픽 선택기 0.0.0.0/0 · BGP 피어. 이 단계를 마치기 전에는 IPsec이 설정되지 않습니다
   - 해설: IPsec은 양방향 협상이라 CPE가 먼저 연결을 시작해야 합니다
7. [판단] 터널이 올라와 Microsoft 트래픽이 에지에 도달하는가?
   - 주체: 관리자
   - 위치: Global Secure Access › Connect › Remote networks · Monitor › Traffic logs (Device category = remote network)
   - 데이터: 장치 링크 상태 · 트래픽 로그의 Device category
   - 해설: 터널 상태와 로그 두 가지로 확인합니다. 복원력은 별도 모범 사례 문서를 봅니다
   - 터널 수립 → 8
   - 터널 미수립 → [끝] 터널 미수립 — 지점 Microsoft 트래픽이 에지에 도달하지 못함 (CPE 설정·BGP·방화벽을 다시 확인)
8. [끝] 지점 Microsoft 트래픽이 에지로 전달되고 기록됨
   - 주체: 로그
   - 위치: Traffic logs › Microsoft 365 필터 › Device category = remote network
   - 데이터: NetworkAccessTraffic TrafficType = "microsoft365"
   - 해설: 지점 사용자는 클라이언트 없이도 Microsoft 365 트래픽 로그가 남습니다
- 시나리오: 터널 수립 :: 지점 트래픽이 에지에 도달하고 로그가 남음
- 시나리오: 터널 미수립 :: 터널이 안 올라와 에지 도달 실패

> 교육 포인트: 원격 네트워크에서는 사용자 단위 할당이 없고, 장치 링크로 들어온 트래픽을 연결된 프로필 유형으로만 처리합니다.
>
> 주의: 지점 장비가 IPsec 터널을 만드는 단계는 Entra 관리 센터 밖 작업입니다. Microsoft 쪽 구성값 세부 항목은 화면에서 확인해야 합니다 [확인 필요].
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-create-remote-networks
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-manage-microsoft-profile
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/reference-current-known-limitations

### L3 · C · 운영 — 알림 · 점검 · 장애 대응

#### L4 · 알림 — 프로필 변경과 신호 해제를 감지한다

1. [시작] 감사 로그를 Sentinel 분석 규칙으로 감시
   - 주체: 관리자
   - 위치: Microsoft Sentinel › Analytics (분석 규칙) · KQL: AuditLogs | where LoggedByService == "Global Secure Access"
   - 데이터: Category = "ForwardingPolicyManagement"(프로필·정책 변경). 문서의 짧은 시간 창(ago(5m)·ago(15m))은 분석 규칙용이며 포털에서 수동 실행하면 ago(24h) 이상으로 늘립니다
   - 해설: Microsoft traffic profile은 Teams·Exchange·SharePoint처럼 매일 쓰는 서비스를 다뤄 장애가 곧바로 사용자에게 보이므로 빠른 탐지가 우선입니다
2. [판단] 어떤 변경이 감지되었는가?
   - 주체: 로그
   - 데이터: OperationName 별 분류 — 프로필 변경(Update/Delete Forwarding Profile, 대상 "Microsoft 365 traffic forwarding profile") · 규칙 변경(Update/Add/Delete Forwarding Policy) · 설정 해제(Update Adaptive Access Policy · Update Global Secure Access Settings · Update/Delete Universal Tenant Restrictions Policy)
   - 해설: 감사 로그가 프로필 상태 변경의 modifiedProperties를 채우지 않아 쿼리는 "어떤 업데이트든" 경고하고, 알림이 뜨면 포털에서 현재 상태를 확인해야 합니다
   - 프로필 변경 → 3
   - 규칙 변경 → 4
   - 설정 해제 → 5
3. [처리] 프로필 비활성 대응 — 치명(Critical)
   - 주체: 관리자
   - 위치: Global Secure Access › Connect › Traffic forwarding (다시 켜기) · 감사 로그에서 수행자 확인
   - 데이터: 담당 Network Security Engineer. Microsoft 365 트래픽이 더 이상 GSA를 거치지 않으므로 다시 켜고 Microsoft 365 연결 복구를 확인합니다
   - 해설: 프로필이 꺼지면 source IP·compliant network 신호의 기반도 함께 사라집니다
   - 다음 → 6
4. [처리] 규칙 변경 대응 — 변경 관리 대조
   - 주체: 관리자
   - 위치: Traffic forwarding › Microsoft traffic policies · 감사 로그
   - 데이터: 담당 Network Security Engineer. 승인된 변경인지, 수정된 규칙이 필요한 Microsoft 365 엔드포인트를 모두 포함하는지 확인하고 변경 뒤 사용자 신고를 모니터링합니다. 한 번의 작업이 규칙·정책마다 여러 감사 항목을 만듭니다
   - 해설: 모든 결과가 변경 관리 확인 대상입니다
   - 다음 → 6
5. [처리] CA 신호·UTR 해제 대응 — 치명(Critical)
   - 주체: 관리자
   - 위치: Global Secure Access › Settings › Session management › Adaptive access · Universal tenant restrictions (다시 켜기)
   - 데이터: 담당 Identity Engineer. CA 신호가 꺼지면 compliant network 정책이 더 이상 집행되지 않고, UTR(Tenant Restrictions를 쓰는 조직에만 해당)이 꺼지면 사용자가 승인되지 않은 외부 테넌트에 로그인할 수 있습니다. 해제 기간의 SigninLogs를 검토합니다
   - 해설: 두 설정이 꺼져도 사용자 화면에는 오류가 없어 로그로만 확인할 수 있습니다
6. [처리] 알림 후속 자동화 — 플레이북
   - 주체: 관리자
   - 위치: Microsoft Sentinel › Automation › Logic App 플레이북 (Teams 알림 · ITSM 티켓)
   - 데이터: 규칙 변경 알림은 Teams 알림과 변경 관리 티켓을 자동으로 열고, 2시간 안에 승인된 변경이 확인되면 자동 종료합니다
   - 해설: 사람이 포털을 계속 확인하지 않아도 변경·해제가 담당자에게 전달됩니다
7. [끝] 포털에서 현재 상태 확인 후 인시던트 종료
   - 주체: 관리자
   - 위치: Connect › Traffic forwarding · Settings › Session management
   - 데이터: 프로필 켜짐 · 규칙 Action · 적응형 액세스 신호 · UTR 상태. 로그 신호는 compliant network 판정이 sign-in 로그에 나타나는지로 확인합니다
   - 해설: 로그만 믿지 말고 화면 상태를 직접 확인한 뒤 닫습니다
- 시나리오: 프로필 변경 :: 프로필 비활성을 치명 알림으로 처리
- 시나리오: 규칙 변경 :: 규칙 변경을 변경 관리와 대조
- 시나리오: 설정 해제 :: CA 신호나 UTR 해제를 치명 알림으로 처리

> 교육 포인트: 조건부 액세스 실패 알림의 50명 기준은 시작값이며, 배포 후 30일 동안 Microsoft traffic volume 일별 추세 쿼리로 기준선을 만든 뒤 임계값을 조정하라고 안내합니다.
>
> 주의: 위 KQL의 CA 정책 ID(TargetPolicyIds)는 Block 부여 제어이면서 compliant network 위치를 제외하지 않는 정책을 직접 채워야 하며, 정책이 바뀌면 월간 점검에서 갱신합니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-operate-microsoft-traffic
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-universal-tenant-restrictions
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-source-ip-restoration

#### L4 · 장애 대응 — Microsoft 365 지연·접속 오류를 추적한다

1. [시작] 사용자가 Microsoft 365 지연 · 접속 오류를 신고
   - 주체: 사용자
   - 위치: 헬프데스크 티켓
   - 데이터: 사용자 · 서비스(Exchange · SharePoint · Teams) · 발생 시각
   - 해설: 일일 점검에서 헬프데스크가 Microsoft 365 서비스 상태 대시보드와 사용자 신고를 함께 봅니다
2. [처리] Microsoft 365 서비스 상태 확인
   - 주체: 관리자
   - 위치: Microsoft 365 service health dashboard
   - 데이터: 서비스 장애 공지 여부
   - 해설: 사용자가 성능 문제를 신고하면 GSA 트래픽 로그와 비교해 GSA 라우팅이 원인인지 판단합니다
3. [판단] 해당 트래픽이 GSA를 거쳤는가?
   - 주체: 관리자
   - 위치: Monitor › Traffic logs › Microsoft 365 필터 · 사용자 UPN 필터
   - 데이터: NetworkAccessTraffic(TrafficType = "microsoft365", UserId) 행 존재 여부
   - 해설: 로그가 있으면 경로 판정·조건부 액세스 쪽을, 없으면 클라이언트·할당 쪽을 봅니다
   - GSA 경유 → 4
   - GSA 미경유 → 6
4. [처리] 조건부 액세스 실패와 최근 변경 확인
   - 주체: Entra ID
   - 위치: Entra ID › Monitoring & health › Sign-in logs (ConditionalAccessStatus) · Audit logs
   - 데이터: SigninLogs | where ConditionalAccessStatus == "failure". 주간 점검에서 compliant network 실패는 0에 가까워야 하고 그렇지 않으면 클라이언트 연결 문제나 허가되지 않은 기기를 의심합니다
   - 해설: 정책 변경으로 과차단이 생겼는지, 기기 준수 상태가 어떤지 확인합니다
5. [처리] 원인 수정 후 사용자 재시도
   - 주체: 관리자
   - 위치: Conditional Access · Traffic forwarding
   - 데이터: 정책·규칙·기기 준수 상태 수정 결과
   - 해설: 수정 사항이 반영되는 시간이 있어 사용자에게 재시도를 안내합니다
   - 다음 → 9
6. [처리] 클라이언트 Health check · Forwarding profile 점검
   - 주체: GSA 클라이언트
   - 위치: 트레이 아이콘 › Advanced Diagnostics › Health check · Forwarding profile
   - 데이터: Forwarding profile registry exists · Forwarding profile matches expected schema · Break-glass mode disabled · Edge hostname resolved by DNS · Edge is reachable · Tunneling succeeded. 규칙이 없으면 ForwardingProfileTimestamp 레지스트리 키를 지우고 Global Secure Access Policy Retriever Service를 재시작한 뒤 확인합니다
   - 해설: Break-glass 모드(모든 프로필 체크 해제)면 클라이언트가 트래픽을 터널링하지 않습니다
7. [처리] 할당·클라이언트 버전·Entra 로그인 점검
   - 주체: 관리자
   - 위치: Traffic forwarding › Microsoft traffic profile › Assignments · 클라이언트 Overview 탭
   - 데이터: 사용자·기기·플랫폼 할당(AND) · 클라이언트 버전 1.7.376.0 이상 · 기기에 Entra 사용자 로그인(동시 다중 사용자 미지원) · Windows Secure DNS(DoH) 끔 · IPv4 우선
   - 해설: 할당에서 빠졌거나 DoH가 켜져 있으면 규칙이 있어도 트래픽이 획득되지 않습니다
8. [처리] 임시 조치 — 문제 대상만 Bypass로 전환
   - 주체: 관리자
   - 위치: Microsoft traffic policies › 규칙 Action 또는 그룹 체크박스
   - 데이터: 문제 서비스의 규칙 또는 그룹을 Bypass로 전환. compliant network를 요구하는 CA가 있으면 우회된 트래픽은 그 조건을 만족하지 못해 막힐 수 있습니다 [확인 필요]
   - 해설: 원인 분석을 하는 동안만 쓰고 감사 로그로 변경을 남깁니다
9. [끝] 정기 점검 · 설정 백업으로 정착
   - 주체: 관리자
   - 위치: Graph: Get-MgBetaNetworkAccessForwardingProfile (스코프 NetworkAccess.Read.All, trafficForwardingType = m365) · GET /beta/networkAccess/forwardingProfiles/{id}/policies?$expand=policy
   - 데이터: 주간 설정 내보내기(프로필·정책 링크·규칙 대상) · 월간 점검 — CA 정책(Block + compliant network 제외) 검토 · UTR 허용 테넌트 정리 · Exchange · SharePoint/OneDrive · Teams · Microsoft 365 Common 규칙 커버리지 확인
   - 해설: 일간·주간·월간 점검을 정례화해 같은 장애가 반복되지 않게 합니다
- 시나리오: GSA 경유 :: 경유한 트래픽의 CA 실패와 변경을 점검
- 시나리오: GSA 미경유 :: 클라이언트·할당·DoH를 점검하고 임시 우회

> 교육 포인트: 원인을 "GSA를 거쳤나"로 먼저 가르면 조건부 액세스·변경 이력(경유)과 클라이언트·할당(미경유)로 점검 대상이 빠르게 좁혀집니다.
>
> 주의: 클라이언트가 규칙을 받는 시간은 문서마다 5분 · 1시간으로 다르므로 변경 직후 판단을 서두르지 않습니다 [확인 필요]. 임시 Bypass는 위험이 있어 compliant network 조건과 함께 검토합니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-operate-microsoft-traffic
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/troubleshoot-global-secure-access-client-advanced-diagnostics
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/troubleshoot-global-secure-access-client-diagnostics-health-check
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-view-traffic-logs
