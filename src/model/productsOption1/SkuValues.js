const mongoose = require("mongoose");

const SkuValuesSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  option_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product_options",
    required: true,
  },
  sku_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product_sku",
    required: true,
  },
  value_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product_options_values",
    required: true,
  },
});

module.exports = mongoose.model("Product_sku_values", SkuValuesSchema);
