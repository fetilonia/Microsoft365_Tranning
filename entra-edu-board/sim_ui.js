/* ═════════ 정책 시뮬레이터 UI: 규칙 · 하위 설정 · 콤보박스 ═════════ */

const SIM_OPT_SINGLE = new Set(['device-filter']);
const SIM_NOBADGE = new Set(['identity','identity-exclude','resource','state','grant-mode','grant-op']);
const SIM_CATS = {
  resource:[['앱',['r-apps-all','r-apps-selected']],['사용자 작업',['r-ua-secinfo','r-ua-device']],['인증 컨텍스트',['r-authctx']],['Global Secure Access 트래픽',['r-gsa-internet','r-gsa-m365','r-gsa-private']],['에이전트',['r-agent-res']]],
  'identity-exclude':[['계정',['x-breakglass']],['외부 사용자',['x-guests']]],
  loc:[['포함',['l-any','l-selected','l-compliant']],['제외',['l-ex-trusted','l-ex-compliant']]],
  platform:[['모바일',['p-ios','p-android']],['데스크톱',['p-windows','p-macos','p-linux']]],
  client:[['최신 인증',['c-browser','c-modern']],['레거시 인증',['c-eas','c-legacy']]],
  'device-filter':[['필터 방식',['df-include','df-exclude']]],
  grant:[['인증',['gc-mfa','gc-strength']],['디바이스',['gc-compliant','gc-hybrid']],['앱',['gc-approved-app','gc-app-protection']],['위험 · 계정',['gc-risk-remediation','gc-pwdchange']],['약관 · 신원',['gc-tou','gc-idverify']]],
  session:[['앱 세션',['s-app-restrictions','s-mdca']],['인증 세션',['s-frequency','s-persistent','s-cae','s-resilience','s-token-protection']],['네트워크',['s-gsa-profile']]],
};
const SIM_TEST_CATS = {
  principal:[['사용자 계열',['member-in','member-out','admin','breakglass','guest']],['비사용자 ID',['workload','agent']]],
  resource:[['앱',['t-app','t-app-spo','t-app-other']],['사용자 작업',['t-ua-secinfo','t-ua-device']],['인증 컨텍스트',['t-authctx']],['Global Secure Access',['t-gsa-internet','t-gsa-m365','t-gsa-private']],['에이전트',['t-agent-res']]],
  location:[['네트워크 신호',['trusted','named','other']],['Global Secure Access',['gsa']]],
  device:[['회사 기기',['managed','paw','hybrid-only','noncompliant']],['개인 기기',['byod','personal']]],
  platform:[['모바일',['ios','android']],['데스크톱',['windows','macos','linux']]],
  client:[['브라우저',['browser']],['최신 인증 앱',['ma-approved','ma-other']],['레거시 프로토콜',['eas','legacy']]],
  mfa:[['미수행',['none']],['수행됨',['mfa','pwless','phish']]],
  reg:[['미등록',['none']],['등록됨',['mfa','pwless','phish']]],
};
const SIM_FIELD_SECTIONS = [
  {no:'①', title:'할당', hint:'누구에게 적용하나', fields:['idtype','idmode','idsel','identity-exclude']},
  {no:'②', title:'대상 리소스', hint:'무엇에 접근할 때 (하나 선택)', fields:['resource']},
  {no:'③', title:'조건', hint:'고른 조건만 평가 · 모두 AND', fields:SIM_COND_ORDER},
  {no:'④', title:'액세스 제어 › 허용', hint:'차단하거나, 컨트롤을 요구', fields:['grant-mode','grant','grant-op']},
  {no:'⑤', title:'액세스 제어 › 세션', hint:'허용된 세션을 어떻게 다룰지', fields:['session']},
  {no:'⑥', title:'정책 상태', hint:'', fields:['state']},
];
const SIM_ID_SUB = ['u-groups','u-roles','u-guests'];
const simIdType = ()=> sHas('identity','u-workload')?'workload':sHas('identity','u-agents')?'agent':'users';

/* ─── 하위 설정: 옵션을 고르면 그 아래에 나타나 흐름·판정을 바꾼다 ─── */
const SIM_DF_ITEMS = [
  ['own-ne-company','device.deviceOwnership -ne "Company"','개인 소유(미등록 포함) — 부정 연산자는 미등록 디바이스에도 적용됩니다'],
  ['own-eq-personal','device.deviceOwnership -eq "Personal"','등록된 개인 소유 디바이스만 — 미등록 디바이스는 속성이 null이라 -eq가 일치하지 않습니다'],
  ['saw','device.extensionAttribute1 -eq "SAW"','특권 관리 워크스테이션 같은 사용자 지정 특성'],
  ['trust-hybrid','device.trustType -eq "ServerAD"','하이브리드 Microsoft Entra 조인 디바이스'],
];
const SIM_SUBS = {
  's-app-restrictions':{label:'앱 쪽 정책 (SharePoint 비관리 디바이스)',head:'SharePoint 관리 센터 › 액세스 제어 › 비관리 디바이스',items:[['limited','제한된 웹 전용 (편집 허용)','다운로드·인쇄·동기화 불가, 데스크톱 앱 불가. 브라우저에서 편집은 가능합니다'],['limited-ro','제한된 웹 전용 (편집 불가)','-AllowEditing $false — 브라우저에서도 편집할 수 없습니다'],['full','전체 허용','비관리 디바이스도 전체 경험 (앱 적용 제한의 효과가 없어집니다)'],['block','액세스 차단','“신뢰할 수 없는 디바이스” 접근 거부 메시지']]},
  'r-authctx':{label:'인증 컨텍스트',head:'컨텍스트(예시 ID)',items:[['c1','c1 · 기밀 문서 사이트','앱이 요청에 acrs 클레임(c1)을 담아 이 컨텍스트를 요구합니다'],['c2','c2 · PIM 역할 활성화','PIM 역할 설정에서 컨텍스트로 활성화 요구를 연결'],['c3','c3 · 민감도 레이블 적용 리소스','민감도 레이블에 연결한 보호 요구']]},
  'l-selected':{label:'명명된 위치 유형',head:'위치 유형',items:[['country','국가/지역 위치','IP 주소 매핑 또는 Authenticator GPS로 판정합니다 (GPS는 주기적 프롬프트)'],['ip','IP 범위 위치','NAT 뒤의 공인 IP(CIDR)로 판정 · IPv6는 CIDR로 등록해야 합니다']]},
  'df-include':{label:'디바이스 필터 규칙',head:'규칙 예시',items:SIM_DF_ITEMS},
  'df-exclude':{label:'디바이스 필터 규칙',head:'규칙 예시',items:SIM_DF_ITEMS},
  'gc-strength':{label:'인증 강도',head:'내장 인증 강도',items:[['mfa','다단계 인증','MFA를 충족하는 방법 조합 (암호 없는·피싱 방지 방법 포함)'],['pwless','암호 없는 MFA','Authenticator 암호 없는 로그인 · 패스키 · WHfB 등'],['phish','피싱 방지 MFA','패스키(FIDO2) · WHfB · 인증서 기반 인증만 허용']]},
  's-frequency':{label:'로그인 빈도',head:'재인증 주기',items:[['every','매번(Every time)','세션이 평가될 때마다 재인증 — 5분 안에는 다시 묻지 않습니다'],['1h','1시간',''],['1d','1일',''],['30d','30일',''],['90d','90일 (기본값)','별도 설정이 없을 때의 롤링 창']]},
  's-persistent':{label:'영구 브라우저 세션',head:'유지 방식',items:[['always','항상 유지','브라우저를 닫아도 세션 유지 [확인 필요: 한글 옵션명]'],['never','유지 안 함','브라우저를 닫으면 세션 종료 [확인 필요: 한글 옵션명]']]},
  's-cae':{label:'CAE 사용자 지정',head:'모드',items:[['default','기본(사용)','CAE 지원 클라이언트·리소스에서 이벤트 즉시 반영'],['strict','엄격한 위치 적용 (미리 보기)','허용 IP를 벗어난 접근을 즉시 거부 [확인 필요]'],['disable','사용 안 함','‘모든 리소스’ + 조건 없음인 정책에서만 선택할 수 있습니다 (문서 기준)']],
    dis:v=> v==='disable' && !(sSel('resource')[0]==='r-apps-all' && !SIM_COND_ORDER.some(k=>sSel(k).length)) ? '‘모든 리소스’이면서 조건이 없는 정책에서만 CAE를 끌 수 있습니다' : ''},
  's-mdca':{label:'앱 제어 방식',head:'세션 정책',items:[['monitor','모니터링만','세션을 모니터링하고 Defender for Cloud Apps에 기록 [확인 필요: 한글 옵션명]'],['block','다운로드 차단','다운로드를 차단하는 내장 세션 정책 [확인 필요]'],['custom','사용자 지정 정책','Defender for Cloud Apps에서 만든 세션 정책 사용']]},
};
const simSubVisible = oid => { const g = SIM.cat.opts[oid]?.group; return !!g && sHas(g,oid) && !SIM.cat.opts[oid]?._dis; };

/* ─── 선택에 따라 달라지는 규칙 (문서 기준) ─── */
function simRules(){
  const dis = {}, rec = {}, notes = {};
  const idt = simIdType(), res = sSel('resource')[0]||'', st = sSel('state')[0]||'';
  const block = sHas('grant-mode','g-block'), grants = sSel('grant'), op = sHas('grant-op','go-or')?'or':'and';
  const D = (ids,why)=>ids.forEach(i=>{ if(!dis[i]) dis[i] = why; });
  const note = (k,t)=>{ (notes[k] ||= []).push(t); };
  const groupIds = k => (SIM.cat.groups[k]?.options||[]).map(o=>o.id);
  const condIds = SIM_COND_ORDER.flatMap(groupIds);
  if(idt!=='users'){
    D(['g-grant'],'워크로드 ID·에이전트 ID 대상 정책은 ‘액세스 차단’만 사용할 수 있습니다 (문서 기준)');
    D(['r-ua-secinfo','r-ua-device'],'사용자 작업은 사용자 대상 정책에서만 선택할 수 있습니다');
    D(groupIds('session'),'차단만 가능한 정책이라 세션 컨트롤이 적용되지 않습니다');
    if(idt==='workload') D(condIds.filter(i=>!i.startsWith('l-')),'워크로드 ID 정책은 위치 조건(과 서비스 주체 위험)만 지원합니다 (문서 기준)');
    else {
      D(condIds,'에이전트 ID 정책이 지원하는 조건은 ‘에이전트 위험(미리 보기)’입니다 — 이 시뮬레이터에는 없습니다');
      D(['r-authctx','r-gsa-internet','r-gsa-m365','r-gsa-private'],'에이전트 ID 정책의 대상 리소스는 에이전트 리소스 · 모든 리소스 · 선택한 리소스입니다 (문서 기준)');
    }
  }
  if(st==='st-report') D(['r-ua-secinfo','r-ua-device'],'보고 전용으로는 사용자 작업 범위를 평가할 수 없습니다 (문서 기준)');
  if(res.startsWith('r-ua-')) D(['st-report'],'사용자 작업 범위는 보고 전용으로 평가할 수 없습니다 (문서 기준)');
  if(res==='r-gsa-private') D(['l-compliant','l-ex-compliant'],'규격 네트워크 검사는 Private Access 앱에 지원되지 않습니다 (문서 기준)');
  if(res!=='r-apps-all') D(['s-persistent'],'영구 브라우저 세션은 대상 리소스가 ‘모든 리소스’일 때만 사용할 수 있습니다 (문서 기준)');
  if(res!=='r-gsa-internet') D(['s-gsa-profile'],'Global Secure Access 보안 프로필은 ‘Global Secure Access: 인터넷 트래픽’ 리소스에서 사용합니다');
  if(!['r-apps-all','r-apps-selected'].includes(res)){
    D(['s-token-protection'],'토큰 보호는 대상 리소스가 앱일 때만 의미가 있습니다 (지원 앱 목록 한정)');
    D(['s-app-restrictions'],'앱 적용 제한은 Exchange Online · SharePoint Online 앱에만 적용됩니다');
  }
  if(!sSel('user-risk').length){
    D(['gc-pwdchange'],'암호 변경 필요는 ‘사용자 위험’ 조건과 함께 쓰는 컨트롤입니다 — ③ 조건에서 사용자 위험을 먼저 고르세요');
  } else if(res!=='r-apps-all') D(['gc-pwdchange'],'암호 변경 필요는 대상 리소스가 ‘모든 리소스’일 때만 사용할 수 있습니다 (문서 기준)');
  if(!sSel('user-risk').length && !sSel('signin-risk').length) D(['gc-risk-remediation'],'위험 해결 필요는 사용자 위험 또는 로그인 위험 조건과 함께 씁니다 [확인 필요]');
  const idsel = sSel('identity');
  if(idsel.length && idsel.every(i=>i==='u-guests')) D(['gc-approved-app','gc-app-protection','gc-pwdchange'],'게스트(B2B)는 이 컨트롤을 지원하지 않습니다 (문서 기준)');
  if(!block && grants.length && grants.every(g=>['gc-approved-app','gc-app-protection'].includes(g)) && (grants.length===1 || op==='and'))
    D(['p-macos','p-linux'],'승인된 앱·앱 보호 정책이 단독이거나 ‘모두 필요’일 때는 macOS·Linux 플랫폼을 쓸 수 없습니다 (문서 기준)');
  if(sSel('signin-risk').length){ rec['gc-mfa'] = '로그인 위험 조건의 해결 수단'; rec['gc-strength'] = '로그인 위험 조건의 해결 수단'; }
  if(sSel('user-risk').length){ rec['gc-risk-remediation'] = '사용자 위험 조건의 해결 수단'; rec['gc-pwdchange'] = '사용자 위험 조건의 해결 수단'; }
  if(res==='r-gsa-internet') rec['s-gsa-profile'] = '인터넷 트래픽 리소스에 연결하는 세션 컨트롤';
  if(sHas('loc','l-compliant')||sHas('loc','l-ex-compliant')) note('loc','규격 네트워크는 Global Secure Access가 평가합니다. GSA › 설정 › 세션 관리 › 적응형 액세스에서 조건부 액세스 신호를 켜야 합니다.');
  if(sHas('client','c-eas')) note('client','Exchange ActiveSync 클라이언트 조건은 사용자·그룹 할당에서, 대상 앱을 Exchange Online으로 둘 때 지원됩니다 (문서 기준).');
  if(sHas('client','c-legacy')||sHas('client','c-eas')) note('client','레거시 인증 클라이언트는 MFA·디바이스 상태를 전달하지 못해 대부분 차단 정책의 대상이 됩니다.');
  if(sSel('user-risk').length && sSel('signin-risk').length) note('signin-risk','사용자 위험과 로그인 위험은 서로 다른 정책으로 나눠 구성하는 것이 일반적입니다 [확인 필요].');
  if(block && idt==='users' && sHas('identity','u-all') && !sSel('identity-exclude').length) note('identity-exclude','모든 사용자를 대상으로 차단하려면 비상 접근 계정을 반드시 제외하세요.');
  if(grants.includes('gc-mfa') && grants.includes('gc-strength')) note('grant','MFA 필요와 인증 강도는 함께 쓸 수 없습니다 — 인증 강도가 MFA를 포함합니다.');
  if(grants.includes('gc-pwdchange') && grants.length>1) note('grant','암호 변경 필요는 다른 컨트롤과 함께 쓸 수 없습니다 (문서 기준).');
  return {dis,rec,notes};
}
function simReconcile(){
  const out = SIM.notices; let guard = 0, changed = true;
  const idt = simIdType();
  while(changed && guard++<8){
    changed = false;
    const R = simRules();
    if(idt!=='users' && !sHas('grant-mode','g-block')){ SIM.S['grant-mode'] = ['g-block']; out.push(`‘액세스 허용’ → ‘액세스 차단’ : ${R.dis['g-grant']}`); changed = true; continue; }
    for(const g of SIM.l3.sim.groups){
      const cur = SIM.S[g.key]||[], bad = cur.filter(id=>R.dis[id]); if(!bad.length) continue;
      bad.forEach(id=>out.push(`‘${sLab(id)}’ 해제 : ${R.dis[id]}`));
      if(g.key==='resource') SIM.S.resource = ['r-apps-all']; else if(g.key==='state') SIM.S.state = ['st-on']; else SIM.S[g.key] = cur.filter(id=>!R.dis[id]);
      changed = true;
    }
  }
  Object.entries(SIM_SUBS).forEach(([oid,d])=>{ if(d.dis && d.dis(simSubOf(oid))){ const f = d.items.find(x=>!d.dis(x[0])); SIM.sub[oid] = f[0]; out.push(`${d.label} → ‘${f[1]}’ : ${d.dis(simSubOf(oid)) || '선택할 수 없는 값'}`); } });
  SIM.notices = out.slice(0,6);
  simSyncTest();
}

/* ─── 테스트 로그인: 왼쪽 정책에서 자동으로 가져오고, 정책이 정하지 않는 상황만 입력 ─── */
const SIM_APP_RES = ['t-app','t-app-spo','t-app-other'];
// 정책이 정하는 신호(자동 반영) — 정책에 정의된 조건이 있을 때만
function simDerivedSet(){
  const d = new Set(['principal']);
  if(sSel('loc').length) d.add('location');
  if(sSel('platform').length) d.add('platform');
  if(sSel('client').length) d.add('client');
  if(sSel('signin-risk').length) d.add('signin-risk');
  if(sSel('user-risk').length) d.add('user-risk');
  if(sSel('insider-risk').length) d.add('insider-risk');
  if(sSel('auth-flow').length) d.add('flow');
  if(sSel('device-filter').length) d.add('device');
  if(!['r-apps-all','r-apps-selected'].includes(sSel('resource')[0])) d.add('resource');
  return d;
}
function simDeriveValue(k){
  const T = SIM.T, pick = (ids,map)=>{ const f = ids.find(i=>sHas(i.g,i.id)); return f ? map[f.id] : undefined; };
  switch(k){
    case 'principal': {
      const it = simIdType(); if(it==='workload') return 'workload'; if(it==='agent') return 'agent';
      if(sHas('identity','u-all')) return 'member-in';
      if(sHas('identity','u-roles')) return 'admin';
      if(sHas('identity','u-groups')) return 'member-in';
      if(sHas('identity','u-guests')) return 'guest';
      return 'member-in';
    }
    case 'resource': return {'r-ua-secinfo':'t-ua-secinfo','r-ua-device':'t-ua-device','r-authctx':'t-authctx','r-gsa-internet':'t-gsa-internet','r-gsa-m365':'t-gsa-m365','r-gsa-private':'t-gsa-private','r-agent-res':'t-agent-res'}[sSel('resource')[0]];
    case 'location': return sHas('loc','l-selected') ? 'named' : sHas('loc','l-compliant') ? 'gsa' : 'other';
    case 'platform': { const m = {'p-ios':'ios','p-android':'android','p-windows':'windows','p-macos':'macos','p-linux':'linux'}; const f = Object.keys(m).find(i=>sHas('platform',i)); return f ? m[f] : undefined; }
    case 'client': {
      if(sHas('client','c-browser')) return 'browser';
      if(sHas('client','c-modern')) return (sHas('grant','gc-approved-app')||sHas('grant','gc-app-protection')) ? 'ma-approved' : 'ma-other';
      if(sHas('client','c-eas')) return 'eas';
      if(sHas('client','c-legacy')) return 'legacy';
      return undefined;
    }
    case 'signin-risk': return sHas('signin-risk','sr-high')?'high':sHas('signin-risk','sr-medium')?'medium':sHas('signin-risk','sr-low')?'low':'none';
    case 'user-risk': return sHas('user-risk','ur-high')?'high':sHas('user-risk','ur-medium')?'medium':sHas('user-risk','ur-low')?'low':'none';
    case 'insider-risk': return sHas('insider-risk','ir-elevated')?'elevated':sHas('insider-risk','ir-moderate')?'moderate':sHas('insider-risk','ir-minor')?'minor':'none';
    case 'flow': return sHas('auth-flow','af-devicecode') ? 'devicecode' : 'transfer';
    case 'device': {
      const mode = sHas('device-filter','df-include') ? 'df-include' : 'df-exclude', rule = SIM_DF_RULES[simSubOf(mode)] || SIM_DF_RULES['own-ne-company'];
      if(mode==='df-include') return rule.hit[0];
      return ['managed','personal'].find(d=>!rule.hit.includes(d)) || 'managed';
    }
  }
}
function simSyncTest(){
  if(!SIM.autoTest) return;
  const T = SIM.T, d = simDerivedSet();
  d.forEach(k=>{ if(SIM.scn && k in SIM.scn.over) return; const v = simDeriveValue(k); if(v!==undefined) T[k] = v; });
  ['signin-risk','user-risk','insider-risk'].forEach(k=>{ if(!d.has(k)) T[k] = 'none'; });
  if(!d.has('flow')) T.flow = 'normal';
  if(!d.has('resource') && !SIM_APP_RES.includes(T.resource)) T.resource = 't-app';
}
// 이 정책을 평가하는 데 의미가 있는 신호(왼쪽 입력 + 오른쪽 요약에 나오는 항목)
function simRelevant(k){
  const kind = PRINC_KIND[SIM.T.principal], g = sSel('grant'), blk = sHas('grant-mode','g-block');
  if(k==='principal' || k==='resource') return true;
  if(kind==='워크로드 ID') return k==='location';
  if(kind==='에이전트') return false;
  switch(k){
    case 'signin-risk': return sSel('signin-risk').length>0;
    case 'user-risk': return sSel('user-risk').length>0;
    case 'insider-risk': return sSel('insider-risk').length>0;
    case 'flow': return sSel('auth-flow').length>0;
    case 'mfa': case 'reg': return !blk && (g.includes('gc-mfa')||g.includes('gc-strength'));
    case 'tou': return !blk && g.includes('gc-tou');
    case 'complete': return !blk && (g.some(c=>SIM_INTERACTIVE.has(c)) || sHas('session','s-frequency'));
    case 'activity': return !blk && sHas('session','s-mdca');
    case 'replay': return !blk && sHas('session','s-token-protection');
    case 'caeevt': return !blk && sHas('session','s-cae');
    case 'sessage': return !blk && sHas('session','s-frequency');
    case 'outage': return !blk && sHas('session','s-resilience');
    case 'gsaact': return !blk && sHas('session','s-gsa-profile');
  }
  return true;
}
const simTestSource = k => (SIM.scn && k in SIM.scn.over) ? '시나리오' : !SIM.autoTest ? '수동' : simDerivedSet().has(k) ? '정책' : '입력';
// 왼쪽 ⑦ 섹션에서 직접 고르는 항목: 자동 모드에서는 정책이 정하지 않는 신호만, 수동 모드에서는 전부
function simInputKeys(){ return SIM_TESTS.map(t=>t.k).filter(k=>simRelevant(k) && (!SIM.autoTest || !simDerivedSet().has(k))); }

/* ─── 필드 정의 ─── */
function simOptItem(gk,id,R){
  const un = !SIM_NOBADGE.has(gk) && !sSupported(id,SIM.T.principal);
  return {v:id,label:sLab(id),desc:sOf(id,'소개'),badge:un?'현재 테스트 주체 미지원':'',dis:(R&&R.dis[id])||'',rec:(R&&R.rec[id])||''};
}
function simCatsOf(gk,R){
  const g = SIM.cat.groups[gk], all = g.options.map(o=>o.id), spec = SIM_CATS[gk]||[[null,all]], used = new Set();
  const out = spec.map(([h,ids])=>[h,ids.filter(i=>all.includes(i)).map(i=>(used.add(i),simOptItem(gk,i,R)))]).filter(c=>c[1].length);
  const rest = all.filter(i=>!used.has(i)); if(rest.length) out.push([out.length?'기타':null,rest.map(i=>simOptItem(gk,i,R))]);
  return out;
}
function simDef(id){
  const T = SIM.T, R = simRules();
  if(id==='preset'){
    const P = SIM.l3.sim.presets, cats = [], seen = new Map();
    P.forEach((p,i)=>{ const c = p.cat||'예시'; if(!seen.has(c)){ seen.set(c,[]); cats.push([c,seen.get(c)]); } seen.get(c).push({v:String(i),label:p.name,desc:p.desc}); });
    cats.push(['처음부터',[{v:'-1',label:'빈 정책으로 시작',desc:'모든 선택을 지우고 직접 구성합니다'}]]);
    return {id,label:'예시 정책',cats,ph:'예시 정책 고르기…',sel:()=>SIM.presetName?[String(P.findIndex(p=>p.name===SIM.presetName))]:[],
      pick:v=>{ if(v==='-1'){ stopAll(); SIM.S = simDefaultPolicy(); Object.keys(SIM.S).forEach(k=>{ if(!SIM_SINGLE.has(k)) SIM.S[k]=[]; }); SIM.sub = simSubDefaults(); SIM.presetName=''; SIM.detail=null; } else simApplyPreset(P[+v]); }};
  }
  if(id==='idtype') return {id,label:'대상 유형',gk:'identity',ph:'선택…',
    cats:[['사용자 계열',[{v:'users',label:'사용자 및 그룹',desc:'사용자·그룹·디렉터리 역할·게스트를 대상으로 합니다'}]],['사용자가 아닌 ID',[{v:'workload',label:sLab('u-workload'),desc:sOf('u-workload','소개')},{v:'agent',label:sLab('u-agents'),desc:sOf('u-agents','소개')}]]],
    sel:()=>[simIdType()],
    pick:v=>{
      const T = SIM.T, o = SIM.notices;
      if(v==='users'){ SIM.S.identity = ['u-all']; if(['workload','agent'].includes(T.principal)){ T.principal = 'member-in'; o.push('테스트 로그인 주체를 ‘일반 사용자’로 맞췄습니다'); } if(T.resource==='t-agent-res') T.resource = 't-app'; }
      else if(v==='workload'){ SIM.S.identity = ['u-workload']; T.principal = 'workload'; if(T.resource.startsWith('t-ua-')) T.resource = 't-app'; o.push('테스트 로그인 주체를 ‘워크로드 ID’로 맞췄습니다'); }
      else { SIM.S.identity = ['u-agents']; SIM.S.resource = ['r-agent-res']; T.principal = 'agent'; T.resource = 't-agent-res'; o.push('대상 리소스를 ‘에이전트 리소스’로, 테스트 주체를 ‘Agent ID’로 맞췄습니다'); }
      SIM.detail = {g:'identity',o:v==='users'?'u-all':v==='workload'?'u-workload':'u-agents'};
    }};
  if(id==='idmode') return {id,label:'포함',gk:'identity',ph:'선택…',visible:()=>simIdType()==='users',
    cats:[['포함 범위',[{v:'all',label:sLab('u-all'),desc:sOf('u-all','소개')},{v:'selected',label:'선택한 사용자 및 그룹',desc:'아래 목록에서 대상을 직접 고릅니다 (모든 사용자와 동시에 선택할 수 없음)'}]]],
    sel:()=>sHas('identity','u-all')?['all']:SIM.S.identity.some(i=>SIM_ID_SUB.includes(i))?['selected']:[],
    pick:v=>{ if(v==='all') SIM.S.identity=['u-all']; else { const keep = SIM.S.identity.filter(i=>SIM_ID_SUB.includes(i)); SIM.S.identity = keep.length?keep:['u-groups']; } SIM.detail = {g:'identity',o:v==='all'?'u-all':'u-groups'}; }};
  if(id==='idsel') return {id,label:'선택한 대상',gk:'identity',multi:true,ph:'대상을 고르세요…',visible:()=>simIdType()==='users' && !sHas('identity','u-all'),
    cats:[['사용자 · 그룹',[simOptItem('identity','u-groups',R)]],['역할',[simOptItem('identity','u-roles',R)]],['외부',[simOptItem('identity','u-guests',R)]]],
    sel:()=>SIM.S.identity.filter(i=>SIM_ID_SUB.includes(i)),
    clear:()=>{ SIM.S.identity = SIM.S.identity.filter(i=>!SIM_ID_SUB.includes(i)); },
    pick:v=>{ const cur = SIM.S.identity.filter(i=>SIM_ID_SUB.includes(i)); SIM.S.identity = cur.includes(v)?cur.filter(x=>x!==v):cur.concat(v); SIM.detail = {g:'identity',o:v}; }};
  if(id.startsWith('t:')){
    const k = id.slice(2), t = SIM_TESTS.find(x=>x.k===k);
    let spec = SIM_TEST_CATS[k]||[[null,t.o.map(x=>x[0])]], label = t.label;
    if(k==='resource' && SIM.autoTest){ label = '접근 앱'; const all = sHas('resource','r-apps-all'); spec = [['앱',all?SIM_APP_RES:['t-app','t-app-spo']]]; }
    return {id,label,test:k,ph:'선택…',cats:spec.map(([h,vs])=>[h,vs.map(v=>({v,label:TLAB(k,v)}))]),sel:()=>[T[k]],pick:v=>{ T[k]=v; }};
  }
  if(id.startsWith('sub:')){
    const oid = id.slice(4), d = SIM_SUBS[oid]; if(!d) return null;
    return {id,label:d.label,sub:true,ph:'선택…',cats:[[d.head||null,d.items.map(([v,l,ds])=>({v,label:l,desc:ds,dis:d.dis?d.dis(v):''}))]],sel:()=>[simSubOf(oid)],pick:v=>{ SIM.sub[oid] = v; SIM.detail = {g:SIM.cat.opts[oid].group,o:oid}; }};
  }
  const g = SIM.cat.groups[id]; if(!g) return null;
  const single = SIM_SINGLE.has(id)||SIM_OPT_SINGLE.has(id);
  const vis = id==='grant' ? ()=>!sHas('grant-mode','g-block') : id==='grant-op' ? ()=>!sHas('grant-mode','g-block') && sSel('grant').length>1 : null;
  return {id,gk:id,label:g.title.replace(/^[^›]*›\s*/,''),multi:!single,optional:SIM_OPT_SINGLE.has(id),ph:single?'선택…':'미사용',visible:vis,cats:simCatsOf(id,R),sel:()=>sSel(id).slice(),notes:R.notes[id]||[],
    clear:()=>{ SIM.S[id]=[]; },
    pick:v=>{
      if(v===''){ SIM.S[id]=[]; return; }
      if(single){ SIM.S[id]=[v]; SIM.detail = {g:id,o:v}; return; }
      const cur = SIM.S[id]||[], adding = !cur.includes(v), o = SIM.notices;
      let next = adding ? cur.concat(v) : cur.filter(x=>x!==v);
      if(id==='grant' && adding){
        const drop = (x,why)=>{ if(next.includes(x)){ next = next.filter(y=>y!==x); o.push(`‘${sLab(x)}’ 해제 : ${why}`); } };
        if(v==='gc-strength') drop('gc-mfa','인증 강도가 MFA 요구를 포함합니다');
        if(v==='gc-mfa') drop('gc-strength','MFA 필요와 인증 강도는 함께 쓸 수 없습니다');
        if(v==='gc-pwdchange') next.filter(x=>x!==v).forEach(x=>drop(x,'암호 변경 필요는 다른 컨트롤과 함께 쓸 수 없습니다'));
        else drop('gc-pwdchange','암호 변경 필요는 다른 컨트롤과 함께 쓸 수 없습니다');
      }
      SIM.S[id] = next; SIM.detail = {g:id,o:v};
    }};
}
function simTrigger(d){
  const sel = d.sel(), items = d.cats.flatMap(c=>c[1]);
  let inner;
  if(!sel.length) inner = `<span class="cph">${esc(d.ph||'선택 안 함')}</span>`;
  else if(d.multi){
    const it = sel.map(v=>items.find(x=>x.v===v)).filter(Boolean);
    inner = it.slice(0,2).map(x=>`<span class="ctag">${esc(x.label)}${x.badge?' ⚠':''}</span>`).join('') + (it.length>2?`<span class="ctag more">+${it.length-2}</span>`:'');
  } else { const it = items.find(x=>x.v===sel[0]); inner = `<span class="cval">${esc(it?it.label:sel[0])}${it&&it.badge?' ⚠':''}</span>`; }
  return `<button type="button" class="cb" data-f="${esc(d.id)}" aria-haspopup="listbox" title="${esc(sel.map(v=>(items.find(x=>x.v===v)||{}).label||v).join(' · '))}"><span class="cv">${inner}</span><span class="car">▾</span></button>`;
}
function simField(id){
  const d = simDef(id); if(!d || (d.visible && !d.visible())) return '';
  const cnt = d.multi && d.sel().length ? ` <i>${d.sel().length}개</i>` : '';
  const nt = (d.notes||[]).map(t=>`<div class="fnote">${esc(t)}</div>`).join('');
  return `<div class="fld${d.sub?' sub':''}"><div class="fl"${d.gk?` data-g="${d.gk}" title="누르면 이 항목 설명을 아래에 표시"`:''}>${d.sub?'↳ ':''}${esc(d.label)}${cnt}${d.gk?' <u>ⓘ</u>':''}</div>${simTrigger(d)}${nt}</div>`;
}
function simFieldsFor(f){
  const h = simField(f); if(!h) return [];
  const out = [h];
  Object.keys(SIM_SUBS).forEach(oid=>{ if(SIM.cat.opts[oid]?.group===f && sHas(f,oid)) out.push(simField('sub:'+oid)); });
  return out;
}

/* ─── 페이지 안에서 그리는 드롭다운 (시스템 select 미사용) ─── */
function closePop(){ SIM.pop = null; const p = document.getElementById('cbPop'); if(p) p.remove(); }
function placePop(){
  const P = SIM.pop, pop = document.getElementById('cbPop'); if(!P||!pop) return;
  const trig = document.querySelector(`.cb[data-f="${CSS.escape(P.fid)}"]`); if(!trig){ closePop(); return; }
  const r = trig.getBoundingClientRect(), cr = ($('#center')||document.body).getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
  if(r.bottom < cr.top+4 || r.top > Math.min(vh,cr.bottom)-4){ closePop(); return; }
  const w = Math.min(Math.max(r.width,320), vw-16);
  pop.style.width = w+'px'; pop.style.left = Math.min(Math.max(8,r.left), vw-w-8)+'px';
  const below = vh - r.bottom - 10, above = r.top - 10;
  pop.style.maxHeight = '360px'; const want = Math.min(360, pop.scrollHeight);
  const down = below >= Math.min(want,220) || below >= above;
  pop.style.maxHeight = Math.max(120, Math.min(360, down?below:above))+'px';
  const h = pop.offsetHeight;
  pop.style.top = (down ? r.bottom+4 : Math.max(8, r.top-h-4))+'px';
}
function renderPop(){
  const P = SIM.pop; if(!P){ closePop(); return; }
  const d = simDef(P.fid); if(!d || (d.visible && !d.visible())){ closePop(); return; }
  let pop = document.getElementById('cbPop'); const keep = pop ? (pop.querySelector('.cbl')||{}).scrollTop||0 : 0;
  if(!pop){ pop = document.createElement('div'); pop.id = 'cbPop'; pop.className = 'cbpop'; pop.setAttribute('role','listbox'); document.getElementById('app').appendChild(pop); }
  const sel = new Set(d.sel());
  let h = '<div class="cbl">';
  if(d.optional) h += `<button type="button" class="cbo none${sel.size?'':' on'}" data-v=""><span class="ck r"></span><span class="tx"><b>(사용 안 함)</b></span></button>`;
  d.cats.forEach(([hd,items])=>{
    if(hd) h += `<div class="cbh">${esc(hd)}</div>`;
    items.forEach(it=>{
      h += `<button type="button" class="cbo${sel.has(it.v)?' on':''}${it.dis?' dis':''}" data-v="${esc(it.v)}" role="option" aria-selected="${sel.has(it.v)}"${it.dis?' aria-disabled="true"':''}><span class="ck${d.multi?'':' r'}"></span><span class="tx"><b>${esc(it.label)}</b>${it.desc?`<i>${esc(it.desc)}</i>`:''}${it.dis?`<i class="rs">⛔ ${esc(it.dis)}</i>`:''}${it.rec?`<i class="rc">👍 ${esc(it.rec)}</i>`:''}</span>${it.badge?`<em class="bg">${esc(it.badge)}</em>`:''}</button>`;
    });
  });
  h += '</div>';
  if(d.multi) h += `<div class="cbf"><button type="button" data-act="clear">모두 해제</button><button type="button" data-act="close">닫기</button></div>`;
  pop.innerHTML = h;
  const list = pop.querySelector('.cbl'); list.scrollTop = keep;
  pop.onclick = e=>{
    const act = e.target.closest('[data-act]');
    if(act){ if(act.dataset.act==='clear'){ SIM.notices = []; const dd = simDef(P.fid); dd.clear && dd.clear(); SIM.presetName=''; simReconcile(); simRefresh(); } else closePop(); return; }
    const o = e.target.closest('.cbo'); if(!o) return;
    if(o.classList.contains('dis')){ const dd = simDef(P.fid); const it = dd.cats.flatMap(c=>c[1]).find(x=>x.v===o.dataset.v); if(it){ SIM.detail = {g:(dd.gk||P.fid.replace(/^sub:/,'')),o:o.dataset.v}; renderSimDetail(); } return; }
    SIM.notices = [];
    const dd = simDef(P.fid); dd.pick(o.dataset.v);
    if(P.fid!=='preset' && !P.fid.startsWith('t:')) SIM.presetName = '';
    if(!dd.multi) closePop();
    simReconcile(); simRefresh();
  };
  pop.onkeydown = e=>{
    if(e.key==='Escape'){ const t = document.querySelector(`.cb[data-f="${CSS.escape(P.fid)}"]`); closePop(); t && t.focus(); return; }
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){ const os = [...pop.querySelectorAll('.cbo')], i = os.indexOf(document.activeElement); const n = os[Math.min(os.length-1,Math.max(0,i+(e.key==='ArrowDown'?1:-1)))]; if(n){ n.focus(); e.preventDefault(); } }
  };
  placePop();
}
function openPop(fid, focusFirst){ SIM.pop = {fid}; const tg = document.querySelector(`.cb[data-f="${CSS.escape(fid)}"]`); if(tg) tg.scrollIntoView({block:'nearest'}); renderPop(); if(focusFirst){ const f = document.querySelector('#cbPop .cbo.on')||document.querySelector('#cbPop .cbo'); f && f.focus(); } }
if(!window.__cbBound){
  window.__cbBound = true;
  document.addEventListener('mousedown', e=>{ if(!SIM.pop) return; if(e.target.closest('#cbPop')||e.target.closest('.cb')) return; closePop(); });
  document.addEventListener('scroll', ()=>{ if(SIM.pop) placePop(); }, true);
  addEventListener('resize', ()=>{ if(SIM.pop) placePop(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape' && SIM.pop){ closePop(); } });
}

/* ─── 패널 ─── */
function simSubText(id){ const g = SIM.cat.opts[id]?.group; return (g && sHas(g,id) && SIM_SUB_LABEL[id]) ? SIM_SUB_LABEL[id](simSubOf(id)) : ''; }
function renderSimSummary(){
  const R = SIM.result, esc2 = esc;
  const chips = (arr,cls)=> arr.length ? arr.map(x=>`<em class="sch${cls?' '+cls:''}">${esc2(x)}</em>`).join('') : '<i class="none">없음</i>';
  const row = (t,h)=>`<div class="srow"><span>${t}</span><div>${h}</div></div>`;
  const ids = k => sSel(k).map(i=>{ const sb = simSubText(i); return sLab(i)+(sb?` · ${sb}`:''); });
  const gTitle = k => (SIM.cat.groups[k]?.title||k).replace(/^[^›]*›\s*/,'').replace(/\(.*\)$/,'').trim();
  const idt = simIdType(), block = sHas('grant-mode','g-block');
  let h = `<div class="sumcard"><div class="sch-h"><b>📋 정책 요약</b><span class="stchip">${esc2(sLabels('state')||'')}</span></div>`;
  if(R){ const e = R.endNode, rtB = R.outcome==='blocked' && e.phase==='runtime'; const m = rtB ? ['bad','토큰 발급 후 차단'] : {ok:['ok','접근 허용'],blocked:['bad','차단'],na:['na','정책 미적용'],off:['na','평가 안 함'],rblocked:['warn','보고 전용 — 차단됐을 요청']}[R.outcome]; h += `<div class="sres ${m[0]}">예상 결과 · <b>${m[1]}</b></div>`; }
  h += row('① 할당',`<div class="kv"><b>포함</b>${chips(idt==='users' ? (sHas('identity','u-all') ? [sLab('u-all')] : sSel('identity').map(sLab)) : sSel('identity').map(sLab))}</div><div class="kv"><b>제외</b>${chips(sSel('identity-exclude').map(sLab),'ex')}</div>`);
  h += row('② 대상 리소스',chips(ids('resource')));
  const conds = SIM_COND_ORDER.filter(k=>sSel(k).length);
  h += row('③ 조건',conds.length ? conds.map(k=>`<div class="kv"><b>${esc2(gTitle(k))}</b>${chips(ids(k),/^l-ex|^x-/.test(sSel(k)[0])?'ex':'')}</div>`).join('') : '<i class="none">없음 — 모든 로그인에 적용</i>');
  h += row('④ 허용',block ? `<div class="kv">${chips(['액세스 차단'],'bad')}</div>` : (sSel('grant').length ? `<div class="kv">${chips(ids('grant'))}</div>` + (sSel('grant').length>1 ? `<div class="kv"><b>결합</b>${chips([sLabels('grant-op')])}</div>` : '') : '<i class="none">추가 요구 없음</i>'));
  h += row('⑤ 세션',chips(ids('session')));
  h += `</div>`;

  const keys = SIM_TESTS.map(t=>t.k).filter(simRelevant);
  h += `<div class="sumcard"><div class="sch-h"><b>🧪 테스트 로그인</b><span class="stchip">${SIM.autoTest?'정책에서 자동 구성':'수동'}</span></div>`;
  h += `<div class="trows">` + keys.map(k=>{
    const t = SIM_TESTS.find(x=>x.k===k), src = simTestSource(k), v = SIM.T[k];
    const lab = (k==='resource' && SIM.autoTest && !simDerivedSet().has('resource')) ? '접근 앱' : t.label;
    return `<div class="trow"><span>${esc2(lab)}</span><b>${esc2(TLAB(k,v))}</b><em class="src ${src==='정책'?'pol':src==='입력'?'inp':src==='시나리오'?'scn':'man'}">${src}</em></div>`;
  }).join('') + `</div><div class="sumnote">왼쪽에서 정한 조건이 그대로 반영됩니다. <em class="src pol">정책</em> 정책에서 가져온 값 · <em class="src inp">입력</em> 왼쪽 ⑦에서 고른 값</div></div>`;
  return h;
}
function renderSimPanel(){
  const box = $('#simPanel'); if(!box){ closePop(); return; }
  let h = `<div class="sim-grid"><div class="sim-policy">`;
  if(SIM.notices.length) h += `<div class="autonote"><div class="at"><b>🔄 선택에 맞춰 자동으로 조정했습니다</b><button type="button" id="noteX" title="닫기">✕</button></div><ul>${SIM.notices.map(n=>`<li>${esc(n)}</li>`).join('')}</ul></div>`;
  h += `<div class="sec"><div class="sh"><b>예시 정책</b><small>고르면 아래 설정이 채워집니다</small></div><div class="fgrid">${simField('preset')}</div></div>`;
  SIM_FIELD_SECTIONS.forEach(sec=>{
    const fs = sec.fields.flatMap(simFieldsFor);
    h += `<div class="sec"><div class="sh"><b>${sec.no} ${sec.title}</b><small>${sec.hint}</small></div>`;
    if(sec.title==='액세스 제어 › 허용' && sHas('grant-mode','g-block')) h += `<div class="note-b">‘액세스 차단’을 고르면 허용 컨트롤은 평가하지 않습니다. 컨트롤을 요구하려면 ‘액세스 허용’을 고르세요.</div>`;
    if(sec.title==='할당' && simIdType()!=='users') h += `<div class="note-b">${simIdType()==='workload'?'워크로드 ID 정책은 위치 조건(과 서비스 주체 위험)과 ‘액세스 차단’만 사용할 수 있습니다 (문서 기준).':'에이전트 ID 정책은 에이전트 위험 조건(미리 보기)과 ‘액세스 차단’만 사용할 수 있습니다 (문서 기준).'}</div>`;
    h += `<div class="fgrid">${fs.join('')}</div></div>`;
  });
  const ins = simInputKeys().map(k=>simField('t:'+k)).filter(Boolean);
  h += `<div class="sec"><div class="sh"><b>⑦ 로그인 상황</b><small>${SIM.autoTest?'정책이 정하지 않는 신호 · 이 값으로 평가':'모든 신호를 직접 지정'}</small></div>`;
  h += ins.length ? `<div class="fgrid">${ins.join('')}</div>` : `<div class="note-b">추가로 고를 상황이 없습니다. 정책이 정한 신호만으로 평가합니다.</div>`;
  h += `<button type="button" class="tgl" id="tglAuto">${SIM.autoTest?'테스트 로그인을 직접 지정하기 (정책과 다른 로그인으로 평가)':'정책에서 자동으로 가져오기'}</button></div>`;
  h += `</div><div class="sim-sum">${renderSimSummary()}</div></div>`;
  box.innerHTML = h;
  box.querySelectorAll('.cb').forEach(b=>b.onclick=()=>{ if(SIM.pop && SIM.pop.fid===b.dataset.f) closePop(); else openPop(b.dataset.f,false); });
  box.querySelectorAll('.cb').forEach(b=>b.onkeydown=e=>{ if(e.key==='ArrowDown'){ e.preventDefault(); openPop(b.dataset.f,true); } });
  box.querySelectorAll('.fl[data-g]').forEach(b=>b.onclick=()=>{ SIM.detail = {g:b.dataset.g}; renderSimDetail(); });
  const nx = $('#noteX'); if(nx) nx.onclick = ()=>{ SIM.notices = []; renderSimPanel(); };
  const ta = $('#tglAuto'); if(ta) ta.onclick = ()=>{ SIM.autoTest = !SIM.autoTest; if(SIM.autoTest) simSyncTest(); simRefresh(); };
  if(SIM.pop) renderPop();
}
function simToggle(g,o){
  SIM.notices = [];
  const d = simDef(g); if(d && d.pick) d.pick(o); else SIM.S[g] = [o];
  SIM.presetName = ''; simReconcile(); simRefresh();
}
