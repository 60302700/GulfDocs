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
        name: document.getElementById('profile-name')?.innerText || '',
        trn: document.getElementById('profile-trn')?.innerText || '',
        footer: document.getElementById('profile-footer')?.innerText || '',
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
            if (p.name) document.getElementById('profile-name').innerText = p.name;
            if (p.trn) document.getElementById('profile-trn').innerText = p.trn;
            if (p.footer) document.getElementById('profile-footer').innerText = p.footer;
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
