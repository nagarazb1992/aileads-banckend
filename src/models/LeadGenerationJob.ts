import {
  DataTypes,
  Model
} from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Job status enum
 */
export enum LeadGenerationJobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED'
}

/**
 * Attributes
 */
export interface LeadGenerationJobAttributes {
  id: string;
  org_id: string;
  icp_id: string;
  status: LeadGenerationJobStatus;
  total_requested: number;
  total_created: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Creation attributes
 */
export interface LeadGenerationJobCreationAttributes
  extends Optional<
    LeadGenerationJobAttributes,
    'id' | 'status' | 'total_created' | 'createdAt' | 'updatedAt'
  > {}

/**
 * Model
 */
export class LeadGenerationJob
  extends Model<
    LeadGenerationJobAttributes,
    LeadGenerationJobCreationAttributes
  >
  implements LeadGenerationJobAttributes {

  public id!: string;
  public org_id!: string;
  public icp_id!: string;
  public status!: LeadGenerationJobStatus;
  public total_requested!: number;
  public total_created!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Init
 */
LeadGenerationJob.init(
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
    icp_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(
        LeadGenerationJobStatus.PENDING,
        LeadGenerationJobStatus.RUNNING,
        LeadGenerationJobStatus.COMPLETED
      ),
      allowNull: false,
      defaultValue: LeadGenerationJobStatus.PENDING
    },
    total_requested: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    total_created: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    sequelize,
    tableName: 'lead_generation_jobs',
    underscored: true,
    timestamps: true
  }
);

export default LeadGenerationJob;
