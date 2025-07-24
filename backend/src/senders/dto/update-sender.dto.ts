import { PartialType } from '@nestjs/swagger';
import { CreateSenderDto } from './create-sender.dto';

export class UpdateSenderDto extends PartialType(CreateSenderDto) {}
