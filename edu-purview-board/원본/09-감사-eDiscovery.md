## L2 · 감사 · eDiscovery — 활동 기록과 콘텐츠 조사

- 설정(Control Plane): 감사 로그 검색 권한·수집 설정 | eDiscovery 케이스·검색 범위
- 강제(Enforcement): 지원 활동의 감사 기록 수집 | eDiscovery는 권한 있는 케이스의 콘텐츠 검색·보존
- 증적(Evidence): Audit 검색 작업·활동 기록 | eDiscovery 검색 결과·케이스
- 메뉴(Admin Center): Audit > Search | eDiscovery > Cases
- 라이선스(License): Audit Standard·Premium 및 eDiscovery 기능별 구독과 보존 기간 [확인 필요: 사용자 SKU·기능 범위]

### L3 · 0 · 기능 상태 전이 — 조사 준비 전 → 권한·검색 구성 → 결과 검토

#### L4 · ⓪ 비활성 — 예제 조사에 필요한 권한 미확인

1. [시작] 관리자가 조사 요청 접수
   - 주체: 관리자
   - 데이터: 가상 사용자·기간·조사 목적
   - 해설: 활동 이력과 콘텐츠는 서로 다른 조사 대상입니다.
2. [처리] 조사자의 감사 및 eDiscovery 권한 미확인
   - 주체: 관리자
   - 데이터: 역할 할당 상태
   - 해설: 검색을 시작하기 전에 역할을 확인합니다.
3. [처리] 감사 수집 및 보존 범위 확인 필요
   - 주체: 관리자
   - 데이터: 수집 설정·라이선스·검색 기간
   - 해설: 로그 부재를 바로 활동 부재로 판단하지 않습니다.
4. [끝] 최소 권한과 조사 범위 선정
   - 주체: 관리자
   - 데이터: 검색하려는 활동과 콘텐츠 원본
   - 해설: 필요한 권한만 부여하여 조사를 준비합니다.

#### L4 · ① 구성 — 감사 및 eDiscovery 검색 준비

1. [시작] 조사자의 역할 확인
   - 주체: 관리자
   - 위치: Microsoft Purview 역할 그룹
   - 데이터: Audit Logs 또는 View-Only Audit Logs·eDiscovery Manager
   - 해설: 감사 검색과 eDiscovery 케이스 생성은 서로 다른 역할을 확인합니다.
2. [처리] 감사 수집 설정 확인
   - 주체: 관리자
   - 위치: Exchange Online PowerShell › Get-AdminAuditLogConfig
   - 데이터: UnifiedAuditLogIngestionEnabled
   - 해설: 해당 속성은 Exchange Online PowerShell에서 확인합니다.
3. [처리] 사용자 라이선스와 보존 범위 검토
   - 주체: 관리자
   - 위치: Audit 구독 및 보존 정책
   - 데이터: 사용자 라이선스·활동 유형·검색 기간
   - 해설: 보존 기간은 구독과 활동 유형 등에 따라 달라집니다.
4. [처리] 감사 검색의 날짜·사용자·활동 지정
   - 주체: 관리자
   - 위치: Microsoft Purview portal › Audit › Search
   - 데이터: UTC 기간·사용자·활동 필터
   - 해설: 질문에 맞게 검색 범위를 제한합니다.
5. [처리] 필요하면 별도의 eDiscovery 케이스 생성
   - 주체: 조사자
   - 위치: eDiscovery › Cases
   - 데이터: 케이스와 조사자 접근 범위
   - 해설: 콘텐츠 조사는 감사 이벤트 검색과 별도입니다.
6. [처리] 케이스의 데이터 원본과 검색 조건 지정
   - 주체: 조사자
   - 위치: eDiscovery 케이스 › Search
   - 데이터: 검색 대상·조건·권한
   - 해설: Copilot 데이터는 유형별 저장 위치와 검색 범위를 확인합니다.
7. [끝] 조사 작업을 실행할 준비 완료
   - 주체: 조사자
   - 위치: Audit 검색 및 eDiscovery 케이스
   - 데이터: 각 검색의 필터·권한·범위
   - 해설: 보존 조치는 검색과 별도로 적법한 절차에 따라 결정합니다.

#### L4 · ② 활성 — 감사 검색 결과 검토

1. [시작] 조사자가 Audit 검색 실행
   - 주체: 조사자
   - 위치: Audit › Search
   - 데이터: 사용자·활동·UTC 기간
   - 해설: 해당 조건에 맞는 감사 이벤트를 찾습니다.
2. [처리] 서비스가 비동기 검색 작업 수행
   - 주체: Audit
   - 데이터: 검색 작업 상태
   - 해설: 브라우저를 닫아도 검색 작업이 계속됩니다.
3. [판단] 검색 결과가 있는가?
   - 주체: 조사자
   - 위치: Audit 검색 작업 결과
   - 데이터: 필터와 반환된 감사 기록
   - 해설: 결과 부재는 여러 원인이 가능합니다.
   - 있음 → 4
   - 없음 → 6
4. [처리] 이벤트의 시각·사용자·활동 확인
   - 주체: 조사자
   - 위치: Audit 검색 결과 상세
   - 데이터: 감사 이벤트 필드
   - 해설: 이 결과는 콘텐츠 자체가 아니라 활동 기록입니다.
5. [끝] 필요 시 케이스의 콘텐츠 검색과 대조
   - 주체: 조사자
   - 위치: eDiscovery 케이스 검색
   - 데이터: 감사 이벤트와 별도 콘텐츠 검색 결과
   - 해설: 권한과 범위를 확인하고 서로 다른 증적을 연결합니다.
6. [끝] 검색 기간·권한·수집 및 반영 지연 점검
   - 주체: 조사자
   - 위치: Audit 검색 필터 및 설정
   - 데이터: UTC 범위·관리 단위·수집·보존·반영 상태
   - 해설: 결과가 없다는 것만으로 활동이 없었다고 단정하지 않습니다.
- 시나리오: 있음 :: 감사 이벤트를 검토하고 콘텐츠 조사와 대조
- 시나리오: 없음 :: 검색 범위·수집·권한과 지연 점검

> 주의: 감사 검색 결과의 가용 시간은 보장되지 않습니다. 권한과 관리 단위에 따라 조회 가능한 기록이 다릅니다.
> 출처: https://learn.microsoft.com/en-us/purview/audit-search
> 출처: https://learn.microsoft.com/en-us/purview/edisc-search-copilot-data
> 출처: https://learn.microsoft.com/en-us/office365/servicedescriptions/microsoft-365-service-descriptions/microsoft-365-tenantlevel-services-licensing-guidance/microsoft-purview-service-description

### L3 · A · 활동과 콘텐츠 — 대표 시나리오: Copilot 활동 조사

#### L4 · Audit 이벤트와 eDiscovery 콘텐츠 비교 — 목적에 맞는 검색 선택

1. [시작] 조사자가 Copilot 사용 사례 확인 요청
   - 주체: 조사자
   - 데이터: 가상 사용자와 조사 기간
   - 해설: 누가 사용했는지와 상호작용 내용이 무엇인지는 다른 질문입니다.
2. [처리] 각 검색의 권한·라이선스 확인
   - 주체: 관리자
   - 위치: Audit 및 eDiscovery 역할
   - 데이터: 감사 검색과 케이스 접근 권한
   - 해설: 필요한 역할과 콘텐츠 범위를 별도로 확인합니다.
3. [처리] 조사 목적 선택
   - 주체: 조사자
   - 데이터: 활동 이벤트 또는 저장된 상호작용 콘텐츠
   - 해설: 같은 검색 결과로 두 질문을 모두 대체하지 않습니다.
4. [판단] 활동 이벤트를 검색하는가?
   - 주체: 조사자
   - 데이터: 검색 목적
   - 해설: 아니오 경로는 적법한 케이스에서 콘텐츠를 찾는 예제입니다.
   - 활동 → 5
   - 콘텐츠 → 6
5. [끝] Audit에서 사용자·활동·시간 검색
   - 주체: 조사자
   - 위치: Audit › Search
   - 데이터: 감사 이벤트
   - 해설: 이벤트 검색은 콘텐츠 검색과 구분합니다.
6. [끝] eDiscovery 케이스에서 저장된 상호작용 검색
   - 주체: 조사자
   - 위치: eDiscovery › Cases › Search
   - 데이터: 지원 데이터 원본의 상호작용 콘텐츠
   - 해설: Copilot 유형별 위치·보존·검색 지원을 확인합니다.
- 시나리오: 활동 :: Audit에서 Copilot 활동 이벤트 검색
- 시나리오: 콘텐츠 :: 케이스에서 저장된 상호작용 검색

> 교육 포인트: 감사 이벤트와 eDiscovery의 콘텐츠는 다른 증적이며 권한과 보존 범위도 다릅니다.
> 출처: https://learn.microsoft.com/en-us/purview/audit-search
> 출처: https://learn.microsoft.com/en-us/purview/edisc-search-copilot-data
> 출처: https://learn.microsoft.com/en-us/copilot/plan/architecture-data-protection-auditing
