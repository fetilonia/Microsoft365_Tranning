## L2 · Verified ID — 검증 가능한 자격 증명

- 설정(Control Plane): 조직 설정(신뢰 도메인 · 키 보관소) · 도메인 검증 | 자격 증명 유형 정의(표시·규칙) · 앱 등록(Request Service 권한)
- 강제(Enforcement): Verified ID 발급·검증 서비스(Request Service API) | 지갑 앱(Microsoft Authenticator)
- 증적(Evidence): 감사 로그(LoggedByService = Verified ID) | KQL: AuditLogs · 요청 콜백 이벤트(request_retrieved · presentation_verified)
- 메뉴(Admin Center): Verified ID > 설정 · 자격 증명
- 라이선스(License): Entra ID Free부터 사용 가능(P2 요건은 2021-05 제거), Face Check는 별도 부가 기능(Entra Suite 포함) [확인 필요: 고객 라이선스 · 요금]

### L3 · 0 · 기능 상태 전이 — 수동 신원 확인 → 발급 구성 → 제시 · 검증

#### L4 · ⓪ 비활성 — 원격 신원 확인을 사람이 한다

1. [시작] 입사자·협력사가 신원 증명을 요청
   - 주체: 사용자
   - 위치: 헬프데스크 티켓 · 이메일 · 화상 통화 (Entra·Verified ID 기능 미사용 상태)
   - 데이터: 신분증 사진 · 재직 증명 사본 · 요청자 연락처
   - 해설: 원격에서 본인임을 믿게 할 방법이 필요한 상황입니다
2. [처리] 담당자가 문서와 얼굴을 눈으로 대조
   - 주체: 관리자
   - 위치: 화상 통화 화면 · 첨부된 문서 이미지
   - 데이터: 문서 사본 · 화면 속 얼굴 (위·변조 검증 어려움)
   - 해설: 사람이 확인하므로 위조 문서나 대리 응답을 놓칠 수 있고, 라이브니스(실제 사람인지) 판별 수단이 없습니다
3. [처리] 확인 결과를 티켓·메일로 기록
   - 주체: 관리자
   - 위치: 티켓 시스템 · 메일함
   - 데이터: 티켓 메모 · 첨부 사본 (개인정보가 여러 곳에 남음)
   - 해설: 사본이 메일과 티켓에 흩어져 개인정보 노출 범위가 커지고, 보관·삭제 책임이 담당자별로 갈라집니다
4. [판단] 증명을 다른 조직도 필요로 하는가?
   - 주체: 외부
   - 데이터: 협력사·고객사 등 신뢰하는 상대
   - 해설: 같은 증명을 여러 곳에 반복 제출하는 구조인지 묻는 단계입니다
   - 예 → 5
   - 아니오 → 6
5. [처리] 상대 조직이 같은 확인을 처음부터 반복
   - 주체: 외부
   - 데이터: 문서 사본 재전달
   - 해설: 이미 한 번 검증한 결과를 재사용할 수 있는 표준 수단이 없습니다
6. [끝] 확인 이력 분산 · 재사용 불가
   - 주체: 로그
   - 데이터: 감사 가능한 표준 기록 없음 (Entra 감사 로그의 LoggedByService = Verified ID 이벤트도 생기지 않음)
   - 해설: 누가 언제 무엇을 확인했는지 일관된 증적으로 남기기 어렵습니다
- 시나리오: 예 :: 다른 조직도 필요로 해 확인을 처음부터 반복
- 시나리오: 아니오 :: 다른 조직 요구 없어도 이력이 분산돼 재사용 불가

#### L4 · ① 구성 — 조직 설정 · 도메인 · 자격 증명 유형을 만든다

1. [시작] 관리자가 Entra 관리 센터에 로그인
   - 주체: 관리자
   - 위치: entra.microsoft.com › Verified ID — 설정은 Authentication Policy Administrator, 앱 등록은 Application Administrator
   - 데이터: Entra 역할 할당(설정: Authentication Policy Administrator · 앱 등록: Application Administrator) · 고급 설정이면 Key Vault를 만들 구독·리소스 그룹의 Azure Contributor 역할
   - 해설: 설정 작업의 최소 역할은 인증 정책 관리자이며 앱 등록은 역할이 따로 필요합니다. Global Administrator도 두 권한을 모두 갖지만 다른 역할 조합으로 해결되지 않을 때만 쓰도록 권고합니다
2. [판단] 테넌트에 사용자 지정 도메인이 등록되어 있는가?
   - 주체: 관리자
   - 위치: Entra ID › 도메인 이름(Domain names) › 사용자 지정 도메인 이름(Custom domain names) [확인 필요: 한글 메뉴명]
   - 데이터: 테넌트 도메인 목록 (사용자 지정 도메인이 없으면 빠른 설정 불가 — 설정 화면이 고급 설정 경험으로 기본 전환) · 빠른 설정은 EDU 테넌트 미지원
   - 해설: 도메인이 있으면 빠른 설정을, 없거나 세밀한 제어(내 Key Vault·6개월 초과 유효 기간·처리량 제한 회피)가 필요하면 고급 설정을 씁니다
   - 예 → 3
   - 아니오 → 4
3. [처리] 빠른 설정 — 한 번의 클릭으로 구성
   - 주체: 관리자
   - 위치: Entra 관리 센터 › Verified ID › 설정(Setup) › 시작하기(Get started) › (도메인이 여러 개면) 사용할 도메인 선택
   - 데이터: Microsoft가 지역별로 여러 테넌트에 공유 관리하는 서명 키 · DID did:web:verifiedid.entra.microsoft.com:테넌트ID:authority-ID (did:web 규격으로 DID 문서 조회 가능) · 자격 증명 validityInterval 최대 6개월 · 발급·검증 합산 테넌트당 초당 2건(2 RPS) · 테넌트 브랜딩의 로고·배경색을 기본 VerifiedEmployee에 반영
   - 해설: Key Vault 배포와 did-configuration.json 업로드 없이 서명 키·DID·도메인 검증을 자동 처리하고 기본 직원 자격 증명(Verified Workplace Credential)도 만듭니다. 완료 후 MyAccount에서 직원에게 제공할 기본 자격 증명을 편집할 수 있습니다
   - 다음 → 7
4. [처리] 고급 설정: Key Vault 준비 — 액세스 정책 모델
   - 주체: 관리자
   - 위치: Azure 포털 › 키 자격 증명 모음(Key Vault) 만들기 › 액세스 구성의 권한 모델을 'Vault access policy'로 선택
   - 데이터: 설정 계정에 키 생성·삭제 권한과 서명(sign) 권한(도메인 바인딩 생성용) · Verified ID 관리자 계정과 Request Service API 주체 모두에 Key Vault 접근 권한 부여 · Azure RBAC 권한 모델 Key Vault는 현재 제한이 있음
   - 해설: 서명 키를 내 Key Vault에 보관하려면 권한 모델을 액세스 정책으로 맞춰야 합니다. 기본적으로 금고를 만든 계정만 접근 권한이 있으므로 테스트에 같은 계정을 쓴다면 기본 정책에 sign 권한을 추가합니다. 재설정 시 지연을 줄이려면 테넌트 지역과 같거나 가까운 지역에 둡니다
5. [처리] 조직 설정 입력 — 이름 · 신뢰 도메인 · Key Vault
   - 주체: 관리자
   - 위치: Entra 관리 센터 › Verified ID › 개요(Overview) › 설정(Setup) 탭 › 고급 설정(Advanced Setup) › 조직 설정 구성(Configure organization settings) › 저장(Save)
   - 데이터: 조직 이름(Organization name, 고객에게는 보이지 않음) · 신뢰할 수 있는 도메인(Trusted domain: HTTPS, 리디렉션 불가, 예: https://did.contoso.com) · Key Vault(앞서 만든 금고)
   - 해설: 도메인은 DID를 실제 조직과 묶어 주는 근거로 DID 문서의 서비스 엔드포인트에 기록되고, Authenticator 같은 지갑이 이를 확인해 검증 심볼을 보여 줍니다. 도메인이 리디렉션이거나 HTTP이면 DID와 도메인이 연결되지 않습니다
6. [처리] DID 등록과 도메인 소유권 확인
   - 주체: 관리자
   - 위치: Verified ID › 개요 › 분산 ID 등록(Register decentralized ID) › 도메인 소유권 확인(Verify domain ownership) › 각각 새로 고침(Refresh registration/verification status)
   - 데이터: DID 문서를 복사·내려받아 웹 서버의 /.well-known/did.json에 게시 · 도메인 소유권 확인에서 받은 did-configuration.json을 https://도메인/.well-known/did-configuration.json에 게시(.well-known 외 다른 경로 불가)
   - 해설: DID 등록을 먼저 끝내야 도메인 소유권 확인으로 넘어갈 수 있고, 세 단계에 모두 초록 체크가 떠야 다음 단계로 갑니다. Authenticator는 HTTP 리디렉션을 따르지 않고 포털의 새로 고침도 파일이 익명 접근 가능해야 통과하므로 curl -Iv로 먼저 확인합니다. 웹 신뢰 시스템에서는 연결 도메인 변경이 지원되지 않아 옵트아웃 후 다시 온보딩해야 합니다
7. [처리] 앱 등록과 Request Service 권한 부여
   - 주체: 관리자
   - 위치: Entra ID › 애플리케이션(Applications) › 앱 등록(App registrations) › 새 등록(New registration; 단일 테넌트) › API 권한(API permissions) › 권한 추가 › 내 조직에서 사용하는 API › Verifiable Credentials Service Request › 애플리케이션 권한 › VerifiableCredential.Create.All › 관리자 동의 허용(Grant admin consent)
   - 데이터: 앱 등록 · API 권한 (발급·제시 권한을 앱별로 분리해 부여 가능) · 토큰은 client credentials 흐름으로 scope 3db474b9-6a0c-4840-96ac-1fceb342124f/.default를 요청하면 roles 클레임에 VerifiableCredential.Create.All이 담김(클라이언트 비밀 또는 인증서 사용)
   - 해설: 발급·검증 앱이 토큰으로 Request Service API를 호출하려면 이 권한과 관리자 동의가 필요합니다. 사용자 지정 자격 증명이나 자체 앱을 쓸 때만 필요하며 MyAccount 기본 발급만 쓰면 생략할 수 있습니다
8. [처리] 자격 증명 만들기 — 사용자 지정
   - 주체: 관리자
   - 위치: Verified ID › 자격 증명(Credentials) › 자격 증명 추가(Add a credential) › 사용자 지정 자격 증명(Custom credential) › 다음 › 자격 증명 이름 입력 후 만들기(Create)
   - 데이터: 자격 증명 이름(유형 이름) · 표시 정의(JSON: locale · card[title·issuedBy·backgroundColor·textColor·description·logo.uri] · consent · claims[claim은 vc.credentialSubject. 접두사]) · 규칙 정의(JSON)
   - 해설: 이름이 계약(contract)에 포함되어 포털에서 해당 자격 증명을 구분하는 기준이 됩니다. 표시 정의는 Microsoft Authenticator만 사용하고 로고 URI는 인터넷에 공개된 주소여야 하며 PNG·JPG·BMP를 권장합니다. 만든 뒤 '자격 증명 발급(Issue credential)' 화면에서 authority(발급자 DID)·manifest URL이 채워진 Request Service API 요청 예시를 얻습니다
9. [처리] 규칙 정의로 증명 방식 지정 — idTokenHints
   - 주체: 관리자
   - 위치: 자격 증명 만들기 › 규칙 정의 텍스트 상자
   - 데이터: attestations.idTokenHints[].mapping (예: $.given_name → firstName, indexed는 계약당 한 클레임만 가능) · validityInterval(초 단위, 예 2592000 = 30일) · vc.type · 다른 증명 방식으로 idTokens · presentations · selfIssued(문자열만) 병용 가능
   - 해설: 발급 시 어떤 입력 클레임을 어떤 출력 클레임으로 담을지, 유효 기간은 얼마인지 정합니다. idTokenHint는 앱이 발급 요청 본문의 claims로 값을 전달하는 방식이라 required 클레임이 빠지면 Request Service API가 호출을 거부하고, 요청의 expirationDate로 유효 기간을 덮으려면 계약의 allowOverrideValidityOnIssuance가 true여야 합니다
10. [끝] MyAccount 직원 자체 발급 범위 지정 (선택)
   - 주체: 관리자
   - 위치: Verified ID › 설정(Setup) [확인 필요: 한글 메뉴명] — 사용자는 myaccount.microsoft.com › 내 Verified ID 가져오기(Get my Verified ID)
   - 데이터: MyAccount 발급을 허용할 사용자 그룹 선택 또는 MyAccount 옵션 제거(자체 발급 앱 구축) · 변경은 수 분 뒤 반영 · 감사 로그 'Update MyAccount settings'
   - 해설: 직원이 스스로 직원 자격 증명(VerifiedEmployee)을 발급받게 하되 허용 그룹으로 범위를 제한할 수 있습니다. MyAccount는 Entra 사용자 프로필 사진을 자격 증명에 넣으므로 Face Check 용도라면 사진을 먼저 등록해 둡니다
- 시나리오: 예 :: 사용자 지정 도메인이 있어 빠른 설정으로 진행
- 시나리오: 아니오 :: 도메인이 없어 Key Vault 고급 설정으로 진행

> 출처: https://learn.microsoft.com/entra/verified-id/verifiable-credentials-configure-tenant-quick
>
> 출처: https://learn.microsoft.com/entra/verified-id/verifiable-credentials-configure-tenant
>
> 출처: https://learn.microsoft.com/entra/verified-id/how-to-register-didwebsite
>
> 출처: https://learn.microsoft.com/entra/verified-id/how-to-dnsbind
>
> 출처: https://learn.microsoft.com/entra/identity/users/domains-manage
>
> 출처: https://learn.microsoft.com/entra/verified-id/credential-design
>
> 출처: https://learn.microsoft.com/entra/verified-id/how-to-use-quickstart
>
> 출처: https://learn.microsoft.com/entra/verified-id/rules-and-display-definitions-model

#### L4 · ② 활성 — 발급 → 제시 → 검증

1. [시작] 사용자가 자격 증명 발급을 요청
   - 주체: 사용자
   - 위치: MyAccount(myaccount.microsoft.com › 내 Verified ID 가져오기 / Get my Verified ID) 또는 발급 앱의 "자격 증명 받기" 화면
   - 데이터: 요청 대상 자격 증명 종류 · Entra 계정 로그인(MyAccount는 직원 자격 증명 VerifiedEmployee만 발급)
   - 해설: 사용자가 발급 앱에서 자신의 자격 증명 발급을 시작합니다. MyAccount 발급은 관리자가 허용 그룹으로 범위를 제한했을 수 있고 설정 변경은 반영까지 수 분 걸립니다
2. [처리] 발급 앱이 Request Service API를 호출
   - 주체: 앱
   - 위치: POST https://verifiedid.did.msidentity.com/v1.0/verifiableCredentials/createIssuanceRequest (헤더 Authorization: Bearer 토큰 · Content-Type: application/json)
   - 데이터: 앱 액세스 토큰(client credentials, scope 3db474b9-6a0c-4840-96ac-1fceb342124f/.default → roles = VerifiableCredential.Create.All) · authority(발급자 DID) · callback(url·state·headers는 api-key 또는 Authorization만 허용) · registration.clientName · type · manifest · 선택: claims·pin(길이 기본 6, 4~16)·expirationDate(idTokenHint 흐름 전용)
   - 해설: 성공하면 HTTP 201과 requestId·url(딥링크)·expiry·qrCode가 돌아옵니다. callback URL은 인터넷에서 도달 가능해야 하며 콜백은 테넌트와 같은 지역의 Azure 인프라에서 오므로 방화벽에는 AzureCloud 서비스 태그나 해당 지역 CIDR을 허용합니다
3. [처리] 사용자가 QR 코드를 지갑으로 스캔
   - 주체: 사용자
   - 위치: Microsoft Authenticator (지갑) — 카메라 앱으로 스캔하려면 openid-vc:// 프로토콜 처리기가 Authenticator에 등록돼 있어야 함
   - 데이터: 요청 URL · 콜백 requestStatus = request_retrieved
   - 해설: 지갑이 요청을 가져오는 순간 앱의 콜백으로 request_retrieved가 전달됩니다. Android 9 이하는 카메라 앱 스캔이 안 되어 Authenticator로 직접 스캔해야 하고, 업무·개인 프로필이 따로 있는 Android에서는 자격 증명이 있는 프로필의 Authenticator를 써야 합니다
4. [처리] 사용자가 Entra 계정으로 로그인해 ID 토큰 제출
   - 주체: 사용자
   - 데이터: ID 토큰 클레임(given_name · family_name 등) → 규칙 정의의 매핑으로 출력 클레임 생성 · ID 토큰 방식의 redirectUri는 vcclient://openid/ 고정 · idTokenHint 방식은 로그인 없이 앱이 요청의 claims로 값을 전달하고 선택적으로 PIN 입력
   - 해설: 발급자는 토큰 내용을 근거로 자격 증명에 넣을 사실을 확정합니다. 증명 방식은 규칙 정의의 attestations(ID 토큰 · ID 토큰 힌트 · 제시된 자격 증명 · 자체 증명)에 따라 달라지며 ① 9단계처럼 idTokenHints이면 앱이 클레임을 직접 넘깁니다
5. [처리] 발급 서비스가 발급자 DID로 서명해 VC 생성
   - 주체: Entra ID
   - 데이터: Verifiable Credential (발급자 DID · 소유자 DID · 클레임 · 서명 · 만료), 감사 로그 'Verifiable Credential Issued'(LoggedByService = Verified ID · 범주 ResourceManagement), 콜백 requestStatus = issuance_successful
   - 해설: 서명된 자격 증명이 지갑에 저장되고 발급 사실이 감사 로그에 남습니다. 만료는 규칙 정의의 validityInterval이 정하며 발급 요청의 expirationDate(UTC)가 있으면 이를 덮어씁니다. 실패하면 issuance_error(fetch_contract_error · issuance_service_error · unspecified_error)가 콜백으로 옵니다
6. [처리] 사용자가 검증 앱에서 자격 증명을 제시
   - 주체: 사용자
   - 위치: 검증 앱 → POST https://verifiedid.did.msidentity.com/v1.0/verifiableCredentials/createPresentationRequest (같은 Request Service API)
   - 데이터: requestedCredentials: type · acceptedIssuers(비우면 모든 발급자 수락) · constraints(claimName + values/contains/startsWith, 여러 개면 AND, 대소문자 무시) · configuration.validation · registration.clientName(Authenticator에 표시) · includeReceipt(기본 false)
   - 해설: 검증 앱이 어떤 종류를 누가 발급한 것으로 받을지 조건을 만들어 요청합니다. 요청 type은 발급자 매니페스트에 정의된 type과 같아야 하고 callback은 필수입니다
7. [처리] 지갑이 소유자 DID로 서명한 제시(VP)를 제출
   - 주체: 사용자
   - 데이터: Verifiable Presentation (소유자 서명) · 요청 조건(type·발급자·constraints)에 맞는 자격 증명 중 사용자가 고른 것 · includeReceipt = true이면 지갑이 보낸 원본 페이로드(receipt, 디버깅용)가 콜백에 포함
   - 해설: 원본을 건네는 대신 소유자 서명이 붙은 제시를 보내 위·변조를 막습니다
8. [판단] 서명·발급자·폐지 여부가 유효한가?
   - 주체: Entra ID
   - 데이터: DID 문서의 공개 키로 서명 검증 · allowRevoked(기본 false — 폐지된 자격 증명 거부) · validateLinkedDomain(기본 false — false면 도메인 미검증 발급자도 수락) · constraints · faceCheck 조건
   - 해설: 서비스가 발급자 DID와 폐지 상태를 확인해 수락 여부를 판단합니다. 높은 보증이 필요하면 validateLinkedDomain을 true로 지정하고, 실패하면 콜백 presentation_error가 오고, 감사 로그에는 'Verifiable Credential Presentation Failed' 활동이 있습니다 [확인 필요: 모든 실패 유형이 이 활동으로 기록되는지]
   - 예 → 9
   - 아니오 → [차단] 차단 — presentation_error, 제시 실패
9. [끝] presentation_verified 콜백 — 앱이 접근 허용
   - 주체: 로그
   - 데이터: 콜백 requestStatus = presentation_verified, state · subject(사용자 DID) · verifiedCredentialsData[issuer · type · claims · credentialState.revocationStatus(VALID 등) · domainValidation.url · issuanceDate · expirationDate], 감사 로그 'Verifiable Credential Presented'
   - 해설: 검증 앱은 state로 요청을 대조하고 결과를 받아 서비스 이용을 허용하며 감사 로그에 제시가 남습니다. 콜백 결과 크기는 receipt 제외 최대 10 MB입니다
- 시나리오: 예 :: 제시가 유효해 presentation_verified 콜백
- 시나리오: 아니오 :: 제시가 무효라 검증 차단

> 교육 포인트: 신뢰는 "발급자 DID + 도메인 연결"에서 나옵니다. 지갑이 도메인 연결을 검증하면 확인된 발급자로 표시하고, 못 하면 "확인할 수 없는 발급자"라고 경고합니다.
>
> 주의: 빠른 설정은 공유 서명 키라 자격 증명 유효 기간이 최대 6개월로 제한되고 처리량 제한이 있으니 요구사항에 따라 고급 설정을 고릅니다.
>
> 출처: https://learn.microsoft.com/entra/verified-id/decentralized-identifier-overview
>
> 출처: https://learn.microsoft.com/entra/verified-id/verifiable-credentials-configure-tenant-quick
>
> 출처: https://learn.microsoft.com/entra/verified-id/verifiable-credentials-configure-tenant
>
> 출처: https://learn.microsoft.com/entra/verified-id/get-started-request-api
>
> 출처: https://learn.microsoft.com/entra/verified-id/issuance-request-api
>
> 출처: https://learn.microsoft.com/entra/verified-id/presentation-request-api
>
> 출처: https://learn.microsoft.com/entra/verified-id/verifiable-credentials-faq
>
> 출처: https://learn.microsoft.com/entra/identity/monitoring-health/reference-audit-activities

### L3 · A · 발급자 신뢰 설정 — DID · 도메인 · 키로 발급자를 증명

#### L4 · 지갑이 발급자를 믿게 만드는 세 가지 연결

1. [시작] 발급 조직(authority) 생성
   - 주체: 관리자
   - 위치: Entra 관리 센터 › Verified ID › 설정(Setup) (빠른 설정 또는 고급 설정)
   - 데이터: authority (DID · 조직 이름 · 도메인), 감사 로그 'Create authority' · 'Tenant onboarding'(ResourceManagement) · 신뢰 시스템은 web(did:web) — did:ion은 2023-12까지 미리 보기였다가 종료
   - 해설: 설정이 끝나면 발급자 역할을 하는 authority 객체가 만들어집니다. 테넌트를 다시 설정(옵트아웃 후 재온보딩)하면 새 DID가 부여되어 이전 DID는 되찾을 수 없고 자격 증명을 다시 만들고 재발급해야 합니다
2. [처리] 서명 키 보관 방식 결정
   - 주체: 관리자
   - 위치: 빠른 설정은 선택 없음 · 고급 설정은 조직 설정의 Key Vault 항목
   - 데이터: 고급: 내 Key Vault 키(권한 모델 Vault access policy) / 빠른: Microsoft가 관리하는 지역별 공유 키(자격 증명 유효 기간 최대 6개월 · 테넌트당 초당 2건)
   - 해설: 키를 직접 관리하면 통제권이 크고 공유 키는 설정이 간단합니다. 유효 기간·처리량 제한이 요구사항에 걸리면 고급 설정을 고릅니다
3. [처리] DID 문서 게시 — did:web
   - 주체: Entra ID
   - 위치: 빠른: did:web:verifiedid.entra.microsoft.com:테넌트ID:authority-ID (did:web 규격으로 DID 문서 조회) / 고급: 내 웹 서버의 https://도메인/.well-known/did.json
   - 데이터: DID 문서(공개 키 · LinkedDomains 서비스 엔드포인트의 origins), 도메인 기반 did:web 방식(일반 제공)
   - 해설: did:web은 웹 도메인의 기존 평판에 신뢰를 기대는 방식입니다. 고급 설정의 did.json은 익명으로 접근 가능해야 하며 연결 도메인을 바꾸거나 서명 키를 교체하면 다시 게시해야 합니다
4. [처리] 도메인과 DID 연결 — Linked Domain
   - 주체: 관리자
   - 위치: 고급: Verified ID › 개요 › 도메인 소유권 확인(Verify domain ownership)에서 did-configuration.json을 받아 https://도메인/.well-known/did-configuration.json에 업로드 후 새로 고침 / 빠른: 테넌트 사용자 지정 도메인으로 자동 검증
   - 데이터: DIF Well Known DID Configuration 형식의 링크 증명(DID로 서명한 자체 발급 DomainLinkageCredential, origin = 도메인)
   - 해설: 도메인 주인이 이 DID를 쓴다는 사실을 도메인에 게시해 DID와 실제 조직을 묶습니다. Azure Storage 정적 웹 사이트($web 컨테이너의 .well-known 폴더)로 빠르게 호스팅할 수 있고, 웹 신뢰 시스템에서는 연결 도메인 변경이 지원되지 않아 옵트아웃 후 재온보딩해야 합니다
5. [판단] 지갑이 DID ↔ 도메인 연결을 검증할 수 있는가?
   - 주체: 사용자
   - 데이터: 지갑이 DID 문서와 도메인의 링크 증명을 대조 · 조건: DID에 연결 도메인 서비스 엔드포인트가 있고, 루트 도메인이 HTTPS·리디렉션 없음이며, well-known 리소스가 확인되고, 그 안의 자격 증명이 요청에 서명한 DID와 같은 DID로 서명됨
   - 해설: 네 조건 중 하나라도 어긋나면(리디렉션 도메인·HTTP 도메인 포함) 연결이 검증되지 않아 Authenticator가 전체 화면 경고를 보여 줍니다. Authenticator의 'Warn about unsafe apps' 설정은 기본으로 켜져 있습니다
   - 예 → 6
   - 아니오 → [끝] 경고 표시 — 확인할 수 없는 발급자
6. [처리] 지갑이 확인됨 표시 (검증 심볼)
   - 주체: 사용자
   - 위치: Microsoft Authenticator 발급·제시 화면
   - 데이터: 조직 이름 · 도메인 · 검증 심볼
   - 해설: 사용자는 이 표시를 보고 정말 해당 조직이 발급하는 것인지 판단합니다. 이는 지갑 쪽 표시이며 검증 앱이 발급자 도메인을 강제로 확인하려면 제시 요청에서 validateLinkedDomain을 true로 지정해야 합니다
7. [처리] 서명 키 교체 · DID 문서 동기화
   - 주체: 관리자
   - 위치: Admin API(감사 로그 활동명 기준): POST /authorities/{issuerId}/didInfo/signingKeys/rotate · …/synchronizeWithDidDocument [확인 필요: 포털 교체 메뉴 · 요청 형식]
   - 데이터: 감사 로그 'Rotate signing key' · 'Update linked domains' · 'Process POST …/signingKeys/rotate request' · 'Process POST …/synchronizeWithDidDocument request'
   - 해설: 키를 교체하면 DID 문서와 동기화(고급 설정은 did.json 재게시)해야 이후 검증이 이어집니다
8. [끝] 변경 이력이 감사 로그에 남음
   - 주체: 로그
   - 위치: ID › 모니터링 및 상태(Monitoring & health) › 감사 로그(Audit logs) (서비스 필터 Verified ID)
   - 데이터: LoggedByService = Verified ID · 범주 ResourceManagement(발급·제시·관리) 또는 RequestManagement(Verified ID issuance requested · onboarding/verification 이벤트) · KQL: AuditLogs | where LoggedByService == "Verified ID"
   - 해설: 발급자 설정 변경은 다른 Entra 변경과 같은 감사 로그에서 조회합니다. 기본 보관은 라이선스별 7일/30일이므로 장기 보관은 진단 설정으로 내보냅니다
- 시나리오: 예 :: 연결을 검증해 확인됨 표시와 감사 이력 남김
- 시나리오: 아니오 :: 연결을 검증하지 못해 지갑이 경고 표시

> 교육 포인트: 감사 로그의 Verified ID 항목에는 Create authority · Update authority · Create contract · Update contract · Revoke credential · Rotate signing key · Update linked domains · Update MyAccount settings · Verifiable Credential Issued · Verifiable Credential Presented · Verifiable Credential Presentation Failed 같은 활동이 있습니다.
>
> 주의: 발급 요청 기록('Verified ID issuance requested')은 요청일 뿐 발급 완료를 뜻하지 않으니 'Verifiable Credential Issued'와 구분해 읽습니다. 'Verified ID verification completed'·'onboarding completed'도 서로 다른 결과이며 패스키 보증 수준이나 조건부 액세스 허용을 증명하지 않습니다.
>
> 출처: https://learn.microsoft.com/entra/verified-id/verifiable-credentials-configure-tenant
>
> 출처: https://learn.microsoft.com/entra/identity/monitoring-health/reference-audit-activities
>
> 출처: https://learn.microsoft.com/entra/verified-id/how-to-register-didwebsite
>
> 출처: https://learn.microsoft.com/entra/verified-id/how-to-dnsbind
>
> 출처: https://learn.microsoft.com/entra/verified-id/verifiable-credentials-faq

### L3 · B · 신원 확인 연계 — Face Check로 얼굴 일치 확인

#### L4 · 자격 증명 사진과 실시간 셀카를 맞춰 본인 확인

1. [시작] 도움말 데스크가 본인 확인을 요구
   - 주체: 관리자
   - 위치: 서비스 데스크 웹 앱의 "본인 확인" 버튼 → Request Service API 제시 요청
   - 데이터: 요청 사유 예: 패스키 활성화 · 암호 재설정 · 요청 대상 자격 증명 유형(VerifiedEmployee · 정부 발급 신분증 · 사진이 든 사용자 지정 자격 증명)
   - 해설: 목소리나 문서가 아닌 자격 증명과 얼굴 일치로 본인을 확인하려는 상황입니다. 앱은 라이브니스 데이터 없이 일치 신뢰 점수만 받습니다
2. [처리] 사진이 담긴 자격 증명을 준비
   - 주체: 관리자
   - 위치: MyAccount에서 VerifiedEmployee 발급 (사용자 프로필 사진 필요) 또는 사진 클레임이 든 사용자 지정 자격 증명
   - 데이터: 자격 증명의 사진 클레임 (idTokenHint 방식으로 발급 가능) · 표시 정의 claim vc.credentialSubject.photo의 type은 image/jpg;base64url · 규칙 정의 outputClaim photo · 값은 UrlEncode(Base64Encode(JPEG)) · 사진은 200×200픽셀 이상 · 최대 1 MB · 얼굴이 가운데에 가려지지 않게
   - 해설: Face Check는 자격 증명 안의 사진과 현재 얼굴을 비교하므로 사진 클레임이 필요합니다. MyAccount는 Entra 프로필 사진(Graph /me/photos/240x240/$value)을 쓰고, 사용자 지정 자격 증명에서는 JPEG를 준비해 인코딩하는 것이 앱의 책임입니다
3. [처리] Face Check 부가 기능 켜기
   - 주체: 관리자
   - 위치: Verified ID › 개요 › 부가 기능(Add-ons) › Face Check 사용(Enable) › 구독·리소스 그룹·리소스 위치 선택 후 검증(Validate) › 사용 [확인 필요: 한글 메뉴명 · 요금]
   - 데이터: Entra Suite 라이선스면 테넌트 전체, 그 외에는 authority별 ARM REST API(미리 보기: az rest --method PUT …/providers/Microsoft.VerifiedId/authorities/{authority-id}?api-version=2024-01-26-preview, body location은 EU 테넌트 northeurope · 그 외 westus2) · 선행 조건: Verified ID 설정 완료 · 테넌트에 연결된 Azure 구독 · 구독 또는 리소스 그룹의 Contributor 역할
   - 해설: 프리미엄 기능이라 라이선스에 따라 켜는 방법이 다릅니다. 구독이 목록에 보이지 않으면 권한 부족이나 구독이 테넌트에 연결되지 않은 경우이며, authority ID는 Admin API의 GET Authorities로 얻습니다
4. [처리] 검증 앱이 faceCheck가 포함된 제시 요청을 생성
   - 주체: 앱
   - 위치: POST https://verifiedid.did.msidentity.com/v1.0/verifiableCredentials/createPresentationRequest → requestedCredentials[].configuration.validation.faceCheck
   - 데이터: faceCheck.sourcePhotoClaimName(필수) · matchConfidenceThreshold(50~100 정수, 기본 70) · includeReceipt는 false [확인 필요: 문서 간 상충 — 요청 API 문서는 Face Check에 영수증 미지원, Face Check 문서는 receipt의 faceCheck 항목을 설명]
   - 해설: 앱이 사진 클레임 이름과 합격 기준 점수를 요청에 지정합니다. Face Check는 Microsoft Authenticator에서만 되며(주입 공격 방지) 그 외 지갑은 Wallet SDK로 Face Check 없이만 쓸 수 있습니다
5. [처리] 지갑이 사용자의 실시간 셀카(라이브니스)를 촬영
   - 주체: 사용자
   - 위치: Microsoft Authenticator Face Check 화면 (확인 → 검토 단계) — 자격 증명 유형 뒤에 추가로 나타나는 Face Check 항목을 선택
   - 데이터: 라이브니스 영상 · 셀카 · 기기 조건: Android API 26 이상 + Google Play Integrity MEETS_STRONG_INTEGRITY + Play 스토어 설치 Authenticator / iOS 11 이상(탈옥 없음)
   - 해설: 사진 도용을 막기 위해 살아 있는 사람이 직접 찍은 셀카인지도 확인하며 정적 사진이나 2D 영상으로는 통과하기 어렵습니다. 기기 무결성 조건을 못 채우면 OS 버전이 지원돼도 결과가 거부됩니다
6. [처리] Azure AI가 셀카와 자격 증명 사진을 비교
   - 주체: 리소스
   - 위치: 클라우드의 Azure AI Vision Face API(얼굴 검출 · 일치 · 라이브니스) — 기기 안이 아님
   - 데이터: 얼굴 일치 신뢰 점수 (Azure AI 서비스 기반)
   - 해설: 비교는 서비스 안에서 이루어지고 앱에는 일치 점수만 전달됩니다. 셀카는 처리 후 폐기되어 Authenticator·Verified ID·Azure AI 어디에도 저장되지 않습니다
7. [판단] 신뢰 점수가 임계값 이상인가?
   - 주체: Entra ID
   - 데이터: 점수 ≥ matchConfidenceThreshold (점수 50일 때 타인 오인 확률 약 10만분의 1, 90일 때 약 10억분의 1)
   - 해설: 임계값을 높이면 오인식은 줄지만 조명·외모 변화로 정상 사용자의 실패율이 늘 수 있어 균형을 잡아야 합니다. 미달 시 제시 전체가 실패하고 Authenticator가 점수 미달 오류를 보여 줍니다
   - 예 → 8
   - 아니오 → [차단] 차단 — Face Check 실패, 제시 불성립
8. [끝] 앱은 일치 점수만 수신 — 민감 데이터는 비공유
   - 주체: 로그
   - 데이터: presentation_verified 콜백의 verifiedCredentialsData[].faceCheck { matchConfidenceScore(예 86.31) · sourcePhotoQuality(예 HIGH) } (라이브니스 데이터 미공유) · 실패 시 presentation_error { code: claimValidationError, message: Match confidence score failing to meet the threshold } 이며 점수는 앱에 전달되지 않음
   - 해설: 앱은 일치 결과로 본인 확인을 마치고 이후 절차(패스키 등록 등)를 진행합니다
- 시나리오: 예 :: 신뢰 점수가 임계값 이상이라 일치 점수만 앱에 전달
- 시나리오: 아니오 :: 신뢰 점수가 임계값 미만이라 본인 확인 차단

> 교육 포인트: Face Check는 "누가 자격 증명을 만들었나"가 아니라 "지금 자격 증명을 들고 있는 사람이 사진 속 그 사람인가"를 확인합니다.
>
> 주의: Face Check 활성화 방법·요금은 라이선스에 따라 다르며 ARM REST API는 미리 보기입니다 [확인 필요: 미리 보기 · 요금].
>
> 출처: https://learn.microsoft.com/entra/verified-id/using-facecheck
>
> 출처: https://learn.microsoft.com/entra/verified-id/get-started-request-api
>
> 출처: https://learn.microsoft.com/entra/verified-id/presentation-request-api
