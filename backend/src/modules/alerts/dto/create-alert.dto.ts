import { IsNotEmpty, IsInt, IsIn, IsOptional } from 'class-validator';

export class CreateAlertDto {
  @IsInt()
  elderId: number;

  @IsNotEmpty({ message: 'Loại cảnh báo không được để trống' })
  type: string;

  @IsIn(['Low', 'Medium', 'High', 'Critical'], { message: 'Mức độ không hợp lệ' })
  severity: string;

  @IsOptional()
  notes?: string;

  @IsOptional()
  @IsInt()
  assignedTo?: number;
}
