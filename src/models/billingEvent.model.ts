import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Attributes
 */
interface BillingEventAttributes {
  id: string;
  org_id: string;
  subscription_id: string | null;
  provider: 'PADDLE';
  event_type: string;
  provider_event_id: string;
  payload: object;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Creation attributes
 */
interface BillingEventCreationAttributes
  extends Optional<BillingEventAttributes, 'id' | 'subscription_id'> {}

/**
 * Model
 */
export class BillingEvent extends Model<
  BillingEventAttributes,
  BillingEventCreationAttributes
> implements BillingEventAttributes {
  public id!: string;
  public org_id!: string;
  public subscription_id!: string | null;
  public provider!: 'PADDLE';
  public event_type!: string;
  public provider_event_id!: string;
  public payload!: object;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

/**
 * Init
 */
BillingEvent.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    org_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    subscription_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    provider: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    event_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    provider_event_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // 🔥 prevents duplicate webhook processing
    },

    payload: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'billing_events',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['provider_event_id'],
      },
      {
        fields: ['org_id'],
      },
      {
        fields: ['subscription_id'],
      },
    ],
  }
);

export default BillingEvent;
