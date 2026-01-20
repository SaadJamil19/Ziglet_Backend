import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { AppDataSource } from './data-source';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // set `RateLimit` and `RateLimit-Policy` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Routes
import authRoutes from './routes/auth.routes';
import socialRoutes from './routes/social.routes';
import taskRoutes from './routes/task.routes';
import adminRoutes from './routes/admin.routes';
import memeRoutes from './routes/meme.routes';

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/submissions/meme', memeRoutes);
app.use('/api/admin', adminRoutes);

// Database & Server Start
// Database & Server Start
if (process.env.NODE_ENV !== 'test') {
    AppDataSource.initialize()
        .then(() => {
            console.log('✅ Data Source has been initialized!');
            app.listen(PORT, () => {
                console.log(`🚀 Server running on port ${PORT}`);
            });
        })
        .catch((err) => {
            console.error('❌ Error during Data Source initialization:', err);
        });
}

export default app;
