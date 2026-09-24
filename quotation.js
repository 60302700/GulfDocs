document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('qt-date');
    if (dateInput) dateInput.valueAsDate = new Date();
    const expiryInput = document.getElementById('qt-expiry');
    if (expiryInput) { const d = new Date(); d.setDate(d.getDate() + 30); expiryInput.valueAsDate = d; }
    updateCurrency();
    addRow();
});

function updateCurrency() {
    const selector = document.getElementById('currency-select');
    if (!selector) return;
    document.querySelectorAll('.currency-label').forEach(el => { el.textContent = selector.value; });
}

let itemCounter = 0;

function addRow() {
    itemCounter++;
    const tbody = document.getElementById('items-tbody');
    const tr = document.createElement('tr');
    tr.id = `row-${itemCounter}`;
    tr.innerHTML = `
        <td>
            <div class="editable" contenteditable="true" placeholder="Service/Item Title" style="width: 100%; font-weight: 600;"></div>
            <div class="editable optional" contenteditable="true" placeholder="Detailed description..." style="width: 100%; font-size: 12px; color: var(--text-secondary); margin-top: 4px;"></div>
        </td>
        <td><input type="number" class="editable-input qty-input" value="1" min="1" oninput="calculateTotals()"></td>
        <td><input type="number" class="editable-input price-input" placeholder="0.00" oninput="calculateTotals()"></td>
        <td><div class="val row-total" style="text-align: right; font-weight: 600;">0.00</div></td>
        <td class="no-print" style="text-align: center;">
            <button class="remove-btn" onclick="removeRow('${tr.id}')" title="Remove row">×</button>
        </td>
    `;
    tbody.appendChild(tr);
    tr.querySelector('.editable').focus();
    calculateTotals();
}

function removeRow(rowId) {
    const tr = document.getElementById(rowId);
    if (tr) { tr.remove(); calculateTotals(); }
}

function calculateTotals() {
    let subtotal = 0;
    document.querySelectorAll('#items-tbody tr').forEach(row => {
        const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
        const price = parseFloat(row.querySelector('.price-input').value) || 0;
        const total = qty * price;
        row.querySelector('.row-total').textContent = total.toFixed(2);
        subtotal += total;
    });
    const vatRate = (parseFloat(document.getElementById('in-vat-rate').value) || 0) / 100;
    const vatAmount = subtotal * vatRate;
    const discount = parseFloat(document.getElementById('in-discount').value) || 0;
    const grandTotal = (subtotal + vatAmount) - discount;
    document.getElementById('sum-subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('sum-vat').textContent = vatAmount.toFixed(2);
    document.getElementById('sum-total').textContent = Math.max(0, grandTotal).toFixed(2);
}

function loadLogo(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const logoEl = document.getElementById('brand-logo');
            logoEl.src = e.target.result;
            logoEl.style.display = 'block';
            logoEl.style.filter = 'none';
            document.getElementById('logo-placeholder').style.display = 'none';
            if (p.theme && typeof ThemeManager !== 'undefined') ThemeManager.applyThemeObject(p.theme);
        }
        reader.readAsDataURL(file);
    }
}

function exportBusinessProfile() {
    const profile = {
        name: document.getElementById('profile-name')?.textContent || '',
        trn: document.getElementById('profile-trn')?.textContent || '',
        footer: document.getElementById('profile-footer')?.textContent || '',
        logo: document.getElementById('brand-logo')?.src || '',
        currency: document.getElementById('currency-select')?.value || 'QAR', theme: typeof ThemeManager !== 'undefined' ? ThemeManager.getThemeObject() : null
    };
    const a = document.createElement('a');
    a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
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
            if (p.name) document.getElementById('profile-name').textContent = p.name;
            if (p.trn) document.getElementById('profile-trn').textContent = p.trn;
            if (p.footer) document.getElementById('profile-footer').textContent = p.footer;
            if (p.currency) { document.getElementById('currency-select').value = p.currency; updateCurrency(); }
            if (p.logo && p.logo.startsWith('data:')) {
                const el = document.getElementById('brand-logo');
                el.src = p.logo; el.style.display = 'block'; el.style.filter = 'none';
                document.getElementById('logo-placeholder').style.display = 'none';
            }
            if (p.theme && typeof ThemeManager !== 'undefined') ThemeManager.applyThemeObject(p.theme);
        } catch (err) { alert("Invalid profile file."); }
    };
    reader.readAsText(file);
}


function buildCanonicalQuotation() {
  const seller = {
    name: document.getElementById("profile-name")?.textContent?.trim() || "",
    registrationNumber: "",
    taxIdentity: { taxId: document.getElementById("profile-trn")?.textContent?.trim() || "", taxIdType: "VAT" },
    address: { raw: document.getElementById("profile-address")?.textContent?.trim() || "" },
    contact: { 
      phone: document.getElementById("profile-phone")?.textContent?.trim() || "",
      email: document.getElementById("profile-email")?.textContent?.trim() || ""
    }
  };

  const buyerEl = document.querySelector(".bento-card .editable");
  const buyerPhoneEl = document.querySelector(".bento-card .info-row:nth-child(2) .editable");
  const buyerEmailEl = document.querySelector(".bento-card .info-row:nth-child(3) .editable");
  
  const buyer = {
    name: buyerEl ? buyerEl.textContent.trim() : "",
    taxIdentity: { taxId: "", taxIdType: "VAT" },
    address: { raw: "" },
    contact: {
      phone: buyerPhoneEl ? buyerPhoneEl.textContent.trim() : "",
      email: buyerEmailEl ? buyerEmailEl.textContent.trim() : ""
    }
  };

  const items = [];
  document.querySelectorAll("#items-tbody tr").forEach((row, idx) => {
    const desc = row.querySelector("td div.editable")?.textContent?.trim() || "";
    // Quotations in the UI have title + detailed desc
    const desc2 = row.querySelector("td div.optional")?.textContent?.trim() || "";
    const qty = parseFloat(row.querySelector(".qty-input").value) || 0;
    const price = parseFloat(row.querySelector(".price-input").value) || 0;
    const itemTotal = qty * price;
    
    items.push({
      id: String(idx + 1),
      description: desc + (desc2 ? " - " + desc2 : ""),
      code: "",
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
    documentType: "quotation",
    country: document.getElementById("country-select")?.value || "QA",
    language: "en",
    currency: { code: currencyCode, exchangeRate: 1 },
    issueDate: document.getElementById("qt-date")?.value || "",
    validUntil: document.getElementById("qt-expiry")?.value || "",
    status: "",
    version: "1",
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
      terms: document.querySelector(".bento-card:nth-child(2) .info-row:nth-child(1) .editable")?.textContent?.trim() || "", 
      method: ""
    },
    references: [],
    notes: document.getElementById("profile-footer")?.textContent?.trim() || ""
  };
}
