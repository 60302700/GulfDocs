/**
 * rules/ae/payslip.js
 *
 * Country: United Arab Emirates (AE)
 * Document Type: payslip
 * Authority: Ministry of Human Resources and Emiratisation (MOHRE)
 *
 * UAE Wage Protection System (WPS) mandates salary disbursement via approved agents. Full WPS compliance requires MOHRE-approved payroll agent integration not yet implemented.
 *
 * DISCLAIMER: UAE payroll requirements are governed by Federal Decree-Law No. 33 of 2021 on Labour Relations and MOHRE WPS regulations. Generating a payslip document does not constitute WPS file submission.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "AE",
        country_name: "United Arab Emirates",
        document_type: "payslip",
        currency: "AED",
        vat_rate: 0.0,
        has_vat: false,
        engine_status: "PARTIALLY_IMPLEMENTED",
        transaction_type: transactionType,
        effective_from: issueDate || new Date().toISOString().slice(0, 10),
        required_fields: [
            "employer.name",
            "employee.name",
            "employee.id",
            "payPeriod",
            "grossPay",
            "netPay",
            "currency.code"
        ],
        warning_fields: [
            "payment.bankAccount.bankName"
        ],
        extra_rules: [
            {
                code: "AE_WPS_SIF_REQUIREMENT",
                description: "MOHRE WPS requires electronic salary file (.SIF) submission through approved UAE banks/exchange houses",
                status: "NOT_YET_IMPLEMENTED",
                field: "payment",
                authority: "Ministry of Human Resources and Emiratisation (MOHRE)",
                sourceTitle: "Ministerial Resolution No. 43 of 2022 Concerning the Wage Protection System",
                sourceUrl: "https://www.mohre.gov.ae/",
                effectiveDate: "2022-06-01",
                notes: "Standard PDF payslip does not substitute for MOHRE electronic SIF submission."
            }
        ],
        source_registry: [
            {
                "code": "AE_PAYSLIP_RULES",
                "status": "PARTIALLY_IMPLEMENTED",
                "authority": "Ministry of Human Resources and Emiratisation (MOHRE)",
                "sourceTitle": "UAE Labour Relations Law (Federal Decree-Law No. 33 of 2021) and MOHRE WPS Regulations",
                "sourceUrl": "https://www.mohre.gov.ae/",
                "version": "2026-09",
                "publishedDate": "2021-09-20",
                "effectiveDate": "2022-02-02",
                "lastVerified": "2026-09-01",
                "notes": "UAE Wage Protection System (WPS) mandates salary disbursement via approved agents. Full WPS compliance requires MOHRE-approved payroll agent integration not yet implemented."
            }
        ],
        customValidate,
    };
}
