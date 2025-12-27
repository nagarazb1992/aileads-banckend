import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class Subscription extends Model {}

Subscription.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    orgId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'org_id',
    },

    planId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'plan_id',
    },

    status: {
      type: DataTypes.ENUM(
        'TRIALING',
        'ACTIVE',
        'PAST_DUE',
        'CANCELED',
        'PENDING'
      ),
      allowNull: false,
    },

    currentPeriodStart: {
      type: DataTypes.DATE,
      field: 'current_period_start',
    },

    currentPeriodEnd: {
      type: DataTypes.DATE,
      field: 'current_period_end',
    },
  },
  {
    sequelize,
    tableName: 'subscriptions',
    timestamps: true, // creates createdAt & updatedAt
    underscored: true,
  }
);
