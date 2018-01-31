module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable("orders",
            {
                id: {
                    field: "id",
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                    allowNull: false
                },
                firstName: {
                    field: "first_name",
                    type: Sequelize.STRING(1024),
                    allowNull: false
                },
                lastName: {
                    field: "last_name",
                    type: Sequelize.STRING(1024),
                    allowNull: false
                },
                email: {
                    field: "email",
                    type: Sequelize.STRING(1024),
                    allowNull: false,
                    validate: {
                        isEmail: true
                    }
                },
                phone: {
                    field: "phone",
                    type: Sequelize.STRING(1024),
                    allowNull: false
                },
                address: {
                    field: "address",
                    type: Sequelize.STRING(2048),
                    allowNull: false
                },
                city: {
                    field: "city",
                    type: Sequelize.STRING(1024),
                    allowNull: false
                },
                state: {
                    field: "state",
                    type: Sequelize.STRING(1024),
                    allowNull: false
                },
                promo: {
                    field: "promo_code",
                    type: Sequelize.STRING(1024),
                    allowNull: true
                },
                zip: {
                    field: "zip",
                    type: Sequelize.STRING(1024),
                    allowNull: false
                },
                deliveryDate: {
                    field: "delivery_date",
                    type: Sequelize.DATE,
                    allowNull: false
                },
                deliveryTime: {
                    field: "delivery_time",
                    type: Sequelize.DATE,
                    allowNull: false
                },
                pickupDate: {
                    field: "pickup_date",
                    type: Sequelize.DATE,
                    allowNull: false
                },
                pickupTime: {
                    field: "pickup_time",
                    type: Sequelize.DATE,
                    allowNull: false
                },
                totalPrice: {
                    field: "total_price",
                    type: Sequelize.DECIMAL,
                    allowNull: false
                },
                priceWithDiscount: {
                    field: "price_with_discount",
                    type: Sequelize.DECIMAL,
                    allowNull: false
                },
                items: {
                    field: "items",
                    type: Sequelize.STRING(8096),
                    allowNull: false
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

                tableName: "orders"
            }
        );
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable("orders");
    }
};
