const mongoose = require("mongoose");

const Product = require("../../model/products/Product");
const Product_Variation = require("../../model/products/Variation");

// @desc      Create Product
// @route     POST /api/v1/auth/admin/products
// @access    Private/Admin
exports.handleNewProduct = async (req, res) => {
  const {
    brand,
    category,
    subCategory,
    innerSubCategory,
    slug,
    tags,
    desc,
    variation,
  } = req.body;

  if (
    !brand ||
    !category ||
    !subCategory ||
    !innerSubCategory ||
    // !slug ||
    !tags ||
    !desc ||
    !variation
  )
    return res.status(400).json({ message: "Please fill in all the fields." });

  // check for duplicate usernames in the db
  // const duplicate = await Product.findOne({
  //   productName: productName,
  // }).exec();
  // if (duplicate)
  //   return res.status(409).json({ message: "Product already present" }); //Conflict

  // const session = await mongoose.startSession();
  // session.startTransaction();

  try {
    const response = await Product.create({
      brand: brand,
      category: category,
      subCategory: subCategory,
      innerSubCategory: innerSubCategory,
      slug: slug,
      desc: desc,
      tags: JSON.parse(tags),
      // previewImage: isFeaturedImg,
    }).then(
      async (res) =>
        await JSON.parse(variation).forEach(async (value, vn) => {
          await Product_Variation.create({
            productId: res._id,
            productName: value.productName,
            attribute: value.attribute,
            variation: value.variation,
            sku: value.sku,
            quantity: value.quantity,
            mrp: value.mrp,
            msp: value.msp,
          });
        })
    );
    // Commit the changes
    // await session.commitTransaction();

    res.status(201).json({ success: `New Product created!` });
  } catch (error) {
    // Rollback any changes made in the database
    // await session.abortTransaction();
    console.error(error);
    res
      .status(500)
      .json({ failed: `Some error occurred! Please try again saving` });
  } finally {
    // session.endSession();
  }
};

// @desc      Get all Products
// @route     GET /api/v1/admin/products
// @access    Private/Admin
exports.getProducts = async (req, res) => {
  try {
    const products = await Product_Variation.find()
      .populate({
        path: "productId",
        model: "Product",
        populate: {
          path: "category",
          model: "Category",
        },
      })
      .exec();
    res.status(200).json(products);
  } catch (error) {
    return res.status(204).json({ message: "No Products found." });
  }
};

// // @desc      Get a Product
// // @route     GET /api/v1/admin/products/:id
// // @access    Private/Admin
// exports.getProductById = async (req, res) => {
//   if (!req?.params?.id) {
//     return res.status(400).json({ message: "ID parameter is required." });
//   }
//   try {
//     const product = await Product.findById(req.params.id)
//       .populate("category", "categoryName")
//       .populate("subCategory", "categoryName")
//       .populate("subChildCategory", "categoryName")
//       .populate("brandName", "brandName")
//       .exec();
//     res.status(200).json(product);
//   } catch (error) {
//     return res.status(204).json({ message: "Product not found." });
//   }
// };

// // @desc      Update a product
// // @route     PATCH /api/v1/auth/products/:id
// // @access    Private/Admin
// exports.updateProduct = async (req, res) => {
//   console.log(req?.params?.id);

//   if (!req?.params?.id) {
//     return res.status(400).json({ message: "ID parameter is required." });
//   }
//   const product = await Product.findById(req.params.id).exec();
//   if (!product) {
//     return res
//       .status(204)
//       .json({ message: `No Product matches ID ${req.params.id}.` });
//   }

//   const updates = req.body;

//   try {
//     const result = await Product.findByIdAndUpdate(req.params.id, updates, {
//       new: true,
//     });
//     res.status(200).json(result);
//   } catch (error) {
//     console.log(error);
//     return res.status(204).json({ message: "Product not found." });
//   }
// };
