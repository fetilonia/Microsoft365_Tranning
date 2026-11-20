## L2 · Global Secure Access 클라이언트 — 설치 · 배포 · 진단

- 설정(Control Plane): 클라이언트 다운로드(Connect › Client download) · 트래픽 전달 프로필 · Intune 배포 구성(Win32 앱 · macOS PKG · Android 앱 구성 정책 · iOS VPN 프로필) | 클라이언트 동작 정책(Windows 레지스트리 · macOS plist)
- 강제(Enforcement): Global Secure Access 클라이언트 (전달 프로필 규칙으로 트래픽 획득·터널) | Microsoft SSE 에지 (터널 종단)
- 증적(Evidence): 클라이언트 Advanced diagnostics (Overview · Health check · Forwarding profile · Hostname acquisition · Traffic · Advanced log collection) · Windows 이벤트 뷰어(Global Secure Access Client 로그) | 포털 GSA 트래픽 로그(Correlation vector ID로 대조)
- 메뉴(Admin Center): Global Secure Access > 연결 > 클라이언트 다운로드 · 연결 > 트래픽 전달
- 라이선스(License): Windows · macOS · 모바일(iOS · Android) 클라이언트는 Microsoft 트래픽 프로필(Entra ID P1/P2) · Internet Access · Private Access 라이선스 표에서 모두 지원으로 표시됩니다 [확인 필요: 고객 라이선스 · 클라이언트 버전별 기능 · 미리 보기 범위]

### L3 · 0 · 기능 상태 전이 — 클라이언트 없음 → 설치·배포 → 규칙대로 트래픽 획득

#### L4 · ⓪ 비활성 — 클라이언트가 없는 기기는 프로필 규칙을 받지 못한다

1. [시작] 사용자가 업무 앱·인터넷에 접속 — 클라이언트가 설치되지 않은 기기
   - 주체: 사용자
   - 위치: 업무 PC · 브라우저 또는 앱 → 대상 서버
   - 데이터: 대상 FQDN · IP · 포트
   - 해설: 포털에서 트래픽 전달 프로필을 켜 두었어도 기기에 클라이언트가 없는 상황에서 시작합니다
2. [처리] 포워딩 프로필을 받을 주체가 없다 — 규칙이 기기까지 닿지 않음
   - 주체: 디바이스
   - 데이터: Global Secure Access 클라이언트는 포털의 트래픽 전달 프로필을 가져와 어떤 트래픽을 클라우드 서비스로 보낼지 정합니다. 클라이언트가 없으면 가져갈 곳이 없어 모든 트래픽이 직접 나갑니다
   - 해설: 사용자·기기 컨텍스트(CAE·기기 규정 준수·MFA 같은 통제)도 에지로 전달되지 않습니다
3. [판단] 기기가 지점의 원격 네트워크(IPsec) 안에 있는가?
   - 주체: 외부
   - 데이터: 원격 네트워크는 클라이언트 없는 접속 방식으로 Microsoft 트래픽·Internet Access 프로필만 지원합니다
   - 해설: 지점 터널을 타면 일부 트래픽은 에지로 가지만 클라이언트가 해 주는 일은 빠집니다
   - 지점 경유 → 4
   - 지점 밖 → 5
4. [처리] 원격 네트워크 터널 — 일부 프로필만 에지로, 사용자 단위 통제 없음
   - 주체: SSE 에지
   - 데이터: Microsoft 트래픽·Internet 트래픽에 대한 조건부 액세스 정책은 사용자가 Global Secure Access 클라이언트를 쓸 때만 적용됩니다. Private Access 트래픽은 원격 네트워크로 획득할 수 없습니다
   - 해설: 지점 경유는 부분 보호일 뿐이며 사용자 신원 기반 판정은 되지 않습니다
   - 다음 → 6
5. [처리] 직접 인터넷·사내망 경로 — 에지를 거치지 않음
   - 주체: 디바이스
   - 데이터: Private Access 앱은 클라이언트로만 획득되므로 사설 앱에 접근할 길이 없고, 인터넷 트래픽은 로컬 경로로 그대로 나갑니다. 에지를 거치지 않은 트래픽은 Global Secure Access 트래픽 로그에도 남지 않습니다
   - 해설: 재택·출장 기기는 어떤 SSE 통제도 받지 못합니다
6. [끝] 보호 공백 — 사설 앱 접근·사용자 단위 통제·진단 도구가 모두 없다
   - 주체: 로그
   - 위치: 기기에 Advanced diagnostics · Health check 같은 클라이언트 도구가 없음
   - 데이터: 클라이언트 로그·Forwarding profile 규칙 목록·Traffic 탭 부재
   - 해설: 장애가 나도 기기에서 무슨 규칙이 어떻게 적용됐는지 볼 방법이 없습니다
- 시나리오: 지점 경유 :: 지점 터널로 일부만 보호되고 사용자 통제는 빠짐
- 시나리오: 지점 밖 :: 직접 경로로 나가 에지 통제와 로그가 모두 없음

> 교육 포인트: 프로필을 켜는 것(포털)과 규칙이 기기에 닿는 것(클라이언트)은 별개입니다. 클라이언트가 규칙의 전달 수단이자 사용자·기기 신원의 전달 수단입니다.
>
> 주의: 원격 네트워크는 클라이언트 대체재가 아닙니다. 클라이언트 없는 지점 기기에는 조건부 액세스 같은 사용자 단위 통제가 적용되지 않습니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/concept-clients
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/reference-current-known-limitations
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/concept-traffic-forwarding

#### L4 · ① 구성 — 요건 확인 · 사전 조건 · 배포 · 동작 정책 · 파일럿을 정한다

1. [시작] 관리자가 Entra 관리 센터에 로그인 — 클라이언트 다운로드 권한
   - 주체: 관리자
   - 위치: entra.microsoft.com — Global Secure Access Administrator 역할로 로그인
   - 데이터: Entra 역할 할당. 다운로드 화면은 Global Secure Access › Connect › Client download입니다
   - 해설: 클라이언트 파일은 포털에서 받는 것이 가장 최신 버전의 공식 원천입니다
2. [처리] 트래픽 전달 프로필 켜기 — 최소 한 개
   - 주체: 관리자
   - 위치: Global Secure Access › Connect › Traffic forwarding › Microsoft traffic profile · Private access profile · Internet access profile 중 필요한 것을 켭니다
   - 데이터: 프로필 상태 = 켜짐. 모든 프로필이 꺼지면 클라이언트는 "Disabled by your organization" 상태가 되는 break-glass 모드입니다. 모바일 클라이언트는 프로필을 켜는 것이 곧 테넌트 온보딩입니다
   - 해설: 프로필 구성·할당 자체는 다른 기능에서 다루고, 여기서는 클라이언트가 받아 갈 프로필이 한 개 이상 있어야 한다는 점만 확인합니다
3. [처리] 설치 파일 내려받기 — Client download
   - 주체: 관리자
   - 위치: Global Secure Access › Connect › Client download › (macOS는 macOS 탭) › Download Client
   - 데이터: Windows 설치 파일 GlobalSecureAccessClient.exe · macOS 패키지 GlobalSecureAccessClient.pkg. Windows on Arm 기기는 별도 설치 파일(aka.ms/GlobalSecureAccess-WindowsOnArm)을 씁니다. Android·iOS는 Microsoft Defender for Endpoint 앱에 클라이언트가 내장되어 앱 스토어에서 받습니다
   - 해설: Arm64 기기에 표준 x64 설치 파일을 쓰면 안 됩니다
4. [판단] 기기가 플랫폼 요건과 조인 유형 요건을 충족하는가?
   - 주체: 관리자
   - 위치: Windows: 64비트 Windows 10(LTSC 2021 이상)·Windows 11·Arm64 Windows 11, 로컬 관리자 권한 · macOS: macOS 14 이상(Intel · M1~M4) · Android: 11.0 이상 · iOS: 16.0 이상
   - 데이터: Windows는 Entra joined · hybrid joined 또는 registered(미리 보기, Private Access만 지원)이며 기기가 가입·등록되지 않았으면 클라이언트가 로그인 시 테넌트에 등록합니다. macOS는 Company Portal로 Entra registered가 필요하고 MDM 등록 없는 BYOD는 지원되지 않습니다. Android·iOS는 Entra registered 기기이며 Microsoft Authenticator 또는 Company Portal이 필요합니다. Azure Virtual Desktop 다중 세션은 지원되지 않고 단일 세션·Windows 365는 지원됩니다 [미리 보기 확인 필요: Windows registered 기기 지원 범위]
   - 해설: 조인 유형이 연결 대상 테넌트와 사용 가능한 채널을 정합니다. Windows 클라이언트 화면의 Join type 항목으로 joined인지 registered인지 확인합니다
   - 요건 충족 → 5
   - 요건 미충족 → [차단] 설치 대상 아님 — 지원 외 OS·기기 유형 (Android Go edition · 공유 기기 · AVD 다중 세션 등)
5. [처리] 브라우저·OS 사전 조건 맞추기 — Secure DNS · IPv4 우선 · QUIC
   - 주체: 관리자
   - 위치: Intune admin center › Devices › Manage devices › Configuration › Create › Windows 10 and later › Settings catalog › Microsoft Edge · Google Chrome의 "Control the mode of DNS-over-HTTPS" = Disabled · HKLM\SYSTEM\CurrentControlSet\Services\Tcpip6\Parameters
   - 데이터: Windows는 FQDN 규칙 획득을 위해 DNS over HTTPS를 꺼야 합니다(Firefox는 Intune remediation script로 설정). IPv6는 획득되지 않으므로 DisabledComponents(REG_DWORD)=0x20으로 IPv4 우선을 정하며 재시작이 필요합니다. Android는 Private DNS를 꺼야 하고 macOS는 Secure DNS를 우회하므로 끌 필요가 없습니다. QUIC는 브라우저에서 끄지 않고 Custom Acquire(UDP 443)와 클라우드 방화벽 Block 규칙으로 다룹니다(미리 보기)
   - 해설: 이 사전 조건을 빼먹으면 설치는 성공해도 트래픽이 획득되지 않습니다
6. [처리] 배포 도구로 대규모 배포 — 플랫폼별 Intune 구성
   - 주체: 관리자
   - 위치: Intune admin center › Apps › All apps › Create(Windows app (Win32) · macOS app (PKG)) · Apps › Android › Manage Apps › Configuration · Devices › Configuration(iOS VPN 프로필)
   - 데이터: 플랫폼별 세부 값은 B 탭에서 다룹니다. Windows는 /quiet 스위치로 사일런트 설치할 수 있고 macOS는 sudo installer 명령으로 설치합니다
   - 해설: 수동 설치는 소수 기기에 쓰고 대규모는 MDM으로 배포합니다
7. [처리] 클라이언트 동작 정책 정하기 — Disable 버튼 · 비특권 사용자 제한
   - 주체: 관리자
   - 위치: HKLM\SOFTWARE\Microsoft\Global Secure Access Client (Windows) · Preference domain com.microsoft.globalsecureaccess (macOS plist) · Intune remediations(64비트 PowerShell 실행 = Yes)
   - 데이터: RestrictNonPrivilegedUsers=1이면 비특권 사용자는 Disable·Enable에 UAC 로컬 관리자 자격이 필요합니다. HideDisableButton · HideSignOutButton · HideDisablePrivateAccessButton(REG_DWORD, 0=표시 1=숨김; 기본은 Disable 표시, 나머지 숨김). macOS는 HideDisableButton · HidePauseButton · HideQuitButton · HideDisablePrivateAccessButton
   - 해설: 적용 전에 사용자가 비제한 모드로 먼저 써 보고, 예외 업무(특정 사이트·타사 VPN 병행)가 없는지 확인한 뒤 제한합니다
8. [처리] 파일럿 그룹에 먼저 배포 — 확대 전 검증
   - 주체: 관리자
   - 위치: Intune › 앱 Assignments › Required › + Add group (+ Restart grace period = Enabled)
   - 데이터: 사용자·기기 그룹 하나. 재시작 유예를 켜면 IPv4 우선 레지스트리 변경으로 인한 재부팅이 사용자를 갑자기 끊지 않습니다
   - 해설: 시범 그룹에서 Connected와 트래픽 획득을 확인한 뒤 대상을 넓힙니다
9. [끝] 설치 직후 Entra 로그인 — 아이콘 Connected 확인
   - 주체: GSA 클라이언트
   - 위치: 시스템 트레이 아이콘 · 클라이언트 상태 알림 · Settings 보기의 Client version
   - 데이터: Windows는 설치 후 Entra 자격 증명으로 자동 로그인하고 실패하면 설치 프로그램이 수동 로그인을 요청합니다. macOS는 시스템 확장 Allow와 프록시 구성 Allow를 승인해야 하며 Microsoft Enterprise SSO 플러그 인이 있으면 Company Portal 자격 증명으로 SSO합니다. 아이콘이 초록이고 "Connected"로 보이면 완료입니다
   - 해설: 이제 클라이언트가 포털의 프로필을 받아 규칙대로 트래픽을 획득합니다
- 시나리오: 요건 충족 :: 요건을 갖춘 기기에 사전 조건과 배포를 마쳐 연결됨
- 시나리오: 요건 미충족 :: 지원 외 OS나 기기 유형이라 설치 대상에서 제외됨

> 교육 포인트: 설치 성공과 트래픽 획득은 별개입니다. 사전 조건(Secure DNS 끔 · IPv4 우선)과 프로필 할당까지 갖춰야 규칙이 실제로 적용됩니다. 클라이언트는 설치와 함께 Entra에 로그인해 테넌트에 연결됩니다.
>
> 주의: 레지스트리 키는 문서에 나온 값만 바꾸고 나머지는 Microsoft 지원이 안내할 때만 바꿉니다. 비특권 사용자 제한을 걸면 로컬 관리자 처리 절차를 함께 마련해야 합니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-install-windows-client
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-install-macos-client
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/concept-bring-your-own-device
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/reference-current-known-limitations

#### L4 · ② 활성 — 클라이언트가 규칙을 받아 트래픽을 획득하고 에지로 보낸다

1. [시작] 사용자가 앱을 열어 연결 시도 — 클라이언트가 설치된 기기
   - 주체: 사용자
   - 위치: 앱 · 브라우저 → 대상 FQDN 또는 IP:포트
   - 데이터: DNS 질의 · 대상 주소 · 프로토콜 · 포트
   - 해설: 클라이언트는 사용자 모르게 백그라운드에서 이 연결을 먼저 봅니다
2. [처리] 클라이언트가 포워딩 프로필을 가져와 보관 — Policy Retriever
   - 주체: GSA 클라이언트
   - 위치: 서비스 GlobalSecureAccessPolicyRetrieverService · 레지스트리 HKLM\SOFTWARE\Microsoft\Global Secure Access Client\ForwardingProfile
   - 데이터: 규칙 목록(Priority · Destination · Protocol · Port · Action · Hardening · Rule ID)과 에지 주소가 담긴 JSON 정책. 포털 변경은 문서 기준 1시간 이내에 클라이언트에 도착합니다 [확인 필요: 다른 문서의 10~20분 안내와 환경별 차이]
   - 해설: 클라이언트는 프로필을 받은 뒤에야 어떤 트래픽을 잡을지 압니다
3. [처리] 연결을 규칙과 비교 — 우선순위 숫자가 작은 규칙 먼저
   - 주체: GSA 클라이언트
   - 위치: Advanced diagnostics › Forwarding profile 탭(Policy tester로 대상별 적용 규칙 확인)
   - 데이터: FQDN 규칙이면 클라이언트가 DNS 질의를 읽어 매칭하고 내부용 Generated IP address를 만듭니다 [확인 필요: 내부 동작은 Hostname acquisition 탭 설명 수준]. 규칙은 M365 rules · Private access rules · Internet access rules로 묶여 보입니다
   - 해설: 클라이언트는 LWF(lightweight filter) 드라이버로 트래픽을 잡아서, VPN 연결 방식의 다른 SSE 솔루션과 공존할 수 있습니다
4. [판단] 일치한 규칙의 Action이 Tunnel인가?
   - 주체: GSA 클라이언트
   - 데이터: Action = tunnel(에지로 전송) 또는 bypass(기기 네트워크로 직접). Traffic 탭에도 Tunnel · Bypass · Block으로 표시됩니다
   - 해설: 우회이거나 일치 규칙이 없으면 클라이언트는 개입하지 않습니다
   - 터널 규칙 → 5
   - 우회 규칙 → [끝] 직접 전송 — 에지를 거치지 않음
5. [처리] Entra 인증·터널 수립 — 사용자와 기기 컨텍스트 전달
   - 주체: GSA 클라이언트
   - 위치: 서비스 GlobalSecureAccessTunnelingService · Health check의 Cached token · (mTLS 사용 테넌트) gsa.client 인증서
   - 데이터: 클라이언트가 Entra에 인증해 받은 토큰. mTLS를 켠 테넌트는 인증서로 에지와 상호 인증합니다 [확인 필요: mTLS 적용 테넌트 범위]
   - 해설: 에지가 누구의 어떤 기기에서 온 트래픽인지 알아야 사용자 단위 판정이 가능합니다
6. [판단] 클라이언트가 클라우드 서비스(에지)에 연결할 수 있는가?
   - 주체: GSA 클라이언트
   - 위치: Health check › Edge hostname resolved by DNS · Edge is reachable
   - 데이터: 에지 FQDN 해석 · TCP 443 도달성 · 프록시 경유 여부
   - 해설: 연결 오류가 나면 클라이언트는 일치한 규칙의 Hardening 값에 따라 동작합니다
   - 연결됨 → 8
   - 연결 실패 → 7
7. [판단] 일치한 규칙의 Hardening 값은 무엇인가?
   - 주체: GSA 클라이언트
   - 위치: Advanced diagnostics › Forwarding profile 탭 › Hardening 열 · Traffic 탭 › Hardening 열
   - 데이터: Hardening = block(연결 차단) 또는 bypass(직접 허용). 에지에 닿지 못할 때만 적용됩니다
   - 해설: 보안 규칙은 block으로 두면 에지 장애 중에도 통제를 우회하지 못하게 막습니다
   - Hardening 차단 → [차단] 연결 차단 — 에지 접근 불가 시 block 규칙
   - Hardening 우회 → [끝] 직접 전송 — 에지 접근 불가 시 bypass 규칙
8. [끝] 에지로 터널링 — Traffic 탭에 Action=Tunnel로 기록
   - 주체: GSA 클라이언트
   - 위치: Advanced diagnostics › Traffic 탭 · 포털 Global Secure Access › 모니터링 › 트래픽 로그
   - 데이터: Channel(Microsoft 365 · Private Access · Internet Access) · Rule ID · Correlation vector ID(포털 트래픽 로그와 대조) · Bytes sent/received. 에지 이후의 정책 판정은 각 프로필 기능의 몫입니다
   - 해설: 클라이언트 쪽 증적(Traffic 탭)과 서비스 쪽 증적(트래픽 로그)을 Correlation vector ID로 이어서 볼 수 있습니다
- 시나리오: 터널 규칙 ▸ 연결됨 :: 터널 규칙에 일치해 에지로 터널링됨
- 시나리오: 터널 규칙 ▸ 연결 실패 ▸ Hardening 차단 :: 에지에 못 닿고 block 규칙이라 연결이 차단됨
- 시나리오: 터널 규칙 ▸ 연결 실패 ▸ Hardening 우회 :: 에지에 못 닿아 bypass 규칙대로 직접 전송됨
- 시나리오: 우회 규칙 :: 우회 규칙이라 클라이언트가 개입하지 않고 직접 전송됨

> 교육 포인트: 클라이언트는 "규칙 비교 → 터널 여부 → 에지 연결"의 순서로 판단합니다. Action(Tunnel/Bypass)과 Hardening(Block/Bypass)은 서로 다른 질문에 답합니다. 앞은 "이 트래픽을 에지로 보낼까", 뒤는 "에지에 못 닿았을 때 어떻게 할까"입니다.
>
> 주의: 연결 오류 시 직접 전송 또는 차단으로 떨어지는 동작은 일치 규칙의 Hardening 값에 따라 정해집니다. 클라이언트가 없는 트래픽과 달리 이 경로의 판정 결과는 Traffic 탭에서 확인합니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/concept-clients
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/troubleshoot-global-secure-access-client-advanced-diagnostics
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/reference-current-known-limitations
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/troubleshoot-global-secure-access-client-diagnostics-health-check

### L3 · A · 클라이언트가 트래픽을 획득하는 순서 — 획득 조건과 상태 전이

#### L4 · 획득 조건 — 어떤 연결이 에지로 가고 어떤 연결이 직접 나가는가

1. [시작] 앱이 대상으로 연결을 연다 — 프로필 규칙 평가 전 단계
   - 주체: 앱
   - 위치: 기기의 네트워크 스택(소켓 호출)
   - 데이터: 대상 IP · FQDN · 프로토콜 · 포트
   - 해설: 아래는 문서가 알려 주는 조건들을 순서대로 놓은 점검표이며, 클라이언트 내부의 평가 순서를 그대로 옮긴 것은 아닙니다 [확인 필요: 내부 평가 순서]
2. [판단] 대상 주소가 IPv4인가?
   - 주체: GSA 클라이언트
   - 위치: Health check › IPv4 preferred
   - 데이터: 클라이언트는 IPv4 트래픽만 터널하고 IPv6 트래픽은 네트워크로 직접 보냅니다. 같은 FQDN이 IPv6로도 풀리면 IPv4 우선으로 맞춥니다(DisabledComponents=0x20)
   - 해설: 에지도 현재 IPv4 주소로만 동작합니다
   - IPv4 → 3
   - IPv6 → [끝] 직접 전송 — IPv6는 획득되지 않음
3. [판단] 소켓으로 보낸 트래픽인가?
   - 주체: GSA 클라이언트
   - 데이터: 클라이언트는 소켓으로 보낸 트래픽만 터널합니다. 드라이버로 네트워크 스택에 주입한 패킷(예: Nmap 일부 트래픽)은 터널되지 않고 직접 나갑니다
   - 해설: 일반 앱은 소켓을 쓰므로 대부분 대상이지만 패킷 도구는 예외입니다
   - 소켓 → 4
   - 주입 패킷 → [끝] 직접 전송 — 패킷 주입은 터널되지 않음
4. [판단] 프로토콜·포트가 획득 규칙의 범위 안인가?
   - 주체: GSA 클라이언트
   - 위치: Advanced diagnostics › Forwarding profile 탭 › Protocol · Port 열
   - 데이터: Internet Access의 Default Acquire는 TCP 80·443만 가져옵니다. Internet Access에서 UDP(QUIC 포함) 종단 전달은 지원되지 않으며, Custom Acquire(UDP 443)와 클라우드 방화벽 Block으로 획득·차단만 합니다(미리 보기). QUIC는 Private Access와 Microsoft 365 워크로드에서는 지원됩니다
   - 해설: 범위 밖 트래픽은 규칙이 없어 클라이언트가 건드리지 않습니다
   - 규칙 범위 → 5
   - 범위 밖 → [끝] 직접 전송 — 획득 규칙 범위 밖의 포트·프로토콜
5. [판단] 일치한 규칙이 FQDN 기준인가, IP 기준인가?
   - 주체: GSA 클라이언트
   - 위치: Forwarding profile 탭 › Destination (IP/FQDN) 열
   - 데이터: FQDN 규칙은 기기가 DNS 서버로 보내는 질의를 클라이언트가 읽어야 매칭됩니다. IP 규칙은 목적지 IP로 바로 매칭됩니다
   - 해설: 같은 규칙 목록 안에 두 유형이 섞여 있고, 유형에 따라 DNS 의존성이 달라집니다
   - FQDN 규칙 → 6
   - IP 규칙 → 8
6. [판단] Secure DNS(DoH · DoT · DNSSEC)가 꺼져 있는가?
   - 주체: GSA 클라이언트
   - 위치: Health check › DNS over HTTPS not supported(Secure DNS disabled in OS · Edge · Chrome · Firefox)
   - 데이터: Windows 클라이언트는 DoH를 켠 상태에서는 FQDN 기준 획득을 할 수 없으며, 브라우저 자체 DNS 클라이언트의 DNS 53 TCP도 지원하지 않아 BuiltInDnsClientEnabled=0을 권장합니다. macOS 클라이언트는 Secure DNS를 우회해 FQDN 터널링을 강제하므로 끌 필요가 없습니다
   - 해설: Secure DNS가 켜져 있으면 클라이언트가 질의를 읽지 못해 FQDN 규칙이 맞아도 획득되지 않습니다
   - DoH 꺼짐 → 7
   - DoH 켜짐 → [끝] FQDN 규칙 미획득 — Health check의 DNS over HTTPS 항목 실패
7. [처리] DNS 질의를 읽고 FQDN 규칙 매칭 — Generated IP address 부여
   - 주체: GSA 클라이언트
   - 위치: Advanced diagnostics › Hostname acquisition 탭 › Start collecting
   - 데이터: Timestamp · FQDN · Generated IP address(클라이언트가 내부용으로 만든 IP) · Acquired(Yes/No) · Original IP address(DNS 응답의 첫 IPv4, IPv4가 없으면 빈 칸). Health check의 Magic IP received 항목이 이 동작을 점검합니다
   - 해설: Acquired=Yes인 호스트 이름만 터널 대상이 되며 이후 연결은 Generated IP로 Traffic 탭에 나타납니다
8. [처리] 우선순위가 가장 높은 규칙 적용 — Tunnel 결정
   - 주체: GSA 클라이언트
   - 위치: Forwarding profile 탭 › Priority(숫자가 작을수록 높음) · Policy tester
   - 데이터: Action = tunnel이면 에지로 보내고 bypass이면 직접 보냅니다. 같은 유형 프로필끼리 겹칠 때의 우선순위는 프로필 기능에서 다룹니다
   - 해설: 같은 목적지에 여러 규칙이 걸리면 우선순위가 높은 규칙이 이깁니다
9. [끝] 에지로 터널링 — Traffic 탭에 Tunnel로 기록
   - 주체: GSA 클라이언트
   - 위치: Advanced diagnostics › Traffic 탭 › Action = Tunnel
   - 데이터: Channel · Rule ID · Correlation vector ID · Process name · Bytes sent/received
   - 해설: 여기까지 통과한 연결만 에지에서 정책 판정을 받습니다
- 시나리오: IPv4 ▸ 소켓 ▸ 규칙 범위 ▸ FQDN 규칙 ▸ DoH 꺼짐 :: DNS를 읽어 FQDN 규칙이 획득되어 에지로 터널링됨
- 시나리오: IPv4 ▸ 소켓 ▸ 규칙 범위 ▸ FQDN 규칙 ▸ DoH 켜짐 :: Secure DNS 때문에 FQDN 규칙이 획득되지 않음
- 시나리오: IPv4 ▸ 소켓 ▸ 규칙 범위 ▸ IP 규칙 :: IP 규칙에 일치해 DNS 없이 에지로 터널링됨
- 시나리오: IPv4 ▸ 소켓 ▸ 범위 밖 :: 획득 규칙 범위 밖의 포트라 직접 전송됨
- 시나리오: IPv4 ▸ 주입 패킷 :: 드라이버로 주입된 패킷이라 터널되지 않음
- 시나리오: IPv6 :: IPv6 트래픽이라 획득되지 않고 직접 전송됨

> 교육 포인트: "규칙이 있는데 왜 안 잡히나"의 대표 원인은 IPv6 · UDP/QUIC · Secure DNS · 주입 패킷입니다. 각각 문서에 있는 알려진 제한이고, 모두 Traffic 탭에서 Action을 확인하면 갈립니다.
>
> 주의: 이 L4의 검사 순서는 설명용 점검표입니다. 어느 조건이 먼저 평가되는지는 문서가 정하지 않으므로 순서 자체를 근거로 쓰지 않습니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/reference-current-known-limitations
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/troubleshoot-global-secure-access-client-advanced-diagnostics
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/troubleshoot-global-secure-access-client-diagnostics-health-check

#### L4 · 클라이언트 상태 — Disable · Pause · Enable 과 관리자 제한

1. [시작] 사용자가 시스템 트레이의 클라이언트 아이콘 메뉴를 연다
   - 주체: 사용자
   - 위치: 트레이 아이콘 우클릭(Windows · macOS) · Microsoft Defender 앱의 Global Secure Access 타일(Android · iOS)
   - 데이터: 메뉴 항목은 관리자가 정한 레지스트리·plist·앱 구성 값에 따라 달라집니다
   - 해설: 어떤 버튼이 보이는지가 곧 관리자가 허용한 조작 범위입니다
2. [판단] 클라이언트 플랫폼은 무엇인가?
   - 주체: 사용자
   - 데이터: Windows · macOS · 모바일(Android · iOS)
   - 해설: Disable · Pause 동작과 제어 방식이 플랫폼마다 다릅니다
   - Windows → 3
   - macOS → 6
   - 모바일 → 7
3. [판단] Windows에서 Disable 버튼이 표시되고 비특권 사용자 제한이 없는가?
   - 주체: GSA 클라이언트
   - 위치: HKLM\SOFTWARE\Microsoft\Global Secure Access Client — HideDisableButton · RestrictNonPrivilegedUsers
   - 데이터: HideDisableButton 기본값 0(표시). RestrictNonPrivilegedUsers=1이면 Disable·Enable에 UAC 로컬 관리자 자격이 필요합니다. 1로 숨기면 비특권 사용자는 클라이언트를 끌 수 없습니다
   - 해설: 이 값을 관리자가 정해 두었는지가 사용자가 클라이언트를 끌 수 있는지를 가릅니다
   - 사용자 허용 → 4
   - 관리자 제한 → 5
4. [처리] Windows Disable — 사용자가 끄면 Enable 또는 재시작 전까지 꺼진 채 유지
   - 주체: 사용자
   - 위치: 트레이 메뉴 › Disable / Enable
   - 데이터: 아이콘이 Disabled가 되고 규칙대로의 트래픽 획득이 멈춥니다. Disable은 다시 Enable하거나 컴퓨터를 재시작할 때까지 유지됩니다
   - 해설: 끈 시간만큼 해당 기기는 에지 통제 밖이 되므로 허용 여부를 신중히 정합니다
   - 다음 → 8
5. [처리] 관리자 제한 — 일반 사용자는 끌 수 없다
   - 주체: 관리자
   - 위치: Intune remediation(detection·remediation 스크립트, 64비트 PowerShell) · 레지스트리
   - 데이터: HideDisableButton=1 · RestrictNonPrivilegedUsers=1 · HideSignOutButton(기본 숨김) · HideDisablePrivateAccessButton(기본 숨김). 로컬 관리자 처리 절차를 함께 마련해야 합니다
   - 해설: 클라이언트가 계속 켜져 있어야 인증·보호가 유지됩니다
   - 다음 → 8
6. [처리] macOS Disable · Pause — 사유 입력과 재인증 필요
   - 주체: 사용자
   - 위치: 트레이 아이콘 우클릭 › Disable · Enable · Pause · Resume · Restart · Collect Logs · Settings · About
   - 데이터: Disable과 Pause는 업무상 사유(business justification) 입력과 로그인 자격 증명 재입력이 필요하고 사유는 기록됩니다. Pause는 10분 동안 또는 Resume · 기기 재시작 때까지 유지됩니다. 관리자는 HideDisableButton · HidePauseButton · HideQuitButton · HideDisablePrivateAccessButton으로 메뉴를 숨깁니다
   - 해설: macOS는 끌 때 이유와 재인증을 남겨 사후 추적이 가능합니다
   - 다음 → 8
7. [처리] 모바일 — 구성 키가 타일 표시와 끄기 가능 여부를 정한다
   - 주체: 관리자
   - 위치: Android 앱 구성 정책 키 Global Secure Access(0~3) · GlobalSecureAccessPrivateChannel(0~3) · iOS VPN 프로필 키 EnableGSA(0~3) · EnableGSAPrivateChannel(0~3)
   - 데이터: 0=타일 안 보임 · 1=보이고 기본 꺼짐(사용자가 켬) · 2=보이고 기본 켜짐(사용자가 끌 수 있음) · 3=보이고 기본 켜짐(사용자가 끌 수 없음). Android의 키는 iOS의 키 이름과 다르며 섞어 쓰면 안 됩니다. 배포 직후 클라이언트는 기본 꺼짐일 수 있습니다
   - 해설: 사용자가 끌 수 없게 하려면 값 3을 씁니다
8. [끝] 상태 아이콘이 바뀐다 — Connected · Disabled · Disabled by your organization
   - 주체: GSA 클라이언트
   - 위치: 시스템 트레이 상태 아이콘 · Connections 보기
   - 데이터: Global Secure Access - Connected · Disabled(서비스 오프라인 또는 사용자가 끔) · Disabled by your organization(프로필이 모두 꺼짐) · Some channels are unreachable · could not connect to the Internet(캡티브 포털 등)
   - 해설: 사용자가 끈 Disabled와 관리자가 프로필을 끈 Disabled by your organization은 서로 다른 상태입니다
- 시나리오: Windows ▸ 사용자 허용 :: 사용자가 끄면 Enable이나 재시작 전까지 꺼짐
- 시나리오: Windows ▸ 관리자 제한 :: 비특권 사용자는 끌 수 없고 관리자 자격이 필요함
- 시나리오: macOS :: 사유 입력과 재인증을 거쳐 끄거나 10분 일시 중지
- 시나리오: 모바일 :: 구성 키 값이 타일과 끄기 가능 여부를 정함

> 교육 포인트: 클라이언트를 끄는 권한은 보안 통제의 일부입니다. Windows는 레지스트리, macOS는 plist, 모바일은 앱 구성 키로 같은 의도를 서로 다르게 구현합니다.
>
> 주의: Disable은 재부팅 시 복귀하는 일시적 상태가 아니라 Enable 전까지 유지되는 상태이므로(Windows는 재시작 포함) 사용자 교육과 제한 정책을 함께 둡니다. macOS Pause는 10분으로 정해져 있습니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-install-windows-client
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-install-macos-client
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-install-android-client
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-install-ios-client

### L3 · B · 배포와 업데이트 — 플랫폼별 대규모 배포와 버전 관리

#### L4 · 플랫폼별 배포 — Windows Win32 · macOS PKG · Android · iOS

1. [시작] 배포 대상 플랫폼을 정한다 — 설치 파일과 요건 준비
   - 주체: 관리자
   - 위치: Intune admin center(intune.microsoft.com)
   - 데이터: Windows 사일런트는 /quiet 스위치 또는 MDM. macOS는 sudo installer -pkg ... -target / . Android·iOS는 Microsoft Defender for Endpoint 앱으로 배포
   - 해설: 플랫폼마다 배포 단위가 다릅니다. 앱 파일 · PKG · 구성 키 가운데 무엇을 배포하는지부터 구분합니다
2. [판단] 어느 플랫폼에 배포하는가?
   - 주체: 관리자
   - 데이터: Windows · macOS · Android · iOS
   - 해설: 선택에 따라 Intune의 앱 종류와 추가 구성이 달라집니다
   - Windows → 3
   - macOS → 6
   - Android → 9
   - iOS → 10
3. [처리] Windows: .intunewin 패키징과 프로그램 설정
   - 주체: 관리자
   - 위치: Intune › Apps › All apps › Add › Windows app (Win32) › App package file(.intunewin) · Program 탭
   - 데이터: 설치 스크립트와 GlobalSecureAccessClient.exe(파일 이름 고정)를 한 폴더에 묶어 패키징합니다. 스크립트는 클라이언트를 설치하고 DisabledComponents=0x20으로 IPv4 우선을 정하며 재부팅을 요청하고 C:\ProgramData\GSAInstall\install.log에 기록합니다. Install command는 powershell.exe -ExecutionPolicy Bypass -File <스크립트 이름>.ps1 · Uninstall command는 "GlobalSecureAccessClient.exe" /uninstall /quiet /norestart · Install behavior = System · Allow available uninstall = No
   - 해설: 반환 코드 0은 Success, 3010은 Soft reboot, 1618은 Retry로 지정합니다
4. [처리] Windows: 요구 사항과 검색 규칙 지정
   - 주체: 관리자
   - 위치: Requirements 탭 · Detection rules 탭(Manually configure detection rules › File)
   - 데이터: Path C:\Program Files\Global Secure Access Client\TrayApp · File GlobalSecureAccessClient.exe · Detection method String (version) · Operator 이상(Greater than or equal to) · Value 클라이언트 버전. Windows on Arm은 별도 설치 파일을 사용합니다
   - 해설: 검색 규칙의 버전 값이 이후 업데이트 판정의 기준이 됩니다
5. [처리] Windows: 할당 — Required 그룹과 재시작 유예
   - 주체: 관리자
   - 위치: Assignments › Required › + Add group · Restart grace period = Enabled
   - 데이터: 사용자 또는 기기 그룹. 가상 머신에 배포하면 재시작 요청이 억제될 수 있습니다
   - 해설: 유예를 켜면 사용자가 급작스러운 재부팅을 겪지 않습니다
   - 다음 → 11
6. [처리] macOS: PKG 앱 — macOS 14.0 이상 · 검색 규칙
   - 주체: 관리자
   - 위치: Intune › Apps › All Apps › Create › macOS app (PKG) › App package file · Requirements(최소 macOS 14.0) · Detection rules
   - 데이터: 버전 1.1.26060207부터 앱 패키지에 com.microsoft.autoupdate2 앱이 포함되므로, 이미 설치된 환경에서 감지 규칙과 충돌하면 감지 규칙에서 이 앱을 뺄 수 있습니다
   - 해설: 사용자·기기 그룹에 Assignments를 하면 패키지가 배포됩니다
7. [처리] macOS: 시스템 확장 사전 승인 — Allowed System Extensions
   - 주체: 관리자
   - 위치: Intune › Devices › Manage devices › Configuration › Policies › Create › New policy › macOS · Settings catalog › System Configuration › System Extensions › Allowed System Extensions
   - 데이터: Bundle identifier com.microsoft.globalsecureaccess.tunnel · com.microsoft.globalsecureaccess, Team identifier UBF8T346G9. 예전의 Extensions 프로필 유형은 폐기되었으므로 이 설정 카탈로그로 이전합니다
   - 해설: 사용자에게 승인 창을 띄우지 않고 사일런트 배포하려면 시스템 확장을 MDM으로 미리 승인합니다
8. [처리] macOS: 투명 애플리케이션 프록시 사전 승인 — Custom 프로필
   - 주체: 관리자
   - 위치: Intune › Devices › Configuration › Create › macOS · Templates › Custom · Deployment channel = Device channel · .xml 업로드
   - 데이터: 페이로드 PayloadIdentifier com.microsoft.globalsecureaccess · PayloadDisplayName Global Secure Access Proxy Configuration 등을 담은 프로필
   - 해설: 시스템 확장 승인과 프록시 구성 승인 둘 다 있어야 사용자 개입 없이 설치됩니다
   - 다음 → 11
9. [처리] Android: Defender 앱 구성 정책 — 키 Global Secure Access
   - 주체: 관리자
   - 위치: Intune › Apps › Android › Manage Apps › Configuration › + Create › Managed devices · Platform = Android Enterprise · Profile Type = Fully Managed, Dedicated, and Corporate-Owned Work Profile Only · Targeted app = Microsoft Defender
   - 데이터: Configuration designer에서 Global Secure Access(값 0~3) · GlobalSecureAccessPrivateChannel(값 0~3)을 추가합니다. GlobalSecureAccessPA 키는 더 이상 지원되지 않습니다. Android 11.0 이상 · Entra registered. 비 Microsoft MDM은 같은 두 키를 관리형 앱 구성으로 씁니다(Global Secure Access only mode)
   - 해설: 기본값은 타일이 보이되 꺼진 상태라 사용자가 Defender 앱에서 토글을 켭니다
   - 다음 → 11
10. [처리] iOS: Defender 앱 + 로컬 VPN 프로필 — 키 EnableGSA
   - 주체: 관리자
   - 위치: Intune › Apps › iOS/iPadOS › Add › iOS store app › Microsoft Defender(최소 iOS 16.0) · Devices › Configuration › Create › iOS/iPadOS · Templates › VPN
   - 데이터: Connection type Custom VPN · VPN server address 127.0.0.1 · VPN identifier com.microsoft.scmx · Split tunneling Disable · 키 EnableGSA(0~3) · SilentOnboard=True · 선택 EnableGSAPrivateChannel · On-demand VPN(Connect VPN, All domains). 사용자가 VPN을 끄지 못하게 Block users from disabling automatic VPN = Yes
   - 해설: iOS 클라이언트는 일반 VPN이 아니라 자기 자신(127.0.0.1)으로 되돌아오는 로컬 VPN입니다
11. [끝] 단말에서 연결 상태 확인 — Connected · Enabled
   - 주체: GSA 클라이언트
   - 위치: 시스템 트레이 아이콘(Windows · macOS) · Defender 앱의 Global Secure Access 타일(Android · iOS) · Intune › Device install status
   - 데이터: Windows는 아이콘 초록 · Connected. macOS는 시스템 확장과 프록시 구성 Allow 승인 후 Connected. 모바일은 타일에 "Enabled"와 연결 시각이 표시됩니다
   - 해설: Intune 쪽 설치 성공과 단말의 연결 상태를 함께 확인합니다
- 시나리오: Windows :: Win32 앱으로 설치하고 IPv4 우선 설정까지 적용됨
- 시나리오: macOS :: PKG와 시스템 확장·프록시를 사전 승인해 사일런트 배포됨
- 시나리오: Android :: Defender 앱 구성 정책의 키로 타일을 켜서 배포됨
- 시나리오: iOS :: Defender 앱과 로컬 VPN 프로필 키로 배포됨

> 교육 포인트: Windows·macOS는 클라이언트 설치 파일을 배포하고, Android·iOS는 Defender for Endpoint 앱에 내장된 클라이언트를 구성 키로 켭니다. 같은 "설정 값 0~3"이라도 Android와 iOS의 키 이름이 달라 섞어 쓰면 안 됩니다.
>
> 주의: macOS는 시스템 확장과 투명 프록시를 사전 승인하지 않으면 사용자 승인 창이 뜹니다. Windows 설치 스크립트가 IPv4 우선 레지스트리를 바꾸고 재부팅을 요구하므로 재시작 유예 설정을 함께 둡니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-install-windows-client
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-install-macos-client
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-install-android-client
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-install-ios-client

#### L4 · 업데이트 — Windows Update 자동 업그레이드와 Intune 단계적 배포

1. [시작] 새 클라이언트 버전이 나온다 — 릴리스 노트로 확인
   - 주체: 관리자
   - 위치: Windows 클라이언트 릴리스 노트(reference-windows-client-release-history) · Global Secure Access › Connect › Client download
   - 데이터: 릴리스마다 새 기능 · 수정 · 최소 버전 · 업그레이드 동작이 정리되어 있습니다. 보안 권장 사항으로 최신 클라이언트를 정기적으로 시험·배포하라고 안내합니다
   - 해설: 최신 버전 유지는 보안 수정까지 받는 가장 기본적인 운영입니다
2. [판단] 기기가 Windows Update 자동 업그레이드를 받는가?
   - 주체: 관리자
   - 위치: 클라이언트 버전 · 설치 시 EnableWindowsUpdates 매개 변수
   - 데이터: 문서 기준 2026년 11월부터 클라이언트가 Windows Update로 자동 업그레이드되며, 대상은 Windows x64 2.31.125 이상 · Windows on Arm 2.32.294 이상을 실행하는 기기입니다 [확인 필요: 적용 시점 · 최소 버전 · 지역별 배포]. 옵트아웃은 설치·업그레이드 때 `<설치 파일> /quiet /norestart EnableWindowsUpdates=0`을 씁니다
   - 해설: 옵트아웃하거나 최소 버전 미만이면 관리자가 직접 최신 상태를 유지해야 합니다
   - 자동 수신 → 3
   - 수동 관리 → 4
3. [처리] Windows Update로 클라이언트가 자동 업그레이드된다
   - 주체: OS 업데이트
   - 위치: Windows Update(기기)
   - 데이터: 별도 Intune 앱 업데이트 없이 최신 클라이언트로 올라갑니다. 옵트아웃하지 않은 기기만 해당합니다
   - 해설: 대규모 환경에서도 업그레이드 작업이 줄어듭니다
   - 다음 → 8
4. [처리] 새 .intunewin과 버전·검색 규칙 값을 갱신한다
   - 주체: 관리자
   - 위치: Intune › 앱 업데이트(Update a line-of-business app 절차) · Detection rules 탭
   - 데이터: 새 .intunewin 업로드 · 앱의 Client version · 검색 규칙의 버전 값(새 클라이언트 버전). 두 값을 함께 바꿔야 합니다
   - 해설: 검색 규칙의 버전이 그대로면 이미 최신으로 보여 업데이트가 배포되지 않습니다
5. [처리] 기존 앱은 두고 새 앱을 추가한다 — 단계적 배포
   - 주체: 관리자
   - 위치: Intune › Apps › All apps › Add(새 클라이언트 버전용 앱)
   - 데이터: 기존 앱은 유지하고 새 버전용 앱을 별도로 만듭니다. 운영 환경에서는 단계적 배포를 권장합니다
   - 해설: 문제가 생기면 기존 앱 배포로 돌아갈 수 있습니다
6. [처리] 소규모 파일럿 그룹에 새 앱을 할당한다
   - 주체: 관리자
   - 위치: Intune › 새 앱 Assignments › Required › 파일럿 그룹
   - 데이터: 파일럿 사용자는 기존 버전 앱에도 할당된 채로 제자리 업그레이드가 가능합니다
   - 해설: 소수 사용자로 신규 버전의 호환성을 확인합니다
7. [처리] 파일럿 그룹을 넓히고 기존 앱을 삭제한다
   - 주체: 관리자
   - 위치: Intune › 앱 Assignments · 기존 앱 삭제
   - 데이터: 대상 기기 전체에 새 클라이언트가 배포되면 이전 버전 앱을 삭제합니다. macOS는 설치 프로그램이 업그레이드를 지원하며 같은 sudo installer 명령으로 사일런트 업그레이드합니다
   - 해설: 모든 대상에 배포가 끝난 뒤에 이전 앱을 정리합니다
8. [끝] 버전 확인 — Overview 탭의 Client version
   - 주체: GSA 클라이언트
   - 위치: Advanced diagnostics › Overview 탭 › Client version · 트레이 클라이언트 Settings 보기
   - 데이터: Username · Device ID · Tenant ID · Forwarding Profile ID · Forwarding Profile last checked · Client version
   - 해설: 기기에서 표시되는 버전과 Intune 검색 규칙의 버전이 맞는지 대조합니다
- 시나리오: 자동 수신 :: Windows Update가 클라이언트를 자동 업그레이드함
- 시나리오: 수동 관리 :: Intune 앱을 새 버전으로 만들어 단계적으로 확대함

> 교육 포인트: 업그레이드 경로가 두 갈래입니다. Windows Update(자동)와 Intune 단계적 배포(수동 관리)이며, 옵트아웃하는 순간 최신 유지 책임은 관리자에게 있습니다.
>
> 주의: Windows Update 자동 업그레이드는 문서에서 2026년 11월 시작으로 안내하는 새 동작이라 [확인 필요]입니다. 릴리스 노트에는 미리 보기 버전(2.35.136, 2026-11-16 배포)도 함께 표시되므로 운영 환경 배포 전에 미리 보기 여부를 확인합니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/reference-windows-client-release-history
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-install-windows-client
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-install-macos-client

### L3 · C · 진단과 장애 시나리오 — Health check · 획득 추적 · 로그 수집

#### L4 · Health check — 첫 번째 실패 테스트부터 푼다

1. [시작] 사용자가 "연결이 안 된다"고 신고 — 트레이 아이콘 상태부터 확인
   - 주체: 사용자
   - 위치: 시스템 트레이 아이콘 · 클라이언트 상태 알림
   - 데이터: Global Secure Access - Disconnected · Some channels are unreachable · Disabled by your organization · could not connect to the Internet
   - 해설: 아이콘 문구가 원인 범위를 좁혀 줍니다
2. [판단] 트레이 상태가 가리키는 원인은 무엇인가?
   - 주체: 관리자
   - 데이터: Disabled by your organization = 모든 전달 프로필이 꺼짐(break-glass). could not connect to the Internet = 인터넷 연결 없음 또는 캡티브 포털 로그인 필요. Disconnected · Some channels are unreachable = 클라이언트가 서비스에 연결하지 못함(채널은 Microsoft Entra · Microsoft 365 · Private Access · Internet Access)
   - 해설: 앞의 두 상태는 클라이언트 고장이 아니라 설정·네트워크 상태입니다
   - 조직이 끔 → [끝] 프로필이 모두 꺼져 있음 — Global Secure Access › Connect › Traffic forwarding에서 필요한 프로필을 켜면 1시간 이내에 클라이언트가 받음
   - 인터넷 없음 → [끝] 캡티브 포털 · 네트워크 단절 — 로그인 후 재확인
   - 연결 실패 → 3
3. [처리] Advanced diagnostics를 열어 Health check 탭 실행
   - 주체: 관리자
   - 위치: 트레이 아이콘 우클릭 › Advanced Diagnostics › UAC 승인 › Health check 탭(탭 전환 시 실행) · 이벤트 뷰어 › Applications and Services Logs › Microsoft › Windows › Global Secure Access Client(Operational=클라이언트 · Kernel=드라이버)
   - 데이터: 테스트끼리 서로 의존하므로 목록의 첫 번째 실패 항목부터 해결하고 Refresh로 다시 확인합니다. 실패 로그가 쌓이는 이벤트 뷰어도 함께 봅니다
   - 해설: 아래쪽 실패는 위쪽 실패의 결과일 수 있으니 위에서부터 풉니다
4. [판단] 실패한 테스트는 어느 영역인가?
   - 주체: 관리자
   - 데이터: 서비스·드라이버 계열 · 정책·인증 계열 · DNS·네트워크 계열
   - 해설: 영역에 따라 확인 명령과 복구 절차가 다릅니다
   - 서비스·드라이버 → 5
   - 정책·인증 → 6
   - DNS·네트워크 → 7
5. [처리] 서비스·드라이버 복구 — sc query로 상태 확인
   - 주체: 관리자
   - 위치: 명령 프롬프트 · services.msc
   - 데이터: sc query GlobalSecureAccessTunnelingService · GlobalSecureAccessEngineService · GlobalSecureAccessPolicyRetrieverService · GlobalSecureAccessDriver. 서비스가 중지되어 있으면 services.msc에서 시작하고 시작 실패 시 이벤트 뷰어 오류를 봅니다. 드라이버가 안 돌면 클라이언트 로그에서 event 304를 찾아 재부팅 후 재확인하고, 해결이 안 되면 클라이언트를 재설치합니다. 트레이 앱이 안 보이면 C:\Program Files\Global Secure Access Client\GlobalSecureAccessClient.exe를 실행합니다
   - 해설: 서비스 세 개와 드라이버 하나, 트레이 앱이 모두 떠 있어야 클라이언트가 동작합니다
   - 다음 → 8
6. [처리] 정책·인증 복구 — 포워딩 프로필 · 토큰 · 인증서
   - 주체: 관리자
   - 위치: HKLM\SOFTWARE\Microsoft\Global Secure Access Client\ForwardingProfile · ForwardingProfileTimestamp · certlm.msc · dsregcmd /status
   - 데이터: ForwardingProfile 키가 없거나 스키마가 맞지 않으면 두 키(ForwardingProfile · ForwardingProfileTimestamp)를 지우고 Global Secure Access Policy Retriever Service를 재시작한 뒤 클라이언트를 재시작합니다. Cached token 실패는 Entra 사용자(기기가 속한 테넌트)로 로그인하고 알림의 Sign in을 선택합니다. mTLS를 켠 테넌트에서 인증서 테스트가 실패하면 Personal › Certificates의 gsa.client로 끝나는 인증서와 CertCommonName 키를 지우고 Engine Service를 재시작해 새 인증서를 받습니다. Windows 로그인 사용자가 Entra 사용자인지는 dsregcmd /status의 AzureAdPrt: YES로 확인합니다
   - 해설: 정책 파일을 새로 받게 하는 것이 정책·인증 문제의 가장 흔한 복구 방법입니다
   - 다음 → 8
7. [처리] DNS·네트워크 점검 — 에지 해석과 도달성
   - 주체: 관리자
   - 위치: PowerShell · 명령 프롬프트 · PAC 파일
   - 데이터: DNS responsive 실패 시 클라이언트를 일시 중지하고 nslookup으로 DNS 서버를 확인합니다. Edge hostname resolved by DNS는 Resolve-DnsName -Name <에지 FQDN>으로, Edge is reachable은 Test-NetConnection -ComputerName <에지 FQDN> -Port 443으로 확인합니다(에지는 IPv4로만 동작). Proxy disabled 실패 시 PAC 파일 또는 WPAD에서 클라이언트가 획득하는 목적지와 건강 점검용 .edgediagnostic.globalsecureaccess.microsoft.com을 DIRECT로 제외합니다. DNS over HTTPS not supported는 OS·Edge·Chrome·Firefox에서 Secure DNS를 끕니다
   - 해설: 에지에 닿지 못하는 원인은 대부분 DNS 해석, 방화벽·프록시, IPv6 사용입니다
8. [끝] Refresh로 재검사 — 모두 통과하면 로그 수집으로 넘어간다
   - 주체: 관리자
   - 위치: Health check › Refresh · Global Secure Access processes healthy (last 24 h) 항목
   - 데이터: 모든 항목 통과 시 클라이언트는 정상입니다. "processes healthy" 실패는 최근 24시간에 프로세스 크래시가 있었다는 뜻이며 LocalDumps의 DumpFolder 설정으로 덤프를 모으고 Event ID 1000을 거릅니다. 풀리지 않으면 C 탭의 다음 L4에서 로그를 수집합니다
   - 해설: 위에서부터 하나씩 고치고 Refresh를 반복하는 것이 표준 절차입니다
- 시나리오: 조직이 끔 :: 프로필이 모두 꺼져 있어 포털에서 켜면 해결됨
- 시나리오: 인터넷 없음 :: 캡티브 포털 등 네트워크 문제라 클라이언트와 무관함
- 시나리오: 연결 실패 ▸ 서비스·드라이버 :: 서비스나 드라이버가 멈춰 재시작·재설치로 복구함
- 시나리오: 연결 실패 ▸ 정책·인증 :: 포워딩 프로필·토큰·인증서를 다시 받아 복구함
- 시나리오: 연결 실패 ▸ DNS·네트워크 :: DNS·방화벽·프록시를 고쳐 에지 연결을 복구함

> 교육 포인트: Health check 테스트는 서로 의존하므로 첫 번째 실패부터 고칩니다. 테스트 결과는 클라이언트 서비스 · 포워딩 프로필 · 인증 · DNS · 에지 도달성의 계층으로 읽습니다.
>
> 주의: Windows 클라이언트 릴리스 2.26.108에서 "Device is Microsoft Entra Joined"와 "Entra user signed in to Windows" 테스트가 Health check에서 빠졌고 registered 기기를 지원합니다(미리 보기). 버전에 따라 보이는 테스트 목록이 다를 수 있습니다 [확인 필요].
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/troubleshoot-global-secure-access-client-diagnostics-health-check
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/troubleshoot-global-secure-access-client-advanced-diagnostics
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-install-windows-client
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/reference-windows-client-release-history

#### L4 · 획득 추적 — 특정 앱의 트래픽이 에지로 가는지 따라간다

1. [시작] 특정 앱·사이트가 에지로 가지 않는다는 신고
   - 주체: 사용자
   - 위치: 앱 · 브라우저(예: RDP 대상 포트 3389)
   - 데이터: 대상 FQDN · IP · 포트
   - 해설: 연결이 되든 안 되든 "클라이언트가 잡았는가"부터 확인합니다
2. [처리] Forwarding profile 탭에서 규칙을 확인한다
   - 주체: 관리자
   - 위치: Advanced diagnostics › Forwarding profile 탭 › Policy tester · Add filter · Columns · Refresh details
   - 데이터: Forwarding profile ID · Forwarding profile last checked · Priority · Destination(IP/FQDN) · Protocol · Port · Action(tunnel/bypass) · Hardening(block/bypass) · Rule ID · Application ID(Private 앱만). 규칙에 목적지가 여러 개면 목적지마다 한 행입니다. Policy tester로 대상에 적용되는 규칙을 직접 확인합니다
   - 해설: 규칙이 없거나 Action이 bypass이면 이후 추적은 의미가 없습니다
3. [판단] 해당 규칙이 FQDN 기준인가, IP 기준인가?
   - 주체: 관리자
   - 데이터: FQDN 규칙이면 DNS 질의 획득을 확인해야 하고 IP 규칙이면 바로 연결 단계로 갑니다
   - 해설: FQDN 규칙만 Hostname acquisition 탭으로 한 번 더 확인합니다
   - FQDN 규칙 → 4
   - IP 규칙 → 5
4. [처리] Hostname acquisition 탭으로 호스트 이름 획득 확인
   - 주체: 관리자
   - 위치: Advanced diagnostics › Hostname acquisition 탭 › Start collecting → 접속 재현 → Export CSV · Clear table
   - 데이터: Timestamp · FQDN · Generated IP address · Acquired(Yes/No) · Original IP address. Acquired=No이면 규칙에 일치하지 않았거나 Secure DNS·브라우저 DNS 때문에 질의를 읽지 못한 것입니다
   - 해설: 이 탭은 FQDN 규칙이 실제로 클라이언트에 잡혔는지를 보여 줍니다
5. [처리] Traffic 탭으로 연결 단위 결과 확인
   - 주체: 관리자
   - 위치: Advanced diagnostics › Traffic 탭 › Start collecting → 접속 재현 → 기본 필터 Action==Tunnel · Destination Port 필터
   - 데이터: Timestamp begin/end · Connection status · Protocol · Destination FQDN · Destination IP · Destination port · Correlation vector ID · Process name · Process ID · Bytes sent/received · Channel · Rule ID · Action(Tunnel/Bypass/Block) · Hardening(Yes/No). Block은 Hardening 모드에서만 가능합니다
   - 해설: Action 열이 클라이언트가 이 연결을 어떻게 다뤘는지 알려 주고, Correlation vector ID로 포털 트래픽 로그와 이어집니다
6. [판단] 결과가 의도한 동작과 같은가?
   - 주체: 관리자
   - 데이터: Tunnel로 잡혔는지 · Bypass인지 · Block(Hardening)인지 · 아예 안 보이는지
   - 해설: 같으면 클라이언트는 정상이고 문제는 에지 이후 정책이나 대상 서비스에 있습니다
   - 의도대로 → [끝] 클라이언트는 정상 — Correlation vector ID로 포털 트래픽 로그에서 에지 이후를 추적
   - 의도와 다름 → 7
   - 원인 불명 → 8
7. [처리] 원인 유형별로 교정한다
   - 주체: 관리자
   - 위치: Forwarding profile 규칙 · Secure DNS 설정 · PAC 파일 · 레지스트리 IPv4 우선
   - 데이터: Action=Bypass → Default/Custom Bypass 규칙과 우선순위를 확인합니다. Acquired=No → Secure DNS와 브라우저 DNS 클라이언트(BuiltInDnsClientEnabled=0)를 끕니다. IPv6로 나가는 연결은 IPv4 우선을 설정합니다. 프록시를 쓰면 획득 대상을 PAC에서 DIRECT로 제외합니다. Block이면 Hardening 모드 — 에지 접근 불가이므로 Health check의 에지 도달성을 먼저 풉니다. WSL 2 연결은 .wslconfig의 dnsTunneling=false로 우회합니다
   - 해설: 알려진 제한을 표와 대조해 원인을 하나씩 소거합니다
   - 다음 → 9
8. [처리] Advanced log collection — 재현하는 동안 상세 로그 기록
   - 주체: 관리자
   - 위치: Advanced diagnostics › Advanced log collection 탭 › Start recording → 문제 재현 → Stop recording (로그 폴더 C:\Program Files\Global Secure Access Client\Logs) · macOS는 Settings › Troubleshooting 탭의 Export Logs(Enable Verbose Logging 켠 뒤)
   - 데이터: 클라이언트·OS·네트워크 로그가 담긴 ZIP과 ETL 파일 2개. 포함 파일: ForwardingProfile.json · ClientChecker.log · dsregcmd.txt · DeviceInformation.log · NetworkInformation.log · NetworkTrace.pcap(터널 내부 트래픽 포함) · DNSClient.etl · wfplog.cab 등. ETL은 순환 로그이므로 남겨 두는 것이 좋습니다
   - 해설: 증상이 재현될 때까지 기록해 한 번에 근거를 모읍니다
9. [끝] 원인 확정 — 수정 결과 확인 또는 ZIP을 분석·지원팀에 전달
   - 주체: 관리자
   - 위치: Advanced diagnostics › 메뉴 막대 오른쪽 폴더 아이콘(다른 기기에서 ZIP 로드)
   - 데이터: 로드하면 테넌트 ID · 기기 ID · 클라이언트 버전 · Health check · 포워딩 프로필 규칙이 수집 당시 상태로 표시됩니다. 수정했다면 Traffic 탭에서 Action이 의도대로 바뀌었는지 다시 확인합니다
   - 해설: 사용자 기기에서 모은 ZIP을 관리자 기기에서 열어 분석하거나 Microsoft 지원팀에 전달할 수 있습니다
- 시나리오: FQDN 규칙 ▸ 의도대로 :: FQDN 규칙이 의도대로 잡혀 클라이언트는 정상임
- 시나리오: FQDN 규칙 ▸ 의도와 다름 :: DNS·우회·프록시 등 원인을 교정함
- 시나리오: FQDN 규칙 ▸ 원인 불명 :: 상세 로그 수집으로 근거를 모아 분석함
- 시나리오: IP 규칙 ▸ 의도대로 :: IP 규칙이 의도대로 잡혀 클라이언트는 정상임
- 시나리오: IP 규칙 ▸ 의도와 다름 :: 우회·IPv6·프록시 등 원인을 교정함
- 시나리오: IP 규칙 ▸ 원인 불명 :: 상세 로그 수집으로 근거를 모아 분석함

> 교육 포인트: 획득 추적의 세 도구는 Forwarding profile(규칙) → Hostname acquisition(FQDN 획득) → Traffic(연결 단위 결과)입니다. 규칙·획득·결과 세 층을 순서대로 보면 어디서 끊기는지 갈립니다.
>
> 주의: Hostname acquisition과 Traffic 탭은 실시간 수집 도구이며 Start collecting을 눌러야 기록됩니다. 로그 ZIP에는 기기·네트워크 정보와 패킷 캡처가 들어 있으므로 전달 범위를 정하고 보관합니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/troubleshoot-global-secure-access-client-advanced-diagnostics
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/troubleshoot-app-access
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/reference-current-known-limitations
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-install-macos-client
