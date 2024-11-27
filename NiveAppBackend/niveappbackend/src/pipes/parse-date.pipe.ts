import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform {
  transform(value: string): Date {
    const date = new Date(value);

    // Verificar se a data é inválida
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return date;
  }
}
