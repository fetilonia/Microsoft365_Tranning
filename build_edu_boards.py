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

    template = board.insert_source_titles(board.sync_main_board(), data)
    old_title = "<title>교육 보드 · Microsoft Entra Admin Center — 기능별 데이터 흐름</title>"
    old_heading = "<h1>교육 보드 · Microsoft Entra Admin Center › 기능별 데이터 흐름</h1>"
    intro = "왼쪽에서 기능을 고르면, 기능이 꺼져 있을 때부터 켜진 뒤까지의 시나리오 흐름이 가운데에 나옵니다. 시나리오 버튼을 누르면 그 흐름만 재생합니다."
    draft_intro = (
        "초안: 기능별 원고의 설정 · 강제 · 증적을 표시합니다. "
        "내용과 최신 문서는 검증이 필요하며, 시나리오와 메뉴 · 라이선스는 아직 작성되지 않았습니다."
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
