const { Model, DataTypes } = require('sequelize');
const sequelize = require('./database');

class Page extends Model {}

Page.init({
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true // Опционально
    }
}, {
    sequelize,
    modelName: 'page'
});

module.exports = Page;
