# Entra Admin Center Non-CA Review — Specification

## Status

Review complete. This specification covers the read-only follow-up review of Entra Admin Center features other than Conditional Access (CA). It describes the earlier review scope, not the current integrated state.

## Objective

Determine whether the non-CA Entra feature inventory contains actionable omissions or quality gaps beyond those already recorded in [`ENTRA_GAP_ANALYSIS.md`](ENTRA_GAP_ANALYSIS.md). Reconcile status changes, distinguish missing features from incomplete content, and report findings with repository or official-source evidence.

## Scope and boundaries

- Review the 36 non-CA features in the prior 37-feature inventory. CA and the completed 29-marker CA review are excluded.
- Compare against [`ENTRA_GAP_ANALYSIS.md`](ENTRA_GAP_ANALYSIS.md), the board standard at [`00-보드-규격.md`](entra-edu-board/원본/00-보드-규격.md), [`entra-edu-board/README.md`](entra-edu-board/README.md), the previous CA task documents ([specification](ENTRA_CA_SPEC.md) and [plan](ENTRA_CA_PLAN.md)), and the source-to-render rules in `entra-edu-board/build_board.py`.
- Inspect the checked-in [`entra-edu-board.html`](entra-edu-board/entra-edu-board.html) as data, without running a build or writing generated content.
- Preserve the board source files, generator, generated HTML, prior gap analysis, and existing CA documents.
- Produce only these review documents: `ENTRA_REVIEW_SPEC.md`, `ENTRA_REVIEW_PLAN.md`, and `ENTRA_REVIEW_REPORT.md`.
- The root `ROADMAP.md` is absent. Do not create one as part of this review.

## Finding categories and priority

| Category | Meaning |
| --- | --- |
| Feature omission | An expected feature is absent from both source inventory and rendered board data |
| Quality defect / unresolved fact | Existing feature content has a concrete structural, accuracy, licensing, or operational gap |
| Improvement | Optional scenario coverage, navigation, or clarity enhancement without evidence of a missing product capability |
| Existing / unchanged | Already recorded by the prior gap analysis and not materially changed |
| Status change | A prior gap's current state differs from the earlier report |

| Priority | Criteria |
| --- | --- |
| P1 | Potentially affects enforcement, security posture, a time-sensitive product behavior, or a high-impact unsupported claim |
| P2 | Material licensing, configuration, operational, evidence, or reliability uncertainty |
| P3 | Optional scenario-diversity, discoverability, or presentation improvement |

Priorities in this review are triage recommendations, not Microsoft severity ratings.

## Evidence rules and limitations

- Treat a source file's presence, parseability, or lint status as evidence of structure only, not proof that product behavior is current.
- Use Microsoft Learn or another official Microsoft source for material product claims. When current status is not established, retain `[확인 필요]` rather than inferring a result.
- Mark repeated, unchanged prior findings as existing; do not present them as new defects.
- The review compares the complete non-CA inventory against the prior analysis, but does not independently revalidate every product claim or re-count every qualified uncertainty marker across all 36 features.
- The ID Protection retirement date was checked against current Microsoft Learn pages; those pages still use future-tense wording for a date that has passed, so actual tenant/service status remains unconfirmed.
- No browser interaction, deployment, build, source edit, or product-tenant inspection is in scope.

## Acceptance criteria

- Account for all 36 non-CA features and the excluded CA feature against the prior baseline.
- Distinguish feature omissions from internal quality issues and optional improvements.
- Identify unchanged prior findings without duplicating them as new.
- Record new findings and status changes with source locations, priority rationale, recommendation, and evidence or `[확인 필요]`.
- Perform a read-only comparison of current parsed source data with the checked-in HTML data.
- Confirm that only the three named review documents are newly created and that no source, code, or generated HTML was modified for this assignment.
