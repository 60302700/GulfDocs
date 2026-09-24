/**
 * rules/bh/quotation.js
 *
 * Country: Bahrain (BH)
 * Document Type: quotation
 * Authority: National Bureau for Revenue (NBR) — Kingdom of Bahrain
 *
 * No Bahrain-specific e-quotation mandate verified.
 *
 * DISCLAIMER: Bahrain VAT is 10% (raised from 5% in January 2022). E-invoicing requirements are OFFICIAL_SPECIFICATION_UNAVAILABLE pending NBR mandate publication.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "BH",
        country_name: "Bahrain",
        document_type: "quotation",
        currency: "BHD",
        vat_rate: 0.1,
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
                "code": "BH_QUOTATION_RULES",
                "status": "IMPLEMENTED",
                "authority": "National Bureau for Revenue (NBR) \u2014 Kingdom of Bahrain",
                "sourceTitle": "Bahrain Commercial Companies Law (Legislative Decree No. 21 of 2001)",
                "sourceUrl": "https://www.moic.gov.bh/",
                "version": "2026-09",
                "publishedDate": "2001-01-01",
                "effectiveDate": "2001-01-01",
                "lastVerified": "2026-09-01",
                "notes": "No Bahrain-specific e-quotation mandate verified."
        }
],
        customValidate,
    };
}
