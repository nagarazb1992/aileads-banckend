import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

export interface CampaignAttributes {
  id?: string;
  name: string;
  org_id: string;
  sequence_id?: string;
  primary_channel: 'EMAIL' | 'LINKEDIN' | 'WHATSAPP';
  status: 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  organization_id?: string;
  email_account_id?: string;
}

export class Campaign extends Model<CampaignAttributes>  {}

Campaign.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    org_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    sequence_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    primary_channel: {
      type: DataTypes.ENUM("EMAIL", "LINKEDIN", "WHATSAPP"),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("DRAFT", "RUNNING", "PAUSED", "COMPLETED"),
      allowNull: false,
      defaultValue: "DRAFT",
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    email_account_id: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "email_account_id",
    },
  },
  {
    sequelize,
    tableName: "campaigns",
    underscored: true, // maps created_at, updated_at automatically
    timestamps: true,
  }
);
