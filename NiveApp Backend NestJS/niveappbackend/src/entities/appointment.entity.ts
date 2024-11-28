import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../entities/user.entity'; // Ajuste o caminho aqui

@Entity('appointments')
@Index('IDX_APPOINTMENT_DATE', ['appointmentDate']) // Índice na coluna appointmentDate
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp with time zone' })
  appointmentDate: Date; // Data e hora do agendamento

  @Column({ length: 100 }) // Tipo de serviço, por exemplo "Corte de Cabelo"
  serviceType: string;

  @Column({ length: 250, nullable: true }) // Observação de até 250 caracteres
  notes: string;

  @ManyToOne(() => User, (user) => user.appointments, { eager: true })
  user: User; // Relaciona com a entidade User, mostrando o cliente do agendamento

  @CreateDateColumn()
  createdAt: Date; // Data de criação do agendamento para auditoria
}
