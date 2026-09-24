// ─── Constants ────────────────────────────────────────────────────────────────
const PROFILE_KEY = "gulfdocs_invoice_profile";
const COUNTRY_CURRENCY_MAP = {
  QA: "QAR",
  AE: "AED",
  SA: "SAR",
  BH: "BHD",
  KW: "KWD",
  OM: "OMR",
};

// ─── On Page Load ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Initialize date to today
  const dateInput = document.getElementById("inv-date");
  if (dateInput) {
    dateInput.valueAsDate = new Date();
  }
  // Initialize correct currency
  updateCurrency();
  // Load compliance index
  loadComplianceIndex();
  // Add first row
  addRow();
  // Restore saved profile from localStorage
  loadProfileFromStorage();
});

// ─── Currency ─────────────────────────────────────────────────────────────────
function updateCurrency() {
  const selector = document.getElementById("currency-select");
  if (!selector) return;
  const currency = selector.value;
  document.querySelectorAll(".currency-label").forEach((el) => {
    el.textContent = currency;
  });
  autoSaveProfile();
}

// ─── Compliance / Country Rules Loader ──────────────────────────────────────
let COMPLIANCE_INDEX = null;
let ACTIVE_RULES = null;

async function loadComplianceIndex() {
  try {
    const res = await fetch("/compliance/index.json");
    COMPLIANCE_INDEX = await res.json();
    const sel = document.getElementById("country-select");
    if (sel && COMPLIANCE_INDEX && COMPLIANCE_INDEX.countries) {
      sel.innerHTML = COMPLIANCE_INDEX.countries
        .map((c) => `<option value="${c.code}">${c.name}</option>`)
        .join("");
      const defaultCountry = sel.value || "QA";
      if (COUNTRY_CURRENCY_MAP[defaultCountry]) {
        const currencySelect = document.getElementById("currency-select");
        if (currencySelect) {
          currencySelect.value = COUNTRY_CURRENCY_MAP[defaultCountry];
          updateCurrency();
        }
      }
    }
  } catch (err) {
    console.warn("Could not load compliance index", err);
  }
}

async function onCountryChange() {
  const sel = document.getElementById("country-select");
  if (!sel) return;
  const code = sel.value;
  const countryKey = String(code || "QA").toUpperCase();

  const currencySelect = document.getElementById("currency-select");
  if (currencySelect && COUNTRY_CURRENCY_MAP[countryKey]) {
    currencySelect.value = COUNTRY_CURRENCY_MAP[countryKey];
    updateCurrency();
  }

  try {
    const rulesPath = `/compliance/${countryKey.toLowerCase()}/2026-09/rules.json`;
    const res = await fetch(rulesPath);
    ACTIVE_RULES = await res.json();
    console.info("Loaded rules for", countryKey, ACTIVE_RULES);
    await validateAndRender();
  } catch (err) {
    console.warn("Could not load rules for", countryKey, err);
    ACTIVE_RULES = null;
    await validateAndRender();
  }
}

function onDocTypeChange() {
  // placeholder for future doc-type UI changes
}

function onTransactionTypeChange() {
  // placeholder for txn-type UI changes
}

function validateBeforeExport() {
  // Use new structured validator and render panel. Returns boolean.
  return validateAndRender();
}

// ---------------- Structured Validation & UI ----------------
const FIELD_TO_SELECTOR = {
  "seller.name": "#profile-name",
  "seller.taxIdentity.taxId": "#profile-trn",
  "seller.address.raw": "#profile-address",
  "seller.contact.phone": "#profile-phone",
  "buyer.name": ".bento-card .editable",
  "buyer.taxIdentity.taxId": "#buyer-trn",
  "id": ".inv-meta .meta-grid .editable",
  "issueDate": "#inv-date",
  "items": "#items-tbody",
};

// ---------------- Exporter integration (client-side) ----------------
async function exportDocument(format = "json") {
  // Revalidate first
  const valid = await validateAndRender();
  if (!valid) {
    // Show panel (already visible) and block
    const panel = document.getElementById("validation-panel");
    if (panel) panel.scrollIntoView({ behavior: "smooth" });
    return { error: "validation_failed" };
  }

  const canonical = buildCanonicalInvoice();
  const country = document.getElementById("country-select")?.value || "generic";
  const docType =
    document.getElementById("doc-type-select")?.value || "invoice";

  // Call exporter router via dynamic import on client-side (router returns serialized content)
  try {
    const router = await import("./exporters/router.js");
    const rules = ACTIVE_RULES || null;
    const res = await router.routeExport(canonical, {
      country,
      docType,
      format,
      rules,
    });
    if (res.error) {
      if (res.error === "validation_failed") {
        // ensure panel visible
        document.getElementById("validation-panel").style.display = "block";
      }
      alert(`Export failed: ${res.message || res.error}`);
      return res;
    }

    // Handle returned data for client download
    if (res.format === "json") {
      const blob = new Blob([res.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${canonical.invoice_number || "invoice"}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return { ok: true };
    }
    if (res.format === "xml") {
      const blob = new Blob([res.data], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${canonical.invoice_number || "invoice"}.xml`;
      a.click();
      URL.revokeObjectURL(url);
      return { ok: true };
    }

    alert("Export succeeded");
    return res;
  } catch (err) {
    alert("Export failed: " + err.message);
    return { error: "export_exception", message: err.message };
  }
}

async function validateAndRender() {
  if (!ACTIVE_RULES) {
    // try to load for selected country
    await onCountryChange();
  }
  const result = performValidation();
  renderValidationPanel(result);
  return result.valid;
}

function performValidation() {
  const payload = buildCanonicalInvoice();
  const errors = [];
  const warnings = [];

  // Required fields
  (ACTIVE_RULES?.required_fields || []).forEach((path) => {
    const parts = path.split(".");
    let cur = payload;
    let ok = true;
    for (const p of parts) {
      if (
        cur &&
        Object.prototype.hasOwnProperty.call(cur, p) &&
        cur[p] !== "" &&
        cur[p] != null
      ) {
        cur = cur[p];
      } else {
        ok = false;
        break;
      }
    }
    if (!ok) {
      errors.push({
        field: path,
        code: "MISSING_FIELD",
        message: `${path} is required for ${ACTIVE_RULES?.country || "selected jurisdiction"}`,
        category: categorizeField(path),
      });
    }
  });

  // Example lightweight warning: no line items or grand_total zero
  if (!payload.line_items || payload.line_items.length === 0) {
    warnings.push({
      field: "line_items",
      code: "NO_ITEMS",
      message: "No invoice line items added.",
      category: "Document",
    });
  }
  if ((payload.grand_total || 0) <= 0) {
    warnings.push({
      field: "grand_total",
      code: "ZERO_TOTAL",
      message: "Invoice total is zero.",
      category: "Document",
    });
  }

  return { valid: errors.length === 0, errors, warnings };
}

function categorizeField(path) {
  if (path.startsWith("seller.")) return "Seller";
  if (path.startsWith("buyer.")) return "Buyer";
  if (path === "invoice_number" || path === "issue_date") return "Document";
  if (path.startsWith("tax") || path.includes("tax")) return "Tax";
  if (path.startsWith("payment") || path.includes("payment")) return "Payment";
  return "Country Rules";
}

let _validateDebounce = null;
function attachValidationListeners() {
  // contenteditable fields
  document
    .querySelectorAll(".editable, .editable-input, input, select")
    .forEach((el) => {
      el.addEventListener("input", () => {
        clearTimeout(_validateDebounce);
        _validateDebounce = setTimeout(() => validateAndRender(), 300);
      });
    });
  // item row add/remove needs to revalidate
  const tbody = document.getElementById("items-tbody");
  if (tbody) {
    tbody.addEventListener("input", () => {
      clearTimeout(_validateDebounce);
      _validateDebounce = setTimeout(() => validateAndRender(), 300);
    });
  }
  // country selector
  const countrySel = document.getElementById("country-select");
  if (countrySel)
    countrySel.addEventListener("change", () => validateAndRender());
}

function renderValidationPanel(result) {
  const panel = document.getElementById("validation-panel");
  const list = document.getElementById("validation-list");
  const status = document.getElementById("validation-status");
  const errBtn = document.getElementById("err-count");
  const warnBtn = document.getElementById("warn-count");

  if (!panel || !list || !status) return;
  panel.style.display = "block";

  // Overall status
  if (result.valid) {
    status.textContent = "Ready to export";
    status.style.color = "#059669";
  } else if (result.errors && result.errors.length) {
    status.textContent = "Invalid";
    status.style.color = "#b91c1c";
  } else {
    status.textContent = "Needs attention";
    status.style.color = "#92400e";
  }

  // Summary counts
  if (result.errors.length) {
    errBtn.style.display = "inline-block";
    errBtn.textContent = `${result.errors.length} error${result.errors.length > 1 ? "s" : ""}`;
    errBtn.className = "validation-pill";
  } else {
    errBtn.style.display = "none";
  }
  if (result.warnings.length) {
    warnBtn.style.display = "inline-block";
    warnBtn.textContent = `${result.warnings.length} warning${result.warnings.length > 1 ? "s" : ""}`;
    warnBtn.className = "validation-pill warn";
  } else {
    warnBtn.style.display = "none";
  }

  // Group messages by category
  list.innerHTML = "";
  const groups = {};
  [...result.errors, ...result.warnings].forEach((m) => {
    const cat = m.category || "Country Rules";
    groups[cat] = groups[cat] || [];
    groups[cat].push(m);
  });

  Object.keys(groups).forEach((cat) => {
    const header = document.createElement("div");
    header.style.fontWeight = "700";
    header.style.marginTop = "8px";
    header.textContent = cat;
    list.appendChild(header);

    groups[cat].forEach((m) => {
      const item = document.createElement("div");
      item.className =
        "validation-item " +
        (m.code && m.code.startsWith("MISSING") ? "error" : "warn");
      item.tabIndex = 0;
      item.innerHTML = `<div style="font-weight:700">${m.message}</div><div style="font-size:12px;color:#475569">${m.field} • ${m.code}</div>`;
      item.addEventListener("click", () => {
        focusField(m.field);
      });
      list.appendChild(item);
    });
  });
  // clear previous highlights
  clearHighlights();
}

function focusField(path) {
  const sel = FIELD_TO_SELECTOR[path];
  if (!sel) {
    // unknown field — focus top of page
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.querySelector(sel);
  if (!el) return;
  el.focus && el.focus();
  el.classList.add("validation-field-highlight");
  setTimeout(() => el.classList.remove("validation-field-highlight"), 2500);
}

function clearHighlights() {
  document
    .querySelectorAll(".validation-field-highlight")
    .forEach((el) => el.classList.remove("validation-field-highlight"));
}

function buildCanonicalInvoice() {
  const seller = {
    name: document.getElementById("profile-name")?.textContent?.trim() || "",
    registrationNumber: "",
    taxIdentity: { taxId: document.getElementById("profile-trn")?.textContent?.trim() || "", taxIdType: "VAT" },
    address: { raw: document.getElementById("profile-address")?.textContent?.trim() || "" },
    contact: {
      phone: document.getElementById("profile-phone")?.textContent?.trim() || "",
      email: document.getElementById("profile-email")?.textContent?.trim() || ""
    },
  };

  const buyerEl = document.querySelector(".bento-card .editable");
  const buyerPhoneEl = document.querySelector(".bento-card .info-row:nth-child(2) .editable");
  const buyerEmailEl = document.querySelector(".bento-card .info-row:nth-child(3) .editable");
  const buyerAddressEl = document.querySelector(".bento-card .info-row:nth-child(4) .editable");
  const buyerTrnEl = document.querySelector(".bento-card .info-row:nth-child(5) .editable");

  const buyer = {
    name: buyerEl ? buyerEl.textContent.trim() : "",
    taxIdentity: { taxId: buyerTrnEl ? buyerTrnEl.textContent.trim() : "", taxIdType: "VAT" },
    address: { raw: buyerAddressEl ? buyerAddressEl.textContent.trim() : "" },
    contact: {
      phone: buyerPhoneEl ? buyerPhoneEl.textContent.trim() : "",
      email: buyerEmailEl ? buyerEmailEl.textContent.trim() : ""
    }
  };

  const items = [];
  document.querySelectorAll("#items-tbody tr").forEach((row, idx) => {
    const desc = row.querySelector("td div.editable")?.textContent?.trim() || "";
    const code = row.querySelector("td:nth-child(2) div.editable")?.textContent?.trim() || "";
    const qty = parseFloat(row.querySelector(".qty-input").value) || 0;
    const price = parseFloat(row.querySelector(".price-input").value) || 0;
    const itemTotal = qty * price;

    items.push({
      id: String(idx + 1),
      description: desc,
      code: code,
      quantity: qty,
      unit: "EA",
      unitPrice: price,
      discount: { amount: 0 },
      tax: { category: "S", rate: 0, amount: 0, taxableAmount: itemTotal },
      netAmount: itemTotal,
      totalAmount: itemTotal
    });
  });

  const currencyCode = document.getElementById("currency-select")?.value || "QAR";
  const subtotal = parseFloat(document.getElementById("sum-subtotal")?.textContent) || 0;
  const vatAmount = parseFloat(document.getElementById("sum-vat")?.textContent) || 0;
  const discountInput = document.getElementById("in-discount");
  const discountAmt = discountInput ? (parseFloat(discountInput.value) || 0) : 0;
  const grandTotal = parseFloat(document.getElementById("sum-total")?.textContent) || 0;

  return {
    id: document.querySelector(".inv-meta .meta-grid .editable")?.textContent?.trim() || "",
    documentType: "invoice",
    country: document.getElementById("country-select")?.value || "QA",
    language: "en",
    currency: { code: currencyCode, exchangeRate: 1 },
    issueDate: document.getElementById("inv-date")?.value || "",
    status: "",
    version: "1",
    dueDate: "",
    validUntil: "",
    seller,
    buyer,
    items,
    taxes: [{ category: "S", amount: vatAmount, taxableAmount: subtotal }],
    total: {
      subtotal: subtotal,
      discount: discountAmt,
      taxableAmount: subtotal - discountAmt,
      tax: vatAmount,
      grandTotal: grandTotal,
      amountPaid: 0,
      amountDue: grandTotal
    },
    payment: {
      bankAccount: {},
      terms: "",
      method: document.querySelector(".bento-card:nth-child(2) .info-row:nth-child(3) .editable")?.textContent?.trim() || "",
      reference: document.querySelector(".bento-card:nth-child(2) .info-row:nth-child(4) .editable")?.textContent?.trim() || ""
    },
    references: [],
    notes: document.getElementById("profile-footer")?.textContent?.trim() || ""
  };
}

// ─── Line Items ───────────────────────────────────────────────────────────────
let itemCounter = 0;

function addRow() {
  itemCounter++;
  const tbody = document.getElementById("items-tbody");
  const tr = document.createElement("tr");
  tr.id = `row-${itemCounter}`;

  tr.innerHTML = `
        <td><div class="editable" contenteditable="true" placeholder="Item description..." style="width: 100%; font-weight: 600;"></div></td>
        <td><div class="editable" contenteditable="true" placeholder="SKU-..." style="width: 100%;"></div></td>
        <td><input type="number" class="editable-input qty-input" value="1" min="1" oninput="calculateTotals()"></td>
        <td><input type="number" class="editable-input price-input" placeholder="0.00" oninput="calculateTotals()"></td>
        <td><div class="val row-total" style="text-align: right; font-weight: 600;">0.00</div></td>
        <td class="no-print" style="text-align: center;">
            <button class="remove-btn" onclick="removeRow('${tr.id}')" title="Remove row">×</button>
        </td>
    `;
  tbody.appendChild(tr);

  // Focus the description of the new row
  tr.querySelector(".editable").focus();

  calculateTotals();
}

function removeRow(rowId) {
  const tr = document.getElementById(rowId);
  if (tr) {
    tr.remove();
    calculateTotals();
  }
}

function calculateTotals() {
  let subtotal = 0;
  const tbody = document.getElementById("items-tbody");
  const rows = tbody.querySelectorAll("tr");

  rows.forEach((row) => {
    const qty = parseFloat(row.querySelector(".qty-input").value) || 0;
    const price = parseFloat(row.querySelector(".price-input").value) || 0;
    const total = qty * price;
    row.querySelector(".row-total").textContent = total.toFixed(2);
    subtotal += total;
  });

  // Variable VAT Calculation
  const vatRateInput = document.getElementById("in-vat-rate");
  const vatRate = vatRateInput
    ? (parseFloat(vatRateInput.value) || 0) / 100
    : 0.05;
  const vatAmount = subtotal * vatRate;

  const discountInput = document.getElementById("in-discount");
  let discount = 0;
  if (discountInput && discountInput.value) {
    discount = parseFloat(discountInput.value) || 0;
  }

  const grandTotal = subtotal + vatAmount - discount;

  document.getElementById("sum-subtotal").textContent = subtotal.toFixed(2);
  document.getElementById("sum-vat").textContent = vatAmount.toFixed(2);
  document.getElementById("sum-total").textContent = Math.max(
    0,
    grandTotal,
  ).toFixed(2);
}

// ─── Logo Upload ──────────────────────────────────────────────────────────────
function loadLogo(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    _applyLogo(e.target.result);
    autoSaveProfile();
  };
  reader.readAsDataURL(file);
}

function _applyLogo(dataUrl) {
  const logoEl = document.getElementById("brand-logo");
  const placeholder = document.getElementById("logo-placeholder");
  if (dataUrl && dataUrl.startsWith("data:")) {
    logoEl.src = dataUrl;
    logoEl.style.display = "block";
    if (placeholder) placeholder.style.display = "none";
  } else {
    logoEl.src = "";
    logoEl.style.display = "none";
    if (placeholder) placeholder.style.display = "flex";
  }
}

// ─── localStorage Profile Persistence ────────────────────────────────────────
/**
 * Read all profile fields and save them to localStorage immediately.
 * Called manually via the "Save Profile" button.
 */
function saveProfileToStorage() {
  const profile = _collectProfile();
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    _showSaveToast();
  } catch (e) {
    // localStorage full (large base64 logo) — warn gracefully
    alert(
      "Could not save profile: storage may be full. Try exporting as JSON instead.",
    );
  }
}

/**
 * Debounced auto-save — called on every keystroke in profile fields.
 */
let _autoSaveTimer = null;
function autoSaveProfile() {
  clearTimeout(_autoSaveTimer);
  _autoSaveTimer = setTimeout(() => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(_collectProfile()));
    } catch (e) {
      /* storage full — silent fail on auto-save */
    }
  }, 800);
}

/**
 * Restore saved profile on page load.
 */
function loadProfileFromStorage() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return;
    const profile = JSON.parse(raw);
    _applyProfile(profile);
  } catch (e) {
    /* corrupt data — ignore */
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function _collectProfile() {
  return {
    name: document.getElementById("profile-name")?.textContent?.trim() || "",
    trn: document.getElementById("profile-trn")?.textContent?.trim() || "",
    address: document.getElementById("profile-address")?.textContent?.trim() || "",
    phone: document.getElementById("profile-phone")?.textContent?.trim() || "",
    email: document.getElementById("profile-email")?.textContent?.trim() || "",
    footer: document.getElementById("profile-footer")?.textContent?.trim() || "",
    logo: document.getElementById("brand-logo")?.getAttribute("src") || "",
    currency: document.getElementById("currency-select")?.value || "QAR",
    theme:
      typeof ThemeManager !== "undefined"
        ? ThemeManager.getThemeObject()
        : null,
  };
}

function _applyProfile(profile) {
  // Always set the element's content — even empty strings clear stale data.
  // Use textContent (not innerText) for reliable programmatic updates on
  // contenteditable divs across all browsers.
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el == null) return;
    el.textContent = val != null ? val : "";
  };
  set("profile-name", profile.name ?? "");
  set("profile-trn", profile.trn ?? "");
  set("profile-address", profile.address ?? "");
  set("profile-phone", profile.phone ?? "");
  set("profile-email", profile.email ?? "");
  set("profile-footer", profile.footer ?? "");

  if (profile.currency) {
    const sel = document.getElementById("currency-select");
    if (sel) {
      sel.value = profile.currency;
      updateCurrency();
    }
  }
  // Logo: accept both data: URLs (from upload) and empty string (no logo)
  if (typeof profile.logo === "string") {
    _applyLogo(profile.logo);
  }
  if (profile.theme && typeof ThemeManager !== "undefined") {
    ThemeManager.applyThemeObject(profile.theme);
  }
}

function _showSaveToast() {
  let toast = document.getElementById("save-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "save-toast";
    toast.style.cssText = `
            position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(80px);
            background: #1e293b; color: #fff; font-family: inherit; font-size: 13px; font-weight: 600;
            padding: 10px 20px; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.18);
            display: flex; align-items: center; gap: 8px; transition: transform 0.3s ease; z-index: 9999;
        `;
    document.body.appendChild(toast);
  }
  toast.innerHTML = "✅ Profile saved to browser";
  // Slide in
  setTimeout(() => {
    toast.style.transform = "translateX(-50%) translateY(0)";
  }, 10);
  // Slide out after 2.5 s
  setTimeout(() => {
    toast.style.transform = "translateX(-50%) translateY(80px)";
  }, 2600);
}

// ─── JSON Export / Import ─────────────────────────────────────────────────────
function exportBusinessProfile() {
  const profile = _collectProfile();
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(profile, null, 2));
  const a = document.createElement("a");
  a.href = dataStr;
  a.download = "gulfdocs_profile.json";
  a.click();
}

function importBusinessProfile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const profile = JSON.parse(e.target.result);

      // Always apply the standard profile fields on top
      _applyProfile(profile);

      // Also persist the imported profile
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      _showSaveToast();
    } catch (err) {
      console.error(err);
      alert("Oops! This doesn't look like a valid GulfDocs profile file.");
    }
  };
  reader.readAsText(file);
  // Reset input so the same file can be re-imported
  event.target.value = "";
}
