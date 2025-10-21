import { IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class CreateElderDto {
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @IsDateString()
  dob?: string;
  
  @IsOptional()
  age: number;
  
  @IsOptional()
  phone?: string;

  @IsNotEmpty()
  gender: string;

  @IsOptional()
  avatar?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  note?: string;

  @IsOptional()
  contactPhone?: string;

  @IsOptional()
  insuranceInfo?: string;

  @IsOptional()
  contactPersonId?: number;
}