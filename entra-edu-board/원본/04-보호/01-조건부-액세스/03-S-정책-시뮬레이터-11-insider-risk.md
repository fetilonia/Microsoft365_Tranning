#### 그룹 · insider-risk · 내부자 위험
- 섹션: 조건
- 선택: 다중
- 위치: 보호 › 조건부 액세스 › 정책 › 새 정책 › 조건 › 내부자 위험(Insider risk) — 신호 설정은 Microsoft Purview › 내부자 위험 관리 › 적응형 보호 [확인 필요: 한글 UI 명칭]
- 소개: Purview 적응형 보호가 사용자에게 부여한 내부자 위험 수준으로 접근을 제어합니다.
- 평가: Entra ID가 로그인 시 Purview 적응형 보호의 사용자 내부자 위험 수준(상승·보통·경미 등)을 신호로 읽어 선택한 수준과 대조합니다. 수준은 시간이 지나면 갱신·초기화됩니다.
- 노드 제목: 내부자 위험 조건 일치?
- 노드 보조: Purview 적응형 보호 수준과 대조
- 해설: Entra ID가 Purview가 사용자에게 부여한 내부자 위험 수준을 읽어 선택한 수준과 같은지 봅니다.
- 주체: Entra ID(Microsoft Purview 신호)
- 데이터: Purview 적응형 보호의 사용자 내부자 위험 수준(Elevated·Moderate·Minor)
- 출처: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-conditions;https://learn.microsoft.com/en-us/entra/identity/conditional-access/policy-risk-based-insider-block;https://learn.microsoft.com/en-us/purview/insider-risk-management-adaptive-protection

##### 옵션 · ir-elevated · 내부자 위험: 상승(Elevated)
- 소개: 가장 높은 내부자 위험 수준의 사용자에게 적용합니다.
- 위치: 정책 › 조건 › 내부자 위험 › 구성 예 › 위험 수준 › Elevated
- 동작: Elevated는 심각도 높은 경고가 있거나 고위험 시퀀스 인사이트가 3건 이상인 사용자 등입니다(기본 정의, 사용자 지정 가능). Entra 템플릿은 Elevated에 액세스 차단을 Report-only로 만듭니다.
- 매칭: Purview 적응형 보호가 사용자에게 Elevated 수준을 부여한 상태일 때 일치입니다.
- 미충족 시: 위험 수준이 없거나 낮으면 이 옵션은 불일치이며 정책이 적용되지 않습니다.
- 지원 주체: 사용자. 문서 템플릿은 B2B direct connect·서비스 공급자·기타 외부 사용자를 제외합니다. 에이전트·워크로드 ID는 [확인 필요]
- 제약·주의: 적응형 보호를 먼저 구성·켜야 하며 반영에 최대 36~72시간. Purview 쪽 (미리 보기) 표기가 있어 미리 보기 여부·라이선스는 [확인 필요]. 수준은 기본 7일 후 초기화(5~30일).
- 로그: 로그인 로그 조건부 액세스 탭에서 정책 결과를, Purview 적응형 보호 화면에서 사용자별 부여 수준을 봅니다.

##### 옵션 · ir-moderate · 내부자 위험: 보통(Moderate)
- 소개: 중간 내부자 위험 수준의 사용자에게 적용합니다.
- 위치: 정책 › 조건 › 내부자 위험 › 구성 예 › 위험 수준 › Moderate
- 동작: Moderate는 중간 심각도 경고가 있거나 고위험 데이터 반출 활동이 2건 이상인 사용자 등입니다(기본 정의). Purview 예시는 특정 앱 접근 차단 등에 씁니다.
- 매칭: Purview 적응형 보호가 사용자에게 Moderate 수준을 부여한 상태일 때 일치입니다.
- 미충족 시: 위험 수준이 없거나 다른 수준이면 이 옵션은 불일치입니다.
- 지원 주체: 사용자. 외부 사용자 유형 처리·에이전트·워크로드 ID는 [확인 필요]
- 제약·주의: 내부자 위험 수준(Elevated·Moderate·Minor)은 경고 심각도(낮음·중간·높음)와 다릅니다. 라이선스·미리 보기 여부는 [확인 필요](문서는 Microsoft 365 플랜 표 참조).
- 로그: 로그인 로그 조건부 액세스 탭 정책 결과와 Purview 적응형 보호의 조건부 액세스 탭에서 확인합니다.

##### 옵션 · ir-minor · 내부자 위험: 경미(Minor)
- 소개: 낮은 내부자 위험 수준의 사용자에게 적용합니다.
- 위치: 정책 › 조건 › 내부자 위험 › 구성 예 › 위험 수준 › Minor
- 동작: Minor는 낮은 심각도 경고가 있거나 고위험 데이터 반출 활동이 1건 이상인 사용자 등입니다(기본 정의). 문서 예시는 이 수준에 이용 약관 동의를 요구합니다.
- 매칭: Purview 적응형 보호가 사용자에게 Minor 수준을 부여한 상태일 때 일치입니다.
- 미충족 시: 위험 수준이 없거나 다른 수준이면 이 옵션은 불일치입니다.
- 지원 주체: 사용자. 외부 사용자 유형 처리·에이전트·워크로드 ID는 [확인 필요]
- 제약·주의: 낮은 수준일수록 오탐 시 영향 범위가 넓으니 차단보다 이용 약관 같은 경고성 컨트롤이 어울립니다. 라이선스·미리 보기 여부는 [확인 필요].
- 로그: 로그인 로그 조건부 액세스 탭 정책 결과와 Purview '위험 수준이 부여된 사용자' 탭에서 확인합니다.
