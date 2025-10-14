import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EldersModule } from './modules/elders/elders.module';
// Removed broken StaffModule import (no such module file)
import { VitalsModule } from './modules/vitals/vitals.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { DevicesModule } from './modules/devices/devices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

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
        synchronize: false, // Set false cho production, dùng migrations
        options: {
          encrypt: configService.get('DB_ENCRYPT') === 'true',
          trustServerCertificate: configService.get('DB_TRUST_CERT') === 'true',
        },
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    EldersModule,
    // StaffModule is provided via ShiftsModule after fix
    VitalsModule,
    AlertsModule,
    ShiftsModule,
    DevicesModule,
    PaymentsModule,
    DashboardModule,
  ],
})
export class AppModule {}