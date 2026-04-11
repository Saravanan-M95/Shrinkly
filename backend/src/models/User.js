import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: true, // null for OAuth users
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true, // Set to true to allow existing users in DB to migration without error
  },
  avatarUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  provider: {
    type: DataTypes.ENUM('local', 'google'),
    defaultValue: 'local',
  },
  providerId: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  resetPasswordOtp: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
});

export default User;
