#### 그룹 · grant · 허용 컨트롤
- 섹션: 허용
- 선택: 다중
- 위치: 보호 › 조건부 액세스 › 정책 › 새 정책 만들기 › 액세스 제어 › 허용 › 액세스 허용 (Entra ID > Conditional Access > Policies > Grant > Grant access) [확인 필요: 한글 UI 문구]
- 소개: 접근을 허용하기 위해 사용자·디바이스·앱이 충족해야 할 컨트롤을 고른다.
- 평가: Phase 2에서 block 확인 후, 미충족 컨트롤을 MFA→준수 디바이스→하이브리드 조인→승인 앱→앱 보호→암호 변경→약관→사용자 지정 순으로 요구한다. 인증 강도의 위치는 [확인 필요].
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant;https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-policies;https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-conditions

##### 옵션 · gc-mfa · 다단계 인증 필요
- 소개: 다단계 인증(MFA) 완료를 요구한다.
- 위치: 허용 › 액세스 허용 › 다단계 인증 필요 (Require multifactor authentication)
- 동작: 토큰에 유효한 MFA 클레임이 없으면 대화형 MFA 프롬프트로 로그인을 중단시킨다. Windows Hello for Business 로그인은 이 요구를 충족한다. 이미 MFA 클레임이 있으면 프롬프트 없이 통과한다.
- 충족 판정: 인증 세션·토큰의 MFA 클레임(OIDC amr mfa, SAML multipleauthn)을 본다. 이 값은 MFA를 마친 경우에만 발급되고, 허용 조합은 내장 'MFA 강도'와 같다.
- 표현: 브라우저: 로그인 후 MFA 승인·코드 입력 화면; 모바일 앱: 앱 로그인 창(브로커·웹뷰)에서 같은 프롬프트; 데스크톱 앱: 로그인 창에서 프롬프트, Windows Hello 로그인은 추가 프롬프트 없음 [확인 필요: 앱별 UI].
- 미충족 시: 프롬프트로 MFA를 마치면 통과한다. 레거시 인증 클라이언트는 MFA를 못 해서 차단된다. 미등록 사용자의 등록 유도 화면 문구는 [확인 필요].
- 지원 주체: 사용자, 게스트
- 제약·주의: 같은 정책에서 인증 강도와 함께 선택할 수 없다(MFA 강도와 동일). B2B 직접 연결은 인바운드 MFA 신뢰 설정이 필수다. 워크로드 ID는 MFA를 못 한다.
- 로그: MFA 클레임이 없으면 중단(interrupt) 항목이 먼저 남고 MFA 후 성공 항목이 이어진다. 클레임이 이미 있으면 성공 1건만 남는다.
- 노드 제목: MFA 충족?
- 노드 보조: 토큰의 MFA 클레임을 확인하고 없으면 MFA 요구
- 해설: Entra가 토큰에서 MFA 클레임을 찾고, 없으면 사용자에게 MFA를 요구한다.
- 주체: Entra ID
- 데이터: 토큰 MFA 클레임(amr·multipleauthn), 인증 세부 정보, 등록된 인증 방법
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant;https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-strengths;https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-conditions

##### 옵션 · gc-strength · 인증 강도 필요
- 소개: 허용된 인증 방법 조합으로 인증했는지 요구한다.
- 위치: 허용 › 액세스 허용 › 인증 강도 필요 (Require authentication strength). 정의는 인증 방법 › 인증 강도 (Authentication methods > Authentication strengths)
- 동작: 내장 3종(MFA·암호 없는 MFA·피싱 방지 MFA) 또는 사용자 지정 강도를 고른다. 사용한 인증 방법 조합이 그 강도의 허용 목록에 있어야 한다. CA는 첫 인증 뒤에 평가되므로 첫 로그인은 막지 않는다.
- 충족 판정: 인증 세션에서 쓴 인증 방법 조합이 선택한 강도가 허용하는 조합에 속하는지 본다. 예: 피싱 방지는 WHfB·FIDO2·인증서 기반(다단계)만 인정한다.
- 표현: 브라우저: 비밀번호 로그인 뒤 '로그인 옵션'에서 허용 방법 선택; 모바일 앱: 앱 로그인 창에서 허용 방법 요구; 데스크톱 앱: 암호로 로그인했다면 세션을 다시 시작하고 WHfB를 골라야 한다.
- 미충족 시: 허용 방법이 등록돼 있지 않으면 통합 등록(인터럽트 모드)으로 이동한다. 이 모드에서 등록 못 하는 방법은 [확인 필요].
- 지원 주체: 사용자, 게스트
- 제약·주의: MFA 필요와 같은 정책에서 동시 선택 불가. 다른 정책 간 우선순위는 [확인 필요]. 게스트는 Entra 인증 외부 사용자만이며 MFA 신뢰 설정과 연동. 게스트 이메일 OTP 미지원.
- 로그: 인증 세부 정보 탭에 사용한 방법과 결과가, 조건부 액세스 탭에 정책별 성공·실패가 남는다. 인증 강도와 로그인 빈도는 서로 다른 시점에 충족될 수 있다.
- 노드 제목: 인증 강도 충족?
- 노드 보조: 사용한 인증 방법 조합이 선택 강도 허용 목록에 있는지 확인
- 해설: Entra가 사용한 인증 방법 조합이 강도 정의에 포함되는지 확인한다.
- 주체: Entra ID
- 데이터: 인증 방법 조합, 인증 강도 정의(내장·사용자 지정), 인증 세션
- 출처: https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-strengths;https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant;https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-strength-external-users

##### 옵션 · gc-compliant · 준수 디바이스 필요
- 소개: Intune이 준수로 표시한 디바이스만 허용한다.
- 위치: 허용 › 액세스 허용 › 디바이스가 준수로 표시되어야 함 (Require device to be marked as compliant) [확인 필요: 한글 UI 문구]
- 동작: Intune이 Entra에 보낸 준수 상태를 디바이스 ID로 조회한다. 디바이스는 Entra에 등록돼 있어야 한다. Windows는 Intune 대신 타사 MDM 준수 정보도 사용할 수 있다.
- 충족 판정: 로그인 요청의 디바이스 ID로 찾은 디바이스 개체가 준수(isCompliant)인지 본다. Windows 브라우저의 Edge InPrivate는 비준수로 간주한다.
- 표현: 브라우저: 첫 로그인 시 디바이스 인증서 선택 프롬프트, 선택해야 계속 가능; 모바일 앱: 브로커·MSAL이 디바이스 ID 전달 [확인 필요: 등록 유도 화면]; 데스크톱 앱: Windows는 로그온 디바이스 ID 사용, Apple은 Enterprise SSO 플러그인 필요.
- 미충족 시: 비준수·미등록이면 AADSTS53000 DeviceNotCompliant로 차단된다. 프롬프트로 해결되는 경우는 인증서 선택뿐이다 [확인 필요: 등록 유도].
- 지원 주체: 사용자, 게스트, 에이전트
- 제약·주의: Windows 10+·iOS·Android·macOS·Linux Ubuntu(Entra 등록+Intune 등록)만 지원. 게스트는 홈 테넌트 준수 클레임 신뢰 필요. 에이전트 사용자(미리 보기)는 엔드포인트 세션만. Linux 브라우저는 Edge만.
- 로그: 실패 시 오류 53000 DeviceNotCompliant. 로그인 로그의 디바이스 정보 탭과 조건부 액세스 탭의 문제 해결 정보로 준수 여부를 확인한다.
- 노드 제목: 디바이스 준수?
- 노드 보조: 디바이스 ID로 Intune 준수 상태 조회
- 해설: Entra가 로그인에서 식별한 디바이스가 Intune 기준으로 준수인지 확인한다.
- 주체: Entra ID
- 데이터: 디바이스 ID·인증서, 디바이스 등록 여부, isCompliant, 브라우저·OS
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant;https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-conditions;https://learn.microsoft.com/en-us/entra/identity/conditional-access/troubleshoot-conditional-access;https://learn.microsoft.com/en-us/entra/external-id/authentication-conditional-access

##### 옵션 · gc-hybrid · 하이브리드 Microsoft Entra 조인 디바이스 필요
- 소개: 도메인 가입과 Entra 등록을 모두 한 Windows 디바이스만 허용한다.
- 위치: 허용 › 액세스 허용 › 하이브리드 Microsoft Entra 조인 디바이스 필요 (Require Microsoft Entra hybrid joined device)
- 동작: 디바이스 ID의 조인 상태를 확인한다. 도메인 가입된 Windows 하위 수준(Windows 10 이전)과 Windows 10+만 지원한다. 디바이스 코드 OAuth 흐름에서는 디바이스 상태를 못 전달해 지원되지 않는다.
- 충족 판정: 로그인에서 식별한 디바이스 개체의 조인 유형이 하이브리드 조인(trustType)인지 본다. [확인 필요: trustType 값 이름] Edge InPrivate는 하이브리드 조인으로 안 본다.
- 표현: 브라우저: Edge는 브라우저 로그인이 필요하고 Chrome은 SSO 확장 또는 CloudAPAuthEnabled, Firefox 91+는 Windows SSO 허용 필요; 모바일 앱: 해당 없음(Windows 전용); 데스크톱 앱: Windows 로그온의 디바이스 ID 사용 [확인 필요].
- 미충족 시: 하이브리드 조인이 아니면 AADSTS53001 DeviceNotDomainJoined로 차단된다. 프롬프트로 해결되는 방법은 없다.
- 지원 주체: 사용자, 게스트
- 제약·주의: 전체 사용자·전체 리소스에 걸면 하이브리드 조인이 아닌 사용자가 모두 막힌다. 디바이스 코드 흐름에는 MFA 필요를 대신 쓴다. 게스트는 홈 테넌트 하이브리드 조인 클레임 신뢰 필요.
- 로그: 실패 시 오류 53001 DeviceNotDomainJoined. 로그인 로그 디바이스 정보 탭에서 조인 유형을 확인한다 [확인 필요: 표시 이름].
- 노드 제목: 하이브리드 조인?
- 노드 보조: 디바이스 개체의 조인 유형이 하이브리드 조인인지 확인
- 해설: Entra가 디바이스 ID를 찾아 도메인 가입·Entra 등록 상태인지 확인한다.
- 주체: Entra ID
- 데이터: 디바이스 ID, 조인 유형(trustType), 디바이스 OS, 브라우저 SSO 설정
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant;https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-conditions;https://learn.microsoft.com/en-us/entra/identity/conditional-access/troubleshoot-conditional-access

##### 옵션 · gc-approved-app · 승인된 클라이언트 앱 필요
- 소개: 승인된 클라이언트 앱 사용을 요구한다. 폐기 예정.
- 위치: 허용 › 액세스 허용 › 승인된 클라이언트 앱 필요 (Require approved client app)
- 동작: Intune 앱 보호를 지원하는 승인 앱에서 온 요청만 허용한다. 디바이스를 Entra에 등록해야 하므로 브로커 앱(iOS Authenticator, Android Authenticator 또는 회사 포털)이 필요하다.
- 충족 판정: 요청 앱이 승인 앱 목록에 있고 브로커로 등록된 iOS·Android 디바이스에서 온 것인지 본다. Edge InPrivate와 Edge 밖 웹뷰는 불충족이다. [확인 필요: 내부 판정 속성]
- 표현: 브라우저: Edge만 승인 앱으로 인정, Safari 불가; 모바일 앱: 브로커 미설치 시 스토어로 리디렉션, 비승인 앱은 승인 앱 설치 안내; 데스크톱 앱: 해당 없음(iOS·Android 전용).
- 미충족 시: AADSTS53002 ApplicationUsedIsNotAnApprovedApp로 차단된다. Exchange ActiveSync 사용자는 Outlook 모바일 설치 안내를 받는다.
- 지원 주체: 사용자
- 제약·주의: [확인 필요: 폐기 — 2026-06-30 읽기 전용 전환(생성·수정 불가, 비활성화·삭제 가능, 기존 정책은 계속 적용). 포털 현재 상태 확인] 대체: 승인 앱 또는 앱 보호 정책(OR), 신규는 앱 보호만. 게스트 미지원.
- 로그: 실패 시 오류 53002 ApplicationUsedIsNotAnApprovedApp.
- 노드 제목: 승인된 앱 사용?
- 노드 보조: 요청 앱이 승인 앱이며 디바이스가 등록됐는지 확인
- 해설: Entra가 요청 앱이 승인 클라이언트 앱인지, 디바이스가 브로커로 등록됐는지 확인한다.
- 주체: Entra ID
- 데이터: 클라이언트 앱, 디바이스 플랫폼(iOS·Android), 브로커 등록 여부
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant;https://learn.microsoft.com/en-us/entra/identity/conditional-access/migrate-approved-client-app;https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-conditions;https://learn.microsoft.com/en-us/entra/identity/conditional-access/troubleshoot-conditional-access

##### 옵션 · gc-app-protection · 앱 보호 정책 필요
- 소개: Intune 앱 보호 정책(MAM)이 적용된 앱을 요구한다.
- 위치: 허용 › 액세스 허용 › 앱 보호 정책 필요 (Require app protection policy)
- 동작: 앱에 Intune 앱 보호 정책이 적용돼 있는지 확인한다. 디바이스는 브로커(iOS Authenticator, Android 회사 포털)로 Entra에 등록해야 한다. iOS·Android는 GA이고 Windows의 Edge는 미리 보기다.
- 충족 판정: 요청 앱이 앱 보호를 지원하고 MAM 등록과 정책 적용을 마쳤는지 본다. Safari는 충족하지 못하고 Edge 같은 관리형 브라우저가 충족한다. [확인 필요: 내부 판정 속성]
- 표현: 브라우저: Windows Edge는 프로필 로그인 안내, MAM 등록 확인 뒤 '모두 완료' 표시; 모바일 앱: 브로커 미설치 시 스토어로 리디렉션; 데스크톱 앱: Windows는 Edge와 Windows App만 해당.
- 미충족 시: 앱이 Intune 앱 보호 정책을 적용해야 한다는 오류(AADSTS53009)로 차단된다. 브로커가 없으면 스토어 설치로 유도된다.
- 지원 주체: 사용자
- 제약·주의: 게스트 미지원. Kaizala·Skype for Business·Visio는 미지원(OR로 묶어도 불가). MDM 관리 디바이스는 MAM 등록이 막혀 단독·AND 사용 시 전부 차단되므로 준수 디바이스와 OR 권장. Windows는 소버린 클라우드 미지원.
- 로그: 실패 시 오류 53009 (Application needs to enforce Intune protection policies).
- 노드 제목: 앱 보호 적용됨?
- 노드 보조: 앱의 MAM 등록과 앱 보호 정책 적용 여부 확인
- 해설: Entra가 요청한 앱에 Intune 앱 보호 정책이 적용됐는지 확인한다.
- 주체: Entra ID
- 데이터: 클라이언트 앱, 디바이스 플랫폼, 브로커 등록·MAM 등록 여부
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant;https://learn.microsoft.com/en-us/entra/identity/conditional-access/policy-all-users-windows-app-protection;https://learn.microsoft.com/en-us/entra/identity/conditional-access/migrate-approved-client-app;https://learn.microsoft.com/en-us/entra/external-id/authentication-conditional-access

##### 옵션 · gc-pwdchange · 암호 변경 필요
- 소개: 위험 사용자가 MFA 후 안전하게 암호를 바꾸게 한다.
- 위치: 허용 › 액세스 허용 › 암호 변경 필요 (Require password change)
- 동작: 사용자 위험이 감지되면 로그인 성공 뒤 MFA를 거쳐 암호를 바꾸게 한다. SSPR 흐름을 쓰지 않으며 변경이 끝나면 사용자 위험 이벤트가 닫힌다.
- 충족 판정: MFA를 마친 뒤 안전한 암호 변경이 성공했는지 본다. 사용자가 사전에 MFA를 등록해 두었어야 한다.
- 표현: 브라우저: MFA 승인 후 암호 변경 화면; 모바일 앱·데스크톱 앱: 앱 로그인 창에서 같은 웹 기반 흐름 [확인 필요: 앱별 UI].
- 미충족 시: 암호를 바꿀 때까지 접근할 수 없다. MFA를 등록하지 않은 사용자는 해결 흐름을 완료할 수 없다.
- 지원 주체: 사용자
- 제약·주의: 정책은 모든 리소스에 적용해야 하고 사용자·그룹·모든 리소스·사용자 위험 조건과만 쓴다. 준수 디바이스 같은 다른 컨트롤과 함께 불가. 게스트·외부 사용자 미지원. 위험 정책은 ID Protection P2 필요.
- 로그: 사용자 위험 정책이 적용되며 [확인 필요: 로그인 로그에서 MFA와 암호 변경 단계 표시 방식].
- 노드 제목: 암호 변경 완료?
- 노드 보조: 사용자 위험 시 MFA 후 안전한 암호 변경 확인
- 해설: Entra가 위험 사용자가 MFA 뒤 암호 변경까지 마쳤는지 확인한다.
- 주체: 사용자
- 데이터: 사용자 위험 수준, MFA 클레임, 암호 변경 결과
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant;https://learn.microsoft.com/en-us/entra/id-protection/concept-identity-protection-policies;https://learn.microsoft.com/en-us/entra/external-id/authentication-conditional-access

##### 옵션 · gc-tou · 이용 약관(Terms of use) 동의 필요
- 소개: 사용자가 약관에 동의해야 접근을 허용한다.
- 위치: 허용 › 액세스 허용 › 약관 선택(약관을 만든 경우만 표시). 약관 관리: 보호 › 조건부 액세스 › 이용 약관 (Terms of use)
- 동작: 정책에 연결한 약관(PDF)을 로그인 중에 보여 주고 동의 기록을 확인한다. 동의 증거가 토큰에 없어 로그인이 먼저 중단되고 동의 후 성공한다.
- 충족 판정: 해당 약관 버전의 동의 기록을 본다. 만료·재동의 설정, '모든 디바이스에서 동의' 설정(기기별)이 있으면 그 기준을 따른다.
- 표현: 브라우저: 로그인 중 약관 화면(PDF 보기·확대 버튼, 확장 필수·브라우저 언어별 문서); 모바일 앱·데스크톱 앱: 최신 웹뷰 기반 앱은 약관 수락 가능하며 일부는 화면이 깨질 수 있다. PowerShell 같은 비대화형은 불가.
- 미충족 시: 거절하면 앱 접근이 차단된다. 다시 로그인해 동의하면 접근할 수 있다.
- 지원 주체: 사용자, 게스트
- 제약·주의: P1 필요. PDF만 업로드, 약관 최대 40개. 기기별 동의는 Entra 등록 필요·B2B 미지원·Intune Enrollment 앱 제외. B2B 직접 연결 미지원. 서비스 계정 제외. macOS·Linux 포함 주요 OS 지원.
- 로그: 같은 상관 ID로 중단 1건과 성공 1건이 남는다. 동의는 감사 로그에 기록되며 감사 로그는 30일 보존된다.
- 노드 제목: 약관 동의됨?
- 노드 보조: 해당 약관 버전의 사용자 동의 기록 확인
- 해설: Entra가 사용자가 연결된 약관에 동의했는지, 기한이 지났는지 확인한다.
- 주체: 사용자
- 데이터: 약관 동의 기록·버전, 만료 설정, 기기별 동의 설정, 디바이스 ID
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/terms-of-use;https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant;https://learn.microsoft.com/en-us/entra/external-id/authentication-conditional-access

##### 옵션 · gc-risk-remediation · 위험 해결 필요
- 소개: 인증 방법에 맞는 위험 해결 흐름을 ID Protection이 관리한다.
- 위치: 허용 › 액세스 허용 › 위험 해결 필요 (Require risk remediation) [확인 필요: 한글 UI 문구]
- 동작: 선택하면 인증 강도 필요와 로그인 빈도 '매번'이 자동 적용된다. 암호 사용자는 보안 암호 변경 뒤 세션이 취소되고, 암호 없는 사용자도 같은 컨트롤로 처리한다.
- 충족 판정: 해결 흐름을 완료한 뒤 다시 로그인에 성공했는지 본다. 위험은 두 번째 로그인 성공 시 해소된다.
- 표현: 브라우저: 세션 취소 직후 다시 로그인 요구; 모바일 앱·데스크톱 앱: 같은 재로그인 흐름 [확인 필요: 앱별 UI].
- 미충족 시: 해결을 마치기 전에는 접근할 수 없다. [확인 필요: 해결 불가 시 차단 방식]
- 지원 주체: 사용자
- 제약·주의: 외부·게스트 사용자는 세션 취소가 안 돼 미지원. 암호 변경 필요보다 우선하고 Block이 모두 이긴다. ID Protection P2 필요. [확인 필요: GA 여부]
- 로그: 조건부 액세스 정책 결과로 남으며 사용자 위험 정책 흐름은 ID Protection 보고서에서 확인한다 [확인 필요].
- 노드 제목: 위험 해결됨?
- 노드 보조: 인증 방법별 해결 흐름 완료와 재로그인 확인
- 해설: Entra가 위험 해결 흐름이 끝났고 재로그인에 성공했는지 확인한다.
- 주체: Entra ID
- 데이터: 사용자 위험 수준, 인증 방법, 세션 취소 상태
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant;https://learn.microsoft.com/en-us/entra/id-protection/concept-identity-protection-policies

##### 옵션 · gc-idverify · 신원 확인 필요
- 소개: 신원 확인 프로필로 사용자의 신원을 확인하게 한다.
- 위치: 허용 › 액세스 허용 › 신원 확인 필요 (Require identity verification) [확인 필요: 한글 UI 문구·미리 보기]
- 동작: 적합한 신원 확인 프로필을 구성하고 지원되는 리소스·작업 범위에 적용하면 사용자에게 신원 확인을 요구한다. 위험 정책에서는 사용자·로그인 위험별로 정책을 나눈다.
- 충족 판정: 신원 확인 여정을 완료했는지 본다. 자격 증명 출처(provenance)와는 별개이며 미리 보기에서는 패스키만 기록된다.
- 표현: 브라우저·모바일 앱·데스크톱 앱: 신원 확인 흐름으로 이동한다 [확인 필요: 클라이언트별 화면].
- 미충족 시: 확인을 마칠 때까지 접근할 수 없다 [확인 필요: 실패 처리 상세].
- 지원 주체: 사용자 [확인 필요]
- 제약·주의: 미리 보기. 라이선스는 별도 문서 확인 필요. 온보딩·복구 사용자 작업에서는 약관·인증 강도 등 대부분의 Entra 컨트롤이 미지원. 보고 전용은 완료를 입증하지 않는다.
- 로그: [확인 필요: 로그 필드]
- 노드 제목: 신원 확인 완료?
- 노드 보조: 구성한 신원 확인 프로필 완료 여부 확인
- 해설: Entra가 사용자가 신원 확인 프로필의 확인을 마쳤는지 확인한다.
- 주체: 사용자
- 데이터: 신원 확인 프로필, 확인 결과, 자격 증명 출처
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant;https://learn.microsoft.com/en-us/entra/id-protection/concept-identity-protection-policies
