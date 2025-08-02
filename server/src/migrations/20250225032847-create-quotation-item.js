"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("QuotationItems", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      quotation_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "Quotations",
          key: "quotation_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      item_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
      },
      item_qty: {
        type: Sequelize.INTEGER,
      },
      unit_price: {
        type: Sequelize.FLOAT,
      },
      total_amount: {
        type: Sequelize.FLOAT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("QuotationItems");
  },
};
