export type Language = 'uz_cyrillic' | 'uz_latin' | 'ru';

export interface T {
  langName: string;
  langShort: string;

  // Nav
  navDashboard: string;
  navRawMaterial: string;
  navSemiProduction: string;
  navFinalProduction: string;
  navWarehouse: string;
  navSales: string;
  navExpenses: string;
  navReports: string;
  navShifts: string;
  navSystemUsers: string;

  // Auth (login)
  authTitle: string;
  authSubtitle: string;
  authIdentifier: string;
  authPassword: string;
  authSubmit: string;
  authLoading: string;
  authMachines: string;
  authMachinesDisabledHint: string;

  // System users (RBAC)
  suTitle: string;
  suSubtitle: string;
  suAddTitle: string;
  suFullName: string;
  suLoginOrPhone: string;
  suPassword: string;
  suRole: string;
  suRoleAdmin: string;
  suRoleDirector: string;
  suRoleAccountant: string;
  suRoleOperator: string;
  suRoleCustom: string;
  suCustomLabel: string;
  suSavedPositionsTitle: string;
  suSavedPositionsHint: string;
  suAddPositionPlaceholder: string;
  suRoleDeleteExplain: string;
  suPermissionsHint: string;
  suCreateBtn: string;
  suListTitle: string;
  suColName: string;
  suColLogin: string;
  suColRole: string;
  suColPerms: string;
  suSuccess: string;
  suDelete: string;
  suEdit: string;
  suUpdateUserTitle: string;
  suPasswordOptionalHint: string;
  suPasswordMinLength: string;
  suCancelEdit: string;
  suPermViewDashboard: string;
  suPermViewShift: string;
  suPermManageShiftWorkers: string;
  suPermViewRawMaterial: string;
  suPermViewWarehouse: string;
  suPermViewSales: string;
  suPermViewExpenses: string;
  suPermViewPayroll: string;
  suPermViewVedomost: string;
  suPermCreateVedomost: string;
  suPermViewReports: string;
  suPermManageSettings: string;
  suPermManageUsers: string;

  layoutLogout: string;

  // Date filter
  dfTitle: string;
  dfToday: string;
  dfWeek: string;
  dfMonth: string;
  dfAll: string;
  dfFrom: string;
  dfTo: string;
  dfApply: string;
  dfShowing: string;
  dfAllTime: string;

  // Common
  btnAdd: string;
  btnSave: string;
  btnCancel: string;
  btnConfirm: string;
  btnProduce: string;
  btnSell: string;
  btnAddExpense: string;
  labelDate: string;
  labelAmount: string;
  labelPrice: string;
  labelTotal: string;
  labelPaid: string;
  labelDebt: string;
  labelDesc: string;
  labelType: string;
  labelName: string;
  labelPhone: string;
  labelMachine: string;
  labelHours: string;
  labelPower: string;
  labelBankAccount: string;
  labelBankName: string;
  unitKg: string;
  unitTon: string;
  unitPiece: string;
  unitSum: string;
  statusLow: string;
  statusCritical: string;
  statusOk: string;
  statusActive: string;
  successAdded: string;
  colDate: string;
  colType: string;
  colAmount: string;
  colNote: string;
  colQty: string;
  colMachine: string;
  colTotal: string;
  colPaid: string;
  colDebt: string;
  colClient: string;
  colProduct: string;
  colPrice: string;
  totalRecords: string;
  noData: string;

  // Dashboard
  dashTitle: string;
  dashSubtitle: string;
  dashSystemActive: string;
  dashLowAlert: string;
  dashLowDesc: string;
  dashKpiMaterial: string;
  dashKpiSemi: string;
  dashKpiFinal: string;
  dashKpiTodayProd: string;
  dashKpiTodaySales: string;
  dashChartProd: string;
  dashChartLast7: string;
  dashChartMaterial: string;
  dashChartKg: string;
  dashStockTitle: string;
  dashActivityTitle: string;
  dashOrderMaterial: string;
  dashTodayDate: string;
  dashMaterialInWarehouse: string;
  dashCbuTitle: string;
  dashCbuSource: string;
  dashCbuFetchError: string;
  dashCbuRetry: string;
  dashCbuRefresh: string;
  dashCbuChangeToday: string;

  // Raw Material
  rmTitle: string;
  rmTotalIn: string;
  rmTotalOut: string;
  rmRemaining: string;
  rmStockLevel: string;
  rmNewEntry: string;
  rmAddBtn: string;
  rmHistory: string;
  rmIncoming: string;
  rmOutgoing: string;
  rmBalance: string;
  rmPlaceholderDesc: string;
  rmPreviewAdd: string;
  rmPreviewBalance: string;
  rmCapacity: string;
  rmCritical: string;
  rmWarning: string;
  rmActiveBagTitle: string;
  rmActiveBagSubtitle: string;
  rmNoActiveBag: string;
  rmCreateBagTitle: string;
  rmCreateBagButton: string;
  rmBagCreateError: string;
  rmBagCreatedSuccess: string;
  rmBagConnectTitle: string;
  rmBagConnectButton: string;
  rmBagConnectError: string;
  rmBagConnectedSuccess: string;
  rmBagSwitchTitle: string;
  rmBagSwitchButton: string;
  rmBagSwitchError: string;
  rmBagSwitchedSuccess: string;
  rmBagSwitchReturn: string;
  rmBagSwitchWriteoff: string;
  rmBagWriteoffTitle: string;
  rmBagWriteoffButton: string;
  rmBagWriteoffError: string;
  rmBagWrittenOffSuccess: string;
  rmBagsTitle: string;
  rmBagLogsTitle: string;
  rmBagInitial: string;
  rmBagRemaining: string;
  rmBagConnectedAt: string;
  rmBagProgress: string;
  rmBagRawMaterial: string;
  rmBagSelectRawMaterial: string;
  rmBagSelect: string;
  rmBagSelectReplacement: string;
  rmBagName: string;
  rmBagNamePlaceholder: string;
  rmBagReasonPlaceholder: string;
  rmBagStatusStorage: string;
  rmBagStatusConnected: string;
  rmBagStatusDepleted: string;
  rmBagStatusWrittenOff: string;
  rmQuickConsumeTitle: string;
  rmQuickConsumePieces: string;
  rmQuickConsumeGram: string;
  rmQuickConsumeDirectKg: string;
  rmQuickConsumeNote: string;
  rmQuickConsumeResult: string;
  rmQuickConsumeButton: string;
  rmQuickConsumeError: string;
  rmQuickConsumeSuccess: string;
  rmLogCreated: string;
  rmLogConnected: string;
  rmLogDisconnected: string;
  rmLogReturned: string;
  rmLogConsumed: string;
  rmLogDepleted: string;
  rmLogWrittenOff: string;
  rmNoLogNote: string;
  rmCreateTypeTitle: string;
  rmCreateTypeButton: string;
  rmCreateTypePlaceholder: string;
  rmCreateTypeDescPlaceholder: string;
  rmCreateNameRequired: string;
  rmCreateError: string;
  rmCreatedSuccess: string;
  rmSelectRawMaterialRequired: string;
  rmDefaultIncomingNote: string;
  rmIncomingHint: string;

  // Semi Production
  spTitle: string;
  sp18gStock: string;
  sp20gStock: string;
  spRawRemaining: string;
  spFormTitle: string;
  spTypeLabel: string;
  spMachineLabel: string;
  spQtyLabel: string;
  spCalcTitle: string;
  spCalcPer: string;
  spCalcNeeded: string;
  spCalcAfter: string;
  spCalcRemains: string;
  spNoRaw: string;
  spHistory: string;
  spTotal18: string;
  spTotal20: string;
  spColRaw: string;

  // Final Production
  fpTitle: string;
  fpFlowTitle: string;
  fpFormTitle: string;
  fpTypeLabel: string;
  fpSemiLabel: string;
  fpQtyLabel: string;
  fpCalcTitle: string;
  fpCalcNeeded: string;
  fpCalcAvailable: string;
  fpCalcAfter: string;
  fpCalcRemains: string;
  fpNoSemi: string;
  fpHistory: string;
  fpBatches: string;
  fpColUsed: string;

  // Warehouse
  whTitle: string;
  whMaterial: string;
  whSemi: string;
  whFinal: string;
  whTotalProd: string;
  whInWarehouse: string;
  whDetailed: string;
  /** Katalogda slot yo‘q — batafsil qoldiq kartalari bo‘sh */
  whStockBreakdownEmpty: string;
  whSemiStats: string;
  whFinalStats: string;
  whProduced: string;
  whUsedInFinal: string;
  whSold: string;
  whRemaining: string;
  whByType: string;
  whUnit: string;
  whWeightGram: string;
  whVolumeLiter: string;
  whProductsList: string;
  whCreatedAt: string;
  whCreatedBy: string;
  whUpdatedBy: string;
  whEdit: string;
  whNoProducts: string;
  whAddProduct: string;
  whManageReadOnly: string;
  whDeleteTitle: string;
  whDeleteConfirm: string;
  whDeleteAction: string;
  whProductAdded: string;
  whProductUpdated: string;
  whProductDeleted: string;
  whProductType: string;
  whNameRequired: string;
  whMetricRequired: string;
  whRequestError: string;
  /** Omborda qoldiq bor — o‘chirish mumkin emas */
  whErrDeleteStockRemains: string;
  /** Xomashyoga bog‘langan qoplar bor */
  whErrDeleteRawBags: string;
  whSemi18Label: string;
  whSemi20Label: string;
  whFinal05Label: string;
  whFinal1Label: string;
  whFinal5Label: string;
  whMaxLabel: string;
  whDrawerCreateTitle: string;
  whDrawerCreateDescription: string;
  whDrawerEditTitle: string;
  whDrawerEditDescription: string;
  whIngredientsTitle: string;
  whIngredientsSubtitle: string;
  whIngredientsShort: string;
  whSemiShort: string;
  whMachinesShort: string;
  whAddIngredient: string;
  whRemoveIngredient: string;
  whSelectRawMaterial: string;
  whAmountGram: string;
  whAmountGramRequired: string;
  whRawMaterialRequired: string;
  whNoRawMaterials: string;
  whSemiSelectionTitle: string;
  whSemiProductRequired: string;
  whNoSemiProducts: string;
  whMachineSelectionTitle: string;
  whMachineRequired: string;
  whNoMachines: string;
  whRawMaterialListTitle: string;
  whIncludedInWarehouse: string;

  // Sales
  slTitle: string;
  slTotalRevenue: string;
  slTotalPaid: string;
  slTotalDebt: string;
  slOperations: string;
  slPaidPercent: string;
  slHasDebt: string;
  slTabNew: string;
  slTabClients: string;
  slTabHistory: string;
  slFormTitle: string;
  slCategory: string;
  slSemiCat: string;
  slFinalCat: string;
  slProductType: string;
  /** Sotuv: katalogda sotiladigan mahsulot yo‘q */
  slNoCatalogProducts: string;
  slAvailableStock: string;
  slAvailableProducts: string;
  slNewClient: string;
  slClientList: string;
  slDebtPaid: string;
  slBtn: string;
  slAddToCart: string;
  slCart: string;
  slCartEmpty: string;
  slAddItem: string;
  slOrderItems: string;
  slMixedProducts: string;
  slRemoveItem: string;

  // Expenses
  exTitle: string;
  exElectricity: string;
  exCaps: string;
  exPackaging: string;
  exOther: string;
  exTotalLabel: string;
  exFormTitle: string;
  exCalcTitle: string;
  exKwh: string;
  exPricePerKwh: string;
  exBtn: string;
  exHistory: string;
  exColAmount: string;

  // Reports
  repTitle: string;
  repRevenue: string;
  repExpenses: string;
  repProfit: string;
  repRawEff: string;
  repTabProduction: string;
  repTabEfficiency: string;
  repTabSales: string;
  repTabMaterial: string;
  repProdTitle: string;
  repEffTitle: string;
  repEffFormula: string;
  repEffActual: string;
  repEffMax: string;
  repRawTitle: string;
  repRawIn: string;
  repRawOut: string;
  repRawEffLabel: string;
  repSalesTitle: string;
  repClientsTitle: string;
  repMatTitle: string;
  repMatTable: string;
  repSemiDist: string;
  repFinalDist: string;

  // Layout
  layoutSystem: string;
  layoutMaterialLow: string;
  layoutAdmin: string;
  layoutSiroRemaining: string;

  // Client Detail
  cdBack: string;
  cdInfo: string;
  cdSales: string;
  cdPayments: string;
  cdAkt: string;
  cdTotalPurchases: string;
  cdCreatedAt: string;
  cdDebt: string;
  cdNoSales: string;
  cdBankInfo: string;
  cdContactInfo: string;

  // AKT Sverka
  aktTitle: string;
  aktGenerate: string;
  aktDownloadPdf: string;
  aktOpeningBalance: string;
  aktTotalSales: string;
  aktTotalPayments: string;
  aktClosingBalance: string;
  aktDate: string;
  aktDocType: string;
  aktDocNum: string;
  aktDebit: string;
  aktCredit: string;
  aktBalance: string;
  aktSaleType: string;
  aktPaymentType: string;
  aktEmpty: string;
  aktPeriod: string;
  aktGenerating: string;
  aktCompany: string;
  aktSignature: string;
  aktDirectorSig: string;
  aktClientSig: string;
  aktAccountant: string;
  aktFilter: string;
  aktFilterAll: string;
  aktFilterToday: string;
  aktFilterWeek: string;
  aktFilterMonth: string;
  aktRowOpening: string;
  aktRowClosing: string;
  aktTotal: string;

  // Payments tab
  pmAddPayment: string;
  pmAmount: string;
  pmDesc: string;
  pmHistory: string;
  pmNoPayments: string;
  pmDate: string;
  pmAddSuccess: string;
  pmDeleteConfirm: string;

  // Payroll
  navPayroll: string;
  prTitle: string;
  prTabVedomost: string;
  prTabBank: string;
  prTabEmployees: string;
  prTabProduction: string;
  prTabSettings: string;
  prGenerate: string;
  prMonth: string;
  prFullName: string;
  prPosition: string;
  prCardNumber: string;
  prStir: string;
  prSalaryType: string;
  prFixed: string;
  prPerPiece: string;
  prHybrid: string;
  prAklad: string;
  prSalaryAmount: string;
  prProducedQty: string;
  prProductionAmt: string;
  prBonus: string;
  prBrutto: string;
  prIncomeTax: string;
  prNps: string;
  prSocialTax: string;
  prNet: string;
  prStatusLabel: string;
  prPaid: string;
  prUnpaid: string;
  prMarkPaid: string;
  prMarkUnpaid: string;
  prExportCsv: string;
  prPrint: string;
  prIncomeTaxPct: string;
  prSocialTaxPct: string;
  prNpsPct: string;
  prAddEmployee: string;
  prEditEmployee: string;
  prEmployeeRates: string;
  prRateType: string;
  prRateFixed: string;
  prRatePercent: string;
  prRateValue: string;
  prRateBaseAmount: string;
  prNoEmployeeRates: string;
  prRateConfiguredHint: string;
  prDeleteEmployeeTitle: string;
  prDeleteEmployeeConfirm: string;
  prDeleteEmployeeAction: string;
  prWorkedDays: string;
  prPricePerUnit: string;
  prProductType: string;
  prAddProduction: string;
  prEmployee: string;
  prNoEmployees: string;
  prNoVedomost: string;
  prTotalBrutto: string;
  prTotalNet: string;
  prTotalTax: string;
  prSaveSettings: string;
  prSettingsTitle: string;

  // Payroll – new keys (NET formula, file upload)
  prTaxNotDeducted: string;
  prNetFormula: string;
  prUploadFile: string;
  prFileUploaded: string;
  prBulkGiven: string;
  prIncomeTaxOnly: string;
  prNpsNote: string;
  prSocialNote: string;
  prBankUploadTitle: string;
  prBankUploadHint: string;
  prBankUploadAction: string;
  prBankUploadSuccess: string;
  prBankUploadDate: string;
  prBankUploadedBy: string;
  prBankStatusDraft: string;
  prBankStatusParsed: string;
  prBankStatusConfirmed: string;
  prBankStatusRejected: string;
  prBankVedomostList: string;
  prBankNoVedomost: string;
  prBankTransactions: string;
  prBankNoTransactions: string;
  prBankNoSelection: string;
  prBankIncome: string;
  prBankExpense: string;
  prBankDocNumber: string;
  prBankReceiver: string;
  prBankPurpose: string;
  prBankMatched: string;
  prBankUnmatched: string;
  prBankSalarySummary: string;
  prBankSalarySummaryHint: string;
  prBankRequired: string;
  prBankPaid: string;
  prBankRemaining: string;
  prBankTotalVedomost: string;
  prBankSalaryMatched: string;
  prBankSelected: string;
  prBankWarningTitle: string;
  prBankWarningDesc: string;
  prBankUnknownClients: string;
  prBankUnknownEmployees: string;
  prBankUnknownClientsDesc: string;
  prBankUnknownEmployeesDesc: string;
  prBankAddClient: string;
  prBankAddEmployee: string;
  prBankCreateClientTitle: string;
  prBankCreateClientDesc: string;
  prBankCreateEmployeeTitle: string;
  prBankCreateEmployeeDesc: string;
  prBankCreateWarning: string;
  prBankRejectedTitle: string;
  prBankRejectedExplain: string;
  prBankRejectedEmptyTx: string;
  prBankTechnicalDetails: string;
}

// ======================== UZBEK CYRILLIC ========================
const uz_cyrillic: T = {
  langName: 'Ўзбек (Кирил)',
  langShort: 'КИ',

  navDashboard: 'Бошқарув панели',
  navRawMaterial: 'Хомашё (Сиро)',
  navSemiProduction: 'Қолип ишлаб чиқариш',
  navFinalProduction: 'Бакалашка ишлаб чиқариш',
  navWarehouse: 'Омбор',
  navSales: 'Сотув',
  navExpenses: 'Харажатлар',
  navReports: 'Ҳисоботлар',
  navShifts: 'Смена',
  navSystemUsers: 'Тизим фойдаланувчилари',

  authTitle: 'LiderPlast ERP',
  authSubtitle: 'Тизимга кириш',
  authIdentifier: 'Телефон ёки логин',
  authPassword: 'Парол',
  authSubmit: 'Кириш',
  authLoading: 'Юкланмоқда…',
  authMachines: 'Машиналар',
  authMachinesDisabledHint: 'CRM манзили ҳозирча ўрнатилмаган (VITE_MACHINES_CRM_URL)',
  suTitle: 'Тизим фойдаланувчилари',
  suSubtitle: 'Логин қиладиган ходимлар ва уларнинг ҳуқуқлари',
  suAddTitle: 'Янги фойдаланувчи',
  suFullName: 'Ф.И.Ш.',
  suLoginOrPhone: 'Логин ёки телефон',
  suPassword: 'Парол',
  suRole: 'Лавозим',
  suRoleAdmin: 'Админ',
  suRoleDirector: 'Директор',
  suRoleAccountant: 'Бухгалтер',
  suRoleOperator: 'Оператор',
  suRoleCustom: 'Бошқа',
  suCustomLabel: 'Лавозим номи',
  suSavedPositionsTitle: 'Қўшимча лавозимлар',
  suSavedPositionsHint: 'Рўйхатга қўшинг — улар лавозим танловида пайдо бўлади; кейинчалик ўчириш мумкин.',
  suAddPositionPlaceholder: 'Янги лавозим номи',
  suRoleDeleteExplain:
    'Админ, директор, бухгалтер, оператор ва «Бошқа» — тизим лавозимлари; уларни рўйхатдан ўчириб бўлмайди. Ўчириш мумкин бўлганлар — фақат пастда ўзингиз қўшган қўшимча лавозимлар.',
  suPermissionsHint: 'Саҳифа ва функцияларга рухсат',
  suCreateBtn: 'Қўшиш',
  suListTitle: 'Фойдаланувчилар',
  suColName: 'Исм',
  suColLogin: 'Кириш',
  suColRole: 'Рол',
  suColPerms: 'Рухсатлар',
  suSuccess: 'Сақланди',
  suDelete: 'Ўчириш',
  suEdit: 'Таҳрирлаш',
  suUpdateUserTitle: 'Фойдаланувчини янгилаш',
  suPasswordOptionalHint: 'Паролни ўзгартирмасангиз, бўш қолдиринг.',
  suPasswordMinLength: 'Парол камида 6 та белги бўлиши керак.',
  suCancelEdit: 'Бекор қилиш',
  suPermViewDashboard: 'Бошқарув панели',
  suPermViewShift: 'Смена (кўриш)',
  suPermManageShiftWorkers: 'Сменада ишчилар',
  suPermViewRawMaterial: 'Хомашё',
  suPermViewWarehouse: 'Омбор',
  suPermViewSales: 'Сотув',
  suPermViewExpenses: 'Харажатлар',
  suPermViewPayroll: 'Иш ҳақи / ходимлар',
  suPermViewVedomost: 'Ведомост (кўриш)',
  suPermCreateVedomost: 'Ведомост яратиш',
  suPermViewReports: 'Ҳисоботлар',
  suPermManageSettings: 'Созламалар',
  suPermManageUsers: 'Фойдаланувчиларни бошқариш',
  layoutLogout: 'Чиқиш',

  dfTitle: 'Сана оралиғи',
  dfToday: 'Бугун',
  dfWeek: 'Бу ҳафта',
  dfMonth: 'Б ой',
  dfAll: 'Барчаси',
  dfFrom: 'Дан',
  dfTo: 'Гача',
  dfApply: 'Қўллаш',
  dfShowing: 'Кўрсатилмоқда:',
  dfAllTime: 'Барча вақт',

  btnAdd: 'Қўшиш',
  btnSave: 'Сақлаш',
  btnCancel: 'Бекор қилиш',
  btnConfirm: 'Тасдиқлаш',
  btnProduce: 'Ишлаб чиқариш',
  btnSell: 'Сотувни тасдиқлаш',
  btnAddExpense: 'Харажат киритиш',
  labelDate: 'Сана',
  labelAmount: 'Миқдор',
  labelPrice: 'Нарх (дона)',
  labelTotal: 'Жами',
  labelPaid: 'Тўланди',
  labelDebt: 'Қарз',
  labelDesc: 'Изоҳ',
  labelType: 'Тури',
  labelName: 'Исм',
  labelPhone: 'Телефон',
  labelMachine: 'Аппарат',
  labelHours: 'Иш соати',
  labelPower: 'Қувват (кВт)',
  labelBankAccount: 'Ҳисоб рақами',
  labelBankName: 'Банк номи',
  unitKg: 'кг',
  unitTon: 'тонна',
  unitPiece: 'дона',
  unitSum: 'сўм',
  statusLow: 'Кам!',
  statusCritical: 'Критик!',
  statusOk: 'Яхши',
  statusActive: 'Фаол',
  successAdded: 'Муваффақиятли қўшилди!',
  colDate: 'Сана',
  colType: 'Тури',
  colAmount: 'Миқдор',
  colNote: 'Изоҳ',
  colQty: 'Миқдор',
  colMachine: 'Аппарат',
  colTotal: 'Жами',
  colPaid: 'Тўланди',
  colDebt: 'Қарз',
  colClient: 'Клиент',
  colProduct: 'Маҳсулот',
  colPrice: 'Нарх',
  totalRecords: 'ёзув',
  noData: 'Маълумот топилмади',
  rmActiveBagTitle: 'Фаол қоп',
  rmActiveBagSubtitle: 'Аппаратга уланган жорий қоп ҳолати',
  rmNoActiveBag: 'Ҳозирча фаол қоп йўқ',
  rmCreateBagTitle: 'Янги қоп яратиш',
  rmCreateBagButton: 'Қоп яратиш',
  rmBagCreateError: 'Қоп учун хомашё ва миқдорни тўлдиринг',
  rmBagCreatedSuccess: 'Қоп муваффақиятли яратилди',
  rmBagConnectTitle: 'Қопни улаш',
  rmBagConnectButton: 'Қопни улаш',
  rmBagConnectError: 'Улаш учун қоп танланмади',
  rmBagConnectedSuccess: 'Қоп аппаратга уланди',
  rmBagSwitchTitle: 'Қопни алмаштириш',
  rmBagSwitchButton: 'Алмаштириш',
  rmBagSwitchError: 'Янги қоп танланмади',
  rmBagSwitchedSuccess: 'Қоп алмаштирилди',
  rmBagSwitchReturn: 'Қолдиқни омборга қайтариш',
  rmBagSwitchWriteoff: 'Қолдиқни чиқимга чиқариш',
  rmBagWriteoffTitle: 'Қопни чиқимга чиқариш',
  rmBagWriteoffButton: 'Чиқимга чиқариш',
  rmBagWriteoffError: 'Чиқимга чиқариш учун фаол қоп йўқ',
  rmBagWrittenOffSuccess: 'Қоп чиқимга чиқарилди',
  rmBagsTitle: 'Қоплар рўйхати',
  rmBagLogsTitle: 'Қоплар тарихи',
  rmBagInitial: 'Бошланғич миқдор',
  rmBagRemaining: 'Жорий қолдиқ',
  rmBagConnectedAt: 'Уланган вақт',
  rmBagProgress: 'Тўлдирилиш прогресси',
  rmBagRawMaterial: 'Хомашё тури',
  rmBagSelectRawMaterial: 'Хомашё танланг',
  rmBagSelect: 'Қоп танланг',
  rmBagSelectReplacement: 'Алмаштириш учун қоп танланг',
  rmBagName: 'Қоп номи',
  rmBagNamePlaceholder: 'Масалан: Қоп 1',
  rmBagReasonPlaceholder: 'Сабаб (ихтиёрий)',
  rmBagStatusStorage: 'Омборда',
  rmBagStatusConnected: 'Фаол',
  rmBagStatusDepleted: 'Тугаган',
  rmBagStatusWrittenOff: 'Чиқимда',
  rmQuickConsumeTitle: 'Тезкор сарф киритиш',
  rmQuickConsumePieces: 'Дона сони',
  rmQuickConsumeGram: 'Грамм',
  rmQuickConsumeDirectKg: 'Тўғридан-тўғри кг',
  rmQuickConsumeNote: 'Сарф изоҳи',
  rmQuickConsumeResult: 'Ҳисобланган сарф',
  rmQuickConsumeButton: 'Сарфни сақлаш',
  rmQuickConsumeError: 'Сарф миқдорини киритинг',
  rmQuickConsumeSuccess: 'Сарф муваффақиятли сақланди',
  rmLogCreated: 'Яратилди',
  rmLogConnected: 'Уланди',
  rmLogDisconnected: 'Узилди',
  rmLogReturned: 'Омборга қайтарилди',
  rmLogConsumed: 'Сарфланди',
  rmLogDepleted: 'Тугаган',
  rmLogWrittenOff: 'Чиқимга чиқарилди',
  rmNoLogNote: 'Изоҳ йўқ',
  rmCreateTypeTitle: 'Сиро турини яратиш',
  rmCreateTypeButton: 'Сиро турини сақлаш',
  rmCreateTypePlaceholder: 'Масалан: PET 9921',
  rmCreateTypeDescPlaceholder: 'Сиро ҳақида қисқача изоҳ',
  rmCreateNameRequired: 'Сиро номи мажбурий',
  rmCreateError: 'Сиро турини яратишда хатолик юз берди',
  rmCreatedSuccess: 'Сиро тури муваффақиятли яратилди',
  rmSelectRawMaterialRequired: 'Аввал камида битта сиро турини яратинг',
  rmDefaultIncomingNote: 'Сиро кирими',
  rmIncomingHint: 'Кирим яратилган биринчи сиро турига ёзилади',

  dashTitle: 'Ишлаб чиқариш бошқарув панели',
  dashSubtitle: 'Реал вақт маълумотлари',
  dashSystemActive: 'Тизим фаол',
  dashLowAlert: 'Сиро миқдори критик даражада кам!',
  dashLowDesc: 'Янги сиро буюртма беринг',
  dashKpiMaterial: 'Сиро қолдиғи',
  dashKpiSemi: 'Қолип омбори',
  dashKpiFinal: 'Бакалашка омбори',
  dashKpiTodayProd: 'Бугунги ишлаб чиқариш',
  dashKpiTodaySales: 'Бугунги сотув',
  dashChartProd: 'Ишлаб Чиқариш Трэнди',
  dashChartLast7: 'Сўнгги 7 кун',
  dashChartMaterial: 'Сиро Ҳаракати',
  dashChartKg: 'кг',
  dashStockTitle: 'Омбор Ҳолати',
  dashActivityTitle: 'Сўнгги Фаолиятлар',
  dashOrderMaterial: 'Сиро буюртма беринг!',
  dashTodayDate: 'Жума, 3 Апрел 2026',
  dashMaterialInWarehouse: '% омборда',
  dashCbuTitle: 'Марказий банк курси',
  dashCbuSource: 'ЎзМарказий банк',
  dashCbuFetchError: 'Курс юкланмади. Интернетни текширинг.',
  dashCbuRetry: 'Қайта уриниш',
  dashCbuRefresh: 'Янгилаш',
  dashCbuChangeToday: 'бугун',

  rmTitle: 'Хомашё (Сиро) Бошқаруви',
  rmTotalIn: 'Жами кирди',
  rmTotalOut: 'Жами ишлатилди',
  rmRemaining: 'Қолган сиро',
  rmStockLevel: 'Омбор тўлиши',
  rmNewEntry: 'Янги Сиро Кирими',
  rmAddBtn: 'Омборга қўшиш',
  rmHistory: 'Сиро Ҳаракати Тарихи',
  rmIncoming: '↓ Кирди',
  rmOutgoing: '↑ Сарфланди',
  rmBalance: 'Ҳозирги қолдиқ',
  rmPlaceholderDesc: 'ПЭТ сиро кирими...',
  rmPreviewAdd: 'Омборга қўшилади:',
  rmPreviewBalance: 'Янги қолдиқ:',
  rmCapacity: 'Омбор сиғими',
  rmCritical: 'Критик: 500 кг',
  rmWarning: 'Огоҳлантириш: 1000 кг',

  spTitle: 'Қолип Ишлаб Чиқариш',
  sp18gStock: '18г Қолип (Омборда)',
  sp20gStock: '20г Қолип (Омборда)',
  spRawRemaining: 'Сиро қолдиғи',
  spFormTitle: 'Қолип Ишлаб Чиқариш',
  spTypeLabel: 'Қолип тури',
  spMachineLabel: 'Аппарат',
  spQtyLabel: 'Миқдор (дона)',
  spCalcTitle: '⚙️ Автоматик ҳисоб:',
  spCalcPer: 'Ҳар бир қолип:',
  spCalcNeeded: 'Керак сиро:',
  spCalcAfter: 'Ишлатгандан сўнг:',
  spCalcRemains: 'қолади',
  spNoRaw: 'Yetarli siro yo\'q!',
  spHistory: 'Ишлаб Чиқариш Тарихи',
  spTotal18: 'Жами 18г:',
  spTotal20: 'Жами 20г:',
  spColRaw: 'Сиро сарфи',

  fpTitle: 'Бакалашка Ишлаб Чиқариш',
  fpFlowTitle: 'Ишлаб Чиқариш Жараёни',
  fpFormTitle: 'Бакалашка Ишлаб Чиқариш',
  fpTypeLabel: 'Маҳсулот тури',
  fpSemiLabel: 'Қолип тури (сарфланадиган)',
  fpQtyLabel: 'Миқдор (дона)',
  fpCalcTitle: '⚙️ Сарфланадиган қолиплар:',
  fpCalcNeeded: 'Керак қолип:',
  fpCalcAvailable: 'Мавжуд',
  fpCalcAfter: 'Ишлатгандан сўнг:',
  fpCalcRemains: 'дона қолади',
  fpNoSemi: 'Yetarli qolip yo\'q!',
  fpHistory: 'Бакалашка Ишлаб Чиқариш Тарихи',
  fpBatches: 'партия',
  fpColUsed: 'Сарфланган қолип',

  whTitle: 'Омбор',
  whMaterial: 'ПЭТ Сиро',
  whSemi: 'Ярим тайёр (қолип)',
  whFinal: 'Тайёр маҳсулот (бакалашка)',
  whTotalProd: 'Жами маҳсулот',
  whInWarehouse: 'Омборда',
  whDetailed: 'Батафсил Омбор Ҳолати',
  whStockBreakdownEmpty:
    'Бу ерда фақат каталогга қўшилган махсулот турлари бўйича карта кўринади. Аввал махсулот қўшинг.',
  whSemiStats: 'Қолип статистикаси',
  whFinalStats: 'Бакалашка статистикаси',
  whProduced: 'Жами ишлаб чиқарилган',
  whUsedInFinal: 'Бакалашкага сарфланган',
  whSold: 'Сотилган',
  whRemaining: 'Омборда қолган',
  whByType: 'Тоифалар бўйича:',
  whUnit: 'Ўлчов',
  whWeightGram: 'Оғирлиги (грамм)',
  whVolumeLiter: 'Ҳажми (литр)',
  whProductsList: 'Маҳсулотлар рўйхати',
  whCreatedAt: 'Яратилган сана',
  whCreatedBy: 'Яратган',
  whUpdatedBy: 'Янгилаган',
  whEdit: 'Таҳрирлаш',
  whNoProducts: 'Маҳсулотлар ҳозирча мавжуд эмас',
  whAddProduct: 'Маҳсулот қўшиш',
  whManageReadOnly: 'Сизда фақат кўриш ҳуқуқи мавжуд',
  whDeleteTitle: 'Маҳсулотни ўчириш',
  whDeleteConfirm: 'Ҳақиқатан ҳам ушбу маҳсулотни ўчирмоқчимисиз?',
  whDeleteAction: 'Ҳа, ўчириш',
  whProductAdded: 'Маҳсулот муваффақиятли қўшилди',
  whProductUpdated: 'Маҳсулот муваффақиятли янгиланди',
  whProductDeleted: 'Маҳсулот муваффақиятли ўчирилди',
  whProductType: 'Маҳсулот тури',
  whNameRequired: 'Маҳсулот номи мажбурий',
  whMetricRequired: 'Ўлчам майдонини тўғри киритинг',
  whRequestError: 'Маҳсулот амалиётида хатолик юз берди',
  whErrDeleteStockRemains:
    'Омборда қолдиқ бор. Аввал қолдиқни нолга туширинг, кейин ўчиринг.',
  whErrDeleteRawBags:
    'Бу хомашё турига боғланган қоплар мавжуд. Аввал қопларни ёпинг ёки бошқа турига уланг.',
  whSemi18Label: '18g қолип',
  whSemi20Label: '20g қолип',
  whFinal05Label: '0.5L',
  whFinal1Label: '1L',
  whFinal5Label: '5L',
  whMaxLabel: 'Макс',
  whDrawerCreateTitle: 'Янги маҳсулот',
  whDrawerCreateDescription: 'Ярим тайёр ёки тайёр маҳсулот қўшинг',
  whDrawerEditTitle: 'Маҳсулотни таҳрирлаш',
  whDrawerEditDescription: 'Маҳсулот ва унинг боғланишларини янгиланг',
  whIngredientsTitle: 'Хомашё таркиби',
  whIngredientsSubtitle: 'Ҳар бир хомашё учун грамм миқдорини киритинг',
  whIngredientsShort: 'таркиб',
  whSemiShort: 'қолип',
  whMachinesShort: 'аппарат',
  whAddIngredient: 'Хомашё қўшиш',
  whRemoveIngredient: 'Қаторни ўчириш',
  whSelectRawMaterial: 'Хомашёни танланг',
  whAmountGram: 'Миқдор (грамм)',
  whAmountGramRequired: 'Ҳар бир хомашё учун мусбат грамм киритинг',
  whRawMaterialRequired: 'Камида битта хомашё танланиши шарт',
  whNoRawMaterials: 'Хомашё рўйхати бўш',
  whSemiSelectionTitle: 'Ярим тайёр маҳсулотлар',
  whSemiProductRequired: 'Камида битта ярим тайёр маҳсулот танланиши шарт',
  whNoSemiProducts: 'Ярим тайёр маҳсулотлар топилмади',
  whMachineSelectionTitle: 'Аппаратлар',
  whMachineRequired: 'Камида битта аппарат танланиши шарт',
  whNoMachines: 'Аппаратлар топилмади',
  whRawMaterialListTitle: 'Омбордаги сиро турлари',
  whIncludedInWarehouse: 'Омборда кўринади',

  slTitle: 'Сотув',
  slTotalRevenue: 'Жами Сотув',
  slTotalPaid: 'Тўланган',
  slTotalDebt: 'Умумий Қарз',
  slOperations: 'операция',
  slPaidPercent: '% тўланган',
  slHasDebt: 'та клиентда қарз бор',
  slTabNew: 'Янги Сотув',
  slTabClients: 'Клиентлар',
  slTabHistory: 'Сотув Тарихи',
  slFormTitle: 'Янги Сотув Киритиш',
  slCategory: 'Маҳсулот категорияси',
  slSemiCat: 'Яримтайёр (Қолип)',
  slFinalCat: 'Тайёр (Бакалашка)',
  slProductType: 'Маҳсулот тури',
  slNoCatalogProducts:
    'Каталогда сотиш учун махсулот йўқ. Аввал «Омбор»дан махсулот қўшинг.',
  slAvailableStock: 'мавжуд',
  slAvailableProducts: 'Мавжуд Маҳсулотлар',
  slNewClient: 'Янги Клиент',
  slClientList: 'Клиентлар Рўйхати',
  slDebtPaid: 'Ҳисоб-китоб қилинган',
  slBtn: 'Сотувни Тасдиқлаш',
  slAddToCart: 'Саватга қўшиш',
  slCart: 'Сават',
  slCartEmpty: 'Сават бош',
  slAddItem: 'Маҳсулот қўшиш',
  slOrderItems: 'Буюртма маҳсулотлари',
  slMixedProducts: 'Микс маҳсулотлар',
  slRemoveItem: 'Маҳсулотни ўчириш',

  exTitle: 'Харажатлар',
  exElectricity: 'Электр Энергия',
  exCaps: 'Қопқоқ',
  exPackaging: 'Пакет',
  exOther: 'Бошқа',
  exTotalLabel: 'Умумий Харажатлар:',
  exFormTitle: 'Харажат Киритиш',
  exCalcTitle: '⚡ Ҳисоб:',
  exKwh: 'кВт·с сарфи:',
  exPricePerKwh: 'Нарх (кВт·с)',
  exBtn: 'Харажат Киритиш',
  exHistory: 'Харажатлар Тарихи',
  exColAmount: 'Сумма',

  repTitle: 'Ҳисоботлар',
  repRevenue: 'Жами Даромад',
  repExpenses: 'Жами Харажат',
  repProfit: 'Соф Фойда (тахм.)',
  repRawEff: 'Сиро Самарадорлиги',
  repTabProduction: 'Ишлаб Чиқариш',
  repTabEfficiency: 'Самарадорлик',
  repTabSales: 'Сотув',
  repTabMaterial: 'Сиро Таҳлили',
  repProdTitle: 'Ишлаб Чиқариш (Сўнгги 7 кун)',
  repEffTitle: 'Аппарат Самарадорлиги',
  repEffFormula: 'Формула: (Ҳақиқий / Максимал) × 100%',
  repEffActual: 'Ҳақиқий:',
  repEffMax: 'Максимал:',
  repRawTitle: 'Хомашё Самарадорлиги',
  repRawIn: 'Жами Кирди',
  repRawOut: 'Ишлатилди',
  repRawEffLabel: 'Ишлатиш самарадорлиги',
  repSalesTitle: 'Сотув Трэнди (Сўнгги 7 кун, минг сўм)',
  repClientsTitle: 'Клиентлар Бўйича Сотув',
  repMatTitle: 'Сиро Ҳаракати (Сўнгги 7 кун, кг)',
  repMatTable: 'Сиро Ҳаракати Жадвали',
  repSemiDist: 'Қолип Омбори Тақсимоти',
  repFinalDist: 'Бакалашка Омбори Тақсимоти',

  layoutSystem: 'Лидер Пласт',
  layoutMaterialLow: 'Сиро кам!',
  layoutAdmin: 'Лидер Пласт',
  layoutSiroRemaining: 'Сиро қолдиғи',

  // Client Detail
  cdBack: 'Орқага',
  cdInfo: 'Маълумот',
  cdSales: 'Сотувлар',
  cdPayments: 'Тўловлар',
  cdAkt: 'АКТ Сверка',
  cdTotalPurchases: 'Жами харидлар',
  cdCreatedAt: 'Рўйхатга олинган',
  cdDebt: 'Қарз',
  cdNoSales: 'Бу клиент учун сотувлар йўқ',
  cdBankInfo: 'Банк маълумотлари',
  cdContactInfo: 'Алоқа маълумотлари',

  // AKT Sverka
  aktTitle: 'АКТ Сверка',
  aktGenerate: 'АКТ Яратиш',
  aktDownloadPdf: 'PDF Юклаш',
  aktOpeningBalance: 'Кириш қолдиғи',
  aktTotalSales: 'Жами сотувлар',
  aktTotalPayments: 'Жами тўловлар',
  aktClosingBalance: 'Якуний қолдиқ',
  aktDate: 'Сана',
  aktDocType: 'Ҳужжат тури',
  aktDocNum: 'Ҳужжат №',
  aktDebit: 'Дебет',
  aktCredit: 'Кредит',
  aktBalance: 'Қолдиқ',
  aktSaleType: 'Соtuv',
  aktPaymentType: 'Тўлов',
  aktEmpty: 'Кўрсатилган давр учун ҳужжатлар топилмади',
  aktPeriod: 'Давр',
  aktGenerating: 'Яратилмоқда...',
  aktCompany: 'Корхона',
  aktSignature: 'Имзолар',
  aktDirectorSig: 'Директор имзоси',
  aktClientSig: 'Клиент имзоси',
  aktAccountant: 'Бухгалтер',
  aktFilter: 'Фильтр',
  aktFilterAll: 'Барчаси',
  aktFilterToday: 'Бугун',
  aktFilterWeek: 'Ҳафта',
  aktFilterMonth: 'Ой',
  aktRowOpening: 'Бошланғич қолдиқ',
  aktRowClosing: 'Якуний қолдиқ',
  aktTotal: 'Жами',

  // Payments tab
  pmAddPayment: 'Тўлов қўшиш',
  pmAmount: 'Сумма',
  pmDesc: 'Изоҳ',
  pmHistory: 'Тўловлар тарихи',
  pmNoPayments: 'Тўловлар мавжуд эмас',
  pmDate: 'Сана',
  pmAddSuccess: 'Тўлов муваффақиятли қўшилди!',
  pmDeleteConfirm: 'Тўловни ўчиришни тасдиқлайсизми?',

  navPayroll: 'Бухгалтерия',
  prTitle: 'Бухгалтерия',
  prTabVedomost: 'Ведомост',
  prTabBank: 'Банк',
  prTabEmployees: 'Ишчилар',
  prTabProduction: 'Иш ҳажми',
  prTabSettings: 'Солиқ созламалари',
  prGenerate: 'Ведомост яратиш',
  prMonth: 'Ой',
  prFullName: 'Ф.И.Ш.',
  prPosition: 'Лавозим',
  prCardNumber: 'Карта рақами',
  prStir: 'СТИР',
  prSalaryType: 'Иш ҳақи тури',
  prFixed: 'Белгиланган',
  prPerPiece: 'Дона бошига',
  prHybrid: 'Аралаш',
  prAklad: 'Аклад',
  prSalaryAmount: 'Аклад суммаси',
  prProducedQty: 'Ишлаб чиқарган (дона)',
  prProductionAmt: 'Ишлаб чиқариш суммаси',
  prBonus: 'Бонус',
  prBrutto: 'Брутто (жами)',
  prIncomeTax: 'Даромад солиғи',
  prNps: 'НПС',
  prSocialTax: 'Ижтимоий солиқ',
  prNet: 'НЕТ (қўлига)',
  prStatusLabel: 'Ҳолат',
  prPaid: 'Берилди',
  prUnpaid: 'Берилмади',
  prMarkPaid: 'Берилди деб белгилаш',
  prMarkUnpaid: 'Бекор қилиш',
  prExportCsv: 'CSV юклаш',
  prPrint: 'Чоп этиш',
  prIncomeTaxPct: 'Даромад солиғи (%)',
  prSocialTaxPct: 'Ижтимоий солиқ (%)',
  prNpsPct: 'НПС (%)',
  prAddEmployee: 'Ишчи қўшиш',
  prEditEmployee: 'Ишчи маълумотларини ўзгартириш',
  prEmployeeRates: 'Маҳсулот бўйича ставка',
  prRateType: 'Ставка тури',
  prRateFixed: 'Сўм',
  prRatePercent: 'Фоиз',
  prRateValue: 'Ставка',
  prRateBaseAmount: 'База сумма',
  prNoEmployeeRates: 'Бу ишчи учун маҳсулот ставкалари ҳали киритилмаган.',
  prRateConfiguredHint: 'Ставка бугалтерияда белгиланган',
  prDeleteEmployeeTitle: 'Ишчини ўчириш',
  prDeleteEmployeeConfirm: '"{name}" ни ўчиришни тасдиқлайсизми?',
  prDeleteEmployeeAction: 'Ҳа, ўчириш',
  prWorkedDays: 'Иш кунлари',
  prPricePerUnit: 'Нарх (дона)',
  prProductType: 'Маҳсулот тури',
  prAddProduction: 'Иш ҳажми қўшиш',
  prEmployee: 'Ишчи',
  prNoEmployees: 'Ишчилар рўйхати бўш',
  prNoVedomost: 'Ведомост яратилмаган. "Ведомост яратиш" тугмасини босинг.',
  prTotalBrutto: 'Жами брутто',
  prTotalNet: 'Жами нет',
  prTotalTax: 'Жами солиқ',
  prSaveSettings: 'Сақлаш',
  prSettingsTitle: 'Солиқ ставкалари',

  // Payroll – new keys (NET formula, file upload)
  prTaxNotDeducted: 'Ҳисобланади, лекин НЕТдан чегирилмайди',
  prNetFormula: 'НЕТ = Брутто − Даромад солиғи',
  prUploadFile: 'Тўлов файлини юклаш',
  prFileUploaded: 'Файл юкланди — барча ходимлар ҳолати «Берилди»га ўзгарди',
  prBulkGiven: 'Барчасини «Берилди» деб белгилаш',
  prIncomeTaxOnly: 'Фақат даромад солиғи чегирилади',
  prNpsNote: 'НПС — чегирилмайди',
  prSocialNote: 'Ижт. солиқ — чегирилмайди',
  prBankUploadTitle: 'Обортка юклаш',
  prBankUploadHint: 'Биринчи sheet автоматик ўқилади',
  prBankUploadAction: '.xlsx файл танлаш',
  prBankUploadSuccess: 'Обортка файли муваффақиятли юкланди',
  prBankUploadDate: 'Юкланган сана',
  prBankUploadedBy: 'Юкловчи',
  prBankStatusDraft: 'Қораловма',
  prBankStatusParsed: 'Қайта ишланган',
  prBankStatusConfirmed: 'Тасдиқланган',
  prBankStatusRejected: 'Рад этилган',
  prBankVedomostList: 'Банк ведомостлари',
  prBankNoVedomost: 'Ҳозирча банк ведомости йўқ',
  prBankTransactions: 'Транзакциялар',
  prBankNoTransactions: 'Транзакциялар топилмади',
  prBankNoSelection: 'Ведомост танланмаган',
  prBankIncome: 'Кирим',
  prBankExpense: 'Чиқим',
  prBankDocNumber: 'Ҳужжат рақами',
  prBankReceiver: 'Олувчи',
  prBankPurpose: 'Тўлов мақсади',
  prBankMatched: 'Ойликка мос',
  prBankUnmatched: 'Мос эмас',
  prBankSalarySummary: 'Ойлик reconciliation',
  prBankSalarySummaryHint: 'Нетто сумма ва банк тўловлари кесимида',
  prBankRequired: 'Керакли сумма',
  prBankPaid: 'Тўланган',
  prBankRemaining: 'Қолган',
  prBankTotalVedomost: 'Жами ведомост',
  prBankSalaryMatched: 'Ойликка мос тўловлар',
  prBankSelected: 'Танланган чиқим',
  prBankWarningTitle: 'Тизимда топилмаган ўтказмалар бор',
  prBankWarningDesc: 'Агар уларни клиeнт ёки ходим сифатида қўшмасангиз, пул ҳаракатлари ҳисобида номувофиқликлар қолиши мумкин.',
  prBankUnknownClients: 'номаълум клиент',
  prBankUnknownEmployees: 'номаълум ходим',
  prBankUnknownClientsDesc: 'Кирим тўловларида тизимда йўқ клиентлар аниқланди.',
  prBankUnknownEmployeesDesc: 'Ойликка тегишли, лекин тизимда йўқ ходимлар аниқланди.',
  prBankAddClient: 'Клиент қўшиш',
  prBankAddEmployee: 'Ходим қўшиш',
  prBankCreateClientTitle: 'Клиентни тизимга қўшиш',
  prBankCreateClientDesc: 'Ушбу пул ўтказган томонни клиент сифатида қўшасизми?',
  prBankCreateEmployeeTitle: 'Ходимни тизимга қўшиш',
  prBankCreateEmployeeDesc: 'Ушбу олувчини ходим сифатида қўшасизми?',
  prBankCreateWarning: 'Рад этсангиз, ушбу ўтказма тизимда клиент/ходимга боғланмайди ва кейинги ҳисоботлар ҳамда солиштиришларда номувофиқлик қолиши мумкин.',
  prBankRejectedTitle: 'Файл импорти якунланмади',
  prBankRejectedExplain:
    'Банк обороткаси талаб қилинган форматда ўқилмади ёки сақлашда хатолик бўлди. Транзакциялар базага ёзилмади — шу сабабли рўйхат бўш. Агар хабарда «database» ёки «schema» бўлса, ишлаб чиқувчи `prisma db push` ни ишга тушириши керак.',
  prBankRejectedEmptyTx: 'Рад этилган ведомостда транзакциялар йўқ.',
  prBankTechnicalDetails: 'Техник тафсилотлар (ихтиёрий)',
};

// ======================== UZBEK LATIN ========================
const uz_latin: T = {
  langName: "O'zbek (Lotin)",
  langShort: 'LT',

  navDashboard: 'Boshqaruv paneli',
  navRawMaterial: 'Xomashyo (Siro)',
  navSemiProduction: 'Qolip ishlab chiqarish',
  navFinalProduction: 'Bakalashka ishlab chiqarish',
  navWarehouse: 'Ombor',
  navSales: 'Sotuv',
  navExpenses: 'Xarajatlar',
  navReports: 'Hisobotlar',
  navShifts: 'Smena',
  navSystemUsers: 'Tizim foydalanuvchilari',

  authTitle: 'LiderPlast ERP',
  authSubtitle: 'Tizimga kirish',
  authIdentifier: 'Telefon yoki login',
  authPassword: 'Parol',
  authSubmit: 'Kirish',
  authLoading: 'Yuklanmoqda…',
  authMachines: 'Mashinalar',
  authMachinesDisabledHint: 'CRM manzili hozircha o‘rnatilmagan (VITE_MACHINES_CRM_URL)',
  suTitle: 'Tizim foydalanuvchilari',
  suSubtitle: 'Login qiladigan xodimlar va ularning huquqlari',
  suAddTitle: 'Yangi foydalanuvchi',
  suFullName: 'F.I.Sh.',
  suLoginOrPhone: 'Login yoki telefon',
  suPassword: 'Parol',
  suRole: 'Lavozim',
  suRoleAdmin: 'Admin',
  suRoleDirector: 'Direktor',
  suRoleAccountant: 'Buxgalter',
  suRoleOperator: 'Operator',
  suRoleCustom: 'Boshqa',
  suCustomLabel: 'Lavozim nomi',
  suSavedPositionsTitle: 'Qo‘shimcha lavozimlar',
  suSavedPositionsHint: 'Ro‘yxatga qo‘shing — ular lavozim tanlovida ko‘rinadi; keyinroq o‘chirish mumkin.',
  suAddPositionPlaceholder: 'Yangi lavozim nomi',
  suRoleDeleteExplain:
    'Admin, direktor, buxgalter, operator va «Boshqa» — tizim lavozimlari; ularni ro‘yxatdan o‘chirib bo‘lmaydi. O‘chirish mumkin bo‘lganlar — faqat pastda o‘zingiz qo‘shgan qo‘shimcha lavozimlar.',
  suPermissionsHint: 'Sahifa va funksiyalarga ruxsat',
  suCreateBtn: 'Qo‘shish',
  suListTitle: 'Foydalanuvchilar',
  suColName: 'Ism',
  suColLogin: 'Kirish',
  suColRole: 'Rol',
  suColPerms: 'Ruxsatlar',
  suSuccess: 'Saqlandi',
  suDelete: 'O‘chirish',
  suEdit: 'Tahrirlash',
  suUpdateUserTitle: 'Foydalanuvchini yangilash',
  suPasswordOptionalHint: 'Parolni o‘zgartirmasangiz, bo‘sh qoldiring.',
  suPasswordMinLength: 'Parol kamida 6 ta belgi bo‘lishi kerak.',
  suCancelEdit: 'Bekor qilish',
  suPermViewDashboard: 'Boshqaruv paneli',
  suPermViewShift: 'Smena (ko‘rish)',
  suPermManageShiftWorkers: 'Smenada ishchilar',
  suPermViewRawMaterial: 'Xomashyo',
  suPermViewWarehouse: 'Ombor',
  suPermViewSales: 'Sotuv',
  suPermViewExpenses: 'Xarajatlar',
  suPermViewPayroll: 'Ish haqi / xodimlar',
  suPermViewVedomost: 'Vedomost (ko‘rish)',
  suPermCreateVedomost: 'Vedomost yaratish',
  suPermViewReports: 'Hisobotlar',
  suPermManageSettings: 'Sozlamalar',
  suPermManageUsers: 'Foydalanuvchilarni boshqarish',
  layoutLogout: 'Chiqish',

  dfTitle: 'Sana oralig\'i',
  dfToday: 'Bugun',
  dfWeek: 'Bu hafta',
  dfMonth: 'Bu oy',
  dfAll: 'Barchasi',
  dfFrom: 'Dan',
  dfTo: 'Gacha',
  dfApply: "Qo'llash",
  dfShowing: "Ko'rsatilmoqda:",
  dfAllTime: 'Barcha vaqt',

  btnAdd: "Qo'shish",
  btnSave: 'Saqlash',
  btnCancel: 'Bekor qilish',
  btnConfirm: 'Tasdiqlash',
  btnProduce: 'Ishlab chiqarish',
  btnSell: 'Sotuvni tasdiqlash',
  btnAddExpense: 'Xarajat kiritish',
  labelDate: 'Sana',
  labelAmount: 'Miqdor',
  labelPrice: 'Narx (dona)',
  labelTotal: 'Jami',
  labelPaid: "To'landi",
  labelDebt: 'Qarz',
  labelDesc: 'Izoh',
  labelType: 'Turi',
  labelName: 'Ism',
  labelPhone: 'Telefon',
  labelMachine: 'Apparat',
  labelHours: 'Ish soati',
  labelPower: 'Quvvat (kW)',
  labelBankAccount: 'Hisob raqami',
  labelBankName: 'Bank nomi',
  unitKg: 'kg',
  unitTon: 'tonna',
  unitPiece: 'dona',
  unitSum: "so'm",
  statusLow: 'Kam!',
  statusCritical: 'Kritik!',
  statusOk: 'Yaxshi',
  statusActive: 'Faol',
  successAdded: 'Muvaffaqiyatli qo\'shildi!',
  colDate: 'Sana',
  colType: 'Turi',
  colAmount: 'Miqdor',
  colNote: 'Izoh',
  colQty: 'Miqdor',
  colMachine: 'Apparat',
  colTotal: 'Jami',
  colPaid: "To'landi",
  colDebt: 'Qarz',
  colClient: 'Klient',
  colProduct: 'Mahsulot',
  colPrice: 'Narx',
  totalRecords: 'yozuv',
  noData: 'Ma\'lumot topilmadi',
  rmActiveBagTitle: 'Faol qop',
  rmActiveBagSubtitle: 'Apparatga ulangan joriy qop holati',
  rmNoActiveBag: 'Hozircha faol qop yo‘q',
  rmCreateBagTitle: 'Yangi qop yaratish',
  rmCreateBagButton: 'Qop yaratish',
  rmBagCreateError: 'Qop uchun xomashyo va miqdorni to‘ldiring',
  rmBagCreatedSuccess: 'Qop muvaffaqiyatli yaratildi',
  rmBagConnectTitle: 'Qopni ulash',
  rmBagConnectButton: 'Qopni ulash',
  rmBagConnectError: 'Ulash uchun qop tanlanmadi',
  rmBagConnectedSuccess: 'Qop apparatga ulandi',
  rmBagSwitchTitle: 'Qopni almashtirish',
  rmBagSwitchButton: 'Almashtirish',
  rmBagSwitchError: 'Yangi qop tanlanmadi',
  rmBagSwitchedSuccess: 'Qop almashtirildi',
  rmBagSwitchReturn: 'Qoldiqni omborga qaytarish',
  rmBagSwitchWriteoff: 'Qoldiqni chiqimga chiqarish',
  rmBagWriteoffTitle: 'Qopni chiqimga chiqarish',
  rmBagWriteoffButton: 'Chiqimga chiqarish',
  rmBagWriteoffError: 'Chiqimga chiqarish uchun faol qop yo‘q',
  rmBagWrittenOffSuccess: 'Qop chiqimga chiqarildi',
  rmBagsTitle: 'Qoplar ro‘yxati',
  rmBagLogsTitle: 'Qoplar tarixi',
  rmBagInitial: 'Boshlang‘ich miqdor',
  rmBagRemaining: 'Joriy qoldiq',
  rmBagConnectedAt: 'Ulangan vaqt',
  rmBagProgress: 'To‘ldirilish progressi',
  rmBagRawMaterial: 'Xomashyo turi',
  rmBagSelectRawMaterial: 'Xomashyo tanlang',
  rmBagSelect: 'Qop tanlang',
  rmBagSelectReplacement: 'Almashtirish uchun qop tanlang',
  rmBagName: 'Qop nomi',
  rmBagNamePlaceholder: 'Masalan: Qop 1',
  rmBagReasonPlaceholder: 'Sabab (ixtiyoriy)',
  rmBagStatusStorage: 'Omborda',
  rmBagStatusConnected: 'Faol',
  rmBagStatusDepleted: 'Tugagan',
  rmBagStatusWrittenOff: 'Chiqimda',
  rmQuickConsumeTitle: 'Tezkor sarf kiritish',
  rmQuickConsumePieces: 'Dona soni',
  rmQuickConsumeGram: 'Gramm',
  rmQuickConsumeDirectKg: 'To‘g‘ridan-to‘g‘ri kg',
  rmQuickConsumeNote: 'Sarf izohi',
  rmQuickConsumeResult: 'Hisoblangan sarf',
  rmQuickConsumeButton: 'Sarfni saqlash',
  rmQuickConsumeError: 'Sarf miqdorini kiriting',
  rmQuickConsumeSuccess: 'Sarf muvaffaqiyatli saqlandi',
  rmLogCreated: 'Yaratildi',
  rmLogConnected: 'Ulandi',
  rmLogDisconnected: 'Uzildi',
  rmLogReturned: 'Omborga qaytarildi',
  rmLogConsumed: 'Sarflandi',
  rmLogDepleted: 'Tugagan',
  rmLogWrittenOff: 'Chiqimga chiqarildi',
  rmNoLogNote: 'Izoh yo‘q',
  rmCreateTypeTitle: 'Siro turini yaratish',
  rmCreateTypeButton: 'Siro turini saqlash',
  rmCreateTypePlaceholder: 'Masalan: PET 9921',
  rmCreateTypeDescPlaceholder: 'Siro haqida qisqacha izoh',
  rmCreateNameRequired: 'Siro nomi majburiy',
  rmCreateError: 'Siro turini yaratishda xatolik yuz berdi',
  rmCreatedSuccess: 'Siro turi muvaffaqiyatli yaratildi',
  rmSelectRawMaterialRequired: 'Avval kamida bitta siro turini yarating',
  rmDefaultIncomingNote: 'Siro kirimi',
  rmIncomingHint: 'Kirim yaratilgan birinchi siro turiga yoziladi',

  dashTitle: 'Ishlab chiqarish boshqaruv paneli',
  dashSubtitle: 'Real vaqt ma\'lumotlari',
  dashSystemActive: 'Tizim faol',
  dashLowAlert: 'Siro miqdori kritik darajada kam!',
  dashLowDesc: 'Yangi siro buyurtma bering',
  dashKpiMaterial: "Siro qoldig'i",
  dashKpiSemi: 'Qolip ombori',
  dashKpiFinal: 'Bakalashka ombori',
  dashKpiTodayProd: 'Bugungi ishlab chiqarish',
  dashKpiTodaySales: 'Bugungi sotuv',
  dashChartProd: 'Ishlab Chiqarish Trendi',
  dashChartLast7: "So'nggi 7 kun",
  dashChartMaterial: 'Siro Harakati',
  dashChartKg: 'kg',
  dashStockTitle: 'Ombor Holati',
  dashActivityTitle: "So'nggi Faoliyatlar",
  dashOrderMaterial: 'Siro buyurtma bering!',
  dashTodayDate: 'Juma, 3 Aprel 2026',
  dashMaterialInWarehouse: '% omborda',
  dashCbuTitle: 'Markaziy bank kursi',
  dashCbuSource: "O'zbekiston Respublikasi Markaziy banki",
  dashCbuFetchError: 'Kurs yuklanmadi. Internetni tekshiring.',
  dashCbuRetry: 'Qayta urinish',
  dashCbuRefresh: 'Yangilash',
  dashCbuChangeToday: 'bugun',

  rmTitle: 'Xomashyo (Siro) Boshqaruvi',
  rmTotalIn: 'Jami kirdi',
  rmTotalOut: 'Jami ishlatildi',
  rmRemaining: "Qolgan siro",
  rmStockLevel: "Ombor to'lishi",
  rmNewEntry: 'Yangi Siro Kirimi',
  rmAddBtn: "Omborga qo'shish",
  rmHistory: 'Siro Harakati Tarixi',
  rmIncoming: '↓ Kirdi',
  rmOutgoing: '↑ Sarflandi',
  rmBalance: "Hozirgi qoldiq",
  rmPlaceholderDesc: 'PET siro kirimi...',
  rmPreviewAdd: "Omborga qo'shiladi:",
  rmPreviewBalance: 'Yangi qoldiq:',
  rmCapacity: 'Ombor sig\'imi',
  rmCritical: 'Kritik: 500 kg',
  rmWarning: 'Ogohlantirish: 1000 kg',

  spTitle: 'Qolip Ishlab Chiqarish',
  sp18gStock: '18g Qolip (Omborda)',
  sp20gStock: '20g Qolip (Omborda)',
  spRawRemaining: "Siro qoldig'i",
  spFormTitle: 'Qolip Ishlab Chiqarish',
  spTypeLabel: 'Qolip turi',
  spMachineLabel: 'Apparat',
  spQtyLabel: 'Miqdor (dona)',
  spCalcTitle: '⚙️ Avtomatik hisob:',
  spCalcPer: 'Har bir qolip:',
  spCalcNeeded: 'Kerak siro:',
  spCalcAfter: 'Ishlatgandan so\'ng:',
  spCalcRemains: 'qoladi',
  spNoRaw: 'Yetarli siro yo\'q!',
  spHistory: 'Ishlab Chiqarish Tarixi',
  spTotal18: 'Jami 18g:',
  spTotal20: 'Jami 20g:',
  spColRaw: 'Siro sarfi',

  fpTitle: 'Bakalashka Ishlab Chiqarish',
  fpFlowTitle: 'Ishlab Chiqarish Jarayoni',
  fpFormTitle: 'Bakalashka Ishlab Chiqarish',
  fpTypeLabel: 'Mahsulot turi',
  fpSemiLabel: 'Qolip turi (sarflanadigan)',
  fpQtyLabel: 'Miqdor (dona)',
  fpCalcTitle: '⚙️ Sarflanadigan qoliplar:',
  fpCalcNeeded: 'Kerak qolip:',
  fpCalcAvailable: 'Mavjud',
  fpCalcAfter: 'Ishlatgandan so\'ng:',
  fpCalcRemains: 'dona qoladi',
  fpNoSemi: 'Yetarli qolip yo\'q!',
  fpHistory: 'Bakalashka Ishlab Chiqarish Tarixi',
  fpBatches: 'partiya',
  fpColUsed: 'Sarflangan qolip',

  whTitle: 'Ombor',
  whMaterial: 'PET Siro',
  whSemi: 'Yarim tayyor (qolip)',
  whFinal: 'Tayyor mahsulot (bakalashka)',
  whTotalProd: 'Jami mahsulot',
  whInWarehouse: 'Omborda',
  whDetailed: 'Batafsil Ombor Holati',
  whStockBreakdownEmpty:
    'Bu yerda faqat katalogga qo‘shilgan mahsulot turlari bo‘yicha karta ko‘rinadi. Avval mahsulot qo‘shing.',
  whSemiStats: 'Qolip statistikasi',
  whFinalStats: 'Bakalashka statistikasi',
  whProduced: 'Jami ishlab chiqarilgan',
  whUsedInFinal: 'Bakalashkaga sarflangan',
  whSold: 'Sotilgan',
  whRemaining: 'Omborda qolgan',
  whByType: 'Toifalar bo\'yicha:',
  whUnit: 'O\'lchov',
  whWeightGram: 'Og\'irligi (gramm)',
  whVolumeLiter: 'Hajmi (litr)',
  whProductsList: 'Mahsulotlar ro\'yxati',
  whCreatedAt: 'Yaratilgan sana',
  whCreatedBy: 'Yaratgan',
  whUpdatedBy: 'Yangilagan',
  whEdit: 'Tahrirlash',
  whNoProducts: 'Mahsulotlar hozircha mavjud emas',
  whAddProduct: 'Mahsulot qo\'shish',
  whManageReadOnly: 'Sizda faqat ko\'rish huquqi mavjud',
  whDeleteTitle: 'Mahsulotni o\'chirish',
  whDeleteConfirm: 'Haqiqatan ham ushbu mahsulotni o\'chirmoqchimisiz?',
  whDeleteAction: 'Ha, o\'chirish',
  whProductAdded: 'Mahsulot muvaffaqiyatli qo\'shildi',
  whProductUpdated: 'Mahsulot muvaffaqiyatli yangilandi',
  whProductDeleted: 'Mahsulot muvaffaqiyatli o\'chirildi',
  whProductType: 'Mahsulot turi',
  whNameRequired: 'Mahsulot nomi majburiy',
  whMetricRequired: 'O\'lcham maydonini to\'g\'ri kiriting',
  whRequestError: 'Mahsulot amaliyotida xatolik yuz berdi',
  whErrDeleteStockRemains:
    'Omborda qoldiq bor. Avval qoldiqni nolga tushiring, keyin o‘chiring.',
  whErrDeleteRawBags:
    'Bu xomashyo turiga bog‘langan qoplar mavjud. Avval qoplarni yoping yoki boshqa turga ulang.',
  whSemi18Label: '18g qolip',
  whSemi20Label: '20g qolip',
  whFinal05Label: '0.5L',
  whFinal1Label: '1L',
  whFinal5Label: '5L',
  whMaxLabel: 'Max',
  whDrawerCreateTitle: 'Yangi mahsulot',
  whDrawerCreateDescription: 'Yarim tayyor yoki tayyor mahsulot qo\'shing',
  whDrawerEditTitle: 'Mahsulotni tahrirlash',
  whDrawerEditDescription: 'Mahsulot va uning bog\'lanishlarini yangilang',
  whIngredientsTitle: 'Xomashyo tarkibi',
  whIngredientsSubtitle: 'Har bir xomashyo uchun gramm miqdorini kiriting',
  whIngredientsShort: 'tarkib',
  whSemiShort: 'qolip',
  whMachinesShort: 'apparat',
  whAddIngredient: 'Xomashyo qo\'shish',
  whRemoveIngredient: 'Qatorni o\'chirish',
  whSelectRawMaterial: 'Xomashyoni tanlang',
  whAmountGram: 'Miqdor (gramm)',
  whAmountGramRequired: 'Har bir xomashyo uchun musbat gramm kiriting',
  whRawMaterialRequired: 'Kamida bitta xomashyo tanlanishi shart',
  whNoRawMaterials: 'Xomashyo ro\'yxati bo\'sh',
  whSemiSelectionTitle: 'Yarim tayyor mahsulotlar',
  whSemiProductRequired: 'Kamida bitta yarim tayyor mahsulot tanlanishi shart',
  whNoSemiProducts: 'Yarim tayyor mahsulotlar topilmadi',
  whMachineSelectionTitle: 'Apparatlar',
  whMachineRequired: 'Kamida bitta apparat tanlanishi shart',
  whNoMachines: 'Apparatlar topilmadi',
  whRawMaterialListTitle: 'Ombordagi siro turlari',
  whIncludedInWarehouse: 'Omborda ko‘rinadi',

  slTitle: 'Sotuv',
  slTotalRevenue: 'Jami Sotuv',
  slTotalPaid: "To'langan",
  slTotalDebt: 'Umumiy Qarz',
  slOperations: 'operatsiya',
  slPaidPercent: "% to'langan",
  slHasDebt: 'ta klientda qarz bor',
  slTabNew: 'Yangi Sotuv',
  slTabClients: 'Klientlar',
  slTabHistory: 'Sotuv Tarixi',
  slFormTitle: 'Yangi Sotuv Kiritish',
  slCategory: 'Mahsulot kategoriyasi',
  slSemiCat: 'Yarim tayyor (Qolip)',
  slFinalCat: 'Tayyor (Bakalashka)',
  slProductType: 'Mahsulot turi',
  slNoCatalogProducts:
    'Katalogda sotish uchun mahsulot yo‘q. Avval «Ombor»dan mahsulot qo‘shing.',
  slAvailableStock: 'mavjud',
  slAvailableProducts: 'Mavjud Mahsulotlar',
  slNewClient: 'Yangi Klient',
  slClientList: "Klientlar Ro'yxati",
  slDebtPaid: 'Hisob-kitob qilingan',
  slBtn: 'Sotuvni Tasdiqlash',
  slAddToCart: 'Savatga qo\'shish',
  slCart: 'Savat',
  slCartEmpty: 'Savat bo\'sh',
  slAddItem: 'Mahsulot qo\'shish',
  slOrderItems: 'Buyurtma mahsulotlari',
  slMixedProducts: 'Miks mahsulotlar',
  slRemoveItem: 'Mahsulotni o\'chirish',

  exTitle: 'Xarajatlar',
  exElectricity: 'Elektr Energiya',
  exCaps: 'Qopqoq',
  exPackaging: 'Paket',
  exOther: 'Boshqa',
  exTotalLabel: 'Umumiy Xarajatlar:',
  exFormTitle: 'Xarajat Kiritish',
  exCalcTitle: '⚡ Hisob:',
  exKwh: 'kWh sarfi:',
  exPricePerKwh: 'Narx (kWh)',
  exBtn: 'Xarajat Kiritish',
  exHistory: 'Xarajatlar Tarixi',
  exColAmount: 'Summa',

  repTitle: 'Hisobotlar',
  repRevenue: 'Jami Daromad',
  repExpenses: 'Jami Xarajat',
  repProfit: 'Sof Foyda (taxm.)',
  repRawEff: 'Siro Samaradorligi',
  repTabProduction: 'Ishlab Chiqarish',
  repTabEfficiency: 'Samaradorlik',
  repTabSales: 'Sotuv',
  repTabMaterial: 'Siro Tahlili',
  repProdTitle: 'Ishlab Chiqarish (So\'nggi 7 kun)',
  repEffTitle: 'Apparat Samaradorligi',
  repEffFormula: 'Formula: (Haqiqiy / Maksimal) × 100%',
  repEffActual: 'Haqiqiy:',
  repEffMax: 'Maksimal:',
  repRawTitle: 'Xomashyo Samaradorligi',
  repRawIn: 'Jami Kirdi',
  repRawOut: 'Ishlatildi',
  repRawEffLabel: 'Ishlatish samaradorligi',
  repSalesTitle: 'Sotuv Trendi (So\'nggi 7 kun, ming so\'m)',
  repClientsTitle: 'Klientlar Bo\'yicha Sotuv',
  repMatTitle: 'Siro Harakati (So\'nggi 7 kun, kg)',
  repMatTable: 'Siro Harakati Jadvali',
  repSemiDist: 'Qolip Ombori Taqsimoti',
  repFinalDist: 'Bakalashka Ombori Taqsimoti',

  layoutSystem: 'Lider Plast',
  layoutMaterialLow: 'Siro kam!',
  layoutAdmin: 'Lider Plast',
  layoutSiroRemaining: "Siro qoldig'i",

  // Client Detail
  cdBack: 'Orqaga',
  cdInfo: 'Ma\'lumot',
  cdSales: 'Sotuvlar',
  cdPayments: 'To\'lovlar',
  cdAkt: 'AKT Sverka',
  cdTotalPurchases: 'Jami haridlar',
  cdCreatedAt: 'Ro\'yxatga olingan',
  cdDebt: 'Qarz',
  cdNoSales: 'Bu klient uchun sotuvlar yo\'q',
  cdBankInfo: 'Bank ma\'lumotlari',
  cdContactInfo: 'Aloqa ma\'lumotlari',

  // AKT Sverka
  aktTitle: 'AKT Sverka',
  aktGenerate: 'AKT Yaratish',
  aktDownloadPdf: 'PDF Yuklash',
  aktOpeningBalance: 'Kirish qoldig\'i',
  aktTotalSales: 'Jami sotuvlar',
  aktTotalPayments: 'Jami to\'lovlar',
  aktClosingBalance: 'Yakuniy qoldiq',
  aktDate: 'Sana',
  aktDocType: 'Hujjat turi',
  aktDocNum: 'Hujjat №',
  aktDebit: 'Debet',
  aktCredit: 'Kredit',
  aktBalance: 'Qoldiq',
  aktSaleType: 'Sotuv',
  aktPaymentType: 'To\'lov',
  aktEmpty: 'Ko\'rsatilgan davr uchun hujjatlar topilmadi',
  aktPeriod: 'Davr',
  aktGenerating: 'Yaratilmoqda...',
  aktCompany: 'Korxona',
  aktSignature: 'Imzolar',
  aktDirectorSig: 'Direktor imzosi',
  aktClientSig: 'Klient imzosi',
  aktAccountant: 'Buxgalter',
  aktFilter: 'Filter',
  aktFilterAll: 'Barchasi',
  aktFilterToday: 'Bugun',
  aktFilterWeek: 'Hafta',
  aktFilterMonth: 'Oy',
  aktRowOpening: 'Boshlang\'ich qoldiq',
  aktRowClosing: 'Yakuniy qoldiq',
  aktTotal: 'Jami',

  // Payments tab
  pmAddPayment: 'To\'lov qo\'shish',
  pmAmount: 'Summa',
  pmDesc: 'Izoh',
  pmHistory: 'To\'lovlar tarixi',
  pmNoPayments: 'To\'lovlar mavjud emas',
  pmDate: 'Sana',
  pmAddSuccess: 'To\'lov muvaffaqiyatli qo\'shildi!',
  pmDeleteConfirm: 'To\'lovni o\'chirishni tasdiqlarasizmi?',

  navPayroll: 'Buxgalteriya',
  prTitle: 'Buxgalteriya',
  prTabVedomost: 'Vedomost',
  prTabBank: 'Bank',
  prTabEmployees: 'Ishchilar',
  prTabProduction: 'Ish hajmi',
  prTabSettings: 'Soliq sozlamalari',
  prGenerate: 'Vedomost yaratish',
  prMonth: 'Oy',
  prFullName: 'F.I.Sh.',
  prPosition: 'Lavozim',
  prCardNumber: 'Karta raqami',
  prStir: 'STIR',
  prSalaryType: 'Ish haqi turi',
  prFixed: 'Belgilangan',
  prPerPiece: 'Dona boshiga',
  prHybrid: 'Aralash',
  prAklad: 'Aklad',
  prSalaryAmount: 'Aklad summasi',
  prProducedQty: 'Ishlab chiqargan (dona)',
  prProductionAmt: 'Ishlab chiqarish summasi',
  prBonus: 'Bonus',
  prBrutto: 'Brutto (jami)',
  prIncomeTax: "Daromad solig'i",
  prNps: 'NPS',
  prSocialTax: 'Ijtimoiy soliq',
  prNet: "NET (qo'liga)",
  prStatusLabel: 'Holat',
  prPaid: 'Berildi',
  prUnpaid: 'Berilmadi',
  prMarkPaid: 'Berildi deb belgilash',
  prMarkUnpaid: 'Bekor qilish',
  prExportCsv: 'CSV yuklash',
  prPrint: 'Chop etish',
  prIncomeTaxPct: "Daromad solig'i (%)",
  prSocialTaxPct: 'Ijtimoiy soliq (%)',
  prNpsPct: 'NPS (%)',
  prAddEmployee: "Ishchi qo'shish",
  prEditEmployee: "Ishchi ma'lumotlarini o'zgartirish",
  prEmployeeRates: "Mahsulot bo'yicha stavka",
  prRateType: 'Stavka turi',
  prRateFixed: "So'm",
  prRatePercent: 'Foiz',
  prRateValue: 'Stavka',
  prRateBaseAmount: 'Baza summa',
  prNoEmployeeRates: "Bu ishchi uchun mahsulot stavkalari hali kiritilmagan.",
  prRateConfiguredHint: 'Stavka buxgalteriyada belgilangan',
  prDeleteEmployeeTitle: "Ishchini o'chirish",
  prDeleteEmployeeConfirm: '"{name}" ni o\'chirishni tasdiqlaysizmi?',
  prDeleteEmployeeAction: "Ha, o'chirish",
  prWorkedDays: 'Ish kunlari',
  prPricePerUnit: 'Narx (dona)',
  prProductType: 'Mahsulot turi',
  prAddProduction: 'Ish hajmi kiritish',
  prEmployee: 'Ishchi',
  prNoEmployees: "Ishchilar ro'yxati bo'sh",
  prNoVedomost: "Vedomost yaratilmagan. \"Vedomost yaratish\" tugmasini bosing.",
  prTotalBrutto: 'Jami brutto',
  prTotalNet: 'Jami net',
  prTotalTax: 'Jami soliq',
  prSaveSettings: 'Saqlash',
  prSettingsTitle: 'Soliq stavkalari',

  // Payroll – new keys (NET formula, file upload)
  prTaxNotDeducted: "Hisoblanadi, lekin NETdan chegirilamaydi",
  prNetFormula: "NET = Brutto − Daromad solig'i",
  prUploadFile: "To'lov faylini yuklash",
  prFileUploaded: "Fayl yuklandi — barcha xodimlar holati «Berildi»ga o'zgardi",
  prBulkGiven: "Barchasini «Berildi» deb belgilash",
  prIncomeTaxOnly: "Faqat daromad solig'i chegiriladi",
  prNpsNote: "NPS — chegirilamaydi",
  prSocialNote: "Ijt. soliq — chegirilamaydi",
  prBankUploadTitle: 'Oborotka yuklash',
  prBankUploadHint: 'Birinchi sheet avtomatik o‘qiladi',
  prBankUploadAction: '.xlsx fayl tanlash',
  prBankUploadSuccess: 'Oborotka fayli muvaffaqiyatli yuklandi',
  prBankUploadDate: 'Yuklangan sana',
  prBankUploadedBy: 'Yuklovchi',
  prBankStatusDraft: 'Qoralovma',
  prBankStatusParsed: 'Qayta ishlangan',
  prBankStatusConfirmed: 'Tasdiqlangan',
  prBankStatusRejected: 'Rad etilgan',
  prBankVedomostList: 'Bank vedemostlar',
  prBankNoVedomost: 'Hozircha bank vedemosti yo‘q',
  prBankTransactions: 'Tranzaksiyalar',
  prBankNoTransactions: 'Tranzaksiyalar topilmadi',
  prBankNoSelection: 'Vedomost tanlanmagan',
  prBankIncome: 'Kirim',
  prBankExpense: 'Chiqim',
  prBankDocNumber: 'Hujjat raqami',
  prBankReceiver: 'Oluvchi',
  prBankPurpose: 'To‘lov maqsadi',
  prBankMatched: 'Oylikka mos',
  prBankUnmatched: 'Mos emas',
  prBankSalarySummary: 'Oylik reconciliation',
  prBankSalarySummaryHint: 'Netto summa va bank to‘lovlari kesimida',
  prBankRequired: 'Kerakli summa',
  prBankPaid: 'To‘langan',
  prBankRemaining: 'Qolgan',
  prBankTotalVedomost: 'Jami vedemost',
  prBankSalaryMatched: 'Oylikka mos to‘lovlar',
  prBankSelected: 'Tanlangan chiqim',
  prBankWarningTitle: 'Tizimda topilmagan o‘tkazmalar bor',
  prBankWarningDesc: 'Agar ularni klient yoki xodim sifatida qo‘shmasangiz, pul harakati hisobi va keyingi reconciliationlarda nomuvofiqlik qolishi mumkin.',
  prBankUnknownClients: 'noma’lum klient',
  prBankUnknownEmployees: 'noma’lum xodim',
  prBankUnknownClientsDesc: 'Kirim to‘lovlarida tizimda yo‘q klientlar aniqlandi.',
  prBankUnknownEmployeesDesc: 'Oylikka tegishli, lekin tizimda yo‘q xodimlar aniqlandi.',
  prBankAddClient: 'Klient qo‘shish',
  prBankAddEmployee: 'Xodim qo‘shish',
  prBankCreateClientTitle: 'Klientni tizimga qo‘shish',
  prBankCreateClientDesc: 'Ushbu pul o‘tkazgan tomonni klient sifatida qo‘shasizmi?',
  prBankCreateEmployeeTitle: 'Xodimni tizimga qo‘shish',
  prBankCreateEmployeeDesc: 'Ushbu oluvchini xodim sifatida qo‘shasizmi?',
  prBankCreateWarning: 'Yo‘q desangiz, ushbu o‘tkazma tizimda klient/xodimga bog‘lanmaydi va keyingi hisobotlar hamda solishtirishlarda xatolik xavfi saqlanib qoladi.',
  prBankRejectedTitle: 'Fayl importi yakunlanmadi',
  prBankRejectedExplain:
    'Bank oborotkasi talab qilingan formatda o‘qilmadi yoki saqlashda xatolik bo‘ldi. Tranzaksiyalar bazaga yozilmadi — shu sababli ro‘yxat bo‘sh. Agar xabarda «database» yoki «schema» bo‘lsa, ishlab chiquvchi `prisma db push` ni ishga tushirishi kerak.',
  prBankRejectedEmptyTx: 'Rad etilgan vedemostda tranzaksiyalar yo‘q.',
  prBankTechnicalDetails: 'Texnik tafsilotlar (ixtiyoriy)',
};

// ======================== RUSSIAN ========================
const ru: T = {
  langName: 'Русский',
  langShort: 'RU',

  navDashboard: 'Панель управления',
  navRawMaterial: 'Сырьё (Сиро)',
  navSemiProduction: 'Производство заготовок',
  navFinalProduction: 'Производство бутылок',
  navWarehouse: 'Склад',
  navSales: 'Продажи',
  navExpenses: 'Расходы',
  navReports: 'Отчёты',
  navShifts: 'Смены',
  navSystemUsers: 'Пользователи системы',

  authTitle: 'LiderPlast ERP',
  authSubtitle: 'Вход в систему',
  authIdentifier: 'Телефон или логин',
  authPassword: 'Пароль',
  authSubmit: 'Войти',
  authLoading: 'Загрузка…',
  authMachines: 'Машины',
  authMachinesDisabledHint: 'Адрес CRM не задан (VITE_MACHINES_CRM_URL)',
  suTitle: 'Пользователи системы',
  suSubtitle: 'Сотрудники с доступом и правами',
  suAddTitle: 'Новый пользователь',
  suFullName: 'Ф.И.О.',
  suLoginOrPhone: 'Логин или телефон',
  suPassword: 'Пароль',
  suRole: 'Должность',
  suRoleAdmin: 'Админ',
  suRoleDirector: 'Директор',
  suRoleAccountant: 'Бухгалтер',
  suRoleOperator: 'Оператор',
  suRoleCustom: 'Другое',
  suCustomLabel: 'Название должности',
  suSavedPositionsTitle: 'Дополнительные должности',
  suSavedPositionsHint: 'Добавьте в список — они появятся в выборе должности; их можно удалить позже.',
  suAddPositionPlaceholder: 'Название новой должности',
  suRoleDeleteExplain:
    'Админ, директор, бухгалтер, оператор и «Другое» — системные должности; их нельзя удалить из списка. Удалять можно только дополнительные должности, которые вы добавите ниже.',
  suPermissionsHint: 'Доступ к разделам и функциям',
  suCreateBtn: 'Добавить',
  suListTitle: 'Пользователи',
  suColName: 'Имя',
  suColLogin: 'Вход',
  suColRole: 'Роль',
  suColPerms: 'Права',
  suSuccess: 'Сохранено',
  suDelete: 'Удалить',
  suEdit: 'Изменить',
  suUpdateUserTitle: 'Изменить пользователя',
  suPasswordOptionalHint: 'Оставьте пустым, чтобы не менять пароль.',
  suPasswordMinLength: 'Пароль не короче 6 символов.',
  suCancelEdit: 'Отмена',
  suPermViewDashboard: 'Панель',
  suPermViewShift: 'Смены (просмотр)',
  suPermManageShiftWorkers: 'Работники в смене',
  suPermViewRawMaterial: 'Сырьё',
  suPermViewWarehouse: 'Склад',
  suPermViewSales: 'Продажи',
  suPermViewExpenses: 'Расходы',
  suPermViewPayroll: 'Зарплата / сотрудники',
  suPermViewVedomost: 'Ведомость (просмотр)',
  suPermCreateVedomost: 'Создание ведомости',
  suPermViewReports: 'Отчёты',
  suPermManageSettings: 'Настройки',
  suPermManageUsers: 'Управление пользователями',
  layoutLogout: 'Выход',

  dfTitle: 'Период',
  dfToday: 'Сегодня',
  dfWeek: 'Эта неделя',
  dfMonth: 'Этот месяц',
  dfAll: 'Все время',
  dfFrom: 'С',
  dfTo: 'По',
  dfApply: 'Применить',
  dfShowing: 'Отображается:',
  dfAllTime: 'Всё время',

  btnAdd: 'Добавить',
  btnSave: 'Сохранить',
  btnCancel: 'Отмена',
  btnConfirm: 'Подтвердить',
  btnProduce: 'Произвести',
  btnSell: 'Подтвердить продажу',
  btnAddExpense: 'Добавить расход',
  labelDate: 'Дата',
  labelAmount: 'Количество',
  labelPrice: 'Цена (шт)',
  labelTotal: 'Итого',
  labelPaid: 'Оплачено',
  labelDebt: 'Долг',
  labelDesc: 'Примечание',
  labelType: 'Тип',
  labelName: 'Имя',
  labelPhone: 'Телефон',
  labelMachine: 'Аппарат',
  labelHours: 'Часы работы',
  labelPower: 'Мощность (кВт)',
  labelBankAccount: 'Расчётный счёт',
  labelBankName: 'Название банка',
  unitKg: 'кг',
  unitTon: 'тонна',
  unitPiece: 'шт',
  unitSum: 'сум',
  statusLow: 'Мало!',
  statusCritical: 'Критично!',
  statusOk: 'Хорошо',
  statusActive: 'Активен',
  successAdded: 'Успешно добавлено!',
  colDate: 'Дата',
  colType: 'Тип',
  colAmount: 'Количество',
  colNote: 'Примечание',
  colQty: 'Количество',
  colMachine: 'Аппарат',
  colTotal: 'Итого',
  colPaid: 'Оплачено',
  colDebt: 'Долг',
  colClient: 'Клиент',
  colProduct: 'Продукт',
  colPrice: 'Цена',
  totalRecords: 'записей',
  noData: 'Данные не найдены',
  rmActiveBagTitle: 'Активный мешок',
  rmActiveBagSubtitle: 'Состояние текущего мешка, подключенного к аппарату',
  rmNoActiveBag: 'Сейчас нет активного мешка',
  rmCreateBagTitle: 'Создать новый мешок',
  rmCreateBagButton: 'Создать мешок',
  rmBagCreateError: 'Заполните сырьё и количество для мешка',
  rmBagCreatedSuccess: 'Мешок успешно создан',
  rmBagConnectTitle: 'Подключить мешок',
  rmBagConnectButton: 'Подключить мешок',
  rmBagConnectError: 'Мешок для подключения не выбран',
  rmBagConnectedSuccess: 'Мешок подключен к аппарату',
  rmBagSwitchTitle: 'Заменить мешок',
  rmBagSwitchButton: 'Заменить',
  rmBagSwitchError: 'Новый мешок не выбран',
  rmBagSwitchedSuccess: 'Мешок заменён',
  rmBagSwitchReturn: 'Вернуть остаток на склад',
  rmBagSwitchWriteoff: 'Списать остаток',
  rmBagWriteoffTitle: 'Списать мешок',
  rmBagWriteoffButton: 'Списать',
  rmBagWriteoffError: 'Нет активного мешка для списания',
  rmBagWrittenOffSuccess: 'Мешок списан',
  rmBagsTitle: 'Список мешков',
  rmBagLogsTitle: 'История мешков',
  rmBagInitial: 'Начальное количество',
  rmBagRemaining: 'Текущий остаток',
  rmBagConnectedAt: 'Время подключения',
  rmBagProgress: 'Прогресс заполнения',
  rmBagRawMaterial: 'Тип сырья',
  rmBagSelectRawMaterial: 'Выберите сырьё',
  rmBagSelect: 'Выберите мешок',
  rmBagSelectReplacement: 'Выберите мешок для замены',
  rmBagName: 'Название мешка',
  rmBagNamePlaceholder: 'Например: Мешок 1',
  rmBagReasonPlaceholder: 'Причина (необязательно)',
  rmBagStatusStorage: 'На складе',
  rmBagStatusConnected: 'Активен',
  rmBagStatusDepleted: 'Закончился',
  rmBagStatusWrittenOff: 'Списан',
  rmQuickConsumeTitle: 'Быстрый ввод расхода',
  rmQuickConsumePieces: 'Количество штук',
  rmQuickConsumeGram: 'Грамм',
  rmQuickConsumeDirectKg: 'Прямой ввод в кг',
  rmQuickConsumeNote: 'Примечание к расходу',
  rmQuickConsumeResult: 'Рассчитанный расход',
  rmQuickConsumeButton: 'Сохранить расход',
  rmQuickConsumeError: 'Введите количество расхода',
  rmQuickConsumeSuccess: 'Расход успешно сохранён',
  rmLogCreated: 'Создан',
  rmLogConnected: 'Подключён',
  rmLogDisconnected: 'Отключён',
  rmLogReturned: 'Возвращён на склад',
  rmLogConsumed: 'Израсходован',
  rmLogDepleted: 'Закончился',
  rmLogWrittenOff: 'Списан',
  rmNoLogNote: 'Без примечания',
  rmCreateTypeTitle: 'Создать тип сырья',
  rmCreateTypeButton: 'Сохранить тип сырья',
  rmCreateTypePlaceholder: 'Например: PET 9921',
  rmCreateTypeDescPlaceholder: 'Краткое описание сырья',
  rmCreateNameRequired: 'Название сырья обязательно',
  rmCreateError: 'Произошла ошибка при создании типа сырья',
  rmCreatedSuccess: 'Тип сырья успешно создан',
  rmSelectRawMaterialRequired: 'Сначала создайте хотя бы один тип сырья',
  rmDefaultIncomingNote: 'Поступление сырья',
  rmIncomingHint: 'Поступление будет записано на первый созданный тип сырья',

  dashTitle: 'Панель управления производством',
  dashSubtitle: 'Данные в реальном времени',
  dashSystemActive: 'Система активна',
  dashLowAlert: 'Количество сырья критически мало!',
  dashLowDesc: 'Закажите новое сырьё',
  dashKpiMaterial: 'Остаток сырья',
  dashKpiSemi: 'Склад заготовок',
  dashKpiFinal: 'Склад бутылок',
  dashKpiTodayProd: 'Производство сегодня',
  dashKpiTodaySales: 'Продажи сегодня',
  dashChartProd: 'Тренд производства',
  dashChartLast7: 'Последние 7 дней',
  dashChartMaterial: 'Движение сырья',
  dashChartKg: 'кг',
  dashStockTitle: 'Состояние склада',
  dashActivityTitle: 'Последние операции',
  dashOrderMaterial: 'Закажите сырьё!',
  dashTodayDate: 'Пятница, 3 апреля 2026',
  dashMaterialInWarehouse: '% на складе',
  dashCbuTitle: 'Курс Центрального банка',
  dashCbuSource: 'Центральный банк РУз',
  dashCbuFetchError: 'Курс не загрузился. Проверьте интернет.',
  dashCbuRetry: 'Повторить',
  dashCbuRefresh: 'Обновить',
  dashCbuChangeToday: 'сегодня',

  rmTitle: 'Управление сырьём (Сиро)',
  rmTotalIn: 'Всего поступило',
  rmTotalOut: 'Всего использовано',
  rmRemaining: 'Остаток сырья',
  rmStockLevel: 'Заполненность склада',
  rmNewEntry: 'Новое поступление сырья',
  rmAddBtn: 'Добавить на склад',
  rmHistory: 'История движения сырья',
  rmIncoming: '↓ Поступило',
  rmOutgoing: '↑ Использовано',
  rmBalance: 'Текущий остаток',
  rmPlaceholderDesc: 'Поступление ПЭТ сырья...',
  rmPreviewAdd: 'Будет добавлено на склад:',
  rmPreviewBalance: 'Новый остаток:',
  rmCapacity: 'Ёмкость склада',
  rmCritical: 'Критично: 500 кг',
  rmWarning: 'Предупреждение: 1000 кг',

  spTitle: 'Производство заготовок (Қолип)',
  sp18gStock: '18г Заготовок (на складе)',
  sp20gStock: '20г Заготовок (на складе)',
  spRawRemaining: 'Остаток сырья',
  spFormTitle: 'Производство заготовок',
  spTypeLabel: 'Тип заготовки',
  spMachineLabel: 'Аппарат',
  spQtyLabel: 'Количество (шт)',
  spCalcTitle: '⚙️ Автоматический расчёт:',
  spCalcPer: 'На одну заготовку:',
  spCalcNeeded: 'Нужно сырья:',
  spCalcAfter: 'После использования:',
  spCalcRemains: 'останется',
  spNoRaw: 'Недостаточно сырья!',
  spHistory: 'История производства',
  spTotal18: 'Всего 18г:',
  spTotal20: 'Всего 20г:',
  spColRaw: 'Расход сырья',

  fpTitle: 'Производство бутылок (Баклажка)',
  fpFlowTitle: 'Производственный процесс',
  fpFormTitle: 'Производство бутылок',
  fpTypeLabel: 'Тип продука',
  fpSemiLabel: 'Тип заготовки (для использования)',
  fpQtyLabel: 'Количество (шт)',
  fpCalcTitle: '⚙️ Расходуемые заготовки:',
  fpCalcNeeded: 'Нужно заготовок:',
  fpCalcAvailable: 'Доступно',
  fpCalcAfter: 'После использования:',
  fpCalcRemains: 'шт останется',
  fpNoSemi: 'Недостаточно заготовок!',
  fpHistory: 'История производства бутылок',
  fpBatches: 'партий',
  fpColUsed: 'Использовано заготовок',

  whTitle: 'Склад',
  whMaterial: 'ПЭТ Сырьё',
  whSemi: 'Полуфабрикат (заготовка)',
  whFinal: 'Готовый продукт (бутылка)',
  whTotalProd: 'Всего продукции',
  whInWarehouse: 'На складе',
  whDetailed: 'Подробное состояние склада',
  whStockBreakdownEmpty:
    'Здесь отображаются только позиции по типам из каталога. Сначала добавьте продукт.',
  whSemiStats: 'Статистика заготовок',
  whFinalStats: 'Статистика бутылок',
  whProduced: 'Всего произведено',
  whUsedInFinal: 'Использовано для бутылок',
  whSold: 'Продано',
  whRemaining: 'Остаток на складе',
  whByType: 'По категориям:',
  whUnit: 'Единица',
  whWeightGram: 'Вес (грамм)',
  whVolumeLiter: 'Объём (литр)',
  whProductsList: 'Список продуктов',
  whCreatedAt: 'Дата создания',
  whCreatedBy: 'Создал',
  whUpdatedBy: 'Обновил',
  whEdit: 'Изменить',
  whNoProducts: 'Продукты пока отсутствуют',
  whAddProduct: 'Добавить продукт',
  whManageReadOnly: 'У вас есть только право просмотра',
  whDeleteTitle: 'Удаление продукта',
  whDeleteConfirm: 'Вы действительно хотите удалить этот продукт?',
  whDeleteAction: 'Да, удалить',
  whProductAdded: 'Продукт успешно добавлен',
  whProductUpdated: 'Продукт успешно обновлён',
  whProductDeleted: 'Продукт успешно удалён',
  whProductType: 'Тип продукта',
  whNameRequired: 'Название продукта обязательно',
  whMetricRequired: 'Корректно заполните поле объёма или веса',
  whRequestError: 'Произошла ошибка при операции с продуктом',
  whErrDeleteStockRemains:
    'На складе есть остаток. Сначала обнулите остаток, затем удалите.',
  whErrDeleteRawBags:
    'Есть мешки, привязанные к этому сырью. Сначала закройте мешки или переключите на другой тип.',
  whSemi18Label: 'Заготовка 18g',
  whSemi20Label: 'Заготовка 20g',
  whFinal05Label: '0.5L',
  whFinal1Label: '1L',
  whFinal5Label: '5L',
  whMaxLabel: 'Макс',
  whDrawerCreateTitle: 'Новый продукт',
  whDrawerCreateDescription: 'Добавьте полуфабрикат или готовый продукт',
  whDrawerEditTitle: 'Редактирование продукта',
  whDrawerEditDescription: 'Обновите продукт и его связи',
  whIngredientsTitle: 'Состав сырья',
  whIngredientsSubtitle: 'Укажите граммовку для каждого сырья',
  whIngredientsShort: 'ингр.',
  whSemiShort: 'заг.',
  whMachinesShort: 'апп.',
  whAddIngredient: 'Добавить сырьё',
  whRemoveIngredient: 'Удалить строку',
  whSelectRawMaterial: 'Выберите сырьё',
  whAmountGram: 'Количество (грамм)',
  whAmountGramRequired: 'Укажите положительное количество грамм для каждого сырья',
  whRawMaterialRequired: 'Нужно выбрать хотя бы одно сырьё',
  whNoRawMaterials: 'Список сырья пуст',
  whSemiSelectionTitle: 'Полуфабрикаты',
  whSemiProductRequired: 'Нужно выбрать хотя бы один полуфабрикат',
  whNoSemiProducts: 'Полуфабрикаты не найдены',
  whMachineSelectionTitle: 'Аппараты',
  whMachineRequired: 'Нужно выбрать хотя бы один аппарат',
  whNoMachines: 'Аппараты не найдены',
  whRawMaterialListTitle: 'Типы сырья на складе',
  whIncludedInWarehouse: 'Отображается на складе',

  slTitle: 'Продажи',
  slTotalRevenue: 'Общий объём продаж',
  slTotalPaid: 'Оплачено',
  slTotalDebt: 'Общий долг',
  slOperations: 'операций',
  slPaidPercent: '% оплачено',
  slHasDebt: 'клиент(ов) в долге',
  slTabNew: 'Новая продажа',
  slTabClients: 'Клиенты',
  slTabHistory: 'История продаж',
  slFormTitle: 'Оформить продажу',
  slCategory: 'Категория продукта',
  slSemiCat: 'Полуфабрикат (заготовки)',
  slFinalCat: 'Готовый продукт (бутылки)',
  slProductType: 'Тип продукта',
  slNoCatalogProducts:
    'В каталоге нет товаров для продажи. Сначала добавьте продукт на «Складе».',
  slAvailableStock: 'доступно',
  slAvailableProducts: 'Доступные продукты',
  slNewClient: 'Новый клиент',
  slClientList: 'Список киентов',
  slDebtPaid: 'Расчёт произведён',
  slBtn: 'Подтвердить продажу',
  slAddToCart: 'Добавить в корзину',
  slCart: 'Корзина',
  slCartEmpty: 'Корзина пуста',
  slAddItem: 'Добавить товар',
  slOrderItems: 'Товары в заказе',
  slMixedProducts: 'Смешанные товары',
  slRemoveItem: 'Удалить товар',

  exTitle: 'Расходы',
  exElectricity: 'Электроэнергия',
  exCaps: 'Крышки',
  exPackaging: 'Упаковка',
  exOther: 'Прочее',
  exTotalLabel: 'Общие расходы:',
  exFormTitle: 'Добавить расход',
  exCalcTitle: '⚡ Расчёт:',
  exKwh: 'Расход кВт·ч:',
  exPricePerKwh: 'Цена (кВт·ч)',
  exBtn: 'Добавить расход',
  exHistory: 'История расходов',
  exColAmount: 'Сумма',

  repTitle: 'Отчёты',
  repRevenue: 'Общий доход',
  repExpenses: 'Общие расходы',
  repProfit: 'Чистая прибыль (прибл.)',
  repRawEff: 'Эффективность сырья',
  repTabProduction: 'Производство',
  repTabEfficiency: 'Эффективность',
  repTabSales: 'Продажи',
  repTabMaterial: 'Анализ сырья',
  repProdTitle: 'Производство (последние 7 дней)',
  repEffTitle: 'Эффективность аппаратов',
  repEffFormula: 'Формула: (Фактическое / Максимальное) × 100%',
  repEffActual: 'Фактически:',
  repEffMax: 'Максимально:',
  repRawTitle: 'Эффективность использования сырья',
  repRawIn: 'Всего поступило',
  repRawOut: 'Использовано',
  repRawEffLabel: 'Эффективность использования',
  repSalesTitle: 'Тренд продаж (последние 7 дней, тыс. сум)',
  repClientsTitle: 'Продажи по клиентам',
  repMatTitle: 'Движение сырья (последние 7 дней, кг)',
  repMatTable: 'Таблица движения сырья',
  repSemiDist: 'Распределение заготовок',
  repFinalDist: 'Распределение бутылок',

  layoutSystem: 'Lider Plast',
  layoutMaterialLow: 'Сырьё заканчивается!',
  layoutAdmin: 'Lider Plast',
  layoutSiroRemaining: 'Остаток сырья',

  // Client Detail
  cdBack: 'Назад',
  cdInfo: 'Информация',
  cdSales: 'Продажи',
  cdPayments: 'Платежи',
  cdAkt: 'АКТ Сверки',
  cdTotalPurchases: 'Всего покупок',
  cdCreatedAt: 'Зарегистри��ован',
  cdDebt: 'Долг',
  cdNoSales: 'Продажи для этого клиента отсутствуют',
  cdBankInfo: 'Банковские реквизиты',
  cdContactInfo: 'Контактная информация',

  // AKT Sverka
  aktTitle: 'АКТ Сверки',
  aktGenerate: 'Сформировать АКТ',
  aktDownloadPdf: 'Скачать PDF',
  aktOpeningBalance: 'Входящий остаток',
  aktTotalSales: 'Всего продаж',
  aktTotalPayments: 'Всего платежей',
  aktClosingBalance: 'Исходящий остаток',
  aktDate: 'Дата',
  aktDocType: 'Тип документа',
  aktDocNum: 'Документ №',
  aktDebit: 'Дебет',
  aktCredit: 'Кредит',
  aktBalance: 'Остаток',
  aktSaleType: 'Продажа',
  aktPaymentType: 'Оплата',
  aktEmpty: 'За указанный период документы не найдены',
  aktPeriod: 'Период',
  aktGenerating: 'Формируется...',
  aktCompany: 'Предприятие',
  aktSignature: 'Подписи',
  aktDirectorSig: 'Подпись директора',
  aktClientSig: 'Подпись клиента',
  aktAccountant: 'Бухгалтер',
  aktFilter: 'Фильтр',
  aktFilterAll: 'Все',
  aktFilterToday: 'Сегодня',
  aktFilterWeek: 'Неделя',
  aktFilterMonth: 'Месяц',
  aktRowOpening: 'Входящий остаток',
  aktRowClosing: 'Исходящий остаток',
  aktTotal: 'Итого',

  // Payments tab
  pmAddPayment: 'Добавить платёж',
  pmAmount: 'Сумма',
  pmDesc: 'Примечание',
  pmHistory: 'История платежей',
  pmNoPayments: 'Платежи отсутствуют',
  pmDate: 'Дата',
  pmAddSuccess: 'Платёж успешно добавлен!',
  pmDeleteConfirm: 'Подтвердите удаление платежа?',

  navPayroll: 'Бухгалтерия',
  prTitle: 'Бухгалтерия',
  prTabVedomost: 'Ведомость',
  prTabBank: 'Банк',
  prTabEmployees: 'Сотрудники',
  prTabProduction: 'Выработка',
  prTabSettings: 'Налоговые ставки',
  prGenerate: 'Сформировать ведомость',
  prMonth: 'Месяц',
  prFullName: 'Ф.И.О.',
  prPosition: 'Должность',
  prCardNumber: 'Номер карты',
  prStir: 'СТИР',
  prSalaryType: 'Тип оклада',
  prFixed: 'Фиксированный',
  prPerPiece: 'Сдельный',
  prHybrid: 'Смешанный',
  prAklad: 'Оклад',
  prSalaryAmount: 'Сумма оклада',
  prProducedQty: 'Выработка (шт)',
  prProductionAmt: 'Сумма выработки',
  prBonus: 'Премия',
  prBrutto: 'Брутто (итого)',
  prIncomeTax: 'Подоходный налог',
  prNps: 'НПФГ',
  prSocialTax: 'Социальный налог',
  prNet: 'НЕТ (на руки)',
  prStatusLabel: 'Статус',
  prPaid: 'Выплачено',
  prUnpaid: 'Не выплачено',
  prMarkPaid: 'Отметить выплаченным',
  prMarkUnpaid: 'Отменить',
  prExportCsv: 'Экспорт CSV',
  prPrint: 'Печать',
  prIncomeTaxPct: 'Подоходный налог (%)',
  prSocialTaxPct: 'Социальный налог (%)',
  prNpsPct: 'НПФГ (%)',
  prAddEmployee: 'Добавить сотрудника',
  prEditEmployee: 'Изменить данные сотрудника',
  prEmployeeRates: 'Ставка по продукту',
  prRateType: 'Тип ставки',
  prRateFixed: 'Сумма',
  prRatePercent: 'Процент',
  prRateValue: 'Ставка',
  prRateBaseAmount: 'Базовая сумма',
  prNoEmployeeRates: 'Для этого сотрудника ставки по продуктам ещё не заданы.',
  prRateConfiguredHint: 'Ставка задана в бухгалтерии',
  prDeleteEmployeeTitle: 'Удалить сотрудника',
  prDeleteEmployeeConfirm: 'Подтвердите удаление сотрудника "{name}"?',
  prDeleteEmployeeAction: 'Да, удалить',
  prWorkedDays: 'Рабочих дней',
  prPricePerUnit: 'Цена (шт)',
  prProductType: 'Тип продукта',
  prAddProduction: 'Добавить выработку',
  prEmployee: 'Сотрудник',
  prNoEmployees: 'Список сотрудников пуст',
  prNoVedomost: 'Ведомость не сформирована. Нажмите "Сформировать ведомость".',
  prTotalBrutto: 'Итого брутто',
  prTotalNet: 'Итого нет',
  prTotalTax: 'Итого налоги',
  prSaveSettings: 'Сохранить',
  prSettingsTitle: 'Налоговые ставки',

  // Payroll – new keys (NET formula, file upload)
  prTaxNotDeducted: 'Рассчитывается, но не вычитается из НЕТ',
  prNetFormula: 'НЕТ = Брутто − Подоходный налог',
  prUploadFile: 'Загрузить файл оплаты',
  prFileUploaded: 'Файл загружен — статус всех сотрудников изменён на «Выдано»',
  prBulkGiven: 'Отметить всех как «Выдано»',
  prIncomeTaxOnly: 'Только подоходный налог вычитается',
  prNpsNote: 'НПС — не вычитается',
  prSocialNote: 'Соц. налог — не вычитается',
  prBankUploadTitle: 'Загрузка оборотки',
  prBankUploadHint: 'Автоматически читается первый лист',
  prBankUploadAction: 'Выбрать .xlsx файл',
  prBankUploadSuccess: 'Файл оборотки успешно загружен',
  prBankUploadDate: 'Дата загрузки',
  prBankUploadedBy: 'Загрузил',
  prBankStatusDraft: 'Черновик',
  prBankStatusParsed: 'Обработано',
  prBankStatusConfirmed: 'Подтверждено',
  prBankStatusRejected: 'Отклонено',
  prBankVedomostList: 'Банковские ведомости',
  prBankNoVedomost: 'Банковские ведомости пока отсутствуют',
  prBankTransactions: 'Транзакции',
  prBankNoTransactions: 'Транзакции не найдены',
  prBankNoSelection: 'Ведомость не выбрана',
  prBankIncome: 'Приход',
  prBankExpense: 'Расход',
  prBankDocNumber: 'Номер документа',
  prBankReceiver: 'Получатель',
  prBankPurpose: 'Назначение платежа',
  prBankMatched: 'Связано с зарплатой',
  prBankUnmatched: 'Не связано',
  prBankSalarySummary: 'Сверка зарплаты',
  prBankSalarySummaryHint: 'По сумме нетто и банковским выплатам',
  prBankRequired: 'Требуется',
  prBankPaid: 'Оплачено',
  prBankRemaining: 'Остаток',
  prBankTotalVedomost: 'Всего ведомостей',
  prBankSalaryMatched: 'Совпавшие зарплатные выплаты',
  prBankSelected: 'Расход по выбранной',
  prBankWarningTitle: 'Есть переводы, которых нет в системе',
  prBankWarningDesc: 'Если не добавить их как клиента или сотрудника, в учёте движений денег и последующей сверке останутся расхождения.',
  prBankUnknownClients: 'неизвестных клиентов',
  prBankUnknownEmployees: 'неизвестных сотрудников',
  prBankUnknownClientsDesc: 'Обнаружены входящие платежи от клиентов, которых нет в системе.',
  prBankUnknownEmployeesDesc: 'Обнаружены зарплатные платежи сотрудникам, которых нет в системе.',
  prBankAddClient: 'Добавить клиента',
  prBankAddEmployee: 'Добавить сотрудника',
  prBankCreateClientTitle: 'Добавить клиента в систему',
  prBankCreateClientDesc: 'Добавить этого отправителя платежа как клиента?',
  prBankCreateEmployeeTitle: 'Добавить сотрудника в систему',
  prBankCreateEmployeeDesc: 'Добавить этого получателя как сотрудника?',
  prBankCreateWarning: 'Если отказаться, перевод останется не связанным с клиентом/сотрудником и это может вызвать ошибки или расхождения в отчётах и сверке.',
  prBankRejectedTitle: 'Импорт файла не выполнен',
  prBankRejectedExplain:
    'Выписка не была разобрана в ожидаемом формате или при сохранении произошла ошибка. Транзакции в базу не записаны — поэтому список пуст. Если в сообщении есть «database» или «schema», разработчику нужно выполнить `prisma db push`.',
  prBankRejectedEmptyTx: 'У отклонённой ведомости нет транзакций.',
  prBankTechnicalDetails: 'Технические подробности (по желанию)',
};

export const translations: Record<Language, T> = {
  uz_cyrillic,
  uz_latin,
  ru,
};