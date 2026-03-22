const retrieveSimilarQuotes = require("../retrieval/retrieveQuotes");
const formatQuoteForEmbedding = require("../retrieval/quoteFormatter");

function getNormalizedNumberSimilarity(a, b) {
  if (typeof a !== "number" || typeof b !== "number") {
    return null;
  }

  const maxAbs = Math.max(Math.abs(a), Math.abs(b), 1);
  return Math.max(0, 1 - Math.abs(a - b) / maxAbs);
}

function getValueSimilarity(a, b) {
  const numericSimilarity = getNormalizedNumberSimilarity(a, b);
  if (numericSimilarity !== null) {
    return numericSimilarity;
  }

  if (typeof a === "string" && typeof b === "string") {
    return a.toLowerCase() === b.toLowerCase() ? 1 : 0;
  }

  if (typeof a === "boolean" && typeof b === "boolean") {
    return a === b ? 1 : 0;
  }

  return 0;
}

function getProductSimilarity(targetProduct, candidateProduct) {
  const keys = new Set([
    ...Object.keys(targetProduct || {}),
    ...Object.keys(candidateProduct || {})
  ]);
  keys.delete("name");

  if (keys.size === 0) {
    return 1;
  }

  let total = 0;
  let count = 0;

  for (const key of keys) {
    total += getValueSimilarity(targetProduct[key], candidateProduct[key]);
    count += 1;
  }

  return count > 0 ? total / count : 0;
}

function getProductsSimilarity(targetProducts = [], candidateProducts = []) {
  if (!targetProducts.length && !candidateProducts.length) {
    return 1;
  }

  const targetMap = new Map(
    targetProducts
      .filter(product => product && product.name)
      .map(product => [product.name.toLowerCase(), product])
  );
  const candidateMap = new Map(
    candidateProducts
      .filter(product => product && product.name)
      .map(product => [product.name.toLowerCase(), product])
  );

  const targetNames = new Set(targetMap.keys());
  const candidateNames = new Set(candidateMap.keys());

  const unionNames = new Set([...targetNames, ...candidateNames]);
  if (unionNames.size === 0) {
    return 0;
  }

  const sharedNames = [...targetNames].filter(name => candidateNames.has(name));
  const nameOverlapScore = sharedNames.length / unionNames.size;

  if (sharedNames.length === 0) {
    return nameOverlapScore;
  }

  let propertySimilarityTotal = 0;
  for (const name of sharedNames) {
    propertySimilarityTotal += getProductSimilarity(
      targetMap.get(name),
      candidateMap.get(name)
    );
  }

  const propertySimilarityScore = propertySimilarityTotal / sharedNames.length;
  return (nameOverlapScore + propertySimilarityScore) / 2;
}

function getQuoteLevelSimilarity(targetQuote, candidateQuote) {
  const excludedKeys = new Set(["id", "status", "products", "comment"]);
  const keys = new Set([
    ...Object.keys(targetQuote || {}),
    ...Object.keys(candidateQuote || {})
  ]);

  let total = 0;
  let count = 0;

  for (const key of keys) {
    if (excludedKeys.has(key)) {
      continue;
    }

    total += getValueSimilarity(targetQuote[key], candidateQuote[key]);
    count += 1;
  }

  return count > 0 ? total / count : 0;
}

function getOverallQuoteSimilarity(targetQuote, candidateQuote) {
  const quoteLevelScore = getQuoteLevelSimilarity(targetQuote, candidateQuote);
  const productsScore = getProductsSimilarity(
    targetQuote.products,
    candidateQuote.products
  );

  return (quoteLevelScore + productsScore) / 2;
}

async function predictQuoteOutcome(quote) {

  const queryText = formatQuoteForEmbedding(quote);

  const similarQuotes = await retrieveSimilarQuotes(queryText);
  
  // ✅ handle no data
  if (similarQuotes.length === 0) {
    return {
      prediction: "Insufficient Data",
      confidence: "Low",
      reason: "No similar historical quotes were found above the similarity threshold.",
      based_on: []
    };
  }

  const customerMatchedQuotes = similarQuotes.filter(
    q => q.customerName === quote.customerName
  );
  const quotesForPrediction =
    customerMatchedQuotes.length > 0 ? customerMatchedQuotes : similarQuotes;

  const approvedStatuses = new Set(["Approved", "Accepted"]);
  const approvedCount = quotesForPrediction.filter(q => approvedStatuses.has(q.status)).length;
  const rejectedCount = quotesForPrediction.filter(q => q.status === "Rejected").length;

  let prediction = "Needs Review";   // default
  let confidence = "Low";            // ✅ define it
  let reason = "Approved and rejected signals are balanced with no strong deciding pattern.";

  if (rejectedCount > approvedCount) {
    prediction = "Likely Rejected";
    confidence = rejectedCount >= 2 ? "High" : "Medium";
    reason = `Majority outcome in similar quotes is Rejected (${rejectedCount} rejected vs ${approvedCount} approved).`;
  } else if (approvedCount > rejectedCount) {
    prediction = "Likely Approved";
    confidence = approvedCount >= 2 ? "High" : "Medium";
    reason = `Majority outcome in similar quotes is Approved/Accepted (${approvedCount} approved vs ${rejectedCount} rejected).`;
  } else if (approvedCount > 0 && rejectedCount > 0) {
    // Tie-breaker: pick the closest quote using quote-level + product-level similarity.
    const nearestQuote = quotesForPrediction.reduce((best, current) => {
      const currentSimilarity = getOverallQuoteSimilarity(quote, current);

      if (!best || currentSimilarity > best.similarity) {
        return { quote: current, similarity: currentSimilarity };
      }

      return best;
    }, null);

    if (nearestQuote) {
      prediction = approvedStatuses.has(nearestQuote.quote.status)
        ? "Likely Approved"
        : "Likely Rejected";
      confidence = nearestQuote.similarity >= 0.85 ? "High" : "Medium";
      reason = `Vote was tied (${approvedCount}-${rejectedCount}), so tie-break used closest historical quote ${nearestQuote.quote.id} (${nearestQuote.quote.status}) with similarity ${nearestQuote.similarity.toFixed(2)}.`;
    }
  }

  return {
    prediction,
    confidence,
    reason,
    based_on: quotesForPrediction.map(q => ({
      id: q.id,
      status: q.status
      //...q
    }))
  };
}

module.exports = predictQuoteOutcome;
