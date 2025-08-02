"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Accountant extends Model {
    static associate(models) {
      // 'accountant' belongs to 'users'
      Accountant.belongsTo(models.User, {
        foreignKey: "emp_code",
        as: "users",
      });
    }
  }

  Accountant.init(
    {
      emp_code: {
        type: DataTypes.STRING,
        references: {
          model: "User",
          key: "user_code",
        },
      },
      sales_area: DataTypes.STRING,
      location: DataTypes.STRING,
      customer_count: DataTypes.INTEGER,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Accountant",
      tableName: "Accountants",
    },
  );

  return Accountant;
};
