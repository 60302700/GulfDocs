/**
 * rules/index.js
 *
 * Central rule-engine entry point.
 *
 * Usage (ESM, browser or Node):
 *   import { getRules } from './rules/index.js';
 *   const rules = await getRules({ country: 'SA', documentType: 'invoice', transactionType: 'B2B' });
 *
 * Architecture:
 *   UI → Canonical Builder → Canonical Document
 *        → getRules()  → validateDocument()  → { valid, errors, warnings }
 *
 * ─── Rule status codes ────────────────────────────────────────────────────────
 *   IMPLEMENTED                     — fully modelled against official source
 *   PARTIALLY_IMPLEMENTED           — key fields present; some requirements pending
 *   NOT_APPLICABLE                  — rule category not relevant for this doc/country
 *   NOT_YET_IMPLEMENTED             — planned but not yet coded
 *   FUTURE_REQUIREMENT              — official requirement exists but not yet effective
 *   OFFICIAL_SPECIFICATION_UNAVAILABLE — authoritative spec not yet publicly available
 *   REQUIRES_MANUAL_VERIFICATION    — user must verify against current authority guidance
 */

// ─── Supported combinations ───────────────────────────────────────────────────
const COUNTRIES = ["qa", "ae", "sa", "bh", "kw", "om"];
const DOC_TYPES = ["invoice", "payslip", "quotation", "purchase_order", "billing_details"];

// Map UI slugs (with hyphens) to module filenames (underscored)
const DOC_SLUG_MAP = {
    "invoice": "invoice",
    "payslip": "payslip",
    "quotation": "quotation",
    "purchase-order": "purchase_order",
    "purchase_order": "purchase_order",
    "billing-details": "billing_details",
    "billing_details": "billing_details",
};

// ─── Lazy-loaded module cache (avoid re-importing the same module) ────────────
const _cache = {};

/**
 * Resolve and return the rules object for a given (country, documentType) combination.
 *
 * @param {{ country: string, documentType: string, issueDate?: string, transactionType?: string }} opts
 * @returns {Promise<object>} rules object (see individual module for full shape)
 */
export async function getRules({
    country = "QA",
    documentType = "invoice",
    issueDate = new Date().toISOString().slice(0, 10),
    transactionType = "B2B",
} = {}) {
    const c = country.toLowerCase();
    const doc = DOC_SLUG_MAP[documentType.toLowerCase()] ?? null;

    if (!COUNTRIES.includes(c)) {
        return _notImplemented(country, documentType, `Country "${country}" is not in the supported GCC list: ${COUNTRIES.join(", ")}.`);
    }
    if (!doc || !DOC_TYPES.includes(doc)) {
        return _notImplemented(country, documentType, `Document type "${documentType}" is not supported.`);
    }

    const cacheKey = `${c}:${doc}`;
    if (!_cache[cacheKey]) {
        try {
            const mod = await import(`./${c}/${doc}.js`);
            _cache[cacheKey] = mod.default;   // mod.default is a function
        } catch (err) {
            console.error(`[rules/index] Failed to load module ${cacheKey}:`, err);
            return _notImplemented(country, documentType, `Module ${cacheKey} could not be loaded: ${err.message}`);
        }
    }

    const rulesFn = _cache[cacheKey];
    return rulesFn(issueDate, transactionType);
}

/** Synchronous variant — for code paths that have already awaited once (e.g., after caching). */
export function getRulesSync({ country, documentType, issueDate, transactionType } = {}) {
    const c = (country || "QA").toLowerCase();
    const doc = DOC_SLUG_MAP[(documentType || "invoice").toLowerCase()] || "invoice";
    const ck = `${c}:${doc}`;
    if (_cache[ck]) return _cache[ck](issueDate || new Date().toISOString().slice(0, 10), transactionType || "B2B");
    return null; // not cached yet, caller must await getRules() first
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _notImplemented(country, documentType, note) {
    return {
        country: (country || "").toUpperCase(),
        country_name: country,
        document_type: documentType,
        engine_status: "NOT_YET_IMPLEMENTED",
        currency: "",
        vat_rate: 0,
        has_vat: false,
        required_fields: [],
        warning_fields: [],
        extra_rules: [],
        source_registry: [],
        notes: note,
        customValidate: () => ({ errors: [], warnings: [] }),
    };
}

export default { getRules, getRulesSync };
