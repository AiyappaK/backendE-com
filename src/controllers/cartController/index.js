const Cart = require("../../model/Cart");
const Brand = require("../../model/Brand");
const Customer = require("../../model/Customer");

let cartModel = async () => {
  const carts = await Cart.find().populate({
    path: "items.brands",
    select: "brandName price total",
  });
  return carts[0];
};
exports.addToCart = async (req, res) => {
  const productID = req.body.productId;
  const quantity = Number.parseInt(req.body.quantity);
  const CustomerI = req.body.CustomerID;

  try {
    let cart = await cartModel();
    let customer = await Cart.findOne({CustomerID: CustomerI}).populate("CustomerID");

    let productDetails = await Brand.findById(productID);
    let customerDetails = await Customer.findById(CustomerI);

    if (!productDetails || !customerDetails) {
      return res.status(500).json({
        type: "Not Found",
        msg: "Invalid request",
      });
    }

    if (customer) {
      const indexFound = cart.items.findIndex(
        (item) => item.brands._id == productID
      );
      
      // check if index found and less than zero remove items reduce that quantity
      if (indexFound !== -1) {
        cart.items[indexFound].quantity =
          cart.items[indexFound].quantity + quantity;
        cart.items[indexFound].total =
          cart.items[indexFound].quantity * productDetails.price;
        cart.items[indexFound].price = productDetails.price;
        cart.subTotal = cart.items
          .map((item) => item.total)
          .reduce((acc, next) => acc + next);
      } else if (quantity > 0) {
        cart.items.push({
          brands: productID,
          quantity: quantity,
          price: productDetails.price,
          total: parseInt(productDetails.price * quantity),
        });

        cart.subTotal = cart.items
          .map((item) => item.total)
          .reduce((acc, next) => acc + next);
      } else {
        return res.status(400).json({
          type: "Invalid",
          msg: "Invalid request",
        });
      }
      let data = await cart.save();
      res.status(200).json({
        type: "success",
        mgs: "Process Successful",
        data: data,
      });
    } else {
      const cartData = {
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
      };
      cart = await Cart.create(cartData);
      res.json(cart);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: "Something Went Wrong", err: err });
  }
};

exports.getCart = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }
  try {
    console.log(req.params.id);

    let cart = await Cart.findOne({ CustomerID: req.params.id }).populate(
      "CustomerID"
    );
    console.log(cart);
    if (!cart) {
      return res.status(400).json({
        type: "Invalid",
        msg: "Customer Cart Not Found",
      });
    }
    res.status(200).json({
      status: true,
      data: cart,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: "Something Went Wrong", err: err });
  }
};

exports.emptyCart = async (req, res) => {
 

  try {
    let customer = await Cart.findOne({
      CustomerID: req.body.CustomerID,
    }).populate("CustomerID");
    if (customer) {
      const result = await Cart.deleteOne({ _id: req.params.id });
      res.status(202).json({
        type: "success",
        mgs: "Cart Has been Deleted",
        data: result,
      });

    
    } else {
      res.status(400).json({ msg: "Customer Not Found" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: "Something Went Wrong", err: err });
  }
};
