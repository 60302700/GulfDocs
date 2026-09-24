/**
 * rules/sa/quotation.js
 *
 * Country: Saudi Arabia (SA)
 * Document Type: quotation
 * Authority: Zakat, Tax and Customs Authority (ZATCA)
 *
 * No separate e-quotation regulation. Standard commercial law applies.
 *
 * DISCLAIMER: Saudi Arabia operates ZATCA e-invoicing (Fatoorah). Phase 1 (generation) and Phase 2 (integration) are progressive requirements. This application generates PDF-level invoices only. Government clearance/reporting is NOT implemented.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "SA",
        country_name: "Saudi Arabia",
        document_type: "quotation",
        currency: "SAR",
        vat_rate: 0.15,
        has_vat: true,
        engine_status: "IMPLEMENTED",
        transaction_type: transactionType,
        effective_from: issueDate || new Date().toISOString().slice(0, 10),
        required_fields: [
        "seller.name",
        "seller.address.raw",
        "buyer.name",
        "id",
        "issueDate",
        "items",
        "total.grandTotal"
],
        warning_fields: [
        "validUntil",
        "seller.taxIdentity.taxId"
],
        extra_rules: [],
        source_registry: [
        {
                "code": "SA_QUOTATION_RULES",
                "status": "IMPLEMENTED",
                "authority": "Zakat, Tax and Customs Authority (ZATCA)",
                "sourceTitle": "Saudi Arabian Commercial Law (Royal Decree)",
                "sourceUrl": "https://www.moj.gov.sa/",
                "version": "2026-09",
                "publishedDate": "2022-01-01",
                "effectiveDate": "2022-01-01",
                "lastVerified": "2026-09-01",
                "notes": "No separate e-quotation regulation. Standard commercial law applies."
        }
],
        customValidate,
    };
}
