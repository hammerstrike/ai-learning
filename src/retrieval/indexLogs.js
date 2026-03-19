const logsDatabase = require("../data/logs");
const vectorStore = require("./vectorStore");
const getEmbedding = require("../ai/embeddingClient");

async function indexLogs() {

  for (const log of logsDatabase) {

    const embedding = await getEmbedding(log);

    vectorStore.push({
      text: log,
      embedding
    });

  }

  console.log("Logs indexed:", vectorStore.length);

}

module.exports = indexLogs;
