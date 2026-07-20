/**
 * GulfDocs Cookie Consent
 * Shows a one-time banner explaining local storage and (future) ad cookies.
 * Choice is stored in localStorage and exposed via window.docscraftAdsAllowed
 * so ad/analytics scripts can be gated on consent once they're added.
 */
const CookieConsent = {
    STORAGE_KEY: 'docscraft_cookie_consent',

    init() {
        const saved = this.get();
        if (saved) {
            this.applyConsent(saved.choice);
        } else {
            this.injectBanner();
        }
    },

    get() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    },

    save(choice) {
        const record = { choice, date: new Date().toISOString() };
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(record));
        } catch (e) {
            // localStorage unavailable (private browsing, etc.) - consent won't persist
        }
        return record;
    },

    injectBanner() {
        if (document.getElementById('cookie-consent-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.className = 'cookie-consent-banner no-print';
        banner.innerHTML = `
            <div class="cookie-consent-text">
                We use your browser's local storage to save draft documents on this device. If we enable
                advertising (e.g. Google AdSense) in future, ad partners may also use cookies to show ads and
                measure performance. Read our <a href="/privacy-policy.html">Privacy Policy</a>.
            </div>
            <div class="cookie-consent-actions">
                <button class="cookie-btn" onclick="CookieConsent.choose('necessary')">Necessary only</button>
                <button class="cookie-btn cookie-btn-primary" onclick="CookieConsent.choose('all')">Accept all</button>
            </div>
        `;
        document.body.appendChild(banner);
        requestAnimationFrame(() => banner.classList.add('visible'));
    },

    choose(choice) {
        const record = this.save(choice);
        this.applyConsent(record.choice);
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.remove('visible');
            setTimeout(() => banner.remove(), 350);
        }
    },

    applyConsent(choice) {
        // Future ad/analytics scripts should check this flag before loading.
        window.docscraftAdsAllowed = (choice === 'all');
    }
};

window.addEventListener('DOMContentLoaded', () => {
    CookieConsent.init();
});
