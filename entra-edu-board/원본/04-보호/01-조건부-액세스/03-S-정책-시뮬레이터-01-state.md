#### 그룹 · state · 정책 상태
- 섹션: 정책 상태
- 선택: 단일
- 위치: 보호 › 조건부 액세스 › 정책 › 새 정책 만들기 › 정책 사용(Enable policy) [확인 필요: 한글 UI 문구]
- 소개: 정책을 강제할지, 평가만 하고 로그만 남길지, 아예 끌지 정하는 정책의 상태 값입니다.
- 평가: 정책 평가는 2단계입니다. Phase 1(세션 정보 수집)은 사용 중·보고 전용 정책 모두, Phase 2(강제)는 사용 중인 정책에만 일어납니다. 상태는 정책별로 따로 적용되고, 모든 정책이 로그인마다 함께 평가됩니다.
- 노드 제목: 정책 상태 확인
- 노드 보조: 사용=강제 · 보고 전용=평가만 · 사용 안 함=미평가
- 해설: 정책 상태가 이후 노드의 결과를 강제할지, 로그에만 남길지, 건너뛸지 정합니다.
- 주체: Entra ID
- 데이터: 정책 state(enabled / enabledForReportingButNotEnforced / disabled)
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-policies;https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-report-only;https://learn.microsoft.com/en-us/entra/identity/conditional-access/workload-identity

##### 옵션 · st-on · 사용
- 소개: 정책을 실제로 강제합니다(Enable policy = On).
- 위치: 정책 만들기/편집 › 정책 사용 › 켜기(On)
- 동작: 로그인마다 Phase 1에서 세션 정보를 모으고 Phase 2에서 모든 사용 중 정책을 평가합니다. 차단 컨트롤이 있으면 거기서 중단되고, 아니면 미충족 허용 컨트롤을 요구한 뒤 세션 컨트롤을 적용합니다.
- 매칭: 정책 상태가 On이면 이후 할당·대상 리소스·조건 평가로 진행합니다. 일치하면 컨트롤이 실제로 강제됩니다.
- 미충족 시: 할당·조건이 일치하지 않으면 정책은 적용되지 않습니다(Not applied). 다른 사용 중 정책은 별개로 평가됩니다.
- 지원 주체: 사용자, 게스트, 워크로드 ID, 에이전트
- 제약·주의: 여러 정책이 적용되면 모두 충족해야 합니다. 모든 사용자·모든 리소스 정책은 잠금 위험이 있어 먼저 보고 전용·소규모로 확인하고 관리자를 제외하라는 경고가 뜹니다.
- 로그: 로그인 로그 조건부 액세스 탭 → appliedConditionalAccessPolicies.result = success / failure / notApplied.
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-policies;https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-users-groups

##### 옵션 · st-report · 보고 전용
- 소개: 로그인 때 평가만 하고 강제하지 않는 '모의' 상태입니다.
- 위치: 정책 만들기/편집 › 정책 사용 › 보고 전용(Report-only)
- 동작: 로그인 중 정책을 평가하지만 강제하지 않습니다(차단·MFA 요구 없음). 결과는 로그인 로그의 조건부 액세스 탭과 '보고 전용' 탭, 정책 영향·인사이트 통합 문서에서 봅니다. Phase 1은 수행하고 Phase 2 강제는 하지 않습니다.
- 매칭: 일반 정책과 같은 기준(할당·리소스·조건)으로 일치 여부를 계산합니다. 일치해도 컨트롤은 강제하지 않고 결과만 reportOnly*로 기록합니다.
- 미충족 시: 조건이 안 맞으면 Report-only: Not applied(reportOnlyNotApplied)로 남고 사용자 영향은 없습니다.
- 지원 주체: 사용자, 게스트, 워크로드 ID, 에이전트
- 제약·주의: '사용자 작업' 범위 항목은 보고 전용으로 평가할 수 없습니다. 디바이스 준수 요구 정책은 macOS·iOS·Android에서 인증서 선택 프롬프트가 반복될 수 있어 해당 플랫폼 제외를 권장합니다.
- 로그: result = reportOnlySuccess·Failure·NotApplied·Interrupted (포털: Report-only Success·Failure·User action required·Not applied, 대응 [확인 필요])
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-report-only;https://learn.microsoft.com/en-us/graph/api/resources/appliedconditionalaccesspolicy?view=graph-rest-1.0

##### 옵션 · st-off · 사용 안 함
- 소개: 정책을 끕니다. 평가·강제 모두 하지 않습니다(Off).
- 위치: 정책 만들기/편집 › 정책 사용 › 끄기(Off) [확인 필요: 포털 Off 문구]
- 동작: 정책 구성은 남지만 어떤 로그인에도 영향을 주지 않습니다. Graph 상태 값은 disabled이고, 로그인 결과가 기록되면 notEnabled(비활성 상태 때문에 적용 안 됨)로 표시됩니다.
- 매칭: 일치 여부를 따지지 않습니다. 상태가 꺼져 있으므로 모든 로그인에서 비대상입니다.
- 미충족 시: 해당 없음 — 항상 비적용입니다. 롤백이 필요할 때 정책을 삭제하지 않고 끌 수 있습니다.
- 지원 주체: 사용자, 게스트, 워크로드 ID, 에이전트
- 제약·주의: 끈 정책은 보호가 사라진 것입니다. 로그인 로그에 notEnabled 항목이 실제로 표시되는 범위는 포털 UI 기준 [확인 필요].
- 로그: result = notEnabled (정책이 비활성 상태라서 적용 안 됨).
- 출처: https://learn.microsoft.com/en-us/graph/api/resources/appliedconditionalaccesspolicy?view=graph-rest-1.0;https://learn.microsoft.com/en-us/entra/identity/conditional-access/workload-identity
