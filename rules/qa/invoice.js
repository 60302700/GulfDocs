/**
 * rules/qa/invoice.js
 *
 * Country: Qatar (QA)
 * Document Type: invoice
 * Authority: Qatar Tax Authority (QTA) / Ministry of Finance Qatar
 *
 * Qatar does not operate a VAT system as of 2026. E-invoicing specifications are OFFICIAL_SPECIFICATION_UNAVAILABLE pending QTA publication.
 *
 * DISCLAIMER: Qatar does not currently impose Value Added Tax. Regulatory requirements are based on the Qatar Commercial Law (Law No. 27/2006) and Qatar Tax Authority guidance.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "QA",
        country_name: "Qatar",
        document_type: "invoice",
        currency: "QAR",
        vat_rate: 0.0,
        has_vat: false,
        engine_status: "PARTIALLY_IMPLEMENTED",
        transaction_type: transactionType,
        effective_from: issueDate || new Date().toISOString().slice(0, 10),
        required_fields: [
        "seller.name",
        "seller.address.raw",
        "id",
        "issueDate",
        "buyer.name",
        "items",
        "total.grandTotal",
        "currency.code"
],
        warning_fields: [
        "seller.taxIdentity.taxId",
        "payment.terms"
],
        extra_rules: [],
        source_registry: [
        {
                "code": "QA_INVOICE_RULES",
                "status": "PARTIALLY_IMPLEMENTED",
                "authority": "Qatar Tax Authority (QTA) / Ministry of Finance Qatar",
                "sourceTitle": "Qatar Tax Authority \u2014 Invoicing Guidance",
                "sourceUrl": "https://qta.gov.qa/",
                "version": "2026-09",
                "publishedDate": "2023-01-01",
                "effectiveDate": "2023-01-01",
                "lastVerified": "2026-09-01",
                "notes": "Qatar does not operate a VAT system as of 2026. E-invoicing specifications are OFFICIAL_SPECIFICATION_UNAVAILABLE pending QTA publication."
        }
],
        customValidate,
    };
}
