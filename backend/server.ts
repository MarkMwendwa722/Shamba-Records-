import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import bcrypt from 'bcryptjs';
import sequelize from './config/database';
import './models'; // initialize associations
import { User, Field } from './models';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import fieldRoutes from './routes/fields';
import updateRoutes from './routes/updates';
import dashboardRoutes from './routes/dashboard';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/updates', updateRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Serve React frontend in production
const frontendBuild = path.join(__dirname, '..', 'frontend', 'build');
app.use(express.static(frontendBuild));
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendBuild, 'index.html'));
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

sequelize
  .sync()
  .then(async () => {
    // Auto-seed demo data if the database is empty
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('Empty database detected — seeding demo data...');
      const adminPass = await bcrypt.hash('admin123', 10);
      const agentPass = await bcrypt.hash('agent123', 10);
      const admin = await User.create({ name: 'Admin User', email: 'admin@smartseason.com', password: adminPass, role: 'admin' });
      const agent1 = await User.create({ name: 'Alice Wanjiku', email: 'alice@smartseason.com', password: agentPass, role: 'agent' });
      const agent2 = await User.create({ name: 'Brian Omondi', email: 'brian@smartseason.com', password: agentPass, role: 'agent' });
      const now = new Date();
      const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);
      await Field.bulkCreate([
        { name: 'North Paddock', cropType: 'Maize', plantingDate: daysAgo(45), stage: 'Growing', assignedAgentId: agent1.id, lastObservationDate: daysAgo(3) },
        { name: 'South Block', cropType: 'Wheat', plantingDate: daysAgo(120), stage: 'Ready', assignedAgentId: agent1.id, lastObservationDate: daysAgo(1) },
        { name: 'East Ridge', cropType: 'Beans', plantingDate: daysAgo(200), stage: 'Harvested', assignedAgentId: agent2.id, lastObservationDate: daysAgo(10) },
        { name: 'West Lot', cropType: 'Sorghum', plantingDate: daysAgo(30), stage: 'Planted', assignedAgentId: agent2.id, lastObservationDate: daysAgo(20) },
        { name: 'Greenhouse A', cropType: 'Tomatoes', plantingDate: daysAgo(10), stage: 'Growing', assignedAgentId: agent1.id, lastObservationDate: daysAgo(2) },
        { name: 'Highland Field', cropType: 'Potatoes', plantingDate: daysAgo(95), stage: 'Planted', assignedAgentId: null, lastObservationDate: null },
      ]);
      console.log('Demo data seeded: admin@smartseason.com / admin123');
    }
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err: unknown) => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });
