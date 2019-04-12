module.exports = function(sequelize, DataTypes) {
    var LocalData = sequelize.define("LocalData", {
        user: DataTypes.STRING,
        location: DataTypes.STRING,
        body: DataTypes.STRING
    });
    return LocalData;
};