"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate(models) {
      Customer.belongsTo(models.User, {
        targetKey: "user_code",
        foreignKey: "user_code",
        as: "users",
      });
      Customer.hasMany(models.Order, {
        foreignKey: "order_id",
        as: "orders",
      });
      Customer.hasMany(models.Quotation, {
        foreignKey: "quotation_id",
        as: "quotations",
      });
    }
  }

  Customer.init(
    {
      user_code: {
        type: DataTypes.STRING,
        references: {
          model: "User",
          key: "user_code",
        },
      },
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: DataTypes.STRING,
      contact1: DataTypes.STRING,
      contact2: DataTypes.STRING,
      address_line1: DataTypes.STRING,
      address_line2: DataTypes.STRING,
      city: DataTypes.STRING,
      district: DataTypes.STRING,
      province: DataTypes.STRING,
      postal_code: DataTypes.STRING,
      note: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Customer",
      tableName: "Customers",
    }
  );

  return Customer;
};
