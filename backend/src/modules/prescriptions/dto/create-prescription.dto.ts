// import { IsNotEmpty, IsOptional, IsDateString, IsNumber, IsArray, ValidateNested } from 'class-validator';
// import { Type } from 'class-transformer';

// export class MedicationItemDto {
//   @IsNotEmpty()
//   name: string;

//   @IsOptional()
//   dose?: string;

//   @IsOptional()
//   frequency?: string;

//   @IsOptional()
//   time?: string;

//   @IsOptional()
//   notes?: string;
// }

// export class CreatePrescriptionDto {
//   @IsNumber()
//   @IsNotEmpty()
//   elderId: number;

//   @IsNumber()
//   @IsNotEmpty()
//   prescribedBy: number;

//   @IsOptional()
//   diagnosis?: string;

//   @IsDateString()
//   @IsNotEmpty()
//   prescriptionDate: string;

//   @IsDateString()
//   @IsOptional()
//   startDate?: string;

//   @IsDateString()
//   @IsOptional()
//   endDate?: string;

//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => MedicationItemDto)
//   medications: MedicationItemDto[];
// }
