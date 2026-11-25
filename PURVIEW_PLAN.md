# Purview 교육 보드 PLAN

> 아래 현황과 갭은 2026-11-24 설계 당시의 기준선입니다. 이후 원고가 작성되었으며 현재 지표는 [로드맵](ROADMAP.md)을 참고하세요.

상태: **설계 및 조사 계획, 구현 전** · 기준 확인일: 2026-11-24 · [SPEC](PURVIEW_SPEC.md)

## 현재 상태와 근거

[저장소 README](README.md)와 [Purview README](edu-purview-board/README.md)에 따르면 이 보드는 기존 분리본에서 옮긴 미검증 설정·강제·증적 초안이며 애니메이션이 없다. [원본 머리](edu-purview-board/원본/00-Purview.md)의 L1 아래 10개 L2 파일은 각 7줄로 세 필드와 `### L3: [작성 필요]`만 갖는다. 메뉴·라이선스·공식 출처·실제 L3/L4는 모두 없다. `00-Purview.md`는 기능이 아니라 머리다.

[Entra 규격](entra-edu-board/원본/00-보드-규격.md), [Entra README](entra-edu-board/README.md), [실제 사용자·그룹 원고](entra-edu-board/원본/02-ID/01-사용자-그룹.md)가 세부 Task와 분기 요약의 기준이다. [초안 생성기](build_edu_boards.py)는 Entra 파서를 재사용하고 네 보드를 함께 생성한다. [Entra 생성기](entra-edu-board/build_board.py)는 구조 및 일부 깊이를 점검하지만 경고 0건만으로 제품 사실·UI 요구를 보증하지 않는다. 현재 Entra의 경로 버튼과 별도로 기능별 대표 재생 버튼·설명 카드를 구현해야 한다.

## 기능별 원고 상태와 시나리오 설계

아래는 **설계 후보**이며 조건·결과·로그와 지원 범위는 공식 문서로 확인하기 전 `[확인 필요]`다. 분기는 서로 다른 정책 조건·결과 또는 실패 원인을 설명하고, 실제 가능한 경우에만 경로로 구현한다.

| 파일 / 기능 | 현재 E0 요지와 주요 갭 | 대표 메인 시나리오 · 구체적 분기 제목과 의도 |
| --- | --- | --- |
| [01 데이터 분류](edu-purview-board/원본/01-데이터-분류.md) | SIT·학습 가능한 분류자, 콘텐츠 검사·탐색기만 기재. 서비스별 지원과 탐지 방식 확인 필요. | **민감 데이터 발견:** SIT를 지정하고 대상 콘텐츠가 탐지·탐색기에 나타나는 과정. **일치/불일치:** 조건·신뢰도에 따른 탐지 차이; **권한 부족:** 탐색기 접근·표시 범위 확인. |
| [02 민감도 레이블](edu-purview-board/원본/02-민감도-레이블.md) | 레이블·게시·자동 적용, 앱/서비스 적용과 감사만 기재. 게시 범위·자동 적용 조건·우선순위 검증 필요. | **레이블 게시 후 적용:** 레이블 게시에서 문서 적용·증적까지. **대상 포함/제외:** 사용자에게 보이는 레이블 차이; **기존 레이블과 자동 적용:** 교체·우선순위 결과 검증. |
| [03 암호화·사용 권한](edu-purview-board/원본/03-암호화-사용-권한.md) | 레이블 암호화·RMS·사용 기록, Copilot EXTRACT 주장이 미검증. 권한과 앱별 제약 검토 필요. | **보호 문서 열기:** 레이블 권한을 설정하고 사용자가 문서를 여는 판정. **VIEW 허용/거부:** 사용자 권한별 결과; **EXTRACT 유무와 Copilot:** 지원되는 앱·콘텐츠 이용 범위 확인. |
| [04 M365 DLP](edu-purview-board/원본/04-DLP-M365.md) | 메일·파일·채팅 정책과 이벤트명만 기재. 위치별 조건·동작과 감사 명칭 검증 필요. | **외부 공유 통제:** 위치와 SIT 조건을 설정하고 문서 외부 공유를 평가. **대상 콘텐츠 일치/불일치:** 규칙 적용 여부; **테스트/강제:** 보고와 실제 사용자 경험 차이. |
| [05 엔드포인트 DLP](edu-purview-board/원본/05-엔드포인트-DLP.md) | 온보딩 기기와 도메인 그룹만 기재. OS·브라우저·행위별 지원 및 예외 검증 필요. | **민감 파일 업로드 통제:** 기기 온보딩부터 정책과 업로드 판정·증적. **온보딩/미온보딩:** 정책 적용 전제 차이; **경고 후 재정의/차단:** 설정된 동작과 기록 차이. |
| [06 Copilot 위치 DLP](edu-purview-board/원본/06-Copilot-위치-DLP.md) | 프롬프트·검색·레이블·외부 메일과 E5 주장이 미검증. 현재 제품·위치·통제별 지원과 라이선스 검증 필요. | **민감 프롬프트 처리:** 지원 위치에 SIT 규칙을 두고 프롬프트 평가. **민감 프롬프트/불일치:** 응답 제한 여부; **레이블 항목 제외:** 프롬프트 차단과 근거 콘텐츠 처리·인용 차이; **웹 검색 제한:** 내부 응답과 외부 검색 구분. |
| [07 타사 AI 경로 DLP](edu-purview-board/원본/07-타사-AI-경로-DLP.md) | DSPM for AI·Edge·네트워크·SASE와 `AIAppInteraction`만 기재. 수집·차단 경로 및 공급자·라이선스 검증 필요. | **관리 기기의 AI 사이트 유출 통제:** 지원 브라우저·기기의 민감 정보 붙여넣기 또는 업로드 정책. **허용/차단 대상 도메인:** 조건별 효과; **비지원 경로:** 다른 브라우저·미온보딩 또는 네트워크 경로에서 통제 범위와 증적 차이. |
| [08 Insider Risk·Adaptive Protection](edu-purview-board/원본/08-Insider-Risk-Adaptive-Protection.md) | 위험 수준 → DLP·CA, 경고·케이스만 기재. 역할·개인정보 보호·신호 전파와 대응 정책 조건 검증 필요. | **위험 수준 기반 보호:** 위험 신호·수준을 DLP 정책에 연결해 데이터 공유를 평가. **높은/낮은 위험:** 서로 다른 정책 적용 조건; **전파 지연·미설정:** 수준과 통제 간 불일치 진단. |
| [09 감사·eDiscovery](edu-purview-board/원본/09-감사-eDiscovery.md) | Standard/Premium·케이스·Copilot 상호작용·API만 기재. 수집, 보존, 검색 권한과 API 지원·보존 기간 확인 필요. | **활동 조사와 케이스 검색:** 감사 검색과 eDiscovery 케이스의 역할을 구분해 관련 기록을 찾는다. **감사 이벤트 검색/콘텐츠 검색:** 서로 다른 대상·증적; **권한 부족 또는 기록 미수집:** 결과가 없는 원인과 확인 절차. |
| [10 Data Map·멀티클라우드](edu-purview-board/원본/10-Data-Map-멀티클라우드.md) | 등록·스캔과 Unified Catalog만 기재. 원본별 런타임·접근·과금·종료 공지 및 수집 범위 검증 필요. | **기존 환경의 원본 스캔:** 등록·인증·스캔과 자산·분류 결과 확인. **연결 성공/자격 증명 실패:** 스캔 상태와 진단; **원본별 전체/증분:** 지원되는 원본에 한해 결과 차이. 종료 일정·Fabric 전환 안내 필수. |

특히 03의 Copilot EXTRACT, 06의 외부 메일·E5, 07의 기록 형식, 09의 API와 보존 위치, 10의 수집 범위는 원고의 주장을 그대로 사실로 삼지 않는다. Copilot [공식 문서](https://learn.microsoft.com/en-us/purview/dlp-microsoft365-copilot-location-learn-about)는 민감 프롬프트, 웹 검색, 레이블 항목을 별도로 다룬다. [Data Map 스캔 문서](https://learn.microsoft.com/en-us/purview/data-map-scan-data-sources)의 거버넌스 종료 공지를 교육 자료에 반영하며 Purview 전체 종료로 표현하지 않는다.

## 권장 작업 순서와 의존성

1. **근거 인벤토리:** 10개 파일별 주장·공식 문서·메뉴·역할·라이선스·지원 상태·확인일을 기록하고 불일치와 `[확인 필요]`를 표시한다. Data Map 종료 및 범위는 가장 먼저 확인한다.
2. **공통 정보모델·UI 설계:** Entra L1~L4와 파서·경로 한계, 대표 L4와 카드의 명시적 매핑을 확정한다. 공통 템플릿 변경은 Entra와 다른 보드에 영향을 주므로 호환성·회귀 계획을 선행한다.
3. **기초 기능 01→02→03:** 분류 결과, 레이블 적용, 보호·사용 권한을 차례로 작성한다. 정책 조건에 레이블을 사용하는 사례는 02 검증에 의존한다.
4. **DLP 04→05→06/07:** M365 정책 평가를 기준으로 기기, Copilot, 타사 AI의 위치·행위별 차이를 독립적으로 작성한다. 06/07은 04의 정책 모델 및 01/02의 조건 정의에 의존하되 서로 다른 강제 경로를 혼동하지 않는다.
5. **08→09 및 10:** 08은 위험 수준과 04의 DLP 연결을 검증하고 CA 연동은 별도 전제로 명시한다. 09는 앞선 기능의 증적 사례를 참조하되 감사와 eDiscovery를 구분한다. 10은 기존 Data Map 환경 및 전환 관점으로 독립 작성한다.
6. 기능별 문서 검토 후 재생·카드 및 경로 매핑을 구현하고, 제품·접근성·회귀 검토를 통과한 뒤 원고와 생성물을 함께 반영한다. 이 단계는 후속 작업이며 이번 문서 작성에서 실행하지 않는다.

## 공식 문서 조사 계획

| 영역 | 출발 근거와 확인할 질문 |
| --- | --- |
| 전 기능 | [서비스 설명](https://learn.microsoft.com/en-us/office365/servicedescriptions/microsoft-365-service-descriptions/microsoft-365-tenantlevel-services-licensing-guidance/microsoft-purview-service-description): 기능·위치·사용자별 SKU, 추가 과금, 권한과 배포 상태는 무엇인가? 각 기능 최신 Learn 절차·지원 표와 교차 확인한다. |
| 01–03 | [Information Protection](https://learn.microsoft.com/en-us/purview/information-protection-solution): SIT·분류자, 게시·자동 레이블, 암호화·사용 권한의 서비스·클라이언트별 조건과 증적은 무엇인가? 각 개별 기능 문서와 지원 매트릭스로 좁힌다. |
| 04–07 | [DLP](https://learn.microsoft.com/en-us/purview/dlp-learn-about-dlp), [Copilot 위치 DLP](https://learn.microsoft.com/en-us/purview/dlp-microsoft365-copilot-location-learn-about), [AI와 Copilot](https://learn.microsoft.com/en-us/purview/ai-m365-copilot): 위치별 조건·제한·테스트/강제 동작은? 엔드포인트 OS·브라우저 및 타사 공급자별 최신 문서를 추가 확인한다. |
| 08 | [Adaptive Protection](https://learn.microsoft.com/en-us/purview/insider-risk-management-adaptive-protection): 위험 수준 생성·전달·DLP/CA 적용, 개인정보 보호와 지연·미설정 시 동작은? |
| 09 | Microsoft Learn의 Purview 감사 검색, Audit Standard/Premium, eDiscovery 검색·보존, Copilot 데이터 및 Graph 감사 쿼리의 최신 문서를 각각 찾아 권한·이벤트·콘텐츠 범위·보존 조건을 확인한다. |
| 10 | [Data Map 스캔](https://learn.microsoft.com/en-us/purview/data-map-scan-data-sources): 종료 일정·기존 계정·Fabric 전환을 확인하고 S3·Snowflake·SQL Server 각각의 등록/스캔 지원, 인증·런타임·증분·과금을 원본별 문서에서 확인한다. |

문서별 확인일과 근거 문장에 연결된 주장, 적용 위치 및 라이선스를 기록한다. 관련 공식 문서를 찾지 못하거나 문서·포털이 충돌하면 `[확인 필요]`로 남기고 검토 게이트에 올린다.

## 리뷰 게이트

1. **사실·라이선스:** 제품 담당자가 기능별 주장과 메뉴·지원 매트릭스·SKU·미리 보기·종료 상태를 공식 문서와 대조한다. 불확실성을 숨기지 않는다.
2. **교육·시나리오:** 10개 각각의 메인과 분기 카드가 기능 고유의 조건·결과·예외 및 증적을 구별하고 L1~L4와 Task가 연결되는지 확인한다.
3. **구현·접근성:** 대표 버튼과 카드가 올바른 L4/경로만 재생하는지, 키보드·포커스·축소 동작·딥링크·반응형을 확인한다. 기존 Entra·다른 보드의 회귀를 막는다.
4. **출시:** 원고와 생성물이 일치하고 파서 경고, 출처 제목 누락 및 미해결 `[확인 필요]`를 검토·해결하거나 책임자가 명시적으로 승인한다.

## 후속 검증 명령

저장소 루트 기준. 다음 빌드 명령은 **후속 구현 시** 실행한다. `build_edu_boards.py`는 네 HTML을 덮어쓰고, Entra의 `sync_main_board()`는 README 동기화 시 `MainBoard.html`도 쓸 수 있으므로 변경 범위를 먼저 점검한다.

```bash
git status --short
python3 -m unittest discover -s entra-edu-board -p 'test_*.py'
python3 entra-edu-board/build_board.py entra-edu-board/원본 /tmp/purview-entra-check.html
python3 build_edu_boards.py
git diff --check
git status --short
```

Entra 빌드는 `점검 경고 0건`, 초안 생성기의 Purview 출력은 기능 10개·시나리오 미작성 0개와 규격 경고 0건을 목표로 한다. 생성기는 경고를 출력할 뿐 모든 경고를 실패 종료로 처리하지 않으므로 출력을 직접 확인한다. 빌드 후 브라우저에서 10개 기능 각각의 대표 버튼·분기 카드·경로/상세·키보드·좁은 화면과 `?f=...&l3=...&l4=...&route=...` 복원을 수동 확인한다. 파서의 12경로 상한 때문에 실제 모든 분기가 표시되는지도 별도 검사한다. 테스트용 HTML은 `/tmp`에 두고 배포 생성물과 혼동하지 않는다.
