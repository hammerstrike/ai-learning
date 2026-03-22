const pendingQuotes = [
  {
    id: "Q1",
    customerName: "CustomerA",
    totalPrice: 41280,
    status: "Pending",
    products: [
      { name: "HDD", unitPrice: 12000, quantity: 4, discount: 11 }
    ]
  }
];
const historicalQuotes = [

  // 🔴 Customer A behavior
  {
    id: "H1",
    customerName: "CustomerA",
    totalPrice: 66000,
    status: "Rejected",
    comment: "Discount level was too high and margin did not meet policy.",
    products: [
      { name: "HDD", unitPrice: 12000, quantity: 3, discount: 25 },
      { name: "CPU", unitPrice: 22000, quantity: 1, discount: 25 },
      { name: "RAM", unitPrice: 6000, quantity: 5, discount: 25 },
    ]
  },
  {
    id: "H2",
    customerName: "CustomerA",
    totalPrice: 70400,
    status: "Rejected",
    comment: "Combined product discounts exceeded approval threshold.",
    products: [
      { name: "HDD", unitPrice: 12000, quantity: 3, discount: 20 },
      { name: "CPU", unitPrice: 22000, quantity: 1, discount: 20 },
      { name: "RAM", unitPrice: 6000, quantity: 5, discount: 20 },
    ]
  },{
    id: "H3",
    customerName: "CustomerA",
    totalPrice: 79200,
    status: "Approved",
    comment: "Discounts were within acceptable range for this customer tier.",
    products: [
      { name: "HDD", unitPrice: 12000, quantity: 3, discount: 10 },
      { name: "CPU", unitPrice: 22000, quantity: 1, discount: 10 },
      { name: "RAM", unitPrice: 6000, quantity: 5, discount: 10 },
    ]
  },{
    id: "H4",
    customerName: "CustomerB",
    totalPrice: 123200,
    status: "Accepted",
    comment: "Higher total value justified requested discount structure.",
    products: [
      { name: "HDD", unitPrice: 15000, quantity: 4, discount: 20 },
      { name: "CPU", unitPrice: 26000, quantity: 2, discount: 20 },
      { name: "RAM", unitPrice: 7000, quantity: 6, discount: 20 },
    ]
  }
];
module.exports = {
  pendingQuotes,
  historicalQuotes
};
