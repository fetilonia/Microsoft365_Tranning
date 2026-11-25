# Entra Conditional Access Simulator Update — Plan

## Status

Scope approved: verify the 29 standalone `[확인 필요]` entries only. Do not edit the 63 qualified `[확인 필요: ...]` entries deferred by the user.

## Execution sequence

| Step | Work | Dependency | Review gate |
| --- | --- | --- | --- |
| 1. Inventory | Reconcile the exact 29 marker occurrences with the seven source fragments; preserve the broader qualified markers | Scope approval | Marker count and source list match [the CA specification](ENTRA_CA_SPEC.md) |
| 2. Verify | Check each claim against current official Microsoft Learn/Graph documentation; capture source URL and caveats | Step 1 | No claim is changed without direct support; unresolved/conflicting claims retain `[확인 필요]` |
| 3. Update source | Make only the supported wording/reference changes in the seven Conditional Access simulator fragments | Step 2 | Review the diff against the 29-entry scope; no engine/UI behavior changes |
| 4. Generate | Run `python3 build_board.py` from `entra-edu-board/` | Step 3 | Successful build, no lint warnings, source-to-HTML synchronization |
| 5. Final review | Check Markdown links/tables, changed-file scope, and 37/144/261 counts | Step 4 | All [CA specification](ENTRA_CA_SPEC.md) acceptance criteria pass |

## Official sources checked

- [Conditional Access report-only mode](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-report-only)
- [Microsoft Graph applied Conditional Access policy](https://learn.microsoft.com/en-us/graph/api/resources/appliedconditionalaccesspolicy?view=graph-rest-1.0)
- [Sign-in log activity details](https://learn.microsoft.com/entra/identity/monitoring-health/concept-sign-in-log-activity-details)
- [Conditional Access policies and evaluation order](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-policies)
- [Target resources and user actions](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-cloud-apps)
- [Conditional Access for workload identities](https://learn.microsoft.com/en-us/entra/identity/conditional-access/workload-identity)
- [Block access for users with elevated insider risk](https://learn.microsoft.com/en-us/entra/identity/conditional-access/policy-risk-based-insider-block)
- [Target agents in Conditional Access policies](https://learn.microsoft.com/en-us/entra/identity/conditional-access/howto-target-agent-identities)
- [Conditional Access grant controls](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant)
- [ID Protection risk-based access policies](https://learn.microsoft.com/en-us/entra/id-protection/concept-identity-protection-policies)
- [Configure adaptive session lifetime policies](https://learn.microsoft.com/en-us/entra/identity/conditional-access/howto-conditional-access-session-lifetime)
- [Global Secure Access licensing and capabilities](https://learn.microsoft.com/en-us/entra/global-secure-access/overview-what-is-global-secure-access)

## Verification results and completion record

- **Claim accounting:** 29 selected occurrences accounted for: 10 resolved with official evidence, 18 retained as standalone `[확인 필요]`, and one unresolved portal field label refined to `[확인 필요: 포털 필드명]`. The 63 pre-existing qualified markers were unchanged; the Conditional Access source now has 64 qualified markers because of that in-scope clarification.
- **Build and lint:** `python3 build_board.py` from `entra-edu-board/` succeeded with 0 lint warnings and 0 source-title notices.
- **Unit tests:** `python3 -m unittest test_source_titles test_readme` passed (7 tests).
- **Source/generated synchronization:** parsed generated `DATA` exactly matches parsed Markdown. Counts remain L1=1, L2=37, L3=144, L4=261.
- **Scope review:** five of the seven scoped source fragments were updated; the location and authentication-flow fragments retain their unresolved claims. The generated `entra-edu-board.html` was regenerated. `sim_engine.js`, `sim_ui.js`, build logic, source-title maps, the existing gap analysis, and all 63 pre-existing qualified markers remain unchanged.
- **Remaining uncertainties:** target-resource selector combinations; detailed user-action/agent log labels; workload identity support for compliant-network signals; Purview preview/licensing boundaries; authentication-flow support and non-block controls; authentication-strength evaluation placement; remediation-specific log fields; persistent-session prompt behavior and exact portal log label.
