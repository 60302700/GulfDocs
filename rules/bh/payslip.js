/**
 * rules/bh/payslip.js
 *
 * Country: Bahrain (BH)
 * Document Type: payslip
 * Authority: Ministry of Labour / Labour Market Regulatory Authority (LMRA)
 *
 * Bahrain WPS mandates electronic payment of private sector workers' salaries through CBB-licensed retail banks. PDF payslips do not substitute for official WPS banking transfers.
 *
 * DISCLAIMER: Bahrain payroll requirements are governed by Bahrain Labour Law (Decree-Law No. 36 of 2012) and LMRA Wage Protection System regulations.
 */

export default function getRules(issueDate, transactionType = "B2B") {
    // Custom validate — runs inside engine.js for extra country/doc-specific checks
    function customValidate(_canonical) { return { errors: [], warnings: [] }; }

    return {
        country: "BH",
        country_name: "Bahrain",
        document_type: "payslip",
        currency: "BHD",
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
                code: "BH_WPS_TRANSFER_REQUIREMENT",
                description: "LMRA WPS requires salary disbursement through licensed financial institutions",
                status: "NOT_YET_IMPLEMENTED",
                field: "payment",
                authority: "Labour Market Regulatory Authority (LMRA)",
                sourceTitle: "LMRA Wage Protection System (Decree No. 68 of 2019)",
                sourceUrl: "https://lmra.gov.bh/",
                effectiveDate: "2019-09-01",
                notes: "Standard PDF payslip does not substitute for LMRA WPS electronic bank disbursement."
            }
        ],
        source_registry: [
            {
                "code": "BH_PAYSLIP_RULES",
                "status": "PARTIALLY_IMPLEMENTED",
                "authority": "Ministry of Labour / Labour Market Regulatory Authority (LMRA)",
                "sourceTitle": "Bahrain Labour Law for the Private Sector (Law No. 36 of 2012) and LMRA WPS Regulations",
                "sourceUrl": "https://lmra.gov.bh/",
                "version": "2026-09",
                "publishedDate": "2012-07-26",
                "effectiveDate": "2012-09-01",
                "lastVerified": "2026-09-01",
                "notes": "Bahrain WPS requires salary disbursement through licensed retail banks. Full WPS electronic integration not implemented."
            }
        ],
        customValidate,
    };
}
