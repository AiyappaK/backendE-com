const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
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
        default: 5654,
      },
    },
    phoneNumber: {
      type: Number,
      required: [true, "Please include your Number"],
      unique: true,
    },

    refreshToken: String,
    // resetPasswordToken: String,
    // resetPasswordExpires: DATE,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
