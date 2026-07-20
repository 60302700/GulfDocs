import re

with open('scripts.js', 'r') as f:
    text = f.read()

text = text.replace('<h1>{Brand Name}</h1>', '<h1 id="out-brand">{Brand Name}</h1>')
text = text.replace('<p>{City}, {Country}</p>', '<p><span id="out-city">{City}</span>, <span id="out-country">{Country}</span></p>')
text = text.replace('<p>VAT: {VAT/TRN} | {Email}</p>', '<p>VAT: <span id="out-trn">{VAT/TRN}</span> | <span id="out-email">{Email}</span></p>')
text = text.replace('<p>Phone: {Phone}</p>', '<p>Phone: <span id="out-biz-phone">{Phone}</span></p>')

text = text.replace('<span>#{Invoice #}</span>', '<span id="out-invoice-num">#{Invoice #}</span>')
text = text.replace('<span>{Date}</span>', '<span id="out-date">{Date}</span>')
text = text.replace('<span>{Order ID}</span>', '<span id="out-order-id">{Order ID}</span>')
text = text.replace('<span>{Time}</span>', '<span id="out-time">{Time}</span>')

text = text.replace('<b>{Name}</b>', '<b id="out-client">{Name}</b>')
# Customer details: <div class="info-item">{Phone}</div> (first one)
# There are two {Phone} - one in header, one in client.
text = re.sub(r'<div class="info-item">\{Phone\}</div>', '<div class="info-item" id="out-client-phone">{Phone}</div>', text)
text = re.sub(r'<div class="info-item">\{Email\}</div>', '<div class="info-item" id="out-client-email">{Email}</div>', text)
text = text.replace('{Address}\n                </div>', '<span id="out-cust-address">{Address}</span>\n                </div>')

text = text.replace('{Payment Method}', '<span id="out-pay-method">{Payment Method}</span>')
text = text.replace('{Delivery Type}', '<span id="out-del-type">{Delivery Type}</span>')

text = text.replace('<span>{Subtotal}</span>', '<span id="out-subtotal">{Subtotal}</span>')
text = text.replace('<span>{VAT}</span>', '<span id="out-vat">{VAT}</span>')
text = text.replace('<span>{Delivery Fee}</span>', '<span id="out-del-fee">{Delivery Fee}</span>')
text = text.replace('<span>-{Discount}</span>', '<span id="out-discount">-{Discount}</span>')
text = text.replace('<span>{Grand Total}</span>', '<span id="out-grand-total">{Grand Total}</span>')

with open('scripts.js', 'w') as f:
    f.write(text)
