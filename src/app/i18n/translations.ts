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
  /** Xomashyo — ichki sahifa (sidebar Ombor) */
  rmSidebarCatalog: string;
  rmSidebarWarehouseStock: string;
  rmWarehouseStockPageDesc: string;
  rmWarehouseStockTotal: string;
  rmWarehouseStockEmpty: string;
  rmDeleteConfirmDesc: string;
  navSales: string;
  navExpenses: string;
  navSuppliers: string;
  navCompanyAssets: string;
  caTitle: string;
  caSubtitle: string;
  caAddAsset: string;
  caEditAsset: string;
  caStatTotal: string;
  caStatActive: string;
  caStatRepair: string;
  caStatWarehouse: string;
  caStatWrittenOff: string;
  caStatTotalValue: string;
  caSearchName: string;
  caSearchInventory: string;
  caFilterStatus: string;
  caFilterCategory: string;
  caFilterLocation: string;
  caFilterEmployee: string;
  caAll: string;
  caColId: string;
  caColInventory: string;
  caColName: string;
  caColCategory: string;
  caColEmployee: string;
  caColLocation: string;
  caColPurchased: string;
  caColInitialValue: string;
  caColCondition: string;
  caColStatus: string;
  caColNotes: string;
  caColActions: string;
  caStatusActive: string;
  caStatusNeedsRepair: string;
  caStatusUnderRepair: string;
  caStatusRepair: string;
  caStatusWarehouse: string;
  caStatusWrittenOff: string;
  caSelectAllStatuses: string;
  caClearStatuses: string;
  caFilterStatusesSelected: string;
  caCatTransport: string;
  caCatOffice: string;
  caCatComputer: string;
  caCatProduction: string;
  caCatTech: string;
  caCatFurniture: string;
  caCatOther: string;
  caCondNew: string;
  caCondGood: string;
  caCondFair: string;
  caCondPoor: string;
  caFieldName: string;
  caFieldInventory: string;
  caFieldSerial: string;
  caFieldCategory: string;
  caFieldManufacturer: string;
  caFieldModel: string;
  caFieldPurchaseDate: string;
  caFieldPurchasePrice: string;
  caFieldCurrency: string;
  caFieldFxRate: string;
  caFxCbuHint: string;
  caFieldWarranty: string;
  caFieldEmployee: string;
  caFieldLocation: string;
  caFieldCondition: string;
  caFieldStatus: string;
  caFieldImage: string;
  caFieldDocuments: string;
  caFieldNotes: string;
  caAmountUzsPreview: string;
  caValueRateDan: string;
  caValueUsdUnit: string;
  caDetailTitle: string;
  caTabInfo: string;
  caTabHistory: string;
  caTabDocuments: string;
  caTabExpense: string;
  caExpenseAssetPrefix: string;
  caViewImageFullscreen: string;
  caCloseImage: string;
  caNoImage: string;
  caImageUploaded: string;
  caActCreated: string;
  caActUpdated: string;
  caActAssigned: string;
  caActReturned: string;
  caActRepair: string;
  caActWrittenOff: string;
  caActDeleted: string;
  caDelete: string;
  caDeleteConfirmTitle: string;
  caDeleteConfirmDesc: string;
  caDeletedSuccess: string;
  caAuditTitle: string;
  caAuditCreated: string;
  caAuditUpdated: string;
  caAuditDeleted: string;
  caAuditPerformedBy: string;
  caAuditUnknown: string;
  caExportExcel: string;
  caExportPdf: string;
  caPrint: string;
  caPrintPrintedAt: string;
  caPrintRecordCount: string;
  caPrintTotalValue: string;
  caPrintDocTitle: string;
  caPrintAsOf: string;
  caPrintUnit: string;
  caPrintColNo: string;
  caPrintColName: string;
  caPrintColUnit: string;
  caPrintColQty: string;
  caPrintColInUse: string;
  caPrintColUsableIdle: string;
  caPrintColRepairable: string;
  caPrintColObsolete: string;
  caPrintColIrreparable: string;
  caPrintColPriceUsd: string;
  caPrintFxPerUsd: string;
  caPrintCbuRate: string;
  caPrintSom: string;
  caPrintMarkGood: string;
  caPrintMarkOld: string;
  caPrintMarkRepair: string;
  caPrintMarkRestore: string;
  caExportSheetName: string;
  caPrintTotal: string;
  caPrintSignShopHead: string;
  caPrintSignChiefAccountant: string;
  caPrintSignDirector: string;
  caPrintSignFounder: string;
  caPrintBlocked: string;
  caExportError: string;
  caBulkStatus: string;
  caBulkApply: string;
  caSelected: string;
  caSave: string;
  caCancel: string;
  caView: string;
  caPage: string;
  caOf: string;
  caNoEmployee: string;
  caAutoInventory: string;
  caExpenseLinked: string;
  caChooseFile: string;
  caNoFileChosen: string;
  caRemoveFile: string;
  caFileUploaded: string;
  caErrNameRequired: string;
  caErrPurchasePriceRequired: string;
  caErrPurchasePriceInvalid: string;
  caErrFxRateRequired: string;
  caErrFxRateInvalid: string;
  caErrDateInvalid: string;
  caErrValidationGeneric: string;
  caErrInventoryDuplicate: string;
  caErrEmployeeNotFound: string;
  caErrNotFound: string;
  caErrFileTooLarge: string;
  caErrPayloadTooLarge: string;
  supTitle: string;
  supSubtitle: string;
  supFormTitle: string;
  supReadOnlyHint: string;
  supTabOrders: string;
  supTabPurchase: string;
  supTabHistory: string;
  supTabSuppliers: string;
  supEditSupplier: string;
  supDebtAmountLabel: string;
  supListTitle: string;
  supListCount: string;
  supSearchPlaceholder: string;
  supNoSearchResults: string;
  supSuppliersHint: string;
  supAddSupplier: string;
  supColName: string;
  supColAddress: string;
  supColSupplier: string;
  supColQty: string;
  supNoSuppliers: string;
  supSelectSupplier: string;
  supProductCategory: string;
  supProductName: string;
  supChooseProduct: string;
  supNoProductsInCategory: string;
  supCatRaw: string;
  supCatSemi: string;
  supCatFinal: string;
  supQuantityLabel: string;
  supQtyUnitLabel: string;
  supUnitPieces: string;
  supPricePerPieceLabel: string;
  supPricePerKgLabel: string;
  supPaymentType: string;
  supPaymentCash: string;
  supPaymentCredit: string;
  supPaidNowLabel: string;
  supDebtDueDate: string;
  supDebtRemaining: string;
  supPendingTpl: string;
  supSubmitPurchase: string;
  supAddLine: string;
  supLinesTitle: string;
  supNoLinesHint: string;
  supLineColAmount: string;
  supRemoveLine: string;
  supLinesCount: string;
  supLinePreview: string;
  supNoWarehousePurchasePrice: string;
  supHistoryDownload: string;
  supDownloadAllPdf: string;
  supBulkPdfTitle: string;
  supSinglePdfTitle: string;
  supPdfDocFrom: string;
  supPdfGenerated: string;
  supSelectForPdf: string;
  supSelectedCount: string;
  supPdfAccountant: string;
  supPdfWarehouse: string;
  supPdfSupplierSign: string;
  supPdfColPrice: string;
  supPdfRecordsCount: string;
  supPdfTotalUzs: string;
  supEditPurchase: string;
  supDeletePurchase: string;
  supDeletePurchaseConfirm: string;
  supLegacyNoEdit: string;
  supPurchaseStockHint: string;
  navReports: string;
  navShifts: string;
  /** Smena ichidagi tab: qolip bo‘yicha siro tarixi */
  shiftRmHistTitle: string;
  shiftRmHistSubtitle: string;
  shiftRmHistAggTitle: string;
  shiftRmHistAggHint: string;
  shiftRmHistDetailTitle: string;
  shiftRmHistColProduct: string;
  shiftRmHistColRaw: string;
  shiftRmHistColCases: string;
  shiftRmHistColPlannedSum: string;
  shiftRmHistColActualSum: string;
  shiftRmHistColDeltaSum: string;
  shiftRmHistColAvgOverPct: string;
  shiftRmHistColMaxOverPct: string;
  shiftRmHistColWhen: string;
  shiftRmHistColWorker: string;
  shiftRmHistColMachine: string;
  shiftRmHistColGood: string;
  shiftRmHistColDefect: string;
  shiftRmHistColPlanned: string;
  shiftRmHistColActual: string;
  shiftRmHistColDelta: string;
  shiftRmHistColOverPct: string;
  shiftRmHistEmpty: string;
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
  authSaralash: string;
  authVazifa: string;
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
  suPermViewInventory: string;
  suPermViewSales: string;
  suPermViewExpenses: string;
  suPermViewSuppliers: string;
  suPermManageSuppliers: string;
  suPermViewPayroll: string;
  suPermViewVedomost: string;
  suPermCreateVedomost: string;
  suPermViewReports: string;
  suPermManageSettings: string;
  suPermManageUsers: string;
  suPermViewCompanyAssets: string;
  suPermManageCompanyAssets: string;

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
  dfDotProduction: string;
  dfDotSales: string;
  dfDotPurchase: string;

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
  apiShiftInsufficientUnpackagedStock: string;
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
  labelCurrency: string;
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
  unitBag: string;
  unitSum: string;
  whPiecesPerBag: string;
  whPiecesPerBagRequired: string;
  whPricingSection: string;
  whPricingOptional: string;
  whPurchasePrice: string;
  whSalePrice: string;
  whFxRateToUzs: string;
  whFxRateHint: string;
  whFxApplyCbu: string;
  whCbuRatesTitle: string;
  whCbuRatesLoading: string;
  whCbuRatesUsd: string;
  whCbuRatesEur: string;
  whCbuRatesError: string;
  whCbuRatesRetry: string;
  whPricingInvalid: string;
  whPriceInUzs: string;
  whCatalogPiecesPerBag: string;
  whCatalogPackLabel: string;
  whCatalogPackValue: string;
  whCatalogComposition: string;
  whCatalogMachines: string;
  whCatalogSemiLinked: string;
  whCatalogVolume: string;
  whCatalogItemsCount: string;
  whCatalogFxLabel: string;
  whCatalogFxValue: string;
  whStockPackSubtitle: string;
  whStockPackSubtitleFull: string;
  whStockLinePacked: string;
  whStockLineUnpackaged: string;
  whStockLineAllPackaged: string;
  whExportExcel: string;
  whExportPrint: string;
  whExportScopeTitle: string;
  whExportScopeDescription: string;
  whExportScopeCurrent: string;
  whExportScopeBothCombined: string;
  whExportScopeBothSeparate: string;
  whExportSelectProducts: string;
  whExportSelectAll: string;
  whExportSelectedCount: string;
  whExportNoneSelected: string;
  whExportConfirm: string;
  whExportColNum: string;
  whExportColName: string;
  whExportColUnit: string;
  whExportColSalePrice: string;
  whExportColQty: string;
  whExportColTotalUzs: string;
  whExportColTotalUsd: string;
  whExportColType: string;
  whExportSectionSemi: string;
  whExportSectionFinal: string;
  whExportTypeSemi: string;
  whExportTypeFinal: string;
  whExportGrandTotal: string;
  whExportPrintedAt: string;
  whExportDocTitleSemi: string;
  whExportDocTitleFinal: string;
  whExportNoPrice: string;
  whCatalogSearchPlaceholder: string;
  whCatalogNoSearchResults: string;
  whOverviewViewCards: string;
  whOverviewViewTable: string;
  whOverviewColPack: string;
  whOverviewColFill: string;
  whOverviewColProfit: string;
  whProfitRawLine: string;
  whProfitSemiLine: string;
  whProfitSaleLine: string;
  whProfitValueLine: string;
  whProfitSemiAddonLine: string;
  whProfitTotalLine: string;
  whOverviewShowProfit: string;
  whOverviewIncludeSemiProfit: string;
  whExportProfitOptionsTitle: string;
  whExportShowProfit: string;
  whExportIncludeSemiProfit: string;
  whOverviewFullscreenEnter: string;
  whOverviewFullscreenExit: string;
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
  dashCbuUpdatedOk: string;
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
  rmStatsCatalogTotal: string;

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
  whErrProductNotFound: string;
  whErrRawMaterialsNotFound: string;
  whErrMachinesNotFound: string;
  whRawMaterialUnavailable: string;
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
  slStockNotEnough: string;
  slStockNeeded: string;
  slAvailableProducts: string;
  slNewClient: string;
  slClientList: string;
  slDebtPaid: string;
  slBtn: string;
  slAddToCart: string;
  slCart: string;
  slCartEmpty: string;
  slHistoryIgnoresDateFilter: string;
  slHistoryDebtHint: string;
  slPdfDownloadFailed: string;
  slPrintDeliveryTitle: string;
  slVehiclePlate: string;
  slVehiclePlatePlaceholder: string;
  slDriverName: string;
  slDriverNamePlaceholder: string;
  slDeliveryDefaultsHint: string;
  slSelectAll: string;
  slDeselectAll: string;
  slSelectedCount: string;
  slDownloadSelectedPdf: string;
  slBulkPdfSummaryTitle: string;
  slSelectSalesForPdf: string;
  slEditSale: string;
  slEditSaleTitle: string;
  slSaveSaleEdit: string;
  slSaleUpdated: string;
  slSaleUpdateFailed: string;
  slApiClientRemoved: string;
  slApiClientNotFound: string;
  slApiPaidExceedsTotal: string;
  slApiPaidBelowRecorded: string;
  slEditLine: string;
  slSaveLine: string;
  slEditingLine: string;
  slFinishLineEdit: string;
  slClientSearchPlaceholder: string;
  slSaleFxRate: string;
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
  /** Тарих жадвали — амаллар устуни */
  exHistoryColActions: string;
  exHistoryColUser: string;
  exAuditCreated: string;
  exAuditUpdated: string;
  exExpenseEditTitle: string;
  exExpenseDeleteTitle: string;
  exExpenseDeleteHint: string;
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
  /** Tashqi buyurtma kategoriyasi qo‘lda kiritilmaydi */
  exExternalOrderManualBlocked: string;
  /** Diagramma va yuqori statistika barcha vaqt; tarix jadvali sana filtri bo‘yicha */
  exPageStatsNote: string;
  exTrendTitle: string;
  exTrendWeek: string;
  exTrendMonth: string;
  exTrendYear: string;
  exTopCategories: string;
  exFundingSourceLabel: string;
  exFundingSourcesTitle: string;
  exFundingSourceAdd: string;
  exFundingSourceName: string;
  exFundingSourceDelete: string;
  exFundingSourceDeleteTitle: string;
  exFundingSourceDeleteHint: string;
  exNoFundingSources: string;
  exFundingSourceRequired: string;
  exFundingReportTitle: string;
  exHistoryColFundingSource: string;
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
  cdEdit: string;

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
  prTabKassa: string;
  prTabClients: string;
  prTabSuppliers: string;
  prClientsSearch: string;
  prClientPurchaseHistory: string;
  prClientNoSales: string;
  prSupplierPurchaseHistory: string;
  prSupplierNoOrders: string;
  prColPrepaid: string;
  prKassaBalance: string;
  prKassaTotalInflow: string;
  prKassaTotalOutflow: string;
  prKassaInflowSection: string;
  prKassaOutflowSection: string;
  prKassaAddInflow: string;
  prKassaAddOutflow: string;
  prKassaClient: string;
  prKassaAmount: string;
  prKassaComment: string;
  prKassaDate: string;
  prKassaCreatedBy: string;
  prKassaNoInflows: string;
  prKassaNoOutflows: string;
  prKassaDeleteInflowTitle: string;
  prKassaDeleteInflowConfirm: string;
  prKassaDeleteOutflowTitle: string;
  prKassaDeleteOutflowConfirm: string;
  prKassaEditInflow: string;
  prKassaEditOutflow: string;
  slClientCashBalance: string;
  prKassaSelectClient: string;
  prKassaNoClients: string;
  prGenerate: string;
  /** Vedomostni butunlay o‘chirish / yopish */
  prCloseVedomost: string;
  prCloseVedomostTitle: string;
  /** `{month}` — oy nomi */
  prCloseVedomostConfirm: string;
  prCloseVedomostPaidBlocked: string;
  prCloseVedomostSuccess: string;
  prCloseVedomostAction: string;
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

  // Statement import wizard (Excel ko'chirma)
  siImportTitle: string;
  siImportHint: string;
  siImportAction: string;
  siUploading: string;
  siUploadSuccess: string;
  siUploadError: string;
  siStatementsList: string;
  siNoStatements: string;
  siReviewPending: string;
  siAllReviewed: string;
  siRowsTitle: string;
  siColDate: string;
  siColType: string;
  siColAmount: string;
  siColCounterparty: string;
  siColAccount: string;
  siColBankCode: string;
  siColCompanyAccount: string;
  siColCompanyBank: string;
  siColCompanyStir: string;
  siColPurpose: string;
  siColStatus: string;
  siColLink: string;
  siColCreatedBy: string;
  siColActions: string;
  siTypeIncome: string;
  siTypeExpense: string;
  siStatusPending: string;
  siStatusConfirmed: string;
  siStatusSkipped: string;
  siKindClient: string;
  siKindSupplier: string;
  siKindCompany: string;
  siKindUnknown: string;
  siWizardTitle: string;
  siWizardStep: string;
  siRowStir: string;
  siQuestionClient: string;
  siQuestionExpense: string;
  siClientMatched: string;
  siClientNotFound: string;
  siSupplierMatched: string;
  siSupplierNotFound: string;
  siCompanyRowNote: string;
  siSelectClient: string;
  siSelectSupplier: string;
  siSupplierOptional: string;
  siSelectCategory: string;
  siModeClient: string;
  siModeKassa: string;
  siModeExpense: string;
  siQuestionKassa: string;
  siKassaInflowHint: string;
  prKassaBankInflow: string;
  siConfirmYes: string;
  siConfirmAndEdit: string;
  siSkip: string;
  siManual: string;
  siCreateClient: string;
  siCreateSupplier: string;
  siCreateCategory: string;
  siCategoryNotFound: string;
  siCategoryMatched: string;
  siNewName: string;
  siNewPhone: string;
  siNext: string;
  siPrev: string;
  siRowConfirmed: string;
  siRowSkipped: string;
  siRowDeleted: string;
  siNeedClient: string;
  siNeedCategory: string;
  siUnclearHint: string;
  siEditRowTitle: string;
  siDeleteRowTitle: string;
  siDeleteRowConfirm: string;
  siDeleteStatementTitle: string;
  siDeleteStatementConfirm: string;
  siStatementDeleted: string;
  siBankBalance: string;
  siBankIncomeTotal: string;
  siBankExpenseTotal: string;
  siBankAccount: string;
  siBankName: string;
  siStir: string;
  siSourceBank: string;
  siSourceKassa: string;
  siPendingBadge: string;
  siCompanyAccountsTitle: string;
  siCompanyAccountsHint: string;
  siAccountNumber: string;
  siAccountLabel: string;
  siAddAccount: string;
  siNoCompanyAccounts: string;
  siAccountAdded: string;
  siAccountDeleted: string;
  siActiveBankAccount: string;
  siSelectBankAccount: string;
  siAccountActivated: string;
  siAccountChangedBy: string;
  siAllAccountsBalance: string;
  siNoCompanyAccountsBalanceHint: string;
  siOpenCompanyAccountsSettings: string;
  siAccountActiveBadge: string;
  siErrInvalidAmount: string;
  siErrInvalidDate: string;
  siErrValidation: string;
  siErrKassaModeBackend: string;
  siErrFileRequired: string;
  siErrStatementNotFound: string;
  siErrRowNotFound: string;
  siErrRowAlreadyConfirmed: string;
  siErrClientPhoneAllocate: string;
  siErrSkipConfirmed: string;
  siErrEditConfirmed: string;
  siErrAccountRequired: string;
  siErrAccountDuplicate: string;
  siErrAccountNotFound: string;
  siErrNameRequired: string;
  siTableFullscreenEnter: string;
  siTableFullscreenExit: string;
  siTableScrollLeft: string;
  siTableScrollRight: string;
  siTableScrollHint: string;
  siTablePageInfo: string;

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
  invQtyKgHint: string;
  invLoadFailed: string;
  invSaveFailed: string;
  invStockNegativeError: string;
  invLoading: string;
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
  rmSidebarCatalog: 'Хомашё',
  rmSidebarWarehouseStock: 'Омбордаги қолдиқ',
  rmWarehouseStockPageDesc:
    'Каталогдаги ҳар бир хомашё тури учун омбордаги қолдиқ (килограмм).',
  rmWarehouseStockTotal: 'Жами хомашё',
  rmWarehouseStockEmpty: 'Хомашё каталоги бўш — аввал тур яратинг.',
  rmDeleteConfirmDesc:
    '«{name}» ўчирилади: қолдиқ {kg} кг, барча қоплар ва омбор ҳаракатлари ёзувлари ҳам тозаланади. Давом этасизми?',
  navSales: 'Сотув',
  navExpenses: 'Харажатлар',
  navSuppliers: 'Етказиб берувчи',
  navCompanyAssets: 'Корхона мулки',
  caTitle: 'Корхона мулки',
  caSubtitle: 'Асосий воситаларни ҳисобга олиш ва бошқариш',
  caAddAsset: 'Мулк қўшиш',
  caEditAsset: 'Таҳрирлаш',
  caStatTotal: 'Жами мулклар',
  caStatActive: 'Фаол',
  caStatRepair: 'Таъмирда',
  caStatWarehouse: 'Омборда',
  caStatWrittenOff: 'Ҳисобдан чиқарилган',
  caStatTotalValue: 'Жами қиймат',
  caSearchName: 'Мулк номи бўйича',
  caSearchInventory: 'Инвентар рақами',
  caFilterStatus: 'Статус',
  caFilterCategory: 'Категория',
  caFilterLocation: 'Бўлим',
  caFilterEmployee: 'Ходим',
  caAll: 'Барчаси',
  caColId: 'ID',
  caColInventory: 'Инвентар №',
  caColName: 'Мулк номи',
  caColCategory: 'Категория',
  caColEmployee: 'Ходим',
  caColLocation: 'Жойлашув',
  caColPurchased: 'Сотиб олинган',
  caColInitialValue: 'Бошланғич қиймати',
  caColCondition: 'Ҳолати',
  caColStatus: 'Статус',
  caColNotes: 'Изоҳ',
  caColActions: 'Амаллар',
  caStatusActive: 'Фаол',
  caStatusNeedsRepair: 'Таъмир талаб',
  caStatusUnderRepair: 'Тузатилмоқда',
  caStatusRepair: 'Таъмирда',
  caStatusWarehouse: 'Омборда',
  caStatusWrittenOff: 'Ҳисобдан чиқарилган',
  caSelectAllStatuses: 'Барча статуслар',
  caClearStatuses: 'Тозалаш',
  caFilterStatusesSelected: 'та статус',
  caCatTransport: 'Транспорт воситалари',
  caCatOffice: 'Офис жиҳозлари',
  caCatComputer: 'Компьютер техникаси',
  caCatProduction: 'Ишлаб чиқариш ускуналари',
  caCatTech: 'Технологик аппаратлар',
  caCatFurniture: 'Мебел',
  caCatOther: 'Бошқа',
  caCondNew: 'Янги',
  caCondGood: 'Яхши',
  caCondFair: 'Ўрта',
  caCondPoor: 'Ёмон',
  caFieldName: 'Мулк номи',
  caFieldInventory: 'Инвентар рақами',
  caFieldSerial: 'Серия рақами',
  caFieldCategory: 'Категория',
  caFieldManufacturer: 'Ишлаб чиқарувчи',
  caFieldModel: 'Модел',
  caFieldPurchaseDate: 'Харид санаси',
  caFieldPurchasePrice: 'Харид нархи',
  caFieldCurrency: 'Валюта',
  caFieldFxRate: 'Курс (1 валюта = сўм)',
  caFxCbuHint: 'Ўзбекистон Марказий банки курси (cbu.uz); керак бўлса қўлда ўзгартирилади',
  caFieldWarranty: 'Кафолат муддати',
  caFieldEmployee: 'Бириктирилган ходим',
  caFieldLocation: 'Жойлашув (бўлим)',
  caFieldCondition: 'Ҳолати',
  caFieldStatus: 'Статус',
  caFieldImage: 'Расм',
  caFieldDocuments: 'Ҳужжатлар',
  caFieldNotes: 'Изоҳ',
  caAmountUzsPreview: 'Сўмдаги қиймат (xarajatga)',
  caValueRateDan: 'дан',
  caValueUsdUnit: '$',
  caDetailTitle: 'Мулк картаси',
  caTabInfo: 'Маълумот',
  caTabHistory: 'Тарих',
  caTabDocuments: 'Ҳужжатлар',
  caTabExpense: 'Харажат',
  caExpenseAssetPrefix: 'Корхона мулки',
  caViewImageFullscreen: 'Тўлиқ экранда кўриш',
  caCloseImage: 'Ёпиш',
  caNoImage: 'Расм йўқ',
  caImageUploaded: 'Расм сақланди',
  caActCreated: 'Қўшилди',
  caActUpdated: 'Таҳрирланди',
  caActAssigned: 'Ходимга бириктирилди',
  caActReturned: 'Қайтариб олинди',
  caActRepair: 'Таъмирга юборилди',
  caActWrittenOff: 'Ҳисобдан чиқарилди',
  caActDeleted: 'Ўчирилди',
  caDelete: 'Ўчириш',
  caDeleteConfirmTitle: 'Мулкни ўчирасизми?',
  caDeleteConfirmDesc: 'Ўчирилган мулк рўйхатдан яширилади. Тарихда ким ва қачон ўчиргани сақланади.',
  caDeletedSuccess: 'Мулк ўчирилди',
  caAuditTitle: 'Аудит',
  caAuditCreated: 'Қўшган',
  caAuditUpdated: 'Охирги таҳрирлаган',
  caAuditDeleted: 'Ўчирган',
  caAuditPerformedBy: 'Ким қилган',
  caAuditUnknown: 'Номаълум',
  caExportExcel: 'Excel',
  caExportPdf: 'PDF',
  caPrint: 'Чоп этиш',
  caPrintPrintedAt: 'Чоп этилган сана',
  caPrintRecordCount: 'Ёзувлар сони',
  caPrintTotalValue: 'Жами қиймат',
  caPrintDocTitle: 'Асосий воситалар инвентаризатсия рўйхати (опис)',
  caPrintAsOf: 'йил ҳолатида',
  caPrintUnit: 'шт',
  caPrintColNo: 'Т/р',
  caPrintColName: 'Асосий воситаларнинг тўлиқ номи',
  caPrintColUnit: 'Ўлчов бирлиги',
  caPrintColQty: 'Сони',
  caPrintColInUse: 'яроқли фойдаланишда',
  caPrintColUsableIdle: 'яроқли фойдаланилмаяпти',
  caPrintColRepairable: 'фойдаланилмаяпти лекин таъмирлаб тиклаб бўлади',
  caPrintColObsolete: 'техник ва маънавий эскирган',
  caPrintColIrreparable: 'яроқсиз ва тикланмайди',
  caPrintColPriceUsd: 'Нархи $',
  caPrintFxPerUsd: '1$=',
  caPrintCbuRate: 'МБ курси',
  caPrintSom: 'сўм',
  caPrintMarkGood: 'яхши',
  caPrintMarkOld: 'эски',
  caPrintMarkRepair: 'таъмирталаб',
  caPrintMarkRestore: 'тикланади',
  caExportSheetName: 'Мулклар',
  caPrintTotal: 'ЖАМИ',
  caPrintSignShopHead: 'Цех бошлиғи:',
  caPrintSignChiefAccountant: 'Бош ҳисобчи:',
  caPrintSignDirector: 'Корхона раҳбари:',
  caPrintSignFounder: 'Корхона таъсисчиси:',
  caPrintBlocked: 'Чоп этиш ойнасини очиб бўлмади. Браузерда popup рухсатини ёқинг.',
  caExportError: 'Экспортда хатолик. Қайта уриниб кўринг.',
  caBulkStatus: 'Статусни ўзгартириш',
  caBulkApply: 'Қўллаш',
  caSelected: 'танланди',
  caSave: 'Сақлаш',
  caCancel: 'Бекор',
  caView: 'Кўриш',
  caPage: 'Саҳифа',
  caOf: '/',
  caNoEmployee: '—',
  caAutoInventory: 'Автоматик',
  caExpenseLinked: 'Харажатлар бўлимида кўринади',
  caChooseFile: 'Файл танлаш',
  caNoFileChosen: 'Файл танланмади',
  caRemoveFile: 'Ўчириш',
  caFileUploaded: 'Юкланган',
  caErrNameRequired: 'Мулк номини киритинг',
  caErrPurchasePriceRequired: 'Харид нархини киритинг',
  caErrPurchasePriceInvalid: 'Харид нархи нотўғри (0 дан катта бўлиши керак)',
  caErrFxRateRequired: 'Валюта курсини киритинг ёки MB курсини кутинг',
  caErrFxRateInvalid: 'Валюта курси нотўғри',
  caErrDateInvalid: 'Санани тўғри танланг',
  caErrValidationGeneric: 'Маълумотлар тўлиқ ёки нотўғри. Майдонларни текширинг',
  caErrInventoryDuplicate: 'Бундай инвентар рақами мавжуд',
  caErrEmployeeNotFound: 'Танланган ходим топилмади',
  caErrNotFound: 'Мулк топилмади',
  caErrFileTooLarge: 'Файл ҳажми жуда катта',
  caErrPayloadTooLarge: 'Расм ёки ҳужжат жуда катта. Кичикроқ файл танланг ёки қайта урининг.',
  supTitle: 'Етказиб берувчи',
  supSubtitle: 'Ташқи етказиб берувчидан хомашё сотиб олиш ва буюртмалар',
  supFormTitle: 'Сотиб олиш',
  supReadOnlyHint: 'Буюртма яратиш учун харажатлар бўлимига рухсат керак. Сиз фақат кутилаётган буюртмаларни кўриш ва «омборга келди» белгилашингиз мумкин.',
  supTabOrders: 'Буюртмалар',
  supTabPurchase: 'Сотиб олиш',
  supTabHistory: 'Тарих',
  supTabSuppliers: 'Етказиб берувчилар',
  supEditSupplier: 'Етказиб берувchini таҳрирлаш',
  supDebtAmountLabel: 'Қарз суммаси (UZS)',
  supListTitle: 'Етказиб берувчилар рўйхати',
  supListCount: 'Жами: {n} та',
  supSearchPlaceholder: 'Исм, телефон ёки манзил бўйича қидирув…',
  supNoSearchResults: 'Қидирув бўйича натижа топилмади',
  supSuppliersHint: 'Янги етказиб берувchini рўйхатга қўшинг ёки мавжудларни кўринг.',
  supAddSupplier: 'Етказиб берувчи қўшиш',
  supColName: 'Номи',
  supColAddress: 'Манзил',
  supColSupplier: 'Етказиб берувчи',
  supColQty: 'Миқдор',
  supNoSuppliers: 'Етказиб берувчи йўқ — аввал қўшинг.',
  supSelectSupplier: 'Етказиб берувчини танланг',
  supProductCategory: 'Маҳсулот тури',
  supProductName: 'Маҳсулот',
  supChooseProduct: 'Маҳсулотни танланг',
  supNoProductsInCategory: 'Бу турда каталогда маҳсулот йўқ. Аввал омборда яратинг.',
  supCatRaw: 'Хомашё',
  supCatSemi: 'Ярим тайёр',
  supCatFinal: 'Тайёр',
  supQuantityLabel: 'Миқдор',
  supQtyUnitLabel: 'Ўлчов',
  supUnitPieces: 'дона',
  supPricePerPieceLabel: '1 дона нархи',
  supPricePerKgLabel: '1 кг нархи',
  supPaymentType: 'Тўлов',
  supPaymentCash: 'Нақд',
  supPaymentCredit: 'Қарзга',
  supPaidNowLabel: 'Ҳозир тўланди (UZS)',
  supDebtDueDate: 'Қарз муддати',
  supDebtRemaining: 'Қолган қарз',
  supPendingTpl: '{supplier}: {name} — {qty} ({days} кун)',
  supSubmitPurchase: 'Сотиб олиш',
  supAddLine: 'Қатор қўшиш',
  supLinesTitle: 'Сотиб олинадиган маҳсулотлар',
  supNoLinesHint: 'Қатор йўқ — + тугмаси билан қўшинг.',
  supLineColAmount: 'Сумма (UZS)',
  supRemoveLine: 'Ўчириш',
  supLinesCount: '{n} та қатор',
  supLinePreview: 'Қатор жами',
  supNoWarehousePurchasePrice:
    'Сотиб олиш нархи омборда йўқ — аввал омборда маҳсулот нархини киритинг.',
  supHistoryDownload: 'PDF юклаш',
  supDownloadAllPdf: 'Ҳаммасини PDF',
  supBulkPdfTitle: 'Сотиб олиш тарихи',
  supSinglePdfTitle: 'Поступление от поставщика',
  supPdfDocFrom: 'дан',
  supPdfGenerated: 'Тайёрланган сана',
  supSelectForPdf: 'PDF учун камида битта ёзувни танланг',
  supSelectedCount: '{n} та танланди',
  supPdfAccountant: 'Бухгалтер',
  supPdfWarehouse: 'Омбор (қабул)',
  supPdfSupplierSign: 'Етказиб берувчи',
  supPdfColPrice: 'Нарх',
  supPdfRecordsCount: 'Ёзувлар',
  supPdfTotalUzs: 'Жами (UZS)',
  supEditPurchase: 'Таҳрирлаш',
  supDeletePurchase: 'Ўчириш',
  supDeletePurchaseConfirm:
    'Ушбу сотиб олиш ёзувини ўчирасизми? Омбор ва харажатлар ҳам янгиланади.',
  supLegacyNoEdit: 'Эски ёзув — фақат янги сотиб олишларни таҳрирлаш мумкин',
  supPurchaseStockHint: 'Сотиб олиш билан маҳсулот дарҳол омборга қўшилади',
  navReports: 'Ҳисоботлар',
  navShifts: 'Ишлаб чиқариш',
  shiftRmHistTitle: 'Хомашё тарихи (қолип сменаси)',
  shiftRmHistSubtitle:
    'Ретсепт бўйича режа (кг), ҳақиқий сарф (кг) ва фарқ. Меъёордан катта сарф қаторлар қизғиш рангда ажратилади.',
  shiftRmHistAggTitle: 'Маҳсулот + хомашё бўйича йиғма',
  shiftRmHistAggHint:
    'Бир номдаги қолип ва бир хил хомашё учун: жами режа/ҳақиқий/фарқ, ёзувлар сони, ўртача ва битта сменадаги максимал % фарқ.',
  shiftRmHistDetailTitle: 'Барча смена ёзувлари (янгидан эскига)',
  shiftRmHistColProduct: 'Маҳсулот',
  shiftRmHistColRaw: 'Хомашё',
  shiftRmHistColCases: 'Ёзувлар',
  shiftRmHistColPlannedSum: 'Жами режа, кг',
  shiftRmHistColActualSum: 'Жами ҳақиқий, кг',
  shiftRmHistColDeltaSum: 'Жами фарқ, кг',
  shiftRmHistColAvgOverPct: 'Ўртача % фарқ',
  shiftRmHistColMaxOverPct: 'Макс % фарқ',
  shiftRmHistColWhen: 'Сана / вақт',
  shiftRmHistColWorker: 'Ишчи',
  shiftRmHistColMachine: 'Аппарат',
  shiftRmHistColGood: 'Тайёр (дона)',
  shiftRmHistColDefect: 'Брак',
  shiftRmHistColPlanned: 'Режа, кг',
  shiftRmHistColActual: 'Ҳақиқий, кг',
  shiftRmHistColDelta: 'Фарқ, кг',
  shiftRmHistColOverPct: '% режага нисбатан',
  shiftRmHistEmpty:
    'Ҳозирча маълумот йўқ. Қолип сменаси сақланганда ва каталогда ретсепт бўлса, бу ерда сиро сатҳи кўринади.',
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
  authSaralash: 'Саралаш',
  authVazifa: 'Вазифа',
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
  suPermViewInventory: 'Инвентаризация',
  suPermViewSales: 'Сотув',
  suPermViewExpenses: 'Харажатлар',
  suPermViewSuppliers: 'Етказиб берувчи (кўриш)',
  suPermManageSuppliers: 'Етказиб берувчини бошқариш',
  suPermViewPayroll: 'Иш ҳақи / ходимлар',
  suPermViewVedomost: 'Ведомост (кўриш)',
  suPermCreateVedomost: 'Ведомост яратиш',
  suPermViewReports: 'Ҳисоботлар',
  suPermManageSettings: 'Созламалар',
  suPermManageUsers: 'Фойдаланувчиларни бошқариш',
  suPermViewCompanyAssets: 'Корхона мулки (кўриш)',
  suPermManageCompanyAssets: 'Корхона мулкини бошқариш',
  layoutLogout: 'Чиқиш',

  dfTitle: 'Сана оралиғи',
  dfToday: 'Бугун',
  dfWeek: 'Бу ҳафта',
  dfMonth: 'Бу ой',
  dfAll: 'Барчаси',
  dfFrom: 'Дан',
  dfTo: 'Гача',
  dfApply: 'Қўллаш',
  dfShowing: 'Кўрсатилмоқда:',
  dfAllTime: 'Барча вақт',
  dfDotProduction: 'Ишлаб чиқариш',
  dfDotSales: 'Сотув',
  dfDotPurchase: 'Сотиб олиш',

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
  apiShiftInsufficientUnpackagedStock:
    'Қадоқланмаган захира етарли эмас ({name}): керак бўлган дона омборда йўқ',
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
  labelCurrency: 'Валюта',
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
  unitBag: 'қоп',
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
  rmStatsCatalogTotal: 'Каталог турлари',

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
  dashCbuUpdatedOk: 'Курс янгиланди',
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
  whPiecesPerBag: '1 қопда (дона)',
  whPiecesPerBagRequired: '1 қопда неча дона эканини киритинг',
  whPricingSection: 'Нархлар',
  whPricingOptional: 'Ихтиёрий — бўш қолдириш мумкин',
  whPurchasePrice: 'Сотиб олиш нархи',
  whSalePrice: 'Сотиш нархи',
  whFxRateToUzs: 'Курс (1 valyuta = so‘m)',
  whFxRateHint: 'Qo‘lda o‘zgartirish mumkin',
  whFxApplyCbu: 'MB kursi',
  whCbuRatesTitle: 'Марказий банк курси',
  whCbuRatesLoading: 'Курс юкланмоқда…',
  whCbuRatesUsd: '1 USD = {rate} so‘m',
  whCbuRatesEur: '1 EUR = {rate} so‘m',
  whCbuRatesError: 'Курс юкланмади',
  whCbuRatesRetry: 'Қайта',
  whPricingInvalid: 'Narx yoki kurs noto‘g‘ri',
  whPriceInUzs: '≈ {amount} so‘m',
  whCatalogPiecesPerBag: '1 пачкада: {count} дона',
  whCatalogPackLabel: '1 пачкада',
  whCatalogPackValue: '{count} дона',
  whCatalogComposition: 'Таркиб',
  whCatalogMachines: 'Аппарат',
  whCatalogSemiLinked: 'Ярим тайёр',
  whCatalogVolume: 'Ҳажм',
  whCatalogItemsCount: '{count} та',
  whCatalogFxLabel: 'Курс',
  whCatalogFxValue: '1 {currency} = {rate} so‘m',
  whStockPackSubtitle:
    '{total} дона · {bags} пачка қадоқланган ({ppb} тадан) · {rem} дона қадоқланмаган',
  whStockPackSubtitleFull: '{total} дона · {bags} пачка ({ppb} тадан)',
  whStockLinePacked: '{bags} пачка қадоқланган ({ppb} тадан)',
  whStockLineUnpackaged: '{rem} дона қадоқланмаган',
  whStockLineAllPackaged: 'Ҳаммаси қадоқланган',
  whExportExcel: 'Excel юклаш',
  whExportPrint: 'Чоп этиш',
  whExportScopeTitle: 'Экспорт ва чоп',
  whExportScopeDescription: 'Қайси маҳсулотларни қўшиш керак?',
  whExportScopeCurrent: 'Фақат жорий бўлим ({type})',
  whExportScopeBothCombined: 'Ярим тайёр + тайёр (бир жадвалда)',
  whExportScopeBothSeparate: 'Алоҳида жадваллар (ярим / тайёр)',
  whExportSelectProducts: 'Маҳсулотлар',
  whExportSelectAll: 'Ҳаммасини танлаш',
  whExportSelectedCount: '{n} / {total} танланган',
  whExportNoneSelected: 'Камида битта маҳсулотни танланг',
  whExportConfirm: 'Давом этиш',
  whExportColNum: '№',
  whExportColName: 'Маҳсулот номи',
  whExportColUnit: 'Ўлчов бирлиги',
  whExportColSalePrice: 'Сотиш нархи',
  whExportColQty: 'Сони',
  whExportColTotalUzs: 'Жами сумма (so‘m)',
  whExportColTotalUsd: 'Жами ($)',
  whExportColType: 'Тури',
  whExportSectionSemi: 'Ярим тайёр маҳсулотлар',
  whExportSectionFinal: 'Тайёр маҳсулотлар',
  whExportTypeSemi: 'Ярим тайёр',
  whExportTypeFinal: 'Тайёр',
  whExportGrandTotal: 'Жами',
  whExportPrintedAt: 'Сана',
  whExportDocTitleSemi: 'Омбор — ярим тайёр маҳсулотлар',
  whExportDocTitleFinal: 'Омбор — тайёр маҳсулотлар',
  whExportNoPrice: '—',
  whCatalogSearchPlaceholder: 'Маҳсулот номи ёки изоҳ бўйича қидирув…',
  whCatalogNoSearchResults: 'Қидирув бўйича маҳсулот топилмади',
  whOverviewViewCards: 'Карточка',
  whOverviewViewTable: 'Жадвал',
  whOverviewColPack: 'Қадоқлаш',
  whOverviewColFill: 'Тўлдириш %',
  whOverviewColProfit: 'Фойда',
  whProfitRawLine: '{name}: {kgPrice} so‘m/kg · {grams} g → {cost} so‘m',
  whProfitSemiLine: '{name}: {cost} so‘m',
  whProfitSaleLine: 'Сотиш: {amount} so‘m',
  whProfitValueLine: 'Фойда: {amount} so‘m',
  whProfitSemiAddonLine: '+ {name}: {amount} so‘m',
  whProfitTotalLine: 'Умумий фойда: {amount} so‘m',
  whOverviewShowProfit: 'Фойдани кўрсатиш',
  whOverviewIncludeSemiProfit: '+ Ярим тайёр фойда',
  whExportProfitOptionsTitle: 'Фойда',
  whExportShowProfit: 'Фойда устунини кўрсатиш',
  whExportIncludeSemiProfit: '+ Ярим тайёр фойдасини қўшиш',
  whOverviewFullscreenEnter: 'Тўлиқ экран',
  whOverviewFullscreenExit: 'Экрандан чиқиш',
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
  whErrProductNotFound:
    'Маҳсулот топилмади. Саҳифани янгиланг — каталог эски бўлиши мумкин.',
  whErrRawMaterialsNotFound:
    'Танланган хомашё топилмади. Таркибни қайта танланг.',
  whErrMachinesNotFound: 'Танланган аппарат топилмади. Рўйхатни янгиланг.',
  whRawMaterialUnavailable: 'мавжуд эмас',
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
  slStockNotEnough: 'Омборда етарли эмас',
  slStockNeeded: 'керак',
  slAvailableProducts: 'Мавжуд Маҳсулотлар',
  slNewClient: 'Янги Клиент',
  slClientList: 'Клиентлар Рўйхати',
  slDebtPaid: 'Ҳисоб-китоб қилинган',
  slBtn: 'Сотувни Тасдиқлаш',
  slAddToCart: 'Қўшиш',
  slCart: 'Реализация таркиби',
  slCartEmpty: 'Маҳсулот қўшилмаган',
  slHistoryIgnoresDateFilter: 'Сотув тарихи юқоридаги сана фильтрига боғлиқ эмас',
  slHistoryDebtHint: 'Қарзлар бор, лекин сотувлар юкланмади — саҳифани янгиланг ёки рухсатни текширинг',
  slPdfDownloadFailed: 'PDF юклаб бўлмади',
  slPrintDeliveryTitle: 'Чоп этиш — транспорт',
  slVehiclePlate: 'Машина рақами',
  slVehiclePlatePlaceholder: '01 A 123 BC',
  slDriverName: 'Ҳайдовчи исми',
  slDriverNamePlaceholder: 'Исм фамилия',
  slDeliveryDefaultsHint: 'Маълумотлар клиент учун сақланади, кейинги сафарда автоматик тўлдирилади',
  slSelectAll: 'Ҳаммасини танлаш',
  slDeselectAll: 'Танловни бекор қилиш',
  slSelectedCount: '{n} та танланди',
  slDownloadSelectedPdf: 'Танланганларни PDF',
  slBulkPdfSummaryTitle: 'Сотувлар хулосаси',
  slSelectSalesForPdf: 'PDF учун камида битта сотувни танланг',
  slEditSale: 'Таҳрирлаш',
  slEditSaleTitle: 'Сотувни таҳрирлаш',
  slSaveSaleEdit: 'Сақлаш',
  slSaleUpdated: 'Сотув янгиланди',
  slSaleUpdateFailed: 'Сотувни янгилаб бўлмади',
  slApiClientRemoved: 'Клиент рўйхатдан ўчирилган — бошқа клиентни танланг',
  slApiClientNotFound: 'Клиент топилмади',
  slApiPaidExceedsTotal: 'Тўлов жами суммадан ошмаслиги керак',
  slApiPaidBelowRecorded: 'Тўлов аллақачон қайд этилган тўловлардан кам бўлмаслиги керак',
  slEditLine: 'Қаторни таҳрирлаш',
  slSaveLine: 'Қаторни сақлаш',
  slEditingLine: 'Маҳсулот таҳрирланмоқда — ўзгартириб, яшил ✓ босинг',
  slFinishLineEdit: 'Аввал маҳсулот қаторини сақланг ёки бекор қилинг',
  slClientSearchPlaceholder: 'Клиент қидириш…',
  slSaleFxRate: 'курс',
  slAddItem: 'Қатор қўшиш',
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
  exHistoryColActions: 'Амаллар',
  exHistoryColUser: 'Фойдаланувчи',
  exAuditCreated: 'Киритди: {name}',
  exAuditUpdated: 'Ўзгартирди: {name}',
  exExpenseEditTitle: 'Харажатни таҳрирлаш',
  exExpenseDeleteTitle: 'Харажатни ўчирамизми?',
  exExpenseDeleteHint: 'Ёзув рўйхатдан олиб ташланади. «Хом ашё ташқи буюртма» категориясидаги ёзувлар ўчирилмайди.',
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
  exExternalOrderManualBlocked:
    '«Хом ашё ташқи буюртма» фақат ташқи буюртма берилганда харажатга қўшилади — бу ерда қўлда киритилмайди.',
  exPageStatsNote:
    'Диаграмма ва юқори статистика — барча вақт. «Тарих» жадвали — танланган сана фильтри бўйича.',
  exTrendTitle: 'Харажатлар динамикаси',
  exTrendWeek: 'Ҳафталик',
  exTrendMonth: 'Ойлик',
  exTrendYear: 'Йиллик',
  exTopCategories: 'Топ категориялар',
  exFundingSourceLabel: 'Пул қаердан олинади',
  exFundingSourcesTitle: 'Пул манбалари',
  exFundingSourceAdd: 'Янги манба',
  exFundingSourceName: 'Манба номи',
  exFundingSourceDelete: 'Ўчириш',
  exFundingSourceDeleteTitle: 'Манбани рўйхатдан оламизми?',
  exFundingSourceDeleteHint: 'Манба рўйхатдан олинади; тарихдаги ёзувлар сақланади.',
  exNoFundingSources: 'Пул манбаси йўқ. Аввал манба яратинг.',
  exFundingSourceRequired: 'Пул манбаини танланг',
  exFundingReportTitle: 'Пул манбаси бўйича ҳисобот',
  exHistoryColFundingSource: 'Пул манбаси',
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
  cdEdit: 'Таҳрирлаш',

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
  prTabKassa: 'Касса',
  prTabClients: 'Мижозлар',
  prTabSuppliers: 'Етказиб берувчилар',
  prClientsSearch: 'Мижоз қидириш…',
  prClientPurchaseHistory: 'Сотиб олиш тарихи',
  prClientNoSales: 'Сотувлар йўқ',
  prSupplierPurchaseHistory: 'Харид тарихи',
  prSupplierNoOrders: 'Харидлар йўқ',
  prColPrepaid: 'Олдиндан тўлов',
  prKassaBalance: 'Умумий касса ҳисоби',
  prKassaTotalInflow: 'Жами кирим',
  prKassaTotalOutflow: 'Жами чиқим',
  prKassaInflowSection: 'Кирим',
  prKassaOutflowSection: 'Чиқим',
  prKassaAddInflow: 'Кирим қўшиш',
  prKassaAddOutflow: 'Чиқим қўшиш',
  prKassaClient: 'Мижоз',
  prKassaAmount: 'Сумма',
  prKassaComment: 'Изоҳ',
  prKassaDate: 'Сана',
  prKassaCreatedBy: 'Киритган',
  prKassaNoInflows: 'Киримлар йўқ',
  prKassaNoOutflows: 'Чиқимлар йўқ',
  prKassaDeleteInflowTitle: 'Киримни ўчириш',
  prKassaDeleteInflowConfirm: 'Ушбу кирим ўчирилади. Мижоз ҳисобидан ҳам айирилади.',
  prKassaDeleteOutflowTitle: 'Чиқимни ўчириш',
  prKassaDeleteOutflowConfirm: 'Ушбу чиқим ўчирилади.',
  prKassaEditInflow: 'Киримни таҳрирлаш',
  prKassaEditOutflow: 'Чиқимни таҳрирлаш',
  slClientCashBalance: 'Мижоз ҳисоби',
  slBalanceWillApply: 'Сотувда ҳисобдан ечилади',
  prKassaSelectClient: 'Мижозни танланг',
  prKassaNoClients: 'Мижозлар йўқ — аввал «Сотув» бўлимида мижоз қўшинг',
  prGenerate: 'Ведомост яратиш',
  prCloseVedomost: 'Ведомостни ёпиш',
  prCloseVedomostTitle: 'Ведомостни ёпиш',
  prCloseVedomostConfirm:
    '{month} ойи учун барча маош қаторлари ўчирилади. Бу амални бекор қилиб бўлмайди. Давом этасизми?',
  prCloseVedomostPaidBlocked:
    'Баъзи ишчилар «берилди» деб белгиланган — аввал ҳолатни ўзгартиринг ёки тўловни бекор қилинг.',
  prCloseVedomostSuccess: 'Ведомост ёпилди',
  prCloseVedomostAction: 'Ҳа, ёпиш',
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

  // Statement import wizard
  siImportTitle: 'Excel ко‘чирма юклаш',
  siImportHint: 'Банк ко‘чирмаси (.xlsx) файлини шу ерга ташланг ёки танланг',
  siImportAction: 'Файлни танлаш',
  siUploading: 'Юкланмоқда...',
  siUploadSuccess: 'Файл юкланди — қаторларни кўриб чиқинг',
  siUploadError: 'Файлни юклашда хатолик',
  siStatementsList: 'Юкланган ко‘чирмалар',
  siNoStatements: 'Ҳали ко‘чирма юкланмаган',
  siReviewPending: 'Қаторларни кўриб чиқиш',
  siAllReviewed: 'Барча қаторлар кўриб чиқилган',
  siRowsTitle: 'Ко‘чирма қаторлари',
  siColDate: 'Сана',
  siColType: 'Тури',
  siColAmount: 'Сумма',
  siColCounterparty: 'Контрагент',
  siColAccount: 'Ҳисоб рақами',
  siColBankCode: 'Банк коди',
  siColCompanyAccount: 'Мижоз ҳисоби',
  siColCompanyBank: 'Мижоз банки',
  siColCompanyStir: 'Мижоз СТИР',
  siColPurpose: 'Мақсади',
  siColStatus: 'Ҳолати',
  siColLink: 'Боғланган',
  siColCreatedBy: 'Киритган',
  siColActions: 'Амаллар',
  siTypeIncome: 'Кирим',
  siTypeExpense: 'Чиқим',
  siStatusPending: 'Кутилмоқда',
  siStatusConfirmed: 'Тасдиқланган',
  siStatusSkipped: 'Ўтказиб юборилган',
  siKindClient: 'Мижоз',
  siKindSupplier: 'Етказиб берувчи',
  siKindCompany: 'Корхона',
  siKindUnknown: 'Номаълум',
  siWizardTitle: 'Қаторни кўриб чиқиш',
  siWizardStep: 'Қатор {current} / {total}',
  siRowStir: 'СТИР / ИНН',
  siQuestionClient: 'Бу мижозга кирим — тўғрими?',
  siQuestionExpense: 'Бу чиқим — қаерга?',
  siClientMatched: 'Тизимдаги мижоз топилди',
  siClientNotFound: 'Бу мижоз тизимда йўқ',
  siSupplierMatched: 'Тизимдаги етказиб берувчи топилди',
  siSupplierNotFound: 'Бу етказиб берувчи тизимда йўқ',
  siCompanyRowNote: 'Бу корхонанинг ўз ҳисоби (ички ҳаракат)',
  siSelectClient: 'Мижозни танланг',
  siSelectSupplier: 'Етказиб берувчини танланг',
  siSupplierOptional: 'Етказиб берувчи (ихтиёрий)',
  siSelectCategory: 'Харажат категорияси',
  siModeClient: 'Мижозга кирим',
  siModeKassa: 'Кассага кирим',
  siModeExpense: 'Харажат (чиқим)',
  siQuestionKassa: 'Бу банкдан кассага кирим — тўғрими?',
  siKassaInflowHint: 'Мижозга богланмайди — умумий касса ҳисобига қўшилади',
  prKassaBankInflow: 'Банкдан касса',
  siConfirmYes: 'Ҳа, қўшилсин',
  siConfirmAndEdit: 'Ўзгартириб қўшиш',
  siSkip: 'Йўқ / Ўтказиб юбориш',
  siManual: 'Қўлда киритиш',
  siCreateClient: 'Янги мижоз яратиш',
  siCreateSupplier: 'Янги етказиб берувчи яратиш',
  siCreateCategory: 'Янги категория яратиш',
  siCategoryNotFound: 'Мос категория йўқ — янги яратинг',
  siCategoryMatched: 'Мос категория топилди',
  siNewName: 'Номи',
  siNewPhone: 'Телефон (ихтиёрий)',
  siNext: 'Кейингиси',
  siPrev: 'Олдингиси',
  siRowConfirmed: 'Қатор тасдиқланди',
  siRowSkipped: 'Қатор ўтказиб юборилди',
  siRowDeleted: 'Қатор ўчирилди',
  siNeedClient: 'Мижозни танланг ёки яратинг',
  siNeedCategory: 'Харажат категориясини танланг ёки яратинг',
  siUnclearHint: 'Тушунарсиз бўлса — қўлда тўғрилаб киритинг',
  siEditRowTitle: 'Қаторни таҳрирлаш',
  siDeleteRowTitle: 'Қаторни ўчириш',
  siDeleteRowConfirm: 'Бу қатор ва у яратган ёзувлар (касса/харажат) ўчирилади. Давом этасизми?',
  siDeleteStatementTitle: 'Кўчирмани ўчириш',
  siDeleteStatementConfirm:
    '«{name}» ва ичидаги барча қаторлар ўчирилади. Тасдиқланган қаторлар билан боғлиқ касса/харажат ёзувлари ҳам бекор қилинади. Давом этасизми?',
  siStatementDeleted: 'Кўчирма ўчирилди',
  siBankBalance: 'Банк ҳисобидаги маблағ',
  siBankIncomeTotal: 'Жами кирим',
  siBankExpenseTotal: 'Жами чиқим',
  siBankAccount: 'Банк ҳисоб рақами',
  siBankName: 'Банк номи',
  siStir: 'СТИР / ИНН',
  siSourceBank: 'Банк',
  siSourceKassa: 'Касса',
  siPendingBadge: '{count} та кутилмоқда',
  siCompanyAccountsTitle: 'Корхона банк ҳисоблари',
  siCompanyAccountsHint: 'Бу ҳисоб рақамлари ко‘чирмада корхонанинг ўзи деб ҳисобланади',
  siAccountNumber: 'Ҳисоб рақами',
  siAccountLabel: 'Изоҳ (ихтиёрий)',
  siAddAccount: 'Қўшиш',
  siNoCompanyAccounts: 'Ҳисоб рақамлари қўшилмаган',
  siAccountAdded: 'Ҳисоб рақами қўшилди',
  siAccountDeleted: 'Ҳисоб рақами ўчирилди',
  siActiveBankAccount: 'Банк ҳисоби',
  siSelectBankAccount: 'Ҳисобни танланг',
  siAccountActivated: 'Банк ҳисоби ўзгартирилди',
  siAccountChangedBy: 'Охирги ўзгартирувчи',
  siAllAccountsBalance: 'Барча ҳисоблар бўйича (актив ҳисоб танланмаган)',
  siNoCompanyAccountsBalanceHint: 'Бухгалтерия → «Солиқ созламалари» → «Корхона банк ҳисоблари» бўлимида ҳисоб рақамини қўшинг',
  siOpenCompanyAccountsSettings: 'Созламаларга ўтиш',
  siAccountActiveBadge: 'Актив',
  siErrInvalidAmount: 'Сумма нотўғри ёки жуда кичик (камида 0,01)',
  siErrInvalidDate: 'Сана нотўғри',
  siErrValidation: 'Киритилган маълумотлар нотўғри',
  siErrKassaModeBackend: 'Сервер эски версияда — backendni қайта ишга туширинг (kassaga kirim)',
  siErrFileRequired: 'Файл танланмади',
  siErrStatementNotFound: 'Кўчирма топилмади',
  siErrRowNotFound: 'Қатор топилмади',
  siErrRowAlreadyConfirmed: 'Қатор аллақачон тасдиқланган. Аввал бекор қилинг',
  siErrClientPhoneAllocate: 'Мижоз учун телефон рақам ажратиб бўлмади',
  siErrSkipConfirmed: 'Тасдиқланган қаторни ўтказиб юбориб бўлмайди. Аввал бекор қилинг',
  siErrEditConfirmed: 'Тасдиқланган қаторни таҳрирлаш учун аввал бекор қилинг',
  siErrAccountRequired: 'Ҳисоб рақами киритилмади',
  siErrAccountDuplicate: 'Бу ҳисоб рақами аллақачон мавжуд',
  siErrAccountNotFound: 'Ҳисоб рақами топилмади',
  siErrNameRequired: 'Ном киритилмади',
  siTableFullscreenEnter: 'Тўлиқ экран',
  siTableFullscreenExit: 'Экрандан чиқиш (Esc)',
  siTableScrollLeft: 'Устунлар — чапга',
  siTableScrollRight: 'Устунлар — ўнгга',
  siTableScrollHint: 'Устунлар',
  siTablePageInfo: '{from}–{to} / {total}',

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
  invQtyKgHint: 'Масалан: 12.560 ёки 12 560 = 12 кг 560 г',
  invLoadFailed: 'Инвентаризация юкланмади',
  invSaveFailed: 'Сақлашда хатолик',
  invStockNegativeError:
    'Омборда етарли қолдиқ йўқ — ҳужжатдаги «ҳисобда» ва сервер қолдиғи мос келмаслиги мумкин. Саҳифани янгилаб, реал қийматларни қайта текширинг.',
  invLoading: 'Юкланмоқда…',
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
  rmSidebarCatalog: 'Xomashyo',
  rmSidebarWarehouseStock: 'Omborda qoldiq',
  rmWarehouseStockPageDesc: 'Katalogdagi har bir xomashyo turi uchun ombordagi qoldiq (kg).',
  rmWarehouseStockTotal: 'Jami xomashyo',
  rmWarehouseStockEmpty: 'Xomashyo katalogi bo‘sh — avval tur yarating.',
  rmDeleteConfirmDesc:
    '«{name}» o‘chiriladi: {kg} kg qoldiq, barcha qoplar va ombor harakatlari yozuvlari ham tozalanadi. Davom etasizmi?',
  navSales: 'Sotuv',
  navExpenses: 'Xarajatlar',
  navSuppliers: 'Yetkazib beruvchi',
  navCompanyAssets: 'Korxona mulki',
  caTitle: 'Korxona mulki',
  caSubtitle: 'Asosiy vositalarni hisobga olish va boshqarish',
  caAddAsset: 'Mulk qo\'shish',
  caEditAsset: 'Tahrirlash',
  caStatTotal: 'Jami mulklar',
  caStatActive: 'Faol',
  caStatRepair: 'Ta\'mirda',
  caStatWarehouse: 'Omborda',
  caStatWrittenOff: 'Hisobdan chiqarilgan',
  caStatTotalValue: 'Jami qiymat',
  caSearchName: 'Mulk nomi bo\'yicha',
  caSearchInventory: 'Inventar raqami',
  caFilterStatus: 'Status',
  caFilterCategory: 'Kategoriya',
  caFilterLocation: 'Bo\'lim',
  caFilterEmployee: 'Xodim',
  caAll: 'Barchasi',
  caColId: 'ID',
  caColInventory: 'Inventar №',
  caColName: 'Mulk nomi',
  caColCategory: 'Kategoriya',
  caColEmployee: 'Xodim',
  caColLocation: 'Joylashuv',
  caColPurchased: 'Sotib olingan',
  caColInitialValue: 'Boshlang\'ich qiymati',
  caColCondition: 'Holati',
  caColStatus: 'Status',
  caColNotes: 'Izoh',
  caColActions: 'Amallar',
  caStatusActive: 'Faol',
  caStatusNeedsRepair: 'Ta\'mir talab',
  caStatusUnderRepair: 'Tuzatiladi',
  caStatusRepair: 'Ta\'mirda',
  caStatusWarehouse: 'Omborda',
  caStatusWrittenOff: 'Hisobdan chiqarilgan',
  caSelectAllStatuses: 'Barcha statuslar',
  caClearStatuses: 'Tozalash',
  caFilterStatusesSelected: 'ta status',
  caCatTransport: 'Transport vositalari',
  caCatOffice: 'Ofis jihozlari',
  caCatComputer: 'Kompyuter texnikasi',
  caCatProduction: 'Ishlab chiqarish uskunalari',
  caCatTech: 'Texnologik apparatlar',
  caCatFurniture: 'Mebel',
  caCatOther: 'Boshqa',
  caCondNew: 'Yangi',
  caCondGood: 'Yaxshi',
  caCondFair: 'O\'rta',
  caCondPoor: 'Yomon',
  caFieldName: 'Mulk nomi',
  caFieldInventory: 'Inventar raqami',
  caFieldSerial: 'Seriya raqami',
  caFieldCategory: 'Kategoriya',
  caFieldManufacturer: 'Ishlab chiqaruvchi',
  caFieldModel: 'Model',
  caFieldPurchaseDate: 'Xarid sanasi',
  caFieldPurchasePrice: 'Xarid narxi',
  caFieldCurrency: 'Valyuta',
  caFieldFxRate: 'Kurs (1 valyuta = so\'m)',
  caFxCbuHint: 'O\'zbekiston Markaziy banki kursi (cbu.uz); kerak bo\'lsa qo\'lda o\'zgartiriladi',
  caFieldWarranty: 'Kafolat muddati',
  caFieldEmployee: 'Biriktirilgan xodim',
  caFieldLocation: 'Joylashuv (bo\'lim)',
  caFieldCondition: 'Holati',
  caFieldStatus: 'Status',
  caFieldImage: 'Rasm',
  caFieldDocuments: 'Hujjatlar',
  caFieldNotes: 'Izoh',
  caAmountUzsPreview: 'So\'mdagi qiymat (xarajatga)',
  caValueRateDan: 'dan',
  caValueUsdUnit: '$',
  caDetailTitle: 'Mulk kartasi',
  caTabInfo: 'Ma\'lumot',
  caTabHistory: 'Tarix',
  caTabDocuments: 'Hujjatlar',
  caTabExpense: 'Xarajat',
  caExpenseAssetPrefix: 'Korxona mulki',
  caViewImageFullscreen: 'To\'liq ekranda ko\'rish',
  caCloseImage: 'Yopish',
  caNoImage: 'Rasm yo\'q',
  caImageUploaded: 'Rasm saqlandi',
  caActCreated: 'Qo\'shildi',
  caActUpdated: 'Tahrirlandi',
  caActAssigned: 'Xodimga biriktirildi',
  caActReturned: 'Qaytarib olindi',
  caActRepair: 'Ta\'mirga yuborildi',
  caActWrittenOff: 'Hisobdan chiqarilgan',
  caActDeleted: 'O\'chirildi',
  caDelete: 'O\'chirish',
  caDeleteConfirmTitle: 'Mulkni o\'chirasizmi?',
  caDeleteConfirmDesc: 'O\'chirilgan mulk ro\'yxatdan yashirinadi. Tarixda kim va qachon o\'chirgani saqlanadi.',
  caDeletedSuccess: 'Mulk o\'chirildi',
  caAuditTitle: 'Audit',
  caAuditCreated: 'Qo\'shgan',
  caAuditUpdated: 'Oxirgi tahrirlagan',
  caAuditDeleted: 'O\'chirgan',
  caAuditPerformedBy: 'Kim qilgan',
  caAuditUnknown: 'Noma\'lum',
  caExportExcel: 'Excel',
  caExportPdf: 'PDF',
  caPrint: 'Chop etish',
  caPrintPrintedAt: 'Chop etilgan sana',
  caPrintRecordCount: 'Yozuvlar soni',
  caPrintTotalValue: 'Jami qiymat',
  caPrintDocTitle: "Asosiy vositalar inventarizatsiya ro'yxati (opis)",
  caPrintAsOf: 'yil holatida',
  caPrintUnit: 'шт',
  caPrintColNo: 'T/r',
  caPrintColName: "Asosiy vositalarning to'liq nomi",
  caPrintColUnit: "O'lchov birligi",
  caPrintColQty: 'Soni',
  caPrintColInUse: 'yaroqli foydalanishda',
  caPrintColUsableIdle: 'yaroqli foydalanilmayapti',
  caPrintColRepairable: "foydalanilmayapti lekin ta'mirlab tiklab bo'ladi",
  caPrintColObsolete: "texnik va ma'naviy eskirgan",
  caPrintColIrreparable: 'yaroqsiz va tiklanmaydi',
  caPrintColPriceUsd: 'Narxi $',
  caPrintFxPerUsd: '1$=',
  caPrintCbuRate: 'MB kursi',
  caPrintSom: "so'm",
  caPrintMarkGood: 'yaxshi',
  caPrintMarkOld: 'eski',
  caPrintMarkRepair: 'tamirtalab',
  caPrintMarkRestore: 'tiklanadi',
  caExportSheetName: 'Mulklar',
  caPrintTotal: 'JAMI',
  caPrintSignShopHead: "Sex boshlig'i:",
  caPrintSignChiefAccountant: 'Bosh hisobchi:',
  caPrintSignDirector: 'Korxona rahbari:',
  caPrintSignFounder: 'Korxona tasischisi:',
  caPrintBlocked: 'Chop etish oynasini ochib bo\'lmadi. Brauzerda popup ruxsatini yoqing.',
  caExportError: 'Eksportda xatolik. Qayta urinib ko\'ring.',
  caBulkStatus: 'Statusni o\'zgartirish',
  caBulkApply: 'Qo\'llash',
  caSelected: 'tanlandi',
  caSave: 'Saqlash',
  caCancel: 'Bekor',
  caView: 'Ko\'rish',
  caPage: 'Sahifa',
  caOf: '/',
  caNoEmployee: '—',
  caAutoInventory: 'Avtomatik',
  caExpenseLinked: 'Xarajatlar bo\'limida ko\'rinadi',
  caChooseFile: 'Fayl tanlash',
  caNoFileChosen: 'Fayl tanlanmagan',
  caRemoveFile: 'O\'chirish',
  caFileUploaded: 'Yuklangan',
  caErrNameRequired: 'Mulk nomini kiriting',
  caErrPurchasePriceRequired: 'Xarid narxini kiriting',
  caErrPurchasePriceInvalid: 'Xarid narxi noto\'g\'ri (0 dan katta bo\'lishi kerak)',
  caErrFxRateRequired: 'Valyuta kursini kiriting yoki MB kursini kuting',
  caErrFxRateInvalid: 'Valyuta kursi noto\'g\'ri',
  caErrDateInvalid: 'Sanani to\'g\'ri tanlang',
  caErrValidationGeneric: 'Ma\'lumotlar to\'liq emas yoki noto\'g\'ri. Maydonlarni tekshiring',
  caErrInventoryDuplicate: 'Bunday inventar raqami mavjud',
  caErrEmployeeNotFound: 'Tanlangan xodim topilmadi',
  caErrNotFound: 'Mulk topilmadi',
  caErrFileTooLarge: 'Fayl hajmi juda katta (ruxsat etilgan limitdan oshdi)',
  caErrPayloadTooLarge: 'Rasm yoki hujjat juda katta. Kichikroq fayl tanlang yoki qayta urining.',
  supTitle: 'Yetkazib beruvchi',
  supSubtitle: 'Tashqi yetkazib beruvchidan xomashyo sotib olish va buyurtmalar',
  supFormTitle: 'Sotib olish',
  supReadOnlyHint: 'Buyurtma yaratish uchun xarajatlar bo‘limiga ruxsat kerak. Siz faqat kutilayotgan buyurtmalarni ko‘rish va «omborxona keldi» belgilashingiz mumkin.',
  supTabOrders: 'Buyurtmalar',
  supTabPurchase: 'Sotib olish',
  supTabHistory: 'Tarix',
  supTabSuppliers: 'Yetkazib beruvchilar',
  supEditSupplier: 'Yetkazib beruvchini tahrirlash',
  supDebtAmountLabel: 'Qarz summasi (UZS)',
  supListTitle: 'Yetkazib beruvchilar ro‘yxati',
  supListCount: 'Jami: {n} ta',
  supSearchPlaceholder: 'Ism, telefon yoki manzil bo‘yicha qidiruv…',
  supNoSearchResults: 'Qidiruv bo‘yicha natija topilmadi',
  supSuppliersHint: 'Yangi yetkazib beruvchini ro‘yxatga qo‘shing yoki mavjudlarni ko‘ring.',
  supAddSupplier: 'Yetkazib beruvchi qo‘shish',
  supColName: 'Nomi',
  supColAddress: 'Manzil',
  supColSupplier: 'Yetkazib beruvchi',
  supColQty: 'Miqdor',
  supNoSuppliers: 'Yetkazib beruvchi yo‘q — avval qo‘shing.',
  supSelectSupplier: 'Yetkazib beruvchini tanlang',
  supProductCategory: 'Mahsulot turi',
  supProductName: 'Mahsulot',
  supChooseProduct: 'Mahsulotni tanlang',
  supNoProductsInCategory: 'Bu turda katalogda mahsulot yo‘q. Avval omborda yarating.',
  supCatRaw: 'Xomashyo',
  supCatSemi: 'Yarim tayyor',
  supCatFinal: 'Tayyor',
  supQuantityLabel: 'Miqdor',
  supQtyUnitLabel: 'O‘lchov',
  supUnitPieces: 'dona',
  supPricePerPieceLabel: '1 dona narxi',
  supPricePerKgLabel: '1 kg narxi',
  supPaymentType: 'To‘lov',
  supPaymentCash: 'Naqd',
  supPaymentCredit: 'Qarzga',
  supPaidNowLabel: 'Hozir to‘landi (UZS)',
  supDebtDueDate: 'Qarz muddati',
  supDebtRemaining: 'Qolgan qarz',
  supPendingTpl: '{supplier}: {name} — {qty} ({days} kun)',
  supSubmitPurchase: 'Sotib olish',
  supAddLine: 'Qator qo‘shish',
  supLinesTitle: 'Sotib olinadigan mahsulotlar',
  supNoLinesHint: 'Qator yo‘q — + tugmasi bilan qo‘shing.',
  supLineColAmount: 'Summa (UZS)',
  supRemoveLine: 'O‘chirish',
  supLinesCount: '{n} ta qator',
  supLinePreview: 'Qator jami',
  supNoWarehousePurchasePrice:
    'Sotib olish narxi omborda yo‘q — avval omborda mahsulot narxini kiriting.',
  supHistoryDownload: 'PDF yuklash',
  supDownloadAllPdf: 'Hammasini PDF',
  supBulkPdfTitle: 'Sotib olish tarixi',
  supSinglePdfTitle: 'Yetkazib beruvchidan kirim',
  supPdfDocFrom: 'dan',
  supPdfGenerated: 'Tayyorlangan sana',
  supSelectForPdf: 'PDF uchun kamida bitta yozuvni tanlang',
  supSelectedCount: '{n} ta tanlandi',
  supPdfAccountant: 'Buxgalter',
  supPdfWarehouse: 'Ombor (qabul)',
  supPdfSupplierSign: 'Yetkazib beruvchi',
  supPdfColPrice: 'Narx',
  supPdfRecordsCount: 'Yozuvlar',
  supPdfTotalUzs: 'Jami (UZS)',
  supEditPurchase: 'Tahrirlash',
  supDeletePurchase: 'O‘chirish',
  supDeletePurchaseConfirm:
    'Ushbu sotib olish yozuvini o‘chirasizmi? Ombor va xarajatlar ham yangilanadi.',
  supLegacyNoEdit: 'Eski yozuv — faqat yangi sotib olishlarni tahrirlash mumkin',
  supPurchaseStockHint: 'Sotib olish bilan mahsulot darhol omborga qo‘shiladi',
  navReports: 'Hisobotlar',
  navShifts: 'Ishlab chiqarish',
  shiftRmHistTitle: 'Xomashyo tarixi (qolip smenasi)',
  shiftRmHistSubtitle:
    'Retsept bo‘yicha reja (kg), haqiqiy saraf (kg) va farq. Me‘yordan katta saraf qatorlar ajratiladi.',
  shiftRmHistAggTitle: 'Mahsulot + xomashyo bo‘yicha yig‘ma',
  shiftRmHistAggHint:
    'Bir nomdagi qolip va bir xil xomashyo uchun: jami reja/haqiqiy/farq, yozuvlar soni, o‘rtacha va bitta smenadagi maksimal % farq.',
  shiftRmHistDetailTitle: 'Barcha smena yozuvlari (yangidan eskiga)',
  shiftRmHistColProduct: 'Mahsulot',
  shiftRmHistColRaw: 'Xomashyo',
  shiftRmHistColCases: 'Yozuvlar',
  shiftRmHistColPlannedSum: 'Jami reja, kg',
  shiftRmHistColActualSum: 'Jami haqiqiy, kg',
  shiftRmHistColDeltaSum: 'Jami farq, kg',
  shiftRmHistColAvgOverPct: 'O‘rtacha % farq',
  shiftRmHistColMaxOverPct: 'Maks % farq',
  shiftRmHistColWhen: 'Sana / vaqt',
  shiftRmHistColWorker: 'Ishchi',
  shiftRmHistColMachine: 'Apparat',
  shiftRmHistColGood: 'Tayyor (dona)',
  shiftRmHistColDefect: 'Brak',
  shiftRmHistColPlanned: 'Reja, kg',
  shiftRmHistColActual: 'Haqiqiy, kg',
  shiftRmHistColDelta: 'Farq, kg',
  shiftRmHistColOverPct: '% rejaga nisbatan',
  shiftRmHistEmpty:
    'Hozircha maʼlumot yo‘q. Qolip smenasi saqlanganda va katalogda retsept bo‘lsa, bu yerda siro satxi ko‘rinadi.',
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
  authSaralash: 'Saralash',
  authVazifa: 'Vazifa',
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
  suPermViewInventory: 'Inventarizatsiya',
  suPermViewSales: 'Sotuv',
  suPermViewExpenses: 'Xarajatlar',
  suPermViewSuppliers: 'Yetkazib beruvchi (ko‘rish)',
  suPermManageSuppliers: 'Yetkazib beruvchini boshqarish',
  suPermViewPayroll: 'Ish haqi / xodimlar',
  suPermViewVedomost: 'Vedomost (ko‘rish)',
  suPermCreateVedomost: 'Vedomost yaratish',
  suPermViewReports: 'Hisobotlar',
  suPermManageSettings: 'Sozlamalar',
  suPermManageUsers: 'Foydalanuvchilarni boshqarish',
  suPermViewCompanyAssets: 'Korxona mulki (ko‘rish)',
  suPermManageCompanyAssets: 'Korxona mulkini boshqarish',
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
  dfDotProduction: 'Ishlab chiqarish',
  dfDotSales: 'Sotuv',
  dfDotPurchase: 'Sotib olish',

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
  apiShiftInsufficientUnpackagedStock:
    'Qadoqlanmagan zaxira yetarli emas ({name}): kerak dona omborda yo‘q',
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
  labelCurrency: 'Valyuta',
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
  unitBag: 'qop',
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
  rmStatsCatalogTotal: 'Katalog turlari',

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
  dashCbuUpdatedOk: 'Kurs yangilandi',
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
  whPiecesPerBag: '1 qopda (dona)',
  whPiecesPerBagRequired: '1 qopda nechta dona ekanini kiriting',
  whPricingSection: 'Narxlar',
  whPricingOptional: 'Ixtiyoriy — bo‘sh qoldirish mumkin',
  whPurchasePrice: 'Sotib olish narxi',
  whSalePrice: 'Sotish narxi',
  whFxRateToUzs: 'Kurs (1 valyuta = so‘m)',
  whFxRateHint: 'Qo‘lda o‘zgartirish mumkin',
  whFxApplyCbu: 'MB kursi',
  whCbuRatesTitle: 'Markaziy bank kursi',
  whCbuRatesLoading: 'Kurs yuklanmoqda…',
  whCbuRatesUsd: '1 USD = {rate} so‘m',
  whCbuRatesEur: '1 EUR = {rate} so‘m',
  whCbuRatesError: 'Kurs yuklanmadi',
  whCbuRatesRetry: 'Qayta',
  whPricingInvalid: 'Narx yoki kurs noto‘g‘ri',
  whPriceInUzs: '≈ {amount} so‘m',
  whCatalogPiecesPerBag: '1 pachkada: {count} dona',
  whCatalogPackLabel: '1 pachkada',
  whCatalogPackValue: '{count} dona',
  whCatalogComposition: 'Tarkib',
  whCatalogMachines: 'Apparat',
  whCatalogSemiLinked: 'Yarim tayyor',
  whCatalogVolume: 'Hajm',
  whCatalogItemsCount: '{count} ta',
  whCatalogFxLabel: 'Kurs',
  whCatalogFxValue: '1 {currency} = {rate} so‘m',
  whStockPackSubtitle:
    '{total} dona · {bags} pachka qadoqlangan ({ppb} tadan) · {rem} dona qadoqlanmagan',
  whStockPackSubtitleFull: '{total} dona · {bags} pachka ({ppb} tadan)',
  whStockLinePacked: '{bags} pachka qadoqlangan ({ppb} tadan)',
  whStockLineUnpackaged: '{rem} dona qadoqlanmagan',
  whStockLineAllPackaged: 'Hammasi qadoqlangan',
  whExportExcel: 'Excel yuklash',
  whExportPrint: 'Chop etish',
  whExportScopeTitle: 'Eksport va chop',
  whExportScopeDescription: 'Qaysi mahsulotlar qo‘shilsin?',
  whExportScopeCurrent: 'Faqat joriy bo‘lim ({type})',
  whExportScopeBothCombined: 'Yarim tayyor + tayyor (bir jadvalda)',
  whExportScopeBothSeparate: 'Alohida jadvallar (yarim / tayyor)',
  whExportSelectProducts: 'Mahsulotlar',
  whExportSelectAll: 'Hammasini tanlash',
  whExportSelectedCount: '{n} / {total} tanlangan',
  whExportNoneSelected: 'Kamida bitta mahsulotni tanlang',
  whExportConfirm: 'Davom etish',
  whExportColNum: '№',
  whExportColName: 'Mahsulot nomi',
  whExportColUnit: 'O‘lchov birligi',
  whExportColSalePrice: 'Sotish narxi',
  whExportColQty: 'Soni',
  whExportColTotalUzs: 'Jami summa (so‘m)',
  whExportColTotalUsd: 'Jami ($)',
  whExportColType: 'Turi',
  whExportSectionSemi: 'Yarim tayyor mahsulotlar',
  whExportSectionFinal: 'Tayyor mahsulotlar',
  whExportTypeSemi: 'Yarim tayyor',
  whExportTypeFinal: 'Tayyor',
  whExportGrandTotal: 'Jami',
  whExportPrintedAt: 'Sana',
  whExportDocTitleSemi: 'Ombor — yarim tayyor mahsulotlar',
  whExportDocTitleFinal: 'Ombor — tayyor mahsulotlar',
  whExportNoPrice: '—',
  whCatalogSearchPlaceholder: 'Mahsulot nomi yoki izoh bo‘yicha qidiruv…',
  whCatalogNoSearchResults: 'Qidiruv bo‘yicha mahsulot topilmadi',
  whOverviewViewCards: 'Kartochka',
  whOverviewViewTable: 'Jadval',
  whOverviewColPack: 'Qadoqlash',
  whOverviewColFill: 'To‘ldirish %',
  whOverviewColProfit: 'Foyda',
  whProfitRawLine: '{name}: {kgPrice} so‘m/kg · {grams} g → {cost} so‘m',
  whProfitSemiLine: '{name}: {cost} so‘m',
  whProfitSaleLine: 'Sotish: {amount} so‘m',
  whProfitValueLine: 'Foyda: {amount} so‘m',
  whProfitSemiAddonLine: '+ {name}: {amount} so‘m',
  whProfitTotalLine: 'Umumiy foyda: {amount} so‘m',
  whOverviewShowProfit: 'Foydani ko‘rsatish',
  whOverviewIncludeSemiProfit: '+ Yarim tayyor foyda',
  whExportProfitOptionsTitle: 'Foyda',
  whExportShowProfit: 'Foyda ustunini ko‘rsatish',
  whExportIncludeSemiProfit: '+ Yarim tayyor foydasini qo‘shish',
  whOverviewFullscreenEnter: 'To‘liq ekran',
  whOverviewFullscreenExit: 'Ekrandan chiqish',
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
  whErrProductNotFound:
    'Mahsulot topilmadi. Sahifani yangilang — katalog eski bo‘lishi mumkin.',
  whErrRawMaterialsNotFound:
    'Tanlangan xomashyo topilmadi. Tarkibni qayta tanlang.',
  whErrMachinesNotFound: 'Tanlangan apparat topilmadi. Ro‘yxatni yangilang.',
  whRawMaterialUnavailable: 'mavjud emas',
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
  slStockNotEnough: 'Omborda yetarli emas',
  slStockNeeded: 'kerak',
  slAvailableProducts: 'Mavjud Mahsulotlar',
  slNewClient: 'Yangi Klient',
  slClientList: "Klientlar Ro'yxati",
  slDebtPaid: 'Hisob-kitob qilingan',
  slBtn: 'Sotuvni Tasdiqlash',
  slAddToCart: 'Qo\'shish',
  slCart: 'Sotuv tarkibi',
  slCartEmpty: 'Mahsulot qo\'shilmagan',
  slHistoryIgnoresDateFilter: 'Sotuv tarixi yuqoridagi sana filtriga bog\'liq emas',
  slHistoryDebtHint: 'Qarzlar bor, lekin sotuvlar yuklanmagan — sahifani yangilang yoki ruxsatni tekshiring',
  slPdfDownloadFailed: 'PDF yuklab bo\'lmadi',
  slPrintDeliveryTitle: 'Chop etish — transport',
  slVehiclePlate: 'Mashina raqami',
  slVehiclePlatePlaceholder: '01 A 123 BC',
  slDriverName: 'Haydovchi ismi',
  slDriverNamePlaceholder: 'Ism familiya',
  slDeliveryDefaultsHint: 'Ma\'lumotlar mijoz uchun saqlanadi, keyingi safarda avtomatik to\'ldiriladi',
  slSelectAll: 'Hammasini tanlash',
  slDeselectAll: 'Tanlovni bekor qilish',
  slSelectedCount: '{n} ta tanlandi',
  slDownloadSelectedPdf: 'Tanlanganlarni PDF',
  slBulkPdfSummaryTitle: 'Sotuvlar xulosasi',
  slSelectSalesForPdf: 'PDF uchun kamida bitta sotuvni tanlang',
  slEditSale: 'Tahrirlash',
  slEditSaleTitle: 'Sotuvni tahrirlash',
  slSaveSaleEdit: 'Saqlash',
  slSaleUpdated: 'Sotuv yangilandi',
  slSaleUpdateFailed: 'Sotuvni yangilab bo\'lmadi',
  slApiClientRemoved: 'Klient ro\'yxatdan o\'chirilgan — boshqa klientni tanlang',
  slApiClientNotFound: 'Klient topilmadi',
  slApiPaidExceedsTotal: 'To\'lov jami summadan oshmasligi kerak',
  slApiPaidBelowRecorded: 'To\'lov avval qayd etilgan to\'lovlardan kam bo\'lmasligi kerak',
  slEditLine: 'Qatorni tahrirlash',
  slSaveLine: 'Qatorni saqlash',
  slEditingLine: 'Mahsulot tahrirlanmoqda — o\'zgartirib, yashil ✓ bosing',
  slFinishLineEdit: 'Avval mahsulot qatorini saqlang yoki bekor qiling',
  slClientSearchPlaceholder: 'Klient qidirish…',
  slSaleFxRate: 'kurs',
  slAddItem: 'Qator qo\'shish',
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
  exHistoryColActions: 'Amallar',
  exHistoryColUser: 'Foydalanuvchi',
  exAuditCreated: 'Kiritdi: {name}',
  exAuditUpdated: "O'zgartirdi: {name}",
  exExpenseEditTitle: 'Xarajatni tahrirlash',
  exExpenseDeleteTitle: "Xarajatni o'chiramizmi?",
  exExpenseDeleteHint:
    "Yozuv ro'yxatdan olib tashlanadi. «Xom ashyo tashqi buyurtma» kategoriyasidagi yozuvlar o'chirilmaydi.",
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
  exExternalOrderManualBlocked:
    "«Xom ashyo tashqi buyurtma» faqat tashqi buyurtma berilganda xarajatga qo'shiladi — bu yerda qo'lda kiritilmaydi.",
  exPageStatsNote:
    "Diagramma va yuqori statistika — barcha vaqt. «Tarix» jadvali — tanlangan sana filtri bo'yicha.",
  exTrendTitle: 'Xarajatlar dinamikasi',
  exTrendWeek: 'Haftalik',
  exTrendMonth: 'Oylik',
  exTrendYear: 'Yillik',
  exTopCategories: 'Top kategoriyalar',
  exFundingSourceLabel: 'Pul qayerdan olinadi',
  exFundingSourcesTitle: 'Pul manbalari',
  exFundingSourceAdd: 'Yangi manba',
  exFundingSourceName: 'Manba nomi',
  exFundingSourceDelete: "O'chirish",
  exFundingSourceDeleteTitle: "Manbani ro'yxatdan olamizmi?",
  exFundingSourceDeleteHint: "Manba ro'yxatdan olinadi; tarixdagi yozuvlar saqlanadi.",
  exNoFundingSources: "Pul manbai yo'q. Avval manba yarating.",
  exFundingSourceRequired: 'Pul manbaini tanlang',
  exFundingReportTitle: "Pul manbai bo'yicha hisobot",
  exHistoryColFundingSource: 'Pul manbai',
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
  cdEdit: 'Tahrirlash',

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
  prTabKassa: 'Kassa',
  prTabClients: 'Mijozlar',
  prTabSuppliers: 'Yetkazib beruvchilar',
  prClientsSearch: 'Mijoz qidirish…',
  prClientPurchaseHistory: 'Sotib olish tarixi',
  prClientNoSales: 'Sotuvlar yo‘q',
  prSupplierPurchaseHistory: 'Xarid tarixi',
  prSupplierNoOrders: 'Xaridlar yo‘q',
  prColPrepaid: 'Oldindan to‘lov',
  prKassaBalance: 'Umumiy kassa hisobi',
  prKassaTotalInflow: 'Jami kirim',
  prKassaTotalOutflow: 'Jami chiqim',
  prKassaInflowSection: 'Kirim',
  prKassaOutflowSection: 'Chiqim',
  prKassaAddInflow: 'Kirim qo‘shish',
  prKassaAddOutflow: 'Chiqim qo‘shish',
  prKassaClient: 'Mijoz',
  prKassaAmount: 'Summa',
  prKassaComment: 'Izoh',
  prKassaDate: 'Sana',
  prKassaCreatedBy: 'Kiritgan',
  prKassaNoInflows: 'Kirimlar yo‘q',
  prKassaNoOutflows: 'Chiqimlar yo‘q',
  prKassaDeleteInflowTitle: 'Kirimni o‘chirish',
  prKassaDeleteInflowConfirm: 'Ushbu kirim o‘chiriladi. Mijoz hisobidan ham ayiriladi.',
  prKassaDeleteOutflowTitle: 'Chiqimni o‘chirish',
  prKassaDeleteOutflowConfirm: 'Ushbu chiqim o‘chiriladi.',
  prKassaEditInflow: 'Kirimni tahrirlash',
  prKassaEditOutflow: 'Chiqimni tahrirlash',
  slClientCashBalance: 'Mijoz hisobi',
  slBalanceWillApply: 'Sotuvda hisobdan yechiladi',
  prKassaSelectClient: 'Mijozni tanlang',
  prKassaNoClients: 'Mijozlar yo‘q — avval «Sotuv» bo‘limida mijoz qo‘shing',
  prGenerate: 'Vedomost yaratish',
  prCloseVedomost: 'Vedomostni yopish',
  prCloseVedomostTitle: 'Vedomostni yopish',
  prCloseVedomostConfirm:
    "{month} oyi uchun barcha maosh qatorlari o'chiriladi. Bu amalni bekor qilib bo'lmaydi. Davom etasizmi?",
  prCloseVedomostPaidBlocked:
    "Ba'zi ishchilar «berildi» deb belgilangan — avval holatni o'zgartiring.",
  prCloseVedomostSuccess: 'Vedomost yopildi',
  prCloseVedomostAction: 'Ha, yopish',
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

  // Statement import wizard
  siImportTitle: 'Excel ko‘chirma yuklash',
  siImportHint: 'Bank ko‘chirmasi (.xlsx) faylini shu yerga tashlang yoki tanlang',
  siImportAction: 'Faylni tanlash',
  siUploading: 'Yuklanmoqda...',
  siUploadSuccess: 'Fayl yuklandi — qatorlarni ko‘rib chiqing',
  siUploadError: 'Faylni yuklashda xatolik',
  siStatementsList: 'Yuklangan ko‘chirmalar',
  siNoStatements: 'Hali ko‘chirma yuklanmagan',
  siReviewPending: 'Qatorlarni ko‘rib chiqish',
  siAllReviewed: 'Barcha qatorlar ko‘rib chiqilgan',
  siRowsTitle: 'Ko‘chirma qatorlari',
  siColDate: 'Sana',
  siColType: 'Turi',
  siColAmount: 'Summa',
  siColCounterparty: 'Kontragent',
  siColAccount: 'Hisob raqami',
  siColBankCode: 'Bank kodi',
  siColCompanyAccount: 'Mijoz hisobi',
  siColCompanyBank: 'Mijoz banki',
  siColCompanyStir: 'Mijoz STIR',
  siColPurpose: 'Maqsadi',
  siColStatus: 'Holati',
  siColLink: 'Bog‘langan',
  siColCreatedBy: 'Kiritgan',
  siColActions: 'Amallar',
  siTypeIncome: 'Kirim',
  siTypeExpense: 'Chiqim',
  siStatusPending: 'Kutilmoqda',
  siStatusConfirmed: 'Tasdiqlangan',
  siStatusSkipped: 'O‘tkazib yuborilgan',
  siKindClient: 'Mijoz',
  siKindSupplier: 'Yetkazib beruvchi',
  siKindCompany: 'Korxona',
  siKindUnknown: 'Noma\u2019lum',
  siWizardTitle: 'Qatorni ko‘rib chiqish',
  siWizardStep: 'Qator {current} / {total}',
  siRowStir: 'STIR / INN',
  siQuestionClient: 'Bu mijozga kirim — to‘g‘rimi?',
  siQuestionExpense: 'Bu chiqim — qayerga?',
  siClientMatched: 'Tizimdagi mijoz topildi',
  siClientNotFound: 'Bu mijoz tizimda yo‘q',
  siSupplierMatched: 'Tizimdagi yetkazib beruvchi topildi',
  siSupplierNotFound: 'Bu yetkazib beruvchi tizimda yo‘q',
  siCompanyRowNote: 'Bu korxonaning o‘z hisobi (ichki harakat)',
  siSelectClient: 'Mijozni tanlang',
  siSelectSupplier: 'Yetkazib beruvchini tanlang',
  siSupplierOptional: 'Yetkazib beruvchi (ixtiyoriy)',
  siSelectCategory: 'Xarajat kategoriyasi',
  siModeClient: 'Mijozga kirim',
  siModeKassa: 'Kassaga kirim',
  siModeExpense: 'Xarajat (chiqim)',
  siQuestionKassa: 'Bu bankdan kassaga kirim — to‘g‘rimi?',
  siKassaInflowHint: 'Mijozga bog‘lanmaydi — umumiy kassa hisobiga qo‘shiladi',
  prKassaBankInflow: 'Bankdan kassa',
  siConfirmYes: 'Ha, qo‘shilsin',
  siConfirmAndEdit: 'O‘zgartirib qo‘shish',
  siSkip: 'Yo‘q / O‘tkazib yuborish',
  siManual: 'Qo‘lda kiritish',
  siCreateClient: 'Yangi mijoz yaratish',
  siCreateSupplier: 'Yangi yetkazib beruvchi yaratish',
  siCreateCategory: 'Yangi kategoriya yaratish',
  siCategoryNotFound: "Mos kategoriya yo'q — yangi yarating",
  siCategoryMatched: 'Mos kategoriya topildi',
  siNewName: 'Nomi',
  siNewPhone: 'Telefon (ixtiyoriy)',
  siNext: 'Keyingisi',
  siPrev: 'Oldingisi',
  siRowConfirmed: 'Qator tasdiqlandi',
  siRowSkipped: 'Qator o‘tkazib yuborildi',
  siRowDeleted: 'Qator o‘chirildi',
  siNeedClient: 'Mijozni tanlang yoki yarating',
  siNeedCategory: 'Xarajat kategoriyasini tanlang yoki yarating',
  siUnclearHint: 'Tushunarsiz bo‘lsa — qo‘lda to‘g‘rilab kiriting',
  siEditRowTitle: 'Qatorni tahrirlash',
  siDeleteRowTitle: 'Qatorni o‘chirish',
  siDeleteRowConfirm: 'Bu qator va u yaratgan yozuvlar (kassa/xarajat) o‘chiriladi. Davom etasizmi?',
  siDeleteStatementTitle: 'Ko‘chirmani o‘chirish',
  siDeleteStatementConfirm:
    '«{name}» va ichidagi barcha qatorlar o‘chiriladi. Tasdiqlangan qatorlar bilan bog‘liq kassa/xarajat yozuvlari ham bekor qilinadi. Davom etasizmi?',
  siStatementDeleted: 'Ko‘chirma o‘chirildi',
  siBankBalance: 'Bank hisobidagi mablag‘',
  siBankIncomeTotal: 'Jami kirim',
  siBankExpenseTotal: 'Jami chiqim',
  siBankAccount: 'Bank hisob raqami',
  siBankName: 'Bank nomi',
  siStir: 'STIR / INN',
  siSourceBank: 'Bank',
  siSourceKassa: 'Kassa',
  siPendingBadge: '{count} ta kutilmoqda',
  siCompanyAccountsTitle: 'Korxona bank hisoblari',
  siCompanyAccountsHint: 'Bu hisob raqamlari ko‘chirmada korxonaning o‘zi deb hisoblanadi',
  siAccountNumber: 'Hisob raqami',
  siAccountLabel: 'Izoh (ixtiyoriy)',
  siAddAccount: 'Qo‘shish',
  siNoCompanyAccounts: 'Hisob raqamlari qo‘shilmagan',
  siAccountAdded: 'Hisob raqami qo‘shildi',
  siAccountDeleted: 'Hisob raqami o‘chirildi',
  siActiveBankAccount: 'Bank hisobi',
  siSelectBankAccount: 'Hisobni tanlang',
  siAccountActivated: 'Bank hisobi o‘zgartirildi',
  siAccountChangedBy: 'Oxirgi o‘zgartiruvchi',
  siAllAccountsBalance: 'Barcha hisoblar bo‘yicha (aktiv hisob tanlanmagan)',
  siNoCompanyAccountsBalanceHint: 'Buxgalteriya → «Soliq sozlamalari» → «Korxona bank hisoblari» bo‘limida hisob raqamini qo‘shing',
  siOpenCompanyAccountsSettings: 'Sozlamalarga o‘tish',
  siAccountActiveBadge: 'Aktiv',
  siErrInvalidAmount: 'Summa noto‘g‘ri yoki juda kichik (kamida 0,01)',
  siErrInvalidDate: 'Sana noto‘g‘ri',
  siErrValidation: 'Kiritilgan ma’lumotlar noto‘g‘ri',
  siErrKassaModeBackend: 'Server eski versiyada — backendni qayta ishga tushiring (kassaga kirim)',
  siErrFileRequired: 'Fayl tanlanmadi',
  siErrStatementNotFound: 'Ko‘chirma topilmadi',
  siErrRowNotFound: 'Qator topilmadi',
  siErrRowAlreadyConfirmed: 'Qator allaqachon tasdiqlangan. Avval bekor qiling',
  siErrClientPhoneAllocate: 'Mijoz uchun telefon raqam ajratib bo‘lmadi',
  siErrSkipConfirmed: 'Tasdiqlangan qatorni o‘tkazib yuborib bo‘lmaydi. Avval bekor qiling',
  siErrEditConfirmed: 'Tasdiqlangan qatorni tahrirlash uchun avval bekor qiling',
  siErrAccountRequired: 'Hisob raqami kiritilmadi',
  siErrAccountDuplicate: 'Bu hisob raqami allaqachon mavjud',
  siErrAccountNotFound: 'Hisob raqami topilmadi',
  siErrNameRequired: 'Nom kiritilmadi',
  siTableFullscreenEnter: "To'liq ekran",
  siTableFullscreenExit: 'Ekrandan chiqish (Esc)',
  siTableScrollLeft: 'Ustunlar — chapga',
  siTableScrollRight: 'Ustunlar — o‘ngga',
  siTableScrollHint: 'Ustunlar',
  siTablePageInfo: '{from}–{to} / {total}',

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
  invQtyKgHint: 'Masalan: 12.560 yoki 12 560 = 12 kg 560 g',
  invLoadFailed: 'Inventarizatsiya yuklanmadi',
  invSaveFailed: 'Saqlashda xatolik',
  invStockNegativeError:
    'Omborda yetarli qoldiq yo‘q — hujjatdagi «hisobda» va server qoldig‘i mos kelmasligi mumkin. Sahifani yangilab, real qiymatlarni qayta tekshiring.',
  invLoading: 'Yuklanmoqda…',
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
  rmSidebarCatalog: 'Сырьё',
  rmSidebarWarehouseStock: 'Остатки на складе',
  rmWarehouseStockPageDesc: 'Складской остаток (кг) по каждому типу сырья из каталога.',
  rmWarehouseStockTotal: 'Всего сырья',
  rmWarehouseStockEmpty: 'Каталог сырья пуст — сначала добавьте тип.',
  rmDeleteConfirmDesc:
    '«{name}» будет удалён: остаток {kg} кг, все мешки и записи складских движений будут очищены. Продолжить?',
  navSales: 'Продажи',
  navExpenses: 'Расходы',
  navSuppliers: 'Поставщик',
  navCompanyAssets: 'Имущество компании',
  caTitle: 'Имущество компании',
  caSubtitle: 'Учёт и управление основными средствами',
  caAddAsset: 'Добавить имущество',
  caEditAsset: 'Редактировать',
  caStatTotal: 'Всего',
  caStatActive: 'Активные',
  caStatRepair: 'В ремонте',
  caStatWarehouse: 'На складе',
  caStatWrittenOff: 'Списано',
  caStatTotalValue: 'Общая стоимость',
  caSearchName: 'По названию',
  caSearchInventory: 'Инвентарный №',
  caFilterStatus: 'Статус',
  caFilterCategory: 'Категория',
  caFilterLocation: 'Отдел',
  caFilterEmployee: 'Сотрудник',
  caAll: 'Все',
  caColId: 'ID',
  caColInventory: 'Инв. №',
  caColName: 'Название',
  caColCategory: 'Категория',
  caColEmployee: 'Сотрудник',
  caColLocation: 'Место',
  caColPurchased: 'Дата покупки',
  caColInitialValue: 'Начальная стоимость',
  caColCondition: 'Состояние',
  caColStatus: 'Статус',
  caColNotes: 'Примечание',
  caColActions: 'Действия',
  caStatusActive: 'Активный',
  caStatusNeedsRepair: 'Требует ремонта',
  caStatusUnderRepair: 'Ремонтируется',
  caStatusRepair: 'В ремонте',
  caStatusWarehouse: 'На складе',
  caStatusWrittenOff: 'Списан',
  caSelectAllStatuses: 'Все статусы',
  caClearStatuses: 'Очистить',
  caFilterStatusesSelected: 'статусов',
  caCatTransport: 'Транспорт',
  caCatOffice: 'Офисное оборудование',
  caCatComputer: 'Компьютерная техника',
  caCatProduction: 'Производственное оборудование',
  caCatTech: 'Технологическое оборудование',
  caCatFurniture: 'Мебель',
  caCatOther: 'Прочее',
  caCondNew: 'Новый',
  caCondGood: 'Хорошее',
  caCondFair: 'Среднее',
  caCondPoor: 'Плохое',
  caFieldName: 'Название',
  caFieldInventory: 'Инвентарный №',
  caFieldSerial: 'Серийный №',
  caFieldCategory: 'Категория',
  caFieldManufacturer: 'Производитель',
  caFieldModel: 'Модель',
  caFieldPurchaseDate: 'Дата покупки',
  caFieldPurchasePrice: 'Цена покупки',
  caFieldCurrency: 'Валюта',
  caFieldFxRate: 'Курс (1 валюта = сум)',
  caFxCbuHint: 'Курс Центрального банка Узбекистана (cbu.uz); при необходимости редактируется вручную',
  caFieldWarranty: 'Гарантия до',
  caFieldEmployee: 'Сотрудник',
  caFieldLocation: 'Место (отдел)',
  caFieldCondition: 'Состояние',
  caFieldStatus: 'Статус',
  caFieldImage: 'Фото',
  caFieldDocuments: 'Документы',
  caFieldNotes: 'Примечание',
  caAmountUzsPreview: 'Сумма в сумах (расход)',
  caValueRateDan: 'по курсу',
  caValueUsdUnit: '$',
  caDetailTitle: 'Карточка имущества',
  caTabInfo: 'Информация',
  caTabHistory: 'История',
  caTabDocuments: 'Документы',
  caTabExpense: 'Расход',
  caExpenseAssetPrefix: 'Имущество компании',
  caViewImageFullscreen: 'Полный экран',
  caCloseImage: 'Закрыть',
  caNoImage: 'Нет изображения',
  caImageUploaded: 'Изображение сохранено',
  caActCreated: 'Создано',
  caActUpdated: 'Изменено',
  caActAssigned: 'Назначено',
  caActReturned: 'Возвращено',
  caActRepair: 'В ремонт',
  caActWrittenOff: 'Списано',
  caActDeleted: 'Удалено',
  caDelete: 'Удалить',
  caDeleteConfirmTitle: 'Удалить имущество?',
  caDeleteConfirmDesc: 'Удалённое имущество скрывается из списка. В истории сохранится, кто и когда удалил.',
  caDeletedSuccess: 'Имущество удалено',
  caAuditTitle: 'Аудит',
  caAuditCreated: 'Добавил',
  caAuditUpdated: 'Последнее изменение',
  caAuditDeleted: 'Удалил',
  caAuditPerformedBy: 'Кто выполнил',
  caAuditUnknown: 'Неизвестно',
  caExportExcel: 'Excel',
  caExportPdf: 'PDF',
  caPrint: 'Печать',
  caPrintPrintedAt: 'Дата печати',
  caPrintRecordCount: 'Записей',
  caPrintTotalValue: 'Общая стоимость',
  caPrintDocTitle: "Asosiy vositalar inventarizatsiya ro'yxati (opis)",
  caPrintAsOf: 'yil holatida',
  caPrintUnit: 'шт',
  caPrintColNo: 'T/r',
  caPrintColName: "Asosiy vositalarning to'liq nomi",
  caPrintColUnit: "O'lchov birligi",
  caPrintColQty: 'Soni',
  caPrintColInUse: 'yaroqli foydalanishda',
  caPrintColUsableIdle: 'yaroqli foydalanilmayapti',
  caPrintColRepairable: "foydalanilmayapti lekin ta'mirlab tiklab bo'ladi",
  caPrintColObsolete: "texnik va ma'naviy eskirgan",
  caPrintColIrreparable: 'yaroqsiz va tiklanmaydi',
  caPrintColPriceUsd: 'Narxi $',
  caPrintFxPerUsd: '1$=',
  caPrintCbuRate: 'MB kursi',
  caPrintSom: 'сум',
  caPrintMarkGood: 'хорошо',
  caPrintMarkOld: 'старый',
  caPrintMarkRepair: 'требует ремонта',
  caPrintMarkRestore: 'восстанавливается',
  caExportSheetName: 'Имущество',
  caPrintTotal: 'ИТОГО',
  caPrintSignShopHead: 'Начальник цеха:',
  caPrintSignChiefAccountant: 'Главный бухгалтер:',
  caPrintSignDirector: 'Руководитель предприятия:',
  caPrintSignFounder: 'Учредитель предприятия:',
  caPrintBlocked: 'Не удалось открыть окно печати. Разрешите всплывающие окна в браузере.',
  caExportError: 'Ошибка экспорта. Попробуйте снова.',
  caBulkStatus: 'Изменить статус',
  caBulkApply: 'Применить',
  caSelected: 'выбрано',
  caSave: 'Сохранить',
  caCancel: 'Отмена',
  caView: 'Просмотр',
  caPage: 'Страница',
  caOf: 'из',
  caNoEmployee: '—',
  caAutoInventory: 'Авто',
  caExpenseLinked: 'Отображается в разделе расходов',
  caChooseFile: 'Выбрать файл',
  caNoFileChosen: 'Файл не выбран',
  caRemoveFile: 'Удалить',
  caFileUploaded: 'Загружен',
  caErrNameRequired: 'Введите название имущества',
  caErrPurchasePriceRequired: 'Введите цену покупки',
  caErrPurchasePriceInvalid: 'Неверная цена покупки (должна быть больше 0)',
  caErrFxRateRequired: 'Укажите курс или дождитесь загрузки курса ЦБ',
  caErrFxRateInvalid: 'Неверный валютный курс',
  caErrDateInvalid: 'Выберите корректную дату',
  caErrValidationGeneric: 'Данные неполные или неверные. Проверьте поля формы',
  caErrInventoryDuplicate: 'Такой инвентарный номер уже существует',
  caErrEmployeeNotFound: 'Выбранный сотрудник не найден',
  caErrNotFound: 'Имущество не найдено',
  caErrFileTooLarge: 'Файл слишком большой',
  caErrPayloadTooLarge: 'Изображение или документ слишком большой. Выберите файл меньшего размера.',
  supTitle: 'Поставщик',
  supSubtitle: 'Закупка сырья у внешнего поставщика и заказы',
  supFormTitle: 'Закупка',
  supReadOnlyHint: 'Для создания заказа нужен доступ к расходам. Вы можете просматривать ожидающие заказы и отмечать «поступило на склад».',
  supTabOrders: 'Заказы',
  supTabPurchase: 'Купить',
  supTabHistory: 'История',
  supTabSuppliers: 'Поставщики',
  supEditSupplier: 'Редактировать поставщика',
  supDebtAmountLabel: 'Сумма долга (UZS)',
  supListTitle: 'Список поставщиков',
  supListCount: 'Всего: {n}',
  supSearchPlaceholder: 'Поиск по имени, телефону или адресу…',
  supNoSearchResults: 'По запросу ничего не найдено',
  supSuppliersHint: 'Добавьте нового поставщика или просмотрите список.',
  supAddSupplier: 'Добавить поставщика',
  supColName: 'Название',
  supColAddress: 'Адрес',
  supColSupplier: 'Поставщик',
  supColQty: 'Кол-во',
  supNoSuppliers: 'Нет поставщиков — сначала добавьте.',
  supSelectSupplier: 'Выберите поставщика',
  supProductCategory: 'Тип товара',
  supProductName: 'Товар',
  supChooseProduct: 'Выберите товар',
  supNoProductsInCategory: 'В этом типе нет товаров в каталоге. Сначала создайте на складе.',
  supCatRaw: 'Сырьё',
  supCatSemi: 'Полуфабрикат',
  supCatFinal: 'Готовая',
  supQuantityLabel: 'Количество',
  supQtyUnitLabel: 'Единица',
  supUnitPieces: 'шт',
  supPricePerPieceLabel: 'Цена за шт',
  supPricePerKgLabel: 'Цена за кг',
  supPaymentType: 'Оплата',
  supPaymentCash: 'Наличные',
  supPaymentCredit: 'В долг',
  supPaidNowLabel: 'Оплачено сейчас (UZS)',
  supDebtDueDate: 'Срок долга',
  supDebtRemaining: 'Остаток долга',
  supPendingTpl: '{supplier}: {name} — {qty} ({days} дн.)',
  supSubmitPurchase: 'Купить',
  supAddLine: 'Добавить строку',
  supLinesTitle: 'Закупаемые позиции',
  supNoLinesHint: 'Нет строк — нажмите +.',
  supLineColAmount: 'Сумма (UZS)',
  supRemoveLine: 'Удалить',
  supLinesCount: '{n} строк',
  supLinePreview: 'Итого по строке',
  supNoWarehousePurchasePrice:
    'Закупочная цена не задана на складе — сначала укажите её в карточке товара.',
  supHistoryDownload: 'Скачать PDF',
  supDownloadAllPdf: 'Всё в PDF',
  supBulkPdfTitle: 'История закупок',
  supSinglePdfTitle: 'Поступление от поставщика',
  supPdfDocFrom: 'от',
  supPdfGenerated: 'Дата формирования',
  supSelectForPdf: 'Выберите хотя бы одну запись для PDF',
  supSelectedCount: 'Выбрано: {n}',
  supPdfAccountant: 'Бухгалтер',
  supPdfWarehouse: 'Склад (принял)',
  supPdfSupplierSign: 'Поставщик',
  supPdfColPrice: 'Цена',
  supPdfRecordsCount: 'Записей',
  supPdfTotalUzs: 'Итого (UZS)',
  supEditPurchase: 'Изменить',
  supDeletePurchase: 'Удалить',
  supDeletePurchaseConfirm:
    'Удалить эту закупку? Склад и расходы также будут обновлены.',
  supLegacyNoEdit: 'Старая запись — редактируются только новые закупки',
  supPurchaseStockHint: 'При покупке товар сразу поступает на склад',
  navReports: 'Отчёты',
  navShifts: 'Производство',
  shiftRmHistTitle: 'История сырья (смена преформ)',
  shiftRmHistSubtitle:
    'План по рецепту (кг), фактический расход (кг) и отклонение. Строки с заметным превышением плана выделены.',
  shiftRmHistAggTitle: 'Сводка: продукция + сырьё',
  shiftRmHistAggHint:
    'Для одной полуфабрикатной позиции и одного сырья: суммы план/факт/отклонение, число записей, средний и максимальный % отклонения в одной смене.',
  shiftRmHistDetailTitle: 'Все записи смен (от новых к старым)',
  shiftRmHistColProduct: 'Продукция',
  shiftRmHistColRaw: 'Сырьё',
  shiftRmHistColCases: 'Записей',
  shiftRmHistColPlannedSum: 'Сумма план, кг',
  shiftRmHistColActualSum: 'Сумма факт, кг',
  shiftRmHistColDeltaSum: 'Сумма откл., кг',
  shiftRmHistColAvgOverPct: 'Средн. % откл.',
  shiftRmHistColMaxOverPct: 'Макс % откл.',
  shiftRmHistColWhen: 'Дата / время',
  shiftRmHistColWorker: 'Рабочий',
  shiftRmHistColMachine: 'Аппарат',
  shiftRmHistColGood: 'Готово (шт)',
  shiftRmHistColDefect: 'Брак',
  shiftRmHistColPlanned: 'План, кг',
  shiftRmHistColActual: 'Факт, кг',
  shiftRmHistColDelta: 'Отклон., кг',
  shiftRmHistColOverPct: '% к плану',
  shiftRmHistEmpty:
    'Пока нет данных. После сохранения смены преформ и при наличии рецепта в каталоге здесь появится расход сырья.',
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
  authSaralash: 'Сортировка',
  authVazifa: 'Задачи',
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
  suPermViewInventory: 'Инвентаризация',
  suPermViewSales: 'Продажи',
  suPermViewExpenses: 'Расходы',
  suPermViewSuppliers: 'Поставщики (просмотр)',
  suPermManageSuppliers: 'Управление поставщиками',
  suPermViewPayroll: 'Зарплата / сотрудники',
  suPermViewVedomost: 'Ведомость (просмотр)',
  suPermCreateVedomost: 'Создание ведомости',
  suPermViewReports: 'Отчёты',
  suPermManageSettings: 'Настройки',
  suPermManageUsers: 'Управление пользователями',
  suPermViewCompanyAssets: 'Имущество компании (просмотр)',
  suPermManageCompanyAssets: 'Управление имуществом компании',
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
  dfDotProduction: 'Производство',
  dfDotSales: 'Продажи',
  dfDotPurchase: 'Закупка',

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
  apiShiftInsufficientUnpackagedStock:
    'Недостаточно неупакованного остатка ({name})',
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
  labelCurrency: 'Валюта',
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
  unitBag: 'мешок',
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
  rmStatsCatalogTotal: 'Типы в каталоге',

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
  dashCbuUpdatedOk: 'Курс обновлён',
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
  whPiecesPerBag: 'В мешке (шт)',
  whPiecesPerBagRequired: 'Укажите количество штук в мешке',
  whPricingSection: 'Цены',
  whPricingOptional: 'Необязательно — можно оставить пустым',
  whPurchasePrice: 'Закупочная цена',
  whSalePrice: 'Цена продажи',
  whFxRateToUzs: 'Курс (1 валюта = сум)',
  whFxRateHint: 'Можно изменить вручную',
  whFxApplyCbu: 'Курс ЦБ',
  whCbuRatesTitle: 'Курс Центробанка',
  whCbuRatesLoading: 'Загрузка курса…',
  whCbuRatesUsd: '1 USD = {rate} сум',
  whCbuRatesEur: '1 EUR = {rate} сум',
  whCbuRatesError: 'Не удалось загрузить курс',
  whCbuRatesRetry: 'Повторить',
  whPricingInvalid: 'Неверная цена или курс',
  whPriceInUzs: '≈ {amount} сум',
  whCatalogPiecesPerBag: 'В пачке: {count} шт',
  whCatalogPackLabel: 'В пачке',
  whCatalogPackValue: '{count} шт',
  whCatalogComposition: 'Состав',
  whCatalogMachines: 'Аппарат',
  whCatalogSemiLinked: 'Полуфабрикат',
  whCatalogVolume: 'Объём',
  whCatalogItemsCount: '{count} шт',
  whCatalogFxLabel: 'Курс',
  whCatalogFxValue: '1 {currency} = {rate} сум',
  whStockPackSubtitle: '{total} шт · {bags} пачек (по {ppb}) · {rem} шт не упаковано',
  whStockPackSubtitleFull: '{total} шт · {bags} пачек (по {ppb})',
  whStockLinePacked: '{bags} пачек упаковано (по {ppb} шт)',
  whStockLineUnpackaged: '{rem} шт не упаковано',
  whStockLineAllPackaged: 'Всё упаковано',
  whExportExcel: 'Скачать Excel',
  whExportPrint: 'Печать',
  whExportScopeTitle: 'Экспорт и печать',
  whExportScopeDescription: 'Какие товары включить?',
  whExportScopeCurrent: 'Только текущий раздел ({type})',
  whExportScopeBothCombined: 'Полуфабрикат + готовый (одна таблица)',
  whExportScopeBothSeparate: 'Отдельные таблицы (полуф. / готов.)',
  whExportSelectProducts: 'Товары',
  whExportSelectAll: 'Выбрать все',
  whExportSelectedCount: '{n} / {total} выбрано',
  whExportNoneSelected: 'Выберите хотя бы один товар',
  whExportConfirm: 'Продолжить',
  whExportColNum: '№',
  whExportColName: 'Наименование',
  whExportColUnit: 'Ед. изм.',
  whExportColSalePrice: 'Цена продажи',
  whExportColQty: 'Кол-во',
  whExportColTotalUzs: 'Итого (сум)',
  whExportColTotalUsd: 'Итого ($)',
  whExportColType: 'Тип',
  whExportSectionSemi: 'Полуфабрикаты',
  whExportSectionFinal: 'Готовая продукция',
  whExportTypeSemi: 'Полуфабрикат',
  whExportTypeFinal: 'Готовый',
  whExportGrandTotal: 'Итого',
  whExportPrintedAt: 'Дата',
  whExportDocTitleSemi: 'Склад — полуфабрикаты',
  whExportDocTitleFinal: 'Склад — готовая продукция',
  whExportNoPrice: '—',
  whCatalogSearchPlaceholder: 'Поиск по названию или описанию…',
  whCatalogNoSearchResults: 'По запросу товары не найдены',
  whOverviewViewCards: 'Карточки',
  whOverviewViewTable: 'Таблица',
  whOverviewColPack: 'Упаковка',
  whOverviewColFill: 'Заполнение %',
  whOverviewColProfit: 'Прибыль',
  whProfitRawLine: '{name}: {kgPrice} сум/кг · {grams} г → {cost} сум',
  whProfitSemiLine: '{name}: {cost} сум',
  whProfitSaleLine: 'Продажа: {amount} сум',
  whProfitValueLine: 'Прибыль: {amount} сум',
  whProfitSemiAddonLine: '+ {name}: {amount} сум',
  whProfitTotalLine: 'Общая прибыль: {amount} сум',
  whOverviewShowProfit: 'Показать прибыль',
  whOverviewIncludeSemiProfit: '+ Прибыль полуфабриката',
  whExportProfitOptionsTitle: 'Прибыль',
  whExportShowProfit: 'Показать столбец прибыли',
  whExportIncludeSemiProfit: '+ Добавить прибыль полуфабриката',
  whOverviewFullscreenEnter: 'Полный экран',
  whOverviewFullscreenExit: 'Выйти из экрана',
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
  whErrProductNotFound:
    'Продукт не найден. Обновите страницу — каталог мог устареть.',
  whErrRawMaterialsNotFound:
    'Выбранное сырьё не найдено. Перевыберите состав.',
  whErrMachinesNotFound: 'Выбранный аппарат не найден. Обновите список.',
  whRawMaterialUnavailable: 'недоступно',
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
  slStockNotEnough: 'На складе недостаточно',
  slStockNeeded: 'нужно',
  slAvailableProducts: 'Доступные продукты',
  slNewClient: 'Новый клиент',
  slClientList: 'Список киентов',
  slDebtPaid: 'Расчёт произведён',
  slBtn: 'Подтвердить продажу',
  slAddToCart: 'Добавить',
  slCart: 'Состав реализации',
  slCartEmpty: 'Позиции не добавлены',
  slHistoryIgnoresDateFilter: 'История продаж не зависит от фильтра дат в шапке',
  slHistoryDebtHint: 'Есть долги, но продажи не загрузились — обновите страницу или проверьте права',
  slPdfDownloadFailed: 'Не удалось скачать PDF',
  slPrintDeliveryTitle: 'Печать — транспорт',
  slVehiclePlate: 'Номер автомобиля',
  slVehiclePlatePlaceholder: '01 A 123 BC',
  slDriverName: 'Водитель',
  slDriverNamePlaceholder: 'ФИО',
  slDeliveryDefaultsHint: 'Данные сохраняются для клиента и подставляются при следующей печати',
  slSelectAll: 'Выбрать все',
  slDeselectAll: 'Снять выбор',
  slSelectedCount: 'Выбрано: {n}',
  slDownloadSelectedPdf: 'Скачать PDF выбранных',
  slBulkPdfSummaryTitle: 'Сводка продаж',
  slSelectSalesForPdf: 'Выберите хотя бы одну продажу для PDF',
  slEditSale: 'Редактировать',
  slEditSaleTitle: 'Редактирование продажи',
  slSaveSaleEdit: 'Сохранить',
  slSaleUpdated: 'Продажа обновлена',
  slSaleUpdateFailed: 'Не удалось обновить продажу',
  slApiClientRemoved: 'Клиент удалён из списка — выберите другого',
  slApiClientNotFound: 'Клиент не найден',
  slApiPaidExceedsTotal: 'Оплата не может превышать сумму заказа',
  slApiPaidBelowRecorded: 'Оплата не может быть меньше уже учтённых платежей',
  slEditLine: 'Редактировать строку',
  slSaveLine: 'Сохранить строку',
  slEditingLine: 'Редактирование — измените и нажмите зелёную ✓',
  slFinishLineEdit: 'Сначала сохраните или отмените редактирование строки',
  slClientSearchPlaceholder: 'Поиск клиента…',
  slSaleFxRate: 'курс',
  slAddItem: 'Добавить строку',
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
  exHistoryColActions: 'Действия',
  exHistoryColUser: 'Пользователь',
  exAuditCreated: 'Внёс: {name}',
  exAuditUpdated: 'Изменил: {name}',
  exExpenseEditTitle: 'Редактировать расход',
  exExpenseDeleteTitle: 'Удалить расход?',
  exExpenseDeleteHint:
    'Запись будет удалена из списка. Расходы категории «Сырьё: внешний заказ» удалить здесь нельзя.',
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
  exExternalOrderManualBlocked:
    '«Сырьё: внешний заказ» добавляется в расходы только при создании внешнего заказа — вручную здесь не вводится.',
  exPageStatsNote:
    'Диаграмма и сводка сверху — за всё время. Таблица «История» — по выбранному фильтру дат.',
  exTrendTitle: 'Динамика расходов',
  exTrendWeek: 'Понедельно',
  exTrendMonth: 'Помесячно',
  exTrendYear: 'По годам',
  exTopCategories: 'Топ категорий',
  exFundingSourceLabel: 'Откуда берутся деньги',
  exFundingSourcesTitle: 'Источники средств',
  exFundingSourceAdd: 'Новый источник',
  exFundingSourceName: 'Название источника',
  exFundingSourceDelete: 'Удалить',
  exFundingSourceDeleteTitle: 'Удалить источник из списка?',
  exFundingSourceDeleteHint: 'Источник исчезнет из списка; записи в истории сохранятся.',
  exNoFundingSources: 'Нет источников средств. Сначала создайте источник.',
  exFundingSourceRequired: 'Выберите источник средств',
  exFundingReportTitle: 'Отчёт по источникам средств',
  exHistoryColFundingSource: 'Источник средств',
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
  cdEdit: 'Редактировать',

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
  prTabKassa: 'Касса',
  prTabClients: 'Клиенты',
  prTabSuppliers: 'Поставщики',
  prClientsSearch: 'Поиск клиента…',
  prClientPurchaseHistory: 'История покупок',
  prClientNoSales: 'Нет продаж',
  prSupplierPurchaseHistory: 'История закупок',
  prSupplierNoOrders: 'Нет закупок',
  prColPrepaid: 'Предоплата',
  prKassaBalance: 'Общий счёт кассы',
  prKassaTotalInflow: 'Всего приход',
  prKassaTotalOutflow: 'Всего расход',
  prKassaInflowSection: 'Приход',
  prKassaOutflowSection: 'Расход',
  prKassaAddInflow: 'Добавить приход',
  prKassaAddOutflow: 'Добавить расход',
  prKassaClient: 'Клиент',
  prKassaAmount: 'Сумма',
  prKassaComment: 'Комментарий',
  prKassaDate: 'Дата',
  prKassaCreatedBy: 'Внёс',
  prKassaNoInflows: 'Нет приходов',
  prKassaNoOutflows: 'Нет расходов',
  prKassaDeleteInflowTitle: 'Удалить приход',
  prKassaDeleteInflowConfirm: 'Эта запись будет удалена. С баланса клиента тоже спишется.',
  prKassaDeleteOutflowTitle: 'Удалить расход',
  prKassaDeleteOutflowConfirm: 'Эта запись будет удалена.',
  prKassaEditInflow: 'Редактировать приход',
  prKassaEditOutflow: 'Редактировать расход',
  slClientCashBalance: 'Баланс клиента',
  slBalanceWillApply: 'При продаже спишется с баланса',
  prKassaSelectClient: 'Выберите клиента',
  prKassaNoClients: 'Нет клиентов — сначала добавьте клиента в разделе «Продажи»',
  prGenerate: 'Сформировать ведомость',
  prCloseVedomost: 'Закрыть ведомость',
  prCloseVedomostTitle: 'Закрыть ведомость',
  prCloseVedomostConfirm:
    'Все строки зарплаты за {month} будут удалены. Отменить действие нельзя. Продолжить?',
  prCloseVedomostPaidBlocked:
    'Некоторые сотрудники отмечены как «выплачено» — сначала снимите отметку.',
  prCloseVedomostSuccess: 'Ведомость закрыта',
  prCloseVedomostAction: 'Да, закрыть',
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

  // Statement import wizard
  siImportTitle: 'Загрузка выписки Excel',
  siImportHint: 'Перетащите или выберите файл банковской выписки (.xlsx)',
  siImportAction: 'Выбрать файл',
  siUploading: 'Загрузка...',
  siUploadSuccess: 'Файл загружен — проверьте строки',
  siUploadError: 'Ошибка загрузки файла',
  siStatementsList: 'Загруженные выписки',
  siNoStatements: 'Выписки ещё не загружены',
  siReviewPending: 'Проверить строки',
  siAllReviewed: 'Все строки проверены',
  siRowsTitle: 'Строки выписки',
  siColDate: 'Дата',
  siColType: 'Тип',
  siColAmount: 'Сумма',
  siColCounterparty: 'Контрагент',
  siColAccount: 'Счёт',
  siColBankCode: 'Код банка',
  siColCompanyAccount: 'Счёт клиента',
  siColCompanyBank: 'Банк клиента',
  siColCompanyStir: 'ИНН клиента',
  siColPurpose: 'Назначение',
  siColStatus: 'Статус',
  siColLink: 'Связано',
  siColCreatedBy: 'Внёс',
  siColActions: 'Действия',
  siTypeIncome: 'Приход',
  siTypeExpense: 'Расход',
  siStatusPending: 'Ожидает',
  siStatusConfirmed: 'Подтверждено',
  siStatusSkipped: 'Пропущено',
  siKindClient: 'Клиент',
  siKindSupplier: 'Поставщик',
  siKindCompany: 'Компания',
  siKindUnknown: 'Неизвестно',
  siWizardTitle: 'Проверка строки',
  siWizardStep: 'Строка {current} / {total}',
  siRowStir: 'ИНН / СТИР',
  siQuestionClient: 'Это приход от клиента — верно?',
  siQuestionExpense: 'Это расход — куда?',
  siClientMatched: 'Клиент найден в системе',
  siClientNotFound: 'Такого клиента нет в системе',
  siSupplierMatched: 'Поставщик найден в системе',
  siSupplierNotFound: 'Такого поставщика нет в системе',
  siCompanyRowNote: 'Это собственный счёт компании (внутреннее движение)',
  siSelectClient: 'Выберите клиента',
  siSelectSupplier: 'Выберите поставщика',
  siSupplierOptional: 'Поставщик (необязательно)',
  siSelectCategory: 'Категория расхода',
  siModeClient: 'Приход клиенту',
  siModeKassa: 'Приход в кассу',
  siModeExpense: 'Расход',
  siQuestionKassa: 'Это поступление из банка в кассу — верно?',
  siKassaInflowHint: 'Не привязано к клиенту — увеличивает общий баланс кассы',
  prKassaBankInflow: 'Из банка в кассу',
  siConfirmYes: 'Да, добавить',
  siConfirmAndEdit: 'Изменить и добавить',
  siSkip: 'Нет / Пропустить',
  siManual: 'Ввести вручную',
  siCreateClient: 'Создать клиента',
  siCreateSupplier: 'Создать поставщика',
  siCreateCategory: 'Создать категорию',
  siCategoryNotFound: 'Нет подходящей категории — создайте новую',
  siCategoryMatched: 'Подходящая категория найдена',
  siNewName: 'Название',
  siNewPhone: 'Телефон (необязательно)',
  siNext: 'Далее',
  siPrev: 'Назад',
  siRowConfirmed: 'Строка подтверждена',
  siRowSkipped: 'Строка пропущена',
  siRowDeleted: 'Строка удалена',
  siNeedClient: 'Выберите или создайте клиента',
  siNeedCategory: 'Выберите или создайте категорию расхода',
  siUnclearHint: 'Если непонятно — исправьте вручную',
  siEditRowTitle: 'Редактировать строку',
  siDeleteRowTitle: 'Удалить строку',
  siDeleteRowConfirm: 'Эта строка и созданные ею записи (касса/расход) будут удалены. Продолжить?',
  siDeleteStatementTitle: 'Удалить выписку',
  siDeleteStatementConfirm:
    '«{name}» и все строки внутри будут удалены. Связанные записи кассы/расходов по подтверждённым строкам тоже отменятся. Продолжить?',
  siStatementDeleted: 'Выписка удалена',
  siBankBalance: 'Средства на банковском счёте',
  siBankIncomeTotal: 'Всего приход',
  siBankExpenseTotal: 'Всего расход',
  siBankAccount: 'Банковский счёт',
  siBankName: 'Название банка',
  siStir: 'ИНН / СТИР',
  siSourceBank: 'Банк',
  siSourceKassa: 'Касса',
  siPendingBadge: '{count} ожидает',
  siCompanyAccountsTitle: 'Банковские счета компании',
  siCompanyAccountsHint: 'Эти счета считаются собственными счетами компании в выписке',
  siAccountNumber: 'Номер счёта',
  siAccountLabel: 'Примечание (необязательно)',
  siAddAccount: 'Добавить',
  siNoCompanyAccounts: 'Счета не добавлены',
  siAccountAdded: 'Счёт добавлен',
  siAccountDeleted: 'Счёт удалён',
  siActiveBankAccount: 'Банковский счёт',
  siSelectBankAccount: 'Выберите счёт',
  siAccountActivated: 'Банковский счёт изменён',
  siAccountChangedBy: 'Последнее изменение',
  siAllAccountsBalance: 'По всем счетам (активный счёт не выбран)',
  siNoCompanyAccountsBalanceHint: 'Добавьте счёт в Бухгалтерия → «Налоговые ставки» → «Банковские счета компании»',
  siOpenCompanyAccountsSettings: 'Перейти в настройки',
  siAccountActiveBadge: 'Активный',
  siErrInvalidAmount: 'Сумма неверна или слишком мала (минимум 0,01)',
  siErrInvalidDate: 'Неверная дата',
  siErrValidation: 'Введённые данные неверны',
  siErrKassaModeBackend: 'Сервер устарел — перезапустите backend (приход в кассу)',
  siErrFileRequired: 'Файл не выбран',
  siErrStatementNotFound: 'Выписка не найдена',
  siErrRowNotFound: 'Строка не найдена',
  siErrRowAlreadyConfirmed: 'Строка уже подтверждена. Сначала отмените',
  siErrClientPhoneAllocate: 'Не удалось назначить телефон клиенту',
  siErrSkipConfirmed: 'Подтверждённую строку нельзя пропустить. Сначала отмените',
  siErrEditConfirmed: 'Для редактирования подтверждённой строки сначала отмените её',
  siErrAccountRequired: 'Не указан номер счёта',
  siErrAccountDuplicate: 'Этот номер счёта уже существует',
  siErrAccountNotFound: 'Счёт не найден',
  siErrNameRequired: 'Не указано название',
  siTableFullscreenEnter: 'Полный экран',
  siTableFullscreenExit: 'Выйти (Esc)',
  siTableScrollLeft: 'Столбцы — влево',
  siTableScrollRight: 'Столбцы — вправо',
  siTableScrollHint: 'Столбцы',
  siTablePageInfo: '{from}–{to} / {total}',

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
  invQtyKgHint: 'Например: 12.560 или 12 560 = 12 кг 560 г',
  invLoadFailed: 'Не удалось загрузить инвентаризацию',
  invSaveFailed: 'Ошибка сохранения',
  invStockNegativeError:
    'Недостаточно остатка на складе — учётный остаток в документе может не совпадать с фактическим. Обновите страницу и проверьте реальные значения.',
  invLoading: 'Загрузка…',
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