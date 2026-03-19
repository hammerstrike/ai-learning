const generateLLMResponse = require("../ai/llmClient");

async function generateRejectionExplanation(quote) {

  const prompt = `
You are a CPQ approval assistant.

Explain why this quote was rejected in simple business language.

Quote:
${JSON.stringify(quote)}

Focus on key reasons like discount, product, or pricing.

Return only explanation text.
`;

  const response = await generateLLMResponse(prompt);

  return response;
}

module.exports = generateRejectionExplanation;