#### 그룹 · auth-flow · 인증 흐름
- 섹션: 조건
- 선택: 다중
- 위치: 보호 › 조건부 액세스 › 정책 › 새 정책 › 조건 › 인증 흐름(Authentication flows) [확인 필요: 한글 UI 명칭] — 미리 보기
- 소개: 디바이스 코드 흐름·인증 전송처럼 위험한 인증·권한 부여 흐름만 골라 통제합니다.
- 평가: Entra ID가 이번 로그인이 해당 흐름인지 판별합니다. 한 번 해당된 세션은 '프로토콜 추적' 상태가 되어 이후 갱신에서도 흐름 정책을 받습니다.
- 노드 제목: 인증 흐름 조건 일치?
- 노드 보조: 디바이스 코드·인증 전송, 프로토콜 추적 포함
- 해설: Entra ID가 이번 요청(또는 프로토콜 추적된 세션)이 선택한 인증 흐름인지 판단합니다.
- 주체: Entra ID
- 데이터: 인증 흐름 유형, 세션의 프로토콜 추적 상태('Original transfer method')
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-authentication-flows;https://learn.microsoft.com/en-us/entra/identity/conditional-access/policy-block-authentication-flows;https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-authentication-transfer

##### 옵션 · af-devicecode · 디바이스 코드 흐름
- 소개: 입력 장치가 없는 기기용 코드 로그인 흐름입니다.
- 위치: 정책 › 조건 › 인증 흐름 › 구성 예 › 디바이스 코드 흐름(Device code flow)
- 동작: 키보드가 없는 기기(공유 기기·디지털 사이니지)에서 로그인하는 흐름으로, 피싱이나 비관리 디바이스 접근에 악용될 수 있는 고위험 방식입니다. Microsoft는 가능한 한 차단을 권장합니다.
- 매칭: 로그인이 디바이스 코드 흐름이거나, 이전에 디바이스 코드 흐름을 쓴 세션(프로토콜 추적됨)의 후속 요청일 때 일치입니다.
- 미충족 시: 다른 흐름이면 이 조건은 불일치이며 정책이 적용되지 않습니다.
- 지원 주체: 사용자. 워크로드 ID·에이전트는 [확인 필요]
- 제약·주의: 문서 예시 컨트롤은 액세스 차단뿐이며 그 외 컨트롤은 [확인 필요]. 모든 리소스 대상이면 Device Registration Service(01cb2876-…)를 제외해야 합니다. 차단 시 AADSTS530036이 날 수 있습니다.
- 로그: 인증 프로토콜 필터(Device code)로 사용 현황을 찾고, 로그의 '원래 전송 방법(Original transfer method)'에 추적 상태가 보입니다.

##### 옵션 · af-authtransfer · 인증 전송
- 소개: PC의 인증 상태를 QR 코드로 모바일에 옮기는 흐름입니다.
- 위치: 정책 › 조건 › 인증 흐름 › 구성 예 › 인증 전송(Authentication transfer)
- 동작: PC의 Microsoft 앱에서 로그인한 상태를 QR로 모바일 앱에 넘깁니다. 전송 전에 대상 모바일 앱의 모든 조건부 액세스 정책을 평가하고 디바이스 상태 클레임은 넘기지 않습니다.
- 매칭: 로그인이 인증 전송(QR 코드)으로 이뤄졌거나, 이전에 인증 전송을 한 세션(프로토콜 추적됨)의 후속 요청일 때 일치입니다.
- 미충족 시: 다른 흐름이면 이 조건은 불일치입니다. 전송 때 정책을 못 맞추면 전송이 실패해 모바일에서 직접 로그인해야 합니다.
- 지원 주체: 사용자(Microsoft 앱만, 비-Microsoft 앱 미지원). 기본 활성
- 제약·주의: 미리 보기, Entra ID P1 필요. 비-Microsoft MDM을 우회할 수 있어 Zero Trust 가이드는 차단을 권장합니다. 문서 예시 컨트롤은 액세스 차단. 그 외 컨트롤은 [확인 필요].
- 로그: 인증 전송은 QR 코드 인증 방법의 연속 이벤트로 남고, 로그의 '원래 전송 방법'이 Authentication transfer로 표시됩니다.
