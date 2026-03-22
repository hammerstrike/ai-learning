const generateLLMResponse = require("../ai/llmClient");
const retrieveSimilarQuotes = require("../retrieval/retrieveQuotes");

async function generateRejectionExplanation(quote) {

  const queryText = JSON.stringify(quote);

  const similarQuotes = await retrieveSimilarQuotes(queryText);

  const prompt = `
You are a CPQ approval assistant.

Given the current quote and similar past quotes, explain why this quote was rejected.

Current Quote:
${JSON.stringify(quote)}

Similar Quotes:
${JSON.stringify(similarQuotes)}

Explain clearly in business terms.
`;
  console.log("prompt", prompt);
  const response = await generateLLMResponse(prompt);

  return response;
}

module.exports = generateRejectionExplanation;