import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class CalendarIntegration extends Model {}

CalendarIntegration.init(
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

    provider: {
      type: DataTypes.ENUM('GOOGLE', 'OUTLOOK'),
      allowNull: false,
    },

    accessToken: {
      type: DataTypes.TEXT,
      field: 'access_token',
    },

    refreshToken: {
      type: DataTypes.TEXT,
      field: 'refresh_token',
    },

    calendarId: {
      type: DataTypes.STRING,
      field: 'calendar_id',
    },
  },
  {
    sequelize,
    tableName: 'calendar_integrations',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  }
);
