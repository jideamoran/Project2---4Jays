module.exports = function(sequelize, DataTypes) {
    var Favorite = sequelize.define("Favorite", {
        userID: DataTypes.INTEGER,
        location: DataTypes.STRING
    });
    return Favorite;
};