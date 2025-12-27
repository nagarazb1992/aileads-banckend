import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class CampaignStep extends Model {}

CampaignStep.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  stepNumber: { type: DataTypes.INTEGER, allowNull: false, field: 'step_number' },
  channel: { type: DataTypes.ENUM('EMAIL','LINKEDIN','WHATSAPP'), allowNull: false, field: 'channel' },
  delayHours: { type: DataTypes.INTEGER, allowNull: false, field: 'delay_hours' },
  subject: { type: DataTypes.STRING, allowNull: true, field: 'subject' },
  bodyTemplate: { type: DataTypes.TEXT, allowNull: false, field: 'body_template' },
}, { sequelize, tableName: 'campaign_steps' });
