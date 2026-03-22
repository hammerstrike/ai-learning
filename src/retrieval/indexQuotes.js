const vectorStore = require("./vectorStore");
const getEmbedding = require("../ai/embeddingClient");
const { historicalQuotes } = require("../data/quotes");
const formatQuoteForEmbedding = require("./quoteFormatter");

async function indexQuotes() {

  for (const quote of historicalQuotes) {

    const text = formatQuoteForEmbedding(quote);
    console.log(text);
    const embedding = await getEmbedding(text);

    vectorStore.push({
      text,
      embedding,
      metadata: quote
    });
  }

  console.log("Quotes indexed:", vectorStore.length);
}

module.exports = indexQuotes;