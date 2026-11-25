import contextlib
import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import build_board
from refresh_source_titles import FirstHeading, fetch


class SourceTitlesTest(unittest.TestCase):
    def test_solution_metadata_and_scenario_sources_keep_their_scope(self):
        source = """# L1 · 03 · Microsoft Purview portal

## L2 · Classification — sample

- 솔루션(Solution): Information Protection
- 솔루션 출처(Source): https://learn.microsoft.com/purview/information-protection
- 솔루션 확인일(Checked): 2026-11-25

### L3 · A · Classifier scenarios

#### L4 · Pattern SIT

1. [시작] Start
   - 주체: Admin
   - 해설: Begin.
> 출처: https://learn.microsoft.com/purview/data-classification-overview
> 시나리오 확인일: 2026-11-25
> 시나리오 출처: https://learn.microsoft.com/purview/sit-sensitive-information-type-learn-about
"""
        product = build_board.parse(source)[0]
        feature = product["l2"][0]
        l3 = feature["l3"][0]
        scenario = l3["l4"][0]

        self.assertEqual(feature["solution"], "Information Protection")
        self.assertEqual(feature["solution_source"], "https://learn.microsoft.com/purview/information-protection")
        self.assertEqual(feature["solution_checked_on"], "2026-11-25")
        self.assertEqual(l3["notes"], [{
            "kind": "출처",
            "text": "https://learn.microsoft.com/purview/data-classification-overview",
        }])
        self.assertEqual(scenario["notes"], [
            {"kind": "확인일", "text": "2026-11-25"},
            {"kind": "출처", "text": "https://learn.microsoft.com/purview/sit-sensitive-information-type-learn-about"},
        ])
        self.assertEqual(build_board.source_urls([product]), {
            "https://learn.microsoft.com/purview/information-protection",
            "https://learn.microsoft.com/purview/data-classification-overview",
            "https://learn.microsoft.com/purview/sit-sensitive-information-type-learn-about",
        })

    def test_heading_collects_nested_text_only_from_first_h1(self):
        parser = FirstHeading()
        parser.feed("<h1>One <em>two</em> &amp; three</h1><h1>Ignored</h1>")
        self.assertTrue(parser.finished)
        self.assertEqual("".join(parser.text), "One two & three")

    def test_collects_regular_and_simulator_sources(self):
        data = [{"l2": [{"l3": [{
            "notes": [{"kind": "출처", "text": "https://learn.microsoft.com/a"}],
            "l4": [{"notes": [{"kind": "출처", "text": "https://learn.microsoft.com/e"}]}],
            "sim": {"groups": [{
                "f": {"출처": "https://learn.microsoft.com/b;https://learn.microsoft.com/c"},
                "options": [{"f": {"출처": "https://learn.microsoft.com/d"}}],
            }]},
        }]}]}]
        self.assertEqual(build_board.source_urls(data), {
            "https://learn.microsoft.com/a", "https://learn.microsoft.com/b",
            "https://learn.microsoft.com/c", "https://learn.microsoft.com/d",
            "https://learn.microsoft.com/e",
        })

    def test_fetch_requests_korean_page_with_original_query(self):
        class Response:
            url = "https://learn.microsoft.com/ko-kr/example?view=1"

            def __enter__(self):
                return self

            def __exit__(self, *args):
                return False

            def read(self):
                return "<h1>한국어 제목</h1>".encode("utf-8")

        with patch("refresh_source_titles.urllib.request.urlopen", return_value=Response()) as open_url:
            title = fetch("https://learn.microsoft.com/en-us/example?view=1")
        self.assertEqual(title, "한국어 제목")
        self.assertEqual(open_url.call_args.args[0].full_url, Response.url)

    def test_missing_title_is_reported_and_cached_title_is_embedded(self):
        data = [{"l2": [{"l3": [{"notes": [
            {"kind": "출처", "text": "https://learn.microsoft.com/a"},
            {"kind": "출처", "text": "https://learn.microsoft.com/missing"},
        ]}]}]}]
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)
            (path / "source_titles_ko.json").write_text(
                json.dumps({"https://learn.microsoft.com/a": "문서 제목"}, ensure_ascii=False),
                encoding="utf-8",
            )
            (path / "source_title_translations.json").write_text("{}", encoding="utf-8")
            errors = io.StringIO()
            with patch.object(build_board, "HERE", path), contextlib.redirect_stderr(errors):
                result = build_board.insert_source_titles("/*__SOURCE_TITLES__*/{} /*__SOURCE_TRANSLATIONS__*/{}", data)
            self.assertIn("문서 제목", result)
            self.assertIn("https://learn.microsoft.com/missing", errors.getvalue())


if __name__ == "__main__":
    unittest.main()
