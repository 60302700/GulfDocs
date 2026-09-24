/**
 * rules/bh/payslip.js
 *
 * Country: Bahrain (BH)
 * Document Type: payslip
 * Authority: National Bureau for Revenue (NBR) — Kingdom of Bahrain
 *
 * Bahrain WPS requires salary through approved channels. Full WPS integration not implemented.
 *
 * DISCLAIMER: Bahrain VAT is 10% (raised from 5% in January 2022). E-invoicing requirements are OFFICIAL_SPECIFICATION_UNAVAILABLE pending NBR mandate publication.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "BH",
        country_name: "Bahrain",
        document_type: "payslip",
        currency: "BHD",
        vat_rate: 0.1,
        has_vat: true,
        engine_status: "PARTIALLY_IMPLEMENTED",
        transaction_type: transactionType,
        effective_from: issueDate || new Date().toISOString().slice(0, 10),
        required_fields: [
        "employer.name",
        "employee.name",
        "payPeriod",
        "grossPay",
        "netPay"
],
        warning_fields: [
        "employee.id",
        "payment.bankAccount.bankName"
],
        extra_rules: [],
        source_registry: [
        {
                "code": "BH_PAYSLIP_RULES",
                "status": "PARTIALLY_IMPLEMENTED",
                "authority": "National Bureau for Revenue (NBR) \u2014 Kingdom of Bahrain",
                "sourceTitle": "Bahrain Labour Law \u2014 Legislative Decree No. 36 of 2012; WPS (Ministry of Labour)",
                "sourceUrl": "https://www.mlsd.gov.bh/",
                "version": "2026-09",
                "publishedDate": "2012-01-01",
                "effectiveDate": "2012-01-01",
                "lastVerified": "2026-09-01",
                "notes": "Bahrain WPS requires salary through approved channels. Full WPS integration not implemented."
        }
],
        customValidate,
    };
}
