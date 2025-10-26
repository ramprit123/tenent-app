import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, {
      logger:
        process.env.NODE_ENV === 'production'
          ? ['error', 'warn']
          : ['log', 'debug', 'error', 'verbose', 'warn'],
    });

    // Security middleware
    app.use(
      helmet({
        contentSecurityPolicy: process.env.NODE_ENV === 'production',
        crossOriginEmbedderPolicy: false,
      }),
    );

    // Rate limiting
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: process.env.NODE_ENV === 'production' ? 100 : 1000, // limit each IP to 100 requests per windowMs in production
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
      }),
    );

    // Compression middleware
    app.use(compression());

    // Enable CORS with enhanced security
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      process.env.FRONTEND_URL || 'http://localhost:3000',
    ];

    app.enableCors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      maxAge: 86400, // 24 hours
    });

    // Use cookie parser with security options
    app.use(cookieParser(process.env.COOKIE_SECRET));

    // Enhanced validation pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: process.env.NODE_ENV === 'production',
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Graceful shutdown
    app.enableShutdownHooks();

    const port = parseInt(process.env.PORT!, 10) || 4000;
    const host = process.env.HOST || '0.0.0.0';

    await app.listen(port, host);

    logger.log(`🚀 Application is running on: http://${host}:${port}`);
    logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    logger.error('❌ Error starting server', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
