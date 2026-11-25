## L2 · XDR 합류 — Cloud 경고와 XDR 인시던트

- 설정(Control Plane): Defender for Cloud와 Defender XDR 연동 상태 · 구독과 조사 권한 확인
- 강제(Enforcement): 지원되는 Cloud 경고가 XDR에 수집되어 인시던트에 포함·상관
- 증적(Evidence): Cloud 원본 경고 · Defender XDR 경고 및 인시던트 · 경고 상태
- 메뉴(Admin Center): Azure portal > Defender for Cloud > Security alerts | Microsoft Defender 포털 > Incidents & alerts
- 라이선스(License): Defender for Cloud와 Defender XDR 통합의 테넌트·플랜·권한 조건 [확인 필요: 실제 SKU별 사용 권한과 대상 사용자 조건을 Microsoft Learn 서비스 설명·고객 계약 및 할당된 라이선스에서 대조]

### L3 · 0 · 기능 상태 전이 — 연동 확인 → 조사 준비 → 경고 대조

#### L4 · ⓪ 비활성 — Cloud 경고의 XDR 표시를 확인하기 전

1. [시작] 클라우드 리소스에서 보안 경고가 발생한다
   - 주체: Defender for Cloud
   - 데이터: 구독 · 리소스 · 경고
   - 해설: 경고의 원본과 테넌트 범위를 먼저 확인합니다.
2. [처리] 운영자가 Cloud 포털에서 원본 경고를 확인한다
   - 주체: 보안 운영자
   - 위치: Defender for Cloud › Security alerts
   - 데이터: 경고 ID · 상태
   - 해설: 원본 경고는 XDR 인시던트와 별도로 식별합니다.
3. [처리] XDR 연동과 접근 권한을 확인한다
   - 주체: 관리자
   - 데이터: 연동 상태 · 사용자 권한
   - 해설: 연동이 미확인일 때 표시 결과를 가정하지 않습니다.
4. [끝] 경고의 수신 범위와 공백을 기록한다
   - 주체: 보안 운영자
   - 데이터: 구독 · 연동 상태
   - 해설: XDR에서 보이지 않는 것이 원본 경고의 부재를 의미하지 않습니다.

#### L4 · ① 구성 — 두 포털의 연동 및 권한을 확인한다

1. [시작] 대상 구독과 Cloud 보호 플랜을 확인한다
   - 주체: 관리자
   - 위치: Defender for Cloud › Environment settings
   - 데이터: 구독 · 플랜 · 테넌트
   - 해설: 경고를 생성할 보호 대상과 구독을 확인합니다.
2. [처리] Defender XDR 연동 상태를 점검한다
   - 주체: 관리자
   - 위치: Defender for Cloud › 환경 설정 · 통합 설정 [확인 필요: 현재 포털 메뉴명과 기능별 경로를 대상 테넌트에서 확인하고 최신 Microsoft Learn 절차와 대조]
   - 데이터: Cloud와 XDR의 연동 상태
   - 해설: 기본 연동 여부와 환경별 설정 경로를 확인합니다.
3. [처리] 운영자의 두 포털 접근을 확인한다
   - 주체: 관리자
   - 위치: Azure portal › 구독 RBAC · Defender 포털 › 권한
   - 데이터: 구독 접근 · XDR 경고 권한
   - 해설: 포털마다 다른 접근 범위를 고려합니다.
4. [처리] Cloud 경고의 리소스와 ID를 기록한다
   - 주체: 보안 운영자
   - 위치: Defender for Cloud › Security alerts
   - 데이터: 경고 ID · 구독 · 발생 시각
   - 해설: XDR에서 대조할 기준을 만듭니다.
5. [처리] XDR의 인시던트 및 경고 화면을 연다
   - 주체: 보안 운영자
   - 위치: Defender 포털 › Incidents & alerts
   - 데이터: 검색 필터 · 데이터 범위
   - 해설: 사용자 권한과 필터에 의해 결과가 달라질 수 있습니다.
6. [끝] 수집·동기화 상태를 확인한다
   - 주체: 보안 운영자
   - 위치: Cloud 경고 상세 · XDR 인시던트 상세
   - 데이터: 원본 및 수신 경고 상태
   - 해설: 동일 경고와 관련 인시던트의 관계를 검토합니다.

#### L4 · ▶ ② 활성 — Cloud 경고가 XDR에 표시되는지 대조한다

1. [시작] Defender for Cloud가 리소스의 위협 경고를 만든다
   - 주체: Defender for Cloud
   - 데이터: 경고 · 리소스 · 구독
   - 해설: 이 예제는 지원되는 Cloud 경고가 발생한 경우입니다.
2. [처리] 연동 경로로 XDR이 Cloud 경고를 수집한다
   - 주체: Defender XDR
   - 데이터: 원본 경고 · 연동 상태
   - 해설: 연동 상태와 수집 범위가 전제입니다.
3. [판단] 운영자가 XDR에서 해당 경고를 확인하는가?
   - 주체: 보안 운영자
   - 데이터: 경고 ID · 구독 · 권한 · 검색 범위
   - 해설: 미표시는 연동·권한·지연을 나누어 조사합니다.
   - 확인됨 → 4
   - 미표시 → 6
4. [처리] XDR 인시던트와 Cloud 원본 경고를 대조한다
   - 주체: 보안 운영자
   - 위치: Defender 포털 › 인시던트 상세 · Cloud › Security alerts
   - 데이터: 경고 · 인시던트 · 관련 자산
   - 해설: 관련 신호가 있으면 인시던트에 다른 경고가 함께 포함될 수 있습니다.
5. [끝] 경고 상태와 조사 결과를 기록한다
   - 주체: 보안 운영자
   - 데이터: 원본 경고 상태 · XDR 경고 상태
   - 해설: 지원되는 Cloud 경고의 상태 동기화 조건을 확인합니다.
6. [끝] 연동과 데이터 범위를 조사한다
   - 주체: 관리자
   - 데이터: 테넌트 · 구독 권한 · 연동 상태 · 수집 지연 [확인 필요: 실제 SKU별 사용 권한과 대상 사용자 조건을 Microsoft Learn 서비스 설명·고객 계약 및 할당된 라이선스에서 대조]
   - 해설: XDR 표시 공백을 Cloud 위협이 없다는 증거로 해석하지 않습니다.
- 시나리오: 확인됨 :: Cloud 경고와 XDR 인시던트 대조
- 시나리오: 미표시 :: 연동과 접근 범위 및 지연 점검

> 주의: 제품별 경고 유형에 따른 상태 동기화 예외와 연동 기본값은 [확인 필요: 기능별 이벤트·보고 필드, 필요한 감사 설정과 역할을 대상 테넌트의 Activity explorer·감사·경고에서 확인].
> 출처: https://learn.microsoft.com/en-us/azure/defender-for-cloud/concept-integration-365

### L3 · A · 경고 상태 동기화 — 원본별 차이 확인

#### L4 · 상태 변경 — Cloud 경고와 XDR 비교

1. [시작] 운영자가 두 포털에서 같은 경고를 찾는다
   - 주체: 보안 운영자
   - 데이터: 경고 ID · 원본 제품
   - 해설: Cloud 원본 경고와 다른 제품에서 생성된 경고를 구분합니다.
2. [처리] 연동된 Cloud 경고의 상태를 확인한다
   - 주체: 보안 운영자
   - 위치: Defender for Cloud › Security alerts · Defender 포털
   - 데이터: 경고 상태 · 원본 제품
   - 해설: 상태 동기화에는 경고 원본에 따른 차이가 있습니다.
3. [판단] Defender for Cloud가 생성한 경고인가?
   - 주체: 보안 운영자
   - 데이터: 경고 원본
   - 해설: 문서는 Cloud 원본 경고와 Cloud 리소스의 MDE 경고에 서로 다른 동기화 동작을 제시합니다.
   - Cloud 원본 → 4
   - MDE 원본 → 5
4. [끝] 양쪽 경고 상태의 동기화를 대조한다
   - 주체: 보안 운영자
   - 데이터: Cloud 상태 · XDR 상태
   - 해설: 연동이 활성화된 Cloud 원본 경고의 상태 변화를 비교합니다.
5. [끝] MDE 경고의 상태 변경 방향을 별도 확인한다
   - 주체: 보안 운영자
   - 데이터: MDE 원본 · Cloud 변경 상태
   - 해설: Cloud에서 바꾼 MDE 경고 상태가 XDR에 반영된다고 가정하지 않습니다.
- 시나리오: Cloud 원본 :: Cloud 원본 경고의 양쪽 상태 대조
- 시나리오: MDE 원본 :: MDE 원본 경고의 동기화 예외 확인

> 출처: https://learn.microsoft.com/en-us/azure/defender-for-cloud/concept-integration-365
