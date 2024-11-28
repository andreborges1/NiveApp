// database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot(), // Certifique-se de que o módulo de configuração seja importado
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres', // Ajuste para o banco de dados desejado (postgres, mysql, etc)
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User, Appointment], // Coloque suas entidades aqui
        synchronize: true, // **Apenas para desenvolvimento, desative em produção**
        logging: true,
      }),
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      },
    }),
  ],
})
export class DatabaseModule {}
