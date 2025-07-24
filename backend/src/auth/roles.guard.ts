import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JWTPayload } from "src/auth/strategies/at.strategy";
import { Reflector } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { User, User_Type } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "src/users/dto/create-user.dto";


interface UserRequest extends Request {
    user?: JWTPayload;
}
const ROLES_KEY = 'roles';
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector,
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<User_Type[]>(ROLES_KEY,[
            context.getHandler(),
            context.getClass,
        ]);

        console.log('Required roles:', requiredRoles)

        if(!requiredRoles) {
            console.log('No roles required, allowing access...');
            return true;
        }
        const request = context.switchToHttp().getRequest<UserRequest>();
       const user = request.user as JWTPayload;

        const userProfile = await this.userRepository.findOne({
            where: { User_id: user.sub},
            select: ['User_id', 'User_Type'],
        });

       console.log('Token payload user:', user);
console.log('Database user:', userProfile);
console.log('Required roles:', requiredRoles);
console.log('Comparison:', {
  tokenRole: user?.User_Type,
  dbRole: User_Type.Admin,
  required: requiredRoles
});
       const hasRole = requiredRoles.some((User_Type) => user?.User_Type === User_Type);
       console.log('🎭 Has required role?', hasRole);
       
    

        if(!user) {
            return false;
        }

        console.log('Database user:', userProfile);

        if(!userProfile) {
            return false;
        }

        return requiredRoles.some((role) => userProfile?.User_Type.toLowerCase === role.toLowerCase);
    }
}