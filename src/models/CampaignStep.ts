import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export const CampaignStep = sequelize.define('CampaignStep', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  sequence_id: DataTypes.UUID,
  dayOffset: DataTypes.INTEGER,
  type: DataTypes.STRING,
  subject: DataTypes.STRING,
  message: DataTypes.TEXT
});
