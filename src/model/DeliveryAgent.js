const mongoose = require("mongoose");

const deliveryAgentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please include a name. "],
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
    phoneNumber: {
      type: Number,
      required: [true, "Please include your Number"],
      unique: true,
    },
    phoneNumberVerified: {
      type: Boolean,
      default: false,
    },
    dL: {
      type: String,
      required: [true, "Please include a Driving License"],
      minlength: 16,
      maxlength: 17,
    },
    roles: {
      Delivery: {
        type: Number,
        default: 4682,
      },
    },

    Otp: String,

    refreshToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

deliveryAgentSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("DeliveryAgent", deliveryAgentSchema);
