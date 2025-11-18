import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, Req,ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { EldersService } from './elders.service';
import { CreateElderDto } from './dto/create-elder.dto';
import { UpdateElderDto } from './dto/update-elder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('elders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EldersController {
  constructor(private readonly eldersService: EldersService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  create(@Body() createElderDto: CreateElderDto, @Req() req) {
    const user = req.user; // ✅ Lấy user từ token JWT
    console.log('Người tạo Elder:', user);
    return this.eldersService.create(createElderDto,user.userId);
  }

  @Get()
  findAll() {
    return this.eldersService.findAll();
  }

  @Post('upload-avatar')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads', 'avatars');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `elder-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Chỉ chấp nhận file hình ảnh (JPG, PNG, GIF)'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không có file được upload');
    }
    const fileUrl = `/uploads/avatars/${file.filename}`;
    return {
      url: fileUrl,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
    };
  }

  @Get(':elderId/primary')
  findOne(@Param('elderId', ParseIntPipe) elderId: number) {
    return this.eldersService.findOne(elderId);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  update(@Param('id') id: string, @Body() updateElderDto: UpdateElderDto) {
    return this.eldersService.update(id, updateElderDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.eldersService.remove(id);
  }

  @Patch(':id/medical-history')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  updateMedicalHistory(
    @Param('id') id: string,
    @Body() medicalHistoryData: any,
  ) {
    return this.eldersService.updateMedicalHistory(id, medicalHistoryData);
  }
}