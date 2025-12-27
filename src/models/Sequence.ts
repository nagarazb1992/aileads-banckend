import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

import { SequenceStep } from './SequenceStep.js';


export class Sequence extends Model {}


Sequence.init(
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
    auto_stop_on_reply: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    
    status:{
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      allowNull: false,
      defaultValue: 'ACTIVE',
      field: 'status',
    }
  },
  {
    sequelize,
    tableName: 'sequences',
    timestamps: true,
    underscored: true, // created_at, updated_at
  }
);


// Association helper to be called after both models are loaded
export async function associateSequenceModels() {
  const module = await import('./SequenceStep.js');
  const SequenceStep = module.SequenceStep;
  Sequence.hasMany(SequenceStep, { as: 'steps', foreignKey: 'sequence_id' });
  SequenceStep.belongsTo(Sequence, { foreignKey: 'sequence_id' });

}
