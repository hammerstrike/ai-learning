const detectIntent = require("../ai/intentClassifier");
const { getPendingQuotes, getRejectedQuotes, getQuoteById } = require("./quoteService");
const generateRejectionExplanation = require("./explanationService");

async function handleAgentQuery(query) {

  const result = await detectIntent(query);

  const intent = result.intent;
  const quoteId = result.quoteId;

  console.log("Detected intent:", intent);

  if (intent === "GET_PENDING_QUOTES") {
    return {
      type: "pending_quotes",
      quotes: getPendingQuotes()
    };
  }

  if (intent === "GET_REJECTED_QUOTES") {
    return {
      type: "rejected_quotes",
      quotes: getRejectedQuotes()
    };
  }

  if (intent === "EXPLAIN_REJECTION") {

    const quote = getQuoteById(quoteId);

    if (!quote) {
      return { message: "Quote not found" };
    }

    const explanation = await generateRejectionExplanation(quote);

    return {
      type: "rejection_explanation",
      quoteId,
      explanation
    };
  }

  return {
    message: "Sorry, I did not understand the request"
  };
}

module.exports = handleAgentQuery;