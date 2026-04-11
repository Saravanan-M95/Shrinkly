import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Url = sequelize.define('Url', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  shortCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  originalUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      isUrl: true,
    },
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  clickCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'urls',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['short_code'],
    },
    {
      fields: ['user_id'],
    },
  ],
});

export default Url;
