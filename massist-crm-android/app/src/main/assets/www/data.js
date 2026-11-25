const DEFAULT_CRM_DATA = {
  company: {
    name: "Lakda Dal & Besan Utpadan Kendra",
    shortName: "MassistCRM FieldForce",
    gstin: "08AABCL4512F1Z9",
    address: "RIICO Industrial Area, Phase II, Jaipur, Rajasthan - 302022",
    financialYear: "2026-2027",
    currency: "INR (₹)",
    workingHours: "09:30 AM - 06:30 PM"
  },

  zones: [
    "North - Rajasthan",
    "West - Gujarat",
    "Central - MP",
    "North - Delhi NCR"
  ],

  beats: [
    { id: "BT-01", name: "Jaipur Central Mandi", zone: "North - Rajasthan", employeeId: "EMP-101", day: "Monday", outlets: 28, active: true },
    { id: "BT-02", name: "Jaipur Vishwakarma", zone: "North - Rajasthan", employeeId: "EMP-102", day: "Tuesday", outlets: 22, active: true },
    { id: "BT-03", name: "Udaipur City Market", zone: "North - Rajasthan", employeeId: "EMP-103", day: "Wednesday", outlets: 19, active: true },
    { id: "BT-04", name: "Ahmedabad Kalupur", zone: "West - Gujarat", employeeId: "EMP-104", day: "Thursday", outlets: 34, active: true },
    { id: "BT-05", name: "Indore Siyaganj", zone: "Central - MP", employeeId: "EMP-105", day: "Friday", outlets: 26, active: true },
    { id: "BT-06", name: "Delhi Naya Bazar", zone: "North - Delhi NCR", employeeId: "EMP-106", day: "Saturday", outlets: 31, active: true }
  ],

  employees: [
    { id: "EMP-101", name: "Rahul Sharma", role: "ASM", zone: "North - Rajasthan", phone: "9829011223", status: "P", loginTime: "09:18 AM", location: "Jaipur Central Mandi", visitsFtd: 2, visitsMtd: 142, target: 450000, achieved: 382000, active: true },
    { id: "EMP-102", name: "Vikram Singh", role: "Sales Executive", zone: "North - Rajasthan", phone: "9829044556", status: "P", loginTime: "09:32 AM", location: "Jaipur Vishwakarma", visitsFtd: 2, visitsMtd: 128, target: 320000, achieved: 295000, active: true },
    { id: "EMP-103", name: "Priya Patel", role: "SO", zone: "North - Rajasthan", phone: "9799012345", status: "P", loginTime: "09:45 AM", location: "Udaipur City Market", visitsFtd: 1, visitsMtd: 116, target: 300000, achieved: 264000, active: true },
    { id: "EMP-104", name: "Amit Verma", role: "ASM", zone: "West - Gujarat", phone: "9898077889", status: "MA", loginTime: "10:05 AM", location: "Ahmedabad Kalupur", visitsFtd: 1, visitsMtd: 109, target: 500000, achieved: 440000, active: true },
    { id: "EMP-105", name: "Suresh Rathore", role: "Sales Executive", zone: "Central - MP", phone: "9926033445", status: "P", loginTime: "09:25 AM", location: "Indore Siyaganj", visitsFtd: 1, visitsMtd: 94, target: 280000, achieved: 215000, active: true },
    { id: "EMP-106", name: "Neha Gupta", role: "Territory Manager", zone: "North - Delhi NCR", phone: "9811099887", status: "NLY", loginTime: "-", location: "Pending Login", visitsFtd: 0, visitsMtd: 87, target: 400000, achieved: 310000, active: true },
    { id: "EMP-107", name: "Deepak Joshi", role: "Sales Executive", zone: "West - Gujarat", phone: "9825066778", status: "A", loginTime: "-", location: "Absent", visitsFtd: 0, visitsMtd: 75, target: 250000, achieved: 170000, active: true },
    { id: "EMP-108", name: "Manoj Tiwari", role: "Sales Executive", zone: "Central - MP", phone: "9827055443", status: "P", loginTime: "09:40 AM", location: "Bhopal Mandi", visitsFtd: 0, visitsMtd: 99, target: 260000, achieved: 230000, active: true }
  ],

  attendanceSummary: {
    present: 12,
    leave: 0,
    weekOff: 0,
    markedAttendance: 5,
    notLoggedInYet: 2,
    absent: 13,
    totalUsers: 32
  },

  clients: [
    { id: "CL-201", name: "Shree Ganesh Trading Co.", type: "Distributor", zone: "North - Rajasthan", beat: "Jaipur Central Mandi", contact: "Ramesh Agarwal", phone: "9829110022", outstanding: 185000, creditLimit: 500000 },
    { id: "CL-202", name: "Mahalaxmi Kirana & Mart", type: "Retailer", zone: "North - Rajasthan", beat: "Jaipur Vishwakarma", contact: "Kailash Jain", phone: "9829220033", outstanding: 42000, creditLimit: 100000 },
    { id: "CL-203", name: "Udaipur Agro Agencies", type: "Distributor", zone: "North - Rajasthan", beat: "Udaipur City Market", contact: "Harish Mehta", phone: "9829330044", outstanding: 260000, creditLimit: 600000 },
    { id: "CL-204", name: "Patel Super Store", type: "Retailer", zone: "West - Gujarat", beat: "Ahmedabad Kalupur", contact: "Jignesh Patel", phone: "9898440055", outstanding: 78500, creditLimit: 150000 },
    { id: "CL-205", name: "Malwa Grain House", type: "Distributor", zone: "Central - MP", beat: "Indore Siyaganj", contact: "Anil Gupta", phone: "9826550066", outstanding: 310000, creditLimit: 750000 },
    { id: "CL-206", name: "Bikaner Bhujia & Sweets", type: "Key Account", zone: "North - Delhi NCR", beat: "Delhi Naya Bazar", contact: "Sunil Goyal", phone: "9811660077", outstanding: 145000, creditLimit: 400000 }
  ],

  products: [
    { id: "PRD-01", sku: "LDB-BES-500", name: "Lakda Pure Chana Besan 500g", category: "Besan", mrp: 68, pts: 58, ptr: 62, stock: 1420 },
    { id: "PRD-02", sku: "LDB-BES-1KG", name: "Lakda Pure Chana Besan 1kg", category: "Besan", mrp: 132, pts: 112, ptr: 120, stock: 980 },
    { id: "PRD-03", sku: "LDB-BES-30K", name: "Lakda Commercial Besan 30kg Bag", category: "Bulk Besan", mrp: 3450, pts: 3020, ptr: 3180, stock: 340 },
    { id: "PRD-04", sku: "LDB-DAL-T1K", name: "Premium Toor Dal 1kg", category: "Pulses / Dal", mrp: 185, pts: 158, ptr: 168, stock: 760 },
    { id: "PRD-05", sku: "LDB-DAL-M1K", name: "Split Moong Dal 1kg", category: "Pulses / Dal", mrp: 155, pts: 132, ptr: 141, stock: 615 },
    { id: "PRD-06", sku: "LDB-DAL-C30", name: "Chana Dal Sortex 30kg Bag", category: "Bulk Dal", mrp: 2950, pts: 2620, ptr: 2740, stock: 420 }
  ],

  orders: [
    { id: "ORD-9041", date: "2026-11-25", type: "Secondary", employeeId: "EMP-101", clientId: "CL-201", zone: "North - Rajasthan", beat: "Jaipur Central Mandi", itemsCount: 42, value: 84500, status: "Approved" },
    { id: "ORD-9042", date: "2026-11-25", type: "Secondary", employeeId: "EMP-102", clientId: "CL-202", zone: "North - Rajasthan", beat: "Jaipur Vishwakarma", itemsCount: 18, value: 32400, status: "Pending" },
    { id: "ORD-9043", date: "2026-11-25", type: "Secondary", employeeId: "EMP-103", clientId: "CL-203", zone: "North - Rajasthan", beat: "Udaipur City Market", itemsCount: 35, value: 69200, status: "Approved" },
    { id: "ORD-9044", date: "2026-11-24", type: "Secondary", employeeId: "EMP-104", clientId: "CL-204", zone: "West - Gujarat", beat: "Ahmedabad Kalupur", itemsCount: 54, value: 112800, status: "Dispatched" },
    { id: "ORD-9045", date: "2026-11-24", type: "Primary", employeeId: "EMP-105", clientId: "CL-205", zone: "Central - MP", beat: "Indore Siyaganj", itemsCount: 120, value: 345000, status: "Approved" },
    { id: "ORD-9046", date: "2026-11-23", type: "Secondary", employeeId: "EMP-101", clientId: "CL-201", zone: "North - Rajasthan", beat: "Jaipur Central Mandi", itemsCount: 28, value: 54900, status: "Approved" }
  ],

  expenses: [
    { id: "EXP-301", date: "2026-11-25", employeeId: "EMP-101", category: "Travel / Fuel", amount: 680, km: 64, remark: "Jaipur Central Beat visit", status: "Pending" },
    { id: "EXP-302", date: "2026-11-24", employeeId: "EMP-103", category: "Daily Allowance (DA)", amount: 450, km: 38, remark: "Udaipur market coverage", status: "Approved" },
    { id: "EXP-303", date: "2026-11-24", employeeId: "EMP-104", category: "Lodging + Food", amount: 1850, km: 145, remark: "Outstation Ahmedabad tour", status: "Pending" },
    { id: "EXP-304", date: "2026-11-23", employeeId: "EMP-102", category: "Travel / Fuel", amount: 520, km: 48, remark: "Vishwakarma Industrial visit", status: "Approved" }
  ],

  schemes: [
    { id: "SCH-01", title: "Winter Besan Bonanza", product: "Lakda Pure Chana Besan 1kg", minQty: "50 Cases", benefit: "2 Cases Free + 3% Credit Note", validTill: "2026-12-31", active: true },
    { id: "SCH-02", title: "Bulk Dal Mandi Scheme", product: "Chana Dal Sortex 30kg Bag", minQty: "20 Bags", benefit: "₹75/Bag Flat Discount", validTill: "2026-12-15", active: true }
  ],

  statusFeed: [
    { id: "ST-1", author: "Rahul Sharma (ASM)", scope: "All Team", time: "Today, 11:15 AM", text: "Completed 5 productive calls in Jaipur Central Mandi. 42 cases of Chana Besan booked with Shree Ganesh Trading." },
    { id: "ST-2", author: "Admin", scope: "All Team", time: "Today, 09:50 AM", text: "New Winter Besan Bonanza scheme is now live in Scheme Details. Please pitch 50-case slab to all A-class distributors." },
    { id: "ST-3", author: "Amit Verma (ASM)", scope: "West - Gujarat", time: "Yesterday, 06:20 PM", text: "Ahmedabad Kalupur distributor stock reconciliation finished. Primary order dispatch scheduled for tomorrow." }
  ],

  notifications: [
    { id: "N-1", type: "approval", title: "Secondary Order #ORD-9042 awaiting approval", desc: "Vikram Singh • ₹32,400 • Mahalaxmi Kirana", time: "12m ago", read: false },
    { id: "N-2", type: "approval", title: "Expense Claim #EXP-301 (₹680)", desc: "Rahul Sharma • Travel / Fuel (64 km)", time: "35m ago", read: false },
    { id: "N-3", type: "approval", title: "Expense Claim #EXP-303 (₹1,850)", desc: "Amit Verma • Outstation Lodging + Food", time: "2h ago", read: false }
  ],

  baselineKpis: {
    visitsFtd: 7,
    visitsMtdTotal: 1230,
    visitsMtdBadge: 614,
    secOrderCountBadge: 932,
    secOrderUnits: 2660,
    secOrderValueM: 94.05,
    primarySaleBadge: 1,
    primarySaleUnits: 2670,
    primarySaleValueM: 91.54,
    tcFtd: 7,
    pcFtd: 5,
    secondaryTotalSaleVal: "₹4,82,900"
  }
};

const REPORTS_MENU_CONFIG = [
  {
    id: "attendance",
    label: "Attendance Reports",
    icon: "📄",
    iconColor: "#c81e1e",
    items: [
      { id: "daily-location", title: "Employee Daily Location Report", desc: "By this flag you can check employee daily Working Status on Map and check all users start location." },
      { id: "attendance-sheet", title: "Attendance Sheet", desc: "You can see the attendance of all employees with P, MA, L, WO, NLY and A status." },
      { id: "leave-report", title: "Leave Report", desc: "Use to check Leave and status of leave for all employees." },
      { id: "attendance-perf", title: "Attendance Performance Report", desc: "Use to check Attendance Performance Report and punctuality score." }
    ]
  },
  {
    id: "summary",
    label: "Summary Reports",
    icon: "📊",
    iconColor: "#c81e1e",
    items: [
      { id: "daily-sales-summary", title: "Daily Sales Summary", desc: "Consolidated FTD & MTD summary across zones, beats and sales officers." },
      { id: "target-vs-ach", title: "Target vs Achievement", desc: "Track employee-wise monthly sales target vs actual achievement %." },
      { id: "productivity", title: "TC / PC Productivity Report", desc: "Total Calls vs Productive Calls ratio and average order value per outlet." }
    ]
  },
  {
    id: "van-sales",
    label: "Van Sales",
    icon: "🚚",
    iconColor: "#c81e1e",
    items: [
      { id: "van-loadout", title: "Van Load Out Report", desc: "Track stock loaded into delivery vans every morning by SKU." },
      { id: "van-recon", title: "Van Stock Reconciliation", desc: "Compare loaded quantity vs billed quantity and closing van balance." }
    ]
  },
  {
    id: "stock",
    label: "Stock Reports",
    icon: "📦",
    iconColor: "#c81e1e",
    items: [
      { id: "closing-stock", title: "Distributor Closing Stock", desc: "Current SKU-wise inventory available at distributors and depot." },
      { id: "low-stock", title: "Low Stock Alert Report", desc: "Products falling below minimum reorder threshold." }
    ]
  },
  {
    id: "secondary",
    label: "Secondary",
    icon: "🛒",
    iconColor: "#c81e1e",
    items: [
      { id: "sec-order-detail", title: "Secondary Order Detail", desc: "Line-by-line retailer secondary orders booked by field force." },
      { id: "beat-coverage", title: "Beat Coverage Report", desc: "Outlets visited vs planned outlets per beat." }
    ]
  },
  {
    id: "expense",
    label: "Expense Report",
    icon: "🧾",
    iconColor: "#169b3b",
    items: [
      { id: "tada-summary", title: "Monthly TA / DA Summary", desc: "Travel, fuel, daily allowance and lodging claims per employee." },
      { id: "pending-claims", title: "Pending Expense Approvals", desc: "Claims awaiting manager or finance approval." }
    ]
  },
  {
    id: "quality",
    label: "Quality",
    icon: "✅",
    iconColor: "#169b3b",
    items: [
      { id: "market-feedback", title: "Market Quality Feedback", desc: "Retailer feedback on packaging, freshness and weight accuracy." },
      { id: "damage-return", title: "Damage & Expiry Returns", desc: "Track stock returns and replacement credit notes." }
    ]
  },
  {
    id: "cheque",
    label: "Cheque Report",
    icon: "₹",
    iconColor: "#0e5a8a",
    items: [
      { id: "cheque-register", title: "Cheque Collection Register", desc: "Distributor payments collected via cheque / NEFT / RTGS." },
      { id: "pending-cheques", title: "Uncleared / Bounced Cheques", desc: "Monitor pending clearance and overdue distributor receivables." }
    ]
  }
];

const SIDEBAR_MENUS = {
  directories: [
    { id: "dir-distributors", title: "Distributor Directory", desc: "View and manage all primary distributors, credit limits and outstandings." },
    { id: "dir-retailers", title: "Retailer / Outlet Master", desc: "Manage retail outlets mapped to beats and territories." },
    { id: "dir-products", title: "Product Catalogue", desc: "Browse SKU codes, MRP, PTS, PTR and available inventory." },
    { id: "dir-beats", title: "Beat / Route Master", desc: "View beat schedules, assigned sales executives and outlet counts." }
  ],
  settings: [
    { id: "set-custom-price", title: "Custom Product Price Settings", desc: "You can set custom price of a particular product on different scenario." },
    { id: "set-company", title: "Company Settings", desc: "You can set All Company Detail, form, Admin Links, Workflow etc." },
    { id: "set-reset-pwd", title: "Reset Password", desc: "You can reset your password via this link." },
    { id: "set-emp-master", title: "Employee Master", desc: "This is used to create, edit and deactivate users in the organization." },
    { id: "set-upload-excel", title: "Upload Product From Excel", desc: "It is used to import product to Database" },
    { id: "set-approval", title: "Approval Hierarchy Settings", desc: "You can set approval hierarchy setting." },
    { id: "set-banner", title: "Banner Setting", desc: "It is used to upload banners." },
    { id: "set-scheme", title: "Scheme Details", desc: "This is used to set scheme of product for clients." },
    { id: "set-bulk-scheme", title: "Bulk Scheme Import", desc: "This is used to bulk scheme import of product for clients." },
    { id: "set-address-import", title: "Address Directory Import", desc: "This is used to bulk address directory import data." }
  ],
  general: [
    { id: "gen-holidays", title: "Holiday Calendar", desc: "Configure regional and national holidays for attendance calculation." },
    { id: "gen-leave-policy", title: "Leave Policy & Types", desc: "Set CL, SL, EL quotas and weekly off rules." },
    { id: "gen-circulars", title: "Notice Board & Circulars", desc: "Broadcast important company announcements to field employees." },
    { id: "gen-support", title: "Help & Support Desk", desc: "Raise technical support tickets or view CRM user manual." }
  ]
};
