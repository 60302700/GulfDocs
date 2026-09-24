document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("po-date");
  if (dateInput) dateInput.valueAsDate = new Date();
  const deliveryInput = document.getElementById("po-delivery");
  if (deliveryInput) {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    deliveryInput.valueAsDate = d;
  }
  updateCurrency();
  addRow();
});

function updateCurrency() {
  const selector = document.getElementById("currency-select");
  if (!selector) return;
  document.querySelectorAll(".currency-label").forEach((el) => {
    el.textContent = selector.value;
  });
}

let itemCounter = 0;

function addRow() {
  itemCounter++;
  const tbody = document.getElementById("items-tbody");
  const tr = document.createElement("tr");
  tr.id = `row-${itemCounter}`;
  tr.innerHTML = `
        <td style="text-align:center; font-weight:700; color: var(--text-secondary);">${itemCounter}</td>
        <td>
            <div class="editable" contenteditable="true" placeholder="Item Name" style="width: 100%; font-weight: 600;"></div>
            <div class="editable optional" contenteditable="true" placeholder="Specification details..." style="width: 100%; font-size: 12px; color: var(--text-secondary); margin-top: 4px;"></div>
        </td>
        <td><div class="editable" contenteditable="true" placeholder="SKU-..." style="width: 100%; font-size: 12px; font-family: monospace; color: var(--text-secondary);"></div></td>
        <td><input type="number" class="editable-input qty-input" value="1" min="1" oninput="calculateTotals()"></td>
        <td><input type="number" class="editable-input price-input" placeholder="0.00" oninput="calculateTotals()"></td>
        <td><input type="number" class="editable-input vat-input" value="5" min="0" max="100" style="width: 50px; text-align: center;" oninput="calculateTotals()"></td>
        <td><div class="val row-total" style="text-align: right; font-weight: 600;">0.00</div></td>
        <td class="no-print" style="text-align: center;">
            <button class="remove-btn" onclick="removeRow('${tr.id}')" title="Remove row">×</button>
        </td>
    `;
  tbody.appendChild(tr);
  tr.querySelector(".editable").focus();
  calculateTotals();
}

function removeRow(rowId) {
  const tr = document.getElementById(rowId);
  if (tr) {
    tr.remove();
    reindexRows();
    calculateTotals();
  }
}

function reindexRows() {
  const rows = document.querySelectorAll("#items-tbody tr");
  rows.forEach((row, idx) => {
    row.querySelector("td").textContent = idx + 1;
  });
}

function calculateTotals() {
  let subtotal = 0;
  let totalVat = 0;
  document.querySelectorAll("#items-tbody tr").forEach((row) => {
    const qty = parseFloat(row.querySelector(".qty-input").value) || 0;
    const price = parseFloat(row.querySelector(".price-input").value) || 0;
    const vatRate =
      (parseFloat(row.querySelector(".vat-input").value) || 0) / 100;
    const lineTotal = qty * price;
    const lineVat = lineTotal * vatRate;
    row.querySelector(".row-total").textContent = (lineTotal + lineVat).toFixed(
      2,
    );
    subtotal += lineTotal;
    totalVat += lineVat;
  });
  const freight = parseFloat(document.getElementById("in-freight").value) || 0;
  const grandTotal = subtotal + totalVat + freight;
  document.getElementById("sum-subtotal").textContent = subtotal.toFixed(2);
  document.getElementById("sum-vat").textContent = totalVat.toFixed(2);
  document.getElementById("sum-total").textContent = Math.max(
    0,
    grandTotal,
  ).toFixed(2);
}

function loadLogo(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const logoEl = document.getElementById("brand-logo");
      logoEl.src = e.target.result;
      logoEl.style.display = "block";
      document.getElementById("logo-placeholder").style.display = "none";
      if (p.theme && typeof ThemeManager !== "undefined")
        ThemeManager.applyThemeObject(p.theme);
    };
    reader.readAsDataURL(file);
  }
}

function exportBusinessProfile() {
  const profile = {
    name: document.getElementById("profile-name")?.textContent || "",
    trn: document.getElementById("profile-trn")?.textContent || "",
    footer: document.getElementById("profile-footer")?.textContent || "",
    logo: document.getElementById("brand-logo")?.src || "",
    currency: document.getElementById("currency-select")?.value || "QAR",
    theme:
      typeof ThemeManager !== "undefined"
        ? ThemeManager.getThemeObject()
        : null,
  };
  const a = document.createElement("a");
  a.href =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(profile, null, 2));
  a.download = "business_profile.json";
  a.click();
}

function importBusinessProfile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const p = JSON.parse(e.target.result);

      // Apply standard profile fields
      if (p.name) document.getElementById("profile-name").textContent = p.name;
      if (p.trn) document.getElementById("profile-trn").textContent = p.trn;
      if (p.footer)
        document.getElementById("profile-footer").textContent = p.footer;
      if (p.currency) {
        document.getElementById("currency-select").value = p.currency;
        updateCurrency();
      }
      if (p.logo && p.logo.startsWith("data:")) {
        document.getElementById("brand-logo").src = p.logo;
        document.getElementById("brand-logo").style.display = "block";
        document.getElementById("logo-placeholder").style.display = "none";
      }
      if (p.theme && typeof ThemeManager !== "undefined")
        ThemeManager.applyThemeObject(p.theme);
    } catch (err) {
      alert("Invalid profile file.");
    }
  };
  reader.readAsText(file);
}


function buildCanonicalPurchaseOrder() {
  const buyer = {
    name: document.getElementById("profile-name")?.textContent?.trim() || "",
    registrationNumber: "",
    taxIdentity: { taxId: document.getElementById("profile-trn")?.textContent?.trim() || "", taxIdType: "VAT" },
    address: { raw: document.getElementById("profile-address")?.textContent?.trim() || "" },
    contact: { 
      phone: document.getElementById("profile-phone")?.textContent?.trim() || "",
      email: document.getElementById("profile-email")?.textContent?.trim() || ""
    }
  };

  const supplierEl = document.querySelector(".bento-card .editable");
  const supplierPhoneEl = document.querySelector(".bento-card .info-row:nth-child(2) .editable");
  const supplierEmailEl = document.querySelector(".bento-card .info-row:nth-child(3) .editable");
  
  const supplier = {
    name: supplierEl ? supplierEl.textContent.trim() : "",
    taxIdentity: { taxId: "", taxIdType: "VAT" },
    address: { raw: "" },
    contact: {
      phone: supplierPhoneEl ? supplierPhoneEl.textContent.trim() : "",
      email: supplierEmailEl ? supplierEmailEl.textContent.trim() : ""
    }
  };

  const items = [];
  document.querySelectorAll("#items-tbody tr").forEach((row, idx) => {
    const desc = row.querySelector("td div.editable")?.textContent?.trim() || "";
    // item code in PO? checking generic
    const codeEl = row.querySelector("td:nth-child(2) div.editable");
    const code = codeEl ? codeEl.textContent.trim() : "";
    const qtyEl = row.querySelector(".qty-input");
    const qty = qtyEl ? parseFloat(qtyEl.value) || 0 : 0;
    const priceEl = row.querySelector(".price-input");
    const price = priceEl ? parseFloat(priceEl.value) || 0 : 0;
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
    documentType: "purchase_order",
    country: document.getElementById("country-select")?.value || "QA",
    language: "en",
    currency: { code: currencyCode, exchangeRate: 1 },
    issueDate: document.getElementById("po-date")?.value || "",
    requiredDeliveryDate: document.getElementById("po-req-date")?.value || "",
    status: "",
    version: "1",
    buyer,
    supplier,
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
    shipping: {
      amount: parseFloat(document.getElementById("sum-freight")?.textContent) || 0
    },
    payment: {
      terms: document.querySelector(".bento-card:nth-child(2) .info-row:nth-child(1) .editable")?.textContent?.trim() || ""
    },
    deliveryTerms: document.querySelector(".bento-card:nth-child(2) .info-row:nth-child(2) .editable")?.textContent?.trim() || "",
    references: [],
    notes: document.getElementById("profile-footer")?.textContent?.trim() || ""
  };
}
