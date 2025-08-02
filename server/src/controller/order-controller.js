const db = require("../models");

exports.getOrders = async (req, res) => {
  try {
    const orderStatus = req.params.status;

    // const product = await db.Product.findOne({
    //   where: { id: productId },
    //   include: {
    //     model: db.Variant,
    //     as: "variants",
    //   },
    // });

    // if (!product) {
    //   return res.status(404).json({
    //     message: "Product not found.",
    //   });
    // }

    res.status(200).json({
      message: "Product found.",
      orders: [],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.creatOrder = async (req, res) => {
  res.status(201).json({
    message: "Product added successfully.",
    data: [],
  });
};
