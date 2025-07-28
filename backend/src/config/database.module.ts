import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('DatabaseModule');
        
        // Check if we're in production environment
        const isProduction = configService.get<string>('NODE_ENV') === 'production';
        
        const config: TypeOrmModuleOptions = {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', isProduction? 5432: 5433),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>('DB_PASSWORD', 'aquinattaayo'),
          database: configService.get<string>('DB_DATABASE', 'healthcare'),
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: true, // Re-enabled after fixing entity structure
          logging: configService.get<boolean>('DB_LOGGING', false),
          migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
          
          ssl: isProduction ? {
            rejectUnauthorized: false
          } : false,
        };
        
        logger.log('Successfully loaded database config');
        logger.log(`SSL enabled: ${isProduction}`);
        console.log('Database config success.');
        console.log(`Environment: ${configService.get<string>('NODE_ENV', 'development')}`);
        
        return config;
      },
    }),
  ],
})
export class DatabaseModule {}