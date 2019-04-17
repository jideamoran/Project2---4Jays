module.exports = function (sequelize, DataTypes) {
  var Favorite = sequelize.define("Favorite", {
    UserId: DataTypes.INTEGER,
    location: DataTypes.STRING
  });

  Favorite.associate = function (models) {
    // We're saying that a favorite should belong to an user.
    // A favorite can't be created without an user due to the foreign key constraint
    Favorite.belongsTo(models.User, {
      foreignKey: {
        allowNull: false
      }
    });
  };

  return Favorite;
};