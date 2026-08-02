export type Language = 'en' | 'ar';

export interface TranslationDictionary {
  nav: {
    logoTitle: string;
    logoSub: string;
    adminHub: string;
    dashboard: string;
    audits: string;
    newAudit: string;
    activity: string;
    editProfile: string;
    signOut: string;
    language: string;
    english: string;
    arabic: string;
  };
  roles: {
    superAdmin: string;
    management: string;
    accountManager: string;
    accountant: string;
    operationSupervisor: string;
    unassigned: string;
  };
  login: {
    title: string;
    subtitle: string;
    welcomeBack: string;
    signInPrompt: string;
    usernameLabel: string;
    passwordLabel: string;
    rememberMe: string;
    signInBtn: string;
    signingIn: string;
    invalidCredentials: string;
    forgotPassword: string;
    contactAdmin: string;
    forgotTitle: string;
    forgotDesc: string;
    resetInstruction: string;
    close: string;
  };
  so?: Record<string, any>;
  dashboard: {
    welcomeBack: string;
    title: string;
    loggedInAs: string;
    totalAudits: string;
    repositorySize: string;
    pendingApprovals: string;
    inReviewPipeline: string;
    completedAudits: string;
    fullyApproved: string;
    rejectedAudits: string;
    requiresAction: string;
    newAuditBtn: string;
  };
  auditsList: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    filterStation: string;
    filterStatus: string;
    allStations: string;
    allStatuses: string;
    auditNo: string;
    station: string;
    auditDate: string;
    supervisor: string;
    status: string;
    netDiscrepancy: string;
    actions: string;
    viewEdit: string;
    exportPdf: string;
    delete: string;
    noAuditsFound: string;
    showingAudits: string;
    statusDraft: string;
    statusPendingAccountant: string;
    statusPendingAccountManager: string;
    statusPendingManagement: string;
    statusApproved: string;
    statusRejected: string;
    statusReturned: string;
    deleteConfirm: string;
  };
  auditForm: {
    metricsTitle: string;
    grandTotalSales: string;
    meteredFuelRevenue: string;
    cashReceived: string;
    expected: string;
    netDiscrepancy: string;
    cashShortage: string;
    cashSurplus: string;
    perfectlyBalanced: string;
    fuelSalesSummary: string;
    auditInfoTitle: string;
    auditInfoSub: string;
    selectStation: string;
    auditDate: string;
    cityLocation: string;
    opSupervisor: string;
    collectionsTitle: string;
    collectionsSub: string;
    realTimeVariance: string;
    noorKhoy: string;
    atmPos: string;
    cashReceivedInput: string;
    totalCollections: string;
    totalCollectionsFormula: string;
    petrol91: string;
    petrol95: string;
    diesel: string;
    pumpNo: string;
    openingReading: string;
    closingReading: string;
    quantitySold: string;
    unitPrice: string;
    totalAmount: string;
    actions: string;
    saveDraft: string;
    submitAudit: string;
    returnForCorrection: string;
    approveAudit: string;
    rejectAudit: string;
    printPreview: string;
    pdfExport: string;
    returnToAudits: string;
    returnToDashboard: string;
    notes: string;
    notesPlaceholder: string;
    signaturesTitle: string;
    stationSupervisorSig: string;
    operationSupervisorSig: string;
    clickToSign: string;
    signedBy: string;
    accessDeniedTitle: string;
    accessDeniedDesc: string;
    privateWorkspaceTitle: string;
    privateWorkspaceDesc: string;
    addPump: string;
  };
  admin: {
    hubTitle: string;
    hubSub: string;
    tabUsers: string;
    tabStations: string;
    tabSettings: string;
    tabLogs: string;
    userManagementTitle: string;
    addUserBtn: string;
    searchUsers: string;
    empId: string;
    fullName: string;
    email: string;
    username: string;
    role: string;
    assignedStation: string;
    status: string;
    active: string;
    inactive: string;
    edit: string;
    delete: string;
    deactivate: string;
    stationManagementTitle: string;
    addStationBtn: string;
    stationNo: string;
    stationName: string;
    location: string;
    supervisor: string;
    settingsTitle: string;
    companyNameEn: string;
    companyNameAr: string;
    sessionTimeout: string;
    defaultFuelPrices: string;
    saveSettingsBtn: string;
    logsTitle: string;
    searchLogs: string;
    userCol: string;
    actionCol: string;
    detailsCol: string;
    timeCol: string;
  };
  notifications: {
    title: string;
    subtitle: string;
    markAllRead: string;
    noNotifications: string;
    allCaughtUp: string;
    markAsRead: string;
  };
  profile: {
    modalTitle: string;
    personalInfo: string;
    mySignature: string;
    changePassword: string;
    newPassword: string;
    saveProfile: string;
    cancel: string;
    signatureDesc: string;
  };
  signatureModal: {
    title: string;
    clear: string;
    saveSignature: string;
    instruction: string;
  };
  common: {
    sar: string;
    liters: string;
    cancel: string;
    save: string;
    delete: string;
    close: string;
    loading: string;
    success: string;
    error: string;
  };
  stationSelect: {
    modalTitle: string;
    modalSub: string;
    searchPlaceholder: string;
    showingStations: string;
    noStationsFound: string;
    selectStationBtn: string;
    continueBtn: string;
    stationNo: string;
    supervisor: string;
    location: string;
    region: string;
    authorizedOnly: string;
  };
}


export const translations: Record<Language, TranslationDictionary> = {
  en: {
    nav: {
      logoTitle: 'Al Noor United',
      logoSub: 'Operations & Compliance',
      adminHub: 'Admin Hub',
      dashboard: 'Dashboard',
      audits: 'Audits',
      newAudit: 'New Audit',
      activity: 'Activity',
      editProfile: 'Edit Profile & Signature',
      signOut: 'Sign Out',
      language: 'Language',
      english: 'English',
      arabic: 'العربية',
    },
    roles: {
      superAdmin: 'Super Admin',
      management: 'Management',
      accountManager: 'Account Manager',
      accountant: 'Accountant',
      operationSupervisor: 'Operation Supervisor',
      unassigned: 'Unassigned',
    },
    login: {
      title: 'Al Noor United Fuel Est.',
      subtitle: 'Operations & Compliance Management System',
      welcomeBack: 'Welcome Back',
      signInPrompt: 'Sign in to access the Operations & Compliance Management System.',
      usernameLabel: 'Username or Email',
      passwordLabel: 'Password',
      rememberMe: 'Remember me on this browser',
      signInBtn: 'Sign In to System',
      signingIn: 'Signing in...',
      invalidCredentials: 'Invalid login credentials',
      forgotPassword: 'Forgot Password?',
      contactAdmin: 'Contact System Administrator to reset access',
      forgotTitle: 'Password Recovery',
      forgotDesc: 'Please contact the Al Noor IT System Administrator or Super Admin to reset your account password.',
      resetInstruction: 'For security reasons, self-service password resets are restricted.',
      close: 'Close Window',
    },
    dashboard: {
      welcomeBack: 'Welcome back, {name}',
      title: 'Operations & Compliance Executive Dashboard',
      loggedInAs: 'Logged in as {role} ({position}). Key operational metrics and compliance overview.',
      totalAudits: 'Total Audits',
      repositorySize: 'Audit Repository Size',
      pendingApprovals: 'Pending Approvals',
      inReviewPipeline: 'In Review Pipeline',
      completedAudits: 'Completed Audits',
      fullyApproved: 'Fully Approved',
      rejectedAudits: 'Rejected Audits',
      requiresAction: 'Requires Action',
      newAuditBtn: 'New Station Audit',
    },
    auditsList: {
      title: 'Operations & Compliance Management System',
      subtitle: 'Comprehensive repository, workflow tracking & instant PDF exports',
      searchPlaceholder: 'Search by Audit #, Station Name, or Supervisor...',
      filterStation: 'Station Location',
      filterStatus: 'Audit Status',
      allStations: 'All Stations',
      allStatuses: 'All Statuses',
      auditNo: 'Audit #',
      station: 'Station Name',
      auditDate: 'Audit Date',
      supervisor: 'Operation Supervisor',
      status: 'Status',
      netDiscrepancy: 'Net Discrepancy',
      actions: 'Actions',
      viewEdit: 'View / Edit',
      exportPdf: 'PDF Export',
      delete: 'Delete Audit',
      noAuditsFound: 'No station audits found matching search criteria.',
      showingAudits: 'Showing {count} of {total} Audits',
      statusDraft: 'Draft',
      statusPendingAccountant: 'Pending Accountant',
      statusPendingAccountManager: 'Pending Account Manager',
      statusPendingManagement: 'Pending Management',
      statusApproved: 'Approved',
      statusRejected: 'Rejected',
      statusReturned: 'Returned for Correction',
      deleteConfirm: 'Are you sure you want to delete audit {number}?',
    },
    auditForm: {
      metricsTitle: 'Executive Metrics KPI Summary',
      grandTotalSales: 'Grand Total Sales',
      meteredFuelRevenue: 'Total Metered Fuel Revenue',
      cashReceived: 'Cash Received',
      expected: 'Expected:',
      netDiscrepancy: 'Net Discrepancy',
      cashShortage: 'Cash Shortage Detected',
      cashSurplus: 'Cash Surplus Recorded',
      perfectlyBalanced: 'Perfectly Balanced',
      fuelSalesSummary: 'Fuel Sales Summary',
      auditInfoTitle: 'Audit Information & Location',
      auditInfoSub: 'Select station and date to perform data entry',
      selectStation: 'Select Station',
      auditDate: 'Audit Date',
      cityLocation: 'City / Location',
      opSupervisor: 'Operation Supervisor',
      collectionsTitle: 'Collections & Cash Input',
      collectionsSub: 'Record non-cash sales and actual physical cash handed over',
      realTimeVariance: 'Real-Time Variance Calculation',
      noorKhoy: 'Noor Khoy Collection (SAR)',
      atmPos: 'ATM POS Terminal Sales (SAR)',
      cashReceivedInput: 'Actual Cash Received (SAR)',
      totalCollections: 'Total Collections',
      totalCollectionsFormula: 'Noor Khoy + ATM + Cash in Form',
      petrol91: 'Petrol 91 (بنزين 91)',
      petrol95: 'Petrol 95 (بنزين 95)',
      diesel: 'Diesel (ديزل)',
      pumpNo: 'Pump #',
      openingReading: 'Opening (Lit)',
      closingReading: 'Closing (Lit)',
      quantitySold: 'Sold (Lit)',
      unitPrice: 'Price/L',
      totalAmount: 'Total (SAR)',
      actions: 'Actions',
      saveDraft: 'Save Draft',
      submitAudit: 'Submit for Approval',
      returnForCorrection: 'Return for Correction',
      approveAudit: 'Approve Audit',
      rejectAudit: 'Reject Audit',
      printPreview: 'Print Preview',
      pdfExport: 'Export PDF',
      returnToAudits: 'Return to My Audits',
      returnToDashboard: 'Return to Dashboard',
      notes: 'Notes & Observations',
      notesPlaceholder: 'Enter optional audit notes, physical station observations or comments...',
      signaturesTitle: 'Signatures & Workflow Approvals',
      stationSupervisorSig: 'Fuel Station Supervisor Signature',
      operationSupervisorSig: 'Operation Supervisor Signature',
      clickToSign: 'Click to Draw Signature',
      signedBy: 'Signed by:',
      accessDeniedTitle: 'Access Denied: Audit Creation Restricted',
      accessDeniedDesc: 'Only the Operation Supervisor is authorized to create new Station Audits.',
      privateWorkspaceTitle: 'Access Denied: Private Workspace Restriction',
      privateWorkspaceDesc: 'Operation Supervisors can only view and manage Station Audits that they personally created.',
      addPump: 'Add Pump Nozzles',
    },
    admin: {
      hubTitle: 'Super Admin Management Suite',
      hubSub: 'Manage system users, station registry, global fuel prices, and view activity logs',
      tabUsers: 'User Management',
      tabStations: 'Station Registry',
      tabSettings: 'System Settings',
      tabLogs: 'System Activity Logs',
      userManagementTitle: 'User Account Management',
      addUserBtn: 'Create New User',
      searchUsers: 'Search users by name, employee ID, role...',
      empId: 'Employee ID',
      fullName: 'Full Name',
      email: 'Email',
      username: 'Username',
      role: 'Role',
      assignedStation: 'Assigned Station',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      edit: 'Edit User',
      delete: 'Delete User',
      deactivate: 'Deactivate',
      stationManagementTitle: 'Station Registry Management',
      addStationBtn: 'Register New Station',
      stationNo: 'Station #',
      stationName: 'Station Name',
      location: 'City / Location',
      supervisor: 'Assigned Supervisor',
      settingsTitle: 'System Configuration & Default Fuel Prices',
      companyNameEn: 'Company Name (English)',
      companyNameAr: 'Company Name (Arabic)',
      sessionTimeout: 'Session Timeout (Minutes)',
      defaultFuelPrices: 'Default Fuel Prices (SAR / Liter)',
      saveSettingsBtn: 'Save System Settings',
      logsTitle: 'Audit & System Activity Logs',
      searchLogs: 'Search audit logs...',
      userCol: 'User',
      actionCol: 'Action',
      detailsCol: 'Details',
      timeCol: 'Timestamp',
    },
    notifications: {
      title: 'Notification & Activity Center',
      subtitle: 'Real-time updates on audit approvals, submissions, and status changes',
      markAllRead: 'Mark All Read',
      noNotifications: 'No notifications',
      allCaughtUp: 'All notifications caught up',
      markAsRead: 'Mark as read',
    },
    profile: {
      modalTitle: 'User Profile & Signature Management',
      personalInfo: 'Personal Details',
      mySignature: 'Handwritten Signature',
      changePassword: 'Change Password (Optional)',
      newPassword: 'New Password',
      saveProfile: 'Save Profile Changes',
      cancel: 'Cancel',
      signatureDesc: 'Draw or update your saved handwritten signature for audit authorizations',
    },
    signatureModal: {
      title: 'Draw Handwritten Signature',
      clear: 'Clear Pad',
      saveSignature: 'Save Signature',
      instruction: 'Draw your signature in the box below using touch screen or mouse pointer',
    },
    common: {
      sar: 'SAR',
      liters: 'Liters',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      close: 'Close',
      loading: 'Loading...',
      success: 'Success',
      error: 'Error',
    },
    stationSelect: {
      modalTitle: 'Select Fuel Station',
      modalSub: 'Choose an authorized station to start a new audit',
      searchPlaceholder: 'Search by station number, name, city, location, area, or region...',
      showingStations: 'Showing {count} of {total} stations',
      noStationsFound: 'No matching stations found.',
      selectStationBtn: 'Select Station',
      continueBtn: 'Continue to Audit',
      stationNo: 'Station #',
      supervisor: 'Supervisor',
      location: 'Location',
      region: 'Region',
      authorizedOnly: 'Authorized Stations',
    },
    so: {
      moduleTitle: 'Station Opening Form Module',
      moduleSub: 'Independent Commissioning Protocol & Department Approvals',
      dashboard: 'Dashboard',
      openingForms: 'Opening Forms',
      activityLog: 'Activity Log',
      notifications: 'Notifications',
      userDirectory: 'User Directory',
      newForm: 'New Form',

      dashboardTitle: 'Station Opening Overview',
      dashboardSub: 'Track independent commissioning protocols & department approval workflows',
      totalForms: 'Total Opening Forms',
      totalFormsSub: 'All submitted & draft forms',
      pendingApprovals: 'Pending Department Review',
      pendingApprovalsSub: 'In review pipeline',
      completedApprovals: 'Fully Approved',
      completedApprovalsSub: 'Commissioning protocols completed',
      returnedForms: 'Returned / Action Needed',
      returnedFormsSub: 'Requires revision by creator',
      recentFormsTitle: 'Recent Station Opening Forms',
      recentFormsSub: 'Live tracking of commissioning protocols',
      quickActionsTitle: 'Quick Actions & Protocol Tools',
      quickActionsSub: 'Manage station openings and department approvals',
      viewAllForms: 'View All Forms',

      statusDraft: 'Draft',
      statusPendingSafetyQuality: 'Pending Safety & Quality',
      statusPendingDocController: 'Pending Document Controller',
      statusPendingEngineering: 'Pending Engineering',
      statusPendingManagement: 'Pending Management',
      statusApproved: 'Approved',
      statusReturned: 'Returned',
      statusRejected: 'Rejected',

      listTitle: 'Station Opening Forms Repository',
      listSub: 'Independent commissioning forms and multi-department workflow history',
      searchPlaceholder: 'Search by form number, station name, address...',
      filterStatus: 'Filter Status',
      allStatuses: 'All Statuses',
      formNoCol: 'Form #',
      stationCol: 'Station Name',
      dateCol: 'Date Started',
      supervisorCol: 'Supervisor',
      creatorCol: 'Operation Supervisor',
      statusCol: 'Current Status',
      actionsCol: 'Actions',
      viewEdit: 'View / Edit',
      pdfExport: 'PDF Export',
      deleteForm: 'Delete',
      noFormsFound: 'No Station Opening Forms found.',
      deleteConfirm: 'Are you sure you want to delete this Station Opening Form?',

      backToForms: 'Back to Forms',
      saveDraft: 'Save Draft',
      submitForm: 'Submit to Department Review',
      resubmitForm: 'Resubmit Form',
      reviewApprove: 'Department Review & Approve',
      printPdf: 'Print PDF',
      sec1Title: '1. Station Basic Information',
      sec1Sub: 'Station Opening Details',
      selectStation: 'Select Station',
      dateStarted: 'Date Started',
      stationAddress: 'Station Address',
      electricMeterNo: 'Electric Meter #',
      atmMachine: 'ATM Machine',
      noorKhoyMachine: 'Noor Khoy Machine',
      staffHouse: 'Staff House',
      headOfOp: 'Operation Supervisor',
      available: 'Available',
      notAvailable: 'Not Available',
      installed: 'Installed',
      notInstalled: 'Not Installed',
      yes: 'Yes',
      no: 'No',

      sec2Title: '2. Fuel Pumps & Product Tanks Specifications',
      brandOfPump: 'Brand of Fuel Pump',
      noOfPumps: 'No. of Fuel Pump',
      automation: 'Automation',
      productType: 'Product Type',
      tankCapacity: 'Tank Capacity',
      noOfTanks: 'No. of Tanks',
      tankSafetyChecklist: 'Tank & Piping Safety Checklist',
      earthingCable: 'Earthing Cable',
      hoseCouplings: 'Hose & Couplings',
      ventAirPipes: 'Vent Air Pipes',
      colorCoding: 'Color Coding G-R-B-K',
      sandBackfill: 'Tank with Sand Backfill',
      nozzleBreakdown: 'Nozzles & Pump Count Breakdown',
      noOfNozzles: 'No. of nozzles',
      quantity: 'Quantity',
      p91: 'Petrol 91',
      p95: 'Petrol 95',
      diesel: 'Diesel',
      combined: 'Combined Petrol & Diesel',
      kerosene: 'Kerosene',

      sec3Title: '3. Safety Equipment & Extinguishers Inspection',
      firePump: 'Fire Pump',
      waterTanks: 'Water Tanks',
      batteryForFirePump: 'Battery for Fire Pump',
      fireHoseLocations: 'Fire Hose Cabinet Location (Locations 1 to 12)',
      fireExtinguishersTitle: 'Fire Extinguishers & Safety Items',
      equipmentItem: 'Equipment Item',
      weightVolume: 'Weight / Volume',

      autoDryPowder: 'Automatic Dry Powder',
      autoFoam: 'Automatic Foam',
      dryPowder: 'Dry Powder',
      foam: 'Foam',
      co2Extinguisher: 'CO₂ Fire Extinguisher',
      sandBucket: 'Sand Bucket',
      trafficCone: 'Traffic Cone',
      wasteBin: 'Waste Bin',
      cctvMonitoring: 'CCTV 24/7 Monitoring',

      sec4Title: '4. Operational Amenities Checklist',
      amenities22Items: '22 Amenities Items',
      noorCladding: '1. Noor Cladding',
      priceBoardLed: '2. Price Board & LED Price',
      washrooms: '3. Wash Room for Men/Women',
      pwdRampParking: '4. PWD Ramp & Parking',
      entranceExitSignage: '5. Entrance & Exit Signage',
      stationOffice: '6. Station Office',
      emergencySwitch: '7. Emergency Switch',
      assemblyPoint: '8. Assembly Point',
      backupGenerator: '9. Back Up Generator',
      dieselTruckArea: '10. Diesel area for trucks',
      dieselCanopySmallCar: '11. Diesel inside Noor canopy (small car)',
      supermarket: '12. Supermarket',
      restaurant: '13. Restaurant',
      buffia: '14. Buffia',
      mosque: '15. Mosque Men/Women',
      bankMachine: '16. Bank Machine',
      carWash: '17. Car Wash',
      autoCarWash: '18. Automatic Car Wash',
      buncherShop: '19. Buncher Shop',
      oilChangeShop: '20. Oil Change Shop',
      evCharger: '21. Electric Vehicle Charger',
      others: '22. Others',
      othersPlaceholder: 'Enter additional operational amenities or notes...',

      sec5Title: '5. Management Approval & On-Site Signatures',
      supervisorTitle: '1. Station Supervisor',
      supervisorSub: 'On-site physical inspection signature (No system account required).',
      signOnSite: 'Sign On-Site',
      reSign: 'Re-sign',
      supervisorName: 'Supervisor Name *',
      headOfOpTitle: '2. Operation Supervisor',
      headOfOpSub: 'Form Creator & System Submitter Signature.',
      signCreator: 'Sign Creator',
      headOfOpName: 'Operation Supervisor Name *',
      sigPreview: 'Digital Signature Preview',
      sigNotCaptured: 'Signature Not Captured',

      approvalModalTitle: 'Station Opening Approval Review',
      commentsLabel: 'Approval / Return Comments',
      commentsPlaceholder: 'Enter formal review notes or return reasons...',
      approverDigitalSig: 'Approver Digital Signature',
      changeSig: 'Change Signature',
      signNow: 'Sign Now',
      returnForRevision: 'Return for Revision',
      approveStage: 'Approve Stage',
      notDesignatedApprover: 'You are not the designated approver for the current stage ({role}).',

      selectStationTitle: 'Select Station',
      selectStationSub: 'Choose a station to initialize a new Station Opening Form',
      searchStationPlaceholder: 'Search station by name, station number, region, or address...',
      noMatchingStations: 'No matching stations found.',

      activityLogTitle: 'Operation Supervisor Activity Log',
      activityLogSub: 'Personal activity feed & audit trail for your Station Opening Forms',
      totalRecordedActivities: 'Total Recorded Activities:',
      filterByForm: 'Filter by form #, station, user...',
      allActionTypes: 'All Action Types',
      noActivityRecords: 'No activity records found matching your current search or filter.',
      performedBy: 'Performed by:',
      viewForm: 'View Form',

      actCreated: 'Created',
      actDraftSaved: 'Draft Saved',
      actUpdated: 'Form Updated',
      actSubmitted: 'Submitted',
      actReturned: 'Returned for Revision',
      actResubmitted: 'Resubmitted',
      actApprovedStage: 'Department Approved',
      actRejected: 'Rejected',
      actFinalApproval: 'Final Approval Completed',

      userDirTitle: 'Station Opening User Accounts Directory',
      userDirSub: 'Manage department approval roles, access permissions, and mobile numbers',
      newUserAccount: 'New User Account',
      searchUsersPlaceholder: 'Search by full name, email, employee ID, role...',
      allDepartmentRoles: 'All Department Roles',
      nameEmailCol: 'Name & Email',
      roleCol: 'Department Role',
      employeeIdCol: 'Employee ID',
      accessStatusCol: 'Access Status',
      lastLoginCol: 'Last Login',
      editUser: 'Edit Profile',
      resetPass: 'Reset Pass',
      active: 'Active',
      inactive: 'Inactive',
      enabled: 'Enabled',
      disabled: 'Disabled',

      roleSafetyQuality: 'Safety & Quality Control',
      roleDocController: 'Document Controller',
      roleEngineering: 'Engineering Department',
      roleManagement: 'Al Noor United Management',
      roleHeadOfOp: 'Operation Supervisor',
    },
  },

  ar: {
    nav: {
      logoTitle: 'النور المتحدة',
      logoSub: 'العمليات والامتثال',
      adminHub: 'مركز الإدارة',
      dashboard: 'لوحة التحكم',
      audits: 'التدقيقات',
      newAudit: 'تدقيق جديد',
      activity: 'التنبيهات والنشاط',
      editProfile: 'تعديل الملف التوقيع',
      signOut: 'تسجيل الخروج',
      language: 'اللغة',
      english: 'English',
      arabic: 'العربية',
    },
    roles: {
      superAdmin: 'مدير النظام',
      management: 'الإدارة العامة',
      accountManager: 'مدير الحسابات',
      accountant: 'المحاسب',
      operationSupervisor: 'مشرف العمليات',
      unassigned: 'غير معين',
    },
    login: {
      title: 'مؤسسة النور المتحدة للوقود',
      subtitle: 'نظام إدارة العمليات والامتثال',
      welcomeBack: 'مرحباً بعودتك',
      signInPrompt: 'سجل الدخول للوصول إلى نظام إدارة العمليات والامتثال.',
      usernameLabel: 'اسم المستخدم أو البريد الإلكتروني',
      passwordLabel: 'كلمة المرور',
      rememberMe: 'تذكرني على هذا المتصفح',
      signInBtn: 'تسجيل الدخول للنظام',
      signingIn: 'جاري تسجيل الدخول...',
      invalidCredentials: 'بيانات الاعتماد غير صحيحة',
      forgotPassword: 'نسيت كلمة المرور؟',
      contactAdmin: 'تواصل مع مسؤول النظام لإعادة ضبط الوصول',
      forgotTitle: 'استعادة كلمة المرور',
      forgotDesc: 'يرجى التواصل مع مسؤول تكنولوجيا المعلومات لمؤسسة النور لإعادة ضبط كلمة المرور الخاصة بك.',
      resetInstruction: 'لدواعي الأمان، يتم تقييد إعادة ضبط كلمة المرور الذاتية.',
      close: 'إغلاق النافذة',
    },
    dashboard: {
      welcomeBack: 'مرحباً بعودتك، {name}',
      title: 'لوحة تحكم العمليات والامتثال التنفيذية',
      loggedInAs: 'تم تسجيل الدخول بصفتك {role} ({position}). نظرة عامة على المقاييس التشغيلية والامتثال.',
      totalAudits: 'إجمالي التدقيقات',
      repositorySize: 'حجم سجل التدقيقات',
      pendingApprovals: 'الموافقات المعلقة',
      inReviewPipeline: 'قيد المراجعة',
      completedAudits: 'التدقيقات المكتملة',
      fullyApproved: 'معتمد بالكامل',
      rejectedAudits: 'التدقيقات المرفوضة',
      requiresAction: 'يتطلب إجراء',
      newAuditBtn: 'تدقيق محطة جديد',
    },
    auditsList: {
      title: 'نظام إدارة العمليات والامتثال',
      subtitle: 'سجل شامل، تتبع سير العمل وتصدير PDF فوري',
      searchPlaceholder: 'البحث حسب رقم التدقيق، اسم المحطة، أو المشرف...',
      filterStation: 'موقع المحطة',
      filterStatus: 'حالة التدقيق',
      allStations: 'جميع المحطات',
      allStatuses: 'جميع الحالات',
      auditNo: 'رقم التدقيق',
      station: 'اسم المحطة',
      auditDate: 'تاريخ التدقيق',
      supervisor: 'مشرف العمليات',
      status: 'الحالة',
      netDiscrepancy: 'صافي الفروقات',
      actions: 'الإجراءات',
      viewEdit: 'عرض / تعديل',
      exportPdf: 'تصدير PDF',
      delete: 'حذف التدقيق',
      noAuditsFound: 'لم يتم العثور على تدقيقات محطة تطابق معايير البحث.',
      showingAudits: 'عرض {count} من إجمالي {total} تدقيق',
      statusDraft: 'مسودة',
      statusPendingAccountant: 'في انتظار المحاسب',
      statusPendingAccountManager: 'في انتظار مدير الحسابات',
      statusPendingManagement: 'في انتظار الإدارة العامة',
      statusApproved: 'معتمد',
      statusRejected: 'مرفوض',
      statusReturned: 'معاد للتصحيح',
      deleteConfirm: 'هل أنت تأكد من رغبتك في حذف التدقيق رقم {number}؟',
    },
    auditForm: {
      metricsTitle: 'بطاقات ملخص المقاييس التنفيذية',
      grandTotalSales: 'إجمالي المبيعات الكلي',
      meteredFuelRevenue: 'إجمالي إيرادات الوقود المقاسة',
      cashReceived: 'النقد المستلم',
      expected: 'المتوقع:',
      netDiscrepancy: 'صافي الفروقات',
      cashShortage: 'تم اكتشاف عجز نقدي',
      cashSurplus: 'تم تسجيل فائض نقدي',
      perfectlyBalanced: 'متوازن تماماً',
      fuelSalesSummary: 'ملخص مبيعات الوقود',
      auditInfoTitle: 'معلومات التدقيق والموقع',
      auditInfoSub: 'اختر المحطة والتاريخ لإدخال البيانات',
      selectStation: 'اختر المحطة',
      auditDate: 'تاريخ التدقيق',
      cityLocation: 'المدينة / الموقع',
      opSupervisor: 'مشرف العمليات',
      collectionsTitle: 'إدخال التحصيلات والنقد',
      collectionsSub: 'تسجيل المبيعات غير النقدية والنقد الفعلي المسلّم',
      realTimeVariance: 'حساب الفروقات الفوري',
      noorKhoy: 'تحصيل نور خوي (ريال)',
      atmPos: 'مبيعات أجهزة الصراف الآلي (ريال)',
      cashReceivedInput: 'النقد الفعلي المستلم (ريال)',
      totalCollections: 'إجمالي التحصيلات',
      totalCollectionsFormula: 'نور خوي + صراف آلي + النقد المستلم',
      petrol91: 'بنزين 91 (Petrol 91)',
      petrol95: 'بنزين 95 (Petrol 95)',
      diesel: 'ديزل (Diesel)',
      pumpNo: 'رقم المضخة',
      openingReading: 'الافتتاحي (لتر)',
      closingReading: 'الختامي (لتر)',
      quantitySold: 'المباع (لتر)',
      unitPrice: 'السعر/لتر',
      totalAmount: 'الإجمالي (ريال)',
      actions: 'الإجراءات',
      saveDraft: 'حفظ كمسودة',
      submitAudit: 'إرسال للموافقة',
      returnForCorrection: 'إعادة للتصحيح',
      approveAudit: 'اعتماد التدقيق',
      rejectAudit: 'رفض التدقيق',
      printPreview: 'معاينة الطباعة',
      pdfExport: 'تصدير PDF',
      returnToAudits: 'العودة إلى تدقيقاتي',
      returnToDashboard: 'العودة إلى لوحة التحكم',
      notes: 'الملاحظات والانطباعات',
      notesPlaceholder: 'أدخل ملاحظات التدقيق أو مشاهدات المحطة الميدانية...',
      signaturesTitle: 'التوقيعات وموافقات سير العمل',
      stationSupervisorSig: 'توقيع مشرف المحطة الميداني',
      operationSupervisorSig: 'توقيع مشرف العمليات',
      clickToSign: 'انقر لرسم التوقيع',
      signedBy: 'موقع بواسطة:',
      accessDeniedTitle: 'تم رفض الوصول: إنشاء التدقيق مقيد',
      accessDeniedDesc: 'مشرف العمليات فقط هو المخول بإنشاء تدقيقات محطة جديدة.',
      privateWorkspaceTitle: 'تم رفض الوصول: تقييد منطقة العمل الخاصة',
      privateWorkspaceDesc: 'يمكن لمشرفي العمليات الاطلاع فقط على التدقيقات التي قاموا بإنشائها بأنفسهم.',
      addPump: 'إضافة مضخات جديدة',
    },
    admin: {
      hubTitle: 'جناح إدارة النظام الرئيسي',
      hubSub: 'إدارة المستخدمين، سجل المحطات، أسعار الوقود، وسجلات النشاط',
      tabUsers: 'إدارة المستخدمين',
      tabStations: 'سجل المحطات',
      tabSettings: 'إعدادات النظام',
      tabLogs: 'سجلات النشاط',
      userManagementTitle: 'إدارة حسابات المستخدمين',
      addUserBtn: 'إنشاء مستخدم جديد',
      searchUsers: 'البحث عن مستخدمين...',
      empId: 'الرقم الوظيفي',
      fullName: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      username: 'اسم المستخدم',
      role: 'الدور الوظيفي',
      assignedStation: 'المحطة المعينة',
      status: 'الحالة',
      active: 'نشط',
      inactive: 'غير نشط',
      edit: 'تعديل المستخدم',
      delete: 'حذف المستخدم',
      deactivate: 'إلغاء التنشيط',
      stationManagementTitle: 'إدارة سجل المحطات',
      addStationBtn: 'تسجيل محطة جديدة',
      stationNo: 'رقم المحطة',
      stationName: 'اسم المحطة',
      location: 'المدينة / الموقع',
      supervisor: 'المشرف المعين',
      settingsTitle: 'إعدادات النظام وأسعار الوقود الافتراضية',
      companyNameEn: 'اسم الشركة (بالإنجليزية)',
      companyNameAr: 'اسم الشركة (بالعربية)',
      sessionTimeout: 'مهلة الجلسة (بالدقائق)',
      defaultFuelPrices: 'أسعار الوقود الافتراضية (ريال / لتر)',
      saveSettingsBtn: 'حفظ إعدادات النظام',
      logsTitle: 'سجلات التدقيق ونشاط النظام',
      searchLogs: 'البحث في السجلات...',
      userCol: 'المستخدم',
      actionCol: 'الإجراء',
      detailsCol: 'التفاصيل',
      timeCol: 'التاريخ والوقت',
    },
    notifications: {
      title: 'مركز التنبيهات والنشاط',
      subtitle: 'تحديثات فورية حول موافقات التدقيق والطلبات المرسلة',
      markAllRead: 'تحديد الكل كمعاين',
      noNotifications: 'لا يوجد تنبيهات جديدة',
      allCaughtUp: 'تم الاطلاع على جميع التنبيهات',
      markAsRead: 'تحديد كمعاين',
    },
    profile: {
      modalTitle: 'إدارة الملف الشخصي والتوقيع',
      personalInfo: 'البيانات الشخصية',
      mySignature: 'التوقيع اليدوي المحفوظ',
      changePassword: 'تغيير كلمة المرور (اختياري)',
      newPassword: 'كلمة المرور الجديدة',
      saveProfile: 'حفظ التغييرات',
      cancel: 'إلغاء',
      signatureDesc: 'ارسم أو حدث توقيعك اليدوي المحفوظ لاعتماد التدقيقات',
    },
    signatureModal: {
      title: 'رسم التوقيع اليدوي',
      clear: 'مسح اللوحة',
      saveSignature: 'حفظ التوقيع',
      instruction: 'ارسم توقيعك في المربع أدناه باستخدام اللمس أو المؤشر',
    },
    common: {
      sar: 'ر.س',
      liters: 'لتر',
      cancel: 'إلغاء',
      save: 'حفظ',
      delete: 'حذف',
      close: 'إغلاق',
      loading: 'جاري التحميل...',
      success: 'تم بنجاح',
      error: 'خطأ',
    },
    stationSelect: {
      modalTitle: 'اختيار محطة الوقود',
      modalSub: 'اختر المحطة المصرح بها لبدء تفتيش جديد',
      searchPlaceholder: 'البحث برقم المحطة، الاسم، المدينة، الموقع، المنطقة...',
      showingStations: 'عرض {count} من {total} محطة',
      noStationsFound: 'لم يتم العثور على محطات مطابقة.',
      selectStationBtn: 'اختيار المحطة',
      continueBtn: 'المتابعة إلى نموذج التفتيش',
      stationNo: 'رقم المحطة',
      supervisor: 'المشرف',
      location: 'الموقع / المدينة',
      region: 'المنطقة',
      authorizedOnly: 'المحطات المصرح بها',
    },
    so: {
      moduleTitle: 'وحدة نموذج فتح المحطة',
      moduleSub: 'بروتوكول التشغيل المستقل وموافقات الأقسام',
      dashboard: 'لوحة التحكم',
      openingForms: 'نماذج الفتح',
      activityLog: 'سجل الأنشطة',
      notifications: 'التنبيهات',
      userDirectory: 'دليل المستخدمين',
      newForm: 'نموذج جديد',

      dashboardTitle: 'نظرة عامة على فتح المحطات',
      dashboardSub: 'متابعة بروتوكولات التشغيل وموافقات الأقسام',
      totalForms: 'إجمالي نماذج الفتح',
      totalFormsSub: 'جميع النماذج والمسودات',
      pendingApprovals: 'في انتظار مراجعة الأقسام',
      pendingApprovalsSub: 'قيد المراجعة والاعتماد',
      completedApprovals: 'معتمدة بالكامل',
      completedApprovalsSub: 'تم اكتمال التجهيز والافتتاح',
      returnedForms: 'معادة / تتطلب إجراء',
      returnedFormsSub: 'تتطلب تعديل بواسطة المنشئ',
      recentFormsTitle: 'أحدث نماذج فتح المحطات',
      recentFormsSub: 'متابعة فورية لنموذج الفتح',
      quickActionsTitle: 'إجراءات وأدوات سريعة',
      quickActionsSub: 'إدارة فتح المحطات وموافقات الأقسام',
      viewAllForms: 'عرض جميع النماذج',

      statusDraft: 'مسودة',
      statusPendingSafetyQuality: 'في انتظار السلامة والجودة',
      statusPendingDocController: 'في انتظار مراقب المستندات',
      statusPendingEngineering: 'في انتظار قسم الهندسة',
      statusPendingManagement: 'في انتظار الإدارة العامة',
      statusApproved: 'معتمد بالكامل',
      statusReturned: 'معاد للمراجعة',
      statusRejected: 'مرفوض',

      listTitle: 'سجل نماذج فتح المحطات',
      listSub: 'سجل نماذج التفتيش وموافقات الأقسام المتعددة',
      searchPlaceholder: 'البحث برقم النموذج، اسم المحطة، العنوان...',
      filterStatus: 'تصفية حسب الحالة',
      allStatuses: 'جميع الحالات',
      formNoCol: 'رقم النموذج',
      stationCol: 'اسم المحطة',
      dateCol: 'تاريخ البدء',
      supervisorCol: 'مشرف المحطة',
      creatorCol: 'رئيس العمليات',
      statusCol: 'الحالة الحالية',
      actionsCol: 'الإجراءات',
      viewEdit: 'عرض / تعديل',
      pdfExport: 'تصدير PDF',
      deleteForm: 'حذف',
      noFormsFound: 'لم يتم العثور على نماذج فتح محطة.',
      deleteConfirm: 'هل أنت تأكد من رغبتك في حذف هذا النموذج؟',

      backToForms: 'العودة للنماذج',
      saveDraft: 'حفظ مسودة',
      submitForm: 'إرسال لمراجعة الأقسام',
      resubmitForm: 'إعادة الإرسال',
      reviewApprove: 'مراجعة واعتماد القسم',
      printPdf: 'طباعة PDF',
      sec1Title: '1. معلومات المحطة الأساسية',
      sec1Sub: 'تفاصيل افتتاح المحطة',
      selectStation: 'اختر المحطة',
      dateStarted: 'تاريخ البدء',
      stationAddress: 'عنوان المحطة',
      electricMeterNo: 'رقم عداد الكهرباء',
      atmMachine: 'ماكينة الصراف الآلي',
      noorKhoyMachine: 'آلة نور خوي',
      staffHouse: 'سكن الموظفين',
      headOfOp: 'رئيس العمليات',
      available: 'متوفر',
      notAvailable: 'غير متوفر',
      installed: 'مركب',
      notInstalled: 'غير مركب',
      yes: 'نعم',
      no: 'لا',

      sec2Title: '2. تفاصيل مضخات الوقود والخزانات',
      brandOfPump: 'ماركة مضخة الوقود',
      noOfPumps: 'عدد مضخات الوقود',
      automation: 'الأتمتة',
      productType: 'نوع المنتج',
      tankCapacity: 'سعة الخزان',
      noOfTanks: 'عدد الخزانات',
      tankSafetyChecklist: 'قائمة سلامة الخزانات والأنابيب',
      earthingCable: 'كابل التأريض',
      hoseCouplings: 'الخراطيم والوصلات',
      ventAirPipes: 'أنابيب تهوية الهواء',
      colorCoding: 'ترميز الألوان G-R-B-K',
      sandBackfill: 'خزان مع ردم رملي',
      nozzleBreakdown: 'تفاصيل عدد الفوهات والمضخات',
      noOfNozzles: 'عدد الفوهات',
      quantity: 'الكمية',
      p91: 'بنزين 91',
      p95: 'بنزين 95',
      diesel: 'ديزل',
      combined: 'مجموع بنزين وديزل',
      kerosene: 'كيروسين',

      sec3Title: '3. فحص معدات السلامة ومطافئ الحريق',
      firePump: 'مضخة الحريق',
      waterTanks: 'خزانات المياه',
      batteryForFirePump: 'بطارية لمضخة الحريق',
      fireHoseLocations: 'مواقع خزانات الخراطيم (1 إلى 12)',
      fireExtinguishersTitle: 'معدات وأدوات السلامة',
      equipmentItem: 'عنصر المعدات',
      weightVolume: 'الوزن / الحجم',

      autoDryPowder: 'بودرة جافة أوتوماتيكية',
      autoFoam: 'رغوة أوتوماتيكية',
      dryPowder: 'بودرة جافة',
      foam: 'رغوة',
      co2Extinguisher: 'طفايات ثاني أكسيد الكربون',
      sandBucket: 'سطل رمل',
      trafficCone: 'أقماع مرورية',
      wasteBin: 'سلة نفايات',
      cctvMonitoring: 'كاميرات مراقبة 24/7',

      sec4Title: '4. قائمة المرافق التشغيلية',
      amenities22Items: '22 مرافق تشغيلية',
      noorCladding: '1. نور الكسوة',
      priceBoardLed: '2. لوحة الأسعار وسعر LED',
      washrooms: '3. حمام رجال/نساء',
      pwdRampParking: '4. منحدر ومواقف ذوي الإعاقة',
      entranceExitSignage: '5. لافتات الدخول والخروج',
      stationOffice: '6. مكتب المحطة',
      emergencySwitch: '7. مفتاح الطوارئ',
      assemblyPoint: '8. نقطة التجمع',
      backupGenerator: '9. مولد كهرباء احتياطي',
      dieselTruckArea: '10. منطقة ديزل للشاحنات',
      dieselCanopySmallCar: '11. ديزل داخل مظلة نور (سيارات صغيرة)',
      supermarket: '12. سوبر ماركت',
      restaurant: '13. مطعم',
      buffia: '14. بوفية',
      mosque: '15. مصلى رجال/نساء',
      bankMachine: '16. ماكينة البنك',
      carWash: '17. مغسلة سيارات',
      autoCarWash: '18. مغسلة سيارات أوتوماتيكية',
      buncherShop: '19. بنشري',
      oilChangeShop: '20. محل تغيير الزيت',
      evCharger: '21. شاحن سيارات كهربائية',
      others: '22. أخرى',
      othersPlaceholder: 'أدخل مرافق تشغيلية إضافية أو ملاحظات...',

      sec5Title: '5. موافقة الإدارة والتوقيعات الميدانية',
      supervisorTitle: '1. مشرف المحطة',
      supervisorSub: 'توقيع الفحص الميداني (لا يتطلب حساب نظام).',
      signOnSite: 'التوقيع الميداني',
      reSign: 'إعادة التوقيع',
      supervisorName: 'اسم مشرف المحطة *',
      headOfOpTitle: '2. مشرف العمليات',
      headOfOpSub: 'توقيع منشئ النموذج ومقدم الطلب.',
      signCreator: 'توقيع المنشئ',
      headOfOpName: 'اسم مشرف العمليات *',
      sigPreview: 'معاينة التوقيع الرقمي',
      sigNotCaptured: 'لم يتم تسجيل التوقيع',

      approvalModalTitle: 'مراجعة واعتماد فتح المحطة',
      commentsLabel: 'ملاحظات الاعتماد أو الإعادة',
      commentsPlaceholder: 'أدخل ملاحظات التدقيق أو أسباب الإعادة...',
      approverDigitalSig: 'التوقيع الرقمي للمعتمد',
      changeSig: 'تغيير التوقيع',
      signNow: 'توقيع الآن',
      returnForRevision: 'إعادة للتعديل',
      approveStage: 'اعتماد المرحلة',
      notDesignatedApprover: 'أنت لست المعتمد المخصص للمرحلة الحالية ({role}).',

      selectStationTitle: 'اختر المحطة',
      selectStationSub: 'اختر المحطة لبدء نموذج فتح محطة جديد',
      searchStationPlaceholder: 'البحث باسم المحطة، رقم المحطة، المنطقة، أو العنوان...',
      noMatchingStations: 'لم يتم العثور على محطات مطابقة.',

      activityLogTitle: 'سجل نشاط مشرف العمليات',
      activityLogSub: 'سجل الأنشطة وتتبع إجراءات نماذج فتح المحطات',
      totalRecordedActivities: 'إجمالي الأنشطة المسجلة:',
      filterByForm: 'تصفية حسب رقم النموذج، المحطة، المستخدم...',
      allActionTypes: 'جميع أنواع الإجراءات',
      noActivityRecords: 'لم يتم العثور على أنشطة مطابقة للبحث.',
      performedBy: 'تم بواسطة:',
      viewForm: 'عرض النموذج',

      actCreated: 'تم الإنشاء',
      actDraftSaved: 'تم حفظ مسودة',
      actUpdated: 'تم تحديث النموذج',
      actSubmitted: 'تم الإرسال',
      actReturned: 'معاد للتعديل',
      actResubmitted: 'تمت إعادة الإرسال',
      actApprovedStage: 'تم اعتماد القسم',
      actRejected: 'تم الرفض',
      actFinalApproval: 'تم الاعتماد النهائي',

      userDirTitle: 'دليل حسابات مستخدمي فتح المحطات',
      userDirSub: 'إدارة أدوار موافقات الأقسام، صلاحيات الدخول، وأرقام الجوال',
      newUserAccount: 'حساب مستخدم جديد',
      searchUsersPlaceholder: 'البحث بالاسم الكامل، البريد، رقم الموظف، الدور...',
      allDepartmentRoles: 'جميع أدوار الأقسام',
      nameEmailCol: 'الاسم والبريد',
      roleCol: 'دور القسم',
      employeeIdCol: 'رقم الموظف',
      accessStatusCol: 'حالة الدخول',
      lastLoginCol: 'آخر تسجيل دخول',
      editUser: 'تعديل الملف',
      resetPass: 'إعادة ضبط كلمة المرور',
      active: 'نشط',
      inactive: 'غير نشط',
      enabled: 'مفعل',
      disabled: 'معطل',

      roleSafetyQuality: 'السلامة ومراقبة الجودة',
      roleDocController: 'مراقب المستندات',
      roleEngineering: 'قسم الهندسة',
      roleManagement: 'الإدارة العامة للنور المتحدة',
      roleHeadOfOp: 'مشرف العمليات',
    },
  },
};

