const mongoose = require("mongoose");

const VariationSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  attribute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attribute",
    required: true,
  },
  variation: {
    type: String,
    required: true,
    trim: true,
  },
  sku: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    trim: true,
  },
  mrp: {
    type: Number,
    required: true,
    trim: true,
  },
  msp: {
    type: Number,
    required: true,
    trim: true,
  },
});

module.exports = mongoose.model("Product_Variation", VariationSchema);
