export class Address {
    constructor({ street = "", city = "", state = "", country = "", zip = "", raw = "" } = {}) {
        this.street = street;
        this.city = city;
        this.state = state;
        this.country = country;
        this.zip = zip;
        this.raw = raw;
    }
}

export class Contact {
    constructor({ phone = "", email = "", website = "", name = "" } = {}) {
        this.phone = phone;
        this.email = email;
        this.website = website;
        this.name = name;
    }
}

export class TaxIdentity {
    constructor({ taxId = "", taxIdType = "" } = {}) {
        this.taxId = taxId;
        this.taxIdType = taxIdType;
    }
}

export class Person {
    constructor({ name = "", id = "", role = "", contact = new Contact(), address = new Address() } = {}) {
        this.name = name;
        this.id = id;
        this.role = role;
        this.contact = contact;
        this.address = address;
    }
}

export class Company {
    constructor({ name = "", registrationNumber = "", taxIdentity = new TaxIdentity(), contact = new Contact(), address = new Address() } = {}) {
        this.name = name;
        this.registrationNumber = registrationNumber;
        this.taxIdentity = taxIdentity;
        this.contact = contact;
        this.address = address;
    }
}

export class BankAccount {
    constructor({ bankName = "", branch = "", accountName = "", accountNumber = "", iban = "", swiftBic = "" } = {}) {
        this.bankName = bankName;
        this.branch = branch;
        this.accountName = accountName;
        this.accountNumber = accountNumber;
        this.iban = iban;
        this.swiftBic = swiftBic;
    }
}

export class Tax {
    constructor({ category = "", rate = 0, amount = 0, taxableAmount = 0 } = {}) {
        this.category = category;
        this.rate = rate; // as percentage, e.g. 5 for 5%
        this.amount = amount;
        this.taxableAmount = taxableAmount;
    }
}

export class Discount {
    constructor({ reason = "", amount = 0, rate = 0 } = {}) {
        this.reason = reason;
        this.amount = amount;
        this.rate = rate;
    }
}

export class LineItem {
    constructor({
        id = "",
        description = "",
        code = "", // SKU/Item code
        quantity = 0,
        unit = "EA",
        unitPrice = 0,
        discount = new Discount(),
        tax = new Tax(),
        netAmount = 0, // before tax
        totalAmount = 0 // after tax
    } = {}) {
        this.id = id;
        this.description = description;
        this.code = code;
        this.quantity = quantity;
        this.unit = unit;
        this.unitPrice = unitPrice;
        this.discount = discount;
        this.tax = tax;
        this.netAmount = netAmount;
        this.totalAmount = totalAmount;
    }
}

export class Payment {
    constructor({ bankAccount = new BankAccount(), terms = "", method = "", reference = "", status = "" } = {}) {
        this.bankAccount = bankAccount;
        this.terms = terms;
        this.method = method;
        this.reference = reference;
        this.status = status;
    }
}

export class Currency {
    constructor({ code = "QAR", exchangeRate = 1 } = {}) {
        this.code = code;
        this.exchangeRate = exchangeRate;
    }
}

export class DocumentReference {
    constructor({ id = "", type = "", issueDate = "" } = {}) {
        this.id = id;
        this.type = type;
        this.issueDate = issueDate;
    }
}

export class CanonicalDocument {
    constructor({
        id = "",
        documentType = "",
        country = "",
        language = "en",
        currency = new Currency(),
        issueDate = "",
        dueDate = "",
        validUntil = "",
        seller = new Company(),
        buyer = new Company(), // Or Person
        employer = new Company(),
        employee = new Person(),
        items = [], // LineItem[]
        taxes = [], // Tax[]
        total = {
            subtotal: 0,
            discount: 0,
            taxableAmount: 0,
            tax: 0,
            grandTotal: 0,
            amountPaid: 0,
            amountDue: 0
        },
        payment = new Payment(),
        references = [], // DocumentReference[]
        notes = ""
    } = {}) {
        this.id = id;
        this.documentType = documentType;
        this.country = country;
        this.language = language;
        this.currency = currency;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.validUntil = validUntil;
        this.seller = seller;
        this.buyer = buyer;
        this.employer = employer;
        this.employee = employee;
        this.items = items;
        this.taxes = taxes;
        this.total = total;
        this.payment = payment;
        this.references = references;
        this.notes = notes;
    }
}
