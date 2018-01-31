module.exports = {
  up: function (queryInterface, Sequelize) {
      return queryInterface.addColumn("orders", "commentary", {
          field: "commentary",
          type: Sequelize.STRING(1024),
          allowNull: true
      });
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.removeColumn("orders", "commentary");
  }
};
