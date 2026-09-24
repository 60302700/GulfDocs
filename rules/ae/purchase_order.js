/**
 * rules/ae/purchase_order.js
 *
 * Country: United Arab Emirates (AE)
 * Document Type: purchase_order
 * Authority: Federal Tax Authority (FTA) — UAE
 *
 * No specific UAE e-PO mandate verified as of 2026.
 *
 * DISCLAIMER: UAE VAT was introduced on 1 January 2018 at 5%. E-invoicing (Haytek) is under development. Rules reflect FTA published VAT invoice requirements.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "AE",
        country_name: "United Arab Emirates",
        document_type: "purchase_order",
        currency: "AED",
        vat_rate: 0.05,
        has_vat: true,
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
                "code": "AE_PURCHASE_ORDER_RULES",
                "status": "IMPLEMENTED",
                "authority": "Federal Tax Authority (FTA) \u2014 UAE",
                "sourceTitle": "UAE Commercial Transactions Law (Federal Law No. 18 of 1993)",
                "sourceUrl": "https://www.moj.gov.ae/",
                "version": "2026-09",
                "publishedDate": "1993-01-01",
                "effectiveDate": "1993-01-01",
                "lastVerified": "2026-09-01",
                "notes": "No specific UAE e-PO mandate verified as of 2026."
        }
],
        customValidate,
    };
}
