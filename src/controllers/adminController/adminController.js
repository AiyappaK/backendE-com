const Admin = require("../../model/Admin");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// @desc      Register Admin
// @route     POST /api/v1/auth/Admin/register
// @access    Public
exports.handleNewAdmin = async (req, res) => {
  const { name, password, email, phoneNumber } = req.body;

  if (!name || !password)
    return res
      .status(400)
      .json({ message: "Username and password are required." });

  // check for duplicate usernames in the db
  const duplicate = await Admin.findOne({ email: email }).exec();
  if (duplicate)
    return res.status(409).json({ message: "Email ID already registered" }); //Conflict

  try {
    //encrypt the password
    const hashedPwd = await bcrypt.hash(password, 10);

    //create and store the new Admin
    const result = await Admin.create({
      username: name,
      password: hashedPwd,
      email: email,
      phoneNumber: phoneNumber,
    });

    res.status(201).json({ success: `New Admin ${name} created!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc      Login Admin
// @route     POST /api/v1/auth/Admin/login
// @access    Public
exports.handleAdminLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ message: "Email and password are required." });

  const foundUser = await Admin.findOne({ email: email }).exec();
  if (!foundUser) return res.sendStatus(401); //Unauthorized
  // evaluate password
  const match = await bcrypt.compare(password, foundUser.password);
  if (match) {
    const roles = Object.values(foundUser.roles).filter(Boolean);
    // create JWTs
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    // Saving refreshToken with current Admin
    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    // Creates Secure Cookie with refresh token
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      //enable on production
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Send authorization roles and access token to Admin
    res.json({ roles, accessToken });
  } else {
    res.sendStatus(401);
  }
};

// @desc      Get current logged in Admin profile
// @route     GET /api/v1/auth/Admins/:id
// @access    Private
exports.getAdminProfile = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Admin ID required" });

  const admin = await Admin.findOne({
    _id: req.params.id,
  }).exec();
  if (!admin) {
    return res
      .status(204)
      .json({ message: `No Admin matches ID ${req.params.id}.` });
  }

  const { roles, username, email, phoneNumber } = admin;
  res.status(200).json({ roles, username, email, phoneNumber });
};

// @desc      Update Admin details
// @route     PUT /api/v1/auth/updateDetails
// @access    Private
exports.updateAdminDetails = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }

  const admin = await Admin.findOne({ _id: req.params.id }).exec();
  if (!admin) {
    return res
      .status(204)
      .json({ message: `No employee matches ID ${req.params.id}.` });
  }
  if (req.body?.firstName) admin.firstName = req.body.firstName;
  if (req.body?.lastName) admin.lastName = req.body.lastName;
  if (req.body?.phoneNumber) admin.phoneNumber = req.body.phoneNumber;
  const result = await admin.save();
  res.status(200).json(result);
};

//Fix so that only the user logged can delete his/her account

// @desc      Delete Admin
// @route     DELETE /api/v1/auth/Admins/:id
// @access    Private
exports.deleteAdmin = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Admin ID required" });
  const admin = await Admin.findOne({ _id: req.params.id }).exec();
  if (!admin) {
    return res
      .status(204)
      .json({ message: `Admin ID ${req.params.id} not found` });
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

  // const result = await admin.deleteOne({ _id: req.params.id });
  res.json(result);
};

// @desc      Forgot password
// @route     POST /api/v1/auth/admins/:id
// @access    Private
exports.forgotAdminPassword = async (req, res) => {
  const admin = await Admin.findOne({ email: req.body.email });
  console.log(admin);
  if (req.body.email === "") {
    res.status(400).json("Customer Email is required");
  }

  if (!admin) {
    return res
      .status(404)
      .json(`Customer with Email ${req.body.email} not found`);
  }
  let codeOtp = Math.floor(Math.random() * 1000 + 1);
  const resetToken = codeOtp;

  admin.resetPasswordToken = resetToken;
  admin.resetPasswordExpires = Date.now() + 3600000;

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
      "<p>Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n</p>" +
      `<p><h1>${req.protocol}://${req.get(
        "host"
      )}/resetpassword/${resetToken}\n\n</h1></p>` +
      `<p><h1>${resetToken}</h1></p>` +
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

// @desc      Logout admin
// @route     GET /api/v1/auth/admins/logout
// @access    Private
exports.handleLogoutAdmin = async (req, res) => {
  // On client, also delete the accessToken
  console.log(req.cookies);

  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  const refreshToken = cookies.jwt;

  // Is refreshToken in db?
  const foundUser = await Admin.findOne({
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

// @desc      Admin Refresh Token
// @route     GET /api/v1/auth/Admins/refresh
// @access    Private

exports.handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  console.log(cookies);
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;

  const foundUser = await Admin.findOne({ refreshToken }).exec();
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
// @route     put /api/v1/auth/customers/resetpassword/:resettoken
// @access    Private

exports.resetPassword = async (req, res, next) => {
  const admin = await Admin.findOne({
    resetPasswordToken: req.body.otpCode,
    resetPasswordExpires: { $gt: Date.now() },
  });
  console.log(admin);
  if (!admin) {
    return next(new ErrorResponse("Invalid token", 400));
  }
  try {
    //encrypt the password
    const hashedPwd = await bcrypt.hash(req.body.password, 10);
    // Set new password
    admin.password = hashedPwd;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();
    res.status(200).json({ message: "password is changed successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
