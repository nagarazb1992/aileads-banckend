import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class DiscoveryRun extends Model {}

DiscoveryRun.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    ruleId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'rule_id',
    },

    leadsFound: {
      type: DataTypes.INTEGER,
      field: 'leads_found',
    },

    leadsCreated: {
      type: DataTypes.INTEGER,
      field: 'leads_created',
    },

    costUsedUsd: {
      type: DataTypes.DECIMAL(10,2),
      field: 'cost_used_usd',
    },

    runAt: {
      type: DataTypes.DATE,
      field: 'run_at',
    },
  },
  {
    sequelize,
    tableName: 'discovery_runs',
    timestamps: false,
    underscored: true,
  }
);
