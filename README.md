# Microsoft365_Tranning

Microsoft 365 전반에 걸친 트레이닝 보드를 구축하고, 이를 바탕으로 내부 커리큘럼의 초안을 만드는 저장소입니다.

각 보드는 Markdown 원고에서 생성하는 단독 실행 HTML입니다. Entra 보드는 기능을 고르면 "기능이 꺼져 있을 때 → 구성할 때 → 켠 뒤"의 시나리오별 데이터 흐름을 애니메이션으로 보여 줍니다. 다른 보드는 분리 원고의 설정 · 강제 · 증적만 담은 검증 전 초안으로, 시나리오와 출처는 아직 작성되지 않았습니다.

## 구성

| 폴더 | 내용 | 상태 |
| --- | --- | --- |
| [`entra-edu-board/`](entra-edu-board/) | Microsoft Entra Admin Center(Entra ID 워크로드) 교육 보드 — 기능 37개, 시나리오 261개 | 작성 중 |
| [`edu-intune-board/`](edu-intune-board/) | Intune | 초안 |
| [`edu-purview-board/`](edu-purview-board/) | Purview | 초안 |
| [`edu-defender-board/`](edu-defender-board/) | Defender XDR · Defender for Cloud | 초안 |
| [`edu-copilot-board/`](edu-copilot-board/) | Copilot · Graph | 초안 |
| 각 보드의 `원본/` | 기능별 편집 원고 | 검증 및 시나리오 작성 필요 |
| [`entra-edu-board/split/`](entra-edu-board/split/) | 기존 분리본 원고 | 참고용 |

제품별 보드를 나눕니다. Defender 보드는 XDR과 Defender for Cloud를 별도 섹션으로 담습니다.

## 빠른 시작

[`MainBoard.html`](MainBoard.html)을 열면 프로젝트 소개와 워크로드별 보드를 볼 수 있습니다. GitHub Pages에서는 사이트 루트에서도 메인 보드로 이동합니다.

```bash
python3 -m pip install -r requirements.txt
cd entra-edu-board
python3 build_board.py            # 원본/ → entra-edu-board.html, "점검 경고 0건"이어야 함
cd ..
python3 -m http.server 8765       # http://127.0.0.1:8765/
```

자세한 구조와 편집 방법은 [`entra-edu-board/README.md`](entra-edu-board/README.md)를 보세요.

다른 네 초안 보드를 다시 만들려면 저장소 루트에서 `python3 build_edu_boards.py`를 실행하세요. 각 보드의 `원본/`에서 기능별 MD를 편집하며, 기존 `split/` 파일은 참고용입니다. 원고의 내용을 Microsoft Learn으로 검증하고 메뉴 · 라이선스 · 출처와 L3/L4 시나리오를 채우기 전에는 완성된 교육 자료로 사용하지 마세요.

메인 보드의 프로젝트 소개는 이 README의 빌드 시점 복사본입니다. README를 수정한 뒤 Entra 또는 초안 보드를 다시 빌드하면 함께 갱신됩니다.

공유 미리보기 이미지는 [Kenney Mini Characters](https://kenney.nl/assets/mini-characters)의 캐릭터 렌더를 사용합니다 (CC0).
