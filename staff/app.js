import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const config = window.NOSTRIX_STAFF_CONFIG || {};
const configured =
  config.SUPABASE_URL &&
  config.SUPABASE_PUBLISHABLE_KEY &&
  !config.SUPABASE_URL.includes("PASTE_") &&
  !config.SUPABASE_PUBLISHABLE_KEY.includes("PASTE_");

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const langKey = "nostrix_language_v1";
const state = {
  supabase: null,
  user: null,
  profile: null,
  profiles: [],
  tasks: [],
  view: "mine",
  search: "",
  priority: "all",
  language: localStorage.getItem(langKey) === "ar" ? "ar" : "en",
  realtime: null
};

const T = {
  en: {
    staffWorkspace:"Staff workspace", welcome:"Welcome back.", loginHelp:"Sign in using an approved Nostrix work email. We’ll send you a secure sign-in link.",
    workEmail:"Work email", sendLink:"Send sign-in link", inviteOnly:"Invite-only access", workspace:"Workspace", teamTasks:"Team tasks",
    hello:"Hello", dashboardIntro:"Keep track of what needs to be done, who owns it and what is coming up next.", newTask:"New task",
    toDo:"To do", inProgress:"In progress", dueSoon:"Due soon", completed:"Completed", myTasks:"My tasks", allTasks:"All tasks",
    searchTasks:"Search tasks", allPriorities:"All priorities", urgent:"Urgent", high:"High", medium:"Medium", low:"Low", review:"Review",
    done:"Done", nothingHere:"Nothing here yet.", emptyHelp:"Create a task or change the filters to see more.", privateWorkspace:"Private staff workspace",
    taskDetails:"Task details", title:"Title", details:"Details", assignee:"Assignee", dueDate:"Due date", priority:"Priority", status:"Status",
    delete:"Delete", cancel:"Cancel", saveTask:"Save task", taskTitlePlaceholder:"What needs to be done?", detailsPlaceholder:"Add context, links or notes",
    yourAccount:"Your account", profile:"Profile", displayName:"Display name", jobTitle:"Job title", jobPlaceholder:"e.g. Chief Creative Officer",
    save:"Save", signOut:"Sign out", unassigned:"Unassigned", taskSaved:"Task saved.", taskDeleted:"Task deleted.", profileSaved:"Profile saved.",
    linkSent:"If this is an approved Nostrix account, a secure sign-in link has been sent to the work mailbox.", invalidEmail:"Please use an approved Nostrix work email.", loginError:"We could not send the sign-in link.",
    loading:"Loading…", deleteConfirm:"Delete this task permanently?", refresh:"Refresh", overdue:"Overdue", dueToday:"Due today", dueTomorrow:"Due tomorrow",
    noDueDate:"No due date", assignedTo:"Assigned to", createdBy:"Created by"
  },
  ar: {
    staffWorkspace:"مساحة فريق العمل", welcome:"مرحباً بعودتك.", loginHelp:"سجّل الدخول باستخدام بريد نوستريكس المعتمد للعمل، وسنرسل لك رابط دخول آمن.",
    workEmail:"البريد الإلكتروني للعمل", sendLink:"إرسال رابط الدخول", inviteOnly:"الدخول للمدعوين فقط", workspace:"مساحة العمل", teamTasks:"مهام الفريق",
    hello:"مرحباً", dashboardIntro:"تابع المهام المطلوب إنجازها والمسؤول عنها والمواعيد القادمة.", newTask:"مهمة جديدة",
    toDo:"للإنجاز", inProgress:"قيد التنفيذ", dueSoon:"موعد قريب", completed:"مكتملة", myTasks:"مهامي", allTasks:"كل المهام",
    searchTasks:"ابحث في المهام", allPriorities:"كل الأولويات", urgent:"عاجل", high:"مرتفع", medium:"متوسط", low:"منخفض", review:"للمراجعة",
    done:"تم", nothingHere:"لا توجد مهام هنا.", emptyHelp:"أنشئ مهمة جديدة أو غيّر عوامل التصفية.", privateWorkspace:"مساحة عمل خاصة بفريق نوستريكس",
    taskDetails:"تفاصيل المهمة", title:"العنوان", details:"التفاصيل", assignee:"المسؤول", dueDate:"تاريخ الاستحقاق", priority:"الأولوية", status:"الحالة",
    delete:"حذف", cancel:"إلغاء", saveTask:"حفظ المهمة", taskTitlePlaceholder:"ما المطلوب إنجازه؟", detailsPlaceholder:"أضف التفاصيل أو الروابط أو الملاحظات",
    yourAccount:"حسابك", profile:"الملف الشخصي", displayName:"الاسم الظاهر", jobTitle:"المسمى الوظيفي", jobPlaceholder:"مثال: المدير الإبداعي",
    save:"حفظ", signOut:"تسجيل الخروج", unassigned:"غير مخصص", taskSaved:"تم حفظ المهمة.", taskDeleted:"تم حذف المهمة.", profileSaved:"تم حفظ الملف الشخصي.",
    linkSent:"إذا كان هذا حساب نوستريكس معتمداً، فقد تم إرسال رابط دخول آمن إلى بريد العمل.", invalidEmail:"يرجى استخدام بريد عمل معتمد تابع لنوستريكس.", loginError:"تعذر إرسال رابط تسجيل الدخول.",
    loading:"جارٍ التحميل…", deleteConfirm:"هل تريد حذف هذه المهمة نهائياً؟", refresh:"تحديث", overdue:"متأخرة", dueToday:"مستحقة اليوم", dueTomorrow:"مستحقة غداً",
    noDueDate:"بدون تاريخ", assignedTo:"المسؤول", createdBy:"أنشأها"
  }
};

function tr(key){ return T[state.language][key] || T.en[key] || key; }
function applyLanguage(){
  document.documentElement.lang = state.language;
  document.documentElement.dir = state.language === "ar" ? "rtl" : "ltr";
  localStorage.setItem(langKey, state.language);
  $$("[data-t]").forEach(el => { el.textContent = tr(el.dataset.t); });
  $$("[data-placeholder-t]").forEach(el => { el.placeholder = tr(el.dataset.placeholderT); });
  $$(".language-toggle").forEach(btn => { btn.textContent = state.language === "ar" ? "EN" : "AR"; });
  renderTasks();
}
function toggleLanguage(){ state.language = state.language === "ar" ? "en" : "ar"; applyLanguage(); }

function showOnly(id){
  ["setup-screen","auth-screen","app-screen"].forEach(x => { const el = $("#"+x); if(el) el.hidden = x !== id; });
}
function toast(message){
  const el = $("#toast"); if(!el) return;
  el.textContent = message; el.hidden = false;
  clearTimeout(toast.timer); toast.timer = setTimeout(() => { el.hidden = true; }, 2400);
}
function initials(nameOrEmail="N"){
  const base = String(nameOrEmail).split("@")[0].replace(/[._-]+/g," ").trim();
  const parts = base.split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || "N") + (parts[1]?.[0] || "");
}
function cleanNameFromEmail(email){
  return String(email||"").split("@")[0].replace(/[._-]+/g," ").replace(/\b\w/g,c=>c.toUpperCase());
}
function allowedEmail(email){
  const domain = (config.ALLOWED_EMAIL_DOMAIN || "nostrix.ae").toLowerCase();
  return String(email||"").trim().toLowerCase().endsWith("@"+domain);
}
function dateValue(s){ return s ? new Date(`${s}T12:00:00`) : null; }
function todayMid(){ const d=new Date(); d.setHours(0,0,0,0); return d; }
function daysFromToday(s){
  const d=dateValue(s); if(!d) return null;
  const t=todayMid(); d.setHours(0,0,0,0);
  return Math.round((d-t)/86400000);
}
function formatDue(s){
  const diff = daysFromToday(s);
  if(diff === null) return tr("noDueDate");
  if(diff < 0) return tr("overdue");
  if(diff === 0) return tr("dueToday");
  if(diff === 1) return tr("dueTomorrow");
  return new Intl.DateTimeFormat(state.language === "ar" ? "ar-AE" : "en-GB",{day:"numeric",month:"short"}).format(dateValue(s));
}
function profileName(id){
  const p = state.profiles.find(x => x.user_id === id);
  return p?.display_name || p?.email || tr("unassigned");
}
function profileFor(id){ return state.profiles.find(x => x.user_id === id); }

async function loadOwnProfile(){
  if(!state.user) return false;
  const { data, error } = await state.supabase
    .from("profiles")
    .select("*")
    .eq("user_id", state.user.id)
    .maybeSingle();
  if(error || !data){
    console.warn("Staff access denied or profile missing.", error?.message || "No profile");
    return false;
  }
  state.profile = data;
  return true;
}

async function loadProfiles(){
  const { data, error } = await state.supabase.from("profiles").select("*").order("display_name",{ascending:true});
  if(error){ console.error(error); return; }
  state.profiles = data || [];
  populateAssigneeOptions();
}
function populateAssigneeOptions(){
  const select = $("#task-assignee"); if(!select) return;
  const current = select.value;
  select.innerHTML = `<option value="">${escapeHtml(tr("unassigned"))}</option>` + state.profiles.map(p =>
    `<option value="${escapeHtml(p.user_id)}">${escapeHtml(p.display_name || p.email)}</option>`
  ).join("");
  if([...select.options].some(o=>o.value===current)) select.value=current;
}

async function loadTasks(){
  const { data, error } = await state.supabase
    .from("tasks")
    .select("*")
    .order("created_at",{ascending:false});
  if(error){ toast(error.message); console.error(error); return; }
  state.tasks = data || [];
  renderTasks();
}

function filteredTasks(){
  let tasks = state.tasks.slice();
  if(state.view === "mine") tasks = tasks.filter(t => t.assigned_to === state.user?.id || t.created_by === state.user?.id);
  if(state.priority !== "all") tasks = tasks.filter(t => t.priority === state.priority);
  if(state.search){
    const q=state.search.toLowerCase();
    tasks=tasks.filter(t => `${t.title} ${t.details||""} ${profileName(t.assigned_to)}`.toLowerCase().includes(q));
  }
  return tasks;
}

function renderStats(){
  const all=state.tasks;
  $("#stat-todo").textContent=all.filter(t=>t.status==="todo").length;
  $("#stat-progress").textContent=all.filter(t=>t.status==="progress").length;
  $("#stat-done").textContent=all.filter(t=>t.status==="done").length;
  $("#stat-due").textContent=all.filter(t=>t.status!=="done" && t.due_date && daysFromToday(t.due_date) >= 0 && daysFromToday(t.due_date) <= 3).length;
}
function escapeHtml(v=""){ return String(v).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch])); }
function taskCard(t){
  const p = profileFor(t.assigned_to);
  const dueDiff = daysFromToday(t.due_date);
  const overdue = dueDiff !== null && dueDiff < 0 && t.status !== "done";
  const name = p?.display_name || p?.email || tr("unassigned");
  return `
  <article class="task-card" draggable="true" tabindex="0" role="button" aria-label="Open task ${escapeHtml(t.title)}" data-task-id="${escapeHtml(t.id)}">
    <div class="task-top">
      <span class="priority-chip ${escapeHtml(t.priority)}">${escapeHtml(tr(t.priority))}</span>
      <button class="task-menu-btn" type="button" data-edit-task="${escapeHtml(t.id)}" aria-label="Edit task"><i class="ph ph-dots-three"></i></button>
    </div>
    <h3>${escapeHtml(t.title)}</h3>
    ${t.details ? `<p class="task-details-preview">${escapeHtml(t.details)}</p>` : ""}
    <div class="task-meta">
      <span class="${overdue?"overdue":""}"><i class="ph ph-calendar-blank"></i>${escapeHtml(formatDue(t.due_date))}</span>
      <span class="assignee-pill"><span class="mini-avatar">${escapeHtml(initials(name))}</span>${escapeHtml(name)}</span>
    </div>
  </article>`;
}
function renderTasks(){
  if(!$("#board")) return;
  renderStats();
  const tasks=filteredTasks();
  ["todo","progress","review","done"].forEach(status=>{
    const list=$(`#list-${status}`);
    const subset=tasks.filter(t=>t.status===status);
    list.innerHTML=subset.map(taskCard).join("");
    $(`#count-${status}`).textContent=subset.length;
  });
  $("#empty-state").hidden = tasks.length !== 0;
  bindTaskCards();
}
function bindTaskCards(){
  $$("[data-edit-task]").forEach(btn=>{
    btn.addEventListener("click",e=>{
      e.stopPropagation();
      openTaskModal(btn.dataset.editTask);
    });
  });

  $$(".task-card").forEach(card=>{
    let dragged = false;

    card.addEventListener("dragstart",e=>{
      dragged = true;
      card.classList.add("dragging");
      e.dataTransfer.setData("text/plain",card.dataset.taskId);
      e.dataTransfer.effectAllowed="move";
    });

    card.addEventListener("dragend",()=>{
      card.classList.remove("dragging");
      setTimeout(()=>{ dragged = false; },0);
    });

    // Makes task cards easy to open on mobile as well as desktop.
    card.addEventListener("click",e=>{
      if(dragged || e.target.closest("button")) return;
      openTaskModal(card.dataset.taskId);
    });

    card.addEventListener("keydown",e=>{
      if((e.key==="Enter" || e.key===" ") && !e.target.closest("button")){
        e.preventDefault();
        openTaskModal(card.dataset.taskId);
      }
    });
  });
}

function openTaskModal(taskId=null){
  const task = taskId ? state.tasks.find(t=>t.id===taskId) : null;
  $("#task-id").value = task?.id || "";
  $("#task-title").value = task?.title || "";
  $("#task-details").value = task?.details || "";
  $("#task-assignee").value = task?.assigned_to || state.user?.id || "";
  $("#task-due").value = task?.due_date || "";
  $("#task-priority").value = task?.priority || "medium";
  $("#task-status").value = task?.status || "todo";
  $("#task-modal-title").textContent = task ? task.title : tr("newTask");
  $("#delete-task-btn").hidden = !task;
  $("#task-message").textContent="";
  $("#task-modal").hidden=false;
  document.body.style.overflow="hidden";
  setTimeout(()=>$("#task-title").focus(),40);
}
function closeTaskModal(){ $("#task-modal").hidden=true; document.body.style.overflow=""; }
function openProfile(){
  $("#profile-name").value=state.profile?.display_name || cleanNameFromEmail(state.user?.email);
  $("#profile-role").value=state.profile?.job_title || "";
  $("#profile-message").textContent="";
  $("#profile-modal").hidden=false; document.body.style.overflow="hidden";
}
function closeProfile(){ $("#profile-modal").hidden=true; document.body.style.overflow=""; }

async function saveTask(e){
  e.preventDefault();
  const id=$("#task-id").value;
  const payload={
    title:$("#task-title").value.trim(),
    details:$("#task-details").value.trim() || null,
    assigned_to:$("#task-assignee").value || null,
    due_date:$("#task-due").value || null,
    priority:$("#task-priority").value,
    status:$("#task-status").value
  };
  if(!payload.title) return;
  $("#task-message").textContent=tr("loading");
  let result;
  if(id){
    result=await state.supabase.from("tasks").update(payload).eq("id",id);
  }else{
    result=await state.supabase.from("tasks").insert({...payload,created_by:state.user.id});
  }
  if(result.error){ $("#task-message").textContent=result.error.message; $("#task-message").className="form-message error"; return; }
  closeTaskModal(); await loadTasks(); toast(tr("taskSaved"));
}
async function deleteTask(){
  const id=$("#task-id").value; if(!id) return;
  if(!confirm(tr("deleteConfirm"))) return;
  const {error}=await state.supabase.from("tasks").delete().eq("id",id);
  if(error){ toast(error.message); return; }
  closeTaskModal(); await loadTasks(); toast(tr("taskDeleted"));
}
async function changeStatus(id,status){
  const {error}=await state.supabase.from("tasks").update({status}).eq("id",id);
  if(error){ toast(error.message); return; }
  const task=state.tasks.find(t=>t.id===id); if(task) task.status=status;
  renderTasks();
}
async function saveProfile(e){
  e.preventDefault();
  const payload={
    display_name:$("#profile-name").value.trim(),
    job_title:$("#profile-role").value.trim() || null
  };
  const {data,error}=await state.supabase.from("profiles").update(payload).eq("user_id",state.user.id).select().single();
  if(error){ $("#profile-message").textContent=error.message; $("#profile-message").className="form-message error"; return; }
  state.profile=data; await loadProfiles(); updateUserUI(); closeProfile(); toast(tr("profileSaved"));
}
function updateUserUI(){
  const name=state.profile?.display_name || cleanNameFromEmail(state.user?.email);
  $("#user-name").textContent=name; $("#user-email").textContent=state.user?.email || "";
  $("#greeting-name").textContent=name.split(" ")[0] || name;
  $("#user-avatar").textContent=initials(name).toUpperCase();
}

async function login(e){
  e.preventDefault();
  const email=$("#email").value.trim().toLowerCase();
  const msg=$("#auth-message");
  msg.className="form-message";
  if(!allowedEmail(email)){ msg.textContent=tr("invalidEmail"); msg.classList.add("error"); return; }
  msg.textContent=tr("loading");
  const redirectTo = `${location.origin}${config.STAFF_PATH || "/staff/"}`;
  const {error}=await state.supabase.auth.signInWithOtp({
    email,
    options:{ shouldCreateUser:false, emailRedirectTo:redirectTo }
  });
  if(error) console.warn("Auth request:", error.message);
  msg.textContent=tr("linkSent"); msg.classList.add("success");
}
async function subscribeRealtime(){
  if(state.realtime) await state.supabase.removeChannel(state.realtime);
  state.realtime = state.supabase
    .channel("nostrix-staff-tasks")
    .on("postgres_changes", {event:"*", schema:"public", table:"tasks"}, () => loadTasks())
    .subscribe();
}
async function signOut(){
  if(state.realtime){ await state.supabase.removeChannel(state.realtime); state.realtime=null; }
  await state.supabase.auth.signOut();
  state.user=null;state.profile=null;state.tasks=[];
  showOnly("auth-screen");
}

async function enterApp(session){
  state.user=session.user;
  const approved = await loadOwnProfile();
  if(!approved){
    await state.supabase.auth.signOut();
    state.user=null;
    showOnly("auth-screen");
    return;
  }
  showOnly("app-screen");
  await loadProfiles();
  updateUserUI();
  await loadTasks();
  await subscribeRealtime();
}
async function initAuth(){
  state.supabase=createClient(config.SUPABASE_URL,config.SUPABASE_PUBLISHABLE_KEY);
  const {data:{session}}=await state.supabase.auth.getSession();
  if(session?.user){
    if(!allowedEmail(session.user.email)){ await state.supabase.auth.signOut(); showOnly("auth-screen"); return; }
    await enterApp(session);
  }else showOnly("auth-screen");
  state.supabase.auth.onAuthStateChange(async(event,session)=>{
    if(event==="SIGNED_IN" && session?.user && allowedEmail(session.user.email)) await enterApp(session);
    if(event==="SIGNED_OUT") showOnly("auth-screen");
  });
}

function bindUI(){
  $$(".language-toggle").forEach(btn=>btn.addEventListener("click",toggleLanguage));
  $("#login-form")?.addEventListener("submit",login);
  $("#new-task-btn")?.addEventListener("click",()=>openTaskModal());
  $("#task-form")?.addEventListener("submit",saveTask);
  $("#delete-task-btn")?.addEventListener("click",deleteTask);
  $("#profile-form")?.addEventListener("submit",saveProfile);
  $("#signout-btn")?.addEventListener("click",signOut);
  $("#edit-profile-btn")?.addEventListener("click",()=>{ $("#profile-menu").hidden=true; openProfile(); });
  $("#refresh-btn")?.addEventListener("click",async()=>{ await Promise.all([loadProfiles(),loadTasks()]); toast(tr("refresh")); });
  $("#profile-btn")?.addEventListener("click",()=>{ const m=$("#profile-menu"); m.hidden=!m.hidden; $("#profile-btn").setAttribute("aria-expanded",String(!m.hidden)); });
  document.addEventListener("click",e=>{ if(!e.target.closest(".profile-button")&&!e.target.closest(".profile-menu")) $("#profile-menu") && ($("#profile-menu").hidden=true); });
  $$("[data-close-modal]").forEach(x=>x.addEventListener("click",closeTaskModal));
  $$("[data-close-profile]").forEach(x=>x.addEventListener("click",closeProfile));
  document.addEventListener("keydown",e=>{ if(e.key==="Escape"){ if(!$("#task-modal").hidden)closeTaskModal(); if(!$("#profile-modal").hidden)closeProfile(); } });
  $$(".view-tab").forEach(btn=>btn.addEventListener("click",()=>{
    state.view=btn.dataset.view; $$(".view-tab").forEach(b=>{b.classList.toggle("active",b===btn);b.setAttribute("aria-selected",String(b===btn));});renderTasks();
  }));
  $("#task-search")?.addEventListener("input",e=>{state.search=e.target.value.trim();renderTasks();});
  $("#priority-filter")?.addEventListener("change",e=>{state.priority=e.target.value;renderTasks();});
  $$(".board-column").forEach(col=>{
    col.addEventListener("dragover",e=>{e.preventDefault();col.classList.add("drag-over");});
    col.addEventListener("dragleave",()=>col.classList.remove("drag-over"));
    col.addEventListener("drop",e=>{e.preventDefault();col.classList.remove("drag-over");const id=e.dataTransfer.getData("text/plain");if(id)changeStatus(id,col.dataset.status);});
  });
  window.addEventListener("focus",()=>{ if(state.user) loadTasks(); });
}

document.addEventListener("DOMContentLoaded",async()=>{
  $("#year").textContent=new Date().getFullYear();
  bindUI(); applyLanguage();
  if(!configured){ showOnly("setup-screen"); return; }
  await initAuth();
});
