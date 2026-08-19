const DEMO_MODE = new URLSearchParams(window.location.search).get("demo") === "1";
const STORAGE_KEY = DEMO_MODE ? "jizhangben-demo-state-v1" : "jizhangben-state-v2";
const CLOUD_DIRTY_KEY = "jizhangben-cloud-dirty-v1";
const CLOUD_BASE_KEY = "jizhangben-cloud-base-v1";
const LOGO_STYLE_KEY = "jizhangben-logo-style-v1";
const LEGACY_STORAGE_KEYS = ["qingzhang-state-v1", "jizhangben-state-v1"];
const SUPABASE_URL = "https://wulhenvzdeduozvcshwt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_qZXvz91fUAR7C3gO-RCcrw_ehAiHYMw";
const SITE_URL = "https://shika0914.github.io/jizhangben-app/";
const supabaseClient = DEMO_MODE ? null : window.supabase?.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) || null;
const today = new Date();
const currentMonth = toMonth(today);
const logoStyles = {
  simple: { label: "简约", src: "./assets/icons/app-logo-simple.svg?v=1" },
  embossed: { label: "立体", src: "./assets/icons/app-logo.svg?v=3" },
};

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
  { id: "alipay", name: "支付宝", type: "alipay", currency: "CNY", initialBalance: 0, balances: [{ currency: "CNY", initialBalance: 0 }], includeInAssets: true },
  { id: "wechat", name: "微信", type: "wechat", currency: "CNY", initialBalance: 0, balances: [{ currency: "CNY", initialBalance: 0 }], includeInAssets: true },
  { id: "bank", name: "银行卡", type: "bank", currency: "CNY", initialBalance: 0, balances: [{ currency: "CNY", initialBalance: 0 }], includeInAssets: true },
  { id: "cash", name: "现金", type: "cash", currency: "CNY", initialBalance: 0, balances: [{ currency: "CNY", initialBalance: 0 }], includeInAssets: true },
];

const accountTypes = {
  wechat: { label: "微信", icon: "微", color: "#07c160", logo: "./assets/logos/wechat.svg" },
  alipay: { label: "支付宝", icon: "支", color: "#1677ff", logo: "./assets/logos/alipay.svg" },
  bank: { label: "银行卡", icon: "银", color: "#171917", logo: "./assets/logos/bank-card.svg?v=3" },
  credit_card: { label: "信用卡", icon: "卡", color: "#171917", logo: "./assets/logos/bank-card.svg?v=3" },
  cash: { label: "现金", icon: "现", color: "#171917", logo: "./assets/logos/cash.svg?v=4" },
  other: { label: "其他钱包", icon: "钱", color: "#171917", logo: "./assets/logos/wallet.svg?v=2" },
};
const accountTypeAliases = {
  credit: "credit_card",
  creditcard: "credit_card",
  creditCard: "credit_card",
  "credit-card": "credit_card",
  card: "credit_card",
};

const defaultQuickTemplates = [];

const categoryIconSvgs = {
  utensils: '<path d="M3 2v7a4 4 0 0 0 8 0V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3Zm0 0v7"/>',
  car: '<path d="M5 11 7 6h10l2 5M3 11h18l-2 6H5l-2-6Z"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/>',
  "shopping-bag": '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0"/>',
  house: '<path d="m3 11 9-9 9 9M5 10v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10M9 22V12h6v10"/>',
  gamepad: '<rect x="2.5" y="6" width="19" height="13" rx="6"/><path d="M7 10v5M4.5 12.5h5M16.5 10.5h.01M19 13h.01"/>',
  "heart-pulse": '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/><path d="M3.5 12H8l2-3 3 6 2-3h5.5"/>',
  "graduation-cap": '<path d="m2 10 10-5 10 5-10 5L2 10Z"/><path d="M6 12v5c3 2 9 2 12 0v-5M22 10v6"/>',
  package: '<path d="m16.5 9.4-9-5.2M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/>',
  wallet: '<path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v10a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6"/><path d="M16 13h4"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7M7.5 8C5 8 4 6.5 4 5.5S5 3 6.5 3C9 3 12 8 12 8s3-5 5.5-5C19 3 20 4.5 20 5.5S19 8 16.5 8"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/>',
  "chart-line": '<path d="M3 3v18h18M7 16l4-5 4 3 5-7"/>',
  plane: '<path d="M22 2 9 15M22 2l-7 20-4-9-9-4 20-7Z"/>',
  coffee: '<path d="M5 7h14l-1.5 14h-11L5 7ZM4 3h16M14 7l2-5M8 12h8"/>',
  dumbbell: '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2M9 11l-3.5 6.5M13 8l-2-2H8"/>',
  ellipsis: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
};

const categoryIconOptions = [
  ["utensils", "餐饮"], ["car", "交通"], ["shopping-bag", "购物"], ["house", "住房"],
  ["gamepad", "娱乐"], ["heart-pulse", "医疗"], ["graduation-cap", "教育"], ["package", "日用品"],
  ["wallet", "收入"], ["gift", "奖金"], ["briefcase", "工作"], ["chart-line", "投资"],
  ["plane", "旅行"], ["coffee", "饮料"], ["dumbbell", "运动"], ["ellipsis", "其他"],
];

const defaultCategoryIconKeys = {
  food: "utensils", transport: "car", shopping: "shopping-bag", housing: "house", fun: "gamepad",
  medical: "heart-pulse", education: "graduation-cap", daily: "package", salary: "wallet", bonus: "gift",
  side: "briefcase", investment: "chart-line", "other-expense": "ellipsis", "other-income": "ellipsis",
};

let state = loadState();
let selectedType = "expense";
let selectedBillIds = new Set();
let selectedCreditAccountId = "";
let selectedCreditMonth = currentMonth;
let currentUser = null;
let authMode = "login";
let cloudHydrating = false;
let cloudSaveTimer = null;
let cloudLoadedForUser = "";
let cloudBaseState = null;
let cloudRevision = 0;
let cloudSaveInProgress = false;
let cloudSaveRequested = false;
let localChangeVersion = 0;
let draggedAccountId = "";
let statsReportMode = "month";
let assetsValueMode = "net";
let statsAssetValueMode = "net";
let summaryCurrency = "CNY";
let statsPage = "overview";
const statsExcludedCategories = new Set();
const statsExcludedTags = new Set();

const el = {
  tabs: document.querySelectorAll(".nav-tab"),
  views: document.querySelectorAll(".view"),
  viewTitle: document.querySelector("#viewTitle"),
  todayText: document.querySelector("#todayText"),
  monthPicker: document.querySelector("#monthPicker"),
  dashboardSummaryCurrency: document.querySelector("#dashboardSummaryCurrency"),
  billSummaryCurrency: document.querySelector("#billSummaryCurrency"),
  transactionForm: document.querySelector("#transactionForm"),
  quickForm: document.querySelector("#quickForm"),
  quickTemplateForm: document.querySelector("#quickTemplateForm"),
  accountForm: document.querySelector("#accountForm"),
  statsCurrency: document.querySelector("#statsCurrency"),
  statsWeekDate: document.querySelector("#statsWeekDate"),
  statsMonthValue: document.querySelector("#statsMonthValue"),
  statsYearValue: document.querySelector("#statsYearValue"),
  appLogo: document.querySelector("#appLogo"),
  appFavicon: document.querySelector("#appFavicon"),
  logoPickerButton: document.querySelector("#logoPickerButton"),
  logoPickerMenu: document.querySelector("#logoPickerMenu"),
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
  credit: "信用卡",
  categories: "新增分类",
  stats: "统计",
};

init();
initCloud();

function init() {
  if (DEMO_MODE) document.title = "记账本 - 模拟数据";
  applyLogoStyle(loadLogoStyle());
  el.todayText.textContent = new Intl.DateTimeFormat("zh-CN", { dateStyle: "full" }).format(today);
  state.selectedMonth = currentMonth;
  el.monthPicker.value = currentMonth;
  selectedCreditMonth = state.selectedMonth;
  el.statsWeekDate.value = toDateInput(today);
  el.statsMonthValue.value = state.selectedMonth;
  el.statsYearValue.value = String(today.getFullYear());
  bindEvents();
  resetTransactionForm();
  resetAccountForm();
  renderCategoryIconPicker();
  updateCategoryPreview();
  renderAll();
}

function bindEvents() {
  el.logoPickerButton.addEventListener("click", toggleLogoPicker);
  document.querySelectorAll("[data-logo-style]").forEach((button) => {
    button.addEventListener("click", () => selectLogoStyle(button.dataset.logoStyle));
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".brand-logo-control")) closeLogoPicker();
    if (!event.target.closest(".period-year-picker, .period-month-picker, .period-day-picker")) closePeriodMenus();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLogoPicker();
      closePeriodMenus();
    }
  });
  el.tabs.forEach((tab) => tab.addEventListener("click", () => switchView(tab.dataset.view)));
  document.querySelectorAll("[data-view-jump]").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.viewJump));
  });
  el.monthPicker.addEventListener("change", () => {
    state.selectedMonth = el.monthPicker.value;
    saveState();
    renderAll();
  });
  document.querySelector("#creditBillMonth").addEventListener("change", (event) => {
    const nextMonth = event.target.value;
    if (!/^\d{4}-\d{2}$/.test(nextMonth)) return;
    selectedCreditMonth = nextMonth;
    renderCreditCards();
  });
  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => changeTransactionType(button.dataset.type));
  });
  el.transactionForm.addEventListener("submit", saveTransaction);
  el.quickForm.addEventListener("submit", saveQuickTransaction);
  el.quickTemplateForm.addEventListener("submit", saveQuickTemplate);
  el.quickForm.accountId.addEventListener("change", () => fillQuickCurrencySelect(el.quickForm));
  el.quickTemplateForm.accountId.addEventListener("change", () => fillQuickCurrencySelect(el.quickTemplateForm));
  document.addEventListener("change", (event) => {
    if (event.target instanceof HTMLSelectElement) syncSelectDisplay(event.target);
  });
  el.accountForm.addEventListener("submit", saveAccount);
  el.accountForm.type.addEventListener("change", updateCreditCardFields);
  el.transactionForm.accountId.addEventListener("change", () => {
    fillTransactionCurrencySelect();
    updateInstallmentFields();
    updateCreditBillPeriodField();
  });
  el.transactionForm.targetAccountId.addEventListener("change", updateCreditBillPeriodField);
  el.transactionForm.useInstallment.addEventListener("change", () => {
    if (el.transactionForm.useInstallment.checked) syncInstallmentStartDate();
    updateInstallmentFields();
  });
  el.transactionForm.date.addEventListener("change", () => {
    if (!el.transactionForm.useInstallment.checked) syncInstallmentStartDate();
    updateCreditBillPeriodField();
  });
  document.querySelector("#addAccountBalance").addEventListener("click", () => addAccountBalanceRow());
  [el.dashboardSummaryCurrency, el.billSummaryCurrency].forEach((select) => {
    select.addEventListener("change", () => {
      summaryCurrency = select.value || "CNY";
      fillSummaryCurrencySelects();
      renderDashboard();
      renderBills();
    });
  });
  el.statsCurrency.addEventListener("change", renderStats);
  document.querySelectorAll("[data-stats-mode]").forEach((button) => {
    button.addEventListener("click", () => changeStatsReportMode(button.dataset.statsMode));
  });
  document.querySelectorAll("[data-stats-page]").forEach((button) => {
    button.addEventListener("click", () => changeStatsPage(button.dataset.statsPage));
  });
  document.querySelectorAll("[data-assets-value-mode]").forEach((button) => {
    button.addEventListener("click", () => changeAssetsValueMode(button.dataset.assetsValueMode));
  });
  document.querySelectorAll("[data-stats-asset-mode]").forEach((button) => {
    button.addEventListener("click", () => changeStatsAssetValueMode(button.dataset.statsAssetMode));
  });
  [el.statsWeekDate, el.statsMonthValue, el.statsYearValue].forEach((field) => {
    field.addEventListener("change", renderStats);
  });
  document.querySelector("#statsView").addEventListener("change", handleStatsFilterChange);
  document.querySelector("#statsView").addEventListener("click", handleStatsFilterClick);
  document.querySelector("#statsView").addEventListener("keydown", handleStatsFilterKeydown);
  el.categoryForm.addEventListener("submit", saveCategory);
  [el.categoryForm.name, el.categoryForm.color].forEach((field) => {
    field.addEventListener("input", updateCategoryPreview);
  });
  el.categoryForm.customIcon.addEventListener("input", updateCustomCategoryIcon);
  el.categoryForm.type.addEventListener("change", updateCategoryPreview);
  el.categoryForm.enabled.addEventListener("change", updateCategoryPreview);
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
  document.querySelector("#cancelTransactionEdit").addEventListener("click", resetTransactionForm);
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
  document.querySelector("#cancelCategoryEdit").addEventListener("click", resetCategoryForm);
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

function loadLogoStyle() {
  try {
    const stored = localStorage.getItem(LOGO_STYLE_KEY);
    return logoStyles[stored] ? stored : "embossed";
  } catch {
    return "embossed";
  }
}

function applyLogoStyle(style) {
  const selected = logoStyles[style] ? style : "embossed";
  const config = logoStyles[selected];
  el.appLogo.src = config.src;
  el.appFavicon.href = config.src;
  document.querySelectorAll("[data-logo-style]").forEach((button) => {
    const active = button.dataset.logoStyle === selected;
    button.classList.toggle("active", active);
    button.setAttribute("aria-checked", String(active));
  });
}

function selectLogoStyle(style) {
  if (!logoStyles[style]) return;
  applyLogoStyle(style);
  try {
    localStorage.setItem(LOGO_STYLE_KEY, style);
  } catch {
    // The visual choice still applies for the current session.
  }
  closeLogoPicker();
  toast(`已切换为${logoStyles[style].label} Logo`);
}

function toggleLogoPicker() {
  const willOpen = el.logoPickerMenu.hidden;
  el.logoPickerMenu.hidden = !willOpen;
  el.logoPickerButton.setAttribute("aria-expanded", String(willOpen));
}

function closeLogoPicker() {
  el.logoPickerMenu.hidden = true;
  el.logoPickerButton.setAttribute("aria-expanded", "false");
}

async function initCloud() {
  if (DEMO_MODE) {
    document.querySelector("#openAuthModal").hidden = true;
    document.querySelector("#cloudUser").hidden = true;
    setSyncStatus("模拟数据 · 不进行云同步");
    return;
  }
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
    if (userChanged) {
      cloudBaseState = null;
      cloudRevision = 0;
      restoreCloudBase(currentUser.id);
    }
    updateAuthUI();
    if (userChanged || cloudLoadedForUser !== currentUser.id) {
      if (hasPendingCloudChanges()) await saveCloudState();
      else await loadCloudState();
    }
    return;
  }

  currentUser = null;
  cloudLoadedForUser = "";
  cloudBaseState = null;
  cloudRevision = 0;
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
    .select("data, updated_at, revision")
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
  const cloudStateBeforeMigration = JSON.stringify(data.data);
  const migratedCloudLedger = migrateState(cloneLedger(data.data));
  const migratedCloudState = JSON.stringify(migratedCloudLedger);
  state = cloneLedger(migratedCloudLedger);
  state.selectedMonth = currentMonth;
  el.monthPicker.value = currentMonth;
  saveLocalState();
  rememberCloudBase(userId, migratedCloudLedger, Number(data.revision || 0));
  cloudHydrating = false;
  cloudLoadedForUser = userId;
  renderAll();
  setSyncStatus("已同步", "synced");
  if (cloudStateBeforeMigration !== migratedCloudState) saveCloudState();
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
  if (cloudSaveInProgress) {
    cloudSaveRequested = true;
    return;
  }
  cloudSaveInProgress = true;
  const userId = currentUser.id;
  markCloudDirty();
  setSyncStatus("正在同步…", "syncing");
  try {
    const synced = await mergeAndSaveCloudState(userId);
    if (synced && currentUser?.id === userId) {
      clearCloudDirty();
      cloudLoadedForUser = userId;
      setSyncStatus("已同步", "synced");
    }
  } finally {
    cloudSaveInProgress = false;
    if (cloudSaveRequested && currentUser?.id === userId) {
      cloudSaveRequested = false;
      saveCloudState();
    }
  }
}

async function mergeAndSaveCloudState(userId, retryCount = 0) {
  const snapshotVersion = localChangeVersion;
  const localSnapshot = migrateState(cloneLedger(state));
  const { data: cloudRow, error: readError } = await supabaseClient
    .from("ledger_states")
    .select("data, updated_at, revision")
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) {
    setSyncStatus("同步失败，已保存在本机", "error");
    return false;
  }
  if (currentUser?.id !== userId) return false;

  const hasCloudLedger = cloudRow?.data
    && Array.isArray(cloudRow.data.accounts)
    && Array.isArray(cloudRow.data.transactions);
  if (!hasCloudLedger) return createCloudLedger(userId, localSnapshot, snapshotVersion);

  const remoteSnapshot = migrateState(cloneLedger(cloudRow.data));
  const storedBase = cloudBaseState || restoreCloudBase(userId)?.state;
  const baseSnapshot = storedBase ? migrateState(cloneLedger(storedBase)) : remoteSnapshot;
  const { mergedState, conflicts } = mergeLedgerStates(baseSnapshot, localSnapshot, remoteSnapshot);
  const remoteRevision = Number(cloudRow.revision || 0);

  if (conflicts.length) {
    setSyncStatus("发现同步冲突", "error");
    const confirmed = window.confirm(
      `发现 ${conflicts.length} 项内容在本机和另一台设备都被修改。\n\n` +
      "系统会保留最后修改的版本，并在覆盖前备份当前云端账本。是否继续同步？"
    );
    if (!confirmed) {
      toast("已取消覆盖，本机修改仍然保留");
      return false;
    }
    const backedUp = await backupCloudLedger(userId, cloudRow.data, remoteRevision, conflicts.length);
    if (!backedUp) {
      setSyncStatus("备份失败，未覆盖云端", "error");
      toast("旧版本备份失败，已停止覆盖");
      return false;
    }
  }

  const nextRevision = remoteRevision + 1;
  const { data: updatedRow, error: updateError } = await supabaseClient
    .from("ledger_states")
    .update({
      data: mergedState,
      revision: nextRevision,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("revision", remoteRevision)
    .select("revision")
    .maybeSingle();

  if (updateError) {
    setSyncStatus("同步失败，已保存在本机", "error");
    return false;
  }
  if (!updatedRow) {
    if (retryCount < 1) return mergeAndSaveCloudState(userId, retryCount + 1);
    setSyncStatus("云端刚刚发生变化，请再次同步", "error");
    toast("另一台设备刚刚更新了账本，请再次同步");
    return false;
  }

  rememberCloudBase(userId, mergedState, nextRevision);
  if (conflicts.length) toast(`已合并并备份旧版本，共处理 ${conflicts.length} 项冲突`);
  if (localChangeVersion !== snapshotVersion) {
    const pendingLocalState = migrateState(cloneLedger(state));
    const pendingMerge = mergeLedgerStates(localSnapshot, pendingLocalState, mergedState);
    applyMergedState(pendingMerge.mergedState);
    cloudSaveRequested = true;
    return false;
  }
  applyMergedState(mergedState);
  return true;
}

async function createCloudLedger(userId, localSnapshot, snapshotVersion) {
  const initialRevision = 1;
  const { error } = await supabaseClient.from("ledger_states").upsert(
    {
      user_id: userId,
      data: localSnapshot,
      revision: initialRevision,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) {
    setSyncStatus("同步失败，已保存在本机", "error");
    return false;
  }
  rememberCloudBase(userId, localSnapshot, initialRevision);
  if (localChangeVersion !== snapshotVersion) {
    cloudSaveRequested = true;
    return false;
  }
  return true;
}

async function backupCloudLedger(userId, cloudData, revision, conflictCount) {
  saveLocalConflictBackup(userId, cloudData, revision);
  const { error } = await supabaseClient.from("ledger_backups").insert({
    user_id: userId,
    data: cloudData,
    revision,
    reason: "sync_conflict",
    conflict_count: conflictCount,
  });
  return !error;
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

function mergeLedgerStates(baseState, localState, remoteState) {
  const mergedState = {
    ...remoteState,
    selectedMonth: localState.selectedMonth || remoteState.selectedMonth || currentMonth,
    syncTombstones: {},
  };
  const conflicts = [];
  ["transactions", "accounts", "categories", "quickTemplates"].forEach((collection) => {
    const merged = mergeLedgerCollection(collection, baseState, localState, remoteState);
    mergedState[collection] = merged.items;
    mergedState.syncTombstones[collection] = merged.tombstones;
    conflicts.push(...merged.conflicts);
  });
  mergedState.accounts.sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  mergedState.categories.sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  mergedState.quickTemplates.sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  return { mergedState: migrateState(mergedState), conflicts };
}

function mergeLedgerCollection(collection, baseState, localState, remoteState) {
  const baseEntities = ledgerEntityMap(baseState, collection);
  const localEntities = ledgerEntityMap(localState, collection);
  const remoteEntities = ledgerEntityMap(remoteState, collection);
  const ids = new Set([...baseEntities.keys(), ...localEntities.keys(), ...remoteEntities.keys()]);
  const items = [];
  const tombstones = [];
  const conflicts = [];

  ids.forEach((id) => {
    const base = baseEntities.get(id) || null;
    const local = localEntities.get(id) || null;
    const remote = remoteEntities.get(id) || null;
    const localChanged = !syncEntitiesEqual(local, base);
    const remoteChanged = !syncEntitiesEqual(remote, base);
    let chosen;

    if (localChanged && remoteChanged) {
      if (!syncEntitiesEqual(local, remote)) conflicts.push({ collection, id });
      chosen = newestSyncEntity(local, remote);
    } else if (localChanged) {
      chosen = local;
    } else if (remoteChanged) {
      chosen = remote;
    } else {
      chosen = local || remote || base;
    }

    if (chosen?.deleted) tombstones.push({ id, deletedAt: chosen.updatedAt });
    else if (chosen?.record) items.push(chosen.record);
  });

  return { items, tombstones, conflicts };
}

function ledgerEntityMap(ledger, collection) {
  const map = new Map();
  (ledger?.[collection] || []).forEach((record) => {
    if (!record?.id) return;
    map.set(record.id, {
      record,
      deleted: false,
      updatedAt: recordSyncTime(record),
    });
  });
  (ledger?.syncTombstones?.[collection] || []).forEach((tombstone) => {
    if (!tombstone?.id) return;
    const deletedAt = validIsoTimestamp(tombstone.deletedAt);
    const existing = map.get(tombstone.id);
    if (!existing || Date.parse(deletedAt) >= Date.parse(existing.updatedAt)) {
      map.set(tombstone.id, { record: null, deleted: true, updatedAt: deletedAt });
    }
  });
  return map;
}

function syncEntitiesEqual(left, right) {
  if (!left && !right) return true;
  if (!left || !right || left.deleted !== right.deleted) return false;
  return left.deleted || stableJson(left.record) === stableJson(right.record);
}

function newestSyncEntity(left, right) {
  if (!left) return right;
  if (!right) return left;
  return Date.parse(left.updatedAt) >= Date.parse(right.updatedAt) ? left : right;
}

function recordSyncTime(record) {
  return validIsoTimestamp(record?.updatedAt || record?.createdAt || record?.date);
}

function validIsoTimestamp(value) {
  const date = new Date(value || 0);
  return Number.isNaN(date.getTime()) ? "1970-01-01T00:00:00.000Z" : date.toISOString();
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function applyMergedState(mergedState) {
  cloudHydrating = true;
  state = migrateState(cloneLedger(mergedState));
  el.monthPicker.value = state.selectedMonth || currentMonth;
  saveLocalState();
  cloudHydrating = false;
  renderAll();
}

function cloneLedger(ledger) {
  return JSON.parse(JSON.stringify(ledger));
}

function cloudBaseStorageKey(userId) {
  return `${CLOUD_BASE_KEY}:${userId}`;
}

function rememberCloudBase(userId, ledger, revision) {
  cloudBaseState = cloneLedger(ledger);
  cloudRevision = Number(revision || 0);
  try {
    localStorage.setItem(cloudBaseStorageKey(userId), JSON.stringify({ revision: cloudRevision, state: cloudBaseState }));
  } catch (error) {
    console.warn("同步基准保存失败。", error);
  }
}

function restoreCloudBase(userId) {
  try {
    const saved = JSON.parse(localStorage.getItem(cloudBaseStorageKey(userId)) || "null");
    if (!saved?.state) return null;
    cloudBaseState = saved.state;
    cloudRevision = Number(saved.revision || 0);
    return saved;
  } catch {
    return null;
  }
}

function saveLocalConflictBackup(userId, ledger, revision) {
  try {
    localStorage.setItem(`jizhangben-conflict-backup:${userId}`, JSON.stringify({
      revision,
      createdAt: new Date().toISOString(),
      state: ledger,
    }));
  } catch (error) {
    console.warn("本机冲突备份保存失败。", error);
  }
}

function markRecordDeleted(collection, id) {
  if (!id) return;
  if (!state.syncTombstones) state.syncTombstones = createEmptyTombstones();
  const deletedAt = new Date().toISOString();
  state.syncTombstones[collection] = (state.syncTombstones[collection] || [])
    .filter((item) => item.id !== id);
  state.syncTombstones[collection].push({ id, deletedAt });
}

function clearRecordDeletion(collection, id) {
  if (!state.syncTombstones?.[collection]) return;
  state.syncTombstones[collection] = state.syncTombstones[collection].filter((item) => item.id !== id);
}

function createEmptyTombstones() {
  return { transactions: [], accounts: [], categories: [], quickTemplates: [] };
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
  const activeNavView = ["add", "categories"].includes(view) ? "bills" : view;
  el.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === activeNavView));
  el.views.forEach((item) => item.classList.toggle("active", item.id === `${view}View`));
  el.viewTitle.textContent = viewTitles[view];
  const hideMonthPicker = ["assets", "add", "categories", "stats"].includes(view);
  document.querySelector(".month-control").hidden = hideMonthPicker;
  document.querySelector(".topbar").classList.toggle("is-simple", hideMonthPicker);
}

function renderAll() {
  fillPeriodSelects();
  fillSelects();
  updateInstallmentFields();
  renderDashboard();
  renderAssets();
  renderBills();
  renderCreditCards();
  renderCategories();
  renderStats();
  renderTemplates();
  document.querySelectorAll("select").forEach(syncSelectDisplay);
}

function periodYearBounds(extraValues = []) {
  const currentYear = today.getFullYear();
  const years = state.transactions
    .map((item) => Number(transactionDateKey(item).slice(0, 4)))
    .concat(extraValues.map((value) => Number(String(value || "").slice(0, 4))))
    .filter((year) => year >= 2000 && year <= 2100);
  return {
    min: Math.min(currentYear - 5, ...years),
    max: Math.max(currentYear + 2, ...years),
  };
}

function fillPeriodSelects() {
  renderPeriodCascade(el.monthPicker, "month", state.selectedMonth || currentMonth);
  renderPeriodCascade(el.statsMonthValue, "month", el.statsMonthValue.value || currentMonth);
  renderPeriodCascade(document.querySelector("#creditBillMonth"), "month", selectedCreditMonth || currentMonth);
  renderPeriodCascade(el.statsWeekDate, "date", el.statsWeekDate.value || toDateInput(today));
  renderPeriodCascade(el.statsYearValue, "year", el.statsYearValue.value || String(today.getFullYear()));
  renderPeriodCascade(el.transactionForm.date, "datetime", el.transactionForm.date.value || toDateTimeInput(today));
  renderPeriodCascade(el.transactionForm.installmentStartDate, "date", el.transactionForm.installmentStartDate.value || toDateInput(today));
}

function renderPeriodCascade(target, kind, selectedValue, options = {}) {
  const host = document.querySelector(`[data-period-target="${target.id}"]`);
  if (!host) return;
  const fallbackDate = new Date(today);
  const hasDay = kind === "date" || kind === "datetime";
  const parsedDate = hasDay ? parseLocalDate(String(selectedValue || "").slice(0, 10)) : null;
  const timeMatch = kind === "datetime" ? String(selectedValue || "").match(/T(\d{2}):(\d{2})/) : null;
  const selectedHour = timeMatch ? Number(timeMatch[1]) : fallbackDate.getHours();
  const selectedMinute = timeMatch ? Number(timeMatch[2]) : fallbackDate.getMinutes();
  const selectedYear = Number(String(selectedValue || "").slice(0, 4)) || fallbackDate.getFullYear();
  const selectedMonth = hasDay
    ? (parsedDate || fallbackDate).getMonth() + 1
    : Number(String(selectedValue || "").slice(5, 7)) || fallbackDate.getMonth() + 1;
  const requestedDay = hasDay ? (parsedDate || fallbackDate).getDate() : 1;
  const selectedDay = Math.min(requestedDay, new Date(selectedYear, selectedMonth, 0).getDate());
  const bounds = periodYearBounds([selectedValue]);
  const isAutomatic = options.allowAuto && !selectedValue;
  const yearOptions = Array.from({ length: bounds.max - bounds.min + 1 }, (_, index) => bounds.max - index)
    .map((year) => `<button class="period-year-option ${!isAutomatic && year === selectedYear ? "active" : ""}" type="button" data-period-year="${year}" aria-pressed="${!isAutomatic && year === selectedYear}">${year} 年</button>`)
    .join("");
  const yearMarkup = options.allowAuto
    ? `<button class="period-year-option period-year-auto ${isAutomatic ? "active" : ""}" type="button" data-period-year="" aria-pressed="${isAutomatic}">${escapeHtml(options.autoLabel || "自动归期")}</button>${yearOptions}`
    : yearOptions;
  const monthMarkup = Array.from({ length: 12 }, (_, index) => index + 1)
    .map((month) => `<button class="period-month-option ${month === selectedMonth ? "active" : ""}" type="button" data-period-month="${month}" aria-pressed="${month === selectedMonth}">${month} 月</button>`)
    .join("");
  const firstWeekday = (new Date(selectedYear, selectedMonth - 1, 1).getDay() + 6) % 7;
  const dayMarkup = ["一", "二", "三", "四", "五", "六", "日"]
    .map((label) => `<span class="period-day-weekday" aria-hidden="true">${label}</span>`)
    .concat(Array.from({ length: firstWeekday }, () => `<span class="period-day-spacer" aria-hidden="true"></span>`))
    .concat(Array.from({ length: new Date(selectedYear, selectedMonth, 0).getDate() }, (_, index) => index + 1)
      .map((day) => `<button class="period-day-option ${day === selectedDay ? "active" : ""}" type="button" data-period-day="${day}" aria-pressed="${day === selectedDay}">${day}</button>`))
    .join("");
  const hourMarkup = Array.from({ length: 24 }, (_, hour) => `<option value="${hour}" ${hour === selectedHour ? "selected" : ""}>${String(hour).padStart(2, "0")}</option>`).join("");
  const minuteMarkup = Array.from({ length: 60 }, (_, minute) => `<option value="${minute}" ${minute === selectedMinute ? "selected" : ""}>${String(minute).padStart(2, "0")}</option>`).join("");

  host.classList.toggle("is-date", hasDay);
  host.classList.toggle("is-datetime", kind === "datetime");
  host.classList.toggle("is-year", kind === "year");
  host.classList.toggle("is-disabled", target.disabled);
  host.innerHTML = `
    <details class="period-year-picker period-picker-details">
      <summary class="period-picker-control period-year-trigger" data-period-year-value="${isAutomatic ? "" : selectedYear}" aria-haspopup="dialog">
        <span>${isAutomatic ? escapeHtml(options.autoLabel || "自动归期") : `${selectedYear} 年`}</span><span class="period-picker-chevron" aria-hidden="true"></span>
      </summary>
      <div class="period-year-menu period-popover" role="dialog" aria-label="选择年份">${yearMarkup}</div>
    </details>
    ${kind !== "year" ? `<details class="period-month-picker period-picker-details ${isAutomatic ? "is-disabled" : ""}">
      <summary class="period-picker-control period-month-trigger" data-period-month-value="${selectedMonth}" aria-haspopup="dialog" aria-disabled="${isAutomatic}">
        <span>${selectedMonth} 月</span><span class="period-picker-chevron" aria-hidden="true"></span>
      </summary>
      <div class="period-month-menu period-popover" role="dialog" aria-label="选择月份">${monthMarkup}</div>
    </details>` : ""}
    ${hasDay ? `<details class="period-day-picker period-picker-details">
      <summary class="period-picker-control period-day-trigger" data-period-day-value="${selectedDay}" aria-haspopup="dialog">
        <span>${selectedDay} 日</span><span class="period-picker-chevron" aria-hidden="true"></span>
      </summary>
      <div class="period-day-menu period-popover" role="dialog" aria-label="选择日期">${dayMarkup}</div>
    </details>` : ""}
    ${kind === "datetime" ? `<div class="period-time-picker" aria-label="选择时间">
      <select class="period-picker-control" data-period-part="hour" aria-label="小时">${hourMarkup}</select>
      <span aria-hidden="true">:</span>
      <select class="period-picker-control" data-period-part="minute" aria-label="分钟">${minuteMarkup}</select>
    </div>` : ""}
  `;
  if (target.disabled) host.querySelectorAll("button, select").forEach((control) => { control.disabled = true; });

  if (isAutomatic) target.value = "";
  else if (kind === "year") target.value = String(selectedYear);
  else if (kind === "month") target.value = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
  else if (kind === "date") target.value = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
  else target.value = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}T${String(selectedHour).padStart(2, "0")}:${String(selectedMinute).padStart(2, "0")}`;

  host.querySelectorAll("select").forEach(syncSelectDisplay);
  host.querySelectorAll(".period-picker-details").forEach((details) => {
    details.ontoggle = () => {
      if (details.open) closePeriodMenus(details.querySelector(".period-popover"));
    };
  });
  const yearTrigger = host.querySelector(".period-year-trigger");
  const yearMenu = host.querySelector(".period-year-menu");
  if (yearTrigger && yearMenu) {
    yearMenu.querySelectorAll("[data-period-year]").forEach((button) => {
      button.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const year = Number(button.dataset.periodYear);
        const month = Number(host.querySelector(".period-month-trigger")?.dataset.periodMonthValue || selectedMonth);
        const day = Number(host.querySelector(".period-day-trigger")?.dataset.periodDayValue || selectedDay);
        const hour = Number(host.querySelector('[data-period-part="hour"]')?.value || selectedHour);
        const minute = Number(host.querySelector('[data-period-part="minute"]')?.value || selectedMinute);
        let nextValue = "";
        if (year) {
          if (kind === "year") nextValue = String(year);
          else if (kind === "month") nextValue = `${year}-${String(month).padStart(2, "0")}`;
          else {
            const safeDay = Math.min(day, new Date(year, month, 0).getDate());
            nextValue = `${year}-${String(month).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`;
            if (kind === "datetime") nextValue += `T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
          }
        }
        if (target.id === "creditBillMonth" && /^\d{4}-\d{2}$/.test(nextValue)) selectedCreditMonth = nextValue;
        renderPeriodCascade(target, kind, nextValue, options);
        target.dispatchEvent(new Event("change", { bubbles: true }));
      };
    });
  }
  const monthTrigger = host.querySelector(".period-month-trigger");
  const monthMenu = host.querySelector(".period-month-menu");
  if (monthTrigger && monthMenu) {
    monthMenu.querySelectorAll("[data-period-month]").forEach((button) => {
      button.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const year = Number(host.querySelector(".period-year-trigger").dataset.periodYearValue);
        const month = Number(button.dataset.periodMonth);
        const day = Number(host.querySelector(".period-day-trigger")?.dataset.periodDayValue || 1);
        const hour = Number(host.querySelector('[data-period-part="hour"]')?.value || selectedHour);
        const minute = Number(host.querySelector('[data-period-part="minute"]')?.value || selectedMinute);
        const safeDay = Math.min(day, new Date(year, month, 0).getDate());
        let nextValue = kind === "month"
          ? `${year}-${String(month).padStart(2, "0")}`
          : `${year}-${String(month).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`;
        if (kind === "datetime") nextValue += `T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        if (target.id === "creditBillMonth" && /^\d{4}-\d{2}$/.test(nextValue)) selectedCreditMonth = nextValue;
        renderPeriodCascade(target, kind, nextValue, options);
        target.dispatchEvent(new Event("change", { bubbles: true }));
      };
    });
  }
  const dayTrigger = host.querySelector(".period-day-trigger");
  const dayMenu = host.querySelector(".period-day-menu");
  if (dayTrigger && dayMenu) {
    dayMenu.querySelectorAll("[data-period-day]").forEach((button) => {
      button.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const year = Number(host.querySelector(".period-year-trigger").dataset.periodYearValue);
        const month = Number(host.querySelector(".period-month-trigger").dataset.periodMonthValue);
        const day = Number(button.dataset.periodDay);
        const hour = Number(host.querySelector('[data-period-part="hour"]')?.value || selectedHour);
        const minute = Number(host.querySelector('[data-period-part="minute"]')?.value || selectedMinute);
        let nextValue = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        if (kind === "datetime") nextValue += `T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        if (target.id === "creditBillMonth" && /^\d{4}-\d{2}$/.test(nextValue)) selectedCreditMonth = nextValue;
        renderPeriodCascade(target, kind, nextValue, options);
        target.dispatchEvent(new Event("change", { bubbles: true }));
      };
    });
  }
  host.onchange = () => {
    const year = Number(host.querySelector(".period-year-trigger").dataset.periodYearValue);
    const month = Number(host.querySelector(".period-month-trigger")?.dataset.periodMonthValue || 1);
    const day = Number(host.querySelector(".period-day-trigger")?.dataset.periodDayValue || 1);
    const hour = Number(host.querySelector('[data-period-part="hour"]')?.value || selectedHour);
    const minute = Number(host.querySelector('[data-period-part="minute"]')?.value || selectedMinute);
    let nextValue = "";
    if (year) {
      if (kind === "year") nextValue = String(year);
      else if (kind === "month") nextValue = `${year}-${String(month).padStart(2, "0")}`;
      else {
        const safeDay = Math.min(day, new Date(year, month, 0).getDate());
        nextValue = `${year}-${String(month).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`;
        if (kind === "datetime") nextValue += `T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      }
    }
    renderPeriodCascade(target, kind, nextValue, options);
    target.dispatchEvent(new Event("change", { bubbles: true }));
  };
}

function closePeriodMenus(except = null) {
  document.querySelectorAll(".period-picker-details[open]").forEach((details) => {
    if (details.querySelector(".period-popover") === except) return;
    details.open = false;
  });
}

function renderDashboard() {
  const transactions = monthTransactions();
  const todayTransactions = state.transactions.filter((item) => transactionDateKey(item) === toDateInput(today));

  setText("monthExpense", formatSelectedCurrencyTotal(sumByCurrency(transactions, "expense")));
  setText("monthIncome", formatSelectedCurrencyTotal(sumByCurrency(transactions, "income")));
  setText("monthBalance", formatSelectedCurrencyTotal(netByCurrency(transactions)));
  setText("todayExpense", formatSelectedCurrencyTotal(sumByCurrency(todayTransactions, "expense")));
  renderDashboardAssetTotals(getNetAssetsByCurrency());
  const dashboardIncluded = state.accounts.filter((account) => account.includeInAssets);
  const dashboardExcludedCount = state.accounts.length - dashboardIncluded.length;
  setText(
    "dashboardAssetSummary",
    `已扣除负余额 · ${
      dashboardExcludedCount ? `共 ${state.accounts.length} 个钱包，${dashboardExcludedCount} 个未计入` : `共 ${state.accounts.length} 个钱包，已全部计入`
    }`
  );

  const recent = state.transactions
    .filter(isPostedTransaction)
    .sort((a, b) => transactionLocalDateTime(b) - transactionLocalDateTime(a))
    .slice(0, 6);
  renderList("recentBills", recent, renderBillItem, "还没有账单");

  const categoryTotals = getCategoryExpenseTotals(transactions).slice(0, 5);
  renderList("topCategories", categoryTotals, renderRankItem, "本月还没有支出");
}

function renderAssets() {
  const accounts = state.accounts.map((account, index) => ({
    account,
    balances: getAccountBalances(account.id),
    index,
    total: state.accounts.length,
  }));
  const included = accounts.filter(({ account }) => account.includeInAssets);
  const excludedCount = accounts.length - included.length;

  renderAssetTotals(getAssetValuesByCurrency(assetsValueMode));
  setText("assetValueLabel", assetsValueMode === "total" ? "总资产" : "净资产");
  setText("includedAccountCount", `${included.length} 个计入资产统计`);
  setText(
    "assetSummary",
    `${assetsValueMode === "total" ? "仅统计正余额" : "已扣除负余额"} · ${
      excludedCount ? `共 ${accounts.length} 个钱包，${excludedCount} 个未计入` : `共 ${accounts.length} 个钱包，已全部计入`
    }`
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
    .sort((a, b) => transactionLocalDateTime(b) - transactionLocalDateTime(a));
  selectedBillIds = new Set([...selectedBillIds].filter((id) => rows.some((item) => item.id === id)));
  renderBillSummary(rows);
  renderList("billTable", rows, renderTableRow, "没有符合条件的账单");
  updateBulkToolbar(rows);
}

function renderCreditCards() {
  const creditAccounts = state.accounts.filter((account) => account.type === "credit_card");
  const selectedAccount = creditAccounts.find((account) => account.id === selectedCreditAccountId);
  const overview = document.querySelector("#creditOverview");
  const detail = document.querySelector("#creditDetail");
  setText("creditCardSummary", `${creditAccounts.length} 张信用卡`);
  renderList("creditCardList", creditAccounts, renderCreditAccountCard, "还没有信用卡钱包");

  overview.hidden = Boolean(selectedAccount);
  detail.hidden = !selectedAccount;
  if (!selectedAccount) {
    selectedCreditAccountId = "";
    setText("installmentSummary", "0 个分期计划");
    setText("creditBillTitle", "信用卡账单");
    setText("creditBillSummary", "0 笔账单");
    renderList("installmentPlanList", [], renderInstallmentPlan, "请选择一张信用卡");
    renderList("creditBillList", [], renderCreditBillItem, "请选择一张信用卡");
    return;
  }

  const creditBillMonthInput = document.querySelector("#creditBillMonth");
  creditBillMonthInput.value = selectedCreditMonth;
  renderPeriodCascade(creditBillMonthInput, "month", selectedCreditMonth);
  renderCreditDetailHeader(selectedAccount);
  const installmentBills = state.transactions
    .filter((item) => item.installmentGroupId && item.accountId === selectedAccount.id)
    .sort((a, b) => transactionLocalDateTime(a) - transactionLocalDateTime(b));
  const plans = groupInstallmentBills(installmentBills);
  setText("installmentSummary", `${plans.length} 个分期计划`);
  renderList("installmentPlanList", plans, renderInstallmentPlan, "还没有信用卡分期");

  const billPeriod = getCreditBillPeriod(selectedAccount, selectedCreditMonth);
  const currentBills = transactionsForCreditBillPeriod(selectedAccount, selectedCreditMonth)
    .sort((a, b) => transactionLocalDateTime(b) - transactionLocalDateTime(a));
  setText("creditBillTitle", `${formatMonthLabel(selectedCreditMonth)}信用卡账单`);
  setText(
    "creditBillSummary",
    `${formatDateRange(billPeriod.start, billPeriod.end)} · ${currentBills.length} 笔账单 · 合计 ${formatCurrencyTotals(creditBillTotalByCurrency(currentBills, selectedAccount.id))}`
  );
  renderList("creditBillList", currentBills, (item) => renderCreditBillItem(item, selectedAccount.id), "这一期还没有信用卡账单");
}

function renderCategories() {
  const rows = state.categories.filter((item) => !item.archived).sort((a, b) => a.sortOrder - b.sortOrder);
  const groups = [
    { type: "expense", label: "支出分类", rows: rows.filter((item) => item.type === "expense") },
    { type: "income", label: "收入分类", rows: rows.filter((item) => item.type === "income") },
  ];
  document.querySelector("#categoryList").innerHTML = groups.map(renderCategoryGroup).join("");
}

function renderCategoryGroup(group) {
  const items = group.rows.length
    ? group.rows.map(renderCategoryItem).join("")
    : `<div class="category-group-empty">还没有${group.label}</div>`;
  return `<section class="category-group category-group-${group.type}" aria-labelledby="category-${group.type}-title">
    <div class="category-group-heading">
      <div>
        <span class="category-group-mark" aria-hidden="true"></span>
        <h3 id="category-${group.type}-title">${group.label}</h3>
      </div>
      <span>${group.rows.length} 个</span>
    </div>
    <div class="category-group-list">${items}</div>
  </section>`;
}

function renderStats() {
  const currency = el.statsCurrency.value || "CNY";
  const period = getStatsReportPeriod();
  const rawTransactions = transactionsForDateRange(period.start, period.end)
    .filter(isPostedTransaction)
    .filter((item) => transactionCurrency(item) === currency);
  const transactions = filterStatsTransactions(rawTransactions);
  const expenses = transactions.filter((item) => item.type === "expense");
  const incomes = transactions.filter((item) => item.type === "income");
  const expense = sumByType(transactions, "expense");
  const income = sumByType(transactions, "income");
  const savingRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
  const categoryTotals = getCategoryExpenseTotals(transactions, currency);
  const incomeTotals = getCategoryIncomeTotals(transactions, currency);
  const largest = categoryTotals[0];
  const biggestBill = [...expenses].sort((a, b) => b.amount - a.amount)[0];
  const previousExpense = sumByType(
    transactionsForDateRange(period.previousStart, period.start)
      .filter(isPostedTransaction)
      .filter((item) => transactionCurrency(item) === currency)
      .filter((item) => passesStatsFilters(item)),
    "expense"
  );

  setText("savingRate", `${savingRate}%`);
  setText("largestCategory", largest ? largest.category.name : "-");
  setText("largestExpense", biggestBill ? money(biggestBill.amount, currency) : money(0, currency));
  setText("monthDelta", money(expense - previousExpense, currency));
  setText("statsDeltaLabel", period.deltaLabel);
  setText("statsTrendTitle", period.trendTitle);
  setText("statsPeriodSummary", period.summary);
  setText("statsIncomeTotal", money(income, currency));
  setText("statsExpenseTotal", money(expense, currency));

  renderStatsTrend(transactions, currency, period);
  renderNetWorthTrend(currency, period, statsAssetValueMode);
  renderCategoryShare(categoryTotals, expense, currency);
  renderIncomeShare(incomeTotals, income, currency);
  renderSpendingAnalysis(transactions, categoryTotals, expense, currency);
  renderIncomeAnalysis(transactions, incomeTotals, income, currency);
  renderStatsFilters();
}

function changeStatsPage(page) {
  if (!["overview", "expense", "income"].includes(page)) return;
  statsPage = page;
  document.querySelectorAll("[data-stats-page]").forEach((button) => {
    const active = button.dataset.statsPage === page;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll("[data-stats-page-panel]").forEach((panel) => {
    const active = panel.dataset.statsPagePanel === page;
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });
}

function handleStatsFilterChange(event) {
  const checkbox = event.target.closest("[data-stats-filter-category]");
  if (!checkbox) return;
  if (checkbox.checked) statsExcludedCategories.add(checkbox.value);
  else statsExcludedCategories.delete(checkbox.value);
  renderStats();
}

function handleStatsFilterClick(event) {
  const addButton = event.target.closest("[data-add-stats-tag-filter]");
  if (addButton) {
    const input = addButton.closest(".stats-inline-filter")?.querySelector("[data-stats-tag-filter-input]");
    addStatsTagFilter(input);
    return;
  }
  const removeButton = event.target.closest("[data-remove-stats-tag]");
  if (removeButton) {
    statsExcludedTags.delete(removeButton.dataset.removeStatsTag);
    renderStats();
    return;
  }
  if (event.target.closest("[data-reset-stats-filters]")) {
    statsExcludedCategories.clear();
    statsExcludedTags.clear();
    renderStats();
  }
}

function handleStatsFilterKeydown(event) {
  const input = event.target.closest("[data-stats-tag-filter-input]");
  if (!input || event.key !== "Enter") return;
  event.preventDefault();
  addStatsTagFilter(input);
}

function changeStatsReportMode(mode) {
  if (!["week", "month", "year"].includes(mode)) return;
  statsReportMode = mode;
  document.querySelectorAll("[data-stats-mode]").forEach((button) => {
    const active = button.dataset.statsMode === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll("[data-stats-period]").forEach((field) => {
    field.hidden = field.dataset.statsPeriod !== mode;
  });
  renderStats();
}

function changeAssetsValueMode(mode) {
  if (!["total", "net"].includes(mode)) return;
  assetsValueMode = mode;
  updateAssetModeButtons("[data-assets-value-mode]", "assetsValueMode", mode);
  renderAssets();
}

function changeStatsAssetValueMode(mode) {
  if (!["total", "net"].includes(mode)) return;
  statsAssetValueMode = mode;
  updateAssetModeButtons("[data-stats-asset-mode]", "statsAssetMode", mode);
  renderStats();
}

function updateAssetModeButtons(selector, dataKey, mode) {
  document.querySelectorAll(selector).forEach((button) => {
    const active = button.dataset[dataKey] === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function getStatsReportPeriod() {
  if (statsReportMode === "week") {
    const anchor = parseLocalDate(el.statsWeekDate.value) || new Date(today);
    const start = startOfWeek(anchor);
    const end = addDays(start, 7);
    return {
      mode: "week", start, end, previousStart: addDays(start, -7),
      deltaLabel: "比上周变化", trendTitle: "本周每日收支",
      summary: `${formatShortDate(start)} - ${formatShortDate(addDays(end, -1))}`,
    };
  }

  if (statsReportMode === "year") {
    const year = Math.min(2100, Math.max(2000, Number(el.statsYearValue.value) || today.getFullYear()));
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    return {
      mode: "year", start, end, previousStart: new Date(year - 1, 0, 1),
      deltaLabel: "比上年变化", trendTitle: "全年每月收支", summary: `${year} 年全年`,
    };
  }

  const month = /^\d{4}-\d{2}$/.test(el.statsMonthValue.value) ? el.statsMonthValue.value : currentMonth;
  const [year, monthIndex] = month.split("-").map(Number);
  const start = new Date(year, monthIndex - 1, 1);
  const end = new Date(year, monthIndex, 1);
  return {
    mode: "month", start, end, previousStart: new Date(year, monthIndex - 2, 1),
    deltaLabel: "比上月变化", trendTitle: "本月每日收支", summary: `${year} 年 ${monthIndex} 月`,
  };
}

function transactionsForDateRange(start, end) {
  const startKey = toDateInput(start);
  const endKey = toDateInput(end);
  return state.transactions.filter((item) => {
    const dateKey = transactionDateKey(item);
    return dateKey >= startKey && dateKey < endKey;
  });
}

function renderTemplates() {
  const target = document.querySelector("#templateRow");
  target.innerHTML = state.quickTemplates.length
    ? state.quickTemplates.map(renderQuickTemplate).join("")
    : `<span class="empty-inline">暂无模板，点击右上角新建</span>`;
}

function renderQuickTemplate(item) {
  const category = findCategory(item.categoryId);
  const currency = resolveAccountCurrency(item.accountId, item.currency);
  return `<article class="quick-template-card">
    <button class="template-use" type="button" onclick="recordQuickTemplate('${item.id}')" title="使用此模板记一笔">
      ${categoryBadge(category)}
      <span class="template-copy">
        <strong>${escapeHtml(item.note)}</strong>
        <small>${escapeHtml(category?.name || "其他")} · ${escapeHtml(accountName(item.accountId) || "默认钱包")} · ${currency}</small>
      </span>
      <strong class="template-amount">${money(item.amount, currency)}</strong>
    </button>
    <button class="template-edit" type="button" onclick="editQuickTemplate('${item.id}')" title="编辑模板" aria-label="编辑模板">
      <span class="action-icon pencil-icon" aria-hidden="true"></span>
    </button>
  </article>`;
}

function recordQuickTemplate(id) {
  const item = state.quickTemplates.find((template) => template.id === id);
  if (!item) return;
  const currency = resolveAccountCurrency(item.accountId, item.currency);
  addQuickExpense(item.amount, item.categoryId, item.note, item.accountId, currency);
  toast(`已记录“${item.note}” ${money(item.amount, currency)}`);
}

function openNewQuickTemplate() {
  const form = el.quickTemplateForm;
  form.reset();
  form.id.value = "";
  fillCategorySelect(form.categoryId, "expense");
  fillAccountSelect(form.accountId);
  fillQuickCurrencySelect(form);
  form.hidden = false;
  setQuickTemplateFormMode(false);
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
  fillQuickCurrencySelect(form);
  form.currency.value = resolveAccountCurrency(form.accountId.value, item.currency);
  syncSelectDisplay(form.currency);
  form.hidden = false;
  setQuickTemplateFormMode(true);
  form.note.focus();
}

function setQuickTemplateFormMode(isEditing) {
  el.quickTemplateForm.querySelector(".template-delete").hidden = !isEditing;
  document.querySelector("#cancelQuickTemplate").textContent = isEditing ? "取消修改" : "取消";
  document.querySelector("#quickTemplateSubmit").textContent = isEditing ? "确认修改" : "保存模板";
}

function saveQuickTemplate(event) {
  event.preventDefault();
  const form = el.quickTemplateForm;
  const existing = state.quickTemplates.find((item) => item.id === form.id.value);
  const now = new Date().toISOString();
  const template = {
    id: form.id.value || crypto.randomUUID(),
    note: form.note.value.trim(),
    amount: Number(form.amount.value),
    categoryId: form.categoryId.value,
    accountId: form.accountId.value,
    currency: resolveAccountCurrency(form.accountId.value, form.currency.value),
    sortOrder: existing?.sortOrder ?? state.quickTemplates.length,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  const index = state.quickTemplates.findIndex((item) => item.id === template.id);
  if (index >= 0) state.quickTemplates[index] = template;
  else state.quickTemplates.push(template);
  clearRecordDeletion("quickTemplates", template.id);
  saveState();
  closeQuickTemplateEditor();
  renderTemplates();
  toast(index >= 0 ? "模板已更新" : "模板已创建");
}

function deleteEditingQuickTemplate() {
  const id = el.quickTemplateForm.id.value;
  const item = state.quickTemplates.find((template) => template.id === id);
  if (!item) return;
  if (!confirm(`确定删除模板“${item.note} ${money(item.amount, resolveAccountCurrency(item.accountId, item.currency))}”吗？`)) return;
  markRecordDeleted("quickTemplates", id);
  state.quickTemplates = state.quickTemplates.filter((template) => template.id !== id);
  saveState();
  closeQuickTemplateEditor();
  renderTemplates();
  toast("模板已删除");
}

function closeQuickTemplateEditor() {
  el.quickTemplateForm.hidden = true;
  el.quickTemplateForm.reset();
  el.quickTemplateForm.id.value = "";
  setQuickTemplateFormMode(false);
}

function renderStatsTrend(transactions, currency, period) {
  const totals = buildStatsBuckets(period).map((bucket) => ({ ...bucket, income: 0, expense: 0 }));
  transactions.forEach((item) => {
    if (!["income", "expense"].includes(item.type)) return;
    const date = transactionLocalDateTime(item);
    const bucket = totals.find((entry) => date >= entry.start && date < entry.end);
    if (bucket) bucket[item.type] += item.amount;
  });
  const max = Math.max(...totals.flatMap((item) => [item.income, item.expense]), 1);
  const chart = document.querySelector("#dailyChart");
  chart.className = `cashflow-chart is-${period.mode}`;
  chart.innerHTML = totals
    .map((item) => {
      const incomeHeight = Math.max((item.income / max) * 160, item.income ? 7 : 3);
      const expenseHeight = Math.max((item.expense / max) * 160, item.expense ? 7 : 3);
      return `<div class="cashflow-group" title="${escapeHtml(item.title)} · 收入 ${money(item.income, currency)} · 支出 ${money(item.expense, currency)}">
        <div class="cashflow-bars">
          <div class="cashflow-bar is-income" style="--bar-height:${incomeHeight}px">
            ${item.income ? `<b>${compactMoney(item.income, currency)}</b>` : ""}
            <span style="height:${incomeHeight}px"></span>
          </div>
          <div class="cashflow-bar is-expense" style="--bar-height:${expenseHeight}px">
            ${item.expense ? `<b>${compactMoney(item.expense, currency)}</b>` : ""}
            <span style="height:${expenseHeight}px"></span>
          </div>
        </div>
        <small>${item.label}</small>
      </div>`;
    })
    .join("");
}

function buildStatsBuckets(period) {
  if (period.mode === "week") {
    const labels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
    return labels.map((label, index) => {
      const start = addDays(period.start, index);
      return { label, title: formatShortDate(start), start, end: addDays(start, 1) };
    });
  }
  if (period.mode === "year") {
    return Array.from({ length: 12 }, (_, index) => {
      const start = new Date(period.start.getFullYear(), index, 1);
      return { label: `${index + 1}月`, title: `${period.start.getFullYear()}年${index + 1}月`, start, end: new Date(period.start.getFullYear(), index + 1, 1) };
    });
  }
  const days = new Date(period.end.getFullYear(), period.end.getMonth(), 0).getDate();
  return Array.from({ length: days }, (_, index) => {
    const start = new Date(period.start.getFullYear(), period.start.getMonth(), index + 1);
    return { label: String(index + 1), title: formatShortDate(start), start, end: addDays(start, 1) };
  });
}

function renderNetWorthTrend(currency, period, mode) {
  const isTotalAssets = mode === "total";
  const label = isTotalAssets ? "总资产" : "净资产";
  const buckets = buildStatsBuckets(period);
  const points = [
    { label: "期初", value: getAssetValueAt(currency, period.start, mode) },
    ...buckets.map((bucket) => ({ label: bucket.label, value: getAssetValueAt(currency, bucket.end, mode) })),
  ];
  const opening = points[0].value;
  const current = points[points.length - 1].value;
  setText("statsNetAssetCurrent", money(current, currency));
  setText("statsNetAssetChange", signedCompactMoney(current - opening, currency));
  setText("statsAssetTrendTitle", `${label}趋势`);
  setText("statsAssetTrendDescription", isTotalAssets ? "仅统计所选币种钱包的正余额" : "包含所选币种钱包的正负余额");
  setText("statsAssetEndLabel", `期末${label}`);

  const width = period.mode === "month" ? Math.max(1080, points.length * 52) : 920;
  const height = 270;
  const padding = { top: 42, right: 30, bottom: 42, left: 78 };
  const values = points.map((point) => point.value);
  let min = Math.min(...values);
  let max = Math.max(...values);
  const spread = Math.max(max - min, Math.max(Math.abs(max), 1) * 0.08, 1);
  min -= spread * 0.18;
  max += spread * 0.18;
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const x = (index) => padding.left + (innerWidth * index) / Math.max(points.length - 1, 1);
  const y = (value) => padding.top + ((max - value) / Math.max(max - min, 1)) * innerHeight;
  const linePoints = points.map((point, index) => `${x(index)},${y(point.value)}`).join(" ");
  const areaPoints = `${padding.left},${padding.top + innerHeight} ${linePoints} ${x(points.length - 1)},${padding.top + innerHeight}`;
  const extrema = new Set([values.indexOf(Math.min(...values)), values.indexOf(Math.max(...values)), points.length - 1]);
  const showEvery = period.mode === "month" ? 5 : 1;
  const grid = Array.from({ length: 4 }, (_, index) => {
    const ratio = index / 3;
    const value = max - (max - min) * ratio;
    const lineY = padding.top + innerHeight * ratio;
    return `<g><line x1="${padding.left}" y1="${lineY}" x2="${width - padding.right}" y2="${lineY}" class="net-grid-line"/><text x="${padding.left - 10}" y="${lineY + 4}" text-anchor="end" class="net-axis-value">${compactMoney(value, currency)}</text></g>`;
  }).join("");
  const pointMarkup = points.map((point, index) => {
    const pointX = x(index);
    const pointY = y(point.value);
    const showValue = index % showEvery === 0 || extrema.has(index);
    const showLabel = period.mode !== "month" || index === 0 || index % 5 === 0 || index === points.length - 1;
    const tooltipWidth = 134;
    const tooltipHeight = 50;
    const tooltipX = Math.min(Math.max(pointX - tooltipWidth / 2, 8), width - tooltipWidth - 8);
    const tooltipY = pointY > 92 ? pointY - tooltipHeight - 18 : pointY + 20;
    const tooltipValue = money(point.value, currency);
    return `<g class="net-hover-group" tabindex="0" aria-label="${escapeHtml(point.label)} ${escapeHtml(tooltipValue)}">
      <circle cx="${pointX}" cy="${pointY}" r="16" class="net-hit-area"></circle>
      <circle cx="${pointX}" cy="${pointY}" r="4" class="net-point"></circle>
      <g class="net-tooltip" transform="translate(${tooltipX} ${tooltipY})">
        <rect width="${tooltipWidth}" height="${tooltipHeight}" rx="8"></rect>
        <text x="12" y="19" class="net-tooltip-label">${escapeHtml(point.label)}</text>
        <text x="12" y="37" class="net-tooltip-value">${escapeHtml(tooltipValue)}</text>
      </g>
      ${showValue ? `<text x="${pointX}" y="${Math.max(16, pointY - 12)}" text-anchor="middle" class="net-point-value">${compactMoney(point.value, currency)}</text>` : ""}
      ${showLabel ? `<text x="${pointX}" y="${height - 14}" text-anchor="middle" class="net-axis-label">${escapeHtml(point.label)}</text>` : ""}
    </g>`;
  }).join("");
  document.querySelector("#netWorthChart").innerHTML = `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${label}趋势图">
    ${grid}
    <polygon points="${areaPoints}" class="net-area"/>
    <polyline points="${linePoints}" class="net-line"/>
    ${pointMarkup}
  </svg>`;
}

function getAssetValueAt(currency, cutoff, mode = "net") {
  const effectiveCutoff = cutoff > new Date() ? new Date() : cutoff;
  const balances = new Map();
  state.accounts
    .filter((account) => account.includeInAssets)
    .forEach((account) => {
      if (!isAccountBalanceRecognizedBefore(account, effectiveCutoff)) return;
      const currencyBalance = accountBalances(account.id).find((balance) => balance.currency === currency);
      if (currencyBalance) balances.set(account.id, Number(currencyBalance.initialBalance || 0));
    });
  state.transactions.forEach((item) => {
    if (!isBalanceRecognizedBefore(item, effectiveCutoff) || transactionCurrency(item) !== currency) return;
    if (item.type === "expense" && balances.has(item.accountId)) {
      balances.set(item.accountId, balances.get(item.accountId) - item.amount);
    }
    if (item.type === "income" && balances.has(item.accountId)) {
      balances.set(item.accountId, balances.get(item.accountId) + item.amount);
    }
    if (item.type === "transfer") {
      if (balances.has(item.accountId)) balances.set(item.accountId, balances.get(item.accountId) - item.amount);
      if (balances.has(item.targetAccountId)) balances.set(item.targetAccountId, balances.get(item.targetAccountId) + item.amount);
    }
  });
  return [...balances.values()].reduce(
    (total, value) => total + (mode === "total" ? Math.max(value, 0) : value),
    0
  );
}

function renderCategoryShare(rows, total, currency) {
  renderCategoryDonut("categoryDonut", "categoryShare", rows, total, currency, "本期还没有支出");
}

function renderIncomeShare(rows, total, currency) {
  renderCategoryDonut("incomeDonut", "incomeShare", rows, total, currency, "本期还没有收入");
}

function renderCategoryDonut(donutId, listId, rows, total, currency, emptyText) {
  let cursor = 0;
  const segments = rows
    .map((row) => {
      const start = cursor;
      const end = cursor + (row.amount / Math.max(total, 1)) * 100;
      cursor = end;
      return `${row.category.color} ${start}% ${end}%`;
    })
    .join(", ");
  document.querySelector(`#${donutId}`).style.background = segments ? `conic-gradient(${segments})` : "#eee8de";
  renderList(
    listId,
    rows,
    (row) => `<div class="rank-item">
      ${categoryBadge(row.category)}
      <div class="item-main"><strong>${row.category.name}</strong><span>${Math.round((row.amount / Math.max(total, 1)) * 100)}%</span></div>
      <strong>${money(row.amount, currency)}</strong>
    </div>`,
    emptyText
  );
}

function renderStatsFilters() {
  const categories = state.categories
    .filter((category) => category.enabled !== false && category.archived !== true)
    .sort((a, b) => a.type.localeCompare(b.type) || Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  document.querySelectorAll("[data-stats-category-filters]").forEach((target) => {
    const type = target.dataset.statsCategoryFilters;
    const rows = categories.filter((category) => !type || category.type === type);
    target.innerHTML = rows.map((category) => `
      <label class="stats-filter-option">
        <input type="checkbox" value="${category.id}" data-stats-filter-category ${statsExcludedCategories.has(category.id) ? "checked" : ""} />
        ${categoryBadge(category)}
        <span>${escapeHtml(category.name)}</span>
      </label>`).join("") || `<div class="empty-inline">还没有可筛选分类</div>`;
  });
  const tagRows = [...statsExcludedTags].sort();
  const tagMarkup = tagRows.length
    ? tagRows.map((tag) => `<button class="stats-filter-tag" type="button" data-remove-stats-tag="${escapeHtml(tag)}">${escapeHtml(tag)} ×</button>`).join("")
    : `<span class="empty-inline">还没有排除标签</span>`;
  document.querySelectorAll("[data-stats-tag-filters]").forEach((target) => {
    target.innerHTML = tagMarkup;
  });
}

function addStatsTagFilter(input) {
  if (!input) return;
  const tag = input.value.trim();
  if (!tag) return;
  statsExcludedTags.add(tag);
  document.querySelectorAll("[data-stats-tag-filter-input]").forEach((field) => {
    field.value = "";
  });
  renderStats();
}

function filterStatsTransactions(transactions) {
  return transactions.filter((item) => passesStatsFilters(item));
}

function passesStatsFilters(item) {
  if (statsExcludedCategories.has(item.categoryId)) return false;
  const tags = Array.isArray(item.tags) ? item.tags.map((tag) => String(tag).trim()).filter(Boolean) : [];
  return !tags.some((tag) => statsExcludedTags.has(tag));
}

function renderSpendingAnalysis(transactions, categoryTotals, totalExpense, currency) {
  const expenses = transactions.filter((item) => item.type === "expense");
  const topCategories = categoryTotals.slice(0, 5);
  const topNames = topCategories.slice(0, 3).map((row) => row.category.name);
  const insight = topCategories.length
    ? `本期支出主要流向${topNames.join("、")}，其中${topCategories[0].category.name}占 ${Math.round((topCategories[0].amount / Math.max(totalExpense, 1)) * 100)}%。`
    : "本期还没有足够的支出数据";
  setText("spendingInsight", insight);
  const tagRows = getTagTotalsByType(expenses, currency).slice(0, 6);
  const fixedRows = getFixedExpenseRows(expenses, currency).slice(0, 6);
  const fixedTotal = fixedRows.reduce((sum, row) => sum + row.amount, 0);
  setText("expenseAnalysisTotal", money(totalExpense, currency));
  setText("expenseAnalysisTopCategory", topCategories[0]?.category.name || "-");
  setText("expenseAnalysisFixed", money(fixedTotal, currency));
  setText("expenseAnalysisTags", `${expenses.length} 笔`);

  renderList(
    "spendingFlowList",
    topCategories,
    (row) => renderFlowRow({
      marker: categoryBadge(row.category),
      title: row.category.name,
      meta: `${Math.round((row.amount / Math.max(totalExpense, 1)) * 100)}% · ${row.currency}`,
      amount: money(row.amount, currency),
      value: row.amount,
      total: totalExpense,
    }),
    "本期还没有支出"
  );

  renderList(
    "tagFlowList",
    tagRows,
    (row) => renderFlowRow({
      marker: `<span class="flow-tag-marker">#</span>`,
      title: row.tag,
      meta: `${row.count} 笔 · ${Math.round((row.amount / Math.max(totalExpense, 1)) * 100)}%`,
      amount: money(row.amount, currency),
      value: row.amount,
      total: totalExpense,
    }),
    "本期还没有标签支出"
  );

  renderList(
    "fixedExpenseList",
    fixedRows,
    (row) => renderFlowRow({
      marker: categoryBadge(row.category),
      title: row.title,
      meta: `${row.count} 笔 · ${row.category?.name || "其他"}`,
      amount: money(row.amount, currency),
      value: row.amount,
      total: totalExpense,
    }),
    "本期暂未识别到固定支出"
  );
}

function renderFlowRow({ marker, title, meta, amount, value, total }) {
  const percent = Math.min(100, Math.max(4, (value / Math.max(total, 1)) * 100));
  return `<div class="flow-item">
    ${marker}
    <div class="flow-main">
      <div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(meta)}</span></div>
      <i style="--flow-width:${percent}%"></i>
    </div>
    <strong>${amount}</strong>
  </div>`;
}

function getFixedExpenseRows(expenses, currency) {
  const fixedCategoryIds = new Set(["housing", "utilities"]);
  const fixedKeywords = ["固定", "房租", "租金", "水电", "通讯", "手机费", "宽带", "订阅", "会员", "通勤", "月卡"];
  const map = new Map();
  expenses.forEach((item) => {
    const category = findCategory(item.categoryId);
    const text = `${item.note || ""} ${(Array.isArray(item.tags) ? item.tags : []).join(" ")}`;
    const hasFixedKeyword = fixedKeywords.some((keyword) => text.includes(keyword));
    const isFixed = fixedCategoryIds.has(item.categoryId) || hasFixedKeyword;
    if (!isFixed) return;
    const title = category?.name || item.note || "固定支出";
    const key = category?.id || item.note || "fixed";
    const current = map.get(key) || { title, category, amount: 0, count: 0, currency };
    current.amount += item.amount;
    current.count += 1;
    map.set(key, current);
  });
  return [...map.values()].sort((a, b) => b.amount - a.amount || b.count - a.count);
}

function renderIncomeAnalysis(transactions, incomeTotals, totalIncome, currency) {
  const incomes = transactions.filter((item) => item.type === "income");
  const topCategories = incomeTotals.slice(0, 5);
  const topNames = topCategories.slice(0, 3).map((row) => row.category.name);
  const insight = topCategories.length
    ? `本期收入主要来自${topNames.join("、")}，其中${topCategories[0].category.name}占 ${Math.round((topCategories[0].amount / Math.max(totalIncome, 1)) * 100)}%。`
    : "本期还没有足够的收入数据";
  setText("incomeInsight", insight);
  const tagRows = getTagTotalsByType(incomes, currency).slice(0, 6);
  const stableRows = getStableIncomeRows(incomes, currency).slice(0, 6);
  const stableTotal = stableRows.reduce((sum, row) => sum + row.amount, 0);
  setText("incomeAnalysisTotal", money(totalIncome, currency));
  setText("incomeAnalysisTopCategory", topCategories[0]?.category.name || "-");
  setText("incomeAnalysisStable", money(stableTotal, currency));
  setText("incomeAnalysisCount", `${incomes.length} 笔`);

  renderList(
    "incomeFlowList",
    topCategories,
    (row) => renderFlowRow({
      marker: categoryBadge(row.category),
      title: row.category.name,
      meta: `${Math.round((row.amount / Math.max(totalIncome, 1)) * 100)}% · ${row.currency}`,
      amount: money(row.amount, currency),
      value: row.amount,
      total: totalIncome,
    }),
    "本期还没有收入"
  );

  renderList(
    "incomeTagFlowList",
    tagRows,
    (row) => renderFlowRow({
      marker: `<span class="flow-tag-marker">#</span>`,
      title: row.tag,
      meta: `${row.count} 笔 · ${Math.round((row.amount / Math.max(totalIncome, 1)) * 100)}%`,
      amount: money(row.amount, currency),
      value: row.amount,
      total: totalIncome,
    }),
    "本期还没有收入标签"
  );

  renderList(
    "stableIncomeList",
    stableRows,
    (row) => renderFlowRow({
      marker: categoryBadge(row.category, "income"),
      title: row.title,
      meta: `${row.count} 笔 · ${row.category?.name || "其他"}`,
      amount: money(row.amount, currency),
      value: row.amount,
      total: totalIncome,
    }),
    "本期暂未识别到稳定收入"
  );
}

function getTagTotalsByType(items, currency) {
  const map = new Map();
  items.forEach((item) => {
    (Array.isArray(item.tags) ? item.tags : []).forEach((tag) => {
      const name = String(tag || "").trim();
      if (!name) return;
      const current = map.get(name) || { tag: name, amount: 0, count: 0 };
      current.amount += item.amount;
      current.count += 1;
      map.set(name, current);
    });
  });
  return [...map.values()]
    .map((row) => ({ ...row, currency }))
    .sort((a, b) => b.amount - a.amount || b.count - a.count);
}

function getStableIncomeRows(incomes, currency) {
  const stableCategoryIds = new Set(["salary", "side", "investment"]);
  const stableKeywords = ["固定收入", "工资", "薪资", "月薪", "副业", "分红", "利息", "稳定"];
  const map = new Map();
  incomes.forEach((item) => {
    const category = findCategory(item.categoryId);
    const text = `${item.note || ""} ${(Array.isArray(item.tags) ? item.tags : []).join(" ")}`;
    const isStable = stableCategoryIds.has(item.categoryId) || stableKeywords.some((keyword) => text.includes(keyword));
    if (!isStable) return;
    const title = category?.name || item.note || "稳定收入";
    const key = category?.id || item.note || "stable-income";
    const current = map.get(key) || { title, category, amount: 0, count: 0, currency };
    current.amount += item.amount;
    current.count += 1;
    map.set(key, current);
  });
  return [...map.values()].sort((a, b) => b.amount - a.amount || b.count - a.count);
}

function saveTransaction(event) {
  event.preventDefault();
  const form = el.transactionForm;
  const sourceAccount = findAccount(form.accountId.value || defaultAccountId());
  const targetAccount = findAccount(form.targetAccountId.value);
  const currency = supportedCurrencies.includes(form.currency.value) ? form.currency.value : currencyForAccount(sourceAccount?.id);
  const useInstallment = canUseInstallment() && form.useInstallment.checked && !form.id.value;
  const existingTransaction = form.id.value ? findTransaction(form.id.value) : null;
  const receivingCreditAccount = selectedType === "income" && sourceAccount?.type === "credit_card"
    ? sourceAccount
    : selectedType === "transfer" && targetAccount?.type === "credit_card"
      ? targetAccount
      : null;
  const selectedBillMonth = /^\d{4}-\d{2}$/.test(form.creditBillMonth.value) ? form.creditBillMonth.value : "";
  if (selectedType === "transfer" && form.accountId.value === form.targetAccountId.value) {
    toast("转出和转入不能是同一个钱包");
    return;
  }
  if (selectedType === "transfer" && !targetAccount) {
    toast("请选择转入钱包");
    return;
  }
  if (selectedType === "transfer" && !accountCurrencies(targetAccount).includes(currency)) {
    toast("转入钱包没有这个币种");
    return;
  }
  if (useInstallment) {
    saveInstallmentTransactions(form, currency);
    return;
  }
  const transaction = {
    id: form.id.value || crypto.randomUUID(),
    type: selectedType,
    amount: Number(form.amount.value),
    currency,
    categoryId: selectedType === "transfer" ? "transfer" : form.categoryId.value,
    accountId: form.accountId.value || defaultAccountId(),
    targetAccountId: selectedType === "transfer" ? form.targetAccountId.value : "",
    date: new Date(form.date.value).toISOString(),
    localDate: form.date.value.slice(0, 10),
    localTime: form.date.value.slice(11, 16),
    note: form.note.value.trim(),
    tags: splitTags(form.tags.value),
    createdAt: existingTransaction?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...(receivingCreditAccount && selectedBillMonth ? {
      creditBillAccountId: receivingCreditAccount.id,
      creditBillMonth: selectedBillMonth,
    } : {}),
    ...(existingTransaction?.installmentGroupId ? {
      installmentGroupId: existingTransaction.installmentGroupId,
      installmentIndex: existingTransaction.installmentIndex,
      installmentCount: existingTransaction.installmentCount,
      installmentTotal: existingTransaction.installmentTotal,
      installmentPurchaseDate: existingTransaction.installmentPurchaseDate || existingTransaction.createdAt || existingTransaction.date,
    } : {}),
  };
  const balanceError = validateNonCreditBalancesAfterTransaction(transaction);
  if (balanceError) {
    toast(balanceError);
    return;
  }
  upsertTransaction(transaction);
  resetTransactionForm();
  form.amount.focus();
  toast(existingTransaction ? "账单已修改" : "账单已保存");
}

function saveInstallmentTransactions(form, currency) {
  const count = Math.min(60, Math.max(2, Number(form.installmentCount.value || 2)));
  const totalAmount = Number(form.amount.value);
  const account = findAccount(form.accountId.value || defaultAccountId());
  if (!account || account.type !== "credit_card") {
    toast("请选择信用卡钱包后再使用分期");
    updateInstallmentFields();
    return;
  }
  if (!totalAmount || totalAmount <= 0) {
    toast("请输入有效的分期总金额");
    return;
  }
  if (!form.categoryId.value) {
    toast("请选择分期分类");
    return;
  }
  const baseAmount = Math.floor((totalAmount / count) * 100) / 100;
  const date = parseLocalDate(form.installmentStartDate.value) || new Date(form.date.value);
  if (Number.isNaN(date.getTime())) {
    toast("请选择首期日期");
    return;
  }
  const groupId = crypto.randomUUID();
  const now = new Date().toISOString();
  const purchaseDate = new Date(form.date.value);
  const installmentPurchaseDate = Number.isNaN(purchaseDate.getTime()) ? now : purchaseDate.toISOString();
  const note = form.note.value.trim() || "信用卡分期";
  const tags = splitTags(form.tags.value);
  const transactions = Array.from({ length: count }, (_, index) => {
    const amount = index === count - 1 ? Number((totalAmount - baseAmount * (count - 1)).toFixed(2)) : baseAmount;
    const installmentDate = addMonthsToDate(date, index);
    return {
      id: crypto.randomUUID(),
      type: "expense",
      amount,
      currency,
      categoryId: form.categoryId.value,
      accountId: form.accountId.value || defaultAccountId(),
      targetAccountId: "",
      date: installmentDate.toISOString(),
      localDate: toDateInput(installmentDate),
      localTime: "00:00",
      note: `${note} ${index + 1}/${count}`,
      tags,
      installmentGroupId: groupId,
      installmentIndex: index + 1,
      installmentCount: count,
      installmentTotal: totalAmount,
      installmentPurchaseDate,
      createdAt: now,
      updatedAt: now,
    };
  });

  transactions.forEach(ensureAccountBalanceStart);
  state.transactions = [...transactions, ...state.transactions];
  saveState();
  renderAll();
  resetTransactionForm();
  form.amount.focus();
  toast(`已生成 ${count} 期账单`);
}

function saveQuickTransaction(event) {
  event.preventDefault();
  const form = el.quickForm;
  const amount = Number(form.amount.value);
  const currency = resolveAccountCurrency(form.accountId.value, form.currency.value);
  const saved = addQuickExpense(amount, form.categoryId.value, form.note.value.trim(), form.accountId.value, currency);
  if (!saved) return;
  form.reset();
  fillSelects();
  toast(`已记录 ${money(amount, currency)}`);
}

function addQuickExpense(amount, categoryId, note, accountId = defaultAccountId(), currency = "") {
  const now = new Date();
  const timestamp = now.toISOString();
  const resolvedAccountId = findAccount(accountId) ? accountId : defaultAccountId();
  const resolvedCurrency = resolveAccountCurrency(resolvedAccountId, currency);
  const transaction = {
    id: crypto.randomUUID(),
    type: "expense",
    amount,
    categoryId,
    accountId: resolvedAccountId,
    currency: resolvedCurrency,
    targetAccountId: "",
    date: timestamp,
    localDate: toDateInput(now),
    localTime: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    note,
    tags: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const balanceError = validateNonCreditBalancesAfterTransaction(transaction);
  if (balanceError) {
    toast(balanceError);
    return false;
  }
  upsertTransaction(transaction);
  return true;
}

function saveAccount(event) {
  event.preventDefault();
  const form = el.accountForm;
  const name = form.name.value.trim();
  const isCreditCard = form.type.value === "credit_card";
  const enteredBalances = readAccountBalanceRows(isCreditCard);
  if (!enteredBalances.length) {
    toast("请至少保留一个币种余额");
    return;
  }
  if (!isCreditCard && enteredBalances.some((balance) => Number(balance.initialBalance) < 0)) {
    toast("普通钱包余额不能为负数");
    return;
  }
  const duplicate = state.accounts.some(
    (item) => item.id !== form.id.value && item.name.trim().toLowerCase() === name.toLowerCase()
  );
  if (duplicate) {
    toast("已经有同名钱包了");
    return;
  }

  const existingAccount = form.id.value ? findAccount(form.id.value) : null;
  const now = new Date().toISOString();
  const existingBalanceStart = new Date(existingAccount?.balanceStartedAt || 0);
  const openingDebtBalances = !existingAccount && isCreditCard
    ? enteredBalances.filter((balance) => Number(balance.initialBalance) < 0)
    : [];
  const balances = existingAccount
    ? currentBalancesToInitialBalances(existingAccount.id, enteredBalances)
    : isCreditCard
      ? enteredBalances.map((balance) => ({ ...balance, initialBalance: 0 }))
      : enteredBalances;
  const account = {
    id: form.id.value || crypto.randomUUID(),
    name,
    type: form.type.value,
    currency: balances[0].currency,
    initialBalance: balances[0].initialBalance,
    balances,
    creditLimit: isCreditCard ? Math.max(0, Number(form.creditLimit.value || 0)) : 0,
    billingDay: isCreditCard ? Number(form.billingDay.value || 1) : 1,
    dueDay: isCreditCard ? Number(form.dueDay.value || 20) : 20,
    includeInAssets: form.includeInAssets.checked,
    sortOrder: existingAccount?.sortOrder ?? state.accounts.length,
    createdAt: existingAccount?.createdAt || now,
    balanceStartedAt: existingAccount && !Number.isNaN(existingBalanceStart.getTime()) && existingBalanceStart.getTime() > 0
      ? existingAccount.balanceStartedAt
      : now,
    updatedAt: now,
  };
  const index = state.accounts.findIndex((item) => item.id === account.id);
  const hasTransactions = existingAccount && state.transactions.some(
    (item) => item.accountId === account.id || item.targetAccountId === account.id
  );
  const missingCurrencies = hasTransactions
    ? [...new Set(state.transactions
        .filter((item) => item.accountId === account.id || item.targetAccountId === account.id)
        .map((item) => transactionCurrency(item)))]
        .filter((currency) => !balances.some((balance) => balance.currency === currency))
    : [];
  if (missingCurrencies.length) {
    toast(`已有 ${missingCurrencies.join("、")} 账单，不能删除这些币种`);
    return;
  }
  if (hasTransactions && existingAccount.type !== account.type && [existingAccount.type, account.type].includes("credit_card")) {
    toast("已有账单的钱包不能切换为信用卡类型");
    return;
  }
  if (!isCreditCard && balances.some((balance) => getProjectedAccountBalance(account, balance.currency) < -0.005)) {
    toast("普通钱包余额不能为负数");
    return;
  }
  if (index >= 0) state.accounts[index] = account;
  else state.accounts.push(account);
  clearRecordDeletion("accounts", account.id);
  const openingDebtTransactions = createOpeningCreditDebtTransactions(account, openingDebtBalances);
  if (openingDebtTransactions.length) state.transactions.unshift(...openingDebtTransactions);
  state.quickTemplates = state.quickTemplates.map((template) => template.accountId === account.id
    ? { ...template, currency: resolveAccountCurrency(account.id, template.currency), updatedAt: now }
    : template
  );
  saveState();
  closeAccountModal();
  renderAll();
  toast(index >= 0
    ? "钱包已更新"
    : openingDebtTransactions.length
      ? `钱包已添加，并记录 ${openingDebtTransactions.length} 笔初始欠款`
      : "钱包已添加"
  );
}

function createOpeningCreditDebtTransactions(account, debtBalances) {
  if (account.type !== "credit_card" || !debtBalances.length) return [];
  const now = new Date();
  const period = getCreditBillPeriod(account, currentMonth);
  const billDate = now < period.start ? period.start : now > period.end ? period.end : now;
  const timestamp = now.toISOString();
  return debtBalances.map((balance) => ({
    id: crypto.randomUUID(),
    type: "expense",
    amount: Math.abs(Number(balance.initialBalance)),
    currency: balance.currency,
    categoryId: "other-expense",
    accountId: account.id,
    targetAccountId: "",
    date: billDate.toISOString(),
    localDate: toDateInput(billDate),
    localTime: `${String(billDate.getHours()).padStart(2, "0")}:${String(billDate.getMinutes()).padStart(2, "0")}`,
    note: "初始信用卡欠款",
    tags: [],
    openingCreditDebt: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));
}

function saveCategory(event) {
  event.preventDefault();
  const form = el.categoryForm;
  const isEditing = Boolean(form.id.value);
  const existing = form.id.value ? findCategory(form.id.value) : null;
  const now = new Date().toISOString();
  const category = {
    id: form.id.value || crypto.randomUUID(),
    name: form.name.value.trim(),
    type: form.type.value,
    icon: categoryIconSvgs[form.icon.value] ? form.icon.value : normalizeCategoryCustomIcon(form.icon.value),
    color: form.color.value,
    sortOrder: existing?.sortOrder ?? state.categories.length + 1,
    enabled: form.enabled.checked,
    archived: false,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  const index = state.categories.findIndex((item) => item.id === category.id);
  if (index >= 0) state.categories[index] = category;
  else state.categories.push(category);
  saveState();
  resetCategoryForm();
  renderAll();
  toast(isEditing ? "分类已修改" : "分类已保存");
}

function upsertTransaction(transaction) {
  ensureAccountBalanceStart(transaction);
  const index = state.transactions.findIndex((item) => item.id === transaction.id);
  if (index >= 0) state.transactions[index] = transaction;
  else state.transactions.unshift(transaction);
  clearRecordDeletion("transactions", transaction.id);
  saveState();
  renderAll();
}

function validateNonCreditBalancesAfterTransaction(transaction) {
  const existing = findTransaction(transaction.id);
  const nextAffectedIds = transaction.type === "transfer"
    ? [transaction.accountId, transaction.targetAccountId]
    : [transaction.accountId];
  const previousAffectedIds = existing
    ? existing.type === "transfer"
      ? [existing.accountId, existing.targetAccountId]
      : [existing.accountId]
    : [];
  const affectedIds = [...new Set([...nextAffectedIds, ...previousAffectedIds].filter(Boolean))];
  const transactions = [
    transaction,
    ...state.transactions.filter((item) => item.id !== transaction.id),
  ];
  const currencies = new Set([transactionCurrency(transaction), existing ? transactionCurrency(existing) : ""]);
  for (const accountId of affectedIds) {
    const account = findAccount(accountId);
    if (!account || account.type === "credit_card") continue;
    for (const currency of currencies) {
      if (!currency || !accountCurrencies(account).includes(currency)) continue;
      const balance = getProjectedAccountBalance(account, currency, transactions);
      if (balance < -0.005) {
        return `${account.name} 的 ${currency} 余额不能为负数`;
      }
    }
  }
  return "";
}

function editTransaction(id) {
  const item = findTransaction(id);
  if (!item) return;
  selectedType = item.type;
  setType(item.type);
  const form = el.transactionForm;
  form.id.value = item.id;
  form.amount.value = item.amount;
  const originalCategory = findCategory(item.categoryId);
  const categoryIsCurrent = originalCategory && !originalCategory.archived && originalCategory.enabled;
  if (item.type !== "transfer" && !categoryIsCurrent) {
    form.categoryId.insertAdjacentHTML("afterbegin", `<option value="">请选择当前分类（原分类已不可用）</option>`);
    form.categoryId.value = "";
    syncSelectDisplay(form.categoryId);
  } else {
    form.categoryId.value = item.categoryId;
  }
  form.accountId.value = item.accountId;
  fillTransactionCurrencySelect();
  form.currency.value = transactionCurrency(item);
  form.targetAccountId.value = item.targetAccountId || "";
  form.date.value = toTransactionDateTimeInput(item);
  renderPeriodCascade(form.date, "datetime", form.date.value);
  form.tags.value = item.tags.join(", ");
  form.note.value = item.note;
  updateInstallmentFields();
  form.creditBillMonth.value = item.creditBillAccountId === creditReceivingAccount()?.id
    ? item.creditBillMonth || ""
    : "";
  updateCreditBillPeriodField();
  setTransactionFormMode(true);
  switchView("add");
  if (item.type !== "transfer" && !categoryIsCurrent) toast("原分类已删除或停用，请选择当前分类");
}

function selectCreditAccount(id) {
  if (!findAccount(id)) return;
  selectedCreditAccountId = id;
  renderCreditCards();
}

function showCreditCardList() {
  selectedCreditAccountId = "";
  renderCreditCards();
}

function deleteTransaction(id) {
  if (!confirm("确定删除这笔账单吗？")) return;
  markRecordDeleted("transactions", id);
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
  selectedBillIds.forEach((id) => markRecordDeleted("transactions", id));
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
  if (!item) return;
  const form = el.categoryForm;
  form.id.value = item.id;
  form.name.value = item.name;
  form.type.value = item.type;
  const iconKey = categoryIconKey(item);
  form.icon.value = iconKey || item.icon;
  form.customIcon.value = iconKey ? "" : item.icon;
  form.color.value = item.color;
  form.enabled.checked = item.enabled;
  document.querySelector("#categoryFormTitle").textContent = "编辑分类";
  setCategoryFormMode(true);
  syncCategoryIconPicker();
  updateCategoryPreview();
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
    ? `这个分类下有 ${usedCount} 笔历史账单。删除后历史账单仍保留原分类，但新账单不再可选，确定删除吗？`
    : `确定删除“${category.name}”分类吗？`;
  if (!confirm(message)) return;

  const replacementId = currentCategoryFallbackId(category.type, id);
  state.categories = state.categories.map((item) => item.id === id
    ? { ...item, enabled: false, archived: true, archivedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    : item
  );
  state.quickTemplates = replacementId
    ? state.quickTemplates.map((item) => item.categoryId === id
      ? { ...item, categoryId: replacementId, updatedAt: new Date().toISOString() }
      : item)
    : state.quickTemplates.filter((item) => item.categoryId !== id);
  saveState();
  resetCategoryForm();
  renderAll();
  toast("分类已删除，历史账单保持不变");
}

function editAccount(id) {
  const account = findAccount(id);
  if (!account) return;
  const form = el.accountForm;
  form.id.value = account.id;
  form.name.value = account.name;
  form.type.value = account.type;
  updateCreditCardFields();
  form.creditLimit.value = account.creditLimit || 0;
  form.billingDay.value = account.billingDay || 1;
  form.dueDay.value = account.dueDay || 20;
  renderAccountBalanceRows(
    getAccountBalances(account.id).map(({ currency, value }) => ({ currency, initialBalance: value })),
    account.type === "credit_card"
  );
  form.includeInAssets.checked = account.includeInAssets;
  document.querySelector("#accountFormTitle").textContent = "编辑钱包";
  setAccountFormMode(true);
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
  const updatedAt = new Date().toISOString();
  state.quickTemplates = state.quickTemplates.map((template) =>
    template.accountId === id
      ? { ...template, accountId: replacementId, currency: currencyForAccount(replacementId), updatedAt }
      : template
  );
  state.accounts = state.accounts.filter((item) => item.id !== id);
  markRecordDeleted("accounts", id);
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
  const updatedAt = new Date().toISOString();
  state.accounts = accounts.map((item, sortOrder) => ({ ...item, sortOrder, updatedAt }));
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
  const updatedAt = new Date().toISOString();
  state.accounts = accounts.map((item, sortOrder) => ({ ...item, sortOrder, updatedAt }));
  saveState();
  renderAll();
  toast("钱包顺序已更新");
}

function resetTransactionForm() {
  el.transactionForm.reset();
  el.transactionForm.id.value = "";
  el.transactionForm.date.value = toDateTimeInput(new Date());
  el.transactionForm.installmentStartDate.value = toDateInput(new Date());
  el.transactionForm.installmentCount.value = "3";
  el.transactionForm.accountId.value = defaultAccountId();
  el.transactionForm.creditBillMonth.value = "";
  renderPeriodCascade(el.transactionForm.date, "datetime", el.transactionForm.date.value);
  renderPeriodCascade(el.transactionForm.installmentStartDate, "date", el.transactionForm.installmentStartDate.value);
  fillTransactionCurrencySelect();
  selectedType = "expense";
  setType("expense");
  setTransactionFormMode(false);
}

function setTransactionFormMode(isEditing) {
  document.querySelector("#cancelTransactionEdit").hidden = !isEditing;
  document.querySelector("#transactionSubmit").textContent = isEditing ? "确认修改" : "保存账单";
}

function canUseInstallment() {
  const form = el.transactionForm;
  const account = findAccount(form.accountId.value || defaultAccountId());
  return selectedType === "expense" && account?.type === "credit_card" && !form.id.value;
}

function updateInstallmentFields() {
  const form = el.transactionForm;
  const enabled = canUseInstallment();
  document.querySelector(".installment-toggle-field").hidden = !enabled;
  if (!enabled) form.useInstallment.checked = false;
  document.querySelector("#installmentFields").hidden = !(enabled && form.useInstallment.checked);
  form.installmentCount.disabled = !(enabled && form.useInstallment.checked);
  form.installmentStartDate.disabled = !(enabled && form.useInstallment.checked);
  if (!form.installmentStartDate.value) form.installmentStartDate.value = form.date.value ? form.date.value.slice(0, 10) : toDateInput(new Date());
  renderPeriodCascade(form.installmentStartDate, "date", form.installmentStartDate.value);
}

function syncInstallmentStartDate() {
  el.transactionForm.installmentStartDate.value = el.transactionForm.date.value
    ? el.transactionForm.date.value.slice(0, 10)
    : toDateInput(new Date());
  renderPeriodCascade(el.transactionForm.installmentStartDate, "date", el.transactionForm.installmentStartDate.value);
}

function creditReceivingAccount() {
  const form = el.transactionForm;
  if (selectedType === "income") return findAccount(form.accountId.value || defaultAccountId());
  if (selectedType === "transfer") return findAccount(form.targetAccountId.value);
  return null;
}

function creditBillMonthForDate(account, value) {
  const date = value instanceof Date ? value : new Date(value);
  if (!account || Number.isNaN(date.getTime())) return currentMonth;
  const billingDay = Math.min(28, Math.max(1, Number(account.billingDay || 1)));
  const statementDate = new Date(date.getFullYear(), date.getMonth() + (date.getDate() > billingDay ? 1 : 0), 1);
  return toMonth(statementDate);
}

function updateCreditBillPeriodField() {
  const form = el.transactionForm;
  const field = document.querySelector(".credit-bill-period-field");
  const account = creditReceivingAccount();
  const isVisible = account?.type === "credit_card";
  field.hidden = !isVisible;
  form.creditBillMonth.disabled = !isVisible;
  if (!isVisible) {
    form.creditBillMonth.value = "";
    return;
  }

  const selected = form.creditBillMonth.value;
  const automaticMonth = creditBillMonthForDate(account, form.date.value || new Date());
  renderPeriodCascade(
    form.creditBillMonth,
    "month",
    /^\d{4}-\d{2}$/.test(selected) ? selected : "",
    { allowAuto: true, autoLabel: `自动归入（${formatMonthLabel(automaticMonth)}账单）` }
  );
}

function resetAccountForm() {
  el.accountForm.reset();
  el.accountForm.id.value = "";
  el.accountForm.creditLimit.value = "0";
  el.accountForm.billingDay.value = "1";
  el.accountForm.dueDay.value = "20";
  el.accountForm.includeInAssets.checked = true;
  document.querySelector("#accountFormTitle").textContent = "新增钱包";
  setAccountFormMode(false);
  renderAccountBalanceRows([{ currency: "CNY", initialBalance: 0 }], false);
  updateCreditCardFields();
}

function setAccountFormMode(isEditing) {
  document.querySelector("#cancelAccountModal").textContent = isEditing ? "取消修改" : "取消";
  document.querySelector("#accountSubmit").textContent = isEditing ? "确认修改" : "保存钱包";
}

function updateCreditCardFields() {
  const form = el.accountForm;
  const isCreditCard = form.type.value === "credit_card";
  document.querySelector("#creditCardFields").hidden = !isCreditCard;
  form.creditLimit.disabled = !isCreditCard;
  form.billingDay.disabled = !isCreditCard;
  form.dueDay.disabled = !isCreditCard;
  document.querySelector("#initialBalanceLabel").textContent = isCreditCard ? "币种欠款" : "币种余额";
  document.querySelector("#creditOpeningDebtHint").hidden = !isCreditCard || Boolean(form.id.value);
  normalizeBalanceRowSigns(isCreditCard);
  updateAccountIconPreview();
}

function updateAccountIconPreview() {
  const type = el.accountForm.type.value || "other";
  const meta = accountTypes[type] || accountTypes.other;
  document.querySelector("#accountIconPreview").innerHTML = accountLogoMarkup({ type });
  setText("accountIconPreviewLabel", meta.label);
}

function renderAccountBalanceRows(balances = [{ currency: "CNY", initialBalance: 0 }], isCreditCard = false) {
  const rows = balances.length ? balances : [{ currency: "CNY", initialBalance: 0 }];
  document.querySelector("#accountBalanceRows").innerHTML = rows
    .map((balance) => accountBalanceRowTemplate(balance, isCreditCard))
    .join("");
}

function addAccountBalanceRow(currency = "", initialBalance = 0) {
  const used = readAccountBalanceRows(false).map((balance) => balance.currency);
  const nextCurrency = currency || supportedCurrencies.find((item) => !used.includes(item)) || "CNY";
  document.querySelector("#accountBalanceRows").insertAdjacentHTML(
    "beforeend",
    accountBalanceRowTemplate({ currency: nextCurrency, initialBalance }, el.accountForm.type.value === "credit_card")
  );
}

function accountBalanceRowTemplate(balance, isCreditCard) {
  const amount = isCreditCard ? Math.abs(Number(balance.initialBalance || 0)) : Number(balance.initialBalance || 0);
  return `<div class="balance-row">
    <select name="balanceCurrency" aria-label="币种">
      ${supportedCurrencies.map((currency) => `<option value="${currency}" ${currency === balance.currency ? "selected" : ""}>${currencyNames[currency] || currency} ${currency}</option>`).join("")}
    </select>
    <input name="balanceAmount" type="number" step="0.01" min="0" value="${amount}" aria-label="${isCreditCard ? "当前欠款" : "当前余额"}" />
    <button class="icon-button danger-button" type="button" onclick="removeAccountBalanceRow(this)" title="删除币种" aria-label="删除币种"><span class="action-icon trash-icon" aria-hidden="true"></span></button>
  </div>`;
}

function removeAccountBalanceRow(button) {
  const rows = document.querySelectorAll("#accountBalanceRows .balance-row");
  if (rows.length <= 1) {
    toast("至少保留一个币种");
    return;
  }
  button.closest(".balance-row")?.remove();
}

function readAccountBalanceRows(isCreditCard) {
  const rows = [...document.querySelectorAll("#accountBalanceRows .balance-row")];
  const seen = new Set();
  return rows
    .map((row) => {
      const currency = row.querySelector("[name='balanceCurrency']").value;
      const amount = Number(row.querySelector("[name='balanceAmount']").value || 0);
      return {
        currency,
        initialBalance: isCreditCard ? -Math.abs(amount) : amount,
      };
    })
    .filter((balance) => {
      if (!supportedCurrencies.includes(balance.currency) || seen.has(balance.currency)) return false;
      seen.add(balance.currency);
      return true;
    });
}

function normalizeBalanceRowSigns(isCreditCard) {
  document.querySelectorAll("#accountBalanceRows [name='balanceAmount']").forEach((input) => {
    input.min = "0";
    input.value = isCreditCard ? Math.abs(Number(input.value || 0)) : Number(input.value || 0);
  });
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
  el.categoryForm.icon.value = "utensils";
  el.categoryForm.customIcon.value = "";
  el.categoryForm.color.value = "#0f766e";
  el.categoryForm.enabled.checked = true;
  document.querySelector("#categoryFormTitle").textContent = "新增分类";
  setCategoryFormMode(false);
  syncCategoryIconPicker();
  updateCategoryPreview();
}

function setCategoryFormMode(isEditing) {
  document.querySelector("#cancelCategoryEdit").hidden = !isEditing;
  document.querySelector("#categorySubmit").textContent = isEditing ? "确认修改" : "保存分类";
}

function updateCategoryPreview() {
  const form = el.categoryForm;
  const color = form.color.value || "#247c7a";
  const enabled = form.enabled.checked;
  document.querySelector("#categoryPreviewIcon").innerHTML = categoryIconMarkup({ icon: form.icon.value }, "类");
  document.querySelector("#categoryPreviewIcon").style.backgroundColor = color;
  document.querySelector("#categoryPreviewName").textContent = form.name.value.trim() || "分类名称";
  document.querySelector("#categoryPreviewType").textContent = `${form.type.value === "income" ? "收入" : "支出"}分类${enabled ? "" : " · 已停用"}`;
  document.querySelector("#categoryColorValue").textContent = color.toUpperCase();
  document.querySelector(".category-preview").classList.toggle("is-disabled", !enabled);
}

function renderCategoryIconPicker() {
  document.querySelector("#categoryIconPicker").innerHTML = categoryIconOptions
    .map(([key, label]) => `<button class="category-icon-option" type="button" data-icon-key="${key}" title="${label}" aria-label="${label}" aria-pressed="false" onclick="selectCategoryIcon('${key}')">${categorySvg(key)}<span>${label}</span></button>`)
    .join("");
  syncCategoryIconPicker();
}

function selectCategoryIcon(key) {
  if (!categoryIconSvgs[key]) return;
  el.categoryForm.icon.value = key;
  el.categoryForm.customIcon.value = "";
  syncCategoryIconPicker();
  updateCategoryPreview();
}

function updateCustomCategoryIcon() {
  const value = normalizeCategoryCustomIcon(el.categoryForm.customIcon.value);
  el.categoryForm.customIcon.value = value;
  if (value) el.categoryForm.icon.value = value;
  else if (!categoryIconSvgs[el.categoryForm.icon.value]) el.categoryForm.icon.value = "utensils";
  syncCategoryIconPicker();
  updateCategoryPreview();
}

function syncCategoryIconPicker() {
  const selected = el.categoryForm.icon.value;
  document.querySelectorAll(".category-icon-option").forEach((button) => {
    const active = button.dataset.iconKey === selected;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function normalizeCategoryCustomIcon(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  let graphemes;
  try {
    graphemes = [...new Intl.Segmenter("zh-CN", { granularity: "grapheme" }).segment(text)].map((item) => item.segment);
  } catch {
    graphemes = Array.from(text);
  }
  const first = graphemes[0] || "";
  return isCategoryEmoji(first) ? first : graphemes.slice(0, 2).join("");
}

function normalizeStoredCategoryIcon(value) {
  const icon = String(value || "").trim();
  if (!icon || categoryIconSvgs[icon]) return icon;
  const restoredKey = Object.keys(categoryIconSvgs).find((key) => key.slice(0, 2) === icon);
  return restoredKey || icon;
}

function isCategoryEmoji(value) {
  return /[\p{Extended_Pictographic}\p{Regional_Indicator}]/u.test(String(value || ""));
}

function changeTransactionType(type) {
  const form = el.transactionForm;
  const editingTransaction = form.id.value ? findTransaction(form.id.value) : null;
  if (editingTransaction && editingTransaction.type !== type) {
    form.id.value = "";
    setTransactionFormMode(false);
    toast("已切换为新账单，原账单会保留");
  }
  setType(type);
}

function setType(type) {
  selectedType = type;
  document.querySelectorAll(".segment").forEach((button) => button.classList.toggle("active", button.dataset.type === type));
  el.transactionForm.classList.toggle("is-transfer", type === "transfer");
  fillCategorySelect(el.transactionForm.categoryId, type === "transfer" ? "expense" : type);
  el.transactionForm.categoryId.disabled = type === "transfer";
  fillTransactionCurrencySelect();
  updateInstallmentFields();
  updateCreditBillPeriodField();
}

function fillSelects() {
  fillCategorySelect(el.quickForm.categoryId, "expense");
  fillCategorySelect(el.quickTemplateForm.categoryId, "expense");
  fillAccountSelect(el.quickForm.accountId);
  fillAccountSelect(el.quickTemplateForm.accountId);
  fillQuickCurrencySelect(el.quickForm);
  fillQuickCurrencySelect(el.quickTemplateForm);
  fillCategorySelect(el.transactionForm.categoryId, selectedType === "transfer" ? "expense" : selectedType);
  fillCategoryFilter();
  fillAccountSelect(el.transactionForm.accountId);
  fillAccountSelect(el.transactionForm.targetAccountId);
  fillTransactionCurrencySelect();
  updateCreditBillPeriodField();
  fillAccountFilter();
  fillSummaryCurrencySelects();
  fillStatsCurrencySelect();
}

function fillCategorySelect(select, type) {
  const selected = select.value;
  const categories = enabledCategories(type);
  select.innerHTML = categories
    .map((item) => `<option value="${item.id}">${item.name}</option>`)
    .join("");
  select.value = categories.some((item) => item.id === selected) ? selected : categories[0]?.id || "";
  syncSelectDisplay(select);
}

function fillCategoryFilter() {
  const select = document.querySelector("#categoryFilter");
  const selected = select.value;
  select.innerHTML = `<option value="all">全部分类</option>${state.categories
    .map((item) => `<option value="${item.id}">${item.name}${item.archived ? "（已删除）" : ""}</option>`)
    .join("")}`;
  select.value = selected || "all";
  syncSelectDisplay(select);
}

function fillAccountSelect(select) {
  const selected = select.value;
  select.innerHTML = state.accounts
    .map((item) => `<option value="${item.id}">${escapeHtml(item.name)} · ${accountCurrencies(item).join("/")}</option>`)
    .join("");
  select.value = state.accounts.some((item) => item.id === selected) ? selected : state.accounts[0]?.id || "";
  syncSelectDisplay(select);
}

function fillQuickCurrencySelect(form) {
  const selected = form.currency.value;
  const account = findAccount(form.accountId.value || defaultAccountId());
  const currencies = accountCurrencies(account);
  form.currency.innerHTML = currencies
    .map((currency) => `<option value="${currency}">${currencyNames[currency] || currency} · ${currency}</option>`)
    .join("");
  form.currency.value = currencies.includes(selected) ? selected : currencies[0] || "CNY";
  syncSelectDisplay(form.currency);
}

function resolveAccountCurrency(accountId, currency) {
  const currencies = accountCurrencies(findAccount(accountId));
  return currencies.includes(currency) ? currency : currencies[0] || "CNY";
}

function syncSelectDisplay(select) {
  const text = select.selectedOptions?.[0]?.textContent?.trim() || "";
  select.title = text;
}

function fillTransactionCurrencySelect() {
  const form = el.transactionForm;
  const selected = form.currency.value;
  const account = findAccount(form.accountId.value || defaultAccountId());
  const currencies = accountCurrencies(account);
  form.currency.innerHTML = currencies
    .map((currency) => `<option value="${currency}">${currencyNames[currency] || currency} ${currency}</option>`)
    .join("");
  form.currency.value = currencies.includes(selected) ? selected : currencies[0] || "CNY";
  syncSelectDisplay(form.currency);
}

function fillStatsCurrencySelect() {
  const selected = el.statsCurrency.value;
  const currencies = [...new Set(state.accounts.flatMap((account) => accountCurrencies(account)))];
  el.statsCurrency.innerHTML = currencies
    .map((currency) => `<option value="${currency}">${currencyNames[currency] || currency} ${currency}</option>`)
    .join("");
  el.statsCurrency.value = currencies.includes(selected) ? selected : currencies.includes("CNY") ? "CNY" : currencies[0];
  syncSelectDisplay(el.statsCurrency);
}

function availableLedgerCurrencies() {
  const available = new Set([
    ...state.accounts.flatMap((account) => accountCurrencies(account)),
    ...state.transactions.map((item) => transactionCurrency(item)),
  ]);
  const currencies = supportedCurrencies.filter((currency) => available.has(currency));
  return currencies.length ? currencies : ["CNY"];
}

function fillSummaryCurrencySelects() {
  const currencies = availableLedgerCurrencies();
  if (!currencies.includes(summaryCurrency)) {
    summaryCurrency = currencies.includes("CNY") ? "CNY" : currencies[0];
  }
  const options = currencies
    .map((currency) => `<option value="${currency}">${currencyNames[currency] || currency} ${currency}</option>`)
    .join("");
  [el.dashboardSummaryCurrency, el.billSummaryCurrency].forEach((select) => {
    select.innerHTML = options;
    select.value = summaryCurrency;
    syncSelectDisplay(select);
  });
}

function fillAccountFilter() {
  const select = document.querySelector("#accountFilter");
  const selected = select.value;
  select.innerHTML = `<option value="all">全部账户</option>${state.accounts
    .map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`)
    .join("")}`;
  select.value = selected || "all";
  syncSelectDisplay(select);
}

function renderList(id, rows, renderer, emptyText) {
  const target = document.querySelector(`#${id}`);
  target.innerHTML = rows.length ? rows.map(renderer).join("") : `<div class="empty">${emptyText}</div>`;
}

function renderBillSummary(rows) {
  document.querySelector("#billSummary").innerHTML = [
    ["支出合计", formatSelectedCurrencyTotal(sumByCurrency(rows, "expense")), "expense"],
    ["收入合计", formatSelectedCurrencyTotal(sumByCurrency(rows, "income")), "income"],
    ["净额", formatSelectedCurrencyTotal(netByCurrency(rows)), "balance"],
  ]
    .map(([label, value, type]) => `<div class="bill-summary-item">
      <span>${label}</span>
      <strong class="summary-${type}">${value}</strong>
    </div>`)
    .join("");
}

function renderTagPills(tags, showEmpty = false) {
  const values = (Array.isArray(tags) ? tags : [])
    .map((tag) => String(tag || "").trim())
    .filter(Boolean);
  if (!values.length) return showEmpty ? `<span class="tag-empty">无标签</span>` : "";
  return `<div class="tag-pill-list">${values
    .map((tag) => `<span class="tag-pill" title="${escapeHtml(tag)}">${escapeHtml(tag)}</span>`)
    .join("")}</div>`;
}

function renderBillItem(item) {
  const category = findCategory(item.categoryId);
  return `<div class="bill-item">
    ${categoryBadge(category, item.type)}
    <div class="item-main">
      <strong>${escapeHtml(item.note || typeLabel(item.type))}</strong>
      <span>${formatTransactionDate(item)} · ${escapeHtml(accountName(item.accountId))}</span>
      ${renderTagPills(item.tags)}
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

function renderCreditBillItem(item, accountId) {
  const category = findCategory(item.categoryId);
  const installmentText = item.installmentGroupId ? ` · 分期 ${item.installmentIndex || "-"} / ${item.installmentCount || "-"}` : "";
  const impact = creditBillImpact(item, accountId);
  const amountType = impact < 0 ? "income" : "expense";
  const accountText = item.type === "transfer"
    ? `${accountName(item.accountId)} → ${accountName(item.targetAccountId)}`
    : accountName(item.accountId);
  const billAmount = `${impact < 0 ? "+" : "-"}${money(item.amount, transactionCurrency(item))}`;
  return `<div class="bill-item">
    ${categoryBadge(category, item.type)}
    <div class="item-main">
      <strong>${escapeHtml(item.note || typeLabel(item.type))}</strong>
      <span>${formatTransactionDate(item)} · ${escapeHtml(accountText)}${installmentText}</span>
      ${renderTagPills(item.tags)}
    </div>
    <div class="quick-bill-actions">
      <strong class="amount-${amountType}">${billAmount}</strong>
      <div class="row-actions">
        <button class="icon-button" type="button" onclick="editTransaction('${item.id}')" title="编辑账单" aria-label="编辑账单"><span class="action-icon pencil-icon" aria-hidden="true"></span></button>
        <button class="icon-button danger-button" type="button" onclick="deleteTransaction('${item.id}')" title="删除账单" aria-label="删除账单"><span class="action-icon trash-icon" aria-hidden="true"></span></button>
      </div>
    </div>
  </div>`;
}

function renderCreditAccountCard(account) {
  const balances = getAccountBalances(account.id);
  const primaryBalance = balances[0] || { currency: account.currency || "CNY", value: 0 };
  const outstanding = Math.max(0, -primaryBalance.value);
  const availableCredit = Math.max(0, Number(account.creditLimit || 0) - outstanding);
  const currentBills = transactionsForCreditBillPeriod(account, selectedCreditMonth).length;
  const planCount = groupInstallmentBills(
    state.transactions.filter((item) => item.installmentGroupId && item.accountId === account.id)
  ).length;
  return `<article class="credit-account-card">
    <div class="credit-account-head">
      ${accountLogoMarkup(account)}
      <div class="item-main">
        <strong>${escapeHtml(account.name)}</strong>
        <span>账单日 ${account.billingDay} 日 · 还款日 ${account.dueDay} 日</span>
      </div>
    </div>
    <div class="credit-account-balance">
      ${balances.map(({ currency, value }) => `<div><span>待还款 ${currency}</span><strong>${money(Math.max(0, -value), currency)}</strong></div>`).join("")}
    </div>
    <div class="credit-account-meta">
      <span>可用 ${money(availableCredit, primaryBalance.currency)}</span>
      <span>${planCount} 个分期</span>
      <span>该期 ${currentBills} 笔</span>
    </div>
    <button class="secondary-button" type="button" onclick="selectCreditAccount('${account.id}')">查看这张卡</button>
  </article>`;
}

function renderCreditDetailHeader(account) {
  const balances = getAccountBalances(account.id);
  const primaryBalance = balances[0] || { currency: account.currency || "CNY", value: 0 };
  const outstanding = Math.max(0, -primaryBalance.value);
  const availableCredit = Math.max(0, Number(account.creditLimit || 0) - outstanding);
  setText("creditDetailTitle", account.name);
  setText("creditDetailMeta", `账单日 ${account.billingDay} 日 · 还款日 ${account.dueDay} 日 · 可用 ${money(availableCredit, primaryBalance.currency)}`);
  document.querySelector("#creditDetailBalance").innerHTML = balances
    .map(({ currency, value }) => `<div><span>待还款 ${currency}</span><strong>${money(Math.max(0, -value), currency)}</strong></div>`)
    .join("");
}

function renderInstallmentPlan(plan) {
  const paidCount = plan.items.filter((item) => transactionLocalDateTime(item) <= today).length;
  const firstAmount = plan.items[0]?.amount || 0;
  return `<article class="installment-plan">
    <div class="installment-plan-head">
      <div>
        <strong>${escapeHtml(plan.title)}</strong>
        <span>${escapeHtml(accountName(plan.accountId))} · ${plan.items.length} 期 · 已到 ${paidCount} 期 · 每期约 ${money(firstAmount, plan.currency)}</span>
      </div>
      <strong>总计 ${money(plan.total, plan.currency)}</strong>
    </div>
    <div class="installment-period-list">
      ${plan.items.map((item) => renderInstallmentPeriod(item, plan.total)).join("")}
    </div>
  </article>`;
}

function renderInstallmentPeriod(item, planTotal = item.installmentTotal || 0) {
  const due = transactionLocalDateTime(item) <= today;
  return `<div class="installment-period">
    <div class="item-main">
      <strong>第 ${item.installmentIndex || "-"} 期</strong>
      <span>${formatTransactionDate(item)} · ${due ? "已到期" : "未到期"} · 总额 ${money(planTotal, transactionCurrency(item))}</span>
    </div>
    <strong class="amount-expense">-${money(item.amount, transactionCurrency(item))}</strong>
    <div class="row-actions">
      <button class="icon-button" type="button" onclick="editTransaction('${item.id}')" title="编辑这一期" aria-label="编辑这一期"><span class="action-icon pencil-icon" aria-hidden="true"></span></button>
      <button class="icon-button danger-button" type="button" onclick="deleteTransaction('${item.id}')" title="删除这一期" aria-label="删除这一期"><span class="action-icon trash-icon" aria-hidden="true"></span></button>
    </div>
  </div>`;
}

function renderTableRow(item) {
  const category = findCategory(item.categoryId);
  return `<div class="table-row">
    <label class="bill-check" title="选择账单">
      <input class="bill-select" type="checkbox" value="${item.id}" ${selectedBillIds.has(item.id) ? "checked" : ""} onchange="toggleBillSelection('${item.id}', this.checked)" />
    </label>
    <span class="item-meta">${formatTransactionDate(item)}</span>
    ${categoryBadge(category, item.type)}
    <div class="item-main">
      <strong>${escapeHtml(category?.name || typeLabel(item.type))} · ${escapeHtml(item.note || "无备注")}</strong>
      ${renderTagPills(item.tags, true)}
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

function renderAccountItem({ account, balances, index, total }) {
  const meta = getAccountVisual(account);
  const isCreditCard = account.type === "credit_card";
  const primaryBalance = balances[0] || { currency: account.currency || "CNY", value: 0 };
  const outstanding = isCreditCard ? Math.max(0, -primaryBalance.value) : 0;
  const availableCredit = isCreditCard ? Math.max(0, Number(account.creditLimit || 0) - outstanding) : 0;
  const logo = accountLogoMarkup(account);
  const detail = isCreditCard
    ? `${meta.label} · 主币种 ${primaryBalance.currency} · 账单日 ${account.billingDay} 日 · 还款日 ${account.dueDay} 日 · 可用 ${money(availableCredit, primaryBalance.currency)}`
    : `${meta.label} · 主币种 ${primaryBalance.currency} · ${account.includeInAssets ? "计入资产统计" : "未计入资产统计"}`;
  const displayBalance = ({ currency, value }) => isCreditCard
    ? money(Math.max(0, -value), currency)
    : money(value, currency);
  const balanceRows = balances.map(({ currency, value }) => `<div class="account-currency-row">
    <span><b>${currency}</b>${escapeHtml(currencyNames[currency] || currency)}</span>
    <strong class="${value < 0 ? "is-negative" : ""}">${displayBalance({ currency, value })}</strong>
  </div>`).join("");
  const balanceDetails = balances.length > 1
    ? `<details class="account-currency-details">
        <summary><span>共 ${balances.length} 种货币</span><span class="account-currency-chevron" aria-hidden="true"></span></summary>
        <div class="account-currency-breakdown" aria-label="${escapeHtml(account.name)}币种余额明细">${balanceRows}</div>
      </details>`
    : `<span class="account-single-currency">${escapeHtml(currencyNames[primaryBalance.currency] || primaryBalance.currency)}</span>`;
  const balanceMarkup = `<div class="account-balance-summary">
    <div class="account-primary-balance">
      <span>${isCreditCard ? "待还款" : primaryBalance.currency}</span>
      <strong class="account-balance ${primaryBalance.value < 0 ? "is-negative" : ""}">${displayBalance(primaryBalance)}</strong>
    </div>
    ${balanceDetails}
  </div>`;
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

function accountLogoMarkup(account) {
  const meta = getAccountVisual(account);
  const paymentClass = account.type === "wechat" || account.type === "alipay" ? "payment-logo" : "account-line-logo";
  if (meta.logo) {
    return `<span class="account-icon asset-account-logo has-logo ${paymentClass}" style="--account-color:${meta.color}"><img src="${meta.logo}" alt="" /></span>`;
  }
  return `<span class="account-icon asset-account-logo" style="--account-color:${meta.color}">${meta.icon}</span>`;
}

function shouldMigrateToCreditCard(account) {
  if (!account) return false;
  const normalizedType = accountTypeAliases[account.type] || account.type;
  return normalizedType === "credit_card" ||
    Number(account.creditLimit || 0) > 0 ||
    /信用卡|credit\s*card/i.test(account.name || "");
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
    const fallbackLabel = fallbackType === "transfer" ? "转账" : "其他";
    return `<span class="category-dot" style="background:#247c7a" title="${fallbackLabel}" aria-hidden="true"><span class="category-letter">${fallbackType === "transfer" ? "转" : "其"}</span></span>`;
  }
  const label = escapeHtml(category.name || "分类");
  return `<span class="category-dot" style="background:${category.color}" title="${label}" aria-hidden="true">${categoryIconMarkup(category)}</span>`;
}

function categoryIconKey(category) {
  if (!category) return "";
  if (categoryIconSvgs[category.icon]) return category.icon;
  const legacyIcon = defaultCategories.find((item) => item.id === category.id)?.icon;
  return !category.icon || category.icon === legacyIcon ? defaultCategoryIconKeys[category.id] || "" : "";
}

function categorySvg(key) {
  const paths = categoryIconSvgs[key];
  if (!paths) return "";
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

function categoryIconMarkup(category, fallback = "类") {
  const key = categoryIconKey(category);
  if (key) return categorySvg(key);
  const text = normalizeCategoryCustomIcon(category?.icon || fallback) || fallback;
  return `<span class="category-letter ${isCategoryEmoji(text) ? "category-emoji-letter" : ""}">${escapeHtml(text)}</span>`;
}

function exportCsv() {
  const rows = [
    ["日期", "类型", "分类", "账户", "转入账户", "信用卡账期", "币种", "金额", "备注", "标签"],
    ...state.transactions.map((item) => [
      formatTransactionDate(item),
      typeLabel(item.type),
      findCategory(item.categoryId)?.name || "",
      accountName(item.accountId),
      accountName(item.targetAccountId),
      item.creditBillMonth || "",
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
  return state.transactions.filter((item) => transactionDateKey(item).slice(0, 7) === month);
}

function isPostedTransaction(item) {
  return transactionLocalDateTime(item) <= new Date();
}

function isAccountBalanceRecognizedBefore(account, cutoff = new Date()) {
  const startedAt = new Date(account?.balanceStartedAt || account?.createdAt || 0);
  if (Number.isNaN(startedAt.getTime())) return true;
  return startedAt < cutoff;
}

function transactionBalanceRecognitionDate(item) {
  return item.installmentGroupId
    ? new Date(item.installmentPurchaseDate || item.createdAt || item.date)
    : transactionLocalDateTime(item);
}

function isBalanceRecognizedBefore(item, cutoff = new Date()) {
  const recognitionDate = transactionBalanceRecognitionDate(item);
  return !Number.isNaN(recognitionDate.getTime()) && recognitionDate < cutoff;
}

function ensureAccountBalanceStart(transaction) {
  const recognitionDate = transactionBalanceRecognitionDate(transaction);
  if (Number.isNaN(recognitionDate.getTime())) return;
  const accountIds = transaction.type === "transfer"
    ? [transaction.accountId, transaction.targetAccountId]
    : [transaction.accountId];
  accountIds.filter(Boolean).forEach((accountId) => {
    const account = findAccount(accountId);
    if (!account) return;
    const currentStart = new Date(account.balanceStartedAt || 0);
    if (!Number.isNaN(currentStart.getTime()) && currentStart.getTime() > 0) return;
    account.balanceStartedAt = recognitionDate.toISOString();
    account.updatedAt = new Date().toISOString();
  });
}

function transactionsForCreditBillPeriod(account, month) {
  const period = getCreditBillPeriod(account, month);
  return state.transactions
    .filter((item) => item.accountId === account.id || (item.type === "transfer" && item.targetAccountId === account.id))
    .filter((item) => {
      if (item.creditBillAccountId === account.id && /^\d{4}-\d{2}$/.test(item.creditBillMonth || "")) {
        return item.creditBillMonth === month;
      }
      const date = transactionLocalDateTime(item);
      return date >= period.start && date < period.endExclusive;
    });
}

function getCreditBillPeriod(account, month) {
  const [year, monthIndex] = (month || currentMonth).split("-").map(Number);
  const billingDay = Math.min(28, Math.max(1, Number(account.billingDay || 1)));
  const end = new Date(year, monthIndex - 1, billingDay, 23, 59, 59, 999);
  const start = new Date(year, monthIndex - 2, billingDay + 1, 0, 0, 0, 0);
  const endExclusive = new Date(end);
  endExclusive.setMilliseconds(endExclusive.getMilliseconds() + 1);
  return { start, end, endExclusive };
}

function getCategoryExpenseTotals(transactions, selectedCurrency = null) {
  return getCategoryTotalsByType(transactions, "expense", selectedCurrency);
}

function getCategoryIncomeTotals(transactions, selectedCurrency = null) {
  return getCategoryTotalsByType(transactions, "income", selectedCurrency);
}

function getCategoryTotalsByType(transactions, type, selectedCurrency = null) {
  const map = new Map();
  transactions
    .filter((item) => item.type === type)
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
  return state.categories.filter((item) => item.enabled && !item.archived && item.type === type).sort((a, b) => a.sortOrder - b.sortOrder);
}

function currentCategoryFallbackId(type, excludedId = "") {
  const categories = enabledCategories(type).filter((item) => item.id !== excludedId);
  const preferredId = type === "income" ? "other-income" : "other-expense";
  return categories.find((item) => item.id === preferredId)?.id || categories[0]?.id || "";
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

function groupInstallmentBills(items) {
  const groups = new Map();
  items.forEach((item) => {
    if (!groups.has(item.installmentGroupId)) groups.set(item.installmentGroupId, []);
    groups.get(item.installmentGroupId).push(item);
  });
  return [...groups.entries()]
    .map(([id, rows]) => {
      const sorted = rows.sort((a, b) => (a.installmentIndex || 0) - (b.installmentIndex || 0) || transactionLocalDateTime(a) - transactionLocalDateTime(b));
      const first = sorted[0];
      return {
        id,
        title: installmentBaseTitle(first),
        accountId: first.accountId,
        currency: transactionCurrency(first),
        total: sorted.reduce((sum, item) => sum + item.amount, 0),
        items: sorted,
      };
    })
    .sort((a, b) => transactionLocalDateTime(a.items[0]) - transactionLocalDateTime(b.items[0]));
}

function installmentBaseTitle(item) {
  const note = item.note || "信用卡分期";
  return note.replace(/\s+\d+\s*\/\s*\d+\s*$/, "");
}

function getAccountBalance(id) {
  const account = findAccount(id);
  if (!account) return 0;
  return getAccountBalanceByCurrency(id, currencyForAccount(id));
}

function getAccountBalanceByCurrency(id, currency) {
  const account = findAccount(id);
  if (!account) return 0;
  return getProjectedAccountBalance(account, currency);
}

function getProjectedAccountBalance(accountOrId, currency, transactions = state.transactions) {
  const account = typeof accountOrId === "string" ? findAccount(accountOrId) : accountOrId;
  if (!account) return 0;
  const balance = accountBalances(account).find((item) => item.currency === currency);
  return Number(balance?.initialBalance || 0) + getAccountTransactionImpactByCurrency(account.id, currency, transactions);
}

function getAccountTransactionImpactByCurrency(id, currency, transactions = state.transactions) {
  return transactions.reduce((balance, item) => {
    if (!isBalanceRecognizedBefore(item)) return balance;
    if (transactionCurrency(item) !== currency) return balance;
    if (item.type === "expense" && item.accountId === id) return balance - item.amount;
    if (item.type === "income" && item.accountId === id) return balance + item.amount;
    if (item.type === "transfer") {
      if (item.accountId === id) balance -= item.amount;
      if (item.targetAccountId === id) balance += item.amount;
    }
    return balance;
  }, 0);
}

function currentBalancesToInitialBalances(id, balances) {
  return balances.map((balance) => ({
    ...balance,
    initialBalance: Number(balance.initialBalance || 0) - getAccountTransactionImpactByCurrency(id, balance.currency),
  }));
}

function getAccountBalances(id) {
  return accountBalances(id).map((balance) => ({
    currency: balance.currency,
    value: getAccountBalanceByCurrency(id, balance.currency),
  }));
}

function getNetAssetsByCurrency() {
  return getAssetValuesByCurrency("net");
}

function getAssetValuesByCurrency(mode = "net") {
  return state.accounts
    .filter((account) => account.includeInAssets)
    .reduce((totals, account) => {
      getAccountBalances(account.id).forEach(({ currency, value }) => {
        const contribution = mode === "total" ? Math.max(value, 0) : value;
        totals.set(currency, (totals.get(currency) || 0) + contribution);
      });
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

function creditBillImpact(item, accountId) {
  if (item.type === "expense" && item.accountId === accountId) return 1;
  if (item.type === "income" && item.accountId === accountId) return -1;
  if (item.type === "transfer" && item.targetAccountId === accountId) return -1;
  if (item.type === "transfer" && item.accountId === accountId) return 1;
  return 0;
}

function creditBillTotalByCurrency(transactions, accountId) {
  return transactions.reduce((totals, item) => {
    const currency = transactionCurrency(item);
    const direction = creditBillImpact(item, accountId);
    totals.set(currency, (totals.get(currency) || 0) + item.amount * direction);
    return totals;
  }, new Map());
}

function formatCurrencyTotals(totals) {
  const entries = sortedCurrencyEntries(totals);
  return entries.length ? entries.map(([currency, value]) => money(value, currency)).join(" · ") : money(0, "CNY");
}

function formatSelectedCurrencyTotal(totals) {
  return money(totals.get(summaryCurrency) || 0, summaryCurrency);
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
  const [primaryCurrency, primaryValue] = rows[0];
  const secondaryRows = rows.slice(1);
  const secondaryMarkup = secondaryRows.length
    ? `<div class="asset-secondary-grid">
        ${secondaryRows.map(([currency, value]) => `<div class="asset-secondary-pill">
          <span>${currencyNames[currency] || currency}</span>
          <b>${currency}</b>
          <strong>${money(value, currency)}</strong>
        </div>`).join("")}
      </div>`
    : `<div class="asset-secondary-empty">暂无其他币种</div>`;
  document.querySelector("#totalAssets").innerHTML = `
    <div class="asset-total-primary">
      <span>${currencyNames[primaryCurrency] || primaryCurrency} <b>${primaryCurrency}</b></span>
      <strong>${money(primaryValue, primaryCurrency)}</strong>
    </div>
    <details class="asset-secondary-details" open>
      <summary>
        <span>其他币种</span>
        <b>${secondaryRows.length ? `${secondaryRows.length} 种` : "无"}</b>
      </summary>
      ${secondaryMarkup}
    </details>`;
}

function renderDashboardAssetTotals(totals) {
  const entries = sortedCurrencyEntries(totals);
  const rows = entries.length ? entries : [["CNY", 0]];
  const [primaryCurrency, primaryValue] = rows[0];
  const secondaryRows = rows.slice(1);
  const secondaryMarkup = secondaryRows.length
    ? `<div class="asset-secondary-grid">
        ${secondaryRows.map(([currency, value]) => `<div class="asset-secondary-pill">
          <span>${currencyNames[currency] || currency}</span>
          <b>${currency}</b>
          <strong>${money(value, currency)}</strong>
        </div>`).join("")}
      </div>`
    : `<div class="asset-secondary-empty">暂无其他币种</div>`;
  document.querySelector("#dashboardNetAssets").innerHTML = `
    <div class="asset-total-primary">
      <span>${currencyNames[primaryCurrency] || primaryCurrency} <b>${primaryCurrency}</b></span>
      <strong>${money(primaryValue, primaryCurrency)}</strong>
    </div>
    <details class="asset-secondary-details" open>
      <summary>
        <span>其他币种</span>
        <b>${secondaryRows.length ? `${secondaryRows.length} 种` : "无"}</b>
      </summary>
      ${secondaryMarkup}
    </details>`;
}

function currencyForAccount(id) {
  return accountCurrencies(findAccount(id))[0] || "CNY";
}

function accountCurrencies(account) {
  if (!account) return ["CNY"];
  return accountBalances(account.id || account).map((balance) => balance.currency);
}

function accountBalances(accountOrId) {
  const account = typeof accountOrId === "string" ? findAccount(accountOrId) : accountOrId;
  if (!account) return [{ currency: "CNY", initialBalance: 0 }];
  const rows = Array.isArray(account.balances) && account.balances.length
    ? account.balances
    : [{ currency: account.currency || "CNY", initialBalance: account.initialBalance || 0 }];
  const seen = new Set();
  return rows
    .map((balance) => ({
      currency: supportedCurrencies.includes(balance.currency) ? balance.currency : "CNY",
      initialBalance: Number(balance.initialBalance || 0),
    }))
    .filter((balance) => {
      if (seen.has(balance.currency)) return false;
      seen.add(balance.currency);
      return true;
    });
}

function transactionCurrency(item) {
  return supportedCurrencies.includes(item.currency) ? item.currency : currencyForAccount(item.accountId);
}

function loadState() {
  if (DEMO_MODE && window.JIZHANGBEN_DEMO_STATE) {
    return migrateState(cloneLedger(window.JIZHANGBEN_DEMO_STATE));
  }
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
  savedState.categories = savedState.categories.map((category, index) => ({
    ...category,
    icon: normalizeStoredCategoryIcon(category.icon),
    color: defaultColorById[category.id] || category.color,
    archived: category.archived === true,
    enabled: category.archived === true ? false : category.enabled !== false,
    sortOrder: Number.isFinite(Number(category.sortOrder)) ? Number(category.sortOrder) : index,
    createdAt: validIsoTimestamp(category.createdAt),
    updatedAt: validIsoTimestamp(category.updatedAt || category.archivedAt || category.createdAt),
  }));
  if (!Array.isArray(savedState.accounts) || !savedState.accounts.length) savedState.accounts = defaultAccounts;
  savedState.accounts = savedState.accounts.map((account, index) => {
    const normalizedType = accountTypeAliases[account.type] || account.type;
    const type = shouldMigrateToCreditCard(account) ? "credit_card" : accountTypes[normalizedType] ? normalizedType : "other";
    const legacyCurrency = supportedCurrencies.includes(account.currency) ? account.currency : "CNY";
    const rawBalances = Array.isArray(account.balances) && account.balances.length
      ? account.balances
      : [{ currency: legacyCurrency, initialBalance: account.initialBalance || 0 }];
    const seenCurrencies = new Set();
    const balances = rawBalances
      .map((balance) => {
        const currency = supportedCurrencies.includes(balance.currency) ? balance.currency : legacyCurrency;
        const numericInitial = Number(balance.initialBalance || 0);
        return {
          currency,
          initialBalance: type === "credit_card" && normalizedType !== "credit_card"
            ? -Math.abs(numericInitial)
            : numericInitial,
        };
      })
      .filter((balance) => {
        if (seenCurrencies.has(balance.currency)) return false;
        seenCurrencies.add(balance.currency);
        return true;
      });
    return {
      ...account,
      type,
      currency: balances[0]?.currency || legacyCurrency,
      initialBalance: balances[0]?.initialBalance || 0,
      balances: balances.length ? balances : [{ currency: legacyCurrency, initialBalance: 0 }],
      creditLimit: type === "credit_card" ? Math.max(0, Number(account.creditLimit || 0)) : 0,
      billingDay: type === "credit_card" ? Math.min(28, Math.max(1, Number(account.billingDay || 1))) : 1,
      dueDay: type === "credit_card" ? Math.min(28, Math.max(1, Number(account.dueDay || 20))) : 20,
      includeInAssets: account.includeInAssets !== false,
      sortOrder: Number.isFinite(Number(account.sortOrder)) ? Number(account.sortOrder) : index,
      createdAt: validIsoTimestamp(account.createdAt),
      updatedAt: validIsoTimestamp(account.updatedAt || account.createdAt),
    };
  });
  if (!Array.isArray(savedState.quickTemplates)) savedState.quickTemplates = defaultQuickTemplates;
  if (!Array.isArray(savedState.transactions)) savedState.transactions = [];
  savedState.transactions = savedState.transactions.map((transaction) => {
    const timestamp = new Date(transaction.date);
    const validTimestamp = !Number.isNaN(timestamp.getTime());
    const localDate = isValidLocalDateKey(transaction.localDate)
      ? transaction.localDate
      : validTimestamp
        ? toDateInput(timestamp)
        : toDateInput(new Date());
    const localTime = isValidLocalTimeKey(transaction.localTime)
      ? transaction.localTime
      : validTimestamp
        ? `${String(timestamp.getHours()).padStart(2, "0")}:${String(timestamp.getMinutes()).padStart(2, "0")}`
        : "00:00";
    return {
      ...transaction,
      localDate,
      localTime,
      currency: supportedCurrencies.includes(transaction.currency)
        ? transaction.currency
        : savedState.accounts.find((account) => account.id === transaction.accountId)?.currency || "CNY",
      createdAt: validIsoTimestamp(transaction.createdAt || transaction.date),
      updatedAt: validIsoTimestamp(transaction.updatedAt || transaction.createdAt || transaction.date),
    };
  });
  savedState.accounts = savedState.accounts.map((account) => {
    const explicitStart = new Date(account.balanceStartedAt || 0);
    if (!Number.isNaN(explicitStart.getTime()) && explicitStart.getTime() > 0) {
      return { ...account, balanceStartedAt: explicitStart.toISOString() };
    }
    const createdTime = new Date(account.createdAt || 0);
    if (!Number.isNaN(createdTime.getTime()) && createdTime.getTime() > 0) {
      return { ...account, balanceStartedAt: createdTime.toISOString() };
    }
    const relatedDates = savedState.transactions
      .filter((item) => item.accountId === account.id || item.targetAccountId === account.id)
      .map(transactionBalanceRecognitionDate)
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((a, b) => a - b);
    const updatedTime = new Date(account.updatedAt || 0);
    const inferredStart = relatedDates[0]
      || (!Number.isNaN(updatedTime.getTime()) && updatedTime.getTime() > 0 ? updatedTime : new Date(0));
    return { ...account, balanceStartedAt: inferredStart.toISOString() };
  });
  const fallbackAccountId = savedState.accounts.find((account) => account.id === "alipay")?.id || savedState.accounts[0].id;
  savedState.quickTemplates = savedState.quickTemplates.map((template, index) => {
    const accountId = savedState.accounts.some((account) => account.id === template.accountId)
      ? template.accountId
      : fallbackAccountId;
    const account = savedState.accounts.find((item) => item.id === accountId);
    const currencies = (account?.balances || [{ currency: account?.currency || "CNY" }])
      .map((balance) => balance.currency)
      .filter((currency) => supportedCurrencies.includes(currency));
    return {
      ...template,
      accountId,
      currency: currencies.includes(template.currency) ? template.currency : currencies[0] || "CNY",
      sortOrder: Number.isFinite(Number(template.sortOrder)) ? Number(template.sortOrder) : index,
      createdAt: validIsoTimestamp(template.createdAt),
      updatedAt: validIsoTimestamp(template.updatedAt || template.createdAt),
    };
  });
  const rawTombstones = savedState.syncTombstones && typeof savedState.syncTombstones === "object"
    ? savedState.syncTombstones
    : createEmptyTombstones();
  savedState.syncTombstones = createEmptyTombstones();
  Object.keys(savedState.syncTombstones).forEach((collection) => {
    const seenIds = new Set();
    savedState.syncTombstones[collection] = (Array.isArray(rawTombstones[collection]) ? rawTombstones[collection] : [])
      .filter((item) => {
        if (!item?.id || seenIds.has(item.id)) return false;
        seenIds.add(item.id);
        return true;
      })
      .map((item) => ({ id: item.id, deletedAt: validIsoTimestamp(item.deletedAt) }));
  });
  return savedState;
}

function saveState() {
  localChangeVersion += 1;
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

function compactMoney(value, currency = "CNY") {
  try {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value || 0);
  } catch {
    return money(value, currency);
  }
}

function signedCompactMoney(value, currency = "CNY") {
  if (!value) return compactMoney(0, currency);
  return `${value > 0 ? "+" : "-"}${compactMoney(Math.abs(value), currency)}`;
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

function isValidLocalDateKey(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const date = parseLocalDate(value);
  return Boolean(date) && toDateInput(date) === value;
}

function isValidLocalTimeKey(value) {
  if (!/^\d{2}:\d{2}$/.test(value || "")) return false;
  const [hours, minutes] = value.split(":").map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

function transactionDateKey(item) {
  if (isValidLocalDateKey(item?.localDate)) return item.localDate;
  const date = new Date(item?.date);
  return Number.isNaN(date.getTime()) ? toDateInput(new Date()) : toDateInput(date);
}

function transactionTimeKey(item) {
  if (isValidLocalTimeKey(item?.localTime)) return item.localTime;
  const date = new Date(item?.date);
  return Number.isNaN(date.getTime())
    ? "00:00"
    : `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function transactionLocalDateTime(item) {
  const value = new Date(`${transactionDateKey(item)}T${transactionTimeKey(item)}:00`);
  return Number.isNaN(value.getTime()) ? new Date(item?.date) : value;
}

function toTransactionDateTimeInput(item) {
  return `${transactionDateKey(item)}T${transactionTimeKey(item)}`;
}

function formatTransactionDate(item) {
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
    .format(transactionLocalDateTime(item));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function formatDateRange(start, end) {
  const formatter = new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit" });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function formatMonthLabel(month) {
  const [year, monthIndex] = (month || currentMonth).split("-");
  return `${year}年${monthIndex}月`;
}

function toMonth(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function toDateInput(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseLocalDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date) {
  const start = startOfDay(date);
  const mondayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - mondayOffset);
  return start;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function formatShortDate(date) {
  return new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric" }).format(date);
}

function toDateTimeInput(date) {
  return `${toDateInput(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function addMonths(month, offset) {
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(year, monthIndex - 1 + offset, 1);
  return toMonth(date);
}

function addMonthsToDate(date, offset) {
  const next = new Date(date);
  const day = next.getDate();
  next.setDate(1);
  next.setMonth(next.getMonth() + offset);
  next.setDate(Math.min(day, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
  return next;
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
