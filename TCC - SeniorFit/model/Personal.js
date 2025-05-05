const database = require('../config/db');
const Sequelize = require('sequelize');

const Personal = database.define('tb_personal', {
    id: {type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
    nome: {type: Sequelize.STRING(50), allowNull: false},
    email: {type: Sequelize.STRING(50), allowNull: false},
    senha: {type: Sequelize.STRING(60), allowNull: false},
    tipo: {type: Sequelize.STRING(50), allowNull: false}
}, {
    tableName: 'tb_personal',
    timestamps: false
});
module.exports = Personal;