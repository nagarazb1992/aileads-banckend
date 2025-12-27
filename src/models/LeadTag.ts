import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class LeadTag extends Model {}

LeadTag.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    leadId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'lead_id',
    },

    tag: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'lead_tags',
    timestamps: true,
    updatedAt: false, // only createdAt
    underscored: true,
  }
);
