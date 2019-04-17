module.exports = function(sequelize, DataTypes) {
    var Favorite = sequelize.define("Favorite", {
        UserId: DataTypes.INTEGER,
        location: DataTypes.STRING
    });

    Favorite.associate = function(models) {
        // We're saying that a Post should belong to an Author
        // A Post can't be created without an Author due to the foreign key constraint
        Favorite.belongsTo(models.User, {
          foreignKey: {
            allowNull: false
          }
        });
      };

    return Favorite;
};