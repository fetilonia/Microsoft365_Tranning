#!/usr/bin/env python3
"""편집 원본 MD(교육보드 편집원본*.md)를 파싱해 단일 HTML 교육 보드를 만든다.

사용: python3 build_board.py [원본.md] [출력.html]
기본값: 이 폴더의 '교육보드 편집원본*.md' → 이 폴더의 entra-edu-board.html
"""
import glob
import json
import re
import sys
from pathlib import Path

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
    """parts/*.md를 파일명 순으로 이어 붙인다 (00-head가 맨 앞)."""
    files = sorted(Path(parts_dir).glob("*.md"))
    return "\n".join(f.read_text(encoding="utf-8").rstrip() + "\n" for f in files)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    write_md = None
    if "--write-md" in sys.argv:
        write_md = Path(sys.argv[sys.argv.index("--write-md") + 1])
        args = [a for a in args if a != str(write_md)]
    src = args[0] if args else None
    if not src:
        found = sorted(glob.glob(str(HERE / "교육보드 편집원본*.md")))
        if not found:
            sys.exit("원본 MD를 찾지 못했습니다. 경로를 인자로 주세요.")
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
    tpl = (HERE / "board_template.html").read_text(encoding="utf-8")
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
