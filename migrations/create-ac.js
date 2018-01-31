module.exports = {
  up: function (queryInterface, Sequelize) {
      return queryInterface.createTable("acs",
          {
              id: {
                  field: "id",
                  type: Sequelize.INTEGER,
                  primaryKey: true,
                  autoIncrement: true,
                  allowNull: false
              },
              size: {
                  field: "size",
                  type: Sequelize.STRING(256),
                  allowNull: false
              },
              description: {
                  field: "description",
                  type: Sequelize.STRING(1024),
                  allowNull: true
              },
              image: {
                  field: "image",
                  type: Sequelize.STRING(1024),
                  allowNull: true
              },
              price: {
                  field: "price",
                  type: Sequelize.DECIMAL,
                  allowNull: false
              },
              time: {
                  field: "time",
                  type: Sequelize.INTEGER,
                  allowNull: true
              },
              priceString: {
                  field: "price_string",
                  type: Sequelize.STRING(256),
                  allowNull: true
              },
              createdAt: {
                  field: "created_at",
                  type: Sequelize.DATE,
                  allowNull: false
              },
              updatedAt: {
                  field: "updated_at",
                  type: Sequelize.DATE
              },
              deleted_at: {
                  field: "deleted_at",
                  type: Sequelize.DATE
              },
              version: {
                  field: "version",
                  type: Sequelize.INTEGER
              }
          },
          {
              timestamps: true,
              paranoid: true,
              underscored: true,

              charset: "utf8",
              collate: "utf8_unicode_ci",

              tableName: "acs"
          }
      );
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.dropTable("acs");
  }
};
