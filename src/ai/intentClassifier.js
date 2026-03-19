const generateLLMResponse = require("./llmClient");

async function detectIntent(query) {

  const prompt = `
You are an AI assistant.

Classify the user query into one of the following intents:

1. GET_PENDING_QUOTES
2. GET_REJECTED_QUOTES
3. EXPLAIN_REJECTION
4. UNKNOWN

Return ONLY JSON like:
{ "intent": "EXPLAIN_REJECTION", "quoteId": "Q1" }

Query:
${query}
`;
  console.log("Prompt", prompt);
  const response = await generateLLMResponse(prompt);
  console.log("response", response);
  const match = response.match(/\{[\s\S]*\}/);

  if (match) {
    return JSON.parse(match[0]);
  }

  return { intent: "UNKNOWN" };
}

module.exports = detectIntent;