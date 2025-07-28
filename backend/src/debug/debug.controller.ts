import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('debug')
export class DebugController {
  @Get('public')
  @Public()
  getPublicData() {
    return {
      message: 'This is a public endpoint',
      timestamp: new Date().toISOString(),
      status: 'success',
    };
  }

  @Get('protected')
  @UseGuards(AuthGuard)
  getProtectedData(@Request() req) {
    return {
      message: 'This is a protected endpoint',
      user: req.user,
      timestamp: new Date().toISOString(),
      status: 'success',
    };
  }

  @Get('auth-test')
  @UseGuards(AuthGuard)
  testAuth(@Request() req) {
    return {
      message: 'Authentication successful!',
      user: req.user,
      userId: req.user?.sub,
      email: req.user?.Email,
      userType: req.user?.User_Type,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('token-debug')
  @Public()
  debugToken(@Request() req) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    return {
      message: 'Token debug information',
      hasAuthHeader: !!authHeader,
      authHeader: authHeader,
      tokenLength: token?.length || 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'No token',
      headerType: authHeader?.split(' ')[0],
      timestamp: new Date().toISOString(),
    };
  }
}
