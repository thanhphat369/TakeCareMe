import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EldersModule } from './modules/elders/elders.module';
import { StaffModule } from './modules/staff/staff.module';
import { VitalsModule } from './modules/vitals/vitals.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { DevicesModule } from './modules/devices/devices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { MedicationsModule } from './modules/medications/medications.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { MedicalHistoryModule } from './modules/medical-history/medical-history.module';
import { FamilyMembersModule  } from './modules/family-members/family-members.module';
import { HealthProfilesModule } from './modules/health-profiles/health-profiles.module';
import { KpiModule } from './modules/kpi/kpi.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CareModule } from './modules/care/care.module';
import { LabResultsModule } from './modules/lab-results/lab-results.module';
import { RehabilitationRecordsModule } from './modules/rehabilitation-records/rehabilitation-records.module';

@Module({
  imports: [
    ConfigModule.forRoot({   
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT'), 10) || 1433,
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
        logging: true,
        logger: 'advanced-console',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    EldersModule,
    StaffModule,
    VitalsModule,
    AlertsModule,
    ShiftsModule,
    DevicesModule,
    PaymentsModule,
    DashboardModule,
    MedicationsModule,
    AppointmentsModule,
    ProfilesModule,
    MedicalHistoryModule,
    FamilyMembersModule,
    HealthProfilesModule,
    KpiModule,
    NotificationsModule,
    CareModule,
    LabResultsModule,
    RehabilitationRecordsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
