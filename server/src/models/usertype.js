"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserType extends Model {
    static associate(models) {
      // one 'user-type' can have many 'users'
      UserType.hasMany(models.User, {
        foreignKey: "user_type_id",
        as: "users",
      });
    }
  }

  UserType.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_type_id: {
        type: DataTypes.STRING,
        unique: true,
      },
      type_name: DataTypes.STRING,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "UserType",
      tableName: "UserTypes",
    }
  );

  return UserType;
};
