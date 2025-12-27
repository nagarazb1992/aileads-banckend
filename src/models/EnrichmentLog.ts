import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class EnrichmentLog extends Model {}

EnrichmentLog.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'job_id',
    },

    step: {
      type: DataTypes.ENUM(
        'PROFILE',
        'COMPANY',
        'EMAIL_FIND',
        'EMAIL_VERIFY',
        'AI_SCORE'
      ),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM('SUCCESS', 'FAILED'),
      allowNull: false,
    },

    rawResponse: {
      type: DataTypes.JSONB,
      field: 'raw_response',
    },
  },
  {
    sequelize,
    tableName: 'enrichment_logs',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  }
);
