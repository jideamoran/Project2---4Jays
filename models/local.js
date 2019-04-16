module.exports = function(sequelize, DataTypes) {
    var LocalData = sequelize.define("LocalData", {
        user: DataTypes.STRING,
        title: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        location: DataTypes.INTEGER,
        body: DataTypes.STRING
    });
    return LocalData;
};