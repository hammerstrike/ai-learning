const vectorStore = require("./vectorStore");
const cosineSimilarity = require("./similarity");
const getEmbedding = require("../ai/embeddingClient");

async function retrieveRelevantLogs(query) {

  const queryEmbedding = await getEmbedding(query);

  const similarities = vectorStore.map(item => ({
    text: item.text,
    score: cosineSimilarity(queryEmbedding, item.embedding)
  }));

  similarities.sort((a,b) => b.score - a.score);

  return similarities.slice(0,3).map(item => item.text);
}

module.exports = retrieveRelevantLogs;
