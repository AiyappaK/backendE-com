const mongoose = require("mongoose");

const OptionsSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  option_no: {
    type: Number,
    required: true,
  },
  option: {
    type: String,
    required: [true, "Please add a option_name"],
    trim: true,
    maxLength: [10, "Name cannot be more than 10 characters"],
  },
});

module.exports = mongoose.model("Product_options", OptionsSchema);
