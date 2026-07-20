document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('po-date');
    if (dateInput) dateInput.valueAsDate = new Date();
    const deliveryInput = document.getElementById('po-delivery');
    if (deliveryInput) { const d = new Date(); d.setDate(d.getDate() + 14); deliveryInput.valueAsDate = d; }
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
    tr.querySelector('.editable').focus();
    calculateTotals();
}

function removeRow(rowId) {
    const tr = document.getElementById(rowId);
    if (tr) { tr.remove(); reindexRows(); calculateTotals(); }
}

function reindexRows() {
    const rows = document.querySelectorAll('#items-tbody tr');
    rows.forEach((row, idx) => {
        row.querySelector('td').textContent = idx + 1;
    });
}

function calculateTotals() {
    let subtotal = 0;
    let totalVat = 0;
    document.querySelectorAll('#items-tbody tr').forEach(row => {
        const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
        const price = parseFloat(row.querySelector('.price-input').value) || 0;
        const vatRate = (parseFloat(row.querySelector('.vat-input').value) || 0) / 100;
        const lineTotal = qty * price;
        const lineVat = lineTotal * vatRate;
        row.querySelector('.row-total').textContent = (lineTotal + lineVat).toFixed(2);
        subtotal += lineTotal;
        totalVat += lineVat;
    });
    const freight = parseFloat(document.getElementById('in-freight').value) || 0;
    const grandTotal = subtotal + totalVat + freight;
    document.getElementById('sum-subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('sum-vat').textContent = totalVat.toFixed(2);
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
                document.getElementById('brand-logo').src = p.logo;
                document.getElementById('brand-logo').style.display = 'block';
                document.getElementById('logo-placeholder').style.display = 'none';
            }
            if (p.theme && typeof ThemeManager !== 'undefined') ThemeManager.applyThemeObject(p.theme);

        } catch (err) { alert("Invalid profile file."); }
    };
    reader.readAsText(file);
}
