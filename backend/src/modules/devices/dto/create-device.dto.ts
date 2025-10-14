import { IsNotEmpty, IsInt } from 'class-validator';

export class CreateDeviceDto {
  @IsInt()
  elderId: number;

  @IsNotEmpty({ message: 'Loại thiết bị không được để trống' })
  type: string;
}