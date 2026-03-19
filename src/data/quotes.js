const pendingQuotes = [
  {
    id: "Q1",
    customerName: "ABC Corp",
    totalPrice: 120000,
    status: "Pending",
    products: [
      { name: "Laptop", category: "Hardware", price: 80000, quantity: 10, discount: 25 },
      { name: "Support Plan", category: "Service", price: 40000, quantity: 1, discount: 10 }
    ]
  },
  {
    id: "Q2",
    customerName: "XYZ Ltd",
    totalPrice: 80000,
    status: "Pending",
    products: [
      { name: "Printer", category: "Hardware", price: 60000, quantity: 5, discount: 10 },
      { name: "Installation", category: "Service", price: 20000, quantity: 1, discount: 5 }
    ]
  },
  {
    id: "Q3",
    customerName: "GlobalTech",
    totalPrice: 200000,
    status: "Pending",
    products: [
      { name: "Server", category: "Hardware", price: 150000, quantity: 2, discount: 30 },
      { name: "Maintenance", category: "Service", price: 50000, quantity: 1, discount: 15 }
    ]
  }
];

const historicalQuotes = [
  {
    id: "H1",
    customerName: "ABC Corp",
    totalPrice: 120000,
    status: "Rejected",
    comment: "Discount exceeded",
    products: [
      { name: "Laptop", discount: 25 }
    ]
  },
  {
    id: "H2",
    customerName: "XYZ Ltd",
    totalPrice: 80000,
    status: "Approved",
    comment: "Within limits",
    products: [
      { name: "Printer", discount: 10 }
    ]
  }
];

module.exports = {
  pendingQuotes,
  historicalQuotes
};