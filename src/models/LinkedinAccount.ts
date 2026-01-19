// models/LinkedinAccount.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class LinkedinAccount extends Model {}

LinkedinAccount.init(
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

    profile_name: DataTypes.STRING,
    profile_url: DataTypes.STRING,

    session_cookie_encrypted: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    status: {
      type: DataTypes.ENUM(
        'CONNECTED_UNVERIFIED',
        'ACTIVE',
        'DISCONNECTED'
      ),
      defaultValue: 'CONNECTED_UNVERIFIED'
    },

    health_score: {
      type: DataTypes.INTEGER,
      defaultValue: 50
    },

    daily_limit: {
      type: DataTypes.INTEGER,
      defaultValue: 30
    },

    sent_today: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    last_checked_at: DataTypes.DATE,
    failure_reason: DataTypes.TEXT
  },
  {
    sequelize,
    tableName: 'linkedin_accounts',
    underscored: true
  }
);
