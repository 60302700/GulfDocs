/**
 * rules/sa/billing_details.js
 *
 * Country: Saudi Arabia (SA)
 * Document Type: billing_details
 * Authority: Saudi Central Bank (SAMA)
 *
 * Saudi IBAN format requires 24 alphanumeric characters: SA + 2 check digits + 2 bank digits + 18 account characters. SWIFT/BIC required for cross-border wires.
 *
 * DISCLAIMER: Billing Details is a payment instruction document. Requirements reflect Saudi Central Bank (SAMA) IBAN standards and SARIE banking rails. This is not a tax invoice.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "SA",
        country_name: "Saudi Arabia",
        document_type: "billing_details",
        currency: "SAR",
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
                "code": "SA_BILLING_DETAILS_RULES",
                "status": "IMPLEMENTED",
                "authority": "Saudi Central Bank (SAMA)",
                "sourceTitle": "Saudi Central Bank (SAMA) — National IBAN Standard and SARIE Payment Regulations",
                "sourceUrl": "https://www.sama.gov.sa/",
                "version": "2026-09",
                "publishedDate": "2006-07-01",
                "effectiveDate": "2006-07-01",
                "lastVerified": "2026-09-01",
                "notes": "Saudi IBAN format: 24 characters (SA + 2 check digits + 2 bank code digits + 18 account characters)."
            }
        ],
        customValidate,
    };
}
