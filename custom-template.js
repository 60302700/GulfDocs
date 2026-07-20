// State management for custom template editor
let customTemplateCode = "";
let uploadedFilename = "";
let companyLogoBase64 = "";

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{document_title}}</title>
    <style>
        body { 
            font-family: 'DM Sans', 'Inter', sans-serif; 
            color: var(--doc-text); 
            padding: 40px; 
            margin: 0; 
            background: var(--doc-surface); 
            line-height: 1.5;
        }
        .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            border-bottom: 2px solid var(--doc-border); 
            padding-bottom: 20px; 
        }
        .logo { 
            max-width: 100px; 
            max-height: 50px; 
            object-fit: contain; 
            margin-bottom: 10px;
        }
        .company-info h2 { 
            margin: 0; 
            font-size: 20px; 
            color: var(--doc-primary); 
            font-family: 'Sora', sans-serif;
            font-weight: 700;
        }
        .company-info p { 
            margin: 4px 0; 
            font-size: 13px; 
            color: var(--doc-text-secondary); 
        }
        .doc-meta { 
            text-align: right; 
        }
        .doc-meta h1 { 
            margin: 0 0 10px 0; 
            font-size: 24px; 
            color: var(--doc-text); 
            letter-spacing: -0.5px; 
            font-family: 'Sora', sans-serif;
            font-weight: 800;
        }
        .doc-meta p { 
            margin: 4px 0; 
            font-size: 13px; 
            color: var(--doc-text-secondary); 
        }
        .details-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 40px; 
            margin: 30px 0; 
        }
        .details-box h3 { 
            margin: 0 0 8px 0; 
            font-size: 11px; 
            text-transform: uppercase; 
            color: var(--doc-text-secondary); 
            letter-spacing: 0.5px; 
            font-weight: 700;
        }
        .details-box p { 
            margin: 4px 0; 
            font-size: 14px; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
        }
        th { 
            background: #f8fafc; 
            border-bottom: 2px solid var(--doc-border); 
            padding: 12px; 
            text-align: left; 
            font-size: 11px; 
            text-transform: uppercase; 
            color: var(--doc-text-secondary); 
            letter-spacing: 0.5px; 
        }
        td { 
            border-bottom: 1px solid var(--doc-border); 
            padding: 12px; 
            font-size: 13.5px; 
        }
        .numeric { 
            text-align: right; 
        }
        .summary-section { 
            display: flex; 
            justify-content: flex-end; 
            margin-top: 35px; 
        }
        .summary-table { 
            width: 280px; 
        }
        .summary-table tr td { 
            padding: 6px 12px; 
            border: none; 
            font-size: 13.5px; 
        }
        .summary-table tr.total td { 
            font-weight: bold; 
            border-top: 2px dashed var(--doc-border); 
            color: var(--doc-primary); 
            font-size: 16px; 
        }
        .footer { 
            margin-top: 50px; 
            font-size: 11.5px; 
            color: var(--doc-text-secondary); 
            text-align: center; 
            border-top: 1px solid var(--doc-border); 
            padding-top: 20px; 
            white-space: pre-line;
        }
        @media print {
            body { background: white; padding: 0px; }
            th { background: #f8fafc !important; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            {{#if company_logo}}
            <img class="logo" src="{{company_logo}}" alt="Logo">
            {{/if}}
            <h2>{{company_name}}</h2>
            {{#if company_trn}}
            <p>VAT/TRN: {{company_trn}}</p>
            {{/if}}
            {{#if company_phone}}
            <p>Phone: {{company_phone}}</p>
            {{/if}}
            {{#if company_email}}
            <p>Email: {{company_email}}</p>
            {{/if}}
        </div>
        <div class="doc-meta">
            <h1>{{document_title}}</h1>
            <p><strong>Ref Code:</strong> {{document_number}}</p>
            <p><strong>Date:</strong> {{document_date}}</p>
            {{#if document_due_date}}
            <p><strong>Due Date:</strong> {{document_due_date}}</p>
            {{/if}}
        </div>
    </div>
    
    <div class="details-grid">
        <div class="details-box">
            <h3>Bill To Client</h3>
            <p><strong>{{client_name}}</strong></p>
            {{#if client_trn}}
            <p>Client VAT: {{client_trn}}</p>
            {{/if}}
            {{#if client_phone}}
            <p>Phone: {{client_phone}}</p>
            {{/if}}
            {{#if client_email}}
            <p>Email: {{client_email}}</p>
            {{/if}}
            {{#if client_address}}
            <p style="white-space: pre-wrap;">{{client_address}}</p>
            {{/if}}
        </div>
    </div>
    
    <table>
        <thead>
            <tr>
                <th style="width: 8%;">No.</th>
                <th style="width: 52%;">Description</th>
                <th style="width: 12%;">SKU</th>
                <th class="numeric" style="width: 8%;">Qty</th>
                <th class="numeric" style="width: 10%;">Price</th>
                <th class="numeric" style="width: 10%;">Total</th>
            </tr>
        </thead>
        <tbody>
            {{#items}}
            <tr>
                <td>{{item_index}}</td>
                <td style="font-weight: 600;">{{item_description}}</td>
                <td>{{item_sku}}</td>
                <td class="numeric">{{item_qty}}</td>
                <td class="numeric">{{item_price}}</td>
                <td class="numeric">{{item_total}}</td>
            </tr>
            {{/items}}
        </tbody>
    </table>
    
    <div class="summary-section">
        <table class="summary-table">
            <tr>
                <td>Subtotal Charge:</td>
                <td class="numeric">{{currency}} {{subtotal}}</td>
            </tr>
            <tr>
                <td>VAT Tax ({{vat_rate}}%):</td>
                <td class="numeric">{{currency}} {{vat_amount}}</td>
            </tr>
            {{#if discount}}
            <tr>
                <td>Discount Special:</td>
                <td class="numeric">-{{currency}} {{discount}}</td>
            </tr>
            {{/if}}
            <tr class="total">
                <td>Grand Total:</td>
                <td class="numeric">{{currency}} {{grand_total}}</td>
            </tr>
        </table>
    </div>
    
    <div class="footer">
        <p>{{notes}}</p>
    </div>
</body>
</html>`;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Date Selectors
    const dateInput = document.getElementById('doc-date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
    const dueInput = document.getElementById('doc-due-date');
    if (dueInput) {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        dueInput.valueAsDate = d;
    }

    // 2. Drag and drop file upload listeners
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
            }, false);
        });

        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                document.getElementById('template-file').files = files;
                handleTemplateFileSelection(files[0]);
            }
        });
    }

    // 3. Load draft or default template
    const draftTheme = localStorage.getItem('docscraft_custom_template_draft');
    if (draftTheme) {
        try {
            const draft = JSON.parse(draftTheme);
            if (draft.template) {
                customTemplateCode = draft.template;
                uploadedFilename = draft.filename || "Saved Draft Template";
                updateTemplateStatus(true, uploadedFilename);
            }
            if (draft.data) {
                loadFormFields(draft.data);
            }
        } catch (e) {
            console.error("Error loading template draft:", e);
            loadDefaultTemplate();
        }
    } else {
        loadDefaultTemplate();
    }

    // Ensure we start with at least one row if empty
    const itemsContainer = document.getElementById('items-list-container');
    if (itemsContainer && itemsContainer.children.length === 0) {
        addSidebarRow("Item Description...", "SKU-001", 1, 100);
    }

    // Update Currency labels in page
    updateCurrency();

    // Trigger initial render
    updateDocumentPreview();
});

// Tab Switcher
function switchTab(tabId) {
    document.querySelectorAll('.sidebar-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });

    const activeBtn = Array.from(document.querySelectorAll('.sidebar-tab-btn')).find(btn => btn.innerText.toLowerCase().includes(tabId === 'tab-data' ? 'data' : 'syntax'));
    if (activeBtn) activeBtn.classList.add('active');

    const activePane = document.getElementById(tabId);
    if (activePane) activePane.classList.add('active');
}

// Expand/Collapse Accodion Form Sections
function toggleSection(headerEl) {
    const parent = headerEl.parentElement;
    parent.classList.toggle('collapsed');
}

// Copy to Clipboard
function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        const btns = document.querySelectorAll('.btn-copy');
        btns.forEach(btn => {
            if (btn.getAttribute('onclick').includes(text)) {
                const originalText = btn.innerText;
                btn.innerText = "Copied!";
                btn.style.background = "var(--accent-emerald)";
                btn.style.color = "white";
                btn.style.borderColor = "var(--accent-emerald)";
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.background = "";
                    btn.style.color = "";
                    btn.style.borderColor = "";
                }, 1500);
            }
        });
    }).catch(err => {
        alert("Clipboard copy failed, please manually copy tag: " + text);
    });
}

// Handle Template Selection
function handleTemplateUpload(event) {
    const file = event.target.files[0];
    if (file) {
        handleTemplateFileSelection(file);
    }
}

function handleTemplateFileSelection(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        customTemplateCode = e.target.result;
        uploadedFilename = file.name;
        updateTemplateStatus(true, file.name);
        saveDraftToLocalStorage();
        updateDocumentPreview();

        // Auto trigger tab switch back to form data so they see update
        switchTab('tab-data');
    };
    reader.readAsText(file);
}

// Business Logo file selector
function uploadLogo(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            companyLogoBase64 = e.target.result;

            // Show badge preview
            document.getElementById('logo-preview-badge').style.display = 'block';
            document.getElementById('logo-preview-img').src = e.target.result;
            document.getElementById('logo-preview-text').innerText = "Click clear/change logo";

            updateDocumentPreview();
            saveDraftToLocalStorage();
        };
        reader.readAsDataURL(file);
    }
}

function clearLogo() {
    companyLogoBase64 = "";
    document.getElementById('logo-file').value = "";
    document.getElementById('logo-preview-badge').style.display = 'none';
    document.getElementById('logo-preview-img').src = "";
    document.getElementById('logo-preview-text').innerText = "No logo uploaded (falls back to placeholder)";
    updateDocumentPreview();
    saveDraftToLocalStorage();
}

function updateTemplateStatus(active, filename) {
    const badge = document.getElementById('template-status-badge');
    const label = document.getElementById('template-filename-label');
    if (active) {
        badge.innerText = "Active";
        badge.className = "status-badge yes";
        label.innerText = filename;
    } else {
        badge.innerText = "Inactive";
        badge.className = "status-badge no";
        label.innerText = "-";
    }
}

// Default Template controls
function loadDefaultTemplate() {
    customTemplateCode = DEFAULT_TEMPLATE;
    uploadedFilename = "Default GulfDocs Template";
    updateTemplateStatus(true, uploadedFilename);
    updateDocumentPreview();
    saveDraftToLocalStorage();
}

function resetTemplate() {
    customTemplateCode = "";
    uploadedFilename = "";
    updateTemplateStatus(false, "");
    updateDocumentPreview();
    saveDraftToLocalStorage();
}

// Currency changer sync
function updateCurrency() {
    const selector = document.getElementById('currency-select');
    if (!selector) return;
    const currency = selector.value;

    // Also save in localStorage details
    updateDocumentPreview();
    saveDraftToLocalStorage();
}

// Dynamic items editing
let itemCounter = 0;

function addSidebarRow(desc = "", sku = "", qty = 1, price = "") {
    itemCounter++;
    const container = document.getElementById('items-list-container');
    const div = document.createElement('div');
    div.className = 'item-card';
    div.id = `item-card-${itemCounter}`;

    div.innerHTML = `
        <div class="item-card-header">
            <span class="item-card-title">Item Row #${itemCounter}</span>
            <button class="item-card-remove" onclick="removeSidebarRow('${div.id}')" title="Remove Row">×</button>
        </div>
        <div class="input-group" style="margin-bottom: 8px;">
            <input type="text" class="input-field card-desc" placeholder="Product Description...">
        </div>
        <div class="item-grid">
            <div class="input-group" style="margin-bottom: 0;">
                <input type="text" class="input-field card-sku" placeholder="SKU/Code">
            </div>
            <div class="item-subgrid">
                <input type="number" class="input-field card-qty" placeholder="Qty" min="0">
                <input type="number" class="input-field card-price" placeholder="Price" min="0" step="0.01">
            </div>
        </div>
    `;

    // Assign values as DOM properties (not HTML attributes) so imported/pasted
    // text can never break out of the markup and inject new elements.
    const descInput = div.querySelector('.card-desc');
    const skuInput = div.querySelector('.card-sku');
    const qtyInput = div.querySelector('.card-qty');
    const priceInput = div.querySelector('.card-price');
    descInput.value = desc;
    skuInput.value = sku;
    qtyInput.value = qty;
    priceInput.value = price;
    [descInput, skuInput, qtyInput, priceInput].forEach(el => {
        el.addEventListener('input', updateDocumentPreview);
    });

    container.appendChild(div);
    updateDocumentPreview();
    saveDraftToLocalStorage();
}

function removeSidebarRow(id) {
    const card = document.getElementById(id);
    if (card) {
        card.remove();
        updateDocumentPreview();
        saveDraftToLocalStorage();
    }
}

// Read form entries & compile context
function getFormData() {
    const selector = document.getElementById('currency-select');
    const currency = selector ? selector.value : "QAR";

    const items = [];
    document.querySelectorAll('.item-card').forEach(card => {
        const description = card.querySelector('.card-desc').value || "";
        const sku = card.querySelector('.card-sku').value || "";
        const qty = parseFloat(card.querySelector('.card-qty').value) || 0;
        const price = parseFloat(card.querySelector('.card-price').value) || 0;
        items.push({ description, sku, qty, price });
    });

    let subtotal = 0;
    items.forEach(it => { subtotal += it.qty * it.price; });

    const vatRate = parseFloat(document.getElementById('doc-vat-rate').value) || 0;
    const vatAmount = subtotal * (vatRate / 100);
    const discount = parseFloat(document.getElementById('doc-discount').value) || 0;
    const grandTotal = Math.max(0, (subtotal + vatAmount) - discount);

    return {
        company_logo: companyLogoBase64,
        company_name: document.getElementById('company-name').value || "",
        company_trn: document.getElementById('company-trn').value || "",
        company_phone: document.getElementById('company-phone').value || "",
        company_email: document.getElementById('company-email').value || "",

        document_title: document.getElementById('doc-title').value || "TAX INVOICE",
        document_number: document.getElementById('doc-number').value || "INV-001",
        document_date: formatDateString(document.getElementById('doc-date').value),
        document_due_date: formatDateString(document.getElementById('doc-due-date').value),

        client_name: document.getElementById('client-name').value || "",
        client_trn: document.getElementById('client-trn').value || "",
        client_phone: document.getElementById('client-phone').value || "",
        client_email: document.getElementById('client-email').value || "",
        client_address: document.getElementById('client-address').value || "",

        items: items,
        currency: currency,
        subtotal: subtotal.toFixed(2),
        vat_rate: vatRate,
        vat_amount: vatAmount.toFixed(2),
        discount: discount > 0 ? discount.toFixed(2) : "",
        grand_total: grandTotal.toFixed(2),
        notes: document.getElementById('doc-notes').value || ""
    };
}

function formatDateString(val) {
    if (!val) return "";
    const parsed = new Date(val);
    if (isNaN(parsed.getTime())) return val;
    // Returns nice reading date e.g. "14 July 2026"
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return parsed.toLocaleDateString('en-US', options);
}

// Compile template to html page
function compileTemplateToHTML(template, data) {
    let rendered = template;

    // 1. Process conditionals: {{#if key}} ... {{/if}}
    const ifRegex = /\{\{#if\s+([a-zA-Z0-9_]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    rendered = rendered.replace(ifRegex, (match, key, content) => {
        return (data[key] !== undefined && data[key] !== null && String(data[key]).trim() !== '') ? content : '';
    });

    // 2. Process negative conditionals: {{#unless key}} ... {{/unless}}
    const unlessRegex = /\{\{#unless\s+([a-zA-Z0-9_]+)\}\}([\s\S]*?)\{\{\/unless\}\}/g;
    rendered = rendered.replace(unlessRegex, (match, key, content) => {
        return (!data[key] || String(data[key]).trim() === '') ? content : '';
    });

    // 3. Process loops: {{#items}} ... {{/items}}
    const loopRegex = /\{\{#items\}\}([\s\S]*?)\{\{\/items\}\}/g;
    rendered = rendered.replace(loopRegex, (match, content) => {
        if (!data.items || data.items.length === 0) return '';
        return data.items.map((item, idx) => {
            let rowHtml = content;
            rowHtml = rowHtml.replace(/\{\{item_index\}\}/g, idx + 1);
            rowHtml = rowHtml.replace(/\{\{item_description\}\}/g, item.description || '');
            rowHtml = rowHtml.replace(/\{\{item_sku\}\}/g, item.sku || '');
            rowHtml = rowHtml.replace(/\{\{item_qty\}\}/g, item.qty || 0);
            rowHtml = rowHtml.replace(/\{\{item_price\}\}/g, parseFloat(item.price || 0).toFixed(2));
            rowHtml = rowHtml.replace(/\{\{item_total\}\}/g, (item.qty * item.price).toFixed(2));

            // Nested conditionals inside the loop. Let's do simple sku check
            const itemIfRegex = /\{\{#if\s+(item_sku)\}\}([\s\S]*?)\{\{\/if\}\}/g;
            rowHtml = rowHtml.replace(itemIfRegex, (m, k, inner) => {
                return (item.sku && item.sku.trim() !== '') ? inner : '';
            });
            const itemUnlessRegex = /\{\{#unless\s+(item_sku)\}\}([\s\S]*?)\{\{\/unless\}\}/g;
            rowHtml = rowHtml.replace(itemUnlessRegex, (m, k, inner) => {
                return (!item.sku || item.sku.trim() === '') ? inner : '';
            });

            return rowHtml;
        }).join('');
    });

    // 4. Process pre-built static items table helper: {{items_table}}
    if (rendered.includes('{{items_table}}')) {
        let tableHtml = `
        <table class="custom-items-table" style="width:100%; border-collapse:collapse; margin-top:20px; font-family: 'DM Sans', sans-serif;">
            <thead>
                <tr style="border-bottom: 2px solid var(--doc-border, #e2e8f0); background: #f8fafc;">
                    <th style="padding:12px; text-align:left; font-size:11px; text-transform:uppercase; color: var(--doc-text-secondary, #64748b); font-weight:700; letter-spacing:0.5px;">#</th>
                    <th style="padding:12px; text-align:left; font-size:11px; text-transform:uppercase; color: var(--doc-text-secondary, #64748b); font-weight:700; letter-spacing:0.5px; width:50%;">Description</th>
                    <th style="padding:12px; text-align:left; font-size:11px; text-transform:uppercase; color: var(--doc-text-secondary, #64748b); font-weight:700; letter-spacing:0.5px;">SKU</th>
                    <th style="padding:12px; text-align:right; font-size:11px; text-transform:uppercase; color: var(--doc-text-secondary, #64748b); font-weight:700; letter-spacing:0.5px;">Qty</th>
                    <th style="padding:12px; text-align:right; font-size:11px; text-transform:uppercase; color: var(--doc-text-secondary, #64748b); font-weight:700; letter-spacing:0.5px;">Price</th>
                    <th style="padding:12px; text-align:right; font-size:11px; text-transform:uppercase; color: var(--doc-text-secondary, #64748b); font-weight:700; letter-spacing:0.5px;">Total</th>
                </tr>
            </thead>
            <tbody>
        `;
        if (data.items && data.items.length > 0) {
            data.items.forEach((item, idx) => {
                tableHtml += `
                <tr style="border-bottom: 1px solid var(--doc-border, #e2e8f0); font-size:13.5px; color: var(--doc-text, #0f172a);">
                    <td style="padding:12px; color: var(--doc-text-secondary, #64748b);">${idx + 1}</td>
                    <td style="padding:12px; font-weight:600;">${item.description || ''}</td>
                    <td style="padding:12px;">${item.sku || '-'}</td>
                    <td style="padding:12px; text-align:right;">${item.qty || 0}</td>
                    <td style="padding:12px; text-align:right;">${parseFloat(item.price || 0).toFixed(2)}</td>
                    <td style="padding:12px; text-align:right; font-weight:700; color: var(--doc-text, #0f172a);">${(item.qty * item.price).toFixed(2)}</td>
                </tr>
                `;
            });
        } else {
            tableHtml += `<tr><td colspan="6" style="padding:24px; text-align:center; color: var(--doc-text-secondary, #94a3b8);">No items added</td></tr>`;
        }
        tableHtml += `</tbody></table>`;
        rendered = rendered.replace(/\{\{items_table\}\}/g, tableHtml);
    }

    // 5. Substitute simple placeholders: {{variable}}
    for (const key in data) {
        if (key !== 'items' && typeof data[key] !== 'object') {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            rendered = rendered.replace(regex, data[key] !== undefined ? data[key] : '');
        }
    }

    // Clean up any remaining double curly placeholders
    rendered = rendered.replace(/\{\{[#\/]?[a-zA-Z0-9_\s\-\.#\/]+\}\}/g, '');

    // 6. Inject theme colors at the top of the head stylesheet if it exists, so custom templates are themeable!
    let colors = { primary: '#2563eb', text: '#0f172a', textSecondary: '#64748b', border: '#e5e7eb', surface: '#ffffff' };
    if (typeof ThemeManager !== 'undefined' && typeof ThemeManager.getThemeObject === 'function') {
        try {
            colors = ThemeManager.getThemeObject();
        } catch (e) {
            console.warn("Could not get theme object from ThemeManager, using defaults:", e);
        }
    }
    const themeStyles = `
    :root {
        --doc-primary: ${colors.primary} !important;
        --doc-text: ${colors.text} !important;
        --doc-text-secondary: ${colors.textSecondary} !important;
        --doc-border: ${colors.border} !important;
        --doc-surface: ${colors.surface} !important;
    }
    `;
    const themeStyleBlock = `<style id="docscraft-theme-injector">${themeStyles}</style>`;

    if (rendered.includes('</head>')) {
        rendered = rendered.replace('</head>', `${themeStyleBlock}</head>`);
    } else {
        rendered = themeStyleBlock + rendered;
    }

    return rendered;
}

// Live update of iframe preview
function updateDocumentPreview() {
    const iframe = document.getElementById('preview-iframe');
    if (!iframe) return;

    const data = getFormData();

    let templateSource = customTemplateCode;
    if (!templateSource) {
        // Render a basic placeholder notice inside the iframe if template is completely cleared
        templateSource = `<!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: sans-serif; display: flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; background:#fafafa; color:#64748b; margin:0; }
                .card { border:1px dashed #cbd5e1; border-radius:12px; background:white; padding:40px; text-align:center; max-width:400px; box-shadow:0 4px 6px rgba(0,0,0,0.02);}
                h2 { color:#0f172a; margin:0 0 10px 0;}
                p { font-size:14px; margin-bottom:20px; line-height:1.5;}
            </style>
        </head>
        <body>
            <div class="card">
                <h2>No Template Loaded</h2>
                <p>To preview your document, please load the Default Template or drag & drop your own HTML file under the <b>Template & Syntax</b> tab.</p>
            </div>
        </body>
        </html>`;
    }

    const compiledHtml = compileTemplateToHTML(templateSource, data);

    // Render cleanly without flashing or resets
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(compiledHtml);
    iframeDoc.close();
}

// LocalStorage caching
function saveDraftToLocalStorage() {
    const items = [];
    document.querySelectorAll('.item-card').forEach(card => {
        const description = card.querySelector('.card-desc').value || "";
        const sku = card.querySelector('.card-sku').value || "";
        const qty = parseFloat(card.querySelector('.card-qty').value) || 0;
        const price = parseFloat(card.querySelector('.card-price').value) || 0;
        items.push({ description, sku, qty, price });
    });

    const fd = {
        company_name: document.getElementById('company-name').value,
        company_trn: document.getElementById('company-trn').value,
        company_phone: document.getElementById('company-phone').value,
        company_email: document.getElementById('company-email').value,
        doc_title: document.getElementById('doc-title').value,
        doc_number: document.getElementById('doc-number').value,
        doc_date: document.getElementById('doc-date').value,
        doc_due_date: document.getElementById('doc-due-date').value,
        client_name: document.getElementById('client-name').value,
        client_trn: document.getElementById('client-trn').value,
        client_phone: document.getElementById('client-phone').value,
        client_email: document.getElementById('client-email').value,
        client_address: document.getElementById('client-address').value,
        items: items,
        vat_rate: document.getElementById('doc-vat-rate').value,
        discount: document.getElementById('doc-discount').value,
        notes: document.getElementById('doc-notes').value,
        logo: companyLogoBase64
    };

    const draft = {
        template: customTemplateCode,
        filename: uploadedFilename,
        data: fd
    };

    localStorage.setItem('docscraft_custom_template_draft', JSON.stringify(draft));
}

function loadFormFields(data) {
    if (data.company_name !== undefined) document.getElementById('company-name').value = data.company_name;
    if (data.company_trn !== undefined) document.getElementById('company-trn').value = data.company_trn;
    if (data.company_phone !== undefined) document.getElementById('company-phone').value = data.company_phone;
    if (data.company_email !== undefined) document.getElementById('company-email').value = data.company_email;

    if (data.doc_title !== undefined) document.getElementById('doc-title').value = data.doc_title;
    if (data.doc_number !== undefined) document.getElementById('doc-number').value = data.doc_number;
    if (data.doc_date !== undefined) document.getElementById('doc-date').value = data.doc_date;
    if (data.doc_due_date !== undefined) document.getElementById('doc-due-date').value = data.doc_due_date;

    if (data.client_name !== undefined) document.getElementById('client-name').value = data.client_name;
    if (data.client_trn !== undefined) document.getElementById('client-trn').value = data.client_trn;
    if (data.client_phone !== undefined) document.getElementById('client-phone').value = data.client_phone;
    if (data.client_email !== undefined) document.getElementById('client-email').value = data.client_email;
    if (data.client_address !== undefined) document.getElementById('client-address').value = data.client_address;

    if (data.vat_rate !== undefined) document.getElementById('doc-vat-rate').value = data.vat_rate;
    if (data.discount !== undefined) document.getElementById('doc-discount').value = data.discount;
    if (data.notes !== undefined) document.getElementById('doc-notes').value = data.notes;

    if (data.logo) {
        companyLogoBase64 = data.logo;
        document.getElementById('logo-preview-badge').style.display = 'block';
        document.getElementById('logo-preview-img').src = data.logo;
        document.getElementById('logo-preview-text').innerText = "Click clear/change logo";
    } else {
        clearLogo();
    }

    // Load line items
    const container = document.getElementById('items-list-container');
    container.innerHTML = "";
    itemCounter = 0;
    if (data.items && data.items.length > 0) {
        data.items.forEach(it => {
            addSidebarRow(it.description, it.sku, it.qty, it.price);
        });
    }
}

// Print iframe content solely
function printIframe() {
    // Force preview render up-to-date
    updateDocumentPreview();

    const iframe = document.getElementById('preview-iframe');
    if (!iframe) return;

    // Trigger printing
    try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
    } catch (e) {
        alert("Failed to print iframe directly. Opening fallback printable window.");
        // Fallback: copy html code to a new tab/window and print it
        const newWin = window.open('', '_blank');
        const data = getFormData();
        const compiled = compileTemplateToHTML(customTemplateCode || DEFAULT_TEMPLATE, data);
        newWin.document.open();
        newWin.document.write(compiled);
        newWin.document.close();

        newWin.addEventListener('load', () => {
            newWin.focus();
            newWin.print();
        });
    }
}

// Export Business Profile JSON - INCLUDES client data and the uploaded custom template code as requested!
function exportBusinessProfile() {
    const data = getFormData();

    const profile = {
        name: data.company_name,
        trn: data.company_trn,
        phone: data.company_phone,
        email: data.company_email,
        logo: data.company_logo,
        footer: data.notes, // compatible with generic profiles
        currency: data.currency,

        // Custom template specific extensions
        client_name: data.client_name,
        client_trn: data.client_trn,
        client_phone: data.client_phone,
        client_email: data.client_email,
        client_address: data.client_address,
        vat_rate: data.vat_rate,
        discount: data.discount,
        items: data.items,

        // The most crucial part: Make the custom template part of profile JSON!
        customTemplate: customTemplateCode,
        customTemplateFilename: uploadedFilename,

        theme: (typeof ThemeManager !== 'undefined' && typeof ThemeManager.getThemeObject === 'function') ? (function () {
            try { return ThemeManager.getThemeObject(); } catch (e) { return null; }
        })() : null
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${(data.company_name || 'business').toLowerCase().replace(/\s+/g, '_')}_profile.json`);
    dlAnchorElem.click();
}

// Import Profile JSON - loads everything including the custom template!
function importBusinessProfile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const profile = JSON.parse(e.target.result);

            // Map keys
            const mappedData = {
                company_name: profile.name || "",
                company_trn: profile.trn || "",
                company_phone: profile.phone || "",
                company_email: profile.email || "",
                logo: profile.logo || "",
                notes: profile.footer || "",

                client_name: profile.client_name || "",
                client_trn: profile.client_trn || "",
                client_phone: profile.client_phone || "",
                client_email: profile.client_email || "",
                client_address: profile.client_address || "",
                vat_rate: profile.vat_rate !== undefined ? profile.vat_rate : 5,
                discount: profile.discount || "",
                items: profile.items || []
            };

            // Restore custom template HTML from JSON
            if (profile.customTemplate !== undefined) {
                customTemplateCode = profile.customTemplate;
                uploadedFilename = profile.customTemplateFilename || "Imported Custom Template";
                updateTemplateStatus(customTemplateCode !== "", uploadedFilename);
            } else {
                // If it's a generic profile JSON without a custom template, keep the current template but load details
                console.log("No custom template found in profile JSON. Kept current template.");
            }

            // Apply fields
            loadFormFields(mappedData);

            if (profile.currency) {
                document.getElementById('currency-select').value = profile.currency;
            }

            // Apply Theme if saved in configuration
            if (profile.theme && typeof ThemeManager !== 'undefined') {
                ThemeManager.applyThemeObject(profile.theme);
            }

            updateCurrency();
            updateDocumentPreview();
            saveDraftToLocalStorage();

            alert("Success! Custom Profile and Template restored successfully.");
        } catch (err) {
            console.error("Error importing profile:", err);
            alert("Oops! This doesn't look like a valid profile JSON file.");
        }
    };
    reader.readAsText(file);
}

// Expose these so that the ThemeManager can force draft updates on color/theme modifications
window.addEventListener('load', () => {
    // Hook into theme updates if the ThemeManager is present
    if (typeof ThemeManager !== 'undefined') {
        const originalUpdate = ThemeManager.update;
        ThemeManager.update = function (property, value, skipSave) {
            originalUpdate.call(ThemeManager, property, value, skipSave);
            updateDocumentPreview();
            saveDraftToLocalStorage();
        };

        const originalReset = ThemeManager.reset;
        ThemeManager.reset = function () {
            originalReset.call(ThemeManager);
            updateDocumentPreview();
            saveDraftToLocalStorage();
        };
    }
});
