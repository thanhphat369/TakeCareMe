import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('api/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FAMILY)
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  findAll(
    @Query('elderId', ParseIntPipe) elderId?: number,
    @Query('paidBy', ParseIntPipe) paidBy?: number,
    @Query('status') status?: string,
  ) {
    return this.paymentsService.findAll({ elderId, paidBy, status });
  }

  @Get('revenue')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getTotalRevenue(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.paymentsService.getTotalRevenue(
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Get('elder/:elderId/history')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FAMILY)
  getPaymentHistory(@Param('elderId', ParseIntPipe) elderId: number) {
    return this.paymentsService.getPaymentHistory(elderId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Patch(':id/mark-paid')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  markAsPaid(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.markAsPaid(id);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FAMILY)
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.cancel(id);
  }
}