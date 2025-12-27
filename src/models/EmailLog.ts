import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class EmailLog extends Model {}

EmailLog.init(
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
    step_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'step_order',
    },
    scheduled_at:{
      type: DataTypes.DATE,
      allowNull: true,
      field: 'scheduled_at',
    },

    status: {
      type: DataTypes.ENUM('SENT', 'OPENED', 'REPLIED', 'SCHEDULED', 'FAILED'),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'email_logs',
    timestamps: true,
    underscored: true,
    updatedAt: false, // only created_at needed
  }
);
