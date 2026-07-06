const STORAGE_KEY = "jizhangben-state-v2";
const CLOUD_DIRTY_KEY = "jizhangben-cloud-dirty-v1";
const LEGACY_STORAGE_KEYS = ["qingzhang-state-v1", "jizhangben-state-v1"];
const SUPABASE_URL = "https://wulhenvzdeduozvcshwt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_qZXvz91fUAR7C3gO-RCcrw_ehAiHYMw";
const SITE_URL = "https://shika0914.github.io/jizhangben-app/";
const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) || null;
const today = new Date();
const currentMonth = toMonth(today);

const supportedCurrencies = ["CNY", "USD", "EUR", "GBP", "JPY", "HKD", "TWD", "KRW", "SGD", "AUD", "CAD"];
const currencyNames = {
  CNY: "人民币",
  USD: "美元",
  EUR: "欧元",
  GBP: "英镑",
  JPY: "日元",
  HKD: "港币",
  TWD: "新台币",
  KRW: "韩元",
  SGD: "新加坡元",
  AUD: "澳大利亚元",
  CAD: "加拿大元",
};

const defaultCategories = [
  ["food", "餐饮", "expense", "餐", "#b76e2b"],
  ["transport", "交通", "expense", "行", "#4d7585"],
  ["shopping", "购物", "expense", "购", "#7766a8"],
  ["housing", "住房", "expense", "住", "#687064"],
  ["fun", "娱乐", "expense", "娱", "#9d5d67"],
  ["medical", "医疗", "expense", "医", "#b24a3b"],
  ["education", "教育", "expense", "学", "#5d668f"],
  ["daily", "日用品", "expense", "日", "#5b8379"],
  ["other-expense", "其他", "expense", "其", "#6f746d"],
  ["salary", "工资", "income", "薪", "#247a4d"],
  ["bonus", "奖金", "income", "奖", "#9c7a2b"],
  ["side", "副业", "income", "副", "#3f806d"],
  ["investment", "投资收益", "income", "投", "#4d7585"],
  ["other-income", "其他", "income", "其", "#6f746d"],
].map(([id, name, type, icon, color], sortOrder) => ({
  id,
  name,
  type,
  icon,
  color,
  sortOrder,
  enabled: true,
}));

const defaultAccounts = [
  { id: "alipay", name: "支付宝", type: "alipay", currency: "CNY", initialBalance: 0, includeInAssets: true },
  { id: "wechat", name: "微信", type: "wechat", currency: "CNY", initialBalance: 0, includeInAssets: true },
  { id: "bank", name: "银行卡", type: "bank", currency: "CNY", initialBalance: 0, includeInAssets: true },
  { id: "cash", name: "现金", type: "cash", currency: "CNY", initialBalance: 0, includeInAssets: true },
];

const accountTypes = {
  wechat: { label: "微信", icon: "微", color: "#07c160", logo: "./assets/logos/wechat.svg" },
  alipay: { label: "支付宝", icon: "支", color: "#1677ff", logo: "./assets/logos/alipay.svg" },
  bank: { label: "银行卡", icon: "银", color: "#5c668e" },
  credit_card: { label: "信用卡", icon: "卡", color: "#5c668e" },
  cash: { label: "现金", icon: "现", color: "#a87932" },
  other: { label: "其他钱包", icon: "钱", color: "#6f746d" },
};

const defaultQuickTemplates = [];

let state = loadState();
let selectedType = "expense";
let selectedBillIds = new Set();
let currentUser = null;
let authMode = "login";
let cloudHydrating = false;
let cloudSaveTimer = null;
let cloudLoadedForUser = "";
let draggedAccountId = "";

const el = {
  tabs: document.querySelectorAll(".nav-tab"),
  views: document.querySelectorAll(".view"),
  viewTitle: document.querySelector("#viewTitle"),
  todayText: document.querySelector("#todayText"),
  monthPicker: document.querySelector("#monthPicker"),
  transactionForm: document.querySelector("#transactionForm"),
  quickForm: document.querySelector("#quickForm"),
  quickTemplateForm: document.querySelector("#quickTemplateForm"),
  accountForm: document.querySelector("#accountForm"),
  statsCurrency: document.querySelector("#statsCurrency"),
  accountModal: document.querySelector("#accountModal"),
  authModal: document.querySelector("#authModal"),
  authForm: document.querySelector("#authForm"),
  syncStatus: document.querySelector("#syncStatus"),
  categoryForm: document.querySelector("#categoryForm"),
  toast: document.querySelector("#toast"),
};

const viewTitles = {
  dashboard: "总览",
  assets: "资产",
  add: "记一笔",
  bills: "账单",
  categories: "分类",
  stats: "统计",
};

init();
initCloud();

function init() {
  el.todayText.textContent = new Intl.DateTimeFormat("zh-CN", { dateStyle: "full" }).format(today);
  el.monthPicker.value = state.selectedMonth || currentMonth;
  state.selectedMonth = el.monthPicker.value;
  bindEvents();
  resetTransactionForm();
  resetAccountForm();
  renderAll();
}

function bindEvents() {
  el.tabs.forEach((tab) => tab.addEventListener("click", () => switchView(tab.dataset.view)));
  document.querySelectorAll("[data-view-jump]").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.viewJump));
  });
  el.monthPicker.addEventListener("change", () => {
    state.selectedMonth = el.monthPicker.value;
    saveState();
    renderAll();
  });
  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      selectedType = button.dataset.type;
      setType(selectedType);
    });
  });
  el.transactionForm.addEventListener("submit", saveTransaction);
  el.quickForm.addEventListener("submit", saveQuickTransaction);
  el.quickTemplateForm.addEventListener("submit", saveQuickTemplate);
  el.accountForm.addEventListener("submit", saveAccount);
  el.accountForm.type.addEventListener("change", updateCreditCardFields);
  el.statsCurrency.addEventListener("change", renderStats);
  el.categoryForm.addEventListener("submit", saveCategory);
  el.authForm.addEventListener("submit", submitAuthForm);
  document.querySelector("#openAuthModal").addEventListener("click", () => openAuthModal("login"));
  document.querySelector("#closeAuthModal").addEventListener("click", closeAuthModal);
  document.querySelector("#cancelAuthModal").addEventListener("click", closeAuthModal);
  document.querySelector("#registerButton").addEventListener("click", registerAccount);
  document.querySelector("#forgotPassword").addEventListener("click", requestPasswordReset);
  document.querySelector("#signOutButton").addEventListener("click", signOutAccount);
  document.querySelector("#addQuickTemplate").addEventListener("click", openNewQuickTemplate);
  document.querySelector("#cancelQuickTemplate").addEventListener("click", closeQuickTemplateEditor);
  document.querySelector("#deleteQuickTemplate").addEventListener("click", deleteEditingQuickTemplate);
  document.querySelector("#selectAllBills").addEventListener("change", toggleSelectAllBills);
  document.querySelector("#clearBillSelection").addEventListener("click", clearBillSelection);
  document.querySelector("#deleteSelectedBills").addEventListener("click", deleteSelectedBills);
  document.querySelector("#resetTransaction").addEventListener("click", resetTransactionForm);
  document.querySelector("#openAccountModal").addEventListener("click", openNewAccountModal);
  document.querySelector("#closeAccountModal").addEventListener("click", closeAccountModal);
  document.querySelector("#cancelAccountModal").addEventListener("click", closeAccountModal);
  el.accountModal.addEventListener("click", (event) => {
    if (event.target === el.accountModal) closeAccountModal();
  });
  el.authModal.addEventListener("click", (event) => {
    if (event.target === el.authModal) closeAuthModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !el.accountModal.hidden) closeAccountModal();
    if (event.key === "Escape" && !el.authModal.hidden) closeAuthModal();
  });
  document.querySelector("#resetCategory").addEventListener("click", resetCategoryForm);
  document.querySelector("#exportCsv").addEventListener("click", exportCsv);
  window.addEventListener("focus", () => {
    if (!currentUser || cloudSaveTimer) return;
    if (hasPendingCloudChanges()) saveCloudState();
    else loadCloudState({ silent: true });
  });
  ["billSearch", "typeFilter", "categoryFilter", "accountFilter"].forEach((id) => {
    document.querySelector(`#${id}`).addEventListener("input", renderBills);
  });
}

async function initCloud() {
  if (!supabaseClient) {
    setSyncStatus("云服务加载失败", "error");
    return;
  }

  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    setSyncStatus("登录状态读取失败", "error");
  } else {
    await handleAuthEvent("INITIAL_SESSION", data.session);
  }

  supabaseClient.auth.onAuthStateChange((event, session) => {
    window.setTimeout(() => handleAuthEvent(event, session), 0);
  });
}

async function handleAuthEvent(event, session) {
  if (event === "PASSWORD_RECOVERY") {
    currentUser = session?.user || null;
    updateAuthUI();
    openAuthModal("recovery");
    return;
  }

  if (session?.user) {
    const userChanged = currentUser?.id !== session.user.id;
    currentUser = session.user;
    updateAuthUI();
    if (userChanged || cloudLoadedForUser !== currentUser.id) {
      if (hasPendingCloudChanges()) await saveCloudState();
      else await loadCloudState();
    }
    return;
  }

  currentUser = null;
  cloudLoadedForUser = "";
  updateAuthUI();
  if (event === "SIGNED_OUT") resetToLocalDefault();
}

function updateAuthUI() {
  const loggedIn = Boolean(currentUser);
  document.querySelector("#openAuthModal").hidden = loggedIn;
  document.querySelector("#cloudUser").hidden = !loggedIn;
  document.querySelector("#cloudUserEmail").textContent = currentUser?.email || "";
  if (!loggedIn) setSyncStatus("仅保存在本机");
}

function openAuthModal(mode = "login") {
  authMode = mode;
  const recovery = mode === "recovery";
  el.authForm.reset();
  document.querySelector("#authFormTitle").textContent = recovery ? "设置新密码" : "登录同步";
  document.querySelector("#authEmailField").hidden = recovery;
  document.querySelector("#forgotPassword").hidden = recovery;
  document.querySelector("#registerButton").hidden = recovery;
  document.querySelector("#authSubmit").textContent = recovery ? "更新密码" : "登录";
  el.authForm.password.autocomplete = recovery ? "new-password" : "current-password";
  el.authModal.hidden = false;
  document.body.classList.add("modal-open");
  window.setTimeout(() => (recovery ? el.authForm.password : el.authForm.email).focus(), 0);
}

function closeAuthModal() {
  el.authModal.hidden = true;
  document.body.classList.remove("modal-open");
  authMode = "login";
  el.authForm.reset();
}

async function submitAuthForm(event) {
  event.preventDefault();
  if (!supabaseClient) return toast("云服务暂时不可用");
  const password = el.authForm.password.value;

  if (authMode === "recovery") {
    const { error } = await supabaseClient.auth.updateUser({ password });
    if (error) return toast(friendlyAuthError(error));
    closeAuthModal();
    toast("密码已更新");
    return;
  }

  const email = el.authForm.email.value.trim();
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) return toast(friendlyAuthError(error));
  closeAuthModal();
  toast("登录成功");
}

async function registerAccount() {
  if (!el.authForm.reportValidity()) return;
  if (!supabaseClient) return toast("云服务暂时不可用");
  const email = el.authForm.email.value.trim();
  const password = el.authForm.password.value;
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: SITE_URL },
  });
  if (error) return toast(friendlyAuthError(error));
  closeAuthModal();
  toast(data.session ? "注册并登录成功" : "验证邮件已发送");
}

async function requestPasswordReset() {
  if (!supabaseClient) return toast("云服务暂时不可用");
  const email = el.authForm.email.value.trim();
  if (!email || !el.authForm.email.checkValidity()) {
    el.authForm.email.focus();
    return toast("请填写正确的邮箱");
  }
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: SITE_URL });
  if (error) return toast(friendlyAuthError(error));
  closeAuthModal();
  toast("密码重置邮件已发送");
}

async function signOutAccount() {
  if (!confirm("退出后将清除本机显示的账号数据，云端数据会保留。确定退出吗？")) return;
  window.clearTimeout(cloudSaveTimer);
  cloudSaveTimer = null;
  if (hasPendingCloudChanges()) await saveCloudState();
  if (hasPendingCloudChanges()) return toast("数据尚未同步，请恢复网络后再退出");
  const { error } = await supabaseClient.auth.signOut();
  if (error) toast(friendlyAuthError(error));
}

async function loadCloudState({ silent = false } = {}) {
  if (!supabaseClient || !currentUser) return;
  if (!silent) setSyncStatus("正在读取云端…", "syncing");
  const userId = currentUser.id;
  const { data, error } = await supabaseClient
    .from("ledger_states")
    .select("data, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    setSyncStatus("云端读取失败", "error");
    return;
  }
  if (currentUser?.id !== userId) return;

  const hasCloudLedger = data?.data && Array.isArray(data.data.accounts) && Array.isArray(data.data.transactions);
  if (!hasCloudLedger) {
    await saveCloudState();
    cloudLoadedForUser = userId;
    return;
  }

  cloudHydrating = true;
  state = migrateState(data.data);
  state.selectedMonth = state.selectedMonth || currentMonth;
  el.monthPicker.value = state.selectedMonth;
  saveLocalState();
  cloudHydrating = false;
  cloudLoadedForUser = userId;
  renderAll();
  setSyncStatus("已同步", "synced");
}

function queueCloudSave() {
  if (!currentUser || cloudHydrating) return;
  markCloudDirty();
  window.clearTimeout(cloudSaveTimer);
  setSyncStatus("等待同步…", "syncing");
  cloudSaveTimer = window.setTimeout(() => {
    cloudSaveTimer = null;
    saveCloudState();
  }, 600);
}

async function saveCloudState() {
  if (!supabaseClient || !currentUser) return;
  const userId = currentUser.id;
  markCloudDirty();
  setSyncStatus("正在同步…", "syncing");
  const { error } = await supabaseClient.from("ledger_states").upsert(
    {
      user_id: userId,
      data: state,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) {
    setSyncStatus("同步失败，已保存在本机", "error");
    return;
  }
  if (currentUser?.id === userId) {
    clearCloudDirty();
    cloudLoadedForUser = userId;
    setSyncStatus("已同步", "synced");
  }
}

function markCloudDirty() {
  if (currentUser) localStorage.setItem(CLOUD_DIRTY_KEY, currentUser.id);
}

function clearCloudDirty() {
  localStorage.removeItem(CLOUD_DIRTY_KEY);
}

function hasPendingCloudChanges() {
  return Boolean(currentUser && localStorage.getItem(CLOUD_DIRTY_KEY) === currentUser.id);
}

function setSyncStatus(message, status = "") {
  el.syncStatus.textContent = message;
  el.syncStatus.className = `sync-status${status ? ` is-${status}` : ""}`;
}

function resetToLocalDefault() {
  clearCloudDirty();
  state = createDefaultState();
  selectedBillIds.clear();
  saveLocalState();
  resetTransactionForm();
  renderAll();
}

function friendlyAuthError(error) {
  const message = String(error?.message || "操作失败");
  if (message.includes("Invalid login credentials")) return "邮箱或密码不正确";
  if (message.includes("User already registered")) return "这个邮箱已经注册";
  if (message.toLowerCase().includes("password")) return "密码至少需要 8 位";
  if (message.toLowerCase().includes("email")) return "邮箱格式或邮件服务配置有误";
  return message;
}

function switchView(view) {
  el.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === view));
  el.views.forEach((item) => item.classList.toggle("active", item.id === `${view}View`));
  el.viewTitle.textContent = viewTitles[view];
  document.querySelector(".month-control").hidden = view === "assets";
}

function renderAll() {
  fillSelects();
  renderDashboard();
  renderAssets();
  renderBills();
  renderCategories();
  renderStats();
  renderTemplates();
}

function renderDashboard() {
  const transactions = monthTransactions();
  const todayTransactions = state.transactions.filter((item) => item.date.slice(0, 10) === toDateInput(today));

  setText("monthExpense", formatCurrencyTotals(sumByCurrency(transactions, "expense")));
  setText("monthIncome", formatCurrencyTotals(sumByCurrency(transactions, "income")));
  setText("monthBalance", formatCurrencyTotals(netByCurrency(transactions)));
  setText("todayExpense", formatCurrencyTotals(sumByCurrency(todayTransactions, "expense")));
  renderDashboardAssetTotals(getTotalAssetsByCurrency());

  const recent = [...state.transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);
  renderList("recentBills", recent, renderBillItem, "还没有账单");

  const categoryTotals = getCategoryExpenseTotals(transactions).slice(0, 5);
  renderList("topCategories", categoryTotals, renderRankItem, "本月还没有支出");
}

function renderAssets() {
  const accounts = state.accounts.map((account, index) => ({
    account,
    balance: getAccountBalance(account.id),
    index,
    total: state.accounts.length,
  }));
  const included = accounts.filter(({ account }) => account.includeInAssets);
  const excludedCount = accounts.length - included.length;

  renderAssetTotals(getTotalAssetsByCurrency());
  setText("includedAccountCount", `${included.length} 个计入总资产`);
  setText(
    "assetSummary",
    excludedCount ? `共 ${accounts.length} 个钱包，${excludedCount} 个未计入` : `共 ${accounts.length} 个钱包，已全部计入`
  );
  renderList("accountList", accounts, renderAccountItem, "还没有钱包");
}

function renderBills() {
  const query = document.querySelector("#billSearch").value.trim().toLowerCase();
  const type = document.querySelector("#typeFilter").value;
  const category = document.querySelector("#categoryFilter").value;
  const account = document.querySelector("#accountFilter").value;
  const rows = monthTransactions()
    .filter((item) => type === "all" || item.type === type)
    .filter((item) => category === "all" || item.categoryId === category)
    .filter((item) => account === "all" || item.accountId === account || item.targetAccountId === account)
    .filter((item) => {
      const haystack = `${item.note} ${item.tags.join(",")}`.toLowerCase();
      return !query || haystack.includes(query);
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  selectedBillIds = new Set([...selectedBillIds].filter((id) => rows.some((item) => item.id === id)));
  renderList("billTable", rows, renderTableRow, "没有符合条件的账单");
  updateBulkToolbar(rows);
}

function renderCategories() {
  const rows = [...state.categories].sort((a, b) => a.type.localeCompare(b.type) || a.sortOrder - b.sortOrder);
  renderList("categoryList", rows, renderCategoryItem, "还没有分类");
}

function renderStats() {
  const currency = el.statsCurrency.value || "CNY";
  const transactions = monthTransactions().filter((item) => transactionCurrency(item) === currency);
  const expenses = transactions.filter((item) => item.type === "expense");
  const expense = sumByType(transactions, "expense");
  const income = sumByType(transactions, "income");
  const savingRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
  const categoryTotals = getCategoryExpenseTotals(transactions, currency);
  const largest = categoryTotals[0];
  const biggestBill = expenses.sort((a, b) => b.amount - a.amount)[0];
  const previousExpense = sumByType(
    transactionsForMonth(addMonths(state.selectedMonth, -1)).filter((item) => transactionCurrency(item) === currency),
    "expense"
  );

  setText("savingRate", `${savingRate}%`);
  setText("largestCategory", largest ? largest.category.name : "-");
  setText("largestExpense", biggestBill ? money(biggestBill.amount, currency) : money(0, currency));
  setText("monthDelta", money(expense - previousExpense, currency));

  renderDailyChart(expenses, currency);
  renderCategoryShare(categoryTotals, expense, currency);
}

function renderTemplates() {
  const target = document.querySelector("#templateRow");
  target.innerHTML = state.quickTemplates.length
    ? state.quickTemplates.map(renderQuickTemplate).join("")
    : `<span class="empty-inline">暂无模板，点击右上角新建</span>`;
}

function renderQuickTemplate(item) {
  const category = findCategory(item.categoryId);
  return `<article class="quick-template-card">
    <button class="template-use" type="button" onclick="recordQuickTemplate('${item.id}')" title="使用此模板记一笔">
      ${categoryBadge(category)}
      <span class="template-copy">
        <strong>${escapeHtml(item.note)}</strong>
        <small>${escapeHtml(category?.name || "其他")} · ${escapeHtml(accountName(item.accountId) || "默认钱包")}</small>
      </span>
      <strong class="template-amount">${money(item.amount, currencyForAccount(item.accountId))}</strong>
    </button>
    <button class="template-edit" type="button" onclick="editQuickTemplate('${item.id}')" title="编辑模板" aria-label="编辑模板">
      <span class="action-icon pencil-icon" aria-hidden="true"></span>
    </button>
  </article>`;
}

function recordQuickTemplate(id) {
  const item = state.quickTemplates.find((template) => template.id === id);
  if (!item) return;
  addQuickExpense(item.amount, item.categoryId, item.note, item.accountId);
  toast(`已记录“${item.note}” ${money(item.amount, currencyForAccount(item.accountId))}`);
}

function openNewQuickTemplate() {
  const form = el.quickTemplateForm;
  form.reset();
  form.id.value = "";
  fillCategorySelect(form.categoryId, "expense");
  fillAccountSelect(form.accountId);
  form.hidden = false;
  form.querySelector(".template-delete").hidden = true;
  form.note.focus();
}

function editQuickTemplate(id) {
  const item = state.quickTemplates.find((template) => template.id === id);
  if (!item) return;
  const form = el.quickTemplateForm;
  form.id.value = item.id;
  form.note.value = item.note;
  form.amount.value = item.amount;
  fillCategorySelect(form.categoryId, "expense");
  form.categoryId.value = item.categoryId;
  fillAccountSelect(form.accountId);
  form.accountId.value = findAccount(item.accountId) ? item.accountId : defaultAccountId();
  form.hidden = false;
  form.querySelector(".template-delete").hidden = false;
  form.note.focus();
}

function saveQuickTemplate(event) {
  event.preventDefault();
  const form = el.quickTemplateForm;
  const template = {
    id: form.id.value || crypto.randomUUID(),
    note: form.note.value.trim(),
    amount: Number(form.amount.value),
    categoryId: form.categoryId.value,
    accountId: form.accountId.value,
  };
  const index = state.quickTemplates.findIndex((item) => item.id === template.id);
  if (index >= 0) state.quickTemplates[index] = template;
  else state.quickTemplates.push(template);
  saveState();
  closeQuickTemplateEditor();
  renderTemplates();
  toast(index >= 0 ? "模板已更新" : "模板已创建");
}

function deleteEditingQuickTemplate() {
  const id = el.quickTemplateForm.id.value;
  const item = state.quickTemplates.find((template) => template.id === id);
  if (!item) return;
  if (!confirm(`确定删除模板“${item.note} ${money(item.amount, currencyForAccount(item.accountId))}”吗？`)) return;
  state.quickTemplates = state.quickTemplates.filter((template) => template.id !== id);
  saveState();
  closeQuickTemplateEditor();
  renderTemplates();
  toast("模板已删除");
}

function closeQuickTemplateEditor() {
  el.quickTemplateForm.hidden = true;
  el.quickTemplateForm.reset();
}

function renderDailyChart(expenses, currency) {
  const days = new Date(...state.selectedMonth.split("-").map((value, index) => index === 1 ? Number(value) : Number(value)), 0).getDate();
  const totals = Array.from({ length: days }, (_, index) => ({ day: index + 1, amount: 0 }));
  expenses.forEach((item) => {
    const day = new Date(item.date).getDate();
    totals[day - 1].amount += item.amount;
  });
  const max = Math.max(...totals.map((item) => item.amount), 1);
  document.querySelector("#dailyChart").innerHTML = totals
    .map((item) => {
      const height = Math.max((item.amount / max) * 190, item.amount ? 8 : 4);
      return `<div class="bar" title="${item.day}日 ${money(item.amount, currency)}"><span style="height:${height}px"></span>${item.day}</div>`;
    })
    .join("");
}

function renderCategoryShare(rows, total, currency) {
  const colors = rows.map((row) => row.category.color);
  let cursor = 0;
  const segments = rows
    .map((row) => {
      const start = cursor;
      const end = cursor + (row.amount / Math.max(total, 1)) * 100;
      cursor = end;
      return `${row.category.color} ${start}% ${end}%`;
    })
    .join(", ");
  document.querySelector("#categoryDonut").style.background = segments ? `conic-gradient(${segments})` : "#eee8de";
  renderList(
    "categoryShare",
    rows,
    (row, index) => `<div class="rank-item">
      <span class="category-dot" style="background:${colors[index]}">${row.category.icon}</span>
      <div class="item-main"><strong>${row.category.name}</strong><span>${Math.round((row.amount / Math.max(total, 1)) * 100)}%</span></div>
      <strong>${money(row.amount, currency)}</strong>
    </div>`,
    "本月还没有支出"
  );
}

function saveTransaction(event) {
  event.preventDefault();
  const form = el.transactionForm;
  const sourceAccount = findAccount(form.accountId.value || defaultAccountId());
  const targetAccount = findAccount(form.targetAccountId.value);
  if (selectedType === "transfer" && form.accountId.value === form.targetAccountId.value) {
    toast("转出和转入不能是同一个钱包");
    return;
  }
  if (selectedType === "transfer" && sourceAccount?.currency !== targetAccount?.currency) {
    toast("暂不支持不同币种钱包之间直接转账");
    return;
  }
  const transaction = {
    id: form.id.value || crypto.randomUUID(),
    type: selectedType,
    amount: Number(form.amount.value),
    currency: sourceAccount?.currency || "CNY",
    categoryId: selectedType === "transfer" ? "transfer" : form.categoryId.value,
    accountId: form.accountId.value || defaultAccountId(),
    targetAccountId: selectedType === "transfer" ? form.targetAccountId.value : "",
    date: new Date(form.date.value).toISOString(),
    note: form.note.value.trim(),
    tags: splitTags(form.tags.value),
    createdAt: form.id.value ? findTransaction(form.id.value).createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  upsertTransaction(transaction);
  resetTransactionForm();
  form.amount.focus();
  toast("账单已保存");
}

function saveQuickTransaction(event) {
  event.preventDefault();
  const form = el.quickForm;
  addQuickExpense(Number(form.amount.value), form.categoryId.value, form.note.value.trim(), form.accountId.value);
  form.reset();
  fillSelects();
  toast("已记一笔");
}

function addQuickExpense(amount, categoryId, note, accountId = defaultAccountId()) {
  const timestamp = new Date().toISOString();
  const resolvedAccountId = findAccount(accountId) ? accountId : defaultAccountId();
  upsertTransaction({
    id: crypto.randomUUID(),
    type: "expense",
    amount,
    categoryId,
    accountId: resolvedAccountId,
    currency: currencyForAccount(resolvedAccountId),
    targetAccountId: "",
    date: timestamp,
    note,
    tags: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

function saveAccount(event) {
  event.preventDefault();
  const form = el.accountForm;
  const name = form.name.value.trim();
  const isCreditCard = form.type.value === "credit_card";
  const duplicate = state.accounts.some(
    (item) => item.id !== form.id.value && item.name.trim().toLowerCase() === name.toLowerCase()
  );
  if (duplicate) {
    toast("已经有同名钱包了");
    return;
  }

  const account = {
    id: form.id.value || crypto.randomUUID(),
    name,
    type: form.type.value,
    currency: supportedCurrencies.includes(form.currency.value) ? form.currency.value : "CNY",
    initialBalance: isCreditCard ? -Math.abs(Number(form.initialBalance.value || 0)) : Number(form.initialBalance.value || 0),
    creditLimit: isCreditCard ? Math.max(0, Number(form.creditLimit.value || 0)) : 0,
    billingDay: isCreditCard ? Number(form.billingDay.value || 1) : 1,
    dueDay: isCreditCard ? Number(form.dueDay.value || 20) : 20,
    includeInAssets: form.includeInAssets.checked,
  };
  const index = state.accounts.findIndex((item) => item.id === account.id);
  const existingAccount = index >= 0 ? state.accounts[index] : null;
  const hasTransactions = existingAccount && state.transactions.some(
    (item) => item.accountId === account.id || item.targetAccountId === account.id
  );
  if (hasTransactions && existingAccount.currency !== account.currency) {
    toast("已有账单的钱包不能直接修改币种");
    return;
  }
  if (hasTransactions && existingAccount.type !== account.type && [existingAccount.type, account.type].includes("credit_card")) {
    toast("已有账单的钱包不能切换为信用卡类型");
    return;
  }
  if (index >= 0) state.accounts[index] = account;
  else state.accounts.push(account);
  saveState();
  closeAccountModal();
  renderAll();
  toast(index >= 0 ? "钱包已更新" : "钱包已添加");
}

function saveCategory(event) {
  event.preventDefault();
  const form = el.categoryForm;
  const category = {
    id: form.id.value || slugify(form.name.value),
    name: form.name.value.trim(),
    type: form.type.value,
    icon: form.icon.value.trim().slice(0, 2),
    color: form.color.value,
    sortOrder: form.id.value ? findCategory(form.id.value).sortOrder : state.categories.length + 1,
    enabled: form.enabled.checked,
  };
  const index = state.categories.findIndex((item) => item.id === category.id);
  if (index >= 0) state.categories[index] = category;
  else state.categories.push(category);
  saveState();
  resetCategoryForm();
  renderAll();
  toast("分类已保存");
}

function upsertTransaction(transaction) {
  const index = state.transactions.findIndex((item) => item.id === transaction.id);
  if (index >= 0) state.transactions[index] = transaction;
  else state.transactions.unshift(transaction);
  saveState();
  renderAll();
}

function editTransaction(id) {
  const item = findTransaction(id);
  selectedType = item.type;
  setType(item.type);
  const form = el.transactionForm;
  form.id.value = item.id;
  form.amount.value = item.amount;
  form.categoryId.value = item.categoryId;
  form.accountId.value = item.accountId;
  form.targetAccountId.value = item.targetAccountId || "";
  form.date.value = toDateTimeInput(new Date(item.date));
  form.tags.value = item.tags.join(", ");
  form.note.value = item.note;
  switchView("add");
}

function deleteTransaction(id) {
  if (!confirm("确定删除这笔账单吗？")) return;
  state.transactions = state.transactions.filter((item) => item.id !== id);
  selectedBillIds.delete(id);
  saveState();
  renderAll();
  toast("账单已删除");
}

function toggleBillSelection(id, checked) {
  if (checked) selectedBillIds.add(id);
  else selectedBillIds.delete(id);
  updateBulkToolbar(getVisibleBillRows());
}

function toggleSelectAllBills(event) {
  const rows = getVisibleBillRows();
  if (event.target.checked) rows.forEach((item) => selectedBillIds.add(item.id));
  else rows.forEach((item) => selectedBillIds.delete(item.id));
  renderBills();
}

function clearBillSelection() {
  selectedBillIds.clear();
  renderBills();
}

function deleteSelectedBills() {
  const count = selectedBillIds.size;
  if (!count) {
    toast("请先选择账单");
    return;
  }
  if (!confirm(`确定删除已选的 ${count} 笔账单吗？此操作无法撤销。`)) return;
  state.transactions = state.transactions.filter((item) => !selectedBillIds.has(item.id));
  selectedBillIds.clear();
  saveState();
  renderAll();
  toast("已批量删除");
}

function getVisibleBillRows() {
  return [...document.querySelectorAll(".bill-select")]
    .map((input) => findTransaction(input.value))
    .filter(Boolean);
}

function updateBulkToolbar(rows = getVisibleBillRows()) {
  const visibleIds = rows.map((item) => item.id);
  const selectedVisibleCount = visibleIds.filter((id) => selectedBillIds.has(id)).length;
  const selectedTotal = selectedBillIds.size;
  const selectAll = document.querySelector("#selectAllBills");
  selectAll.checked = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  selectAll.indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < visibleIds.length;
  document.querySelector("#selectedBillCount").textContent = `已选 ${selectedTotal} 笔`;
  document.querySelector("#deleteSelectedBills").disabled = selectedTotal === 0;
  document.querySelector("#clearBillSelection").disabled = selectedTotal === 0;
}

function editCategory(id) {
  const item = findCategory(id);
  const form = el.categoryForm;
  form.id.value = item.id;
  form.name.value = item.name;
  form.type.value = item.type;
  form.icon.value = item.icon;
  form.color.value = item.color;
  form.enabled.checked = item.enabled;
  document.querySelector("#categoryFormTitle").textContent = "编辑分类";
}

function deleteCategory(id) {
  const category = findCategory(id);
  if (!category) return;
  const fallbackId = category.type === "income" ? "other-income" : "other-expense";
  if (id === fallbackId) {
    toast("默认“其他”分类不能删除");
    return;
  }

  const usedCount = state.transactions.filter((item) => item.categoryId === id).length;
  const message = usedCount
    ? `这个分类下有 ${usedCount} 笔账单。删除后这些账单会归到“其他”，确定删除吗？`
    : `确定删除“${category.name}”分类吗？`;
  if (!confirm(message)) return;

  state.transactions = state.transactions.map((item) => (item.categoryId === id ? { ...item, categoryId: fallbackId } : item));
  state.categories = state.categories.filter((item) => item.id !== id);
  saveState();
  resetCategoryForm();
  renderAll();
  toast("分类已删除");
}

function editAccount(id) {
  const account = findAccount(id);
  if (!account) return;
  const form = el.accountForm;
  form.id.value = account.id;
  form.name.value = account.name;
  form.type.value = account.type;
  form.currency.value = account.currency || "CNY";
  updateCreditCardFields();
  form.creditLimit.value = account.creditLimit || 0;
  form.billingDay.value = account.billingDay || 1;
  form.dueDay.value = account.dueDay || 20;
  form.initialBalance.value = account.type === "credit_card" ? Math.abs(account.initialBalance) : account.initialBalance;
  form.includeInAssets.checked = account.includeInAssets;
  document.querySelector("#accountFormTitle").textContent = "编辑钱包";
  showAccountModal();
}

function deleteAccount(id) {
  const account = findAccount(id);
  if (!account) return;
  const usedCount = state.transactions.filter((item) => item.accountId === id || item.targetAccountId === id).length;
  if (usedCount) {
    toast(`这个钱包关联了 ${usedCount} 笔账单，暂时不能删除`);
    return;
  }
  if (state.accounts.length === 1) {
    toast("至少需要保留一个钱包");
    return;
  }
  if (!confirm(`确定删除钱包“${account.name}”吗？`)) return;
  const replacementId = state.accounts.find((item) => item.id !== id).id;
  state.quickTemplates = state.quickTemplates.map((template) =>
    template.accountId === id ? { ...template, accountId: replacementId } : template
  );
  state.accounts = state.accounts.filter((item) => item.id !== id);
  saveState();
  resetAccountForm();
  renderAll();
  toast("钱包已删除");
}

function moveAccount(id, direction) {
  const index = state.accounts.findIndex((item) => item.id === id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= state.accounts.length) return;

  const accounts = [...state.accounts];
  const [account] = accounts.splice(index, 1);
  accounts.splice(nextIndex, 0, account);
  state.accounts = accounts;
  saveState();
  renderAll();
  toast("钱包顺序已更新");
}

function startAccountDrag(event, id) {
  draggedAccountId = id;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", id);
  event.currentTarget.closest(".account-item")?.classList.add("is-dragging");
}

function endAccountDrag(event) {
  draggedAccountId = "";
  event.currentTarget.closest(".account-item")?.classList.remove("is-dragging");
  document.querySelectorAll(".account-item.is-drag-over").forEach((item) => item.classList.remove("is-drag-over"));
}

function allowAccountDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.add("is-drag-over");
}

function leaveAccountDrop(event) {
  if (event.currentTarget.contains(event.relatedTarget)) return;
  event.currentTarget.classList.remove("is-drag-over");
}

function dropAccount(event, targetId) {
  event.preventDefault();
  event.currentTarget.classList.remove("is-drag-over");
  const sourceId = draggedAccountId || event.dataTransfer.getData("text/plain");
  if (!sourceId || sourceId === targetId) return;

  const accounts = [...state.accounts];
  const sourceIndex = accounts.findIndex((item) => item.id === sourceId);
  if (sourceIndex < 0) return;

  const [account] = accounts.splice(sourceIndex, 1);
  const targetIndex = accounts.findIndex((item) => item.id === targetId);
  if (targetIndex < 0) return;

  const rect = event.currentTarget.getBoundingClientRect();
  const insertAfter = event.clientY > rect.top + rect.height / 2;
  accounts.splice(targetIndex + (insertAfter ? 1 : 0), 0, account);
  state.accounts = accounts;
  saveState();
  renderAll();
  toast("钱包顺序已更新");
}

function resetTransactionForm() {
  el.transactionForm.reset();
  el.transactionForm.date.value = toDateTimeInput(new Date());
  el.transactionForm.accountId.value = defaultAccountId();
  selectedType = "expense";
  setType("expense");
}

function resetAccountForm() {
  el.accountForm.reset();
  el.accountForm.id.value = "";
  el.accountForm.currency.value = "CNY";
  el.accountForm.creditLimit.value = "0";
  el.accountForm.billingDay.value = "1";
  el.accountForm.dueDay.value = "20";
  el.accountForm.initialBalance.value = "0";
  el.accountForm.includeInAssets.checked = true;
  document.querySelector("#accountFormTitle").textContent = "新增钱包";
  updateCreditCardFields();
}

function updateCreditCardFields() {
  const form = el.accountForm;
  const isCreditCard = form.type.value === "credit_card";
  document.querySelector("#creditCardFields").hidden = !isCreditCard;
  form.creditLimit.disabled = !isCreditCard;
  form.billingDay.disabled = !isCreditCard;
  form.dueDay.disabled = !isCreditCard;
  document.querySelector("#initialBalanceLabel").textContent = isCreditCard ? "当前欠款" : "期初余额";
  if (isCreditCard) {
    form.initialBalance.min = "0";
    form.initialBalance.value = Math.abs(Number(form.initialBalance.value || 0));
  } else {
    form.initialBalance.removeAttribute("min");
  }
}

function openNewAccountModal() {
  resetAccountForm();
  showAccountModal();
}

function showAccountModal() {
  el.accountModal.hidden = false;
  document.body.classList.add("modal-open");
  el.accountForm.name.focus();
}

function closeAccountModal() {
  el.accountModal.hidden = true;
  document.body.classList.remove("modal-open");
  resetAccountForm();
}

function resetCategoryForm() {
  el.categoryForm.reset();
  el.categoryForm.id.value = "";
  el.categoryForm.color.value = "#0f766e";
  el.categoryForm.enabled.checked = true;
  document.querySelector("#categoryFormTitle").textContent = "新增分类";
}

function setType(type) {
  selectedType = type;
  document.querySelectorAll(".segment").forEach((button) => button.classList.toggle("active", button.dataset.type === type));
  el.transactionForm.classList.toggle("is-transfer", type === "transfer");
  fillCategorySelect(el.transactionForm.categoryId, type === "transfer" ? "expense" : type);
  el.transactionForm.categoryId.disabled = type === "transfer";
}

function fillSelects() {
  fillCategorySelect(el.quickForm.categoryId, "expense");
  fillCategorySelect(el.quickTemplateForm.categoryId, "expense");
  fillAccountSelect(el.quickForm.accountId);
  fillAccountSelect(el.quickTemplateForm.accountId);
  fillCategorySelect(el.transactionForm.categoryId, selectedType === "transfer" ? "expense" : selectedType);
  fillCategoryFilter();
  fillAccountSelect(el.transactionForm.accountId);
  fillAccountSelect(el.transactionForm.targetAccountId);
  fillAccountFilter();
  fillStatsCurrencySelect();
}

function fillCategorySelect(select, type) {
  const selected = select.value;
  select.innerHTML = enabledCategories(type)
    .map((item) => `<option value="${item.id}">${item.name}</option>`)
    .join("");
  if (selected) select.value = selected;
}

function fillCategoryFilter() {
  const select = document.querySelector("#categoryFilter");
  const selected = select.value;
  select.innerHTML = `<option value="all">全部分类</option>${state.categories
    .map((item) => `<option value="${item.id}">${item.name}</option>`)
    .join("")}`;
  select.value = selected || "all";
}

function fillAccountSelect(select) {
  const selected = select.value;
  select.innerHTML = state.accounts
    .map((item) => `<option value="${item.id}">${escapeHtml(item.name)} · ${item.currency || "CNY"}</option>`)
    .join("");
  if (selected) select.value = selected;
}

function fillStatsCurrencySelect() {
  const selected = el.statsCurrency.value;
  const currencies = [...new Set(state.accounts.map((account) => account.currency || "CNY"))];
  el.statsCurrency.innerHTML = currencies
    .map((currency) => `<option value="${currency}">${currencyNames[currency] || currency} ${currency}</option>`)
    .join("");
  el.statsCurrency.value = currencies.includes(selected) ? selected : currencies.includes("CNY") ? "CNY" : currencies[0];
}

function fillAccountFilter() {
  const select = document.querySelector("#accountFilter");
  const selected = select.value;
  select.innerHTML = `<option value="all">全部账户</option>${state.accounts
    .map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`)
    .join("")}`;
  select.value = selected || "all";
}

function renderList(id, rows, renderer, emptyText) {
  const target = document.querySelector(`#${id}`);
  target.innerHTML = rows.length ? rows.map(renderer).join("") : `<div class="empty">${emptyText}</div>`;
}

function renderBillItem(item) {
  const category = findCategory(item.categoryId);
  return `<div class="bill-item">
    ${categoryBadge(category, item.type)}
    <div class="item-main">
      <strong>${item.note || typeLabel(item.type)}</strong>
      <span>${formatDate(item.date)} · ${escapeHtml(accountName(item.accountId))}</span>
    </div>
    <div class="quick-bill-actions">
      <strong class="amount-${item.type}">${signedMoney(item)}</strong>
      <div class="row-actions">
        <button class="icon-button" type="button" onclick="editTransaction('${item.id}')" title="编辑账单" aria-label="编辑账单"><span class="action-icon pencil-icon" aria-hidden="true"></span></button>
        <button class="icon-button danger-button" type="button" onclick="deleteTransaction('${item.id}')" title="删除账单" aria-label="删除账单"><span class="action-icon trash-icon" aria-hidden="true"></span></button>
      </div>
    </div>
  </div>`;
}

function renderTableRow(item) {
  const category = findCategory(item.categoryId);
  return `<div class="table-row">
    <label class="bill-check" title="选择账单">
      <input class="bill-select" type="checkbox" value="${item.id}" ${selectedBillIds.has(item.id) ? "checked" : ""} onchange="toggleBillSelection('${item.id}', this.checked)" />
    </label>
    <span class="item-meta">${formatDate(item.date)}</span>
    ${categoryBadge(category, item.type)}
    <div class="item-main">
      <strong>${category?.name || typeLabel(item.type)} · ${item.note || "无备注"}</strong>
      <span>${item.tags.join("、") || "无标签"}</span>
    </div>
    <span>${escapeHtml(accountName(item.accountId))}</span>
    <strong class="amount-${item.type}">${signedMoney(item)}</strong>
    <div class="row-actions">
      <button class="icon-button" type="button" onclick="editTransaction('${item.id}')" title="编辑账单" aria-label="编辑账单"><span class="action-icon pencil-icon" aria-hidden="true"></span></button>
      <button class="icon-button danger-button" type="button" onclick="deleteTransaction('${item.id}')" title="删除账单" aria-label="删除账单"><span class="action-icon trash-icon" aria-hidden="true"></span></button>
    </div>
  </div>`;
}

function renderRankItem(row) {
  const percent = row.total ? Math.round((row.amount / row.total) * 100) : 0;
  return `<div class="rank-item">
    ${categoryBadge(row.category)}
    <div class="item-main">
      <strong>${row.category.name}</strong>
      <span>${percent}%</span>
    </div>
    <strong>${money(row.amount, row.currency || "CNY")}</strong>
  </div>`;
}

function renderAccountItem({ account, balance, index, total }) {
  const meta = getAccountVisual(account);
  const isCreditCard = account.type === "credit_card";
  const outstanding = isCreditCard ? Math.max(0, -balance) : 0;
  const availableCredit = isCreditCard ? Math.max(0, Number(account.creditLimit || 0) - outstanding) : 0;
  const logo = account.type === "bank" || isCreditCard
    ? `<span class="account-icon has-logo account-line-logo"><img src="assets/logos/bank-card.jpg" alt="" /></span>`
    : account.type === "cash"
      ? `<span class="account-icon has-logo account-line-logo cash-logo"><img src="assets/logos/cash-white.png" alt="" /></span>`
      : meta.logo
      ? `<span class="account-icon has-logo payment-logo" style="--account-color:${meta.color}"><img src="${meta.logo}" alt="" /></span>`
      : `<span class="account-icon" style="background:${meta.color}">${meta.icon}</span>`;
  const detail = isCreditCard
    ? `${meta.label} · ${account.currency} · 账单日 ${account.billingDay} 日 · 还款日 ${account.dueDay} 日 · 可用 ${money(availableCredit, account.currency)}`
    : `${meta.label} · ${currencyNames[account.currency] || account.currency} ${account.currency} · ${account.includeInAssets ? "计入总资产" : "未计入总资产"}`;
  const balanceMarkup = isCreditCard
    ? `<div class="account-balance-block"><span>待还款</span><strong class="account-balance ${outstanding > 0 ? "is-negative" : ""}">${money(outstanding, account.currency)}</strong></div>`
    : `<strong class="account-balance ${balance < 0 ? "is-negative" : ""}">${money(balance, account.currency)}</strong>`;
  return `<div class="account-item" ondragover="allowAccountDrop(event)" ondragleave="leaveAccountDrop(event)" ondrop="dropAccount(event, '${account.id}')">
    ${logo}
    <div class="item-main">
      <strong>${escapeHtml(account.name)}</strong>
      <span>${detail}</span>
    </div>
    ${balanceMarkup}
    <div class="row-actions">
      <button class="icon-button drag-handle" type="button" draggable="true" ondragstart="startAccountDrag(event, '${account.id}')" ondragend="endAccountDrag(event)" title="拖动排序" aria-label="拖动排序"><span aria-hidden="true"></span></button>
      <button class="icon-button" type="button" onclick="editAccount('${account.id}')" title="编辑钱包" aria-label="编辑钱包"><span class="action-icon pencil-icon" aria-hidden="true"></span></button>
      <button class="icon-button danger-button" type="button" onclick="deleteAccount('${account.id}')" title="删除钱包" aria-label="删除钱包"><span class="action-icon trash-icon" aria-hidden="true"></span></button>
    </div>
  </div>`;
}

function getAccountVisual(account) {
  return accountTypes[account.type] || accountTypes.other;
}

function renderCategoryItem(item) {
  return `<div class="category-item">
    ${categoryBadge(item)}
    <div class="item-main">
      <strong>${item.name}</strong>
      <span>${typeLabel(item.type)} · ${item.enabled ? "启用" : "停用"}</span>
    </div>
    <div class="row-actions">
      <button class="icon-button" type="button" onclick="editCategory('${item.id}')" title="编辑分类" aria-label="编辑分类"><span class="action-icon pencil-icon" aria-hidden="true"></span></button>
      <button class="icon-button danger-button" type="button" onclick="deleteCategory('${item.id}')" title="删除分类" aria-label="删除分类"><span class="action-icon trash-icon" aria-hidden="true"></span></button>
    </div>
  </div>`;
}

function categoryBadge(category, fallbackType = "transfer") {
  if (!category) {
    return `<span class="category-dot" style="background:#247c7a">${fallbackType === "transfer" ? "转" : "其"}</span>`;
  }
  return `<span class="category-dot" style="background:${category.color}">${category.icon}</span>`;
}

function exportCsv() {
  const rows = [
    ["日期", "类型", "分类", "账户", "转入账户", "币种", "金额", "备注", "标签"],
    ...state.transactions.map((item) => [
      formatDate(item.date),
      typeLabel(item.type),
      findCategory(item.categoryId)?.name || "",
      accountName(item.accountId),
      accountName(item.targetAccountId),
      transactionCurrency(item),
      item.amount,
      item.note,
      item.tags.join("|"),
    ]),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `记账本-${state.selectedMonth}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function monthTransactions() {
  return transactionsForMonth(state.selectedMonth);
}

function transactionsForMonth(month) {
  return state.transactions.filter((item) => item.date.slice(0, 7) === month);
}

function getCategoryExpenseTotals(transactions, selectedCurrency = null) {
  const map = new Map();
  transactions
    .filter((item) => item.type === "expense")
    .filter((item) => !selectedCurrency || transactionCurrency(item) === selectedCurrency)
    .forEach((item) => {
      const currency = transactionCurrency(item);
      const key = `${currency}:${item.categoryId}`;
      const current = map.get(key) || { categoryId: item.categoryId, currency, amount: 0 };
      current.amount += item.amount;
      map.set(key, current);
    });
  const totals = new Map();
  map.forEach((item) => totals.set(item.currency, (totals.get(item.currency) || 0) + item.amount));
  return [...map.entries()]
    .map(([, item]) => ({
      category: findCategory(item.categoryId),
      amount: item.amount,
      currency: item.currency,
      total: totals.get(item.currency) || 0,
    }))
    .filter((item) => item.category)
    .sort((a, b) => a.currency.localeCompare(b.currency) || b.amount - a.amount);
}

function enabledCategories(type) {
  return state.categories.filter((item) => item.enabled && item.type === type).sort((a, b) => a.sortOrder - b.sortOrder);
}

function findCategory(id) {
  return state.categories.find((item) => item.id === id);
}

function findTransaction(id) {
  return state.transactions.find((item) => item.id === id);
}

function findAccount(id) {
  return state.accounts.find((item) => item.id === id);
}

function getAccountBalance(id) {
  const account = findAccount(id);
  if (!account) return 0;
  return state.transactions.reduce((balance, item) => {
    if (item.type === "expense" && item.accountId === id) return balance - item.amount;
    if (item.type === "income" && item.accountId === id) return balance + item.amount;
    if (item.type === "transfer") {
      if (item.accountId === id) balance -= item.amount;
      if (item.targetAccountId === id) balance += item.amount;
    }
    return balance;
  }, Number(account.initialBalance || 0));
}

function getTotalAssetsByCurrency() {
  return state.accounts
    .filter((account) => account.includeInAssets)
    .reduce((totals, account) => {
      const currency = account.currency || "CNY";
      totals.set(currency, (totals.get(currency) || 0) + getAccountBalance(account.id));
      return totals;
    }, new Map());
}

function defaultAccountId() {
  return findAccount("alipay")?.id || state.accounts[0]?.id || "";
}

function accountName(id) {
  return findAccount(id)?.name || "";
}

function sumByType(transactions, type) {
  return transactions.filter((item) => item.type === type).reduce((total, item) => total + item.amount, 0);
}

function sumByCurrency(transactions, type) {
  return transactions
    .filter((item) => item.type === type)
    .reduce((totals, item) => {
      const currency = transactionCurrency(item);
      totals.set(currency, (totals.get(currency) || 0) + item.amount);
      return totals;
    }, new Map());
}

function netByCurrency(transactions) {
  return transactions.reduce((totals, item) => {
    if (item.type === "transfer") return totals;
    const currency = transactionCurrency(item);
    const direction = item.type === "income" ? 1 : -1;
    totals.set(currency, (totals.get(currency) || 0) + item.amount * direction);
    return totals;
  }, new Map());
}

function formatCurrencyTotals(totals) {
  const entries = sortedCurrencyEntries(totals);
  return entries.length ? entries.map(([currency, value]) => money(value, currency)).join(" · ") : money(0, "CNY");
}

function sortedCurrencyEntries(totals) {
  return [...totals.entries()].sort(([a], [b]) => {
    if (a === "CNY") return -1;
    if (b === "CNY") return 1;
    return a.localeCompare(b);
  });
}

function renderAssetTotals(totals) {
  const entries = sortedCurrencyEntries(totals);
  const rows = entries.length ? entries : [["CNY", 0]];
  document.querySelector("#totalAssets").innerHTML = rows
    .map(([currency, value], index) => `<div class="asset-total-item ${index === 0 ? "is-primary" : ""}">
      <span>${currencyNames[currency] || currency} <b>${currency}</b></span>
      <strong>${money(value, currency)}</strong>
    </div>`)
    .join("");
}

function renderDashboardAssetTotals(totals) {
  const entries = sortedCurrencyEntries(totals);
  const rows = entries.length ? entries : [["CNY", 0]];
  document.querySelector("#dashboardTotalAssets").innerHTML = rows
    .map(([currency, value], index) => `<div class="metric-currency-item ${index === 0 ? "is-primary" : ""}">
      <span>${currency}</span>
      <strong>${money(value, currency)}</strong>
    </div>`)
    .join("");
}

function currencyForAccount(id) {
  return findAccount(id)?.currency || "CNY";
}

function transactionCurrency(item) {
  return supportedCurrencies.includes(item.currency) ? item.currency : currencyForAccount(item.accountId);
}

function loadState() {
  LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return migrateState(JSON.parse(saved));
  } catch (error) {
    console.warn("本地账本读取失败，将使用空账本。", error);
  }
  return createDefaultState();
}

function createDefaultState() {
  return migrateState({
    selectedMonth: currentMonth,
    categories: defaultCategories.map((item) => ({ ...item })),
    accounts: defaultAccounts.map((item) => ({ ...item })),
    transactions: [],
    quickTemplates: defaultQuickTemplates.map((item) => ({ ...item })),
  });
}

function migrateState(savedState) {
  const defaultColorById = Object.fromEntries(defaultCategories.map((item) => [item.id, item.color]));
  if (!Array.isArray(savedState.categories) || !savedState.categories.length) {
    savedState.categories = defaultCategories.map((item) => ({ ...item }));
  }
  savedState.categories = savedState.categories.map((category) => ({
    ...category,
    color: defaultColorById[category.id] || category.color,
  }));
  if (!Array.isArray(savedState.accounts) || !savedState.accounts.length) savedState.accounts = defaultAccounts;
  savedState.accounts = savedState.accounts.map((account) => {
    const type = accountTypes[account.type] ? account.type : "other";
    return {
      ...account,
      type,
      currency: supportedCurrencies.includes(account.currency) ? account.currency : "CNY",
      initialBalance: type === "credit_card" ? -Math.abs(Number(account.initialBalance || 0)) : Number(account.initialBalance || 0),
      creditLimit: type === "credit_card" ? Math.max(0, Number(account.creditLimit || 0)) : 0,
      billingDay: type === "credit_card" ? Math.min(28, Math.max(1, Number(account.billingDay || 1))) : 1,
      dueDay: type === "credit_card" ? Math.min(28, Math.max(1, Number(account.dueDay || 20))) : 20,
      includeInAssets: account.includeInAssets !== false,
    };
  });
  if (!Array.isArray(savedState.quickTemplates)) savedState.quickTemplates = defaultQuickTemplates;
  if (!Array.isArray(savedState.transactions)) savedState.transactions = [];
  savedState.transactions = savedState.transactions.map((transaction) => ({
    ...transaction,
    currency: supportedCurrencies.includes(transaction.currency)
      ? transaction.currency
      : savedState.accounts.find((account) => account.id === transaction.accountId)?.currency || "CNY",
  }));
  const fallbackAccountId = savedState.accounts.find((account) => account.id === "alipay")?.id || savedState.accounts[0].id;
  savedState.quickTemplates = savedState.quickTemplates.map((template) => ({
    ...template,
    accountId: savedState.accounts.some((account) => account.id === template.accountId)
      ? template.accountId
      : fallbackAccountId,
  }));
  return savedState;
}

function saveState() {
  saveLocalState();
  queueCloudSave();
}

function saveLocalState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("保存失败，本地存储空间可能不足。", error);
    if (el?.toast) toast("保存失败：本地存储空间不足");
  }
}

function money(value, currency = "CNY") {
  const digits = ["JPY", "KRW"].includes(currency) ? 0 : 2;
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value || 0);
}

function signedMoney(item) {
  const formatted = money(item.amount, transactionCurrency(item));
  if (item.type === "expense") return `-${formatted}`;
  if (item.type === "income") return `+${formatted}`;
  return formatted;
}

function typeLabel(type) {
  return { expense: "支出", income: "收入", transfer: "转账" }[type] || type;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function toMonth(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function toDateInput(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toDateTimeInput(date) {
  return `${toDateInput(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function addMonths(month, offset) {
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(year, monthIndex - 1 + offset, 1);
  return toMonth(date);
}

function splitTags(value) {
  return value
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value) {
  return `${value.trim().toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString(36)}`;
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setText(id, value) {
  document.querySelector(`#${id}`).textContent = value;
}

function toast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => el.toast.classList.remove("show"), 1800);
}
