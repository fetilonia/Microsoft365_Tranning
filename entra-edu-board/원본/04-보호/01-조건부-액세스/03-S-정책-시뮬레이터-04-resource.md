#### 그룹 · resource · 대상 리소스
- 섹션: 대상 리소스
- 선택: 단일
- 위치: 보호 › 조건부 액세스 › 정책 › 새 정책 만들기 › 대상 리소스(Target resources) › 이 정책이 적용되는 대상 선택(Select what this policy applies to)
- 소개: 어떤 앱·서비스·사용자 작업·인증 컨텍스트·GSA 트래픽·에이전트 리소스에 접근할 때 정책을 적용할지 정합니다.
- 평가: 토큰을 요청하는 대상(audience) 리소스가 정책 대상 리소스와 맞는지 평가합니다. 정책은 클라이언트가 아니라 리소스에 걸리며, 포털 메뉴는 리소스·사용자 작업·인증 컨텍스트 중 택일 구조로 보이나 동시 선택 가능 여부는 문서에 명시 없음 [확인 필요].
- 노드 제목: 대상 리소스 일치?
- 노드 보조: 요청한 리소스·작업·컨텍스트가 대상인가
- 해설: 이번 요청이 향하는 리소스나 작업이 정책 대상과 맞는지 보고, 아니면 정책을 건너뜁니다.
- 주체: Entra ID
- 데이터: 토큰 audience(리소스 앱), 사용자 작업, acrs 인증 컨텍스트 요청, GSA 트래픽 프로필
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-cloud-apps;https://learn.microsoft.com/en-us/entra/global-secure-access/concept-universal-conditional-access;https://learn.microsoft.com/en-us/entra/identity/conditional-access/howto-target-agent-identities

##### 옵션 · r-apps-all · 모든 리소스(이전 '클라우드 앱')
- 소개: Entra가 보호하는 모든 리소스의 토큰 요청에 정책을 적용합니다.
- 위치: 대상 리소스 › 리소스(이전 클라우드 앱) › 포함 › 모든 리소스(All resources, formerly 'All cloud apps') › 제외(선택)
- 동작: 웹사이트·서비스의 모든 토큰 요청에 적용하고, 개별 선택이 안 되는 Windows Azure Active Directory(Azure AD Graph) 등도 포함하며 GSA 트래픽 전달 프로필에도 적용됩니다. 제외를 하나라도 두면 저권한 범위 처리가 달라집니다.
- 매칭: 요청한 리소스가 무엇이든 일치합니다(제외한 리소스만 예외). 에이전트 정책에서는 에이전트가 접근하는 Entra 보호 리소스 전체가 대상입니다.
- 미충족 시: 제외로 지정한 리소스에 접근하는 요청은 이 정책의 비대상입니다.
- 지원 주체: 사용자, 게스트, 워크로드 ID, 에이전트
- 제약·주의: 제외 없는 '모든 사용자·모든 리소스' MFA 기준 정책이 권장됩니다. 제외가 있는 정책의 기준 범위(User.Read 등) 적용 방식이 2026-03부터 단계 변경 중입니다. 온보딩·복구 전역 제외(미리 보기)가 있습니다.
- 로그: 일치 시 정책 result가 success/failure로, 로그인 로그 조건부 액세스 탭에서 리소스별로 보입니다.
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-cloud-apps;https://learn.microsoft.com/en-us/entra/identity/conditional-access/howto-target-agent-identities

##### 옵션 · r-apps-selected · 선택한 리소스
- 소개: 지정한 앱·서비스(엔터프라이즈 앱)에 접근할 때만 정책을 적용합니다.
- 위치: 대상 리소스 › 리소스(이전 클라우드 앱) › 포함 › 리소스 선택(Select resources) › 앱 선택 / 필터 편집(Edit filter)
- 동작: 서비스 주체가 테넌트에 있는 Microsoft 클라우드 앱·갤러리·사용자 지정·앱 프록시 앱을 고릅니다. Office 365 그룹을 쓰면 종속 서비스를 한 번에 다룹니다. 앱 속성(사용자 지정 보안 특성) 필터로 앱 묶음을 지정할 수도 있습니다.
- 매칭: 토큰 audience가 선택한 리소스일 때 일치합니다. 기밀 클라이언트가 ID 토큰을 요청하면 그 클라이언트 앱에도 정책이 적용됩니다.
- 미충족 시: 선택하지 않은 리소스 요청은 비대상입니다. Teams처럼 SharePoint·Exchange에 종속된 서비스는 종속성 때문에 의도치 않게 영향을 받을 수 있습니다.
- 지원 주체: 사용자, 게스트, 워크로드 ID, 에이전트
- 제약·주의: 퍼블릭·네이티브 클라이언트 앱은 선택할 수 없습니다. Microsoft Graph는 우산 리소스라 대상 서비스는 감사 보고(Audience Reporting)로 확인합니다. Azure 관리 API 정책은 Azure DevOps를 더는 포함하지 않습니다.
- 로그: 로그인 로그의 리소스(audience)별로 조건부 액세스 평가 결과가 기록됩니다.
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-cloud-apps

##### 옵션 · r-ua-secinfo · 사용자 작업: 보안 정보 등록
- 소개: 사용자가 MFA·SSPR 보안 정보를 등록할 때 정책을 적용합니다.
- 위치: 대상 리소스 › 이 정책이 적용되는 대상 › 사용자 작업(User actions) › 보안 정보 등록(Register security information)
- 동작: 통합 보안 정보 등록 과정에서 정책을 평가합니다. 등록 자체에 신뢰된 위치나 MFA 요구 같은 규칙을 걸 수 있습니다.
- 매칭: 요청이 보안 정보 등록 사용자 작업일 때 일치합니다. 일반 앱 접근 요청은 일치하지 않습니다.
- 미충족 시: 컨트롤을 충족하지 못하면 등록이 막히거나 단계가 요구됩니다. MSA 게스트는 MFA 요구 시 조직에 등록해야 하고, 다른 IdP(예: Google) 게스트는 차단됩니다.
- 지원 주체: 사용자, 게스트
- 제약·주의: 사용자 작업 범위는 보고 전용 모드로 평가할 수 없습니다. 모든 리소스 정책은 별도 전역 제외(미리 보기)를 켜지 않으면 온보딩·복구에도 적용됩니다.
- 로그: 로그인 로그에서 사용자 작업 대상으로 정책 평가 결과가 기록됩니다. 세부 표기 [확인 필요].
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-cloud-apps;https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-report-only

##### 옵션 · r-ua-device · 사용자 작업: 디바이스 등록·조인
- 소개: 디바이스를 Entra에 등록·조인할 때 정책을 적용합니다.
- 위치: 대상 리소스 › 사용자 작업 › 디바이스 등록 또는 조인(Register or join devices)
- 동작: 테넌트 전체 설정보다 세밀하게 디바이스 등록·조인 시 MFA를 요구할 수 있습니다. 허용 컨트롤은 MFA 필요와 인증 강도 필요만 가능하고 나머지는 비활성입니다.
- 매칭: 요청이 디바이스 등록·조인 사용자 작업일 때 일치합니다.
- 미충족 시: MFA 또는 인증 강도를 충족하지 못하면 등록·조인이 진행되지 않습니다.
- 지원 주체: 사용자
- 제약·주의: 클라이언트 앱·디바이스 필터·디바이스 상태 조건은 사용할 수 없고, Windows Hello for Business·디바이스 바인딩 패스키는 이미 등록된 디바이스가 필요해 미지원입니다. 디바이스 설정 '등록·조인에 MFA 필요'는 '아니요'여야 합니다.
- 로그: 사용자 작업 평가 결과가 로그인 로그 조건부 액세스 탭에 기록됩니다. 세부 표기 [확인 필요].
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-cloud-apps

##### 옵션 · r-authctx · 인증 컨텍스트
- 소개: 앱 안의 민감한 데이터·작업에만 단계 상승 정책을 적용합니다.
- 위치: 보호 › 조건부 액세스 › 인증 컨텍스트(만들기·게시), 정책 › 대상 리소스 › 인증 컨텍스트(Authentication context)
- 동작: 관리자가 컨텍스트(c1~c99)를 정의하고 '앱에 게시'하면, 앱이 acrs 클레임 요청(OIDC claims challenge)으로 컨텍스트를 요구하고 그 컨텍스트를 대상으로 한 정책이 평가됩니다. SharePoint 사이트에 직접 지정하거나 민감도 레이블, PIM 역할 활성화에 연결합니다.
- 매칭: 요청(토큰)에 해당 인증 컨텍스트 ID 요구가 있고 토큰의 acrs가 아직 충족되지 않았을 때 일치합니다. 앱은 acrs를 확인해 부족하면 claims challenge로 재인증을 요구합니다.
- 미충족 시: 컨텍스트를 충족하지 못하면 보호된 작업·사이트 접근이 거부되고, 클라이언트가 Entra로 돌아가 컨트롤(MFA 등)을 거쳐 재시도합니다.
- 지원 주체: 사용자, 게스트
- 제약·주의: 사용자를 로그인시키는 앱에서만 지원되고 자체 신원으로 인증하는 앱은 미지원입니다. 워크로드 ID와 조합 가능하다는 Learn 문구와 상충해 [확인 필요]. 사용자와 워크로드 ID는 한 정책에 함께 쓸 수 없습니다.
- 로그: 인증 컨텍스트가 적용된 로그인은 로그인 로그의 조건부 액세스 평가에서 확인합니다. 삭제 전 로그로 사용 여부를 점검합니다.
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-cloud-apps;https://learn.microsoft.com/en-us/entra/identity-platform/developer-guide-conditional-access-authentication-context;https://learn.microsoft.com/en-us/purview/sensitivity-labels-teams-groups-sites

##### 옵션 · r-gsa-internet · Global Secure Access: 인터넷 트래픽
- 소개: GSA 인터넷 액세스 트래픽 전달 프로필 연결(터널)에 정책을 적용합니다.
- 위치: 대상 리소스 › 리소스 › 포함 › 모든 인터넷 리소스(GSA) (All internet resources with Global Secure Access) 또는 리소스 선택 › 인터넷 리소스(Internet resources) [확인 필요: 한글 UI 문구]
- 동작: GSA 클라이언트가 터널을 맺을 때 정책이 평가되어 터널 접속을 허용·차단합니다. 인터넷 프로필만 대상으로 하려면 '리소스 선택'에서 인터넷 리소스를 고르고 보안 프로필을 구성합니다.
- 매칭: GSA 클라이언트가 Entra 토큰으로 인터넷 액세스 터널 권한을 요청하는 로그인일 때 일치합니다.
- 미충족 시: 터널 권한이 거부되면 인터넷 액세스 프로필 트래픽이 전달되지 않습니다. 비준수 디바이스 차단은 복구 경로까지 막을 수 있습니다.
- 지원 주체: 사용자
- 제약·주의: Entra Internet Access 라이선스 필요. 비준수 디바이스 차단 시 Intune 엔드포인트를 인터넷 프로필의 사용자 지정 우회에 추가하는 완화가 안내됩니다. 인터넷 프로필은 Microsoft 트래픽 대상과 겹치지 않습니다.
- 로그: 클라이언트 터널 인증의 정책 결과가 로그인 로그에 기록되고, 원본 IP를 보려면 GSA 소스 IP 복원이 필요합니다.
- 출처: https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-target-resource-microsoft-profile;https://learn.microsoft.com/en-us/entra/global-secure-access/concept-universal-conditional-access;https://learn.microsoft.com/en-us/entra/global-secure-access/concept-traffic-forwarding

##### 옵션 · r-gsa-m365 · Global Secure Access: Microsoft 트래픽
- 소개: GSA Microsoft 트래픽 프로필(Exchange·Teams 등) 연결에 정책을 적용합니다.
- 위치: 대상 리소스 › 리소스 › 포함 › Microsoft 트래픽(Microsoft traffic) 프로필 대상 [확인 필요: 선택기 항목 이름]
- 동작: Microsoft 트래픽 터널 연결 때 정책이 평가됩니다. M365 앱에 준수 네트워크 요구 정책을 함께 두면 사용자가 Microsoft SSE를 우회하지 못하게 할 수 있습니다.
- 매칭: GSA 클라이언트가 Microsoft 트래픽 터널 권한을 위해 토큰을 요청하는 로그인일 때 일치합니다.
- 미충족 시: 클라이언트가 서비스에 연결하지 못하면 트래픽은 차단되지 않고 로컬로 우회됩니다. 차단하려면 준수 네트워크 확인 정책을 따로 만듭니다.
- 지원 주체: 사용자
- 제약·주의: Entra ID P1/P2가 선행 조건입니다. 프로필은 Exchange Online, SharePoint·OneDrive, Teams, Microsoft 365 공통 정책 그룹을 관리합니다. 연결된 정책은 프로필 화면의 '연결된 조건부 액세스 정책'에서 봅니다.
- 로그: 터널 인증 정책 결과가 로그인 로그에 기록됩니다. Microsoft 트래픽 CA 실패는 경보 대상으로 안내됩니다.
- 출처: https://learn.microsoft.com/en-us/entra/global-secure-access/concept-universal-conditional-access;https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-manage-microsoft-profile;https://learn.microsoft.com/en-us/entra/global-secure-access/concept-traffic-forwarding

##### 옵션 · r-gsa-private · Global Secure Access: 프라이빗 트래픽
- 소개: 프라이빗 액세스 앱(Quick Access 등)을 개별 지정해 정책을 적용합니다.
- 위치: Global Secure Access › 애플리케이션 › 엔터프라이즈 애플리케이션 › 앱 선택 › 조건부 액세스 › 새 정책
- 동작: 프라이빗 액세스 터널 전체는 지정할 수 없고 Quick Access·프라이빗 액세스 엔터프라이즈 앱을 하나씩 대상 리소스로 지정합니다. GSA에서 시작하면 선택한 앱이 대상 리소스로 자동 채워집니다.
- 매칭: 요청한 리소스가 정책 대상으로 지정한 프라이빗 액세스 엔터프라이즈 앱일 때 일치합니다.
- 미충족 시: 대상으로 지정하지 않은 프라이빗 앱은 이 정책이 적용되지 않고, 컨트롤 미충족 시 해당 앱 접근이 허용되지 않습니다.
- 지원 주체: 사용자
- 제약·주의: 유니버설 CA는 인터넷·Microsoft 터널에 적용되고 프라이빗 액세스 터널 대상 지정은 미지원입니다. 앱 묶음은 사용자 지정 속성 필터로 지정할 수 있습니다. 프라이빗 액세스 라이선스 필요.
- 로그: 앱 접근 로그인의 조건부 액세스 평가 결과로 기록됩니다.
- 출처: https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-target-resource-private-access-apps;https://learn.microsoft.com/en-us/entra/global-secure-access/concept-universal-conditional-access;https://learn.microsoft.com/en-us/entra/global-secure-access/concept-traffic-forwarding

##### 옵션 · r-agent-res · 에이전트 리소스
- 소개: 에이전트 관련 리소스로 향하는 토큰 요청에 정책을 적용합니다(미리 보기).
- 위치: 대상 리소스 › 포함 › 모든 에이전트 리소스(All agent resources, Preview)
- 동작: 에이전트 ID 블루프린트 주체와 에이전트 ID를 대상으로 하는 모든 토큰 요청에 정책이 강제됩니다. 에이전트 정책에서는 모든 에이전트 리소스·모든 리소스·리소스 선택 중에서 대상을 고릅니다.
- 매칭: 토큰 audience가 에이전트 ID 블루프린트 주체나 에이전트 ID(에이전트 리소스)일 때 일치합니다.
- 미충족 시: 에이전트 리소스가 아닌 일반 리소스 요청은 비대상입니다(모든 리소스를 고르면 그쪽도 대상).
- 제약·주의: 미리 보기. 에이전트 정책의 접근 컨트롤은 에이전트 ID는 차단만, 에이전트 사용자는 차단·준수 디바이스 요구입니다.
- 로그: 일반 정책과 같은 result 값으로 기록됩니다. 에이전트 전용 로그 표기 [확인 필요].
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-cloud-apps;https://learn.microsoft.com/en-us/entra/identity/conditional-access/howto-target-agent-identities
