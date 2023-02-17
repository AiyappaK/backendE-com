const Customer = require("../../model/Customer");
const nodemailer = require("nodemailer");
const { consumers } = require("nodemailer/lib/xoauth2");

// @desc      Get all customers
// @route     GET /api/v1/admin/customers
// @access    Private/Admin
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    return res.status(204).json({ message: "No customers found." });
  }
};

// @desc      Get customer profile
// @route     GET /api/v1/admin/customers/:id
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

// @desc      Delete Customer
// @route     DELETE /api/v1/admin/customers/:id
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

  const result = await customer.deleteOne({ _id: req.params.id });
  res.status(202).json(result);
};
