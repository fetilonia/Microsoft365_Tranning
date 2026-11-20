# Entra Admin Center 교육 보드

Microsoft Entra Admin Center(Entra ID 워크로드)의 기능별 데이터 흐름을 보여 주는 교육 보드입니다. 편집 원본 MD를 파서가 단일 HTML로 만듭니다.

| 파일 | 역할 |
| --- | --- |
| `교육보드 편집원본 — E0 기능 57개와 E1 조건부 액세스 로직.md` | 내용의 원본(보드 규격, 37개 기능(Global Secure Access 10개 포함), 조건부 액세스 시뮬레이터 카탈로그·예시 정책) |
| `build_board.py` | MD 파싱 · 점검(lint) · HTML 조립 |
| `board_template.html` | 화면 · 도식 레이아웃 · 애니메이션 |
| `sim_engine.js` · `sim_ui.js` | 조건부 액세스 정책 시뮬레이터(평가 엔진 · 콤보박스 UI) |
| `entra-edu-board.html` | 생성물(단독 실행 HTML) |
| `split/` | 다른 제품(Intune · Purview · Defender · Copilot) 분리본 — 아직 보드로 만들지 않음 |

## 빌드와 확인

```bash
python3 build_board.py          # 같은 폴더의 원본 MD → entra-edu-board.html, "점검 경고 0건"이어야 함
python3 -m http.server 8765     # http://127.0.0.1:8765/entra-edu-board.html
```

- 딥링크: `?f=조건부&l3=1&p=<예시번호>` (조건부 액세스 시뮬레이터의 예시 정책)
- 시뮬레이터 구성도는 기본으로 이 로그인이 실제로 지나는 단계만 그리고, 결과 패널의 `전체 평가 구조 보기`로 전체 가지를 봅니다.
- 문서로 확인하지 못한 항목은 원본에 `[확인 필요]`로 표시되어 있습니다.
