const Sequelize = require('sequelize');
const database = require('../config/db');
const Treinos = require('./Treinos');

const Exercicios = database.define('tb_exercicios', {
  id_exercicios: {type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
  nome_exe: {type: Sequelize.STRING(50), allowNull: false},
  video_exe: {type: Sequelize.STRING(255), allowNull: false},
  series_exe: {type: Sequelize.INTEGER, allowNull: false},
  repet_exe: {type: Sequelize.INTEGER, allowNull: true},
  tempo_exe: {type: Sequelize.STRING(50), allowNull: true},
  carga_exe: {type: Sequelize.STRING(50), allowNull: true},
  intervalo_exe: {type: Sequelize.STRING(50), allowNull: false},
  dica_exe: {type: Sequelize.STRING(150), allowNull: false},
  id_treino: {type: Sequelize.INTEGER, allowNull: false, references: { model: Treinos, key: 'id_treino'}}
}, {
  tableName: 'tb_exercicios',
  timestamps: false
});
Exercicios.belongsTo(Treinos, { foreignKey: 'id_treino' });


module.exports = Exercicios;