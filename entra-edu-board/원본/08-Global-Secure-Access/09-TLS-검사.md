## L2 · TLS 검사 — 암호화 트래픽 복호화 · 인증서 신뢰

- 설정(Control Plane): TLS 검사 설정(TLS inspection settings)의 TLS 종료용 CA 인증서(고객 CA 서명 BYOC 또는 Microsoft 관리형) | TLS 검사 정책(Default action · 우회/검사 규칙) → 보안 프로필(기준선 또는 조건부 액세스 세션 제어) 연결 | 기기의 신뢰할 수 있는 루트 인증 기관 저장소에 루트 CA 배포(Intune 등)
- 강제(Enforcement): Global Secure Access 클라이언트 (인터넷 트래픽 획득) | Microsoft SSE 에지 (TLS 종료 → 복호화 요청에 URL 필터링·위협 인텔리전스·콘텐츠 정책 평가 → 재암호화 후 전달)
- 증적(Evidence): GSA 트래픽 로그 (모니터링 › 트래픽 로그) | KQL: NetworkAccessTraffic — TlsAction · TlsStatus · TlsPolicyId · TlsPolicyName · TlsRuleId · TlsRuleName · PolicyType · Action
- 메뉴(Admin Center): Global Secure Access > 보안 > TLS 검사 정책(TLS inspection policies) · TLS 검사 설정 탭(TLS inspection settings) · 보안 > 보안 프로필 · 설정 > 세션 관리 > Custom Block Page · 모니터링 > 트래픽 로그
- 라이선스(License): TLS 검사는 Microsoft Entra Internet Access 기능이며 문서의 전제 조건은 Internet Access 체험(trial) 라이선스와 Global Secure Access Administrator 역할입니다. Microsoft 관리형 인증서는 미리 보기(preview)입니다. [확인 필요: Entra Suite 포함 여부 · 고객 인증서(BYOC) 방식의 GA 여부(문서에 미리 보기 표시 없음, Graph API는 /beta) · 최신 SKU 구성]

### L3 · 0 · 기능 상태 전이 — 암호문 그대로 통과 → 인증서·정책 구성 → 에지에서 복호화·검사

#### L4 · ⓪ 비활성 — 암호화된 HTTPS는 도메인 이름만 보이고 안쪽은 안 보인다

1. [시작] 사용자가 HTTPS 사이트에 접속 — Global Secure Access 클라이언트가 인터넷 트래픽을 에지로 보냄
   - 주체: 사용자
   - 위치: 사용자 기기 브라우저 → GSA 클라이언트 → Microsoft SSE 에지
   - 데이터: 목적지 FQDN · TLS 핸드셰이크 · 443 포트(플랫폼은 HTTP/S 표준 포트 80·443을 가정)
   - 해설: 인터넷 프로필을 켜 두었어도 TLS 검사 정책이 없으면 에지는 암호문을 그대로 전달합니다
2. [처리] TLS 검사가 구성되지 않음 — 인증서·정책 없음
   - 주체: SSE 에지
   - 위치: Global Secure Access › 보안(Secure) › TLS 검사 정책(TLS inspection policies)에 정책 없음 · TLS 검사 설정(TLS inspection settings) 탭에 활성 인증서 없음
   - 데이터: 에지가 볼 수 있는 것은 목적지 IP와 서버 이름 표시(SNI, 핸드셰이크의 FQDN)뿐입니다. 웹 트래픽의 95% 이상이 HTTPS/TLS로 암호화돼 있습니다
   - 해설: 암호화 안쪽의 경로·요청·응답·파일은 보안 도구에 보이지 않는 상태입니다
3. [판단] 걸어 둔 규칙이 도메인 단위인가 URL 경로·콘텐츠 단위인가?
   - 주체: 관리자
   - 위치: Global Secure Access › 보안 › 웹 콘텐츠 필터링 정책(Web content filtering policies) · 콘텐츠 정책
   - 데이터: FQDN·웹 범주 규칙은 SNI로 평가 가능 / 전체·부분 URL 규칙, HTTP 메서드 규칙, 파일·프롬프트 같은 콘텐츠 기반 컨트롤은 TLS 검사가 필요
   - 해설: 같은 정책 화면에서도 규칙 종류에 따라 TLS 검사 의존 여부가 갈립니다
   - FQDN·범주 규칙 → 4
   - URL 경로·콘텐츠 규칙 → 5
4. [끝] 도메인 단위로만 통제됨 — 사이트 전체를 막거나 허용하는 수준
   - 주체: SSE 에지
   - 위치: 보안 프로필 › 웹 콘텐츠 필터링 정책 (FQDN · 웹 범주)
   - 데이터: 예: www.bing.com은 보이지만 www.bing.com/images는 보이지 않으므로 사이트 일부만 막는 규칙은 만들 수 없습니다
   - 해설: 같은 도메인 안의 위험한 경로와 정상 경로를 구분하지 못합니다
5. [처리] URL 경로·콘텐츠 규칙이 평가되지 않음 — 규칙이 있어도 동작하지 못함
   - 주체: SSE 에지
   - 데이터: HTTP 메서드 필터링은 TLS 검사가 없으면 메서드 헤더가 보이지 않아 SNI 기반 웹 콘텐츠 필터링 규칙만 적용됩니다. 위협 인텔리전스의 URL 지표도 HTTPS 트래픽에서는 TLS 검사가 있어야 평가됩니다
   - 해설: 관리자는 규칙을 만들었다고 믿지만 HTTPS 트래픽에는 걸리지 않을 수 있습니다
6. [끝] 파일 업·다운로드와 본문이 검사되지 않음 — 위험이 그대로 남음
   - 주체: 로그
   - 위치: Global Secure Access › 모니터링(Monitor) › 트래픽 로그(Traffic logs)
   - 데이터: NetworkAccessTraffic은 FQDN 수준 판정만 남습니다. 악성 파일·데이터 유출은 암호화 안쪽에 숨을 수 있고, 사용자 친화적 차단 안내(Custom Block Page)는 TLS 검사가 켜져 있을 때 제공되는 기능으로 문서에 소개됩니다 [확인 필요: TLS 정책이 없을 때 TlsAction 열의 값 · 차단 안내 표시 조건]
   - 해설: 암호화가 정상 트래픽뿐 아니라 악성코드와 유출 시도도 숨겨 줍니다
- 시나리오: FQDN·범주 규칙 :: SNI 기반 도메인 규칙만 평가됨
- 시나리오: URL 경로·콘텐츠 규칙 :: 경로·본문 규칙이 HTTPS에서 동작 못 함

> 교육 포인트: TLS 검사는 에지가 사용자와 목적지 사이에서 TLS 연결을 둘로 나눠(클라이언트↔에지, 에지↔서버) 중간에서 복호화하는 기능입니다. 켜기 전에는 도메인(SNI) 이상을 볼 수 없고, URL 필터링·콘텐츠 정책·프롬프트 정책·파트너 보안 솔루션 연동이 모두 이 기능에 기대고 있습니다.
>
> 주의: 인터넷 프로필·웹 콘텐츠 필터링·AI 범주 차단·Custom Bypass의 설정 자체는 「Entra Internet Access」 L2에서 다룹니다. 여기서는 그 위에 얹는 TLS 복호화 계층만 설명합니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/concept-transport-layer-security
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/tutorial-internet-access-tls-inspection
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/reference-current-known-limitations
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/faq-transport-layer-security

#### L4 · ① 구성 — 인증서를 만들고, 루트를 배포하고, 정책을 보안 프로필에 연결한다

1. [시작] 관리자가 Entra 관리 센터에 로그인 — 역할 · 라이선스 · 사용자 고지 확인
   - 주체: 관리자
   - 위치: entra.microsoft.com — Global Secure Access Administrator 역할 · Global Secure Access 사전 요건(클라이언트 설치, Secure DNS 끔 등)
   - 데이터: Internet Access 라이선스(문서 전제는 trial 라이선스) · 테스트용 Microsoft Entra 조인 또는 하이브리드 조인 Windows 기기. 운영 환경에 켜기 전에 사용자에게 TLS 처리 방식을 알리고(이용 약관 등) 동의·규정 준수를 정리해 두는 것이 권장됩니다
   - 해설: 사용자 트래픽을 복호화하는 기능이므로 기술 설정보다 먼저 고지와 범위를 정합니다
2. [판단] TLS 종료용 CA를 어떻게 마련할 것인가?
   - 주체: 관리자
   - 위치: Global Secure Access › 보안 › TLS 검사 정책 › TLS 검사 설정(TLS inspection settings) 탭 › + Create certificate
   - 데이터: 고객 CA로 서명(BYOC) 또는 Microsoft 관리형(Microsoft-managed, 미리 보기). 조직이 반드시 자체 PKI를 써야 하면 BYOC를 씁니다
   - 해설: 서명 권한을 조직이 쥘지, Microsoft가 테넌트 전용 루트 CA를 운영하게 할지를 이 단계에서 정합니다
   - 고객 CA(BYOC) → 3
   - Microsoft 관리형 → 4
3. [처리] CSR 생성 → 조직 CA로 서명 → 서명 인증서 업로드 — BYOC 인증서
   - 주체: 관리자
   - 위치: TLS 검사 설정 탭 › + Create certificate(Certificate name · Common name · Organizational Unit) › Create CSR › 조직 CA로 서명 › + Upload certificate(certificate.pem · chain.pem) › Upload signed certificate · Graph: New-MgBetaNetworkAccessTlExternalCertificateAuthorityCertificate (NetworkAccess.ReadWrite.All)
   - 데이터: 인증서 이름은 고유 · 공백 없음 · 12자 이하이며 삭제한 이름도 재사용할 수 없습니다. 서명 인증서는 6개월 이상 유효해야 합니다. 업로드 직후 상태는 Disabled입니다
   - 해설: 자세한 CSR 서명 요건은 A 탭에서 다룹니다. 여기서는 BYOC가 CSR 생성 → 서명 → 업로드 세 단계라는 것만 짚습니다
   - 다음 → 5
4. [처리] 관리형 인증서 생성 — 입력값 없이 Microsoft가 테넌트 전용 루트 CA를 구성
   - 주체: 관리자
   - 위치: TLS 검사 설정 탭 › Create certificate › Microsoft-managed › Create certificate 창에서 인증서 상세·수명 주기 확인 › Create
   - 데이터: 목록에 Type = Managed · Status = Disabled로 나타납니다. 루트 CA 기본 유효 기간은 10년이며 더 짧게 하려면 API로 구성합니다. 개인 키는 Microsoft 보안 키 인프라에서 보호되며 노출되지 않습니다
   - 해설: 자체 CA를 운영하지 않아도 되지만 이 방식은 미리 보기이므로 운영 적용 전에 약관과 변경 가능성을 확인합니다
5. [처리] 루트 CA(·중간 CA)를 기기의 신뢰할 수 있는 루트 인증 기관 저장소에 배포 — 정책보다 먼저
   - 주체: 관리자
   - 위치: Microsoft Intune 관리 센터 › Devices › Manage devices › Configuration › Create › Platform › Trusted certificate 프로필(.cer, Computer certificate store - Root) · 관리형 인증서는 TLS 검사 설정 탭 › … › Download root certificate
   - 데이터: 배포 파일은 공개 인증서(.cer)이며 개인 키(.pfx)는 내보내지 않습니다. 정책을 먼저 적용하면 사용자에게 인증서 오류가 생깁니다
   - 해설: 클라이언트가 루트 CA를 믿지 않으면 에지가 만든 인증서를 모두 거부하므로 신뢰 배포가 검사 시작의 선행 조건입니다
6. [처리] 인증서를 Enabled로 전환 — Enrolling에서 Active가 될 때까지 대기
   - 주체: 관리자
   - 위치: TLS 검사 설정 탭 › 인증서 행 Actions(…) › Enable
   - 데이터: 활성 인증서는 한 번에 하나뿐입니다. BYOC는 Enrolling에서 Active로 바뀌는 데 몇 분이 걸릴 수 있습니다
   - 해설: Active가 아니면 에지는 leaf 인증서를 만들 CA가 없어 TLS 종료를 시작할 수 없습니다
7. [처리] TLS 검사 정책 생성 — Default action과 규칙 정의
   - 주체: 관리자
   - 위치: Global Secure Access › 보안 › TLS 검사 정책 › Create policy › Basics(이름 · 설명 · Default action) › Next › Add rule › Save › Next › Submit · Graph: /beta/networkAccess/tlsInspectionPolicies · …/policyRules
   - 데이터: Default action은 규칙에 일치하는 것이 없을 때의 동작이며 기본값은 Inspect입니다. 규칙은 FQDN 또는 Web category로 지정합니다. 정책을 만들면 검사에 맞지 않는 목적지를 제외하는 시스템 규칙과, 교육·금융·정부·건강 및 의학 범주를 우회하는 편집 가능한 권장 우회 규칙이 자동 생성됩니다
   - 해설: 기본이 Inspect이므로 우회할 대상을 규칙으로 따로 적는 것이 운영의 중심입니다
8. [처리] 정책을 보안 프로필에 연결 — 기준선(전체) 또는 별도 프로필(대상 사용자)
   - 주체: 관리자
   - 위치: Global Secure Access › 보안 › 보안 프로필(Security profiles) › Baseline profile 탭 › Edit profile › Link policies › + Link a policy › Existing TLS inspection policy(우선순위 지정) › Add / 또는 새 프로필 Create profile › Link a policy
   - 데이터: 기준선 프로필은 마지막에 평가되며 모든 사용자 트래픽에 적용됩니다. 특정 사용자만 대상으로 점진 적용하려면 별도 보안 프로필을 만듭니다
   - 해설: 처음에는 일부 사용자에게 먼저 적용해 영향을 본 뒤 기준선으로 넓힙니다
9. [처리] 조건부 액세스로 보안 프로필 할당 — 별도 프로필 방식일 때
   - 주체: 관리자
   - 위치: Entra ID › 조건부 액세스(Conditional Access) › Create new policy › Target resources › All internet resources with Global Secure Access › Session › Use Global Secure Access security profile › 해당 프로필 선택 › Enable policy = On
   - 데이터: 새 보안 프로필이 적용되기까지 최대 1시간이 걸릴 수 있습니다. 이미 할당된 프로필에 정책만 추가한 경우는 수 분 안에 반영됩니다
   - 해설: 이 연결이 있어야 사용자 단위로 TLS 검사 범위를 조절할 수 있습니다
10. [끝] 클라이언트 측 전제를 맞추고 인증서 체인을 확인 — 검사 시작
    - 주체: 디바이스
    - 위치: 클라이언트 기기: Secure DNS · 브라우저 내장 DNS 끔 · 아웃바운드 UDP 443 차단(New-NetFirewallRule -DisplayName "Block QUIC" -Direction Outbound -Action Block -Protocol UDP -RemotePort 443) · Internet Access Traffic Forwarding 켬 · 브라우저에서 인증서 확인
    - 데이터: 비Microsoft 사이트(예: www.google.com)에서 인증서 공통 이름이 Microsoft Global Secure Access Intermediate이면 검사가 동작하는 것입니다. 대부분의 Microsoft 트래픽은 Internet Access 터널을 거치지 않으므로 검사 확인용으로 맞지 않습니다
    - 해설: QUIC은 지원되지 않으므로 UDP 443을 막아 TCP로 되돌려야 사용자가 느린 재시도를 겪지 않습니다
- 시나리오: 고객 CA(BYOC) :: 자체 PKI가 서명한 인증서로 검사 구성
- 시나리오: Microsoft 관리형 :: 테넌트 전용 루트 CA를 Microsoft가 운영

> 교육 포인트: 구성 순서는 인증서 생성 → 루트 배포 → 인증서 Enabled → 정책 → 보안 프로필 → 조건부 액세스입니다. 루트 배포를 정책 연결보다 먼저 끝내야 사용자 화면에 인증서 오류가 생기지 않습니다.
>
> 주의: Azure Key Vault에 보관한 인증서를 연결하는 방식은 이 기능의 공식 문서에서 확인하지 못했습니다. 문서의 BYOC 절차는 CSR 서명 후 PEM 업로드뿐입니다 [확인 필요: Key Vault 연동 지원 여부]. 폐기 절차는 C 탭을 참고하세요.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-transport-layer-security
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-transport-layer-security-settings
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-transport-layer-security-settings-managed-certificate
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/tutorial-internet-access-tls-inspection

#### L4 · ② 활성 — 요청이 에지에서 복호화돼 검사되고 다시 암호화돼 나간다

1. [시작] 사용자가 HTTPS 사이트에 접속 — 예: 외부 파일 공유 사이트 · 비Microsoft 웹 서비스
   - 주체: 사용자
   - 위치: 브라우저 → GSA 클라이언트
   - 데이터: 목적지 FQDN · TLS ClientHello(SNI)
   - 해설: 클라이언트는 평소와 같이 HTTPS를 시작하고, 사용자는 검사가 끼어드는 것을 알지 못합니다
2. [처리] 클라이언트가 인터넷 트래픽을 획득해 에지로 전달
   - 주체: GSA 클라이언트
   - 위치: GSA 클라이언트 터널 → Microsoft SSE 에지 (Internet Access traffic profile)
   - 데이터: Microsoft 트래픽 프로필로 획득되는 트래픽은 인터넷 프로필로 획득되지 않으며, 대부분의 Microsoft 애플리케이션은 TLS 검사 대상이 아닙니다. QUIC(UDP)은 지원되지 않아 TCP로 되돌아옵니다
   - 해설: 에지로 들어오지 않은 트래픽은 TLS 검사 규칙을 평가받지 않습니다
3. [처리] 사용자의 보안 프로필을 결정 — 조건부 액세스 프로필 먼저, 기준선 프로필 마지막
   - 주체: SSE 에지
   - 위치: 조건부 액세스 세션 제어(Use Global Secure Access security profile) → 보안 프로필 → 연결된 TLS 검사 정책
   - 데이터: 기준선 프로필은 우선순위 65,000으로 마지막에 평가됩니다. 정책 우선순위는 숫자가 낮을수록 먼저 평가됩니다
   - 해설: 이 사용자에게 어느 TLS 검사 정책이 적용되는지가 여기서 정해집니다
4. [판단] 목적지가 TLS 우회 규칙에 일치하는가?
   - 주체: SSE 에지
   - 위치: TLS 검사 정책 규칙(우선순위 오름차순, 첫 일치 규칙의 Action) · 시스템 우회 규칙 · 권장 우회 규칙 · 사용자 정의 우회 규칙
   - 데이터: 목적지 FQDN · 웹 범주. 일치하는 규칙이 없으면 정책의 Default action(기본 Inspect)을 씁니다
   - 해설: 인증서 고정(pinning) 앱, 상호 TLS, 금융·의료 같은 민감 범주는 우회 규칙에 걸려 복호화되지 않습니다
   - 우회 규칙 일치 → 5
   - 검사 대상 → 6
5. [처리] 복호화 없이 그대로 전달 — TlsAction이 Bypassed로 남음
   - 주체: SSE 에지
   - 데이터: 암호문 그대로 목적지에 연결되며 FQDN·범주 수준의 판정만 가능합니다. URL 경로·콘텐츠 규칙은 이 트래픽에 적용되지 않습니다
   - 해설: 우회는 호환성과 개인정보를 지키는 대신 그만큼 검사를 포기한다는 뜻입니다
   - 다음 → 9
6. [처리] 에지가 TLS를 종료 — 클라이언트↔에지, 에지↔서버 두 연결로 분리
   - 주체: SSE 에지
   - 위치: GSA 에지 TLS 종료(2단 인증서 구조: 고객 서명 중간 CA → 단기 중간 CA → 사이트별 leaf)
   - 데이터: 에지가 목적지 FQDN(SNI)에 맞는 leaf 인증서를 즉석에서 만들어 클라이언트에 제시하고, 클라이언트는 기기에 배포된 루트 CA로 체인을 검증합니다. TLS 1.2·1.3을 지원하며 양쪽에서 가장 높은 공통 버전을 고릅니다
   - 해설: 클라이언트가 루트 CA를 믿고 있어야 이 핸드셰이크가 오류 없이 끝납니다
7. [판단] 복호화된 요청이 보안 컨트롤에 걸리는가?
   - 주체: SSE 에지
   - 위치: 보안 프로필의 웹 콘텐츠 필터링(전체 URL 포함) · 위협 인텔리전스 · 파일 검사/콘텐츠 정책
   - 데이터: 전체 URL 경로 · 요청과 응답 콘텐츠 · 파일 업·다운로드 · 페이지 콘텐츠. 우선순위가 낮은 번호부터 평가되고 일치하는 차단이 있으면 멈춥니다
   - 해설: 복호화 덕분에 FQDN만으로는 불가능했던 경로·콘텐츠 단위 판정이 이 단계에서 이뤄집니다
   - 차단 규칙 일치 → [차단] 보안 컨트롤이 요청을 차단 — Custom Block Page 표시, Action = Denied
   - 통과 → 8
8. [처리] 재암호화해 원래 목적지로 전달
   - 주체: SSE 에지
   - 위치: 에지 → 목적지 서버 (별도 TLS 연결)
   - 데이터: HTTP/2 협상은 지원되지 않아 대부분 사이트는 HTTP/1.1로 되돌아갑니다. 목적지 인증서 검증 시 AIA·OCSP 링크는 따라가지 않습니다
   - 해설: 서버는 정상 TLS 연결을 받고 사용자는 응답을 평소처럼 받습니다
9. [끝] 판정 결과가 트래픽 로그에 남음
   - 주체: 로그
   - 위치: Global Secure Access › 모니터링 › 트래픽 로그 · KQL: NetworkAccessTraffic
   - 데이터: TlsAction(Bypassed 또는 Intercepted) · TlsStatus(Success 또는 Failure) · TlsPolicyId · TlsPolicyName · TlsRuleId · TlsRuleName · Action(Allowed / Denied / Redirect) · PolicyType(webContentFiltering · threatIntelligence · promptProtection · mcpFirewall)
   - 해설: 왜 검사됐거나 우회됐는지는 이 TLS 열로 규칙 단위까지 거슬러 올라갈 수 있습니다
- 시나리오: 우회 규칙 일치 :: 복호화 없이 전달되고 TlsAction이 Bypassed로 기록
- 시나리오: 검사 대상 ▸ 통과 :: 복호화·검사 후 재암호화해 전달
- 시나리오: 검사 대상 ▸ 차단 규칙 일치 :: 복호화 뒤 콘텐츠 규칙에 걸려 차단 페이지 표시

> 교육 포인트: 이 기능의 판정은 두 겹입니다. 먼저 TLS 정책이 검사할지 우회할지를 정하고, 검사로 결정된 트래픽에만 URL 필터링·위협 인텔리전스·콘텐츠 정책 같은 보안 컨트롤이 복호화된 내용을 평가합니다.
>
> 주의: 에지가 보내는 leaf 인증서는 사용자가 브라우저의 인증서 보기에서 확인할 수 있고, 체인 맨 위에 조직의 루트 CA와 인증서 이름이 보입니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/concept-transport-layer-security
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/tutorial-internet-access-tls-inspection
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/tutorial-internet-access-url-filtering
>
> 출처: https://learn.microsoft.com/azure/azure-monitor/reference/tables/networkaccesstraffic

### L3 · A · 인증서 준비와 신뢰 배포

#### L4 · CSR 생성 → 서명 → 업로드 — 고객 CA(BYOC) 인증서 체인 만들기

1. [시작] TLS 검사 설정 탭에서 + Create certificate 선택 — CSR 생성 시작
   - 주체: 관리자
   - 위치: Global Secure Access › 보안 › TLS 검사 정책 › TLS 검사 설정(TLS inspection settings) 탭 › + Create certificate
   - 데이터: Global Secure Access Administrator 역할. 활성 인증서는 한 번에 하나만 쓸 수 있습니다. 미리 보기 때 만든 레거시 설정이 있으면 "Cannot create external certificate, an internal certificate already exists for tenant." 오류가 나며 설정 › 세션 관리 › TLS Inspection 탭에서 Certificate URL을 삭제해야 합니다
   - 해설: 인증서 한 개를 만드는 흐름이 곧 CSR 생성이며 서명은 조직이 합니다
2. [판단] 인증서 이름이 규칙을 지키는가?
   - 주체: 관리자
   - 위치: Create certificate 창 › Certificate name
   - 데이터: 고유해야 하고 공백이 없으며 12자 이하여야 합니다. 삭제한 인증서의 이름도 다시 쓸 수 없습니다. 이름은 브라우저의 인증서 계층에 표시됩니다 (PowerShell 스크립트에서는 영문자·숫자만 12자 이내)
   - 해설: 이름은 나중에 바꿀 수 없으므로 교체 때마다 새 이름을 쓸 규칙을 정해 둡니다
   - 규칙 충족 → 3
   - 규칙 위반 → [차단] CSR 생성 불가 — 고유한 이름으로 다시 입력 [확인 필요: 위반 시 오류 문구]
3. [처리] Common name · Organizational Unit 입력 후 Create CSR — .csr 파일 다운로드
   - 주체: 관리자
   - 위치: Create certificate 창 › Common name(예: Contoso TLS ICA) · Organizational Unit(예: Contoso IT) › Create CSR · Graph: New-MgBetaNetworkAccessTlExternalCertificateAuthorityCertificate -BodyParameter(name · commonName · organizationName)
   - 데이터: .csr 파일이 기본 다운로드 폴더에 저장됩니다. 스크립트 방식에서는 응답의 CertificateSigningRequest 필드와 인증서 Id가 이후 업로드에 쓰입니다
   - 해설: 이 CSR이 조직 CA에서 중간 CA 인증서로 서명돼 돌아오는 것이 다음 단계입니다
4. [처리] 조직 CA로 CSR 서명 — AD CS는 Subordinate CA(SubCA) 템플릿
   - 주체: 관리자
   - 위치: AD CS 웹 등록 또는 certreq -submit -attrib "CertificateTemplate:SubCA" "<경로>\tlsca.csr" "tlsca.cer" · 테스트 전용: openssl x509 -req -in <CSR> -CA rootCAchain.pem -CAkey rootCAchain.key -days 370 -sha256 -extfile openssl.cnf -extensions signedCA_ext
   - 데이터: 서명 알고리즘은 SHA-256 · SHA-384 · SHA-512를 지원합니다. TLS 검사에는 중간 CA가 필요하므로 SubCA 템플릿을 씁니다
   - 해설: OpenSSL 자체 서명 루트는 시험용이며, 운영에서는 전용 CA를 쓰고 루트 개인 키를 보호합니다
5. [판단] 서명된 인증서가 요건을 갖췄는가?
   - 주체: 관리자
   - 위치: 서명 인증서의 확장(Extensions) 검토
   - 데이터: Extended Key Usage에 Server Auth · Basic Extension에 certificate authority(CA)=true, keyCertSign, cRLSign, basicConstraints=critical,CA:TRUE, pathLenConstraint = 1 · .pem 형식 · 서명 인증서의 유효 기간 6개월 이상
   - 해설: 요건이 하나라도 빠지면 에지가 leaf를 발급하거나 클라이언트가 체인을 신뢰하는 데 실패합니다
   - 요건 충족 → 6
   - 요건 미충족 → [차단] 재서명 필요 — 업로드해도 검사가 동작하지 않음 [확인 필요: 업로드 거부 오류 문구]
6. [처리] 체인 파일 준비 — certificate.pem과 chain.pem
   - 주체: 관리자
   - 위치: 로컬 파일 (서명 인증서 .pem · 루트·중간 체인 .pem)
   - 데이터: AD CS는 certreq -retrieve로 받은 p7b에서 체인을 PEM으로 변환합니다. OpenSSL 시험에서는 signedcertificate.pem과 rootCAchain.pem을 씁니다
   - 해설: 서명 인증서와 그 상위 체인을 함께 올려야 에지가 신뢰 경로를 만듭니다
7. [처리] 서명 인증서를 업로드
   - 주체: 관리자
   - 위치: TLS 검사 설정 탭 › + Upload certificate › certificate.pem · chain.pem 지정 › Upload signed certificate · Graph: Update-MgBetaNetworkAccessTlExternalCertificateAuthorityCertificate -ExternalCertificateAuthorityCertificateId <Id> -BodyParameter(certificate · chain)
   - 데이터: 업로드된 인증서는 기본 Disabled 상태입니다
   - 해설: 업로드만으로는 검사가 시작되지 않고 활성화 단계가 따로 있습니다
8. [처리] 인증서를 Enabled로 전환 — Enrolling에서 Active로
   - 주체: 관리자
   - 위치: TLS 검사 설정 탭 › 인증서 행 Actions(…) › Enable
   - 데이터: 상태가 Enrolling에서 Active로 바뀌는 데 몇 분이 걸릴 수 있습니다. 활성 인증서는 하나뿐입니다
   - 해설: Active를 확인한 뒤에 정책을 연결해야 합니다
9. [끝] 2단 인증서 구조가 준비됨 — 고객 서명 중간 CA가 단기 중간 CA와 leaf를 만든다
   - 주체: SSE 에지
   - 위치: 고객 루트 CA → (고객 서명) GSA 중간 CA → 단기 중간 CA → 사이트별 leaf 인증서
   - 데이터: 루트 CA(·중간 CA)는 모든 클라이언트 기기에 배포돼야 합니다. 에지의 중간 CA 키는 HSM이 아닌 소프트웨어로 보호되어 메모리에서 leaf를 만들 때 쓰입니다
   - 해설: 이 체인의 맨 위를 기기가 믿어야 모든 leaf가 신뢰됩니다
- 시나리오: 규칙 충족 ▸ 요건 충족 :: 이름·확장 요건을 지켜 업로드하고 Active로 전환
- 시나리오: 규칙 충족 ▸ 요건 미충족 :: 확장 요건이 빠져 서명을 다시 받아야 함
- 시나리오: 규칙 위반 :: 이름 규칙을 어겨 CSR을 만들 수 없음

> 교육 포인트: 에지는 CSR을 만들고 조직 CA는 그 CSR에 서명해 중간 CA를 줍니다. 조직 입장에서는 TLS 검사 전용 하위 CA를 하나 발급해 주는 것과 같습니다.
>
> 주의: 문서는 TLS 검사용으로 운영 PKI와 분리된 전용 CA를 쓰고 루트 CA 개인 키를 반드시 보호하라고 권고합니다. 키가 유출되면 공격자가 같은 체인으로 위조 인증서를 만들 수 있습니다. 한 CSR 이름은 재사용할 수 없으므로 교체 때마다 새 이름이 필요합니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-transport-layer-security-settings
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/scripts/powershell-active-directory-certificate-service
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/faq-transport-layer-security
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/troubleshoot-transport-layer-security

#### L4 · 루트 CA를 기기가 믿게 만든다 — Intune 배포와 자체 저장소 앱 보정

1. [시작] 배포할 공개 인증서를 확보 — 루트 CA(·중간 CA) .cer
   - 주체: 관리자
   - 위치: BYOC: 발급 CA에서 .cer로 내보내기(개인 키 제외) · 관리형: TLS 검사 설정 탭 › 인증서 행 … › Download root certificate
   - 데이터: DER 인코딩 .cer만 사용하며 .pfx(개인 키)는 내보내지 않습니다. 관리형 인증서의 다운로드 파일에는 공개 루트 CA 인증서만 있습니다
   - 해설: 에지가 서명에 쓰는 개인 키는 기기에 배포하지 않습니다
2. [처리] Intune에서 Trusted certificate 프로필 생성
   - 주체: 관리자
   - 위치: Microsoft Intune 관리 센터 › Devices › Manage devices › Configuration › Create › Platform 선택 › Profile = Trusted certificate(또는 Templates › Trusted certificate) › Configuration settings에서 .cer 지정
   - 데이터: Destination store는 Computer certificate store - Root(필요하면 Intermediate). 플랫폼마다 별도 프로필이 필요합니다. Windows 프로필은 화면에 Windows 8.1 이상으로 표시되지만 Windows 10·11에서 동작합니다
   - 해설: 중간 CA로 서명한 경우 루트뿐 아니라 중간 CA도 같은 방식으로 배포합니다
3. [처리] 배포 대상 할당 — TLS 검사 정책을 받는 모든 기기·사용자에 정책보다 먼저
   - 주체: 관리자
   - 위치: Intune 프로필 › Assignments › 포함할 그룹 · Review + create
   - 데이터: 루트 CA를 배포하기 전에 TLS 검사 정책을 적용하면 사용자가 인증서 오류를 겪습니다. 시험 기기 → 파일럿 그룹 → 전체 순서가 안전합니다
   - 해설: 신뢰 배포 범위가 보안 프로필의 적용 범위보다 좁지 않아야 합니다
4. [처리] 시험 기기에서 신뢰 저장소 확인
   - 주체: 디바이스
   - 위치: Windows 11: Manage user certificates › Trusted Root Certification Authorities › Certificates · 브라우저의 인증서 보기
   - 데이터: 루트 CA가 Trusted Root Certification Authorities에 있어야 하며 필요하면 rootCAchain.pem을 마법사로 직접 가져와 확인합니다
   - 해설: 정책을 켜기 전에 한 대로라도 체인이 믿어지는지 확인합니다
5. [판단] 접속 앱이 OS 신뢰 저장소를 쓰는가?
   - 주체: 디바이스
   - 위치: 앱의 TLS 라이브러리 설정 (브라우저 · Git · Python · Node.js · Docker)
   - 데이터: 브라우저는 보통 OS 저장소를 쓰지만 Git · Python · Node.js · Docker 컨테이너는 자체 인증서 저장소를 쓰는 경우가 있습니다
   - 해설: Intune 배포만으로는 개발 도구가 에지의 leaf 인증서를 믿지 못할 수 있습니다
   - OS 저장소 사용 → 6
   - 자체 CA 번들 사용 → 7
6. [끝] 추가 작업 없이 신뢰됨 — 브라우저·OS 저장소를 쓰는 앱
   - 주체: 디바이스
   - 위치: 브라우저 인증서 뷰어 — 인증서 공통 이름 Microsoft Global Secure Access Intermediate
   - 데이터: 비Microsoft 사이트에서 확인합니다
   - 해설: 대부분의 업무용 브라우저 사용자는 여기서 끝납니다
7. [처리] 자체 저장소 앱에 루트 CA를 보정 — 도구별 방법
   - 주체: 디바이스
   - 위치: Git: git config --global http.sslbackend schannel 또는 http.sslcainfo 번들에 추가 · Python: pip-system-certs 설치 또는 certifi 번들에 추가 · Node.js: --use-system-ca 또는 NODE_USE_SYSTEM_CA=1(setx) · Docker: Dockerfile에 COPY 후 update-ca-certificates(Alpine은 apk add ca-certificates)
   - 데이터: Azure CLI는 자체 Python을 쓰므로 해당 python.exe로 pip-system-certs를 설치합니다. 환경 변수 변경 뒤에는 터미널을 다시 엽니다
   - 해설: 증상이 certificate problem: unable to get the local issuer certificate이면 이 보정이 필요합니다
8. [끝] 개발 도구도 신뢰됨 — 그래도 실패하면 C 탭의 오류 분리로 이동
   - 주체: 디바이스
   - 위치: 각 도구에서 HTTPS 호출 재시도
   - 데이터: 보정은 도구마다 개별 적용이므로 배포 도구(스크립트·이미지)에 포함해 두어야 재현됩니다
   - 해설: 이미지·스크립트에 루트 CA 등록을 넣어 두면 새 기기에서도 같은 오류가 반복되지 않습니다
- 시나리오: OS 저장소 사용 :: Intune 배포만으로 신뢰가 끝남
- 시나리오: 자체 CA 번들 사용 :: 개발 도구별로 루트 CA를 추가 등록

> 교육 포인트: TLS 검사에서 "신뢰"는 인증서를 올리는 일이 아니라 모든 클라이언트 기기와 앱이 루트 CA를 믿게 만드는 일입니다. 기기를 관리할 수 없으면(비관리 기기 · 모바일) 이 신뢰가 없어 오류가 납니다.
>
> 주의: 신뢰 배포 전에 정책을 먼저 연결하지 마세요. 중간 CA를 써서 서명했다면 중간 CA도 클라이언트 저장소에 있어야 합니다. 비Windows 기기의 루트 CA 배포 절차는 이 L2의 문서 범위 밖입니다 [확인 필요: macOS · Linux · 모바일 배포 절차].
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-transport-layer-security
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-transport-layer-security-settings-managed-certificate
>
> 출처: https://learn.microsoft.com/intune/intune-service/protect/certificates-trusted-root
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/troubleshoot-transport-layer-security

### L3 · B · 검사 판정(검사 vs 제외)과 에지 처리

#### L4 · 검사할 것인가 우회할 것인가 — 규칙 우선순위 · 시스템 규칙 · Default action

1. [시작] 에지가 목적지를 식별 — 복호화 전에는 SNI로 판단
   - 주체: SSE 에지
   - 위치: 클라이언트 ClientHello의 SNI
   - 데이터: TLS 1.3의 Encrypted Client Hello(ECH)는 SNI가 암호화돼 에지가 해당 leaf 인증서를 만들 수 없으므로 지원되지 않습니다
   - 해설: 검사 판정은 목적지 FQDN과 웹 범주로 하고, 이름이 보이지 않으면 검사를 할 수 없습니다
2. [처리] 정책의 규칙 집합을 구성 — 자동 규칙 둘 + 사용자 규칙
   - 주체: SSE 에지
   - 위치: Global Secure Access › 보안 › TLS 검사 정책 › 정책 선택 › Edit › Rules
   - 데이터: ① 시스템 규칙(인증서 고정·상호 TLS 등 검사와 맞지 않는 목적지를 자동 제외, 정기 갱신) ② 권장 우회 규칙(Education · Finance · Government · Health & Medicine 범주, 편집 가능) ③ 관리자가 만든 FQDN 또는 Web category 규칙. TLS 검사 한도는 정책 100 · 규칙 1,000 · 목적지 8,000
   - 해설: 사용자가 모르는 사이에 어떤 사이트가 우회되는지는 이 목록을 열어 봐야 알 수 있습니다
3. [판단] 어느 규칙에 일치하는가?
   - 주체: SSE 에지
   - 위치: Graph: tlsInspectionRule — priority(오름차순) · action(bypass / inspect) · matchingConditions.destinations(FQDN · 웹 범주) · settings.status(enabled / disabled / reportOnly)
   - 데이터: 규칙은 우선순위 순으로 평가되고 첫 번째 일치 규칙의 Action을 씁니다. 일치하는 규칙이 없으면 정책의 Default action을 씁니다. 시스템 규칙과 권장 규칙 사이의 평가 순서는 문서에 명시돼 있지 않습니다 [확인 필요: 자동 규칙의 우선순위 값]
   - 해설: 같은 목적지에 우회 규칙과 검사 규칙이 겹치면 우선순위가 낮은 숫자의 규칙이 이깁니다
   - 우회 규칙 일치 → 6
   - 검사 규칙 일치 → 5
   - 일치 규칙 없음 → 4
4. [판단] 정책의 Default action은 무엇인가?
   - 주체: SSE 에지
   - 위치: 정책 Basics › Default action · Graph: tlsInspectionPolicySettings
   - 데이터: 기본값은 Inspect입니다. Bypass로 바꾸면 규칙에 명시한 대상만 검사합니다
   - 해설: 기본 Inspect는 "모두 검사, 예외만 우회"이고 기본 Bypass는 "모두 우회, 대상만 검사"입니다
   - 기본 Inspect → 5
   - 기본 Bypass → 6
5. [처리] 검사 — TLS를 종료하고 복호화 내용에 보안 컨트롤을 적용
   - 주체: SSE 에지
   - 위치: 에지 TLS 종료 → 웹 콘텐츠 필터링 · 위협 인텔리전스 · 콘텐츠 정책
   - 데이터: TLS 1.2 · 1.3. HTTP/2를 협상하지 못하므로 HTTP/2 전용 사이트는 열리지 않습니다 → 해당 사이트는 사용자 지정 우회 규칙으로 보냅니다. TLS 1.0·1.1을 쓰는 레거시 앱도 우회를 권장합니다
   - 해설: 호환성 문제가 있는 대상은 검사하지 않고 우회하는 것이 장애를 막는 방법입니다
   - 다음 → 7
6. [처리] 우회 — 암호문 그대로 목적지로 전달
   - 주체: SSE 에지
   - 데이터: 복호화하지 않으므로 SNI 기반 FQDN·범주 판정만 적용됩니다. 인증서 고정 앱은 모바일 앱 포함 도메인 기반 또는 범주 기반 우회 규칙으로 보냅니다
   - 해설: 우회 대상은 정기적으로 검토해 민감 사이트가 비는 곳 없이 지켜지는지 확인합니다
7. [끝] 판정과 근거 규칙이 로그에 남음
   - 주체: 로그
   - 위치: Global Secure Access › 모니터링 › 트래픽 로그 · KQL: NetworkAccessTraffic
   - 데이터: TlsAction(Bypassed 또는 Intercepted) · TlsPolicyName · TlsRuleName · TlsRuleId. 규칙 이름은 "왜 이 사이트가 검사되지 않았는가"의 증거입니다
   - 해설: 규칙에 일치하지 않은 경우도 정책 ID로 어느 정책이 평가됐는지 남습니다
- 시나리오: 우회 규칙 일치 :: 우선순위가 먼저인 우회 규칙으로 복호화 건너뜀
- 시나리오: 검사 규칙 일치 :: 검사 규칙이 일치해 TLS 종료 후 복호화
- 시나리오: 일치 규칙 없음 ▸ 기본 Inspect :: 규칙이 없어 기본 동작으로 복호화
- 시나리오: 일치 규칙 없음 ▸ 기본 Bypass :: 규칙이 없어 기본 동작으로 우회

> 교육 포인트: 규칙은 "무엇을 우회할지"를 적는 목록이라고 생각하면 쉽습니다. 기본이 Inspect이므로 시스템 규칙과 권장 규칙이 검사 부작용을 막아 주고, 그 밖의 예외는 관리자가 FQDN이나 웹 범주로 추가합니다.
>
> 주의: 운영 목록은 정기적으로 점검하세요. 시스템 우회 목록에는 Microsoft Graph · Microsoft Login Services · Microsoft Office 365 · Windows Update · Zoom · Webex · Dropbox · DocuSign 같은 대상이 들어 있고 계속 갱신됩니다. 규칙 settings.status의 reportOnly가 포털에서 어떻게 노출되는지는 확인하지 못했습니다 [확인 필요].
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-transport-layer-security
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/faq-transport-layer-security
>
> 출처: https://learn.microsoft.com/graph/api/resources/networkaccess-tlsinspectionrule?view=graph-rest-beta
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/concept-transport-layer-security

#### L4 · 복호화한 뒤의 콘텐츠 컨트롤 — URL 필터링 · 위협 인텔리전스 · 차단 안내

1. [시작] 검사 대상으로 결정된 요청을 에지가 복호화
   - 주체: SSE 에지
   - 위치: 에지 TLS 종료 지점
   - 데이터: 복호화되면 전체 URL 경로(예: /images · /downloads/malware.exe) · 요청과 응답 콘텐츠 · 파일 업·다운로드 · 페이지 콘텐츠가 보입니다
   - 해설: 이 단계부터 FQDN으로는 구분할 수 없던 요청이 경로 단위로 구분됩니다
2. [처리] 보안 프로필의 정책을 우선순위 순으로 평가 — 사용자 프로필 먼저, 기준선 마지막
   - 주체: SSE 에지
   - 위치: 보안 프로필 › Link policies(정책별 우선순위 · 상태) · 기준선 프로필 우선순위 65,000
   - 데이터: 낮은 숫자부터 평가합니다. 예: 사용자 프로필의 "Allow Bing Maps"(우선순위 100)가 먼저 평가돼 bing.com/maps를 허용하고, bing.com은 기준선의 "Block Bing"에 걸립니다
   - 해설: 사용자 프로필로 예외를 만들고 기준선으로 일괄 차단하는 구성이 가능합니다
3. [판단] URL 필터링(웹 콘텐츠 필터링) 규칙에 일치하는가?
   - 주체: SSE 에지
   - 위치: 보안 › 웹 콘텐츠 필터링 정책(Web content filtering policies) — 규칙 종류: FQDN · URL · 웹 범주 · IP
   - 데이터: URL 필터링은 TLS 검사가 전제입니다. 예: www.youtube.com/shorts 차단 규칙은 youtube.com 홈페이지는 허용합니다. HTTP 메서드 요청 필터링(미리 보기)도 TLS 검사가 필요합니다 [미리 보기 확인 필요]
   - 해설: URL 규칙은 TLS 검사 대상 트래픽에서만 경로까지 비교합니다
   - URL 규칙 차단 → [차단] URL 규칙에 일치해 차단 — Custom Block Page 표시, PolicyType = webContentFiltering
   - URL 규칙 통과 → 4
4. [판단] 위협 인텔리전스 지표에 일치하는가?
   - 주체: SSE 에지
   - 위치: Global Secure Access › 보안 › 위협 인텔리전스(Threat intelligence) 정책 · allow list(선택) [확인 필요: 포털 메뉴 이름]
   - 데이터: URL 지표를 HTTPS 트래픽에 대해 평가하려면 TLS 검사 구성이 필요합니다. 비즈니스 필수이거나 오탐으로 확인된 사이트는 allow list 규칙으로 허용할 수 있으나 보안 위험이 따릅니다
   - 해설: 악성 URL이 정상 도메인 아래 경로에 있어도 TLS 검사 덕분에 URL 지표로 걸릴 수 있습니다
   - 위협 지표 일치 → [차단] 위협 인텔리전스로 차단 — PolicyType = threatIntelligence
   - 지표 없음 → 5
5. [처리] 콘텐츠 정책·프롬프트 정책·파트너 솔루션 연동도 복호화된 내용에 적용
   - 주체: SSE 에지
   - 위치: 보안 › 콘텐츠 정책(network content filtering) · 프롬프트 정책 · 파트너 보안 솔루션
   - 데이터: 이 컨트롤들은 TLS 검사에 의존합니다. 생성형 AI 프롬프트와 MCP 페이로드를 사용자 기기에서 수집하려면 TLS 검사가 선행 조건입니다 [미리 보기 확인 필요]
   - 해설: 여기서는 TLS 검사가 이 컨트롤의 입력을 공급한다는 사실만 짚고 세부 정책은 해당 L2에서 다룹니다
6. [처리] 재암호화해 목적지로 전달 — 차단이 없을 때만
   - 주체: SSE 에지
   - 위치: 에지 → 목적지 서버
   - 데이터: 허용된 요청만 별도 TLS 연결로 보냅니다
   - 해설: 어떤 컨트롤에도 걸리지 않은 요청만 이 단계까지 오며, 서버는 정상적인 TLS 연결로 요청을 받습니다
7. [끝] 결과가 TLS 열과 정책 열로 함께 기록됨
   - 주체: 로그
   - 위치: Global Secure Access › 모니터링 › 트래픽 로그 · KQL: NetworkAccessTraffic
   - 데이터: Action · PolicyId · PolicyName · PolicyRuleId · PolicyType · DestinationUrl · DestinationWebCategories · TlsAction · TlsStatus. 전체 URL이 DestinationUrl에 어떻게 남는지는 확인하지 못했습니다 [확인 필요]
   - 해설: 차단 사유(정책)와 검사 사실(TLS)이 같은 행에서 대조됩니다
- 시나리오: URL 규칙 차단 :: 복호화로 보인 경로가 URL 규칙에 걸려 차단
- 시나리오: URL 규칙 통과 ▸ 위협 지표 일치 :: URL 규칙은 통과했지만 위협 지표에 걸려 차단
- 시나리오: URL 규칙 통과 ▸ 지표 없음 :: 모든 컨트롤을 통과해 재암호화해 전달

> 교육 포인트: 웹 콘텐츠 필터링의 FQDN 규칙은 TLS 검사 없이도 동작하지만 URL 규칙은 TLS 검사가 있어야 경로까지 비교합니다. 차단됐을 때 사용자 친화적 안내(Custom Block Page)를 띄우는 것도 TLS 검사가 있는 경우에 가능합니다.
>
> 주의: 이 L2는 TLS 검사 계층만 다루고, 웹 콘텐츠 필터링 정책 자체의 구성은 「Entra Internet Access」 L2를 참고하세요.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/tutorial-internet-access-url-filtering
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-configure-threat-intelligence
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-network-content-filtering
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/reference-current-known-limitations

### L3 · C · 장애·인증서 오류 시나리오

#### L4 · 사이트가 안 열리거나 인증서 오류가 난다 — 원인을 증상별로 분리한다

1. [시작] 사용자가 사이트 로드 실패 · 인증서 경고 · 도구 오류를 신고
   - 주체: 사용자
   - 위치: 브라우저 경고 · CLI 오류 · 모바일 앱 연결 실패
   - 데이터: 증상 문구 · 발생 기기 · 대상 FQDN · 발생 시각
   - 해설: TLS 검사 장애는 인증서 신뢰·호환성·클라이언트 전제 세 갈래로 나뉩니다
2. [처리] 클라이언트 전제 조건을 점검 — DNS · QUIC · 전달 프로필
   - 주체: 디바이스
   - 위치: 기기: Secure DNS · 브라우저 내장 DNS 끔 · 아웃바운드 UDP 443 차단 · Internet Access Traffic Forwarding 켬 · IPv4 우선(GSA 클라이언트는 IPv6 미지원)
   - 데이터: DoH를 끄지 않으면 FQDN 규칙으로 획득되지 않고, QUIC은 지원되지 않아 TCP 폴백에 의존합니다
   - 해설: 전제가 틀어지면 트래픽이 에지로 오지 않아 증상이 검사 문제처럼 보입니다
3. [처리] 트래픽 로그로 TLS 결과를 확인 — TlsStatus와 TlsAction
   - 주체: 로그
   - 위치: Global Secure Access › 모니터링 › 트래픽 로그 · KQL: NetworkAccessTraffic | where TlsStatus == "Failure"
   - 데이터: TlsAction(Bypassed · Intercepted) · TlsStatus(Success · Failure) · TlsRuleName · DestinationFqdn
   - 해설: 로그에 Failure가 쌓이는 목적지가 우회 후보입니다
4. [판단] 증상은 어떤 유형인가?
   - 주체: 관리자
   - 위치: 증상별 분기
   - 데이터: 서로 다른 원인이 같은 사용자 증상으로 보일 수 있습니다
   - 해설: 증상 유형에 따라 고치는 위치(기기 · 도구 · 정책)가 완전히 다릅니다
   - 브라우저 인증서 경고 → 5
   - 개발 도구 발급자 인증서 오류 → 6
   - 모바일 앱 연결 실패 → 7
   - HTTP/2 전용 사이트 로드 실패 → 8
5. [끝] 루트 CA 미신뢰 — 신뢰 저장소에 배포가 안 된 기기를 찾는다
   - 주체: 관리자
   - 위치: Intune 프로필 할당 상태 · 기기의 Trusted Root Certification Authorities
   - 데이터: 루트 CA(·중간 CA) 누락이 흔한 원인입니다. 배포를 마치고 재확인합니다
   - 해설: 인증서 배포 상태 점검이 검사 장애 대응의 1순위입니다
6. [끝] 개발 도구가 OS 저장소를 쓰지 않음 — 도구별로 루트 CA를 보정
   - 주체: 관리자
   - 위치: certificate problem: unable to get the local issuer certificate → Git: http.sslbackend schannel · Python: pip-system-certs · Node.js: NODE_USE_SYSTEM_CA=1 · Docker: update-ca-certificates
   - 데이터: Git과 Python은 자체 인증서 저장소를 유지하므로 TLS 검사 인증서를 모릅니다
   - 해설: 오류 문구에 local issuer certificate가 있으면 신뢰 저장소 문제입니다
7. [끝] 인증서 고정(pinning) 앱 — 도메인 또는 범주 기반 우회 규칙으로 제외
   - 주체: 관리자
   - 위치: 보안 › TLS 검사 정책 › Edit › Rules › Add rule(FQDN 또는 Web category, Action = Bypass)
   - 데이터: 인증서 고정 앱은 특정 인증서·공개 키만 신뢰하므로 중간자 방식의 복호화를 거부해 핸드셰이크가 실패합니다. 먼저 시험 환경에서 핵심 앱을 검증합니다
   - 해설: 우회는 그 앱에만 적용하고 나머지 대상은 계속 검사합니다
8. [끝] HTTP/2 전용 사이트 — 사용자 지정 TLS 우회 규칙으로 허용
   - 주체: 관리자
   - 위치: 보안 › TLS 검사 정책 › Edit › Rules › Add rule(해당 FQDN, Action = Bypass)
   - 데이터: TLS 검사는 HTTP/2 협상을 지원하지 않아 대부분 사이트는 HTTP/1.1로 폴백하지만, HTTP/2가 필수인 사이트는 열리지 않습니다. TLS 1.0·1.1만 되는 레거시 대상도 우회를 권장합니다
   - 해설: 사이트 단위로 우회하면 검사가 필요한 다른 사이트에 영향을 주지 않습니다
- 시나리오: 브라우저 인증서 경고 :: 기기에 루트 CA가 없어 체인 검증에 실패
- 시나리오: 개발 도구 발급자 인증서 오류 :: 도구가 자체 저장소를 써서 별도 루트 CA 등록 필요
- 시나리오: 모바일 앱 연결 실패 :: 인증서 고정으로 복호화를 거부해 우회 규칙 필요
- 시나리오: HTTP/2 전용 사이트 로드 실패 :: HTTP/2 미지원이라 사용자 지정 우회 규칙 필요

> 교육 포인트: 실패 비율이 높다는 것은 일부 앱의 문제가 아니라 체계적 문제(인증서 신뢰 · 고정 앱 · CA 구성 오류)라는 신호입니다. Zero Trust 평가에는 "TLS 검사 실패율 1% 미만" 항목이 있습니다.
>
> 주의: 운영 알림으로 "TLS 검사 실패 급증(7일 기준선 대비 30% 이상)"을 만들고, 대형 SaaS의 인증서 고정 변경 여부와 우회 목록을 먼저 점검하도록 문서가 안내합니다. 모바일 앱은 먼저 시험 환경에서 호환성을 검증합니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/troubleshoot-transport-layer-security
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/faq-transport-layer-security
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-operate-internet-access
>
> 출처: https://learn.microsoft.com/entra/fundamentals/zero-trust-protect-networks

#### L4 · 인증서 교체와 검사 끄기 — 끊김 없이 바꾸고 순서대로 걷어낸다

1. [시작] 인증서 만료가 다가오거나 검사를 중단해야 함
   - 주체: 관리자
   - 위치: Global Secure Access › 보안 › TLS 검사 정책 › TLS 검사 설정 탭
   - 데이터: 서명 인증서는 6개월 이상 유효해야 합니다. 관리형 루트 CA의 기본 유효 기간은 10년입니다
   - 해설: 만료 후에 바꾸면 신뢰 체인이 끊겨 전체 사용자에게 인증서 오류가 납니다
2. [판단] 목적은 교체인가 검사 중단인가?
   - 주체: 관리자
   - 위치: 운영 계획
   - 데이터: 교체는 새 인증서를 먼저 준비해 전환하고, 중단은 연결을 제거한 뒤 정책과 인증서를 삭제합니다
   - 해설: 두 작업은 순서가 정반대입니다. 교체는 준비 후 제거, 중단은 연결부터 제거합니다
   - 인증서 교체 → 3
   - 검사 중단 → 8
3. [처리] 새 인증서를 생성 — 관리형은 새 Microsoft-managed 인증서, BYOC는 새 CSR
   - 주체: 관리자
   - 위치: TLS 검사 설정 탭 › Create certificate (BYOC는 서명 후 Upload certificate)
   - 데이터: BYOC는 새 CSR의 이름이 이전과 달라야 합니다(이름 재사용 불가). 새 인증서도 기본 Disabled로 생성됩니다
   - 해설: 이전 인증서는 새 인증서가 검증될 때까지 그대로 둡니다
4. [처리] 새 루트 CA를 모든 기기에 배포 — 이전 루트는 제거하지 않음
   - 주체: 관리자
   - 위치: Intune › Devices › Manage devices › Configuration › Trusted certificate 프로필 추가 배포
   - 데이터: 관리형은 Download root certificate로 새 루트를 받습니다. 루트가 같은 BYOC에서 중간 CA만 바뀌는 경우는 신규 루트 배포가 필요 없을 수 있습니다 [확인 필요]
   - 해설: 이전 루트를 먼저 지우면 아직 전환되지 않은 연결이 오류를 냅니다
5. [처리] 새 인증서를 Enabled로 전환 — 활성은 하나뿐
   - 주체: 관리자
   - 위치: TLS 검사 설정 탭 › 새 인증서 행 Actions(…) › Enable
   - 데이터: 관리형은 상태가 Active로 바뀌는 것을 확인합니다. 활성 인증서는 한 번에 하나뿐이어서 BYOC의 이전 인증서를 먼저 비활성으로 두어야 하는지는 문서에 명시돼 있지 않습니다 [확인 필요]
   - 해설: 한 번에 하나만 활성이므로 전환 시점에 짧은 영향이 있을 수 있어 작업 시간을 정합니다
6. [처리] 시험 기기와 로그로 새 체인을 검증
   - 주체: 디바이스
   - 위치: 브라우저 인증서 뷰어(체인에 새 인증서 이름) · KQL: NetworkAccessTraffic | where TlsAction == "Intercepted" | summarize count() by TlsStatus
   - 데이터: TlsStatus Failure 증가 여부 · 주요 앱 동작
   - 해설: 실패율이 오르지 않는지를 먼저 보고 나서 이전 인증서를 정리합니다
7. [끝] 검증이 끝난 뒤에 이전 인증서를 삭제 — 이전 루트는 전환 완료 후 제거
   - 주체: 관리자
   - 위치: TLS 검사 설정 탭 › 이전(비활성) 인증서 행 Actions(…) › Delete · Intune에서 이전 루트 프로필 제거
   - 데이터: 새 인증서 검증과 전환이 끝나기 전에는 이전 루트를 클라이언트에서 지우지 않습니다
   - 해설: 교체는 만들기 → 배포 → 전환 → 검증 → 삭제 순서입니다
8. [처리] 보안 프로필에서 TLS 검사 정책 연결을 제거 — 검사 중단 1단계
   - 주체: 관리자
   - 위치: Global Secure Access › 보안 › 보안 프로필 › Baseline profile 탭 › Edit profile › Link policies › 해당 정책의 Delete 아이콘 › Delete
   - 데이터: 별도 프로필에 연결했다면 그 프로필에서도 제거합니다. 이 순간부터 트래픽은 복호화되지 않습니다
   - 해설: 연결을 먼저 끊어야 인증서를 지우더라도 사용자 화면에 오류가 생기지 않습니다
9. [처리] TLS 검사 정책 삭제 — 중단 2단계
   - 주체: 관리자
   - 위치: Global Secure Access › 보안 › TLS 검사 정책 › 정책 선택 › Actions › Delete
   - 데이터: 정책이 보안 프로필에 연결된 채로는 삭제할 수 없는지는 문서에 없습니다 [확인 필요]
   - 해설: 정책을 지우면 우회 규칙 집합도 함께 사라집니다
10. [끝] TLS 검사 인증서 삭제 — 이후 URL 필터링 등 TLS 의존 컨트롤이 약해짐
    - 주체: 관리자
    - 위치: TLS 검사 설정 탭 › 인증서 행 Actions › Delete
    - 데이터: URL 필터링 · 콘텐츠 정책 · 프롬프트 정책 · 파트너 솔루션은 TLS 검사에 기대므로, 끈 뒤에는 FQDN·SNI 수준 통제만 남습니다
    - 해설: 검사를 끄는 것은 인증서 문제를 풀기 위한 임시 조치일 뿐 보안 수준을 낮춘다는 점을 기록으로 남깁니다
- 시나리오: 인증서 교체 :: 새 인증서를 만들고 배포·전환·검증한 뒤 이전 것 삭제
- 시나리오: 검사 중단 :: 프로필 연결 제거 후 정책과 인증서를 삭제

> 교육 포인트: 관리형 인증서의 교체 순서는 문서가 명시한 6단계(생성 → 다운로드 → 배포 → Enable → 검증 → 이전 disabled 삭제)입니다. 이전 루트 CA는 새 인증서를 검증하고 전환을 마칠 때까지 기기에서 지우지 않습니다.
>
> 주의: BYOC의 교체 절차는 CSR 이름 재사용 불가와 활성 인증서 1개 제한만 문서에 있고, 전환 시 순단 여부는 확인하지 못했습니다 [확인 필요]. 중단은 연결 제거 → 정책 삭제 → 인증서 삭제 순서입니다.
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-transport-layer-security-settings-managed-certificate
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-transport-layer-security
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/how-to-transport-layer-security-settings
>
> 출처: https://learn.microsoft.com/entra/global-secure-access/concept-transport-layer-security
