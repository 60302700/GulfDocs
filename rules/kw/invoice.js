/**
 * rules/kw/invoice.js
 *
 * Country: Kuwait (KW)
 * Document Type: invoice
 * Authority: Kuwait Ministry of Finance / General Administration of Customs
 *
 * [CURRENT] Kuwait has no VAT system as of 2026. Standard commercial invoice required with seller/buyer details and totals. [FUTURE/PROPOSED] Kuwait VAT introduction remains a future legislative proposal.
 *
 * DISCLAIMER: Kuwait does not currently impose VAT (as of 2026). A GCC-wide VAT framework was agreed upon but Kuwait has not enacted domestic VAT legislation. Rules reflect CURRENT requirements only.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "KW",
        country_name: "Kuwait",
        document_type: "invoice",
        currency: "KWD",
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
        warning_fields: [],
        extra_rules: [
        {
                "code": "KW_VAT_PROPOSAL",
                "description": "[PROPOSED/FUTURE] Kuwait VAT \u2014 not yet enacted. Do not apply VAT rules until official domestic legislation is published.",
                "status": "FUTURE_REQUIREMENT",
                "field": "taxes",
                "test": null
        }
],
        source_registry: [
        {
                "code": "KW_INVOICE_RULES",
                "status": "PARTIALLY_IMPLEMENTED",
                "authority": "Kuwait Ministry of Finance / General Administration of Customs",
                "sourceTitle": "Kuwait Commercial Law No. 68 of 1980 (as amended); Ministry of Finance guidance",
                "sourceUrl": "https://www.mof.gov.kw/",
                "version": "2026-09",
                "publishedDate": "1980-01-01",
                "effectiveDate": "1980-01-01",
                "lastVerified": "2026-09-01",
                "notes": "[CURRENT] Kuwait has no VAT system as of 2026. Standard commercial invoice required with seller/buyer details and totals. [FUTURE/PROPOSED] Kuwait VAT introduction remains a future legislative proposal."
        }
],
        customValidate,
    };
}
