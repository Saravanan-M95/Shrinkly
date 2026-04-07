import sequelize from '../config/database.js';
import User from './User.js';
import Url from './Url.js';
import Click from './Click.js';

// Define associations
User.hasMany(Url, { foreignKey: 'userId', as: 'urls', onDelete: 'CASCADE' });
Url.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Url.hasMany(Click, { foreignKey: 'urlId', as: 'clicks', onDelete: 'CASCADE' });
Click.belongsTo(Url, { foreignKey: 'urlId', as: 'url' });

export { sequelize, User, Url, Click };
