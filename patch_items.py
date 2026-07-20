import re

with open('scripts.js', 'r') as f:
    text = f.read()

# Fix additems
add_func_start = text.find('function additems()')
add_func_end = text.find('function removeitems()', add_func_start)
add_func = text[add_func_start:add_func_end]

# Modify the end part of additems
new_add_end = """
    // Using insertAdjacentHTML ensures you don't overwrite existing text typed into previous inputs
    container.insertAdjacentHTML('beforeend', html);
    
    let iframeDoc = getIframeDOM();
    if (iframeDoc) {
        let tbody = iframeDoc.getElementById('item-box-invoice');
        if (tbody) {
            let newRow = iframeDoc.createElement('tr');
            newRow.id = `iframe-row-${index}`;
            newRow.innerHTML = `
                <td>
                    <div style="font-weight: 700; margin-bottom: 4px;" id="out-product-${index}">Product</div>
                    <div style="font-size: 12px; color: var(--secondary);" id="out-pack-${index}">Pack: PK</div>
                </td>
                <td id="out-sku-${index}">SKU</td>
                <td id="out-qty-${index}">Qty</td>
                <td id="out-price-${index}">Unit Price</td>
                <td id="out-vat-${index}">VAT</td>
                <td style="text-align:right" id="out-total-${index}">Total</td>
            `;
            tbody.appendChild(newRow);
            
            // Adjust Calculate/UpdateRow for this new item to map via DOM
        }
    }
}
"""
add_func = re.sub(r"    container\.insertAdjacentHTML\('beforeend', html\);.*}$", new_add_end.strip() + '\n}\n\n', add_func, flags=re.DOTALL)

text = text[:add_func_start] + add_func + text[add_func_end:]


remove_func_start = text.find('function removeitems()')
remove_func_end = text.find('// Added this function', remove_func_start)
new_remove = """function removeitems() {
    let container = document.getElementById("items-container");
    if (container.lastElementChild) {
        container.removeChild(container.lastElementChild);
    }
    
    let iframeDoc = getIframeDOM();
    if (iframeDoc) {
        let tbody = iframeDoc.getElementById('item-box-invoice');
        if (tbody && tbody.lastElementChild) {
            tbody.removeChild(tbody.lastElementChild);
        }
    }
}
"""
text = text[:remove_func_start] + new_remove + '\n' + text[remove_func_end:]

with open('scripts.js', 'w') as f:
    f.write(text)
