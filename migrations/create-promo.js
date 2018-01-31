module.exports = {
  up: function (queryInterface, Sequelize) {
      return queryInterface.createTable("promos",
          {
              id: {
                  field: "id",
                  type: Sequelize.INTEGER,
                  primaryKey: true,
                  autoIncrement: true,
                  allowNull: false
              },
              name: {
                  field: "name",
                  type: Sequelize.STRING(1024),
                  allowNull: false
              },
              discount: {
                  field: "discount",
                  type: Sequelize.INTEGER,
                  allowNull: false,

                  validate: {
                      min: 0,
                      max: 100
                  }
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

              tableName: "promos"
          }
      );
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.dropTable("promos");
  }
};
