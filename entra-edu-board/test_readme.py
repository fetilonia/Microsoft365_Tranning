import unittest
from html.parser import HTMLParser
from pathlib import Path

import build_board


class MetaTags(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = {}

    def handle_starttag(self, tag, attrs):
        if tag == "meta":
            attrs = dict(attrs)
            if attrs.get("property"):
                self.tags[attrs["property"]] = attrs.get("content")


class ReadmeRenderingTest(unittest.TestCase):
    def test_formats_readme_and_preserves_repository_links(self):
        html = build_board.render_readme(
            "# 소개\n\n[보드](MainBoard.html) [섹션](#소개)\n\n"
            "- 항목\n\n| 이름 | 값 |\n| --- | --- |\n| `키` | 값 |\n\n"
            "```bash\npython build.py\n```\n"
        )
        self.assertIn('<h1 id="소개">소개</h1>', html)
        self.assertIn('href="MainBoard.html"', html)
        self.assertIn('href="#%EC%86%8C%EA%B0%9C"', html)
        self.assertIn("<ul>", html)
        self.assertIn("<table>", html)
        self.assertIn("<code>키</code>", html)
        self.assertIn("<pre><code", html)

    def test_disables_html_and_unsafe_link_schemes(self):
        html = build_board.render_readme(
            '<script>alert(1)</script>\n\n'
            '[unsafe](javascript:alert(1)) [data](data:text/html,test) '
            '[network](//example.com/test) [good](https://example.com)\n'
        )
        self.assertNotIn("<script>", html)
        self.assertNotIn('href="javascript:', html)
        self.assertNotIn('href="data:', html)
        self.assertNotIn('href="//example.com', html)
        self.assertIn('href="https://example.com"', html)

    def test_root_and_main_board_share_preview_metadata(self):
        root = Path(__file__).resolve().parent.parent
        pages = []
        for path in (root / "index.html", root / "MainBoard.html"):
            parser = MetaTags()
            parser.feed(path.read_text(encoding="utf-8"))
            pages.append(parser.tags)
        for tags in pages:
            self.assertTrue(tags.get("og:title"))
            self.assertTrue(tags.get("og:description"))
            self.assertEqual(tags.get("og:type"), "website")
        self.assertEqual(pages[0], pages[1])
        self.assertEqual(pages[0]["og:url"], "https://fetilonia.github.io/Microsoft365_Tranning/")
        self.assertEqual(pages[0]["og:image"], pages[0]["og:url"] + "assets/og-training.png")
        self.assertTrue((root / "assets" / "og-training.png").is_file())


if __name__ == "__main__":
    unittest.main()
