import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class OutboundMessageLog extends Model {}

OutboundMessageLog.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },

    org_id: DataTypes.UUID,
    campaign_id: DataTypes.UUID,
    lead_id: DataTypes.UUID,

    channel: {
      type: DataTypes.ENUM('EMAIL', 'LINKEDIN', 'WHATSAPP')
    },

    step_order: DataTypes.INTEGER,

    status: {
      type: DataTypes.ENUM('SCHEDULED', 'SENT', 'FAILED')
    },

    error: DataTypes.TEXT
  },
  {
    sequelize,
    tableName: 'outbound_message_logs',
    indexes: [
      {
        unique: true,
        fields: ['campaign_id', 'lead_id', 'channel', 'step_order']
      }
    ]
  }
);
