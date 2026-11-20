### L3 · B · Cloud Sync 에이전트 흐름 — 프로비전 서비스와 에이전트

#### L4 · 클라우드 서비스가 에이전트를 통해 AD를 읽는다

1. [시작] 클라우드 프로비전 서비스의 스케줄러 실행
   - 주체: Entra ID
   - 위치: Entra ID › Entra Connect › Cloud sync › {구성} › Restart sync (다음 주기를 기다리지 않고 즉시 실행)
   - 데이터: 약 2분 주기 · 워터마크 기반 증분
   - 해설: 서비스가 주기적으로 변경분을 가져오는 작업을 시작합니다.
2. [처리] 에이전트가 Azure Service Bus에 지속 연결
   - 주체: 온프레미스
   - 데이터: 에이전트 → Service Bus 아웃바운드 연결 (인바운드 포트 불필요) · 아웃바운드 443 필수, 443을 쓸 수 없을 때 상태 보고용으로 8080(선택, 10분 주기) · 에이전트 ↔ DC는 TCP 389(LDAP)·3268(글로벌 카탈로그)
   - 해설: 에이전트는 바깥으로만 연결해 클라우드의 요청을 기다립니다. 에이전트를 여러 대 두면 자동으로 장애 조치됩니다.
3. [처리] 서비스가 SCIM 요청을 에이전트에 전달
   - 주체: Entra ID
   - 데이터: SCIM 요청 (워터마크 이후 변경만)
   - 해설: 변경이 있을 때만 필요한 범위를 에이전트에 묻습니다.
4. [처리] 에이전트가 AD를 조회하고 범위 필터 적용
   - 주체: 온프레미스
   - 데이터: 범위 — 모든 사용자 · 선택한 보안 그룹(중첩 그룹 미포함) · 선택한 OU · IsCriticalSystemObject = TRUE 개체와 replication victim 개체는 기본 제외
   - 해설: 구성에서 정한 범위만 AD에서 읽어 옵니다. 범위 밖 개체는 프로비전 로그에 Status = Skipped로 보입니다.
5. [처리] 속성 매핑 · 변환 후 응답
   - 주체: 온프레미스
   - 데이터: 속성 매핑에 따라 가공된 개체 데이터 · 디렉터리 확장 속성과 사용자 지정 속성 매핑 지원
   - 해설: 에이전트가 변환을 마친 결과를 클라우드로 돌려줍니다.
6. [처리] 프로비전 서비스가 Entra ID에 반영
   - 주체: Entra ID
   - 데이터: user · group 생성·갱신 · 동기화 상태와 워터마크 저장
   - 해설: 서비스가 변경을 커밋하고 다음 실행의 기준점을 저장합니다.
7. [판단] 변경량이 실수 삭제 임계값 이내인가?
   - 주체: Entra ID
   - 위치: 구성 › Properties › Basics 옆 연필 아이콘 › Notification email · Prevent accidental deletions · Accidental deletion threshold [확인 필요: 한글 메뉴명]
   - 데이터: 삭제 개체 수 임계값 · 초과하면 상태에 "Delete threshold exceeded" 표시 · 프로비전 로그에 StagedDelete 항목
   - 해설: 대량 삭제는 구성 오류나 AD 사고일 수 있어 자동으로 멈춥니다. 그룹 프로비전에 설정하면 그룹 자체의 삭제만 막고 멤버 삭제는 막지 못하므로 사용자 동기화에도 설정합니다.
   - 예 → 8
   - 아니오 → [차단] 격리 — 대량 삭제 방지로 동기화 중지 후 알림
8. [끝] 프로비전 로그 기록
   - 주체: 로그
   - 위치: 구성 › 로그 (Logs)
   - 데이터: 프로비전 로그 — 개체별 성공·실패·Skipped·오류 사유 · AD ObjectGuid로 검색 가능
   - 해설: 문제가 생기면 이 로그에서 개체 단위로 원인을 추적합니다. 호출이 대부분 계속 실패하면 구성이 격리(quarantine) 상태가 되어 상태 화면에서 오류 코드와 메시지를 확인합니다.
- 시나리오: 예 :: 변경량이 임계값 이내라 반영하고 로그 기록
- 시나리오: 아니오 :: 변경량이 실수 삭제 임계값을 넘어 격리

> 교육 포인트: 여러 에이전트를 설치하면 자동 장애 조치가 됩니다. 연결이 분리된 여러 포리스트도 한 테넌트로 동기화할 수 있습니다.
>
> 주의: 범위를 바꾼 뒤에는 동기화 다시 시작으로 즉시 반영합니다. 보안 그룹 범위 필터는 중첩 그룹을 포함하지 않습니다. 대량 삭제 차단은 Allow deletes로 삭제를 승인하거나, 원인을 고친 뒤 Restart sync로 거부합니다. 에이전트를 제거하면 포털에서 약 1시간 뒤 Inactive, 약 10일 뒤 목록에서 사라집니다.
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/cloud-sync/what-is-cloud-sync
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/cloud-sync/how-to-configure
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/cloud-sync/how-to-accidental-deletes
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/cloud-sync/how-to-prerequisites
>
> 출처: https://learn.microsoft.com/entra/identity/hybrid/cloud-sync/how-to-troubleshoot
