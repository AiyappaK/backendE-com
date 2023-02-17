const express = require("express");
const router = express.Router();
const verifyJWT = require("../../../middleware/verifyJWT");
const multer = require("multer");

//import controller
const vendorController = require("../../../controllers/vendorController/index");
const productController = require("../../../controllers/productsController/");

const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

//register
router.post("/register", vendorController.handleNewVendor);
//login
router.post("/login", vendorController.handleVendorLogin);
//forgot password
router.post("/forgotPassword", vendorController.forgotVendorPassword);
router.put("/resetpassword/:resettoken", vendorController.resetPassword);

//logout
router.post("/logout", vendorController.handleLogoutVendor);
//get details
router.get("/:id", verifyJWT, vendorController.getVendorProfile);
//update details
router.put("/:id", verifyJWT, vendorController.updateVendorDetails);
//delete customer
router.delete("/:id", verifyJWT, vendorController.deleteVendor);
//verify phone otp
router.post("/request", vendorController.verifyPhone);
//verify otp
router.post("/phoneOtp", vendorController.verifyPhoneOtp);

//handle products
router.post(
  "/products",
  upload.single("image"),
  productController.handleNewProduct
);
router.get("/products", productController.getProducts);

module.exports = router;
