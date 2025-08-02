"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    static associate(models) {
      // 1 to M relationship
      Invoice.hasMany(models.Quotation, {
        sourceKey: "quotation_id",
        foreignKey: "quotation_id",
        as: "invoice-quotations",
      });
    }
  }

  Invoice.init(
    {
      invoice_no: {
        type: DataTypes.STRING,
        unique: true,
      },
      quotation_id: DataTypes.STRING,
      cr_by: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Invoice",
      tableName: "Invoices",
    },
  );

  return Invoice;
};
