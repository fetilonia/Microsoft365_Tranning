### L3 · A · PHS 로그인 — 해시 동기화와 클라우드 검증

#### L4 · 해시가 만들어지고 로그인 때 비교된다

1. [시작] 동기화 에이전트가 DC에서 암호 해시 수신
   - 주체: 온프레미스
   - 위치: Connect 서버 ↔ 도메인 컨트롤러 (MS-DRSR DC 복제 프로토콜 · RPC)
   - 데이터: unicodePwd의 MD4 해시 (RPC 세션 키와 salt의 MD5 해시로 만든 키로 암호화되어 도착) · 2분 주기 · AD 커넥터 계정에 Replicate Directory Changes · Replicate Directory Changes All 권한 필요(설치 시 기본 부여)
   - 해설: 에이전트는 평문 암호가 아니라 해시만 받습니다. MD5는 DC 복제 프로토콜과의 호환 때문에 온프레미스 구간에서만 쓰입니다.
2. [처리] 에이전트가 해시를 다시 가공
   - 주체: 온프레미스
   - 데이터: 16바이트 MD4 해시를 64바이트로 확장 + 10바이트 사용자별 salt + PBKDF2(HMAC-SHA256 1,000회) → 32바이트 해시
   - 해설: 원래 해시를 직접 보내지 않도록 한 번 더 변환합니다.
3. [처리] TLS로 Entra ID에 전송 · 저장
   - 주체: Entra ID
   - 데이터: 32바이트 해시 + salt + 반복 횟수 → 클라우드 암호를 덮어씀 · 해시는 SQL에 저장되지 않고 메모리에서만 처리됨
   - 해설: 원본 MD4 해시는 전송되지 않아 pass-the-hash에 쓸 수 없습니다. 온프레미스 암호가 바뀌면 보통 몇 분 안에 동기화되고, 이미 로그인된 세션에는 영향이 없습니다.
4. [처리] 사용자가 로그인할 때 암호 입력
   - 주체: 사용자
   - 위치: Entra 로그인 페이지 › 암호 입력
   - 데이터: 입력 암호를 같은 salt · 반복 횟수로 해시
   - 해설: 저장 때와 같은 과정을 입력 암호에도 적용합니다.
5. [판단] 결과 해시가 저장된 해시와 같은가?
   - 주체: Entra ID
   - 데이터: 계산 해시 = 저장 해시 여부
   - 해설: 같으면 암호가 맞는 것으로 판단하고 클라우드에서 인증을 끝냅니다. 일치하지 않으면 AADSTS50126(InvalidUserNameOrPassword)이 반환됩니다.
   - 예 → 6
   - 아니오 → [차단] 로그인 실패 — 암호 불일치 (AADSTS50126) [확인 필요: 오류 코드]
6. [처리] 온프레미스 계정 상태는 즉시 반영되지 않음
   - 주체: Entra ID
   - 데이터: accountExpires는 동기화되지 않음 · 만료된 암호도 동기화된 값으로 로그인 가능 · 기본으로 클라우드 암호가 Never Expire(PasswordPolicies = DisablePasswordExpiration)이며 CloudPasswordPolicyForPasswordSyncedUsersEnabled를 켜면 Entra 암호 만료 정책을 적용
   - 해설: 만료된 AD 계정이 Entra에서 활성일 수 있어 별도 정리가 필요합니다. AD 계정 만료 시 계정을 비활성화하는 스크립트(Set-ADUser)를 예약 실행하길 권장합니다. 임시 암호는 UserForcePasswordChangeOnLogonEnabled를 켜야 동기화되어 첫 로그인에 변경을 요구합니다.
7. [끝] 클라우드에서 인증 완료
   - 주체: 로그
   - 위치: ID › 모니터링 및 상태 › 로그인 로그 (Sign-in logs)
   - 데이터: SigninLogs 성공 · 장애 지점은 Entra와 해시 동기화 지연
   - 해설: 사내 서버가 멈춰도 이미 동기화된 해시로 로그인이 가능합니다. PTA에서 PHS로의 장애 전환은 자동이 아니라 Connect에서 로그인 방식을 직접 바꿔야 합니다.
- 시나리오: 예 :: 해시가 일치해 클라우드 인증 완료
- 시나리오: 아니오 :: 해시 불일치로 로그인 실패

> 교육 포인트: ID Protection의 유출 자격 증명 보고서와 Entra Domain Services는 어떤 로그인 방식이든 PHS를 필요로 합니다.
>
> 주의: PHS는 장애 시 대체(fallback) 수단으로 페더레이션과 함께 켜 둘 수 있습니다.
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-password-hash-synchronization
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/choose-ad-authn
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-pta-current-limitations
