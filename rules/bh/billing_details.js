/**
 * rules/bh/billing_details.js
 *
 * Country: Bahrain (BH)
 * Document Type: billing_details
 * Authority: National Bureau for Revenue (NBR) — Kingdom of Bahrain
 *
 * Bahrain IBAN: BH + 2 check + 4 bank + 14 digits = 22 chars.
 *
 * DISCLAIMER: Bahrain VAT is 10% (raised from 5% in January 2022). E-invoicing requirements are OFFICIAL_SPECIFICATION_UNAVAILABLE pending NBR mandate publication.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "BH",
        country_name: "Bahrain",
        document_type: "billing_details",
        currency: "BHD",
        vat_rate: 0.1,
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
                "code": "BH_BILLING_DETAILS_RULES",
                "status": "IMPLEMENTED",
                "authority": "National Bureau for Revenue (NBR) \u2014 Kingdom of Bahrain",
                "sourceTitle": "Central Bank of Bahrain \u2014 Payment Systems and Services Rulebook",
                "sourceUrl": "https://www.cbb.gov.bh/",
                "version": "2026-09",
                "publishedDate": "2019-01-01",
                "effectiveDate": "2019-01-01",
                "lastVerified": "2026-09-01",
                "notes": "Bahrain IBAN: BH + 2 check + 4 bank + 14 digits = 22 chars."
        }
],
        customValidate,
    };
}
