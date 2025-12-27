import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class WebhookLog extends Model {}

WebhookLog.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    type: {
      type: DataTypes.ENUM('LINKEDIN', 'PADDLE', 'EMAIL'),
      allowNull: false,
    },

    payload: {
      type: DataTypes.JSONB,
    },
  },
  {
    sequelize,
    tableName: 'webhook_logs',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  }
);
