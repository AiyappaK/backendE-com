const Customer = require("../../model/Customer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = new twilio(accountSid, authToken);

// @desc      Register Customer
// @route     POST /api/v1/auth/customers/register
// @access    Public
exports.handleNewCustomer = async (req, res) => {
  const { userName, password, email, phoneNumber } = req.body;

  if (!userName || !password || !email || !phoneNumber)
    return res.status(400).json({ message: "Please fill in all the fields." });

  // check for duplicate usernames in the db
  const duplicate = await Customer.findOne({ email: email }).exec();
  if (duplicate)
    return res.status(409).json({ message: "Email ID already registered" }); //Conflict

  try {
    //encrypt the password
    const hashedPwd = await bcrypt.hash(password, 10);

    //create and store the new customer
    const result = await Customer.create({
      username: userName,
      password: hashedPwd,
      email: email,
      phoneNumber: phoneNumber,
    });

    res.status(201).json({ success: `New customer ${userName} created!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc      Login Customer
// @route     POST /api/v1/auth/customer/login
// @access    Public
exports.handleCustomerLogin = async (req, res) => {
  const { accessToken } = req.body;
  console.log("test", req.body);

  console.log(
    `Access Token available at login: ${JSON.stringify(accessToken)}`
  );
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ message: "Email and password are required." });

  const foundUser = await Customer.findOne({ email: email }).exec();
  if (!foundUser) return res.sendStatus(401); //Unauthorized
  // evaluate password
  const match = await bcrypt.compare(password, foundUser?.password);
  if (match) {
    const roles = Object.values(foundUser.roles).filter(Boolean);
    const userName = foundUser.username;
    // create JWTs
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10s" }
    );
    const newRefreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "30s" }
    );

    // Changed to let keyword
    let newRefreshTokenArray = !accessToken?.jwt
      ? foundUser.refreshToken
      : foundUser.refreshToken.filter((rt) => rt !== accessToken.jwt);

    if (accessToken?.jwt) {
      const refreshToken = accessToken.jwt;
      const foundToken = await Customer.findOne({ refreshToken }).exec();

      // Detected refresh token reuse!
      if (!foundToken) {
        console.log("attempted refresh token reuse at login!");
        // clear out ALL previous refresh tokens
        newRefreshTokenArray = [];
      }
    }

    // Saving refreshToken with current user
    foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    const result = await foundUser.save();

    // Send authorization roles and access token to user
    res.json({ userName, accessToken, refreshToken: newRefreshToken });
    console.log("done");
  } else {
    res.sendStatus(401);
  }
};

// @desc      Get current logged in customer profile
// @route     GET /api/v1/auth/customers/:id
// @access    Private
exports.getCustomerProfile = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Customer ID required" });

  const customer = await Customer.findOne({
    _id: req.params.id,
  }).exec();
  if (!customer) {
    return res
      .status(204)
      .json({ message: `No Customer matches ID ${req.params.id}.` });
  }

  const { roles, username, email, phoneNumber } = customer;
  res.status(200).json({ roles, username, email, phoneNumber });
};

// @desc      Update customer details
// @route     PUT /api/v1/auth/updateDetails
// @access    Private
exports.updateCustomerDetails = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }

  const customer = await Customer.findOne({ _id: req.params.id }).exec();
  if (!customer) {
    return res
      .status(204)
      .json({ message: `No employee matches ID ${req.params.id}.` });
  }
  if (req.body?.firstName) customer.firstName = req.body.firstName;
  if (req.body?.lastName) customer.lastName = req.body.lastName;
  if (req.body?.phoneNumber) customer.phoneNumber = req.body.phoneNumber;
  const result = await customer.save();
  res.status(200).json(result);
};

//Fix so that only the user logged can delete his/her account

// @desc      Delete Customer
// @route     DELETE /api/v1/auth/customers/:id
// @access    Private
exports.deleteCustomer = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Customer ID required" });
  const customer = await Customer.findOne({ _id: req.params.id }).exec();
  if (!customer) {
    return res
      .status(204)
      .json({ message: `Customer ID ${req.params.id} not found` });
  }

  // const authHeader = req.headers.authorization || req.headers.Authorization;
  // if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);
  // const token = authHeader.split(" ")[1];
  // console.log(token);
  // jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
  //   if (err) return res.sendStatus(403); //invalid token
  //   req.user = decoded.UserInfo.username;
  //   req.roles = decoded.UserInfo.roles;
  //   next();
  // });

  // const result = await customer.deleteOne({ _id: req.params.id });
  res.json(result);
};

// @desc      Forgot password
// @route     POST /api/v1/auth/customers/:id
// @access    Private
exports.forgotCustomerPassword = async (req, res) => {
  const customer = await Customer.findOne({ email: req.body.email });
  console.log(customer);
  if (req.body.email === "") {
    res.status(400).json("Customer Email is required");
  }

  if (!customer) {
    return res
      .status(404)
      .json(`Customer with Email ${req.body.email} not found`);
  }

  const resetToken = generateOTP(6);

  customer.Otp = resetToken;
  customer.OtpExpires = Date.now() + 3600000;

  customer.save();

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
      "<p>To authenticate, please use the following One Time Password (OTP)::\n\n</p>" +
      `<p><h5>Otp is ${resetToken}</h5></p>` +
      "<p><b>Don't share this OTP with anyone. Our customer service team will never ask you for your password, OTP, credit card, or banking info We hope to see you again soon.</b></p>",
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

// @desc      Logout Customer
// @route     GET /api/v1/auth/customers/logout
// @access    Private
exports.handleLogoutCustomer = async (req, res) => {
  // On client, also delete the accessToken
  const { refreshToken } = req.body;

  const cookies = refreshToken;
  if (!cookies) return res.sendStatus(204); //No content

  // Is refreshToken in db?
  const foundUser = await Customer.findOne({
    refreshToken: refreshToken,
  }).exec();

  if (!foundUser) {
    return res.sendStatus(204);
  }

  // Delete refreshToken in db
  foundUser.refreshToken = "";
  await foundUser.save();

  res.status(204).json({ message: `Successfully logged out!` });
};

// @desc      Customer Refresh Token
// @route     GET /api/v1/auth/customers/refresh
// @access    Private

exports.handleRefreshToken = async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  const foundUser = await Customer.findOne({ refreshToken }).exec();
  console.log(foundUser);
  if (!foundUser) return res.sendStatus(403); //Forbidden
  // evaluate jwt
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.username !== decoded.username)
      return res.sendStatus(403);
    const roles = Object.values(foundUser.roles);
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: decoded.username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10s" }
    );
    res.json({ roles, accessToken });
  });
};

// @desc      Customer reset password
// @route     put /api/v1/auth/customers/Otp/
// @access    Private

exports.Otp = async (req, res, next) => {
  const customer = await Customer.findOne({
    Otp: req.body.otpCode,
    OtpExpires: { $gt: Date.now() },
  });
  if (!customer) {
    return res.status(400).json({ message: "Invalid Otp" });
  }
  try {
    customer.Otp = undefined;
    customer.OtpExpires = undefined;
    const resetToken = crypto.randomBytes(20).toString("hex");

    customer.resetPasswordToken = resetToken;
    customer.resetPasswordExpires = Date.now() + 3600000;

    await customer.save();
    res.status(200).json({ message: "Valid Otp .", data: { resetToken } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res, next) => {
  // Get hashed token

  const customer = await Customer.findOne({
    resetPasswordToken: req.body.token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!customer) {
    return next(new ErrorResponse("Invalid token", 400));
  }
  try {
    //encrypt the password
    const hashedPwd = await bcrypt.hash(req.body.password, 10);
    // Set new password
    customer.password = hashedPwd;
    customer.resetPasswordToken = undefined;
    customer.resetPasswordExpires = undefined;
    await customer.save();
    res.status(200).json({ message: "password is changed successfully." });
  } catch (err) {}
};

exports.verifyUser = async (req, res, next) => {
  const { phoneNumber } = req.body;

  const customer = await Customer.findOne({ phoneNumber: phoneNumber }).exec();

  if (!customer) {
    // res.status(200).json({message: "Phone Number dose'nt exist" });
    return res.sendStatus(401);
  }
  try {
    const otp = generateOTP(6);
    // save otp to customer collection
    customer.Otp = otp;
    await customer.save();
    // send otp to phone number

    // client.messages
    // .create({
    //  body: `Your OTP is ${otp}`,
    //  messagingServiceSid: 'MG04a99b3082badc69b4ac7edeebbfed33',
    //  to: `+91${phoneNumber}`
    //   })

    res.status(200).json({ message: "Otp sent..." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyPhoneOtp = async (req, res, next) => {
  const customer = await Customer.findOne({
    Otp: req.body.otpCode,
  });

  if (!customer) {
    return res.status(400).json({ message: "Invalid Otp" });
  }
  try {
    customer.Otp = undefined;
    customer.verified = true;
    await customer.save();

    res.status(200).json({ message: "Account has been verified" });
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
