import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class WhatsappAccount extends Model {}

WhatsappAccount.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },

    org_id: DataTypes.UUID,
    user_id: DataTypes.UUID,

    phone_number: {
      type: DataTypes.STRING,
      allowNull: false
    },

    provider: {
      type: DataTypes.ENUM('TWILIO', 'META'),
      allowNull: false
    },

    provider_account_id: DataTypes.STRING,

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
    }
  },
  {
    sequelize,
    tableName: 'whatsapp_accounts'
  }
);
