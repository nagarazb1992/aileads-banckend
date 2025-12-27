import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class EmailAccount extends Model {}

EmailAccount.init(
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

    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },

    provider: {
      type: DataTypes.ENUM('SMTP', 'GMAIL'),
      allowNull: false
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false
    },

    smtp_host: DataTypes.STRING,
    smtp_port: DataTypes.INTEGER,
    smtp_user: DataTypes.STRING,
    smtp_password_encrypted: DataTypes.TEXT,

    gmail_refresh_token: DataTypes.TEXT,

    daily_limit: {
      type: DataTypes.INTEGER,
      defaultValue: 50
    },

    sent_today: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    created_at:{
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updated_at:{
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },

    last_sync_at: DataTypes.DATE
  },
  {
    sequelize,
    tableName: 'email_accounts',
    timestamps: false,
    underscored: true
  }
);
