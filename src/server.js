const express = require("express");

const aiRoutes = require("./routes/aiRoutes");
const indexLogs = require("./retrieval/indexLogs");
const app = express();

app.use(express.json());

app.use("/ai", aiRoutes);

app.listen(3000, async () => {

  console.log("AI server running on port 3000");
  // await indexLogs();

});
