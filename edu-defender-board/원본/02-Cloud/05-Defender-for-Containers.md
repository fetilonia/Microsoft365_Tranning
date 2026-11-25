## L2 · Defender for Containers — 이미지와 런타임

- 설정(Control Plane): Containers 플랜 활성화 | Registry access · Kubernetes API 또는 Defender 센서 구성
- 강제(Enforcement): 지원 레지스트리의 이미지 취약성 평가와 구성된 런타임 위협 탐지
- 증적(Evidence): 이미지 취약성 권장 사항 · 클러스터 보안 경고
- 메뉴(Admin Center): Azure portal > Defender for Cloud > Environment settings > Defender plans > Containers
- 라이선스(License): Defender for Containers 유료 플랜 또는 지원되는 CSPM 시나리오; 구성 요소·과금 범위 [확인 필요]

### L3 · 0 · 기능 상태 전이 — 미구성 → 플랜 구성 → 이미지 조사

#### L4 · ⓪ 비활성 — 레지스트리 평가가 구성되지 않은 경우

1. [시작] 관리자가 컨테이너 이미지의 취약성을 확인한다
   - 주체: 관리자
   - 데이터: 레지스트리 · 이미지
   - 해설: 저장된 이미지와 실행 중인 워크로드는 서로 다른 조사 대상입니다.
2. [처리] Containers 플랜과 Registry access를 확인한다
   - 주체: 관리자
   - 위치: Defender for Cloud › Environment settings
   - 데이터: 플랜 · 레지스트리 접근 상태
   - 해설: 레지스트리 평가는 구성된 접근에 의존합니다.
3. [처리] 이미지 취약성 권장 사항을 조회한다
   - 주체: 보안 운영자
   - 데이터: 이미지 평가 결과
   - 해설: 결과가 없을 때는 지원과 수집 상태를 점검합니다.
4. [끝] 미평가 이미지를 조사 범위에 기록한다
   - 주체: 보안 운영자
   - 데이터: 이미지 ID · 레지스트리 접근 상태
   - 해설: 평가 결과 부재는 취약점이 없다는 증거가 아닙니다.

#### L4 · ① 구성 — 컨테이너 플랜과 구성 요소를 설정한다

1. [시작] 대상 구독과 클러스터를 확인한다
   - 주체: 관리자
   - 위치: Azure portal › 구독 · Kubernetes 리소스
   - 데이터: 구독 · 레지스트리 · 클러스터
   - 해설: 이미지와 런타임 보호에 필요한 범위를 정합니다.
2. [처리] Defender for Cloud 환경 설정을 연다
   - 주체: 관리자
   - 위치: Defender for Cloud › Environment settings › 구독
   - 데이터: Defender plans
   - 해설: 클러스터가 속한 구독 또는 커넥터를 선택합니다.
3. [처리] Containers 플랜을 켠다
   - 주체: 관리자
   - 위치: Defender plans › Containers › On
   - 데이터: 플랜 상태 · 예상 비용
   - 해설: 플랜의 지원 범위와 과금을 확인합니다.
4. [처리] Registry access를 설정한다
   - 주체: 관리자
   - 위치: Containers › Settings › Registry access
   - 데이터: 레지스트리 접근 상태
   - 해설: 저장된 이미지의 에이전트 없는 취약성 평가에 필요합니다.
5. [처리] Kubernetes API 또는 센서를 검토한다
   - 주체: 관리자
   - 위치: Containers › Settings › Kubernetes API access · Defender sensor
   - 데이터: 구성 요소 상태 · 클러스터
   - 해설: 런타임 관련 데이터와 탐지는 필요한 구성 요소가 다릅니다.
6. [끝] 구성을 저장하고 상태를 확인한다
   - 주체: 관리자
   - 위치: Environment settings › Containers › Settings
   - 데이터: 플랜 · 구성 요소 적용 상태
   - 해설: 플랜 활성화와 개별 구성 요소의 적용을 따로 검증합니다.

#### L4 · ② 활성 — 레지스트리 이미지 취약성을 평가한다

1. [시작] 지원 레지스트리에 이미지가 저장된다
   - 주체: 개발자
   - 데이터: 이미지 · 태그 · 레지스트리
   - 해설: 이 예제는 저장된 컨테이너 이미지의 평가입니다.
2. [처리] Defender가 구성된 레지스트리에서 이미지를 평가한다
   - 주체: Defender for Cloud
   - 데이터: Registry access · 이미지
   - 해설: 평가 결과는 취약성 권장 사항으로 제공됩니다.
3. [판단] 이미지 평가 결과를 사용할 수 있는가?
   - 주체: 보안 운영자
   - 데이터: 지원 레지스트리 · 접근 상태 · 평가 결과
   - 해설: 접근 누락과 평가 대기는 취약점 부재와 다릅니다.
   - 평가됨 → 4
   - 미평가 → 6
4. [처리] 이미지의 취약성 결과를 검토한다
   - 주체: 보안 운영자
   - 위치: Defender for Cloud › Recommendations
   - 데이터: 이미지 · 취약성 · 권장 사항
   - 해설: 이미지 취약성과 런타임 보안 경고를 구분합니다.
5. [끝] 취약 이미지와 수정 대상을 기록한다
   - 주체: 보안 운영자
   - 데이터: 이미지 식별자 · 수정 권고
   - 해설: 재빌드와 재평가 여부를 추적합니다.
6. [끝] 레지스트리 접근과 지원 범위를 점검한다
   - 주체: 관리자
   - 데이터: Registry access · 리소스 지원 · 연결 상태
   - 해설: 미평가 이미지가 안전하다고 가정하지 않습니다.
- 시나리오: 평가됨 :: 이미지 취약성과 수정 대상을 확인
- 시나리오: 미평가 :: 레지스트리 접근 및 지원 범위 조사

> 주의: 클러스터 종류별 센서·API 요구 조건, 지원 리전과 비용은 [확인 필요].
> 출처: https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-containers-enable-plan
> 출처: https://learn.microsoft.com/en-us/azure/defender-for-cloud/agentless-vulnerability-assessment-azure

### L3 · A · 이미지와 런타임 — 서로 다른 보안 결과

#### L4 · 컨테이너 데이터 경로 — 레지스트리와 실행 환경

1. [시작] 운영자가 컨테이너 보호 결과를 조사한다
   - 주체: 보안 운영자
   - 데이터: 이미지 · Kubernetes 워크로드
   - 해설: 저장 이미지의 취약성과 실행 중 위협을 나누어 봅니다.
2. [처리] Registry access의 이미지 평가를 확인한다
   - 주체: 보안 운영자
   - 데이터: 레지스트리 이미지 · 취약성 권장 사항
   - 해설: 이미지 평가는 레지스트리 접근에 의존합니다.
3. [판단] 런타임 데이터 구성 요소도 준비되었는가?
   - 주체: 관리자
   - 데이터: Kubernetes API access · Defender sensor
   - 해설: 런타임 평가 경로는 별도 구성 요소가 필요합니다.
   - 준비됨 → 4
   - 미준비 → 5
4. [끝] 실행 워크로드의 관련 결과를 조사한다
   - 주체: 보안 운영자
   - 데이터: 워크로드 · 런타임 관련 결과
   - 해설: 지원되는 구성에서 런타임 맥락을 함께 확인합니다.
5. [끝] 런타임 가시성 공백을 기록한다
   - 주체: 보안 운영자
   - 데이터: 구성 요소 누락
   - 해설: 이미지 평가 결과만으로 런타임 탐지 상태를 단정하지 않습니다.
- 시나리오: 준비됨 :: 이미지와 워크로드 결과를 함께 조사
- 시나리오: 미준비 :: 런타임 구성 요소 누락 점검

> 출처: https://learn.microsoft.com/en-us/azure/defender-for-cloud/agentless-vulnerability-assessment-azure
