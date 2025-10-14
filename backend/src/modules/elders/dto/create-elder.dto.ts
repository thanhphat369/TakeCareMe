import { IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class CreateElderDto {
  @IsNotEmpty()
  fullName: string;

  @IsDateString()
  dob: Date;

  @IsNotEmpty()
  gender: string;

  @IsOptional()
  avatar?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  contactPhone?: string;

  @IsOptional()
  insuranceInfo?: string;

  @IsOptional()
  contactPersonId?: number;
}