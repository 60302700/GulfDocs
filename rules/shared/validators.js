/**
 * rules/shared/validators.js
 *
 * Generic, DOM-free validation utilities.
 * Country-specific modules call these for common checks, avoiding duplication.
 * Do NOT add DOM queries here.
 */

// ─── Primitive helpers ────────────────────────────────────────────────────────

/** Resolve a dotted path in an object. Returns undefined if not found. */
export function resolvePath(obj, path) {
    return path.split(".").reduce((cur, key) => (cur != null ? cur[key] : undefined), obj);
}

/** True when value is non-null, non-undefined, and not an empty string. */
export function hasValue(v) {
    return v !== null && v !== undefined && v !== "";
}

/** True when value is a finite positive number. */
export function isPositive(v) {
    return typeof v === "number" && isFinite(v) && v > 0;
}

/** True when value is a finite non-negative number. */
export function isNonNeg(v) {
    return typeof v === "number" && isFinite(v) && v >= 0;
}

/** True when string is a valid ISO-8601 date (YYYY-MM-DD). */
export function isIsoDate(s) {
    return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/** True when string is a valid ISO-4217 currency code (3 uppercase letters). */
export function isIsoCurrency(s) {
    return typeof s === "string" && /^[A-Z]{3}$/.test(s);
}

/** True when string matches a generic IBAN format (2 letter country + 2 digits + up to 30 alphanumeric). */
export function isIban(s) {
    return typeof s === "string" && /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(s.replace(/\s/g, ""));
}

/** True when string matches a generic SWIFT/BIC (8 or 11 chars). */
export function isSwiftBic(s) {
    return typeof s === "string" && /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(s.replace(/\s/g, "").toUpperCase());
}

/** True when string looks like a valid e-mail. */
export function isEmail(s) {
    return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/** True when string looks like a phone number (digits, spaces, +, -, parens). */
export function isPhone(s) {
    return typeof s === "string" && /^[+\d][\d\s\-().]{6,}$/.test(s.trim());
}

// ─── Error/Warning factory ────────────────────────────────────────────────────

export function mkError(field, code, message, source = "") {
    return { field, code, message, severity: "error", source };
}

export function mkWarning(field, code, message, source = "") {
    return { field, code, message, severity: "warning", source };
}

// ─── Reusable check builders ──────────────────────────────────────────────────

/**
 * Check that every path in `requiredPaths` has a value in `canonical`.
 * Returns an array of error objects.
 */
export function checkRequiredFields(canonical, requiredPaths, source) {
    const errors = [];
    for (const path of requiredPaths) {
        const v = resolvePath(canonical, path);
        // Arrays count as present only when non-empty
        if (Array.isArray(v)) {
            if (v.length === 0) errors.push(mkError(path, "MISSING_REQUIRED_FIELD", `${path} must not be empty`, source));
        } else if (!hasValue(v)) {
            errors.push(mkError(path, "MISSING_REQUIRED_FIELD", `${path} is required`, source));
        }
    }
    return errors;
}

/**
 * Validate common totals cross-field math:
 *   grandTotal ≈ subtotal + tax − discount
 */
export function checkTotalsMath(total, source) {
    if (!total) return [];
    const { subtotal = 0, tax = 0, discount = 0, grandTotal = 0 } = total;
    const expected = subtotal + tax - discount;
    if (Math.abs(expected - grandTotal) > 0.02) {
        return [mkError(
            "total.grandTotal",
            "TOTALS_MATH_ERROR",
            `Grand total (${grandTotal}) does not equal subtotal (${subtotal}) + tax (${tax}) − discount (${discount}) = ${expected.toFixed(2)}`,
            source,
        )];
    }
    return [];
}

/**
 * Validate that issueDate is earlier than or equal to a comparison date.
 */
export function checkDateOrder(earlierField, earlierVal, laterField, laterVal, source) {
    if (!isIsoDate(earlierVal) || !isIsoDate(laterVal)) return [];
    if (earlierVal > laterVal) {
        return [mkError(
            laterField,
            "DATE_ORDER_ERROR",
            `${laterField} (${laterVal}) must not be before ${earlierField} (${earlierVal})`,
            source,
        )];
    }
    return [];
}

/**
 * Warn when currency code does not match the expected country currency.
 */
export function warnCurrencyMismatch(currencyCode, expectedCode, source) {
    if (currencyCode && isIsoCurrency(currencyCode) && expectedCode && currencyCode !== expectedCode) {
        return [mkWarning(
            "currency.code",
            "CURRENCY_MISMATCH",
            `Selected currency ${currencyCode} differs from the default for this country (${expectedCode}). Verify if a foreign-currency invoice is intended.`,
            source,
        )];
    }
    return [];
}
