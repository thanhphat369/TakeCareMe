// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Medication } from '../../entities/medication.entity';
// import { PrescriptionsController } from './prescriptions.controller';
// import { PrescriptionsService } from './prescriptions.service';

// @Module({
//   imports: [TypeOrmModule.forFeature([Medication])], // CHỈ import Medication
//   controllers: [PrescriptionsController],
//   providers: [PrescriptionsService],
//   exports: [PrescriptionsService],
// })
// export class PrescriptionsModule {}