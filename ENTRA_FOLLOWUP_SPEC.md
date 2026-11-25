# Entra 추가 검토 보완 명세

> 이 문서의 체크아웃 기준은 통합 전입니다. 관련 갭 분석과 CA·검토 문서는 이후 함께 통합되었습니다.

## 목적과 범위

ID Protection 레거시 위험 정책의 폐기 시점 표현과 CAE, ID Protection, SSPR, 암호 보호·스마트 잠금의 고객 라이선스 확인 사항을 현재 Microsoft 공식 근거에 맞게 보완한다. 대상은 `entra-edu-board/원본/04-보호/02-CAE.md`, `03-ID-Protection.md`, `04-암호-재설정-SSPR.md`, `05-암호-보호-스마트-잠금.md`와 그 생성 HTML이다.

조건부 액세스 원고·시뮬레이터, 다른 기능, 깊이·시나리오 범위 및 Entra ID 그룹 정렬 문제는 제외한다. 보드 작성 규격과 기존 출처 형식을 지키고, 승인된 범위 밖의 발견은 후속 항목으로 보고한다.

## 확인 상태와 기준

- 기존 `ENTRA_GAP_ANALYSIS.md`, `ENTRA_REVIEW_SPEC.md`, `ENTRA_REVIEW_PLAN.md`, `ENTRA_REVIEW_REPORT.md`, `SPEC.md`, `PLAN.md`는 현재 체크아웃에서 발견되지 않았다. 이전 검토의 세부 근거 및 36개 기능 검토 결과는 이 체크아웃에서 [확인 필요]이며, 전달받은 요약과 현재 원고·`entra-edu-board/원본/00-보드-규격.md`를 사용한다.
- 2026-11-24 확인한 [위험 정책](https://learn.microsoft.com/en-us/entra/id-protection/howto-identity-protection-configure-risk-policies)과 [위험 기반 정책](https://learn.microsoft.com/en-us/entra/id-protection/concept-identity-protection-policies)은 과거가 된 2026-10-01을 폐기일로 안내하면서 미래형 또는 진행형을 사용한다. 두 페이지의 갱신일은 2026-11-17이다. 실제 폐기 완료 및 테넌트별 사용 가능 여부는 [확인 필요]이며 미래의 예정일로 단정하거나 폐기 완료를 주장하지 않는다.
- 일반 기능·SKU 요건은 공식 자료와 대조해 기록하되, 고객의 SKU 보유, 사용자 할당 및 해당 테넌트 기능 자격은 확인되지 않았으므로 네 고객 라이선스 marker는 구체화하여 보존한다. 실제 고객 환경을 조회하거나 변경하지 않는다.

## 공식 근거

아래 자료는 모두 2026-11-24에 확인했으며, 변경 전 다시 확인할 때 내용이 달라지면 확인일과 근거를 갱신한다.

| 범위 | Microsoft Learn |
| --- | --- |
| 레거시 위험 정책 및 이전 | [위험 정책](https://learn.microsoft.com/en-us/entra/id-protection/howto-identity-protection-configure-risk-policies), [위험 기반 정책](https://learn.microsoft.com/en-us/entra/id-protection/concept-identity-protection-policies) |
| CAE 및 CA 라이선스 | [CAE 개요](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-continuous-access-evaluation), [CA 라이선스](https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview#license-requirements) |
| ID Protection | [기능별 라이선스 표](https://learn.microsoft.com/en-us/entra/id-protection/overview-identity-protection#license-requirements) |
| SSPR | [SSPR 라이선스 표](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-sspr-licensing) |
| 암호 보호·스마트 잠금 | [암호 보호](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-password-ban-bad), [사용자 지정 금지 목록](https://learn.microsoft.com/en-us/entra/identity/authentication/tutorial-configure-custom-password-protection), [스마트 잠금](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-password-smart-lockout), [온프레미스 배포](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-password-ban-bad-on-premises-deploy) |

## 완료 조건

공식 근거와 고객별 미결 사항을 구분하고 네 원고와 생성 HTML을 동기화한다. 빌드 경고 0건, 기준선 L1 1·L2 37·L4 261, 범위 및 marker 검토를 통과해야 한다. 완료 보고에는 해결·미해결 marker의 정확한 수와 공식 출처·검증 결과를 포함한다. 커밋이나 PR은 별도 요청 전 생성하지 않는다.
