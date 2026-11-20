### L3 · A · Connect Sync 파이프라인 — 가져오기(Staging) · 동기화(Inbound/Outbound) · 메타버스 · 내보내기

#### L4 · 방향 개념 — Inbound와 Outbound는 메타버스를 기준으로 정한다

1. [시작] 개체의 속성 값이 동기화 엔진 안에서 움직이기 시작
   - 주체: Entra Connect
   - 위치: Microsoft Entra Connect Sync(동기화 엔진) — 커넥터 공간(Connector space)과 메타버스(Metaverse)
   - 데이터: 이름 공간 2개 — 커넥터 공간(CS)은 커넥터마다 하나씩 있는 스테이징 영역, 메타버스(MV)는 여러 커넥터의 값을 합친 통합 뷰
   - 해설: 동기화 엔진은 연결된 디렉터리(AD, Entra ID)와 값을 직접 주고받지 않고 항상 커넥터 공간(스테이징)과 메타버스를 거칩니다. 이 두 이름 공간 사이를 어느 방향으로 지나는지가 Inbound와 Outbound를 가릅니다
2. [판단] 값이 어느 방향으로 흐르는가?
   - 주체: Entra Connect
   - 위치: Synchronization Rules Editor › 왼쪽 Rule Types — Inbound / Outbound
   - 데이터: 방향의 기준은 메타버스입니다. 커넥터 공간에서 메타버스로 들어오면 Inbound, 메타버스에서 커넥터 공간으로 나가면 Outbound
   - 해설: 공식 문서는 Inbound와 Outbound가 메타버스의 관점이라고 설명합니다. AD냐 Entra ID냐가 아니라 메타버스로 들어오느냐 나가느냐로 정합니다
   - Inbound → 3
   - Outbound → 4
3. [처리] Inbound 동기화 — 커넥터 공간의 값을 메타버스로 올린다
   - 주체: Entra Connect
   - 위치: Synchronization Rules Editor › Inbound — 규칙 이름 예) In from AD – User Join · In from AD – User AccountEnabled · In from AD – User Common
   - 데이터: 하는 일 3가지 — Provision(Projection, 새 메타버스 개체 생성), Join(기존 메타버스 개체에 연결), Import attribute flow(속성 값을 메타버스로 흘림)
   - 해설: AD에서 가져와 AD 커넥터 공간에 쌓인 개체를 메타버스에 반영하는 단계입니다. 메타버스에 개체를 만들 수 있는 과정은 Provision뿐입니다
   - 다음 → 5
4. [처리] Outbound 동기화 — 메타버스의 값을 대상 커넥터 공간으로 내린다
   - 주체: Entra Connect
   - 위치: Synchronization Rules Editor › Outbound — 규칙 이름 예) Out to Microsoft Entra ID – User Join · Group Join
   - 데이터: 하는 일 3가지 — Provisioning(대상 커넥터 공간에 export 개체 생성·이름 변경·연결 해제), Deprovisioning(연결이 끊긴 개체에 삭제 표시), Export attribute flow(속성 값을 대상 개체로 흘림)
   - 해설: 메타버스 개체가 바뀌면(삭제는 제외) 대상 커넥터 공간의 개체를 고쳐야 하는지 판단하고, 바뀐 개체를 내보내기 대기(pending export) 상태로 표시합니다. 이 단계까지는 Entra ID에 아무것도 쓰이지 않습니다
5. [처리] 한 개체·한 속성은 한 시점에 한 방향으로만 흐른다
   - 주체: Entra Connect
   - 위치: 공식 문서 — Understanding the architecture › Connected Data Sources and Connectors
   - 데이터: 커넥터는 값이 연결된 디렉터리에서 동기화 엔진으로 흐르게 하거나 동기화 엔진에서 연결된 디렉터리로 흐르게 구성할 수 있지만, 한 개체와 한 속성에 대해서는 그중 하나만 한 시점에 일어남 · 방향은 개체마다, 속성마다 다를 수 있음
   - 해설: 한 속성을 양방향으로 주고받는 구성이 아닙니다. 속성마다 값을 정하는 쪽(소스)이 하나이고 그 방향이 곧 그 속성의 규칙 방향입니다. 문서가 말하는 ‘양방향(bi-directional)’은 커넥터 공간과 메타버스 사이에 Inbound와 Outbound 두 종류의 규칙이 모두 있다는 뜻입니다
6. [처리] 기본은 AD → Entra ID 한 방향이고 Entra ID → AD는 정해진 쓰기 저장 속성만이다
   - 주체: Entra Connect
   - 위치: 공식 문서 — Attributes synchronized to Microsoft Entra ID (Exchange hybrid writeback · Device writeback) · More details about features in preview
   - 데이터: 사용자 로그인 속성(userPrincipalName 등)은 AD가 소스라 Inbound로 올라가 Entra ID로 나감 · Entra ID에서 AD로 나가는 것은 Exchange 하이브리드를 켰을 때의 msExchSafeSendersHash · msExchBlockedSendersHash · msExchUserHoldPolicies 같은 지정 속성과 디바이스 쓰기 저장 · 사용자 쓰기 저장(user writeback)은 2015년 8월 업데이트에서 제거됨
   - 해설: Entra ID에서 만든 사용자를 AD로 만들어 내리는 용도는 Connect Sync의 범위가 아닙니다. 기능을 켤 때 해당 속성에 대한 Out to AD 규칙이 생기고, 그 속성만 반대 방향(메타버스 → AD 커넥터 공간)으로 흐릅니다
7. [처리] Connect Sync에서 Entra ID로 가는 길은 Outbound 규칙과 Export뿐이다
   - 주체: Entra Connect
   - 위치: Synchronization Rules Editor › Outbound — Out to Microsoft Entra ID – User Join · Group Join · Contact Join
   - 데이터: Inbound는 메타버스까지만 채움 · Entra 커넥터 공간으로 내려가는 것은 Outbound 규칙이 평가한 결과(pending export)이고, 실제로 Entra ID에 쓰는 것은 Export 단계 · 규칙에 조인이 있어야 해당 방향으로 속성이 흐르고 같은 개체에서 일부 속성은 Inbound, 일부는 Outbound로 흘리려면 각 방향에 조인이 있는 규칙이 필요(조인 규칙이 든 규칙은 범위 안에 하나만)
   - 해설: Outbound 동기화는 선택 기능이 아니라 AD의 개체가 Entra ID에 반영되는 필수 구간입니다. 규칙 이름에서 끝이 Join인 규칙이 조인을 담당하고 Common 같은 규칙이 속성 흐름을 담당합니다
8. [끝] 소스 커넥터 공간 → Inbound → 메타버스 → Outbound → 대상 커넥터 공간
   - 주체: Entra Connect
   - 해설: 한 개체의 전체 경로입니다. AD에서 Entra ID라면 AD 커넥터 공간, Inbound, 메타버스, Outbound, Entra 커넥터 공간, Entra ID 순이고 다음 시나리오들이 이 길의 칸마다 자세히 봅니다
- 시나리오: Inbound :: 커넥터 공간에서 메타버스로 올라오는 Inbound 규칙
- 시나리오: Outbound :: 메타버스에서 커넥터 공간으로 내려가는 Outbound 규칙

#### L4 · 전체 흐름 — AD 개체가 Staging · 메타버스 · Staging을 지나 Entra ID까지

1. [시작] 스케줄러가 동기화 사이클을 시작
   - 주체: 온프레미스
   - 위치: Connect 서버 PowerShell — Get-ADSyncScheduler (cmdlet을 못 찾으면 Import-Module ADSync)
   - 데이터: 기본 30분 · CustomizedSyncCycleInterval(Set-ADSyncScheduler로 d.HH:mm:ss 형식 지정)은 AllowedSyncCycleInterval보다 짧게 설정해도 후자가 적용 · NextSyncCyclePolicyType = Delta 또는 Initial · 7일 안에 델타 필요
   - 해설: 스케줄러가 가져오기, 동기화, 내보내기를 순서대로 실행합니다. 주기와 설정은 Entra ID에 저장되므로 스테이징 서버에도 영향을 주고, 델타가 7일 넘게 없으면 전체 동기화가 필요합니다
2. [처리] ① Import — AD 커넥터가 AD를 읽어 AD 커넥터 공간에 쌓는다
   - 주체: 온프레미스
   - 위치: Synchronization Service Manager › Connectors › Active Directory Domain Services 커넥터 › Run — Full Import 또는 Delta Import
   - 데이터: AD 커넥터 공간의 스테이징 개체(staging object) — 앵커 objectGUID · 처음 가져온 개체는 메타버스와 연결되지 않은 disjoined 상태
   - 해설: 커넥터는 AD API로 개체를 읽어 커넥터 공간에 사본을 만듭니다. 사용자는 이 사본을 개별로 만들거나 지울 수 없습니다
3. [처리] ② Staging — 바뀐 개체만 pending import로 표시해 대기
   - 주체: Entra Connect
   - 위치: Synchronization Service Manager › Connectors › Search Connector Space (Scope = Pending Import)
   - 데이터: pending import 종류 — None · Add · Update · Delete · Delete/Add · 속성 포함 목록(attribute inclusion list)에 있는 속성만 보관
   - 해설: 가져온 값을 스테이징 개체와 비교해 달라진 것만 표시하므로 동기화에서 처리할 양이 줄고, AD에 다시 접속하지 않고도 규칙을 바꿔 재처리하거나 미리 볼 수 있습니다
4. [처리] ③ Inbound 동기화 — 인바운드 규칙 파이프라인이 개체를 평가
   - 주체: Entra Connect
   - 위치: Synchronization Rules Editor › Inbound (In from AD – …)
   - 데이터: 파이프라인 모듈 — Source → Scope(어떤 규칙이 적용되는가) → Join(메타버스의 어느 개체와 맞는가) → Transform(속성을 어떻게 바꾸는가) → Precedence(값이 충돌하면 누가 이기는가) → Target
   - 해설: Scope 안의 규칙만 적용됩니다. 규칙은 Description · Scoping filter · Join rules · Transformations 4개 영역으로 구성됩니다
5. [판단] 메타버스에 연결할 개체가 이미 있는가?
   - 주체: Entra Connect
   - 위치: 동기화 규칙 › Join rules (예 In from AD – User Join)
   - 데이터: 조인 규칙 그룹을 위에서부터 평가하다가 메타버스에서 정확히 한 개체와 일치하면 조인 · 일치가 0개이거나 둘 이상이면 다음 그룹 · 모두 실패하면 Link Type이 Provision일 때 새 개체 생성
   - 해설: 가장 명확한 조건(예 employeeID)을 먼저, 느슨한 조건(이름)을 나중에 두어야 합니다
   - 조인 → 6
   - 프로젝션 → 7
6. [처리] Join — 기존 메타버스 개체에 연결
   - 주체: Entra Connect
   - 데이터: 연결된 스테이징 개체 = joined object · 한 커넥터 공간의 개체 하나는 메타버스 개체 하나에만 연결 · 같은 커넥터 공간의 여러 개체를 한 메타버스 개체에 조인하면 모호함(ambiguous)으로 보고
   - 해설: 다른 커넥터(예 다른 포리스트)가 만든 메타버스 개체에 이 개체를 붙입니다. 조인은 규칙이 처음 범위에 들어올 때 한 번만 평가되고 규칙이 범위를 벗어나야 끊어집니다
   - 다음 → 8
7. [처리] Provision(Projection) — 새 메타버스 개체를 만들고 연결
   - 주체: Entra Connect
   - 데이터: 메타버스에 개체를 만드는 유일한 과정 · 조인 조건의 속성에 값이 하나라도 있어야 생성 · 메타버스 개체 유형은 사용자·iNetOrgPerson·연락처 모두 person
   - 해설: 아무 개체와도 맞지 않는 disjoined 스테이징 개체에 대해 메타버스 개체를 만들고 둘을 연결해 joined object로 바꿉니다
8. [처리] ④ Metaverse — Import attribute flow로 속성을 통합
   - 주체: Entra Connect
   - 위치: 동기화 규칙 › Transformations (Direct · Constant · Expression)
   - 데이터: 같은 속성에 여러 규칙이 값을 주면 Precedence 숫자가 낮은 규칙이 우선 · 멀티값은 Update(기본) · Merge · MergeCaseInsensitive · 값 없음은 NULL · AuthoritativeNull · IgnoreThisFlow
   - 해설: 연결된 스테이징 개체의 값이 메타버스의 통합 속성이 됩니다. 기본 제공 규칙은 직접 고치지 않고 새 규칙을 Precedence 1~99로 만듭니다
9. [처리] ⑤ Outbound 동기화 — 메타버스 변경을 Entra 커넥터 공간으로 평가
   - 주체: Entra Connect
   - 위치: Synchronization Rules Editor › Outbound (Out to Microsoft Entra ID – …)
   - 데이터: 같은 파이프라인(Scope → Join → Transform → Precedence)이 메타버스에서 Entra 커넥터 공간 방향으로 동작
   - 해설: 메타버스 개체가 바뀌면 Entra 커넥터 공간의 어떤 개체를 만들거나 고쳐야 하는지 판단합니다
10. [판단] Entra 커넥터 공간에 연결된 개체가 이미 있는가?
   - 주체: Entra Connect
   - 위치: Synchronization Rules Editor › Outbound 규칙 Join rules / Link Type
   - 데이터: 연결 있음 = 속성만 갱신 · 연결 없음 = Provisioning으로 export 개체 생성 (아웃바운드 조인은 DN으로 먼저 역조인을 시도)
   - 해설: Entra ID에서 처음 보는 개체인지 이미 올라간 개체인지를 가르는 분기입니다
   - 있음 → 11
   - 없음 → 12
11. [처리] Export attribute flow — 연결된 개체의 속성을 갱신
   - 주체: Entra Connect
   - 데이터: 메타버스 값 → Entra 속성 · 연결된 개체만 가능 · 바뀐 개체는 pending export(Update)
   - 해설: 이미 연결된 export 개체의 속성을 새 값으로 고칩니다
   - 다음 → 13
12. [처리] Provisioning — Entra 커넥터 공간에 export 개체를 만든다
   - 주체: Entra Connect
   - 데이터: export 개체는 아직 Entra ID에 없으므로 앵커가 없음 · 메타버스 개체와 연결된 상태로 생성 · pending export(Add)
   - 해설: Entra ID가 개체를 만들어 앵커를 정하기 전의 임시 형태입니다
13. [처리] ⑥ Staging — Entra 커넥터 공간에 pending export로 대기
   - 주체: Entra Connect
   - 위치: Synchronization Service Manager › Connectors › Microsoft Entra ID 커넥터 › Search Connector Space (Scope = Pending Export)
   - 데이터: export 개체 목록 · 스테이징 모드 서버는 여기서 멈추고 내보내지 않음
   - 해설: 내보내기 전에 무엇이 나갈지 미리 확인할 수 있는 마지막 지점입니다
14. [처리] ⑦ Export — Entra 커넥터가 Microsoft Entra ID에 쓴다
   - 주체: Entra ID
   - 위치: Synchronization Service Manager › Connectors › Microsoft Entra ID 커넥터 › Run — Export
   - 데이터: Entra ID user · group 생성·갱신 · UPN·ProxyAddress 중복은 격리(L3 C 참조) · 한 번에 삭제가 임계값(기본 500)을 넘으면 중단
   - 해설: 내보내기가 성공해도 Entra ID가 값을 바꾸거나 버렸을 수 있으므로 동기화 엔진은 성공 알림만 믿지 않습니다
15. [처리] 확인 가져오기 — 다음 Import에서 내보낸 값을 다시 읽어 확인
   - 주체: Entra Connect
   - 데이터: export 개체는 다음 Import에서 import 개체가 됨 · 내보낸 값과 가져온 값이 같으면 export 기억이 지워지고 다르면 다음 Export에서 다시 시도
   - 해설: 이렇게 반영 사실을 가져오기로 확인해야 사이클이 닫힙니다
16. [처리] 규칙 변경은 전체 동기화로 재계산
   - 주체: 관리자
   - 위치: 동기화 서비스 관리자 › 커넥터 › 실행 › 전체 동기화 · Set-ADSyncScheduler -SyncCycleEnabled $false로 스케줄러를 끄고 작업한 뒤 $true로 되돌림 · Start-ADSyncSyncCycle -PolicyType Initial
   - 데이터: 델타는 변경분만 · 전체 동기화는 현재 규칙으로 모든 개체 재계산 · 동기화 규칙을 고치면 전체 동기화, 가져올 개체·속성을 늘리면 전체 가져오기, 필터를 바꾸면 전체 가져오기(이미 가져온 속성 기반 필터 제외)
   - 해설: 규칙을 고쳤다면 전체 동기화를 해야 기존 개체에도 새 규칙이 적용됩니다. 전체 주기는 오래 걸릴 수 있으므로 필요한 커넥터·단계만 골라 실행합니다
17. [끝] 작업 기록 확인 — 오류와 내보낸 개체 수
   - 주체: 로그
   - 위치: 동기화 서비스 관리자 › 작업 (기본 7일 보관)
   - 데이터: 가져오기·동기화·내보내기 실행 결과와 오류 목록 · 보관 기간은 Set-ADSyncScheduler -PurgeRunHistoryInterval로 변경
   - 해설: 실행 결과와 개체별 오류는 서비스 관리자에서 봅니다
- 시나리오: 조인 ▸ 있음 :: 기존 개체에 조인되고 Entra 개체를 갱신
- 시나리오: 조인 ▸ 없음 :: 조인 후 Entra에 새 export 개체를 생성
- 시나리오: 프로젝션 ▸ 있음 :: 새 메타버스 개체를 만든 뒤 연결된 Entra 개체 갱신
- 시나리오: 프로젝션 ▸ 없음 :: 새 메타버스 개체를 만들어 Entra로 처음 내보냄

#### L4 · Import · Staging — AD 변경이 AD 커넥터 공간에 쌓이는 과정

1. [시작] AD에서 개체가 생성·수정·이름 변경·삭제됨
   - 주체: 온프레미스
   - 위치: 온프레미스 Active Directory (사용자 · 그룹 · 연락처)
   - 데이터: 동기화 범위 안의 개체 유형과 속성 포함 목록에 있는 속성만 대상
   - 해설: 커넥터는 구성된 개체 유형과 속성만 읽습니다. 마법사 설치 때 이 설정이 자동으로 만들어집니다
2. [처리] Import 실행 — Full Import 또는 Delta Import
   - 주체: Entra Connect
   - 위치: Synchronization Service Manager › Connectors › AD 커넥터 › Run — Full Import / Delta Import
   - 데이터: 델타는 마지막 통신 이후의 변경분만 요청 · 전체는 범위 안 모든 개체를 읽음
   - 해설: 스테이징이 있어서 변경분만 요청하고 처리할 수 있습니다. 스케줄러는 사이클마다 Delta Import를 쓰고 Full은 전체 사이클이나 override로 지정할 때 씁니다
3. [판단] 커넥터 공간에 같은 앵커의 스테이징 개체가 있는가?
   - 주체: Entra Connect
   - 데이터: AD 커넥터의 앵커는 objectGUID · 앵커가 같은 스테이징 개체를 먼저 찾고, 없으면 DN이 같은 개체를 찾음
   - 해설: 앵커는 개체 수명 동안 바뀌지 않는다고 가정합니다. 앵커로 못 찾으면 이름(DN) 충돌 여부를 따로 봅니다
   - 있음 → 4
   - 없음 → 9
4. [판단] 가져온 값을 스테이징 개체와 비교하면 무엇이 달라졌는가?
   - 주체: Entra Connect
   - 데이터: 비교 결과 = 변화 없음 · 속성/이름 수정 · 삭제 · 개체 유형 변경
   - 해설: 비교 결과가 pending import의 종류를 정합니다
   - 변화 없음 → 5
   - 수정 → 6
   - 삭제 → 7
   - 유형 변경 → 8
5. [끝] None — pending import로 표시하지 않고 처리 대상에서 제외
   - 주체: Entra Connect
   - 데이터: pending import = None
   - 해설: 달라진 것이 없으므로 인바운드 동기화가 이 개체를 다시 처리하지 않습니다. 변경분만 처리하는 이점이 여기서 나옵니다
6. [처리] Update — 속성 변경과 이름 변경을 pending import(Update)로 표시
   - 주체: Entra Connect
   - 데이터: pending import = Update · 이름 변경 포함
   - 해설: 바뀐 속성 값이 메타버스에서 처리되도록 표시합니다
   - 다음 → 14
7. [처리] Delete — 삭제를 pending import(Delete)로 표시
   - 주체: Entra Connect
   - 데이터: pending import = Delete
   - 해설: 연결된 개체(joined object)가 삭제되도록 표시합니다. 삭제 전파는 별도 시나리오에서 다룹니다
   - 다음 → 14
8. [처리] Delete/Add — 개체 유형이 바뀌어 완전히 다시 동기화
   - 주체: Entra Connect
   - 데이터: pending import = Delete/Add · 유형이 달라 적용되는 규칙 집합이 달라짐
   - 해설: 같은 개체라도 유형이 바뀌면 다른 규칙이 적용되므로 삭제 후 추가로 다시 처리합니다
   - 다음 → 14
9. [판단] 같은 DN의 스테이징 개체가 있는가?
   - 주체: Entra Connect
   - 데이터: 앵커는 달라도 DN이 같은 개체가 있으면 충돌
   - 해설: AD에서 이름이 바뀌었거나 삭제 후 같은 이름으로 다시 만들어진 경우에 생깁니다
   - 있음 → 10
   - 없음 → 13
10. [판단] 그 개체에 앵커가 있는가?
   - 주체: Entra Connect
   - 데이터: 앵커 없음 = 동기화 엔진이 새로 프로비전해 아직 연결된 디렉터리에 만들어지지 않은 개체 · 앵커 있음 = 이미 연결된 디렉터리에서 가져온 개체
   - 해설: 앵커 유무에 따라 처리가 갈립니다
   - 있음 → 11
   - 없음 → 12
11. [처리] Transient — 기존 개체에 임시 DN을 주고 들어온 개체를 스테이징
   - 주체: Entra Connect
   - 데이터: 기존 개체는 AD에서 이름이 바뀌었거나 삭제된 것으로 가정하고 임시 새 DN을 부여 · 기존 개체는 transient가 되어 커넥터가 이름 변경이나 삭제를 가져오기를 기다림
   - 해설: 건강한 환경에서도 보일 수 있습니다. Sync V2 엔드포인트 API에서는 다음 델타 사이클에서 대개 자동으로 해소됩니다. 스테이징 모드 서버에서 관리자가 Entra ID의 개체를 PowerShell로 영구 삭제한 뒤 다시 동기화할 때 자주 생깁니다
   - 다음 → 13
12. [처리] 앵커 없는 개체를 제거하고 연결된 메타버스 개체를 재시도 대상으로 표시
   - 주체: Entra Connect
   - 데이터: 메타버스 개체에 retry provisioning on next synchronization run 표시
   - 해설: 새 import 개체를 만들기 전에 앵커 없는 옛 개체를 정리합니다
13. [처리] Add — 새 import 개체를 만들고 pending import(Add)로 표시
   - 주체: Entra Connect
   - 데이터: pending import = Add · import 개체는 disjoined 상태로 생성 · 앵커 objectGUID가 채워짐
   - 해설: 아직 메타버스와 연결되지 않은 새 스테이징 개체입니다. 인바운드 동기화가 Provision이나 Join으로 연결합니다
14. [끝] Staging 완료 — pending import 개체만 Inbound 동기화로 넘긴다
   - 주체: Entra Connect
   - 데이터: 플레이스홀더(placeholder) — OU처럼 가져오지 않았지만 계층 이름에 필요한 구성 요소나 아직 가져오지 않은 참조 개체(예 manager)를 평면 이름 공간에 보존 · 메타버스에는 연결되지 않음
   - 해설: AD는 계층 구조이고 동기화 엔진은 평면 구조라 플레이스홀더로 계층을 보존합니다. 참조된 개체를 나중에 가져오면 플레이스홀더가 스테이징 개체로 바뀝니다
- 시나리오: 있음 ▸ 변화 없음 :: 달라진 것이 없어 처리 대상에서 제외
- 시나리오: 있음 ▸ 수정 :: 속성·이름 수정이 Update로 표시
- 시나리오: 있음 ▸ 삭제 :: 삭제가 Delete로 표시
- 시나리오: 있음 ▸ 유형 변경 :: 유형이 바뀌어 Delete/Add로 재처리
- 시나리오: 없음 ▸ 있음 ▸ 있음 :: 같은 DN 개체를 transient로 두고 새 개체 추가
- 시나리오: 없음 ▸ 있음 ▸ 없음 :: 앵커 없는 옛 개체를 정리하고 새 개체 추가
- 시나리오: 없음 ▸ 없음 :: 새 개체를 Add로 스테이징

#### L4 · Inbound 동기화 — 커넥터 공간에서 메타버스로 (Scope · Join · Provision · 속성 흐름)

1. [시작] pending import 개체가 쌓인 AD 커넥터 공간
   - 주체: Entra Connect
   - 위치: Synchronization Service Manager › Connectors › AD 커넥터 › Run — Delta Synchronization / Full Synchronization
   - 데이터: 델타 동기화는 pending import 개체만 · 전체 동기화는 현재 규칙으로 모든 스테이징 개체를 재계산
   - 해설: Import가 끝난 뒤 동기화 단계가 이 개체들을 메타버스로 올립니다
2. [처리] Scope — 개체에 적용되는 인바운드 규칙을 찾는다
   - 주체: Entra Connect
   - 위치: Synchronization Rules Editor › Inbound › 규칙 › Scoping filter
   - 데이터: 범위 = 그룹과 절(clause) — 한 그룹 안은 AND, 그룹 사이는 OR · 연산 예 EQUAL · NOTEQUAL · STARTSWITH · ISNULL · ISBITSET · ISMEMBEROF · 예) userAccountControl의 비트 2가 꺼져 있으면 활성 사용자(512), 켜져 있으면 비활성(514)
   - 해설: 같은 개체 유형이라도 속성 값에 따라 다른 규칙이 적용됩니다. 예를 들어 In from AD – User AccountEnabled는 활성 계정에만 적용됩니다
3. [판단] 범위 안에 드는 인바운드 규칙이 있는가?
   - 주체: Entra Connect
   - 데이터: sourceAnchor가 없거나 기본 제외 조건(isCriticalSystemObject, sAMAccountName 없음, AAD_·MSOL_ 서비스 계정 등)에 걸린 사용자 개체는 동기화되지 않음
   - 해설: 범위 안의 규칙이 하나도 없으면 이 개체는 메타버스로 올라가지 않고 스테이징에만 남습니다
   - 있음 → 4
   - 없음 → 11
4. [판단] 이 스테이징 개체가 이미 메타버스 개체에 연결되어 있는가?
   - 주체: Entra Connect
   - 데이터: 연결된 개체(joined object) 또는 연결 없는 개체(disjoined object)
   - 해설: 이미 연결되어 있으면 조인을 다시 평가하지 않고 속성 흐름으로 갑니다. 조인은 규칙이 범위에 처음 들어올 때만 평가됩니다
   - 연결됨 → 8
   - 연결 안 됨 → 5
5. [판단] 조인 규칙이 메타버스에서 정확히 한 개체와 일치하는가?
   - 주체: Entra Connect
   - 위치: 동기화 규칙 › Join rules (예 In from AD – User Join)
   - 데이터: 그룹을 위에서 아래로 평가 · 정확히 한 개와 일치하면 이후 규칙은 평가하지 않음 · 0개 또는 둘 이상이면 다음 그룹 · 조인 규칙이 있는 규칙은 범위 안에 하나만 허용
   - 해설: 설치 마법사의 사용자 일치 옵션(예 objectSID와 msExchMasterAccountSid, mail)에 따라 규칙 내용이 달라집니다
   - 일치 → 6
   - 불일치 → 7
6. [처리] Join — 기존 메타버스 개체에 연결
   - 주체: Entra Connect
   - 데이터: 스테이징 개체가 joined object가 됨 · 메타버스 개체 하나에 여러 커넥터 공간의 개체가 연결될 수 있음
   - 해설: 다른 포리스트의 같은 사용자를 하나의 메타버스 개체로 합칠 때 쓰입니다 (계정-리소스 포리스트)
   - 다음 → 8
7. [판단] Link Type이 Provision인가?
   - 주체: Entra Connect
   - 위치: 동기화 규칙 › Description › Link Type (Join · StickyJoin · Provision)
   - 데이터: Provision이고 조인 조건의 속성에 값이 하나라도 있으면 새 메타버스 개체를 만듦 · Join이나 StickyJoin이면 새 개체를 만들지 않음
   - 해설: StickyJoin은 커넥터가 메타버스 개체를 새로 만들 수 없지만 한 번 조인한 뒤에는 소스에서 삭제돼야 메타버스 개체가 지워지는 설정입니다
   - Provision → 9
   - Join 또는 StickyJoin → 10
8. [처리] Import attribute flow — 스테이징 개체의 속성을 메타버스로 흘린다
   - 주체: Entra Connect
   - 위치: 동기화 규칙 › Transformations (Flow type: Direct · Constant · Expression · Apply once)
   - 데이터: 여러 규칙이 같은 속성에 값을 주면 Precedence가 낮은 숫자인 규칙이 이김 · NULL(양보) · AuthoritativeNull(낮은 규칙도 못 줌) · IgnoreThisFlow(기존 값 유지) · 멀티값 Merge 유형은 한 개체의 모든 규칙이 같아야 함
   - 해설: 조인 또는 Provision으로 연결된 뒤에만 속성 단계가 일어납니다. 활성 계정의 값이 비활성 계정보다 먼저 적용되도록 기본 규칙이 Precedence를 정해 둡니다
   - 다음 → 12
9. [처리] Provision(Projection) — 새 메타버스 개체를 만들고 연결
   - 주체: Entra Connect
   - 데이터: 메타버스에 개체를 만드는 유일한 과정 · 개체 유형은 person · 만든 뒤 속성 흐름으로 이어짐
   - 해설: disjoined 스테이징 개체에만 적용됩니다
   - 다음 → 8
10. [끝] disjoined 유지 — 메타버스로 올리지 않고 스테이징에 보관
   - 주체: Entra Connect
   - 데이터: disjoined 개체의 속성은 메타버스에서 더 처리되지 않고 AD 쪽 값도 바뀌지 않음 · 이후 규칙이 바뀌면 joined 개체로 바뀔 수 있음
   - 해설: 정보를 엔진에 두고 나중에 처리할 수 있어 AD에 연결이 없어도 항상 전체 스냅샷을 가집니다
11. [끝] 규칙 없음 — 메타버스로 올리지 않는다
   - 주체: Entra Connect
   - 데이터: 범위 밖 개체는 인바운드 처리 대상이 아님 · 필터나 기본 제외 조건 때문에 생기는 일반적인 경우
   - 해설: 필터를 바꾼 뒤에는 전체 동기화를 해야 새 범위가 적용됩니다
12. [끝] 메타버스 개체 갱신 — Outbound 동기화 대상으로 표시
   - 주체: Entra Connect
   - 데이터: 속성 값이 바뀐 메타버스 개체는 아웃바운드 규칙 평가 대상
   - 해설: 메타버스 개체가 바뀌면 곧바로 Outbound 동기화가 평가해 대상 커넥터 공간을 갱신합니다
- 시나리오: 있음 ▸ 연결됨 :: 이미 연결된 개체의 속성만 메타버스에 흘림
- 시나리오: 있음 ▸ 연결 안 됨 ▸ 일치 :: 조인 규칙이 맞아 기존 메타버스 개체에 연결
- 시나리오: 있음 ▸ 연결 안 됨 ▸ 불일치 ▸ Provision :: 일치 개체가 없어 새 메타버스 개체 생성
- 시나리오: 있음 ▸ 연결 안 됨 ▸ 불일치 ▸ Join 또는 StickyJoin :: 새 개체를 만들 수 없어 disjoined로 보관
- 시나리오: 없음 :: 범위 안 규칙이 없어 메타버스로 안 올라감

#### L4 · Outbound 동기화 — 메타버스에서 Entra 커넥터 공간으로 (Provisioning · Export attribute flow)

1. [시작] 메타버스 개체가 바뀜 — Inbound 동기화의 결과
   - 주체: Entra Connect
   - 위치: 동기화 엔진 — 메타버스(Metaverse)
   - 데이터: 속성 값이 바뀌거나 새로 생긴 메타버스 개체
   - 해설: 아웃바운드는 메타버스가 바뀔 때 항상 평가됩니다. 삭제는 별도로 다룹니다
2. [처리] Scope — 개체에 적용되는 아웃바운드 규칙을 찾는다
   - 주체: Entra Connect
   - 위치: Synchronization Rules Editor › Outbound › 규칙 › Scoping filter (예 Out to Microsoft Entra ID – User Join · Group Join · Contact Join)
   - 데이터: 범위는 그룹 AND/OR 구조 · 예) Group Join은 보안 그룹(securityEnabled = True)과 배포 그룹(False) 그룹으로 나뉨 · 배포 그룹은 메일 사용이 켜져야 동기화
   - 해설: 범위에 든 규칙만 Entra 커넥터 공간으로의 처리에 쓰입니다
3. [판단] 범위 안에 드는 아웃바운드 규칙이 있는가?
   - 주체: Entra Connect
   - 데이터: 규칙의 Link Type(Provision 등)과 범위 조건
   - 해설: 이 판단이 아니오이면 이 메타버스 개체를 Entra ID로 보낼 규칙이 없다는 뜻입니다
   - 있음 → 4
   - 없음 → 10
4. [판단] 메타버스 개체에 연결된 Entra 커넥터 공간 개체가 이미 있는가?
   - 주체: Entra Connect
   - 데이터: 연결 있음 = 이미 내보낸 개체 · 연결 없음 = Entra ID에 처음 보내는 개체
   - 해설: 처음 보내는 개체인지, 이미 있는 개체를 고치는지를 가릅니다
   - 연결 있음 → 5
   - 연결 없음 → 6
5. [판단] 아웃바운드 규칙이 아직 이 개체의 범위 안인가?
   - 주체: Entra Connect
   - 위치: 동기화 규칙 › Scoping filter / Link Type
   - 데이터: 범위 안이면 속성 흐름으로 · 범위 밖으로 나가면 Provisioning이 연결을 끊고 Deprovisioning이 시작됨
   - 해설: 범위를 벗어나는 경우는 필터 변경이나 속성 값 변화 등이 있습니다
   - 범위 안 → 7
   - 범위 밖 → 9
6. [처리] Provisioning — export 개체를 만들고 메타버스 개체와 연결
   - 주체: Entra Connect
   - 위치: 동기화 규칙 › Description › Link Type = Provision (예 Out to Microsoft Entra ID – User Join)
   - 데이터: 새 export 개체는 앵커가 없음 · 아웃바운드 조인은 DN으로 먼저 역조인을 시도해 같은 DN의 개체가 있으면 조인 · 메타버스 개체가 지워지면 Provision 규칙으로 만든 개체도 삭제 표시
   - 해설: 이 개체는 Entra ID에 아직 없으므로 Entra ID가 만든 값이 이후 Import에서 앵커로 채워집니다
   - 다음 → 7
7. [처리] Export attribute flow — 메타버스 값을 Entra 속성으로 변환해 흘린다
   - 주체: Entra Connect
   - 위치: 동기화 규칙 › Transformations
   - 데이터: Direct · Constant · Expression · 우선순위가 높은 규칙이 이김 · 연결된 export 개체에만 가능
   - 해설: 예) 한 번 내보낸 sourceAnchor는 메타버스의 cloudSourceAnchor에 저장되어 바꿀 수 없습니다. 바꾸면 Out to Microsoft Entra ID – User Join 규칙이 sourceAnchor attribute has changed 오류를 냅니다
   - 다음 → 8
8. [처리] pending export로 표시 — 바뀐 export 개체를 Entra 커넥터 공간에 대기
   - 주체: Entra Connect
   - 위치: Synchronization Service Manager › Connectors › Microsoft Entra ID 커넥터 › Search Connector Space (Pending Export)
   - 데이터: pending export = Add · Update · Delete
   - 해설: 이 개체들이 다음 Export 단계에서 Entra ID로 나갑니다
   - 다음 → 11
9. [처리] Deprovisioning — 연결을 끊고 삭제를 표시
   - 주체: Entra Connect
   - 데이터: Provisioning이 연결을 끊을 때만 시작 · 실제 삭제가 아니라 개체에 deleted 표시(삭제 작업을 스테이징)
   - 해설: Entra ID에서 지워지는 것은 Export 단계에서 일어납니다
   - 다음 → 11
10. [끝] 내보낼 변경 없음
   - 주체: Entra Connect
   - 데이터: 아웃바운드 규칙이 범위에 없어 Entra 커넥터 공간 변경 없음
   - 해설: 메타버스에는 반영되었지만 Entra ID로는 내려가지 않습니다
11. [끝] Entra 커넥터 공간 확정 — Export 대기
   - 주체: Entra Connect
   - 데이터: pending export가 Export 단계를 기다림
   - 해설: 스테이징 모드 서버는 여기서 멈춥니다
- 시나리오: 있음 ▸ 연결 있음 ▸ 범위 안 :: 연결된 Entra 개체의 속성을 갱신
- 시나리오: 있음 ▸ 연결 있음 ▸ 범위 밖 :: 범위를 벗어나 연결을 끊고 삭제 표시
- 시나리오: 있음 ▸ 연결 없음 :: Entra에 없는 개체를 export 개체로 새로 만듦
- 시나리오: 없음 :: 규칙이 없어 Entra로 내보낼 변경 없음

#### L4 · Export · 확인 가져오기 — Entra ID에 쓰고 반영을 다시 확인한다

1. [시작] Entra 커넥터 공간에 pending export 개체가 있음
   - 주체: Entra Connect
   - 위치: Synchronization Service Manager › Connectors › Microsoft Entra ID 커넥터
   - 데이터: Add · Update · Delete 대기 개체
   - 해설: Outbound 동기화가 끝난 상태입니다
2. [판단] 이 서버가 스테이징 모드인가?
   - 주체: Entra Connect
   - 위치: Get-ADSyncScheduler 결과의 StagingModeEnabled
   - 데이터: 스테이징 모드 서버는 가져오기와 동기화는 하지만 내보내지 않고 암호 해시 동기화·쓰기 저장도 하지 않음
   - 해설: 이름은 비슷해도 커넥터 공간(스테이징 영역)과 다른 개념입니다. 서버 자체를 예비 서버로 두는 설정입니다
   - 예 → 3
   - 아니오 → 4
3. [끝] 내보내기 안 함 — pending export만 쌓아 두고 검증
   - 주체: 관리자
   - 위치: CSExportAnalyzer %temp%\export.xml > %temp%\export.csv
   - 데이터: 내보낼 변경을 Excel에서 검토 · 기대와 다르면 데이터나 구성을 고치고 Import · Synchronize · Verify를 반복
   - 해설: 활성 서버로 전환하기 전에 이 검증을 하고, 현재 활성 서버는 먼저 스테이징 모드로 돌려야 합니다
4. [처리] Export — pending export 개체를 Entra ID로 보낸다
   - 주체: Entra Connect
   - 위치: Synchronization Service Manager › Connectors › Microsoft Entra ID 커넥터 › Run — Export
   - 데이터: Export 단계는 델타·전체 구분 없이 하나이며 pending export 개체만 전송 · 성공 여부는 알 수 있지만 완료 여부는 알 수 없음
   - 해설: 동기화 엔진은 대상과 상시 연결을 갖지 않으므로 성공 알림만으로 개체 상태를 단정하지 않습니다
5. [판단] Entra ID가 변경을 수락했는가?
   - 주체: Entra ID
   - 데이터: 수락 = 성공 · 거부 = 오류(예 UPN·ProxyAddress 중복 격리)
   - 해설: 오류가 난 개체는 pending export로 남아 다음 Export에서 다시 시도됩니다
   - 수락 → 6
   - 거부 → 9
6. [처리] 내보낸 값을 export 상태 기억에 저장
   - 주체: Entra Connect
   - 데이터: 예) 속성 C = 5를 내보내면 C = 5를 기억 · 이후 Export마다 같은 값을 다시 내보내려 시도
   - 해설: 아직 대상에 영구 반영됐다고 확신하지 않기 때문입니다
7. [처리] 확인 가져오기 — 다음 Import에서 Entra ID의 값을 다시 읽는다
   - 주체: Entra Connect
   - 위치: Synchronization Service Manager › Entra ID 커넥터 › Run — Import
   - 데이터: 내보낸 export 개체는 다음 Import에서 import 개체로 바뀜 · 가져온 값과 내보낸 값을 비교
   - 해설: 이 비교가 내보내기가 성공했는지 다시 내보내야 하는지를 정합니다
8. [판단] 가져온 값이 내보낸 값과 같은가?
   - 주체: Entra Connect
   - 데이터: 같으면 export 기억을 지움 · 다르면 기억을 유지하고 다시 내보냄
   - 해설: Entra ID나 다른 프로세스가 값을 바꿔 놓았을 수 있습니다
   - 같음 → 10
   - 다름 → 11
9. [끝] 내보내기 오류 — 개체별 오류 확인
   - 주체: 로그
   - 위치: 동기화 서비스 관리자 › 작업 · Microsoft Entra Connect Health의 동기화 오류 보고서 [확인 필요: 메뉴 이름]
   - 데이터: 오류가 난 개체 목록과 원인 · 중복 속성 격리는 L3 C에서 다룸
   - 해설: 오류 개체만 보류되고 나머지는 정상 반영됩니다
10. [끝] 확정 — 반영이 확인되어 export 기억을 지운다
   - 주체: Entra Connect
   - 데이터: Entra ID 값 = 내보낸 값
   - 해설: 이 개체의 이번 변경은 Entra ID에 반영된 것으로 닫힙니다
11. [끝] 불일치 — 다음 Export에서 다시 시도
   - 주체: Entra Connect
   - 데이터: 내보낸 값이 Entra ID에서 유지되지 않음
   - 해설: Entra ID나 다른 프로세스가 값을 되돌렸다면 같은 값을 반복해서 내보내게 되므로 원인을 확인합니다
- 시나리오: 예 :: 스테이징 모드라 내보내지 않고 검증만 함
- 시나리오: 아니오 ▸ 수락 ▸ 같음 :: Entra가 수락하고 재확인으로 반영 확정
- 시나리오: 아니오 ▸ 수락 ▸ 다름 :: 수락했지만 값이 달라 다시 내보냄
- 시나리오: 아니오 ▸ 거부 :: Entra가 거부해 개체별 오류로 남음

#### L4 · 삭제 전파 — AD 삭제가 Deprovisioning을 거쳐 Entra ID까지 가는 길

1. [시작] AD에서 개체가 삭제되거나 동기화 범위 밖으로 나감
   - 주체: 온프레미스
   - 위치: Active Directory · OU 구조 · 도메인/OU 필터링 설정
   - 데이터: 삭제가 많아지는 흔한 경우 — 필터링에서 OU나 도메인을 선택 해제 · OU 안의 개체를 모두 이동하거나 삭제 · OU 이름 변경으로 하위 개체가 범위를 벗어남
   - 해설: AD에서 직접 지운 경우뿐 아니라 범위에서 벗어난 개체도 Entra ID에서는 삭제로 이어질 수 있습니다
2. [처리] Import — 삭제는 pending import(Delete)로 표시
   - 주체: Entra Connect
   - 위치: Synchronization Service Manager › AD 커넥터 › Run — Import
   - 데이터: pending import = Delete · 필터나 규칙 변경으로 범위에서 빠진 개체는 전체 동기화 이후 반영
   - 해설: 도메인·OU 필터와 규칙 변경은 전체 동기화를 해야 효과가 납니다
3. [처리] Inbound — 연결을 끊고 메타버스 개체를 정리
   - 주체: Entra Connect
   - 데이터: 연결된 스테이징 개체가 삭제되면 메타버스와의 연결 제거 · 연결이 하나도 없는 메타버스 개체는 엔진이 자동 삭제 · 메타버스 개체는 Provision 또는 StickyJoin 규칙이 범위에 있는 동안 유지
   - 해설: 메타버스 개체가 삭제되면 Provision으로 표시된 아웃바운드 규칙의 연결 개체들이 모두 삭제 표시됩니다
4. [처리] Outbound — Deprovisioning으로 Entra 커넥터 공간 개체에 삭제를 표시
   - 주체: Entra Connect
   - 데이터: 개체를 물리적으로 지우지 않고 deleted로 표시 · pending export = Delete
   - 해설: 실제 삭제는 Export 단계에서 일어납니다
5. [판단] 이번 Export의 삭제가 임계값 이내인가?
   - 주체: Entra Connect
   - 위치: Get-ADSyncExportDeletionThreshold -AADUserName "<UPN>"
   - 데이터: 설치 시 기본으로 켜져 있고 한 번의 Export에서 삭제 500개 초과 시 중단 · Enable-ADSyncExportDeletionThreshold로 값 변경
   - 해설: 구성 실수나 온프레미스 대량 변경으로 한꺼번에 지워지는 사고를 막는 안전장치입니다
   - 이내 → 6
   - 초과 → 7
6. [끝] Export로 삭제 반영 — Entra ID에서 삭제 처리
   - 주체: Entra ID
   - 위치: Entra 관리 센터 › 사용자 › 삭제된 사용자 (사용자 · 그룹 기능 참조)
   - 데이터: 삭제된 사용자의 복원 기간은 L2 사용자 · 그룹 기능 시나리오 참조
   - 해설: 삭제 후 복구 가능 여부와 기간은 개체 유형별 수명 주기에 따릅니다
7. [처리] Export 중단 — 어떤 개체도 삭제하지 않고 알림
   - 주체: 로그
   - 위치: Synchronization Service Manager › Export 단계의 run profile 상태 stopped-deletion-threshold-exceeded · Application 이벤트 로그 Warning ID 116 · Connect Health › Sync services › Alerts
   - 데이터: 메일 제목 "Export to Microsoft Entra ID was Stopped. Accidental delete threshold was reached." · 삭제 대상 확인은 Search Connector Space에서 Pending Export + Delete
   - 해설: 임계값을 넘으면 삭제를 하나도 내보내지 않고 Export를 멈춥니다
8. [판단] 대량 삭제가 의도한 것인가?
   - 주체: 관리자
   - 데이터: 예상하지 못한 삭제는 보통 OU 구조나 도메인·OU 필터 변경이 원인 · 의도하지 않았다면 Verify 절차로 삭제 대상을 확인
   - 해설: Global Administrator 또는 Hybrid Identity Administrator 자격 증명이 필요한 작업이 이어집니다
   - 의도함 → 9
   - 의도 아님 → 10
9. [끝] 임계값을 풀고 Export — 이후 보호를 다시 켠다
   - 주체: 관리자
   - 위치: Disable-ADSyncExportDeletionThreshold -AADUserName "<UPN>" → Connectors › Microsoft Entra ID 커넥터 › Run › Export → Enable-ADSyncExportDeletionThreshold -DeletionThreshold 500 -AADUserName "<UPN>"
   - 데이터: Entra ID에서 영구 삭제로 이어질 수 있음 · 보호를 영구히 끄지 말고 필요한 만큼 값을 올림
   - 해설: 대량 삭제가 잦다면 보호를 끄기보다 임계값을 조직 크기에 맞게 올립니다
10. [끝] 범위나 규칙을 바로잡아 삭제를 되돌린다
   - 주체: 관리자
   - 위치: 설치 마법사에서 OU 다시 선택 · Synchronization Rules Editor에서 규칙 수정 · Start-ADSyncSyncCycle -PolicyType Initial
   - 데이터: 도메인/OU 필터와 규칙 변경은 전체 동기화 사이클을 실행해야 적용됨
   - 해설: OU 이름을 바꿨다면 마법사에서 OU를 다시 선택해야 대량 삭제를 피할 수 있습니다
- 시나리오: 이내 :: 삭제가 임계값 이내라 Entra에서 삭제 처리
- 시나리오: 초과 ▸ 의도함 :: 임계값 초과 후 의도한 삭제라 풀고 Export
- 시나리오: 초과 ▸ 의도 아님 :: 임계값 초과를 막고 범위를 바로잡아 되돌림

#### L4 · 사이클 실행 방식 — Delta · Full 사이클과 스테이징 모드

1. [시작] 동기화 사이클이 시작됨
   - 주체: 온프레미스
   - 위치: 스케줄러 자동 실행 (기본 30분) 또는 Start-ADSyncSyncCycle -PolicyType Delta / Initial
   - 데이터: 사이클 = 가져오기 · 동기화 · 내보내기 전체 · 설치 마법사를 열어 두면 스케줄러가 일시 중지됨
   - 해설: 구성 변경 중에는 사이클이 실행되지 않으므로 마법사를 열어 둔 채 두면 동기화가 멈춥니다
2. [판단] 어떤 사이클인가?
   - 주체: Entra Connect
   - 위치: Get-ADSyncScheduler › NextSyncCyclePolicyType
   - 데이터: Delta 또는 Initial(전체)
   - 해설: 기본은 Delta이고 Initial은 전체 가져오기와 동기화를 하며 새로 바뀐 규칙도 다시 계산합니다
   - Delta → 3
   - Initial → 4
3. [처리] Delta 사이클 — 모든 커넥터에서 델타 가져오기 · 델타 동기화 · 내보내기
   - 주체: Entra Connect
   - 데이터: 변경분만 처리 · 델타는 직전 델타 이후 7일 이내에 실행되어야 함
   - 해설: 가장 가볍고 일반적인 사이클입니다
   - 다음 → 5
4. [처리] Full 사이클 — 전체 가져오기 · 전체 동기화 · 내보내기
   - 주체: Entra Connect
   - 데이터: 현재 규칙으로 모든 스테이징 개체를 재계산 · 매우 오래 걸릴 수 있음 · 필요한 커넥터에만 Set-ADSyncSchedulerConnectorOverride -FullImportRequired / -FullSyncRequired를 지정해 델타 사이클에 전체 단계를 섞을 수 있음
   - 해설: 규칙을 바꾼 뒤 기존 개체에도 반영하려면 전체 동기화가 필요합니다
5. [처리] 커넥터 실행 순서
   - 주체: Entra Connect
   - 위치: 내장 스케줄러 순서(사용자 지정 스케줄은 Invoke-ADSyncRunProfile 사용)
   - 데이터: 1) 온프레미스 디렉터리 가져오기 2) Entra ID 가져오기 3) 온프레미스 동기화 4) Entra ID 동기화 5) Entra ID로 Export 6) 온프레미스로 Export
   - 해설: 가져오기를 모두 끝낸 뒤 동기화하고 마지막에 내보내므로 한 사이클에서 AD 변경이 Entra ID까지 반영됩니다
6. [판단] 이 서버가 스테이징 모드인가?
   - 주체: Entra Connect
   - 위치: Get-ADSyncScheduler › StagingModeEnabled
   - 데이터: 스테이징 모드 = 가져오기와 동기화는 하고 Export는 하지 않음 · 암호 해시 동기화와 쓰기 저장도 꺼짐
   - 해설: 예비 서버나 구성 변경을 미리 검증하는 서버로 씁니다. 전환하기 전에 초기 사이클을 돌려 pending export를 검증합니다
   - 아니오 → 7
   - 예 → 8
7. [처리] Export 실행 — Entra ID에 반영
   - 주체: Entra Connect
   - 데이터: pending export가 Entra ID로 전송됨
   - 해설: 이 서버가 활성 서버로서 Entra ID를 갱신합니다
   - 다음 → 9
8. [처리] Export 생략 — pending export만 남김
   - 주체: Entra Connect
   - 데이터: 가져오기와 동기화는 계속되어 최신 상태를 유지 · 스테이징 모드 서버도 7일 안에 델타가 필요
   - 해설: 활성 서버가 장애일 때 스테이징 서버를 활성으로 바꿔 빠르게 이어받을 수 있습니다
9. [끝] 작업 기록 확인 — 단계별 결과
   - 주체: 로그
   - 위치: 동기화 서비스 관리자 › 작업 · Get-ADSyncConnectorRunStatus
   - 데이터: 각 커넥터 실행 프로필의 상태와 오류 · 스케줄러 설정은 Entra ID에 저장되어 스테이징 서버에도 적용(스테이징 모드 설정 제외)
   - 해설: 사이클이 도는 중에는 구성을 바꿀 수 없습니다. Stop-ADSyncSyncCycle로 멈출 수 있고 대기 중 변경은 다음 실행에 처리됩니다
- 시나리오: Delta ▸ 아니오 :: 델타 사이클로 활성 서버가 Entra에 반영
- 시나리오: Delta ▸ 예 :: 델타 사이클이지만 스테이징 모드라 내보내지 않음
- 시나리오: Initial ▸ 아니오 :: 전체 사이클로 모든 개체를 재계산해 반영
- 시나리오: Initial ▸ 예 :: 전체 사이클을 돌리되 스테이징 모드라 검증만

> 교육 포인트: 동기화는 한 줄의 흐름입니다. AD는 가져오기(Import)로 AD 커넥터 공간에 쌓이고(Staging), Inbound 동기화에서 규칙(Scope, Join, Transform, Precedence)을 거쳐 메타버스에 모이며(Provision/Join), Outbound 동기화로 Entra 커넥터 공간에 내려가(Provisioning) 내보내기(Export)로 Entra ID에 반영됩니다. 방향 이름은 메타버스 기준입니다.
>
> 주의: 커넥터 공간 안의 스테이징과 스테이징 모드 서버는 이름만 비슷한 다른 개념입니다. 기본 제공 규칙은 직접 고치지 않고 새 규칙(Precedence 1~99)을 만듭니다. 규칙·필터를 바꾼 뒤에는 전체 동기화가 필요합니다. 한 번 내보낸 sourceAnchor는 바꿀 수 없습니다.
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/concept-azure-ad-connect-sync-architecture
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/concept-azure-ad-connect-sync-declarative-provisioning
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/concept-azure-ad-connect-sync-default-configuration
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-sync-feature-scheduler
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-sync-staging-server
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-sync-feature-prevent-accidental-deletes
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-sync-change-the-configuration
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-sync-technical-concepts
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/reference-connect-sync-attributes-synchronized
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/connect/how-to-connect-preview
