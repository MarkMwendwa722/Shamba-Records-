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
import notificationRoutes from './routes/notifications';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/updates', updateRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

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
      const dateStrAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString().split('T')[0];
      const dateAgo    = (n: number) => new Date(now.getTime() - n * 86400000);
      await Field.bulkCreate([
        { name: 'North Paddock',  cropType: 'Maize',    plantingDate: dateStrAgo(45),  stage: 'Growing',   assignedAgentId: agent1.id, lastObservationDate: dateAgo(3)  },
        { name: 'South Block',    cropType: 'Wheat',    plantingDate: dateStrAgo(120), stage: 'Ready',     assignedAgentId: agent1.id, lastObservationDate: dateAgo(1)  },
        { name: 'East Ridge',     cropType: 'Beans',    plantingDate: dateStrAgo(200), stage: 'Harvested', assignedAgentId: agent2.id, lastObservationDate: dateAgo(10) },
        { name: 'West Lot',       cropType: 'Sorghum',  plantingDate: dateStrAgo(30),  stage: 'Planted',   assignedAgentId: agent2.id, lastObservationDate: dateAgo(20) },
        { name: 'Greenhouse A',   cropType: 'Tomatoes', plantingDate: dateStrAgo(10),  stage: 'Growing',   assignedAgentId: agent1.id, lastObservationDate: dateAgo(2)  },
        { name: 'Highland Field', cropType: 'Potatoes', plantingDate: dateStrAgo(95),  stage: 'Planted',   assignedAgentId: null,      lastObservationDate: null        },
      ]);
      console.log('Demo data seeded: admin@smartseason.com / admin123');
    }
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err: unknown) => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });
