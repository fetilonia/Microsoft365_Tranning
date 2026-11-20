#### 그룹 · grant-mode · 액세스 차단 / 허용
- 섹션: 허용
- 선택: 단일
- 위치: 보호 › 조건부 액세스 › 정책 › 새 정책 만들기 › 액세스 제어 › 허용 (Entra ID > Conditional Access > Policies > Grant) [확인 필요: 한글 UI 문구]
- 소개: 정책이 일치했을 때 접근을 막을지, 컨트롤을 요구하며 허용할지 정한다.
- 평가: Phase 1에서 세션 정보를 모은 뒤 Phase 2에서 평가한다. 차단(block) 컨트롤이 걸린 정책이 하나라도 일치하면 평가가 그 자리에서 멈추고 다른 컨트롤은 묻지 않는다.
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant;https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-policies;https://learn.microsoft.com/en-us/entra/identity/conditional-access/workload-identity

##### 옵션 · g-block · 액세스 차단
- 소개: 일치하는 로그인을 무조건 막는다. 다른 컨트롤보다 먼저 걸린다.
- 위치: 허용 › 액세스 차단 (Block access)
- 동작: Phase 2에서 block이 걸린 정책이 일치하면 이후 컨트롤을 묻지 않고 즉시 차단한다. 여러 정책이 겹치면 Block이 다른 모든 컨트롤을 이긴다(ID Protection 정책 문서).
- 충족 판정: 충족이라는 개념이 없다. 할당·대상 리소스·조건이 모두 일치하는 것만으로 차단이 확정된다.
- 표현: 브라우저: 접근 차단 오류 페이지(AADSTS53003 BlockedByConditionalAccess); 모바일 앱·데스크톱 앱: 같은 오류로 로그인·토큰 발급 실패 [확인 필요: 앱별 화면]; Exchange ActiveSync: 격리 메일 1통.
- 미충족 시: 정책 조건이 일치하지 않으면 이 컨트롤은 적용되지 않고 다른 정책 평가로 넘어간다.
- 지원 주체: 사용자, 게스트, 워크로드 ID, 에이전트
- 제약·주의: 광범위 정책은 조직 전체를 막을 수 있다. 비상 계정 제외, 보고 전용·What If 선검증. 워크로드 ID·에이전트 ID는 허용 컨트롤 없이 차단만 지원. 워크로드 ID는 Workload ID Premium 필요.
- 로그: 로그인 로그 조건부 액세스 탭에 정책 실패, 오류 53003. 워크로드 ID는 서비스 주체 로그인 탭에서 확인하며 "Access has been blocked due to Conditional Access policies."가 표시된다.
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant;https://learn.microsoft.com/en-us/entra/identity/conditional-access/workload-identity;https://learn.microsoft.com/en-us/entra/identity/conditional-access/troubleshoot-conditional-access

##### 옵션 · g-grant · 액세스 허용
- 소개: 선택한 컨트롤을 충족하면 접근을 허용한다.
- 위치: 허용 › 액세스 허용 (Grant access) › 필요한 컨트롤 선택
- 동작: 선택한 컨트롤을 요구한다. Phase 1에서 이미 충족된 것은 건너뛰고, 못 채운 컨트롤만 정해진 순서로 프롬프트한다. 모두 충족하면 세션 컨트롤이 적용된다.
- 충족 판정: 선택한 컨트롤(AND 또는 OR)이 모두 충족됐는지 본다. 컨트롤을 하나도 고르지 않으면 이 모드를 쓸 수 없다 [확인 필요: 포털 검증 문구].
- 표현: 브라우저: 필요한 컨트롤별 프롬프트가 순서대로 이어진다; 모바일 앱·데스크톱 앱: 앱 로그인 창이나 브로커에서 같은 프롬프트가 열린다 [확인 필요: 앱별 UI].
- 미충족 시: 프롬프트로 해결되는 컨트롤은 재시도 후 통과하고, 해결 불가 컨트롤(미준수 디바이스 등)은 접근이 차단된다.
- 지원 주체: 사용자, 게스트, 에이전트
- 제약·주의: 컨트롤별 지원 주체가 다르다. 워크로드 ID와 에이전트 ID는 허용 컨트롤을 쓰지 못하고, 에이전트 사용자(미리 보기)는 준수 디바이스 필요만 쓸 수 있다.
- 로그: 로그인 로그 조건부 액세스 탭에 정책별 결과(성공·실패·적용 안 됨)와 충족한 허용 컨트롤이 표시된다 [확인 필요: 필드 표시 방식].
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant;https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-policies
