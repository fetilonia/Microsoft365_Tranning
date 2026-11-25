## L2 · Foundational CSPM — 권장 사항과 보안 점수

- 설정(Control Plane): Azure 구독에서 Defender for Cloud 활성화 | 평가할 구독과 MCSB 표준 확인
- 강제(Enforcement): 범위 내 자산의 보안 상태 평가 · 권장 사항 제공 | 권장 사항 자체가 자동 차단을 뜻하지 않음
- 증적(Evidence): Azure 포털의 Recommendations · Security posture · Secure score
- 메뉴(Admin Center): Azure portal > Defender for Cloud > Recommendations · Security posture
- 라이선스(License): Foundational CSPM 무료 | Defender CSPM의 공격 경로 분석·위험 우선순위는 유료 플랜

### L3 · 0 · 기능 상태 전이 — 범위 확인 → 활성화 → 권장 사항 검토

#### L4 · ⓪ 비활성 — 구독을 평가 범위에 넣기 전

1. [시작] 관리자가 Azure 구독의 보안 구성을 검토하려 한다
   - 주체: 관리자
   - 데이터: Azure 구독 · 검토할 리소스
   - 해설: 이 예제는 아직 Defender for Cloud를 활성화하지 않은 구독에서 시작합니다.
2. [처리] 평가 범위와 구독 필터를 확인한다
   - 주체: 관리자
   - 위치: Azure portal › Defender for Cloud
   - 데이터: 선택 구독 · 서비스 활성화 상태
   - 해설: 포털 필터와 서비스 상태를 혼동하지 않습니다.
3. [처리] 해당 구독의 MCSB 평가를 확인한다
   - 주체: 관리자
   - 데이터: 기본 표준 적용 및 평가 여부
   - 해설: 서비스 활성화 전에는 이 예제의 기본 표준 평가가 시작되지 않았습니다.
4. [끝] 설정 검토를 위한 평가 범위를 준비한다
   - 주체: 관리자
   - 데이터: 대상 구독 · 리소스 목록
   - 해설: 점수 부재가 리소스가 안전하다는 뜻은 아닙니다.

#### L4 · ① 구성 — 구독을 활성화하고 기본 표준을 확인한다

1. [시작] 관리자가 Azure 구독과 접근 권한을 확인한다
   - 주체: 관리자
   - 위치: Azure portal › 구독
   - 데이터: 대상 구독 · 관리자 권한 [확인 필요: 실제 SKU별 사용 권한과 대상 사용자 조건을 Microsoft Learn 서비스 설명·고객 계약 및 할당된 라이선스에서 대조]
   - 해설: 서비스 활성화와 리소스 수정에 필요한 권한은 각각 확인합니다.
2. [처리] Defender for Cloud를 연다
   - 주체: 관리자
   - 위치: Azure portal › Defender for Cloud
   - 데이터: 현재 선택한 구독
   - 해설: 보안 점수를 볼 구독 범위를 확인합니다.
3. [처리] 구독에 Defender for Cloud를 활성화한다
   - 주체: 관리자
   - 위치: Defender for Cloud › Environment settings › 구독 [확인 필요: 현재 포털 메뉴명과 기능별 경로를 대상 테넌트에서 확인하고 최신 Microsoft Learn 절차와 대조]
   - 데이터: 구독의 Defender for Cloud 사용 상태
   - 해설: 환경의 구체적 활성화 경로와 권한을 확인합니다.
4. [처리] MCSB 기본 적용을 확인한다
   - 주체: 관리자
   - 위치: Defender for Cloud › Environment settings › 구독의 보안 정책 [확인 필요: 현재 포털 메뉴명과 기능별 경로를 대상 테넌트에서 확인하고 최신 Microsoft Learn 절차와 대조]
   - 데이터: Microsoft cloud security benchmark 표준
   - 해설: Azure 구독에서 서비스를 켜면 MCSB 표준이 기본 적용됩니다.
5. [처리] 자산과 구독 필터를 확인한다
   - 주체: 관리자
   - 위치: Defender for Cloud › Inventory · 구독 필터
   - 데이터: 선택된 리소스와 적용 범위
   - 해설: 범위 밖 리소스는 선택한 결과에 나타나지 않을 수 있습니다.
6. [끝] 권장 사항 및 보안 상태 화면을 연다
   - 주체: 관리자
   - 위치: Defender for Cloud › Recommendations · Security posture
   - 데이터: 평가 상태 · 권장 사항 · Secure score
   - 해설: 수집과 평가가 완료됐는지 확인한 뒤 결과를 해석합니다.

#### L4 · ▶ ② 활성 — 권장 사항을 수정하고 재평가를 확인한다

1. [시작] Defender for Cloud가 구독 리소스를 평가한다
   - 주체: Defender for Cloud
   - 데이터: 범위 내 리소스 · MCSB 평가
   - 해설: 평가 결과를 토대로 보안 권장 사항을 만듭니다.
2. [처리] 관리자가 보안 권장 사항을 연다
   - 주체: 관리자
   - 위치: Azure portal › Defender for Cloud › Recommendations
   - 데이터: 권장 사항 · 정상/비정상 리소스
   - 해설: 점수만 보지 말고 영향을 받는 리소스를 확인합니다.
3. [판단] 예제 리소스가 해당 권장 사항에서 비정상인가?
   - 주체: Defender for Cloud
   - 데이터: 리소스의 평가 결과
   - 해설: 미평가 또는 적용 불가는 정상으로 취급하지 않습니다.
   - 비정상 → 4
   - 미평가 → 7
4. [처리] 관리자가 권장 수정 방법을 검토하고 설정을 바꾼다
   - 주체: 관리자
   - 위치: 권장 사항 상세 › 영향을 받는 리소스 · 수정 지침
   - 데이터: 기존 설정 · 변경한 설정
   - 해설: 권장 사항은 자동으로 변경을 실행했다는 뜻이 아닙니다.
5. [처리] 재평가 후 리소스와 보안 제어의 상태를 확인한다
   - 주체: 관리자
   - 데이터: 평가 결과 · 제어별 현재 점수
   - 해설: 권장 사항과 제어의 갱신 시점이 달라 일시적 차이가 있을 수 있습니다.
6. [끝] 수정 결과와 점수 기여 여부를 기록한다
   - 주체: 관리자
   - 데이터: 정상/비정상 상태 · 점수 기여 · 평가 시각
   - 해설: 모든 권장 사항이나 미리 보기 항목이 점수에 기여하는 것은 아닙니다.
7. [끝] 범위·지원 여부와 평가 지연을 조사한다
   - 주체: 관리자
   - 데이터: 구독 필터 · 리소스 유형 · 평가 상태
   - 해설: 아직 평가되지 않은 리소스를 안전하다고 표시하지 않습니다.
- 시나리오: 비정상 :: 비정상 리소스 수정과 재평가 확인
- 시나리오: 미평가 :: 평가 공백의 범위와 지연 조사

> 교육 포인트: Foundational CSPM은 무료이며 유료 Defender CSPM의 공격 경로 분석과 구분한다.
> 주의: 예제의 Azure 포털 Secure score와 Defender 포털의 Cloud Secure Score는 서로 다른 모델이다. 포털 메뉴·수정 권한은 [확인 필요: 현재 포털 메뉴명과 기능별 경로를 대상 테넌트에서 확인하고 최신 Microsoft Learn 절차와 대조].
> 출처: https://learn.microsoft.com/en-us/azure/defender-for-cloud/concept-cloud-security-posture-management
> 출처: https://learn.microsoft.com/en-us/azure/defender-for-cloud/secure-score-security-controls

### L3 · A · 점수 해석 — 권장 사항과 제어 점수

#### L4 · Azure Secure score — 비정상 리소스와 점수 기여

1. [시작] 관리자가 Azure 포털에서 보안 점수를 연다
   - 주체: 관리자
   - 위치: Defender for Cloud › Security posture
   - 데이터: 선택한 구독 · 현재 Secure score
   - 해설: 이 예제는 Azure 포털의 기존 Secure score 모델입니다.
2. [처리] 보안 제어와 그 아래 권장 사항을 펼친다
   - 주체: 관리자
   - 위치: Defender for Cloud › Recommendations › Secure score recommendations
   - 데이터: 제어별 최대 점수 · 현재 점수 · 권장 사항
   - 해설: 하나의 보안 제어는 관련 권장 사항을 묶습니다.
3. [판단] 권장 사항이 미리 보기 상태인가?
   - 주체: Defender for Cloud
   - 데이터: 권장 사항의 Preview 표시
   - 해설: 미리 보기 권장 사항은 기존 Secure score 계산에서 제외됩니다.
   - 정식 → 4
   - 미리 보기 → 5
4. [끝] 정식 권장 사항의 점수 기여와 리소스를 확인한다
   - 주체: 관리자
   - 데이터: MCSB 기본 제공 권장 사항 여부 · 정상/비정상 리소스
   - 해설: 정식 상태만으로 모든 권장 사항이 점수에 기여한다고 보지 않습니다.
5. [끝] 점수와 별개로 미리 보기 권장 사항을 검토한다
   - 주체: 관리자
   - 데이터: Preview 상태 · 영향을 받는 리소스
   - 해설: 점수에 포함되지 않아도 문제 수정의 필요성을 검토합니다.
- 시나리오: 정식 :: 정식 권장 사항의 점수 기여 확인
- 시나리오: 미리 보기 :: 점수 제외된 미리 보기 위험 검토

> 출처: https://learn.microsoft.com/en-us/azure/defender-for-cloud/secure-score-security-controls
