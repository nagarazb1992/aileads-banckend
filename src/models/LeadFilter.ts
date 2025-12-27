import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class LeadFilter extends Model {}

LeadFilter.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    orgId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'org_id',
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    industries: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },

    companySizeMin: {
      type: DataTypes.INTEGER,
      field: 'company_size_min',
    },

    companySizeMax: {
      type: DataTypes.INTEGER,
      field: 'company_size_max',
    },

    jobTitles: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      field: 'job_titles',
    },

    countries: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
    },

    keywords: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
    },
  },
  {
    sequelize,
    tableName: 'lead_filters',
    timestamps: true,
    underscored: true,
  }
);
