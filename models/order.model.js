module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define("order",
        {
            id: {
                field: "id",
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            firstName: {
                field: "first_name",
                type: DataTypes.STRING(1024),
                allowNull: false
            },
            lastName: {
                field: "last_name",
                type: DataTypes.STRING(1024),
                allowNull: false
            },
            email: {
                field: "email",
                type: DataTypes.STRING(1024),
                allowNull: false,
                validate: {
                    isEmail: true
                }
            },
            phone: {
                field: "phone",
                type: DataTypes.STRING(1024),
                allowNull: false
            },
            address: {
                field: "address",
                type: DataTypes.STRING(2048),
                allowNull: false
            },
            city: {
                field: "city",
                type: DataTypes.STRING(1024),
                allowNull: false
            },
            state: {
                field: "state",
                type: DataTypes.STRING(1024),
                allowNull: false
            },
            commentary: {
                field: "commentary",
                type: DataTypes.STRING(1024),
                allowNull: true
            },
            promo: {
                field: "promo_code",
                type: DataTypes.STRING(1024),
                allowNull: true
            },
            zip: {
                field: "zip",
                type: DataTypes.STRING(1024),
                allowNull: false
            },
            deliveryDate: {
                field: "delivery_date",
                type: DataTypes.DATE,
                allowNull: false
            },
            deliveryTime: {
                field: "delivery_time",
                type: DataTypes.DATE,
                allowNull: false
            },
            pickupDate: {
                field: "pickup_date",
                type: DataTypes.DATE,
                allowNull: false
            },
            pickupTime: {
                field: "pickup_time",
                type: DataTypes.DATE,
                allowNull: false
            },
            totalPrice: {
                field: "total_price",
                type: DataTypes.DECIMAL,
                allowNull: false
            },
            priceWithDiscount: {
                field: "price_with_discount",
                type: DataTypes.DECIMAL,
                allowNull: false
            },
            items: {
                field: "items",
                type: DataTypes.STRING(8096),
                allowNull: false
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

    return Order;
};