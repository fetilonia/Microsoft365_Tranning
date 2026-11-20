import unittest

import build_board


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


if __name__ == "__main__":
    unittest.main()
