"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SalesRep extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 'sales-rep' belongs to 'users'
      SalesRep.belongsTo(models.User, {
        
        targetKey: "user_code",
        foreignKey: "emp_code",
        as: "users",
      });
    }
  }

  SalesRep.init(
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
      modelName: "SalesRep",
      tableName: "SalesReps",
    },
  );

  return SalesRep;
};
