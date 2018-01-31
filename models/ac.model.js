module.exports = (sequelize, DataTypes) => {
    const AC = sequelize.define("ac",
        {
            id: {
                field: "id",
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            size: {
                field: "size",
                type: DataTypes.STRING(256),
                allowNull: false
            },
            description: {
                field: "description",
                type: DataTypes.STRING(1024),
                allowNull: true
            },
            image: {
                field: "image",
                type: DataTypes.STRING(1024),
                allowNull: true
            },
            price: {
                field: "price",
                type: DataTypes.DECIMAL,
                allowNull: false
            },
            time: {
                field: "time",
                type: DataTypes.INTEGER,
                allowNull: true
            },
            priceString: {
                field: "price_string",
                type: DataTypes.STRING(256),
                allowNull: true
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

    return AC;
};