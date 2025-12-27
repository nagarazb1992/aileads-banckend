import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class CreditTransaction extends Model {}

CreditTransaction.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  amount: DataTypes.INTEGER,
  type: {
    type: DataTypes.ENUM('ALLOCATION','CONSUMPTION'),
    defaultValue: 'CONSUMPTION',
  },
  reason: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  meta: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  organization_id: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'organization_id',
  },
}, { sequelize, tableName: 'credit_transactions' });
