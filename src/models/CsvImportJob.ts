import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class CsvImportJob extends Model {}

CsvImportJob.init(
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

    file_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM('UPLOADED', 'IMPORTED', 'FAILED'),
      allowNull: false,
      defaultValue: 'UPLOADED',
    },
  },
  {
    sequelize,
    tableName: 'csv_import_jobs',
    timestamps: true,
    underscored: true, // created_at, updated_at
  }
);
