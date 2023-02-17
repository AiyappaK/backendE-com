const express = require("express");
const router = express.Router();
const verifyJWT = require("../../../middleware/verifyJWT");
const multer = require("multer");

//import controller
const adminController = require("../../../controllers/adminController/adminController");
const customerController = require("../../../controllers/adminController/adminCustomerController");
const deliveryController = require("../../../controllers/adminController/adminDeliveryController");
const vendorController = require("../../../controllers/adminController/adminVendorController");
//products
const brandController = require("../../../controllers/attributesController/brand");
const attributeController = require("../../../controllers/attributesController/attribute");
const categoryController = require("../../../controllers/productsController/categoryController");
const productController = require("../../../controllers/productsController/");
//rfq
const rfqController = require("../../../controllers/Rfqcontrollers")

const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

//auth should be added
//register
router.post("/register", adminController.handleNewAdmin);

//login
router.post("/login", adminController.handleAdminLogin);
//refresh token
router.get("/refresh", adminController.handleRefreshToken);

//get all
router.get("/customers", verifyJWT, customerController.getCustomers);
router.get("/delivery-agents", verifyJWT, deliveryController.getDeliveryAgents);
router.get("/vendors", verifyJWT, vendorController.getVendors);

//get details
// router.get("/:id", adminController.getAdminProfile);
router.get("/customers/:id", verifyJWT, customerController.getCustomerProfile);
router.get(
  "/delivery-agents/:id",
  verifyJWT,
  deliveryController.getDeliveryAgentProfile
);
router.get("/vendors/:id", verifyJWT, vendorController.getVendorProfile);

//update details
// router.put("/:id", adminController.updateAdminDetails);

// router.put("/customer/:id", customerController.updateCustomerDetails);
// router.put("/delivery/:id", deliveryController.updateDeliveryAgentDetails);
// router.put("/vendor/:id", vendorController.updateVendorDetails);

//delete user
// router.delete("/:id", adminController.deleteAdmin);

router.delete("/customers/:id", verifyJWT, customerController.deleteCustomer);
router.delete(
  "/delivery-agents/:id",
  verifyJWT,
  deliveryController.deleteDeliveryAgent
);
router.delete("/vendors/:id", verifyJWT, vendorController.deleteVendor);

//handle brand
router.post("/brands", upload.single("image"), brandController.handleNewBrand);
router.get("/brands", brandController.getBrands);
router.get("/brands/:id", brandController.getBrandById);
router.patch(
  "/brands/:id",
  upload.single("image"),
  brandController.updateBrand
);

//handle attribute
router.post("/attribute", attributeController.handleNewAttribute);
router.get("/attribute", attributeController.getAttribute);
// router.get("/brands/:id", brandController.getBrandById);
// router.patch(
//   "/brands/:id",
//   upload.single("image"),
//   brandController.updateBrand
// );

//handle categories
router.post(
  "/categories",
  upload.single("image"),
  categoryController.handleNewCategory
);
router.get("/categories", categoryController.getCategories);
router.get("/categories/:id", categoryController.getCategoryById);
router.patch("/categories/:id", categoryController.updateCategory);

//handle sub categories
router.post(
  "/sub-categories",
  upload.single("image"),
  categoryController.handleNewSubCategory
);
router.get("/sub-categories", categoryController.getSubCategories);
router.get("/sub-categories/:id", categoryController.getSubCategoryById);
router.patch("/sub-categories/:id", categoryController.updateSubCategory);
router.get(
  "/category/sub-categories/:id",
  categoryController.getSubCategoryByCategoryId
);

//handle sub categories
router.post(
  "/inner-sub-categories",
  upload.single("image"),
  categoryController.handleNewInnerSubCategory
);
router.get("/inner-sub-categories", categoryController.getInnerSubCategories);
router.get(
  "/inner-sub-categories/:id",
  categoryController.getInnerSubCategoryById
);
router.patch(
  "/inner-sub-categories/:id",
  categoryController.updateInnerSubCategory
);
router.get(
  "/category/inner-sub-categories/:id",
  categoryController.getInnerSubCatBySubCatId
);

//handle products
router.post(
  "/products",
  upload.single("image"),
  productController.handleNewProduct
);
router.get("/products", productController.getProducts);
// router.get("/products/:id", productController.getProductById);
// router.patch("/products/:id", productController.updateProduct);

//rfq with update rfq ID
router.put("/update-rfq/:id",rfqController.updatePrice);
//get all rfq
router.get("/rfq",rfqController.getAllRfq);

module.exports = router;
