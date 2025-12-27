import {
  DataTypes,
  Model
} from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from "../config/database.js";

/**
 * Enums
 */
export enum SendChannel {
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP'
}

/**
 * Attributes
 */
export interface SendTimeStatAttributes {
  org_id: string;
  channel: SendChannel;
  hour: number;
  replies: number;
  sends: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Creation attributes
 */
export interface SendTimeStatCreationAttributes
  extends Optional<
    SendTimeStatAttributes,
    'replies' | 'sends' | 'createdAt' | 'updatedAt'
  > {}

/**
 * Model
 */
export class SendTimeStat
  extends Model<
    SendTimeStatAttributes,
    SendTimeStatCreationAttributes
  >
  implements SendTimeStatAttributes {

  public org_id!: string;
  public channel!: SendChannel;
  public hour!: number;
  public replies!: number;
  public sends!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Init
 */
SendTimeStat.init(
  {
    org_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    channel: {
      type: DataTypes.ENUM(
        SendChannel.EMAIL,
        SendChannel.WHATSAPP
      ),
      allowNull: false,
      primaryKey: true
    },
    hour: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      validate: {
        min: 0,
        max: 23
      }
    },
    replies: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    sends: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    sequelize,
    tableName: 'send_time_stats',
    underscored: true,
    timestamps: true
  }
);

export default SendTimeStat;
