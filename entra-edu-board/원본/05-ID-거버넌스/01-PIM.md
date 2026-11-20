## L2 · PIM — 관리자 역할 JIT 활성화

- 설정(Control Plane): 역할 설정(정책) | 활성화 MFA · 승인 · 최대 시간 · 사유 · 할당 유형
- 강제(Enforcement): Entra 역할 할당 평가 (적격 → 활성) | 기한이 끝나면 활성 할당 자동 제거
- 증적(Evidence): 감사 로그 RoleManagement | GET /v1.0/roleManagement/directory/roleAssignmentScheduleRequests
- 메뉴(Admin Center): ID 거버넌스 > Privileged Identity Management
- 라이선스(License): Entra ID P2 또는 Entra ID Governance (적격·기간 제한 할당 대상, 승인자, 검토 대상·검토자 사용자)

### L3 · 0 · 기능 상태 전이 — 상시 할당 → 역할 설정 + 적격 할당 → JIT 활성화

#### L4 · ⓪ 비활성 — 관리자 역할이 영구 활성으로 할당된 상태

1. [시작] 관리자에게 역할 영구 할당 — Active (permanent)
   - 주체: 관리자
   - 위치: entra.microsoft.com › ID(Identity) › 역할 및 관리자(Roles & admins) › 역할 이름 선택(체크 표시 말고 이름 클릭) › 할당 추가(Add assignments) — 최소 Privileged Role Administrator · P2/PIM 테넌트는 화면이 PIM 흐름으로 이어질 수 있음
   - 데이터: roleAssignment (principalId · roleDefinitionId · directoryScopeId=/ 는 테넌트 전체 범위) · 만료일 없는 영구(permanent) 할당 · 대상은 사용자·그룹(역할 할당 가능 그룹만 표시)·에이전트 ID · 포털 외에 PowerShell로도 만들 수 있음
   - 해설: 역할이 만료 없이 항상 활성 상태로 붙어 있습니다. 게스트에게 내장 역할을 주면 멤버 사용자와 같은 권한이 됩니다
2. [처리] 로그인만 하면 언제나 관리자 권한 유효
   - 주체: Entra ID
   - 위치: 로그인 때 발급되는 액세스 토큰의 wids 클레임
   - 데이터: wids = 사용자에게 테넌트 전체 범위로 할당된 역할의 RoleTemplateID GUID 배열 · 비게스트 계정에는 역할이 아닌 값 b79fbf4d-3ef9-4689-8143-76b194e85509 가 항상 함께 들어감 · 암시적 허용 흐름(implicit grant)으로 받은 토큰에는 wids가 없을 수 있음
   - 해설: 활성화 절차가 없어 필요 없는 시간에도 권한이 토큰에 실립니다. 앱이 wids로 관리자 여부를 판단하면 이 토큰만으로 권한이 인정됩니다
3. [처리] 사유·승인·추가 인증 없이 관리 작업 수행
   - 주체: 관리자
   - 위치: Entra 관리 센터 · Microsoft Graph(https://graph.microsoft.com) · PowerShell
   - 데이터: AuditLogs에는 수행한 작업이 남지만 활성화 요청이 없으므로 justification · ticketInfo 같은 사전 사유 필드는 없음 · PIM은 이미 활성인 할당에 사용 시점 MFA를 강제할 수 없음
   - 해설: 누가 어떤 이유로 권한을 썼는지 사전 근거가 남지 않고, 사용 시점에 걸 수 있는 추가 관문(MFA·승인)도 없습니다
4. [처리] 자격 증명 탈취나 세션 탈취가 발생
   - 주체: 외부
   - 위치: 공격자의 임의 기기·세션 (활성화 창·승인 흐름을 거치지 않음)
   - 데이터: 탈취된 관리자 계정 토큰 · 세션 쿠키 · 영구 활성 할당이라 활성화 때 적용되는 MFA·승인·인증 컨텍스트 규칙이 한 번도 평가되지 않음
   - 해설: 공격자가 별도 관문 없이 곧바로 관리자 권한을 사용합니다. 적격 할당이었다면 탈취한 계정도 활성화(MFA·사유·승인)를 거치기 전에는 그 역할의 권한을 쓸 수 없습니다
5. [끝] 상시 권한 계정마다 노출 면적이 항상 열려 있음
   - 주체: 로그
   - 위치: Graph roleAssignmentScheduleInstance 또는 roleAssignment 로 현황 점검 (둘은 PIM 밖에서 만든 영구 활성 할당도 포함)
   - 데이터: 영구 할당 수 = 탈취 시 즉시 악용 가능한 계정 수 · 비상 액세스 계정(영구 활성 Global Administrator)은 의도적 예외로 따로 관리
   - 해설: 권한이 필요한 순간이 아니라 항상 위험에 노출됩니다. 전환 대상은 비상 액세스 계정을 제외한 상시 관리자 계정입니다

#### L4 · ① 구성 — 역할 설정을 정하고 적격(Eligible) 할당을 만든다

1. [시작] 관리자가 PIM에서 Microsoft Entra 역할을 연다
   - 주체: 관리자
   - 위치: entra.microsoft.com › ID 거버넌스(ID Governance) › Privileged Identity Management › Microsoft Entra 역할(Microsoft Entra roles) › 역할(Roles) (최소 Privileged Role Administrator)
   - 데이터: 로그인 관리자의 역할 할당 · 역할 목록에는 내장·사용자 지정 역할이 모두 표시됨 · PIM은 Entra 역할 · Azure 리소스 · 그룹(PIM for Groups) 세 공급자로 나뉨
   - 해설: 역할 설정을 바꾸려면 Privileged Role Administrator 이상이 필요합니다. 적격·기간 제한 할당 대상, 승인자 등은 Entra ID P2 또는 ID Governance 라이선스가 필요합니다
2. [처리] 설정할 역할 선택 후 역할 설정 편집
   - 주체: 관리자
   - 위치: Microsoft Entra 역할 › 역할 › {역할} › 역할 설정(Role settings) › 편집(Edit) › 설정 후 업데이트(Update)
   - 데이터: roleManagementPolicy (역할마다 하나, 정책당 사전 정의 규칙 17개) + roleManagementPolicyAssignment (정책을 역할에 연결) · PIM 역할 설정 = PIM 정책
   - 해설: 역할 설정은 역할마다 독립이라 같은 역할의 모든 할당이 같은 규칙을 따릅니다. 다른 역할의 설정에는 영향이 없습니다
3. [처리] 활성화 최대 기간 지정
   - 주체: 관리자
   - 위치: 역할 설정 › 편집 › 활성화 › 활성화 최대 기간(Activation maximum duration) 슬라이더
   - 데이터: 1~24시간 범위의 값 (정책 규칙 Expiration_EndUser_Assignment · Graph: PATCH /v1.0/policies/roleManagementPolicies/{정책 ID}/rules/Expiration_EndUser_Assignment 의 maximumDuration, 예: PT1H45M)
   - 해설: 활성화한 역할이 최대 몇 시간 유지되는지 정합니다. 기간이 끝나면 활성 할당이 몇 초 안에 제거됩니다
4. [처리] 활성화 시 MFA 또는 CA 인증 컨텍스트 요구
   - 주체: 관리자
   - 위치: 편집 › 활성화 › On activation, require multifactor authentication 또는 require Microsoft Entra Conditional Access authentication context
   - 데이터: 인증 컨텍스트 ID (예: c1) — 대응 CA 정책이 있어야 함 · 규칙 ID: MFA는 Enablement_EndUser_Assignment 의 MultiFactorAuthentication, 인증 컨텍스트는 AuthenticationContext_EndUser_Assignment (미리 보기) · 인증 강도(Authentication Strengths)와 함께 쓰면 로그인 때와 다른 방법(예: Authenticator 암호 없는 로그인)을 활성화에 요구할 수 있음
   - 해설: 활성화 순간에 더 강한 인증을 거치게 합니다. 인증 컨텍스트를 쓰려면 CA 정책을 먼저 만들고 켠 뒤 PIM에 지정합니다. 세션에서 이미 강한 인증이나 MFA를 마쳤다면 다시 묻지 않을 수 있으며, 활성화마다 재인증을 강제하려면 그 CA 정책의 세션 제어 로그인 빈도를 매번(Every time)으로 둡니다. 한 번 재인증하면 10분 동안은 다른 역할 활성화에서 다시 묻지 않습니다(Entra 역할·Azure 리소스 역할·PIM for Groups 공통)
5. [처리] 사유·티켓 정보 필수로 지정
   - 주체: 관리자
   - 위치: 편집 › 활성화 › Require justification on activation · Require ticket information on activation
   - 데이터: 활성화 요청의 justification · ticketInfo (ticketNumber · ticketSystem) · 규칙 Enablement_EndUser_Assignment 의 enabledRules 에 Justification · Ticketing 포함 · 티켓 번호는 입력 필수일 뿐 외부 티켓 시스템과 대조하지 않음
   - 해설: 왜 필요한지를 요청마다 남기게 합니다. 사유 입력은 활성화 창의 Reason 칸에서 이뤄집니다
6. [처리] 승인 요구와 승인자 지정
   - 주체: 관리자
   - 위치: 편집 › 활성화 › Require approval to activate › 승인자 선택
   - 데이터: Approval_EndUser_Assignment 규칙 · 승인자 사용자·그룹 (2명 이상 권장, 승인자에게 별도 역할은 필요 없음) · 승인 시한 24시간은 변경 불가
   - 해설: 승인자를 지정하지 않으면 활성 Privileged Role Administrator·Global Administrator가 기본 승인자입니다. 이 둘이 모두 적격뿐이고 승인자도 없으면 테넌트 잠금이 생길 수 있어 비상 액세스 계정과 구체적 승인자를 둡니다
7. [처리] 할당 기간 규칙 지정
   - 주체: 관리자
   - 위치: 편집 › 할당(Assignment) › 적격: 영구 적격 허용(Allow permanent eligible assignment) / 적격 할당 만료(Expire eligible assignment after) · 활성: 영구 활성 허용(Allow permanent active assignment) / 활성 할당 만료(Expire active assignment after) · 활성 할당 시 MFA 요구 · 활성 할당 시 사유 요구
   - 데이터: 적격·활성 할당의 최대 기간 기본값 · Graph 규칙 ID: Expiration_Admin_Eligibility · Expiration_Admin_Assignment · Enablement_Admin_Assignment (활성 할당 생성 시 MFA·사유)
   - 해설: 할당을 만들 때 적용되는 기본 최대 기간과 활성 할당 시 MFA·사유 요구를 정합니다. 활성 할당은 만들 때 한 번만 MFA를 요구할 수 있고, 이후 사용 시점에는 PIM이 MFA를 강제하지 못합니다. 종료일이 있는 할당은 Global Administrator·Privileged Role Administrator가 갱신하거나 사용자가 연장·갱신을 요청할 수 있습니다
8. [처리] 알림 수신자 지정
   - 주체: 관리자
   - 위치: 편집 › 알림(Notifications) 탭 (기본 수신자 확인란 · 추가 수신자 · 중요 메일만(Critical emails only))
   - 데이터: 이메일 종류별 수신자 — 이벤트 한 건당 최대 1000명(초과분은 앞의 1000명만 수신, 권한 사용에는 영향 없음) · 추가 수신자 여러 명은 세미콜론(;)으로 구분 · 규칙 ID: 적격 할당 Notification_Admin/Requestor/Approver_Admin_Eligibility, 활성 할당 …_Admin_Assignment, 활성화 …_EndUser_Assignment
   - 해설: 활성화·할당 이벤트 메일을 누구에게 보낼지 조정합니다. 기본 수신자 확인란을 지우고 주소를 비우면 해당 메일을 끌 수 있고, 중요 메일만을 고르면 즉시 조치가 필요한 메일(예: 연장 요청 승인)만 보내고 연장 안내 메일은 보내지 않습니다
9. [처리] 적격 할당 추가
   - 주체: 관리자
   - 위치: Microsoft Entra 역할 › 역할 › 할당 추가(Add assignments) › 역할 선택(Select a role)·멤버 선택 › 다음 › 멤버 자격 설정(Membership settings) › 할당 유형(Assignment type) = 적격(Eligible) › 시작·종료 날짜 및 시간 › 할당(Assign)
   - 데이터: roleEligibilityScheduleRequest (action=adminAssign) · Graph: POST /v1.0/roleManagement/directory/roleEligibilityScheduleRequests (v1.0, 요청 본문에 principalId · roleDefinitionId · directoryScopeId · scheduleInfo · justification) · 영구(종료일 없음) 또는 기간 제한
   - 해설: 역할은 사용자에게 할당되지만 평소에는 사용하지 않고, 필요할 때 활성화해서 씁니다. 활성화하기 전에는 그 권한을 사용할 수 없습니다. 할당은 5분 미만으로 만들 수 없고 만든 지 5분 안에는 제거할 수 없습니다
10. [끝] 업데이트 저장 — 정책 변경이 감사 로그로 남음
   - 주체: 로그
   - 위치: 역할 설정 › 업데이트 · 확인은 Microsoft Entra 역할 › 리소스 감사(Resource audit) — 열람 가능 역할: Global Administrator · Global Reader · Privileged Role Administrator · Security Administrator · Security Reader
   - 데이터: PIM 정책 변경 · 할당 추가 기록 (보관 30일) · 활동 예: Update role setting in PIM · 장기 보관은 진단 설정으로 Azure Monitor(Log Analytics·스토리지)에 전송
   - 해설: 설정이 저장되고 누가 무엇을 바꿨는지 감사 기록에 남습니다. 본인 활동만 보려면 내 감사(My audit)를 씁니다

#### L4 · ② 활성 — 필요할 때만 활성화하고 기한이 끝나면 해제된다

1. [시작] 적격 사용자가 내 역할에서 활성화 선택
   - 주체: 사용자
   - 위치: ID 거버넌스 › Privileged Identity Management › 내 역할(My roles) › Microsoft Entra 역할 › 목록에서 역할 찾아 활성화(Activate) · 대안: My Access 포털(myaccess.microsoft.com › Roles › Entra roles, 미리 보기) · Azure 모바일 앱(PIM 카드 › My Microsoft Entra roles, P2 또는 EMS E5 라이선스 필요)
   - 데이터: 적격 할당 목록 (roleEligibilitySchedule) · Graph: GET /v1.0/roleManagement/directory/roleEligibilityScheduleRequests/filterByCurrentUser(on='principal') — 그룹 멤버십으로 얻은 적격 할당은 반환되지 않음
   - 해설: 사용자가 권한이 필요한 시점에 직접 활성화를 시작합니다. 활성화한 역할을 쓰기 전에 요청 상태는 내 요청(My requests)에서 확인할 수 있습니다
2. [처리] Entra ID가 역할 정책을 읽어 요구 사항 확인
   - 주체: Entra ID
   - 데이터: roleManagementPolicy 규칙 (인증 · 사유 · 티켓 · 승인 · 만료) — Enablement_EndUser_Assignment · AuthenticationContext_EndUser_Assignment · Approval_EndUser_Assignment · Expiration_EndUser_Assignment
   - 해설: 역할 설정에 정해 둔 요구가 무엇인지 평가합니다. 평가 대상은 요청한 그 역할에 연결된 정책 하나뿐입니다
3. [판단] MFA 또는 인증 컨텍스트 요구를 충족했는가?
   - 주체: Entra ID
   - 위치: 활성화 창 › Additional verification required 선택 후 인증 · 마치면 Activate before proceeding · 인증 컨텍스트가 있으면 "A Conditional Access policy is enabled and may require additional verification" 안내 후 CA 정책 평가
   - 데이터: 세션의 MFA 클레임 (세션 안에서 한 번 인증했으면 다시 요구하지 않을 수 있음) · Graph로 본인 활성화를 요청하려면 MFA를 거친 세션에서만 호출 가능
   - 해설: 요구한 인증을 마쳐야 다음 단계로 갑니다
   - 예 → 4
   - 아니오 → [차단] 차단 — 추가 인증을 완료하지 못해 활성화 불가
4. [처리] 사유·티켓·범위·시작 시각 입력
   - 주체: 사용자
   - 위치: 활성화 창 › Scope(필요한 최소 리소스로 범위 축소) · 사용자 지정 시작 시간 · Reason
   - 데이터: roleAssignmentScheduleRequest (action=selfActivate · justification · ticketInfo · scheduleInfo) · Graph: POST /v1.0/roleManagement/directory/roleAssignmentScheduleRequests, 필요 권한 RoleAssignmentSchedule.ReadWrite.Directory, 기간은 scheduleInfo.expiration (type=afterDuration, 예: PT5H) · 시작 시각을 미래로 지정하면 예약 활성화
   - 해설: 가능한 한 적은 범위와 짧은 기간으로 요청하는 것이 모범 사례입니다. 예약 활성화는 실제 활성화 시점에 CorrelationId가 새로 만들어져 요청 때와 다를 수 있습니다
5. [판단] 승인이 필요한 역할인가?
   - 주체: Entra ID
   - 위치: 승인 요구 역할은 활성화 후 화면 우측 상단에 "승인 대기" 알림 · 내 요청(My requests)에서 Request Status 확인 · 불필요하면 취소(Cancel)
   - 데이터: Approval_EndUser_Assignment 규칙의 승인 요구 여부 · 요청 status=PendingApproval 일 때 approvalId 가 부여됨
   - 해설: 승인 요구가 있으면 요청이 PendingApproval 상태로 대기합니다. 취소하면 새 요청을 다시 제출해야 합니다
   - 예 → 6
   - 아니오 → 7
6. [판단] 승인자가 24시간 안에 승인했는가?
   - 주체: 관리자
   - 위치: ID 거버넌스 › Privileged Identity Management › 요청 승인(Approve requests) › 역할 활성화 요청(Requests for role activations)
   - 데이터: 승인 대기 요청 status=PendingApproval · 승인 시한 24시간 (변경 불가) · 승인 응답은 Graph beta roleAssignmentApprovals (다단계 승인·연장/갱신 승인은 Graph 미지원)
   - 해설: 승인자는 본인 요청을 승인할 수 없고 서비스 주체도 승인할 수 없습니다. 시한을 넘기면 사용자가 다시 제출합니다
   - 예 → 7
   - 아니오 → [차단] 거부·만료 — 새로 요청해야 활성화 가능
7. [처리] 활성 할당을 생성
   - 주체: Entra ID
   - 데이터: roleAssignmentScheduleRequest 처리 결과(selfActivate 응답 예시는 status=Granted) → 새 활성 할당 roleAssignmentSchedule + roleAssignmentScheduleInstance 생성 (적격 할당 인스턴스는 그대로 남음)
   - 해설: 활성화 결과로 한시적인 활성 상태가 몇 초 안에 만들어져 사용자가 그 역할의 권한을 쓸 수 있게 됩니다. 관리자가 처음부터 활성으로 할당한 것(assignmentType = Assigned)과 달리 적격 할당을 근거로 만들어진 것이라 assignmentType = Activated로 구분되고 활성화 기간이 끝나면 사라집니다. 시작 시각을 미래로 지정했다면 그 시각에 만들어집니다
8. [처리] 사용자가 활성화된 권한으로 작업
   - 주체: 사용자
   - 위치: 관리 포털 · Microsoft Graph · 해당 서비스 앱 · 반영이 안 보이면 로그아웃 후 재로그인
   - 데이터: 새 토큰의 wids 클레임 (앱 캐시로 반영이 늦을 수 있음) · 활성화 후 5분이 지나야 비활성화(Deactivate) 가능 · Graph 비활성화는 action=selfDeactivate
   - 해설: 일부 앱은 이전에 권한 없음으로 캐시해 반영이 잠시 늦을 수 있고, 비활성화 뒤에도 캐시 때문에 접근이 남을 수 있습니다. 앱 구조에 따라 다릅니다
9. [끝] 기한 만료 후 자동 비활성 + 감사 기록
   - 주체: 로그
   - 위치: 확인은 AuditLogs — 서비스 PIM · 범주 RoleManagement · 포털은 Microsoft Entra 역할 › 리소스 감사 / 내 감사
   - 데이터: 활동 Add member to role requested (PIM activation) · request approved / denied (PIM activation) · PIM activation request expired · Remove member from role (PIM activation expired) · Remove member from role completed (PIM deactivate) · 활성화 주기 추적은 AdditionalDetails 의 roleAssignmentRequestId (CorrelationId는 예약·승인 때 달라질 수 있음) · KQL: AuditLogs | where OperationName has "Add member to role"
   - 해설: 정한 시간이 끝나면 활성 할당이 제거되고 활성화 기록이 감사 로그에 남습니다
- 시나리오: 예 ▸ 예 ▸ 예 :: 승인까지 받아 활성화 후 기한 만료로 자동 해제
- 시나리오: 예 ▸ 예 ▸ 아니오 :: 승인자가 24시간 안에 승인하지 않아 거부·만료
- 시나리오: 예 ▸ 아니오 :: 승인 없는 역할이라 바로 활성화 후 자동 해제
- 시나리오: 아니오 :: MFA·인증 컨텍스트 요구를 못 채워 차단

> 교육 포인트: PIM은 권한을 없애는 기능이 아니라 "필요할 때만, 근거와 함께" 갖게 하는 기능입니다. 적격 할당은 할당만 되어 있고, 활성화하기 전에는 그 권한을 사용할 수 없습니다.
>
> 주의: 승인을 요구하면서 승인자를 지정하지 않고, 모든 Privileged Role Administrator·Global Administrator가 적격 상태뿐이면 테넌트 잠금이 생길 수 있습니다. 비상 액세스 계정과 구체적 승인자를 반드시 지정합니다.
>
> 예시: Exchange 관리자 역할을 적격으로 두고 활성화 최대 기간 4시간 · 사유 필수 · MFA 요구로 설정합니다.
>
> 출처: https://learn.microsoft.com/entra/id-governance/privileged-identity-management/pim-how-to-change-default-settings
>
> 출처: https://learn.microsoft.com/entra/id-governance/privileged-identity-management/pim-how-to-activate-role
>
> 출처: https://learn.microsoft.com/entra/id-governance/licensing-fundamentals
>
> 출처: https://learn.microsoft.com/entra/id-governance/privileged-identity-management/pim-how-to-use-audit-log
>
> 출처: https://learn.microsoft.com/entra/id-governance/privileged-identity-management/pim-apis
>
> 출처: https://learn.microsoft.com/graph/identity-governance-pim-rules-overview
>
> 출처: https://learn.microsoft.com/graph/how-to-pim-update-rules
>
> 출처: https://learn.microsoft.com/graph/api/rbacapplication-post-roleassignmentschedulerequests
>
> 출처: https://learn.microsoft.com/entra/identity/role-based-access-control/manage-roles-portal
>
> 출처: https://learn.microsoft.com/entra/identity-platform/access-token-claims-reference

### L3 · A · 역할 설정 — 활성화 요구 사항이 정책으로 저장되는 방식

#### L4 · 역할 설정은 정책 객체 — 활성화 시 규칙이 평가된다

1. [시작] 역할 하나에 정책 하나가 연결됨
   - 주체: Entra ID
   - 위치: PIM › Microsoft Entra 역할 › 역할 › {역할} › 역할 설정 · 관리: 최소 Privileged Role Administrator (Graph 위임 권한 RoleManagementPolicy.ReadWrite.Directory)
   - 데이터: roleManagementPolicyAssignment (역할 ↔ roleManagementPolicy) · 정책 하나에 사전 정의 규칙 17개(활성화 · 할당 · 알림 3범주) · 그룹용 정책은 권한 RoleManagementPolicy.ReadWrite.AzureADGroup
   - 해설: 역할 설정은 Graph에서 정책 아래의 규칙(rules)으로 표현됩니다. 규칙마다 ID가 고정이라 포털 항목과 1:1로 대응합니다
2. [처리] 관리자가 정책과 규칙을 조회
   - 주체: 관리자
   - 위치: GET /v1.0/policies/roleManagementPolicies?$filter=scopeId eq '/' and scopeType eq 'DirectoryRole'&$expand=rules
   - 데이터: unifiedRoleManagementPolicy · rules 컬렉션 · 규칙을 고칠 때는 PATCH .../policies/roleManagementPolicies/{정책 ID}/rules/{규칙 ID} 이며 본문에 파생 형식의 @odata.type 을 반드시 포함
   - 해설: 포털 설정값이 어떤 규칙으로 저장됐는지 API로 확인할 수 있습니다. 수정 권한은 RoleManagementPolicy.ReadWrite.Directory 이고 최소 역할은 Privileged Role Administrator 입니다
3. [처리] 활성화 관련 규칙 묶음 읽기
   - 주체: Entra ID
   - 데이터: Enablement_EndUser_Assignment (enabledRules: MultiFactorAuthentication · Justification · Ticketing) · Approval_EndUser_Assignment · Expiration_EndUser_Assignment (maximumDuration) · AuthenticationContext_EndUser_Assignment · 모두 호출자 = End user
   - 해설: 활성화 요청이 들어오면 이 규칙들을 함께 평가합니다
4. [판단] 인증 컨텍스트가 설정돼 있는가?
   - 주체: Entra ID
   - 데이터: AuthenticationContext_EndUser_Assignment 규칙 (claimValue 예: c1 · 미리 보기 표기)
   - 해설: 인증 컨텍스트가 있으면 CA 정책이 활성화 요구를 정의합니다. 이 경우 CA 정책을 관리할 수 있는 주체가 활성화 요구를 바꾸거나 막을 수 있습니다
   - 예 → 5
   - 아니오 → 6
5. [판단] 해당 컨텍스트를 대상으로 하는 CA 정책이 있는가?
   - 주체: Entra ID
   - 위치: 보호 › 조건부 액세스 › 정책 (클라우드 앱 또는 작업 › 인증 컨텍스트)
   - 데이터: 정책 범위는 모든 사용자 또는 적격 사용자 — 역할과 컨텍스트를 한 정책에 함께 지정하지 않음
   - 해설: 대상 CA 정책이 없으면 안전장치로 MFA 요구가 적용됩니다. 정책이 꺼져 있거나 보고 전용이거나 적격 사용자가 정책에서 제외돼 있으면 이 장치가 작동하지 않습니다
   - 예 → 7
   - 아니오 → 6
6. [처리] 활성화 MFA만 요구
   - 주체: Entra ID
   - 위치: 역할 설정 › On activation, require multifactor authentication
   - 데이터: Enablement_EndUser_Assignment 의 MultiFactorAuthentication · 세션에서 이미 강한 자격 증명이나 MFA를 마쳤다면 다시 묻지 않을 수 있음
   - 해설: 강한 방식을 강제하지는 않고 MFA 수행 여부만 확인합니다. 활성화 때 로그인과 다른 방법을 반드시 쓰게 하려면 인증 컨텍스트와 인증 강도를 씁니다
   - 다음 → 8
7. [처리] CA 정책 요구를 활성화 때 충족시킴
   - 주체: 사용자
   - 위치: 활성화 창 — "A Conditional Access policy is enabled and may require additional verification" 안내 후 재인증
   - 데이터: 인증 강도 · 준수 기기 · 사용 약관 등 CA 부여 통제
   - 해설: 예를 들어 Windows Hello로 로그인한 사용자에게 활성화 때 Authenticator 암호 없는 로그인을 요구할 수 있습니다. 한 번 충족하면 같은 세션의 다음 활성화에는 다시 요구하지 않을 수 있습니다
8. [끝] 활성화 후 세션은 별도 CA 정책으로 통제
   - 주체: Entra ID
   - 위치: 보호 › 조건부 액세스 › 정책 › 디렉터리 역할 대상 정책
   - 데이터: 인증 컨텍스트 정책은 활성화 시점만 보장 — 활성화 후 다른 기기·세션 사용은 막지 못함 · 정책 두 개: ① 인증 컨텍스트 대상(모든 사용자 또는 적격 사용자) ② 디렉터리 역할 대상 · 대안은 적격 사용자 자체를 대상으로 한 CA 정책(예: 항상 Intune 준수 기기)
   - 해설: 활성화 이후의 접근까지 막으려면 디렉터리 역할을 대상으로 한 CA 정책을 하나 더 둡니다. 두 정책의 요구는 같게도 다르게도 설계할 수 있습니다
- 시나리오: 예 ▸ 예 :: 컨텍스트 대상 CA 정책이 있어 활성화 때 충족
- 시나리오: 예 ▸ 아니오 :: 컨텍스트만 있고 CA 정책이 없어 활성화 MFA만 요구
- 시나리오: 아니오 :: 컨텍스트가 없어 활성화 MFA만 요구

> 교육 포인트: 인증 컨텍스트 CA 정책은 "활성화 순간"의 요구이고, 역할을 대상으로 한 CA 정책은 "활성화 이후 사용"의 요구입니다. 둘을 같이 설계합니다.
>
> 주의: CA 정책을 관리할 수 있는 역할(조건부 액세스 관리자·보안 관리자)은 활성화 요구를 바꾸거나 막을 수 있어 고권한으로 취급합니다.
>
> 출처: https://learn.microsoft.com/entra/id-governance/privileged-identity-management/pim-how-to-change-default-settings
>
> 출처: https://learn.microsoft.com/graph/identity-governance-pim-rules-overview
>
> 출처: https://learn.microsoft.com/graph/how-to-pim-update-rules

### L3 · B · 적격 할당 · 활성 할당 — 만드는 방식과 기간

#### L4 · 할당 추가에서 유형과 기간을 고른다

1. [시작] 관리자가 할당 추가를 시작
   - 주체: 관리자
   - 위치: ID 거버넌스 › Privileged Identity Management › Microsoft Entra 역할 › 역할 › 할당 추가
   - 데이터: 로그인 관리자 역할 = 최소 Privileged Role Administrator · Graph: POST /v1.0/roleManagement/directory/roleAssignmentScheduleRequests 또는 roleEligibilityScheduleRequests, action=adminAssign
   - 해설: 할당은 PIM의 할당 추가 화면에서 만듭니다. 영구 할당은 PIM 없이 Global Administrator가 포털·PowerShell로도 만들 수 있지만, 적격·기간 제한 할당은 PIM이 필요합니다
2. [처리] 역할과 멤버를 선택
   - 주체: 관리자
   - 위치: 할당 추가 › 역할 선택 › 멤버 선택 › 다음
   - 데이터: 사용자·그룹·에이전트 ID를 선택 가능 (게스트에 내장 역할을 주면 멤버와 같은 권한이 됨) · 일부 역할은 관리 단위·서비스 주체·앱으로 범위를 좁혀 할당 가능(directoryScopeId · appScopeId, 롤아웃 중) · 에이전트 ID에 줄 수 있는 역할은 Agent ID 권한 문서 참조
   - 해설: 사용자뿐 아니라 그룹이나 에이전트 ID에도 역할을 줄 수 있습니다. 역할 및 관리자 화면에서는 역할 할당 가능 그룹만 목록에 나옵니다
3. [판단] 할당 유형은 무엇인가?
   - 주체: 관리자
   - 위치: 멤버 자격 설정(Membership settings) › 할당 유형(Assignment type) 목록 (적격 Eligible · 활성 Active)
   - 데이터: 적격(Eligible) = 역할은 이미 할당돼 있지만 사용하려면 활성화(MFA · 사유 · 승인 요청 등)를 해야 함 · 활성(Active) = 사용자가 아무 조치 없이 할당된 시점부터 바로 그 역할의 권한을 사용
   - 해설: 두 유형은 같은 역할의 같은 권한을 줍니다(공식 문서: 영구 할당과 적격 할당의 접근 권한에는 차이가 없고, 항상 그 접근이 필요하지 않은 사람만 다름). 차이는 사용하기 전에 활성화가 필요한가입니다
   - 적격 → 4
   - 활성 → 5
4. [처리] 적격(Eligible) 할당 생성
   - 주체: 관리자
   - 데이터: roleEligibilityScheduleRequest (action=adminAssign) · Graph: POST /v1.0/roleManagement/directory/roleEligibilityScheduleRequests · 활성화 때 MFA·사유·승인 요구 · 종료일 없는 적격 할당도 만들 수 있음
   - 해설: 역할은 지금 사용자에게 할당된 상태이고, 사용자가 그 권한을 쓰려고 할 때 활성화합니다(활성화 요청을 하기 전에는 권한을 사용할 수 없음). 적격 할당은 활성화돼도 그대로 남고, 활성화할 때마다 한시적인 활성 상태(Graph의 assignmentType = Activated)가 따로 생겨 기한이 끝나면 사라집니다
   - 다음 → 6
5. [처리] 활성(Active) 할당 생성
   - 주체: 관리자
   - 데이터: roleAssignmentScheduleRequest (action=adminAssign) · Graph: POST /v1.0/roleManagement/directory/roleAssignmentScheduleRequests (권한 RoleAssignmentSchedule.ReadWrite.Directory, 쓰기 최소 역할 Privileged Role Administrator) · 예: scheduleInfo.expiration = afterDuration PT3H · 역할 설정에 따라 MFA·사유 입력
   - 해설: 할당 즉시(시작 시각이 지정돼 있으면 그 시각부터) 구성원이 활성화 같은 별도 조치 없이 권한을 사용합니다. 종료일이 없으면 영구, 있으면 그 기간에만 유효합니다. 활성화 단계가 없으므로 PIM이 권한을 쓰는 시점에 MFA를 요구하지 못합니다(MFA·사유는 활성 할당을 만들 때만 역할 설정으로 요구 가능)
6. [처리] 영구 또는 기간 제한을 지정
   - 주체: 관리자
   - 위치: 멤버 자격 설정 › 시작·종료 날짜 및 시간 › 할당
   - 데이터: scheduleInfo.expiration (type = noExpiration · afterDateTime · afterDuration) — 5분 미만 기간·할당 직후 5분 이내 제거는 불가 · 반복(recurrence) 일정은 Graph에서 미지원 · 종료일 허용 범위는 역할 설정의 할당 기간 규칙이 제한
   - 해설: 기간의 뜻이 유형마다 다릅니다. 적격은 그 기간 안에 활성화(또는 승인 요청)할 수 있는 기간이고, 활성은 그 기간 안에 권한을 쓸 수 있는 기간입니다. 한 번 활성화해서 권한을 쓰는 시간은 이 기간이 아니라 역할 설정의 최대 활성화 기간이 정합니다. 상시 근무자는 영구, 계약직은 종료일이 있는 기간 제한을 씁니다. 기간 제한 할당이 마지막 Global Administrator 할당이면 만료돼도 제거되지 않습니다
7. [처리] 상시 활성 할당을 적격으로 전환 (미리 보기)
   - 주체: 관리자
   - 위치: Microsoft Entra 역할 › 할당(Assignments) › 활성 할당(Active assignments) › 대상 선택 › 할당 관리(Manage Assignments) › 유형을 적격(Eligible)으로 변경 › 저장 › 적격 할당에서 확인
   - 데이터: 활성 할당 → 적격 할당 (미리 보기·롤아웃 중이라 일부 테넌트에는 보이지 않을 수 있음 · 기존 PIM 라이선스 요구 동일 · Global Administrator 전환 전 안전장치와 비상 액세스 계정 점검)
   - 해설: 항상 바로 쓸 수 있던(활성) 관리자 권한을 필요할 때 활성화해서 쓰는(적격) JIT 방식으로 옮깁니다. 전환 뒤 사용자는 필요할 때마다 직접 활성화해야 합니다
8. [끝] 할당 현황에서 적격·활성 목록 확인
   - 주체: 관리자
   - 위치: Microsoft Entra 역할 › 할당 › 적격 할당 · 활성 할당
   - 데이터: Global Administrator 마지막 활성 기간 제한 할당은 만료돼도 제거되지 않음 · 마지막 Global Administrator 적격 기간 제한 할당도 마찬가지 · 마지막 활성 Global Administrator 할당은 수동으로도 제거 불가
   - 해설: 관리자가 실수로 테넌트에서 잠기는 일을 막는 보호 장치입니다. 그래서 비상 액세스 계정을 영구 활성 Global Administrator로 두는 것이 권장됩니다
- 시나리오: 적격 :: 적격 할당 — 사용할 때 활성화, 목록 확인
- 시나리오: 활성 :: 활성 할당 — 할당 즉시 사용, 목록 확인

> 교육 포인트: 둘 다 역할이 이미 할당된 상태입니다. 적격은 "할당돼 있다가 사용할 때 활성화하는 것", 활성은 "할당하는 즉시 활성화 없이 바로 쓰는 것"입니다. 주는 권한은 같고 사용 전 활성화가 필요한지만 다릅니다. 기간 제한 활성 할당은 만료 시 제거됩니다.
>
> 주의: 적격 할당 사용자도 라이선스 대상입니다(Entra ID P2 또는 Entra ID Governance).
>
> 출처: https://learn.microsoft.com/entra/id-governance/privileged-identity-management/pim-configure
>
> 출처: https://learn.microsoft.com/entra/id-governance/privileged-identity-management/pim-how-to-add-role-to-user
>
> 출처: https://learn.microsoft.com/graph/api/rbacapplication-post-roleassignmentschedulerequests
>
> 출처: https://learn.microsoft.com/graph/api/resources/unifiedroleassignmentscheduleinstance

### L3 · C · 활성화 승인 흐름 — 요청 → 승인자 → 활성

#### L4 · 승인 요구 역할의 활성화 요청이 지나는 길

1. [시작] 활성화 요청이 PendingApproval로 대기
   - 주체: Entra ID
   - 데이터: roleAssignmentScheduleRequest status=PendingApproval · approvalId
   - 해설: 승인 요구가 있는 역할은 요청만으로 권한이 붙지 않습니다. 요청자는 내 요청(My requests)에서 상태를 보고 취소할 수 있고, Global Administrator·Privileged Role Administrator는 승인자가 아니어도 모든 대기 요청을 보고 취소할 수 있습니다
2. [처리] 승인자에게 이메일 알림
   - 주체: Entra ID
   - 데이터: 지정 승인자(사용자·그룹) 또는 미지정 시 활성 Privileged Role Administrator·Global Administrator · 수신자·종류는 규칙 Notification_Approver_EndUser_Assignment (승인 요청 메일) 로 조정
   - 해설: 메일에 요청으로 바로 가는 링크가 들어 있습니다. 승인 시한이 24시간이므로 승인자 알림 수신 설정을 확인해 둡니다
3. [처리] 승인자가 승인 대기 목록을 연다
   - 주체: 관리자
   - 위치: ID 거버넌스 › Privileged Identity Management › 요청 승인(Approve requests) › 역할 활성화 요청(Requests for role activations)
   - 데이터: API: GET /v1.0/roleManagement/directory/roleAssignmentScheduleRequests/filterByCurrentUser(on='approver')?$filter=status eq 'PendingApproval' · 응답에 approvalId · action=SelfActivate · scheduleInfo.expiration(예: PT5H30M)
   - 해설: 승인자는 포털이나 Graph로 대기 중인 요청을 확인합니다
4. [판단] 승인자가 요청자 본인인가?
   - 주체: Entra ID
   - 데이터: 승인자 ID와 요청자 ID 비교 (서비스 주체는 승인 불가)
   - 해설: 자기 요청은 스스로 승인할 수 없습니다. 승인자 그룹에 요청자가 들어 있어도 본인 요청은 처리할 수 없으므로 다른 승인자가 필요합니다
   - 예 → [차단] 차단 — 본인 요청은 본인이 승인할 수 없음
   - 아니오 → 5
5. [처리] 승인자가 사유를 입력하고 승인 또는 거부
   - 주체: 관리자
   - 위치: 요청 선택 › Justification 입력 › 제출(Submit) 또는 거부(Deny)
   - 데이터: Graph: GET /beta/roleManagement/directory/roleAssignmentApprovals/{요청 ID} 로 단계(stepId) 조회 후 PATCH /beta/roleManagement/directory/roleAssignmentApprovals/{id}/steps/{stepId} (reviewResult=Approve/Deny · justification) — 다단계 승인과 연장·갱신 승인은 Graph 미지원 · 성공 응답은 본문 없음
   - 해설: 승인자는 사유를 남기고 결정하며, 결정은 다른 승인자에게도 통지됩니다
6. [판단] 24시간 안에 결정이 났는가?
   - 주체: Entra ID
   - 데이터: 승인 시한 24시간 (설정 변경 불가) · 시한 경과 시 감사 활동 PIM activation request expired
   - 해설: 시한이 지나면 요청이 만료돼 사용자가 다시 제출해야 합니다. 승인자가 있어도 시한 안에 아무도 결정하지 않으면 자동 승인되지 않습니다
   - 예 → 7
   - 아니오 → [차단] 만료 — 24시간 내 결정 없음, 새 요청 필요
7. [처리] 첫 번째 응답으로 확정
   - 주체: Entra ID
   - 데이터: 승인자가 여럿이면 먼저 응답한 사람의 결정이 적용 (모든 승인자의 동의가 필요하지 않음)
   - 해설: 모든 승인자는 다른 승인자의 응답을 통지로 받습니다
8. [처리] 활성 할당 생성 + 관리자에게 통지
   - 주체: Entra ID
   - 위치: 승인된 요청은 활성화 요청 시점(또는 지정한 시작 시각)에 활성 할당이 생성됨 · 관리자가 제거하려면 PIM에서 해당 활성 할당 제거
   - 데이터: Global Administrator · Privileged Role Administrator에게 "승인된 사용자가 활성화됨" 통지 (규칙 Notification_Admin_EndUser_Assignment) · 감사 활동 Add member to role request approved (PIM activation)
   - 해설: 승인됐지만 이상하다고 판단하면 관리자가 활성 할당을 제거할 수 있습니다. 승인자가 아닌 관리자는 대기 요청 알림을 받지 못하지만 대기 요청 목록은 볼 수 있습니다
9. [끝] 승인·활성화 기록이 리소스 감사에 남음
   - 주체: 로그
   - 위치: Microsoft Entra 역할 › 리소스 감사 (Resource audit) · 열람 가능 역할: Global Administrator · Global Reader · Privileged Role Administrator · Security Administrator · Security Reader
   - 데이터: 역할 할당 변경 · 활성화 · 정책 변경 (보관 30일, 장기 보관은 진단 설정으로 Log Analytics·스토리지 전송) · 활동 Add member to role requested / request approved / request denied (PIM activation)
   - 해설: 누가 누구의 활성화를 승인했는지 추적할 수 있습니다
- 시나리오: 예 :: 요청자가 본인을 승인하려 해 차단
- 시나리오: 아니오 ▸ 예 :: 타인이 24시간 안에 승인해 활성화·감사 기록
- 시나리오: 아니오 ▸ 아니오 :: 24시간 안에 결정이 없어 요청 만료

> 교육 포인트: 승인자는 별도 역할이 없어도 됩니다. 승인자를 2명 이상 지정하면 한 사람이 자리를 비워도 흐름이 끊기지 않습니다.
>
> 주의: 승인 시한 24시간은 조정할 수 없습니다.
>
> 출처: https://learn.microsoft.com/entra/id-governance/privileged-identity-management/pim-approval-workflow
>
> 출처: https://learn.microsoft.com/entra/id-governance/privileged-identity-management/pim-how-to-use-audit-log
