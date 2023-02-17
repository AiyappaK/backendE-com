const mongoose = require("mongoose");

const OptionsValuesSchema = new mongoose.Schema({
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
  value_no: {
    type: Number,
    required: true,
  },
  value: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
    maxLength: [50, "Name cannot be more than 50 characters"],
  },
});

module.exports = mongoose.model("Product_options_values", OptionsValuesSchema);
