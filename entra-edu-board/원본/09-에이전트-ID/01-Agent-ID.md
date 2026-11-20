## L2 · Agent ID — AI 에이전트 신원 [미리 보기 확인 필요]

- 설정(Control Plane): 에이전트 ID 블루프린트 · 에이전트 ID 만들기 | 스폰서 · 소유자 · 권한 (상속 가능 권한)
- 강제(Enforcement): Entra 토큰 발급 (블루프린트 → 에이전트 ID 위임 교환) | 에이전트 대상 조건부 액세스
- 증적(Evidence): 에이전트 로그인 로그 (agentSignIn) | 감사 로그 agentType · blueprintId
- 메뉴(Admin Center): 에이전트 ID > 에이전트 ID · 에이전트 블루프린트 [확인 필요: 문서 표기는 Entra ID › Agents › Agent identities · Agent blueprints이며 미리 보기 중 변경 가능]
- 라이선스(License): 에이전트 ID 플랫폼은 모든 Entra 고객 사용 가능, 조건부 액세스 등 보안 기능은 Microsoft Agent 365(또는 Microsoft 365 E7) + Entra P1 이상 필요 [확인 필요: 미리 보기 · 라이선스 정책 변경 가능]

### L3 · 0 · 기능 상태 전이 — 공유 신원 → 에이전트 ID 구성 → 에이전트 단위 통제

#### L4 · ⓪ 비활성 — 에이전트가 사용자나 공용 앱 신원으로 동작한다

1. [시작] AI 에이전트가 Graph · 사내 API를 호출한다
   - 주체: 앱
   - 위치: 에이전트 런타임 → Microsoft Graph · 사내 API
   - 데이터: 호출 대상 리소스 · 필요한 권한
   - 해설: 에이전트가 사람 대신 또는 자율적으로 리소스에 접근합니다
2. [처리] 개발자 계정이나 공용 앱 등록의 자격 증명을 사용
   - 주체: 앱
   - 위치: 앱 등록 › 인증서 및 암호 (클라이언트 암호) 또는 개발자 사용자 토큰
   - 데이터: 공용 client_id · 비밀 또는 사용자 위임 토큰
   - 해설: 에이전트 자체의 신원이 없어 다른 신원을 빌려 씁니다
3. [처리] 토큰의 주체가 사람이거나 일반 앱
   - 주체: Entra ID
   - 위치: 토큰 발급 시점의 Microsoft Entra ID 토큰 엔드포인트 (POST /oauth2/v2.0/token)
   - 데이터: 일반 앱 · 사용자 토큰 (xms_act_fct · xms_sub_fct 같은 에이전트 식별 클레임 없음) — 감사 로그에서도 agentType = notAgentic 으로 분류됩니다
   - 해설: 받는 쪽은 이 호출이 어떤 에이전트의 것인지 알 수 없습니다
4. [처리] 책임자와 수명 주기 정보가 없음
   - 주체: 관리자
   - 위치: 엔터프라이즈 앱 › 소유자 (스폰서 개념 없음)
   - 데이터: owners만 존재 · 업무 책임자 기록 없음
   - 해설: 누가 이 에이전트의 업무 책임자인지 기록할 곳이 없습니다
5. [끝] 에이전트 단위 차단 · 감사 불가
   - 주체: 로그
   - 위치: Entra ID › Monitoring & health › Sign-in logs (필터 Agent type = Not Agentic / Is Agent = No 로만 잡힘)
   - 데이터: 로그인 로그에서 에이전트 유형을 구분할 수 없음 — 일반 앱·사용자 로그인과 섞여 기록됨
   - 해설: 특정 에이전트만 정지하거나 권한을 회수하기 어렵습니다

#### L4 · ① 구성 — 블루프린트와 에이전트 ID를 만들고 스폰서 · 권한을 정한다

1. [시작] 만들 권한을 확인
   - 주체: 관리자
   - 위치: Entra ID › Roles & admins의 Agent ID Developer · Agent ID Administrator 역할 할당, 또는 조직 전체 설정 "Users can create agent blueprints" [확인 필요: 설정 위치]
   - 데이터: 설정이 Yes이면 테넌트 사용자 누구나 블루프린트와 블루프린트 주체를 만들 수 있고, 아니면 Agent ID Developer·Agent ID Administrator 역할이 필요합니다. Developer는 페더레이션 자격 증명(FIC)만 구성할 수 있고 비밀·인증서 자격 증명 추가는 Agent ID Administrator가 필요합니다. Graph 권한의 관리자 동의는 애플리케이션 권한이면 Privileged Role Administrator, 위임 권한이면 Cloud Application Administrator 또는 Application Administrator가 최소 역할입니다. PowerShell은 버전 7이 필요합니다.
   - 해설: 블루프린트나 블루프린트 주체의 소유자는 별도 Agent ID 역할 없이 그 블루프린트의 에이전트 ID를 만들 수 있습니다. 관리형 생성 경험은 생성자를 소유자로 지정하지만, Graph로 만들 때는 소유자를 직접 지정해야 합니다
2. [처리] 에이전트 블루프린트 만들기
   - 주체: 관리자
   - 위치: Entra ID › Agents › Agent blueprints › New agent blueprint (Preview) — Basics 탭에서 Agent blueprint name 입력 → Owners & Sponsors 탭 → Create. 코드로는 POST /v1.0/applications/ (헤더 OData-Version: 4.0, "@odata.type": "Microsoft.Graph.AgentIdentityBlueprint", AgentIdentityBlueprint.Create 권한)
   - 데이터: agentIdentityBlueprint 와 블루프린트 주체(agentIdentityBlueprintPrincipal)를 마법사가 함께 생성합니다. Graph로 만들면 응답의 id(블루프린트 Object ID, /applications/{id} 주소용)와 appId(client ID, 주체 생성용)를 구분해 기록하고, 주체는 POST /v1.0/serviceprincipals/microsoft.graph.agentIdentityBlueprintPrincipal 에 appId를 보내 따로 만듭니다(AgentIdentityBlueprintPrincipal.Create). 마법사로 만들었다면 주체를 또 만들지 않습니다
   - 해설: 같은 종류의 에이전트가 공유하는 설계도를 먼저 만듭니다. 인스턴스 모드(단일/다중)는 생성 후 바꿀 수 없고, 단일 인스턴스 블루프린트는 블루프린트 주체가 없습니다. 마법사는 이름·소유자·스폰서만 정하므로 자격 증명·식별자 URI·scope는 생성 후 상세 페이지나 Graph/PowerShell로 구성합니다
3. [처리] 스폰서 · 소유자 지정
   - 주체: 관리자
   - 위치: 새 에이전트 블루프린트 마법사 › 소유자 및 스폰서 탭
   - 데이터: sponsors(필수) — 사용자(게스트 포함), 동적 멤버십 그룹(보안·M365), 할당 멤버십 M365 그룹. 역할 할당 가능 그룹과 할당 멤버십 보안 그룹은 불가하며 최대 100명(그룹은 5개 이하). owners(선택) — 사용자(게스트 포함)·서비스 주체, 그룹은 불가. Graph에서는 sponsors@odata.bind · owners@odata.bind 로 지정합니다 [확인 필요: 마법사 안내문은 "보안 그룹 미지원"으로만 표기해 동적 보안 그룹 허용 여부가 문서마다 다름]
   - 해설: 업무 책임자(스폰서)와 기술 관리자(소유자)를 따로 둡니다. 위임 생성에서 스폰서를 생략하면 호출 사용자가 자동 스폰서가 되지만 Agent ID 관리자 역할 사용자는 자동 지정되지 않고, 앱 전용 생성은 서비스가 스폰서를 반드시 지정해야 합니다. 이 관계는 Entra RBAC 역할(Agent ID Administrator 등)과 별개입니다
4. [처리] 블루프린트 자격 증명 구성
   - 주체: 관리자
   - 위치: 블루프린트 상세 › 자격 증명 [확인 필요: 상세 페이지 메뉴명] / POST /v1.0/applications/{blueprint-id}/federatedIdentityCredentials
   - 데이터: 페더레이션 자격 증명(관리 ID 권장): name · issuer=https://login.microsoftonline.com/{tenant-id}/v2.0 · subject=관리 ID 주체 ID · audiences=["api://AzureADTokenExchange"] (AgentIdentityBlueprint.AddRemoveCreds.All 권한, {blueprint-id}는 appId가 아니라 Object ID). 인증서·클라이언트 비밀(addPassword)은 로컬 개발·테스트용이며 운영 환경 비권장입니다
   - 해설: 자격 증명은 에이전트 ID가 아니라 블루프린트에 둡니다. 관리 ID는 Azure 서비스(VM·App Service 등)에서 실행할 때만 쓸 수 있고, 최종 사용자 기기에 설치되는 에이전트에는 블루프린트 자격 증명을 배포하지 않고 공개 클라이언트(PKCE) 방식을 씁니다
5. [처리] 상속 가능 권한 설정
   - 주체: 관리자
   - 위치: Graph — agentIdentityBlueprint 의 inheritablePermissions 속성
   - 데이터: 리소스 앱(resourceAppId)마다 항목 하나를 두고 kind = enumerated(열거한 scope만) · allAllowed(현재·미래의 모든 scope) · none(상속 없음). beta API이며 추가는 AgentIdentityBlueprint.Create, 수정·삭제는 AgentIdentityBlueprint.ReadWrite.All 권한, 소유자가 아닌 위임 호출자는 Agent ID Administrator가 필요합니다. 상속되려면 리소스 앱이 inheritable로 구성되고 해당 scope가 블루프린트 주체에 부여되어 있어야 합니다
   - 해설: 블루프린트가 가진 위임 권한을 자식 에이전트 ID가 쓸 수 있게 합니다. 자식 에이전트 ID는 대화형 /authorize 로 동의받을 수 없어(시도 시 AADSTS82014) OBO 패턴에서는 이 사전 상속과 관리자 동의가 필수입니다. 앱 역할(application role) 상속은 공개 Graph 계약이 정의되지 않아 [확인 필요: 앱 권한 상속 지원 범위]
6. [처리] 에이전트 ID 만들기
   - 주체: 관리자
   - 위치: Entra ID › Agents › Agent identities › New agent identity (Preview) — Basics 탭에서 Agent blueprint 선택 + Agent identity name 입력 → Owners & Sponsors → Create / POST /beta/servicePrincipals/microsoft.graph.agentIdentity (헤더 OData-Version: 4.0)
   - 데이터: 본문에 displayName · agentIdentityBlueprintId(블루프린트 Object ID, appId 아님) · sponsors@odata.bind 필수. 호출 토큰은 블루프린트가 client_credentials(scope=https://graph.microsoft.com/.default, 관리 ID 토큰을 client_assertion으로)로 받아 사용합니다. 응답의 id(에이전트 ID Object ID)는 삭제 요청에 쓰이며 client ID와 다른 값입니다
   - 해설: 블루프린트에서 에이전트 ID가 만들어지며 서비스 주체의 특수 형태입니다. 에이전트당 에이전트 ID 하나를 두기를 권장하고, 이 단계의 블루프린트 토큰은 조건부 액세스 평가 대상이 아닙니다. 단일 인스턴스 모드는 별도 절차(isSingleInstance=true 블루프린트)를 씁니다
7. [처리] 에이전트 ID의 스폰서 · 소유자 지정
   - 주체: 관리자
   - 위치: 에이전트 ID 마법사 › 소유자 및 스폰서 탭
   - 데이터: sponsors 최소 1명 필수(생성 요청에 유효한 스폰서가 없으면 만들어지지 않음). 스폰서로 가능한 것은 사용자(게스트 포함)·동적 멤버십 그룹·할당 멤버십 M365 그룹이고, 역할 할당 가능 그룹과 할당 멤버십 보안 그룹은 불가. owners는 선택이며 그룹은 불가. 에이전트 사용자 계정도 만든다면 같은 스폰서를 양쪽에 지정하길 권장합니다
   - 해설: 에이전트마다 책임자가 반드시 지정되도록 강제합니다. 매니저(manager)는 에이전트 사용자 계정에 지정하며 액세스 패키지를 요청할 수 있을 뿐 에이전트를 수정·삭제할 권한은 없습니다
8. [처리] 리소스 권한 부여
   - 주체: 관리자
   - 위치: 에이전트 ID › 에이전트 ID › {ID} › 권한 [확인 필요: 메뉴명]
   - 데이터: 앱 권한 (관리자 동의) 또는 위임 권한 (직접 또는 블루프린트 상속)
   - 해설: 만들었다고 접근 권한이 생기지는 않으며 필요한 권한만 따로 부여합니다
9. [처리] (선택) 에이전트 사용자 계정 만들기
   - 주체: 관리자
   - 위치: Microsoft Graph POST /v1.0/users (본문 "@odata.type": "microsoft.graph.agentUser", identityParentId = 에이전트 ID Object ID) — 블루프린트가 scope=https://graph.microsoft.com/.default 토큰으로 호출. 사전에 Entra ID › App registrations › 블루프린트 › API permissions 에서 AgentIdUser.ReadWrite.IdentityParentedBy 애플리케이션 권한에 관리자 동의 [확인 필요: 사용자 생성 엔드포인트 세부 형식]
   - 데이터: 사용자 개체(에이전트 ID와 1:1, 한 번 맺어지면 변경 불가) · 필요한 M365 라이선스만 할당. 사용자 대상 위임 호출은 Agent ID Administrator가 최소 역할입니다. 계정은 idtyp=user 토큰을 받지만 암호·패스키가 없고 부모 에이전트 ID가 준 토큰으로만 인증하며, 특권 관리자 역할과 역할 할당 가능 그룹은 불가·동적 그룹·관리 단위·라이선스·사용자 지정 역할은 가능합니다
   - 해설: Teams 멤버십이나 메일함처럼 사용자 개체가 꼭 필요할 때만 만듭니다. 블루프린트에는 이 권한이 기본으로 없고, Graph로 만든 계정은 Entra 신원만 생길 뿐 메일함·Teams 존재감 같은 M365 기능은 Teams의 에이전트 생성(Agent 365 SDK)으로 프로비저닝해야 합니다
10. [끝] 에이전트 대상 조건부 액세스 정책 연결
   - 주체: 관리자
   - 위치: Entra ID › Conditional Access › Policies › New policy → Assignments › Users, agents (Preview) or workload identities › What does this policy apply to = Agents. 최소 역할은 Conditional Access Administrator
   - 데이터: 대상 = All agent identities · Select agent identities(개별 선택 또는 사용자 지정 보안 특성) · All agent users (Preview) · Select agent users (Preview). 블루프린트를 대상으로 하면 이후 만들어진 에이전트 ID도 포함됩니다. 조건 = Agent risk (Preview)의 High·Medium·Low 이며, 에이전트 ID에 쓸 수 있는 권한 부여 제어는 Block access뿐입니다. 보고서 전용(report-only) 모드로 영향을 먼저 점검할 수 있습니다. 라이선스는 Microsoft 365 E7, 또는 Microsoft Agent 365 + Entra P1 이상(M365 E3)
   - 해설: 에이전트를 통째로 막거나 위험한 에이전트만 차단하는 정책을 둡니다. 에이전트 ID 정책은 에이전트 사용자 계정에 적용되지 않고(반대도 같음) 사용자 대신(OBO) 요청은 사용자 정책이 평가하므로 패턴별로 정책을 따로 둡니다. 보안 기본값(security defaults)이 켜져 있으면 조건부 액세스가 적용되지 않으며, API 키로 접근하는 리소스는 Entra 토큰 발급 경로를 거치지 않아 보호되지 않습니다

#### L4 · ② 활성 — 에이전트가 자기 신원으로 토큰을 받고 판정받는다

1. [시작] 에이전트 런타임이 작업을 시작
   - 주체: 앱
   - 위치: 에이전트 호스트 (예: Azure 관리 ID가 있는 환경)
   - 데이터: 블루프린트 자격 증명 (관리 ID 토큰 · 인증서 · 비밀)
   - 해설: 런타임은 블루프린트의 자격 증명만 가지고 있습니다. 관리 ID만 구성했다고 API 접근 권한이 생기지는 않고, 관리 ID 토큰이 FIC를 통해 블루프린트를 인증할 뿐입니다. 로컬 개발자의 Azure CLI 로그인은 관리 ID가 아닙니다
2. [처리] 블루프린트가 교환 토큰 T1을 요청
   - 주체: 앱
   - 위치: POST /oauth2/v2.0/token (client_credentials)
   - 데이터: client_id=블루프린트 · scope=api://AzureADTokenExchange/.default · fmi_path=에이전트 ID appId(client ID) · client_assertion(관리 ID 토큰 TUAMI) · grant_type=client_credentials. T1의 aud는 블루프린트가 아니라 토큰 교환 리소스입니다
   - 해설: 어느 자식 에이전트 ID를 대리할지 fmi_path로 알려 T1을 받습니다. 단일 인스턴스 에이전트는 이 중간 T1·fmi_path를 쓰지 않고 공유 client ID와 블루프린트 자격 증명으로 직접 요청합니다
3. [처리] 에이전트 ID가 T1로 리소스 토큰을 요청
   - 주체: 앱
   - 위치: POST /oauth2/v2.0/token
   - 데이터: client_id=에이전트 ID · scope=대상 리소스/.default · client_assertion=T1 (client_assertion_type=jwt-bearer, grant_type=client_credentials)
   - 해설: 에이전트 ID가 교환 토큰을 자격 증명 삼아 자기 이름으로 요청합니다. 프로토콜을 직접 구현하기보다 Microsoft.Identity.Web 등 승인된 SDK 사용이 권장됩니다
4. [판단] T1이 블루프린트에 묶이고 자식 에이전트 ID가 맞는가?
   - 주체: Entra ID
   - 데이터: T1 바인딩 확인(T1의 azp가 블루프린트) · T1의 sub(FMI 경로)가 교환을 수행하는 자식 에이전트 ID로 해석되는지 확인. 블루프린트는 자기 자식 에이전트 ID만 대리할 수 있고 에이전트 ID는 블루프린트 하나에만 속합니다
   - 해설: 다른 에이전트 ID를 대리하는 시도는 여기서 막힙니다. OBO에서는 사용자 토큰(Tc)의 aud가 블루프린트 client ID여야 하며 Microsoft Graph 등 다른 대상이면 AADSTS50013으로 거부됩니다
   - 예 → 5
   - 아니오 → [차단] 차단 — 블루프린트 · 에이전트 ID 불일치
5. [판단] 에이전트 대상 조건부 액세스 · 위험 조건을 통과하는가?
   - 주체: Entra ID
   - 위치: Entra ID › Conditional Access (에이전트 ID 정책). 평가 시점은 토큰 발급·갱신 때이고 일부 리소스는 연속 액세스 평가(CAE)로 준실시간 적용됩니다
   - 데이터: 에이전트 ID 정책 · Agent risk (Preview) 조건 · 제어는 Block access. 블루프린트가 Graph 토큰으로 에이전트 ID를 만들 때, 그리고 AAD Token Exchange Endpoint: Public(리소스 ID fb60f99c-7a34-4190-8149-302f77469936)에서의 중간 토큰 교환(T1)은 평가 대상이 아닙니다. 최종 리소스 토큰 발급 시점에 정책이 평가됩니다
   - 해설: 토큰 발급 직전에 에이전트 ID에 대한 정책을 평가합니다. 정책 대상 리소스는 테넌트에 엔터프라이즈 앱(서비스 주체)이 있어야 하며 사용자 지정 MCP 서버·Open API 도구는 앱으로 등록해야 합니다. 에이전트 위험은 ID Protection 신호입니다
   - 예 → 6
   - 아니오 → [차단] 차단 — 에이전트 정책 · 위험 조건 미충족
6. [처리] 앱 전용 액세스 토큰 발급
   - 주체: Entra ID
   - 데이터: 주체 = 에이전트 ID · idtyp · xms_act_fct(액터 facet) · xms_sub_fct(주체 facet) · azp(요청한 에이전트 ID) · oid · tid · roles (앱 권한, 위임 권한은 적용 안 됨)
   - 해설: 토큰 주체가 에이전트 ID이고 앱 권한만 담겨 에이전트임을 식별할 수 있습니다. 에이전트 ID는 만들어진 테넌트에서만 토큰을 받으며 다른 테넌트 리소스에는 접근할 수 없습니다
7. [처리] 리소스 API가 에이전트 토큰을 검증
   - 주체: 리소스
   - 데이터: aud · iss · exp 와 서명 검증 → 요구 scope·roles 확인 → 에이전트 클레임으로 로깅. 리소스 서버는 인증 미들웨어로 검증한 뒤 클레임을 읽어야 하고, 클라이언트는 에이전트 토큰을 불투명(opaque)하게 취급해 파싱하지 않아야 합니다. .NET에서는 HttpContext.User.GetParentAgentBlueprint() · IsAgentUserIdentity() 로 에이전트 여부를 확인할 수 있으나 토큰 검증을 대체하지 않습니다
   - 해설: 리소스가 받은 토큰이 에이전트 것인지 확인해 별도 정책·로그를 적용합니다
8. [끝] 에이전트 로그인 로그에 기록
   - 주체: 로그
   - 위치: Entra ID › Monitoring & health › Sign-in logs (필터: Agent type · Is Agent). 최소 역할 Reports Reader
   - 데이터: agentSignIn 이벤트 유형 — Agent type = Agent ID user · Agent Identity · Agent Identity Blueprint · Not Agentic, Is Agent = Yes/No. 에이전트는 사용자 위임·앱 전용 모두로 로그인할 수 있어 네 가지 로그인 로그 유형(대화형·비대화형 사용자, 서비스 주체, 관리 ID) 어디에나 나타날 수 있습니다
   - 해설: 어떤 에이전트가 어떤 리소스에 접근했는지 에이전트 단위로 남습니다
- 시나리오: 예 ▸ 예 :: 토큰·조건 통과로 앱 전용 토큰 발급
- 시나리오: 예 ▸ 아니오 :: T1은 맞지만 CA·위험 조건에서 차단
- 시나리오: 아니오 :: T1이 블루프린트와 안 맞아 차단

> 교육 포인트: 에이전트는 사용자도 일반 앱도 아닌 별도 신원입니다. "블루프린트(종류) → 에이전트 ID(인스턴스)" 구조 덕분에 종류 단위로 정책·중지·권한 회수를 한 번에 할 수 있습니다.
>
> 주의: 미리 보기 기능이라 메뉴 · 객체 이름 · 정책 지원 범위 · 라이선스가 바뀔 수 있습니다. 교육 직전에 최신 문서로 재확인합니다.
>
> 주의: 에이전트 ID는 만들어진 테넌트에서만 토큰을 받고 다른 테넌트의 리소스는 호출하지 못합니다.
>
> 출처: https://learn.microsoft.com/entra/agent-id/what-is-microsoft-entra-agent-id
>
> 출처: https://learn.microsoft.com/entra/agent-id/agent-identities
>
> 출처: https://learn.microsoft.com/entra/agent-id/create-blueprint
>
> 출처: https://learn.microsoft.com/entra/agent-id/create-delete-agent-identities
>
> 출처: https://learn.microsoft.com/entra/agent-id/configure-inheritable-permissions-blueprints
>
> 출처: https://learn.microsoft.com/entra/agent-id/agent-autonomous-app-oauth-flow
>
> 출처: https://learn.microsoft.com/entra/identity/conditional-access/howto-target-agent-identities

### L3 · A · 에이전트 ID 구성 — 블루프린트 · 스폰서 · 권한

#### L4 · 블루프린트와 에이전트 ID의 구조와 책임 · 권한 모델

1. [시작] 새 종류의 에이전트를 도입 — 예: Sales Assistant Agent
   - 주체: 관리자
   - 위치: 에이전트 ID › 에이전트 블루프린트
   - 데이터: 에이전트 종류 · 게시자 · 필요한 권한 목록
   - 해설: 구매했든 직접 만들었든 종류마다 블루프린트 하나를 만듭니다
2. [처리] 블루프린트에 "종류"의 공통 정보를 기록
   - 주체: 관리자
   - 데이터: 이름 · 게시 조직 · 제공 역할 · 부여할 Graph 권한
   - 해설: 같은 종류의 에이전트가 공유하는 속성은 한곳에서 관리합니다
3. [처리] 에이전트 ID는 블루프린트 하나에서만 만들어진다
   - 주체: Entra ID
   - 데이터: 한 블루프린트가 여러 에이전트 ID를 대리 · 에이전트 ID는 블루프린트 한 개에만 속함. 에이전트 ID는 항상 단일 테넌트이고, 블루프린트는 멀티테넌트로 구성해 다른 테넌트에 추가하면 그 테넌트 안에 테넌트 로컬 에이전트 ID가 만들어집니다
   - 해설: 부모–자식 관계가 정책 범위의 기준이 됩니다. 블루프린트를 대상으로 한 조건부 액세스 정책은 나중에 만들어진 에이전트 ID까지 자동으로 포함합니다
4. [판단] 단일 인스턴스 모드인가, 다중 인스턴스 모드인가?
   - 주체: 관리자
   - 위치: 블루프린트 생성 시점의 isSingleInstance 설정 (Graph), 이후 변경 불가
   - 데이터: 단일 인스턴스 = 블루프린트와 에이전트 ID가 client ID 공유(Object ID는 별개), 다중 인스턴스 = 블루프린트가 자식 ID를 대리. 생성 후 모드는 바꿀 수 없습니다
   - 해설: 클라우드·기기 설치형 에이전트는 단일 인스턴스, 플랫폼형 에이전트는 다중 인스턴스를 씁니다. 모드에 따라 토큰 요청 방식과 권한 상속 가능 여부가 달라지므로 만들기 전에 정합니다
   - 단일 → 5
   - 다중 → 6
5. [처리] 단일 인스턴스 — 공유 client ID와 직접 자격 증명 사용
   - 주체: Entra ID
   - 데이터: 블루프린트 주체 없음 · 공개 클라이언트는 자격 증명 없이 PKCE 코드 흐름(authorization code flow with PKCE), 비공개(confidential) 클라이언트는 공유 client ID + 블루프린트에 구성한 자격 증명으로 직접 요청. 권한은 에이전트 ID에 직접 부여하며 블루프린트로부터 상속되지 않습니다
   - 해설: 중간 교환 토큰(T1)과 fmi_path 없이 에이전트 ID가 직접 토큰을 요청합니다. 최종 사용자 기기에 설치되는 에이전트는 블루프린트 자격 증명을 배포하지 않고 공개 클라이언트로 구성합니다
   - 다음 → 7
6. [처리] 다중 인스턴스 — 블루프린트 주체가 자식 ID를 대리 · 권한 상속
   - 주체: Entra ID
   - 데이터: 블루프린트 주체 · 상속 가능한 위임 권한(inheritableScopes — allAllowed · enumerated · none). 에이전트 ID의 InheritDelegatedPermissions 속성이 켜진 경우 FIC 대리(impersonation)로 토큰을 받을 때 적용되며 같은 테넌트 안에서만 상속됩니다
   - 해설: 자식 에이전트 ID는 블루프린트가 받은 위임 권한을 이어받을 수 있습니다. 상속 대상 scope는 블루프린트 주체에 먼저 부여되어 있어야 합니다
7. [처리] 스폰서와 소유자의 역할을 분리
   - 주체: 관리자
   - 위치: 블루프린트 · 에이전트 ID › Owners & Sponsors (Entra admin center) / Graph의 owners · sponsors 관계
   - 데이터: 스폰서 = 업무 책임 · 비활성화 · 스폰서 변경 · 소프트 삭제만 가능(인증 속성 등 앱 설정 수정 불가) / 소유자 = 기술 관리 · 인증 속성·자격 증명 수정 · 소유자·스폰서 추가 · 재활성화 · 소프트 삭제 복원 · 영구 삭제. 스폰서가 실수로 비활성화·삭제하면 소유자나 관리자에게 복구를 요청해야 합니다. 매니저는 에이전트 사용자 계정에 지정하며 수정·삭제 권한이 없습니다
   - 해설: 스폰서는 중지할 수 있지만 되살릴 수는 없어 권한이 최소화됩니다. 스폰서 승계(퇴사·이동)를 관리하지 않으면 책임자 공백이 생깁니다
8. [판단] 에이전트 ID에 스폰서가 지정돼 있는가?
   - 주체: Entra ID
   - 데이터: sponsors — 블루프린트·에이전트 ID는 생성 시 최소 1명 필수(블루프린트 주체는 생성 시 예외), 최대 100명(그룹은 5개 이하). 사용자·동적 멤버십 그룹·할당 멤버십 M365 그룹만 가능
   - 해설: 책임자 없는 에이전트가 생기지 않게 필수 값으로 둡니다. 에이전트 사용자 계정의 스폰서는 필수가 아니며 최대 5명입니다
   - 예 → 9
   - 아니오 → [차단] 생성 불가 — 스폰서 필수
9. [판단] 사용자 개체가 꼭 필요한 업무인가?
   - 주체: 관리자
   - 데이터: 사용자 개체가 필요한 경우 — Teams 팀 멤버 · Exchange Online 메일함 · SharePoint/OneDrive 항목 직접 공유 · 사용자별 라이선스 서비스. 앱 권한을 지원하는 API는 사용자 계정이 필요 없습니다. 계정을 만든 뒤에도 팀 추가·메일함 프로비저닝·공유 대상 지정은 서비스별로 따로 해야 하고, 위임 권한(Mail.ReadWrite, Files.ReadWrite 등)을 에이전트 ID에 부여해야 합니다
   - 해설: 앱 권한으로 가능한 일은 에이전트 ID만 쓰고, 사용자가 꼭 필요할 때만 사용자 계정을 둡니다. 계정은 에이전트 ID당 최대 1개입니다
   - 예 → [끝] 에이전트 사용자 1:1 생성 — 필요한 라이선스 · 권한만 부여
   - 아니오 → 10
10. [끝] 에이전트 상세에서 책임자 · 권한 점검 — 이름 · 스폰서 · 로그인 로그
   - 주체: 관리자
   - 위치: Entra ID › Agents › Agent identities › {ID} (상세 보기) · Monitoring & health › Sign-in logs / Audit logs
   - 데이터: 이름 · 상태 · 소유자 · 스폰서 · 부여된 권한 · 로그인 로그. 에이전트 ID의 Object ID(디렉터리 개체)와 appId(OAuth client ID)는 다른 값이므로 Graph 요청에서 바꿔 쓰지 않습니다
   - 해설: 에이전트 한 곳에서 책임자와 접근 범위를 점검합니다
- 시나리오: 단일 ▸ 예 ▸ 예 :: 단일 인스턴스, 스폰서 있음, 사용자 필요로 1:1 생성
- 시나리오: 단일 ▸ 예 ▸ 아니오 :: 단일 인스턴스, 스폰서 있음, 사용자 불필요로 상세 점검
- 시나리오: 단일 ▸ 아니오 :: 단일 인스턴스인데 스폰서가 없어 생성 불가
- 시나리오: 다중 ▸ 예 ▸ 예 :: 다중 인스턴스, 스폰서 있음, 사용자 필요로 1:1 생성
- 시나리오: 다중 ▸ 예 ▸ 아니오 :: 다중 인스턴스, 스폰서 있음, 사용자 불필요로 상세 점검
- 시나리오: 다중 ▸ 아니오 :: 다중 인스턴스인데 스폰서가 없어 생성 불가

> 교육 포인트: 에이전트 ID는 다른 신원처럼 암호나 passkey를 쓰지 않습니다. 자격 증명은 블루프린트에 두고, 에이전트 ID는 대리 토큰으로만 인증합니다.
>
> 주의: 에이전트 사용자 계정은 "사람 없이 돈다"는 이유만으로 만들지 않습니다. 앱 권한으로 되는 일은 에이전트 ID로 처리합니다.
>
> 출처: https://learn.microsoft.com/entra/agent-id/agent-identities
>
> 출처: https://learn.microsoft.com/entra/agent-id/agent-owners-sponsors-managers
>
> 출처: https://learn.microsoft.com/entra/agent-id/agent-user-oauth-flow
>
> 출처: https://learn.microsoft.com/entra/agent-id/agent-users

### L3 · B · 에이전트 토큰 발급 — 에이전트 ID와 에이전트 사용자

#### L4 · 누구의 권한으로 동작하느냐에 따라 세 가지 토큰 경로가 갈린다

1. [시작] 에이전트가 하위 서비스를 호출해야 한다
   - 주체: 앱
   - 데이터: 대상 API · 필요한 권한 종류
   - 해설: 에이전트가 쓰는 접근 패턴에 따라 토큰의 주체가 달라집니다
2. [판단] 어떤 신원의 권한으로 동작하는가?
   - 주체: 앱
   - 데이터: 에이전트 ID 자체(앱 전용) · 로그인한 사용자 대신(OBO) · 에이전트 사용자 계정
   - 해설: 같은 에이전트도 상황에 따라 세 가지 패턴을 섞어 쓸 수 있습니다
   - 에이전트 ID 자체 → 3
   - 사용자 대신 → 4
   - 에이전트 사용자 → 6
3. [처리] 앱 전용 — 블루프린트 T1 → 에이전트 ID 토큰
   - 주체: Entra ID
   - 데이터: 주체와 액터 모두 에이전트 ID · 앱 권한(roles)만 적용, 위임 권한은 미적용. 요청은 client_credentials 흐름이며 관리자가 앱 권한을 사전 부여해야 합니다 (예: 에이전트 ID에 Graph 앱 역할 부여). 정책 대상은 에이전트 ID 또는 그 블루프린트입니다
   - 해설: 사람 없이 자율적으로 동작하며(스케줄·이벤트 기반 에이전트, 또는 사용자 위임이 안 맞는 백엔드 호출) 정책 대상은 에이전트 ID입니다
   - 다음 → 8
4. [처리] OBO — 사용자 토큰이 에이전트에 도착
   - 주체: 사용자
   - 데이터: 사용자 토큰(Tc)의 aud = 블루프린트 client ID (단일 인스턴스는 공유 client ID). 사용자의 원래 토큰은 다른 대상용이라 재사용할 수 없고 OBO 교환이 필요합니다
   - 해설: 사용자가 에이전트 앱에 로그인해 위임 권한 사용을 맡깁니다. 대상이 블루프린트가 아니면(예: Graph 대상 토큰) AADSTS50013으로 거부됩니다
5. [처리] OBO — 하위 토큰 발급 (주체 = 사용자, 액터 = 에이전트 ID)
   - 주체: Entra ID
   - 데이터: 요청 = client_id=에이전트 ID · client_assertion=T1 · grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer · assertion=Tc · requested_token_use=on_behalf_of · scope=하위 API scope. 위임 권한은 에이전트 ID에 직접 부여되거나 블루프린트에서 상속되며(InheritDelegatedPermissions) 지원되는 grant_type은 client_credentials · jwt-bearer · refresh_token 입니다. 백그라운드용 refresh_token 교환도 지원됩니다
   - 해설: 사용자 신원은 유지하면서 어떤 에이전트가 호출했는지 함께 기록합니다. 자식 에이전트 ID는 대화형 동의를 받을 수 없어 블루프린트의 상속 가능 권한과 관리자 동의를 미리 구성해야 합니다
   - 다음 → 8
6. [처리] 에이전트 사용자 — 블루프린트 → 에이전트 ID → 사용자 가장
   - 주체: Entra ID
   - 데이터: 블루프린트가 에이전트 ID를 대리(T1)하고, 에이전트 ID가 할당된 에이전트 사용자 계정을 가장. 코드에서는 Microsoft.Identity.Web.AgentIdentities 의 WithAgentUserIdentity(에이전트 ID client ID, UPN 또는 사용자 Object ID)를 쓰며 로그인한 사용자가 없어 빈 ClaimsPrincipal을 전달합니다
   - 해설: 사용자 개체가 필요한 서비스에서 에이전트가 자기 사용자 계정으로 동작합니다. 계정은 부모 에이전트 ID가 받은 토큰으로만 인증할 수 있습니다
7. [처리] 위임 권한 범위로 제한 — 독립 인증 불가
   - 주체: Entra ID
   - 데이터: 에이전트 ID에 할당된 위임 권한만 (예: Mail.ReadWrite · Files.ReadWrite) · 계정 단독 인증 불가 · idtyp=user 토큰. 사용자 계정을 만들어도 팀·메일함·사이트 접근 권한은 따로 부여해야 하며, 호출이 실패하면 에이전트 ID–계정 연결, 위임 권한 부여, Exchange 메일함 프로비저닝을 각각 점검합니다
   - 해설: 사용자 계정이어도 에이전트 ID에 준 범위를 넘지 못합니다
8. [판단] 해당 신원 대상 조건부 액세스 · 위험 조건을 통과하는가?
   - 주체: Entra ID
   - 위치: Entra ID › Conditional Access › Policies (에이전트 ID · 에이전트 사용자 · 사용자 정책) — 에이전트 사용자는 Assignments › Users, agents (Preview) or workload identities › Agents › All agent users / Select agent users (Preview)
   - 데이터: 에이전트 ID 정책은 에이전트 사용자에 적용되지 않고 그 반대도 마찬가지. "Users" 할당(모든 사용자·그룹·역할·외부 사용자)은 에이전트 사용자 계정을 포함하지 않으며, 에이전트 사용자 대상 조건은 Agent risk · Agent execution environments · Device platforms · Filter for devices · Network(Global Secure Access 클라이언트 필요), 제어는 Block access 또는 Require device to be marked as compliant. 에이전트 ID 정책의 제어는 Block access뿐입니다
   - 해설: 토큰의 주체마다 별도 정책이 필요하므로 패턴별로 정책을 만듭니다. 클라우드에서 직접 도는 에이전트는 기기 규정 준수 신호가 없어 차단될 수 있으므로 Agent execution environments 조건으로 엔드포인트 세션에만 적용합니다
   - 예 → 9
   - 아니오 → [차단] 차단 — 해당 주체 정책 미충족
9. [처리] 액세스 토큰 발급 — 에이전트 전용 클레임 포함
   - 주체: Entra ID
   - 데이터: xms_act_fct(액터 facet) · xms_sub_fct(주체 facet) · idtyp(사용자/앱 구분) · xms_idrel(주체와 리소스 테넌트의 관계) · azp(요청한 에이전트 ID) · oid(리소스 접근 주체) · tid
   - 해설: 액터와 주체를 구분하는 클레임이 토큰에 담깁니다. OBO 토큰은 사용자가 주체이고 에이전트 ID가 액터이며, 토큰은 에이전트 ID가 속한 테넌트 안에서만 유효합니다
10. [끝] 리소스가 토큰 검증 · 에이전트 로그 기록
   - 주체: 리소스
   - 데이터: 서명 · aud · 만료 확인 → 에이전트 클레임으로 정책 · 감사 로그 적용
   - 해설: 받는 쪽이 에이전트 호출을 식별해 별도로 통제하고 기록합니다
- 시나리오: 에이전트 ID 자체 ▸ 예 :: 에이전트 ID 자체 권한으로 통과해 토큰 발급
- 시나리오: 에이전트 ID 자체 ▸ 아니오 :: 에이전트 ID 자체 권한이 조건부 액세스에서 차단
- 시나리오: 사용자 대신 ▸ 예 :: 사용자 대신 OBO로 통과해 토큰 발급
- 시나리오: 사용자 대신 ▸ 아니오 :: 사용자 대신 OBO가 조건부 액세스에서 차단
- 시나리오: 에이전트 사용자 ▸ 예 :: 에이전트 사용자가 위임 범위로 통과해 토큰 발급
- 시나리오: 에이전트 사용자 ▸ 아니오 :: 에이전트 사용자가 위임 범위에서도 차단

> 교육 포인트: 에이전트 ID는 "에이전트 자체의 이름으로" 앱 권한을 쓰고, 에이전트 사용자는 "사용자 개체가 필요한 서비스"에서만 씁니다. 사용자 대신(OBO)에서는 사용자 정책이 함께 적용됩니다.
>
> 주의: 프로토콜은 직접 구현하지 말고 Microsoft.Identity.Web 같은 승인된 SDK를 사용하는 것이 권장됩니다.
>
> 출처: https://learn.microsoft.com/entra/agent-id/agent-autonomous-app-oauth-flow
>
> 출처: https://learn.microsoft.com/entra/agent-id/agent-tokens
>
> 출처: https://learn.microsoft.com/entra/agent-id/agent-on-behalf-of-oauth-flow
>
> 출처: https://learn.microsoft.com/entra/agent-id/agent-users
>
> 출처: https://learn.microsoft.com/entra/identity/conditional-access/agent-id

### L3 · C · 로그 · 감사 · 중지 — 에이전트 활동 추적과 차단

#### L4 · 에이전트 활동을 찾아 조사하고 필요하면 중지한다

1. [시작] 이상 징후가 보여 에이전트 활동을 조사한다
   - 주체: 관리자
   - 위치: 보안 경고 · 사용자 신고 · 에이전트 목록
   - 데이터: 에이전트 이름 · 에이전트 ID Object ID
   - 해설: 어떤 에이전트인지부터 특정합니다
2. [처리] 로그인 로그를 에이전트 유형으로 필터
   - 주체: 관리자
   - 위치: Entra ID › Monitoring & health › Sign-in logs › 필터: Agent type · Is Agent (최소 Reports Reader)
   - 데이터: Agent type = Agent ID user · Agent Identity · Agent Identity Blueprint · Not Agentic, Is Agent = Yes/No
   - 해설: 에이전트 로그인만 골라 리소스 · 시간 · 결과를 확인합니다
3. [처리] Graph로 에이전트 로그인 조회
   - 주체: 관리자
   - 위치: GET https://graph.microsoft.com/beta/auditLogs/signIns?$filter=signInEventTypes/any(t: t eq 'servicePrincipal') and agent/agentType eq 'AgentIdentity' (Graph Explorer, beta)
   - 데이터: agentSignIn 속성(agent/agentType). 이 요청은 서비스 주체 범주의 AgentIdentity 로그인만 조회하며 모든 에이전트 로그인 유형을 포함하지 않으므로, 사용자 위임·에이전트 사용자 로그인은 해당 범주의 signInEventTypes 필터를 따로 씁니다
   - 해설: 에이전트는 사용자 위임·앱 전용 모두로 로그인할 수 있어 네 가지 로그인 로그 유형에 모두 나타날 수 있습니다
4. [처리] 감사 로그에서 구성 변경 추적
   - 주체: 로그
   - 위치: Entra ID › Monitoring & health › Audit logs
   - 데이터: initiatedBy · performedBy · targetResources 의 agentType 값(notAgentic이 아니면 에이전트 관여) — 블루프린트 생성 = Add application(agenticApp), 에이전트 ID 생성 = Add service principal(agenticAppInstance), 에이전트 사용자 생성 = Add user(agentIDuser) · 수정·삭제도 Update/Delete application·service principal로 남음. blueprintId는 블루프린트 Object ID로 인스턴스를 템플릿에 연결합니다. agentIdentityBlueprintPrincipal 값도 있습니다
   - 해설: 에이전트 ID는 서비스 주체 이벤트로, 블루프린트는 애플리케이션 이벤트로, 에이전트 사용자는 사용자 이벤트로 남습니다
5. [판단] 에이전트가 예상과 다르게 동작하는가?
   - 주체: 관리자
   - 데이터: 비정상 리소스 접근 · 에이전트 위험(ID Protection) 신호 · 스폰서 확인
   - 해설: 스폰서에게 업무상 정상 동작인지 먼저 확인합니다. 보안 사고 시 스폰서가 동작의 정상 여부를 판단하고 중지·권한 조정을 승인합니다
   - 예 → 6
   - 아니오 → 8
6. [처리] 에이전트 ID를 비활성화
   - 주체: 관리자
   - 위치: Entra ID › Agents › Agent identities › {ID} › Disable (최소 Agent ID Administrator). 스폰서·소유자는 My Account 포털에서도 가능
   - 데이터: 비활성화하면 해당 에이전트의 접근과 토큰 발급이 막히고, 재활성화는 소유자 또는 관리자만 가능(스폰서는 불가). 스폰서 비활성화·소프트 삭제는 가능
   - 해설: 해당 에이전트만 즉시 멈추고 나머지는 그대로 둡니다. 어떤 범위에서든 다시 활성화하면 접근과 토큰 발급이 복원됩니다
7. [끝] 종류 전체 중지 · 권한 회수 — 블루프린트 단위
   - 주체: 관리자
   - 위치: Entra ID › Agents › Agent blueprints › {블루프린트} › Disable (멀티테넌트 블루프린트는 Disable 메뉴의 Disable in all tenants) · 접근 관리 [확인 필요: 권한 회수 화면 이름]
   - 데이터: 같은 블루프린트의 모든 에이전트 ID 영향 · 비활성화하면 새 에이전트 ID 생성이 막히고 기존 에이전트 ID도 차단됩니다. 테넌트 전체 차단은 에이전트 ID 대상 조건부 액세스(Block access)로 하며, 전체 비활성화는 기존 에이전트 장애와 Microsoft 제품 경험 저하를 일으킬 수 있어 영향 평가가 필요합니다
   - 해설: 같은 종류의 에이전트를 한 번에 중지하거나 권한을 회수합니다
8. [끝] 정상 — 정기 검토 대상으로 유지
   - 주체: 로그
   - 데이터: 스폰서 정기 검토 · 로그 보존
   - 해설: 정상이면 기록을 보관하며 스폰서 중심의 정기 확인을 이어갑니다
- 시나리오: 예 :: 에이전트가 이상 동작해 ID 비활성화와 권한 회수
- 시나리오: 아니오 :: 에이전트가 예상대로 동작해 정상 판정

> 교육 포인트: 에이전트 활동은 기존 로그 유형 안에 "에이전트 표지"를 달아 남습니다. 별도 로그를 찾기보다 기존 로그인·감사 로그에서 에이전트 필터를 씁니다.
>
> 주의: Graph 응답에 agentIdentityBlueprintPrincipal · agentIDuser 값을 받으려면 요청에 Prefer: include-unknown-enum-members 헤더가 필요합니다.
>
> 출처: https://learn.microsoft.com/entra/agent-id/sign-in-audit-logs-agents
>
> 출처: https://learn.microsoft.com/entra/agent-id/disable-agent-identities
>
> 출처: https://learn.microsoft.com/entra/agent-id/manage-agent-identities-admin
