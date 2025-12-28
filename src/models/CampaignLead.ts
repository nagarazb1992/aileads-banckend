import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export interface CampaignLeadAttributes {
  id?: string;
  campaign_id: string;
  lead_id: string;
  current_step: number;
  status: string;
  sent_count?: number;
  opened_count?: number;
  replied_at?: Date;
}

export class CampaignLead extends Model<CampaignLeadAttributes>  {}

CampaignLead.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    campaign_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    lead_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    current_step: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    status: {
      type: DataTypes.ENUM('ACTIVE', 'REPLIED', 'COMPLETED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },

    sent_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    opened_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    replied_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'campaign_leads',
    timestamps: true,
    underscored: true, // created_at, updated_at
  },
  
);
