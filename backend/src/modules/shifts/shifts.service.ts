import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';
import { Shift } from '../../entities/shift.entity';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import * as XLSX from 'xlsx';
import { User } from '../../entities/user.entity';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift)
    private shiftRepository: Repository<Shift>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createShiftDto: CreateShiftDto): Promise<Shift> {
    const shift = this.shiftRepository.create(createShiftDto);
    return this.shiftRepository.save(shift);
  }

  async findAll(filters?: {
    staffId?: number;
    status?: string;
    from?: Date;
    to?: Date;
  }): Promise<Shift[]> {
    const where: any = {};

    if (filters?.staffId) where.staffId = filters.staffId;
    if (filters?.status) where.status = filters.status;

    if (filters?.from && filters?.to) {
      where.startTime = Between(filters.from, filters.to);
    } else if (filters?.from) {
      where.startTime = MoreThanOrEqual(filters.from);
    } else if (filters?.to) {
      where.startTime = LessThanOrEqual(filters.to);
    }

    return this.shiftRepository.find({
      where,
      relations: ['staff', 'elders', 'elders.user'],
      order: { startTime: 'ASC' },
    });
  }

  async findOne(shiftId: number): Promise<Shift> {
    const shift = await this.shiftRepository.findOne({
      where: { shiftId },
      relations: ['staff', 'elders', 'elders.user'],
    });

    if (!shift) {
      throw new NotFoundException(`Không tìm thấy ca trực với ID ${shiftId}`);
    }

    return shift;
  }

  async update(shiftId: number, updateShiftDto: UpdateShiftDto): Promise<Shift> {
    const shift = await this.findOne(shiftId);
    Object.assign(shift, updateShiftDto);
    return this.shiftRepository.save(shift);
  }

  async remove(shiftId: number): Promise<void> {
    const shift = await this.findOne(shiftId);
    shift.status = 'Cancelled';
    await this.shiftRepository.save(shift);
  }

  async assignElders(shiftId: number, elderIds: number[]): Promise<Shift> {
    const shift = await this.shiftRepository.findOne({
      where: { shiftId },
      relations: ['elders'],
    });

    if (!shift) {
      throw new NotFoundException(`Không tìm thấy ca trực với ID ${shiftId}`);
    }

    // Update elders for this shift
    shift.elders = elderIds.map(id => ({ elderId: id } as any));
    return this.shiftRepository.save(shift);
  }

  async getMyShiftsToday(staffId: number): Promise<Shift[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.shiftRepository.find({
      where: {
        staffId,
        startTime: Between(today, tomorrow),
      },
      relations: ['elders', 'elders.user'],
      order: { startTime: 'ASC' },
    });
  }

  async getShiftsForStaff(
    staffId: number,
    filters?: {
      status?: string;
      from?: Date;
      to?: Date;
    },
  ): Promise<Shift[]> {
    return this.findAll({
      staffId,
      status: filters?.status,
      from: filters?.from,
      to: filters?.to,
    });
  }

  async startShift(shiftId: number): Promise<Shift> {
    const shift = await this.findOne(shiftId);
    const now = new Date();
    // Allow start only on the same calendar day and at/after scheduled start time
    const sameDay =
      now.getFullYear() === shift.startTime.getFullYear() &&
      now.getMonth() === shift.startTime.getMonth() &&
      now.getDate() === shift.startTime.getDate();
    if (!sameDay || now < shift.startTime) {
      throw new (require('@nestjs/common').BadRequestException)(
        'Chỉ được bắt đầu đúng ngày và sau thời gian bắt đầu đã lên lịch',
      );
    }
    shift.status = 'InProgress';
    return this.shiftRepository.save(shift);
  }

  async completeShift(shiftId: number): Promise<Shift> {
    const shift = await this.findOne(shiftId);
    shift.status = 'Completed';
    return this.shiftRepository.save(shift);
  }

  async importShifts(file: Express.Multer.File): Promise<{
    success: boolean;
    message: string;
    imported: number;
    failed: number;
    errors: string[];
  }> {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer', cellDates: false });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      // Use raw: true to get actual cell values, not formatted strings
      const data = XLSX.utils.sheet_to_json(worksheet, { raw: true, defval: '' }) as any[];

      if (!data || data.length === 0) {
        throw new BadRequestException('File không chứa dữ liệu');
      }

      let imported = 0;
      let failed = 0;
      const errors: string[] = [];

      // Expected columns: Mã nhân viên, Tên nhân viên, Ngày bắt đầu, Giờ bắt đầu, Ngày kết thúc, Giờ kết thúc, Địa điểm, Ghi chú
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          const staffId = parseInt(row['Mã nhân viên'] || row['Ma nhan vien'] || row['staffId']);
          if (!staffId || isNaN(staffId)) {
            errors.push(`Dòng ${i + 2}: Mã nhân viên không hợp lệ`);
            failed++;
            continue;
          }

          // Check if staff exists and has valid role
          const staff = await this.userRepository.findOne({
            where: { userId: staffId },
          });

          if (!staff) {
            errors.push(`Dòng ${i + 2}: Không tìm thấy nhân viên với mã ${staffId}`);
            failed++;
            continue;
          }

          // Validate staff role (only Staff or Doctor can have shifts)
          if (staff.role !== 'Staff' && staff.role !== 'Doctor') {
            errors.push(`Dòng ${i + 2}: Nhân viên với mã ${staffId} không có quyền được phân ca trực (chỉ Staff hoặc Doctor)`);
            failed++;
            continue;
          }

          // Get date/time values - could be string, number, or Date object
          const startDateValue = row['Ngày bắt đầu'] || row['Ngay bat dau'] || row['startDate'];
          const startTimeValue = row['Giờ bắt đầu'] || row['Gio bat dau'] || row['startTime'];
          const endDateValue = row['Ngày kết thúc'] || row['Ngay ket thuc'] || row['endDate'];
          const endTimeValue = row['Giờ kết thúc'] || row['Gio ket thuc'] || row['endTime'];

          if (startDateValue === null || startDateValue === undefined || startDateValue === '' ||
              startTimeValue === null || startTimeValue === undefined || startTimeValue === '' ||
              endDateValue === null || endDateValue === undefined || endDateValue === '' ||
              endTimeValue === null || endTimeValue === undefined || endTimeValue === '') {
            errors.push(`Dòng ${i + 2}: Thiếu thông tin thời gian`);
            failed++;
            continue;
          }

          // Helper function to parse date string (supports YYYY-MM-DD, DD/MM/YYYY, Date objects, and Excel serial numbers)
          const parseDate = (dateValue: any): Date | null => {
            if (dateValue === null || dateValue === undefined || dateValue === '') return null;
            
            // If it's already a Date object, validate and return
            if (dateValue instanceof Date) {
              if (!isNaN(dateValue.getTime())) {
                return dateValue;
              }
              return null;
            }
            
            // Convert to string if it's a number (Excel serial date)
            let dateStr: string;
            if (typeof dateValue === 'number') {
              // Excel serial date: days since 1900-01-01
              // Excel incorrectly treats 1900 as a leap year, so we need to adjust
              const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
              const date = new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
              if (!isNaN(date.getTime())) {
                return date;
              }
              return null;
            }
            
            dateStr = String(dateValue).trim();
            if (!dateStr) return null;
            
            // Try YYYY-MM-DD format first
            const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (isoMatch) {
              const year = parseInt(isoMatch[1], 10);
              const month = parseInt(isoMatch[2], 10) - 1; // Month is 0-indexed
              const day = parseInt(isoMatch[3], 10);
              const date = new Date(year, month, day);
              if (!isNaN(date.getTime()) && date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
                return date;
              }
            }
            
            // Try DD/MM/YYYY format
            const ddmmyyyyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (ddmmyyyyMatch) {
              const day = parseInt(ddmmyyyyMatch[1], 10);
              const month = parseInt(ddmmyyyyMatch[2], 10) - 1; // Month is 0-indexed
              const year = parseInt(ddmmyyyyMatch[3], 10);
              const date = new Date(year, month, day);
              if (!isNaN(date.getTime()) && date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
                return date;
              }
            }
            
            // Try DD-MM-YYYY format
            const ddmmyyyyDashMatch = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
            if (ddmmyyyyDashMatch) {
              const day = parseInt(ddmmyyyyDashMatch[1], 10);
              const month = parseInt(ddmmyyyyDashMatch[2], 10) - 1; // Month is 0-indexed
              const year = parseInt(ddmmyyyyDashMatch[3], 10);
              const date = new Date(year, month, day);
              if (!isNaN(date.getTime()) && date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
                return date;
              }
            }
            
            // Try native Date parsing as fallback
            const parsed = new Date(dateStr);
            if (!isNaN(parsed.getTime())) {
              return parsed;
            }
            
            return null;
          };

          // Helper function to parse time string (supports HH:mm, HH:mm:ss, and Excel time decimals)
          const parseTime = (timeValue: any): string | null => {
            if (timeValue === null || timeValue === undefined) return null;
            
            // Convert to string if it's a number (Excel time as decimal fraction of day)
            let timeStr: string;
            if (typeof timeValue === 'number') {
              // Excel time: decimal fraction of a day (0.5 = 12:00:00)
              const totalSeconds = Math.floor(timeValue * 24 * 60 * 60);
              const hours = Math.floor(totalSeconds / 3600);
              const minutes = Math.floor((totalSeconds % 3600) / 60);
              const seconds = totalSeconds % 60;
              return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
            
            timeStr = String(timeValue).trim();
            if (!timeStr) return null;
            
            // Match HH:mm or HH:mm:ss format
            const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
            if (timeMatch) {
              const hours = parseInt(timeMatch[1], 10);
              const minutes = parseInt(timeMatch[2], 10);
              
              // Validate hours and minutes
              if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
                return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
              }
            }
            
            return null;
          };

          // Parse dates
          const startDate = parseDate(startDateValue);
          const endDate = parseDate(endDateValue);
          
          if (!startDate || !endDate) {
            errors.push(`Dòng ${i + 2}: Định dạng ngày không hợp lệ. Giá trị: "${startDateValue}" / "${endDateValue}". Hỗ trợ: YYYY-MM-DD hoặc DD/MM/YYYY`);
            failed++;
            continue;
          }

          // Parse times
          const startTimeFormatted = parseTime(startTimeValue);
          const endTimeFormatted = parseTime(endTimeValue);
          
          if (!startTimeFormatted || !endTimeFormatted) {
            errors.push(`Dòng ${i + 2}: Định dạng giờ không hợp lệ. Giá trị: "${startTimeValue}" / "${endTimeValue}". Hỗ trợ: HH:mm (ví dụ: 08:00, 16:00)`);
            failed++;
            continue;
          }

          // Combine date and time - use local timezone to avoid timezone issues
          const [startHours, startMinutes] = startTimeFormatted.split(':').map(Number);
          const [endHours, endMinutes] = endTimeFormatted.split(':').map(Number);
          
          const startDateTime = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
            startHours,
            startMinutes,
            0
          );
          
          const endDateTime = new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate(),
            endHours,
            endMinutes,
            0
          );

          if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            errors.push(`Dòng ${i + 2}: Không thể tạo thời gian từ ngày và giờ đã cho. Ngày: ${startDateValue}/${endDateValue}, Giờ: ${startTimeValue}/${endTimeValue}`);
            failed++;
            continue;
          }

          if (endDateTime <= startDateTime) {
            errors.push(`Dòng ${i + 2}: Thời gian kết thúc phải sau thời gian bắt đầu`);
            failed++;
            continue;
          }

          // Validate that shift duration is reasonable (not more than 24 hours)
          const durationHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
          if (durationHours > 24) {
            errors.push(`Dòng ${i + 2}: Thời lượng ca trực không được vượt quá 24 giờ`);
            failed++;
            continue;
          }

          const location = row['Địa điểm'] || row['Dia diem'] || row['location'] || null;
          const note = row['Ghi chú'] || row['Ghi chu'] || row['note'] || null;

          // Create shift
          const createShiftDto: CreateShiftDto = {
            staffId,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            location,
            note,
          };

          await this.create(createShiftDto);
          imported++;
        } catch (error: any) {
          errors.push(`Dòng ${i + 2}: ${error.message || 'Lỗi không xác định'}`);
          failed++;
        }
      }

      return {
        success: imported > 0,
        message:
          imported > 0
            ? `Import thành công ${imported} ca trực. ${failed > 0 ? `${failed} ca trực bị lỗi.` : ''}`
            : `Import thất bại. Tất cả ${failed} ca trực đều bị lỗi.`,
        imported,
        failed,
        errors: errors.slice(0, 10), // Limit errors to first 10
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Lỗi khi import file: ${error.message || 'File không hợp lệ'}`
      );
    }
  }
}