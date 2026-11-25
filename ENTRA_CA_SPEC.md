# Entra Conditional Access Simulator Update — Specification

## Status and baseline

- Status: implementation and validation completed.
- The prior Entra gap analysis identifies Conditional Access as the first representative improvement candidate.
- The checked-in Entra baseline is 37 features, 144 L3 entries, and 261 L4 scenarios.
- The agreed scope is the 29 standalone `[확인 필요]` occurrences in the Conditional Access source. A source scan also finds 63 qualified forms such as `[확인 필요: ...]`; those are explicitly deferred and must not be changed in this task.
- Of the 29 selected occurrences, 10 were resolved from official documentation, 18 remain standalone, and one unresolved log label was made specific as `[확인 필요: 포털 필드명]`. All 63 pre-existing qualified occurrences remain unchanged.
- Root `SPEC.md` and `PLAN.md` did not exist in the current worktree before this task. No `ROADMAP.md` is being added.

## Objective

Review the 29 selected Conditional Access simulator claims against current Microsoft Learn or other official Microsoft documentation. Replace a marker only when the cited source supports the complete statement; retain `[확인 필요]` when a claim remains undocumented, tenant-dependent, preview-dependent, or conflicting. Regenerate the Entra board so its checked-in HTML matches the updated Markdown.

## Scope

The only authored content in scope is the following seven simulator fragments:

| Source | Selected occurrences |
| --- | ---: |
| `entra-edu-board/원본/04-보호/01-조건부-액세스/03-S-정책-시뮬레이터-01-state.md` | 2 |
| `entra-edu-board/원본/04-보호/01-조건부-액세스/03-S-정책-시뮬레이터-04-resource.md` | 5 |
| `entra-edu-board/원본/04-보호/01-조건부-액세스/03-S-정책-시뮬레이터-05-loc.md` | 1 |
| `entra-edu-board/원본/04-보호/01-조건부-액세스/03-S-정책-시뮬레이터-11-insider-risk.md` | 6 |
| `entra-edu-board/원본/04-보호/01-조건부-액세스/03-S-정책-시뮬레이터-12-auth-flow.md` | 3 |
| `entra-edu-board/원본/04-보호/01-조건부-액세스/03-S-정책-시뮬레이터-14-grant.md` | 7 |
| `entra-edu-board/원본/04-보호/01-조건부-액세스/03-S-정책-시뮬레이터-16-session.md` | 5 |
| **Total** | **29** |

`01-개요.md` contains a qualified marker (`[확인 필요: P2 여부]`), not one of the selected standalone markers, so it remains unchanged. The other 63 qualified occurrences, other Entra features, simulator UI/engine behavior, build logic, and `ENTRA_GAP_ANALYSIS.md` are out of scope.

## Evidence and wording rules

1. Use current `learn.microsoft.com` content as the primary source; use Microsoft Graph documentation only for a Graph API/property claim.
2. Link evidence in the existing `- 출처:` field and keep the claim no broader than the linked source.
3. Distinguish documented behavior from estimates, preview, licensing, tenant configuration, and portal-label details.
4. Do not infer a value or behavior from a similar control. Preserve the marker and state the unresolved detail when primary evidence is absent or conflicting.
5. Do not modify the policy evaluation implementation in `sim_engine.js` or `sim_ui.js` as part of this content-verification scope.

## Acceptance criteria

- Each of the 29 selected occurrences is either replaced with an accurately scoped, linked official fact or remains explicitly marked with its unresolved detail.
- No unsupported claim is presented as verified; the 63 qualified occurrences remain unchanged.
- The three-state feature structure and the 37/144/261 source baseline remain unchanged.
- `entra-edu-board/entra-edu-board.html` is regenerated from the Markdown and contains the corresponding updated Conditional Access content.
- The Entra board build succeeds with no lint warnings; the resulting diff contains only this specification, this plan, the seven scoped source fragments, and the generated board HTML.
