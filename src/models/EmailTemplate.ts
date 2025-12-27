import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export interface EmailTemplateAttributes {
  id?: string;
  org_id: string;
  name: string;
  subject: string;
  body: string;
  created_by_ai: boolean;
  is_archived: boolean;
}

export class EmailTemplate extends Model<EmailTemplateAttributes> implements EmailTemplateAttributes {
  public id!: string;
  public org_id!: string;
  public name!: string;
  public subject!: string;
  public body!: string;
  public created_by_ai!: boolean;
  public is_archived!: boolean;
}

EmailTemplate.init(
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

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    created_by_ai: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_archived:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }
  },
  {
    sequelize,
    tableName: 'email_templates',
    timestamps: true,
    underscored: true, // created_at, updated_at
  }
);
