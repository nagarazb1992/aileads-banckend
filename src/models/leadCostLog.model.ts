import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class LeadCostLog extends Model {}

LeadCostLog.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  action: {
    type: DataTypes.ENUM(
      'ENRICH_PROFILE','ENRICH_COMPANY',
      'EMAIL_FIND','EMAIL_VERIFY',
      'AI_SCORE','REFRESH'
    )
  },
  costUsd: DataTypes.DECIMAL(10,2),
}, { sequelize, tableName: 'lead_cost_logs' });
