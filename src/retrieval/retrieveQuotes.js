const vectorStore = require("./vectorStore");
const cosineSimilarity = require("./similarity");
const getEmbedding = require("../ai/embeddingClient");

async function retrieveSimilarQuotes(queryText) {

  const queryEmbedding = await getEmbedding(queryText);

  const similarities = vectorStore.map(item => ({
    metadata: item.metadata,
    score: cosineSimilarity(queryEmbedding, item.embedding)
  }));

  const topMatches = similarities
    .filter(item => item.score > 0.8)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return topMatches.map(item => item.metadata);
}

module.exports = retrieveSimilarQuotes;
