import {
  DataTypes,
  Model,
  Sequelize
} from 'sequelize';
import type { Optional } from 'sequelize';

export enum LinkedInScrapeMode {
  ICP = 'icp',
  SALES_NAV = 'sales_nav',
}

export enum LinkedInScrapeStatus {
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

interface LinkedInScrapeJobAttributes {
  id: string;
  orgId: string;
  mode: LinkedInScrapeMode;
  icpDescription?: string | null;
  salesNavUrl?: string | null;
  requestedLeads: number;
  status: LinkedInScrapeStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LinkedInScrapeJobCreationAttributes
  extends Optional<
    LinkedInScrapeJobAttributes,
    'id' | 'status' | 'createdAt' | 'updatedAt'
  > {}
export class LinkedInScrapeJob extends Model<LinkedInScrapeJobAttributes, LinkedInScrapeJobCreationAttributes> {
  static initModel(sequelize: Sequelize) {
    LinkedInScrapeJob.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        orgId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'org_id',
        },
        mode: {
          type: DataTypes.ENUM(
            LinkedInScrapeMode.ICP,
            LinkedInScrapeMode.SALES_NAV
          ),
          allowNull: false,
        },
        icpDescription: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: 'icp_description',
        },
        salesNavUrl: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: 'sales_nav_url',
        },
        requestedLeads: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'requested_leads',
          validate: {
            min: 1,
          },
        },
        status: {
          type: DataTypes.ENUM(
            LinkedInScrapeStatus.QUEUED,
            LinkedInScrapeStatus.RUNNING,
            LinkedInScrapeStatus.COMPLETED,
            LinkedInScrapeStatus.FAILED
          ),
          allowNull: false,
          defaultValue: LinkedInScrapeStatus.QUEUED,
        },
      },
      {
        sequelize,
        tableName: 'linkedin_scrape_jobs',
        timestamps: true,
        underscored: true,
        indexes: [
          { fields: ['org_id'] },
          { fields: ['status'] },
          { fields: ['created_at'] },
        ],
      }
    );
  }
}
