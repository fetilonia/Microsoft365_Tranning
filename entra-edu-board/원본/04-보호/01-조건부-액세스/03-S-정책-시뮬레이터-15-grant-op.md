#### 그룹 · grant-op · 여러 컨트롤을 묶는 방식
- 섹션: 허용
- 선택: 단일
- 위치: 허용 › 여러 컨트롤인 경우 (For multiple controls) › 선택한 모든 컨트롤 필요 / 선택한 컨트롤 중 하나 필요
- 소개: 한 정책 안의 컨트롤을 AND로 모두 요구할지 OR로 하나만 요구할지 정한다.
- 평가: 컨트롤을 둘 이상 고른 경우에만 의미가 있다. OR이면 정해진 순서로 프롬프트하다 하나가 충족되면 허용하고, AND면 모두 충족해야 한다. 서로 다른 정책은 항상 AND다.
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant;https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-policies;https://learn.microsoft.com/en-us/entra/identity/conditional-access/migrate-approved-client-app

##### 옵션 · go-and · 선택한 모든 컨트롤 필요
- 소개: 고른 컨트롤을 모두 충족해야 허용한다(기본값).
- 위치: 허용 › 여러 컨트롤인 경우 › 선택한 모든 컨트롤 필요 (Require all the selected controls)
- 동작: 선택한 컨트롤 전부가 충족돼야 접근을 허용한다. 하나라도 못 채우면 허용되지 않는다. 기본값이다.
- 충족 판정: 선택한 컨트롤 각각의 충족 판정이 모두 참이어야 한다.
- 표현: 브라우저·모바일 앱·데스크톱 앱: 못 채운 컨트롤마다 프롬프트가 정해진 순서로 이어진다. 클라이언트가 지원하지 않는 컨트롤이 하나라도 있으면 막힌다.
- 미충족 시: 프롬프트로 해결되지 않는 컨트롤이 하나라도 남으면 차단된다.
- 지원 주체: 사용자, 게스트, 에이전트
- 제약·주의: macOS·Linux 플랫폼 조건은 '모든 컨트롤 필요'를 쓰면 지원되지 않는다. 앱 보호 정책을 MDM 관리 디바이스에 AND로 걸면 전부 차단될 수 있다. MFA와 인증 강도는 함께 못 고르고 암호 변경은 다른 컨트롤과 불가.
- 로그: 컨트롤별 충족 여부가 조건부 액세스 탭의 해당 정책에 표시된다. 하나라도 못 채우면 정책 결과는 실패 또는 중단이다.
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant;https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-conditions;https://learn.microsoft.com/en-us/entra/identity/conditional-access/policy-all-users-windows-app-protection

##### 옵션 · go-or · 선택한 컨트롤 중 하나 필요
- 소개: 고른 컨트롤 중 하나만 충족해도 허용한다.
- 위치: 허용 › 여러 컨트롤인 경우 › 선택한 컨트롤 중 하나 필요 (Require one of the selected controls)
- 동작: 정해진 순서로 프롬프트하다가 선택한 컨트롤 중 하나가 충족되면 즉시 접근을 허용한다. 클라이언트가 한 컨트롤을 못 채워도 다른 컨트롤로 통과할 수 있다.
- 충족 판정: 선택한 컨트롤 중 하나 이상이 충족되면 참이다.
- 표현: 브라우저·모바일 앱·데스크톱 앱: 첫 번째로 충족 가능한 컨트롤 프롬프트만 이어진다. 예: 준수 디바이스 또는 앱 보호 정책이면 관리 디바이스는 디바이스 확인으로, 비관리 디바이스는 MAM으로 통과한다.
- 미충족 시: 선택한 컨트롤이 모두 충족되지 않을 때만 차단된다.
- 지원 주체: 사용자, 게스트, 에이전트
- 제약·주의: 승인 앱 또는 앱 보호 정책 OR는 마이그레이션 표준이지만 Kaizala·Skype for Business·Visio에는 안 통한다. 암호 변경은 다른 컨트롤과 묶을 수 없다. 가장 약한 하나로 통과하는 것을 의식해야 한다. 정책 간에는 항상 AND.
- 로그: 충족한 컨트롤이 조건부 액세스 탭에 표시되고, 나머지는 충족하지 않아도 정책 결과는 성공이다 [확인 필요: 컨트롤별 표시 방식].
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant;https://learn.microsoft.com/en-us/entra/identity/conditional-access/migrate-approved-client-app;https://learn.microsoft.com/en-us/entra/identity/conditional-access/policy-all-users-windows-app-protection;https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-policies
