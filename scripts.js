document.addEventListener('DOMContentLoaded', () => {
    // Initialize date to today
    const dateInput = document.getElementById('inv-date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
    // Initialize correct currency
    updateCurrency();
    // Add first row
    addRow();
});

function updateCurrency() {
    const selector = document.getElementById('currency-select');
    if (!selector) return;
    const currency = selector.value;
    document.querySelectorAll('.currency-label').forEach(el => {
        el.textContent = currency;
    });
}

let itemCounter = 0;

function addRow() {
    itemCounter++;
    const tbody = document.getElementById('items-tbody');
    const tr = document.createElement('tr');
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
    tr.querySelector('.editable').focus();

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
    const tbody = document.getElementById('items-tbody');
    const rows = tbody.querySelectorAll('tr');

    rows.forEach(row => {
        const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
        const price = parseFloat(row.querySelector('.price-input').value) || 0;
        const total = qty * price;
        row.querySelector('.row-total').textContent = total.toFixed(2);
        subtotal += total;
    });

    // Variable VAT Calculation
    const vatRateInput = document.getElementById('in-vat-rate');
    const vatRate = vatRateInput ? (parseFloat(vatRateInput.value) || 0) / 100 : 0.05;
    const vatAmount = subtotal * vatRate;

    const discountInput = document.getElementById('in-discount');
    let discount = 0;
    if (discountInput && discountInput.value) {
        discount = parseFloat(discountInput.value) || 0;
    }

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
            document.getElementById('logo-placeholder').style.display = 'none';
        }
        reader.readAsDataURL(file);
    }
}

// JSON Profile Export / Import functionality
function exportBusinessProfile() {
    const profile = {
        name: document.getElementById('profile-name')?.innerText || '',
        trn: document.getElementById('profile-trn')?.innerText || '',
        footer: document.getElementById('profile-footer')?.innerText || '',
        logo: document.getElementById('brand-logo')?.src || '',
        currency: document.getElementById('currency-select')?.value || 'QAR',
        theme: typeof ThemeManager !== 'undefined' ? ThemeManager.getThemeObject() : null
    };

    // Create Blob and trigger download
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "business_profile.json");
    dlAnchorElem.click();
}

function importBusinessProfile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const profile = JSON.parse(e.target.result);
            if (profile.name) {
                document.getElementById('profile-name').innerText = profile.name;
            }
            if (profile.trn) {
                document.getElementById('profile-trn').innerText = profile.trn;
            }
            if (profile.footer) {
                document.getElementById('profile-footer').innerText = profile.footer;
            }
            if (profile.currency) {
                document.getElementById('currency-select').value = profile.currency;
                updateCurrency();
            }
            if (profile.logo && profile.logo.startsWith('data:')) {
                const logoEl = document.getElementById('brand-logo');
                logoEl.src = profile.logo;
                logoEl.style.display = 'block';
                document.getElementById('logo-placeholder').style.display = 'none';
            }
            if (profile.theme && typeof ThemeManager !== 'undefined') {
                ThemeManager.applyThemeObject(profile.theme);
            }
        } catch (err) {
            alert("Oops! This doesn't look like a valid profile file.");
        }
    };
    reader.readAsText(file);
}
