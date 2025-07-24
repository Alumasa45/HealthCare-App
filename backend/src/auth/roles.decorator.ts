import { SetMetadata } from '@nestjs/common';
import { User_Type } from '../users/entities/user.entity';

export const Roles = (...roles: User_Type[]) => SetMetadata('roles', roles);