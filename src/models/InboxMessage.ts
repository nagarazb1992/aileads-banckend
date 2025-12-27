import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class InboxMessage extends Model {}

InboxMessage.init(
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

    source: {
      type: DataTypes.ENUM('EMAIL', 'LINKEDIN'),
      allowNull: false,
    },

    body: {
      type: DataTypes.TEXT,
    },

    classifiedAs: {
      type: DataTypes.STRING,
      field: 'classified_as',
    },
  },
  {
    sequelize,
    tableName: 'inbox_messages',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  }
);
