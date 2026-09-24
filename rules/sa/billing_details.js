/**
 * rules/sa/billing_details.js
 *
 * Country: Saudi Arabia (SA)
 * Document Type: billing_details
 * Authority: Zakat, Tax and Customs Authority (ZATCA)
 *
 * Saudi IBAN: SA + 2 check + 20 digits (22 chars total). SWIFT required for international transfers.
 *
 * DISCLAIMER: Saudi Arabia operates ZATCA e-invoicing (Fatoorah). Phase 1 (generation) and Phase 2 (integration) are progressive requirements. This application generates PDF-level invoices only. Government clearance/reporting is NOT implemented.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "SA",
        country_name: "Saudi Arabia",
        document_type: "billing_details",
        currency: "SAR",
        vat_rate: 0.15,
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
                "code": "SA_BILLING_DETAILS_RULES",
                "status": "IMPLEMENTED",
                "authority": "Zakat, Tax and Customs Authority (ZATCA)",
                "sourceTitle": "Saudi Central Bank (SAMA) \u2014 Payment Systems Regulations",
                "sourceUrl": "https://www.sama.gov.sa/",
                "version": "2026-09",
                "publishedDate": "2020-01-01",
                "effectiveDate": "2020-01-01",
                "lastVerified": "2026-09-01",
                "notes": "Saudi IBAN: SA + 2 check + 20 digits (22 chars total). SWIFT required for international transfers."
        }
],
        customValidate,
    };
}
