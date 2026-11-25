# Copilot · Graph 교육 보드 PLAN

> 아래 현황과 갭은 2026-11-24 설계 당시의 기준선입니다. 이후 원고가 작성되었으며 현재 지표는 [로드맵](ROADMAP.md)을 참고하세요.

상태: **후속 작업 계획**, 2026-11-24. 본 작업은 문서만 작성하며 원고·코드·생성 HTML을 변경하지 않는다. 목표와 수용 규칙은 [SPEC](COPILOT_GRAPH_SPEC.md)을 따른다.

## 현황과 갭

[Copilot 원고 머리](edu-copilot-board/원본/00-Copilot-Graph.md)와 [기존 분리본](entra-edu-board/split/06-Copilot-Graph.md)은 L1 아래 9개 L2의 설정·강제·증적만 가진 미검증 E0 초안이다. 9개 모두 `### L3: [작성 필요]`로, 현재 파서는 이를 시나리오로 읽지 않는다. 메뉴·라이선스·공식 출처, L3/L4와 노드·분기 요약이 없다. 아래의 원고 내용은 확인 대상이지 사실 승인이나 실제 포털 메뉴가 아니다.

| 번호·기능/원고 | 현재 원고의 설정 → 강제 → 증적 요약 | 기능별 주요 갭/확인 대상 |
| --- | --- | --- |
| 01 사용자 접근 · [원고](edu-copilot-board/원본/01-사용자-접근.md) | 라이선스/CA·앱 보호 → 토큰/디바이스 → 로그인 로그·할당 | Copilot과 Chat별 라이선스·지원 클라이언트·CA/MAM 적용 및 로그를 분리 |
| 02 그라운딩 · [원고](edu-copilot-board/원본/02-그라운딩.md) | 파일·공유 권한 → 사용자 컨텍스트 → CopilotInteraction/AccessedResources | 권한과 검색 가능성·인용의 차이, Semantic Index 및 실제 기록 필드 검증 |
| 03 레이블·EXTRACT · [원고](edu-copilot-board/원본/03-레이블-EXTRACT.md) | 레이블/DLP → 사용 권한 확인 → 레이블 정보·DLP 경고 | VIEW와 EXTRACT, DLP와 암호화의 별개 경로·예외·SKU 확인 |
| 04 웹 그라운딩 · [원고](edu-copilot-board/원본/04-웹-그라운딩.md) | 웹 검색 정책/DLP → 검색 쿼리 → DLP 경고·감사 | 관리 정책·사용자 토글·클라이언트/지역 기본값과 DLP 범위 확인 |
| 05 Copilot 커넥터 · [원고](edu-copilot-board/원본/05-Copilot-커넥터.md) | 연결/ACL → 외부 항목 검색 → 연결 API·크롤 | 원고의 '원본 권한 그대로'는 보장 아님; ACL 매핑·동기 지연 및 커넥터 종류 확인 |
| 06 과다 공유 정리(SAM) · [원고](edu-copilot-board/원본/06-과다-공유-정리-SAM.md) | DAG/RCD·제한된 접근 → 검색/접근 통제 → 보고서·명령 | RCD의 검색 제한과 사이트 접근 제한 및 예외·라이선스 구분 |
| 07 안전 시스템 · [원고](edu-copilot-board/원본/07-안전-시스템.md) | 기본 보호/MDO → 프롬프트·응답 검사 → 보안 신호·감사 | 보호 계층·대상·실패와 신호, Defender/Purview 기록을 혼동하지 않기 |
| 08 에이전트 · [원고](edu-copilot-board/원본/08-에이전트.md) | Power Platform/Agent ID → 런타임/Defender → 감사·엔터티 | 에이전트 유형·권한·접근·승인·제품 가용성/미리 보기 및 증적 분리 |
| 09 보존·eDiscovery · [원고](edu-copilot-board/원본/09-보존-eDiscovery.md) | 보존 정책 → 상호작용 보관/삭제 → 검색·감사 | 보존 위치의 최신 명칭, 범위/예외, 감사 메타데이터와 대화 본문 구분 |

## 권장 순서와 의존성

1. **기준선·조사**: 9개 파일 및 원고 머리의 표현을 출처별 주장 목록으로 전환한다. 관련 제품·라이선스·메뉴·로그를 Microsoft Learn과 해당 환경에서 확인하고 확인일·적용 범위·미확인 항목을 남긴다. 아래 설계는 조사 전 `[제안]`이다.
2. **공통 토대**: 01 접근과 02 grounding을 먼저 작성한다. 사용자·콘텐츠 권한과 앱의 위임/앱 전용 권한을 구별하며, 이후 03·05·06·08이 참조할 용어를 확정한다. 공통 메인/분기 규약 및 접근성·딥링크 계약을 검토한다.
3. **데이터 통제**: 03 레이블과 06 과다 공유를 02 다음에, 05 커넥터를 02와 ACL 모델 확인 다음에 작성한다. 04 웹은 조직 데이터 경로와 별개로 작성하되 02의 용어를 재사용한다.
4. **안전·에이전트·증적**: 07은 04의 웹/콘텐츠 경계와 연결, 08은 01·02·05 및 에이전트 유형 검증 뒤 작성한다. 09는 앞선 기능이 참조할 감사/본문 구분을 정리하되 보존·검색 독립성을 보장한다.
5. **후속 구현/검증**: 아홉 기능 콘텐츠 리뷰 후 Copilot용 메인 버튼·카드와 상태 동기화를 구현하고, 기존 Entra 공통 템플릿을 변경한다면 네 초안 보드와 Entra 회귀도 검증한다. 기존 생성기는 네 보드를 모두 갱신하고 템플릿 동기화도 할 수 있으므로 변경 범위·산출물은 별도 후속 작업에서 명시적으로 관리한다.

## 기능별 시나리오 설계 [제안]

각 행의 메인은 A 첫 L4 및 기본 경로의 교육 의도다. 괄호 안 분기는 상황을 비교하기 위한 **가설**이며 제품별 공식 근거와 해당 테넌트에서 결과·예외를 검증하기 전까지 `[확인 필요]`다. 분기별로 조건, 처리 주체, 데이터, 결과, 조사할 증적과 증적이 없는 경우를 작성한다.

| 기능 | 핵심 메인 시나리오 | 구체적 분기 카드 제목 · 의도 |
| --- | --- | --- |
| 01 사용자 접근 | **적격 사용자의 접근**: ID·라이선스·지원 클라이언트 확인 후 접근과 로그인 증적 연결 | **라이선스별 경험 차이**: 유료 Copilot과 적격 Chat의 범위 구분; **조건부 액세스 미충족**: 적용 대상에서 인증/디바이스 조건 미충족 시 접근 결과와 로그; **앱 보호 대상 외**: 클라이언트·정책 지원 차이 [확인 필요] |
| 02 그라운딩 | **권한 있는 문서 기반 답변**: 사용자 질문 → 허용된 자료 검색·인용 → 조사 가능한 기록 | **권한 없는 문서**: 권한 경계와 미노출; **공유된 문서**: 실제 접근 권한에 따른 노출과 과다 공유 위험; **검색 결과 없음**: 접근 가능과 검색·인용 보장 차이 및 기록 [확인 필요] |
| 03 레이블·EXTRACT | **보호 문서의 요약**: 암호화된 문서에서 VIEW·EXTRACT 확인과 응답 | **VIEW만 보유**: 요약 제한 및 링크 가능; **권한 없음**: 콘텐츠 사용 제한; **Copilot DLP 적용**: 암호화 권한과 별도 정책의 제한 및 경고 범위 [확인 필요] |
| 04 웹 그라운딩 | **웹 검색 허용 질문**: 관리 설정·사용자 선택 → 생성 쿼리와 웹 근거 | **관리자 검색 차단**: 웹 검색 비활성화 시 응답 경계; **사용자 웹 토글 끔**: 지원 클라이언트의 사용자 선택; **민감 프롬프트 DLP**: 적용 가능한 정책의 차단 조건과 증적 [확인 필요] |
| 05 Copilot 커넥터 | **동기화된 외부 문서 조회**: 연결·스키마·수집과 외부 항목 ACL → 사용자별 결과 | **허용 ACL**: 매핑된 사용자에게 조회; **ACL 누락/불일치**: 원본과 인덱스 불일치 위험 및 진단 [확인 필요]; **수집 실패/변경 지연**: 상태·크롤 기록과 최신성 [확인 필요]. 연합 커넥터는 인덱싱 경로와 별도로 비교 |
| 06 과다 공유 정리 | **공유 조사와 노출 축소**: 보고서 → 사이트 권한 검토 → 검색 또는 접근 통제 선택 | **RCD 적용**: 검색 노출 제한과 기존 권한의 구분, 소유·최근 상호작용 예외 확인; **제한된 액세스 제어**: 지정 그룹 기준 접근의 별도 판정 [확인 필요]; **권한 수정 전후**: 실제 권한 축소와 증적 비교 [확인 필요] |
| 07 안전 시스템 | **프롬프트 처리의 다층 보호**: 프롬프트·grounding·응답 단계와 사용자가 확인할 수 있는 결과 | **직접 탈옥 시도**: 보호 반응과 감사 신호의 범위 [확인 필요]; **외부 콘텐츠의 간접 인젝션**: 콘텐츠 경계와 보호 계층 [확인 필요]; **메일 인젝션 탐지**: Defender for Office 365의 적용 조건·별도 증적 [확인 필요]. 모든 공격 탐지·차단을 보장하지 않음 |
| 08 에이전트 | **승인된 에이전트 호출**: 유형·관리자 허용·사용자 접근·데이터 연결과 결과 | **관리자 차단**: 배포/사용 불가 경험 [확인 필요]; **연결 권한 부족**: 데이터 조회 실패와 사용자 권한 경계 [확인 필요]; **외부 서비스/인증 실패**: 런타임·오류·감사 경로 [확인 필요]. Agent ID와 Studio/Agent 365의 관계는 검증 후에만 연결 |
| 09 보존·eDiscovery | **대화 보존과 검색**: 상호작용 → 적용 보존 정책 → eDiscovery 검색 및 감사의 서로 다른 증적 | **보존 적용 중 사용자 삭제**: 검색 가능 기간과 보존 처리 [확인 필요]; **보존 만료/삭제**: 지연과 이후 검색 결과 [확인 필요]; **감사 레코드만 확인**: 활동 메타데이터와 프롬프트/응답 본문의 차이 |

각 기능의 0 탭은 미구성/기준 → 구성 → 적용을 제공한다. 예를 들어 안전 시스템처럼 Microsoft가 운영하는 기능은 가상의 고객용 온/오프 스위치를 만들지 않고 해당 기능의 관찰 가능한 기준 상태와 별도 관리자 통제를 설명한다. 기능별 A 외 B/C는 실제 복잡도와 근거가 있을 때만 추가한다.

## 공식 문서 조사 계획

공통 확인 근거와 접근일은 [SPEC의 공식 근거](COPILOT_GRAPH_SPEC.md#공식-근거와-라이선스-검증)에 있다. 모든 주장에 대해 공식 문서 제목·URL·확인일, 적용 경험/클라이언트·역할·라이선스·GA/미리 보기·지역, 실제 메뉴·설정값, 성공/실패 조건·로그 필드와 제한을 기록한다. 공식 문서에 없는 동작은 환경 실험을 하더라도 일반 제품 사실로 확정하지 않는다.

| 기능 | 추가 조사 항목과 시작점 |
| --- | --- |
| 01 | [요구 사항](https://learn.microsoft.com/en-us/copilot/plan/microsoft-copilot-requirements)에서 Copilot/Chat 요구사항과 라이선스 서비스 설명 연결; 각 CA·Intune 정책의 지원 리소스/클라이언트·로그를 별도 확인 |
| 02 | [데이터·프라이버시](https://learn.microsoft.com/en-us/copilot/plan/microsoft-365-copilot-privacy), [Graph 권한](https://learn.microsoft.com/en-us/graph/permissions-overview), [감사 아키텍처](https://learn.microsoft.com/en-us/copilot/plan/architecture-data-protection-auditing)로 사용자 데이터 경계와 기록 필드 검증 |
| 03 | [데이터 보호](https://learn.microsoft.com/en-us/copilot/plan/architecture-data-protection-auditing)와 [Copilot DLP](https://learn.microsoft.com/en-us/purview/dlp-microsoft365-copilot-location-learn-about)에서 EXTRACT, 예외·레이블, 정책 및 라이선스 확인 |
| 04 | [웹 검색](https://learn.microsoft.com/en-us/copilot/plan/manage-public-web-access)에서 정책·사용자 설정·클라우드별 기본값·쿼리 데이터 확인. DLP는 별도 정책 문서로 범위·감사 검증 |
| 05 | [커넥터 개요](https://learn.microsoft.com/en-us/plugins/overview-copilot-connector), [커넥터 API](https://learn.microsoft.com/en-us/graph/connecting-external-content-connectors-api-overview)에서 동기화/연합, ACL·externalGroup·API 권한·실패 상태·쿼터 확인 |
| 06 | [Restricted Content Discovery](https://learn.microsoft.com/en-us/sharepoint/restricted-content-discovery)와 [데이터 보호](https://learn.microsoft.com/en-us/copilot/plan/architecture-data-protection-auditing)에서 예외, RAC·DAG·SAM 라이선스/메뉴를 개별 문서로 확인 |
| 07 | [프롬프트 방어](https://learn.microsoft.com/en-us/copilot/plan/copilot-prompt-defense-in-depth)에서 보호 계층·메일 탐지·감사 신호 및 사용 가능한 피드백 경로·라이선스 확인 |
| 08 | [에이전트 관리](https://learn.microsoft.com/en-us/microsoft-agent-365/admin/manage-copilot-agents-integrated-apps)에서 유형별 승인·권한·관리 경로 확인. Studio, Agent ID, Agent 365 및 Defender 별도 문서로 관계와 제공 상태 조사 |
| 09 | [보존](https://learn.microsoft.com/en-us/purview/retention-policies-copilot), [감사 아키텍처](https://learn.microsoft.com/en-us/copilot/plan/architecture-data-protection-auditing)에서 위치, 보존/삭제, 감사와 eDiscovery 범위·역할·라이선스 확인 |

특히 원고의 `E5 계열`, `MDO P2`, `Defender 실시간 보호 (Preview)`, `RestrictContentOrgWideSearch`, `AccessedResources`, `CopilotInteraction`은 구체적 제품·이벤트·조건·표기·현재 상태 확인 전 포괄적 사실로 복사하지 않는다. 감사 기록, 검색 가능한 상호작용 본문, 사용자 피드백과 보안 경고는 서로 다른 경로다.

## 리뷰 게이트

1. **사실·라이선스**: 기능별 주장과 원문 근거, 포털 위치, 역할, SKU, 제품/지역/상태 및 예외를 검토한다. 핵심 경계의 미확인은 해결 전 완료 불가.
2. **교육·시나리오**: 기능별 메인 1개와 다른 조건/결과/실패를 설명하는 카드, 구성→강제→증적, L1~L4 Task 깊이 및 경로별 요약을 대조한다.
3. **기술·접근성**: 파서 경고와 모든 경로, 독립 메인 재생 및 카드 선택의 동기화, 딥링크·키보드·스크린리더·모션 감소·좁은 화면 및 타 보드 회귀를 확인한다.
4. **출시**: 공식 출처 링크·라이선스와 환경 차이 표기, 독립 HTML, README의 초안 상태 변경 여부 및 생성물 일관성을 리뷰한다. 모든 게이트 전에는 미검증 초안 표시를 유지한다.

## 검증 명령과 범위

현재 문서만 작성하는 단계에서는 생성 스크립트를 실행하지 않는다. 후속 원고 작업에서는 저장소 루트에서 파서/린트를 **읽기 전용**으로 점검한다. 현재는 9개 `L3 없음` 경고가 예상되며 완성 후에는 파싱 경고와 lint가 모두 0이어야 한다.

```bash
python3 -c 'import build_edu_boards as b; d=b.board.parse(b.board.assemble(b.ROOT / "edu-copilot-board" / "원본")); w=b.board.WARN+b.board.lint(d); print("L2:", sum(len(x["l2"]) for x in d), "경고:", len(w)); print("\n".join(w)); raise SystemExit(bool(w))'
```

후속 생성·UI 검증 때 `python3 build_edu_boards.py`는 **네 초안 HTML 전부를 덮어쓰고** README가 달라졌으면 `MainBoard.html`도 동기화할 수 있다. 그러므로 변경 허용 범위를 확인하고 전체 diff를 리뷰한다. Entra 빌드도 템플릿을 동기화할 수 있다. 이후 정적 서버 `python3 -m http.server 8765`에서 Copilot 보드를 열어 위 게이트의 브라우저 검사를 수행하고, 생성물 변경을 의도적으로 포함할 때만 반영한다. 의존성은 [requirements.txt](requirements.txt) 참고.

문서 단계에서의 확인: 두 문서의 상대 Markdown 링크 대상과 앵커, 9개 원고 링크, 표의 셀 수 및 `git diff --check`/변경 범위를 검사한다. 외부 공식 링크는 조사 시 실제 문서를 확인하며 이후 제품 변경에 맞춰 재검증한다.
