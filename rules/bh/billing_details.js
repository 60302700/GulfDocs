/**
 * rules/bh/billing_details.js
 *
 * Country: Bahrain (BH)
 * Document Type: billing_details
 * Authority: Central Bank of Bahrain (CBB)
 *
 * Bahrain IBAN standard requires 22 alphanumeric characters: BH + 2 check digits + 4 bank letters + 14 account characters.
 *
 * DISCLAIMER: Billing Details is a payment instruction document. Requirements reflect Central Bank of Bahrain (CBB) standards. This is not a tax invoice.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "BH",
        country_name: "Bahrain",
        document_type: "billing_details",
        currency: "BHD",
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
                "code": "BH_BILLING_DETAILS_RULES",
                "status": "IMPLEMENTED",
                "authority": "Central Bank of Bahrain (CBB)",
                "sourceTitle": "Central Bank of Bahrain — Payment Systems and Services Rulebook (IBAN Standard)",
                "sourceUrl": "https://www.cbb.gov.bh/",
                "version": "2026-09",
                "publishedDate": "2012-01-01",
                "effectiveDate": "2012-01-01",
                "lastVerified": "2026-09-01",
                "notes": "Bahrain IBAN format requires 22 characters: BH + 2 check digits + 4 letter bank code + 14 account characters."
            }
        ],
        customValidate,
    };
}
