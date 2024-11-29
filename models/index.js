const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize
const sequelize = new Sequelize(process.env.MYSQL_URI || 'mysql://root:12345@localhost:3306/mindconnect', {
  dialect: 'mysql',
  logging: true,
});

// Define Models

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: 'users',
  timestamps: false,
});

const JournalEntry = sequelize.define('JournalEntry', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  text: { type: DataTypes.TEXT, allowNull: false },
  mood: { type: DataTypes.STRING, allowNull: false },
  timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW },
}, {
  tableName: 'journal_entries',
  timestamps: false,
});

const ChatMessage = require('./ChatMessage');

// Associations
User.hasMany(JournalEntry, { foreignKey: 'userId' });
JournalEntry.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ChatMessage, { foreignKey: 'userId' });
ChatMessage.belongsTo(User, { foreignKey: 'userId' });

// Export Models and Sequelize Instance
module.exports = {
  sequelize,
  User,
  JournalEntry,
  ChatMessage,
};
