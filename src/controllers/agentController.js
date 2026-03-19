const handleAgentQuery = require("../services/agentService");

async function agentController(req, res) {

  try {
    const { query } = req.body;

    const result = await handleAgentQuery(query);

    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Agent failed" });
  }

}

module.exports = agentController;