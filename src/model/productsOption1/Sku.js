const mongoose = require("mongoose");

const ProductSkuSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  skuId: {
    type: String,
    required: [true, "Please add a name"],
    unique: true,
    trim: true,
    maxLength: [50, "Name cannot be more than 50 characters"],
  },

  // seller: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "vendor",
  //   required: true,
  // },
  images: [{ type: String }],

  msp: {
    type: Number,
    // required: true,
  },
  mrp: {
    type: Number,
    // required: true,
  },
  discount: {
    type: Number,
    // required: true,
    default: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  status: {
    type: Boolean,
    default: false,
  },
  reviews: [
    {
      type: String,
    },
  ],
});

module.exports = mongoose.model("Product_sku", ProductSkuSchema);
