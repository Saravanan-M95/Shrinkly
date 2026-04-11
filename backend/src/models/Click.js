import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Click = sequelize.define('Click', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  urlId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'urls',
      key: 'id',
    },
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  referrer: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  deviceType: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  browser: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  os: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  clickedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'clicks',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      fields: ['url_id'],
    },
    {
      fields: ['clicked_at'],
    },
  ],
});

export default Click;
