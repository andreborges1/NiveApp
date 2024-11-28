import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { EntityManager } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment } from './entities/appointment.entity';
import { AuthService } from './auth/auth.service';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  constructor(@InjectEntityManager() private entityManager: EntityManager) {}

  async updateHashedRefreshToken(userId: number, hashedRefreshToken: string) {
    return await this.entityManager.update(
      User,
      { id: userId },
      { hashedRefreshToken },
    );
  }

  async updateHashedAccessToken(userId: number, hashedAccessToken: string) {
    return await this.entityManager.update(
      User,
      { id: userId },
      { hashedAccessToken },
    );
  }

  async createUserOverClerk(id) {
    const sendUserData = id;
    if (!sendUserData) {
      return 'clerkFail';
    }
    const email = sendUserData.emailAddresses[0]?.emailAddress;
    const userDataId = sendUserData.id;
    const name = sendUserData.firstName + ' ' + sendUserData.lastName;
    const firstName = sendUserData.firstName;
    const lastName = sendUserData.lastName;
    const picture = sendUserData.imageUrl;
    const createUser = await this.entityManager.create(User, {
      name,
      firstName,
      lastName,
      email,
      username: firstName,
      picture,
      platform: 'Google',
      clerkId: userDataId,
    });
    const createdUser = await this.entityManager.save(createUser);
    return createdUser;
  }

  async create(dto: CreateUserDto) {
    try {
      const NewUser = this.entityManager.create(User, dto); // Cria uma nova instância de User
      const saveUser = await this.entityManager.save(NewUser); // Salva o usuário no banco de dados
      return saveUser;
    } catch (error) {
      return { message: 'Error in user creation!' };
    }
  }

  async findAll(): Promise<User[]> {
    return await this.entityManager.find(User); // Busca todos os registros da tabela users
  }

  async appointments() {
    return await this.entityManager.find(Appointment); // Busca todos os registros da tabela users
  }

  async findAllAppointmentDates(userId: number): Promise<{
    appointments: { appointmentDate: Date; serviceType: string }[];
    scheduledDates: Date[];
  }> {
    // Obtenha todos os agendamentos
    const appointments = await this.entityManager
      .createQueryBuilder(Appointment, 'appointment')
      .innerJoinAndSelect('appointment.user', 'user')
      .select([
        'appointment.appointmentDate',
        'appointment.serviceType',
        'user.id',
      ])
      .orderBy('appointment.appointmentDate', 'ASC')
      .getMany();

    const numericUserId = Number(userId);

    // Agora, retornamos um novo objeto com o formato desejado
    return {
      appointments: appointments
        .filter((a) => a.user.id === numericUserId) // Filtra os agendamentos do usuário
        .map((a) => ({
          appointmentDate: a.appointmentDate, // Adiciona a data do agendamento
          serviceType: a.serviceType, // Adiciona o tipo de serviço
        })),
      scheduledDates: appointments
        .filter((a) => a.user.id !== numericUserId) // Filtra os agendamentos dos outros usuários
        .map((a) => a.appointmentDate), // Apenas as datas dos outros agendamentos
    };
  }

  async findOne(id: number) {
    return this.entityManager.findOne(User, {
      where: { id },
      select: ['name', 'firstName', 'email', 'picture', 'role'],
    });
  }

  async findName(name: string) {
    return this.entityManager.findOne(User, {
      where: { name },
      select: ['id', 'name', 'hashedRefreshToken', 'role'],
    });
  }

  async findbyEmail(email: string) {
    return await this.entityManager.findOne(User, { where: { email } });
  }

  async findByClerk(clerkId: string) {
    return await this.entityManager.findOne(User, { where: { clerkId } });
  }

  async removeUser(id: number) {
    return await this.entityManager.delete(User, id);
  }

  async createAppointment(
    sub: number,
    createAppointmentDto: CreateAppointmentDto,
  ) {
    const { appointmentDate, serviceType, notes } = createAppointmentDto;

    // Converte appointmentDate para Date
    const date = new Date(appointmentDate);

    if (isNaN(date.getTime())) {
      return { success: false, message: 'Data do agendamento inválida.' };
    }

    // Recupera o usuário com os agendamentos
    const user = await this.entityManager.findOne(User, {
      where: { id: sub },
      relations: ['appointments'],
    });

    if (!user) {
      return { success: false, message: 'Usuário não encontrado' };
    }

    // Verifica se o usuário já tem 2 agendamentos
    if (user.appointments.length >= 2) {
      return { success: false, message: 'O usuário já tem 2 agendamentos.' };
    }

    // Verifica se já existe um agendamento no mesmo horário para o mesmo usuário
    const isConflictForUser = user.appointments.some(
      (appointment) =>
        new Date(appointment.appointmentDate).getTime() === date.getTime(),
    );

    if (isConflictForUser) {
      return {
        success: false,
        message: 'Já existe um agendamento neste horário para este usuário.',
      };
    }

    // Verifica se o horário já está ocupado por outros usuários
    const otherAppointments = await this.entityManager.find(Appointment, {
      where: { appointmentDate: date },
    });

    if (otherAppointments.length > 0) {
      return {
        success: false,
        message: 'Já existe um agendamento neste horário para outro usuário.',
      };
    }

    // Cria o novo agendamento
    const newAppointment = this.entityManager.create(Appointment, {
      appointmentDate: date,
      serviceType,
      notes,
      user,
    });

    // Salva o novo agendamento
    await this.entityManager.save(Appointment, newAppointment);

    // Retorna a resposta de sucesso com a mensagem
    return { success: true, message: 'Agendamento criado com sucesso.' };
  }

  async deleteAppointment(userId: number, appointmentDate: Date) {
    // Normalizando as datas para comparar apenas a parte da data (ignorando a hora)
    const normalizeDate = (date: Date) => {
      const normalized = new Date(date);
      normalized.setHours(0, 0, 0, 0); // Define a hora para 00:00:00
      return normalized;
    };
    console.log('entrou no delete', userId);
    const normalizedAppointmentDate = normalizeDate(appointmentDate);

    // Recupera o usuário com seus agendamentos
    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
      relations: ['appointments'], // Carrega os agendamentos do usuário
    });

    if (!user) {
      return { success: false, message: 'Usuário não encontrado.' };
    }

    if (!user.appointments || user.appointments.length === 0) {
      return { success: false, message: 'Usuário não possui agendamentos.' };
    }

    // Encontra o agendamento correspondente à data informada
    const appointment = user.appointments.find((appointment) => {
      const normalizedDbDate = normalizeDate(appointment.appointmentDate);
      return normalizedDbDate.getTime() === normalizedAppointmentDate.getTime();
    });

    if (!appointment) {
      return {
        success: false,
        message: 'Agendamento não encontrado para esta data.',
      };
    }

    // Remove o agendamento encontrado
    await this.entityManager.remove(Appointment, appointment);

    return { success: true, message: 'Agendamento excluído com sucesso.' };
  }
}
