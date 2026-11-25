## L2 · DevOps 보안 — GitHub 연결과 코드 맥락

- 설정(Control Plane): Azure 구독에 GitHub 커넥터 생성 | 조직 권한 부여와 Defender for Cloud GitHub 앱 설치
- 강제(Enforcement): 연결된 리포지토리와 보안 결과를 수집 | 지원되는 코드-클라우드 맥락 연결
- 증적(Evidence): DevOps security · 인벤토리 · 리포지토리별 보안 권장 사항
- 메뉴(Admin Center): Azure portal > Defender for Cloud > Environment settings > Add environment > GitHub [확인 필요: 현재 포털 메뉴명과 기능별 경로를 대상 테넌트에서 확인하고 최신 Microsoft Learn 절차와 대조]
- 라이선스(License): 기본 및 고급 DevOps 보안 기능의 플랜, GitHub Advanced Security 조건·비용 [확인 필요: 실제 SKU별 사용 권한과 대상 사용자 조건을 Microsoft Learn 서비스 설명·고객 계약 및 할당된 라이선스에서 대조]

### L3 · 0 · 기능 상태 전이 — 연결 전 → GitHub 연결 → 리포지토리 조사

#### L4 · ⓪ 비활성 — GitHub 조직을 연결하기 전

1. [시작] 관리자가 리포지토리 보안 상태를 확인한다
   - 주체: 관리자
   - 데이터: GitHub 조직 · 리포지토리
   - 해설: 이 예제는 조직이 Defender for Cloud에 연결되지 않았습니다.
2. [처리] 환경 설정의 DevOps 커넥터를 확인한다
   - 주체: 관리자
   - 위치: Defender for Cloud › Environment settings
   - 데이터: GitHub 커넥터 목록
   - 해설: 조직과 Azure 구독 간의 연결을 확인합니다.
3. [처리] DevOps security의 리포지토리 목록을 확인한다
   - 주체: 보안 운영자
   - 위치: Defender for Cloud › DevOps security
   - 데이터: 표시된 조직 · 리포지토리
   - 해설: 연결되지 않은 조직의 데이터는 이 경로에서 수집되지 않습니다.
4. [끝] 연결할 조직과 리포지토리를 정한다
   - 주체: 관리자
   - 데이터: 조직 · 보호 대상
   - 해설: 결과가 없다는 이유만으로 취약성이 없다고 판단하지 않습니다.

#### L4 · ① 구성 — GitHub 조직을 연결한다

1. [시작] Azure와 GitHub 권한을 준비한다
   - 주체: 관리자
   - 위치: Azure portal › 구독 · GitHub 조직
   - 데이터: Azure Contributor · GitHub Organization Owner
   - 해설: 구독의 커넥터 생성과 조직 앱 설치에 필요한 권한을 확인합니다.
2. [처리] GitHub 환경 추가를 연다
   - 주체: 관리자
   - 위치: Defender for Cloud › Environment settings › Add environment › GitHub [확인 필요: 현재 포털 메뉴명과 기능별 경로를 대상 테넌트에서 확인하고 최신 Microsoft Learn 절차와 대조]
   - 데이터: 커넥터 이름 · 구독 · 리소스 그룹
   - 해설: Azure 구독에 GitHub 연결을 저장합니다.
3. [처리] GitHub 접근을 승인한다
   - 주체: 관리자
   - 위치: GitHub 커넥터 › Configure access › Authorize
   - 데이터: GitHub 로그인 · 조직 접근
   - 해설: 보호할 조직과 리포지토리에 대한 권한을 부여합니다.
4. [처리] Defender for Cloud GitHub 앱을 설치한다
   - 주체: 관리자
   - 위치: GitHub › Defender for Cloud 앱 설치
   - 데이터: 선택 조직 · 리포지토리 접근 범위
   - 해설: 권한 부여 뒤 앱 설치를 오래 지연하면 세션 시간 초과가 생길 수 있습니다.
5. [처리] 검색할 조직 범위를 선택한다
   - 주체: 관리자
   - 위치: 커넥터 › 조직 선택
   - 데이터: 기존 조직 · 향후 조직 검색 설정
   - 해설: 앱이 설치된 조직과 선택 범위를 함께 확인합니다.
6. [끝] 연결 및 인벤토리 상태를 확인한다
   - 주체: 관리자
   - 위치: Defender for Cloud › Inventory · DevOps security
   - 데이터: 커넥터 상태 · 조직 · 리포지토리
   - 해설: 리소스가 나타나기까지 지연될 수 있습니다.

#### L4 · ② 활성 — 연결된 리포지토리의 보안 결과를 확인한다

1. [시작] Defender for Cloud가 GitHub 조직에 접근한다
   - 주체: Defender for Cloud
   - 데이터: 커넥터 · GitHub 앱 권한
   - 해설: 앱 설치와 허용된 리포지토리 범위가 수집의 전제입니다.
2. [처리] 운영자가 DevOps security에서 리포지토리를 검색한다
   - 주체: 보안 운영자
   - 위치: Defender for Cloud › DevOps security
   - 데이터: 조직 이름 · 리포지토리
   - 해설: 올바른 조직의 리포지토리인지 확인합니다.
3. [판단] 대상 리포지토리가 인벤토리에 표시되는가?
   - 주체: 보안 운영자
   - 데이터: 앱 설치 · 접근 범위 · 수집 상태
   - 해설: 초기 표시 지연과 권한 또는 연결 오류를 구분합니다.
   - 표시 → 4
   - 미표시 → 6
4. [처리] 리포지토리의 보안 결과와 권장 사항을 검토한다
   - 주체: 보안 운영자
   - 데이터: 코드 보안 결과 · 권장 사항
   - 해설: 일부 보안 스캔 권장 사항은 워크플로 구성이 추가로 필요합니다.
5. [끝] 결과와 리포지토리의 소유자를 연결한다
   - 주체: 보안 운영자
   - 데이터: 결과 · 조직 · 리포지토리
   - 해설: 조사 결과를 개발 담당자에게 전달할 수 있습니다.
6. [끝] GitHub 앱 설치와 수집 지연을 점검한다
   - 주체: 관리자
   - 데이터: 설치 조직 · 리포지토리 권한 · 연결 상태
   - 해설: 문서는 온보딩 후 리소스 표시에 최대 8시간이 걸릴 수 있다고 안내합니다.
- 시나리오: 표시 :: 리포지토리의 보안 결과와 권장 사항 확인
- 시나리오: 미표시 :: 앱 권한과 초기 수집 지연 점검

> 주의: GitHub 플랜·스캔 종류·코드-클라우드 매핑과 PR 주석의 지원 조건은 [확인 필요: 기능·플랫폼·정책 모드별 동작을 최신 Microsoft Learn 및 격리된 테스트 테넌트에서 재현해 확인].
> 출처: https://learn.microsoft.com/en-us/azure/defender-for-cloud/quickstart-onboard-github

### L3 · A · 코드와 런타임 — 맥락 연결의 조건

#### L4 · 코드-런타임 조사 — 리포지토리와 워크로드

1. [시작] 운영자가 배포된 워크로드의 위험을 검토한다
   - 주체: 보안 운영자
   - 데이터: 컨테이너 워크로드 · 리포지토리
   - 해설: 실행 환경의 위험과 원본 코드의 관계를 조사합니다.
2. [처리] GitHub 연결 및 고급 보안 설정을 확인한다
   - 주체: 관리자
   - 위치: Defender for Cloud › DevOps security
   - 데이터: GitHub 커넥터 · Advanced security 상태
   - 해설: 기능별 플랜과 스캔 전제를 확인합니다.
3. [판단] 지원되는 코드-런타임 연결이 표시되는가?
   - 주체: 보안 운영자
   - 데이터: 워크로드 · 이미지 · 리포지토리 연결
   - 해설: 매핑이 없으면 해당 기능의 지원과 수집 범위를 점검합니다.
   - 연결됨 → 4
   - 미연결 → 5
4. [끝] 실행 위험과 관련 코드 결과를 대조한다
   - 주체: 보안 운영자
   - 데이터: 워크로드 · 코드 보안 결과
   - 해설: 운영 환경 맥락을 사용해 수정 우선순위를 검토합니다.
5. [끝] 커넥터 및 스캔 설정을 조사한다
   - 주체: 관리자
   - 데이터: 지원 플랜 · 앱 접근 · 스캔 상태
   - 해설: 매핑 부재를 코드에 취약성이 없다는 증거로 해석하지 않습니다.
- 시나리오: 연결됨 :: 실행 자산과 코드 보안 결과 대조
- 시나리오: 미연결 :: 매핑 전제와 수집 범위 점검

> 출처: https://learn.microsoft.com/en-us/azure/defender-for-cloud/quickstart-onboard-github
> 출처: https://learn.microsoft.com/en-us/azure/defender-for-cloud/github-advanced-security-deploy
