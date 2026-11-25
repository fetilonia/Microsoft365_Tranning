## L2 · Insider Risk · Adaptive Protection — 위험 수준 기반 DLP

- 설정(Control Plane): Insider Risk Management 정책·지표·위험 수준 정의 | Adaptive Protection과 DLP 위험 조건
- 강제(Enforcement): 사용자 위험 수준에 맞는 DLP 정책 동작 | 조건부 액세스 연동은 별도 구성·미리 보기
- 증적(Evidence): Insider Risk 경고·사용자 위험 수준 | 적용 범위 내 DLP 정책·경고
- 메뉴(Admin Center): Insider Risk Management > Adaptive protection | Data loss prevention > Policies
- 라이선스(License): Insider Risk·Adaptive Protection·DLP 및 조건부 액세스의 결합 요건 [확인 필요: 고객 SKU]

### L3 · 0 · 기능 상태 전이 — 연결 전 → 위험 조건 구성 → 공유 통제

#### L4 · ⓪ 비활성 — Adaptive Protection 연결 전

1. [시작] 관리자가 사용자 위험과 보호 목표 정의
   - 주체: 관리자
   - 데이터: 교육용 사용자·외부 공유 사례
   - 해설: 위험 신호를 어떻게 통제할지 계획합니다.
2. [처리] 예제의 Adaptive Protection 연결은 아직 구성하지 않음
   - 주체: 관리자
   - 데이터: 위험 수준과 DLP 연동 미구성
   - 해설: 기존 DLP나 다른 보호 정책은 별도로 존재할 수 있습니다.
3. [처리] 역할과 개인정보 보호 원칙 검토
   - 주체: 관리자
   - 위치: Insider Risk Management 권한
   - 데이터: 조사자 역할·사용자 가명 처리
   - 해설: 사용자 정보는 기본적으로 가명 처리되며 권한을 제한합니다.
4. [끝] 정책·위험 기준과 테스트 범위 선정
   - 주체: 관리자
   - 데이터: 대상 사용자·위험 수준·DLP 동작
   - 해설: 데이터 공유 동작과 위험 조건을 함께 설계합니다.

#### L4 · ① 구성 — 위험 수준을 DLP 규칙에 연결

1. [시작] 라이선스와 관리자 역할 확인
   - 주체: 관리자
   - 위치: Purview 역할 및 서비스 구독
   - 데이터: Insider Risk·DLP 사용 권한과 라이선스
   - 해설: 기능별 전제와 개인정보 처리 범위를 검토합니다.
2. [처리] Insider Risk 정책의 대상과 지표 검토
   - 주체: 관리자
   - 위치: Insider Risk Management › Policies
   - 데이터: 정책 대상 사용자·지표·임계값
   - 해설: 어떤 활동을 위험 신호로 분석할지 정합니다.
3. [처리] Adaptive Protection 위험 수준 정의
   - 주체: 관리자
   - 위치: Insider Risk Management › Adaptive protection
   - 데이터: Elevated · Moderate · Minor 위험 수준
   - 해설: 경고 심각도와 사용자 위험 수준은 서로 다릅니다.
4. [처리] DLP 정책에 위험 수준 조건 추가
   - 주체: 관리자
   - 위치: Data loss prevention › Policies › 규칙 조건
   - 데이터: Insider risk level for Adaptive Protection = Elevated
   - 해설: 예제는 Elevated 사용자의 공유를 대상으로 합니다.
5. [처리] 외부 공유 조건과 차단 동작 설정
   - 주체: 관리자
   - 위치: DLP 규칙 › 조건 및 동작
   - 데이터: 외부 공유 AND Elevated 위험 수준·차단
   - 해설: 위험 수준만으로 자동 차단된다고 가정하지 않습니다.
6. [처리] 테스트 범위와 DLP 정책 모드 확인
   - 주체: 관리자
   - 위치: DLP 정책 대상 및 모드
   - 데이터: 사용자·위치·활성 상태
   - 해설: 별도 정책과 실제 적용 범위를 검토합니다.
7. [끝] 위험 수준과 적용 정책 확인 준비
   - 주체: 관리자
   - 위치: Adaptive protection › Data Loss Prevention
   - 데이터: 사용자별 위험 수준 및 범위 내 정책
   - 해설: 정책 적용 상태를 위험 신호와 함께 조사합니다.

#### L4 · ② 활성 — 위험 수준에 따라 외부 공유 평가

1. [시작] 사용자 활동이 Insider Risk 정책에서 분석됨
   - 주체: Insider Risk Management
   - 데이터: 정책 범위의 활동·인사이트
   - 해설: 활동 하나가 자동으로 특정 위험 수준을 확정하지 않습니다.
2. [처리] Adaptive Protection이 위험 수준 결정
   - 주체: Adaptive Protection
   - 데이터: 위험 수준 정의·분석된 인사이트
   - 해설: 설정된 위험 정의를 만족하는지 평가합니다.
3. [처리] 사용자가 정책 대상 콘텐츠를 외부 공유
   - 주체: 사용자
   - 위치: DLP 지원 위치
   - 데이터: 사용자 위험 수준·공유 대상
   - 해설: 예제는 위험 수준과 외부 공유를 모두 조건으로 사용합니다.
4. [판단] 사용자의 전달된 위험 수준이 Elevated인가?
   - 주체: DLP 서비스
   - 데이터: DLP에 사용 가능한 위험 수준
   - 해설: 수준이 다르거나 신호가 전달되지 않았다면 같은 조건으로 취급하지 않습니다.
   - 예 → 5
   - 아니오 → 6
5. [끝] 예제 DLP 규칙의 차단과 증적 확인
   - 주체: 관리자
   - 위치: DLP 경고·Adaptive protection 사용자 정보
   - 데이터: 위험 조건과 외부 공유 정책 결과
   - 해설: 설정된 규칙이 두 조건을 만족할 때 차단합니다.
6. [끝] 이 Elevated 규칙 미일치 원인 확인
   - 주체: 관리자
   - 위치: Adaptive protection 및 DLP 정책 범위
   - 데이터: 현재 수준·정책 대상·전달 상태
   - 해설: 다른 위험 수준이나 전달 지연과 별도 정책을 확인합니다.
- 시나리오: 예 :: Elevated 사용자 외부 공유에 DLP 차단
- 시나리오: 아니오 :: 수준 또는 전달 상태가 달라 규칙 미일치

> 주의: 조건부 액세스 연동은 별도 구성과 미리 보기 상태를 확인합니다. 위험 수준은 경고 심각도와 동일하지 않습니다.
> 출처: https://learn.microsoft.com/en-us/purview/insider-risk-management-adaptive-protection
> 출처: https://learn.microsoft.com/en-us/purview/insider-risk-management-adaptive-protection-guide
> 출처: https://learn.microsoft.com/en-us/office365/servicedescriptions/microsoft-365-service-descriptions/microsoft-365-tenantlevel-services-licensing-guidance/microsoft-purview-service-description

### L3 · A · 동적 DLP 적용 — 대표 시나리오: 위험 수준에 따른 공유 정책 비교

#### L4 · ▶ Elevated와 다른 수준의 동일 공유 — 위험 조건이 정책 대상을 바꾼다

1. [시작] 동일한 외부 공유와 두 사용자 준비
   - 주체: 관리자
   - 데이터: Elevated 사용자와 Moderate 사용자
   - 해설: 이 예제는 위험 수준만 다르게 설정합니다.
2. [처리] Elevated 조건을 가진 DLP 정책 활성화
   - 주체: 관리자
   - 위치: Data loss prevention › Policies
   - 데이터: Elevated AND 외부 공유·차단 동작
   - 해설: 다른 위험 수준용 정책은 이 비교에서 제외합니다.
3. [처리] 각 사용자의 현재 위험 수준 확인
   - 주체: 관리자
   - 위치: Adaptive protection 사용자 정보
   - 데이터: 위험 수준과 범위 내 DLP 정책
   - 해설: 위험 신호가 전달되고 반영됐는지 점검합니다.
4. [판단] 전달된 수준이 Elevated인가?
   - 주체: DLP 서비스
   - 데이터: 사용자 위험 수준
   - 해설: 이 규칙의 위험 조건과 비교합니다.
   - Elevated → 5
   - Moderate → 6
5. [끝] 외부 공유에 예제 차단 규칙 적용
   - 주체: DLP 서비스
   - 데이터: Elevated 조건 일치·차단
   - 해설: 위험과 공유 조건이 함께 충족됐습니다.
6. [끝] 이 Elevated 규칙은 적용되지 않음
   - 주체: DLP 서비스
   - 데이터: Moderate 조건 불일치
   - 해설: 다른 DLP 정책의 적용 여부는 별도입니다.
- 시나리오: Elevated :: 높은 위험 사용자의 외부 공유 제한
- 시나리오: Moderate :: Moderate 사용자는 이 Elevated 규칙에 미일치

> 교육 포인트: 위험 수준과 정책 동작을 따로 구성하고 전파·대상 상태를 함께 확인합니다.
> 출처: https://learn.microsoft.com/en-us/purview/insider-risk-management-adaptive-protection-guide
> 출처: https://learn.microsoft.com/en-us/purview/insider-risk-management-adaptive-protection
