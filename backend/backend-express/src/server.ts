import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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

app.use(helmet({
    contentSecurityPolicy: false, // CSP is managed at the frontend/CDN level
    crossOriginEmbedderPolicy: false, // Allow cross-origin resources
}));

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));

app.use('/user', authRoutes);
app.use('/api', publishRoutes);

app.listen(PORT, () => {
    // Clean startup log
});
