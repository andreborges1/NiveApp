import {
  Body,
  Controller,
  Get,
  ValidationPipe,
  Post,
  UsePipes,
  NotFoundException,
  UseGuards,
  Delete,
  Req,
} from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { Param } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ParseDatePipe } from './pipes/parse-date.pipe';

@Controller()
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly appService: AppService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    console.log(
      req.user.sub,
      req,
      'Entrou no Profile esse é req.user.sub e req',
    );
    return await this.appService.findOne(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('userinformation')
  async getUserInfo(@Req() req) {
    const User = await this.appService.findOne(req.user.id);
    if (!User) {
      throw new NotFoundException('User not found');
    }
    console.log(User, User.name, User.firstName, User.picture);
    return {
      name: User.name,
      givenName: User.firstName,
      picture: User.picture,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('getappointments')
  async getAppointmentDates(@Req() req) {
    const result = await this.appService.findAllAppointmentDates(req.user.sub);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  @Post('createappointment')
  async create(@Body() createAppointmentDto: CreateAppointmentDto, @Req() req) {
    console.log(req.user.sub);
    return this.appService.createAppointment(
      req.user.sub,
      createAppointmentDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('deleteappointment')
  async deleteAppointment(
    @Body('appointmentDate', ParseDatePipe) appointmentDate: Date,
    @Req() req,
  ) {
    console.log(req.user.sub, appointmentDate);
    return this.appService.deleteAppointment(req.user.sub, appointmentDate);
  }
}
