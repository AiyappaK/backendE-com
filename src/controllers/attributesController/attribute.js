const Attribute = require("../../model/attributes/Attribute");

// @desc      Create Attribute
// @route     POST /api/v1/auth/admin/brands
// @access    Private/Admin
exports.handleNewAttribute = async (req, res) => {
  const { attributeName, desc } = req.body;

  if (!attributeName || !desc)
    return res.status(400).json({ message: "Please fill in all the fields." });

  // check for duplicate usernames in the db
  const duplicate = await Attribute.findOne({
    attributeName: attributeName,
  }).exec();

  if (duplicate)
    return res.status(409).json({ message: "Attribute already present" }); //Conflict

  //create and store the new Attribute

  try {
    //create and store the new category
    const result = await Attribute.create({
      attributeName: attributeName,
      desc: desc,
    });

    res
      .status(201)
      .json({ success: `New Attribute ${attributeName} created!` });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// @desc      Get all brands
// @route     GET /api/v1/admin/brands
// @access    Private/Admin
exports.getAttribute = async (req, res) => {
  try {
    const brands = await Attribute.find();
    res.status(200).json(brands);
  } catch (error) {
    return res.status(204).json({ message: "No attribute's found." });
  }
};

///////////////////////////////

// @desc      Get a Attribute
// @route     GET /api/v1/admin/brands/:id
// @access    Private/Admin
exports.getBrandById = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }
  try {
    const brand = await Attribute.findById(req.params.id).exec();
    res.status(200).json(brand);
  } catch (error) {
    return res.status(204).json({ message: "Attributenot found." });
  }
};

// @desc      Update a brand
// @route     PATCH /api/v1/auth/brands/:id
// @access    Private/Admin
exports.updateBrand = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }

  const brand = await Attribute.findById(req.params.id).exec();
  if (!brand) {
    return res
      .status(204)
      .json({ message: `No Attributematches ID ${req.params.id}.` });
  }

  const updates = req.body;

  try {
    const result = await Attribute.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    res.status(200).json(result);
  } catch (error) {
    return res.status(204).json({ message: "Attributenot found." });
  }
};
