const Sequelize = require('sequelize');
const database = require('../config/db');
const Personal = require('./Personal');
const Aluno = require('./Aluno');

const Treinos = database.define('tb_treinos', {
  id_treino: {type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
  nome_treino: {type: Sequelize.STRING(50), allowNull: false},
  parte_treino: {type: Sequelize.STRING(50), allowNull: false},
  id_personal: {type: Sequelize.INTEGER, allowNull: false, references: { model: Personal, key: 'id'}},
  id_aluno: {type: Sequelize.INTEGER, allowNull: false, references: { model: Aluno, key: 'id'}}
}, {
  tableName: 'tb_treinos',
  timestamps: false
});
Treinos.belongsTo(Personal, { foreignKey: 'id_personal' });
Treinos.belongsTo(Aluno, { foreignKey: 'id_aluno' });

module.exports = Treinos;