/**
 * rules/om/billing_details.js
 *
 * Country: Oman (OM)
 * Document Type: billing_details
 * Authority: Central Bank of Oman (CBO)
 *
 * Oman IBAN standard requires 24 alphanumeric characters: OM + 2 check digits + 20 account characters.
 *
 * DISCLAIMER: Billing Details is a payment instruction document. Requirements reflect Central Bank of Oman (CBO) standards. This is not a tax invoice.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "OM",
        country_name: "Oman",
        document_type: "billing_details",
        currency: "OMR",
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
                "code": "OM_BILLING_DETAILS_RULES",
                "status": "IMPLEMENTED",
                "authority": "Central Bank of Oman (CBO)",
                "sourceTitle": "Central Bank of Oman — Payment Systems Regulations and IBAN Standard",
                "sourceUrl": "https://www.cbo.gov.om/",
                "version": "2026-09",
                "publishedDate": "2012-01-01",
                "effectiveDate": "2012-01-01",
                "lastVerified": "2026-09-01",
                "notes": "Oman IBAN format requires 24 characters: OM + 2 check digits + 20 account characters."
            }
        ],
        customValidate,
    };
}
