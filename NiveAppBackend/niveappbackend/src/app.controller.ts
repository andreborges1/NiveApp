import {
  Body,
  Controller,
  Get,
  ValidationPipe,
  Post,
  UsePipes,
  NotFoundException,
  UseGuards,
  Request,
  Delete,
  Req,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Param } from '@nestjs/common';
import { Role } from 'src/auth/enums/role.enum';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Public } from './auth/decorators/public.decorator';
import { AuthService } from './auth/auth.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment } from './entities/appointment.entity';
import { ParseDatePipe } from './pipes/parse-date.pipe'; // Pipe para validar e converter a data
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import jwtConfig from './auth/config/jwt.config';

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

  @UseGuards(JwtAuthGuard) // Protege a rota com autenticação JWT
  @Get('userinformation') // Define que esta é uma rota GET
  async getUserInfo(@Req() req) {
    const User = await this.appService.findOne(req.user.id); // Encontre o usuário com base no ID do token
    if (!User) {
      throw new NotFoundException('User not found'); // Lança uma exceção se o usuário não for encontrado
    }
    console.log(User, User.name, User.firstName, User.picture);
    return {
      name: User.name,
      givenName: User.firstName,
      picture: User.picture,
    };
  }

  @Get('all') // Rota /users/all
  async findAll(): Promise<User[]> {
    return await this.appService.findAll(); // Chama o método findAll do serviço
  }

  @Get('findappoint') // Rota /users/all
  async findAlls() {
    return await this.appService.appointments(); // Chama o método findAll do serviço
  }

  @UseGuards(JwtAuthGuard)
  @Get('getappointments')
  async getAppointmentDates(@Req() req) {
    const result = await this.appService.findAllAppointmentDates(req.user.sub);
    return result;
  }

  @Get('testuserid/:id')
  async clerkUserIds(@Param('id') id: string) {
    //   const userId = await this.appService.clerkLogin(id);
    //   return userId;
  }

  @Get('removeuser/:id')
  async remvoe(@Param('id') id: number) {
    return this.appService.removeUser(id);
  }

  @Post('email')
  async finduserbyemail(@Body('email') email: string) {
    const user = await this.appService.findbyEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.name;
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
