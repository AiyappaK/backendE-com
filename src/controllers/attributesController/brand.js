const Brand = require("../../model/Brand");

// @desc      Create Brand
// @route     POST /api/v1/auth/admin/brands
// @access    Private/Admin
exports.handleNewBrand = async (req, res) => {
  console.log(req.body);
  const { brandName, slug, desc, tags, image, createdBy } = req.body;

  if (!brandName || !slug || !desc || !tags)
    return res.status(400).json({ message: "Please fill in all the fields." });

  // check for duplicate usernames in the db
  const duplicate = await Brand.findOne({ brandName: brandName }).exec();

  if (duplicate)
    return res.status(409).json({ message: "Brand already present" }); //Conflict

  //create and store the new Brand

  try {
    //create and store the new category
    const result = await Brand.create({
      brandName: brandName,
      slug: slug,
      // image: image,
      desc: desc,
      tags: JSON.parse(tags),
      // createdBy: createdBy,
    });

    res.status(201).json({ success: `New Brand ${brandName} created!` });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// @desc      Get all brands
// @route     GET /api/v1/admin/brands
// @access    Private/Admin
exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.status(200).json(brands);
  } catch (error) {
    return res.status(204).json({ message: "No brands found." });
  }
};

// @desc      Get a Brand
// @route     GET /api/v1/admin/brands/:id
// @access    Private/Admin
exports.getBrandById = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }
  try {
    const brand = await Brand.findById(req.params.id).exec();
    res.status(200).json(brand);
  } catch (error) {
    return res.status(204).json({ message: "Brand not found." });
  }
};

// @desc      Update a brand
// @route     PATCH /api/v1/auth/brands/:id
// @access    Private/Admin
exports.updateBrand = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }

  const brand = await Brand.findById(req.params.id).exec();
  if (!brand) {
    return res
      .status(204)
      .json({ message: `No Brand matches ID ${req.params.id}.` });
  }

  const updates = req.body;

  try {
    const result = await Brand.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    res.status(200).json(result);
  } catch (error) {
    return res.status(204).json({ message: "Brand not found." });
  }
};
