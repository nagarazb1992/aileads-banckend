import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class EnrichmentJob extends Model {}

EnrichmentJob.init(
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

    status: {
      type: DataTypes.ENUM('PENDING', 'RUNNING', 'SUCCESS', 'FAILED'),
      defaultValue: 'PENDING',
    },

    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    error: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    tableName: 'enrichment_jobs',
    timestamps: true,
    underscored: true,
  }
);
