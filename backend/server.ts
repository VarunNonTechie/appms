import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database';
import authRoutes from './routes/auth';
import measurementRoutes from './routes/measurements';
import { auth } from './middleware/auth';
import WebSocketService from './services/WebSocketService';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wsService = new WebSocketService(server);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Database sync
sequelize.sync({ alter: true })
  .then(() => console.log('Database synchronized'))
  .catch(err => console.error('Database sync error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/measurements', measurementRoutes);

// Initialize WebSocket service
app.set('wsService', wsService);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; 