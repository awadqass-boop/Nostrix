import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const C=window.NOSTRIX_STAFF_CONFIG||{},$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const ok=C.SUPABASE_URL&&C.SUPABASE_PUBLISHABLE_KEY&&!C.SUPABASE_URL.includes("PASTE_");
const S={db:null,user:null,profile:null,profiles:[],projects:[],tasks:[],comments:[],links:[],files:[],activity:[],notifications:[],view:"mine",search:"",priority:"all",assignee:"all",project:"all",taskId:null,lang:localStorage.getItem("nostrix_language_v1")==="ar"?"ar":"en",rt:null};
const T={en:{staffWorkspace:"Staff workspace",welcome:"Welcome back.",loginHelp:"Sign in with an approved Nostrix work email.",workEmail:"Work email",sendLink:"Send sign-in link",inviteOnly:"Invite-only access",workspace:"WORKSPACE",teamTasks:"TEAM TASKS",hello:"Hello",dashboardIntro:"Keep track of what needs to be done, who owns it and what is coming up next.",projects:"Projects",newTask:"New task",toDo:"To do",inProgress:"In progress",dueSoon:"Due soon",overdue:"Overdue",completed:"Completed",projectProgress:"PROJECT PROGRESS",activeProjects:"Active projects",manageProjects:"Manage projects",myTasks:"My tasks",allTasks:"All tasks",today:"Today",review:"Review",done:"Done",privateWorkspace:"Private staff workspace",profile:"Profile",signOut:"Sign out",updates:"Updates",notifications:"Notifications",markAllRead:"Mark all read",browserAlerts:"Enable browser alerts",taskDetails:"TASK DETAILS",details:"Details",comments:"Comments",filesLinks:"Files & links",activity:"Activity"},ar:{staffWorkspace:"مساحة فريق العمل",welcome:"مرحباً بعودتك.",loginHelp:"سجّل الدخول ببريد نوستريكس المعتمد.",workEmail:"بريد العمل",sendLink:"إرسال رابط الدخول",inviteOnly:"الدخول للمدعوين فقط",workspace:"مساحة العمل",teamTasks:"مهام الفريق",hello:"مرحباً",dashboardIntro:"تابع المهام والمسؤولين والمواعيد القادمة.",projects:"المشاريع",newTask:"مهمة جديدة",toDo:"للإنجاز",inProgress:"قيد التنفيذ",dueSoon:"موعد قريب",overdue:"متأخرة",completed:"مكتملة",projectProgress:"تقدم المشاريع",activeProjects:"المشاريع النشطة",manageProjects:"إدارة المشاريع",myTasks:"مهامي",allTasks:"كل المهام",today:"اليوم",review:"للمراجعة",done:"تم",privateWorkspace:"مساحة خاصة بالفريق",profile:"الملف الشخصي",signOut:"تسجيل الخروج",updates:"التحديثات",notifications:"الإشعارات",markAllRead:"تحديد الكل كمقروء",browserAlerts:"تفعيل إشعارات المتصفح",taskDetails:"تفاصيل المهمة",details:"التفاصيل",comments:"التعليقات",filesLinks:"الملفات والروابط",activity:"السجل"}};
const tr=k=>T[S.lang][k]||T.en[k]||k, esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const initials=v=>{let p=String(v||"N").split("@")[0].replace(/[._-]/g," ").trim().split(/\s+/);return ((p[0]?.[0]||"N")+(p[1]?.[0]||"")).toUpperCase()};
const QUACK=new Audio("./duck-quack.wav");QUACK.preload="auto";QUACK.volume=.72;let soundPrimed=false;function primeSound(){if(soundPrimed)return;soundPrimed=true;try{QUACK.load()}catch{}}function playQuack(){try{QUACK.currentTime=0;let p=QUACK.play();if(p?.catch)p.catch(()=>{})}catch{}}
const toast=m=>{let e=$("#toast");e.textContent=m;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>e.hidden=true,2300)};
const days=s=>{if(!s)return null;let a=new Date(s+"T12:00:00"),b=new Date();a.setHours(0,0,0,0);b.setHours(0,0,0,0);return Math.round((a-b)/864e5)};
const due=s=>{let d=days(s);if(d===null)return"No due date";if(d<0)return"Overdue";if(d===0)return"Due today";if(d===1)return"Due tomorrow";return new Intl.DateTimeFormat(S.lang==="ar"?"ar-AE":"en-GB",{day:"numeric",month:"short"}).format(new Date(s+"T12:00:00"))};
const dt=s=>s?new Intl.DateTimeFormat(S.lang==="ar"?"ar-AE":"en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}).format(new Date(s)):"";
const EVERYONE="__everyone__";
function taskAssigneeName(t){
  if(t?.assigned_to_all)return "Everyone";
  return pn(t?.assigned_to);
}
function assigneeTargets(t){
  if(t?.assigned_to_all)return S.profiles.map(p=>p.user_id);
  return t?.assigned_to?[t.assigned_to]:[];
}
function assigneeValueForTask(t){
  if(t?.assigned_to_all)return EVERYONE;
  return t?.assigned_to||"";
}
function setAssigneeValue(value,close=true){
  $("#task-assignee").value=value;
  updateAssigneeTrigger(value);
  if(close)closeAssigneeMenu();
}
function updateAssigneeTrigger(value=$("#task-assignee").value){
  const icon=$("#assignee-trigger-icon"),name=$("#assignee-trigger-name"),sub=$("#assignee-trigger-sub");
  if(!icon||!name||!sub)return;
  if(value===EVERYONE){
    icon.innerHTML='<i class="ph ph-users-three"></i>';
    icon.className="assignee-choice-icon everyone";
    name.textContent="Everyone";
    sub.textContent="Assign to the whole Nostrix team";
    return;
  }
  if(!value){
    icon.innerHTML='<i class="ph ph-user-minus"></i>';
    icon.className="assignee-choice-icon unassigned";
    name.textContent="Unassigned";
    sub.textContent="No team member assigned";
    return;
  }
  const p=pf(value),label=p?.display_name||p?.email||"Team member";
  icon.innerHTML=`<span>${esc(initials(label))}</span>`;
  icon.className="assignee-choice-icon person";
  name.textContent=label;
  sub.textContent=p?.job_title||p?.email||"Nostrix team";
}
function renderAssigneeMenu(){
  const menu=$("#assignee-menu");
  if(!menu)return;
  const current=$("#task-assignee").value;
  const special=[
    {value:EVERYONE,name:"Everyone",sub:"Assign this task to the whole team",icon:'<i class="ph ph-users-three"></i>',cls:"everyone"},
    {value:"",name:"Unassigned",sub:"Leave this task without an assignee",icon:'<i class="ph ph-user-minus"></i>',cls:"unassigned"}
  ];
  const specialHtml=special.map(o=>`<button type="button" class="assignee-option ${current===o.value?"selected":""}" role="option" aria-selected="${current===o.value}" data-assignee-value="${esc(o.value)}"><span class="assignee-choice-icon ${o.cls}">${o.icon}</span><span><strong>${esc(o.name)}</strong><small>${esc(o.sub)}</small></span><i class="ph ph-check check"></i></button>`).join("");
  const peopleHtml=S.profiles.map(p=>{const label=p.display_name||p.email;return`<button type="button" class="assignee-option ${current===p.user_id?"selected":""}" role="option" aria-selected="${current===p.user_id}" data-assignee-value="${esc(p.user_id)}"><span class="assignee-choice-icon person"><span>${esc(initials(label))}</span></span><span><strong>${esc(label)}</strong><small>${esc(p.job_title||p.email||"Nostrix team")}</small></span><i class="ph ph-check check"></i></button>`}).join("");
  menu.innerHTML=`<div class="assignee-menu-title">Assign task to</div>${specialHtml}<div class="assignee-divider"><span>Team members</span></div>${peopleHtml}`;
  $$("[data-assignee-value]",menu).forEach(b=>b.onclick=()=>setAssigneeValue(b.dataset.assigneeValue));
}
function openAssigneeMenu(){
  const menu=$("#assignee-menu"),trigger=$("#assignee-trigger");
  if(!menu||!trigger)return;
  renderAssigneeMenu();
  menu.hidden=false;
  trigger.setAttribute("aria-expanded","true");
  $("#assignee-picker")?.classList.add("open");
}
function closeAssigneeMenu(){
  const menu=$("#assignee-menu"),trigger=$("#assignee-trigger");
  if(menu)menu.hidden=true;
  if(trigger)trigger.setAttribute("aria-expanded","false");
  $("#assignee-picker")?.classList.remove("open");
}

const ENHANCED_SELECT_IDS=[
  "assignee-filter",
  "project-filter",
  "priority-filter",
  "task-project",
  "task-priority",
  "task-status",
  "project-status"
];

function selectIcon(select,value){
  const id=select.id;
  if(id.includes("project")) return '<i class="ph ph-folder-simple"></i>';
  if(id.includes("priority")){
    if(value==="urgent") return '<i class="ph ph-warning-octagon"></i>';
    if(value==="high") return '<i class="ph ph-arrow-up"></i>';
    if(value==="medium") return '<i class="ph ph-minus"></i>';
    if(value==="low") return '<i class="ph ph-arrow-down"></i>';
    return '<i class="ph ph-sliders-horizontal"></i>';
  }
  if(id.includes("status")){
    if(value==="todo") return '<i class="ph ph-list-checks"></i>';
    if(value==="progress") return '<i class="ph ph-spinner-gap"></i>';
    if(value==="review") return '<i class="ph ph-eye"></i>';
    if(value==="done") return '<i class="ph ph-check-circle"></i>';
    if(value==="active") return '<i class="ph ph-play-circle"></i>';
    if(value==="archived") return '<i class="ph ph-archive"></i>';
    return '<i class="ph ph-circle"></i>';
  }
  if(id.includes("assignee")) return '<i class="ph ph-users"></i>';
  return '<i class="ph ph-caret-circle-down"></i>';
}

function selectTone(select,value){
  if(select.id.includes("priority")) return value||"neutral";
  if(select.id.includes("status")) return value||"neutral";
  if(select.id.includes("project")) return "project";
  if(select.id.includes("assignee")) return "people";
  return "neutral";
}

function customSelectLabel(select){
  const map={
    "assignee-filter":"People",
    "project-filter":"Projects",
    "priority-filter":"Priority",
    "task-project":"Project",
    "task-priority":"Priority",
    "task-status":"Status",
    "project-status":"Status"
  };
  return map[select.id]||"Choose option";
}

function ensureCustomSelect(select){
  if(!select || select.dataset.nostrixEnhanced==="1") return;
  select.dataset.nostrixEnhanced="1";
  select.classList.add("nostrix-native-select");

  const shell=document.createElement("div");
  shell.className="nostrix-select";
  shell.dataset.selectId=select.id;

  const trigger=document.createElement("button");
  trigger.type="button";
  trigger.className="nostrix-select-trigger";
  trigger.setAttribute("aria-haspopup","listbox");
  trigger.setAttribute("aria-expanded","false");

  const menu=document.createElement("div");
  menu.className="nostrix-select-menu";
  menu.setAttribute("role","listbox");
  menu.hidden=true;

  select.insertAdjacentElement("afterend",shell);
  shell.append(trigger,menu);

  trigger.addEventListener("click",e=>{
    e.stopPropagation();
    closeAllCustomSelects(shell);
    refreshOneCustomSelect(select);
    const opening=menu.hidden;
    menu.hidden=!opening;
    trigger.setAttribute("aria-expanded",String(opening));
    shell.classList.toggle("open",opening);
  });

  menu.addEventListener("click",e=>e.stopPropagation());
  refreshOneCustomSelect(select);
}

function refreshOneCustomSelect(select){
  if(!select || select.dataset.nostrixEnhanced!=="1") return;
  const shell=select.nextElementSibling;
  if(!shell?.classList.contains("nostrix-select")) return;
  const trigger=$(".nostrix-select-trigger",shell);
  const menu=$(".nostrix-select-menu",shell);
  const selected=select.options[select.selectedIndex]||select.options[0];
  const value=select.value;
  const text=selected?.textContent?.trim()||"Choose";
  const tone=selectTone(select,value);

  trigger.className=`nostrix-select-trigger tone-${tone}`;
  trigger.innerHTML=`
    <span class="nostrix-select-icon">${selectIcon(select,value)}</span>
    <span class="nostrix-select-copy">
      <small>${esc(customSelectLabel(select))}</small>
      <strong>${esc(text)}</strong>
    </span>
    <i class="ph ph-caret-down nostrix-select-caret"></i>
  `;

  const groups=[...select.children];
  let html="";
  let optionIndex=0;

  for(const node of groups){
    if(node.tagName==="OPTGROUP"){
      html+=`<div class="nostrix-select-group">${esc(node.label)}</div>`;
      for(const opt of [...node.children]){
        html+=customOption(select,opt,optionIndex++);
      }
    }else if(node.tagName==="OPTION"){
      html+=customOption(select,node,optionIndex++);
    }
  }
  menu.innerHTML=html||`<div class="nostrix-select-empty">No options</div>`;

  $$("[data-custom-option]",menu).forEach(btn=>{
    btn.addEventListener("click",()=>{
      select.value=btn.dataset.value;
      select.dispatchEvent(new Event("change",{bubbles:true}));
      refreshOneCustomSelect(select);
      closeAllCustomSelects();
    });
  });
}

function customOption(select,opt,index){
  const value=opt.value;
  const selected=select.value===value;
  const tone=selectTone(select,value);
  return `<button type="button"
    class="nostrix-select-option tone-${tone} ${selected?"selected":""}"
    role="option"
    aria-selected="${selected}"
    data-custom-option="${index}"
    data-value="${esc(value)}">
      <span class="nostrix-option-icon">${selectIcon(select,value)}</span>
      <span class="nostrix-option-copy">
        <strong>${esc(opt.textContent.trim())}</strong>
      </span>
      <i class="ph ph-check nostrix-option-check"></i>
    </button>`;
}

function refreshCustomSelects(){
  ENHANCED_SELECT_IDS.forEach(id=>{
    const select=$("#"+id);
    if(!select) return;
    ensureCustomSelect(select);
    refreshOneCustomSelect(select);
  });
}

function closeAllCustomSelects(exceptShell=null){
  $$(".nostrix-select").forEach(shell=>{
    if(shell===exceptShell) return;
    const menu=$(".nostrix-select-menu",shell);
    const trigger=$(".nostrix-select-trigger",shell);
    if(menu)menu.hidden=true;
    if(trigger)trigger.setAttribute("aria-expanded","false");
    shell.classList.remove("open");
  });
}

const pf=id=>S.profiles.find(x=>x.user_id===id),pn=id=>pf(id)?.display_name||pf(id)?.email||"Unassigned",pr=id=>S.projects.find(x=>x.id===id);
function applyLang(){document.documentElement.lang=S.lang;document.documentElement.dir=S.lang==="ar"?"rtl":"ltr";localStorage.setItem("nostrix_language_v1",S.lang);$$("[data-t]").forEach(e=>e.textContent=tr(e.dataset.t));$$(".lang").forEach(e=>e.textContent=S.lang==="ar"?"EN":"AR");renderAll()}
function show(id){$("#auth-screen").hidden=id!=="auth-screen";$("#app-screen").hidden=id!=="app-screen"}
async function loadAll(){await Promise.all([loadProfiles(),loadProjects(),loadTasks(),loadNotifs()]);renderAll()}
async function loadProfiles(){let{data}=await S.db.from("profiles").select("*").order("display_name");S.profiles=data||[];fillOptions()}
async function loadProjects(){let{data,error}=await S.db.from("projects").select("*").order("created_at",{ascending:false});if(error)console.error(error);S.projects=data||[];fillOptions()}
async function loadTasks(){let{data,error}=await S.db.from("tasks").select("*").order("created_at",{ascending:false});if(error)console.error(error);S.tasks=data||[]}
async function loadNotifs(){if(!S.user)return;let{data}=await S.db.from("notifications").select("*").eq("user_id",S.user.id).order("created_at",{ascending:false}).limit(40);S.notifications=data||[]}
function fillOptions(){let current=$("#task-assignee")?.value||"",ppl=S.profiles.map(p=>`<option value="${esc(p.user_id)}">${esc(p.display_name||p.email)}</option>`).join(""),pro=S.projects.filter(p=>p.status==="active").map(p=>`<option value="${esc(p.id)}">${esc(p.client_name?p.client_name+" — "+p.name:p.name)}</option>`).join("");$("#task-assignee").innerHTML=`<option value="${EVERYONE}">Everyone</option><option value="">Unassigned</option>${ppl}`;if([...$("#task-assignee").options].some(o=>o.value===current))$("#task-assignee").value=current;$("#assignee-filter").innerHTML=`<option value="all">All people</option><option value="${EVERYONE}">Everyone</option><option value="none">Unassigned</option>${ppl}`;$("#task-project").innerHTML=`<option value="">No project</option>${pro}`;$("#project-filter").innerHTML=`<option value="all">All projects</option><option value="none">No project</option>${pro}`;updateAssigneeTrigger($("#task-assignee").value);if(!$("#assignee-menu").hidden)renderAssigneeMenu();refreshCustomSelects()}
function filtered(){let a=[...S.tasks];if(S.view==="mine")a=a.filter(t=>t.assigned_to_all||t.assigned_to===S.user.id||t.created_by===S.user.id);if(S.view==="today")a=a.filter(t=>t.status!=="done"&&t.due_date&&days(t.due_date)<=1);if(S.priority!=="all")a=a.filter(t=>t.priority===S.priority);if(S.assignee===EVERYONE)a=a.filter(t=>t.assigned_to_all);else if(S.assignee==="none")a=a.filter(t=>!t.assigned_to&&!t.assigned_to_all);else if(S.assignee!=="all")a=a.filter(t=>!t.assigned_to_all&&t.assigned_to===S.assignee);if(S.project==="none")a=a.filter(t=>!t.project_id);else if(S.project!=="all")a=a.filter(t=>t.project_id===S.project);if(S.search){let q=S.search.toLowerCase();a=a.filter(t=>`${t.title} ${t.details||""} ${taskAssigneeName(t)} ${pr(t.project_id)?.name||""} ${pr(t.project_id)?.client_name||""}`.toLowerCase().includes(q))}return a}
function card(t){let p=pr(t.project_id),d=days(t.due_date),od=d!==null&&d<0&&t.status!=="done",n=taskAssigneeName(t),creator=pn(t.created_by),mine=t.created_by===S.user.id;return`<article class="task ${mine?"task-owned":""}" draggable="true" data-id="${t.id}"><div class="task-top"><div class="chips"><span class="chip ${t.priority}">${esc(t.priority)}</span>${od?`<span class="chip overdue">Overdue</span>`:""}${t.assigned_to_all?`<span class="chip everyone-chip"><i class="ph ph-users-three"></i>Everyone</span>`:""}</div><button class="task-menu" data-edit="${t.id}" aria-label="Open task options"><i class="ph ph-dots-three"></i></button></div>${p?`<div class="project-tag"><i class="ph ph-folder-simple"></i><span>${esc(p.client_name?p.client_name+" · "+p.name:p.name)}</span></div>`:""}<h3>${esc(t.title)}</h3>${t.details?`<p>${esc(t.details)}</p>`:""}<div class="meta"><span class="${od?"overdue":""}"><i class="ph ph-calendar-blank"></i>${esc(due(t.due_date))}</span><span>${t.assigned_to_all?`<span class="mini-avatar everyone-avatar"><i class="ph ph-users-three"></i></span>`:`<span class="mini-avatar">${initials(n)}</span>`}${esc(n)}</span><span class="created-by"><i class="ph ph-user-circle-plus"></i>Created by ${esc(creator)}</span></div></article>`}
function renderTasks(){let a=filtered();["todo","progress","review","done"].forEach(s=>{let b=a.filter(t=>t.status===s);$("#"+s).innerHTML=b.map(card).join("");$("#c-"+s).textContent=b.length});$("#s-todo").textContent=S.tasks.filter(t=>t.status==="todo").length;$("#s-progress").textContent=S.tasks.filter(t=>t.status==="progress").length;$("#s-done").textContent=S.tasks.filter(t=>t.status==="done").length;$("#s-due").textContent=S.tasks.filter(t=>t.status!=="done"&&t.due_date&&days(t.due_date)>=0&&days(t.due_date)<=3).length;$("#s-overdue").textContent=S.tasks.filter(t=>t.status!=="done"&&t.due_date&&days(t.due_date)<0).length;$$("[data-edit]").forEach(b=>b.onclick=e=>{e.stopPropagation();openTask(b.dataset.edit)});$$(".task").forEach(c=>{c.onclick=e=>{if(!e.target.closest("button"))openTask(c.dataset.id)};c.ondragstart=e=>e.dataTransfer.setData("text/plain",c.dataset.id)})}
function renderProjects(){let a=S.projects.filter(p=>p.status==="active");$("#project-cards").innerHTML=a.length?a.map(p=>{let t=S.tasks.filter(x=>x.project_id===p.id),d=t.filter(x=>x.status==="done").length,pc=t.length?Math.round(d/t.length*100):0,creator=pn(p.created_by);return`<button class="project-card" data-project="${p.id}"><header><span><b>${esc(p.name)}</b><br><small>${esc(p.client_name||"")}</small></span><b>${pc}%</b></header><div class="bar"><i style="width:${pc}%"></i></div><footer class="project-card-foot"><small>${d}/${t.length} tasks complete</small><small><i class="ph ph-user-circle-plus"></i> ${esc(creator)}</small></footer></button>`}).join(""):`<div class="empty">No active projects yet.</div>`;$$("[data-project]").forEach(b=>b.onclick=()=>{S.project=b.dataset.project;$("#project-filter").value=S.project;S.view="all";setView("all");renderTasks()})}
function renderNotifs(){let u=S.notifications.filter(n=>!n.is_read).length;$("#notif-badge").hidden=!u;$("#notif-badge").textContent=u;$("#notif-list").innerHTML=S.notifications.length?S.notifications.map(n=>`<button class="notif-item ${n.is_read?"":"unread"}" data-n="${n.id}" data-task="${n.task_id||""}"><i class="notif-dot"></i><span><b>${esc(n.title)}</b><small>${esc(n.body||"")}</small><time>${esc(dt(n.created_at))}</time></span></button>`).join(""):`<div class="empty">No notifications yet.</div>`;$$("[data-n]").forEach(b=>b.onclick=()=>openNotif(b.dataset.n,b.dataset.task))}
function renderAll(){if(!$("#app-screen")||$("#app-screen").hidden)return;fillOptions();renderProjects();renderTasks();renderNotifs()}
function setView(v){S.view=v;$$(".view").forEach(b=>b.classList.toggle("active",b.dataset.view===v))}
async function openTask(id=null,tab="details"){let t=id?S.tasks.find(x=>x.id===id):null;S.taskId=t?.id||null;$("#task-id").value=t?.id||"";$("#task-title").value=t?.title||"";$("#task-details").value=t?.details||"";$("#task-project").value=t?.project_id||"";setAssigneeValue(t?assigneeValueForTask(t):S.user.id,false);$("#task-due").value=t?.due_date||"";$("#task-priority").value=t?.priority||"medium";$("#task-status").value=t?.status||"todo";$("#task-heading").textContent=t?.title||"New task";refreshCustomSelects();let owner=t&&t.created_by===S.user.id;$("#delete-task").hidden=!owner;let note=$("#task-owner-note");if(note){note.hidden=!t;note.innerHTML=t?`<i class="ph ph-shield-check"></i> Created by <strong>${esc(pn(t.created_by))}</strong>. ${owner?"You can delete this task.":"Only the original creator can delete it."}`:""}$("#task-modal").hidden=false;document.body.style.overflow="hidden";$$(".task-tab").forEach(b=>b.disabled=!t&&b.dataset.tab!=="details");switchTab(t?tab:"details");if(t)await extras(t.id)}
function closeTask(){$("#task-modal").hidden=true;document.body.style.overflow="";S.taskId=null}
function switchTab(n){$$(".task-tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===n));$$(".tab-panel").forEach(p=>{let a=p.dataset.panel===n;p.hidden=!a;p.classList.toggle("active",a)})}
async function saveTask(e){e.preventDefault();let id=$("#task-id").value,old=id?S.tasks.find(t=>t.id===id):null,av=$("#task-assignee").value,all=av===EVERYONE,p={title:$("#task-title").value.trim(),details:$("#task-details").value.trim()||null,project_id:$("#task-project").value||null,assigned_to:all?null:(av||null),assigned_to_all:all,due_date:$("#task-due").value||null,priority:$("#task-priority").value,status:$("#task-status").value};let r=id?await S.db.from("tasks").update(p).eq("id",id).select().single():await S.db.from("tasks").insert({...p,created_by:S.user.id}).select().single();if(r.error)return toast(r.error.message);let t=r.data;if(!id){await log(t.id,"task_created","Task created");let targets=assigneeTargets(t);if(targets.length)await notify(targets,"assigned",t.assigned_to_all?"New team task":"You were assigned a task",t.title,t.id,t.project_id)}else{if(old?.assigned_to!==t.assigned_to||!!old?.assigned_to_all!==!!t.assigned_to_all){await log(t.id,"assignee_changed",t.assigned_to_all?"Assigned to everyone":"Assignee changed");let targets=assigneeTargets(t);if(targets.length)await notify(targets,"assigned",t.assigned_to_all?"Task assigned to everyone":"You were assigned a task",t.title,t.id,t.project_id)}if(old?.status!==t.status){await log(t.id,"status_changed","Status changed to "+t.status);let targets=[t.created_by,...assigneeTargets(t)];if(t.status==="review")await notify(targets,"review","Task moved to Review",t.title,t.id,t.project_id);if(t.status==="done")await notify(targets,"done","Task completed",t.title,t.id,t.project_id)}}await loadTasks();S.taskId=t.id;$("#task-id").value=t.id;$("#task-heading").textContent=t.title;$("#delete-task").hidden=t.created_by!==S.user.id;await extras(t.id);renderAll();toast("Task saved")}
async function delTask(){let id=$("#task-id").value,t=S.tasks.find(x=>x.id===id);if(!id||!t)return;if(t.created_by!==S.user.id)return toast("Only the original creator can delete this task");if(!confirm("Delete this task permanently?"))return;let paths=S.files.map(f=>f.storage_path);if(paths.length)await S.db.storage.from("nostrix-staff-files").remove(paths);let{error}=await S.db.from("tasks").delete().eq("id",id);if(error)return toast(error.message);closeTask();await loadTasks();renderAll();toast("Task deleted")}
async function move(id,status){let t=S.tasks.find(x=>x.id===id);if(!t||t.status===status)return;let{data,error}=await S.db.from("tasks").update({status}).eq("id",id).select().single();if(error)return toast(error.message);await log(id,"status_changed","Status changed to "+status);let targets=[data.created_by,...assigneeTargets(data)];if(status==="review")await notify(targets,"review","Task moved to Review",data.title,id,data.project_id);if(status==="done")await notify(targets,"done","Task completed",data.title,id,data.project_id);await loadTasks();renderAll()}
async function extras(id){let [a,b,c,d]=await Promise.all([S.db.from("task_comments").select("*").eq("task_id",id).order("created_at"),S.db.from("task_links").select("*").eq("task_id",id).order("created_at",{ascending:false}),S.db.from("task_files").select("*").eq("task_id",id).order("created_at",{ascending:false}),S.db.from("task_activity").select("*").eq("task_id",id).order("created_at",{ascending:false})]);S.comments=a.data||[];S.links=b.data||[];S.files=c.data||[];S.activity=d.data||[];renderExtras()}
function renderExtras(){$("#comment-count").textContent=S.comments.length;$("#resource-count").textContent=S.links.length+S.files.length;$("#comments-list").innerHTML=S.comments.length?S.comments.map(c=>`<article class="comment"><span class="mini-avatar">${initials(pn(c.user_id))}</span><div><header><b>${esc(pn(c.user_id))}</b><time>${esc(dt(c.created_at))}</time></header><p>${esc(c.body)}</p></div></article>`).join(""):`<div class="empty">No comments yet.</div>`;$("#links-list").innerHTML=S.links.map(l=>`<article class="resource-item"><a href="${esc(l.url)}" target="_blank"><i class="ph ph-link"></i><span><b>${esc(l.label||"Link")}</b><small>${esc(l.url)}</small></span></a><button data-dlink="${l.id}"><i class="ph ph-x"></i></button></article>`).join("");$("#files-list").innerHTML=S.files.map(f=>`<article class="resource-item"><button class="resource-open" data-file="${esc(f.storage_path)}"><i class="ph ph-file"></i><span><b>${esc(f.file_name)}</b><small>${Math.round((f.size_bytes||0)/1024)} KB</small></span></button><button data-dfile="${f.id}" data-path="${esc(f.storage_path)}"><i class="ph ph-x"></i></button></article>`).join("");$("#activity-list").innerHTML=S.activity.length?S.activity.map(a=>`<article class="activity-item"><i class="ph ph-clock-counter-clockwise"></i><div><p><b>${esc(pn(a.actor_id))}</b> ${esc(a.detail||a.action)}</p><time>${esc(dt(a.created_at))}</time></div></article>`).join(""):`<div class="empty">No activity yet.</div>`;$$("[data-dlink]").forEach(b=>b.onclick=()=>delLink(b.dataset.dlink));$$("[data-file]").forEach(b=>b.onclick=()=>openFile(b.dataset.file));$$("[data-dfile]").forEach(b=>b.onclick=()=>delFile(b.dataset.dfile,b.dataset.path))}
async function comment(e){e.preventDefault();let body=$("#comment-body").value.trim();if(!S.taskId||!body)return;let{error}=await S.db.from("task_comments").insert({task_id:S.taskId,user_id:S.user.id,body});if(error)return toast(error.message);$("#comment-body").value="";await log(S.taskId,"comment_added","Comment added");let t=S.tasks.find(x=>x.id===S.taskId);await notify([t?.created_by,...assigneeTargets(t)],"comment","New task comment",body.slice(0,100),S.taskId,t?.project_id);await extras(S.taskId);toast("Comment posted")}
async function addLink(e){e.preventDefault();if(!S.taskId)return;let url=$("#link-url").value.trim(),label=$("#link-label").value.trim()||"Link";let{error}=await S.db.from("task_links").insert({task_id:S.taskId,label,url,created_by:S.user.id});if(error)return toast(error.message);$("#link-label").value="";$("#link-url").value="";await log(S.taskId,"link_attached","Link attached: "+label);await extras(S.taskId)}
async function delLink(id){if(!confirm("Remove this link?"))return;await S.db.from("task_links").delete().eq("id",id);await extras(S.taskId)}
async function upload(f){if(!S.taskId||!f)return;if(f.size>20*1024*1024)return toast("File exceeds 20 MB");let safe=f.name.replace(/[^\w.\-]+/g,"_"),path=`${S.taskId}/${crypto.randomUUID()}-${safe}`,u=await S.db.storage.from("nostrix-staff-files").upload(path,f);if(u.error)return toast(u.error.message);let r=await S.db.from("task_files").insert({task_id:S.taskId,file_name:f.name,storage_path:path,mime_type:f.type||null,size_bytes:f.size,created_by:S.user.id});if(r.error){await S.db.storage.from("nostrix-staff-files").remove([path]);return toast(r.error.message)}await log(S.taskId,"file_attached","File attached: "+f.name);await extras(S.taskId);toast("File uploaded")}
async function openFile(path){let{data,error}=await S.db.storage.from("nostrix-staff-files").createSignedUrl(path,3600);if(error)return toast(error.message);window.open(data.signedUrl,"_blank")}
async function delFile(id,path){if(!confirm("Remove this file?"))return;await S.db.storage.from("nostrix-staff-files").remove([path]);await S.db.from("task_files").delete().eq("id",id);await extras(S.taskId)}
async function log(task_id,action,detail,project_id=null){if(S.user)await S.db.from("task_activity").insert({task_id,project_id,actor_id:S.user.id,action,detail})}
async function notify(ids,type,title,body,task_id,project_id){let users=[...new Set((ids||[]).filter(Boolean))].filter(x=>x!==S.user.id);if(users.length)await S.db.from("notifications").insert(users.map(user_id=>({user_id,type,title,body,task_id,project_id})))}
function openProjects(){$("#projects-modal").hidden=false;document.body.style.overflow="hidden";renderProjectList()}
function closeProjects(){$("#projects-modal").hidden=true;document.body.style.overflow="";clearProject()}
function clearProject(){$("#project-id").value="";$("#project-name").value="";$("#project-client").value="";$("#project-due").value="";$("#project-status").value="active";refreshCustomSelects()}
function renderProjectList(){$("#projects-list").innerHTML=S.projects.map(p=>{let mine=p.created_by===S.user.id;return`<article class="project-row"><div><strong>${esc(p.name)}</strong><br><small>${esc(p.client_name||"")}</small><small class="project-owner"><i class="ph ph-user-circle-plus"></i> Created by ${esc(pn(p.created_by))}</small></div><small>${S.tasks.filter(t=>t.project_id===p.id).length} tasks</small><span class="status">${esc(p.status)}</span><div class="project-actions"><button class="text-btn" data-ep="${p.id}">Edit</button><button class="text-btn" data-tp="${p.id}">${p.status==="active"?"Archive":"Restore"}</button>${mine?`<button class="text-btn delete-project" data-dp="${p.id}"><i class="ph ph-trash"></i> Delete</button>`:""}</div></article>`}).join("");$$("[data-ep]").forEach(b=>b.onclick=()=>editProject(b.dataset.ep));$$("[data-tp]").forEach(b=>b.onclick=()=>toggleProject(b.dataset.tp));$$("[data-dp]").forEach(b=>b.onclick=()=>deleteProject(b.dataset.dp))}
function editProject(id){let p=pr(id);$("#project-id").value=id;$("#project-name").value=p.name;$("#project-client").value=p.client_name||"";$("#project-due").value=p.due_date||"";$("#project-status").value=p.status;refreshCustomSelects()}
async function saveProject(e){e.preventDefault();let id=$("#project-id").value,p={name:$("#project-name").value.trim(),client_name:$("#project-client").value.trim()||null,due_date:$("#project-due").value||null,status:$("#project-status").value};let r=id?await S.db.from("projects").update(p).eq("id",id):await S.db.from("projects").insert({...p,created_by:S.user.id});if(r.error)return toast(r.error.message);clearProject();await loadProjects();renderAll();renderProjectList();toast("Project saved")}
async function toggleProject(id){let p=pr(id),status=p.status==="active"?"archived":"active";await S.db.from("projects").update({status}).eq("id",id);await loadProjects();renderAll();renderProjectList()}
async function deleteProject(id){let p=pr(id);if(!p)return;if(p.created_by!==S.user.id)return toast("Only the project creator can delete this project");let count=S.tasks.filter(t=>t.project_id===id).length,msg=count?`Delete "${p.name}"? ${count} task${count===1?"":"s"} will be kept but removed from this project.`:`Delete "${p.name}" permanently?`;if(!confirm(msg))return;let{error}=await S.db.from("projects").delete().eq("id",id);if(error)return toast(error.message);if(S.project===id)S.project="all";clearProject();await Promise.all([loadProjects(),loadTasks()]);renderAll();renderProjectList();toast("Project deleted")}
function openProfile(){$("#profile-name").value=S.profile.display_name||"";$("#profile-role").value=S.profile.job_title||"";$("#profile-modal").hidden=false;document.body.style.overflow="hidden"}
async function saveProfile(e){e.preventDefault();let{data,error}=await S.db.from("profiles").update({display_name:$("#profile-name").value.trim(),job_title:$("#profile-role").value.trim()||null}).eq("user_id",S.user.id).select().single();if(error)return toast(error.message);S.profile=data;await loadProfiles();uiUser();$("#profile-modal").hidden=true;document.body.style.overflow=""}
function uiUser(){let n=S.profile?.display_name||S.user.email.split("@")[0];$("#user-name").textContent=n;$("#user-email").textContent=S.user.email;$("#hello-name").textContent=n.split(" ")[0];$("#avatar").textContent=initials(n)}
async function openNotif(id,task){await S.db.from("notifications").update({is_read:true}).eq("id",id);await loadNotifs();renderNotifs();$("#notif-panel").hidden=true;if(task)openTask(task)}
async function markRead(){await S.db.from("notifications").update({is_read:true}).eq("user_id",S.user.id).eq("is_read",false);await loadNotifs();renderNotifs()}
async function browserAlerts(){primeSound();playQuack();if("Notification"in window&&await Notification.requestPermission()==="granted")toast("Browser + quack alerts enabled");else toast("Quack sound enabled")}
async function login(e){
  e.preventDefault();

  const email=$("#email").value.trim().toLowerCase();
  const domain=(C.ALLOWED_EMAIL_DOMAIN||"nostrix.ae").toLowerCase();
  const msg=$("#auth-message");
  const button=$("#login-form button[type='submit']");

  msg.className="message";
  msg.textContent="";

  if(!email || !email.endsWith("@"+domain)){
    msg.className="message error";
    msg.innerHTML='<i class="ph ph-warning-circle"></i><span>Your email isn’t authorized for the Nostrix Staff Workspace.</span>';
    return;
  }

  button.disabled=true;
  button.classList.add("loading");
  msg.className="message checking";
  msg.textContent="Checking your Nostrix account…";

  const {data:approved,error:checkError}=await S.db.rpc(
    "is_approved_staff_email",
    {candidate_email:email}
  );

  if(checkError){
    console.error(checkError);
    msg.className="message error";
    msg.textContent="We couldn't verify your account right now. Please try again.";
    button.disabled=false;
    button.classList.remove("loading");
    return;
  }

  if(!approved){
    msg.className="message error";
    msg.innerHTML='<i class="ph ph-warning-circle"></i><span>Your email isn’t authorized for the Nostrix Staff Workspace.</span>';
    button.disabled=false;
    button.classList.remove("loading");
    return;
  }

  const {error}=await S.db.auth.signInWithOtp({
    email,
    options:{
      shouldCreateUser:false,
      emailRedirectTo:location.origin+(C.STAFF_PATH||"/staff/")
    }
  });

  button.disabled=false;
  button.classList.remove("loading");

  if(error){
    console.error(error);
    msg.className="message error";
    msg.textContent="We couldn't send the sign-in link. Please try again.";
    return;
  }

  msg.className="message success";
  msg.innerHTML='<i class="ph ph-check-circle"></i><span>Approved. Check your Nostrix inbox for the sign-in link.</span>';
}
async function enter(session){S.user=session.user;let{data}=await S.db.from("profiles").select("*").eq("user_id",S.user.id).maybeSingle();if(!data){await S.db.auth.signOut();return show("auth-screen")}S.profile=data;show("app-screen");await loadAll();uiUser();subscribe()}
async function subscribe(){if(S.rt)await S.db.removeChannel(S.rt);S.rt=S.db.channel("nostrix-v4").on("postgres_changes",{event:"*",schema:"public",table:"tasks"},async()=>{await loadTasks();renderAll()}).on("postgres_changes",{event:"*",schema:"public",table:"projects"},async()=>{await loadProjects();renderAll()}).on("postgres_changes",{event:"INSERT",schema:"public",table:"notifications",filter:`user_id=eq.${S.user.id}`},async p=>{playQuack();await loadNotifs();renderNotifs();if("Notification"in window&&Notification.permission==="granted"&&document.hidden)new Notification(p.new.title,{body:p.new.body||"",icon:"/favicon.png"})}).subscribe()}
async function signout(){if(S.rt)await S.db.removeChannel(S.rt);await S.db.auth.signOut();show("auth-screen")}
function bind(){$$(".lang").forEach(b=>b.onclick=()=>{S.lang=S.lang==="ar"?"en":"ar";applyLang()});$("#login-form").onsubmit=login;$("#assignee-trigger").onclick=e=>{e.stopPropagation();$("#assignee-menu").hidden?openAssigneeMenu():closeAssigneeMenu()};document.addEventListener("click",e=>{if(!e.target.closest("#assignee-picker"))closeAssigneeMenu();if(!e.target.closest(".nostrix-select"))closeAllCustomSelects()});document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeAssigneeMenu();closeAllCustomSelects()}});refreshCustomSelects();$("#new-task").onclick=()=>openTask();$("#task-form").onsubmit=saveTask;$("#delete-task").onclick=delTask;$$("[data-close-task]").forEach(b=>b.onclick=closeTask);$$(".task-tab").forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));$("#comment-form").onsubmit=comment;$("#link-form").onsubmit=addLink;$("#file-input").onchange=e=>{if(e.target.files[0])upload(e.target.files[0]);e.target.value=""};$("#projects-btn").onclick=$("#manage-projects").onclick=openProjects;$$("[data-close-projects]").forEach(b=>b.onclick=closeProjects);$("#project-form").onsubmit=saveProject;$("#project-clear").onclick=clearProject;$("#edit-profile").onclick=()=>{$("#profile-menu").hidden=true;openProfile()};$$("[data-close-profile]").forEach(b=>b.onclick=()=>{$("#profile-modal").hidden=true;document.body.style.overflow=""});$("#profile-form").onsubmit=saveProfile;$("#signout").onclick=signout;$("#refresh-btn").onclick=async()=>{await loadAll();toast("Refreshed")};$("#profile-btn").onclick=()=>$("#profile-menu").hidden=!$("#profile-menu").hidden;$("#notif-btn").onclick=()=>$("#notif-panel").hidden=!$("#notif-panel").hidden;$("#mark-read").onclick=markRead;$("#enable-browser").onclick=browserAlerts;$$(".view").forEach(b=>b.onclick=()=>{setView(b.dataset.view);renderTasks()});$("#search").oninput=e=>{S.search=e.target.value.trim();renderTasks()};$("#priority-filter").onchange=e=>{S.priority=e.target.value;renderTasks()};$("#assignee-filter").onchange=e=>{S.assignee=e.target.value;renderTasks()};$("#project-filter").onchange=e=>{S.project=e.target.value;renderTasks()};$$(".column").forEach(c=>{c.ondragover=e=>e.preventDefault();c.ondrop=e=>{e.preventDefault();move(e.dataTransfer.getData("text/plain"),c.dataset.status)}})}
document.addEventListener("DOMContentLoaded",async()=>{$("#year").textContent=new Date().getFullYear();document.addEventListener("pointerdown",primeSound,{once:true,capture:true});bind();applyLang();if(!ok)return show("auth-screen");S.db=createClient(
  C.SUPABASE_URL,
  C.SUPABASE_PUBLISHABLE_KEY,
  {
    auth:{
      persistSession:true,
      autoRefreshToken:true,
      detectSessionInUrl:true
    }
  }
);let{data:{session}}=await S.db.auth.getSession();session?await enter(session):show("auth-screen");S.db.auth.onAuthStateChange(async(e,s)=>{if(e==="SIGNED_IN"&&s)await enter(s);if(e==="SIGNED_OUT")show("auth-screen")})});