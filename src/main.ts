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
  app.useGlobalPipes(new ValidationPipe({
  }));

  app.use('/static', express.static(join(__dirname, '..', 'public')));

  const configService = app.get(ConfigService);
  const PORT = configService.getOrThrow<number>('PORT');

  app.use((req, res, next) => {
    if (req.path === '/') {
      return res.redirect('/api/docs');
    }
    next();
  });

  // Swagger configuration.
  const config = new DocumentBuilder()
    .setTitle('Healthcare Management System API.')
    .setDescription('Comprehensive API for managing healthcare services, patients, prescriptions, medicine order and tracking, pharmmacies, and medical records.')
    .setVersion('1.0')
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
    .addTag('TeleMedicineSessions', 'Tele Medicine orders management operations.')
    .addServer('http://localhost:3000', 'Development server')
    .addServer('http://api.healthcare.com', 'Production server')
    .build()
    
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
    customfavIcon: '/hospital.png'
  });

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  await app.listen(3000);
  console.log('🚀Server is running on port 3000.');
}
bootstrap();
