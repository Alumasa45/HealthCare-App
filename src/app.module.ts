import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AddressesModule } from './addresses/addresses.module';
import { PatientsModule } from './patients/patients.module';
import { MedicalRecordsModule } from './medical_records/medical_records.module';
import { DoctorsModule } from './doctors/doctors.module';
import { DoctorScheduleModule } from './doctor_schedule/doctor_schedule.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AppointmentSlotsModule } from './appointment_slots/appointment_slots.module';
import { PharmaciesModule } from './pharmacies/pharmacies.module';
import { MedicinesModule } from './medicines/medicines.module';
import { PharmacyInventoryModule } from './pharmacy_inventory/pharmacy_inventory.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { PrescriptionItemsModule } from './prescription_items/prescription_items.module';
import { MedicineOrdersModule } from './medicine_orders/medicine_orders.module';
import { TeleMedicineSessionsModule } from './tele-medicine_sessions/tele-medicine_sessions.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './config/database.module';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UsersModule,
    AddressesModule,
    PatientsModule,
    MedicalRecordsModule,
    DoctorsModule,
    DoctorScheduleModule,
    AppointmentsModule,
    AppointmentSlotsModule,
    PharmaciesModule,
    MedicinesModule,
    PharmacyInventoryModule,
    PrescriptionsModule,
    PrescriptionItemsModule,
    MedicineOrdersModule,
    TeleMedicineSessionsModule,
    ProfilesModule,
    DatabaseModule,
    JwtModule.register({
      global: true,
          secret: process.env.JWT_SECRET || 'your-secret-key',
          signOptions: { expiresIn: '1h' },
        }),
    AuthModule,
  ],
  // TypeOrmModule.forRoot({
  //   type: 'postgres',
  //   host: process.env.DB_HOST || 'localhost',
  //   port:  5433,
  //   username: process.env.DB_USERNAME || 'postgres',
  //   password: process.env.DB_PASSWORD || 'aquinattaayo',
  //   database: process.env.DB_DATABASE || 'healthcare',
  //   entities: [__dirname + '/**/*.entity{.ts,.js}'],
  //   synchronize: process.env.DB_SYNC === 'true' || true,
  //   logging: process.env.DB_LOGGING === 'true' || false,
  // }),

  controllers: [],
  providers: [],
})
export class AppModule {}
