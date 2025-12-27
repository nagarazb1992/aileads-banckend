import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class AutoDiscoveryRule extends Model {}

AutoDiscoveryRule.init(
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

    type: {
      type: DataTypes.ENUM('ICP', 'COMPANY', 'HIRING_SIGNAL'),
      allowNull: false,
    },

    filters: {
      type: DataTypes.JSONB,
    },

    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    lastRunAt: {
      type: DataTypes.DATE,
      field: 'last_run_at',
    },
  },
  {
    sequelize,
    tableName: 'auto_discovery_rules',
    timestamps: true,
    underscored: true,
  }
);
