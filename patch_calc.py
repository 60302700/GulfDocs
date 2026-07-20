with open('scripts.js', 'r') as f:
    text = f.read()

# Fix calculateRow to also update the iframeDOM and add an updateItem function
calc_func_start = text.find('function calculateRow(index)')
calc_func_end = text.find('}', calc_func_start) + 1

new_calc = """// Shared updater for item inputs
function updateItemInvoice(index) {
    let iframeDoc = getIframeDOM();
    if (!iframeDoc) return;
    const setText = (id, val) => {
        let el = iframeDoc.getElementById(id);
        if (el) el.textContent = val;
    };
    
    setText(`out-product-${index}`, document.getElementById(`in-product-${index}`)?.value || 'Product');
    setText(`out-sku-${index}`, document.getElementById(`in-sku-${index}`)?.value || 'SKU');
    setText(`out-pack-${index}`, 'Pack: ' + (document.getElementById(`in-pack-${index}`)?.value || 'PK'));
    setText(`out-qty-${index}`, document.getElementById(`in-qty-${index}`)?.value || '0');
    setText(`out-price-${index}`, document.getElementById(`in-price-${index}`)?.value || '0');
    setText(`out-vat-${index}`, document.getElementById(`in-vat-${index}`)?.value || '0');
    setText(`out-total-${index}`, document.getElementById(`in-total-${index}`)?.value || '0');
}

function calculateRow(index) {
    let qty = parseFloat(document.getElementById(`in-qty-${index}`).value) || 0;
    let price = parseFloat(document.getElementById(`in-price-${index}`).value) || 0;
    let vat = parseFloat(document.getElementById(`in-vat-${index}`).value) || 0;

    let total = qty * price;
    if (vat > 0) {
        total += total * (vat / 100);
    }

    document.getElementById(`in-total-${index}`).value = total.toFixed(2);
    updateItemInvoice(index);
}
"""

text = text[:calc_func_start] + new_calc + text[calc_func_end:]

# And we also need to change `oninput="updateInvoice()"` in the item rows!
# The user's input placeholders call `updateInvoice()`. We should make them call `updateItemInvoice(${index})`!
import re
text = re.sub(r'oninput="updateInvoice\(\)"', r'oninput="updateItemInvoice(${index})"', text)


with open('scripts.js', 'w') as f:
    f.write(text)
