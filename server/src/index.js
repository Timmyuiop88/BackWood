import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { adminJs, adminRouter } from './admin/index.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import kycRoutes from './routes/kycRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// CORS middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Admin panel route - before body parser
app.use(adminJs.options.rootPath, adminRouter);

// Body parser middleware - after AdminJS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/kyc', kycRoutes);

// Add error handler last
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`AdminJS started on http://localhost:${PORT}/admin`);
}); 