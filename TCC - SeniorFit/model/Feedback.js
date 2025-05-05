const Sequelize = require('sequelize');
const database = require('../config/db');
const Personal = require('./Personal');
const Aluno = require('./Aluno');

const Feedback = database.define('tb_feedback', {
  id_feedback: {type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
  desc_feed: {type: Sequelize.STRING(255), allowNull: false},
  qualid_feed: {type: Sequelize.STRING(50), allowNull: false},
  nome_treino: {type: Sequelize.STRING(50), allowNull: false},
  id_personal: {type: Sequelize.INTEGER, allowNull: false, references: { model: Personal, key: 'id'}},
  id_aluno: {type: Sequelize.INTEGER, allowNull: false, references: { model: Aluno, key: 'id'}}
}, {
  tableName: 'tb_feedback',
  timestamps: false
});
Feedback.belongsTo(Personal, { foreignKey: 'id_personal' });
Feedback.belongsTo(Aluno, { foreignKey: 'id_aluno' });

module.exports = Feedback;