const express = require("express");
const router = express.Router();
const verifyJWT = require("../../../middleware/verifyJWT");

//import controller
const customerController = require("../../../controllers/customerController");
const cartController = require("../../../controllers/cartController");
const orderController = require("../../../controllers/orderController");
const rfqController = require("../../../controllers/Rfqcontrollers")

//register
router.post("/register", customerController.handleNewCustomer);
//login
router.post("/login", customerController.handleCustomerLogin);
//forgot password
router.post("/forgotPassword", customerController.forgotCustomerPassword);
router.post("/otp", customerController.Otp);
router.put("/resetpassword/:Token", customerController.resetPassword);
//refresh token
router.get("/refresh", customerController.handleRefreshToken);
//logout
router.post("/logout", customerController.handleLogoutCustomer);
//get details
router.get("/:id", verifyJWT, customerController.getCustomerProfile);
//update details
router.put("/:id", verifyJWT, customerController.updateCustomerDetails);
//delete customer
router.delete("/:id", verifyJWT, customerController.deleteCustomer);
//verify phone otp
router.post("/request", customerController.verifyUser);
//verify otp
router.post("/phoneOtp", customerController.verifyPhoneOtp);
//cart
router.post("/Addtocart",cartController.addToCart);
router.get("/showcart/:id",cartController.getCart);
router.delete("/emptycart/:id",cartController.emptyCart);
//orders
router.post("/Add-orders", orderController.orderPlaced);
router.get("/Show-orders/:id",orderController.getOrders);
//rfq
router.post("/Addrfq",rfqController.AddNewRfq);
// get Rfq of paticular Cust ID
router.get("/show-rfq/:id",rfqController.getRfq);

module.exports = router;
