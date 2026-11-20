#### 그룹 · identity · 포함 대상(사용자·에이전트·워크로드 ID)
- 섹션: 할당
- 선택: 다중
- 위치: 보호 › 조건부 액세스 › 정책 › 새 정책 만들기 › 할당 › 사용자, 에이전트(미리 보기) 또는 워크로드 ID (Users, agents (Preview) or workload identities) [확인 필요: 한글 UI 문구·버전별 이름 차이]
- 소개: 이 정책이 누구(사용자·그룹·역할·게스트·워크로드·에이전트)에게 적용되는지 정합니다.
- 평가: 정책 평가 2단계 중 Phase 2의 첫 단계에서 이번 로그인 토큰의 주체(subject)가 포함 대상인지 봅니다. 모든 할당은 AND로 결합되고, 포함과 제외가 겹치면 제외가 이깁니다. 그룹·역할 대상은 토큰 발급 시점에만 평가됩니다.
- 노드 제목: 대상 ID 일치?
- 노드 보조: 토큰 주체가 포함 대상이고 제외 대상이 아닌가
- 해설: 이번 로그인 주체가 정책의 포함 대상에 속하는지 보고, 제외 대상이면 정책을 건너뜁니다.
- 주체: Entra ID
- 데이터: 토큰 주체(사용자·SP·에이전트 ID·에이전트 사용자), 그룹·역할 멤버십, 사용자 유형(Guest/Member)
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-users-groups;https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-policies;https://learn.microsoft.com/en-us/entra/identity/conditional-access/agent-id

##### 옵션 · u-all · 모든 사용자
- 소개: 디렉터리의 모든 사용자(B2B 게스트 포함)를 대상으로 합니다.
- 위치: 할당 › 사용자 › 포함 › 모든 사용자(All users)
- 동작: 디렉터리 내 모든 사용자 계정이 포함 대상입니다. 모든 사용자+모든 리소스 정책을 만들면 잠금 방지 경고가 뜨고, 기본적으로 현재 관리자를 제외하는 옵션이 제공됩니다.
- 매칭: 로그인 주체가 사용자 계정이면 일치합니다. 단 '제외'에 해당하면 제외가 우선합니다. 에이전트 사용자 계정·서비스 주체는 이 선택에 포함되지 않습니다.
- 사용자 경험: 정책의 허용 컨트롤(MFA 등)이 모든 사용자에게 요구됩니다. 비상 접근 계정을 빼지 않으면 장애 때 로그인이 막힐 수 있습니다.
- 미충족 시: 사용자가 아닌 주체(서비스 주체·에이전트 사용자)나 제외된 사용자는 이 정책의 비대상입니다.
- 지원 주체: 사용자, 게스트
- 제약·주의: 에이전트 사용자 계정은 사용자 할당(모든 사용자·그룹·역할·외부 사용자 포함)으로 보호되지 않아 에이전트 정책을 따로 만들어야 합니다.
- 로그: 일치하면 정책 result가 success/failure, 불일치하면 notApplied로 기록됩니다.
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-users-groups;https://learn.microsoft.com/en-us/entra/identity/conditional-access/agent-id

##### 옵션 · u-groups · 사용자·그룹 선택
- 소개: 지정한 사용자 또는 그룹(중첩 포함)만 대상으로 합니다.
- 위치: 할당 › 사용자 › 포함 › 사용자 및 그룹 선택(Select users and groups) › 사용자 및 그룹
- 동작: 모든 유형의 Entra 사용자 그룹(동적·할당, 보안·배포)을 고르고 중첩 사용자·그룹에도 적용됩니다. 그룹·역할 대상은 토큰 발급 시점에만 평가되어 새로 추가된 사용자는 새 토큰을 받기 전까지 정책이 적용되지 않습니다.
- 매칭: 로그인 사용자가 선택한 사용자이거나 선택한 그룹의 직·간접(중첩) 멤버일 때 일치합니다.
- 사용자 경험: 대상 그룹 구성원만 추가 컨트롤을 요구받고, 그룹 밖 사용자는 이 정책의 영향이 없습니다.
- 미충족 시: 선택한 사용자·그룹에 속하지 않으면 이 정책은 적용되지 않습니다.
- 지원 주체: 사용자, 게스트
- 제약·주의: 직접 추가 가능한 개별 사용자 수에 한도가 있어 그룹 사용을 권장합니다. 2048개 초과 그룹에 속한 사용자는 접근이 막힐 수 있습니다. 서비스 주체가 든 그룹은 서비스 주체에 강제되지 않습니다.
- 로그: 일치 여부에 따라 success/failure 또는 notApplied가 기록됩니다.
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-users-groups;https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-policies

##### 옵션 · u-roles · 디렉터리 역할
- 소개: 선택한 기본 제공 디렉터리 역할이 할당된 사용자를 대상으로 합니다.
- 위치: 할당 › 사용자 › 포함 › 사용자 및 그룹 선택 › 디렉터리 역할(Directory roles)
- 동작: 특정 기본 제공 역할을 가진 관리자에게 더 엄격한 정책을 적용할 때 씁니다. 폐기 표시된 일부 역할도 선택할 수 있습니다. 역할 대상도 토큰 발급 시점에만 평가되므로 PIM 활성화 시점에 평가를 유도하는 것이 모범 사례입니다.
- 매칭: 로그인 사용자에게 선택한 기본 제공 역할이 할당돼 있고 토큰이 새로 발급될 때 일치합니다.
- 사용자 경험: 역할을 가진 관리자는 일반 사용자와 다른(더 강한) 컨트롤을 요구받습니다.
- 미충족 시: 역할이 없거나 이미 유효한 토큰이 있으면 정책이 소급 적용되지 않습니다.
- 지원 주체: 사용자
- 제약·주의: 관리 단위 범위 역할과 사용자 지정(custom) 역할은 지원되지 않습니다. 기본 제공 역할만 선택합니다.
- 로그: 일치 여부에 따라 success/failure 또는 notApplied.
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-users-groups;https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-policies

##### 옵션 · u-guests · 게스트·외부 사용자
- 소개: 게스트·외부 사용자 유형(6종)과 테넌트를 골라 대상으로 합니다.
- 위치: 할당 › 사용자 › 포함 › 사용자 및 그룹 선택 › 게스트 또는 외부 사용자(Guest or external users)
- 동작: B2B 협업 게스트·멤버, B2B 직접 연결, 로컬 게스트, 서비스 공급자(CSP), 기타 외부 사용자 중 복수 선택하고 특정 테넌트 또는 모든 테넌트로 한정합니다. 정책은 리소스 테넌트가 관리합니다.
- 매칭: 로그인 사용자가 선택한 외부 사용자 유형이고(필요하면 지정한 홈 테넌트 소속) 일치합니다. 사용자 개체의 UserType 등으로 분류됩니다.
- 사용자 경험: 게스트는 MFA·약관 등 컨트롤을 리소스 테넌트에서 요구받고, 홈 테넌트 MFA 신뢰 설정이 있으면 재프롬프트가 줄어듭니다.
- 미충족 시: 선택하지 않은 외부 유형이나 내부 멤버는 비대상입니다.
- 지원 주체: 게스트
- 제약·주의: 승인된 클라이언트 앱·앱 보호·암호 변경은 외부 사용자에게 미지원, 약관은 B2B 협업만 지원합니다. MFA·준수 디바이스는 교차 테넌트 인바운드 신뢰 설정이 필요합니다.
- 로그: 일치 여부에 따라 success/failure 또는 notApplied.
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-users-groups;https://learn.microsoft.com/en-us/entra/external-id/authentication-conditional-access

##### 옵션 · u-workload · 워크로드 ID(서비스 주체)
- 소개: 내 테넌트의 단일 테넌트 서비스 주체를 대상으로 합니다.
- 위치: 할당 › 사용자 또는 워크로드 ID › 적용 대상 › 워크로드 ID › 포함 › 서비스 주체 선택(Select service principals)
- 동작: 서비스 주체가 토큰을 요청할 때 평가합니다. 허용된 IP 범위 밖 차단, ID Protection 서비스 주체 위험 기반 차단, 인증 컨텍스트 조합에 쓰입니다. 대상 리소스는 모든 리소스로 두고 컨트롤은 차단만 가능합니다.
- 매칭: 토큰을 요청하는 서비스 주체가 포함 목록의 개체 ID(엔터프라이즈 앱의 Object ID)일 때 일치합니다.
- 사용자 경험: 비대화형이라 프롬프트가 없고 조건 위반 시 토큰 요청이 차단됩니다(서비스 주체 로그인 로그의 실패 사유 'blocked by Conditional Access').
- 미충족 시: 선택하지 않은 서비스 주체, 멀티 테넌트·타사 SaaS 앱, 관리 ID는 정책 대상이 아닙니다.
- 지원 주체: 워크로드 ID
- 제약·주의: Workload ID Premium 라이선스 필요(없으면 기존 정책은 동작하나 수정 불가). 서비스 주체가 든 그룹에 정책을 걸어도 강제되지 않아 직접 지정해야 합니다.
- 로그: 로그인 로그 › 서비스 주체 로그인 › 조건부 액세스·보고 전용 탭에서 확인합니다.
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/workload-identity;https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-users-groups

##### 옵션 · u-agents · 에이전트 ID(Agent ID)
- 소개: 에이전트 ID·에이전트 사용자·에이전트 블루프린트를 대상으로 합니다(미리 보기).
- 위치: 할당 › 사용자, 에이전트(미리 보기) 또는 워크로드 ID › 적용 대상 › 에이전트(Agents) › 모든 에이전트 ID / 모든 에이전트 사용자 / 에이전트 ID 선택 / 에이전트 사용자 선택
- 동작: 토큰 주체가 에이전트 ID(앱 전용 흐름)이거나 에이전트 사용자 계정일 때 평가합니다. 블루프린트를 지정하면 그 파생 에이전트 ID 전체와 이후 생성분에 적용됩니다. 사용자 대신(OBO) 호출은 에이전트가 아니라 사용자 정책이 적용됩니다.
- 매칭: 토큰 주체가 선택한 에이전트 ID/에이전트 사용자(또는 속성 일치·블루프린트 소속)일 때 일치합니다. 에이전트 ID 정책은 에이전트 사용자에게, 반대로도 적용되지 않습니다.
- 사용자 경험: 대화형 단계가 없어 컨트롤은 차단 중심입니다(에이전트 ID는 차단만, 에이전트 사용자는 차단 또는 준수 디바이스 요구).
- 미충족 시: OBO 요청·사용자 계정·선택 밖 에이전트는 이 정책의 비대상입니다. 보안 기본값 사용 시 정책이 적용되지 않습니다.
- 지원 주체: 에이전트
- 제약·주의: 미리 보기. Agent 365 또는 M365 E7 라이선스 필요(위험 기반은 Entra P2/M365 E5). 사용 가능한 조건: 에이전트 위험, 에이전트 사용자는 실행 환경·플랫폼·디바이스 필터·네트워크 추가. 에이전트 사용자 그룹 기반 포함·제외는 미지원.
- 로그: 일반 정책과 같은 result 값(success/failure/notApplied, reportOnly*)으로 기록됩니다.
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/agent-id;https://learn.microsoft.com/en-us/entra/identity/conditional-access/howto-target-agent-identities;https://learn.microsoft.com/en-us/entra/identity/conditional-access/policy-autonomous-agents;https://learn.microsoft.com/en-us/entra/identity/conditional-access/policy-agent-user
