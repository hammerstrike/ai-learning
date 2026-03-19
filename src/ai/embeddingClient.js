const axios = require("axios");

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

module.exports = getEmbedding;