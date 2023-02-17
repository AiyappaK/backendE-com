const Category = require("../../model/category/Category");
const SubCategory = require("../../model/category/SubCategory");
const InnerSubCategory = require("../../model/category/InnerSubCategory");

// const s3 = require("../../utils/s3");
// import { uploadFile, deleteFile, getObjectSignedUrl } from ;

/**
 * category
 */

// @desc      Create category
// @route     POST /api/v1/auth/admin/categories/
// @access    Private/Admin
exports.handleNewCategory = async (req, res) => {
  const { categoryName, slug,  createdBy } = req.body;

  // const image = {
  //   data: new Buffer.from(req.file.buffer, "base64"),
  //   contentType: req.file.mimetype,
  // };
  if (!categoryName || !slug )
    return res.status(400).json({ message: "Please fill in all the fields." });

  // await s3.uploadFile(file.buffer, "imageName", file.mimetype);
  // if (!image)
  //   return res.status(400).json({ message: "Please provide an image." });

  // check for duplicate usernames in the db
  const duplicate = await Category.findOne({
    categoryName: categoryName,
  }).exec();
  if (duplicate)
    return res.status(409).json({ message: "category already present" }); //Conflict

  try {
    //create and store the new category
    const result = await Category.create({
      categoryName: categoryName,
      slug: slug,
      // image: image,
     
     
      status: true,
      discount: 0,
      // createdBy: createdBy,
    });

    res.status(201).json({ success: `New category ${categoryName} created!` });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// @desc      Get all categories
// @route     GET /api/v1/admin/categories
// @access    Private/Admin
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    return res.status(204).json({ message: "No categories found." });
  }
};

// @desc      Get a category
// @route     GET /api/v1/admin/categories/:id
// @access    Private/Admin
exports.getCategoryById = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }
  try {
    const category = await Category.findById(req.params.id);
    res.status(200).json(category);
  } catch (error) {
    return res.status(204).json({ message: "Category not found." });
  }
};

// @desc      Update a category
// @route     PATCH /api/v1/auth/categories/:id
// @access    Private
exports.updateCategory = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }

  const category = await Category.findById(req.params.id).exec();
  if (!category) {
    return res
      .status(204)
      .json({ message: `No Category matches ID ${req.params.id}.` });
  }

  const updates = req.body;

  try {
    const result = await Category.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    res.status(200).json(result);
  } catch (error) {
    return res.status(204).json({ message: "Category not found." });
  }
};

/**
 * sub-category
 */

// @desc      Create sub category
// @route     POST /api/v1/auth/admin/sub-categories
// @access    Private/Admin
exports.handleNewSubCategory = async (req, res) => {
  const { categoryName, category, slug,   createdBy } = req.body;

  // const image = {
  //   data: new Buffer.from(req.file.buffer, "base64"),
  //   contentType: req.file.mimetype,
  // };
  if (!categoryName || !slug )
    return res.status(400).json({ message: "Please fill in all the fields." });

  // await s3.uploadFile(file.buffer, "imageName", file.mimetype);
  // if (!image)
  //   return res.status(400).json({ message: "Please provide an image." });

  // check for duplicate usernames in the db
  const duplicate = await SubCategory.findOne({
    categoryName: categoryName,
  }).exec();
  if (duplicate)
    return res.status(409).json({ message: "category already present" }); //Conflict

  try {
    //create and store the new category
    const result = await SubCategory.create({
      categoryName: categoryName,
      category: category,
      slug: slug,
      // image: image,
     
      discount: 0,
      // createdBy: createdBy,
    });

    res.status(201).json({ success: `New category ${categoryName} created!` });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// @desc      Get all sub categories
// @route     GET /api/v1/admin/sub-categories
// @access    Private/Admin
exports.getSubCategories = async (req, res) => {
  try {
    const subCategory = await SubCategory.find().populate("category");
    res.status(200).json(subCategory);
  } catch (error) {
    return res.status(204).json({ message: "Sub Category not found." });
  }
};

// @desc      Get a sub category
// @route     GET /api/v1/admin/sub-categories/:id
// @access    Private/Admin
exports.getSubCategoryById = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }
  try {
    const subCategory = await SubCategory.find(req.params.id).populate(
      "category"
    );
    res.status(200).json(subCategory);
  } catch (error) {
    return res.status(204).json({ message: "Sub Category not found." });
  }
};

// @desc      Get sub category by category
// @route     GET /api/v1/admin/category/sub-categories/:id
// @access    Private/Admin
exports.getSubCategoryByCategoryId = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }
  try {
    const subCategory = await SubCategory.find({
      category: req.params.id,
    }).populate("category");
    res.status(200).json(subCategory);
  } catch (error) {
    return res.status(204).json({ message: "Sub Category not found." });
  }
};

// @desc      Update a sub category
// @route     PATCH /api/v1/auth/sub-categories/:id
// @access    Private
exports.updateSubCategory = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }

  const subCategory = await SubCategory.findById(req.params.id).exec();
  if (!subCategory) {
    return res
      .status(204)
      .json({ message: `No Sub Category matches ID ${req.params.id}.` });
  }

  const updates = req.body;

  try {
    const result = await SubCategory.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    res.status(200).json(result);
  } catch (error) {
    return res.status(204).json({ message: "Sub Category not found." });
  }
};

/**
 * sub-child-category
 */

// @desc      Create sub child category
// @route     POST /api/v1/auth/admin/sub-child-categories
// @access    Private/Admin
exports.handleNewInnerSubCategory = async (req, res) => {
  const {
    categoryName,
    category,
    subCategory,
    slug,
    // image,
   
    createdBy,
  } = req.body;

  if (!categoryName || !category || !subCategory || !slug || !desc )
    return res.status(400).json({ message: "Please fill in all the fields." });

  // check for duplicate usernames in the db
  const duplicate = await InnerSubCategory.findOne({
    categoryName: categoryName,
  }).exec();
  if (duplicate)
    return res
      .status(409)
      .json({ message: "Sub Child category already present" }); //Conflict

  try {
    //create and store the new category
    const result = await InnerSubCategory.create({
      categoryName: categoryName,
      category: category,
      subCategory: subCategory,
      slug: slug,
     
      
      // createdBy: createdBy,
    });

    res
      .status(201)
      .json({ success: `New Sub Child category ${categoryName} created!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc      Get all sub child categories
// @route     GET /api/v1/admin/sub-child-categories
// @access    Private/Admin
exports.getInnerSubCategories = async (req, res) => {
  try {
    const subChildCategory = await InnerSubCategory.find()
      .populate("category", "categoryName")
      .populate("subCategory", "categoryName");
    res.status(200).json(subChildCategory);
  } catch (error) {
    return res.status(204).json({ message: "Sub Child Category not found." });
  }
};

// @desc      Get a sub child category
// @route     GET /api/v1/admin/sub-child-categories/:id
// @access    Private/Admin
exports.getInnerSubCategoryById = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }
  try {
    const innerSubCategoryData = await InnerSubCategory.findById(req.params.id)
      .populate("category", "categoryName")
      .populate("subCategory", "categoryName");
    res.status(200).json(innerSubCategoryData);
  } catch (error) {
    return res.status(204).json({ message: "Sub Category not found." });
  }
};

// @desc      Get sub category by category
// @route     GET /api/v1/admin/category/sub-categories/:id
// @access    Private/Admin
exports.getInnerSubCatBySubCatId = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }
  try {
    const innerSubCategoryData = await InnerSubCategory.find({
      subCategory: req.params.id,
    });
    res.status(200).json(innerSubCategoryData);
  } catch (error) {
    return res.status(204).json({ message: "Sub Category not found." });
  }
};

// @desc      Update a sub child category
// @route     PATCH /api/v1/auth/sub-child-categories/:id
// @access    Private
exports.updateInnerSubCategory = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }

  const subChildCategory = await InnerSubCategory.findById(
    req.params.id
  ).exec();
  if (!subChildCategory) {
    return res
      .status(204)
      .json({ message: `No Sub Child Category matches ID ${req.params.id}.` });
  }

  const updates = req.body;

  try {
    const result = await InnerSubCategory.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
      }
    );
    res.status(200).json(result);
  } catch (error) {
    return res.status(204).json({ message: "Sub Child Category not found." });
  }
};
