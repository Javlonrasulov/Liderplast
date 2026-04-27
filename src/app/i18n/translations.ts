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
  /** Sidebar Ombor dropdown — qisqa bola yorliqlari */
  whSidebarRaw: string;
  whSidebarSemi: string;
  whSidebarFinal: string;
  navSales: string;
  navExpenses: string;
  navReports: string;
  navShifts: string;
  /** Smena: ortiqcha siro sub-sahifa */
  navShiftOverConsumption: string;
  poOverTitle: string;
  poOverSubtitle: string;
  poOverAggTitle: string;
  poOverAggHint: string;
  poOverDetailTitle: string;
  poOverColProduct: string;
  poOverColRaw: string;
  poOverColCases: string;
  poOverColSumExtra: string;
  poOverColAvgOverPct: string;
  poOverColMaxPct: string;
  poOverColWhen: string;
  poOverColWorker: string;
  poOverColMachine: string;
  poOverColGood: string;
  poOverColDefect: string;
  poOverColPlanned: string;
  poOverColActual: string;
  poOverColExtra: string;
  poOverColOverPct: string;
  poOverEmpty: string;
  poOverLinkFromShift: string;
  poOverBackToShift: string;
  navSystemUsers: string;
  navInventory: string;

  // Auth (login)
  authTitle: string;
  authSubtitle: string;
  authIdentifier: string;
  authPassword: string;
  authSubmit: string;
  authLoading: string;
  authMachines: string;
  authMachinesDisabledHint: string;
  authShowPassword: string;
  authHidePassword: string;

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
  suPermViewRawMaterialBags: string;
  suPermManageRawMaterialBags: string;
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

  /** Смена сақлаш — backend `ERR::` кодлари (омбор / ретсепт) */
  apiShiftProductTypeRequired: string;
  apiShiftMachineRequired: string;
  apiShiftSemiNotFound: string;
  apiShiftRawInsufficient: string;
  apiShiftSemiBalanceMissing: string;
  apiShiftFinishedNotFound: string;
  apiShiftMachineNotLinked: string;
  apiShiftFinishedNoSemiRecipe: string;
  apiShiftInsufficientSemiStock: string;
  apiShiftFinishedBalanceMissing: string;
  apiShiftRawOverrideUnknown: string;
  apiShiftRawActualInvalid: string;
  apiShiftRawOverrideSemiOnly: string;

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
  /** Ишлаб чиқариш трэнди: ярим тайёр қолип */
  dashProdYarimTayyor: string;
  /** Тайёр маҳсулот (бакалашка) */
  dashProdTayyor: string;
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
  /** Kraska bo‘limidagi қолдиқ картаси учун */
  rmRemainingPaint: string;
  rmStockLevel: string;
  rmNewEntry: string;
  rmIncomingTitleSiro: string;
  rmIncomingTitlePaint: string;
  rmIncomingTabSiro: string;
  rmIncomingTabPaint: string;
  rmIncomingHintPaint: string;
  rmPlaceholderDescPaint: string;
  rmMetricsCaptionSiro: string;
  rmMetricsCaptionPaint: string;
  rmAlertsTitlePaint: string;
  rmAlertsSubtitlePaint: string;
  rmSelectPaintRequired: string;
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
  /** Фаол қопда қолдиқ бор — улашдан олдин танлов */
  rmBagConnectPrevHint: string;
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
  /** Рўйхатда фақат аппаратга уланган қоп — бўшда */
  rmBagsListNoConnected: string;
  /** Омбордаги / бошқа ҳолатдаги қоплар — босилса очiladi */
  rmBagsListOtherTitle: string;
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
  /** Қоп тарихи — backend `note` (инглизча) таржимаси; `{reason}`, `{name}` */
  rmBagLogNoteConnectedAfterSwitch: string;
  rmBagLogNoteConnectedToMachine: string;
  rmBagLogNoteConnectedReplacement: string;
  rmBagLogNoteDisconnected: string;
  rmBagLogNoteDisconnectedTpl: string;
  rmBagLogNoteDisconnectedBeforeWriteoff: string;
  rmBagLogNoteWrittenOff: string;
  rmBagLogNoteWrittenOffTpl: string;
  rmBagLogNoteWrittenOffAfterDisconnect: string;
  rmBagLogNoteReturnedToWarehouse: string;
  rmBagLogNoteDepleted: string;
  rmBagLogNoteQuickConsume: string;
  rmBagLogNoteMaterialConsumed: string;
  rmBagLogNoteShiftRecipeSiro: string;
  rmBagLogNoteShiftRecipeSiroBag: string;
  rmBagLogNoteShiftProduction: string;
  rmBagLogNoteShiftSemiForFinal: string;
  rmBagLogNoteShiftPaint: string;
  rmBagLogNoteShiftPaintBag: string;
  rmBagLogNoteProductionConsumption: string;
  rmBagLogNoteBagCreated: string;
  rmBagLogNoteBagCreatedTpl: string;
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
  rmDefaultBagWeight: string;
  rmDefaultBagWeightPlaceholder: string;
  rmDefaultBagWeightHint: string;
  rmDefaultBagWeightRequired: string;
  rmDefaultBagWeightPreview: string;
  rmIncomingBagWeightHint: string;
  rmAutoBagPreview: string;
  rmAutoBagMissingHint: string;
  rmAlertsTitle: string;
  rmAlertsSubtitle: string;
  rmKindLabel: string;
  rmKindSiro: string;
  rmKindPaint: string;
  rmPaintHint: string;
  rmCreatePaintButton: string;
  /** Raw Material page — section headings */
  rmSectionOverview: string;
  rmSectionOverviewDesc: string;
  rmSectionAlerts: string;
  rmSectionAlertsDesc: string;
  rmSectionCreateIncoming: string;
  rmSectionCreateIncomingDesc: string;
  rmSectionLedger: string;
  rmSectionLedgerDesc: string;
  rmSectionBags: string;
  rmSectionBagsDesc: string;

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
  /** Ombor sahifasi: «умумий» таб */
  whTabOverview: string;
  /** Ombor sahifasi: «каталог» таб */
  whTabCatalog: string;
  /** Ombor sahifasi: «статистика» таб */
  whTabStats: string;
  /** Ombor sahifasi: ishlab chiqarish tarixi */
  whTabHistory: string;
  whHistoryTitle: string;
  whHistorySubtitle: string;
  whHistoryEmpty: string;
  whHistoryColWhen: string;
  whHistoryColType: string;
  whHistoryColOutput: string;
  whHistoryColQty: string;
  whHistoryColConsumed: string;
  whHistoryColSource: string;
  whHistorySourceProduction: string;
  whHistorySourceShift: string;
  whHistoryShiftShort: string;
  whHistoryTypeSemi: string;
  whHistoryTypeFinal: string;
  whHistoryKindRaw: string;
  whHistoryKindSemi: string;
  /** Смена: ретсепт (кг) — факт ортиқча */
  whHistoryPlannedKg: string;
  whHistoryExtraKg: string;
  whRecipePerPiece: string;
  whRecipePerThousand: string;
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
  whSemiBreakdownTitle: string;
  whSemiStockPieces: string;
  whRecipeRaw: string;
  whShiftPaintTotal: string;

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
  slDeleteClientTitle: string;
  slDeleteClientHint: string;
  slDeleteClientAction: string;
  slCompanyName: string;
  slDebtStatusYes: string;
  slDebtStatusNo: string;

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
  /** Тарих жадвали — to‘liq ekran */
  exHistoryFullscreenEnter: string;
  exHistoryFullscreenExit: string;
  exColAmount: string;
  exCategoriesTitle: string;
  exCategoryAdd: string;
  exCategoryName: string;
  exCategoryDelete: string;
  /** Категорияни рўйхатдан олиш (модал сарлавҳаси) */
  exCategoryDeleteTitle: string;
  exCategoryDeleteHint: string;
  /** Seeded kategoriya: buxgalteriya tashqi buyurtmasi */
  exCategoryLabelRawMaterialExternalOrder: string;
  /** Seeded kategoriya: qopdan chiqim (buyurtma emas) */
  exCategoryLabelRawMaterialBagWriteoff: string;
  exStatsByCategory: string;
  /** Категория статистикаси: жадвал / доира / устунлар */
  exStatsViewTable: string;
  exStatsViewDonut: string;
  exStatsViewBars: string;
  exStatsRank: string;
  exNoCategories: string;
  /** Diagramma va yuqori statistika barcha vaqt; tarix jadvali sana filtri bo‘yicha */
  exPageStatsNote: string;
  exNoMachinesElectric: string;
  exGlobalElectricityPriceTitle: string;
  exShiftElectricityExplain: string;
  exFromShiftBadge: string;
  /** Тарих изоҳи: ichki qop ID → «Қоп №…{suffix}» */
  exNoteBagCuidDisplay: string;
  /** Ташқи буюртма изоҳи: {kg} {currency} {amount} {rate} {uzs} {unit} */
  exNotePurchaseOrderTpl: string;
  /** «Kg narxi: X (oxirgi etib kelgan buyurtma…)» */
  exNoteKgPriceLastOrder: string;
  /** «Kg narxi: X (tashqi buyurtma, hali omborga kelmagan)» */
  exNoteKgPricePendingOrder: string;
  exNoteKgPriceMissing: string;
  /** Смена-электр: тарих қатори; {date} {n} {worker} {machine} {kwh} {price} {unit} */
  exShiftExpenseNote: string;
  /** Xarajatlar: kam ishlatiladigan kVt·soat narxi — modal tugmasi */
  exElectricityPriceButton: string;
  /** Topbar yonidagi qisqa yorliq (to‘liq matn title atributida) */
  exElectricityPriceNavShort: string;
  exElectricityPriceSaved: string;
  /** PATCH electricity-price 404 yoki «Cannot PATCH» — foydalanuvchiga tushuntirish */
  exElectricityPriceErrorEndpoint404: string;

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
  repEffNoMachines: string;
  repEffPlannedHourly: string;
  repEffActualHourly: string;
  repEffUnitPcsPerHour: string;
  repEffTotalShort: string;
  repEffLimitShort: string;
  /** {{h}} = raqam */
  repEffAssumedHours: string;
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
  prTabRawOrders: string;
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
  prRmSubtabNew: string;
  prRmSubtabHistory: string;
  prRmWeightLabel: string;
  prRmPendingAlert: string;
  prRmNoPendingOrders: string;
  prRmDaysWaitingTpl: string;
  prRmWeightUnitKg: string;
  prRmWeightUnitTon: string;
  prRmCurrencyLabel: string;
  prRmFxRateLabel: string;
  prRmFxCbuHint: string;
  prRmPricePerKgLabel: string;
  prRmPricePerKgHint: string;
  prRmTotalOrderInCurrency: string;
  prRmAmountUzsEst: string;
  prRmCostPerKg: string;
  prRmSubmitOrder: string;
  prRmOrdersHistory: string;
  prRmColOrderedAt: string;
  prRmMarkFulfilled: string;
  prRmFulfilledHint: string;
  prRmStatusPending: string;
  prRmStatusFulfilled: string;
  prRmNoOrders: string;
  rmPendingExternalOrdersTitle: string;
  rmOrderMarkArrived: string;
  rmOrderArrivedToast: string;
  rmIncomingQtyMismatchTitle: string;
  rmIncomingQtyMismatchBody: string;
  prEmployee: string;
  /** Buxgalteriya → ишчилар — фаол рўйхат */
  prEmployeesSubActive: string;
  /** Buxgalteriya → ишчилар — ишдан чиққанлар */
  prEmployeesSubFormer: string;
  prNoFormerEmployees: string;
  prNoEmployees: string;
  prNoVedomost: string;
  prTotalBrutto: string;
  prTotalNet: string;
  prTotalTax: string;
  prSaveSettings: string;
  /** Buxgalteriya — ишчи формаси сақлангандан кейин toast */
  prEmployeeSavedToast: string;
  /** Маҳсулот бўйича ставка сақлангандан кейин */
  prEmployeeRateSavedToast: string;
  /** Ставка картасидаги қалам (aria) */
  prEditEmployeeRate: string;
  /** Таҳрир режими — `{product}` ўрнида маҳсулот номи */
  prEmployeeRateEditingNotice: string;
  /** Сақлаш API хатоси */
  prEmployeeSaveError: string;
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
  prBankTechnicalDetails: string;
  prBankRejectedEmptyTx: string;
  prShiftLogTitle: string;
  /** Ишдан чиққан / архив ишчи белгиси */
  prEmployeeArchivedBadge: string;
  /** Смена бўйича энг қисқа — энг узоқ сана: `{from}`, `{to}` */
  prShiftEmploymentPeriod: string;
  prHireDateLabel: string;
  prLeaveDateLabel: string;
  /** `{label}` — filterLabel */
  prShiftLogFilterHint: string;
  prShiftLogEmpty: string;
  prShiftLogTotals: string;
  prColShift: string;
  prColDefect: string;
  prColKwh: string;
  prColPaint: string;
  prColCounter: string;
  prVedColHintDeduct: string;
  prVedColHintExempt: string;
  prVedColNetShort: string;
  prKpiLabelSocial: string;

  // Inventory page
  invTitle: string;
  invSubtitle: string;
  invStatusNotStarted: string;
  invStatusInProgress: string;
  invStatusCompleted: string;
  invExportExcel: string;
  invExportPdf: string;
  invCreateNew: string;
  invFilterTitle: string;
  invFilterDateFrom: string;
  invFilterDateTo: string;
  invFilterWarehouse: string;
  invFilterStatus: string;
  invFilterStatusAll: string;
  invFilterDocNumber: string;
  invFilterApply: string;
  invFilterReset: string;
  invDocList: string;
  invNoRecords: string;
  invColIndex: string;
  invColProduct: string;
  invColPeriodStart: string;
  invColPeriodTurnover: string;
  invColPeriodEnd: string;
  invColSystem: string;
  invColReal: string;
  invColIncoming: string;
  invColOutgoing: string;
  invColDifference: string;
  invFooterTotal: string;
  invSummaryTitle: string;
  invSummaryOpening: string;
  invSummaryTurnover: string;
  invSummaryClosing: string;
  invSummarySurplus: string;
  invSummaryShortage: string;
  invSummaryDiffTotal: string;
  invActionStart: string;
  invActionFinish: string;
  invActionDelete: string;
  invActionDeleteConfirm: string;
  invActionDeleteDescription: string;
  invConfirmFinishTitle: string;
  invConfirmFinishDescription: string;
  invStockUpdated: string;
  invDocNumberPlaceholder: string;
  invWarehouseDefault: string;
  invCategoryRaw: string;
  invCategorySemi: string;
  invCategoryFinished: string;
  invCardDocNumber: string;
  invCardDate: string;
  invCardWarehouse: string;
  invCardItems: string;
  invEmptyCatalog: string;
  invSelectRecord: string;
  invSelectHint: string;
  invToastCreated: string;
  invToastFinished: string;
  invToastDeleted: string;
  invUnitPiece: string;
  invUnitKg: string;
  invShowing: string;
  invMobileSwipeHint: string;
  invFilterRangeLabel: string;
  invStartedAt: string;
  invFinishedAt: string;
  invBack: string;
}

// ======================== UZBEK CYRILLIC ========================
const uz_cyrillic: T = {
  langName: 'Ўзбек (Кирил)',
  langShort: 'КИ',

  navDashboard: 'Бошқарув панели',
  navRawMaterial: 'Хомашё / краска',
  navSemiProduction: 'Қолип ишлаб чиқариш',
  navFinalProduction: 'Бакалашка ишлаб чиқариш',
  navWarehouse: 'Омбор',
  whSidebarRaw: 'Хом ашё',
  whSidebarSemi: 'Ярим тайёр',
  whSidebarFinal: 'Тайёр',
  navSales: 'Сотув',
  navExpenses: 'Харажатлар',
  navReports: 'Ҳисоботлар',
  navShifts: 'Ишлаб чиқариш',
  navShiftOverConsumption: 'Ортиқча хомашё',
  poOverTitle: 'Ишлаб чиқариш: ретсептдан ортиқча сиро',
  poOverSubtitle:
    'Қолип сменаларида ретсепт бўйича керак бўлганидан кўп сарфланган хомашё (масалан: 3,95 кг ўрнига 5 кг).',
  poOverAggTitle: 'Қайси маҳсулот + қайси хомашё — жами ортиқча',
  poOverAggHint:
    'Бир хил ном ва хомашё бўйича гуруҳлаштирилган; «макс %» — битта ёзувдаги энг катта меъёордан ортиқча фоиз.',
  poOverDetailTitle: 'Барча ортиқча ёзувлар (вақт, ишчи, дона, кг)',
  poOverColProduct: 'Маҳсулот',
  poOverColRaw: 'Хомашё',
  poOverColCases: 'Ёзувлар',
  poOverColSumExtra: 'Жами ортиқча, кг',
  poOverColAvgOverPct: 'Ўртача % ортиқча',
  poOverColMaxPct: 'Макс % ортиқча',
  poOverColWhen: 'Сана / вақт',
  poOverColWorker: 'Ишчи',
  poOverColMachine: 'Аппарат',
  poOverColGood: 'Тайёр (дона)',
  poOverColDefect: 'Брак',
  poOverColPlanned: 'Режа, кг',
  poOverColActual: 'Ҳақиқий, кг',
  poOverColExtra: 'Ортиқча, кг',
  poOverColOverPct: '% ортиқча',
  poOverEmpty: 'Ҳозирча ретсептдан ортиқча сиро ёзувлари йўқ (сменада «ҳақиқий кг» киритилмаган).',
  poOverLinkFromShift: 'Ортиқча хомашё рўйхати →',
  poOverBackToShift: 'Сменага қайтиш',
  navSystemUsers: 'Тизим фойдаланувчилари',
  navInventory: 'Инвентаризация',

  authTitle: 'LiderPlast ERP',
  authSubtitle: 'Тизимга кириш',
  authIdentifier: 'Телефон ёки логин',
  authPassword: 'Парол',
  authSubmit: 'Кириш',
  authLoading: 'Юкланмоқда…',
  authMachines: 'Машиналар',
  authMachinesDisabledHint: 'CRM манзили ҳозирча ўрнатилмаган (VITE_MACHINES_CRM_URL)',
  authShowPassword: 'Паролни кўрсатиш',
  authHidePassword: 'Паролни яшириш',
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
  suPermViewRawMaterialBags: 'Хомашё қоплари (кўриш)',
  suPermManageRawMaterialBags: 'Хомашё қопларини бошқариш',
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

  apiShiftProductTypeRequired: 'Маҳсулот тури киритилиши керак',
  apiShiftMachineRequired: 'Аппарат танланиши керак',
  apiShiftSemiNotFound: 'Ярим тайёр маҳсулот топилмади (ном мос келиши керак): {label}',
  apiShiftRawInsufficient: 'Хомашё омборда етарли эмас: {name}',
  apiShiftSemiBalanceMissing: 'Ярим тайёр маҳсулот учун омбор қолдиғи топилмади',
  apiShiftFinishedNotFound: 'Тайёр маҳсулот топилмади (ном мос келиши керак): {label}',
  apiShiftMachineNotLinked:
    'Бу маҳсулот ушбу аппарат билан боғланмаган (тайёр маҳсулот → аппаратлар)',
  apiShiftFinishedNoSemiRecipe: 'Тайёр маҳсулот учун ярим тайёр ретсепти йўқ',
  apiShiftInsufficientSemiStock: 'Ярим тайёр омборда етарли эмас: {name}',
  apiShiftFinishedBalanceMissing: 'Тайёр маҳсулот учун омбор қолдиғи топилмади',
  apiShiftRawOverrideUnknown:
    'Ретсептда йўқ хомашё учун ҳақиқий миқдор юборилди (ID): {id}',
  apiShiftRawActualInvalid: 'Хомашё учун ҳақиқий миқдор нотўғри: {name}',
  apiShiftRawOverrideSemiOnly:
    'Ҳақиқий хомашё (кг) фақат қолип (ярим тайёр) аппарати учун юборилади',

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
  rmBagConnectPrevHint:
    'Фаол қопда қолдиқ бор. Янги қопни улашдан олдин қолдиқни қайта ишлашни танланг:',
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
  rmBagsListNoConnected: 'Ҳозир аппаратга уланган қоп йўқ.',
  rmBagsListOtherTitle: 'Қолган қоплар',
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
  rmBagLogNoteConnectedAfterSwitch:
    'Янги қоп уланишида аввалги қоп алмаштирилган — қоп аппаратга уланди',
  rmBagLogNoteConnectedToMachine: 'Қоп аппаратга уланди',
  rmBagLogNoteConnectedReplacement: 'Қоп алмаштириш: янги қоп аппаратга уланди',
  rmBagLogNoteDisconnected: 'Қоп узилди',
  rmBagLogNoteDisconnectedTpl: 'Қоп узилди · {reason}',
  rmBagLogNoteDisconnectedBeforeWriteoff: 'Чиқимга чиқаришдан олдин қоп узилди',
  rmBagLogNoteWrittenOff: 'Қоп чиқимга чиқарилди',
  rmBagLogNoteWrittenOffTpl: 'Чиқимга чиқарилди · {reason}',
  rmBagLogNoteWrittenOffAfterDisconnect: 'Узилгандан кейин қолдиқ чиқимга чиқарилди',
  rmBagLogNoteReturnedToWarehouse: 'Узилгандан кейин қоп омборга қайтарилди',
  rmBagLogNoteDepleted: 'Қоп тўгаган',
  rmBagLogNoteQuickConsume: 'Қопдан тезкор сарф',
  rmBagLogNoteMaterialConsumed: 'Фаол қопдан материал сарфланди',
  rmBagLogNoteShiftRecipeSiro: 'Смена: ретсепт бўйича хомашё сарфи',
  rmBagLogNoteShiftRecipeSiroBag: 'Смена: ретсепт бўйича хомашё сарфи (уланган қоп)',
  rmBagLogNoteShiftProduction: 'Смена: ишлаб чиқариш',
  rmBagLogNoteShiftSemiForFinal: 'Смена: тайёр маҳсулот учун ярим тайёр сарфи',
  rmBagLogNoteShiftPaint: 'Смена: краска/бўёқ сарфи',
  rmBagLogNoteShiftPaintBag: 'Смена: краска/бўёқ сарфи (уланган қоп)',
  rmBagLogNoteProductionConsumption: 'Ишлаб чиқариш сарфи',
  rmBagLogNoteBagCreated: 'Қоп яратилди',
  rmBagLogNoteBagCreatedTpl: 'Қоп яратилди · {name}',
  rmCreateTypeTitle: 'Янги хомашё яратиш',
  rmCreateTypeButton: 'Хомашёни сақлаш',
  rmCreateTypePlaceholder: 'Масалан: PET 9921',
  rmCreateTypeDescPlaceholder: 'Хомашё ҳақида қисқача изоҳ',
  rmCreateNameRequired: 'Хомашё номи мажбурий',
  rmCreateError: 'Хомашёни яратишда хатолик юз берди',
  rmCreatedSuccess: 'Хомашё муваффақиятли яратилди',
  rmSelectRawMaterialRequired: 'Аввал камида битта хомашё яратинг',
  rmDefaultIncomingNote: 'Хомашё кирими',
  rmIncomingHint: 'Кирим танланган хомашёга ёзилади',
  rmDefaultBagWeight: 'Бир қопдаги миқдор',
  rmDefaultBagWeightPlaceholder: 'Кг да киритинг, масалан: 25',
  rmDefaultBagWeightHint: 'Киримда автоматик қоплар шу миқдор бўйича яратилади',
  rmDefaultBagWeightRequired: 'Бир қопдаги миқдорни киритинг',
  rmDefaultBagWeightPreview: 'Ҳар бир янги қоп: {weight} кг',
  rmIncomingBagWeightHint: 'Авто қоп яратиш: ҳар бир қоп {weight} {unit}',
  rmAutoBagPreview: 'Киримдан кейин автоматик {count} қоп яратилади. Одатий қоп: {weight} кг, охиргиси: {lastWeight} кг',
  rmAutoBagMissingHint: 'Авто қоп учун каталогда «бир қопдаги миқдор» белгиланмаган — бу хомашё учун',
  rmAlertsTitle: 'Хомашё бўйича огоҳлантириш',
  rmAlertsSubtitle: 'Ҳар бир хомашё қолдиғи алоҳида назорат қилинади',
  rmKindLabel: 'Хомашё тури',
  rmKindSiro: 'PET / оддий хомашё',
  rmKindPaint: 'Краска / бўёқ',
  rmPaintHint:
    'Турни «краска» деб белгиланг — сменада фақат шу турдаги позициялар танланади.',
  rmCreatePaintButton: 'Краскани сақлаш',
  rmSectionOverview: 'Умумий кўрсаткичлар',
  rmSectionOverviewDesc: 'PET хомашё ва краска бўйича кирим, сарф ва қолдиқ',
  rmSectionAlerts: 'Огоҳлантиришлар',
  rmSectionAlertsDesc: 'Кам қолдиқ бўйича турлар',
  rmSectionCreateIncoming: 'Каталог ва омборга кирим',
  rmSectionCreateIncomingDesc: 'Янги хомашё тури ёки миқдорни рўйхатга қўшиш',
  rmSectionLedger: 'Харакатлар журнали',
  rmSectionLedgerDesc: 'Кирим ва сарф ёзувлари',
  rmSectionBags: 'Қоплар ва аппарат',
  rmSectionBagsDesc: 'Фаол қоп, улаш / алмаштириш ва қоплар рўйхати',

  dashTitle: 'Ишлаб чиқариш бошқарув панели',
  dashSubtitle: 'Реал вақт маълумотлари',
  dashSystemActive: 'Тизим фаол',
  dashLowAlert: 'Хомашё миқдори критик даражада кам!',
  dashLowDesc: 'Янги хомашё буюртма беринг',
  dashKpiMaterial: 'Хомашё қолдиғи',
  dashKpiSemi: 'Қолип омбори',
  dashKpiFinal: 'Тайёр маҳсулотлар омбори',
  dashKpiTodayProd: 'Бугунги ишлаб чиқариш',
  dashKpiTodaySales: 'Бугунги сотув',
  dashChartProd: 'Ишлаб Чиқариш Трэнди',
  dashChartLast7: 'Сўнгги 7 кун',
  dashChartMaterial: 'Хомашё ҳаракати',
  dashChartKg: 'кг',
  dashProdYarimTayyor: 'Ярим тайёр',
  dashProdTayyor: 'Тайёр',
  dashStockTitle: 'Омбор Ҳолати',
  dashActivityTitle: 'Сўнгги Фаолиятлар',
  dashOrderMaterial: 'Хомашё буюртма беринг!',
  dashTodayDate: 'Жума, 3 Апрел 2026',
  dashMaterialInWarehouse: '% омборда',
  dashCbuTitle: 'Марказий банк курси',
  dashCbuSource: 'ЎзМарказий банк',
  dashCbuFetchError: 'Курс юкланмади. Интернетни текширинг.',
  dashCbuRetry: 'Қайта уриниш',
  dashCbuRefresh: 'Янгилаш',
  dashCbuChangeToday: 'бугун',

  rmTitle: 'Хомашё бошқаруви',
  rmTotalIn: 'Жами кирди',
  rmTotalOut: 'Жами ишлатилди',
  rmRemaining: 'Қолган хомашё',
  rmRemainingPaint: 'Қолган краска / бўёқ',
  rmStockLevel: 'Омбор тўлиши',
  rmNewEntry: 'Янги хомашё кирими',
  rmIncomingTitleSiro: 'Янги хомашё кирими',
  rmIncomingTitlePaint: 'Янги краска кирими',
  rmIncomingTabSiro: 'PET хомашё',
  rmIncomingTabPaint: 'Краска',
  rmIncomingHintPaint: 'Кирим танланган краска/бўёқ позициясига ёзилади.',
  rmPlaceholderDescPaint: 'Краска кирими...',
  rmMetricsCaptionSiro: 'PET хомашё',
  rmMetricsCaptionPaint: 'Краска / бўёқ',
  rmAlertsTitlePaint: 'Краска турлари бўйича огоҳлантириш',
  rmAlertsSubtitlePaint: 'Ҳар бир краска қолдиғи алоҳида назорат қилинади',
  rmSelectPaintRequired: 'Аввал «Краска / бўёқ» турида хомашё яратинг',
  rmAddBtn: 'Омборга қўшиш',
  rmHistory: 'Хомашё ҳаракати тарихи',
  rmIncoming: '↓ Кирди',
  rmOutgoing: '↑ Сарфланди',
  rmBalance: 'Ҳозирги қолдиқ',
  rmPlaceholderDesc: 'PET хомашё кирими...',
  rmPreviewAdd: 'Омборга қўшилади:',
  rmPreviewBalance: 'Янги қолдиқ:',
  rmCapacity: 'Омбор сиғими',
  rmCritical: 'Критик: 500 кг',
  rmWarning: 'Огоҳлантириш: 1000 кг',

  spTitle: 'Қолип Ишлаб Чиқариш',
  sp18gStock: '18г Қолип (Омборда)',
  sp20gStock: '20г Қолип (Омборда)',
  spRawRemaining: 'Хомашё қолдиғи',
  spFormTitle: 'Қолип Ишлаб Чиқариш',
  spTypeLabel: 'Қолип тури',
  spMachineLabel: 'Аппарат',
  spQtyLabel: 'Миқдор (дона)',
  spCalcTitle: '⚙️ Автоматик ҳисоб:',
  spCalcPer: 'Ҳар бир қолип:',
  spCalcNeeded: 'Керак хомашё:',
  spCalcAfter: 'Ишлатгандан сўнг:',
  spCalcRemains: 'қолади',
  spNoRaw: 'Yetarli xomashyo yo\'q!',
  spHistory: 'Ишлаб Чиқариш Тарихи',
  spTotal18: 'Жами 18г:',
  spTotal20: 'Жами 20г:',
  spColRaw: 'Хомашё сарфи',

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
  whTabOverview: 'Умумий кўрсаткичлар',
  whTabCatalog: 'Каталог',
  whTabStats: 'Статистика',
  whTabHistory: 'Тарих',
  whHistoryTitle: 'Ишлаб чиқариш тарихи',
  whHistorySubtitle:
    'Партия (/production) ва смена ёзувлари: хомашё, краска, қолип сарфи — каталог номи билан мос келса, ретсепт бўйича ҳисобланади.',
  whHistoryEmpty: 'Ҳозирча ишлаб чиқариш ёзувлари мавжуд эмас.',
  whHistoryColWhen: 'Вақт',
  whHistoryColSource: 'Манба',
  whHistorySourceProduction: 'Партия',
  whHistorySourceShift: 'Смена',
  whHistoryShiftShort: 'Смена',
  whHistoryColType: 'Тур',
  whHistoryColOutput: 'Чиқарилган',
  whHistoryColQty: 'Миқдор',
  whHistoryColConsumed: 'Сарфланган',
  whHistoryTypeSemi: 'Қолип',
  whHistoryTypeFinal: 'Тайёр',
  whHistoryKindRaw: 'Хомашё',
  whHistoryKindSemi: 'Қолип',
  whHistoryPlannedKg: 'режа',
  whHistoryExtraKg: 'ортикча',
  whRecipePerPiece: '1 дона қолип учун (каталог)',
  whRecipePerThousand: '1000 дона ≈',
  whMaterial: 'PET хомашё',
  whSemi: 'Ярим тайёр (қолип)',
  whFinal: 'Тайёр маҳсулот',
  whTotalProd: 'Жами маҳсулот',
  whInWarehouse: 'Омборда',
  whDetailed: 'Батафсил Омбор Ҳолати',
  whStockBreakdownEmpty:
    'Бу ерда фақат каталогга қўшилган махсулот турлари бўйича карта кўринади. Аввал махсулот қўшинг.',
  whSemiStats: 'Ярим тайёр маҳсулотлар',
  whFinalStats: 'Тайёр маҳсулотлар',
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
  whRawMaterialListTitle: 'Омбордаги хомашё турлари',
  whIncludedInWarehouse: 'Омборда кўринади',
  whSemiBreakdownTitle: 'Ярим тайёр — рецепт ва краска',
  whSemiStockPieces: 'Омборда қолип',
  whRecipeRaw: 'Каталог бўйича ретсепт (1 дона учун)',
  whShiftPaintTotal: 'Сменаларда сарфланган краска',

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
  slDeleteClientTitle: 'Клиентни рўйхатдан олиб ташлаймизми?',
  slDeleteClientHint:
    'Клиент рўйхатдан олинади; аввалги сотувлар ва тўловлар тарихи сақланади.',
  slDeleteClientAction: 'Ҳа, рўйхатдан олиб ташлаш',
  slCompanyName: 'LiderPlast',
  slDebtStatusYes: 'Қарзи бор',
  slDebtStatusNo: 'Қарзи йўқ',

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
  exHistoryFullscreenEnter: 'Тўлиқ экран',
  exHistoryFullscreenExit: 'Ёпиш (Esc)',
  exColAmount: 'Сумма',
  exCategoriesTitle: 'Харажат категориялари',
  exCategoryAdd: 'Янги категория',
  exCategoryName: 'Номи',
  exCategoryDelete: 'Ўчириш',
  exCategoryDeleteTitle: 'Категорияни рўйхатдан оламизми?',
  exCategoryDeleteHint: 'Категория рўйхатдан олинади; тарихдаги ёзувлар сақланади.',
  exCategoryLabelRawMaterialExternalOrder: 'Хом ашё ташқи буюртма',
  exCategoryLabelRawMaterialBagWriteoff: 'Хом ашё — қоп чиқими',
  exStatsByCategory: 'Категория бўйича статистика',
  exStatsViewTable: 'Жадвал',
  exStatsViewDonut: 'Доира',
  exStatsViewBars: 'Устунлар',
  exStatsRank: '#',
  exNoCategories: 'Категория йўқ. Аввал категория яратинг.',
  exPageStatsNote:
    'Диаграмма ва юқори статистика — барча вақт. «Тарих» жадвали — танланган сана фильтри бўйича.',
  exNoMachinesElectric:
    'Электр харажати учун ишлаб чиқариш машиналари рўйхати бўш. Админ `/production/machines` орқали машина қўшсин.',
  exGlobalElectricityPriceTitle: 'kVt·soat narxi (барча электр учун)',
  exShiftElectricityExplain:
    'Бу нарх «Смена тарихи»даги kVt·soat × сум ҳисоби билан автоматик электр харажатларига қўлланилади; смена сақланса ёки ўзгарса, харажат ҳам янгиланади.',
  exFromShiftBadge: 'Смена',
  exNoteBagCuidDisplay: 'Қоп №…{suffix}',
  exNotePurchaseOrderTpl:
    '{kg} кг · {currency} {amount} · курс {rate} → {uzs} {unit}',
  exNoteKgPriceLastOrder:
    'Кг нархи: {price} сўм (охирги етган ташқи буюртма бўйича)',
  exNoteKgPricePendingOrder:
    'Кг нархи: {price} сўм (кутилмоқдаги ташқи буюртма, омборга ҳали келмаган)',
  exNoteKgPriceMissing: 'Ташқи буюртма бўйича кг нархи топилмади — 0 сўм',
  exShiftExpenseNote:
    '{date}, {n}-смена — {worker}; {machine} — {kwh} кВт·соат × {price} {unit}',
  exElectricityPriceButton: 'Электр нархи (kVt·soat)',
  exElectricityPriceNavShort: 'kVt·soat',
  exElectricityPriceSaved: 'kVt·soat нархи янгиланди',
  exElectricityPriceErrorEndpoint404:
    '404: серверда «электр нархи» учун янги API йўқ ёки backend эски версияда ишламоқда. Лойиҳадаги backendни янги код билан қайта ишга туширинг (масалан, `npm run start:dev`). Инглизча хато «Cannot PATCH … electricity-price» шуни англатади.',

  repTitle: 'Ҳисоботлар',
  repRevenue: 'Жами Даромад',
  repExpenses: 'Жами Харажат',
  repProfit: 'Соф Фойда (тахм.)',
  repRawEff: 'Хомашё самарадорлиги',
  repTabProduction: 'Ишлаб Чиқариш',
  repTabEfficiency: 'Самарадорлик',
  repTabSales: 'Сотув',
  repTabMaterial: 'Хомашё таҳлили',
  repProdTitle: 'Ишлаб Чиқариш (Сўнгги 7 кун)',
  repEffTitle: 'Аппарат Самарадорлиги',
  repEffFormula: 'Формула: (Ҳақиқий / Максимал) × 100%',
  repEffActual: 'Ҳақиқий:',
  repEffMax: 'Максимал:',
  repEffNoMachines:
    'Аппаратлар рўйхати бўш. «Смена» саҳифасида аппарат қўшинг — шу ерда самарадорлик чиқади.',
  repEffPlannedHourly: 'Соатига режа (дана)',
  repEffActualHourly: 'Амалда ўртача (жами ÷ вақт)',
  repEffUnitPcsPerHour: 'дана/соат',
  repEffTotalShort: 'Жами чиқим:',
  repEffLimitShort: 'Режа бўйича лимит:',
  repEffAssumedHours: 'Ҳисобланган вақт: {{h}} соат (ҳар бир партия/смена ~8 соат).',
  repRawTitle: 'Хомашё Самарадорлиги',
  repRawIn: 'Жами Кирди',
  repRawOut: 'Ишлатилди',
  repRawEffLabel: 'Ишлатиш самарадорлиги',
  repSalesTitle: 'Сотув Трэнди (Сўнгги 7 кун, минг сўм)',
  repClientsTitle: 'Клиентлар Бўйича Сотув',
  repMatTitle: 'Хомашё ҳаракати (сўнгги 7 кун, кг)',
  repMatTable: 'Хомашё ҳаракати жадвали',
  repSemiDist: 'Қолип Омбори Тақсимоти',
  repFinalDist: 'Бакалашка Омбори Тақсимоти',

  layoutSystem: 'Лидер Пласт',
  layoutMaterialLow: 'Хомашё кам!',
  layoutAdmin: 'Лидер Пласт',
  layoutSiroRemaining: 'Хомашё қолдиғи',

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
  prTabRawOrders: 'Хомашё буюртма',
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
  prRmSubtabNew: 'Янги буюртма',
  prRmSubtabHistory: 'Тарих',
  prRmWeightLabel: 'Оғирлик',
  prRmPendingAlert: 'Омборга кирим кутилмоқда',
  prRmNoPendingOrders: 'Кутилувчи буюртма йўқ',
  prRmDaysWaitingTpl: '{name} · {kg} кг · {days} кун',
  prRmWeightUnitKg: 'кг',
  prRmWeightUnitTon: 'тонна',
  prRmCurrencyLabel: 'Валюта',
  prRmFxRateLabel: '1 валюта = неча сўм (МБ)',
  prRmFxCbuHint: 'Курс https://cbu.uz дан; керак бўлса қўлда тузатиш мумкин',
  prRmPricePerKgLabel: 'Нарх — 1 кг учун (танланган валютада)',
  prRmPricePerKgHint:
    'Нарх фақат битта килограмм учун киритилади. Умумий сумма (бутун буюртма) қуйда автоматик ҳисобланади.',
  prRmTotalOrderInCurrency: 'Буюртма бўйича жами',
  prRmAmountUzsEst: 'Сўмда (баҳолаш)',
  prRmCostPerKg: 'кг нархи (сўм)',
  prRmSubmitOrder: 'Буюртма бериш',
  prRmOrdersHistory: 'Буюртмалар',
  prRmColOrderedAt: 'Сана',
  prRmMarkFulfilled: 'Етиб келди',
  prRmFulfilledHint: 'Омборда хақиқий кирим алоҳида саҳифада',
  prRmStatusPending: 'Кутилмоқда',
  prRmStatusFulfilled: 'Етиб келган',
  prRmNoOrders: 'Буюртмалар йўқ',
  rmPendingExternalOrdersTitle: 'Бухгалтериядан ташқи буюртма (омбор киримини белгиланг)',
  rmOrderMarkArrived: 'Етиб келди',
  rmOrderArrivedToast: 'Буюртма ёпилди',
  rmIncomingQtyMismatchTitle: 'Миқдор бўйича огоҳлантириш',
  rmIncomingQtyMismatchBody:
    'Бухгалтериядаги кутилувчи буюртма: {orderedKg} кг. Сиз киритган миқдор: {enteredKg} кг. Шу миқдорда омборга қўшасизми?',
  prEmployee: 'Ишчи',
  prEmployeesSubActive: 'Фаол ишчилар',
  prEmployeesSubFormer: 'Ишдан чиққанлар',
  prNoFormerEmployees: 'Ишдан чиққан ишчилар йўқ',
  prNoEmployees: 'Ишчилар рўйхати бўш',
  prNoVedomost: 'Ведомост яратилмаган. "Ведомост яратиш" тугмасини босинг.',
  prTotalBrutto: 'Жами брутто',
  prTotalNet: 'Жами нет',
  prTotalTax: 'Жами солиқ',
  prSaveSettings: 'Сақлаш',
  prEmployeeSavedToast: 'Ишчи маълумотлари сақланди',
  prEmployeeRateSavedToast: 'Маҳсулот бўйича ставка сақланди',
  prEditEmployeeRate: 'Таҳрирлаш',
  prEmployeeRateEditingNotice:
    'Ставкани янгилаш: «{product}». Ўзгартириб, «Сақлаш» ни босинг.',
  prEmployeeSaveError: 'Сақлашда хатолик. Қайта урининг.',
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
    'Банк обороткаси талаб қилинган форматда ўқилмади ёки сақлашда хатолик бўлди. Транзакциялар базага ёзилмади — шу сабабли рўйхат бўш.',
  prBankTechnicalDetails: 'Техник тафсилотлар (ихтиёрий)',
  prBankRejectedEmptyTx: 'Рад этилган ведомостда транзакциялар йўқ.',
  prShiftLogTitle: 'Смена бўйича батафсил (танланган сана оралиғи)',
  prEmployeeArchivedBadge: 'Ишдан чиққан',
  prShiftEmploymentPeriod: 'Сменада ишлаган: {from} — {to}',
  prHireDateLabel: 'Ишга қабул',
  prLeaveDateLabel: 'Ишдан чиқиш',
  prShiftLogFilterHint: 'Пастдаги ёзувлар фақат танланган сана оралиғида: {label}',
  prShiftLogEmpty: 'Бу ишчи учун танланган оралиқда смена ёзуви йўқ',
  prShiftLogTotals: 'Оралиқ бўйича жамӣ',
  prColShift: '№',
  prColDefect: 'Брак',
  prColKwh: 'кВт·соат',
  prColPaint: 'Краска',
  prColCounter: 'Ўткич',
  prVedColHintDeduct: 'NETдан чегирлади',
  prVedColHintExempt: 'чегирмайди',
  prVedColNetShort: 'B − S',
  prKpiLabelSocial: 'Ижт.',

  invTitle: 'Инвентаризация',
  invSubtitle: 'Омборнинг тизим қолдиғи билан реал қолдиғини солиштириш',
  invStatusNotStarted: 'Бошланмаган',
  invStatusInProgress: 'Жараёнда',
  invStatusCompleted: 'Тугалланган',
  invExportExcel: 'Excel экспорт',
  invExportPdf: 'PDF экспорт',
  invCreateNew: 'Янги инвентаризация',
  invFilterTitle: 'Фильтр',
  invFilterDateFrom: 'Бошланиш санаси',
  invFilterDateTo: 'Тугаш санаси',
  invFilterWarehouse: 'Омбор',
  invFilterStatus: 'Ҳолат',
  invFilterStatusAll: 'Барчаси',
  invFilterDocNumber: 'Ҳужжат рақами',
  invFilterApply: 'Шакллантириш',
  invFilterReset: 'Фильтрни тозалаш',
  invDocList: 'Инвентаризация ҳужжатлари',
  invNoRecords: 'Ҳужжатлар топилмади',
  invColIndex: '№',
  invColProduct: 'Кўрсаткич номи',
  invColPeriodStart: 'Кун бошига',
  invColPeriodTurnover: 'Давр айланиши',
  invColPeriodEnd: 'Кун охирига',
  invColSystem: 'Ҳисобда',
  invColReal: 'Реал',
  invColIncoming: 'Кирим',
  invColOutgoing: 'Чиқим',
  invColDifference: 'Фарқ',
  invFooterTotal: 'Жами',
  invSummaryTitle: 'Йиғма ҳисобот',
  invSummaryOpening: 'Бошланғич қолдиқ',
  invSummaryTurnover: 'Давр айланиши',
  invSummaryClosing: 'Якуний қолдиқ',
  invSummarySurplus: 'Ортиқча сумма',
  invSummaryShortage: 'Камомад сумма',
  invSummaryDiffTotal: 'Умумий фарқ',
  invActionStart: 'Бошлаш',
  invActionFinish: 'Тугаллаш',
  invActionDelete: 'Ўчириш',
  invActionDeleteConfirm: 'Ҳа, ўчириш',
  invActionDeleteDescription: 'Танланган инвентаризация ҳужжати ўчирилади. Бу амални қайтариб бўлмайди.',
  invConfirmFinishTitle: 'Инвентаризацияни тугаллаш',
  invConfirmFinishDescription: 'Тугаллангандан кейин реал қолдиқлар тизим қолдиғи сифатида сақланади. Давом этасизми?',
  invStockUpdated: 'Тизим қолдиғи реал қолдиқ бўйича янгиланди',
  invDocNumberPlaceholder: 'Масалан INV-001',
  invWarehouseDefault: 'Асосий омбор',
  invCategoryRaw: 'Хомашё',
  invCategorySemi: 'Қолип',
  invCategoryFinished: 'Тайёр маҳсулот',
  invCardDocNumber: 'Ҳужжат',
  invCardDate: 'Сана',
  invCardWarehouse: 'Омбор',
  invCardItems: 'позиция',
  invEmptyCatalog: 'Омборда позициялар топилмади. Аввал омборга маҳсулот қўшинг.',
  invSelectRecord: 'Ҳужжатни танланг',
  invSelectHint: 'Юқорида янги инвентаризация яратинг ёки рўйхатдан танланг.',
  invToastCreated: 'Янги инвентаризация яратилди',
  invToastFinished: 'Инвентаризация якунланди',
  invToastDeleted: 'Инвентаризация ўчирилди',
  invUnitPiece: 'дона',
  invUnitKg: 'кг',
  invShowing: 'Кўрсатилмоқда',
  invMobileSwipeHint: 'Жадвални ўнгга суринг — қўшимча устунлар бор',
  invFilterRangeLabel: 'Танланган давр',
  invStartedAt: 'Яратилган',
  invFinishedAt: 'Тугалланган',
  invBack: 'Орқага',
};

// ======================== UZBEK LATIN ========================
const uz_latin: T = {
  langName: "O'zbek (Lotin)",
  langShort: 'LT',

  navDashboard: 'Boshqaruv paneli',
  navRawMaterial: 'Xomashyo / kraska',
  navSemiProduction: 'Qolip ishlab chiqarish',
  navFinalProduction: 'Bakalashka ishlab chiqarish',
  navWarehouse: 'Ombor',
  whSidebarRaw: 'Xom ashyo',
  whSidebarSemi: 'Yarim tayyor',
  whSidebarFinal: 'Tayyor',
  navSales: 'Sotuv',
  navExpenses: 'Xarajatlar',
  navReports: 'Hisobotlar',
  navShifts: 'Ishlab chiqarish',
  navShiftOverConsumption: 'Ortiqcha xomashyo',
  poOverTitle: 'Ishlab chiqarish: retseptdan ortiqcha siro',
  poOverSubtitle:
    'Qolip smenalarida retsept bo‘yicha kerak bo‘lganidan ko‘p sarflangan xomashyo (masalan: 3,95 kg o‘rniga 5 kg).',
  poOverAggTitle: 'Qaysi mahsulot + qaysi xomashyo — jami ortiqcha',
  poOverAggHint:
    'Bir xil nom va xomashyo bo‘yicha guruhlangan; «maks %» — bitta yozuvdagi eng katta me‘yordan ortiqcha foiz.',
  poOverDetailTitle: 'Barcha ortiqcha yozuvlar (vaqt, ishchi, dona, kg)',
  poOverColProduct: 'Mahsulot',
  poOverColRaw: 'Xomashyo',
  poOverColCases: 'Yozuvlar',
  poOverColSumExtra: 'Jami ortiqcha, kg',
  poOverColAvgOverPct: 'O‘rtacha % ortiqcha',
  poOverColMaxPct: 'Maks % ortiqcha',
  poOverColWhen: 'Sana / vaqt',
  poOverColWorker: 'Ishchi',
  poOverColMachine: 'Apparat',
  poOverColGood: 'Tayyor (dona)',
  poOverColDefect: 'Brak',
  poOverColPlanned: 'Reja, kg',
  poOverColActual: 'Haqiqiy, kg',
  poOverColExtra: 'Ortiqcha, kg',
  poOverColOverPct: '% ortiqcha',
  poOverEmpty: 'Hozircha retseptdan ortiqcha siro yozuvlari yo‘q (smenada «haqiqiy kg» kiritilmagan).',
  poOverLinkFromShift: 'Ortiqcha xomashyo ro‘yxati →',
  poOverBackToShift: 'Smenaga qaytish',
  navSystemUsers: 'Tizim foydalanuvchilari',
  navInventory: 'Inventarizatsiya',

  authTitle: 'LiderPlast ERP',
  authSubtitle: 'Tizimga kirish',
  authIdentifier: 'Telefon yoki login',
  authPassword: 'Parol',
  authSubmit: 'Kirish',
  authLoading: 'Yuklanmoqda…',
  authMachines: 'Mashinalar',
  authMachinesDisabledHint: 'CRM manzili hozircha o‘rnatilmagan (VITE_MACHINES_CRM_URL)',
  authShowPassword: 'Parolni ko‘rsatish',
  authHidePassword: 'Parolni yashirish',
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
  suPermViewRawMaterialBags: 'Xomashyo qoplari (ko‘rish)',
  suPermManageRawMaterialBags: 'Xomashyo qoplarini boshqarish',
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

  apiShiftProductTypeRequired: 'Mahsulot turi kiritilishi kerak',
  apiShiftMachineRequired: 'Apparat tanlanishi kerak',
  apiShiftSemiNotFound: 'Yarim tayyor mahsulot topilmadi (nom mos kelishi kerak): {label}',
  apiShiftRawInsufficient: 'Xomashyo omborda yetarli emas: {name}',
  apiShiftSemiBalanceMissing: 'Yarim tayyor mahsulot uchun ombor qoldig‘i topilmadi',
  apiShiftFinishedNotFound: 'Tayyor mahsulot topilmadi (nom mos kelishi kerak): {label}',
  apiShiftMachineNotLinked:
    'Bu mahsulot ushbu apparat bilan bog‘lanmagan (tayyor mahsulot → apparatlar)',
  apiShiftFinishedNoSemiRecipe: 'Tayyor mahsulot uchun yarim tayyor retsepti yo‘q',
  apiShiftInsufficientSemiStock: 'Yarim tayyor omborda yetarli emas: {name}',
  apiShiftFinishedBalanceMissing: 'Tayyor mahsulot uchun ombor qoldig‘i topilmadi',
  apiShiftRawOverrideUnknown:
    'Retseptda yo‘q xomashyo uchun haqiqiy miqdor yuborildi (ID): {id}',
  apiShiftRawActualInvalid: 'Xomashyo uchun haqiqiy miqdor noto‘g‘ri: {name}',
  apiShiftRawOverrideSemiOnly:
    'Haqiqiy xomashyo (kg) faqat qolip (yarim tayyor) apparati uchun yuboriladi',

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
  rmBagConnectPrevHint:
    'Faol qopda qoldiq bor. Yangi qopni ulashdan oldin qoldiqni qayta ishlashni tanlang:',
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
  rmBagsListNoConnected: 'Hozir apparatga ulangan qop yo‘q.',
  rmBagsListOtherTitle: 'Qolgan qoplar',
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
  rmBagLogNoteConnectedAfterSwitch:
    'Yangi qop ulanishda avvalgi qop almashtirilgan — qop apparatga ulandi',
  rmBagLogNoteConnectedToMachine: 'Qop apparatga ulandi',
  rmBagLogNoteConnectedReplacement: 'Qop almashtirish: yangi qop apparatga ulandi',
  rmBagLogNoteDisconnected: 'Qop uzildi',
  rmBagLogNoteDisconnectedTpl: 'Qop uzildi · {reason}',
  rmBagLogNoteDisconnectedBeforeWriteoff: 'Chiqimga chiqarishdan oldin qop uzildi',
  rmBagLogNoteWrittenOff: 'Qop chiqimga chiqarildi',
  rmBagLogNoteWrittenOffTpl: 'Chiqimga chiqarildi · {reason}',
  rmBagLogNoteWrittenOffAfterDisconnect: 'Uzilgandan keyin qoldiq chiqimga chiqarildi',
  rmBagLogNoteReturnedToWarehouse: 'Uzilgandan keyin qop omborga qaytarildi',
  rmBagLogNoteDepleted: 'Qop tugagan',
  rmBagLogNoteQuickConsume: 'Qopdan tezkor sarf',
  rmBagLogNoteMaterialConsumed: 'Faol qopdan material sarflandi',
  rmBagLogNoteShiftRecipeSiro: 'Smena: retsept bo‘yicha xomashyo sarfi',
  rmBagLogNoteShiftRecipeSiroBag: 'Smena: retsept bo‘yicha xomashyo sarfi (ulangan qop)',
  rmBagLogNoteShiftProduction: 'Smena: ishlab chiqarish',
  rmBagLogNoteShiftSemiForFinal: 'Smena: tayyor mahsulot uchun yarim tayyor sarfi',
  rmBagLogNoteShiftPaint: 'Smena: kraska/bo‘yoq sarfi',
  rmBagLogNoteShiftPaintBag: 'Smena: kraska/bo‘yoq sarfi (ulangan qop)',
  rmBagLogNoteProductionConsumption: 'Ishlab chiqarish sarfi',
  rmBagLogNoteBagCreated: 'Qop yaratildi',
  rmBagLogNoteBagCreatedTpl: 'Qop yaratildi · {name}',
  rmCreateTypeTitle: 'Yangi xomashyo yaratish',
  rmCreateTypeButton: 'Xomashyoni saqlash',
  rmCreateTypePlaceholder: 'Masalan: PET 9921',
  rmCreateTypeDescPlaceholder: 'Xomashyo haqida qisqacha izoh',
  rmCreateNameRequired: 'Xomashyo nomi majburiy',
  rmCreateError: 'Xomashyoni yaratishda xatolik yuz berdi',
  rmCreatedSuccess: 'Xomashyo muvaffaqiyatli yaratildi',
  rmSelectRawMaterialRequired: 'Avval kamida bitta xomashyo yarating',
  rmDefaultIncomingNote: 'Xomashyo kirimi',
  rmIncomingHint: 'Kirim tanlangan xomashyoga yoziladi',
  rmDefaultBagWeight: 'Bir qopdagi miqdor',
  rmDefaultBagWeightPlaceholder: 'Kg da kiriting, masalan: 25',
  rmDefaultBagWeightHint: 'Kirimda avtomatik qoplar shu miqdor bo‘yicha yaratiladi',
  rmDefaultBagWeightRequired: 'Bir qopdagi miqdorni kiriting',
  rmDefaultBagWeightPreview: 'Har bir yangi qop: {weight} kg',
  rmIncomingBagWeightHint: 'Avto qop yaratish: har bir qop {weight} {unit}',
  rmAutoBagPreview: 'Kirimdan keyin avtomatik {count} qop yaratiladi. Odatdagi qop: {weight} kg, oxirgisi: {lastWeight} kg',
  rmAutoBagMissingHint: 'Avto-qop uchun katalogda «bir qopdagi miqdor» belgilanmagan — bu xomashyo uchun',
  rmAlertsTitle: 'Xomashyo bo‘yicha ogohlantirish',
  rmAlertsSubtitle: 'Har bir xomashyo qoldig‘i alohida nazorat qilinadi',
  rmKindLabel: 'Xomashyo turi',
  rmKindSiro: 'PET / oddiy xomashyo',
  rmKindPaint: 'Kraska / bo‘yoq',
  rmPaintHint:
    'Turni «kraska» deb belgilang — smenada faqat shu turdagi pozitsiyalar tanlanadi.',
  rmCreatePaintButton: 'Kraskani saqlash',
  rmSectionOverview: 'Umumiy ko‘rsatkichlar',
  rmSectionOverviewDesc: 'PET xomashyo va kraska bo‘yicha kirim, sarf va qoldiq',
  rmSectionAlerts: 'Ogohlantirishlar',
  rmSectionAlertsDesc: 'Kam qoldiq bo‘yicha turlar',
  rmSectionCreateIncoming: 'Katalog va omborga kirim',
  rmSectionCreateIncomingDesc: 'Yangi xomashyo turi yoki miqdorni ro‘yxatga qo‘shish',
  rmSectionLedger: 'Harakatlar jurnali',
  rmSectionLedgerDesc: 'Kirim va sarf yozuvlari',
  rmSectionBags: 'Qoplar va apparat',
  rmSectionBagsDesc: 'Faol qop, ulash / almashtirish va qoplar ro‘yxati',

  dashTitle: 'Ishlab chiqarish boshqaruv paneli',
  dashSubtitle: 'Real vaqt ma\'lumotlari',
  dashSystemActive: 'Tizim faol',
  dashLowAlert: 'Xomashyo miqdori kritik darajada kam!',
  dashLowDesc: 'Yangi xomashyo buyurtma bering',
  dashKpiMaterial: "Xomashyo qoldig'i",
  dashKpiSemi: 'Qolip ombori',
  dashKpiFinal: 'Tayyor mahsulotlar ombori',
  dashKpiTodayProd: 'Bugungi ishlab chiqarish',
  dashKpiTodaySales: 'Bugungi sotuv',
  dashChartProd: 'Ishlab Chiqarish Trendi',
  dashChartLast7: "So'nggi 7 kun",
  dashChartMaterial: 'Xomashyo harakati',
  dashChartKg: 'kg',
  dashProdYarimTayyor: 'Yarim tayyor',
  dashProdTayyor: 'Tayyor',
  dashStockTitle: 'Ombor Holati',
  dashActivityTitle: "So'nggi Faoliyatlar",
  dashOrderMaterial: 'Xomashyo buyurtma bering!',
  dashTodayDate: 'Juma, 3 Aprel 2026',
  dashMaterialInWarehouse: '% omborda',
  dashCbuTitle: 'Markaziy bank kursi',
  dashCbuSource: "O'zbekiston Respublikasi Markaziy banki",
  dashCbuFetchError: 'Kurs yuklanmadi. Internetni tekshiring.',
  dashCbuRetry: 'Qayta urinish',
  dashCbuRefresh: 'Yangilash',
  dashCbuChangeToday: 'bugun',

  rmTitle: 'Xomashyo boshqaruvi',
  rmTotalIn: 'Jami kirdi',
  rmTotalOut: 'Jami ishlatildi',
  rmRemaining: "Qolgan xomashyo",
  rmRemainingPaint: "Qolgan kraska / bo'yoq",
  rmStockLevel: "Ombor to'lishi",
  rmNewEntry: 'Yangi xomashyo kirimi',
  rmIncomingTitleSiro: 'Yangi xomashyo kirimi',
  rmIncomingTitlePaint: 'Yangi kraska kirimi',
  rmIncomingTabSiro: 'PET xomashyo',
  rmIncomingTabPaint: 'Kraska',
  rmIncomingHintPaint: "Kirim tanlangan kraska/bo'yoq pozitsiyasiga yoziladi.",
  rmPlaceholderDescPaint: 'Kraska kirimi...',
  rmMetricsCaptionSiro: 'PET xomashyo',
  rmMetricsCaptionPaint: "Kraska / bo'yoq",
  rmAlertsTitlePaint: 'Kraska turlari bo\'yicha ogohlantirish',
  rmAlertsSubtitlePaint: "Har bir kraska qoldig'i alohida nazorat qilinadi",
  rmSelectPaintRequired: "Avval «Kraska / bo'yoq» turida xomashyo yarating",
  rmAddBtn: "Omborga qo'shish",
  rmHistory: 'Xomashyo harakati tarixi',
  rmIncoming: '↓ Kirdi',
  rmOutgoing: '↑ Sarflandi',
  rmBalance: "Hozirgi qoldiq",
  rmPlaceholderDesc: 'PET xomashyo kirimi...',
  rmPreviewAdd: "Omborga qo'shiladi:",
  rmPreviewBalance: 'Yangi qoldiq:',
  rmCapacity: 'Ombor sig\'imi',
  rmCritical: 'Kritik: 500 kg',
  rmWarning: 'Ogohlantirish: 1000 kg',

  spTitle: 'Qolip Ishlab Chiqarish',
  sp18gStock: '18g Qolip (Omborda)',
  sp20gStock: '20g Qolip (Omborda)',
  spRawRemaining: "Xomashyo qoldig'i",
  spFormTitle: 'Qolip Ishlab Chiqarish',
  spTypeLabel: 'Qolip turi',
  spMachineLabel: 'Apparat',
  spQtyLabel: 'Miqdor (dona)',
  spCalcTitle: '⚙️ Avtomatik hisob:',
  spCalcPer: 'Har bir qolip:',
  spCalcNeeded: 'Kerak xomashyo:',
  spCalcAfter: 'Ishlatgandan so\'ng:',
  spCalcRemains: 'qoladi',
  spNoRaw: 'Yetarli xomashyo yo\'q!',
  spHistory: 'Ishlab Chiqarish Tarixi',
  spTotal18: 'Jami 18g:',
  spTotal20: 'Jami 20g:',
  spColRaw: 'Xomashyo sarfi',

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
  whTabOverview: 'Umumiy ko‘rsatkichlar',
  whTabCatalog: 'Katalog',
  whTabStats: 'Statistika',
  whTabHistory: 'Tarix',
  whHistoryTitle: 'Ishlab chiqarish tarixi',
  whHistorySubtitle:
    'Partiya (/production) va smena yozuvlari: xomashyo, kraska, qolip sarfi — katalog nomi mos kelsa, retsept bo‘yicha hisoblanadi.',
  whHistoryEmpty: 'Hozircha ishlab chiqarish yozuvlari yo‘q.',
  whHistoryColWhen: 'Vaqt',
  whHistoryColSource: 'Manba',
  whHistorySourceProduction: 'Partiya',
  whHistorySourceShift: 'Smena',
  whHistoryShiftShort: 'Smena',
  whHistoryColType: 'Tur',
  whHistoryColOutput: 'Chiqarilgan',
  whHistoryColQty: 'Miqdor',
  whHistoryColConsumed: 'Sarflangan',
  whHistoryTypeSemi: 'Qolip',
  whHistoryTypeFinal: 'Tayyor',
  whHistoryKindRaw: 'Xomashyo',
  whHistoryKindSemi: 'Qolip',
  whHistoryPlannedKg: 'reja',
  whHistoryExtraKg: 'ortiqcha',
  whRecipePerPiece: '1 dona qolip uchun (katalog)',
  whRecipePerThousand: '1000 dona ≈',
  whMaterial: 'PET xomashyo',
  whSemi: 'Yarim tayyor (qolip)',
  whFinal: 'Tayyor mahsulot',
  whTotalProd: 'Jami mahsulot',
  whInWarehouse: 'Omborda',
  whDetailed: 'Batafsil Ombor Holati',
  whStockBreakdownEmpty:
    'Bu yerda faqat katalogga qo‘shilgan mahsulot turlari bo‘yicha karta ko‘rinadi. Avval mahsulot qo‘shing.',
  whSemiStats: 'Yarim tayyor mahsulotlar',
  whFinalStats: 'Tayyor mahsulotlar',
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
  whRawMaterialListTitle: 'Ombordagi xomashyo turlari',
  whIncludedInWarehouse: 'Omborda ko‘rinadi',
  whSemiBreakdownTitle: 'Yarim tayyor — retsept va kraska',
  whSemiStockPieces: 'Omborda qolip',
  whRecipeRaw: 'Katalog bo‘yicha retsept (1 dona uchun)',
  whShiftPaintTotal: 'Smenalarda sarflangan kraska',

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
  slDeleteClientTitle: "Klientni ro'yxatdan olib tashlaymizmi?",
  slDeleteClientHint:
    "Klient ro'yxatdan olinadi; avvalgi sotuvlar va to'lovlar tarixi saqlanadi.",
  slDeleteClientAction: "Ha, ro'yxatdan olib tashlash",
  slCompanyName: 'LiderPlast',
  slDebtStatusYes: 'Qarzi bor',
  slDebtStatusNo: "Qarzi yo'q",

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
  exHistoryFullscreenEnter: "To'liq ekran",
  exHistoryFullscreenExit: 'Yopish (Esc)',
  exColAmount: 'Summa',
  exCategoriesTitle: 'Xarajat kategoriyalari',
  exCategoryAdd: 'Yangi kategoriya',
  exCategoryName: 'Nomi',
  exCategoryDelete: "O'chirish",
  exCategoryDeleteTitle: "Kategoriyani ro'yxatdan olamizmi?",
  exCategoryDeleteHint: "Kategoriya ro'yxatdan olinadi; tarixdagi yozuvlar saqlanadi.",
  exCategoryLabelRawMaterialExternalOrder: 'Xom ashyo tashqi buyurtma',
  exCategoryLabelRawMaterialBagWriteoff: 'Xom ashyo — qop chiqimi',
  exStatsByCategory: "Kategoriya bo'yicha statistika",
  exStatsViewTable: 'Jadval',
  exStatsViewDonut: 'Doira',
  exStatsViewBars: 'Ustunlar',
  exStatsRank: '#',
  exNoCategories: "Kategoriya yo'q. Avval kategoriya yarating.",
  exPageStatsNote:
    "Diagramma va yuqori statistika — barcha vaqt. «Tarix» jadvali — tanlangan sana filtri bo'yicha.",
  exNoMachinesElectric:
    "Elektr xarajati uchun ishlab chiqarish mashinalari ro'yxati bo'sh. Admin `/production/machines` orqali mashina qo'shsin.",
  exGlobalElectricityPriceTitle: "kVt·soat narxi (barcha elektr uchun)",
  exShiftElectricityExplain:
    "Bu narx «Smena tarixi»dagi kVt·soat × so'm hisobi bilan avtomatik elektr xarajatlariga qo'llaniladi; smena saqlansa yoki o'zgarsa, xarajat ham yangilanadi.",
  exFromShiftBadge: 'Smena',
  exNoteBagCuidDisplay: 'Qop №…{suffix}',
  exNotePurchaseOrderTpl:
    '{kg} kg · {currency} {amount} · kurs {rate} → {uzs} {unit}',
  exNoteKgPriceLastOrder:
    "Kg narxi: {price} so'm (oxirgi kelgan tashqi buyurtma bo'yicha)",
  exNoteKgPricePendingOrder:
    "Kg narxi: {price} so'm (kutilayotchi tashqi buyurtma, omborga hali kelmagan)",
  exNoteKgPriceMissing: "Tashqi buyurtma bo'yicha kg narxi topilmadi — 0 so'm",
  exShiftExpenseNote:
    "{date}, {n}-smena — {worker}; {machine} — {kwh} kVt·soat × {price} {unit}",
  exElectricityPriceButton: 'Elektr narxi (kVt·soat)',
  exElectricityPriceNavShort: 'kVt·soat',
  exElectricityPriceSaved: "kVt·soat narxi yangilandi",
  exElectricityPriceErrorEndpoint404:
    "404: serverda «elektr narxi» uchun yangi API yo'q yoki backend eski versiyada ishlayapti. Loyihadagi `backend`ni yangi kod bilan qayta ishga tushiring (masalan, `npm run start:dev`). Inglizcha «Cannot PATCH … electricity-price» xatoshi shuni anglatadi.",

  repTitle: 'Hisobotlar',
  repRevenue: 'Jami Daromad',
  repExpenses: 'Jami Xarajat',
  repProfit: 'Sof Foyda (taxm.)',
  repRawEff: 'Xomashyo samaradorligi',
  repTabProduction: 'Ishlab Chiqarish',
  repTabEfficiency: 'Samaradorlik',
  repTabSales: 'Sotuv',
  repTabMaterial: 'Xomashyo tahlili',
  repProdTitle: 'Ishlab Chiqarish (So\'nggi 7 kun)',
  repEffTitle: 'Apparat Samaradorligi',
  repEffFormula: 'Formula: (Haqiqiy / Maksimal) × 100%',
  repEffActual: 'Haqiqiy:',
  repEffMax: 'Maksimal:',
  repEffNoMachines:
    "Apparatlar ro'yxati bo'sh. «Smena» sahifasidan apparat qo'shing — samaradorlik shu yerda chiqadi.",
  repEffPlannedHourly: 'Soatiga reja (dona)',
  repEffActualHourly: "Amalda o'rtacha (jami ÷ vaqt)",
  repEffUnitPcsPerHour: 'dona/soat',
  repEffTotalShort: 'Jami chiqim:',
  repEffLimitShort: "Reja bo'yicha limit:",
  repEffAssumedHours: 'Hisoblangan vaqt: {{h}} soat (har bir partiya/smena ~8 soat).',
  repRawTitle: 'Xomashyo Samaradorligi',
  repRawIn: 'Jami Kirdi',
  repRawOut: 'Ishlatildi',
  repRawEffLabel: 'Ishlatish samaradorligi',
  repSalesTitle: 'Sotuv Trendi (So\'nggi 7 kun, ming so\'m)',
  repClientsTitle: 'Klientlar Bo\'yicha Sotuv',
  repMatTitle: 'Xomashyo harakati (so\'nggi 7 kun, kg)',
  repMatTable: 'Xomashyo harakati jadvali',
  repSemiDist: 'Qolip Ombori Taqsimoti',
  repFinalDist: 'Bakalashka Ombori Taqsimoti',

  layoutSystem: 'Lider Plast',
  layoutMaterialLow: 'Xomashyo kam!',
  layoutAdmin: 'Lider Plast',
  layoutSiroRemaining: "Xomashyo qoldig'i",

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
  prTabRawOrders: 'Xomashyo buyurtma',
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
  prRmSubtabNew: 'Yangi buyurtma',
  prRmSubtabHistory: 'Tarix',
  prRmWeightLabel: 'Og\'irlik',
  prRmPendingAlert: 'Omborga kirim kutilmoqda',
  prRmNoPendingOrders: 'Kutilayotchi buyurtma yo\'q',
  prRmDaysWaitingTpl: '{name} · {kg} kg · {days} kun',
  prRmWeightUnitKg: 'kg',
  prRmWeightUnitTon: 'tonna',
  prRmCurrencyLabel: 'Valyuta',
  prRmFxRateLabel: '1 valyuta = necha so\'m (MB)',
  prRmFxCbuHint: 'Kurs https://cbu.uz dan; kerak bo\'lsa qo\'lda tuzatish mumkin',
  prRmPricePerKgLabel: 'Narx — 1 kg uchun (tanlangan valyuta)',
  prRmPricePerKgHint:
    'Narx faqat bitta kilogramm uchun kiritiladi. Umumiy summa (butun buyurtma) quyda avtomatik hisoblanadi.',
  prRmTotalOrderInCurrency: 'Buyurtma bo\'yicha jami',
  prRmAmountUzsEst: 'So\'mda (baholash)',
  prRmCostPerKg: 'kg narxi (so\'m)',
  prRmSubmitOrder: 'Buyurtma berish',
  prRmOrdersHistory: 'Buyurtmalar',
  prRmColOrderedAt: 'Sana',
  prRmMarkFulfilled: 'Yetib keldi',
  prRmFulfilledHint: 'Omborda haqiqiy kirim alohida sahifada',
  prRmStatusPending: 'Kutilmoqda',
  prRmStatusFulfilled: 'Yetib kelgan',
  prRmNoOrders: 'Buyurtmalar yo\'q',
  rmPendingExternalOrdersTitle: 'Buxgalteriyadan tashqi buyurtma (ombor kirimini belgilang)',
  rmOrderMarkArrived: 'Yetib keldi',
  rmOrderArrivedToast: 'Buyurtma yopildi',
  rmIncomingQtyMismatchTitle: 'Miqdor bo\'yicha ogohlantirish',
  rmIncomingQtyMismatchBody:
    'Buxgalteriyadagi kutilayotchi buyurtma: {orderedKg} kg. Siz kiritgan miqdor: {enteredKg} kg. Shu miqdorda omborga qo\'shasizmi?',
  prEmployee: 'Ishchi',
  prEmployeesSubActive: 'Faol ishchilar',
  prEmployeesSubFormer: 'Ishdan chiqqanlar',
  prNoFormerEmployees: 'Ishdan chiqqan ishchilar yo‘q',
  prNoEmployees: "Ishchilar ro'yxati bo'sh",
  prNoVedomost: "Vedomost yaratilmagan. \"Vedomost yaratish\" tugmasini bosing.",
  prTotalBrutto: 'Jami brutto',
  prTotalNet: 'Jami net',
  prTotalTax: 'Jami soliq',
  prSaveSettings: 'Saqlash',
  prEmployeeSavedToast: 'Ishchi maʼlumotlari saqlandi',
  prEmployeeRateSavedToast: 'Mahsulot bo‘yicha stavka saqlandi',
  prEditEmployeeRate: 'Tahrirlash',
  prEmployeeRateEditingNotice:
    'Stavkani yangilash: «{product}». O‘zgartirib, «Saqlash»ni bosing.',
  prEmployeeSaveError: 'Saqlashda xatolik. Qayta urinib ko‘ring.',
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
    'Bank oborotkasi talab qilingan formatda o‘qilmadi yoki saqlashda xatolik bo‘ldi. Tranzaksiyalar bazaga yozilmadi — shu sababli ro‘yxat bo‘sh.',
  prBankTechnicalDetails: 'Texnik tafsilotlar (ixtiyoriy)',
  prBankRejectedEmptyTx: 'Rad etilgan vedemostda tranzaksiyalar yo‘q.',
  prShiftLogTitle: 'Smena bo‘yicha batafsil (tanlangan sana oralig‘i)',
  prEmployeeArchivedBadge: 'Ishdan chiqqan',
  prShiftEmploymentPeriod: 'Smenada ishlagan: {from} — {to}',
  prHireDateLabel: 'Ishga qabul',
  prLeaveDateLabel: 'Ishdan chiqish',
  prShiftLogFilterHint: 'Pastdagi yozuvlar faqat tanlangan sana oralig‘ida: {label}',
  prShiftLogEmpty: 'Bu ishchi uchun tanlangan oralikda smena yozuvi yo‘q',
  prShiftLogTotals: 'Oraliq bo‘yicha jami',
  prColShift: '№',
  prColDefect: 'Brak',
  prColKwh: 'kVt·soat',
  prColPaint: 'Kraska',
  prColCounter: "O'tkich",
  prVedColHintDeduct: 'NETdan chegirildi',
  prVedColHintExempt: 'chegirilmaydi',
  prVedColNetShort: 'B − S',
  prKpiLabelSocial: 'Ijt.',

  invTitle: 'Inventarizatsiya',
  invSubtitle: 'Omborning tizim qoldig‘ini real qoldiq bilan solishtirish',
  invStatusNotStarted: 'Boshlanmagan',
  invStatusInProgress: 'Jarayonda',
  invStatusCompleted: 'Tugallangan',
  invExportExcel: 'Excel eksport',
  invExportPdf: 'PDF eksport',
  invCreateNew: 'Yangi inventarizatsiya',
  invFilterTitle: 'Filtr',
  invFilterDateFrom: 'Boshlanish sanasi',
  invFilterDateTo: 'Tugash sanasi',
  invFilterWarehouse: 'Ombor',
  invFilterStatus: 'Holat',
  invFilterStatusAll: 'Barchasi',
  invFilterDocNumber: 'Hujjat raqami',
  invFilterApply: 'Shakllantirish',
  invFilterReset: 'Filtrni tozalash',
  invDocList: 'Inventarizatsiya hujjatlari',
  invNoRecords: 'Hujjatlar topilmadi',
  invColIndex: '№',
  invColProduct: 'Ko‘rsatkich nomi',
  invColPeriodStart: 'Kun boshiga',
  invColPeriodTurnover: 'Davr aylanishi',
  invColPeriodEnd: 'Kun oxiriga',
  invColSystem: 'Hisobda',
  invColReal: 'Real',
  invColIncoming: 'Kirim',
  invColOutgoing: 'Chiqim',
  invColDifference: 'Farq',
  invFooterTotal: 'Jami',
  invSummaryTitle: 'Yig‘ma hisobot',
  invSummaryOpening: 'Boshlang‘ich qoldiq',
  invSummaryTurnover: 'Davr aylanishi',
  invSummaryClosing: 'Yakuniy qoldiq',
  invSummarySurplus: 'Ortiqcha summa',
  invSummaryShortage: 'Kamomad summa',
  invSummaryDiffTotal: 'Umumiy farq',
  invActionStart: 'Boshlash',
  invActionFinish: 'Tugallash',
  invActionDelete: 'O‘chirish',
  invActionDeleteConfirm: 'Ha, o‘chirish',
  invActionDeleteDescription: 'Tanlangan inventarizatsiya hujjati o‘chiriladi. Bu amalni qaytarib bo‘lmaydi.',
  invConfirmFinishTitle: 'Inventarizatsiyani tugallash',
  invConfirmFinishDescription: 'Tugallangandan so‘ng real qoldiqlar tizim qoldig‘i sifatida saqlanadi. Davom etasizmi?',
  invStockUpdated: 'Tizim qoldig‘i real qoldiq bo‘yicha yangilandi',
  invDocNumberPlaceholder: 'Masalan INV-001',
  invWarehouseDefault: 'Asosiy ombor',
  invCategoryRaw: 'Xomashyo',
  invCategorySemi: 'Qolip',
  invCategoryFinished: 'Tayyor mahsulot',
  invCardDocNumber: 'Hujjat',
  invCardDate: 'Sana',
  invCardWarehouse: 'Ombor',
  invCardItems: 'pozitsiya',
  invEmptyCatalog: 'Omborda pozitsiyalar topilmadi. Avval omborga mahsulot qo‘shing.',
  invSelectRecord: 'Hujjatni tanlang',
  invSelectHint: 'Yuqorida yangi inventarizatsiya yarating yoki ro‘yxatdan tanlang.',
  invToastCreated: 'Yangi inventarizatsiya yaratildi',
  invToastFinished: 'Inventarizatsiya yakunlandi',
  invToastDeleted: 'Inventarizatsiya o‘chirildi',
  invUnitPiece: 'dona',
  invUnitKg: 'kg',
  invShowing: 'Ko‘rsatilmoqda',
  invMobileSwipeHint: 'Jadvalni o‘ngga suring — qo‘shimcha ustunlar bor',
  invFilterRangeLabel: 'Tanlangan davr',
  invStartedAt: 'Yaratilgan',
  invFinishedAt: 'Tugallangan',
  invBack: 'Orqaga',
};

// ======================== RUSSIAN ========================
const ru: T = {
  langName: 'Русский',
  langShort: 'RU',

  navDashboard: 'Панель управления',
  navRawMaterial: 'Сырьё (сырьё / краска)',
  navSemiProduction: 'Производство заготовок',
  navFinalProduction: 'Производство бутылок',
  navWarehouse: 'Склад',
  whSidebarRaw: 'Сырьё',
  whSidebarSemi: 'Полуфабрикаты',
  whSidebarFinal: 'Готовая продукция',
  navSales: 'Продажи',
  navExpenses: 'Расходы',
  navReports: 'Отчёты',
  navShifts: 'Производство',
  navShiftOverConsumption: 'Перерасход сырья',
  poOverTitle: 'Производство: перерасход по рецепту',
  poOverSubtitle:
    'Смены преформ: фактический расход сырья выше расчёта по рецепту (например: вместо 3,95 кг списано 5 кг).',
  poOverAggTitle: 'Продукция + сырьё — суммарный перерасход',
  poOverAggHint:
    'Группировка по названию продукции и сырью; «макс %» — максимальный процент превышения в одной записи.',
  poOverDetailTitle: 'Все записи с перерасходом (время, сотрудник, шт, кг)',
  poOverColProduct: 'Продукция',
  poOverColRaw: 'Сырьё',
  poOverColCases: 'Записей',
  poOverColSumExtra: 'Сумм. перерасход, кг',
  poOverColAvgOverPct: 'Средн. % превыш.',
  poOverColMaxPct: 'Макс % превыш.',
  poOverColWhen: 'Дата / время',
  poOverColWorker: 'Рабочий',
  poOverColMachine: 'Аппарат',
  poOverColGood: 'Готово (шт)',
  poOverColDefect: 'Брак',
  poOverColPlanned: 'План, кг',
  poOverColActual: 'Факт, кг',
  poOverColExtra: 'Перерасход, кг',
  poOverColOverPct: '% превыш.',
  poOverEmpty: 'Пока нет записей с перерасходом (в смене не введён «факт, кг»).',
  poOverLinkFromShift: 'Список перерасхода →',
  poOverBackToShift: 'К сменам',
  navSystemUsers: 'Пользователи системы',
  navInventory: 'Инвентаризация',

  authTitle: 'LiderPlast ERP',
  authSubtitle: 'Вход в систему',
  authIdentifier: 'Телефон или логин',
  authPassword: 'Пароль',
  authSubmit: 'Войти',
  authLoading: 'Загрузка…',
  authMachines: 'Машины',
  authMachinesDisabledHint: 'Адрес CRM не задан (VITE_MACHINES_CRM_URL)',
  authShowPassword: 'Показать пароль',
  authHidePassword: 'Скрыть пароль',
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
  suPermViewRawMaterialBags: 'Мешки сырья (просмотр)',
  suPermManageRawMaterialBags: 'Управление мешками сырья',
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

  apiShiftProductTypeRequired: 'Нужно указать тип продукции',
  apiShiftMachineRequired: 'Нужно выбрать аппарат',
  apiShiftSemiNotFound: 'Полуфабрикат не найден (имя должно совпадать): {label}',
  apiShiftRawInsufficient: 'Недостаточно сырья на складе: {name}',
  apiShiftSemiBalanceMissing: 'Не найден складской остаток для полуфабриката',
  apiShiftFinishedNotFound: 'Готовая продукция не найдена (имя должно совпадать): {label}',
  apiShiftMachineNotLinked:
    'Эта продукция не привязана к данному аппарату (готовая продукция → аппараты)',
  apiShiftFinishedNoSemiRecipe: 'Для готовой продукции нет рецепта полуфабрикатов',
  apiShiftInsufficientSemiStock: 'Недостаточно полуфабриката на складе: {name}',
  apiShiftFinishedBalanceMissing: 'Не найден складской остаток для готовой продукции',
  apiShiftRawOverrideUnknown:
    'Указан фактический расход для сырья вне рецепта (ID): {id}',
  apiShiftRawActualInvalid: 'Некорректный фактический расход (кг): {name}',
  apiShiftRawOverrideSemiOnly:
    'Фактический расход сырья (кг) допустим только для полуфабрикатного (колпак) оборудования',

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
  rmBagConnectPrevHint:
    'В активном мешке есть остаток. Перед подключением нового укажите, что сделать с остатком:',
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
  rmBagsListNoConnected: 'Сейчас к аппарату не подключён ни один мешок.',
  rmBagsListOtherTitle: 'Остальные мешки',
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
  rmBagLogNoteConnectedAfterSwitch:
    'При подключении нового мешка предыдущий заменён — мешок подключён к аппарату',
  rmBagLogNoteConnectedToMachine: 'Мешок подключён к аппарату',
  rmBagLogNoteConnectedReplacement: 'Замена: новый мешок подключён к аппарату',
  rmBagLogNoteDisconnected: 'Мешок отключён',
  rmBagLogNoteDisconnectedTpl: 'Мешок отключён · {reason}',
  rmBagLogNoteDisconnectedBeforeWriteoff: 'Мешок отключён перед списанием',
  rmBagLogNoteWrittenOff: 'Мешок списан',
  rmBagLogNoteWrittenOffTpl: 'Списано · {reason}',
  rmBagLogNoteWrittenOffAfterDisconnect: 'После отключения остаток списан',
  rmBagLogNoteReturnedToWarehouse: 'После отключения мешок возвращён на склад',
  rmBagLogNoteDepleted: 'Мешок исчерпан',
  rmBagLogNoteQuickConsume: 'Быстрый расход из мешка',
  rmBagLogNoteMaterialConsumed: 'Расход материала из активного мешка',
  rmBagLogNoteShiftRecipeSiro: 'Смена: расход сирья по рецепту',
  rmBagLogNoteShiftRecipeSiroBag: 'Смена: расход сирья по рецепту (подключённый мешок)',
  rmBagLogNoteShiftProduction: 'Смена: производство',
  rmBagLogNoteShiftSemiForFinal: 'Смена: расход полуфабриката на готовую продукцию',
  rmBagLogNoteShiftPaint: 'Смена: расход краски',
  rmBagLogNoteShiftPaintBag: 'Смена: расход краски (подключённый мешок)',
  rmBagLogNoteProductionConsumption: 'Производственный расход',
  rmBagLogNoteBagCreated: 'Мешок создан',
  rmBagLogNoteBagCreatedTpl: 'Мешок создан · {name}',
  rmCreateTypeTitle: 'Создать тип сырья',
  rmCreateTypeButton: 'Сохранить тип сырья',
  rmCreateTypePlaceholder: 'Например: PET 9921',
  rmCreateTypeDescPlaceholder: 'Краткое описание сырья',
  rmCreateNameRequired: 'Название сырья обязательно',
  rmCreateError: 'Произошла ошибка при создании типа сырья',
  rmCreatedSuccess: 'Тип сырья успешно создан',
  rmSelectRawMaterialRequired: 'Сначала создайте хотя бы один тип сырья',
  rmDefaultIncomingNote: 'Поступление сырья',
  rmIncomingHint: 'Поступление будет записано на выбранный тип сырья',
  rmDefaultBagWeight: 'Вес одного мешка',
  rmDefaultBagWeightPlaceholder: 'Введите в кг, например: 25',
  rmDefaultBagWeightHint: 'При поступлении мешки будут создаваться автоматически по этому весу',
  rmDefaultBagWeightRequired: 'Укажите вес одного мешка',
  rmDefaultBagWeightPreview: 'Каждый новый мешок: {weight} кг',
  rmIncomingBagWeightHint: 'Автосоздание мешков: каждый мешок по {weight} {unit}',
  rmAutoBagPreview: 'После поступления автоматически создастся {count} мешков. Обычный мешок: {weight} кг, последний: {lastWeight} кг',
  rmAutoBagMissingHint: 'Для автосоздания мешков в каталоге не задан вес одного мешка',
  rmAlertsTitle: 'Предупреждения по типам сырья',
  rmAlertsSubtitle: 'Остаток каждого типа сырья контролируется отдельно',
  rmKindLabel: 'Тип сырья',
  rmKindSiro: 'PET / обычное сырьё',
  rmKindPaint: 'Краска / лак',
  rmPaintHint:
    'Отметьте тип «краска» — в смене будут доступны только позиции этого типа.',
  rmCreatePaintButton: 'Сохранить краску',
  rmSectionOverview: 'Сводные показатели',
  rmSectionOverviewDesc: 'Поступление, расход и остаток: PET и краска',
  rmSectionAlerts: 'Предупреждения',
  rmSectionAlertsDesc: 'Типы сырья с низким остатком',
  rmSectionCreateIncoming: 'Справочник и поступление на склад',
  rmSectionCreateIncomingDesc: 'Новый тип сырья или ввод количества на склад',
  rmSectionLedger: 'Журнал движений',
  rmSectionLedgerDesc: 'Записи поступлений и расхода',
  rmSectionBags: 'Мешки и аппарат',
  rmSectionBagsDesc: 'Активный мешок, подключение и списки',

  dashTitle: 'Панель управления производством',
  dashSubtitle: 'Данные в реальном времени',
  dashSystemActive: 'Система активна',
  dashLowAlert: 'Количество сырья критически мало!',
  dashLowDesc: 'Закажите новое сырьё',
  dashKpiMaterial: 'Остаток сырья',
  dashKpiSemi: 'Склад заготовок',
  dashKpiFinal: 'Склад готовой продукции',
  dashKpiTodayProd: 'Производство сегодня',
  dashKpiTodaySales: 'Продажи сегодня',
  dashChartProd: 'Тренд производства',
  dashChartLast7: 'Последние 7 дней',
  dashChartMaterial: 'Движение сырья',
  dashChartKg: 'кг',
  dashProdYarimTayyor: 'Полуфабрикат',
  dashProdTayyor: 'Готовая продукция',
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

  rmTitle: 'Управление сырьём и краской',
  rmTotalIn: 'Всего поступило',
  rmTotalOut: 'Всего использовано',
  rmRemaining: 'Остаток сырья',
  rmRemainingPaint: 'Остаток краски / красителя',
  rmStockLevel: 'Заполненность склада',
  rmNewEntry: 'Новое поступление сырья',
  rmIncomingTitleSiro: 'Новое поступление сырья (PET)',
  rmIncomingTitlePaint: 'Новое поступление краски',
  rmIncomingTabSiro: 'PET / сырьё',
  rmIncomingTabPaint: 'Краска',
  rmIncomingHintPaint: 'Поступление будет записано на выбранную позицию краски.',
  rmPlaceholderDescPaint: 'Поступление краски...',
  rmMetricsCaptionSiro: 'PET / сырьё',
  rmMetricsCaptionPaint: 'Краска / краситель',
  rmAlertsTitlePaint: 'Предупреждения по краске',
  rmAlertsSubtitlePaint: 'Остаток каждой позиции краски отслеживается отдельно',
  rmSelectPaintRequired: 'Сначала создайте сырьё с типом «краска»',
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
  whTabOverview: 'Общие показатели',
  whTabCatalog: 'Каталог',
  whTabStats: 'Статистика',
  whTabHistory: 'История',
  whHistoryTitle: 'История производства',
  whHistorySubtitle:
    'Партии (/production) и смены: расход сырья, краски, заготовок — при совпадении с каталогом считается по рецепту.',
  whHistoryEmpty: 'Записей производства пока нет.',
  whHistoryColWhen: 'Время',
  whHistoryColSource: 'Источник',
  whHistorySourceProduction: 'Партия',
  whHistorySourceShift: 'Смена',
  whHistoryShiftShort: 'Смена',
  whHistoryColType: 'Тип',
  whHistoryColOutput: 'Выпуск',
  whHistoryColQty: 'Кол-во',
  whHistoryColConsumed: 'Расход',
  whHistoryTypeSemi: 'Заготовка',
  whHistoryTypeFinal: 'Готовый',
  whHistoryKindRaw: 'Сырьё',
  whHistoryKindSemi: 'Заготовка',
  whHistoryPlannedKg: 'план',
  whHistoryExtraKg: 'перерасход',
  whRecipePerPiece: 'На 1 шт. заготовки (каталог)',
  whRecipePerThousand: '1000 шт. ≈',
  whMaterial: 'ПЭТ Сырьё',
  whSemi: 'Полуфабрикат (заготовка)',
  whFinal: 'Готовый продукт',
  whTotalProd: 'Всего продукции',
  whInWarehouse: 'На складе',
  whDetailed: 'Подробное состояние склада',
  whStockBreakdownEmpty:
    'Здесь отображаются только позиции по типам из каталога. Сначала добавьте продукт.',
  whSemiStats: 'Полуфабрикаты',
  whFinalStats: 'Готовая продукция',
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
  whSemiBreakdownTitle: 'Полуфабрикат — рецепт и краска',
  whSemiStockPieces: 'Остаток заготовок',
  whRecipeRaw: 'Рецепт из каталога (на 1 шт.)',
  whShiftPaintTotal: 'Краска по сменам (всего)',

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
  slDeleteClientTitle: 'Удалить клиента из списка?',
  slDeleteClientHint:
    'Клиент исчезнет из списка; история продаж и платежей сохранится.',
  slDeleteClientAction: 'Да, удалить',
  slCompanyName: 'LiderPlast',
  slDebtStatusYes: 'Есть долг',
  slDebtStatusNo: 'Долга нет',

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
  exHistoryFullscreenEnter: 'На весь экран',
  exHistoryFullscreenExit: 'Закрыть (Esc)',
  exColAmount: 'Сумма',
  exCategoriesTitle: 'Категории расходов',
  exCategoryAdd: 'Новая категория',
  exCategoryName: 'Название',
  exCategoryDelete: 'Удалить',
  exCategoryDeleteTitle: 'Убрать категорию из списка?',
  exCategoryDeleteHint: 'Категория скрывается из списка; записи в истории сохраняются.',
  exCategoryLabelRawMaterialExternalOrder: 'Сырьё: внешний заказ',
  exCategoryLabelRawMaterialBagWriteoff: 'Сырьё: списание мешка',
  exStatsByCategory: 'Статистика по категориям',
  exStatsViewTable: 'Таблица',
  exStatsViewDonut: 'Круговая',
  exStatsViewBars: 'Столбцы',
  exStatsRank: '#',
  exNoCategories: 'Нет категорий. Сначала создайте категорию.',
  exPageStatsNote:
    'Диаграмма и сводка сверху — за всё время. Таблица «История» — по выбранному фильтру дат.',
  exNoMachinesElectric:
    'Для расхода на электроэнергию список станков пуст. Пусть администратор добавит станки в `/production/machines`.',
  exGlobalElectricityPriceTitle: 'Цена за кВт·ч (вся электроэнергия)',
  exShiftElectricityExplain:
    'Эта цена применяется к автоматическим расходам: кВт·ч из «Истории смен» × сум; при сохранении или изменении смены расход пересчитывается.',
  exFromShiftBadge: 'Смена',
  exNoteBagCuidDisplay: 'Мешок №…{suffix}',
  exNotePurchaseOrderTpl:
    '{kg} кг · {currency} {amount} · курс {rate} → {uzs} {unit}',
  exNoteKgPriceLastOrder:
    'Цена за кг: {price} сум (по последнему внешнему заказу)',
  exNoteKgPricePendingOrder:
    'Цена за кг: {price} сум (ожидающий внешний заказ, на склад ещё не поступил)',
  exNoteKgPriceMissing: 'Цена за кг по внешнему заказу не найдена — 0 сум',
  exShiftExpenseNote:
    '{date}, смена {n} — {worker}; {machine} — {kwh} кВт·ч × {price} {unit}',
  exElectricityPriceButton: 'Тариф электроэнергии (кВт·ч)',
  exElectricityPriceNavShort: 'кВт·ч',
  exElectricityPriceSaved: 'Цена за кВт·ч обновлена',
  exElectricityPriceErrorEndpoint404:
    '404: на сервере нет нового API для тарифа электроэнергии или запущена старая версия backend. Перезапустите backend из папки проекта с актуальным кодом (например, `npm run start:dev`). Сообщение «Cannot PATCH … electricity-price» означает именно это.',

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
  repEffNoMachines:
    'Список аппаратов пуст. Добавьте аппарат на странице «Смены» — здесь появится эффективность.',
  repEffPlannedHourly: 'Норма в час (шт)',
  repEffActualHourly: 'Фактически в среднем (всего ÷ время)',
  repEffUnitPcsPerHour: 'шт/ч',
  repEffTotalShort: 'Всего выпущено:',
  repEffLimitShort: 'Лимит по норме:',
  repEffAssumedHours: 'Учётное время: {{h}} ч (~8 ч на партию/смену).',
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
  prTabRawOrders: 'Заказ сырья',
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
  prRmSubtabNew: 'Новый заказ',
  prRmSubtabHistory: 'История',
  prRmWeightLabel: 'Масса',
  prRmPendingAlert: 'Ожидается оприходование',
  prRmNoPendingOrders: 'Нет ожидающих заказов',
  prRmDaysWaitingTpl: '{name} · {kg} кг · {days} дн.',
  prRmWeightUnitKg: 'кг',
  prRmWeightUnitTon: 'т',
  prRmCurrencyLabel: 'Валюта',
  prRmFxRateLabel: '1 ед. валюты = сум (ЦБ)',
  prRmFxCbuHint: 'Курс с https://cbu.uz; при необходимости вручную',
  prRmPricePerKgLabel: 'Цена за 1 кг (в выбранной валюте)',
  prRmPricePerKgHint:
    'Вводится цена только за один килограмм. Общая сумма по заказу ниже считается автоматически.',
  prRmTotalOrderInCurrency: 'Итого по заказу',
  prRmAmountUzsEst: 'В сумах (оценка)',
  prRmCostPerKg: 'Цена за кг (сум)',
  prRmSubmitOrder: 'Разместить заказ',
  prRmOrdersHistory: 'Заказы',
  prRmColOrderedAt: 'Дата',
  prRmMarkFulfilled: 'Поступило',
  prRmFulfilledHint: 'Фактическое оприходование — на другой странице',
  prRmStatusPending: 'Ожидает',
  prRmStatusFulfilled: 'Поступило',
  prRmNoOrders: 'Нет заказов',
  rmPendingExternalOrdersTitle: 'Внешний заказ из бухгалтерии (отметьте поступление)',
  rmOrderMarkArrived: 'Поступило',
  rmOrderArrivedToast: 'Заказ закрыт',
  rmIncomingQtyMismatchTitle: 'Предупреждение по количеству',
  rmIncomingQtyMismatchBody:
    'Ожидается по заказу из бухгалтерии: {orderedKg} кг. Вы вводите: {enteredKg} кг. Оприходовать именно это количество?',
  prEmployee: 'Сотрудник',
  prEmployeesSubActive: 'Действующие',
  prEmployeesSubFormer: 'Уволенные',
  prNoFormerEmployees: 'Нет уволенных сотрудников',
  prNoEmployees: 'Список сотрудников пуст',
  prNoVedomost: 'Ведомость не сформирована. Нажмите "Сформировать ведомость".',
  prTotalBrutto: 'Итого брутто',
  prTotalNet: 'Итого нет',
  prTotalTax: 'Итого налоги',
  prSaveSettings: 'Сохранить',
  prEmployeeSavedToast: 'Данные сотрудника сохранены',
  prEmployeeRateSavedToast: 'Тарифная ставка по продукту сохранена',
  prEditEmployeeRate: 'Изменить',
  prEmployeeRateEditingNotice:
    'Редактирование ставки: «{product}». Внесите изменения и нажмите «Сохранить».',
  prEmployeeSaveError: 'Ошибка сохранения. Попробуйте снова.',
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
    'Выписка не была разобрана в ожидаемом формате или при сохранении произошла ошибка. Транзакции в базу не записаны — поэтому список пуст.',
  prBankTechnicalDetails: 'Технические подробности (по желанию)',
  prBankRejectedEmptyTx: 'У отклонённой ведомости нет транзакций.',
  prShiftLogTitle: 'Детали по сменам (выбранный период дат)',
  prEmployeeArchivedBadge: 'Уволен',
  prShiftEmploymentPeriod: 'Смены: {from} — {to}',
  prHireDateLabel: 'Приём',
  prLeaveDateLabel: 'Увольнение',
  prShiftLogFilterHint: 'Ниже только записи за выбранный период: {label}',
  prShiftLogEmpty: 'У этого сотрудника нет записей смен за выбранный период',
  prShiftLogTotals: 'Итого за период',
  prColShift: '№',
  prColDefect: 'Брак',
  prColKwh: 'кВт·ч',
  prColPaint: 'Краска',
  prColCounter: 'Счётчик',
  prVedColHintDeduct: 'Удерж. из НЕТ',
  prVedColHintExempt: 'не удерж.',
  prVedColNetShort: 'Б − Н',
  prKpiLabelSocial: 'Соц.',

  invTitle: 'Инвентаризация',
  invSubtitle: 'Сверка системного остатка склада с фактическим',
  invStatusNotStarted: 'Не начата',
  invStatusInProgress: 'В процессе',
  invStatusCompleted: 'Завершена',
  invExportExcel: 'Экспорт Excel',
  invExportPdf: 'Экспорт PDF',
  invCreateNew: 'Новая инвентаризация',
  invFilterTitle: 'Фильтр',
  invFilterDateFrom: 'Дата начала',
  invFilterDateTo: 'Дата окончания',
  invFilterWarehouse: 'Склад',
  invFilterStatus: 'Статус',
  invFilterStatusAll: 'Все',
  invFilterDocNumber: 'Номер документа',
  invFilterApply: 'Сформировать',
  invFilterReset: 'Сбросить фильтр',
  invDocList: 'Документы инвентаризации',
  invNoRecords: 'Документов не найдено',
  invColIndex: '№',
  invColProduct: 'Наименование',
  invColPeriodStart: 'На начало',
  invColPeriodTurnover: 'Оборот за период',
  invColPeriodEnd: 'На конец',
  invColSystem: 'Учётный',
  invColReal: 'Фактический',
  invColIncoming: 'Приход',
  invColOutgoing: 'Расход',
  invColDifference: 'Разница',
  invFooterTotal: 'Итого',
  invSummaryTitle: 'Сводный отчёт',
  invSummaryOpening: 'Начальный остаток',
  invSummaryTurnover: 'Оборот за период',
  invSummaryClosing: 'Конечный остаток',
  invSummarySurplus: 'Излишки',
  invSummaryShortage: 'Недостача',
  invSummaryDiffTotal: 'Общая разница',
  invActionStart: 'Начать',
  invActionFinish: 'Завершить',
  invActionDelete: 'Удалить',
  invActionDeleteConfirm: 'Да, удалить',
  invActionDeleteDescription: 'Выбранный документ инвентаризации будет удалён. Действие необратимо.',
  invConfirmFinishTitle: 'Завершить инвентаризацию',
  invConfirmFinishDescription: 'После завершения фактические остатки будут сохранены как учётные. Продолжить?',
  invStockUpdated: 'Учётный остаток обновлён по фактическим данным',
  invDocNumberPlaceholder: 'Например INV-001',
  invWarehouseDefault: 'Основной склад',
  invCategoryRaw: 'Сырьё',
  invCategorySemi: 'Заготовка',
  invCategoryFinished: 'Готовая продукция',
  invCardDocNumber: 'Документ',
  invCardDate: 'Дата',
  invCardWarehouse: 'Склад',
  invCardItems: 'позиций',
  invEmptyCatalog: 'На складе позиции отсутствуют. Сначала добавьте продукцию на склад.',
  invSelectRecord: 'Выберите документ',
  invSelectHint: 'Создайте новую инвентаризацию выше или выберите из списка.',
  invToastCreated: 'Инвентаризация создана',
  invToastFinished: 'Инвентаризация завершена',
  invToastDeleted: 'Инвентаризация удалена',
  invUnitPiece: 'шт',
  invUnitKg: 'кг',
  invShowing: 'Отображено',
  invMobileSwipeHint: 'Прокрутите таблицу вправо — есть дополнительные колонки',
  invFilterRangeLabel: 'Выбранный период',
  invStartedAt: 'Создана',
  invFinishedAt: 'Завершена',
  invBack: 'Назад',
};

export const translations: Record<Language, T> = {
  uz_cyrillic,
  uz_latin,
  ru,
};