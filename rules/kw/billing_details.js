/**
 * rules/kw/billing_details.js
 *
 * Country: Kuwait (KW)
 * Document Type: billing_details
 * Authority: Central Bank of Kuwait (CBK)
 *
 * Kuwait IBAN standard requires 30 characters: KW + 2 check digits + 4 letter bank code + 22 account characters.
 *
 * DISCLAIMER: Billing Details is a payment instruction document. Requirements reflect Central Bank of Kuwait (CBK) standards. This is not a tax invoice.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "KW",
        country_name: "Kuwait",
        document_type: "billing_details",
        currency: "KWD",
        vat_rate: 0.0,
        has_vat: false,
        engine_status: "IMPLEMENTED",
        transaction_type: transactionType,
        effective_from: issueDate || new Date().toISOString().slice(0, 10),
        required_fields: [
            "beneficiary.name",
            "bankAccount.bankName",
            "currency.code",
            "amount",
            "paymentReference"
        ],
        warning_fields: [
            "bankAccount.iban",
            "bankAccount.swiftBic"
        ],
        extra_rules: [],
        source_registry: [
            {
                "code": "KW_BILLING_DETAILS_RULES",
                "status": "IMPLEMENTED",
                "authority": "Central Bank of Kuwait (CBK)",
                "sourceTitle": "Central Bank of Kuwait — IBAN Standard and Payment Systems Oversight",
                "sourceUrl": "https://www.cbk.gov.kw/",
                "version": "2026-09",
                "publishedDate": "2011-01-01",
                "effectiveDate": "2011-01-01",
                "lastVerified": "2026-09-01",
                "notes": "Kuwait IBAN format requires 30 characters: KW + 2 check digits + 4 letter bank code + 22 account characters."
            }
        ],
        customValidate,
    };
}
