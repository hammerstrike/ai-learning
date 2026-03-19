const express = require("express");
const analyzeLogsController = require("../controllers/logController");
const agentController = require("../controllers/agentController");


const router = express.Router();

router.post("/analyze-logs", analyzeLogsController);
router.post("/agent", agentController);

module.exports = router;
