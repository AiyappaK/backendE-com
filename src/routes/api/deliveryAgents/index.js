const express = require("express");
const router = express.Router();
const verifyJWT = require("../../../middleware/verifyJWT");

//import controller
const deliveryController = require("../../../controllers/deliveryControllers");

//register
router.post("/register", deliveryController.handleNewDeliveryAgent);
//login
router.post("/login", deliveryController.handleDeliveryAgentLogin);
//forgot password
router.post("/forgotPassword", deliveryController.forgotDeliveryAgentPassword);
router.put('/resetpassword/:resettoken', deliveryController.resetPassword);

//logoutHandleNewDeliveryAgent
router.get("/logout", deliveryController.handleLogoutDeliveryAgent);
//get details
router.get("/:id", verifyJWT, deliveryController.getDeliveryAgentProfile);
//update details
router.put("/:id", verifyJWT, deliveryController.updateDeliveryAgentDetails);
//delete customer
router.delete("/:id", verifyJWT, deliveryController.deleteDeliveryAgent);
//verify phone otp
router.post("/request", deliveryController.verifyPhone);
//verify otp
router.post("/phoneOtp", deliveryController.verifyPhoneOtp);

module.exports = router;
