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

    marketingHub:["Marketing hub","مركز التسويق"],planner:["Planner","المخطط"],inbox:["Inbox","صندوق الرسائل"],replies:["Reply helper","مساعد الردود"],salesGroup:["Sales","المبيعات"],sales:["Quotes & invoices","العروض والفواتير"],followups:["Follow-ups","المتابعات"],alerts:["Phone alerts","تنبيهات الهاتف"],social:["Social","التواصل الاجتماعي"],leads:["Leads","العملاء المحتملون"],agent:["Agent settings","إعدادات الوكيل"],
    leadsNote:["Possible clients found by the AI agent. Check each one before you contact them.","عملاء محتملون وجدهم الوكيل الذكي. راجع كل واحد قبل التواصل معه."],
    findLeads:["Find new leads","ابحث عن عملاء جدد"],emirate:["Emirate","الإمارة"],focus:["Focus (optional)","التركيز (اختياري)"],
    focusHint:["e.g. new specialty cafés, weekend markets, Ramadan pop-ups","مثال: مقاهٍ مختصة جديدة، أسواق نهاية الأسبوع، فعاليات رمضان"],
    huntNote:["Takes 1–3 minutes and costs about $0.20–0.40. Keep this page open.","يستغرق من دقيقة إلى ثلاث دقائق ويكلّف نحو 0.20–0.40 دولار. أبقِ الصفحة مفتوحة."],
    hunting:["Searching the web for leads…","جارٍ البحث عن عملاء محتملين…"],huntDone:["new leads added.","عملاء جدد أُضيفوا."],
    aiSpend:["AI spend this month","إنفاق الذكاء الاصطناعي هذا الشهر"],huntsToday:["Searches today","عمليات البحث اليوم"],messagesToday:["Messages today","الرسائل اليوم"],
    aiNotReady:["The AI key is not set up in Cloudflare yet.","مفتاح الذكاء الاصطناعي غير مُعدّ في Cloudflare بعد."],
    noLeads:["No leads yet. Press Find new leads to start.","لا يوجد عملاء محتملون بعد. اضغط ابحث عن عملاء جدد للبدء."],
    stNew:["New","جديد"],stContacted:["Contacted","تم التواصل"],stReplied:["Replied","ردّ"],stWon:["Won","تم الفوز"],stLost:["Not interested","غير مهتم"],
    openLeads:["Open leads","العملاء المفتوحون"],allLeads:["All leads","كل العملاء"],fit:["Fit","الملاءمة"],pitch:["Pitch","العرض المقترح"],
    writeMsg:["Write message","اكتب رسالة"],rewriteMsg:["Write again","اكتب مجدداً"],writing:["Writing…","جارٍ الكتابة…"],
    chInstagram:["Instagram DM","رسالة إنستغرام"],chWhatsapp:["WhatsApp","واتساب"],chEmail:["Email","البريد الإلكتروني"],
    copyEn:["Copy English","نسخ الإنجليزية"],copyAr:["Copy Arabic","نسخ العربية"],copied:["Copied.","تم النسخ."],source:["Source","المصدر"],
    leadNotes:["Team notes","ملاحظات الفريق"],deleteLead:["Delete lead","حذف العميل"],deleteLeadConfirm:["Delete this lead?","هل تريد حذف هذا العميل المحتمل؟"],leadDeleted:["Lead deleted.","تم حذف العميل."],
    saved:["Saved.","تم الحفظ."],subjectLabel:["Subject","الموضوع"],
    agentNote:["Everything the AI agent knows and how it writes. Changes apply to the next search or message.","كل ما يعرفه الوكيل الذكي وطريقة كتابته. تُطبّق التغييرات على البحث أو الرسالة التالية."],
    agFinding:["Finding leads","البحث عن العملاء"],agWriting:["Writing messages","كتابة الرسائل"],agBudget:["Budget","الميزانية"],
    agAbout:["About Nostrix","عن نوستريكس"],agAboutHint:["What the agent knows about your business: services, prices, location, clients.","ما يعرفه الوكيل عن عملك: الخدمات والأسعار والموقع والعملاء."],
    agTargets:["Who to look for","من نبحث عنه"],agAvoid:["Avoid","تجنّب"],agEmirate:["Default emirate","الإمارة الافتراضية"],agPerRun:["Leads per search (3–10)","عدد العملاء في كل بحث (3–10)"],
    agHuntRules:["Extra search instructions","تعليمات إضافية للبحث"],agTone:["Tone and approach","الأسلوب والنبرة"],agLength:["Message length","طول الرسالة"],
    agRules:["Extra writing rules","قواعد إضافية للكتابة"],agRulesHint:["e.g. never mention prices, always invite them to see the portfolio","مثال: لا تذكر الأسعار أبداً، وادعُهم دائماً لمشاهدة الأعمال"],
    agSignoff:["Sign-off","التوقيع"],agCap:["Monthly AI budget (USD)","ميزانية الذكاء الاصطناعي الشهرية (دولار)"],agCapHint:["The agent stops for the month when this is reached. Keep it below your Claude Console limit.","يتوقف الوكيل لبقية الشهر عند بلوغها. أبقها أقل من حدّ Claude Console."],
    saveAgent:["Save settings","حفظ الإعدادات"],resetAgent:["Reset to defaults","استعادة الإعدادات الافتراضية"],resetAgentConfirm:["Reset all agent settings to the defaults?","هل تريد استعادة جميع إعدادات الوكيل الافتراضية؟"],
    adminEdits:["Only the owner can change these settings.","يمكن للمالك فقط تغيير هذه الإعدادات."],
    aiMonthCap:["The monthly AI budget is used up.","تم استهلاك ميزانية الذكاء الاصطناعي الشهرية."],aiDailyLimit:["Today's limit for this AI feature is reached.","تم بلوغ الحد اليومي لهذه الميزة."],
    aiNotConfigured:["The AI key is not set up in Cloudflare yet.","مفتاح الذكاء الاصطناعي غير مُعدّ في Cloudflare بعد."],
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
    order:["Orders","الطلبات"],whatsapp:["WhatsApp","واتساب"],call:["Call","اتصال"],email:["Email","البريد الإلكتروني"],estimate:["Estimate builder","حاسبة التكلفة"],
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
    deleteEnquiry:["Delete","حذف"],deleteEnquiryConfirm:["Delete this enquiry permanently?","هل تريد حذف هذا الاستفسار نهائياً؟"],enquiryDeleted:["Enquiry deleted.","تم حذف الاستفسار."],removeReview:["Remove","حذف"],removeReviewConfirm:["Remove this review from the website?","هل تريد حذف هذا التقييم من الموقع؟"],reviewRemoved:["Review removed.","تم حذف التقييم."],
    privateFeedback:["Private feedback","ملاحظات خاصة"],likedLabel:["Liked","ما أعجبه"],improveLabel:["Could improve","ما يمكن تحسينه"],service:["Service","الخدمة"],
    accountsHelp:["Only admins see this page. Passwords are stored encrypted: nobody, including admins, can read them.","هذه الصفحة للمسؤولين فقط. تُحفظ كلمات المرور مشفّرة ولا يمكن لأحد قراءتها، حتى المسؤولين."],
    newAccount:["New accounts · one email, or several separated by commas","حسابات جديدة · بريد واحد أو عدة عناوين مفصولة بفواصل"],displayName:["Name","الاسم"],newPassword:["Password (8+ characters)","كلمة المرور (٨ أحرف على الأقل)"],
    adminRole:["Admin","مسؤول"],websiteRole:["Website section","قسم الموقع"],marketingRole:["Marketing hub","مركز التسويق"],teamRole:["Team only","الفريق فقط"],createAccount:["Create account","إنشاء الحساب"],
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
    other:["Other","أخرى"],log:["Activity log","سجل النشاط"],logHelp:["Who did what, and when, across the staff workspace and the website. Admins only.","من فعل ماذا ومتى في مساحة الفريق والموقع. للمسؤولين فقط."],
    allAreas:["All activity","كل النشاط"],areaTeam:["Staff workspace","مساحة الفريق"],areaWebsite:["Website","الموقع"],areaAccounts:["Accounts","الحسابات"],areaLogin:["Sign-ins","تسجيلات الدخول"],
    searchLog:["Search the log","ابحث في السجل"],action:["Action","الإجراء"],item:["Item","العنصر"],details:["Details","التفاصيل"],person:["Person","الشخص"],noLog:["Nothing recorded yet.","لا يوجد نشاط مسجّل بعد."],whenCol:["When","الوقت"],area:["Area","القسم"]
  };
  const AREA = window.NX_AREA==="marketing"?"marketing":"website";
  const sections = AREA==="marketing" ? ["social","inbox","planner","replies","leads","agent","sales","followups","alerts"] : ["overview","visitors","clicks","enquiries","reviews","access","portfolio","notes","log","alerts"];
  const state = {overviewDays:7, visitorDays:"7", visitorRange:null, reviewTab:"pending", search:"", enquiryFilter:"all"};
  let leadData=null, agentData=null, leadFilter="open", leadBusy=false;
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
    if(AREA==="website"&&["social","inbox","planner","replies","leads","agent","sales","followups"].includes(hash)){location.replace("/staff/marketing/#"+hash);return "overview";}
    return sections.includes(hash)||hash==="login"||hash==="no-access" ? hash : sections[0];
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
        ${AREA==="marketing"?`<div class="nav-label">${t("marketingHub")}</div>
        <nav class="side-nav" aria-label="${t("marketingHub")}">${["social","inbox","planner","replies","leads","agent"].map(k=>navLink(k,page,0)).join("")}</nav>
        ${session.is_admin?`<div class="nav-label management">${t("salesGroup")}</div><nav class="side-nav" aria-label="${t("salesGroup")}">${["sales","followups"].map(k=>navLink(k,page,0)).join("")}</nav>`:""}
        <div class="nav-label management">${t("management")}</div><nav class="side-nav" aria-label="${t("management")}">${navLink("alerts",page,0)}</nav>`:`<div class="nav-label">${t("website")}</div>
        <nav class="side-nav" aria-label="${t("website")}">${sections.slice(0,5).map(key=>navLink(key,page,key==="reviews"?pending:0)).join("")}</nav>
        <div class="nav-label management">${t("management")}</div>
        <nav class="side-nav" aria-label="${t("management")}">${["portfolio","notes","alerts",...(session.is_admin?["access","log"]:[])].map(k=>navLink(k,page,0)).join("")}</nav>`}
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
      `<div class="actions-grid">${data.actions.map((a,i)=>`<article class="stat ${["tone-green","tone-blue","tone-rose","","tone-amber","tone-blue"][i%6]}"><div class="stat-head"><span class="stat-icon">${ic(a.id==="email"||a.id==="order"?"enquiries":a.id)}</span>${t(a.id)}</div><strong>${num(a.count)}</strong></article>`).join("")}</div>
      <article class="card card-pad"><header class="card-head"><h2>${t("packageClicks")}</h2>${ic("clicks")}</header><div class="distribution sales-bars">${!data.packages.length?`<p class="empty">${t("noData")}</p>`:""}${data.packages.map((p,i)=>`<div><div class="source-name"><span>${esc(pick(p.name))}</span><b>${num(p.count)}</b></div><div class="track"><i style="width:${p.count/max*100}%;background:${colors[i%4]}"></i></div></div>`).join("")}</div></article>`;
  }
  function enquiryRows() {
    const query=state.search.trim().toLocaleLowerCase();
    const items=allEnquiries.filter(row=>{
      const matches=[...row.name,row.contact,...row.package,...row.message,row.date].join(" ").toLocaleLowerCase().includes(query);
      return matches && (state.enquiryFilter==="all" || row.handled===(state.enquiryFilter==="handled"));
    });
    return items.length?items.map(r=>`<tr><td>${person(r)}</td><td><bdi>${esc(r.contact)}</bdi></td><td data-label="${t("package")}">${esc(pick(r.package))}</td><td class="details">${esc(pick(r.message))}</td><td data-label="${t("date")}" class="date-cell">${date(r.date)}</td>
    <td><button type="button" class="switch" role="switch" data-handled="${esc(r.id)}" aria-checked="${r.handled}" ${label(t(r.handled?"toggleOpen":"toggleHandled")+" · "+pick(r.name))}><span class="switch-track"></span>${t(r.handled?"handled":"open")}</button>${session.is_admin?`<button type="button" class="icon-btn enquiry-delete" data-enquiry-delete="${esc(r.id)}" ${label(t("deleteEnquiry")+" · "+pick(r.name))}>${ic("trash")}</button>`:""}</td></tr>`).join(""):`<tr><td colspan="6" class="empty">${t("noMatches")}</td></tr>`;
  }
  async function enquiryPage() {
    allEnquiries=await api.getEnquiries();
    return sectionHead("enquiries")+`<div class="tools"><label class="search-box">${ic("search")}<input id="enquiry-search" type="search" value="${esc(state.search)}" ${label(t("search"))} placeholder="${t("search")}"></label>
    ${picker("enquiry-filter","status",[["all","all"],["unhandled","newOnly"],["handled","handled"]],state.enquiryFilter)}</div>
    <div class="card table-wrap"><table class="enquiry-table"><thead><tr>${["name","contact","package","message","date","status"].map(k=>`<th>${t(k)}</th>`).join("")}</tr></thead><tbody id="enquiry-rows">${enquiryRows()}</tbody></table></div>
    <dialog id="confirm-dialog" aria-labelledby="confirm-title"><form method="dialog"><h2 id="confirm-title"></h2><div class="tools"><button class="btn" value="cancel" autofocus>${t("cancel")}</button><button class="btn reject" value="ok" id="confirm-ok"></button></div></form></dialog>`;
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
        <label class="check-pill"><input type="checkbox" data-account-flag="marketing_access" ${p.marketing_access?"checked":""} ${p.is_admin?"disabled":""}>${t("marketingRole")}</label>
        <button type="button" class="btn" data-account-password="${esc(p.id)}">${t("setPassword")}</button>
        ${p.id===session.id?"":`<button type="button" class="btn reject" data-account-delete="${esc(p.id)}">${t("deleteAccount")}</button>`}
      </div></div>`).join("");
    return sectionHead("access",t("accountsHelp"))+`<article class="card card-pad"><header class="card-head"><h2>${t("newAccount")}</h2></header>
    <form class="account-form" id="account-form" novalidate autocomplete="off">
      <label>${t("displayName")}<input name="name" maxlength="80" autocomplete="off"></label>
      <label>${t("emailAddress")}<textarea name="email" rows="1" required autocapitalize="none" spellcheck="false" autocomplete="off" placeholder="name@nostrix.ae, name2@nostrix.ae"></textarea></label>
      <label>${t("newPassword")}<input name="password" type="password" required minlength="8" autocomplete="new-password"></label>
      <div class="account-flags"><label class="check-pill"><input type="checkbox" name="website_access" checked>${t("websiteRole")}</label><label class="check-pill"><input type="checkbox" name="marketing_access">${t("marketingRole")}</label><label class="check-pill"><input type="checkbox" name="is_admin">${t("adminRole")}</label></div>
      <button type="submit" class="btn primary">${ic("plus")}${t("createAccount")}</button></form><p class="error-text" id="account-error" role="alert"></p></article>
    <article class="card card-pad"><header class="card-head"><h2>${t("people")}</h2><span class="meta">${num(people.length)}</span></header><div class="account-list">${rows}</div></article>
    <article class="card"><header class="table-heading"><h2>${t("signinHistory")}</h2></header><div class="table-wrap"><table><thead><tr><th>${t("who")}</th><th>${t("when")}</th><th>${t("status")}</th></tr></thead><tbody>${!history.length?`<tr><td class="empty" colspan="3">${t("noData")}</td></tr>`:""}${history.map(h=>`<tr><td><bdi>${esc(h.email)}</bdi></td><td>${when(h.at)}${h.city||h.country?` · ${esc([h.city,h.country].filter(Boolean).join(", "))}`:""}</td><td>${h.ok?`<span class="status handled">${t("signIn")}</span>`:`<span class="status">${t("failed")}</span>`}</td></tr>`).join("")}</tbody></table></div></article>
    <dialog id="password-dialog" aria-labelledby="password-title"><form method="dialog" id="password-set"><h2 id="password-title">${t("setPassword")}</h2><p dir="ltr" class="meta" id="password-who"></p>
      <label>${t("newPassword")}<input name="password" type="password" minlength="8" autocomplete="new-password"></label>
      <div class="tools"><button class="btn" value="cancel">${t("cancel")}</button><button class="btn primary" value="ok">${t("save")}</button></div></form></dialog>
    <dialog id="confirm-dialog" aria-labelledby="confirm-title"><form method="dialog"><h2 id="confirm-title"></h2><div class="tools"><button class="btn" value="cancel" autofocus>${t("cancel")}</button><button class="btn reject" value="ok" id="confirm-ok"></button></div></form></dialog>`;
  }
  let logRows=[],logArea="all",logQuery="";
  const areaKey={team:"areaTeam",website:"areaWebsite",accounts:"areaAccounts",login:"areaLogin"};
  function logBody() {
    const q=logQuery.trim().toLocaleLowerCase();
    const rows=logRows.filter(r=>(logArea==="all"||r.area===logArea)&&[r.email,r.name,r.action,r.target,r.detail].join(" ").toLocaleLowerCase().includes(q));
    return rows.length?rows.map(r=>`<tr><td class="date-cell">${date(r.at,{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</td><td>${esc(r.name||"")}${r.email?`<br><small class="meta"><bdi>${esc(r.email)}</bdi></small>`:""}</td><td><span class="log-area ${esc(r.area)}">${t(areaKey[r.area]||"other")}</span></td><td><b>${esc(r.action)}</b></td><td dir="auto">${esc(r.target||"")}</td><td class="details" dir="auto">${esc(r.detail||"")}</td></tr>`).join(""):`<tr><td colspan="6" class="empty">${t("noLog")}</td></tr>`;
  }
  async function logPage() {
    if(!session.is_admin) return sectionHead("log")+`<p class="card empty">${t("adminOnly")}</p>`;
    logRows=await api.getActivityLog();
    return sectionHead("log",t("logHelp"))+`<div class="tools"><label class="search-box">${ic("search")}<input id="log-search" type="search" value="${esc(logQuery)}" ${label(t("searchLog"))} placeholder="${t("searchLog")}"></label>
    ${picker("log-area","allAreas",[["all","allAreas"],["team","areaTeam"],["website","areaWebsite"],["accounts","areaAccounts"],["login","areaLogin"]],logArea)}</div>
    <div class="card table-wrap"><table class="log-table"><thead><tr>${["whenCol","person","area","action","item","details"].map(k=>`<th>${t(k)}</th>`).join("")}</tr></thead><tbody id="log-rows">${logBody()}</tbody></table></div>`;
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
  const EMIRATES=["Ras Al Khaimah","Dubai","Sharjah","Ajman","Umm Al Quwain","Abu Dhabi","Fujairah","All UAE"];
  const LEAD_STATUS=[["new","stNew"],["contacted","stContacted"],["replied","stReplied"],["won","stWon"],["lost","stLost"]];
  const money=v=>"$"+(Number(v)||0).toFixed(2);
  // ---------- Automation (daily lead search, auto-publish) ----------
  let autoData=null;
  const hourLabel=h=>new Intl.DateTimeFormat(locale(),{hour:"numeric",minute:"2-digit",timeZone:"UTC"}).format(new Date(Date.UTC(2026,0,1,h)));
  function autoBar() {
    if(!autoData)return "";
    const on=autoData.leadsOn,st=autoData.status||{};
    return `<article class="card card-pad auto-bar ${on?"on":""}"><span class="auto-dot" aria-hidden="true"></span><div><strong>${on?L("Daily lead search is running","البحث اليومي عن العملاء يعمل"):L("Daily lead search is paused","البحث اليومي عن العملاء متوقف")}</strong>
      <p class="meta">${on?L("Every day at ","كل يوم الساعة ")+esc(hourLabel(autoData.leadsHour))+L(" (UAE)"," (الإمارات)"):L("Nothing runs until you resume it.","لن يعمل شيء حتى تستأنفه.")}${st.leadsResult?" · "+L("Last run: ","آخر تشغيل: ")+esc(st.leadsResult):""}${autoData.schedulerReady?"":" · "+L("Scheduler not set up yet","المُجدول غير مُعدّ بعد")}</p></div>
      ${session.is_admin?`<button class="btn ${on?"reject":"primary"}" type="button" data-auto-toggle="leadsOn">${on?"⏸ "+L("Pause","إيقاف مؤقت"):"▶ "+L("Resume","استئناف")}</button>`:""}</article>`;
  }
  function autoCard() {
    if(!autoData)return "";
    const a=autoData,dis=session.is_admin?"":"disabled",st=a.status||{};
    const days=[[1,"Mon","الاثنين"],[2,"Tue","الثلاثاء"],[3,"Wed","الأربعاء"],[4,"Thu","الخميس"],[5,"Fri","الجمعة"],[6,"Sat","السبت"],[0,"Sun","الأحد"]];
    return `<article class="card card-pad agent-card" id="auto-card"><header><span class="agent-emoji" aria-hidden="true">⏱️</span><div><h2>${L("Automation","الأتمتة")}</h2><p class="meta">${a.schedulerReady?(a.schedulerSeen?L("Scheduler running · last check ","المُجدول يعمل · آخر فحص ")+esc(date(a.schedulerSeen,{hour:"2-digit",minute:"2-digit"})):L("Scheduler is set up, waiting for its first check.","المُجدول مُعدّ وينتظر أول فحص.")):L("The free Cloudflare scheduler is not set up yet. Your settings are saved and start working once it is.","المُجدول المجاني في Cloudflare غير مُعدّ بعد. إعداداتك محفوظة وتبدأ بالعمل عند إعداده.")}</p></div></header>
      <label class="switch-row big"><input type="checkbox" data-auto="leadsOn" ${a.leadsOn?"checked":""} ${dis}><span class="toggle"></span><span><b>${L("Daily lead search","البحث اليومي عن العملاء")}</b><small class="meta">${L("Uses your settings below. About $0.25 a run, inside your monthly budget.","يستخدم إعداداتك أدناه. نحو 0.25 دولار لكل تشغيل ضمن ميزانيتك الشهرية.")}</small></span></label>
      <div class="form-row"><label class="agent-field">${L("Time (UAE)","الوقت (الإمارات)")}<select data-auto="leadsHour" ${dis}>${Array.from({length:24},(_,h)=>`<option value="${h}" ${a.leadsHour===h?"selected":""}>${esc(hourLabel(h))}</option>`).join("")}</select></label></div>
      <div class="chips">${days.map(([d,en,ar])=>chip("checkbox","autoDays",d,a.leadsDays.includes(d),"",L(en,ar),dis)).join("")}</div>
      ${st.leadsResult?`<p class="meta">${L("Last run","آخر تشغيل")}: ${esc(st.leadsResult)}${st.leadsAt?" · "+esc(date(st.leadsAt,{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})):""}</p>`:""}
      <label class="switch-row big"><input type="checkbox" data-auto="publishInstagram" ${a.publishInstagram?"checked":""} ${dis}><span class="toggle"></span><span><b>${L("Publish to Instagram from the hub","النشر على إنستغرام من المركز")}</b><small class="meta">${L("Turns on the Publish button, and posts that are Scheduled with an image go out automatically at their time.","يفعّل زر النشر، وتُنشر المنشورات المجدولة التي تحتوي صورة تلقائياً في وقتها.")}</small></span></label></article>`;
  }
  async function leadsPage() {
    [leadData,autoData]=await Promise.all([api.getLeads(),api.getAutomation().catch(()=>null)]);
    const u=leadData.usage;
    return sectionHead("leads",t("leadsNote"))+`${leadData.ready?"":`<p class="card card-pad error-text">${t("aiNotReady")}</p>`}
    ${autoBar()}<div class="ai-meters"><span>💳 ${t("aiSpend")}: <b>${money(u.spent)}</b> / ${money(u.cap)}</span><span>🔎 ${t("huntsToday")}: <b>${num(u.hunts)}</b> / ${num(u.huntLimit)}</span><span>💬 ${t("messagesToday")}: <b>${num(u.messages)}</b> / ${num(u.messageLimit)}</span></div>
    <article class="card card-pad agent-card"><header><span class="agent-emoji" aria-hidden="true">🔎</span><div><h2>${t("findLeads")}</h2><p class="meta">${L("Searches the web for businesses that match your Agent settings.","يبحث في الإنترنت عن أعمال تطابق إعدادات الوكيل.")} <a href="#agent">${t("agent")}</a></p></div></header><form id="hunt-form" class="hunt-form">
      <label>${t("emirate")}<select name="emirate">${EMIRATES.map(e=>`<option ${e==="Ras Al Khaimah"?"selected":""}>${e}</option>`).join("")}</select></label>
      <label class="grow">${t("focus")}<input name="focus" maxlength="300" dir="auto" placeholder="${t("focusHint")}"></label>
      <button class="btn primary" type="submit" ${leadData.ready?"":"disabled"}>${ic("search")}${t("findLeads")}</button>
    </form><p class="meta" id="hunt-status" role="status">${t("huntNote")}</p></article>
    <div class="tools">${picker("lead-filter","status",[["open","openLeads"],["all","allLeads"],...LEAD_STATUS],leadFilter)}</div>
    <div id="lead-list" class="lead-list"></div>
    <dialog id="confirm-dialog" aria-labelledby="confirm-title"><form method="dialog"><h2 id="confirm-title"></h2><div class="tools"><button class="btn" value="cancel" autofocus>${t("cancel")}</button><button class="btn reject" value="ok" id="confirm-ok"></button></div></form></dialog>`;
  }
  const kindName=k=>{const c=TYPE_CHIPS.find(x=>x[0]===k);return c?c[1]+" "+L(c[2],c[3]):({brand:L("Brand","علامة تجارية"),retail:L("Retail","متجر"),other:""})[k]??k;};
  function leadCard(l) {
    const link=(href,text,icon)=>href?`<a class="chip-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${ic(icon)}<bdi>${esc(text)}</bdi></a>`:"";
    const ig=l.instagram?"https://www.instagram.com/"+encodeURIComponent(l.instagram)+"/":"";
    const msg=l.message_en||l.message_ar;
    return `<article class="card card-pad lead" data-lead="${esc(l.id)}">
      <header class="lead-head"><div><h2 dir="auto">${esc(l.name)}</h2><p class="meta">${esc([kindName(l.kind),l.area,l.emirate].filter(Boolean).join(" · "))}</p></div>
      <span class="score" title="${t("fit")}">${num(l.score||0)}/10</span></header>
      <p dir="auto">${esc(l.why||"")}</p>${l.service?`<p class="meta"><b>${t("pitch")}:</b> <span dir="auto">${esc(l.service)}</span></p>`:""}
      <div class="lead-links">${link(ig,"@"+l.instagram,"instagram")}${link(l.website,(l.website||"").replace(/^https?:\/\/(www\.)?/,"").replace(/\/$/,""),"external")}${l.phone?`<a class="chip-link" href="tel:${esc(l.phone.replace(/[^+\d]/g,""))}">${ic("call")}<bdi>${esc(l.phone)}</bdi></a>`:""}${l.email?`<a class="chip-link" href="mailto:${esc(l.email)}">${ic("enquiries")}<bdi>${esc(l.email)}</bdi></a>`:""}${link(l.source_url,t("source"),"external")}</div>
      <div class="lead-actions"><label class="picker"><select data-lead-status aria-label="${t("status")}">${LEAD_STATUS.map(([v,k])=>`<option value="${v}" ${l.status===v?"selected":""}>${t(k)}</option>`).join("")}</select>${ic("down")}</label>
        <label class="picker"><select data-lead-channel aria-label="${t("writeMsg")}">${[["instagram","chInstagram"],["whatsapp","chWhatsapp"],["email","chEmail"]].map(([v,k])=>`<option value="${v}" ${(l.message_channel||"instagram")===v?"selected":""}>${t(k)}</option>`).join("")}</select>${ic("down")}</label>
        <button class="btn" type="button" data-lead-write ${leadData.ready?"":"disabled"}>${ic("plus")}${t(msg?"rewriteMsg":"writeMsg")}</button>
        <button class="icon-btn" type="button" data-lead-delete ${label(t("deleteLead"))}>${ic("trash")}</button></div>
      ${msg?`<div class="lead-msg">${l.message_subject?`<p class="meta"><b>${t("subjectLabel")}:</b> ${esc(l.message_subject)}</p>`:""}
        <div class="msg-pair"><div><textarea data-lead-text="message_en" dir="ltr" rows="6">${esc(l.message_en||"")}</textarea><button class="text-btn" type="button" data-copy="message_en">${t("copyEn")}</button></div>
        <div><textarea data-lead-text="message_ar" dir="rtl" lang="ar" rows="6">${esc(l.message_ar||"")}</textarea><button class="text-btn" type="button" data-copy="message_ar">${t("copyAr")}</button></div></div></div>`:""}
      <label class="lead-notes">${t("leadNotes")}<textarea data-lead-text="notes" dir="auto" rows="2" maxlength="2000">${esc(l.notes||"")}</textarea></label>
    </article>`;
  }
  function drawLeads() {
    const list=document.getElementById("lead-list");if(!list||!leadData)return;
    const rows=leadData.leads.filter(l=>leadFilter==="all"||(leadFilter==="open"?["new","contacted","replied"].includes(l.status):l.status===leadFilter));
    list.innerHTML=rows.map(leadCard).join("")||`<p class="card card-pad empty">${t("noLeads")}</p>`;
  }
  // ---------- Agent settings: chips, sliders and a live preview ----------
  const L=(en,arText)=>pick([en,arText]);
  const TYPE_CHIPS=[["cafe","☕","Cafés","المقاهي"],["coffee-b2b","🫘","Roasters & suppliers","المحامص والموردون"],["popup","🛍️","Pop-up markets","الأسواق المؤقتة"],["event","🎪","Events & festivals","الفعاليات والمهرجانات"],["restaurant","🍽️","Restaurants & bakeries","المطاعم والمخابز"],["fashion","👗","Fashion & beauty","الأزياء والتجميل"],["real-estate","🏠","Real estate","العقارات"],["automotive","🚗","Automotive","السيارات"],["wellness","🧘","Gyms & wellness","الرياضة والعافية"],["hospitality","🏨","Hotels & tourism","الفنادق والسياحة"]];
  const PREFER_CHIPS=[["new","✨","Newly opened","افتُتح حديثاً"],["weak-ig","📉","Weak Instagram","إنستغرام ضعيف"],["events","📣","Running events","لديه فعاليات"],["growing","📈","Growing","في توسّع"]];
  const EMIRATE_CHIPS=[["Ras Al Khaimah","رأس الخيمة"],["Dubai","دبي"],["Sharjah","الشارقة"],["Ajman","عجمان"],["Umm Al Quwain","أم القيوين"],["Abu Dhabi","أبوظبي"],["Fujairah","الفجيرة"],["All UAE","كل الإمارات"]];
  const TONE_SLIDERS=[["formal",["Casual","عفوي"],["Formal","رسمي"],[["Casual & friendly","عفوي وودود"],["Friendly but professional","ودود ومهني"],["Formal & polished","رسمي ومتقن"]]],
    ["direct",["Soft","هادئ"],["Direct sell","عرض مباشر"],[["Just start a chat","بدء محادثة فقط"],["Suggest a small next step","اقتراح خطوة صغيرة"],["Pitch and ask for a call","عرض وطلب مكالمة"]]],
    ["length",["Short","قصيرة"],["Detailed","مفصّلة"],[["Short","قصيرة"],["Medium","متوسطة"],["Detailed","مفصّلة"]]],
    ["energy",["Calm","هادئة"],["Upbeat","حماسية"],[["Calm","هادئة"],["Balanced","متوازنة"],["Upbeat","حماسية"]]]];
  const bandOf=(v,list)=>list[v<34?0:v<67?1:2];
  const chip=(type,name,value,checked,icon,text,dis)=>`<label class="chip"><input type="${type}" name="${name}" value="${esc(value)}" ${checked?"checked":""} ${dis}><span>${icon?`<i aria-hidden="true">${icon}</i>`:""}${esc(text)}</span></label>`;
  const slider=(name,value,min,max,left,right,out,dis,step=1)=>`<div class="slider-row"><div class="slider-top"><span>${left}</span><output data-out="${name}">${out}</output><span>${right}</span></div>
    <input type="range" name="${name}" min="${min}" max="${max}" step="${step}" value="${esc(value)}" ${dis} style="--fill:${(value-min)/(max-min)*100}%"></div>`;
  async function agentPage() {
    [agentData,autoData]=await Promise.all([api.getAgent(),api.getAutomation().catch(()=>null)]);
    const p=agentData.profile,edit=session.is_admin,dis=edit?"":"disabled",spent=agentData.spent||0,cap=agentData.cap;
    return sectionHead("agent",t("agentNote"))+(edit?"":`<p class="card card-pad meta">${ic("lock")} ${t("adminEdits")}</p>`)+`<form id="agent-form" class="agent-form" novalidate>
      <article class="card card-pad agent-card"><header><span class="agent-emoji" aria-hidden="true">🎯</span><div><h2>${L("Who the agent looks for","من يبحث عنه الوكيل")}</h2><p class="meta">${L("Tap to pick. The agent searches these first.","اضغط للاختيار. يبحث الوكيل عن هؤلاء أولاً.")}</p></div></header>
        <div class="chips">${TYPE_CHIPS.map(([v,i,en,a])=>chip("checkbox","types",v,p.types.includes(v),i,L(en,a),dis)).join("")}</div>
        <h3>${L("Main emirate","الإمارة الرئيسية")}</h3><div class="chips">${EMIRATE_CHIPS.map(([v,a])=>chip("radio","emirate",v,p.emirate===v,"",L(v,a),dis)).join("")}</div>
        <h3>${L("Look for businesses that are","ابحث عن أعمال")}</h3><div class="chips">${PREFER_CHIPS.map(([v,i,en,a])=>chip("checkbox","prefer",v,p.prefer.includes(v),i,L(en,a),dis)).join("")}</div>
        <div class="slider-grid">${slider("size",p.size,0,100,L("Small local","محلي صغير"),L("Big brands","علامات كبيرة"),pick(bandOf(p.size,[["Small & local","صغيرة ومحلية"],["Small to mid-size","صغيرة إلى متوسطة"],["Established brands","علامات معروفة"]])),dis)}
        ${slider("perRun",p.perRun,3,10,"3","10",num(p.perRun)+" "+L("leads per search","عملاء في كل بحث"),dis)}</div>
      </article>
      <article class="card card-pad agent-card"><header><span class="agent-emoji" aria-hidden="true">💬</span><div><h2>${L("How messages sound","أسلوب الرسائل")}</h2><p class="meta">${L("Slide to set the voice. The preview updates as you go.","حرّك لضبط الأسلوب. تتحدّث المعاينة فوراً.")}</p></div></header>
        <div class="voice-grid"><div class="slider-grid">${TONE_SLIDERS.map(([k,l,r,bands])=>slider(k,p[k],0,100,pick(l),pick(r),pick(bandOf(p[k],bands)),dis)).join("")}
          <label class="switch-row"><input type="checkbox" name="emoji" ${p.emoji?"checked":""} ${dis}><span class="toggle" aria-hidden="true"></span>${L("Use emojis","استخدام الرموز التعبيرية")} 😊</label>
          <label class="agent-field">${L("Sign-off","التوقيع")}<input name="signoff" maxlength="80" dir="auto" value="${esc(p.signoff)}" ${dis}></label></div>
          <div class="preview"><p class="meta">${ic("eye")} ${L("Preview · example café","معاينة · مقهى مثال")}</p><div class="bubble" id="voice-preview" dir="auto"></div><p class="meta small">${L("Real messages are written by the AI for each business, in English and Arabic.","يكتب الذكاء الاصطناعي الرسائل الفعلية لكل عمل بالإنجليزية والعربية.")}</p></div></div>
      </article>
      <article class="card card-pad agent-card"><header><span class="agent-emoji" aria-hidden="true">🧠</span><div><h2>${L("What the agent knows","ما يعرفه الوكيل")}</h2><p class="meta">${L("Optional details in your own words.","تفاصيل اختيارية بكلماتك.")}</p></div></header>
        <details><summary>${L("About Nostrix","عن نوستريكس")}</summary><textarea name="about" rows="6" dir="auto" maxlength="3000" ${dis}>${esc(p.about)}</textarea></details>
        <details><summary>${L("Never contact","لا تتواصل مع")}</summary><textarea name="avoid" rows="3" dir="auto" maxlength="3000" ${dis}>${esc(p.avoid)}</textarea></details>
        <details><summary>${L("Extra search instructions","تعليمات إضافية للبحث")}</summary><textarea name="huntRules" rows="3" dir="auto" maxlength="3000" placeholder="${L("e.g. only places that opened in the last 6 months","مثال: الأماكن التي افتُتحت خلال آخر 6 أشهر فقط")}" ${dis}>${esc(p.huntRules)}</textarea></details>
        <details><summary>${L("Extra writing rules","قواعد إضافية للكتابة")}</summary><textarea name="rules" rows="3" dir="auto" maxlength="3000" placeholder="${t("agRulesHint")}" ${dis}>${esc(p.rules)}</textarea></details>
      </article>
      <article class="card card-pad agent-card"><header><span class="agent-emoji" aria-hidden="true">💳</span><div><h2>${L("Monthly budget","الميزانية الشهرية")}</h2><p class="meta">${t("agCapHint")}</p></div></header>
        <div class="budget"><div class="budget-bar"><span style="width:${Math.min(100,spent/cap*100)}%"></span></div><p class="meta">${L("Used this month","المستخدم هذا الشهر")}: <b>${money(spent)}</b></p></div>
        ${slider("cap",Math.min(cap,40),5,40,"$5","$40",money(cap).replace(".00",""),dis)}
      </article>
      ${edit?`<div class="save-bar" id="agent-save" hidden><span>${L("You have unsaved changes","لديك تغييرات غير محفوظة")}</span><button class="btn" type="button" data-agent-reset>${t("resetAgent")}</button><button class="btn primary" type="submit">${ic("check")}${t("saveAgent")}</button></div>`:""}
      <p role="alert" class="error-text" id="agent-error"></p></form>
      ${autoCard()}
      <dialog id="confirm-dialog" aria-labelledby="confirm-title"><form method="dialog"><h2 id="confirm-title"></h2><div class="tools"><button class="btn" value="cancel" autofocus>${t("cancel")}</button><button class="btn reject" value="ok" id="confirm-ok"></button></div></form></dialog>`;
  }
  function agentValues(form) {
    const f=new FormData(form),n=k=>Number(f.get(k));
    return {types:f.getAll("types"),prefer:f.getAll("prefer"),emirate:f.get("emirate")||"Ras Al Khaimah",size:n("size"),perRun:n("perRun"),formal:n("formal"),direct:n("direct"),length:n("length"),energy:n("energy"),
      emoji:form.elements.emoji.checked,signoff:f.get("signoff")||"",about:f.get("about")||"",avoid:f.get("avoid")||"",huntRules:f.get("huntRules")||"",rules:f.get("rules")||"",cap:n("cap")};
  }
  // A quick, local sample so people can feel the voice. It is not AI output.
  function voicePreview(v) {
    const e=v.emoji,en=!ar(),band=x=>x<34?0:x<67?1:2;
    const hello=en?["Hey Bloom Coffee team!"+(e?" 👋":""),"Hi Bloom Coffee team,","Dear Bloom Coffee team,"]:["أهلاً فريق بلوم كوفي!"+(e?" 👋":""),"مرحباً فريق بلوم كوفي،","فريق بلوم كوفي المحترم،"];
    const notice=en?["Loved the new pour-over bar you just opened"+(e?" ☕":"")+".","We noticed your new pour-over bar.","We noticed the recent opening of your pour-over bar."]:["أعجبنا ركن القهوة المقطّرة الجديد"+(e?" ☕":"")+".","لاحظنا ركن القهوة المقطّرة الجديد لديكم.","لاحظنا افتتاح ركن القهوة المقطّرة لديكم مؤخراً."];
    const energy=en?["","It looks great.","It looks amazing, the space has so much character!"+(e?" ✨":"")]:["","يبدو رائعاً.","يبدو مذهلاً، المكان مليء بالشخصية!"+(e?" ✨":"")];
    const pitch=en?["We're Nostrix, a creative team in RAK. Would love to hear how you share it online.","We're Nostrix, a creative team in RAK. Happy to share a few photo and reel ideas for it if useful.","We're Nostrix, a creative team in RAK. We'd like to shoot a reel and photo set for the launch. Could we book a quick 10-minute call this week?"]:["نحن نوستريكس، فريق إبداعي في رأس الخيمة. يسعدنا أن نعرف كيف تشاركونه على الإنترنت.","نحن نوستريكس، فريق إبداعي في رأس الخيمة. يسعدنا مشاركة بعض أفكار الصور والريلز إن كان ذلك مفيداً.","نحن نوستريكس، فريق إبداعي في رأس الخيمة. نودّ تصوير ريل ومجموعة صور للافتتاح. هل يمكننا حجز مكالمة قصيرة هذا الأسبوع؟"];
    const extra=en?["","","Our portfolio is at nostrix.ae/portfolio, with recent café and event work."]:["","","أعمالنا على nostrix.ae/portfolio، ومنها أعمال حديثة لمقاهٍ وفعاليات."];
    const parts=[hello[band(v.formal)],[notice[band(v.formal)],energy[band(v.energy)]].filter(Boolean).join(" "),pitch[band(v.direct)],extra[band(v.length)],(band(v.length)>0?"":"")+"— "+(v.signoff||"Nostrix Team")];
    return parts.filter(Boolean).map(x=>`<p>${esc(x)}</p>`).join("");
  }
  function syncAgent(form,dirty) {
    const v=agentValues(form);
    form.querySelectorAll('input[type="range"]').forEach(r=>{
      r.style.setProperty("--fill",(r.value-r.min)/(r.max-r.min)*100+"%");
      const out=form.querySelector(`[data-out="${r.name}"]`),x=Number(r.value);if(!out)return;
      const tone=TONE_SLIDERS.find(s=>s[0]===r.name);
      out.textContent=tone?pick(bandOf(x,tone[3])):r.name==="size"?pick(bandOf(x,[["Small & local","صغيرة ومحلية"],["Small to mid-size","صغيرة إلى متوسطة"],["Established brands","علامات معروفة"]])):r.name==="perRun"?num(x)+" "+L("leads per search","عملاء في كل بحث"):"$"+x;
    });
    const pv=document.getElementById("voice-preview");if(pv)pv.innerHTML=voicePreview(v);
    if(dirty){const bar=document.getElementById("agent-save");if(bar)bar.hidden=false;}
  }
  const aiError=error=>error.detail||t(T[error.message]?error.message:"unavailable");
  // ---------- Social: Instagram and TikTok analytics ----------
  let socialData=null, socialTab="overview", socialSort="top", socialNotice=null;
  const compact=v=>v==null||isNaN(v)?"—":new Intl.NumberFormat(locale(),{notation:"compact",maximumFractionDigits:1}).format(v);
  const pct=v=>v==null||!isFinite(v)?"—":new Intl.NumberFormat(locale(),{style:"percent",maximumFractionDigits:v<0.1?2:1}).format(v);
  const PLAT={instagram:{name:"Instagram",icon:"instagram"},tiktok:{name:"TikTok",icon:"tiktok"}};
  const KINDS={reel:["Reels","ريلز"],photo:["Photos","صور"],carousel:["Carousels","منشورات متعددة"],video:["Videos","فيديوهات"]};
  const DAYS=[["Sun","الأحد"],["Mon","الاثنين"],["Tue","الثلاثاء"],["Wed","الأربعاء"],["Thu","الخميس"],["Fri","الجمعة"],["Sat","السبت"]];
  const SLOTS=[["Morning 6–10","الصباح 6–10",6,10],["Midday 10–14","الظهيرة 10–14",10,14],["Afternoon 14–18","العصر 14–18",14,18],["Evening 18–22","المساء 18–22",18,22],["Night 22–6","الليل 22–6",22,30]];
  const dubai=iso=>new Date(Date.parse(iso)+4*3600e3);
  const inter=x=>(x.likes||0)+(x.comments||0)+(x.shares||0);
  const avg=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:null;
  // The number that says how well a post did: views on TikTok, interactions on Instagram.
  const score=(p,x)=>p==="tiktok"&&x.views!=null?x.views:inter(x);
  function socialStats(p,d) {
    const items=(d.items||[]).filter(x=>x.at);
    const rate=p==="tiktok"
      ? avg(items.filter(x=>x.views).map(x=>inter(x)/x.views))
      : (d.followers?avg(items.map(x=>inter(x)/d.followers)):null);
    const h=d.history||[], last=h[h.length-1];
    const delta=days=>{if(!last||h.length<2)return null;const cut=offsetDate(last.day,-days);const base=h.find(r=>r.day>=cut);return base&&base!==last?last.followers-base.followers:null;};
    const recent=items.filter(x=>Date.now()-Date.parse(x.at)<30*864e5).length;
    const byDay=DAYS.map((_,i)=>avg(items.filter(x=>dubai(x.at).getUTCDay()===i).map(x=>score(p,x))));
    const bySlot=SLOTS.map(([, ,a,b])=>avg(items.filter(x=>{const hr=dubai(x.at).getUTCHours(),v=hr<6?hr+24:hr;return v>=a&&v<b;}).map(x=>score(p,x))));
    const kinds=Object.keys(KINDS).map(k=>[k,items.filter(x=>x.kind===k)]).filter(([,a])=>a.length);
    return {items,rate,d7:delta(7),d30:delta(30),recent,byDay,bySlot,kinds,
      avgLikes:avg(items.map(x=>x.likes||0)),avgComments:avg(items.map(x=>x.comments||0)),avgViews:p==="tiktok"?avg(items.map(x=>x.views||0)):null,avgScore:avg(items.map(x=>score(p,x)))};
  }
  function socialTips(p,d,s) {
    const tips=[],unit=p==="tiktok"?L("views","مشاهدة"):L("interactions","تفاعل");
    const best=(arr,names)=>{let i=-1,v=-1;arr.forEach((x,j)=>{if(x!=null&&x>v){v=x;i=j;}});return i<0?null:{name:pick(names[i]),v};};
    const day=best(s.byDay,DAYS),slot=best(s.bySlot,SLOTS.map(x=>[x[0],x[1]]));
    if(day&&s.items.length>=5)tips.push(["📅",L(`Your posts on ${day.name} get the most ${unit} on average (${compact(Math.round(day.v))}).`,`منشوراتك يوم ${day.name} تحصل على أعلى ${unit} في المتوسط (${compact(Math.round(day.v))}).`)]);
    if(slot&&s.items.length>=5)tips.push(["⏰",L(`Best time slot so far: ${slot.name} (UAE time).`,`أفضل وقت حتى الآن: ${slot.name} (بتوقيت الإمارات).`)]);
    if(s.kinds.length>1){const r=s.kinds.map(([k,a])=>[k,avg(a.map(x=>score(p,x)))]).sort((a,b)=>b[1]-a[1]);const[top,low]=[r[0],r[r.length-1]];
      if(low[1]>0)tips.push(["🎬",L(`${pick(KINDS[top[0]])} get ${(top[1]/low[1]).toFixed(1)}× more ${unit} than ${pick(KINDS[low[0]]).toLowerCase()}.`,`${pick(KINDS[top[0]])} تحصل على ${(top[1]/low[1]).toFixed(1)}× ${unit} أكثر من ${pick(KINDS[low[0]])}.`)]);}
    tips.push(["🗓️",s.recent>=8?L(`Great rhythm: ${s.recent} posts in the last 30 days.`,`إيقاع ممتاز: ${s.recent} منشوراً خلال آخر 30 يوماً.`):L(`${s.recent} posts in the last 30 days. Accounts that post 3–4 times a week usually grow faster.`,`${s.recent} منشورات خلال آخر 30 يوماً. الحسابات التي تنشر 3–4 مرات أسبوعياً تنمو عادةً أسرع.`)]);
    const top=[...s.items].sort((a,b)=>score(p,b)-score(p,a))[0];
    if(top&&s.avgScore)tips.push(["🔥",L(`Your top post did ${(score(p,top)/s.avgScore).toFixed(1)}× your average. Make more like it.`,`أفضل منشور لك حقق ${(score(p,top)/s.avgScore).toFixed(1)}× متوسطك. اصنع المزيد مثله.`)]);
    if(s.d30!=null)tips.push([s.d30>=0?"📈":"📉",L(`${s.d30>=0?"+":""}${num(s.d30)} followers in the last 30 days.`,`${s.d30>=0?"+":""}${num(s.d30)} متابعاً خلال آخر 30 يوماً.`)]);
    return tips;
  }
  // Charts: one measure each, brand colour, hover tooltips (data-tip).
  function barChart(rows,fmt=compact) {
    const max=Math.max(1,...rows.map(r=>r.v||0));
    if(!rows.some(r=>r.v))return `<p class="empty chart-empty">${L("Not enough posts yet.","لا توجد منشورات كافية بعد.")}</p>`;
    return `<div class="bars" role="img">${rows.map(r=>`<div class="bar-col" data-tip="${esc(r.label)}: ${esc(r.v==null?"—":fmt(r.v))}"><div class="bar-track"><div class="bar ${r.hi?"hi":""}" style="height:${r.v?Math.max(2,r.v/max*100):0}%"></div></div><span>${esc(r.short||"")}</span></div>`).join("")}</div>`;
  }
  function lineChart(points) {
    if(points.length<2)return `<p class="empty chart-empty">${L("Follower history starts today. Check back tomorrow to see growth.","يبدأ سجل المتابعين اليوم. عد غداً لرؤية النمو.")}</p>`;
    const W=600,H=180,vals=points.map(p=>p.v),min=Math.min(...vals),max=Math.max(...vals),span=Math.max(1,max-min);
    const xy=points.map((p,i)=>[i/(points.length-1)*W,H-8-((p.v-min)/span)*(H-28)]);
    const d=xy.map((q,i)=>(i?"L":"M")+q[0].toFixed(1)+","+q[1].toFixed(1)).join(" ");
    return `<svg class="viz" viewBox="0 0 ${W} ${H}" role="img" preserveAspectRatio="none">
      <defs><linearGradient id="vizfade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--brand-a)" stop-opacity=".28"/><stop offset="1" stop-color="var(--brand-a)" stop-opacity="0"/></linearGradient></defs>
      <path d="${d} L${W},${H} L0,${H} Z" fill="url(#vizfade)"/><path d="${d}" class="viz-line"/>
      ${xy.map((q,i)=>`<g class="viz-col" data-tip="${esc(date(points[i].day))}: ${esc(num(points[i].v))}"><rect class="viz-hit" x="${q[0]-W/points.length/2}" y="0" width="${W/points.length}" height="${H}"/><circle cx="${q[0]}" cy="${q[1]}" r="4" class="viz-dot"/></g>`).join("")}
      </svg><div class="viz-ends"><span>${esc(date(points[0].day))}</span><span>${esc(date(points[points.length-1].day))}</span></div>`;
  }
  function heatmap(p,items) {
    const cells=DAYS.map((_,d)=>SLOTS.map(([, ,a,b])=>avg(items.filter(x=>{const t=dubai(x.at),hr=t.getUTCHours(),v=hr<6?hr+24:hr;return t.getUTCDay()===d&&v>=a&&v<b;}).map(x=>score(p,x)))));
    const max=Math.max(1,...cells.flat().filter(v=>v!=null));
    if(!cells.flat().some(v=>v))return `<p class="empty chart-empty">${L("Not enough posts yet.","لا توجد منشورات كافية بعد.")}</p>`;
    return `<div class="heat" role="img"><span></span>${SLOTS.map(n=>`<span class="heat-h">${esc(pick([n[0],n[1]]).split(" ")[0])}</span>`).join("")}
      ${DAYS.map((dn,d)=>`<span class="heat-d">${esc(pick(dn))}</span>${cells[d].map((v,i)=>`<div class="heat-c" style="--a:${v==null?0:.12+.88*v/max}" data-tip="${esc(pick(dn))} · ${esc(pick([SLOTS[i][0],SLOTS[i][1]]))}: ${v==null?L("no posts","لا منشورات"):compact(Math.round(v))}"></div>`).join("")}`).join("")}</div>
      <div class="heat-key"><span>${L("Fewer","أقل")}</span><i></i><span>${L("More","أكثر")}</span></div>`;
  }
  function hbars(rows,fmt=compact) {
    const max=Math.max(1,...rows.map(r=>r.v||0));
    if(!rows.length)return `<p class="empty chart-empty">${L("Not enough data yet.","لا توجد بيانات كافية بعد.")}</p>`;
    return `<div class="hbars">${rows.map(r=>`<div class="hbar" data-tip="${esc(r.tip||r.label)}"><span dir="auto">${esc(r.label)}</span><div><i style="width:${Math.max(2,(r.v||0)/max*100)}%"></i></div><b>${esc(fmt(r.v))}</b></div>`).join("")}</div>`;
  }
  function mixBar(parts) {
    const total=parts.reduce((n,x)=>n+(x.v||0),0);
    if(!total)return `<p class="empty chart-empty">${L("No interactions yet.","لا توجد تفاعلات بعد.")}</p>`;
    return `<div class="mix">${parts.filter(x=>x.v).map((x,i)=>`<i class="m${i}" style="flex:${x.v}" data-tip="${esc(x.label)}: ${compact(x.v)} (${pct(x.v/total)})"></i>`).join("")}</div>
      <ul class="mix-key">${parts.map((x,i)=>`<li><i class="m${i}"></i><span>${esc(x.label)}</span><b>${pct(x.v/total)}</b><small>${compact(x.v)}</small></li>`).join("")}</ul>`;
  }
  function sparkline(h) {
    if(!h||h.length<2)return "";
    const v=h.map(r=>r.followers),mn=Math.min(...v),sp=Math.max(1,Math.max(...v)-mn);
    const d=v.map((y,i)=>(i?"L":"M")+(i/(v.length-1)*100).toFixed(1)+","+(28-(y-mn)/sp*24).toFixed(1)).join(" ");
    return `<svg class="spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><path d="${d}"/></svg>`;
  }
  function weekly(items) {
    const weeks=Array.from({length:12},(_,i)=>{const end=Date.now()-(11-i)*7*864e5,start=end-7*864e5;return {n:items.filter(x=>{const t=Date.parse(x.at);return t>start&&t<=end;}).length,start};});
    return weeks.map((w,i)=>({v:w.n,label:L("Week of ","أسبوع ")+date(new Date(w.start).toISOString()),short:i%3===0?date(new Date(w.start).toISOString()):"",fmtCount:true}));
  }
  function captionBuckets(p,items) {
    const B=[[L("Short (<60)","قصير (<60)"),0,60],[L("Medium (60–200)","متوسط (60–200)"),60,200],[L("Long (200+)","طويل (+200)"),200,1e9]];
    return B.map(([l,a,b])=>{const g=items.filter(x=>(x.caption||"").length>=a&&(x.caption||"").length<b);return {v:avg(g.map(x=>score(p,x))),label:l+" · "+g.length,short:l.split(" ")[0]};});
  }
  function hashtagRows(p,items) {
    const m=new Map();
    items.forEach(x=>((x.caption||"").match(/#[\p{L}\p{N}_]+/gu)||[]).forEach(tag=>{const k=tag.toLowerCase();const e=m.get(k)||{n:0,s:0};e.n++;e.s+=score(p,x);m.set(k,e);}));
    return [...m].filter(([,e])=>e.n>=2).map(([k,e])=>({label:k,v:e.s/e.n,tip:k+" · "+e.n+" "+L("posts","منشورات")})).sort((a,b)=>b.v-a.v).slice(0,8);
  }
  function durationBuckets(items) {
    const B=[["<15s",0,15],["15–30s",15,30],["30–60s",30,60],["1–3m",60,180],["3m+",180,1e9]];
    return B.map(([l,a,b])=>{const g=items.filter(x=>x.duration!=null&&x.duration>=a&&x.duration<b);return {v:avg(g.map(x=>x.views||0)),label:l+" · "+g.length+" "+L("videos","فيديو"),short:l};});
  }
  const kpi=(label,value,foot="",tone="")=>`<div class="kpi ${tone}"><span>${label}</span><strong>${value}</strong>${foot?`<small>${foot}</small>`:""}</div>`;
  const delta=v=>v==null?"":`<em class="${v<0?"down":"up"}">${v>0?"+":""}${num(v)}</em>`;
  function connectCard(p,d) {
    const P=PLAT[p];
    if(!d.ready)return `<article class="card card-pad social-connect"><div class="brand-badge ${p}">${ic(P.icon)}</div><h2>${P.name}</h2><p class="meta">${L("The app keys for this platform are not set up in Cloudflare yet.","مفاتيح التطبيق لهذه المنصة غير مُعدّة في Cloudflare بعد.")}</p></article>`;
    return `<article class="card card-pad social-connect"><div class="brand-badge ${p}">${ic(P.icon)}</div><h2>${L("Connect "+P.name,"اربط "+P.name)}</h2>
      <p class="meta">${L("See followers, growth, engagement, your best times to post and your top content, all in one place.","شاهد المتابعين والنمو والتفاعل وأفضل أوقات النشر وأفضل محتوى في مكان واحد.")}</p>
      ${session.is_admin?`<a class="btn primary" href="/api/social/${p}/connect">${ic(P.icon)}${L("Connect "+P.name,"اربط "+P.name)}</a>`:`<p class="meta">${t("adminEdits")}</p>`}
      <p class="meta small">${L("You log in on "+P.name+"'s own page. Nostrix never sees your password.","تسجّل الدخول من صفحة "+P.name+" نفسها، ولا ترى نوستريكس كلمة مرورك.")}</p>
      ${p==="instagram"&&session.is_admin?`<details class="token-box"><summary>${L("Or connect with a Meta token","أو اربط باستخدام رمز من Meta")}</summary>
        <form id="ig-token-form" class="hub-form" autocomplete="off"><label>${L("System-user token","رمز مستخدم النظام")}<input name="token" type="password" autocomplete="off" spellcheck="false" required placeholder="EAA…"></label>
        <label>${L("Instagram account ID","معرّف حساب إنستغرام")}<input name="igId" inputmode="numeric" placeholder="17841…"></label>
        <p class="meta small">${L("Saved only on the server and never shown again.","يُحفظ على الخادم فقط ولن يظهر مرة أخرى.")}</p>
        <div class="tools"><button class="btn primary" type="submit">${L("Connect","ربط")}</button><span class="meta" id="ig-token-status" role="status"></span></div></form></details>`:""}</article>`;
  }
  function postCard(p,x) {
    return `<a class="post" href="${esc(x.url||"#")}" target="_blank" rel="noopener noreferrer">
      <div class="post-media">${x.image?`<img src="${esc(x.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:""}<span class="post-kind">${esc(pick(KINDS[x.kind]||KINDS.photo))}</span>
      <div class="post-over">${x.views!=null?`<span>▶ ${compact(x.views)}</span>`:""}<span>♥ ${compact(x.likes)}</span><span>💬 ${compact(x.comments)}</span>${x.shares!=null?`<span>↗ ${compact(x.shares)}</span>`:""}</div></div>
      <p dir="auto">${esc(x.caption||"")}</p><small class="meta">${x.at?esc(date(x.at)):""}</small></a>`;
  }
  function platformView(p) {
    const d=socialData[p],P=PLAT[p];
    if(!d.connected)return connectCard(p,d);
    if(d.error)return `<article class="card card-pad social-connect"><div class="brand-badge ${p}">${ic(P.icon)}</div><h2>${P.name}</h2><p class="error-text">${esc(d.error)}</p>
      ${session.is_admin?`<div class="tools"><a class="btn primary" href="/api/social/${p}/connect">${L("Reconnect","إعادة الربط")}</a><button class="btn" type="button" data-social-disconnect="${p}">${L("Disconnect","إلغاء الربط")}</button></div>`:""}</article>`;
    const s=socialStats(p,d),ins=d.insights||{};
    const posts=[...s.items].sort(socialSort==="top"?(a,b)=>score(p,b)-score(p,a):(a,b)=>Date.parse(b.at)-Date.parse(a.at));
    const recent=[...s.items].sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)).slice(-20);
    const tiles=[
      kpi(L("Followers","المتابعون"),compact(d.followers),[s.d7!=null?delta(s.d7)+" "+L("7 days","7 أيام"):"",s.d30!=null?delta(s.d30)+" "+L("30 days","30 يوماً"):""].filter(Boolean).join(" · ")||L("Tracking from today","التتبع من اليوم"),"main"),
      kpi(L("Engagement rate","معدل التفاعل"),pct(s.rate),p==="tiktok"?L("of views","من المشاهدات"):L("of followers, per post","من المتابعين لكل منشور")),
      p==="tiktok"?kpi(L("Avg views","متوسط المشاهدات"),compact(s.avgViews),L("per video","لكل فيديو")):kpi(L("Reach · 28 days","الوصول · 28 يوماً"),compact(ins.reach),ins.reach==null?L("Needs insights permission","يتطلب صلاحية الإحصاءات"):""),
      kpi(L("Avg likes","متوسط الإعجابات"),compact(s.avgLikes),L("per post","لكل منشور")),
      kpi(L("Avg comments","متوسط التعليقات"),compact(s.avgComments),L("per post","لكل منشور")),
      p==="tiktok"?kpi(L("Total likes","إجمالي الإعجابات"),compact(d.likes),""):kpi(L("Profile views · 28 days","مشاهدات الملف · 28 يوماً"),compact(ins.profile_views),""),
      kpi(L("Posts","المنشورات"),compact(d.posts),num(s.recent)+" "+L("in 30 days","خلال 30 يوماً"))
    ].join("");
    return `<article class="card card-pad social-hero ${p}">
        <div class="social-id">${d.avatar?`<img src="${esc(d.avatar)}" alt="" referrerpolicy="no-referrer">`:`<span class="brand-badge ${p}">${ic(P.icon)}</span>`}
          <div><h2>${esc(d.name||d.username)}</h2><a class="meta" href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">@${esc(d.username)} ${ic("external")}</a></div>
          ${session.is_admin?`<button class="btn subtle" type="button" data-social-disconnect="${p}">${L("Disconnect","إلغاء الربط")}</button>`:""}</div>
        <div class="kpis">${tiles}</div></article>
      <div class="social-grid">
        <article class="card card-pad"><h2>${L("Follower growth","نمو المتابعين")}</h2>${lineChart((d.history||[]).map(r=>({day:r.day,v:r.followers})))}</article>
        <article class="card card-pad tips"><h2>${L("Insights","رؤى")}</h2><ul>${socialTips(p,d,s).map(([i,txt])=>`<li><span aria-hidden="true">${i}</span><p>${esc(txt)}</p></li>`).join("")}</ul></article>
        <article class="card card-pad wide"><h2>${p==="tiktok"?L("Views per video · last 20","المشاهدات لكل فيديو · آخر 20"):L("Interactions per post · last 20","التفاعل لكل منشور · آخر 20")}</h2>${barChart(recent.map((x,i)=>({v:score(p,x),label:(x.caption||"").slice(0,40)||date(x.at),short:i%4===0?date(x.at):""})))}</article>
        <article class="card card-pad"><h2>${L("Best day to post","أفضل يوم للنشر")}</h2><p class="meta">${p==="tiktok"?L("Average views","متوسط المشاهدات"):L("Average interactions","متوسط التفاعل")} · ${L("UAE time","بتوقيت الإمارات")}</p>${barChart(DAYS.map((n,i)=>({v:s.byDay[i],label:pick(n),short:pick(n),hi:s.byDay[i]!=null&&s.byDay[i]===Math.max(...s.byDay.filter(v=>v!=null))})))}</article>
        <article class="card card-pad"><h2>${L("Best time to post","أفضل وقت للنشر")}</h2><p class="meta">${L("UAE time","بتوقيت الإمارات")}</p>${barChart(SLOTS.map((n,i)=>({v:s.bySlot[i],label:pick([n[0],n[1]]),short:pick([n[0],n[1]]).split(" ")[0],hi:s.bySlot[i]!=null&&s.bySlot[i]===Math.max(...s.bySlot.filter(v=>v!=null))})))}</article>
        ${s.kinds.length>1?`<article class="card card-pad"><h2>${L("What works best","ما الأفضل أداءً")}</h2><p class="meta">${L("Average per post by format","المتوسط لكل منشور حسب النوع")}</p>${barChart(s.kinds.map(([k,a])=>({v:avg(a.map(x=>score(p,x))),label:pick(KINDS[k])+" ("+a.length+")",short:pick(KINDS[k])})))}</article>`:""}
        <article class="card card-pad wide"><h2>${L("When your audience responds","متى يتفاعل جمهورك")}</h2><p class="meta">${p==="tiktok"?L("Average views by day and time","متوسط المشاهدات حسب اليوم والوقت"):L("Average interactions by day and time","متوسط التفاعل حسب اليوم والوقت")} · ${L("UAE time","بتوقيت الإمارات")}</p>${heatmap(p,s.items)}</article>
        <article class="card card-pad"><h2>${L("Engagement mix","توزيع التفاعل")}</h2><p class="meta">${L("How people interact with your posts","كيف يتفاعل الناس مع منشوراتك")}</p>${mixBar([{label:L("Likes","إعجابات"),v:s.items.reduce((n,x)=>n+(x.likes||0),0)},{label:L("Comments","تعليقات"),v:s.items.reduce((n,x)=>n+(x.comments||0),0)},...(p==="tiktok"?[{label:L("Shares","مشاركات"),v:s.items.reduce((n,x)=>n+(x.shares||0),0)}]:[])])}</article>
        <article class="card card-pad"><h2>${L("Posting rhythm","إيقاع النشر")}</h2><p class="meta">${L("Posts per week · last 12 weeks","منشورات أسبوعياً · آخر 12 أسبوعاً")}</p>${barChart(weekly(s.items),v=>num(v))}</article>
        <article class="card card-pad"><h2>${L("Caption length","طول التعليق")}</h2><p class="meta">${L("Does writing more help?","هل الكتابة الأطول تساعد؟")}</p>${barChart(captionBuckets(p,s.items))}</article>
        ${p==="tiktok"?`<article class="card card-pad"><h2>${L("Video length","طول الفيديو")}</h2><p class="meta">${L("Average views by length","متوسط المشاهدات حسب الطول")}</p>${barChart(durationBuckets(s.items))}</article>`:""}
        <article class="card card-pad"><h2>${L("Top hashtags","أفضل الوسوم")}</h2><p class="meta">${L("Average per post, used 2+ times","المتوسط لكل منشور، مستخدم مرتين على الأقل")}</p>${hbars(hashtagRows(p,s.items))}</article>
      </div>
      <article class="card card-pad"><header class="card-head"><h2>${L("Posts","المنشورات")}</h2><div class="seg" role="group">${[["top",L("Top","الأفضل")],["recent",L("Recent","الأحدث")]].map(([k,l])=>`<button type="button" data-social-sort="${k}" class="${socialSort===k?"on":""}">${l}</button>`).join("")}</div></header>
        <div class="post-grid">${posts.slice(0,24).map(x=>postCard(p,x)).join("")||`<p class="empty">${L("No posts yet.","لا توجد منشورات بعد.")}</p>`}</div></article>`;
  }
  function socialOverview() {
    const cards=["instagram","tiktok"].map(p=>{const d=socialData[p],P=PLAT[p];
      if(!d.connected||d.error)return connectCard(p,d);
      const s=socialStats(p,d);
      return `<article class="card card-pad social-mini ${p}" data-social-open="${p}"><header><span class="brand-badge ${p}">${ic(P.icon)}</span><div><h2>${P.name}</h2><span class="meta">@${esc(d.username)}</span></div></header>
        <div class="kpis small">${kpi(L("Followers","المتابعون"),compact(d.followers),s.d30!=null?delta(s.d30)+" "+L("30 days","30 يوماً"):"")}${kpi(L("Engagement","التفاعل"),pct(s.rate))}${kpi(L("Posts · 30 days","منشورات · 30 يوماً"),num(s.recent))}</div>
        ${sparkline(d.history)}<span class="text-btn">${L("Open full dashboard","افتح اللوحة الكاملة")} →</span></article>`;}).join("");
    const live=["instagram","tiktok"].filter(p=>socialData[p].connected&&!socialData[p].error);
    const total=live.reduce((n,p)=>n+(socialData[p].followers||0),0);
    return (live.length?`<article class="card card-pad audience"><span class="meta">${L("Total audience","إجمالي الجمهور")}</span><strong>${compact(total)}</strong><span class="meta">${L("followers across","متابع على")} ${live.map(p=>PLAT[p].name).join(" + ")}</span>
      ${live.length>1?mixBar(live.map(p=>({label:PLAT[p].name,v:socialData[p].followers||0}))):""}</article>`:"")+`<div class="social-pair">${cards}</div>`;
  }
  async function socialPage(fresh=false) {
    socialData=await api.getSocial(fresh);
    const q=new URLSearchParams(location.search);
    if(q.has("social_ok")||q.has("social_error")){socialNotice=q.has("social_ok")?["ok",L(PLAT[q.get("social_ok")]?.name+" connected.","تم ربط "+PLAT[q.get("social_ok")]?.name+".")]:["bad",q.get("social_error")];if(q.get("social_ok"))socialTab=q.get("social_ok");history.replaceState(null,"",location.pathname+location.hash);}
    const tabs=[["overview",L("Overview","نظرة عامة")],["instagram","Instagram"],["tiktok","TikTok"]];
    const note=socialNotice?`<p class="card card-pad notice ${socialNotice[0]}" role="status">${esc(socialNotice[1])}</p>`:"";socialNotice=null;
    return sectionHead("social",L("Your Instagram and TikTok in one place, with the insights the apps don't show you.","إنستغرام وتيك توك في مكان واحد، مع رؤى لا تعرضها التطبيقات."))+note+
      `<div class="social-bar"><div class="seg big" role="tablist">${tabs.map(([k,l])=>`<button type="button" role="tab" aria-selected="${socialTab===k}" data-social-tab="${k}" class="${socialTab===k?"on":""}">${k==="overview"?"":ic(PLAT[k].icon)}${l}</button>`).join("")}</div>
      <span class="meta">${L("Updated","آخر تحديث")} ${esc(date(socialData.at,{hour:"2-digit",minute:"2-digit"}))}</span><button class="btn" type="button" data-social-refresh>${L("Refresh","تحديث")}</button></div>
      <div id="social-body">${socialTab==="overview"?socialOverview():platformView(socialTab)}</div><div class="viz-tip" id="viz-tip" hidden></div>
      <dialog id="confirm-dialog" aria-labelledby="confirm-title"><form method="dialog"><h2 id="confirm-title"></h2><div class="tools"><button class="btn" value="cancel" autofocus>${t("cancel")}</button><button class="btn reject" value="ok" id="confirm-ok"></button></div></form></dialog>`;
  }
  const redrawSocial=()=>{const b=document.getElementById("social-body");if(b&&socialData)b.innerHTML=socialTab==="overview"?socialOverview():platformView(socialTab);
    app.querySelectorAll("[data-social-tab]").forEach(x=>{const on=x.dataset.socialTab===socialTab;x.classList.toggle("on",on);x.setAttribute("aria-selected",on);});};
  // ================= Planner, reply helper, sales, follow-ups and alerts =================
  const CONFIRM_HTML=`<dialog id="confirm-dialog" aria-labelledby="confirm-title"><form method="dialog"><h2 id="confirm-title"></h2><div class="tools"><button class="btn" value="cancel" autofocus>${"Cancel"}</button><button class="btn reject" value="ok" id="confirm-ok"></button></div></form></dialog>`;
  const hubDialog=()=>`<dialog class="hub-dialog" id="hub-dialog"></dialog>`;
  const cur$=(c,v)=>(c||"AED")+" "+new Intl.NumberFormat("en-AE",{minimumFractionDigits:0,maximumFractionDigits:2}).format(Number(v)||0);
  const openDialog=html=>{const d=document.getElementById("hub-dialog");if(!d)return null;d.innerHTML=html;d.showModal();return d;};
  const closeDialog=()=>document.getElementById("hub-dialog")?.close();
  const pairBox=(r,waText)=>`<div class="pair-out">${r.note?`<p class="meta">💡 ${esc(r.note)}</p>`:""}<div class="msg-pair">
    <div><textarea dir="ltr" rows="7" data-pair="en">${esc(r.en||"")}</textarea><div class="tools"><button class="text-btn" type="button" data-copy-pair="en">${L("Copy English","نسخ الإنجليزية")}</button>${waText!==false?`<a class="text-btn" target="_blank" rel="noopener" data-wa-pair="en" href="https://wa.me/?text=${encodeURIComponent(r.en||"")}">WhatsApp</a>`:""}</div></div>
    <div><textarea dir="rtl" lang="ar" rows="7" data-pair="ar">${esc(r.ar||"")}</textarea><div class="tools"><button class="text-btn" type="button" data-copy-pair="ar">${L("Copy Arabic","نسخ العربية")}</button>${waText!==false?`<a class="text-btn" target="_blank" rel="noopener" data-wa-pair="ar" href="https://wa.me/?text=${encodeURIComponent(r.ar||"")}">WhatsApp</a>`:""}</div></div></div></div>`;

  // ---------- Planner ----------
  let plannerData=null, plannerView="month", plannerMonth=new Date(), publishInfo=null;
  const PSTATUS=[["idea",["Ideas","أفكار"],"💡"],["draft",["Draft","مسودة"],"✏️"],["ready",["Ready","جاهز"],"✅"],["scheduled",["Scheduled","مجدول"],"⏰"],["posted",["Posted","منشور"],"🚀"]];
  const PKINDS=[["reel","Reel"],["photo",["Photo","صورة"]],["carousel",["Carousel","منشور متعدد"]],["story",["Story","ستوري"]],["video",["TikTok video","فيديو تيك توك"]]];
  const kindLabel=k=>{const x=PKINDS.find(p=>p[0]===k);return x?(Array.isArray(x[1])?pick(x[1]):x[1]):k;};
  const platIcons=ps=>(ps||[]).map(p=>`<span class="pl-plat ${p}" title="${p}">${ic(p)}</span>`).join("");
  async function plannerPage() {
    const [d,pub]=await Promise.all([api.getPosts(),api.getPublishStatus().catch(()=>null)]);plannerData=d;publishInfo=pub;
    return sectionHead("planner",L("Plan every post, keep ideas in one place, and let AI write the captions.","خطط لكل منشور، واحفظ الأفكار في مكان واحد، ودع الذكاء الاصطناعي يكتب التعليقات."))+
      `<div class="social-bar"><div class="seg big" role="tablist">${[["month",L("Calendar","التقويم")],["board",L("Board","اللوحة")]].map(([k,l])=>`<button type="button" data-pl-view="${k}" class="${plannerView===k?"on":""}">${l}</button>`).join("")}</div>
      <span class="meta"></span><button class="btn" type="button" data-pl-new="idea">💡 ${L("New idea","فكرة جديدة")}</button><button class="btn primary" type="button" data-pl-new="draft">${ic("plus")}${L("Plan a post","خطط لمنشور")}</button></div>
      <div id="planner-body"></div>${hubDialog()}${CONFIRM_HTML}`;
  }
  function drawPlanner() {
    const b=document.getElementById("planner-body");if(!b||!plannerData)return;
    app.querySelectorAll("[data-pl-view]").forEach(x=>x.classList.toggle("on",x.dataset.plView===plannerView));
    b.innerHTML=plannerView==="month"?plannerMonthHtml():plannerBoardHtml();
  }
  function postChip(p) {
    const time=p.scheduled_at?new Intl.DateTimeFormat(locale(),{timeZone:"Asia/Dubai",hour:"2-digit",minute:"2-digit"}).format(new Date(p.scheduled_at)):"";
    return `<button type="button" class="pl-chip st-${p.status}" data-pl-open="${esc(p.id)}">${platIcons(p.platforms)}<span>${esc(p.title)}</span>${time?`<small>${time}</small>`:""}</button>`;
  }
  function plannerMonthHtml() {
    const y=plannerMonth.getFullYear(),m=plannerMonth.getMonth(),first=new Date(Date.UTC(y,m,1)),startDow=(first.getUTCDay()+6)%7,days=new Date(Date.UTC(y,m+1,0)).getUTCDate();
    const key=iso=>dubai(iso).toISOString().slice(0,10);
    const byDay={};plannerData.posts.filter(p=>p.scheduled_at).forEach(p=>{(byDay[key(p.scheduled_at)]=byDay[key(p.scheduled_at)]||[]).push(p);});
    const todayKey=dubai(new Date().toISOString()).toISOString().slice(0,10);
    const cells=[];for(let i=0;i<startDow;i++)cells.push(`<div class="cal-cell empty"></div>`);
    for(let d=1;d<=days;d++){const k=`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;const list=byDay[k]||[];
      cells.push(`<div class="cal-cell ${k===todayKey?"today":""}" data-pl-day="${k}"><span class="cal-n">${num(d)}</span>${list.map(postChip).join("")}<button type="button" class="cal-add" data-pl-new="draft" data-day="${k}" ${label(L("Plan a post on this day","خطط لمنشور في هذا اليوم"))}>+</button></div>`);}
    const ideas=plannerData.posts.filter(p=>p.status==="idea"&&!p.scheduled_at);
    const monthName=new Intl.DateTimeFormat(locale(),{month:"long",year:"numeric"}).format(plannerMonth);
    const thisMonth=plannerData.posts.filter(p=>p.scheduled_at&&key(p.scheduled_at).slice(0,7)===`${y}-${String(m+1).padStart(2,"0")}`);
    return `<div class="planner-wrap"><article class="card card-pad cal"><header class="cal-head"><button class="icon-btn" type="button" data-pl-month="-1" ${label(L("Previous month","الشهر السابق"))}><span class="chev">‹</span></button><h2>${esc(monthName)}</h2><button class="icon-btn" type="button" data-pl-month="1" ${label(L("Next month","الشهر التالي"))}><span class="chev">›</span></button>
      <span class="meta">${num(thisMonth.length)} ${L("posts planned","منشورات مخططة")} · ${num(thisMonth.filter(p=>p.status==="posted").length)} ${L("posted","منشور")}</span></header>
      <div class="cal-grid">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d,i)=>`<span class="cal-dow">${esc(pick([d,["الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت","الأحد"][i]]).slice(0,3))}</span>`).join("")}${cells.join("")}</div></article>
      <aside class="card card-pad ideas"><h2>💡 ${L("Idea list","قائمة الأفكار")}</h2><p class="meta">${L("Drop ideas here, plan them later.","ضع الأفكار هنا وخطط لها لاحقاً.")}</p>
      <form id="idea-form" class="idea-form"><input name="title" maxlength="200" dir="auto" placeholder="${L("New idea…","فكرة جديدة…")}" required><button class="btn" type="submit">${ic("plus")}</button></form>
      <div class="idea-list">${ideas.map(p=>`<button type="button" class="idea" data-pl-open="${esc(p.id)}">${platIcons(p.platforms)}<span dir="auto">${esc(p.title)}</span></button>`).join("")||`<p class="empty">${L("No ideas yet.","لا توجد أفكار بعد.")}</p>`}</div></aside></div>`;
  }
  function plannerBoardHtml() {
    return `<div class="board">${PSTATUS.map(([k,l,i])=>{const list=plannerData.posts.filter(p=>p.status===k);
      return `<section class="board-col" data-pl-drop="${k}"><header><span>${i} ${esc(pick(l))}</span><b>${num(list.length)}</b></header>
      ${list.map(p=>`<article class="board-card" draggable="true" data-pl-drag="${esc(p.id)}" data-pl-open="${esc(p.id)}">${p.media_url?`<img src="${esc(p.media_url)}" alt="" loading="lazy">`:""}<div><strong dir="auto">${esc(p.title)}</strong><p class="meta">${platIcons(p.platforms)} ${esc(kindLabel(p.kind))}${p.scheduled_at?" · "+esc(date(p.scheduled_at,{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})):""}</p></div></article>`).join("")}
      <button type="button" class="board-add" data-pl-new="${k}">${ic("plus")}${L("Add","إضافة")}</button></section>`;}).join("")}</div>`;
  }
  function postEditor(p) {
    const local=p.scheduled_at?new Date(Date.parse(p.scheduled_at)+4*3600e3).toISOString().slice(0,16):(p._day?p._day+"T19:00":"");
    const pub=publishInfo||{};
    const pubRow=pl=>{const s=pub[pl]||{};const done=p.published?.[pl];
      return `<div class="pub-row"><span class="pl-plat ${pl}">${ic(pl)}</span><div><strong>${pl==="tiktok"?"TikTok":"Instagram"}</strong><small class="meta">${done?L("Published","تم النشر")+" · "+esc(date(done.at)):s.enabled?L("Ready to publish","جاهز للنشر"):L("Prepared: switches on after ","مُجهّز: يعمل بعد موافقة ")+(pl==="tiktok"?"TikTok":"Meta")+L(" approval","")}</small></div>
      ${session.is_admin&&p.id?`<button type="button" class="btn" data-pl-publish="${pl}" ${s.enabled&&!done?"":"disabled"}>${L("Publish now","انشر الآن")}</button>`:""}</div>`;};
    return `<form method="dialog" id="post-form" class="hub-form" data-id="${esc(p.id||"")}"><header><h2>${p.id?L("Edit post","تعديل المنشور"):p.status==="idea"?L("New idea","فكرة جديدة"):L("Plan a post","خطط لمنشور")}</h2><button type="button" class="icon-btn" data-close-dialog>${ic("close")}</button></header>
      <label>${L("Title / idea","العنوان / الفكرة")}<input name="title" maxlength="200" dir="auto" required value="${esc(p.title||"")}" placeholder="${L("e.g. Behind the scenes at the café shoot","مثال: كواليس تصوير المقهى")}"></label>
      <div class="form-row"><label>${L("Status","الحالة")}<select name="status">${PSTATUS.map(([k,l])=>`<option value="${k}" ${p.status===k?"selected":""}>${esc(pick(l))}</option>`).join("")}</select></label>
      <label>${L("Format","النوع")}<select name="kind">${PKINDS.map(([k])=>`<option value="${k}" ${p.kind===k?"selected":""}>${esc(kindLabel(k))}</option>`).join("")}</select></label>
      <label>${L("Date & time (UAE)","التاريخ والوقت (الإمارات)")}<input type="datetime-local" name="when" value="${esc(local)}"></label></div>
      <fieldset class="chips"><legend class="meta">${L("Platforms","المنصات")}</legend>${["instagram","tiktok"].map(pl=>chip("checkbox","platforms",pl,(p.platforms||["instagram"]).includes(pl),"",pl==="tiktok"?"TikTok":"Instagram","")).join("")}</fieldset>
      <div class="media-pick">${p.media_url?`<img src="${esc(p.media_url)}" alt="">`:`<div class="media-empty">${ic("image")}</div>`}<label class="btn">${ic("image")}${L("Add image","أضف صورة")}<input type="file" accept="image/*" data-pl-image hidden></label><small class="meta">${L("Used for Instagram publishing later. Videos: post from the app for now.","تُستخدم للنشر على إنستغرام لاحقاً. الفيديو: انشره من التطبيق حالياً.")}</small></div>
      <label>${L("Notes / brief","ملاحظات / وصف")}<textarea name="notes" rows="2" dir="auto" maxlength="2000">${esc(p.notes||"")}</textarea></label>
      <div class="cap-head"><strong>${L("Caption","التعليق")}</strong><button type="button" class="btn" data-pl-ai>✨ ${L("Write with AI","اكتب بالذكاء الاصطناعي")}</button></div>
      <div class="msg-pair"><textarea name="caption_en" rows="6" dir="ltr" placeholder="English">${esc(p.caption_en||"")}</textarea><textarea name="caption_ar" rows="6" dir="rtl" lang="ar" placeholder="العربية">${esc(p.caption_ar||"")}</textarea></div>
      <p class="meta" id="pl-ai-note" role="status"></p>
      ${p.id?`<div class="pub"><strong>${L("Publish","النشر")}</strong>${(p.platforms||[]).map(pubRow).join("")||`<p class="meta">${L("Pick a platform above.","اختر منصة أعلاه.")}</p>`}</div>`:""}
      <footer>${p.id?`<button type="button" class="btn reject" data-pl-delete>${L("Delete","حذف")}</button>`:""}<span></span><button type="button" class="btn" data-close-dialog>${t("cancel")}</button><button type="submit" class="btn primary">${ic("check")}${L("Save","حفظ")}</button></footer></form>`;
  }
  async function toJpeg(file) {
    const bmp=await createImageBitmap(file),s=Math.min(1,1440/Math.max(bmp.width,bmp.height));
    const c=document.createElement("canvas");c.width=Math.round(bmp.width*s);c.height=Math.round(bmp.height*s);c.getContext("2d").drawImage(bmp,0,0,c.width,c.height);
    return await new Promise(r=>c.toBlob(r,"image/jpeg",.88));
  }
  const postValues=form=>{const f=new FormData(form),w=f.get("when");
    return {title:f.get("title"),status:f.get("status"),kind:f.get("kind"),platforms:f.getAll("platforms"),scheduled_at:w?new Date(w+":00+04:00").toISOString():"",notes:f.get("notes"),caption_en:f.get("caption_en"),caption_ar:f.get("caption_ar")};};

  // ---------- Reply helper ----------
  async function repliesPage() {
    return sectionHead("replies",L("Paste a customer message and get a ready reply in English and Arabic, in your voice.","الصق رسالة العميل واحصل على رد جاهز بالإنجليزية والعربية بأسلوبك."))+
      `<article class="card card-pad agent-card"><header><span class="agent-emoji" aria-hidden="true">💬</span><div><h2>${L("Reply helper","مساعد الردود")}</h2><p class="meta">${L("Works today with copy and paste. When Meta approves messaging, Instagram and WhatsApp messages will appear here automatically.","يعمل اليوم بالنسخ واللصق. عند موافقة Meta على الرسائل ستظهر رسائل إنستغرام وواتساب هنا تلقائياً.")}</p></div></header>
      <form id="reply-form" class="hub-form"><div class="chips">${[["whatsapp","WhatsApp"],["instagram","Instagram DM"],["tiktok","TikTok"],["email","Email"]].map(([v,l],i)=>chip("radio","channel",v,i===0,"",l,"")).join("")}</div>
      <label>${L("Customer message","رسالة العميل")}<textarea name="message" rows="5" dir="auto" maxlength="3000" required placeholder="${L("e.g. Hi, how much for a 2-hour shoot for my café next week?","مثال: مرحباً، كم سعر جلسة تصوير لمدة ساعتين لمقهاي الأسبوع القادم؟")}"></textarea></label>
      <label>${L("Anything the AI should know (optional)","معلومات إضافية (اختياري)")}<input name="context" maxlength="800" dir="auto" placeholder="${L("e.g. We are free on Tuesday; Creator Photo is AED 650","مثال: متاحون يوم الثلاثاء؛ باقة التصوير 650 درهم")}"></label>
      <div class="tools"><button class="btn primary" type="submit">✨ ${L("Draft reply","اكتب الرد")}</button><span class="meta" id="reply-status" role="status"></span></div></form>
      <div id="reply-out"></div></article>
      <article class="card card-pad prep"><h2>🔌 ${L("Coming next, already prepared","قريباً، وتم تجهيزه")}</h2><ul class="prep-list">
        <li><b>${L("Instagram DMs and comments inbox","صندوق رسائل وتعليقات إنستغرام")}</b><span>${L("Needs: Instagram connected + Meta approval for messaging.","يتطلب: ربط إنستغرام + موافقة Meta على الرسائل.")}</span></li>
        <li><b>${L("WhatsApp Business inbox","صندوق واتساب للأعمال")}</b><span>${L("Needs: WhatsApp Business number added to your Meta business portfolio + business verification.","يتطلب: إضافة رقم واتساب للأعمال إلى ملف أعمالك في Meta + توثيق النشاط.")}</span></li>
        <li><b>${L("Suggested replies on every message","ردود مقترحة لكل رسالة")}</b><span>${L("Uses this same reply helper and your Agent settings voice.","يستخدم نفس مساعد الردود وأسلوب إعدادات الوكيل.")}</span></li></ul></article>${CONFIRM_HTML}`;
  }

  // ---------- Quotes and invoices ----------
  let salesData=null, salesTab="docs";
  const DSTAT={draft:["Draft","مسودة"],sent:["Sent","مُرسل"],accepted:["Accepted","مقبول"],declined:["Declined","مرفوض"],expired:["Expired","منتهي"],paid:["Paid","مدفوع"],partial:["Part paid","مدفوع جزئياً"],overdue:["Overdue","متأخر"],cancelled:["Cancelled","ملغى"]};
  const pill=s=>`<span class="pill s-${s}">${esc(pick(DSTAT[s]||[s,s]))}</span>`;
  const docLink=d=>location.origin+"/api/doc/"+d.token;
  async function salesPage() {
    salesData=await api.getSales();
    if(!session.is_admin)return sectionHead("sales")+`<p class="card empty">${t("adminOnly")}</p>`;
    return sectionHead("sales",L("Quotes, invoices and clients. Share a link the client can view, accept or print as PDF.","عروض الأسعار والفواتير والعملاء. شارك رابطاً يمكن للعميل مشاهدته أو قبوله أو طباعته PDF."))+
      `<div id="sales-body"></div>${hubDialog()}${CONFIRM_HTML}`;
  }
  function drawSales() {
    const b=document.getElementById("sales-body");if(!b||!salesData)return;
    const s=salesData.stats;
    const tabs=[["docs",L("Quotes & invoices","العروض والفواتير")],["clients",L("Clients","العملاء")],["business",L("Business details","بيانات النشاط")]];
    b.innerHTML=`<div class="kpis sales-kpis">${kpi(L("Outstanding","المستحق"),cur$("AED",s.outstanding),L("unpaid invoices","فواتير غير مدفوعة"),"main")}${kpi(L("Overdue","متأخر"),cur$("AED",s.overdue),s.overdue?"⚠️ "+L("chase these","تابع هذه"):"")}${kpi(L("Paid this month","مدفوع هذا الشهر"),cur$("AED",s.paidThisMonth))}${kpi(L("Open quotes","عروض مفتوحة"),cur$("AED",s.openQuotes))}</div>
      <div class="social-bar"><div class="seg big">${tabs.map(([k,l])=>`<button type="button" data-sl-tab="${k}" class="${salesTab===k?"on":""}">${l}</button>`).join("")}</div><span class="meta"></span>
      ${salesTab==="docs"?`<button class="btn" type="button" data-sl-new="quote">${ic("plus")}${L("New quote","عرض سعر جديد")}</button><button class="btn primary" type="button" data-sl-new="invoice">${ic("plus")}${L("New invoice","فاتورة جديدة")}</button>`:salesTab==="clients"?`<button class="btn primary" type="button" data-sl-client="">${ic("plus")}${L("Add client","إضافة عميل")}</button>`:""}</div>
      ${salesTab==="docs"?docsTable():salesTab==="clients"?clientsList():businessForm()}`;
  }
  function docsTable() {
    const docs=salesData.docs;
    if(!docs.length)return `<article class="card card-pad empty-state"><h2>🧾 ${L("No quotes or invoices yet","لا توجد عروض أو فواتير بعد")}</h2><p class="meta">${L("Create your first quote. Fill in Business details first so your name, TRN and bank details appear on documents.","أنشئ أول عرض سعر. املأ بيانات النشاط أولاً لتظهر على المستندات.")}</p></article>`;
    return `<div class="card table-wrap"><table class="docs-table"><thead><tr><th>${L("Number","الرقم")}</th><th>${L("Client","العميل")}</th><th>${L("Date","التاريخ")}</th><th>${L("Due","الاستحقاق")}</th><th class="r">${L("Total","الإجمالي")}</th><th>${L("Status","الحالة")}</th></tr></thead><tbody>
      ${docs.map(d=>`<tr data-sl-open="${esc(d.id)}"><td><b>${esc(d.number)}</b><br><small class="meta">${d.kind==="quote"?L("Quote","عرض سعر"):L("Invoice","فاتورة")}</small></td><td dir="auto">${esc(d.client.name||"—")}<br><small class="meta">${esc(d.client.company||"")}</small></td><td>${esc(d.issue_date||"")}</td><td>${esc(d.due_date||"—")}</td><td class="r"><b>${esc(cur$(d.currency,d.total))}</b>${d.kind==="invoice"&&d.paid&&d.balance>0?`<br><small class="meta">${L("Balance","المتبقي")} ${esc(cur$(d.currency,d.balance))}</small>`:""}</td><td>${pill(d.status)}</td></tr>`).join("")}</tbody></table></div>`;
  }
  function clientsList() {
    const cl=salesData.clients;
    if(!cl.length)return `<article class="card card-pad empty-state"><h2>👥 ${L("No clients yet","لا يوجد عملاء بعد")}</h2><p class="meta">${L("Add Short & Sweet and your other clients to reuse their details on every document.","أضف عملاءك لإعادة استخدام بياناتهم في كل مستند.")}</p></article>`;
    return `<div class="client-grid">${cl.map(c=>{const docs=salesData.docs.filter(d=>d.client_id===c.id),billed=docs.filter(d=>d.kind==="invoice"&&d.status!=="cancelled").reduce((n,d)=>n+d.total,0);
      return `<article class="card card-pad client" data-sl-client="${esc(c.id)}"><h2 dir="auto">${esc(c.name)}</h2><p class="meta">${esc(c.company||"")}</p><p class="meta">${esc([c.phone,c.email].filter(Boolean).join(" · "))}</p><div class="kpis small">${kpi(L("Documents","مستندات"),num(docs.length))}${kpi(L("Billed","المفوتر"),cur$("AED",billed))}</div></article>`;}).join("")}</div>`;
  }
  function businessForm() {
    const b=salesData.business||{};
    const f=(k,l,ph="",rows=0)=>`<label>${l}${rows?`<textarea name="${k}" rows="${rows}" dir="auto">${esc(b[k]||"")}</textarea>`:`<input name="${k}" dir="auto" value="${esc(b[k]||"")}" placeholder="${esc(ph)}">`}</label>`;
    return `<form id="business-form" class="card card-pad hub-form"><h2>${L("Shown on every quote and invoice","يظهر على كل عرض وفاتورة")}</h2>
      <div class="form-row">${f("name",L("Business name","اسم النشاط"),"Nostrix Marketing Services")}${f("trn",L("TRN (only if VAT registered)","الرقم الضريبي (إن وُجد)"))}</div>
      ${f("address",L("Address","العنوان"),"Ras Al Khaimah, UAE")}<div class="form-row">${f("email",L("Email","البريد"),"marketing@nostrix.ae")}${f("phone",L("Phone","الهاتف"))}</div>
      <div class="form-row">${f("bank",L("Bank name","اسم البنك"))}${f("iban","IBAN")}</div>${f("terms",L("Payment terms / footer","شروط الدفع / التذييل"),"",3)}
      <div class="tools"><button class="btn primary" type="submit">${ic("check")}${L("Save","حفظ")}</button></div></form>`;
  }
  function docEditor(d) {
    const isQ=d.kind==="quote",clients=salesData.clients;
    const items=(d.items&&d.items.length?d.items:[{desc:"",qty:1,price:0}]);
    const stats=isQ?["draft","sent","accepted","declined"]:["draft","sent","partial","paid","cancelled"];
    return `<form method="dialog" id="doc-form" class="hub-form wide" data-id="${esc(d.id||"")}" data-kind="${d.kind}"><header><h2>${d.id?esc(d.number):isQ?L("New quote","عرض سعر جديد"):L("New invoice","فاتورة جديدة")} ${d.id?pill(d.status):""}</h2><button type="button" class="icon-btn" data-close-dialog>${ic("close")}</button></header>
      <div class="form-row"><label>${L("Client","العميل")}<select name="client_id"><option value="">${L("New client (type below)","عميل جديد (اكتب أدناه)")}</option>${clients.map(c=>`<option value="${esc(c.id)}" ${d.client_id===c.id?"selected":""}>${esc(c.name)}${c.company?" · "+esc(c.company):""}</option>`).join("")}</select></label>
        <label>${L("Client name","اسم العميل")}<input name="c_name" dir="auto" value="${esc(d.client?.name||"")}"></label><label>${L("Phone","الهاتف")}<input name="c_phone" value="${esc(d.client?.phone||"")}"></label><label>${L("Email","البريد")}<input name="c_email" value="${esc(d.client?.email||"")}"></label></div>
      <div class="form-row"><label>${L("Date","التاريخ")}<input type="date" name="issue_date" value="${esc(d.issue_date||new Date().toISOString().slice(0,10))}"></label><label>${isQ?L("Valid until","صالح حتى"):L("Due date","تاريخ الاستحقاق")}<input type="date" name="due_date" value="${esc(d.due_date||new Date(Date.now()+(isQ?14:7)*864e5).toISOString().slice(0,10))}"></label>
        <label>${L("Currency","العملة")}<select name="currency">${["AED","USD"].map(c=>`<option ${d.currency===c?"selected":""}>${c}</option>`).join("")}</select></label><label>${L("Status","الحالة")}<select name="status">${stats.map(s=>`<option value="${s}" ${(d.status==="overdue"?"sent":d.status)===s?"selected":""}>${esc(pick(DSTAT[s]))}</option>`).join("")}</select></label></div>
      <div class="items"><div class="item head"><span>${L("Description","الوصف")}</span><span>${L("Qty","الكمية")}</span><span>${L("Price","السعر")}</span><span class="r">${L("Amount","المبلغ")}</span><span></span></div>
        <div id="item-rows">${items.map(itemRow).join("")}</div><button type="button" class="text-btn" data-sl-item>${ic("plus")}${L("Add line","إضافة بند")}</button></div>
      <div class="doc-bottom"><div><label>${L("Notes","ملاحظات")}<textarea name="notes" rows="3" dir="auto">${esc(d.notes||"")}</textarea></label>
        <div class="form-row"><label class="switch-row"><input type="checkbox" name="vat" ${d.vat?"checked":""}><span class="toggle"></span>${L("Add VAT 5%","إضافة ضريبة 5%")}</label><label>${L("Discount","الخصم")}<input type="number" step="0.01" min="0" name="discount" value="${esc(d.discount||0)}"></label>${isQ?"":`<label>${L("Amount paid","المبلغ المدفوع")}<input type="number" step="0.01" min="0" name="paid" value="${esc(d.paid||0)}"></label>`}</div></div>
        <div class="totals" id="doc-totals"></div></div>
      ${d.id&&d.status!=="draft"?`<div class="share"><strong>${L("Client link","رابط العميل")}</strong><input readonly value="${esc(docLink(d))}"><button type="button" class="btn" data-sl-copy>${L("Copy","نسخ")}</button><a class="btn" target="_blank" rel="noopener" href="https://wa.me/${esc((d.client?.phone||"").replace(/[^\d]/g,""))}?text=${encodeURIComponent((isQ?"Hi, here is your quote ":"Hi, here is your invoice ")+d.number+": "+docLink(d))}">${ic("whatsapp")}WhatsApp</a><a class="btn" target="_blank" rel="noopener" href="${esc(docLink(d))}">${L("Open / PDF","فتح / PDF")}</a></div>`:d.id?`<p class="meta">${L("Set the status to Sent to get a link for the client.","اجعل الحالة «مُرسل» للحصول على رابط للعميل.")}</p>`:""}
      <footer>${d.id?`<button type="button" class="btn reject" data-sl-delete>${L("Delete","حذف")}</button>`:""}${d.id&&isQ&&d.status!=="declined"?`<button type="button" class="btn" data-sl-convert>${L("Turn into invoice","تحويل إلى فاتورة")}</button>`:""}${d.id&&!isQ&&d.balance>0&&d.status!=="draft"?`<button type="button" class="btn" data-sl-paid>✅ ${L("Mark paid","تحديد كمدفوع")}</button>`:""}<span></span>
      <button type="button" class="btn" data-close-dialog>${t("cancel")}</button><button type="submit" class="btn primary">${ic("check")}${L("Save","حفظ")}</button></footer></form>`;
  }
  const itemRow=i=>`<div class="item"><input name="i_desc" dir="auto" value="${esc(i.desc||"")}" placeholder="${L("e.g. Event coverage, 4 hours","مثال: تغطية فعالية 4 ساعات")}"><input name="i_qty" type="number" step="0.5" min="0" value="${esc(i.qty??1)}"><input name="i_price" type="number" step="0.01" min="0" value="${esc(i.price??0)}"><span class="r i-amt"></span><button type="button" class="icon-btn" data-sl-rmitem ${label(L("Remove line","حذف البند"))}>${ic("close")}</button></div>`;
  function docValues(form) {
    const f=new FormData(form),q=form.querySelectorAll("#item-rows .item");
    const items=[...q].map(r=>({desc:r.querySelector('[name="i_desc"]').value,qty:Number(r.querySelector('[name="i_qty"]').value)||0,price:Number(r.querySelector('[name="i_price"]').value)||0})).filter(i=>i.desc||i.price);
    return {kind:form.dataset.kind,client_id:f.get("client_id")||"",client:{name:f.get("c_name"),phone:f.get("c_phone"),email:f.get("c_email")},issue_date:f.get("issue_date"),due_date:f.get("due_date"),currency:f.get("currency"),status:f.get("status"),items,vat:form.elements.vat.checked,discount:Number(f.get("discount"))||0,paid:Number(f.get("paid")||0),notes:f.get("notes")};
  }
  function syncTotals(form) {
    const v=docValues(form),c=v.currency;
    form.querySelectorAll("#item-rows .item").forEach(r=>{r.querySelector(".i-amt").textContent=cur$(c,(Number(r.querySelector('[name="i_qty"]').value)||0)*(Number(r.querySelector('[name="i_price"]').value)||0));});
    const sub=v.items.reduce((n,i)=>n+i.qty*i.price,0),disc=Math.min(sub,v.discount),tax=v.vat?(sub-disc)*salesData.vatRate:0,total=sub-disc+tax;
    document.getElementById("doc-totals").innerHTML=`<div><span>${L("Subtotal","المجموع")}</span><b>${cur$(c,sub)}</b></div>${disc?`<div><span>${L("Discount","الخصم")}</span><b>− ${cur$(c,disc)}</b></div>`:""}${v.vat?`<div><span>VAT 5%</span><b>${cur$(c,tax)}</b></div>`:""}<div class="grand"><span>${L("Total","الإجمالي")}</span><b>${cur$(c,total)}</b></div>${v.paid?`<div><span>${L("Balance","المتبقي")}</span><b>${cur$(c,total-v.paid)}</b></div>`:""}`;
  }
  function clientEditor(c) {
    const f=(k,l)=>`<label>${l}<input name="${k}" dir="auto" value="${esc(c[k]||"")}"></label>`;
    return `<form method="dialog" id="client-form" class="hub-form" data-id="${esc(c.id||"")}"><header><h2>${c.id?esc(c.name):L("Add client","إضافة عميل")}</h2><button type="button" class="icon-btn" data-close-dialog>${ic("close")}</button></header>
      <div class="form-row">${f("name",L("Name","الاسم"))}${f("company",L("Company","الشركة"))}</div><div class="form-row">${f("phone",L("Phone","الهاتف"))}${f("email",L("Email","البريد"))}</div>
      <div class="form-row">${f("trn",L("TRN","الرقم الضريبي"))}${f("address",L("Address","العنوان"))}</div><label>${L("Notes","ملاحظات")}<textarea name="notes" rows="2" dir="auto">${esc(c.notes||"")}</textarea></label>
      <footer>${c.id?`<button type="button" class="btn reject" data-sl-delclient>${L("Delete","حذف")}</button>`:""}<span></span><button type="button" class="btn" data-close-dialog>${t("cancel")}</button><button type="submit" class="btn primary">${ic("check")}${L("Save","حفظ")}</button></footer></form>`;
  }

  // ---------- Follow-ups ----------
  async function followupsPage() {
    salesData=await api.getSales();
    if(!session.is_admin)return sectionHead("followups")+`<p class="card empty">${t("adminOnly")}</p>`;
    const list=salesData.followups,icon={invoice:"🧾",quote:"📄",lead:"🎯"},tl={invoice:L("Unpaid invoice","فاتورة غير مدفوعة"),quote:L("Quote waiting","عرض بانتظار الرد"),lead:L("Lead didn't reply","عميل محتمل لم يرد")};
    const days=since=>Math.max(0,Math.round((Date.now()-Date.parse(since))/864e5));
    return sectionHead("followups",L("Who to chase today. AI writes a polite reminder in English and Arabic.","من تتابع اليوم. يكتب الذكاء الاصطناعي تذكيراً لطيفاً بالإنجليزية والعربية."))+
      `<div class="kpis sales-kpis">${kpi(L("To follow up","للمتابعة"),num(list.length),"","main")}${kpi(L("Unpaid","غير مدفوع"),cur$("AED",list.filter(x=>x.type==="invoice").reduce((n,x)=>n+x.amount,0)))}${kpi(L("Quotes waiting","عروض بانتظار الرد"),num(list.filter(x=>x.type==="quote").length))}${kpi(L("Leads to nudge","عملاء للتذكير"),num(list.filter(x=>x.type==="lead").length))}</div>
      <div class="fu-list">${list.map((x,i)=>`<article class="card card-pad fu" data-fu="${i}"><header><span class="fu-ic">${icon[x.type]}</span><div><h2 dir="auto">${esc(x.name)}</h2><p class="meta">${tl[x.type]} · ${esc(x.title)}${x.amount?" · "+esc(cur$(x.currency,x.amount)):""} · ${num(days(x.since))} ${L("days","يوماً")}</p></div>
        <div class="tools">${x.phone?`<a class="btn" target="_blank" rel="noopener" href="https://wa.me/${esc(x.phone.replace(/[^\d]/g,""))}">${ic("whatsapp")}</a>`:""}<button class="btn primary" type="button" data-fu-write="${i}">✨ ${L("Write reminder","اكتب تذكيراً")}</button>${x.type==="invoice"?`<button class="btn" type="button" data-fu-paid="${esc(x.id)}">✅ ${L("Paid","مدفوع")}</button>`:""}</div></header><div class="fu-out"></div></article>`).join("")||`<article class="card card-pad empty-state"><h2>🎉 ${L("All caught up","لا شيء للمتابعة")}</h2><p class="meta">${L("Unpaid invoices past due, quotes with no answer after 3 days, and leads with no reply after 4 days appear here.","تظهر هنا الفواتير المتأخرة والعروض دون رد بعد 3 أيام والعملاء دون رد بعد 4 أيام.")}</p></article>`}</div>${CONFIRM_HTML}`;
  }

  // ---------- Phone alerts ----------
  const ALERT_KINDS=[["order",["New orders","الطلبات الجديدة"],"🛒"],["enquiry",["New enquiries","الاستفسارات الجديدة"],"✉️"],["review",["New reviews","التقييمات الجديدة"],"⭐"],["lead",["New AI leads","العملاء المحتملون الجدد"],"🎯"],["invoice",["Quotes accepted","قبول العروض"],"🧾"]];
  async function alertsPage() {
    const ok="serviceWorker" in navigator&&"PushManager" in window;
    let sub=null;try{sub=ok?await (await swReg()).pushManager.getSubscription():null;}catch{sub=null;}
    let kinds=ALERT_KINDS.map(k=>k[0]);try{kinds=JSON.parse(localStorage.getItem("nx-alert-kinds")||"null")||kinds;}catch{/* default */}
    const ios=/iphone|ipad/i.test(navigator.userAgent),standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone;
    return sectionHead("alerts",L("Get a notification on your phone the moment something happens.","احصل على إشعار على هاتفك فور حدوث أي شيء."))+
      `<article class="card card-pad agent-card"><header><span class="agent-emoji" aria-hidden="true">🔔</span><div><h2>${sub?L("Alerts are on for this device","التنبيهات مفعّلة على هذا الجهاز"):L("Turn on alerts on this device","فعّل التنبيهات على هذا الجهاز")}</h2><p class="meta">${L("Each phone or laptop is turned on separately.","يتم التفعيل لكل هاتف أو حاسوب على حدة.")}</p></div></header>
      ${!ok?`<p class="error-text">${ios&&!standalone?L("On iPhone: tap Share → Add to Home Screen, open Nostrix from the home screen, then come back to this page.","على الآيفون: اضغط مشاركة ← إضافة إلى الشاشة الرئيسية، افتح نوستريكس من الشاشة الرئيسية ثم عد إلى هذه الصفحة."):L("This browser does not support notifications.","هذا المتصفح لا يدعم الإشعارات.")}</p>`:""}
      <div class="chips" id="alert-kinds">${ALERT_KINDS.map(([k,l,i])=>chip("checkbox","kinds",k,kinds.includes(k),i,pick(l),ok?"":"disabled")).join("")}</div>
      <div class="tools">${sub?`<button class="btn primary" type="button" data-al-save>${ic("check")}${L("Save choices","حفظ الاختيارات")}</button><button class="btn" type="button" data-al-test>${L("Send a test","أرسل تجربة")}</button><button class="btn reject" type="button" data-al-off>${L("Turn off","إيقاف")}</button>`:`<button class="btn primary" type="button" data-al-on ${ok?"":"disabled"}>🔔 ${L("Turn on alerts","فعّل التنبيهات")}</button>`}<span class="meta" id="alert-status" role="status"></span></div></article>
      <article class="card card-pad prep"><h2>📱 ${L("On iPhone","على الآيفون")}</h2><ol class="prep-list"><li>${L("Open nostrix.ae/staff/website/ in Safari and sign in.","افتح nostrix.ae/staff/website/ في سفاري وسجّل الدخول.")}</li><li>${L("Tap Share → Add to Home Screen.","اضغط مشاركة ← إضافة إلى الشاشة الرئيسية.")}</li><li>${L("Open Nostrix from the home screen, go to Phone alerts and turn them on.","افتح نوستريكس من الشاشة الرئيسية، ثم تنبيهات الهاتف وفعّلها.")}</li></ol></article>`;
  }
  // The app's background worker: use the one already registered, or register it now (with a time limit).
  async function swReg() {
    const r=await navigator.serviceWorker.getRegistration("./");
    if(r)return r;
    return await Promise.race([navigator.serviceWorker.register("./sw.js",{scope:"./"}).then(()=>navigator.serviceWorker.ready),new Promise((_,no)=>setTimeout(()=>no(new Error("worker")),6000))]);
  }
  const b64ToBytes=s=>Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/")+"===".slice((s.length+3)%4)),c=>c.charCodeAt(0));
  const chosenKinds=()=>[...app.querySelectorAll('#alert-kinds input:checked')].map(x=>x.value);
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
    } else if(page==="leads") {
      drawLeads();
    } else if(page==="inbox") {
      drawInbox();
    } else if(page==="planner") {
      drawPlanner();
    } else if(page==="sales") {
      drawSales();
    } else if(page==="agent") {
      const form=document.getElementById("agent-form");if(form)syncAgent(form,false);
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
    // Keep the current page on screen while the next one loads; only the very first load shows a loading screen.
    const hasShell=!!app.querySelector(".shell");
    if(hasShell){
      app.querySelectorAll(".nav-item").forEach(a=>{const on=a.getAttribute("href")==="#"+page;a.classList.toggle("active",on);on?a.setAttribute("aria-current","page"):a.removeAttribute("aria-current");});
      document.body.classList.add("is-loading");
    }
    const loadingTimer=setTimeout(()=>{
      if(token===revision&&!hasShell)app.innerHTML=`<main class="auth-layout"><p class="loading-state" role="status">${t("loading")}</p></main>`;
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
        const reviews=page==="overview"||page==="reviews"?await api.getReviews():[];
        const views={overview:()=>overview(reviews),visitors,clicks,enquiries:enquiryPage,reviews:()=>reviewPage(reviews),access:accessPage,portfolio:portfolioPage,notes:notesPage,log:logPage,social:()=>socialPage(),inbox:inboxPage,planner:plannerPage,replies:repliesPage,leads:leadsPage,agent:agentPage,sales:salesPage,followups:followupsPage,alerts:alertsPage};
        const body=await views[page]();
        if (token!==revision) return;
        syncDocument(page);
        app.innerHTML=shell(page,0,body);
        clearTimeout(loadingTimer);
        document.body.classList.remove("is-loading");
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
    } finally {clearTimeout(loadingTimer);if(token===revision)document.body.classList.remove("is-loading");}
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
    } else if (button.dataset.enquiryDelete) {
      if (await confirmBox(t("deleteEnquiryConfirm"),t("deleteEnquiry"))) await mutate(()=>api.deleteEnquiry(button.dataset.enquiryDelete),button,"enquiryDeleted");
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
        try { await api.createAccount({name:emails.length===1?f.name.value:"",email:address,password:f.password.value,website_access:f.website_access.checked,marketing_access:f.marketing_access.checked,is_admin:f.is_admin.checked}); }
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
    if (field.id==="log-search") { logQuery=field.value; document.getElementById("log-rows").innerHTML=logBody(); }
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
    } else if (field.id==="log-area") {
      logArea=field.value; document.getElementById("log-rows").innerHTML=logBody();
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
  const warm=e=>{const a=e.target.closest?.(".nav-item");if(a&&api.prefetch)api.prefetch(a.getAttribute("href").slice(1));};
  app.addEventListener("pointerover",warm);app.addEventListener("touchstart",warm,{passive:true});app.addEventListener("focusin",warm);
  window.addEventListener("storage",event=>{
    if (!event.key || (event.key.startsWith("nostrix.website.demo.") && !/\.(note|visit)\.|\.noteSeedDate$/.test(event.key))) render();
    if (event.key==="nostrix_theme" && ["light","dark"].includes(event.newValue)) { html.dataset.theme=event.newValue; render(); }
    if (event.key==="nostrix_language_v1" && ["en","ar"].includes(event.newValue)) { html.lang=event.newValue; html.dir=ar()?"rtl":"ltr"; render(); }
  });
  // ---------- Handlers: planner, replies, sales, follow-ups, alerts ----------
  const findPost=id=>plannerData?.posts.find(p=>p.id===id);
  const busy=(b,on,text)=>{if(!b)return;if(on){b.dataset.label=b.innerHTML;b.disabled=true;if(text)b.textContent=text;}else{b.disabled=false;if(b.dataset.label)b.innerHTML=b.dataset.label;}};
  async function refreshPlanner(){plannerData=await api.getPosts();drawPlanner();}
  async function refreshSales(){salesData=await api.getSales();drawSales();}
  app.addEventListener("click",async e=>{
    const b=e.target.closest("button,a,[data-pl-open],[data-sl-open],[data-sl-client]");if(!b||!app.contains(b))return;
    const d=b.dataset;
    if(b.hasAttribute("data-close-dialog")){closeDialog();return;}
    // copy / WhatsApp for any EN/AR pair
    if(d.copyPair){const ta=b.closest(".msg-pair").querySelector(`[data-pair="${d.copyPair}"]`);try{await navigator.clipboard.writeText(ta.value);toast(t("copied"));}catch{toast(t("unavailable"));}return;}
    // planner
    if(d.plView){plannerView=d.plView;drawPlanner();return;}
    if(d.plMonth){plannerMonth=new Date(plannerMonth.getFullYear(),plannerMonth.getMonth()+Number(d.plMonth),1);drawPlanner();return;}
    if(d.plNew){e.stopPropagation();openDialog(postEditor({status:d.plNew,platforms:["instagram"],kind:"reel",_day:d.day||(d.plNew==="idea"?"":null)}));return;}
    if(d.plOpen&&!e.target.closest(".cal-add")){const p=findPost(d.plOpen);if(p)openDialog(postEditor(p));return;}
    if(b.hasAttribute("data-pl-ai")){const form=b.closest("form"),v=postValues(form),note=document.getElementById("pl-ai-note");
      if(!v.title){form.elements.title.focus();return;}
      busy(b,true,L("Writing…","جارٍ الكتابة…"));note.textContent="";
      try{const r=await api.writeCaption({topic:v.title+(v.kind?" ("+kindLabel(v.kind)+")":""),notes:v.notes,platform:v.platforms.length>1?"both":v.platforms[0]||"instagram"});form.elements.caption_en.value=r.en||"";form.elements.caption_ar.value=r.ar||"";note.textContent=r.note?"💡 "+r.note:"";}
      catch(error){note.textContent=aiError(error);}finally{busy(b,false);}return;}
    if(b.hasAttribute("data-pl-delete")){const id=b.closest("form").dataset.id;closeDialog();if(await confirmBox(L("Delete this post?","حذف هذا المنشور؟"),L("Delete","حذف"))){await api.deletePost(id);await refreshPlanner();toast(L("Deleted.","تم الحذف."));}return;}
    if(d.plPublish){const id=b.closest("form").dataset.id;busy(b,true);try{await api.publishPost(id,d.plPublish);toast(L("Published.","تم النشر."));closeDialog();await refreshPlanner();}catch(error){toast(aiError(error));busy(b,false);}return;}
    // sales
    if(d.slTab){salesTab=d.slTab;drawSales();return;}
    if(d.slNew){openDialog(docEditor({kind:d.slNew,items:[],vat:false,currency:"AED",status:"draft"}));syncTotals(document.getElementById("doc-form"));return;}
    if(d.slOpen){const doc=salesData.docs.find(x=>x.id===d.slOpen);if(doc){openDialog(docEditor(doc));syncTotals(document.getElementById("doc-form"));}return;}
    if(d.slClient!==undefined&&b.matches("[data-sl-client]")){const c=salesData.clients.find(x=>x.id===d.slClient)||{};openDialog(clientEditor(c));return;}
    if(b.hasAttribute("data-sl-item")){document.getElementById("item-rows").insertAdjacentHTML("beforeend",itemRow({desc:"",qty:1,price:0}));syncTotals(b.closest("form"));return;}
    if(b.hasAttribute("data-sl-rmitem")){const form=b.closest("form");b.closest(".item").remove();syncTotals(form);return;}
    if(b.hasAttribute("data-sl-copy")){try{await navigator.clipboard.writeText(b.previousElementSibling.value);toast(t("copied"));}catch{toast(t("unavailable"));}return;}
    if(b.hasAttribute("data-sl-delete")){const id=b.closest("form").dataset.id;closeDialog();if(await confirmBox(L("Delete this document permanently?","حذف هذا المستند نهائياً؟"),L("Delete","حذف"))){await api.deleteDoc(id);await refreshSales();}return;}
    if(b.hasAttribute("data-sl-convert")){const id=b.closest("form").dataset.id;busy(b,true);try{const inv=await api.convertDoc(id);await refreshSales();openDialog(docEditor(inv));syncTotals(document.getElementById("doc-form"));toast(L("Invoice created.","تم إنشاء الفاتورة."));}catch(error){toast(aiError(error));busy(b,false);}return;}
    if(b.hasAttribute("data-sl-paid")){const form=b.closest("form");busy(b,true);try{await api.updateDoc(form.dataset.id,{...docValues(form),status:"paid"});closeDialog();await refreshSales();toast(L("Marked paid.","تم التحديد كمدفوع."));}catch(error){toast(aiError(error));busy(b,false);}return;}
    if(b.hasAttribute("data-sl-delclient")){const id=b.closest("form").dataset.id;closeDialog();if(await confirmBox(L("Delete this client?","حذف هذا العميل؟"),L("Delete","حذف"))){await api.deleteClient(id);await refreshSales();}return;}
    // follow-ups
    if(d.fuWrite){const x=salesData.followups[Number(d.fuWrite)],out=b.closest(".fu").querySelector(".fu-out");busy(b,true,L("Writing…","جارٍ الكتابة…"));
      try{const r=await api.writeReminder({kind:x.type,name:x.name,details:x.details});out.innerHTML=pairBox(r);if(x.phone)out.querySelectorAll("[data-wa-pair]").forEach(a=>a.href=a.href.replace("https://wa.me/","https://wa.me/"+x.phone.replace(/[^\d]/g,"")));}
      catch(error){out.innerHTML=`<p class="error-text">${esc(aiError(error))}</p>`;}finally{busy(b,false);}return;}
    if(d.fuPaid){busy(b,true);try{const doc=(await api.getSales()).docs.find(x=>x.id===d.fuPaid);await api.updateDoc(d.fuPaid,{...doc,client_id:doc.client_id||"",status:"paid"});await render();toast(L("Marked paid.","تم التحديد كمدفوع."));}catch(error){toast(aiError(error));busy(b,false);}return;}
    // alerts
    if(b.hasAttribute("data-al-on")){const st=document.getElementById("alert-status");busy(b,true);
      try{if(await Notification.requestPermission()!=="granted")throw Object.assign(new Error("denied"),{detail:L("Notifications are blocked. Allow them in your browser or phone settings.","الإشعارات محظورة. اسمح بها من إعدادات المتصفح أو الهاتف.")});
        const {key}=await api.pushKey();const reg=await swReg();const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64ToBytes(key)});
        await api.pushSubscribe({subscription:sub.toJSON(),kinds:chosenKinds(),device:navigator.userAgent.slice(0,80)});try{localStorage.setItem("nx-alert-kinds",JSON.stringify(chosenKinds()));}catch{/* optional */}
        await api.pushTest(sub.endpoint);await render();toast(L("Alerts are on. A test is on its way.","تم تفعيل التنبيهات. التجربة في الطريق."));}
      catch(error){st.textContent=error.detail||String(error.message||error);busy(b,false);}return;}
    if(b.hasAttribute("data-al-save")||b.hasAttribute("data-al-test")||b.hasAttribute("data-al-off")){const reg=await swReg(),sub=await reg.pushManager.getSubscription();if(!sub){await render();return;}busy(b,true);
      try{if(b.hasAttribute("data-al-off")){await api.pushUnsubscribe(sub.endpoint);await sub.unsubscribe();await render();toast(L("Alerts turned off.","تم إيقاف التنبيهات."));return;}
        if(b.hasAttribute("data-al-save")){await api.pushSubscribe({subscription:sub.toJSON(),kinds:chosenKinds(),device:navigator.userAgent.slice(0,80)});try{localStorage.setItem("nx-alert-kinds",JSON.stringify(chosenKinds()));}catch{/* optional */}toast(t("saved"));}
        else{await api.pushTest(sub.endpoint);toast(L("Test sent.","تم إرسال التجربة."));}}
      catch(error){toast(aiError(error));}finally{busy(b,false);}return;}
  });
  app.addEventListener("submit",async e=>{
    const form=e.target;
    if(form.id==="ig-token-form"){e.preventDefault();const st=document.getElementById("ig-token-status"),btn=form.querySelector('[type="submit"]');busy(btn,true);st.textContent="";
      try{const f=new FormData(form);const r=await api.saveInstagramToken({token:f.get("token"),igId:f.get("igId")});form.reset();socialData=await api.getSocial(true);socialTab="instagram";redrawSocial();toast(L("Instagram connected: @","تم ربط إنستغرام: @")+r.username);}
      catch(error){st.textContent=aiError(error);}finally{busy(btn,false);}return;}
    if(form.id==="idea-form"){e.preventDefault();const v=form.elements.title.value.trim();if(!v)return;await api.createPost({title:v,status:"idea",platforms:["instagram"],kind:"reel"});form.reset();await refreshPlanner();return;}
    if(form.id==="post-form"){e.preventDefault();const btn=form.querySelector('[type="submit"]');busy(btn,true);
      try{const v=postValues(form);if(v.scheduled_at&&v.status==="idea")v.status="draft";const p=form.dataset.id?await api.updatePost(form.dataset.id,v):await api.createPost(v);
        const file=form._image;if(file)await api.postImage(p.id,await toJpeg(file));closeDialog();await refreshPlanner();toast(t("saved"));}
      catch(error){toast(aiError(error));busy(btn,false);}return;}
    if(form.id==="reply-form"){e.preventDefault();const btn=form.querySelector('[type="submit"]'),st=document.getElementById("reply-status"),f=new FormData(form);busy(btn,true,L("Writing…","جارٍ الكتابة…"));st.textContent="";
      try{const r=await api.writeReply({message:f.get("message"),channel:f.get("channel"),context:f.get("context")});document.getElementById("reply-out").innerHTML=pairBox(r,f.get("channel")==="whatsapp");}
      catch(error){st.textContent=aiError(error);}finally{busy(btn,false);}return;}
    if(form.id==="doc-form"){e.preventDefault();const btn=form.querySelector('[type="submit"]');busy(btn,true);
      try{const v=docValues(form);if(!v.client_id&&!v.client.name)throw Object.assign(new Error("x"),{detail:L("Choose a client or type the client name.","اختر عميلاً أو اكتب اسمه.")});
        const doc=form.dataset.id?await api.updateDoc(form.dataset.id,v):await api.createDoc(v);await refreshSales();
        if(doc.status!=="draft"){openDialog(docEditor(doc));syncTotals(document.getElementById("doc-form"));}else closeDialog();toast(t("saved"));}
      catch(error){toast(aiError(error));busy(btn,false);}return;}
    if(form.id==="client-form"){e.preventDefault();const f=Object.fromEntries(new FormData(form));try{form.dataset.id?await api.updateClient(form.dataset.id,f):await api.createClient(f);closeDialog();await refreshSales();toast(t("saved"));}catch(error){toast(aiError(error));}return;}
    if(form.id==="business-form"){e.preventDefault();try{await api.saveBusiness(Object.fromEntries(new FormData(form)));salesData.business=Object.fromEntries(new FormData(form));toast(t("saved"));}catch(error){toast(aiError(error));}return;}
  });
  app.addEventListener("input",e=>{const form=e.target.closest?.("#doc-form");if(form)syncTotals(form);});
  app.addEventListener("change",e=>{
    const f=e.target;
    if(f.matches?.("[data-pl-image]")&&f.files[0]){const form=f.closest("form");form._image=f.files[0];const box=form.querySelector(".media-pick");const url=URL.createObjectURL(f.files[0]);const old=box.querySelector("img,.media-empty");old.outerHTML=`<img src="${url}" alt="">`;}
    if(f.name==="client_id"&&f.closest("#doc-form")){const c=salesData.clients.find(x=>x.id===f.value);if(c){const form=f.closest("form");form.elements.c_name.value=c.name||"";form.elements.c_phone.value=c.phone||"";form.elements.c_email.value=c.email||"";}}
  });
  // Drag posts between board columns
  app.addEventListener("dragstart",e=>{const c=e.target.closest?.("[data-pl-drag]");if(c){e.dataTransfer.setData("text/nx-post",c.dataset.plDrag);e.dataTransfer.effectAllowed="move";}});
  app.addEventListener("dragover",e=>{const col=e.target.closest?.("[data-pl-drop]");if(col&&e.dataTransfer.types.includes("text/nx-post")){e.preventDefault();col.classList.add("drag-over");}});
  app.addEventListener("dragleave",e=>{e.target.closest?.("[data-pl-drop]")?.classList.remove("drag-over");});
  app.addEventListener("drop",async e=>{const col=e.target.closest?.("[data-pl-drop]");const id=e.dataTransfer?.getData("text/nx-post");if(!col||!id)return;e.preventDefault();col.classList.remove("drag-over");
    const p=findPost(id);if(!p||p.status===col.dataset.plDrop)return;p.status=col.dataset.plDrop;drawPlanner();try{await api.updatePost(id,{status:p.status});}catch(error){toast(aiError(error));await refreshPlanner();}});
  // ---------- Inbox: Instagram DMs and WhatsApp ----------
  let inboxData=null, inboxChannel="all", openThread=null;
  async function inboxPage() {
    inboxData=await api.getInbox();
    return sectionHead("inbox",L("Instagram DMs and WhatsApp in one place, with AI reply suggestions.","رسائل إنستغرام وواتساب في مكان واحد، مع اقتراح ردود بالذكاء الاصطناعي."))+
      `<div class="social-bar"><div class="seg big">${[["all",L("All","الكل")],["instagram","Instagram"],["whatsapp","WhatsApp"]].map(([k,l])=>`<button type="button" data-ib-ch="${k}" class="${inboxChannel===k?"on":""}">${k==="all"?"":ic(k)}${l}</button>`).join("")}</div><span class="meta"></span><button class="btn" type="button" data-ib-refresh>${L("Refresh","تحديث")}</button></div>
      <div id="inbox-body"></div>`;
  }
  function inboxThreads() {
    const list=[];
    if(inboxChannel!=="whatsapp")(inboxData.instagram.threads||[]).forEach(x=>list.push({...x,channel:"instagram"}));
    if(inboxChannel!=="instagram")(inboxData.whatsapp.threads||[]).forEach(x=>list.push({...x,channel:"whatsapp"}));
    return list.sort((a,b)=>Date.parse(b.at||0)-Date.parse(a.at||0));
  }
  function waStatus() {
    const w=inboxData.whatsapp;if(!w.connected)return "";
    const hit=w.lastHit;
    return `<article class="card card-pad wa-status"><span class="pl-plat whatsapp">${ic("whatsapp")}</span><div><b>WhatsApp ${esc(w.number||"")}</b><p class="meta">${hit?(hit.ok?L("Last message from Meta: ","آخر رسالة من Meta: ")+esc(date(hit.at,{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})):L("Meta reached us but the signature did not match. Check META_APP_SECRET in Cloudflare.","وصلتنا Meta لكن التوقيع غير مطابق. تحقق من META_APP_SECRET في Cloudflare.")):L("No messages from Meta yet. Check the webhook in Configuration and that messages is subscribed.","لم تصل رسائل من Meta بعد. تحقق من Webhook في الإعداد ومن الاشتراك في messages.")}${w.subscribed===0?" · "+L("Account not subscribed to the app yet: reconnect below.","الحساب غير مشترك في التطبيق بعد: أعد الربط أدناه."):""}</p></div>
      ${session.is_admin?`<button class="btn" type="button" data-ib-wa-reconnect>${L("Reconnect","إعادة الربط")}</button>`:""}</article>`;
  }
  function waSetup() {
    const w=inboxData.whatsapp,s=w.setup;
    if(w.connected&&!w._reconnect)return waStatus();
    return `<article class="card card-pad agent-card"><header><span class="brand-badge whatsapp" aria-hidden="true">${ic("whatsapp")}</span><div><h2>${L("Connect WhatsApp (free)","اربط واتساب (مجاناً)")}</h2><p class="meta">${L("Uses Meta's free WhatsApp Cloud API. Replies within 24 hours of a customer's message are free.","يستخدم واجهة واتساب السحابية المجانية من Meta. الردود خلال 24 ساعة من رسالة العميل مجانية.")}</p></div></header>
      ${s?`<ol class="prep-list"><li>${L("In developers.facebook.com → Nostrix Hub → Add use case → Connect with customers through WhatsApp.","في developers.facebook.com ← Nostrix Hub ← إضافة حالة استخدام ← التواصل مع العملاء عبر واتساب.")}</li>
        <li>${L("WhatsApp → Configuration → Webhook: Callback URL and Verify token below, then subscribe to messages.","واتساب ← الإعداد ← Webhook: الرابط ورمز التحقق أدناه، ثم اشترك في messages.")}</li>
        <li>${L("Add your number in WhatsApp → API setup, then give the Nostrix Hub system user the WhatsApp account and generate a token with whatsapp_business_messaging.","أضف رقمك في واتساب ← إعداد API، ثم امنح مستخدم النظام حساب واتساب وأنشئ رمزاً بصلاحية whatsapp_business_messaging.")}</li></ol>
        <div class="copy-row"><span>${L("Callback URL","رابط الاستدعاء")}</span><input readonly value="${esc(s.webhookUrl)}"><button class="btn" type="button" data-ib-copy>${L("Copy","نسخ")}</button></div>
        <div class="copy-row"><span>${L("Verify token","رمز التحقق")}</span><input readonly value="${esc(s.verifyToken)}"><button class="btn" type="button" data-ib-copy>${L("Copy","نسخ")}</button></div>
        <form id="wa-form" class="hub-form" autocomplete="off"><div class="form-row"><label>${L("Phone number ID","معرّف رقم الهاتف")}<input name="phoneId" inputmode="numeric" required></label><label>${L("WhatsApp account ID (optional)","معرّف حساب واتساب (اختياري)")}<input name="wabaId" inputmode="numeric"></label><label>${L("System-user token","رمز مستخدم النظام")}<input name="token" type="password" autocomplete="off" required placeholder="EAA…"></label></div>
        <div class="tools"><button class="btn primary" type="submit">${L("Connect WhatsApp","اربط واتساب")}</button><span class="meta" id="wa-status" role="status"></span></div></form>`:`<p class="meta">${t("adminEdits")}</p>`}</article>`;
  }
  function igPageSetup() {
    return `<article class="card card-pad agent-card"><header><span class="brand-badge instagram" aria-hidden="true">${ic("instagram")}</span><div><h2>${L("Turn on Instagram DMs (free, one time)","فعّل رسائل إنستغرام (مجاناً ولمرة واحدة)")}</h2><p class="meta">${L("Meta only shares Instagram messages through a Facebook Page linked to the account.","تشارك Meta رسائل إنستغرام فقط عبر صفحة فيسبوك مرتبطة بالحساب.")}</p></div></header>
      <ol class="prep-list"><li>${L("Create a free Facebook Page called Nostrix (or use one you have), and link it to @nostrix.ae: Instagram → Settings → Accounts Center, or Page settings → Linked accounts → Instagram.","أنشئ صفحة فيسبوك مجانية باسم Nostrix (أو استخدم صفحتك)، واربطها بحساب @nostrix.ae من إعدادات إنستغرام ← مركز الحسابات، أو إعدادات الصفحة ← الحسابات المرتبطة.")}</li>
      <li>${L("Business settings → Accounts → Pages → Add the Page to Nostrix Marketing Services.","إعدادات الأعمال ← الحسابات ← الصفحات ← أضف الصفحة إلى Nostrix Marketing Services.")}</li>
      <li>${L("System users → Nostrix Hub → Assign assets → Pages → your Page → Full control.","مستخدمو النظام ← Nostrix Hub ← تعيين الأصول ← الصفحات ← صفحتك ← تحكم كامل.")}</li>
      <li>${L("Generate a new token (same as before) and also tick pages_show_list, pages_manage_metadata, pages_messaging and pages_read_engagement. Paste it in Social → Instagram → Disconnect, then Connect with a Meta token.","أنشئ رمزاً جديداً كالسابق وحدد أيضاً pages_show_list و pages_manage_metadata و pages_messaging و pages_read_engagement، ثم الصقه في التواصل الاجتماعي ← إلغاء ربط إنستغرام ← الربط برمز Meta.")}</li></ol></article>`;
  }
  function drawInbox() {
    const b=document.getElementById("inbox-body");if(!b||!inboxData)return;
    app.querySelectorAll("[data-ib-ch]").forEach(x=>x.classList.toggle("on",x.dataset.ibCh===inboxChannel));
    const list=inboxThreads(),ig=inboxData.instagram;
    const notes=[!ig.connected?L("Instagram is not connected. Connect it in Social.","إنستغرام غير مربوط. اربطه من صفحة التواصل الاجتماعي."):ig.error?ig.error:""].filter(Boolean);
    b.innerHTML=`${notes.map(n=>`<p class="card card-pad meta">${esc(n)}</p>`).join("")}${ig.needsPage&&inboxChannel!=="whatsapp"?igPageSetup():""}${inboxChannel!=="instagram"?waSetup():""}
      <div class="inbox"><aside class="card inbox-list">${list.map(x=>`<button type="button" class="ib-row ${openThread&&openThread.id===x.id?"on":""}" data-ib-open="${esc(x.channel)}|${esc(x.id)}"><span class="pl-plat ${x.channel==="whatsapp"?"whatsapp":"instagram"}">${ic(x.channel)}</span><span class="ib-txt"><b dir="auto">${esc(x.name)}</b><small dir="auto">${x.lastFromMe?L("You: ","أنت: "):""}${esc((x.last||"").slice(0,80))}</small></span><time class="meta">${x.at?esc(date(x.at,{day:"numeric",month:"short"})):""}</time></button>`).join("")||`<p class="empty">${L("No conversations yet.","لا توجد محادثات بعد.")}</p>`}</aside>
      <section class="card inbox-thread" id="ib-thread">${openThread?threadHtml(openThread):`<p class="empty">${L("Choose a conversation.","اختر محادثة.")}</p>`}</section></div>`;
    const box=document.querySelector(".ib-msgs");if(box)box.scrollTop=box.scrollHeight;
  }
  function threadHtml(th) {
    return `<header class="ib-head"><span class="pl-plat ${th.channel==="whatsapp"?"whatsapp":"instagram"}">${ic(th.channel)}</span><b dir="auto">${esc(th.name)}</b></header>
      <div class="ib-msgs">${th.messages.map(m=>`<div class="ib-msg ${m.mine?"mine":""}"><p dir="auto">${esc(m.text)}</p><time>${m.at?esc(date(m.at,{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})):""}</time></div>`).join("")||`<p class="empty">${L("No messages.","لا توجد رسائل.")}</p>`}</div>
      <form id="ib-reply" class="ib-reply"><textarea name="text" rows="3" dir="auto" maxlength="2000" placeholder="${L("Write a reply…","اكتب رداً…")}" required></textarea>
      <div class="tools"><button type="button" class="btn" data-ib-suggest="en">✨ ${L("Suggest (English)","اقترح (إنجليزي)")}</button><button type="button" class="btn" data-ib-suggest="ar">✨ ${L("Suggest (Arabic)","اقترح (عربي)")}</button><span class="meta" id="ib-status" role="status"></span><button class="btn primary" type="submit">${L("Send","إرسال")}</button></div></form>`;
  }
  app.addEventListener("click",async e=>{
    const b=e.target.closest?.("[data-ib-ch],[data-ib-refresh],[data-ib-open],[data-ib-suggest],[data-ib-copy],[data-ib-wa-reconnect]");if(!b||!app.contains(b))return;
    if(b.dataset.ibCh){inboxChannel=b.dataset.ibCh;drawInbox();}
    else if(b.hasAttribute("data-ib-refresh")){b.disabled=true;try{inboxData=await api.getInbox();if(openThread)openThread={...await api.getThread(openThread.channel,openThread.id),channel:openThread.channel};drawInbox();}catch(error){toast(aiError(error));}finally{b.disabled=false;}}
    else if(b.dataset.ibOpen){const [ch,id]=b.dataset.ibOpen.split("|");try{openThread={...await api.getThread(ch,id),channel:ch};drawInbox();}catch(error){toast(aiError(error));}}
    else if(b.hasAttribute("data-ib-wa-reconnect")){inboxData.whatsapp._reconnect=true;drawInbox();}
    else if(b.hasAttribute("data-ib-copy")){try{await navigator.clipboard.writeText(b.previousElementSibling.value);toast(t("copied"));}catch{toast(t("unavailable"));}}
    else if(b.dataset.ibSuggest&&openThread){const last=[...openThread.messages].reverse().find(m=>!m.mine);if(!last){toast(L("No customer message to answer yet.","لا توجد رسالة من العميل بعد."));return;}
      const st=document.getElementById("ib-status");busy(b,true,L("Writing…","جارٍ الكتابة…"));
      try{const r=await api.writeReply({message:last.text,channel:openThread.channel==="whatsapp"?"whatsapp":"instagram",context:openThread.messages.slice(-6).map(m=>(m.mine?"Us: ":"Customer: ")+m.text).join("\n")});document.querySelector('#ib-reply textarea').value=b.dataset.ibSuggest==="ar"?r.ar:r.en;st.textContent=r.note?"💡 "+r.note:"";}
      catch(error){st.textContent=aiError(error);}finally{busy(b,false);}}
  });
  app.addEventListener("submit",async e=>{
    const form=e.target;
    if(form.id==="ib-reply"&&openThread){e.preventDefault();const btn=form.querySelector('[type="submit"]'),st=document.getElementById("ib-status");busy(btn,true);
      try{await api.sendMessage({channel:openThread.channel,to:openThread.contactId,text:form.elements.text.value});openThread={...await api.getThread(openThread.channel,openThread.id),channel:openThread.channel};drawInbox();toast(L("Sent.","تم الإرسال."));}
      catch(error){st.textContent=aiError(error);busy(btn,false);}}
    else if(form.id==="wa-form"){e.preventDefault();const st=document.getElementById("wa-status"),btn=form.querySelector('[type="submit"]');busy(btn,true);
      try{const f=new FormData(form);const r=await api.connectWhatsApp({phoneId:f.get("phoneId"),token:f.get("token"),wabaId:f.get("wabaId")});form.reset();inboxData=await api.getInbox();drawInbox();toast(L("WhatsApp connected: ","تم ربط واتساب: ")+r.number);}
      catch(error){st.textContent=aiError(error);busy(btn,false);}}
  });
  // Automation switches save immediately
  async function saveAuto(change){try{await api.saveAutomation(change);autoData=await api.getAutomation();const bar=app.querySelector(".auto-bar");if(bar)bar.outerHTML=autoBar();const card=document.getElementById("auto-card");if(card)card.outerHTML=autoCard();toast(t("saved"));}catch(error){toast(aiError(error));}}
  app.addEventListener("click",e=>{const b=e.target.closest?.("[data-auto-toggle]");if(b&&autoData)saveAuto({[b.dataset.autoToggle]:!autoData[b.dataset.autoToggle]});});
  app.addEventListener("change",e=>{const f=e.target;
    if(f.dataset?.auto){saveAuto({[f.dataset.auto]:f.type==="checkbox"?f.checked:Number(f.value)});}
    else if(f.name==="autoDays"){saveAuto({leadsDays:[...app.querySelectorAll('input[name="autoDays"]:checked')].map(x=>Number(x.value))});}
  });
  // Social dashboard
  app.addEventListener("click",async e=>{
    const b=e.target.closest("[data-social-tab],[data-social-sort],[data-social-refresh],[data-social-disconnect],[data-social-open]");if(!b||!app.contains(b))return;
    if(b.dataset.socialTab){socialTab=b.dataset.socialTab;redrawSocial();}
    else if(b.dataset.socialOpen){socialTab=b.dataset.socialOpen;redrawSocial();window.scrollTo({top:0,behavior:"smooth"});}
    else if(b.dataset.socialSort){socialSort=b.dataset.socialSort;redrawSocial();}
    else if(b.hasAttribute("data-social-refresh")){b.disabled=true;try{socialData=await api.getSocial(true);redrawSocial();toast(t("saved").replace(/.*/,L("Updated.","تم التحديث.")));}catch(error){toast(aiError(error));}finally{b.disabled=false;}}
    else if(b.dataset.socialDisconnect){const p=b.dataset.socialDisconnect;if(await confirmBox(L("Disconnect "+PLAT[p].name+"?","إلغاء ربط "+PLAT[p].name+"؟"),L("Disconnect","إلغاء الربط"))){try{await api.disconnectSocial(p);socialData=await api.getSocial(true);redrawSocial();}catch(error){toast(aiError(error));}}}
  });
  app.addEventListener("mousemove",e=>{const tip=document.getElementById("viz-tip");if(!tip)return;const c=e.target.closest?.("[data-tip]");
    if(!c){tip.hidden=true;return;}tip.textContent=c.dataset.tip;tip.hidden=false;tip.style.left=Math.min(innerWidth-220,e.clientX+14)+"px";tip.style.top=(e.clientY+14)+"px";});
  // Marketing hub: leads and agent settings
  const leadOf=node=>leadData?.leads.find(l=>l.id===node.closest("[data-lead]")?.dataset.lead);
  app.addEventListener("click",async e=>{
    const b=e.target.closest("button");if(!b||!app.contains(b))return;
    const lead=leadOf(b);
    if(b.hasAttribute("data-lead-write")&&lead){
      if(leadBusy)return;leadBusy=true;b.disabled=true;const old=b.innerHTML;b.textContent=t("writing");
      try{const r=await api.writeLeadMessage(lead.id,{channel:b.closest("[data-lead]").querySelector("[data-lead-channel]").value});Object.assign(lead,{message_channel:r.channel,message_en:r.en,message_ar:r.ar,message_subject:r.subject});leadData.usage.messages++;drawLeads();}
      catch(error){toast(aiError(error));b.innerHTML=old;b.disabled=false;}
      finally{leadBusy=false;}
    } else if(b.hasAttribute("data-lead-delete")&&lead){
      if(await confirmBox(t("deleteLeadConfirm"),t("deleteLead"))){try{await api.deleteLead(lead.id);leadData.leads=leadData.leads.filter(l=>l!==lead);drawLeads();toast(t("leadDeleted"));}catch(error){toast(aiError(error));}}
    } else if(b.dataset.copy&&lead){
      const text=b.closest("[data-lead]").querySelector(`[data-lead-text="${b.dataset.copy}"]`).value;
      try{await navigator.clipboard.writeText(text);toast(t("copied"));}catch{toast(t("unavailable"));}
    } else if(b.hasAttribute("data-agent-reset")){
      if(await confirmBox(t("resetAgentConfirm"),t("resetAgent"))){try{await api.saveAgent({...agentData.defaults,cap:agentData.cap});await render();toast(t("saved"));}catch(error){toast(aiError(error));}}
    }
  });
  app.addEventListener("change",async e=>{
    const f=e.target,lead=leadOf(f);
    if(f.id==="lead-filter"){leadFilter=f.value;drawLeads();}
    else if(f.hasAttribute("data-lead-status")&&lead){try{await api.updateLead(lead.id,{status:f.value});lead.status=f.value;toast(t("saved"));}catch(error){toast(aiError(error));}}
    else if(f.dataset.leadText&&lead){const key=f.dataset.leadText;try{await api.updateLead(lead.id,{[key]:f.value});lead[key]=f.value;toast(t("saved"));}catch(error){toast(aiError(error));}}
  });
  app.addEventListener("input",e=>{const form=e.target.closest?.("#agent-form");if(form)syncAgent(form,true);});
  app.addEventListener("submit",async e=>{
    const form=e.target;
    if(form.id==="hunt-form"){
      e.preventDefault();if(leadBusy)return;leadBusy=true;
      const submit=form.querySelector('[type="submit"]'),status=document.getElementById("hunt-status");
      submit.disabled=true;status.textContent=t("hunting");status.classList.remove("error-text");
      try{const r=await api.huntLeads({emirate:form.elements.emirate.value,focus:form.elements.focus.value});leadBusy=false;await render();toast(num(r.added)+" "+t("huntDone"));}
      catch(error){status.textContent=aiError(error);status.classList.add("error-text");submit.disabled=false;}
      finally{leadBusy=false;}
    } else if(form.id==="agent-form"){
      e.preventDefault();const submit=form.querySelector('[type="submit"]');if(!submit||submit.disabled)return;submit.disabled=true;
      const input=agentValues(form);
      try{await api.saveAgent(input);toast(t("saved"));document.getElementById("agent-error").textContent="";document.getElementById("agent-save").hidden=true;}
      catch(error){document.getElementById("agent-error").textContent=aiError(error);}
      finally{submit.disabled=false;}
    }
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
