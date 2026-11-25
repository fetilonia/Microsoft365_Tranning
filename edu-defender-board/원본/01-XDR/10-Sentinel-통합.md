## L2 · Sentinel 통합 — 작업 영역과 Defender 포털

- 설정(Control Plane): Microsoft Sentinel 작업 영역을 Defender 포털에 연결 | 기본 작업 영역과 Azure RBAC 확인
- 강제(Enforcement): 연결된 Sentinel 기능과 Defender XDR을 함께 사용할 때 통합 인시던트 관리 및 고급 헌팅 제공
- 증적(Evidence): 연결된 작업 영역 · Sentinel 데이터 · 인시던트 및 헌팅 결과
- 메뉴(Admin Center): Microsoft Defender 포털 > System > Settings > Microsoft Sentinel > Connect a workspace
- 라이선스(License): Defender 포털에서 Sentinel을 사용하기 위해 XDR 또는 E5 라이선스는 필수 아님 | Sentinel 사용료와 작업 영역별 권한 [확인 필요: 실제 SKU별 사용 권한과 대상 사용자 조건을 Microsoft Learn 서비스 설명·고객 계약 및 할당된 라이선스에서 대조]

### L3 · 0 · 기능 상태 전이 — 미연결 → 작업 영역 연결 → 통합 조사

#### L4 · ⓪ 비활성 — 작업 영역을 연결하기 전

1. [시작] 운영자가 Sentinel과 Defender의 경고를 조사한다
   - 주체: 보안 운영자
   - 데이터: Sentinel 작업 영역 · Defender 인시던트
   - 해설: 두 제품의 포털과 데이터 범위를 확인합니다.
2. [처리] Defender 포털에 연결된 작업 영역을 확인한다
   - 주체: 관리자
   - 위치: Defender 포털 › Settings › Microsoft Sentinel
   - 데이터: 작업 영역 연결 상태
   - 해설: 이 예제는 아직 작업 영역을 연결하지 않은 상태입니다.
3. [처리] 작업 영역에 필요한 역할을 확인한다
   - 주체: 관리자
   - 데이터: 테넌트 역할 · Azure RBAC
   - 해설: 볼 수 없는 작업 영역은 권한 부족일 수 있습니다.
4. [끝] 연결할 작업 영역과 담당자를 정한다
   - 주체: 관리자
   - 데이터: 기본 작업 영역 후보
   - 해설: 미연결을 데이터가 안전하다는 뜻으로 해석하지 않습니다.

#### L4 · ① 구성 — Defender 포털에서 작업 영역을 연결한다

1. [시작] Sentinel과 Azure 역할을 확인한다
   - 주체: 관리자
   - 위치: Azure portal › Microsoft Sentinel · 구독 역할
   - 데이터: Sentinel 작업 영역 · Entra Security Administrator · Azure 역할
   - 해설: 연결에는 문서에 명시된 테넌트와 작업 영역 권한이 필요합니다.
2. [처리] Defender 포털의 연결 화면을 연다
   - 주체: 관리자
   - 위치: Defender 포털 › System › Settings › Microsoft Sentinel › Connect a workspace
   - 데이터: 접근 가능한 작업 영역
   - 해설: 필요한 권한이 없으면 목록에 표시되지 않을 수 있습니다.
3. [처리] 연결할 작업 영역을 선택한다
   - 주체: 관리자
   - 위치: Connect a workspace › 작업 영역 선택
   - 데이터: 작업 영역 목록
   - 해설: 연결할 작업 영역을 검토한 뒤 다음을 선택합니다.
4. [처리] 기본 작업 영역을 지정한다
   - 주체: 관리자
   - 위치: Connect a workspace › Primary workspace
   - 데이터: 기본 작업 영역 · 보조 작업 영역
   - 해설: 하나의 테넌트에 기본 작업 영역과 여러 보조 작업 영역이 가능합니다.
5. [처리] 연결에 따른 제품 변경 사항을 검토한다
   - 주체: 관리자
   - 위치: Connect a workspace › 연결 전 안내
   - 데이터: 통합 기능 · 커넥터 영향
   - 해설: 작업 영역과 기존 데이터 커넥터에 미치는 영향을 확인합니다.
6. [끝] 연결하고 상태를 확인한다
   - 주체: 관리자
   - 위치: Connect a workspace › Connect
   - 데이터: 연결 상태 · 기본 작업 영역
   - 해설: 연결 완료와 데이터 수집 구성을 별도로 검증합니다.

#### L4 · ② 활성 — 연결된 작업 영역의 인시던트를 조사한다

1. [시작] 운영자가 Defender 포털에서 인시던트 목록을 연다
   - 주체: 보안 운영자
   - 위치: Defender 포털 › Incidents
   - 데이터: 인시던트 · 연결 작업 영역
   - 해설: Sentinel과 XDR을 함께 사용할 때 공유된 조사를 수행합니다.
2. [처리] 연결된 작업 영역과 데이터 범위를 확인한다
   - 주체: 보안 운영자
   - 데이터: 기본 작업 영역 · Azure RBAC
   - 해설: Sentinel 데이터는 작업 영역의 권한에 영향을 받습니다.
3. [판단] 조사할 데이터와 작업 영역에 접근할 수 있는가?
   - 주체: 보안 운영자
   - 데이터: 작업 영역 연결 · 권한 · 수집 상태
   - 해설: 데이터가 보이지 않을 때 연결과 수집 및 권한을 분리합니다.
   - 접근 가능 → 4
   - 접근 불가 → 6
4. [처리] 인시던트의 경고와 관련 데이터를 검토한다
   - 주체: 보안 운영자
   - 위치: Defender 포털 › 인시던트 상세 · Advanced hunting
   - 데이터: Sentinel · Defender 경고와 엔터티
   - 해설: 원본과 데이터 범위를 구별하면서 조사합니다.
5. [끝] 작업 영역과 조사 결과를 기록한다
   - 주체: 보안 운영자
   - 데이터: 인시던트 ID · 작업 영역 · 증거
   - 해설: 포털 통합이 수집 설정이나 대응 성공을 보장하지는 않습니다.
6. [끝] 작업 영역 연결·권한과 커넥터를 점검한다
   - 주체: 관리자
   - 데이터: Azure RBAC · 연결 상태 · 데이터 커넥터
   - 해설: 미표시의 원인을 권한 부족과 미수집으로 나누어 확인합니다.
- 시나리오: 접근 가능 :: 연결된 Sentinel 데이터와 인시던트 조사
- 시나리오: 접근 불가 :: 작업 영역 권한과 수집 공백 점검

> 주의: Defender XDR 또는 E5 라이선스 없이도 Microsoft Sentinel을 Defender 포털에 연결할 수 있습니다. 작업 영역 과금, 데이터 커넥터별 요구 조건 및 권한은 대상 Azure 구독과 작업 영역에서 [확인 필요: 실제 SKU별 사용 권한과 대상 사용자 조건을 Microsoft Learn 서비스 설명·고객 계약 및 할당된 라이선스에서 대조].
> 출처: https://learn.microsoft.com/en-us/azure/sentinel/microsoft-sentinel-onboard
> 확인일: 2026-11-25

### L3 · A · 권한 경계 — 보이지 않는 작업 영역

#### L4 · 작업 영역 선택 — 권한과 연결 상태를 구분

1. [시작] 관리자가 작업 영역 연결 화면을 연다
   - 주체: 관리자
   - 위치: Defender 포털 › Settings › Microsoft Sentinel › Connect a workspace
   - 데이터: 현재 로그인 계정
   - 해설: 목록은 로그인한 사용자의 권한에 영향을 받습니다.
2. [처리] 필요한 테넌트 및 Azure 역할을 확인한다
   - 주체: 관리자
   - 데이터: Security Administrator · Owner 또는 User Access Administrator와 Sentinel Contributor
   - 해설: 연결 요구 사항을 작업 영역 범위와 함께 확인합니다.
3. [판단] 대상 작업 영역이 목록에 표시되는가?
   - 주체: 관리자
   - 데이터: 대상 작업 영역 · 표시 여부
   - 해설: 권한 부족인 작업 영역은 목록에 보이지 않을 수 있습니다.
   - 표시 → 4
   - 미표시 → 5
4. [끝] 기본 작업 영역을 지정하고 연결을 검토한다
   - 주체: 관리자
   - 데이터: 작업 영역 · 기본 선택
   - 해설: 연결하기 전에 제품 변경 사항을 읽습니다.
5. [끝] 작업 영역의 Azure 권한과 테넌트를 확인한다
   - 주체: 관리자
   - 데이터: Azure RBAC · Entra 테넌트
   - 해설: 목록에서 보이지 않는 것을 작업 영역이 없다는 증거로 해석하지 않습니다.
- 시나리오: 표시 :: 접근 가능한 작업 영역을 연결 대상으로 검토
- 시나리오: 미표시 :: 작업 영역 역할과 테넌트 점검

> 출처: https://learn.microsoft.com/en-us/azure/sentinel/microsoft-sentinel-onboard
> 확인일: 2026-11-25
