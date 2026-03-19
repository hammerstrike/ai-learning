const { pendingQuotes, historicalQuotes } = require("../data/quotes");

function getPendingQuotes() {
  return pendingQuotes;
}

function getRejectedQuotes() {
  return historicalQuotes.filter(q => q.status === "Rejected");
}

function getQuoteById(id) {
  return historicalQuotes.find(q => q.id === id);
}

module.exports = {
  getPendingQuotes,
  getRejectedQuotes,
  getQuoteById
};