import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const CONFIG = window.NOSTRIX_STAFF_CONFIG || {};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const TRANSLATIONS = {
  en: {
    staffWorkspace: "Staff workspace",
    welcome: "Welcome back.",
    loginHelp: "Sign in using an approved Nostrix work email. We’ll send you a secure sign-in link.",
    workEmail: "Work email",
    sendLink: "Send sign-in link",
    inviteOnly: "Invite-only access",
    workspace: "Workspace",
    profile: "Profile",
    signOut: "Sign out",
    teamTasks: "Team tasks",
    hello: "Hello",
    dashboardIntro: "Keep track of what needs to be done, who owns it and what is coming up next.",
    newTask: "New task",
    toDo: "To do",
    inProgress: "In progress",
    dueSoon: "Due soon",
    completed: "Completed",
    myTasks: "My tasks",
    allTasks: "All tasks",
    searchTasks: "Search tasks",
    allPriorities: "All priorities",
    urgent: "Urgent",
    high: "High",
    medium: "Medium",
    low: "Low",
    review: "Review",
    done: "Done",
    nothingHere: "Nothing here yet.",
    emptyHelp: "Create a task or change the filters to see more.",
    privateWorkspace: "Private staff workspace",
    taskDetails: "Task details",
    title: "Title",
    details: "Details",
    assignee: "Assignee",
    dueDate: "Due date",
    priority: "Priority",
    status: "Status",
    delete: "Delete",
    cancel: "Cancel",
    saveTask: "Save task",
    yourAccount: "Your account",
    displayName: "Display name",
    jobTitle: "Job title",
    save: "Save"
  },
  ar: {
    staffWorkspace: "مساحة فريق العمل",
    welcome: "مرحباً بعودتك.",
    loginHelp: "سجّل الدخول باستخدام بريد نوستريكس المعتمد. سنرسل لك رابط دخول آمن.",
    workEmail: "بريد العمل",
    sendLink: "إرسال رابط الدخول",
    inviteOnly: "الدخول بالدعوة فقط",
    workspace: "مساحة العمل",
    profile: "الملف الشخصي",
    signOut: "تسجيل الخروج",
    teamTasks: "مهام الفريق",
    hello: "مرحباً",
    dashboardIntro: "تابع ما يجب إنجازه، ومن المسؤول عنه، وما هي المواعيد القادمة.",
    newTask: "مهمة جديدة",
    toDo: "للإنجاز",
    inProgress: "قيد التنفيذ",
    dueSoon: "قريب الاستحقاق",
    completed: "مكتملة",
    myTasks: "مهامي",
    allTasks: "كل المهام",
    searchTasks: "ابحث في المهام",
    allPriorities: "كل الأولويات",
    urgent: "عاجل",
    high: "مرتفع",
    medium: "متوسط",
    low: "منخفض",
    review: "للمراجعة",
    done: "تم",
    nothingHere: "لا توجد مهام هنا بعد.",
    emptyHelp: "أنشئ مهمة أو غيّر عوامل التصفية.",
    privateWorkspace: "مساحة عمل خاصة بالفريق",
    taskDetails: "تفاصيل المهمة",
    title: "العنوان",
    details: "التفاصيل",
    assignee: "المسؤول",
    dueDate: "تاريخ الاستحقاق",
    priority: "الأولوية",
    status: "الحالة",
    delete: "حذف",
    cancel: "إلغاء",
    saveTask: "حفظ المهمة",
    yourAccount: "حسابك",
    displayName: "الاسم الظاهر",
    jobTitle: "المسمى الوظيفي",
    save: "حفظ"
  }
};

const WORDS = {
  en: {
    unassigned: "Unassigned",
    noDate: "No due date",
    overdue: "Overdue",
    dueToday: "Due today",
    dueTomorrow: "Due tomorrow",
    saved: "Task saved.",
    deleted: "Task deleted.",
    refreshed: "Updated.",
    profileSaved: "Profile saved.",
    genericAuth: "If this is an approved Nostrix account, a secure sign-in link has been sent.",
    error: "Something went wrong. Please try again.",
    deleteConfirm: "Delete this task permanently?"
  },
  ar: {
    unassigned: "غير مخصص",
    noDate: "بدون تاريخ",
    overdue: "متأخرة",
    dueToday: "مستحقة اليوم",
    dueTomorrow: "مستحقة غداً",
    saved: "تم حفظ المهمة.",
    deleted: "تم حذف المهمة.",
    refreshed: "تم التحديث.",
    profileSaved: "تم حفظ الملف الشخصي.",
    genericAuth: "إذا كان الحساب معتمداً لدى نوستريكس، فقد تم إرسال رابط دخول آمن.",
    error: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    deleteConfirm: "هل تريد حذف هذه المهمة نهائياً؟"
  }
};

const state = {
  supabase: null,
  user: null,
  profile: null,
  profiles: [],
  tasks: [],
  view: "mine",
  priority: "all",
  search: "",
  language: localStorage.getItem("nostrix_staff_language") === "ar" ? "ar" : "en",
  realtime: null
};

function t(key) {
  return TRANSLATIONS[state.language]?.[key] || TRANSLATIONS.en[key] || key;
}

function w(key) {
  return WORDS[state.language]?.[key] || WORDS.en[key] || key;
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function initials(name = "N") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || "N") + (parts[1]?.[0] || "")).toUpperCase();
}

function showOnly(id) {
  ["setup-screen", "auth-screen", "app-screen"].forEach(screenId => {
    const el = $("#" + screenId);
    if (el) el.hidden = screenId !== id;
  });
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;

  toast.textContent = message;
  toast.hidden = false;

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.hidden = true;
  }, 2400);
}

function applyLanguage() {
  document.documentElement.lang = state.language;
  document.documentElement.dir = state.language === "ar" ? "rtl" : "ltr";

  localStorage.setItem("nostrix_staff_language", state.language);

  $$("[data-t]").forEach(el => {
    const key = el.dataset.t;

    if (TRANSLATIONS[state.language]?.[key]) {
      el.textContent = TRANSLATIONS[state.language][key];
    }
  });

  $$("[data-placeholder-t]").forEach(el => {
    const key = el.dataset.placeholderT;

    if (TRANSLATIONS[state.language]?.[key]) {
      el.placeholder = TRANSLATIONS[state.language][key];
    }
  });

  $$(".language-toggle").forEach(btn => {
    btn.textContent = state.language === "ar" ? "EN" : "AR";
  });

  if (state.user) renderTasks();
}

function toggleLanguage() {
  state.language = state.language === "ar" ? "en" : "ar";
  applyLanguage();
}

function dateDiff(dateString) {
  if (!dateString) return null;

  const target = new Date(dateString + "T12:00:00");
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.round((target - today) / 86400000);
}

function dueLabel(dateString) {
  const diff = dateDiff(dateString);

  if (diff === null) return w("noDate");
  if (diff < 0) return w("overdue");
  if (diff === 0) return w("dueToday");
  if (diff === 1) return w("dueTomorrow");

  return new Intl.DateTimeFormat(
    state.language === "ar" ? "ar-AE" : "en-GB",
    {
      day: "numeric",
      month: "short"
    }
  ).format(new Date(dateString + "T12:00:00"));
}

function profileFor(userId) {
  return state.profiles.find(profile => profile.user_id === userId);
}

function profileName(userId) {
  if (!userId) return w("unassigned");

  const profile = profileFor(userId);

  return profile?.display_name || profile?.email || w("unassigned");
}

async function loadOwnProfile() {
  const { data, error } = await state.supabase
    .from("profiles")
    .select("*")
    .eq("user_id", state.user.id)
    .maybeSingle();

  if (error) {
    console.error("Profile load error:", error);
  }

  state.profile = data || {
    user_id: state.user.id,
    email: state.user.email,
    display_name: state.user.email?.split("@")[0] || "Nostrix",
    job_title: ""
  };
}

async function loadProfiles() {
  const { data, error } = await state.supabase
    .from("profiles")
    .select("user_id,email,display_name,job_title")
    .order("display_name", {
      ascending: true
    });

  if (error) {
    console.error("Profiles load error:", error);
    showToast(w("error"));
    return;
  }

  state.profiles = data || [];

  fillAssigneeSelect();
}

async function loadTasks() {
  const { data, error } = await state.supabase
    .from("tasks")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  if (error) {
    console.error("Tasks load error:", error);
    showToast(w("error"));
    return;
  }

  state.tasks = data || [];

  renderTasks();
}

function fillAssigneeSelect() {
  const select = $("#task-assignee");

  if (!select) return;

  const current = select.value;

  select.innerHTML =
    `<option value="">${escapeHTML(w("unassigned"))}</option>` +
    state.profiles.map(profile => {
      const title = profile.job_title
        ? ` — ${escapeHTML(profile.job_title)}`
        : "";

      return `
        <option value="${escapeHTML(profile.user_id)}">
          ${escapeHTML(profile.display_name || profile.email)}${title}
        </option>
      `;
    }).join("");

  if ([...select.options].some(option => option.value === current)) {
    select.value = current;
  }
}

function filteredTasks() {
  let tasks = [...state.tasks];

  if (state.view === "mine") {
    tasks = tasks.filter(task =>
      task.assigned_to === state.user?.id ||
      task.created_by === state.user?.id
    );
  }

  if (state.priority !== "all") {
    tasks = tasks.filter(task =>
      task.priority === state.priority
    );
  }

  if (state.search) {
    const query = state.search.toLowerCase();

    tasks = tasks.filter(task => {
      const haystack = [
        task.title,
        task.details || "",
        profileName(task.assigned_to)
      ].join(" ").toLowerCase();

      return haystack.includes(query);
    });
  }

  return tasks;
}

function taskCard(task) {
  const assignee = profileName(task.assigned_to);
  const diff = dateDiff(task.due_date);

  const overdue =
    diff !== null &&
    diff < 0 &&
    task.status !== "done";

  return `
    <article
      class="task-card"
      draggable="true"
      data-task-id="${escapeHTML(task.id)}"
    >
      <div class="task-top">
        <span class="priority-badge ${escapeHTML(task.priority)}">
          ${escapeHTML(t(task.priority))}
        </span>

        <button
          class="task-menu-button"
          type="button"
          data-edit-task="${escapeHTML(task.id)}"
          aria-label="Edit task"
        >
          <i class="ph ph-dots-three"></i>
        </button>
      </div>

      <h3>${escapeHTML(task.title)}</h3>

      ${
        task.details
          ? `<p class="task-description">${escapeHTML(task.details)}</p>`
          : ""
      }

      <div class="task-meta">
        <span class="${overdue ? "overdue" : ""}">
          <i class="ph ph-calendar-blank"></i>
          ${escapeHTML(dueLabel(task.due_date))}
        </span>

        <span>
          <span class="mini-avatar">
            ${escapeHTML(initials(assignee))}
          </span>

          ${escapeHTML(assignee)}
        </span>
      </div>
    </article>
  `;
}

function renderTasks() {
  if (!state.user) return;

  const tasks = filteredTasks();

  ["todo", "progress", "review", "done"].forEach(status => {
    const matching = tasks.filter(task =>
      task.status === status
    );

    const list = $(`#list-${status}`);
    const count = $(`#count-${status}`);

    if (list) {
      list.innerHTML = matching
        .map(taskCard)
        .join("");
    }

    if (count) {
      count.textContent = matching.length;
    }
  });

  const todoTotal = state.tasks.filter(task =>
    task.status === "todo"
  ).length;

  const progressTotal = state.tasks.filter(task =>
    task.status === "progress"
  ).length;

  const doneTotal = state.tasks.filter(task =>
    task.status === "done"
  ).length;

  const dueSoonTotal = state.tasks.filter(task => {
    const diff = dateDiff(task.due_date);

    return (
      task.status !== "done" &&
      diff !== null &&
      diff >= 0 &&
      diff <= 3
    );
  }).length;

  $("#stat-todo").textContent = todoTotal;
  $("#stat-progress").textContent = progressTotal;
  $("#stat-done").textContent = doneTotal;
  $("#stat-due").textContent = dueSoonTotal;

  $("#empty-state").hidden = tasks.length > 0;

  bindTaskCards();
}

function bindTaskCards() {
  $$("[data-edit-task]").forEach(button => {
    button.onclick = () =>
      openTaskModal(button.dataset.editTask);
  });

  $$(".task-card").forEach(card => {
    card.ondblclick = () =>
      openTaskModal(card.dataset.taskId);

    card.ondragstart = event => {
      card.classList.add("dragging");

      event.dataTransfer.setData(
        "text/plain",
        card.dataset.taskId
      );
    };

    card.ondragend = () => {
      card.classList.remove("dragging");
    };
  });
}

function updateUserUI() {
  const name =
    state.profile?.display_name ||
    state.user.email?.split("@")[0] ||
    "Nostrix";

  const firstName = name.split(" ")[0];

  $("#user-name").textContent = name;
  $("#user-email").textContent = state.user.email || "";
  $("#greeting-name").textContent = firstName;
  $("#user-avatar").textContent = initials(name);
}

function openTaskModal(taskId = null) {
  const task = taskId
    ? state.tasks.find(item => item.id === taskId)
    : null;

  $("#task-id").value = task?.id || "";
  $("#task-title").value = task?.title || "";
  $("#task-details").value = task?.details || "";
  $("#task-assignee").value =
    task?.assigned_to || state.user.id;

  $("#task-due").value =
    task?.due_date || "";

  $("#task-priority").value =
    task?.priority || "medium";

  $("#task-status").value =
    task?.status || "todo";

  $("#task-modal-title").textContent =
    task
      ? state.language === "ar"
        ? "تعديل المهمة"
        : "Edit task"
      : t("newTask");

  $("#delete-task-btn").hidden = !task;

  $("#task-message").textContent = "";
  $("#task-message").className = "form-message";

  $("#task-modal").hidden = false;

  document.body.style.overflow = "hidden";

  setTimeout(() => {
    $("#task-title")?.focus();
  }, 50);
}

function closeTaskModal() {
  $("#task-modal").hidden = true;
  document.body.style.overflow = "";
}

function openProfileModal() {
  $("#profile-name").value =
    state.profile?.display_name || "";

  $("#profile-role").value =
    state.profile?.job_title || "";

  $("#profile-message").textContent = "";
  $("#profile-message").className = "form-message";

  $("#profile-modal").hidden = false;

  document.body.style.overflow = "hidden";
}

function closeProfileModal() {
  $("#profile-modal").hidden = true;
  document.body.style.overflow = "";
}

async function saveTask(event) {
  event.preventDefault();

  const id = $("#task-id").value;

  const payload = {
    title: $("#task-title").value.trim(),
    details:
      $("#task-details").value.trim() || null,
    assigned_to:
      $("#task-assignee").value || null,
    due_date:
      $("#task-due").value || null,
    priority:
      $("#task-priority").value,
    status:
      $("#task-status").value
  };

  if (!payload.title) return;

  const message = $("#task-message");

  message.textContent =
    state.language === "ar"
      ? "جارٍ الحفظ…"
      : "Saving…";

  const result = id
    ? await state.supabase
        .from("tasks")
        .update(payload)
        .eq("id", id)
    : await state.supabase
        .from("tasks")
        .insert(payload);

  if (result.error) {
    console.error(
      "Save task error:",
      result.error
    );

    message.textContent =
      result.error.message;

    message.className =
      "form-message error";

    return;
  }

  closeTaskModal();

  await loadTasks();

  showToast(w("saved"));
}

async function deleteTask() {
  const id = $("#task-id").value;

  if (!id) return;

  if (!confirm(w("deleteConfirm"))) {
    return;
  }

  const { error } = await state.supabase
    .from("tasks")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(
      "Delete task error:",
      error
    );

    showToast(w("error"));

    return;
  }

  closeTaskModal();

  await loadTasks();

  showToast(w("deleted"));
}

async function moveTask(taskId, status) {
  const { error } = await state.supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId);

  if (error) {
    console.error(
      "Move task error:",
      error
    );

    showToast(w("error"));

    return;
  }

  const task = state.tasks.find(
    item => item.id === taskId
  );

  if (task) {
    task.status = status;
  }

  renderTasks();
}

async function saveProfile(event) {
  event.preventDefault();

  const payload = {
    display_name:
      $("#profile-name").value.trim(),

    job_title:
      $("#profile-role").value.trim() || null
  };

  const { data, error } = await state.supabase
    .from("profiles")
    .update(payload)
    .eq("user_id", state.user.id)
    .select()
    .single();

  if (error) {
    console.error(
      "Profile save error:",
      error
    );

    $("#profile-message").textContent =
      error.message;

    $("#profile-message").className =
      "form-message error";

    return;
  }

  state.profile = data;

  await loadProfiles();

  updateUserUI();

  closeProfileModal();

  showToast(w("profileSaved"));
}

async function handleLogin(event) {
  event.preventDefault();

  const email =
    $("#email")
      .value
      .trim()
      .toLowerCase();

  const message =
    $("#auth-message");

  const button =
    $("#login-form button[type='submit']");

  if (!email) return;

  button.disabled = true;

  message.textContent =
    state.language === "ar"
      ? "جارٍ الإرسال…"
      : "Sending…";

  message.className =
    "form-message";

  const redirectTo =
    `${window.location.origin}/staff/`;

  const { error } =
    await state.supabase.auth.signInWithOtp({
      email,

      options: {
        shouldCreateUser: false,
        emailRedirectTo: redirectTo
      }
    });

  button.disabled = false;

  if (error) {
    console.warn(
      "Auth response:",
      error.message
    );
  }

  message.textContent =
    w("genericAuth");

  message.className =
    "form-message success";
}

async function signOut() {
  if (state.realtime) {
    await state.supabase.removeChannel(
      state.realtime
    );

    state.realtime = null;
  }

  await state.supabase.auth.signOut();

  state.user = null;
  state.profile = null;
  state.profiles = [];
  state.tasks = [];

  showOnly("auth-screen");
}

async function subscribeRealtime() {
  if (state.realtime) {
    await state.supabase.removeChannel(
      state.realtime
    );
  }

  state.realtime =
    state.supabase
      .channel("nostrix-staff-tasks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks"
        },
        () => loadTasks()
      )
      .subscribe();
}

async function enterWorkspace(session) {
  state.user = session.user;

  showOnly("app-screen");

  await loadOwnProfile();
  await loadProfiles();

  updateUserUI();

  await loadTasks();
  await subscribeRealtime();
}

async function initializeSupabase() {
  const configured =
    CONFIG.SUPABASE_URL &&
    CONFIG.SUPABASE_PUBLISHABLE_KEY &&
    !CONFIG.SUPABASE_URL.includes("PASTE_") &&
    !CONFIG.SUPABASE_PUBLISHABLE_KEY.includes("PASTE_");

  if (!configured) {
    showOnly("setup-screen");
    return;
  }

  state.supabase = createClient(
    CONFIG.SUPABASE_URL,
    CONFIG.SUPABASE_PUBLISHABLE_KEY
  );

  const {
    data: { session }
  } =
    await state.supabase.auth.getSession();

  if (session?.user) {
    await enterWorkspace(session);
  } else {
    showOnly("auth-screen");
  }

  state.supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (
        event === "SIGNED_IN" &&
        session?.user
      ) {
        await enterWorkspace(session);
      }

      if (event === "SIGNED_OUT") {
        showOnly("auth-screen");
      }
    }
  );
}

function bindUI() {
  $$(".language-toggle").forEach(button => {
    button.addEventListener(
      "click",
      toggleLanguage
    );
  });

  $("#login-form").addEventListener(
    "submit",
    handleLogin
  );

  $("#new-task-btn").addEventListener(
    "click",
    () => openTaskModal()
  );

  $("#task-form").addEventListener(
    "submit",
    saveTask
  );

  $("#delete-task-btn").addEventListener(
    "click",
    deleteTask
  );

  $("#profile-form").addEventListener(
    "submit",
    saveProfile
  );

  $("#signout-btn").addEventListener(
    "click",
    signOut
  );

  $("#refresh-btn").addEventListener(
    "click",
    async () => {
      await Promise.all([
        loadProfiles(),
        loadTasks()
      ]);

      showToast(w("refreshed"));
    }
  );

  $("#profile-btn").addEventListener(
    "click",
    () => {
      const menu =
        $("#profile-menu");

      menu.hidden =
        !menu.hidden;

      $("#profile-btn")
        .setAttribute(
          "aria-expanded",
          String(!menu.hidden)
        );
    }
  );

  $("#edit-profile-btn").addEventListener(
    "click",
    () => {
      $("#profile-menu").hidden = true;
      openProfileModal();
    }
  );

  document.addEventListener(
    "click",
    event => {
      if (
        !event.target.closest("#profile-btn") &&
        !event.target.closest("#profile-menu")
      ) {
        $("#profile-menu").hidden = true;
      }
    }
  );

  $$("[data-close-modal]").forEach(element => {
    element.addEventListener(
      "click",
      closeTaskModal
    );
  });

  $$("[data-close-profile]").forEach(element => {
    element.addEventListener(
      "click",
      closeProfileModal
    );
  });

  $$(".view-tab").forEach(button => {
    button.addEventListener(
      "click",
      () => {
        state.view =
          button.dataset.view;

        $$(".view-tab").forEach(tab => {
          const active =
            tab === button;

          tab.classList.toggle(
            "active",
            active
          );

          tab.setAttribute(
            "aria-selected",
            String(active)
          );
        });

        renderTasks();
      }
    );
  });

  $("#task-search").addEventListener(
    "input",
    event => {
      state.search =
        event.target.value.trim();

      renderTasks();
    }
  );

  $("#priority-filter").addEventListener(
    "change",
    event => {
      state.priority =
        event.target.value;

      renderTasks();
    }
  );

  $$(".board-column").forEach(column => {
    column.addEventListener(
      "dragover",
      event => {
        event.preventDefault();

        column.classList.add(
          "drag-over"
        );
      }
    );

    column.addEventListener(
      "dragleave",
      () => {
        column.classList.remove(
          "drag-over"
        );
      }
    );

    column.addEventListener(
      "drop",
      event => {
        event.preventDefault();

        column.classList.remove(
          "drag-over"
        );

        const taskId =
          event.dataTransfer.getData(
            "text/plain"
          );

        if (taskId) {
          moveTask(
            taskId,
            column.dataset.status
          );
        }
      }
    );
  });

  document.addEventListener(
    "keydown",
    event => {
      if (event.key !== "Escape") {
        return;
      }

      if (!$("#task-modal").hidden) {
        closeTaskModal();
      }

      if (!$("#profile-modal").hidden) {
        closeProfileModal();
      }
    }
  );
}

document.addEventListener(
  "DOMContentLoaded",
  async () => {
    $("#year").textContent =
      new Date().getFullYear();

    bindUI();

    applyLanguage();

    await initializeSupabase();
  }
);
