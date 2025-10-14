import { IsNotEmpty, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  elderId: number;

  @IsNotEmpty({ message: 'Tên dịch vụ không được để trống' })
  service: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  method?: string;

  @IsOptional()
  @IsInt()
  paidBy?: number;
}