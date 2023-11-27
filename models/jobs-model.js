const { Sequelize, Model } = require('sequelize');
const sequelize = require("../db");

class Job extends Model {}

Job.init({
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    latitude: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
            min: -90,
            max: 90
        }
    },
    longitude: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
            min: -180,
            max: 180
        }
    },
}, {
    sequelize,
    modelName: "Job"
});

module.exports = Job;