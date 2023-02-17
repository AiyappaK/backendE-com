const Order = require("../../model/Order");
const Brand = require("../../model/Brand");
const Customer = require("../../model/Customer");

let orderModel = async () => {
  const orders = await Order.find().populate({
    path: "items.brands",
    select: "brandName price total",
  });
  return orders[0];
};
exports.orderPlaced = async (req, res) => {
  const productID = req.body.productId;
  const quantity = Number.parseInt(req.body.quantity);
  const CustomerI = req.body.CustomerID;

  try {
    let orders = await orderModel();
    let customer = await Order.findOne({
      CustomerID: CustomerI,
    }).populate("CustomerID");

    let productDetails = await Brand.findById(productID);
    let customerDetails = await Customer.findById(CustomerI);

    if (!productDetails || !customerDetails) {
      return res.status(500).json({
        type: "Not Found",
        msg: "Invalid request",
      });
    }

    
    const ordersData = {
      items: [
        {
          brands: productID,
          quantity: quantity,
          total: parseInt(productDetails.price * quantity),
          price: productDetails.price,
        },
      ],
      subTotal: parseInt(productDetails.price * quantity),
      CustomerID: req.body.CustomerID,
      Address: req.body.Address,
      InvoiceNumber: req.body.InvoiceNumber,
    };
    orders = await Order.create(ordersData);
    res.json(orders);
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: "Something Went Wrong", err: err });
  }
};

exports.getOrders = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }
  try {
    console.log(req.params.id);

    let orders = await Order.find({ CustomerID: req.params.id });
    console.log(orders);
    if (!orders) {
      return res.status(400).json({
        type: "Invalid",
        msg: "Customer orders Not Found",
      });
    }
    res.status(200).json({
      status: true,
      data: orders,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: "Something Went Wrong", err: err });
  }
};
