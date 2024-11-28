/*
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { User } from './entities/user.entity';

@Injectable()
export class PollService {
  constructor(
    @InjectRepository(Appointment, User)
    private readonly pollRepository: Repository<Poll>,
  ) {}

  async createPoll(question: string, options: string[]): Promise<Poll> {
    const poll = this.pollRepository.create({ question, options });
    return this.pollRepository.save(poll);
  }

  async getAllPolls(): Promise<Poll[]> {
    return this.pollRepository.find();
  }
}
*/
