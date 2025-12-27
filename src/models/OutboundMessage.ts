import {
  DataTypes,
  Model
} from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';
import { OutboundChannel } from './OutboundCampaign.js';

/**
 * Enums
 */
export enum OutboundMessageStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED'
}

/**
 * Attributes
 */
export interface OutboundMessageAttributes {
  id: string;
  campaign_id: string;
  lead_id: string;
  channel: OutboundChannel;
  subject: string;
  body: string;
  status: OutboundMessageStatus;
  error?: string | null;
  sentAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Creation attributes
 */
export interface OutboundMessageCreationAttributes
  extends Optional<
    OutboundMessageAttributes,
    'id' | 'status' | 'error' | 'sentAt' | 'createdAt' | 'updatedAt'
  > {}

/**
 * Model
 */
export class OutboundMessage
  extends Model<
    OutboundMessageAttributes,
    OutboundMessageCreationAttributes
  >
  implements OutboundMessageAttributes {

  public id!: string;
  public campaign_id!: string;
  public lead_id!: string;
  public channel!: OutboundChannel;
  public subject!: string;
  public body!: string;
  public status!: OutboundMessageStatus;
  public error!: string | null;
  public sentAt!: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Init
 */
OutboundMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    campaign_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    lead_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    channel: {
      type: DataTypes.ENUM(
        OutboundChannel.EMAIL,
        OutboundChannel.LINKEDIN
      ),
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(
        OutboundMessageStatus.PENDING,
        OutboundMessageStatus.SENT,
        OutboundMessageStatus.FAILED
      ),
      allowNull: false,
      defaultValue: OutboundMessageStatus.PENDING
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'sent_at'
    }
  },
  {
    sequelize,
    tableName: 'outbound_messages',
    underscored: true,
    timestamps: true
  }
);

export default OutboundMessage;
