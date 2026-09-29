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

/** Country-specific IBAN validators for GCC countries. */
export const GCC_IBAN_PATTERNS = {
    QA: /^QA\d{2}[A-Z]{4}[0-9A-Z]{21}$/,  // 29 characters
    AE: /^AE\d{2}\d{3}\d{16}$/,           // 23 characters (AE + 2 check + 3 bank + 16 account)
    SA: /^SA\d{2}\d{2}[0-9A-Z]{18}$/,     // 24 characters (SA + 2 check + 2 bank + 18 account)
    BH: /^BH\d{2}[A-Z]{4}[0-9A-Z]{14}$/,  // 22 characters (BH + 2 check + 4 bank + 14 account)
    KW: /^KW\d{2}[A-Z]{4}[0-9A-Z]{22}$/,  // 30 characters (KW + 2 check + 4 bank + 22 account)
    OM: /^OM\d{2}[0-9A-Z]{20}$/,          // 24 characters (OM + 2 check + 20 account)
};

export function validateGccIban(iban, countryCode) {
    if (!iban || typeof iban !== "string") return false;
    const clean = iban.replace(/\s/g, "").toUpperCase();
    const cc = (countryCode || "").toUpperCase();
    const pattern = GCC_IBAN_PATTERNS[cc];
    if (pattern) {
        return pattern.test(clean);
    }
    return isIban(clean);
}

/** Country-specific Tax Registration Number (TRN / VATIN) format patterns. */
export const GCC_TAX_ID_PATTERNS = {
    SA: /^3\d{13}3$/,           // 15 digits, starts with 3, ends with 3 (ZATCA)
    AE: /^100\d{12}$/,          // 15 digits, starts with 100 (FTA UAE)
    BH: /^\d{15}$/,             // 15 digits (NBR Bahrain)
    OM: /^(OM)?[0-9]{8,15}$/,   // 8 to 15 digits, optional OM prefix (OTA Oman)
};

/** Country-specific Employee ID / National ID / Civil ID / Iqama patterns for payslips. */
export const GCC_EMPLOYEE_ID_PATTERNS = {
    QA: /^\d{11}$/,                  // Qatar ID (QID): 11 digits
    AE: /^784-?\d{4}-?\d{7}-?\d$/,   // Emirates ID: 15 digits starting 784
    SA: /^[12]\d{9}$/,               // Saudi National ID (starts with 1) or Iqama (starts with 2): 10 digits
    BH: /^\d{9}$/,                   // Bahrain CPR / Personal ID: 9 digits
    KW: /^\d{12}$/,                  // Kuwait Civil ID: 12 digits
    OM: /^\d{8,9}$/,                 // Oman Civil ID: 8-9 digits
};

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

function categorizeField(path = "") {
    if (path.startsWith("seller.") || path.startsWith("employer.")) return "Seller";
    if (path.startsWith("buyer.") || path.startsWith("employee.") || path.startsWith("supplier.") || path.startsWith("beneficiary.")) return "Counterparty";
    if (path === "id" || path === "issueDate" || path === "payPeriod" || path === "payDate" || path === "dueDate" || path === "validUntil") return "Document";
    if (path.startsWith("tax") || path.includes("tax")) return "Tax";
    if (path.startsWith("payment") || path.includes("bankAccount") || path.startsWith("total")) return "Financial";
    return "Country Rules";
}

export function mkError(field, code, message, source = "", category = null) {
    return { field, code, message, severity: "error", source, category: category || categorizeField(field) };
}

export function mkWarning(field, code, message, source = "", category = null) {
    return { field, code, message, severity: "warning", source, category: category || categorizeField(field) };
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
