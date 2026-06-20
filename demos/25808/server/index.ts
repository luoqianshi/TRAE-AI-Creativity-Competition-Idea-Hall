import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { loginRateLimit } from './middleware/rateLimit';
import generalLimiter from './middleware/generalRateLimit';
import authRoutes from './routes/auth';
import routes from './routes/index';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use('/api', generalLimiter);

// 限流（仅登录接口）
app.use('/api/auth/login', loginRateLimit);

// 路由
app.use('/api/auth', authRoutes);
app.use('/api', routes);

// 错误处理
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Server] 运行在 http://localhost:${PORT}`);
});

export default app;
