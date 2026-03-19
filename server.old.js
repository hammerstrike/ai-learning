const express = require("express");
const axios = require("axios");

const logsDatabase = [
  "Database timeout occurred while connecting to primary DB",
  "JWT signature verification failed",
  "Authentication service unavailable",
  "User session expired due to inactivity",
  "Database connection pool exhausted",
  "Invalid JWT token detected"
];
const vectorStore = [];


const app = express();
app.use(express.json());

app.post("/ai/explain", async (req, res) => {
  try {
    const { question } = req.body;

    const prompt = `
You are a senior software engineer.

Explain the following concept in simple terms.
Use bullet points.

Question:
${question}
`;

    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3",
        prompt: prompt,
        stream: false
      }
    );

    res.json({
      answer: response.data.response
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI request failed" });
  }
});

app.post("/ai/explain-stream", async (req, res) => {
  const { question } = req.body;

  const prompt = `
  You are a senior software engineer.
  
  Explain the following concept in simple terms.
  Use bullet points.
  
  Question:
  ${question}
  `;
  try {

    const response = await axios({
      method: "post",
      url: "http://localhost:11434/api/generate",
      data: {
        model: "llama3",
        prompt: prompt,
        stream: true
      },
      responseType: "stream"
    });

    response.data.on("data", chunk => {
      res.write(chunk);
    });

    response.data.on("end", () => {
      res.end();
    });


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI request failed" });
  }
});

app.post("/ai/analyze-log", async (req, res) => {
  try {
    const { log } = req.body;

    const prompt = `
You are a backend system.

Analyze the following error log.

Return ONLY valid JSON.
Ensure the JSON is complete and closed with }.
Do not include explanation.
Do not include markdown.
Do not include code blocks.

Expected format:

{
  "error_type": "...",
  "severity": "...",
  "root_cause": "...",
  "suggested_fix": "..."
}

Log:
${log}
`;

    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3",
        prompt: prompt,
        stream: false,
        options: {
          num_predict: 200
        }
      }
    );

    const aiText = response.data.response;
    console.log("AI RESPONSE:", aiText);
    let parsed = null;

    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.error("JSON parsing failed:", err);
    }

    if (parsed) {
      res.json(parsed);
    } else {
      res.json({
        raw_response: aiText
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI request failed" });
  }
});

app.post("/ai/analyze-logs", async (req, res) => {

  try {

    const { logs } = req.body;

    const logsText = logs.join("\n");

    const prompt = `
You are a senior backend engineer.

Analyze the following system logs together.

Return ONLY valid JSON with the following fields:
likely_root_cause
related_errors
severity
recommended_action

Ensure the JSON ends with }.

Logs:
${logsText}
`;

    const aiText = await generateLLMResponse(prompt);

    const parsed = extractJSON(aiText);

    res.json(parsed || { raw_response: aiText });

  } catch (error) {

    console.error(error);

    res.status(500).json({ error: "AI request failed" });

  }

});

app.post("/ai/rag/analyze-logs", async (req, res) => {

  try {

    const { logs } = req.body;
    const relevantLogs = await retrieveRelevantLogs(logs.join(" "));
    console.log("Retrieved logs:", relevantLogs);
    const logsText = relevantLogs.join("\n");

    const prompt = `
You are a senior backend engineer.

Analyze the following system logs together.

Return ONLY valid JSON with the following fields:
likely_root_cause
related_errors
severity
recommended_action

Ensure the JSON ends with }.

Logs:
${logsText}
`;
    console.log("prompt ->", prompt);
    const aiText = await generateLLMResponse(prompt);

    const parsed = extractJSON(aiText);

    res.json(parsed || { raw_response: aiText });

  } catch (error) {

    console.error(error);

    res.status(500).json({ error: "AI request failed" });

  }

});

app.listen(3000, async () => {
  console.log("AI server running on port 3000");
  // Index Logs at Server Startup 
  await indexLogs();
});

async function indexLogs() {

  for (const log of logsDatabase) {

    const embedding = await getEmbedding(log);

    vectorStore.push({
      text: log,
      embedding: embedding
    });

  }

  console.log("Logs indexed:", vectorStore.length);
   
  // test retrieval
  // const test = await retrieveRelevantLogs("authentication failed");
  // console.log("Relevant logs:", test);
}

function cosineSimilarity(a, b) {

  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);

  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  return dot / (magA * magB);
}

async function retrieveRelevantLogs(query) {

  const queryEmbedding = await getEmbedding(query);

  const similarities = vectorStore.map(item => ({
    text: item.text,
    score: cosineSimilarity(queryEmbedding, item.embedding)
  }));

  console.log("Similarity scores:", similarities);
  
  return similarities
  .sort((a, b) => b.score - a.score)
  //.filter(item => item.score > 0.75)
  .slice(0, 3)
  .map(item => item.text);

}

async function getEmbedding(text) {

  const response = await axios.post(
    "http://localhost:11434/api/embeddings",
    {
      model: "llama3",
      prompt: text
    }
  );

  return response.data.embedding;
}

function extractJSON(aiText) {

  try {

    const jsonMatch = aiText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

  } catch (err) {

    console.error("JSON parse error:", err);

  }

  return null;
}

async function generateLLMResponse(prompt) {

  const response = await axios.post(
    "http://localhost:11434/api/generate",
    {
      model: "llama3",
      prompt: prompt,
      stream: false
    }
  );

  return response.data.response;
}



