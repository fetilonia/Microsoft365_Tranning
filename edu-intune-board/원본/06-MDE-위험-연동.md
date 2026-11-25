## L2 · MDE 위험 연동 — 기기 위험 점수 → 준수

- 설정(Control Plane): Intune과 Defender for Endpoint 서비스 연결 · Windows 준수 평가 연결 | 온보딩 · 준수 정책의 위험 임계값
- 강제(Enforcement): MDE가 기기 위험을 평가 | Intune이 수신 신호와 준수 정책을 비교 | CA 접근 제어는 별도
- 증적(Evidence): 커넥터 연결 상태 · Defender 기기 인벤토리와 위험 수준 | Intune 정책별 기기 준수 상태
- 메뉴(Admin Center): Intune 관리 센터 > Endpoint security > Defender for Endpoint | Endpoint security > Device compliance
- 라이선스(License): Intune과 Defender for Endpoint의 연동·위험 평가 자격, CA 사용 시 Entra 자격 [확인 필요: SKU와 사용자별 할당]

### L3 · 0 · 기능 상태 전이 — 미연결 → 연동 구성 → 위험 기반 평가

> 교육 포인트: 서비스 연결과 개별 기기의 MDE 온보딩은 별도입니다. 위험 수준은 Intune이 아니라 MDE가 제공하며, 접근 차단은 별도 CA 정책의 역할입니다.
> 출처: https://learn.microsoft.com/en-us/intune/device-security/microsoft-defender/configure-integration
> 출처: https://learn.microsoft.com/en-us/intune/device-security/microsoft-defender/overview

#### L4 · ⓪ 비활성 — 위험 신호를 이용한 준수 평가가 준비되지 않았다

1. [시작] 관리 기기에 보안 위협이 발생한다
   - 주체: 디바이스
   - 데이터: 관리 Windows 기기
   - 해설: 기기 위협과 Intune 준수 정책 연동은 서로 다른 구성입니다
2. [처리] MDE와 Intune의 연동이 구성되지 않았다
   - 주체: 관리자
   - 위치: Endpoint security > Defender for Endpoint
   - 데이터: 서비스 연결 상태
   - 해설: 이 예제의 위험 신호 기반 평가는 준비되지 않았습니다
3. [처리] 별도의 기존 보안 및 준수 정책은 계속 동작할 수 있다
   - 주체: Intune
   - 데이터: 기존 설정과 준수 규칙
   - 해설: 연동 미구성이 다른 보호 기능 전체의 비활성을 뜻하지 않습니다
4. [끝] 관리자가 연결과 온보딩을 계획한다
   - 주체: 관리자
   - 해설: 서비스 연결과 기기 온보딩을 모두 준비해야 합니다

#### L4 · ① 구성 — 연결·온보딩·임계값을 설정한다

1. [시작] 관리자가 제품 라이선스와 권한을 확인한다
   - 주체: 관리자
   - 위치: Intune 관리 센터 · Microsoft Defender 포털
   - 데이터: Intune·MDE 자격 및 관리 역할 [확인 필요: 고객 환경]
   - 해설: 두 서비스에 각각 필요한 권한을 확인합니다
2. [처리] Defender 포털에서 Intune 연결을 켠다
   - 주체: 관리자
   - 위치: Defender 포털 > Settings > Endpoints > General > Advanced features > Intune connection
   - 데이터: Intune connection On
   - 해설: 서비스 간 연결을 활성화합니다
3. [처리] Intune에서 연결 상태와 Windows 준수 평가 연결을 확인한다
   - 주체: 관리자
   - 위치: Endpoint security > Defender for Endpoint
   - 데이터: Connection status · Connect Windows devices to Defender for Endpoint
   - 해설: Windows 기기의 준수 평가에 연동을 사용하도록 설정합니다
4. [처리] Windows EDR 온보딩 정책을 만든다
   - 주체: 관리자
   - 위치: Endpoint security > Endpoint detection and response > Create policy
   - 데이터: Windows · Endpoint detection and response · Auto from connector
   - 해설: 연결에서 받은 온보딩 패키지로 기기를 준비합니다
5. [처리] 온보딩 정책을 테스트 기기 그룹에 할당한다
   - 주체: 관리자
   - 위치: 정책 > Assignments
   - 데이터: 테스트 기기 그룹
   - 해설: 선택된 기기가 Defender 서비스와 통신하도록 합니다
6. [처리] Windows 준수 정책에 위험 허용 기준을 지정한다
   - 주체: 관리자
   - 위치: Endpoint security > Device compliance > Policies > Compliance settings > Microsoft Defender for Endpoint
   - 데이터: Require the device to be at or under the machine risk score = Low
   - 해설: 이 예제는 Low 이하의 위험을 허용합니다
7. [끝] 준수 정책을 할당하고 온보딩을 확인한다
   - 주체: 관리자
   - 위치: Defender 포털 > Endpoints > Device inventory · Intune 준수 정책
   - 데이터: 기기 인벤토리 · 정책 할당
   - 해설: 기기가 Defender에 나타나는지와 준수 대상인지 대조합니다

#### L4 · ② 활성 — MDE 위험 신호로 준수 상태를 평가한다

1. [시작] 온보딩된 기기에서 위협 신호가 수집된다
   - 주체: Defender for Endpoint
   - 데이터: 해당 Windows 기기의 보안 신호
   - 해설: MDE가 기기 위험을 평가합니다
2. [처리] MDE가 기기의 위험 수준을 제공한다
   - 주체: Defender for Endpoint
   - 위치: Defender 포털 > Endpoints > Device inventory
   - 데이터: 기기 위험 수준
   - 해설: 위험 평가는 MDE에 속합니다
3. [처리] Intune이 연결을 통해 위험 신호를 받는다
   - 주체: Intune
   - 데이터: 기기 위험 수준
   - 해설: Intune이 신호를 준수 정책과 비교할 수 있습니다
4. [처리] 위험 수준을 설정한 Low 기준과 비교한다
   - 주체: Intune
   - 데이터: 허용 최대 수준 Low · 실제 위험
   - 해설: 기준 초과 여부를 준수 평가에 반영합니다
5. [처리] 기기 준수 결과를 보고한다
   - 주체: Intune
   - 데이터: 위험 설정별 상태와 전체 준수 상태
   - 해설: 비준수 조치와 다른 준수 규칙도 결과에 영향을 줍니다
6. [끝] 관리자가 두 포털의 상태를 비교한다
   - 주체: 관리자
   - 위치: Defender 기기 페이지 · Intune 준수 보고서
   - 데이터: 동일 기기 식별자 · 위험 수준 · 평가 시각
   - 해설: 위험과 준수 결과가 전파되는 시점을 확인합니다

### L3 · A · 핵심 동작 — 위험 임계값과 신호 누락

> 교육 포인트: Low 기준에서 Medium 또는 High 위험은 기준을 초과합니다. 접근 차단은 별도의 활성 CA 정책이 적용될 때만 이뤄집니다.
> 주의: 신호 누락 시 정확한 상태와 전파 시간은 플랫폼·환경별 [확인 필요: 대상 구독·테넌트·리전의 설정과 권한을 공식 절차 및 실제 관리자 화면에서 확인]이며, 누락을 안전한 상태로 간주하지 않습니다.
> 출처: https://learn.microsoft.com/en-us/intune/device-security/microsoft-defender/configure-integration

#### L4 · ▶ MDE 위험 기반 준수 — 온보딩과 위험을 확인한다

1. [시작] 관리자가 Low 위험 기준 준수 정책을 할당한다
   - 주체: 관리자
   - 위치: Endpoint security > Device compliance
   - 데이터: Windows 기기 · 최대 위험 Low
   - 해설: 대상 기기 위험 신호를 사용해 평가합니다
2. [판단] 연결과 기기 온보딩이 준비되어 신호가 있는가?
   - 주체: Intune · Defender for Endpoint
   - 데이터: 연결 상태 · Defender 인벤토리 · 위험 신호
   - 해설: 연결 또는 온보딩 누락 시 정상 평가로 간주하지 않습니다
   - 있음 → 3
   - 없음 → [끝] 신호 누락 — 연결·온보딩·동기화 점검
3. [판단] 위험이 Low 이하인가?
   - 주체: Intune
   - 데이터: MDE 위험 수준 · 정책 임계값
   - 해설: 위험이 기준을 넘는지 평가합니다
   - 이하 → 4
   - 초과 → 5
4. [끝] 위험 설정의 준수 조건을 충족한다
   - 주체: Intune
   - 데이터: 위험 설정별 준수 결과
   - 해설: 다른 준수 규칙의 결과는 별도입니다
5. [처리] 위험 초과에 따라 비준수 조치를 평가한다
   - 주체: Intune
   - 데이터: 위험 설정 결과 · 비준수 표시 일정
   - 해설: 설정한 비준수 조치가 적용됩니다
6. [끝] 관리자가 위험 해결 후 재평가를 확인한다
   - 주체: 관리자
   - 위치: Defender 기기 페이지 · Intune 준수 보고서
   - 데이터: 해결 후 위험 수준 · 준수 상태 및 시각
   - 해설: 위험 해결 직후 두 보고서가 동시에 바뀐다고 가정하지 않습니다
- 시나리오: 있음 ▸ 이하 :: 위험 수준이 Low 이하로 준수 조건 충족
- 시나리오: 없음 :: 연결 또는 온보딩 문제로 위험 신호 점검
- 시나리오: 있음 ▸ 초과 :: 위험 기준 초과 후 조치와 재평가 확인
