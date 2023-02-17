const mongoose = require("mongoose");
let ItemSchema = {
  brands: {
    type: mongoose.Schema.ObjectId,
    ref: "Brand",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity can not be less then 1."],
  },
  price: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
};
const orderSchema = new mongoose.Schema({
  items: [ItemSchema],
  Address: {
    type: String,
  },
  OrderPlacedDate: {
    type: Date,
    default: Date.now,
  },
  InvoiceNumber: {
    type: String,
    required: true,
  },
  CustomerID: {
    type: mongoose.Schema.ObjectId,
    ref: "Customer",
    required: true,
  },
  status: {
    type: String,
    enum: ["processing", "shipping", "delivered"],
    default: "processing",
  },
});

module.exports = mongoose.model("Order", orderSchema);
