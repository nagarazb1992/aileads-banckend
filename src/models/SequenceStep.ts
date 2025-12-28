import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import { Sequence } from './Sequence.js';
import { EmailTemplate } from './EmailTemplate.js';

export interface SequenceStepAttributes {
  id?: string;
  sequence_id: string;
  order: number;
  day_offset: number;
  channel: 'EMAIL' | 'LINKEDIN' | 'WHATSAPP';
  subject?: string;
  message: string;
  email_template_id?: string;
}

export class SequenceStep extends Model<SequenceStepAttributes> implements SequenceStepAttributes {}

SequenceStep.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    sequence_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    day_offset: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'day_offset',
    },

    channel: {
      type: DataTypes.ENUM('EMAIL', 'LINKEDIN', 'WHATSAPP'),
      allowNull: false,
    },

    subject: {
      type: DataTypes.STRING,
      allowNull: true, // only for EMAIL
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    email_template_id: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'email_template_id',
    },
  },
  {
    sequelize,
    tableName: 'sequence_steps',
    timestamps: true,
    underscored: true,
  }
);

// Association helper to be called after both models are loaded
export function associateSequenceStepModels() {
  SequenceStep.belongsTo(EmailTemplate, { foreignKey: 'email_template_id', as: 'emailTemplate' });
  EmailTemplate.hasMany(SequenceStep, { foreignKey: 'email_template_id', as: 'sequenceSteps' });
}

