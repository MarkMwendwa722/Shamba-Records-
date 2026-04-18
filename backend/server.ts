import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sequelize from './config/database';
import './models'; // initialize associations

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

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err: unknown) => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });
