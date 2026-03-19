const analyzeLogs = require("../services/logAnalysisService");

async function analyzeLogsController(req, res) {

  try {

    const { logs } = req.body;

    const result = await analyzeLogs(logs);

    res.json(result);

  } catch (error) {

    console.error(error);

    res.status(500).json({ error: "AI request failed" });

  }

}

module.exports = analyzeLogsController;
