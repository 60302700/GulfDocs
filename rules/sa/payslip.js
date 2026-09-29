/**
 * rules/sa/payslip.js
 *
 * Country: Saudi Arabia (SA)
 * Document Type: payslip
 * Authority: Ministry of Human Resources and Social Development (MHRSD)
 *
 * Saudi Wage Protection System (WPS) mandates salary payment through approved financial institutions and monthly payroll reporting via Mudad. Generating a PDF payslip does not constitute Mudad WPS compliance.
 *
 * DISCLAIMER: Saudi payroll requirements are governed by Saudi Labour Law (Royal Decree No. M/51) and MHRSD WPS regulations. Generating a payslip document does not constitute Mudad file upload or compliance.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "SA",
        country_name: "Saudi Arabia",
        document_type: "payslip",
        currency: "SAR",
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
                code: "SA_WPS_MUDAD_REQUIREMENT",
                description: "Saudi WPS requires monthly salary file processing through Mudad / banking channels",
                status: "NOT_YET_IMPLEMENTED",
                field: "payment",
                authority: "Ministry of Human Resources and Social Development (MHRSD)",
                sourceTitle: "MHRSD Wage Protection Program Regulations and Mudad Platform Integration",
                sourceUrl: "https://mudad.com.sa/",
                effectiveDate: "2020-11-01",
                notes: "Standard PDF payslips do not satisfy the Mudad electronic salary upload requirement."
            }
        ],
        source_registry: [
            {
                "code": "SA_PAYSLIP_RULES",
                "status": "PARTIALLY_IMPLEMENTED",
                "authority": "Ministry of Human Resources and Social Development (MHRSD)",
                "sourceTitle": "Saudi Labour Law (Royal Decree No. M/51) and MHRSD Wage Protection System",
                "sourceUrl": "https://www.hrsd.gov.sa/",
                "version": "2026-09",
                "publishedDate": "2005-09-27",
                "effectiveDate": "2005-09-27",
                "lastVerified": "2026-09-01",
                "notes": "Saudi WPS (Wage Protection System) requires salary payment through approved channels and monthly reporting via Mudad. Full WPS compliance requires HRSD-approved integration."
            }
        ],
        customValidate,
    };
}
