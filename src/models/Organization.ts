import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class Organization extends Model {}

Organization.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  name: DataTypes.STRING,
  monthlyCostUsedUsd: { type: DataTypes.DECIMAL(10,2), defaultValue: 0, field: 'monthly_cost_used_usd' },
  plan_id: { type: DataTypes.UUID, allowNull: true, field: 'plan_id' },
  user_id: { type: DataTypes.UUID, allowNull: false, field: 'user_id'},
}, { sequelize, tableName: 'organizations',timestamps: true,        // 🔥 REQUIRED
    underscored: true,    });
