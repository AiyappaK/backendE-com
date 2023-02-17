const DeliveryAgent = require("../../model/DeliveryAgent");
const nodemailer = require("nodemailer");
const { consumers } = require("nodemailer/lib/xoauth2");

// @desc      Get all customers
// @route     GET /api/v1/auth/users
// @access    Private/Admin
exports.getDeliveryAgents = async (req, res) => {
  try {
    const customers = await DeliveryAgent.find();
    res.status(200).json(customers);
  } catch (error) {
    return res.status(204).json({ message: "No employees found." });
  }
};

// @desc      Get customer profile
// @route     GET /api/v1/auth/customers/:id
// @access    Private
exports.getDeliveryAgentProfile = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "DeliveryAgent ID required" });

  const customer = await DeliveryAgent.findOne({
    _id: req.params.id,
  }).exec();
  if (!customer) {
    return res
      .status(204)
      .json({ message: `No DeliveryAgent matches ID ${req.params.id}.` });
  }

  const { roles, username, email, phoneNumber } = customer;
  res.status(200).json({ roles, username, email, phoneNumber });
};

// @desc      Delete DeliveryAgent
// @route     DELETE /api/v1/auth/customers/:id
// @access    Private
exports.deleteDeliveryAgent = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "DeliveryAgent ID required" });
  const customer = await DeliveryAgent.findOne({ _id: req.params.id }).exec();
  if (!customer) {
    return res
      .status(204)
      .json({ message: `DeliveryAgent ID ${req.params.id} not found` });
  }

  const result = await customer.deleteOne({ _id: req.params.id });
  res.status(202).json(result);
};
