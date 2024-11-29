const { DataTypes } = require('sequelize');
const sequelize = require('./index').sequelize;

const JournalEntry = sequelize.define('JournalEntry', {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
    mood: { type: DataTypes.STRING, allowNull: false },
    timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
    tableName: 'journal_entries',
    timestamps: false,
});

module.exports = JournalEntry;
