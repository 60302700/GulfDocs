/**
 * GulfDocs Theme Manager
 * Handles real-time document coloring and customization
 */

const ThemeManager = {
    init() {
        this.injectUI();
        this.loadTheme();
        this.setupListeners();
    },

    injectUI() {
        const sidebar = document.createElement('div');
        sidebar.className = 'theme-sidebar no-print';
        sidebar.id = 'theme-sidebar';
        sidebar.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2>Document Theme</h2>
                <button onclick="ThemeManager.toggle()" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--text-muted)">&times;</button>
            </div>
            <p style="font-size:12px; color:var(--text-secondary); margin-top:-10px;">Customize your document appearance</p>
            
            <div class="theme-group">
                <div class="theme-item">
                    <label>Primary Accent</label>
                    <div class="color-input-wrapper">
                        <input type="color" id="color-primary" value="#2563eb" oninput="ThemeManager.update('primary', this.value)">
                    </div>
                </div>
                <div class="preset-colors">
                    <button class="preset-btn" style="background:#2563eb" onclick="ThemeManager.update('primary', '#2563eb')"></button>
                    <button class="preset-btn" style="background:#059669" onclick="ThemeManager.update('primary', '#059669')"></button>
                    <button class="preset-btn" style="background:#7c3aed" onclick="ThemeManager.update('primary', '#7c3aed')"></button>
                    <button class="preset-btn" style="background:#ea580c" onclick="ThemeManager.update('primary', '#ea580c')"></button>
                    <button class="preset-btn" style="background:#e11d48" onclick="ThemeManager.update('primary', '#e11d48')"></button>
                </div>
            </div>

            <div class="theme-group">
                <div class="theme-item">
                    <label>Main Text</label>
                    <div class="color-input-wrapper">
                        <input type="color" id="color-text" value="#0f172a" oninput="ThemeManager.update('text', this.value)">
                    </div>
                </div>
            </div>

            <div class="theme-group">
                <div class="theme-item">
                    <label>Secondary Text</label>
                    <div class="color-input-wrapper">
                        <input type="color" id="color-text-secondary" value="#64748b" oninput="ThemeManager.update('text-secondary', this.value)">
                    </div>
                </div>
            </div>

            <div class="theme-group">
                <div class="theme-item">
                    <label>Lines & Borders</label>
                    <div class="color-input-wrapper">
                        <input type="color" id="color-border" value="#e5e7eb" oninput="ThemeManager.update('border', this.value)">
                    </div>
                </div>
            </div>

            <div class="theme-group">
                <div class="theme-item">
                    <label>Document BG</label>
                    <div class="color-input-wrapper">
                        <input type="color" id="color-surface" value="#ffffff" oninput="ThemeManager.update('surface', this.value)">
                    </div>
                </div>
            </div>

            <div style="margin-top:auto; padding-top:20px; border-top:1px solid var(--border);">
                <div style="background: #eff6ff; padding: 12px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #bfdbfe;">
                    <h4 style="font-size: 12px; color: var(--accent-blue); margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        PDF Scaling Tip
                    </h4>
                    <p style="font-size: 11px; color: #1e40af; line-height: 1.4;">If your document is too long, use the <b>Scale</b> option in the browser's print dialog (e.g., 80% or 90%) to force it onto a single page.</p>
                </div>
                <button onclick="ThemeManager.reset()" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border); background:white; font-weight:600; cursor:pointer;">Reset to Default</button>
            </div>
        `;

        const toggle = document.createElement('button');
        toggle.className = 'theme-toggle no-print';
        toggle.id = 'theme-toggle';
        toggle.title = 'Customize Theme';
        toggle.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a10 10 0 0 1 0 20"></path>
                <path d="M12 8a4 4 0 0 1 0 8"></path>
            </svg>
        `;
        toggle.onclick = () => this.toggle();

        document.body.appendChild(sidebar);
        document.body.appendChild(toggle);
    },

    toggle() {
        document.getElementById('theme-sidebar').classList.toggle('active');
    },

    update(property, value, skipSave = false) {
        const root = document.documentElement;
        switch (property) {
            case 'primary':
                root.style.setProperty('--doc-primary', value);
                document.getElementById('color-primary').value = value;
                break;
            case 'text':
                root.style.setProperty('--doc-text', value);
                document.getElementById('color-text').value = value;
                break;
            case 'text-secondary':
                root.style.setProperty('--doc-text-secondary', value);
                document.getElementById('color-text-secondary').value = value;
                break;
            case 'border':
                root.style.setProperty('--doc-border', value);
                document.getElementById('color-border').value = value;
                break;
            case 'surface':
                root.style.setProperty('--doc-surface', value);
                document.getElementById('color-surface').value = value;
                break;
        }

        if (!skipSave) {
            this.saveTheme();
        }
    },

    saveTheme() {
        const theme = {
            primary: document.getElementById('color-primary').value,
            text: document.getElementById('color-text').value,
            textSecondary: document.getElementById('color-text-secondary').value,
            border: document.getElementById('color-border').value,
            surface: document.getElementById('color-surface').value
        };
        localStorage.setItem('docscraft_theme', JSON.stringify(theme));
    },

    loadTheme() {
        const saved = localStorage.getItem('docscraft_theme');
        if (saved) {
            const theme = JSON.parse(saved);
            this.applyThemeObject(theme);
        }
    },

    getThemeObject() {
        const primaryEl = document.getElementById('color-primary');
        const textEl = document.getElementById('color-text');
        const textSecEl = document.getElementById('color-text-secondary');
        const borderEl = document.getElementById('color-border');
        const surfaceEl = document.getElementById('color-surface');

        return {
            primary: primaryEl ? primaryEl.value : '#2563eb',
            text: textEl ? textEl.value : '#0f172a',
            textSecondary: textSecEl ? textSecEl.value : '#64748b',
            border: borderEl ? borderEl.value : '#e5e7eb',
            surface: surfaceEl ? surfaceEl.value : '#ffffff'
        };
    },

    applyThemeObject(theme) {
        if (theme.primary) this.update('primary', theme.primary, true);
        if (theme.text) this.update('text', theme.text, true);
        if (theme.textSecondary) this.update('text-secondary', theme.textSecondary, true);
        if (theme.border) this.update('border', theme.border, true);
        if (theme.surface) this.update('surface', theme.surface, true);
        this.saveTheme();
    },

    reset() {
        this.update('primary', '#2563eb');
        this.update('text', '#0f172a');
        this.update('text-secondary', '#64748b');
        this.update('border', '#e5e7eb');
        this.update('surface', '#ffffff');
        localStorage.removeItem('docscraft_theme');
    },

    setupListeners() {
        // Close sidebar when clicking outside
        document.addEventListener('mousedown', (e) => {
            const sidebar = document.getElementById('theme-sidebar');
            const toggle = document.getElementById('theme-toggle');
            if (sidebar.classList.contains('active') &&
                !sidebar.contains(e.target) &&
                !toggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });
    }
};

// Initialize after other scripts
window.addEventListener('load', () => {
    ThemeManager.init();
});
