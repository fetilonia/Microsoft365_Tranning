import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import build_edu_boards
import build_board


class DraftScenarioEvidenceTest(unittest.TestCase):
    def test_official_source_is_linked_without_claiming_scenario_is_official(self):
        source = "https://learn.microsoft.com/en-us/example"
        data = [{"l2": [{"l3": [{
            "desc": "Feature flow",
            "notes": [{"kind": "출처", "text": source}],
            "l4": [{"label": "Scenario", "sub": "Training example", "nodes": [], "edges": []}],
        }]}]}]

        build_edu_boards.annotate_scenario_evidence(data)

        evidence = data[0]["l2"][0]["l3"][0]["l4"][0]["evidence"]
        self.assertTrue(evidence["educational_example"])
        self.assertEqual(evidence["official_sources"], [source])
        self.assertFalse(evidence["needs_check"])

    def test_missing_official_source_or_unverified_claim_requires_check(self):
        data = [{"l2": [{"l3": [{
            "desc": "Feature flow",
            "notes": [{"kind": "주의", "text": "라이선스는 [확인 필요]"}],
            "l4": [{"label": "Scenario", "sub": "Training example", "nodes": [], "edges": []}],
        }]}]}]

        build_edu_boards.annotate_scenario_evidence(data)

        evidence = data[0]["l2"][0]["l3"][0]["l4"][0]["evidence"]
        self.assertEqual(evidence["official_sources"], [])
        self.assertTrue(evidence["needs_check"])

    def test_unverified_scenario_claim_is_flagged_despite_an_official_source(self):
        source = "https://learn.microsoft.com/en-us/example"
        data = [{"l2": [{"l3": [{
            "desc": "Feature flow",
            "notes": [{"kind": "출처", "text": source}],
            "l4": [{
                "label": "Scenario", "sub": "Training example", "edges": [],
                "nodes": [{"narr": "Current behavior [확인 필요]"}],
            }],
        }]}]}]

        build_edu_boards.annotate_scenario_evidence(data)

        evidence = data[0]["l2"][0]["l3"][0]["l4"][0]["evidence"]
        self.assertEqual(evidence["official_sources"], [source])
        self.assertTrue(evidence["needs_check"])

    def test_scenario_source_notes_are_kept_with_their_own_scenario(self):
        shared = "https://learn.microsoft.com/purview/information-protection"
        pattern = "https://learn.microsoft.com/purview/sit-sensitive-information-type-learn-about"
        edm = "https://learn.microsoft.com/purview/sit-learn-about-exact-data-match-based-sits"
        data = [{"l2": [{"l3": [{
            "desc": "Classifier scenarios",
            "notes": [{"kind": "출처", "text": shared}],
            "l4": [
                {"label": "Pattern SIT", "sub": "Pattern matching", "nodes": [], "edges": [],
                 "notes": [{"kind": "출처", "text": pattern}]},
                {"label": "EDM", "sub": "Exact values", "nodes": [], "edges": [],
                 "notes": [{"kind": "출처", "text": edm}]},
            ],
        }]}]}]

        build_edu_boards.annotate_scenario_evidence(data)

        pattern_sources = data[0]["l2"][0]["l3"][0]["l4"][0]["evidence"]["official_sources"]
        edm_sources = data[0]["l2"][0]["l3"][0]["l4"][1]["evidence"]["official_sources"]
        self.assertEqual(pattern_sources, sorted([shared, pattern]))
        self.assertEqual(edm_sources, sorted([shared, edm]))

    def test_fingerprint_exact_and_partial_routes_do_not_overlap(self):
        purview = build_board.parse(
            build_board.assemble(ROOT / "edu-purview-board" / "원본")
        )
        feature = next(
            feature for product in purview for feature in product["l2"]
            if feature.get("solution") == "Information Protection"
            and feature["title"].startswith("데이터 분류")
        )
        scenarios = next(l3 for l3 in feature["l3"] if l3["id"] == "A")["l4"]
        fingerprint = next(
            scenario for scenario in scenarios if scenario["label"].startswith("문서 지문")
        )
        routes = {
            route["key"]: set(route["nodes"])
            for route in build_board.enum_routes(fingerprint)
        }

        self.assertIn("4", routes["전체 텍스트 정확 일치"])
        self.assertNotIn("5", routes["전체 텍스트 정확 일치"])
        self.assertIn("5", routes["템플릿 일부 일치"])
        self.assertNotIn("4", routes["템플릿 일부 일치"])

    def test_draft_manuscripts_no_longer_require_a_main_scenario_marker(self):
        for slug in build_edu_boards.BOARDS:
            data = build_board.parse(
                build_board.assemble(ROOT / f"edu-{slug}-board" / "원본")
            )
            labels = [
                scenario["label"]
                for product in data
                for feature in product["l2"]
                for stage in feature["l3"]
                for scenario in stage["l4"]
            ]
            self.assertTrue(labels)
            self.assertFalse(any(label.startswith("▶") for label in labels), slug)

    def test_draft_boards_use_the_entra_scenario_controls(self):
        template = (ROOT / "MainBoard.html").read_text(encoding="utf-8")
        self.assertNotIn("scenario-content", template)
        self.assertNotIn("scenario-card", template)
        self.assertNotIn("scenarioChosen", template)
        self.assertNotIn("body.draft-board", template)
        self.assertIn("if(l2.l3.length>1){", template)
        self.assertIn("l3.l4.map((x,k)=>", template)
        self.assertIn('h += `<div class="routes" id="routes" hidden></div>`;', template)
        self.assertIn("if(view.routes.length<2){ el.hidden = true; return; }", template)
        self.assertIn("const st = {l1:0,l2:0,l3:0,l4:0,route:0,speed:1,paused:false};", template)

    def test_workload_names_use_official_product_and_portal_labels(self):
        expected = {
            "intune": "Microsoft Intune admin center",
            "purview": "Microsoft Purview portal",
            "defender": "Microsoft Defender",
            "copilot": "Microsoft Copilot",
        }
        self.assertEqual(build_edu_boards.BOARDS, expected)
        template = (ROOT / "MainBoard.html").read_text(encoding="utf-8")
        for name in expected.values():
            self.assertIn(f"'{name}'", template)
        self.assertIn("Microsoft Graph 기반 조직 데이터 흐름", template)
        self.assertNotIn("'Copilot · Graph'", template)

        for slug, name in expected.items():
            page = (ROOT / f"edu-{slug}-board" / f"edu-{slug}-board.html").read_text(
                encoding="utf-8"
            )
            self.assertIn(f"<title>교육 보드 · {name} — 기능별 데이터 흐름</title>", page)
            self.assertIn(f"<h1>교육 보드 · {name} › 기능별 데이터 흐름</h1>", page)


if __name__ == "__main__":
    unittest.main()
