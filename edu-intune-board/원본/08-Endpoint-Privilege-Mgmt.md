## L2 · Endpoint Privilege Mgmt — 표준 사용자 + 승인 앱만 상승

- 설정(Control Plane): Windows elevation settings 정책 · 파일별 elevation rules 정책 | 미일치 파일 기본 응답 · 보고 범위
- 강제(Enforcement): Windows의 EPM 구성 요소가 정책과 사용자 상승 요청을 평가하고 지정된 방식으로 실행
- 증적(Evidence): EPM 상승 보고서 · Elevation requests · Intune 감사 로그
- 메뉴(Admin Center): Intune 관리 센터 > Endpoint security > Endpoint Privilege Management > Policies · Elevation requests
- 라이선스(License): Intune Plan 1 또는 Plan 2 외 EPM 추가 구독 필요 | 고객 SKU·사용자 할당 [확인 필요]

### L3 · 0 · 기능 상태 전이 — EPM 미사용 → 정책 배포 → 통제된 상승

> 교육 포인트: EPM은 대상 프로세스를 관리자 컨텍스트로 실행할 수 있게 합니다. 파일을 승인하면 그 프로세스에 관리자 권한이 부여되므로 신뢰 검토가 중요합니다.
> 출처: https://learn.microsoft.com/en-us/intune/epm/deployment-planning
> 출처: https://learn.microsoft.com/en-us/intune/epm/manage-elevation-settings

#### L4 · ⓪ 비활성 — 표준 사용자에게 EPM 정책이 없다

1. [시작] 표준 사용자가 관리자 권한이 필요한 파일을 실행한다
   - 주체: 사용자
   - 데이터: 표준 사용자 · Windows 파일
   - 해설: 사용자는 관리자가 아닌 계정입니다
2. [처리] 기기에 EPM 사용 설정이 배포되지 않았다
   - 주체: 디바이스
   - 데이터: EPM 설정 정책 없음
   - 해설: 이 예제의 EPM 상승 흐름은 제공되지 않습니다
3. [처리] Windows가 기존 방식으로 관리자 자격을 요구할 수 있다
   - 주체: Windows
   - 데이터: 사용자 권한 · 파일 실행 요청
   - 해설: 기존 사용자 권한과 Windows 동작은 별개입니다
4. [끝] 관리자가 허용할 파일을 검토한다
   - 주체: 관리자
   - 해설: 사용자에게 상시 관리자 권한을 부여하는 대신 정책 범위를 계획합니다

#### L4 · ① 구성 — EPM 설정과 지원 승인 규칙을 배포한다

1. [시작] 관리자가 Windows 지원 여부와 EPM 구독을 확인한다
   - 주체: 관리자
   - 위치: Intune 관리 센터
   - 데이터: 지원 OS · Intune 및 추가 EPM 자격 [확인 필요: 고객 환경]
   - 해설: 정책 배포 전에 기기와 라이선스 전제를 확인합니다
2. [처리] Windows elevation settings 정책을 만든다
   - 주체: 관리자
   - 위치: Endpoint security > Endpoint Privilege Management > Policies > Create Policy
   - 데이터: Windows · Windows elevation settings policy
   - 해설: 기기에서 EPM 구성 요소를 사용하도록 준비합니다
3. [처리] EPM을 켜고 기본 상승 응답을 지정한다
   - 주체: 관리자
   - 위치: Configuration settings > Endpoint Privilege Management · Default elevation response
   - 데이터: Enabled · Deny all requests
   - 해설: 이 예제는 규칙이 없는 파일의 요청을 기본 거부합니다
4. [처리] 상승 데이터 보고 범위를 선택한다
   - 주체: 관리자
   - 위치: Configuration settings > Send elevation data for reporting · Reporting scope
   - 데이터: Yes · managed elevations 포함
   - 해설: 보고 설정이 꺼져 있으면 상승 보고가 제공되지 않습니다
5. [처리] 대상 파일에 지원 승인 상승 규칙을 만든다
   - 주체: 관리자
   - 위치: Endpoint Privilege Management > Policies > Create Policy
   - 데이터: 파일 식별 조건 · Support approved [확인 필요: 파일별 규칙 값]
   - 해설: 특정 파일의 상승 요청을 승인 흐름으로 보냅니다
6. [처리] 정책을 테스트 그룹에 할당한다
   - 주체: 관리자
   - 위치: 정책 > Assignments
   - 데이터: 테스트 사용자 또는 기기 그룹
   - 해설: 설정 정책의 기기 범위와 규칙의 할당을 확인합니다
7. [끝] 승인 담당자의 요청 조회·관리 권한을 확인한다
   - 주체: 관리자
   - 위치: Endpoint Privilege Management > Elevation requests
   - 데이터: Elevation Requests View · Modify 및 관리 범위
   - 해설: 요청 처리는 별도의 권한과 범위를 필요로 합니다

#### L4 · ② 활성 — 지원 승인 후 파일을 상승 실행한다

1. [시작] EPM 정책을 받은 표준 사용자가 파일을 선택한다
   - 주체: 사용자
   - 위치: Windows 파일 탐색기
   - 데이터: 지원 승인 규칙에 일치하는 파일
   - 해설: 파일의 속성과 정책 대상을 확인합니다
2. [처리] 사용자가 Run with elevated access를 선택한다
   - 주체: 사용자
   - 위치: 파일 우클릭 메뉴
   - 해설: 일반 실행과 구별되는 EPM 상승 요청입니다
3. [처리] 사용자가 업무 사유와 함께 상승 요청을 제출한다
   - 주체: 사용자
   - 데이터: 사용자 · 기기 · 파일 · 요청 사유
   - 해설: 요청이 Intune 관리 센터로 전달됩니다
4. [처리] 권한 있는 관리자가 요청을 검토해 승인한다
   - 주체: 관리자
   - 위치: Endpoint Privilege Management > Elevation requests
   - 데이터: 파일 게시자 · 요청 사유 · 승인 결정
   - 해설: 관리자는 범위 안의 요청만 처리합니다
5. [처리] 승인 정보가 기기에 전달되고 사용자가 다시 상승 실행한다
   - 주체: 디바이스 · 사용자
   - 데이터: 승인 시점부터 24시간의 승인 범위
   - 해설: 기기 동기화 후 사용자가 같은 메뉴로 파일을 실행합니다
6. [끝] 관리자가 요청과 상승 증적을 확인한다
   - 주체: 관리자
   - 위치: Elevation requests · Tenant administration > Audit logs · 상승 보고서
   - 데이터: 승인 기록과 보고 설정에 따른 상승 데이터
   - 해설: 요청 승인과 실제 파일 실행은 별도 사건입니다

### L3 · A · 핵심 동작 — 파일 일치와 지원 승인

> 교육 포인트: 기본 응답은 규칙과 일치하지 않는 명시적 상승 요청에 적용됩니다. 이 예제의 기본값은 거부이며 모든 환경이 그렇다고 가정하지 않습니다.
> 주의: 지원 승인 거부 시 Intune이 사용자에게 자동 통지하지 않으므로 별도 안내가 필요합니다.
> 출처: https://learn.microsoft.com/en-us/intune/epm/manage-elevation-settings
> 출처: https://learn.microsoft.com/en-us/intune/epm/manage-support-approvals

#### L4 · ▶ 승인된 파일 상승 — 일치 여부와 승인 결정을 확인한다

1. [시작] 표준 사용자가 Run with elevated access를 선택한다
   - 주체: 사용자
   - 위치: Windows 파일 우클릭 메뉴
   - 데이터: 상승 실행할 파일
   - 해설: EPM에 명시적으로 상승을 요청합니다
2. [판단] 파일이 지원 승인 상승 규칙과 일치하는가?
   - 주체: EPM
   - 데이터: 파일 식별 조건 · 배포된 규칙
   - 해설: 일치하지 않으면 이 예제의 기본 거부 응답이 적용됩니다
   - 일치 → 3
   - 불일치 → [차단] 기본 거부 — 규칙과 기본 응답 확인
3. [처리] 사용자가 사유를 입력해 승인 요청을 보낸다
   - 주체: 사용자
   - 데이터: 기기 · 파일 · 업무 사유
   - 해설: 관리자의 승인 또는 거부를 기다립니다
4. [판단] 담당자가 요청을 승인했는가?
   - 주체: 관리자
   - 위치: Endpoint Privilege Management > Elevation requests
   - 데이터: Pending · 승인 또는 거부
   - 해설: 관리 권한이 있는 담당자가 파일과 사유를 검토합니다
   - 승인 → 5
   - 거부 → [차단] 승인 거부 — 담당자가 사용자에게 별도 안내
   - 대기 → [끝] 승인 대기 — 아직 상승 권한 없음
5. [처리] 승인 정보가 기기에 반영된 후 파일을 다시 실행한다
   - 주체: 사용자
   - 데이터: 승인 시간 · 해당 사용자와 기기 · 파일
   - 해설: 승인 통지를 받은 뒤 상승 실행을 다시 시도합니다
6. [끝] 관리자가 승인과 실행 보고를 대조한다
   - 주체: 관리자
   - 위치: Elevation requests · Audit logs · 상승 보고서
   - 데이터: 승인 결정 · 보고된 상승
   - 해설: 정책의 보고 범위를 고려해 증적을 확인합니다
- 시나리오: 일치 ▸ 승인 :: 파일 승인 후 기기에 반영되어 상승 실행
- 시나리오: 불일치 :: 규칙 불일치와 기본 거부로 상승 차단
- 시나리오: 일치 ▸ 거부 :: 관리자가 요청을 거부하고 사용자에게 안내
- 시나리오: 일치 ▸ 대기 :: 승인 전 요청이 대기하여 상승하지 않음
