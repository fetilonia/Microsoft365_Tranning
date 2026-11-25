# Defender 교육 보드 PLAN

> 아래 현황과 갭은 2026-11-24 설계 당시의 기준선입니다. 이후 원고가 작성되었으며 현재 지표는 [로드맵](ROADMAP.md)을 참고하세요.

상태: 계획 · 2026-11-24. 범위와 완료 기준은 [SPEC](DEFENDER_SPEC.md)를 따른다. 이 문서의 시나리오는 조사할 **설계 제안**이며 제품 동작 확정이 아니다. 분기 조건·결과는 각 행 전체에 `[확인 필요]`가 적용된다.

## 현재 상태와 갭

- [Defender 원고](edu-defender-board/원본/)는 XDR L1 1개·L2 10개와 Cloud L1 1개·L2 9개다. 각 L2에는 설정·강제·증적 초안과 `### L3: [작성 필요]`가 있으며 메뉴·라이선스·출처, L3/L4와 Task는 없다. 두 `00`은 제품 머리다. E0 내용도 미검증이므로 이 표의 요약이나 원고 문구를 사실로 승격하지 않는다.
- Entra의 [실제 원고 예](entra-edu-board/원본/05-ID-거버넌스/03-액세스-검토.md)는 메뉴·라이선스, ⓪/①/②, 기능별 L3, 상세 Task와 출처를 포함한다. [규격](entra-edu-board/원본/00-보드-규격.md)의 경로 요약과 [구현](MainBoard.html)의 경로 버튼은 참고하되 메인 버튼과 조건/결과가 보이는 분기 카드 요구는 추가 설계가 필요하다.
- [초안 생성기](build_edu_boards.py)는 [Entra 파서](entra-edu-board/build_board.py)를 공유하며 네 보드를 모두 생성한다. 현재 파서 오류 0건, lint 19건(모두 L3 없음)이다. lint 출력은 빌드 실패가 아니고 모든 품질 기준을 검사하지 않는다. `sync_main_board()`는 README 데이터가 다르면 루트 `MainBoard.html`도 갱신한다. 이번 문서 작업에서는 생성기를 실행하지 않는다.

## 기능별 시나리오 설계

각 행은 기존 L2 파일 하나다. 공통 상태 전이 ⓪ 비활성/① 구성/② 활성 중 **②를 메인**으로 하며 별도의 기능 핵심 L3 1~3개를 선정한다. 아래 분기는 메인 경로의 카드 후보이며 제품별로 정확한 선행조건·결과를 검증해 그래프를 구성한다. “미수집/대기”는 차단이나 탐지 실패로 자동 간주하지 않는다.

### Defender XDR — 10개

| 원본 기능 | 메인: 제목 / 교육 의도 | 분기 카드 후보: 조건 → 살필 결과·예외 |
| --- | --- | --- |
| [Defender for Endpoint](edu-defender-board/원본/01-XDR/01-Defender-for-Endpoint.md) | 온보딩 기기의 의심 실행 → 센서·탐지·증적 연결 | 온보딩 완료 → 기기 신호와 경고 추적; 미온보딩/센서 비정상 → 수집 공백 확인; ASR 감사 vs 차단 → 정책별 결과 비교 |
| [Defender for Office 365](edu-defender-board/원본/01-XDR/02-Defender-for-Office-365.md) | 피싱 메일과 링크 → 정책 평가부터 클릭 증적까지 | 안전한 링크 적용 vs 미적용 → 클릭 처리 비교; 악성 첨부 판정 → 배달/격리 결과 확인; 정책 예외 또는 비지원 대상 → 적용 범위 확인 |
| [Defender for Identity](edu-defender-board/원본/01-XDR/03-Defender-for-Identity.md) | AD 인증 신호 → 센서 기반 ID 공격 조사 | 센서 정상·대상 트래픽 → 신호/경고 확인; 센서 중지 또는 미배포 → 관찰 공백; 필요한 이벤트/권한 누락 → 진단과 수집 범위 확인 |
| [Defender for Cloud Apps](edu-defender-board/원본/01-XDR/04-Defender-for-Cloud-Apps.md) | SaaS 활동 가시화와 세션 정책 → 연결 방식별 통제 | API 커넥터 연결 → 활동 수집; 지원 세션의 프록시 정책 → 다운로드 제어 결과; 미연결/비지원 세션 → 정책 적용 여부 확인 |
| [M365 활동 → XDR](edu-defender-board/원본/01-XDR/05-M365-활동-XDR.md) | M365 활동 수집에서 헌팅까지 → 감사와 신호 경계 | 해당 활동·수집 조건 충족 → CloudAppEvents 조회; 활동 미지원/수집 미설정 → 이벤트 부재 진단; 권한 또는 지연 → 조회 불가와 아직 미수집 구분 |
| [인시던트 상관 분석](edu-defender-board/원본/01-XDR/06-인시던트-상관-분석.md) | 여러 경고를 인시던트에서 조사 → 엔터티·증적 연결 | 연관 신호 → 상관된 경고와 증거 확인; 연관 근거 부족 → 별도 인시던트 가능성; 경고 지연/누락 → 상관 범위 한계 확인 |
| [자동 공격 차단](edu-defender-board/원본/01-XDR/07-자동-공격-차단.md) | 공격 판정과 자동 중단 → 조치·Action center 추적 | 지원 공격·필요 조건 충족 → 대상 조치 확인; 제외된 대상 → 조치 제외 확인; 대상/권한/신호 부족 → 미실행 또는 실패 확인 |
| [고급 헌팅 · 사용자 지정 탐지](edu-defender-board/원본/01-XDR/08-고급-헌팅-사용자-지정-탐지.md) | KQL 결과에서 사용자 지정 탐지 → 경고·조치 확인 | 쿼리 일치 및 규칙 실행 → 결과·경고; 결과 없음/수집 누락 → 경고 부재 원인 구분; 필수 열·권한 오류 → 규칙 생성/실행 오류 확인 |
| [자동 조사 · 대응 AIR](edu-defender-board/원본/01-XDR/09-자동-조사-대응-AIR.md) | 경고에서 자동 조사와 대응 → 조사 결과·조치 이력 | 자동 조치 조건 충족 → 실행 상태 확인; 승인 필요 → 보류와 승인 후 결과; 조사 또는 조치 실패 → 사유와 수동 검토 |
| [Sentinel 통합](edu-defender-board/원본/01-XDR/10-Sentinel-통합.md) | 작업 영역 연결과 통합 인시던트 조사 → SIEM/XDR 경계 | 작업 영역 온보딩·권한 충족 → 인시던트 확인; 커넥터 미설정 → 데이터 누락; 분석 규칙/자동화 실패 → 실행 이력과 원인 |

### Defender for Cloud — 9개

| 원본 기능 | 메인: 제목 / 교육 의도 | 분기 카드 후보: 조건 → 살필 결과·예외 |
| --- | --- | --- |
| [환경 연결](edu-defender-board/원본/02-Cloud/01-환경-연결.md) | Azure 구독 또는 멀티클라우드 연결 → 인벤토리 확인 | 권한·커넥터 정상 → 자산 수집; 권한/온보딩 실패 → 연결 상태 진단; 범위 밖 계정/구독 → 인벤토리 누락 구분 |
| [Foundational CSPM](edu-defender-board/원본/02-Cloud/02-Foundational-CSPM.md) | 보안 권장 사항 평가 → 보안 점수와 개선 확인 | 비준수 자산 → 권장 사항; 개선 후 재평가 → 상태/점수 변화; 미지원 자산·평가 지연 → 미평가와 정상 구분 |
| [Defender CSPM](edu-defender-board/원본/02-Cloud/03-Defender-CSPM.md) | 그래프 기반 공격 경로 → 노출과 취약점 우선순위 | 유료 플랜·필요 데이터 충족 → 공격 경로 검토; 스캔 미활성/권한 누락 → 가시성 공백; 경로 요소 해결 → 재평가 후 변화 |
| [Defender for Servers](edu-defender-board/원본/02-Cloud/04-Defender-for-Servers.md) | 서버 플랜과 센서/스캔 → 서버 위험 및 경고 | 플랜/온보딩 조건 충족 → 서버 증적; 에이전트 없는 스캔 지원 조건 충족 vs 미충족 → 스캔 범위; P1/P2 차이 → 사용할 수 있는 기능 비교 |
| [Defender for Containers](edu-defender-board/원본/02-Cloud/05-Defender-for-Containers.md) | 이미지 취약점과 클러스터 런타임 → 서로 다른 보호 지점 | 이미지 평가 가능 → 취약점 결과; 센서 배포 후 런타임 의심 활동 → 경고; 센서/레지스트리 연결 누락 → 가시성 공백 |
| [Defender for Storage](edu-defender-board/원본/02-Cloud/06-Defender-for-Storage.md) | 업로드된 객체 스캔과 위협 신호 → 결과와 경고 구별 | 지원 업로드·스캔 활성 → 스캔 결과; 악성 판정 → 구성된 후속 처리 확인; 크기/형식 제한 또는 스캔 실패 → 미검사와 무해 판정 구분 |
| [AI 위협 보호](edu-defender-board/원본/02-Cloud/07-AI-위협-보호.md) | 지원 AI 리소스의 위협 신호 → 경고 조사 | 지원 리소스·플랜 충족 → 위협 경고; 프롬프트 증거 옵션/접근 조건 차이 → 표시 정보 비교; 미지원 리소스 또는 수집 불가 → 보장 범위 확인 |
| [DevOps 보안](edu-defender-board/원본/02-Cloud/08-DevOps-보안.md) | 리포지토리 연결과 코드 보안 결과 → 클라우드 위험 추적 | 커넥터·스캔 정상 → 결과/권장 사항; 스캔 미실행 또는 권한 부족 → 결과 공백; IaC 발견과 배포 자산 연결 가능 여부 → 코드-클라우드 맥락 비교 |
| [XDR 합류](edu-defender-board/원본/02-Cloud/09-XDR-합류.md) | Cloud 경고의 XDR 가시화 → 원본 경고와 인시던트 대조 | 연동·지원 경고 충족 → XDR 경고/인시던트 확인; 연동/권한 미충족 → 표시 공백; 연관 신호 유무 → 상관 결과 차이 |

## 권장 작업 순서와 의존성

1. **기준선·조사**: 19개 원고의 주장과 공식 문서/버전·검증일을 대조하고, 기능별 포털·권한·라이선스·범위·증적 매트릭스를 만든다. 제품별 명칭과 출시 상태의 불확실성을 먼저 표시한다. 이 단계가 모든 원고 집필의 선행 조건이다.
2. **공통 계약**: Entra 스키마와 호환되는 메인 L4 지정·분기 카드의 조건/결과 필드·딥링크 식별자와 오류 처리, 경로 제한, 접근성 요구를 정한다. 기존 Entra 및 다른 세 보드에 회귀가 없도록 공통 변경의 영향과 테스트를 먼저 설계한다. 1과 병행 가능하나 작성·구현 전에 계약을 확정한다.
3. **기능 원고**: XDR은 Endpoint/Office/Identity/Cloud Apps → M365 활동 → 상관 분석 → 공격 차단·헌팅·AIR → Sentinel 통합 순으로, Cloud는 환경 연결 → Foundational CSPM → Defender CSPM → Servers/Containers/Storage/AI/DevOps → XDR 합류 순으로 작성한다. 이는 이해와 근거 공유를 위한 권장 순서이며 해당 제품 기능의 기술적 필수 의존성을 뜻하지 않는다. XDR 합류는 양쪽 경고와 인시던트의 검증 후 완성한다.
4. **향후 구현**: 원고 계약을 만족하도록 파서·린트·공유 템플릿 및 Defender 생성기/안내를 조정하고, 기능별 메인 버튼과 분기 카드, 키보드·딥링크·반응형을 구현한다. 실제 변경 전 Entra 및 다른 세 보드와의 호환 범위를 확인한다.
5. **통합 검증·출시**: 전체 19개와 두 섹션, 메뉴/출처/라이선스, 브라우저 재생과 예외 경로, 자동 검사·회귀, 생성물 일관성을 확인하고 README를 실제 상태에 맞춰 갱신한다.

## 공식 문서 조사 계획

각 기능에 대해 Microsoft Learn의 제품 소개뿐 아니라 **설정 방법·지원 매트릭스·권한/라이선스·결과/로그 스키마·문제 해결**을 별도 확인한다. 조사표에는 기능·검증 주장·문서 제목/URL·확인일·적용 조건·결론·미해결 항목을 남긴다. 제품 기능이나 운영상 조치가 문서에 없으면 `[확인 필요]`를 유지한다.

| 조사 묶음 | 대상 기능 | 질문 및 출발점 |
| --- | --- | --- |
| XDR 제품 신호 | Endpoint, Office 365, Identity, Cloud Apps, M365 활동 | 온보딩·지원 플랫폼·정책별 동작·수집 전제·로그 테이블·최소 권한을 각 제품 공식 문서에서 확인. [XDR 필수 조건](https://learn.microsoft.com/en-us/defender-xdr/prerequisites), [XDR 활성화](https://learn.microsoft.com/en-us/defender-xdr/m365d-enable)에서 시작 |
| XDR 운영 | 인시던트, 공격 차단, 헌팅, AIR, Sentinel 통합 | 상관 조건·자동 조치 및 제외·규칙 쿼리 요구·승인 수준·작업 영역/커넥터와 플랜을 각 기능 문서에서 확인. [XDR 문서 허브](https://learn.microsoft.com/en-us/defender-xdr/)에서 항목별로 추적 |
| Cloud 연결·자세 | 환경 연결, Foundational CSPM, Defender CSPM | Azure/AWS/GCP 연결 권한, 무료/유료 범위, 데이터 수집·공격 경로와 비용을 확인. [Cloud 소개](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-cloud-introduction), [CSPM 플랜](https://learn.microsoft.com/en-us/azure/defender-for-cloud/concept-cloud-security-posture-management) |
| Cloud 워크로드 | Servers, Containers, Storage, AI 보호 | 플랜별 기능·지원 리소스·센서/스캔 전제·예외·데이터·비용, AI 증거 노출 조건과 프리뷰 여부 확인. [Cloud 문서 허브](https://learn.microsoft.com/en-us/azure/defender-for-cloud/)에서 각 플랜별 문서 추적 |
| 연결 경계 | DevOps, XDR 합류 | 지원 SCM·커넥터 권한·스캔 및 코드-클라우드 매핑, 경고 수신·상관 조건·기본 연동 여부와 양쪽 라이선스 확인. Cloud 문서 허브와 XDR 문서 허브 양쪽에서 교차 검증 |

메뉴는 실제 포털 화면과 문서 버전·언어를 함께 확인한다. 화면 확인이 불가능하면 메뉴에 `[확인 필요]`를 붙인다. 저장소 초안의 `30일`, 특정 테이블, `Owner 필요`, `기본 연동`, `에이전트 불필요`, AI/DevOps 동작은 조사 전 가정이다.

## 리뷰 게이트

1. **사실·제품 리뷰**: 기능 담당자가 주장별 공식 출처와 범위, 라이선스/권한 및 비용, 예외·지연·환경 차이를 승인한다.
2. **교육 리뷰**: 19개 각각에 독립 메인과 기능 고유의 분기 조건·결과·실패, 상태 전이와 Task/증적이 있는지 점검한다. 확인되지 않은 분기는 완료로 세지 않는다.
3. **기술·접근성 리뷰**: 파서·정적 검사, 메인/분기별 시각적 재생, 키보드와 스크린리더, 모션 감소, 좁은 화면, 딥링크 및 기존 보드 회귀를 확인한다.
4. **출시 리뷰**: 전체 링크 및 생성 HTML 확인, README 정합성과 미해결 항목 승인. 각 게이트의 실패는 재작업 후 재검토한다.

## 검증 명령

아래는 저장소 루트 기준이다. 첫 명령은 파일을 쓰지 않는 현재 원고 기준선 점검이다. 현재는 19개 L3 없음 경고가 예상된다. 구현 완료 시 파서 경고와 lint가 모두 0이고 10+9개가 유지되어야 한다.

```bash
python3 - <<'PY'
import importlib.util
from pathlib import Path
p = Path("entra-edu-board/build_board.py")
spec = importlib.util.spec_from_file_location("entra_board", p)
b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b)
data = b.parse(b.assemble(Path("edu-defender-board/원본")))
print([(x["name"], len(x["l2"])) for x in data])
print("parse warnings:", len(b.WARN), *b.WARN, sep="\n")
w = b.lint(data)
print("lint warnings:", len(w), *w, sep="\n")
PY
python3 -m unittest discover -s entra-edu-board -p 'test_*.py'
git diff --check
```

향후 콘텐츠/렌더러 구현 후에는 `python3 build_edu_boards.py`로 **네 초안 HTML을 모두 덮어쓰고**, README 동기화 조건에 따라 `MainBoard.html`도 바뀔 수 있음을 확인한 뒤 생성물 diff를 검토한다. 필요 시 `python3 -m http.server 8765`로 로컬 브라우저에서 Defender 보드를 열고 기능별 메인·정상/예외 카드, 메뉴·출처·Task, 키보드·모션 감소·좁은 화면과 딥링크를 검사한다. 서버는 검증 후 종료한다. 위 명령만으로 메뉴·라이선스·출처의 정확성이나 접근성을 증명할 수 없으므로 별도 리뷰가 필수다.
