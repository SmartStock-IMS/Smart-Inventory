"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Quotations", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      quotation_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      quotation_date: {
        type: Sequelize.DATE,
      },
      quotation_due_date: {
        type: Sequelize.DATE,
      },
      customer_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      sales_rep_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      no_items: {
        type: Sequelize.INTEGER,
      },
      sub_total: {
        type: Sequelize.FLOAT,
      },
      discount: {
        type: Sequelize.FLOAT,
      },
      net_total: {
        type: Sequelize.FLOAT,
      },
      payment_term: {
        type: Sequelize.STRING,
      },
      company: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("Quotations");
  },
};
