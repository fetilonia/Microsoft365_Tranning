# Entra Admin Center 교육 보드

Microsoft Entra Admin Center(Entra ID 워크로드)의 기능별 데이터 흐름을 보여 주는 교육 보드입니다. 왼쪽 블레이드에서 기능을 고르면 가운데 화면에 ⓪ 비활성 · ① 구성 · ② 활성 시나리오와 분기별 시나리오 흐름이 나오고, 아래 Task 상세에서 단계마다의 위치·데이터를 볼 수 있습니다.

왼쪽의 각 섹션 이름을 눌러 기능 목록을 접거나 펼칠 수 있습니다.

## 파일

| 경로 | 역할 |
| --- | --- |
| [`원본/`](원본/) | 내용의 원본. 주제 폴더 아래에 기능별 MD를 둡니다(아래 "원본 구조") |
| `build_board.py` | `원본/`을 번호 순서로 이어 붙여 파싱·점검(lint)하고 HTML을 조립 |
| `MainBoard.html` | 프로젝트 소개와 워크로드 탐색 화면 · 보드 생성 템플릿 |
| `sim_engine.js` · `sim_ui.js` | 조건부 액세스 정책 시뮬레이터(평가 엔진 · 콤보박스 UI) |
| `entra-edu-board.html` | 생성물(단독 실행 HTML) |
| [`split/`](split/) | 다른 제품의 기존 분리본 원고 — 참고용 |

다른 제품의 초안 보드와 생성 방법은 [저장소 README](../README.md)를 참고하세요. 분리본은 아직 검증 및 시나리오 작성이 필요합니다.

## 빌드와 확인

```bash
python3 -m pip install -r ../requirements.txt  # 저장소 루트의 빌드 의존성
python3 build_board.py                      # 원본/ → entra-edu-board.html, "점검 경고 0건"이어야 함
python3 build_board.py 원본 /tmp/out.html   # 출력 경로 지정
python3 build_board.py 원본 /tmp/out.html --write-md /tmp/all.md   # 단일 MD로 합쳐 보기
python3 -m http.server 8765                 # http://127.0.0.1:8765/entra-edu-board.html
```

- 딥링크: `?f=<기능 제목 일부>&l3=<탭 번호>&l4=<시나리오 번호>&route=<경로 번호>` · 조건부 액세스 시뮬레이터는 `?f=조건부&l3=1&p=<예시번호>`
- 문서로 확인하지 못한 항목은 원본에 `[확인 필요]`로 표시되어 있습니다.
- 출처는 카드형 토글에 Microsoft Learn 한국어 페이지의 H1 제목으로 표시합니다. 한국어 H1이 없는 문서는 번역과 원문을 함께 표시합니다. 제목은 `source_titles_ko.json`, 번역은 `source_title_translations.json`에 저장해 오프라인에서도 표시합니다. 새 출처를 추가한 뒤 `python3 refresh_source_titles.py`로 제목을 가져오고 필요하면 번역을 추가한 다음 보드를 다시 빌드합니다. 가져오지 못한 제목은 `[문서 제목 확인 필요]`로 표시됩니다.

## 원본 구조

원본은 파일 하나가 너무 커지지 않도록 **주제 폴더 → 기능별 MD**로 나뉘어 있습니다. 주제 폴더는 왼쪽 블레이드의 그룹과 같습니다(기능의 `메뉴(Admin Center)` 첫 단어가 그룹).

```text
원본/
├─ 00-보드-규격.md                  보드 규격(V1~V6)과 L1 머리 — 맨 앞에 와야 하는 파일
├─ 01-개요/                         주제 폴더(번호 = 블레이드 그룹 순서)
│   └─ 01-개요-권장-사항.md         기능 하나 = 파일 하나 (## L2 …)
├─ 04-보호/
│   ├─ 01-조건부-액세스/            800줄이 넘는 기능은 폴더로 나눠 L3 단위 파일로 둡니다
│   │   ├─ 01-개요.md               L2 머리(설정·강제·증적·메뉴·라이선스)
│   │   ├─ 02-0-기능-상태-전이.md   L3 0 (⓪ ① ②)
│   │   ├─ 03-S-정책-시뮬레이터-00-머리.md       시뮬레이터 소개·예시 정책
│   │   ├─ 03-S-정책-시뮬레이터-01-state.md …    시뮬레이터 옵션 그룹별 파일
│   │   └─ 04-A-정책-평가-엔진.md …
│   └─ 02-CAE.md …
└─ …
```

- `build_board.py`는 `원본/` 아래 모든 `*.md`(README 제외)를 **경로의 번호 접두사 순서**로 이어 붙입니다. 파일을 나눈 경계는 제목 줄(`## L2`, `### L3`, `#### 그룹`) 앞이어야 합니다.
- 기능 파일은 `## L2 · 제목 — 한 줄 소개`로 시작하고, `- 메뉴(Admin Center): <그룹> > …` 줄이 있어야 합니다. 블레이드 안의 그룹 순서는 `MainBoard.html`의 `GROUP_ORDER`가 정하고, 같은 그룹 안의 기능 순서는 파일 번호 순서입니다.
- 작성 규칙(Task 노드 형식, 분기·`- 시나리오:` 요약 줄 규칙, 깊이 기준)은 [`원본/00-보드-규격.md`](원본/00-보드-규격.md)의 V5입니다. `build_board.py`가 규칙 위반을 `점검 경고`로 알려 줍니다.

### 기능 추가·수정 방법

1. 주제 폴더 안에 `NN-기능명.md`를 만들거나 기존 파일을 고칩니다. 번호는 그 주제 안의 표시 순서입니다.
2. `python3 build_board.py`로 `점검 경고 0건`을 확인합니다.
3. 새 주제(블레이드 그룹)를 만들면 `MainBoard.html`의 `GROUP_ORDER`에도 그룹 이름을 넣습니다. 목록에 없으면 블레이드 맨 아래에 놓입니다.
4. 생성된 `entra-edu-board.html`을 함께 커밋합니다.

## 기능 목록

주제(블레이드 그룹) 순서이고, 기능은 주제 안의 파일 순서입니다. 링크가 폴더인 기능은 L3 단위 파일로 나뉘어 있습니다.

| 주제 | 기능 | 한 줄 소개 | 원본 위치 |
| --- | --- | --- | --- |
| 개요 | 개요 · 권장 사항 | Identity Secure Score | [`01-개요/01-개요-권장-사항.md`](원본/01-개요/01-개요-권장-사항.md) |
| ID | 사용자 · 그룹 | 동적 멤버십 · 그룹 기반 할당 | [`02-ID/01-사용자-그룹.md`](원본/02-ID/01-사용자-그룹.md) |
| ID | 디바이스 ID | Join · 등록 · 디바이스 설정 | [`02-ID/02-디바이스-ID.md`](원본/02-ID/02-디바이스-ID.md) |
| ID | 역할 · 관리 단위 | 최소 권한 · 범위 위임 | [`02-ID/03-역할-관리-단위.md`](원본/02-ID/03-역할-관리-단위.md) |
| ID | 워크로드 ID | 서비스 주체 · 관리 ID · 앱 자격 증명 | [`02-ID/04-워크로드-ID.md`](원본/02-ID/04-워크로드-ID.md) |
| 애플리케이션 | 앱 동의 관리 | OAuth 권한 부여 통제 | [`03-애플리케이션/01-앱-동의-관리.md`](원본/03-애플리케이션/01-앱-동의-관리.md) |
| 애플리케이션 | SSO · SCIM | SaaS 로그인 · 계정 수명 주기 | [`03-애플리케이션/02-SSO-SCIM.md`](원본/03-애플리케이션/02-SSO-SCIM.md) |
| 애플리케이션 | 애플리케이션 프록시 | 사내 웹 앱 게시 | [`03-애플리케이션/03-애플리케이션-프록시.md`](원본/03-애플리케이션/03-애플리케이션-프록시.md) |
| 보호 | 조건부 액세스 | 누가 · 기기 · 위치 · 앱 → 판단 | [`04-보호/01-조건부-액세스/`](원본/04-보호/01-조건부-액세스/) |
| 보호 | CAE | 위험 · 퇴사 시 세션 회수 | [`04-보호/02-CAE.md`](원본/04-보호/02-CAE.md) |
| 보호 | ID Protection | 사용자 위험 · 로그인 위험 | [`04-보호/03-ID-Protection.md`](원본/04-보호/03-ID-Protection.md) |
| 보호 | 암호 재설정 (SSPR) | 셀프서비스 암호 재설정 | [`04-보호/04-암호-재설정-SSPR.md`](원본/04-보호/04-암호-재설정-SSPR.md) |
| 보호 | 암호 보호 · 스마트 잠금 | 약한 암호 · 무차별 대입 방어 | [`04-보호/05-암호-보호-스마트-잠금.md`](원본/04-보호/05-암호-보호-스마트-잠금.md) |
| ID 거버넌스 | PIM | 관리자 역할 JIT 활성화 | [`05-ID-거버넌스/01-PIM.md`](원본/05-ID-거버넌스/01-PIM.md) |
| ID 거버넌스 | 액세스 패키지 | 권한 관리(Entitlement Management) | [`05-ID-거버넌스/02-액세스-패키지.md`](원본/05-ID-거버넌스/02-액세스-패키지.md) |
| ID 거버넌스 | 액세스 검토 | 주기적 권한 재확인 | [`05-ID-거버넌스/03-액세스-검토.md`](원본/05-ID-거버넌스/03-액세스-검토.md) |
| ID 거버넌스 | 수명 주기 워크플로 | 입사 · 이동 · 퇴사 자동화 | [`05-ID-거버넌스/04-수명-주기-워크플로.md`](원본/05-ID-거버넌스/04-수명-주기-워크플로.md) |
| 외부 ID | 외부 ID · 테넌트 간 액세스 | B2B 협업 · 신뢰 설정 | [`06-외부-ID/01-외부-ID-테넌트-간-액세스.md`](원본/06-외부-ID/01-외부-ID-테넌트-간-액세스.md) |
| 하이브리드 관리 | 동기화 경로 | AD → Entra ID 개체 반영 | [`07-하이브리드-관리/01-동기화-경로/`](원본/07-하이브리드-관리/01-동기화-경로/) |
| 하이브리드 관리 | 인증 경로 | PHS · PTA · 페더레이션 | [`07-하이브리드-관리/02-인증-경로/`](원본/07-하이브리드-관리/02-인증-경로/) |
| Global Secure Access | Global Secure Access 클라이언트 | 설치 · 배포 · 진단 | [`08-Global-Secure-Access/01-Global-Secure-Access-클라이언트.md`](원본/08-Global-Secure-Access/01-Global-Secure-Access-클라이언트.md) |
| Global Secure Access | 원격 네트워크 | 지점 연결(IPsec) · 클라이언트 없는 접속 | [`08-Global-Secure-Access/02-원격-네트워크.md`](원본/08-Global-Secure-Access/02-원격-네트워크.md) |
| Global Secure Access | 트래픽 전달 프로필 | 평가 순서 · 우선순위 · 사용자 할당 | [`08-Global-Secure-Access/03-트래픽-전달-프로필.md`](원본/08-Global-Secure-Access/03-트래픽-전달-프로필.md) |
| Global Secure Access | Microsoft 트래픽 프로필 | Microsoft 365 · Entra 트래픽 최적 라우팅 | [`08-Global-Secure-Access/04-Microsoft-트래픽-프로필.md`](원본/08-Global-Secure-Access/04-Microsoft-트래픽-프로필.md) |
| Global Secure Access | Entra Internet Access | AI 범주 웹 차단 · Copilot 예외 | [`08-Global-Secure-Access/05-Entra-Internet-Access.md`](원본/08-Global-Secure-Access/05-Entra-Internet-Access.md) |
| Global Secure Access | Private Access | 사내 앱 제로 트러스트 접근 | [`08-Global-Secure-Access/06-Private-Access.md`](원본/08-Global-Secure-Access/06-Private-Access.md) |
| Global Secure Access | 애플리케이션 | 앱 검색 · Private DNS · 엔터프라이즈 앱 연결 | [`08-Global-Secure-Access/07-애플리케이션.md`](원본/08-Global-Secure-Access/07-애플리케이션.md) |
| Global Secure Access | 위협 인텔리전스 · 보안 프로필 | 악성 대상 차단과 정책 묶음 | [`08-Global-Secure-Access/08-위협-인텔리전스-보안-프로필.md`](원본/08-Global-Secure-Access/08-위협-인텔리전스-보안-프로필.md) |
| Global Secure Access | TLS 검사 | 암호화 트래픽 복호화 · 인증서 신뢰 | [`08-Global-Secure-Access/09-TLS-검사.md`](원본/08-Global-Secure-Access/09-TLS-검사.md) |
| Global Secure Access | 네트워크 콘텐츠 · 클라우드 방화벽 | 콘텐츠 정책과 네트워크 계층 통제 | [`08-Global-Secure-Access/10-네트워크-콘텐츠-클라우드-방화벽.md`](원본/08-Global-Secure-Access/10-네트워크-콘텐츠-클라우드-방화벽.md) |
| Global Secure Access | 적응형 액세스 · 세션 관리 | 규격 네트워크 · 소스 IP 복원 · CA 신호 | [`08-Global-Secure-Access/11-적응형-액세스-세션-관리.md`](원본/08-Global-Secure-Access/11-적응형-액세스-세션-관리.md) |
| Global Secure Access | 모니터링 · 대시보드 | 대시보드 · 보강된 로그 · 통합 문서 · 상태 | [`08-Global-Secure-Access/12-모니터링-대시보드.md`](원본/08-Global-Secure-Access/12-모니터링-대시보드.md) |
| 에이전트 ID | Agent ID | AI 에이전트 신원 [미리 보기 확인 필요] | [`09-에이전트-ID/01-Agent-ID.md`](원본/09-에이전트-ID/01-Agent-ID.md) |
| Verified ID | Verified ID | 검증 가능한 자격 증명 | [`10-Verified-ID/01-Verified-ID.md`](원본/10-Verified-ID/01-Verified-ID.md) |
| 모니터링 및 상태 | 로그 · 모니터링 | 진단 설정 · 보관 · 분석 | [`11-모니터링-및-상태/01-로그-모니터링.md`](원본/11-모니터링-및-상태/01-로그-모니터링.md) |
| Entra ID | 인증 방법 | MFA · 패스키 · Windows Hello | [`12-Entra-ID/01-인증-방법.md`](원본/12-Entra-ID/01-인증-방법.md) |
| Entra ID | 약관(Terms of use) | 접근 전 동의 요구 | [`12-Entra-ID/02-약관-Terms-of-use.md`](원본/12-Entra-ID/02-약관-Terms-of-use.md) |

> `12-Entra-ID/`의 두 기능은 메뉴 줄의 그룹 이름이 `Entra ID`여서 `GROUP_ORDER`에 없는 그룹으로 취급되어 블레이드 맨 아래에 나옵니다. 포털 메뉴 위치(예: 보호)로 바로잡으면 해당 주제 폴더로 옮길 수 있습니다.
