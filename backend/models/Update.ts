import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from 'sequelize';
import sequelize from '../config/database';
import type User from './User';
import type Field from './Field';
import type { Stage } from '../types/models';

class Update extends Model<InferAttributes<Update>, InferCreationAttributes<Update>> {
  declare id: CreationOptional<number>;
  declare fieldId: number;
  declare agentId: number;
  declare previousStage: CreationOptional<string | null>;
  declare newStage: Stage;
  declare notes: CreationOptional<string | null>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  declare agent?: NonAttribute<User>;
  declare field?: NonAttribute<Field>;
}

Update.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fieldId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Fields', key: 'id' },
    },
    agentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    previousStage: { type: DataTypes.STRING, allowNull: true },
    newStage: {
      type: DataTypes.ENUM('Planted', 'Growing', 'Ready', 'Harvested'),
      allowNull: false,
    },
    notes: { type: DataTypes.TEXT, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'Update' }
);

export default Update;
