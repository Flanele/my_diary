const { Model, DataTypes } = require('sequelize');
const sequelize = require('./database');
const User = require('./User');  // Подключение модели пользователя

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
    user_id: {
        type: DataTypes.INTEGER,  // Связь с таблицей пользователей
        references: {
            model: User,  // Связываемся с моделью User
            key: 'id'     // Используем ключ `id` из таблицы User
        },
        allowNull: false 
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'page'
});

module.exports = Page;
