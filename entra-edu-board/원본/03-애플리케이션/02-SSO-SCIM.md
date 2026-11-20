## L2 · SSO · SCIM — SaaS 로그인 · 계정 수명 주기

- 설정(Control Plane): 엔터프라이즈 앱 SAML · OIDC · 사용자/그룹 할당 | 프로비저닝 관리 자격 증명 · 특성 매핑 · 범위
- 강제(Enforcement): Entra 로그인 서비스 (SAML 응답 · 토큰 발급) | Entra 프로비저닝 서비스 → 앱의 SCIM 2.0 엔드포인트
- 증적(Evidence): 로그인 로그 (앱 접근 · 조건부 액세스 결과) | Provisioning logs · GET /v1.0/auditLogs/provisioning
- 메뉴(Admin Center): 애플리케이션 > 엔터프라이즈 앱 > 싱글 사인온 · 프로비저닝
- 라이선스(License): 앱 할당 기반 SSO · 프로비저닝은 기본 기능, 그룹 기반 할당은 Entra ID P1 이상 [확인 필요: 고객 라이선스 · 앱별 요구 사항]

### L3 · 0 · 기능 상태 전이 — 앱 로컬 계정 → SSO · 프로비저닝 구성 → 할당부터 로그인까지 자동

#### L4 · ⓪ 비활성 — 앱마다 로컬 계정을 쓰고 퇴사 후에도 남는다

1. [시작] 사용자가 SaaS 앱 주소로 접속 — Entra를 거치지 않음
   - 주체: 사용자
   - 위치: SaaS 앱의 자체 로그인 페이지 (앱 도메인, login.microsoftonline.com으로 넘어가지 않음)
   - 데이터: 앱 로컬 사용자 DB (Entra와 연결 없음) · 앱이 직접 검증하는 ID/암호 또는 앱 자체 인증 수단
   - 해설: 업무용 SaaS 앱의 자체 로그인 화면이 바로 열립니다. Entra가 관여하지 않으므로 조건부 액세스 같은 Entra 정책은 이 로그인에 평가되지 않습니다
2. [처리] 앱 전용 ID와 별도 암호로 로그인
   - 주체: 사용자
   - 위치: SaaS 앱 로그인 화면
   - 데이터: 앱별 암호 · 앱 자체 MFA 설정 (앱마다 다름) · 암호 정책은 앱이 정한 규칙을 따름
   - 해설: 앱마다 암호가 따로라 재사용과 약한 암호가 생기기 쉽습니다. Entra의 암호 정책·MFA 등록은 이 계정에 적용되지 않습니다
3. [처리] 입사·직무 변경 때 앱 관리자가 계정을 수동 처리
   - 주체: 관리자
   - 위치: SaaS 앱 관리 콘솔 (앱별 수동 작업)
   - 데이터: 앱 로컬 사용자 · 역할 (Entra 속성과 동기화 없음)
   - 해설: 생성·권한 조정이 사람 손을 거쳐 누락과 지연이 생깁니다. 부서 이동 같은 속성 변경도 앱에 자동 반영되지 않습니다
4. [처리] 퇴사 시 Entra 계정만 비활성화
   - 주체: 관리자
   - 위치: ID › 사용자 › 모든 사용자 › {사용자} › 속성 › 계정 사용 (Entra ID › Users › All users › {user} › Properties)
   - 데이터: user.accountEnabled = false (앱 계정에는 전파되지 않음) · 삭제하면 휴지통에 들어가 30일 뒤 영구 삭제됨
   - 해설: Entra 계정을 막아도 앱이 따로 가진 계정은 그대로 남습니다. 앱 프로비저닝(SCIM)을 구성하기 전에는 이 변경을 앱으로 알려 주는 경로가 없습니다
5. [끝] 앱 계정과 암호가 남아 접속 가능 — Entra 로그에도 안 보임
   - 주체: 로그
   - 위치: 앱 자체 로그 (Entra 로그인 로그에는 없음)
   - 데이터: 앱 로컬 로그인은 Entra 로그인 로그에 기록되지 않음 (앱 자체 로그만)
   - 해설: 퇴사자의 앱 접근을 Entra에서 막지도, 확인하지도 못합니다. 앱 쪽 계정 목록을 직접 대조해야 합니다

#### L4 · ① 구성 — 엔터프라이즈 앱에 SAML SSO와 프로비저닝을 설정한다

1. [시작] 엔터프라이즈 앱 추가 — 갤러리 앱 또는 직접 만든 앱
   - 주체: 관리자
   - 위치: 애플리케이션 › 엔터프라이즈 앱 › 새 애플리케이션 › Microsoft Entra 갤러리 (Entra ID › Enterprise apps › New application › Browse Microsoft Entra Gallery)
   - 데이터: 테넌트에 서비스 주체(servicePrincipal) 생성 · 필요 역할 Cloud Application Administrator 이상
   - 해설: 앱을 테넌트에 추가하면 앱의 로그인·프로비저닝 설정 화면이 열립니다. 갤러리 앱은 앱별 튜토리얼에 SSO·프로비저닝 입력값이 정리되어 있습니다
2. [처리] 로그인 대상 제한 — 할당 필요 + 사용자·그룹 할당
   - 주체: 관리자
   - 위치: 엔터프라이즈 앱 › {앱} › 속성 › 할당 필요(Assignment required?) = 예 / 사용자 및 그룹 › 사용자 또는 그룹 추가
   - 데이터: servicePrincipal.appRoleAssignmentRequired = true · appRoleAssignedTo · 그룹 할당은 P1/P2 필요, 할당 그룹은 SecurityEnabled=True여야 하고 중첩 그룹의 멤버는 인식되지 않음 (직접 멤버만)
   - 해설: 할당된 사용자만 로그인하고 프로비저닝 범위도 같은 할당을 씁니다. 할당 필요 = 아니요이면 테넌트의 모든 사용자(초대된 외부 사용자 포함)가 로그인할 수 있고, Global Administrator는 할당 필요 설정과 관계없이 로그인할 수 있습니다
3. [처리] 싱글 사인온 방식으로 SAML 선택
   - 주체: 관리자
   - 위치: 엔터프라이즈 앱 › {앱} › 싱글 사인온 › SAML (Set up Single Sign-On with SAML 페이지)
   - 데이터: 멀티 테넌트 앱은 SAML 설정이 회색으로 비활성 [확인 필요: 앱 유형별]
   - 해설: 앱이 SAML을 지원하면 Entra가 로그인을 대신 처리하도록 연결합니다. 이 화면에서 기본 SAML 구성 · 특성 및 클레임 · SAML 인증서를 차례로 설정합니다
4. [처리] 기본 SAML 구성 입력 — 식별자 · 회신 URL
   - 주체: 관리자
   - 위치: 싱글 사인온 › 기본 SAML 구성 › 편집
   - 데이터: Identifier(Entity ID) · Reply URL(ACS URL) · Sign on URL (앱이 알려 준 값을 그대로 입력)
   - 해설: 앱이 알려 준 값으로 응답을 어디로 보낼지 Entra에 등록합니다. 등록값이 앱 쪽 설정과 어긋나면 로그인이 실패하므로 앱이 알려 준 값과 정확히 맞춥니다
5. [처리] 특성 및 클레임 확인 — NameID와 사용자 특성
   - 주체: 관리자
   - 위치: 싱글 사인온 › 특성 및 클레임(Attributes & Claims) › 편집 › 고유 사용자 식별자(Name ID) · 필요 역할 Cloud Application Administrator 이상
   - 데이터: NameID 원본 속성 (이메일 · UPN · onpremisessamaccountname · 개체 ID · 직원 ID · 디렉터리 확장 · 확장 특성 1-15 · pairwiseid) + NameID 형식 (기본 · 영구 · 이메일 주소 · 지정되지 않음 · Windows 도메인 정규화 이름) + 추가 클레임
   - 해설: 앱이 계정을 찾는 키와 앱이 요구하는 특성을 토큰에 담도록 정합니다. 앱이 보낸 요청에 NameIDPolicy 형식이 있으면 포털 설정보다 그 형식이 우선하고, 요청에 없을 때만 설정한 형식을 씁니다. Transient 형식은 지원되지만 드롭다운에 없어 포털에서 설정할 수 없습니다
6. [처리] SAML 서명 인증서를 받아 앱에 등록
   - 주체: 관리자
   - 위치: 싱글 사인온 › SAML 인증서 › 인증서(Base64) 다운로드 → SaaS 앱 SAML 설정에 업로드 (연필 아이콘 › SAML 서명 인증서 페이지에서 새 인증서 · 활성화 · 알림 이메일 관리)
   - 데이터: 서명 인증서 지문 · 만료일 (자동 생성 인증서는 기본 3년, 저장 뒤에는 만료일 변경 불가) · 상태 Active/Inactive · 로그인 URL · Entra 식별자 · 로그아웃 URL · 다운로드 형식 Base64 · Raw(바이너리) · PEM · 페더레이션 메타데이터 XML (앱 요구에 따라 표시)
   - 해설: 앱이 Entra가 서명한 응답만 믿도록 인증서와 URL 값을 앱에 넣습니다. 만료 알림 이메일은 만료 60·30·7일 전에 가며 기본 수신자는 앱을 추가한 관리자 한 명뿐이므로 수신 주소를 추가합니다. 새 인증서를 만든 뒤 앱에 올리고 나서 '인증서 활성화(Make certificate active)'로 전환합니다
7. [처리] SSO 테스트 — 할당된 사용자로 로그인
   - 주체: 관리자
   - 위치: 싱글 사인온 › 테스트 (Test single sign-on)
   - 데이터: 로그인 로그 (앱 · 사용자 · 결과) · 테스트 사용자는 앱에 할당돼 있어야 함 (미할당이면 AADSTS50105)
   - 해설: 프로비저닝 전에 로그인만 먼저 성공하는지 확인합니다. 실패하면 로그인 로그의 오류 코드로 어느 단계에서 막혔는지 확인합니다
8. [처리] 프로비저닝 모드를 자동으로 — 관리 자격 증명 입력
   - 주체: 관리자
   - 위치: 엔터프라이즈 앱 › {앱} › 프로비저닝 › 모드 = 자동 › 관리자 자격 증명 › 연결 테스트
   - 데이터: 앱의 SCIM 엔드포인트 URL · 인증 토큰 (입력 항목은 앱마다 다름, 갤러리 앱은 앱 튜토리얼 · 비갤러리 앱은 SCIM 문서 참조) · 알림 이메일
   - 해설: Entra가 앱의 사용자 관리 API에 접속할 자격 증명을 등록하고 테스트합니다. 연결은 HTTPS TLS 1.2로 암호화되며, 프로비저닝 서비스는 앱이 제공한 SCIM 2.0 엔드포인트(또는 온-프레미스 프로비저닝 에이전트)에 연결합니다
9. [처리] 매핑 · 범위 · 대상 동작 설정
   - 주체: 관리자
   - 위치: 프로비저닝 › 매핑 (Create · Update · Delete 대상 동작) / 프로비저닝 › 설정 › 범위 = 할당된 사용자 및 그룹만 동기화 / 프로비저닝 › 범위 지정 필터(Scoping filters)
   - 데이터: 특성 매핑 · 일치 특성(Match objects using this attribute) · 알림 이메일 · 범위 지정 필터 (조건 절은 AND, 필터 여러 개는 OR로 평가 · EQUALS 연산자는 대소문자 구분)
   - 해설: 어떤 특성을 어떤 키로 맞춰 만들고 갱신할지, 누구를 대상으로 할지 정합니다. 대상 동작에서 Create/Update/Delete를 끄면 그 작업은 앱으로 보내지 않고, 값이 비어 있는(null) 특성은 프로비저닝되지 않습니다. 범위를 '모든 사용자 및 그룹 동기화'로 두면 첫 주기에 테넌트 전체를 평가하므로 할당 기반 범위가 더 빠릅니다
10. [끝] 프로비저닝 상태 켜기 — 초기 주기 시작
   - 주체: 관리자
   - 위치: 프로비저닝 › 프로비저닝 상태 = 켜기 → 저장 (진행률은 프로비저닝 페이지 하단 Current Status에서 확인)
   - 데이터: 초기 주기 시작 · 이후 약 40분 간격 증분 주기 (상태 화면 기준 대체로 20-40분) · 초기 주기 소요 시간 문서 추정식: 범위 대상(사용자·그룹·그룹 멤버) 수 × 0.01~0.08분
   - 해설: 켜는 순간 할당된 사용자부터 앱 계정을 맞추기 시작합니다. 대상이 모두 앱에 새로 만들어지는 작업은 이미 있는 계정과 일치시키는 작업보다 약 2배 오래 걸립니다

#### L4 · ② 활성 — 할당된 사용자의 계정이 만들어지고 SSO로 로그인한다

1. [시작] 사용자나 그룹이 앱에 할당된다
   - 주체: 관리자
   - 위치: 엔터프라이즈 앱 › {앱} › 사용자 및 그룹
   - 데이터: appRoleAssignment 생성 (그룹 멤버십 변경 포함) · 동적 그룹은 멤버십 평가가 끝나야 변경이 반영됨
   - 해설: 할당이 곧 로그인 허용이자 프로비저닝 범위 편입 신호입니다. 그룹으로 할당하려면 P1/P2가 필요하고, 사용자가 동적 그룹 멤버십을 잃으면 그 자체가 프로비저닝 해제 이벤트가 됩니다
2. [처리] 프로비저닝 서비스가 변경분을 감지 — 증분 주기
   - 주체: Entra ID
   - 위치: Entra 프로비저닝 서비스 (서비스 내부)
   - 데이터: Microsoft Graph delta query · 마지막 워터마크 · 약 40분 간격
   - 해설: 서비스가 마지막 주기 이후 바뀐 사용자·그룹만 읽어 옵니다. 할당 직후에도 즉시 만들어지지 않고 다음 주기를 기다리므로, 급히 확인할 사용자는 '주문형 프로비저닝'으로 시험합니다
3. [판단] 사용자가 프로비저닝 범위 안에 있는가?
   - 주체: Entra ID
   - 위치: 프로비저닝 › 설정 › 범위 · 범위 지정 필터
   - 데이터: 할당 여부 · 범위 지정 필터 결과 · 게스트(B2B) 사용자는 프로비저닝 가능하지만 UPN의 #EXT# 부분이 제거된 값으로 일치·전달됨 (원본이 필요하면 originalUserPrincipalName 사용)
   - 해설: 할당되지 않았거나 필터에 걸리면 앱에 계정을 만들지 않습니다. 중첩 그룹의 멤버는 읽지 못합니다
   - 예 → 4
   - 아니오 → [차단] 대상 제외 — 앱에 계정을 만들지 않음
4. [처리] 앱에서 일치하는 사용자를 조회
   - 주체: Entra ID
   - 위치: 앱의 SCIM 엔드포인트 (필터 조회 요청)
   - 데이터: 매핑의 일치 특성 (예: userPrincipalName ↔ userName) · 앱이 일치 특성으로 필터 조회를 지원해야 함
   - 해설: 이미 앱에 같은 사용자가 있으면 새로 만들지 않고 그 계정에 연결합니다. 앱이 일치 특성 필터링을 지원하지 않으면 연결 테스트 단계에서 실패할 수 있어 앱 개발사의 API 문서로 지원 여부를 확인합니다
5. [처리] SCIM 호출로 계정 생성 · 갱신
   - 주체: Entra ID
   - 위치: 앱의 SCIM 2.0 엔드포인트 (HTTPS TLS 1.2)
   - 데이터: 매핑된 특성 (userName · displayName · emails · active 등) · 앱의 사용자 ID 캐시
   - 해설: 매핑된 특성을 담아 앱의 사용자 관리 API로 계정을 만들거나 고칩니다. 계정이 만들어지면 앱이 돌려준 ID를 캐시해 이후 작업에 씁니다
6. [처리] 프로비저닝 로그에 결과 기록
   - 주체: 로그
   - 위치: 애플리케이션 › 엔터프라이즈 앱 › 프로비저닝 로그 (앱의 프로비저닝 페이지 › View Provisioning Logs)
   - 데이터: Provisioning logs — 소스 · 대상 ID · 작업(Create · Update · Delete · Disable · StagedDelete · Other) · 상태(Success · Failure · Skipped · Warning)
   - 해설: 사용자별 성공·실패와 읽고 쓴 특성이 로그로 남고 단계(Steps) 탭에서 가져오기·일치·범위·동기화 전 평가·생성/갱신 단계를 볼 수 있습니다. 로그 항목은 시스템이 생성하며 수정·삭제할 수 없습니다
7. [처리] 사용자가 앱에 접속 — Entra로 이동
   - 주체: 사용자
   - 위치: My Apps 또는 앱 주소 → login.microsoftonline.com
   - 데이터: SAML 로그인 요청 (앱 식별자 · 회신 URL)
   - 해설: 이제 사용자는 앱 암호 대신 Entra 로그인으로 들어옵니다. 앱이 먼저 시작하면(SP 시작) 앱 URL에서, My Apps 타일에서 시작하면(IdP 시작) 바로 Entra에서 출발합니다
8. [판단] 할당 · 조건부 액세스 요구를 충족하는가?
   - 주체: Entra ID
   - 위치: 엔터프라이즈 앱 › {앱} › 속성 · 보호 › 조건부 액세스 › 정책
   - 데이터: 앱 할당 · 조건부 액세스 정책 평가 결과 (MFA · 기기 · 위치) · 미할당 시 AADSTS50105
   - 해설: 할당과 정책을 모두 통과해야 응답이 만들어집니다
   - 예 → 9
   - 아니오 → [차단] 차단 — 미할당 또는 정책 미충족
9. [처리] 서명된 SAML 응답을 앱의 ACS로 전달
   - 주체: Entra ID
   - 위치: 브라우저를 거쳐 앱의 회신 URL(ACS)로 POST
   - 데이터: SAML 어설션 (NameID · 클레임) · 서명 인증서로 서명
   - 해설: 브라우저가 서명된 응답을 앱 회신 URL로 보냅니다. 인증서 만료 여부를 검증하지 않는 앱은 인증서가 양쪽에 같게 등록돼 있으면 만료 뒤에도 통과할 수 있어, 앱이 만료 검증을 하는지 확인합니다
10. [끝] 앱이 NameID로 계정을 찾아 세션 시작 — 로그인 로그 기록
   - 주체: 앱
   - 위치: 앱 쪽 세션 · Entra 로그인 로그
   - 데이터: 로그인 로그 (앱 · 사용자 · 조건부 액세스 결과) · 앱 쪽 세션
   - 해설: 프로비저닝된 계정이 미리 있어 첫 로그인이 바로 성공합니다. 앱 계정의 로그인 키(예: 이메일)와 SAML NameID 값이 다르면 계정을 찾지 못해 앱이 거부합니다
- 시나리오: 예 ▸ 예 :: 범위·할당 충족해 SAML 응답으로 SSO 로그인
- 시나리오: 예 ▸ 아니오 :: 범위 안이나 할당·CA 미충족으로 접속 차단
- 시나리오: 아니오 :: 프로비저닝 범위 밖이라 대상 제외

> 교육 포인트: SSO는 "로그인", SCIM 프로비저닝은 "계정 수명 주기"입니다. 둘은 따로 구성하며, 같은 사용자·그룹 할당을 공유합니다.
>
> 주의: 갤러리 앱이라도 프로비저닝 입력 항목(테넌트 URL·토큰 등)은 앱마다 다릅니다. 앱별 튜토리얼을 먼저 확인합니다.
>
> 출처: https://learn.microsoft.com/entra/identity/enterprise-apps/add-application-portal-setup-sso
>
> 출처: https://learn.microsoft.com/entra/identity/app-provisioning/configure-automatic-user-provisioning-portal
>
> 출처: https://learn.microsoft.com/entra/identity/app-provisioning/how-provisioning-works
>
> 출처: https://learn.microsoft.com/entra/identity/app-provisioning/define-conditional-rules-for-provisioning-user-accounts
>
> 출처: https://learn.microsoft.com/entra/identity/app-provisioning/application-provisioning-when-will-provisioning-finish-specific-user
>
> 출처: https://learn.microsoft.com/entra/identity/monitoring-health/concept-provisioning-logs
>
> 출처: https://learn.microsoft.com/entra/identity/enterprise-apps/application-properties

### L3 · A · SAML/OIDC SSO 로그인 — 요청이 지나는 판정과 토큰

#### L4 · 로그인 요청 → 할당 · 정책 판정 → 응답 · 토큰 발급

1. [시작] 사용자가 앱을 시작 — 앱 주소 또는 My Apps
   - 주체: 사용자
   - 위치: 앱 URL (SP 시작) 또는 My Apps 타일 (IdP 시작)
   - 데이터: 앱이 보내는 로그인 요청 (Issuer · 회신 URL)
   - 해설: 앱이 먼저 Entra로 보내거나 My Apps에서 바로 시작합니다. My Apps에는 앱에 할당된 사용자·그룹의 타일로 보입니다
2. [판단] 앱 로그인이 허용되고 사용자가 할당됐는가?
   - 주체: Entra ID
   - 위치: 엔터프라이즈 앱 › {앱} › 속성 (사용자 로그인 사용(Enabled for users to sign-in?) · 할당 필요(Assignment required?))
   - 데이터: servicePrincipal.accountEnabled · appRoleAssignmentRequired · 사용자 할당 · 거부 시 AADSTS50105
   - 해설: 로그인 사용이 꺼졌거나 할당 필요인데 미할당이면 토큰을 받을 수 없습니다. 로그인 사용 = 아니요이면 할당 여부와 관계없이 아무도 로그인하지 못하고 서비스 주체의 앱 권한 접근도 막히며, 이때 활성화 상태가 '비활성(Deactivated)'으로 보입니다. 할당 필요는 SAML · OIDC · OAuth 2.0 · WS-Federation · 사전 인증을 쓰는 Application Proxy 앱에 적용되고 Global Administrator는 예외입니다
   - 예 → 3
   - 아니오 → [차단] 차단 — 앱 미할당 또는 로그인 사용 안 함
3. [판단] 조건부 액세스 요구를 충족하는가?
   - 주체: Entra ID
   - 위치: 보호 › 조건부 액세스 › 정책 (Entra ID › Conditional Access › Policies, 대상 리소스 = 해당 앱)
   - 데이터: 사용자 · 위치 · 기기 · 위험 신호 → 허용 · MFA 요구 · 차단
   - 해설: 정책이 이 앱을 대상으로 하면 로그인 때마다 요구 사항을 평가합니다. 결과는 로그인 로그의 조건부 액세스 탭에서 정책별로 확인합니다
   - 예 → 4
   - 아니오 → [차단] 차단 — MFA · 기기 · 위치 요구 미충족
4. [판단] 이 앱은 어떤 프로토콜로 연결돼 있는가?
   - 주체: Entra ID
   - 위치: 엔터프라이즈 앱 › {앱} › 싱글 사인온 (SAML) · 앱 등록 (OIDC)
   - 데이터: SAML 구성 여부 (엔터프라이즈 앱) vs OIDC 앱 등록 (OAuth 동의 기반)
   - 해설: SAML은 어설션을, OIDC는 ID 토큰을 발급하는 경로로 갈라집니다
   - SAML → 5
   - OIDC → 7
5. [처리] SAML 클레임을 구성 — NameID와 특성
   - 주체: Entra ID
   - 위치: 싱글 사인온 › 특성 및 클레임 (Attributes & Claims)
   - 데이터: nameID · 추가 클레임 · 변환 함수 (ExtractMailPrefix · Join · ToLower · Extract · RegexReplace 등, 클레임 하나당 변환은 최대 2개, 정규식 치환은 총 20개까지) · 조건부 클레임(사용자 유형 Any/Members/All guests/Entra guests/External guests · 그룹)
   - 해설: 구성한 원본 속성과 변환 규칙으로 앱이 쓸 클레임을 만듭니다. 다중 값 특성에 변환을 모두 적용하려면 'Treat source as multivalued'를 선택합니다. UPN 클레임은 SAML 제한 클레임 집합에 속해, 사용자 지정 서명 키가 있으면 특성 및 클레임에서 추가하고 없으면 앱 등록의 선택적 클레임(SAML 토큰 유형)으로 추가합니다
6. [처리] 서명 인증서로 SAML 어설션에 서명 후 앱으로 전달
   - 주체: Entra ID
   - 데이터: SAML 응답 (서명 · 대상 URL=회신 URL)
   - 해설: 브라우저가 서명된 응답을 앱의 ACS URL로 POST합니다. 서명에는 앱의 SAML 서명 인증서 중 활성(Active) 상태인 것을 쓰고, 만료된 인증서가 있어도 유효한 비활성 인증서가 있으면 그것이 서명에 쓰입니다
   - 다음 → 9
7. [처리] OIDC — 요청 권한과 동의 기록 확인
   - 주체: Entra ID
   - 위치: /authorize 요청 (client_id · redirect_uri · scope)
   - 데이터: oauth2PermissionGrant (동의 기록) · 요청 scope
   - 해설: OIDC 앱은 요청 권한에 대한 동의가 있어야 토큰이 나갑니다
8. [처리] OIDC — ID 토큰 · 액세스 토큰 발급
   - 주체: Entra ID
   - 데이터: id_token 클레임 (sub · oid · tid 등) · 액세스 토큰 scp
   - 해설: 앱 등록의 설정에 따라 토큰을 만들어 앱 리디렉션 URI로 돌려줍니다
9. [판단] 앱이 서명 · 대상을 검증하고 계정을 찾았는가?
   - 주체: 앱
   - 데이터: 서명 인증서 일치 · 만료 여부 · NameID(또는 sub)와 앱 로컬 계정 매칭
   - 해설: 인증서가 만료되었거나 계정이 없으면 앱이 로그인을 거부합니다. 만료 검증이 없는 앱은 인증서가 양쪽에 일치하면 만료 뒤에도 접속되므로 앱의 만료 검증 여부를 확인하고, 인증서를 교체할 때는 앱에 새 인증서를 올린 뒤에 Entra에서 활성화합니다
   - 예 → 10
   - 아니오 → [차단] 로그인 실패 — 인증서 불일치 · 만료 또는 계정 없음
10. [끝] 앱 세션 시작 + 로그인 로그 기록
   - 주체: 로그
   - 위치: 모니터링 및 상태 › 로그인 로그
   - 데이터: SigninLogs — 앱 · 사용자 · 조건부 액세스 결과 · 오류 코드
   - 해설: 어떤 단계에서 막혔는지 로그인 로그의 오류 코드로 확인합니다. 앱이 자체 세션을 열고 난 뒤의 사용 기록은 앱 쪽 로그에만 남습니다
- 시나리오: 예 ▸ 예 ▸ SAML ▸ 예 :: SAML 검증을 통과해 앱 세션 시작과 로그 기록
- 시나리오: 예 ▸ 예 ▸ SAML ▸ 아니오 :: SAML 서명·대상 검증이나 계정 확인 실패로 로그인 실패
- 시나리오: 예 ▸ 예 ▸ OIDC ▸ 예 :: OIDC 검증을 통과해 앱 세션 시작과 로그 기록
- 시나리오: 예 ▸ 예 ▸ OIDC ▸ 아니오 :: OIDC 서명·대상 검증이나 계정 확인 실패로 로그인 실패
- 시나리오: 예 ▸ 아니오 :: 할당은 됐으나 조건부 액세스 미충족으로 차단
- 시나리오: 아니오 :: 로그인 불허 또는 미할당 사용자라 차단

> 교육 포인트: SAML 서명 인증서는 앱 쪽에도 등록되어 있어, 만료·교체 때 양쪽이 일치해야 합니다. 만료 알림 이메일(60·30·7일 전)을 받을 주소를 미리 지정합니다.
>
> 주의: 앱이 보낸 SAML 요청에 NameIDPolicy 형식이 있으면 Entra는 그 형식을 따르고, 요청에 없을 때만 포털에서 설정한 형식(미설정이면 원본 속성의 기본 형식)을 씁니다. 따라서 포털에서 형식을 바꿔도 앱 요청이 우선합니다.
>
> 출처: https://learn.microsoft.com/entra/identity-platform/saml-claims-customization
>
> 출처: https://learn.microsoft.com/entra/identity/enterprise-apps/application-properties
>
> 출처: https://learn.microsoft.com/entra/identity/enterprise-apps/tutorial-manage-certificates-for-federated-single-sign-on
>
> 출처: https://learn.microsoft.com/troubleshoot/entra/entra-id/app-integration/error-code-aadsts50105-user-not-assigned-role

### L3 · B · 프로비저닝 — 초기 주기 · 증분 주기 · 특성 매핑 · 범위

#### L4 · 초기 주기로 맞춘 뒤 증분 주기로 변경분만 반영한다

1. [시작] 프로비저닝 상태를 켠다 — 초기 주기 시작
   - 주체: 관리자
   - 위치: 엔터프라이즈 앱 › {앱} › 프로비저닝 › 프로비저닝 상태 = 켜기
   - 데이터: 동기화 작업(synchronizationJob) 시작 · 워터마크 없음
   - 해설: 처음 켜면 서비스가 전체를 한 번 훑는 초기 주기를 돕니다. '프로비저닝 다시 시작(Restart provisioning)'은 워터마크를 지워 모든 대상을 다시 평가하지만 소스와 대상 사이의 연결(링크)은 끊지 않으며, 연결까지 끊으려면 Graph synchronizationJob restart에서 resetScope=Full을 씁니다
2. [처리] 소스(Entra)에서 사용자 · 그룹을 모두 조회
   - 주체: Entra ID
   - 위치: Entra 프로비저닝 서비스 (소스 시스템 = Microsoft Entra ID)
   - 데이터: 매핑에 정의된 모든 특성 (Microsoft Graph delta query 기준)
   - 해설: 매핑에 쓰는 특성을 한꺼번에 읽어 이후 비교의 기준을 만듭니다. 값이 비어 있는 특성은 프로비저닝되지 않습니다
3. [처리] 범위 필터링 — 할당 기반 + 범위 지정 필터
   - 주체: Entra ID
   - 위치: 프로비저닝 › 설정 › 범위 / 프로비저닝 › 관리 › 범위 지정 필터(Scoping filters) › 사용자 · 그룹 탭 (범위 설정 → 할당별 범위 → 사용자 및 그룹 → 특성별 범위 → 검토)
   - 데이터: 할당된 사용자·그룹 · 특성 기반 범위 지정 필터 (연산자 예: EQUALS(대소문자 구분) · ENDS_WITH · Greater_Than 등, 절은 AND · 필터 간은 OR)
   - 해설: 할당만으로 충분하면 할당된 사용자만 동기화해 속도도 높입니다. 범위 지정 필터는 할당 기반 범위에 더해 선택적으로 씁니다
4. [처리] 특성 매핑 적용 — 소스 특성을 앱 특성으로 변환
   - 주체: Entra ID
   - 위치: 프로비저닝 › 매핑 › Provision Microsoft Entra ID Users
   - 데이터: 직접 · 상수 · 표현식 매핑 (예: 이름 조합) → SCIM 사용자 스키마
   - 해설: 앱이 이해하는 형식으로 값을 바꿔 보낼 준비를 합니다. 앱마다 미리 구성된 기본 매핑이 있고 추가·변경·삭제할 수 있습니다
5. [판단] 앱에 일치하는 사용자가 이미 있는가?
   - 주체: Entra ID
   - 위치: 프로비저닝 › 매핑 › 일치 특성(Match objects using this attribute)
   - 데이터: 일치 특성 질의 결과 (예: userName = UPN)
   - 해설: 일치 특성으로 같은 사람을 찾으면 중복 계정을 막을 수 있습니다. 일치 특성은 두 시스템에서 사용자를 유일하게 식별할 값으로 정해야 합니다
   - 예 → 6
   - 아니오 → 7
6. [처리] 일치한 사용자를 갱신
   - 주체: Entra ID
   - 위치: 앱 SCIM 엔드포인트 (PATCH · PUT)
   - 데이터: 매핑된 특성 · 앱의 사용자 ID (캐시)
   - 해설: 기존 계정에 Entra 값을 덮어쓰고 앱 ID를 기억해 둡니다. 대상 동작에서 Update를 껐다면 갱신하지 않습니다
   - 다음 → 8
7. [처리] 새 사용자를 생성
   - 주체: Entra ID
   - 위치: 앱 SCIM 엔드포인트 (POST /Users)
   - 데이터: 매핑된 특성 · 생성 후 앱이 돌려준 사용자 ID (캐시)
   - 해설: 없으면 새로 만들고, 이후 작업은 캐시한 앱 ID로 처리합니다. 대상 동작에서 Create를 껐다면 만들지 않습니다
8. [처리] 참조 특성 연결 · 워터마크 저장 — 초기 주기 종료
   - 주체: Entra ID
   - 데이터: 관리자(manager) 같은 참조 특성 · 새 워터마크
   - 해설: 관계 특성까지 맞춘 뒤 다음 주기의 시작점을 저장합니다. 앱이 그룹 프로비저닝을 지원하면(ServiceNow · G Suite · Box 등) 사용자 다음에 그룹과 멤버십을 동기화합니다
9. [처리] 증분 주기 반복 — 약 40분 간격
   - 주체: Entra ID
   - 데이터: 워터마크 이후 변경된 사용자·그룹만 조회
   - 해설: 이후에는 바뀐 것만 같은 절차로 처리하며, 시작점은 매번 갱신됩니다. 증분 주기는 서비스를 중지하거나, 프로비저닝을 다시 시작하거나, 매핑·범위 필터를 바꿔 새 초기 주기가 시작되거나, 격리가 4주를 넘겨 자동 비활성화될 때까지 계속됩니다
10. [끝] 실패 건은 점진적으로 재시도 · 프로비저닝 로그 기록
   - 주체: 로그
   - 위치: 프로비저닝 로그 (사용자별 작업 · 상태 · 오류)
   - 데이터: 필수 특성 누락 · 값 충돌(고유 제약) 같은 실패 사유
   - 해설: 실패 건은 다음 주기에 재시도되며 재시도 간격은 점점 늘어납니다. 원인은 로그의 '문제 해결 및 권장 사항' 탭에서 확인하고, 소스 값을 고치거나 매핑을 바꿔 충돌을 없앱니다
- 시나리오: 예 :: 기존 사용자 일치로 갱신하고 증분 주기 반영
- 시나리오: 아니오 :: 일치하는 사용자가 없어 새로 생성하고 반영

> 교육 포인트: 매핑·범위·일치 특성을 바꾸면 새 초기 주기가 시작되어 모든 대상이 다시 평가됩니다. 변경 전에 영향 범위를 확인합니다.
>
> 예시: 문제 사용자 한 명은 "Provision on demand"로 즉시 시험해 범위 필터와 표현식을 검증할 수 있습니다. 엔터프라이즈 앱 › {앱} › 프로비저닝 › Provision on demand에서 Application Owner 또는 Application Administrator가 실행하며, 그룹을 고르면 멤버 5명까지만 처리됩니다. OAuth 방식 인증 앱(G Suite · Box · Slack 등)은 프로비저닝 작업을 멈춘 뒤에 써야 하고, 중첩 그룹 · 역할 프로비저닝 · 삭제/비활성화된 사용자 처리는 지원되지 않습니다.
>
> 주의: 중첩 그룹의 멤버는 프로비저닝 대상이 되지 않습니다. 직접 멤버만 읽습니다.
>
> 출처: https://learn.microsoft.com/entra/identity/app-provisioning/how-provisioning-works
>
> 출처: https://learn.microsoft.com/entra/identity/app-provisioning/application-provisioning-when-will-provisioning-finish-specific-user
>
> 출처: https://learn.microsoft.com/entra/identity/app-provisioning/provision-on-demand
>
> 출처: https://learn.microsoft.com/entra/identity/app-provisioning/define-conditional-rules-for-provisioning-user-accounts

### L3 · C · 퇴사자 비활성화 · 격리 — 계정 정리와 프로비저닝 중단

#### L4 · 퇴사 처리가 앱 계정 비활성화로 이어지고 실패하면 격리된다

1. [시작] 퇴사 처리 — 사용자 비활성화 또는 삭제
   - 주체: 관리자
   - 위치: ID › 사용자 › 모든 사용자 › {사용자} (속성 › 계정 사용 해제 또는 삭제)
   - 데이터: accountEnabled = false 또는 소프트 삭제 (30일 뒤 영구 삭제)
   - 해설: 퇴사를 Entra에 반영하는 일이 앱 정리의 출발점입니다. 앱 정리는 이 사용자가 이전에 프로비저닝 범위였던 경우에만 일어납니다
2. [처리] 증분 주기가 변경을 감지
   - 주체: Entra ID
   - 위치: Entra 프로비저닝 서비스 (증분 주기)
   - 데이터: 소스의 비활성 · 소프트 삭제 · 할당 해제 · 범위 이탈 이벤트
   - 해설: 다음 주기(약 40분)에 퇴사·범위 이탈을 변경분으로 읽습니다. 앱 할당 해제 · 범위 필터 이탈 · 소프트 삭제 · 영구 삭제의 네 가지가 모두 비활성화 또는 삭제 트리거입니다
3. [판단] 이 사용자가 이전에 프로비저닝 범위였는가?
   - 주체: Entra ID
   - 데이터: 서비스가 캐시한 관리 대상 계정 목록
   - 해설: 서비스가 만든 적 없는 앱 계정은 건드리지 않도록 캐시로 구분합니다
   - 예 → 4
   - 아니오 → [차단] 대상 아님 — 앱의 비관리 계정은 변경하지 않음
4. [처리] 앱에 비활성화 요청 — SCIM active = false
   - 주체: Entra ID
   - 위치: 앱 SCIM 엔드포인트 (PATCH) · 프로비저닝 › 매핑 › active / IsSoftDeleted
   - 데이터: active 특성 매핑 · 대상 동작 Update 사용 여부 · 범위 이탈 시 비활성화를 건너뛰는 'skip out-of-scope deletions' 플래그
   - 해설: 기본은 계정을 지우지 않고 로그인할 수 없는 상태로 만듭니다(SCIM 앱은 active=false 요청). 대상 동작에서 Update 체크가 꺼져 있거나 active/IsSoftDeleted 매핑이 없으면 비활성화가 전달되지 않습니다
5. [판단] 사용자가 영구 삭제되었는가?
   - 주체: Entra ID
   - 데이터: 소프트 삭제 30일 경과 또는 휴지통에서 수동 영구 삭제
   - 해설: 영구 삭제가 되면 앱에도 삭제 요청을 보낼 수 있습니다
   - 예 → 6
   - 아니오 → 7
6. [처리] 앱에 삭제 요청 — DELETE
   - 주체: Entra ID
   - 위치: 앱 SCIM 엔드포인트 (DELETE) · 매핑 › 대상 개체 동작 › Delete
   - 데이터: Delete 동작을 선택한 경우만 전송
   - 해설: 삭제 동작을 켜 둔 경우에만 앱에서 계정이 완전히 제거됩니다. 앱이 소프트 삭제(비활성화)를 지원하지 않으면 서비스가 처음부터 DELETE를 보내기도 합니다
   - 다음 → 8
7. [처리] 비활성 상태로 유지 — 30일 안에는 복구 가능
   - 주체: Entra ID
   - 데이터: 앱 계정 active = false 유지 · Entra 사용자 복원 가능
   - 해설: 복구 가능 기간에는 계정을 지우지 않고 비활성 상태만 유지합니다. 이 기간에 휴지통에서 수동으로 영구 삭제하면 앱에 삭제 요청이 바로 전달됩니다
8. [판단] 앱 호출이 대부분 계속 실패하는가?
   - 주체: Entra ID
   - 위치: 프로비저닝 페이지의 진행률 표시줄 · 감사 로그(Activity: Quarantine) · Graph GET /beta/servicePrincipals/{id}/synchronization/jobs/{jobId}
   - 데이터: 관리 자격 증명 만료 · 앱 오류율 · 격리 사유 값 EncounteredQuarantineException(잘못된 자격 증명) · EncounteredEscrowProportionThreshold(실패 비율 초과)
   - 해설: 자격 증명 오류나 SCIM 비준수(404 응답)처럼 대부분 호출이 실패하면 작업이 격리 상태가 됩니다. 실패 건수가 5,000건 이상일 때 평가가 시작되고 실패율이 40%나 4만 건을 넘으면 격리되며 참조 실패를 합친 절대 한도는 6만 건입니다. 격리되면 알림 이메일이 한 번 가고, 오류를 고친 뒤 다음 주기가 시작되면 격리가 풀립니다
   - 예 → [차단] 격리(quarantine) — 증분 주기가 하루 1회로 줄고 4주 넘으면 작업 비활성화
   - 아니오 → 9
9. [끝] 결과를 프로비저닝 로그에 기록
   - 주체: 로그
   - 위치: 프로비저닝 로그 · GET /v1.0/auditLogs/provisioning
   - 데이터: 작업(Disable · Delete) · 상태 · 대상 앱 ID · Graph 호출 권한 AuditLog.Read.All + Directory.Read.All (위임 호출 시 Reports Reader · Security Reader · Global Reader · Application Administrator · Cloud Application Administrator 등의 역할 필요)
   - 해설: 퇴사자 정리 결과를 사용자별로 증빙합니다. 프로비저닝 설정 변경은 감사 로그로, 사용자별 생성·갱신·삭제 작업은 프로비저닝 로그로 구분해 봅니다
- 시나리오: 예 ▸ 예 ▸ 예 :: 삭제 요청까지 갔다가 호출 실패로 격리
- 시나리오: 예 ▸ 예 ▸ 아니오 :: 영구 삭제 후 삭제 요청, 로그에 기록
- 시나리오: 예 ▸ 아니오 ▸ 예 :: 비활성 유지 중 호출 실패로 격리
- 시나리오: 예 ▸ 아니오 ▸ 아니오 :: 비활성 상태 유지 후 로그에 기록
- 시나리오: 아니오 :: 프로비저닝 범위 밖이라 대상 아님

> 교육 포인트: 퇴사 정리의 기준은 "범위 이탈"입니다. 앱 할당 해제·범위 필터 이탈·비활성화·삭제가 모두 비활성화(또는 삭제) 트리거입니다.
>
> 주의: 비활성화·삭제 동작은 앱마다 구현이 달라, 갤러리 앱은 소프트 삭제 대신 삭제 요청을 보내기도 합니다. 앱 튜토리얼을 확인합니다.
>
> 주의: 프로비저닝 비활성화는 앱 쪽 기존 로그인 세션·토큰을 즉시 끊는다는 뜻이 아닙니다 [확인 필요: 앱별 세션 정책].
>
> 출처: https://learn.microsoft.com/entra/identity/app-provisioning/how-provisioning-works
>
> 출처: https://learn.microsoft.com/entra/identity/app-provisioning/application-provisioning-quarantine-status
>
> 출처: https://learn.microsoft.com/graph/api/provisioningobjectsummary-list
