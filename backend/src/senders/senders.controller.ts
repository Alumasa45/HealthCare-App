import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SendersService } from './senders.service';
import { CreateSenderDto } from './dto/create-sender.dto';
import { UpdateSenderDto } from './dto/update-sender.dto';

@Controller('senders')
export class SendersController {
  constructor(private readonly sendersService: SendersService) {}

  @Post()
  create(@Body() createSenderDto: CreateSenderDto) {
    return this.sendersService.create(createSenderDto);
  }

  @Get()
  findAll() {
    return this.sendersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sendersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSenderDto: UpdateSenderDto) {
    return this.sendersService.update(+id, updateSenderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sendersService.remove(+id);
  }
}
