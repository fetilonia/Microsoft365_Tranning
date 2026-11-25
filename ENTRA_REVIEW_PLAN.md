# Entra Admin Center Non-CA Review — Plan and Execution Record

> Historical review baseline: the CA documents are now [ENTRA_CA_SPEC.md](ENTRA_CA_SPEC.md) and [ENTRA_CA_PLAN.md](ENTRA_CA_PLAN.md); the root roadmap and overall SPEC/PLAN were integrated later.

## Approved scope

Review all Entra features other than Conditional Access against the existing gap analysis, board standard, README, generator/rendering rules, and checked-in board data. Preserve existing source, code, generated HTML, and the completed CA review. Create only the review-specific `ENTRA_REVIEW_SPEC.md`, `ENTRA_REVIEW_PLAN.md`, and `ENTRA_REVIEW_REPORT.md`.

## Execution record

| Step | Work | Result |
| --- | --- | --- |
| Inventory and boundary check | Reconcile the 37-feature baseline and exclude CA | Reviewed 36 non-CA feature entries across source folders; no whole-feature omission found |
| Prior-gap comparison | Compare each feature with the existing gap table and delegated folder reviews | Existing task-depth, scenario-coverage, uncertainty-marker, and navigation findings remain unchanged unless noted in the report |
| Official-source check | Verify material product claims that could change the current review result | Microsoft Learn was checked for the ID Protection risk-policy retirement date; the date has passed, while the current pages still say “will retire/are retiring,” so actual retirement and tenant availability remain `[확인 필요]` |
| Root documentation status | Recheck root planning documents | `SPEC.md` and `PLAN.md` now exist but are scoped to the completed CA update; root `ROADMAP.md` remains absent |
| Source/render comparison | Run the generator's read-only `assemble()` and `parse()` functions and compare with embedded `DATA` | Source and rendered structures match exactly: 1 L1, 37 L2, 144 L3, and 261 L4 |
| Report and scope review | Prepare the feature-level findings table and check changed files | No board source, generator, or generated HTML was edited for this review |

## Official sources consulted

- [Risk policies - Microsoft Entra ID Protection](https://learn.microsoft.com/entra/id-protection/howto-identity-protection-configure-risk-policies) — page metadata updated 2026-11-17; still states that legacy risk policies “will be retired” on October 1, 2026.
- [Microsoft Entra ID Protection risk-based access policies](https://learn.microsoft.com/entra/id-protection/concept-identity-protection-policies) — page metadata updated 2026-11-17; says legacy policies “are retiring” on October 1, 2026.

These pages confirm the published date but do not establish whether the old policy controls remain available in a particular tenant after that date. No tenant access was available for this review.

## Validation and scope

- The read-only parser produced the same `DATA` structure as the checked-in HTML.
- Counts match the documented baseline: 37 L2 features, 144 L3 entries, and 261 L4 scenarios; 36 L2 features are in this review after excluding CA.
- The generated HTML was read but not regenerated.
- The inherited worktree already contains the prior CA changes and CA task documents. For this assignment, only the three review documents are new; all previous CA and gap-analysis changes were preserved.
- No claim is made that every product fact or every qualified `[확인 필요: ...]` marker across all features has been independently revalidated.
