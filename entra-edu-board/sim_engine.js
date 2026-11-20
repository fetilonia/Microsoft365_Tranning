/* ═════════ 조건부 액세스 정책 시뮬레이터 ═════════
   카탈로그(MD)는 문구를, 이 엔진은 판정 규칙을 가진다. 옵션 id가 둘을 잇는다. */
const SIM = {S:null, T:null, cat:null, l3:null, detail:null, presetName:'', openG:new Set(), pop:null, sub:{}, notices:[], autoTest:true, view:'path', scn:null, scnList:null, scnIdx:0};
const SIM_DF_RULES = {
  'own-ne-company':{expr:'device.deviceOwnership -ne "Company"', hit:['personal','byod'], neg:true},
  'own-eq-personal':{expr:'device.deviceOwnership -eq "Personal"', hit:['byod'], neg:false},
  'saw':{expr:'device.extensionAttribute1 -eq "SAW"', hit:['paw'], neg:false},
  'trust-hybrid':{expr:'device.trustType -eq "ServerAD"', hit:['managed','hybrid-only','paw'], neg:false},
};
const SIM_SUB_LABEL = {
  's-app-restrictions':v=>({limited:'비관리 디바이스: 제한된 웹 전용','limited-ro':'비관리 디바이스: 제한(편집 불가)',full:'비관리 디바이스: 전체 허용',block:'비관리 디바이스: 차단'}[v]||v),
  'r-authctx':v=>({c1:'c1 · 기밀 문서 사이트',c2:'c2 · PIM 역할 활성화',c3:'c3 · 민감도 레이블'}[v]||v),
  'l-selected':v=>({country:'국가/지역 위치',ip:'IP 범위 위치'}[v]||v),
  'df-include':v=>(SIM_DF_RULES[v]||{}).expr||v,
  'df-exclude':v=>(SIM_DF_RULES[v]||{}).expr||v,
  'gc-strength':v=>({mfa:'강도: 다단계 인증',pwless:'강도: 암호 없는 MFA',phish:'강도: 피싱 방지 MFA'}[v]||v),
  's-frequency':v=>({every:'매번 재인증','1h':'1시간마다','1d':'1일마다','30d':'30일마다','90d':'90일마다(기본)'}[v]||v),
  's-persistent':v=>({always:'항상 유지',never:'유지 안 함'}[v]||v),
  's-cae':v=>({default:'기본(사용)',strict:'엄격한 위치 적용',disable:'사용 안 함'}[v]||v),
  's-mdca':v=>({monitor:'모니터링만',block:'다운로드 차단',custom:'사용자 지정 정책'}[v]||v),
};
function simSubDefaults(){ return {'s-app-restrictions':'limited','gc-strength':'mfa','s-frequency':'1d','s-persistent':'never','s-cae':'default','s-mdca':'monitor','df-include':'own-ne-company','df-exclude':'saw','l-selected':'country','r-authctx':'c1'}; }
const simSubOf = id => (SIM.sub||{})[id] || simSubDefaults()[id];

const SIM_SECTIONS = [
  {no:'①', title:'할당', hint:'누구에게', groups:['identity','identity-exclude']},
  {no:'②', title:'대상 리소스', hint:'무엇에 접근할 때 (하나 선택)', groups:['resource']},
  {no:'③', title:'조건', hint:'어떤 신호일 때 (고른 것만 평가 · 모두 AND)', groups:['loc','platform','client','device-filter','user-risk','signin-risk','insider-risk','auth-flow']},
  {no:'④', title:'액세스 제어 › 허용', hint:'차단하거나, 컨트롤을 요구', groups:['grant-mode','grant','grant-op']},
  {no:'⑤', title:'액세스 제어 › 세션', hint:'허용된 세션을 어떻게 다룰지', groups:['session']},
  {no:'⑥', title:'정책 상태', hint:'', groups:['state']},
];
const SIM_SINGLE = new Set(['resource','grant-mode','grant-op','state']);
const SIM_COND_ORDER = ['loc','platform','client','device-filter','signin-risk','user-risk','insider-risk','auth-flow'];
const SIM_GRANT_ORDER = ['gc-mfa','gc-strength','gc-compliant','gc-hybrid','gc-approved-app','gc-app-protection','gc-risk-remediation','gc-pwdchange','gc-tou','gc-idverify'];
const SIM_INTERACTIVE = new Set(['gc-mfa','gc-strength','gc-pwdchange','gc-tou','gc-risk-remediation','gc-idverify']);

const PRINC = {'member-in':'일반 사용자(대상 그룹 멤버)','member-out':'일반 사용자(대상 그룹 아님)','admin':'디렉터리 역할 관리자','guest':'외부 게스트','breakglass':'비상 접근 계정','workload':'워크로드 ID','agent':'Agent ID'};
const PRINC_KIND = {'member-in':'사용자','member-out':'사용자','admin':'사용자','guest':'게스트','breakglass':'사용자','workload':'워크로드 ID','agent':'에이전트'};
const SIM_TESTS = [
  {k:'principal', label:'로그인 주체', o:Object.entries(PRINC)},
  {k:'resource', label:'접근 대상', o:[['t-app','선택한 앱 (예: Exchange Online)'],['t-app-spo','선택한 앱 (예: SharePoint Online)'],['t-app-other','선택하지 않은 앱'],['t-ua-secinfo','작업: 보안 정보 등록'],['t-ua-device','작업: 디바이스 등록·조인'],['t-authctx','인증 컨텍스트 요구 리소스'],['t-gsa-internet','GSA 인터넷 트래픽'],['t-gsa-m365','GSA Microsoft 트래픽'],['t-gsa-private','GSA 프라이빗 트래픽'],['t-agent-res','에이전트 리소스']]},
  {k:'location', label:'접속 위치', o:[['trusted','신뢰 위치 (회사 IP)'],['named','선택한 명명된 위치 (예: 고위험 국가)'],['gsa','GSA 규격 네트워크 경유'],['other','그 외 인터넷']]},
  {k:'device', label:'디바이스', o:[['managed','회사 기기 — 준수 + 하이브리드 조인'],['hybrid-only','하이브리드 조인 · 준수 아님'],['noncompliant','Entra 등록 · 준수 아님'],['byod','Entra 등록된 개인 기기 · 준수 아님'],['personal','개인 기기 · Entra 미등록'],['paw','특권 관리 워크스테이션(PAW)']]},
  {k:'platform', label:'플랫폼', o:[['windows','Windows'],['macos','macOS'],['linux','Linux'],['ios','iOS'],['android','Android']]},
  {k:'client', label:'클라이언트 앱', o:[['browser','브라우저'],['ma-approved','모바일 앱 — 승인된 앱 + 앱 보호'],['ma-other','모바일·데스크톱 앱 — 그 외'],['eas','Exchange ActiveSync'],['legacy','기타 레거시 프로토콜']]},
  {k:'signin-risk', label:'로그인 위험', o:[['none','없음'],['low','낮음'],['medium','중간'],['high','높음']]},
  {k:'user-risk', label:'사용자 위험', o:[['none','없음'],['low','낮음'],['medium','중간'],['high','높음']]},
  {k:'insider-risk', label:'내부자 위험', o:[['none','없음'],['minor','minor'],['moderate','moderate'],['elevated','elevated']]},
  {k:'flow', label:'인증 흐름', o:[['normal','일반'],['devicecode','디바이스 코드 흐름'],['transfer','인증 전송']]},
  {k:'mfa', label:'이미 수행한 MFA', o:[['none','없음'],['mfa','MFA 수행됨(세션 클레임)'],['pwless','암호 없는 MFA 수행됨'],['phish','피싱 방지 MFA 수행됨']]},
  {k:'reg', label:'등록된 인증 방법', o:[['none','없음'],['mfa','Authenticator · 문자 등'],['pwless','Authenticator 암호 없는 로그인'],['phish','패스키(FIDO2) · WHfB']]},
  {k:'tou', label:'약관 동의 이력', o:[['no','동의 안 함'],['yes','동의함']]},
  {k:'complete', label:'추가 요구를 수행', o:[['yes','수행 가능'],['no','수행 못 함 / 거부']]},
  {k:'activity', label:'앱 제어 활동', o:[['browse','일반 탐색'],['download','파일 다운로드']]},
  {k:'replay', label:'토큰 사용 기기', o:[['same','발급받은 기기'],['other','다른 기기(토큰 재사용)']]},
  {k:'caeevt', label:'CAE 이벤트', o:[['none','없음'],['disable','계정 비활성화 · 암호 재설정'],['ipout','허용 위치 이탈']]},
  {k:'sessage', label:'마지막 인증 후 경과', o:[['5m','방금 (5분 이내)'],['6h','6시간'],['2d','2일'],['40d','40일'],['100d','100일']]},
  {k:'outage', label:'Entra 서비스 상태', o:[['ok','정상'],['outage','장애 중']]},
  {k:'gsaact', label:'GSA 접속 대상', o:[['allowed','허용 범주'],['blocked','차단 범주']]},
];
const TLAB = (k,v)=> (SIM_TESTS.find(t=>t.k===k)?.o.find(x=>x[0]===v)||[0,v])[1];

function simDefaultPolicy(){ return {identity:['u-all'],'identity-exclude':['x-breakglass'],resource:['r-apps-all'],loc:[],platform:[],client:[],'device-filter':[],'user-risk':[],'signin-risk':[],'insider-risk':[],'auth-flow':[],'grant-mode':['g-grant'],grant:['gc-mfa'],'grant-op':['go-and'],session:[],state:['st-on']}; }
function simDefaultTest(){ return {activity:'browse',replay:'same',caeevt:'none',sessage:'5m',outage:'ok',gsaact:'allowed',principal:'member-in',resource:'t-app',location:'other',device:'personal',platform:'windows',client:'browser','signin-risk':'none','user-risk':'none','insider-risk':'none',flow:'normal',mfa:'none',reg:'mfa',tou:'no',complete:'yes'}; }

/* ─── 카탈로그 접근 ─── */
const sOpt = id => SIM.cat.opts[id];
const sLab = id => sOpt(id)?.label || id;
const sOf = (id,k) => sOpt(id)?.f[k] || '';
const sGf = (key,k) => SIM.cat.groups[key]?.f[k] || '';
const sSel = k => SIM.S[k] || [];
const sHas = (k,id) => sSel(k).includes(id);
const sLabels = k => sSel(k).map(sLab).join(' · ');
function sSupported(id, principal){
  const raw = sOf(id,'지원 주체'); if(!raw) return true;
  const first = raw.split(/\.\s|\.$/)[0].replace(/\([^)]*\)/g,'').replace(/\[[^\]]*\]/g,'');
  const kind = PRINC_KIND[principal];
  if(kind==='게스트') return first.includes('게스트') || first.includes('사용자');
  if(kind==='사용자') return first.includes('사용자');
  return first.includes(kind);
}

/* ─── 판정 규칙 ─── */
function simMatchIdentity(){
  const T = SIM.T, inc = sSel('identity'), pr = T.principal;
  if(!inc.length) return {ok:false, why:'포함 대상이 비어 있음 — 포털은 이 상태로 저장하지 않습니다'};
  const map = {'u-all':['member-in','member-out','admin','guest','breakglass'],'u-groups':['member-in'],'u-roles':['admin'],'u-guests':['guest'],'u-workload':['workload'],'u-agents':['agent']};
  const by = inc.find(id=>(map[id]||[]).includes(pr));
  if(!by) return {ok:false, why:`${PRINC[pr]}은(는) 포함 대상 밖 → 정책이 걸리지 않음`};
  const exMap = {'x-breakglass':['breakglass'],'x-guests':['guest']};
  const ex = sSel('identity-exclude').find(id=>(exMap[id]||[]).includes(pr));
  if(ex) return {ok:false, why:`제외 대상 ‘${sLab(ex)}’에 해당 → 제외가 포함보다 우선`};
  return {ok:true, why:`‘${sLab(by)}’에 일치`};
}
function simMatchResource(){
  const T = SIM.T, r = sSel('resource')[0];
  if(!r) return {ok:false, why:'대상 리소스가 비어 있음'};
  const map = {'r-apps-all':['t-app','t-app-spo','t-app-other'],'r-apps-selected':['t-app','t-app-spo'],'r-ua-secinfo':['t-ua-secinfo'],'r-ua-device':['t-ua-device'],'r-authctx':['t-authctx'],'r-gsa-internet':['t-gsa-internet'],'r-gsa-m365':['t-gsa-m365'],'r-gsa-private':['t-gsa-private'],'r-agent-res':['t-agent-res']};
  const ok = (map[r]||[]).includes(T.resource);
  return {ok, why: ok ? `‘${TLAB('resource',T.resource)}’ ← ‘${sLab(r)}’에 포함` : `‘${TLAB('resource',T.resource)}’는 ‘${sLab(r)}’ 범위 밖`};
}
function simCondMatch(key){
  const T = SIM.T;
  const sel = sSel(key);
  switch(key){
    case 'loc': {
      const L = T.location; let any = sel.includes('l-any'), named = sel.includes('l-selected'), comp = sel.includes('l-compliant');
      if(!any && !named && !comp) any = true;
      const hit = any || (named && L==='named') || (comp && L==='gsa');
      if(!hit) return {ok:false, why:`위치 ‘${TLAB('location',L)}’가 포함 범위에 없음`};
      if(sel.includes('l-ex-trusted') && L==='trusted') return {ok:false, why:'신뢰 위치 → 제외 규칙에 걸림'};
      if(sel.includes('l-ex-compliant') && L==='gsa') return {ok:false, why:'GSA 규격 네트워크 → 제외 규칙에 걸림'};
      return {ok:true, why:`위치 ‘${TLAB('location',L)}’ 일치`};
    }
    case 'platform': { const ok = sel.includes('p-'+T.platform); return {ok, why:`플랫폼 ${TLAB('platform',T.platform)} ${ok?'일치':'불일치'}`}; }
    case 'client': {
      const id = {'browser':'c-browser','ma-approved':'c-modern','ma-other':'c-modern','eas':'c-eas','legacy':'c-legacy'}[T.client];
      const ok = sel.includes(id); return {ok, why:`클라이언트 ‘${TLAB('client',T.client)}’ ${ok?'일치':'불일치'}`};
    }
    case 'device-filter': {
      const mode = sel.includes('df-include') ? 'df-include' : 'df-exclude', rule = SIM_DF_RULES[simSubOf(mode)] || SIM_DF_RULES['own-ne-company'];
      const unreg = T.device==='personal', hit = rule.hit.includes(T.device);
      if(mode==='df-include') return hit ? {ok:true, why:`필터 규칙 ${rule.expr} 에 일치`} : {ok:false, why: unreg && !rule.neg ? `미등록 디바이스는 모든 속성이 null → 양수 연산자(-eq)는 일치하지 않음 · ${rule.expr}` : `필터 규칙 ${rule.expr} 에 일치하지 않음`};
      return hit ? {ok:false, why:`제외 규칙 ${rule.expr} 에 일치 → 정책에서 제외`} : {ok:true, why: unreg && !rule.neg ? '미등록 디바이스는 속성이 null → 양수 연산자(-eq) 제외 규칙에 걸리지 않아 정책이 적용됨' : `제외 규칙 ${rule.expr} 에 일치하지 않아 정책이 적용됨`};
    }
    case 'device-filter-legacy': {
      if(sel.includes('df-include') && T.device!=='personal') return {ok:false, why:'디바이스 필터 규칙(예: 개인 소유)에 일치하지 않음'};
      if(sel.includes('df-exclude') && T.device==='paw') return {ok:false, why:'제외 규칙(PAW)에 일치 → 정책 제외'};
      return {ok:true, why:'디바이스 필터 규칙 평가 통과'};
    }
    case 'signin-risk': case 'user-risk': { const p = key==='signin-risk'?'sr-':'ur-'; const lv = T[key]; const ok = lv!=='none' && sel.includes(p+lv); return {ok, why:`위험 수준 ‘${TLAB(key,lv)}’ ${ok?'일치':'불일치'}`}; }
    case 'insider-risk': { const lv = T[key]; const ok = lv!=='none' && sel.includes('ir-'+lv); return {ok, why:`내부자 위험 ‘${lv}’ ${ok?'일치':'불일치'}`}; }
    case 'auth-flow': { const ok = (T.flow==='devicecode'&&sel.includes('af-devicecode'))||(T.flow==='transfer'&&sel.includes('af-authtransfer')); return {ok, why:`인증 흐름 ‘${TLAB('flow',T.flow)}’ ${ok?'일치':'불일치'}`}; }
  }
  return {ok:true, why:''};
}
function simGrantSat(c){
  const T = SIM.T;
  switch(c){
    case 'gc-mfa': return {ok:T.mfa!=='none', why: T.mfa!=='none' ? 'MFA 클레임이 이미 있음' : 'MFA 클레임 없음'};
    case 'gc-strength': { const sv = simSubOf('gc-strength'), ok = sv==='phish' ? T.mfa==='phish' : sv==='pwless' ? ['pwless','phish'].includes(T.mfa) : T.mfa!=='none'; const nm = {mfa:'다단계 인증',pwless:'암호 없는 MFA',phish:'피싱 방지 MFA'}[sv]; return {ok, why: ok ? `인증 강도 ‘${nm}’ 충족` : `인증 강도 ‘${nm}’에 해당하는 방법으로 인증되지 않음`}; }
    case 'gc-compliant': { const ok = ['managed','paw'].includes(T.device); return {ok, why:`기기 준수 상태: ${ok?'준수':'비준수·미등록'}`}; }
    case 'gc-hybrid': { const ok = ['managed','hybrid-only','paw'].includes(T.device); return {ok, why:`하이브리드 조인: ${ok?'예':'아니오'}`}; }
    case 'gc-approved-app': { const ok = T.client==='ma-approved'; return {ok, why:`승인된 클라이언트 앱: ${ok?'예':'아니오'}`}; }
    case 'gc-app-protection': { const ok = T.client==='ma-approved'; return {ok, why:`앱 보호 정책 적용 앱: ${ok?'예':'아니오'}`}; }
    case 'gc-pwdchange': return {ok:false, why:'이번 로그인에서 암호 변경 이력 없음'};
    case 'gc-risk-remediation': return {ok:false, why:'위험이 아직 해결(교정)되지 않음'};
    case 'gc-idverify': return {ok:false, why:'신원 확인 이력 없음'};
    case 'gc-tou': { const ok = T.tou==='yes'; return {ok, why:`약관 동의: ${ok?'완료':'미동의'}`}; }
  }
  return {ok:true, why:''};
}
function simCompletable(c){
  const T = SIM.T; if(T.complete!=='yes') return false;
  if(c==='gc-strength'){ const sv = simSubOf('gc-strength'); return sv==='phish' ? T.reg==='phish' : sv==='pwless' ? ['pwless','phish'].includes(T.reg) : T.reg!=='none'; }
  return SIM_INTERACTIVE.has(c);
}
function simSessionEffect(id){
  const T = SIM.T;
  const browserOnly = {'s-mdca':'브라우저 세션에서만 동작','s-persistent':'브라우저 세션에서만 동작'};
  if(browserOnly[id] && T.client!=='browser') return {eff:false, why:`이번 클라이언트(${TLAB('client',T.client)})에서는 효과 없음 — ${browserOnly[id]}`};
  if(id==='s-app-restrictions' && !['t-app','t-app-spo','t-app-other'].includes(T.resource)) return {eff:false, why:'Exchange Online·SharePoint Online 외 리소스에서는 효과 없음'};
  if(id==='s-token-protection' && !(T.platform==='windows' && T.client==='ma-other')) return {eff:false, why:'지원 범위(Windows 네이티브 앱 등) 밖이면 효과가 제한됨 [확인 필요]'};
  return {eff:true, why:''};
}

/* ─── 흐름 생성 + 결과 ─── */
function simGenerate(){
  const S = SIM.S, T = SIM.T, nodes = [], edges = [], shared = {};
  const trace = [], warns = [], grantRows = [], sessRows = [];
  const report = sHas('state','st-report'), off = sHas('state','st-off');
  let seq = 0, tails = [];
  const N = (type,title,sub,narr,actor,ui,data,extra)=>{ const n = Object.assign({id:'n'+(++seq),type,title,sub:sub||'',narr:narr||'',actor:actor||'',ui:ui||'',data:data||''},extra||{}); nodes.push(n); return n; };
  const E = (a,b,label)=>edges.push({from:a.id,to:b.id,label:label||''});
  const chain = n=>{ tails.forEach(t=>E(t.n,n,t.label)); tails = [{n,label:''}]; };
  const sink = (key,mk)=> shared[key] || (shared[key] = mk());
  const sinkNA = ()=>sink('na',()=>N('끝','정책 미적용 — 다음 정책 평가',report?'result: reportOnlyNotApplied':'result: notApplied','이 정책은 이번 로그인에 걸리지 않습니다. 다른 정책의 평가에는 영향이 없습니다.','Entra ID','','appliedConditionalAccessPolicies[].result',{sh:1}));
  const sinkOff = ()=>sink('off',()=>N('끝','정책 평가 안 함',"result: notEnabled",'정책 상태가 ‘사용 안 함’이면 평가하지 않습니다.','Entra ID','','policy.state=disabled',{sh:1}));
  const sinkBlock = ()=>sink('blk',()=> report
      ? N('끝','차단됐을 요청 — 강제 안 함','result: reportOnlyFailure','보고 전용: 사용 상태였다면 차단/미충족이었음을 기록만 하고 접근은 그대로 허용합니다.','Entra ID','','로그인 로그 › 조건부 액세스 탭',{sh:1})
      : N('차단','액세스 차단','result: failure','정책 요구를 채우지 못해 토큰이 발급되지 않고 접근이 거부됩니다.','Entra ID','','로그인 로그 failureReason',{sh:1}));
  const decide = (n,okL,noL,pass,fail)=>{ n.goto = pass?okL:noL; E(n,fail,noL); tails = [{n,label:okL}]; };
  const subSel = id => (sHas(SIM.cat.opts[id]?.group, id) && SIM_SUB_LABEL[id]) ? SIM_SUB_LABEL[id](simSubOf(id)) : '';
  const sub = k => { let t = sLabels(k) || sGf(k,'노드 보조'); if(k==='loc' && sHas('loc','l-selected')) t += ' · '+subSel('l-selected'); if(k==='device-filter'){ const m = sHas('device-filter','df-include')?'df-include':'df-exclude'; if(sHas('device-filter',m)) t += ' · '+subSel(m); } return t; };

  // 시작
  const start = N('시작','로그인 요청',`${PRINC[T.principal]} → ${TLAB('resource',T.resource)}`,`${PRINC[T.principal]}이(가) ‘${TLAB('resource',T.resource)}’에 접근합니다. 위치 ${TLAB('location',T.location)} · 기기 ${TLAB('device',T.device)} · ${TLAB('client',T.client)}.`,'사용자','/authorize 또는 리소스 접근 요청','principal · resource · IP · deviceId · user-agent');
  chain(start);

  // 상태
  const stN = N('판단','정책 상태?',sLabels('state'),(sGf('state','해설')||'정책 상태를 먼저 확인합니다.')+(off?' → 사용 안 함: 평가하지 않음':report?' → 보고 전용: 평가하되 강제하지 않음':' → 사용: 평가하고 강제'),sGf('state','주체')||'Entra ID',sGf('state','위치'),sGf('state','데이터'));
  chain(stN); decide(stN, report?'보고 전용':'사용', '사용 안 함', !off, sinkOff());
  if(off){ trace.push({k:'no',t:'정책이 ‘사용 안 함’이라 평가하지 않습니다.'}); }

  // Phase 1
  const sig = ['위치 IP','디바이스 ID·플랫폼','클라이언트 앱'].concat(sSel('signin-risk').length||sSel('user-risk').length?['ID Protection 위험']:[]).concat(sSel('insider-risk').length?['내부자 위험']:[]).join(' · ');
  const p1 = N('처리','Phase 1 · 세션 정보 수집',sig,'정책을 판정하기 전에 위치·기기·클라이언트·위험 같은 세션 정보를 모읍니다. 사용·보고 전용 정책이 모두 평가됩니다.','Entra ID','','신호: '+sig);
  chain(p1);

  // 할당 · 대상 리소스
  const im = simMatchIdentity();
  const idN = N('판단',sGf('identity','노드 제목')||'대상 ID 일치?',sLabels('identity')+(sSel('identity-exclude').length?` — 제외: ${sLabels('identity-exclude')}`:''),(sGf('identity','해설')||'로그인 주체가 포함 대상이고 제외 대상이 아닌지 확인합니다.')+' → '+im.why,sGf('identity','주체')||'Entra ID',sGf('identity','위치'),sGf('identity','데이터'));
  chain(idN); decide(idN,'일치','불일치',im.ok,sinkNA()); trace.push({k:im.ok?'ok':'no',t:'대상 ID — '+im.why});
  const rm = simMatchResource();
  const rsN = N('판단',sGf('resource','노드 제목')||'대상 리소스 일치?',sLabels('resource')+(sHas('resource','r-authctx')?' · '+subSel('r-authctx'):''),(sGf('resource','해설')||'요청한 리소스·작업이 대상 리소스에 포함되는지 확인합니다.')+' → '+rm.why,sGf('resource','주체')||'Entra ID',sGf('resource','위치'),sGf('resource','데이터'));
  chain(rsN); decide(rsN,'일치','불일치',rm.ok,sinkNA()); trace.push({k:rm.ok?'ok':'no',t:'대상 리소스 — '+rm.why});

  // 조건
  SIM_COND_ORDER.forEach(key=>{
    if(!sSel(key).length) return;
    const cm = simCondMatch(key);
    const unsup = sSel(key).filter(id=>!sSupported(id,T.principal));
    if(unsup.length){ warns.push(`‘${SIM.cat.groups[key]?.title||key}’ 조건은 ${PRINC_KIND[T.principal]}에게는 지원되지 않는 것으로 문서화되어 있습니다 — 이 시뮬레이션은 그대로 평가합니다.`); }
    const g = SIM.cat.groups[key];
    const actor = (key==='loc' && (sHas('loc','l-compliant')||sHas('loc','l-ex-compliant'))) ? 'Entra ID · GSA' : (sGf(key,'주체')||'Entra ID');
    const n = N('판단',sGf(key,'노드 제목')||`${g?.title||key} 일치?`,sub(key),(sGf(key,'해설')||'')+' → '+cm.why,actor,sGf(key,'위치'),sGf(key,'데이터'));
    chain(n); decide(n,'일치','불일치',cm.ok,sinkNA()); trace.push({k:cm.ok?'ok':'no',t:`${g?.title||key} — ${cm.why}`});
  });

  // Phase 2 · 허용
  const block = sHas('grant-mode','g-block');
  const p2 = N('처리','Phase 2 · 허용 컨트롤 평가',block?'액세스 차단':(sLabels('grant-op')||''),'정책이 걸렸다면 이제 액세스 제어를 평가합니다. 차단이 있으면 다른 컨트롤보다 먼저 적용되고, 없으면 허용 컨트롤을 충족했는지 봅니다.','Entra ID','',sGf('grant','평가')||'정책의 grantControls · sessionControls');
  chain(p2);
  let finalEnd = null, prompted = false;
  const controls = SIM_GRANT_ORDER.filter(c=>sHas('grant',c));
  if(block){
    const b = N('차단',sOf('g-block','노드 제목')||'액세스 차단',sOf('g-block','노드 보조')||'Block access',sOf('g-block','해설')||'차단 컨트롤이 걸려 토큰이 발급되지 않습니다. 다른 컨트롤은 평가하지 않습니다.',sOf('g-block','주체')||'Entra ID',sOf('g-block','위치'),sOf('g-block','데이터'));
    if(report){ b.type='끝'; b.title='차단됐을 요청 — 강제 안 함'; b.sub='result: reportOnlyFailure'; }
    chain(b); finalEnd = b;
    sessRows.push({skip:true});
  } else {
    const op = sHas('grant-op','go-or') ? 'or' : 'and';
    if(!controls.length){
      const g0 = N('처리','허용 — 요구 컨트롤 없음','grantControls 없음','선택한 허용 컨트롤이 없어 조건만 일치하면 그대로 다음 단계로 갑니다.','Entra ID','','grantControls=null');
      chain(g0); trace.push({k:'info',t:'허용 컨트롤을 선택하지 않음 — 추가 요구 없이 통과'});
    }
    const judgeNode = c=>{
      const sat = simGrantSat(c), sup = sSupported(c,T.principal);
      if(!sup) warns.push(`‘${sLab(c)}’은(는) ${PRINC_KIND[T.principal]}에게 지원되지 않습니다(문서 기준) — 충족으로 건너뜁니다.`);
      const ok = !sup || sat.ok;
      const n = N('판단',sOf(c,'노드 제목')||`${sLab(c)} 충족?`,(c==='gc-strength'?subSel('gc-strength'):sOf(c,'노드 보조')),(sOf(c,'해설')||'')+' → '+(sup?sat.why:'미지원 주체 — 건너뜀'),sOf(c,'주체')||'Entra ID',sOf(c,'위치'),sOf(c,'데이터'));
      return {n,ok,sat,sup};
    };
    const promptNode = c=>{
      const expr = sOf(c,'표현');
      const n = N('판단',`${(sOf(c,'노드 제목')||sLab(c)).replace(/\s*충족\?$/,'')} 프롬프트 완료?`,'사용자에게 요구 표시',(expr?expr.split(/;\s*/)[0]+' · ':'')+'사용자가 요구를 수행하면 충족으로 처리합니다.','사용자','',sOf(c,'미충족 시'));
      return n;
    };
    const rows = [];
    if(op==='and'){
      controls.forEach(c=>{
        const j = judgeNode(c); chain(j.n);
        const interactive = SIM_INTERACTIVE.has(c);
        if(interactive){
          const p = promptNode(c), can = simCompletable(c);
          j.n.goto = j.ok?'충족':'미충족'; E(j.n,p,'미충족');
          p.goto = can?'완료':'미완료'; E(p,sinkBlock(),'미완료');
          tails = [{n:j.n,label:'충족'},{n:p,label:'완료'}];
          rows.push({c,sat:j.ok,prompt:!j.ok,done:j.ok||can,why:j.sat.why});
        } else {
          decide(j.n,'충족','미충족',j.ok,sinkBlock());
          rows.push({c,sat:j.ok,prompt:false,done:j.ok,why:j.sat.why});
        }
      });
      if(controls.length){ const ok = N('처리','요구 충족 — 모든 컨트롤','AND',  '선택한 모든 컨트롤을 충족했습니다.','Entra ID','','grantControls.operator=AND'); chain(ok); }
    } else {
      const judges = controls.map(c=>judgeNode(c));
      if(judges.length){
        const okN = N('처리','요구 충족 — 하나 이상','OR','선택한 컨트롤 중 하나를 충족하면 이 정책의 요구는 충족된 것으로 봅니다.','Entra ID','','grantControls.operator=OR');
        let prevTail = tails;
        judges.forEach(j=>{ prevTail.forEach(t=>E(t.n,j.n,t.label)); E(j.n,okN,'충족'); j.n.goto = j.ok?'충족':'미충족'; prevTail = [{n:j.n,label:'미충족'}]; });
        const firstInter = controls.find(c=>SIM_INTERACTIVE.has(c));
        if(firstInter){
          const p = promptNode(firstInter), can = simCompletable(firstInter);
          prevTail.forEach(t=>E(t.n,p,t.label)); p.goto = can?'완료':'미완료'; E(p,sinkBlock(),'미완료'); E(p,okN,'완료');
        } else { prevTail.forEach(t=>E(t.n,sinkBlock(),t.label)); }
        tails = [{n:okN,label:''}];
        const k = judges.findIndex(j=>j.ok);
        controls.forEach((c,i)=>rows.push({c,sat:judges[i].ok,prompt:false,done:k>=0,why:judges[i].sat.why,skipped:k>=0&&i>k,or:true}));
        if(k<0 && firstInter){ const r = rows.find(x=>x.c===firstInter); r.prompt = true; r.done = simCompletable(firstInter); }
      }
    }
    rows.forEach(r=>grantRows.push(r));

    // 세션
    SIM_SESSION_ORDER.filter(id=>sHas('session',id)).forEach(id=>{
      const eff = simSessionEffect(id);
      const n = N('처리',sOf(id,'노드 제목')||sLab(id),(subSel(id)||sOf(id,'노드 보조')),(sOf(id,'해설')||'')+(eff.eff?'':' → '+eff.why),sOf(id,'주체')||'Entra ID',sOf(id,'위치'),sOf(id,'데이터'));
      chain(n); sessRows.push({id,eff:eff.eff,why:eff.why,sub:subSel(id)});
    });

    // ── 토큰 발급 이후: 리소스·세션 단계에서 세션 컨트롤이 실제로 하는 일 ──
    const live = report ? [] : SIM_RUNTIME_ORDER.filter(id=>sHas('session',id) && simSessionEffect(id).eff);
    if(live.length){
      const NR = (t,ti,s,na,ac,ui,da)=>N(t,ti,s,na,ac,ui,da,{phase:'runtime'});
      chain(N('처리','토큰 발급 · 세션 시작','result: success','허용 컨트롤을 모두 충족해 토큰이 발급됩니다. 지금부터는 리소스와 세션 쪽에서 세션 컨트롤이 실제로 적용됩니다.','Entra ID','로그인 로그','토큰 · 세션 컨트롤 정보',{phase:'token'}));
      const step = (ti,s,na,ac,ui,da)=>{ const n = NR('처리',ti,s,na,ac,ui,da); chain(n); return n; };
      const blk = (ti,s,na,ac,ui,da)=>NR('차단',ti,s,na,ac,ui,da);
      const dec = (ti,s,na,ac,ui,da,okL,noL,pass,fail)=>{ const n = NR('판단',ti,s,na,ac,ui,da); chain(n); decide(n,okL,noL,pass,fail); return n; };
      const rtSum = {};
      live.forEach(id=>{
        if(id==='s-app-restrictions'){
          const spo = T.resource==='t-app-spo', app = spo ? 'SharePoint Online' : 'Exchange Online', appS = spo ? 'SharePoint' : 'Exchange', pol = simSubOf('s-app-restrictions');
          const managed = ['managed','hybrid-only','paw'].includes(T.device), isBrowser = T.client==='browser';
          step('Entra → 앱에 디바이스 정보 전달','앱 적용 제한',`Entra는 판정하지 않고, ${app}에 이 기기가 준수 또는 하이브리드 조인인지만 알려 줍니다. 판정은 앱이 합니다.`,'Entra ID','보호 › 조건부 액세스 › 세션 › 앱 적용 제한 사용','디바이스 상태 신호(준수 · 하이브리드 조인)');
          const mg = NR('판단',`${app}: 관리되는 디바이스?`,'준수 또는 하이브리드 조인','앱이 받은 디바이스 정보로 전체 경험과 제한된 경험 중 무엇을 줄지 정합니다.',appS,spo?'SharePoint 관리 센터 › 정책 › 액세스 제어 › 비관리 디바이스':'Outlook on the web 정책 [확인 필요]','디바이스 상태 신호');
          chain(mg); mg.goto = managed ? '예' : '아니오';
          const full = NR('처리','전체 액세스','다운로드·인쇄·동기화 가능','관리되는 디바이스이거나 정책이 ‘전체 허용’이면 전체 경험이 제공됩니다. 지원 OS·브라우저 조합이 아니면 관리되는 기기도 제한될 수 있습니다.',appS,'','');
          E(mg,full,'예');
          const po = NR('판단','비관리 디바이스 정책?',spo?'SharePoint 액세스 제어':'앱 쪽 정책','관리되지 않는 기기에 어떤 경험을 줄지 앱 쪽 정책이 정합니다. 이 설정은 앱 관리자 영역에 있습니다.',appS,spo?'SharePoint 관리 센터 › 정책 › 액세스 제어 › 비관리 디바이스 (Set-SPOTenant -ConditionalAccessPolicy)':'Exchange 관리: OWA 메일박스 정책 [확인 필요]','AllowFullAccess · AllowLimitedAccess · BlockAccess');
          E(mg,po,'아니오'); po.goto = pol==='full' ? '전체 허용' : pol==='block' ? '차단' : '제한된 웹 전용';
          E(po,full,'전체 허용');
          const cb = NR('판단','브라우저 세션인가?','제한된 액세스는 브라우저 전용','제한된 액세스는 브라우저에서만 쓸 수 있어, 데스크톱·모바일 앱(Office 포함)은 접근할 수 없습니다.',appS,'','클라이언트 앱 종류');
          E(po,cb,'제한된 웹 전용'); cb.goto = isBrowser ? '예' : '아니오';
          const lim = NR('처리','제한된 웹 전용 세션',pol==='limited-ro'?'편집 불가 · 다운로드·인쇄·동기화 불가':'다운로드·인쇄·동기화 불가',pol==='limited-ro'?'브라우저에서만 열람할 수 있고, 편집도 막혀 있습니다(-AllowEditing $false). 사이트 상단에 제한 안내가 표시됩니다.':'브라우저에서만 열람·편집할 수 있고 다운로드·인쇄·동기화는 막힙니다. 사이트 상단에 제한 안내가 표시됩니다.',appS,'','');
          E(cb,lim,'예');
          E(cb,blk('앱 접근 불가','제한된 액세스는 브라우저 전용','데스크톱·모바일 앱은 제한된 액세스를 지원하지 않아 접근이 거부됩니다.',appS,'',''),'아니오');
          E(po,blk('액세스 거부','Access Denied','“조직 정책 때문에 신뢰할 수 없는 디바이스에서 이 리소스에 접근할 수 없다”는 메시지가 표시됩니다.',appS,'',''),'차단');
          tails = [{n:full,label:''},{n:lim,label:''}];
          rtSum[id] = managed ? '관리되는 디바이스 → 전체 액세스' : pol==='full' ? '비관리 디바이스지만 정책이 전체 허용 → 전체 액세스' : pol==='block' ? '비관리 디바이스 → 액세스 거부' : isBrowser ? `비관리 디바이스 → 제한된 웹 전용${pol==='limited-ro'?' (편집 불가)':''} (다운로드·인쇄·동기화 불가)` : '비관리 디바이스 + 앱 클라이언트 → 접근 불가';
        }
        else if(id==='s-mdca'){
          const sv = simSubOf('s-mdca');
          step('세션을 Defender for Cloud Apps로 라우팅','Edge: 브라우저 내 보호 · 그 외: .mcas.ms 프록시','Entra가 세션을 리버스 프록시(Defender for Cloud Apps)로 넘겨, 이후 활동이 실시간으로 모니터링·통제됩니다.','Entra → Defender','보호 › 조건부 액세스 › 세션 › 조건부 액세스 앱 제어 사용','세션 쿠키 · 프록시 도메인(.mcas.ms)');
          if(sv==='block'){
            dec('활동이 다운로드인가?','세션 정책: 다운로드 차단','프록시가 사용자의 활동을 세션 정책과 실시간으로 비교합니다.','Defender','Defender 포털 › 정책 › 세션 정책','활동 유형(탐색 · 다운로드 · 업로드)','다운로드 아님','다운로드',T.activity!=='download',blk('다운로드 차단','세션 정책이 파일 다운로드를 차단','세션 정책이 다운로드를 막고 사용자에게 차단 메시지를 보여 줍니다. 탐색은 계속됩니다.','Defender','Defender 포털 › 활동 로그','CloudAppEvents'));
            rtSum[id] = T.activity==='download' ? '다운로드 시도 → 세션 정책이 차단' : '일반 탐색 → 허용 (다운로드는 세션 정책이 차단)';
          } else if(sv==='custom'){
            step('사용자 지정 세션 정책 평가','세션 정책: 사용자 지정','관리자가 Defender에서 만든 세션 정책(예: 라벨 기반 다운로드 차단·보호)이 활동마다 적용됩니다 [확인 필요].','Defender','Defender 포털 › 정책 › 세션 정책','세션 정책 조건 · 작업');
            rtSum[id] = '관리자가 만든 세션 정책이 활동마다 적용';
          } else {
            step('세션 활동 모니터링','세션 정책: 모니터링만','활동을 기록하되 차단하지 않습니다. 기록은 이후 헌팅·경고에 쓰입니다.','Defender','Defender 포털 › 활동 로그','CloudAppEvents');
            rtSum[id] = '세션 활동을 모니터링만 하고 차단하지 않음';
          }
        }
        else if(id==='s-token-protection'){
          step('토큰을 디바이스 키에 바인딩','로그인 세션 바인딩','토큰이 발급된 기기의 하드웨어 보호 키와 묶여, 그 기기에서만 키 소유 증명과 함께 사용할 수 있습니다.','디바이스','','signInSessionStatus (bound / unbound)');
          dec('토큰을 쓰는 기기 = 바인딩된 기기?','키 소유 증명 확인','리소스가 토큰과 함께 온 키 소유 증명을 검증합니다.','Entra · 리소스','로그인 로그 › 토큰 보호 상태','proof of possession','같은 기기','다른 기기',T.replay==='same',blk('토큰 거부 — 바인딩 불일치','signInSessionStatus: unbound','훔친 토큰을 다른 기기에서 재생하면 증명이 맞지 않아 거부됩니다.','Entra · 리소스','로그인 로그 › 토큰 보호 상태','signInSessionStatusCode(1002·1003·1004) [확인 필요]'));
          rtSum[id] = T.replay==='same' ? '발급받은 기기에서 사용 → 허용' : '다른 기기에서 토큰 재사용 → 거부';
        }
        else if(id==='s-gsa-profile'){
          step('GSA 클라이언트 → Microsoft 에지','인터넷 트래픽 전달','Global Secure Access 클라이언트가 인터넷 트래픽을 Microsoft 보안 에지로 보냅니다.','GSA','Global Secure Access › 연결 › 트래픽 전달','터널 · 소스 IP');
          dec('보안 프로필이 허용하는 대상?','웹 콘텐츠 필터링 · 위협 정책','조건부 액세스가 연결한 보안 프로필의 정책이 요청마다 적용됩니다 (반영에 60~90분이 걸릴 수 있음).','GSA','Global Secure Access › 보안 › 보안 프로필','대상 FQDN · 웹 범주','허용','차단 범주',T.gsaact==='allowed',blk('GSA 에지에서 차단','보안 프로필: 웹 콘텐츠 필터링','대상이 차단 범주라 에지에서 막히고 차단 페이지가 표시됩니다.','GSA','Global Secure Access › 로그 › 트래픽','NetworkAccessTraffic'));
          rtSum[id] = T.gsaact==='allowed' ? '허용 범주 → 에지가 통과' : '차단 범주 → 에지에서 차단';
        }
        else if(id==='s-cae'){
          const strict = simSubOf('s-cae')==='strict', ev = T.caeevt;
          step('리소스가 CAE 이벤트를 구독','장기 토큰(최대 28시간)','CAE를 지원하는 리소스는 Entra의 중요 이벤트를 즉시 받아, 토큰이 살아 있어도 반응할 수 있습니다.','리소스','','장기 토큰 · 이벤트 구독');
          const cd = NR('판단','중요 이벤트 또는 위치 위반?','계정 비활성 · 암호 재설정 · 허용 IP 이탈','이벤트가 일어나면 리소스가 만료 전 토큰도 거부합니다.','Entra → 리소스','','사용자 이벤트 · 위치 신호');
          chain(cd); cd.goto = ev==='none' ? '없음' : '발생';
          const evN = NR('처리','리소스가 토큰 거부','401 + claims challenge','리소스가 토큰을 거부하고 클라이언트에 재평가를 요구하는 챌린지를 돌려줍니다.','리소스','','WWW-Authenticate: claims challenge');
          E(cd,evN,'발생'); const keep = {n:cd,label:'없음'};
          tails = [{n:evN,label:''}];
          const rr = NR('판단','재인증 · 재평가 통과?',strict?'엄격한 위치 적용':'조건을 다시 평가','클라이언트가 새 토큰을 요청하면 Entra가 조건을 다시 평가합니다.','Entra ID','','재평가 결과');
          chain(rr);
          decide(rr,'통과','불통과',ev==='ipout' && !strict,blk('접근 종료 — 재평가 불통과',strict&&ev==='ipout'?'엄격한 위치 적용: 즉시 거부':'계정·위치 상태가 정책에 맞지 않음','재평가를 통과하지 못해 리소스 접근이 끝납니다. 이벤트 전파에는 최대 15분이 걸릴 수 있습니다 [확인 필요].','Entra · 리소스','로그인 로그 › Is CAE Token','claims challenge 결과'));
          tails = [keep].concat(tails);
          rtSum[id] = ev==='none' ? '이벤트 없음 → 토큰 계속 사용' : ev==='disable' ? '계정 비활성화·암호 재설정 → 토큰 거부 → 재평가 불통과' : strict ? '허용 위치 이탈 → 엄격한 위치 적용으로 즉시 거부' : '허용 위치 이탈 → 클레임 챌린지 → 재평가';
        }
        else if(id==='s-frequency'){
          const fv = simSubOf('s-frequency'), limit = {every:5,'1h':60,'1d':1440,'30d':43200,'90d':129600}[fv], age = {'5m':3,'6h':360,'2d':2880,'40d':57600,'100d':144000}[T.sessage];
          const over = fv==='every' ? age>5 : age>limit;
          step('세션에 마지막 인증 시각 기록','로그인 빈도: '+SIM_SUB_LABEL['s-frequency'](fv).replace(/\(기본\)/,''),'세션과 토큰 갱신마다 마지막으로 인증한 시각을 기준으로 재인증이 필요한지 봅니다.','Entra ID','','마지막 인증 시각 · 갱신 토큰');
          const fd = NR('판단','재인증 주기를 넘었나?',`마지막 인증 후 ${TLAB('sessage',T.sessage)}`,'다음 토큰 갱신·세션 평가 때 주기를 넘었으면 다시 로그인하게 합니다. 매번(Every time)은 5분 안에는 다시 묻지 않습니다.','Entra ID','','마지막 인증 시각 vs 주기');
          chain(fd); fd.goto = over ? '주기 초과' : '주기 이내';
          const re = NR('처리','재인증 요구','대화형 로그인 프롬프트','사용자에게 다시 로그인(필요하면 MFA)하라는 프롬프트가 나타납니다. 브라우저 백그라운드 작업은 다음 상호작용까지 미뤄집니다.','사용자','','재로그인');
          E(fd,re,'주기 초과'); const keep = {n:fd,label:'주기 이내'};
          tails = [{n:re,label:''}];
          const dn = NR('판단','재인증을 수행했나?','대화형 프롬프트 응답','사용자가 프롬프트를 완료해야 세션이 이어집니다.','사용자','','');
          chain(dn); decide(dn,'수행','안 함',T.complete==='yes',blk('세션 종료 — 재인증 안 함','재인증 미완료','재인증을 마치지 않아 세션이 끝납니다.','Entra ID','',''));
          tails = [keep].concat(tails);
          rtSum[id] = over ? `경과 ${TLAB('sessage',T.sessage)} > 주기(${SIM_SUB_LABEL['s-frequency'](fv).replace(/\(기본\)/,'')}) → 재인증 요구${T.complete==='yes'?' → 수행 후 계속':' → 수행 못 함 → 세션 종료'}` : `경과 ${TLAB('sessage',T.sessage)} ≤ 주기 → 재인증 없이 계속`;
        }
        else if(id==='s-persistent'){
          const al = simSubOf('s-persistent')==='always';
          step(al?'브라우저를 닫아도 세션 유지':'브라우저를 닫으면 세션 종료',al?'영구 세션 쿠키':'세션 쿠키',al?'브라우저를 닫았다 다시 열어도 로그인 상태가 유지됩니다. 사용자 선택의 ‘로그인 유지’ 프롬프트보다 정책이 우선합니다.':'브라우저를 닫으면 세션 쿠키가 지워져, 다시 열면 로그인해야 합니다.','브라우저','보호 › 조건부 액세스 › 세션 › 영구 브라우저 세션','세션 쿠키 · 영구 쿠키');
          rtSum[id] = al ? '브라우저 재시작 후에도 세션 유지' : '브라우저를 닫으면 세션 종료';
        }
        else if(id==='s-resilience'){
          dec('Entra 서비스 장애 중?','복원력 기본값 사용 안 함','복원력 기본값을 끄면 장애 중에 기존 세션이 만료되는 즉시 접근이 거부됩니다.','Entra ID','보호 › 조건부 액세스 › 세션 › 복원력 기본값 사용 안 함','서비스 상태','정상','장애 중',T.outage==='ok',blk('접근 거부 — 장애 중 세션 만료','복원력 기본값 꺼짐','기본값이면 장애 중에도 기존 세션을 이어 주지만, 이 정책에서는 끄도록 설정돼 세션이 만료되면 거부됩니다.','Entra ID','','Token issuer type'));
          rtSum[id] = T.outage==='ok' ? '정상 운영 → 영향 없음' : '장애 중 세션 만료 → 접근 거부';
        }
      });
      finalEnd = NR('끝','세션 보호 적용 — 접근 허용','result: success','토큰이 발급됐고, 세션 컨트롤이 리소스·세션 단계에서 적용된 채 접근이 이어집니다.','Entra · 리소스','로그인 로그','appliedConditionalAccessPolicies · enforcedSessionControls');
      chain(finalEnd);
      sessRows.forEach(r=>{ if(r.id && rtSum[r.id]) r.runtime = rtSum[r.id]; });
    }
  }

  if(!finalEnd){
    finalEnd = report ? N('끝','평가 결과 기록 — 강제 안 함',(grantRows.some(r=>r.prompt)?'result: reportOnlyInterrupted':'result: reportOnlySuccess'),'보고 전용이라 접근은 그대로이고, 결과만 로그인 로그에 남깁니다.','로그','로그인 로그 › 조건부 액세스 탭','appliedConditionalAccessPolicies[].result')
                   : N('끝','토큰 발급 · 접근 허용','result: success','요구를 모두 충족해 토큰이 발급되고 접근이 허용됩니다. 어떤 정책이 적용됐는지 로그인 로그에 남습니다.','Entra ID','로그인 로그','appliedConditionalAccessPolicies');
    chain(finalEnd);
  }

  // 공유 종료 노드를 뒤로 보내고 번호를 다시 매긴다
  const ordered = nodes.filter(n=>!n.sh).concat(nodes.filter(n=>n.sh));
  const map = {}; ordered.forEach((n,i)=>map[n.id]=String(i+1));
  ordered.forEach(n=>{ n.id = map[n.id]; });
  edges.forEach(e=>{ e.from = map[e.from]; e.to = map[e.to]; });
  // 경로 = 사실에 따라 간선을 따라간다
  const byId = Object.fromEntries(ordered.map(n=>[n.id,n]));
  const route = [ordered[0].id]; let cur = ordered[0].id, guard = 0;
  while(guard++<80){
    const outs = edges.filter(e=>e.from===cur); if(!outs.length) break;
    const n = byId[cur]; const e = n.goto ? outs.find(x=>x.label===n.goto) : outs[0]; if(!e) break;
    route.push(e.to); cur = e.to;
  }
  const endNode = byId[cur];
  prompted = grantRows.some(r=>r.prompt);
  const outcome = endNode.type==='차단' ? 'blocked' : (/notEnabled/.test(endNode.sub) ? 'off' : (/NotApplied|notApplied/.test(endNode.sub) ? 'na' : (/reportOnlyFailure/.test(endNode.sub) ? 'rblocked' : 'ok')));

  // 구성 점검
  if(!sSel('identity').length) warns.push('포함 대상이 비어 있습니다 — 사용자·그룹·에이전트 등을 하나 이상 고르세요.');
  if(!block && sHas('session','s-cae') && simSubOf('s-cae')==='strict' && ['r-gsa-internet','r-gsa-m365','r-gsa-private'].includes(sSel('resource')[0]||'')) warns.push('엄격한 위치 적용을 쓰면서 비-Microsoft 365 트래픽을 Global Secure Access로 보내면, 소스 IP 복원이 없을 때 신뢰 IP여도 차단될 수 있습니다 [확인 필요].');
  if(!block && sHas('session','s-frequency') && simSubOf('s-frequency')==='every' && sSel('resource')[0]==='r-gsa-private') warns.push('Private Access는 ‘매번(Every time)’ 로그인 빈도를 지원하지 않습니다 (문서 기준).');
  if(sHas('loc','l-compliant') || sHas('loc','l-ex-compliant')) warns.push('‘규격 네트워크 위치’는 Global Secure Access › 설정 › 세션 관리 › 적응형 액세스에서 조건부 액세스 신호를 켜야 평가됩니다. 신호를 끄면 이 정책을 쓰던 사용자가 잠길 수 있습니다.');
  if(!block && sHas('grant','gc-mfa') && sHas('grant','gc-strength')) warns.push('MFA 필요와 인증 강도 필요를 함께 쓰면 안 됩니다 — 인증 강도가 MFA 요구를 포함합니다(포털에서는 동시 선택 불가) [확인 필요].');
  if(!block && sHas('grant','gc-pwdchange') && !sSel('user-risk').length) warns.push('암호 변경 필요는 ‘사용자 위험’ 조건과 함께 쓰는 컨트롤입니다 [확인 필요].');
  if(block && sHas('identity','u-all') && sHas('resource','r-apps-all') && !SIM_COND_ORDER.some(k=>sSel(k).length) && !sHas('identity-exclude','x-breakglass')) warns.push('모든 사용자·모든 리소스를 조건 없이 차단하면 관리자도 잠깁니다 — 비상 접근 계정을 제외하세요.');
  if(!block && sHas('session','s-token-protection') && !['r-apps-all','r-apps-selected'].includes(sSel('resource')[0]||'')) warns.push('토큰 보호는 대상 리소스가 앱일 때 의미가 있습니다 [확인 필요].');
  const unsupSel = [];
  ['grant','session'].forEach(k=>{ if(!block||k==='grant') sSel(k).forEach(id=>{ if(!sSupported(id,T.principal)) unsupSel.push(id); }); });
  unsupSel.filter(id=>!(id.startsWith('gc-'))).forEach(id=>warns.push(`‘${sLab(id)}’은(는) ${PRINC_KIND[T.principal]}에게 지원되지 않습니다(문서 기준).`));

  // 판단 노드에 ‘이번 로그인에서의 판정값’을 싣는다
  ordered.forEach(n=>{ if(n.goto && /\s→\s/.test(n.narr)) n.ev = n.narr.split(/\s→\s/).pop(); });
  const fullL4 = {label:'▶ 이 구성으로 재생', sub:'선택한 정책 × 테스트 로그인으로 생성된 평가 흐름', nodes:ordered, edges, fixedRoute:route, mode:'full'};
  SIM.result = {outcome, endNode, trace, warns, grantRows, sessRows, prompted, block, report, off};
  return SIM.view==='full' ? fullL4 : simPathOnly(fullL4);
}
/* 이 로그인이 실제로 지나는 단계만 남겨, 시나리오마다 다른 그림이 되게 한다 */
function simPathOnly(f){
  const byId = Object.fromEntries(f.nodes.map(n=>[n.id,n]));
  const ids = f.fixedRoute, map = {}; ids.forEach((id,i)=>map[id] = String(i+1));
  const nodes = ids.map(id=>{
    const o = Object.assign({}, byId[id]); o.id = map[id];
    if(o.goto){
      const alt = f.edges.find(e=>e.from===id && e.label!==o.goto);
      if(alt){ const t = byId[alt.to]; o.alt = `${alt.label} → ${t.title}`; o.narr += ` (반대로 ‘${alt.label}’이면 → ${t.title})`; }
    }
    return o;
  });
  const edges = ids.slice(1).map((id,i)=>{ const e = f.edges.find(x=>x.from===ids[i]&&x.to===id); return {from:map[ids[i]], to:map[id], label:e?e.label:''}; });
  return {label:f.label, sub:f.sub, nodes, edges, fixedRoute:ids.map(i=>map[i]), mode:'path', fullCount:f.nodes.length};
}
const SIM_SESSION_ORDER = ['s-app-restrictions','s-mdca','s-frequency','s-persistent','s-cae','s-resilience','s-token-protection','s-gsa-profile'];
// 토큰 발급 이후, 리소스·세션에서 실제로 일어나는 순서(세션 시작 → 진행 중)
const SIM_RUNTIME_ORDER = ['s-app-restrictions','s-mdca','s-token-protection','s-gsa-profile','s-cae','s-frequency','s-persistent','s-resilience'];

/* ─── 패널 UI ─── */
function simParseKV(s){ const o = {}; (s||'').split(';').forEach(p=>{ const i = p.indexOf('='); if(i>0) o[p.slice(0,i).trim()] = p.slice(i+1).trim(); }); return o; }
function simApplyPreset(p){
  stopAll(); const S = simDefaultPolicy(), T = simDefaultTest();
  Object.keys(S).forEach(k=>{ if(!SIM_SINGLE.has(k)) S[k] = []; });
  const kv = simParseKV(p.policy); Object.entries(kv).forEach(([k,v])=>{ if(k in S) S[k] = v.split(',').map(x=>x.trim()).filter(Boolean); });
  if(!kv['state']) S.state = ['st-on']; if(!kv['grant-mode']) S['grant-mode'] = ['g-grant']; if(!kv['grant-op']) S['grant-op'] = ['go-and'];
  Object.assign(T, simParseKV(p.test));
  SIM.S = S; SIM.T = T; SIM.presetName = p.name; SIM.detail = null; SIM.scn = null; SIM.scnList = null; SIM.scnIdx = 0;
  SIM.sub = simSubDefaults(); Object.entries(kv).forEach(([k,v])=>{ if(k.startsWith('sub.')) SIM.sub[k.slice(4)] = v; });
  SIM.notices = [];
  if(typeof simSyncTest==='function') simSyncTest();
}
function simInit(l3){
  if(SIM.l3 !== l3){
    SIM.l3 = l3; SIM.cat = {groups:{},opts:{}};
    l3.sim.groups.forEach(g=>{ SIM.cat.groups[g.key] = g; g.options.forEach(o=>{ SIM.cat.opts[o.id] = o; o.group = g.key; }); });
    SIM.S = simDefaultPolicy(); SIM.T = simDefaultTest(); SIM.presetName = '';
    const p0 = l3.sim.presets[0]; if(p0) simApplyPreset(p0);
  }
}
function renderSimDetail(){
  const box = $('#simDetail'); if(!box) return;
  const d = SIM.detail;
  if(!d){ box.innerHTML = `<div class="sd-empty">👆 드롭다운에서 옵션을 고르거나 항목 제목(ⓘ)을 누르면 <b>어떻게 동작하는지 · 사용자에게 어떻게 보이는지 · 로그에 어떻게 남는지</b>가 여기에 나옵니다.</div>`; return; }
  const g = SIM.cat.groups[d.g]; if(!g){ box.innerHTML=''; return; }
  const f = d.o ? (sOpt(d.o)?.f||{}) : g.f;
  const title = d.o ? sLab(d.o) : g.title;
  const row = (k,v,cls)=> v ? `<div class="dr ${cls||''}"><span>${k}</span><div>${v}</div></div>` : '';
  const expr = s=> (s||'').split(/;\s*/).filter(Boolean).map(x=>{ const i = x.indexOf(':'); return i>0&&i<12 ? `<div class="ex"><b>${esc(x.slice(0,i))}</b>${rich(x.slice(i+1).trim())}</div>` : `<div class="ex">${rich(x)}</div>`; }).join('');
  const sup = rich(f['지원 주체']||'');
  const on = d.o ? sHas(d.g,d.o) : null;
  box.innerHTML = `<div class="sd-h"><b>${rich(title)}</b>${on===null?'<span class="bd">그룹</span>':`<span class="bd ${on?'':'off'}">${on?'선택됨':'선택 안 됨'}</span>`}<small>${esc(d.o?g.title:'')}</small></div>`
    + row('소개',rich(f['소개']||''))
    + row('포털 위치',rich(f['위치']||''),'ui')
    + row('이 옵션의 동작',rich(f['동작']||f['평가']||''))
    + row('매칭 · 충족 판정',rich(f['매칭']||f['충족 판정']||''))
    + (f['표현'] ? row('방법별 표현 (클라이언트)',expr(f['표현']),'ex-box') : '')
    + row('사용자 경험',rich(f['사용자 경험']||''))
    + row('미충족 시',rich(f['미충족 시']||''))
    + row('지원 주체',sup)
    + row('제약 · 주의',rich(f['제약·주의']||''),'warn')
    + row('로그',rich(f['로그']||''))
    + sourcePanelHtml((f['출처']||'').split(/;\s*/).filter(Boolean));
}
function renderSimResult(){
  const box = $('#simResult'); if(!box || !SIM.result) return;
  if(!SIM.scnList) simBuildScn();
  const R = SIM.result, e = R.endNode;
  const rtBlock = R.outcome==='blocked' && e.phase==='runtime';
  const meta = rtBlock ? ['bad','토큰 발급 후 차단'] : {ok:['ok','접근 허용'],blocked:['bad','차단'],na:['na','정책 미적용'],off:['na','평가 안 함'],rblocked:['warn','보고 전용 — 차단됐을 요청']}[R.outcome];
  const logv = (e.sub||'').replace(/^result:\s*/,'');
  const P = SIM.l3.sim.presets.find(p=>p.name===SIM.presetName);
  const who = SIM_TESTS.map(t=>t.k).filter(simRelevant).map(k=>`${(SIM_TESTS.find(t=>t.k===k)||{}).label}: ${TLAB(k,SIM.T[k])}`).join(' · ');
  let h = `<div class="rs-scn"><span class="lg"><i class="g"></i>충족·일치<i class="r"></i>미충족·불일치${SIM.view==='full'?'<i class="b"></i>지나지 않는 단계':''}<button type="button" class="vtog" onclick="simToggleView()">${SIM.view==='full'?'지나는 단계만 보기':'전체 평가 구조 보기'}</button></span><b>${P?'예시 · '+esc(P.name):'직접 구성한 정책'}</b>${P?`<span>${esc(P.desc)}</span>`:''}<div class="who">${SIM.scnIdx>0&&SIM.scnList[SIM.scnIdx]?`시나리오 — <b>${esc(SIM.scnList[SIM.scnIdx].label)}</b><br>`:''}테스트 로그인 — ${esc(who)}</div></div>`;
  h += `<div class="rs-top ${meta[0]}"><span class="rb">${meta[1]}</span><span class="rtt">${R.outcome==='ok' && R.report ? '보고 전용: 강제 없이 결과만 기록' : e.title}</span>${/result:/.test(e.sub)?`<code>result: ${esc(logv)}</code>`:''}</div>`;
  h += `<div class="rs-sc"><span class="lab">시나리오 <small>정책 옵션으로 자동 생성 · 눌러서 선택</small></span>` + SIM.scnList.map((c,i)=>`<button type="button" class="scn${i===SIM.scnIdx?' sel':''}" onclick="simSelectScn(${i})" title="${esc(c.desc)}"><i class="${c.cls}">${esc(c.res)}</i>${esc(c.label)}</button>`).join('') + `</div>`;
  h += `<div class="rs-cols"><div><h5>평가 순서별 판정</h5><ul class="rl">` + R.trace.map(t=>`<li class="${t.k}">${rich(t.t)}</li>`).join('') + `</ul></div>`;
  h += `<div><h5>허용 컨트롤 · 세션 컨트롤</h5><ul class="rl">`;
  if(R.block) h += `<li class="no">액세스 차단 — 다른 컨트롤은 평가하지 않음</li>`;
  R.grantRows.filter(r=>r.c).forEach(r=>{
    const lab = sLab(r.c);
    if(r.skipped) h += `<li class="info">${esc(lab)} — OR 결합: 앞 컨트롤로 이미 충족</li>`;
    else if(r.sat) h += `<li class="ok">${esc(lab)} — 충족 (${esc(r.why)})</li>`;
    else if(r.prompt) h += `<li class="${r.done?'warn':'no'}">${esc(lab)} — 미충족 → 사용자에게 요구 ${r.done?'→ 수행 후 충족':'→ 수행 못 함 → 차단'}</li>`;
    else if(r.or && r.done) h += `<li class="info">${esc(lab)} — 미충족이지만 OR 결합이라 다른 컨트롤로 충족 (${esc(r.why)})</li>`;
    else h += `<li class="no">${esc(lab)} — 미충족 (${esc(r.why)}) → 대화형으로 해결 불가</li>`;
  });
  R.sessRows.filter(r=>r.id).forEach(r=>h += `<li class="${r.eff?'ok':'info'}">${esc(sLab(r.id))}${r.sub?' ('+esc(r.sub)+')':''} — ${r.eff?'적용':esc(r.why)}${r.runtime?` <span class="rtx">→ 토큰 이후: ${esc(r.runtime)}</span>`:''}</li>`);
  if(!R.block && !R.grantRows.filter(r=>r.c).length && !R.sessRows.filter(r=>r.id).length) h += `<li class="info">추가 컨트롤 없음</li>`;
  h += `</ul></div></div>`;
  if(R.warns.length) h += `<div class="rs-warn"><b>구성 점검</b><ul>${R.warns.map(w=>`<li>${rich(w)}</li>`).join('')}</ul></div>`;
  box.innerHTML = h;
}
/* ─── 시나리오: 선택한 정책 옵션으로 서로 다른 결과가 나오는 로그인 변형을 자동으로 찾는다 ─── */
const SIM_OUT_LABEL = {ok:['허용','ok'],blocked:['차단','bad'],na:['미적용','na'],off:['평가 안 함','na'],rblocked:['보고 전용 차단','warn']};
function simBuildScn(){
  const base = SIM.T, found = [], seen = new Set();
  const probe = T=>{
    SIM.T = T; const l4 = simGenerate(), R = SIM.result, byId = Object.fromEntries(l4.nodes.map(n=>[n.id,n]));
    const titles = l4.fixedRoute.map((id,i)=>byId[id].title + '/' + ((l4.edges.find(e=>e.from===id&&e.to===l4.fixedRoute[i+1])||{}).label||'')).join('>');
    const rt = R.outcome==='blocked' && R.endNode.phase==='runtime';
    return {sig:titles+'|'+R.endNode.sub, o:R.outcome, rt, end:R.endNode.title};
  };
  try{
    const b = probe(Object.assign({},base)); seen.add(b.sig);
    const mk = (r,label,over,desc)=>{ const m = r.rt ? ['토큰 후 차단','bad'] : SIM_OUT_LABEL[r.o]; return {label,over,res:m[0],cls:m[1],o:r.o,desc:desc||''}; };
    found.push(mk(b,'정책 그대로 (현재 테스트 로그인)',null,'왼쪽에서 정한 정책과 테스트 로그인 그대로'));
    SIM_TESTS.forEach(t=>{
      if(!simRelevant(t.k)) return;
      t.o.forEach(([v,lab])=>{
        if(v===base[t.k]) return;
        const T = Object.assign({},base); T[t.k] = v;
        const r = probe(T); if(seen.has(r.sig)) return; seen.add(r.sig);
        found.push(mk(r,`${t.label}: ${TLAB(t.k,v)}`,{[t.k]:v},`‘${t.label}’을(를) ‘${TLAB(t.k,v)}’(으)로 바꾸면 → ${r.end}`));
      });
    });
  } finally { SIM.T = base; simGenerate(); }
  const rank = c=> c.o==='blocked'||c.o==='rblocked' ? 1 : c.o==='ok' ? 2 : 3;
  const head = found.shift();
  found.sort((a,b)=>rank(a)-rank(b));
  const cap = {1:6,2:3,3:4}, cnt = {1:0,2:0,3:0};
  SIM.scnList = [head].concat(found.filter(c=>{ const k = rank(c); return cnt[k]++ < cap[k]; }));
  SIM.scnIdx = 0;
}
function simClearScn(){
  if(!SIM.scn) return;
  Object.keys(SIM.scn.over).forEach(k=>{ if(SIM.T[k]===SIM.scn.over[k]) SIM.T[k] = SIM.scn.prev[k]; });
  SIM.scn = null;
}
function simSelectScn(i){
  const c = SIM.scnList && SIM.scnList[i]; if(!c) return;
  stopAll(); simClearScn();
  if(c.over){ const prev = {}; Object.keys(c.over).forEach(k=>{ prev[k] = SIM.T[k]; SIM.T[k] = c.over[k]; }); SIM.scn = {over:c.over, prev}; }
  SIM.scnIdx = i; simRefresh(true);
}
function simToggleView(){ SIM.view = SIM.view==='full' ? 'path' : 'full'; simRefresh(); }
function simRefresh(keepScn){
  stopAll();
  if(keepScn!==true){ simClearScn(); SIM.scnList = null; SIM.scnIdx = 0; }
  const l4 = simGenerate();
  SIM.l3.l4 = [l4]; st.l4 = 0;
  renderSimPanel(); renderSimDetail(); renderSimResult();
  buildStage();
}
