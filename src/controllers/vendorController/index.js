const Vendor = require("../../model/Vendor");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { consumers } = require("nodemailer/lib/xoauth2");

const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = new twilio(accountSid, authToken);
// @desc      Register Vendor
// @route     POST /api/v1/auth/Vendor/register
// @access    Public
exports.handleNewVendor = async (req, res) => {
  const { name, password, email, phoneNumber } = req.body;
  console.log(name, password);
  if (!name || !password)
    return res.status(400).json({ message: "name and password are required." });

  // check for duplicate names in the db
  const duplicate = await Vendor.findOne({ email: email }).exec();
  if (duplicate)
    return res.status(409).json({ message: "Email ID already registered" }); //Conflict

  try {
    //encrypt the password
    const hashedPwd = await bcrypt.hash(password, 10);

    //create and store the new Vendor
    const result = await Vendor.create({
      name: name,
      password: hashedPwd,
      email: email,
      phoneNumber: phoneNumber,
    });

    res.status(201).json({ success: `New Vendor ${name} created!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc      Login Vendor
// @route     POST /api/v1/auth/Vendor/login
// @access    Public
exports.handleVendorLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ message: "Email and password are required." });

  const foundUser = await Vendor.findOne({ email: email }).exec();

  if (!foundUser) return res.sendStatus(401); //Unauthorized
  // evaluate password
  const match = await bcrypt.compare(password, foundUser.password);
  if (match) {
    const roles = Object.values(foundUser.roles).filter(Boolean);
    // create JWTs
    const accessToken = jwt.sign(
      {
        UserInfo: {
          name: foundUser.name,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
      { name: foundUser.name },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    // Saving refreshToken with current Vendor
    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    // Creates Secure Cookie with refresh token
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      //enable on production
      // secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Send authorization roles and access token to Vendor
    res.json({ roles, accessToken, foundUser });
  } else {
    res.sendStatus(401);
  }
};

// @desc      Get current logged in Vendor profile
// @route     GET /api/v1/auth/Vendors/:id
// @access    Private
exports.getVendorProfile = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Vendor ID required" });

  const vendor = await Vendor.findOne({
    _id: req.params.id,
  }).exec();
  if (!vendor) {
    return res
      .status(204)
      .json({ message: `No Vendor matches ID ${req.params.id}.` });
  }

  const { roles, name, email, phoneNumber } = vendor;
  res.status(200).json({ roles, name, email, phoneNumber });
};

// @desc      Update Vendor details
// @route     PUT /api/v1/auth/updateDetails
// @access    Private
exports.updateVendorDetails = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }

  const vendor = await Vendor.findOne({ _id: req.params.id }).exec();
  if (!vendor) {
    return res
      .status(204)
      .json({ message: `No employee matches ID ${req.params.id}.` });
  }
  if (req.body?.firstName) vendor.firstName = req.body.firstName;
  if (req.body?.lastName) vendor.lastName = req.body.lastName;
  if (req.body?.phoneNumber) vendor.phoneNumber = req.body.phoneNumber;
  const result = await vendor.save();
  res.status(200).json(result);
};

//Fix so that only the user logged can delete his/her account

// @desc      Delete Vendor
// @route     DELETE /api/v1/auth/Vendors/:id
// @access    Private
exports.deleteVendor = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Vendor ID required" });
  const vendor = await Vendor.findOne({ _id: req.params.id }).exec();
  if (!vendor) {
    return res
      .status(204)
      .json({ message: `Vendor ID ${req.params.id} not found` });
  }

  console.log(req);
  // const result = await Vendor.deleteOne({ _id: req.params.id });
  res.json(result);
};

// @desc      Forgot password
// @route     POST /api/v1/auth/Vendors/:id
// @access    Private
exports.forgotVendorPassword = async (req, res) => {
  const vendor = await Vendor.findById(req.Vendor.id).select("+password");

  if (req.body.email === "") {
    res.status(400).json({ message: `Vendor Email is required` });
  }

  if (!vendor) {
    return res
      .status(204)
      .json({ message: `Vendor with Email ${req.body.email} not found` });
  }

  const resetToken = vendor.getResetPasswordToken();

  // vendor.update({
  //   resetPasswordToken : resetToken,
  //   resetPasswordExpires: Date.now() + 3600000,
  // });

  let transporter = nodemailer.createTransport({
    service: "gmail",
    // port: 587,
    // secure: false, // true for 465, false for other ports
    auth: {
      user: "plumtest7@gmail.com", // plumbazar generated ethereal plumtest7@gmail.com user
      pass: "puxulhpowbnowjer", // generated ethereal password
    },
  });

  //template for mailing
  const mailOptions = {
    from: "plumtest7@gmail.com",
    to: req.body.email,
    subject: "Link To Reset Password",
    html:
      "<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n</p>" +
      "<p>Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n</p>" +
      `<p><h1>${req.protocol}://${req.get(
        "host"
      )}/api/v1/vendors/resetpassword/${resetToken}\n\n</h1></p>` +
      "<p><h1><b>If you did not request this, please ignore this email and your password will remain unchanged.\n</b></h1></p>",
  };

  //remove in production
  console.log("sending mail");

  transporter.sendMail(mailOptions, (err, response) => {
    if (err) {
      console.error("there was an error: ", err);
    } else {
      console.log("here is the res: ", response);
      res.status(200).json("recovery email sent");
    }
  });
};

//enable secure:true while logging in to cookies

// @desc      Logout Vendor
// @route     GET /api/v1/auth/Vendors/logout
// @access    Private
exports.handleLogoutVendor = async (req, res) => {
  // On client, also delete the accessToken
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  const refreshToken = cookies.jwt;

  // Is refreshToken in db?
  const foundUser = await Vendor.findOne({
    refreshToken: refreshToken,
  }).exec();
  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    return res.sendStatus(204);
  }

  // Delete refreshToken in db
  foundUser.refreshToken = "";
  await foundUser.save();

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.status(204).json({ message: `Successfully logged out!` });
};

exports.resetPassword = async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const vendor = await Vendor.findOne({
    resetPasswordToken: req.params.resettoken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!vendor) {
    return next(new ErrorResponse("Invalid token", 400));
  }
  try {
    //encrypt the password
    const hashedPwd = await bcrypt.hash(req.body.password, 10);
    // Set new password
    vendor.password = hashedPwd;
    vendor.resetPasswordToken = undefined;
    vendor.resetPasswordExpire = undefined;

    return res
      .status(200)
      .json({ message: "password is changed successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyPhone = async (req, res, next) => {
  const { phoneNumber } = req.body;

  const vendor = await Vendor.findOne({ phoneNumber: phoneNumber }).exec();

  if (!vendor) {
    // res.status(200).json({message: "Phone Number dose'nt exist" });
    return res.sendStatus(401);
  }
  try {
    const otp = generateOTP(6);
    // save otp to vendor collection
    vendor.Otp = otp;
    await vendor.save();
    // send otp to phone number

    // client.messages.create({
    //   body: `Your OTP is ${otp}`,
    //   messagingServiceSid: "MG04a99b3082badc69b4ac7edeebbfed33",
    //   to: `+91${phoneNumber}`,
    // });

    res.status(200).json({ message: "Otp sent..." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyPhoneOtp = async (req, res, next) => {
  const vendor = await Vendor.findOne({
    Otp: req.body.otpCode,
  });

  if (!vendor) {
    return res.status(400).json({ message: "Invalid Otp" });
  }
  try {
    vendor.Otp = undefined;
    vendor.phoneNumberVerified = true;
    await vendor.save();

    res.status(200).json({ message: "Phone number has been verified" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const generateOTP = (otp_length) => {
  // Declare a digits variable
  // which stores all digits
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < otp_length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};
