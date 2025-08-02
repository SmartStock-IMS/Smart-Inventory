"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class QuotationItem extends Model {
    static associate(models) {
      QuotationItem.belongsTo(models.Quotation, {
        targetKey: "quotation_id",
        foreignKey: "quotation_id",
        as: "quotation",
      });
      QuotationItem.belongsTo(models.Variant, {
        foreignKey: "item_code",
        targetKey: "product_code",
        as: "variant",
      });
    }
  }

  QuotationItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      quotation_id: {
        type: DataTypes.STRING,
        references: {
          model: "Quotations",
          key: "quotation_id",
        },
        allowNull: false,
      },
      item_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: DataTypes.STRING,
      item_qty: DataTypes.INTEGER,
      unit_price: DataTypes.FLOAT,
      total_amount: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: "QuotationItem",
      tableName: "QuotationItems",
    },
  );

  return QuotationItem;
};
