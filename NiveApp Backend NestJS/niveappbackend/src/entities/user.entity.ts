import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Appointment } from './appointment.entity'; // Ajuste o caminho conforme necessário
import { Role } from 'src/auth/enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string; // Nome do usuário

  @Column({ length: 100, nullable: true })
  firstName: string; // Nome do usuário

  @Column({ length: 100, nullable: true })
  lastName: string; // Nome do usuário

  @Column({ length: 250, nullable: true })
  picture: string; // Nome do usuário

  @Column({ nullable: true })
  hashedAccessToken: string;

  @Column({ nullable: true })
  hashedRefreshToken: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({ unique: true }) // Garante que o e-mail seja único
  email: string; // E-mail do usuário

  @Column()
  platform: string; // Plataforma utilizada para registro, como "Facebook", "Google", etc.

  @Column({ nullable: true, unique: true })
  clerkId: string; // Plataforma utilizada para registro, como "Facebook", "Google", etc.

  @CreateDateColumn()
  createdAt: Date; // Data de criação do usuário

  @OneToMany(() => Appointment, (appointment) => appointment.user)
  appointments: Appointment[]; // Relacionamento com a entidade Appointment
}
