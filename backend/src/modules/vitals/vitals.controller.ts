import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query,
  UseGuards 
} from '@nestjs/common';
import { VitalsService } from './vitals.service';
import { CreateVitalReadingDto } from './dto/create-vital-reading.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/elders/:elderId/vitals')
@UseGuards(JwtAuthGuard)
export class VitalsController {
  constructor(private readonly vitalsService: VitalsService) {}

  @Post()
  create(
    @Param('elderId') elderId: string,
    @Body() createVitalReadingDto: CreateVitalReadingDto,
  ) {
    return this.vitalsService.create({
      ...createVitalReadingDto,
      elderId: Number(elderId),
    });
  }

  @Get()
  findByElder(
    @Param('elderId') elderId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.vitalsService.findByElder(Number(elderId), fromDate, toDate);
  }
}