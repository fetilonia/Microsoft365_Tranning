# Microsoft365_Tranning

Microsoft 365 전반에 걸친 트레이닝 보드를 구축하고, 이를 바탕으로 내부 커리큘럼의 초안을 만드는 저장소입니다.

각 보드는 기능을 고르면 "기능이 꺼져 있을 때 → 구성할 때 → 켠 뒤"의 시나리오별 데이터 흐름을 애니메이션으로 보여 주는 단독 실행 HTML입니다. 내용의 원본은 Markdown이고, 파서가 HTML로 만듭니다. 사실 근거는 Microsoft Learn 공식 문서이며, 확인하지 못한 항목은 원본에 `[확인 필요]`로 표시합니다.

## 구성

| 폴더 | 내용 | 상태 |
| --- | --- | --- |
| [`entra-edu-board/`](entra-edu-board/) | Microsoft Entra Admin Center(Entra ID 워크로드) 교육 보드 — 기능 37개, 시나리오 261개 | 작성 중 |
| [`entra-edu-board/split/`](entra-edu-board/split/) | 다른 제품(Intune · Purview · Defender XDR · Defender for Cloud · Copilot/Graph) 분리본 원고 | 아직 보드로 만들지 않음 |

제품 하나당 보드 하나를 두는 방식으로 나눕니다. 한 보드에 모든 제품을 담지 않습니다.

## 빠른 시작

```bash
cd entra-edu-board
python3 build_board.py            # 원본/ → entra-edu-board.html, "점검 경고 0건"이어야 함
python3 -m http.server 8765       # http://127.0.0.1:8765/entra-edu-board.html
```

자세한 구조와 편집 방법은 [`entra-edu-board/README.md`](entra-edu-board/README.md)를 보세요.
