import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class AuditLog extends Model {}

AuditLog.init(
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

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },

    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    meta: {
      type: DataTypes.JSONB,
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  }
);
