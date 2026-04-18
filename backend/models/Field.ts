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
import type Update from './Update';
import type { Stage } from '../types/models';

class Field extends Model<InferAttributes<Field>, InferCreationAttributes<Field>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare cropType: string;
  declare plantingDate: string;
  declare stage: Stage;
  declare location: CreationOptional<string | null>;
  declare sizeHectares: CreationOptional<number | null>;
  declare assignedAgentId: CreationOptional<number | null>;
  declare lastObservationDate: CreationOptional<Date | null>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // Association results — excluded from InferAttributes via NonAttribute
  declare assignedAgent?: NonAttribute<User>;
  declare updates?: NonAttribute<Update[]>;
}

Field.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    cropType: { type: DataTypes.STRING, allowNull: false },
    plantingDate: { type: DataTypes.DATEONLY, allowNull: false },
    stage: {
      type: DataTypes.ENUM('Planted', 'Growing', 'Ready', 'Harvested'),
      allowNull: false,
      defaultValue: 'Planted',
    },
    location: { type: DataTypes.STRING, allowNull: true },
    sizeHectares: { type: DataTypes.FLOAT, allowNull: true },
    assignedAgentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Users', key: 'id' },
    },
    lastObservationDate: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'Field' }
);

export default Field;
