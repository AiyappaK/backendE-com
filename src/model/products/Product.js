const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    innerSubCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InnerSubCategory",
      required: true,
    },

    desc: {
      type: String,
      lang: "en",
      required: true,
      trim: true,
      maxLength: [500, "Name cannot be more than 500 characters"],
    },

    //   slug: {
    //     type: String,
    //     required: true,
    //     unique: true,
    //   },
    tags: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Boolean,
      default: true,
    },
    publishStatus: {
      type: Boolean,
      default: true,
    },
    publishedBy: {
      type: String,
    },
    publishedAt: {
      type: Date,
    },

    //   createdBy: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //     required: true,
    //   },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
