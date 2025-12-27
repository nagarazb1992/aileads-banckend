import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class OutreachMessage extends Model {}

OutreachMessage.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  channel: DataTypes.ENUM('EMAIL','LINKEDIN','WHATSAPP'),
  direction: DataTypes.ENUM('OUTBOUND','INBOUND'),
  subject: DataTypes.STRING,
  body: DataTypes.TEXT,
  replyType: DataTypes.ENUM(
    'POSITIVE','NEGATIVE','NEUTRAL','FOLLOW_UP_LATER','QUESTION'
  ),
  meta: DataTypes.JSONB,
}, { sequelize, tableName: 'outreach_messages' });
