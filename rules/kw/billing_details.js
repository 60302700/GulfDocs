/**
 * rules/kw/billing_details.js
 *
 * Country: Kuwait (KW)
 * Document Type: billing_details
 * Authority: Kuwait Ministry of Finance / General Administration of Customs
 *
 * Kuwait IBAN: KW + 2 check + 4 alpha + 22 digits = 30 chars.
 *
 * DISCLAIMER: Kuwait does not currently impose VAT (as of 2026). A GCC-wide VAT framework was agreed upon but Kuwait has not enacted domestic VAT legislation. Rules reflect CURRENT requirements only.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "KW",
        country_name: "Kuwait",
        document_type: "billing_details",
        currency: "KWD",
        vat_rate: 0.0,
        has_vat: false,
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
                "code": "KW_BILLING_DETAILS_RULES",
                "status": "IMPLEMENTED",
                "authority": "Kuwait Ministry of Finance / General Administration of Customs",
                "sourceTitle": "Central Bank of Kuwait \u2014 Payment Systems and Oversight",
                "sourceUrl": "https://www.cbk.gov.kw/",
                "version": "2026-09",
                "publishedDate": "2019-01-01",
                "effectiveDate": "2019-01-01",
                "lastVerified": "2026-09-01",
                "notes": "Kuwait IBAN: KW + 2 check + 4 alpha + 22 digits = 30 chars."
        }
],
        customValidate,
    };
}
