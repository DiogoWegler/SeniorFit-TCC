const Sequelize = require('sequelize');
const database = require('../config/db');
const Personal = require('./Personal');
const Aluno = require('./Aluno');

const Avaliacao = database.define('tb_avaliacao', {
  id_avaliacao: {type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
  avaliacao: {type: Sequelize.STRING(50), allowNull: false},
  desc_avali: {type: Sequelize.STRING(255), allowNull: false},
  id_personal: {type: Sequelize.INTEGER, allowNull: false, references: { model: Personal, key: 'id'}},
  id_aluno: {type: Sequelize.INTEGER, allowNull: false, references: { model: Aluno, key: 'id'}}
}, {
  tableName: 'tb_avaliacao',
  timestamps: false
});
Avaliacao.belongsTo(Personal, { foreignKey: 'id_personal' });
Avaliacao.belongsTo(Aluno, { foreignKey: 'id_aluno' });

module.exports = Avaliacao;