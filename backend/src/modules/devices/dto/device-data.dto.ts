import { IsNotEmpty, IsNumber, IsIn } from 'class-validator';

export class DeviceDataDto {
  @IsNotEmpty()
  @IsIn(['BP_systolic', 'BP_diastolic', 'HR', 'Glucose', 'SpO2', 'Temp', 'Weight', 'Steps'])
  type: string;

  @IsNumber()
  value: number;

  @IsNotEmpty()
  unit: string;
}