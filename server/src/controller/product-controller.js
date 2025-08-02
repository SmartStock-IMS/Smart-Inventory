const { z } = require("zod");
const db = require("../models");
const {
  productSchema,
  productUpdateSchema,
} = require("../validators/product-validator");
const cloudinary = require("../config/cloudinary");

exports.getProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await db.Product.findOne({
      where: { id: productId },
      include: {
        model: db.Variant,
        as: "variants",
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    res.status(200).json({
      message: "Product found.",
      product: product,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { cursor, limit } = req.query;
    const whereClause = cursor ? { id: { [db.Sequelize.Op.gt]: cursor } } : {};

    const products = await db.Product.findAll({
      where: whereClause,
      include: {
        model: db.Variant,
        as: "variants",
      },
      order: [["updatedAt", "DESC"]],
      limit: limit,
    });

    const formattedProducts = products.map((product) => {
      return {
        ...product.toJSON(),
        variants: product.variants.map((variant) => ({
          ...variant.toJSON(),
          mfd_date: variant.mfd_date
            ? variant.mfd_date.toISOString().split("T")[0]
            : null,
          exp_date: variant.exp_date
            ? variant.exp_date.toISOString().split("T")[0]
            : null,
        })),
      };
    });

    const nextCursor =
      products.length > 0 ? products[products.length - 1].id : null;

    res.status(200).json({
      message: "Product retrieve successful.",
      products: formattedProducts,
      nextCursor: nextCursor,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductVariants = async (req, res) => {
  try {
    const variants = await db.Variant.findAll({
      order: [["updatedAt", "DESC"]],
    });

    if (!variants) {
      return res.status(404).json({
        message: "No variants found.",
      });
    }

    res.status(200).json({
      message: "Product found.",
      variants: variants,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const productValidation = productSchema.safeParse(req.body);

    if (!productValidation.success) {
      return res.status(400).json({
        errors: productValidation.error.errors,
      });
    }

    const { name, category, main_image, unit_price, variants } =
      productValidation.data;
    const productData = {
      name: name,
      category: category,
      main_image: main_image,
      no_variants: variants.length,
    };
    const variantsData = variants;

    const dbTransaction = await db.sequelize.transaction();
    try {
      const product = await db.Product.create(productData, {
        transaction: dbTransaction,
      });
      const variants = variantsData.map((variant) => ({
        ...variant,
        product_id: product.id,
      }));
      await db.Variant.bulkCreate(variants, { transaction: dbTransaction });
      await dbTransaction.commit();
    } catch (error) {
      await dbTransaction.rollback();
      console.error("Error creating product: ", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      message: "Product added successfully.",
      data: {
        product: productData,
        variants: variants,
      },
    });
  } catch (error) {
    console.log("Error creating product (outside): ", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await db.Product.findOne({
      where: { id: productId },
    });
    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const productValidation = productUpdateSchema.safeParse(req.body);
    if (!productValidation.success) {
      return res.status(400).json({
        errors: productValidation.error.errors,
      });
    }

    const { variants, ...updatedFields } = productValidation.data;

    Object.keys(updatedFields).forEach(
      (key) => updatedFields[key] === undefined && delete updatedFields[key],
    );

    const dbTransaction = await db.sequelize.transaction();
    try {
      if (Object.keys(updatedFields).length > 0) {
        await db.Product.update(updatedFields, {
          where: { id: productId },
          transaction: dbTransaction,
        });
      }

      if (Array.isArray(variants) && variants.length > 0) {
        await Promise.all(
          variants.map(async (variant) => {
            const variantData = await db.Variant.findOne({
              where: {
                product_id: productId,
                product_code: variant.product_code,
              },
            });
            if (!variantData) {
              return res.status(404).json({ error: "Variant not found" });
            }
            await db.Variant.update(variant, {
              where: { id: variantData.id },
              transaction: dbTransaction,
            });
          }),
        );
      }

      await dbTransaction.commit();
    } catch (error) {
      await dbTransaction.rollback();
      console.error("Error updating product: ", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
      message: "Product updated successfully",
      data: {
        product: updatedFields,
        variants: variants,
      },
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the product" });
  }
};

exports.updateVariantQuantity = async (req, res) => {
  try {
    const updateData = req.body;

    const dbTransaction = await db.sequelize.transaction();
    try {
      if (updateData.length > 0) {
        await Promise.all(
          updateData.map(async (data) => {
            const variantData = await db.Variant.findOne({
              where: {
                product_code: data.item_code,
              },
            });
            if (!variantData) {
              return res.status(404).json({ error: "Variant not found" });
            }

            variantData.quantity += data.quantity;
            await variantData.save({ transaction: dbTransaction });
          }),
        );
      }

      await dbTransaction.commit();
      res.status(201).json({
        message: "Product update successfully.",
        data: updateData,
      });
    } catch (error) {
      await dbTransaction.rollback();
      console.error("Error updating product: ", error);
      return res.status(500).json({ error: error.message });
    }
  } catch (error) {
    console.error("Error updating product:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the product" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await db.Product.destroy({
      where: { id: productId },
    });
    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    res.status(200).json({
      message: `Product ID:${productId} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the product" });
  }
};

exports.deleteVariant = async (req, res) => {
  try {
    const productId = req.params.id;
    const variantId = req.query.variant_id;

    const variant = await db.Variant.destroy({
      where: { id: variantId, product_id: productId },
    });
    if (!variant) {
      return res.status(404).json({
        message: "Variant not found.",
      });
    }

    res.status(200).json({
      message: `Variant ID:${productId} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting variant:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the variant" });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    const subFolder = (req.body.folder_name || "uncategorized")
      .toLowerCase()
      .replace(/\s+/g, "_");
    // Construct the full folder path
    const folderName = `trollius/${subFolder}`;

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: folderName,
    });
    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeImage = async (req, res) => {
  try {
    const { public_id } = req.query;
    console.log("Deleting image with public_id:", public_id);
    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === "not found") {
      return res.status(404).json({ error: "Image not found" });
    }

    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
