(() => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();
  const createdAt = new Date(currentYear - 2, 0, 1, 9).toISOString();
  const updatedAt = now.toISOString();

  const datePoint = (monthOffset, day = 1, hour = 9, minute = 0) => {
    const date = new Date(currentYear, currentMonthIndex + monthOffset, day, hour, minute);
    return {
      date: date.toISOString(),
      localDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
      localTime: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    };
  };
  const monthKey = (monthOffset = 0) => datePoint(monthOffset).localDate.slice(0, 7);
  const categories = [
    ["food", "餐饮", "expense", "utensils", "#b76e2b"],
    ["transport", "交通", "expense", "car", "#4d7585"],
    ["shopping", "购物", "expense", "shopping-bag", "#7766a8"],
    ["housing", "住房", "expense", "house", "#687064"],
    ["fun", "娱乐", "expense", "gamepad", "#9d5d67"],
    ["medical", "医疗", "expense", "heart-pulse", "#b24a3b"],
    ["education", "教育", "expense", "graduation-cap", "#5d668f"],
    ["daily", "日用品", "expense", "package", "#5b8379"],
    ["beverage", "饮料", "expense", "coffee", "#8b6f47"],
    ["travel", "旅行", "expense", "plane", "#477b89"],
    ["fitness", "运动", "expense", "dumbbell", "#39745d"],
    ["pet", "宠物", "expense", "🐾", "#8b6b93"],
    ["utilities", "水电通讯", "expense", "缴", "#587080"],
    ["other-expense", "其他", "expense", "ellipsis", "#6f746d"],
    ["salary", "工资", "income", "wallet", "#247a4d"],
    ["bonus", "奖金", "income", "gift", "#9c7a2b"],
    ["side", "副业", "income", "briefcase", "#3f806d"],
    ["investment", "投资收益", "income", "chart-line", "#4d7585"],
    ["refund", "退款", "income", "退", "#347969"],
    ["other-income", "其他", "income", "ellipsis", "#6f746d"],
  ].map(([id, name, type, icon, color], sortOrder) => ({
    id, name, type, icon, color, sortOrder, enabled: true, archived: false, createdAt, updatedAt,
  }));
  categories.push({
    id: "old-subscription", name: "旧订阅", type: "expense", icon: "订", color: "#777777",
    sortOrder: categories.length, enabled: false, archived: true,
    archivedAt: new Date(currentYear - 1, 5, 1).toISOString(), createdAt, updatedAt,
  });

  const accounts = [
    { id: "alipay", name: "支付宝", type: "alipay", balances: [{ currency: "CNY", initialBalance: 3200 }], includeInAssets: true },
    { id: "wechat", name: "微信", type: "wechat", balances: [{ currency: "CNY", initialBalance: 1800 }], includeInAssets: true },
    { id: "bank-main", name: "工资卡", type: "bank", balances: [{ currency: "CNY", initialBalance: 28000 }], includeInAssets: true },
    { id: "bank-multi", name: "多币种银行卡", type: "bank", balances: [
      { currency: "CNY", initialBalance: 12000 }, { currency: "USD", initialBalance: 2600 },
      { currency: "HKD", initialBalance: 8500 }, { currency: "JPY", initialBalance: 90000 },
      { currency: "GBP", initialBalance: 520 }, { currency: "TWD", initialBalance: 16000 },
      { currency: "KRW", initialBalance: 650000 }, { currency: "AUD", initialBalance: 700 },
      { currency: "CAD", initialBalance: 680 },
    ], includeInAssets: true },
    { id: "cash", name: "现金", type: "cash", balances: [{ currency: "CNY", initialBalance: 1200 }], includeInAssets: true },
    { id: "travel-wallet", name: "旅行钱包", type: "other", balances: [
      { currency: "EUR", initialBalance: 850 }, { currency: "SGD", initialBalance: 600 },
    ], includeInAssets: true },
    { id: "credit-cmb", name: "招商 Visa", type: "credit_card", balances: [
      { currency: "CNY", initialBalance: 0 }, { currency: "USD", initialBalance: 0 },
    ], creditLimit: 50000, billingDay: 15, dueDay: 5, includeInAssets: true },
    { id: "credit-travel", name: "旅行信用卡", type: "credit_card", balances: [
      { currency: "EUR", initialBalance: 0 },
    ], creditLimit: 12000, billingDay: 22, dueDay: 12, includeInAssets: true },
    { id: "gift-card", name: "商场储值卡", type: "other", balances: [{ currency: "CNY", initialBalance: 800 }], includeInAssets: false },
  ].map((account, sortOrder) => ({
    ...account,
    currency: account.balances[0].currency,
    initialBalance: account.balances[0].initialBalance,
    creditLimit: account.creditLimit || 0,
    billingDay: account.billingDay || 1,
    dueDay: account.dueDay || 20,
    sortOrder,
    createdAt,
    updatedAt,
  }));

  const transactions = [];
  let transactionIndex = 0;
  const addTransaction = ({ monthOffset = 0, day = 1, hour = 9, minute = 0, ...data }) => {
    transactionIndex += 1;
    const dateFields = datePoint(monthOffset, day, hour, minute);
    const timestamp = dateFields.date;
    transactions.push({
      id: `demo-transaction-${transactionIndex}`,
      type: "expense",
      amount: 0,
      currency: "CNY",
      categoryId: "other-expense",
      accountId: "alipay",
      targetAccountId: "",
      note: "",
      tags: [],
      ...dateFields,
      createdAt: timestamp,
      updatedAt: timestamp,
      ...data,
    });
  };

  for (let offset = -30; offset <= 0; offset += 1) {
    addTransaction({ monthOffset: offset, day: 5, type: "income", amount: 13800, categoryId: "salary", accountId: "bank-main", note: "月度工资", tags: ["固定收入"] });
    addTransaction({ monthOffset: offset, day: 6, amount: 3600, categoryId: "housing", accountId: "bank-main", note: "房租", tags: ["固定支出"] });
    addTransaction({ monthOffset: offset, day: 8, amount: 680 + (offset % 3) * 35, categoryId: "food", accountId: "alipay", note: "日常餐饮", tags: ["生活"] });
    addTransaction({ monthOffset: offset, day: 11, amount: 240, categoryId: "transport", accountId: "wechat", note: "公共交通与打车", tags: ["通勤"] });
    addTransaction({ monthOffset: offset, day: 16, amount: 310, categoryId: "utilities", accountId: "bank-main", note: "水电与手机费", tags: ["固定支出"] });
    addTransaction({ monthOffset: offset, day: 20, amount: 180, categoryId: "daily", accountId: "cash", note: "生活用品", tags: ["生活"] });
    if (offset % 3 === 0) addTransaction({ monthOffset: offset, day: 25, type: "income", amount: 420, categoryId: "investment", accountId: "bank-multi", note: "基金分红", tags: ["投资"] });
  }

  addTransaction({ monthOffset: -15, day: 9, amount: 68, categoryId: "old-subscription", accountId: "alipay", note: "已停用的视频会员", tags: ["历史分类"] });
  addTransaction({ monthOffset: -12, day: 18, type: "income", amount: 8000, categoryId: "bonus", accountId: "bank-main", note: "年度奖金", tags: ["奖金"] });
  addTransaction({ monthOffset: -10, day: 12, type: "income", amount: 960, currency: "USD", categoryId: "side", accountId: "bank-multi", note: "海外设计项目收入", tags: ["副业", "外币"] });
  addTransaction({ monthOffset: -9, day: 14, amount: 129, currency: "USD", categoryId: "education", accountId: "bank-multi", note: "线上课程", tags: ["学习", "外币"] });
  addTransaction({ monthOffset: -8, day: 22, amount: 1800, currency: "HKD", categoryId: "travel", accountId: "bank-multi", note: "香港周末旅行", tags: ["旅行", "外币"] });
  addTransaction({ monthOffset: -7, day: 10, amount: 12000, currency: "JPY", categoryId: "shopping", accountId: "bank-multi", note: "日本旅行购物", tags: ["旅行", "外币"] });
  addTransaction({ monthOffset: -7, day: 18, amount: 49, currency: "GBP", categoryId: "education", accountId: "bank-multi", note: "英国出版物订阅", tags: ["学习", "外币"] });
  addTransaction({ monthOffset: -6, day: 8, amount: 900, currency: "TWD", categoryId: "food", accountId: "bank-multi", note: "台湾餐饮", tags: ["旅行", "外币"] });
  addTransaction({ monthOffset: -6, day: 16, amount: 45000, currency: "KRW", categoryId: "shopping", accountId: "bank-multi", note: "韩国旅行购物", tags: ["旅行", "外币"] });
  addTransaction({ monthOffset: -6, day: 21, amount: 95, currency: "SGD", categoryId: "food", accountId: "travel-wallet", note: "新加坡餐饮", tags: ["旅行", "外币"] });
  addTransaction({ monthOffset: -5, day: 5, type: "income", amount: 320, currency: "AUD", categoryId: "side", accountId: "bank-multi", note: "澳洲客户项目收入", tags: ["副业", "外币"] });
  addTransaction({ monthOffset: -5, day: 9, amount: 110, currency: "CAD", categoryId: "travel", accountId: "bank-multi", note: "加拿大酒店订金", tags: ["旅行", "外币"] });
  addTransaction({ monthOffset: -5, day: 12, amount: 140, currency: "EUR", categoryId: "travel", accountId: "travel-wallet", note: "欧洲火车票", tags: ["旅行", "外币"] });
  addTransaction({ monthOffset: -4, day: 19, amount: 720, categoryId: "medical", accountId: "wechat", note: "体检", tags: ["健康"] });
  addTransaction({ monthOffset: -3, day: 10, amount: 399, categoryId: "fitness", accountId: "alipay", note: "季度健身会员", tags: ["健康"] });
  addTransaction({ monthOffset: -2, day: 17, amount: 260, categoryId: "pet", accountId: "wechat", note: "宠物体检与用品", tags: ["宠物"] });
  addTransaction({ monthOffset: -1, day: 7, type: "income", amount: 1800, categoryId: "side", accountId: "alipay", note: "自由职业项目", tags: ["副业"] });
  addTransaction({ monthOffset: -1, day: 9, amount: 1280, categoryId: "shopping", accountId: "gift-card", note: "家居用品", tags: ["购物", "不计入资产"] });

  addTransaction({ monthOffset: 0, day: 2, type: "transfer", amount: 2500, categoryId: "transfer", accountId: "bank-main", targetAccountId: "alipay", note: "转入日常消费", tags: ["资金调拨"] });
  addTransaction({ monthOffset: 0, day: 3, amount: 42, categoryId: "beverage", accountId: "wechat", note: "咖啡与饮料", tags: ["饮料"] });
  addTransaction({ monthOffset: 0, day: 4, amount: 236, categoryId: "food", accountId: "credit-cmb", note: "周末聚餐", tags: ["信用卡"] });
  addTransaction({ monthOffset: 0, day: 7, amount: 899, categoryId: "shopping", accountId: "credit-cmb", note: "降噪耳机", tags: ["数码", "信用卡"] });
  addTransaction({ monthOffset: 0, day: 9, amount: 35, currency: "USD", categoryId: "education", accountId: "credit-cmb", note: "英文电子书", tags: ["学习", "外币信用卡"] });
  addTransaction({ monthOffset: 0, day: 12, amount: 165, categoryId: "fun", accountId: "alipay", note: "电影与展览", tags: ["娱乐"] });
  addTransaction({ monthOffset: 0, day: 14, type: "income", amount: 88, categoryId: "refund", accountId: "credit-cmb", note: "信用卡购物退款", tags: ["退款"], creditBillAccountId: "credit-cmb", creditBillMonth: monthKey(0) });
  addTransaction({ monthOffset: 0, day: 16, type: "transfer", amount: 1600, categoryId: "transfer", accountId: "bank-main", targetAccountId: "credit-cmb", note: "偿还信用卡", tags: ["信用卡还款"], creditBillAccountId: "credit-cmb", creditBillMonth: monthKey(0) });
  addTransaction({ monthOffset: 0, day: 18, amount: 128, categoryId: "daily", accountId: "cash", note: "超市采购", tags: ["现金"] });
  addTransaction({ monthOffset: 0, day: 19, type: "income", amount: 600, categoryId: "other-income", accountId: "wechat", note: "朋友归还垫付款", tags: ["往来"] });
  addTransaction({ monthOffset: 0, day: 20, amount: 120, currency: "EUR", categoryId: "travel", accountId: "credit-travel", note: "酒店预订", tags: ["旅行", "信用卡"] });

  addTransaction({ monthOffset: 0, day: 4, type: "income", amount: 2600, categoryId: "side", accountId: "bank-main", note: "设计项目尾款", tags: ["副业", "项目"] });
  addTransaction({ monthOffset: 0, day: 6, type: "income", amount: 320, categoryId: "investment", accountId: "bank-multi", note: "指数基金分红", tags: ["投资", "分红"] });
  addTransaction({ monthOffset: 0, day: 7, amount: 76, categoryId: "transport", accountId: "wechat", note: "地铁与打车", tags: ["通勤"] });
  addTransaction({ monthOffset: 0, day: 8, amount: 268, categoryId: "shopping", accountId: "alipay", note: "家居收纳用品", tags: ["生活", "家居"] });
  addTransaction({ monthOffset: 0, day: 10, amount: 188, categoryId: "medical", accountId: "wechat", note: "药品与护理用品", tags: ["健康"] });
  addTransaction({ monthOffset: 0, day: 11, amount: 299, categoryId: "education", accountId: "credit-cmb", note: "专业课程订阅", tags: ["学习", "订阅", "信用卡"] });
  addTransaction({ monthOffset: 0, day: 13, amount: 58, categoryId: "fitness", accountId: "alipay", note: "游泳馆次卡", tags: ["健康", "运动"] });
  addTransaction({ monthOffset: 0, day: 15, amount: 146, categoryId: "pet", accountId: "wechat", note: "宠物粮食", tags: ["宠物"] });
  addTransaction({ monthOffset: 0, day: 17, amount: 520, currency: "EUR", categoryId: "shopping", accountId: "credit-travel", note: "旅行装备", tags: ["旅行", "装备", "信用卡"] });
  addTransaction({ monthOffset: 0, day: 18, type: "transfer", amount: 900, currency: "CNY", categoryId: "transfer", accountId: "bank-main", targetAccountId: "credit-cmb", note: "提前偿还部分信用卡", tags: ["信用卡还款"] , creditBillAccountId: "credit-cmb", creditBillMonth: monthKey(0) });

  addTransaction({ monthOffset: -1, day: 13, amount: 680, categoryId: "other-expense", accountId: "credit-cmb", note: "初始信用卡欠款", tags: ["初始欠款"], openingCreditDebt: true });

  const installmentGroupId = "demo-installment-laptop";
  const installmentPurchase = datePoint(-1, 6, 14).date;
  for (let index = 0; index < 6; index += 1) {
    addTransaction({
      monthOffset: index - 1,
      day: 10,
      amount: index === 5 ? 399.85 : 399.83,
      categoryId: "shopping",
      accountId: "credit-cmb",
      note: `笔记本电脑 ${index + 1}/6`,
      tags: ["数码", "分期"],
      installmentGroupId,
      installmentIndex: index + 1,
      installmentCount: 6,
      installmentTotal: 2399,
      installmentPurchaseDate: installmentPurchase,
    });
  }

  const travelInstallmentGroupId = "demo-installment-camera";
  const travelInstallmentPurchase = datePoint(-2, 21, 16).date;
  for (let index = 0; index < 3; index += 1) {
    addTransaction({
      monthOffset: index - 2,
      day: 22,
      amount: 220,
      currency: "EUR",
      categoryId: "travel",
      accountId: "credit-travel",
      note: `旅行相机 ${index + 1}/3`,
      tags: ["旅行", "分期", "外币信用卡"],
      installmentGroupId: travelInstallmentGroupId,
      installmentIndex: index + 1,
      installmentCount: 3,
      installmentTotal: 660,
      installmentPurchaseDate: travelInstallmentPurchase,
    });
  }

  const quickTemplates = [
    ["早餐", 18, "food", "alipay", "CNY"],
    ["通勤", 12, "transport", "wechat", "CNY"],
    ["咖啡", 25, "beverage", "wechat", "CNY"],
    ["健身", 60, "fitness", "alipay", "CNY"],
    ["午餐", 32, "food", "cash", "CNY"],
  ].map(([note, amount, categoryId, accountId, currency], sortOrder) => ({
    id: `demo-template-${sortOrder + 1}`, note, amount, categoryId, accountId, currency,
    sortOrder, createdAt, updatedAt,
  }));

  window.JIZHANGBEN_DEMO_STATE = {
    selectedMonth: monthKey(0),
    categories,
    accounts,
    transactions,
    quickTemplates,
    syncTombstones: { transactions: [], accounts: [], categories: [], quickTemplates: [] },
  };
})();
