import User from './User';
import Field from './Field';
import Update from './Update';

// Associations
User.hasMany(Field, { foreignKey: 'assignedAgentId', as: 'assignedFields' });
Field.belongsTo(User, { foreignKey: 'assignedAgentId', as: 'assignedAgent' });

User.hasMany(Update, { foreignKey: 'agentId', as: 'updates' });
Update.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });

Field.hasMany(Update, { foreignKey: 'fieldId', as: 'updates' });
Update.belongsTo(Field, { foreignKey: 'fieldId', as: 'field' });

export { User, Field, Update };
