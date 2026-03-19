const retrieveRelevantLogs = require("../retrieval/retrieveLogs");
const generateLLMResponse = require("../ai/llmClient");

function extractJSON(aiText) {

  const jsonMatch = aiText.match(/\{[\s\S]*\}/);

  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return null;
}

async function analyzeLogs(logs) {

  const query = logs.join(" ");

  const relevantLogs = await retrieveRelevantLogs(query);

  const logsText = relevantLogs.join("\n");

  const prompt = `
You are a senior backend engineer.

Analyze the following system logs.

Return ONLY valid JSON.

{
  "likely_root_cause": "...",
  "related_errors": [],
  "severity": "...",
  "recommended_action": "..."
}

Logs:
${logsText}
`;

  const aiText = await generateLLMResponse(prompt);

  return extractJSON(aiText) || { raw_response: aiText };
}

module.exports = analyzeLogs;
