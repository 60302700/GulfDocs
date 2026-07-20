document.addEventListener('DOMContentLoaded', () => {
    const periodInput = document.getElementById('pay-period');
    if (periodInput) {
        const now = new Date();
        periodInput.value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    }
    updateCurrency();
    addEarning();
    addDeduction();
});

function updateCurrency() {
    const selector = document.getElementById('currency-select');
    if (!selector) return;
    document.querySelectorAll('.currency-label').forEach(el => {
        el.textContent = selector.value;
    });
}

let earningCounter = 0;
let deductionCounter = 0;

function addEarning() {
    earningCounter++;
    const list = document.getElementById('earnings-list');
    const div = document.createElement('div');
    div.id = `earning-${earningCounter}`;
    div.style.cssText = 'display:flex; justify-content:space-between; margin-bottom:14px; font-size:15px; align-items:center;';
    div.innerHTML = `
        <div class="editable" contenteditable="true" placeholder="Basic Salary / Allowance..." style="color: var(--text-secondary); flex: 1;"></div>
        <div style="display:flex; align-items:center; gap:8px;">
            <input type="number" class="editable-input earning-amount" placeholder="0.00" oninput="calculatePayslip()" style="width: 120px; text-align: right; font-weight: 700;">
            <button class="remove-btn no-print" onclick="removeEntry('${div.id}')" title="Remove">×</button>
        </div>
    `;
    list.appendChild(div);
    div.querySelector('.editable').focus();
}

function addDeduction() {
    deductionCounter++;
    const list = document.getElementById('deductions-list');
    const div = document.createElement('div');
    div.id = `deduction-${deductionCounter}`;
    div.style.cssText = 'display:flex; justify-content:space-between; margin-bottom:14px; font-size:15px; align-items:center;';
    div.innerHTML = `
        <div class="editable" contenteditable="true" placeholder="Insurance / Loan..." style="color: var(--text-secondary); flex: 1;"></div>
        <div style="display:flex; align-items:center; gap:8px;">
            <input type="number" class="editable-input deduction-amount" placeholder="0.00" oninput="calculatePayslip()" style="width: 120px; text-align: right; font-weight: 700; color: var(--accent-rose);">
            <button class="remove-btn no-print" onclick="removeEntry('${div.id}')" title="Remove">×</button>
        </div>
    `;
    list.appendChild(div);
    div.querySelector('.editable').focus();
}

function removeEntry(id) {
    const el = document.getElementById(id);
    if (el) { el.remove(); calculatePayslip(); }
}

function calculatePayslip() {
    let gross = 0;
    document.querySelectorAll('.earning-amount').forEach(input => {
        gross += parseFloat(input.value) || 0;
    });
    let deductions = 0;
    document.querySelectorAll('.deduction-amount').forEach(input => {
        deductions += parseFloat(input.value) || 0;
    });
    const net = gross - deductions;
    document.getElementById('sum-gross').textContent = gross.toFixed(2);
    document.getElementById('sum-deductions').textContent = deductions.toFixed(2);
    document.getElementById('sum-net').textContent = Math.max(0, net).toFixed(2);
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
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
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
