import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class CampaignLead extends Model {}

CampaignLead.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  lastStepSent: DataTypes.INTEGER,
  responded: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { sequelize, tableName: 'campaign_leads' });
