import { IsInt, IsDate, IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAppointmentDto {
  @Transform(({ value }) => new Date(value))
  @IsDate()
  appointmentDate: Date;

  @IsString()
  serviceType: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
