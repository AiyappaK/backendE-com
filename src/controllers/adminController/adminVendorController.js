const Vendor = require("../../model/Vendor");
const nodemailer = require("nodemailer");
const { consumers } = require("nodemailer/lib/xoauth2");

// @desc      Get all customers
// @route     GET /api/v1/auth/users
// @access    Private/Admin
exports.getVendors = async (req, res) => {
  try {
    const customers = await Vendor.find();
    res.status(200).json(customers);
  } catch (error) {
    return res.status(204).json({ message: "No employees found." });
  }
};

// @desc      Get customer profile
// @route     GET /api/v1/auth/customers/:id
// @access    Private
exports.getVendorProfile = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Vendor ID required" });

  const customer = await Vendor.findOne({
    _id: req.params.id,
  }).exec();
  if (!customer) {
    return res
      .status(204)
      .json({ message: `No Vendor matches ID ${req.params.id}.` });
  }

  const { roles, username, email, phoneNumber } = customer;
  res.status(200).json({ roles, username, email, phoneNumber });
};

// @desc      Delete Vendor
// @route     DELETE /api/v1/auth/customers/:id
// @access    Private
exports.deleteVendor = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Vendor ID required" });
  const customer = await Vendor.findOne({ _id: req.params.id }).exec();
  if (!customer) {
    return res
      .status(204)
      .json({ message: `Vendor ID ${req.params.id} not found` });
  }

  const result = await customer.deleteOne({ _id: req.params.id });
  res.status(202).json(result);
};
