#!/usr/bin/env python3
"""Refresh cached Microsoft Learn H1 titles used by the offline board."""
import concurrent.futures
import json
import re
import sys
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

import build_board

HERE = Path(__file__).resolve().parent
CACHE = HERE / "source_titles_ko.json"


class FirstHeading(HTMLParser):
    def __init__(self):
        super().__init__()
        self.active = False
        self.finished = False
        self.text = []

    def handle_starttag(self, tag, attrs):
        if tag == "h1" and not self.finished:
            self.active = True

    def handle_endtag(self, tag):
        if tag == "h1" and self.active:
            self.active = False
            self.finished = True

    def handle_data(self, data):
        if self.active:
            self.text.append(data)


def fetch(url):
    parts = urllib.parse.urlsplit(url)
    if parts.hostname != "learn.microsoft.com":
        raise ValueError("Microsoft Learn 주소가 아닙니다")
    path = re.sub(r"^/[a-z]{2}-[a-z]{2}(?=/|$)", "", parts.path, flags=re.I)
    korean_url = urllib.parse.urlunsplit(parts._replace(path="/ko-kr" + path))
    request = urllib.request.Request(korean_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=20) as response:
        if urllib.parse.urlsplit(response.url).hostname != "learn.microsoft.com":
            raise ValueError("Microsoft Learn 밖으로 리디렉션되었습니다")
        parser = FirstHeading()
        parser.feed(response.read().decode("utf-8"))
    title = " ".join("".join(parser.text).split())
    if not parser.finished or not title:
        raise ValueError("H1 제목을 찾지 못했습니다")
    return title


def main():
    data = build_board.parse(build_board.assemble(HERE / "원본"))
    for name in ("intune", "purview", "defender", "copilot"):
        root = HERE.parent / f"edu-{name}-board" / "원본"
        if root.is_dir():
            data.extend(build_board.parse(build_board.assemble(root)))
    urls = build_board.source_urls(data)
    cache = json.loads(CACHE.read_text(encoding="utf-8")) if CACHE.exists() else {}
    missing = sorted(urls - cache.keys())
    failures = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        futures = {pool.submit(fetch, url): url for url in missing}
        for future in concurrent.futures.as_completed(futures):
            url = futures[future]
            try:
                cache[url] = future.result()
            except (OSError, ValueError, UnicodeError) as exc:
                failures.append((url, str(exc)))
    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"출처 {len(urls)}개 중 제목 {len(urls & cache.keys())}개 확인")
    for url, error in sorted(failures):
        print(f"제목 확인 실패: {url} — {error}", file=sys.stderr)
    if failures:
        sys.exit(1)


if __name__ == "__main__":
    main()
