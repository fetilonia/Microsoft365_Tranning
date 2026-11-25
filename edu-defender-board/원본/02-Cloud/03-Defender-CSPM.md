## L2 · Defender CSPM — 공격 경로와 위험 우선순위

- 설정(Control Plane): 구독 또는 커넥터에서 유료 Defender CSPM 활성화 | 에이전트 없는 스캔 등 구성 요소 설정
- 강제(Enforcement): 자산 관계와 취약성 신호를 결합해 공격 경로 분석 | 자동 수정이 아닌 보안 상태 평가
- 증적(Evidence): 공격 경로 · 관련 자산 · 보안 권장 사항 · Cloud Security Explorer
- 메뉴(Admin Center): Azure portal > Defender for Cloud > Environment settings · Attack path analysis
- 라이선스(License): Defender CSPM 유료 플랜 | 에이전트 없는 스캔 활성화에 구독 Owner 권한 필요

### L3 · 0 · 기능 상태 전이 — 기본 자세 관리 → 플랜 구성 → 공격 경로 분석

#### L4 · ⓪ 비활성 — 유료 Defender CSPM이 꺼진 구독

1. [시작] 관리자가 클라우드 보안 상태를 확인한다
   - 주체: 관리자
   - 데이터: Azure 구독 · 리소스
   - 해설: 무료 Foundational CSPM과 유료 기능의 범위를 구별합니다.
2. [처리] 환경 설정에서 플랜 상태를 확인한다
   - 주체: 관리자
   - 위치: Defender for Cloud › Environment settings
   - 데이터: Defender CSPM 플랜 상태
   - 해설: 유료 플랜을 켜지 않은 예제입니다.
3. [처리] 기본 권장 사항을 확인한다
   - 주체: 관리자
   - 위치: Defender for Cloud › Recommendations
   - 데이터: 기본 보안 평가 · 권장 사항
   - 해설: Foundational CSPM의 권장 사항은 유료 공격 경로 분석과 다릅니다.
4. [끝] 공격 경로 분석을 위한 전제를 기록한다
   - 주체: 관리자
   - 데이터: 플랜 · 스캔 · 권한
   - 해설: 공격 경로가 보이지 않는 것을 위험이 없다는 증거로 해석하지 않습니다.

#### L4 · ① 구성 — Defender CSPM과 스캔을 활성화한다

1. [시작] 구독과 관리자 권한을 확인한다
   - 주체: 관리자
   - 위치: Azure portal › 구독
   - 데이터: 구독 Owner · Defender for Cloud 상태
   - 해설: 스캔을 포함한 전체 기능 활성화에는 구독 Owner 권한이 필요합니다.
2. [처리] 대상 구독의 환경 설정을 연다
   - 주체: 관리자
   - 위치: Defender for Cloud › Environment settings › 구독
   - 데이터: 구독 · 기존 플랜
   - 해설: 올바른 구독 또는 커넥터를 선택합니다.
3. [처리] Defender CSPM 플랜을 켠다
   - 주체: 관리자
   - 위치: Defender plans › Defender CSPM › On
   - 데이터: 플랜 상태 · 예상 비용
   - 해설: 유료 플랜의 과금 대상을 별도로 검토합니다.
4. [처리] 기기 에이전트 없는 스캔을 확인한다
   - 주체: 관리자
   - 위치: Defender CSPM › Settings › Agentless scanning for machines
   - 데이터: 스캔 구성 요소 상태
   - 해설: 권한이 부족한 계정으로 플랜을 켜면 스캐너가 기본 활성화되지 않을 수 있습니다.
5. [처리] 필요한 스캔 제외 태그를 검토한다
   - 주체: 관리자
   - 위치: Agentless scanning › Edit configuration
   - 데이터: 제외 태그 이름과 값
   - 해설: 제외된 기기의 가시성 공백을 함께 기록합니다.
6. [끝] 저장하고 공격 경로 분석 범위를 확인한다
   - 주체: 관리자
   - 위치: Defender for Cloud › Attack path analysis
   - 데이터: 플랜 및 스캔 상태
   - 해설: 데이터 수집과 평가를 거친 후 결과를 확인합니다.

#### L4 · ② 활성 — 취약성으로 이어지는 경로를 조사한다

1. [시작] Defender CSPM이 자산과 보안 상태를 수집한다
   - 주체: Defender for Cloud
   - 데이터: 리소스 · 구성 · 스캔 결과
   - 해설: 공격 경로는 여러 자산 관계와 위험 신호를 결합합니다.
2. [처리] 운영자가 공격 경로 분석을 연다
   - 주체: 보안 운영자
   - 위치: Defender for Cloud › Attack path analysis
   - 데이터: 경로 · 관련 리소스
   - 해설: 인터넷 노출과 취약한 자산의 연결을 예로 살펴봅니다.
3. [판단] 경로의 취약성 세부 정보를 볼 수 있는가?
   - 주체: 보안 운영자
   - 데이터: 스캔 상태 · 구독 접근 권한
   - 해설: 스캐너 미활성 또는 제한된 권한은 가시성에 영향을 줍니다.
   - 확인됨 → 4
   - 누락 → 6
4. [처리] 경로의 수정 권장 사항을 선택한다
   - 주체: 보안 운영자
   - 위치: 공격 경로 상세 › Remediation
   - 데이터: 노출 자산 · 권장 사항
   - 해설: 경로에 기여하는 리소스와 조치 대상을 구분합니다.
5. [끝] 수정 후 재평가된 경로를 확인한다
   - 주체: 보안 운영자
   - 데이터: 변경된 설정 · 평가 결과
   - 해설: 수정 직후 표시가 즉시 바뀐다고 가정하지 않습니다.
6. [끝] 스캔과 구독별 권한을 조사한다
   - 주체: 관리자
   - 데이터: 스캔 활성 상태 · 제외 태그 · RBAC
   - 해설: 세부 정보가 없는 이유를 수집 공백과 권한 부족으로 나누어 확인합니다.
- 시나리오: 확인됨 :: 공격 경로의 취약점과 수정 대상을 조사
- 시나리오: 누락 :: 스캔 미활성 또는 권한 부족을 점검

> 주의: 스캔 지원 자산·리전·과금 단위 및 실제 메뉴는 [확인 필요: 현재 포털 메뉴명과 기능별 경로를 대상 테넌트에서 확인하고 최신 Microsoft Learn 절차와 대조].
> 출처: https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-cspm-plan
> 출처: https://learn.microsoft.com/en-us/azure/defender-for-cloud/how-to-manage-attack-path

### L3 · A · 스캔 권한 — 플랜 상태와 데이터 수집

#### L4 · 스캐너 활성화 — Owner 권한과 가시성

1. [시작] 관리자가 Defender CSPM 플랜을 연다
   - 주체: 관리자
   - 위치: Defender for Cloud › Environment settings › 구독
   - 데이터: 플랜 상태 · 관리자 역할
   - 해설: 플랜이 켜졌는지와 스캐너가 켜졌는지는 별개입니다.
2. [처리] 기기 에이전트 없는 스캔 설정을 확인한다
   - 주체: 관리자
   - 데이터: Agentless scanning 상태
   - 해설: 공격 경로의 취약성 데이터는 스캔 구성에 좌우됩니다.
3. [판단] 스캐너가 활성화되어 있는가?
   - 주체: 관리자
   - 데이터: 구성 요소 상태 · Owner 권한
   - 해설: 낮은 권한으로 플랜을 활성화하면 스캐너가 기본적으로 켜지지 않을 수 있습니다.
   - 켜짐 → 4
   - 꺼짐 → 5
4. [끝] 수집된 취약성 및 제외 범위를 검토한다
   - 주체: 보안 운영자
   - 데이터: 스캔 결과 · 제외 태그
   - 해설: 스캔된 범위와 경로 데이터를 대조합니다.
5. [끝] 구독 Owner가 스캐너 설정을 검토한다
   - 주체: 관리자
   - 데이터: 스캐너 설정 · 권한
   - 해설: 권한을 확인한 다음 스캔을 활성화합니다.
- 시나리오: 켜짐 :: 스캔 결과와 제외 기기 확인
- 시나리오: 꺼짐 :: Owner 권한과 스캐너 설정 점검

> 출처: https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-cspm-plan
