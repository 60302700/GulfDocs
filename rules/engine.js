/**
 * rules/engine.js
 *
 * Central validation engine.
 * Receives a canonical document object and a rules config object returned by getRules().
 * Produces a structured { valid, errors, warnings } result.
 *
 * No DOM access here. No country logic here.
 * Country/document logic lives in the individual rule modules.
 */

import {
    checkRequiredFields,
    checkTotalsMath,
    checkDateOrder,
    warnCurrencyMismatch,
    isIsoDate,
    isNonNeg,
    hasValue,
    mkError,
    mkWarning,
} from "./shared/validators.js";

const DISCLAIMER =
    "Validation reflects the rules configured in this application. " +
    "Users remain responsible for confirming applicable legal, tax, payroll and regulatory requirements.";

/**
 * @param {object} canonical   Canonical document from the UI builder
 * @param {object} rules       Rules object from getRules()
 * @returns {{ valid: boolean, errors: object[], warnings: object[], disclaimer: string }}
 */
export function validateDocument(canonical, rules = {}) {
    const errors = [];
    const warnings = [];
    const source = rules.country || "GCC";

    // ── 1. Run required-field checks from the rule module ─────────────────────
    errors.push(...checkRequiredFields(canonical, rules.required_fields || [], source));

    // ── 2. Currency check ──────────────────────────────────────────────────────
    const docCurrency = canonical?.currency?.code;
    warnings.push(...warnCurrencyMismatch(docCurrency, rules.currency, source));

    // ── 3. Country agreement ───────────────────────────────────────────────────
    if (canonical.country && rules.country && canonical.country !== rules.country) {
        errors.push(mkError(
            "country",
            "COUNTRY_MISMATCH",
            `Document country (${canonical.country}) does not match the selected rules country (${rules.country})`,
            source,
        ));
    }

    // ── 4. Document-type-specific cross-field validation ──────────────────────
    const dt = canonical.documentType;

    if (dt === "invoice" || dt === "quotation" || dt === "purchase_order") {
        // Totals math
        errors.push(...checkTotalsMath(canonical.total, source));

        // Date order: issueDate ≤ dueDate
        if (canonical.dueDate) {
            errors.push(...checkDateOrder("issueDate", canonical.issueDate, "dueDate", canonical.dueDate, source));
        }
        // For quotations: issueDate ≤ validUntil
        if (canonical.validUntil) {
            errors.push(...checkDateOrder("issueDate", canonical.issueDate, "validUntil", canonical.validUntil, source));
        }
        // For POs: issueDate ≤ requiredDeliveryDate
        if (canonical.requiredDeliveryDate) {
            errors.push(...checkDateOrder("issueDate", canonical.issueDate, "requiredDeliveryDate", canonical.requiredDeliveryDate, source));
        }

        // Warn on empty items
        if (!canonical.items || canonical.items.length === 0) {
            warnings.push(mkWarning("items", "NO_ITEMS", "No line items have been added.", source));
        }

        // Warn on zero total
        if (canonical.total && !isNonNeg(canonical.total.grandTotal)) {
            warnings.push(mkWarning("total.grandTotal", "ZERO_TOTAL", "Document grand total is zero.", source));
        }

        // tax math: sum of taxes[].amount should be consistent with sum of taxes[].taxableAmount × rate
        if (rules.vat_rate && canonical.taxes && canonical.taxes.length > 0) {
            canonical.taxes.forEach((t, i) => {
                if (!isNonNeg(t.amount)) return;
                if (!isNonNeg(t.taxableAmount)) return;
                const expected = parseFloat((t.taxableAmount * rules.vat_rate).toFixed(2));
                if (Math.abs(expected - t.amount) > 0.05) {
                    warnings.push(mkWarning(
                        `taxes[${i}].amount`,
                        "TAX_AMOUNT_MISMATCH",
                        `Tax amount (${t.amount}) does not match taxableAmount × rate: ${t.taxableAmount} × ${(rules.vat_rate * 100).toFixed(0)}% = ${expected}`,
                        source,
                    ));
                }
            });
        }
    }

    if (dt === "payslip") {
        // Net cannot exceed gross
        if ((canonical.netPay || 0) > (canonical.grossPay || 0)) {
            errors.push(mkError("netPay", "NET_EXCEEDS_GROSS", "Net pay cannot exceed gross pay.", source));
        }
        if ((canonical.grossPay || 0) <= 0) {
            warnings.push(mkWarning("grossPay", "ZERO_GROSS_PAY", "Gross pay is zero.", source));
        }
        // payPeriod format: YYYY-MM
        const pp = canonical.payPeriod;
        if (pp && !/^\d{4}-\d{2}$/.test(pp)) {
            warnings.push(mkWarning("payPeriod", "INVALID_PAY_PERIOD_FORMAT", `Pay period "${pp}" should be in YYYY-MM format.`, source));
        }
        if (canonical.payDate && !isIsoDate(canonical.payDate)) {
            warnings.push(mkWarning("payDate", "INVALID_DATE", `Pay date "${canonical.payDate}" should be ISO 8601 (YYYY-MM-DD).`, source));
        }
    }

    if (dt === "billing_details") {
        const ba = canonical.bankAccount || {};
        // IBAN format check (optional field — only warn if populated)
        if (ba.iban && !/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(ba.iban.replace(/\s/g, ""))) {
            warnings.push(mkWarning("bankAccount.iban", "INVALID_IBAN_FORMAT", "IBAN format appears invalid.", source));
        }
        // SWIFT/BIC
        if (ba.swiftBic && !/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(ba.swiftBic.replace(/\s/g, "").toUpperCase())) {
            warnings.push(mkWarning("bankAccount.swiftBic", "INVALID_SWIFT_FORMAT", "SWIFT/BIC format appears invalid.", source));
        }
        if ((canonical.amount || 0) <= 0) {
            warnings.push(mkWarning("amount", "ZERO_AMOUNT", "Payment amount is zero.", source));
        }
    }

    // ── 5. Run additional custom checks from the rule module ──────────────────
    if (typeof rules.customValidate === "function") {
        const { errors: ce = [], warnings: cw = [] } = rules.customValidate(canonical) || {};
        errors.push(...ce);
        warnings.push(...cw);
    }

    // ── 6. Rule-status warnings ────────────────────────────────────────────────
    const ruleStatus = rules.engine_status || rules.status || "";
    if (ruleStatus === "OFFICIAL_SPECIFICATION_UNAVAILABLE") {
        warnings.push(mkWarning(
            "rules",
            "SPECIFICATION_UNAVAILABLE",
            `Official regulatory specification for ${rules.country}/${dt} has not been fully verified. Treat output as best-effort.`,
            source,
        ));
    } else if (ruleStatus === "PARTIALLY_IMPLEMENTED") {
        warnings.push(mkWarning("rules", "PARTIAL_RULES", `Rules for ${rules.country}/${dt} are partially implemented. Review output carefully.`, source));
    } else if (ruleStatus === "NOT_YET_IMPLEMENTED") {
        errors.push(mkError("rules", "RULES_NOT_IMPLEMENTED", `Country/document rules for ${rules.country}/${dt} are not yet implemented.`, source));
    }

    return { valid: errors.length === 0, errors, warnings, disclaimer: DISCLAIMER };
}

export default { validateDocument };
