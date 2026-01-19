import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

// models/InboundMessage.ts
export class InboundMessage extends Model {}

InboundMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },

    org_id: DataTypes.UUID,
    lead_id: DataTypes.UUID,
    campaign_id: DataTypes.UUID,

    channel: {
      type: DataTypes.ENUM('EMAIL', 'LINKEDIN', 'WHATSAPP')
    },

    message: DataTypes.TEXT,

    sentiment: {
      type: DataTypes.ENUM(
        'POSITIVE',
        'NEUTRAL',
        'NEGATIVE',
        'UNSUBSCRIBE'
      )
    },

    ai_summary: DataTypes.TEXT,
    confidence: DataTypes.FLOAT
  },
  {
    sequelize,
    tableName: 'inbound_messages'
  }
);
