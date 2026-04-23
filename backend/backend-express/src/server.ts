import dotenv from 'dotenv';
import path from 'path';

// Load .env from the backend-express directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import authRoutes from './api/auth';
import publishRoutes from './api/publish';

const app = express();
const PORT = process.env.PORT || 8080;

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,

    methods: ['GET', 'POST', 'OPTIONS'],

    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));

app.use('/user', authRoutes);
app.use('/api', publishRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Express backend running on http://localhost:${PORT}`);
});
