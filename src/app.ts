import express from 'express';
import cors from 'cors';
import  {errorHandler}  from './middleware/errorHandler.js';
import healthRoutes from './routes/health.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

const app = express();

app.use(cors());
app.use(express.json());


app.use('/health', healthRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(errorHandler);

export default app;
