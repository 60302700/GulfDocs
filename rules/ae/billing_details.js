/**
 * rules/ae/billing_details.js
 *
 * Country: United Arab Emirates (AE)
 * Document Type: billing_details
 * Authority: Federal Tax Authority (FTA) — UAE
 *
 * UAE uses IBAN (AE + 2 check + 19 digits). SWIFT/BIC required for international transfers.
 *
 * DISCLAIMER: UAE VAT was introduced on 1 January 2018 at 5%. E-invoicing (Haytek) is under development. Rules reflect FTA published VAT invoice requirements.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "AE",
        country_name: "United Arab Emirates",
        document_type: "billing_details",
        currency: "AED",
        vat_rate: 0.05,
        has_vat: true,
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
                "code": "AE_BILLING_DETAILS_RULES",
                "status": "IMPLEMENTED",
                "authority": "Federal Tax Authority (FTA) \u2014 UAE",
                "sourceTitle": "Central Bank of the UAE \u2014 Payment Systems Regulation",
                "sourceUrl": "https://www.centralbank.ae/",
                "version": "2026-09",
                "publishedDate": "2019-01-01",
                "effectiveDate": "2019-01-01",
                "lastVerified": "2026-09-01",
                "notes": "UAE uses IBAN (AE + 2 check + 19 digits). SWIFT/BIC required for international transfers."
        }
],
        customValidate,
    };
}
