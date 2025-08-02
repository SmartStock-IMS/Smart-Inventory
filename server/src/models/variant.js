"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Variant extends Model {
    static associate(models) {
      Variant.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product",
      });
      Variant.hasMany(models.QuotationItem, {
        foreignKey: "item_code",
        sourceKey: "product_code",
        as: "quotationItems",
      });
    }
  }

  Variant.init(
    {
      product_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Products",
          key: "id",
        },
        allowNull: false,
      },
      product_code: DataTypes.STRING,
      color: DataTypes.STRING,
      price: DataTypes.DECIMAL,
      image: DataTypes.STRING,
      quantity: DataTypes.INTEGER,
      min_qty: DataTypes.INTEGER,
      mfd_date: DataTypes.DATE,
      exp_date: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Variant",
      tableName: "Variants",
    },
  );

  return Variant;
};
