#!/usr/bin/env python3
"""Build workload draft boards from their feature Markdown files."""
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ENTRA = ROOT / "entra-edu-board"
spec = importlib.util.spec_from_file_location("entra_board", ENTRA / "build_board.py")
board = importlib.util.module_from_spec(spec)
spec.loader.exec_module(board)

BOARDS = {
    "intune": "Intune",
    "purview": "Purview",
    "defender": "Defender",
    "copilot": "Copilot · Graph",
}


def build(name, destination):
    title = BOARDS[name]
    source = ROOT / f"edu-{name}-board" / "원본"
    board.WARN.clear()
    if not source.is_dir():
        raise ValueError(f"{source}: 원본 디렉터리가 없습니다")
    data = board.parse(board.assemble(source))
    if not data or not any(product["l2"] for product in data):
        raise ValueError(f"{source}: 기능을 읽지 못했습니다")
    if board.WARN:
        raise ValueError("\n".join(board.WARN))
    for product in data:
        for feature in product["l2"]:
            main_count = sum(
                (scenario.get("label") or "").startswith("▶")
                for stage in feature["l3"]
                for scenario in stage["l4"]
            )
            if main_count != 1:
                raise ValueError(
                    f"{title} · {feature['title']}: 메인 시나리오(▶)는 "
                    f"정확히 1개여야 합니다 (현재 {main_count}개)"
                )

    template = board.insert_source_titles(board.sync_main_board(), data)
    old_title = "<title>Microsoft 365 교육 보드</title>"
    old_heading = "<h1>교육 보드 · Microsoft Entra Admin Center › 기능별 데이터 흐름</h1>"
    intro = "왼쪽에서 기능을 고르면, 기능이 꺼져 있을 때부터 켜진 뒤까지의 시나리오 흐름이 가운데에 나옵니다. 시나리오 버튼을 누르면 그 흐름만 재생합니다."
    draft_intro = (
        "초안: 기능별 시나리오와 설정 · 강제 · 증적을 작성했습니다. "
        "일부 제품 동작, 포털 메뉴, 라이선스와 테넌트별 조건은 공식 문서 또는 환경 대조가 남아 있습니다. "
        "완성된 교육 자료로 사용하기 전에 원고의 [확인 필요] 항목을 검토하세요."
    )
    nav = "$('#prev').disabled = idx<=0; $('#next').disabled = idx>=FLAT.length-1;"
    if old_title not in template or old_heading not in template or intro not in template or nav not in template:
        raise ValueError("Entra 템플릿의 제목 또는 안내 문구가 변경되었습니다")
    template = template.replace(old_title, f"<title>교육 보드 · {title} — 기능별 데이터 흐름</title>")
    template = template.replace(old_heading, f"<h1>교육 보드 · {title} › 기능별 데이터 흐름</h1>")
    template = template.replace(intro, draft_intro)
    template = template.replace(nav, nav + "\n  $('#restart').disabled = !view;")
    payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    sim = (ENTRA / "sim_engine.js").read_text(encoding="utf-8") + "\n" + (
        ENTRA / "sim_ui.js"
    ).read_text(encoding="utf-8")
    template = template.replace("/*__DATA__*/null", payload).replace("/*__SIM__*/", sim)
    destination.write_text(template, encoding="utf-8")
    missing = sum(not feature["l3"] for product in data for feature in product["l2"])
    print(f"{destination}: 기능 {sum(len(product['l2']) for product in data)}개, 시나리오 미작성 {missing}개")
    print(f"  Entra 보드 규격 점검: 경고 {len(board.lint(data))}건 (미완성 원고 포함)")


def main():
    for name in BOARDS:
        build(name, ROOT / f"edu-{name}-board" / f"edu-{name}-board.html")


if __name__ == "__main__":
    main()
