"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Quotation extends Model {
    static associate(models) {
      Quotation.hasMany(models.QuotationItem, {
        sourceKey: "quotation_id",
        foreignKey: "quotation_id",
        as: "quotationItems",
      });

      Quotation.hasMany(models.Customer, {
        sourceKey: "customer_id",
        foreignKey: "user_code",
        as: "quotationCustomer",
      })

      Quotation.belongsTo(models.Invoice, {
        targetKey: "quotation_id",
        foreignKey: "quotation_id",
        as: "invoice",
      });
    }
  }

  Quotation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      quotation_id: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      quotation_date: DataTypes.DATE,
      quotation_due_date: DataTypes.DATE,
      customer_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sales_rep_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      no_items: DataTypes.INTEGER,
      sub_total: DataTypes.FLOAT,
      discount: DataTypes.FLOAT,
      net_total: DataTypes.FLOAT,
      payment_term: DataTypes.STRING,
      company: DataTypes.STRING,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Quotation",
      tableName: "Quotations",
    }
  );

  return Quotation;
};
