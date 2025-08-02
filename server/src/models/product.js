"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // 1 to M relationship
      Product.hasMany(models.Variant, {
        foreignKey: "product_id",
        as: "variants",
      });
    }
  }

  Product.init(
    {
      category: DataTypes.STRING,
      name: {
        type: DataTypes.STRING,
        unique: true,
      },
      main_image: DataTypes.STRING,
      no_variants: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "Products",
    },
  );

  return Product;
};
