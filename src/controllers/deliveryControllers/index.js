const DeliveryAgent = require("../../model/DeliveryAgent");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { consumers } = require("nodemailer/lib/xoauth2");

const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = new twilio(accountSid, authToken);

// @desc      Register DeliveryAgent
// @route     POST /api/v1/auth/DeliveryAgent/register
// @access    Public
exports.handleNewDeliveryAgent = async (req, res) => {
  const { name, password, email, phoneNumber } = req.body;
  if (!name || !password)
    return res.status(400).json({ message: "name and password are required." });

  // check for duplicate names in the db
  const duplicate = await DeliveryAgent.findOne({ email: email }).exec();
  if (duplicate)
    return res.status(409).json({ message: "Email ID already registered" }); //Conflict

  try {
    //encrypt the password
    const hashedPwd = await bcrypt.hash(password, 10);

    //create and store the new DeliveryAgent
    const result = await DeliveryAgent.create({
      name: name,
      password: hashedPwd,
      email: email,
      phoneNumber: phoneNumber,
    });

    res
      .status(201)
      .json({ success: `New DeliveryAgent Agent ${name} created!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc      Login DeliveryAgent
// @route     POST /api/v1/auth/delivery-agents/login
// @access    Public
exports.handleDeliveryAgentLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ message: "Email and password are required." });

  const foundUser = await DeliveryAgent.findOne({ email: email }).exec();
  console.log(foundUser);
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
    // Saving refreshToken with current DeliveryAgent
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

    // Send authorization roles and access token to DeliveryAgent
    res.json({ roles, accessToken });
  } else {
    res.sendStatus(401);
  }
};

// @desc      Get current logged in DeliveryAgent profile
// @route     GET /api/v1/auth/delivery-agents/:id
// @access    Private
exports.getDeliveryAgentProfile = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "DeliveryAgent ID required" });

  const delivery = await DeliveryAgent.findOne({
    _id: req.params.id,
  }).exec();
  if (!delivery) {
    return res
      .status(204)
      .json({ message: `No DeliveryAgent matches ID ${req.params.id}.` });
  }

  const { roles, name, email, phoneNumber } = delivery;
  res.status(200).json({ roles, name, email, phoneNumber });
};

// @desc      Update DeliveryAgent details
// @route     PUT /api/v1/auth/delivery-agents/updateDetails
// @access    Private
exports.updateDeliveryAgentDetails = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }

  const delivery = await DeliveryAgent.findOne({ _id: req.params.id }).exec();
  if (!delivery) {
    return res
      .status(204)
      .json({ message: `No employee matches ID ${req.params.id}.` });
  }
  if (req.body?.firstName) delivery.firstName = req.body.firstName;
  if (req.body?.lastName) delivery.lastName = req.body.lastName;
  if (req.body?.phoneNumber) delivery.phoneNumber = req.body.phoneNumber;
  const result = await delivery.save();
  res.status(200).json(result);
};

//Fix so that only the user logged can delete his/her account

// @desc      Delete DeliveryAgent
// @route     DELETE /api/v1/auth/delivery-agents/:id
// @access    Private
exports.deleteDeliveryAgent = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "DeliveryAgent ID required" });
  const delivery = await DeliveryAgent.findOne({ _id: req.params.id }).exec();
  if (!delivery) {
    return res
      .status(204)
      .json({ message: `DeliveryAgent ID ${req.params.id} not found` });
  }

  console.log(req);
  // const result = await DeliveryAgent.deleteOne({ _id: req.params.id });
  res.json(result);
};

// @desc      Forgot password
// @route     POST /api/v1/auth/delivery-agents/:id
// @access    Private
exports.forgotDeliveryAgentPassword = async (req, res) => {
  const delivery = await DeliveryAgent.findOne(req.delivery.id).select(
    "+password"
  );

  if (req.body.email === "") {
    res.status(400).json({ message: `DeliveryAgent Email is required` });
  }

  if (!delivery) {
    return res.status(204).json({
      message: `DeliveryAgent with Email ${req.body.email} not found`,
    });
  }

  const resetToken = delivery.getResetPasswordToken();

  // delivery.update({
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
      )}/api/v1/delivery/resetpassword/${resetToken}\n\n</h1></p>` +
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

// @desc      Logout DeliveryAgent
// @route     GET /api/v1/auth/delivery-agents/logout
// @access    Private
exports.handleLogoutDeliveryAgent = async (req, res) => {
  // On client, also delete the accessToken
  console.log(req.cookies);

  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  const refreshToken = cookies.jwt;

  // Is refreshToken in db?
  const foundUser = await DeliveryAgent.findOne({
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

// @desc      delivery reset password
// @route     put /api/v1/auth/deliverys/resetpassword/:resettoken
// @access    Private

exports.resetPassword = async (req, res, next) => {
  // Get hashed token
  // const resetPasswordToken = crypto
  //   .createHash('sha256')
  //   .update(req.params.resettoken)
  //   .digest('hex');

  const delivery = await DeliveryAgent.findOne({
    resetPasswordToken: req.params.resettoken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!delivery) {
    return next(new ErrorResponse("Invalid token", 400));
  }
  try {
    //encrypt the password
    const hashedPwd = await bcrypt.hash(req.body.password, 10);
    // Set new password
    delivery.password = hashedPwd;
    delivery.resetPasswordToken = undefined;
    delivery.resetPasswordExpire = undefined;

    return res
      .status(200)
      .json({ message: "password is changed successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyPhone = async (req, res, next) => {
  const { phoneNumber } = req.body;

  const delivery = await DeliveryAgent.findOne({
    phoneNumber: phoneNumber,
  }).exec();

  if (!delivery) {
    // res.status(200).json({message: "Phone Number dose'nt exist" });
    return res.sendStatus(401);
  }
  try {
    const otp = generateOTP(6);
    // save otp to delivery collection
    delivery.Otp = otp;
    await delivery.save();
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
  const delivery = await DeliveryAgent.findOne({
    Otp: req.body.otpCode,
  });

  if (!delivery) {
    return res.status(400).json({ message: "Invalid Otp" });
  }
  try {
    delivery.Otp = undefined;
    delivery.phoneNumberVerified = true;
    await delivery.save();

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
