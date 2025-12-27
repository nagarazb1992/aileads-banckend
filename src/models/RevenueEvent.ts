import {
  DataTypes,
  Model
} from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Enums
 */
export enum RevenueSource {
  MANUAL = 'MANUAL',
  STRIPE = 'STRIPE',
  CRM = 'CRM'
}

/**
 * Attributes
 */
export interface RevenueEventAttributes {
  id: string;
  org_id: string;
  lead_id: string;
  sequence_id: string;
  amount_usd: number;
  source: RevenueSource;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Creation attributes
 */
export interface RevenueEventCreationAttributes
  extends Optional<
    RevenueEventAttributes,
    'id' | 'createdAt' | 'updatedAt'
  > {}

/**
 * Model
 */
export class RevenueEvent
  extends Model<
    RevenueEventAttributes,
    RevenueEventCreationAttributes
  >
  implements RevenueEventAttributes {

  public id!: string;
  public org_id!: string;
  public lead_id!: string;
  public sequence_id!: string;
  public amount_usd!: number;
  public source!: RevenueSource;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Init
 */
RevenueEvent.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    org_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    lead_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    sequence_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    amount_usd: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    source: {
      type: DataTypes.ENUM(
        RevenueSource.MANUAL,
        RevenueSource.STRIPE,
        RevenueSource.CRM
      ),
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'revenue_events',
    underscored: true,
    timestamps: true
  }
);

export default RevenueEvent;
