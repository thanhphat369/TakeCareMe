// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
//   UseGuards,
//   Query,
// } from '@nestjs/common';
// import { PrescriptionsService } from './prescriptions.service';
// import { CreatePrescriptionDto } from './dto/create-prescription.dto';
// import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';
// import { UserRole } from '../../entities/user.entity';

// @Controller('prescriptions')
// @UseGuards(JwtAuthGuard, RolesGuard)
// export class PrescriptionsController {
//   constructor(private readonly prescriptionsService: PrescriptionsService) {}

//   @Post()
//   @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF)
//   create(@Body() createDto: CreatePrescriptionDto) {
//     console.log('🔵 POST /prescriptions - Creating prescription');
//     console.log('📦 Body:', createDto);
//     return this.prescriptionsService.create(createDto);
//   }

//   @Get()
//   findAll(@Query('elderId') elderId?: string) {
//     if (elderId) {
//       return this.prescriptionsService.findByElder(Number(elderId));
//     }
//     return this.prescriptionsService.findAll();
//   }

//   @Get('elder/:elderId')
//   findByElder(@Param('elderId') elderId: string) {
//     return this.prescriptionsService.findByElder(Number(elderId));
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.prescriptionsService.findOne(Number(id));
//   }

//   @Patch(':id')
//   @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF)
//   update(@Param('id') id: string, @Body() updateDto: UpdatePrescriptionDto) {
//     return this.prescriptionsService.update(Number(id), updateDto);
//   }

//   @Delete(':id')
//   @Roles(UserRole.ADMIN, UserRole.DOCTOR)
//   remove(@Param('id') id: string) {
//     return this.prescriptionsService.remove(Number(id));
//   }
// }