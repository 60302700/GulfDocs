/**
 * ad-manager.js
 *
 * GCC Business Documents - Isolated Advertising & Monetization Layer
 *
 * Guarantees:
 * 1. Strict Isolation: Completely decoupled from canonical models, rules engine, validation, and export pipelines.
 * 2. Privacy & Data Protection: Never receives, reads, or transmits document data, customer names, tax IDs, salaries, or IBANs.
 * 3. Consent Gating: Respects user choice from cookie-consent.js before initializing external ad scripts.
 * 4. Graceful Degradation: Silent handling if ad blockers are active, ad network fails, or publisher ID is unconfigured.
 * 5. Print & PDF Purity: All ad containers are strictly excluded from print stylesheets and generated documents.
 */

export const AdManager = {
  // Configuration: Publisher ID can be injected via data-ad-client or environment
  config: {
    publisherId: null, // e.g., "ca-pub-XXXXXXXXXXXXXXXX"
    enabled: false,
    testMode: true,
  },

  init(options = {}) {
    if (typeof window === "undefined") return;

    this.config = { ...this.config, ...options };

    // Check for publisher ID in meta tag or document configuration
    const metaPublisher = document.querySelector('meta[name="adsense-publisher-id"]');
    if (metaPublisher && metaPublisher.content) {
      this.config.publisherId = metaPublisher.content;
      this.config.enabled = true;
    }

    // Attach listeners for consent changes
    window.addEventListener("docscraft_consent_changed", (e) => {
      if (e.detail && e.detail.choice === "all") {
        this.loadAds();
      } else {
        this.unloadAds();
      }
    });

    // Check initial consent state
    const consent = this.getConsentState();
    if (consent === "all" && this.config.enabled && this.config.publisherId) {
      this.loadAds();
    } else {
      this.renderPlaceholders();
    }
  },

  getConsentState() {
    try {
      const raw = localStorage.getItem("docscraft_cookie_consent");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed ? parsed.choice : null;
    } catch {
      return null;
    }
  },

  loadAds() {
    if (!this.config.enabled || !this.config.publisherId) {
      this.renderPlaceholders();
      return;
    }

    try {
      // Load AdSense script once if allowed
      if (!document.getElementById("adsense-script")) {
        const script = document.createElement("script");
        script.id = "adsense-script";
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(this.config.publisherId)}`;
        script.crossOrigin = "anonymous";
        script.onerror = () => {
          // Graceful failure - hide or maintain fallback
          this.handleAdFailure();
        };
        document.head.appendChild(script);
      }
    } catch (err) {
      this.handleAdFailure();
    }
  },

  unloadAds() {
    // If user opts out, remove external scripts
    const script = document.getElementById("adsense-script");
    if (script) script.remove();
    this.renderPlaceholders();
  },

  renderPlaceholders() {
    if (typeof document === "undefined") return;
    const adSlots = document.querySelectorAll(".ad-placeholder");
    adSlots.forEach((slot) => {
      // Ensure placeholder has clean styling and does not block layout
      slot.setAttribute("aria-label", "Advertisement");
    });
  },

  handleAdFailure() {
    if (typeof document === "undefined") return;
    // Graceful handling: ad slots collapse cleanly if ad blocked/fails
    const adContainers = document.querySelectorAll(".ad-top, .ad-middle");
    adContainers.forEach((container) => {
      container.classList.add("ad-fallback-silent");
    });
  },
};

// Auto-init on DOMContentLoaded if in browser
if (typeof window !== "undefined") {
  window.AdManager = AdManager;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => AdManager.init());
  } else {
    AdManager.init();
  }
}

export default AdManager;
