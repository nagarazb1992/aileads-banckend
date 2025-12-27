import {
  DataTypes,
  Model 
} from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Enums
 */
export enum OutboundChannel {
  EMAIL = 'EMAIL',
  LINKEDIN = 'LINKEDIN'
}

export enum OutboundCampaignStatus {
  DRAFT = 'DRAFT',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED'
}

/**
 * Attributes
 */
export interface OutboundCampaignAttributes {
  id: string;
  org_id: string;
  name: string;
  channel: OutboundChannel;
  status: OutboundCampaignStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Creation attributes
 */
export interface OutboundCampaignCreationAttributes
  extends Optional<
    OutboundCampaignAttributes,
    'id' | 'status' | 'createdAt' | 'updatedAt'
  > {}

/**
 * Model
 */
export class OutboundCampaign
  extends Model<
    OutboundCampaignAttributes,
    OutboundCampaignCreationAttributes
  >
  implements OutboundCampaignAttributes {

  public id!: string;
  public org_id!: string;
  public name!: string;
  public channel!: OutboundChannel;
  public status!: OutboundCampaignStatus;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Init
 */
OutboundCampaign.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    channel: {
      type: DataTypes.ENUM(
        OutboundChannel.EMAIL,
        OutboundChannel.LINKEDIN
      ),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(
        OutboundCampaignStatus.DRAFT,
        OutboundCampaignStatus.RUNNING,
        OutboundCampaignStatus.PAUSED,
        OutboundCampaignStatus.COMPLETED
      ),
      allowNull: false,
      defaultValue: OutboundCampaignStatus.DRAFT
    }
  },
  {
    sequelize,
    tableName: 'outbound_campaigns',
    underscored: true,
    timestamps: true
  }
);

export default OutboundCampaign;
