import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import { Organization } from './Organization.js';

export class Membership extends Model {}

// In membership.model.ts
Membership.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  role: DataTypes.STRING,
  user_id: { type: DataTypes.UUID, allowNull: false },
  organization_id: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, tableName: 'memberships', underscored: true });

// Associations
Membership.belongsTo(User, { foreignKey: 'user_id' });
Membership.belongsTo(Organization, { foreignKey: 'organization_id' });

