/**
 * rules/om/quotation.js
 *
 * Country: Oman (OM)
 * Document Type: quotation
 * Authority: Oman Tax Authority (OTA)
 *
 * No Oman-specific e-quotation mandate verified.
 *
 * DISCLAIMER: Oman VAT is 5% (effective April 2021). Oman's Fawtara e-invoicing system is under development. PDF generation alone does not satisfy Fawtara structured e-invoice exchange.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "OM",
        country_name: "Oman",
        document_type: "quotation",
        currency: "OMR",
        vat_rate: 0.05,
        has_vat: true,
        engine_status: "IMPLEMENTED",
        transaction_type: transactionType,
        effective_from: issueDate || new Date().toISOString().slice(0, 10),
        required_fields: [
        "seller.name",
        "buyer.name",
        "id",
        "issueDate",
        "items",
        "total.grandTotal"
],
        warning_fields: [
        "validUntil"
],
        extra_rules: [],
        source_registry: [
        {
                "code": "OM_QUOTATION_RULES",
                "status": "IMPLEMENTED",
                "authority": "Oman Tax Authority (OTA)",
                "sourceTitle": "Oman Commercial Law (Royal Decree No. 55 of 1990)",
                "sourceUrl": "https://www.mociip.gov.om/",
                "version": "2026-09",
                "publishedDate": "1990-01-01",
                "effectiveDate": "1990-01-01",
                "lastVerified": "2026-09-01",
                "notes": "No Oman-specific e-quotation mandate verified."
        }
],
        customValidate,
    };
}
