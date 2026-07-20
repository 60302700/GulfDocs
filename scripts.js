// ─── Constants ────────────────────────────────────────────────────────────────
const PROFILE_KEY = 'gulfdocs_invoice_profile';

// ─── On Page Load ─────────────────────────────────────────────────────────────
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
    // Restore saved profile from localStorage
    loadProfileFromStorage();
});

// ─── Currency ─────────────────────────────────────────────────────────────────
function updateCurrency() {
    const selector = document.getElementById('currency-select');
    if (!selector) return;
    const currency = selector.value;
    document.querySelectorAll('.currency-label').forEach(el => {
        el.textContent = currency;
    });
    autoSaveProfile();
}

// ─── Line Items ───────────────────────────────────────────────────────────────
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
    const logoEl = document.getElementById('brand-logo');
    const placeholder = document.getElementById('logo-placeholder');
    if (dataUrl && dataUrl.startsWith('data:')) {
        logoEl.src = dataUrl;
        logoEl.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
    } else {
        logoEl.src = '';
        logoEl.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
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
        alert('Could not save profile: storage may be full. Try exporting as JSON instead.');
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
        } catch (e) { /* storage full — silent fail on auto-save */ }
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
    } catch (e) { /* corrupt data — ignore */ }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function _collectProfile() {
    return {
        name: document.getElementById('profile-name')?.innerText.trim() || '',
        trn: document.getElementById('profile-trn')?.innerText.trim() || '',
        address: document.getElementById('profile-address')?.innerText.trim() || '',
        phone: document.getElementById('profile-phone')?.innerText.trim() || '',
        email: document.getElementById('profile-email')?.innerText.trim() || '',
        footer: document.getElementById('profile-footer')?.innerText.trim() || '',
        logo: document.getElementById('brand-logo')?.getAttribute('src') || '',
        currency: document.getElementById('currency-select')?.value || 'QAR',
        theme: typeof ThemeManager !== 'undefined' ? ThemeManager.getThemeObject() : null,
    };
}

function _applyProfile(profile) {
    // Always set the element's content — even empty strings clear stale data.
    // Use textContent (not innerText) for reliable programmatic updates on
    // contenteditable divs across all browsers.
    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el == null) return;
        el.textContent = (val != null) ? val : '';
    };
    set('profile-name', profile.name ?? '');
    set('profile-trn', profile.trn ?? '');
    set('profile-address', profile.address ?? '');
    set('profile-phone', profile.phone ?? '');
    set('profile-email', profile.email ?? '');
    set('profile-footer', profile.footer ?? '');

    if (profile.currency) {
        const sel = document.getElementById('currency-select');
        if (sel) { sel.value = profile.currency; updateCurrency(); }
    }
    // Logo: accept both data: URLs (from upload) and empty string (no logo)
    if (typeof profile.logo === 'string') {
        _applyLogo(profile.logo);
    }
    if (profile.theme && typeof ThemeManager !== 'undefined') {
        ThemeManager.applyThemeObject(profile.theme);
    }
}

function _showSaveToast() {
    let toast = document.getElementById('save-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'save-toast';
        toast.style.cssText = `
            position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(80px);
            background: #1e293b; color: #fff; font-family: inherit; font-size: 13px; font-weight: 600;
            padding: 10px 20px; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.18);
            display: flex; align-items: center; gap: 8px; transition: transform 0.3s ease; z-index: 9999;
        `;
        document.body.appendChild(toast);
    }
    toast.innerHTML = '✅ Profile saved to browser';
    // Slide in
    setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(0)'; }, 10);
    // Slide out after 2.5 s
    setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(80px)'; }, 2600);
}

// ─── JSON Export / Import ─────────────────────────────────────────────────────
function exportBusinessProfile() {
    const profile = _collectProfile();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = 'gulfdocs_profile.json';
    a.click();
}

function importBusinessProfile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const profile = JSON.parse(e.target.result);
            _applyProfile(profile);
            // Also persist the imported profile
            localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
            _showSaveToast();
        } catch (err) {
            alert("Oops! This doesn't look like a valid GulfDocs profile file.");
        }
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-imported
    event.target.value = '';
}
