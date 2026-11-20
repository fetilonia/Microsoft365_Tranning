#### 그룹 · client · 클라이언트 앱
- 섹션: 조건
- 선택: 다중
- 위치: 보호 › 조건부 액세스 › 정책 › 새 정책 › 조건 › 클라이언트 앱(Client apps) [확인 필요: 한글 UI 명칭]
- 소개: 사용자가 쓰는 소프트웨어 종류(브라우저·최신 인증 앱·레거시 프로토콜)로 적용을 나눕니다.
- 평가: Entra ID가 로그인 요청이 어떤 클라이언트·프로토콜로 왔는지 판별해 선택한 앱 유형과 대조합니다. 새 정책은 이 조건을 설정하지 않으면 모든 클라이언트 유형에 적용됩니다.
- 노드 제목: 클라이언트 앱 조건 일치?
- 노드 보조: 최신 인증 클라이언트 vs 레거시 인증 프로토콜
- 해설: Entra ID가 요청한 클라이언트가 브라우저·최신 인증 앱·레거시 프로토콜 중 무엇인지 선택값과 대조합니다.
- 주체: Entra ID
- 데이터: 로그인 요청의 클라이언트 앱 유형·인증 프로토콜(로그인 로그 'Client app')
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-conditions;https://learn.microsoft.com/en-us/entra/identity/conditional-access/policy-block-legacy-authentication

##### 옵션 · c-browser · 브라우저
- 소개: 웹 기반 앱(SAML·OIDC 등) 로그인에 일치합니다.
- 위치: 정책 › 조건 › 클라이언트 앱 › 구성 예 › 브라우저
- 동작: 최신 인증 클라이언트 중 웹 앱입니다. SAML, WS-Federation, OpenID Connect를 쓰거나 OAuth 기밀 클라이언트로 등록된 서비스를 포함합니다.
- 매칭: 요청이 브라우저 기반 최신 인증(SAML·WS-Fed·OIDC·OAuth 기밀 클라이언트)일 때 일치입니다.
- 미충족 시: 다른 클라이언트 유형이면 이 옵션은 불일치입니다(다른 선택 항목이 일치할 수 있음).
- 지원 주체: 사용자
- 제약·주의: 브라우저 디바이스 확인은 비공개 모드·쿠키 비활성 시 실패합니다. Safari는 승인된 앱·앱 보호 정책을 만족하지 못하고 Edge는 만족합니다. 일부 OS/브라우저만 지원합니다.
- 로그: 로그인 로그 'Client app'에 Browser로 표시됩니다.

##### 옵션 · c-modern · 모바일 앱·데스크톱 클라이언트(최신 인증)
- 소개: Office 데스크톱·모바일 앱 등 최신 인증 앱에 일치합니다.
- 위치: 정책 › 조건 › 클라이언트 앱 › 구성 예 › 모바일 앱 및 데스크톱 클라이언트
- 동작: Office 데스크톱·휴대폰 앱처럼 최신 인증을 쓰는 앱입니다. 문서에 앱·대상 서비스·플랫폼 표가 있으며 My Apps 서비스 앱은 디바이스 기반 정책을 지원하지 않습니다.
- 매칭: 요청이 최신 인증을 쓰는 모바일 앱·데스크톱 클라이언트(예: Outlook·Teams·Office)일 때 일치입니다.
- 미충족 시: 다른 클라이언트 유형이면 이 옵션은 불일치입니다.
- 지원 주체: 사용자
- 제약·주의: 최신 인증 클라이언트는 MFA·디바이스 상태를 전달할 수 있어 허용 컨트롤을 요구하기 적합합니다. 앱·플랫폼별 지원 범위는 문서 표를 확인하세요. Apple 비-MSAL 앱은 Enterprise SSO 플러그인 필요.
- 로그: 로그인 로그 'Client app'에 Mobile apps and desktop clients로 표시됩니다.

##### 옵션 · c-eas · Exchange ActiveSync 클라이언트
- 소개: EAS 프로토콜(레거시 인증) 사용 전체에 일치합니다.
- 위치: 정책 › 조건 › 클라이언트 앱 › 구성 예 › 레거시 인증 클라이언트 › Exchange ActiveSync 클라이언트
- 동작: Exchange ActiveSync 프로토콜 사용 전체를 대상으로 합니다. 정책으로 차단하면 사용자는 이유와 조치가 담긴 격리 메일을 한 통 받습니다.
- 매칭: 요청이 Exchange ActiveSync 프로토콜일 때 일치입니다. 사용자·그룹을 선택해 할당한 정책에서만 선택할 수 있고, 대상 앱은 Exchange Online만 두어야 합니다.
- 미충족 시: EAS가 아니면 불일치입니다. EAS 차단 정책에서 일치하지 않는 요청은 이 정책의 영향을 받지 않습니다.
- 지원 주체: 사용자
- 제약·주의: 모든 사용자·게스트·역할로 할당해도 전원이 대상이 됩니다. '승인된 앱 필요'는 Outlook 모바일 안내, MFA·이용 약관·사용자 지정 컨트롤은 기본 인증이 지원하지 않아 차단됩니다.
- 로그: 로그인 로그 'Client app'에 Exchange ActiveSync로 남고 차단 시 정책 결과가 기록됩니다.

##### 옵션 · c-legacy · 기타 클라이언트(레거시 인증)
- 소개: 최신 인증을 못 쓰는 기본/레거시 프로토콜 클라이언트입니다.
- 위치: 정책 › 조건 › 클라이언트 앱 › 구성 예 › 레거시 인증 클라이언트 › 기타 클라이언트(Other clients)
- 동작: IMAP·POP3·SMTP·MAPI·EWS·Autodiscover·Exchange Online PowerShell 등 기본 인증 프로토콜을 쓰는 앱입니다. 이 클라이언트는 MFA를 못 하고 디바이스 상태를 안 넘깁니다.
- 매칭: 요청이 기본/레거시 인증 프로토콜(SMTP·IMAP4·POP3·MAPI/HTTP·EWS·Autodiscover·OAB·Outlook Anywhere 등)일 때 일치입니다.
- 미충족 시: 최신 인증 클라이언트면 불일치입니다. 차단 정책은 최신 인증 요청에 영향을 주지 않습니다.
- 지원 주체: 사용자
- 제약·주의: 용어: 문서는 '레거시 인증 클라이언트'를 EAS+기타로, 나머지(브라우저·모바일/데스크톱)를 '최신 인증'으로 구분합니다. 차단 시 필요 계정은 제외하고 비상 계정 제외·Report-only 선확인을 권장합니다.
- 로그: 로그인 로그 'Client app' 필터로 레거시 프로토콜을 찾고(대화형·비대화형 탭 모두) 'Sign-ins using legacy authentication' 워크북을 씁니다.
