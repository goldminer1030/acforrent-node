module.exports = (sequelize, DataTypes) => {
    const Promo = sequelize.define("promo",
        {
            id: {
                field: "id",
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            name: {
                field: "name",
                type: DataTypes.STRING(1024),
                allowNull: false
            },
            discount: {
                field: "discount",
                type: DataTypes.INTEGER,
                allowNull: false,

                validate: {
                    min: 0,
                    max: 100
                }
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

    return Promo;
};