import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VitalsService } from './vitals.service';
import { CreateVitalReadingDto } from './dto/create-vital-reading.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class VitalsController {
  constructor(private readonly vitalsService: VitalsService) {}

  @Post('elders/:elderId/vitals')
  create(
    @Param('elderId') elderId: string,
    @Body() createVitalReadingDto: CreateVitalReadingDto,
  ) {
    return this.vitalsService.create({
      ...createVitalReadingDto,
      elderId: Number(elderId),
    });
  }

  @Get('elders/:elderId/vitals')
  findByElder(
    @Param('elderId') elderId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    const limitNumber = limit ? Number(limit) : undefined;

    return this.vitalsService.findByElder(
      Number(elderId),
      fromDate,
      toDate,
      Number.isFinite(limitNumber) && limitNumber! > 0 ? limitNumber : undefined,
    );
  }

  @Post('vitals/import')
  @UseInterceptors(FileInterceptor('file'))
  async importVitals(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new (require('@nestjs/common').BadRequestException)('Không có file được upload');
    }
    return this.vitalsService.importVitals(file);
  }
}