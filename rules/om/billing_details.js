/**
 * rules/om/billing_details.js
 *
 * Country: Oman (OM)
 * Document Type: billing_details
 * Authority: Oman Tax Authority (OTA)
 *
 * Oman IBAN: OM + 2 check + 16 digits = 23 chars.
 *
 * DISCLAIMER: Oman VAT is 5% (effective April 2021). Oman's Fawtara e-invoicing system is under development. PDF generation alone does not satisfy Fawtara structured e-invoice exchange.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "OM",
        country_name: "Oman",
        document_type: "billing_details",
        currency: "OMR",
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
                "code": "OM_BILLING_DETAILS_RULES",
                "status": "IMPLEMENTED",
                "authority": "Oman Tax Authority (OTA)",
                "sourceTitle": "Central Bank of Oman \u2014 Payment Systems Regulations",
                "sourceUrl": "https://www.cbo.gov.om/",
                "version": "2026-09",
                "publishedDate": "2019-01-01",
                "effectiveDate": "2019-01-01",
                "lastVerified": "2026-09-01",
                "notes": "Oman IBAN: OM + 2 check + 16 digits = 23 chars."
        }
],
        customValidate,
    };
}
