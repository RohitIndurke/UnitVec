const { Sequelize, DataTypes } = require('sequelize');
// Use the exported sequelize instance from db.js
const { sequelize } = require('../db');

const Exam = sequelize.define('Exam', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    examCode: {
        type: DataTypes.STRING(6),
        allowNull: false
    }
});

const Question = sequelize.define('Question', {
    questionText: {
        type: DataTypes.STRING,
        allowNull: false
    },
    options: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false
    },
    correctOption: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});


Exam.hasMany(Question, { as: 'questions' });
Question.belongsTo(Exam);

module.exports = { Exam, Question };
