"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // each 'user' belongs to one 'user-type'
      User.belongsTo(models.UserType, {
        foreignKey: "user_type_id",
        as: "user_type",
      });

      // 'user' has many 'sales-reps'
      User.hasMany(models.SalesRep, {
        foreignKey: "emp_code", // the column in SalesRep that holds the user's code
        sourceKey: "user_code", // the column in User to match on
        as: "sales_rep",
      });
      

      // 'user' has many 'accountants'
      User.hasMany(models.Accountant, {
        foreignKey: "user_code",
        as: "accountant",
      });

      User.hasMany(models.Customer, {
        // foreignKey: "user_code",
        foreignKey: "user_code",
        sourceKey: "user_code",
        as: "customer",
      });
    }
  }

  User.init(
    {
      user_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      user_type_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "UserTypes",
          key: "user_type_id",
        },
      },
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      email: DataTypes.STRING,
      dob: DataTypes.DATE,
      contact: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
    },
  );

  return User;
};
