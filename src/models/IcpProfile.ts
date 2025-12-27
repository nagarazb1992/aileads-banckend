import {
  DataTypes,
  Model,
} from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Attributes
 */
export interface IcpProfileAttributes {
  id: string;
  org_id: string;
  name: string;
  description: string;
  industries: string[];
  countries: string[];
  company_size_min: number;
  company_size_max: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Creation attributes
 */
export interface IcpProfileCreationAttributes
  extends Optional<IcpProfileAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * Model
 */
export class IcpProfile
  extends Model<IcpProfileAttributes, IcpProfileCreationAttributes>
  implements IcpProfileAttributes {

  public id!: string;
  public org_id!: string;
  public name!: string;
  public description!: string;
  public industries!: string[];
  public countries!: string[];
  public company_size_min!: number;
  public company_size_max!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Init
 */
IcpProfile.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    industries: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: []
    },
    countries: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: []
    },
    company_size_min: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    company_size_max: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'icp_profiles',
    underscored: true,
    timestamps: true
  }
);

export default IcpProfile;
