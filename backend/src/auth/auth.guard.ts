import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { jwtConstants } from './constants';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      console.log('❌ No token extracted from header');
      throw new UnauthorizedException('Access token not found');
    }

    console.log('✅ Token extracted successfully, length:', token.length);

    try {
      const secret =
        this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET') ||
        this.configService.get<string>('JWT_SECRET') ||
        jwtConstants.secret;

      console.log(
        '🔑 Using JWT secret (first 10 chars):',
        secret.substring(0, 10) + '...',
      );
      console.log(
        '🔍 Token format check - starts with eyJ:',
        token.startsWith('eyJ'),
      );

      const payload = await this.jwtService.verifyAsync(token, {
        secret: secret,
      });

      console.log('✅ JWT verification successful, user:', payload.Email);
      request.user = payload;
    } catch (error) {
      console.error('❌ JWT verification failed:', error.message);
      console.error('❌ Error type:', error.name);
      console.error(
        '❌ Token that failed (first 50 chars):',
        token.substring(0, 50) + '...',
      );

      if (error.message === 'jwt malformed') {
        console.error('❌ JWT malformed - token format is invalid');
        console.error('❌ Token length:', token.length);
        console.error('❌ Token starts with:', token.substring(0, 10));
      }

      throw new UnauthorizedException('Invalid or expired token');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    console.log('🔍 Full Authorization Header:', authHeader);

    if (!authHeader) {
      console.log('❌ No Authorization header found');
      return undefined;
    }

    const [type, token] = authHeader.split(' ') ?? [];
    console.log('🔍 Header Type:', type);
    console.log(
      '🔍 Token Preview:',
      token ? token.substring(0, 20) + '...' : 'No token',
    );

    if (type !== 'Bearer') {
      console.log('❌ Invalid header type, expected Bearer but got:', type);
      return undefined;
    }

    if (!token) {
      console.log('❌ No token found after Bearer');
      return undefined;
    }

    return token;
  }
}
