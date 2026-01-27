import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Attributes
 */
export interface DemoBookingAttributes {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  ip_address?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Creation attributes
 */
export interface DemoBookingCreationAttributes
  extends Optional<
    DemoBookingAttributes,
    'id' | 'ip_address' | 'created_at' | 'updated_at'
  > {}

/**
 * Model
 */
export class DemoBooking
  extends Model<DemoBookingAttributes, DemoBookingCreationAttributes>
  implements DemoBookingAttributes {

  public id!: string;
  public name!: string;
  public email!: string;
  public company!: string;
  public message!: string;
  public ip_address!: string | null;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

/**
 * Init
 */
DemoBooking.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    email: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    company: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    ip_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'demo_bookings',
    underscored: true,
    timestamps: true,
  }
);

export default DemoBooking;
