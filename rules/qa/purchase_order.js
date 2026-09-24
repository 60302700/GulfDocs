/**
 * rules/qa/purchase_order.js
 *
 * Country: Qatar (QA)
 * Document Type: purchase_order
 * Authority: Qatar Tax Authority (QTA) / Ministry of Finance Qatar
 *
 * No country-specific purchase order e-invoicing requirements verified as of 2026.
 *
 * DISCLAIMER: Qatar does not currently impose Value Added Tax. Regulatory requirements are based on the Qatar Commercial Law (Law No. 27/2006) and Qatar Tax Authority guidance.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "QA",
        country_name: "Qatar",
        document_type: "purchase_order",
        currency: "QAR",
        vat_rate: 0.0,
        has_vat: false,
        engine_status: "IMPLEMENTED",
        transaction_type: transactionType,
        effective_from: issueDate || new Date().toISOString().slice(0, 10),
        required_fields: [
        "buyer.name",
        "supplier.name",
        "id",
        "issueDate",
        "items",
        "total.grandTotal"
],
        warning_fields: [
        "deliveryTerms",
        "requiredDeliveryDate"
],
        extra_rules: [],
        source_registry: [
        {
                "code": "QA_PURCHASE_ORDER_RULES",
                "status": "IMPLEMENTED",
                "authority": "Qatar Tax Authority (QTA) / Ministry of Finance Qatar",
                "sourceTitle": "Qatar Commercial Law No. 27 of 2006",
                "sourceUrl": "https://www.mec.gov.qa/",
                "version": "2026-09",
                "publishedDate": "2006-01-01",
                "effectiveDate": "2006-01-01",
                "lastVerified": "2026-09-01",
                "notes": "No country-specific purchase order e-invoicing requirements verified as of 2026."
        }
],
        customValidate,
    };
}
