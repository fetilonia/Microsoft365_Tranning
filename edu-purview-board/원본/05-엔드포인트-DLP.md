## L2 · 엔드포인트 DLP — 기기에서 민감 파일 업로드 통제

- 설정(Control Plane): 기기 온보딩 | DLP 기기 위치·SIT·제한 클라우드 도메인·동작
- 강제(Enforcement): 온보딩된 지원 Windows·macOS의 지원 활동 평가 [확인 필요: OS·브라우저별 범위]
- 증적(Evidence): 기기 목록·Activity explorer | 구성된 DLP 경고 및 재정의 기록
- 메뉴(Admin Center): Data loss prevention > Policies | Settings > Endpoint DLP settings [확인 필요: 테넌트 메뉴]
- 라이선스(License): Endpoint DLP 대상 사용자·기기 및 서비스 구독 [확인 필요: 고객 SKU]

### L3 · 0 · 기능 상태 전이 — 온보딩 전 → 정책 구성 → 업로드 평가

#### L4 · ⓪ 비활성 — 예제 기기가 온보딩되지 않음

1. [시작] 관리자가 기기와 민감 파일 확인
   - 주체: 관리자
   - 데이터: 가상 테스트 기기와 파일
   - 해설: 로컬 파일 유출 경로를 평가합니다.
2. [처리] 기기가 아직 Purview에 온보딩되지 않음
   - 주체: 관리자
   - 위치: 기기 온보딩 상태
   - 데이터: 테스트 기기의 온보딩 상태
   - 해설: 이 기기에는 예제 Endpoint DLP의 온보딩 전제가 충족되지 않습니다.
3. [처리] 기존 브라우저 및 네트워크 통제 검토
   - 주체: 관리자
   - 데이터: 별도 보안 정책
   - 해설: 기기 온보딩이 없다는 것이 모든 통제가 없다는 뜻은 아닙니다.
4. [끝] 지원 OS와 배포 방법 선정
   - 주체: 관리자
   - 데이터: 기기 버전·사용자·배포 방법
   - 해설: 라이선스와 지원 범위를 확인하고 온보딩합니다.

#### L4 · ① 구성 — 기기와 제한 도메인 정책 설정

1. [시작] 기기·사용자 라이선스 및 OS 확인
   - 주체: 관리자
   - 위치: Endpoint DLP 필수 구성
   - 데이터: 지원 OS·대상 사용자·구독
   - 해설: 플랫폼과 활동별 지원 여부를 확인합니다.
2. [처리] 기기를 Purview에 온보딩
   - 주체: 관리자
   - 위치: Device onboarding · 배포 도구
   - 데이터: 기기 온보딩 패키지와 연결 상태
   - 해설: 지원되는 배포 방법과 네트워크 연결을 사용합니다.
3. [처리] 기기 목록과 활동 보고 확인
   - 주체: 관리자
   - 위치: Purview 기기 목록 및 Activity explorer
   - 데이터: 온보딩 기기와 보고된 활동
   - 해설: 기기가 나타나는지 확인합니다.
4. [처리] 제한할 클라우드 서비스 도메인 구성
   - 주체: 관리자
   - 위치: Endpoint DLP settings › Sensitive service domains
   - 데이터: 테스트 도메인 목록
   - 해설: 지정 도메인 업로드 제한에 필요한 목록입니다.
5. [처리] Devices 위치에 DLP 규칙 작성
   - 주체: 관리자
   - 위치: Data loss prevention › Policies › Create policy
   - 데이터: 기기·사용자 범위, SIT, 클라우드 업로드 활동
   - 해설: 기기뿐 아니라 로그인 사용자의 대상 범위도 확인합니다.
6. [처리] 업로드 동작을 Block with override로 구성
   - 주체: 관리자
   - 위치: 규칙의 Audit or restrict activities on devices
   - 데이터: Block with override 및 경고 설정
   - 해설: 재정의 허용과 완전 차단을 구별합니다.
7. [끝] 테스트 후 정책을 단계적으로 배포
   - 주체: 관리자
   - 위치: DLP 정책 모드 및 Activity explorer
   - 데이터: 대상 기기와 테스트 결과
   - 해설: 운영 강제 전 지원 브라우저와 알림을 확인합니다.

#### L4 · ② 활성 — 제한 도메인으로 파일 업로드

1. [시작] 온보딩 기기에서 민감 파일 업로드 시도
   - 주체: 사용자
   - 위치: 지원 브라우저와 제한 도메인
   - 데이터: SIT에 일치하는 가상 파일
   - 해설: 기기와 사용자가 정책 대상이라고 가정합니다.
2. [처리] Endpoint DLP가 활동과 콘텐츠 평가
   - 주체: Endpoint DLP
   - 데이터: 파일·업로드 활동·도메인·정책 조건
   - 해설: 정책의 활동과 대상이 일치해야 설정한 동작이 적용됩니다.
3. [처리] Block with override 경고 표시
   - 주체: Endpoint DLP
   - 위치: 사용자 기기
   - 데이터: 차단 및 재정의 선택지
   - 해설: 기본적으로 차단하되 사용자가 재정의할 수 있습니다.
4. [판단] 사용자가 재정의를 선택하는가?
   - 주체: 사용자
   - 데이터: 경고의 재정의 선택
   - 해설: 선택에 따라 이후 동작과 기록이 다릅니다.
   - 재정의 → 5
   - 취소 → 6
5. [끝] 재정의 후 활동 기록 확인
   - 주체: 관리자
   - 위치: Activity explorer 및 구성된 경고
   - 데이터: 재정의된 업로드 활동
   - 해설: 해당 예제의 재정의는 감사 이벤트와 경고를 생성합니다.
6. [끝] 업로드를 계속하지 않음
   - 주체: 사용자
   - 위치: 사용자 기기
   - 데이터: 취소된 업로드 시도
   - 해설: 사용자가 취소하면 이 시도를 계속하지 않습니다.
- 시나리오: 재정의 :: 경고를 재정의하고 업로드 활동 기록
- 시나리오: 취소 :: 경고를 수용하고 업로드 중단

> 주의: Endpoint DLP의 브라우저·행위·OS 지원은 다릅니다. 미온보딩 기기는 이 기기 기반 통제의 전제를 충족하지 않습니다.
> 출처: https://learn.microsoft.com/en-us/purview/endpoint-dlp-getting-started
> 출처: https://learn.microsoft.com/en-us/purview/dlp-configure-endpoint-settings
> 출처: https://learn.microsoft.com/en-us/office365/servicedescriptions/microsoft-365-service-descriptions/microsoft-365-tenantlevel-services-licensing-guidance/microsoft-purview-service-description

### L3 · A · 도메인별 업로드 — 대표 시나리오: 제한 도메인과 다른 도메인 비교

#### L4 · ▶ 동일 민감 파일의 대상 비교 — 도메인 목록에 따른 정책 차이

1. [시작] 온보딩된 기기에서 동일한 파일 준비
   - 주체: 사용자
   - 위치: 지원 Windows 기기
   - 데이터: 정책 SIT에 일치하는 파일
   - 해설: 기기와 파일 조건을 고정하고 도메인만 바꿉니다.
2. [처리] 정책의 제한 도메인 목록 확인
   - 주체: Endpoint DLP
   - 위치: Endpoint DLP settings › Sensitive service domains
   - 데이터: 예제에서 등록된 제한 도메인
   - 해설: 목록과 정책 동작이 모두 해당해야 합니다.
3. [처리] 사용자가 클라우드 서비스 업로드 시도
   - 주체: 사용자
   - 데이터: 대상 도메인과 파일
   - 해설: 지원 브라우저에서 시험합니다.
4. [판단] 대상이 제한 도메인인가?
   - 주체: Endpoint DLP
   - 데이터: 대상 도메인과 목록
   - 해설: 도메인 예외와 다른 정책은 별도로 확인합니다.
   - 예 → 5
   - 아니오 → 6
5. [끝] 이 예제의 재정의 가능 차단 적용
   - 주체: Endpoint DLP
   - 데이터: 경고 및 Block with override
   - 해설: 제한 도메인은 설정된 동작을 받습니다.
6. [끝] 이 제한 도메인 규칙은 적용되지 않음
   - 주체: Endpoint DLP
   - 데이터: 대상 도메인 불일치
   - 해설: 다른 도메인에 별도 규칙이나 제어가 있다면 결과는 달라질 수 있습니다.
- 시나리오: 예 :: 제한 도메인 업로드에 재정의 가능 차단
- 시나리오: 아니오 :: 목록 밖 도메인에는 이 제한 미적용

> 출처: https://learn.microsoft.com/en-us/purview/dlp-configure-endpoint-settings
> 출처: https://learn.microsoft.com/en-us/purview/endpoint-dlp-getting-started
