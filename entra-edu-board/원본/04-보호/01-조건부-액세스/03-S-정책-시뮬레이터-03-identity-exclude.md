#### 그룹 · identity-exclude · 제외 대상
- 섹션: 할당
- 선택: 다중
- 위치: 보호 › 조건부 액세스 › 정책 › 새 정책 만들기 › 할당 › 사용자 › 제외(Exclude)
- 소개: 포함 대상 중에서도 이 정책을 적용하지 않을 계정·그룹·유형을 정합니다.
- 평가: 포함과 제외가 동시에 걸리면 제외가 우선합니다(exclude overrides include). 제외된 주체는 이 정책에서 비적용이며 다른 정책은 그대로 평가됩니다.
- 노드 제목: 제외 대상인가?
- 노드 보조: 제외 목록에 있으면 정책을 건너뜀(제외 우선)
- 해설: 포함 대상이어도 제외 목록(비상 계정 등)에 있으면 이 정책의 평가를 건너뜁니다.
- 주체: Entra ID
- 데이터: 제외 사용자·그룹·역할·게스트 유형, 토큰 주체
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-users-groups;https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/security-emergency-access

##### 옵션 · x-breakglass · 비상 접근(break-glass) 계정
- 소개: 잠금 사고에 대비해 비상 계정을 차단·제한 정책에서 제외합니다.
- 위치: 할당 › 사용자 › 제외 › 사용자 및 그룹(비상 접근 계정 또는 전용 그룹 선택)
- 동작: 차단하거나 로그인을 제한하는 정책에서 비상 계정(2개 이상, 클라우드 전용 *.onmicrosoft.com, 비federated)을 제외합니다. 제외 우선 규칙으로 정책 오류·MFA 장애·페더레이션 장애에도 로그인할 수 있게 합니다.
- 매칭: 로그인 사용자가 제외한 비상 계정(또는 그 그룹 멤버)이면 일치해 이 정책을 건너뜁니다.
- 사용자 경험: 비상 계정은 해당 정책의 MFA·준수 디바이스 요구를 받지 않고, 패스키(FIDO2) 등 강력한 인증 수단으로 로그인합니다.
- 미충족 시: 제외하지 않은 계정은 정책이 그대로 적용됩니다. 비상 계정을 빼지 않으면 정책 오류 때 아무도 관리자 접근을 못 할 수 있습니다.
- 지원 주체: 사용자
- 제약·주의: 보고 전용 정책은 차단하지 않아 제외가 필요 없습니다. 비상 계정은 패스키(FIDO2)나 CBA, PIM 영구 활성 GA, 로그인·감사 로그 모니터링과 정기 점검을 함께 합니다.
- 로그: 제외되면 해당 정책 result = notApplied. 비상 계정 로그인 자체를 경보로 모니터링하라고 권고합니다.
- 출처: https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/security-emergency-access;https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-users-groups

##### 옵션 · x-guests · 게스트·외부 사용자
- 소개: 게스트·외부 사용자 유형을 선택해 이 정책에서 제외합니다.
- 위치: 할당 › 사용자 › 제외 › 게스트 또는 외부 사용자(Guest or external users)
- 동작: 6가지 외부 사용자 유형(B2B 협업 게스트·멤버, B2B 직접 연결, 로컬 게스트, 서비스 공급자, 기타)과 테넌트를 골라 제외합니다. 내부 직원 전용 정책이나 별도 정책으로 게스트를 다룰 때 씁니다.
- 매칭: 로그인 사용자가 제외로 선택한 외부 사용자 유형(및 테넌트)이면 일치해 정책을 건너뜁니다.
- 사용자 경험: 제외된 게스트는 이 정책의 컨트롤을 받지 않습니다. 대신 별도의 게스트용 정책이 없으면 보호 공백이 생깁니다.
- 미충족 시: 선택하지 않은 외부 유형과 내부 사용자는 정책이 적용됩니다.
- 지원 주체: 게스트
- 제약·주의: 서비스 공급자(CSP/GDAP) 파트너 접근은 '서비스 공급자 사용자' 유형으로 따로 다룹니다. GSA 예시 정책은 비상 계정과 게스트·외부 사용자를 함께 제외합니다.
- 로그: 제외되면 해당 정책 result = notApplied.
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-users-groups;https://learn.microsoft.com/en-us/entra/external-id/authentication-conditional-access;https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-target-resource-microsoft-profile
