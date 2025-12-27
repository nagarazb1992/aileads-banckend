import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';


export const CampaignSequence = sequelize.define('CampaignSequence', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  campaign_id: DataTypes.UUID,
  name: DataTypes.STRING
});
