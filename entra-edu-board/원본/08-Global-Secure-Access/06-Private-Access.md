## L2 · Private Access — 사내 앱 제로 트러스트 접근

- 설정(Control Plane): 커넥터 · 커넥터 그룹 | Quick Access · Global Secure Access 앱(앱 세그먼트) · 사용자 할당 · 조건부 액세스 연결
- 강제(Enforcement): Global Secure Access 클라이언트 (트래픽 획득) | Microsoft SSE 에지 → 개인 네트워크 커넥터 → 사내 앱
- 증적(Evidence): GSA 트래픽 로그 (Private access 필터) | KQL: NetworkAccessTraffic (ConnectorName · AppSegmentId)
- 메뉴(Admin Center): Global Secure Access > 연결 > 커넥터 · 트래픽 전달 · 애플리케이션 > Quick Access · 엔터프라이즈 애플리케이션
- 라이선스(License): Private Access 라이선스(Entra Suite 포함) + 사용자당 Entra ID P1/P2, 커넥터 그룹 관리에도 P1/P2 필요 [확인 필요: 고객 라이선스]

### L3 · 0 · 기능 상태 전이 — VPN 의존 → Private Access 구성 → 앱 단위 접근

#### L4 · ⓪ 비활성 — 사내 앱 접근을 VPN에 의존한다

1. [시작] 원격 사용자가 사내 앱 접속 — 예: 파일 서버 SMB, RDP
   - 주체: 사용자
   - 위치: 사내 앱 FQDN (예: 445 SMB · 3389 RDP)
   - 데이터: 목적지 FQDN · 포트
   - 해설: 재택 사용자가 사무실 안에 있는 앱과 서버에 접속하려 합니다
2. [처리] VPN으로 사내망에 연결 — 네트워크 단위로 열림
   - 주체: 디바이스
   - 위치: VPN 클라이언트 → VPN 게이트웨이
   - 데이터: VPN 자격 증명 · 사내 IP 대역 라우팅
   - 해설: VPN은 일반적으로 사내 네트워크 넓은 범위를 한꺼번에 열어 줍니다
3. [처리] 앱별 조건부 액세스 없음 — 접속 시 한 번만 인증
   - 주체: Entra ID
   - 데이터: VPN 로그인 한 번 · 앱 단위 MFA·디바이스 조건 연결 어려움 [판단: VPN 제품에 따라 다름]
   - 해설: 사용자·앱별 조건을 걸어 판정하기 어려운 구조입니다
4. [처리] 접속 후 같은 대역의 다른 서버에도 도달 가능
   - 주체: 사용자
   - 데이터: 사내망 안의 모든 서버 (최소 권한 미적용)
   - 해설: 계정이나 기기가 탈취되면 사내망 안에서 옆으로 이동하는 경로가 열립니다
5. [끝] 앱 단위 통제 · 로그 부족
   - 주체: 로그
   - 위치: Global Secure Access › Monitor › Traffic logs (Private access 필터) — 기록이 남지 않고 VPN 연결 로그에만 의존
   - 데이터: VPN 연결 로그 (어떤 앱에 접근했는지는 불명확)
   - 해설: 누가 어떤 앱을 썼는지 Entra에서 앱 단위로 확인하기 어렵습니다

#### L4 · ① 구성 — 커넥터 · 커넥터 그룹 · 앱 세그먼트를 만든다

1. [시작] 관리자가 Entra 관리 센터에 로그인 — 역할 확인
   - 주체: 관리자
   - 위치: entra.microsoft.com — Global Secure Access Administrator + Application Administrator, 조건부 액세스는 Conditional Access Administrator
   - 데이터: Entra 역할 할당. 커넥터 그룹 관리는 Application Administrator + Entra ID P1/P2 라이선스가 필요하고, Private Access는 Private Access 라이선스(Entra Suite 포함) + 사용자당 Entra ID P1/P2가 필요합니다
   - 해설: 앱·세그먼트 작업과 커넥터 작업의 역할이 다르므로 둘 다 갖춰야 합니다. 커넥터 설치 시 등록 화면에서도 Application Administrator 자격 증명을 요구합니다
2. [처리] 커넥터 서버 준비 — 아웃바운드 443 · 80만 허용
   - 주체: 온프레미스
   - 위치: 사내 Windows Server 2016 이상 (TLS 1.2 활성화 필수, .NET 4.7.2 이상 [확인 필요: 같은 문서의 설치 노트는 4.7.1 이상으로 표기]) · 방화벽 아웃바운드 규칙
   - 데이터: 포트 443(커넥터–서비스 통신 전체) · 80(인증서 폐기 목록 CRL 다운로드). URL: *.msappproxy.net · *.servicebus.windows.net(443) · crl3/crl4.digicert.com · ocsp.digicert.com · crl.microsoft.com · oneocsp.microsoft.com · ocsp.msocsp.com(80) · login.windows.net · *.microsoftonline.com 등 등록용 Entra 로그인 URL(443). 방화벽이 도메인 접미사 규칙을 지원하지 않으면 매주 갱신되는 Azure IP 범위·서비스 태그를 허용합니다
   - 해설: 인바운드 포트는 열지 않고 아웃바운드만 허용하며, 커넥터와 서비스 사이 TLS 구간에는 인라인 검사·종료나 아웃바운드 포워드 프록시를 두지 않습니다. 권장 사양은 4코어 이상이고 CPU·메모리 사용률을 70% 아래로 유지하며, 이 서버는 앱 서버와 가까이 두는 것이 성능에 유리합니다
3. [처리] 커넥터 다운로드 · 설치 · 등록
   - 주체: 관리자
   - 위치: Global Secure Access › Connect › Connectors › Download connector service › Accept terms & Download 후 설치 마법사 실행 (Azure·AWS·GCP 마켓플레이스 배포는 미리 보기)
   - 데이터: 설치 마법사의 등록 화면에서 Application Administrator로 로그인 (Private Access 최소 커넥터 버전 1.5.3417.0). Microsoft Entra Connect 같은 다른 인증 에이전트가 있는 서버에도 설치할 수 있으나 Password Protection Proxy와는 같은 서버에 두지 않습니다
   - 해설: 설치 마법사가 커넥터를 테넌트에 등록하고 서비스 2개를 만듭니다. 서버가 여러 대면 각 서버에 설치·등록해야 하며, 이전 커넥터를 최신으로 올릴 때는 제거 후 관련 폴더를 지우고 다시 설치합니다
4. [처리] 커넥터 상태 확인 — 활성 표시
   - 주체: 관리자
   - 위치: Global Secure Access › Connect › Connectors (활성 녹색 라벨) · 서버의 services.msc: Microsoft Entra private network connector · Microsoft Entra private network connector updater · 이벤트 뷰어 › Applications and Services Logs › Microsoft › Microsoft Entra private network › Connector
   - 데이터: 커넥터 이름 · IP · 버전 · 상태. 두 서비스 모두 항상 Running이어야 합니다
   - 해설: 녹색이어도 방화벽 문제로 실제 연결이 안 되는 경우가 있어 서비스 상태와 이벤트 로그도 봅니다. 중지된 서비스는 우클릭 › Start로 시작합니다
5. [처리] 커넥터 그룹 만들기 — 커넥터를 묶는다
   - 주체: 관리자
   - 위치: Global Secure Access › Connect › Connectors › New connector group › 이름 입력 · 드롭다운에서 커넥터 선택 › Save
   - 데이터: 커넥터 그룹 (이름 · 소속 커넥터). 그룹을 만들지 않으면 모든 커넥터가 기본(default) 그룹에 들어가고 새 커넥터도 자동으로 기본 그룹에 추가됩니다
   - 해설: 같은 그룹의 커넥터는 가용성과 부하 분산을 함께 맡는 하나의 단위이며, 그룹마다 커넥터를 2대 이상 두라고 권장됩니다
6. [처리] Quick Access 또는 GSA 앱 만들기 — 커넥터 그룹 지정
   - 주체: 관리자
   - 위치: Global Secure Access › Applications › Quick access (이름은 "Quick Access"로), 또는 Applications › Enterprise applications › New application
   - 데이터: 앱 이름 · 커넥터 그룹 선택 (활성 커넥터가 1개 이상 있어야 생성 가능, 엔터프라이즈 앱 객체가 생성됨). 처음 Quick Access를 구성하면 Private Access용 엔터프라이즈 앱이 자동 생성됩니다
   - 해설: Quick Access는 VPN을 빨리 대체하는 전환 단계용 공통 묶음, 개별 앱은 별도 할당·조건부 액세스가 필요한 대상을 위한 용도입니다
7. [처리] 앱 세그먼트 추가 — 대상 · 포트 · 프로토콜
   - 주체: 관리자
   - 위치: 앱 › Add application segment (Quick Access는 Add Quick Access application segment) › Create application segment 패널 › Destination type 선택 › 포트 입력 › Apply › Save
   - 데이터: 대상 유형 FQDN(와일드카드는 *.contoso.com 형식) · IPv4 주소 · IP 범위(CIDR) · IP 범위(시작–끝), 포트는 쉼표로 구분하고 범위는 하이픈(예: 400-500, 80, 443)이며 TCP/UDP를 지정합니다. NetBIOS 이름은 지원되지 않아 contoso.local/app1처럼 FQDN으로 씁니다
   - 해설: 세그먼트는 대상·포트·프로토콜 3가지로 정의되며 앱당 최대 500개입니다. 같은 대상·포트·프로토콜이 겹치는 세그먼트는 겹침으로 취급되고, 단말 로컬 서브넷 안의 IP는 IP 주소로 터널링되지 않습니다
8. [처리] 사용자·그룹 할당
   - 주체: 관리자
   - 위치: Global Secure Access › Applications › Enterprise applications › {앱} › Users and groups (Quick Access는 Quick access 앱)
   - 데이터: 앱 역할 할당 — 사용자 직접 또는 그룹, 중첩 그룹 미지원, 변경은 클라이언트에 약 15분 뒤 동기화
   - 해설: Quick Access 세그먼트를 개별 엔터프라이즈 앱으로 옮기면 할당이 자동 승계되지 않아 이전에 되던 사용자가 막히므로 다시 지정합니다
9. [처리] 조건부 액세스 정책 연결 — 앱 단위 조건
   - 주체: 관리자
   - 위치: Global Secure Access › Applications › Enterprise applications › {앱} › Conditional Access › New policy (대상 리소스에 해당 앱이 자동 지정), 또는 Entra ID › Conditional Access › Policies › New policy
   - 데이터: 부여 제어 예: Require multifactor authentication · Require device to be marked as compliant · Require Microsoft Entra hybrid joined device. Enable policy를 Report-only로 먼저 검증한 뒤 On으로 전환하고 비상 접근(break-glass) 계정을 제외합니다. 규정 준수 네트워크(compliant network) 검사는 Private Access 앱에서 지원되지 않습니다
   - 해설: 앱마다 서로 다른 조건을 걸 수 있다는 점이 VPN과 가장 크게 다릅니다. Private Access 트래픽 전체에 CA를 거는 것은 지원되지 않아 앱(Quick Access·GSA 앱) 단위로 적용합니다
10. [끝] Private access 프로필 켜기
   - 주체: 관리자
   - 위치: Global Secure Access › Connect › Traffic forwarding › Private access profile 토글
   - 데이터: 프로필 상태 = 켜짐. 앱 구성 전에 켜도 되지만 앱 세그먼트가 없으면 전달할 트래픽이 없습니다. 클라이언트 쪽은 Entra joined·hybrid joined 기기가 필요하고 Entra registered 기기는 Private Access 트래픽만 지원합니다
   - 해설: 프로필을 켜야 클라이언트가 앱 세그먼트 트래픽을 에지로 보냅니다. Private Access 트래픽은 GSA 클라이언트로만 획득되며 원격 네트워크는 Private access 프로필에 할당할 수 없습니다

#### L4 · ② 활성 — 에지에서 인가한 뒤 커넥터가 사내 앱으로 전달한다

1. [시작] 사용자가 사내 서버 FQDN으로 RDP 접속
   - 주체: 사용자
   - 위치: 원격 데스크톱 → 앱 세그먼트에 등록된 FQDN:3389
   - 데이터: 목적지 FQDN · 포트 · TCP
   - 해설: 사용자는 VPN 없이 평소처럼 사내 서버 주소로 접속합니다
2. [처리] GSA 클라이언트가 트래픽을 가로채 에지로 터널링
   - 주체: 디바이스
   - 위치: GSA 클라이언트 › Private access 규칙 (트레이 아이콘 우클릭 › Advanced diagnostics › Forwarding profile)
   - 데이터: 앱 세그먼트와 일치한 규칙 (destination · port · protocol) · Priority 열(숫자가 작을수록 우선), Policy tester로 특정 목적지에 적용되는 규칙 확인. 클라이언트는 IPv4만 터널링하고 IPv6는 직접 전송합니다
   - 해설: 세그먼트에 해당하는 트래픽만 에지로 가고 나머지는 그대로 직접 나갑니다. 앱의 클라이언트 쪽 접근 사용(Enable access) 체크박스를 끄면 그 앱 세그먼트는 터널링되지 않습니다
3. [처리] SSE 에지가 Entra ID 정책을 조회
   - 주체: 리소스
   - 위치: Microsoft SSE 에지 → Entra ID
   - 데이터: 사용자의 앱 역할 할당 · 해당 앱에 연결된 조건부 액세스 정책 (Entra ID에 저장된 값)
   - 해설: 에지가 직접 판정하지 않고 Entra에 저장된 할당과 조건을 가져옵니다. 이 평가는 SSE 에지에서 Entra ID로 이뤄지며 규칙 변경은 클라이언트에 약 15분 걸려 반영됩니다
4. [판단] 사용자가 앱에 할당되어 있고 CA를 통과하는가?
   - 주체: Entra ID
   - 데이터: 앱 역할 할당 여부 · MFA · 디바이스 준수 같은 CA 부여 제어 결과
   - 해설: 할당이 없거나 CA 요구를 못 채우면 요청은 여기서 끝납니다
   - 예 → 5
   - 아니오 → [차단] 차단 — 앱 미할당 또는 CA 요구 미충족
5. [처리] Entra ID가 앱용 액세스 토큰 발급 — Private Access 앱
   - 주체: Entra ID
   - 데이터: 해당 엔터프라이즈 앱 대상의 액세스 토큰
   - 해설: 인가가 끝나면 이 앱에 한정된 토큰이 발급되어 요청과 함께 이동합니다
6. [처리] Private Access 서비스가 토큰을 검증
   - 주체: 리소스
   - 위치: Private Access 서비스 (클라우드)
   - 데이터: 토큰 · 앱 세그먼트 · 커넥터 그룹 매핑
   - 해설: 토큰이 유효하면 연결을 백엔드 서비스가 해당 커넥터 그룹으로 중계합니다
7. [처리] 커넥터 그룹의 커넥터 중 하나로 중계
   - 주체: 온프레미스
   - 위치: 개인 네트워크 커넥터 (사내, 아웃바운드로 먼저 연결해 둔 터널)
   - 데이터: 트래픽 라우팅 방식 기본 Random(요청을 가용 커넥터에 분산), 선택 시 세션 지속(sessionPersistence — 같은 사용자·기기를 한 세션 동안 같은 커넥터로 보냄). 세션 지속은 Global Secure Access 앱에서만 되고 앱 프록시 앱에는 적용되지 않습니다. 설정은 Graph PATCH /beta/applications/{appObjectId} 의 onPremisesPublishing.trafficRoutingMethod 로 합니다
   - 해설: 커넥터가 이미 서비스에 연결해 둔 터널로 요청이 들어와 방화벽 인바운드를 열지 않습니다. 세션 지속은 커넥터 이그레스 IP로 인증·ACL을 거는 앱에 유용하고, 커넥터 하나가 내려가면 서비스가 같은 그룹의 정상 커넥터로 새 요청을 보냅니다
8. [처리] 커넥터가 사내 DNS로 대상 서버 IP 확인
   - 주체: 온프레미스
   - 위치: 커넥터 → 사내 DNS 서버
   - 데이터: DNS 질의 · 응답 (대상 서버 IP)
   - 해설: 이름 확인은 사용자 PC가 아니라 사내망 안의 커넥터가 합니다
9. [처리] 커넥터가 대상 서버로 전달 — RDP 협상
   - 주체: 온프레미스
   - 위치: 커넥터 → 사내 서버:3389
   - 데이터: RDP 세션 (RDP 인증은 서버와 별도로 협상·수행됨). 앱 세그먼트로 허용된 대상·포트로만 연결됩니다
   - 해설: 사용자는 앱 세그먼트로 허용된 서버·포트에만 닿고 나머지 사내망은 열리지 않습니다
10. [끝] 트래픽 로그 기록 — Private access 항목
   - 주체: 로그
   - 위치: Global Secure Access › Monitor › Traffic logs (Private access 필터 버튼) — 보기는 Reports Reader 이상
   - 데이터: NetworkAccessTraffic: AccessType(QuickAccess/PrivateAccess) · AppSegmentId · ApplicationObjectId · ConnectorName · ConnectorId · ConnectorIp · ConnectorGroupId · Action(Allowed/Denied). 진단 설정(NetworkAccessTrafficLogs)으로 Log Analytics 등에 내보내 KQL로 분석할 수 있습니다
   - 해설: 어느 앱 세그먼트가 어느 커넥터를 거쳐 허용 또는 차단됐는지 남습니다
- 시나리오: 예 :: 할당·CA 통과 후 커넥터가 사내 앱에 전달
- 시나리오: 아니오 :: 앱 미할당 또는 CA 실패로 에지에서 차단

> 교육 포인트: VPN은 "네트워크를 연다", Private Access는 "앱 세그먼트 하나씩 연다"입니다. 앱마다 할당·조건부 액세스를 따로 걸 수 있어 최소 권한을 적용합니다.
>
> 주의: 커넥터는 TLS 검사·인라인 프록시 장비를 거치면 양방향 인증서 인증이 깨져 통신이 실패할 수 있습니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-configure-per-app-access
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/concept-private-access
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-configure-connectors
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-configure-quick-access
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-target-resource-private-access-apps
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-install-windows-client
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/reference-current-known-limitations
>
> 출처: https://learn.microsoft.com/azure/azure-monitor/reference/tables/networkaccesstraffic

### L3 · A · 커넥터 그룹 설계 — 커넥터 · 그룹 · 앱의 관계와 가용성

#### L4 · 커넥터가 그룹으로 묶여 앱을 받치는 방식

1. [시작] 개인 네트워크 커넥터 — 사내 Windows Server의 에이전트
   - 주체: 온프레미스
   - 위치: 사내 Windows Server 2016 이상 (애플리케이션 프록시와 같은 커넥터를 사용)
   - 데이터: Windows 서비스 2개: Microsoft Entra private network connector · updater (항상 실행). 커넥터는 상태 비저장(stateless)이라 서비스 연결 설정과 인증서만 저장하고 구성은 서비스에서 몇 분마다 받아옵니다
   - 해설: 커넥터는 경량 에이전트이며 Private Access와 앱 프록시가 같은 부품을 씁니다. 사내망 안이나 클라우드 VM 어디에든 설치할 수 있고, 경계망(DMZ)에 둘 필요는 없습니다
2. [처리] 아웃바운드 TLS 터널만 사용
   - 주체: 온프레미스
   - 데이터: 443 아웃바운드 (인바운드 포트 불필요), 한 번 연결 후 양방향 전송. 인증서는 등록 시 만들어져 몇 달마다 자동 갱신되므로 문서화된 대상으로의 통신이 막히면 갱신이 실패합니다
   - 해설: 사내 방화벽에서 인바운드를 열지 않아도 외부에서 앱에 접근할 수 있습니다. 아웃바운드 포워드 프록시는 양방향 인증서 인증을 깨뜨려 통신이 실패할 수 있습니다
3. [처리] 커넥터 그룹으로 묶기 — 고가용 단위
   - 주체: 관리자
   - 위치: Global Secure Access › Connect › Connectors › New connector group
   - 데이터: 같은 그룹 = 하나의 처리 단위 (부하 분산 · 장애 대응). 그룹을 만들지 않으면 모두 default 그룹이며, 앱 프록시 대규모 배포에서는 앱을 default 그룹에 할당하지 말고 새 커넥터는 활성 그룹으로 옮기기 전까지 실제 트래픽을 받지 않습니다
   - 해설: 커넥터 한 대가 죽으면 같은 그룹의 다른 커넥터가 이어서 처리합니다
4. [판단] 앱이 서로 다른 네트워크·지역에 있는가?
   - 주체: 관리자
   - 데이터: 앱 위치 (본사 · 지사 · 클라우드 VNet)
   - 해설: 위치가 다르면 그룹을 나누어 가까운 커넥터가 처리하게 하는 것이 낫습니다
   - 예 → 5
   - 아니오 → 6
5. [처리] 지역·네트워크별 커넥터 그룹 분리
   - 주체: 관리자
   - 데이터: 위치 기반 그룹 — 데이터센터별·격리 네트워크·IaaS(클라우드 VNet)·포리스트별·DR 사이트별로 나눌 수 있습니다. 다중 지리(multi-geo) 커넥터는 미리 보기이며 기본값은 테넌트와 같은(또는 가장 가까운) 리전의 서비스 인스턴스입니다
   - 해설: 로컬 앱은 로컬 그룹으로 처리해 지연을 줄이고 장애 영향을 나눕니다. 서로 신뢰 관계가 없는 여러 포리스트(Kerberos 제약 위임 SSO)는 커넥터 하나가 모두 처리할 수 없어 포리스트마다 그룹을 둡니다
6. [처리] 그룹마다 커넥터 2대 이상 유지
   - 주체: 관리자
   - 데이터: 정상 커넥터 최소 2대 권장 (CPU·네트워크가 성능 좌우). 커넥터당 권장 사양은 4코어 이상, 사용률이 지속적으로 70%를 넘으면 그룹에 커넥터를 추가하거나 사양을 올립니다. 4 vCPU·8 GiB Azure VM 기준 총 TCP 처리량 최대 약 1.5 Gbps
   - 해설: 한 대뿐이면 점검 중 다운타임이 생기므로 이중화합니다. 커넥터는 사용자·세션 수가 아니라 요청 수와 페이로드 크기에 반응합니다
7. [처리] 앱 ↔ 커넥터 그룹 연결
   - 주체: 관리자
   - 위치: Quick Access · Enterprise applications › {앱} › Connector group (Global Secure Access › Applications)
   - 데이터: 앱은 커넥터 그룹 하나를 가리킴 (앱 세그먼트는 그 그룹을 통해 전달), 활성 커넥터가 1개 이상인 그룹만 선택해 앱을 만들 수 있음, 그룹은 언제든 바꿀 수 있음
   - 해설: 앱마다 어느 네트워크의 커넥터가 중계할지를 이 설정이 정합니다
8. [처리] 커넥터 자동 업데이트
   - 주체: Entra ID
   - 데이터: Updater 서비스가 버전을 폴링 — 모든 릴리스가 자동은 아님. 자동 업데이트는 그룹마다 커넥터를 한 대씩 갱신해 다운타임을 막고, 처리 중이던 첫 트랜잭션은 유실될 수 있으나 재시도는 다른 커넥터로 갑니다
   - 해설: 일부 릴리스는 수동 설치가 필요하므로 Version release history 페이지를 확인합니다. Updater 서비스가 없으면 커넥터를 다시 설치해야 합니다
9. [끝] 점검 시 서버를 그룹에서 빼고 재시작
   - 주체: 관리자
   - 위치: Global Secure Access › Connect › Connectors — 점검 전용 커넥터 그룹(테스트 Private Access 앱만 할당)으로 커넥터를 옮김
   - 데이터: 점검 그룹으로 옮기면 새 연결을 받지 않고 기존 연결은 끝날 때까지 유지됨. 패치·재부팅 뒤 두 커넥터 서비스가 Running인지 확인하고 테스트 앱으로 종단 간 연결을 검증한 다음 원래 그룹으로 되돌립니다
   - 해설: 진행 중인 연결은 바로 비워지지 않으므로 대기 시간을 두고 정리한 뒤 점검하고, 끝나면 정상 서버를 원래 그룹에 되돌려 추가합니다
- 시나리오: 예 :: 다른 네트워크·지역 앱을 커넥터 그룹으로 나눠 운영
- 시나리오: 아니오 :: 한 네트워크의 앱도 그룹 연결로 운영, 점검 시 재시작

> 교육 포인트: 커넥터 최소 버전(1.5.3417.0)과 .NET 요구(사전 요구 사항은 4.7.2 이상, 설치 노트는 1.5.3437.0부터 4.7.1 이상으로 표기되어 문서 간 차이가 있음 [확인 필요])가 있으니 기존 앱 프록시 커넥터를 재사용할 때 버전부터 확인합니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/concept-connectors
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/concept-connector-groups
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-configure-connectors

### L3 · B · 세그먼트 매칭 · 인가 — 요청이 앱과 정책에 맞춰지는 판정

#### L4 · 클라이언트가 세그먼트를 고르고 에지가 인가한다

1. [시작] 클라이언트가 목적지 FQDN:포트 요청을 포착
   - 주체: 디바이스
   - 데이터: destination · port · protocol(TCP/UDP)
   - 해설: 세그먼트 판정의 입력은 이 세 값입니다
2. [처리] 클라이언트 규칙에서 일치 규칙 검색
   - 주체: 디바이스
   - 위치: 클라이언트 트레이 아이콘 우클릭 › Advanced diagnostics › Forwarding profile › Policy tester
   - 데이터: Priority 열 — 숫자가 작은 규칙이 우선. 특정 FQDN·포트를 넣어 어느 규칙이 활성인지 확인합니다
   - 해설: 관리자가 특정 목적지에 어느 규칙이 적용되는지 이 화면에서 직접 확인할 수 있습니다
3. [판단] 앱 세그먼트와 정확히 일치하는가?
   - 주체: 디바이스
   - 데이터: 세그먼트(대상·포트·프로토콜)는 Private Access 앱 간·앱 내 모두 겹치면 안 됨. 예외로 Private Access 앱과 Quick Access 사이의 겹침은 허용되어, 겹치면 엔터프라이즈 앱 세그먼트가 우선하고 그 대상은 Quick Access가 처리하지 않습니다
   - 해설: 일치하지 않는 목적지는 Private Access로 가지 않고 직접 또는 인터넷 경로로 갑니다. Quick Access에서 앱으로 옮길 때는 서브넷을 작게 쪼개 앱 세그먼트를 Quick Access에서 빼는 것이 권장됩니다
   - 예 → 4
   - 아니오 → [끝] 획득 안 함 — Private Access 미적용
4. [판단] 세그먼트가 어느 앱에 속하는가?
   - 주체: Entra ID
   - 데이터: 세그먼트 → Quick Access 앱 또는 Global Secure Access 앱
   - 해설: 소속 앱에 따라 평가할 조건부 액세스 정책이 달라집니다
   - GSA 앱 → 5
   - Quick Access → 6
5. [처리] 해당 앱 전용 CA 정책 평가
   - 주체: Entra ID
   - 데이터: 앱 단위 CA (예: 관리 서버 앱에만 준수 디바이스 + MFA). 앱의 Conditional Access 메뉴에서 만들면 해당 앱이 대상 리소스로 자동 지정되고, 사용자 지정 보안 특성 기반 애플리케이션 필터로 앱 묶음에도 적용할 수 있습니다
   - 해설: 민감한 앱만 더 엄격한 조건을 걸 수 있습니다
   - 다음 → 7
6. [처리] Quick Access 앱의 CA 정책 평가
   - 주체: Entra ID
   - 데이터: Quick Access 앱에 연결된 CA (공통 묶음 전체에 적용)
   - 해설: Quick Access 안의 대상은 모두 같은 조건을 받으므로 VPN 대체 전환기 용도로 권장되며, 이후 앱별 접근으로 쪼갭니다. Quick Access는 FQDN·IP·IP 범위뿐 아니라 프라이빗 DNS 접미사도 담을 수 있습니다
7. [처리] 사용자·그룹 할당 확인
   - 주체: Entra ID
   - 데이터: 앱 역할 할당 (직접 또는 그룹, 중첩 그룹 불가). 변경은 클라이언트에 약 15분 뒤 동기화되고, Quick Access의 할당은 새 엔터프라이즈 앱으로 자동 이전되지 않습니다
   - 해설: 앱 이동 후 할당을 빠뜨리면 이전에 되던 사용자가 갑자기 막힙니다
8. [판단] 할당과 CA를 모두 만족하는가?
   - 주체: Entra ID
   - 데이터: CA 결과(success/failure) · 할당 여부
   - 해설: 둘 중 하나라도 어긋나면 토큰이 발급되지 않습니다
   - 예 → 9
   - 아니오 → [차단] 차단 — 할당 없음 또는 CA 미충족
9. [끝] 토큰 발급 후 커넥터로 전달
   - 주체: 로그
   - 데이터: 트래픽 로그에 AppSegmentId · Action 기록
   - 해설: 이후 단계는 ② 활성 시나리오의 5단계부터 이어집니다
- 시나리오: 예 ▸ GSA 앱 ▸ 예 :: GSA 앱 세그먼트에 일치하고 인가돼 커넥터로 전달
- 시나리오: 예 ▸ GSA 앱 ▸ 아니오 :: GSA 앱 세그먼트에 일치하나 할당·CA 불충족으로 차단
- 시나리오: 예 ▸ Quick Access ▸ 예 :: Quick Access에 일치하고 인가돼 커넥터로 전달
- 시나리오: 예 ▸ Quick Access ▸ 아니오 :: Quick Access에 일치하나 할당·CA 불충족으로 차단
- 시나리오: 아니오 :: 앱 세그먼트와 일치하지 않아 획득 안 함

> 교육 포인트: 앱 세그먼트는 앱당 최대 500개이고 Private Access 앱 사이에도 겹치면 안 됩니다(Quick Access와의 겹침만 예외로 허용되며 앱 쪽이 우선). 세그먼트 설계가 곧 접근 통제 설계입니다.
>
> 주의: 구성 변경은 클라이언트에 약 15분 걸려 반영되므로 테스트 직후 결과가 달라 보일 수 있습니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-configure-per-app-access
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-target-resource-private-access-apps

### L3 · C · 접근 방식 비교 — Quick Access · 앱별 접근 · 애플리케이션 프록시

#### L4 · 사내 앱에 맞는 게시 방식을 고르는 흐름

1. [시작] 사내 앱을 원격 사용자에게 열어야 함
   - 주체: 관리자
   - 데이터: 앱 종류(웹/비웹) · 사용 프로토콜 · 클라이언트 배포 가능 여부
   - 해설: 앱의 프로토콜과 사용자 환경에 따라 알맞은 게시 방식이 달라집니다
2. [판단] 웹 앱이고 클라이언트 없이 접속하는가? — HTTP/HTTPS
   - 주체: 관리자
   - 데이터: 외부 URL로 게시 가능한 웹 앱인지 여부
   - 해설: 브라우저만으로 접근해야 하는 웹 앱은 클라이언트가 필요 없는 방식이 적합합니다
   - 예 → 3
   - 아니오 → 4
3. [처리] 애플리케이션 프록시 — 외부 URL로 게시
   - 주체: 관리자
   - 위치: Entra ID › Enterprise apps › New application › Add an on-premises application (Application Administrator)
   - 데이터: 외부 URL · 내부 URL · 사전 인증(Pre-Authentication = Microsoft Entra ID 등) · 웹 앱 전용, 클라이언트 설치 불필요. 커넥터가 필요하며 Windows Server 2019 이상의 커넥터 서버에서는 앱 프록시용으로 WinHttp HTTP/2를 끄는 레지스트리(EnableDefaultHTTP2=0)가 필요합니다(Private Access만 쓸 때는 불필요)
   - 해설: 웹 앱에 대한 원격 접근과 SSO를 외부 URL 또는 내부 앱 포털로 제공합니다
   - 다음 → 8
4. [처리] Private Access — 클라이언트로 모든 포트·프로토콜
   - 주체: 관리자
   - 데이터: GSA 클라이언트 필요(Windows·macOS·Android·iOS 클라이언트 제공), TCP·UDP 및 임의 포트(RDP·SMB·SSH 등) 지원. 단, 클라이언트는 IPv4만 터널링하고 단말 로컬 서브넷 안의 IP는 IP 주소로 터널링되지 않습니다
   - 해설: 웹이 아닌 프로토콜까지 포함해 앱 프록시를 넘어선 범위를 다룹니다
5. [판단] 앱마다 다른 조건 또는 기간 제한이 필요한가?
   - 주체: 관리자
   - 데이터: 앱별 CA · 일부 리소스만 일정 기간 보호 · 일부 사용자에게만 다른 정책
   - 해설: 요구가 다르면 앱별로 나누고, 공통이면 한 묶음으로 시작해도 됩니다
   - 예 → 6
   - 아니오 → 7
6. [처리] Global Secure Access 앱(앱별 접근) 구성
   - 주체: 관리자
   - 위치: Global Secure Access › Applications › Enterprise applications › New application (앱마다 Conditional Access · Users and groups · Network access properties 메뉴)
   - 데이터: 앱별 세그먼트(최대 500개) · 사용자 할당 · CA, 필요하면 Graph로 sessionPersistence 라우팅. 라이선스는 Private Access(Per-app access) + 커넥터 그룹 관리용 Entra ID P1/P2
   - 해설: 앱마다 세그먼트와 정책을 분리해 최소 권한과 세밀한 통제를 얻습니다
   - 다음 → 8
7. [처리] Quick Access로 먼저 전환
   - 주체: 관리자
   - 위치: Global Secure Access › Applications › Quick access
   - 데이터: 기본 대상 묶음 하나 (FQDN · IP · IP 범위 · 프라이빗 DNS 접미사). 앱 이름은 Quick Access로 하고, 활성 커넥터가 있는 커넥터 그룹이 필요합니다
   - 해설: VPN을 빨리 대체하는 전환 단계이며 이후 앱별 접근으로 쪼개는 것이 권장됩니다
8. [끝] 같은 커넥터 기반 — 개인 네트워크 커넥터 공유
   - 주체: 온프레미스
   - 데이터: Private Access와 앱 프록시가 같은 커넥터·커넥터 그룹 모델을 사용
   - 해설: 커넥터 구성은 공통이고 어떤 앱을 어떻게 노출할지만 방식별로 다릅니다
- 시나리오: 예 :: 웹 앱을 클라이언트 없이 열어 애플리케이션 프록시
- 시나리오: 아니오 ▸ 예 :: 클라이언트 접속에 앱별 조건이 필요해 GSA 앱 구성
- 시나리오: 아니오 ▸ 아니오 :: 앱별 조건이 필요 없어 Quick Access로 먼저 전환

> 교육 포인트: 애플리케이션 프록시는 웹 앱을 외부 URL로 여는 역방향 프록시이고, Private Access는 클라이언트가 트래픽을 가로채 어떤 프로토콜의 사내 리소스든 앱 세그먼트 단위로 엽니다.
>
> 주의: 앱 프록시 포털 메뉴 이름(Entra ID › Enterprise apps › New application › Add an on-premises application)은 문서 표기이며 미리 보기 UI 변경 시 달라질 수 있습니다. 한글 UI 이름은 확인하지 못했습니다 [확인 필요: 한글 메뉴명].
>
> 출처: https://learn.microsoft.com/entra/identity/app-proxy/application-proxy-add-on-premises-application
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/concept-private-access
>
> 출처: https://learn.microsoft.com/entra/identity/app-proxy/overview-what-is-app-proxy
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/overview-what-is-global-secure-access
