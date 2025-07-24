import { Injectable } from '@nestjs/common';
import { CreateSenderDto } from './dto/create-sender.dto';
import { UpdateSenderDto } from './dto/update-sender.dto';

@Injectable()
export class SendersService {
  create(createSenderDto: CreateSenderDto) {
    return 'This action adds a new sender';
  }

  findAll() {
    return `This action returns all senders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sender`;
  }

  update(id: number, updateSenderDto: UpdateSenderDto) {
    return `This action updates a #${id} sender`;
  }

  remove(id: number) {
    return `This action removes a #${id} sender`;
  }
}
