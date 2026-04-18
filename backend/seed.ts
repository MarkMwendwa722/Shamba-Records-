import bcrypt from 'bcryptjs';
import sequelize from './config/database';
import { User, Field } from './models';

async function seed(): Promise<void> {
  await sequelize.sync({ force: true });

  const adminPass = await bcrypt.hash('admin123', 10);
  const agentPass = await bcrypt.hash('agent123', 10);

  const admin = await User.create({ name: 'Admin User', email: 'admin@smartseason.com', password: adminPass, role: 'admin' });
  const agent1 = await User.create({ name: 'Alice Wanjiku', email: 'alice@smartseason.com', password: agentPass, role: 'agent' });
  const agent2 = await User.create({ name: 'Brian Omondi', email: 'brian@smartseason.com', password: agentPass, role: 'agent' });

  const now = new Date();
  const daysAgo = (n: number): Date => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

  await Field.bulkCreate([
    { name: 'North Paddock', cropType: 'Maize', plantingDate: daysAgo(45), stage: 'Growing', assignedAgentId: agent1.id, lastObservationDate: daysAgo(3) },
    { name: 'South Block', cropType: 'Wheat', plantingDate: daysAgo(120), stage: 'Ready', assignedAgentId: agent1.id, lastObservationDate: daysAgo(1) },
    { name: 'East Ridge', cropType: 'Beans', plantingDate: daysAgo(200), stage: 'Harvested', assignedAgentId: agent2.id, lastObservationDate: daysAgo(10) },
    { name: 'West Lot', cropType: 'Sorghum', plantingDate: daysAgo(30), stage: 'Planted', assignedAgentId: agent2.id, lastObservationDate: daysAgo(20) },
    { name: 'Greenhouse A', cropType: 'Tomatoes', plantingDate: daysAgo(10), stage: 'Growing', assignedAgentId: agent1.id, lastObservationDate: daysAgo(2) },
    { name: 'Highland Field', cropType: 'Potatoes', plantingDate: daysAgo(95), stage: 'Planted', assignedAgentId: null, lastObservationDate: null },
  ]);

  console.log('Database seeded successfully!');
  console.log('Admin: admin@smartseason.com / admin123');
  console.log('Agent: alice@smartseason.com / agent123');
  console.log('Agent: brian@smartseason.com / agent123');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
