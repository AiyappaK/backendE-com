const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please include a name"],
    },
    email: {
      type: String,
      required: [true, "Please include an email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please include a password"],
      minlength: 6,
    },
    roles: {
      Customer: {
        type: Number,
        default: 2648,
      },
    },
    phoneNumber: {
      type: Number,
      required: [true, "Please include your Number"],
      unique: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    Otp: String,
    OtpExpires: Date,

    refreshToken: [String],

    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
