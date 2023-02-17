const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    image: { data: Buffer, contentType: String },
    tags: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    desc: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// brandSchema.virtual("id").get(function () {
//   return this._id.toHexString;
// });

// brandSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Brand", brandSchema);
