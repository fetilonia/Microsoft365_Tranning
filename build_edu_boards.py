#!/usr/bin/env python3
"""Build workload draft boards from their feature Markdown files."""
import importlib.util
import json
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent
ENTRA = ROOT / "entra-edu-board"
spec = importlib.util.spec_from_file_location("entra_board", ENTRA / "build_board.py")
board = importlib.util.module_from_spec(spec)
spec.loader.exec_module(board)

BOARDS = {
    "intune": "Microsoft Intune admin center",
    "purview": "Microsoft Purview portal",
    "defender": "Microsoft Defender",
    "copilot": "Microsoft Copilot",
}


def _strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for item in value.values():
            yield from _strings(item)
    elif isinstance(value, (list, tuple)):
        for item in value:
            yield from _strings(item)


def annotate_scenario_evidence(data):
    for product in data:
        for feature in product["l2"]:
            for l3 in feature["l3"]:
                shared_urls = board.l3_source_urls(l3)
                for scenario in l3["l4"]:
                    urls = shared_urls | board.note_source_urls(scenario.get("notes", []))
                    official_sources = sorted(
                        url for url in urls
                        if urlsplit(url).hostname
                        and (
                            urlsplit(url).hostname.lower() == "microsoft.com"
                            or urlsplit(url).hostname.lower().endswith(".microsoft.com")
                            or urlsplit(url).hostname.lower() == "aka.ms"
                        )
                    )
                    evidence_text = "\n".join(_strings({
                        "l3_desc": l3["desc"],
                        "l3_notes": l3["notes"],
                        "scenario": scenario,
                    }))
                    scenario["evidence"] = {
                        "educational_example": True,
                        "official_sources": official_sources,
                        "needs_check": not official_sources or "확인 필요" in evidence_text,
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
    annotate_scenario_evidence(data)

    template = board.insert_source_titles(board.sync_main_board(), data)
    old_title = "<title>Microsoft 365 교육 보드</title>"
    old_heading = "<h1>교육 보드 · Microsoft Entra Admin Center › 기능별 데이터 흐름</h1>"
    intro = "왼쪽에서 기능을 고르면, 기능이 꺼져 있을 때부터 켜진 뒤까지의 시나리오 흐름이 가운데에 나옵니다. 시나리오 버튼을 누르면 그 흐름만 재생합니다."
    draft_intro = (
        "왼쪽에서 기능을 고르면 L3 분류와 L4 시나리오 흐름이 가운데에 표시됩니다. "
        "시나리오 버튼을 누르면 그 흐름만 재생합니다. 공식 문서 출처와 교육 예시는 구분하고, "
        "[확인 필요] 항목은 대상 테넌트에서 확인하세요."
    )
    if name == "purview":
        draft_intro = (
            "Information Protection 솔루션 카드를 열어 기능을 선택하세요. 분류 기능에는 공식 문서에 근거한 "
            "네 가지 분류 시나리오가 있으며, 실제 선택 경로가 있는 경우에만 분기됩니다. "
            "테넌트별 조건은 [확인 필요] 표시와 원고 출처를 확인하세요."
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
