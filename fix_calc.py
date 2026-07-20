with open('scripts.js', 'r') as f:
    text = f.read()

# We look for the start of `function calculateRow(index)` and keep it clean
start = text.find('function calculateRow(index)')

# The extra broken code is `).value) || 0; ...` at line 530.
# Let's just find the end of the second duplicate block!
end = text.find('}', start + 300) + 1  # Find the second closing brace after start.

new_calc = """function calculateRow(index) {
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

# Replace the whole chunk
# Wait, let's just strip everything from `function calculateRow(index)` to the end of the file, because it's the last function in scripts.js anyway.
text = text[:start] + new_calc

with open('scripts.js', 'w') as f:
    f.write(text)
