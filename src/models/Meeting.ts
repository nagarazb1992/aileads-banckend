import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class Meeting extends Model {}

Meeting.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    orgId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'org_id',
    },

    leadId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'lead_id',
    },

    title: {
      type: DataTypes.STRING,
    },

    startTime: {
      type: DataTypes.DATE,
      field: 'start_time',
    },

    endTime: {
      type: DataTypes.DATE,
      field: 'end_time',
    },

    source: {
      type: DataTypes.ENUM('EMAIL', 'LINKEDIN', 'WHATSAPP'),
    },

    calendarEventId: {
      type: DataTypes.STRING,
      field: 'calendar_event_id',
    },
  },
  {
    sequelize,
    tableName: 'meetings',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  }
);
