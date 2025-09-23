import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './api/auth';
import publishRoutes from './api/publish';

const app = express();
const PORT = process.env.PORT || 8080;

// --- ROBUST CORS CONFIGURATION ---
const corsOptions = {
    // This must be the exact origin of your frontend
    origin: process.env.FRONTEND_URL,

    // Allow the browser to send credentials (cookies, etc.) if needed
    credentials: true,

    // Explicitly allow the methods your app uses
    methods: ['GET', 'POST', 'OPTIONS'],

    // Explicitly allow the headers your frontend is sending
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// THE CHANGE IS HERE: We only need to use the cors middleware once.
// It will automatically handle OPTIONS preflight requests for all subsequent routes.
app.use(cors(corsOptions));

// This problematic line has been removed:
// app.options('*', cors(corsOptions));

// --- END CORS CONFIGURATION ---

app.use(express.json({ limit: 'mb' }));

app.use('/user', authRoutes); // Now correctly handles OPTIONS requests for /user/*
app.use('/api', publishRoutes); // Now correctly handles OPTIONS requests for /api/*

app.listen(PORT, () => {
    console.log(`🚀 Express backend running on http://localhost:${PORT}`);
});
