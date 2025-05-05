const Sequelize = require('sequelize');
const database = require('../config/db');
const Personal = require('./Personal');

const Aluno = database.define('tb_aluno', {
  id: {type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
  nome: {type: Sequelize.STRING(50), allowNull: false},
  email: {type: Sequelize.STRING(50), allowNull: false},
  senha: {type: Sequelize.STRING(60), allowNull: false},
  tipo: {type: Sequelize.STRING(50), allowNull: false},
  id_personal: {type: Sequelize.INTEGER, allowNull: false, references: { model: Personal, key: 'id'}}
}, {
  tableName: 'tb_aluno',
  timestamps: false
});

Aluno.belongsTo(Personal, { foreignKey: 'id_personal' });

module.exports = Aluno;