#!/usr/bin/env python3
"""편집 원본 MD(교육보드 편집원본*.md)를 파싱해 단일 HTML 교육 보드를 만든다.

사용: python3 build_board.py [원본 디렉터리 또는 .md] [출력.html]
기본값: 이 폴더의 '원본/'(주제 폴더 → 기능별 MD, 번호 순서로 이어 붙임) → 이 폴더의 entra-edu-board.html
--write-md <파일>: 원본 디렉터리를 단일 MD로 합쳐 함께 내보냄
"""
import glob
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlsplit

HERE = Path(__file__).resolve().parent
NODE = re.compile(r"^(\d+)\.\s*\[(시작|처리|판단|차단|끝)\]\s*(.*)$")
INLINE = re.compile(r"^\[(시작|처리|판단|차단|끝)\]\s*(.*)$")
META = re.compile(r"^- (설정|강제|증적|메뉴|라이선스)\([^)]*\):\s*(.*)$")
FIELD = re.compile(r"^(주체|위치|데이터|해설):\s*(.*)$")
WARN = []


def split_dash(s):
    if " — " in s:
        a, b = s.split(" — ", 1)
        return a.strip(), b.strip()
    return s.strip(), ""


def finalize_l4(l4, where):
    nodes = l4.pop("_nodes")
    edges, blocks = [], []
    ids = {n["id"] for n in nodes}
    for idx, n in enumerate(nodes):
        branches = n.pop("_br")
        if branches:
            for label, target in branches:
                if target.isdigit():
                    if target not in ids:
                        WARN.append(f"{where}: 노드 {n['id']} 분기 대상 {target} 없음")
                        continue
                    edges.append({"from": n["id"], "to": target, "label": "" if label == "다음" else label})
                else:
                    m = INLINE.match(target)
                    typ, rest = (m.group(1), m.group(2)) if m else ("차단", target)
                    title, sub = split_dash(rest)
                    bid = f"b{len(blocks) + 1}"
                    blocks.append({"id": bid, "type": typ, "title": title, "sub": sub, "narr": "",
                                   "actor": "", "ui": "", "data": ""})
                    edges.append({"from": n["id"], "to": bid, "label": label})
        elif n["type"] not in ("끝", "차단") and idx + 1 < len(nodes):
            edges.append({"from": n["id"], "to": nodes[idx + 1]["id"], "label": ""})
    l4["nodes"] = nodes + blocks
    l4["edges"] = edges


RSUM = re.compile(r"^- 시나리오: (.+?) :: (.+)$")
KEYSEP = " ▸ "


def enum_routes(l4):
    """보드(JS enumRoutes)와 같은 규칙으로 경로를 센다. key = 분기 지점에서 고른 선택지 라벨을 ' ▸ '로 이은 값."""
    nodes = {n["id"]: n for n in l4["nodes"]}
    out = {}
    for e in l4["edges"]:
        out.setdefault(e["from"], []).append(e)
    branch = lambda i: len([e for e in out.get(i, []) if e["label"]]) >= 2
    res = []

    def dfs(i, pn, pe):
        if len(res) >= 12:
            return
        es = out.get(i, [])
        if not es:
            res.append((pn, pe))
            return
        for e in es:
            if e["to"] not in pn:
                dfs(e["to"], pn + [e["to"]], pe + [e])

    first = l4["nodes"][0]["id"]
    dfs(first, [first], [])
    routes = []
    for pn, pe in res:
        routes.append({"nodes": pn, "key": KEYSEP.join(e["label"] for e in pe if branch(e["from"])),
                       "steps": [(nodes[e["from"]]["title"], e["label"]) for e in pe if branch(e["from"])],
                       "end": nodes[pn[-1]]["title"], "blocked": nodes[pn[-1]]["type"] == "차단"})
    return routes


def parse(text):
    l1s, l1, l2, l3, l4, node = [], None, None, None, None, None
    simg = simo = None
    cur_where = ""

    def close_l4():
        nonlocal l4
        if l4 is not None:
            finalize_l4(l4, cur_where)
        l4 = None

    for raw in text.split("\n"):
        line = raw.rstrip()
        if line.startswith("# L1 ·"):
            close_l4()
            m = re.match(r"# L1 · (\S+) · (.*)", line)
            name, desc = split_dash(m.group(2))
            l1 = {"id": m.group(1), "name": name, "desc": desc, "l2": []}
            l1s.append(l1)
            l2 = l3 = node = None
            continue
        if line.startswith("# "):
            close_l4()
            l1 = l2 = l3 = node = None
            continue
        if l1 is None:
            continue
        if line.startswith("## L2 ·"):
            close_l4()
            title, desc = split_dash(line[len("## L2 ·"):].strip())
            l2 = {"title": title, "desc": desc, "set": [], "enf": [], "evi": [],
                  "menu": "", "group": "", "license": "", "l3": []}
            l1["l2"].append(l2)
            l3 = node = None
            continue
        if l2 is None:
            continue
        if line.startswith("### L3 ·"):
            close_l4()
            m = re.match(r"### L3 · (\S+) · (.*)", line)
            name, desc = split_dash(m.group(2))
            l3 = {"id": m.group(1), "label": name if m.group(1) == "0" else f"{m.group(1)} · {name}",
                  "desc": desc, "l4": [], "notes": []}
            if m.group(1) == "S":
                l3["sim"] = {"presets": [], "groups": [], "intro": ""}
                simg = simo = None
            l2["l3"].append(l3)
            node = None
            continue
        if line.startswith("### L3"):
            close_l4()
            l3 = node = None
            continue
        if l3 is not None and l3.get("sim") is not None:
            sim = l3["sim"]
            if line.startswith("##### 옵션 ·"):
                m = re.match(r"##### 옵션 · (\S+) · (.*)", line)
                simo = {"id": m.group(1), "label": m.group(2).strip(), "f": {}}
                simg["options"].append(simo)
            elif line.startswith("#### 그룹 ·"):
                m = re.match(r"#### 그룹 · (\S+) · (.*)", line)
                simg = {"key": m.group(1), "title": m.group(2).strip(), "f": {}, "options": []}
                sim["groups"].append(simg)
                simo = None
            elif line.startswith(">"):
                body = line.lstrip(">").strip()
                m = re.match(r"^([^:：]{1,10})[:：]\s*(.*)$", body)
                if m:
                    l3["notes"].append({"kind": m.group(1).strip(), "text": m.group(2).strip()})
            else:
                m = re.match(r"^- ([^:：]{1,14}):\s*(.*)$", line)
                if m:
                    k, v = m.group(1).strip(), m.group(2).strip()
                    if k == "프리셋":
                        parts = [x.strip() for x in v.split(" :: ")]
                        if len(parts) >= 3:
                            sim["presets"].append({"name": parts[0], "desc": parts[1], "policy": parts[2],
                                                   "test": parts[3] if len(parts) > 3 else "",
                                                   "cat": parts[4] if len(parts) > 4 else ""})
                        else:
                            WARN.append(f"{l2['title']}: 프리셋 형식 오류 — {v[:40]}")
                    elif simo is not None:
                        simo["f"][k] = v
                    elif simg is not None:
                        simg["f"][k] = v
                    elif k == "설명":
                        sim["intro"] = v
            continue
        if line.startswith("#### L4 ·"):
            close_l4()
            title, sub = split_dash(line[len("#### L4 ·"):].strip())
            l4 = {"label": title if sub else "", "sub": sub if sub else title, "_nodes": []}
            cur_where = f"{l2['title']} / {l3['label']} / {title}"
            l3["l4"].append(l4)
            node = None
            continue
        if l3 is None:
            m = META.match(line)
            if m:
                key, val = m.groups()
                if key == "라이선스":
                    l2["license"] = val
                elif key == "메뉴":
                    l2["menu"] = val
                    grp = re.sub(r"\[[^\]]*\]", "", val.split(">")[0]).strip()
                    l2["group"] = grp
                else:
                    l2[{"설정": "set", "강제": "enf", "증적": "evi"}[key]] = [x.strip() for x in val.split(" | ")]
            continue
        if line.startswith(">"):
            body = line.lstrip(">").strip()
            m = re.match(r"^([^:：]{1,10})[:：]\s*(.*)$", body)
            if m:
                l3["notes"].append({"kind": m.group(1).strip(), "text": m.group(2).strip()})
            continue
        if l4 is None:
            continue
        m = RSUM.match(line)
        if m:
            l4.setdefault("rsum", {})[m.group(1).strip()] = m.group(2).strip()
            continue
        m = NODE.match(line)
        if m:
            title, sub = split_dash(m.group(3))
            node = {"id": m.group(1), "type": m.group(2), "title": title, "sub": sub, "narr": "",
                    "actor": "", "ui": "", "data": "", "_br": []}
            l4["_nodes"].append(node)
            continue
        m = re.match(r"^\s+- (.*)$", line)
        if m and node is not None:
            body = m.group(1)
            fm = FIELD.match(body)
            if fm:
                node[{"주체": "actor", "위치": "ui", "데이터": "data", "해설": "narr"}[fm.group(1)]] = fm.group(2).strip()
            else:
                b = re.match(r"^(.+?) → (.+)$", body)
                if b:
                    node["_br"].append((b.group(1).strip(), b.group(2).strip()))
    close_l4()
    return l1s


def lint(data):
    """작성 규칙(V5) 점검: 깊이·필수 필드. 경고만 낸다."""
    out = []
    for l1 in data:
        for l2 in l1["l2"]:
            t = l2["title"]
            if not l2["l3"]:
                out.append(f"{t}: L3 없음")
                continue
            if l2["l3"][0]["id"] != "0":
                out.append(f"{t}: 첫 L3가 '0 · 기능 상태 전이'가 아님")
            if len(l2["l3"]) < 2:
                out.append(f"{t}: 핵심 동작 L3(A/B/C)가 없음")
            for l3 in l2["l3"]:
                if l3["id"] == "0" and len(l3["l4"]) != 3:
                    out.append(f"{t}: 0 탭의 L4가 {len(l3['l4'])}개 (3개 필요)")
                for l4 in l3["l4"]:
                    nodes = [n for n in l4["nodes"] if n["id"].isdigit()]
                    lab = (l4["label"] or l4["sub"])[:14]
                    lo = {"⓪": 4, "①": 6, "②": 6}.get(lab[:1], 5)
                    if len(nodes) < lo:
                        out.append(f"{t} / {l3['id']} / {lab}: Task {len(nodes)}개 (최소 {lo})")
                    if len(l4["nodes"]) > 1:
                        rs = enum_routes(l4)
                        if len(rs) > 1:
                            keys = [r["key"] for r in rs]
                            if len(set(keys)) != len(keys):
                                out.append(f"{t} / {l3['id']} / {lab}: 분기 선택지 조합이 같은 경로가 있음")
                            have = l4.get("rsum", {})
                            miss_k = [k for k in keys if k not in have]
                            if miss_k:
                                out.append(f"{t} / {l3['id']} / {lab}: 시나리오 요약 누락 {len(miss_k)}개 (예: {miss_k[0]})")
                            stale = [k for k in have if k not in keys]
                            if stale:
                                out.append(f"{t} / {l3['id']} / {lab}: 시나리오 요약 키가 경로와 안 맞음 ({stale[0]})")
                    miss = [n["id"] for n in nodes if not n["actor"] or not n["narr"]]
                    if miss:
                        out.append(f"{t} / {l3['id']} / {lab}: 주체·해설 누락 노드 {','.join(miss)}")
                    if lab[:1] == "①":
                        noui = [n["id"] for n in nodes if not n["ui"]]
                        if noui:
                            out.append(f"{t} / {l3['id']} / ①: 위치 누락 노드 {','.join(noui)}")
    return out


def assemble(parts_dir):
    """원본 폴더 아래 모든 *.md를 경로 순서(번호 접두사)로 이어 붙인다. 00-보드-규격.md가 맨 앞."""
    root = Path(parts_dir)
    files = sorted(
        (f for f in root.rglob("*.md") if not f.name.upper().startswith("README")),
        key=lambda f: f.relative_to(root).parts,
    )
    return "\n".join(f.read_text(encoding="utf-8").rstrip() + "\n" for f in files)


def source_urls(data):
    urls = set()
    pattern = re.compile(r"https?://[^\s;<>]+")
    for product in data:
        for feature in product["l2"]:
            for tab in feature["l3"]:
                for note in tab["notes"]:
                    if note["kind"] == "출처":
                        urls.update(pattern.findall(note["text"]))
                for group in tab.get("sim", {}).get("groups", []):
                    urls.update(pattern.findall(group["f"].get("출처", "")))
                    for option in group["options"]:
                        urls.update(pattern.findall(option["f"].get("출처", "")))
    return urls


def insert_source_titles(template, data):
    titles = json.loads((HERE / "source_titles_ko.json").read_text(encoding="utf-8"))
    translations = json.loads((HERE / "source_title_translations.json").read_text(encoding="utf-8"))
    missing = sorted(source_urls(data) - titles.keys())
    for url in missing:
        print(f"출처 제목 확인 필요: {url}", file=sys.stderr)
    if missing:
        print(f"출처 제목 확인 필요 {len(missing)}건", file=sys.stderr)
    untranslated = sorted({titles[url] for url in source_urls(data) & titles.keys()
                           if not re.search(r"[가-힣]", titles[url]) and titles[url] not in translations})
    for title in untranslated:
        print(f"출처 제목 한국어 번역 필요: {title}", file=sys.stderr)
    marker = "/*__SOURCE_TITLES__*/{}"
    translation_marker = "/*__SOURCE_TRANSLATIONS__*/{}"
    if marker not in template or translation_marker not in template:
        raise ValueError("MainBoard 출처 제목 영역이 없습니다")
    return (template.replace(marker, json.dumps(titles, ensure_ascii=False).replace("</", "<\\/"))
            .replace(translation_marker, json.dumps(translations, ensure_ascii=False).replace("</", "<\\/")))


def render_readme(text):
    from markdown_it import MarkdownIt

    markdown = MarkdownIt("commonmark", {"html": False}).enable("table")
    default_validate = markdown.validateLink

    def safe_link(url):
        if url.startswith(("//", "\\")):
            return False
        try:
            parts = urlsplit(url)
        except ValueError:
            return False
        return parts.scheme.lower() in ("", "http", "https", "mailto") and default_validate(url)

    markdown.validateLink = safe_link
    tokens = markdown.parse(text)
    slugs = {}
    for index, token in enumerate(tokens):
        if token.type == "heading_open" and index + 1 < len(tokens):
            inline = tokens[index + 1]
            title = "".join(child.content for child in inline.children or []
                            if child.type in ("text", "code_inline"))
            slug = re.sub(r"[^\w -]", "", title.lower()).replace(" ", "-")
            count = slugs.get(slug, 0)
            slugs[slug] = count + 1
            token.attrSet("id", slug if count == 0 else f"{slug}-{count}")
        for child in token.children or []:
            attr = "href" if child.type == "link_open" else "src" if child.type == "image" else None
            if not attr:
                continue
            url = child.attrGet(attr)
            if url and not urlsplit(url).scheme and not url.startswith(("/", "#", "?")):
                child.attrSet(attr, "../" + url)
    return markdown.renderer.render(tokens, markdown.options, {})


def sync_main_board():
    path = HERE / "MainBoard.html"
    template = path.read_text(encoding="utf-8")
    readme_html = render_readme((HERE.parent / "README.md").read_text(encoding="utf-8"))
    readme = json.dumps(readme_html, ensure_ascii=False).replace("</", "<\\/")
    pattern = r'(<script id="readme-data" type="application/json">).*?(</script>)'
    template, count = re.subn(pattern, lambda m: m.group(1) + readme + m.group(2), template, count=1, flags=re.S)
    if count != 1:
        raise ValueError("MainBoard README 데이터 영역이 없습니다")
    if template != path.read_text(encoding="utf-8"):
        path.write_text(template, encoding="utf-8")
    return template


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    write_md = None
    if "--write-md" in sys.argv:
        write_md = Path(sys.argv[sys.argv.index("--write-md") + 1])
        args = [a for a in args if a != str(write_md)]
    src = args[0] if args else None
    if not src:
        if (HERE / "원본").is_dir():
            src = str(HERE / "원본")
        else:
            found = sorted(glob.glob(str(HERE / "교육보드 편집원본*.md")))
            if not found:
                sys.exit("원본을 찾지 못했습니다. 경로를 인자로 주세요.")
            src = found[0]
    out = Path(args[1]) if len(args) > 1 else HERE / "entra-edu-board.html"
    if Path(src).is_dir():
        text = assemble(src)
        if write_md:
            write_md.write_text(text, encoding="utf-8")
            print("원본 MD 작성:", write_md)
    else:
        text = Path(src).read_text(encoding="utf-8")
    partial = "# L1 ·" not in text
    if partial:
        text = "# L1 · 99 · PART\n\n" + text
    data = parse(text)
    if partial:
        lw = lint(data)
        n_l2 = sum(len(x["l2"]) for x in data)
        n_nodes = sum(len(l4["nodes"]) for x in data for b in x["l2"] for a in b["l3"] for l4 in a["l4"])
        print(f"[파트 점검] L2 {n_l2}개 · Task 노드 {n_nodes}개")
        for w in WARN + lw:
            print("점검:", w)
        print(f"점검 경고 {len(WARN) + len(lw)}건")
        return
    tpl = insert_source_titles(sync_main_board(), data)
    payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    sim_js = (HERE / "sim_engine.js").read_text(encoding="utf-8") + "\n" + (HERE / "sim_ui.js").read_text(encoding="utf-8")
    out.write_text(tpl.replace("/*__DATA__*/null", payload).replace("/*__SIM__*/", sim_js), encoding="utf-8")
    n_l2 = sum(len(x["l2"]) for x in data)
    n_l4 = sum(len(a["l4"]) for x in data for b in x["l2"] for a in b["l3"])
    print(f"원본: {src}\n출력: {out}\nL1 {len(data)} · L2 {n_l2} · L4(시나리오) {n_l4}")
    for w in WARN:
        print("경고:", w)
    lw = lint(data)
    for w in lw:
        print("점검:", w)
    print(f"점검 경고 {len(lw)}건")


if __name__ == "__main__":
    main()
