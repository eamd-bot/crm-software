const STORAGE_KEY = "massist_crm_state_v1";

let appState = loadState();
let activeReportCat = "attendance";
let activeReportData = { title: "", headers: [], rows: [] };
let activeSidebarTab = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Storage unavailable, using default data", e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_CRM_DATA));
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (e) {
    console.warn("Could not save state", e);
  }
}

function showToast(msg) {
  const el = document.getElementById("toastMsg");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
}

function formatINR(num) {
  return "₹" + Number(num || 0).toLocaleString("en-IN");
}

function getEmployeeName(id) {
  const emp = appState.employees.find(e => e.id === id);
  return emp ? emp.name : id;
}

function getClientName(id) {
  const cl = appState.clients.find(c => c.id === id);
  return cl ? cl.name : id;
}

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", () => {
  populateFilterDropdowns();
  renderCompanyBranding();
  renderNotificationsBadge();
  renderReportsMegaMenu();
  applyDashboardFilters();
  renderStatusFeed();

  document.addEventListener("click", (e) => {
    const mega = document.getElementById("reportsMegaMenu");
    const megaBtn = document.getElementById("reportsMegaBtn");
    if (mega.classList.contains("open") && !mega.contains(e.target) && !megaBtn.contains(e.target)) {
      mega.classList.remove("open");
      megaBtn.classList.remove("active");
    }

    const flyout = document.getElementById("sidebarFlyout");
    const rail = document.querySelector(".left-vertical-rail");
    if (flyout.classList.contains("open") && !flyout.contains(e.target) && !rail.contains(e.target)) {
      closeSidebarFlyout();
    }

    const pop = document.getElementById("headerPopover");
    const iconGroup = document.querySelector(".icon-btn-group");
    if (pop.classList.contains("open") && !pop.contains(e.target) && !iconGroup.contains(e.target)) {
      pop.classList.remove("open");
    }

    const sDrop = document.getElementById("searchDropdown");
    const sWrap = document.querySelector(".global-search-wrap");
    if (sDrop.classList.contains("open") && !sWrap.contains(e.target)) {
      sDrop.classList.remove("open");
    }
  });
});

function renderCompanyBranding() {
  document.getElementById("navCompanyShort").textContent = appState.company.shortName || "MassistCRM";
  document.getElementById("navCompanySub").textContent = appState.company.name;
}

function populateFilterDropdowns() {
  const zSel = document.getElementById("filterZone");
  const eSel = document.getElementById("filterEmployee");
  const bSel = document.getElementById("filterBeat");

  const prevZ = zSel.value || "ALL";
  const prevE = eSel.value || "ALL";
  const prevB = bSel.value || "ALL";

  zSel.innerHTML = `<option value="ALL">Select Zone (All)</option>` +
    appState.zones.map(z => `<option value="${z}">${z}</option>`).join("");

  eSel.innerHTML = `<option value="ALL">Select Employee (All)</option>` +
    appState.employees.map(e => `<option value="${e.id}">${e.name} (${e.role})</option>`).join("");

  bSel.innerHTML = `<option value="ALL">Select Beat (All)</option>` +
    appState.beats.map(b => `<option value="${b.name}">${b.name}</option>`).join("");

  zSel.value = prevZ;
  eSel.value = prevE;
  bSel.value = prevB;
}

// ==================== VIEW SWITCHING ====================
function switchView(viewName) {
  closeSidebarFlyout();
  document.getElementById("reportsMegaMenu").classList.remove("open");
  document.getElementById("reportsMegaBtn").classList.remove("active");

  document.querySelectorAll(".view-section").forEach(v => v.classList.remove("active"));
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.add("active");

  document.querySelectorAll(".top-nav-link").forEach(a => {
    a.classList.toggle("active", a.dataset.view === viewName);
  });
  document.querySelectorAll(".sub-nav-link").forEach(a => {
    a.classList.toggle("active", a.dataset.view === viewName);
  });

  if (viewName === "dashboard") applyDashboardFilters();
  if (viewName === "bi") renderBIView();
  if (viewName === "mydata") renderMyDataView();
  if (viewName === "myclient") renderClientsTable();
  if (viewName === "beat") renderBeatsTable();
  if (viewName === "expense") renderExpensesTable();
}

function toggleExpandDashboard() {
  document.getElementById("dashboardLayout").classList.toggle("expanded");
}

function refreshDashboard() {
  applyDashboardFilters();
  showToast("Dashboard KPIs refreshed!");
}

// ==================== DASHBOARD FILTERS & KPIs ====================
function applyDashboardFilters() {
  const zone = document.getElementById("filterZone").value;
  const empId = document.getElementById("filterEmployee").value;
  const beat = document.getElementById("filterBeat").value;

  const filteredEmps = appState.employees.filter(e => {
    if (zone !== "ALL" && e.zone !== zone) return false;
    if (empId !== "ALL" && e.id !== empId) return false;
    return true;
  });

  const filteredOrders = appState.orders.filter(o => {
    if (zone !== "ALL" && o.zone !== zone) return false;
    if (empId !== "ALL" && o.employeeId !== empId) return false;
    if (beat !== "ALL" && o.beat !== beat) return false;
    return true;
  });

  // Compute dynamic KPIs
  const totalTarget = filteredEmps.reduce((s, e) => s + e.target, 0) || 1;
  const totalAch = filteredEmps.reduce((s, e) => s + e.achieved, 0);
  const pct = Math.min(100, Math.round((totalAch / totalTarget) * 100));
  document.getElementById("kpiSelfPct").textContent = pct + "%";
  document.getElementById("kpiSelfTargetSub").innerHTML =
    `Target: ₹${(totalTarget / 100000).toFixed(2)}L<br/>Achieved: ₹${(totalAch / 100000).toFixed(2)}L`;

  const isAll = (zone === "ALL" && empId === "ALL" && beat === "ALL");
  if (isAll) {
    const a = appState.attendanceSummary;
    const loggedIn = a.present + a.markedAttendance;
    const loginPct = Math.round((loggedIn / a.totalUsers) * 100);
    document.getElementById("kpiLoginBadge").textContent = loggedIn;
    document.getElementById("kpiLoginBreakdown").innerHTML =
      `P-${a.present} , L-${a.leave} , WO-${a.weekOff}<br/>MA-${a.markedAttendance} , (NLY-${a.notLoggedInYet} , A-${a.absent})`;
    document.getElementById("kpiLoginBar").style.width = loginPct + "%";
    document.getElementById("kpiLoginPctText").textContent = loginPct + "%";
    document.getElementById("kpiLoginRatioText").textContent = `${loggedIn} / ${a.totalUsers}`;
  } else {
    const pCount = filteredEmps.filter(e => e.status === "P").length;
    const maCount = filteredEmps.filter(e => e.status === "MA").length;
    const lCount = filteredEmps.filter(e => e.status === "L").length;
    const nlyCount = filteredEmps.filter(e => e.status === "NLY").length;
    const aCount = filteredEmps.filter(e => e.status === "A").length;
    const total = filteredEmps.length || 1;
    const logged = pCount + maCount;
    const lp = Math.round((logged / total) * 100);
    document.getElementById("kpiLoginBadge").textContent = logged;
    document.getElementById("kpiLoginBreakdown").innerHTML =
      `P-${pCount} , L-${lCount} , WO-0<br/>MA-${maCount} , (NLY-${nlyCount} , A-${aCount})`;
    document.getElementById("kpiLoginBar").style.width = lp + "%";
    document.getElementById("kpiLoginPctText").textContent = lp + "%";
    document.getElementById("kpiLoginRatioText").textContent = `${logged} / ${filteredEmps.length}`;
  }

  const ftdVisits = filteredEmps.reduce((s, e) => s + e.visitsFtd, 0);
  const mtdVisits = filteredEmps.reduce((s, e) => s + e.visitsMtd, 0);
  document.getElementById("kpiVisitsFtdBadge").textContent = ftdVisits;
  document.getElementById("kpiVisitsFtdVal").textContent = ftdVisits;

  const displayMtdVisits = isAll ? appState.baselineKpis.visitsMtdTotal + (mtdVisits - 850) : mtdVisits;
  document.getElementById("kpiVisitsMtdBadge").textContent = isAll ? appState.baselineKpis.visitsMtdBadge : mtdVisits;
  document.getElementById("kpiVisitsMtdVal").textContent = displayMtdVisits >= 1000 ? (displayMtdVisits / 1000).toFixed(2) + "K" : displayMtdVisits;

  const secOrders = filteredOrders.filter(o => o.type === "Secondary");
  const secVal = secOrders.reduce((s, o) => s + o.value, 0);
  const priOrders = filteredOrders.filter(o => o.type === "Primary");
  const priVal = priOrders.reduce((s, o) => s + o.value, 0);

  if (isAll) {
    document.getElementById("kpiSecOrdersBadge").textContent = appState.baselineKpis.secOrderCountBadge + (secOrders.length - 5);
    document.getElementById("kpiSecOrdersVal").textContent = `2.66K / ${(appState.baselineKpis.secOrderValueM + secVal / 10000000).toFixed(2)}M`;
    document.getElementById("kpiPrimaryBadge").textContent = priOrders.length;
    document.getElementById("kpiPrimaryVal").textContent = `2.67K / ${(appState.baselineKpis.primarySaleValueM + priVal / 10000000).toFixed(2)}M`;
    document.getElementById("kpiSecSaleValue").textContent = formatINR(secVal + 141900);
  } else {
    document.getElementById("kpiSecOrdersBadge").textContent = secOrders.length;
    document.getElementById("kpiSecOrdersVal").textContent = `${secOrders.length} / ${formatINR(secVal)}`;
    document.getElementById("kpiPrimaryBadge").textContent = priOrders.length;
    document.getElementById("kpiPrimaryVal").textContent = `${priOrders.length} / ${formatINR(priVal)}`;
    document.getElementById("kpiSecSaleValue").textContent = formatINR(secVal);
  }

  const tc = Math.max(ftdVisits, secOrders.length);
  const pc = Math.min(tc, secOrders.length || 0);
  const prodPct = tc > 0 ? Math.round((pc / tc) * 100) : 0;
  document.getElementById("kpiTcPcVal").textContent = `${tc} / ${pc} (${prodPct}%)`;

  renderDashEmployeeTable(filteredEmps);
  renderDashOrdersTable(filteredOrders);
}

function renderDashEmployeeTable(list) {
  document.getElementById("dashEmpCountLabel").textContent = `${list.length} Employees`;
  const tbody = document.getElementById("dashEmployeeTableBody");
  const statusMap = {
    P: { label: "Present", cls: "pill-green" },
    MA: { label: "Marked Att.", cls: "pill-blue" },
    NLY: { label: "Not Logged In", cls: "pill-orange" },
    L: { label: "Leave", cls: "pill-orange" },
    A: { label: "Absent", cls: "pill-red" }
  };
  tbody.innerHTML = list.map(e => {
    const st = statusMap[e.status] || { label: e.status, cls: "pill-blue" };
    return `
      <tr>
        <td><strong>${e.name}</strong><div style="font-size:10.5px;color:#64748b;">${e.role} • ${e.location}</div></td>
        <td>${e.zone}</td>
        <td><span class="status-pill ${st.cls}">${st.label}</span></td>
        <td>${e.loginTime}</td>
        <td style="font-weight:700;color:#0b4a7d;">${e.visitsFtd}</td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="5" style="text-align:center;color:#6b7280;">No matching employees</td></tr>`;
}

function renderDashOrdersTable(list) {
  const tbody = document.getElementById("dashOrdersTableBody");
  tbody.innerHTML = list.slice(0, 8).map(o => {
    const pillCls = o.status === "Approved" ? "pill-green" : o.status === "Dispatched" ? "pill-blue" : "pill-orange";
    return `
      <tr>
        <td><strong>${o.id}</strong></td>
        <td>${o.date}</td>
        <td>${o.type}</td>
        <td>${getClientName(o.clientId)}</td>
        <td>${getEmployeeName(o.employeeId)}</td>
        <td>${o.itemsCount}</td>
        <td><strong>${formatINR(o.value)}</strong></td>
        <td><span class="status-pill ${pillCls}">${o.status}</span></td>
        <td>
          ${o.status === "Pending"
            ? `<button class="btn btn-sm btn-success" onclick="approveOrder('${o.id}')">Approve</button>`
            : `<button class="btn btn-sm" onclick="viewOrderDetail('${o.id}')">View</button>`}
        </td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="9" style="text-align:center;color:#6b7280;">No orders for current filter</td></tr>`;
}

function approveOrder(orderId) {
  const order = appState.orders.find(o => o.id === orderId);
  if (order) {
    order.status = "Approved";
    appState.notifications = appState.notifications.filter(n => !n.title.includes(orderId));
    saveState();
    renderNotificationsBadge();
    applyDashboardFilters();
    showToast(`Order ${orderId} approved!`);
  }
}

function viewOrderDetail(orderId) {
  const o = appState.orders.find(x => x.id === orderId);
  if (!o) return;
  openModal(`Order Details — ${o.id}`, `
    <div class="form-grid">
      <div><strong>Order Type:</strong> ${o.type}</div>
      <div><strong>Order Date:</strong> ${o.date}</div>
      <div><strong>Client:</strong> ${getClientName(o.clientId)}</div>
      <div><strong>Sales Officer:</strong> ${getEmployeeName(o.employeeId)}</div>
      <div><strong>Zone / Beat:</strong> ${o.zone} / ${o.beat}</div>
      <div><strong>Quantity:</strong> ${o.itemsCount} Cases/Bags</div>
      <div><strong>Total Value:</strong> ${formatINR(o.value)}</div>
      <div><strong>Status:</strong> ${o.status}</div>
    </div>
  `, `<button class="btn btn-primary" onclick="closeModal()">Close</button>`);
}

// ==================== STATUS POST FEED ====================
function postStatusUpdate() {
  const input = document.getElementById("statusPostInput");
  const scope = document.getElementById("statusScopeSelect").value;
  const text = input.value.trim();
  if (!text) {
    showToast("Please enter a status update first.");
    return;
  }
  const now = new Date();
  const timeStr = "Today, " + now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  appState.statusFeed.unshift({
    id: "ST-" + Date.now(),
    author: "Admin",
    scope,
    time: timeStr,
    text
  });
  input.value = "";
  saveState();
  renderStatusFeed();
  showToast("Status posted to team feed!");
}

function renderStatusFeed() {
  const container = document.getElementById("statusFeedList");
  document.getElementById("feedCountLabel").textContent = `${appState.statusFeed.length} Posts`;
  container.innerHTML = appState.statusFeed.map(item => `
    <div class="feed-item">
      <div class="feed-meta">
        <span><span class="feed-author">${item.author}</span> • <em>${item.scope}</em></span>
        <span>${item.time}</span>
      </div>
      <div class="feed-text">${item.text}</div>
    </div>
  `).join("");
}

// ==================== REPORTS MEGA MENU (Screenshot 2) ====================
function toggleReportsMenu(event) {
  event.stopPropagation();
  closeSidebarFlyout();
  const menu = document.getElementById("reportsMegaMenu");
  const btn = document.getElementById("reportsMegaBtn");
  const willOpen = !menu.classList.contains("open");
  menu.classList.toggle("open", willOpen);
  btn.classList.toggle("active", willOpen);
}

function renderReportsMegaMenu() {
  const catList = document.getElementById("reportsCatList");
  catList.innerHTML = REPORTS_MENU_CONFIG.map(cat => `
    <div class="reports-cat-item ${cat.id === activeReportCat ? "active" : ""}"
         onclick="selectReportCategory('${cat.id}')"
         onmouseenter="selectReportCategory('${cat.id}')">
      <span class="cat-icon" style="color:${cat.id === activeReportCat ? "#fff" : cat.iconColor};">${cat.icon}</span>
      <span>${cat.label}</span>
    </div>
  `).join("");

  const activeCatObj = REPORTS_MENU_CONFIG.find(c => c.id === activeReportCat) || REPORTS_MENU_CONFIG[0];
  const grid = document.getElementById("reportsItemsGrid");
  grid.innerHTML = activeCatObj.items.map(item => `
    <div class="report-link-card" onclick="openReportViewer('${activeCatObj.id}', '${item.id}')">
      <div class="report-link-title">
        <span style="font-size:13px;">📄</span>
        <span>${item.title}</span>
      </div>
      <div class="report-link-desc">${item.desc}</div>
    </div>
  `).join("");
}

function selectReportCategory(catId) {
  if (activeReportCat === catId) return;
  activeReportCat = catId;
  renderReportsMegaMenu();
}

function openReportViewer(catId, itemId) {
  const cat = REPORTS_MENU_CONFIG.find(c => c.id === catId) || REPORTS_MENU_CONFIG[0];
  const item = cat.items.find(i => i.id === itemId) || cat.items[0];
  document.getElementById("reportsMegaMenu").classList.remove("open");
  document.getElementById("reportsMegaBtn").classList.remove("active");

  switchView("report");
  document.getElementById("reportViewerTitle").textContent = `📄 ${cat.label} › ${item.title}`;
  document.getElementById("reportViewerDesc").textContent = item.desc;
  document.getElementById("reportSearchInput").value = "";

  const built = buildReportDataset(catId, itemId);
  activeReportData = { title: item.title, headers: built.headers, rows: built.rows };
  renderReportTable(built.headers, built.rows);
}

function buildReportDataset(catId, itemId) {
  if (catId === "attendance") {
    return {
      headers: ["Emp ID", "Employee Name", "Role", "Zone", "Status", "Login Time", "Start Location", "FTD Visits", "MTD Visits"],
      rows: appState.employees.map(e => [e.id, e.name, e.role, e.zone, e.status, e.loginTime, e.location, e.visitsFtd, e.visitsMtd])
    };
  }
  if (catId === "summary" || catId === "secondary") {
    if (itemId === "target-vs-ach") {
      return {
        headers: ["Emp ID", "Employee", "Zone", "Monthly Target (₹)", "Achieved (₹)", "Achievement %", "MTD Visits"],
        rows: appState.employees.map(e => [
          e.id, e.name, e.zone, formatINR(e.target), formatINR(e.achieved),
          Math.round((e.achieved / (e.target || 1)) * 100) + "%", e.visitsMtd
        ])
      };
    }
    return {
      headers: ["Order ID", "Date", "Type", "Client", "Sales Officer", "Zone", "Beat", "Qty", "Value (₹)", "Status"],
      rows: appState.orders.map(o => [
        o.id, o.date, o.type, getClientName(o.clientId), getEmployeeName(o.employeeId), o.zone, o.beat, o.itemsCount, formatINR(o.value), o.status
      ])
    };
  }
  if (catId === "stock" || catId === "van-sales") {
    return {
      headers: ["SKU Code", "Product Name", "Category", "MRP (₹)", "PTS (₹)", "PTR (₹)", "Available Stock"],
      rows: appState.products.map(p => [p.sku, p.name, p.category, formatINR(p.mrp), formatINR(p.pts), formatINR(p.ptr), p.stock + " Units"])
    };
  }
  if (catId === "expense") {
    return {
      headers: ["Claim ID", "Date", "Employee", "Category", "Distance (KM)", "Amount (₹)", "Remark", "Status"],
      rows: appState.expenses.map(ex => [ex.id, ex.date, getEmployeeName(ex.employeeId), ex.category, ex.km + " km", formatINR(ex.amount), ex.remark, ex.status])
    };
  }
  return {
    headers: ["Client ID", "Business Name", "Type", "Zone", "Beat", "Contact", "Outstanding (₹)", "Credit Limit (₹)"],
    rows: appState.clients.map(c => [c.id, c.name, c.type, c.zone, c.beat, c.contact, formatINR(c.outstanding), formatINR(c.creditLimit)])
  };
}

function renderReportTable(headers, rows) {
  const wrap = document.getElementById("reportViewerTableWrap");
  wrap.innerHTML = `
    <table class="crm-table">
      <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>
        ${rows.length
          ? rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")
          : `<tr><td colspan="${headers.length}" style="text-align:center;color:#6b7280;">No matching records found</td></tr>`}
      </tbody>
    </table>
  `;
}

function filterActiveReportRows(query) {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? activeReportData.rows.filter(r => r.some(cell => String(cell).toLowerCase().includes(q)))
    : activeReportData.rows;
  renderReportTable(activeReportData.headers, filtered);
}

function exportActiveReportCsv() {
  const csvLines = [
    activeReportData.headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(","),
    ...activeReportData.rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
  ];
  const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${activeReportData.title.toLowerCase().replace(/\s+/g, "_")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Report exported to CSV!");
}

// ==================== LEFT SIDEBAR FLYOUT (Screenshot 3) ====================
function toggleSidebarFlyout(tabName, event) {
  event.stopPropagation();
  document.getElementById("reportsMegaMenu").classList.remove("open");
  document.getElementById("reportsMegaBtn").classList.remove("active");

  const flyout = document.getElementById("sidebarFlyout");
  if (activeSidebarTab === tabName && flyout.classList.contains("open")) {
    closeSidebarFlyout();
    return;
  }

  activeSidebarTab = tabName;
  document.querySelectorAll(".vertical-tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabName);
  });

  const items = SIDEBAR_MENUS[tabName] || [];
  document.getElementById("flyoutGrid").innerHTML = items.map((item, idx) => `
    <div class="flyout-item ${idx === 4 ? "highlight" : ""}" onclick="handleSidebarItemClick('${item.id}')">
      <div class="flyout-item-title">${item.title}</div>
      <div class="flyout-item-desc">${item.desc}</div>
    </div>
  `).join("");

  flyout.classList.add("open");
}

function closeSidebarFlyout() {
  activeSidebarTab = null;
  document.getElementById("sidebarFlyout").classList.remove("open");
  document.querySelectorAll(".vertical-tab").forEach(btn => btn.classList.remove("active"));
}

function handleSidebarItemClick(id) {
  closeSidebarFlyout();
  if (id === "dir-distributors" || id === "dir-retailers") {
    switchView("myclient");
  } else if (id === "dir-beats") {
    switchView("beat");
  } else if (id === "dir-products") {
    openProductCatalogueModal();
  } else {
    openSettingModal(id);
  }
}

// ==================== SETTINGS & DIRECTORIES MODALS ====================
function openSettingModal(id) {
  if (id === "set-emp-master") {
    openEmployeeMasterModal();
    return;
  }
  if (id === "set-custom-price") {
    openCustomPriceModal();
    return;
  }
  if (id === "set-company") {
    openCompanySettingsModal();
    return;
  }
  if (id === "set-reset-pwd") {
    openResetPasswordModal();
    return;
  }
  if (id === "set-upload-excel" || id === "set-bulk-scheme" || id === "set-address-import") {
    openBulkImportModal(id);
    return;
  }
  if (id === "set-scheme") {
    openSchemeDetailsModal();
    return;
  }
  if (id === "set-approval") {
    openModal("Approval Hierarchy Settings", `
      <div class="form-grid">
        <div class="form-field">
          <label>Secondary Order Approval</label>
          <select><option>ASM -> Regional Head</option><option>Auto-Approve below ₹50,000</option></select>
        </div>
        <div class="form-field">
          <label>Expense (TA/DA) Approval</label>
          <select><option>Reporting Manager -> Finance</option><option>Direct Finance Admin</option></select>
        </div>
        <div class="form-field">
          <label>Leave Approval</label>
          <select><option>Reporting Manager + HR</option><option>ASM Only</option></select>
        </div>
        <div class="form-field">
          <label>SLA Escalation (Hours)</label>
          <input type="number" value="24" />
        </div>
      </div>
    `, `<button class="btn btn-primary" onclick="closeModal(); showToast('Approval hierarchy saved!')">Save Hierarchy</button>`);
    return;
  }
  if (id === "set-banner") {
    openModal("Banner Setting", `
      <div class="form-grid">
        <div class="form-field full">
          <label>Active Field App Home Banner Title</label>
          <input type="text" id="bannerTitleInp" value="Winter Besan Bonanza — Earn Extra 3% Margin!" />
        </div>
        <div class="form-field full">
          <label>Banner Target Audience</label>
          <select><option>All Distributors &amp; Sales Officers</option><option>North - Rajasthan Only</option></select>
        </div>
      </div>
    `, `<button class="btn btn-primary" onclick="closeModal(); showToast('Banner setting updated!')">Publish Banner</button>`);
    return;
  }

  // General items fallback
  openModal("General Configuration", `
    <p style="margin-bottom:10px;">Configuration panel for <strong>${id}</strong> is ready.</p>
    <div class="form-grid">
      <div class="form-field full">
        <label>Announcement / Policy Note</label>
        <textarea rows="3">Standard operating rules active for Financial Year ${appState.company.financialYear}.</textarea>
      </div>
    </div>
  `, `<button class="btn btn-primary" onclick="closeModal(); showToast('Settings saved!')">Save</button>`);
}

function openEmployeeMasterModal() {
  const rows = appState.employees.map(e => `
    <tr>
      <td>${e.id}</td>
      <td><strong>${e.name}</strong></td>
      <td>${e.role}</td>
      <td>${e.zone}</td>
      <td>${e.phone}</td>
      <td>${formatINR(e.target)}</td>
      <td><span class="status-pill ${e.active ? "pill-green" : "pill-red"}">${e.active ? "Active" : "Inactive"}</span></td>
    </tr>
  `).join("");

  openModal("Employee Master — Create & Manage Users", `
    <div class="form-grid" style="margin-bottom:14px; padding-bottom:12px; border-bottom:1px solid #e5e7eb;">
      <div class="form-field"><label>Full Name</label><input id="newEmpName" placeholder="e.g. Rohit Mehta" /></div>
      <div class="form-field"><label>Role</label><select id="newEmpRole"><option>Sales Executive</option><option>SO</option><option>ASM</option><option>Territory Manager</option></select></div>
      <div class="form-field"><label>Zone</label><select id="newEmpZone">${appState.zones.map(z => `<option>${z}</option>`).join("")}</select></div>
      <div class="form-field"><label>Phone</label><input id="newEmpPhone" placeholder="98XXXXXXXX" /></div>
      <div class="form-field"><label>Monthly Target (₹)</label><input type="number" id="newEmpTarget" value="300000" /></div>
      <div class="form-field" style="justify-content:flex-end;">
        <button class="btn btn-success" onclick="addEmployeeFromModal()">+ Add Employee</button>
      </div>
    </div>
    <div class="data-table-wrap">
      <table class="crm-table">
        <thead><tr><th>ID</th><th>Name</th><th>Role</th><th>Zone</th><th>Phone</th><th>Target</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `, `<button class="btn" onclick="closeModal()">Close</button>`, true);
}

function addEmployeeFromModal() {
  const name = document.getElementById("newEmpName").value.trim();
  const role = document.getElementById("newEmpRole").value;
  const zone = document.getElementById("newEmpZone").value;
  const phone = document.getElementById("newEmpPhone").value.trim() || "9800000000";
  const target = Number(document.getElementById("newEmpTarget").value) || 250000;
  if (!name) return showToast("Enter employee name.");

  appState.employees.push({
    id: "EMP-" + (101 + appState.employees.length),
    name, role, zone, phone,
    status: "P", loginTime: "09:30 AM", location: zone,
    visitsFtd: 1, visitsMtd: 1, target, achieved: 0, active: true
  });
  appState.attendanceSummary.present += 1;
  appState.attendanceSummary.totalUsers += 1;
  saveState();
  populateFilterDropdowns();
  applyDashboardFilters();
  openEmployeeMasterModal();
  showToast(`Employee ${name} added!`);
}

function openCustomPriceModal() {
  const rows = appState.products.map((p, idx) => `
    <tr>
      <td>${p.sku}</td>
      <td>${p.name}</td>
      <td>₹${p.mrp}</td>
      <td><input type="number" id="pts_${idx}" value="${p.pts}" style="width:75px;padding:3px;" /></td>
      <td><input type="number" id="ptr_${idx}" value="${p.ptr}" style="width:75px;padding:3px;" /></td>
    </tr>
  `).join("");

  openModal("Custom Product Price Settings", `
    <div class="data-table-wrap">
      <table class="crm-table">
        <thead><tr><th>SKU</th><th>Product Name</th><th>MRP</th><th>Custom PTS (₹)</th><th>Custom PTR (₹)</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `, `<button class="btn btn-primary" onclick="saveCustomPrices()">Save Custom Prices</button>`, true);
}

function saveCustomPrices() {
  appState.products.forEach((p, idx) => {
    p.pts = Number(document.getElementById(`pts_${idx}`).value) || p.pts;
    p.ptr = Number(document.getElementById(`ptr_${idx}`).value) || p.ptr;
  });
  saveState();
  closeModal();
  showToast("Product pricing updated!");
}

function openProductCatalogueModal() {
  const rows = appState.products.map(p => `
    <tr>
      <td>${p.sku}</td><td><strong>${p.name}</strong></td><td>${p.category}</td>
      <td>₹${p.mrp}</td><td>₹${p.pts}</td><td>₹${p.ptr}</td><td>${p.stock}</td>
    </tr>
  `).join("");
  openModal("Product Catalogue", `
    <div class="data-table-wrap">
      <table class="crm-table">
        <thead><tr><th>SKU</th><th>Product</th><th>Category</th><th>MRP</th><th>PTS</th><th>PTR</th><th>Stock</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `, `<button class="btn btn-primary" onclick="closeModal()">Close</button>`, true);
}

function openCompanySettingsModal() {
  const c = appState.company;
  openModal("Company Settings", `
    <div class="form-grid">
      <div class="form-field"><label>Company Name</label><input id="compName" value="${c.name}" /></div>
      <div class="form-field"><label>App Header Short Name</label><input id="compShort" value="${c.shortName}" /></div>
      <div class="form-field"><label>GSTIN</label><input id="compGst" value="${c.gstin}" /></div>
      <div class="form-field"><label>Financial Year</label><input id="compFy" value="${c.financialYear}" /></div>
      <div class="form-field full"><label>Registered Address</label><input id="compAddr" value="${c.address}" /></div>
    </div>
  `, `<button class="btn btn-primary" onclick="saveCompanySettings()">Save Company Settings</button>`);
}

function saveCompanySettings() {
  appState.company.name = document.getElementById("compName").value.trim() || appState.company.name;
  appState.company.shortName = document.getElementById("compShort").value.trim() || appState.company.shortName;
  appState.company.gstin = document.getElementById("compGst").value.trim();
  appState.company.financialYear = document.getElementById("compFy").value.trim();
  appState.company.address = document.getElementById("compAddr").value.trim();
  saveState();
  renderCompanyBranding();
  closeModal();
  showToast("Company details saved!");
}

function openResetPasswordModal() {
  openModal("Reset Password", `
    <div class="form-grid">
      <div class="form-field full"><label>Select User</label>
        <select>${appState.employees.map(e => `<option>${e.name} (${e.id})</option>`).join("")}</select>
      </div>
      <div class="form-field"><label>New Password</label><input type="password" value="••••••••" /></div>
      <div class="form-field"><label>Confirm Password</label><input type="password" value="••••••••" /></div>
    </div>
  `, `<button class="btn btn-primary" onclick="closeModal(); showToast('Password reset link & credentials updated!')">Reset Password</button>`);
}

function openBulkImportModal(mode) {
  const titleMap = {
    "set-upload-excel": "Upload Product From Excel / CSV",
    "set-bulk-scheme": "Bulk Scheme Import",
    "set-address-import": "Address Directory Import"
  };
  openModal(titleMap[mode] || "Bulk Import", `
    <p style="margin-bottom:10px;color:#475569;">Select a <strong>.csv</strong> file to import records directly into the CRM database.</p>
    <div class="form-field">
      <label>Choose CSV File</label>
      <input type="file" id="bulkCsvFile" accept=".csv,.txt" />
    </div>
    <p style="margin-top:10px;font-size:11.5px;color:#64748b;">Expected columns for Product Import: <code>SKU, Name, Category, MRP, PTS, PTR, Stock</code></p>
  `, `
    <button class="btn" onclick="downloadSampleCsv()">⬇ Download Sample Template</button>
    <button class="btn btn-primary" onclick="processBulkCsvImport()">Import Now</button>
  `);
}

function downloadSampleCsv() {
  const csv = "SKU,Name,Category,MRP,PTS,PTR,Stock\nLDB-SOOJI-500,Lakda Roasted Sooji 500g,Sooji,45,38,41,500\n";
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "product_import_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function processBulkCsvImport() {
  const fileInp = document.getElementById("bulkCsvFile");
  if (!fileInp || !fileInp.files.length) {
    showToast("Please select a CSV file first.");
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    const lines = ev.target.result.split(/\r?\n/).filter(Boolean);
    let added = 0;
    lines.slice(1).forEach(line => {
      const cols = line.split(",").map(s => s.trim());
      if (cols.length >= 6 && cols[0] && cols[1]) {
        appState.products.push({
          id: "PRD-" + (appState.products.length + 1),
          sku: cols[0], name: cols[1], category: cols[2] || "General",
          mrp: Number(cols[3]) || 100, pts: Number(cols[4]) || 85, ptr: Number(cols[5]) || 92, stock: Number(cols[6]) || 100
        });
        added++;
      }
    });
    saveState();
    closeModal();
    showToast(`Imported ${added} product(s) successfully!`);
  };
  reader.readAsText(fileInp.files[0]);
}

function openSchemeDetailsModal() {
  const rows = appState.schemes.map(s => `
    <tr>
      <td>${s.id}</td><td><strong>${s.title}</strong></td><td>${s.product}</td>
      <td>${s.minQty}</td><td>${s.benefit}</td><td>${s.validTill}</td>
    </tr>
  `).join("");
  openModal("Scheme Details", `
    <div class="form-grid" style="margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #e5e7eb;">
      <div class="form-field"><label>Scheme Title</label><input id="schTitle" placeholder="e.g. Festive Dal Offer" /></div>
      <div class="form-field"><label>Product</label><select id="schProd">${appState.products.map(p => `<option>${p.name}</option>`).join("")}</select></div>
      <div class="form-field"><label>Min Qty</label><input id="schQty" placeholder="e.g. 25 Bags" /></div>
      <div class="form-field"><label>Benefit</label><input id="schBen" placeholder="e.g. 1 Bag Free" /></div>
    </div>
    <div style="margin-bottom:12px;"><button class="btn btn-success" onclick="addNewScheme()">+ Add Scheme</button></div>
    <div class="data-table-wrap">
      <table class="crm-table">
        <thead><tr><th>ID</th><th>Scheme</th><th>Product</th><th>Min Qty</th><th>Benefit</th><th>Valid Till</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `, `<button class="btn" onclick="closeModal()">Close</button>`, true);
}

function addNewScheme() {
  const title = document.getElementById("schTitle").value.trim();
  const product = document.getElementById("schProd").value;
  const minQty = document.getElementById("schQty").value.trim() || "10 Units";
  const benefit = document.getElementById("schBen").value.trim() || "2% Extra Margin";
  if (!title) return showToast("Enter scheme title.");
  appState.schemes.push({
    id: "SCH-0" + (appState.schemes.length + 1),
    title, product, minQty, benefit, validTill: "2026-12-31", active: true
  });
  saveState();
  openSchemeDetailsModal();
  showToast("Scheme added!");
}

// ==================== ACTION MODALS (ORDER / VISIT / ATTENDANCE / CLIENT) ====================
function openSelfTargetModal() {
  const rows = appState.employees.map(e => {
    const pct = Math.round((e.achieved / (e.target || 1)) * 100);
    return `<tr><td>${e.name}</td><td>${e.zone}</td><td>${formatINR(e.target)}</td><td>${formatINR(e.achieved)}</td><td><strong>${pct}%</strong></td></tr>`;
  }).join("");
  openModal("Self Target & Team Achievement Breakdown", `
    <div class="data-table-wrap">
      <table class="crm-table">
        <thead><tr><th>Employee</th><th>Zone</th><th>Target</th><th>Achieved</th><th>%</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `, `<button class="btn btn-primary" onclick="closeModal()">Close</button>`, true);
}

function openNewOrderModal() {
  openModal("Book Secondary / Primary Order", `
    <div class="form-grid">
      <div class="form-field"><label>Order Type</label><select id="ordType"><option>Secondary</option><option>Primary</option></select></div>
      <div class="form-field"><label>Sales Officer</label><select id="ordEmp">${appState.employees.map(e => `<option value="${e.id}">${e.name}</option>`).join("")}</select></div>
      <div class="form-field"><label>Client / Distributor</label><select id="ordClient">${appState.clients.map(c => `<option value="${c.id}">${c.name} (${c.type})</option>`).join("")}</select></div>
      <div class="form-field"><label>Product</label><select id="ordProd">${appState.products.map(p => `<option value="${p.id}" data-price="${p.ptr}">${p.name} (₹${p.ptr})</option>`).join("")}</select></div>
      <div class="form-field"><label>Quantity (Cases/Bags)</label><input type="number" id="ordQty" value="20" min="1" /></div>
      <div class="form-field"><label>Order Date</label><input type="date" id="ordDate" value="2026-11-25" /></div>
    </div>
  `, `<button class="btn btn-primary" onclick="saveNewOrder()">Submit Order</button>`);
}

function saveNewOrder() {
  const type = document.getElementById("ordType").value;
  const employeeId = document.getElementById("ordEmp").value;
  const clientId = document.getElementById("ordClient").value;
  const prodSel = document.getElementById("ordProd");
  const price = Number(prodSel.options[prodSel.selectedIndex].dataset.price) || 100;
  const qty = Number(document.getElementById("ordQty").value) || 1;
  const date = document.getElementById("ordDate").value;
  const client = appState.clients.find(c => c.id === clientId);
  const value = qty * price;
  const newId = "ORD-" + (9041 + appState.orders.length);

  appState.orders.unshift({
    id: newId, date, type, employeeId, clientId,
    zone: client ? client.zone : "North - Rajasthan",
    beat: client ? client.beat : "Jaipur Central Mandi",
    itemsCount: qty, value, status: "Pending"
  });

  const emp = appState.employees.find(e => e.id === employeeId);
  if (emp) emp.achieved += value;

  appState.notifications.unshift({
    id: "N-" + Date.now(), type: "approval",
    title: `${type} Order #${newId} awaiting approval`,
    desc: `${getEmployeeName(employeeId)} • ${formatINR(value)}`,
    time: "Just now", read: false
  });

  saveState();
  renderNotificationsBadge();
  applyDashboardFilters();
  closeModal();
  showToast(`Order ${newId} booked (${formatINR(value)})!`);
}

function openLogVisitModal() {
  openModal("Log Store Visit", `
    <div class="form-grid">
      <div class="form-field"><label>Employee</label><select id="visEmp">${appState.employees.map(e => `<option value="${e.id}">${e.name}</option>`).join("")}</select></div>
      <div class="form-field"><label>Client Visited</label><select id="visClient">${appState.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join("")}</select></div>
      <div class="form-field full"><label>Visit Remark</label><input id="visRemark" placeholder="Stock check & order follow-up" /></div>
    </div>
  `, `<button class="btn btn-primary" onclick="saveStoreVisit()">Log Visit</button>`);
}

function saveStoreVisit() {
  const empId = document.getElementById("visEmp").value;
  const clId = document.getElementById("visClient").value;
  const remark = document.getElementById("visRemark").value.trim() || "Market visit completed";
  const emp = appState.employees.find(e => e.id === empId);
  if (emp) {
    emp.visitsFtd += 1;
    emp.visitsMtd += 1;
  }
  appState.statusFeed.unshift({
    id: "ST-" + Date.now(),
    author: getEmployeeName(empId),
    scope: "Field Visit",
    time: "Just now",
    text: `Visited ${getClientName(clId)} — ${remark}`
  });
  saveState();
  applyDashboardFilters();
  renderStatusFeed();
  closeModal();
  showToast("Store visit logged!");
}

function openMarkAttendanceModal() {
  openModal("Mark Employee Attendance", `
    <div class="form-grid">
      <div class="form-field"><label>Employee</label><select id="attEmp">${appState.employees.map(e => `<option value="${e.id}">${e.name} (Current: ${e.status})</option>`).join("")}</select></div>
      <div class="form-field"><label>Status</label><select id="attStat"><option value="P">Present (P)</option><option value="MA">Marked Attendance (MA)</option><option value="L">Leave (L)</option><option value="A">Absent (A)</option></select></div>
    </div>
  `, `<button class="btn btn-primary" onclick="saveAttendance()">Update Attendance</button>`);
}

function saveAttendance() {
  const empId = document.getElementById("attEmp").value;
  const st = document.getElementById("attStat").value;
  const emp = appState.employees.find(e => e.id === empId);
  if (emp) {
    emp.status = st;
    if (st === "P" || st === "MA") emp.loginTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  saveState();
  applyDashboardFilters();
  closeModal();
  showToast("Attendance updated!");
}

function openAddClientModal() {
  openModal("Add New Client / Distributor", `
    <div class="form-grid">
      <div class="form-field"><label>Business Name</label><input id="clName" placeholder="e.g. Agarwal Provision Store" /></div>
      <div class="form-field"><label>Type</label><select id="clType"><option>Retailer</option><option>Distributor</option><option>Key Account</option></select></div>
      <div class="form-field"><label>Zone</label><select id="clZone">${appState.zones.map(z => `<option>${z}</option>`).join("")}</select></div>
      <div class="form-field"><label>Beat</label><select id="clBeat">${appState.beats.map(b => `<option>${b.name}</option>`).join("")}</select></div>
      <div class="form-field"><label>Contact Person</label><input id="clContact" placeholder="Owner Name" /></div>
      <div class="form-field"><label>Phone</label><input id="clPhone" placeholder="98XXXXXXXX" /></div>
    </div>
  `, `<button class="btn btn-primary" onclick="saveNewClient()">Save Client</button>`);
}

function saveNewClient() {
  const name = document.getElementById("clName").value.trim();
  if (!name) return showToast("Enter business name.");
  appState.clients.push({
    id: "CL-" + (201 + appState.clients.length),
    name,
    type: document.getElementById("clType").value,
    zone: document.getElementById("clZone").value,
    beat: document.getElementById("clBeat").value,
    contact: document.getElementById("clContact").value.trim() || "Owner",
    phone: document.getElementById("clPhone").value.trim() || "9800000000",
    outstanding: 0, creditLimit: 200000
  });
  saveState();
  renderClientsTable();
  closeModal();
  showToast(`Client ${name} added!`);
}

// ==================== SUB VIEWS: BI, MYDATA, MYCLIENT, BEAT, EXPENSE ====================
function renderBIView() {
  const totalSales = appState.orders.reduce((s, o) => s + o.value, 0);
  const totalTarget = appState.employees.reduce((s, e) => s + e.target, 0);
  const totalAch = appState.employees.reduce((s, e) => s + e.achieved, 0);
  const totalVisits = appState.employees.reduce((s, e) => s + e.visitsMtd, 0);

  document.getElementById("biStatsRow").innerHTML = `
    <div class="bi-stat-card"><div class="bi-stat-label">MTD Achieved Sales</div><div class="bi-stat-val">${formatINR(totalAch)}</div></div>
    <div class="bi-stat-card"><div class="bi-stat-label">Monthly Target</div><div class="bi-stat-val">${formatINR(totalTarget)}</div></div>
    <div class="bi-stat-card"><div class="bi-stat-label">Recent Order Book</div><div class="bi-stat-val">${formatINR(totalSales)}</div></div>
    <div class="bi-stat-card"><div class="bi-stat-label">Total MTD Visits</div><div class="bi-stat-val">${totalVisits}</div></div>
  `;

  // Zone-wise SVG bar chart
  const zoneBars = appState.zones.map(z => {
    const zEmps = appState.employees.filter(e => e.zone === z);
    const ach = zEmps.reduce((s, e) => s + e.achieved, 0);
    const tgt = zEmps.reduce((s, e) => s + e.target, 0) || 1;
    const pct = Math.min(100, Math.round((ach / tgt) * 100));
    return `
      <div style="margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
          <strong>${z}</strong><span>${formatINR(ach)} / ${formatINR(tgt)} (${pct}%)</span>
        </div>
        <div style="height:14px;background:#e2e8f0;border-radius:2px;overflow:hidden;">
          <div style="width:${pct}%;height:100%;background:#1c4e9c;"></div>
        </div>
      </div>
    `;
  }).join("");
  document.getElementById("biZoneChart").innerHTML = zoneBars;

  const attCounts = { P: 0, MA: 0, NLY: 0, A: 0 };
  appState.employees.forEach(e => { attCounts[e.status] = (attCounts[e.status] || 0) + 1; });
  document.getElementById("biAttendanceChart").innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      <div class="bi-stat-card" style="border-left-color:#169b3b;"><div class="bi-stat-label">Present (P)</div><div class="bi-stat-val">${attCounts.P}</div></div>
      <div class="bi-stat-card" style="border-left-color:#2563eb;"><div class="bi-stat-label">Marked Attendance (MA)</div><div class="bi-stat-val">${attCounts.MA}</div></div>
      <div class="bi-stat-card" style="border-left-color:#f59e0b;"><div class="bi-stat-label">Not Logged In (NLY)</div><div class="bi-stat-val">${attCounts.NLY}</div></div>
      <div class="bi-stat-card" style="border-left-color:#dc2626;"><div class="bi-stat-label">Absent (A)</div><div class="bi-stat-val">${attCounts.A}</div></div>
    </div>
  `;
}

function renderMyDataView() {
  const emp = appState.employees[0];
  document.getElementById("myDataContent").innerHTML = `
    <div class="bi-cards-row">
      <div class="bi-stat-card"><div class="bi-stat-label">Logged User</div><div class="bi-stat-val" style="font-size:16px;">Admin (${emp.name})</div></div>
      <div class="bi-stat-card"><div class="bi-stat-label">Primary Zone</div><div class="bi-stat-val" style="font-size:16px;">${emp.zone}</div></div>
      <div class="bi-stat-card"><div class="bi-stat-label">FTD Visits</div><div class="bi-stat-val">${emp.visitsFtd}</div></div>
      <div class="bi-stat-card"><div class="bi-stat-label">MTD Achieved</div><div class="bi-stat-val">${formatINR(emp.achieved)}</div></div>
    </div>
    <div class="panel-box">
      <div class="panel-header">Active Schemes You Can Offer Today</div>
      <div class="data-table-wrap" style="border:none;">
        <table class="crm-table">
          <thead><tr><th>ID</th><th>Scheme</th><th>Product</th><th>Min Qty</th><th>Benefit</th><th>Valid Till</th></tr></thead>
          <tbody>${appState.schemes.map(s => `<tr><td>${s.id}</td><td><strong>${s.title}</strong></td><td>${s.product}</td><td>${s.minQty}</td><td>${s.benefit}</td><td>${s.validTill}</td></tr>`).join("")}</tbody>
        </table>
      </div>
    </div>
  `;
}

function renderClientsTable() {
  document.getElementById("clientsTableBody").innerHTML = appState.clients.map(c => `
    <tr>
      <td>${c.id}</td>
      <td><strong>${c.name}</strong></td>
      <td><span class="status-pill ${c.type === "Distributor" ? "pill-blue" : "pill-green"}">${c.type}</span></td>
      <td>${c.zone}</td>
      <td>${c.beat}</td>
      <td>${c.contact}</td>
      <td>${c.phone}</td>
      <td>${formatINR(c.outstanding)}</td>
      <td>${formatINR(c.creditLimit)}</td>
      <td><button class="btn btn-sm btn-primary" onclick="openNewOrderModal()">Book Order</button></td>
    </tr>
  `).join("");
}

function renderBeatsTable() {
  document.getElementById("beatsTableBody").innerHTML = appState.beats.map(b => `
    <tr>
      <td>${b.id}</td>
      <td><strong>${b.name}</strong></td>
      <td>${b.zone}</td>
      <td>${getEmployeeName(b.employeeId)}</td>
      <td>${b.day}</td>
      <td>${b.outlets}</td>
      <td><span class="status-pill pill-green">${b.active ? "Active" : "Paused"}</span></td>
      <td><button class="btn btn-sm" onclick="toggleBeatActive('${b.id}')">${b.active ? "Pause" : "Activate"}</button></td>
    </tr>
  `).join("");
}

function toggleBeatActive(id) {
  const b = appState.beats.find(x => x.id === id);
  if (b) {
    b.active = !b.active;
    saveState();
    renderBeatsTable();
    showToast(`Beat ${b.name} updated!`);
  }
}

function openAddBeatModal() {
  openModal("Add New Beat", `
    <div class="form-grid">
      <div class="form-field"><label>Beat Name</label><input id="btName" placeholder="e.g. Kota Grain Mandi" /></div>
      <div class="form-field"><label>Zone</label><select id="btZone">${appState.zones.map(z => `<option>${z}</option>`).join("")}</select></div>
      <div class="form-field"><label>Assign Employee</label><select id="btEmp">${appState.employees.map(e => `<option value="${e.id}">${e.name}</option>`).join("")}</select></div>
      <div class="form-field"><label>Visit Day</label><select id="btDay"><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option></select></div>
      <div class="form-field"><label>Outlets Count</label><input type="number" id="btOutlets" value="20" /></div>
    </div>
  `, `<button class="btn btn-primary" onclick="saveNewBeat()">Create Beat</button>`);
}

function saveNewBeat() {
  const name = document.getElementById("btName").value.trim();
  if (!name) return showToast("Enter beat name.");
  appState.beats.push({
    id: "BT-0" + (appState.beats.length + 1),
    name,
    zone: document.getElementById("btZone").value,
    employeeId: document.getElementById("btEmp").value,
    day: document.getElementById("btDay").value,
    outlets: Number(document.getElementById("btOutlets").value) || 15,
    active: true
  });
  saveState();
  populateFilterDropdowns();
  renderBeatsTable();
  closeModal();
  showToast(`Beat ${name} added!`);
}

function renderExpensesTable() {
  document.getElementById("expensesTableBody").innerHTML = appState.expenses.map(ex => {
    const cls = ex.status === "Approved" ? "pill-green" : ex.status === "Rejected" ? "pill-red" : "pill-orange";
    return `
      <tr>
        <td>${ex.id}</td>
        <td>${ex.date}</td>
        <td><strong>${getEmployeeName(ex.employeeId)}</strong></td>
        <td>${ex.category}</td>
        <td>${ex.km} km</td>
        <td><strong>${formatINR(ex.amount)}</strong></td>
        <td>${ex.remark}</td>
        <td><span class="status-pill ${cls}">${ex.status}</span></td>
        <td>
          ${ex.status === "Pending"
            ? `<button class="btn btn-sm btn-success" onclick="updateExpenseStatus('${ex.id}', 'Approved')">Approve</button>
               <button class="btn btn-sm btn-danger" onclick="updateExpenseStatus('${ex.id}', 'Rejected')">Reject</button>`
            : "—"}
        </td>
      </tr>
    `;
  }).join("");
}

function updateExpenseStatus(id, status) {
  const ex = appState.expenses.find(x => x.id === id);
  if (ex) {
    ex.status = status;
    appState.notifications = appState.notifications.filter(n => !n.title.includes(id));
    saveState();
    renderNotificationsBadge();
    renderExpensesTable();
    showToast(`Expense ${id} marked ${status}`);
  }
}

function openAddExpenseModal() {
  openModal("Submit Expense Claim", `
    <div class="form-grid">
      <div class="form-field"><label>Employee</label><select id="exEmp">${appState.employees.map(e => `<option value="${e.id}">${e.name}</option>`).join("")}</select></div>
      <div class="form-field"><label>Category</label><select id="exCat"><option>Travel / Fuel</option><option>Daily Allowance (DA)</option><option>Lodging + Food</option><option>Client Meeting</option></select></div>
      <div class="form-field"><label>Distance (KM)</label><input type="number" id="exKm" value="45" /></div>
      <div class="form-field"><label>Amount (₹)</label><input type="number" id="exAmt" value="550" /></div>
      <div class="form-field full"><label>Remark</label><input id="exRem" placeholder="Market visit travel" /></div>
    </div>
  `, `<button class="btn btn-primary" onclick="saveNewExpense()">Submit Claim</button>`);
}

function saveNewExpense() {
  const newId = "EXP-" + (301 + appState.expenses.length);
  const empId = document.getElementById("exEmp").value;
  const amt = Number(document.getElementById("exAmt").value) || 0;
  appState.expenses.unshift({
    id: newId,
    date: "2026-11-25",
    employeeId: empId,
    category: document.getElementById("exCat").value,
    km: Number(document.getElementById("exKm").value) || 0,
    amount: amt,
    remark: document.getElementById("exRem").value.trim() || "Field expense",
    status: "Pending"
  });
  saveState();
  renderExpensesTable();
  closeModal();
  showToast(`Expense claim ${newId} submitted!`);
}

// ==================== GLOBAL SEARCH & HEADER POPOVERS ====================
function handleGlobalSearch(query) {
  const drop = document.getElementById("searchDropdown");
  const q = query.trim().toLowerCase();
  if (!q) {
    drop.classList.remove("open");
    return;
  }
  const results = [];
  appState.employees.forEach(e => {
    if (e.name.toLowerCase().includes(q) || e.zone.toLowerCase().includes(q)) {
      results.push({ label: `${e.name} (${e.role})`, tag: "Employee", action: () => { document.getElementById("filterEmployee").value = e.id; switchView("dashboard"); } });
    }
  });
  appState.clients.forEach(c => {
    if (c.name.toLowerCase().includes(q) || c.beat.toLowerCase().includes(q)) {
      results.push({ label: `${c.name} • ${c.beat}`, tag: "Client", action: () => switchView("myclient") });
    }
  });
  appState.orders.forEach(o => {
    if (o.id.toLowerCase().includes(q)) {
      results.push({ label: `${o.id} • ${formatINR(o.value)}`, tag: "Order", action: () => viewOrderDetail(o.id) });
    }
  });
  REPORTS_MENU_CONFIG.forEach(cat => {
    cat.items.forEach(item => {
      if (item.title.toLowerCase().includes(q)) {
        results.push({ label: item.title, tag: "Report", action: () => openReportViewer(cat.id, item.id) });
      }
    });
  });

  window.__searchActions = results.map(r => r.action);
  drop.innerHTML = results.length
    ? results.slice(0, 10).map((r, i) => `
        <div class="search-result-item" onclick="window.__searchActions[${i}](); document.getElementById('searchDropdown').classList.remove('open');">
          <span>${r.label}</span>
          <span class="search-tag">${r.tag}</span>
        </div>
      `).join("")
    : `<div class="search-result-item" style="color:#6b7280;">No matching results for "${query}"</div>`;
  drop.classList.add("open");
}

function renderNotificationsBadge() {
  const badge = document.getElementById("notifBadgeCount");
  const count = appState.notifications.length;
  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
}

function toggleHeaderPopover(type, event) {
  event.stopPropagation();
  const pop = document.getElementById("headerPopover");
  if (pop.classList.contains("open") && pop.dataset.type === type) {
    pop.classList.remove("open");
    return;
  }
  pop.dataset.type = type;

  if (type === "approvals") {
    pop.innerHTML = `
      <div style="padding:10px 12px;background:#1c4e9c;color:#fff;font-weight:700;">Pending Approvals (${appState.notifications.length})</div>
      ${appState.notifications.length
        ? appState.notifications.map(n => `
            <div style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">
              <div style="font-weight:700;font-size:12px;">${n.title}</div>
              <div style="font-size:11px;color:#6b7280;margin:2px 0 6px;">${n.desc} • ${n.time}</div>
              <button class="btn btn-sm btn-primary" onclick="switchView('${n.title.includes("Expense") ? "expense" : "dashboard"}'); document.getElementById('headerPopover').classList.remove('open');">Review</button>
            </div>
          `).join("")
        : `<div style="padding:14px;color:#6b7280;text-align:center;">All approvals cleared!</div>`}
    `;
  } else if (type === "messages") {
    pop.innerHTML = `
      <div style="padding:10px 12px;background:#1c4e9c;color:#fff;font-weight:700;">Team Broadcasts</div>
      <div style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;"><strong>Admin:</strong> Monthly target review call at 05:30 PM today.</div>
      <div style="padding:10px 12px;font-size:12px;"><strong>Dispatch Team:</strong> Jaipur &amp; Ahmedabad vans departed on time.</div>
    `;
  } else {
    pop.innerHTML = `
      <div style="padding:10px 12px;background:#1c4e9c;color:#fff;font-weight:700;">System Alerts</div>
      <div style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;">⚠ 2 employees have not logged in yet (NLY-2).</div>
      <div style="padding:10px 12px;font-size:12px;">✅ Daily CRM backup synced successfully.</div>
    `;
  }
  pop.classList.add("open");
}

function handleLogout() {
  openModal("Session Locked (Demo Logout)", `
    <p>You have logged out of <strong>${appState.company.shortName}</strong>.</p>
    <p style="margin-top:8px;color:#64748b;">Click below to sign back in as Admin or reset demo data.</p>
  `, `
    <button class="btn btn-danger" onclick="localStorage.removeItem('${STORAGE_KEY}'); location.reload();">Reset Demo Data</button>
    <button class="btn btn-primary" onclick="closeModal(); showToast('Signed in as Admin!')">Sign Back In</button>
  `);
}

// ==================== GENERIC MODAL HELPERS ====================
function openModal(title, bodyHtml, footerHtml, wide = false) {
  document.getElementById("appModalTitle").textContent = title;
  document.getElementById("appModalBody").innerHTML = bodyHtml;
  document.getElementById("appModalFooter").innerHTML = footerHtml || "";
  document.getElementById("appModalCard").classList.toggle("wide", !!wide);
  document.getElementById("appModal").classList.add("open");
}

function closeModal() {
  document.getElementById("appModal").classList.remove("open");
}
