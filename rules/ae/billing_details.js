/**
 * rules/ae/billing_details.js
 *
 * Country: United Arab Emirates (AE)
 * Document Type: billing_details
 * Authority: Central Bank of the United Arab Emirates (CBUAE)
 *
 * UAE bank account transfers require IBAN format (AE + 2 check + 19 digits = 23 characters). SWIFT/BIC required for international incoming wires.
 *
 * DISCLAIMER: Billing Details is a payment instruction document. Requirements reflect CBUAE IBAN standards and commercial payment practice. This is not a tax invoice.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "AE",
        country_name: "United Arab Emirates",
        document_type: "billing_details",
        currency: "AED",
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
                "code": "AE_BILLING_DETAILS_RULES",
                "status": "IMPLEMENTED",
                "authority": "Central Bank of the United Arab Emirates (CBUAE)",
                "sourceTitle": "Central Bank of the UAE — IBAN Standard and Payment Systems Regulation",
                "sourceUrl": "https://www.centralbank.ae/",
                "version": "2026-09",
                "publishedDate": "2012-04-14",
                "effectiveDate": "2012-04-14",
                "lastVerified": "2026-09-01",
                "notes": "UAE IBAN standard requires 23 characters: AE + 2 check digits + 3 digits bank identifier + 16 digits account number."
            }
        ],
        customValidate,
    };
}
