function formatQuoteForEmbedding(quote) {

  const productsText = quote.products
    .map(
      p => `Product name = ${p.name}, unitPrice = ${p.unitPrice}, quantity = ${p.quantity}, discount = ${p.discount}`
    )
    .join("\n");

  return `
Customer: ${quote.customerName}
Total Price: ${quote.totalPrice}
Products: ${productsText}
Status: ${quote.status}
Comment: ${quote.comment}
`;
}

module.exports = formatQuoteForEmbedding;
