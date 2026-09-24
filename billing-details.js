document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("bill-date");
  if (dateInput) dateInput.valueAsDate = new Date();
  const dueInput = document.getElementById("bill-due");
  if (dueInput) {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    dueInput.valueAsDate = d;
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
        <td><div class="editable" contenteditable="true" placeholder="Service or product name..." style="width: 100%; font-weight: 600;"></div></td>
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
    calculateTotals();
  }
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
  const grandTotal = subtotal + totalVat;
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


function buildCanonicalBillingDetails() {
  const beneficiary = {
    name: document.getElementById("profile-name")?.textContent?.trim() || "",
    registrationNumber: "",
    taxIdentity: { taxId: document.getElementById("profile-trn")?.textContent?.trim() || "", taxIdType: "VAT" },
    address: { raw: document.getElementById("profile-address")?.textContent?.trim() || "" },
    contact: { 
      phone: document.getElementById("profile-phone")?.textContent?.trim() || "",
      email: document.getElementById("profile-email")?.textContent?.trim() || ""
    }
  };

  const bdBank = document.getElementById('bd-bank')?.textContent?.trim() || '';
  const bdIban = document.getElementById('bd-iban')?.textContent?.trim() || '';
  const bdSwift = document.getElementById('bd-swift')?.textContent?.trim() || '';
  const bdAcc = document.getElementById('bd-account')?.textContent?.trim() || '';

  const bankAccount = {
    bankName: bdBank,
    branch: "",
    accountName: beneficiary.name,
    accountNumber: bdAcc,
    iban: bdIban,
    swiftBic: bdSwift
  };

  const currencyCode = document.getElementById("currency-select")?.value || "QAR";
  const amount = parseFloat(document.getElementById("sum-total")?.textContent) || 0;

  return {
    id: document.querySelector(".inv-meta .meta-grid .editable")?.textContent?.trim() || "",
    documentType: "billing_details",
    country: document.getElementById("country-select")?.value || "QA",
    language: "en",
    currency: { code: currencyCode, exchangeRate: 1 },
    issueDate: document.getElementById("bd-date")?.value || "",
    status: "",
    version: "1",
    beneficiary,
    bankAccount,
    amount,
    paymentReference: document.querySelector(".bento-card:nth-child(2) .info-row:nth-child(3) .editable")?.textContent?.trim() || "",
    dueDate: document.getElementById("bd-due-date")?.value || "",
    paymentSchedule: [],
    payment: {
      bankAccount,
      method: "Bank Transfer"
    },
    items: [],
    taxes: [],
    total: { grandTotal: amount },
    references: [],
    notes: document.getElementById("profile-footer")?.textContent?.trim() || ""
  };
}
