const { Sequelize, Model } = require('sequelize');
const sequelize = require("../db");

class User extends Model {}

User.init({
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    phone_number: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: "User"
});

module.exports = User;
