/* Nostrix Website control area. All records, identities and mutations use the async data adapter. */
(() => {
  "use strict";
  const api = window.NostrixWebsite;
  const app = document.querySelector("#app");
  const html = document.documentElement;
  const T = {
    notes:["Notes","الملاحظات"],portfolio:["Portfolio","معرض الأعمال"],globeTitle:["Visitor map","خريطة الزوّار"],
    liveDemo:["{n} on the site now","{n} على الموقع الآن"],worldView:["World view","عرض العالم"],globeHelp:["Visitor map. Drag or use the arrow keys to move. Use plus and minus to zoom.","خريطة الزوّار. اسحب أو استخدم الأسهم للتحريك، وزرّي الزائد والناقص للتكبير والتصغير."],
    zoomIn:["Zoom in","تكبير"],zoomOut:["Zoom out","تصغير"],countryTitle:["Visits by country","الزيارات حسب الدولة"],
    latestVisit:["Latest visit","أحدث زيارة"],dragHelp:["Drag to move · Scroll or use + and − to zoom · Select a country to zoom in","اسحب للتحريك · استخدم العجلة أو + و − للتكبير · اختر دولة لتكبيرها"],
    sampleVisit:["Simulate visit","محاكاة زيارة"],noVisits:["No visits in this period.","لا توجد زيارات خلال هذه الفترة."],
    opens:["visits","زيارة"],lastMinutes:["Last {n} days","آخر {n} أيام"],mapError:["Map image unavailable","تعذّر تحميل صورة الخريطة"],
    writeNote:["Write a note","ملاحظة جديدة"],websiteStaff:["Website staff only","لفريق الموقع فقط"],notePrompt:["Leave a note for Website staff…","اكتب ملاحظة لفريق الموقع…"],
    postNote:["Post note","نشر الملاحظة"],sharedNotes:["Staff notes","ملاحظات الفريق"],searchNotes:["Search notes","ابحث في الملاحظات"],noNotes:["No notes yet.","لا توجد ملاحظات بعد."],
    noNoteMatches:["No matching notes.","لا توجد ملاحظات مطابقة."],noteSaved:["Note posted.","تم نشر الملاحظة."],invalidNote:["Enter a note of up to 2,000 characters.","اكتب ملاحظة بحد أقصى ٢٠٠٠ حرف."],
    photo:["Portfolio photo","صورة من المعرض"],addPhotos:["Add photos","إضافة صور"],choosePhotos:["Choose photos","اختيار صور"],dropPhotos:["Drop photos here","اسحب الصور إلى هنا"],
    category:["Category","الفئة"],caption:["Caption (optional)","وصف الصورة (اختياري)"],noCaption:["No caption","بلا وصف"],photoPreview:["Photo preview","معاينة الصورة"],
    publishPhotos:["Upload photos","رفع الصور"],gallery:["Gallery","الصور"],edit:["Edit","تعديل"],editPhoto:["Edit photo","تعديل الصورة"],deletePhoto:["Delete photo","حذف الصورة"],
    deletePhotoConfirm:["Delete this photo?","هل تريد حذف هذه الصورة؟"],save:["Save","حفظ"],earlier:["Move earlier","تحريك إلى الأمام"],later:["Move later","تحريك إلى الخلف"],
    noPhotos:["No photos in this category.","لا توجد صور في هذه الفئة."],live:["Live","منشور"],publishing:["Publishing, this can take 1–2 minutes","جارٍ النشر، قد يستغرق ذلك من دقيقة إلى دقيقتين"],
    publishFailed:["Failed, try again","تعذّر النشر، حاول مرة أخرى"],progress:["Publishing progress","تقدّم النشر"],publishingBusy:["Wait for the current publish to finish.","انتظر حتى يكتمل النشر الحالي."],
    badPhoto:["Choose a JPEG, PNG, WebP, GIF or AVIF image that your browser can preview.","اختر صورة بصيغة JPEG أو PNG أو WebP أو GIF أو AVIF يمكن لمتصفحك عرضها."],
    loading:["Loading…","جارٍ التحميل…"],noData:["No data yet.","لا توجد بيانات بعد."],

    website:["Website","الموقع"],overview:["Overview","نظرة عامة"],visitors:["Visitors","الزوّار"],clicks:["Clicks","النقرات"],
    enquiries:["Enquiries","الاستفسارات"],reviews:["Reviews","التقييمات"],access:["Accounts","الحسابات"],
    management:["Management","الإدارة"],staff:["Staff workspace","مساحة عمل الفريق"],viewSite:["View website","عرض الموقع"],
    overviewTitle:["Website overview","نظرة عامة على الموقع"],sample:["Sample data","بيانات تجريبية"],staffMember:["Staff member","عضو الفريق"],
    today:["Visitors today","زوّار اليوم"],week:["This week","زوّار هذا الأسبوع"],month:["This month","زوّار هذا الشهر"],
    totalEnquiries:["Total enquiries","إجمالي الاستفسارات"],pendingReviews:["Reviews","التقييمات"],
    yesterday:["vs yesterday","مقارنة بالأمس"],lastWeek:["vs last week","عن الأسبوع الماضي"],lastMonth:["vs last month","عن الشهر الماضي"],
    unhandled:["Unanswered","بانتظار الرد"],toHandle:["to handle","بانتظار الرد"],awaiting:["in the last 30 days","خلال آخر ٣٠ يوماً"],
    activity:["Visitor activity","حركة الزوّار"],sources:["Traffic sources","مصادر الزيارات"],devices:["Device types","أنواع الأجهزة"],
    current:["Current period","الفترة الحالية"],previous:["Previous period","الفترة السابقة"],last7:["Last 7 days","آخر ٧ أيام"],last30:["Last 30 days","آخر ٣٠ يوماً"],
    instagram:["Instagram","إنستغرام"],google:["Google","جوجل"],direct:["Direct","زيارات مباشرة"],tiktok:["TikTok","تيك توك"],
    mobile:["Mobile","جوّال"],desktop:["Desktop","كمبيوتر"],tablet:["Tablet","جهاز لوحي"],
    recent:["Recent enquiries","أحدث الاستفسارات"],viewAll:["View all","عرض الكل"],name:["Name","الاسم"],contact:["Contact","بيانات التواصل"],
    package:["Package","الباقة"],date:["Date","التاريخ"],status:["Status","الحالة"],message:["Message","الرسالة"],
    handled:["Handled","تمت المعالجة"],open:["New","جديد"],all:["All statuses","كل الحالات"],newOnly:["Unhandled","لم يُعالج"],
    search:["Search enquiries","ابحث في الاستفسارات"],noMatches:["No matching enquiries.","لا توجد استفسارات مطابقة."],
    pending:["Pending","قيد المراجعة"],approved:["Approved","معتمدة"],rejected:["Rejected","مرفوضة"],approve:["Approve","اعتماد"],reject:["Reject","رفض"],
    publicHint:["Reviews appear on the website as soon as clients send them. Remove only spam.","تظهر التقييمات على الموقع فور إرسالها. احذف الرسائل المزعجة فقط."],
    noReviews:["No reviews in this list.","لا توجد تقييمات في هذه القائمة."],stars:["out of 5 stars","من ٥ نجوم"],
    topPages:["Top pages","الصفحات الأكثر زيارة"],page:["Page","الصفحة"],visits:["Visits","الزيارات"],share:["Share","النسبة"],
    range:["Date range","الفترة الزمنية"],custom:["Custom range","فترة محدّدة"],from:["From","من"],to:["To","إلى"],apply:["Apply","تطبيق"],
    invalidRange:["Choose a past or current range of 1–366 days.","اختر فترة من يوم إلى ٣٦٦ يوماً تنتهي اليوم أو قبله."],
    packageClicks:["Pricing package clicks","النقرات على باقات الأسعار"],actionClicks:["Contact and estimate clicks","نقرات التواصل وتقدير التكلفة"],
    whatsapp:["WhatsApp","واتساب"],call:["Call","اتصال"],email:["Email","البريد الإلكتروني"],estimate:["Estimate builder","حاسبة التكلفة"],
    allowed:["Website access","صلاحية دخول الموقع"],signinHistory:["Sign-in history","سجل الدخول"],who:["Account","الحساب"],when:["Signed in","وقت الدخول"],
    add:["Add access","منح صلاحية"],remove:["Remove","إزالة"],emailAddress:["Email address","البريد الإلكتروني"],
    badEmail:["Enter a valid email address.","أدخل بريداً إلكترونياً صحيحاً."],duplicateEmail:["This email already has access.","لهذا البريد صلاحية دخول بالفعل."],
    accessAdded:["Website access added.","تم منح صلاحية الدخول."],accessRemoved:["Website access removed.","تمت إزالة صلاحية الدخول."],
    updated:["Changes saved.","تم حفظ التغييرات."],reviewApproved:["Review approved.","تم اعتماد التقييم."],reviewRejected:["Review rejected.","تم رفض التقييم."],
    noAccess:["No access","لا تملك صلاحية الدخول"],deniedText:["Your account does not have access to the Website section.","حسابك غير مخوّل بدخول قسم الموقع."],
    signIn:["Sign in","تسجيل الدخول"],signOut:["Sign out","تسجيل الخروج"],switchAccount:["Switch account","تبديل الحساب"],
    identity:["Email or username","البريد الإلكتروني أو اسم المستخدم"],password:["Password","كلمة المرور"],
    showPassword:["Show password","إظهار كلمة المرور"],hidePassword:["Hide password","إخفاء كلمة المرور"],
    requiredIdentity:["Enter your email or username.","أدخل بريدك الإلكتروني أو اسم المستخدم."],requiredPassword:["Enter your password.","أدخل كلمة المرور."],
    badIdentity:["Enter a valid email or username.","أدخل بريداً إلكترونياً أو اسم مستخدم صحيحاً."],
    demoHint:["Demo account","الحساب التجريبي"],demoPassword:["Use any sample password.","أدخل أي كلمة مرور تجريبية."],
    menu:["Open menu","فتح القائمة"],close:["Close","إغلاق"],profile:["Account menu","قائمة الحساب"],dark:["Switch to dark mode","تفعيل المظهر الداكن"],
    light:["Switch to light mode","تفعيل المظهر الفاتح"],language:["العربية","English"],skip:["Skip to content","انتقل إلى المحتوى"],
    unavailable:["Unable to load this view.","تعذّر تحميل هذه الصفحة."],retry:["Try again","إعادة المحاولة"],
    removeConfirm:["Remove Website access for","إزالة صلاحية دخول الموقع عن"],cancel:["Cancel","إلغاء"],
    people:["People with access","الحسابات المصرّح لها"],reviewList:["Review status","حالة التقييم"],
    total:["Total","الإجمالي"],toggleHandled:["Mark as handled","تمييز كمعالَج"],toggleOpen:["Mark as unhandled","إعادة فتح الاستفسار"],
    badLogin:["The email or password is incorrect.","البريد الإلكتروني أو كلمة المرور غير صحيحة."],tooMany:["Too many attempts. Wait 15 minutes and try again.","محاولات كثيرة. انتظر ١٥ دقيقة ثم حاول مرة أخرى."],
    signedOut:["Sign in to continue.","سجّل الدخول للمتابعة."],notConfigured:["The database is not connected yet.","قاعدة البيانات غير متصلة بعد."],
    removeReview:["Remove","حذف"],removeReviewConfirm:["Remove this review from the website?","هل تريد حذف هذا التقييم من الموقع؟"],reviewRemoved:["Review removed.","تم حذف التقييم."],
    privateFeedback:["Private feedback","ملاحظات خاصة"],likedLabel:["Liked","ما أعجبه"],improveLabel:["Could improve","ما يمكن تحسينه"],service:["Service","الخدمة"],
    accountsHelp:["Only admins see this page. Passwords are stored encrypted: nobody, including admins, can read them.","هذه الصفحة للمسؤولين فقط. تُحفظ كلمات المرور مشفّرة ولا يمكن لأحد قراءتها، حتى المسؤولين."],
    newAccount:["New accounts · one email, or several separated by commas","حسابات جديدة · بريد واحد أو عدة عناوين مفصولة بفواصل"],displayName:["Name","الاسم"],newPassword:["Password (8+ characters)","كلمة المرور (٨ أحرف على الأقل)"],
    adminRole:["Admin","مسؤول"],websiteRole:["Website section","قسم الموقع"],teamRole:["Team only","الفريق فقط"],createAccount:["Create account","إنشاء الحساب"],
    setPassword:["Set password","تعيين كلمة المرور"],deleteAccount:["Delete","حذف"],accountCreated:["Account created.","تم إنشاء الحساب."],
    accountDeleted:["Account deleted.","تم حذف الحساب."],passwordSet:["Password updated.","تم تحديث كلمة المرور."],
    weakPassword:["Use a password of at least 8 characters.","استخدم كلمة مرور من ٨ أحرف على الأقل."],lastAdmin:["Keep at least one admin.","يجب الإبقاء على مسؤول واحد على الأقل."],
    notSelf:["You cannot delete your own account.","لا يمكنك حذف حسابك."],adminOnly:["Admins only.","للمسؤولين فقط."],you:["You","أنت"],
    deleteAccountConfirm:["Delete this account? The person can no longer sign in.","هل تريد حذف هذا الحساب؟ لن يتمكن صاحبه من تسجيل الدخول."],
    lastSeen:["Last sign-in","آخر دخول"],never:["Never","لم يسجّل الدخول"],failed:["Failed","فشل"],
    published:["Live on website","منشورة على الموقع"],hiddenPhoto:["Hidden · waiting for approval","مخفية · بانتظار الاعتماد"],approvePhoto:["Approve & publish","اعتماد ونشر"],
    hidePhoto:["Hide from website","إخفاء من الموقع"],featured:["Featured","مختارة"],featureOn:["Show in Featured","إظهار في المختارة"],featureOff:["Remove from Featured","إزالة من المختارة"],
    uploadsHidden:["New photos stay hidden until you approve them.","تبقى الصور الجديدة مخفية حتى تعتمدها."],photosUploaded:["Photos uploaded. Approve them to show them on the website.","تم رفع الصور. اعتمدها لإظهارها على الموقع."],
    videoItem:["Video","فيديو"],deleteNote:["Delete","حذف"],pinNote:["Pin","تثبيت"],unpinNote:["Unpin","إلغاء التثبيت"],pinned:["Pinned","مثبّتة"],
    other:["Other","أخرى"]
  };
  const sections = ["overview","visitors","clicks","enquiries","reviews","access","portfolio","notes"];
  const state = {overviewDays:7, visitorDays:"7", visitorRange:null, reviewTab:"pending", search:"", enquiryFilter:"all"};
  let session, revision=0, chartStats, allEnquiries=[], noticeTimer, removeTarget=null, focusNextPage=false;
  const ar = () => html.lang === "ar";
  const locale = () => ar() ? "ar-AE-u-nu-arab" : "en-GB";
  const pick = values => values[ar()?1:0];
  const t = key => pick(T[key]);
  const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const num = (value, digits=0) => new Intl.NumberFormat(locale(),{maximumFractionDigits:digits}).format(value);
  const percent = (value,digits=0) => new Intl.NumberFormat(locale(),{style:"percent",maximumFractionDigits:digits}).format(value/100);
  const date = (iso,options={day:"numeric",month:"short"}) => new Intl.DateTimeFormat(locale(),{timeZone:"Asia/Dubai",...options}).format(new Date(iso.length===10 ? iso+"T12:00:00Z" : iso));
  const offsetDate = (iso,count) => new Date(Date.parse(iso+"T00:00:00Z")+count*86400000).toISOString().slice(0,10);
  const ic = (key,cls="") => `<svg aria-hidden="true" class="ic ${cls}"><use href="#ic-${key}"></use></svg>`;
  const brand = () => '<span class="brand" translate="no"><svg class="brand-mark" viewBox="0 0 34 15" aria-hidden="true"><use href="#i-logo"></use></svg><span class="brand-name">NOSTRIX</span></span>';
  const label = value => `aria-label="${esc(value)}" title="${esc(value)}"`;
  const sample = () => `<span class="sample"><i class="dot"></i>${t("sample")}</span>`;
  const personName = row => esc(pick(row.name));
  const avatar = (row,profile=false) => {
    const initials=pick(row.name).trim().split(/\s+/).slice(0,2).map(s=>Array.from(s)[0]).join(ar()?" ":"");
    return `<span aria-hidden="true" class="avatar ${profile?"profile":"c"+row.color}">${esc(initials)}</span>`;
  };
  const person = row => `<span class="person">${avatar(row)}<span>${personName(row)}</span></span>`;
  const status = handled => `<span class="status ${handled?"handled":""}">${t(handled?"handled":"open")}</span>`;
  function route() {
    const hash=location.hash.slice(1);
    return sections.includes(hash)||hash==="login"||hash==="no-access" ? hash : "overview";
  }
  function savePref(key,value) { try { localStorage.setItem(key,value); } catch { /* Session-only preference. */ } }
  function toast(message) {
    clearTimeout(noticeTimer);
    document.querySelector("#toast").textContent=message;
    noticeTimer=setTimeout(()=>document.querySelector("#toast").textContent="",2800);
  }
  function topTools() {
    return `<button class="icon-btn lang-btn" type="button" data-action="lang" ${label(t("language"))}>${ar()?"EN":"ع"}</button>
    <button class="icon-btn" type="button" data-action="theme" ${label(t(html.dataset.theme==="dark"?"light":"dark"))}>${ic(html.dataset.theme==="dark"?"sun":"moon")}</button>`;
  }
  function navLink(key,page,badge) {
    return `<a class="nav-item ${key===page?"active":""}" href="#${key}" ${key===page?'aria-current="page"':""}>${ic(key)}<span>${t(key)}</span>${badge ? `<span class="counter ${key==="reviews"?"pending":""}">${num(badge)}</span>`:""}</a>`;
  }
  function shell(page,pending,body) {
    return `<div class="shell">
      <div class="scrim" data-action="close-nav" hidden></div>
      <aside class="sidebar" id="section-menu" aria-label="${t("website")}">
        <div class="side-brand">${brand()}<button type="button" class="mobile-close icon-btn" data-action="close-nav" ${label(t("close"))}>${ic("close")}</button></div>
        ${workspaceLinks.staff ? `<a class="workspace-return" href="${esc(workspaceLinks.staff)}">${ic("back","directional")}${t("staff")}</a>` : `<div class="workspace-return">${ic("panel")}${t("staff")}</div>`}
        <div class="nav-label">${t("website")}</div>
        <nav class="side-nav" aria-label="${t("website")}">${sections.slice(0,5).map(key=>navLink(key,page,key==="reviews"?pending:0)).join("")}</nav>
        <div class="nav-label management">${t("management")}</div>
        <nav class="side-nav" aria-label="${t("management")}">${["portfolio","notes",...(session.is_admin?["access"]:[])].map(k=>navLink(k,page,0)).join("")}</nav>
        <div class="side-foot"><div class="account-wrap">
          <div class="account-menu" id="account-menu" hidden><small><bdi>${esc(session.email)}</bdi></small><button type="button" data-action="signout">${ic("return","directional")}${t("signOut")}</button></div>
          <button type="button" class="account" data-action="profile" aria-expanded="false" aria-controls="account-menu" ${label(t("profile"))}>${avatar(session,true)}<span class="account-text"><b>${personName(session)}</b><small><bdi>${esc(session.email)}</bdi></small></span>${ic("switch")}</button>
        </div></div>
      </aside>
      <div class="topbar"><div class="crumbs"><button type="button" class="mobile-toggle icon-btn" data-action="open-nav" aria-expanded="false" aria-controls="section-menu" ${label(t("menu"))}>${ic("panel")}</button>${ic("globe")}<span>${t("website")}</span><span class="sep">/</span><strong>${t(page)}</strong></div>
        <div class="top-tools">${workspaceLinks.website?`<a class="quiet-btn site-link" href="${esc(workspaceLinks.website)}" target="_blank" rel="noopener">${t("viewSite")}${ic("external")}</a><span class="divider"></span>`:""}${topTools()}</div>
      </div><main class="page" id="content" tabindex="-1"><div class="page-body">${body}</div></main>
    </div>`;
  }
  function authPage(denied,demo) {
    const authForm=`<form id="login-form" class="auth-form" novalidate>
      <label>${t("identity")}<input name="identity" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" required aria-describedby="identity-error"></label><span id="identity-error" class="error-text" hidden></span>
      <label>${t("password")}<span class="password-field"><input name="password" type="password" autocomplete="current-password" required aria-describedby="password-error"><button type="button" class="icon-btn" data-action="password" ${label(t("showPassword"))}>${ic("eye")}</button></span></label><span id="password-error" class="error-text" hidden></span>
      <button type="submit" class="btn primary">${t("signIn")}${ic("arrow","directional")}</button></form>
      `;
    return `<main class="auth-layout" id="content" tabindex="-1"><section class="auth-box">${brand()}<div class="hero-site">${ic("lock")}${t("website")}</div><h1>${t(denied?"noAccess":"signIn")}</h1>
      ${denied?`<p>${t("deniedText")}</p><div class="auth-form"><button class="btn primary" data-action="signout">${t("switchAccount")}</button>${workspaceLinks.staff?`<a class="btn" href="${esc(workspaceLinks.staff)}">${t("staff")}</a>`:""}</div>`:authForm}
      <div class="auth-tools"><span></span><div>${topTools()}</div></div></section></main>`;
  }
  // A folded, ruled surface made of two families of curves. It scales without bitmap assets.
  function ribbon() {
    const project=(u,v)=>{
      const x= -45+u*692+v*(38+13*Math.sin(u*6));
      const bell=Math.sin(Math.PI*u);
      const y=196-128*u-68*Math.sin(u*7.2-1.4)+v*(32+36*Math.cos(u*7.1-1.35))-27*bell*Math.cos(v*2.1+u*3.8);
      return [x,y].map(n=>n.toFixed(1)).join(",");
    };
    const curve=(n,fn)=>Array.from({length:n+1},(_,i)=>(i?"L":"M")+fn(i/n)).join(" ");
    const edges=curve(90,x=>project(x,-1))+" "+curve(90,x=>project(1-x,1)).replace("M","L")+"Z";
    let lines="";
    for(let j=0;j<=32;j++) lines+='<path d="'+curve(80,x=>project(x,j/16-1))+'"/>';
    for(let j=0;j<=96;j++) lines+='<path d="'+curve(20,y=>project(j/96,y*2-1))+'"/>';
    return `<div class="hero-art" aria-hidden="true"><svg viewBox="0 0 650 180" preserveAspectRatio="none"><defs><linearGradient id="ribbon-fill" x1="0" x2=".9" y1="1" y2="0"><stop stop-color="#dac5f1"/><stop offset=".37" stop-color="#d7bbf2"/><stop offset=".7" stop-color="#c5b6ec"/><stop offset="1" stop-color="#c6d1f7"/></linearGradient></defs><path d="${edges}" fill="url(#ribbon-fill)" opacity=".85"/><g fill="none" stroke="#72608c" stroke-width=".68" opacity=".63">${lines}</g></svg></div>`;
  }
  const heroArt=ribbon();
  function overviewHero(stats) {
    return `<header class="hero">${heroArt}<div class="hero-site">${ic("globe")}<span>${t("website")}</span></div><h1>${t("overviewTitle")}</h1>
    <div class="hero-date">${ic("calendar")}<time datetime="${stats.today}">${date(stats.today,{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</time></div></header>`;
  }
  function metric(key,value,icon,tone,foot,destination) {
    return `<a class="stat ${tone}" href="#${destination}"><div class="stat-head"><span class="stat-icon">${ic(icon)}</span>${t(key)}</div><strong>${num(value)}</strong><div class="stat-foot">${foot}</div></a>`;
  }
  function change(item,baseline) {
    return `<span class="change ${item.change<0?"negative":""}">${ic("trend")}<bdi>${item.change>0?"+":""}${percent(item.change,1)}</bdi></span><span class="baseline">${t(baseline)}</span>`;
  }
  function picker(id,key,options,value) {
    return `<label class="picker"><select id="${id}" aria-label="${t(key)}">${options.map(([v,k])=>`<option value="${v}" ${String(value)===String(v)?"selected":""}>${t(k)}</option>`).join("")}</select>${ic("down")}</label>`;
  }
  function sectionHead(key,note="") {
    return `<header class="section-head"><div><h1>${t(key)}</h1>${note?`<p class="subhead">${note}</p>`:""}</div></header>`;
  }
  const seriesPath = points => points.reduce((path,[x,y],i)=>{
    if (!i) return "M"+x+","+y;
    const [prevX,prevY]=points[i-1],mid=(x+prevX)/2;
    return path+" C"+mid+","+prevY+" "+mid+","+y+" "+x+","+y;
  },"");
  function chart(stats,overview=false) {
    const {series}=stats;
    if(!stats.count)return `<article class="card card-pad"><h2>${t("activity")}</h2><p class="empty">${t("noData")}</p></article>`;
    const maxValue=Math.max(1,...series.flatMap(p=>[p.count,p.previous]));
    const step=Math.max(1,Math.ceil(maxValue/4/25)*25),ceiling=step*4;
    const w=720,h=160;
    const x=i=>series.length===1?w/2:2+i*(w-4)/(series.length-1);
    const pts=field=>series.map((d,i)=>[+x(i).toFixed(2),+(h-2-d[field]/ceiling*(h-4)).toFixed(2)]);
    const points=pts("count"), current=seriesPath(points), prev=seriesPath(pts("previous"));
    const indices=new Set(Array.from({length:Math.min(7,series.length)},(_,i)=>Math.round(i*(series.length-1)/(Math.min(7,series.length)-1||1))));
    const labels=series.flatMap((d,i)=>indices.has(i)?[`<span>${date(d.date,series.length===7?{weekday:"short"}:{month:"short",day:"numeric"})}</span>`]:[]).join("");
    const hitTargets=series.map((d,i)=>`<button type="button" tabindex="${i===0?0:-1}" data-point="${i}" aria-label="${date(d.date)} · ${num(d.count)} ${t("visitors")}"></button>`).join("");
    return `<article class="card card-pad chart-card"><header class="card-head"><h2>${t("activity")}</h2>${overview?picker("overview-days","range",[[7,"last7"],[30,"last30"]],state.overviewDays):`<span class="meta">${num(stats.count)} ${t("visits")}</span>`}</header>
      <div class="legend"><span><i></i>${t("current")}</span><span><i class="previous"></i>${t("previous")}</span></div>
      <div class="chart-layout"><div class="y-axis">${[4,3,2,1,0].map(v=>`<span>${num(step*v)}</span>`).join("")}</div>
        <div class="chart-field"><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="${t("activity")}, ${date(stats.from)} – ${date(stats.to)}"><defs><linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".25"/><stop offset="1" stop-color="var(--accent)" stop-opacity=".015"/></linearGradient></defs>
        ${[0,1,2,3,4].map(i=>`<line class="gridline" x1="0" x2="${w}" y1="${i*h/4}" y2="${i*h/4}"/>`).join("")}
        <path d="${current} L${points.at(-1)[0]},${h} L${points[0][0]},${h}Z" fill="url(#area-fill)"/><path class="prev" d="${prev}"/><path class="line" d="${current}"/>
        ${series.length<=7?points.map(([cx,cy])=>`<circle class="point" cx="${cx}" cy="${cy}" r="3.3"/>`).join(""):""}</svg>
        <div class="chart-targets">${hitTargets}</div><div class="chart-tip" hidden></div></div><div class="x-axis">${labels}</div></div></article>`;
  }
  const colors=["#cab0eb","#adbbe5","#b8a1ce","#9aa6be"];
  function bars(rows,key,link=false) {
    return `<article class="card card-pad"><header class="card-head"><h2>${t(key)}</h2>${link?`<a class="mark" href="#visitors" ${label(t("visitors"))}>${ic("arrow","directional")}</a>`:""}</header>
    <div class="sources">${rows.map((r,i)=>`<div><div class="source-name"><span class="bar-name">${ic(r.id)}${t(r.id)}</span><b>${percent(r.percent)}</b></div><div class="track"><i style="width:${r.percent}%;background:${colors[i]}"></i></div></div>`).join("")}</div></article>`;
  }
  function recentTable(rows) {
    return `<article class="card"><header class="card-head table-heading"><h2>${t("recent")}</h2><a class="view-link" href="#enquiries">${t("viewAll")}${ic("arrow","directional")}</a></header><div class="table-wrap"><table class="recent-table">
    <thead><tr><th>${t("name")}</th><th class="package-col">${t("package")}</th><th>${t("date")}</th><th>${t("status")}</th></tr></thead>
    <tbody>${!rows.length?`<tr><td class="empty" colspan="4">${t("noMatches")}</td></tr>`:""}${rows.slice(0,4).map(row=>`<tr><td>${person(row)}</td><td class="package-col">${esc(pick(row.package))}</td><td class="date-cell">${date(row.date)}</td><td>${status(row.handled)}</td></tr>`).join("")}</tbody></table></div></article>`;
  }
  async function analytics(days,range) {
    if (range) return api.getVisitorStats(range);
    const defaults=await api.getVisitorStats();
    if (Number(days)===7) return defaults;
    return api.getVisitorStats({from:offsetDate(defaults.today,1-Number(days)),to:defaults.today});
  }
  async function overview(reviews) {
    const [s,enquiries]=await Promise.all([analytics(state.overviewDays),api.getEnquiries()]);
    chartStats=s;
    return overviewHero(s)+`<div class="stats">
      ${metric("today",s.totals.today.value,"today","",change(s.totals.today,"yesterday"),"visitors")}
      ${metric("week",s.totals.week.value,"calendar","tone-blue",change(s.totals.week,"lastWeek"),"visitors")}
      ${metric("month",s.totals.month.value,"month","tone-rose",change(s.totals.month,"lastMonth"),"visitors")}
      ${metric("totalEnquiries",enquiries.length,"enquiries","tone-green",'<span class="tiny-dot new"></span>'+num(enquiries.filter(e=>!e.handled).length)+" "+t("toHandle"),"enquiries")}
      ${metric("pendingReviews",reviews.length,"reviews","tone-amber",'<span class="tiny-dot waiting"></span>'+num(reviews.filter(r=>Date.now()-Date.parse(r.date)<30*864e5).length)+" "+t("awaiting"),"reviews")}
      </div>${globeCard()}<div class="dashboard-grid">${chart(s,true)}${bars(s.traffic,"sources",true)}</div>${recentTable(enquiries)}`;
  }
  async function visitors() {
    const s=await analytics(state.visitorDays==="custom"?7:state.visitorDays,state.visitorRange);
    chartStats=s;
    const ranges=picker("visitor-days","range",[[7,"last7"],[30,"last30"],["custom","custom"]],state.visitorDays);
    return sectionHead("visitors")+globeCard()+`<form id="range-form" class="range-form tools">${ranges}
    <label class="field">${t("from")}<input name="from" type="date" value="${s.from}" max="${s.today}" required></label>
    <label class="field">${t("to")}<input name="to" type="date" value="${s.to}" max="${s.today}" required></label>
    <button class="btn" type="submit">${t("apply")}</button><span class="error-text" role="alert" id="range-error"></span></form>
    ${chart(s)}<div class="dashboard-grid">${bars(s.traffic,"sources")}${bars(s.devices,"devices")}</div>
    <article class="card"><header class="table-heading"><h2>${t("topPages")}</h2></header><table><thead><tr><th>${t("page")}</th><th>${t("visits")}</th><th>${t("share")}</th></tr></thead><tbody>${s.pages.map(p=>`<tr><td><bdi>${esc(p.id)}</bdi></td><td>${num(p.count)}</td><td>${percent(p.percent)}</td></tr>`).join("")}</tbody></table></article>`;
  }
  async function clicks() {
    const data=await api.getPricingClicks(), max=Math.max(...data.packages.map(p=>p.count),1);
    return sectionHead("clicks",date(data.from)+" – "+date(data.to,{day:"numeric",month:"long",year:"numeric"}))+
      `<div class="actions-grid">${data.actions.map((a,i)=>`<article class="stat ${["tone-green","tone-blue","tone-rose","","tone-amber","tone-blue"][i%6]}"><div class="stat-head"><span class="stat-icon">${ic(a.id==="email"?"enquiries":a.id)}</span>${t(a.id)}</div><strong>${num(a.count)}</strong></article>`).join("")}</div>
      <article class="card card-pad"><header class="card-head"><h2>${t("packageClicks")}</h2>${ic("clicks")}</header><div class="distribution sales-bars">${!data.packages.length?`<p class="empty">${t("noData")}</p>`:""}${data.packages.map((p,i)=>`<div><div class="source-name"><span>${esc(pick(p.name))}</span><b>${num(p.count)}</b></div><div class="track"><i style="width:${p.count/max*100}%;background:${colors[i%4]}"></i></div></div>`).join("")}</div></article>`;
  }
  function enquiryRows() {
    const query=state.search.trim().toLocaleLowerCase();
    const items=allEnquiries.filter(row=>{
      const matches=[...row.name,row.contact,...row.package,...row.message,row.date].join(" ").toLocaleLowerCase().includes(query);
      return matches && (state.enquiryFilter==="all" || row.handled===(state.enquiryFilter==="handled"));
    });
    return items.length?items.map(r=>`<tr><td>${person(r)}</td><td><bdi>${esc(r.contact)}</bdi></td><td data-label="${t("package")}">${esc(pick(r.package))}</td><td class="details">${esc(pick(r.message))}</td><td data-label="${t("date")}" class="date-cell">${date(r.date)}</td>
    <td><button type="button" class="switch" role="switch" data-handled="${esc(r.id)}" aria-checked="${r.handled}" ${label(t(r.handled?"toggleOpen":"toggleHandled")+" · "+pick(r.name))}><span class="switch-track"></span>${t(r.handled?"handled":"open")}</button></td></tr>`).join(""):`<tr><td colspan="6" class="empty">${t("noMatches")}</td></tr>`;
  }
  async function enquiryPage() {
    allEnquiries=await api.getEnquiries();
    return sectionHead("enquiries")+`<div class="tools"><label class="search-box">${ic("search")}<input id="enquiry-search" type="search" value="${esc(state.search)}" ${label(t("search"))} placeholder="${t("search")}"></label>
    ${picker("enquiry-filter","status",[["all","all"],["unhandled","newOnly"],["handled","handled"]],state.enquiryFilter)}</div>
    <div class="card table-wrap"><table class="enquiry-table"><thead><tr>${["name","contact","package","message","date","status"].map(k=>`<th>${t(k)}</th>`).join("")}</tr></thead><tbody id="enquiry-rows">${enquiryRows()}</tbody></table></div>`;
  }
  function reviewPage(rows) {
    const cards=rows.map(r=>`<article class="review-item"><header>${person(r)}<time datetime="${r.date}">${date(r.date,{day:"numeric",month:"short",year:"numeric"})}</time></header><span class="stars" role="img" aria-label="${num(r.stars)} ${t("stars")}" dir="ltr">${"★".repeat(r.stars)}${"☆".repeat(5-r.stars)}</span>
    <p dir="auto">${esc(pick(r.text))}</p>${r.service?`<p class="meta">${t("service")}: ${esc(r.service)}</p>`:""}
    ${r.liked||r.improve||r.email?`<details class="private-feedback"><summary>${ic("lock")}${t("privateFeedback")}</summary>${r.email?`<p><bdi>${esc(r.email)}</bdi>${r.instagram?` · <bdi>@${esc(r.instagram)}</bdi>`:""}</p>`:""}${r.liked?`<p><b>${t("likedLabel")}:</b> <span dir="auto">${esc(r.liked)}</span></p>`:""}${r.improve?`<p><b>${t("improveLabel")}:</b> <span dir="auto">${esc(r.improve)}</span></p>`:""}</details>`:""}
    <div class="review-actions"><button type="button" class="btn reject" data-review-remove="${esc(r.id)}">${ic("trash")}${t("removeReview")}</button></div></article>`).join("");
    return sectionHead("reviews",t("publicHint"))+(rows.length?`<div class="review-list">${cards}</div>`:`<p class="card empty">${t("noReviews")}</p>`)+
    `<dialog id="confirm-dialog" aria-labelledby="confirm-title"><form method="dialog"><h2 id="confirm-title"></h2><div class="tools"><button class="btn" value="cancel" autofocus>${t("cancel")}</button><button class="btn reject" value="ok" id="confirm-ok"></button></div></form></dialog>`;
  }
  async function accessPage() {
    if(!session.is_admin) return sectionHead("access")+`<p class="card empty">${t("adminOnly")}</p>`;
    const [people,history]=await Promise.all([api.getAccounts(),api.getSignIns()]);
    const when=iso=>iso?date(iso,{year:"numeric",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}):t("never");
    const rows=people.map(p=>`<div class="account-row" data-account="${esc(p.id)}">
      <span class="person">${avatar({name:[p.display_name||p.email,p.display_name||p.email],color:p.email.length%5})}<span class="account-id"><b>${esc(p.display_name||"")}${p.id===session.id?` <small class="meta">· ${t("you")}</small>`:""}</b><small><bdi>${esc(p.email)}</bdi> · ${t("lastSeen")}: ${when(p.last_sign_in_at)}</small></span></span>
      <div class="account-tools">
        <label class="check-pill"><input type="checkbox" data-account-flag="is_admin" ${p.is_admin?"checked":""} ${p.id===session.id?"disabled":""}>${t("adminRole")}</label>
        <label class="check-pill"><input type="checkbox" data-account-flag="website_access" ${p.website_access?"checked":""} ${p.is_admin?"disabled":""}>${t("websiteRole")}</label>
        <button type="button" class="btn" data-account-password="${esc(p.id)}">${t("setPassword")}</button>
        ${p.id===session.id?"":`<button type="button" class="btn reject" data-account-delete="${esc(p.id)}">${t("deleteAccount")}</button>`}
      </div></div>`).join("");
    return sectionHead("access",t("accountsHelp"))+`<article class="card card-pad"><header class="card-head"><h2>${t("newAccount")}</h2></header>
    <form class="account-form" id="account-form" novalidate autocomplete="off">
      <label>${t("displayName")}<input name="name" maxlength="80" autocomplete="off"></label>
      <label>${t("emailAddress")}<textarea name="email" rows="1" required autocapitalize="none" spellcheck="false" autocomplete="off" placeholder="name@nostrix.ae, name2@nostrix.ae"></textarea></label>
      <label>${t("newPassword")}<input name="password" type="password" required minlength="8" autocomplete="new-password"></label>
      <div class="account-flags"><label class="check-pill"><input type="checkbox" name="website_access" checked>${t("websiteRole")}</label><label class="check-pill"><input type="checkbox" name="is_admin">${t("adminRole")}</label></div>
      <button type="submit" class="btn primary">${ic("plus")}${t("createAccount")}</button></form><p class="error-text" id="account-error" role="alert"></p></article>
    <article class="card card-pad"><header class="card-head"><h2>${t("people")}</h2><span class="meta">${num(people.length)}</span></header><div class="account-list">${rows}</div></article>
    <article class="card"><header class="table-heading"><h2>${t("signinHistory")}</h2></header><div class="table-wrap"><table><thead><tr><th>${t("who")}</th><th>${t("when")}</th><th>${t("status")}</th></tr></thead><tbody>${!history.length?`<tr><td class="empty" colspan="3">${t("noData")}</td></tr>`:""}${history.map(h=>`<tr><td><bdi>${esc(h.email)}</bdi></td><td>${when(h.at)}${h.city||h.country?` · ${esc([h.city,h.country].filter(Boolean).join(", "))}`:""}</td><td>${h.ok?`<span class="status handled">${t("signIn")}</span>`:`<span class="status">${t("failed")}</span>`}</td></tr>`).join("")}</tbody></table></div></article>
    <dialog id="password-dialog" aria-labelledby="password-title"><form method="dialog" id="password-set"><h2 id="password-title">${t("setPassword")}</h2><p dir="ltr" class="meta" id="password-who"></p>
      <label>${t("newPassword")}<input name="password" type="password" minlength="8" autocomplete="new-password"></label>
      <div class="tools"><button class="btn" value="cancel">${t("cancel")}</button><button class="btn primary" value="ok">${t("save")}</button></div></form></dialog>
    <dialog id="confirm-dialog" aria-labelledby="confirm-title"><form method="dialog"><h2 id="confirm-title"></h2><div class="tools"><button class="btn" value="cancel" autofocus>${t("cancel")}</button><button class="btn reject" value="ok" id="confirm-ok"></button></div></form></dialog>`;
  }
  let workspaceLinks={website:null,staff:null}, stopLive=()=>{}, activeGlobe,shownNotes=[];
  let noteDraft="",noteQuery="",draftOwner="",portfolioData,categoryId="",draftPhotos=[],publishTimer;
  let lastLocations=[],lastSites=[],dragPhotoId=null,editPhotoId=null,galleryGeneration=0;

  function disposeLive() {
    stopLive();stopLive=()=>{};
    activeGlobe?.destroy();activeGlobe=null;
    clearTimeout(publishTimer);
  }
  function clearPhotoDraft() {
    galleryGeneration++;
    draftPhotos.forEach(row=>URL.revokeObjectURL(row.src));
    draftPhotos=[];
  }
  function globeCard() {
    return `<section class="card geo-card" aria-labelledby="globe-heading"><header class="card-head geo-head">
      <div><h2 id="globe-heading">${t("globeTitle")}</h2><p class="meta" id="geo-summary"></p></div>
      <span class="geo-live" id="geo-live"><i></i>${t("liveDemo").replace("{n}",num(0))}</span></header><div class="geo-layout">
      <div class="geo-stage"><canvas tabindex="0" role="img" aria-label="${t("globeHelp")}"></canvas><div class="map-pins"></div>
        <span class="geo-view" id="geo-view">${t("worldView")}</span>
        <div class="geo-controls"><button type="button" data-map="in" ${label(t("zoomIn"))}>+</button><span class="zoom-level"></span>
        <button type="button" data-map="out" ${label(t("zoomOut"))}>−</button><button type="button" data-map="reset" ${label(t("worldView"))}>${ic("globe")}</button></div>
      </div><div class="geo-data"><h3>${t("countryTitle")}</h3><div id="country-list" class="country-list"></div>
      <div class="latest-visit"><span class="meta">${t("latestVisit")}</span><button type="button" id="geo-latest" data-map="latest"></button></div></div></div>
      <footer class="geo-footer"><span>${t("dragHelp")}</span></footer></section>`;
  }
  const countryName=code=>{try{return new Intl.DisplayNames([locale()],{type:"region"}).of(code)}catch{return code}};
  function selectSite(site) {
    if(!site) return;
    activeGlobe?.focus(site);
    document.getElementById("geo-view").textContent=pick(site.city)+(site.code?" · "+countryName(site.code):"");
  }
  function mapSnapshot(snapshot) {
    const groups=new Map();
    lastSites=snapshot.sites.map(p=>({...p,label:pick(p.city)+(p.code?" · "+countryName(p.code):"")+" · "+num(p.count)}));
    for(const p of lastSites) {
      if(!groups.has(p.code))groups.set(p.code,{...p,count:0});
      groups.get(p.code).count+=p.count;
    }
    activeGlobe?.show(lastSites,lastSites[0]?.key);
    const list=document.getElementById("country-list");if(!list)return;
    const rows=[...groups.values()].filter(p=>p.code).sort((a,b)=>b.count-a.count||a.code.localeCompare(b.code));
    const markup=rows.map(p=>`<button type="button" class="country-row" data-country="${esc(p.code)}"><span class="country-code" dir="ltr">${esc(p.code)}</span><span>${esc(countryName(p.code))}</span><b>${num(p.count)}</b>${ic("right","directional")}</button>`).join("")||`<p class="empty">${t("noVisits")}</p>`;
    if(list.innerHTML!==markup) {
      const focused=list.contains(document.activeElement)?document.activeElement.dataset.country:null;
      list.innerHTML=markup;
      if(focused) list.querySelector('[data-country="'+CSS.escape(focused)+'"]')?.focus({preventScroll:true});
    }
    const total=lastSites.reduce((n,p)=>n+p.count,0);
    document.getElementById("geo-summary").textContent=num(total)+" "+t("opens")+" · "+t("lastMinutes").replace("{n}",num(snapshot.days));
    const live=document.getElementById("geo-live");if(live)live.innerHTML="<i></i>"+esc(t("liveDemo").replace("{n}",num(snapshot.live)));
    const newest=document.getElementById("geo-latest"),first=lastSites[0];
    newest.disabled=!first;
    newest.textContent=first?pick(first.city)+" · "+date(first.at,{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):"—";
  }
  function notesPage() {
    return sectionHead("notes")+`<article class="card card-pad"><header class="card-head"><h2>${t("writeNote")}</h2><span class="scope-label">${ic("lock")}${t("websiteStaff")}</span></header>
    <form id="note-form"><label class="sr-only" for="note-text">${t("writeNote")}</label><textarea id="note-text" maxlength="2000" rows="3" dir="auto" placeholder="${t("notePrompt")}">${esc(noteDraft)}</textarea>
    <div class="composer-foot"><span class="meta" id="note-length">${num(noteDraft.length)} / ${num(2000)}</span><button class="btn primary" type="submit">${ic("plus")}${t("postNote")}</button></div>
    <p role="alert" id="note-error" class="error-text"></p></form></article>
    <article class="card"><header class="card-head table-heading"><h2>${t("sharedNotes")}</h2><label class="search-box">${ic("search")}<input id="note-search" type="search" aria-label="${t("searchNotes")}" placeholder="${t("searchNotes")}" value="${esc(noteQuery)}"></label></header>
    <div id="note-list" aria-live="polite" aria-relevant="additions"></div></article>`;
  }
  function drawNotes(rows=shownNotes) {
    shownNotes=rows;
    const visible=rows.filter(r=>[...r.text,...r.name].join(" ").toLocaleLowerCase().includes(noteQuery.trim().toLocaleLowerCase()));
    const list=document.getElementById("note-list");if(!list)return;
    list.innerHTML=visible.map(r=>`<article class="note-row ${r.pinned?"is-pinned":""}"><header>${person(r)}${r.pinned?`<span class="pin-chip">${t("pinned")}</span>`:""}<time class="meta" datetime="${esc(r.at)}">${date(r.at,{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</time></header>
    <p dir="auto">${esc(pick(r.text))}</p><div class="note-tools"><button type="button" class="text-btn" data-note-pin="${esc(r.id)}" data-pinned="${r.pinned}">${t(r.pinned?"unpinNote":"pinNote")}</button>${r.canDelete?`<button type="button" class="text-btn danger-text" data-note-delete="${esc(r.id)}">${t("deleteNote")}</button>`:""}</div></article>`).join("")||`<p class="empty">${t(noteQuery?"noNoteMatches":"noNotes")}</p>`;
  }
  function categoryOptions(value) {
    return portfolioData.categories.map(c=>`<option value="${esc(c.id)}" ${c.id===value?"selected":""}>${esc(pick(c.name))}</option>`).join("");
  }
  function filteredPhotos() {return portfolioData.photos.filter(p=>p.category===categoryId);}
  function galleryGrid() {
    const rows=filteredPhotos();
    return rows.map((p,i)=>`<article class="gallery-photo" draggable="true" data-photo="${esc(p.id)}">
      <div class="gallery-image ${p.published?"":"is-hidden"}"><img draggable="false" loading="lazy" src="${esc(p.src)}" alt="${esc(pick(p.caption)||t("photo"))}"><span class="photo-order">${num(i+1)}</span>${p.video?`<span class="photo-badge">${t("videoItem")}</span>`:""}${p.featured?`<span class="photo-badge featured">★ ${t("featured")}</span>`:""}</div>
      <div class="gallery-meta"><span class="photo-state ${p.published?"live":"hidden"}"><i></i>${t(p.published?"published":"hiddenPhoto")}</span><p dir="auto">${esc(pick(p.caption)||t("noCaption"))}</p>
      <div class="photo-actions"><button class="btn ${p.published?"":"primary"}" type="button" data-photo-publish="${esc(p.id)}" data-state="${p.published}">${t(p.published?"hidePhoto":"approvePhoto")}</button><button class="btn" type="button" data-photo-feature="${esc(p.id)}" data-state="${p.featured}">${t(p.featured?"featureOff":"featureOn")}</button></div><div class="gallery-tools">
      <button class="btn" type="button" data-photo-edit="${esc(p.id)}">${t("edit")}</button>
      <button class="icon-btn" type="button" data-move="-1" ${i===0?"disabled":""} ${label(t("earlier"))}>${ic("right","move-back")}</button>
      <button class="icon-btn" type="button" data-move="1" ${i===rows.length-1?"disabled":""} ${label(t("later"))}>${ic("right","directional")}</button>
      <button class="icon-btn delete-photo" type="button" data-photo-delete="${esc(p.id)}" ${label(t("deletePhoto"))}>${ic("trash")}</button></div></div></article>`).join("")||`<p class="empty">${t("noPhotos")}</p>`;
  }
  function pendingPhotos() {
    const panel=document.getElementById("photo-drafts");if(!panel)return;
    panel.innerHTML=draftPhotos.length?`<div class="draft-grid">${draftPhotos.map((p,i)=>`<div class="photo-draft" data-draft="${i}"><img src="${esc(p.src)}" alt="${t("photoPreview")}"><div class="draft-fields"><bdi class="draft-name">${esc(p.file.name)}</bdi>
      <label>${t("category")}<select data-draft-category>${categoryOptions(p.category)}</select></label><label>${t("caption")}<input data-draft-caption maxlength="240" dir="auto" value="${esc(p.caption)}"></label></div>
      <button type="button" class="icon-btn" data-discard="${i}" ${label(t("remove"))}>${ic("close")}</button></div>`).join("")}</div>
      <div class="draft-save"><button class="btn primary" type="button" data-gallery="save">${t("publishPhotos")} (${num(draftPhotos.length)})</button></div>`:"";
  }
  async function portfolioPage() {
    portfolioData=await api.getPortfolio();
    if(!portfolioData.categories.some(c=>c.id===categoryId))categoryId=portfolioData.categories[0]?.id||"";
    return sectionHead("portfolio",t("uploadsHidden"))+`<article class="card card-pad"><header class="card-head"><h2>${t("addPhotos")}</h2></header>
      <div class="dropzone" id="photo-drop">${ic("image")}<span>${t("dropPhotos")}</span><button class="btn" type="button" data-gallery="choose">${t("choosePhotos")}</button><input id="photo-files" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif" hidden></div>
      <p class="error-text" role="alert" id="gallery-error"></p><div id="photo-drafts"></div></article>
    <div class="gallery-heading"><h2>${t("gallery")}</h2><div class="tabs" aria-label="${t("category")}" role="group">${portfolioData.categories.map(c=>`<button type="button" data-category="${esc(c.id)}" aria-pressed="${c.id===categoryId}">${esc(pick(c.name))} <span>${num(portfolioData.photos.filter(p=>p.category===c.id).length)}</span></button>`).join("")}</div></div>
    <div class="gallery-grid" id="gallery-grid">${galleryGrid()}</div>
    <dialog id="photo-dialog" aria-labelledby="photo-dialog-title"><form id="photo-editor"><h2 id="photo-dialog-title"></h2><img class="dialog-photo" alt="">
      <div class="editor-fields"><label>${t("category")}<select name="category"></select></label><label>${t("caption")}<input name="caption" dir="auto" maxlength="240"></label></div>
      <div class="tools"><button type="button" class="btn" data-gallery="cancel">${t("cancel")}</button><button type="submit" class="btn primary" id="photo-confirm"></button></div></form></dialog>`;
  }
  let busyGallery=false;
  async function publishUI(token) {
    clearTimeout(publishTimer);
    try {
      const state=await api.getPublishStatus(), banner=document.getElementById("publish-banner");
      if(!banner||token!==revision)return;
      banner.dataset.status=state.status;
      const description=t(state.status==="publishing"?"publishing":state.status==="failed"?"publishFailed":"live");
      banner.innerHTML=`<span class="publish-state"><i></i>${description}</span>`+(state.status==="publishing"?
        `<progress max="100" value="${state.progress}" aria-label="${t("progress")}"></progress><bdi>${percent(state.progress)}</bdi>`:
        state.status==="failed"?`<button class="btn" type="button" data-gallery="retry">${t("retry")}</button>`:"");
      if(state.status==="publishing")publishTimer=setTimeout(()=>publishUI(token),300);
    } catch(e){if(token===revision)handleLiveError(e);}
  }
  function handleLiveError(e) {
    if(e.message==="signedOut"){navigate("login");return;}
    if(e.message==="noAccess")render();
    else toast(t(T[e.message]?e.message:"unavailable"));
  }
  async function startPage(page,token) {
    let stop;
    const error=e=>{if(token===revision)handleLiveError(e);};
    if(page==="overview"||page==="visitors") {
      const stage=document.querySelector(".geo-stage");
      activeGlobe=window.NostrixGlobe.mount(stage,selectSite,()=>{const view=stage.querySelector(".geo-view");if(view)view.textContent=t("mapError");});
      stop=await api.subscribeVisitorMap(rows=>{if(token===revision)mapSnapshot(rows);},error);
    } else if(page==="notes") {
      stop=await api.subscribeNotes(rows=>{if(token===revision)drawNotes(rows);},error);
    } else if(page==="portfolio") {
      pendingPhotos();
    }
    if(stop){if(token===revision)stopLive=stop;else stop();}
  }
  async function readFiles(files) {
    const where=galleryGeneration;
    const accepted=[];
    let invalid=false;
    await Promise.all(Array.from(files).map(async(file,i)=>{
      if(!["image/jpeg","image/png","image/webp","image/gif","image/avif"].includes(file.type)) { invalid=true;return; }
      const src=URL.createObjectURL(file),img=new Image();img.src=src;
      try {
        await img.decode();
        if(where===galleryGeneration)accepted[i]={file,src,category:categoryId,caption:""};
        else URL.revokeObjectURL(src);
      } catch { URL.revokeObjectURL(src);invalid=true; }
    }));
    if(where!==galleryGeneration)return;
    draftPhotos.push(...accepted.filter(Boolean));pendingPhotos();
    const error=document.getElementById("gallery-error");if(error)error.textContent=invalid?t("badPhoto"):"";
  }
  async function galleryMutation(job,done) {
    if(busyGallery)return;
    busyGallery=true;
    try {
      await job();done?.();if(route()==="portfolio")await render();
    } catch(e) {handleLiveError(e);}
    finally {busyGallery=false;}
  }
  function photoDialog(which,deleting) {
    const row=portfolioData.photos.find(p=>p.id===which),dialog=document.getElementById("photo-dialog");
    if(!row||!dialog)return;
    editPhotoId=which;
    const form=dialog.querySelector("form");
    form.dataset.mode=deleting?"delete":"edit";
    dialog.querySelector("h2").textContent=t(deleting?"deletePhotoConfirm":"editPhoto");
    dialog.querySelector("img").src=row.src;
    dialog.querySelector(".editor-fields").hidden=deleting;
    form.elements.category.innerHTML=categoryOptions(row.category);
    form.elements.caption.value=pick(row.caption);
    dialog.querySelector("#photo-confirm").textContent=t(deleting?"deletePhoto":"save");
    dialog.showModal();
  }
  function movePhoto(from,to) {
    const rows=filteredPhotos().map(p=>p.id);
    if(!rows.includes(from)||to<0||to>=rows.length||rows.indexOf(from)===to)return;
    rows.splice(rows.indexOf(from),1);rows.splice(to,0,from);
    return galleryMutation(()=>api.reorderPhotos(categoryId,rows));
  }
  app.addEventListener("click",async e=>{
    const b=e.target.closest("button");if(!b)return;
    const d=b.dataset;
    if(d.map==="reset"){activeGlobe?.reset();document.getElementById("geo-view").textContent=t("worldView");}
    else if(d.map==="in"||d.map==="out")activeGlobe?.zoom(d.map==="in"?1.6:1/1.6);
    else if(d.map==="latest")selectSite(lastSites[0]);
    else if(d.country)selectSite(lastSites.filter(s=>s.code===d.country).sort((a,b)=>b.count-a.count)[0]);
    else if(d.category) {categoryId=d.category;await render();}
    else if(d.gallery==="choose")document.getElementById("photo-files").click();
    else if(d.gallery==="cancel")document.getElementById("photo-dialog").close();
    else if(d.gallery==="retry")await galleryMutation(()=>api.retryPublish());
    else if(d.discard!==undefined){const [row]=draftPhotos.splice(Number(d.discard),1);if(row)URL.revokeObjectURL(row.src);pendingPhotos();}
    else if(d.gallery==="save"&&draftPhotos.length){
      b.disabled=true;b.textContent=t("loading");
      await galleryMutation(()=>api.uploadPhotos(draftPhotos.map(p=>p.file),draftPhotos.map(p=>p.category),draftPhotos.map(p=>p.caption)),
        ()=>{categoryId=draftPhotos[0]?.category||categoryId;clearPhotoDraft();toast(t("photosUploaded"));});
    } else if(d.photoPublish) await galleryMutation(()=>api.updatePhoto(d.photoPublish,{published:d.state!=="true"}));
    else if(d.photoFeature) await galleryMutation(()=>api.updatePhoto(d.photoFeature,{featured:d.state!=="true"}));
    else if(d.photoEdit || d.photoDelete)photoDialog(d.photoEdit||d.photoDelete,!!d.photoDelete);
    else if(d.move) {
      const p=b.closest("[data-photo]").dataset.photo;
      await movePhoto(p,filteredPhotos().findIndex(row=>row.id===p)+Number(d.move));
    }
  });
  app.addEventListener("submit",async e=>{
    const form=e.target;
    if(form.id==="note-form") {
      e.preventDefault();const submit=form.querySelector('[type="submit"]');if(submit.disabled)return;submit.disabled=true;
      try{await api.addNote(form.querySelector("textarea").value);noteDraft="";form.reset();form.querySelector("textarea").value="";form.querySelector("#note-length").textContent=num(0)+" / "+num(2000);form.querySelector("#note-error").textContent="";toast(t("noteSaved"));}
      catch(error){if(error.message==="noAccess")await render();else form.querySelector("#note-error").textContent=t(T[error.message]?error.message:"unavailable");}
      finally{submit.disabled=false;}
    } else if(form.id==="photo-editor") {
      e.preventDefault();
      const id=editPhotoId,change={caption:form.elements.caption.value,category:form.elements.category.value};
      await galleryMutation(()=>form.dataset.mode==="delete"?api.deletePhoto(id):api.updatePhoto(id,change),()=>form.closest("dialog").close());
    }
  });
  app.addEventListener("input",e=>{
    const field=e.target;
    if(field.id==="note-text") {noteDraft=field.value;document.getElementById("note-length").textContent=num(noteDraft.length)+" / "+num(2000);}
    else if(field.id==="note-search"){noteQuery=field.value;drawNotes();}
    else if(field.hasAttribute("data-draft-caption"))draftPhotos[Number(field.closest("[data-draft]").dataset.draft)].caption=field.value;
  });
  app.addEventListener("change",e=>{
    const field=e.target;
    if(field.id==="photo-files"){readFiles(Array.from(field.files));field.value="";}
    else if(field.hasAttribute("data-draft-category"))draftPhotos[Number(field.closest("[data-draft]").dataset.draft)].category=field.value;
  });
  app.addEventListener("dragstart",e=>{const item=e.target.closest("[data-photo]");if(item){dragPhotoId=item.dataset.photo;e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",dragPhotoId);}});
  app.addEventListener("dragend",()=>{dragPhotoId=null;app.querySelectorAll(".drag-over").forEach(n=>n.classList.remove("drag-over"));});
  app.addEventListener("dragover",e=>{
    const target=e.target.closest("#photo-drop,[data-photo]");if(!target)return;
    if(target.id==="photo-drop"?!e.dataTransfer.types.includes("Files"):!dragPhotoId)return;
    e.preventDefault();target.classList.add("drag-over");e.dataTransfer.dropEffect=dragPhotoId?"move":"copy";
  });
  app.addEventListener("dragleave",e=>{const target=e.target.closest("#photo-drop,[data-photo]");if(target&&!target.contains(e.relatedTarget))target.classList.remove("drag-over");});
  app.addEventListener("drop",e=>{
    const target=e.target.closest("#photo-drop,[data-photo]");if(!target)return;
    e.preventDefault();target.classList.remove("drag-over");
    if(target.id==="photo-drop")readFiles(e.dataTransfer.files);
    else if(dragPhotoId)movePhoto(dragPhotoId,filteredPhotos().findIndex(p=>p.id===target.dataset.photo));
    dragPhotoId=null;
  });

  function syncDocument(page) {
    document.title=t(page)+" · Nostrix";
    document.querySelector('meta[name="theme-color"]').content=html.dataset.theme==="dark"?"#121315":"#f6f6f9";
    document.querySelector(".skip").textContent=t("skip");
  }
  async function render() {
    const token=++revision;
    const page=route();
    disposeLive();
    if(page!=="portfolio")clearPhotoDraft();
    const loadingTimer=setTimeout(()=>{
      if(token===revision)app.innerHTML=`<main class="auth-layout"><p class="loading-state" role="status">${t("loading")}</p></main>`;
    },160);
    try {
      [session,workspaceLinks]=await Promise.all([api.getSession(),api.getWorkspaceLinks()]);
      const allowed=session && await api.canAccessWebsiteArea();
      if (token!==revision) return;
      const owner=allowed?session.email:"";
      if(owner!==draftOwner){noteDraft="";noteQuery="";shownNotes=[];clearPhotoDraft();draftOwner=owner;}
      if (!session || !allowed || page==="login" || page==="no-access") {
        const denied=page!=="login" && (!!session && !allowed || page==="no-access");
        const demo=await api.getDemoAccount();
        if (token!==revision) return;
        syncDocument(denied?"noAccess":"signIn");
        app.innerHTML=authPage(denied,demo);
      } else {
        const reviews=await api.getReviews();
        const views={overview:()=>overview(reviews),visitors,clicks,enquiries:enquiryPage,reviews:()=>reviewPage(reviews),access:accessPage,portfolio:portfolioPage,notes:notesPage};
        const body=await views[page]();
        if (token!==revision) return;
        syncDocument(page);
        app.innerHTML=shell(page,0,body);
        clearTimeout(loadingTimer);
        await startPage(page,token);
        if(token!==revision)return;
      }
      if (focusNextPage) {
        focusNextPage=false;
        document.querySelector("#content")?.focus({preventScroll:true});
        window.scrollTo(0,0);
      }
    } catch (error) {
      if (token!==revision) return;
      if(error.message==="signedOut"&&route()!=="login"){location.hash="login";return;}
      const denied=error.message==="noAccess";
      syncDocument(denied?"noAccess":"unavailable");
      app.innerHTML=denied?authPage(true,{}):`<main class="auth-layout" id="content"><section class="auth-box">${brand()}<h1>${t(T[error.message]?error.message:"unavailable")}</h1><button class="btn" data-action="retry">${t("retry")}</button></section></main>`;
    } finally {clearTimeout(loadingTimer);}
  }
  function navigate(page) {
    if (route()===page) return render();
    location.hash=page;
  }
  function setNav(open) {
    const shell=app.querySelector(".shell");
    if (!shell) return;
    shell.classList.toggle("nav-open",open);
    const trigger=shell.querySelector(".mobile-toggle");
    trigger.setAttribute("aria-expanded",String(open));
    shell.querySelector(".topbar").inert=open;
    shell.querySelector("main").inert=open;
    (open?shell.querySelector(".mobile-close"):trigger).focus();
  }
  function toggleProfile(open) {
    const menu=app.querySelector("#account-menu");
    if (!menu) return;
    menu.hidden=!open;
    app.querySelector('[data-action="profile"]').setAttribute("aria-expanded",String(open));
  }
  function confirmBox(title,action) {
    const dialog=document.querySelector("#confirm-dialog");
    if(!dialog) return Promise.resolve(window.confirm(title));
    dialog.querySelector("#confirm-title").textContent=title;
    dialog.querySelector("#confirm-ok").textContent=action;
    dialog.returnValue="";dialog.showModal();
    return new Promise(resolve=>dialog.addEventListener("close",()=>resolve(dialog.returnValue==="ok"),{once:true}));
  }
  function showError(form,name,message) {
    const input=form.elements[name];
    const errorElement=document.getElementById(input.getAttribute("aria-describedby"));
    errorElement.textContent=message;
    errorElement.hidden=!message;
    input.setAttribute("aria-invalid",String(!!message));
  }
  async function mutate(action,button,confirmation,focusSelector) {
    button.disabled=true;
    try {
      await action();
      await render();
      if (focusSelector) app.querySelector(focusSelector)?.focus({preventScroll:true});
      toast(t(confirmation));
    } catch(error) {
      if (error.message==="noAccess") await render();
      else toast(t(T[error.message]?error.message:"unavailable"));
    } finally { button.disabled=false; }
  }
  app.addEventListener("click",async event=>{
    const button=event.target.closest("button,[data-action]");
    if (!event.target.closest(".account-wrap")) toggleProfile(false);
    if (event.target.closest(".nav-item") && app.querySelector(".nav-open")) setNav(false);
    if (!button) return;
    const action=button.dataset.action;
    if (action==="lang" || action==="theme") {
      if (action==="lang") { html.lang=ar()?"en":"ar"; html.dir=ar()?"rtl":"ltr"; savePref("nostrix_language_v1",html.lang); }
      else { html.dataset.theme=html.dataset.theme==="dark"?"light":"dark"; savePref("nostrix_theme",html.dataset.theme); }
      await render();
      app.querySelector('[data-action="'+action+'"]')?.focus({preventScroll:true});
    } else if (action==="open-nav" || action==="close-nav") setNav(action==="open-nav");
    else if (action==="profile") toggleProfile(document.querySelector("#account-menu").hidden);
    else if (action==="signout") {
      await api.signOut();
      navigate("login");
    } else if (action==="password") {
      const field=app.querySelector('input[name="password"]');
      field.type=field.type==="password"?"text":"password";
      button.title=t(field.type==="password"?"showPassword":"hidePassword");
      button.setAttribute("aria-label",button.title);
      button.setAttribute("aria-pressed",String(field.type==="text"));
    } else if (action==="retry") await render();
    else if (button.dataset.tab) {
      state.reviewTab=button.dataset.tab;
      await render();
      app.querySelector('[data-tab="'+state.reviewTab+'"]')?.focus({preventScroll:true});
    } else if (button.dataset.handled) {
      const id=button.dataset.handled;
      await mutate(()=>api.setEnquiryHandled(id,button.getAttribute("aria-checked")!=="true"),button,"updated",'[data-handled="'+id+'"]');
    } else if (button.dataset.review) {
      const status=button.dataset.status;
      await mutate(()=>api.setReviewStatus(button.dataset.review,status),button,status==="approved"?"reviewApproved":"reviewRejected",'[data-tab="'+state.reviewTab+'"]');
    } else if (button.dataset.reviewRemove) {
      if (await confirmBox(t("removeReviewConfirm"),t("removeReview"))) await mutate(()=>api.removeReview(button.dataset.reviewRemove),button,"reviewRemoved");
    } else if (button.dataset.noteDelete) {
      try { await api.deleteNote(button.dataset.noteDelete); drawNotes(await api.getNotes()); } catch(error) { handleLiveError(error); }
    } else if (button.dataset.notePin) {
      try { await api.pinNote(button.dataset.notePin,button.dataset.pinned!=="true"); drawNotes(await api.getNotes()); } catch(error) { handleLiveError(error); }
    } else if (button.dataset.accountDelete) {
      if (await confirmBox(t("deleteAccountConfirm"),t("deleteAccount"))) await mutate(()=>api.deleteAccount(button.dataset.accountDelete),button,"accountDeleted");
    } else if (button.dataset.accountPassword) {
      const dialog=document.querySelector("#password-dialog"),row=button.closest("[data-account]");
      dialog.querySelector("#password-who").textContent=row.querySelector("bdi").textContent;
      dialog.querySelector("input").value="";dialog.returnValue="";dialog.showModal();
      dialog.addEventListener("close",async()=>{
        const value=dialog.querySelector("input").value;dialog.querySelector("input").value="";
        if(dialog.returnValue==="ok"&&value) await mutate(()=>api.updateAccount(button.dataset.accountPassword,{password:value}),button,"passwordSet");
      },{once:true});
    } else if (button.dataset.remove) {
      removeTarget=button.dataset.remove;
      document.querySelector("#remove-email").textContent=removeTarget;
      const dialog=document.querySelector("#remove-dialog");
      dialog.showModal();
      dialog.addEventListener("close",async ()=>{
        if (dialog.returnValue==="remove") await mutate(()=>api.removeWebsiteAccess(removeTarget),button,"accessRemoved",'#add-form input');
        removeTarget=null;
      },{once:true});
      dialog.returnValue="";
    }
  });
  app.addEventListener("submit",async event=>{
    const form=event.target;
    if (form.id==="account-form") {
      event.preventDefault();
      const submit=form.querySelector('[type="submit"]'),err=form.parentElement.querySelector("#account-error");
      const f=form.elements;err.textContent="";
      const emails=[...new Set(f.email.value.split(/[\s,;]+/).map(v=>v.trim().toLowerCase()).filter(Boolean))];
      if(!emails.length||emails.some(v=>!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))){err.textContent=t("badEmail");f.email.focus();return;}
      if(f.password.value.length<8){err.textContent=t("weakPassword");f.password.focus();return;}
      submit.disabled=true;
      const failed=[];
      for(const address of emails){
        try { await api.createAccount({name:emails.length===1?f.name.value:"",email:address,password:f.password.value,website_access:f.website_access.checked,is_admin:f.is_admin.checked}); }
        catch(error){ failed.push(address+": "+t(T[error.message]?error.message:"unavailable")); }
      }
      f.password.value="";submit.disabled=false;
      await render();
      if(failed.length){ const e2=document.querySelector("#account-error"); if(e2) e2.textContent=failed.join(" · "); }
      toast(t("accountCreated")+(emails.length>1?" ("+num(emails.length-failed.length)+")":""));
      return;
    }
    if (!["add-form","login-form","range-form"].includes(form.id)) return;
    event.preventDefault();
    const submit=form.querySelector('[type="submit"]');
    if (submit.disabled) return;
    submit.disabled=true;
    try {
      if (form.id==="login-form") {
        const identity=form.elements.identity.value.trim();
        const missingPassword=!form.elements.password.value.length;
        showError(form,"identity",identity?"":t("requiredIdentity"));
        showError(form,"password",missingPassword?t("requiredPassword"):"");
        if (!identity || missingPassword) { form.elements[!identity?"identity":"password"].focus(); return; }
        await api.signIn(identity,form.elements.password.value);
        form.elements.password.value="";
        navigate("overview");
      } else if (form.id==="add-form") {
        await api.addWebsiteAccess(form.elements.email.value);
        await render();
        app.querySelector("#add-form input")?.focus();
        toast(t("accessAdded"));
      } else {
        const from=form.elements.from.value,to=form.elements.to.value;
        if (!from||!to||from>to||to>chartStats.today||offsetDate(from,365)<to) throw new Error("invalidRange");
        state.visitorRange={from,to};
        state.visitorDays="custom";
        await render();
      }
    } catch(error) {
      if (error.message==="noAccess") { await render(); return; }
      const message=t(T[error.message]?error.message:"unavailable");
      if (form.id==="add-form") { showError(form,"email",message); form.elements.email.focus(); }
      else if (form.id==="range-form") { form.querySelector("#range-error").textContent=message; }
      else { showError(form,"identity",message); form.elements.identity.focus(); }
    } finally { submit.disabled=false; }
  });
  app.addEventListener("input",event=>{
    const field=event.target;
    if (field.id==="enquiry-search") {
      state.search=field.value;
      document.getElementById("enquiry-rows").innerHTML=enquiryRows();
    }
    if (field.form?.id==="range-form" && field.type==="date") {
      document.querySelector("#visitor-days").value="custom";
      document.querySelector("#range-error").textContent="";
    }
    if (field.getAttribute("aria-invalid")==="true") showError(field.form,field.name,"");
  });
  app.addEventListener("change",async event=>{
    const field=event.target;
    if (field.dataset.accountFlag) {
      const id=field.closest("[data-account]").dataset.account;
      field.disabled=true;
      try { await api.updateAccount(id,{[field.dataset.accountFlag]:field.checked}); await render(); toast(t("updated")); }
      catch(error) { field.checked=!field.checked; field.disabled=false; toast(t(T[error.message]?error.message:"unavailable")); }
      return;
    }
    if (field.id==="overview-days") { state.overviewDays=Number(field.value); await render(); }
    else if (field.id==="visitor-days") {
      if (field.value==="custom") { field.form.elements.from.focus(); return; }
      state.visitorDays=field.value;
      state.visitorRange=null;
      await render();
    } else if (field.id==="enquiry-filter") {
      state.enquiryFilter=field.value;
      document.getElementById("enquiry-rows").innerHTML=enquiryRows();
    }
  });
  function chartTip(target) {
    const point=target.closest("[data-point]"),tip=document.querySelector(".chart-tip");
    if (!tip) return;
    tip.hidden=!point;
    if (!point) return;
    const i=Number(point.dataset.point), value=chartStats.series[i];
    if (!value) return;
    tip.textContent=date(value.date)+" · "+num(value.count);
    tip.style.insetInlineStart=Math.min(72,Math.max(2,100*i/(chartStats.series.length-1||1)-8))+"%";
  }
  app.addEventListener("pointerover",e=>chartTip(e.target));
  app.addEventListener("pointerout",e=>{ if (!e.relatedTarget?.closest?.("[data-point]")) app.querySelector(".chart-tip")?.setAttribute("hidden",""); });
  app.addEventListener("focusin",e=>chartTip(e.target));
  app.addEventListener("focusout",()=>app.querySelector(".chart-tip")?.setAttribute("hidden",""));
  document.addEventListener("keydown",event=>{
    if (event.key==="Escape") {
      if (app.querySelector(".nav-open")) setNav(false);
      if (app.querySelector("#account-menu:not([hidden])")) { toggleProfile(false); app.querySelector('[data-action="profile"]').focus(); }
    }
    const point=event.target.closest?.("[data-point]");
    if (point && ["ArrowLeft","ArrowRight","Home","End"].includes(event.key)) {
      event.preventDefault();
      const all=Array.from(point.parentElement.children);
      let index=Number(point.dataset.point)+(event.key==="ArrowRight"?1:-1)*(ar()?-1:1);
      if (event.key==="Home") index=0;
      if (event.key==="End") index=all.length-1;
      const next=all[Math.max(0,Math.min(index,all.length-1))];
      point.tabIndex=-1; next.tabIndex=0; next.focus();
    }
    if (event.key==="Tab" && app.querySelector(".nav-open")) {
      const items=Array.from(app.querySelectorAll(".sidebar a,.sidebar button")).filter(el=>el.offsetParent!==null);
      if (event.shiftKey && document.activeElement===items[0]) { event.preventDefault(); items.at(-1).focus(); }
      if (!event.shiftKey && document.activeElement===items.at(-1)) { event.preventDefault(); items[0].focus(); }
    }
  });
  document.querySelector(".skip").addEventListener("click",event=>{event.preventDefault();document.getElementById("content")?.focus();});
  window.addEventListener("hashchange",()=>{focusNextPage=true;render();});
  window.addEventListener("storage",event=>{
    if (!event.key || (event.key.startsWith("nostrix.website.demo.") && !/\.(note|visit)\.|\.noteSeedDate$/.test(event.key))) render();
    if (event.key==="nostrix_theme" && ["light","dark"].includes(event.newValue)) { html.dataset.theme=event.newValue; render(); }
    if (event.key==="nostrix_language_v1" && ["en","ar"].includes(event.newValue)) { html.lang=event.newValue; html.dir=ar()?"rtl":"ltr"; render(); }
  });
  window.matchMedia("(min-width:821px)").addEventListener("change",event=>{if(event.matches && app.querySelector(".nav-open"))setNav(false);});
  window.addEventListener("pageshow",event=>{if(event.persisted)render();});
  // At the integration path, wait for a session instead of preselecting the demo user.
  if (location.pathname.startsWith("/staff/website/")) render();
  else api.initializePreview().then(render);
  if ("serviceWorker" in navigator && window.isSecureContext && location.protocol!=="file:") {
    window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js",{scope:"./"}).catch(()=>{}));
  }
})();
