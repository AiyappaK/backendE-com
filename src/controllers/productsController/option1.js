const Product = require("../../model/products/Product");
const Product_options = require("../../model/products/options");
const Product_options_values = require("../../model/products/Values");
const Product_sku = require("../../model/products/Sku");
const Product_sku_values = require("../../model/products/SkuValues");

// @desc      Create Product
// @route     POST /api/v1/auth/admin/products
// @access    Private/Admin
exports.handleNewProduct = async (req, res) => {
  const {
    product_name,
    brand_Name,
    category,
    sub_category,
    slug,
    keyword,
    desc,
    options,
    values,
    price,

    createdBy,
  } = req.body;
  if (
    !product_name
    // !brand_Name ||
    // !category ||
    // !subCategory ||
    // !slug ||
    // !keyword ||
    // !desc
    // !createdBy
  )
    return res.status(400).json({ message: "Please fill in all the fields." });

  // check for duplicate usernames in the db
  const duplicate = await Product.findOne({
    product_name: product_name,
  }).exec();
  if (duplicate)
    return res.status(409).json({ message: "Product already present" }); //Conflict
  const uniqueSet = [];
  //create and store the new Product
  const result = await Product.create({
    product_name: product_name,
    // brand_name: brandName,
    // category: category,
    // subCategory: subCategory,
    // slug: slug,
    // desc: desc,
    // keyword: keyword,
    // previewImage: isFeaturedImg,
  });
  //create and store the new Product
  options.forEach(async (option, i) => {
    values[i].forEach(async (value) => {
      uniqueSet.push(
        option.charAt(0).toUpperCase() + value.charAt(0).toUpperCase()
      );
    });

    const resultOptions = await Product_options.create({
      product_id: result._id,
      option_no: i,
      option: option,
    })
      .then(async (res) => {
        //create

        await values[i].forEach(async (value, vn) => {
          const resultOptionValues = await Product_options_values.create({
            product_id: result._id,
            option_id: res._id,
            value_no: vn,
            value: value,
          });
        });
      })
      .catch((error) => console.log(error));
  });
  const variant_1 = uniqueSet.slice(0, values[0].length);

  const variant_2 = uniqueSet.slice(values[0].length - uniqueSet.length);
  const prepareCartesian = async (arr1 = [], arr2 = []) => {
    const res = [];
    for (let i = 0; i < arr1.length; i++) {
      for (let j = 0; j < arr2.length; j++) {
        res.push(
          result.product_name.slice(0, 1) +
            String(result._id).slice(0, 1) +
            arr1[i] +
            arr2[j]
        );
      }
    }
    return res;
  };
  const data = await prepareCartesian(variant_1, variant_2);

  data.forEach(async (value, vn) => {
    const re = await Product_sku.create({
      product_id: result._id,
      skuId: value,
    });
  });
  res.status(201).json({ success: `New Product ${product_name} created!` });
};

// @desc      Get all Products
// @route     GET /api/v1/admin/products
// @access    Private/Admin
exports.getProducts = async (req, res) => {
  try {
    const products = await Product_sku_values.find()
      .populate("product_id")
      .populate("option_id")
      .populate("sku_id")
      .populate("value_id")
      .exec();
    console.log(products);
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
