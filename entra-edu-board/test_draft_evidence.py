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


if __name__ == "__main__":
    unittest.main()
