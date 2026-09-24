/**
 * rules/kw/quotation.js
 *
 * Country: Kuwait (KW)
 * Document Type: quotation
 * Authority: Kuwait Ministry of Finance / General Administration of Customs
 *
 * [CURRENT] No e-quotation mandate verified.
 *
 * DISCLAIMER: Kuwait does not currently impose VAT (as of 2026). A GCC-wide VAT framework was agreed upon but Kuwait has not enacted domestic VAT legislation. Rules reflect CURRENT requirements only.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "KW",
        country_name: "Kuwait",
        document_type: "quotation",
        currency: "KWD",
        vat_rate: 0.0,
        has_vat: false,
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
                "code": "KW_QUOTATION_RULES",
                "status": "IMPLEMENTED",
                "authority": "Kuwait Ministry of Finance / General Administration of Customs",
                "sourceTitle": "Kuwait Commercial Law No. 68 of 1980",
                "sourceUrl": "https://www.mof.gov.kw/",
                "version": "2026-09",
                "publishedDate": "1980-01-01",
                "effectiveDate": "1980-01-01",
                "lastVerified": "2026-09-01",
                "notes": "[CURRENT] No e-quotation mandate verified."
        }
],
        customValidate,
    };
}
