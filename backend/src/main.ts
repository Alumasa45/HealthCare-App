import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './http-exception.filter';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({}));

  app.use('/static', express.static(join(__dirname, '..', 'public')));

  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT', 3001); // Default to 3001 if PORT not set

  app.use((req, res, next) => {
    if (req.path === '/') {
      return res.redirect('/api/docs');
    }
    next();
  });

  // Swagger configuration.
  const config = new DocumentBuilder()
    .setTitle('Healthcare Management System API.')
    .setDescription(
      'Comprehensive API for managing healthcare services, patients, prescriptions, medicine order and tracking, pharmmacies, and medical records.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .addTag('Users', 'Users management operations.')
    .addTag('Patients', 'Patient management operations.')
    .addTag('Doctors', 'Doctor management operations.')
    .addTag('Addresses', 'Address management operations.')
    .addTag('MedicalRecords', 'Medical records management operations.')
    .addTag('Appointments', 'Appointment scheduling operations')
    .addTag('DoctorSchedule', 'Manages doctor schedules.')
    .addTag('AppointmentSlots', 'Appointment slots management.')
    .addTag('Pharmacies', 'Pharmacy management operations.')
    .addTag('Medicines', 'Medicine management operations.')
    .addTag('PharmacyInventory', 'Pharmacy inventory management operations.')
    .addTag('Prescriptions', 'Prescriptions management operations.')
    .addTag('PrescriptionItems', 'Prescription items management operations.')
    .addTag('MedicineOrders', 'Medicine orders management operations.')
    .addTag(
      'TeleMedicineSessions',
      'Tele Medicine orders management operations.',
    )
    .addTag('Billing', 'Billing and payment management operations.')
    .addServer('http://localhost:3001', 'Development server')
    .addServer('https://healthcare-app-60pj.onrender.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/api-json',
    yamlDocumentUrl: '/api-yaml',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin-bottom: 20px; }
      .swagger-ui .topbar-wrapper img {
        content: url('https://example.com/path-to-your-logo.png');
        width: 120px;
        height: auto;
      }
      .swagger-ui .scheme-container { margin-top: 20px; }
    `,
    customSiteTitle: 'HealthCare Management API Documentation.',
    customfavIcon: '/hospital.png',
  });

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  // Enhanced CORS configuration for Swagger and frontend
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  app.enableCors({
    origin: isProduction
      ? [
          'https://healthcare-app-60pj.onrender.com', // Your deployed backend (for Swagger)
          'https://your-frontend-deployment-url.com', // Your deployed frontend
          'http://localhost:3000', // Allow local development
        ]
      : [
          'http://localhost:3000', // React frontend (development)
          'http://localhost:3001', // Backend/Swagger
          'http://127.0.0.1:3001', // Alternative localhost
          'http://localhost:5173', // Vite dev server
          'http://127.0.0.1:3000', // Alternative localhost for frontend
          'https://healthcare-app-60pj.onrender.com', // Also allow production URL in dev
        ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Access-Control-Allow-Headers',
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  await app.listen(PORT);
  console.log(`🚀Server is running on port ${PORT}.`);
}
bootstrap();
